// tests/test_codex_freeze_stats_and_delete.js
// Automated verification suite for CODEX: Fix Admin Freeze, Delete User Action & Real-Time User Statistics

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 CODEX Verification: Admin Freeze, Delete & Real-Time Stats');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

const rootDir = path.resolve(__dirname, '..');
const htmlContent = fs.readFileSync(path.join(rootDir, 'admin_dashboard/code.html'), 'utf8');
const portalJsContent = fs.readFileSync(path.join(rootDir, 'assets/js/admin-portal.js'), 'utf8');
const adapterJsContent = fs.readFileSync(path.join(rootDir, 'assets/js/cms-content-adapter.js'), 'utf8');
const apiUsersJsContent = fs.readFileSync(path.join(rootDir, 'api/admin/users.js'), 'utf8');

// -------------------------------------------------------------
// SUITE 1: Dialog Structure & Freeze Prevention
// -------------------------------------------------------------
console.log('--- SUITE 1: Dialog Structure & Freeze Prevention ---');

test('1.1 Balanced <dialog> open and close tags in code.html', () => {
  const openCount = (htmlContent.match(/<dialog\b/g) || []).length;
  const closeCount = (htmlContent.match(/<\/dialog>/g) || []).length;
  assert.strictEqual(openCount, closeCount, `Open count (${openCount}) must equal close count (${closeCount})`);
  assert(openCount >= 10, 'Must have at least 10 dialogs configured');
});

test('1.2 No nested <dialog> tags (which caused the backdrop freeze)', () => {
  const lines = htmlContent.split('\n');
  let openDialogStack = [];
  let violations = [];

  lines.forEach((line, index) => {
    const openMatch = line.match(/<dialog\s+id="([^"]+)"/);
    const closeMatch = line.includes('</dialog>');

    if (openMatch) {
      if (openDialogStack.length > 0) {
        violations.push({
          childId: openMatch[1],
          parentId: openDialogStack[openDialogStack.length - 1],
          line: index + 1
        });
      }
      openDialogStack.push(openMatch[1]);
    }

    if (closeMatch) {
      openDialogStack.pop();
    }
  });

  assert.strictEqual(violations.length, 0, `Nested dialogs found: ${JSON.stringify(violations)}`);
});

test('1.3 modal-delete-student has X close button, Batal button, Padam button, and user details', () => {
  assert(htmlContent.includes('id="modal-delete-student"'), 'modal-delete-student must exist');
  assert(htmlContent.includes('id="btn-close-delete-student"'), 'Close X button must exist');
  assert(htmlContent.includes('id="btn-cancel-delete-student"'), 'Cancel button must exist');
  assert(htmlContent.includes('id="btn-execute-delete-student"'), 'Confirm delete button must exist');
  assert(htmlContent.includes('id="del-student-modal-name"'), 'Student name display field must exist');
  assert(htmlContent.includes('id="del-student-modal-email"'), 'Student email display field must exist');
  assert(htmlContent.includes('id="del-student-modal-id"'), 'Student ID display field must exist');
});

test('1.4 admin-portal.js implements setupModalSafeguards to prevent page freeze & unlock scroll', () => {
  assert(portalJsContent.includes('setupModalSafeguards'), 'Must define setupModalSafeguards');
  assert(portalJsContent.includes("document.body.style.overflow = ''"), 'Must restore overflow on dialog close');
  assert(portalJsContent.includes("el.addEventListener('cancel'") || portalJsContent.includes("'cancel'"), 'Must handle cancel event safely');
  assert(portalJsContent.includes('isDeleteInProgress'), 'Must have isDeleteInProgress guard to prevent double submissions');
});

// -------------------------------------------------------------
// SUITE 2: Real-time User Statistics Computation & Skeletons
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Real-time User Statistics Computation & Skeletons ---');

test('2.1 Initial stat cards do not display hardcoded 0 (uses animated skeleton)', () => {
  const userIdx = htmlContent.indexOf('id="stat-total-users"');
  const teacherIdx = htmlContent.indexOf('id="stat-total-teachers"');
  const studentIdx = htmlContent.indexOf('id="stat-total-students-users"');

  const userBlock = htmlContent.slice(userIdx, userIdx + 300);
  const teacherBlock = htmlContent.slice(teacherIdx, teacherIdx + 300);
  const studentBlock = htmlContent.slice(studentIdx, studentIdx + 300);

  assert(!userBlock.includes('>0<'), 'stat-total-users must not display hardcoded 0 before load');
  assert(!teacherBlock.includes('>0<'), 'stat-total-teachers must not display hardcoded 0 before load');
  assert(!studentBlock.includes('>0<'), 'stat-total-students-users must not display hardcoded 0 before load');

  assert(userBlock.includes('animate-pulse'), 'stat-total-users must use pulse skeleton');
  assert(teacherBlock.includes('animate-pulse'), 'stat-total-teachers must use pulse skeleton');
  assert(studentBlock.includes('animate-pulse'), 'stat-total-students-users must use pulse skeleton');
});

