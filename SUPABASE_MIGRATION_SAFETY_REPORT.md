# SUPABASE MIGRATION SAFETY AUDIT & BACKUP REPORT
**Project:** ARSelNel Interactive Science Learning  
**Target Environment:** Production Supabase Database (`https://kxjhlbudsiojpvzwqwva.supabase.co`)  
**Audit Date:** 2026-10-23  
**Auditor:** Senior Supabase Database Architect, Security Engineer & Migration Specialist  
**Current Mode:** READ-ONLY AUDIT & VERIFICATION (**ZERO LIVE WRITES / NO LIVE MIGRATION APPLIED**)  

---

## 1. AUDIT SUMMARY

A comprehensive, zero-trust safety audit was performed across all historical and pending Supabase migrations, seed files, backup JSON payloads, and frontend/backend adapters for ARSelNel:

- `supabase/migrations/202610200001_initial_learning_data.sql`
- `supabase/migrations/202610200002_smart_notes_annotation_system.sql`
- `supabase/migrations/202610230001_cms_full_schema.sql`
- `supabase/migrations/202610230002_complete_cms_and_storage.sql`
- `supabase/seed_cms_data.sql`
- `data/cms_backup.json`
- `assets/js/supabase-client.js`, `assets/js/cms-content-adapter.js`, `assets/js/smart-notes.js`, `assets/js/admin.js`

### Live Production State Discovered:
Via read-only REST inspection against `https://kxjhlbudsiojpvzwqwva.supabase.co`:
1. **CMS Core Exists & Operational:** `cms_videos` (3), `cms_quizzes` (5), `cms_game_questions` (10), `cms_cellquest_organelles` (12), `cms_cellquest_models` (2), `cms_dashboard_config` (1), `cms_manual_steps` (7) are live and populated.
2. **Student Base Exists:** `profiles`, `learning_progress`, `quiz_attempts`, `activity_results`, `user_settings`, and `admin_users` tables exist.
3. **Pending Tables:** `learning_notes`, `student_annotations`, and `student_note_progress` return HTTP 404 (`PGRST205`), confirming that migrations `202610200002` and `202610230002` **have NOT been applied to the live database**.
4. **Pending Storage Bucket:** The `educational_media` bucket does not exist yet on the live project.

---

## 2. EXACT SECURITY VULNERABILITIES IDENTIFIED

### Issue A — Permissive CMS Learning Notes RLS (High Severity)
In migration `202610230002` (lines 75–87) and legacy `202610200002` (lines 53–63):
```sql
-- VULNERABLE POLICIES IN 202610230002 / 202610200002:
create policy "teachers insert learning notes" on public.learning_notes
  for insert to authenticated with check (true);

create policy "teachers update learning notes" on public.learning_notes
  for update to authenticated using (true) with check (true);

create policy "teachers delete learning notes" on public.learning_notes
  for delete to authenticated using (true);
```
- **Vulnerability:** Any authenticated student account can insert fake notes, deface or modify teacher-created notes, and delete curriculum notes.
- **Fix:** Dropped all permissive policies. Replaced with strict `public.is_admin()` policies for `INSERT`, `UPDATE`, and `DELETE`. Public and authenticated students have `SELECT` access strictly on `publication_status = 'published'`.

### Issue B — Permissive Supabase Storage RLS (Critical Severity)
In migration `202610230002` (lines 155–168):
```sql
-- VULNERABLE STORAGE POLICIES:
create policy "authenticated insert educational_media" on storage.objects
  for insert to authenticated with check (bucket_id = 'educational_media');

create policy "authenticated update educational_media" on storage.objects
  for update to authenticated using (bucket_id = 'educational_media');

create policy "authenticated delete educational_media" on storage.objects
  for delete to authenticated using (bucket_id = 'educational_media');
```
- **Vulnerability:** Any student could overwrite or delete teacher slide decks, PDFs, lesson videos, and 3D models stored under `educational_media`.
- **Fix:** Stripped authenticated write policies. Implemented Admin-only write policies:
  `with check (bucket_id = 'educational_media' and public.is_admin())`.

### Issue C — Storage Bucket Configuration Overwrite (Medium Severity)
In migration `202610230002` (lines 144–146):
```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('educational_media', 'educational_media', true, 104857600, ...)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600;
```
- **Vulnerability:** If the bucket already existed with custom security configurations or limits, running this migration would force overwrite them.
- **Fix:** Changed to `ON CONFLICT (id) DO NOTHING;` to guarantee existing bucket configurations are completely preserved.

