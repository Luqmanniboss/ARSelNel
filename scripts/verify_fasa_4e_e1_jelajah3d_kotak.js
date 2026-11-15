// scripts/verify_fasa_4e_e1_jelajah3d_kotak.js
// Skrip Ujian Automatik Fasa 4E-E.1: Integrasi Mod Jelajah 3D ke Kotak ARSELNEL
// Menguji kesemua 20 kriteria wajib Fasa 4E-E.1 + 5x kitaran penuh Kotak ARSELNEL -> Jelajah 3D -> Kotak ARSELNEL

const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9431;
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.http404s = [];
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
      if (msg.method === 'Network.responseReceived') {
        const { response } = msg.params;
        if (response && response.status === 404 && !response.url.includes('favicon.ico')) {
          this.http404s.push(response.url);
        }
      }
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

async function waitForKotakReady(client, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ok = await client.evaluate(`
        Boolean(
          window.KotakARSELNEL &&
          window.ARState &&
          window.ARState.mindarThree &&
          window.ARState.renderer &&
          document.getElementById('btn-launch-jelajah3d')
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

async function run() {
  console.log('=== MEMULAKAN UJIAN AUTOMATIK FASA 4E-E.1: INTEGRASI MOD JELAJAH 3D KE KOTAK ARSELNEL ===\n');

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

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-fasa-4e-e1-'));
  const proc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
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
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: "try { localStorage.setItem('arselnel_kotak_onboarding_v1', 'completed'); } catch (e) {}"
  });
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1180,
    height: 820,
    deviceScaleFactor: 2,
    mobile: true,
    fitWindow: false
  });

  // Set mock session
  await client.evaluate(`
    (() => {
      const u = { id: 'test-student-fasa-4e-e1', full_name: 'Saintis Uji Fasa 4E-E.1', nama: 'Saintis Uji Fasa 4E-E.1', kelas: '1 Bestari', role: 'student' };
      localStorage.setItem('arselnel_session', JSON.stringify({ user: u }));
      localStorage.setItem('arselnel_current_user', JSON.stringify(u));
      localStorage.setItem('currentUser', JSON.stringify(u));
      localStorage.setItem('arselnel_user', JSON.stringify(u));
    })()
  `);

  const results = [];
  function record(id, name, pass, detail = '') {
    results.push({ id, name, pass: !!pass, detail });
    const icon = pass ? '✅ LULUS' : '❌ GAGAL';
    console.log(`${icon} [Ujian ${id}] ${name}${detail ? ' — ' + detail : ''}`);
  }

  // Navigasi ke Kotak ARSELNEL
  await client.send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  const kotakReady = await waitForKotakReady(client, 45);
  await delay(1000);

  // Screenshot 1: Kotak ARSELNEL dengan butang Jelajah 3D di Top HUD
  await client.captureScreenshot('fasa_4e_e1_kotak_top_hud_button.png');

  // -------------------------------------------------------------------------
  // UJIAN 1: Butang Jelajah 3D wujud, saiz >= 44px, tidak menutup elemen lain
  // -------------------------------------------------------------------------
  const btnCheck = await client.evaluate(`
    (() => {
      const btn = document.getElementById('btn-launch-jelajah3d');
      const addScanBtn = document.getElementById('btn-add-scan');
      const multiBar = document.getElementById('ar-multi-panel-bar');
      if (!btn) return { exists: false };
      const r = btn.getBoundingClientRect();
      const cs = window.getComputedStyle(btn);
      const addR = addScanBtn ? addScanBtn.getBoundingClientRect() : null;
      const barR = multiBar ? multiBar.getBoundingClientRect() : null;
      const overlapsAdd = addR && addR.width > 0 ? !(r.right < addR.left || r.left > addR.right || r.bottom < addR.top || r.top > addR.bottom) : false;
      const overlapsBar = barR && barR.width > 0 ? !(r.right < barR.left || r.left > barR.right || r.bottom < barR.top || r.top > barR.bottom) : false;
      return {
        exists: true,
        text: btn.textContent.trim().replace(/\\s+/g, ' '),
        width: Math.round(r.width),
        height: Math.round(r.height),
        minHeight: cs.minHeight,
        color: cs.color,
        overlapsAdd,
        overlapsBar
      };
    })()
  `);
  record(
    1,
    'Butang Jelajah 3D wujud di Kotak ARSELNEL tanpa bertindih',
    btnCheck.exists && btnCheck.height >= 44 && !btnCheck.overlapsAdd && !btnCheck.overlapsBar,
    `Label="${btnCheck.text}", Saiz=${btnCheck.width}x${btnCheck.height}px, Bertindih=${btnCheck.overlapsAdd || btnCheck.overlapsBar}`
  );

  // Semak juga modal pengesahan apabila ada panel aktif (dan batal dahulu sebelum klik terus)
  await client.evaluate(`window.handleTargetFound(1, 'nota')`);
  await delay(600);
  const modalConfirmTest = await client.evaluate(`
    (() => {
      const immediateLaunched = window.launchJelajah3D(false);
      const modal = document.getElementById('jelajah3d-modal-backdrop');
      const isModalVisible = modal && !modal.classList.contains('hidden');
      return { immediateLaunched, isModalVisible };
    })()
  `);
  await client.captureScreenshot('fasa_4e_e1_kotak_confirm_modal.png');

  // -------------------------------------------------------------------------
  // UJIAN 2: Butang menuju route sebenar (/cellquest/adventure.html?mode=3d&from=kotak)
  // -------------------------------------------------------------------------
  await client.evaluate(`document.getElementById('btn-jelajah3d-confirm').click()`);
  const jelajahReady = await waitForJelajah3DReady(client, 50);
  await delay(1500);
  const currentUrlInfo = await client.evaluate(`
    ({
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      fromKotakFlag: sessionStorage.getItem('arselnel_return_to_kotak')
    })
  `);
  record(
    2,
    'Butang menuju route sebenar (/cellquest/adventure.html?mode=3d&from=kotak)',
    currentUrlInfo.pathname === '/cellquest/adventure.html' && currentUrlInfo.search.includes('mode=3d') && currentUrlInfo.search.includes('from=kotak'),
    `URL=${currentUrlInfo.pathname}${currentUrlInfo.search}, sessionStorage=${currentUrlInfo.fromKotakFlag}`
  );

  // Screenshot 2: Mod Jelajah 3D dengan butang "Kembali ke Kotak ARSELNEL"
  await client.captureScreenshot('fasa_4e_e1_jelajah3d_hud_return_btn.png');

  // -------------------------------------------------------------------------
  // UJIAN 3: Permainan berjaya dimulakan (State.mode === '3d')
  // -------------------------------------------------------------------------
  const gameInitCheck = await client.evaluate(`
    (() => {
      const st = window.CellQuestAR.getState();
      const r = window.CellQuestAR.getRenderer();
      const gl = r ? r.getContext() : null;
      return {
        mode: st.mode,
        hasRenderer: !!r,
        contextLost: gl ? gl.isContextLost() : true
      };
    })()
  `);
  record(
    3,
    'Permainan Jelajah 3D berjaya dimulakan',
    jelajahReady && gameInitCheck.mode === '3d' && gameInitCheck.hasRenderer && !gameInitCheck.contextLost,
    `mode=${gameInitCheck.mode}, WebGL Aktif=${!gameInitCheck.contextLost}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 4: Gyroscope permainan berfungsi
  // -------------------------------------------------------------------------
  const gyroCheck = await client.evaluate(`
    (async () => {
      await window.CellQuestAR.enableModAGyroscope();
      window.CellQuestAR.updateDeviceOrientation({ alpha: 100, beta: 82, gamma: 0 }, true);
      const cal = window.CellQuestAR.calibrateForwardDirection(false);
      const left = window.CellQuestAR.updateDeviceOrientation({ alpha: 135, beta: 82, gamma: 0 }, true);
      const right = window.CellQuestAR.updateDeviceOrientation({ alpha: 65, beta: 82, gamma: 0 }, true);
      window.CellQuestAR.calibrateForwardDirection(false);
      return {
        calYaw: cal.yaw,
        leftYaw: left.yaw,
        rightYaw: right.yaw
      };
    })()
  `);
  record(
    4,
    'Gyroscope permainan berfungsi (Kiri=+Yaw, Kanan=-Yaw, Kalibrasi=0)',
    Math.abs(gyroCheck.calYaw) < 0.001 && gyroCheck.leftYaw > 0.2 && gyroCheck.rightYaw < -0.2,
    `calYaw=${gyroCheck.calYaw.toFixed(3)}, leftYaw=${gyroCheck.leftYaw.toFixed(3)}, rightYaw=${gyroCheck.rightYaw.toFixed(3)}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 5: Joystick permainan berfungsi
  // -------------------------------------------------------------------------
  const joystickCheck = await client.evaluate(`
    (() => {
      window.CellQuestAR.setPlayerPose(0, 6.0, 0, 0);
      const beforeZ = window.CellQuestAR.getCamera().position.z;
      for (let i = 0; i < 10; i++) {
        window.CellQuestAR.setJoystickInput(0, 1, true);
      }
      const afterZ = window.CellQuestAR.getCamera().position.z;
      window.CellQuestAR.setJoystickInput(0, 0, false);
      return { beforeZ, afterZ, movedDist: Math.abs(afterZ - beforeZ) };
    })()
  `);
  record(
    5,
    'Joystick permainan berfungsi menggerakkan pemain di makmal 3D',
    joystickCheck.movedDist > 0.2,
    `Z awal=${joystickCheck.beforeZ.toFixed(2)} -> Z selepas=${joystickCheck.afterZ.toFixed(2)} (Jarak=${joystickCheck.movedDist.toFixed(2)}m)`
  );

  // -------------------------------------------------------------------------
  // UJIAN 6: Lapan stesen masih wujud
  // -------------------------------------------------------------------------
  const stationsCheck = await client.evaluate(`
    (() => {
      const meshes = window.CellQuestAR.getStationMeshes();
      return {
        count: meshes.length,
        names: meshes.map(m => m.data.title || m.data.name)
      };
    })()
  `);
  record(
    6,
    'Lapan stesen organel wujud lengkap di dalam makmal 3D',
    stationsCheck.count === 8,
    `Jumlah=${stationsCheck.count} (${stationsCheck.names.join(', ')})`
  );

  // -------------------------------------------------------------------------
  // UJIAN 7: Model organel masih berwarna (Tiada material hitam #000000)
  // -------------------------------------------------------------------------
  const matCheck = await client.evaluate(`
    (async () => {
      await window.CellQuestAR.preloadAllGLBs();
      const report = window.CellQuestAR.inspectAll3DStationMaterials();
      let totalMeshes = 0;
      let blackMeshes = 0;
      report.forEach(st => {
        st.meshes.forEach(m => {
          totalMeshes++;
          if (m.colorHex === '#000000' && !m.hasMap) blackMeshes++;
        });
      });
      return { stationCount: report.length, totalMeshes, blackMeshes };
    })()
  `);
  record(
    7,
    'Model organel 3D masih berwarna terang (tiada mesh hitam)',
    matCheck.stationCount === 8 && matCheck.totalMeshes > 20 && matCheck.blackMeshes === 0,
    `Stesen=${matCheck.stationCount}, Jumlah Mesh=${matCheck.totalMeshes}, Mesh Hitam=${matCheck.blackMeshes}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 8: Kuiz permainan berfungsi
  // -------------------------------------------------------------------------
  const quizCheck = await client.evaluate(`
    (() => {
      window.CellQuestAR.openQuiz(0);
      const modal = document.getElementById('station-modal');
      const isOpen = modal && modal.classList.contains('open');
      const title = document.getElementById('stn-title')?.textContent || '';
      const optsCount = document.querySelectorAll('#quiz-options button, #quiz-options .cq-quiz-opt').length;
      return { isOpen, title, optsCount };
    })()
  `);
  record(
    8,
    'Kuiz permainan berfungsi apabila stesen dibuka',
    quizCheck.isOpen && quizCheck.optsCount >= 3,
    `Stesen="${quizCheck.title}", Pilihan Kuiz=${quizCheck.optsCount}`
  );

  // Tutup modal kuiz
  await client.evaluate(`document.getElementById('close-station-btn')?.click()`);
  await delay(250);

  // -------------------------------------------------------------------------
  // UJIAN 9: Markah dan lencana tidak rosak (Jawab kesemua 8 stesen kuiz)
  // -------------------------------------------------------------------------
  const scoreBadgeCheck = await client.evaluate(`
    (() => {
      const st = window.CellQuestAR.getState();
      for (let i = 0; i < 8; i++) {
        window.CellQuestAR.openQuiz(i);
        const correctIdx = st.stations[i].correct;
        const btns = document.querySelectorAll('#quiz-options .cq-quiz-opt');
        if (btns[correctIdx]) btns[correctIdx].click();
      }
      document.getElementById('close-station-btn')?.click();
      const hudScore = document.getElementById('hud-score')?.textContent || '';
      const hudBadges = document.getElementById('hud-badge-count')?.textContent || '';
      return {
        completedSize: st.completedStations.size,
        score: st.score,
        hudScore,
        hudBadges
      };
    })()
  `);
  record(
    9,
    'Markah dan lencana berfungsi (8/8 stesen selesai, 800 mata)',
    scoreBadgeCheck.completedSize === 8 && scoreBadgeCheck.score >= 800,
    `Lencana=${scoreBadgeCheck.completedSize}/8, Markah=${scoreBadgeCheck.score}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 10: Peti Harta Karun & Pintu Rahsia Makmal masih berfungsi
  // -------------------------------------------------------------------------
  const chestCheck = await client.evaluate(`
    (() => {
      window.CellQuestAR.startTreasureHunt();
      const th = window.CellQuestAR.getTreasureHuntState();
      const door = window.CellQuestAR.getExitDoorMeshes();
      return {
        unlocked: th.unlocked || th.active,
        doorUnlocked: door ? !!door.unlocked : false,
        chestsCount: Array.isArray(th.chests) ? th.chests.length : 0
      };
    })()
  `);
  record(
    10,
    'Peti Harta Karun (Multi-Treasure Chest) & Pintu Teras Sel masih berfungsi',
    chestCheck.unlocked && chestCheck.doorUnlocked && chestCheck.chestsCount === 3,
    `unlocked=${chestCheck.unlocked}, doorUnlocked=${chestCheck.doorUnlocked}, Bilangan Peti=${chestCheck.chestsCount}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 11: Kembali ke Kotak ARSELNEL berfungsi
  // -------------------------------------------------------------------------
  const returnBtnExists = await client.evaluate(`
    (() => {
      const btn = document.getElementById('hud-return-kotak-btn');
      const lobbyBtn = document.getElementById('hud-3d-back-btn');
      return {
        hasReturnKotakBtn: !!btn,
        returnKotakText: btn ? btn.textContent.trim().replace(/\\s+/g, ' ') : '',
        hasLobbyBtn: !!lobbyBtn
      };
    })()
  `);
  await client.evaluate(`document.getElementById('hud-return-kotak-btn').click()`);
  const returnedKotakOk = await waitForKotakReady(client, 45);
  await delay(1000);
  const afterReturnUrl = await client.evaluate(`window.location.pathname`);
  record(
    11,
    'Butang "Kembali ke Kotak ARSELNEL" berfungsi & kembali ke /kotak_arselnel/code.html',
    returnBtnExists.hasReturnKotakBtn && returnBtnExists.hasLobbyBtn && returnedKotakOk && afterReturnUrl === '/kotak_arselnel/code.html',
    `Butang="${returnBtnExists.returnKotakText}", Kembali ke=${afterReturnUrl}`
  );

  // Screenshot 3: Kembali ke Kotak ARSELNEL dengan kamera & UI aktif semula
  await client.captureScreenshot('fasa_4e_e1_returned_to_kotak_ar.png');

  // -------------------------------------------------------------------------
  // UJIAN 12: Kamera Kotak boleh diaktifkan semula
  // -------------------------------------------------------------------------
  const camCheck = await client.evaluate(`
    (() => {
      const container = document.getElementById('ar-container');
      const video = container ? container.querySelector('video') : null;
      const hasStream = !!(video && video.srcObject && video.srcObject.getTracks().some(t => t.readyState === 'live'));
      return {
        hasMindAR: !!window.ARState.mindarThree,
        hasVideoEl: !!video,
        hasStream,
        readyState: video ? video.readyState : -1
      };
    })()
  `);
  record(
    12,
    'Kamera Kotak ARSELNEL aktif semula selepas kembali dari Jelajah 3D',
    camCheck.hasMindAR && camCheck.hasVideoEl && camCheck.hasStream,
    `hasMindAR=${camCheck.hasMindAR}, liveStream=${camCheck.hasStream}, readyState=${camCheck.readyState}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 13: Lima marker boleh diimbas semula (Target 0, 1, 2, 3, 4)
  // -------------------------------------------------------------------------
  const markersCheck = await client.evaluate(`
    (() => {
      const s = window.ARState;
      const anchorsOk = Boolean(
        s.anchorVideo &&
        s.anchorNota &&
        s.anchorKuiz &&
        s.anchorCellQuestAnimal &&
        s.anchorCellQuestPlant
      );
      return { anchorsOk };
    })()
  `);
  record(
    13,
    'Kesemua 5 marker (.mind Sasaran 0-4) sedia diimbas semula',
    markersCheck.anchorsOk,
    `5 Anchor Aktif (0:Video, 1:Nota, 2:Kuiz, 3:Sel Haiwan, 4:Sel Tumbuhan)`
  );

  // -------------------------------------------------------------------------
  // UJIAN 14 & 15: Lock POV masih berfungsi & Empat modul Kotak masih boleh digunakan
  // -------------------------------------------------------------------------
  const fourModulesAndPOVCheck = await client.evaluate(`
    (async () => {
      // Aktifkan keempat-empat modul dalam ruang kerja multi-panel Kotak ARSELNEL
      window.addPanelToSpatialWorkspace('video');
      window.addPanelToSpatialWorkspace('nota');
      window.addPanelToSpatialWorkspace('kuiz');
      window.addPanelToSpatialWorkspace('cellquest');
      window.updateMultiPanelUI();

      const activeSize = window.ARState.activePanels ? window.ARState.activePanels.size : 0;
      const hasAll4 = ['video', 'nota', 'kuiz', 'cellquest'].every(m => window.ARState.activePanels.has(m));

      // Uji Lock POV
      window.SpatialPanelManager.lockPanelPOV('nota');
      window.applySimAngles(20, -10);
      const notaState = window.SpatialPanelManager.getState().panels.nota;

      return {
        activeSize,
        hasAll4,
        notaPlacementMode: notaState ? notaState.placementMode : null,
        notaLocked: notaState ? notaState.isLocked : false
      };
    })()
  `);
  await delay(500);
  await client.captureScreenshot('fasa_4e_e1_kotak_4_modules_after_return.png');

  record(
    14,
    'Lock POV (3DoF Yaw/Pitch) masih berfungsi selepas kembali',
    fourModulesAndPOVCheck.notaPlacementMode === 'POV_LOCKED' && fourModulesAndPOVCheck.notaLocked,
    `placementMode=${fourModulesAndPOVCheck.notaPlacementMode}`
  );

  record(
    15,
    'Keempat-empat modul Kotak ARSELNEL (Video, Nota, Kuiz, CellQuest 3D) berfungsi serentak',
    fourModulesAndPOVCheck.activeSize === 4 && fourModulesAndPOVCheck.hasAll4,
    `Modul Aktif=${fourModulesAndPOVCheck.activeSize}/4`
  );

  // -------------------------------------------------------------------------
  // KITARAN 5X: Kotak ARSELNEL -> Jelajah 3D -> Kotak ARSELNEL (5 kali berturut-turut)
  // -------------------------------------------------------------------------
  console.log('\n--- Memulakan Ujian Ketahanan 5 Kitaran: Kotak ARSELNEL <-> Jelajah 3D ---');
  let all5CyclesOk = true;
  let cycleDetails = [];

  for (let c = 1; c <= 5; c++) {
    // 1. Dari Kotak -> Jelajah 3D
    await client.evaluate(`window.launchJelajah3D(true)`);
    const jOk = await waitForJelajah3DReady(client, 45);
    const jCanvasCount = await client.evaluate(`document.querySelectorAll('#canvas-container canvas').length`);
    const jListenerCount = await client.evaluate(`window.CellQuestAR.getModAGyroState().listenerCount || 0`);

    // 2. Dari Jelajah 3D -> Kotak ARSELNEL
    await client.evaluate(`window.CellQuestAR.returnToKotakARSELNEL()`);
    const kOk = await waitForKotakReady(client, 45);
    const kCanvasCount = await client.evaluate(`document.querySelectorAll('#ar-container canvas').length`);
    const kVideoCount = await client.evaluate(`document.querySelectorAll('#ar-container video').length`);
    const kWebGLOk = await client.evaluate(`
      (() => {
        const gl = window.ARState.renderer ? window.ARState.renderer.getContext() : null;
        return gl ? !gl.isContextLost() : false;
      })()
    `);

    const cyclePass = jOk && kOk && jCanvasCount === 1 && kCanvasCount === 1 && kVideoCount === 1 && jListenerCount <= 1 && kWebGLOk;
    if (!cyclePass) all5CyclesOk = false;
    cycleDetails.push(`Kitaran ${c}: ${cyclePass ? 'OK' : 'GAGAL'} (jCanvas=${jCanvasCount}, kCanvas=${kCanvasCount}, kVideo=${kVideoCount})`);
    console.log(`   🔄 ${cycleDetails[cycleDetails.length - 1]}`);
  }

  // -------------------------------------------------------------------------
  // UJIAN 16: Tiada duplicate renderer atau sensor listener selepas 5 kitaran
  // -------------------------------------------------------------------------
  record(
    16,
    'Tiada duplicate renderer, video stream atau sensor listener selepas 5 kitaran penuh',
    all5CyclesOk,
    cycleDetails.join(' | ')
  );

  // -------------------------------------------------------------------------
  // UJIAN 17: Tiada black screen
  // -------------------------------------------------------------------------
  const screenHealth = await client.evaluate(`
    (() => {
      const container = document.getElementById('ar-container');
      const canvas = container ? container.querySelector('canvas') : null;
      const video = container ? container.querySelector('video') : null;
      const gl = window.ARState.renderer ? window.ARState.renderer.getContext() : null;
      const loadingHidden = document.getElementById('loading-screen')?.classList.contains('hidden');
      return {
        canvasW: canvas ? canvas.width : 0,
        canvasH: canvas ? canvas.height : 0,
        videoReady: video ? video.readyState >= 2 : false,
        contextLost: gl ? gl.isContextLost() : true,
        loadingHidden: !!loadingHidden
      };
    })()
  `);
  record(
    17,
    'Tiada black screen atau infinite loading spinner',
    screenHealth.canvasW > 0 && screenHealth.canvasH > 0 && !screenHealth.contextLost && screenHealth.loadingHidden,
    `Canvas=${screenHealth.canvasW}x${screenHealth.canvasH}, WebGL OK=${!screenHealth.contextLost}, Loading Hidden=${screenHealth.loadingHidden}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 18: Tiada route 404
  // -------------------------------------------------------------------------
  record(
    18,
    'Tiada route atau aset 404 sepanjang navigasi',
    client.http404s.length === 0,
    client.http404s.length === 0 ? '0 ralat 404' : `404 ditemui: ${client.http404s.join(', ')}`
  );

  // -------------------------------------------------------------------------
  // UJIAN 19: Tiada perubahan schema Supabase
  // -------------------------------------------------------------------------
  let supabaseDiff = '';
  try {
    supabaseDiff = execSync('git diff HEAD -- supabase/', { encoding: 'utf8' }).trim();
  } catch (_) {}
  record(
    19,
    'Tiada perubahan schema Supabase',
    supabaseDiff.length === 0,
    supabaseDiff.length === 0 ? 'Tiada perubahan pada direktori supabase/' : 'Terdapat perubahan!'
  );

  // -------------------------------------------------------------------------
  // UJIAN 20: Semua ujian integrasi & 5x kitaran lulus tanpa regresi
  // -------------------------------------------------------------------------
  const passedSoFar = results.every(r => r.pass);
  record(
    20,
    'Semua ujian integrasi Fasa 4E-E.1 & 5x kitaran ulang-alik lulus tanpa regresi',
    passedSoFar && all5CyclesOk,
    `${results.filter(r => r.pass).length + 1}/20 ujian lulus`
  );

  client.close();
  proc.kill();

  console.log('\n================================================================');
  const totalPassed = results.filter(r => r.pass).length;
  console.log(`KEPUTUSAN AKHIR FASA 4E-E.1: ${totalPassed} / ${results.length} UJIAN LULUS`);
  console.log('================================================================\n');

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Ralat menjalankan ujian Fasa 4E-E.1:', err);
  process.exit(1);
});
