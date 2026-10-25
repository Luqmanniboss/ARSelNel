-- ============================================================================
-- ARSelNel Role-Based Access Control, Teacher Roles, Safe Student Account Deletion & Audit Logging
-- Migration ID: 202610250002_teacher_roles_student_deletion_and_audit.sql
--
-- SAFETY & AUDIT POLICY:
-- 100% Additive and Idempotent.
-- NO DROP TABLE, NO TRUNCATE.
-- Preserves all published notes, videos, quizzes, games, student records, and leaderboards.
-- Hardened security: Strict Super Admin validation against verified UUIDs & admin_users.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Additive Schema Enhancements for Profiles & Roles
-- ----------------------------------------------------------------------------

-- A. Add email and status columns to public.profiles if they do not exist
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists status text default 'active';

-- B. Safely update profiles_role_check to permit teacher, guru, admin, superadmin
do $$ begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check 
    check (role in ('student', 'teacher', 'guru', 'admin', 'superadmin'));
exception when others then
  null;
end $$;

-- C. Backfill email in profiles from auth.users where missing
do $$ begin
  update public.profiles p
  set email = u.email
  from auth.users u
  where p.id = u.id and (p.email is null or p.email = '');
exception when others then
  null;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 2: Dedicated Audit Logs Table for Administrative Actions
-- ----------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  action text not null check (action in ('PROMOTE_TEACHER', 'DEMOTE_TEACHER', 'DELETE_STUDENT', 'DEACTIVATE_STUDENT', 'UPDATE_ROLE')),
  target_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_actor_idx on public.admin_audit_logs (actor_id, created_at desc);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs (action, created_at desc);

-- Enable RLS on audit logs: Only verified Admins can read
alter table public.admin_audit_logs enable row level security;

do $$ begin
  drop policy if exists "admins read audit logs" on public.admin_audit_logs;
  create policy "admins read audit logs" on public.admin_audit_logs
    for select to authenticated
    using (public.is_admin());
end $$;

grant select on public.admin_audit_logs to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 3: Configure Super Admin (admin@test.com)
-- Binds admin@test.com to public.admin_users with role = 'superadmin'
-- ----------------------------------------------------------------------------
do $$
declare
  v_admin_uid uuid;
begin
  select id into v_admin_uid 
  from auth.users 
  where lower(email) = 'admin@test.com' 
  order by created_at asc 
  limit 1;

  if v_admin_uid is not null then
    insert into public.admin_users (user_id, email, role, updated_at)
    values (v_admin_uid, 'admin@test.com', 'superadmin', now())
    on conflict (user_id) do update set 
      email = 'admin@test.com',
      role = 'superadmin',
      updated_at = now();

    insert into public.profiles (id, full_name, role, email, status, updated_at)
    values (v_admin_uid, 'Pentadbir Utama ARSelNel', 'admin', 'admin@test.com', 'active', now())
    on conflict (id) do update set 
      role = 'admin',
      email = 'admin@test.com',
      status = 'active',
      updated_at = now();
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 4: Hardened Role Verification Functions
-- ----------------------------------------------------------------------------

-- Check if current authenticated user is Super Admin
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return false;
  end if;

  return exists (
    select 1 from public.admin_users
    where user_id = v_uid and role = 'superadmin'
  );
end;
$$;

-- Enhanced is_admin() covering both Super Admin and Teacher/Guru
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return false;
  end if;

  -- 1. Check admin_users table for superadmin, admin, or teacher
  if exists (
    select 1 from public.admin_users 
    where user_id = v_uid and role in ('superadmin', 'admin', 'teacher')
  ) then
    return true;
  end if;

  -- 2. Check Supabase app_metadata
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('superadmin', 'admin', 'guru', 'teacher') then
    return true;
  end if;

  -- 3. Check profiles table
  if exists (
    select 1 from public.profiles 
    where id = v_uid and role in ('admin', 'superadmin', 'guru', 'teacher')
  ) then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.is_super_admin() to authenticated, anon;
