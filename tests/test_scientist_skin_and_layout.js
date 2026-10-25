// tests/test_scientist_skin_and_layout.js
// Verification for character redesign, skin tone, zero text-overlap, and responsiveness

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧑‍🔬 Verification: Scientist Character Skin Tone, Hair & Zero Overlap');
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
const loginHtml = fs.readFileSync(path.join(rootDir, 'auth/login.html'), 'utf8');
const registerHtml = fs.readFileSync(path.join(rootDir, 'auth/register.html'), 'utf8');

const files = [
  { name: 'auth/login.html', content: loginHtml },
  { name: 'auth/register.html', content: registerHtml }
];

files.forEach(({ name, content }) => {
  console.log(`--- Checking ${name} ---`);

  test(`${name}: Zero text-overlap layout with dedicated flex zone`, () => {
    assert(content.includes('scientist-dedicated-zone'), 'Must have dedicated scientist zone class');
    assert(content.includes('flex flex-col justify-between'), 'Overlay must use flex column layout');
    // Ensure no fixed absolute bottom positioning that collides with text
    assert(!content.includes('bottom: 24px; left: 50%; transform: translateX(-50%); width: 210px; height: 290px;'), 'Must not use old oversized absolute puppet');
  });

  test(`${name}: Natural fair peach skin tone (NO bright yellow)`, () => {
    assert(content.includes('#fff1e6'), 'Must have fair peach light stop');
    assert(content.includes('#fde2d0'), 'Must have natural skin mid stop');
    assert(content.includes('#fbcbb5'), 'Must have peach shadow stop');
    // Ensure the old bright Simpsons-yellow is removed
    assert(!content.includes('#fcd34d'), 'Must NOT contain bright yellow #fcd34d skin tone');
    assert(!content.includes('#fbbf24'), 'Must NOT contain dark yellow #fbbf24 skin tone');
  });

  test(`${name}: Dark brown / soft black hair`, () => {
    assert(content.includes('#3b2d28') || content.includes('#221815') || content.includes('g-hair'), 'Must use natural dark hair gradient');
  });

  test(`${name}: Cute scientist glasses and cheerful smile`, () => {
    assert(content.includes('stroke="#00BFA6"'), 'Must have teal frame glasses');
    assert(content.includes('char-eyes'), 'Must have animated blinking eyes');
    assert(content.includes('char-pupils'), 'Must have interactive pupils');
    assert(content.includes('char-speech'), 'Must have speech bubble');
  });

  test(`${name}: Mobile responsive configuration for small screens (320px - 430px)`, () => {
    assert(content.includes('@media (max-width: 1023px)'), 'Must have tablet/mobile media query');
    assert(content.includes('@media (max-width: 420px)'), 'Must have small mobile media query');
    assert(content.includes('speech-bubble') && content.includes('display: none !important'), 'Speech bubble must be hidden on mobile to prevent overflow');
  });

  test(`${name}: Preserves core auth and security functionality`, () => {
    assert(content.includes('ARSupabase'), 'Must keep ARSupabase');
    assert(content.includes('AuthGuard'), 'Must keep AuthGuard');
    assert(content.includes('handleGoogleAuth') || content.includes('handleGoogleLogin'), 'Must keep Google OAuth');
  });

  console.log('');
});

console.log('================================================================');
console.log(`📊 TEST SUMMARY: ${passed} / ${passed + failed} passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SCIENTIST ENHANCEMENT TESTS PASSED PERFECTLY!\n');
}
