/**
 * ARSELNEL — AUTOMATED QA SUITE: INTERACTIVE 3D VIRTUAL BIOLOGY LABORATORY
 * Verifies Camera-Off 3D Biology Lab architecture, workstation, microscope,
 * strict Animal/Plant specimen separation, explicit comparison mode,
 * 3DoF viewpoint + Kunci Pandangan lock, organelle info card, and mobile UI.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60569;
const CDP_PORT = 9309;
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
  console.log('🧪 ARSELNEL QA: INTERACTIVE 3D VIRTUAL BIOLOGY LABORATORY SUITE');
  console.log('======================================================================\n');

  const server = await startServer();
  const browserBin = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-vlab-'));

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

    // Setup headless Three.js scene & initialize VirtualBiologyLab
    await cdp.eval(`
      (() => {
        window.alert = () => {};
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, 390 / 844, 0.05, 1000);
        scene.add(camera);
        ARState.scene = scene;
        ARState.camera = camera;
        ARState.renderer = { render: () => {}, setAnimationLoop: () => {}, setPixelRatio: () => {}, getContext: () => ({ isContextLost: () => false }), domElement: document.createElement('canvas') };
        VirtualEnvironment360.init(scene, ARState.renderer, camera);
        VirtualBiologyLab.init(scene, ARState.renderer, camera);
      })()
    `);

    // V1: Closing camera activates 3D Virtual Biology Laboratory with architecture, workstation & microscope
    const v1 = await cdp.eval(`
      (() => {
        document.getElementById('btn-global-toggle-cam').click();
        const hudVisible = !document.getElementById('virtual-lab-hud').classList.contains('hidden');
        const labVisible = VirtualBiologyLab.isActive && VirtualBiologyLab.labRoot && VirtualBiologyLab.labRoot.visible;
        const hasWorkstation = !!VirtualBiologyLab.workstationGroup && VirtualBiologyLab.workstationGroup.children.length >= 6;
        const hasMicroscope = !!VirtualBiologyLab.microscopeGroup && VirtualBiologyLab.microscopeGroup.children.length >= 8;
        const noAutoSpecimen = VirtualBiologyLab.activeSpecimen === 'none' && !VirtualBiologyLab.animalHolder.visible && !VirtualBiologyLab.plantHolder.visible;
        return { ok: hudVisible && labVisible && hasWorkstation && hasMicroscope && noAutoSpecimen, hudVisible, labVisible, hasWorkstation, hasMicroscope, noAutoSpecimen };
      })()
    `);
    assert('V1', 'Tutup Kamera membuka Makmal Biologi Maya 3D lengkap (meja eksperimen, mikroskop, radas) tanpa auto-papar sel', v1 && v1.ok, JSON.stringify(v1));

    // V2: Selecting Sel Haiwan displays ONLY Animal Cell
    const v2 = await cdp.eval(`
      (() => {
        document.getElementById('vlab-btn-animal').click();
        return {
          ok: VirtualBiologyLab.activeSpecimen === 'animal' && VirtualBiologyLab.animalHolder.visible && !VirtualBiologyLab.plantHolder.visible,
          spec: VirtualBiologyLab.activeSpecimen, aVis: VirtualBiologyLab.animalHolder.visible, pVis: VirtualBiologyLab.plantHolder.visible
        };
      })()
    `);
    assert('V2', 'Memilih Sel Haiwan memaparkan Sel Haiwan SAHAJA (Sel Tumbuhan kekal tersembunyi)', v2 && v2.ok, JSON.stringify(v2));

    // V3: Selecting Sel Tumbuhan displays ONLY Plant Cell
    const v3 = await cdp.eval(`
      (() => {
        document.getElementById('vlab-btn-plant').click();
        return {
          ok: VirtualBiologyLab.activeSpecimen === 'plant' && VirtualBiologyLab.plantHolder.visible && !VirtualBiologyLab.animalHolder.visible,
          spec: VirtualBiologyLab.activeSpecimen, aVis: VirtualBiologyLab.animalHolder.visible, pVis: VirtualBiologyLab.plantHolder.visible
        };
      })()
    `);
    assert('V3', 'Memilih Sel Tumbuhan memaparkan Sel Tumbuhan SAHAJA (Sel Haiwan kekal tersembunyi)', v3 && v3.ok, JSON.stringify(v3));

    // V4: Explicit Compare Mode displays both cells in separate observation positions
    const v4 = await cdp.eval(`
      (() => {
        document.getElementById('vlab-btn-compare').click();
        const aX = VirtualBiologyLab.animalHolder.position.x;
        const pX = VirtualBiologyLab.plantHolder.position.x;
        return {
          ok: VirtualBiologyLab.activeSpecimen === 'compare' && VirtualBiologyLab.animalHolder.visible && VirtualBiologyLab.plantHolder.visible && aX < 0 && pX > 0,
          aX, pX
        };
      })()
    `);
    assert('V4', 'Mod Bandingkan eksplisit memaparkan Sel Haiwan (kiri) & Sel Tumbuhan (kanan) secara berasingan', v4 && v4.ok, JSON.stringify(v4));

    // V5: Contextual Organelle Info Card opens on organelle selection and closes cleanly
    const v5 = await cdp.eval(`
      (() => {
        VirtualBiologyLab.selectOrganelle('nucleus', 'animal');
        const card = document.getElementById('vlab-organelle-card');
        const name = (document.getElementById('vlab-org-name')?.textContent || '').trim();
        const opened = card && !card.classList.contains('hidden') && name.includes('Nukleus');
        document.getElementById('vlab-org-close').click();
        const closed = card && card.classList.contains('hidden');
        return { ok: opened && closed, name, opened, closed };
      })()
    `);
    assert('V5', 'Kad maklumat organel kontekstual muncul apabila organel dipilih & ditutup dengan kemas', v5 && v5.ok, JSON.stringify(v5));

    // V6: Kunci Pandangan / Buka Kunci Pandangan toggles viewpoint lock without freezing cell zoom/rotation
    const v6 = await cdp.eval(`
      (() => {
        VirtualBiologyLab.selectSpecimen('animal');
        document.getElementById('vlab-btn-lock-view').click();
        const lockedLabel = (document.getElementById('vlab-lock-label')?.textContent || '').trim();
        const isLocked = VirtualBiologyLab.viewLocked === true && lockedLabel === 'Buka Kunci Pandangan';

        const scaleBefore = VirtualBiologyLab.specimenTransform.animal.scale;
        document.getElementById('vlab-btn-zoom-in').click();
        const scaleAfter = VirtualBiologyLab.specimenTransform.animal.scale;

        document.getElementById('vlab-btn-lock-view').click();
        const unlockedLabel = (document.getElementById('vlab-lock-label')?.textContent || '').trim();
        const isUnlocked = VirtualBiologyLab.viewLocked === false && unlockedLabel === 'Kunci Pandangan';

        return { ok: isLocked && scaleAfter > scaleBefore && isUnlocked, lockedLabel, unlockedLabel, scaleBefore, scaleAfter };
      })()
    `);
    assert('V6', 'Kunci Pandangan / Buka Kunci Pandangan mengunci kamera tanpa membekukan interaksi model sel', v6 && v6.ok, JSON.stringify(v6));

    // V7: Reset View & Return to Experiment Workstation work cleanly
    const v7 = await cdp.eval(`
      (() => {
        document.getElementById('vlab-btn-reset-view').click();
        const resetOk = VirtualBiologyLab.specimenTransform.animal.scale === 1.0 && VirtualBiologyLab.viewTargetYaw === 0;
        document.getElementById('vlab-btn-workstation').click();
        const backOk = VirtualBiologyLab.activeSpecimen === 'none' && !VirtualBiologyLab.animalHolder.visible && !VirtualBiologyLab.plantHolder.visible;
        return { ok: resetOk && backOk, resetOk, backOk };
      })()
    `);
    assert('V7', 'Tetapkan Semula Pandangan & Kembali ke Meja Eksperimen berfungsi dengan tepat', v7 && v7.ok, JSON.stringify(v7));

    // V8: Zero horizontal overflow across mobile viewports (320, 375, 390, 430, 768)
    const widths = [320, 375, 390, 430, 768];
    const vpRes = [];
    for (const w of widths) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: 844, deviceScaleFactor: 2, mobile: w < 768 });
      await delay(120);
      const r = await cdp.eval(`({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })`);
      vpRes.push({ w, ok: r.sw <= r.cw + 1, ...r });
    }
    assert('V8', 'UI Makmal Biologi Maya 3D bebas limpahan mendatar pada 320, 375, 390, 430 & 768px', vpRes.every(x => x.ok), JSON.stringify(vpRes));

    // V9: Reopening camera cleanly exits Virtual Lab & restores AR mode without duplicates
    const v9 = await cdp.eval(`
      (() => {
        document.getElementById('btn-global-toggle-cam').click();
        const labHidden = !VirtualBiologyLab.isActive && !VirtualBiologyLab.labRoot.visible;
        const hudHidden = document.getElementById('virtual-lab-hud').classList.contains('hidden');
        const camOn = ARState.cameraActive === true && ARState.virtualLabActive === false;
        // Toggle off and on again to verify zero duplicate labRoot children
        document.getElementById('btn-global-toggle-cam').click();
        document.getElementById('btn-global-toggle-cam').click();
        const labRoots = ARState.scene.children.filter(c => c.name === 'ARSELNEL_VirtualBiologyLab3D').length;
        return { ok: labHidden && hudHidden && camOn && labRoots === 1, labHidden, hudHidden, camOn, labRoots };
      })()
    `);
    assert('V9', 'Buka Kamera menutup Makmal Maya 3D dengan bersih & berulang kali tanpa menduplikasi objek 3D', v9 && v9.ok, JSON.stringify(v9));

    console.log('\n======================================================================');
    console.log(`🏁 KEPUTUSAN QA MAKMAL BIOLOGI MAYA 3D: ${passed}/${total} UJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
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
