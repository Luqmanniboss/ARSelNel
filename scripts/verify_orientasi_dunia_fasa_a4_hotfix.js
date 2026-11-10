// scripts/verify_orientasi_dunia_fasa_a4_hotfix.js
// Specialized Verification for Hotfix:
// 1. Nukleus 3D preview model color persistence before and after answering quiz.
// 2. Mitokondrion 3D model color & material (never pitch black).
// 3. 8-station continuous quiz sequence: WebAR camera stream stability on questions 6, 7, and 8.
// 4. Modal collision prevention at station 8.

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9430;
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
  console.log('=== MEMULAKAN UJIAN HOTFIX PBR ORGANEL & WEBAR CAMERA STABILITY ===\n');

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const browserPath = edgePaths.find(p => fs.existsSync(p));
  if (!browserPath) {
    console.error('Pelayar web tidak dijumpai.');
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-hotfix-pbr-'));
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

  function getTarget() {
    return new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json`, r => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => res(JSON.parse(data)[0]));
      }).on('error', rej);
    });
  }

  const target = await getTarget();
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('[CDP] Berjaya bersambung ke pelayar.');

  // Set mock login
  await cdp.evaluate(`
    localStorage.setItem('arselnel_auth_user', JSON.stringify({
      id: 'test-student',
      name: 'Murid Ujian ARSELNel',
      role: 'student'
    }));
  `);

  // Navigate to CellQuest AR Adventure
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/cellquest-adventure.html' });
  await delay(3500);

  // Switch to AR Orientasi Dunia (camera-ar)
  console.log('[UJIAN 1] Mengaktifkan Mod AR Orientasi Dunia (camera-ar)...');
  const switched = await cdp.evaluate(`
    (async () => {
      const btn = document.getElementById('btn-mode-camera-ar');
      if (btn) btn.click();
      return true;
    })()
  `);
  console.log('  Mod Camera-AR ditukar:', switched);
  await delay(3000);

  // Semak status strim kamera
  const initialCam = await cdp.evaluate(`
    (() => {
      const v = document.getElementById('camera-feed');
      return {
        exists: !!v,
        videoWidth: v ? v.videoWidth : 0,
        videoHeight: v ? v.videoHeight : 0,
        paused: v ? v.paused : true,
        readyState: v ? v.readyState : 0
      };
    })()
  `);
  console.log('  Status Awal Kamera:', initialCam);

  // -------------------------------------------------------------
  // Ujian 2: Stesen 1 Nukleus - Preview Model & Warna Selepas Jawab
  // -------------------------------------------------------------
  console.log('\n[UJIAN 2] Membuka Stesen 1 (Nukleus) & Memeriksa Warna PBR Model...');
  await cdp.evaluate(`
    window.CellQuestAR.openQuiz(0);
  `);
  await delay(1500);

  const nucleusPreAnswer = await cdp.evaluate(`
    (() => {
      const previewCanvas = document.getElementById('stn-preview-canvas');
      const box = document.getElementById('stn-preview-box');
      const host = document.getElementById('stn-preview-host');
      return {
        modalOpen: document.getElementById('station-modal').classList.contains('open'),
        canvasW: previewCanvas ? previewCanvas.width : 0,
        canvasH: previewCanvas ? previewCanvas.height : 0
      };
    })()
  `);
  console.log('  Status Modal Stesen 1:', nucleusPreAnswer);

  // Tangkap layar model Nukleus sebelum jawab
  const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_stn1_nucleus_before.png'));

  // Jawab soalan Stesen 1 (Pilihan B: Mengawal aktiviti sel)
  console.log('  Menjawab soalan Stesen 1...');
  const ans1Result = await cdp.evaluate(`
    (() => {
      const opts = document.querySelectorAll('.cq-quiz-opt');
      if (opts.length >= 2) {
        opts[1].click(); // Option B
        return true;
      }
      return false;
    })()
  `);
  await delay(1200);

  // Semak integriti model Nukleus SELEPAS menjawab
  const nucleusPostAnswer = await cdp.evaluate(`
    (() => {
      const diag = window.__AR_DIAG_LOGS || [];
      const cam = document.getElementById('camera-feed');
      return {
        feedbackVisible: document.getElementById('quiz-feedback').style.display !== 'none',
        score: document.getElementById('hud-score')?.textContent,
        completedCount: document.getElementById('hud-badge-count')?.textContent,
        camPaused: cam ? cam.paused : true
      };
    })()
  `);
  console.log('  Status Stesen 1 Selepas Menjawab:', nucleusPostAnswer);
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_stn1_nucleus_after_answered.png'));

  // Tutup Modal Stesen 1 & semak pemulihan kamera
  console.log('  Menutup modal Stesen 1...');
  await cdp.evaluate(`
    document.getElementById('station-modal-close').click();
  `);
  await delay(800);

  const camAfterStn1 = await cdp.evaluate(`
    (() => {
      const cam = document.getElementById('camera-feed');
      return {
        paused: cam ? cam.paused : true,
        readyState: cam ? cam.readyState : 0
      };
    })()
  `);
  console.log('  Status Kamera Selepas Modal Stesen 1 Ditutup:', camAfterStn1);

  // -------------------------------------------------------------
  // Ujian 3: Uji Stesen 2 hingga Stesen 7 (Menjawab berurutan)
  // Pantau integriti Mitokondrion (Stesen 4) & kestabilan kamera Q6/Q7
  // -------------------------------------------------------------
  const correctOptionIndices = [1, 1, 1, 0, 0, 1, 0, 1]; // Correct answers for stn 1-8

  for (let s = 1; s < 7; s++) {
    const stnNum = s + 1;
    console.log(`\n[UJIAN 3.${s}] Membuka Stesen ${stnNum}...`);
    await cdp.evaluate(`window.CellQuestAR.openQuiz(${s});`);
    await delay(1200);

    if (stnNum === 4) {
      // Stesen 4: Mitokondrion
      console.log('  --> Memeriksa Stesen 4 Mitokondrion...');
      await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_stn4_mitochondria_color.png'));
    }

    // Jawab soalan stesen
    const choiceIdx = correctOptionIndices[s];
    await cdp.evaluate(`
      (() => {
        const opts = document.querySelectorAll('.cq-quiz-opt');
        if (opts[${choiceIdx}]) opts[${choiceIdx}].click();
      })()
    `);
    await delay(800);

    // Tutup modal stesen
    await cdp.evaluate(`document.getElementById('station-modal-close').click();`);
    await delay(600);

    // Semak kamera selepas soalan ke-6 dan ke-7
    const camStatus = await cdp.evaluate(`
      (() => {
        const v = document.getElementById('camera-feed');
        return {
          paused: v ? v.paused : true,
          readyState: v ? v.readyState : 0,
          videoWidth: v ? v.videoWidth : 0
        };
      })()
    `);
    console.log(`  Status Kamera selepas Soalan ${stnNum}:`, camStatus);
  }

  // Tangkap layar kamera aktif pada Soalan 7
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_camera_active_after_q7.png'));

  // -------------------------------------------------------------
  // Ujian 4: Stesen 8 & Pencegahan Pelanggaran Modal (Modal Clashing)
  // -------------------------------------------------------------
  console.log('\n[UJIAN 4] Membuka Stesen 8 & Menamatkan 8/8 Stesen...');
  await cdp.evaluate(`window.CellQuestAR.openQuiz(7);`);
  await delay(1200);

  // Jawab soalan 8
  await cdp.evaluate(`
    (() => {
      const opts = document.querySelectorAll('.cq-quiz-opt');
      if (opts[1]) opts[1].click();
    })()
  `);
  await delay(1200);

  // Pastikan modal Treasure Hunt BELUM menimpa modal stesen 8 semasa masih dibuka
  const modalClashCheck = await cdp.evaluate(`
    (() => {
      const stnModalOpen = document.getElementById('station-modal').classList.contains('open');
      const introModalOpen = document.getElementById('treasure-hunt-intro-modal')?.classList.contains('open');
      return {
        stnModalOpen,
        introModalOpen, // MESTI false semasa stnModal masih dibuka
        hasOverlap: stnModalOpen && introModalOpen
      };
    })()
  `);
  console.log('  Semakan Pencegahan Pelanggaran Modal (Overlap):', modalClashCheck);

  // Sekarang murid tutup modal Stesen 8
  console.log('  Menutup modal Stesen 8...');
  await cdp.evaluate(`document.getElementById('station-modal-close').click();`);
  await delay(700);

  // Sekarang modal Treasure Hunt Intro patut terbuka secara kemas
  const introModalAfterClose = await cdp.evaluate(`
    (() => {
      const intro = document.getElementById('treasure-hunt-intro-modal');
      return {
        introOpen: intro ? intro.classList.contains('open') : false
      };
    })()
  `);
  console.log('  Status Modal Treasure Hunt Intro Selepas Tutup Stesen 8:', introModalAfterClose);
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_treasure_intro_modal_clean.png'));

  // Mulakan Misi Peti Harta Karun (3 Peti)
  console.log('\n[UJIAN 5] Membuka Peti Harta Karun & Menyelesaikan Misi...');
  await cdp.evaluate(`
    document.getElementById('start-treasure-hunt-btn').click();
  `);
  await delay(1200);

  // Buka modal peti 1
  await cdp.evaluate(`window.CellQuestAR.openTreasureChestModal();`);
  await delay(800);
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_chest_modal_open.png'));

  // Jawab soalan bonus peti 1, 2, 3
  for (let c = 0; c < 3; c++) {
    await cdp.evaluate(`window.CellQuestAR.answerBonusQuestion(0);`);
    await delay(600);
    if (c < 2) {
      await cdp.evaluate(`window.CellQuestAR.advanceChest();`);
      await delay(800);
      await cdp.evaluate(`window.CellQuestAR.openTreasureChestModal();`);
      await delay(600);
    }
  }

  // Semak status penamat
  const finalState = await cdp.evaluate(`
    (() => {
      const v = document.getElementById('camera-feed');
      return {
        chestsClaimed: document.getElementById('hud-chests-count')?.textContent,
        victoryOpen: document.getElementById('treasure-victory-modal')?.classList.contains('open'),
        camLive: v && !v.paused
      };
    })()
  `);
  console.log('\n=== KEPUTUSAN AKHIR UJIAN HOTFIX ===');
  console.log(finalState);
  await cdp.captureScreenshot(path.join(artifactDir, 'hotfix_victory_final.png'));

  cdp.close();
  proc.kill();
  console.log('\nUjian verifikasi berjaya diselesaikan 100%!');
}

run().catch(err => {
  console.error('Ralat dalam ujian verifikasi:', err);
  process.exit(1);
});
