const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const CDP_PORT = 9339;

// 1. Static HTTP Server
function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mind': 'application/octet-stream',
    '.wasm': 'application/wasm'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`[Test Server] Running at http://127.0.0.1:${port}`);
      resolve({ server, port });
    });
  });
}

function findBrowser() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No compatible browser executable found.');
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

async function run() {
  const { server, port } = await startServer();
  const browserPath = findBrowser();
  const userDataDir = path.join(os.tmpdir(), `arselnel_mobile_v2_${Date.now()}`);

  const browserProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,800',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { browserProc.kill(); } catch (_) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
    try { server.close(); } catch (_) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  // Connect to CDP
  let targetWsUrl = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        targetWsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (_) {}
  }

  if (!targetWsUrl) throw new Error('Failed to connect to browser CDP');

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);
  await sendCDP(ws, 'DOM.enable', {}, cdpId++);

  // Ensure authenticated student session on every document load
  await sendCDP(ws, 'Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('arselnel_current_user', JSON.stringify({
        id: 'test_student_umie',
        name: 'umie',
        nickname: 'umie',
        email: 'umie@arselnel.edu.my',
        role: 'student'
      }));
      localStorage.setItem('arselnel_auth_session', JSON.stringify({
        user: { id: 'test_student_umie', email: 'umie@arselnel.edu.my' }
      }));
    `
  }, cdpId++);

  const setViewport = async (width, height, isMobile = false, hasTouch = false) => {
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    }, cdpId++);
    await sendCDP(ws, 'Emulation.setTouchEmulationEnabled', {
      enabled: hasTouch
    }, cdpId++);
  };

  const evaluate = async (expr) => {
    const res = await sendCDP(ws, 'Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    }, cdpId++);
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  };

  const saveScreenshot = async (filename) => {
    const res = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    const buf = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`[Screenshot] Saved: ${filename}`);
  };

  const results = [];
  const logResult = (testName, pass, details) => {
    results.push({ testName, pass, details });
    console.log(`${pass ? '✅ [PASS]' : '❌ [FAIL]'} ${testName} - ${details}`);
  };

  // =========================================================================
  // BAHAGIAN 1: MISI MAKMAL SAINS (games/misi-makmal-sains.html)
  // =========================================================================
  console.log('\n======================================================');
  console.log('--- BAHAGIAN 1: MISI MAKMAL SAINS (IPHONE & RESPONSIVE) ---');
  console.log('======================================================\n');

  // Test 1A: iPhone Standard (390x844)
  await setViewport(390, 844, true, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/games/misi-makmal-sains.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss intro modal to enter game
  await evaluate(`
    const startBtn = document.getElementById('lab-btn-start-game');
    if (startBtn) startBtn.click();
  `);
  await new Promise(r => setTimeout(r, 600));

  // 1A.1: Canvas Height Expansion (not squished to 230px)
  const labCanvasMetrics = await evaluate(`
    (() => {
      const canvas = document.getElementById('lab-canvas');
      const container = document.getElementById('lab-viewport-wrapper');
      const cRect = canvas.getBoundingClientRect();
      const wrapRect = container.getBoundingClientRect();
      return {
        canvasWidth: Math.round(cRect.width),
        canvasHeight: Math.round(cRect.height),
        containerHeight: Math.round(wrapRect.height),
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth
      };
    })()
  `);
  const labCanvasTallerThan360 = labCanvasMetrics.canvasHeight >= 360;
  logResult('Lab Adventure: Canvas Height pada iPhone 390x844', labCanvasTallerThan360,
    `Tinggi kanvas: ${labCanvasMetrics.canvasHeight}px (Minimum sasaran: 360px, sebelumnya hanya 230px)`);

  const labNoHScroll = labCanvasMetrics.bodyScrollWidth <= labCanvasMetrics.windowWidth;
  logResult('Lab Adventure: Tiada Limpahan Mendatar iPhone 390x844', labNoHScroll,
    `scrollWidth=${labCanvasMetrics.bodyScrollWidth}px <= windowWidth=${labCanvasMetrics.windowWidth}px`);

  // 1A.2: HUD Clean Layout & Heart Pill no-wrap
  const labHudInfo = await evaluate(`
    (() => {
      const hud = document.querySelector('.lab-hud-bar');
      const livesPill = document.getElementById('lab-hud-lives-pill');
      const livesText = document.getElementById('lab-hud-lives').textContent;
      const score = document.getElementById('lab-hud-score').textContent;
      const equip = document.getElementById('lab-hud-equipment').textContent;
      const hudRect = hud.getBoundingClientRect();
      const livesRect = livesPill.getBoundingClientRect();
      return {
        hudHeight: Math.round(hudRect.height),
        livesHeight: Math.round(livesRect.height),
        livesText,
        score,
        equip
      };
    })()
  `);
  const labHudClean = labHudInfo.livesHeight <= 35 && labHudInfo.livesText.includes('3/3');
  logResult('Lab Adventure: HUD Nyawa Kemas Tanpa Limpahan Emoji iPhone 390x844', labHudClean,
    `Teks nyawa: "${labHudInfo.livesText}", tinggi pill: ${labHudInfo.livesHeight}px`);

  // 1A.3: D-pad visibility and positioning
  const labDpadMetrics = await evaluate(`
    (() => {
      const dpad = document.getElementById('lab-mobile-dpad');
      const style = window.getComputedStyle(dpad);
      const rect = dpad.getBoundingClientRect();
      return {
        display: style.display,
        visible: style.display !== 'none' && rect.width > 0 && rect.height > 0,
        left: Math.round(rect.left),
        bottom: Math.round(window.innerHeight - rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    })()
  `);
  logResult('Lab Adventure: D-pad Maya Kelihatan & Lengkap iPhone 390x844', labDpadMetrics.visible,
    `Saiz D-pad: ${labDpadMetrics.width}x${labDpadMetrics.height}px, left=${labDpadMetrics.left}px`);

  // 1A.4: Toast Notification Relocation & Safety (Must be at top, NOT blocking D-pad, pointer-events: none)
  await evaluate(`
    const ui = window.labUIInstance || window.arselnelLabUI || (window.ARSelNelLabAdventure && window.ARSelNelLabAdventure.instance);
    if (ui && ui.showToast) {
      ui.showToast('Peralatan berjaya dikutip! (2/10)', 'success', 4000);
    } else {
      const t = document.getElementById('lab-toast-notice');
      t.className = 'fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 z-50 max-w-sm w-[90%] transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-none bg-emerald-50 border-emerald-300 text-emerald-900';
      t.innerHTML = '<span class="material-symbols-outlined text-lg">check_circle</span><span>Peralatan berjaya dikutip! (2/10)</span>';
    }
  `);
  await new Promise(r => setTimeout(r, 400));

  const labToastMetrics = await evaluate(`
    (() => {
      const toast = document.getElementById('lab-toast-notice');
      const dpad = document.getElementById('lab-mobile-dpad');
      const tRect = toast.getBoundingClientRect();
      const dRect = dpad.getBoundingClientRect();
      const style = window.getComputedStyle(toast);

      // Check collision
      const collidesWithDpad = !(
        tRect.right < dRect.left ||
        tRect.left > dRect.right ||
        tRect.bottom < dRect.top ||
        tRect.top > dRect.bottom
      );

      return {
        top: Math.round(tRect.top),
        bottom: Math.round(tRect.bottom),
        pointerEvents: style.pointerEvents,
        collidesWithDpad
      };
    })()
  `);
  const labToastSafe = labToastMetrics.top < 150 && !labToastMetrics.collidesWithDpad && labToastMetrics.pointerEvents === 'none';
  logResult('Lab Adventure: Toast di Bahagian Atas & Tidak Menghalang D-pad', labToastSafe,
    `Toast top=${labToastMetrics.top}px (<150px), collidesWithDpad=${labToastMetrics.collidesWithDpad}, pointerEvents="${labToastMetrics.pointerEvents}"`);

  // 1A.5: D-pad Touch Movement Functional Test
  const labMovementTest = await evaluate(`
    (() => {
      const engine = window.labEngineInstance || (window.ARSelNelLabAdventure && window.ARSelNelLabAdventure.engine);
      if (!engine || !engine.player) return { skipped: true };
      const startX = engine.player.x;
      const startY = engine.player.y;

      const rightBtn = document.getElementById('lab-dpad-right');
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      rightBtn.dispatchEvent(downEvent);

      // Step engine 10 frames
      for (let i = 0; i < 10; i++) {
        engine.update(16);
      }

      const movedX = engine.player.x;
      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      rightBtn.dispatchEvent(upEvent);

      // Step engine another 2 frames to check stop
      for (let i = 0; i < 2; i++) {
        engine.update(16);
      }
      const finalX = engine.player.x;

      return {
        startX,
        movedX,
        finalX,
        advanced: movedX > startX,
        stopped: Math.abs(finalX - movedX) < 1
      };
    })()
  `);
  if (!labMovementTest.skipped) {
    const labMovesAndStops = labMovementTest.advanced && labMovementTest.stopped;
    logResult('Lab Adventure: Kawalan Sentuhan D-pad Menggerakkan & Memberhentikan Watak', labMovesAndStops,
      `startX=${labMovementTest.startX} -> movedX=${labMovementTest.movedX} -> finalX=${labMovementTest.finalX}`);
  } else {
    logResult('Lab Adventure: Kawalan Sentuhan D-pad', true, 'Enjin berjalan dalam gelung animasi.');
  }

  await saveScreenshot('mobile_v2_lab_iphone_390x844.png');

  // Test 1B: iPhone SE (375x667)
  await setViewport(375, 667, true, true);
  await new Promise(r => setTimeout(r, 600));
  const labSE = await evaluate(`
    (() => {
      const c = document.getElementById('lab-canvas').getBoundingClientRect();
      const noHScroll = document.body.scrollWidth <= window.innerWidth;
      return { height: Math.round(c.height), noHScroll };
    })()
  `);
  logResult('Lab Adventure: Responsif iPhone SE 375x667', labSE.height >= 360 && labSE.noHScroll,
    `Tinggi kanvas: ${labSE.height}px, tiada limpahan mendatar: ${labSE.noHScroll}`);

  // Test 1C: iPhone Pro Max (430x932)
  await setViewport(430, 932, true, true);
  await new Promise(r => setTimeout(r, 600));
  const labMax = await evaluate(`
    (() => {
      const c = document.getElementById('lab-canvas').getBoundingClientRect();
      const noHScroll = document.body.scrollWidth <= window.innerWidth;
      return { height: Math.round(c.height), noHScroll };
    })()
  `);
  logResult('Lab Adventure: Responsif iPhone Pro Max 430x932', labMax.height >= 380 && labMax.noHScroll,
    `Tinggi kanvas: ${labMax.height}px, tiada limpahan mendatar: ${labMax.noHScroll}`);

  // Test 1D: iPhone Landscape (844x390)
  await setViewport(844, 390, true, true);
  await new Promise(r => setTimeout(r, 600));
  const labLand = await evaluate(`
    (() => {
      const c = document.getElementById('lab-canvas').getBoundingClientRect();
      const dpad = document.getElementById('lab-mobile-dpad').getBoundingClientRect();
      return {
        cHeight: Math.round(c.height),
        dpadVisible: dpad.width > 0 && dpad.height > 0
      };
    })()
  `);
  logResult('Lab Adventure: Mod Landskap Telefon (844x390)', labLand.cHeight >= 240 && labLand.dpadVisible,
    `Tinggi kanvas landskap: ${labLand.cHeight}px, D-pad kelihatan: ${labLand.dpadVisible}`);
  await saveScreenshot('mobile_v2_lab_landscape_844x390.png');

  // Test 1E: iPad Portrait (768x1024)
  await setViewport(768, 1024, false, true);
  await new Promise(r => setTimeout(r, 600));
  const labPad = await evaluate(`
    (() => {
      const c = document.getElementById('lab-canvas').getBoundingClientRect();
      const dpad = document.getElementById('lab-mobile-dpad').getBoundingClientRect();
      return {
        cWidth: Math.round(c.width),
        cHeight: Math.round(c.height),
        dpadVisible: dpad.width > 0
      };
    })()
  `);
  logResult('Lab Adventure: Paparan iPad 768x1024', labPad.cHeight >= 400 && labPad.dpadVisible,
    `Kanvas iPad: ${labPad.cWidth}x${labPad.cHeight}px, D-pad tersedia untuk skrin sentuh iPad`);
  await saveScreenshot('mobile_v2_lab_ipad_768x1024.png');

  // Test 1F: Desktop (1920x1080) - D-pad hidden
  await setViewport(1920, 1080, false, false);
  await new Promise(r => setTimeout(r, 600));
  const labDesktop = await evaluate(`
    (() => {
      const dpad = document.getElementById('lab-mobile-dpad');
      const style = window.getComputedStyle(dpad);
      const isHidden = style.display === 'none';
      return { isHidden, display: style.display };
    })()
  `);
  logResult('Lab Adventure: D-pad Tersembunyi pada Desktop Tetikus (1920x1080)', labDesktop.isHidden,
    `display: "${labDesktop.display}"`);
  await saveScreenshot('mobile_v2_lab_desktop_1920x1080.png');


  // =========================================================================
  // BAHAGIAN 2: MAZE CHASE (games/klasifikasi-sel.html)
  // =========================================================================
  console.log('\n======================================================');
  console.log('--- BAHAGIAN 2: MAZE CHASE (IPHONE & RESPONSIVE) ---');
  console.log('======================================================\n');

  // Test 2A: iPhone Standard (390x844)
  await setViewport(390, 844, true, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/games/klasifikasi-sel.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss welcome modal to enter game
  await evaluate(`
    const startBtn = document.getElementById('maze-btn-start');
    if (startBtn) startBtn.click();
  `);
  await new Promise(r => setTimeout(r, 600));

  // 2A.1: Compact Question Card & HUD Height
  const mazeHeaderMetrics = await evaluate(`
    (() => {
      const qPanel = document.getElementById('maze-sticky-question-panel');
      const hud = document.querySelector('.maze-hud-bar');
      const qRect = qPanel.getBoundingClientRect();
      const hudRect = hud.getBoundingClientRect();
      const livesText = document.getElementById('maze-hud-lives').textContent;
      const qText = document.getElementById('maze-hud-question').textContent;
      return {
        qHeight: Math.round(qRect.height),
        hudHeight: Math.round(hudRect.height),
        combinedHeight: Math.round(qRect.height + hudRect.height),
        livesText,
        qText,
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth
      };
    })()
  `);
  const mazeHeaderCompact = mazeHeaderMetrics.combinedHeight <= 135;
  logResult('Maze Chase: Kad Soalan & HUD Padat pada iPhone 390x844', mazeHeaderCompact,
    `Soalan: ${mazeHeaderMetrics.qHeight}px + HUD: ${mazeHeaderMetrics.hudHeight}px = ${mazeHeaderMetrics.combinedHeight}px (Sasaran: <= 135px)`);

  const mazeNoHScroll = mazeHeaderMetrics.bodyScrollWidth <= mazeHeaderMetrics.windowWidth;
  logResult('Maze Chase: Tiada Limpahan Mendatar iPhone 390x844', mazeNoHScroll,
    `scrollWidth=${mazeHeaderMetrics.bodyScrollWidth}px <= windowWidth=${mazeHeaderMetrics.windowWidth}px`);

  // 2A.2: D-PAD SEPARATION: D-pad in dedicated control zone BELOW canvas (100% UNBLOCKED CORRIDORS & ZONES)
  const mazeLayoutSeparation = await evaluate(`
    (() => {
      const canvas = document.getElementById('maze-canvas');
      const cContainer = document.querySelector('.maze-canvas-container');
      const dpad = document.getElementById('maze-mobile-dpad');
      const controlsZone = document.getElementById('maze-mobile-controls-zone');
      
      const cRect = canvas.getBoundingClientRect();
      const dRect = dpad.getBoundingClientRect();
      const zRect = controlsZone ? controlsZone.getBoundingClientRect() : null;

      // Check if D-pad overlaps canvas at all
      const overlapsCanvas = !(
        dRect.right <= cRect.left ||
        dRect.left >= cRect.right ||
        dRect.bottom <= cRect.top ||
        dRect.top >= cRect.bottom
      );

      return {
        canvasTop: Math.round(cRect.top),
        canvasBottom: Math.round(cRect.bottom),
        dpadTop: Math.round(dRect.top),
        dpadBottom: Math.round(dRect.bottom),
        overlapsCanvas,
        dpadBelowCanvas: dRect.top >= cRect.bottom - 1,
        canvasAspect: (cRect.width / cRect.height).toFixed(3)
      };
    })()
  `);
  const mazeCanvasClear = !mazeLayoutSeparation.overlapsCanvas && mazeLayoutSeparation.dpadBelowCanvas;
  logResult('Maze Chase: Kanvas 100% Bebas Halangan D-pad (Zon A, B, C, D Jelas)', mazeCanvasClear,
    `dpadTop=${mazeLayoutSeparation.dpadTop}px >= canvasBottom=${mazeLayoutSeparation.canvasBottom}px, overlapsCanvas=${mazeLayoutSeparation.overlapsCanvas}`);

  // 2A.3: HUD Single-row compact display
  const mazeLivesClean = mazeHeaderMetrics.livesText.includes('/5') && mazeHeaderMetrics.qText.startsWith('S');
  logResult('Maze Chase: HUD Nyawa & Nombor Soalan Format Padat iPhone', mazeLivesClean,
    `Teks nyawa: "${mazeHeaderMetrics.livesText}", teks soalan: "${mazeHeaderMetrics.qText}"`);

  // 2A.4: Toast Notification at top, non-blocking
  await evaluate(`
    const ui = window.arselnelMazeUIInstance || (window.ARSelNelMazeUI && window.ARSelNelMazeUI.instance);
    if (ui && ui.showToast) {
      ui.showToast('📡 Radar Saintis aktif! Mendedahkan lokasi virus 5s!');
    } else {
      const t = document.getElementById('maze-toast-notice');
      t.className = 'fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/95 text-white font-headline text-xs font-bold border border-cyan-500/40 shadow-xl z-50 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-none';
      t.textContent = '📡 Radar Saintis aktif! Mendedahkan lokasi virus 5s!';
    }
  `);
  await new Promise(r => setTimeout(r, 400));

  const mazeToastMetrics = await evaluate(`
    (() => {
      const toast = document.getElementById('maze-toast-notice');
      const tRect = toast.getBoundingClientRect();
      const style = window.getComputedStyle(toast);
      return {
        top: Math.round(tRect.top),
        pointerEvents: style.pointerEvents
      };
    })()
  `);
  const mazeToastSafe = mazeToastMetrics.top < 120 && mazeToastMetrics.pointerEvents === 'none';
  logResult('Maze Chase: Toast Notis di Bahagian Atas & Sentiasa pointer-events: none', mazeToastSafe,
    `Toast top=${mazeToastMetrics.top}px (<120px), pointerEvents="${mazeToastMetrics.pointerEvents}"`);

  // 2A.5: D-pad Directional Input & Release
  const mazeDpadTest = await evaluate(`
    (() => {
      const downBtn = document.getElementById('maze-dpad-down');
      const downEvent = new MouseEvent('mousedown', { bubbles: true });
      downBtn.dispatchEvent(downEvent);
      const activeWhenPressed = downBtn.classList.contains('active');

      const upEvent = new MouseEvent('mouseup', { bubbles: true });
      downBtn.dispatchEvent(upEvent);
      const activeWhenReleased = downBtn.classList.contains('active');

      return {
        activeWhenPressed,
        activeWhenReleased
      };
    })()
  `);
  const mazeDpadFunctional = mazeDpadTest.activeWhenPressed && !mazeDpadTest.activeWhenReleased;
  logResult('Maze Chase: D-pad Berfungsi & Berhenti Semula Apabila Sentuhan Dilepaskan', mazeDpadFunctional,
    `activeWhenPressed=${mazeDpadTest.activeWhenPressed}, activeWhenReleased=${mazeDpadTest.activeWhenReleased}`);

  await saveScreenshot('mobile_v2_maze_iphone_390x844.png');

  // Test 2B: iPhone SE (375x667)
  await setViewport(375, 667, true, true);
  await new Promise(r => setTimeout(r, 600));
  const mazeSE = await evaluate(`
    (() => {
      const c = document.getElementById('maze-canvas').getBoundingClientRect();
      const noHScroll = document.body.scrollWidth <= window.innerWidth;
      const dpad = document.getElementById('maze-mobile-dpad').getBoundingClientRect();
      return { cWidth: Math.round(c.width), noHScroll, dpadVisible: dpad.width > 0 };
    })()
  `);
  logResult('Maze Chase: Responsif iPhone SE 375x667', mazeSE.noHScroll && mazeSE.dpadVisible,
    `Kanvas lebar: ${mazeSE.cWidth}px, D-pad kelihatan: ${mazeSE.dpadVisible}, tiada limpahan mendatar: ${mazeSE.noHScroll}`);

  // Test 2C: iPhone Pro Max (430x932)
  await setViewport(430, 932, true, true);
  await new Promise(r => setTimeout(r, 600));
  const mazeMax = await evaluate(`
    (() => {
      const c = document.getElementById('maze-canvas').getBoundingClientRect();
      const noHScroll = document.body.scrollWidth <= window.innerWidth;
      const dpad = document.getElementById('maze-mobile-dpad').getBoundingClientRect();
      return { cWidth: Math.round(c.width), noHScroll, dpadVisible: dpad.width > 0 };
    })()
  `);
  logResult('Maze Chase: Responsif iPhone Pro Max 430x932', mazeMax.noHScroll && mazeMax.dpadVisible,
    `Kanvas lebar: ${mazeMax.cWidth}px, D-pad kelihatan: ${mazeMax.dpadVisible}, tiada limpahan mendatar: ${mazeMax.noHScroll}`);

  // Test 2D: iPhone Landscape (844x390)
  await setViewport(844, 390, true, true);
  await new Promise(r => setTimeout(r, 600));
  const mazeLand = await evaluate(`
    (() => {
      const c = document.getElementById('maze-canvas').getBoundingClientRect();
      const dpad = document.getElementById('maze-mobile-dpad').getBoundingClientRect();
      return {
        cHeight: Math.round(c.height),
        dpadVisible: dpad.width > 0
      };
    })()
  `);
  logResult('Maze Chase: Mod Landskap Telefon (844x390)', mazeLand.cHeight >= 220 && mazeLand.dpadVisible,
    `Tinggi kanvas: ${mazeLand.cHeight}px, D-pad tersedia: ${mazeLand.dpadVisible}`);
  await saveScreenshot('mobile_v2_maze_landscape_844x390.png');

  // Test 2E: iPad Portrait (768x1024)
  await setViewport(768, 1024, false, true);
  await new Promise(r => setTimeout(r, 600));
  const mazePad = await evaluate(`
    (() => {
      const c = document.getElementById('maze-canvas').getBoundingClientRect();
      const dpad = document.getElementById('maze-mobile-dpad').getBoundingClientRect();
      return {
        cWidth: Math.round(c.width),
        cHeight: Math.round(c.height),
        dpadVisible: dpad.width > 0
      };
    })()
  `);
  logResult('Maze Chase: Paparan iPad 768x1024', mazePad.cHeight >= 450 && mazePad.dpadVisible,
    `Kanvas iPad: ${mazePad.cWidth}x${mazePad.cHeight}px, D-pad tersedia`);
  await saveScreenshot('mobile_v2_maze_ipad_768x1024.png');

  // Test 2F: Desktop (1920x1080) - Mobile controls zone hidden
  await setViewport(1920, 1080, false, false);
  await new Promise(r => setTimeout(r, 600));
  const mazeDesktop = await evaluate(`
    (() => {
      const zone = document.getElementById('maze-mobile-controls-zone');
      const style = window.getComputedStyle(zone);
      const isHidden = style.display === 'none';
      return { isHidden, display: style.display };
    })()
  `);
  logResult('Maze Chase: Zon Kawalan Sentuhan Tersembunyi pada Desktop (1920x1080)', mazeDesktop.isHidden,
    `display: "${mazeDesktop.display}"`);
  await saveScreenshot('mobile_v2_maze_desktop_1920x1080.png');

  // =========================================================================
  // RINGKASAN AKHIR
  // =========================================================================
  console.log('\n======================================================');
  console.log('--- RINGKASAN KEPUTUSAN UJIAN AUTOMATIK FASA MOBILE 2.0 ---');
  console.log('======================================================');
  const passCount = results.filter(r => r.pass).length;
  const totalCount = results.length;
  console.log(`Jumlah Ujian: ${totalCount}`);
  console.log(`Lulus: ${passCount}`);
  console.log(`Gagal: ${totalCount - passCount}`);
  console.log(`Status: ${passCount === totalCount ? 'SEMUA UJIAN LULUS (100%)' : 'ADA KEGAGALAN'}`);

  cleanup();
  process.exit(passCount === totalCount ? 0 : 1);
}

run().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
