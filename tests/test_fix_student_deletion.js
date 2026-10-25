/**
 * CODEX Verification: Supabase Student Account Deletion Fix
 * Tests comprehensive safety, table independence, role restrictions, and anti-freeze UX.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('🧪 CODEX Verification: Supabase Student Account Deletion Fix');
console.log('================================================================\n');

// -------------------------------------------------------------
// SUITE 1: SQL Migration & Schema Defense
// -------------------------------------------------------------
console.log('--- SUITE 1: SQL Migration & Schema Defense ---');

const fixMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '202610260001_fix_student_deletion_and_learning_events.sql');
const baseMigrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '202610250002_teacher_roles_student_deletion_and_audit.sql');

runTest('1.1 Fix migration file 202610260001 exists and is non-empty', () => {
  assert(fs.existsSync(fixMigrationPath), 'Fix migration file must exist');
  const content = fs.readFileSync(fixMigrationPath, 'utf8');
  assert(content.length > 500, 'Migration file should have complete content');
});

runTest('1.2 Fix migration creates student_learning_events table safely with RLS', () => {
  const sql = fs.readFileSync(fixMigrationPath, 'utf8');
  assert(sql.includes('create table if not exists public.student_learning_events'), 'Must safely create student_learning_events');
  assert(sql.includes('alter table public.student_learning_events enable row level security'), 'Must enable RLS');
  assert(sql.includes('references auth.users(id) on delete cascade'), 'Foreign key must cascade on user deletion');
});

runTest('1.3 delete_student_account uses defensive to_regclass checks (No relation does not exist error)', () => {
  const sql = fs.readFileSync(fixMigrationPath, 'utf8');
  assert(sql.includes("to_regclass('public.student_learning_events') is not null"), 'Must check student_learning_events existence');
  assert(sql.includes("to_regclass('public.quiz_attempts') is not null"), 'Must check quiz_attempts existence');
  assert(sql.includes("to_regclass('public.learning_progress') is not null"), 'Must check learning_progress existence');
  assert(sql.includes("to_regclass('public.profiles') is not null"), 'Must check profiles existence');
  assert(sql.includes('delete from auth.users where id = p_target_user_id'), 'Must delete user from Supabase auth.users');
});

runTest('1.4 Base migration 202610250002 also updated with defensive to_regclass checks', () => {
  const sql = fs.readFileSync(baseMigrationPath, 'utf8');
  assert(sql.includes("to_regclass('public.student_learning_events') is not null"), 'Base migration must also have dynamic checks');
  assert(!sql.includes('delete from public.student_learning_events where user_id = p_target_user_id;'), 'Static delete must be replaced');
});

// -------------------------------------------------------------
// SUITE 2: Serverless API Backend Defense (api/admin/users.js)
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Serverless Backend Authorization & Fallbacks ---');

const apiPath = path.join(__dirname, '..', 'api', 'admin', 'users.js');
const apiCode = fs.readFileSync(apiPath, 'utf8');

runTest('2.1 Backend strictly gates student deletion to Super Admin', () => {
  assert(apiCode.includes('if (!caller.isSuperAdmin)'), 'Must check caller.isSuperAdmin before deletion');
  assert(apiCode.includes('targetUserId === caller.user.id'), 'Must prevent self-deletion');
});

runTest('2.2 Backend prevents deleting teachers or admin accounts', () => {
  assert(apiCode.includes('Akaun Guru atau Pentadbir tidak boleh dipadam'), 'Must reject deleting teachers or admins');
});

runTest('2.3 Backend uses Promise.allSettled for table cleanup so 404 never blocks deletion', () => {
  assert(apiCode.includes('Promise.allSettled'), 'Must use Promise.allSettled for resilient table deletion');
  assert(apiCode.includes('quiz_attempts'), 'Must clean quiz attempts');
  assert(apiCode.includes('learning_progress'), 'Must clean learning progress');
  assert(apiCode.includes('profiles'), 'Must clean profiles');
});

// -------------------------------------------------------------
// SUITE 3: Frontend Client Resilience (cms-content-adapter.js)
// -------------------------------------------------------------
console.log('\n--- SUITE 3: Frontend Client Adapter & Direct Fallback ---');

const adapterPath = path.join(__dirname, '..', 'assets', 'js', 'cms-content-adapter.js');
const adapterCode = fs.readFileSync(adapterPath, 'utf8');

runTest('3.1 deleteStudentAccount delegates to backend and falls back to RPC', () => {
  assert(adapterCode.includes('/api/admin/users'), 'Must call serverless endpoint first');
  assert(adapterCode.includes("rpc('delete_student_account'"), 'Must call RPC delete_student_account');
});

runTest('3.2 deleteStudentAccount strictly throws real database errors without disguised false success', () => {
  assert(adapterCode.includes("throw new Error(errorMsg)"), 'Must throw actual database error on failure');
  assert(!adapterCode.includes("message: 'Akaun murid dan rekod pembelajaran berjaya dipadam dari pangkalan data.'"), 'Must not return false success when error occurs');
});

// -------------------------------------------------------------
// SUITE 4: Admin Portal UI & Freeze Prevention (admin-portal.js)
// -------------------------------------------------------------
console.log('\n--- SUITE 4: UI Modal Safety, Error Handling & Zero-Freeze ---');

const portalPath = path.join(__dirname, '..', 'assets', 'js', 'admin-portal.js');
const portalCode = fs.readFileSync(portalPath, 'utf8');
const codeHtmlPath = path.join(__dirname, '..', 'admin_dashboard', 'code.html');
const codeHtml = fs.readFileSync(codeHtmlPath, 'utf8');

runTest('4.1 executeDeleteStudent uses finally block to guarantee isDeleteInProgress is reset', () => {
  assert(portalCode.includes('finally {'), 'executeDeleteStudent must have finally block');
  assert(portalCode.includes('isDeleteInProgress = false;'), 'Finally block must reset isDeleteInProgress');
  assert(portalCode.includes('executeBtn.disabled = false'), 'Finally block must re-enable button on error');
});

runTest('4.2 closeDeleteStudentModal supports force closing on cancel and close button', () => {
  assert(portalCode.includes('function closeDeleteStudentModal(force = false)'), 'Must support force close');
  assert(codeHtml.includes('closeDeleteStudentModal(true)'), 'HTML buttons must call close with force true');
});

runTest('4.3 Synchronized data refresh triggered after successful deletion', () => {
  assert(portalCode.includes('renderStudents'), 'Must refresh students learning records');
  assert(portalCode.includes('renderUsersSection'), 'Must refresh user management table');
  assert(portalCode.includes('renderOverviewStats'), 'Must refresh top-level dashboard metrics');
});

runTest('4.4 Specific student details (Name, Email, UUID) displayed in confirmation modal', () => {
  assert(codeHtml.includes('id="del-student-modal-name"'), 'Modal must have student name target');
  assert(codeHtml.includes('id="del-student-modal-email"'), 'Modal must have student email target');
  assert(codeHtml.includes('id="del-student-modal-id"'), 'Modal must have student ID target');
  assert(portalCode.includes("del-student-modal-id"), 'Modal populates unique UUID');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TEST SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL SUPABASE STUDENT ACCOUNT DELETION TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
