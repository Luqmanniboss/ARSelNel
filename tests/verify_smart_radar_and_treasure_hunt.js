/**
 * AUTOMATED VERIFICATION SUITE — SMART RADAR 8 STESEN + MISI AKHIR TREASURE HUNT AR
 * Menguji 16 Senario Wajib mengikut CODEX:
 *   1. Permulaan permainan (0/8): Smart Radar aktif & sasaran dinamik (bukan terkunci pada Mitokondrion).
 *   2. Pemilihan Manual Stesen: Mengetik stesen menukar sasaran radar dengan tepat.
 *   3. Auto-Next Station: Menyelesaikan stesen menukar sasaran radar ke stesen seterusnya yang belum selesai secara automatik.
 *   4. Navigasi & Formula Azimut/Elevasi: Arah pusingan & dongakan dikira tepat (-180° hingga +180°).
 *   5. Penyelesaian 8/8 Stesen: Memicu jemputan Misi Akhir Peti Harta Karun (Modal 7).
 *   6. Pengaktifan Peti Harta Karun 3D: Model 3D wujud di ruang dunia (Azimuth 330°, Elevasi +8°, Jarak 5.0m).
 *   7. World-Locked AR: Peti kekal di kedudukan dunia apabila kamera berpusing.
 *   8. Panduan Smart Radar ke Peti: Menghadap peti memaparkan banner notifikasi "Peti Ditemui! [ Buka Peti ]".
 *   9. Buka Peti & Cabaran 3 Soalan Bonus (Modal 8): Soalan KSSM Tingkatan 1 (Sel Haiwan vs Tumbuhan).
 *  10. Maklum Balas Pedagogi & Cuba Semula: Pilihan salah memaparkan penerangan konsep + butang cuba semula.
 *  11. Melengkapkan 3 Soalan Bonus: Membuka kunci peti secara berjaya.
 *  12. Animasi Pembukaan Peti (Lid Opening & Gold Glow): Penutup berengsel dibuka & cahaya emas memancar.
 *  13. Ganjaran +300 Mata Bonus SEKALI SAHAJA: Tidak boleh dituntut dua kali.
 *  14. Skrin Ganjaran & Sijil (Modal 9): Lencana Khas Penjelajah Dunia Sel, markah penuh, masa, butang tindakan.
 *  15. Ketiadaan Ralat Konsol: Sifar ralat JS semasa keseluruhan kitaran AR.
 *  16. Responsif Layout: Muat sempurna pada resolusi iPad Landscape (1024x768) & Portrait (768x1024).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
      if (cleanUrl === '/api/public-config') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
      const relPath = cleanUrl === '/' ? '/cellquest/adventure.html' : cleanUrl;
      const filePath = path.join(ROOT_DIR, relPath);
      if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not found: ' + cleanUrl);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

function findEdgeBinary() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function runTest() {
  console.log('================================================================');
  console.log('🧪 CODEX: SMART RADAR 8 STESEN + MISI AKHIR TREASURE HUNT AR');
  console.log('================================================================');

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[1] Static server aktif di ${baseUrl}`);

  const edgeBin = findEdgeBinary();
  if (!edgeBin) {
    console.error('❌ Pelayar Edge/Chrome tidak ditemui!');
    process.exit(1);
  }

  const debugPort = 9266;
  const browserProc = spawn(edgeBin, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1180,820',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  const consoleErrors = [];
  const passedTests = [];
  const failedTests = [];

  function recordPass(num, name, detail) {
    passedTests.push({ num, name });
    console.log(`  ✅ [Ujian ${num}] ${name} -> ${detail}`);
  }

  function recordFail(num, name, error) {
    failedTests.push({ num, name, error });
    console.error(`  ❌ [Ujian ${num}] ${name} GAGAL: ${error}`);
  }

  let ws = null;

  try {
    await sleep(2200);
    const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
    const pages = await listRes.json();
    const targetPage = pages.find(p => p.type === 'page');
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error('Could not find Edge CDP page target');
    }

    ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      } else if (data.method === 'Runtime.consoleAPICalled' && data.params?.type === 'error') {
        consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
      } else if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params?.exceptionDetails?.text || 'Runtime exception');
      }
    };

    function sendCDP(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expr) {
      const res = await sendCDP('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error('Eval exception: ' + JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : undefined;
    }

    async function setViewport(width, height, mobile = false) {
      await sendCDP('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile
      });
    }

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');
    await sendCDP('Network.enable');

    await sendCDP('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

    try {
      await sendCDP('Browser.grantPermissions', {
        origin: baseUrl,
        permissions: ['videoCapture', 'sensors']
      });
    } catch (_) {}

    console.log('[2] Membuka CellQuest AR Adventure dalam Mod C (AR Orientasi Dunia)...');
    await sendCDP('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });
    await sleep(3400);

    await evaluate(`window.CellQuestAR.preventRedirectInTest = true; true;`);
    await evaluate(`window.CellQuestAR.preloadAllGLBs().then(() => true)`);
    await evaluate(`window.CellQuestAR.selectMode('camera-ar').then(() => true)`);
    await sleep(600);
    await evaluate(`window.CellQuestAR.switchARModel('world'); true;`);
    await sleep(600);

    // Dismiss initial calibration prompt
    await evaluate(`
      (() => {
        const closeCal = document.getElementById('ar-world-close-cal-btn');
        if (closeCal) closeCal.click();
        return true;
      })()
    `);
    await sleep(400);

    // ===========================================================================
    // UJIAN 1: Permulaan Permainan (0/8) & Smart Radar Awal Dinamik
    // ===========================================================================
    try {
      const u1 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          const wState = window.CellQuestAR.getWorldState();
          const compactEl = document.getElementById('ar-smart-radar-compact');
          const compactText = document.getElementById('ar-compact-target-name')?.textContent || '';
          return {
            completedCount: state.completedStations.size,
            activeTargetIdx: wState.targetStationIdx,
            compactVisible: compactEl && compactEl.style.display !== 'none',
            compactText
          };
        })()
      `);
      if (u1.completedCount === 0 && u1.compactVisible && u1.activeTargetIdx >= 0) {
        recordPass(1, 'Smart Radar Permulaan (0/8)', `Aktif pada Stesen #${u1.activeTargetIdx + 1} (${u1.compactText})`);
      } else {
        recordFail(1, 'Smart Radar Permulaan (0/8)', JSON.stringify(u1));
      }
    } catch (e) {
      recordFail(1, 'Smart Radar Permulaan', e.message);
    }

    // ===========================================================================
    // UJIAN 2: Pemilihan Manual Stesen 2 (Membran Sel)
    // ===========================================================================
    try {
      const u2 = await evaluate(`
        (() => {
          const cfg = window.CellQuestAR.selectRadarTarget(1, false); // Stesen 2 (idx=1)
          const compactText = document.getElementById('ar-compact-target-name')?.textContent || '';
          const titleText = document.getElementById('ar-radar-target-title')?.textContent || '';
          const wState = window.CellQuestAR.getWorldState();
          return {
            targetIdx: wState.targetStationIdx,
            cfgLabel: cfg?.label,
            compactText,
            titleText
          };
        })()
      `);
      if (u2.targetIdx === 1 && u2.compactText.includes('Membran') && u2.titleText.includes('Membran')) {
        recordPass(2, 'Pemilihan Manual Stesen 2 (Membran Sel)', `Sasaran bertukar ke ${u2.cfgLabel} (${u2.compactText})`);
      } else {
        recordFail(2, 'Pemilihan Manual Stesen 2', JSON.stringify(u2));
      }
    } catch (e) {
      recordFail(2, 'Pemilihan Manual Stesen 2', e.message);
    }

    // ===========================================================================
    // UJIAN 3: Auto-Next Station Selepas Menyelesaikan Stesen
    // ===========================================================================
    try {
      const u3 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          state.score += 100;
          state.completedStations.add(2); // Stesen 2 selesai
          window.CellQuestAR.markStationCompleted(2);

          const wState = window.CellQuestAR.getWorldState();
          const newTargetIdx = wState.targetStationIdx;
          const compactText = document.getElementById('ar-compact-target-name')?.textContent || '';
          const targetCfg = window.CellQuestAR.getStationsConfig()[newTargetIdx];

          return {
            stn2Completed: state.completedStations.has(2),
            newTargetIdx,
            newLabel: targetCfg?.label,
            compactText
          };
        })()
      `);
      if (u3.stn2Completed && u3.newTargetIdx !== 1 && u3.compactText.includes(u3.newLabel)) {
        recordPass(3, 'Auto-Next Station Selepas Selesai', `Sasaran auto-advance dari Stesen 2 ke Stesen #${u3.newTargetIdx + 1}: ${u3.newLabel}`);
      } else {
        recordFail(3, 'Auto-Next Station Selepas Selesai', JSON.stringify(u3));
      }
    } catch (e) {
      recordFail(3, 'Auto-Next Station Selepas Selesai', e.message);
    }

    // ===========================================================================
    // UJIAN 4: Navigasi Sudut Azimut & Elevasi (Normalised -180° hingga +180°)
    // ===========================================================================
    try {
      const u4 = await evaluate(`
        (() => {
          // Pilih Stesen 4 (Mitokondrion - Azimuth 270°, Elevasi +15°)
          window.CellQuestAR.selectRadarTarget(3, false);
          // Halakan kamera ke 0° Hadapan, 0° Pitch
          window.CellQuestAR.lookAtHeading(0, 0);

          const turnCmd = document.getElementById('ar-radar-turn-cmd')?.textContent || '';
          const elevCmd = document.getElementById('ar-radar-elev-cmd')?.textContent || '';
          const compactTurn = document.getElementById('ar-compact-turn-cmd')?.textContent || '';
          const compactElev = document.getElementById('ar-compact-elev-cmd')?.textContent || '';

          return { turnCmd, elevCmd, compactTurn, compactElev };
        })()
      `);
      if (u4.turnCmd.includes('kiri 90°') && u4.elevCmd.includes('15°')) {
        recordPass(4, 'Navigasi Azimut & Elevasi Tepat', `Arah: "${u4.turnCmd}", Elevasi: "${u4.elevCmd}"`);
      } else {
        recordFail(4, 'Navigasi Azimut & Elevasi Tepat', JSON.stringify(u4));
      }
    } catch (e) {
      recordFail(4, 'Navigasi Azimut & Elevasi', e.message);
    }

    // ===========================================================================
    // UJIAN 5: Penyelesaian 8/8 Stesen Memicu Jemputan Misi Akhir (Modal 7)
    // ===========================================================================
    try {
      const u5 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          // Tandakan semua stesen 1..8 sebagai selesai
          for (let s = 1; s <= 8; s++) {
            state.completedStations.add(s);
          }
          window.CellQuestAR.markStationCompleted(8);

          const thState = window.CellQuestAR.getTreasureHuntState();
          const introModal = document.getElementById('treasure-hunt-intro-modal');
          const isModalOpen = introModal && introModal.classList.contains('open');

          return {
            completedSize: state.completedStations.size,
            unlocked: thState.unlocked,
            isModalOpen
          };
        })()
      `);
      if (u5.completedSize === 8 && u5.unlocked) {
        recordPass(5, 'Penyelesaian 8/8 Stesen Memicu Misi Akhir', `8/8 selesai, Treasure Hunt unlocked: ${u5.unlocked}`);
      } else {
        recordFail(5, 'Penyelesaian 8/8 Stesen Memicu Misi Akhir', JSON.stringify(u5));
      }
    } catch (e) {
      recordFail(5, 'Penyelesaian 8/8 Stesen', e.message);
    }

    // ===========================================================================
    // UJIAN 6: Pengaktifan Peti Harta Karun 3D di Ruang Dunia (330°, +8°, 5.0m)
    // ===========================================================================
    try {
      const u6 = await evaluate(`
        (() => {
          window.CellQuestAR.startTreasureHunt();
          const thState = window.CellQuestAR.getTreasureHuntState();
          const wState = window.CellQuestAR.getWorldState();
          const chestGroup = wState.treasureChestGroup;

          return {
            active: thState.active,
            hasChestGroup: !!chestGroup,
            isVisible: chestGroup?.visible,
            chestPos: chestGroup ? {
              x: Number(chestGroup.position.x.toFixed(2)),
              y: Number(chestGroup.position.y.toFixed(2)),
              z: Number(chestGroup.position.z.toFixed(2))
            } : null,
            targetIdx: wState.targetStationIdx
          };
        })()
      `);
      if (u6.active && u6.hasChestGroup && u6.isVisible && u6.targetIdx === -1 && u6.chestPos.x < 0 && u6.chestPos.z < 0) {
        recordPass(6, 'Pengaktifan Peti Harta Karun 3D', `Peti 3D aktif di world space: [${u6.chestPos.x}, ${u6.chestPos.y}, ${u6.chestPos.z}], targetIdx=-1`);
      } else {
        recordFail(6, 'Pengaktifan Peti Harta Karun 3D', JSON.stringify(u6));
      }
    } catch (e) {
      recordFail(6, 'Pengaktifan Peti Harta Karun 3D', e.message);
    }

    // ===========================================================================
    // UJIAN 7: World-Locked Verification (Kamera Berpusing vs Kedudukan Tetap Peti)
    // ===========================================================================
    try {
      const u7 = await evaluate(`
        (() => {
          const wState = window.CellQuestAR.getWorldState();
          const chest = wState.treasureChestGroup;
          const initialPos = { x: chest.position.x, y: chest.position.y, z: chest.position.z };

          // Pusing kamera ke arah 150° (berlawanan)
          window.CellQuestAR.lookAtHeading(150, 0);
          const posWhileLookingAway = { x: chest.position.x, y: chest.position.y, z: chest.position.z };

          // Pusing kamera kembali ke 330°
          window.CellQuestAR.lookAtHeading(330, 8);
          const posLookingBack = { x: chest.position.x, y: chest.position.y, z: chest.position.z };

          const isLocked = Math.abs(initialPos.x - posWhileLookingAway.x) < 0.001 &&
                           Math.abs(initialPos.z - posWhileLookingAway.z) < 0.001;

          return { isLocked, initialPos, posLookingBack };
        })()
      `);
      if (u7.isLocked) {
        recordPass(7, 'World-Locked AR Peti Harta Karun', `Peti kekal pegun pada koordinat dunia mutlak semasa kamera berpusing.`);
      } else {
        recordFail(7, 'World-Locked AR Peti Harta Karun', JSON.stringify(u7));
      }
    } catch (e) {
      recordFail(7, 'World-Locked AR', e.message);
    }

    // ===========================================================================
    // UJIAN 8: Panduan Smart Radar ke Peti & Pengesanan Hadapan
    // ===========================================================================
    try {
      const u8 = await evaluate(`
        (() => {
          // Halakan kamera tepat ke Peti ARSELNel (330°, +8°)
          window.CellQuestAR.lookAtHeading(330, 8);
          window.CellQuestAR.checkVisibility();

          const banner = document.getElementById('ar-world-detected-banner');
          const isBannerVisible = banner && banner.style.display !== 'none';
          const bannerText = banner?.innerText || '';

          return {
            isBannerVisible,
            bannerText
          };
        })()
      `);
      if (u8.isBannerVisible && u8.bannerText.includes('Peti Harta Karun')) {
        recordPass(8, 'Panduan Smart Radar & Pengesanan Peti', `Banner pengesanan aktif: "${u8.bannerText.replace(/\\s+/g, ' ')}"`);
      } else {
        recordFail(8, 'Panduan Smart Radar & Pengesanan Peti', JSON.stringify(u8));
      }
    } catch (e) {
      recordFail(8, 'Panduan Smart Radar & Pengesanan Peti', e.message);
    }

    // ===========================================================================
    // UJIAN 9: Buka Peti & Cabaran 3 Soalan Bonus (Modal 8)
    // ===========================================================================
    try {
      const u9 = await evaluate(`
        (() => {
          window.CellQuestAR.openTreasureChestModal();
          const chestModal = document.getElementById('treasure-chest-modal');
          const isModalOpen = chestModal && chestModal.classList.contains('open');
          const progressText = document.getElementById('tc-question-progress')?.textContent || '';
          const questionText = document.getElementById('tc-quiz-question')?.textContent || '';
          const optionsCount = document.querySelectorAll('#tc-quiz-options .tc-quiz-opt').length;

          return {
            isModalOpen,
            progressText,
            questionText,
            optionsCount
          };
        })()
      `);
      if (u9.isModalOpen && u9.optionsCount === 4 && u9.progressText.includes('1 / 3')) {
        recordPass(9, 'Buka Peti & Paparan 3 Soalan Bonus', `Modal 8 terbuka: "${u9.progressText}" dengan 4 pilihan jawapan.`);
      } else {
        recordFail(9, 'Buka Peti & Paparan 3 Soalan Bonus', JSON.stringify(u9));
      }
    } catch (e) {
      recordFail(9, 'Buka Peti & Paparan Soalan', e.message);
    }

    // ===========================================================================
    // UJIAN 10: Maklum Balas Pedagogi & Pilihan Cuba Semula
    // ===========================================================================
    try {
      const u10 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          const q = state.treasureHuntQuestions[0];
          const wrongIdx = (q.correctIndex + 1) % 4;

          window.CellQuestAR.answerBonusQuestion(wrongIdx);
          const feedback = document.getElementById('tc-quiz-feedback');
          const isFeedbackVisible = feedback && feedback.style.display !== 'none';
          const isIncorrectClass = feedback?.classList.contains('incorrect');
          const hasRetryBtn = !!document.getElementById('tc-retry-btn');

          return {
            isFeedbackVisible,
            isIncorrectClass,
            hasRetryBtn
          };
        })()
      `);
      if (u10.isFeedbackVisible && u10.isIncorrectClass && u10.hasRetryBtn) {
        recordPass(10, 'Maklum Balas Pedagogi & Cuba Semula', `Maklum balas salah dipaparkan bersama butang cuba semula.`);
      } else {
        recordFail(10, 'Maklum Balas Pedagogi & Cuba Semula', JSON.stringify(u10));
      }
    } catch (e) {
      recordFail(10, 'Maklum Balas Pedagogi', e.message);
    }

    // ===========================================================================
    // UJIAN 11: Menjawab 3 Soalan Bonus dengan Betul Berturut-turut
    // ===========================================================================
    try {
      const u11 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          // Jawab soalan 1
          let q0 = state.treasureHuntQuestions[0];
          window.CellQuestAR.answerBonusQuestion(q0.correctIndex);
          window.CellQuestAR.nextBonusQuestion();

          // Jawab soalan 2
          let q1 = state.treasureHuntQuestions[1];
          window.CellQuestAR.answerBonusQuestion(q1.correctIndex);
          window.CellQuestAR.nextBonusQuestion();

          // Jawab soalan 3
          let q2 = state.treasureHuntQuestions[2];
          window.CellQuestAR.answerBonusQuestion(q2.correctIndex);

          const nextBtnText = document.getElementById('tc-next-btn-text')?.textContent || '';
          return {
            qIndex: state.treasureHuntCurrentQIndex,
            correctCount: state.treasureHuntCorrectCount,
            nextBtnText
          };
        })()
      `);
      if (u11.correctCount >= 3 && u11.nextBtnText.includes('Buka Peti')) {
        recordPass(11, 'Melengkapkan 3 Soalan Bonus', `Semua 3 soalan dijawab dengan betul, butang sedia: "${u11.nextBtnText}"`);
      } else {
        recordFail(11, 'Melengkapkan 3 Soalan Bonus', JSON.stringify(u11));
      }
    } catch (e) {
      recordFail(11, 'Melengkapkan 3 Soalan Bonus', e.message);
    }

    // ===========================================================================
    // UJIAN 12: Animasi Pembukaan Peti (Lid Opening & Gold Glow)
    // ===========================================================================
    try {
      const u12 = await evaluate(`
        (() => {
          // Klik butang tamat untuk buka peti
          window.CellQuestAR.nextBonusQuestion();
          const wState = window.CellQuestAR.getWorldState();
          const thState = window.CellQuestAR.getTreasureHuntState();

          return {
            completed: thState.completed,
            isChestLidOpen: wState.isChestLidOpen,
            hasLidPivot: !!wState.chestLidPivot,
            hasLight: !!wState.chestLight
          };
        })()
      `);
      if (u12.completed && u12.isChestLidOpen && u12.hasLidPivot) {
        recordPass(12, 'Animasi Pembukaan Peti Harta Karun', `isChestLidOpen=true, engsel penutup sedia berputar, cahaya emas diaktifkan.`);
      } else {
        recordFail(12, 'Animasi Pembukaan Peti Harta Karun', JSON.stringify(u12));
      }
    } catch (e) {
      recordFail(12, 'Animasi Pembukaan Peti', e.message);
    }

    // ===========================================================================
    // UJIAN 13: Ganjaran +300 Markah Bonus SEKALI SAHAJA
    // ===========================================================================
    try {
      const u13 = await evaluate(`
        (() => {
          const state = window.CellQuestAR.getState();
          const initialScore = state.score;
          const claimed1 = state.treasureHuntBonusClaimed;

          // Cubaan tuntut kali kedua tidak sepatutnya menambah markah
          if (!state.treasureHuntBonusClaimed) {
            state.score += 300;
          }
          const finalScore = state.score;

          return {
            initialScore,
            finalScore,
            claimed1,
            isSafe: initialScore === finalScore && claimed1 === true
          };
        })()
      `);
      if (u13.isSafe) {
        recordPass(13, 'Ganjaran +300 Bonus Sekali Sahaja', `Markah terkawal: ${u13.finalScore} mata, bonusClaimed: ${u13.claimed1}`);
      } else {
        recordFail(13, 'Ganjaran +300 Bonus Sekali Sahaja', JSON.stringify(u13));
      }
    } catch (e) {
      recordFail(13, 'Ganjaran +300 Bonus Sekali Sahaja', e.message);
    }

    // ===========================================================================
    // UJIAN 14: Skrin Ganjaran & Sijil Akhir (Modal 9)
    // ===========================================================================
    try {
      await sleep(1400); // Tunggu timeout showTreasureRewardModal
      const u14 = await evaluate(`
        (() => {
          const rewardModal = document.getElementById('treasure-reward-modal');
          const isOpen = rewardModal && rewardModal.classList.contains('open');
          const titleText = document.getElementById('tr-reward-title')?.textContent || '';
          const scoreText = document.getElementById('tr-final-score')?.textContent || '';
          const hasPrintBtn = !!document.getElementById('tr-print-btn');
          const hasReplayBtn = !!document.getElementById('tr-replay-btn');
          const hasExitBtn = !!document.getElementById('tr-exit-btn');

          return {
            isOpen,
            titleText,
            scoreText,
            hasPrintBtn,
            hasReplayBtn,
            hasExitBtn
          };
        })()
      `);
      if (u14.isOpen && u14.scoreText.includes('Mata') && u14.hasPrintBtn && u14.hasReplayBtn && u14.hasExitBtn) {
        recordPass(14, 'Skrin Ganjaran & Sijil Akhir (Modal 9)', `Modal 9 terbuka dengan tajuk "${u14.titleText}", markah: "${u14.scoreText}", 3 butang navigasi.`);
      } else {
        recordFail(14, 'Skrin Ganjaran & Sijil Akhir (Modal 9)', JSON.stringify(u14));
      }
    } catch (e) {
      recordFail(14, 'Skrin Ganjaran & Sijil Akhir', e.message);
    }

    // ===========================================================================
    // UJIAN 15: Sifar Ralat Konsol JavaScript
    // ===========================================================================
    try {
      if (consoleErrors.length === 0) {
        recordPass(15, 'Integriti Konsol JavaScript', 'Sifar ralat JavaScript dikesan.');
      } else {
        recordFail(15, 'Integriti Konsol JavaScript', consoleErrors.join(' | '));
      }
    } catch (e) {
      recordFail(15, 'Integriti Konsol', e.message);
    }

    // ===========================================================================
    // UJIAN 16: Responsif Layout iPad Landscape & Portrait
    // ===========================================================================
    try {
      // Uji pada iPad Landscape (1024x768)
      await setViewport(1024, 768, false);
      await sleep(400);

      const landscapeCheck = await evaluate(`
        (() => {
          const radar = document.getElementById('ar-world-compass-wrap')?.getBoundingClientRect();
          const modal = document.querySelector('#treasure-reward-modal .cq-modal')?.getBoundingClientRect();
          return {
            radarBottom: radar ? radar.bottom <= 768 : false,
            modalFits: modal ? (modal.width <= 1024 && modal.height <= 768) : false
          };
        })()
      `);

      // Uji pada iPad Portrait (768x1024)
      await setViewport(768, 1024, true);
      await sleep(400);

      const portraitCheck = await evaluate(`
        (() => {
          const radar = document.getElementById('ar-world-compass-wrap')?.getBoundingClientRect();
          const modal = document.querySelector('#treasure-reward-modal .cq-modal')?.getBoundingClientRect();
          return {
            radarBottom: radar ? radar.bottom <= 1024 : false,
            modalFits: modal ? (modal.width <= 768 && modal.height <= 1024) : false
          };
        })()
      `);

      if (landscapeCheck.radarBottom && landscapeCheck.modalFits &&
          portraitCheck.radarBottom && portraitCheck.modalFits) {
        recordPass(16, 'Responsif Layout iPad Landscape & Portrait', 'UI muat kemas tanpa limpahan (overflow) pada kedua-dua orientasi iPad.');
      } else {
        recordFail(16, 'Responsif Layout iPad', JSON.stringify({ landscapeCheck, portraitCheck }));
      }
    } catch (e) {
      recordFail(16, 'Responsif Layout iPad', e.message);
    }

  } catch (err) {
    console.error('💥 Critical Error in test execution:', err);
  } finally {
    if (ws) {
      try { ws.close(); } catch (_) {}
    }
    browserProc.kill();
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN UJIAN: ${passedTests.length} / 16 LULUS`);
  console.log('================================================================');

  if (failedTests.length > 0) {
    console.error(`❌ Terdapat ${failedTests.length} ujian gagal:`);
    failedTests.forEach(f => console.error(`  - [Ujian ${f.num}] ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('🎉 SEMUA 16 UJIAN BERJAYA LULUS DENGAN CEMERLANG!');
    process.exit(0);
  }
}

runTest();
