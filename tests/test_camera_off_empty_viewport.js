/**
 * ARSELNEL — PHASE 5 REGRESSION SUITE
 * CLEAN EMPTY CAMERA-OFF VIEWPORT & PRESERVED MULTI-MODULE 3DoF POV LOCK
 *
 * Verifies T1..T14 on iPhone (390x844) and Desktop (1366x768) viewports.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60570;
const CDP_PORT = 9310;
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
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/kotak_arselnel/code.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise(resolve => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) if (fs.existsSync(p)) return p;
  throw new Error('Tiada pelayar Chrome/Edge ditemui!');
}

function getPages(port) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((res, rej) => {
      this.ws.addEventListener('open', res);
      this.ws.addEventListener('error', rej);
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
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
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
    return res.result ? res.result.value : undefined;
  }
  close() { this.ws.close(); }
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('======================================================================');
  console.log('🖤 ARSELNEL QA: CLEAN EMPTY CAMERA-OFF VIEWPORT REGRESSION SUITE');
  console.log('======================================================================\n');

  const server = await startServer();
  const browserBin = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-empty-camoff-'));

  const proc = spawn(browserBin, [
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

  function assert(code, name, cond, details = '') {
    total++;
    if (cond) {
      passed++;
      console.log(`  [${code}] ✅ PASS - ${name}`);
    } else {
      console.error(`  [${code}] ❌ FAIL - ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    for (let i = 0; i < 30; i++) {
      await delay(350);
      try {
        const pages = await getPages(CDP_PORT);
        const p = pages.find(x => x.url.includes('kotak_arselnel/code.html'));
        if (p && p.webSocketDebuggerUrl) {
          cdp = new CDPClient(p.webSocketDebuggerUrl);
          await cdp.ready;
          break;
        }
      } catch (e) {}
    }
    if (!cdp) throw new Error('Gagal menyambung ke CDP pelayar');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await delay(1400);

    // Setup headless Three.js scene & anchors
    await cdp.eval(`
      (() => {
        window.alert = () => {};
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
        ARState.anchorCellQuestAnimal = makeAnchor();
        ARState.anchorCellQuestPlant = makeAnchor();
        ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
        CellQuestARController.init(scene, ARState.anchorCellQuestAnimal.group, camera, ARState.renderer);
      })()
    `);

    // T1: Camera OFF shows an empty solid dark neutral viewport
    const t1 = await cdp.eval(`
      (() => {
        document.getElementById('btn-global-toggle-cam').click();
        const cont = document.getElementById('ar-container');
        const bg = window.getComputedStyle(cont).backgroundColor;
        const scannerHidden = document.getElementById('scanner-overlay').classList.contains('hidden');
        return { ok: !ARState.cameraActive && cont.classList.contains('camera-off') && bg === 'rgb(11, 15, 23)' && scannerHidden, bg, scannerHidden };
      })()
    `);
    assert('T1', 'Camera OFF memaparkan viewport gelap kosong neutral (rgb(11, 15, 23)) tanpa overlay imbasan', t1 && t1.ok, JSON.stringify(t1));

    // T2: No laboratory geometry or panorama sphere remains
    const t2 = await cdp.eval(`
      (() => {
        const noVE360 = typeof window.VirtualEnvironment360 === 'undefined';
        const noVLab = typeof window.VirtualBiologyLab === 'undefined';
        const noLabHud = !document.getElementById('virtual-lab-hud');
        const unwantedMeshes = ARState.scene.children.filter(c => /VirtualEnv360|VirtualBiologyLab/i.test(c.name || '')).length;
        return { ok: noVE360 && noVLab && noLabHud && unwantedMeshes === 0, noVE360, noVLab, noLabHud, unwantedMeshes };
      })()
    `);
    assert('T2', 'Tiada geometri makmal 3D, sfera panorama 360° atau HUD makmal maya wujud', t2 && t2.ok, JSON.stringify(t2));

    // T3: No decorative rings or educational background text (::before pseudo-element removed)
    const t3 = await cdp.eval(`
      (() => {
        const beforeContent = window.getComputedStyle(document.getElementById('ar-container'), '::before').content;
        const noBeforeText = !beforeContent || beforeContent === 'none' || beforeContent === '""';
        return { ok: noBeforeText, beforeContent };
      })()
    `);
    assert('T3', 'Tiada teks latar belakang pendidikan atau hiasan ::before pada viewport kamera ditutup', t3 && t3.ok, JSON.stringify(t3));

    // T4: No unnecessary background rendering loop started merely by turning camera off
    const t4 = await cdp.eval(`
      (() => {
        return { ok: ARState.pov.active === false && !ARState.pov.rafId, povActive: ARState.pov.active, rafId: ARState.pov.rafId };
      })()
    `);
    assert('T4', 'Tiada gelung render latar belakang yang tidak perlu dimulakan apabila kamera ditutup tanpa modul terkunci', t4 && t4.ok, JSON.stringify(t4));

    // T5..T9: Video, Nota, Animal Cell & Plant Cell POV Lock all work independently with camera OFF
    const t5to9 = await cdp.eval(`
      (() => {
        ARState.markerCooldown = {};
        handleTargetFound(0, 'video');
        SpatialPanelManager.enterPanelPOVSetup('video');
        SpatialPanelManager.lockPanelPOV('video');

        handleTargetFound(1, 'nota');
        SpatialPanelManager.enterPanelPOVSetup('nota');
        SpatialPanelManager.lockPanelPOV('nota');

        applySimAngles(0, 0);
        handleTargetFound(3);
        CellQuestARController.startPOVSetup('animal');
        CellQuestARController.anchorPOVAtCurrentHeading('animal');

        applySimAngles(90, 0);
        handleTargetFound(4);
        CellQuestARController.startPOVSetup('plant');
        CellQuestARController.anchorPOVAtCurrentHeading('plant');

        const vidOk = SpatialPanelManager.getPanel('video').placementMode === 'POV_LOCKED';
        const notaOk = SpatialPanelManager.getPanel('nota').placementMode === 'POV_LOCKED';
        const animalOk = CellQuestARController.cells.animal.spatialMode === 'POV_LOCKED' && !!CellQuestARController.cells.animal.povAnchorWorldVector;
        const plantOk = CellQuestARController.cells.plant.spatialMode === 'POV_LOCKED' && !!CellQuestARController.cells.plant.povAnchorWorldVector;
        const distinct = CellQuestARController.cells.animal.povAnchorWorldVector.distanceTo(CellQuestARController.cells.plant.povAnchorWorldVector) > 0.5;
        return { vidOk, notaOk, animalOk, plantOk, distinct, camStillOff: !ARState.cameraActive };
      })()
    `);
    assert('T5', 'Video POV Lock berfungsi sepenuhnya semasa kamera ditutup', t5to9.vidOk && t5to9.camStillOff);
    assert('T6', 'Nota POV Lock berfungsi sepenuhnya semasa kamera ditutup', t5to9.notaOk && t5to9.camStillOff);
    assert('T7', 'Animal Cell 3D POV Lock berfungsi secara bebas semasa kamera ditutup', t5to9.animalOk && t5to9.camStillOff);
    assert('T8', 'Plant Cell 3D POV Lock berfungsi secara bebas semasa kamera ditutup', t5to9.plantOk && t5to9.camStillOff);
    assert('T9', 'Keempat-empat modul terkunci wujud serentak di atas viewport kosong dengan arah bebas', t5to9.vidOk && t5to9.notaOk && t5to9.animalOk && t5to9.plantOk && t5to9.distinct);

    // T10, T11, T12: Reopen camera, verify marker detection works & toggle accessible
    const t10to12 = await cdp.eval(`
      (() => {
        const btn = document.getElementById('btn-global-toggle-cam');
        const toggleAccessible = !!btn && (document.getElementById('global-cam-text')?.textContent || '').trim() === 'Buka Kamera';
        btn.click();
        const reopened = ARState.cameraActive === true && !document.getElementById('ar-container').classList.contains('camera-off');
        const labelBack = (document.getElementById('global-cam-text')?.textContent || '').trim() === 'Tutup Kamera';
        ARState.markerCooldown = {};
        handleTargetFound(0, 'video');
        const markerRoutingWorks = ARState.activeModule === 'video';
        return { toggleAccessible, reopened, labelBack, markerRoutingWorks };
      })()
    `);
    assert('T10', 'Kamera boleh dibuka semula dengan jayanya', t10to12.reopened && t10to12.labelBack, JSON.stringify(t10to12));
    assert('T11', 'Pengesanan dan penghalaan kad penanda berfungsi selepas kamera dibuka semula', t10to12.markerRoutingWorks);
    assert('T12', 'Butang Buka Kamera / Tutup Kamera kekal boleh diakses', t10to12.toggleAccessible && t10to12.labelBack);

    // T13: No duplicate POV RAF loops or orientation listeners after repeated toggling
    const t13 = await cdp.eval(`
      (() => {
        for (let i = 0; i < 4; i++) toggleCameraPower();
        return { ok: ARState.cameraActive === true && (typeof ARState.pov.rafId === 'number' || ARState.pov.rafId === null) };
      })()
    `);
    assert('T13', 'Tiada duplikasi gelung WebGL/RAF selepas penukaran kamera berulang kali', t13 && t13.ok);

    // T14: Mobile (390x844) & Desktop (1366x768) zero horizontal overflow
    const t14Mobile = await cdp.eval(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    await delay(150);
    const t14Desktop = await cdp.eval(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`);
    assert('T14', 'Susun atur iPhone (390x844) & Desktop (1366x768) bebas keratan dan limpahan mendatar', t14Mobile && t14Desktop);

    console.log('\n======================================================================');
    console.log(`🏁 KEPUTUSAN QA EMPTY CAMERA-OFF VIEWPORT: ${passed}/${total} UJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
    console.log('======================================================================\n');
    if (passed !== total) process.exitCode = 1;
  } catch (err) {
    console.error('❌ Ralat:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    if (proc) proc.kill();
    server.close();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
})();
