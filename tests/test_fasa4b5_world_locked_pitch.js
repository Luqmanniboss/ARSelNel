/**
 * Test Suite: HOTFIX FASA 4B.5 — BETULKAN PITCH WORLD-LOCKED UNTUK NOTA
 * Verifies 3DoF orientation-anchored panel behavior across all pitch and yaw angles.
 * Viewport: 1024x768 (iPad Safari Landscape).
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

async function runTestSuite() {
  console.log('======================================================================');
  console.log('🎯 UJIAN AUTOMATIK: HOTFIX FASA 4B.5 — PITCH WORLD-LOCKED NOTA');
  console.log('======================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9355;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-4b5-' + Date.now());
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

  // --- BAHAGIAN 1: PEMULAAN NOTA & KUNCI POV PADA 0°, 0° ---
  console.log('--- BAHAGIAN 1: ANCHOR POV PADA YAW 0°, PITCH 0° ---');
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        window.KotakARSELNEL.switchActiveModule('nota');
        await window.KotakARSELNEL.startPOVMode();
        window.KotakARSELNEL.applySimAngles(0, 0);
        window.KotakARSELNEL.anchorPOVAtCurrentHeading();
      })()
    `,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 600));

  // Ujian 1: Pitch 0° -> panel di tengah (centerY ~ 384px, centerX ~ 512px)
  const pos0 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          centerX: r.left + r.width / 2,
          centerY: r.top + r.height / 2,
          deltaYaw: window.KotakARSELNEL.state.pov.deltaYaw,
          deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch
        };
      })()
    `,
    returnByValue: true
  });
  const p0 = pos0.result.result.value;
  assert(Math.abs(p0.centerX - 512) < 5, `Ujian 1a: Pitch 0°, Yaw 0° -> Panel tepat di tengah X (${p0.centerX.toFixed(1)}px ~ 512px)`);
  assert(Math.abs(p0.centerY - 384) < 5, `Ujian 1b: Pitch 0°, Yaw 0° -> Panel tepat di tengah Y (${p0.centerY.toFixed(1)}px ~ 384px)`);

  // --- BAHAGIAN 2: UJIAN PITCH TUNDUK (PITCH NEGATIF) ---
  console.log('\n--- BAHAGIAN 2: UJIAN TUNDUKKAN PERANTI (PITCH -15°, -30°, -50°) ---');

  // Ujian 2: Pitch -15° (tunduk) -> panel bergerak ke ATAS (centerY < 384)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, -15);` });
  await new Promise(r => setTimeout(r, 300));
  const posM15 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return { centerY: r.top + r.height / 2, deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch };
      })()
    `,
    returnByValue: true
  });
  const pM15 = posM15.result.result.value;
  assert(pM15.centerY < 350, `Ujian 2: Pitch -15° -> Panel bergerak ke ATAS (Pusat Y: ${pM15.centerY.toFixed(1)}px < 350px)`);

  // Ujian 3: Pitch -30° (tunduk lebih jauh) -> panel bergerak lebih jauh ke ATAS (centerY < pM15.centerY)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, -30);` });
  await new Promise(r => setTimeout(r, 300));
  const posM30 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return { centerY: r.top + r.height / 2, deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch };
      })()
    `,
    returnByValue: true
  });
  const pM30 = posM30.result.result.value;
  assert(pM30.centerY < pM15.centerY, `Ujian 3: Pitch -30° -> Panel bergerak lebih jauh ke ATAS (${pM30.centerY.toFixed(1)}px < ${pM15.centerY.toFixed(1)}px)`);

  // Ujian 4: Pitch -50° (tunduk penuh) -> panel bergerak ke atas sehingga KELUAR FOV (r.bottom <= 0 atau isOffscreen)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, -50);` });
  await new Promise(r => setTimeout(r, 300));
  const posM50 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        const pointer = document.getElementById('pov-offscreen-pointer');
        const pointerText = document.getElementById('pov-pointer-bearing');
        return {
          top: r.top,
          bottom: r.bottom,
          isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen,
          pointerVisible: pointer && !pointer.classList.contains('hidden'),
          pointerBearing: pointerText ? pointerText.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const pM50 = posM50.result.result.value;
  assert(pM50.bottom <= 50 || pM50.isOffscreen, `Ujian 4a: Pitch -50° -> Panel keluar daripada FOV di bahagian atas (Bottom: ${pM50.bottom.toFixed(1)}px, isOffscreen: ${pM50.isOffscreen})`);
  assert(pM50.pointerVisible && pM50.pointerBearing.includes('Atas'), `Ujian 4b: Penunjuk arah memaparkan "Panel di Atas" ("${pM50.pointerBearing}")`);

  // --- BAHAGIAN 3: UJIAN PITCH DONGAK (PITCH POSITIF) ---
  console.log('\n--- BAHAGIAN 3: UJIAN DONGAKKAN PERANTI (PITCH +15°, +30°, +50°) ---');

  // Ujian 5: Pitch +15° (dongak) -> panel bergerak ke BAWAH (centerY > 384)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, 15);` });
  await new Promise(r => setTimeout(r, 300));
  const posP15 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return { centerY: r.top + r.height / 2, deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch };
      })()
    `,
    returnByValue: true
  });
  const pP15 = posP15.result.result.value;
  assert(pP15.centerY > 420, `Ujian 5: Pitch +15° -> Panel bergerak ke BAWAH (Pusat Y: ${pP15.centerY.toFixed(1)}px > 420px)`);

  // Ujian 6: Pitch +30° (dongak lebih jauh) -> panel bergerak lebih jauh ke BAWAH (centerY > pP15.centerY)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, 30);` });
  await new Promise(r => setTimeout(r, 300));
  const posP30 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return { centerY: r.top + r.height / 2, deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch };
      })()
    `,
    returnByValue: true
  });
  const pP30 = posP30.result.result.value;
  assert(pP30.centerY > pP15.centerY, `Ujian 6: Pitch +30° -> Panel bergerak lebih jauh ke BAWAH (${pP30.centerY.toFixed(1)}px > ${pP15.centerY.toFixed(1)}px)`);

  // Ujian 7: Pitch +50° (dongak penuh) -> panel bergerak ke bawah sehingga KELUAR FOV (r.top >= 768 atau isOffscreen)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, 50);` });
  await new Promise(r => setTimeout(r, 300));
  const posP50 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        const pointer = document.getElementById('pov-offscreen-pointer');
        const pointerText = document.getElementById('pov-pointer-bearing');
        return {
          top: r.top,
          isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen,
          pointerVisible: pointer && !pointer.classList.contains('hidden'),
          pointerBearing: pointerText ? pointerText.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const pP50 = posP50.result.result.value;
  assert(pP50.top >= 720 || pP50.isOffscreen, `Ujian 7a: Pitch +50° -> Panel keluar daripada FOV di bahagian bawah (Top: ${pP50.top.toFixed(1)}px, isOffscreen: ${pP50.isOffscreen})`);
  assert(pP50.pointerVisible && pP50.pointerBearing.includes('Bawah'), `Ujian 7b: Penunjuk arah memaparkan "Panel di Bawah" ("${pP50.pointerBearing}")`);

  // Ujian 8: Kembali ke Pitch 0° -> panel kembali ke tengah viewport
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, 0);` });
  await new Promise(r => setTimeout(r, 300));
  const posReturn = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          centerX: r.left + r.width / 2,
          centerY: r.top + r.height / 2
        };
      })()
    `,
    returnByValue: true
  });
  const pRet = posReturn.result.result.value;
  assert(Math.abs(pRet.centerY - 384) < 10, `Ujian 8: Kembali ke Pitch 0° -> Panel kembali ke tengah Y (${pRet.centerY.toFixed(1)}px ~ 384px)`);

  // --- BAHAGIAN 4: UJIAN YAW HORIZONTAL (PUSING KANAN +50°, PUSING KIRI -50°) ---
  console.log('\n--- BAHAGIAN 4: UJIAN YAW (KEKAL BERFUNGSI SEMPURNA) ---');

  // Ujian 9: Yaw +50° (pusing kanan) -> panel bergerak ke KIRI sehingga keluar FOV
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(50, 0);` });
  await new Promise(r => setTimeout(r, 300));
  const posYawR = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          right: r.right,
          isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen
        };
      })()
    `,
    returnByValue: true
  });
  const pYR = posYawR.result.result.value;
  assert(pYR.right <= 100 || pYR.isOffscreen, `Ujian 9: Yaw +50° -> Panel bergerak ke KIRI dan keluar FOV (Right: ${pYR.right.toFixed(1)}px, isOffscreen: ${pYR.isOffscreen})`);

  // Ujian 10: Yaw -50° (pusing kiri) -> panel bergerak ke KANAN sehingga keluar FOV
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(-50, 0);` });
  await new Promise(r => setTimeout(r, 300));
  const posYawL = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          left: r.left,
          isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen
        };
      })()
    `,
    returnByValue: true
  });
  const pYL = posYawL.result.result.value;
  assert(pYL.left >= 924 || pYL.isOffscreen, `Ujian 10: Yaw -50° -> Panel bergerak ke KANAN dan keluar FOV (Left: ${pYL.left.toFixed(1)}px, isOffscreen: ${pYL.isOffscreen})`);

  // --- BAHAGIAN 5: UJIAN GABUNGAN 2-AXIS (YAW + PITCH SERENTAK) ---
  console.log('\n--- BAHAGIAN 5: GABUNGAN 2-AXIS (YAW + PITCH SERENTAK) ---');
  // Yaw +30° (pusing kanan) dan Pitch -25° (tunduk) -> Panel bergerak ke Kiri & Atas
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(30, -25);` });
  await new Promise(r => setTimeout(r, 300));
  const posComb = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          centerX: r.left + r.width / 2,
          centerY: r.top + r.height / 2
        };
      })()
    `,
    returnByValue: true
  });
  const pComb = posComb.result.result.value;
  assert(pComb.centerX < 450 && pComb.centerY < 300, `Ujian 11: Gabungan Yaw +30° & Pitch -25° -> Panel bergerak serentak ke Kiri (${pComb.centerX.toFixed(1)}px) & Atas (${pComb.centerY.toFixed(1)}px)`);

  // --- BAHAGIAN 6: UJIAN MOD JIMAT BATERI & PERTUKARAN VIDEO ➔ NOTA ---
  console.log('\n--- BAHAGIAN 6: MOD JIMAT BATERI & KEKALAN KANDUNGAN ---');
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });
  await new Promise(r => setTimeout(r, 300));
  const camOffRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const camActive = window.KotakARSELNEL.state.cameraActive;
        const noteActive = window.KotakARSELNEL.state.activeNote;
        const mode = window.KotakARSELNEL.state.systemMode;
        return {
          camActive,
          noteTitle: noteActive ? noteActive.title : '',
          mode
        };
      })()
    `,
    returnByValue: true
  });
  const coVal = camOffRes.result.result.value;
  assert(coVal.camActive === false, 'Ujian 12a: Kamera berjaya ditutup (Mod Jimat Bateri)');
  assert(coVal.mode === 'POV_LOCKED', 'Ujian 12b: Mod POV_LOCKED kekal aktif semasa kamera ditutup');
  assert(coVal.noteTitle.includes('Sel Tumbuhan'), `Ujian 12c: Kandungan Nota kekal ("${coVal.noteTitle}")`);

  // Buka kamera semula
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });

  // Ujian 13: Pertukaran Video ➔ Nota dalam POV
  console.log('\n--- BAHAGIAN 7: PERTUKARAN MODUL DALAM KUNCI POV ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.setContent('video');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));
  const swapVidRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const activeMod = window.KotakARSELNEL.state.activeModule;
        const povPlayer = document.getElementById('pov-active-player-view');
        return {
          activeMod,
          playerVisible: povPlayer && !povPlayer.classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  const svVal = swapVidRes.result.result.value;
  assert(svVal.activeMod === 'video', 'Ujian 13a: Berjaya bertukar ke modul Video dalam POV');
  assert(svVal.playerVisible === true, 'Ujian 13b: Paparan pemain video POV aktif');

  // Tukar semula ke Nota
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SharedARPanelController.setContent('nota');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 400));
  const swapNotaRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const activeMod = window.KotakARSELNEL.state.activeModule;
        const povNota = document.getElementById('pov-active-nota-view');
        return {
          activeMod,
          notaVisible: povNota && !povNota.classList.contains('hidden')
        };
      })()
    `,
    returnByValue: true
  });
  const snVal = swapNotaRes.result.result.value;
  assert(snVal.activeMod === 'nota', 'Ujian 14a: Berjaya bertukar semula ke modul Nota dalam POV');
  assert(snVal.notaVisible === true, 'Ujian 14b: Paparan pembaca Nota POV aktif');

  // Simpan tangkapan skrin
  const scr = await send('Page.captureScreenshot', { format: 'png' });
  const scrPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4b5_pitch_verified.png');
  fs.writeFileSync(scrPath, Buffer.from(scr.result.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin disimpan ke: ${scrPath}`);

  await ws.close();
  proc.kill();

  console.log('\n======================================================================');
  console.log(`HASIL KESELURUHAN: ${passCount} LULUS, ${failCount} GAGAL`);
  console.log('======================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

