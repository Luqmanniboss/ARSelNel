/**
 * Comprehensive Verification Test for Hotfix Fasa 4B.4:
 * SharedARPanelController, 2D Drag, 3DoF POV Engine (Yaw+Pitch), Dead Sensor Guard, and PDF Rendering.
 * Run in Headless Chrome 1024x768 (iPad Safari Emulation).
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTest() {
  console.log('======================================================================');
  console.log('🌐 UJIAN PENGESAHAN HOTFIX FASA 4B.4 — SHARED AR PANEL CONTROLLER');
  console.log('======================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9345;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-4b4-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1024,768'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (res.ok) break;
    } catch (_) {}
  }

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + port + '/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = evt => {
      const resp = JSON.parse(evt.data);
      if (resp.id === curId) {
        ws.removeEventListener('message', handler);
        res(resp);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: 'landscapePrimary' }
  });

  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 2500));

  // --- UJIAN 1: PENGESAHAN SHARED AR PANEL CONTROLLER & API EXPORTS ---
  console.log('--- BAHAGIAN 1: PENGESAHAN SHARED AR PANEL CONTROLLER ---');
  const ctrlRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c1 = window.SharedARPanelController;
        const c2 = window.KotakARSELNEL && window.KotakARSELNEL.SharedARPanelController;
        return {
          hasGlobalCtrl: typeof c1 === 'object' && c1 !== null,
          hasKotakCtrl: typeof c2 === 'object' && c2 !== null,
          hasSetContent: typeof c1.setContent === 'function',
          hasEnterScreenPinned: typeof c1.enterScreenPinned === 'function',
          hasSetDragEnabled: typeof c1.setDragEnabled === 'function',
          hasEnterPOVSetup: typeof c1.enterPOVSetup === 'function',
          hasLockPOV: typeof c1.lockPOV === 'function',
          hasUpdateOrientation: typeof c1.updateOrientation === 'function',
          hasReturnToScreenPinned: typeof c1.returnToScreenPinned === 'function',
          hasRecenter: typeof c1.recenter === 'function',
          hasDispose: typeof c1.dispose === 'function'
        };
      })()
    `,
    returnByValue: true
  });

  const cVal = ctrlRes.result.result.value;
  assert(cVal.hasGlobalCtrl, 'window.SharedARPanelController dieksport');
  assert(cVal.hasKotakCtrl, 'window.KotakARSELNEL.SharedARPanelController dieksport');
  assert(cVal.hasSetContent && cVal.hasEnterScreenPinned && cVal.hasLockPOV, 'Semua method teras SharedARPanelController wujud');

  // --- UJIAN 2: PERTUKARAN MODUL & SEMAT SKRIN NOTA ---
  console.log('\n--- BAHAGIAN 2: SEMAT SKRIN NOTA & SERET 2D PENUH ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.setContent('nota');
        window.SharedARPanelController.enterScreenPinned();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Seret ke kiri & atas (Diagonal Drag)
  const dragRes1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const startX = 512;
        const startY = 300;
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX - 150, clientY: startY - 100, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX - 150, clientY: startY - 100, pointerId: 1, bubbles: true }));

        const anchor = document.getElementById('floating-ar-anchor');
        return {
          posX: parseFloat(anchor.style.left),
          posY: parseFloat(anchor.style.top)
        };
      })()
    `,
    returnByValue: true
  });
  const dVal1 = dragRes1.result.result.value;
  assert(dVal1.posX < 450, `Seret Horizontal (X) Berjaya: X = ${dVal1.posX.toFixed(1)}px (< 450px)`);
  assert(dVal1.posY <= 384, `Seret Vertikal (Y) Berjaya: Y = ${dVal1.posY.toFixed(1)}px (<= 384px, dalam batas zon selamat)`);

  // Seret ke kanan & bawah
  const dragRes2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const curX = window.KotakARSELNEL.state.currentScreenX;
        const curY = window.KotakARSELNEL.state.currentScreenY;
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: curX, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: curX + 220, clientY: curY + 120, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: curX + 220, clientY: curY + 120, pointerId: 1, bubbles: true }));

        const anchor = document.getElementById('floating-ar-anchor');
        return {
          posX: parseFloat(anchor.style.left),
          posY: parseFloat(anchor.style.top)
        };
      })()
    `,
    returnByValue: true
  });
  const dVal2 = dragRes2.result.result.value;
  assert(dVal2.posX > 500, `Seret Horizontal ke Kanan Berjaya: X = ${dVal2.posX.toFixed(1)}px (> 500px)`);
  assert(dVal2.posY >= 384, `Seret Vertikal ke Bawah Berjaya: Y = ${dVal2.posY.toFixed(1)}px (>= 384px)`);

  // --- UJIAN 3: KESELAMATAN SENSOR MATI / TIADA EVENT (DEAD SENSOR GUARD) ---
  console.log('\n--- BAHAGIAN 3: KAWALAN KESELAMATAN SENSOR (DEAD SENSOR GUARD) ---');
  // Masuk POV Setup
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.enterPOVSetup();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Sahkan masuk POV_SETUP dan panel di tengah
  const povSetupRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const povAnchor = document.getElementById('pov-ar-anchor');
        const statusVal = document.getElementById('pov-nota-val-status');
        return {
          mode: window.KotakARSELNEL.state.systemMode,
          isCentered: povAnchor ? povAnchor.classList.contains('is-centered') : false,
          statusText: statusVal ? statusVal.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const psVal = (povSetupRes.result && povSetupRes.result.result) ? povSetupRes.result.result.value : {};
  assert(psVal.mode === 'POV_SETUP', 'Mod sistem beralih ke POV_SETUP');
  assert(psVal.isCentered === true, 'Panel POV berada di tengah skrin (.is-centered)');
  assert(psVal.statusText === 'Menghalakan', 'Status awal ialah "Menghalakan"');

  // Sekarang simulasikan keadaan sensor mati (hasSensor = false, isSimulated = false, eventCount = 0)
  // dan cuba tekan "Letak di Arah Ini". Sistem mesti MENYEKAT penguncian palsu!
  const blockLockRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.state.pov.hasSensor = false;
        window.KotakARSELNEL.state.pov.isSimulated = false;
        window.KotakARSELNEL.state.pov.eventCount = 0;

        // Cuba kunci
        window.SharedARPanelController.lockPOV();

        const statusVal = document.getElementById('pov-nota-val-status');
        const bannerActions = document.getElementById('pov-nota-banner-actions');
        const bannerText = document.getElementById('pov-nota-banner-text');

        return {
          mode: window.KotakARSELNEL.state.systemMode,
          isAnchored: window.KotakARSELNEL.state.pov.isAnchored,
          statusText: statusVal ? statusVal.textContent.trim() : '',
          actionsVisible: bannerActions && !bannerActions.classList.contains('hidden'),
          bannerText: bannerText ? bannerText.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const blVal = (blockLockRes.result && blockLockRes.result.result) ? blockLockRes.result.result.value : {};
  assert(blVal.mode === 'POV_SETUP', 'Kunci disekat: mod kekal POV_SETUP (Bukan POV_LOCKED palsu)');
  assert(blVal.isAnchored === false, 'isAnchored kekal false');
  assert(blVal.statusText === 'Sensor Tidak Aktif', `Status memaparkan "${blVal.statusText}" (bukan Terkunci 0.0°)`);
  assert(blVal.actionsVisible === true, 'Butang fallback "Cuba Semula" & "Semat Skrin" dipaparkan');

  // --- UJIAN 4: SIMULASI DATA SENSOR SEBENAR (3DoF YAW & PITCH LOCK) ---
  console.log('\n--- BAHAGIAN 4: 3DoF YAW & PITCH POV LOCK AKTIF ---');
  // Tetapkan orientasi awal dan kunci POV (Heading 0°, Pitch 0°)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.applySimAngles(0, 0);
        window.SharedARPanelController.lockPOV();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  const lockedRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const statusVal = document.getElementById('pov-nota-val-status');
        const povAnchor = document.getElementById('pov-ar-anchor');
        return {
          mode: window.KotakARSELNEL.state.systemMode,
          isAnchored: window.KotakARSELNEL.state.pov.isAnchored,
          anchorYaw: window.KotakARSELNEL.state.pov.anchorYaw,
          anchorPitch: window.KotakARSELNEL.state.pov.anchorPitch,
          statusText: statusVal ? statusVal.textContent.trim() : '',
          isCentered: povAnchor ? povAnchor.classList.contains('is-centered') : false
        };
      })()
    `,
    returnByValue: true
  });
  const lVal = (lockedRes.result && lockedRes.result.result) ? lockedRes.result.result.value : {};
  assert(lVal.mode === 'POV_LOCKED', 'Mod sistem kini POV_LOCKED dengan sensor aktif');
  assert(lVal.isAnchored === true, 'isAnchored kini true');
  assert(lVal.statusText && lVal.statusText.includes('Terkunci'), `Status memaparkan "${lVal.statusText}"`);
  assert(lVal.isCentered === false, 'Kelas .is-centered ditanggalkan untuk unjuran ruang 3D');

  // Pusingkan peranti ke KANAN (+35° Yaw)
  // Mengikut golden reference, anchor berada di kiri peranti -> panel bergerak ke KIRI (X < 512)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.applySimAngles(35, 0);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  const turnRightRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const povAnchor = document.getElementById('pov-ar-anchor');
        return {
          left: parseFloat(povAnchor.style.left),
          top: parseFloat(povAnchor.style.top),
          deltaYaw: window.KotakARSELNEL.state.pov.deltaYaw
        };
      })()
    `,
    returnByValue: true
  });
  const trVal = (turnRightRes.result && turnRightRes.result.result) ? turnRightRes.result.result.value : {};
  assert(trVal.left < 512, `Pusing KANAN -> Panel bergerak ke KIRI (Left: ${trVal.left.toFixed(1)}px < 512px)`);

  // Tundukkan peranti ke BAWAH (-20° Pitch)
  // Mengikut golden reference, anchor berada di atas pandangan -> panel bergerak ke ATAS (Y < 384)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.applySimAngles(0, -20);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));

  const pitchDownRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const povAnchor = document.getElementById('pov-ar-anchor');
        return {
          left: parseFloat(povAnchor.style.left),
          top: parseFloat(povAnchor.style.top),
          deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch
        };
      })()
    `,
    returnByValue: true
  });
  const pdVal = (pitchDownRes.result && pitchDownRes.result.result) ? pitchDownRes.result.result.value : {};
  assert(pdVal.top < 384, `Tunduk BAWAH -> Panel bergerak ke ATAS (Top: ${pdVal.top.toFixed(1)}px < 384px)`);

  // --- UJIAN 5: PEMAPARAN NOTA PDF & CACHE TEMPATAN ---
  console.log('\n--- BAHAGIAN 5: PEMAPARAN NOTA PDF (TIADA SKRIN KOSONG) ---');
  const pdfRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const canvas = document.getElementById('nota-pdf-canvas');
        const pageIndicator = document.getElementById('nota-page-indicator');
        return {
          hasCanvas: !!canvas,
          pageText: pageIndicator ? pageIndicator.textContent.trim() : '',
          notesCount: (window.KotakARSELNEL.state.notes || []).length
        };
      })()
    `,
    returnByValue: true
  });
  const pVal = (pdfRes.result && pdfRes.result.result) ? pdfRes.result.result.value : {};
  assert(pVal.hasCanvas, 'Elemen nota-pdf-canvas wujud');
  assert(pVal.notesCount > 0, `CMS Notes berjaya dimuat (${pVal.notesCount} nota)`);
  assert(pVal.pageText && pVal.pageText.includes('1'), `Indikator halaman menunjukkan: "${pVal.pageText}"`);

  // --- UJIAN 6: LACI DIAGNOSTIK & INTEGRITI MAKLUMAT ---
  console.log('\n--- BAHAGIAN 6: LACI DIAGNOSTIK & TELEMETRI ---');
  const diagRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.toggleDiagnosticsDrawer();
        const dMod = document.getElementById('diag-module');
        const dOrient = document.getElementById('diag-screen-orient');
        const dPos = document.getElementById('diag-panel-pos');
        const dTrans = document.getElementById('diag-transform');
        return {
          module: dMod ? dMod.textContent.trim() : '',
          screenOrient: dOrient ? dOrient.textContent.trim() : '',
          panelPos: dPos ? dPos.textContent.trim() : '',
          transform: dTrans ? dTrans.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const dVal = (diagRes.result && diagRes.result.result) ? diagRes.result.result.value : {};
  assert(dVal.module === 'NOTA', `Laci Diagnostik Modul = "${dVal.module}"`);
  assert(dVal.screenOrient && dVal.screenOrient.includes('°'), `Laci Diagnostik Orientasi = "${dVal.screenOrient}"`);
  assert(dVal.panelPos && dVal.panelPos.length > 0, `Laci Diagnostik Panel Pos = "${dVal.panelPos}"`);

  // Ambil tangkapan skrin iPad Safari landscape
  const scr = await send('Page.captureScreenshot', { format: 'png' });
  const scrPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4b4_verified.png');
  fs.writeFileSync(scrPath, Buffer.from(scr.result.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin disimpan ke: ${scrPath}`);

  // Bersihkan pelayar
  await ws.close();
  proc.kill();

  console.log('\n======================================================================');
  console.log(`HASIL KESELURUHAN: ${passCount} LULUS, ${failCount} GAGAL`);
  console.log('======================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
