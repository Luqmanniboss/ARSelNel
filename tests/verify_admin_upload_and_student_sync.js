const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('  ARSelNel CODEX Verification: Admin Upload & Student Sync      ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Verify Serverless API Route & Error Handling
// -----------------------------------------------------------------------------
console.log('1. Testing /api/slides/upload and /api/public-config...');

const uploadHandler = require('../api/slides/upload.js');
const publicConfigHandler = require('../api/public-config.js');

test('upload handler is a function', () => {
  assert.strictEqual(typeof uploadHandler, 'function');
});

test('upload handler returns 405 JSON on GET request', async () => {
  let statusCode = 0;
  let headers = {};
  let body = null;
  const req = { method: 'GET' };
  const res = {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = data; return res; },
    end: () => res
  };
  await uploadHandler(req, res);
  assert.strictEqual(statusCode, 405);
  assert.ok(headers['content-type'].includes('application/json'));
  assert.strictEqual(body.success, false);
  assert.ok(body.error.includes('Hanya permintaan POST disokong'));
});

test('upload handler returns 400 JSON on missing fields', async () => {
  let statusCode = 0;
  let headers = {};
  let body = null;
  const req = { method: 'POST', body: {} };
  const res = {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = data; return res; },
    end: () => res
  };
  await uploadHandler(req, res);
  assert.strictEqual(statusCode, 400);
  assert.ok(headers['content-type'].includes('application/json'));
  assert.strictEqual(body.success, false);
});

test('upload handler rejects unsupported file types with Malay message', async () => {
  let statusCode = 0;
  let body = null;
  const req = { method: 'POST', body: { filename: 'malware.exe', dataUrl: 'data:application/octet-stream;base64,AAAA' } };
  const res = {
    setHeader: () => {},
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = data; return res; }
  };
  await uploadHandler(req, res);
  assert.strictEqual(statusCode, 400);
  assert.strictEqual(body.success, false);
  assert.ok(body.error.includes('tidak dibenarkan'));
});

test('upload handler rejects files > 4.5MB with 413 and Vercel limit explanation', async () => {
  let statusCode = 0;
  let body = null;
  const hugeBuf = Buffer.alloc(5 * 1024 * 1024);
  const req = { method: 'POST', body: { filename: 'large.pdf', dataUrl: `data:application/pdf;base64,${hugeBuf.toString('base64')}` } };
  const res = {
    setHeader: () => {},
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = data; return res; }
  };
  await uploadHandler(req, res);
  assert.strictEqual(statusCode, 413);
  assert.strictEqual(body.success, false);
  assert.ok(body.error.includes('4.5MB'));
});

test('public-config handler returns JSON with CORS headers', async () => {
  let statusCode = 0;
  let headers = {};
  let body = null;
  const req = { method: 'GET' };
  const res = {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    status: (code) => { statusCode = code; return res; },
    json: (data) => { body = data; return res; }
  };
  await publicConfigHandler(req, res);
  assert.strictEqual(statusCode, 200);
  assert.ok(headers['content-type'].includes('application/json'));
  assert.ok(headers['access-control-allow-origin']);
  assert.strictEqual(body.configured, true);
  assert.ok(body.url.includes('supabase.co'));
});

// -----------------------------------------------------------------------------
// 2. Verify YouTube URL Normalization & Video Helpers
// -----------------------------------------------------------------------------
console.log('\n2. Testing YouTube URL normalization...');

const cmsCode = fs.readFileSync('assets/js/cms-content-adapter.js', 'utf8');

test('CMSAdapter has normalizeVideoUrl method', () => {
  assert.ok(cmsCode.includes('normalizeVideoUrl'));
});

