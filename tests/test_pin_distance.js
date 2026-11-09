const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9324;

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_cdp_pincheck_' + Date.now());
  const proc = spawn(chromePath, [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + userDataDir,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  process.on('exit', () => { try { proc.kill(); } catch (e) {} });

  await new Promise(r => setTimeout(r, 4500));
  const res = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // Activate CellQuest
  await send('Runtime.evaluate', {
    expression: `(() => {
      const loadEl = document.getElementById('loading-screen');
      if (loadEl) loadEl.classList.add('hidden');
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const cq = window.CellQuestARController;
      cq.loadModel('plant');
      cq.onTargetFound();
    })()`
  });

  // Wait for GLB load
  for (let i = 0; i < 30; i++) {
    const st = await send('Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' });
    if (st.result.value && st.result.value.includes('Berjaya')) break;
    await new Promise(r => setTimeout(r, 400));
  }

  // TEST 1: MindAR native scale (near=10, far=100000)
  // Let's test what distance D gives the EXACT view as seen on the marker!
  const res1 = await send('Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const cam = cq.camera;
      
      // Attach to camera
      if (cq.rootGroup.parent !== cam) cam.add(cq.rootGroup);
      
      // Place at distance D = -2400, scale = 1000
      cq.rootGroup.position.set(0, 0, -2400);
      cq.rootGroup.quaternion.set(0, 0, 0, 1);
      cq.rootGroup.scale.set(1000, 1000, 1000);
      cq.rootGroup.visible = true;
      cq.rootGroup.updateMatrixWorld(true);
      
      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ndc = wp.clone().project(cam);
      return {
        near: cam.near,
        far: cam.far,
        ndc: [ndc.x, ndc.y, ndc.z]
      };
    })()`,
    returnByValue: true
  });
  console.log('Test 1 (D=-2400, Scale=1000):', res1.result.value);

  // Capture screenshot of Test 1
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tests/shot_native_d2400.png', Buffer.from(shot1.data, 'base64'));
  fs.copyFileSync('tests/shot_native_d2400.png', 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/shot_native_d2400.png');
  console.log('Saved shot_native_d2400.png');

  ws.close();
  proc.kill();
  process.exit(0);
}
run().catch(console.error);

