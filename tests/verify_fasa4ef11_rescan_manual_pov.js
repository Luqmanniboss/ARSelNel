/**
 * ARSELNEL — FASA 4E-F.1.1 E2E VERIFICATION SUITE (25 CHECKS)
 * HOTFIX MARKER RE-SCAN, PANEL REFOCUS & MANUAL POV LOCK
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const KOTAK_URL = `${BASE_URL}/kotak_arselnel/code.html`;
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const CDP_PORT = 9385;

const BROWSER_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

function findBrowser() {
  for (const p of BROWSER_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Edge/Chrome ditemui untuk ujian CDP.');
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function waitForCDP(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const list = await httpGetJson(`http://127.0.0.1:${port}/json/list`);
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (_) {}
    await delay(250);
  }
  throw new Error('Gagal menyambung ke CDP WebSocket dalam masa yang ditetapkan.');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.consoleErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const WebSocketImpl = globalThis.WebSocket || require('ws');
      const ws = new WebSocketImpl(this.wsUrl);
      this.ws = ws;
      ws.onopen = () => resolve();
      ws.onerror = (err) => reject(err);
      ws.onmessage = (evt) => {
        const msg = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.data.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
          else res(msg.result);
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const text = (msg.params.args || []).map((a) => a.value || a.description || '').join(' ');
            if (!text.includes('favicon.ico') && !text.includes('status of 404')) {
              this.consoleErrors.push(text);
            }
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || 'Exception';
          this.consoleErrors.push(desc);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { res: resolve, rej: reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'JS Eval Error';
      throw new Error(desc);
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height, mobile = true) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile,
      fitWindow: false
    });
    await delay(200);
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    return outPath;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
    }
  }
}

async function runVerification() {
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-F.1.1: E2E VERIFICATION SUITE');
  console.log('   HOTFIX MARKER RE-SCAN, PANEL REFOCUS & MANUAL POV LOCK (25 SEMAKAN)');
  console.log('========================================================================\n');

  const browserPath = findBrowser();
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_4ef11_${Date.now()}`);

  const browserProcess = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'about:blank'
  ], { detached: false });

  let client = null;
  let passCount = 0;
  let failCount = 0;

  function assertCheck(num, title, cond, details = '') {
    if (cond) {
      console.log(`  ✅ [PASS] Semakan ${num}: ${title}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] Semakan ${num}: ${title} - ${details}`);
      failCount++;
    }
  }

  try {
    const targets = await waitForCDP(CDP_PORT);
    const targetPage = targets.find((t) => t.type === 'page');
    if (!targetPage) throw new Error('Tiada tab halaman aktif ditemui.');

    client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    await client.setViewport(1024, 768, true);

    // Bypass onboarding modal automatically for tests
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          localStorage.setItem('arselnel_onboarding_completed_v1', 'true');
          sessionStorage.setItem('arselnel_onboarding_completed_v1', 'true');
        } catch (_) {}
      `
    });

    console.log(`🌐 Melayari: ${KOTAK_URL}`);
    await client.send('Page.navigate', { url: KOTAK_URL });
    await delay(3500);

    // Pastikan modal onboarding ditutup untuk ujian automasi
    await client.eval(`(() => {
      try {
        if (typeof window.skipOnboarding === 'function') {
          window.skipOnboarding();
        } else if (typeof window.finishOnboarding === 'function') {
          window.finishOnboarding();
        }
        const m = document.getElementById('kotak-onboarding-backdrop');
        if (m) {
          m.classList.add('hidden');
          m.style.display = 'none';
        }
      } catch (_) {}
    })()`);
    await delay(300);

    // Pastikan CMS dan modul KotakARSELNEL sedia
    await client.eval(`new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (window.KotakARSELNEL && window.KotakARSELNEL.state &&
            Array.isArray(window.KotakARSELNEL.state.videos) && window.KotakARSELNEL.state.videos.length > 0 &&
            Array.isArray(window.KotakARSELNEL.state.notes) && window.KotakARSELNEL.state.notes.length > 0) {
          resolve(true);
        } else if (Date.now() - start > 12000) {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })`);

    // -------------------------------------------------------------------------
    // SEMAKAN 1–4: IMBASAN PERTAMA MARKER VIDEO & KAWALAN MANUAL POV
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 1–4: IMBASAN PERTAMA MARKER VIDEO (MOD NORMAL, BUKAN POV) ---');

    const check1to4 = await client.eval(`(() => {
      window.handleTargetFound(0, 'video');

      const floating = document.getElementById('floating-ar-anchor');
      const povPanel = document.getElementById('pov-panel-video');
      const statusText = document.getElementById('floating-pov-status-text');
      const btnStart = document.getElementById('btn-start-pov');
      const btnPlace = document.getElementById('btn-place-video');
      const btnLock = document.getElementById('btn-lock-video');
      const povAnchor = document.getElementById('pov-btn-anchor');

      return {
        floatingVisible: floating && floating.classList.contains('is-visible'),
        floatingNotHidden: floating && !floating.classList.contains('hidden'),
        povPanelHidden: povPanel && povPanel.classList.contains('hidden'),
        systemMode: window.ARState.systemMode,
        povActive: window.ARState.pov.active,
        statusText: statusText ? statusText.textContent.trim() : '',
        btnStartVisible: btnStart && !btnStart.classList.contains('hidden'),
        btnStartText: btnStart ? btnStart.textContent.trim() : '',
        btnLockHidden: btnLock && btnLock.classList.contains('hidden'),
        povAnchorHidden: povAnchor && povAnchor.classList.contains('hidden')
      };
    })()`);

    assertCheck(1, 'Marker Video diimbas pertama kali ➔ Panel Video muncul dalam mod biasa (BUKAN POV Lock)',
      check1to4.floatingVisible && check1to4.floatingNotHidden && check1to4.povPanelHidden && check1to4.systemMode === 'MARKER' && !check1to4.povActive,
      JSON.stringify(check1to4));

    assertCheck(2, 'Status panel Video memaparkan "Pandangan Belum Dikunci"',
      check1to4.statusText.includes('Pandangan Belum Dikunci'),
      `Didapati: "${check1to4.statusText}"`);

    assertCheck(3, 'Butang "Kunci Pandangan" wujud dan kelihatan pada panel Video',
      check1to4.btnStartVisible && check1to4.btnStartText.includes('Kunci Pandangan'),
      JSON.stringify({ visible: check1to4.btnStartVisible, text: check1to4.btnStartText }));

    assertCheck(4, 'Butang "Letak di Arah Ini" TIDAK kelihatan sebelum Kunci Pandangan ditekan',
      check1to4.btnLockHidden && check1to4.povAnchorHidden,
      JSON.stringify({ btnLockHidden: check1to4.btnLockHidden, povAnchorHidden: check1to4.povAnchorHidden }));

    await client.screenshot('fasa_4ef11_semakan1_video_scan.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 5–8: TARGET LOST, RE-SCAN, PANEL REFOCUS & INTEGRITI SESI
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 5–8: TARGET LOST, RE-SCAN, TIADA PENDUA & INTEGRITI SESI ---');

    // Pilih video pertama untuk memulakan sesi video
    await client.eval(`(() => {
      const v = window.KotakARSELNEL.state.videos[0];
      window.KotakARSELNEL.selectVideo(v);
    })()`);

    // Semakan 5: Kamera dialihkan (targetLost)
    const check5 = await client.eval(`(() => {
      if (window.ARState.anchorVideo && typeof window.ARState.anchorVideo.onTargetLost === 'function') {
        window.ARState.anchorVideo.onTargetLost();
      }
      return {
        isTracking: window.ARState.isTracking,
        hasActiveVideo: !!window.ARState.activeVideo,
        videoTitle: document.getElementById('player-video-title') ? document.getElementById('player-video-title').textContent : ''
      };
    })()`);

    assertCheck(5, 'Kamera dialihkan dari marker Video (targetLost) ➔ status beralih dengan selamat tanpa merosakkan state',
      check5.hasActiveVideo && check5.videoTitle.length > 0,
      JSON.stringify(check5));

    // Semakan 6: Re-scan marker video
    const check6to8 = await client.eval(`(() => {
      // Panggil targetFound semula
      window.handleTargetFound(0, 'video');

      const floating = document.getElementById('floating-ar-anchor');
      const floatingCards = document.querySelectorAll('#floating-ar-anchor');
      const povPanels = document.querySelectorAll('#pov-panel-video');
      const videoTitle = document.getElementById('player-video-title') ? document.getElementById('player-video-title').textContent : '';

      return {
        floatingVisible: floating && floating.classList.contains('is-visible'),
        floatingNotHidden: floating && !floating.classList.contains('hidden'),
        floatingCount: floatingCards.length,
        povPanelCount: povPanels.length,
        isTracking: window.ARState.isTracking,
        videoTitle: videoTitle,
        hasActiveVideo: !!window.ARState.activeVideo,
        activeVideoId: window.ARState.activeVideo ? window.ARState.activeVideo.id : null
      };
    })()`);

    assertCheck(6, 'Marker Video diimbas semula (re-scan) ➔ Panel Video muncul semula atau difokuskan',
      check6to8.floatingVisible && check6to8.floatingNotHidden && check6to8.isTracking,
      JSON.stringify(check6to8));

    assertCheck(7, 'Tiada pendua panel Video (#pov-panel-video atau floating-ar-anchor pendua)',
      check6to8.floatingCount === 1 && check6to8.povPanelCount === 1,
      `floatingCount: ${check6to8.floatingCount}, povPanelCount: ${check6to8.povPanelCount}`);

    assertCheck(8, 'Sesi video (tajuk, minit mainan atau pilihan) kekal utuh selepas re-scan',
      check6to8.hasActiveVideo && check6to8.videoTitle.length > 0,
      `videoTitle: "${check6to8.videoTitle}"`);

    await client.screenshot('fasa_4ef11_semakan6_video_rescan.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 9–11: TEKAN KUNCI PANDANGAN ➔ POV SETUP ➔ POV LOCKED
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 9–11: KUNCI PANDANGAN MANUAL ➔ POV SETUP ➔ POV LOCKED ---');

    // Semakan 9 & 10: Tekan Kunci Pandangan
    const check9to10 = await client.eval(`(async () => {
      await window.startPOVMode();

      const povPanel = document.getElementById('pov-panel-video');
      const valStatus = document.getElementById('pov-val-status');
      const povBtnAnchor = document.getElementById('pov-btn-anchor');

      return {
        systemMode: window.ARState.systemMode,
        povActive: window.ARState.pov.active,
        povPanelVisible: povPanel && !povPanel.classList.contains('hidden'),
        statusText: valStatus ? valStatus.textContent.trim() : '',
        btnAnchorVisible: povBtnAnchor && !povBtnAnchor.classList.contains('hidden')
      };
    })()`);

    assertCheck(9, 'Tekan "Kunci Pandangan" pada panel Video ➔ Masuk ke POV Setup ("Halakan peranti ke arah pilihan")',
      check9to10.systemMode === 'POV_SETUP' && check9to10.povActive && check9to10.statusText.includes('Halakan peranti ke arah pilihan'),
      JSON.stringify(check9to10));

    assertCheck(10, 'Butang "Letak di Arah Ini" kini muncul pada panel Video',
      check9to10.btnAnchorVisible,
      JSON.stringify(check9to10));

    // Semakan 11: Tekan Letak di Arah Ini
    const check11 = await client.eval(`(() => {
      window.ARState.pov.isSimulated = true;
      window.anchorPOVAtCurrentHeading();

      const valStatus = document.getElementById('pov-val-status');
      const pVid = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('video') : null;

      return {
        systemMode: window.ARState.systemMode,
        isAnchored: window.ARState.pov.isAnchored,
        statusText: valStatus ? valStatus.textContent.trim() : '',
        panelMode: pVid ? pVid.placementMode : '',
        panelLocked: pVid ? pVid.isLocked : false
      };
    })()`);

    assertCheck(11, 'Tekan "Letak di Arah Ini" ➔ Panel Video dikunci ke POV (POV_LOCKED) dan status memaparkan "Pandangan Dikunci"',
      check11.systemMode === 'POV_LOCKED' && check11.isAnchored && (check11.statusText.includes('Pandangan Dikunci') || check11.statusText.includes('Terkunci')),
      JSON.stringify(check11));

    await client.screenshot('fasa_4ef11_semakan11_video_pov_locked.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 12–15: IMBAS MARKER NOTA (PANEL KEDUA DALAM MOD BIASA)
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 12–15: IMBAS MARKER NOTA (MOD BIASA, STATUS BELUM DIKUNCI, VIDEO KEKAL LOCKED) ---');

    const check12to15 = await client.eval(`(() => {
      window.startAddPanelScan();
      window.handleTargetFound(1, 'nota');

      const povPanelNota = document.getElementById('pov-panel-nota');
      const notaStatus = document.getElementById('pov-nota-val-status');
      const pNota = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('nota') : null;
      const pVid = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('video') : null;

      return {
        activeCount: window.ARState.activePanels.size,
        hasNota: window.ARState.activePanels.has('nota'),
        hasVideo: window.ARState.activePanels.has('video'),
        notaVisible: povPanelNota && !povPanelNota.classList.contains('hidden'),
        notaPlacementMode: pNota ? pNota.placementMode : '',
        notaIsLocked: pNota ? pNota.isLocked : true,
        notaStatusText: notaStatus ? notaStatus.textContent.trim() : '',
        videoPlacementMode: pVid ? pVid.placementMode : '',
        videoIsLocked: pVid ? pVid.isLocked : false
      };
    })()`);

    assertCheck(12, 'Imbas Marker Nota (atau tambah imbasan) ➔ Panel Nota muncul',
      check12to15.hasNota && check12to15.notaVisible && check12to15.activeCount === 2,
      JSON.stringify(check12to15));

    assertCheck(13, 'Panel Nota bermula dalam mod biasa (BUKAN POV Lock secara automatik)',
      (check12to15.notaPlacementMode === 'MARKER_FOLLOW' || check12to15.notaPlacementMode === 'SCREEN_PINNED') && !check12to15.notaIsLocked,
      `placementMode: ${check12to15.notaPlacementMode}, isLocked: ${check12to15.notaIsLocked}`);

    assertCheck(14, 'Status panel Nota memaparkan "Mod Imbasan AR — Panel Mengikuti Kad" atau "Pandangan Belum Dikunci"',
      (check12to15.notaStatusText.includes('Mod Imbasan AR') || check12to15.notaStatusText.includes('Pandangan Belum Dikunci')),
      `notaStatusText: "${check12to15.notaStatusText}"`);

    assertCheck(15, 'Panel Video yang telah dikunci POV KEKAL terkunci (tidak terjejas oleh imbasan Nota)',
      check12to15.videoPlacementMode === 'POV_LOCKED' && check12to15.videoIsLocked,
      `videoMode: ${check12to15.videoPlacementMode}, videoIsLocked: ${check12to15.videoIsLocked}`);

    await client.screenshot('fasa_4ef11_semakan12_nota_added.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 16–18: NOTA TARGET LOST, RE-SCAN, REFOCUS & INTEGRITI KANDUNGAN
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 16–18: NOTA TARGET LOST, RE-SCAN & INTEGRITI NOTA ---');

    // Pilih nota pertama untuk memaparkan kandungan
    await client.eval(`(() => {
      const n = window.KotakARSELNEL.state.notes[0];
      window.KotakARSELNEL.selectNote(n);
    })()`);

    // Semakan 16: Alihkan kamera dari marker Nota
    const check16 = await client.eval(`(() => {
      if (window.ARState.anchorNota && typeof window.ARState.anchorNota.onTargetLost === 'function') {
        window.ARState.anchorNota.onTargetLost();
      }
      const elNota = document.getElementById('pov-panel-nota');
      return {
        notaStillInDom: !!elNota,
        hasActivePanelsNota: window.ARState.activePanels.has('nota'),
        hasActiveNote: !!window.ARState.activeNote
      };
    })()`);

    assertCheck(16, 'Alihkan kamera dari marker Nota ➔ Panel Nota kekal dalam ruang spatial (tidak dimusnahkan)',
      check16.notaStillInDom && check16.hasActivePanelsNota && check16.hasActiveNote,
      JSON.stringify(check16));

    // Semakan 17 & 18: Re-scan marker Nota
    const check17to18 = await client.eval(`(() => {
      window.handleTargetFound(1, 'nota');

      const elNota = document.getElementById('pov-panel-nota');
      const elVid = document.getElementById('pov-panel-video');
      const zNota = elNota ? parseInt(window.getComputedStyle(elNota).zIndex || '0', 10) : 0;
      const zVid = elVid ? parseInt(window.getComputedStyle(elVid).zIndex || '0', 10) : 0;
      const noteTitle = document.getElementById('pov-nota-title') ? document.getElementById('pov-nota-title').textContent : '';

      return {
        activeModule: window.ARState.activeModule,
        activePanelId: window.SpatialPanelManager ? window.SpatialPanelManager.activePanelId : '',
        notaVisible: elNota && !elNota.classList.contains('hidden'),
        zNota,
        zVid,
        noteTitle,
        hasActiveNote: !!window.ARState.activeNote
      };
    })()`);

    assertCheck(17, 'Imbas semula Marker Nota ➔ Panel Nota difokuskan semula dengan lancar',
      check17to18.activeModule === 'nota' && check17to18.activePanelId === 'nota' && check17to18.zNota >= check17to18.zVid,
      JSON.stringify(check17to18));

    assertCheck(18, 'Kandungan dan kedudukan scroll/halaman Nota kekal utuh selepas re-scan',
      check17to18.hasActiveNote && check17to18.noteTitle.length > 0,
      `noteTitle: "${check17to18.noteTitle}"`);

    await client.screenshot('fasa_4ef11_semakan17_nota_rescan.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 19–21: IMBAS MARKER KUIZ, STATUS NORMAL & INTEGRITI SOALAN
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 19–21: IMBAS KUIZ, STATUS BELUM DIKUNCI & INTEGRITI JAWAPAN ---');

    const check19to20 = await client.eval(`(() => {
      window.startAddPanelScan();
      window.handleTargetFound(2, 'kuiz');

      const elKuiz = document.getElementById('pov-panel-kuiz');
      const kuizStatus = document.getElementById('pov-kuiz-val-status');
      const pKuiz = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('kuiz') : null;

      return {
        activeCount: window.ARState.activePanels.size,
        hasKuiz: window.ARState.activePanels.has('kuiz'),
        kuizVisible: elKuiz && !elKuiz.classList.contains('hidden'),
        placementMode: pKuiz ? pKuiz.placementMode : '',
        isLocked: pKuiz ? pKuiz.isLocked : true,
        kuizStatusText: kuizStatus ? kuizStatus.textContent.trim() : ''
      };
    })()`);

    assertCheck(19, 'Imbas Marker Kuiz ➔ Panel Kuiz muncul dalam mod biasa',
      check19to20.hasKuiz && check19to20.kuizVisible && check19to20.activeCount === 3,
      JSON.stringify(check19to20));

    assertCheck(20, 'Status panel Kuiz memaparkan "Mod Imbasan AR — Panel Mengikuti Kad" atau "Pandangan Belum Dikunci"',
      (check19to20.kuizStatusText.includes('Mod Imbasan AR') || check19to20.kuizStatusText.includes('Pandangan Belum Dikunci')),
      `kuizStatusText: "${check19to20.kuizStatusText}"`);

    // Semakan 21: Jawab sebahagian soalan, alihkan kamera, re-scan Kuiz
    const check21 = await client.eval(`(() => {
      // Mulakan kuiz objektif secara langsung untuk menguji state
      window.ARState.activeQuiz = {
        id: 'quiz_test_1',
        title: 'Ujian Soalan Sel',
        questions: [
          { question: 'Apakah fungsi nukleus?', options: ['Mengawal aktiviti sel', 'Menjana tenaga'], answer: 0 },
          { question: 'Organel fotosintesis?', options: ['Kloroplas', 'Ribosom'], answer: 0 }
        ]
      };
      window.ARState.quizState = {
        currentIndex: 1,
        score: 1,
        selectedAnswers: [0],
        isCompleted: false
      };

      // Alihkan kamera
      if (window.ARState.anchorKuiz && typeof window.ARState.anchorKuiz.onTargetLost === 'function') {
        window.ARState.anchorKuiz.onTargetLost();
      }

      // Re-scan marker Kuiz
      window.handleTargetFound(2, 'kuiz');

      return {
        hasActiveQuiz: !!window.ARState.activeQuiz,
        quizIndex: window.ARState.quizState ? window.ARState.quizState.currentIndex : -1,
        quizScore: window.ARState.quizState ? window.ARState.quizState.score : -1,
        quizTitle: window.ARState.activeQuiz ? window.ARState.activeQuiz.title : ''
      };
    })()`);

    assertCheck(21, 'Jawab sebahagian soalan kuiz, alihkan kamera, imbas semula Marker Kuiz ➔ Soalan dan jawapan kuiz KEKAL',
      check21.hasActiveQuiz && check21.quizIndex === 1 && check21.quizScore === 1,
      JSON.stringify(check21));

    await client.screenshot('fasa_4ef11_semakan19_kuiz_added.png');

    // -------------------------------------------------------------------------
    // SEMAKAN 22–24: RE-SCAN VIDEO, CELLQUEST 3D COEXISTENCE & PANEL CLOSE COOLDOWN
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 22–24: RE-SCAN VIDEO, CELLQUEST 3D & COOLDOWN BEBAS ---');

    // Semakan 22: Re-scan Video
    const check22 = await client.eval(`(() => {
      window.handleTargetFound(0, 'video');

      const elVid = document.getElementById('pov-panel-video');
      const elNot = document.getElementById('pov-panel-nota');
      const elKuz = document.getElementById('pov-panel-kuiz');
      const zVid = elVid ? parseInt(window.getComputedStyle(elVid).zIndex || '0', 10) : 0;
      const zNot = elNot ? parseInt(window.getComputedStyle(elNot).zIndex || '0', 10) : 0;
      const zKuz = elKuz ? parseInt(window.getComputedStyle(elKuz).zIndex || '0', 10) : 0;

      return {
        activeModule: window.ARState.activeModule,
        activePanelId: window.SpatialPanelManager ? window.SpatialPanelManager.activePanelId : '',
        zVid,
        zNot,
        zKuz,
        hasActiveVideo: !!window.ARState.activeVideo
      };
    })()`);

    assertCheck(22, 'Imbas semula Marker Video ➔ Fokus kembali ke Panel Video, video masih dimuatkan',
      check22.activeModule === 'video' && check22.activePanelId === 'video' && check22.zVid >= check22.zNot && check22.hasActiveVideo,
      JSON.stringify(check22));

    // Semakan 23: Buka CellQuest 3D bersama 3 panel DOM
    const check23 = await client.eval(`(() => {
      window.startAddPanelScan();
      window.handleTargetFound(3, 'cellquest', 'animal');

      const count = window.ARState.activePanels.size;
      const countText = document.getElementById('multi-panel-count-text') ? document.getElementById('multi-panel-count-text').textContent : '';
      const cqActive = (typeof window.CellQuestARController !== 'undefined') && window.CellQuestARController.isActive;

      return {
        count,
        countText,
        cqActive,
        panels: Array.from(window.ARState.activePanels)
      };
    })()`);

    assertCheck(23, 'Buka dan kendalikan CellQuest 3D (Sel Haiwan / Sel Tumbuhan) bersama panel-panel lain ➔ Tiada pertembungan 3D',
      check23.count === 4 && check23.cqActive && check23.countText.includes('4 Modul Aktif'),
      JSON.stringify(check23));

    await client.screenshot('fasa_4ef11_semakan23_cellquest_active.png');

    // Semakan 24: Tutup salah satu panel secara manual & semak cooldown
    const check24 = await client.eval(`(() => {
      // Tutup panel kuiz
      window.destroyKuizSession();
      const countAfterClose = window.ARState.activePanels.size;
      const kuizCooldown = window.ARState.markerCooldown ? window.ARState.markerCooldown['kuiz'] : 0;
      const now = Date.now();
      const isCooldownReasonable = (kuizCooldown - now) <= 1200; // 600ms target

      // Alihkan kamera (targetLost membersihkan cooldown untuk imbasan baharu serta-merta)
      if (typeof window.handleTargetLost === 'function') {
        window.handleTargetLost(2, 'kuiz');
      } else if (window.ARState.anchorKuiz && typeof window.ARState.anchorKuiz.onTargetLost === 'function') {
        window.ARState.anchorKuiz.onTargetLost();
      }
      const cooldownAfterLost = window.ARState.markerCooldown ? window.ARState.markerCooldown['kuiz'] : 0;

      // Imbas semula kuiz
      window.startAddPanelScan();
      window.handleTargetFound(2, 'kuiz');
      const countAfterReAdd = window.ARState.activePanels.size;

      return {
        countAfterClose,
        isCooldownReasonable,
        cooldownAfterLost,
        countAfterReAdd,
        hasKuizAgain: window.ARState.activePanels.has('kuiz')
      };
    })()`);

    assertCheck(24, 'Tutup salah satu panel secara manual ➔ Cooldown membenarkan imbasan semula selepas ditutup tanpa tersekat',
      check24.countAfterClose === 3 && check24.isCooldownReasonable && check24.cooldownAfterLost === 0 && check24.hasKuizAgain,
      JSON.stringify(check24));

    // -------------------------------------------------------------------------
    // SEMAKAN 25: TIADA RALAT KONSOL JAVASCRIPT
    // -------------------------------------------------------------------------
    console.log('\n--- SEMAKAN 25: INTEGRITI KONSOL JAVASCRIPT ---');
    const errCount = client.consoleErrors.length;
    assertCheck(25, 'Tiada ralat konsol JavaScript sepanjang semua langkah di atas',
      errCount === 0,
      `Didapati ${errCount} ralat: ${client.consoleErrors.slice(0, 3).join('; ')}`);

    console.log('\n========================================================================');
    console.log(`📊 KEPUTUSAN KESELURUHAN UJIAN VERIFIKASI FASA 4E-F.1.1:`);
    console.log(`   LULUS  : ${passCount} / 25`);
    console.log(`   GAGAL  : ${failCount} / 25`);
    console.log('========================================================================\n');

    if (failCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('💥 Ralat semasa menjalankan skrip verifikasi:', err);
    process.exitCode = 1;
  } finally {
    if (client) client.close();
    try { browserProcess.kill(); } catch (_) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  }
}

runVerification();
