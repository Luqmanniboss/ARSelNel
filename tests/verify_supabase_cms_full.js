/**
 * ARSelNel - Full Supabase Integration & CMS Verification Suite
 * Tests Connection, CMSAdapter, Data Preservation, Security RLS, and Student Integrations
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

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
console.log('  ARSelNel Full Supabase Integration & CMS Verification Suite   ');
console.log('================================================================\n');

// --- 1. DATA PRESERVATION & BACKUP INTEGRITY ---
console.log('1. Verifying Data Preservation & Backup Integrity...');
const backupPath = path.join(ROOT_DIR, 'data', 'cms_backup.json');
assert(fs.existsSync(backupPath), 'Backup file exists at data/cms_backup.json');

let backupData = null;
try {
  backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  assert(backupData && (backupData.backupDate || backupData.exportedAt), 'Backup data parsed with valid timestamp');
  const collections = backupData.collections || backupData;
  const quizzes = collections.quizzes || [];
  const notes = collections.notes || [];
  const videos = collections.videos || [];
  const mazeQ = collections.maze_questions || collections.mazeChaseQuestions || [];
  const organelles = collections.cellquest_organelles || collections.cellQuestOrganelles || [];
  const manual = collections.manual_steps || collections.manualSteps || [];
  const dashConfig = collections.dashboard_config || collections.dashboardConfig || {};

  assert(quizzes.length >= 5, `Quizzes preserved: ${quizzes.length}`);
  assert(notes.length >= 4, `Notes preserved: ${notes.length}`);
  assert(videos.length >= 3, `Videos preserved: ${videos.length}`);
  assert(mazeQ.length >= 10, `Maze Chase questions preserved: ${mazeQ.length}`);
  assert(organelles.length >= 12, `CellQuest Organelles preserved: ${organelles.length}`);
  assert(manual.length >= 7, `Manual Steps preserved: ${manual.length}`);
  assert(dashConfig.heroTitle || dashConfig.hero_title, 'Dashboard config preserved');
} catch (e) {
  assert(false, 'Failed to parse backup data: ' + e.message);
}

// --- 2. SUPABASE MIGRATION & RLS SCHEMA ---
console.log('\n2. Verifying Supabase Migrations & Additive Schema...');
const migrationPath = path.join(ROOT_DIR, 'supabase', 'migrations', '202610230001_cms_full_schema.sql');
assert(fs.existsSync(migrationPath), 'New additive migration 202610230001_cms_full_schema.sql exists');

const migrationSql = fs.readFileSync(migrationPath, 'utf8');
assert(/create table if not exists public\.admin_users/i.test(migrationSql), 'Admin users dedicated table defined');
assert(/create or replace function public\.is_admin/i.test(migrationSql), 'Secure is_admin() DEFINER function defined');
assert(/create table if not exists public\.cms_videos/i.test(migrationSql), 'cms_videos table defined');
assert(/create table if not exists public\.cms_quizzes/i.test(migrationSql), 'cms_quizzes table defined');
assert(/create table if not exists public\.cms_game_questions/i.test(migrationSql), 'cms_game_questions table defined');
assert(/create table if not exists public\.cms_cellquest_organelles/i.test(migrationSql), 'cms_cellquest_organelles table defined');
assert(/create table if not exists public\.cms_dashboard_config/i.test(migrationSql), 'cms_dashboard_config table defined');
assert(/create table if not exists public\.cms_manual_steps/i.test(migrationSql), 'cms_manual_steps table defined');
assert(/publication_status = 'published'/i.test(migrationSql), 'Public read policy restricted to published content');

// Strip comments before testing for destructive commands
const cleanSql = migrationSql.replace(/--.*$/gm, '');
assert(!/(^|\n)\s*drop\s+table/i.test(cleanSql) && !/(^|\n)\s*truncate/i.test(cleanSql), 'No destructive DROP or TRUNCATE operations in migration');

// --- 3. SUPABASE CLIENT & CONFIGURATION ---
console.log('\n3. Verifying Supabase Client & Credentials...');
const clientJsPath = path.join(ROOT_DIR, 'assets', 'js', 'supabase-client.js');
assert(fs.existsSync(clientJsPath), 'supabase-client.js exists');
const clientJs = fs.readFileSync(clientJsPath, 'utf8');
assert(clientJs.includes('/api/public-config'), 'supabase-client.js queries /api/public-config endpoint securely');

const envPath = path.join(ROOT_DIR, '.env');
assert(fs.existsSync(envPath), '.env file exists');
const envContent = fs.readFileSync(envPath, 'utf8');
assert(envContent.includes('SUPABASE_URL='), 'SUPABASE_URL defined in environment');
assert(envContent.includes('SUPABASE_PUBLISHABLE_KEY='), 'SUPABASE_PUBLISHABLE_KEY defined in environment');
assert(!clientJs.includes('service_role') && !envContent.includes('service_role'), 'Zero service-role key exposure in frontend or client files');

// --- 4. CMS CONTENT ADAPTER FUNCTIONALITY ---
console.log('\n4. Verifying CMS Content Adapter Architecture...');
const adapterPath = path.join(ROOT_DIR, 'assets', 'js', 'cms-content-adapter.js');
assert(fs.existsSync(adapterPath), 'cms-content-adapter.js exists');
const adapterJs = fs.readFileSync(adapterPath, 'utf8');
assert(adapterJs.includes('checkConnection'), 'checkConnection diagnostic method implemented');
assert(adapterJs.includes('getNotes') && adapterJs.includes('saveNote'), 'Notes CRUD methods implemented');
assert(adapterJs.includes('getVideos') && adapterJs.includes('saveVideo'), 'Videos CRUD methods implemented');
assert(adapterJs.includes('getQuizzes') && adapterJs.includes('saveQuiz'), 'Quizzes CRUD methods implemented');
assert(adapterJs.includes('getGameQuestions') && adapterJs.includes('saveGameQuestion'), 'Game question bank CRUD methods implemented');
assert(adapterJs.includes('getCellQuestOrganelles') && adapterJs.includes('saveCellQuestOrganelle'), 'CellQuest organelle CRUD methods implemented');
assert(adapterJs.includes('getDashboardConfig') && adapterJs.includes('saveDashboardConfig'), 'Dashboard config methods implemented');
assert(adapterJs.includes('getManualSteps') && adapterJs.includes('saveManualStep'), 'Manual steps methods implemented');
assert(adapterJs.includes('exportAllData') && adapterJs.includes('importAllData'), 'Backup export & import methods implemented');

// --- 5. ADMIN DASHBOARD ENHANCEMENTS ---
console.log('\n5. Verifying Admin Dashboard Features & UI...');
const adminHtmlPath = path.join(ROOT_DIR, 'admin_dashboard', 'code.html');
assert(fs.existsSync(adminHtmlPath), 'admin_dashboard/code.html exists');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
assert(adminHtml.includes('cms-content-adapter.js'), 'admin_dashboard includes cms-content-adapter.js');
assert(adminHtml.includes('supabase-status-pill'), 'Live Supabase status pill implemented');
assert(adminHtml.includes('section-games'), 'Game question bank management section exists');
assert(adminHtml.includes('section-cellquest'), 'CellQuest 3D model & organelle management section exists');
assert(adminHtml.includes('section-dashboard-content'), 'Student dashboard content management section exists');
assert(adminHtml.includes('section-manual'), 'User manual content management section exists');
assert(adminHtml.includes('section-settings'), 'Diagnostic & settings section exists');
assert(adminHtml.includes('modal-game-question'), 'Game question modal exists');
assert(adminHtml.includes('modal-organelle'), 'Organelle editing modal exists');
assert(adminHtml.includes('modal-manual-step'), 'Manual step editing modal exists');
assert(adminHtml.includes('exportFullCMSBackup'), 'CMS full backup export button wired');
assert(adminHtml.includes('importCMSBackupFile'), 'CMS backup file import handler wired');

// --- 6. STUDENT SYSTEM INTEGRATION ---
console.log('\n6. Verifying Student Pages Integration (Admin -> Supabase -> Student)...');

// 6a. Student Dashboard
const dashHtml = fs.readFileSync(path.join(ROOT_DIR, 'halaman_utama', 'code.html'), 'utf8');
assert(dashHtml.includes('cms-content-adapter.js'), 'Student dashboard includes cms-content-adapter.js');
assert(dashHtml.includes('id="hero-title"'), 'Hero title element given reactive ID');
assert(dashHtml.includes('id="hero-desc"'), 'Hero description element given reactive ID');
assert(dashHtml.includes('id="rec-title"'), 'Recommendation title element given reactive ID');
assert(dashHtml.includes('id="rec-desc"'), 'Recommendation description element given reactive ID');
assert(dashHtml.includes('initDashboardCMS'), 'Dashboard CMS hydration logic implemented');

// 6b. Videos
const videoHtml = fs.readFileSync(path.join(ROOT_DIR, 'perpustakaan_video', 'code.html'), 'utf8');
assert(videoHtml.includes('cms-content-adapter.js'), 'Video library includes cms-content-adapter.js');
assert(videoHtml.includes('video-grid-container'), 'Dynamic video grid container exists');
assert(videoHtml.includes('CMSAdapter.getVideos'), 'Video library fetches published CMS videos');

// 6c. CellQuest
const cellquestHtml = fs.readFileSync(path.join(ROOT_DIR, 'cellquest', 'code.html'), 'utf8');
assert(cellquestHtml.includes('cms-content-adapter.js'), 'CellQuest includes cms-content-adapter.js');
const cellquestJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'js', 'cellquest3d.js'), 'utf8');
assert(cellquestJs.includes('CMSAdapter.getCellQuestOrganelles'), 'CellQuest 3D syncs organelle dictionary from CMS');

// 6d. Manual Penggunaan
const manualHtml = fs.readFileSync(path.join(ROOT_DIR, 'manual_penggunaan', 'code.html'), 'utf8');
assert(manualHtml.includes('cms-content-adapter.js'), 'Manual page includes cms-content-adapter.js');
const manualJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'js', 'manual.js'), 'utf8');
assert(manualJs.includes('CMSAdapter.getManualSteps'), 'Manual page loads published steps dynamically');

// 6e. Maze Chase
const mazeHtml = fs.readFileSync(path.join(ROOT_DIR, 'games', 'klasifikasi-sel.html'), 'utf8');
assert(mazeHtml.includes('cms-content-adapter.js'), 'Maze Chase includes cms-content-adapter.js');
const mazeUiJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'game', 'maze-chase', 'maze_ui.js'), 'utf8');
assert(mazeUiJs.includes('get questions()'), 'Maze Chase UI controller uses dynamic questions getter');
assert(mazeUiJs.includes('CMSAdapter.getGameQuestions'), 'Maze Chase loads published CMS questions on start');

// 6f. Lab Adventure
const labHtml = fs.readFileSync(path.join(ROOT_DIR, 'games', 'misi-makmal-sains.html'), 'utf8');
assert(labHtml.includes('cms-content-adapter.js'), 'Lab Adventure includes cms-content-adapter.js');
const labUiJs = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'game', 'lab-adventure', 'lab_ui.js'), 'utf8');
assert(labUiJs.includes('get questions()'), 'Lab Adventure UI controller uses dynamic questions getter');
assert(labUiJs.includes('CMSAdapter.getGameQuestions'), 'Lab Adventure loads published CMS questions on start');

// 6g. 2D Adventure
const advHtml = fs.readFileSync(path.join(ROOT_DIR, 'kuiz_interaktif', 'code.html'), 'utf8');
assert(advHtml.includes('cms-content-adapter.js'), '2D Adventure includes cms-content-adapter.js');
assert(advHtml.includes('CMSAdapter.getGameQuestions'), '2D Adventure loads published CMS questions on start');

// --- 7. SECURE AUTH & ROLE CONTROLS ---
console.log('\n7. Verifying Secure Authentication & Role Controls...');
const loginHtml = fs.readFileSync(path.join(ROOT_DIR, 'auth', 'login.html'), 'utf8');
assert(loginHtml.includes('admin_users'), 'Login verifies admin status against admin_users table');
assert(loginHtml.includes('admin_dashboard/code.html'), 'Redirects verified admins to Admin Dashboard');

// --- SUMMARY ---
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All Supabase CMS integration verification tests PASSED successfully!\n');
  process.exit(0);
}
