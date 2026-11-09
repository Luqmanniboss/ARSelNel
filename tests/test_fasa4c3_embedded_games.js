/**
 * TEST SUITE: HOTFIX FASA 4C.3 — EMBEDDED AR GAMES, MINIMALIST UI & SESSION RECOVERY
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9293;
const TEST_TIMEOUT = 50000;

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
  console.log('🧪 MEMULAKAN UJIAN FASA 4C.3: EMBEDDED AR GAMES, MINIMALIST UI & RECOVERY');
  console.log('========================================================================');

  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4c3-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=393,852',
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

  // Poll for CDP endpoint
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

    // Navigate to Kotak ARSELNEL (local HTTPS or HTTP server)
    const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/code.html';
    console.log(`\nNavigating to: ${targetUrl}`);
    await sendCDP(ws, 'Page.navigate', { url: targetUrl }, ++idCounter);

    // Wait for document to load
    await new Promise(r => setTimeout(r, 3500));

    console.log('\n--- UJIAN 1: VERIFIKASI KATALOG PERMAINAN MINIMALIS (5 ROW LIST) ---');
    
    // Switch to Kuiz module & enter screen pinned mode to reveal the catalog
    await exec(`
      window.KotakARSELNEL.switchActiveModule('kuiz');
      window.KotakARSELNEL.placeVideoOnScreen();
    `);
    await new Promise(r => setTimeout(r, 500));

    const rowsCount = await exec(`document.querySelectorAll('#kuiz-cards-scroll .minimal-game-row').length`);
    assert(rowsCount === 5, `Tepat 5 baris permainan minimalis dipaparkan (Ditemui: ${rowsCount})`);

    const titles = await exec(`
      Array.from(document.querySelectorAll('#kuiz-cards-scroll .minimal-game-row .minimal-game-title')).map(el => el.textContent.trim())
    `);
    console.log('  📋 Tajuk yang dipaparkan:', titles);
    assert(titles.length === 5, '5 tajuk permainan berjaya dibaca');
    assert(titles[0] === 'Labelkan Organel', `Tajuk 1: Labelkan Organel (Ditemui: ${titles[0]})`);
    assert(titles[1] === 'Maze Chase: Misi Sel Haiwan & Tumbuhan', `Tajuk 2: Maze Chase: Misi Sel Haiwan & Tumbuhan (Ditemui: ${titles[1]})`);
    assert(titles[2] === 'Susun Organisasi Kehidupan', `Tajuk 3: Susun Organisasi Kehidupan (Ditemui: ${titles[2]})`);
    assert(titles[3] === 'Kuiz Saintis Muda', `Tajuk 4: Kuiz Saintis Muda (Ditemui: ${titles[3]})`);
    assert(titles[4] === 'Misi Makmal Sains', `Tajuk 5: Misi Makmal Sains (Ditemui: ${titles[4]})`);

    // Verify numbers 1 to 5
    const badges = await exec(`
      Array.from(document.querySelectorAll('#kuiz-cards-scroll .minimal-game-row .minimal-num-badge')).map(el => el.textContent.trim())
    `);
    assert(JSON.stringify(badges) === JSON.stringify(['1', '2', '3', '4', '5']), `Nombor baris 1-5 teratur: [${badges.join(', ')}]`);

    // Verify that bloat badges (tags, chips, thumb images) are removed
    const bloatedMetaCount = await exec(`document.querySelectorAll('#kuiz-cards-scroll .game-card-meta-top, #kuiz-cards-scroll .game-rewards-chips, #kuiz-cards-scroll .game-thumb-box').length`);
    assert(bloatedMetaCount === 0, `Tiada lencana kategori, tahap, poin, masa atau thumbnail menghalang paparan (Count: ${bloatedMetaCount})`);

    // Verify each row has a Play button
    const playButtons = await exec(`document.querySelectorAll('#kuiz-cards-scroll .minimal-game-row .btn-minimal-play').length`);
    assert(playButtons === 5, `Setiap baris mempunyai butang "Main" (Ditemui: ${playButtons})`);

    console.log('\n--- UJIAN 2: VERIFIKASI DYNAMIC SCANNER PROMPT & ARSESSIONRECOVERYMANAGER ---');
    
    // Set state to SCANNING to test dynamic prompt strings per module
    await exec(`window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.SCANNING);`);

    // Switch to Video and test prompt
    await exec(`window.KotakARSELNEL.switchActiveModule('video');`);
    const promptVideo = await exec(`document.getElementById('scanner-prompt-text').textContent.trim()`);
    assert(promptVideo === 'Halakan kamera ke Marker Video pada Kotak ARSELNEL', `Prompt Video dinamik: "${promptVideo}"`);

    // Switch to Nota and test prompt
    await exec(`window.KotakARSELNEL.switchActiveModule('nota');`);
    const promptNota = await exec(`document.getElementById('scanner-prompt-text').textContent.trim()`);
    assert(promptNota === 'Halakan kamera ke Marker Nota pada Kotak ARSELNEL', `Prompt Nota dinamik: "${promptNota}"`);

    // Switch to Kuiz and test prompt
    await exec(`window.KotakARSELNEL.switchActiveModule('kuiz');`);
    const promptKuiz = await exec(`document.getElementById('scanner-prompt-text').textContent.trim()`);
    assert(promptKuiz === 'Halakan kamera ke Marker Kuiz & Permainan pada Kotak ARSELNEL', `Prompt Kuiz dinamik: "${promptKuiz}"`);

    // Test error recovery box
    await exec(`window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.ERROR)`);
    const isRecoveryBoxVisible = await exec(`!document.getElementById('scanner-recovery-box').classList.contains('hidden')`);
    assert(isRecoveryBoxVisible === true, 'Kotak pemulihan kamera dipaparkan semasa ralat kamera');

    // Return to scanning
    await exec(`window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.SCANNING)`);
    const isRecoveryBoxHidden = await exec(`document.getElementById('scanner-recovery-box').classList.contains('hidden')`);
    assert(isRecoveryBoxHidden === true, 'Kotak pemulihan disembunyikan apabila mod imbasan aktif');

    console.log('\n--- UJIAN 3: VERIFIKASI EMBEDDED AR GAME LIFECYCLE (KEKAL DALAM SESI WEBAR) ---');

    // Launch game 1 ("Labelkan Organel") embedded inside panel
    await exec(`
      const game1 = window.KotakARSELNEL.state.games[0];
      window.startEmbeddedGame(game1);
    `);
    await new Promise(r => setTimeout(r, 600));

    const isEmbeddedViewVisible = await exec(`!document.getElementById('embedded-game-view').classList.contains('hidden')`);
    assert(isEmbeddedViewVisible === true, 'Panel Embedded AR Game dipaparkan');

    const embeddedTitle = await exec(`document.getElementById('embedded-game-title').textContent.trim()`);
    assert(embeddedTitle === 'Labelkan Organel', `Tajuk permainan tertanam: "${embeddedTitle}"`);

    const iframeSrc = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(iframeSrc.includes('labelkan-organel.html') && iframeSrc.includes('embedded=true'), `iframe dimuatkan dengan parameter embedded=true (${iframeSrc})`);

    const isSelectionHidden = await exec(`document.getElementById('kuiz-selection-view').classList.contains('hidden')`);
    assert(isSelectionHidden === true, 'Senarai katalog disembunyikan semasa permainan berlangsung');

    console.log('\n--- UJIAN 4: VERIFIKASI MOD FOKUS (EXPANDED PANEL VIEW) ---');
    
    await exec(`window.toggleGameFocusMode()`);
    const isFocusActive = await exec(`document.getElementById('floating-card-container').classList.contains('is-focus-mode')`);
    assert(isFocusActive === true, 'Mod Fokus aktif: panel membesar untuk keselesaan bermain');

    await exec(`window.toggleGameFocusMode()`);
    const isFocusDeactivated = await exec(`!document.getElementById('floating-card-container').classList.contains('is-focus-mode')`);
    assert(isFocusDeactivated === true, 'Mod Fokus ditutup: saiz normal dipulihkan');

    console.log('\n--- UJIAN 5: VERIFIKASI TUTUP PERMAINAN & KEMBALI KE KATALOG ---');

    await exec(`window.closeEmbeddedGame()`);
    await new Promise(r => setTimeout(r, 300));

    const isEmbeddedViewHidden = await exec(`document.getElementById('embedded-game-view').classList.contains('hidden')`);
    assert(isEmbeddedViewHidden === true, 'Panel Embedded Game disembunyikan semula');

    const iframeCleanedSrc = await exec(`document.getElementById('embedded-game-iframe').src`);
    assert(iframeCleanedSrc.includes('about:blank'), `iframe dikosongkan (about:blank) untuk membebaskan memori & menghentikan audio (${iframeCleanedSrc})`);

    const isSelectionRestored = await exec(`!document.getElementById('kuiz-selection-view').classList.contains('hidden')`);
    assert(isSelectionRestored === true, 'Senarai 5 katalog permainan dipaparkan semula');

    console.log('\n--- UJIAN 6: VERIFIKASI REGRESI MODUL VIDEO & NOTA ---');
    
    // Switch to Video module
    await exec(`window.KotakARSELNEL.switchActiveModule('video');`);
    const isVideoViewActive = await exec(`document.getElementById('video-selection-view').style.display !== 'none' || document.getElementById('active-player-view').classList.contains('is-active')`);
    assert(isVideoViewActive === true, 'Modul Video kekal berfungsi dengan sempurna');

    // Switch to Nota module
    await exec(`window.KotakARSELNEL.switchActiveModule('nota');`);
    const isNotaViewActive = await exec(`!document.getElementById('active-nota-view').classList.contains('hidden') || !document.getElementById('nota-selection-view').classList.contains('hidden')`);
    assert(isNotaViewActive === true, 'Modul Nota Interaktif kekal berfungsi dengan sempurna');

    // Return to Kuiz module for final screenshot
    await exec(`
      window.KotakARSELNEL.switchActiveModule('kuiz');
      window.KotakARSELNEL.placeVideoOnScreen();
    `);
    await new Promise(r => setTimeout(r, 600));

    // Capture screenshot
    const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, ++idCounter);
    const artifactPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4c3_verified.png');
    fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
    console.log(`\n📸 Tangkapan skrin pengesahan disimpan ke: ${artifactPath}`);

    console.log('\n========================================================================');
    console.log('🎉 SEMUA UJIAN FASA 4C.3 BERJAYA DILAKSANAKAN DENGAN CEMERLANG!');
    console.log('========================================================================');

  } catch (err) {
    console.error('❌ Ralat Ujian:', err);
    process.exit(1);
  } finally {
    cleanup();
  }
}

runTest();