grant execute on function public.is_admin() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- STEP 5: Safe RPC for Student Learning Records (Deduplicated with Actual Email)
-- ----------------------------------------------------------------------------
create or replace function public.get_student_learning_records()
returns table (
  id uuid,
  full_name text,
  email text,
  class_name text,
  role text,
  status text,
  quiz_attempts_count bigint,
  average_score numeric,
  completed_notes_count bigint,
  completed_games_count bigint,
  last_active timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Restrict access to teachers and admins only
  if not public.is_admin() then
    raise exception 'Akses tidak dibenarkan. Hanya Guru dan Pentadbir boleh mengakses rekod pembelajaran.';
  end if;

  return query
  select 
    u.id,
    coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)) as full_name,
    u.email::text as email,
    coalesce(p.class_name, u.raw_user_meta_data ->> 'class_name', 'Tingkatan 1') as class_name,
    coalesce(p.role, 'student') as role,
    coalesce(p.status, 'active') as status,
    coalesce(qa.attempts_count, 0) as quiz_attempts_count,
    qa.avg_score as average_score,
    coalesce(lp.notes_count, 0) as completed_notes_count,
    coalesce(lp.games_count, 0) as completed_games_count,
    coalesce(qa.last_attempt, lp.last_progress, p.updated_at, u.created_at) as last_active,
    u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join (
    select 
      user_id,
      count(*) as attempts_count,
      round(avg(score)) as avg_score,
      max(submitted_at) as last_attempt
    from public.quiz_attempts
    group by user_id
  ) qa on qa.user_id = u.id
  left join (
    select 
      user_id,
      count(*) filter (where activity_id like 'note-%' and completion_status = 'completed') as notes_count,
      count(*) filter (where activity_id like 'game-%' and completion_status = 'completed') as games_count,
      max(updated_at) as last_progress
    from public.learning_progress
    group by user_id
  ) lp on lp.user_id = u.id
  where not exists (
    select 1 from public.admin_users a 
    where a.user_id = u.id and a.role in ('superadmin', 'admin', 'teacher')
  )
  and coalesce(p.role, 'student') = 'student'
  order by coalesce(qa.last_attempt, lp.last_progress, u.created_at) desc;
end;
$$;

grant execute on function public.get_student_learning_records() to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 6: Super Admin Management - Get All Users & Roles
-- ----------------------------------------------------------------------------
create or replace function public.get_all_users_for_admin()
returns table (
  id uuid,
  full_name text,
  email text,
  class_name text,
  role text,
  status text,
  is_superadmin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Akses tidak dibenarkan.';
  end if;

  return query
  select 
    u.id,
    coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)) as full_name,
    u.email::text as email,
    coalesce(p.class_name, u.raw_user_meta_data ->> 'class_name', 'Tingkatan 1') as class_name,
    case 
      when a.role = 'superadmin' or lower(u.email) = 'admin@test.com' then 'superadmin'
      when a.role in ('teacher', 'guru', 'admin') or p.role in ('teacher', 'guru', 'admin') then 'teacher'
      else 'student'
    end as role,
    coalesce(p.status, 'active') as status,
    (a.role = 'superadmin' or lower(u.email) = 'admin@test.com') as is_superadmin,
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.admin_users a on a.user_id = u.id
  order by 
    case when (a.role = 'superadmin' or lower(u.email) = 'admin@test.com') then 0 when a.role in ('teacher', 'admin') then 1 else 2 end,
    u.created_at desc;
end;
$$;

grant execute on function public.get_all_users_for_admin() to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 7: Super Admin Teacher Appointment & Revocation
-- ----------------------------------------------------------------------------

