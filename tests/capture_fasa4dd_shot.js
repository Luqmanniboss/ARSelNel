const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9299;

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
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Browser not found');
}

async function capture() {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_shot_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,768',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };

  process.on('exit', cleanup);

  let targetWsUrl;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        targetWsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);
  await new Promise(r => setTimeout(r, 2600));

  // Activate CellQuest and select organelle
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const loadEl = document.getElementById('loading-screen');
      if (loadEl) loadEl.classList.add('hidden');
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
      window.CellQuestARController.selectOrganelle('nucleus');
    })()`
  }, cdpId++);

  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const buffer = Buffer.from(screenshot.data, 'base64');
  const outPath = path.join('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb', 'kotak_arselnel_fasa4dd_verified.png');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved screenshot to: ${outPath}`);

  ws.close();
  cleanup();
  process.exit(0);
}

capture().catch(console.error);
