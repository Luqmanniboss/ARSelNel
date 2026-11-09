/**
 * Interactive Browser Simulation Test for Hotfix Fasa 4B.3 (iPad Safari 1024x768)
 * Verifies live DOM drag X, drag Y, diagonal drag, and POV state machine.
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

async function runBrowserTest() {
  console.log('======================================================================');
  console.log('🌐 UJIAN INTERAKTIF PELAYAR: 2D DRAG & STATE MACHINE KUNCI POV');
  console.log('======================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9342;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-4b3-' + Date.now());
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
  await new Promise(r => setTimeout(r, 2200));

  // --- UJIAN 1: PENGAKTIFAN NOTA & SEMAT SKRIN ---
  console.log('--- BAHAGIAN 1: PEMULAAN NOTA & SEMAT SKRIN ---');
  const initRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.switchActiveModule('nota');
        window.KotakARSELNEL.placeVideoOnScreen(true);
        const card = document.getElementById('floating-card-container');
        const anchor = document.getElementById('floating-ar-anchor');
        const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
        return {
          activeModule: window.KotakARSELNEL.state.activeModule,
          isPinned: window.KotakARSELNEL.state.isPinned,
          toastText: toast ? toast.textContent.trim() : '',
          anchorLeft: parseFloat(anchor.style.left || '512'),
          anchorTop: parseFloat(anchor.style.top || '384')
        };
      })()
    `,
    returnByValue: true
  });

  const d1 = initRes.result.result.value;
  assert(d1.activeModule === 'nota', 'Modul aktif ialah "nota"');
  assert(d1.isPinned === true, 'Panel berada dalam mod SCREEN_PINNED');
  assert(d1.toastText.includes('Nota disematkan ke skrin'), 'Notifikasi menyatakan "Nota disematkan ke skrin" (Bukan Video)');

  // --- UJIAN 2: UJIAN SERET HORIZONTAL KE KIRI (X < 512) ---
  console.log('\n--- BAHAGIAN 2: UJIAN SERET 2D PENUH ---');
  const dragLeftRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const startX = 512;
        const startY = 120;
        // dispatch pointerdown
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1, bubbles: true, cancelable: true }));
        // dispatch pointermove 120px to left
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX - 120, clientY: startY, pointerId: 1, bubbles: true, cancelable: true }));
        // dispatch pointerup
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX - 120, clientY: startY, pointerId: 1, bubbles: true }));
        const anchor = document.getElementById('floating-ar-anchor');
        return {
          finalX: parseFloat(anchor.style.left),
          finalY: parseFloat(anchor.style.top)
        };
      })()
    `,
    returnByValue: true
  });
  const d2 = dragLeftRes.result.result.value;
  assert(d2.finalX < 500, `Drag ke Kiri berjaya (Posisi X: ${d2.finalX}px < 500px)`);

  // --- UJIAN 3: UJIAN SERET HORIZONTAL KE KANAN (X > 512) ---
  const dragRightRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const curX = window.KotakARSELNEL.state.currentScreenX;
        const curY = window.KotakARSELNEL.state.currentScreenY;
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: curX, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: curX + 240, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: curX + 240, clientY: curY, pointerId: 1, bubbles: true }));
        const anchor = document.getElementById('floating-ar-anchor');
        return {
          finalX: parseFloat(anchor.style.left),
          finalY: parseFloat(anchor.style.top)
        };
      })()
    `,
    returnByValue: true
  });
  const d3 = dragRightRes.result.result.value;
  assert(d3.finalX > 520, `Drag ke Kanan berjaya (Posisi X: ${d3.finalX}px > 520px)`);

  // --- UJIAN 4: UJIAN SERET VERTIKAL KE ATAS & KE BAWAH ---
  const dragVertRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const curX = window.KotakARSELNEL.state.currentScreenX;
        const curY = window.KotakARSELNEL.state.currentScreenY;
        // Drag down
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: curX, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: curX, clientY: curY + 60, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: curX, clientY: curY + 60, pointerId: 1, bubbles: true }));
        const anchor = document.getElementById('floating-ar-anchor');
        return {
          finalX: parseFloat(anchor.style.left),
          finalY: parseFloat(anchor.style.top)
        };
      })()
    `,
    returnByValue: true
  });
  const d4 = dragVertRes.result.result.value;
  assert(d4.finalY > 384, `Drag Vertikal ke Bawah berjaya (Posisi Y: ${d4.finalY}px > 384px)`);

  // --- UJIAN 5: UJIAN SERET DIAGONAL (X DAN Y BERGERAK SERENTAK) ---
  const dragDiagRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const bar = document.getElementById('card-drag-bar');
        const curX = window.KotakARSELNEL.state.currentScreenX;
        const curY = window.KotakARSELNEL.state.currentScreenY;
        // Drag diagonal: -50px X, -50px Y
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: curX, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: curX - 50, clientY: curY - 50, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: curX - 50, clientY: curY - 50, pointerId: 1, bubbles: true }));
        const anchor = document.getElementById('floating-ar-anchor');
        return {
          finalX: parseFloat(anchor.style.left),
          finalY: parseFloat(anchor.style.top),
          prevX: curX,
          prevY: curY
        };
      })()
    `,
    returnByValue: true
  });
  const d5 = dragDiagRes.result.result.value;
  assert(d5.finalX < d5.prevX && d5.finalY < d5.prevY, `Drag Diagonal berjaya (X berkurang: ${d5.finalX} < ${d5.prevX}, Y berkurang: ${d5.finalY} < ${d5.prevY})`);

  // --- UJIAN 6: KUNCI KEDUDUKAN & CEGAH DRAG ---
  console.log('\n--- BAHAGIAN 3: UJIAN KUNCI & BUKA KEDUDUKAN (LOCK) ---');
  const lockRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const lockBtn = document.getElementById('btn-lock-video');
        lockBtn.click();
        const stateBefore = window.KotakARSELNEL.state;
        const curX = stateBefore.currentScreenX;
        const curY = stateBefore.currentScreenY;
        
        // Cubaan seret semasa berkunci
        const bar = document.getElementById('card-drag-bar');
        bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: curX, clientY: curY, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: curX + 100, clientY: curY + 100, pointerId: 1, bubbles: true, cancelable: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: curX + 100, clientY: curY + 100, pointerId: 1, bubbles: true }));

        const stateAfter = window.KotakARSELNEL.state;
        return {
          isLocked: stateBefore.isLocked,
          xUnchanged: stateAfter.currentScreenX === curX,
          yUnchanged: stateAfter.currentScreenY === curY
        };
      })()
    `,
    returnByValue: true
  });
  const d6 = lockRes.result.result.value;
  assert(d6.isLocked === true, 'Panel berjaya dikunci (isLocked = true)');
  assert(d6.xUnchanged && d6.yUnchanged, 'Seretan disekat sepenuhnya apabila panel dikunci');

  // Buka kunci semula
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-lock-video').click();` });

  // --- UJIAN 7: KLIK KUNCI POV DARI MOD PINNED ---
  console.log('\n--- BAHAGIAN 4: UJIAN BUTANG KUNCI POV (STATE MACHINE) ---');
  const povStartRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const btnPOV = document.getElementById('btn-start-pov');
        btnPOV.click();
        await new Promise(r => setTimeout(r, 400));
        const state = window.KotakARSELNEL.state;
        const povAnchor = document.getElementById('pov-ar-anchor');
        const povBanner = document.getElementById('pov-nota-status-banner');
        const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
        return {
          systemMode: state.systemMode,
          povActive: state.pov.active,
          povAnchorVisible: !povAnchor.classList.contains('hidden'),
          bannerText: povBanner ? povBanner.textContent.trim() : '',
          toastText: toast ? toast.textContent.trim() : ''
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const d7 = povStartRes.result.result.value;
  assert(d7.systemMode === 'POV_SETUP', `Mod sistem bertukar kepada POV_SETUP (${d7.systemMode})`);
  assert(d7.povAnchorVisible === true, 'Panel POV Anchor kini dipaparkan di tengah skrin');
  assert(d7.bannerText.includes('Letak di Arah Ini'), 'Banner panduan sensor Nota muncul dengan arahan Letak di Arah Ini');
  assert(d7.toastText.includes('Halakan iPad ke arah pilihan'), 'Notifikasi menyatakan "Halakan iPad ke arah pilihan dan tekan Letak di Arah Ini"');

  // --- UJIAN 8: TEKAN "LETAK DI ARAH INI" ---
  const anchorRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.applySimAngles(0, 0);
        const anchorBtn = document.getElementById('pov-btn-anchor');
        anchorBtn.click();
        const state = window.KotakARSELNEL.state;
        const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
        const notaTitle = document.getElementById('pov-nota-title');
        return {
          systemMode: state.systemMode,
          isAnchored: state.pov.isAnchored,
          toastText: toast ? toast.textContent.trim() : '',
          currentNoteTitle: notaTitle ? notaTitle.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const d8 = anchorRes.result.result.value;
  assert(d8.systemMode === 'POV_LOCKED', `Mod sistem bertukar kepada POV_LOCKED (${d8.systemMode})`);
  assert(d8.isAnchored === true, 'Orientasi 3DoF berjaya di-anchor (isAnchored = true)');
  assert(d8.toastText.includes('POV berjaya dikunci'), 'Notifikasi menyatakan "POV berjaya dikunci pada arah pilihan"');
  assert(d8.currentNoteTitle.includes('Sel Tumbuhan'), 'Kandungan nota dikekalkan tanpa reset');

  // --- UJIAN 9: SEMAT SKRIN SEMULA DARI MOD POV ---
  console.log('\n--- BAHAGIAN 5: UJIAN KEMBALI KE SCREEN_PINNED DARI POV ---');
  const returnPinnedRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const backBtn = document.getElementById('pov-btn-back-pinned');
        backBtn.click();
        const state = window.KotakARSELNEL.state;
        const floatingAnchor = document.getElementById('floating-ar-anchor');
        const povAnchor = document.getElementById('pov-ar-anchor');
        const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
        return {
          systemMode: state.systemMode,
          isPinned: state.isPinned,
          floatingVisible: !floatingAnchor.classList.contains('hidden'),
          povHidden: povAnchor.classList.contains('hidden'),
          toastText: toast ? toast.textContent.trim() : ''
        };
      })()
    `,
    returnByValue: true
  });
  const d9 = returnPinnedRes.result.result.value;
  assert(d9.systemMode === 'SCREEN_PINNED', `Kembali ke SCREEN_PINNED (${d9.systemMode})`);
  assert(d9.isPinned === true, 'isPinned aktif semula');
  assert(d9.floatingVisible === true && d9.povHidden === true, 'Panel Nota biasa dipulihkan dan panel POV disembunyikan');
  assert(d9.toastText.includes('Nota disematkan semula ke skrin'), 'Notifikasi menyatakan "Nota disematkan semula ke skrin"');

  // Tangkap tangkapan skrin rasmi disahkan
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4b3_verified_ipad.png';
  fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
  console.log('\n📸 Tangkapan skrin interaktif disahkan disimpan di:', outPath);

  console.log('\n======================================================================');
  console.log(`📊 KEPUTUSAN UJIAN INTERAKTIF PELAYAR: ${passCount} LULUS, ${failCount} GAGAL`);
  console.log('======================================================================\n');

  ws.close();
  proc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

  if (failCount > 0) process.exit(1);
}

runBrowserTest().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