-- A. Promote a user to Teacher role
create or replace function public.promote_user_to_teacher(
  p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_email text;
  v_target_email text;
  v_target_name text;
begin
  -- 1. Check authentication
  if v_caller_id is null then
    raise exception 'Akses tidak disahkan.';
  end if;

  -- 2. Strictly verify caller is Super Admin
  if not public.is_super_admin() then
    raise exception 'Hanya Pentadbir Utama (Super Admin) dibenarkan melantik guru.';
  end if;

  -- 3. Cannot change self
  if v_caller_id = p_target_user_id then
    raise exception 'Pentadbir utama sudah mempunyai akses tertinggi.';
  end if;

  -- Fetch details
  select email into v_caller_email from auth.users where id = v_caller_id;
  select email into v_target_email from auth.users where id = p_target_user_id;
  select full_name into v_target_name from public.profiles where id = p_target_user_id;

  if v_target_email is null then
    select email into v_target_email from public.profiles where id = p_target_user_id;
  end if;

  -- 4. Insert or update admin_users with role = 'teacher'
  insert into public.admin_users (user_id, email, role, updated_at)
  values (p_target_user_id, coalesce(v_target_email, 'guru@arselnel.my'), 'teacher', now())
  on conflict (user_id) do update set 
    role = 'teacher',
    updated_at = now();

  -- 5. Update profiles table role = 'teacher'
  update public.profiles 
  set role = 'teacher', updated_at = now()
  where id = p_target_user_id;

  -- 6. Record in audit logs
  insert into public.admin_audit_logs (
    actor_id, actor_email, action, target_id, target_email, details, created_at
  ) values (
    v_caller_id,
    coalesce(v_caller_email, 'admin@test.com'),
    'PROMOTE_TEACHER',
    p_target_user_id,
    coalesce(v_target_email, 'guru@arselnel.my'),
    jsonb_build_object(
      'teacher_name', coalesce(v_target_name, 'Guru Sains'),
      'timestamp', now()
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_target_user_id,
    'role', 'teacher',
    'message', 'Pengguna berjaya dilantik sebagai Guru Sains.'
  );
end;
$$;

-- B. Demote Teacher back to Student role
create or replace function public.demote_teacher_to_student(
  p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_email text;
  v_target_email text;
  v_target_name text;
  v_target_role text;
begin
  -- 1. Check authentication
  if v_caller_id is null then
    raise exception 'Akses tidak disahkan.';
  end if;

  -- 2. Strictly verify caller is Super Admin
  if not public.is_super_admin() then
    raise exception 'Hanya Pentadbir Utama (Super Admin) dibenarkan membatalkan pelantikan guru.';
  end if;

  -- 3. Cannot demote self or superadmin
  if v_caller_id = p_target_user_id then
    raise exception 'Pentadbir utama tidak boleh membatalkan pelantikannya sendiri.';
  end if;

  select role into v_target_role from public.admin_users where user_id = p_target_user_id;
  if v_target_role = 'superadmin' then
    raise exception 'Peranan Pentadbir Utama tidak boleh dibatalkan melalui tindakan ini.';
  end if;

  select email into v_caller_email from auth.users where id = v_caller_id;
  select email into v_target_email from auth.users where id = p_target_user_id;
  select full_name into v_target_name from public.profiles where id = p_target_user_id;

  -- 4. Remove from admin_users
  delete from public.admin_users where user_id = p_target_user_id;

  -- 5. Update profiles role back to student
  update public.profiles 
  set role = 'student', updated_at = now()
  where id = p_target_user_id;

  -- 6. Record in audit logs
  insert into public.admin_audit_logs (
    actor_id, actor_email, action, target_id, target_email, details, created_at
  ) values (
    v_caller_id,
    coalesce(v_caller_email, 'admin@test.com'),
    'DEMOTE_TEACHER',
    p_target_user_id,
    coalesce(v_target_email, 'unknown'),
    jsonb_build_object(
      'name', coalesce(v_target_name, 'Pengguna'),
      'timestamp', now()
    ),
    now()
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_target_user_id,
    'role', 'student',
    'message', 'Pelantikan Guru berjaya dibatalkan. Akaun dikembalikan kepada status Murid.'
  );
end;
$$;

grant execute on function public.promote_user_to_teacher(uuid) to authenticated;
grant execute on function public.demote_teacher_to_student(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 8: Safe Student Account Deletion Function
-- ----------------------------------------------------------------------------
create or replace function public.delete_student_account(
  p_target_user_id uuid,
  p_reason text default 'Dipadam oleh Pentadbir Utama'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_email text;
  v_target_email text;
  v_target_name text;
begin
  -- 1. Check authentication
  if v_caller_id is null then
    raise exception 'Akses tidak disahkan.';
  end if;

  -- 2. Verify caller is Super Admin
  if not public.is_super_admin() then
    raise exception 'Hanya Pentadbir Utama (Super Admin) dibenarkan memadam akaun murid.';
  end if;

  -- 3. Prevent self-deletion
  if v_caller_id = p_target_user_id then
    raise exception 'Pentadbir utama tidak boleh memadam akaunnya sendiri melalui fungsi ini.';
  end if;

  -- 4. Prevent deleting teachers or admins
  if exists (
    select 1 from public.admin_users 
    where user_id = p_target_user_id
  ) then
    raise exception 'Akaun Guru atau Pentadbir tidak boleh dipadam melalui tindakan Padam Akaun Murid.';
  end if;

  -- Fetch metadata for audit log
  select email into v_caller_email from auth.users where id = v_caller_id;
  select email into v_target_email from auth.users where id = p_target_user_id;
  select full_name into v_target_name from public.profiles where id = p_target_user_id;

  -- 5. Record audit log BEFORE deletion
  insert into public.admin_audit_logs (
    actor_id, actor_email, action, target_id, target_email, details, created_at
  ) values (
    v_caller_id,
    coalesce(v_caller_email, 'admin@test.com'),
    'DELETE_STUDENT',
    p_target_user_id,
    coalesce(v_target_email, 'unknown'),
    jsonb_build_object(
      'student_name', coalesce(v_target_name, 'Pelajar'),
      'reason', coalesce(p_reason, 'Dipadam oleh Super Admin'),
      'timestamp', now()
    ),
    now()
  );

  -- 6. Safely remove student learning records (cascade-safe, leaves other users intact)
  delete from public.learning_progress where user_id = p_target_user_id;
  delete from public.quiz_attempts where user_id = p_target_user_id;
  delete from public.activity_results where user_id = p_target_user_id;
  delete from public.student_learning_events where user_id = p_target_user_id;
  delete from public.user_settings where user_id = p_target_user_id;
  delete from public.student_annotations where user_id = p_target_user_id;
  delete from public.student_note_progress where student_id = p_target_user_id;
  delete from public.profiles where id = p_target_user_id;

  -- 7. Remove from auth.users
  delete from auth.users where id = p_target_user_id;

  return jsonb_build_object(
    'success', true,
    'deleted_user_id', p_target_user_id,
    'message', 'Akaun murid dan semua rekod berkaitan telah berjaya dipadam dengan selamat.'
  );
end;
$$;

grant execute on function public.delete_student_account(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 9: Update handle_new_student_profile Trigger
-- Stores email into public.profiles for all new user signups
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_student_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, full_name, nickname, class_name, role, email, status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'class_name', ''), 'Tingkatan 1 Al-Farabi'),
    'student',
    new.email,
    'active'
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$;
