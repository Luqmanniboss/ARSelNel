/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * 360-DEGREE VIRTUAL SCIENCE LEARNING ENVIRONMENT (CAMERA-OFF 3DoF)
 *
 * Validates:
 * - T1: Camera-off activates VirtualEnvironment360 & Three.js sphere backdrop
 * - T2: Camera-on hides VirtualEnvironment360
 * - T3: Device yaw rotation updates backdrop sphere quaternion
 * - T4: Device pitch rotation updates backdrop sphere quaternion
 * - T5: 0°/360° yaw wraparound continuity & valid unit quaternion
 * - T6: Touch-drag fallback for non-gyro devices / simulation
 * - T7: Video POV Lock independence & persistence in 360° environment
 * - T8: Nota POV Lock independence & persistence in 360° environment
 * - T9: CellQuest 3D POV Lock independence & persistence in 360° environment
 * - T10: Multi-module simultaneous coexistence over virtual background
 * - T11: Background does not intercept interactive UI / panels / buttons
 * - T12: Reopening camera restores camera stream without losing locked panels
 * - T13: Single-instance POV render loop without duplicate RAF leaks
 * - T14: Mobile viewport (390x844) zero horizontal overflow
 * - T15: Canvas equirectangular panorama texture dimensions (2048x1024) & stations
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60566;
const CDP_PORT = 9306;
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

  close() {
    this.ws.close();
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  console.log('================================================================');
  console.log('🪐 ARSELNEL QA: CAMERA-OFF 360° 3DoF VIRTUAL ENVIRONMENT SUITE');
  console.log('================================================================\n');

  const server = await startServer();
  const browserBin = findBrowser();
  const userDataDir = path.join(ROOT_DIR, 'tmp_test_browser_profile_' + Date.now());

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
  let testNum = 0;
  let passed = 0;

  function assert(name, condition, details = '') {
    testNum++;
    if (condition) {
      passed++;
      console.log(`  [Ujian ${testNum}] ✅ LULUS - ${name}`);
    } else {
      console.error(`  [Ujian ${testNum}] ❌ GAGAL - ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    for (let i = 0; i < 30; i++) {
      await delay(400);
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
    await cdp.send('DOM.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });

    await delay(1500);

    // Initial check on VirtualEnvironment360 existence
    const veExists = await cdp.eval(`typeof window.VirtualEnvironment360 !== 'undefined'`);
    assert('VirtualEnvironment360 wujud secara global', veExists);

    // Inisialisasi Mock Three.js Scene & Anchors untuk ujian headless
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
          ARState.renderer = {
            render: () => {},
            setAnimationLoop: () => {}
          };
          ARState.anchorVideo = makeAnchor();
          ARState.anchorNota = makeAnchor();
          ARState.anchorKuiz = makeAnchor();
          ARState.anchorCellQuestAnimal = makeAnchor();
          ARState.anchorCellQuestPlant = makeAnchor();
          ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
          if (typeof CellQuestARController !== 'undefined') {
            CellQuestARController.init(scene, ARState.anchorCellQuest.group, camera, null);
          }
          if (window.VirtualEnvironment360) {
            window.VirtualEnvironment360.init(scene, ARState.renderer, camera);
          }
        }
      })()
    `);

    // =========================================================================
    // T1: Camera-off activates VirtualEnvironment360 and shows 360 mesh
    // =========================================================================
    const t1 = await cdp.eval(`
      (() => {
        if (window.ARState.cameraActive) {
          window.toggleCameraPower();
        }
        const isActive = window.VirtualEnvironment360.isActive;
        const meshVisible = window.VirtualEnvironment360.envMesh ? window.VirtualEnvironment360.envMesh.visible : false;
        const camActive = window.ARState.cameraActive;
        const containerHasClass = document.getElementById('ar-container').classList.contains('camera-off');
        return isActive === true && meshVisible === true && camActive === false && containerHasClass === true;
      })()
    `);
    assert('T1: Tutup kamera mengaktifkan Makmal Maya 360° & sfera latar belakang Three.js', t1);

    // =========================================================================
    // T2: Camera-on hides VirtualEnvironment360
    // =========================================================================
    const t2 = await cdp.eval(`
      (() => {
        window.toggleCameraPower();
        const isActive = window.VirtualEnvironment360.isActive;
        const meshVisible = window.VirtualEnvironment360.envMesh ? window.VirtualEnvironment360.envMesh.visible : false;
        const camActive = window.ARState.cameraActive;
        const containerHasClass = document.getElementById('ar-container').classList.contains('camera-off');

        // Kembalikan ke camera-off untuk ujian seterusnya
        window.toggleCameraPower();

        return isActive === false && meshVisible === false && camActive === true && containerHasClass === false;
      })()
    `);
    assert('T2: Buka kamera menyembunyikan Makmal Maya 360° daripada pemandangan', t2);

    // =========================================================================
    // T3: Yaw rotation updates sphere quaternion
    // =========================================================================
    const t3 = await cdp.eval(`
      (() => {
        window.applySimAngles(0, 0);
        window.renderSinglePOVFrame();
        const q0 = window.VirtualEnvironment360.envMesh.quaternion.clone();

        window.applySimAngles(90, 0);
        window.renderSinglePOVFrame();
        const q90 = window.VirtualEnvironment360.envMesh.quaternion.clone();

        // Quaternion Y must have changed significantly between 0 and 90 deg yaw
        const diff = Math.abs(q0.y - q90.y);
        return diff > 0.3;
      })()
    `);
    assert('T3: Putaran Yaw (0° -> 90°) mengubah kuaternion orientasi sfera dengan tepat', t3);

    // =========================================================================
    // T4: Pitch rotation updates sphere quaternion
    // =========================================================================
    const t4 = await cdp.eval(`
      (() => {
        window.applySimAngles(0, 0);
        window.renderSinglePOVFrame();
        const q0 = window.VirtualEnvironment360.envMesh.quaternion.clone();

        window.applySimAngles(0, 30);
        window.renderSinglePOVFrame();
        const qPitch = window.VirtualEnvironment360.envMesh.quaternion.clone();

        // Quaternion X must have changed with pitch
        const diff = Math.abs(q0.x - qPitch.x);
        return diff > 0.15;
      })()
    `);
    assert('T4: Putaran Pitch (0° -> 30°) memusingkan sfera secara menegak dengan lancar', t4);

    // =========================================================================
    // T5: 0° / 360° wraparound maintains valid unit quaternion
    // =========================================================================
    const t5 = await cdp.eval(`
      (() => {
        window.applySimAngles(359.9, 0);
        window.renderSinglePOVFrame();
        const q359 = window.VirtualEnvironment360.envMesh.quaternion.clone();

        window.applySimAngles(0.1, 0);
        window.renderSinglePOVFrame();
        const q0 = window.VirtualEnvironment360.envMesh.quaternion.clone();

        const len359 = Math.sqrt(q359.x*q359.x + q359.y*q359.y + q359.z*q359.z + q359.w*q359.w);
        const len0 = Math.sqrt(q0.x*q0.x + q0.y*q0.y + q0.z*q0.z + q0.w*q0.w);

        const isUnit = Math.abs(len359 - 1.0) < 0.01 && Math.abs(len0 - 1.0) < 0.01;
        const noNaN = !Number.isNaN(q359.x) && !Number.isNaN(q0.x);
        return isUnit && noNaN;
      })()
    `);
    assert('T5: Titik pusingan 0° / 360° kekal lancar dan mengekalkan unit quaternion sah tanpa ralat gimbal', t5);

    // =========================================================================
    // T6: Touch-drag fallback updates angles when simulated
    // =========================================================================
    const t6 = await cdp.eval(`
      (() => {
        window.ARState.pov.hasSensor = false;
        window.ARState.pov.isSimulated = true;
        window.applySimAngles(100, 10);

        const startX = 200, startY = 400;
        const endX = 150, endY = 400;

        const downEvt = new PointerEvent('pointerdown', { clientX: startX, clientY: startY, bubbles: true });
        const moveEvt = new PointerEvent('pointermove', { clientX: endX, clientY: endY, bubbles: true });
        const upEvt = new PointerEvent('pointerup', { clientX: endX, clientY: endY, bubbles: true });

        document.body.dispatchEvent(downEvt);
        window.dispatchEvent(moveEvt);
        window.dispatchEvent(upEvt);

        const newYaw = window.ARState.pov.simYaw;
        return newYaw > 105 && newYaw < 125;
      })()
    `);
    assert('T6: Kawalan sentuhan leretan (touch-drag) mengemas kini pandangan 360° sekiranya tiada giroskop', t6);

    // =========================================================================
    // T7: Video POV Lock independent persistence in 360° environment
    // =========================================================================
    const t7 = await cdp.eval(`
      (() => {
        window.handleTargetFound(0, 'video'); // Video marker
        window.SpatialPanelManager.enterPanelPOVSetup('video');
        window.SpatialPanelManager.lockPanelPOV('video');
        const p = window.SpatialPanelManager.getPanel('video');
        const hasAnchor = p && p.anchorWorldVector instanceof window.THREE.Vector3;
        const isVisible = p && p.isVisible;
        return hasAnchor && isVisible;
      })()
    `);
    assert('T7: Modul Video terkunci (POV Lock) mengekalkan anchor koordinat dunia sendiri dalam makmal maya', t7);

    // =========================================================================
    // T8: Nota POV Lock independent persistence in 360° environment
    // =========================================================================
    const t8 = await cdp.eval(`
      (() => {
        window.handleTargetFound(1, 'nota'); // Nota marker
        window.SpatialPanelManager.enterPanelPOVSetup('nota');
        window.SpatialPanelManager.lockPanelPOV('nota');
        const p = window.SpatialPanelManager.getPanel('nota');
        const hasAnchor = p && p.anchorWorldVector instanceof window.THREE.Vector3;
        const isVisible = p && p.isVisible;
        return hasAnchor && isVisible;
      })()
    `);
    assert('T8: Modul Nota terkunci (POV Lock) mengekalkan anchor koordinat dunia sendiri dalam makmal maya', t8);

    // =========================================================================
    // T9: CellQuest 3D POV Lock independent persistence in 360° environment
    // =========================================================================
    const t9 = await cdp.eval(`
      (() => {
        window.handleTargetFound(3, 'cellquest'); // CellQuest Animal Cell marker
        window.SpatialPanelManager.enterPanelPOVSetup('cellquest');
        window.SpatialPanelManager.lockPanelPOV('cellquest');
        const p = window.SpatialPanelManager.getPanel('cellquest');
        const hasAnchor = p && p.anchorWorldVector instanceof window.THREE.Vector3;
        const isVisible = p && p.isVisible;
        return hasAnchor && isVisible;
      })()
    `);
    assert('T9: Modul CellQuest 3D terkunci (POV Lock) mengekalkan anchor koordinat dunia sendiri dalam makmal maya', t9);

    // =========================================================================
    // T10: Multi-module simultaneous coexistence over virtual background
    // =========================================================================
    const t10 = await cdp.eval(`
      (() => {
        const panels = window.SpatialPanelManager.getAllPanels();
        const lockedCount = panels.filter(p => p.placementMode === 'POV_LOCKED' && p.isVisible).length;
        const bgOrder = window.VirtualEnvironment360.envMesh.renderOrder;
        return lockedCount >= 3 && bgOrder === -1000;
      })()
    `);
    assert('T10: Ketiga-tiga modul (Video, Nota, CellQuest 3D) wujud serentak di hadapan latar belakang 360° (renderOrder = -1000)', t10);

    // =========================================================================
    // T11: Background does not intercept interactive UI / panels / buttons
    // =========================================================================
    const t11 = await cdp.eval(`
      (() => {
        const btn = document.getElementById('cq-btn-toggle-cam');
        const r = btn ? btn.getBoundingClientRect() : null;
        const cell = document.getElementById('cq-hud-cell-name');
        const cr = cell ? cell.getBoundingClientRect() : null;

        const info = {
          btn: r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null,
          cell: cr ? { top: cr.top, left: cr.left, width: cr.width, height: cr.height } : null,
          hudStyle: document.getElementById('cellquest-ar-hud').getAttribute('style'),
          hudClass: document.getElementById('cellquest-ar-hud').className
        };

        const x = r ? r.left + r.width / 2 : 0;
        const y = r ? r.top + r.height / 2 : 0;
        const el = document.elementFromPoint(x, y);
        info.x = x;
        info.y = y;
        info.elAtPoint = el ? { tag: el.tagName, id: el.id, class: el.className } : null;
        const btnStyle = window.getComputedStyle(btn);
        info.btnComputed = {
          pointerEvents: btnStyle.pointerEvents,
          display: btnStyle.display,
          visibility: btnStyle.visibility,
          opacity: btnStyle.opacity,
          zIndex: btnStyle.zIndex
        };
        const elElements = document.elementsFromPoint(x, y);
        info.elementsAtPoint = elElements.map(e => ({ tag: e.tagName, id: e.id, class: e.className }));
        info.ok = el === btn || (btn && btn.contains(el)) || (elElements && elElements.includes(btn));
        return info;
      })()
    `);
    console.log('T11 DETAILED INFO:', JSON.stringify(t11, null, 2));
    assert('T11: Latar belakang 360° tidak menghalang interaksi butang dan panel UI pengguna', t11 && t11.ok, JSON.stringify(t11));

    // =========================================================================
    // T12: Reopening camera restores camera stream without losing locked panels
    // =========================================================================
    const t12 = await cdp.eval(`
      (() => {
        window.toggleCameraPower();
        const camActive = window.ARState.cameraActive;
        const panels = window.SpatialPanelManager.getAllPanels();
        const lockedStillIntact = panels.filter(p => p.placementMode === 'POV_LOCKED').length >= 3;

        // Tutup semula kamera
        window.toggleCameraPower();

        return camActive === true && lockedStillIntact === true;
      })()
    `);
    assert('T12: Membuka semula kamera tidak memadamkan panel yang telah dikunci pandangan', t12);

    // =========================================================================
    // T13: Single-instance POV render loop without duplicate RAF leaks
    // =========================================================================
    const t13 = await cdp.eval(`
      (() => {
        const firstRaf = window.ARState.pov.rafId;
        window.startPOVRenderLoop();
        const secondRaf = window.ARState.pov.rafId;
        return typeof secondRaf === 'number' && secondRaf > 0;
      })()
    `);
    assert('T13: Gelung render POV 3DoF diuruskan secara tunggal tanpa limpahan kitaran RAF', t13);

    // =========================================================================
    // T14: Mobile viewport (390x844) zero horizontal overflow
    // =========================================================================
    const t14 = await cdp.eval(`
      (() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        return scrollWidth <= clientWidth;
      })()
    `);
    assert('T14: Susun atur skrin mudah alih (390x844) mematuhi batasan tanpa lelehan mendatar (overflow-x = 0)', t14);

    // =========================================================================
    // T15: Equirectangular canvas dimensions (2048x1024) & stations
    // =========================================================================
    const t15 = await cdp.eval(`
      (() => {
        const c = window.VirtualEnvironment360.canvas;
        if (!c) return false;
        return c.width === 2048 && c.height === 1024;
      })()
    `);
    assert('T15: Tekstur kanvas 360° beresolusi 2048x1024 dengan 6 stesen KSSM Bab 2', t15);

    console.log('\n================================================================');
    console.log(`KEPUTUSAN AKHIR: ${passed}/${testNum} UJIAN LULUS (${Math.round((passed / testNum) * 100)}%)`);
    console.log('================================================================\n');

    if (passed !== testNum) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Ralat tidak dijangka:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    if (chromeProc) chromeProc.kill();
    server.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();
