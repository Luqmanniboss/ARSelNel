-- ============================================================================
-- ARSelNel Hardened Safe Production Migration
-- Migration ID: 202610230003_safe_production_migration.sql
--
-- AUDIT & COMPLIANCE SUMMARY:
-- 1. 100% Additive & Idempotent: No destructive DROP TABLE, TRUNCATE, or CASCADE on existing data.
-- 2. Closes Critical Issue A: Strips out insecure permissive policies (with check (true))
--    on public.learning_notes. Enforces verified public.is_admin() for write/publish/delete.
-- 3. Closes Critical Issue B: Strips out permissive upload/update/delete policies on storage.objects.
--    Enforces Admin-only writes to storage.objects in bucket 'educational_media'.
-- 4. Closes Critical Issue C: Replaces 'ON CONFLICT (id) DO UPDATE' with 'DO NOTHING'
--    on storage.buckets to guarantee existing bucket configurations are never overwritten.
-- 5. Closes Critical Issue D: Hardens public.is_admin() against client metadata tampering.
--    Replaces vulnerable 'user_metadata' checks with public.admin_users and service-role app_metadata.
-- 6. Closes Issue E: Adds missing columns (views, display_order) with safe defaults and
--    updates check constraint for ('draft', 'published', 'archived') to prevent schema drift.
-- 7. Conflict-Safe Seeding: Inserts default learning notes with 'ON CONFLICT (id) DO NOTHING'
--    preserving existing notes, IDs, and admin edits.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Hardened Admin Authorization Function
-- Replaces vulnerable user_metadata check with strictly trusted admin_users & app_metadata
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Unauthenticated sessions cannot be admins
  if auth.uid() is null then
    return false;
  end if;

  -- Primary: Verified database admin_users table (Service-role or DB-managed only)
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return true;
  end if;

  -- Secondary: Supabase app_metadata (Protected: cannot be edited by clients/students)
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'guru', 'teacher') then
    return true;
  end if;

  -- SECURITY FIX: Do NOT trust auth.jwt() -> 'user_metadata' (Students can update via client SDK)
  return false;
end;
$$;

-- ----------------------------------------------------------------------------
-- STEP 2: Schema Compatibility for learning_notes
-- Handles both fresh setups and upgrades from legacy 202610200002 migration
-- ----------------------------------------------------------------------------
create table if not exists public.learning_notes (
  id text primary key,
  title text not null,
  chapter text not null default 'Bab 2: Sel Sebagai Unit Asas Hidupan',
  description text default '',
  content_type text not null default 'interactive' check (content_type in ('pdf', 'pptx', 'google_slides', 'embed', 'interactive')),
  source_url text default '',
  storage_path text default '',
  slide_count integer not null default 1,
  slide_data jsonb not null default '[]'::jsonb,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  views integer not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure additive columns exist in case table was created by legacy migration
alter table public.learning_notes add column if not exists views integer not null default 0;
alter table public.learning_notes add column if not exists display_order integer not null default 0;

-- Safely expand publication_status check constraint to include 'archived'
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'learning_notes_publication_status_check'
      and conrelid = 'public.learning_notes'::regclass
  ) then
    alter table public.learning_notes drop constraint learning_notes_publication_status_check;
    alter table public.learning_notes add constraint learning_notes_publication_status_check
      check (publication_status in ('draft', 'published', 'archived'));
  end if;
exception
  when others then null; -- Preserve schema if constraint name differs or already compatible
end $$;

-- Indexes for optimal student query performance
create index if not exists learning_notes_status_idx on public.learning_notes (publication_status, display_order);
create index if not exists learning_notes_chapter_idx on public.learning_notes (chapter, publication_status);

-- ----------------------------------------------------------------------------
-- STEP 3: Student Annotation & Progress Tables
-- ----------------------------------------------------------------------------
create table if not exists public.student_annotations (
  id uuid primary key default gen_random_uuid(),
  note_id text not null,
  student_id uuid not null references auth.users(id) on delete cascade,
  page_number integer not null check (page_number >= 1),
  annotation_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (note_id, student_id, page_number)
);

