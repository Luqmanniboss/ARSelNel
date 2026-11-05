/**
 * VERIFIKASI LENGKAP: MISI CERITA AR ORIENTASI DUNIA (MOD B), CARA BERMAIN & PETI HARTA KARUN 3D
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 60450;
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

async function findEdgePath() {
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
  console.log('🧪 VERIFY MOD B: STORY MISSION, HOW TO PLAY & 3D TREASURE CHEST');
  console.log('================================================================');

  const server = await startServer();
  const browserPath = await findEdgePath();
  const cdpPort = 9255;

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
    '--user-data-dir=' + path.join(ROOT_DIR, '.tmp_cdp_profile')
  ]);

  await new Promise(r => setTimeout(r, 1500));

  let cdpWs;
  try {
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
    const tabs = await listRes.json();
    const tab = tabs[0];
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
    // UJIAN 1: TEKAN "MULA AR ORIENTASI" DI LOBI MEMBUKA MODAL ARAHAN MISI TERLEBIH DAHULU
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 1: MODAL ARAHAN SEBELUM PERMAINAN (PRE-GAME BRIEFING) ---');
    const briefingTest = await evaluate(`
      (() => {
        const btnB = document.getElementById('lobby-btn-mod-b');
        const modal = document.getElementById('ar-story-mission-modal');
        const isLobbyActiveBefore = window.CellQuestAR.isLobbyActive();
        const isCamActiveBefore = window.CellQuestAR.isCameraStreamActive();
        
        // Simulasikan ketikan murid pada butang Mod B
        if (btnB) btnB.click();

        const isOpen = modal ? modal.classList.contains('open') : false;
        const isCamActiveAfter = window.CellQuestAR.isCameraStreamActive();
        const titleEl = document.getElementById('ar-mission-title');
        const titleText = titleEl ? titleEl.textContent.trim() : '';
        const storyBox = document.querySelector('.cq-mission-story-box');
        const storyText = storyBox ? storyBox.textContent : '';
        const stepCards = document.querySelectorAll('.cq-mission-step-card');

        return {
          isOpen,
          isCamActiveBefore,
          isCamActiveAfter,
          titleText,
          hasStoryBox: !!storyBox,
          storyContainsAlert: storyText.includes('AMARAN SAINS!'),
          storyContains8Stn: storyText.includes('Lapan stesen organel telah kehilangan tenaga'),
          storyContainsChest: storyText.includes('Peti Harta Karun ARSELNEL'),
          stepCount: stepCards ? stepCards.length : 0
        };
      })()
    `);

    assert('Modal arahan misi terbuka apabila butang Mod B ditekan', briefingTest.isOpen === true);
    assert('Kamera TIDAK aktif semasa modal arahan dipaparkan (Zero Camera Request)', briefingTest.isCamActiveAfter === false);
    assert('Tajuk modal sepadan: "MISI MENYELAMATKAN DUNIA SEL"', briefingTest.titleText === 'MISI MENYELAMATKAN DUNIA SEL');
    assert('Kotak jalan cerita mengandungi amaran sains & jalan cerita 8 stesen', briefingTest.storyContainsAlert && briefingTest.storyContains8Stn && briefingTest.storyContainsChest);
    assert('Bahagian CARA BERMAIN mengandungi tepat 6 langkah', briefingTest.stepCount === 6, `Jumlah langkah: ${briefingTest.stepCount}`);

    await sendCDP('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 400));
    const shot1 = await sendCDP('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_b_story_mission_modal.png', Buffer.from(shot1.data, 'base64'));
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\mod_b_story_mission_modal_colourful.png', Buffer.from(shot1.data, 'base64'));
    console.log('  📸 Screenshot captured: mod_b_story_mission_modal.png & mod_b_story_mission_modal_colourful.png');

    // -------------------------------------------------------------
    // UJIAN 2: BUTANG KEMBALI MENUTUP MODAL & KEKAL DI LOBI
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 2: BUTANG KEMBALI MODAL ARAHAN ---');
    const backBtnTest = await evaluate(`
      (() => {
        const backBtn = document.getElementById('ar-mission-back-btn');
        const modal = document.getElementById('ar-story-mission-modal');
        if (backBtn) backBtn.click();
        return {
          isOpen: modal ? modal.classList.contains('open') : false,
          isLobbyActive: window.CellQuestAR.isLobbyActive(),
          isCamActive: window.CellQuestAR.isCameraStreamActive()
        };
      })()
    `);
    assert('Butang Kembali menutup modal arahan', backBtnTest.isOpen === false);
    assert('Pengguna kekal di Lobi Makmal Sains', backBtnTest.isLobbyActive === true);
    assert('Kamera kekal tidak aktif', backBtnTest.isCamActive === false);

    // -------------------------------------------------------------
    // UJIAN 3: BUTANG "MULAKAN MISI AR" MEMULAKAN KAMERA & DIALOG KALIBRASI MOD B
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 3: MULAKAN MISI AR & KALIBRASI MOD B ---');
    const startMissionTest = await evaluate(`
      (async () => {
        // Buka semula modal
        document.getElementById('lobby-btn-mod-b').click();
        const startBtn = document.getElementById('ar-mission-start-btn');
        if (startBtn) startBtn.click();

        // Tunggu sehingga camera-ar dimulakan
        for (let i = 0; i < 30; i++) {
          if (window.CellQuestAR.getWorldState().active) break;
          await new Promise(r => setTimeout(r, 100));
        }

        const calUI = document.getElementById('ar-world-calibration-ui');
        const calText = calUI ? calUI.innerText : '';

        return {
          modalOpen: document.getElementById('ar-story-mission-modal').classList.contains('open'),
          isWorldActive: window.CellQuestAR.getWorldState().active,
          isCamActive: window.CellQuestAR.isCameraStreamActive(),
          calUIExists: !!calUI,
          calUIModBText: calText.includes('Mod B'),
          calUIDirectionsText: calText.includes('Hadapan (0°): Nukleus') && calText.includes('Kanan (90°): Sitoplasma')
        };
      })()
    `);

    assert('Modal arahan ditutup selepas "Mulakan Misi AR" ditekan', startMissionTest.modalOpen === false);
    assert('Mod Dunia AR aktif & kamera dihidupkan', startMissionTest.isWorldActive === true && startMissionTest.isCamActive === true);
    assert('Dialog kalibrasi memaparkan tajuk "Mod B" (bukan Mod C)', startMissionTest.calUIModBText === true);
    assert('Dialog kalibrasi memaparkan panduan arah 360° yang betul', startMissionTest.calUIDirectionsText === true);

    // -------------------------------------------------------------
    // UJIAN 4: MISSION HUD / BANNER OBJEKTIF & MAKLUM BALAS KEMAJUAN STESEN
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 4: MISSION HUD & MAKLUM BALAS KEMAJUAN ---');
    const hudTest = await evaluate(`
      (() => {
        const banner = document.getElementById('ar-mission-banner');
        const statusText = document.getElementById('ar-mission-status-text');
        const initialStatus = statusText ? statusText.textContent.trim() : '';

        // Simulasikan penyelesaian stesen 1
        window.CellQuestAR.markStationCompleted(1);
        const statusAfter1 = statusText ? statusText.textContent.trim() : '';

        return {
          bannerExists: !!banner,
          initialStatus,
          statusAfter1
        };
      })()
    `);

    assert('Banner objektif misi AR wujud pada HUD', hudTest.bannerExists === true);
    assert('Kemajuan stesen dikemas kini dari 0/8 ke 1/8', hudTest.statusAfter1 === 'Stesen Dipulihkan: 1/8', `Status: ${hudTest.statusAfter1}`);

    // -------------------------------------------------------------
    // UJIAN 5: DIALOG MISI BERJAYA SELEPAS 8/8 SELESAI
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 5: DIALOG MISI BERJAYA (SELEPAS 8/8) ---');
    const victoryIntroTest = await evaluate(`
      (() => {
        // Lengkapkan baki 7 stesen (2..8)
        for (let i = 2; i <= 8; i++) {
          window.CellQuestAR.markStationCompleted(i);
        }

        const modal = document.getElementById('treasure-hunt-intro-modal');
        const titleEl = document.getElementById('th-intro-title');
        const titleText = titleEl ? titleEl.textContent.trim() : '';
        const modalText = modal ? modal.innerText : '';
        const startBtn = document.getElementById('start-treasure-hunt-btn');
        const startBtnText = startBtn ? startBtn.innerText.trim() : '';

        return {
          titleText,
          hasMisiBerjaya: titleText.includes('MISI BERJAYA!'),
          textContainsStory: modalText.includes('Syabas, Saintis Muda!') && modalText.includes('Peti Harta Karun ARSELNEL telah muncul di lokasi rahsia'),
          btnText: startBtnText,
          hasBtnCariPeti: startBtnText.includes('Cari Peti Harta Karun')
        };
      })()
    `);

    assert('Tajuk dialog Misi Akhir: "MISI BERJAYA!"', victoryIntroTest.hasMisiBerjaya === true, `Tajuk: ${victoryIntroTest.titleText}`);
    assert('Teks dialog mengandungi arahan mencari Peti Harta Karun ARSELNEL di lokasi rahsia', victoryIntroTest.textContainsStory === true);
    assert('Butang tindakan: "Cari Peti Harta Karun"', victoryIntroTest.hasBtnCariPeti === true, `Butang: ${victoryIntroTest.btnText}`);

    // -------------------------------------------------------------
    // UJIAN 6: KETINGGIAN & KEDUDUKAN PETI (PITCH -22°, ARAS TERENDAH)
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 6: PENEMPATAN PETI HARTA KARUN (PITCH -22°) ---');
    const chestPlacement = await evaluate(`
      (() => {
        const placement = window.CellQuestAR.getRewardChestPlacement();
        const stations = window.CellQuestAR.getStationsConfig();
        const lowestStationEl = Math.min(...stations.map(s => s.elevationDeg));

        return {
          chestEl: placement.elevationDeg,
          chestRadius: placement.radius,
          chestAzimuth: placement.azimuthDeg,
          lowestStationEl,
          isLowerThanAllStations: placement.elevationDeg < lowestStationEl
        };
      })()
    `);

    assert('Ketinggian Peti adalah pada pitch -22° (aras terendah)', chestPlacement.chestEl === -22, `Pitch Peti: ${chestPlacement.chestEl}°`);
    assert('Peti berada LEBIH RENDAH daripada semua 8 stesen (Lowest stn: -8° vs Chest: -22°)', chestPlacement.isLowerThanAllStations === true);

    // -------------------------------------------------------------
    // UJIAN 7: MODEL 3D FANTASY GOLDEN TREASURE CHEST
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 7: STRUKTUR & KOMPONEN 3D FANTASY GOLDEN CHEST ---');
    const chest3DTest = await evaluate(`
      (() => {
        window.CellQuestAR.startTreasureHunt();
        const ws = window.CellQuestAR.getWorldState();
        const chestGroup = ws.treasureChestGroup;

        let hasWoodBody = false;
        let hasHingedLidPivot = !!ws.chestLidPivot;
        let hasGoldCornerBrackets = false;
        let hasCyanCoreGem = false;
        let hasGoldCoinsMound = false;
        let hasUpwardLightBeam = !!ws.chestBeamMesh;
        let hasInternalPointLight = !!ws.chestLight;
        let colliderRadius = 0;

        if (chestGroup) {
          chestGroup.traverse(child => {
            if (child.isMesh) {
              if (child.material && child.material.color && child.material.color.getHex() === 0x854d0e) hasWoodBody = true;
              if (child.material && child.material.color && child.material.color.getHex() === 0xf59e0b) hasGoldCornerBrackets = true;
              if (child.material && child.material.emissive && child.material.emissive.getHex() === 0x06b6d4) hasCyanCoreGem = true;
              if (child.material && child.material.color && child.material.color.getHex() === 0xfbbf24) hasGoldCoinsMound = true;
              if (child.userData && child.userData.isTreasureChest && child.geometry && child.geometry.parameters) {
                colliderRadius = child.geometry.parameters.radius || 0;
              }
            }
          });
        }

        return {
          chestVisible: chestGroup ? chestGroup.visible : false,
          hasWoodBody,
          hasHingedLidPivot,
          hasGoldCornerBrackets,
          hasCyanCoreGem,
          hasGoldCoinsMound,
          hasUpwardLightBeam,
          hasInternalPointLight,
          colliderRadius
        };
      })()
    `);

    assert('Peti Harta Karun 3D aktif dan kelihatan dalam scene', chest3DTest.chestVisible === true);
    assert('Badan kayu oak (0x854d0e) wujud', chest3DTest.hasWoodBody === true);
    assert('Penutup melengkung berengsel (Hinged Lid Pivot) wujud', chest3DTest.hasHingedLidPivot === true);
    assert('Plat sudut keemasan & rivet (0xf59e0b) wujud', chest3DTest.hasGoldCornerBrackets === true);
    assert('Plat kunci keemasan dengan permata pirus bersinar ARSELNEL (0x06b6d4) wujud', chest3DTest.hasCyanCoreGem === true);
    assert('Timbunan syiling emas dalaman (0xfbbf24) wujud', chest3DTest.hasGoldCoinsMound === true);
    assert('Rasuk cahaya emas (Light Beam Mesh) wujud', chest3DTest.hasUpwardLightBeam === true);
    assert('PointLight keemasan dalaman wujud', chest3DTest.hasInternalPointLight === true);
    assert('Hitbox esfera sentuhan besar (radius >= 1.5m) wujud', chest3DTest.colliderRadius >= 1.5, `Radius: ${chest3DTest.colliderRadius}m`);

    // -------------------------------------------------------------
    // UJIAN 8: NAVIGASI SMART RADAR MENUNJUKKAN ARAHAN TURUNKAN KAMERA
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 8: ARAHAN SMART RADAR (TURUNKAN KAMERA 22°) ---');
    const radarInstructionTest = await evaluate(`
      (() => {
        const ws = window.CellQuestAR.getWorldState();
        const chestCfg = ws.treasureChestConfig;
        
        // Pastikan radar target aktif pada peti (-1)
        window.CellQuestAR.selectRadarTarget(-1, false);

        // Halakan azimut sama seperti peti tetapi aras elevasi mendatar (0°)
        window.CellQuestAR.lookAtHeading(chestCfg.azimuthDeg, 0);
        window.CellQuestAR.checkVisibility();

        const coachEl = document.getElementById('ar-radar-coach-msg');
        const singleInstEl = document.getElementById('ar-single-instruction-text');
        const elevCmdEl = document.getElementById('ar-radar-elev-cmd');

        return {
          coachText: coachEl ? coachEl.textContent : '',
          singleInstText: singleInstEl ? singleInstEl.textContent : '',
          elevCmdText: elevCmdEl ? elevCmdEl.textContent : ''
        };
      })()
    `);

    assert('Smart radar memaparkan arahan menurunkan kamera', 
      radarInstructionTest.elevCmdText.includes('Turunkan kamera') || radarInstructionTest.singleInstText.includes('Turunkan kamera'),
      `ElevCmd: "${radarInstructionTest.elevCmdText}", SingleInst: "${radarInstructionTest.singleInstText}"`
    );

    // -------------------------------------------------------------
    // UJIAN 9: PENGESANAN PETI DITEMUI & BUKA PETI
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 9: PENGESANAN PETI DITEMUI & BUKA PETI ---');
    const chestDetectedTest = await evaluate(`
      (() => {
        const ws = window.CellQuestAR.getWorldState();
        const chestCfg = ws.treasureChestConfig;
        
        // Halakan pandangan kamera tepat ke Peti (-22° pitch)
        window.CellQuestAR.lookAtHeading(chestCfg.azimuthDeg, chestCfg.elevationDeg);
        window.CellQuestAR.checkVisibility();

        const detectedBanner = document.getElementById('ar-world-detected-banner');
        const singleInstEl = document.getElementById('ar-single-instruction-text');

        return {
          bannerDisplayed: detectedBanner ? detectedBanner.style.display !== 'none' : false,
          bannerText: detectedBanner ? detectedBanner.innerText : '',
          singleInstText: singleInstEl ? singleInstEl.textContent : ''
        };
      })()
    `);

    assert('Banner notifikasi memaparkan "Peti Harta Karun Ditemui!"', chestDetectedTest.bannerText.includes('Peti Harta Karun Ditemui!'), `Banner: "${chestDetectedTest.bannerText.replace(/\\n/g, ' ')}"`);
    assert('Arahan tunggal memaparkan "Peti Harta Karun Ditemui! Ketik untuk membuka."', chestDetectedTest.singleInstText.includes('Peti Harta Karun Ditemui! Ketik untuk membuka.'));

    // -------------------------------------------------------------
    // UJIAN 10: PEMBUKAAN PETI, ANIMASI PENUTUP, +300 BONUS & SKRIN KEMENANGAN
    // -------------------------------------------------------------
    console.log('\n--- UJIAN 10: PEMBUKAAN PETI, +300 BONUS & SKRIN KEMENANGAN ---');
    const victoryClaimTest = await evaluate(`
      (async () => {
        const initialScore = window.CellQuestAR.getState().score;
        window.CellQuestAR.openTreasureChestModal();

        // Jawab soalan bonus untuk membuka peti
        for (let q = 0; q < 3; q++) {
          const curQ = window.CellQuestAR.getState().treasureHuntQuestions[window.CellQuestAR.getState().treasureHuntCurrentQIndex];
          if (curQ) {
            window.CellQuestAR.answerBonusQuestion(curQ.correctIndex);
            window.CellQuestAR.nextBonusQuestion();
          }
        }

        // Tunggu 1600ms untuk animasi pembukaan & paparan modal
        await new Promise(r => setTimeout(r, 1600));

        const finalScore = window.CellQuestAR.getState().score;
        const rewardModal = document.getElementById('treasure-reward-modal');
        const rewardTitle = document.getElementById('tr-reward-title');
        const titleText = rewardTitle ? rewardTitle.textContent.trim() : '';
        const modalText = rewardModal ? rewardModal.innerText : '';
        const chestGroup = window.CellQuestAR.getWorldState().treasureChestGroup;

        return {
          scoreDiff: finalScore - initialScore,
          bonusClaimed: window.CellQuestAR.getState().treasureHuntBonusClaimed,
          lidOpen: window.CellQuestAR.getWorldState().isChestLidOpen,
          modalOpen: rewardModal ? rewardModal.classList.contains('open') : false,
          titleText,
          hasTahniahSaintisMuda: titleText.includes('TAHNIAH, SAINTIS MUDA!'),
          modalContainsStabilityText: modalText.includes('Misi Menyelamatkan Dunia Sel') && modalText.includes('Dunia Sel kembali stabil'),
          chestHidden: chestGroup ? chestGroup.visible === false : true
        };
      })()
    `);

    assert('+300 Markah Bonus berjaya dituntut', victoryClaimTest.scoreDiff === 300 && victoryClaimTest.bonusClaimed === true, `Score diff: +${victoryClaimTest.scoreDiff}`);
    assert('Penutup peti melengkung berputar terbuka (Lid Open = true)', victoryClaimTest.lidOpen === true);
    assert('Modal ganjaran akhir terbuka', victoryClaimTest.modalOpen === true);
    assert('Tajuk modal kemenangan: "TAHNIAH, SAINTIS MUDA!"', victoryClaimTest.hasTahniahSaintisMuda === true, `Tajuk: "${victoryClaimTest.titleText}"`);
    assert('Teks kemenangan: "Misi Menyelamatkan Dunia Sel ... Dunia Sel kembali stabil"', victoryClaimTest.modalContainsStabilityText === true);
    assert('Peti 3D disembunyikan daripada ruang AR selepas ganjaran dituntut', victoryClaimTest.chestHidden === true);

  } catch (err) {
    console.error('Ralat pelaksanaan ujian:', err);
    failCount++;
  } finally {
    cdpWs.close();
    browserProcess.kill();
    server.close();
  }

  console.log('\n================================================================');
  console.log('📊 KEPUTUSAN KESELURUHAN UJIAN');
  console.log('================================================================');
  console.log(`Jumlah Ujian: ${passCount + failCount} | Berjaya: ${passCount} | Gagal: ${failCount}`);

  if (failCount === 0) {
    console.log('🎉 SEMUA UJIAN MOD B (STORY MISSION, CARA BERMAIN & 3D CHEST) LULUS 100%!');
    process.exit(0);
  } else {
    console.error(`⚠️ Terdapat ${failCount} ujian gagal.`);
    process.exit(1);
  }
}

runTests();
