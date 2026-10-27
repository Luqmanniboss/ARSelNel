-- ==============================================================================
-- MIGRATION: 202610270001_cellquest_ar_adventure.sql
-- Description:
-- 1. Menyediakan jadual konfigurasi stesen dan soalan kuiz bagi modul baharu
--    "CellQuest AR Adventure — Misi Jelajah Dunia Sel"
-- 2. Memastikan RLS diaktifkan: awam boleh membaca (published), pentadbir boleh mengurus.
-- 3. Menyediakan rekod benih awal (seed data) bagi 8 stesen pembelajaran KSSM.
-- 4. Serasi sepenuhnya dengan pangkalan data quiz_attempts sedia ada.
-- ==============================================================================

-- 1. Jadual konfigurasi stesen dan soalan CellQuest AR Adventure
CREATE TABLE IF NOT EXISTS public.cellquest_adventure_config (
  id TEXT PRIMARY KEY,
  station_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  organelle TEXT NOT NULL,
  color TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT 'military_tech',
  description TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indeks untuk susunan paparan stesen
CREATE INDEX IF NOT EXISTS idx_cq_adventure_station ON public.cellquest_adventure_config(station_number ASC);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.cellquest_adventure_config ENABLE ROW LEVEL SECURITY;

-- Polisi bacaan: Semua pengguna (termasuk tetamu & murid) boleh membaca konfigurasi stesen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cellquest_adventure_config' 
      AND policyname = 'Anyone can read adventure config'
  ) THEN
    CREATE POLICY "Anyone can read adventure config"
      ON public.cellquest_adventure_config
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Polisi tulis: Hanya guru dan pentadbir boleh memasukkan atau mengemas kini
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cellquest_adventure_config' 
      AND policyname = 'Admins can manage adventure config'
  ) THEN
    CREATE POLICY "Admins can manage adventure config"
      ON public.cellquest_adventure_config
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = (SELECT auth.uid()) 
            AND role IN ('admin', 'teacher', 'guru', 'pentadbir')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = (SELECT auth.uid()) 
            AND role IN ('admin', 'teacher', 'guru', 'pentadbir')
        )
      );
  END IF;
END $$;

-- Berikan kebenaran SELECT kepada anon dan authenticated
GRANT SELECT ON public.cellquest_adventure_config TO anon, authenticated;
GRANT ALL ON public.cellquest_adventure_config TO service_role;

