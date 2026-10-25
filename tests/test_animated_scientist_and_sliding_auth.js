// tests/test_animated_scientist_and_sliding_auth.js
// Verification suite for CODEX: Redesign ARSelNel Login & Sign Up with Animated Science Character

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 CODEX Verification: Animated Scientist & Sliding Auth Panel');
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
const vercelJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
const localServerJs = fs.readFileSync(path.join(rootDir, 'local-server.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const splashCodeHtml = fs.readFileSync(path.join(rootDir, 'splash_screen/code.html'), 'utf8');
const onboardingHtml = fs.readFileSync(path.join(rootDir, 'selamat_datang/code.html'), 'utf8');
const loginHtml = fs.readFileSync(path.join(rootDir, 'auth/login.html'), 'utf8');
const registerHtml = fs.readFileSync(path.join(rootDir, 'auth/register.html'), 'utf8');

// -------------------------------------------------------------
// SUITE 1: Splash Screen & Onboarding Removal / Route Alignment
// -------------------------------------------------------------
console.log('--- SUITE 1: Splash Screen & Onboarding Bypass ---');

test('1.1 vercel.json rewrites root "/" directly to /auth/login.html', () => {
  const rootRewrite = vercelJson.rewrites.find(r => r.source === '/');
  assert(rootRewrite, 'Root rewrite must exist');
  assert.strictEqual(rootRewrite.destination, '/auth/login.html', 'Root must route to /auth/login.html');
});

test('1.2 local-server.js maps root "/" to auth/login.html', () => {
  assert(localServerJs.includes("'/': 'auth/login.html'"), 'local-server.js must alias "/" to auth/login.html');
});

test('1.3 index.html checks session and routes to dashboard if logged in, or auth/login.html if guest', () => {
  assert(indexHtml.includes('arselnel_current_user'), 'index.html must check arselnel_current_user in storage');
  assert(indexHtml.includes("location.replace('auth/login.html'"), 'index.html must route to auth/login.html for guests');
  assert(!indexHtml.includes('splash_screen/code.html'), 'index.html must NOT redirect to splash_screen');
});

test('1.4 splash_screen/code.html and selamat_datang/code.html immediately bypass to auth/login.html', () => {
  assert(splashCodeHtml.includes("location.replace('../auth/login.html'"), 'splash_screen/code.html must bypass immediately');
  assert(onboardingHtml.includes("location.replace('../auth/login.html'"), 'selamat_datang/code.html must bypass immediately');
});

// -------------------------------------------------------------
// SUITE 2: Animated Scientist Character (Concept 1)
// -------------------------------------------------------------
console.log('\n--- SUITE 2: Animated Scientist Character Rigging ---');

test('2.1 Scientist vector character SVG with rigged parts exists in DOM', () => {
  assert(loginHtml.includes('id="scientist-char"'), 'Scientist character container must exist');
  assert(loginHtml.includes('id="char-head"'), 'Scientist head element must exist');
  assert(loginHtml.includes('id="char-eyes"'), 'Scientist eyes element must exist');
  assert(loginHtml.includes('id="char-pupils"'), 'Scientist pupils element must exist');
  assert(loginHtml.includes('id="char-hands-cover"'), 'Scientist hands cover element must exist');
  assert(loginHtml.includes('id="char-speech"'), 'Speech bubble element must exist');
});

test('2.2 CSS keyframes for character entrance and spring card pulling exist', () => {
  assert(loginHtml.includes('char-walk-in'), 'char-walk-in keyframes must exist');
  assert(loginHtml.includes('card-pull-spring'), 'card-pull-spring keyframes must exist');
  assert(loginHtml.includes('char-idle-bob'), 'char-idle-bob keyframes must exist');
});

test('2.3 Interactive scientist reaction states are implemented', () => {
  assert(loginHtml.includes('setScientistReaction'), 'setScientistReaction function must be implemented');
  assert(loginHtml.includes('watch-input'), 'watch-input state must be defined');
  assert(loginHtml.includes('hide-eyes'), 'hide-eyes state must be defined');
  assert(loginHtml.includes('peek-password'), 'peek-password state must be defined');
  assert(loginHtml.includes('cheer'), 'cheer victory state must be defined');
});

// -------------------------------------------------------------
// SUITE 3: Sliding Dual-Panel Architecture (Concept 2)
// -------------------------------------------------------------
console.log('\n--- SUITE 3: Sliding Dual-Panel Architecture ---');

test('3.1 Sliding welcome overlay panel exists with toggle buttons', () => {
  assert(loginHtml.includes('class="sliding-overlay'), 'sliding-overlay class must exist');
  assert(loginHtml.includes('id="btn-switch-to-register"'), 'btn-switch-to-register must exist');
  assert(loginHtml.includes('id="btn-switch-to-login"'), 'btn-switch-to-login must exist');
});

test('3.2 Login form and Register form coexist in dual-panel structure', () => {
  assert(loginHtml.includes('class="form-box form-box-login"'), 'form-box-login must exist');
  assert(loginHtml.includes('class="form-box form-box-register"'), 'form-box-register must exist');
  assert(loginHtml.includes('toggleAuthMode'), 'toggleAuthMode function must be implemented');
});

test('3.3 Password strength indicator is implemented on registration', () => {
  assert(loginHtml.includes('id="pass-strength-bar"'), 'pass-strength-bar must exist');
  assert(loginHtml.includes('id="pass-strength-label"'), 'pass-strength-label must exist');
  assert(loginHtml.includes('updatePasswordStrength'), 'updatePasswordStrength function must be implemented');
});

test('3.4 Responsive design & prefers-reduced-motion support', () => {
  assert(loginHtml.includes('@media (max-width: 1023px)'), 'Mobile responsive media query must be configured');
  assert(loginHtml.includes('prefers-reduced-motion: reduce'), 'prefers-reduced-motion must be supported');
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
  console.log('🎉 ALL ANIMATED SCIENTIST & SLIDING AUTH TESTS PASSED!\n');
}
