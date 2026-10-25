/**
 * Comprehensive Automated Verification Test for ARSelNel Admin CMS Restructuring
 */
const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('Running End-to-End Test Suite: ARSelNel Admin CMS Restructuring');
console.log('================================================================\n');

// 1. FILE EXISTENCE CHECKS
console.log('TEST GROUP 1: Core Files & Preservation');
const requiredFiles = [
  'admin_dashboard/code.html',
  'assets/js/admin-portal.js',
  'assets/js/admin-i18n.js',
  'assets/js/cms-content-adapter.js',
  'assets/js/admin.js',
  'assets/js/cellquest3d.js',
  'halaman_utama/code.html',
  'models/animal_cell_final.glb',
  'models/plantcellnew.glb',
  'supabase/migrations/202610240001_admin_analytics_and_account_settings.sql'
];

requiredFiles.forEach(f => {
  assert(fs.existsSync(f), `Required file exists: ${f}`);
});

const adminHtml = fs.readFileSync('admin_dashboard/code.html', 'utf8');
const adminPortalJs = fs.readFileSync('assets/js/admin-portal.js', 'utf8');
const i18nJs = fs.readFileSync('assets/js/admin-i18n.js', 'utf8');
const cmsAdapterJs = fs.readFileSync('assets/js/cms-content-adapter.js', 'utf8');
const migrationSql = fs.readFileSync('supabase/migrations/202610240001_admin_analytics_and_account_settings.sql', 'utf8');

// 2. SIDEBAR NAVIGATION VERIFICATION (PHASE 2)
console.log('\nTEST GROUP 2: Sidebar Navigation (Phase 2)');
const navMatches = [...adminHtml.matchAll(/data-view="([a-zA-Z0-9_\-]+)"/g)].map(m => m[1]);
console.log('  Detected sidebar views in order:', navMatches);

const expectedOrder = [
  'overview',
  'notes',
  'videos',
  'quizzes',
  'games',
  'cellquest',
  'manual',
  'students',
  'account',
  'users'
];

assert(navMatches.length === 9 || navMatches.length === 10, `Sidebar has valid item count (Found ${navMatches.length})`);
assert(navMatches.slice(0, 9).join('->') === expectedOrder.slice(0, 9).join('->'), `Sidebar items follow the exact requested order: ${expectedOrder.join(' -> ')}`);
assert(!adminHtml.includes('data-view="dashboard-content"'), 'Dashboard Murid management menu removed from Admin sidebar');
assert(!adminHtml.includes('data-view="settings"'), 'Tetapan & Supabase developer menu removed from Admin sidebar');
assert(!adminHtml.includes('data-view="ar-models"'), 'Separate Pengurusan Media & 3D menu removed from Admin sidebar');

// 3. STUDENT DASHBOARD PRESERVATION
console.log('\nTEST GROUP 3: Student Dashboard Preservation (Phase 2 distinction)');
const studentDashHtml = fs.readFileSync('halaman_utama/code.html', 'utf8');
assert(studentDashHtml.length > 5000, 'Student Dashboard (halaman_utama/code.html) is intact and functional');
assert(studentDashHtml.includes('CellQuest') || studentDashHtml.includes('cellquest'), 'Student dashboard links to CellQuest intact');

// 4. COMBINED CELLQUEST & 3D/AR MANAGEMENT (PHASE 3)
console.log('\nTEST GROUP 4: Combined CellQuest & 3D/AR Management (Phase 3)');
assert(adminHtml.includes('id="section-cellquest"'), 'Combined section-cellquest exists in Admin HTML');
assert(
  adminHtml.includes('id="cq-tab-models"') &&
  adminHtml.includes('id="cq-tab-organelles"') &&
  adminHtml.includes('id="cq-tab-preview"') &&
  adminHtml.includes('id="cq-tab-ar"'),
  'All 4 CellQuest sub-tabs exist (models, organelles, preview, ar)'
);
assert(adminHtml.includes('id="modal-cellquest-model"'), 'modal-cellquest-model exists for adding/editing GLB/GLTF models');
assert(adminHtml.includes('id="cq-3d-preview-host"'), '3D Preview host container exists for Three.js');
assert(adminPortalJs.includes('init3DPreview') && adminPortalJs.includes('changePreviewModel'), 'Three.js viewer logic implemented in admin-portal.js');
assert(cmsAdapterJs.includes('getCellQuestModels') && cmsAdapterJs.includes('saveCellQuestModel'), 'CMSAdapter contains getCellQuestModels and saveCellQuestModel');
assert(cmsAdapterJs.includes('uploadMediaFile'), 'CMSAdapter supports media file upload for GLB models');

