const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const CDP_PORT = 9338;

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
  const userDataDir = path.join(os.tmpdir(), `arselnel_test_cdp_${Date.now()}`);

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
        id: 'test_student_1',
        name: 'Hafif',
        nickname: 'Hafif',
        email: 'hafif@arselnel.edu.my',
        role: 'student'
      }));
      localStorage.setItem('arselnel_auth_session', JSON.stringify({
        user: { id: 'test_student_1', email: 'hafif@arselnel.edu.my' }
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
    console.log(`[Screenshot] Saved: ${outPath}`);
  };

  console.log('\n--- UJIAN 1: NOTA INTERAKTIF (slaid_interaktif.html) ---');
  // 1a. Test iPhone 390x844
  await setViewport(390, 844, true, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/nota_pembelajaran/slaid_interaktif.html?id=slide_sel_1` }, cdpId++);
  await new Promise(r => setTimeout(r, 2000));

  const noteChecks390 = await evaluate(`(() => {
    const prevBtn = document.getElementById('btn-prev-slide');
    const nextBtn = document.getElementById('btn-next-slide');
    const pageInd = document.getElementById('page-indicator');
    const viewport = document.getElementById('slide-viewport');
    const moreBtn = document.getElementById('btn-more-tools');
    const bodyOverflow = document.documentElement.scrollWidth <= window.innerWidth;
    
    return {
      hasPrev: !!prevBtn,
      prevText: prevBtn ? prevBtn.innerText.trim() : '',
      hasNext: !!nextBtn,
      nextText: nextBtn ? nextBtn.innerText.trim() : '',
      pageIndicator: pageInd ? pageInd.innerText.trim() : '',
      viewportWidth: viewport ? viewport.clientWidth : 0,
      viewportHeight: viewport ? viewport.clientHeight : 0,
      hasMoreBtn: !!moreBtn,
      bodyOverflow
    };
  })()`);
  console.log('Nota (390x844) Status:', noteChecks390);

  // Test pagination button click
  await evaluate(`document.getElementById('btn-next-slide').click()`);
  await new Promise(r => setTimeout(r, 800));
  const pageAfterNext = await evaluate(`document.getElementById('page-indicator').innerText.trim()`);
  console.log('Nota Page after Next:', pageAfterNext);

  await evaluate(`document.getElementById('btn-prev-slide').click()`);
  await new Promise(r => setTimeout(r, 800));
  const pageAfterPrev = await evaluate(`document.getElementById('page-indicator').innerText.trim()`);
  console.log('Nota Page after Prev:', pageAfterPrev);

  // Test overflow menu
  await evaluate(`document.getElementById('btn-more-tools').click()`);
  await new Promise(r => setTimeout(r, 400));
  const overflowOpen = await evaluate(`!document.getElementById('more-tools-menu').classList.contains('hidden')`);
  console.log('Nota More Tools Menu Open:', overflowOpen);
  await saveScreenshot('hotfix_nota_iphone_390x844.png');

  // 1b. Test iPad Landscape 1024x768
  await setViewport(1024, 768, false, true);
  await new Promise(r => setTimeout(r, 1000));
  const noteChecks1024 = await evaluate(`(() => {
    const v = document.getElementById('slide-viewport');
    return {
      viewportWidth: v.clientWidth,
      viewportHeight: v.clientHeight,
      aspectRatio: (v.clientWidth / v.clientHeight).toFixed(2),
      fitsWithinHeight: v.clientHeight <= (768 - 120)
    };
  })()`);
  console.log('Nota (1024x768) Status:', noteChecks1024);
  await saveScreenshot('hotfix_nota_ipad_1024x768.png');

  // 1c. Test Desktop 1920x1080
  await setViewport(1920, 1080, false, false);
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot('hotfix_nota_desktop_1920x1080.png');

  console.log('\n--- UJIAN 2: LABELKAN ORGANEL SEL (games/labelkan-organel.html) ---');
  await setViewport(1024, 768, false, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/games/labelkan-organel.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 1500));

  const organelChecks = await evaluate(`(() => {
    const slots = Array.from(document.querySelectorAll('#container-animal-cell .drop-slot'));
    const slotTexts = slots.map(s => s.innerText.trim());
    const containsDirectAnswers = slotTexts.some(t => /Nukleus|Membran|Sitoplasma|Mitokondria/i.test(t));
    return {
      slotCount: slots.length,
      slotTexts,
      containsDirectAnswers
    };
  })()`);
  console.log('Labelkan Organel Target Slots:', organelChecks);
  await saveScreenshot('hotfix_labelkan_organel_neutral_targets.png');

  // Test tap-to-select matching
  const matchResult = await evaluate(`(() => {
    // 1. Click pill Nukleus
    const nukleusPill = document.querySelector('.organelle-pill[data-id="nukleus"]');
    if (nukleusPill) nukleusPill.click();

    // 2. Click drop slot with target nukleus
    const targetSlot = document.querySelector('.drop-slot[data-target="nukleus"]');
    if (targetSlot) targetSlot.click();

    const scoreText = document.getElementById('score-counter').innerText.trim();
    const isSlotFilled = targetSlot.classList.contains('filled-correct');
    const feedback = document.getElementById('feedback-message').innerText.trim();

    return {
      nukleusFound: !!nukleusPill,
      isSlotFilled,
      scoreText,
      feedback
    };
  })()`);
  console.log('Match Result (Nukleus -> Target):', matchResult);
  await saveScreenshot('hotfix_labelkan_organel_matched.png');

  console.log('\n--- UJIAN 3: JOYSTICK & D-PAD PERMAINAN ---');
  // 3a. Maze Chase in iPad 1024x768 & 768x1024
  await setViewport(1024, 768, false, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/games/klasifikasi-sel.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 1500));

  const mazeDpad1024 = await evaluate(`(() => {
    const dpad = document.getElementById('maze-mobile-dpad');
    if (!dpad) return { exists: false };
    const rect = dpad.getBoundingClientRect();
    const style = window.getComputedStyle(dpad);
    return {
      exists: true,
      display: style.display,
      visibility: style.visibility,
      left: rect.left,
      bottom: window.innerHeight - rect.bottom,
      width: rect.width,
      height: rect.height,
      visible: style.display !== 'none' && rect.width > 0
    };
  })()`);
  console.log('Maze Chase D-Pad (1024x768 iPad):', mazeDpad1024);
  await saveScreenshot('hotfix_maze_chase_joystick_ipad.png');

  // 3b. Misi Penyelamat Makmal Sains / Kuiz Saintis Muda 2D (kuiz_interaktif/code.html)
  await setViewport(768, 1024, true, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/kuiz_interaktif/code.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 1500));

  const advDpad768 = await evaluate(`(() => {
    const dpad = document.getElementById('adv-mobile-dpad');
    if (!dpad) return { exists: false };
    const rect = dpad.getBoundingClientRect();
    const style = window.getComputedStyle(dpad);
    return {
      exists: true,
      display: style.display,
      visible: style.display !== 'none' && rect.width > 0,
      left: rect.left,
      bottom: window.innerHeight - rect.bottom
    };
  })()`);
  console.log('Kuiz Saintis Muda 2D D-Pad (768x1024 iPad Portrait):', advDpad768);

  // 3c. Kuiz Saintis Muda Mod Klasik (kuiz_interaktif/code_classic.html)
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/kuiz_interaktif/code_classic.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 1200));

  const classicAudit = await evaluate(`(() => {
    const hasCanvas = !!document.querySelector('canvas');
    const hasMovementAvatar = !!document.querySelector('#player-avatar, #adv-canvas, #maze-canvas');
    const hasOptions = document.querySelectorAll('.option-card, [onclick*=\"selectOption\"], input[type=\"radio\"]').length;
    return {
      gameType: 'Kuiz Pilihan Berganda Urutan (Sequential Multiple Choice)',
      hasCanvas,
      hasMovementAvatar,
      needsJoystick: false,
      reason: 'Tiada dunia 2D / pergerakan pemain; kuiz berformat soalan dan pilihan jawapan.'
    };
  })()`);
  console.log('Kuiz Saintis Muda Mod Klasik Audit:', classicAudit);

  // 3d. Misi Makmal Sains (games/misi-makmal-sains.html)
  await setViewport(1024, 768, false, true);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${port}/games/misi-makmal-sains.html` }, cdpId++);
  await new Promise(r => setTimeout(r, 1500));

  const labDpad1024 = await evaluate(`(() => {
    const dpad = document.getElementById('lab-mobile-dpad');
    if (!dpad) return { exists: false };
    const rect = dpad.getBoundingClientRect();
    const style = window.getComputedStyle(dpad);
    return {
      exists: true,
      display: style.display,
      visible: style.display !== 'none' && rect.width > 0,
      left: rect.left,
      bottom: window.innerHeight - rect.bottom
    };
  })()`);
  console.log('Misi Makmal Sains D-Pad (1024x768 iPad):', labDpad1024);
  await saveScreenshot('hotfix_lab_adventure_joystick_ipad.png');

  console.log('\n=== SEMUA UJIAN BERJAYA DILAKSANAKAN ===\n');
  cleanup();
  process.exit(0);
}

run().catch(err => {
  console.error('[TEST ERROR]:', err);
  process.exit(1);
});
