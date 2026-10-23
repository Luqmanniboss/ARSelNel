-- ============================================================================
-- ARSelNel Migration Rollback Script
-- Target: 202610230003_safe_production_migration.sql
--
-- CAUTION:
-- Run this ONLY if 202610230003 failed or must be completely rolled back.
-- Preserves all pre-existing tables (cms_videos, cms_quizzes, profiles, etc.).
-- ============================================================================

-- 1. Remove RLS Policies created by 202610230003
drop policy if exists "admin insert educational_media" on storage.objects;
drop policy if exists "admin update educational_media" on storage.objects;
drop policy if exists "admin delete educational_media" on storage.objects;
drop policy if exists "public read educational_media" on storage.objects;

drop policy if exists "admin delete learning notes" on public.learning_notes;
drop policy if exists "admin update learning notes" on public.learning_notes;
drop policy if exists "admin insert learning notes" on public.learning_notes;
drop policy if exists "public read published learning notes" on public.learning_notes;

drop policy if exists "students delete own annotations" on public.student_annotations;
drop policy if exists "students update own annotations" on public.student_annotations;
drop policy if exists "students write own annotations" on public.student_annotations;
drop policy if exists "students read own annotations" on public.student_annotations;

drop policy if exists "students update own progress" on public.student_note_progress;
drop policy if exists "students write own progress" on public.student_note_progress;
drop policy if exists "students read own progress" on public.student_note_progress;

-- 2. Restore legacy is_admin if needed (or keep hardened definition)
-- Recommended: Keep hardened is_admin() to prevent privilege escalation.

-- 3. Note: Tables public.learning_notes, public.student_annotations, and
-- public.student_note_progress can be preserved or dropped if clean rollback is required:
-- drop table if exists public.student_annotations;
-- drop table if exists public.student_note_progress;
-- drop table if exists public.learning_notes;
