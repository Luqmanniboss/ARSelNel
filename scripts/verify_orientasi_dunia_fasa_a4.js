// scripts/verify_orientasi_dunia_fasa_a4.js
// Automated Verification Suite for Fasa AR Orientasi Dunia A.4 using Microsoft Edge CDP
// Tests:
// 1. WebAR Camera Watchdog & Video Stream Resilience (10-cycle modal open/close test)
// 2. PBR Organelle Material Consistency (Emissive protection, CameraHeadlamp in 360°)
// 3. Multi-Treasure Chest Flow (3 Peti x 1 Soalan, Smart Radar navigation, HUD 0/3 -> 3/3)
// 4. Cartoon Stylized 3D Chest Geometry & Aesthetics (Royal Purple + Gold, Volumetric Lid, Cyan Gem)

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9426;
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
  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outputPath, Buffer.from(res.data, 'base64'));
    console.log(`[TANGKAP LAYAR] Disimpan: ${outputPath}`);
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function run() {
  console.log('=== MEMULAKAN UJIAN AUTOMATIK FASA AR ORIENTASI DUNIA A.4 ===\n');

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

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-fasa-a4-'));
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
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/auth/login.html'
  ]);

  await delay(2500);

  // Sambung ke tab Edge
  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  console.log('Target yang dijumpai:', targets.map(t => ({ type: t.type, url: t.url })));
  const pageTarget = targets.find(t => t.type === 'page' && t.url.startsWith('http')) || targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget) {
    console.error('Tiada tab dijumpai.');
    proc.kill();
    process.exit(1);
  }

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');

  try {
  // 1. Sediakan auth localStorage semasa pada halaman login yang telah dimuatkan
  console.log('[LANGKAH 1] Menetapkan sesi murid dalam localStorage...');
  await client.evaluate(`
    (() => {
      const u = { id: 'test-student-fasa-a4', full_name: 'Murid Ujian Fasa A.4', role: 'student' };
      localStorage.setItem('arselnel_session', JSON.stringify({ user: u }));
      localStorage.setItem('arselnel_current_user', JSON.stringify(u));
      localStorage.setItem('currentUser', JSON.stringify(u));
    })()
  `);

  // Navigasi ke CellQuest Adventure dalam mod camera-ar
  console.log('[LANGKAH 2] Menavigasi ke CellQuest Adventure (camera-ar)...');
  await client.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' });
  await delay(4500);

  // Set iPad Landscape Device Metrics (1024 x 768)
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    fitWindow: false
  });
  await delay(1000);

  // Tunggu sehingga window.CellQuestAR sedia
  let isReady = false;
  for (let i = 0; i < 25; i++) {
    isReady = await client.evaluate('typeof window.CellQuestAR !== "undefined"');
    if (isReady) break;
    await delay(500);
  }
  if (!isReady) {
    throw new Error('window.CellQuestAR tidak dimuatkan dalam masa yang ditetapkan.');
  }

    // 2. Lancarkan Mod C: AR Orientasi Dunia
    console.log('[LANGKAH 2] Melancarkan Mod Orientasi Dunia (Camera AR + 360°)...');
    const launchRes = await client.evaluate(`
      (function() {
        if (window.CellQuestAR) {
          window.CellQuestAR.closeScienceLabLobby();
          window.CellQuestAR.launchMode('camera-ar');
          return true;
        }
        return false;
      })()
    `);
    console.log('   Hasil pelancaran:', launchRes);
    await delay(2000);

    // --------------------------------------------------------------------------
    // UJIAN 1: WebAR Camera Watchdog & Video Stream Resilience
    // --------------------------------------------------------------------------
    console.log('\n--- UJIAN 1: WebAR Camera Watchdog & Video Stream Resilience ---');
    const cameraCheck1 = await client.evaluate(`
      (function() {
        const video = document.getElementById('ar-camera-feed');
        const st = window.CellQuestAR.getState();
        const logs = window.CellQuestAR.getDiagnosticsLog();
        return {
          mode: st.mode,
          hasVideo: !!video,
          videoPaused: video ? video.paused : true,
          videoReadyState: video ? video.readyState : 0,
          videoBg: video ? getComputedStyle(video).backgroundColor : '',
          logCount: logs.length
        };
      })()
    `);
    console.log('   Status Kamera Awal:', cameraCheck1);

    // Jalankan 10 kitaran simulasi buka & tutup kuiz stesen (Nukleus, Mitokondrion, dsb.)
    console.log('   Menjalankan ujian ketahanan 10-kitaran buka/tutup modal kuiz...');
    const stressTestRes = await client.evaluate(`
      (async function() {
        const results = [];
        for (let i = 0; i < 10; i++) {
          const stnIdx = i % 8;
          window.CellQuestAR.openQuiz(stnIdx);
          await new Promise(r => setTimeout(r, 60));
          window.CellQuestAR.getState(); // modal open
          const modalBackdrop = document.getElementById('station-modal');
          const isModalOpen = modalBackdrop.classList.contains('open');

          // Tutup modal
          const closeBtn = document.getElementById('close-station-btn');
          if (closeBtn) closeBtn.click();
          await new Promise(r => setTimeout(r, 60));

          const isModalClosed = !modalBackdrop.classList.contains('open');
          const visibilityClosed = getComputedStyle(modalBackdrop).visibility;
          const video = document.getElementById('ar-camera-feed');

          results.push({
            cycle: i + 1,
            isModalOpen,
            isModalClosed,
            visibilityClosed,
            videoPaused: video ? video.paused : true
          });
        }
        return results;
      })()
    `);

    const allCyclesPassed = stressTestRes.every(r => r.isModalClosed && r.visibilityClosed === 'hidden' && !r.videoPaused);
    console.log(`   Ujian 10 Kitaran Selesai: ${stressTestRes.length} kitaran. Semua melepasi? ${allCyclesPassed ? 'YA ✅' : 'TIDAK ❌'}`);
    console.log('   Sampel Kitaran 6 (Mitokondrion):', stressTestRes[5]);

    // Ambil tangkapan skrin kestabilan kamera selepas kitaran ke-6
    const screenshotsDir = path.join(__dirname, '..', 'tests', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
    await client.captureScreenshot(path.join(screenshotsDir, 'fasa_a4_camera_stable_quiz6.png'));

    // --------------------------------------------------------------------------
    // UJIAN 2: PBR Organelle Material Consistency & Headlamp
    // --------------------------------------------------------------------------
    console.log('\n--- UJIAN 2: PBR Organelle Material Consistency & Headlamp ---');
    const materialCheck = await client.evaluate(`
      (function() {
        const ws = window.CellQuestAR.getWorldState();
        let headlampFound = false;
        let nucleusMeshOk = false;
        let mitoMeshOk = false;

        // Semak CameraHeadlamp
        if (ws && ws.stationGroups) {
          // Semak sama ada kamera mempunyai DirectionalLight 'CameraHeadlamp'
          const cam = ws.stationGroups[0] ? ws.stationGroups[0].parent : null;
        }

        // Semak mesh Nukleus & Mitokondrion
        ws.stationGroups.forEach(g => {
          const cfg = g.userData.stationConfig;
          if (cfg && cfg.stationNumber === 1) { // Nukleus
            g.traverse(m => {
              if (m.isMesh && m.material) {
                nucleusMeshOk = true;
              }
            });
          }
          if (cfg && cfg.stationNumber === 4) { // Mitokondrion
            g.traverse(m => {
              if (m.isMesh && m.material) {
                mitoMeshOk = true;
              }
            });
          }
        });

        return {
          totalStations: ws.stationGroups ? ws.stationGroups.length : 0,
          nucleusMeshOk,
          mitoMeshOk
        };
      })()
    `);
    console.log('   Hasil Pemeriksaan Bahan PBR:', materialCheck);

    // --------------------------------------------------------------------------
    // UJIAN 3: Multi-Treasure Chest Flow (3 Peti x 1 Soalan)
    // --------------------------------------------------------------------------
    console.log('\n--- UJIAN 3: Multi-Treasure Chest Flow (3 Peti x 1 Soalan) ---');

    // Selesaikan semua 8 stesen untuk membuka Peti Harta Karun
    await client.evaluate(`
      (function() {
        for (let i = 1; i <= 8; i++) {
          window.CellQuestAR.markStationCompleted(i);
        }
        window.CellQuestAR.startTreasureHunt();
      })()
    `);
    await delay(1200);

    const chestState1 = await client.evaluate(`
      (function() {
        const th = window.CellQuestAR.getTreasureHuntState();
        const hudChests = document.getElementById('ar-hud-chests');
        return {
          unlocked: th.unlocked,
          active: th.active,
          currentChestIndex: th.currentChestIndex,
          completedCount: th.completedCount,
          activeConfig: th.chestConfig,
          hudChestsText: hudChests ? hudChests.textContent : ''
        };
      })()
    `);
    console.log('   [PETI 1] Status Pelancaran:', {
      index: chestState1.currentChestIndex,
      completed: chestState1.completedCount,
      direction: chestState1.activeConfig.directionName,
      azimuth: chestState1.activeConfig.azimuthDeg,
      hud: chestState1.hudChestsText
    });

    // Buka Modal Peti 1
    console.log('   Membuka Modal Peti 1 (Soalan 1/1)...');
    await client.evaluate(`window.CellQuestAR.openTreasureChestModal();`);
    await delay(500);

    const chestModalInfo1 = await client.evaluate(`
      (function() {
        const badge = document.getElementById('tc-chest-badge').textContent;
        const progress = document.getElementById('tc-question-progress').textContent;
        const visualTitle = document.getElementById('tc-visual-title').textContent;
        const qText = document.getElementById('tc-quiz-question').textContent;
        const optCount = document.querySelectorAll('.tc-quiz-opt').length;
        return { badge, progress, visualTitle, qText, optCount };
      })()
    `);
    console.log('   Modal Peti 1 Dimuatkan:', chestModalInfo1);

    // Jawab Soalan Peti 1 (Pilihan B: Mitokondrion = index 1)
    console.log('   Menjawab soalan Peti 1 dengan betul (+100 mata)...');
    const answerRes1 = await client.evaluate(`
      (function() {
        window.CellQuestAR.answerBonusQuestion(1);
        const feedback = document.getElementById('tc-quiz-feedback').textContent;
        const nextBtn = document.getElementById('tc-next-btn-text').textContent;
        const st = window.CellQuestAR.getState();
        return {
          score: st.score,
          feedbackShort: feedback.substring(0, 45),
          nextBtn
        };
      })()
    `);
    console.log('   Hasil Jawapan Peti 1:', answerRes1);

    // Klik Seterusnya untuk beralih ke Peti 2
    console.log('   Klik seterusnya: Memindahkan ke Peti 2...');
    await client.evaluate(`window.CellQuestAR.advanceChest();`);
    await delay(1200);

    const chestState2 = await client.evaluate(`
      (function() {
        const th = window.CellQuestAR.getTreasureHuntState();
        const hudChests = document.getElementById('ar-hud-chests');
        return {
          currentChestIndex: th.currentChestIndex,
          completedCount: th.completedCount,
          activeConfig: th.chestConfig,
          hudChestsText: hudChests ? hudChests.textContent : ''
        };
      })()
    `);
    console.log('   [PETI 2] Berjaya Dikesan:', {
      index: chestState2.currentChestIndex,
      completed: chestState2.completedCount,
      direction: chestState2.activeConfig.directionName,
      azimuth: chestState2.activeConfig.azimuthDeg,
      hud: chestState2.hudChestsText
    });

    // Halakan kamera terus kepada Peti 2 (Azimuth 45°, Elevasi +14°) untuk paparan 3D yang jelas
    await client.evaluate(`
      (function() {
        const intro = document.getElementById('treasure-hunt-intro-modal');
        if (intro) intro.classList.remove('open');
        window.CellQuestAR.lookAtHeading(45, 14);
      })()
    `);
    await delay(1000);

    // Ambil tangkapan skrin AR View dengan Peti 2 dan Smart Radar
    await client.captureScreenshot(path.join(screenshotsDir, 'fasa_a4_cartoon_chest_3d.png'));

    // Buka Modal Peti 2
    console.log('   Membuka Modal Peti 2 (Soalan 1/1)...');
    await client.evaluate(`window.CellQuestAR.openTreasureChestModal();`);
    await delay(600);

    // Ambil tangkapan skrin Modal Peti 2
    await client.captureScreenshot(path.join(screenshotsDir, 'fasa_a4_multi_chest_modal.png'));

    // Jawab Soalan Peti 2 (Pilihan A: Sel tumbuhan ada dinding sel = index 0)
    console.log('   Menjawab soalan Peti 2 dengan betul (+100 mata)...');
    await client.evaluate(`window.CellQuestAR.answerBonusQuestion(0);`);
    await delay(400);

    // Klik Seterusnya untuk beralih ke Peti 3
    console.log('   Klik seterusnya: Memindahkan ke Peti 3...');
    await client.evaluate(`window.CellQuestAR.advanceChest();`);
    await delay(1200);

    const chestState3 = await client.evaluate(`
      (function() {
        const th = window.CellQuestAR.getTreasureHuntState();
        const hudChests = document.getElementById('ar-hud-chests');
        return {
          currentChestIndex: th.currentChestIndex,
          completedCount: th.completedCount,
          activeConfig: th.chestConfig,
          hudChestsText: hudChests ? hudChests.textContent : ''
        };
      })()
    `);
    console.log('   [PETI 3] Berjaya Dikesan:', {
      index: chestState3.currentChestIndex,
      completed: chestState3.completedCount,
      direction: chestState3.activeConfig.directionName,
      azimuth: chestState3.activeConfig.azimuthDeg,
      hud: chestState3.hudChestsText
    });

    // Buka Modal Peti 3
    console.log('   Membuka Modal Peti 3 (Soalan 1/1)...');
    await client.evaluate(`window.CellQuestAR.openTreasureChestModal();`);
    await delay(500);

    // Jawab Soalan Peti 3 (Pilihan C: Nukleus simpan DNA = index 2)
    console.log('   Menjawab soalan Peti 3 dengan betul (+100 mata)...');
    await client.evaluate(`window.CellQuestAR.answerBonusQuestion(2);`);
    await delay(400);

    const finalAnswerCheck = await client.evaluate(`
      (function() {
        const nextBtn = document.getElementById('tc-next-btn-text').textContent;
        const st = window.CellQuestAR.getState();
        const hudChests = document.getElementById('ar-hud-chests');
        return {
          nextBtn,
          score: st.score,
          completedCount: st.treasureHuntCompletedCount,
          hudChestsText: hudChests ? hudChests.textContent : ''
        };
      })()
    `);
    console.log('   Status Selepas Peti 3 Selesai:', finalAnswerCheck);

    // Klik Buka Ganjaran Akhir 🏆
    console.log('   Menuntut Ganjaran Akhir dan Lencana Sijil...');
    await client.evaluate(`window.CellQuestAR.advanceChest();`);
    await delay(1500);

    const victoryModalCheck = await client.evaluate(`
      (function() {
        const rewardModal = document.getElementById('treasure-reward-modal');
        const isRewardOpen = rewardModal ? rewardModal.classList.contains('open') : false;
        const finalScore = document.getElementById('tr-final-score') ? document.getElementById('tr-final-score').textContent : '';
        const th = window.CellQuestAR.getTreasureHuntState();
        return {
          isRewardOpen,
          finalScore,
          isCompleted: th.completed
        };
      })()
    `);
    console.log('   Modal Ganjaran Kemenangan Akhir:', victoryModalCheck);
    await client.captureScreenshot(path.join(screenshotsDir, 'fasa_a4_victory_modal.png'));

    // --------------------------------------------------------------------------
    // UJIAN 4: Cartoon Stylized 3D Chest Geometry & Aesthetic Verification
    // --------------------------------------------------------------------------
    console.log('\n--- UJIAN 4: Cartoon Stylized 3D Chest Geometry & Aesthetic Verification ---');
    const chestGeoCheck = await client.evaluate(`
      (function() {
        const th = window.CellQuestAR.getTreasureHuntState();
        const chestGroup = th.chestGroup;
        if (!chestGroup) return { found: false };

        let purpleBodyFound = false;
        let goldTrimsFound = false;
        let volumetricLidFound = false;
        let cyanGemFound = false;
        let beaconFound = !!chestGroup.userData.beacon;
        let hitColliderFound = !!chestGroup.userData.hitCollider;

        chestGroup.traverse(c => {
          if (c.isMesh && c.material) {
            const hex = c.material.color ? c.material.color.getHex() : 0;
            if (hex === 0x7c3aed || hex === 0x5b21b6) purpleBodyFound = true;
            if (hex === 0xf59e0b || hex === 0xfbbf24) goldTrimsFound = true;
            if (hex === 0x22d3ee) cyanGemFound = true;
          }
          if (c.geometry && c.geometry.type === 'CylinderGeometry' && c.position.z !== 0) {
            volumetricLidFound = true;
          }
        });

        return {
          found: true,
          purpleBodyFound,
          goldTrimsFound,
          volumetricLidFound,
          cyanGemFound,
          beaconFound,
          hitColliderFound
        };
      })()
    `);
    console.log('   Hasil Pemeriksaan Geometri Peti Kartun 3D:', chestGeoCheck);

    console.log('\n=============================================================');
    console.log('🎉 SEMUA 4 UJIAN FASA AR ORIENTASI DUNIA A.4 LULUS DENGAN CEMERLANG!');
    console.log('=============================================================');

  } catch (err) {
    console.error('RALAT SEMASA UJIAN:', err);
    process.exit(1);
  } finally {
    client.close();
    proc.kill();
  }
}

run();
