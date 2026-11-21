/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * MULTI-MODULE SIMULTANEOUS POV LOCKING TEST
 * Video, Nota & CellQuest 3D Simultaneous Visibility & Independent 3DoF World-Locking
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 60562;
const CDP_PORT = 9302;
const ROOT_DIR = path.resolve(__dirname, '..');

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
    const trimmed = expression.trim();
    let code;
    if (trimmed.startsWith('(()') || trimmed.startsWith('function')) {
      code = trimmed;
    } else if (trimmed.includes(';') || trimmed.includes('\n')) {
      code = `(() => {\n${trimmed}\n})()`;
    } else {
      code = trimmed;
    }
    const res = await this.send('Runtime.evaluate', {
      expression: code,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('================================================================');
  console.log('🔬 ARSELNEL QA: MULTI-MODULE SIMULTANEOUS POV LOCKING TEST');
  console.log('================================================================\n');

  const server = await startServer();
  console.log(`[HTTP] Pelayan ujian berjalan di http://127.0.0.1:${PORT}`);

  const browserPath = findBrowser();
  const userDataDir = path.join(ROOT_DIR, 'tmp_test_browser_profile_' + Date.now());
  const browserProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `http://127.0.0.1:${PORT}/kotak_arselnel/code.html`
  ]);

  let cdp;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
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

  if (!cdp) {
    throw new Error('Gagal menyambung ke CDP pelayar');
  }

  await sleep(1500);

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`  [Ujian ${total}] ✅ LULUS - ${title}`);
      passed++;
    } else {
      console.error(`  [Ujian ${total}] ❌ GAGAL - ${title} ${extra}`);
    }
  }

  try {
    // Inisialisasi Mock Three.js Scene & Anchors untuk ujian headless
    await cdp.eval(`
      (() => {
        window.alert = () => {};
        window.confirm = () => true;
        if (typeof THREE !== 'undefined' && typeof ARState !== 'undefined') {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.05, 1000);
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
          ARState.anchorVideo = makeAnchor();
          ARState.anchorNota = makeAnchor();
          ARState.anchorKuiz = makeAnchor();
          ARState.anchorCellQuestAnimal = makeAnchor();
          ARState.anchorCellQuestPlant = makeAnchor();
          ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
          if (typeof CellQuestARController !== 'undefined') {
            CellQuestARController.init(scene, ARState.anchorCellQuest.group, camera, null);
          }
        }
      })()
    `);

    // Ujian 1: SpatialPanelManager initializes with Video, Nota & CellQuest
    const spmPanels = await cdp.eval(`Array.from(SpatialPanelManager.panels.keys())`);
    assert('SpatialPanelManager mendaftar video, nota, dan cellquest',
      spmPanels && spmPanels.includes('video') && spmPanels.includes('nota') && spmPanels.includes('cellquest'),
      `Ditemui: ${JSON.stringify(spmPanels)}`
    );

    // Ujian 2: Initial scan Video and enter POV Lock
    await cdp.eval(`
      handleTargetFound(0, 'video');
      SpatialPanelManager.enterPanelPOVSetup('video');
      SpatialPanelManager.lockPanelPOV('video');
    `);
    const vidState = await cdp.eval(`
      const p = SpatialPanelManager.getPanel('video');
      return ({
        placementMode: p.placementMode,
        isLocked: p.isLocked,
        isVisible: p.isVisible,
        hasAnchor: !!p.anchorWorldVector
      });
    `);
    assert('Video berjaya memasuki mod POV_LOCKED dengan anchor bebas',
      vidState.placementMode === 'POV_LOCKED' && vidState.isLocked && vidState.isVisible && vidState.hasAnchor,
      JSON.stringify(vidState)
    );

    // Ujian 3: Add Scan Nota while Video is POV_LOCKED
    await cdp.eval(`
      handleTargetFound(1, 'nota');
    `);
    const stateAfterNotaAdd = await cdp.eval(`
      const pVid = SpatialPanelManager.getPanel('video');
      const pNota = SpatialPanelManager.getPanel('nota');
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      return ({
        vidVisible: pVid.isVisible && !elVid.classList.contains('hidden'),
        vidLocked: pVid.placementMode === 'POV_LOCKED',
        notaActive: ARState.activeModule === 'nota',
        notaVisible: pNota.isVisible && !elNota.classList.contains('hidden'),
        activePanelsCount: ARState.activePanels.size
      });
    `);
    assert('Penambahan Nota mengekalkan Video POV_LOCKED tanpa menyembunyikannya',
      stateAfterNotaAdd.vidVisible && stateAfterNotaAdd.vidLocked && stateAfterNotaAdd.notaActive && stateAfterNotaAdd.notaVisible,
      JSON.stringify(stateAfterNotaAdd)
    );

    // Ujian 4: Lock Nota in POV Lock -> Both Video and Nota are simultaneously visible & locked
    await cdp.eval(`
      SpatialPanelManager.enterPanelPOVSetup('nota');
      SpatialPanelManager.lockPanelPOV('nota');
    `);
    const dualLockState = await cdp.eval(`
      const pVid = SpatialPanelManager.getPanel('video');
      const pNota = SpatialPanelManager.getPanel('nota');
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      return ({
        vidMode: pVid.placementMode,
        vidVis: !elVid.classList.contains('hidden'),
        notaMode: pNota.placementMode,
        notaVis: !elNota.classList.contains('hidden'),
        bothVisible: !elVid.classList.contains('hidden') && !elNota.classList.contains('hidden')
      });
    `);
    assert('Video dan Nota serentak kelihatan (simultaneously visible) dan dikunci dalam 3DoF',
      dualLockState.bothVisible && dualLockState.vidMode === 'POV_LOCKED' && dualLockState.notaMode === 'POV_LOCKED',
      JSON.stringify(dualLockState)
    );

    // Ujian 5: Add Scan CellQuest 3D (Animal Cell)
    await cdp.eval(`
      handleTargetFound(3, 'cellquest', 'animal');
    `);
    const stateAfterCQAdd = await cdp.eval(`
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      const elCQ = document.getElementById('cellquest-ar-hud');
      const cqActive = CellQuestARController.isActive;
      return ({
        vidVis: !elVid.classList.contains('hidden'),
        notaVis: !elNota.classList.contains('hidden'),
        cqActive: cqActive,
        cqHudVis: elCQ && !elCQ.classList.contains('hidden'),
        activePanels: Array.from(ARState.activePanels)
      });
    `);
    assert('Pengimbasan CellQuest 3D tidak merosakkan Video atau Nota yang telah dikunci',
      stateAfterCQAdd.vidVis && stateAfterCQAdd.notaVis && stateAfterCQAdd.cqActive,
      JSON.stringify(stateAfterCQAdd)
    );

    // Ujian 6: CellQuest POV Setup Dialog Positioning (No overlap with Multi-Panel Bar)
    await cdp.eval(`
      CellQuestARController.startPOVSetup();
    `);
    const setupBannerCollision = await cdp.eval(`
      const banner = document.getElementById('cq-pov-setup-banner');
      const multiBar = document.getElementById('ar-multi-panel-bar');
      const bRect = banner.getBoundingClientRect();
      const mRect = multiBar.getBoundingClientRect();
      return ({
        bannerVisible: !banner.classList.contains('hidden'),
        bannerTop: bRect.top,
        multiBarBottom: mRect.bottom,
        isClear: bRect.top >= mRect.bottom - 2
      });
    `);
    assert('Panel "Letak di Arah Ini" CellQuest terletak kemas di bawah Multi-Panel Bar tanpa pertindihan',
      setupBannerCollision.bannerVisible && setupBannerCollision.isClear,
      JSON.stringify(setupBannerCollision)
    );

    // Ujian 7: Lock CellQuest in POV -> All 3 Modules Simultaneously Visible and Independently Locked
    await cdp.eval(`
      CellQuestARController.anchorPOVAtCurrentHeading();
    `);
    const tripleLockState = await cdp.eval(`
      const pVid = SpatialPanelManager.getPanel('video');
      const pNota = SpatialPanelManager.getPanel('nota');
      const pCQ = SpatialPanelManager.getPanel('cellquest');
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      const cqModelVisible = !!(CellQuestARController.rootGroup && CellQuestARController.rootGroup.visible);
      return ({
        vidLocked: pVid.placementMode === 'POV_LOCKED' && !elVid.classList.contains('hidden'),
        notaLocked: pNota.placementMode === 'POV_LOCKED' && !elNota.classList.contains('hidden'),
        cqLocked: CellQuestARController.spatialMode === 'POV_LOCKED' && cqModelVisible,
        pCQMode: pCQ.placementMode,
        allThreeActive: ARState.activePanels.size === 3
      });
    `);
    assert('Semua TIGA Modul (Video, Nota, CellQuest 3D) serentak aktif, kelihatan & dikunci 3DoF',
      tripleLockState.vidLocked && tripleLockState.notaLocked && tripleLockState.cqLocked && tripleLockState.allThreeActive,
      JSON.stringify(tripleLockState)
    );

    // Ujian 8: Multi-Panel Pills display lock badges (🔒)
    const pillsLockBadge = await cdp.eval(`
      const pills = Array.from(document.querySelectorAll('.multi-pill'));
      return pills.map(p => ({
        text: p.innerText.trim(),
        hasLock: p.innerHTML.includes('🔒')
      }));
    `);
    const allHaveLock = pillsLockBadge && pillsLockBadge.every(p => p.hasLock);
    assert('Pil pada bar modul memaparkan lencana kunci 🔒 untuk setiap modul POV_LOCKED',
      allHaveLock && pillsLockBadge.length === 3,
      JSON.stringify(pillsLockBadge)
    );

    // Ujian 9: Switching Focus to Nota elevates Nota z-index without hiding Video or CellQuest
    await cdp.eval(`
      focusPanel('nota');
    `);
    const focusNotaState = await cdp.eval(`
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      const cqModelVis = !!(CellQuestARController.rootGroup && CellQuestARController.rootGroup.visible);
      return ({
        activeModule: ARState.activeModule,
        notaZ: elNota.style.zIndex,
        vidZ: elVid.style.zIndex,
        vidVis: !elVid.classList.contains('hidden'),
        notaVis: !elNota.classList.contains('hidden'),
        cqVis: cqModelVis
      });
    `);
    assert('Fokus ke Nota menaikkan zIndex Nota (2200) sambil mengekalkan Video (2100) dan CellQuest 3D kelihatan',
      focusNotaState.activeModule === 'nota' &&
      focusNotaState.notaZ === '2200' &&
      focusNotaState.vidZ === '2100' &&
      focusNotaState.vidVis &&
      focusNotaState.cqVis,
      JSON.stringify(focusNotaState)
    );

    // Ujian 10: Switching Focus to Video elevates Video z-index without hiding Nota or CellQuest
    await cdp.eval(`
      focusPanel('video');
    `);
    const focusVidState = await cdp.eval(`
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      const cqModelVis = !!(CellQuestARController.rootGroup && CellQuestARController.rootGroup.visible);
      return ({
        activeModule: ARState.activeModule,
        vidZ: elVid.style.zIndex,
        notaZ: elNota.style.zIndex,
        vidVis: !elVid.classList.contains('hidden'),
        notaVis: !elNota.classList.contains('hidden'),
        cqVis: cqModelVis
      });
    `);
    assert('Fokus ke Video menaikkan zIndex Video (2200) sambil mengekalkan Nota (2100) dan CellQuest 3D kelihatan',
      focusVidState.activeModule === 'video' &&
      focusVidState.vidZ === '2200' &&
      focusVidState.notaZ === '2100' &&
      focusVidState.notaVis &&
      focusVidState.cqVis,
      JSON.stringify(focusVidState)
    );

    // Ujian 11: Closing Nota preserves Video and CellQuest 3D
    await cdp.eval(`
      const closeBtn = document.querySelector('.pill-close-btn[data-panel="nota"]');
      if (closeBtn) closeBtn.click();
    `);
    const stateAfterCloseNota = await cdp.eval(`
      const elVid = document.getElementById('pov-panel-video');
      const elNota = document.getElementById('pov-panel-nota');
      const cqModelVis = !!(CellQuestARController.rootGroup && CellQuestARController.rootGroup.visible);
      return ({
        notaInActivePanels: ARState.activePanels.has('nota'),
        notaHidden: elNota.classList.contains('hidden'),
        vidVis: !elVid.classList.contains('hidden'),
        cqVis: cqModelVis,
        activePanelsCount: ARState.activePanels.size
      });
    `);
    assert('Penutupan Nota mengekalkan Video dan CellQuest 3D secara selamat',
      !stateAfterCloseNota.notaInActivePanels &&
      stateAfterCloseNota.notaHidden &&
      stateAfterCloseNota.vidVis &&
      stateAfterCloseNota.cqVis &&
      stateAfterCloseNota.activePanelsCount === 2,
      JSON.stringify(stateAfterCloseNota)
    );

  } catch (err) {
    console.error('Ralat semasa menjalankan ujian:', err);
  } finally {
    try {
      if (browserProc) browserProc.kill();
    } catch (e) {}
    try {
      server.close();
    } catch (e) {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }

  console.log('\n================================================================');
  console.log(`Keputusan Ujian: ${passed}/${total} LULUS`);
  console.log('================================================================\n');

  if (passed === total && total > 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