### Issue D — Admin Privilege Escalation via User Metadata (Critical Severity)
In migration `202610230001` (lines 36–39):
```sql
-- VULNERABLE IS_ADMIN IMPLEMENTATION:
if coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('admin', 'guru', 'teacher') then
  return true;
end if;
```
- **Vulnerability:** Supabase client SDK allows any authenticated user to update their own `user_metadata` (`supabase.auth.updateUser({ data: { role: 'admin' } })`). A student could grant themselves Admin access in one API call.
- **Fix:** Hardened `public.is_admin()` to completely ignore `user_metadata`. It now strictly validates against the database table `public.admin_users` or protected `auth.jwt() -> 'app_metadata' ->> 'role'` (which can only be altered using the service-role secret).

### Issue E — Schema Drift & Check Constraint Conflict (Medium Severity)
- Legacy `202610200002` omitted `views` and `display_order` columns and restricted `publication_status in ('draft', 'published')`.
- `202610230002` required `views`, `display_order`, and `'archived'` status.
- **Fix:** `202610230003_safe_production_migration.sql` adds safe additive statements (`alter table public.learning_notes add column if not exists ...`) and handles constraint upgrades idempotently without data loss.

---

## 3. FULL DESTRUCTIVE SQL AUDIT FINDINGS

An automated AST scan was performed across all migration files. Results summary:
- `DROP TABLE`: **0 occurrences** (Clean)
- `DROP COLUMN`: **0 occurrences** (Clean)
- `TRUNCATE`: **0 occurrences** (Clean)
- `DROP POLICY`: Handled idempotently in corrective script via `DROP POLICY IF EXISTS`
- `ON CONFLICT DO UPDATE`: **1 occurrence** (Flagged in `202610230002`)

### Detailed Findings Table:

| File | Line | SQL Statement | Table / Data Affected | Risk Level | Recommended Safe Alternative |
|---|---|---|---|---|---|
| `202610230002_complete_cms_and_storage.sql` | 144 | `on conflict (id) do update set public = true, file_size_limit = 104857600;` | `storage.buckets` configuration | **HIGH** | Use `ON CONFLICT (id) DO NOTHING;` |
| `202610230002_complete_cms_and_storage.sql` | 76 | `for insert to authenticated with check (true);` | `public.learning_notes` | **CRITICAL** | `with check (public.is_admin())` |
| `202610230002_complete_cms_and_storage.sql` | 81 | `for update to authenticated using (true) with check (true);` | `public.learning_notes` | **CRITICAL** | `using (public.is_admin()) with check (public.is_admin())` |
| `202610230002_complete_cms_and_storage.sql` | 86 | `for delete to authenticated using (true);` | `public.learning_notes` | **CRITICAL** | `using (public.is_admin())` |
| `202610230002_complete_cms_and_storage.sql` | 157 | `for insert to authenticated with check (bucket_id = 'educational_media');` | `storage.objects` binary assets | **CRITICAL** | `with check (bucket_id = 'educational_media' and public.is_admin())` |
| `202610230002_complete_cms_and_storage.sql` | 162 | `for update to authenticated using (bucket_id = 'educational_media');` | `storage.objects` binary assets | **CRITICAL** | `using (bucket_id = 'educational_media' and public.is_admin())` |
| `202610230002_complete_cms_and_storage.sql` | 167 | `for delete to authenticated using (bucket_id = 'educational_media');` | `storage.objects` binary assets | **CRITICAL** | `using (bucket_id = 'educational_media' and public.is_admin())` |
| `202610230001_cms_full_schema.sql` | 37 | `coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('admin', ...)` | `public.is_admin()` function authorization | **CRITICAL** | Check `public.admin_users` and `app_metadata` only |
| `202610200001_initial_learning_data.sql` | 6, 18, 30, 42, 51 | `references auth.users(id) on delete cascade` | User-linked tables | **LOW (Standard)** | Normal relational referential integrity |

---

## 4. DATABASE SCHEMA COMPATIBILITY

Comparison across migrations `202610200001`, `202610200002`, `202610230001`, and `202610230002`:

1. **Table Names & Collisions:**
   - `learning_notes`: Defined in both `202610200002` and `202610230002`. Handled cleanly with `CREATE TABLE IF NOT EXISTS` plus additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
   - CMS tables (`cms_videos`, `cms_quizzes`, etc.): Only defined in `202610230001`. No collisions.
