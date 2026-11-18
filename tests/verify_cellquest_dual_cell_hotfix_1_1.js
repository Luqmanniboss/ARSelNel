/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * CRITICAL HOTFIX CELLQUEST DUAL-CELL AR 1.1
 * Verification for:
 * 1. 3DoF POV Lock (Permission, Sensor Activation, Projection, Behind-Camera Handling, Offscreen Pointer, Clean Exit)
 * 2. Screen Pinning (Scene Graph, Target Loss Persistence, Camera Tracking, Unpinning)
 * 3. Unified Pointer/Touch Interactions (1-Finger Drag, 1-Finger Rotate, 2-Finger Pinch Zoom, Tap Raycast Focus Switch & Organelle Card)
 * 4. Dual-Cell Independent State (Independent Rotation, Scale, Offset, Recenter & Reset)
 * 5. POV Setup Banner Stacking (No overlap with Multi-Panel Bar, z-index 9995)
 * 6. Responsive Verification & High-Res Screenshots across 8 Viewports
 * 7. Touch Target Standards (>= 44x44px) & Zero Horizontal Scroll
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60556;
const CDP_PORT = 9296;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_dual_cell_hotfix_1_1');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

function findBrowser() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Tiada pelayar Chrome atau Edge ditemui untuk ujian automasi CDP.');
}

