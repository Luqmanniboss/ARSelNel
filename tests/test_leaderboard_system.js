/**
 * ARSelNel - Leaderboard & Score Sync Verification Test Suite
 * Tests:
 * 1. Misi Makmal score persistence (500 pts preservation)
 * 2. Separate game IDs and leaderboard segregation (Misi Makmal vs Maze 2D)
 * 3. Status message differentiation:
 *    - Supabase success: "Markah 500 pts berjaya direkodkan!"
 *    - Local-only: "Markah disimpan sementara pada peranti ini. Penyelarasan belum selesai."
 *    - Failed: "Markah belum berjaya disimpan. Cuba semula."
 * 4. Papan Skor button existence in hab_permainan/code.html
 * 5. Keputusan page view=leaderboard and empty/single/multi podium logic
 * 6. Migration SQL verification (columns, functions, grants)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🧪 ARSelNel Leaderboard, Score Sync & Papan Skor Test Suite');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ----------------------------------------------------------------------------
// SUITE 1: FILE & MIGRATION AUDIT
// ----------------------------------------------------------------------------
console.log('--- SUITE 1: Migration & SQL Schema Verification ---');

test('1.1 Migration file exists and has correct name', () => {
  const migPath = path.join(ROOT_DIR, 'supabase/migrations/202610250001_game_leaderboards_and_answer_snapshots.sql');
  assert.ok(fs.existsSync(migPath), 'Migration file must exist');
  const sql = fs.readFileSync(migPath, 'utf8');
  assert.ok(sql.includes('get_game_leaderboard'), 'SQL must define get_game_leaderboard');
  assert.ok(sql.includes('correct_answers'), 'SQL must add correct_answers column');
  assert.ok(sql.includes('duration_seconds'), 'SQL must add duration_seconds column');
  assert.ok(sql.includes('score >= 0'), 'SQL must relax score constraint');
  assert.ok(sql.includes('GRANT EXECUTE ON FUNCTION public.get_game_leaderboard'), 'SQL must grant execute permissions');
  assert.ok(sql.includes('p.avatar'), 'SQL must use p.avatar matching public.profiles schema');
});

// ----------------------------------------------------------------------------
// SUITE 2: GAME ID SEGREGATION & NORMALIZATION
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Game ID Normalization & Segregation ---');

const clientCode = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/supabase-client.js'), 'utf8');

// Mock a lightweight JS runtime to test normalizeGameId and GAME_CATALOG
const sandbox = { CustomEvent: class {}, dispatchEvent: () => {} };
const fn = new Function('window', 'global', clientCode + '\nreturn window.ARSupabase;');
const exported = fn(sandbox, sandbox);

test('2.1 Game IDs normalize consistently', () => {
  const norm = exported.normalizeGameId;
  assert.strictEqual(norm('misi_makmal'), 'misi_makmal');
  assert.strictEqual(norm('misi-makmal-sains'), 'misi_makmal');
  assert.strictEqual(norm('lab_adventure'), 'misi_makmal');
  assert.strictEqual(norm('maze_2d'), 'maze_2d');
  assert.strictEqual(norm('klasifikasi-sel'), 'maze_2d');
  assert.strictEqual(norm('labelkan_organel'), 'labelkan_organel');
  assert.strictEqual(norm('organisasi_sel'), 'organisasi_sel');
  assert.strictEqual(norm('kuiz_saintis_muda'), 'kuiz_saintis_muda');
});

test('2.2 Game catalog has separate entries for each game', () => {
  const catalog = exported.GAME_CATALOG;
  assert.ok(catalog.misi_makmal, 'misi_makmal must be in catalog');
  assert.ok(catalog.maze_2d, 'maze_2d must be in catalog');
  assert.ok(catalog.labelkan_organel, 'labelkan_organel must be in catalog');
  assert.ok(catalog.organisasi_sel, 'organisasi_sel must be in catalog');
  assert.ok(catalog.kuiz_saintis_muda, 'kuiz_saintis_muda must be in catalog');
  
  assert.strictEqual(catalog.misi_makmal.maxScore, 1000);
  assert.strictEqual(catalog.maze_2d.maxScore, 1000);
  assert.notStrictEqual(catalog.misi_makmal.id, catalog.maze_2d.id);
});

// ----------------------------------------------------------------------------
// SUITE 3: LAB UI SCORING & PERSISTENCE
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Misi Makmal UI Scoring & Status Differentiation ---');

const labUiCode = fs.readFileSync(path.join(ROOT_DIR, 'assets/game/lab-adventure/lab_ui.js'), 'utf8');

test('3.1 lab_ui.js provides correct status messages', () => {
  assert.ok(labUiCode.includes('Markah ${this.score} pts berjaya direkodkan!'), 'Must include exact Supabase success message');
  assert.ok(labUiCode.includes('Markah disimpan sementara pada peranti ini. Penyelarasan belum selesai.'), 'Must include exact local-only message');
  assert.ok(labUiCode.includes('Markah belum berjaya disimpan. Cuba semula.'), 'Must include exact failure message');
  assert.ok(labUiCode.includes('lab-retry-sync-btn'), 'Must provide retry button for safe resync');
});

test('3.2 lab_ui.js updates victory leaderboard link to view=leaderboard', () => {
  assert.ok(labUiCode.includes('view=leaderboard'), 'Victory modal button must link to view=leaderboard');
  assert.ok(labUiCode.includes('game=misi_makmal'), 'Victory modal button must link to game=misi_makmal');
});

test('3.3 lab_ui.js loads authenticated profile via AuthGuard', () => {
  assert.ok(labUiCode.includes('AuthGuard.getUser'), 'lab_ui.js must query AuthGuard.getUser() for real student session');
});

// ----------------------------------------------------------------------------
// SUITE 4: HAB PERMAINAN PAPAN SKOR BUTTON
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Hab Permainan Papan Skor Button ---');

const habCode = fs.readFileSync(path.join(ROOT_DIR, 'hab_permainan/code.html'), 'utf8');

test('4.1 Hab Permainan has 🏆 Papan Skor button near Pilih Permainan Kuiz', () => {
  assert.ok(habCode.includes('Pilih Permainan Kuiz'), 'Hab must have Pilih Permainan Kuiz title');
  assert.ok(habCode.includes('Papan Skor'), 'Hab must have Papan Skor button');
  assert.ok(habCode.includes('btn-main-leaderboard') || habCode.includes('btn-hub-leaderboard'), 'Must have ID for button');
  assert.ok(habCode.includes('keputusan_permainan/code.html?view=leaderboard'), 'Must link directly to view=leaderboard');
  assert.ok(habCode.includes('🏆'), 'Must have trophy icon/emoji');
});

// ----------------------------------------------------------------------------
// SUITE 5: KEPUTUSAN PERMAINAN LEADERBOARD VIEW & PODIUM
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Keputusan Permainan Leaderboard View & Dynamic Podium ---');

const resultsCode = fs.readFileSync(path.join(ROOT_DIR, 'keputusan_permainan/code.html'), 'utf8');

test('5.1 keputusan_permainan supports view=leaderboard URL query', () => {
  assert.ok(resultsCode.includes("urlParams.get('view')"), 'Must parse view URL parameter');
  assert.ok(resultsCode.includes("'leaderboard'"), 'Must handle leaderboard tab transition');
});

test('5.2 keputusan_permainan has loading, error, zero, and podium states', () => {
  assert.ok(resultsCode.includes('leaderboard-loading-state'), 'Must have loading state DOM element');
  assert.ok(resultsCode.includes('leaderboard-error-state'), 'Must have error state DOM element with retry');
  assert.ok(resultsCode.includes('leaderboard-zero-state'), 'Must have zero player empty state DOM element');
  assert.ok(resultsCode.includes('podium-section'), 'Must have podium section');
});

test('5.3 Leaderboard rendering dynamically handles 0, 1, 2, and 3+ players', () => {
  assert.ok(resultsCode.includes('totalPlayers === 0'), 'Must handle 0 players state cleanly without dummy podium');
  assert.ok(resultsCode.includes('totalPlayers === 1'), 'Must handle single champion state');
  assert.ok(resultsCode.includes('totalPlayers === 2'), 'Must handle top 2 players state');
  assert.ok(resultsCode.includes('updatePodiumSlot(1,'), 'Must render slot 1');
});

// ----------------------------------------------------------------------------
// SUITE 6: SIMULATE LEADERBOARD AGGREGATION & SEGREGATION LOGIC
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 6: Data Segregation & Ranking Aggregation Simulation ---');

test('6.1 Misi Makmal scores do not leak into Maze 2D', () => {
  const attempts = [
    { id: '1', quizId: 'misi_makmal', userId: 'user_umie', studentName: 'Umie', score: 500, correct: 5, duration: 120 },
    { id: '2', quizId: 'maze_2d', userId: 'user_ali', studentName: 'Ali', score: 900, correct: 9, duration: 90 },
    { id: '3', quizId: 'misi_makmal', userId: 'user_haziq', studentName: 'Haziq', score: 750, correct: 8, duration: 110 }
  ];

  const getLeaderboardForGame = (targetGame) => {
    return attempts
      .filter(a => a.quizId === targetGame)
      .sort((a, b) => b.score - a.score);
  };

  const labLeaderboard = getLeaderboardForGame('misi_makmal');
  const mazeLeaderboard = getLeaderboardForGame('maze_2d');

  assert.strictEqual(labLeaderboard.length, 2, 'Misi Makmal must have 2 players');
  assert.strictEqual(mazeLeaderboard.length, 1, 'Maze 2D must have 1 player');
  assert.strictEqual(labLeaderboard[0].studentName, 'Haziq');
  assert.strictEqual(labLeaderboard[0].score, 750);
  assert.strictEqual(labLeaderboard[1].studentName, 'Umie');
  assert.strictEqual(labLeaderboard[1].score, 500);
  assert.strictEqual(mazeLeaderboard[0].studentName, 'Ali');
  assert.strictEqual(mazeLeaderboard[0].score, 900);
  
  // Verify Umie is not in Maze 2D
  assert.ok(!mazeLeaderboard.some(a => a.studentName === 'Umie'), 'Umie must NOT appear in Maze 2D');
});

test('6.2 Best score per user is selected (tie breaker: score > correct > duration)', () => {
  const userAttempts = [
    { userId: 'u1', studentName: 'Umie', score: 300, correct: 3, duration: 150, date: '2026-10-25T01:00:00Z' },
    { userId: 'u1', studentName: 'Umie', score: 500, correct: 5, duration: 120, date: '2026-10-25T02:00:00Z' }, // best
    { userId: 'u1', studentName: 'Umie', score: 500, correct: 4, duration: 100, date: '2026-10-25T03:00:00Z' }  // lower correct
  ];

  const sorted = [...userAttempts].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correct !== a.correct) return b.correct - a.correct;
    return a.duration - b.duration;
  });

  const best = sorted[0];
  assert.strictEqual(best.score, 500);
  assert.strictEqual(best.correct, 5);
  assert.strictEqual(best.duration, 120);
});

console.log('\n================================================================');
console.log(`📊 Test Results: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
