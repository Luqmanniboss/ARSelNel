/**
 * TEST SUITE: HOTFIX FASA 4C.4 — GAME SESSION PERSISTENCE + FREE RESIZE PANEL
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9294;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runTest() {
  console.log('========================================================================');
  console.log('🧪 UJIAN FASA 4C.4: GAME SESSION PERSISTENCE & FREE RESIZE (IPAD LANDSCAPE)');
  console.log('========================================================================');

  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4c4-'));

  // iPad Landscape dimensions (1024 x 768)
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,768',
    '--ignore-certificate-errors',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  let ws;
  let targetWsUrl;

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const targets = await listRes.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          targetWsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (e) {}
  }

  if (!targetWsUrl) {
    cleanup();
    throw new Error('Failed to connect to Chrome CDP WebSocket');
  }

  const WebSocket = global.WebSocket || require('ws');
  ws = new WebSocket(targetWsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const exec = async (expression) => {
    const id = ++idCounter;
    const res = await sendCDP(ws, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    }, id);
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  };

  try {
    await sendCDP(ws, 'Page.enable', {}, ++idCounter);
    await sendCDP(ws, 'Runtime.enable', {}, ++idCounter);
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    }, ++idCounter);

    const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/code.html';
    console.log(`\nNavigating to: ${targetUrl}`);
    await sendCDP(ws, 'Page.navigate', { url: targetUrl }, ++idCounter);
    await new Promise(r => setTimeout(r, 3500));

    console.log('\n--- BAHAGIAN 1: PENGESAHAN GAME SESSION STATE MACHINE ---');
    
    // Set scanner to SCANNING mode
    await exec(`window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.SCANNING);`);

    // Verify initial state is CATALOG_ACTIVE
    const initState = await exec(`window.GameSessionManager.state`);
    assert(initState === 'CATALOG_ACTIVE', `State awal: ${initState}`);

    // Switch to kuiz module
    await exec(`
      window.KotakARSELNEL.switchActiveModule('kuiz');
      window.KotakARSELNEL.placeVideoOnScreen();
    `);
    await new Promise(r => setTimeout(r, 500));

    // Start Maze Chase (game 2 in catalog)
    await exec(`
      const mazeGame = window.KotakARSELNEL.state.games.find(g => g.id === 'maze_chase');
      window.startEmbeddedGame(mazeGame);
    `);
    await new Promise(r => setTimeout(r, 600));

    const activeState = await exec(`window.GameSessionManager.state`);
    assert(activeState === 'GAME_ACTIVE' || activeState === 'GAME_LOADING', `State semasa permainan: ${activeState}`);

    const isGameActive = await exec(`window.GameSessionManager.isGameActive()`);
    assert(isGameActive === true, `isGameActive() mengembalikan true`);

    const activeGameId = await exec(`window.GameSessionManager.activeGameId`);
    assert(activeGameId === 'maze_chase', `activeGameId direkodkan sebagai: ${activeGameId}`);

    const iframeSrc = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(iframeSrc.includes('klasifikasi-sel.html') && iframeSrc.includes('embedded=true'), `iframe Maze Chase dimuatkan: ${iframeSrc}`);

    console.log('\n--- BAHAGIAN 2: UJIAN ISOLASI MARKER TRACKING & TIMEOUT HYSTERESIS ---');

    // 1. Simulate Marker Lost event with debounce
    console.log('  Testing Marker Lost event during active game...');
    await exec(`
      if (window.KotakARSELNEL.state.anchorKuiz && window.KotakARSELNEL.state.anchorKuiz.onTargetLost) {
        window.KotakARSELNEL.state.anchorKuiz.onTargetLost();
      }
    `);
    // Wait for hysteresis delay (1300ms)
    await new Promise(r => setTimeout(r, 1400));

    const isViewStillOpenAfterLost = await exec(`!document.getElementById('embedded-game-view').classList.contains('hidden')`);
    assert(isViewStillOpenAfterLost === true, 'Permainan TIDAK tertutup apabila marker hilang dari pandangan');

    const isCatalogStillHiddenAfterLost = await exec(`document.getElementById('kuiz-selection-view').classList.contains('hidden')`);
    assert(isCatalogStillHiddenAfterLost === true, 'Katalog TIDAK dibuka semula apabila marker hilang');

    // 2. Simulate Marker Re-detection (Marker Found)
    console.log('  Testing Marker Found event during active game...');
    await exec(`
      if (window.KotakARSELNEL.state.anchorKuiz && window.KotakARSELNEL.state.anchorKuiz.onTargetFound) {
        window.KotakARSELNEL.state.anchorKuiz.onTargetFound();
      }
    `);
    await new Promise(r => setTimeout(r, 500));

    const isViewStillOpenAfterFound = await exec(`!document.getElementById('embedded-game-view').classList.contains('hidden')`);
    assert(isViewStillOpenAfterFound === true, 'Permainan TIDAK kembali ke senarai apabila marker dikesan semula');

    const iframeSrcAfterFound = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(iframeSrcAfterFound.includes('klasifikasi-sel.html'), 'iframe TIDAK di-reload semasa pengesanan semula marker');

    // 3. Simulate another marker found (e.g. Marker Video or Marker Nota)
    console.log('  Testing stray Marker Video detection while game active...');
    await exec(`
      if (window.KotakARSELNEL.state.anchorVideo && window.KotakARSELNEL.state.anchorVideo.onTargetFound) {
        window.KotakARSELNEL.state.anchorVideo.onTargetFound();
      }
    `);
    await new Promise(r => setTimeout(r, 500));

    const activeMod = await exec(`window.KotakARSELNEL.state.activeModule`);
    assert(activeMod === 'kuiz', `Modul kekal 'kuiz' (Pengesanan marker lain disekat semasa permainan aktif)`);

    console.log('\n--- BAHAGIAN 3: UJIAN FREE RESIZE (2D X DAN Y PADA IPAD LANDSCAPE) ---');

    // Check corner resize handle visibility
    const isHandleVisible = await exec(`
      const h = document.getElementById('corner-resize-handle');
      const s = window.getComputedStyle(h);
      s.display !== 'none' && s.visibility !== 'hidden';
    `);
    assert(isHandleVisible === true, 'Pemegang resize penjuru kanan bawah sedia dan kelihatan');

    // Check initial width and height
    const initRect = await exec(`
      (() => {
        const r = document.getElementById('floating-card-container').getBoundingClientRect();
        return { width: r.width, height: r.height };
      })()
    `);
    console.log('  Initial Card Dimensions:', initRect);

    // Simulate resizing width & height (dX = +150, dY = +100)
    await exec(`
      (() => {
        const handle = document.getElementById('corner-resize-handle');
        const startX = 600, startY = 500;
        handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + 150, clientY: startY + 100, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: startX + 150, clientY: startY + 100, bubbles: true }));
      })()
    `);
    await new Promise(r => setTimeout(r, 300));

    const resizedRect = await exec(`
      (() => {
        const r = document.getElementById('floating-card-container').getBoundingClientRect();
        return { width: r.width, height: r.height };
      })()
    `);
    console.log('  Resized Card Dimensions:', resizedRect);
    assert(resizedRect.width > initRect.width, `Lebar panel berjaya dibesarkan: ${resizedRect.width.toFixed(1)}px > ${initRect.width.toFixed(1)}px`);
    assert(resizedRect.height > initRect.height, `Tinggi panel berjaya dibesarkan: ${resizedRect.height.toFixed(1)}px > ${initRect.height.toFixed(1)}px`);

    const hasResizedClass = await exec(`document.getElementById('floating-card-container').classList.contains('is-custom-resized')`);
    assert(hasResizedClass === true, 'Kelas .is-custom-resized ditanda pada panel');

    const iframeWrapperHeight = await exec(`
      document.getElementById('embedded-iframe-wrapper').getBoundingClientRect().height;
    `);
    assert(iframeWrapperHeight >= 350, `Kawasan iframe permainan membesar bersama panel (${iframeWrapperHeight.toFixed(1)}px)`);

    // Verify iframe did NOT reload or reset
    const iframeSrcAfterResize = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(iframeSrcAfterResize.includes('klasifikasi-sel.html'), 'Permainan KEKAL aktif tanpa sebarang reload iframe semasa resize');

    console.log('\n--- BAHAGIAN 4: UJIAN DOUBLE-TAP MAXIMIZE & RESTORE ---');

    await exec(`window.toggleMaximizePanel()`);
    await new Promise(r => setTimeout(r, 300));

    const maxRect = await exec(`
      (() => {
        const r = document.getElementById('floating-card-container').getBoundingClientRect();
        return { width: r.width, height: r.height, isMax: document.getElementById('floating-card-container').classList.contains('is-maximized') };
      })()
    `);
    console.log('  Maximized Dimensions:', maxRect);
    assert(maxRect.isMax === true, 'Panel memasuki mod .is-maximized');
    assert(maxRect.width >= 800, `Lebar panel menggunakan ruang skrin iPad sepenuhnya (${maxRect.width.toFixed(1)}px >= 800px)`);

    // Toggle back to restored size
    await exec(`window.toggleMaximizePanel()`);
    await new Promise(r => setTimeout(r, 300));

    const restoredMaxState = await exec(`document.getElementById('floating-card-container').classList.contains('is-maximized')`);
    assert(restoredMaxState === false, 'Panel berjaya dikembalikan dari saiz maksimum');

    console.log('\n--- BAHAGIAN 5: UJIAN KEMBALI KE SENARAI & TUKAR PERMAINAN ---');

    // Click "Kembali" button
    await exec(`window.closeEmbeddedGame()`);
    await new Promise(r => setTimeout(r, 400));

    const stateAfterClose = await exec(`window.GameSessionManager.state`);
    assert(stateAfterClose === 'CATALOG_ACTIVE', `State kembali kepada: ${stateAfterClose}`);

    const isCatalogVisible = await exec(`!document.getElementById('kuiz-selection-view').classList.contains('hidden')`);
    assert(isCatalogVisible === true, 'Katalog 5 permainan dipaparkan semula dengan betul');

    const cleanedIframeSrc = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(cleanedIframeSrc.includes('about:blank'), `iframe dikosongkan (about:blank) untuk membebaskan audio & memori`);

    // Select game 3 ("Susun Organisasi Kehidupan")
    console.log('  Launching game 3 (Susun Organisasi Kehidupan)...');
    await exec(`
      const game3 = window.KotakARSELNEL.state.games.find(g => g.id === 'susun_organisasi');
      window.startEmbeddedGame(game3);
    `);
    await new Promise(r => setTimeout(r, 600));

    const newGameTitle = await exec(`document.getElementById('embedded-game-title').textContent.trim()`);
    assert(newGameTitle === 'Susun Organisasi Kehidupan', `Permainan baharu dibuka dengan tepat: "${newGameTitle}"`);

    const newIframeSrc = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(newIframeSrc.includes('organisasi-kehidupan.html'), `iframe memuatkan laluan permainan yang betul`);

    console.log('\n--- BAHAGIAN 6: REGRESI MODUL VIDEO & NOTA ---');

    // Close game first
    await exec(`window.closeEmbeddedGame()`);

    // Test Video
    await exec(`window.KotakARSELNEL.switchActiveModule('video');`);
    const isVideoOk = await exec(`document.getElementById('panel-category-text').textContent.includes('Video')`);
    assert(isVideoOk === true, 'Modul Video bertukar dan berfungsi');

    // Test Nota
    await exec(`window.KotakARSELNEL.switchActiveModule('nota');`);
    const isNotaOk = await exec(`document.getElementById('panel-category-text').textContent.includes('Nota')`);
    assert(isNotaOk === true, 'Modul Nota Interaktif bertukar dan berfungsi');

    // Return to Kuiz with game running for final screenshot
    await exec(`
      window.KotakARSELNEL.switchActiveModule('kuiz');
      const game2 = window.KotakARSELNEL.state.games.find(g => g.id === 'maze_chase');
      window.startEmbeddedGame(game2);
      window.toggleMaximizePanel();
    `);
    await new Promise(r => setTimeout(r, 600));

    // Capture screenshot
    const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, ++idCounter);
    const artifactPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4c4_verified.png');
    fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
    console.log(`\n📸 Tangkapan skrin pengesahan disimpan ke: ${artifactPath}`);

    console.log('\n========================================================================');
    console.log('🎉 SEMUA UJIAN FASA 4C.4 BERJAYA DILAKSANAKAN DENGAN CEMERLANG!');
    console.log('========================================================================');

  } catch (err) {
    console.error('❌ Ralat Ujian:', err);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runTest();