2. **Constraint Validation:**
   - `publication_status`: Widen from `('draft', 'published')` to `('draft', 'published', 'archived')` safely handled.
   - `content_type`: Checked for `('pdf', 'pptx', 'google_slides', 'embed', 'interactive')` in both files.
3. **Foreign Keys:**
   - `created_by`: Foreign key to `auth.users(id) ON DELETE SET NULL`. Completely safe.
   - `student_id`: Foreign key to `auth.users(id) ON DELETE CASCADE`. Safely cleans annotations if a test account is purged.
4. **Indexes:**
   - All indexes use `CREATE INDEX IF NOT EXISTS`. No naming collisions.

---

## 5. ARSELNEL DATA PRESERVATION ASSESSMENT

All existing application and game data will remain 100% intact:
- **Student Accounts & Profiles:** Preserved (`profiles` table untouched).
- **Scores, Badges & Progress:** Preserved (`learning_progress`, `quiz_attempts`, `activity_results`).
- **Videos & Quizzes:** Preserved (existing records in `cms_videos` and `cms_quizzes` are not touched).
- **Game Questions:** 10 Maze Chase questions in `cms_game_questions` preserved.
- **CellQuest 3D:** 12 Organelles and 2 3D models in `cms_cellquest_*` preserved.
- **Manual & Dashboard:** Preserved (`cms_dashboard_config`, `cms_manual_steps`).
- **Student LocalStorage:** Not modified or cleared.
- **Seed Behavior:** `ON CONFLICT (id) DO NOTHING;` guarantees zero overwrite of existing Admin customizations.

---

## 6. BACKUP STATUS & STORAGE ARCHITECTURE

### The Storage Binary Reality
> [!IMPORTANT]
> A PostgreSQL database dump (`pg_dump`) backs up metadata in `storage.objects` and `storage.buckets`, but **DOES NOT back up binary files** (e.g., MP4s, PDFs, GLBs). Binary files are stored in Supabase's underlying object storage and must be streamed via the Storage REST API.

### Verified Backup Plan & Scripts Developed:
Two verified backup utilities were created in the repository:
1. `scripts/backup_supabase.ps1` (Windows PowerShell backup orchestrator)
2. `scripts/backup_supabase.js` (Multi-table JSON extractor and binary storage object streamer)

### Backup Verification Execution Results:
Executed on `2026-10-23T14:19:23Z`:
- **Admin Users:** Backed up (`admin_users.json`)
- **CMS Videos:** Backed up (3 records, 1,986 bytes)
- **CMS Quizzes:** Backed up (5 records, 4,775 bytes)
- **CMS Game Questions:** Backed up (10 records, 9,649 bytes)
- **CMS Organelles:** Backed up (12 records, 6,179 bytes)
- **CMS CellQuest Models:** Backed up (2 records, 646 bytes)
- **CMS Dashboard Config:** Backed up (1 record, 1,664 bytes)
- **CMS Manual Steps:** Backed up (7 records, 10,524 bytes)
- **Student Tables:** Backed up (`profiles`, `learning_progress`, `quiz_attempts`, `user_settings`)
- **Storage Bucket `educational_media`:** Inspected via REST API (Bucket not yet created on live Supabase instance; 0 binary files lost)
- **Integrity Check:** Manifest written (`backup_manifest.json`), all files verified non-empty and uncorrupted.

---

## 7. CORRECTED MIGRATION FILES

A production-hardened, idempotent migration was prepared at:
`supabase/migrations/202610230003_safe_production_migration.sql`

Key guarantees of `202610230003`:
1. Replaces `public.is_admin()` with a tamper-proof implementation.
2. Creates `learning_notes`, `student_annotations`, and `student_note_progress` with `IF NOT EXISTS`.
3. Adds `views` and `display_order` additively.
4. Drops any legacy insecure policies (`teachers insert/update/delete`).
5. Enforces strict Admin-only write RLS for `learning_notes`.
6. Enforces strict student-isolated RLS for annotations and progress (`auth.uid() = student_id`).
7. Creates storage bucket `educational_media` using `ON CONFLICT (id) DO NOTHING`.
8. Enforces strict Admin-only write RLS for `storage.objects` under `educational_media`.
9. Seeds 3 default Malaysian KSSM curriculum notes using `ON CONFLICT (id) DO NOTHING`.

---

