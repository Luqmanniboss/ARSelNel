-- ============================================================================
-- ARSelNel Admin Analytics, Role-Based Access & Account Settings Migration
-- Migration ID: 202610240001_admin_analytics_and_account_settings.sql
--
-- SAFETY & AUDIT POLICY:
-- 100% Additive and Idempotent.
-- NO DROP TABLE, NO TRUNCATE, NO CASCADE.
-- Preserves all student data, quiz attempts, profiles, and existing CMS records.
-- Enforces public.is_admin() for teacher/admin visibility.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Admin Read Access for Student Records & Learning Analytics
-- ----------------------------------------------------------------------------
-- Allow verified Admins/Teachers to view student profiles for learning analytics
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'admins read all profiles'
  ) then
    create policy "admins read all profiles" on public.profiles
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = id);
  end if;
end $$;

-- Allow verified Admins/Teachers to view student learning progress for analytics
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'learning_progress' and policyname = 'admins read all learning progress'
  ) then
    create policy "admins read all learning progress" on public.learning_progress
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = user_id);
  end if;
end $$;

-- Allow verified Admins/Teachers to view student quiz attempts for analytics
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'admins read all quiz attempts'
  ) then
    create policy "admins read all quiz attempts" on public.quiz_attempts
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = user_id);
  end if;
end $$;

-- Allow verified Admins/Teachers to view activity results for game analytics
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'activity_results' and policyname = 'admins read all activity results'
  ) then
    create policy "admins read all activity results" on public.activity_results
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = user_id);
  end if;
end $$;

-- Allow verified Admins/Teachers to view note reading progress
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'student_note_progress' and policyname = 'admins read all note progress'
  ) then
    create policy "admins read all note progress" on public.student_note_progress
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = student_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 2: Real-Time Student Learning Events Table
-- Tracks student interactions across Notes, Videos, Quizzes, Games, CellQuest & AR
-- ----------------------------------------------------------------------------
create table if not exists public.student_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('quiz_completed', 'note_viewed', 'note_completed', 'video_watched', 'game_completed', 'cellquest_explored', 'ar_scanned')),
  activity_id text not null,
  title text not null,
  score integer,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now()
);

-- Unique index for idempotency prevention
create unique index if not exists student_learning_events_idempotency_idx 
  on public.student_learning_events (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists student_learning_events_user_idx 
  on public.student_learning_events (user_id, created_at desc);

create index if not exists student_learning_events_type_idx 
  on public.student_learning_events (event_type, created_at desc);

-- Enable RLS
alter table public.student_learning_events enable row level security;

-- Policies for student_learning_events
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_learning_events' and policyname='students insert own events') then
    create policy "students insert own events" on public.student_learning_events
      for insert to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_learning_events' and policyname='students read own events') then
    create policy "students read own events" on public.student_learning_events
      for select to authenticated
      using ((select auth.uid()) = user_id or public.is_admin());
  end if;
end $$;

grant select, insert on public.student_learning_events to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 3: Seed Default CellQuest 3D Models
-- Conflict-safe seed ensuring GLB models exist in Supabase
-- ----------------------------------------------------------------------------
insert into public.cms_cellquest_models (id, cell_type, name, model_url, format, mesh_mappings, is_active)
values
  (
    'model_cell_animal_default',
    'animal',
    'Model 3D Sel Haiwan KSSM',
    '../models/animal_cell_final.glb',
    'GLB',
    '{"nucleus": "Nucleus_Mesh", "mitochondria": "Mitochondria_Mesh", "membrane": "Membrane_Mesh", "cytoplasm": "Cytoplasm_Mesh"}'::jsonb,
    true
  ),
  (
    'model_cell_plant_default',
    'plant',
    'Model 3D Sel Tumbuhan KSSM',
    '../models/plantcellnew.glb',
    'GLB',
    '{"nucleus": "Nucleus_Mesh", "chloroplast": "Chloroplast_Mesh", "vacuole": "Vacuole_Mesh", "wall": "CellWall_Mesh"}'::jsonb,
    true
  )
on conflict (cell_type) do nothing;

-- ----------------------------------------------------------------------------
-- STEP 4: Admin Preferences in user_settings
-- Ensure Admins can read and update their own account preferences & language
-- ----------------------------------------------------------------------------
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'user_settings' and policyname='users manage own settings'
  ) then
    -- Existing policy in initial migration covers (select auth.uid()) = user_id
    null;
  end if;
end $$;
