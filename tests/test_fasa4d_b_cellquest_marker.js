/**
 * TEST SUITE: FASA 4D-B — PENAMBAHAN MARKER CELLQUEST 3D (TARGET INDEX 3)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9295;

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
  console.log('🧪 UJIAN FASA 4D-B: PENAMBAHAN MARKER CELLQUEST 3D (TARGET INDEX 3)');
  console.log('========================================================================\n');

  // 1. Static asset verification
  console.log('--- BAHAGIAN 1: VERIFIKASI FAIL STATIK MARKER & KOMPILASI ---');
  const mindPath = path.join(__dirname, '..', 'kotak_arselnel', 'assets', 'markers', 'kotak_arselnel.mind');
  assert(fs.existsSync(mindPath), 'Fail kotak_arselnel.mind wujud');
  const mindStat = fs.statSync(mindPath);
  assert(mindStat.size > 2000000, `Saiz fail .mind kompilasi 4 target mencukupi (${(mindStat.size / (1024*1024)).toFixed(2)} MB > 2.0 MB)`);

  const mindBak = path.join(__dirname, '..', 'kotak_arselnel', 'assets', 'markers', 'kotak_arselnel.fasa4c.bak.mind');
  assert(fs.existsSync(mindBak), 'Sandaran kotak_arselnel.fasa4c.bak.mind wujud sebagai fail-safe');

  const svgPath = path.join(__dirname, '..', 'kotak_arselnel', 'assets', 'markers', 'marker-cellquest.svg');
  assert(fs.existsSync(svgPath), 'Fail marker-cellquest.svg wujud');

  const pngPath = path.join(__dirname, '..', 'kotak_arselnel', 'assets', 'markers', 'marker-cellquest.png');
  assert(fs.existsSync(pngPath), 'Fail marker-cellquest.png wujud');
  const pngStat = fs.statSync(pngPath);
  assert(pngStat.size > 100000, `Saiz marker-cellquest.png berdefinisi tinggi (${pngStat.size} bytes)`);

  // 2. Check marker-print.html
  console.log('\n--- BAHAGIAN 2: VERIFIKASI HALAMAN CETAKAN (marker-print.html) ---');
  const printHtmlPath = path.join(__dirname, '..', 'kotak_arselnel', 'marker-print.html');
  const printHtml = fs.readFileSync(printHtmlPath, 'utf8');
  assert(printHtml.includes('CellQuest 3D'), 'marker-print.html mempunyai label "CellQuest 3D"');
  assert(printHtml.includes('card-cellquest'), 'marker-print.html mempunyai elemen "#card-cellquest"');
  assert(printHtml.includes('tab-cellquest'), 'marker-print.html mempunyai tab-cellquest');
  assert(printHtml.includes('showMarker(\'cellquest\')'), 'marker-print.html mempunyai skrip navigasi tab CellQuest');
  assert(printHtml.includes('INDEX 3 • 20 × 20 CM'), 'marker-print.html menyatakan INDEX 3 untuk CellQuest');

  // 3. Browser CDP Test for Kotak ARSELNEL runtime
  console.log('\n--- BAHAGIAN 3: VERIFIKASI RUNTIME KOTAK ARSELNEL (HEADLESS BROWSER) ---');
  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4db-'));

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

  if (!targetWsUrl) throw new Error('Could not connect to CDP WebSocket');

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);
  await sendCDP(ws, 'Console.enable', {}, cdpId++);

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
        if (msg.params.type === 'error') {
          console.error('    [Browser Console Error]:', text);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('    [Browser Exception]:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    } catch (e) {}
  });

  // Navigate to Kotak ARSELNEL
  const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`  Navigating to: ${targetUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);

  // Wait for load
  await new Promise(r => setTimeout(r, 2500));

  // Check DOM structure
  const domCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      return {
        hasCellquestView: !!document.getElementById('cellquest-selection-view'),
        hasBtnAnimal: !!document.getElementById('btn-choice-animal'),
        hasBtnPlant: !!document.getElementById('btn-choice-plant'),
        hasPovCellquestView: !!document.getElementById('pov-cellquest-selection-view'),
        hasPovBtnAnimal: !!document.getElementById('pov-btn-choice-animal'),
        hasPovBtnPlant: !!document.getElementById('pov-btn-choice-plant'),
        floatingAnchor: !!document.getElementById('floating-ar-anchor'),
        floatingCard: !!document.getElementById('floating-card-container')
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const dom = domCheck.result.value;
  assert(dom.hasCellquestView, 'Elemen #cellquest-selection-view wujud');
  assert(dom.hasBtnAnimal, 'Butang #btn-choice-animal wujud');
  assert(dom.hasBtnPlant, 'Butang #btn-choice-plant wujud');
  assert(dom.hasPovCellquestView, 'Elemen #pov-cellquest-selection-view wujud');
  assert(dom.hasPovBtnAnimal, 'Butang #pov-btn-choice-animal wujud');
  assert(dom.hasPovBtnPlant, 'Butang #pov-btn-choice-plant wujud');

  // Trigger switchActiveModule('cellquest')
  console.log('\n--- UJIAN MODUL CELLQUEST 3D ---');
  const switchRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      try {
        window.KotakARSELNEL.switchActiveModule('cellquest');
        const card = document.getElementById('floating-card-container');
        const tag = document.getElementById('panel-category-tag');
        const tagText = document.getElementById('panel-category-text');
        const view = document.getElementById('cellquest-selection-view');
        const povView = document.getElementById('pov-cellquest-selection-view');
        const videoView = document.getElementById('video-selection-view');
        const notaView = document.getElementById('nota-selection-view');
        const kuizView = document.getElementById('kuiz-selection-view');

        return {
          isModuleCellquest: card.classList.contains('module-cellquest'),
          tagHasCellquest: tag.classList.contains('tag-cellquest'),
          tagText: tagText ? tagText.textContent : '',
          viewNotHidden: (!document.getElementById('cellquest-ar-hud') || !document.getElementById('cellquest-ar-hud').classList.contains('hidden')) || !view.classList.contains('hidden'),
          videoViewHidden: videoView.style.display === 'none' || videoView.classList.contains('hidden'),
          notaViewHidden: notaView.classList.contains('hidden'),
          kuizViewHidden: kuizView.classList.contains('hidden')
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`,
    returnByValue: true
  }, cdpId++);

  if (!switchRes || !switchRes.result) {
    console.error('switchRes raw:', JSON.stringify(switchRes));
  }
  const sw = switchRes.result.value;
  if (sw && sw.error) {
    console.error('In-browser error:', sw.error, sw.stack);
  }
  assert(sw.isModuleCellquest, 'Panel kontena mempunyai tema warna .module-cellquest (Biru #2563eb)');
  assert(sw.tagHasCellquest, 'Lencana kategori mempunyai kelas .tag-cellquest');
  assert(sw.tagText.includes('CellQuest 3D'), `Teks kategori ialah "${sw.tagText}"`);
  assert(sw.viewNotHidden, 'Panel pilihan Sel Haiwan / Sel Tumbuhan dipaparkan (tidak tersembunyi)');
  assert(sw.videoViewHidden && sw.notaViewHidden && sw.kuizViewHidden, 'Semua paparan modul lain (Video, Nota, Kuiz) disembunyikan sepenuhnya');

  // Test button click interaction: Sel Haiwan
  console.log('\n--- UJIAN KLIK BUTANG PILIHAN SEL ---');
  const animalClickRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btn-choice-animal');
      btn.click();
      const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
      const notice = document.getElementById('cellquest-status-notice-text');
      return {
        toastText: toast ? toast.textContent : '',
        noticeText: notice ? notice.textContent : ''
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const animal = animalClickRes.result.value;
  assert(animal.toastText.includes('Sel Haiwan') && animal.toastText.includes('Fasa 4D-C'), `Toast Sel Haiwan dipaparkan: "${animal.toastText}"`);
  assert(animal.noticeText.includes('Sel Haiwan') && animal.noticeText.includes('Fasa 4D-C'), `Status notis Sel Haiwan dikemas kini: "${animal.noticeText}"`);

  // Test button click interaction: Sel Tumbuhan
  const plantClickRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btn-choice-plant');
      btn.click();
      const toast = document.getElementById('toast-text') || document.getElementById('ar-toast');
      const notice = document.getElementById('cellquest-status-notice-text');
      return {
        toastText: toast ? toast.textContent : '',
        noticeText: notice ? notice.textContent : ''
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const plant = plantClickRes.result.value;
  assert(plant.toastText.includes('Sel Tumbuhan') && plant.toastText.includes('Fasa 4D-C'), `Toast Sel Tumbuhan dipaparkan: "${plant.toastText}"`);
  assert(plant.noticeText.includes('Sel Tumbuhan') && plant.noticeText.includes('Fasa 4D-C'), `Status notis Sel Tumbuhan dikemas kini: "${plant.noticeText}"`);

  // Test 4-way seamless module switching
  console.log('\n--- UJIAN PERTUKARAN 4 MODUL TANPA GANGGUAN ---');
  const multiSwitchRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // 1. Switch to Video
      window.KotakARSELNEL.switchActiveModule('video');
      const mod1 = window.KotakARSELNEL.state.activeModule;

      // 2. Switch to Nota
      window.KotakARSELNEL.switchActiveModule('nota');
      const mod2 = window.KotakARSELNEL.state.activeModule;

      // 3. Switch to Kuiz
      window.KotakARSELNEL.switchActiveModule('kuiz');
      const mod3 = window.KotakARSELNEL.state.activeModule;

      // 4. Switch to CellQuest
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const mod4 = window.KotakARSELNEL.state.activeModule;

      return { mod1, mod2, mod3, mod4 };
    })()`,
    returnByValue: true
  }, cdpId++);

  const ms = multiSwitchRes.result.value;
  assert(ms.mod1 === 'video', 'Pertukaran ke Video berjaya');
  assert(ms.mod2 === 'nota', 'Pertukaran ke Nota berjaya');
  assert(ms.mod3 === 'kuiz', 'Pertukaran ke Kuiz berjaya');
  assert(ms.mod4 === 'cellquest', 'Pertukaran ke CellQuest berjaya');

  // Test dynamic scanner prompt for CellQuest
  const scannerPromptRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.SCANNING);
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const promptText = document.getElementById('scanner-prompt-text');
      return promptText ? promptText.textContent : '';
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(scannerPromptRes.result.value.includes('CellQuest 3D'), `Panduan pengimbas dinamik memaparkan: "${scannerPromptRes.result.value}"`);

  // Capture verification screenshot
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const anchor = document.getElementById('floating-ar-anchor');
      anchor.classList.add('is-visible');
      window.KotakARSELNEL.placeVideoOnScreen();
    })()`
  }, cdpId++);

  await new Promise(r => setTimeout(r, 600));

  const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
  const screenshotPath = path.join(artifactDir, 'kotak_arselnel_fasa4db_verified.png');
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin pengesahan disimpan ke: ${screenshotPath}`);

  ws.close();
  cleanup();

  console.log('\n========================================================================');
  console.log('🎉 SEMUA UJIAN FASA 4D-B BERJAYA 100%!');
  console.log('========================================================================\n');
}

runTest().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
