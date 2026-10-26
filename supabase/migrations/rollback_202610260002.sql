-- ============================================================================
-- ARSelNel Rollback Script for Migration 202610260002
-- Migration ID: rollback_202610260002.sql
-- ============================================================================

-- Reverts is_super_admin() to previous definition if needed
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then
    return false;
  end if;

  if to_regclass('public.admin_users') is not null then
    select role into v_role from public.admin_users where user_id = v_uid;
    if v_role = 'superadmin' then
      return true;
    end if;
  end if;

  return false;
end;
$$;
