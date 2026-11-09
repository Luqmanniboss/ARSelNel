/**
 * Automated Verification Suite for Hotfix Fasa 4B.2:
 * 1. Masalah 1: POV Lock Nota 3DoF Engine & Telemetry Sync
 * 2. Masalah 2: Drag Bar Pointer Capture & iPad Touch Action
 * 3. Masalah 3: CMS Notes Multi-Format Audit & Presentation
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================================');
console.log('🧪 UJIAN AUTOMATIK: KOTAK ARSELNEL - HOTFIX FASA 4B.2');
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
// MASALAH 1: POV LOCK NOTA
// -----------------------------------------------------------------------------
console.log('--- BAHAGIAN 1: POV LOCK NOTA (3DoF YAW + PITCH ENGINE) ---');

test('HTML: #pov-active-nota-view mengandungi banner panduan arah POV', () => {
  assert(html.includes('id="pov-nota-status-banner"'), 'Tiada id="pov-nota-status-banner"');
  assert(html.includes('id="pov-nota-banner-icon"'), 'Tiada id="pov-nota-banner-icon"');
  assert(html.includes('id="pov-nota-banner-text"'), 'Tiada id="pov-nota-banner-text"');
});

test('HTML: #pov-active-nota-view mengandungi cip telemetri Yaw, Pitch dan Status', () => {
  assert(html.includes('id="pov-nota-val-yaw"'), 'Tiada id="pov-nota-val-yaw"');
  assert(html.includes('id="pov-nota-val-pitch"'), 'Tiada id="pov-nota-val-pitch"');
  assert(html.includes('id="pov-nota-val-status"'), 'Tiada id="pov-nota-val-status"');
});

test('JS: initDOMElements mencache elemen telemetri & banner nota POV', () => {
  assert(js.includes("DOM.povNotaValYaw = document.getElementById('pov-nota-val-yaw')"), 'DOM.povNotaValYaw tidak dicache');
  assert(js.includes("DOM.povNotaValPitch = document.getElementById('pov-nota-val-pitch')"), 'DOM.povNotaValPitch tidak dicache');
  assert(js.includes("DOM.povNotaValStatus = document.getElementById('pov-nota-val-status')"), 'DOM.povNotaValStatus tidak dicache');
  assert(js.includes("DOM.povNotaStatusBanner = document.getElementById('pov-nota-status-banner')"), 'DOM.povNotaStatusBanner tidak dicache');
});

test('JS: startPOVMode() mengekalkan halaman & zoom nota aktif tanpa reset', () => {
  assert(js.includes('// Preserve active note page and zoom without resetting'), 'Komen pengekalan nota tidak dijumpai');
  assert(js.includes('syncPOVNoteContent();'), 'syncPOVNoteContent tidak dipanggil');
  // Pastikan selectNote HANYA dipanggil jika !ARState.activeNote
  const startPOVIdx = js.indexOf('async function startPOVMode()');
  const startPOVBlock = js.slice(startPOVIdx, startPOVIdx + 1500);
  assert(startPOVBlock.includes('if (!ARState.activeNote)'), 'Ketiadaan semakan activeNote sebelum select');
});

test('JS: startPOVRenderLoop() mengemaskini sudut telemetri kedua-dua Video dan Nota', () => {
  assert(js.includes('if (DOM.povNotaValYaw) DOM.povNotaValYaw.textContent ='), 'DOM.povNotaValYaw tidak dikemaskini dalam loop');
  assert(js.includes('if (DOM.povNotaValPitch) DOM.povNotaValPitch.textContent ='), 'DOM.povNotaValPitch tidak dikemaskini dalam loop');
});

test('JS: setSystemMode() menyelaraskan banner & cip status untuk kedua-dua modul', () => {
  assert(js.includes('if (DOM.povNotaValStatus)'), 'DOM.povNotaValStatus tidak dikemaskini dalam setSystemMode');
  assert(js.includes('if (DOM.povNotaStatusBanner)'), 'DOM.povNotaStatusBanner tidak dikemaskini dalam setSystemMode');
});

test('JS: anchorPOVAtCurrentHeading() mengunci arah dan mengemas kini status Nota POV', () => {
  const anchorIdx = js.indexOf('function anchorPOVAtCurrentHeading()');
  const anchorBlock = js.slice(anchorIdx, anchorIdx + 3500);
  assert(anchorBlock.includes('if (DOM.povNotaValStatus)'), 'povNotaValStatus tidak dikemaskini semasa anchor dikunci');
  assert(anchorBlock.includes('if (DOM.povNotaStatusBanner)'), 'povNotaStatusBanner tidak dikemaskini semasa anchor dikunci');
});

// -----------------------------------------------------------------------------
// MASALAH 2: DRAG BAR PADA IPAD SAFARI TOUCH
// -----------------------------------------------------------------------------
console.log('\n--- BAHAGIAN 2: DRAG BAR PADA IPAD SAFARI TOUCH ---');

test('CSS: .card-drag-bar dan anaknya menetapkan touch-action: none !important', () => {
  assert(css.includes('touch-action: none !important;'), 'touch-action: none !important tidak dijumpai dalam CSS');
  assert(css.includes('.card-drag-bar *'), 'Peraturan .card-drag-bar * tidak dijumpai');
});

test('CSS: .card-drag-bar melumpuhkan text selection pada Safari (-webkit-user-select)', () => {
  assert(css.includes('-webkit-user-select: none !important;'), '-webkit-user-select tidak dijumpai');
  assert(css.includes('-webkit-touch-callout: none !important;'), '-webkit-touch-callout tidak dijumpai');
});

test('CSS: .card-drag-bar * mempunyai pointer-events: none untuk kestabilan target sentuhan', () => {
  assert(css.includes('pointer-events: none;'), 'pointer-events: none pada anak bar seret tidak dijumpai');
  assert(css.includes('.card-drag-bar .lock-indicator-badge'), 'lock-indicator-badge pointer-events override tidak dijumpai');
});

test('CSS: .panel-fixed-header menggunakan touch-action: pan-y', () => {
  assert(css.includes('touch-action: pan-y;'), 'touch-action: pan-y pada header tidak dijumpai');
});

test('CSS: .floating-card-container.is-dragging melumpuhkan pointer-events pada canvas/iframe/video', () => {
  assert(css.includes('.floating-card-container.is-dragging canvas'), 'is-dragging canvas tidak dijumpai');
});

test('JS: initDragHandlers() melaksanakan setPointerCapture & releasePointerCapture', () => {
  assert(js.includes('e.target.setPointerCapture(e.pointerId)'), 'setPointerCapture tidak dipanggil');
  assert(js.includes('releasePointerCapture('), 'releasePointerCapture tidak dipanggil');
});

test('JS: handleDragStart mengabaikan penyeretan jika panel dikunci (isLocked)', () => {
  assert(js.includes('if (!ARState.isPinned || ARState.isLocked) return;'), 'Semakan isLocked pada dragStart tidak wujud');
});

test('JS: handleDragMove mematuhi sempadan selamat (getSafeAreaBounds)', () => {
  const moveIdx = js.indexOf('const handleDragMove =');
  const moveBlock = js.slice(moveIdx, moveIdx + 1200);
  assert(moveBlock.includes('getSafeAreaBounds()'), 'getSafeAreaBounds tidak dipanggil dalam dragMove');
  assert(moveBlock.includes('Math.max(Math.min(minX, maxX)'), 'Clamping X tidak wujud');
  assert(moveBlock.includes('Math.max(Math.min(minY, maxY)'), 'Clamping Y tidak wujud');
});

test('JS: setSystemMode(SCREEN_PINNED) memanggil placeVideoOnScreen(true) secara tegas', () => {
  assert(js.includes('placeVideoOnScreen(true);'), 'placeVideoOnScreen(true) tidak dipanggil');
  assert(js.includes('function placeVideoOnScreen(force = false)'), 'placeVideoOnScreen tidak menyokong parameter force');
});

// -----------------------------------------------------------------------------
// MASALAH 3: AUDIT CMS NOTA & PEMAPARAN MULTI-FORMAT
// -----------------------------------------------------------------------------
console.log('\n--- BAHAGIAN 3: AUDIT CMS NOTA & PEMAPARAN MULTI-FORMAT ---');

test('CSS: Gaya kad slaid sains (.nota-slide-card) tersedia dengan reka bentuk moden', () => {
  assert(css.includes('.nota-slide-card'), '.nota-slide-card tidak dijumpai dalam CSS');
  assert(css.includes('.nota-slide-badge'), '.nota-slide-badge tidak dijumpai dalam CSS');
  assert(css.includes('.nota-slide-header'), '.nota-slide-header tidak dijumpai dalam CSS');
});

test('JS: splitNoteIntoPages() membungkus slaid interaktif teks ke dalam .nota-slide-card', () => {
  assert(js.includes('class="nota-slide-card"'), 'Kad slaid berformat tidak dijana dalam splitNoteIntoPages');
  assert(js.includes('class="nota-slide-badge"'), 'Lencana slaid tidak dijana dalam splitNoteIntoPages');
});

test('JS: parseNoteMarkdown() menyokong tajuk, senarai, bold, italic, dan petikan', () => {
  const fnIdx = js.indexOf('function parseNoteMarkdown(markdownText)');
  assert(fnIdx !== -1, 'parseNoteMarkdown tidak wujud');
  assert(js.includes('<strong>$1</strong>'), 'Parser bold tidak wujud');
  assert(js.includes('<li>$1</li>'), 'Parser senarai tidak wujud');
  assert(js.includes('<blockquote>$1</blockquote>'), 'Parser petikan tidak wujud');
});

test('JS: loadAndRenderPdfNote() menyokong PDF.js dengan zoom dan canvas resolusi tinggi', () => {
  assert(js.includes('renderPdfCanvasPage'), 'renderPdfCanvasPage tidak dijumpai');
  assert(js.includes('renderSinglePdfCanvas'), 'renderSinglePdfCanvas tidak dijumpai');
  assert(js.includes('window.devicePixelRatio'), 'devicePixelRatio tidak diambil kira untuk kanvas resolusi tinggi');
});

// -----------------------------------------------------------------------------
// KEPUTUSAN KESELURUHAN
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`📊 KEPUTUSAN UJIAN HOTFIX FASA 4B.2:`);
console.log(`   LULUS: ${passCount}`);
console.log(`   GAGAL: ${failCount}`);
console.log(`   JUMLAH: ${passCount + failCount}`);
console.log('======================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 SEMUA UJIAN AUTOMATIK FASA 4B.2 BERJAYA!');
}
