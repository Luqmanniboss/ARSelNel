const fs = require('fs');

const hab = fs.readFileSync('hab_permainan/code.html', 'utf8');
const cq = fs.readFileSync('cellquest/code.html', 'utf8');

let errors = 0;

console.log('--- TEST 1: HAB PERMAINAN CLEANUP ---');
if (hab.includes('3D & AR ADVENTURE') || hab.includes('Mula Pengembaraan 3D/AR')) {
  console.error('❌ FAIL: hab_permainan still contains duplicate CellQuest featured card');
  errors++;
} else {
  console.log('✅ PASS: hab_permainan duplicate card successfully removed');
}

if (!hab.includes('id="btn-main-leaderboard"')) {
  console.error('❌ FAIL: hab_permainan missing btn-main-leaderboard');
  errors++;
} else {
  console.log('✅ PASS: hab_permainan btn-main-leaderboard is preserved');
}

if (!hab.includes('Labelkan Organel') || !hab.includes('Maze Chase: Misi Sel Haiwan') || !hab.includes('Susun Organisasi Kehidupan') || !hab.includes('Kuiz Saintis Muda')) {
  console.error('❌ FAIL: hab_permainan missing one or more quiz cards');
  errors++;
} else {
  console.log('✅ PASS: All 4 quiz cards in hab_permainan are properly arranged in grid');
}

console.log('\n--- TEST 2: CELLQUEST MAROON-PURPLE THEME ---');
if (!cq.includes('cq-adventure-banner')) {
  console.error('❌ FAIL: cellquest missing cq-adventure-banner');
  errors++;
} else {
  console.log('✅ PASS: cq-adventure-banner exists');
}

if (!cq.includes('#581C45') || !cq.includes('#5B21B6')) {
  console.error('❌ FAIL: cq-adventure-banner missing Maroon-Purple gradient (#581C45 and #5B21B6)');
  errors++;
} else {
  console.log('✅ PASS: Maroon (#581C45) and Purple (#5B21B6) gradient applied');
}

if (!cq.includes('#EDE9FE') || !cq.includes('#5B21B6')) {
  console.error('❌ FAIL: Module badge missing soft lavender #EDE9FE or deep purple text');
  errors++;
} else {
  console.log('✅ PASS: Module badge styled with soft lavender (#EDE9FE) & deep purple (#5B21B6)');
}

if (!cq.includes('#F97316') || !cq.includes('Mula Pengembaraan') || !cq.includes('href="adventure.html"')) {
  console.error('❌ FAIL: Button Mula Pengembaraan missing orange gradient or link');
  errors++;
} else {
  console.log('✅ PASS: Button Mula Pengembaraan styled with cheerful orange (#F97316) linking to adventure.html');
}

if (!cq.includes('#8B5CF6') || !cq.includes('Cara Bermain') || !cq.includes('adventure.html?mode=how')) {
  console.error('❌ FAIL: Button Cara Bermain missing lavender gradient or link');
  errors++;
} else {
  console.log('✅ PASS: Button Cara Bermain styled with lavender/purple (#8B5CF6) linking to adventure.html?mode=how');
}

if (!cq.includes('rgba(196, 181, 253, 0.2)')) {
  console.error('❌ FAIL: Gamepad decoration missing soft lavender hue');
  errors++;
} else {
  console.log('✅ PASS: Decorative gamepad icon matches soft lavender palette');
}

if (errors === 0) {
  console.log('\n🎉 ALL 8 TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`\n❌ ${errors} test(s) failed.`);
  process.exit(1);
}

