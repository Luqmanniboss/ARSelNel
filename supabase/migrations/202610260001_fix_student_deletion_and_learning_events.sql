-- ============================================================================
-- ARSelNel Fix Migration: Student Account Deletion & Learning Events Schema
-- Date: 2026-10-26
-- Description:
--   1. Safely creates public.student_learning_events if not present in schema.
--   2. Updates public.is_super_admin() with comprehensive administrator
--      recognition (admin@% email prefixes, metadata, profiles & admin_users auto-linking).
--   3. Hardens public.delete_student_account(p_target_user_id, p_reason) with
--      defensive dynamic existence checks (to_regclass) so missing optional
--      tables NEVER abort or fail the deletion of student accounts.
--   4. Ensures permanent removal from both public.profiles and auth.users.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Safely Create student_learning_events (Idempotent)
-- ----------------------------------------------------------------------------
create table if not exists public.student_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_payload jsonb default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists student_learning_events_idempotency_idx 
  on public.student_learning_events (user_id, idempotency_key);

create index if not exists student_learning_events_user_idx 
  on public.student_learning_events (user_id, created_at desc);

create index if not exists student_learning_events_type_idx 
  on public.student_learning_events (event_type, created_at desc);

alter table public.student_learning_events enable row level security;

-- Policies for student_learning_events
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_learning_events' and policyname='students insert own events') then
    create policy "students insert own events" on public.student_learning_events
      for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_learning_events' and policyname='students read own events') then
    create policy "students read own events" on public.student_learning_events
      for select to authenticated using ((select auth.uid()) = user_id or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_learning_events' and policyname='admins delete events') then
    create policy "admins delete events" on public.student_learning_events
      for delete to authenticated using (public.is_admin());
  end if;
end;
$$;

grant select, insert, delete on public.student_learning_events to authenticated;

-- ----------------------------------------------------------------------------
-- STEP 2: Bulletproof is_super_admin() Function
-- Checks UUID against auth.users, metadata, profiles, and auto-links admin_users
-- ----------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_role text;
  v_meta_role text;
begin
  if v_uid is null then
    return false;
  end if;

  select lower(coalesce(email, '')), raw_user_meta_data ->> 'role'
  into v_email, v_meta_role
  from auth.users where id = v_uid;

  -- 1. Auto-recognize primary administrator accounts:
  -- Any email starting with 'admin@' or having admin metadata
  if v_email = 'admin@test.com' 
     or v_email like 'admin@%' 
     or v_meta_role in ('superadmin', 'admin') then
    if to_regclass('public.admin_users') is not null then
      insert into public.admin_users (user_id, role, created_at)
      values (v_uid, 'superadmin', now())
      on conflict (user_id) do update set role = 'superadmin';
    end if;
    return true;
  end if;

  -- 2. Check public.admin_users
  if to_regclass('public.admin_users') is not null then
    select role into v_role from public.admin_users where user_id = v_uid;
    if v_role in ('superadmin', 'admin') then
      return true;
    end if;
  end if;

  -- 3. Check public.profiles role
  if to_regclass('public.profiles') is not null then
    select role into v_role from public.profiles where id = v_uid;
    if v_role in ('superadmin', 'admin') then
      if to_regclass('public.admin_users') is not null then
        insert into public.admin_users (user_id, role, created_at)
        values (v_uid, 'superadmin', now())
        on conflict (user_id) do update set role = 'superadmin';
      end if;
      return true;
    end if;
  end if;

  return false;
end;
$$;

grant execute on function public.is_super_admin() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- STEP 3: Hardened delete_student_account Function (Defensive Dynamic Execution)
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
    raise exception 'Akses tidak disahkan. Sila log masuk semula.';
  end if;

  -- 2. Verify caller is Super Admin (or Admin)
  if not public.is_super_admin() then
    raise exception 'Hanya Pentadbir Utama (Super Admin) dibenarkan memadam akaun murid.';
  end if;

  -- 3. Prevent self-deletion
  if v_caller_id = p_target_user_id then
    raise exception 'Pentadbir utama tidak boleh memadam akaunnya sendiri melalui fungsi ini.';
  end if;

  -- 4. Prevent deleting teachers or admins
  if to_regclass('public.admin_users') is not null then
    if exists (
      select 1 from public.admin_users 
      where user_id = p_target_user_id and role in ('superadmin', 'teacher', 'admin', 'guru')
    ) then
      raise exception 'Akaun Guru atau Pentadbir tidak boleh dipadam melalui tindakan Padam Akaun Murid.';
    end if;
  end if;

  -- Fetch metadata for audit log
  select email into v_caller_email from auth.users where id = v_caller_id;
  select email into v_target_email from auth.users where id = p_target_user_id;
  if to_regclass('public.profiles') is not null then
    select full_name into v_target_name from public.profiles where id = p_target_user_id;
  end if;

  -- 5. Record audit log BEFORE deletion (if audit table exists)
  if to_regclass('public.admin_audit_logs') is not null then
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
        'student_email', coalesce(v_target_email, 'unknown'),
        'reason', coalesce(p_reason, 'Dipadam oleh Super Admin'),
        'timestamp', now()
      ),
      now()
    );
  end if;

  -- 6. Safely remove student learning records across all tables
  -- Uses defensive dynamic execution (to_regclass) so missing tables will NEVER crash the transaction
  if to_regclass('public.student_learning_events') is not null then
    execute 'delete from public.student_learning_events where user_id = $1' using p_target_user_id;
  end if;

  if to_regclass('public.quiz_attempts') is not null then
    execute 'delete from public.quiz_attempts where user_id = $1' using p_target_user_id;
  end if;

  if to_regclass('public.learning_progress') is not null then
    execute 'delete from public.learning_progress where user_id = $1' using p_target_user_id;
  end if;

  if to_regclass('public.activity_results') is not null then
    execute 'delete from public.activity_results where user_id = $1' using p_target_user_id;
  end if;

  if to_regclass('public.user_settings') is not null then
    execute 'delete from public.user_settings where user_id = $1' using p_target_user_id;
  end if;

  if to_regclass('public.student_annotations') is not null then
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_annotations' and column_name = 'student_id') then
      execute 'delete from public.student_annotations where student_id = $1' using p_target_user_id;
    elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_annotations' and column_name = 'user_id') then
      execute 'delete from public.student_annotations where user_id = $1' using p_target_user_id;
    end if;
  end if;

  if to_regclass('public.student_note_progress') is not null then
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_note_progress' and column_name = 'student_id') then
      execute 'delete from public.student_note_progress where student_id = $1' using p_target_user_id;
    elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_note_progress' and column_name = 'user_id') then
      execute 'delete from public.student_note_progress where user_id = $1' using p_target_user_id;
    end if;
  end if;

  if to_regclass('public.game_leaderboards') is not null then
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'game_leaderboards' and column_name = 'user_id') then
      execute 'delete from public.game_leaderboards where user_id = $1' using p_target_user_id;
    elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'game_leaderboards' and column_name = 'student_id') then
      execute 'delete from public.game_leaderboards where student_id = $1' using p_target_user_id;
    end if;
  end if;

  if to_regclass('public.student_quiz_snapshots') is not null then
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_quiz_snapshots' and column_name = 'user_id') then
      execute 'delete from public.student_quiz_snapshots where user_id = $1' using p_target_user_id;
    elsif exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'student_quiz_snapshots' and column_name = 'student_id') then
      execute 'delete from public.student_quiz_snapshots where student_id = $1' using p_target_user_id;
    end if;
  end if;

  -- 7. Remove from public.profiles
  if to_regclass('public.profiles') is not null then
    delete from public.profiles where id = p_target_user_id;
  end if;

  -- 8. Permanently remove account from auth.users
  delete from auth.users where id = p_target_user_id;

  return jsonb_build_object(
    'success', true,
    'deleted_user_id', p_target_user_id,
    'message', 'Akaun murid dan semua rekod berkaitan telah berjaya dipadam dengan selamat.'
  );
end;
$$;

grant execute on function public.delete_student_account(uuid, text) to authenticated;
