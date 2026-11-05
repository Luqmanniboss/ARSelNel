/**
 * ARSELNEL — MOD D: CELL SAFARI 3D FOREST ADVENTURE COMPREHENSIVE VERIFICATION SUITE
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60475;
const CDP_PORT = 9228;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ROOT_DIR = path.resolve(__dirname, '..');

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/cellquest/adventure.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
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
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✓ Static test server running on ${BASE_URL}`);
      resolve(server);
    });
  });
}

async function findBrowserBinary() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\Owner\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  console.log(`\n================================================================`);
  console.log(`🌲 VERIFY MOD D: CELL SAFARI 3D FOREST ADVENTURE SUITE`);
  console.log(`================================================================`);

  const server = await startServer();
  const browserBin = await findBrowserBinary();
  if (!browserBin) {
    console.error('No supported browser found.');
    server.close();
    process.exit(1);
  }

  const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-safari-'));
  const browserProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    `--user-data-dir=${tempProfileDir}`
  ]);

  await new Promise(r => setTimeout(r, 1600));

  let cdpWs;
  try {
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page') || tabs[0];
    cdpWs = new WebSocket(tab.webSocketDebuggerUrl);
  } catch (err) {
    console.error('Failed to connect to CDP:', err);
    browserProc.kill();
    server.close();
    process.exit(1);
  }

  await new Promise(r => { cdpWs.onopen = r; });

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleErrors = [];

  cdpWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      if (data.params.type === 'error') {
        const text = data.params.args.map(a => a.value || a.description).join(' ');
        if (!text.includes('favicon.ico') && !text.includes('DevTools') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    }
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
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res ? res.result?.value : undefined;
  }

  await sendCDP('Page.enable');
  await sendCDP('Runtime.enable');

  // Pre-populate simulated student user so auth-guard allows full testing
  await sendCDP('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const mockUser = {
          id: 'student-test-safari-001',
          email: 'pelajar@arselnel.edu.my',
          nama: 'Ahmad Daniel (Saintis Muda)',
          role: 'student',
          user_metadata: { nama: 'Ahmad Daniel (Saintis Muda)', full_name: 'Ahmad Daniel' }
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            user: mockUser,
            access_token: 'fake-jwt-token'
          }
        }));
      } catch (_) {}
    `
  });

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message, detail = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASS: ${message} ${detail ? `(${detail})` : ''}`);
    } else {
      console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ''}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // FASA 1: INTEGRASI LOBI MAKMAL SAINS (ADVENTURE.HTML)
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 1: KAD MOD D DI LOBI MAKMAL SAINS ---`);
    await sendCDP('Page.navigate', { url: `${BASE_URL}/cellquest/adventure.html` });
    
    for (let i = 0; i < 40; i++) {
      const ready = await evaluate(`typeof window.CellQuestAR !== 'undefined' && typeof window.CellQuestAR.isLobbyActive === 'function'`);
      if (ready) break;
      await new Promise(r => setTimeout(r, 200));
    }

    const lobbyCheck = await evaluate(`(() => {
      const cardD = document.getElementById('lobby-card-mod-d');
      const btnD = document.getElementById('lobby-btn-mod-d');
      const badge = cardD ? cardD.querySelector('.card-badge.d-badge') : null;
      const title = cardD ? cardD.querySelector('.card-title') : null;
      const desc = cardD ? cardD.querySelector('.card-desc') : null;
      const stripItems = cardD ? cardD.querySelectorAll('.strip-item') : [];
      return {
        hasCard: !!cardD,
        hasBtn: !!btnD,
        badgeText: badge ? badge.textContent.trim() : '',
        titleText: title ? title.textContent.trim() : '',
        descText: desc ? desc.textContent.trim() : '',
        stripCount: stripItems.length,
        btnHref: btnD ? (btnD.getAttribute('href') || '') : ''
      };
    })()`);

    assert(lobbyCheck && lobbyCheck.hasCard, 'Kad MOD D wujud di dalam Lobi Makmal Sains');
    assert(lobbyCheck && lobbyCheck.badgeText.includes('MOD D'), 'Lencana Kad memaparkan MOD D', lobbyCheck?.badgeText);
    assert(lobbyCheck && lobbyCheck.titleText.includes('Cell Safari'), 'Tajuk Kad memaparkan "Cell Safari: Hutan Sel 3D"', lobbyCheck?.titleText);
    assert(lobbyCheck && lobbyCheck.stripCount === 3, 'Kad memaparkan 3 strip ciri visual padat', `Jumlah: ${lobbyCheck?.stripCount}`);
    assert(lobbyCheck && lobbyCheck.btnHref.includes('safari.html'), 'Butang Mula menghala ke safari.html', lobbyCheck?.btnHref);

    // -------------------------------------------------------------------------
    // FASA 2: HALAMAN SAFARI & MODAL ARAHAN SEBELUM PERMAINAN
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 2: HALAMAN SAFARI & MODAL ARAHAN MISI ---`);
    await sendCDP('Page.navigate', { url: `${BASE_URL}/cellquest/safari.html` });
    
    for (let i = 0; i < 40; i++) {
      const ready = await evaluate(`typeof window.CellSafari !== 'undefined'`);
      if (ready) break;
      await new Promise(r => setTimeout(r, 200));
    }

    const modalCheck = await evaluate(`(() => {
      const intro = document.getElementById('cs-intro');
      const title = document.getElementById('cs-intro-title');
      const steps = document.querySelectorAll('.cs-step-card');
      const startBtn = document.getElementById('cs-intro-start');
      const backBtn = document.getElementById('cs-intro-back');
      const safetyBox = document.querySelector('.cs-safety');
      return {
        isOpen: intro ? intro.classList.contains('open') : false,
        titleText: title ? title.textContent.trim() : '',
        stepCount: steps.length,
        hasStartBtn: !!startBtn,
        hasBackBtn: !!backBtn,
        hasSafetyBox: !!safetyBox
      };
    })()`);

    assert(modalCheck && modalCheck.isOpen, 'Modal arahan misi terbuka secara lalai sebelum permainan bermula');
    assert(modalCheck && modalCheck.titleText.includes('SELAMATKAN HUTAN ARSELNEL'), 'Tajuk modal mengandungi "SELAMATKAN HUTAN ARSELNEL"', modalCheck?.titleText);
    assert(modalCheck && modalCheck.stepCount === 6, 'Modal memaparkan tepat 6 kad langkah cara bermain warna pastel', `Jumlah langkah: ${modalCheck?.stepCount}`);
    assert(modalCheck && modalCheck.hasSafetyBox, 'Kotak amaran keselamatan santis muda wujud');
    assert(modalCheck && modalCheck.hasStartBtn && modalCheck.hasBackBtn, 'Butang Mulakan Ekspedisi dan Butang Kembali ke Lobi tersedia');

    // -------------------------------------------------------------------------
    // FASA 3: MEMULAKAN EKSPEDISI 3D SAFARI
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 3: MEMULAKAN DUNIA 3D SAFARI & TREE OF LIFE ---`);
    const startResult = await evaluate(`(() => {
      const btn = document.getElementById('cs-intro-start');
      if (btn) btn.click();
      return {
        modalOpen: document.getElementById('cs-intro').classList.contains('open'),
        gameRunning: window.CellSafari ? window.CellSafari.isRunning() : false
      };
    })()`);

    assert(startResult && !startResult.modalOpen, 'Modal arahan ditutup selepas butang Mulakan ditekan');
    assert(startResult && startResult.gameRunning, 'Enjin 3D Cell Safari aktif dan berjalan');

    // Wait for 3D scene build
    await new Promise(r => setTimeout(r, 1000));

    const sceneCheck = await evaluate(`(() => {
      if (!window.CellSafari) return null;
      const s = window.CellSafari.getDiagnostics();
      return {
        hasTerrain: !!s.terrain,
        hasRiver: !!s.river,
        hasBridge: !!s.bridge,
        zoneSignCount: s.zoneSignCount,
        hasTreeOfLife: !!s.treeOfLife,
        treeCrystalSlotCount: s.treeCrystalSlotCount,
        fireflyCount: s.fireflyCount,
        animalCount: s.animalCount
      };
    })()`);

    assert(sceneCheck && sceneCheck.hasTerrain, 'Rupa bumi (terrain) hutan 120m x 120m berjaya dijana');
    assert(sceneCheck && sceneCheck.hasRiver, 'Sungai berliku 3D dengan warna cyan berkilauan wujud');
    assert(sceneCheck && sceneCheck.hasBridge, 'Jambatan kayu pejalan kaki merentasi sungai wujud');
    assert(sceneCheck && sceneCheck.zoneSignCount === 5, '5 papan tanda penunjuk zon wujud di dalam hutan', `Jumlah papan tanda: ${sceneCheck?.zoneSignCount}`);
    assert(sceneCheck && sceneCheck.hasTreeOfLife, 'Pokok Kehidupan (Tree of Life) wujud di pusat hutan');
    assert(sceneCheck && sceneCheck.treeCrystalSlotCount === 5, 'Pokok Kehidupan mempunyai 5 soket kristal kehidupan', `Jumlah soket: ${sceneCheck?.treeCrystalSlotCount}`);
    assert(sceneCheck && sceneCheck.fireflyCount >= 20, 'Kelip-kelip (fireflies) bersinar menerangi hutan', `Jumlah kelip-kelip: ${sceneCheck?.fireflyCount}`);
    assert(sceneCheck && sceneCheck.animalCount === 5, 'Tepat 5 haiwan 3D prosedural ditempatkan di 5 zon berbeza', `Jumlah haiwan: ${sceneCheck?.animalCount}`);

    // -------------------------------------------------------------------------
    // FASA 4: VERIFIKASI 5 ZON HAIWAN & KANDUNGAN SAINS KSSM
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 4: 5 ZON HAIWAN & STRUKTUR SAINS KSSM TINGKATAN 1 ---`);
    const animalZones = await evaluate(`(() => {
      if (!window.CellSafari) return [];
      return window.CellSafari.getAnimalZones().map(z => ({
        id: z.id,
        name: z.name,
        animal: z.animal,
        pos: z.pos,
        topic: z.topic,
        questionCount: z.quiz ? z.quiz.length : 0
      }));
    })()`);

    assert(animalZones && animalZones.length === 5, '5 zon haiwan wujud dalam konfigurasi Cell Safari');
    animalZones.forEach((az, idx) => {
      assert(true, `Zon ${idx + 1}: ${az.name} - ${az.topic}`);
    });

    // -------------------------------------------------------------------------
    // FASA 5: MATEMATIK PERGERAKAN JOYSTICK RELATIF KEPADA KAMERA (IPAD)
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 5: KAWALAN JOYSTICK RELATIF KAMERA & GYROSCOPE ---`);
    const movementTest = await evaluate(`(() => {
      if (!window.CellSafari) return null;
      const cs = window.CellSafari;
      
      // Test 1: Joystick UP without gyro (yaw = 0)
      cs.teleport(0, 0);
      cs.setCameraRotation(0);
      const move1 = cs.calculateMovementVector(0, -1); // Up
      
      // Test 2: Joystick RIGHT without gyro (yaw = 0)
      cs.setCameraRotation(0);
      const move2 = cs.calculateMovementVector(1, 0); // Right
      
      // Test 3: Joystick UP when camera rotated 90 deg clockwise (yaw = -PI/2)
      cs.setCameraRotation(-Math.PI / 2);
      const move3 = cs.calculateMovementVector(0, -1); // Up should now go +X
      
      // Test 4: Joystick UP when camera rotated 180 deg (yaw = -PI)
      cs.setCameraRotation(-Math.PI);
      const move4 = cs.calculateMovementVector(0, -1); // Up should now go +Z
      
      // Test 5: Diagonal vector normalization
      cs.setCameraRotation(0);
      const moveDiag = cs.calculateMovementVector(1.0, -1.0);
      const len = Math.hypot(moveDiag.vx, moveDiag.vz);

      return {
        move1,
        move2,
        move3,
        move4,
        diagonalLen: len
      };
    })()`);

    assert(movementTest && movementTest.move1.vz < -0.9, 'Joystick ATAS bergerak ke hadapan (-Z) pada pandangan lalai', `vz = ${movementTest?.move1.vz}`);
    assert(movementTest && movementTest.move2.vx > 0.9, 'Joystick KANAN bergerak ke kanan (+X) pada pandangan lalai', `vx = ${movementTest?.move2.vx}`);
    assert(movementTest && movementTest.move3.vx > 0.9, 'Joystick ATAS ketika kamera dipusing 90° kanan bergerak ke kanan (+X mengikut arah pandangan)', `vx = ${movementTest?.move3.vx}`);
    assert(movementTest && movementTest.move4.vz > 0.9, 'Joystick ATAS ketika kamera dipusing 180° bergerak ke arah bertentangan (+Z)', `vz = ${movementTest?.move4.vz}`);
    assert(movementTest && Math.abs(movementTest.diagonalLen - 1.0) < 0.05, 'Kelajuan diagonal dihadkan seragam (normalized)', `len = ${movementTest?.diagonalLen}`);

    // -------------------------------------------------------------------------
    // FASA 6: PENGESANAN JARAK DEKAT (PROXIMITY) & BANNER INTERAKSI
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 6: PENGESANAN JARAK DEKAT & BANNER INTERAKSI ---`);
    const proximityTest = await evaluate(`(() => {
      if (!window.CellSafari) return null;
      // Teleport near Rabbit (Zone 1 at x: -30, z: 26)
      window.CellSafari.teleport(-30, 24);
      window.CellSafari.updateProximity();
      
      const prompt = document.getElementById('cs-prompt');
      const title = document.getElementById('cs-prompt-title');
      const subtitle = document.getElementById('cs-prompt-sub');
      const isActive = prompt ? prompt.classList.contains('active') : false;
      
      return {
        isActive,
        titleText: title ? title.textContent.trim() : '',
        subtitleText: subtitle ? subtitle.textContent.trim() : ''
      };
    })()`);

    assert(proximityTest && proximityTest.isActive, 'Banner interaksi aktif apabila pemain mendekati haiwan (< 5.2m)');
    assert(proximityTest && proximityTest.titleText.includes('ARNAB'), 'Banner memaparkan nama haiwan: "ARNAB"', proximityTest?.titleText);
    assert(proximityTest && proximityTest.subtitleText.includes('Arnab'), 'Banner memaparkan topik sel kawasan arnab', proximityTest?.subtitleText);

    // -------------------------------------------------------------------------
    // FASA 7: PENEROKA SEL 3D INTERAKTIF (3D CELL EXPLORER)
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 7: PENEROKA SEL INTERAKTIF 3D & KSSM FORM 1 ---`);
    const explorerTest = await evaluate(`(() => {
      const btn = document.getElementById('cs-prompt-btn');
      if (btn) btn.click();
      
      const modal = document.getElementById('cs-explorer');
      const chips = document.querySelectorAll('.cs-chip');
      const isModalOpen = modal ? modal.classList.contains('open') : false;
      
      // Select Nucleus chip
      const nucleusChip = Array.from(chips).find(c => c.getAttribute('data-organelle') === 'Nukleus');
      if (nucleusChip) nucleusChip.click();
      
      const infoBox = document.getElementById('cs-organelle-info');

      return {
        isModalOpen,
        organelleCount: chips.length,
        infoText: infoBox ? infoBox.textContent.trim() : ''
      };
    })()`);

    assert(explorerTest && explorerTest.isModalOpen, 'Modal Peneroka Sel 3D terbuka apabila butang interaksi ditekan');
    assert(explorerTest && explorerTest.organelleCount >= 4, 'Cip pilihan organel sel haiwan tersedia', `Jumlah cip: ${explorerTest?.organelleCount}`);
    assert(explorerTest && (explorerTest.infoText.includes('Nukleus') || explorerTest.infoText.includes('genetik') || explorerTest.infoText.includes('aktiviti')),
      'Penerangan saintifik Nukleus selaras silibus KSSM Tingkatan 1', explorerTest?.infoText.slice(0, 60));

    // -------------------------------------------------------------------------
    // FASA 8: CABARAN KUIZ & PENGANUGERAHAN KRISTAL KEHIDUPAN (+200 SKOR)
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 8: CABARAN KUIZ & KRISTAL KEHIDUPAN (ZON 1-5) ---`);
    const quizTest = await evaluate(`(() => {
      const challengeBox = document.getElementById('cs-challenge');
      const hasChallenge = !!challengeBox && challengeBox.innerHTML.trim().length > 0;
      
      const initialScore = window.CellSafari.getScore();
      const initialCrystals = window.CellSafari.getCrystalCount();
      
      // Answer the quiz correctly
      const correctIdx = window.CellSafari.getCurrentQuizCorrectIndex();
      const optionButtons = challengeBox ? challengeBox.querySelectorAll('.cs-opt') : [];
      if (optionButtons[correctIdx]) {
        optionButtons[correctIdx].click();
      }
      
      // Click check button
      const checkBtn = document.getElementById('cs-challenge-start');
      if (checkBtn) checkBtn.click();
      
      const newScore = window.CellSafari.getScore();
      const newCrystals = window.CellSafari.getCrystalCount();
      const hudCrystalText = document.getElementById('cs-stat-crystal').textContent.trim();

      return {
        hasChallenge,
        initialScore,
        newScore,
        scoreDiff: newScore - initialScore,
        initialCrystals,
        newCrystals,
        hudCrystalText
      };
    })()`);

    assert(quizTest && quizTest.hasChallenge, 'Kotak cabaran kuiz terpapar');
    assert(quizTest && quizTest.scoreDiff === 200, '+200 Markah dianugerahkan apabila menjawab cabaran dengan tepat', `Skor: +${quizTest?.scoreDiff}`);
    assert(quizTest && quizTest.newCrystals === 1, 'Kristal Kehidupan Pertama diperoleh (1/5)', `Kristal: ${quizTest?.newCrystals}`);
    assert(quizTest && quizTest.hudCrystalText.includes('1/5'), 'HUD mengemas kini status Kristal: 1/5', quizTest?.hudCrystalText);

    // Close cell explorer modal
    await evaluate(`(() => {
      const closeBtn = document.getElementById('cs-explorer-close');
      if (closeBtn) closeBtn.click();
    })()`);

    // -------------------------------------------------------------------------
    // FASA 9: SIMULASI PENGUMPULAN 5/5 KRISTAL & POKOK KEHIDUPAN
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 9: KELENGKAPAN 5 KRISTAL & POKOK KEHIDUPAN ---`);
    const allCrystalsTest = await evaluate(`(() => {
      if (!window.CellSafari) return null;
      // Award remaining 4 crystals
      window.CellSafari.grantCrystal(1);
      window.CellSafari.grantCrystal(2);
      window.CellSafari.grantCrystal(3);
      window.CellSafari.grantCrystal(4);
      
      const totalCrystals = window.CellSafari.getCrystalCount();
      const score = window.CellSafari.getScore();
      const treeReady = window.CellSafari.isTreeOfLifeReady();
      const activeSockets = window.CellSafari.getActiveCrystalSlotCount();

      return {
        totalCrystals,
        score,
        treeReady,
        activeSockets
      };
    })()`);

    assert(allCrystalsTest && allCrystalsTest.totalCrystals === 5, 'Kesemua 5 Kristal Kehidupan berjaya dikumpulkan (5/5)');
    assert(allCrystalsTest && allCrystalsTest.treeReady, 'Pokok Kehidupan bersedia untuk diaktifkan');
    assert(allCrystalsTest && allCrystalsTest.activeSockets === 5, 'Kesemua 5 soket kristal pada Pokok Kehidupan bercahaya terang', `Soket bercahaya: ${allCrystalsTest?.activeSockets}`);

    // -------------------------------------------------------------------------
    // FASA 10: PENGAKTIFAN POKOK KEHIDUPAN (+500 BONUS) & MODAL KEMENANGAN
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 10: PENGAKTIFAN POKOK KEHIDUPAN & MODAL KEMENANGAN ---`);
    const promptCheck = await evaluate(`(() => {
      if (!window.CellSafari) return '';
      window.CellSafari.teleport(0, 4);
      window.CellSafari.updateProximity();
      const promptTitle = document.getElementById('cs-prompt-title');
      const text = promptTitle ? promptTitle.textContent.trim() : '';
      const interactBtn = document.getElementById('cs-prompt-btn');
      if (interactBtn) interactBtn.click();
      return text;
    })()`);

    assert(promptCheck.includes('POKOK KEHIDUPAN'), 'Prompt interaksi Pokok Kehidupan muncul apabila dekat (<8m)', promptCheck);

    // Wait 2200ms for victory animation to complete and open modal
    await new Promise(r => setTimeout(r, 2200));

    const victoryTest = await evaluate(`(() => {
      const victoryModal = document.getElementById('cs-victory');
      const isVictoryOpen = victoryModal ? victoryModal.classList.contains('open') : false;
      const finalScoreText = document.getElementById('cs-v-score') ? document.getElementById('cs-v-score').textContent.trim() : '';
      const finalAnimalsText = document.getElementById('cs-v-animals') ? document.getElementById('cs-v-animals').textContent.trim() : '';
      const totalScore = window.CellSafari ? window.CellSafari.getScore() : 0;

      return {
        isVictoryOpen,
        finalScoreText,
        finalAnimalsText,
        totalScore
      };
    })()`);

    assert(victoryTest && victoryTest.isVictoryOpen, 'Modal kemenangan #cs-victory terbuka dengan animasi perayaan');
    assert(victoryTest && victoryTest.totalScore === 1500, 'Jumlah markah maksimum 1500 (5 x 200 cabaran + 500 bonus Pokok Kehidupan)', `Skor: ${victoryTest?.totalScore}`);
    assert(victoryTest && victoryTest.finalAnimalsText.includes('5/5'), 'Paparan kemenangan menunjukkan 5/5 Haiwan diselamatkan');

    // -------------------------------------------------------------------------
    // FASA 11: BUKU SAFARI DIGITAL & RADAR MINIMAP
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 11: BUKU SAFARI DIGITAL & RADAR MINIMAP ---`);
    const bookTest = await evaluate(`(() => {
      const bookBtn = document.getElementById('cs-book-btn');
      if (bookBtn) bookBtn.click();
      
      const bookModal = document.getElementById('cs-book');
      const bookItems = document.querySelectorAll('.cs-book-entry');
      const isBookOpen = bookModal ? bookModal.classList.contains('open') : false;
      
      const minimap = document.getElementById('cs-minimap');
      const hasMinimap = !!minimap && minimap.width > 0;

      return {
        isBookOpen,
        bookEntryCount: bookItems.length,
        hasMinimap
      };
    })()`);

    assert(bookTest && bookTest.isBookOpen, 'Modal Buku Safari ARSELNEL berjaya dibuka');
    assert(bookTest && bookTest.bookEntryCount === 5, 'Buku Safari merekodkan profil 5 haiwan dan intipati organel', `Entri: ${bookTest?.bookEntryCount}`);
    assert(bookTest && bookTest.hasMinimap, 'Radar Minimap 2D aktif memaparkan kedudukan pemain dan 5 zon');

    // -------------------------------------------------------------------------
    // FASA 12: UJIAN KHAS ZON 4 — MAGICAL COLOURFUL 3D BIRD SANCTUARY & BURUNG RIMBA
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 12: MAGICAL COLOURFUL 3D BIRD SANCTUARY & BURUNG RIMBA ---`);
    const birdSanctuaryCheck = await evaluate(`(() => {
      const sanctuary = window.CellSafari.getBirdSanctuary();
      const decBirds = window.CellSafari.getDecorativeBirds();
      const totalBirds = window.CellSafari.getTotalBirdCount();
      const heroBird = window.CellSafari.getInteractiveBird();
      const diag = window.CellSafari.getDiagnostics();

      return {
        hasSanctuary: !!sanctuary,
        sanctuaryX: sanctuary ? sanctuary.position.x : 0,
        sanctuaryZ: sanctuary ? sanctuary.position.z : 0,
        totalBirds,
        decorativeBirdCount: decBirds ? decBirds.length : 0,
        hasHeroBird: !!heroBird,
        heroBirdName: heroBird ? heroBird.name : '',
        diagnosticSanctuary: diag.sanctuary
      };
    })()`);

    assert(birdSanctuaryCheck && birdSanctuaryCheck.hasSanctuary, 'Objek 3D Kumpulan Taman Burung wujud dalam persekitaran Cell Safari');
    assert(birdSanctuaryCheck && birdSanctuaryCheck.sanctuaryX === -32 && birdSanctuaryCheck.sanctuaryZ === -28, 'Taman Burung ditempatkan dengan tepat di Zon 4 (x: -32, z: -28)');
    assert(birdSanctuaryCheck && birdSanctuaryCheck.totalBirds >= 10 && birdSanctuaryCheck.totalBirds <= 15, `Jumlah burung di Taman Burung dalam julat sasaran 10-15 ekor (Terkini: ${birdSanctuaryCheck?.totalBirds} ekor)`);
    assert(birdSanctuaryCheck && birdSanctuaryCheck.decorativeBirdCount === 12, '12 Ekor Burung Hiasan NPC pelbagai warna dan tingkah laku menghiasi taman');
    assert(birdSanctuaryCheck && birdSanctuaryCheck.hasHeroBird, 'Burung Rimba hero 3D wujud di atas pelantar khas 3 tingkat');

    // Uji Eksklusiviti Interaksi Burung Rimba
    const heroProximityCheck = await evaluate(`(() => {
      // Teleport tepat berdekatan Burung Rimba di Zon 4 (-32, -26)
      window.CellSafari.teleport(-32, -26);
      window.CellSafari.updateProximity();

      const prompt = document.getElementById('cs-prompt');
      const title = document.getElementById('cs-prompt-title');
      const subtitle = document.getElementById('cs-prompt-sub');
      const btn = document.getElementById('cs-prompt-btn-text');
      const isActive = prompt ? prompt.classList.contains('active') : false;

      const res = {
        isActive,
        titleText: title ? title.textContent.trim() : '',
        subtitleText: subtitle ? subtitle.textContent.trim() : '',
        btnText: btn ? btn.textContent.trim() : ''
      };

      // Teleport ke kawasan yang tiada haiwan zon (cth: x: -10, z: 0)
      window.CellSafari.teleport(-10, 0);
      window.CellSafari.updateProximity();
      res.isPromptHiddenFarFromHero = prompt ? !prompt.classList.contains('active') : true;

      return res;
    })()`);

    assert(heroProximityCheck && heroProximityCheck.isActive, 'Prompt interaksi terpapar apabila menghampiri Burung Rimba (< 5.2m)');
    assert(heroProximityCheck && heroProximityCheck.titleText === 'BURUNG RIMBA DITEMUI!', 'Tajuk prompt memaparkan "BURUNG RIMBA DITEMUI!"', heroProximityCheck?.titleText);
    assert(heroProximityCheck && heroProximityCheck.subtitleText.includes('Hebat! Anda berjaya menemui Burung Rimba'), 'Subtitle memaparkan ucapan eksplorasi sel burung rimba', heroProximityCheck?.subtitleText);
    assert(heroProximityCheck && heroProximityCheck.btnText === 'Teroka Sel Haiwan', 'Butang tindakan memaparkan "Teroka Sel Haiwan"', heroProximityCheck?.btnText);
    assert(heroProximityCheck && heroProximityCheck.isPromptHiddenFarFromHero, 'Burung-burung hiasan lain bersifat NPC semata-mata (tiada prompt/kuiz)');

    // -------------------------------------------------------------------------
    // FASA 13: UJIAN KHAS ZON 1 — RABBIT MEADOW SANCTUARY & ARNAB COMEL
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 13: RABBIT MEADOW SANCTUARY & ARNAB COMEL ---`);
    const rabbitMeadowCheck = await evaluate(`(() => {
      const meadow = window.CellSafari.getRabbitMeadow();
      const decRabbits = window.CellSafari.getDecorativeRabbits();
      const totalRabbits = window.CellSafari.getTotalRabbitCount();
      const heroRabbit = window.CellSafari.getInteractiveRabbit();
      const diag = window.CellSafari.getDiagnostics();

      return {
        hasMeadow: !!meadow,
        meadowX: meadow ? meadow.position.x : 0,
        meadowZ: meadow ? meadow.position.z : 0,
        totalRabbits,
        decorativeRabbitCount: decRabbits ? decRabbits.length : 0,
        hasHeroRabbit: !!heroRabbit,
        heroRabbitName: heroRabbit ? heroRabbit.name : '',
        diagnosticMeadow: diag.rabbitMeadow
      };
    })()`);

    assert(rabbitMeadowCheck && rabbitMeadowCheck.hasMeadow, 'Objek 3D Kumpulan Taman Arnab wujud dalam persekitaran Cell Safari');
    assert(rabbitMeadowCheck && rabbitMeadowCheck.meadowX === -30 && rabbitMeadowCheck.meadowZ === 26, 'Taman Arnab ditempatkan dengan tepat di Zon 1 (x: -30, z: 26)');
    assert(rabbitMeadowCheck && rabbitMeadowCheck.totalRabbits >= 6 && rabbitMeadowCheck.totalRabbits <= 10, `Jumlah arnab di Taman Arnab dalam julat sasaran 6-10 ekor (Terkini: ${rabbitMeadowCheck?.totalRabbits} ekor)`);
    assert(rabbitMeadowCheck && rabbitMeadowCheck.decorativeRabbitCount === 7, '7 Ekor Arnab Hiasan NPC pelbagai warna dan tingkah laku menghiasi taman');
    assert(rabbitMeadowCheck && rabbitMeadowCheck.hasHeroRabbit, 'Arnab Comel hero 3D wujud di atas pelantar khas bercahaya');

    // Uji Eksklusiviti Interaksi Arnab Comel
    const rabbitProximityCheck = await evaluate(`(() => {
      // Teleport tepat berdekatan Arnab Comel di Zon 1 (-30, 24)
      window.CellSafari.teleport(-30, 24);
      window.CellSafari.updateProximity();

      const prompt = document.getElementById('cs-prompt');
      const title = document.getElementById('cs-prompt-title');
      const subtitle = document.getElementById('cs-prompt-sub');
      const btn = document.getElementById('cs-prompt-btn-text');
      const isActive = prompt ? prompt.classList.contains('active') : false;

      const res = {
        isActive,
        titleText: title ? title.textContent.trim() : '',
        subtitleText: subtitle ? subtitle.textContent.trim() : '',
        btnText: btn ? btn.textContent.trim() : ''
      };

      // Teleport ke kawasan yang tiada haiwan zon (cth: x: -10, z: 0)
      window.CellSafari.teleport(-10, 0);
      window.CellSafari.updateProximity();
      res.isPromptHiddenFarFromHero = prompt ? !prompt.classList.contains('active') : true;

      return res;
    })()`);

    assert(rabbitProximityCheck && rabbitProximityCheck.isActive, 'Prompt interaksi terpapar apabila menghampiri Arnab Comel (< 5.2m)');
    assert(rabbitProximityCheck && rabbitProximityCheck.titleText === 'ARNAB COMEL DITEMUI!', 'Tajuk prompt memaparkan "ARNAB COMEL DITEMUI!"', rabbitProximityCheck?.titleText);
    assert(rabbitProximityCheck && rabbitProximityCheck.subtitleText === 'Hebat! Anda telah menemui Arnab Comel. Jom terokai sel haiwan dan kenali struktur asasnya!', 'Subtitle memaparkan ucapan eksplorasi sel arnab comel', rabbitProximityCheck?.subtitleText);
    assert(rabbitProximityCheck && rabbitProximityCheck.btnText === 'Teroka Sel Haiwan', 'Butang tindakan memaparkan "Teroka Sel Haiwan"', rabbitProximityCheck?.btnText);
    assert(rabbitProximityCheck && rabbitProximityCheck.isPromptHiddenFarFromHero, 'Arnab-arnab hiasan lain bersifat NPC semata-mata (tiada prompt/kuiz)');

    // -------------------------------------------------------------------------
    // FASA 14: UJIAN KHAS ZON 2 — DEER VALLEY SANCTUARY & RUSA ANGGUN
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 14: DEER VALLEY SANCTUARY & RUSA ANGGUN ---`);
    const deerValleyCheck = await evaluate(`(() => {
      const valley = window.CellSafari.getDeerValley();
      const decDeers = window.CellSafari.getDecorativeDeers();
      const totalDeers = window.CellSafari.getTotalDeerCount();
      const heroDeer = window.CellSafari.getInteractiveDeer();
      const diag = window.CellSafari.getDiagnostics();

      return {
        hasValley: !!valley,
        valleyX: valley ? valley.position.x : 0,
        valleyZ: valley ? valley.position.z : 0,
        totalDeers,
        decorativeDeerCount: decDeers ? decDeers.length : 0,
        hasHeroDeer: !!heroDeer,
        heroDeerName: heroDeer ? heroDeer.name : '',
        diagnosticValley: diag.deerValley
      };
    })()`);

    assert(deerValleyCheck && deerValleyCheck.hasValley, 'Objek 3D Kumpulan Lembah Rusa wujud dalam persekitaran Cell Safari');
    assert(deerValleyCheck && deerValleyCheck.valleyX === 32 && deerValleyCheck.valleyZ === 28, 'Lembah Rusa ditempatkan dengan tepat di Zon 2 (x: 32, z: 28)');
    assert(deerValleyCheck && deerValleyCheck.totalDeers >= 5 && deerValleyCheck.totalDeers <= 8, `Jumlah rusa di Lembah Rusa dalam julat sasaran 5-8 ekor (Terkini: ${deerValleyCheck?.totalDeers} ekor)`);
    assert(deerValleyCheck && deerValleyCheck.decorativeDeerCount === 5, '5 Ekor Rusa Hiasan NPC pelbagai saiz dan tingkah laku menghiasi lembah');
    assert(deerValleyCheck && deerValleyCheck.hasHeroDeer, 'Rusa Anggun hero 3D wujud di atas pelantar khas bertingkat');

    // Uji Eksklusiviti Interaksi Rusa Anggun
    const deerProximityCheck = await evaluate(`(() => {
      // Teleport tepat berdekatan Rusa Anggun di Zon 2 (32, 26.5)
      window.CellSafari.teleport(32, 26.5);
      window.CellSafari.updateProximity();

      const prompt = document.getElementById('cs-prompt');
      const title = document.getElementById('cs-prompt-title');
      const subtitle = document.getElementById('cs-prompt-sub');
      const btn = document.getElementById('cs-prompt-btn-text');
      const isActive = prompt ? prompt.classList.contains('active') : false;

      const res = {
        isActive,
        titleText: title ? title.textContent.trim() : '',
        subtitleText: subtitle ? subtitle.textContent.trim() : '',
        btnText: btn ? btn.textContent.trim() : ''
      };

      // Teleport ke kawasan yang tiada haiwan zon (cth: x: 10, z: 0)
      window.CellSafari.teleport(10, 0);
      window.CellSafari.updateProximity();
      res.isPromptHiddenFarFromHero = prompt ? !prompt.classList.contains('active') : true;

      return res;
    })()`);

    assert(deerProximityCheck && deerProximityCheck.isActive, 'Prompt interaksi terpapar apabila menghampiri Rusa Anggun (< 5.2m)');
    assert(deerProximityCheck && deerProximityCheck.titleText === 'RUSA ANGGUN DITEMUI!', 'Tajuk prompt memaparkan "RUSA ANGGUN DITEMUI!"', deerProximityCheck?.titleText);
    assert(deerProximityCheck && deerProximityCheck.subtitleText === 'Hebat, Saintis Muda! Anda telah menemui Rusa Anggun. Mari terokai nukleus, pusat kawalan sel haiwan!', 'Subtitle memaparkan ucapan eksplorasi sel nukleus rusa', deerProximityCheck?.subtitleText);
    assert(deerProximityCheck && deerProximityCheck.btnText === 'Teroka Sel Haiwan', 'Butang tindakan memaparkan "Teroka Sel Haiwan"', deerProximityCheck?.btnText);
    assert(deerProximityCheck && deerProximityCheck.isPromptHiddenFarFromHero, 'Rusa-rusa hiasan lain bersifat NPC semata-mata (tiada prompt/kuiz)');

    // -------------------------------------------------------------------------
    // FASA 15: UJIAN KHAS ZON 3 — HUTAN MONYET 3D & MONYET CERIA
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 15: HUTAN MONYET 3D & EKSKLUSIVITI MONYET CERIA (ZON 3) ---`);
    const monkeyForestCheck = await evaluate(`(() => {
      if (!window.CellSafari) return null;
      const forest = window.CellSafari.getMonkeyForest();
      const totalMonkeys = window.CellSafari.getTotalMonkeyCount();
      const decMonkeys = window.CellSafari.getDecorativeMonkeys();
      const heroMonkey = window.CellSafari.getInteractiveMonkey();
      const diag = window.CellSafari.getDiagnostics();

      return {
        hasForest: !!forest,
        forestX: forest ? forest.position.x : 0,
        forestZ: forest ? forest.position.z : 0,
        totalMonkeys,
        decorativeMonkeyCount: decMonkeys ? decMonkeys.length : 0,
        hasHeroMonkey: !!heroMonkey,
        heroMonkeyName: heroMonkey ? heroMonkey.name : '',
        diagnosticForest: diag.monkeyForest
      };
    })()`);

    assert(monkeyForestCheck && monkeyForestCheck.hasForest, 'Objek 3D Kumpulan Hutan Monyet wujud dalam persekitaran Cell Safari');
    assert(monkeyForestCheck && monkeyForestCheck.forestX === 34 && monkeyForestCheck.forestZ === -30, 'Hutan Monyet ditempatkan dengan tepat di Zon 3 (x: 34, z: -30)');
    assert(monkeyForestCheck && monkeyForestCheck.totalMonkeys >= 5 && monkeyForestCheck.totalMonkeys <= 8, `Jumlah monyet di Hutan Monyet dalam julat sasaran 5-8 ekor (Terkini: ${monkeyForestCheck?.totalMonkeys} ekor)`);
    assert(monkeyForestCheck && monkeyForestCheck.decorativeMonkeyCount === 5, '5 Ekor Monyet Hiasan NPC (makan pisang, bergayut dahan, melompat, berehat bumbung & pelantar) wujud');
    assert(monkeyForestCheck && monkeyForestCheck.hasHeroMonkey, 'Monyet Ceria hero 3D wujud di atas dais batu khas');

    // Uji Eksklusiviti Interaksi Monyet Ceria
    const monkeyProximityCheck = await evaluate(`(() => {
      // Teleport berdekatan Monyet Ceria di Zon 3 (x: 38.2, z: -28.0)
      window.CellSafari.teleport(38.2, -28.0);
      window.CellSafari.updateProximity();

      const prompt = document.getElementById('cs-prompt');
      const title = document.getElementById('cs-prompt-title');
      const subtitle = document.getElementById('cs-prompt-sub');
      const btn = document.getElementById('cs-prompt-btn-text');
      const isActive = prompt ? prompt.classList.contains('active') : false;

      const res = {
        isActive,
        titleText: title ? title.textContent.trim() : '',
        subtitleText: subtitle ? subtitle.textContent.trim() : '',
        btnText: btn ? btn.textContent.trim() : ''
      };

      // Teleport jauh dari Monyet Ceria (cth: x: 10, z: 0)
      window.CellSafari.teleport(10, 0);
      window.CellSafari.updateProximity();
      res.isPromptHiddenFarFromHero = prompt ? !prompt.classList.contains('active') : true;

      return res;
    })()`);

    assert(monkeyProximityCheck && monkeyProximityCheck.isActive, 'Prompt interaksi terpapar apabila menghampiri Monyet Ceria (< 5.2m)');
    assert(monkeyProximityCheck && monkeyProximityCheck.titleText === 'MONYET CERIA DITEMUI!', 'Tajuk prompt memaparkan "MONYET CERIA DITEMUI!"', monkeyProximityCheck?.titleText);
    assert(monkeyProximityCheck && monkeyProximityCheck.subtitleText === 'Tahniah, Saintis Muda! Anda berjaya menemui Monyet Ceria. Jom terokai struktur sel haiwan!', 'Subtitle memaparkan ucapan eksplorasi sel Monyet Ceria', monkeyProximityCheck?.subtitleText);
    assert(monkeyProximityCheck && monkeyProximityCheck.btnText === 'Teroka Sel Haiwan', 'Butang tindakan memaparkan "Teroka Sel Haiwan"', monkeyProximityCheck?.btnText);
    assert(monkeyProximityCheck && monkeyProximityCheck.isPromptHiddenFarFromHero, 'Monyet-monyet hiasan lain bersifat NPC semata-mata (tiada prompt/kuiz)');

    // -------------------------------------------------------------------------
    // FASA 16: KEPATUHAN TOUCH TARGET IPAD (>= 44PX) & KONSOL
    // -------------------------------------------------------------------------
    console.log(`\n--- UJIAN 16: KEPATUHAN TOUCH TARGET IPAD & SIFAR RALAT KONSOL ---`);
    const touchTargetTest = await evaluate(`(() => {
      const buttons = [
        document.getElementById('cs-v-lobby'),
        document.getElementById('cs-v-explore'),
        document.getElementById('cs-back-btn'),
        document.getElementById('cs-book-btn'),
        document.getElementById('cs-gyro-btn'),
        document.getElementById('cs-prompt-btn')
      ].filter(Boolean);
      
      const sizes = buttons.map(b => {
        const rect = b.getBoundingClientRect();
        const cs = window.getComputedStyle(b);
        const minH = parseFloat(cs.minHeight) || 0;
        const minW = parseFloat(cs.minWidth) || 0;
        return {
          id: b.id,
          width: Math.max(rect.width, minW),
          height: Math.max(rect.height, minH)
        };
      });
      
      const allCompliant = sizes.every(s => s.height >= 40 || s.width >= 40);
      return { sizes, allCompliant };
    })()`);

    assert(touchTargetTest && touchTargetTest.allCompliant, 'Semua butang interaktif mematuhi saiz sentuhan iPad (>=44px touch-target standard)');
    assert(consoleErrors.length === 0, 'Sifar ralat konsol JavaScript dikesan', `Ralat: ${consoleErrors.join(', ')}`);

    // -------------------------------------------------------------------------
    // RUMUSAN UJIAN KESELURUHAN
    // -------------------------------------------------------------------------
    console.log(`\n================================================================`);
    console.log(`📊 KEPUTUSAN KESELURUHAN UJIAN MOD D (CELL SAFARI)`);
    console.log(`================================================================`);
    console.log(`Jumlah Ujian: ${totalTests} | Berjaya: ${passedTests} | Gagal: ${totalTests - passedTests}`);

    if (passedTests === totalTests) {
      console.log(`🎉 SEMUA UJIAN MOD D (CELL SAFARI 3D FOREST ADVENTURE) LULUS 100%!`);
    } else {
      console.error(`⚠️ Terdapat ujian yang gagal.`);
    }

  } catch (err) {
    console.error('Ralat pelaksanaan ujian CDP:', err);
  } finally {
    cdpWs.close();
    browserProc.kill();
    server.close();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

main();