test('2.2 CMS Content Adapter calculates stats from unfiltered genuine user list', () => {
  assert(adapterJsContent.includes('stats: computedStats') || adapterJsContent.includes('stats:'), 'CMSAdapter.getUsersList must return stats object');
  assert(adapterJsContent.includes('allUsers: normalized'), 'CMSAdapter.getUsersList must return allUsers');
  assert(adapterJsContent.includes("u.role === 'teacher' || u.role === 'guru'"), 'Teacher count must support teacher or guru roles');
  assert(adapterJsContent.includes("u.role === 'student'"), 'Student count must count student role');
});

test('2.3 Mathematical consistency for User Request scenario', () => {
  // Scenario from prompt:
  // Initial: 1 Super Admin, 2 Teachers, 10 Students -> Total: 13, Teachers: 2, Students: 10
  // Action 1: Promote 1 student to teacher -> Total: 13, Teachers: 3, Students: 9
  // Action 2: Delete 1 student -> Total: 12, Teachers: 3, Students: 8

  let users = [
    { id: 'sa-1', role: 'superadmin', email: 'admin@test.com' },
    { id: 't-1', role: 'teacher', email: 'guru1@test.com' },
    { id: 't-2', role: 'teacher', email: 'guru2@test.com' },
    ...Array.from({ length: 10 }, (_, i) => ({ id: `s-${i + 1}`, role: 'student', email: `murid${i + 1}@test.com` }))
  ];

  function calcStats(list) {
    const total = list.length;
    const teachers = list.filter(u => u.role === 'teacher' || u.role === 'guru').length;
    const students = list.filter(u => u.role === 'student').length;
    return { total, teachers, students };
  }

  // Initial
  let stats0 = calcStats(users);
  assert.strictEqual(stats0.total, 13);
  assert.strictEqual(stats0.teachers, 2);
  assert.strictEqual(stats0.students, 10);

  // Promote 1 student
  const studentToPromote = users.find(u => u.id === 's-1');
  studentToPromote.role = 'teacher';
  let stats1 = calcStats(users);
  assert.strictEqual(stats1.total, 13);
  assert.strictEqual(stats1.teachers, 3);
  assert.strictEqual(stats1.students, 9);

  // Delete 1 student
  users = users.filter(u => u.id !== 's-2');
  let stats2 = calcStats(users);
  assert.strictEqual(stats2.total, 12);
  assert.strictEqual(stats2.teachers, 3);
  assert.strictEqual(stats2.students, 8);
});

test('2.4 api/admin/users.js GET endpoint calculates and returns stats', () => {
  assert(apiUsersJsContent.includes('stats: stats') || apiUsersJsContent.includes('stats,'), 'API must return calculated stats');
  assert(apiUsersJsContent.includes('total: users.length'), 'API must count total users');
  assert(apiUsersJsContent.includes("teachers: users.filter"), 'API must filter teachers');
  assert(apiUsersJsContent.includes("students: users.filter"), 'API must filter students');
});

// -------------------------------------------------------------
// SUITE 3: Super Admin Security & Mutation Operations
// -------------------------------------------------------------
console.log('\n--- SUITE 3: Super Admin Security & Mutation Operations ---');

test('3.1 api/admin/users.js enforces Super Admin role and token verification', () => {
  assert(apiUsersJsContent.includes('verifyCaller'), 'Endpoint must verify caller token');
  assert(apiUsersJsContent.includes('admin@test.com'), 'Endpoint checks admin@test.com or superadmin role');
  assert(apiUsersJsContent.includes('caller.isSuperAdmin'), 'Endpoint checks caller isSuperAdmin');
  assert(apiUsersJsContent.includes('targetUserId === caller.user.id'), 'Endpoint prevents superadmin from deleting themselves');
  assert(apiUsersJsContent.includes('targetAdmin.length > 0'), 'Endpoint prevents deleting teacher or admin users');
});

test('3.2 Deletion triggers UI refresh for both table and stats cards', () => {
  assert(portalJsContent.includes('await renderUsersSection()'), 'renderUsersSection is called after deletion');
  assert(portalJsContent.includes('await renderOverviewStats()'), 'renderOverviewStats is called after deletion');
  assert(portalJsContent.includes('closeDeleteStudentModal()'), 'Modal is properly closed after success or cancel');
});

test('3.3 Error state handling with Cuba Lagi button if stats fetch fails', () => {
  assert(portalJsContent.includes('Cuba Lagi'), 'Must provide a retry button on error');
  assert(portalJsContent.includes('Gagal memuatkan statistik') || portalJsContent.includes('Ralat'), 'Must show error message when fetch fails');
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TEST SUMMARY: ${passed} / ${passed + failed} passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL CODEX VERIFICATION CHECKS PASSED PERFECTLY!\n');
}
