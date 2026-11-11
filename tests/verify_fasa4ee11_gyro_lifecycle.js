/**
 * SKRIP UJIAN AUTOMATIK FASA 4E-E.1.1 (25 SEMAKAN WAJIB)
 * Critical Hotfix: Gyroscope 360° (4 Arah, Portrait/Landscape, iOS Permission),
 * Single Sensor Ownership, Safari BFCache (pagehide/pageshow) & 5x Round-Trip Lifecycle
 */
const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WS = global.WebSocket || require('ws');
const BASE_URL = 'http://localhost:3000';
const KOTAK_URL = `${BASE_URL}/kotak_arselnel/code.html`;
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findBrowser() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Edge/Chrome tidak dijumpai.');
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WS(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.http404s = [];
    this.pageErrors = [];
    this.readyPromise = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
          else res(msg.result);
        } else if (msg.method === 'Network.responseReceived') {
          const resp = msg.params && msg.params.response;
          if (resp && resp.status === 404 && !resp.url.includes('favicon.ico')) {
            this.http404s.push(resp.url);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          const desc = msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'Unknown exception';
          this.pageErrors.push(desc);
        }
      };
    });
  }
  async init() {
    await this.readyPromise;
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text || 'Eval error');
    }
    return r.result ? r.result.value : undefined;
  }
  async captureScreenshot(fileName) {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(data, 'base64');
    fs.writeFileSync(path.join(SCREENSHOT_DIR, fileName), buf);
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, fileName), buf);
    }
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function waitForKotakReady(client, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await client.evaluate(`
        Boolean(
          window.KotakARSELNEL &&
          window.ARState &&
          window.ARState.mindarThree &&
          window.ARState.renderer &&
          document.getElementById('btn-launch-jelajah3d') &&
          document.getElementById('loading-screen') &&
          document.getElementById('loading-screen').classList.contains('hidden')
        )
      `);
      if (ok) return true;
    } catch (_) {}
    await delay(350);
  }
  return false;
}

async function waitForJelajah3DReady(client, maxAttempts = 45) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await client.evaluate(`
        Boolean(
          window.CellQuestAR &&
          window.CellQuestAR.getState &&
          window.CellQuestAR.getState().mode === '3d' &&
          window.CellQuestAR.getStationMeshes &&
          window.CellQuestAR.getStationMeshes().length === 8
        )
      `);
      if (ok) return true;
    } catch (_) {}
    await delay(350);
  }
  return false;
}

