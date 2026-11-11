// scripts/verify_fasa_a5_mod_jelajah_3d.js
// Skrip Ujian Automatik Fasa A.5: Gyroscope 360° + 3D Model Material Restoration (Mod Jelajah 3D)
// Menguji kesemua 20 kriteria wajib Fasa A.5 menggunakan Microsoft Edge Headless CDP

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9428;
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }
  async connect() {
    const WS = global.WebSocket || require('ws');
    this.ws = new WS(this.wsUrl);
    await new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
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
  async captureScreenshot(fileName) {
    if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    const localPath = path.join(SCREENSHOT_DIR, fileName);
    fs.writeFileSync(localPath, buf);
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, fileName), buf);
    }
    console.log(`[SCREENSHOT] Disimpan: ${localPath}`);
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function run() {
  console.log('=== MEMULAKAN UJIAN AUTOMATIK FASA A.5: MOD JELAJAH 3D (20 UJIAN WAJIB) ===\n');

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const browserPath = edgePaths.find(p => fs.existsSync(p));
  if (!browserPath) {
    console.error('Browser tidak dijumpai.');
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-fasa-a5-'));
  const proc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-web-security',
    '--allow-running-insecure-content',
    '--window-size=1180,820',
    'http://localhost:3000/auth/login.html'
  ]);

  await delay(2500);

  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page' && t.url.startsWith('http')) || targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget) {
    console.error('Tiada tab dijumpai.');
    proc.kill();
    process.exit(1);
  }

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  // Set mock session dan buka Mod Jelajah 3D
  await client.evaluate(`
    (() => {
      const u = { id: 'test-student-fasa-a5', full_name: 'Saintis Uji Fasa A5', nama: 'Saintis Uji Fasa A5', kelas: '1 Bestari', role: 'student' };
      localStorage.setItem('arselnel_session', JSON.stringify({ user: u }));
      localStorage.setItem('arselnel_current_user', JSON.stringify(u));
      localStorage.setItem('currentUser', JSON.stringify(u));
      localStorage.setItem('arselnel_user', JSON.stringify(u));
    })()
  `);

  await client.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=3d' });
  await delay(4000);

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1180,
    height: 820,
    deviceScaleFactor: 2,
    mobile: true,
    fitWindow: false
  });
  await delay(1000);

  // Tunggu sehingga CellQuestAR sedia dan semua GLB selesai dimuatkan
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await delay(500);
    ready = await client.evaluate(`
      typeof window.CellQuestAR !== 'undefined' && window.CellQuestAR.getStationMeshes().length === 8
    `).catch(() => false);
    if (ready) break;
  }
  if (!ready) {
    console.error('Gagal memuatkan CellQuestAR.');
    proc.kill();
    process.exit(1);
  }

  // Pastikan semua GLB dimuatkan sepenuhnya dan masuk ke Mod Jelajah 3D
  await client.evaluate(`
    (async () => {
      await window.CellQuestAR.preloadAllGLBs();
      await window.CellQuestAR.launchMode('3d');
      window.CellQuestAR.closeLab3DStoryMissionModal();
      window.CellQuestAR.closeLab3DCalibrationModal();
    })()
  `);
  await delay(1500);

  const results = [];
  function record(id, name, passed, detail) {
    results.push({ id, name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] Ujian ${id}: ${name} -> ${detail}`);
  }

  // ---------------------------------------------------------------------------
  // UJIAN 1: Kamera tidak menghadap siling pada permulaan
  // ---------------------------------------------------------------------------
  const initCam = await client.evaluate(`
    (() => {
      const cam = window.CellQuestAR.getCamera();
      const gyro = window.CellQuestAR.getModAGyroState();
      return {
        pitchRad: cam.rotation.x,
        yawRad: cam.rotation.y,
        gyroPitch: gyro.pitch,
        hasCalibrated: gyro.hasCalibrated
      };
    })()
  `);
  record(
    1,
    'Kamera tidak menghadap siling pada permulaan',
    Math.abs(initCam.pitchRad) < 0.05 && Math.abs(initCam.gyroPitch) < 0.05,
    `pitchRad=${initCam.pitchRad.toFixed(4)} rad (0.0000 rad = mendatar/horizon, bukan siling +0.7854 rad)`
  );

  // Kalibrasi rujukan hadapan pada orientasi iPad Landscape (screenAngle = 90, alpha = 100, beta = 0, gamma = -55)
  await client.evaluate(`
    (() => {
      const g = window.CellQuestAR.getModAGyroState();
      g.calibrated = false;
      window.CellQuestAR.simulateModADeviceOrientation(100, 0, -55, 90);
    })()
  `);

  // ---------------------------------------------------------------------------
  // UJIAN 2: Pusing kiri 45° berfungsi
  // ---------------------------------------------------------------------------
  const left45 = await client.evaluate(`
    (() => {
      const beforeYaw = window.CellQuestAR.getCamera().rotation.y;
      // Pusing peranti 45° ke kiri (alpha bertambah +45° mengikut tangan kanan Z-up)
      const res = window.CellQuestAR.simulateModADeviceOrientation(145, 0, -55, 90);
      const afterYaw = window.CellQuestAR.getCamera().rotation.y;
      const deltaDeg = (afterYaw - beforeYaw) * 180 / Math.PI;
      return { beforeYaw, afterYaw, deltaDeg, deltaAzimuthDeg: res.deltaAzimuthDeg };
    })()
  `);
  record(
    2,
    'Pusing kiri 45° berfungsi',
    left45.deltaDeg > 35 && left45.deltaDeg < 55,
    `deltaYaw=${left45.deltaDeg.toFixed(2)}° (kamera berpusing ke kiri dengan tepat)`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 3: Pusing kanan 45° berfungsi
  // ---------------------------------------------------------------------------
  const right45 = await client.evaluate(`
    (() => {
      // Kembali ke tengah (100°) kemudian pusing kanan 45° (alpha = 55°)
      window.CellQuestAR.simulateModADeviceOrientation(100, 0, -55, 90);
      const centerYaw = window.CellQuestAR.getCamera().rotation.y;
      const res = window.CellQuestAR.simulateModADeviceOrientation(55, 0, -55, 90);
      const afterYaw = window.CellQuestAR.getCamera().rotation.y;
      const deltaDeg = (afterYaw - centerYaw) * 180 / Math.PI;
      return { centerYaw, afterYaw, deltaDeg, deltaAzimuthDeg: res.deltaAzimuthDeg };
    })()
  `);
  record(
    3,
    'Pusing kanan 45° berfungsi',
    right45.deltaDeg < -35 && right45.deltaDeg > -55,
    `deltaYaw=${right45.deltaDeg.toFixed(2)}° (kamera berpusing ke kanan dengan tepat)`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 4: Dongak atas 30° berfungsi
  // ---------------------------------------------------------------------------
  const up30 = await client.evaluate(`
    (() => {
      window.CellQuestAR.simulateModADeviceOrientation(100, 0, -55, 90);
      const centerPitch = window.CellQuestAR.getCamera().rotation.x;
      // Dalam Landscape 90°, dongak ke atas 30° menukar gamma daripada -55° kepada -85°
      const res = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -85, 90);
      const afterPitch = window.CellQuestAR.getCamera().rotation.x;
      const deltaPitchDeg = (afterPitch - centerPitch) * 180 / Math.PI;
      return { centerPitch, afterPitch, deltaPitchDeg, deltaElevationDeg: res.deltaElevationDeg };
    })()
  `);
  record(
    4,
    'Dongak atas 30° berfungsi',
    up30.deltaPitchDeg > 20 && up30.deltaPitchDeg < 40,
    `deltaPitch=+${up30.deltaPitchDeg.toFixed(2)}° (kamera mendongak ke atas dengan tepat)`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 5: Tunduk bawah 30° berfungsi
  // ---------------------------------------------------------------------------
  const down30 = await client.evaluate(`
    (() => {
      window.CellQuestAR.simulateModADeviceOrientation(100, 0, -55, 90);
      const centerPitch = window.CellQuestAR.getCamera().rotation.x;
      // Dalam Landscape 90°, tunduk ke bawah 30° menukar gamma daripada -55° kepada -25°
      const res = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -25, 90);
      const afterPitch = window.CellQuestAR.getCamera().rotation.x;
      const deltaPitchDeg = (afterPitch - centerPitch) * 180 / Math.PI;
      return { centerPitch, afterPitch, deltaPitchDeg, deltaElevationDeg: res.deltaElevationDeg };
    })()
  `);
  record(
    5,
    'Tunduk bawah 30° berfungsi',
    down30.deltaPitchDeg < -20 && down30.deltaPitchDeg > -40,
    `deltaPitch=${down30.deltaPitchDeg.toFixed(2)}° (kamera menunduk ke bawah dengan tepat)`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 6: Pergerakan pepenjuru (diagonal) berfungsi & bebas lompatan 0°/360°
  // ---------------------------------------------------------------------------
  const diagTest = await client.evaluate(`
    (() => {
      const g = window.CellQuestAR.getModAGyroState();
      g.calibrated = false;
      // Kalibrasi dekat sempadan 355°
      window.CellQuestAR.simulateModADeviceOrientation(355, 0, -55, 90);
      // Gerak pepenjuru merentasi 0° ke 25° (+30° kiri) sambil dongak +20° (gamma -75°)
      const res = window.CellQuestAR.simulateModADeviceOrientation(25, 0, -75, 90);
      const yawDeg = res.gyroYaw * 180 / Math.PI;
      const pitchDeg = res.gyroPitch * 180 / Math.PI;
      return { yawDeg, pitchDeg };
    })()
  `);
  record(
    6,
    'Pergerakan pepenjuru (diagonal) & rentas sempadan 0°/360° berfungsi lancar',
    diagTest.yawDeg > 20 && diagTest.yawDeg < 40 && diagTest.pitchDeg > 12 && diagTest.pitchDeg < 28,
    `yaw=+${diagTest.yawDeg.toFixed(2)}°, pitch=+${diagTest.pitchDeg.toFixed(2)}° (tiada gimbal lock atau lompatan 360°)`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 7: Mod Landscape berfungsi (90° dan -90°)
  // ---------------------------------------------------------------------------
  const landscapeTest = await client.evaluate(`
    (() => {
      const g = window.CellQuestAR.getModAGyroState();
      // Uji Landscape -90° (270°)
      g.calibrated = false;
      window.CellQuestAR.simulateModADeviceOrientation(180, 0, 55, -90);
      const initPitch = window.CellQuestAR.getCamera().rotation.x;
      const rLeft = window.CellQuestAR.simulateModADeviceOrientation(225, 0, 55, -90);
      const yawLeftDeg = rLeft.gyroYaw * 180 / Math.PI;
      return { initPitch, yawLeftDeg };
    })()
  `);
  record(
    7,
    'Mod Landscape berfungsi (90° & -90°)',
    Math.abs(landscapeTest.initPitch) < 0.05 && landscapeTest.yawLeftDeg > 35 && landscapeTest.yawLeftDeg < 55,
    `initPitch=${landscapeTest.initPitch.toFixed(4)} rad, pusingKiriLandscape270=+${landscapeTest.yawLeftDeg.toFixed(2)}°`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 8: Mod Portrait berfungsi (0°)
  // ---------------------------------------------------------------------------
  const portraitTest = await client.evaluate(`
    (() => {
      const g = window.CellQuestAR.getModAGyroState();
      g.calibrated = false;
      // Portrait 0°: peranti dipegang pada kecondongan selesa beta = 60°, gamma = 0°
      window.CellQuestAR.simulateModADeviceOrientation(90, 60, 0, 0);
      const initPitch = window.CellQuestAR.getCamera().rotation.x;
      // Pusing kiri 45° (alpha = 135°) dan dongak 20° (beta = 80°)
      const rMove = window.CellQuestAR.simulateModADeviceOrientation(135, 80, 0, 0);
      return {
        initPitch,
        yawDeg: rMove.gyroYaw * 180 / Math.PI,
        pitchDeg: rMove.gyroPitch * 180 / Math.PI
      };
    })()
  `);
  record(
    8,
    'Mod Portrait berfungsi (0°)',
    Math.abs(portraitTest.initPitch) < 0.05 && portraitTest.yawDeg > 35 && portraitTest.yawDeg < 55 && portraitTest.pitchDeg > 12,
    `initPitch=${portraitTest.initPitch.toFixed(4)} rad, yaw=+${portraitTest.yawDeg.toFixed(2)}°, pitch=+${portraitTest.pitchDeg.toFixed(2)}°`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 9: Butang "Kalibrasi Semula" berfungsi pada HUD
  // ---------------------------------------------------------------------------
  const calibBtnTest = await client.evaluate(`
    (() => {
      const btn = document.getElementById('gyro-reset-btn');
      const visible = btn && getComputedStyle(btn).display !== 'none';
      const label = btn ? btn.innerText.trim() : '';
      // Sebelum klik, kamera sedang memandang yaw != 0 dan pitch != 0
      const beforePitch = window.CellQuestAR.getCamera().rotation.x;
      btn.click();
      const afterPitch = window.CellQuestAR.getCamera().rotation.x;
      const gyro = window.CellQuestAR.getModAGyroState();
      return { visible, label, beforePitch, afterPitch, gyroYaw: gyro.yaw, gyroPitch: gyro.pitch };
    })()
  `);
  record(
    9,
    'Butang Kalibrasi Semula berfungsi',
    calibBtnTest.visible && calibBtnTest.label.includes('Kalibrasi Semula') && Math.abs(calibBtnTest.afterPitch) < 0.01 && Math.abs(calibBtnTest.gyroYaw) < 0.01,
    `visible=${calibBtnTest.visible}, label="${calibBtnTest.label.replace(/\\s+/g, ' ')}", afterPitch=${calibBtnTest.afterPitch.toFixed(4)}, gyroYaw=${calibBtnTest.gyroYaw.toFixed(4)}`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 10: Kalibrasi tidak mengunci putaran masa depan
  // ---------------------------------------------------------------------------
  const postCalibMove = await client.evaluate(`
    (() => {
      // Selepas klik Kalibrasi Semula pada (alpha=135, beta=80, gamma=0, screen=0),
      // pusing kanan 30° (alpha=105) dan tunduk 15° (beta=65)
      const res = window.CellQuestAR.simulateModADeviceOrientation(105, 65, 0, 0);
      return {
        yawDeg: res.gyroYaw * 180 / Math.PI,
        pitchDeg: res.gyroPitch * 180 / Math.PI
      };
    })()
  `);
  record(
    10,
    'Kalibrasi tidak mengunci putaran masa depan',
    postCalibMove.yawDeg < -20 && postCalibMove.pitchDeg < -10,
    `Selepas kalibrasi, pusingan baharu menghasilkan yaw=${postCalibMove.yawDeg.toFixed(2)}°, pitch=${postCalibMove.pitchDeg.toFixed(2)}°`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 11: Pergerakan joystick berfungsi
  // ---------------------------------------------------------------------------
  const joystickMove = await client.evaluate(`
    (() => {
      window.CellQuestAR.setPlayerPose(0, 4.0, 0, 0);
      window.CellQuestAR.resetViewDirection();
      const startZ = window.CellQuestAR.getCamera().position.z;
      for (let i = 0; i < 10; i++) {
        window.CellQuestAR.setJoystickInput(0, 1.0, true); // +1.0 ialah ke hadapan
      }
      window.CellQuestAR.setJoystickInput(0, 0, false);
      const endZ = window.CellQuestAR.getCamera().position.z;
      return { startZ, endZ, movedForward: endZ < startZ - 0.2 };
    })()
  `);
  record(
    11,
    'Pergerakan joystick berfungsi',
    joystickMove.movedForward,
    `startZ=${joystickMove.startZ.toFixed(2)} -> endZ=${joystickMove.endZ.toFixed(2)}`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 12: Joystick tidak bercanggah dengan sensor gyroscope
  // ---------------------------------------------------------------------------
  const joyGyroCombo = await client.evaluate(`
    (() => {
      window.CellQuestAR.setPlayerPose(0, 4.0, 0, 0);
      const g = window.CellQuestAR.getModAGyroState();
      g.calibrated = false;
      window.CellQuestAR.simulateModADeviceOrientation(100, 0, -55, 90);
      // Pusing peranti 45° ke kiri
      window.CellQuestAR.simulateModADeviceOrientation(145, 0, -55, 90);
      const startPos = {
        x: window.CellQuestAR.getCamera().position.x,
        z: window.CellQuestAR.getCamera().position.z,
        yaw: window.CellQuestAR.getCamera().rotation.y
      };
      // Gerakkan joystick ke hadapan (+1.0) mengikut arah pandangan gyroscope
      for (let i = 0; i < 10; i++) {
        window.CellQuestAR.setJoystickInput(0, 1.0, true);
      }
      window.CellQuestAR.setJoystickInput(0, 0, false);
      const endPos = {
        x: window.CellQuestAR.getCamera().position.x,
        z: window.CellQuestAR.getCamera().position.z,
        yaw: window.CellQuestAR.getCamera().rotation.y
      };
      return {
        startPos,
        endPos,
        yawPreserved: Math.abs(endPos.yaw - startPos.yaw) < 0.05,
        movedAlongGyroHeading: endPos.x < startPos.x - 0.1 && endPos.z < startPos.z - 0.1
      };
    })()
  `);
  record(
    12,
    'Joystick tidak bercanggah dengan sensor gyroscope',
    joyGyroCombo.yawPreserved && joyGyroCombo.movedAlongGyroHeading,
    `yawPreserved=${joyGyroCombo.yawPreserved}, movedAlongGyroHeading=${joyGyroCombo.movedAlongGyroHeading} (dx=${(joyGyroCombo.endPos.x - joyGyroCombo.startPos.x).toFixed(2)}, dz=${(joyGyroCombo.endPos.z - joyGyroCombo.startPos.z).toFixed(2)})`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 13: Tiada duplicate event listener deviceorientation
  // ---------------------------------------------------------------------------
  const listenerTest = await client.evaluate(`
    (async () => {
      await window.CellQuestAR.enableModAGyroscope();
      await window.CellQuestAR.enableModAGyroscope();
      await window.CellQuestAR.initializeOrientation();
      await window.CellQuestAR.requestOrientationPermission();
      const g = window.CellQuestAR.getModAGyroState();
      return { listenerCount: g.listenerCount, bound: g.listenerBound };
    })()
  `);
  record(
    13,
    'Tiada duplicate event listener deviceorientation',
    listenerTest.listenerCount === 1 && listenerTest.bound === true,
    `listenerCount=${listenerTest.listenerCount}, listenerBound=${listenerTest.bound}`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 14, 15, 16, 17: Audit Material & Tekstur Semua 8 Stesen Organel
  // ---------------------------------------------------------------------------
  const stationAuditBefore = await client.evaluate(`
    window.CellQuestAR.inspectAll3DStationMaterials()
  `);

  const all8HaveValidMaterials = stationAuditBefore.length === 8 && stationAuditBefore.every(
    s => s.meshCount > 0 && s.meshes.every(m => (m.materialType === 'MeshStandardMaterial' || m.materialType === 'MeshPhysicalMaterial') && m.colorHex && m.colorHex !== '#000000')
  );
  const badMeshes14 = [];
  stationAuditBefore.forEach(s => {
    s.meshes.forEach(m => {
      if ((m.materialType !== 'MeshStandardMaterial' && m.materialType !== 'MeshPhysicalMaterial') || !m.colorHex || m.colorHex === '#000000') {
        badMeshes14.push(`${s.stationName}/${m.nodeName}:${m.materialType}:${m.colorHex}`);
      }
    });
  });
  record(
    14,
    'Semua 8 model organel mempunyai material sah (MeshStandardMaterial & bukan hitam)',
    all8HaveValidMaterials,
    `stations=${stationAuditBefore.length}, meshCounts=[${stationAuditBefore.map(s => `${s.stationName}:${s.meshCount}`).join(', ')}]${badMeshes14.length ? ' BAD=' + badMeshes14.join(',') : ''}`
  );

  const allTexturesIntact = stationAuditBefore.every(
    s => s.meshes.every(m => !m.hasMap || m.mapImageValid)
  );
  record(
    15,
    'Semua tekstur kekal utuh dan sah pada GPU',
    allTexturesIntact,
    `Semua peta tekstur GLB mempunyai imej sah (HTMLImageElement via TextureLoader + GPU initTexture)`
  );

  const mitoStation = stationAuditBefore.find(s => s.stationNum === 4);
  const mitoNotBlack = mitoStation && mitoStation.meshCount > 0 && mitoStation.meshes.every(
    m => m.colorHex !== '#000000' && m.emissiveHex !== '#000000' && m.metalness === 0
  );
  record(
    16,
    'Mitokondrion tidak hitam',
    Boolean(mitoNotBlack),
    `Mitokondrion meshes=${mitoStation ? mitoStation.meshCount : 0}, colors=[${mitoStation ? mitoStation.meshes.map(m => `${m.colorHex}(emissive:${m.emissiveHex})`).join(', ') : ''}]`
  );

  const nucStation = stationAuditBefore.find(s => s.stationNum === 1);
  const nucNotBlack = nucStation && nucStation.meshCount > 0 && nucStation.meshes.every(
    m => m.colorHex !== '#000000' && m.emissiveHex !== '#000000' && m.metalness === 0 && m.vertexColors === false
  );
  record(
    17,
    'Nukleus tidak hitam',
    Boolean(nucNotBlack),
    `Nukleus meshes=${nucStation ? nucStation.meshCount : 0}, uniqueColors=[${nucStation ? [...new Set(nucStation.meshes.map(m => m.colorHex))].join(', ') : ''}]`
  );

  // Tangkap layar visual Stesen 1 (Nukleus), Stesen 4 (Mitokondrion), dan Stesen 8 (Perbandingan Sel)
  // Stesen 1: Nukleus di (-6.8, 6.0), kamera menghadap ke kiri (-X)
  await client.evaluate(`
    document.querySelectorAll('.cq-toast').forEach(el => el.remove());
    window.CellQuestAR.resetViewDirection();
    window.CellQuestAR.setPlayerPose(-3.6, 6.0, Math.PI / 2, -0.08);
  `);
  await delay(600);
  await client.captureScreenshot('fasa_a5_stesen1_nukleus_3d.png');

  // Stesen 4: Mitokondrion di (-6.8, -6.0), kamera menghadap ke kiri (-X)
  await client.evaluate(`
    document.querySelectorAll('.cq-toast').forEach(el => el.remove());
    window.CellQuestAR.setPlayerPose(-3.6, -6.0, Math.PI / 2, -0.08);
  `);
  await delay(600);
  await client.captureScreenshot('fasa_a5_stesen4_mitokondrion_3d.png');

  // Stesen 8: Perbandingan Sel & ER di (6.8, 6.0), kamera menghadap ke kanan (+X)
  await client.evaluate(`
    document.querySelectorAll('.cq-toast').forEach(el => el.remove());
    window.CellQuestAR.setPlayerPose(3.2, 6.0, -Math.PI / 2, -0.06);
  `);
  await delay(600);
  await client.captureScreenshot('fasa_a5_stesen8_perbandingan_sel_3d.png');

  // ---------------------------------------------------------------------------
  // UJIAN 18: Model tidak hilang warna selepas menjawab kuiz
  // ---------------------------------------------------------------------------
  const afterSingleQuiz = await client.evaluate(`
    (async () => {
      window.CellQuestAR.openQuiz(0); // Buka modal Stesen 1 Nukleus
      await new Promise(r => setTimeout(r, 300));
      window.CellQuestAR.markStationCompleted(1);
      const closeBtn = document.getElementById('modal-close-btn');
      if (closeBtn) closeBtn.click();
      await new Promise(r => setTimeout(r, 300));
      return window.CellQuestAR.inspectAll3DStationMaterials();
    })()
  `);
  const nucAfterQuiz = afterSingleQuiz.find(s => s.stationNum === 1);
  const quizPreservedColor = nucAfterQuiz && nucAfterQuiz.meshes.every(
    m => m.colorHex !== '#000000' && m.emissiveHex !== '#000000' && (!m.hasMap || m.mapImageValid)
  );
  record(
    18,
    'Model tidak hilang warna selepas menjawab kuiz',
    Boolean(quizPreservedColor),
    `Selepas kuiz Stesen 1 selesai, semua ${nucAfterQuiz.meshCount} mesh Nukleus kekal berwarna terang`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 19: Model tidak hilang warna selepas 8/8 stesen selesai
  // ---------------------------------------------------------------------------
  const afterAll8Completed = await client.evaluate(`
    (async () => {
      for (let i = 1; i <= 8; i++) {
        window.CellQuestAR.markStationCompleted(i);
      }
      await new Promise(r => setTimeout(r, 300));
      return window.CellQuestAR.inspectAll3DStationMaterials();
    })()
  `);
  const all8StillColorful = afterAll8Completed.every(
    s => s.meshCount > 0 && s.meshes.every(m => m.colorHex !== '#000000' && m.emissiveHex !== '#000000' && (!m.hasMap || m.mapImageValid))
  );
  record(
    19,
    'Model tidak hilang warna selepas 8/8 stesen selesai',
    all8StillColorful,
    `8/8 stesen selesai -> 100% mesh & tekstur pada kesemua 8 stesen kekal terang dan tidak hitam`
  );

  // ---------------------------------------------------------------------------
  // UJIAN 20: Membuka dan menutup modal stesen berulang kali tidak merosakkan model
  // ---------------------------------------------------------------------------
  const afterRepeatedModals = await client.evaluate(`
    (async () => {
      for (let cycle = 0; cycle < 2; cycle++) {
        for (let idx = 0; idx < 8; idx++) {
          window.CellQuestAR.openQuiz(idx);
          await new Promise(r => setTimeout(r, 80));
          const closeBtn = document.getElementById('modal-close-btn');
          if (closeBtn) closeBtn.click();
          await new Promise(r => setTimeout(r, 40));
        }
      }
      return window.CellQuestAR.inspectAll3DStationMaterials();
    })()
  `);
  const repeatedModalsSafe = afterRepeatedModals.every(
    s => s.meshCount > 0 && s.meshes.every(m => m.colorHex !== '#000000' && m.emissiveHex !== '#000000' && (!m.hasMap || m.mapImageValid))
  );
  record(
    20,
    'Membuka dan menutup modal stesen berulang kali (16 kitaran) tidak merosakkan model',
    repeatedModalsSafe,
    `Selepas 16 kitaran buka/tutup modal merentas semua 8 stesen, tiada material atau tekstur yang dilupuskan`
  );

  // Tangkap layar keseluruhan makmal dari kedudukan permulaan (0, 1.65, 4.0) selepas 8/8 selesai
  await client.evaluate(`
    document.querySelectorAll('.cq-modal.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.cq-toast').forEach(el => el.remove());
    window.CellQuestAR.resetViewDirection();
    window.CellQuestAR.setPlayerPose(0, 4.0, 0, 0);
  `);
  await delay(600);
  await client.captureScreenshot('fasa_a5_makmal_horizon_hud.png');

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n=== KEPUTUSAN AKHIR FASA A.5: ${passedCount}/${results.length} UJIAN LULUS ===`);

  client.close();
  proc.kill();

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Ralat semasa menjalankan ujian Fasa A.5:', err);
  process.exit(1);
});
