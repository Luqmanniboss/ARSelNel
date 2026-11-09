const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9299;

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  } else {
    console.log(`✅ PASS: ${msg}`);
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
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Browser not found');
}

async function run() {
  console.log('=== TEST SUITE: COMPLETE PIN & VISIBILITY VERIFICATION ===');
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_pinfix_${Date.now()}`);
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

  // Activate CellQuest and wait for GLB
  console.log('1. Loading CellQuest 3D...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const loadEl = document.getElementById('loading-screen');
      if (loadEl) loadEl.classList.add('hidden');
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const cq = window.CellQuestARController;
      cq.loadModel('plant');
      cq.onTargetFound();
    })()`
  }, cdpId++);

  for (let i = 0; i < 30; i++) {
    const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
    if (st.result.value && st.result.value.includes('Berjaya')) break;
    await new Promise(r => setTimeout(r, 500));
  }

  // Simulate realistic MindAR marker tracking matrix
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const anchor = window.KotakARSELNEL.state.anchorCellQuest;
      const m = new THREE.Matrix4();
      m.makeTranslation(0, 0, -800);
      m.scale(new THREE.Vector3(1000, 1000, 1000));
      anchor.group.matrix = m;
      anchor.group.visible = true;
      window.CellQuestARController.rootGroup.updateMatrixWorld(true);
    })()`
  }, cdpId++);

  console.log('2. Testing Pin Model...');
  const pinTestRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const btnPin = document.getElementById('cq-btn-pin');

      // Click Semat Model
      btnPin.click();

      cq.rootGroup.updateMatrixWorld(true);
      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ws = new THREE.Vector3(); cq.rootGroup.getWorldScale(ws);
      const ndc = wp.clone().project(cq.camera);

      return {
        mode: cq.mode,
        parent: cq.rootGroup.parent.type,
        visible: cq.rootGroup.visible,
        pos: [wp.x, wp.y, wp.z],
        scale: [ws.x, ws.y, ws.z],
        ndc: [ndc.x, ndc.y, ndc.z],
        insideFrustum: (ndc.z >= -1 && ndc.z <= 1)
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const pt = pinTestRes.result.value;
  console.log('Pin State:', pt);

  ws.close();
  cleanup();
  process.exit(0);
}

run().catch(console.error);

