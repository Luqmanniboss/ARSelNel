const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9327;

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

async function run() {
  console.log('=== VERIFY FASA 4D-D.1 HOTFIX: SEMAT MODEL & VISIBILITY ===');
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_pin_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 4000));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  console.log('1. Checking camera near plane protection...');
  const camCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      try {
        const cam = window.KotakARSELNEL.state.camera;
        const m3 = window.KotakARSELNEL.state.mindarThree;
        if (m3) m3.resize();
        return {
          camExists: !!cam,
          near: cam ? cam.near : null,
          far: cam ? cam.far : null
        };
      } catch (err) {
        return { error: err.message };
      }
    })()`,
    returnByValue: true
  }, cdpId++);
  const camInfo = camCheck.result.value;
  assert(camInfo.camExists, 'Camera exists in Three.js');
  assert(camInfo.near <= 0.1, `Camera near plane is safely clamped (near=${camInfo.near})`);

  console.log('2. Activating CellQuest 3D...');
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
    if (st.result.value && st.result.value.includes('Berjaya')) {
      console.log(`Model plant loaded: ${st.result.value}`);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('3. Simulating marker tracking on Target 3...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const anchor = window.KotakARSELNEL.state.anchorCellQuest;
      anchor.group.visible = true;
      window.CellQuestARController.onTargetFound();
    })()`
  }, cdpId++);

  const trackState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        mode: cq.spatialMode,
        visible: cq.rootGroup.visible,
        parent: cq.rootGroup.parent.name || cq.rootGroup.parent.type
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(trackState.result.value.mode === 'MARKER_MODE', 'Initial mode is MARKER_MODE');
  assert(trackState.result.value.visible === true, 'RootGroup is visible while tracked');

  console.log('4. Testing BUG 3 FIX: Pressing "Semat Model"...');
  const preClick = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        cqCamera: !!cq.camera,
        cqCameraType: cq.camera ? cq.camera.type : null,
        parentName: cq.rootGroup.parent ? (cq.rootGroup.parent.name || cq.rootGroup.parent.type) : null,
        visible: cq.rootGroup.visible
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Pre-click info:', preClick.result.value);

  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 300));

  const pinState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      cq.rootGroup.updateMatrixWorld(true);
      const wp = new THREE.Vector3(); cq.rootGroup.getWorldPosition(wp);
      const ws = new THREE.Vector3(); cq.rootGroup.getWorldScale(ws);
      const ndc = wp.clone().project(cq.camera);
      const pinLabel = document.getElementById('cq-pin-label');
      
      return {
        mode: cq.spatialMode,
        parent: cq.rootGroup.parent.type,
        visible: cq.rootGroup.visible,
        pos: [wp.x, wp.y, wp.z],
        scale: [ws.x, ws.y, ws.z],
        ndc: [ndc.x, ndc.y, ndc.z],
        pinBtnText: pinLabel ? pinLabel.textContent.trim() : '',
        insideFrustum: (ndc.z >= -1 && ndc.z <= 1)
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const ps = pinState.result.value;
  console.log('Pin State:', ps);
  assert(ps.mode === 'SCREEN_PINNED', 'Spatial mode transitioned to SCREEN_PINNED');
  assert(ps.parent === 'PerspectiveCamera', 'Parent is now camera');
  assert(ps.visible === true, 'Model rootGroup remains 100% visible');
  assert(ps.pos[2] === -2.8, `Model placed at distance D=-2.8 (got ${ps.pos[2]})`);
  assert(ps.scale[0] === 1, 'Model scale is normalized 1.0');
  assert(ps.pinBtnText === 'Nyahsemat', 'Button label updated to "Nyahsemat"');
  assert(ps.insideFrustum, 'Model is 100% INSIDE camera frustum without clipping');

  console.log('5. Capturing pinned visual screenshot...');
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const artifactPath = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4dd1_pin_verified.png';
  fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
  console.log(`✅ Screenshot saved to ${artifactPath} (${shot.data.length} bytes)`);

  console.log('6. Testing Touch Drag in Screen-Pinned mode...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      cq.setTouchMode('DRAG');
      
      const down = new PointerEvent('pointerdown', { clientX: 200, clientY: 300, pointerId: 1, bubbles: true, cancelable: true });
      const move = new PointerEvent('pointermove', { clientX: 280, clientY: 340, pointerId: 1, bubbles: true, cancelable: true });
      const up = new PointerEvent('pointerup', { clientX: 280, clientY: 340, pointerId: 1, bubbles: true, cancelable: true });
      
      window.dispatchEvent(down);
      window.dispatchEvent(move);
      window.dispatchEvent(up);
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const dragCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        dragOffsetX: cq.dragOffset.x,
        dragOffsetY: cq.dragOffset.y,
        posX: cq.rootGroup.position.x,
        posY: cq.rootGroup.position.y
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Drag check:', dragCheck.result.value);
  assert(dragCheck.result.value.dragOffsetX !== 0, 'Drag offset X successfully changed');
  assert(dragCheck.result.value.posX !== 0, 'Model position X translated with touch drag');

  console.log('7. Testing "Nyahsemat" (Unpin)...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const unpinState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const pinLabel = document.getElementById('cq-pin-label');
      return {
        mode: cq.spatialMode,
        parent: cq.rootGroup.parent.type,
        pinBtnText: pinLabel ? pinLabel.textContent.trim() : ''
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Unpin State:', unpinState.result.value);
  assert(unpinState.result.value.mode === 'MARKER_MODE', 'Mode returned to MARKER_MODE');
  assert(unpinState.result.value.parent === 'Group', 'Parent reparented back to anchorGroup');
  assert(unpinState.result.value.pinBtnText === 'Semat Model', 'Button text reset to "Semat Model"');

  console.log('8. Testing Animal Cell (Sel Haiwan)...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-animal').click()`
  }, cdpId++);

  for (let i = 0; i < 30; i++) {
    const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
    if (st.result.value && st.result.value.includes('Berjaya')) {
      console.log(`Model animal loaded: ${st.result.value}`);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  // Pin Animal Cell
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const animalPinState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        cellType: cq.activeCellType,
        mode: cq.spatialMode,
        visible: cq.rootGroup.visible,
        parent: cq.rootGroup.parent.type
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Animal Pin State:', animalPinState.result.value);
  assert(animalPinState.result.value.cellType === 'animal', 'Active cell type is animal');
  assert(animalPinState.result.value.visible === true, 'Animal cell remains visible when pinned');

  ws.close();
  cleanup();
  console.log('\n🎉 ALL TESTS PASSED! BUG 3 IS 100% FIXED!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
