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

(async () => {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_trans_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
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
  await sendCDP(ws, 'Page.navigate', { url: 'https://127.0.0.1:3443/kotak_arselnel/' }, cdpId++);
  await new Promise(r => setTimeout(r, 2600));

  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
      const anchor = window.KotakARSELNEL.state.anchorCellQuest;
      const root = window.CellQuestARController.rootGroup;
      const model = window.CellQuestARController.modelHolder;
      const cam = window.KotakARSELNEL.state.camera;

      // Simulate a realistic MindAR matrix update when marker is detected at typical distance
      // In MindAR: targetIndex 3, matrix is updated from controller:
      // Let's inspect anchor group children, position, scale
      root.updateMatrixWorld(true);
      const wp = new THREE.Vector3(); root.getWorldPosition(wp);
      const ws = new THREE.Vector3(); root.getWorldScale(ws);

      return {
        camNear: cam.near,
        camFar: cam.far,
        anchorMatrix: Array.from(anchor.group.matrix.elements),
        rootLocalPos: [root.position.x, root.position.y, root.position.z],
        rootLocalScale: [root.scale.x, root.scale.y, root.scale.z],
        modelScale: [model.scale.x, model.scale.y, model.scale.z],
        rootWorldPos: [wp.x, wp.y, wp.z],
        rootWorldScale: [ws.x, ws.y, ws.z]
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  console.log('Transform inspection:', JSON.stringify(res.result.value, null, 2));
  ws.close();
  cleanup();
  process.exit(0);
})().catch(console.error);

