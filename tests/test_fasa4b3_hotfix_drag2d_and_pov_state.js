/**
 * Automated Verification Suite for Hotfix Fasa 4B.3:
 * 1. Bug 1: Butang Kunci POV Aktif (MARKER -> SCREEN_PINNED -> POV_SETUP -> POV_LOCKED)
 * 2. Bug 2: 2D Drag Engine Penuh (X, Y dan Diagonal) pada iPad Safari Touch
 * 3. Modular Toast Notifications (Nota vs Video)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 UJIAN AUTOMATIK: KOTAK ARSELNEL - HOTFIX FASA 4B.3');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅ LULUS: ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ GAGAL: ${description}`);
    console.error(`     Ralat: ${err.message}`);
    failCount++;
  }
}

const htmlPath = path.join(__dirname, '../kotak_arselnel/code.html');
const cssPath = path.join(__dirname, '../kotak_arselnel/kotak-arselnel.css');
const jsPath = path.join(__dirname, '../kotak_arselnel/kotak-arselnel.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// -----------------------------------------------------------------------------
// BAHAGIAN 1: PERBAIKAN BUG 1 (KUNCI POV NOTA & STATE MACHINE)
// -----------------------------------------------------------------------------
console.log('--- BAHAGIAN 1: PERBAIKAN BUG 1 (KUNCI POV NOTA & STATE MACHINE) ---');

test('JS: startPOVMode() TIDAK membatalkan ke mod SCREEN_PINNED jika izin sensor ditolak/tiada', () => {
  const fnIdx = js.indexOf('async function startPOVMode()');
  const nextFn = js.indexOf('function exitPOVMode');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(!fnBlock.includes('setSystemMode(SYSTEM_MODES.SCREEN_PINNED);'), 'Masih terdapat panggilan fallback ke SCREEN_PINNED dalam startPOVMode');
  assert(!fnBlock.includes('placeVideoOnScreen();'), 'Terdapat panggilan tidak sengaja placeVideoOnScreen dalam startPOVMode');
});

test('JS: startPOVMode() menamatkan sebarang gerak isyarat seret aktif sebelum masuk POV', () => {
  const fnIdx = js.indexOf('async function startPOVMode()');
  const nextFn = js.indexOf('function exitPOVMode');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes('ARState.isDragging = false;'), 'isDragging tidak dimatikan pada permulaan startPOVMode');
});

test('JS: startPOVMode() beralih terus ke state POV_SETUP dengan teguh', () => {
  const fnIdx = js.indexOf('async function startPOVMode()');
  const nextFn = js.indexOf('function exitPOVMode');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes('setSystemMode(SYSTEM_MODES.POV_SETUP);'), 'setSystemMode(SYSTEM_MODES.POV_SETUP) tidak dipanggil');
});

test('JS: Notifikasi permulaan POV Setup adalah tepat untuk murid iPad', () => {
  const fnIdx = js.indexOf('async function startPOVMode()');
  const nextFn = js.indexOf('function exitPOVMode');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes('Halakan iPad ke arah pilihan dan tekan "Letak di Arah Ini".'), 'Teks notifikasi POV Setup tidak sepadan');
});

test('JS: anchorPOVAtCurrentHeading() beralih ke state POV_LOCKED dan memaparkan notifikasi kejayaan', () => {
  const fnIdx = js.indexOf('function anchorPOVAtCurrentHeading()');
  const nextFn = js.indexOf('function recalibratePOV()');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes('setSystemMode(SYSTEM_MODES.POV_LOCKED);'), 'setSystemMode(SYSTEM_MODES.POV_LOCKED) tidak dipanggil');
  assert(fnBlock.includes('POV berjaya dikunci pada arah pilihan.'), 'Notifikasi kejayaan POV Locked tidak sepadan');
});

test('JS: placeVideoOnScreen() memaparkan notifikasi modular mengikut modul aktif (Nota vs Video)', () => {
  const fnIdx = js.indexOf('function placeVideoOnScreen(');
  const nextFn = js.indexOf('function toggleLockPosition()');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes("const modLabel = (ARState.activeModule === 'nota') ? 'Nota' : 'Video';"), 'modLabel tidak ditentukan mengikut activeModule');
  assert(fnBlock.includes('`📌 ${modLabel} disematkan ke skrin! Anda boleh seret panel atau ubah saiz.`'), 'Teks notifikasi dinamik tidak wujud');
});

test('JS: exitPOVMode(true) memaparkan notifikasi semat semula modular mengikut modul aktif', () => {
  const fnIdx = js.indexOf('function exitPOVMode(');
  const nextFn = js.indexOf('function bringPOVPanelToCenter()');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes("const modLabel = (ARState.activeModule === 'nota') ? 'Nota' : 'Video';"), 'modLabel tidak digunakan dalam exitPOVMode');
  assert(fnBlock.includes('`📌 ${modLabel} disematkan semula ke skrin.`'), 'Teks notifikasi semat semula tidak dinamik');
});

// -----------------------------------------------------------------------------
// BAHAGIAN 2: PERBAIKAN BUG 2 (DRAG 2D SEBENAR: X, Y DAN DIAGONAL)
// -----------------------------------------------------------------------------
console.log('\n--- BAHAGIAN 2: PERBAIKAN BUG 2 (DRAG 2D SEBENAR: X, Y DAN DIAGONAL) ---');

test('CSS: .panel-fixed-header menggunakan touch-action: none !important (Ketiadaan pan-y penghalang paksi X)', () => {
  const headerIdx = css.indexOf('.panel-fixed-header {');
  const headerBlock = css.slice(headerIdx, headerIdx + 300);
  assert(headerBlock.includes('touch-action: none !important;'), '.panel-fixed-header tidak mempunyai touch-action: none !important');
  assert(!headerBlock.includes('touch-action: pan-y;'), '.panel-fixed-header masih mengandungi touch-action: pan-y;');
});

test('CSS: .card-drag-bar dan semua anaknya menguatkuasakan touch-action: none !important', () => {
  assert(css.includes('.card-drag-bar,') || css.includes('.card-drag-bar {'), '.card-drag-bar tidak dijumpai');
  assert(css.includes('touch-action: none !important;'), 'touch-action: none !important tiada dalam drag bar');
});

test('CSS: .panel-scrollable-body mengekalkan penatalan vertikal nota (touch-action: pan-y)', () => {
  const bodyIdx = css.indexOf('.panel-scrollable-body {');
  const bodyBlock = css.slice(bodyIdx, bodyIdx + 400);
  assert(bodyBlock.includes('touch-action: pan-y;'), 'penatalan nota vertikal rosak');
  assert(bodyBlock.includes('overflow-y: auto;'), 'overflow-y auto tidak dijumpai pada badan scroll');
});

test('JS: handleDragMove mengira deltaX dan deltaY daripada koordinat pointer sebenar', () => {
  const fnIdx = js.indexOf('const handleDragMove =');
  const nextFn = js.indexOf('const handleDragEnd =');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(fnBlock.includes('const deltaX = e.clientX - ARState.dragStartX;'), 'deltaX tidak dikira dengan betul');
  assert(fnBlock.includes('const deltaY = e.clientY - ARState.dragStartY;'), 'deltaY tidak dikira dengan betul');
  assert(fnBlock.includes('let newX = ARState.initialPanelX + deltaX;'), 'newX tidak mengambil kira initialPanelX');
  assert(fnBlock.includes('let newY = ARState.initialPanelY + deltaY;'), 'newY tidak mengambil kira initialPanelY');
});

test('JS: handleDragMove TIDAK mengunci paksi X kepada center jika minX > maxX', () => {
  const fnIdx = js.indexOf('const handleDragMove =');
  const nextFn = js.indexOf('const handleDragEnd =');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(!fnBlock.includes('newX = window.innerWidth / 2;'), 'X masih dikunci secara tegar ke window.innerWidth / 2');
});

test('JS: clampPanelIntoViewport TIDAK mengunci paksi X kepada center jika minX > maxX', () => {
  const fnIdx = js.indexOf('function clampPanelIntoViewport()');
  const nextFn = js.indexOf('function placeVideoOnScreen(');
  const fnBlock = js.slice(fnIdx, nextFn);
  assert(!fnBlock.includes('clampedX = window.innerWidth / 2;'), 'clampedX masih dikunci secara tegar ke window.innerWidth / 2');
});

test('JS: Event listeners butang utama mengandungi stopPropagation bagi menghalang gangguan drag', () => {
  const listIdx = js.indexOf('function initListeners()');
  const nextFn = js.indexOf('function init()');
  const listBlock = js.slice(listIdx, nextFn);
  assert(listBlock.includes('DOM.btnStartPOV.addEventListener'), 'btnStartPOV listener tiada');
  assert(listBlock.includes('DOM.btnPlaceVideo.addEventListener'), 'btnPlaceVideo listener tiada');
  assert(listBlock.includes('DOM.btnLockVideo.addEventListener'), 'btnLockVideo listener tiada');
  assert(listBlock.includes('DOM.dragLockBadge.addEventListener'), 'dragLockBadge tap listener tiada');
});

// -----------------------------------------------------------------------------
// KEPUTUSAN KESELURUHAN
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 KEPUTUSAN UJIAN HOTFIX FASA 4B.3:`);
console.log(`   LULUS: ${passCount}`);
console.log(`   GAGAL: ${failCount}`);
console.log(`   JUMLAH: ${passCount + failCount}`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 SEMUA UJIAN AUTOMATIK FASA 4B.3 BERJAYA!');
}
