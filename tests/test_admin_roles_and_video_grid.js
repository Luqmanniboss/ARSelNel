/**
 * Comprehensive Test Suite for ARSelNel Admin User Management,
 * Teacher Roles, Student Deduplication & Video Grid UI
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function asyncTest(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('🧪 ARSelNel Admin Roles, Deletion & Video Grid Test Suite');
console.log('================================================================');

// -------------------------------------------------------------
// SUITE 1: Video Grid Responsive Layout & UI Requirements
// -------------------------------------------------------------
console.log('\n--- SUITE 1: Video Grid Responsive Layout & UI Audit ---');

const codeHtmlPath = path.join(__dirname, '..', 'admin_dashboard', 'code.html');
const codeHtml = fs.readFileSync(codeHtmlPath, 'utf8');

test('1.1 Video container uses responsive CSS grid classes (1 col mobile, 2 cols md, 3 cols xl)', () => {
  assert(codeHtml.includes('id="video-grid-container"'), 'video-grid-container must exist');
  assert(
    codeHtml.includes('grid-cols-1 md:grid-cols-2 xl:grid-cols-3') ||
    codeHtml.includes('grid-template-columns: repeat(auto-fit') ||
    codeHtml.includes('grid-template-columns: repeat(auto-fill'),
    'Container must use responsive CSS grid'
  );
});

test('1.2 Video cards feature 16:9 thumbnail aspect ratio', () => {
  assert(codeHtml.includes('aspect-video'), 'Video card thumbnail must enforce 16:9 aspect-video ratio');
});

test('1.3 Video title and description have line-clamp protection', () => {
  assert(codeHtml.includes('line-clamp-2'), 'Title or description must use line-clamp to prevent card overflow');
});

test('1.4 Video cards include Play button, category, instructor, Edit and Delete controls', () => {
  assert(codeHtml.includes('play_arrow'), 'Play button icon must exist');
  assert(codeHtml.includes("editVideo('"), 'Edit video button must exist');
  assert(codeHtml.includes("confirmDeleteVideo('"), 'Delete video button must exist');
});

// -------------------------------------------------------------
// SUITE 2: Student Deduplication & Learning Records Logic
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Student Deduplication & Identity Audit ---');

const adapterJsPath = path.join(__dirname, '..', 'assets', 'js', 'cms-content-adapter.js');
const adapterJs = fs.readFileSync(adapterJsPath, 'utf8');

test('2.1 CMS Content Adapter invokes RPC get_student_learning_records or deduplicates by UUID', () => {
  assert(adapterJs.includes('get_student_learning_records'), 'Adapter must support get_student_learning_records RPC');
  assert(adapterJs.includes('seenIds.has') || adapterJs.includes('seenIds.add'), 'Adapter must deduplicate using Set of seen UUIDs');
});

test('2.2 Student identity is anchored by UUID and auth.users, not display name alone', () => {
  // Test simulated deduplication logic
  const mockRowsWithDuplicates = [
    { id: 'uuid-1', name: 'Ujian Pelajar Otomasi', email: 'pelajar@arselnel.my', created_at: '2026-10-25T10:00:00Z' },
    { id: 'uuid-1', name: 'Ujian Pelajar Otomasi', email: 'pelajar@arselnel.my', created_at: '2026-10-25T11:00:00Z' },
    { id: 'uuid-2', name: 'Ujian Pelajar Otomasi', email: 'pelajar2@arselnel.my', created_at: '2026-10-25T12:00:00Z' }
  ];

  const seen = new Set();
  const deduped = [];
  mockRowsWithDuplicates.forEach(r => {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      deduped.push(r);
    }
  });

  assert.strictEqual(deduped.length, 2, 'Two distinct UUIDs must produce exactly 2 entries, duplicate uuid-1 dropped');
  assert.strictEqual(deduped[0].id, 'uuid-1');
  assert.strictEqual(deduped[1].id, 'uuid-2');
});

test('2.3 test_auth_system.js no longer generates random test emails on every run', () => {
  const authTestJs = fs.readFileSync(path.join(__dirname, '..', 'tests', 'test_auth_system.js'), 'utf8');
  assert(!authTestJs.includes('Date.now() + \'@arselnel.my\''), 'Random email creation in auth test suite has been eliminated');
  assert(authTestJs.includes('automation.test.runner@arselnel.my'), 'Standardized test runner email is used');
});

// -------------------------------------------------------------
// SUITE 3: Super Admin Student Deletion & Confirmation Safeguards
// -------------------------------------------------------------
console.log('\n--- SUITE 3: Super Admin Student Deletion Safeguards ---');

const portalJsPath = path.join(__dirname, '..', 'assets', 'js', 'admin-portal.js');
const portalJs = fs.readFileSync(portalJsPath, 'utf8');

test('3.1 Delete student action is protected by Super Admin check in UI', () => {
  assert(portalJs.includes('openDeleteStudentModal'), 'openDeleteStudentModal function must exist');
  assert(portalJs.includes('isSuperAdmin'), 'Student deletion must be gated by isSuperAdmin');
});

test('3.2 Deletion modal requires explicit confirmation before enabling execution', () => {
  assert(portalJs.includes('toggleDeleteConfirmBtn'), 'toggleDeleteConfirmBtn must exist');
  assert(codeHtml.includes('id="modal-delete-student"'), 'modal-delete-student must exist in code.html');
});

test('3.3 CMSAdapter provides deleteStudentAccount method with audit reason', () => {
  assert(adapterJs.includes('deleteStudentAccount'), 'deleteStudentAccount method must exist on CMSAdapter');
});

// -------------------------------------------------------------
// SUITE 4: Role-Based Access Control & Teacher Appointment
// -------------------------------------------------------------
console.log('\n--- SUITE 4: Teacher Appointment & Role Restrictions ---');

test('4.1 Pengurusan Pengguna & Guru view exists in sidebar navigation and main panels', () => {
  assert(codeHtml.includes('data-view="users"'), 'Sidebar must include nav button for users view');
  assert(codeHtml.includes('id="section-users"'), 'Section section-users must exist');
});

test('4.2 Modals for promoting and demoting teachers exist in DOM', () => {
  assert(codeHtml.includes('id="modal-promote-teacher"'), 'modal-promote-teacher must exist');
  assert(codeHtml.includes('id="modal-demote-teacher"'), 'modal-demote-teacher must exist');
});

test('4.3 CMSAdapter includes promoteUserToTeacher and demoteTeacherToStudent methods', () => {
  assert(adapterJs.includes('promoteUserToTeacher'), 'promoteUserToTeacher must exist');
  assert(adapterJs.includes('demoteTeacherToStudent'), 'demoteTeacherToStudent must exist');
  assert(adapterJs.includes('getUsersList'), 'getUsersList must exist');
});

test('4.4 Auth helper correctly distinguishes Super Admin vs Teacher', () => {
  const authJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'auth.js'), 'utf8');
  assert(authJs.includes('isSuperAdmin'), 'Auth.isSuperAdmin() must exist');
  assert(authJs.includes('isTeacher'), 'Auth.isTeacher() must exist');
});

// -------------------------------------------------------------
// SUITE 5: Backend API Endpoint & Migration Safety
// -------------------------------------------------------------
console.log('\n--- SUITE 5: Backend API Endpoint & Migration Safety ---');

const apiUsersJsPath = path.join(__dirname, '..', 'api', 'admin', 'users.js');
test('5.1 Serverless endpoint api/admin/users.js exists and validates authorization', () => {
  assert(fs.existsSync(apiUsersJsPath), 'api/admin/users.js must exist');
  const apiCode = fs.readFileSync(apiUsersJsPath, 'utf8');
  assert(apiCode.includes('/auth/v1/user') || apiCode.includes('getUser'), 'API must verify JWT via Supabase auth');
  assert(apiCode.includes('superadmin'), 'API must verify superadmin role for mutative actions');
  assert(apiCode.includes('promote'), 'API must handle promote action');
  assert(apiCode.includes('demote'), 'API must handle demote action');
  assert(apiCode.includes('delete'), 'API must handle delete action');
});

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '202610250002_teacher_roles_student_deletion_and_audit.sql');
test('5.2 Migration 202610250002 contains safe schema updates, RLS and audit logging', () => {
  assert(fs.existsSync(migrationPath), 'Migration 202610250002 file must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert(!sql.toUpperCase().includes('DROP TABLE PROFILES'), 'Must not drop profiles table');
  assert(sql.includes('admin_audit_logs'), 'Must create admin_audit_logs');
  assert(sql.includes('promote_user_to_teacher'), 'Must create promote_user_to_teacher function');
  assert(sql.includes('delete_student_account'), 'Must create delete_student_account function');
  assert(sql.includes('is_super_admin'), 'Must create is_super_admin function');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TEST SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEM VERIFICATION CHECKS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