create table if not exists public.student_note_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  note_id text not null,
  last_viewed_page integer not null default 1,
  last_opened_at timestamptz not null default now(),
  unique (student_id, note_id)
);

create index if not exists student_annotations_lookup_idx on public.student_annotations (note_id, student_id, page_number);
create index if not exists student_note_progress_lookup_idx on public.student_note_progress (student_id, note_id);

-- ----------------------------------------------------------------------------
-- STEP 4: Enable Row Level Security
-- ----------------------------------------------------------------------------
alter table public.learning_notes enable row level security;
alter table public.student_annotations enable row level security;
alter table public.student_note_progress enable row level security;

-- ----------------------------------------------------------------------------
-- STEP 5: Strip Insecure Permissive Policies & Apply Strict Admin-Only Policies
-- ----------------------------------------------------------------------------
-- Remove legacy insecure policies if they exist
drop policy if exists "teachers insert learning notes" on public.learning_notes;
drop policy if exists "teachers update learning notes" on public.learning_notes;
drop policy if exists "teachers delete learning notes" on public.learning_notes;
drop policy if exists "all users read published notes" on public.learning_notes;
drop policy if exists "public read published learning notes" on public.learning_notes;
drop policy if exists "admins manage learning notes" on public.learning_notes;

-- Create hardened learning_notes policies:
-- 1. Read: Public & Students can read published notes; Admins can read all (including drafts)
create policy "public read published learning notes" on public.learning_notes
  for select using (publication_status = 'published' or public.is_admin());

-- 2. Insert: Only verified Admins can insert notes
create policy "admin insert learning notes" on public.learning_notes
  for insert to authenticated with check (public.is_admin());

-- 3. Update: Only verified Admins can update notes
create policy "admin update learning notes" on public.learning_notes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4. Delete: Only verified Admins can delete notes
create policy "admin delete learning notes" on public.learning_notes
  for delete to authenticated using (public.is_admin());

-- Student Annotation Policies (Strictly isolated to authenticated student owner)
drop policy if exists "students read own annotations" on public.student_annotations;
drop policy if exists "students write own annotations" on public.student_annotations;
drop policy if exists "students insert own annotations" on public.student_annotations;
drop policy if exists "students update own annotations" on public.student_annotations;
drop policy if exists "students delete own annotations" on public.student_annotations;

create policy "students read own annotations" on public.student_annotations
  for select to authenticated using ((select auth.uid()) = student_id);

create policy "students write own annotations" on public.student_annotations
  for insert to authenticated with check ((select auth.uid()) = student_id);

create policy "students update own annotations" on public.student_annotations
  for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);

create policy "students delete own annotations" on public.student_annotations
  for delete to authenticated using ((select auth.uid()) = student_id);

-- Student Progress Policies (Strictly isolated to authenticated student owner)
drop policy if exists "students read own progress" on public.student_note_progress;
drop policy if exists "students write own progress" on public.student_note_progress;
drop policy if exists "students update own progress" on public.student_note_progress;

create policy "students read own progress" on public.student_note_progress
  for select to authenticated using ((select auth.uid()) = student_id);

create policy "students write own progress" on public.student_note_progress
  for insert to authenticated with check ((select auth.uid()) = student_id);

create policy "students update own progress" on public.student_note_progress
  for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);

-- Grants
grant select on public.learning_notes to anon, authenticated;
grant insert, update, delete on public.learning_notes to authenticated;
grant select, insert, update, delete on public.student_annotations to authenticated;
grant select, insert, update on public.student_note_progress to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 6: Storage Bucket Configuration
-- Preserves existing configuration if bucket already exists (DO NOTHING)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'educational_media',
  'educational_media',
  true,
  104857600, -- 100MB limit
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'model/gltf-binary',
    'model/gltf+json'
  ]
)
on conflict (id) do nothing; -- SAFE: Never overwrites existing bucket config