-- 3. Masukkan 8 Stesen Permulaan (Seed Data)
INSERT INTO public.cellquest_adventure_config (
  id, station_number, title, organelle, color, badge_icon, description,
  question_text, option_a, option_b, option_c, option_d, correct_option, explanation, is_active, sort_order
) VALUES
(
  'stn-1-nucleus', 1, 'Nukleus', 'Nukleus', '#8b5cf6', 'biotech',
  'Nukleus ialah pusat kawalan sel yang mengandungi bahan genetik (DNA). Ia mengawal semua aktiviti sel seperti sintesis protein dan pembahagian sel.',
  'Apakah fungsi utama nukleus?',
  'Menghasilkan tenaga',
  'Mengawal aktiviti sel',
  'Menghasilkan makanan',
  'Melindungi dinding sel',
  'B',
  'Jawapan Tepat: B. Nukleus mengandungi DNA dan mengawal seluruh aktiviti biokimia serta tumbesaran sel. Tenaga dihasilkan oleh mitokondrion manakala makanan dihasilkan melalui fotosintesis dalam kloroplas.',
  true, 1
),
(
  'stn-2-membrane', 2, 'Membran Sel', 'Membran Sel', '#3b82f6', 'shield',
  'Lapisan nipis separuh telap yang menyelaputi sel. Ia mengawal pergerakan bahan masuk dan keluar sel serta melindungi struktur dalaman sel.',
  'Apakah fungsi membran sel?',
  'Mengawal pergerakan bahan masuk dan keluar dari sel',
  'Menghasilkan cahaya',
  'Menyimpan klorofil',
  'Membina dinding sel',
  'A',
  'Jawapan Tepat: A. Membran sel bersifat telap memilih dan mengawal pertukaran gas, nutrien dan sisa antara sel dengan persekitaran luarnya.',
  true, 2
),
(
  'stn-3-cytoplasm', 3, 'Sitoplasma', 'Sitoplasma', '#eab308', 'water_drop',
  'Bahan seperti jeli yang mengisi ruang antara nukleus dan membran sel. Sitoplasma bertindak sebagai medium di mana pelbagai tindak balas kimia berlaku.',
  'Apakah sitoplasma?',
  'Lapisan luar dinding sel',
  'Struktur yang mengandungi klorofil',
  'Bahan seperti jeli tempat banyak tindak balas kimia berlaku',
  'Bahagian yang menghasilkan cahaya',
  'C',
  'Jawapan Tepat: C. Sitoplasma mengandungi air, garam mineral dan enzim di mana proses metabolisme selular berlaku secara aktif.',
  true, 3
),
(
  'stn-4-mitochondria', 4, 'Mitokondrion', 'Mitokondrion', '#f97316', 'bolt',
  'Organel penjana tenaga sel ("powerhouse of the cell"). Di sinilah proses respirasi sel berlaku untuk menguraikan glukosa dan membebaskan tenaga kimia (ATP).',
  'Apakah fungsi mitokondrion?',
  'Mengawal pembahagian cahaya',
  'Menyimpan pigmen hijau',
  'Membentuk dinding sel',
  'Menjalankan respirasi sel untuk membebaskan tenaga',
  'D',
  'Jawapan Tepat: D. Mitokondrion menukarkan glukosa dan oksigen kepada tenaga yang diperlukan oleh sel untuk menjalankan pelbagai fungsi hidup.',
  true, 4
),
(
  'stn-5-chloroplast', 5, 'Kloroplas', 'Kloroplas', '#22c55e', 'eco',
  'Organel hijau yang hanya dijumpai dalam sel tumbuhan dan alga. Mengandungi pigmen klorofil yang menyerap cahaya matahari bagi menjalankan fotosintesis.',
  'Mengapakah kloroplas penting kepada sel tumbuhan?',
  'Mengawal semua aktiviti sel',
  'Menjalankan fotosintesis',
  'Menghasilkan protein sahaja',
  'Mengawal pergerakan bahan',
  'B',
  'Jawapan Tepat: B. Kloroplas membolehkan tumbuhan menghasilkan makanannya sendiri (glukosa) melalui fotosintesis dengan bantuan cahaya matahari.',
  true, 5
),
(
  'stn-6-cellwall', 6, 'Dinding Sel', 'Dinding Sel', '#92400e', 'domain',
  'Lapisan luar yang tegar terdiri daripada gentian selulosa. Hanya hadir pada sel tumbuhan untuk memberi sokongan mekanikal, kekuatan dan mengekalkan bentuk tetap.',
  'Apakah fungsi dinding sel tumbuhan?',
  'Memberikan sokongan dan mengekalkan bentuk sel',
  'Menghasilkan tenaga',
  'Mengawal aktiviti sel',
  'Menjalankan respirasi',
  'A',
  'Jawapan Tepat: A. Dinding selulosa yang kuat dan tegar menyokong sel tumbuhan daripada pecah akibat tekanan osmosis dan mengekalkan bentuk tetapnya.',
  true, 6
),
(
  'stn-7-vacuole', 7, 'Vakuol', 'Vakuol', '#06b6d4', 'opacity',
  'Kantung cecair besar berisi sap sel (air, gula dan garam terlarut) pada sel tumbuhan matang. Berfungsi mengekalkan kesegahan sel serta menyimpan bahan simpanan.',
  'Apakah fungsi utama vakuol besar dalam sel tumbuhan?',
  'Menghasilkan cahaya',
  'Mengawal aktiviti sel',
  'Menyimpan sap sel dan membantu mengekalkan kesegahan sel',
  'Menghasilkan klorofil',
  'C',
  'Jawapan Tepat: C. Vakuol pusat yang besar dan penuh dengan cecair sap sel mengenakan tekanan turgor ke atas dinding sel untuk memastikan kesegahan tumbuhan.',
  true, 7
),
(
  'stn-8-comparison', 8, 'Sel Haiwan vs Sel Tumbuhan', 'Perbandingan Sel', '#ec4899', 'compare_arrows',
  'Sel tumbuhan mempunyai bentuk tetap, dinding sel, kloroplas dan vakuol besar. Sebaliknya, sel haiwan tidak mempunyai dinding sel mahupun kloroplas, dan bentuknya tidak tetap.',
  'Antara berikut, struktur manakah terdapat pada sel tumbuhan biasa tetapi tiada pada sel haiwan?',
  'Membran sel',
  'Sitoplasma',
  'Nukleus',
  'Dinding sel',
  'D',
  'Jawapan Tepat: D. Dinding sel dan kloroplas hanya terdapat pada sel tumbuhan, manakala nukleus, sitoplasma dan membran sel dimiliki oleh kedua-dua jenis sel.',
  true, 8
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  organelle = EXCLUDED.organelle,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  question_text = EXCLUDED.question_text,
  option_a = EXCLUDED.option_a,
  option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c,
  option_d = EXCLUDED.option_d,
  correct_option = EXCLUDED.correct_option,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();
