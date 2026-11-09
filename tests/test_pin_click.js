const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9315;

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

  await new Promise(r => setTimeout(r, 3500));
  const res = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
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

  // Wait for GLB to load
  console.log('Waiting for GLB load...');
  for (let i = 0; i < 30; i++) {
    const st = await send('Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' });
    if (st.result.value && st.result.value.includes('Berjaya')) {
      console.log('GLB loaded:', st.result.value);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  // Simulate realistic MindAR tracking matrix on anchor 3
  // Realistic matrix from MindAR: translation [0, 0, -1200], scale 1000
  await send('Runtime.evaluate', {
    expression: `(() => {
      const anchor = window.KotakARSELNEL.state.anchorCellQuest;
      const m = new THREE.Matrix4();
      // MindAR typical pose: looking at marker ~1.2m away
      m.makeTranslation(0, 0, -1200);
      m.multiply(new THREE.Matrix4().makeScale(1000, 1000, 1000));
      anchor.group.matrix.copy(m);
      anchor.group.visible = true;
      anchor.group.updateMatrixWorld(true);
      window.CellQuestARController.rootGroup.updateMatrixWorld(true);
    })()`
  });

  // Check state BEFORE clicking Pin
  const beforePin = await send('Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ws = new THREE.Vector3(); cq.rootGroup.getWorldScale(ws);
      const wq = new THREE.Quaternion(); cq.rootGroup.getWorldQuaternion(wq);
      const ndc = wp.clone().project(cq.camera);
      return {
        parent: cq.rootGroup.parent.name || cq.rootGroup.parent.type,
        visible: cq.rootGroup.visible,
        wp: [wp.x, wp.y, wp.z],
        ws: [ws.x, ws.y, ws.z],
        wq: [wq.x, wq.y, wq.z, wq.w],
        ndc: [ndc.x, ndc.y, ndc.z]
      };
    })()`,
    returnByValue: true
  });
  console.log('Before Pin:', beforePin.result.value);

  // Now click Semat Model button (cq-btn-pin)
  console.log('Clicking cq-btn-pin...');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click()`
  });

  await new Promise(r => setTimeout(r, 200));

  // Check state AFTER clicking Pin
  const afterPin = await send('Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      cq.rootGroup.updateMatrixWorld(true);
      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ws = new THREE.Vector3(); cq.rootGroup.getWorldScale(ws);
      const wq = new THREE.Quaternion(); cq.rootGroup.getWorldQuaternion(wq);
      const ndc = wp.clone().project(cq.camera);
      return {
        mode: cq.spatialMode,
        parent: cq.rootGroup.parent.name || cq.rootGroup.parent.type,
        parentInScene: window.KotakARSELNEL.state.scene.children.includes(cq.rootGroup.parent),
        rootInCamera: cq.camera.children.includes(cq.rootGroup),
        visible: cq.rootGroup.visible,
        localPos: [cq.rootGroup.position.x, cq.rootGroup.position.y, cq.rootGroup.position.z],
        localScale: [cq.rootGroup.scale.x, cq.rootGroup.scale.y, cq.rootGroup.scale.z],
        wp: [wp.x, wp.y, wp.z],
        ws: [ws.x, ws.y, ws.z],
        wq: [wq.x, wq.y, wq.z, wq.w],
        ndc: [ndc.x, ndc.y, ndc.z]
      };
    })()`,
    returnByValue: true
  });
  console.log('After Pin:', afterPin.result.value);

  // Take screenshot to see if it rendered!
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tests/pin_click_test.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to tests/pin_click_test.png, size:', screenshot.data.length);

  ws.close();
  proc.kill();
  process.exit(0);
}
run().catch(console.error);

