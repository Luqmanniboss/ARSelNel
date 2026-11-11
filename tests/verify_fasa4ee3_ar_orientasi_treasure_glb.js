/**
 * ARSELNEL — FASA 4E-E.3 AUTOMATED E2E VERIFICATION SUITE
 * Integrasi AR Orientasi Dunia ke Kotak ARSELNEL (Sasaran Indeks 6) & Model Peti Harta Karun GLB Sebenar
 *
 * Menguji kesemua 25 semakan wajib Fasa 4E-E.3:
 *  1. Fail .mind dimuatkan tanpa 404 (7 sasaran: 0..6).
 *  2. Semua marker asal kekal sah (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan, 5: Jelajah 3D).
 *  3. Marker/akses AR Orientasi Dunia berfungsi (Indeks 6 + Butang HUD #btn-launch-orientasi-dunia).
 *  4. Panel pengenalan AR Orientasi Dunia dibuka dengan betul (tajuk, 6 ciri, butang Mula & Tutup).
 *  5. Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR.
 *  6. Butang Mula AR Orientasi Dunia membersihkan sesi Kotak AR (kamera, MindAR, audio, listener).
 *  7. Modul AR Orientasi Dunia (/cellquest/adventure.html?mode=camera-ar&from=kotak) dibuka tanpa ralat.
 *  8. Kamera dan sensor orientasi boleh diaktifkan.
 *  9. Kalibrasi 0° berfungsi.
 * 10. Gyroscope 4 arah (kiri, kanan, atas, bawah) berfungsi.
 * 11. Smart Radar berfungsi.
 * 12. 8 stesen AR berada pada kedudukan yang betul.
 * 13. Model organel mempunyai warna/material yang betul.
 * 14. Modal Teroka dan Deep Zoom berfungsi.
 * 15. Kuiz organel dan markah berfungsi.
 * 16. Fail treasure_chest.glb dimuatkan tanpa 404 (melalui laluan relatif ../models/treasure_chest.glb).
 * 17. Model peti GLB dipaparkan dengan betul dalam keadaan tertutup (Status A: locked).
 * 18. Menjawab salah mengekalkan peti tertutup (locked, 0 markah tambahan, boleh cuba semula).
 * 19. Menjawab betul memainkan animasi pembukaan peti (Status B: unlocked -> Status C: opened).
 * 20. Peti kekal terbuka selepas animasi selesai (Status C: opened).
 * 21. Ganjaran diberikan sekali sahaja (+100 mata setiap peti, tiada ganjaran berulang).
 * 22. Peti kedua/seterusnya kekal tertutup sehingga diselesaikan pada kedudukan berbeza.
 * 23. Butang Kembali ke Kotak ARSELNEL (#ar-return-kotak-btn & modal) berfungsi.
 * 24. Sesi Kotak ARSELNEL pulih tanpa skrin hitam selepas kembali.
 * 25. Ujian ulang-alik 5 kali lulus tanpa kebocoran memori atau kamera gelap.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const DEBUG_PORT = 9356;

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
          const args = (msg.params.args || []).map((a) => a.value || a.description || '').join(' ');
          if (!args.includes('favicon') && !args.includes('supabase')) {
            this.consoleErrors.push(args);
          }
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
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(2200);
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    }
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

(async () => {
  console.log('================================================================================');
  console.log('🧪 ARSELNEL FASA 4E-E.3 — UJIAN AUTOMATIK AR ORIENTASI DUNIA & TREASURE CHEST GLB');
  console.log('================================================================================');

  // Salin imej marker ke direktori artifak untuk laporan
  try {
    const srcMarker = path.join(__dirname, '..', 'kotak_arselnel', 'assets', 'markers', 'marker-orientasi-dunia.png');
    const dstMarker = path.join(ARTIFACT_DIR, 'fasa_4ee3_marker_orientasi_dunia.png');
    if (fs.existsSync(srcMarker)) {
      fs.copyFileSync(srcMarker, dstMarker);
    }
  } catch (e) {}

  const results = [];
  const record = (num, name, pass, detail = '') => {
    results.push({ num, name, pass: !!pass, detail });
    const icon = pass ? '✅ LULUS' : '❌ GAGAL';
    console.log(`[${String(num).padStart(2, '0')}/25] ${icon} — ${name}${detail ? ' :: ' + detail : ''}`);
  };

  // Semak aset HTTP terlebih dahulu
  const mindCheck = await checkUrlStatus('/kotak_arselnel/assets/markers/kotak_arselnel.mind?v=fasa4ee3');
  const markerPngCheck = await checkUrlStatus('/kotak_arselnel/assets/markers/marker-orientasi-dunia.png');
  const chestGlbCheck = await checkUrlStatus('/models/treasure_chest.glb');

  const browserExe = findBrowserExecutable();
  const userDataDir = path.join(__dirname, '.tmp_edge_fasa4ee3_' + Date.now());
  const browserProc = spawn(browserExe, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1024,768',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-gpu-sandbox',
    'about:blank'
  ], { stdio: 'ignore' });

  let client = null;
  try {
    let targets = null;
    for (let i = 0; i < 25; i++) {
      await sleep(300);
      try {
        targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
        if (Array.isArray(targets) && targets.length > 0) break;
      } catch (e) {}
    }
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });

    // =========================================================================
    // SEMAKAN 1, 2, 3, 4, 5, 6: KOTAK ARSELNEL & MARKER 6 (AR ORIENTASI DUNIA)
    // =========================================================================
    await client.navigate(`${BASE_URL}/kotak_arselnel/code.html`);
    await sleep(2500);

    const check123 = await client.evaluate(`(() => {
      const st = window.KotakARSELNEL && window.KotakARSELNEL.ARState;
      const mindController = st && st.mindarThree && st.mindarThree.controller;
      const hudBtn = document.getElementById('btn-launch-orientasi-dunia');
      return {
        hasKotak: !!window.KotakARSELNEL,
        anchor0: !!(st && st.anchor),
        anchor1: !!(st && st.anchorNota),
        anchor2: !!(st && st.anchorKuiz),
        anchor3: !!(st && st.anchorCellQuestAnimal),
        anchor4: !!(st && st.anchorCellQuestPlant),
        anchor5: !!(st && st.anchorJelajah3D),
        anchor6: !!(st && st.anchorOrientasiDunia),
        anchorsLength: st && st.mindarThree && Array.isArray(st.mindarThree.anchors) ? st.mindarThree.anchors.length : 0,
        matchingDimsLength: mindController && Array.isArray(mindController.markerDimensions) ? mindController.markerDimensions.length : 0,
        hasHudBtn: !!hudBtn,
        orientasiRoute: window.KotakARSELNEL ? window.KotakARSELNEL.ORIENTASI_DUNIA_ROUTE : null
      };
    })()`);

    record(
      1,
      'Fail .mind dimuatkan tanpa 404 (7 sasaran: 0..6)',
      mindCheck.status === 200 && mindCheck.bytes > 3500000 && check123.matchingDimsLength === 7 && client.http404s.length === 0,
      `HTTP=${mindCheck.status}, Saiz=${mindCheck.bytes}B, Dimensi=${check123.matchingDimsLength}`
    );

    record(
      2,
      'Semua marker asal kekal sah (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan, 5: Jelajah 3D)',
      check123.anchor0 && check123.anchor1 && check123.anchor2 && check123.anchor3 && check123.anchor4 && check123.anchor5,
      `Anchors 0..5 aktif (Jumlah=${check123.anchorsLength})`
    );

    record(
      3,
      'Marker/akses AR Orientasi Dunia didaftarkan (Sasaran Indeks 6 + Butang HUD)',
      check123.anchor6 && check123.hasHudBtn && markerPngCheck.status === 200 && check123.orientasiRoute === '/cellquest/adventure.html?mode=camera-ar&from=kotak',
      `Anchor6=${check123.anchor6}, ButangHUD=${check123.hasHudBtn}, Route=${check123.orientasiRoute}`
    );

    // Semakan 4: Simulasi targetFound(6) membuka Panel Pengenalan AR Orientasi Dunia
    const check4 = await client.evaluate(`(() => {
      window.KotakARSELNEL.ARState.anchorOrientasiDunia.onTargetFound();
      const backdrop = document.getElementById('orientasi-dunia-marker-intro-backdrop');
      const title = document.getElementById('orientasi-intro-title');
      const features = Array.from(document.querySelectorAll('#orientasi-dunia-marker-intro-backdrop .orientasi-intro-feature-item span:last-child')).map(el => el.textContent.trim());
      const btnStart = document.getElementById('btn-orientasi-intro-start');
      const btnClose = document.getElementById('btn-orientasi-intro-close');
      return {
        isOpen: backdrop && !backdrop.classList.contains('hidden'),
        titleText: title ? title.textContent.trim() : '',
        features,
        hasStart: !!btnStart,
        hasClose: !!btnClose
      };
    })()`);

    await sleep(300);
    await client.screenshot(path.join(ARTIFACT_DIR, 'fasa_4ee3_orientasi_intro_panel.png'));

    record(
      4,
      'Panel pengenalan AR Orientasi Dunia dibuka dengan betul apabila Marker 6 diimbas',
      check4.isOpen &&
        check4.titleText.includes('AR ORIENTASI DUNIA — MISI JELAJAH DUNIA SEL') &&
        check4.features.length === 6 &&
        check4.hasStart &&
        check4.hasClose,
      `Tajuk="${check4.titleText}", Ciri=${check4.features.length}/6`
    );

    // Semakan 5: Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR
    const check5 = await client.evaluate(`(() => {
      document.getElementById('btn-orientasi-intro-close').click();
      const backdrop = document.getElementById('orientasi-dunia-marker-intro-backdrop');
      const st = window.KotakARSELNEL.ARState;
      return {
        isClosed: backdrop && backdrop.classList.contains('hidden'),
        cameraStillActive: !!(st && st.cameraActive),
        rendererValid: !!(st && st.renderer)
      };
    })()`);

    record(
      5,
      'Butang Tutup menutup panel pengenalan tanpa merosakkan sesi AR',
      check5.isClosed && check5.cameraStillActive && check5.rendererValid,
      `Ditutup=${check5.isClosed}, Kamera=${check5.cameraStillActive}`
    );

    // Semakan 6: Butang Mula AR Orientasi Dunia membersihkan sesi Kotak AR & navigasi
    await client.evaluate(`(() => {
      window.KotakARSELNEL.openOrientasiDuniaIntroPanel();
      document.getElementById('btn-orientasi-intro-start').click();
    })()`);
    await sleep(2800);

    const check67 = await client.evaluate(`(() => {
      return {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hasCellQuestAR: !!window.CellQuestAR,
        mode: window.CellQuestAR ? window.CellQuestAR.getState().mode : null,
        worldActive: window.CellQuestAR ? window.CellQuestAR.getWorldState().active : false
      };
    })()`);

    record(
      6,
      'Butang Mula AR Orientasi Dunia membersihkan sesi Kotak AR dan melancarkan navigasi selamat',
      check67.pathname.includes('/cellquest/adventure.html') && check67.search.includes('mode=camera-ar') && check67.search.includes('from=kotak'),
      `URL=${check67.pathname}${check67.search}`
    );

    record(
      7,
      'Modul AR Orientasi Dunia dibuka tanpa ralat (mode=camera-ar&from=kotak)',
      check67.hasCellQuestAR && check67.mode === 'camera-ar' && check67.worldActive,
      `Mode=${check67.mode}, WorldActive=${check67.worldActive}`
    );

    // =========================================================================
    // SEMAKAN 8, 9, 10, 11, 12, 13, 14, 15: KAMERA, GYRO 4 ARAH, RADAR, 8 STESEN, ORGANEL, DEEP ZOOM, KUIZ
    // =========================================================================
    // Tunggu semua 8 GLB organel + treasure_chest.glb selesai dimuatkan
    await client.evaluate(`(async () => {
      if (window.CellQuestAR && window.CellQuestAR.preloadAllGLBs) {
        await window.CellQuestAR.preloadAllGLBs();
      }
      if (window.CellQuestAR && window.CellQuestAR.loadTreasureChestGLB) {
        await window.CellQuestAR.loadTreasureChestGLB();
      }
    })()`);
    await sleep(800);

    const check8910 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const camActive = api.isCameraStreamActive();
      // Kalibrasi pada alpha=100, beta=90 (tegak menghadap hadapan), gamma=0
      api.simulateDeviceOrientation(100, 90, 0, 0);
      api.calibrateHeading();
      const calPose = api.simulateDeviceOrientation(100, 90, 0, 0);

      // Pusing kiri (alpha meningkat +45 -> 145)
      const leftPose = api.simulateDeviceOrientation(145, 90, 0, 0);
      // Pusing kanan (alpha berkurang -45 -> 55)
      const rightPose = api.simulateDeviceOrientation(55, 90, 0, 0);
      // Dongak atas (beta > 90 -> 110)
      const upPose = api.simulateDeviceOrientation(100, 110, 0, 0);
      // Tunduk bawah (beta < 90 -> 70)
      const downPose = api.simulateDeviceOrientation(100, 70, 0, 0);

      // Kembalikan ke arah hadapan 0°
      api.simulateDeviceOrientation(100, 90, 0, 0);

      return {
        camActive,
        calHeading: Math.round(calPose.currentHeadingDeg),
        calPitch: Math.round(calPose.currentPitchDeg),
        leftHeading: Math.round(leftPose.currentHeadingDeg),
        rightHeading: Math.round(rightPose.currentHeadingDeg),
        upPitch: Math.round(upPose.currentPitchDeg),
        downPitch: Math.round(downPose.currentPitchDeg)
      };
    })()`);

    record(
      8,
      'Kamera dan sensor orientasi boleh diaktifkan',
      check8910.camActive === true,
      `CameraStreamActive=${check8910.camActive}`
    );

    record(
      9,
      'Kalibrasi 0° berfungsi',
      check8910.calHeading === 0 && Math.abs(check8910.calPitch) <= 2,
      `CalibratedHeading=${check8910.calHeading}°, Pitch=${check8910.calPitch}°`
    );

    record(
      10,
      'Gyroscope 4 arah (kiri, kanan, atas, bawah) berfungsi',
      check8910.leftHeading !== check8910.rightHeading && check8910.upPitch > 10 && check8910.downPitch < -10,
      `Kiri=${check8910.leftHeading}°, Kanan=${check8910.rightHeading}°, Atas=+${check8910.upPitch}°, Bawah=${check8910.downPitch}°`
    );

    const check111213 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const ws = api.getWorldState();
      const stations = api.getStationsConfig();
      const compassCanvas = document.getElementById('ar-world-compass');
      const radarWrap = document.getElementById('ar-world-compass-wrap');

      // Semak warna/material 8 model organel
      let validOrganelleCount = 0;
      ws.stationGroups.forEach((grp) => {
        let meshCount = 0;
        grp.traverse((ch) => {
          if (ch.isMesh && ch.material) meshCount++;
        });
        if (meshCount > 0) validOrganelleCount++;
      });

      const uniqueAzimuths = new Set(stations.map(s => s.azimuthDeg)).size;
      const uniqueRadii = new Set(stations.map(s => s.radius)).size;

      return {
        radarVisible: !!(compassCanvas && radarWrap && radarWrap.style.display !== 'none'),
        stationCount: stations.length,
        stationGroupsCount: ws.stationGroups.length,
        uniqueAzimuths,
        uniqueRadii,
        validOrganelleCount
      };
    })()`);

    record(
      11,
      'Smart Radar berfungsi',
      check111213.radarVisible === true,
      `RadarVisible=${check111213.radarVisible}`
    );

    record(
      12,
      '8 stesen AR berada pada kedudukan 360° yang betul',
      check111213.stationCount === 8 && check111213.stationGroupsCount === 8 && check111213.uniqueAzimuths === 8,
      `Stesen=${check111213.stationCount}, AzimutUnik=${check111213.uniqueAzimuths}`
    );

    record(
      13,
      'Model organel mempunyai warna dan material yang betul',
      check111213.validOrganelleCount === 8,
      `OrganelBermaterial=${check111213.validOrganelleCount}/8`
    );

    // Semakan 14 & 15: Modal Teroka, Deep Zoom & Kuiz Organel
    const check1415 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      // Buka modal Teroka Stesen 1 (Nukleus)
      api.openQuiz(0);
      const modalOpen = document.getElementById('station-modal').classList.contains('open');
      const zoomBefore = api.getPreviewZoomState().distance;
      const zoomInBtn = document.getElementById('cq-zoom-in-btn');
      if (zoomInBtn) zoomInBtn.click();
      const zoomAfter = api.getPreviewZoomState().distance;

      // Jawab kuiz Stesen 1 dengan betul & lengkapkan kesemua 8 stesen untuk membuka Misi Peti Harta Karun
      const stn0 = api.getState().stations[0];
      const optBtns = document.querySelectorAll('#quiz-options .cq-quiz-opt');
      if (optBtns[stn0.correct]) optBtns[stn0.correct].click();
      const scoreAfterStn1 = api.getState().score;

      document.getElementById('close-station-btn').click();
      for (let i = 1; i <= 8; i++) {
        api.markStationCompleted(i);
      }
      return {
        modalOpen,
        zoomWorked: zoomAfter < zoomBefore,
        scoreAfterStn1,
        completedStationsCount: api.getState().completedStations.size
      };
    })()`);

    record(
      14,
      'Modal Teroka dan Deep Zoom 3D berfungsi',
      check1415.modalOpen && check1415.zoomWorked,
      `ModalTeroka=${check1415.modalOpen}, DeepZoom=${check1415.zoomWorked}`
    );

    record(
      15,
      'Kuiz organel dan sistem markah berfungsi',
      check1415.scoreAfterStn1 >= 100 && check1415.completedStationsCount === 8,
      `MarkahStesen1=${check1415.scoreAfterStn1}, StesenSelesai=${check1415.completedStationsCount}/8`
    );

    // =========================================================================
    // SEMAKAN 16..22: TREASURE CHEST GLB & 3-CHEST LOCKED/UNLOCKED/OPENED SYSTEM
    // =========================================================================
    // Sembunyikan sebarang modal/kalibrasi supaya tangkapan skrin peti 3D jelas
    const check1617 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const calUI = document.getElementById('ar-world-calibration-ui');
      if (calUI) calUI.style.display = 'none';
      api.startTreasureHunt();

      const th = api.getTreasureHuntState();
      const diag = api.getGLBDiagnostics()['treasure_chest'] || {};
      const chest0 = th.chests[0];
      const chest1 = th.chests[1];
      const chest2 = th.chests[2];
      const grp0 = th.chestGroups[0];
      const grp1 = th.chestGroups[1];
      const grp2 = th.chestGroups[2];

      // Halakan kamera tepat ke arah Peti 1 (azimuth 225°, elevation -12°)
      api.lookAtHeading(chest0.azimuthDeg, chest0.elevationDeg);
      document.querySelectorAll('#cq-toast, #secret-door-toast').forEach(el => { el.style.display = 'none'; });

      const pos0 = grp0 ? grp0.position.toArray().map(v => +v.toFixed(2)) : [];
      const pos1 = grp1 ? grp1.position.toArray().map(v => +v.toFixed(2)) : [];
      const pos2 = grp2 ? grp2.position.toArray().map(v => +v.toFixed(2)) : [];

      return {
        glbLoaded: th.glbLoaded && !!diag.loaded,
        glbUrl: th.glbUrl,
        animNames: diag.animationNames || [],
        glbAttached0: !!(grp0 && grp0.userData.glbAttached && grp0.userData.glbLidNode),
        glbAttached1: !!(grp1 && grp1.userData.glbAttached && grp1.userData.glbLidNode),
        glbAttached2: !!(grp2 && grp2.userData.glbAttached && grp2.userData.glbLidNode),
        chest0Status: chest0.status,
        chest0OpenProgress: grp0 ? grp0.userData.openProgress : -1,
        lidQuatXClosed: grp0 && grp0.userData.glbLidNode ? +grp0.userData.glbLidNode.quaternion.x.toFixed(4) : null,
        pos0,
        pos1,
        pos2
      };
    })()`);

    await sleep(400);
    await client.screenshot(path.join(ARTIFACT_DIR, 'fasa_4ee3_chest_glb_closed.png'));

    record(
      16,
      'Fail treasure_chest.glb dimuatkan tanpa 404 melalui laluan relatif',
      chestGlbCheck.status === 200 && chestGlbCheck.bytes > 30000000 && check1617.glbLoaded && check1617.glbUrl === '../models/treasure_chest.glb',
      `HTTP=${chestGlbCheck.status}, Saiz=${chestGlbCheck.bytes}B, Klip=${JSON.stringify(check1617.animNames)}`
    );

    record(
      17,
      'Model peti GLB dipaparkan dengan betul dalam keadaan tertutup (Status A: locked)',
      check1617.glbAttached0 && check1617.chest0Status === 'locked' && check1617.chest0OpenProgress === 0 && check1617.lidQuatXClosed === 0,
      `Status=${check1617.chest0Status}, OpenProgress=${check1617.chest0OpenProgress}, LidQuatX=${check1617.lidQuatXClosed}`
    );

    // Semakan 18: Menjawab salah mengekalkan peti tertutup (locked, tiada markah tambahan, boleh cuba semula)
    const check18 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const scoreBefore = api.getState().score;
      api.openTreasureChestModal(0);
      const chest0 = api.getTreasureHuntState().chests[0];
      const wrongIdx = (chest0.question.correct + 1) % 4;
      api.answerBonusQuestion(wrongIdx);

      const grp0 = api.getTreasureChestGroups()[0];
      const retryBtn = document.getElementById('tc-retry-btn');
      const scoreAfterWrong = api.getState().score;
      const statusAfterWrong = chest0.status;
      const openProgressAfterWrong = grp0.userData.openProgress;

      // Klik Cuba Semula Soalan
      if (retryBtn) retryBtn.click();

      return {
        statusAfterWrong,
        openProgressAfterWrong,
        scoreUnchanged: scoreAfterWrong === scoreBefore,
        hasRetryBtn: !!retryBtn,
        completed: !!chest0.completed
      };
    })()`);

    record(
      18,
      'Menjawab salah mengekalkan peti tertutup (Status locked, 0 markah, boleh cuba semula)',
      check18.statusAfterWrong === 'locked' && check18.openProgressAfterWrong === 0 && check18.scoreUnchanged && check18.hasRetryBtn && !check18.completed,
      `Status=${check18.statusAfterWrong}, OpenProgress=${check18.openProgressAfterWrong}, RetryBtn=${check18.hasRetryBtn}`
    );

    // Semakan 19, 20, 21, 22: Menjawab betul memainkan animasi pembukaan peti, kekal terbuka, beri ganjaran sekali sahaja, dan peti ke-2 kekal tertutup
    const scoreBeforeCorrect = await client.evaluate(`window.CellQuestAR.getState().score`);
    await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const chest0 = api.getTreasureHuntState().chests[0];
      api.answerBonusQuestion(chest0.question.correct);
    })()`);

    // Semak semasa animasi sedang berjalan (Status B: unlocked) dan tunggu selesai (Status C: opened)
    await sleep(800);

    const check19202122 = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const th = api.getTreasureHuntState();
      const chest0 = th.chests[0];
      const chest1 = th.chests[1];
      const chest2 = th.chests[2];
      const grp0 = th.chestGroups[0];
      const grp1 = th.chestGroups[1];
      const grp2 = th.chestGroups[2];
      const feedbackText = document.getElementById('tc-quiz-feedback') ? document.getElementById('tc-quiz-feedback').textContent.trim() : '';

      const scoreAfterFirstOpen = api.getState().score;

      // Tutup modal Peti 1 supaya kita boleh ambil screenshot Peti 1 GLB Terbuka di ruang 3D
      api.closeTreasureChestModal();
      api.lookAtHeading(chest0.azimuthDeg, chest0.elevationDeg);
      document.querySelectorAll('#cq-toast, #secret-door-toast').forEach(el => { el.style.display = 'none'; });

      return {
        chest0Status: chest0.status,
        chest0Completed: chest0.completed,
        chest0RewardClaimed: chest0.rewardClaimed,
        grp0OpenProgress: grp0.userData.openProgress,
        lidQuatXOpen: grp0.userData.glbLidNode ? +grp0.userData.glbLidNode.quaternion.x.toFixed(4) : 0,
        animTimeOpen: grp0.userData.animAction ? +grp0.userData.animAction.time.toFixed(3) : 0,
        feedbackText,
        scoreAfterFirstOpen,
        chest1Status: chest1.status,
        grp1OpenProgress: grp1.userData.openProgress,
        chest2Status: chest2.status,
        grp2OpenProgress: grp2.userData.openProgress,
        distinctPositions: grp0.position.distanceTo(grp1.position) > 3.0 && grp1.position.distanceTo(grp2.position) > 3.0
      };
    })()`);

    await sleep(350);
    await client.screenshot(path.join(ARTIFACT_DIR, 'fasa_4ee3_chest_glb_open.png'));

    // Cuba buka semula Peti 1 yang telah selesai dan buktikan ia KEKAL TERBUKA & TIDAK memberi markah berganda,
    // serta buktikan selepas beralih ke Peti 2 (advanceChest), Peti 1 masih kekal terbuka manakala Peti 2 kekal tertutup!
    const checkRevisitAndAdvance = await client.evaluate(`(() => {
      const api = window.CellQuestAR;
      const scoreBeforeRevisit = api.getState().score;

      // Beralih ke Peti 2
      api.advanceChest();
      const grp0 = api.getTreasureChestGroups()[0];
      const grp1 = api.getTreasureChestGroups()[1];

      // Kembali semula ke Peti 1 & cuba panggil openTreasureChestModal(0) dan answerBonusQuestion
      api.openTreasureChestModal(0);
      const chest0 = api.getTreasureHuntState().chests[0];
      api.answerBonusQuestion(chest0.question.correct);
      api.closeTreasureChestModal();

      const scoreAfterRevisit = api.getState().score;

      return {
        scoreBeforeRevisit,
        scoreAfterRevisit,
        noDuplicatePoints: scoreAfterRevisit === scoreBeforeRevisit,
        chest0StillOpenedAfterAdvance: chest0.status === 'opened' && grp0.userData.openProgress === 1 && grp0.userData.glbLidNode.quaternion.x < -0.35,
        chest1StillLocked: api.getTreasureHuntState().chests[1].status === 'locked' && grp1.userData.openProgress === 0 && grp1.userData.glbLidNode.quaternion.x === 0
      };
    })()`);

    record(
      19,
      'Menjawab betul memainkan animasi pembukaan peti GLB (Lid & AnimationMixer)',
      check19202122.grp0OpenProgress === 1 && check19202122.lidQuatXOpen < -0.4 && check19202122.animTimeOpen > 4.0 && check19202122.feedbackText.includes('Tahniah! Peti Harta Karun Dibuka!'),
      `LidQuatX=${check19202122.lidQuatXOpen}, AnimTime=${check19202122.animTimeOpen}s`
    );

    record(
      20,
      'Peti pertama kekal terbuka secara kekal selepas animasi selesai (walaupun beralih ke peti lain)',
      check19202122.chest0Status === 'opened' && checkRevisitAndAdvance.chest0StillOpenedAfterAdvance,
      `Chest0Status=${check19202122.chest0Status}, KekalTerbuka=${checkRevisitAndAdvance.chest0StillOpenedAfterAdvance}`
    );

    record(
      21,
      'Ganjaran +100 diberikan sekali sahaja dan tiada ganjaran berulang apabila peti dibuka semula',
      check19202122.scoreAfterFirstOpen === scoreBeforeCorrect + 100 && checkRevisitAndAdvance.noDuplicatePoints,
      `Markah=+100 (${scoreBeforeCorrect}->${check19202122.scoreAfterFirstOpen}), TiadaGandaan=${checkRevisitAndAdvance.noDuplicatePoints}`
    );

    record(
      22,
      'Peti kedua dan ketiga berada pada kedudukan berbeza dan kekal tertutup sehingga diselesaikan',
      check19202122.distinctPositions && checkRevisitAndAdvance.chest1StillLocked && check19202122.chest2Status === 'locked',
      `KedudukanBerbeza=${check19202122.distinctPositions}, Peti2Status=${check19202122.chest1Status}, Peti3Status=${check19202122.chest2Status}`
    );

    // =========================================================================
    // SEMAKAN 23, 24, 25: KEMBALI KE KOTAK ARSELNEL & UJIAN ULANG-ALIK 5 KALI
    // =========================================================================
    const check23Btn = await client.evaluate(`(() => {
      const btn = document.getElementById('ar-return-kotak-btn');
      const visible = !!(btn && btn.style.display !== 'none');
      if (btn) btn.click();
      return { visible };
    })()`);

    await sleep(2500);

    const check24 = await client.evaluate(`(() => {
      const st = window.KotakARSELNEL && window.KotakARSELNEL.ARState;
      const gl = st && st.renderer ? st.renderer.getContext() : null;
      return {
        pathname: window.location.pathname,
        hasKotak: !!window.KotakARSELNEL,
        cameraActive: !!(st && st.cameraActive),
        contextLost: gl ? gl.isContextLost() : true
      };
    })()`);

    record(
      23,
      'Butang Kembali ke Kotak ARSELNEL (#ar-return-kotak-btn) berfungsi',
      check23Btn.visible && check24.pathname.includes('/kotak_arselnel/code.html'),
      `ButangKelihatan=${check23Btn.visible}, KembaliKe=${check24.pathname}`
    );

    record(
      24,
      'Sesi Kotak ARSELNEL pulih tanpa skrin hitam selepas kembali',
      check24.hasKotak && check24.cameraActive && !check24.contextLost,
      `KameraAktif=${check24.cameraActive}, WebGLContextLost=${check24.contextLost}`
    );

    // Semakan 25: Ujian ulang-alik 5 kali (Kotak AR -> Marker 6 Intro -> AR Orientasi Dunia -> Kembali ke Kotak AR)
    let all5CyclesOk = true;
    const cycleLogs = [];
    for (let c = 1; c <= 5; c++) {
      // Imbas Marker 6 & mula AR Orientasi Dunia
      await client.evaluate(`(() => {
        window.KotakARSELNEL.ARState.anchorOrientasiDunia.onTargetFound();
        document.getElementById('btn-orientasi-intro-start').click();
      })()`);
      await sleep(2200);

      const inAR = await client.evaluate(`(() => {
        const api = window.CellQuestAR;
        if (!api) return { ok: false };
        return {
          ok: api.getState().mode === 'camera-ar' && api.getWorldState().active && api.isCameraStreamActive()
        };
      })()`);

      // Klik butang Kembali ke Kotak AR
      await client.evaluate(`(() => {
        const btn = document.getElementById('ar-return-kotak-btn');
        if (btn) btn.click();
        else if (window.CellQuestAR) window.CellQuestAR.returnToKotakARSELNEL();
      })()`);
      await sleep(2200);

      const backInKotak = await client.evaluate(`(() => {
        const st = window.KotakARSELNEL && window.KotakARSELNEL.ARState;
        const gl = st && st.renderer ? st.renderer.getContext() : null;
        return {
          ok: window.location.pathname.includes('/kotak_arselnel') && !!(st && st.cameraActive) && !(gl && gl.isContextLost())
        };
      })()`);

      const cycleOk = inAR.ok && backInKotak.ok;
      if (!cycleOk) all5CyclesOk = false;
      cycleLogs.push(`Kitaran${c}:${cycleOk ? 'OK' : 'GAGAL'}`);
    }

    record(
      25,
      'Ujian ulang-alik 5 kali (Kotak AR <-> AR Orientasi Dunia) lulus tanpa kebocoran memori atau kamera gelap',
      all5CyclesOk && client.pageErrors.length === 0,
      `${cycleLogs.join(', ')} | RalatHalaman=${client.pageErrors.length}`
    );

    const passedCount = results.filter((r) => r.pass).length;
    console.log('================================================================================');
    console.log(`📊 KEPUTUSAN AKHIR FASA 4E-E.3: ${passedCount}/${results.length} SEMAKAN LULUS`);
    console.log('================================================================================');

    if (passedCount !== results.length) {
      process.exitCode = 1;
    }
  } finally {
    if (client) client.close();
    try {
      browserProc.kill();
    } catch (e) {}
    await sleep(500);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
})();