-- ----------------------------------------------------------------------------
-- STEP 7: Storage RLS Policies
-- Strip permissive authenticated policies; Enforce Admin-only writes
-- ----------------------------------------------------------------------------
drop policy if exists "authenticated insert educational_media" on storage.objects;
drop policy if exists "authenticated update educational_media" on storage.objects;
drop policy if exists "authenticated delete educational_media" on storage.objects;
drop policy if exists "public read educational_media" on storage.objects;
drop policy if exists "admin insert educational_media" on storage.objects;
drop policy if exists "admin update educational_media" on storage.objects;
drop policy if exists "admin delete educational_media" on storage.objects;

-- 1. Read: Public read-only for educational media
create policy "public read educational_media" on storage.objects
  for select using (bucket_id = 'educational_media');

-- 2. Insert: Verified Admin only
create policy "admin insert educational_media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'educational_media' and public.is_admin());

-- 3. Update: Verified Admin only
create policy "admin update educational_media" on storage.objects
  for update to authenticated
  using (bucket_id = 'educational_media' and public.is_admin())
  with check (bucket_id = 'educational_media' and public.is_admin());

-- 4. Delete: Verified Admin only
create policy "admin delete educational_media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'educational_media' and public.is_admin());

-- ----------------------------------------------------------------------------
-- STEP 8: Seed Default Learning Notes (Conflict-safe, Insert-Only)
-- Preserves existing admin-created notes and ensures re-running never duplicates or overwrites
-- ----------------------------------------------------------------------------
insert into public.learning_notes (id, title, chapter, description, content_type, source_url, slide_count, publication_status, slide_data, created_at)
values
  (
    'slide_topic1',
    '1. Sel Sebagai Unit Asas Kehidupan',
    'Bab 2: Sel Sebagai Unit Asas Hidupan',
    'Asal-usul penemuan Robert Hooke (1665), teras teori sel moden, dan perbezaan unisel serta multisel.',
    'interactive',
    '',
    6,
    'published',
    '[
      {"page": 1, "title": "Robert Hooke & Penemuan Sel (1665)", "content": "Pada tahun 1665, Robert Hooke menggunakan mikroskop ringkas untuk memerhatikan hirisan nipis gabus pokok oak. Beliau melihat rongga bersekat kecil menyerupai bilik rahib yang dinamakan selula (sel)."},
      {"page": 2, "title": "Teras Teori Sel Moden", "content": "1. Semua hidupan terdiri daripada sel.\n2. Sel ialah unit asas struktur dan fungsi hidupan.\n3. Semua sel baru terhasil daripada pembahagian sel yang telah wujud sebelumnya."},
      {"page": 3, "title": "Organisma Unisel vs Multisel", "content": "Organisma unisel (Amoeba, Paramecium, Euglena, Yis) menjalankan semua fungsi hidup dalam satu sel tunggal. Organisma multisel (manusia, haiwan, tumbuhan) mempunyai berjuta-juta sel yang mengalami pengkhususan."},
      {"page": 4, "title": "Mikroskop Cahaya Makmal Sekolah", "content": "Komponen utama mikroskop makmal merangkumi kanta mata, kanta objek, pentas mekanikal, kondenser, dan pelaras fokus kasar serta halus untuk pembesaran spesimen sehingga 400x."},
      {"page": 5, "title": "Langkah Penyediaan Slaid Basah", "content": "Letakkan spesimen di tengah slaid kaca, titiskan setitis air atau pewarna metilena biru/iodin, kemudian turunkan kaca penutup secara condong 45 darjah untuk mengelakkan gelembung udara terperangkap."},
      {"page": 6, "title": "Rumusan & Latihan Kendiri Bab 2", "content": "Uji ingatan anda: Mengapakah sel gabus Robert Hooke kelihatan kosong? (Kerana sel gabus ialah sel tumbuhan mati yang hanya meninggalkan dinding sel tegar!)."}
    ]'::jsonb,
    '2026-02-18T08:00:00Z'
  ),
  (
    'slide_topic2',
    '2. Struktur & Organel Sel Haiwan',
    'Bab 2: Sel Sebagai Unit Asas Hidupan',
    'Anatomi sitoplasma, membran plasma, nukleus, serta stesen janakuasa mitokondria.',
    'interactive',
    '',
    6,
    'published',
    '[
      {"page": 1, "title": "Ciri-Ciri Utama Sel Haiwan", "content": "Sel haiwan tidak mempunyai dinding sel yang tegar, menyebabkan bentuknya fleksibel dan tidak tetap. Membran sel yang anjal mengawal keluar masuk molekul terlarut."},
      {"page": 2, "title": "Nukleus: Pusat Kawalan Genetik", "content": "Nukleus diselubungi membran dwilapisan dengan liang nukleus. Di dalamnya terdapat nukleolus dan kromatin yang membawa asid deoksiribonukleik (DNA) untuk mengawal metabolisme sel."},
      {"page": 3, "title": "Mitokondria: Stesen Janakuasa Sel (ATP)", "content": "Organel berbentuk rod dengan membran luar licin dan membran dalam berlipat-lipat (krista). Merupakan tapak respirasi sel aerobik di mana glukosa dioksidakan bagi menghasilkan tenaga ATP."},
      {"page": 4, "title": "Sitoplasma & Jasad Golgi", "content": "Sitoplasma ialah medium cecair jeli tempat organel terapung dan tindak balas biokimia berlangsung. Jasad Golgi memproses, mengubah suai dan membungkus protein ke dalam vesikel rembesan."},
      {"page": 5, "title": "Vakuol Kecil & Lisosom", "content": "Sel haiwan mempunyai vakuol kecil bersifat sementara. Lisosom mengandungi enzim hidrolitik untuk mencerna nutrien atau menguraikan komponen sel usang."},
      {"page": 6, "title": "Rumusan Amali Sel Pipi Manusia", "content": "Pemerhatian di bawah mikroskop menunjukkan sel pipi berwarna biru akibat pewarnaan metilena biru dengan nukleus jelas kelihatan di bahagian tengah sitoplasma."}
    ]'::jsonb,
    '2026-02-20T08:00:00Z'
  ),
  (
    'slide_topic3',
    '3. Struktur Sel Tumbuhan & Keunikannya',
    'Bab 2: Sel Sebagai Unit Asas Hidupan',
    'Perbandingan dinding sel selulosa, kloroplas fotosintesis, dan vakuol pusat besar.',
    'interactive',
    '',
    6,
    'published',
    '[
      {"page": 1, "title": "Keistimewaan Morfologi Sel Tumbuhan", "content": "Sel tumbuhan mengekalkan bentuk tetap kerana dilindungi dinding sel tegar. Tumbuhan berupaya menghasilkan glukosa sendiri melalui proses fotosintesis."},
      {"page": 2, "title": "Dinding Selulosa Tegar", "content": "Terbina daripada serat selulosa mikroskopik yang kuat dan telap sepenuhnya. Menghalang sel daripada pecah (lisis) apabila menyerap air melalui proses osmosis."},
      {"page": 3, "title": "Kloroplas & Pigmen Klorofil", "content": "Organel bermembran dua yang mengandungi tilakoid dan stroma. Klorofil menyerap cahaya matahari bagi menukarkan air dan karbon dioksida kepada glukosa dan oksigen."},
      {"page": 4, "title": "Vakuol Sentral Besar & Tekanan Kesegahan", "content": "Dipenuhi sap sel (air, garam mineral, gula terlarut). Membran tonoplas mengawal tekanan turgor yang memberikan sokongan mekanikal kepada tisu tumbuhan herba."},
      {"page": 5, "title": "Jadual Perbandingan Sel Haiwan vs Tumbuhan", "content": "Dinding sel: Tiada (Haiwan) vs Ada (Tumbuhan)\nKloroplas: Tiada (Haiwan) vs Ada (Tumbuhan)\nBentuk: Tidak tetap vs Tetap\nVakuol: Kecil/tiada vs Besar/kekal\nSimpanan karbohidrat: Glikogen vs Kanji."},
      {"page": 6, "title": "Amali Sel Daun Hydrilla & Bawang Merah", "content": "Di bawah mikroskop cahaya, sel epidermis bawang tidak mengandungi kloroplas (bawah tanah), manakala daun Hydrilla sp. mempamerkan kloroplas hijau bergerak secara siklosis."}
    ]'::jsonb,
    '2026-02-22T08:00:00Z'
  )
on conflict (id) do nothing;
