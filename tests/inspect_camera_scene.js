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

async function inspect() {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_inspect_${Date.now()}`);

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

  const result = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const state = window.KotakARSELNEL ? window.KotakARSELNEL.state : null;
      if (!state) return { error: 'No KotakARSELNEL.state' };

      const scene = state.scene;
      const camera = state.camera;
      const renderer = state.renderer;
      const anchor3 = state.anchorCellQuest;

      return {
        sceneChildrenCount: scene.children.length,
        sceneChildrenNames: scene.children.map(c => c.name || c.type),
        cameraParent: camera.parent ? (camera.parent.name || camera.parent.type) : 'null (no parent)',
        cameraInScene: scene.children.includes(camera),
        cameraPos: camera.position.toArray(),
        cameraMatrix: camera.matrix.elements.slice(12, 16),
        anchor3GroupParent: anchor3.group.parent ? (anchor3.group.parent.name || anchor3.group.parent.type) : 'null',
        anchor3GroupInScene: scene.children.includes(anchor3.group),
        anchor3Visible: anchor3.group.visible,
        anchor3Matrix: anchor3.group.matrix.elements.slice(12, 16)
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  console.log('Inspection Result:', JSON.stringify(result.result.value, null, 2));

  ws.close();
  cleanup();
  process.exit(0);
}

inspect().catch(console.error);

