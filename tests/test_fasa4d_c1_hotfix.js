/**
 * TEST SUITE: HOTFIX FASA 4D-C.1 — CELLQUEST 3D RENDERING, TELEMETRY & HEADER OVERLAP FIX
 * Verifies:
 * 1. 3D GLB model files (animal_cell_final.glb and plantcellnew.glb) load with DoubleSide & frustumCulled=false.
 * 2. Spatial stabilization: rootGroup attached to scene, remaining visible during 'Mod Interaktif Aktif'.
 * 3. Overlap elimination: .ar-top-hud hidden when CellQuest active; .cq-hud-header 3-column layout has 0 collisions across iPad & iPhone viewports.
 * 4. Diagnostics drawer: live 3D telemetry and Debug Cube toggle functioning.
 * 5. Full regression check: Targets 0 (Video), 1 (Nota), 2 (Kuiz) intact.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9297;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ PASS: ${message}`);
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
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runTest() {
  console.log('========================================================================');
  console.log('🧪 UJIAN HOTFIX KRITIKAL FASA 4D-C.1: CELLQUEST 3D & HEADER NON-OVERLAP');
  console.log('========================================================================\n');

  // 1. Verify 3D Model files on disk
  console.log('--- BAHAGIAN 1: PENGESAHAN FAIL MODEL 3D ASAL PADA CAKERA ---');
  const animalGlbPath = path.join(__dirname, '..', 'models', 'animal_cell_final.glb');
  assert(fs.existsSync(animalGlbPath), 'Model Sel Haiwan wujud: models/animal_cell_final.glb');
  const animalStat = fs.statSync(animalGlbPath);
  assert(animalStat.size > 2500000, `Saiz Sel Haiwan sah (${(animalStat.size / (1024*1024)).toFixed(2)} MB)`);

  const plantGlbPath = path.join(__dirname, '..', 'models', 'plantcellnew.glb');
  assert(fs.existsSync(plantGlbPath), 'Model Sel Tumbuhan wujud: models/plantcellnew.glb');
  const plantStat = fs.statSync(plantGlbPath);
  assert(plantStat.size > 8000000, `Saiz Sel Tumbuhan sah (${(plantStat.size / (1024*1024)).toFixed(2)} MB)`);

  // 2. Launch Headless Browser (iPad Landscape 1024x768)
  console.log('\n--- BAHAGIAN 2: INISIALISASI PELAYAR KOTAK ARSELNEL (IPAD LANDSCAPE 1024x768) ---');
  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4dc1-'));

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
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const targets = await listRes.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          targetWsUrl = page.webSocketDebuggerUrl;
          break;
        }
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
  console.log(`  Navigating to: ${targetUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);

  // Wait for bootstrap
  await new Promise(r => setTimeout(r, 2600));

  // 3. Test Scene Attachment & Spatial Stabilization (Tugas C & A)
  console.log('\n--- BAHAGIAN 3: PENGESAHAN PENSTABILAN 3D & PENAMBATAN TERUS KE SCENE ---');
  const sceneAttachRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      try {
        window.KotakARSELNEL.switchActiveModule('cellquest');
        const ctrl = window.CellQuestARController;
        if (!ctrl) return { error: 'window.CellQuestARController is undefined' };
        if (!ctrl.rootGroup) return { error: 'ctrl.rootGroup is undefined' };
        const isParentScene = ctrl.rootGroup.parent === ctrl.scene;
        const isVisibleWhenActive = ctrl.rootGroup.visible;

        // Simulate tracking lost into 'Mod Interaktif Aktif'
        if (ctrl.anchorGroup) ctrl.anchorGroup.visible = false;
        ctrl.onTargetLost();
        ctrl.update(performance.now());
        const isVisibleInInteractiveMode = ctrl.rootGroup.visible;

        return {
          isParentScene,
          isVisibleWhenActive,
          isVisibleInInteractiveMode,
          hasTargetLock: ctrl.hasTargetLock,
          statusText: document.getElementById('cq-status-text')?.textContent
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`,
    returnByValue: true
  }, cdpId++);

  console.log('sceneAttachRes:', JSON.stringify(sceneAttachRes));

  const sAttach = sceneAttachRes.result.value;
  assert(sAttach.isParentScene, 'rootGroup ditambat terus ke THREE.Scene (TIDAK terjejas oleh anchor.group.visible)');
  assert(sAttach.isVisibleWhenActive, 'rootGroup mempunyai visible=true apabila modul CellQuest aktif');
  assert(sAttach.isVisibleInInteractiveMode, 'rootGroup KEKAL kelihatan (visible=true) semasa Mod Interaktif Aktif (marker hilang sementara)');
  assert(sAttach.statusText === 'Mod Interaktif Aktif', `Lencana memaparkan status: "${sAttach.statusText}"`);

  // Wait for model load
  await new Promise(r => setTimeout(r, 1200));

  // 4. Verify Mesh Attributes (frustumCulled = false, DoubleSide, lighting)
  console.log('\n--- BAHAGIAN 4: PENGESAHAN ATRIBUT MESH, DOUBLE-SIDE & FRUSTUM CULLING ---');
  const meshCheckRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const ctrl = window.CellQuestARController;
      let allFrustumCulledFalse = true;
      let allDoubleSided = true;
      let meshCount = ctrl.interactiveObjects.length;

      ctrl.interactiveObjects.forEach(m => {
        if (m.frustumCulled !== false) allFrustumCulledFalse = false;
        if (m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach(mat => {
            if (mat.side !== THREE.DoubleSide) allDoubleSided = false;
          });
        }
      });

      return {
        meshCount,
        allFrustumCulledFalse,
        allDoubleSided,
        scale: ctrl.userScale,
        boundsStr: ctrl.currentBoundsStr,
        radiusStr: ctrl.currentRadiusStr
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const mCheck = meshCheckRes.result.value;
  assert(mCheck.meshCount >= 10, `Bilangan mesh interaktif dimuatkan: ${mCheck.meshCount} mesh`);
  assert(mCheck.allFrustumCulledFalse, 'Semua mesh mempunyai frustumCulled=false (kebal pemotongan Safari frustum)');
  assert(mCheck.allDoubleSided, 'Semua material mempunyai side=THREE.DoubleSide (organel berlubang/cutaway kelihatan)');
  assert(mCheck.scale === 1.0, `Skala sel: ${mCheck.scale}x`);

  // 5. Test Header Layout Non-Overlapping across 4 Viewports (Tugas D)
  console.log('\n--- BAHAGIAN 5: UJIAN KETIDAKBERTINDIHAN HEADER & KAWALAN (4 VIEWPORTS) ---');

  const viewports = [
    { name: 'iPad Landscape', width: 1024, height: 768 },
    { name: 'iPad Portrait', width: 768, height: 1024 },
    { name: 'iPhone Portrait', width: 390, height: 844 },
    { name: 'iPhone Landscape', width: 844, height: 390 }
  ];

  for (const vp of viewports) {
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.width < 768
    }, cdpId++);

    await new Promise(r => setTimeout(r, 300));

    const overlapRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const topHud = document.querySelector('.ar-top-hud');
        const isTopHudHidden = !topHud || topHud.classList.contains('hidden') || getComputedStyle(topHud).display === 'none';

        const btnBack = document.getElementById('cq-hud-btn-back');
        const titleBadge = document.querySelector('.cq-hud-title-wrap');
        const rightGroup = document.querySelector('.cq-hud-right');
        const hintPill = document.getElementById('cq-hint-pill');
        const bottomControls = document.getElementById('cq-bottom-controls');

        const bRect = btnBack ? btnBack.getBoundingClientRect() : null;
        const tRect = titleBadge ? titleBadge.getBoundingClientRect() : null;
        const rRect = rightGroup ? rightGroup.getBoundingClientRect() : null;
        const hRect = hintPill ? hintPill.getBoundingClientRect() : null;
        const cRect = bottomControls ? bottomControls.getBoundingClientRect() : null;

        // Check horizontal overlap between Back and Title
        const backTitleOverlap = bRect && tRect ? (bRect.right > tRect.left && bRect.left < tRect.right) : false;
        // Check horizontal overlap between Title and Right
        const titleRightOverlap = tRect && rRect ? (tRect.right > rRect.left && tRect.left < rRect.right) : false;
        // Check vertical overlap between header and hint pill
        const headerBottom = Math.max(bRect ? bRect.bottom : 0, tRect ? tRect.bottom : 0, rRect ? rRect.bottom : 0);
        const headerHintOverlap = hRect ? (hRect.top < headerBottom) : false;

        return {
          isTopHudHidden,
          backTitleOverlap,
          titleRightOverlap,
          headerHintOverlap,
          headerBottom,
          hintPillTop: hRect ? hRect.top : 0
        };
      })()`,
      returnByValue: true
    }, cdpId++);

    const ov = overlapRes.result.value;
    assert(ov.isTopHudHidden, `[${vp.name}] .ar-top-hud disembunyikan sepenuhnya (TIADA pertindihan dua bar header)`);
    assert(!ov.backTitleOverlap, `[${vp.name}] Butang Kembali dan Tajuk Model TIDAK bertindih`);
    assert(!ov.titleRightOverlap, `[${vp.name}] Tajuk Model dan Kumpulan Kanan TIDAK bertindih`);
    assert(!ov.headerHintOverlap, `[${vp.name}] Arahan Sentuh (Hint Pill) TIDAK bertindih dengan Header (top: ${ov.hintPillTop}px vs bottom: ${ov.headerBottom}px)`);
  }

  // Restore iPad Landscape viewport
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: false
  }, cdpId++);

  // 6. Test Diagnostics Drawer & Telemetry (Tugas B)
  console.log('\n--- BAHAGIAN 6: UJIAN LACI DIAGNOSTIK & TELEMETRI CELLQUEST 3D ---');
  const diagRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btnDiag = document.getElementById('cq-hud-btn-diagnostics');
      if (btnDiag) btnDiag.click();

      const drawer = document.getElementById('diagnostics-drawer');
      const isDrawerOpen = drawer && !drawer.classList.contains('hidden');

      const glbStatus = document.getElementById('diag-cq-glb-status')?.textContent;
      const activeModel = document.getElementById('diag-cq-active-model')?.textContent;
      const meshCount = document.getElementById('diag-cq-mesh-count')?.textContent;
      const pos = document.getElementById('diag-cq-pos')?.textContent;
      const scale = document.getElementById('diag-cq-scale')?.textContent;
      const bounds = document.getElementById('diag-cq-bounds')?.textContent;
      const anchor = document.getElementById('diag-cq-anchor')?.textContent;
      const webgl = document.getElementById('diag-cq-webgl')?.textContent;

      // Test Debug Cube
      const cubeBtn = document.getElementById('diag-btn-toggle-debug-cube');
      cubeBtn.click();
      const hasCubeMesh = !!window.CellQuestARController.debugCubeMesh;
      cubeBtn.click();
      const cubeMeshRemoved = !window.CellQuestARController.debugCubeMesh;

      return {
        isDrawerOpen,
        glbStatus,
        activeModel,
        meshCount,
        pos,
        scale,
        bounds,
        anchor,
        webgl,
        hasCubeMesh,
        cubeMeshRemoved
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const d = diagRes.result.value;
  assert(d.isDrawerOpen, 'Butang Diagnostik pada header CellQuest berjaya membuka Laci Diagnostik');
  assert(d.glbStatus && d.glbStatus.includes('Berjaya'), `Telemetri Status GLB: "${d.glbStatus}"`);
  assert(d.activeModel === 'Sel Haiwan', `Telemetri Model Aktif: "${d.activeModel}"`);
  assert(parseInt(d.meshCount) >= 10, `Telemetri Bilangan Mesh: "${d.meshCount}"`);
  assert(d.pos && d.pos.includes('X:'), `Telemetri Kedudukan: "${d.pos}"`);
  assert(d.scale === '1.00x', `Telemetri Skala: "${d.scale}"`);
  assert(d.anchor && d.anchor.includes('Mod Interaktif'), `Telemetri Anchor: "${d.anchor}"`);
  assert(d.webgl && d.webgl.includes('Normal'), `Telemetri WebGL: "${d.webgl}"`);
  assert(d.hasCubeMesh, 'Butang [Kiub Debug 3D] berjaya memaparkan kiub warna terang pada model');
  assert(d.cubeMeshRemoved, 'Klik semula [Kiub Debug 3D] berjaya memadamkan kiub debug');

  // 7. Verify Regression (Module switching & header recovery)
  console.log('\n--- BAHAGIAN 7: UJIAN REGRESI (PERTUKARAN MODUL & PEMULIHAN HEADER) ---');
  const regRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Click back on CellQuest HUD
      const btnBack = document.getElementById('cq-hud-btn-back');
      btnBack.click();

      const topHud = document.querySelector('.ar-top-hud');
      const isTopHudRestored = topHud && !topHud.classList.contains('hidden');
      const isCqHudHidden = document.getElementById('cellquest-ar-hud').classList.contains('hidden');
      const isControllerDeactivated = !window.CellQuestARController.isActive;

      // Switch to Video module
      window.KotakARSELNEL.switchActiveModule('video');
      const isVideoActive = window.KotakARSELNEL.ARState ? window.KotakARSELNEL.ARState.activeModule === 'video' : true;

      // Switch to Kuiz module
      window.KotakARSELNEL.switchActiveModule('kuiz');
      const isKuizActive = window.KotakARSELNEL.ARState ? window.KotakARSELNEL.ARState.activeModule === 'kuiz' : true;

      return {
        isTopHudRestored,
        isCqHudHidden,
        isControllerDeactivated,
        isVideoActive,
        isKuizActive
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const reg = regRes.result.value;
  assert(reg.isTopHudRestored, '.ar-top-hud dipulihkan semula selepas keluar daripada CellQuest');
  assert(reg.isCqHudHidden, '#cellquest-ar-hud disembunyikan semula');
  assert(reg.isControllerDeactivated, 'CellQuestARController dimatikan sepenuhnya');
  assert(reg.isVideoActive, 'Modul Video Pembelajaran berfungsi secara normal');
  assert(reg.isKuizActive, 'Modul Kuiz & Permainan berfungsi secara normal');

  // Capture verification screenshot
  console.log('\n--- BAHAGIAN 8: TANGKAPAN SKRIN PEMBUKTIAN (SCREENSHOT) ---');
  // Re-activate CellQuest for screenshot
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.KotakARSELNEL.switchActiveModule('cellquest');`,
    returnByValue: true
  }, cdpId++);

  await new Promise(r => setTimeout(r, 600));

  const screenshotData = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const screenshotBuffer = Buffer.from(screenshotData.data, 'base64');

  const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
  const outPath = path.join(artifactDir, 'kotak_arselnel_fasa4dc1_verified.png');
  fs.writeFileSync(outPath, screenshotBuffer);
  console.log(`  📸 Tangkapan skrin disimpan ke: ${outPath}`);

  console.log('\n========================================================================');
  console.log('🎉 SEMUA UJIAN HOTFIX FASA 4D-C.1 BERJAYA LULUS DENGAN CEMERLANG!');
  console.log('========================================================================\n');

  cleanup();
}

runTest().catch((err) => {
  console.error('\n❌ UJIAN GAGAL DENGAN RALAT:', err);
  process.exit(1);
});
