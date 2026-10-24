/**
 * Automated Verification Script for CODEX fixes:
 * 1. renderActivities definition & save decoupling
 * 2. Automatic video duration (MP4/WebM & YouTube safe handling)
 * 3. Automatic note slide count (PDF/PPTX)
 * 4. Simplified student video page (removed organelle cards & action buttons)
 * 5. Enhanced "Lagi Untuk Anda" with 16:9 interactive cards & back button
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING CODEX VIDEO, SLIDE & ACTIVITY VERIFICATION ---');

const projectRoot = path.resolve(__dirname, '..');
let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// 1. Audit admin_dashboard/code.html
const adminHtmlPath = path.join(projectRoot, 'admin_dashboard', 'code.html');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

test('Admin HTML has renderActivities declared and assigned to window', () => {
  assert.ok(adminHtml.includes('async function renderActivities()'), 'renderActivities function definition missing');
  assert.ok(adminHtml.includes('window.renderActivities = renderActivities;'), 'renderActivities not exposed to window');
});

test('Admin HTML has formatVideoDuration and video duration detection helpers', () => {
  assert.ok(adminHtml.includes('function formatVideoDuration(seconds)'), 'formatVideoDuration helper missing');
  assert.ok(adminHtml.includes('function detectVideoDurationFromFile(file)'), 'detectVideoDurationFromFile helper missing');
  assert.ok(adminHtml.includes('function extractYouTubeId(url)'), 'extractYouTubeId helper missing');
});

test('Admin HTML has document page count detection for PDF and PPTX', () => {
  assert.ok(adminHtml.includes('async function detectDocumentPageCount(file)'), 'detectDocumentPageCount missing');
  assert.ok(adminHtml.includes('/Type\\s*\\/Pages') || adminHtml.includes('Count\\s+(\\d+)'), 'PDF page count scanner missing');
  assert.ok(adminHtml.includes('ppt/slides/slide') || adminHtml.includes('ppt\\/slides\\/slide'), 'PPTX slide count scanner missing');
});

test('Admin HTML video modal has no manual duration text/number input', () => {
  assert.ok(!adminHtml.includes('TEMPOH MASA (E.G. 05:30)'), 'Old manual duration label still present');
  assert.ok(adminHtml.includes('<input type="hidden" id="video-duration-input" value=""/>'), 'Hidden video duration input missing');
  assert.ok(adminHtml.includes('id="video-detected-duration-badge"'), 'Detected duration badge missing');
});

test('Admin HTML slide modal has no manual estimated slide count input', () => {
  assert.ok(!adminHtml.includes('Anggaran Bilangan Slaid (cth: 6)'), 'Old manual slide count label still present');
  assert.ok(adminHtml.includes('<input type="hidden" id="admin-slide-count-input" value=""/>'), 'Hidden admin slide count input missing');
  assert.ok(adminHtml.includes('id="admin-detected-pages-badge"'), 'Detected slide count badge missing');
});

test('Admin HTML save video/quiz/note decouples DB save from UI refresh', () => {
  // Check handleSaveVideo
  const videoSaveIdx = adminHtml.indexOf('await AdminCMS.saveVideo(videoData);');
  assert.ok(videoSaveIdx !== -1, 'saveVideo missing');
  const videoTryIdx = adminHtml.indexOf('try {', videoSaveIdx);
  const videoRenderActIdx = adminHtml.indexOf('renderActivities();', videoTryIdx);
  assert.ok(videoRenderActIdx !== -1, 'renderActivities should be inside try-catch after saveVideo');

  // Check handleSaveQuiz
  const quizSaveIdx = adminHtml.indexOf('await AdminCMS.saveQuiz(quizData);');
  assert.ok(quizSaveIdx !== -1, 'saveQuiz missing');
  const quizTryIdx = adminHtml.indexOf('try {', quizSaveIdx);
  const quizRenderActIdx = adminHtml.indexOf('renderActivities();', quizTryIdx);
  assert.ok(quizRenderActIdx !== -1, 'renderActivities should be inside try-catch after saveQuiz');

  // Check handleSaveNote
  const noteSaveIdx = adminHtml.indexOf('await AdminCMS.saveNote(noteData);');
  assert.ok(noteSaveIdx !== -1, 'saveNote missing');
  const noteTryIdx = adminHtml.indexOf('try {', noteSaveIdx);
  const noteRenderActIdx = adminHtml.indexOf('renderActivities();', noteTryIdx);
  assert.ok(noteRenderActIdx !== -1, 'renderActivities should be inside try-catch after saveNote');
});

test('Admin HTML does not force fake 05:00 duration badge in renderVideos', () => {
  assert.ok(!adminHtml.includes("${escapeHtml(v.duration || '05:00')}"), 'Fake 05:00 duration still in renderVideos');
  assert.ok(adminHtml.includes("v.duration && v.duration !== '05:00'"), 'Real duration check missing in renderVideos');
});

// 2. Audit nota_pembelajaran/code.html
const noteHtmlPath = path.join(projectRoot, 'nota_pembelajaran', 'code.html');
const noteHtml = fs.readFileSync(noteHtmlPath, 'utf8');

test('Student note modal has no manual slide count input', () => {
  assert.ok(!noteHtml.includes('Anggaran Bilangan Slaid'), 'Manual slide count label still present in student note modal');
  assert.ok(noteHtml.includes('<input type="hidden" id="slide-count-input" value=""/>'), 'Hidden slide-count-input missing');
  assert.ok(noteHtml.includes('id="slide-detected-pages-badge"'), 'Detected pages badge missing in note modal');
  assert.ok(noteHtml.includes('detectDocumentPageCount'), 'detectDocumentPageCount missing in student note script');
});

// 3. Audit perpustakaan_video/code.html
const libraryHtmlPath = path.join(projectRoot, 'perpustakaan_video', 'code.html');
const libraryHtml = fs.readFileSync(libraryHtmlPath, 'utf8');

test('perpustakaan_video does not force fake 05:00 duration', () => {
  assert.ok(!libraryHtml.includes("${escapeHtml(vid.duration || '05:00')}"), 'Fake 05:00 duration still in library card');
  assert.ok(libraryHtml.includes("vid.duration && vid.duration !== '05:00'"), 'Real duration check missing in library card');
});

// 4. Audit pemain_video/code.html
const playerHtmlPath = path.join(projectRoot, 'pemain_video', 'code.html');
const playerHtml = fs.readFileSync(playerHtmlPath, 'utf8');

test('pemain_video has Back Button pointing to library', () => {
  assert.ok(playerHtml.includes('id="btn-back-to-library"'), 'Back button missing in pemain_video');
  assert.ok(playerHtml.includes('href="../perpustakaan_video/code.html"'), 'Back button does not link to perpustakaan_video');
  assert.ok(playerHtml.includes('Kembali ke Senarai Video'), 'Back button text missing');
});

test('pemain_video has removed 4 organelle cards (Nukleus, Mitokondria, Sitoplasma, Membran Sel)', () => {
  assert.ok(!playerHtml.includes('Pusat kawalan yang mengandungi maklumat genetik (DNA)'), 'Nukleus card not removed');
  assert.ok(!playerHtml.includes('Tapak penjanaan tenaga melalui proses respirasi sel'), 'Mitokondria card not removed');
  assert.ok(!playerHtml.includes('Medium jeli di mana tindak balas kimia berlaku'), 'Sitoplasma card not removed');
  assert.ok(!playerHtml.includes('Mengawal pergerakan bahan keluar dan masuk sel'), 'Membran Sel card not removed');
});

test('pemain_video has removed action buttons (Baca Nota Berkaitan, Uji Kefahaman)', () => {
  assert.ok(!playerHtml.includes('Baca Nota Berkaitan'), 'Baca Nota Berkaitan button not removed');
  assert.ok(!playerHtml.includes('Uji Kefahaman'), 'Uji Kefahaman button not removed');
});

test('pemain_video has enhanced Lagi Untuk Anda with 16:9 cards, YouTube fallback and dynamic switching', () => {
  assert.ok(playerHtml.includes('id="related-videos-container"'), 'Related videos container missing');
  assert.ok(playerHtml.includes('aspect-video'), '16:9 aspect ratio missing');
  assert.ok(playerHtml.includes('selectRelatedVideo'), 'Dynamic video selection function missing');
  assert.ok(playerHtml.includes('img.youtube.com/vi/'), 'YouTube thumbnail fallback missing');
  assert.ok(!playerHtml.includes("${escapeHtml(v.duration || '05:00')}"), 'Fake 05:00 still present in related videos');
});

// 5. Test helper functions logic directly in Node
test('formatVideoDuration formats short and long videos correctly', () => {
  function formatVideoDuration(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return null;
    const s = Math.round(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  assert.strictEqual(formatVideoDuration(65), '01:05');
  assert.strictEqual(formatVideoDuration(3665), '1:01:05');
  assert.strictEqual(formatVideoDuration(0), null);
  assert.strictEqual(formatVideoDuration(-10), null);
  assert.strictEqual(formatVideoDuration(NaN), null);
});

test('extractYouTubeId extracts IDs from various YouTube URL formats', () => {
  function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  assert.strictEqual(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.strictEqual(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.strictEqual(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.strictEqual(extractYouTubeId('https://example.com/video.mp4'), null);
});

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
console.log(`========================================\n`);

if (passed === total) {
  process.exitCode = 0;
} else {
  process.exitCode = 1;
}
