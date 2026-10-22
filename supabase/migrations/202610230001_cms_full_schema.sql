-- ============================================================================
-- ARSelNel Full Supabase Integration & Centralized CMS Schema Migration
-- Migration ID: 202610230001_cms_full_schema.sql
-- 
-- CRITICAL DATA PRESERVATION POLICY:
-- Safe additive migration. Does not drop, truncate or reset any existing tables.
-- Preserves student profiles, learning_progress, quiz_attempts and smart_notes.
-- ============================================================================

-- 1. Dedicated Admin Role Table (Additive to preserve profiles role='student' constraint)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'superadmin', 'teacher')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Security definer role check function
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  -- 1. Check dedicated admin_users table
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return true;
  end if;

  -- 2. Check auth.users user_metadata for admin/teacher role
  if coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('admin', 'guru', 'teacher') then
    return true;
  end if;

  return false;
end;
$$;

-- 2. CMS Videos Table
create table if not exists public.cms_videos (
  id text primary key,
  title text not null,
  category text default 'Biologi Sel',
  url text not null,
  thumbnail text default '',
  duration text default '05:00',
  instructor text default 'Cikgu Sains ARSelNel',
  description text default '',
  views integer not null default 0,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CMS Quizzes Table
create table if not exists public.cms_quizzes (
  id text primary key,
  title text not null,
  topic text default 'Biologi Sel',
  type text not null default 'mcq' check (type in ('mcq', 'tf', 'matching')),
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  points integer not null default 10,
  difficulty text not null default 'Sederhana' check (difficulty in ('Mudah', 'Sederhana', 'Sukar')),
  explanation text default '',
  image text default '',
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. CMS Game Question Banks (Maze Chase, 2D Adventure, Makmal Sains, etc.)
create table if not exists public.cms_game_questions (
  id text primary key,
  game_id text not null check (game_id in ('maze_chase', 'adventure_2d', 'lab_adventure', 'label_organel', 'life_hierarchy')),
  maze_title text default '',
  landmark text default '',
  difficulty text not null default 'medium' check (difficulty in ('low', 'medium', 'high')),
  difficulty_label text default 'Aras Sederhana',
  points integer not null default 100,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  correct_index integer not null default 0,
  explanation text default '',
  reward text default '',
  display_order integer not null default 0,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. CMS CellQuest Organelles
create table if not exists public.cms_cellquest_organelles (
  id text primary key,
  cell_type text not null default 'both' check (cell_type in ('animal', 'plant', 'both')),
  name text not null,
  icon text default '🧬',
  description text not null,
  fact text default '',
  color text default '#13a99c',
  display_order integer not null default 0,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. CMS CellQuest 3D Models Metadata
create table if not exists public.cms_cellquest_models (
  id text primary key,
  cell_type text not null unique check (cell_type in ('animal', 'plant')),
  name text not null,
  model_url text not null,
  format text not null default 'GLB',
  mesh_mappings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. CMS Student Dashboard Content
create table if not exists public.cms_dashboard_config (
  id text primary key default 'default',
  hero_greeting text not null default 'Hai, Saintis Muda!',
  hero_module_badge text not null default 'Modul 1: Sains Hayat',
  hero_title text not null default 'Struktur, Fungsi dan Organisasi Sel',
  hero_description text not null default 'Jom teroka dunia sains melalui eksperimen, video, AR dan permainan interaktif. Pilih aktiviti yang paling menarik untuk anda hari ini!',
  hero_button_primary_text text not null default '🔬 Mula Teroka Sel',
  hero_button_primary_url text not null default '../cellquest/code.html',
  hero_button_secondary_text text not null default 'Mulakan Cabaran Sains',
  hero_button_secondary_url text not null default '../hab_permainan/code.html',
  featured_recommendation jsonb not null default '{
    "title": "Cadangan Hari Ini: Perbandingan Sel Haiwan & Tumbuhan",
    "description": "Ketahui 3 perbezaan utama antara sel haiwan dan tumbuhan untuk menguasai soalan peperiksaan Sains.",
    "buttonText": "Mula Belajar Sekarang",
    "buttonUrl": "../nota_pembelajaran/code.html",
    "badge": "Disyorkan"
  }'::jsonb,
  module_descriptions jsonb not null default '{
    "cellquest": "Terokai model 3D sel mikroskopik dalam Realiti Terimbuh (AR). Bedah dan lihat organel dari sudut 360 darjah.",
    "notes": "Akses nota ringkas padat berserta infografik visual menarik mengikut silibus Sains Tingkatan 1 KSSM.",
    "videos": "Koleksi video animasi dan demonstrasi amali eksperimen sains untuk pemahaman konsep yang mendalam.",
    "selbot": "Tanya soalan sains kepada tutor pintar berkuasa AI yang sedia membantu 24/7.",
    "games": "Uji pengetahuan anda melalui permainan arked seperti Maze Chase, cabaran susun organel dan misi makmal."
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. CMS Manual Penggunaan Steps
create table if not exists public.cms_manual_steps (
  id text primary key,
  icon text not null default '📖',
  color text not null default 'teal',
  title text not null,
  lead text not null,
  body text not null,
  visual_html text default '',
  display_order integer not null default 0,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists cms_videos_status_idx on public.cms_videos (publication_status, display_order);
create index if not exists cms_quizzes_status_idx on public.cms_quizzes (publication_status, display_order);
create index if not exists cms_game_questions_idx on public.cms_game_questions (game_id, publication_status, display_order);
create index if not exists cms_cellquest_organelles_idx on public.cms_cellquest_organelles (cell_type, publication_status, display_order);
create index if not exists cms_manual_steps_status_idx on public.cms_manual_steps (publication_status, display_order);

-- Enable Row Level Security (RLS) on all CMS tables
alter table public.admin_users enable row level security;
alter table public.cms_videos enable row level security;
alter table public.cms_quizzes enable row level security;
alter table public.cms_game_questions enable row level security;
alter table public.cms_cellquest_organelles enable row level security;
alter table public.cms_cellquest_models enable row level security;
alter table public.cms_dashboard_config enable row level security;
alter table public.cms_manual_steps enable row level security;

-- Policies for admin_users
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='admin_users' and policyname='admins can read admin users') then
    create policy "admins can read admin users" on public.admin_users for select to authenticated using (public.is_admin() or auth.uid() = user_id);
  end if;
end $$;

-- Policies for cms_videos
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_videos' and policyname='public read published videos') then
    create policy "public read published videos" on public.cms_videos for select using (publication_status = 'published' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_videos' and policyname='admin modify videos') then
    create policy "admin modify videos" on public.cms_videos for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_quizzes
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_quizzes' and policyname='public read published quizzes') then
    create policy "public read published quizzes" on public.cms_quizzes for select using (publication_status = 'published' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_quizzes' and policyname='admin modify quizzes') then
    create policy "admin modify quizzes" on public.cms_quizzes for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_game_questions
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_game_questions' and policyname='public read published game questions') then
    create policy "public read published game questions" on public.cms_game_questions for select using (publication_status = 'published' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_game_questions' and policyname='admin modify game questions') then
    create policy "admin modify game questions" on public.cms_game_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_cellquest_organelles
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_cellquest_organelles' and policyname='public read published organelles') then
    create policy "public read published organelles" on public.cms_cellquest_organelles for select using (publication_status = 'published' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_cellquest_organelles' and policyname='admin modify organelles') then
    create policy "admin modify organelles" on public.cms_cellquest_organelles for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_cellquest_models
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_cellquest_models' and policyname='public read active models') then
    create policy "public read active models" on public.cms_cellquest_models for select using (is_active = true or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_cellquest_models' and policyname='admin modify models') then
    create policy "admin modify models" on public.cms_cellquest_models for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_dashboard_config
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_dashboard_config' and policyname='public read dashboard config') then
    create policy "public read dashboard config" on public.cms_dashboard_config for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_dashboard_config' and policyname='admin modify dashboard config') then
    create policy "admin modify dashboard config" on public.cms_dashboard_config for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Policies for cms_manual_steps
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_manual_steps' and policyname='public read published manual steps') then
    create policy "public read published manual steps" on public.cms_manual_steps for select using (publication_status = 'published' or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='cms_manual_steps' and policyname='admin modify manual steps') then
    create policy "admin modify manual steps" on public.cms_manual_steps for all to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
