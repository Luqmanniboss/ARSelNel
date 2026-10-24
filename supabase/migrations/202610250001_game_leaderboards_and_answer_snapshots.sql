-- ==============================================================================
-- MIGRATION: 202610250001_game_leaderboards_and_answer_snapshots.sql
-- Description:
-- 1. Mengubah kekangan markah quiz_attempts (score check) supaya menyokong markah melebihi 100 mata (contoh: Maze 2D 1000 mata) tanpa had 100.
-- 2. Memastikan indeks prestasi untuk leaderboard berasaskan (quiz_id, score DESC, submitted_at ASC).
-- 3. Menyediakan fungsi pangkalan data get_game_leaderboard() untuk agregasi markah terbaik setiap murid mengikut permainan secara adil dan selamat tanpa mendedahkan data peribadi/jawapan murid lain.
-- ==============================================================================

-- 1. Tanggalkan kekangan lama 0..100 jika wujud dan gantikan dengan score >= 0
ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_score_check;
ALTER TABLE public.quiz_attempts ADD CONSTRAINT quiz_attempts_score_check CHECK (score >= 0);

-- 2. Pastikan indeks wujud untuk carian pantas leaderboard mengikut quiz_id
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_leaderboard 
ON public.quiz_attempts (quiz_id, score DESC, submitted_at ASC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz 
ON public.quiz_attempts (user_id, quiz_id, submitted_at DESC);

-- 3. Tambah lajur tempoh (duration_seconds) jika belum wujud untuk metrik masa yang adil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE public.quiz_attempts ADD COLUMN duration_seconds INTEGER DEFAULT NULL;
  END IF;
END $$;

-- 4. Fungsi Leaderboard Berasingan Mengikut Permainan (Security Definer)
-- Mengembalikan markah terbaik (MAX) setiap murid berserta susunan tie-breaker yang sah:
-- 1. Markah tertinggi
-- 2. Jawapan betul terbanyak
-- 3. Tempoh masa tersingkat
-- 4. Tarikh capai terawal
CREATE OR REPLACE FUNCTION public.get_game_leaderboard(
  p_game_id TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  player_name TEXT,
  avatar_url TEXT,
  class_name TEXT,
  best_score INTEGER,
  correct_answers INTEGER,
  total_questions INTEGER,
  duration_seconds INTEGER,
  achieved_at TIMESTAMPTZ,
  total_attempts BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH best_attempts AS (
    SELECT 
      qa.user_id,
      qa.score,
      qa.correct_answers,
      qa.total_questions,
      qa.duration_seconds,
      qa.submitted_at,
      COUNT(*) OVER (PARTITION BY qa.user_id) AS user_attempt_count,
      ROW_NUMBER() OVER (
        PARTITION BY qa.user_id 
        ORDER BY 
          qa.score DESC, 
          COALESCE(qa.correct_answers, 0) DESC, 
          COALESCE(qa.duration_seconds, 999999) ASC, 
          qa.submitted_at ASC
      ) AS rank_in_user
    FROM public.quiz_attempts qa
    WHERE qa.quiz_id = p_game_id 
       OR qa.quiz_id = CASE 
            WHEN p_game_id = 'maze_2d' THEN 'klasifikasi-sel'
            WHEN p_game_id = 'misi_makmal' THEN 'misi-makmal-sains'
            WHEN p_game_id = 'labelkan_organel' THEN 'labelkan-organel'
            WHEN p_game_id = 'organisasi_sel' THEN 'organisasi-kehidupan'
            WHEN p_game_id = 'kuiz_saintis_muda' THEN 'struktur-fungsi-organisasi-sel'
            ELSE p_game_id
          END
  ),
  aggregated_ranks AS (
    SELECT
      ba.user_id,
      COALESCE(p.full_name, 'Murid ARSelNel') AS player_name,
      p.avatar_url,
      p.class_name,
      ba.score::INTEGER AS best_score,
      ba.correct_answers::INTEGER,
      ba.total_questions::INTEGER,
      ba.duration_seconds::INTEGER,
      ba.submitted_at AS achieved_at,
      ba.user_attempt_count AS total_attempts,
      DENSE_RANK() OVER (
        ORDER BY 
          ba.score DESC, 
          COALESCE(ba.correct_answers, 0) DESC, 
          COALESCE(ba.duration_seconds, 999999) ASC, 
          ba.submitted_at ASC
      ) AS calc_rank
    FROM best_attempts ba
    LEFT JOIN public.profiles p ON p.id = ba.user_id
    WHERE ba.rank_in_user = 1
  )
  SELECT 
    ar.calc_rank AS rank,
    ar.user_id,
    ar.player_name,
    ar.avatar_url,
    ar.class_name,
    ar.best_score,
    ar.correct_answers,
    ar.total_questions,
    ar.duration_seconds,
    ar.achieved_at,
    ar.total_attempts
  FROM aggregated_ranks ar
  ORDER BY ar.calc_rank ASC
  LIMIT p_limit;
END;
$$;

-- Berikan kebenaran execute kepada semua pengguna yang disahkan mahupun anon (hanya paparkan maklumat agregat ranking)
GRANT EXECUTE ON FUNCTION public.get_game_leaderboard(TEXT, INT) TO anon, authenticated, service_role;
