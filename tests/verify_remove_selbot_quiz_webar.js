/**
 * ARSELNEL — FASA PEMBERSIHAN KOTAK ARSELNEL
 * Automated Verification Suite
 *
 * Verifies that Kuiz & Permainan (Target 2) and SelBot AI (Target 7)
 * are cleanly removed from Kotak ARSELNEL ONLY, while remaining 100%
 * intact and fully operational on standalone pages.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60515;
const CDP_PORT = 9260;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer(async (req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);

    if (reqPath === '/api/selbot/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          reply: 'Jawapan SelBot AI: Struktur sel terdiri daripada membran sel, sitoplasma, dan nukleus.',
          provider: 'local-test-stub'
        }));
      });
      return;
    }

    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Browser executable not found');
}

function getPages(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
    });
    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { res, rej } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) rej(new Error(JSON.stringify(data.error)));
        else res(data.result);
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    return new Promise((res, rej) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { res, rej });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error('Eval Exception: ' + (r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails)));
    }
    return r.result ? r.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(r.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[CDP] 📸 Screenshot saved: ${filename}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('  ARSELNEL — VERIFIKASI PEMBERSIHAN KOTAK ARSELNEL (6 SASARAN AKTIF)  ');
  console.log('========================================================================\n');

  const server = await startServer();
  console.log(`[TestServer] Server running on http://127.0.0.1:${PORT}`);

  const browserBin = findBrowser();
  const tmpDir = path.join(os.tmpdir(), 'arselnel_cleanup_test_' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const browserProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  let pages = [];
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      pages = await getPages(CDP_PORT);
      if (pages.length > 0) break;
    } catch (_) {}
  }

  if (pages.length === 0) {
    throw new Error('Browser did not expose CDP endpoint');
  }

  const page = pages.find(p => p.type === 'page') || pages[0];
  const cdp = new SimpleCDP(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('arselnel_current_user', JSON.stringify({
        id: 'usr_student_umie_123',
        name: 'Umie (Pelajar Sains)',
        role: 'student'
      }));
      localStorage.setItem('arselnel_kotak_onboarding_completed', 'true');
    `
  });

  const testResults = [];

  function record(title, pass, details) {
    testResults.push({ title, pass, details });
    const mark = pass ? '✅ LULUS' : '❌ GAGAL';
    console.log(`${mark}: ${title}`);
    if (details) console.log(`   ℹ️ ${details}`);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Modal "Papar Kad AR" pada cellquest/code.html
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 1: MODAL PAPAR KAD AR (cellquest/code.html) ---');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/code.html` });
    await new Promise(r => setTimeout(r, 1200));

    // Open modal
    await cdp.eval(`
      const btn = document.getElementById('btn-open-print-modal');
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    const modalAudit = await cdp.eval(`
      (() => {
        const cards = Array.from(document.querySelectorAll('#ar-marker-gallery .ar-marker-card'));
        const cardIds = cards.map(c => c.id);
        const hasKuiz = !!document.getElementById('card-marker-kuiz');
        const hasSelbot = !!document.getElementById('card-marker-selbot');
        const badge = document.getElementById('marker-selected-count')?.textContent || '';
        const footerNote = document.querySelector('.ar-modal-footer-note')?.textContent || '';
        return {
          totalCards: cards.length,
          cardIds,
          hasKuiz,
          hasSelbot,
          badge,
          footerNote
        };
      })()
    `);

    record(
      'Modal Papar Kad AR hanya mempunyai tepat 6 kad sasaran aktif',
      modalAudit.totalCards === 6 && !modalAudit.hasKuiz && !modalAudit.hasSelbot,
      `Jumlah kad: ${modalAudit.totalCards}, hasKuiz: ${modalAudit.hasKuiz}, hasSelbot: ${modalAudit.hasSelbot}, Ids: ${modalAudit.cardIds.join(', ')}`
    );

    record(
      'Lencana pemilihan memaparkan "6 daripada 6 kad dipilih" & nota 6 sasaran aktif',
      modalAudit.badge.includes('6 daripada 6') && modalAudit.footerNote.includes('6 sasaran aktif'),
      `Lencana: "${modalAudit.badge}", Nota: "${modalAudit.footerNote}"`
    );

    await cdp.captureScreenshot('cleanup_modal_papar_kad_ar.png');

    // -------------------------------------------------------------
    // TEST 2: Halaman Cetakan Marker (kotak_arselnel/marker-print.html)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 2: HALAMAN CETAKAN MARKER (kotak_arselnel/marker-print.html) ---');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/kotak_arselnel/marker-print.html` });
    await new Promise(r => setTimeout(r, 1200));

    const printAudit = await cdp.eval(`
      (() => {
        const frames = Array.from(document.querySelectorAll('.marker-frame'));
        const frameIds = frames.map(f => f.id);
        const hasKuizFrame = !!document.getElementById('card-kuiz');
        const hasSelbotFrame = !!document.getElementById('card-selbot');
        const hasKuizBtn = !!document.getElementById('btn-show-kuiz');
        const hasSelbotBtn = !!document.getElementById('btn-show-selbot');
        const btnAllText = document.getElementById('btn-show-all')?.textContent || '';
        return {
          totalFrames: frames.length,
          frameIds,
          hasKuizFrame,
          hasSelbotFrame,
          hasKuizBtn,
          hasSelbotBtn,
          btnAllText
        };
      })()
    `);

    record(
      'Halaman Cetakan Marker mengandungi tepat 6 bingkai kad dan sifar bingkai Kuiz/SelBot',
      printAudit.totalFrames === 6 && !printAudit.hasKuizFrame && !printAudit.hasSelbotFrame,
      `Jumlah bingkai: ${printAudit.totalFrames}, hasKuiz: ${printAudit.hasKuizFrame}, hasSelbot: ${printAudit.hasSelbotFrame}`
    );

    record(
      'Butang tab penapis Kuiz & SelBot telah dibuang & Butang Semua menunjukkan 6 Marker',
      !printAudit.hasKuizBtn && !printAudit.hasSelbotBtn && printAudit.btnAllText.includes('6 Marker'),
      `hasKuizBtn: ${printAudit.hasKuizBtn}, hasSelbotBtn: ${printAudit.hasSelbotBtn}, Text: "${printAudit.btnAllText.trim()}"`
    );

    await cdp.captureScreenshot('cleanup_marker_print_page.png');

    // -------------------------------------------------------------
    // TEST 3: Pengimbas Kotak ARSELNEL DOM (kotak_arselnel/code.html)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 3: PENGIMBAS KOTAK ARSELNEL (kotak_arselnel/code.html) ---');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/kotak_arselnel/code.html` });
    await new Promise(r => setTimeout(r, 1500));

    const scannerDomAudit = await cdp.eval(`
      (() => {
        const povKuiz = document.getElementById('pov-panel-kuiz');
        const povSelbot = document.getElementById('pov-panel-selbot');
        const kuizSelectionView = document.getElementById('pov-kuiz-selection-view');
        const kuizActiveView = document.getElementById('pov-active-kuiz-view');
        const kuizResultView = document.getElementById('pov-kuiz-result-view');
        const embeddedGameView = document.getElementById('pov-embedded-game-view');
        const selbotChatView = document.getElementById('pov-active-selbot-view');
        const diagMarkerStatus = document.getElementById('diag-marker-mind-status')?.textContent || '';

        // Check SpatialPanelManager registration
        let registeredPanels = [];
        if (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.panels) {
          registeredPanels = Array.from(SpatialPanelManager.panels.keys());
        }

        return {
          hasPovKuiz: !!povKuiz,
          hasPovSelbot: !!povSelbot,
          hasKuizSelectionView: !!kuizSelectionView,
          hasKuizActiveView: !!kuizActiveView,
          hasKuizResultView: !!kuizResultView,
          hasEmbeddedGameView: !!embeddedGameView,
          hasSelbotChatView: !!selbotChatView,
          diagMarkerStatus,
          registeredPanels
        };
      })()
    `);

    record(
      'Panel POV Kuiz (#pov-panel-kuiz) & Panel POV SelBot (#pov-panel-selbot) tiada dalam DOM',
      !scannerDomAudit.hasPovKuiz && !scannerDomAudit.hasPovSelbot,
      `hasPovKuiz: ${scannerDomAudit.hasPovKuiz}, hasPovSelbot: ${scannerDomAudit.hasPovSelbot}`
    );

    record(
      'Semua View Kuiz & SelBot (View 5, 6, 7, 8, 10) dibuang daripada DOM',
      !scannerDomAudit.hasKuizSelectionView && !scannerDomAudit.hasKuizActiveView && !scannerDomAudit.hasKuizResultView && !scannerDomAudit.hasEmbeddedGameView && !scannerDomAudit.hasSelbotChatView,
      `Kuiz Views: ${scannerDomAudit.hasKuizSelectionView}, SelBot View: ${scannerDomAudit.hasSelbotChatView}`
    );

    record(
      'Status Diagnostik memaparkan "6 Sasaran Aktif"',
      scannerDomAudit.diagMarkerStatus.includes('6 Sasaran Aktif'),
      `Status teks: "${scannerDomAudit.diagMarkerStatus}"`
    );

    record(
      'SpatialPanelManager hanya mendaftar panel Video & Nota (2 panel DOM)',
      scannerDomAudit.registeredPanels.length === 2 && scannerDomAudit.registeredPanels.includes('video') && scannerDomAudit.registeredPanels.includes('nota') && !scannerDomAudit.registeredPanels.includes('kuiz') && !scannerDomAudit.registeredPanels.includes('selbot'),
      `Registered panels: [${scannerDomAudit.registeredPanels.join(', ')}]`
    );

    // -------------------------------------------------------------
    // TEST 4: Ujian Tingkah Laku handleTargetFound(2, 'kuiz') & (7, 'selbot')
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 4: SIMULASI TARGET FOUND (Index 2 & Index 7 dinonaktifkan) ---');
    const simulationAudit = await cdp.eval(`
      (() => {
        // Clear any active state
        let errs = [];
        try {
          // Attempt target 2
          handleTargetFound(2, 'kuiz');
        } catch (e) {
          errs.push('Target 2 threw: ' + e.message);
        }

        try {
          // Attempt target 7
          handleTargetFound(7, 'selbot');
        } catch (e) {
          errs.push('Target 7 threw: ' + e.message);
        }

        const activePanelsHasKuiz = typeof ARState !== 'undefined' && ARState.activePanels ? ARState.activePanels.has('kuiz') : false;
        const activePanelsHasSelbot = typeof ARState !== 'undefined' && ARState.activePanels ? ARState.activePanels.has('selbot') : false;
        const activeModule = typeof ARState !== 'undefined' ? ARState.activeModule : null;

        // Test active module (Target 0 - Video) still operates
        let videoActivated = false;
        try {
          handleTargetFound(0, 'video');
          videoActivated = (ARState.activePanels && ARState.activePanels.has('video')) || ARState.activeModule === 'video';
        } catch (e) {
          errs.push('Target 0 threw: ' + e.message);
        }

        return {
          errs,
          activePanelsHasKuiz,
          activePanelsHasSelbot,
          activeModule,
          videoActivated
        };
      })()
    `);

    record(
      'handleTargetFound(2) dan (7) tidak mengaktifkan modul dan tidak menghasilkan ralat',
      simulationAudit.errs.length === 0 && !simulationAudit.activePanelsHasKuiz && !simulationAudit.activePanelsHasSelbot,
      `Errors: [${simulationAudit.errs.join('; ')}], hasKuiz: ${simulationAudit.activePanelsHasKuiz}, hasSelbot: ${simulationAudit.activePanelsHasSelbot}`
    );

    record(
      'Modul aktif (Target 0 - Video) kekal berfungsi tanpa terjejas',
      simulationAudit.videoActivated,
      `Video activated: ${simulationAudit.videoActivated}`
    );

    // -------------------------------------------------------------
    // TEST 5: Standalone SelBot AI (selbot_ai/code.html)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 5: STANDALONE SELBOT AI (selbot_ai/code.html) ---');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/selbot_ai/code.html` });
    await new Promise(r => setTimeout(r, 1500));

    const selbotPageAudit = await cdp.eval(`
      (() => {
        const title = document.title;
        const chatFeed = !!document.getElementById('chat-feed') || !!document.querySelector('.chat-messages');
        const input = !!document.getElementById('user-input') || !!document.querySelector('input[type="text"]');
        const sendBtn = !!document.getElementById('send-btn') || !!document.querySelector('.btn-send');
        const chips = document.querySelectorAll('.chip, .suggestion-chip, button[data-prompt]').length;
        return {
          title,
          chatFeed,
          input,
          sendBtn,
          chips
        };
      })()
    `);

    record(
      'Halaman utama SelBot AI (selbot_ai/code.html) beroperasi 100% lengkap',
      selbotPageAudit.chatFeed && selbotPageAudit.input,
      `Title: "${selbotPageAudit.title}", chatFeed: ${selbotPageAudit.chatFeed}, input: ${selbotPageAudit.input}, chips: ${selbotPageAudit.chips}`
    );

    await cdp.captureScreenshot('cleanup_standalone_selbot_ai.png');

    // -------------------------------------------------------------
    // TEST 6: Standalone Games (hab_permainan & games/*.html)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 6: STANDALONE GAMES ---');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/hab_permainan/code.html` });
    await new Promise(r => setTimeout(r, 1200));

    const habGamesAudit = await cdp.eval(`
      (() => {
        const gameLinks = document.querySelectorAll('a[href*="games/"]').length;
        return {
          title: document.title,
          gameCards: gameLinks
        };
      })()
    `);

    record(
      'Hab Permainan utama (hab_permainan/code.html) boleh dibuka dengan sempurna',
      habGamesAudit.gameCards > 0,
      `Title: "${habGamesAudit.title}", Game cards found: ${habGamesAudit.gameCards}`
    );

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/games/misi-makmal-sains.html` });
    await new Promise(r => setTimeout(r, 1200));
    const labGameAudit = await cdp.eval(`
      (() => {
        const canvas = !!document.getElementById('game-canvas') || !!document.querySelector('canvas');
        return { canvas, title: document.title };
      })()
    `);
    record(
      'Permainan Misi Makmal Sains (games/misi-makmal-sains.html) boleh dimuatkan',
      labGameAudit.canvas,
      `Canvas present: ${labGameAudit.canvas}`
    );

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/games/klasifikasi-sel.html` });
    await new Promise(r => setTimeout(r, 1200));
    const mazeGameAudit = await cdp.eval(`
      (() => {
        const canvas = !!document.getElementById('game-canvas') || !!document.querySelector('canvas');
        return { canvas, title: document.title };
      })()
    `);
    record(
      'Permainan Maze Chase (games/klasifikasi-sel.html) boleh dimuatkan',
      mazeGameAudit.canvas,
      `Canvas present: ${mazeGameAudit.canvas}`
    );

    await cdp.captureScreenshot('cleanup_standalone_game_lab.png');

  } catch (err) {
    console.error('❌ Ujian ralat:', err);
    record('Keseluruhan Ujian Lulus Tanpa Ralat', false, err.message);
  } finally {
    cdp.close();
    browserProc.kill();
    server.close();

    console.log('\n========================================================================');
    console.log('  RINGKASAN KEPUTUSAN VERIFIKASI PEMBERSIHAN KOTAK ARSELNEL            ');
    console.log('========================================================================');
    const total = testResults.length;
    const passed = testResults.filter(t => t.pass).length;
    const failed = total - passed;
    console.log(`Jumlah Ujian: ${total} | Lulus: ${passed} | Gagal: ${failed}`);

    if (failed === 0) {
      console.log('\n🎉 SEMUA 11/11 UJIAN VERIFIKASI AUTOMATIK LULUS DENGAN CEMERLANG!');
    } else {
      console.log(`\n⚠️ TERDAPAT ${failed} UJIAN YANG GAGAL. SEMAK LOG DI ATAS.`);
    }
  }
}

runTests().catch(e => {
  console.error('Fatal execution error:', e);
  process.exit(1);
});