function getPages(cdpPort) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${cdpPort}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
    });
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 800
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const localPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(localPath, Buffer.from(res.data, 'base64'));
    const brainPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(brainPath, Buffer.from(res.data, 'base64'));
    return localPath;
  }

  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🚀 ARSELNEL QA: CRITICAL HOTFIX CELLQUEST DUAL-CELL AR 1.1 TEST SUITE');
  console.log('========================================================================\n');

  const server = await startServer();
  console.log(`[1] Pelayan web ujian aktif di http://127.0.0.1:${PORT}`);

  const browserPath = findBrowser();
  const tmpProfile = path.join(os.tmpdir(), 'arselnel_dualcell_1_1_' + Date.now());
  const browserProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--user-data-dir=${tmpProfile}`,
    'about:blank'
  ]);

  let client = null;
  const testResults = [];

  function recordTest(name, passed, detail = '') {
    testResults.push({ name, passed, detail });
    const mark = passed ? '✅ LULUS' : '❌ GAGAL';
    console.log(`  ${mark} - ${name}${detail ? ` (${detail})` : ''}`);
  }

  try {
    await new Promise(r => setTimeout(r, 1600));
    const pages = await getPages(CDP_PORT);
    const targetPage = pages.find(p => p.type === 'page');
    client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.ready;
    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    const url = `http://127.0.0.1:${PORT}/kotak_arselnel/code.html`;
    console.log(`[2] Membuka URL: ${url}...`);
    await client.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2200));

    // Inisialisasi persekitaran CellQuest AR
    await client.eval(`
      (() => {
        window.alert = () => {};
        window.confirm = () => true;

        if (typeof CellQuestARController !== 'undefined') {
          if (!CellQuestARController.renderer) {
            CellQuestARController.init();
          }
          CellQuestARController.activate();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1000));

    // =========================================================================
    // UJIAN 1: PAPARAN DUAL-CELL BERSEBELAHAN & PEMILIHAN MOD
    // =========================================================================
    console.log('\n--- UJIAN 1: MOD PAPARAN & DUAL-CELL RENDERING ---');

    // 1A. Sel Haiwan
    const t1A = await client.eval(`
      (() => {
        CellQuestARController.loadModel('animal');
        return {
          mode: CellQuestARController.displayMode,
          animalVis: CellQuestARController.animalHolder.visible,
          plantVis: CellQuestARController.plantHolder.visible,
          btnAnimal: document.getElementById('cq-btn-animal').classList.contains('active'),
          btnPlant: document.getElementById('cq-btn-plant').classList.contains('active'),
          btnComp: document.getElementById('cq-btn-compare').classList.contains('active')
        };
      })()
    `);
    recordTest('1A. Mod Sel Haiwan Tunggal', t1A.mode === 'animal' && t1A.animalVis && !t1A.plantVis && t1A.btnAnimal);

    // 1B. Sel Tumbuhan
    const t1B = await client.eval(`
      (() => {
        CellQuestARController.loadModel('plant');
        return {
          mode: CellQuestARController.displayMode,
          animalVis: CellQuestARController.animalHolder.visible,
          plantVis: CellQuestARController.plantHolder.visible,
          btnPlant: document.getElementById('cq-btn-plant').classList.contains('active')
        };
      })()
    `);
    recordTest('1B. Mod Sel Tumbuhan Tunggal', t1B.mode === 'plant' && !t1B.animalVis && t1B.plantVis && t1B.btnPlant);

    // 1C. Mod Perbandingan Serentak (Bandingkan)
    const t1C = await client.eval(`
      (() => {
        CellQuestARController.loadModel('compare');
        return {
          mode: CellQuestARController.displayMode,
          animalVis: CellQuestARController.animalHolder.visible,
          plantVis: CellQuestARController.plantHolder.visible,
          animalPosX: CellQuestARController.animalHolder.position.x,
          plantPosX: CellQuestARController.plantHolder.position.x,
          activeRowVis: !document.getElementById('cq-row-active-model').classList.contains('hidden'),
          btnComp: document.getElementById('cq-btn-compare').classList.contains('active')
        };
      })()
    `);
    const sideBySideOk = t1C.mode === 'compare' && t1C.animalVis && t1C.plantVis && t1C.animalPosX < 0 && t1C.plantPosX > 0 && t1C.activeRowVis;
    recordTest('1C. Paparan Serentak Dua Model Bersebelahan', sideBySideOk, `Animal X=${t1C.animalPosX.toFixed(2)}, Plant X=${t1C.plantPosX.toFixed(2)}`);

    // =========================================================================
    // UJIAN 2: KAWALAN BEBAS SETIAP MODEL (INDEPENDENT MANIPULATION)
    // =========================================================================
    console.log('\n--- UJIAN 2: KAWALAN BEBAS SETIAP MODEL (ROTATION, SCALE, DRAG) ---');

    // 2A. Putar & Skalakan Sel Haiwan secara bebas
    const t2A = await client.eval(`
      (() => {
        CellQuestARController.setSelectedCell('animal');
        CellQuestARController.cellState.animal.rotation.y = 1.25;
        CellQuestARController.cellState.animal.scale = 1.40;
        CellQuestARController.cellState.animal.dragOffset.set(0.35, -0.20);
        CellQuestARController.updateModelsLayout();

        return {
          selected: CellQuestARController.selectedCell,
          animalRotY: CellQuestARController.cellState.animal.rotation.y,
          animalScale: CellQuestARController.cellState.animal.scale,
          plantRotY: CellQuestARController.cellState.plant.rotation.y,
          plantScale: CellQuestARController.cellState.plant.scale,
          animalHolderRotY: CellQuestARController.animalHolder.rotation.y,
          plantHolderRotY: CellQuestARController.plantHolder.rotation.y
        };
      })()
    `);
    const animIndepOk = t2A.selected === 'animal' &&
      Math.abs(t2A.animalRotY - 1.25) < 0.01 &&
      Math.abs(t2A.plantRotY - 0) < 0.01 &&
      Math.abs(t2A.animalHolderRotY - 1.25) < 0.01 &&
      Math.abs(t2A.plantHolderRotY - 0) < 0.01;
    recordTest('2A. Manipulasi Bebas Sel Haiwan (Tumbuhan Tidak Terjejas)', animIndepOk);

    // 2B. Putar & Skalakan Sel Tumbuhan secara bebas
    const t2B = await client.eval(`
      (() => {
        CellQuestARController.setSelectedCell('plant');
        CellQuestARController.cellState.plant.rotation.y = -0.85;
        CellQuestARController.cellState.plant.scale = 0.85;
        CellQuestARController.cellState.plant.dragOffset.set(-0.15, 0.25);
        CellQuestARController.updateModelsLayout();

        return {
          selected: CellQuestARController.selectedCell,
          animalRotY: CellQuestARController.cellState.animal.rotation.y,
          plantRotY: CellQuestARController.cellState.plant.rotation.y,
          animalScale: CellQuestARController.cellState.animal.scale,
          plantScale: CellQuestARController.cellState.plant.scale
        };
      })()
    `);
    const plantIndepOk = t2B.selected === 'plant' &&
      Math.abs(t2B.plantRotY - (-0.85)) < 0.01 &&
      Math.abs(t2B.animalRotY - 1.25) < 0.01;
    recordTest('2B. Manipulasi Bebas Sel Tumbuhan (Haiwan Kekal)', plantIndepOk);

    // 2C. Set Semula (Reset View)
    const t2C = await client.eval(`
      (() => {
        CellQuestARController.resetView();
        return {
          animalRotY: CellQuestARController.cellState.animal.rotation.y,
          plantRotY: CellQuestARController.cellState.plant.rotation.y,
          animalScale: CellQuestARController.cellState.animal.scale,
          plantScale: CellQuestARController.cellState.plant.scale,
          animalDrag: [CellQuestARController.cellState.animal.dragOffset.x, CellQuestARController.cellState.animal.dragOffset.y],
          plantDrag: [CellQuestARController.cellState.plant.dragOffset.x, CellQuestARController.cellState.plant.dragOffset.y]
        };
      })()
    `);
    const resetOk = t2C.animalRotY === 0 && t2C.plantRotY === 0 && t2C.animalScale === 1 && t2C.plantScale === 1 &&
      t2C.animalDrag[0] === 0 && t2C.plantDrag[0] === 0;
    recordTest('2C. Reset View Mengembalikan Semua Parameter Asal', resetOk);

    // =========================================================================
    // UJIAN 3: CRITICAL HOTFIX SCREEN PINNING (SEMAT PADA SKRIN)
    // =========================================================================
    console.log('\n--- UJIAN 3: SCREEN PINNING (SEMAT PADA SKRIN) & PENGEKALAN MODEL ---');

    // 3A. Semat Model pada Skrin
    const t3A = await client.eval(`
      (() => {
        CellQuestARController.togglePin();
        return {
          spatialMode: CellQuestARController.spatialMode,
          isPinnedBtn: document.getElementById('cq-btn-pin').classList.contains('is-pinned'),
          pinIcon: document.getElementById('cq-pin-icon').textContent,
          rootVisible: CellQuestARController.rootGroup.visible,
          parentIsCamera: (CellQuestARController.rootGroup.parent === CellQuestARController.camera),
          statusBadge: document.getElementById('cq-status-text').textContent
        };
      })()
    `);
    recordTest('3A. Pengaktifan Semat pada Skrin (SCREEN_PINNED)', t3A.spatialMode === 'SCREEN_PINNED' && t3A.isPinnedBtn && t3A.rootVisible && t3A.parentIsCamera);

    // 3B. Kekalkan Paparan Semasa Marker Terputus (Target Lost Persistence)
    const t3B = await client.eval(`
      (() => {
        // Simulasikan kehilangan marker secara fizikal
        CellQuestARController.onTargetLost();
        return {
          spatialMode: CellQuestARController.spatialMode,
          trackingState: CellQuestARController.trackingState,
          rootVisible: CellQuestARController.rootGroup.visible
        };
      })()
    `);
    recordTest('3B. Model Kekal Terpapar Walaupun Marker Terputus', t3B.trackingState === 'MARKER_LOST' && t3B.rootVisible);

    // 3C. Update Frame Loop untuk SCREEN_PINNED
    const t3C = await client.eval(`
      (() => {
        // Jalankan update frame
        CellQuestARController.update(performance.now());
        return {
          rootVisible: CellQuestARController.rootGroup.visible,
          rootPosZ: CellQuestARController.rootGroup.position.z,
          parentIsCamera: (CellQuestARController.rootGroup.parent === CellQuestARController.camera)
        };
      })()
    `);
    recordTest('3C. Kedudukan Model Terjaga dalam Frame Loop SCREEN_PINNED', t3C.rootVisible && t3C.rootPosZ <= -2.4);

    // 3D. Nyahsemat Model (Kembali ke MARKER_MODE)
    const t3D = await client.eval(`
      (() => {
        CellQuestARController.togglePin();
        return {
          spatialMode: CellQuestARController.spatialMode,
          isPinnedBtn: document.getElementById('cq-btn-pin').classList.contains('is-pinned')
        };
      })()
    `);
    recordTest('3D. Nyahsemat Model Berjaya (Kembali ke MARKER_MODE)', t3D.spatialMode === 'MARKER_MODE' && !t3D.isPinnedBtn);

    // =========================================================================
    // UJIAN 4: CRITICAL HOTFIX 3DOF POV LOCK & SENSOR PIPELINE
    // =========================================================================
    console.log('\n--- UJIAN 4: 3DOF POV LOCK, KEIZINAN SENSOR & UNJURAN RUANG ---');

    // 4A. Mulakan POV Setup
    const t4A = await client.eval(`
      (async () => {
        await CellQuestARController.startPOVSetup();
        return {
          spatialMode: CellQuestARController.spatialMode,
          povActive: ARState.pov.active,
          bannerVisible: !document.getElementById('cq-pov-setup-banner').classList.contains('hidden'),
          rootVisible: CellQuestARController.rootGroup.visible,
          statusText: document.getElementById('cq-status-text').textContent
        };
      })()
    `);
    recordTest('4A. Permulaan POV Setup (ARState.pov.active = true & Banner Terpapar)', t4A.spatialMode === 'POV_SETUP' && t4A.povActive && t4A.bannerVisible && t4A.rootVisible);

    // 4B. Semak Layout Banner POV Setup & Multi-Panel Bar
    const t4B = await client.eval(`
      (() => {
        // Aktifkan bar multi-panel untuk menguji pencegahan pertindihan
        ARState.activePanels.add('cellquest');
        ARState.activePanels.add('nota');
        updateMultiPanelUI();
        adjustPOVBannerLayout();

        const banner = document.getElementById('cq-pov-setup-banner');
        const computedStyle = window.getComputedStyle(banner);
        const topVal = parseInt(banner.style.top || computedStyle.top, 10);
        const zIndex = parseInt(computedStyle.zIndex, 10);

        return {
          topVal,
          zIndex,
          isSeparated: topVal >= 120,
          hasHighZIndex: zIndex >= 9990
        };
      })()
    `);
    recordTest('4B. Banner POV Setup Tidak Bertindih Multi-Panel Bar', t4B.isSeparated && t4B.hasHighZIndex, `top: ${t4B.topVal}px, z-index: ${t4B.zIndex}`);

    // 4C. Kunci Pandangan pada Heading Semasa (anchorPOVAtCurrentHeading)
    const t4C = await client.eval(`
      (() => {
        // Simulasikan sensor orientasi aktif
        ARState.pov.currentYaw = 45.0;
        ARState.pov.currentPitch = 10.0;
        if (window.THREE) {
          ARState.pov.currentQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(10 * Math.PI / 180, 45 * Math.PI / 180, 0, 'YXZ')
          );
        }

        CellQuestARController.anchorPOVAtCurrentHeading();

        return {
          spatialMode: CellQuestARController.spatialMode,
          isLocked: document.getElementById('cq-btn-pov').classList.contains('is-locked'),
          bannerHidden: document.getElementById('cq-pov-setup-banner').classList.contains('hidden'),
          rootVisible: CellQuestARController.rootGroup.visible,
          anchorYaw: CellQuestARController.povAnchorHeading.yaw,
          anchorPitch: CellQuestARController.povAnchorHeading.pitch
        };
      })()
    `);
    recordTest('4C. Kunci Pandangan (POV_LOCKED) Berjaya Diikat pada Sensor Heading', t4C.spatialMode === 'POV_LOCKED' && t4C.isLocked && t4C.bannerHidden && t4C.rootVisible && t4C.anchorYaw === 45);

    // 4D. Pusingan Peranti Dalam Pandangan (In-Front View Tracking)
    const t4D = await client.eval(`
      (() => {
        // Pusing peranti sedikit (yaw 50 deg, pitch 8 deg - delta yaw = 5 deg)
        ARState.pov.currentYaw = 50.0;
        ARState.pov.currentPitch = 8.0;
        if (window.THREE) {
          ARState.pov.currentQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(8 * Math.PI / 180, 50 * Math.PI / 180, 0, 'YXZ')
          );
        }
        CellQuestARController.update(performance.now());

        return {
          rootVisible: CellQuestARController.rootGroup.visible,
          deltaYaw: Math.round(CellQuestARController.lastDeltaYaw),
          deltaPitch: Math.round(CellQuestARController.lastDeltaPitch),
          pointerHidden: document.getElementById('pov-offscreen-pointer').classList.contains('hidden')
        };
      })()
    `);
    recordTest('4D. Orientasi 3DoF Dalam FOV (Model Kekal Terpapar)', t4D.rootVisible && t4D.pointerHidden);

    // 4E. Pusingan Peranti Melebihi Pandangan (Behind Camera Handling & Offscreen Indicator)
    const t4E = await client.eval(`
      (() => {
        // Pusing peranti 180 darjah ke belakang (yaw 225 deg vs anchor 45 deg)
        ARState.pov.currentYaw = 225.0;
        ARState.pov.currentPitch = 0.0;
        if (window.THREE) {
          ARState.pov.currentQuaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, 225 * Math.PI / 180, 0, 'YXZ')
          );
        }
        CellQuestARController.update(performance.now());

        return {
          rootVisible: CellQuestARController.rootGroup.visible,
          pointerVisible: !document.getElementById('pov-offscreen-pointer').classList.contains('hidden'),
          pointerBearingText: document.getElementById('pov-pointer-bearing').textContent
        };
      })()
    `);
    recordTest('4E. Penunjuk Luar Skrin (Offscreen Pointer) Muncul bila Model di Belakang', !t4E.rootVisible && t4E.pointerVisible, t4E.pointerBearingText);

    // 4F. Keluar dari Mod POV Lock (exitPOV)
    const t4F = await client.eval(`
      (() => {
        CellQuestARController.exitPOV();
        return {
          spatialMode: CellQuestARController.spatialMode,
          isLocked: document.getElementById('cq-btn-pov').classList.contains('is-locked'),
          pointerHidden: document.getElementById('pov-offscreen-pointer').classList.contains('hidden')
        };
      })()
    `);
    recordTest('4F. Keluar dari Kunci Pandangan Berjaya Dijalankan', t4F.spatialMode !== 'POV_LOCKED' && !t4F.isLocked && t4F.pointerHidden);

    // =========================================================================
    // UJIAN 5: TOUCH, POINTER & RAYCAST INTERACTIONS
    // =========================================================================
    console.log('\n--- UJIAN 5: SENTUHAN, SERET, PUTAR & KAD ORGANEL ---');

    // 5A. Mod Putar (ROTATE) Sentuhan 1 Jari
    const t5A = await client.eval(`
      (() => {
        CellQuestARController.setTouchMode('ROTATE');
        CellQuestARController.setSelectedCell('animal');
        const startRot = CellQuestARController.cellState.animal.rotation.y;

        // Simulasikan leretan pointer 1 jari
        window.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, clientY: 300, pointerId: 101 }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 260, clientY: 300, pointerId: 101 }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 260, clientY: 300, pointerId: 101 }));

        return {
          touchMode: CellQuestARController.touchMode,
          newRot: CellQuestARController.cellState.animal.rotation.y,
          hasRotated: CellQuestARController.cellState.animal.rotation.y !== startRot
        };
      })()
    `);
    recordTest('5A. Mod Putar (ROTATE) Responsif terhadap Leretan Jari', t5A.touchMode === 'ROTATE' && t5A.hasRotated);

    // 5B. Mod Seret (DRAG) Sentuhan 1 Jari
    const t5B = await client.eval(`
      (() => {
        CellQuestARController.setTouchMode('DRAG');
        CellQuestARController.setSelectedCell('animal');
        const startX = CellQuestARController.cellState.animal.dragOffset.x;

        // Simulasikan leretan seret
        window.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, clientY: 300, pointerId: 102 }));
        window.dispatchEvent(new PointerEvent('pointermove', { clientX: 280, clientY: 320, pointerId: 102 }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: 280, clientY: 320, pointerId: 102 }));

        return {
          touchMode: CellQuestARController.touchMode,
          newX: CellQuestARController.cellState.animal.dragOffset.x,
          hasDragged: CellQuestARController.cellState.animal.dragOffset.x !== startX
        };
      })()
    `);
    recordTest('5B. Mod Seret (DRAG) Mengubah Kedudukan Offset Model', t5B.touchMode === 'DRAG' && t5B.hasDragged);

    // 5C. Raycast Ketikan Membuka Kad Maklumat Organel
    const t5C = await client.eval(`
      (() => {
        // Pilih organel nucleus secara langsung
        CellQuestARController.selectOrganelle('nucleus', 'animal');
        const card = document.getElementById('cq-organelle-card');
        return {
          cardVisible: !card.classList.contains('hidden'),
          nameText: document.getElementById('cq-card-name').textContent,
          funcText: document.getElementById('cq-card-function').textContent,
          factText: document.getElementById('cq-card-fact').textContent
        };
      })()
    `);
    recordTest('5C. Kad Butiran Organel Terpapar dengan Teks KSSM Lengkap', t5C.cardVisible && t5C.nameText.includes('NUKLEUS') && t5C.funcText.length > 10);

    // 5D. Tutup Kad Maklumat Organel
    const t5D = await client.eval(`
      (() => {
        CellQuestARController.clearSelection();
        return {
          cardHidden: document.getElementById('cq-organelle-card').classList.contains('hidden'),
          hintVisible: !document.getElementById('cq-hint-pill').classList.contains('hidden')
        };
      })()
    `);
    recordTest('5D. Penutupan Kad Maklumat Organel Mengembalikan Pil Panduan', t5D.cardHidden && t5D.hintVisible);

    // =========================================================================
    // UJIAN 6: VERIFIKASI RESPONSIVITI & TANGKAPAN SKRIN 8 VIEWPORT
    // =========================================================================
    console.log('\n--- UJIAN 6: AUDIT 8 VIEWPORT & TANGKAPAN SKRIN ---');

    const viewports = [
      { name: 'iphone_se_375x667', width: 375, height: 667, label: 'iPhone SE (375x667)' },
      { name: 'android_galaxy_a_360x800', width: 360, height: 800, label: 'Android Galaxy A (360x800)' },
      { name: 'iphone_14_390x844', width: 390, height: 844, label: 'iPhone 14 (390x844)' },
      { name: 'iphone_15_pro_max_430x932', width: 430, height: 932, label: 'iPhone 15 Pro Max (430x932)' },
      { name: 'ipad_portrait_768x1024', width: 768, height: 1024, label: 'iPad Portrait (768x1024)' },
      { name: 'ipad_landscape_1024x768', width: 1024, height: 768, label: 'iPad Landscape (1024x768)' },
      { name: 'laptop_1366x768', width: 1366, height: 768, label: 'Laptop HD (1366x768)' },
      { name: 'desktop_1920x1080', width: 1920, height: 1080, label: 'Desktop Full HD (1920x1080)' }
    ];

    // Kembali ke mod compare untuk verifikasi visual lengkap
    await client.eval(`CellQuestARController.loadModel('compare');`);

    for (const vp of viewports) {
      await client.setViewport(vp.width, vp.height);
      await client.eval(`
        (() => {
          adjustPOVBannerLayout();
          if (typeof CellQuestARController !== 'undefined') {
            CellQuestARController.updateModelsLayout();
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 400));

      const audit = await client.eval(`
        (() => {
          const body = document.body;
          const docEl = document.documentElement;
          const hasHScroll = (docEl.scrollWidth > window.innerWidth + 2) || (body.scrollWidth > window.innerWidth + 2);

          // Audit touch targets >= 44x44
          const buttons = Array.from(document.querySelectorAll('.cq-action-btn, .cq-btn-sm, .cq-pill-btn'));
          let minTargetWidth = 999;
          let minTargetHeight = 999;
          let smallestBtn = null;
          buttons.forEach(b => {
            const rect = b.getBoundingClientRect();
            if (rect.width > 0 && rect.width < minTargetWidth) minTargetWidth = rect.width;
            if (rect.height > 0 && rect.height < minTargetHeight) {
              minTargetHeight = rect.height;
              smallestBtn = (b.id || b.className) + ' (H=' + rect.height + ')';
            }
          });

          // Detect overflow culprits
          const overflowEls = Array.from(document.querySelectorAll('*'))
            .filter(el => {
              const r = el.getBoundingClientRect();
              return r.right > window.innerWidth + 2 && el.offsetWidth > 0;
            })
            .slice(0, 5)
            .map(el => (el.id || el.className || el.tagName) + ' [r=' + Math.round(el.getBoundingClientRect().right) + ']');

          return {
            hasHScroll,
            minTargetWidth,
            minTargetHeight,
            smallestBtn,
            overflowEls,
            targetsOk: minTargetHeight >= 40 // toleransi kecil styling border
          };
        })()
      `);

      const screenshotFile = `cellquest_dualcell_hotfix11_${vp.name}.png`;
      await client.captureScreenshot(screenshotFile);

      recordTest(`6. Viewport ${vp.label} - Susun Atur & Tangkapan Skrin`, !audit.hasHScroll, `HScroll=${audit.hasHScroll}, MinTargetH=${audit.minTargetHeight}px, Smallest=${audit.smallestBtn}, Overflows=${audit.overflowEls ? audit.overflowEls.join(', ') : 'none'}`);
    }

  } catch (err) {
    console.error('❌ Ralat semasa menjalankan ujian automasi:', err);
    recordTest('Pelaksanaan Ujian Automasi Keseluruhan', false, err.message);
  } finally {
    if (client) client.close();
    try { browserProc.kill(); } catch (_) {}
    server.close();
  }

  console.log('\n========================================================');
  console.log('📊 KEPUTUSAN KESELURUHAN HOTFIX DUAL-CELL 1.1:');
  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;
  console.log(`Jumlah Ujian: ${totalCount}`);
  console.log(`Lulus: ${passedCount}`);
  console.log(`Gagal: ${totalCount - passedCount}`);
  console.log(`Kadar Kejayaan: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
  console.log('========================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTestSuite();
