/**
 * TEST SUITE: HOTFIX FASA 4C.2 — INTEGRASI 5 PERMAINAN ASAL ARSELNEL KE DALAM MARKER KUIZ
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9292;
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
  console.log('🧪 MEMULAKAN UJIAN INTEGRASI 5 PERMAINAN ASAL ARSELNEL (FASA 4C.2)');
  console.log('========================================================================');

  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4c2-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,768',
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
      throw new Error(`JS Exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  };

  await sendCDP(ws, 'Page.enable', {}, ++idCounter);
  await sendCDP(ws, 'DOM.enable', {}, ++idCounter);

  try {
    console.log('\n[1/5] Memuatkan Kotak ARSELNEL di http://localhost:3000/kotak_arselnel/code.html...');
    await exec(`window.location.href = 'http://localhost:3000/kotak_arselnel/code.html'`);
    await new Promise(r => setTimeout(r, 3500));

    // Wait for KotakARSELNEL global
    const ready = await exec(`typeof window.KotakARSELNEL !== 'undefined'`);
    assert(ready === true, 'KotakARSELNEL runtime global berjaya dimuatkan.');

    console.log('\n[2/5] Mengaktifkan Modul Kuiz & Mengesahkan 5 Permainan Asal...');
    await exec(`window.KotakARSELNEL.switchActiveModule('kuiz')`);
    await new Promise(r => setTimeout(r, 600));

    const moduleState = await exec(`window.KotakARSELNEL.state.activeModule`);
    assert(moduleState === 'kuiz', 'Active module berjaya bertukar kepada "kuiz".');

    const headerText = await exec(`document.getElementById('panel-category-text').textContent.trim()`);
    assert(headerText.includes('Kuiz & Permainan'), `Tajuk header panel memaparkan kategori yang tepat: "${headerText}"`);

    // Verify MCQ runner is HIDDEN and Selection View is VISIBLE
    const activeKuizHidden = await exec(`document.getElementById('active-kuiz-view').classList.contains('hidden')`);
    assert(activeKuizHidden === true, 'Pemandu soalan objektif generik (Soalan 1/5) TIDAK dibuka secara automatik (kekal tersembunyi).');

    const selectionViewVisible = await exec(`!document.getElementById('kuiz-selection-view').classList.contains('hidden')`);
    assert(selectionViewVisible === true, 'Katalog 5 Permainan Sains ARSELNEL aktif dan dipaparkan dalam panel terapung.');

    // Verify 5 game cards exist in #kuiz-cards-scroll
    const gamesCount = await exec(`document.querySelectorAll('#kuiz-cards-scroll .arselnel-game-card').length`);
    assert(gamesCount === 5, `Tepat 5 kad permainan dipaparkan dalam #kuiz-cards-scroll (Dijumpai: ${gamesCount}).`);

    // Verify individual games metadata
    const gamesData = await exec(`
      Array.from(document.querySelectorAll('#kuiz-cards-scroll .arselnel-game-card')).map(card => {
        return {
          title: card.querySelector('.game-title')?.textContent?.trim(),
          desc: card.querySelector('.game-desc')?.textContent?.trim(),
          thumb: card.querySelector('.game-thumb-img')?.getAttribute('src'),
          topic: card.querySelector('.tag-badge')?.textContent?.trim(),
          btnText: card.querySelector('.btn-launch-game span')?.textContent?.trim()
        };
      })
    `);

    console.log('  Senarai 5 Permainan Asal yang dikesan:');
    gamesData.forEach((g, i) => {
      console.log(`    ${i+1}. ${g.title} | ${g.topic} | Thumb: ${g.thumb}`);
    });

    assert(gamesData[0].title === 'Labelkan Organel', 'Permainan 1 ialah "Labelkan Organel".');
    assert(gamesData[0].thumb.includes('game_label.svg'), 'Permainan 1 menggunakan thumbnail SVG game_label.svg.');
    assert(gamesData[1].title.includes('Maze Chase'), 'Permainan 2 ialah "Maze Chase: Misi Sel Haiwan & Tumbuhan".');
    assert(gamesData[1].thumb.includes('game_maze_chase.svg'), 'Permainan 2 menggunakan thumbnail SVG game_maze_chase.svg.');
    assert(gamesData[2].title === 'Susun Organisasi Kehidupan', 'Permainan 3 ialah "Susun Organisasi Kehidupan".');
    assert(gamesData[2].thumb.includes('game_sequence.svg'), 'Permainan 3 menggunakan thumbnail SVG game_sequence.svg.');
    assert(gamesData[3].title === 'Kuiz Saintis Muda', 'Permainan 4 ialah "Kuiz Saintis Muda".');
    assert(gamesData[3].thumb.includes('game_quiz.svg'), 'Permainan 4 menggunakan thumbnail SVG game_quiz.svg.');
    assert(gamesData[4].title === 'Misi Makmal Sains', 'Permainan 5 ialah "Misi Makmal Sains".');
    assert(gamesData[4].thumb.includes('game_lab_mission.svg'), 'Permainan 5 menggunakan thumbnail SVG game_lab_mission.svg.');

    console.log('\n[3/5] Menguji Mod Semat Skrin & Saiz Panel...');
    await exec(`document.getElementById('btn-place-video').click()`);
    await new Promise(r => setTimeout(r, 400));

    const isScreenPinned = await exec(`window.KotakARSELNEL.state.systemMode === 'SCREEN_PINNED'`);
    assert(isScreenPinned === true, 'Mod Semat Skrin (Screen-Pinned) berjaya diaktifkan.');

    // Test Size segmented control
    await exec(`document.getElementById('btn-size-l').click()`);
    await new Promise(r => setTimeout(r, 200));
    const isSizeL = await exec(`document.getElementById('floating-card-container').classList.contains('size-large')`);
    assert(isSizeL === true, 'Saiz panel L berjaya diterapkan pada panel 5 Permainan.');

    console.log('\n[4/5] Menguji Mod Kunci POV 3DoF (Tanpa Flash Video atau MCQ)...');
    await exec(`document.getElementById('btn-start-pov').click()`);
    await new Promise(r => setTimeout(r, 600));

    const isPOVActive = await exec(`window.KotakARSELNEL.state.pov.active === true`);
    assert(isPOVActive === true, 'Mod Kunci POV berjaya diaktifkan.');

    // Crucial check: Verify Video Player and MCQ runner are completely hidden in POV mode
    const povVideoHidden = await exec(`document.getElementById('pov-active-player-view').classList.contains('hidden')`);
    assert(povVideoHidden === true, 'Tiada flash pemain video YouTube dalam mod POV Kuiz.');

    const povMcqHidden = await exec(`document.getElementById('pov-active-kuiz-view').classList.contains('hidden')`);
    assert(povMcqHidden === true, 'Tiada flash soalan MCQ generik dalam mod POV Kuiz.');

    const povSelectionVisible = await exec(`!document.getElementById('pov-kuiz-selection-view').classList.contains('hidden')`);
    assert(povSelectionVisible === true, 'Katalog 5 Permainan Asal dipaparkan secara kemas dalam mod POV.');

    const povCardsCount = await exec(`document.querySelectorAll('#pov-kuiz-cards-scroll .arselnel-game-card').length`);
    assert(povCardsCount === 5, `Tepat 5 kad permainan dipaparkan dalam POV (#pov-kuiz-cards-scroll count: ${povCardsCount}).`);

    // Verify Telemetry HUD is present in POV Kuiz
    const povTelemetryVisible = await exec(`!document.getElementById('pov-kuiz-telemetry-hud-strip').classList.contains('hidden')`);
    assert(povTelemetryVisible === true, 'Jalur Telemetri HUD (Yaw & Pitch) wujud dan aktif dalam mod POV.');

    // Verify Dead Sensor Guard activates when no gyro hardware present
    await exec(`document.getElementById('pov-btn-anchor').click()`);
    await new Promise(r => setTimeout(r, 200));
    const deadSensorProtected = await exec(`document.getElementById('pov-kuiz-val-status').textContent.includes('Sensor Tidak Aktif')`);
    assert(deadSensorProtected === true, 'Kawalan Dead Sensor Guard berfungsi dengan baik pada peranti tanpa giroskop.');

    // Now supply simulated/sensor reading to test POV Anchoring
    await exec(`
      window.KotakARSELNEL.state.pov.hasSensor = true;
      window.KotakARSELNEL.state.pov.currentYaw = 25.0;
      window.KotakARSELNEL.state.pov.currentPitch = -5.0;
      document.getElementById('pov-btn-anchor').click();
    `);
    await new Promise(r => setTimeout(r, 300));
    const povAnchored = await exec(`window.KotakARSELNEL.state.pov.isAnchored === true || window.KotakARSELNEL.state.systemMode === 'POV_LOCKED'`);
    assert(povAnchored === true, 'Orientasi sasaran POV berjaya dikunci ("Letak di Arah Ini") apabila sensor aktif.');

    console.log('\n[5/5] Menguji Mekanisme Pelancaran Permainan & Pautan Balik ke ARSELNEL...');
    // Test return router in games/labelkan-organel.html
    await exec(`window.location.href = 'http://localhost:3000/games/labelkan-organel.html?from=kotak_ar'`);
    await new Promise(r => setTimeout(r, 2000));

    const returnLinkHref = await exec(`document.querySelector('a[href*="kotak_arselnel"]').getAttribute('href')`);
    assert(returnLinkHref.includes('kotak_arselnel/code.html'), `Pautan balik diperbaharui ke Kotak ARSELNEL (${returnLinkHref}).`);

    const returnLinks = await exec(`
      Array.from(document.querySelectorAll('a[href*="kotak_arselnel"]')).map(a => a.textContent.trim())
    `);
    const hasKotakArLink = returnLinks.some(txt => txt.includes('Kotak ARSELNEL'));
    assert(hasKotakArLink === true, `Teks butang kembali dikemas kini kepada "Kembali ke Kotak ARSELNEL" (Dijumpai: ${JSON.stringify(returnLinks)}).`);

    // Return back to Kotak ARSELNEL
    await exec(`window.location.href = 'http://localhost:3000/kotak_arselnel/code.html'`);
    await new Promise(r => setTimeout(r, 2500));

    // Test Regression to Video & Nota
    await exec(`window.KotakARSELNEL.switchActiveModule('video')`);
    await new Promise(r => setTimeout(r, 400));
    const videoMod = await exec(`window.KotakARSELNEL.state.activeModule`);
    assert(videoMod === 'video', 'Regresi: Berjaya bertukar semula ke modul Video.');

    await exec(`window.KotakARSELNEL.switchActiveModule('nota')`);
    await new Promise(r => setTimeout(r, 400));
    const notaMod = await exec(`window.KotakARSELNEL.state.activeModule`);
    assert(notaMod === 'nota', 'Regresi: Berjaya bertukar semula ke modul Nota Interaktif.');

    // Switch back to kuiz for screenshot
    await exec(`window.KotakARSELNEL.switchActiveModule('kuiz')`);
    await exec(`document.getElementById('btn-place-video').click()`);
    await new Promise(r => setTimeout(r, 500));

    // Capture screenshot
    const screenshotRes = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, ++idCounter);
    if (screenshotRes && screenshotRes.data) {
      const artifactPath = path.join('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb', 'kotak_arselnel_fasa4c2_original_games_verified.png');
      fs.writeFileSync(artifactPath, Buffer.from(screenshotRes.data, 'base64'));
      console.log(`\n📸 Tangkap layar pengesahan berjaya disimpan di: ${artifactPath}`);
    }

    console.log('\n========================================================================');
    console.log('🎉 SEMUA UJIAN HOTFIX FASA 4C.2 LULUS DENGAN CEMERLANG!');
    console.log('========================================================================');

  } finally {
    cleanup();
  }
}

runTest().catch(err => {
  console.error('\n❌ RALAT UJIAN:', err.message);
  process.exit(1);
});
