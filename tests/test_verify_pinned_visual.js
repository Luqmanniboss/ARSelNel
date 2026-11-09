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

async function run() {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_vis_${Date.now()}`);
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
  console.log('Activating CellQuest and loading Plant Cell GLB...');
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

  // Wait for plant cell GLB to load
  for (let i = 0; i < 30; i++) {
    const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
    console.log(`GLB Status: ${st.result.value}`);
    if (st.result.value && st.result.value.includes('Berjaya')) break;
    await new Promise(r => setTimeout(r, 500));
  }

  // Pin model to camera at calibrated depth -800 and scale 1000
  console.log('Pinning model to camera with calibrated depth & scale...');
  const pinRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      cq.camera.add(cq.rootGroup);
      cq.rootGroup.position.set(0, 0, -800);
      cq.rootGroup.scale.set(1000, 1000, 1000);
      cq.rootGroup.rotation.set(0, 0, 0);
      cq.rootGroup.visible = true;
      cq.rootGroup.updateMatrixWorld(true);

      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ndc = wp.clone().project(cq.camera);

      // Check if rendered mesh count > 0
      let meshCount = 0;
      cq.rootGroup.traverse(c => { if (c.isMesh && c.visible) meshCount++; });

      return {
        worldPos: [wp.x, wp.y, wp.z],
        ndc: [ndc.x, ndc.y, ndc.z],
        meshCount: meshCount,
        parentName: cq.rootGroup.parent.type
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  console.log('Pin Result:', pinRes.result.value);

  await new Promise(r => setTimeout(r, 1000));
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const buffer = Buffer.from(shot.data, 'base64');
  const outPath = path.join('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb', 'pinned_visual_verified.png');
  fs.writeFileSync(outPath, buffer);
  console.log('Saved visual verification screenshot to:', outPath);

  ws.close();
  cleanup();
  process.exit(0);
}

run().catch(console.error);

