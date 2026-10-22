-- ARSelNel Smart Notes & Interactive Slide Annotation System Schema Migration
-- Safe additive migration for Interactive Teacher Slides & Student Vector Annotations.

create table if not exists public.learning_notes (
  id text primary key,
  title text not null,
  chapter text not null,
  description text default '',
  content_type text not null check (content_type in ('pdf', 'pptx', 'google_slides', 'embed', 'interactive')),
  source_url text default '',
  storage_path text default '',
  slide_count integer not null default 1,
  slide_data jsonb not null default '[]'::jsonb,
  publication_status text not null default 'published' check (publication_status in ('draft', 'published')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists learning_notes_chapter_idx on public.learning_notes (chapter, publication_status);
create index if not exists student_annotations_lookup_idx on public.student_annotations (note_id, student_id, page_number);
create index if not exists student_note_progress_lookup_idx on public.student_note_progress (student_id, note_id);

alter table public.learning_notes enable row level security;
alter table public.student_annotations enable row level security;
alter table public.student_note_progress enable row level security;

do $$ begin
  -- learning_notes policies:
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_notes' and policyname='all users read published notes') then
    create policy "all users read published notes" on public.learning_notes for select using (publication_status = 'published');
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_notes' and policyname='teachers insert learning notes') then
    create policy "teachers insert learning notes" on public.learning_notes for insert to authenticated with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_notes' and policyname='teachers update learning notes') then
    create policy "teachers update learning notes" on public.learning_notes for update to authenticated using (true) with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='learning_notes' and policyname='teachers delete learning notes') then
    create policy "teachers delete learning notes" on public.learning_notes for delete to authenticated using (true);
  end if;

  -- student_annotations policies (Isolated to auth.uid):
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_annotations' and policyname='students read own annotations') then
    create policy "students read own annotations" on public.student_annotations for select to authenticated using ((select auth.uid()) = student_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_annotations' and policyname='students insert own annotations') then
    create policy "students insert own annotations" on public.student_annotations for insert to authenticated with check ((select auth.uid()) = student_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_annotations' and policyname='students update own annotations') then
    create policy "students update own annotations" on public.student_annotations for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_annotations' and policyname='students delete own annotations') then
    create policy "students delete own annotations" on public.student_annotations for delete to authenticated using ((select auth.uid()) = student_id);
  end if;

  -- student_note_progress policies:
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_note_progress' and policyname='students read own progress') then
    create policy "students read own progress" on public.student_note_progress for select to authenticated using ((select auth.uid()) = student_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_note_progress' and policyname='students write own progress') then
    create policy "students write own progress" on public.student_note_progress for insert to authenticated with check ((select auth.uid()) = student_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='student_note_progress' and policyname='students update own progress') then
    create policy "students update own progress" on public.student_note_progress for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
  end if;
end $$;

grant select on public.learning_notes to anon, authenticated;
grant insert, update, delete on public.learning_notes to authenticated;
grant select, insert, update, delete on public.student_annotations to authenticated;
grant select, insert, update on public.student_note_progress to authenticated;
