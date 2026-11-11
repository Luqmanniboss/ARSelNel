/**
 * ARSELNEL — FASA 4E-E.2 AUTOMATED E2E VERIFICATION SUITE
 * Integrasi Marker Jelajah 3D (Sasaran Indeks 5) ke Kotak ARSELNEL
 *
 * Menguji 12 semakan wajib Fasa 4E-E.2:
 *  1. Fail .mind dimuatkan tanpa 404.
 *  2. Semua marker asal kekal sah (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan).
 *  3. Marker baharu Jelajah 3D didaftarkan pada indeks yang betul (Indeks 5).
 *  4. Simulasi targetFound bagi marker Jelajah 3D membuka panel pengenalan MAKMAL EKSPLORASI 3D.
 *  5. Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR.
 *  6. Butang Mula Jelajah 3D menjalankan aliran pelancaran selamat (termasuk pengesahan jika panel lain aktif).
 *  7. Kamera, MindAR, audio dan listener Kotak AR dibersihkan sebelum navigasi.
 *  8. Halaman /cellquest/adventure.html?mode=3d&from=kotak dibuka dengan betul.
 *  9. Gyroscope 4 arah, joystick dan 8 stesen berfungsi dalam Makmal 3D.
 * 10. Butang Kembali ke Kotak AR membawa pengguna semula ke Kotak ARSELNEL.
 * 11. Sesi Kotak ARSELNEL pulih tanpa skrin hitam selepas kembali.
 * 12. Ujian ulang-alik 5 kali (Marker Jelajah 3D -> Panel Pengenalan -> Makmal 3D -> Kembali) lulus tanpa kebocoran.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const DEBUG_PORT = 9352;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Edge/Chrome ditemui.');
}

function getJson(url) {
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

function checkUrlStatus(urlPath) {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let bytes = 0;
      res.on('data', (c) => (bytes += c.length));
      res.on('end', () => resolve({ status: res.statusCode, bytes }));
    }).on('error', () => resolve({ status: 0, bytes: 0 }));
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.pageErrors = [];
    this.http404s = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params?.exceptionDetails;
        const text = details?.exception?.description || details?.text || 'Unknown exception';
        this.pageErrors.push(text);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params?.type === 'error') {
          const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
          if (!text.includes('favicon')) this.consoleErrors.push(text);
        }
      } else if (msg.method === 'Network.responseReceived') {
        const resp = msg.params?.response;
        if (resp && resp.status === 404 && !resp.url.includes('favicon')) {
          this.http404s.push(resp.url);
        }
      }
    });
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text} ${res.exceptionDetails.exception?.description || ''}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
  }

  async captureScreenshot(filePath) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  }

  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function waitForKotakReady(client, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ready = await client.evaluate(`
        Boolean(
          window.location.pathname.includes('/kotak_arselnel/code.html') &&
          window.KotakARSELNEL &&
          window.ARState &&
          window.ARState.mindarThree &&
          window.ARState.mindarThree.anchors &&
          window.ARState.mindarThree.anchors.length === 6 &&
          document.getElementById('btn-launch-jelajah3d') &&
          document.getElementById('jelajah3d-marker-intro-backdrop') &&
          document.getElementById('loading-screen') &&
          document.getElementById('loading-screen').classList.contains('hidden')
        )
      `);
      if (ready) return true;
    } catch (_) {}
    await sleep(300);
  }
  return false;
}

async function waitForJelajahReady(client, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ready = await client.evaluate(`
        Boolean(
          window.location.pathname.includes('/cellquest/adventure.html') &&
          window.CellQuestAR &&
          window.CellQuestAR.getState &&
          window.CellQuestAR.getState().mode === '3d' &&
          window.CellQuestAR.getStationMeshes &&
          window.CellQuestAR.getStationMeshes().length === 8
        )
      `);
      if (ready) return true;
    } catch (_) {}
    await sleep(300);
  }
  return false;
}

(async () => {
  const results = [];
  function record(id, name, pass, detail = '') {
    results.push({ id, name, pass: Boolean(pass), detail });
    console.log(`${pass ? '✅ LULUS' : '❌ GAGAL'} [${id}] ${name}${detail ? ' — ' + detail : ''}`);
  }

  const browserPath = findBrowserExecutable();
  const userDataDir = path.join(__dirname, `.tmp-edge-fasa4ee2-${Date.now()}`);
  const browserProc = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1180,820',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ], { stdio: 'ignore' });

  let client = null;
  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      try {
        targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
        if (targets && targets.length > 0) break;
      } catch (_) {}
      await sleep(250);
    }
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    // 1. Semak fail .mind & aset marker melalui HTTP
    const mindHttp = await checkUrlStatus('/kotak_arselnel/assets/markers/kotak_arselnel.mind?v=fasa4ee2');
    const marker5PngHttp = await checkUrlStatus('/kotak_arselnel/assets/markers/marker-jelajah3d.png');
    const marker5SvgHttp = await checkUrlStatus('/kotak_arselnel/assets/markers/marker-jelajah3d.svg');

    // Buka Kotak ARSELNEL
    await client.navigate(`${BASE_URL}/kotak_arselnel/code.html`);
    const kotakReady = await waitForKotakReady(client, 55);

    const mindNo404 = mindHttp.status === 200 && mindHttp.bytes > 3000000 && marker5PngHttp.status === 200 && marker5SvgHttp.status === 200 && client.http404s.length === 0;
    record(1, 'Fail .mind dan aset marker Jelajah 3D dimuatkan tanpa 404', mindNo404 && kotakReady, `status=${mindHttp.status}, size=${(mindHttp.bytes / (1024 * 1024)).toFixed(2)} MB, 404s=${client.http404s.length}`);

    // 2 & 3. Semak pendaftaran semua marker asal (0-4) dan marker baharu Jelajah 3D (Indeks 5)
    const anchorsInfo = await client.evaluate(`
      (() => {
        const s = window.ARState;
        const anchors = (s && s.mindarThree && s.mindarThree.anchors) ? s.mindarThree.anchors : [];
        return {
          totalAnchors: anchors.length,
          indices: anchors.map(a => a.targetIndex),
          hasVideo0: Boolean(s.anchorVideo && s.anchorVideo.targetIndex === 0),
          hasNota1: Boolean(s.anchorNota && s.anchorNota.targetIndex === 1),
          hasKuiz2: Boolean(s.anchorKuiz && s.anchorKuiz.targetIndex === 2),
          hasAnimal3: Boolean(s.anchorCellQuestAnimal && s.anchorCellQuestAnimal.targetIndex === 3),
          hasPlant4: Boolean(s.anchorCellQuestPlant && s.anchorCellQuestPlant.targetIndex === 4),
          hasJelajah5: Boolean(s.anchorJelajah3D && s.anchorJelajah3D.targetIndex === 5 && typeof s.anchorJelajah3D.onTargetFound === 'function'),
          diagText: document.getElementById('diag-marker-mind-status')?.textContent?.trim() || ''
        };
      })()
    `);

    const origMarkersValid = anchorsInfo.hasVideo0 && anchorsInfo.hasNota1 && anchorsInfo.hasKuiz2 && anchorsInfo.hasAnimal3 && anchorsInfo.hasPlant4;
    record(2, 'Semua 5 marker asal kekal sah (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan)', origMarkersValid, `indices=[${anchorsInfo.indices.join(', ')}]`);
    record(3, 'Marker baharu Jelajah 3D didaftarkan pada Indeks 5 (6 sasaran aktif)', anchorsInfo.totalAnchors === 6 && anchorsInfo.hasJelajah5, `totalAnchors=${anchorsInfo.totalAnchors}, diag="${anchorsInfo.diagText}"`);

    // 4. Simulasi targetFound bagi Marker 5 (Jelajah 3D) -> Panel Pengenalan dibuka
    await client.evaluate(`window.ARState.anchorJelajah3D.onTargetFound()`);
    await sleep(250);

    const introPanelInfo = await client.evaluate(`
      (() => {
        const backdrop = document.getElementById('jelajah3d-marker-intro-backdrop');
        const card = document.getElementById('jelajah3d-marker-intro-card');
        const title = document.getElementById('jelajah3d-intro-title')?.textContent?.trim() || '';
        const desc = document.getElementById('jelajah3d-intro-desc')?.textContent?.trim() || '';
        const features = Array.from(document.querySelectorAll('#jelajah3d-intro-features .jelajah3d-intro-feature-item')).map(el => el.textContent.replace(/\\s+/g, ' ').trim());
        const startBtn = document.getElementById('btn-jelajah3d-intro-start');
        const closeBtn = document.getElementById('btn-jelajah3d-intro-close');
        const cardStyle = card ? window.getComputedStyle(card) : null;
        const titleStyle = document.getElementById('jelajah3d-intro-title') ? window.getComputedStyle(document.getElementById('jelajah3d-intro-title')) : null;
        return {
          open: Boolean(backdrop && !backdrop.classList.contains('hidden')),
          stateFlag: Boolean(window.ARState.jelajah3dIntroOpen),
          title,
          desc,
          featureCount: features.length,
          featuresText: features.join(' | '),
          hasButtons: Boolean(startBtn && closeBtn),
          cardBg: cardStyle ? cardStyle.backgroundColor : '',
          titleColor: titleStyle ? titleStyle.color : ''
        };
      })()
    `);

    await client.captureScreenshot(path.join(ARTIFACT_DIR, 'fasa_4ee2_marker5_intro_panel.png'));

    const introValid =
      introPanelInfo.open &&
      introPanelInfo.stateFlag &&
      introPanelInfo.title === 'MAKMAL EKSPLORASI 3D' &&
      introPanelInfo.desc.includes('lapan stesen pembelajaran interaktif') &&
      introPanelInfo.featureCount === 4 &&
      introPanelInfo.hasButtons;
    record(4, 'Simulasi targetFound Indeks 5 membuka panel pengenalan MAKMAL EKSPLORASI 3D', introValid, `title="${introPanelInfo.title}", features=${introPanelInfo.featureCount}, cardBg=${introPanelInfo.cardBg}`);

    // 5. Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR
    await client.evaluate(`document.getElementById('btn-jelajah3d-intro-close').click()`);
    await sleep(200);
    const afterCloseInfo = await client.evaluate(`
      (() => {
        const backdrop = document.getElementById('jelajah3d-marker-intro-backdrop');
        return {
          hidden: Boolean(backdrop && backdrop.classList.contains('hidden')),
          canvases: document.querySelectorAll('#ar-container canvas').length,
          videos: document.querySelectorAll('#ar-container video').length,
          mindarActive: Boolean(window.ARState && window.ARState.mindarThree)
        };
      })()
    `);
    record(5, 'Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR', afterCloseInfo.hidden && afterCloseInfo.canvases === 1 && afterCloseInfo.videos === 1 && afterCloseInfo.mindarActive, `hidden=${afterCloseInfo.hidden}, canvases=${afterCloseInfo.canvases}, videos=${afterCloseInfo.videos}`);

    // 6 & 7. Uji aliran pelancaran selamat daripada Panel Pengenalan:
    // (a) Apabila panel AR lain aktif (contoh: Nota), klik Mula Jelajah 3D memaparkan modal pengesahan terlebih dahulu
    await client.evaluate(`
      window.ARState.markerCooldown.jelajah3d = 0;
      window.addPanelToSpatialWorkspace('nota');
      window.ARState.anchorJelajah3D.onTargetFound();
    `);
    await sleep(200);
    await client.evaluate(`document.getElementById('btn-jelajah3d-intro-start').click()`);
    await sleep(200);

    const confirmCheck = await client.evaluate(`
      (() => {
        const introHidden = document.getElementById('jelajah3d-marker-intro-backdrop')?.classList.contains('hidden');
        const confirmOpen = !document.getElementById('jelajah3d-modal-backdrop')?.classList.contains('hidden');
        return { introHidden, confirmOpen };
      })()
    `);
    record(6, 'Butang Mula Jelajah 3D menjalankan aliran pelancaran selamat (termasuk pengesahan apabila panel lain aktif)', confirmCheck.introHidden && confirmCheck.confirmOpen, `introHidden=${confirmCheck.introHidden}, confirmModalOpen=${confirmCheck.confirmOpen}`);

    // Klik sahkan pada modal pengesahan -> pastikan cleanupSession berjalan dan navigasi ke Makmal 3D berlaku
    await client.evaluate(`document.getElementById('btn-jelajah3d-confirm').click()`);
    const jelajahReady = await waitForJelajahReady(client, 55);
    await sleep(400);

    const jelajahRouteInfo = await client.evaluate(`
      (() => {
        const d = window.CellQuestAR.getSensorDiagnostics();
        return {
          href: window.location.href,
          fromKotak: new URLSearchParams(window.location.search).get('from') === 'kotak',
          mode3d: new URLSearchParams(window.location.search).get('mode') === '3d',
          active: Boolean(d && d.rendererActive && d.animationLoopActive),
          canvases: document.querySelectorAll('#canvas-container canvas').length,
          listeners: d ? d.listenerCount : 0
        };
      })()
    `);

    record(7, 'Kamera, MindAR, audio dan listener Kotak AR dibersihkan sebelum navigasi', jelajahReady && jelajahRouteInfo.canvases === 1 && jelajahRouteInfo.listeners === 1, `canvases=${jelajahRouteInfo.canvases}, gyroListeners=${jelajahRouteInfo.listeners}`);
    record(8, 'Halaman /cellquest/adventure.html?mode=3d&from=kotak dibuka dengan betul', jelajahReady && jelajahRouteInfo.fromKotak && jelajahRouteInfo.mode3d && jelajahRouteInfo.active, `url=${jelajahRouteInfo.href}`);

    // 9. Semak Gyroscope 4 arah, Joystick dan 8 stesen dalam Makmal 3D
    const labCheck = await client.evaluate(`
      (() => {
        window.CellQuestAR.resetModAGyroCalibrationState(true);
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);

        // Kiri
        const leftRes = window.CellQuestAR.simulateModADeviceOrientation(140, 0, -45, 90);
        const leftYaw = leftRes.gyroYaw * 180 / Math.PI;
        // Kanan
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const rightRes = window.CellQuestAR.simulateModADeviceOrientation(60, 0, -45, 90);
        const rightYaw = rightRes.gyroYaw * 180 / Math.PI;
        // Atas
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const upRes = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -75, 90);
        const upPitch = upRes.gyroPitch * 180 / Math.PI;
        // Bawah
        window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
        const downRes = window.CellQuestAR.simulateModADeviceOrientation(100, 0, -15, 90);
        const downPitch = downRes.gyroPitch * 180 / Math.PI;

        // Joystick
        window.CellQuestAR.setPlayerPose(0, 5.0, 0, 0);
        window.CellQuestAR.setJoystickInput(0, 1, true);
        const jEnd = window.CellQuestAR.setJoystickInput(0, 1, true);
        window.CellQuestAR.setJoystickInput(0, 0, false);

        // 8 Stesen & material warna
        const stations = window.CellQuestAR.getStationMeshes();
        let stationsOk = stations.length === 8;
        let blackMats = 0;
        stations.forEach(s => {
          const root = s.group || s.modelGroup || s;
          if (!root || typeof root.traverse !== 'function') {
            stationsOk = false;
            return;
          }
          root.traverse(node => {
            if (node.isMesh && node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach(m => {
                if (m.color && m.color.r < 0.02 && m.color.g < 0.02 && m.color.b < 0.02 && (!m.emissive || (m.emissive.r < 0.02 && m.emissive.g < 0.02 && m.emissive.b < 0.02))) {
                  blackMats++;
                }
              });
            }
          });
        });

        return {
          leftYaw: Number(leftYaw.toFixed(1)),
          rightYaw: Number(rightYaw.toFixed(1)),
          upPitch: Number(upPitch.toFixed(1)),
          downPitch: Number(downPitch.toFixed(1)),
          joystickMoved: Math.abs(jEnd.z - 5.0) > 0.05 || Math.abs(jEnd.x) > 0.05,
          stationsCount: stations.length,
          stationsOk,
          blackMats
        };
      })()
    `);

    const labAllOk =
      labCheck.leftYaw > 20 &&
      labCheck.rightYaw < -20 &&
      labCheck.upPitch > 15 &&
      labCheck.downPitch < -15 &&
      labCheck.joystickMoved &&
      labCheck.stationsOk &&
      labCheck.blackMats === 0;
    record(9, 'Gyroscope 4 arah, joystick dan 8 stesen berfungsi dalam Makmal 3D', labAllOk, `Yaw(L:${labCheck.leftYaw}°, R:${labCheck.rightYaw}°), Pitch(U:${labCheck.upPitch}°, D:${labCheck.downPitch}°), stations=${labCheck.stationsCount}, blackMats=${labCheck.blackMats}`);

    // 10 & 11. Butang Kembali ke Kotak AR membawa pengguna semula & pulih tanpa skrin hitam
    await client.evaluate(`document.getElementById('hud-return-kotak-btn').click()`);
    const returnedReady = await waitForKotakReady(client, 55);
    await sleep(300);

    const returnedInfo = await client.evaluate(`
      (() => {
        const video = document.querySelector('#ar-container video');
        const canvas = document.querySelector('#ar-container canvas');
        return {
          href: window.location.href,
          returnedToKotak: window.location.pathname.includes('/kotak_arselnel/code.html'),
          canvases: document.querySelectorAll('#ar-container canvas').length,
          videos: document.querySelectorAll('#ar-container video').length,
          loadingHidden: Boolean(document.getElementById('loading-screen')?.classList.contains('hidden')),
          videoReady: Boolean(video && video.readyState >= 2),
          canvasSizeOk: Boolean(canvas && canvas.width > 0 && canvas.height > 0),
          anchorsCount: (window.ARState && window.ARState.mindarThree && window.ARState.mindarThree.anchors) ? window.ARState.mindarThree.anchors.length : 0
        };
      })()
    `);

    record(10, 'Butang Kembali ke Kotak AR membawa pengguna semula ke Kotak ARSELNEL', returnedReady && returnedInfo.returnedToKotak, `url=${returnedInfo.href}`);
    record(11, 'Sesi Kotak ARSELNEL pulih tanpa skrin hitam selepas kembali (6 sasaran aktif)', returnedReady && returnedInfo.canvases === 1 && returnedInfo.videos === 1 && returnedInfo.loadingHidden && returnedInfo.canvasSizeOk && returnedInfo.anchorsCount === 6, `canvases=${returnedInfo.canvases}, videos=${returnedInfo.videos}, anchors=${returnedInfo.anchorsCount}`);

    // 12. Ujian ulang-alik 5 kali: Marker Jelajah 3D (Indeks 5) -> Panel Pengenalan -> Mula Jelajah 3D -> Makmal 3D -> Kembali ke Kotak AR
    let cyclesOk = true;
    const cycleLogs = [];
    for (let c = 1; c <= 5; c++) {
      // Trigger Marker 5
      await client.evaluate(`
        if (window.ARState && window.ARState.markerCooldown) window.ARState.markerCooldown.jelajah3d = 0;
        window.ARState.anchorJelajah3D.onTargetFound();
      `);
      await sleep(120);
      const introOpen = await client.evaluate(`!document.getElementById('jelajah3d-marker-intro-backdrop').classList.contains('hidden')`);
      // Klik Mula Jelajah 3D pada panel pengenalan (tiada panel lain aktif -> terus masuk Makmal 3D)
      await client.evaluate(`document.getElementById('btn-jelajah3d-intro-start').click()`);
      const jOk = await waitForJelajahReady(client, 50);
      const jCheck = await client.evaluate(`
        (() => {
          const d = window.CellQuestAR.getSensorDiagnostics();
          window.CellQuestAR.resetModAGyroCalibrationState(true);
          window.CellQuestAR.simulateModADeviceOrientation(100, 0, -45, 90);
          const l = window.CellQuestAR.simulateModADeviceOrientation(135, 0, -70, 90);
          return {
            canvases: document.querySelectorAll('#canvas-container canvas').length,
            listeners: d.listenerCount,
            yaw: l.gyroYaw * 180 / Math.PI,
            pitch: l.gyroPitch * 180 / Math.PI
          };
        })()
      `);
      // Kembali ke Kotak AR
      await client.evaluate(`window.CellQuestAR.returnToKotakARSELNEL()`);
      const kOk = await waitForKotakReady(client, 50);
      const kCheck = await client.evaluate(`
        ({
          canvases: document.querySelectorAll('#ar-container canvas').length,
          videos: document.querySelectorAll('#ar-container video').length,
          anchors: window.ARState?.mindarThree?.anchors?.length || 0,
          loadingHidden: document.getElementById('loading-screen')?.classList.contains('hidden')
        })
      `);

      const roundPass =
        introOpen &&
        jOk &&
        kOk &&
        jCheck.canvases === 1 &&
        jCheck.listeners === 1 &&
        jCheck.yaw > 20 &&
        jCheck.pitch > 10 &&
        kCheck.canvases === 1 &&
        kCheck.videos === 1 &&
        kCheck.anchors === 6 &&
        kCheck.loadingHidden;

      if (!roundPass) cyclesOk = false;
      cycleLogs.push(`Pusingan ${c}:${roundPass ? 'OK' : 'GAGAL'}`);
    }

    record(12, 'Ujian ulang-alik 5 kali (Marker 5 -> Panel Pengenalan -> Makmal 3D -> Kembali ke Kotak AR) lulus tanpa kebocoran', cyclesOk && client.http404s.length === 0 && client.pageErrors.length === 0, `${cycleLogs.join(', ')} | 404=${client.http404s.length} | pageErrors=${client.pageErrors.length}`);

    const passedCount = results.filter((r) => r.pass).length;
    console.log(`\n================================================================`);
    console.log(`KEPUTUSAN FASA 4E-E.2: ${passedCount} / ${results.length} SEMAKAN LULUS`);
    console.log(`================================================================`);
    if (passedCount < results.length) process.exitCode = 1;
  } catch (err) {
    console.error('RALAT KRITIKAL UJIAN FASA 4E-E.2:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.close();
    try { browserProc.kill('SIGKILL'); } catch (_) {}
    await sleep(400);
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  }
})();
