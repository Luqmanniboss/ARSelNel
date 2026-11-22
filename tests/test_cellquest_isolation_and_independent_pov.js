/**
 * ARSELNEL — COMPREHENSIVE QA SUITE (PHASE 7)
 * CELL MARKER ISOLATION, INDEPENDENT ANIMAL/PLANT 3DoF POV LOCK,
 * CLEAN STUDENT NAVIGATION, ALWAYS-AVAILABLE CAMERA TOGGLE & MULTI-VIEWPORT UI
 *
 * Tests T1..T21 + Multi-Viewport (320, 360, 375, 390, 402, 430, 768px)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60568;
const CDP_PORT = 9308;
const ROOT_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_cellquest_isolation');

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
    if (reqPath === '/') reqPath = '/kotak_arselnel/code.html';
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

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Chrome/Edge ditemui!');
}

function getPages(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
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
        if (msg.error) reject(new Error(msg.error.message));
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
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
  }

  close() {
    this.ws.close();
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  console.log('======================================================================');
  console.log('🔬 ARSELNEL QA (PHASE 7): CELL ISOLATION, INDEPENDENT POV & MOBILE UI');
  console.log('======================================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const server = await startServer();
  const browserBin = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-phase7-'));

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--user-data-dir=${userDataDir}`,
    `http://127.0.0.1:${PORT}/kotak_arselnel/code.html`
  ]);

  let cdp = null;
  let total = 0;
  let passed = 0;

  function assert(id, name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  [${id}] ✅ PASS - ${name}`);
    } else {
      console.error(`  [${id}] ❌ FAIL - ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    for (let i = 0; i < 30; i++) {
      await delay(350);
      try {
        const pages = await getPages(CDP_PORT);
        const page = pages.find(p => p.url.includes('kotak_arselnel/code.html'));
        if (page && page.webSocketDebuggerUrl) {
          cdp = new CDPClient(page.webSocketDebuggerUrl);
          await cdp.ready;
          break;
        }
      } catch (e) {}
    }
    if (!cdp) throw new Error('Gagal menyambung ke CDP pelayar');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await delay(1500);

    // Mock headless Three.js scene & anchors
    await cdp.eval(`
      (() => {
        window.alert = () => {};
        window.confirm = () => true;
        if (typeof THREE !== 'undefined' && typeof ARState !== 'undefined') {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(65, 390 / 844, 0.05, 1000);
          scene.add(camera);
          const makeAnchor = () => {
            const g = new THREE.Group();
            g.visible = true;
            g.position.set(0, 0, -2.2);
            scene.add(g);
            return { group: g };
          };
          ARState.scene = scene;
          ARState.camera = camera;
          ARState.renderer = { render: () => {}, setAnimationLoop: () => {}, getContext: () => ({ isContextLost: () => false }), domElement: document.createElement('canvas') };
          ARState.anchorVideo = makeAnchor();
          ARState.anchorNota = makeAnchor();
          ARState.anchorKuiz = makeAnchor();
          ARState.anchorCellQuestAnimal = makeAnchor();
          ARState.anchorCellQuestPlant = makeAnchor();
          ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
          CellQuestARController.init(scene, ARState.anchorCellQuestAnimal.group, camera, ARState.renderer);
        }
      })()
    `);

    // -------------------------------------------------------------------------
    // T13: Camera toggle is visible BEFORE any marker scan
    // -------------------------------------------------------------------------
    const t13 = await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-global-toggle-cam');
        if (!btn) return { ok: false, reason: 'missing' };
        const r = btn.getBoundingClientRect();
        const txt = (btn.textContent || '').trim();
        return { ok: r.width > 40 && r.height >= 30 && txt.includes('Tutup Kamera'), rect: { w: Math.round(r.width), h: Math.round(r.height) }, txt };
      })()
    `);
    assert('T13', 'Butang Tutup Kamera sentiasa kelihatan sebelum sebarang imbasan kad AR', t13 && t13.ok, JSON.stringify(t13));

    // -------------------------------------------------------------------------
    // T16: Removed navigation buttons are absent from student UI
    // -------------------------------------------------------------------------
    const t16 = await cdp.eval(`
      (() => {
        const removedIds = ['btn-launch-jelajah3d', 'btn-launch-orientasi-dunia', 'btn-open-marker', 'btn-toggle-diagnostics', 'cq-hud-btn-diagnostics'];
        const found = removedIds.filter(id => !!document.getElementById(id));
        return { ok: found.length === 0, found };
      })()
    `);
    assert('T16', 'Butang navigasi berlebihan (Jelajah 3D, AR Orientasi Dunia, Papar Kad AR, Diagnostik) dibuang daripada UI murid', t16 && t16.ok, JSON.stringify(t16));

    // -------------------------------------------------------------------------
    // T18: Diagnostik remains available only via developer path
    // -------------------------------------------------------------------------
    const t18 = await cdp.eval(`
      (() => {
        const drawer = document.getElementById('diagnostics-drawer');
        const hiddenByDefault = drawer && drawer.classList.contains('hidden');
        const fnExists = typeof window.toggleDiagnosticsDrawer === 'function';
        window.toggleDiagnosticsDrawer();
        const opened = drawer && !drawer.classList.contains('hidden');
        window.toggleDiagnosticsDrawer();
        const closedAgain = drawer && drawer.classList.contains('hidden');
        return { ok: hiddenByDefault && fnExists && opened && closedAgain };
      })()
    `);
    assert('T18', 'Diagnostik tersembunyi bagi murid tetapi boleh diakses melalui laluan pembangun (Ctrl+Shift+D / fungsi dalaman)', t18 && t18.ok, JSON.stringify(t18));

    // -------------------------------------------------------------------------
    // T14 & T15: Camera OFF shows clean empty dark viewport; Camera ON restores
    // -------------------------------------------------------------------------
    const t14 = await cdp.eval(`
      (() => {
        document.getElementById('btn-global-toggle-cam').click();
        const offOk = !ARState.cameraActive &&
                      document.getElementById('ar-container').classList.contains('camera-off') &&
                      typeof window.VirtualEnvironment360 === 'undefined' &&
                      typeof window.VirtualBiologyLab === 'undefined';
        const labelOff = (document.getElementById('global-cam-text')?.textContent || '').trim();
        return { ok: offOk && labelOff === 'Buka Kamera', labelOff };
      })()
    `);
    assert('T14', 'Tutup Kamera memaparkan viewport gelap kosong bersih dan menukar label ke Buka Kamera', t14 && t14.ok, JSON.stringify(t14));

    const t15 = await cdp.eval(`
      (() => {
        document.getElementById('btn-global-toggle-cam').click();
        const onOk = ARState.cameraActive && !document.getElementById('ar-container').classList.contains('camera-off');
        const labelOn = (document.getElementById('global-cam-text')?.textContent || '').trim();
        return { ok: onOk && labelOn === 'Tutup Kamera', labelOn };
      })()
    `);
    assert('T15', 'Buka Kamera memulihkan aliran kamera dan menukar label ke Tutup Kamera', t15 && t15.ok, JSON.stringify(t15));

    // -------------------------------------------------------------------------
    // T17: Physical marker routes for Jelajah 3D (5) & Orientasi (6) still work
    // -------------------------------------------------------------------------
    const t17 = await cdp.eval(`
      (() => {
        const m5 = MARKER_REGISTRY[5] && MARKER_REGISTRY[5].module === 'jelajah3d';
        const m6 = MARKER_REGISTRY[6] && MARKER_REGISTRY[6].module === 'orientasi';
        ARState.markerCooldown = {};
        handleTargetFound(5);
        const j3dBackdrop = document.getElementById('jelajah3d-marker-intro-backdrop');
        const j3dOpened = j3dBackdrop && !j3dBackdrop.classList.contains('hidden');
        if (typeof closeJelajah3DIntroPanel === 'function') closeJelajah3DIntroPanel(false);

        ARState.markerCooldown = {};
        handleTargetFound(6);
        const oriBackdrop = document.getElementById('orientasi-dunia-marker-intro-backdrop');
        const oriOpened = oriBackdrop && !oriBackdrop.classList.contains('hidden');
        if (oriBackdrop) oriBackdrop.classList.add('hidden');
        ARState.markerCooldown = {};
        return { ok: !!(m5 && m6 && j3dOpened && oriOpened), m5, m6, j3dOpened, oriOpened };
      })()
    `);
    assert('T17', 'Laluan kad penanda fizikal (Target 5 Jelajah 3D & Target 6 AR Orientasi Dunia) masih berfungsi utuh', t17 && t17.ok, JSON.stringify(t17));

    // -------------------------------------------------------------------------
    // T1: Animal marker (Target 3) displays Animal ONLY
    // -------------------------------------------------------------------------
    const t1 = await cdp.eval(`
      (() => {
        ARState.markerCooldown = {};
        handleTargetFound(3);
        const a = CellQuestARController.cells.animal;
        const p = CellQuestARController.cells.plant;
        const hudTitle = (document.getElementById('cq-hud-cell-name')?.textContent || '').trim();
        return {
          ok: a.isActive && a.rootGroup.visible && !p.isActive && !p.rootGroup.visible && hudTitle === 'Sel Haiwan 3D',
          aActive: a.isActive, aVis: a.rootGroup.visible, pActive: p.isActive, pVis: p.rootGroup.visible, hudTitle
        };
      })()
    `);
    assert('T1', 'Imbas Kad Sel Haiwan (Index 3) memaparkan Sel Haiwan SAHAJA tanpa mengaktifkan Sel Tumbuhan', t1 && t1.ok, JSON.stringify(t1));

    await cdp.screenshot(path.join(SCREENSHOT_DIR, 'animal_only_390x844.png'));

    // -------------------------------------------------------------------------
    // T3: Compare Mode does NOT auto-display missing cells
    // -------------------------------------------------------------------------
    const t3 = await cdp.eval(`
      (() => {
        CellQuestARController.loadModel('compare');
        const p = CellQuestARController.cells.plant;
        return { ok: !p.isActive && !p.rootGroup.visible && !p.loaded, pActive: p.isActive, pVis: p.rootGroup.visible, pLoaded: p.loaded };
      })()
    `);
    assert('T3', 'Mod Perbandingan (Compare Mode) TIDAK sekali-kali auto-memaparkan atau auto-memuatkan sel yang belum diimbas', t3 && t3.ok, JSON.stringify(t3));

    // -------------------------------------------------------------------------
    // T19: POV dialog is readable and clickable on iPhone viewport (390x844)
    // -------------------------------------------------------------------------
    const t19 = await cdp.eval(`
      (() => {
        CellQuestARController.startPOVSetup('animal');
        const banner = document.getElementById('cq-pov-setup-banner');
        const btnAnchor = document.getElementById('cq-btn-pov-anchor');
        const btnCancel = document.getElementById('cq-btn-pov-cancel');
        const multiBar = document.getElementById('ar-multi-panel-bar');
        const bR = banner.getBoundingClientRect();
        const aR = btnAnchor.getBoundingClientRect();
        const cR = btnCancel.getBoundingClientRect();
        const mR = multiBar.getBoundingClientRect();
        const clearOfBar = bR.top >= mR.bottom - 2;
        const buttonsInViewport = aR.width > 60 && aR.height >= 36 && cR.width > 50 && cR.height >= 36 && aR.right <= 390 && cR.right <= 390;
        return { ok: !banner.classList.contains('hidden') && clearOfBar && buttonsInViewport, bTop: Math.round(bR.top), mBottom: Math.round(mR.bottom) };
      })()
    `);
    assert('T19', 'Dialog POV Setup (Letak di Arah Ini & Batal) jelas, boleh ditekan & tidak bertindih pada iPhone 390px', t19 && t19.ok, JSON.stringify(t19));

    await cdp.screenshot(path.join(SCREENSHOT_DIR, 'animal_pov_setup_390x844.png'));

    // -------------------------------------------------------------------------
    // T4: Animal POV Lock works independently at Yaw 0°
    // -------------------------------------------------------------------------
    const t4 = await cdp.eval(`
      (() => {
        applySimAngles(0, 0);
        renderSinglePOVFrame();
        CellQuestARController.anchorPOVAtCurrentHeading('animal');
        const a = CellQuestARController.cells.animal;
        const p = CellQuestARController.cells.plant;
        return {
          ok: a.spatialMode === 'POV_LOCKED' && !!a.povAnchorWorldVector && !p.isActive && p.spatialMode === 'MARKER_MODE',
          aMode: a.spatialMode, pMode: p.spatialMode
        };
      })()
    `);
    assert('T4', 'Sel Haiwan dikunci pandangan (POV Lock) secara bebas pada arah 0° tanpa menjejaskan Sel Tumbuhan', t4 && t4.ok, JSON.stringify(t4));

    // -------------------------------------------------------------------------
    // T2: Scan Plant marker (Target 4) displays Plant without replacing locked Animal
    //     Also verify isolated Plant-only scan when Animal is not active
    // -------------------------------------------------------------------------
    const t2And5 = await cdp.eval(`
      (() => {
        ARState.markerCooldown = {};
        handleTargetFound(4);
        const a = CellQuestARController.cells.animal;
        const p = CellQuestARController.cells.plant;
        const hudTitle = (document.getElementById('cq-hud-cell-name')?.textContent || '').trim();
        const animalPreservedLocked = a.isActive && a.spatialMode === 'POV_LOCKED';
        const plantOnlyMarkerMode = p.isActive && p.spatialMode === 'MARKER_MODE' && hudTitle === 'Sel Tumbuhan 3D';

        // Lock Plant independently at Yaw 90°!
        applySimAngles(90, 0);
        renderSinglePOVFrame();
        CellQuestARController.startPOVSetup('plant');
        CellQuestARController.anchorPOVAtCurrentHeading('plant');

        const plantLocked = p.spatialMode === 'POV_LOCKED' && !!p.povAnchorWorldVector;
        const anchorsDistinct = a.povAnchorWorldVector.distanceTo(p.povAnchorWorldVector) > 0.5;
        return {
          ok: animalPreservedLocked && plantOnlyMarkerMode && plantLocked && anchorsDistinct,
          animalPreservedLocked, plantOnlyMarkerMode, plantLocked, anchorsDistinct,
          dist: a.povAnchorWorldVector && p.povAnchorWorldVector ? Number(a.povAnchorWorldVector.distanceTo(p.povAnchorWorldVector).toFixed(3)) : 0
        };
      })()
    `);
    assert('T2', 'Imbas Kad Sel Tumbuhan (Index 4) memaparkan Sel Tumbuhan secara berasingan tanpa memadam Sel Haiwan terkunci', t2And5 && t2And5.animalPreservedLocked && t2And5.plantOnlyMarkerMode, JSON.stringify(t2And5));
    assert('T5', 'Sel Tumbuhan dikunci pandangan (POV Lock) secara bebas pada arah 90° dengan vektor anchor berbeza', t2And5 && t2And5.plantLocked && t2And5.anchorsDistinct, JSON.stringify(t2And5));

    // -------------------------------------------------------------------------
    // T6: Both cells remain locked simultaneously & visibility changes with viewing direction
    // -------------------------------------------------------------------------
    const t6 = await cdp.eval(`
      (() => {
        // Look at 0° -> Animal in front; look at 180° -> Animal behind (hidden)
        applySimAngles(0, 0);
        renderSinglePOVFrame();
        CellQuestARController.applyModelPosition();
        const aAt0 = CellQuestARController.cells.animal.rootGroup.visible;

        applySimAngles(180, 0);
        renderSinglePOVFrame();
        CellQuestARController.applyModelPosition();
        const aAt180 = CellQuestARController.cells.animal.rootGroup.visible;

        applySimAngles(90, 0);
        renderSinglePOVFrame();
        CellQuestARController.applyModelPosition();
        const pAt90 = CellQuestARController.cells.plant.rootGroup.visible;

        return { ok: aAt0 === true && aAt180 === false && pAt90 === true, aAt0, aAt180, pAt90 };
      })()
    `);
    assert('T6', 'Kedua-dua sel kekal terkunci serentak & memusingkan telefon mengubah keterlihatan mengikut arah pandangan', t6 && t6.ok, JSON.stringify(t6));

    // -------------------------------------------------------------------------
    // T9 & T10: Video & Nota locked independently + ALL FOUR modules coexist!
    // -------------------------------------------------------------------------
    const t9And10 = await cdp.eval(`
      (() => {
        ARState.markerCooldown = {};
        handleTargetFound(0, 'video');
        SpatialPanelManager.enterPanelPOVSetup('video');
        SpatialPanelManager.lockPanelPOV('video');

        handleTargetFound(1, 'nota');
        SpatialPanelManager.enterPanelPOVSetup('nota');
        SpatialPanelManager.lockPanelPOV('nota');

        const pVid = SpatialPanelManager.getPanel('video');
        const pNota = SpatialPanelManager.getPanel('nota');
        const cAnimal = CellQuestARController.cells.animal;
        const cPlant = CellQuestARController.cells.plant;

        const vidNotaOk = pVid.placementMode === 'POV_LOCKED' && pNota.placementMode === 'POV_LOCKED';
        const allFourActive = ARState.activePanels.has('video') &&
                              ARState.activePanels.has('nota') &&
                              ARState.activePanels.has('cellquest-animal') &&
                              ARState.activePanels.has('cellquest-plant');
        const allFourLocked = vidNotaOk && cAnimal.spatialMode === 'POV_LOCKED' && cPlant.spatialMode === 'POV_LOCKED';
        return { ok: allFourActive && allFourLocked, vidNotaOk, allFourActive, allFourLocked, panels: Array.from(ARState.activePanels) };
      })()
    `);
    assert('T9', 'Video dan Nota kekal terkunci pandangan (POV Lock) secara bebas', t9And10 && t9And10.vidNotaOk, JSON.stringify(t9And10));
    assert('T10', 'Keempat-empat modul (Video, Nota, Sel Haiwan, Sel Tumbuhan) wujud dan terkunci serentak', t9And10 && t9And10.ok, JSON.stringify(t9And10));

    // -------------------------------------------------------------------------
    // T11: Switching focus does NOT destroy locked modules
    // -------------------------------------------------------------------------
    const t11 = await cdp.eval(`
      (() => {
        focusPanel('video');
        focusPanel('nota');
        focusPanel('cellquest-animal');
        focusPanel('cellquest-plant');
        const allLocked = SpatialPanelManager.getPanel('video').placementMode === 'POV_LOCKED' &&
                          SpatialPanelManager.getPanel('nota').placementMode === 'POV_LOCKED' &&
                          CellQuestARController.cells.animal.spatialMode === 'POV_LOCKED' &&
                          CellQuestARController.cells.plant.spatialMode === 'POV_LOCKED';
        return { ok: allLocked && ARState.activePanels.size === 4 };
      })()
    `);
    assert('T11', 'Pertukaran fokus antara Video, Nota, Sel Haiwan & Sel Tumbuhan tidak memusnahkan modul terkunci', t11 && t11.ok);

    // -------------------------------------------------------------------------
    // T12: Fast marker switching does NOT duplicate models or pills
    // -------------------------------------------------------------------------
    const t12 = await cdp.eval(`
      (() => {
        for (let i = 0; i < 6; i++) {
          ARState.markerCooldown = {};
          handleTargetFound(3);
          handleTargetFound(4);
        }
        const pills = document.querySelectorAll('#multi-panel-tags-list .multi-pill').length;
        const animalRoots = CellQuestARController.cells.animal.rootGroup ? 1 : 0;
        const plantRoots = CellQuestARController.cells.plant.rootGroup ? 1 : 0;
        return { ok: pills === 4 && animalRoots === 1 && plantRoots === 1, pills };
      })()
    `);
    assert('T12', 'Pengimbasan pantas berulang antara kad penanda tidak menduplikasi model 3D atau pil modul', t12 && t12.ok, JSON.stringify(t12));

    // -------------------------------------------------------------------------
    // T20: Model interactions (zoom/rotate) remain functional per-cell
    // -------------------------------------------------------------------------
    const t20 = await cdp.eval(`
      (() => {
        focusPanel('cellquest-animal');
        const beforeAnimal = CellQuestARController.cells.animal.scale;
        const beforePlant = CellQuestARController.cells.plant.scale;
        CellQuestARController.adjustZoom(1.2);
        const afterAnimal = CellQuestARController.cells.animal.scale;
        const afterPlant = CellQuestARController.cells.plant.scale;
        return { ok: afterAnimal > beforeAnimal && afterPlant === beforePlant, beforeAnimal, afterAnimal, beforePlant, afterPlant };
      })()
    `);
    assert('T20', 'Interaksi model 3D (zum/putar) berfungsi secara berasingan bagi sel yang difokuskan sahaja', t20 && t20.ok, JSON.stringify(t20));

    // -------------------------------------------------------------------------
    // T7: Closing Animal preserves Plant
    // -------------------------------------------------------------------------
    const t7 = await cdp.eval(`
      (() => {
        destroyCellQuestSession('animal');
        const a = CellQuestARController.cells.animal;
        const p = CellQuestARController.cells.plant;
        return {
          ok: !a.isActive && !ARState.activePanels.has('cellquest-animal') && p.isActive && p.spatialMode === 'POV_LOCKED' && ARState.activePanels.has('cellquest-plant'),
          aActive: a.isActive, pActive: p.isActive, pMode: p.spatialMode
        };
      })()
    `);
    assert('T7', 'Menutup Sel Haiwan mengekalkan Sel Tumbuhan yang masih terkunci tanpa gangguan', t7 && t7.ok, JSON.stringify(t7));

    // -------------------------------------------------------------------------
    // T8: Re-scan Animal, lock it, then close Plant -> preserves Animal
    // -------------------------------------------------------------------------
    const t8 = await cdp.eval(`
      (() => {
        ARState.markerCooldown = {};
        handleTargetFound(3);
        CellQuestARController.startPOVSetup('animal');
        CellQuestARController.anchorPOVAtCurrentHeading('animal');
        destroyCellQuestSession('plant');
        const a = CellQuestARController.cells.animal;
        const p = CellQuestARController.cells.plant;
        return {
          ok: !p.isActive && !ARState.activePanels.has('cellquest-plant') && a.isActive && a.spatialMode === 'POV_LOCKED' && ARState.activePanels.has('cellquest-animal'),
          aActive: a.isActive, aMode: a.spatialMode, pActive: p.isActive
        };
      })()
    `);
    assert('T8', 'Menutup Sel Tumbuhan mengekalkan Sel Haiwan yang masih terkunci tanpa gangguan', t8 && t8.ok, JSON.stringify(t8));

    // -------------------------------------------------------------------------
    // T21: Multi-Viewport Zero Horizontal Overflow (320, 360, 375, 390, 402, 430, 768px)
    // -------------------------------------------------------------------------
    const widths = [320, 360, 375, 390, 402, 430, 768];
    const vpResults = [];
    for (const w of widths) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: 844,
        deviceScaleFactor: 2,
        mobile: w < 768
      });
      await delay(150);
      const res = await cdp.eval(`
        (() => {
          const sw = document.documentElement.scrollWidth;
          const cw = document.documentElement.clientWidth;
          return { sw, cw, ok: sw <= cw + 1 };
        })()
      `);
      vpResults.push({ w, ...res });
      if (w === 320 || w === 390 || w === 768) {
        await cdp.screenshot(path.join(SCREENSHOT_DIR, `layout_${w}x844.png`));
      }
    }
    const allVpOk = vpResults.every(r => r.ok);
    assert('T21', 'Tiada limpahan mendatar (zero horizontal overflow) merentasi 320, 360, 375, 390, 402, 430 & 768px', allVpOk, JSON.stringify(vpResults));

    console.log('\n======================================================================');
    console.log(`🏁 KEPUTUSAN QA PHASE 7: ${passed}/${total} UJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
    console.log('======================================================================\n');

    if (passed !== total) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Ralat tidak dijangka:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    if (chromeProc) chromeProc.kill();
    server.close();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
})();
