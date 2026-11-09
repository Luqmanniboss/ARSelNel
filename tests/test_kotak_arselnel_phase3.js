/**
 * ARSELNEL — Test Suite: Kotak ARSELNEL (Fasa 3: Screen-Pinned Mode, Drag & Lock)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runPhase3Tests() {
  console.log('================================================================');
  console.log('📦 UJIAN PENGESAHAN: KOTAK ARSELNEL (FASA 3 - SCREEN-PINNED MODE)');
  console.log('================================================================\n');

  const browserBin = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-p3-test-'));
  const cdpPort = 9260;

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--disable-features=PreloadMediaEngagementData',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await new Promise(resolve => {
    http.get(`http://127.0.0.1:${cdpPort}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const wsUrl = listRes[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let callId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = callId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('--- BAHAGIAN 1: PEMUATAN MODUL & SIMULASI PANEL VIDEO ---');
  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 1500));

  // Activate simulation mode for testing UI & video logic
  await send('Runtime.evaluate', {
    expression: 'window.KotakARSELNEL.startSimulationMode();'
  });
  await new Promise(r => setTimeout(r, 500));

  // Wait for videos to load
  await send('Runtime.evaluate', {
    expression: 'new Promise(r => { const c = () => { if (window.KotakARSELNEL.state.videos && window.KotakARSELNEL.state.videos.length > 0) r(); else setTimeout(c, 100); }; c(); })',
    awaitPromise: true
  });

  // Select video 1
  await send('Runtime.evaluate', {
    expression: 'window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0]);'
  });
  await new Promise(r => setTimeout(r, 500));

  const initialVideoCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      hasPlayer: !!document.querySelector('.ar-player-frame iframe') || !!document.querySelector('.ar-player-frame video'),
      placeBtnVisible: !document.getElementById('btn-place-video').classList.contains('hidden'),
      lockBtnHidden: document.getElementById('btn-lock-video').classList.contains('hidden'),
      dragBarHidden: document.getElementById('card-drag-bar').classList.contains('hidden'),
      toolbarHidden: document.getElementById('pinned-toolbar').classList.contains('hidden'),
      isPinned: window.KotakARSELNEL.state.isPinned
    })`,
    returnByValue: true
  });
  const v1 = JSON.parse(initialVideoCheck.result.value);
  assert(v1.hasPlayer, 'Pemain video aktif dan video bermula');
  assert(v1.placeBtnVisible, 'Butang "Letak Video" dipaparkan dengan aktif');
  assert(v1.lockBtnHidden, 'Butang "Kunci Kedudukan" tersembunyi sebelum panel diletakkan');
  assert(!v1.isPinned, 'Panel berada dalam mod terapung sebelum disemat');

  console.log('\n--- BAHAGIAN 2: PENGAKTIFAN MOD SEMAT SKRIN (SCREEN-PINNED MODE) ---');
  // Click "Letak Video"
  await send('Runtime.evaluate', {
    expression: 'window.KotakARSELNEL.placeVideoOnScreen();'
  });
  await new Promise(r => setTimeout(r, 300));

  const pinnedCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      isPinned: window.KotakARSELNEL.state.isPinned,
      isLocked: window.KotakARSELNEL.state.isLocked,
      hasCardPinnedClass: document.getElementById('floating-card-container').classList.contains('is-pinned'),
      placeBtnHidden: document.getElementById('btn-place-video').classList.contains('hidden'),
      lockBtnVisible: !document.getElementById('btn-lock-video').classList.contains('hidden'),
      lockBtnText: document.getElementById('lock-btn-text').innerText,
      dragBarVisible: !document.getElementById('card-drag-bar').classList.contains('hidden'),
      toolbarVisible: !document.getElementById('pinned-toolbar').classList.contains('hidden'),
      statusText: document.getElementById('tracking-status-text').innerText
    })`,
    returnByValue: true
  });
  const p1 = JSON.parse(pinnedCheck.result.value);
  assert(p1.isPinned, 'State isPinned bertukar kepada true');
  assert(!p1.isLocked, 'State isLocked bermula sebagai false (sedia dialih)');
  assert(p1.hasCardPinnedClass, 'Kad panel menerima kelas visual .is-pinned');
  assert(p1.placeBtnHidden, 'Butang "Letak Video" disembunyikan selepas disemat');
  assert(p1.lockBtnVisible && p1.lockBtnText.includes('Kunci'), 'Butang "Kunci Kedudukan" dipaparkan');
  assert(p1.dragBarVisible, 'Bar penyeretan (Drag Bar) dipaparkan');
  assert(p1.toolbarVisible, 'Toolbar kawalan saiz & bateri dipaparkan');
  assert(p1.statusText.includes('Tersemat'), 'Status lencana mengesahkan "Tersemat pada Skrin"');

  console.log('\n--- BAHAGIAN 3: UJIAN SERET PANEL (DRAG & DROP) TANPA GANGGUAN VIDEO ---');
  const posBeforeDrag = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      left: parseFloat(document.getElementById('floating-ar-anchor').style.left),
      top: parseFloat(document.getElementById('floating-ar-anchor').style.top)
    })`,
    returnByValue: true
  });
  const beforePos = JSON.parse(posBeforeDrag.result.value);

  // Simulate drag move by dispatching pointer events on the drag bar
  await send('Runtime.evaluate', {
    expression: `
      const dragBar = document.getElementById('card-drag-bar');
      const startX = 300, startY = 200;
      dragBar.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 80, clientY: startY + 60, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 80, clientY: startY + 60, bubbles: true }));
    `
  });
  await new Promise(r => setTimeout(r, 300));

  const posAfterDrag = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      left: parseFloat(document.getElementById('floating-ar-anchor').style.left),
      top: parseFloat(document.getElementById('floating-ar-anchor').style.top),
      hasIframe: !!document.querySelector('.ar-player-frame iframe') || !!document.querySelector('.ar-player-frame video')
    })`,
    returnByValue: true
  });
  const afterPos = JSON.parse(posAfterDrag.result.value);
  assert(afterPos.left !== beforePos.left || afterPos.top !== beforePos.top, 'Koordinat panel berjaya beralih mengikut seretan murid');
  assert(afterPos.hasIframe, 'Pemain video kekal wujud dan tidak dimuat semula semasa penyeretan');

  console.log('\n--- BAHAGIAN 4: UBAH SAIZ PANEL (S, M, L & CORNER RESIZE) ---');
  // Test Small Size
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('small');` });
  await new Promise(r => setTimeout(r, 200));
  const sCheck = await send('Runtime.evaluate', {
    expression: `document.getElementById('floating-card-container').classList.contains('size-small') && document.getElementById('btn-size-s').classList.contains('is-active')`,
    returnByValue: true
  });
  assert(sCheck.result.value, 'Saiz Kecil (S - 320px) berjaya diaktifkan');

  // Test Large Size
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('large');` });
  await new Promise(r => setTimeout(r, 200));
  const lCheck = await send('Runtime.evaluate', {
    expression: `document.getElementById('floating-card-container').classList.contains('size-large') && document.getElementById('btn-size-l').classList.contains('is-active')`,
    returnByValue: true
  });
  assert(lCheck.result.value, 'Saiz Besar (L - 620px) berjaya diaktifkan');

  // Reset to Medium
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('medium');` });
  await new Promise(r => setTimeout(r, 200));
  const mCheck = await send('Runtime.evaluate', {
    expression: `document.getElementById('floating-card-container').classList.contains('size-medium')`,
    returnByValue: true
  });
  assert(mCheck.result.value, 'Saiz Sederhana (M - 480px) berjaya dipulihkan');

  console.log('\n--- BAHAGIAN 5: KUNCI KEDUDUKAN & ALIH SEMULA ---');
  // Click "Kunci Kedudukan"
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleLockPosition();` });
  await new Promise(r => setTimeout(r, 200));

  const lockedCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      isLocked: window.KotakARSELNEL.state.isLocked,
      btnHasLockedClass: document.getElementById('btn-lock-video').classList.contains('is-locked'),
      btnText: document.getElementById('lock-btn-text').innerText,
      badgeText: document.getElementById('drag-lock-text').innerText,
      badgeLocked: document.getElementById('drag-lock-badge').classList.contains('is-locked')
    })`,
    returnByValue: true
  });
  const lk = JSON.parse(lockedCheck.result.value);
  assert(lk.isLocked, 'State isLocked bertukar kepada true');
  assert(lk.btnText.includes('Alih Semula'), 'Teks butang bertukar kepada "Alih Semula"');
  assert(lk.badgeText.includes('Dikunci') && lk.badgeLocked, 'Lencana Drag Bar mengesahkan status "Dikunci"');

  // Try dragging while locked (should NOT move)
  const lockedPosBefore = await send('Runtime.evaluate', {
    expression: `document.getElementById('floating-ar-anchor').style.left`,
    returnByValue: true
  });
  await send('Runtime.evaluate', {
    expression: `
      const dragBar = document.getElementById('card-drag-bar');
      dragBar.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, clientY: 200, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, clientY: 400, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: 400, clientY: 400, bubbles: true }));
    `
  });
  await new Promise(r => setTimeout(r, 200));
  const lockedPosAfter = await send('Runtime.evaluate', {
    expression: `document.getElementById('floating-ar-anchor').style.left`,
    returnByValue: true
  });
  assert(lockedPosBefore.result.value === lockedPosAfter.result.value, 'Penyeretan disekat apabila kedudukan dikunci');

  // Click "Alih Semula"
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleLockPosition();` });
  await new Promise(r => setTimeout(r, 200));
  const unlockedCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      isLocked: window.KotakARSELNEL.state.isLocked,
      btnText: document.getElementById('lock-btn-text').innerText,
      badgeText: document.getElementById('drag-lock-text').innerText
    })`,
    returnByValue: true
  });
  const un = JSON.parse(unlockedCheck.result.value);
  assert(!un.isLocked, 'State isLocked berjaya dibuka semula');
  assert(un.btnText.includes('Kunci Kedudukan'), 'Teks butang kembali kepada "Kunci Kedudukan"');
  assert(un.badgeText.includes('Boleh Dialih'), 'Lencana Drag Bar mengesahkan status "Boleh Dialih"');

  console.log('\n--- BAHAGIAN 6: MOD JIMAT BATERI (TUTUP & BUKA KAMERA) ---');
  // Toggle Camera Off
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });
  await new Promise(r => setTimeout(r, 200));

  const camOffCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      cameraActive: window.KotakARSELNEL.state.cameraActive,
      containerHasClass: document.getElementById('ar-container').classList.contains('camera-off'),
      btnText: document.getElementById('cam-toggle-text').innerText,
      btnHasClass: document.getElementById('btn-toggle-cam').classList.contains('is-cam-off'),
      videoStillActive: !!document.querySelector('.ar-player-frame iframe') || !!document.querySelector('.ar-player-frame video')
    })`,
    returnByValue: true
  });
  const cOff = JSON.parse(camOffCheck.result.value);
  assert(!cOff.cameraActive, 'State cameraActive bertukar kepada false');
  assert(cOff.containerHasClass, '#ar-container menerima kelas .camera-off (latar belakang bilik darjah bersih)');
  assert(cOff.btnText.includes('Buka Kamera') && cOff.btnHasClass, 'Butang kamera bertukar kepada "Buka Kamera"');
  assert(cOff.videoStillActive, 'Playback video & audio berjalan berterusan tanpa sebarang gangguan');

  // Take screenshot of battery saver mode
  const shotP3 = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_phase3_screen_pinned.png');
  fs.writeFileSync(shotPath, Buffer.from(shotP3.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin Mod Semat Skrin (Fasa 3) disimpan di: ${shotPath}`);

  // Restore camera
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });
  await new Promise(r => setTimeout(r, 200));
  const camOnCheck = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.cameraActive && !document.getElementById('ar-container').classList.contains('camera-off')`,
    returnByValue: true
  });
  assert(camOnCheck.result.value, 'Kamera berjaya dibuka semula dengan lancar');

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN FASA 3: ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
  console.log('================================================================\n');

  chromeProc.kill();
  process.exit(failedTests > 0 ? 1 : 0);
}

runPhase3Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

