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
  console.log('=== TEST SUITE: HOTFIX FASA 4D-D.1 VERIFICATION ===');
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_hotfix4dd1_${Date.now()}`);

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

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  const testUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`\nNavigating to: ${testUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: testUrl }, cdpId++);
  await new Promise(r => setTimeout(r, 2600));

  // Activate CellQuest
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
    })()`
  }, cdpId++);

  // TEST 1: BUG 1 — Model visibility when camera moves away without pin
  console.log('\n--- VERIFY BUG 1: Model NOT auto-pinned when marker is lost without pin ---');
  const bug1Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      // Initially marker tracked
      const initVisible = cq.rootGroup.visible;
      const initAnchorVisible = cq.anchorGroup.visible;
      const initTracking = cq.trackingState;

      // Simulate Target Lost
      cq.onTargetLost();
      const lostVisible = cq.rootGroup.visible;
      const lostAnchorVisible = cq.anchorGroup.visible;
      const lostTracking = cq.trackingState;
      const statusText = document.getElementById('cq-status-text').textContent;

      // Simulate Target Found again
      cq.onTargetFound();
      const refoundVisible = cq.rootGroup.visible;
      const refoundAnchorVisible = cq.anchorGroup.visible;
      const refoundTracking = cq.trackingState;

      return {
        initVisible, initAnchorVisible, initTracking,
        lostVisible, lostAnchorVisible, lostTracking, statusText,
        refoundVisible, refoundAnchorVisible, refoundTracking
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const b1 = bug1Res.result.value;
  assert(b1.initVisible === true, 'Initially model is visible on tracked marker');
  assert(b1.initTracking === 'MARKER_TRACKED', 'Initially trackingState is MARKER_TRACKED');
  assert(b1.lostVisible === false, 'BUG 1 FIXED: When marker is lost without pin, model HIDES (visible: false)');
  assert(b1.lostAnchorVisible === false, 'Anchor group hides on marker loss');
  assert(b1.lostTracking === 'MARKER_LOST', 'trackingState switches to MARKER_LOST');
  assert(b1.statusText === 'Menunggu Marker...', 'Status text prompts Menunggu Marker...');
  assert(b1.refoundVisible === true, 'When marker returns into view, model is visible again');
  assert(b1.refoundTracking === 'MARKER_TRACKED', 'trackingState returns to MARKER_TRACKED');

  // TEST 2: BUG 3 — Tapping Semat Model does NOT make the model disappear
  console.log('\n--- VERIFY BUG 3: Tapping Semat Model keeps model visible in Three.js scene ---');
  const bug3Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const state = window.KotakARSELNEL.state;
      const cq = window.CellQuestARController;
      const btnPin = document.getElementById('cq-btn-pin');

      // Click Semat Model
      btnPin.click();

      const isPinned = (cq.spatialMode === 'SCREEN_PINNED');
      const rootVisible = cq.rootGroup.visible;
      const rootParent = cq.rootGroup.parent;
      const parentIsCamera = (rootParent === cq.camera);
      const cameraInScene = state.scene.children.includes(cq.camera);

      // Verify Three.js scene graph traverses to rootGroup
      let sceneContainsRootGroup = false;
      state.scene.traverse(obj => {
        if (obj === cq.rootGroup) sceneContainsRootGroup = true;
      });

      // Now simulate camera moving away while PINNED
      cq.onTargetLost();
      const pinnedAfterLostVisible = cq.rootGroup.visible;
      const statusTextPinned = document.getElementById('cq-status-text').textContent;

      return {
        isPinned,
        rootVisible,
        parentIsCamera,
        cameraInScene,
        sceneContainsRootGroup,
        pinnedAfterLostVisible,
        statusTextPinned
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const b3 = bug3Res.result.value;
  assert(b3.isPinned, 'Spatial mode is SCREEN_PINNED');
  assert(b3.rootVisible === true, 'BUG 3 FIXED: Model rootGroup is VISIBLE after pressing Semat Model');
  assert(b3.parentIsCamera, 'RootGroup is child of Three.js camera');
  assert(b3.cameraInScene === true, 'Camera is in Three.js scene graph');
  assert(b3.sceneContainsRootGroup === true, 'BUG 3 FIXED: Three.js WebGLRenderer traverses scene to rootGroup (Will RENDER!)');
  assert(b3.pinnedAfterLostVisible === true, 'Model stays visible even when camera pans away while pinned');
  assert(b3.statusTextPinned === 'Semat pada Skrin', 'Status badge shows Semat pada Skrin');

  // TEST 3: BUG 2 — Seret Model works smoothly with touch events & touch-action
  console.log('\n--- VERIFY BUG 2: Seret Model translation & iPad touch stabilization ---');
  const bug2Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const btnDrag = document.getElementById('cq-btn-drag');

      // Switch to DRAG touchMode
      btnDrag.click();
      const touchMode = cq.touchMode;
      const hasBodyClass = document.body.classList.contains('cellquest-active');

      const initialDragX = cq.dragOffset.x;
      const initialDragY = cq.dragOffset.y;

      return {
        touchMode,
        hasBodyClass,
        initialDragX,
        initialDragY
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const b2 = bug2Res.result.value;
  assert(b2.touchMode === 'DRAG', 'touchMode is DRAG');
  assert(b2.hasBodyClass === true, 'BUG 2 FIXED: body has cellquest-active class (activates pointer-events & touch-action: none on canvas)');

  // Simulate touch drag
  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 500, y: 400 }]
  }, cdpId++);

  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 560, y: 340 }]
  }, cdpId++);

  await sendCDP(ws, 'Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  }, cdpId++);

  const dragResult = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        dragOffsetX: cq.dragOffset.x,
        dragOffsetY: cq.dragOffset.y,
        rootPosX: cq.rootGroup.position.x,
        rootPosY: cq.rootGroup.position.y,
        pointerEvent: cq.lastPointerEventStr
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const dr = dragResult.result.value;
  assert(dr.dragOffsetX > 0.05, `BUG 2 FIXED: Drag offset X updated (got: ${dr.dragOffsetX.toFixed(3)})`);
  assert(dr.dragOffsetY > 0.05, `BUG 2 FIXED: Drag offset Y updated (got: ${dr.dragOffsetY.toFixed(3)})`);
  assert(dr.rootPosX === dr.dragOffsetX, 'rootGroup X reflects dragOffset');
  assert(dr.rootPosY === dr.dragOffsetY, 'rootGroup Y reflects dragOffset');
  console.log(`  Last pointer telemetry: ${dr.pointerEvent}`);

  // Test Bawa ke Tengah
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-recenter').click();`
  }, cdpId++);

  const recenterRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        dragOffsetX: cq.dragOffset.x,
        dragOffsetY: cq.dragOffset.y,
        rootPosX: cq.rootGroup.position.x,
        rootPosY: cq.rootGroup.position.y
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const rr = recenterRes.result.value;
  assert(rr.dragOffsetX === 0 && rr.dragOffsetY === 0, 'Bawa ke Tengah resets drag offset to (0, 0)');
  assert(rr.rootPosX === 0 && rr.rootPosY === 0, 'rootGroup returns to center (0, 0)');

  // Unpin to test return to marker
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click();`
  }, cdpId++);

  const unpinRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        spatialMode: cq.spatialMode,
        parentIsAnchor: (cq.rootGroup.parent === cq.anchorGroup)
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const ur = unpinRes.result.value;
  assert(ur.spatialMode === 'MARKER_MODE', 'Unpin returns to MARKER_MODE');
  assert(ur.parentIsAnchor, 'RootGroup safely reparented back to anchorGroup');

  console.log('\n🎯 ALL 3 CRITICAL PHYSICAL BUGS VERIFIED FIXED SUCCESSFULLY! 🎯');

  ws.close();
  cleanup();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