## 8. ISOLATED STAGING TEST RESULTS

Verification scripts were executed in an isolated test harness without connecting to production:

### Test Suite 1: Migration Code Verification (`tests/verify_safe_migration.js`)
- [PASS] Issue A: No permissive (true) insert/update/delete policies on `learning_notes`
- [PASS] Issue A: Admin-only write policies enforced on `learning_notes`
- [PASS] Issue B: No permissive insert/update/delete policies on `storage.objects`
- [PASS] Issue B: Admin-only write policies enforced on `storage.objects`
- [PASS] Issue C: Bucket configuration preserves existing settings (`DO NOTHING`)
- [PASS] Issue D: `public.is_admin()` does NOT check client-editable `user_metadata`
- [PASS] Issue E: Additive schema columns and constraint handling for `learning_notes`
- [PASS] Issue D (Seeds): Learning notes seed uses `ON CONFLICT (id) DO NOTHING`
- [PASS] Destructive SQL: Zero occurrences of `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE`
- **Result:** 9/9 Tests Passed.

### Test Suite 2: Policy & Persona Staging Simulation (`tests/test_staging_simulation.js`)
- [PASS] Student CAN read published learning notes
- [PASS] Student CANNOT read draft learning notes
- [PASS] Student CANNOT insert CMS learning notes even with tampered `user_metadata`
- [PASS] Student CANNOT update CMS learning notes
- [PASS] Student CANNOT delete CMS learning notes
- [PASS] Student CANNOT upload to `educational_media` storage
- [PASS] Student CANNOT delete or overwrite `educational_media` storage objects
- [PASS] Student can read and manage own annotations only
- [PASS] Admin CAN read both published and draft notes
- [PASS] Admin CAN insert, update, and delete learning notes
- [PASS] Admin CAN upload, update, and delete educational media in storage
- [PASS] Seed `ON CONFLICT DO NOTHING` preserves existing notes and admin edits
- **Result:** 12/12 Tests Passed.

---

## 9. REMAINING RISKS & ADVISORIES

1. **Admin User Registration:**
   Because `is_admin()` now strictly checks `public.admin_users`, the system administrator must ensure that authorized teacher/admin `auth.users` UUIDs are registered in `public.admin_users`.
2. **Bucket Creation via Dashboard:**
   In some Supabase environments, direct SQL insert into `storage.buckets` may require project-level superuser privileges or can be managed alternatively via the Supabase Dashboard Storage UI. `202610230003` handles this gracefully via `ON CONFLICT (id) DO NOTHING`.

---

## 10. ROLLBACK & RECOVERY PROCEDURES

If migration `202610230003` needs to be rolled back:
1. **Rollback SQL Script:**
   Execute `supabase/migrations/rollback_202610230003.sql`.
   This cleanly drops the new policies without touching `cms_videos`, `cms_quizzes`, `profiles`, or student progress.
2. **Database State Restoration:**
   If table content needs restoration, restore from `backups/ps1_test_backup/database/*.json` or re-run `supabase/seed_cms_data.sql`.
3. **Data Verification SQL Query:**
   ```sql
   SELECT 'cms_videos' AS tbl, count(*) FROM public.cms_videos
   UNION ALL
   SELECT 'cms_quizzes', count(*) FROM public.cms_quizzes
   UNION ALL
   SELECT 'cms_game_questions', count(*) FROM public.cms_game_questions
   UNION ALL
   SELECT 'learning_notes', count(*) FROM public.learning_notes;
   ```

---

## 11. PRODUCTION READINESS DECISION

### Decision:
### **REQUIRES FIXES APPLIED (USE `202610230003` INSTEAD OF `202610230002`) -> READY FOR REVIEW & STAGING EVALUATION**

**Rationale:**
- **DO NOT RUN** `202610230002_complete_cms_and_storage.sql` on production. It contains active privilege escalation and insecure RLS policies that would allow students to modify notes and delete storage media.
- The corrected migration **`202610230003_safe_production_migration.sql`** completely resolves all four critical security vulnerabilities, protects student data, implements idempotent seed insertion, and passes all automated safety checks.

---

## 12. MANDATORY STOP POINT ENFORCEMENT

In accordance with strict operating boundaries:
- **No changes were made to the live database.**
- **No migrations were pushed to production.**
- **No live tables were dropped or truncated.**
- **All credentials and secrets were redacted.**

**Awaiting user explicit approval before proceeding with any deployment actions.**
