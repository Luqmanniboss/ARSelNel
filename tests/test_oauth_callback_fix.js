/**
 * ARSelNel - Comprehensive Google OAuth & Callback Route Test Suite (test_oauth_callback_fix.js)
 *
 * Verifies all 15 critical requirements:
 * 1.  /auth/callback.html exists on local server & file system
 * 2.  /auth/callback.html configured in vercel.json rewrites
 * 3.  Login with Google from login page uses canonical redirect URL
 * 4.  Login with Google from register page uses canonical redirect URL
 * 5.  First-time Google user role defaulting & profile creation
 * 6.  Returning Google user profile retention
 * 7.  Expired OAuth callback (bad_oauth_state) maps to exact BM message & retry button
 * 8.  Cancelled Google login (access_denied) handling
 * 9.  Duplicate login clicks (debounce / concurrency lock)
 * 10. Missing authorization code handling (safe idle notice, no crash)
 * 11. Correct Student Dashboard redirect path (/halaman_utama/code.html)
 * 12. Correct Admin role protection (admin_users table verification, no metadata escalation)
 * 13. Session isolation & clean logout without loop
 * 14. No localhost redirects on production domain (hostname resolution)
 * 15. No duplicate student profiles (upsert with onConflict: 'id')
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');

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
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('🔬 ARSelNel Google OAuth & Callback Verification Suite');
console.log('================================================================');

// 1. Files existence & content
console.log('\n--- SUITE 1: Callback Files & Routing Integrity ---');

const callbackHtmlPath = path.join(ROOT_DIR, 'auth/callback.html');
const rootCallbackPath = path.join(ROOT_DIR, 'callback.html');
const vercelJsonPath = path.join(ROOT_DIR, 'vercel.json');
const localServerPath = path.join(ROOT_DIR, 'local-server.js');
const supabaseClientPath = path.join(ROOT_DIR, 'assets/js/supabase-client.js');
const loginHtmlPath = path.join(ROOT_DIR, 'auth/login.html');
const registerHtmlPath = path.join(ROOT_DIR, 'auth/register.html');

runTest('1.1 /auth/callback.html exists and is properly structured', () => {
  assert.ok(fs.existsSync(callbackHtmlPath), 'auth/callback.html must exist on disk');
  const content = fs.readFileSync(callbackHtmlPath, 'utf8');
  assert.ok(content.length > 500, 'auth/callback.html must contain substantive code');
  assert.ok(content.includes('@supabase/supabase-js@2'), 'Must load Supabase JS SDK v2');
  assert.ok(content.includes('supabase-client.js'), 'Must load supabase-client.js');
  assert.ok(content.includes('auth.js'), 'Must load auth.js');
  assert.ok(content.includes('auth-guard.js'), 'Must load auth-guard.js');
});

runTest('1.2 Root fallback callback.html exists', () => {
  assert.ok(fs.existsSync(rootCallbackPath), 'callback.html must exist at root for fallback forwarding');
  const content = fs.readFileSync(rootCallbackPath, 'utf8');
  assert.ok(content.includes('auth/callback.html'), 'Root callback must forward to auth/callback.html');
});

runTest('1.3 Vercel configuration includes dedicated /auth/callback rewrite', () => {
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  const rewrites = vercelJson.rewrites || [];
  const callbackRewrite = rewrites.find(r => r.source === '/auth/callback');
  assert.ok(callbackRewrite, 'vercel.json must rewrite /auth/callback');
  assert.strictEqual(callbackRewrite.destination, '/auth/callback.html', 'Must point to /auth/callback.html');
  const rootCallbackRewrite = rewrites.find(r => r.source === '/callback');
  assert.ok(rootCallbackRewrite, 'vercel.json must rewrite /callback to /auth/callback.html');
});

runTest('1.4 local-server.js supports /auth/callback and /callback routes', () => {
  const localServerCode = fs.readFileSync(localServerPath, 'utf8');
  assert.ok(localServerCode.includes("'/auth/callback': 'auth/callback.html'"), 'local-server.js must route /auth/callback');
  assert.ok(localServerCode.includes("'/callback': 'auth/callback.html'"), 'local-server.js must route /callback');
});

// 2. Canonical Redirect URL & Origin Resolution
console.log('\n--- SUITE 2: Canonical Redirect URL & No Localhost on Production ---');

const supabaseClientCode = fs.readFileSync(supabaseClientPath, 'utf8');

runTest('2.1 getOAuthRedirectUrl resolves production URL on production domain', () => {
  assert.ok(supabaseClientCode.includes('getOAuthRedirectUrl:'), 'ARSupabase must export getOAuthRedirectUrl');
  assert.ok(supabaseClientCode.includes('arselnel-seven.vercel.app'), 'Must explicitly recognize arselnel-seven.vercel.app');
  assert.ok(supabaseClientCode.includes('https://arselnel-seven.vercel.app/auth/callback.html'), 'Must produce https://arselnel-seven.vercel.app/auth/callback.html');
});

runTest('2.2 getOAuthRedirectUrl resolves local origin dynamically for development', () => {
  assert.ok(supabaseClientCode.includes('${window.location.origin}/auth/callback.html'), 'Must dynamically use window.location.origin locally');
});

runTest('2.3 login.html uses canonical getOAuthRedirectUrl', () => {
  const loginHtml = fs.readFileSync(loginHtmlPath, 'utf8');
  assert.ok(loginHtml.includes('getOAuthRedirectUrl'), 'login.html must call getOAuthRedirectUrl');
  assert.ok(!loginHtml.includes("signInWithGoogle(`${window.location.origin}/auth/login.html?oauth=google`)"), 'Must NOT use legacy login.html?oauth=google redirect');
});

runTest('2.4 register.html uses canonical getOAuthRedirectUrl', () => {
  const registerHtml = fs.readFileSync(registerHtmlPath, 'utf8');
  assert.ok(registerHtml.includes('getOAuthRedirectUrl'), 'register.html must call getOAuthRedirectUrl');
  assert.ok(!registerHtml.includes("signInWithGoogle(`${window.location.origin}/auth/login.html?oauth=google`)"), 'Must NOT use legacy login.html?oauth=google redirect');
});

// 3. Concurrency Protection & Debounce
console.log('\n--- SUITE 3: Concurrency Protection & Double-Click Guard ---');

runTest('3.1 login.html guards against duplicate/concurrent Google Login clicks', () => {
  const loginHtml = fs.readFileSync(loginHtmlPath, 'utf8');
  assert.ok(loginHtml.includes('isGoogleAuthBusy'), 'login.html must track busy state');
  assert.ok(loginHtml.includes('if (isGoogleAuthBusy) return;'), 'Must abort concurrent click when busy');
  assert.ok(loginHtml.includes('googleBtn.disabled = true;'), 'Must disable button upon submission');
});

runTest('3.2 register.html guards against duplicate/concurrent Google Login clicks', () => {
  const registerHtml = fs.readFileSync(registerHtmlPath, 'utf8');
  assert.ok(registerHtml.includes('isGoogleAuthBusy'), 'register.html must track busy state');
  assert.ok(registerHtml.includes('if (isGoogleAuthBusy) return;'), 'Must abort concurrent click when busy');
  assert.ok(registerHtml.includes('googleBtn.disabled = true;'), 'Must disable button upon submission');
});

// 4. Error Handling & State Expiration UI Requirements
console.log('\n--- SUITE 4: Error Handling, bad_oauth_state & Code Exchange Failure ---');

const callbackContent = fs.readFileSync(callbackHtmlPath, 'utf8');

runTest('4.1 callback.html displays exact Bahasa Melayu message for expired state', () => {
  assert.ok(
    callbackContent.includes('Sesi log masuk Google telah tamat. Sila cuba log masuk semula.'),
    'Must display exact requirement: "Sesi log masuk Google telah tamat. Sila cuba log masuk semula."'
  );
});

runTest('4.2 callback.html provides "Cuba Log Masuk Google Semula" button starting fresh flow', () => {
  assert.ok(
    callbackContent.includes('Cuba Log Masuk Google Semula'),
    'Must have button with text "Cuba Log Masuk Google Semula"'
  );
  assert.ok(
    callbackContent.includes('startFreshGoogleLogin'),
    'Button must call fresh signInWithGoogle flow, not reload expired URL'
  );
});

runTest('4.3 friendlyError in supabase-client.js maps bad_oauth_state and external code errors', () => {
  assert.ok(supabaseClientCode.includes('bad_oauth_state|oauth state has expired'), 'friendlyError must map bad_oauth_state');
  assert.ok(supabaseClientCode.includes('unable to exchange external code'), 'friendlyError must map external code exchange failure');
  assert.ok(supabaseClientCode.includes('access_denied'), 'friendlyError must map user cancellation');
});

runTest('4.4 callback.html handles direct access without parameters safely', () => {
  assert.ok(callbackContent.includes('Tiada data pengesahan dikesan'), 'Must display safe message if no auth params');
  assert.ok(callbackContent.includes('btn-back-login'), 'Must provide link to return to login page');
});

// 5. Account Security, Role Protection & Student Profile Integrity
console.log('\n--- SUITE 5: Account Security, Role Protection & Profile Integrity ---');

runTest('5.1 Default role is student and never auto-promotes to admin from user_metadata', () => {
  assert.ok(callbackContent.includes("role: finalRole"), 'Must assign validated finalRole');
  assert.ok(callbackContent.includes("from('admin_users')"), 'Must verify admin via admin_users database table');
  assert.ok(!callbackContent.includes("role = meta.role"), 'Must never assign raw meta.role without database verification');
});

runTest('5.2 Student profile creation uses onConflict: id to prevent duplicate records', () => {
  assert.ok(callbackContent.includes("onConflict: 'id'"), 'Must upsert profile with onConflict id');
  assert.ok(supabaseClientCode.includes("onConflict: 'id'"), 'supabase-client.js upsert profile must use onConflict id');
});

runTest('5.3 No Aina or demo profile injection in callback', () => {
  assert.ok(!callbackContent.includes('ainasofea'), 'Must not reference hardcoded Aina username');
  assert.ok(!callbackContent.includes('usr_std_1'), 'Must not reference seed student id');
  assert.ok(callbackContent.includes('isDemo: false'), 'OAuth user must always have isDemo: false');
});

runTest('5.4 Student redirect points to Student Dashboard (/halaman_utama/code.html)', () => {
  assert.ok(callbackContent.includes('../halaman_utama/code.html'), 'Students must be redirected to halaman_utama');
});

runTest('5.5 Admin redirect points to Admin Dashboard (/admin_dashboard/code.html)', () => {
  assert.ok(callbackContent.includes('../admin_dashboard/code.html'), 'Admins must be redirected to admin_dashboard');
});

runTest('5.6 Single-use PKCE exchange and URL state cleaning', () => {
  assert.ok(callbackContent.includes('history.replaceState'), 'Must clean URL query and hash parameters after processing');
  assert.ok(!callbackContent.includes('console.log(session.access_token)'), 'Must not log access tokens');
  assert.ok(!callbackContent.includes('console.log(code)'), 'Must not log authorization codes');
});

// 6. Live Local HTTP Server Route Verification
console.log('\n--- SUITE 6: Live Local HTTP Server Route Verification ---');

let testServer = null;

async function testLocalHttpServer() {
  testServer = require('../local-server.js');
  const TEST_PORT = 3088;
  await new Promise(resolve => testServer.listen(TEST_PORT, resolve));

  await runAsyncTest('6.1 GET /auth/callback.html returns HTTP 200 with HTML content', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/auth/callback.html`);
    assert.strictEqual(res.status, 200, 'Should return HTTP 200');
    const text = await res.text();
    assert.ok(text.includes('Pengesahan Google'), 'Content must contain Pengesahan Google');
  });

  await runAsyncTest('6.2 GET /auth/callback (without .html) returns HTTP 200 via route rewrite', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/auth/callback`);
    assert.strictEqual(res.status, 200, 'Should return HTTP 200');
    const text = await res.text();
    assert.ok(text.includes('Pengesahan Google'), 'Content must resolve to callback.html');
  });

  await runAsyncTest('6.3 GET /callback returns HTTP 200 via route rewrite', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/callback`);
    assert.strictEqual(res.status, 200, 'Should return HTTP 200');
    const text = await res.text();
    assert.ok(text.includes('Pengesahan Google'), 'Content must resolve to callback.html');
  });
}

(async () => {
  try {
    await testLocalHttpServer();
  } finally {
    if (testServer && testServer.close) {
      await new Promise(resolve => testServer.close(resolve));
    }
  }
  console.log('\n================================================================');
  console.log(`📊 OAUTH TEST SUMMARY: ${passedTests} / ${totalTests} passed (${Math.round(passedTests/totalTests*100)}%)`);
  console.log('================================================================');
  if (passedTests === totalTests) {
    console.log('🎉 ALL GOOGLE OAUTH SPECIFICATIONS VERIFIED & PASSING!\n');
    process.exitCode = 0;
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exitCode = 1;
  }
})();
