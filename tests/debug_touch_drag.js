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

async function debugDrag() {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_dbg_${Date.now()}`);

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

  // Activate CellQuest and switch to DRAG mode
  const setupRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
      document.getElementById('cq-btn-drag').click();
      return {
        isActive: window.CellQuestARController.isActive,
        touchMode: window.CellQuestARController.touchMode,
        dragOffset: window.CellQuestARController.dragOffset
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Setup:', setupRes.result.value);

  // Dispatch real Input.dispatchTouchEvent
  console.log('Dispatching touch drag...');
  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 500, y: 400 }]
  }, cdpId++);

  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 550, y: 350 }]
  }, cdpId++);

  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  }, cdpId++);

  const afterRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        dragOffset: { x: cq.dragOffset.x, y: cq.dragOffset.y },
        rootPos: { x: cq.rootGroup.position.x, y: cq.rootGroup.position.y, z: cq.rootGroup.position.z },
        userRotation: cq.userRotation
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('After Touch Drag:', afterRes.result.value);

  ws.close();
  cleanup();
  process.exit(0);
}

debugDrag().catch(console.error);