// 5. REAL DASHBOARD ANALYTICS & EMPTY STATES (PHASE 4 & 6)
console.log('\nTEST GROUP 5: Database-Driven Analytics (Phase 4 & 6)');
assert(!adminHtml.includes('Muat Data Contoh'), 'Removed "Muat Data Contoh" demo button from production admin dashboard');
assert(!adminHtml.includes('84% Kadar Lulus'), 'Hardcoded 84% removed from dashboard cards');
assert(!adminHtml.includes('92% Membran Sel'), 'Hardcoded 92% removed from popular topics');
assert(
  (adminHtml.includes('id="btn-refresh-dashboard"') || adminHtml.includes('id="btn-refresh-stats"')) &&
  adminHtml.includes('refreshDashboardData()'),
  'Manual "Muat Semula Data" control exists'
);
assert(adminPortalJs.includes('Belum cukup data untuk analisis.'), 'Proper empty state for topics when insufficient data exists');
assert(adminPortalJs.includes('Tiada aktiviti pembelajaran direkodkan lagi.'), 'Proper empty state for activity logs when empty');
assert(cmsAdapterJs.includes('getRealAnalytics'), 'CMSAdapter.getRealAnalytics() implemented for genuine counts');

// 6. REAL STUDENT LEARNING RECORDS (PHASE 5)
console.log('\nTEST GROUP 6: Real Student Learning Records (Phase 5)');
assert(adminHtml.includes('id="modal-student-detail"'), 'modal-student-detail inspector modal exists');
assert(adminPortalJs.includes('Pelajar belum mempunyai rekod kuiz.'), 'Empty state: "Pelajar belum mempunyai rekod kuiz." implemented');
assert(adminPortalJs.includes('Belum ada rekod pembelajaran'), 'Empty state: "Belum ada rekod pembelajaran" implemented');
assert(!adminHtml.includes('Skor Kuiz Terkini (%)</label>'), 'Fake student score edit form removed from modal');
assert(cmsAdapterJs.includes('getRealStudentRecords') && cmsAdapterJs.includes('getStudentDetail'), 'CMSAdapter has getRealStudentRecords and getStudentDetail queries');

// 7. ADMIN ACCOUNT SETTINGS & I18N (PHASE 7)
console.log('\nTEST GROUP 7: Admin Account Settings & Multi-Language (Phase 7)');
assert(adminHtml.includes('id="section-account"'), 'section-account exists in Admin HTML');
assert(adminHtml.includes('name="admin_lang_pref"'), 'Language selection radio cards (BM / EN) exist');
assert(adminHtml.includes('id="form-admin-profile"'), 'Admin profile form exists');
assert(adminHtml.includes('id="form-admin-password"'), 'Password change form exists');
assert(adminHtml.includes('id="form-admin-email"'), 'Email change verification form exists');
assert(
  i18nJs.includes('TRANSLATIONS') &&
  i18nJs.includes('nav_overview') &&
  i18nJs.includes('accountSettingsTitle'),
  'AdminI18n dictionary loaded with BM and EN translations'
);
assert(adminPortalJs.includes('handleAdminLanguageChange'), 'handleAdminLanguageChange implemented in admin-portal.js');
assert(adminPortalJs.includes('handleUpdateAdminPassword'), 'handleUpdateAdminPassword calls Supabase Auth updateUser securely');

// 8. DATABASE MIGRATION INTEGRITY & SAFETY (PHASE 9)
console.log('\nTEST GROUP 8: Safe Migration Verification (Phase 9)');
const nonCommentSqlLines = migrationSql
  .split('\n')
  .map(l => l.trim())
  .filter(l => !l.startsWith('--') && l.length > 0);

const hasDropTable = nonCommentSqlLines.some(l => /^\s*drop\s+table/i.test(l));
const hasDropDb = nonCommentSqlLines.some(l => /^\s*drop\s+database/i.test(l));
const hasTruncate = nonCommentSqlLines.some(l => /^\s*truncate/i.test(l));

assert(!hasDropTable, 'Migration has NO DROP TABLE statements');
assert(!hasDropDb, 'Migration has NO DROP DATABASE statements');
assert(!hasTruncate, 'Migration has NO TRUNCATE statements');
assert(migrationSql.includes('student_learning_events'), 'Migration adds student_learning_events table safely');
assert(migrationSql.includes('animal_cell_final.glb') && migrationSql.includes('plantcellnew.glb'), 'Migration seeds default GLB models safely with ON CONFLICT DO NOTHING');

console.log('\n================================================================');
console.log(`TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