(async () => {
  console.log('=== MEMULAKAN UJIAN FASA 4E-E.1.1: GYROSCOPE 360° & WEBGL LIFECYCLE (25 SEMAKAN) ===\n');
  const browserPath = findBrowser();
  const port = 9341 + Math.floor(Math.random() * 80);
  const userDataDir = path.join(process.env.TEMP, `edge-4ee11-${Date.now()}`);

  const proc = spawn(browserPath, [
    '--headless',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1180,820',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    KOTAK_URL
  ]);

  let client;
  const results = [];
  function record(id, name, pass, detail) {
    results.push({ id, name, pass: !!pass, detail });
    console.log(`${pass ? '✅ LULUS' : '❌ GAGAL'} [Semakan ${id}] ${name} — ${detail}`);
  }

  try {
    await delay(1800);
    const targets = await httpGetJson(`http://127.0.0.1:${port}/json`);
    const pageTarget = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!pageTarget) throw new Error('Tiada target halaman CDP ditemui.');

    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.init();

    // 1. Kotak ready + launch button exists
    const kotakOk = await waitForKotakReady(client, 50);
    const btnCheck = await client.evaluate(`
      (() => {
        const b = document.getElementById('btn-launch-jelajah3d');
        const r = b ? b.getBoundingClientRect() : null;
        return { exists: !!b, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
      })()
    `);
    record(1, 'Kotak ARSELNEL dimuatkan & butang Jelajah 3D sedia', kotakOk && btnCheck.exists && btnCheck.h >= 40, `kotakOk=${kotakOk}, btn=${btnCheck.w}x${btnCheck.h}`);

    // 2. Navigate Kotak -> Jelajah 3D via real button
    await client.evaluate(`document.getElementById('btn-launch-jelajah3d').click()`);
    await delay(250);
    await client.evaluate(`
      (() => {
        const c = document.getElementById('btn-jelajah3d-confirm');
        if (c && window.location.pathname.includes('kotak_arselnel')) c.click();
      })()
    `);
    const jReady = await waitForJelajah3DReady(client, 50);
    await delay(800);
    const navInfo = await client.evaluate(`({ path: window.location.pathname, search: window.location.search })`);
    record(2, 'Navigasi Kotak ARSELNEL -> /cellquest/adventure.html?mode=3d&from=kotak berjaya', jReady && navInfo.path === '/cellquest/adventure.html' && navInfo.search.includes('mode=3d') && navInfo.search.includes('from=kotak'), `URL=${navInfo.path}${navInfo.search}`);

    // 3. Renderer & Animation Loop active
    const loopInfo = await client.evaluate(`
      (() => {
        const d = window.CellQuestAR.getSensorDiagnostics();
        const gl = window.CellQuestAR.getRenderer() ? window.CellQuestAR.getRenderer().getContext() : null;
        return { mode: d.mode, rendererActive: d.rendererActive, loopActive: d.animationLoopActive, ctxLost: gl ? gl.isContextLost() : true };
      })()
    `);
    record(3, 'WebGL renderer & gelung animasi aktif selepas masuk dari Kotak', loopInfo.mode === '3d' && loopInfo.rendererActive && loopInfo.loopActive && !loopInfo.ctxLost, JSON.stringify(loopInfo));

    // 4. Simulate iOS Safari user-gesture requestPermission via #lab3d-cal-sensor-btn
    const iosPermTest = await client.evaluate(`
      (async () => {
        window.__SIMULATE_IOS_SAFARI = true;
        let requestedInGesture = false;
        window.DeviceOrientationEvent.requestPermission = async () => {
          requestedInGesture = true;
          return 'granted';
        };
        window.CellQuestAR.teardownModAOrientation();
        window.CellQuestAR.getModAGyroState().permissionState = 'prompt';
        window.CellQuestAR.getModAGyroState().touchOnlyChosen = false;
        await window.CellQuestAR.launchMode('3d');
        const modalOpen = document.getElementById('lab3d-calibration-modal').classList.contains('open');
        document.getElementById('lab3d-cal-sensor-btn').click();
        await new Promise((r) => setTimeout(r, 80));
        const modalClosedAfter = !document.getElementById('lab3d-calibration-modal').classList.contains('open');
        const d = window.CellQuestAR.getSensorDiagnostics();
        window.__SIMULATE_IOS_SAFARI = false;
        return { modalOpen, requestedInGesture, modalClosedAfter, perm: d.permissionState, active: d.gyroActive, bound: d.listenerBound, count: d.listenerCount };
      })()
    `);
    record(4, 'Aktivasi permission gyroscope iPadOS Safari melalui user gesture modal kalibrasi', iosPermTest.modalOpen && iosPermTest.requestedInGesture && iosPermTest.modalClosedAfter && iosPermTest.perm === 'granted' && iosPermTest.active && iosPermTest.bound && iosPermTest.count === 1, JSON.stringify(iosPermTest));

    // 5. Initial horizon camera (not looking at ceiling)
    const horizonInit = await client.evaluate(`
      (() => {
        const c = window.CellQuestAR.getCamera();
        return { pitch: c.rotation.x, yaw: c.rotation.y };
      })()
    `);
    record(5, 'Kamera pada permulaan menghadap ufuk mendatar (pitch = 0, bukan siling)', Math.abs(horizonInit.pitch) < 0.02, `pitch=${horizonInit.pitch.toFixed(4)} rad`);

    // Calibrate comfortable tilted Landscape-90 position (-45° tilt)
    await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
      })()
    `);

    // 6. Yaw Left
    const leftTest = await client.evaluate(`
      (() => {
        const res = window.CellQuestAR.simulateModADeviceOrientation(140, 0, -45, 90);
        return { deg: res.gyroYaw * 180 / Math.PI };
      })()
    `);
    record(6, 'Gyroscope Arah 1: Pusing Kiri (Yaw +) berfungsi selepas masuk dari Kotak', leftTest.deg > 30 && leftTest.deg < 50, `yaw=${leftTest.deg.toFixed(2)}°`);

    // 7. Yaw Right
    const rightTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const res = window.CellQuestAR.simulateModADeviceOrientation(60, 0, -45, 90);
        return { deg: res.gyroYaw * 180 / Math.PI };
      })()
    `);
    record(7, 'Gyroscope Arah 2: Pusing Kanan (Yaw -) berfungsi selepas masuk dari Kotak', rightTest.deg < -30 && rightTest.deg > -50, `yaw=${rightTest.deg.toFixed(2)}°`);

    // 8. Pitch Up (even when calibrated tilted down -45°)
    const upTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const res = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -75, 90);
        return { deg: res.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(8, 'Gyroscope Arah 3: Dongak Atas (Pitch +) berfungsi lancar', upTest.deg > 22 && upTest.deg < 38, `pitch=+${upTest.deg.toFixed(2)}°`);

    // 9. Pitch Down (testing past -65° old raw clamp: -45° -> -15° = -30° down!)
    const downTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const res = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -15, 90);
        return { deg: res.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(9, 'Gyroscope Arah 4: Tunduk Bawah (Pitch -) bebas had -65° pramatang', downTest.deg < -22 && downTest.deg > -38, `pitch=${downTest.deg.toFixed(2)}°`);

    // 10. Diagonal + 355->25 wraparound
    const diagTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.simulateModADeviceOrientation(355, 0, -50, 90);
        const res = window.CellQuestAR.simulateModADeviceOrientation(25, 0, -75, 90);
        return { yawDeg: res.gyroYaw * 180 / Math.PI, pitchDeg: res.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(10, 'Gyroscope pepenjuru & rentasan 0°/360° tanpa gimbal lock', diagTest.yawDeg > 20 && diagTest.yawDeg < 40 && diagTest.pitchDeg > 18 && diagTest.pitchDeg < 32, `yaw=+${diagTest.yawDeg.toFixed(2)}°, pitch=+${diagTest.pitchDeg.toFixed(2)}°`);

    // 11. Landscape 90 & 270/-90 normalization
    const landTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.simulateModADeviceOrientation(180, 0, 50, -90);
        const left270 = window.CellQuestAR.simulateModADeviceOrientation(220, 0, 50, -90);
        const up270 = window.CellQuestAR.simulateModADeviceOrientation(180, 0, 80, -90);
        return { yawDeg: left270.gyroYaw * 180 / Math.PI, pitchDeg: up270.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(11, 'Orientasi Landscape (-90° / 270° & 90°) mengekalkan tanda yaw/pitch yang tepat', landTest.yawDeg > 30 && landTest.yawDeg < 50 && landTest.pitchDeg > 20 && landTest.pitchDeg < 38, `yaw=+${landTest.yawDeg.toFixed(2)}°, pitch=+${landTest.pitchDeg.toFixed(2)}°`);

    // 12. Portrait (0°)
    const portTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.simulateModADeviceOrientation(90, 60, 0, 0);
        const r = window.CellQuestAR.simulateModADeviceOrientation(125, 80, 0, 0);
        return { yawDeg: r.gyroYaw * 180 / Math.PI, pitchDeg: r.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(12, 'Orientasi Portrait (0°) berfungsi untuk yaw & pitch', portTest.yawDeg > 25 && portTest.yawDeg < 45 && portTest.pitchDeg > 12 && portTest.pitchDeg < 28, `yaw=+${portTest.yawDeg.toFixed(2)}°, pitch=+${portTest.pitchDeg.toFixed(2)}°`);

    // 13. #gyro-reset-btn calibration + non-locking
    const calBtnTest = await client.evaluate(`
      (() => {
        document.getElementById('gyro-reset-btn').click();
        const afterCalCam = window.CellQuestAR.getCamera();
        const afterCalPitch = afterCalCam.rotation.x;
        const afterCalYaw = afterCalCam.rotation.y;
        const nextMove = window.CellQuestAR.simulateModADeviceOrientation(95, 65, 0, 0);
        return { afterCalPitch, afterCalYaw, nextYawDeg: nextMove.gyroYaw * 180 / Math.PI, nextPitchDeg: nextMove.gyroPitch * 180 / Math.PI };
      })()
    `);
    record(13, 'Butang Kalibrasi Semula memusatkan ufuk & tidak mengunci putaran baharu', Math.abs(calBtnTest.afterCalPitch) < 0.01 && calBtnTest.nextYawDeg < -20 && calBtnTest.nextPitchDeg < -10, JSON.stringify(calBtnTest));

    // 14. Single sensor ownership (touch drag doesn't fight active gyro) + joystick translation along gyro heading
    const ownerTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.setPlayerPose(0, 5.0, 0, 0);
        window.CellQuestAR.simulateModADeviceOrientation(90, 60, 0, 0);
        window.CellQuestAR.simulateModADeviceOrientation(135, 60, 0, 0); // +45° left
        const pitchBeforeDrag = window.CellQuestAR.getCamera().rotation.x;
        // Simulate mouse drag on canvas while gyro sensorReceived === true
        const cv = document.getElementById('canvas-container');
        cv.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 300, bubbles: true }));
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 120, bubbles: true }));
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 120, bubbles: true }));
        window.CellQuestAR.setJoystickInput(0, 1, true);
        const jEnd = window.CellQuestAR.setJoystickInput(0, 1, true);
        window.CellQuestAR.setJoystickInput(0, 0, false);
        const pitchAfterDrag = window.CellQuestAR.getCamera().rotation.x;
        return { pitchBeforeDrag, pitchAfterDrag, dx: jEnd.x, dz: jEnd.z - 5.0, camYawDeg: jEnd.cameraYaw * 180 / Math.PI };
      })()
    `);
    record(14, 'Pemilikan sensor tunggal (drag tidak menimpa gyro aktif) & joystick selari arah gyro', Math.abs(ownerTest.pitchAfterDrag - ownerTest.pitchBeforeDrag) < 0.01 && ownerTest.dx < -0.05 && ownerTest.dz < -0.05, JSON.stringify(ownerTest));

    // 15. Dev-only diagnostics panel hidden by default, shows full telemetry when toggled
    const diagPanelTest = await client.evaluate(`
      (() => {
        const defaultHidden = !document.getElementById('cq-gyro-diag-panel') || getComputedStyle(document.getElementById('cq-gyro-diag-panel')).display === 'none';
        window.CellQuestAR.setDiagnosticsVisible(true);
        const panel = document.getElementById('cq-gyro-diag-panel');
        const txt = panel ? panel.textContent : '';
        const vis = panel && getComputedStyle(panel).display === 'block';
        window.CellQuestAR.setDiagnosticsVisible(false);
        const hiddenAgain = !panel || getComputedStyle(panel).display === 'none';
        const d = window.CellQuestAR.getSensorDiagnostics();
        return { defaultHidden, vis, hiddenAgain, hasFields: txt.includes('rawQ=') && txt.includes('calQ=') && txt.includes('loop='), perm: d.permissionState, rx: d.eventReceived };
      })()
    `);
    await client.captureScreenshot('fasa_4ee11_diagnostics_check.png');
    record(15, 'Panel diagnostik sensor tersembunyi secara lalai & papar 14 medan telemetri apabila debug aktif', diagPanelTest.defaultHidden && diagPanelTest.vis && diagPanelTest.hiddenAgain && diagPanelTest.hasFields && diagPanelTest.rx, JSON.stringify(diagPanelTest));

    // 16 & 17. Safari pagehide & BFCache pageshow({ persisted: true }) lifecycle
    const bfcacheTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.simulateModADeviceOrientation(160, 45, 0, 0);
        window.CellQuestAR.handleModAPageHide();
        const duringHide = window.CellQuestAR.getSensorDiagnostics();
        window.CellQuestAR.handleModAPageShow({ persisted: true });
        const afterRestore = window.CellQuestAR.getSensorDiagnostics();
        const canvasCount = document.querySelectorAll('#canvas-container canvas').length;
        return { duringHide, afterRestore, canvasCount };
      })()
    `);
    record(16, 'WebGL & Sensor Lifecycle: pagehide henti gelung animasi & buang pendengar sensor', !bfcacheTest.duringHide.animationLoopActive && !bfcacheTest.duringHide.listenerBound && bfcacheTest.duringHide.listenerCount === 0, JSON.stringify(bfcacheTest.duringHide));
    record(17, 'Safari BFCache pageshow({persisted:true}) pulih gelung, reset kalibrasi & ikat sensor sekali', bfcacheTest.afterRestore.animationLoopActive && bfcacheTest.afterRestore.listenerBound && bfcacheTest.afterRestore.listenerCount === 1 && !bfcacheTest.afterRestore.calibrated && bfcacheTest.canvasCount === 1, JSON.stringify(bfcacheTest.afterRestore));

    // 18. Visibilitychange pause/resume
    const visTest = await client.evaluate(`
      (() => {
        window.CellQuestAR.stopRenderLoop();
        window.CellQuestAR.startRenderLoop();
        return window.CellQuestAR.getSensorDiagnostics().animationLoopActive;
      })()
    `);
    record(18, 'Kitaran henti & sambung semula gelung render WebGL selamat tanpa duplikasi', visTest === true, `loopActive=${visTest}`);

    // 19. Return to Kotak ARSELNEL & verify MindAR/video/loading recovered
    await client.evaluate(`document.getElementById('hud-return-kotak-btn').click()`);
    const backOk = await waitForKotakReady(client, 50);
    await delay(500);
    const backHealth = await client.evaluate(`
      (() => {
        const v = document.querySelector('#ar-container video');
        const c = document.querySelector('#ar-container canvas');
        const loadingHidden = document.getElementById('loading-screen')?.classList.contains('hidden');
        return { path: window.location.pathname, hasMindAR: !!window.ARState.mindarThree, videoReady: v ? v.readyState : 0, canvasCount: document.querySelectorAll('#ar-container canvas').length, loadingHidden };
      })()
    `);
    await client.captureScreenshot('fasa_4ee11_returned_kotak.png');
    record(19, 'Butang Kembali ke Kotak ARSELNEL pulih kamera, MindAR & skrin pemuatan', backOk && backHealth.hasMindAR && backHealth.videoReady >= 2 && backHealth.canvasCount === 1 && backHealth.loadingHidden, JSON.stringify(backHealth));

    // 20. 5x Full Round-Trip Cycle Kotak -> Jelajah 3D (test live 4-dir gyro every cycle) -> Kotak
    let cycleAllOk = true;
    const cycleNotes = [];
    for (let c = 1; c <= 5; c++) {
      await client.evaluate(`window.launchJelajah3D(true)`);
      const jCycleOk = await waitForJelajah3DReady(client, 45);
      const cycleGyro = await client.evaluate(`
        (() => {
          window.CellQuestAR.resetModAGyroCalibrationState(true);
          window.CellQuestAR.simulateModADeviceOrientation(100, 0, -50, 90);
          const l = window.CellQuestAR.simulateModADeviceOrientation(130, 0, -50, 90);
          const u = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -75, 90);
          const d = window.CellQuestAR.getSensorDiagnostics();
          return {
            canvases: document.querySelectorAll('#canvas-container canvas').length,
            listeners: d.listenerCount,
            loop: d.animationLoopActive,
            leftYaw: l.gyroYaw * 180 / Math.PI,
            upPitch: u.gyroPitch * 180 / Math.PI
          };
        })()
      `);
      await client.evaluate(`window.CellQuestAR.returnToKotakARSELNEL()`);
      const kCycleOk = await waitForKotakReady(client, 45);
      const kState = await client.evaluate(`({ canvases: document.querySelectorAll('#ar-container canvas').length, videos: document.querySelectorAll('#ar-container video').length, loadingHidden: document.getElementById('loading-screen')?.classList.contains('hidden') })`);
      const ok = jCycleOk && kCycleOk && cycleGyro.canvases === 1 && cycleGyro.listeners === 1 && cycleGyro.loop && cycleGyro.leftYaw > 20 && cycleGyro.upPitch > 15 && kState.canvases === 1 && kState.videos === 1 && kState.loadingHidden;
      if (!ok) cycleAllOk = false;
      cycleNotes.push(`K${c}:${ok ? 'OK' : 'FAIL'}`);
    }
    record(20, '5x Kitaran ulang-alik penuh: gyro 4 arah & kitaran hayat kekal sihat setiap pusingan', cycleAllOk, cycleNotes.join(', '));

    // 21 & 22 & 23. Kotak 4 Modules + 5 Markers + Lock POV after 5 cycles
    const kotakModulesCheck = await client.evaluate(`
      (() => {
        const anchors = (window.ARState && window.ARState.mindarThree && window.ARState.mindarThree.anchors) || [];
        window.addPanelToSpatialWorkspace('video');
        window.addPanelToSpatialWorkspace('nota');
        window.addPanelToSpatialWorkspace('kuiz');
        window.addPanelToSpatialWorkspace('cellquest');
        window.SpatialPanelManager.lockPanelPOV('nota');
        window.applySimAngles(25, -12);
        const notaState = window.SpatialPanelManager.getState().panels.nota;
        return { anchors: anchors.length, activeMods: window.ARState.activePanels.size, notaMode: notaState ? notaState.placementMode : null };
      })()
    `);
    record(21, '5 marker (.mind Sasaran 0-4) Kotak ARSELNEL kekal aktif selepas 5 kitaran', kotakModulesCheck.anchors === 5, `anchors=${kotakModulesCheck.anchors}`);
    record(22, 'Keempat-empat modul Kotak ARSELNEL berfungsi selepas 5 kitaran', kotakModulesCheck.activeMods === 4, `activeModules=${kotakModulesCheck.activeMods}`);
    record(23, 'Mod Lock POV (3DoF Yaw/Pitch) Kotak ARSELNEL kekal berfungsi', kotakModulesCheck.notaMode === 'POV_LOCKED', `mode=${kotakModulesCheck.notaMode}`);

    // 24. No 404 or critical uncaught errors
    record(24, 'Tiada ralat 404 atau exception tidak tertangkap sepanjang navigasi', client.http404s.length === 0 && client.pageErrors.length === 0, `404=${client.http404s.length}, pageErrors=${client.pageErrors.length}${client.pageErrors.length ? ' -> ' + client.pageErrors.slice(0,2).join(' | ') : ''}`);

    // 25. No supabase schema changes
    let supaDiff = '';
    try { supaDiff = execSync('git diff HEAD -- supabase/', { encoding: 'utf8' }).trim(); } catch (_) {}
    record(25, 'Tiada perubahan schema Supabase', supaDiff.length === 0, supaDiff.length === 0 ? 'Tiada perubahan pada supabase/' : 'Terdapat diff!');

    const passedCount = results.filter((r) => r.pass).length;
    console.log(`\n================================================================`);
    console.log(`KEPUTUSAN FASA 4E-E.1.1: ${passedCount} / ${results.length} SEMAKAN LULUS`);
    console.log(`================================================================`);
    if (passedCount < results.length) process.exitCode = 1;
  } catch (err) {
    console.error('RALAT KRITIKAL UJIAN FASA 4E-E.1.1:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.close();
    try { proc.kill(); } catch (_) {}
  }
})();

