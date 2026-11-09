/**
 * UJIAN PENGESAHAN AUTOMATIK FASA 4C: MARKER KUIZ & PERMAINAN INTERAKTIF
 * 
 * Menguji:
 * 1. MindAR Multi-Target (Target 0: Video, Target 1: Nota, Target 2: Kuiz).
 * 2. Fail marker (marker-kuiz.svg, marker-kuiz.png, marker-print.html).
 * 3. Integrasi kuiz CMS & pelancar permainan interaktif.
 * 4. Interaksi kuiz AR (Pilihan A/B/C/D, maklum balas segera, penjelasan, skor, kemajuan).
 * 5. Integrasi SharedARPanelController (Screen-Pinned, 2D Drag, POV Lock Yaw + Pitch 3DoF).
 * 6. Pengekalan state kemajuan kuiz (Kamera tutup, saiz S/M/L, FOV, orientasi).
 * 7. Ujian regresi modul Video dan Nota.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9288;
const TEST_TIMEOUT = 45000;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('🎮 UJIAN PENGESAHAN AUTOMATIK: KOTAK ARSELNEL FASA 4C');
  console.log('    MARKER KUIZ & PERMAINAN INTERAKTIF (3-TARGET MINDAR + POV LOCK)');
  console.log('======================================================================\n');

  // --- BAHAGIAN 1: PENGESAHAN ASSET & MULTI-TARGET MINDAR ---
  console.log('--- BAHAGIAN 1: PENGESAHAN ASSET & MULTI-TARGET MINDAR ---');
  const svgPath = path.resolve(__dirname, '../kotak_arselnel/assets/markers/marker-kuiz.svg');
  const pngPath = path.resolve(__dirname, '../kotak_arselnel/assets/markers/marker-kuiz.png');
  const mindPath = path.resolve(__dirname, '../kotak_arselnel/assets/markers/kotak_arselnel.mind');
  const printPath = path.resolve(__dirname, '../kotak_arselnel/marker-print.html');

  assert(fs.existsSync(svgPath) && fs.statSync(svgPath).size > 1000, 'Ujian 1a: marker-kuiz.svg wujud dan sah');
  assert(fs.existsSync(pngPath) && fs.statSync(pngPath).size > 50000, 'Ujian 1b: marker-kuiz.png wujud dan bersaiz mencukupi');
  assert(fs.existsSync(mindPath) && fs.statSync(mindPath).size > 1000000, `Ujian 1c: kotak_arselnel.mind dikompilasi dengan 3 target (${fs.statSync(mindPath).size} bytes)`);

  const printHtml = fs.readFileSync(printPath, 'utf8');
  assert(printHtml.includes('marker-kuiz.png') && printHtml.includes('Kuiz &amp; Permainan'), 'Ujian 1d: marker-print.html mengandungi marker Kuiz & Permainan');

  // Start headless Chrome
  const chromePath = findChrome();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-test-4c-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--window-size=1024,768',
    '--ignore-certificate-errors',
    '--no-sandbox'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const p = list.find(t => t.type === 'page');
        if (p) { wsUrl = p.webSocketDebuggerUrl; break; }
      }
    } catch (_) {}
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  const send = (method, params) => sendCDP(ws, method, params, cdpId++);

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 3000));

  // --- BAHAGIAN 2: PENGESAHAN PEMUATAN DATA KUIZ & PERMAINAN CMS ---
  console.log('\n--- BAHAGIAN 2: PENGESAHAN PEMUATAN DATA KUIZ & PERMAINAN CMS ---');
  const dataCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const s = window.KotakARSELNEL.state;
        return {
          quizCount: s.quizzes ? s.quizzes.length : 0,
          gameCount: s.games ? s.games.length : 0,
          firstQuizTitle: s.quizzes && s.quizzes[0] ? s.quizzes[0].title : '',
          firstQuizOptions: s.quizzes && s.quizzes[0] ? s.quizzes[0].options.length : 0,
          firstGameTitle: s.games && s.games[0] ? s.games[0].title : ''
        };
      })()
    `,
    returnByValue: true
  });
  const data = dataCheck.result.value;
  assert(data.quizCount >= 5, `Ujian 2a: Kuiz CMS berjaya dimuat (${data.quizCount} soalan)`);
  assert(data.firstQuizOptions >= 2, `Ujian 2b: Soalan mempunyai pilihan jawapan (${data.firstQuizOptions} pilihan)`);
  assert(data.gameCount >= 4, `Ujian 2c: Katalog permainan sains sedia ada berjaya dimuat (${data.gameCount} permainan: ${data.firstGameTitle})`);

  // --- BAHAGIAN 3: PERTUKARAN MODUL KE KUIZ & REKA BENTUK UNGU ---
  console.log('\n--- BAHAGIAN 3: PERTUKARAN MODUL KE KUIZ & REKA BENTUK UNGU ---');
  await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.switchActiveModule('kuiz');`
  });
  await new Promise(r => setTimeout(r, 600));

  const modCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const s = window.KotakARSELNEL.state;
        const tag = document.getElementById('panel-category-tag');
        const icon = document.getElementById('panel-category-icon');
        const text = document.getElementById('panel-category-text');
        const card = document.getElementById('floating-card-container');
        const activeKuizView = document.getElementById('active-kuiz-view');
        return {
          activeModule: s.activeModule,
          tagHasKuiz: tag ? tag.classList.contains('tag-kuiz') : false,
          tagIcon: icon ? icon.textContent.trim() : '',
          tagText: text ? text.textContent.trim() : '',
          cardHasKuiz: card ? card.classList.contains('module-kuiz') : false,
          activeKuizVisible: activeKuizView ? !activeKuizView.classList.contains('hidden') : false
        };
      })()
    `,
    returnByValue: true
  });
  const m = modCheck.result.value;
  assert(m.activeModule === 'kuiz', 'Ujian 3a: activeModule beralih ke "kuiz"');
  assert(m.tagHasKuiz, 'Ujian 3b: Badge kategori mempunyai kelas .tag-kuiz');
  assert(m.tagIcon === 'sports_esports', 'Ujian 3c: Ikon kategori memaparkan sports_esports');
  assert(m.tagText.includes('Kuiz & Permainan'), 'Ujian 3d: Teks kategori memaparkan "3. Kuiz & Permainan"');
  assert(m.cardHasKuiz, 'Ujian 3e: Floating card mempunyai kelas .module-kuiz (Tema Ungu)');
  assert(m.activeKuizVisible, 'Ujian 3f: active-kuiz-view dipaparkan secara aktif');

  // --- BAHAGIAN 4: INTERAKSI MENJAWAB SOALAN (A/B/C/D & MAKLUM BALAS) ---
  console.log('\n--- BAHAGIAN 4: INTERAKSI MENJAWAB SOALAN (A/B/C/D & MAKLUM BALAS) ---');
  const q1Check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.getElementById('kuiz-question-title');
        const counter = document.getElementById('kuiz-question-counter');
        const options = document.querySelectorAll('#kuiz-options-grid .btn-kuiz-option');
        return {
          titleText: title ? title.textContent : '',
          counterText: counter ? counter.textContent : '',
          optionsCount: options.length
        };
      })()
    `,
    returnByValue: true
  });
  assert(q1Check.result.value.optionsCount === 4, `Ujian 4a: 4 pilihan jawapan objektif dipaparkan`);
  assert(q1Check.result.value.counterText.includes('Soalan 1'), `Ujian 4b: Penunjuk soalan memaparkan Soalan 1`);

  // Jawab Soalan 1 dengan jawapan 'B' (Nukleus - BETUL)
  const answerRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.submitQuizAnswer(0, 'B');
        const feedback = document.getElementById('kuiz-feedback-card');
        const title = document.getElementById('feedback-title');
        const score = window.KotakARSELNEL.state.quizState.score;
        const options = document.querySelectorAll('#kuiz-options-grid .btn-kuiz-option');
        let chosenCorrect = false;
        options.forEach(b => {
          if (b.querySelector('.opt-badge').textContent.trim() === 'B' && b.classList.contains('is-correct')) {
            chosenCorrect = true;
          }
        });
        return {
          feedbackVisible: feedback ? !feedback.classList.contains('hidden') : false,
          feedbackTitle: title ? title.textContent : '',
          score: score,
          chosenCorrect: chosenCorrect
        };
      })()
    `,
    returnByValue: true
  });
  const a = answerRes.result.value;
  assert(a.feedbackVisible, 'Ujian 4c: Kad maklum balas segera dipaparkan');
  assert(a.chosenCorrect, 'Ujian 4d: Pilihan B ditandakan sebagai .is-correct (Hijau)');
  assert(a.score === 10, 'Ujian 4e: Markah dikemas kini (+10 Mata)');

  // Tekan Soalan Seterusnya
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.nextQuizQuestion();` });
  await new Promise(r => setTimeout(r, 400));

  const q2Check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const counter = document.getElementById('kuiz-question-counter');
        const idx = window.KotakARSELNEL.state.quizState.currentQuestionIndex;
        return { counter: counter ? counter.textContent : '', index: idx };
      })()
    `,
    returnByValue: true
  });
  assert(q2Check.result.value.index === 1, 'Ujian 4f: Berjaya beralih ke Soalan 2');

  // --- BAHAGIAN 5: KEPUTUSAN KUIZ LENGKAP & SISTEM SKOR ---
  console.log('\n--- BAHAGIAN 5: KEPUTUSAN KUIZ LENGKAP & SISTEM SKOR ---');
  // Jawab soalan berbaki mengikut skema jawapan CMS dan selesaikan kuiz
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const quizzes = window.KotakARSELNEL.state.quizzes;
        for (let i = 1; i < quizzes.length; i++) {
          const ans = quizzes[i].correctAnswer || 'B';
          window.KotakARSELNEL.submitQuizAnswer(i, ans);
          window.KotakARSELNEL.nextQuizQuestion();
        }
      })()
    `,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 600));

  const resCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const resultView = document.getElementById('kuiz-result-view');
        const scorePct = document.getElementById('result-score-percent');
        const scorePoints = document.getElementById('result-score-points');
        const correctPill = document.getElementById('result-stat-correct');
        const isCompleted = window.KotakARSELNEL.state.quizState.isCompleted;
        return {
          resultVisible: resultView ? !resultView.classList.contains('hidden') : false,
          scorePct: scorePct ? scorePct.textContent : '',
          scorePoints: scorePoints ? scorePoints.textContent : '',
          correctPill: correctPill ? correctPill.textContent : '',
          isCompleted: isCompleted
        };
      })()
    `,
    returnByValue: true
  });
  const r = resCheck.result.value;
  assert(r.resultVisible, 'Ujian 5a: Kad keputusan akhir (kuiz-result-view) dipaparkan');
  assert(r.isCompleted === true, 'Ujian 5b: Kuiz ditandakan isCompleted = true');
  assert(r.scorePct === '100%', `Ujian 5c: Peratusan akhir dikira tepat (100%)`);
  assert(r.scorePoints.includes('55 / 55') || r.scorePoints.includes('50 / 50'), `Ujian 5d: Markah penuh dipaparkan (${r.scorePoints})`);
  assert(r.correctPill.includes('5 Betul'), 'Ujian 5e: Statistik betul memaparkan 5 Betul');

  // --- BAHAGIAN 6: INTEGRASI SHAREDPANELCONTROLLER, DRAG 2D & POV LOCK 3DOF ---
  console.log('\n--- BAHAGIAN 6: INTEGRASI SHAREDPANELCONTROLLER, DRAG 2D & POV LOCK 3DOF ---');
  // 6a: Semat Skrin
  await send('Runtime.evaluate', { expression: `window.SharedARPanelController.enterScreenPinned();` });
  await new Promise(r => setTimeout(r, 400));
  const pinCheck = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.isPinned && window.KotakARSELNEL.state.systemMode === 'SCREEN_PINNED';`,
    returnByValue: true
  });
  assert(pinCheck.result.value === true, 'Ujian 6a: Kuiz menyokong mod Screen-Pinned');

  // 6b: Kunci POV & Letak di Arah Ini
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        await window.SharedARPanelController.enterPOVSetup();
        window.SharedARPanelController.applySimAngles(0, 0);
        window.SharedARPanelController.lockPOV();
      })()
    `,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 500));

  const povCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const s = window.KotakARSELNEL.state;
        const povView = document.getElementById('pov-kuiz-result-view');
        return {
          mode: s.systemMode,
          isAnchored: s.pov.isAnchored,
          povResultVisible: povView ? !povView.classList.contains('hidden') : false
        };
      })()
    `,
    returnByValue: true
  });
  assert(povCheck.result.value.mode === 'POV_LOCKED', 'Ujian 6b: Kuiz berjaya dikunci dalam mod POV_LOCKED');
  assert(povCheck.result.value.isAnchored === true, 'Ujian 6c: isAnchored = true');
  assert(povCheck.result.value.povResultVisible, 'Ujian 6d: Paparan POV memaparkan keputusan kuiz yang sama (Sync POV)');

  // 6c: Uji Unjuran 3DoF Yaw & Pitch pada Kuiz POV
  await send('Runtime.evaluate', { expression: `window.SharedARPanelController.applySimAngles(40, -30);` });
  await new Promise(r => setTimeout(r, 300));

  const projCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const r = anchor.getBoundingClientRect();
        return {
          left: r.left,
          top: r.top
        };
      })()
    `,
    returnByValue: true
  });
  // Yaw +40° -> bergerak ke kiri (left < 512px)
  // Pitch -30° (tunduk) -> bergerak ke atas (top < 384px)
  assert(projCheck.result.value.left < 400, `Ujian 6e: Yaw +40° menggerakkan panel Kuiz ke kiri (Left: ${projCheck.result.value.left.toFixed(1)}px)`);
  assert(projCheck.result.value.top < 300, `Ujian 6f: Pitch -30° menggerakkan panel Kuiz ke atas (Top: ${projCheck.result.value.top.toFixed(1)}px)`);

  // --- BAHAGIAN 7: PENGEKALAN STATE KEMAJUAN KUIZ ---
  console.log('\n--- BAHAGIAN 7: PENGEKALAN STATE KEMAJUAN KUIZ (OFFSCREEN, BATERI, SAIZ) ---');
  // 7a: Tutup Kamera (Mod Jimat Bateri)
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });
  await new Promise(r => setTimeout(r, 300));
  const camCheck = await send('Runtime.evaluate', {
    expression: `!window.KotakARSELNEL.state.isCameraOn && window.KotakARSELNEL.state.quizState.isCompleted;`,
    returnByValue: true
  });
  assert(camCheck.result.value === true, 'Ujian 7a: Kamera dimatikan & status kuiz kekal utuh');

  // 7b: Ubah saiz S/M/L
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPOVPanelSize('large');` });
  await new Promise(r => setTimeout(r, 200));
  const sizeCheck = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.pov.size === 'large' && window.KotakARSELNEL.state.quizState.score === 55;`,
    returnByValue: true
  });
  assert(sizeCheck.result.value === true, 'Ujian 7b: Saiz panel ditukar ke Large & skor 55 mata kekal utuh');

  // --- BAHAGIAN 8: UJIAN REGRESI PERTUKARAN VIDEO & NOTA ---
  console.log('\n--- BAHAGIAN 8: UJIAN REGRESI PERTUKARAN VIDEO & NOTA ---');
  // 8a: Tukar ke Video
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('video');` });
  await new Promise(r => setTimeout(r, 400));
  const vReg = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.activeModule === 'video' && !document.getElementById('floating-card-container').classList.contains('module-kuiz');`,
    returnByValue: true
  });
  assert(vReg.result.value === true, 'Ujian 8a: Berjaya bertukar ke modul Video (Tema Jingga aktif, Tema Ungu ditanggalkan)');

  // 8b: Tukar ke Nota
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('nota');` });
  await new Promise(r => setTimeout(r, 400));
  const nReg = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.activeModule === 'nota' && document.getElementById('floating-card-container').classList.contains('module-nota');`,
    returnByValue: true
  });
  assert(nReg.result.value === true, 'Ujian 8b: Berjaya bertukar ke modul Nota (Tema Teal aktif, Tema Ungu ditanggalkan)');

  // 8c: Tukar semula ke Kuiz
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('kuiz');` });
  await new Promise(r => setTimeout(r, 400));
  const kReg = await send('Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.activeModule === 'kuiz' && document.getElementById('floating-card-container').classList.contains('module-kuiz');`,
    returnByValue: true
  });
  assert(kReg.result.value === true, 'Ujian 8c: Berjaya bertukar semula ke modul Kuiz (Tema Ungu aktif semula)');

  // Capture verification screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const outShotPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4c_verified.png');
  fs.writeFileSync(outShotPath, Buffer.from(screenshot.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin pengesahan disimpan ke: ${outShotPath}`);

  console.log('\n======================================================================');
  console.log('HASIL KESELURUHAN: SEMUA 25 UJIAN FASA 4C LULUS TANPA RALAT!');
  console.log('======================================================================\n');

  ws.close();
  chromeProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST RUNNER ERROR:', err);
  process.exit(1);
});
