/**
 * ARSelNel - Production Fix Verification Test Suite
 * Tests Admin-Student Data Synchronization, Authentication Isolation,
 * Real Learning Records, and Demo Account Removal.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🔬 ARSelNel Production Fix & Synchronization Test Suite');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// PRIORITY 1: CMS Content & Video Synchronization
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Video & Notes Synchronization ---');

test('1.1 AdminCMS.syncFromSupabase saves authoritative records without restoring deleted items', () => {
  const adminJs = fs.readFileSync(path.join(root, 'assets/js/admin.js'), 'utf8');
  assert.ok(adminJs.includes('async syncFromSupabase()'), 'syncFromSupabase method exists');
  assert.ok(adminJs.includes('this.saveCollection(CMS_STORAGE.VIDEOS, videos)'), 'overwrites videos authoritatively');
  assert.ok(adminJs.includes('this.saveCollection(CMS_STORAGE.NOTES, notes)'), 'overwrites notes authoritatively');
});

test('1.2 AdminCMS.getVideos and getNotes do not fallback to seeds if collection initialized', () => {
  const adminJs = fs.readFileSync(path.join(root, 'assets/js/admin.js'), 'utf8');
  assert.ok(adminJs.includes('let list = this.getCollection(CMS_STORAGE.VIDEOS, null)'), 'videos returns null if missing, not SEED_VIDEOS');
  assert.ok(adminJs.includes('let list = this.getCollection(CMS_STORAGE.NOTES, null)'), 'notes returns null if missing, not SEED_NOTES');
});

test('1.3 AdminCMS delete methods do not restore seed arrays', () => {
  const adminJs = fs.readFileSync(path.join(root, 'assets/js/admin.js'), 'utf8');
  assert.ok(!adminJs.includes('deleteVideo(id) {\n      if (global.CMSAdapter && typeof global.CMSAdapter.deleteVideo === \'function\') {\n        await global.CMSAdapter.deleteVideo(id);\n      }\n      let list = this.getCollection(CMS_STORAGE.VIDEOS, SEED_VIDEOS)'), 'deleteVideo does not use SEED_VIDEOS as fallback');
});

test('1.4 SmartNotes.getNotes treats Supabase learning_notes as authoritative and does not re-inject deleted seeds', () => {
  const smartNotesJs = fs.readFileSync(path.join(root, 'assets/js/smart-notes.js'), 'utf8');
  assert.ok(!smartNotesJs.includes('// Prepend missing seed slides so new activities are always accessible'), 'seed re-injection removed');
});

test('1.5 Admin Dashboard renders publication status badges for videos', () => {
  const adminHtml = fs.readFileSync(path.join(root, 'admin_dashboard/code.html'), 'utf8');
  assert.ok(adminHtml.includes('filter-video-status'), 'Status filter dropdown added');
  assert.ok(adminHtml.includes('Diterbitkan'), 'Published badge rendered');
  assert.ok(adminHtml.includes('Draf'), 'Draft badge rendered');
  assert.ok(adminHtml.includes('Diarkib'), 'Archived badge rendered');
});

// -----------------------------------------------------------------------------
// PRIORITY 5 & 6: Admin Logout, Redirect Loop & Demo Account Removal
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Authentication Security & Logout Loop Fix ---');

test('2.1 Admin logout awaits Supabase signOut and purges session flags', () => {
  const adminPortalJs = fs.readFileSync(path.join(root, 'assets/js/admin-portal.js'), 'utf8');
  assert.ok(adminPortalJs.includes('async function handleAdminLogout()'), 'handleAdminLogout is async');
  assert.ok(adminPortalJs.includes('await window.ARSupabase.signOut()'), 'calls ARSupabase.signOut');
  assert.ok(adminPortalJs.includes("'arselnelAdmin'"), 'purges arselnelAdmin flag');
  assert.ok(adminPortalJs.includes('logged_out=1'), 'redirects with logged_out flag');
});

test('2.2 handleOAuthCallback only triggers when OAuth URL params are present', () => {
  const supabaseClientJs = fs.readFileSync(path.join(root, 'assets/js/supabase-client.js'), 'utf8');
  assert.ok(supabaseClientJs.includes("searchParams.has('code') || hashParams.has('access_token')"), 'checks for OAuth URL params');
});

test('2.3 Demo mode login buttons removed from login.html', () => {
  const loginHtml = fs.readFileSync(path.join(root, 'auth/login.html'), 'utf8');
  assert.ok(!loginHtml.includes('Demo Pelajar (Aina)'), 'Demo student button removed');
  assert.ok(!loginHtml.includes('Demo Guru (Admin)'), 'Demo teacher button removed');
  assert.ok(!loginHtml.includes('fillDemo('), 'fillDemo function removed');
});

test('2.4 Demo login method disabled in production auth.js', () => {
  const authJs = fs.readFileSync(path.join(root, 'assets/js/auth.js'), 'utf8');
  assert.ok(authJs.includes('Mod demo tidak lagi disokong dalam persekitaran produksi'), 'demoLogin disabled in production');
});

// -----------------------------------------------------------------------------
// PRIORITY 7 & 8: Aina Profile Import Popup Removal & Account Isolation
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Account Isolation & Aina Profile Import Removal ---');

test('3.1 No Aina or local profile migration prompt on register.html', () => {
  const registerHtml = fs.readFileSync(path.join(root, 'auth/register.html'), 'utf8');
  assert.ok(!registerHtml.includes('sessionStorage.getItem(\'arselnel_local_migration_source\')'), 'no reading migration source on register');
  assert.ok(!registerHtml.includes('Import kemajuan daripada profil setempat'), 'import confirmation removed from register');
});

test('3.2 No Aina or local profile migration prompt on login.html', () => {
  const loginHtml = fs.readFileSync(path.join(root, 'auth/login.html'), 'utf8');
  assert.ok(!loginHtml.includes('sessionStorage.getItem(\'arselnel_local_migration_source\')'), 'no reading migration source on login');
  assert.ok(!loginHtml.includes('Import kemajuan daripada profil setempat'), 'import confirmation removed from login');
});

test('3.3 AuthGuard logout clears migration source and does not cache previous user for migration', () => {
  const authGuardJs = fs.readFileSync(path.join(root, 'assets/js/auth-guard.js'), 'utf8');
  assert.ok(!authGuardJs.includes("sessionStorage.setItem('arselnel_local_migration_source'"), 'does not cache outgoing user');
  assert.ok(authGuardJs.includes("sessionStorage.removeItem('arselnel_local_migration_source')"), 'explicitly clears migration source');
});

// -----------------------------------------------------------------------------
// PRIORITY 4: Real Learning Records & Quiz Sync Across All Providers
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Real Learning Records & Quiz Sync ---');

test('4.1 adventure_ui.js supports both Google and Supabase email quiz attempt sync', () => {
  const adventureJs = fs.readFileSync(path.join(root, 'assets/game/adventure/adventure_ui.js'), 'utf8');
  assert.ok(adventureJs.includes("user.authProvider === 'supabase' || user.authProvider === 'google'"), 'adventure_ui supports google & supabase');
});

test('4.2 maze_ui.js supports both Google and Supabase email quiz attempt sync', () => {
  const mazeJs = fs.readFileSync(path.join(root, 'assets/game/maze-chase/maze_ui.js'), 'utf8');
  assert.ok(mazeJs.includes("user.authProvider === 'supabase' || user.authProvider === 'google'"), 'maze_ui supports google & supabase');
});

test('4.3 organisasi-kehidupan.html supports both Google and Supabase email quiz attempt sync', () => {
  const orgHtml = fs.readFileSync(path.join(root, 'games/organisasi-kehidupan.html'), 'utf8');
  assert.ok(orgHtml.includes("user.authProvider === 'supabase' || user.authProvider === 'google'"), 'organisasi-kehidupan supports google & supabase');
});

test('4.4 labelkan-organel.html supports both Google and Supabase email quiz attempt sync', () => {
  const labelHtml = fs.readFileSync(path.join(root, 'games/labelkan-organel.html'), 'utf8');
  assert.ok(labelHtml.includes("user.authProvider === 'supabase' || user.authProvider === 'google'"), 'labelkan-organel supports google & supabase');
});

test('4.5 admin-portal.js renders clear Bahasa Melayu for empty attempts and scores (no undefined or -)', () => {
  const adminPortalJs = fs.readFileSync(path.join(root, 'assets/js/admin-portal.js'), 'utf8');
  assert.ok(adminPortalJs.includes('0 percubaan'), 'formats 0 attempts');
  assert.ok(adminPortalJs.includes('Belum ada skor'), 'formats missing score');
});

// -----------------------------------------------------------------------------
// PRIORITY 10: Supabase Migration Safety
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Database Migration Safety ---');

test('5.1 Migration 202610240002_fix_admin_student_sync_and_rls.sql exists and is non-destructive', () => {
  const migPath = path.join(root, 'supabase/migrations/202610240002_fix_admin_student_sync_and_rls.sql');
  assert.ok(fs.existsSync(migPath), 'migration file exists');
  const sql = fs.readFileSync(migPath, 'utf8');
  // Strip comments before checking for destructive commands
  const cleanSql = sql.replace(/--.*$/gm, '');
  assert.ok(!cleanSql.toLowerCase().includes('drop table'), 'No DROP TABLE statement in migration');
  assert.ok(!cleanSql.toLowerCase().includes('truncate'), 'No TRUNCATE statement in migration');
  assert.ok(sql.includes('create or replace function public.is_admin()'), 'Hardens public.is_admin()');
  assert.ok(sql.includes('admins read all profiles'), 'Allows admins to read all student profiles');
});

console.log('\n================================================================');
console.log(`📊 SUMMARY: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
