-- ==============================================================================
-- MIGRATION: 202610250001_game_leaderboards_and_answer_snapshots.sql
-- Description:
-- 1. Mengubah kekangan markah quiz_attempts (score check) supaya menyokong markah 
--    melebihi 100 mata (contoh: Maze 2D & Misi Makmal 1000 mata) tanpa had 100.
-- 2. Menambah lajur correct_answers dan duration_seconds jika belum wujud.
-- 3. Memastikan indeks prestasi untuk carian pantas leaderboard.
-- 4. Menyediakan fungsi pangkalan data get_game_leaderboard() (SECURITY DEFINER)
--    yang serasi dengan skema profil sebenar (p.avatar) dan menyokong pemetaan alias
--    permainan dua hala.
-- ==============================================================================

-- 1. Tanggalkan kekangan lama 0..100 secara selamat dan gantikan dengan score >= 0
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.quiz_attempts'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) LIKE '%score%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.quiz_attempts ADD CONSTRAINT quiz_attempts_score_check CHECK (score >= 0);

-- 2. Tambah lajur correct_answers jika belum wujud
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'quiz_attempts' 
      AND column_name = 'correct_answers'
  ) THEN
    ALTER TABLE public.quiz_attempts ADD COLUMN correct_answers INTEGER DEFAULT 0;
  END IF;
END $$;

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

-- 4. Pastikan indeks wujud untuk carian pantas leaderboard mengikut quiz_id
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_leaderboard 
ON public.quiz_attempts (quiz_id, score DESC, submitted_at ASC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz 
ON public.quiz_attempts (user_id, quiz_id, submitted_at DESC);

-- 5. Fungsi Leaderboard Berasingan Mengikut Permainan (Security Definer)
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
  WITH filtered_attempts AS (
    SELECT 
      qa.user_id,
      qa.score::INTEGER AS score,
      COALESCE(
        qa.correct_answers,
        (qa.result_data->>'correct')::INTEGER,
        (qa.result_data->>'correct_answers')::INTEGER,
        0
      ) AS correct_answers,
      COALESCE(
        qa.total_questions,
        (qa.result_data->>'total')::INTEGER,
        (qa.result_data->>'total_questions')::INTEGER,
        10
      ) AS total_questions,
      COALESCE(
        qa.duration_seconds,
        (qa.result_data->>'durationSeconds')::INTEGER,
        (qa.result_data->>'duration_seconds')::INTEGER,
        (qa.result_data->>'completion_time_seconds')::INTEGER
      ) AS duration_seconds,
      qa.submitted_at
    FROM public.quiz_attempts qa
    WHERE qa.quiz_id = p_game_id 
       OR (p_game_id = 'maze_2d' AND qa.quiz_id IN ('maze_2d', 'klasifikasi-sel', 'maze-chase-sel', 'maze_chase'))
       OR (p_game_id = 'misi_makmal' AND qa.quiz_id IN ('misi_makmal', 'misi-makmal-sains', 'lab_adventure', 'lab-adventure'))
       OR (p_game_id = 'labelkan_organel' AND qa.quiz_id IN ('labelkan_organel', 'labelkan-organel', 'label_organelles'))
       OR (p_game_id = 'organisasi_sel' AND qa.quiz_id IN ('organisasi_sel', 'organisasi-kehidupan', 'susun_organisasi'))
       OR (p_game_id = 'kuiz_saintis_muda' AND qa.quiz_id IN ('kuiz_saintis_muda', 'kuiz-saintis-muda', 'struktur-fungsi-organisasi-sel', 'kuiz_interaktif', 'pengembaraan-sains-2d-sel'))
  ),
  ranked_attempts AS (
    SELECT 
      fa.user_id,
      fa.score,
      fa.correct_answers,
      fa.total_questions,
      fa.duration_seconds,
      fa.submitted_at,
      COUNT(*) OVER (PARTITION BY fa.user_id) AS user_attempt_count,
      ROW_NUMBER() OVER (
        PARTITION BY fa.user_id 
        ORDER BY 
          fa.score DESC, 
          fa.correct_answers DESC, 
          COALESCE(fa.duration_seconds, 999999) ASC, 
          fa.submitted_at ASC
      ) AS rank_in_user
    FROM filtered_attempts fa
  ),
  aggregated_ranks AS (
    SELECT
      ra.user_id,
      COALESCE(NULLIF(p.full_name, ''), NULLIF(p.nickname, ''), 'Murid ARSelNel') AS player_name,
      COALESCE(p.avatar, '../assets/home/avatar.svg') AS avatar_url,
      COALESCE(p.class_name, 'Tingkatan 1 Al-Farabi') AS class_name,
      ra.score AS best_score,
      ra.correct_answers,
      ra.total_questions,
      ra.duration_seconds,
      ra.submitted_at AS achieved_at,
      ra.user_attempt_count AS total_attempts,
      DENSE_RANK() OVER (
        ORDER BY 
          ra.score DESC, 
          ra.correct_answers DESC, 
          COALESCE(ra.duration_seconds, 999999) ASC, 
          ra.submitted_at ASC
      ) AS calc_rank
    FROM ranked_attempts ra
    LEFT JOIN public.profiles p ON p.id = ra.user_id
    WHERE ra.rank_in_user = 1
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
