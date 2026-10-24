/**
 * Automated Verification Test for ARSelNel CODEX:
 * 1. Distinct Leaderboards for Each Quiz & Game
 * 2. Fair Ranking System (Best Score per Student + Tie Breaker Hierarchy)
 * 3. Question & Answer Snapshots Storage
 * 4. Score Unclamping (1000 pts preserved)
 * 5. UI Elements on Results Page (No "Ulang Kaji Nota", "Semak Jawapan Saya" present)
 * 6. Admin Learning Records Integration
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting ARSelNel Leaderboard & Results Verification...\n');

// 1. Verify File Structure & UI Content
console.log('--- TEST 1: Inspecting UI Files & Requirements ---');
const resultsHtmlPath = path.join(__dirname, '..', 'keputusan_permainan', 'code.html');
const resultsHtml = fs.readFileSync(resultsHtmlPath, 'utf8');

// Check 1.1: Button "Ulang Kaji Nota" must be completely removed
assert.ok(!resultsHtml.includes('Ulang Kaji Nota'), '❌ FAIL: "Ulang Kaji Nota" must NOT be in keputusan_permainan/code.html');
console.log('  ✅ PASSED: "Ulang Kaji Nota" button successfully removed.');

// Check 1.2: "Semak Jawapan Saya" button must exist
assert.ok(resultsHtml.includes('Semak Jawapan Saya'), '❌ FAIL: "Semak Jawapan Saya" must exist in keputusan_permainan/code.html');
console.log('  ✅ PASSED: "Semak Jawapan Saya" button is present.');

// Check 1.3: Game selector tabs/pills must exist
assert.ok(resultsHtml.includes('data-game="maze_2d"'), '❌ FAIL: Maze 2D selector missing');
assert.ok(resultsHtml.includes('data-game="misi_makmal"'), '❌ FAIL: Misi Makmal selector missing');
assert.ok(resultsHtml.includes('data-game="labelkan_organel"'), '❌ FAIL: Labelkan Organel selector missing');
assert.ok(resultsHtml.includes('data-game="organisasi_sel"'), '❌ FAIL: Organisasi Sel selector missing');
assert.ok(resultsHtml.includes('data-game="kuiz_saintis_muda"'), '❌ FAIL: Kuiz Saintis Muda selector missing');
console.log('  ✅ PASSED: All 5 game selector tabs are present in Leaderboard UI.');

// Check 1.4: Top 3 Podium structure must exist
assert.ok(resultsHtml.includes('podium-container'), '❌ FAIL: Podium container missing');
assert.ok(resultsHtml.includes('podium-first') && resultsHtml.includes('podium-second') && resultsHtml.includes('podium-third'), '❌ FAIL: Podium slots missing');
console.log('  ✅ PASSED: Top 3 Podium layout is present.');

// Check 1.5: "Kedudukan Saya" card must exist
assert.ok(resultsHtml.includes('my-standing-card') && resultsHtml.includes('Kedudukan Saya'), '❌ FAIL: "Kedudukan Saya" card missing');
console.log('  ✅ PASSED: "Kedudukan Saya" card is present.');

// Check 1.6: Review filters must exist
assert.ok(resultsHtml.includes('filterReviewCards(\'all\')') && resultsHtml.includes('filterReviewCards(\'correct\')') && resultsHtml.includes('filterReviewCards(\'incorrect\')'), '❌ FAIL: Review filters missing');
console.log('  ✅ PASSED: Answer review filters (Semua, Betul, Salah) are present.');


// 2. Logic Verification for Game Normalization
console.log('\n--- TEST 2: Game ID Normalization & Catalog Mapping ---');
const supabaseClientCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'supabase-client.js'), 'utf8');

// Mock a lightweight window/localStorage environment to test supabase-client functions
const mockStorage = {};
const mockWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  },
  location: { origin: 'http://localhost:3000', pathname: '/test', search: '', hash: '' },
  history: { replaceState: () => {} },
  addEventListener: () => {},
  dispatchEvent: () => true
};
global.localStorage = mockWindow.localStorage;
global.window = mockWindow;

// Evaluate the client code in our mock context
const scriptFunc = new Function('window', 'document', 'navigator', supabaseClientCode);
scriptFunc(mockWindow, { addEventListener: () => {} }, { onLine: true });

const ARSupabase = mockWindow.ARSupabase;
assert.ok(ARSupabase, '❌ FAIL: ARSupabase not initialized');

// Test normalizeGameId
assert.strictEqual(ARSupabase.normalizeGameId('maze_2d'), 'maze_2d');
assert.strictEqual(ARSupabase.normalizeGameId('maze-chase-sel'), 'maze_2d');
assert.strictEqual(ARSupabase.normalizeGameId('klasifikasi-sel'), 'maze_2d');
assert.strictEqual(ARSupabase.normalizeGameId('misi-makmal-sains'), 'misi_makmal');
assert.strictEqual(ARSupabase.normalizeGameId('misi_makmal'), 'misi_makmal');
assert.strictEqual(ARSupabase.normalizeGameId('labelkan-organel'), 'labelkan_organel');
assert.strictEqual(ARSupabase.normalizeGameId('organisasi-kehidupan'), 'organisasi_sel');
assert.strictEqual(ARSupabase.normalizeGameId('kuiz-saintis-muda'), 'kuiz_saintis_muda');
assert.strictEqual(ARSupabase.normalizeGameId('struktur-fungsi-organisasi-sel'), 'kuiz_saintis_muda');
console.log('  ✅ PASSED: normalizeGameId correctly canonicalizes all aliases.');


// 3. Test Distinct Leaderboards & Fair Ranking
console.log('\n--- TEST 3: Distinct Leaderboard Isolation & Fair Ranking ---');

// Populate test attempts in local storage submissions
const testAttempts = [
  // User 1 in Maze 2D (Attempt 1: 500, Attempt 2: 800, Attempt 3: 1000)
  {
    id: 'att-maze-u1-1',
    student_id: 'user-1',
    student_name: 'Ahmad User 1',
    quiz_id: 'maze_2d',
    score: 500,
    total: 10,
    correct: 5,
    duration_seconds: 120,
    submitted_at: '2026-10-24T10:00:00Z'
  },
  {
    id: 'att-maze-u1-2',
    student_id: 'user-1',
    student_name: 'Ahmad User 1',
    quiz_id: 'maze_2d',
    score: 800,
    total: 10,
    correct: 8,
    duration_seconds: 110,
    submitted_at: '2026-10-24T11:00:00Z'
  },
  {
    id: 'att-maze-u1-3',
    student_id: 'user-1',
    student_name: 'Ahmad User 1',
    quiz_id: 'maze_2d',
    score: 1000,
    total: 10,
    correct: 10,
    duration_seconds: 95,
    submitted_at: '2026-10-24T12:00:00Z'
  },

  // User 2 in Maze 2D (Attempt 1: 900)
  {
    id: 'att-maze-u2-1',
    student_id: 'user-2',
    student_name: 'Siti User 2',
    quiz_id: 'maze_2d',
    score: 900,
    total: 10,
    correct: 9,
    duration_seconds: 90,
    submitted_at: '2026-10-24T10:30:00Z'
  },

  // User 1 in Misi Makmal (Attempt 1: 900)
  {
    id: 'att-lab-u1-1',
    student_id: 'user-1',
    student_name: 'Ahmad User 1',
    quiz_id: 'misi_makmal',
    score: 900,
    total: 10,
    correct: 9,
    duration_seconds: 100,
    submitted_at: '2026-10-24T14:00:00Z'
  },

  // User 2 in Misi Makmal (Attempt 1: 1000)
  {
    id: 'att-lab-u2-1',
    student_id: 'user-2',
    student_name: 'Siti User 2',
    quiz_id: 'misi_makmal',
    score: 1000,
    total: 10,
    correct: 10,
    duration_seconds: 85,
    submitted_at: '2026-10-24T14:30:00Z'
  }
];

// Save test attempts to mock submissions storage
mockStorage['arselnel_quiz_submissions'] = JSON.stringify(testAttempts.map(a => ({
  id: a.id,
  studentId: a.student_id,
  studentName: a.student_name,
  quizId: a.quiz_id,
  score: a.score,
  total: a.total,
  correct: a.correct,
  duration_seconds: a.duration_seconds,
  completedAt: a.submitted_at
})));

// Run asynchronous leaderboard retrieval
(async () => {
  // A. Maze 2D Leaderboard
  const mazeResult = await ARSupabase.getGameLeaderboard('maze_2d', 10);
  assert.ok(mazeResult && mazeResult.leaderboard, '❌ FAIL: mazeResult.leaderboard not returned');
  const mazeRankings = mazeResult.leaderboard;

  console.log('  Maze 2D Leaderboard:');
  mazeRankings.forEach(r => console.log(`    Rank #${r.rank}: ${r.student_name} (${r.best_score} pts)`));

  assert.strictEqual(mazeRankings.length, 2, 'Should have exactly 2 distinct students');
  assert.strictEqual(mazeRankings[0].student_id, 'user-1', 'User 1 must be Rank 1 in Maze 2D');
  assert.strictEqual(mazeRankings[0].best_score, 1000, 'User 1 best score in Maze 2D must be 1000');
  assert.strictEqual(mazeRankings[1].student_id, 'user-2', 'User 2 must be Rank 2 in Maze 2D');
  assert.strictEqual(mazeRankings[1].best_score, 900, 'User 2 best score in Maze 2D must be 900');
  console.log('  ✅ PASSED: Maze 2D correctly shows User 1 in 1st place with best score (1,000 pts).');

  // B. Misi Makmal Leaderboard
  const labResult = await ARSupabase.getGameLeaderboard('misi_makmal', 10);
  const labRankings = labResult.leaderboard;

  console.log('  Misi Makmal Leaderboard:');
  labRankings.forEach(r => console.log(`    Rank #${r.rank}: ${r.student_name} (${r.best_score} pts)`));

  assert.strictEqual(labRankings.length, 2, 'Should have exactly 2 distinct students');
  assert.strictEqual(labRankings[0].student_id, 'user-2', 'User 2 must be Rank 1 in Misi Makmal');
  assert.strictEqual(labRankings[0].best_score, 1000, 'User 2 best score in Misi Makmal must be 1000');
  assert.strictEqual(labRankings[1].student_id, 'user-1', 'User 1 must be Rank 2 in Misi Makmal');
  assert.strictEqual(labRankings[1].best_score, 900, 'User 1 best score in Misi Makmal must be 900');
  console.log('  ✅ PASSED: Misi Makmal correctly shows User 2 in 1st place (1,000 pts). Rankings are NOT mixed!');


  // 4. Test Tie-Breakers
  console.log('\n--- TEST 4: Tie-Breaker Hierarchy ---');
  // Add two students with identical score of 800:
  // Student A: score 800, correct 8, duration 90s, time 10:00
  // Student B: score 800, correct 8, duration 70s, time 10:05 (faster duration -> should win)
  // Student C: score 800, correct 7, duration 50s, time 09:00 (less correct -> lower rank despite faster time)
  const tieAttempts = [
    {
      id: 'tie-1',
      student_id: 'student-A',
      student_name: 'Student A',
      quiz_id: 'labelkan_organel',
      score: 800,
      total: 10,
      correct: 8,
      duration_seconds: 90,
      submitted_at: '2026-10-24T10:00:00Z'
    },
    {
      id: 'tie-2',
      student_id: 'student-B',
      student_name: 'Student B',
      quiz_id: 'labelkan_organel',
      score: 800,
      total: 10,
      correct: 8,
      duration_seconds: 70,
      submitted_at: '2026-10-24T10:05:00Z'
    },
    {
      id: 'tie-3',
      student_id: 'student-C',
      student_name: 'Student C',
      quiz_id: 'labelkan_organel',
      score: 800,
      total: 10,
      correct: 7,
      duration_seconds: 50,
      submitted_at: '2026-10-24T09:00:00Z'
    }
  ];

  mockStorage['arselnel_quiz_submissions'] = JSON.stringify(tieAttempts.map(a => ({
    id: a.id,
    studentId: a.student_id,
    studentName: a.student_name,
    quizId: a.quiz_id,
    score: a.score,
    total: a.total,
    correct: a.correct,
    duration_seconds: a.duration_seconds,
    completedAt: a.submitted_at
  })));

  const labelResult = await ARSupabase.getGameLeaderboard('labelkan_organel', 10);
  const labelRankings = labelResult.leaderboard;

  console.log('  Tie-breaker Rankings:');
  labelRankings.forEach(r => console.log(`    Rank #${r.rank}: ${r.student_name} (${r.best_score} pts, ${r.correct_count} correct, ${r.best_duration_seconds}s)`));

  // Student B has more correct than C (8 vs 7) and faster duration than A (70s vs 90s) -> Rank 1
  assert.strictEqual(labelRankings[0].student_id, 'student-B', 'Student B should win tie-breaker due to faster duration');
  // Student A has 8 correct vs Student C's 7 correct -> Rank 2
  assert.strictEqual(labelRankings[1].student_id, 'student-A', 'Student A should be Rank 2 due to more correct answers than C');
  // Student C has 7 correct -> Rank 3
  assert.strictEqual(labelRankings[2].student_id, 'student-C', 'Student C should be Rank 3');
  console.log('  ✅ PASSED: Tie-breaker order strictly followed (Score > Correct Count > Duration > Timestamp).');


  // 5. Test Answer Snapshot Storage
  console.log('\n--- TEST 5: Question & Answer Snapshot Integrity ---');
  const sampleAnswers = [
    {
      questionId: 'q1',
      questionText: 'Apakah fungsi vakuol dalam sel tumbuhan?',
      options: ['Menghasilkan tenaga', 'Menyimpan sap sel dan mengekalkan kesegahan', 'Mengawal aktiviti sel', 'Sintesis protein'],
      userAnswer: 'Menyimpan sap sel dan mengekalkan kesegahan',
      correctAnswer: 'Menyimpan sap sel dan mengekalkan kesegahan',
      isCorrect: true,
      explanation: 'Vakuol mengandungi sap sel yang menyokong ketegaran sel tumbuhan.'
    },
    {
      questionId: 'q2',
      questionText: 'Manakah antara organel berikut hanya terdapat pada sel tumbuhan?',
      options: ['Mitokondrion', 'Membran sel', 'Kloroplas', 'Nukleus'],
      userAnswer: 'Membran sel',
      correctAnswer: 'Kloroplas',
      isCorrect: false,
      explanation: 'Kloroplas mengandungi klorofil untuk fotosintesis dan hanya hadir pada sel tumbuhan.'
    }
  ];

  const testAttemptWithAnswers = {
    id: 'att-snapshot-test',
    quizId: 'maze_2d',
    gameId: 'maze_2d',
    studentId: 'user-test',
    studentName: 'Pelajar Ujian',
    score: 950,
    total: 2,
    correct: 1,
    duration_seconds: 88,
    answers: sampleAnswers,
    completedAt: new Date().toISOString()
  };

  try {
    await ARSupabase.saveQuizAttempt(testAttemptWithAnswers);
  } catch (_) {
    // Expected in unconfigured unit test environment; withPersistence stores to local queue and caches latest attempt
  }

  const retrieved = await ARSupabase.getAttemptById('att-snapshot-test');
  assert.ok(retrieved, '❌ FAIL: Attempt with snapshot could not be retrieved');
  assert.strictEqual(retrieved.score, 950, 'Score must remain 950 and NOT be clamped to 100');
  assert.ok(Array.isArray(retrieved.answers), 'Answers must be stored as array');
  assert.strictEqual(retrieved.answers.length, 2);
  assert.strictEqual(retrieved.answers[0].isCorrect, true);
  assert.strictEqual(retrieved.answers[1].isCorrect, false);
  assert.strictEqual(retrieved.answers[1].userAnswer, 'Membran sel');
  assert.strictEqual(retrieved.answers[1].correctAnswer, 'Kloroplas');
  console.log('  ✅ PASSED: Answers snapshot preserved with score = 950 (unclamped).');


  // 6. Test Admin Learning Records Aggregation
  console.log('\n--- TEST 6: Admin Learning Records (gamesBreakdown) ---');
  const cmsAdapterCode = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'cms-content-adapter.js'), 'utf8');
  
  // Test mock student detail generation
  const mockAdminSubmissions = [
    { studentId: 'student-x', quizId: 'maze_2d', score: 600, correct: 6, total: 10, completedAt: '2026-10-20T10:00:00Z' },
    { studentId: 'student-x', quizId: 'maze_2d', score: 900, correct: 9, total: 10, completedAt: '2026-10-21T10:00:00Z' },
    { studentId: 'student-x', quizId: 'misi_makmal', score: 850, correct: 8, total: 10, completedAt: '2026-10-22T10:00:00Z' }
  ];

  mockStorage['arselnel_quiz_submissions'] = JSON.stringify(mockAdminSubmissions);
  mockStorage['arselnel_registered_students'] = JSON.stringify([
    { id: 'student-x', full_name: 'Student X', nickname: 'X', class_name: '1 Al-Farabi' }
  ]);

  global.CustomEvent = class CustomEvent { constructor(type, opt) { this.type = type; this.detail = opt ? opt.detail : {}; } };
  global.dispatchEvent = () => true;

  const mockAdminWindow = {
    localStorage: mockWindow.localStorage,
    ARSupabase: ARSupabase,
    dispatchEvent: () => true,
    addEventListener: () => {}
  };

  const adminFunc = new Function('window', 'document', cmsAdapterCode);
  adminFunc(mockAdminWindow, { addEventListener: () => {} });

  const CmsAdapter = mockAdminWindow.CMSAdapter || global.CMSAdapter;
  assert.ok(CmsAdapter, '❌ FAIL: CMSAdapter not loaded');

  const studentDetail = await CmsAdapter.getStudentDetail('student-x');
  assert.ok(studentDetail, '❌ FAIL: getStudentDetail failed');
  assert.ok(Array.isArray(studentDetail.gamesBreakdown), 'gamesBreakdown must be an array');
  assert.strictEqual(studentDetail.gamesBreakdown.length, 2, 'Should have entries for 2 played games');

  const mazeBreakdown = studentDetail.gamesBreakdown.find(g => g.gameId === 'maze_2d');
  assert.ok(mazeBreakdown, 'Maze 2D breakdown must exist');
  assert.strictEqual(mazeBreakdown.attemptsCount, 2, 'Maze 2D should have 2 attempts');
  assert.strictEqual(mazeBreakdown.bestScore, 900, 'Maze 2D best score must be 900');
  assert.strictEqual(mazeBreakdown.latestScore, 900, 'Maze 2D latest score must be 900');

  const labBreakdown = studentDetail.gamesBreakdown.find(g => g.gameId === 'misi_makmal');
  assert.ok(labBreakdown, 'Misi Makmal breakdown must exist');
  assert.strictEqual(labBreakdown.attemptsCount, 1, 'Misi Makmal should have 1 attempt');
  assert.strictEqual(labBreakdown.bestScore, 850, 'Misi Makmal best score must be 850');

  console.log('  Admin Games Breakdown:');
  studentDetail.gamesBreakdown.forEach(g => {
    console.log(`    - ${g.title}: ${g.attemptsCount} cubaan, Skor Terbaik: ${g.bestScore}, Terkini: ${g.latestScore}`);
  });
  console.log('  ✅ PASSED: Admin student detail correctly aggregates gamesBreakdown.');


  // 7. Verify Database Migration File
  console.log('\n--- TEST 7: Database Migration File Inspection ---');
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '202610250001_game_leaderboards_and_answer_snapshots.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  assert.ok(migrationSql.includes('quiz_attempts_score_check') && migrationSql.includes('score >= 0'), 'Migration must update score check constraint');
  assert.ok(migrationSql.includes('get_game_leaderboard'), 'Migration must define get_game_leaderboard RPC');
  assert.ok(migrationSql.includes('idx_quiz_attempts_leaderboard'), 'Migration must create composite performance index');
  assert.ok(migrationSql.includes('duration_seconds'), 'Migration must support duration_seconds');
  console.log('  ✅ PASSED: SQL Migration file contains all required schema enhancements.');

  console.log('\n======================================================');
  console.log('🎉 ALL 7 TEST SUITES PASSED FLAWLESSLY!');
  console.log('======================================================\n');
})();
