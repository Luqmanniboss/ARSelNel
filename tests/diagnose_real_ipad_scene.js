const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9298;

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
  throw new Error('Chrome/Edge executable not found');
}

async function run() {
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,768',
    '--ignore-certificate-errors',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

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

  if (!targetWsUrl) throw new Error('Could not connect to CDP WebSocket');

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  ws.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('BROWSER CONSOLE:', msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('BROWSER EXCEPTION:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    } catch(err) {}
  });

  const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`Navigating to: ${targetUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);

  // Wait for bootstrap
  await new Promise(r => setTimeout(r, 3000));

  // Trigger Target 3 Found
  console.log('Simulating Target 3 (CellQuest 3D) found...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Find anchorCellQuest
      if (window.KotakARSELNEL && window.KotakARSELNEL.switchActiveModule) {
        window.KotakARSELNEL.switchActiveModule('cellquest');
      }
      const ctrl = window.CellQuestARController;
      if (ctrl) {
        ctrl.onTargetFound();
      }
    })()`
  }, cdpId++);

  // Wait 4 seconds for model loading
  console.log('Waiting 4s for GLTF model to load...');
  await new Promise(r => setTimeout(r, 4000));

  // Inspect state
  const inspectRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      if (!ctrl) return { error: 'No controller' };
      
      const res = {
        glbLoadStatus: ctrl.glbLoadStatus,
        activeCellType: ctrl.activeCellType,
        interactiveObjectsCount: ctrl.interactiveObjects.length,
        hasTargetLock: ctrl.hasTargetLock,
        rootGroupVisible: ctrl.rootGroup ? ctrl.rootGroup.visible : null,
        rootGroupParent: ctrl.rootGroup && ctrl.rootGroup.parent ? ctrl.rootGroup.parent.type : null,
        rootGroupPos: ctrl.rootGroup ? [ctrl.rootGroup.position.x, ctrl.rootGroup.position.y, ctrl.rootGroup.position.z] : null,
        rootGroupScale: ctrl.rootGroup ? [ctrl.rootGroup.scale.x, ctrl.rootGroup.scale.y, ctrl.rootGroup.scale.z] : null,
        cameraPos: ctrl.camera ? [ctrl.camera.position.x, ctrl.camera.position.y, ctrl.camera.position.z] : null,
        cameraNear: ctrl.camera ? ctrl.camera.near : null,
        cameraFar: ctrl.camera ? ctrl.camera.far : null,
        modelHolderChildrenCount: ctrl.modelHolder ? ctrl.modelHolder.children.length : 0,
        modelHolderScale: ctrl.modelHolder ? ctrl.modelHolder.scale.x : 0,
        sceneChildrenCount: ctrl.scene ? ctrl.scene.children.length : 0,
        sceneChildrenNames: ctrl.scene ? ctrl.scene.children.map(c => c.name || c.type) : [],
        cachedScenes: Object.keys(ctrl.cachedGltfScenes).filter(k => !!ctrl.cachedGltfScenes[k])
      };

      // Check projected screen coordinates of the model
      if (ctrl.camera && ctrl.modelHolder && ctrl.interactiveObjects.length > 0) {
        const obj = ctrl.interactiveObjects[0];
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        const proj = worldPos.clone().project(ctrl.camera);
        res.firstObjectWorldPos = [worldPos.x, worldPos.y, worldPos.z];
        res.firstObjectProjected = [proj.x, proj.y, proj.z];
      }

      // Check canvas element
      const container = document.getElementById('ar-container');
      const canvas = container ? container.querySelector('canvas') : null;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        res.canvasRect = { width: rect.width, height: rect.height, top: rect.top, left: rect.left };
        res.canvasStyle = { display: canvas.style.display, visibility: canvas.style.visibility, zIndex: canvas.style.zIndex };
      }

      return res;
    })()`,
    returnByValue: true
  }, cdpId++);

  console.log('DIAGNOSTICS RESULT:', JSON.stringify(inspectRes.result.value, null, 2));

  // Take screenshot
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  fs.writeFileSync('tests/diag_cellquest_screenshot.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to tests/diag_cellquest_screenshot.png');

  cleanup();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