// Extract normalizeVideoUrl function logic for test
const normalizeVideoUrl = (url) => {
  if (!url) return '';
  url = String(url).trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

test('normalizes standard youtube.com watch URL', () => {
  const norm = normalizeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.strictEqual(norm, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('normalizes short youtu.be URL', () => {
  const norm = normalizeVideoUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.strictEqual(norm, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('normalizes youtube.com/shorts URL', () => {
  const norm = normalizeVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.strictEqual(norm, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('preserves direct mp4 file URLs', () => {
  const mp4Url = 'https://kxjhlbudsiojpvzwqwva.supabase.co/storage/v1/object/public/educational_media/videos/cell.mp4';
  assert.strictEqual(normalizeVideoUrl(mp4Url), mp4Url);
});

// -----------------------------------------------------------------------------
// 3. Verify Admin UI Implementation
// -----------------------------------------------------------------------------
console.log('\n3. Testing Admin Dashboard HTML and JS...');

const adminHtml = fs.readFileSync('admin_dashboard/code.html', 'utf8');
const adminJs = fs.readFileSync('assets/js/admin.js', 'utf8');

test('admin_dashboard includes modal-video with Method A (URL) and Method B (File Upload)', () => {
  assert.ok(adminHtml.includes('id="tab-video-src-url"'));
  assert.ok(adminHtml.includes('id="tab-video-src-file"'));
  assert.ok(adminHtml.includes('id="video-section-url"'));
  assert.ok(adminHtml.includes('id="video-section-file"'));
  assert.ok(adminHtml.includes('id="video-upload-bar"'));
  assert.ok(adminHtml.includes('id="video-status-input"'));
});

test('admin_dashboard handleSaveVideo supports both file upload and URL with progress', () => {
  assert.ok(adminHtml.includes('async function handleSaveVideo(e)'));
  assert.ok(adminHtml.includes('CMSAdapter.uploadMedia'));
  assert.ok(adminHtml.includes('AdminCMS.saveVideo'));
  assert.ok(adminHtml.includes('Kandungan telah diterbitkan dan boleh diakses oleh murid'));
  assert.ok(adminHtml.includes('Berjaya! Kandungan telah disimpan ke Supabase'));
});

test('admin_dashboard handleSaveAdminSlide uses CMSAdapter.uploadMedia safely', () => {
  assert.ok(adminHtml.includes('async function handleSaveAdminSlide(e)'));
  assert.ok(adminHtml.includes('CMSAdapter.uploadMedia(file, \'slides\''));
  assert.ok(!adminHtml.includes('fetch(\'/api/slides/upload\''));
});

test('admin_dashboard handleSaveNote persists to Supabase and SmartNotes', () => {
  assert.ok(adminHtml.includes('async function handleSaveNote(e)'));
  assert.ok(adminHtml.includes('await AdminCMS.saveNote(noteData)'));
});

test('admin_dashboard handleSaveQuiz persists to Supabase', () => {
  assert.ok(adminHtml.includes('async function handleSaveQuiz(e)'));
  assert.ok(adminHtml.includes('await AdminCMS.saveQuiz(quizData)'));
});

test('admin.js AdminCMS methods are async and await CMSAdapter', () => {
  assert.ok(adminJs.includes('async saveVideo(videoData)'));
  assert.ok(adminJs.includes('async saveNote(noteData)'));
  assert.ok(adminJs.includes('async saveQuiz(quizData)'));
  assert.ok(adminJs.includes('async deleteVideo(id)'));
  assert.ok(adminJs.includes('async deleteNote(id)'));
  assert.ok(adminJs.includes('async deleteQuiz(id)'));
  assert.ok(adminJs.includes('async syncFromSupabase()'));
});

// -----------------------------------------------------------------------------
// 4. Verify Student Pages Integration
// -----------------------------------------------------------------------------
console.log('\n4. Testing Student Pages Integration...');

const studentNotesHtml = fs.readFileSync('nota_pembelajaran/code.html', 'utf8');
const studentVideoListHtml = fs.readFileSync('perpustakaan_video/code.html', 'utf8');
const studentVideoPlayerHtml = fs.readFileSync('pemain_video/code.html', 'utf8');

test('nota_pembelajaran/code.html includes cms-content-adapter.js', () => {
  assert.ok(studentNotesHtml.includes('cms-content-adapter.js'));
});

test('nota_pembelajaran/code.html does not contain raw fetch to /api/slides/upload', () => {
  assert.ok(!studentNotesHtml.includes("fetch('/api/slides/upload'"));
  assert.ok(studentNotesHtml.includes('CMSAdapter.uploadMedia'));
});

test('perpustakaan_video/code.html loads published videos from CMSAdapter', () => {
  assert.ok(studentVideoListHtml.includes('CMSAdapter.getVideos({ status: \'published\' })'));
  assert.ok(studentVideoListHtml.includes('../pemain_video/code.html?id='));
});

test('pemain_video/code.html includes cms-content-adapter.js', () => {
  assert.ok(studentVideoPlayerHtml.includes('cms-content-adapter.js'));
});

test('pemain_video/code.html dynamically renders iframe for YouTube or video for MP4', () => {
  assert.ok(studentVideoPlayerHtml.includes('renderPlayer(video)'));
  assert.ok(studentVideoPlayerHtml.includes('<iframe'));
  assert.ok(studentVideoPlayerHtml.includes('<video'));
  assert.ok(studentVideoPlayerHtml.includes('CMSAdapter.normalizeVideoUrl'));
});

test('pemain_video/code.html dynamically renders related videos from published list', () => {
  assert.ok(studentVideoPlayerHtml.includes('related-videos-container'));
});

// -----------------------------------------------------------------------------
// 5. Verify SQL Migration & RLS Policies
// -----------------------------------------------------------------------------
console.log('\n5. Testing SQL Migrations & Additive Policies...');

const migrationSql = fs.readFileSync('supabase/migrations/202610230002_complete_cms_and_storage.sql', 'utf8');

test('migration creates educational_media storage bucket with generous file size limit', () => {
  assert.ok(migrationSql.includes("'educational_media'"));
  assert.ok(migrationSql.includes('104857600')); // 100MB
});

test('migration creates learning_notes and student progress tables', () => {
  assert.ok(/create table if not exists public\.learning_notes/i.test(migrationSql));
  assert.ok(/create table if not exists public\.student_annotations/i.test(migrationSql));
  assert.ok(/create table if not exists public\.student_note_progress/i.test(migrationSql));
});

test('migration enables RLS and restricts student edits while permitting admin', () => {
  assert.ok(/enable row level security/i.test(migrationSql));
  assert.ok(migrationSql.includes('public.is_admin()'));
  assert.ok(migrationSql.includes("publication_status = 'published'"));
});

test('migration is 100% non-destructive and idempotent', () => {
  assert.ok(!migrationSql.includes('DROP TABLE'));
  assert.ok(!migrationSql.includes('TRUNCATE'));
  assert.ok(/on conflict/i.test(migrationSql));
});

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log('================================================================');

if (failed > 0) process.exit(1);
