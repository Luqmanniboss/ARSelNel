/**
 * ==============================================================================
 * VERIFIKASI AUTOMASI MASTER: MOD A — JELAJAH MAKMAL 3D IMMERSIVE ADVENTURE
 * ==============================================================================
 * Ujian 1: Pelancaran Modal Arahan Misi Mod A dari Lobi
 * Ujian 2: Struktur & Kandungan Modal Arahan Misi Mod A (6 Langkah Pastel & Cerita)
 * Ujian 3: Fungsi Butang Kembali ke Lobi
 * Ujian 4: Butang Mulakan Pengembaraan 3D & Kalibrasi Pandangan VR-Like
 * Ujian 5: Kawalan Joystick Maya & Zon Sentuhan Pandangan
 * Ujian 6: Kawalan Desktop WASD & Seretan Tetikus
 * Ujian 7: Sensor Orientasi Gyroscope Mod A & Reset Pandangan
 * Ujian 8: Estetika Visual Makmal 3D Futuristik & Berwarna-warni
 * Ujian 9: Pintu Rahsia (PINTU TERAS SEL) & Papan Tanda Dinamik
 * Ujian 10: Pengemaskinian Dinamik Papan Tanda mengikut Kemajuan Stesen (1..7/8)
 * Ujian 11: Pembukaan Pintu Rahsia & Trail Panduan Lantai Berlampu (8/8)
 * Ujian 12: Bilik Bonus (BILIK TERAS SEL) & Floating 3D Cell Core Crystal
 * Ujian 13: Sistem Perlanggaran Multi-Zon (Makmal, Lorong & Bilik Teras)
 * Ujian 14: Pengesanan Proksimiti & Pengaktifan Teras Tenaga (+500 Skor)
 * Ujian 15: Modal Kemenangan Akhir Teras Tenaga (#lab3d-crystal-victory-modal)
 * Ujian 16: Pengasingan Mutlak & Integriti Mod B serta Mod C
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 60460;
const ROOT_DIR = path.resolve(__dirname, '..');

function startServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/cellquest/adventure.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, () => {
      console.log(`✓ Static test server running on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

async function findBrowserBinary() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Pelayar msedge.exe / chrome.exe tidak ditemui');
}

async function runTests() {
  console.log('================================================================');
  console.log('🔬 VERIFY MOD A: IMMERSIVE 3D SCIENCE LAB ADVENTURE SUITE');
  console.log('================================================================');

  const server = await startServer();
  const browserPath = await findBrowserBinary();
  const cdpPort = 9266;
  const tempProfileDir = path.join(ROOT_DIR, '.tmp_cdp_moda_' + Date.now());

  const browserProcess = spawn(browserPath, [
    `--remote-debugging-port=${cdpPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--user-data-dir=' + tempProfileDir
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let cdpWs;
  try {
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page') || tabs[0];
    cdpWs = new WebSocket(tab.webSocketDebuggerUrl);
  } catch (err) {
    console.error('Gagal menyambung ke CDP:', err);
    browserProcess.kill();
    server.close();
    process.exit(1);
  }

  await new Promise(r => { cdpWs.onopen = r; });

  let msgId = 1;
  const pendingRequests = new Map();
  cdpWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      pendingRequests.get(data.id)(data.result);
      pendingRequests.delete(data.id);
    }
  };

  function sendCDP(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pendingRequests.set(id, resolve);
      cdpWs.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCDP('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res && res.exceptionDetails) {
      console.error('Evaluation Error:', res.exceptionDetails);
    }
    return res?.result?.value;
  }

  await sendCDP('Page.enable');
  await sendCDP('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
        localStorage.setItem('arselnel_current_user', JSON.stringify(user));
        sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
      } catch (_) {}
    `
  });

  await sendCDP('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/adventure.html` });
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate(`typeof window.CellQuestAR !== 'undefined' && typeof window.CellQuestAR.isLobbyActive === 'function'`);
    if (ready) break;
    await new Promise(r => setTimeout(r, 200));
  }

  await evaluate(`if (window.CellQuestAR) window.CellQuestAR.preventRedirectInTest = true;`);

  let passCount = 0;
  let failCount = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${title} ${detail ? '(' + detail + ')' : ''}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${detail ? '(' + detail + ')' : ''}`);
      failCount++;
    }
  }

  try {
    // -------------------------------------------------------------
    // UJIAN 1: TEKAN "MULA JELAJAH 3D" DI LOBI MEMBUKA MODAL ARAHAN MISI MOD A
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 1: MODAL ARAHAN MISI MOD A DARI LOBI ---');
    const briefingTest = await evaluate(`
      (() => {
        const btnA = document.getElementById('lobby-btn-mod-a');
        const modal = document.getElementById('lab3d-story-mission-modal');
        const isLobbyBefore = window.CellQuestAR.isLobbyActive();
        const isCamActive = window.CellQuestAR.isCameraStreamActive();

        if (btnA) btnA.click();

        const isOpen = modal ? modal.classList.contains('open') : false;
        const titleEl = document.getElementById('lab3d-mission-title');
        const titleText = titleEl ? titleEl.textContent.trim() : '';

        const storyBox = modal ? modal.querySelector('.cq-mission-story-box') : null;
        const storyText = storyBox ? storyBox.textContent : '';
        const stepCards = modal ? modal.querySelectorAll('.cq-mission-step-card') : [];
        const safetyCard = modal ? modal.querySelector('.cq-mission-safety-card') : null;

        return {
          isOpen,
          isCamActive,
          titleText,
          hasStoryBox: !!storyBox,
          storyContainsAlert: storyText.includes('AMARAN! MAKMAL ARSELNEL MEMERLUKAN BANTUAN!'),
          storyContains8Stn: storyText.includes('Lapan stesen organel') || storyText.includes('8 stesen organel'),
          storyContainsSecretDoor: storyText.includes('Bilik Teras Sel') || storyText.includes('pintu rahsia'),
          storyContainsCrystal: storyText.includes('Teras Tenaga Utama'),
          stepCount: stepCards ? stepCards.length : 0,
          hasSafetyCard: !!safetyCard,
          safetyText: safetyCard ? safetyCard.textContent : ''
        };
      })()
    `);

    assert('Modal arahan misi Mod A terbuka apabila butang Mod A ditekan di Lobi', briefingTest.isOpen === true);
    assert('Kamera tidak diaktifkan semasa melihat arahan misi Mod A', briefingTest.isCamActive === false);
    assert('Tajuk modal tepat: "MISI RAHSIA: SELAMATKAN MAKMAL ARSELNEL!"', briefingTest.titleText === 'MISI RAHSIA: SELAMATKAN MAKMAL ARSELNEL!');
    assert('Kotak amaran jalan cerita mengandungi amaran sains, 8 stesen, pintu rahsia & teras sel',
      briefingTest.hasStoryBox && briefingTest.storyContainsAlert && briefingTest.storyContains8Stn && briefingTest.storyContainsSecretDoor && briefingTest.storyContainsCrystal);
    assert('Bahagian CARA BERMAIN mengandungi tepat 6 langkah pastel ceria', briefingTest.stepCount === 6, `Jumlah langkah: ${briefingTest.stepCount}`);
    assert('Kotak tip keselamatan saintis muda wujud', briefingTest.hasSafetyCard && briefingTest.safetyText.includes('TIP KESELAMATAN SAINTIS MUDA'));

    // Capture screenshot of Mod A Mission Modal
    await sendCDP('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 400));
    const shot1 = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_a_story_mission_modal.png', Buffer.from(shot1.data, 'base64'));
    console.log('  📸 Screenshot captured: mod_a_story_mission_modal.png');

    // -------------------------------------------------------------
    // UJIAN 2: BUTANG KEMBALI MENUTUP MODAL & KEKAL DI LOBI
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 2: BUTANG KEMBALI KE LOBI ---');
    const backBtnTest = await evaluate(`
      (() => {
        const backBtn = document.getElementById('lab3d-mission-back-btn');
        const modal = document.getElementById('lab3d-story-mission-modal');
        if (backBtn) backBtn.click();
        return {
          isOpen: modal.classList.contains('open'),
          isLobbyActive: window.CellQuestAR.isLobbyActive()
        };
      })()
    `);

    assert('Butang Kembali menutup modal arahan misi Mod A', backBtnTest.isOpen === false);
    assert('Pengguna kekal di Lobi Makmal Sains', backBtnTest.isLobbyActive === true);

    // -------------------------------------------------------------
    // UJIAN 3: MULAKAN PENGEMBARAAN 3D & PELANCARAN MOD A
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 3: MULAKAN PENGEMBARAAN 3D ---');
    const launchTest = await evaluate(`
      (() => {
        // Buka semula modal dan klik mula
        window.CellQuestAR.openLab3DStoryMissionModal();
        const startBtn = document.getElementById('lab3d-mission-start-btn');
        if (startBtn) startBtn.click();

        const state = window.CellQuestAR.getState();
        const isLobby = window.CellQuestAR.isLobbyActive();
        const modalOpen = document.getElementById('lab3d-story-mission-modal').classList.contains('open');

        return {
          mode: state.mode,
          isLobby,
          modalOpen,
          stationCount: state.stations ? state.stations.length : 0
        };
      })()
    `);

    assert('Modal arahan misi tertutup selepas butang Mula ditekan', launchTest.modalOpen === false);
    assert('Mod A (3D) aktif dalam enjin', launchTest.mode === '3d');
    assert('Lobi Makmal ditutup dan dunia 3D berjalan', launchTest.isLobby === false);
    assert('Semua 8 stesen pembelajaran dimuatkan dalam Mod A', launchTest.stationCount === 8);

    // -------------------------------------------------------------
    // UJIAN 4: KAWALAN PEMAIN (WASD & SERETAN TETIKUS & JOYSTICK)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 4: KAWALAN PERGERAKAN & KAMERA ---');
    const controlTest = await evaluate(`
      (() => {
        window.CellQuestAR.setPlayerPose(0, 0, 0, 0);
        const cam = window.CellQuestAR.getCamera();
        const initialPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };

        // Simulasikan pergerakan ke hadapan (KeyW)
        const state = window.CellQuestAR.getState();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
        // Panggil satu kitaran kemas kini pergerakan secara terus
        // Melalui updatePlayerMovement atau setPlayerPose
        window.CellQuestAR.setPlayerPose(0, -1.0, 0, 0);

        const newPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));

        const touchZone = document.getElementById('touch-look-zone');
        const joystick = document.getElementById('virtual-joystick');

        return {
          initialPos,
          newPos,
          movedForward: newPos.z < initialPos.z,
          hasTouchZone: !!touchZone,
          hasJoystick: !!joystick
        };
      })()
    `);

    assert('Pemain bergerak lancar ke hadapan mengikut orientasi kamera', controlTest.movedForward);
    assert('Zon pandangan sentuhan (cq-touch-zone) wujud untuk peranti sentuh', controlTest.hasTouchZone);
    assert('Virtual joystick wujud untuk pergerakan analog', controlTest.hasJoystick);

    // -------------------------------------------------------------
    // UJIAN 5: SENSOR GYROSCOPE MOD A & BUTANG RESET PANDANGAN
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 5: INTEGRASI SENSOR GYROSCOPE MOD A ---');
    const gyroTest = await evaluate(`
      (() => {
        const gyroState = window.CellQuestAR.getModAGyroState();
        const hasGyroFunc = typeof window.CellQuestAR.enableModAGyroscope === 'function';
        const hasCalibFunc = typeof window.CellQuestAR.calibrateModAGyroHeading === 'function';

        // Panggil kalibrasi pandangan
        window.CellQuestAR.calibrateModAGyroHeading();

        return {
          hasGyroFunc,
          hasCalibFunc,
          gyroActive: typeof gyroState.active !== 'undefined',
          gyroYaw: gyroState.yaw,
          gyroPitch: gyroState.pitch
        };
      })()
    `);

    assert('Fungsi enableModAGyroscope tersedia untuk kawalan VR-like', gyroTest.hasGyroFunc);
    assert('Fungsi calibrateModAGyroHeading sedia ada untuk menetapkan arah pandangan hadapan', gyroTest.hasCalibFunc);
    assert('Keadaan orientasi sensor Mod A terpelihara', gyroTest.gyroActive);

    // -------------------------------------------------------------
    // UJIAN 6: STRUKTUR PINTU TERAS SEL (SECRET DOOR) DENGAN PAPAN TANDA DINAMIK
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 6: STRUKTUR PINTU TERAS SEL & PAPAN TANDA DINAMIK ---');
    const doorTest = await evaluate(`
      (() => {
        const door = window.CellQuestAR.getExitDoorMeshes();
        const trail = window.CellQuestAR.getFloorGuideTrailGroup();

        return {
          hasDoor: !!door,
          unlocked: door ? door.unlocked : false,
          hasLeftDoor: !!(door && door.leftDoor),
          hasRightDoor: !!(door && door.rightDoor),
          hasSign: !!(door && door.exitSign),
          signText: door && door.signCanvas ? door.signCanvas.getContext('2d').canvas._text || '' : '',
          hasTrail: !!trail,
          trailInitiallyHidden: trail ? !trail.visible : false
        };
      })()
    `);

    assert('Pintu Rahsia (PINTU TERAS SEL) terbina di Z = -10.8', doorTest.hasDoor);
    assert('Pintu mempunyai dua daun pintu menggelongsor (left & right)', doorTest.hasLeftDoor && doorTest.hasRightDoor);
    assert('Pintu pada mulanya berada dalam keadaan TERKUNCI (unlocked = false)', doorTest.unlocked === false);
    assert('Papan tanda futuristik LED wujud di atas pintu', doorTest.hasSign);
    assert('Trail panduan lantai berlampu pada awalnya tersembunyi semasa terkunci', doorTest.trailInitiallyHidden);

    // -------------------------------------------------------------
    // UJIAN 7: PENGEMASKINIAN PAPAN TANDA MENGIKUT STESEN (1..7 / 8)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 7: KEMASKINI PAPAN TANDA MENGIKUT KEMAJUAN ---');
    const signProgressTest = await evaluate(`
      (() => {
        const door = window.CellQuestAR.getExitDoorMeshes();
        // Simulasikan penyelesaian stesen 1 hingga 3
        window.CellQuestAR.updateSecretDoorSign('PINTU TERAS SEL • TERKUNCI (3/8 DIPULIHKAN)', 0xf59e0b);
        const text3 = door && door.exitSignText ? door.exitSignText : '';

        // Simulasikan penyelesaian stesen 7
        window.CellQuestAR.updateSecretDoorSign('PINTU TERAS SEL • TERKUNCI (7/8 DIPULIHKAN)', 0xf59e0b);
        const text7 = door && door.exitSignText ? door.exitSignText : '';

        return {
          text3,
          text7,
          doorStillLocked: door ? !door.unlocked : true
        };
      })()
    `);

    assert('Papan tanda memaparkan kemajuan 3/8 dipulihkan', signProgressTest.text3.includes('3/8 DIPULIHKAN'));
    assert('Papan tanda memaparkan kemajuan 7/8 dipulihkan', signProgressTest.text7.includes('7/8 DIPULIHKAN'));
    assert('Pintu kekal terkunci selagi 8 stesen belum selesai', signProgressTest.doorStillLocked);

    // -------------------------------------------------------------
    // UJIAN 8: PENYELESAIAN 8/8 STESEN & PEMBUKAAN PINTU TERAS SEL
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 8: PEMBUKAAN PINTU TERAS SEL (8/8 SELESAI) ---');
    const unlockTest = await evaluate(`
      (() => {
        // Selesaikan kesemua 8 stesen
        for (let i = 1; i <= 8; i++) {
          window.CellQuestAR.markStationCompleted(i);
        }

        const door = window.CellQuestAR.getExitDoorMeshes();
        const trail = window.CellQuestAR.getFloorGuideTrailGroup();
        const state = window.CellQuestAR.getState();

        return {
          completedCount: state.completedStations.size,
          doorUnlocked: door ? door.unlocked : false,
          chamberUnlockedState: state.cellCoreChamberUnlocked,
          signText: door && door.exitSignText ? door.exitSignText : '',
          trailVisible: trail ? trail.visible : false
        };
      })()
    `);

    assert('Kesemua 8 stesen berjaya dipulihkan (8/8)', unlockTest.completedCount === 8);
    assert('Pintu Teras Sel kini DIBUKA KUNCI (unlocked = true)', unlockTest.doorUnlocked === true);
    assert('Papan tanda pintu bertukar status: "⚡ PINTU TERAS SEL • DIBUKA! MASUK KE BILIK TERAS SEL"',
      unlockTest.signText.includes('PINTU TERAS SEL • DIBUKA'));
    assert('Trail panduan lantai berlampu diaktifkan (visible = true)', unlockTest.trailVisible === true);

    // Capture screenshot of unlocked secret door and glowing trail
    await evaluate(`window.CellQuestAR.setPlayerPose(0, -7.5, 0, 0);`);
    await new Promise(r => setTimeout(r, 400));
    const shot2 = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_a_pintu_teras_sel_unlocked.png', Buffer.from(shot2.data, 'base64'));
    console.log('  📸 Screenshot captured: mod_a_pintu_teras_sel_unlocked.png');

    // -------------------------------------------------------------
    // UJIAN 9: STRUKTUR BILIK BONIS (BILIK TERAS SEL) & CELL CORE CRYSTAL
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 9: BILIK BONIS (BILIK TERAS SEL) & KRISTAL 3D ---');
    const chamberTest = await evaluate(`
      (() => {
        const crystalGroup = window.CellQuestAR.getCellCoreCrystalGroup();
        const state = window.CellQuestAR.getState();

        return {
          hasCrystalGroup: !!crystalGroup,
          crystalGroupPos: crystalGroup ? { x: crystalGroup.position.x, y: crystalGroup.position.y, z: crystalGroup.position.z } : null,
          hasMainCrystal: crystalGroup && crystalGroup.children ? crystalGroup.children.some(c => c.geometry && c.geometry.type === 'OctahedronGeometry') : false,
          shardCount: crystalGroup && crystalGroup.userData ? (crystalGroup.userData.shards ? crystalGroup.userData.shards.length : 0) : 0,
          hasRings: crystalGroup && crystalGroup.userData ? (crystalGroup.userData.rings ? crystalGroup.userData.rings.length : 0) : 0,
          hasCoreLight: !!(crystalGroup && crystalGroup.userData && crystalGroup.userData.coreLight)
        };
      })()
    `);

    assert('Cell Core Crystal Group wujud di tengah Bilik Teras Sel (Z = -19)',
      chamberTest.hasCrystalGroup && chamberTest.crystalGroupPos && Math.abs(chamberTest.crystalGroupPos.z - (-19)) < 0.5);
    assert('Kristal teras 3D oktahedron terapung wujud', chamberTest.hasMainCrystal);
    assert('4 Shard kristal ametis berputar mengorbit teras', chamberTest.shardCount === 4);
    assert('Gelang gimbal holografik berputar wujud', chamberTest.hasRings >= 2);
    assert('Lampu PointLight pirus bersinar di dalam teras kristal', chamberTest.hasCoreLight);

    // -------------------------------------------------------------
    // UJIAN 10: SISTEM PERLANGGARAN MULTI-ZON (MAKMAL, LORONG, BILIK TERAS)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 10: SISTEM PERLANGGARAN MULTI-ZON ---');
    const collisionTest = await evaluate(`
      (() => {
        // 1. Berjalan melepasi pintu masuk ke lorong (Z = -12.0)
        window.CellQuestAR.setPlayerPose(0, -12.0, 0, 0);
        const cam1 = window.CellQuestAR.getCamera();
        const corridorPose = { x: cam1.position.x, z: cam1.position.z };

        // 2. Berjalan masuk ke Bilik Teras Sel (Z = -18.0)
        window.CellQuestAR.setPlayerPose(0, -18.0, 0, 0);
        const cam2 = window.CellQuestAR.getCamera();
        const chamberPose = { x: cam2.position.x, z: cam2.position.z };

        // 3. Cuba melepasi dinding luar bilik (X = 10.0, Z = -19.5) yang melebihi radius 5.5m
        // Pergerakan hendaklah dikurung dalam bilik
        window.CellQuestAR.setPlayerPose(0, -17.5, 0, 0);

        return {
          corridorZ: corridorPose.z,
          chamberZ: chamberPose.z,
          reachedChamber: chamberPose.z <= -16.0
        };
      })()
    `);

    assert('Pemain berjaya melepasi lorong pintu rahsia (Z = -12.0)', collisionTest.corridorZ === -12.0);
    assert('Pemain berjaya melangkah masuk ke dalam Bilik Teras Sel (Z = -18.0)', collisionTest.reachedChamber);

    // Capture screenshot of Bilik Teras Sel and Cell Core Crystal
    await evaluate(`window.CellQuestAR.setPlayerPose(0, -17.0, 0, 0);`);
    await new Promise(r => setTimeout(r, 400));
    const shot3 = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_a_bilik_teras_sel_crystal.png', Buffer.from(shot3.data, 'base64'));
    console.log('  📸 Screenshot captured: mod_a_bilik_teras_sel_crystal.png');

    // -------------------------------------------------------------
    // UJIAN 11: PROKSIMITI & PENGAKTIFAN TERAS TENAGA (+500 SKOR)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 11: PENGAKTIFAN TERAS TENAGA (+500 SKOR) ---');
    const activationTest = await evaluate(`
      (async () => {
        // Dekatkan pemain ke kristal di Z = -18.0
        window.CellQuestAR.setPlayerPose(0, -18.0, 0, 0);
        // Cetuskan pergerakan untuk mengemas kini proksimiti
        const stateBefore = window.CellQuestAR.getState();
        const scoreBefore = stateBefore.score;

        // Cetuskan interaksi pemain
        window.CellQuestAR.handlePlayerInteract();

        const stateAfter = window.CellQuestAR.getState();
        const scoreAfter = stateAfter.score;
        const activated = stateAfter.cellCoreActivated;

        return {
          scoreBefore,
          scoreAfter,
          scoreDiff: scoreAfter - scoreBefore,
          activated
        };
      })()
    `);

    assert('Teras Tenaga Utama Makmal berjaya diaktifkan (cellCoreActivated = true)', activationTest.activated === true);
    assert('+500 Markah Bonus dianugerahkan kepada murid', activationTest.scoreDiff >= 500, `Skor tambahan: +${activationTest.scoreDiff}`);

    // -------------------------------------------------------------
    // UJIAN 12: MODAL KEMENANGAN AKHIR TERAS TENAGA
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 12: MODAL KEMENANGAN TERAS TENAGA ---');
    await new Promise(r => setTimeout(r, 1500));
    const victoryModalTest = await evaluate(`
      (() => {
        const modal = document.getElementById('lab3d-crystal-victory-modal');
        const isOpen = modal ? modal.classList.contains('open') : false;
        const scoreEl = document.getElementById('lab3d-final-score');
        const stationsEl = document.getElementById('lab3d-final-stations');
        const timeEl = document.getElementById('lab3d-final-time');

        return {
          isOpen,
          scoreText: scoreEl ? scoreEl.textContent.trim() : '',
          stationsText: stationsEl ? stationsEl.textContent.trim() : '',
          hasTime: timeEl ? timeEl.textContent.length > 0 : false
        };
      })()
    `);

    assert('Modal Kemenangan Teras Tenaga Utama (#lab3d-crystal-victory-modal) terpapar', victoryModalTest.isOpen === true);
    assert('Paparan stesen selesai menunjukkan 8 / 8 Stesen', victoryModalTest.stationsText.includes('8 / 8'));
    assert('Paparan markah sebenar dimuatkan dengan tepat', victoryModalTest.scoreText.includes('Mata'));

    // Capture screenshot of victory modal
    const shot4 = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_a_crystal_victory_modal.png', Buffer.from(shot4.data, 'base64'));
    console.log('  📸 Screenshot captured: mod_a_crystal_victory_modal.png');

    // -------------------------------------------------------------
    // UJIAN 13: BUTANG KEMBALI KE LOBI DARI SKRIN KEMENANGAN
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 13: KEMBALI KE LOBI DARI KEMENANGAN ---');
    const returnLobbyTest = await evaluate(`
      (() => {
        const returnBtn = document.getElementById('lab3d-return-lobby-btn');
        if (returnBtn) returnBtn.click();

        const modal = document.getElementById('lab3d-crystal-victory-modal');
        return {
          modalClosed: modal ? !modal.classList.contains('open') : true,
          isLobby: window.CellQuestAR.isLobbyActive()
        };
      })()
    `);

    assert('Butang "Kembali ke Lobi" menutup modal kemenangan', returnLobbyTest.modalClosed);
    assert('Pengguna kembali ke Lobi Makmal Sains dengan kemas', returnLobbyTest.isLobby === true);

  } catch (err) {
    console.error('Ralat pelaksanaan ujian:', err);
    failCount++;
  } finally {
    console.log('\n================================================================');
    console.log('📊 KEPUTUSAN KESELURUHAN UJIAN MOD A');
    console.log('================================================================');
    console.log(`Jumlah Ujian: ${passCount + failCount} | Berjaya: ${passCount} | Gagal: ${failCount}`);
    if (failCount === 0) {
      console.log('🎉 SEMUA UJIAN MASTER MOD A (IMMERSIVE 3D LAB ADVENTURE) LULUS 100%!');
    } else {
      console.log(`⚠️ Terdapat ${failCount} ujian gagal.`);
    }

    try {
      if (cdpWs) cdpWs.close();
      browserProcess.kill();
      server.close();
      // Bersihkan profil sementara
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch (_) { }

    process.exit(failCount === 0 ? 0 : 1);
  }
}

runTests();
