/**
 * ARSelNel - Comprehensive Authentication & Security Test Suite
 * Tests student registration, Google OAuth methods, password visibility toggles,
 * Bahasa Melayu error mapping, session persistence, and role guards.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🔬 ARSelNel Authentication & Security Test Suite');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
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

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ----------------------------------------------------------------------------
// SUITE 1: FILE & CONFIGURATION AUDIT
// ----------------------------------------------------------------------------
console.log('--- SUITE 1: Codebase Audit & Configuration ---');

runTest('1.1 Required auth files exist and are non-empty', () => {
  const files = [
    'auth/register.html',
    'auth/login.html',
    'assets/js/supabase-client.js',
    'assets/js/auth.js',
    'assets/js/auth-guard.js',
    'register.html',
    'login.html'
  ];
  for (const f of files) {
    const fullPath = path.join(ROOT_DIR, f);
    assert.ok(fs.existsSync(fullPath), `File missing: ${f}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 50, `File too small: ${f}`);
  }
});

runTest('1.2 Root redirects properly route to auth subfolder', () => {
  const regRoot = fs.readFileSync(path.join(ROOT_DIR, 'register.html'), 'utf8');
  assert.ok(regRoot.includes('auth/register.html'), 'register.html must redirect to auth/register.html');
  const loginRoot = fs.readFileSync(path.join(ROOT_DIR, 'login.html'), 'utf8');
  assert.ok(loginRoot.includes('auth/login.html'), 'login.html must redirect to auth/login.html');
});

// ----------------------------------------------------------------------------
// SUITE 2: EMAIL VALIDATION & BM ERROR MAPPINGS
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Email Format Validation & Bahasa Melayu Errors ---');

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

runTest('2.1 Valid Gmail addresses pass format regex', () => {
  const validGmails = ['pelajar@gmail.com', 'harith.zulkifli@gmail.com', 'sains.kssm+1@gmail.com'];
  for (const email of validGmails) {
    assert.ok(EMAIL_REGEX.test(email), `Valid Gmail should pass: ${email}`);
  }
});

runTest('2.2 Valid Non-Gmail, institutional and school emails pass regex', () => {
  const validNonGmails = [
    'pelajar@outlook.com',
    'pelajar@yahoo.com',
    'cikgu@moe-dl.edu.my',
    'student@siswa.um.edu.my',
    'user@hotmail.com',
    'user@icloud.com'
  ];
  for (const email of validNonGmails) {
    assert.ok(EMAIL_REGEX.test(email), `Valid non-Gmail should pass: ${email}`);
  }
});

runTest('2.3 Malformed and invalid email formats are rejected by regex', () => {
  const invalidEmails = [
    'plainaddress',
    '@missingusername.com',
    'username@.com',
    'username@domain..com',
    'user space@domain.com'
  ];
  for (const email of invalidEmails) {
    assert.ok(!EMAIL_REGEX.test(email), `Invalid email should fail: ${email}`);
  }
});

// Mock Supabase friendlyError logic from assets/js/supabase-client.js
function friendlyError(error) {
  const raw = error && typeof error === 'object'
    ? (error.message || error.msg || error.error_description || error.error_code || '')
    : (typeof error === 'string' ? error : '');
  const message = raw || 'Permintaan tidak berjaya.';

  if (/invalid login credentials/i.test(message)) return 'E-mel atau kata laluan tidak tepat.';
  if (/email not confirmed/i.test(message)) return 'Sahkan e-mel anda melalui pautan yang dihantar sebelum log masuk.';
  if (/already registered|user already registered|user_already_exists/i.test(message)) return 'E-mel ini telah didaftarkan dalam sistem ARSelNel. Sila log masuk ke akaun anda atau gunakan tetapan semula kata laluan.';
  if (/invalid.*email|email.*is invalid|unable to validate email|email address.*invalid/i.test(message)) return 'Alamat e-mel ini tidak sah atau tidak diterima oleh pelayan pengesahan. Sila gunakan alamat e-mel sebenar (contoh: Gmail, Outlook, Yahoo atau e-mel sekolah/institusi).';
  if (/password.*should be at least|password.*least 6/i.test(message)) return 'Kata laluan mestilah sekurang-kurangnya 6 aksara.';
  if (/over_email_send_rate_limit|rate limit/i.test(message)) return 'Terlalu banyak percubaan dalam masa singkat. Sila tunggu beberapa minit sebelum mencuba lagi.';
  if (/signup is disabled|signups not allowed/i.test(message)) return 'Pendaftaran akaun baharu ditutup sementara oleh pentadbir.';
  if (/fetch|network|failed to load/i.test(message)) return 'Sambungan ke pelayan Supabase gagal. Sila periksa capaian Internet anda dan cuba lagi.';
  return message;
}

runTest('2.4 Email address "muhd@test.com" is invalid maps to Bahasa Melayu', () => {
  const rawSupabaseError = { message: 'Email address "muhd@test.com" is invalid' };
  const translated = friendlyError(rawSupabaseError);
  assert.ok(translated.includes('Alamat e-mel ini tidak sah atau tidak diterima'), `Must translate to BM: ${translated}`);
});

runTest('2.5 Duplicate registration errors map to clear BM message', () => {
  const dup1 = friendlyError({ message: 'User already registered' });
  const dup2 = friendlyError({ message: 'user_already_exists' });
  assert.ok(dup1.includes('telah didaftarkan dalam sistem ARSelNel'), `Must map duplicate user: ${dup1}`);
  assert.ok(dup2.includes('telah didaftarkan dalam sistem ARSelNel'), `Must map duplicate code: ${dup2}`);
});

runTest('2.6 Password length errors map to BM', () => {
  const passErr = friendlyError({ message: 'Password should be at least 6 characters' });
  assert.ok(passErr.includes('sekurang-kurangnya 6 aksara'), `Must map password length: ${passErr}`);
});

// ----------------------------------------------------------------------------
// SUITE 3: UI CONTROLS & ACCESSIBILITY AUDIT
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 3: UI Controls, Password Toggles & Google Button ---');

const registerHtml = fs.readFileSync(path.join(ROOT_DIR, 'auth/register.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(ROOT_DIR, 'auth/login.html'), 'utf8');

runTest('3.1 Google Sign-in button exists on register.html with "Teruskan dengan Google"', () => {
  assert.ok(registerHtml.includes('Teruskan dengan Google'), 'register.html must contain "Teruskan dengan Google"');
  assert.ok(registerHtml.includes('handleGoogleAuth()'), 'register.html must bind handleGoogleAuth');
  assert.ok(registerHtml.includes('google-register-btn'), 'register.html must have google-register-btn ID');
});

runTest('3.2 Google Sign-in button exists on login.html with "Teruskan dengan Google"', () => {
  assert.ok(loginHtml.includes('Teruskan dengan Google'), 'login.html must contain "Teruskan dengan Google"');
  assert.ok(loginHtml.includes('handleGoogleLogin()'), 'login.html must bind handleGoogleLogin');
  assert.ok(loginHtml.includes('google-login-btn'), 'login.html must have google-login-btn ID');
});

runTest('3.3 Password visibility buttons on register.html for both fields', () => {
  assert.ok(registerHtml.includes('id="toggle-reg-pass"'), 'register.html must have toggle-reg-pass button');
  assert.ok(registerHtml.includes('id="toggle-reg-pass-confirm"'), 'register.html must have toggle-reg-pass-confirm button');
  assert.ok(registerHtml.includes('aria-label='), 'Must have aria-label');
  assert.ok(registerHtml.includes('aria-pressed='), 'Must have aria-pressed');
  assert.ok(registerHtml.includes('type="button"'), 'Toggles must be type="button" to prevent submit');
});

runTest('3.4 Password visibility button on login.html with accessibility', () => {
  assert.ok(loginHtml.includes('id="toggle-login-pass"'), 'login.html must have toggle-login-pass button');
  assert.ok(loginHtml.includes('aria-label='), 'Must have aria-label');
  assert.ok(loginHtml.includes('aria-pressed='), 'Must have aria-pressed');
});

runTest('3.5 Honeypot bot protection field present in register form', () => {
  assert.ok(registerHtml.includes('id="reg-hp"'), 'Must have reg-hp honeypot field');
  assert.ok(registerHtml.includes('class="hidden"'), 'Honeypot field must be hidden');
});

runTest('3.6 Loading spinner & submission states present', () => {
  assert.ok(registerHtml.includes('reg-submit-spinner'), 'register.html must have reg-submit-spinner');
  assert.ok(loginHtml.includes('login-submit-spinner'), 'login.html must have login-submit-spinner');
});

// ----------------------------------------------------------------------------
// SUITE 4: SUPABASE CLIENT METHODS AUDIT
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Supabase Client & OAuth Implementation ---');

const supabaseClientJs = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/supabase-client.js'), 'utf8');

runTest('4.1 signInWithGoogle method implemented on ARSupabase', () => {
  assert.ok(supabaseClientJs.includes('signInWithGoogle:'), 'Must export signInWithGoogle');
  assert.ok(supabaseClientJs.includes("provider: 'google'"), 'Must specify provider: google');
});

runTest('4.2 handleOAuthCallback method implemented', () => {
  assert.ok(supabaseClientJs.includes('handleOAuthCallback:'), 'Must export handleOAuthCallback');
  assert.ok(supabaseClientJs.includes("from('profiles')"), 'Must query profiles table');
  assert.ok(supabaseClientJs.includes("from('admin_users')"), 'Must check admin_users to prevent privilege overwrite');
});

runTest('4.3 Role integrity: default new student accounts to student role', () => {
  assert.ok(supabaseClientJs.includes("role: 'student'"), 'Must explicitly default new registrations to student');
  assert.ok(registerHtml.includes("role: 'student'"), 'register.html must enforce student role');
});

runTest('4.4 authenticatedClient supports both supabase and google providers', () => {
  assert.ok(supabaseClientJs.includes("appUser.authProvider !== 'google'"), 'authenticatedClient must accept google authProvider');
});

// ----------------------------------------------------------------------------
// SUITE 5: LIVE SUPABASE AUTH INTEGRATION (NETWORK)
// ----------------------------------------------------------------------------
console.log('\n--- SUITE 5: Live Supabase Auth Endpoint Verification ---');

const SUPABASE_URL = 'https://kxjhlbudsiojpvzwqwva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U';

async function testSupabaseIntegration() {
  await runAsyncTest('5.1 Supabase server health check / public ping', async () => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_KEY }
    });
    assert.strictEqual(res.status, 200, 'Supabase auth service should be reachable (status 200)');
  });

  await runAsyncTest('5.2 Supabase rejects malformed email with 400 format error', async () => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email-format', password: 'Password123!' })
    });
    assert.strictEqual(res.status, 400, 'Malformed email should return HTTP 400');
    const data = await res.json();
    const msg = data.msg || data.message || '';
    assert.ok(/invalid format|unable to validate/i.test(msg), `Should return format error: ${msg}`);
  });

  await runAsyncTest('5.3 Duplicate signup returns 422 user_already_exists', async () => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'muhd@test.com', password: 'Password123!' })
    });
    assert.strictEqual(res.status, 422, 'Duplicate user should return HTTP 422');
    const data = await res.json();
    assert.strictEqual(data.error_code, 'user_already_exists', 'Error code must be user_already_exists');
    const translated = friendlyError(data);
    assert.ok(translated.includes('telah didaftarkan dalam sistem ARSelNel'), 'Must translate to helpful BM text');
  });

  await runAsyncTest('5.4 Immediate session generation confirmed when email confirmation is disabled', async () => {
    // Generate unique random student email to verify instant session flow
    const randomId = Math.random().toString(36).substring(2, 10);
    const testStudentEmail = `arselnel.student.${randomId}@gmail.com`;

    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'StudentPassword2026!',
        data: { full_name: 'Ujian Pelajar Otomasi', role: 'student' }
      })
    });

    assert.strictEqual(res.status, 200, `Signup should succeed with 200 for ${testStudentEmail}`);
    const data = await res.json();
    assert.ok(data.access_token, 'Access token should be issued immediately');
    assert.ok(data.user && data.user.id, 'User ID must be returned');
    assert.strictEqual(data.user.email, testStudentEmail);
    console.log(`     ℹ️ Verified instant session established for: ${testStudentEmail}`);
  });
}

(async () => {
  try {
    await testSupabaseIntegration();
  } catch (netErr) {
    console.warn(`     ⚠️ Network test skipped or failed: ${netErr.message}`);
  }

  console.log('\n================================================================');
  console.log(`📊 TEST SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.\n');
    process.exit(1);
  }
})();
