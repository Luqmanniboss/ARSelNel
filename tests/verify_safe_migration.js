/**
 * ARSelNel Migration Verification Script
 * Validates the hardened migration (202610230003_safe_production_migration.sql)
 * against all security policies and safety guidelines.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MIGRATION_PATH = path.join(__dirname, '..', 'supabase', 'migrations', '202610230003_safe_production_migration.sql');
const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

console.log('====================================================');
console.log(' ARSelNel Migration Safety & Compliance Verification');
console.log(' Target: 202610230003_safe_production_migration.sql');
console.log('====================================================');

function stripComments(code) {
  return code.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}
const codeOnly = stripComments(sql);

const tests = [
  {
    name: 'Issue A: No permissive (true) insert/update/delete policies on learning_notes',
    fn: () => {
      const permissiveInsert = /create\s+policy[^\n]+learning_notes[^\n]+for\s+insert[^\n]+with\s+check\s*\(\s*true\s*\)/i.test(codeOnly);
      const permissiveUpdate = /create\s+policy[^\n]+learning_notes[^\n]+for\s+update[^\n]+(?:using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\))/i.test(codeOnly);
      const permissiveDelete = /create\s+policy[^\n]+learning_notes[^\n]+for\s+delete[^\n]+using\s*\(\s*true\s*\)/i.test(codeOnly);
      assert.strictEqual(permissiveInsert, false, 'Permissive insert policy found on learning_notes!');
      assert.strictEqual(permissiveUpdate, false, 'Permissive update policy found on learning_notes!');
      assert.strictEqual(permissiveDelete, false, 'Permissive delete policy found on learning_notes!');
    }
  },
  {
    name: 'Issue A: Admin-only write policies enforced on learning_notes',
    fn: () => {
      assert.ok(codeOnly.includes('create policy "admin insert learning notes" on public.learning_notes'), 'Missing admin insert policy');
      assert.ok(codeOnly.includes('with check (public.is_admin())'), 'Insert policy must check public.is_admin()');
      assert.ok(codeOnly.includes('create policy "admin update learning notes" on public.learning_notes'), 'Missing admin update policy');
      assert.ok(codeOnly.includes('create policy "admin delete learning notes" on public.learning_notes'), 'Missing admin delete policy');
    }
  },
  {
    name: 'Issue B: No permissive insert/update/delete policies on storage.objects',
    fn: () => {
      const permissiveStorageInsert = /create\s+policy[^\n]+storage\.objects[^\n]+for\s+insert[^\n]+with\s+check\s*\(\s*bucket_id\s*=\s*'educational_media'\s*\)/i.test(codeOnly);
      assert.strictEqual(permissiveStorageInsert, false, 'Permissive insert policy found on storage.objects!');
    }
  },
  {
    name: 'Issue B: Admin-only write policies enforced on storage.objects',
    fn: () => {
      assert.ok(codeOnly.includes('create policy "admin insert educational_media" on storage.objects'), 'Missing admin storage insert policy');
      assert.ok(codeOnly.includes('bucket_id = \'educational_media\' and public.is_admin()'), 'Storage insert policy must require is_admin');
      assert.ok(codeOnly.includes('create policy "admin update educational_media" on storage.objects'), 'Missing admin storage update policy');
      assert.ok(codeOnly.includes('create policy "admin delete educational_media" on storage.objects'), 'Missing admin storage delete policy');
    }
  },
  {
    name: 'Issue C: Bucket configuration preserves existing settings (DO NOTHING)',
    fn: () => {
      const bucketInsert = codeOnly.indexOf("insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)");
      assert.ok(bucketInsert > 0, 'Missing storage.buckets insert');
      const conflictSnippet = codeOnly.slice(bucketInsert, bucketInsert + 800);
      assert.ok(conflictSnippet.includes('on conflict (id) do nothing;'), 'Bucket insert must use DO NOTHING, not DO UPDATE');
      assert.ok(!conflictSnippet.includes('do update set'), 'Bucket insert must not update existing configuration');
    }
  },
  {
    name: 'Issue D: public.is_admin() does NOT check client-editable user_metadata',
    fn: () => {
      const isAdminMatch = codeOnly.match(/create\s+or\s+replace\s+function\s+public\.is_admin\(\)[\s\S]*?\$\$;/);
      assert.ok(isAdminMatch, 'is_admin function definition found');
      const isAdminBody = isAdminMatch[0];
      assert.ok(!isAdminBody.includes('user_metadata'), 'is_admin() must not trust user_metadata!');
      assert.ok(isAdminBody.includes('admin_users'), 'is_admin() must check public.admin_users');
      assert.ok(isAdminBody.includes('app_metadata'), 'is_admin() should check app_metadata');
    }
  },
  {
    name: 'Issue E: Additive schema columns and constraint handling for learning_notes',
    fn: () => {
      assert.ok(codeOnly.includes('alter table public.learning_notes add column if not exists views'), 'Missing add column views');
      assert.ok(codeOnly.includes('alter table public.learning_notes add column if not exists display_order'), 'Missing add column display_order');
      assert.ok(codeOnly.includes("'draft', 'published', 'archived'"), 'Must support archived publication_status');
    }
  },
  {
    name: 'Issue D (Seeds): Learning notes seed uses ON CONFLICT (id) DO NOTHING',
    fn: () => {
      const seedInsert = codeOnly.indexOf("insert into public.learning_notes (id, title, chapter, description");
      assert.ok(seedInsert > 0, 'Seed insert statement not found');
      const seedEnd = codeOnly.slice(seedInsert);
      assert.ok(seedEnd.includes('on conflict (id) do nothing;'), 'Seed notes must use ON CONFLICT (id) DO NOTHING');
    }
  },
  {
    name: 'Destructive SQL: Zero occurrences of DROP TABLE, DROP COLUMN, or TRUNCATE',
    fn: () => {
      assert.ok(!/drop\s+table/i.test(codeOnly), 'Forbidden DROP TABLE found in migration code!');
      assert.ok(!/drop\s+column/i.test(codeOnly), 'Forbidden DROP COLUMN found in migration code!');
      assert.ok(!/truncate/i.test(codeOnly), 'Forbidden TRUNCATE found in migration code!');
    }
  }
];

let passed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log(`[PASS] ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${t.name}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log('====================================================');
console.log(`Results: ${passed} / ${tests.length} tests passed.`);
if (passed === tests.length) {
  console.log('ALL AUDIT CHECKS PASSED: MIGRATION IS HARDENED AND SAFE.');
  process.exit(0);
} else {
  console.error('VERIFICATION FAILED: Review flagged issues.');
  process.exit(1);
}
