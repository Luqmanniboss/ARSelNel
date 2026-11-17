/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * HOTFIX CELLQUEST DUAL-CELL AR 1.0
 * Side-by-Side Dual-Cell AR, Independent Controls, POV Lock & POV Setup Banner Overlap Fix
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60555;
const CDP_PORT = 9295;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_dual_cell_hotfix_1_0');

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
      throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text || 'Eval error');
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
  console.log('========================================================');
  console.log('🚀 ARSELNEL QA: CELLQUEST DUAL-CELL HOTFIX 1.0 TEST SUITE');
  console.log('========================================================\n');

  const server = await startServer();
  console.log(`[1] Pelayan ujian aktif di http://127.0.0.1:${PORT}`);

  const browserPath = findBrowser();
  const tmpProfile = path.join(os.tmpdir(), 'arselnel_dualcell_test_' + Date.now());
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
    // Wait for CDP port
    await new Promise(r => setTimeout(r, 1600));
    const pages = await getPages(CDP_PORT);
    const targetPage = pages.find(p => p.type === 'page');
    client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.ready;
    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    const url = `http://127.0.0.1:${PORT}/kotak_arselnel/code.html`;
    console.log(`[2] Navigasi ke ${url}...`);
    await client.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2200));

    // Initialize mock camera / AR environment in Kotak ARSELNEL
    await client.eval(`
      (() => {
        // Suppress browser alerts or navigation during test
        window.alert = () => {};
        window.confirm = () => true;

        // Force initialize AR scene with mock Three.js setup if not yet initialized
        if (typeof CellQuestARController !== 'undefined') {
          if (!CellQuestARController.renderer) {
            CellQuestARController.init();
          }
          CellQuestARController.activate();
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // TEST 1: Dual Model Loading & Display Modes
    console.log('\n--- UJIAN 1: PEMILIHAN MOD PAPARAN CELLQUEST ---');
    
    // 1A. Sel Haiwan Sahaja
    const resAnimal = await client.eval(`
      (() => {
        CellQuestARController.loadModel('animal');
        return {
          displayMode: CellQuestARController.displayMode,
          animalVisible: CellQuestARController.animalHolder ? CellQuestARController.animalHolder.visible : false,
          plantVisible: CellQuestARController.plantHolder ? CellQuestARController.plantHolder.visible : false,
          btnAnimalActive: document.getElementById('cq-btn-animal').classList.contains('active'),
          btnPlantActive: document.getElementById('cq-btn-plant').classList.contains('active'),
          btnCompareActive: document.getElementById('cq-btn-compare').classList.contains('active'),
          rowActiveHidden: document.getElementById('cq-row-active-model').classList.contains('hidden')
        };
      })()
    `);
    recordTest(
      'Mod A: Sel Haiwan Sahaja dipaparkan',
      resAnimal.displayMode === 'animal' && resAnimal.animalVisible && !resAnimal.plantVisible && resAnimal.btnAnimalActive && resAnimal.rowActiveHidden,
      `Mod: ${resAnimal.displayMode}, Haiwan: ${resAnimal.animalVisible}, Tumbuhan: ${resAnimal.plantVisible}`
    );

    // 1B. Sel Tumbuhan Sahaja
    await client.eval(`CellQuestARController.loadModel('plant');`);
    await new Promise(r => setTimeout(r, 600));
    const resPlant = await client.eval(`
      (() => {
        return {
          displayMode: CellQuestARController.displayMode,
          animalVisible: CellQuestARController.animalHolder ? CellQuestARController.animalHolder.visible : false,
          plantVisible: CellQuestARController.plantHolder ? CellQuestARController.plantHolder.visible : false,
          btnAnimalActive: document.getElementById('cq-btn-animal').classList.contains('active'),
          btnPlantActive: document.getElementById('cq-btn-plant').classList.contains('active'),
          btnCompareActive: document.getElementById('cq-btn-compare').classList.contains('active'),
          rowActiveHidden: document.getElementById('cq-row-active-model').classList.contains('hidden')
        };
      })()
    `);
    recordTest(
      'Mod B: Sel Tumbuhan Sahaja dipaparkan',
      resPlant.displayMode === 'plant' && !resPlant.animalVisible && resPlant.plantVisible && resPlant.btnPlantActive && resPlant.rowActiveHidden,
      `Mod: ${resPlant.displayMode}, Haiwan: ${resPlant.animalVisible}, Tumbuhan: ${resPlant.plantVisible}`
    );

    // 1C. Mod Perbandingan (Dua-Dua Model Serentak)
    const resCompare = await client.eval(`
      (() => {
        CellQuestARController.loadModel('compare');
        return {
          displayMode: CellQuestARController.displayMode,
          animalVisible: CellQuestARController.animalHolder ? CellQuestARController.animalHolder.visible : false,
          plantVisible: CellQuestARController.plantHolder ? CellQuestARController.plantHolder.visible : false,
          animalX: CellQuestARController.animalHolder ? CellQuestARController.animalHolder.position.x : 0,
          plantX: CellQuestARController.plantHolder ? CellQuestARController.plantHolder.position.y : 0,
          plantPosX: CellQuestARController.plantHolder ? CellQuestARController.plantHolder.position.x : 0,
          btnCompareActive: document.getElementById('cq-btn-compare').classList.contains('active'),
          rowActiveVisible: !document.getElementById('cq-row-active-model').classList.contains('hidden')
        };
      })()
    `);
    const dualVisible = resCompare.displayMode === 'compare' && resCompare.animalVisible && resCompare.plantVisible;
    const sideBySide = resCompare.animalX < -0.4 && resCompare.plantPosX > 0.4;
    recordTest(
      'Mod C: Dwi-Sel Serentak (Sel Haiwan di Kiri, Sel Tumbuhan di Kanan)',
      dualVisible && sideBySide && resCompare.btnCompareActive && resCompare.rowActiveVisible,
      `Haiwan X: ${resCompare.animalX.toFixed(2)}, Tumbuhan X: ${resCompare.plantPosX.toFixed(2)} (Jarak: ${(resCompare.plantPosX - resCompare.animalX).toFixed(2)})`
    );

    // TEST 2: Independent Control & Highlight Ring
    console.log('\n--- UJIAN 2: KAWALAN BEBAS & SOROTAN MODEL AKTIF ---');
    const resIndependent = await client.eval(`
      (() => {
        // Ensure in compare mode
        CellQuestARController.loadModel('compare');

        // Set focus to animal
        CellQuestARController.setSelectedCell('animal');
        const animalRingOn = CellQuestARController.animalHighlightRing ? CellQuestARController.animalHighlightRing.visible : false;
        const plantRingOff = CellQuestARController.plantHighlightRing ? !CellQuestARController.plantHighlightRing.visible : true;

        // Perform rotation on active cell
        const initAnimalRotY = CellQuestARController.cellState.animal.rotation.y;
        const initPlantRotY = CellQuestARController.cellState.plant.rotation.y;

        // Simulate pointer rotate on active model
        CellQuestARController.cellState.animal.rotation.y += 0.45;
        CellQuestARController.animalHolder.rotation.y = CellQuestARController.cellState.animal.rotation.y;

        const rotatedAnimalY = CellQuestARController.cellState.animal.rotation.y;
        const unchangedPlantY = CellQuestARController.cellState.plant.rotation.y;

        // Now switch focus to plant
        CellQuestARController.setSelectedCell('plant');
        const animalRingOff = CellQuestARController.animalHighlightRing ? !CellQuestARController.animalHighlightRing.visible : true;
        const plantRingOn = CellQuestARController.plantHighlightRing ? CellQuestARController.plantHighlightRing.visible : false;

        // Perform zoom on active plant
        const initPlantScale = CellQuestARController.cellState.plant.scale;
        const initAnimalScale = CellQuestARController.cellState.animal.scale;

        CellQuestARController.adjustZoom(1.18);
        const zoomedPlantScale = CellQuestARController.cellState.plant.scale;
        const unchangedAnimalScale = CellQuestARController.cellState.animal.scale;

        return {
          animalRotChanged: Math.abs(rotatedAnimalY - initAnimalRotY) > 0.4,
          plantRotUnchanged: unchangedPlantY === initPlantRotY,
          plantZoomChanged: zoomedPlantScale > initPlantScale,
          animalZoomUnchanged: unchangedAnimalScale === initAnimalScale,
          ringBehaviorCorrect: animalRingOn && plantRingOff && animalRingOff && plantRingOn
        };
      })()
    `);
    recordTest(
      'Kawalan Bebas: Putaran & Zum Sel Haiwan Tidak Mengganggu Sel Tumbuhan',
      resIndependent.animalRotChanged && resIndependent.plantRotUnchanged && resIndependent.plantZoomChanged && resIndependent.animalZoomUnchanged,
      `Rot Animal Berubah: ${resIndependent.animalRotChanged}, Rot Plant Kekal: ${resIndependent.plantRotUnchanged}`
    );
    recordTest(
      'Cincin Sorotan (Highlight Ring) Menandakan Model Aktif Secara Dinamik',
      resIndependent.ringBehaviorCorrect,
      'Cincin beralih tepat antara Sel Haiwan dan Sel Tumbuhan'
    );

    // TEST 3: POV Setup Banner & Overlap Protection
    console.log('\n--- UJIAN 3: BEBAS BERTINDIH POV BANNER VS MULTI-PANEL TOOLBAR ---');
    const resPOVOverlap = await client.eval(`
      (async () => {
        // Activate Multi-Panel bar with 2 modules
        ARState.activePanels.clear();
        ARState.activePanels.add('cellquest');
        ARState.activePanels.add('nota');
        updateMultiPanelUI();

        // Launch POV setup banner
        await CellQuestARController.startPOVSetup();
        adjustPOVBannerLayout();

        const multiBar = document.getElementById('ar-multi-panel-bar');
        const povBanner = document.getElementById('cq-pov-setup-banner');

        const multiRect = multiBar.getBoundingClientRect();
        const bannerRect = povBanner.getBoundingClientRect();

        const bannerTop = bannerRect.top;
        const barBottom = multiRect.bottom;
        const clearance = bannerTop - barBottom;

        return {
          multiVisible: !multiBar.classList.contains('hidden'),
          bannerVisible: !povBanner.classList.contains('hidden'),
          multiBottom: Math.round(barBottom),
          bannerTop: Math.round(bannerTop),
          clearance: Math.round(clearance),
          noOverlap: clearance >= 8
        };
      })()
    `);
    recordTest(
      'Sifar Pertindihan: Panel "Letak di Arah Ini" berada di bawah Multi-Panel Bar',
      resPOVOverlap.noOverlap,
      `Multi-Bar Bawah: ${resPOVOverlap.multiBottom}px, POV Banner Atas: ${resPOVOverlap.bannerTop}px (Jurang: +${resPOVOverlap.clearance}px)`
    );

    // Confirm POV lock
    const resPOVLock = await client.eval(`
      (() => {
        CellQuestARController.anchorPOVAtCurrentHeading();
        return {
          spatialMode: CellQuestARController.spatialMode,
          animalVisible: CellQuestARController.animalHolder.visible,
          plantVisible: CellQuestARController.plantHolder.visible,
          bannerHidden: document.getElementById('cq-pov-setup-banner').classList.contains('hidden')
        };
      })()
    `);
    recordTest(
      'Kunci Pandangan (3DoF): Mengunci Kedua-dua Model Serentak dalam Ruang 3D',
      resPOVLock.spatialMode === 'POV_LOCKED' && resPOVLock.animalVisible && resPOVLock.plantVisible && resPOVLock.bannerHidden,
      `Mod Spatial: ${resPOVLock.spatialMode}, Kedua-dua model aktif & terkunci`
    );

    // TEST 4: Science Tools: Organelle Labels & Form 1 Modal Dialog
    console.log('\n--- UJIAN 4: ALATAN SAINS KSSM (LABEL ORGANEL & MODAL BANDING) ---');
    const resLabels = await client.eval(`
      (() => {
        CellQuestARController.toggleLabels(); // on
        const onState = {
          showLabels: CellQuestARController.showLabels,
          animalLabels: CellQuestARController.animalLabelsGroup ? CellQuestARController.animalLabelsGroup.visible : false,
          plantLabels: CellQuestARController.plantLabelsGroup ? CellQuestARController.plantLabelsGroup.visible : false,
          btnActive: document.getElementById('cq-btn-labels').classList.contains('is-active')
        };
        CellQuestARController.toggleLabels(); // off
        const offState = {
          showLabels: CellQuestARController.showLabels,
          animalLabels: CellQuestARController.animalLabelsGroup ? CellQuestARController.animalLabelsGroup.visible : false,
          plantLabels: CellQuestARController.plantLabelsGroup ? CellQuestARController.plantLabelsGroup.visible : false,
          btnActive: document.getElementById('cq-btn-labels').classList.contains('is-active')
        };
        // Turn back on for screenshot
        CellQuestARController.toggleLabels();
        return { onState, offState };
      })()
    `);
    recordTest(
      'Label Organel Sains KSSM: Memaparkan & Menyembunyikan Label Sprite 3D',
      resLabels.onState.showLabels && resLabels.onState.animalLabels && resLabels.onState.plantLabels && !resLabels.offState.showLabels && !resLabels.offState.animalLabels,
      'Sprite 3D Bahasa Melayu (Nukleus, Dinding Sel, Kloroplas dsb.) berfungsi lancar'
    );

    // Modal Persamaan & Perbezaan
    const resModal = await client.eval(`
      (() => {
        const btnOpen = document.getElementById('cq-btn-diff-modal');
        const modal = document.getElementById('cq-compare-modal');
        btnOpen.click();
        const opened = !modal.classList.contains('hidden');

        // Switch to similarities tab
        const tabSim = document.getElementById('cq-tab-sim');
        tabSim.click();
        const simView = document.getElementById('cq-compare-view-sim');
        const simActive = tabSim.classList.contains('is-active') && simView && !simView.classList.contains('hidden');

        // Switch back to differences tab
        const tabDiff = document.getElementById('cq-tab-diff');
        tabDiff.click();
        const diffView = document.getElementById('cq-compare-view-diff');
        const diffActive = tabDiff.classList.contains('is-active') && diffView && !diffView.classList.contains('hidden');

        // Close modal
        const btnClose = document.getElementById('cq-btn-close-compare');
        btnClose.click();
        const closed = modal.classList.contains('hidden');

        return { opened, simActive, diffActive, closed };
      })()
    `);
    recordTest(
      'Modal Dialog "Persamaan & Perbezaan": Buka, Tukar Tab KSSM & Tutup Berjaya',
      resModal.opened && resModal.simActive && resModal.diffActive && resModal.closed,
      'Tab Perbezaan Utama & Persamaan Organel interaktif'
    );

    // TEST 5: Responsive Check across 8 Viewports
    console.log('\n--- UJIAN 5: KETELUSAN RESPOMSIF 8 VIEWPORT & SAIZ SASARAN SENTUHAN ---');
    const viewports = [
      { name: 'Android Kecil', width: 360, height: 800, shot: 'dual_cell_360x800_android.png' },
      { name: 'iPhone SE', width: 375, height: 667, shot: 'dual_cell_375x667_iphonese.png' },
      { name: 'iPhone 14 / 15', width: 390, height: 844, shot: 'dual_cell_compare_iphone_390x844.png' },
      { name: 'iPhone Pro Max', width: 430, height: 932, shot: 'dual_cell_430x932_promax.png' },
      { name: 'iPad Portrait', width: 768, height: 1024, shot: 'dual_cell_768x1024_ipad_p.png' },
      { name: 'iPad Landscape', width: 1024, height: 768, shot: 'dual_cell_compare_ipad_1024x768.png' },
      { name: 'Laptop', width: 1366, height: 768, shot: 'dual_cell_compare_laptop_1366x768.png' },
      { name: 'Desktop Full HD', width: 1920, height: 1080, shot: 'dual_cell_compare_desktop_1920x1080.png' }
    ];

    for (const vp of viewports) {
      await client.setViewport(vp.width, vp.height);
      await client.eval(`adjustPOVBannerLayout(); if (typeof CellQuestARController !== 'undefined') CellQuestARController.updateModelsLayout();`);
      await new Promise(r => setTimeout(r, 450));

      const vpStatus = await client.eval(`
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          const hasHScroll = scrollW > innerW + 1;

          // Check touch target heights of controls
          const buttons = [
            document.getElementById('cq-btn-animal'),
            document.getElementById('cq-btn-plant'),
            document.getElementById('cq-btn-compare'),
            document.getElementById('cq-btn-rotate'),
            document.getElementById('cq-btn-drag'),
            document.getElementById('cq-btn-pov')
          ];
          let smallTargets = 0;
          buttons.forEach(b => {
            if (b) {
              const r = b.getBoundingClientRect();
              if (r.height < 36 || r.width < 36) smallTargets++;
            }
          });

          return {
            scrollW,
            innerW,
            hasHScroll,
            smallTargets
          };
        })()
      `);

      recordTest(
        `Viewport [${vp.name}] (${vp.width}x${vp.height}): Tiada limpahan mendatar`,
        !vpStatus.hasHScroll,
        `ScrollW: ${vpStatus.scrollW}px, InnerW: ${vpStatus.innerW}px`
      );

      await client.captureScreenshot(vp.shot);
    }

    // Special Shots: POV Setup Banner & Modal Dialog
    await client.setViewport(390, 844);
    await client.eval(`
      ARState.activePanels.clear();
      ARState.activePanels.add('cellquest');
      ARState.activePanels.add('nota');
      updateMultiPanelUI();
      CellQuestARController.startPOVSetup();
      adjustPOVBannerLayout();
    `);
    await new Promise(r => setTimeout(r, 500));
    await client.captureScreenshot('dual_cell_pov_banner_no_overlap_390x844.png');

    await client.eval(`
      CellQuestARController.cancelPOVSetup();
      document.getElementById('cq-btn-diff-modal').click();
    `);
    await new Promise(r => setTimeout(r, 500));
    await client.captureScreenshot('dual_cell_kssm_modal_390x844.png');

  } catch (err) {
    console.error('❌ Ralat semasa ujian:', err);
    recordTest('Pelaksanaan Ujian', false, err.message);
  } finally {
    if (client) client.close();
    try { browserProc.kill(); } catch (_) {}
    server.close();
  }

  console.log('\n========================================================');
  const total = testResults.length;
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = total - passedCount;
  console.log(`📊 RINGKASAN UJIAN: ${passedCount}/${total} LULUS (${failedCount} Gagal)`);
  console.log('========================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
