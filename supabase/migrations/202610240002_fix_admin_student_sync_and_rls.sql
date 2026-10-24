-- ============================================================================
-- ARSelNel Admin-Student Data Synchronization & RLS Hardening Migration
-- Migration ID: 202610240002_fix_admin_student_sync_and_rls.sql
--
-- SAFETY & INTEGRITY GUARANTEES:
-- 100% Additive and Idempotent.
-- NO DROP TABLE, NO TRUNCATE, NO DATA LOSS.
-- Preserves all existing published videos, notes, quizzes, student profiles,
-- and learning records.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Enhanced and Resilient public.is_admin() Function
-- Checks database admin_users, app_metadata, and verified profiles role.
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

  -- 1. Primary check: Verified admin_users table
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return true;
  end if;

  -- 2. Secondary check: Supabase app_metadata (set by Supabase dashboard/admin API)
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'guru', 'teacher') then
    return true;
  end if;

  -- 3. Tertiary check: Verified database profiles table where role constraint is enforced
  if exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'guru', 'teacher')
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- ----------------------------------------------------------------------------
-- STEP 2: Auto-reconciliation of Admin Users Table
-- Populate admin_users from profiles if any admin/teacher profiles exist
-- ----------------------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'admin_users') then
    insert into public.admin_users (user_id, role)
    select id, role from public.profiles
    where role in ('admin', 'guru', 'teacher')
    on conflict (user_id) do update set role = excluded.role;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 3: RLS Policies for Admin Visibility of Student Records
-- ----------------------------------------------------------------------------

-- A. Profiles table: Admins can read all student profiles
do $$ begin
  drop policy if exists "admins read all profiles" on public.profiles;
  create policy "admins read all profiles" on public.profiles
    for select to authenticated
    using (public.is_admin() or (select auth.uid()) = id);
end $$;

-- B. Quiz Attempts table: Admins can read all student quiz attempts
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'quiz_attempts') then
    drop policy if exists "admins read all quiz attempts" on public.quiz_attempts;
    create policy "admins read all quiz attempts" on public.quiz_attempts
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = user_id);
  end if;
end $$;

-- C. Learning Progress table: Admins can read all student progress records
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'learning_progress') then
    drop policy if exists "admins read all learning progress" on public.learning_progress;
    create policy "admins read all learning progress" on public.learning_progress
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = user_id);
  end if;
end $$;

-- D. Student Note Progress table: Admins can read all student note progress
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'student_note_progress') then
    drop policy if exists "admins read all student note progress" on public.student_note_progress;
    create policy "admins read all student note progress" on public.student_note_progress
      for select to authenticated
      using (public.is_admin() or (select auth.uid()) = student_id);
  end if;
end $$;

-- E. Grant proper permissions
grant execute on function public.is_admin() to authenticated, anon;
grant select on public.profiles to authenticated;
