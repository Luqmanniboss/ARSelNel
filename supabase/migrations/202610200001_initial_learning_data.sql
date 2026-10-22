-- ARSelNel initial private learning-data schema.
-- Safe additive migration: creates new tables/policies only; it does not
-- truncate, reset, import, or alter existing application data.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  nickname text,
  class_name text,
  role text not null default 'student' check (role = 'student'),
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null,
  completion_status text not null default 'in_progress' check (completion_status in ('not_started','in_progress','completed')),
  progress_percentage numeric(5,2) not null default 0 check (progress_percentage between 0 and 100),
  result_data jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, activity_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_source_id text not null,
  quiz_id text not null,
  score integer not null check (score between 0 and 100),
  total_questions integer not null check (total_questions > 0),
  result_data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  unique (user_id, legacy_source_id)
);

create table if not exists public.activity_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null,
  idempotency_key text not null,
  result_data jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists learning_progress_user_updated_idx on public.learning_progress (user_id, updated_at desc);
create index if not exists quiz_attempts_user_submitted_idx on public.quiz_attempts (user_id, submitted_at desc);
create index if not exists activity_results_user_completed_idx on public.activity_results (user_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.activity_results enable row level security;
alter table public.user_settings enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='students read own profile') then
    create policy "students read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='students insert own profile') then
    create policy "students insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id and role = 'student');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='students update own profile') then
    create policy "students update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id and role = 'student');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_progress' and policyname='students read own learning progress') then
    create policy "students read own learning progress" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_progress' and policyname='students write own learning progress') then
    create policy "students write own learning progress" on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_progress' and policyname='students update own learning progress') then
    create policy "students update own learning progress" on public.learning_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_attempts' and policyname='students read own quiz attempts') then
    create policy "students read own quiz attempts" on public.quiz_attempts for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_attempts' and policyname='students submit own quiz attempts') then
    create policy "students submit own quiz attempts" on public.quiz_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_attempts' and policyname='students update own quiz attempts') then
    create policy "students update own quiz attempts" on public.quiz_attempts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='activity_results' and policyname='students read own activity results') then
    create policy "students read own activity results" on public.activity_results for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='activity_results' and policyname='students save own activity results') then
    create policy "students save own activity results" on public.activity_results for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='students read own settings') then
    create policy "students read own settings" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='students insert own settings') then
    create policy "students insert own settings" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_settings' and policyname='students update own settings') then
    create policy "students update own settings" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
end $$;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.learning_progress to authenticated;
grant select, insert, update on public.quiz_attempts to authenticated;
grant select, insert on public.activity_results to authenticated;
grant select, insert, update on public.user_settings to authenticated;

-- Create a student profile on signup. User metadata is used only as profile
-- text; it never determines authorization or permits a role escalation.
create or replace function public.handle_new_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, nickname, class_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'class_name', ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='on_auth_user_created_arselnel' and tgrelid='auth.users'::regclass and not tgisinternal) then
    create trigger on_auth_user_created_arselnel
      after insert on auth.users
      for each row execute function public.handle_new_student_profile();
  end if;
end $$;
