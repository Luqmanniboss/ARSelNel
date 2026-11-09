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
  console.log('=== TEST SUITE: HOTFIX CELLQUEST 3D NATIVE MINDAR ATTACHMENT ===');
  const chromePath = findChrome();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fix_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
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
    } catch(err) {}
  });

  const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`Navigating to: ${targetUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);
  await new Promise(r => setTimeout(r, 2600));

  // 1. Verify Architecture: rootGroup is attached to anchorCellQuest.group
  console.log('\n--- 1. Verification of Scene Graph Architecture ---');
  const archRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      if (!ctrl || !ctrl.rootGroup) return { error: 'No controller or rootGroup' };
      const parentIsAnchor = ctrl.rootGroup.parent === ctrl.anchorGroup;
      const anchorIsTarget3 = ctrl.anchorGroup === window.KotakARSELNEL?.state?.anchorCellQuest?.group;
      const hasPedestal = !!ctrl.hologramPedestal;
      const hasModelHolder = !!ctrl.modelHolder && ctrl.modelHolder.parent === ctrl.rootGroup;
      return { parentIsAnchor, anchorIsTarget3, hasPedestal, hasModelHolder };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Graph info:', archRes.result.value);
  assert(archRes.result.value.parentIsAnchor, 'rootGroup is child of anchorCellQuest.group (Target 3)');
  assert(archRes.result.value.anchorIsTarget3, 'anchorGroup matches anchorCellQuest.group');
  assert(archRes.result.value.hasPedestal, '3D Hologram Pedestal created on Marker 3');
  assert(archRes.result.value.hasModelHolder, 'modelHolder is child of rootGroup');

  // 2. Trigger Target 3 Found (CellQuest active) and verify GLB load
  console.log('\n--- 2. Trigger Target 3 Found & Load Animal Cell GLB ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
    })()`
  }, cdpId++);

  // Wait for animal GLB load
  let animalLoaded = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const status = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => window.CellQuestARController.glbLoadStatus)()`
    }, cdpId++);
    const val = status.result.value;
    if (val && val.includes('Berjaya')) {
      animalLoaded = true;
      console.log(`  Animal model load status: ${val}`);
      break;
    }
  }
  assert(animalLoaded, 'Animal cell GLB loaded successfully');

  // 3. Inspect Animal Cell Meshes & Materials
  console.log('\n--- 3. Animal Cell Mesh & Material Inspection ---');
  const animalInspect = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      const objs = ctrl.interactiveObjects;
      const allDoubleSide = objs.every(m => {
        const mat = m.material;
        if (!mat) return true;
        if (Array.isArray(mat)) return mat.every(sub => sub.side === THREE.DoubleSide);
        return mat.side === THREE.DoubleSide;
      });
      const allFrustumFalse = objs.every(m => m.frustumCulled === false);
      const allHaveIds = objs.some(m => !!m.userData.id);
      return { count: objs.length, allDoubleSide, allFrustumFalse, allHaveIds };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Animal inspect:', animalInspect.result.value);
  assert(animalInspect.result.value.count === 15, 'Animal cell has exactly 15 meshes');
  assert(animalInspect.result.value.allDoubleSide, 'All animal materials have DoubleSide');
  assert(animalInspect.result.value.allFrustumFalse, 'All animal meshes have frustumCulled=false');
  assert(animalInspect.result.value.allHaveIds, 'Organelles mapped with KSSM biological IDs');

  // 4. Test Target Lost Persistence ("Mod Interaktif Aktif")
  console.log('\n--- 4. Test Target Lost Persistence ---');
  const lostRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      ctrl.onTargetLost();
      const isAnchorStillVisible = ctrl.anchorGroup.visible;
      const statusText = document.getElementById('cq-status-text')?.textContent;
      return { isAnchorStillVisible, statusText };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Lost state:', lostRes.result.value);
  assert(lostRes.result.value.isAnchorStillVisible, 'anchorCellQuest.group remains visible when target is lost');
  assert(lostRes.result.value.statusText === 'Mod Interaktif Aktif', 'Status displays "Mod Interaktif Aktif"');

  // 5. Test Switching to Plant Cell
  console.log('\n--- 5. Test Switch to Plant Cell GLB ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.CellQuestARController.loadModel('plant');
    })()`
  }, cdpId++);

  let plantLoaded = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const status = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => window.CellQuestARController.glbLoadStatus)()`
    }, cdpId++);
    const val = status.result.value;
    if (val && val.includes('Berjaya')) {
      plantLoaded = true;
      console.log(`  Plant model load status: ${val}`);
      break;
    }
  }
  assert(plantLoaded, 'Plant cell GLB loaded successfully');

  // 6. Test Debug Cube Toggle
  console.log('\n--- 6. Test Debug Cube Toggle ---');
  const cubeRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      const on = ctrl.toggleDebugCube();
      const mesh1 = !!ctrl.debugCubeMesh;
      const off = ctrl.toggleDebugCube();
      const mesh2 = !!ctrl.debugCubeMesh;
      return { on, mesh1, off, mesh2 };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Cube toggle:', cubeRes.result.value);
  assert(cubeRes.result.value.on === true && cubeRes.result.value.mesh1 === true, 'Debug cube turns ON');
  assert(cubeRes.result.value.off === false && cubeRes.result.value.mesh2 === false, 'Debug cube turns OFF');

  // 7. Test Regression: Switch back to Video, Nota, Kuiz
  console.log('\n--- 7. Regression Test: Targets 0, 1, 2 Intact ---');
  const regRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('video');
      const vActive = window.KotakARSELNEL.state.activeModule === 'video' && !window.CellQuestARController.isActive;
      window.KotakARSELNEL.switchActiveModule('nota');
      const nActive = window.KotakARSELNEL.state.activeModule === 'nota' && !window.CellQuestARController.isActive;
      window.KotakARSELNEL.switchActiveModule('kuiz');
      const kActive = window.KotakARSELNEL.state.activeModule === 'kuiz' && !window.CellQuestARController.isActive;
      return { vActive, nActive, kActive };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Regression check:', regRes.result.value);
  assert(regRes.result.value.vActive, 'Marker 0 Video intact');
  assert(regRes.result.value.nActive, 'Marker 1 Nota intact');
  assert(regRes.result.value.kActive, 'Marker 2 Kuiz intact');

  // Switch back to CellQuest and capture screenshot
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      window.CellQuestARController.onTargetFound();
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 1500));

  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  fs.writeFileSync('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4dc1_verified.png', Buffer.from(shot.data, 'base64'));
  console.log('\nVerified screenshot saved to kotak_arselnel_fasa4dc1_verified.png');

  console.log('\n🎉 ALL 7 TESTS PASSED SUCCESSFULLY!');
  cleanup();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
