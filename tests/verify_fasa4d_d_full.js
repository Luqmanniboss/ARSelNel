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
  console.log('=== TEST SUITE: FASA 4D-D — SEMAT, SERET & KUNCI POV CELLQUEST 3D ===');
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4dd_${Date.now()}`);

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

  ws.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description).join(' ');
        if (text.includes('CellQuest') || text.includes('KotakAR')) {
          console.log('  [BROWSER]', text);
        }
      }
    } catch (e) {}
  });

  const testUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`\nNavigating to: ${testUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: testUrl }, cdpId++);
  await new Promise(r => setTimeout(r, 2600));

  // Step 1: Verify CellQuestARController state & DOM elements
  console.log('\n--- STEP 1: Verify CellQuestARController State & HUD DOM Elements ---');
  const step1Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
        const btnPin = document.getElementById('cq-btn-pin');
        const btnDrag = document.getElementById('cq-btn-drag');
        const btnRotate = document.getElementById('cq-btn-rotate');
        const btnPOV = document.getElementById('cq-btn-pov');
        const btnRecenter = document.getElementById('cq-btn-recenter');
        const btnReset = document.getElementById('cq-btn-reset');
        return {
          hasCQ: !!cq,
          mode: cq ? cq.mode : null,
          touchMode: cq ? cq.touchMode : null,
          hasBtnPin: !!btnPin,
          hasBtnDrag: !!btnDrag,
          hasBtnRotate: !!btnRotate,
          hasBtnPOV: !!btnPOV,
          hasBtnRecenter: !!btnRecenter,
          hasBtnReset: !!btnReset
        };
      })()
    `,
    returnByValue: true
  }, cdpId++);

  const s1 = step1Res.result.value;
  assert(s1.hasCQ, 'CellQuestARController exists in scope');
  assert(s1.mode === 'MARKER_TRACKED', `Initial mode is MARKER_TRACKED (got: ${s1.mode})`);
  assert(s1.touchMode === 'ROTATE', `Initial touchMode is ROTATE (got: ${s1.touchMode})`);
  assert(s1.hasBtnPin, 'Button Semat Model (cq-btn-pin) present');
  assert(s1.hasBtnDrag, 'Button Seret Model (cq-btn-drag) present');
  assert(s1.hasBtnRotate, 'Button Putar (cq-btn-rotate) present');
  assert(s1.hasBtnPOV, 'Button Kunci POV (cq-btn-pov) present');
  assert(s1.hasBtnRecenter, 'Button Bawa ke Tengah (cq-btn-recenter) present');
  assert(s1.hasBtnReset, 'Button Reset (cq-btn-reset) present');

  // Step 2: Activate Direct AR CellQuest
  console.log('\n--- STEP 2: Activate Direct AR CellQuest on Target 3 ---');
  const step2Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
        cq.activate();
        cq.onTargetFound();
        return {
          isActive: cq.isActive,
          activeCellType: cq.activeCellType,
          rootGroupVisible: cq.rootGroup ? cq.rootGroup.visible : false,
          hasRootGroup: !!cq.rootGroup,
          hasModelHolder: !!cq.modelHolder
        };
      })()
    `,
    returnByValue: true
  }, cdpId++);

  const s2 = step2Res.result.value;
  assert(s2.isActive, 'CellQuest AR is active');
  assert(s2.rootGroupVisible, 'RootGroup is visible');
  assert(s2.hasModelHolder, 'ModelHolder is ready');

  // Step 3: Test Semat Model (Screen Pinning)
  console.log('\n--- STEP 3: Test Semat Model (Screen Pinning) ---');
  const step3Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
        const btnPin = document.getElementById('cq-btn-pin');
        const pinLabel = document.getElementById('cq-pin-label');
        const statusText = document.getElementById('cq-status-text');

        // Click Semat Model
        btnPin.click();

        const pinnedMode = cq.mode;
        const parentIsCamera = (cq.rootGroup.parent === cq.camera);
        const zPos = cq.rootGroup.position.z;
        const btnHasPinnedClass = btnPin.classList.contains('is-pinned');
        const labelText = pinLabel.textContent.trim();
        const badgeText = statusText.textContent.trim();
        const pedestalHidden = (cq.hologramPedestal && cq.hologramPedestal.group) ? !cq.hologramPedestal.group.visible : true;

        // Click again to unpin
        btnPin.click();
        const unpinnedMode = cq.mode;
        const parentIsAnchor = (cq.rootGroup.parent === cq.anchorGroup);
        const btnUnpinnedClass = !btnPin.classList.contains('is-pinned');
        const unpinnedLabel = pinLabel.textContent.trim();

        return {
          pinnedMode,
          parentIsCamera,
          zPos,
          btnHasPinnedClass,
          labelText,
          badgeText,
          pedestalHidden,
          unpinnedMode,
          parentIsAnchor,
          btnUnpinnedClass,
          unpinnedLabel
        };
      })()
    `,
    returnByValue: true
  }, cdpId++);

  const s3 = step3Res.result.value;
  assert(s3.pinnedMode === 'SCREEN_PINNED', `Pinned mode is SCREEN_PINNED (got: ${s3.pinnedMode})`);
  assert(s3.parentIsCamera, 'RootGroup is child of Three.js camera in SCREEN_PINNED mode');
  assert(Math.abs(s3.zPos - (-1.8)) < 0.01, `Z position in camera space is -1.8 (got: ${s3.zPos})`);
  assert(s3.btnHasPinnedClass, 'Button has .is-pinned class');
  assert(s3.labelText === 'Nyahsemat', `Button label changed to Nyahsemat (got: ${s3.labelText})`);
  assert(s3.badgeText === 'Semat pada Skrin', `Status badge is Semat pada Skrin (got: ${s3.badgeText})`);
  assert(s3.pedestalHidden, 'Hologram pedestal hidden when model is pinned to screen');
  assert(s3.unpinnedMode === 'MARKER_TRACKED', `Unpinned mode returned to MARKER_TRACKED (got: ${s3.unpinnedMode})`);
  assert(s3.parentIsAnchor, 'RootGroup reparented back to anchorGroup on physical marker');
  assert(s3.btnUnpinnedClass, 'Button .is-pinned class removed on unpin');
  assert(s3.unpinnedLabel === 'Semat Model', `Button label restored to Semat Model (got: ${s3.unpinnedLabel})`);

  // Step 4: Test Seret Model (Drag & Reposition)
  console.log('\n--- STEP 4: Test Seret Model (Drag & Reposition) ---');
  const step4Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
        const btnDrag = document.getElementById('cq-btn-drag');
        const btnRotate = document.getElementById('cq-btn-rotate');

        // Switch to DRAG touch mode
        btnDrag.click();
        const isDragActive = (cq.touchMode === 'DRAG');
        const btnDragClass = btnDrag.classList.contains('is-dragging');
        const btnRotateNotActive = !btnRotate.classList.contains('is-active');

        // Simulate 1-finger drag
        const startX = 500, startY = 400;
        const moveX = 580, moveY = 350; // Move right and up

        // Trigger drag calculation manually
        const fov = cq.camera.fov || 60;
        const pxPerUnit = window.innerHeight / (2 * 1.8 * Math.tan((fov * Math.PI / 180) / 2));
        const totalDx = (moveX - startX) / pxPerUnit;
        const totalDy = -(moveY - startY) / pxPerUnit;

        cq.dragStartOffset = { x: 0, y: 0 };
        cq.dragOffset.x = Math.max(-1.35, Math.min(1.35, totalDx));
        cq.dragOffset.y = Math.max(-0.95, Math.min(0.95, totalDy));
        cq.applyModelPosition();

        const draggedPosX = cq.rootGroup.position.x;
        const draggedPosY = cq.rootGroup.position.y;

        // Test Bawa ke Tengah (recenterModel)
        const btnRecenter = document.getElementById('cq-btn-recenter');
        btnRecenter.click();

        const recenteredX = cq.dragOffset.x;
        const recenteredY = cq.dragOffset.y;
        const recenteredGroupX = cq.rootGroup.position.x;
        const recenteredGroupY = cq.rootGroup.position.y;

        return {
          isDragActive,
          btnDragClass,
          btnRotateNotActive,
          draggedPosX,
          draggedPosY,
          recenteredX,
          recenteredY,
          recenteredGroupX,
          recenteredGroupY
        };
      })()
    `,
    returnByValue: true
  }, cdpId++);

  const s4 = step4Res.result.value;
  assert(s4.isDragActive, 'touchMode switched to DRAG');
  assert(s4.btnDragClass, 'Button Seret has .is-dragging class');
  assert(s4.btnRotateNotActive, 'Button Putar is not active');
  assert(s4.draggedPosX > 0, `Model translated horizontally (got: ${s4.draggedPosX.toFixed(3)})`);
  assert(s4.draggedPosY > 0, `Model translated vertically (got: ${s4.draggedPosY.toFixed(3)})`);
  assert(s4.recenteredX === 0 && s4.recenteredY === 0, 'dragOffset reset to (0, 0) after Bawa ke Tengah');
  assert(s4.recenteredGroupX === 0 && s4.recenteredGroupY === 0, 'rootGroup position reset to (0, 0)');

  // Step 5: Test Putar & Pinch Zoom & Organelle Selection
  console.log('\n--- STEP 5: Test Putar, Pinch Zoom & Organelle Selection ---');
  const step5Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        try {
          const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
          const btnRotate = document.getElementById('cq-btn-rotate');

          // Switch to ROTATE
          btnRotate.click();
          const isRotateActive = (cq.touchMode === 'ROTATE');

          // Test Zoom
          const initScale = cq.userScale;
          cq.adjustZoom(1.18);
          const zoomedIn = cq.userScale;
          cq.adjustZoom(0.82);
          const zoomedOut = cq.userScale;

          // Test Organelle selection
          cq.selectOrganelle('nucleus');
          const card = document.getElementById('cq-organelle-card');
          const cardName = document.getElementById('cq-card-name');
          const cardVisible = card && !card.classList.contains('hidden');
          const nameText = cardName ? cardName.textContent.trim() : '';

          // Clear selection
          cq.clearSelection();
          const cardHiddenAfterClear = card && card.classList.contains('hidden');

          return {
            isRotateActive,
            initScale,
            zoomedIn,
            zoomedOut,
            cardVisible,
            nameText,
            cardHiddenAfterClear
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    returnByValue: true
  }, cdpId++);

  if (step5Res.result.value && step5Res.result.value.error) {
    console.error('Step 5 browser error:', step5Res.result.value);
  }
  const s5 = step5Res.result.value;
  assert(s5.isRotateActive, 'touchMode switched back to ROTATE');
  assert(s5.zoomedIn > s5.initScale, `Zoom In increased userScale (from ${s5.initScale} to ${s5.zoomedIn.toFixed(2)})`);
  assert(s5.cardVisible, 'Organelle detail card is visible on selection');
  assert(s5.nameText.includes('NUKLEUS'), `Organelle title displays NUKLEUS (got: ${s5.nameText})`);
  assert(s5.cardHiddenAfterClear, 'Organelle detail card hidden after clearSelection');

  // Step 6: Test Kunci POV (3DoF Orientation Lock)
  console.log('\n--- STEP 6: Test Kunci POV (3DoF Orientation Lock) ---');
  const step6Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (async () => {
        const cq = window.KotakARSELNEL ? window.KotakARSELNEL.CellQuestARController : window.CellQuestARController;
        const btnPOV = document.getElementById('cq-btn-pov');
        const povLabel = document.getElementById('cq-pov-label');
        const statusText = document.getElementById('cq-status-text');

        // Enter POV mode
        await cq.togglePOVMode();

        const povMode = cq.mode;
        const parentIsCamera = (cq.rootGroup.parent === cq.camera);
        const btnHasLockedClass = btnPOV.classList.contains('is-locked');
        const labelText = povLabel.textContent.trim();
        const badgeText = statusText.textContent.trim();

        // Simulate device yaw turn 30 deg to the right
        window.KotakARSELNEL.state.pov.currentYaw = (cq.povAnchorHeading.yaw + 30) % 360;
        window.KotakARSELNEL.state.pov.currentPitch = cq.povAnchorHeading.pitch;

        // Run update frame
        cq.update(performance.now());

        const posXWhenTurnRight = cq.rootGroup.position.x;
        const posZWhenTurnRight = cq.rootGroup.position.z;

        // Recenter in POV mode
        cq.recenterModel();
        const recenteredYawAnchor = cq.povAnchorHeading.yaw;
        cq.update(performance.now());
        const posXAfterRecenter = cq.rootGroup.position.x;

        // Exit POV mode
        await cq.togglePOVMode();
        const modeAfterExit = cq.mode;
        const btnLockedRemoved = !btnPOV.classList.contains('is-locked');

        return {
          povMode,
          parentIsCamera,
          btnHasLockedClass,
          labelText,
          badgeText,
          posXWhenTurnRight,
          posZWhenTurnRight,
          posXAfterRecenter,
          modeAfterExit,
          btnLockedRemoved
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  }, cdpId++);

  const s6 = step6Res.result.value;
  assert(s6.povMode === 'POV_LOCKED', `POV mode is POV_LOCKED (got: ${s6.povMode})`);
  assert(s6.parentIsCamera, 'RootGroup is child of camera in POV_LOCKED mode');
  assert(s6.btnHasLockedClass, 'Button Kunci POV has .is-locked class');
  assert(s6.labelText === 'Keluar POV', `Button label changed to Keluar POV (got: ${s6.labelText})`);
  assert(s6.badgeText.includes('Kunci POV'), `Status badge displays Kunci POV (got: ${s6.badgeText})`);
  assert(s6.posXWhenTurnRight < 0, `Turning device right shifts virtual model to the left (posX: ${s6.posXWhenTurnRight.toFixed(3)})`);
  assert(s6.posZWhenTurnRight < 0, `Model remains in front of camera (posZ: ${s6.posZWhenTurnRight.toFixed(3)})`);
  assert(Math.abs(s6.posXAfterRecenter) < 0.05, `RecenterModel brought model back to center (posX: ${s6.posXAfterRecenter.toFixed(3)})`);
  assert(s6.modeAfterExit === 'MARKER_TRACKED', `Exiting POV returned to MARKER_TRACKED (got: ${s6.modeAfterExit})`);
  assert(s6.btnLockedRemoved, '.is-locked class removed after exiting POV');

  // Step 7: Regression Check on Markers 0, 1, 2
  console.log('\n--- STEP 7: Regression Check on Markers 0, 1, 2 ---');
  const step7Res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      (() => {
        // Switch to Video
        window.KotakARSELNEL.switchActiveModule('video');
        const vActive = (window.KotakARSELNEL.state.activeModule === 'video');

        // Switch to Nota
        window.KotakARSELNEL.switchActiveModule('nota');
        const nActive = (window.KotakARSELNEL.state.activeModule === 'nota');

        // Switch to Kuiz
        window.KotakARSELNEL.switchActiveModule('kuiz');
        const kActive = (window.KotakARSELNEL.state.activeModule === 'kuiz');

        return { vActive, nActive, kActive };
      })()
    `,
    returnByValue: true
  }, cdpId++);

  const s7 = step7Res.result.value;
  assert(s7.vActive, 'Module Video switches cleanly without errors');
  assert(s7.nActive, 'Module Nota switches cleanly without errors');
  assert(s7.kActive, 'Module Kuiz switches cleanly without errors');

  console.log('\n🎉 ALL FASA 4D-D AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  ws.close();
  cleanup();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
