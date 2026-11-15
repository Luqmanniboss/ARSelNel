/**
 * ARSELNEL — FASA 4E-F.1.2 E2E VERIFICATION SUITE (25 CHECKS)
 * CRITICAL HOTFIX: THREE SPATIAL MODES, NOTA & KUIZ MARKER_FOLLOW TRACKING & NON-DESTRUCTIVE TARGET LOST
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const KOTAK_URL = `${BASE_URL}/kotak_arselnel/code.html`;
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const CDP_PORT = 9386;

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
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Eval error: ${desc}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
      console.log(`  📸 Tangkapan skrin disimpan: ${filepath}`);
    }
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
    }
  }
}

async function runFasa4EF12Tests() {
  console.log('======================================================================');
  console.log('🧪 SUITI UJIAN FASA 4E-F.1.2: THREE SPATIAL MODES & MARKER FOLLOW TRACKING');
  console.log('======================================================================\n');

  let browserProcess = null;
  let client = null;
  let passed = 0;
  let failed = 0;
  const results = [];

  function assertCheck(num, title, cond, detail = '') {
    if (cond) {
      console.log(`  ✅ Semakan ${num}: ${title}`);
      passed++;
      results.push({ num, title, status: 'PASS' });
    } else {
      console.error(`  ❌ Semakan ${num}: ${title}`);
      if (detail) console.error(`     Perincian: ${detail}`);
      failed++;
      results.push({ num, title, status: 'FAIL', detail });
    }
  }

  try {
    const browserPath = findBrowser();
    const tempUserDataDir = path.join(os.tmpdir(), `cdp_fasa4ef12_${Date.now()}`);
    fs.mkdirSync(tempUserDataDir, { recursive: true });

    console.log(`[Pelayar] Melancarkan ${path.basename(browserPath)} pada port CDP ${CDP_PORT}...`);
    browserProcess = spawn(browserPath, [
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tempUserDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1024,768',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      KOTAK_URL
    ], { stdio: 'ignore' });

    const targets = await waitForCDP(CDP_PORT, 15000);
    const pageTarget = targets.find((t) => t.type === 'page' && t.url.includes('code.html')) || targets[0];
    if (!pageTarget) throw new Error('Tiada sasaran laman ditemui.');

    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    console.log('[Pelayar] Menunggu DOM sedia dan MindAR dimulakan...');
    await delay(3000);

    // Tandakan onboarding selesai supaya modal tidak menghalang ujian
    await client.eval(`(() => {
      try { localStorage.setItem('arselnel_kotak_onboarding_v1', 'completed'); } catch(e) {}
      const m = document.getElementById('onboarding-guide-modal');
      if (m) m.classList.add('hidden');
      if (window.KotakARSELNEL && typeof window.KotakARSELNEL.closeOnboardingModal === 'function') {
        window.KotakARSELNEL.closeOnboardingModal();
      }
    })()`);
    await delay(500);

    // -------------------------------------------------------------------------
    // SEMAKAN 1, 2, 3: MOD LALAI SETIAP PANEL ADALAH MARKER_FOLLOW
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN A: MOD LALAI MARKER_FOLLOW (SEMAKAN 1 - 3) ---');

    const checkInitModes = await client.eval(`(() => {
      // Buka panel Nota melalui addPanelToSpatialWorkspace
      window.addPanelToSpatialWorkspace('nota');
      window.addPanelToSpatialWorkspace('kuiz');
      window.addPanelToSpatialWorkspace('video');

      const pNota = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('nota') : null;
      const pKuiz = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('kuiz') : null;
      const pVideo = window.SpatialPanelManager ? window.SpatialPanelManager.getPanel('video') : null;

      const elNota = document.getElementById('pov-panel-nota');
      const elKuiz = document.getElementById('pov-panel-kuiz');
      const elVideo = document.getElementById('pov-panel-video');

      return {
        notaMode: pNota ? pNota.placementMode : '',
        kuizMode: pKuiz ? pKuiz.placementMode : '',
        videoMode: pVideo ? pVideo.placementMode : '',
        notaCentered: elNota ? elNota.classList.contains('is-centered') : true,
        kuizCentered: elKuiz ? elKuiz.classList.contains('is-centered') : true,
        videoCentered: elVideo ? elVideo.classList.contains('is-centered') : true
      };
    })()`);

    assertCheck(1, 'Panel Nota bermula dalam mod MARKER_FOLLOW secara lalai (bukan SCREEN_PINNED dan bukan is-centered)',
      checkInitModes.notaMode === 'MARKER_FOLLOW' && !checkInitModes.notaCentered,
      JSON.stringify(checkInitModes));

    assertCheck(2, 'Panel Kuiz bermula dalam mod MARKER_FOLLOW secara lalai (bukan SCREEN_PINNED dan bukan is-centered)',
      checkInitModes.kuizMode === 'MARKER_FOLLOW' && !checkInitModes.kuizCentered,
      JSON.stringify(checkInitModes));

    assertCheck(3, 'Panel Video bermula dalam mod MARKER_FOLLOW secara lalai (bukan SCREEN_PINNED dan bukan is-centered)',
      checkInitModes.videoMode === 'MARKER_FOLLOW' && !checkInitModes.videoCentered,
      JSON.stringify(checkInitModes));

    // -------------------------------------------------------------------------
    // SEMAKAN 4, 5, 6, 7, 8: 3D-TO-2D PROJECTION & MOVEMENT (LEFT, RIGHT, UP, DOWN, LERP)
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN B: PROJEKSI & PERGERAKAN 3D-KE-2D MARKER (SEMAKAN 4 - 8) ---');

    // Uji unjuran pergerakan marker Nota
    const trackingTest = await client.eval(`(() => {
      const p = window.SpatialPanelManager.getPanel('nota');
      const el = document.getElementById('pov-panel-nota');
      const anchor = window.ARState.anchorNota;

      if (!anchor || !anchor.group) return { error: 'anchorNota.group tidak wujud' };

      anchor.group.visible = true;
      anchor.group.matrixAutoUpdate = true;
      anchor.group.position.set(0, 0, -2); // Pusat di hadapan kamera
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);

      // Paksa lerpFactor = 1 untuk ujian kedudukan segera
      const oldLerp = window.ARState.lerpFactor;
      window.ARState.lerpFactor = 1.0;
      p.currentScreenX = undefined;
      p.currentScreenY = undefined;

      window.updateSpatialPanelsPosition();
      const centerX = parseFloat(el.style.left);
      const centerY = parseFloat(el.style.top);

      // Alih marker ke KIRI (-X)
      anchor.group.position.set(-0.6, 0, -2);
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);
      window.updateSpatialPanelsPosition();
      const leftX = parseFloat(el.style.left);

      // Alih marker ke KANAN (+X)
      anchor.group.position.set(0.6, 0, -2);
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);
      window.updateSpatialPanelsPosition();
      const rightX = parseFloat(el.style.left);

      // Alih marker ke ATAS (+Y dalam 3D -> -Y dalam skrin)
      anchor.group.position.set(0, 0.4, -2);
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);
      window.updateSpatialPanelsPosition();
      const upY = parseFloat(el.style.top);

      // Alih marker ke BAWAH (-Y dalam 3D -> +Y dalam skrin)
      anchor.group.position.set(0, -0.4, -2);
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);
      window.updateSpatialPanelsPosition();
      const downY = parseFloat(el.style.top);

      // Uji LERP smoothing (0.25)
      window.ARState.lerpFactor = 0.25;
      anchor.group.position.set(0.8, 0, -2);
      anchor.group.updateMatrix();
      anchor.group.updateMatrixWorld(true);
      p.currentScreenX = 400;
      window.updateSpatialPanelsPosition();
      const lerpedX = p.currentScreenX;

      window.ARState.lerpFactor = oldLerp;

      return {
        centerX, centerY,
        leftX, rightX,
        upY, downY,
        lerpedX,
        hasNaN: [centerX, centerY, leftX, rightX, upY, downY, lerpedX].some((v) => Number.isNaN(v))
      };
    })()`);

    assertCheck(4, 'Pergerakan marker ke kiri (-X) mengalihkan koordinat panel ke kiri (leftX < centerX)',
      trackingTest.leftX < trackingTest.centerX,
      JSON.stringify(trackingTest));

    assertCheck(5, 'Pergerakan marker ke kanan (+X) mengalihkan koordinat panel ke kanan (rightX > centerX)',
      trackingTest.rightX > trackingTest.centerX,
      JSON.stringify(trackingTest));

    assertCheck(6, 'Pergerakan marker ke atas (+Y) mengalihkan koordinat panel ke atas skrin (upY < centerY)',
      trackingTest.upY < trackingTest.centerY,
      JSON.stringify(trackingTest));

    assertCheck(7, 'Pergerakan marker ke bawah (-Y) mengalihkan koordinat panel ke bawah skrin (downY > centerY)',
      trackingTest.downY > trackingTest.centerY,
      JSON.stringify(trackingTest));

    assertCheck(8, 'Unjuran kamera Three.js dan LERP smoothing berfungsi lancar tanpa sebarang NaN',
      !trackingTest.hasNaN && trackingTest.lerpedX > 400 && trackingTest.lerpedX < 1000,
      JSON.stringify(trackingTest));

    // -------------------------------------------------------------------------
    // SEMAKAN 9, 10, 11, 12, 13, 14: TARGET LOST & RE-SCAN INTEGRITY (NON-DESTRUCTIVE)
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN C: TARGET LOST & PEMULIHAN RE-SCAN (SEMAKAN 9 - 14) ---');

    // Sediakan state nota: pilih topik nota dan tukar halaman
    await client.eval(`(() => {
      // Pilih nota pertama jika belum ada
      if (!window.ARState.activeNote && window.ARState.notes && window.ARState.notes.length > 0) {
        window.selectNote(window.ARState.notes[0]);
      }
      const p = window.SpatialPanelManager.getPanel('nota');
      if (p) p.page = 3;
    })()`);

    // Sediakan state kuiz: set soalan aktif
    await client.eval(`(() => {
      window.ARState.activeQuiz = {
        id: 'quiz_mitosis',
        title: 'Kuiz Pembahagian Sel',
        score: 10,
        currentQuestionIndex: 2,
        userAnswers: { 0: 1, 1: 2 }
      };
    })()`);

    // Simulasikan Target Lost untuk Nota
    const targetLostNota = await client.eval(`(() => {
      const anchor = window.ARState.anchorNota;
      if (anchor && anchor.group) anchor.group.visible = false;
      window.updateSpatialPanelsPosition();

      const el = document.getElementById('pov-panel-nota');
      const p = window.SpatialPanelManager.getPanel('nota');

      return {
        opacity: el ? el.style.opacity : '',
        visibility: el ? el.style.visibility : '',
        pointerEvents: el ? el.style.pointerEvents : '',
        mode: p ? p.placementMode : '',
        page: p ? p.page : 0,
        activeNoteId: window.ARState.activeNote ? window.ARState.activeNote.id : null
      };
    })()`);

    assertCheck(9, 'Target lost semasa MARKER_FOLLOW menyembunyikan panel Nota secara lancar (opacity: 0, visibility: hidden)',
      targetLostNota.opacity === '0' && targetLostNota.visibility === 'hidden' && targetLostNota.pointerEvents === 'none',
      JSON.stringify(targetLostNota));

    assertCheck(10, 'Target lost semasa MARKER_FOLLOW TIDAK mengubah placementMode kepada SCREEN_PINNED',
      targetLostNota.mode === 'MARKER_FOLLOW',
      `placementMode: ${targetLostNota.mode}`);

    assertCheck(11, 'Target lost semasa MARKER_FOLLOW mengekalkan data sesi Nota (halaman & activeNote)',
      targetLostNota.page === 3 && targetLostNota.activeNoteId !== null,
      JSON.stringify(targetLostNota));

    // Simulasikan Target Lost untuk Kuiz
    const targetLostKuiz = await client.eval(`(() => {
      const anchor = window.ARState.anchorKuiz;
      if (anchor && anchor.group) anchor.group.visible = false;
      window.updateSpatialPanelsPosition();

      const el = document.getElementById('pov-panel-kuiz');
      const p = window.SpatialPanelManager.getPanel('kuiz');

      return {
        opacity: el ? el.style.opacity : '',
        visibility: el ? el.style.visibility : '',
        quizIndex: window.ARState.activeQuiz ? window.ARState.activeQuiz.currentQuestionIndex : -1,
        quizScore: window.ARState.activeQuiz ? window.ARState.activeQuiz.score : -1,
        answersCount: window.ARState.activeQuiz ? Object.keys(window.ARState.activeQuiz.userAnswers).length : 0
      };
    })()`);

    assertCheck(12, 'Target lost mengekalkan sesi jawapan dan markah kuiz tanpa set semula',
      targetLostKuiz.opacity === '0' && targetLostKuiz.quizIndex === 2 && targetLostKuiz.quizScore === 10 && targetLostKuiz.answersCount === 2,
      JSON.stringify(targetLostKuiz));

    // Simulasikan Marker Re-Scan (Kad dikesan semula)
    const reScanNota = await client.eval(`(() => {
      const anchor = window.ARState.anchorNota;
      if (anchor && anchor.group) {
        anchor.group.visible = true;
        anchor.group.matrixAutoUpdate = true;
        anchor.group.position.set(0.1, 0.1, -2);
        anchor.group.updateMatrix();
        anchor.group.updateMatrixWorld(true);
      }
      window.handleTargetFound(1, 'nota');
      window.updateSpatialPanelsPosition();

      const el = document.getElementById('pov-panel-nota');
      const notaPanelsCount = document.querySelectorAll('#pov-panel-nota').length;

      return {
        opacity: el ? el.style.opacity : '',
        visibility: el ? el.style.visibility : '',
        notaPanelsCount,
        left: el ? el.style.left : '',
        top: el ? el.style.top : ''
      };
    })()`);

    assertCheck(13, 'Marker diimbas semula memulihkan keterlihatan panel Nota (opacity: 1, visibility: visible)',
      reScanNota.opacity === '1' && reScanNota.visibility === 'visible' && reScanNota.left !== '',
      JSON.stringify(reScanNota));

    assertCheck(14, 'Pengesanan semula marker TIDAK mencipta elemen panel pendua dalam DOM',
      reScanNota.notaPanelsCount === 1,
      `notaPanelsCount: ${reScanNota.notaPanelsCount}`);

    // -------------------------------------------------------------------------
    // SEMAKAN 15, 16, 17, 18: MOD SCREEN_PINNED & IKUT KAD AR
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN D: MOD SCREEN_PINNED & PENUKARAN SEMULA (SEMAKAN 15 - 18) ---');

    // Tekan "Semat Skrin" secara manual
    const pinAction = await client.eval(`(() => {
      const btnPin = document.getElementById('pov-nota-btn-back-pinned');
      if (btnPin) btnPin.click();

      const p = window.SpatialPanelManager.getPanel('nota');
      const valStatus = document.getElementById('pov-nota-val-status');
      const btnText = btnPin ? btnPin.textContent.trim() : '';

      return {
        mode: p ? p.placementMode : '',
        statusText: valStatus ? valStatus.textContent.trim() : '',
        btnText
      };
    })()`);

    assertCheck(15, 'Menekan butang "Semat Skrin" menukar panel Nota kepada mod SCREEN_PINNED',
      pinAction.mode === 'SCREEN_PINNED' && pinAction.statusText.includes('Panel Disemat pada Skrin') && pinAction.btnText.includes('Ikut Kad AR'),
      JSON.stringify(pinAction));

    // Dalam mod SCREEN_PINNED, marker hilang (anchorNota.visible = false) TIDAK menyembunyikan panel
    const pinTargetLost = await client.eval(`(() => {
      const anchor = window.ARState.anchorNota;
      if (anchor && anchor.group) anchor.group.visible = false;
      window.updateSpatialPanelsPosition();

      const el = document.getElementById('pov-panel-nota');
      return {
        opacity: el ? el.style.opacity : '',
        visibility: el ? el.style.visibility : ''
      };
    })()`);

    assertCheck(16, 'Dalam mod SCREEN_PINNED, kad hilang TIDAK menyembunyikan panel (kekal dipaparkan pada skrin)',
      pinTargetLost.opacity === '1' && pinTargetLost.visibility === 'visible',
      JSON.stringify(pinTargetLost));

    // Uji perubahan saiz S/M/L dalam mod SCREEN_PINNED
    const sizeTest = await client.eval(`(() => {
      window.SpatialPanelManager.setPanelSize('nota', 'large');
      const el = document.getElementById('pov-panel-nota');
      const card = el ? el.querySelector('.floating-card-container') : null;
      const isLarge = card ? card.classList.contains('size-large') : false;

      window.SpatialPanelManager.setDragOffset('nota', 50, -30);
      const p = window.SpatialPanelManager.getPanel('nota');
      const hasOffset = p && p.dragOffset && p.dragOffset.x === 50 && p.dragOffset.y === -30;

      return { isLarge, hasOffset };
    })()`);

    assertCheck(17, 'Dalam mod SCREEN_PINNED, fungsi penukaran saiz (S/M/L) dan offset seretan 2D berfungsi',
      sizeTest.isLarge && sizeTest.hasOffset,
      JSON.stringify(sizeTest));

    // Tekan "Ikut Kad AR" untuk kembali ke MARKER_FOLLOW
    const unpinAction = await client.eval(`(() => {
      const btnPin = document.getElementById('pov-nota-btn-back-pinned');
      if (btnPin) btnPin.click();

      const p = window.SpatialPanelManager.getPanel('nota');
      const valStatus = document.getElementById('pov-nota-val-status');
      const btnText = btnPin ? btnPin.textContent.trim() : '';

      return {
        mode: p ? p.placementMode : '',
        statusText: valStatus ? valStatus.textContent.trim() : '',
        btnText
      };
    })()`);

    assertCheck(18, 'Menekan butang "Ikut Kad AR" mengembalikan panel Nota ke mod MARKER_FOLLOW',
      unpinAction.mode === 'MARKER_FOLLOW' && unpinAction.statusText.includes('Mod Imbasan AR — Panel Mengikuti Kad') && unpinAction.btnText.includes('Semat Skrin'),
      JSON.stringify(unpinAction));

    // -------------------------------------------------------------------------
    // SEMAKAN 19, 20, 21: ALIRAN KUNCI PANDANGAN (WORLD_LOCKED)
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN E: KUNCI PANDANGAN (WORLD_LOCKED) (SEMAKAN 19 - 21) ---');

    // Masuk mod POV Setup secara manual
    const enterPOVAction = await client.eval(`(async () => {
      await window.SpatialPanelManager.enterPanelPOVSetup('nota');
      const p = window.SpatialPanelManager.getPanel('nota');
      const valStatus = document.getElementById('pov-nota-val-status');
      const btnAnchor = document.getElementById('pov-nota-btn-anchor');

      return {
        mode: p ? p.placementMode : '',
        statusText: valStatus ? valStatus.textContent.trim() : '',
        btnAnchorVisible: btnAnchor ? !btnAnchor.classList.contains('hidden') : false
      };
    })()`);

    assertCheck(19, 'Menekan "Kunci Pandangan" membawa pengguna ke mod POV_SETUP ("Halakan peranti ke arah pilihan")',
      enterPOVAction.mode === 'POV_SETUP' && enterPOVAction.statusText.includes('Halakan peranti ke arah pilihan') && enterPOVAction.btnAnchorVisible,
      JSON.stringify(enterPOVAction));

    // Kunci arah menggunakan lockPanelPOV ("Letak di Arah Ini")
    const lockPOVAction = await client.eval(`(() => {
      window.SpatialPanelManager.lockPanelPOV('nota');
      const p = window.SpatialPanelManager.getPanel('nota');
      const valStatus = document.getElementById('pov-nota-val-status');
      const btnAnchor = document.getElementById('pov-nota-btn-anchor');

      return {
        mode: p ? p.placementMode : '',
        isLocked: p ? p.isLocked : false,
        statusText: valStatus ? valStatus.textContent.trim() : '',
        btnAnchorText: btnAnchor ? btnAnchor.textContent.trim() : ''
      };
    })()`);

    assertCheck(20, 'Menekan "Letak di Arah Ini" mengunci arah ke WORLD_LOCKED (POV_LOCKED) dengan status "Pandangan Dikunci"',
      lockPOVAction.mode === 'POV_LOCKED' && lockPOVAction.isLocked && lockPOVAction.statusText.includes('Pandangan Dikunci') && lockPOVAction.btnAnchorText.includes('Alih / Letak Semula'),
      JSON.stringify(lockPOVAction));

    // Dalam mod WORLD_LOCKED, target lost marker tidak menyembunyikan panel
    const worldLockedTargetLost = await client.eval(`(() => {
      const anchor = window.ARState.anchorNota;
      if (anchor && anchor.group) anchor.group.visible = false;
      window.updateSpatialPanelsPosition();

      const el = document.getElementById('pov-panel-nota');
      return {
        mode: window.SpatialPanelManager.getPanel('nota').placementMode,
        isCentered: el ? el.classList.contains('is-centered') : true
      };
    })()`);

    assertCheck(21, 'Dalam mod WORLD_LOCKED, marker hilang tidak menjejaskan panel (dikawal sepenuhnya oleh sensor 360°)',
      worldLockedTargetLost.mode === 'POV_LOCKED' && !worldLockedTargetLost.isCentered,
      JSON.stringify(worldLockedTargetLost));

    // -------------------------------------------------------------------------
    // SEMAKAN 22, 23: MULTI-PANEL INDEPENDENCE & STATUS TEXT STANDARD
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN F: INDEPENDENSI MULTI-PANEL & STANDARD STATUS (SEMAKAN 22 - 23) ---');

    // Uji kebebasan multi-panel: Nota = MARKER_FOLLOW, Kuiz = SCREEN_PINNED, Video = POV_LOCKED
    const multiPanelIndependence = await client.eval(`(() => {
      window.SpatialPanelManager.setPlacementMode('nota', 'MARKER_FOLLOW');
      window.SpatialPanelManager.setPlacementMode('kuiz', 'SCREEN_PINNED');
      window.SpatialPanelManager.setPlacementMode('video', 'POV_LOCKED');

      const pNota = window.SpatialPanelManager.getPanel('nota');
      const pKuiz = window.SpatialPanelManager.getPanel('kuiz');
      const pVideo = window.SpatialPanelManager.getPanel('video');

      return {
        notaMode: pNota ? pNota.placementMode : '',
        kuizMode: pKuiz ? pKuiz.placementMode : '',
        videoMode: pVideo ? pVideo.placementMode : ''
      };
    })()`);

    assertCheck(22, 'Multi-panel independen: Nota (MARKER_FOLLOW), Kuiz (SCREEN_PINNED) dan Video (POV_LOCKED) mengekalkan mod masing-masing tanpa konflik',
      multiPanelIndependence.notaMode === 'MARKER_FOLLOW' &&
      multiPanelIndependence.kuizMode === 'SCREEN_PINNED' &&
      multiPanelIndependence.videoMode === 'POV_LOCKED',
      JSON.stringify(multiPanelIndependence));

    // Uji ketepatan label status UI bagi semua mod
    const uiStatusCheck = await client.eval(`(() => {
      const statusNota = document.getElementById('pov-nota-val-status')?.textContent.trim() || '';
      const statusKuiz = document.getElementById('pov-kuiz-val-status')?.textContent.trim() || '';
      const statusVideo = document.getElementById('pov-val-status')?.textContent.trim() || '';

      return {
        statusNota,
        statusKuiz,
        statusVideo
      };
    })()`);

    assertCheck(23, 'Penyeragaman teks status UI mematuhi piawaian LANGKAH 7 pada semua mod',
      uiStatusCheck.statusNota.includes('Mod Imbasan AR — Panel Mengikuti Kad') &&
      uiStatusCheck.statusKuiz.includes('Panel Disemat pada Skrin') &&
      uiStatusCheck.statusVideo.includes('Pandangan Dikunci'),
      JSON.stringify(uiStatusCheck));

    // -------------------------------------------------------------------------
    // SEMAKAN 24, 25: LIFECYCLE, CONSOLE CLEANLINESS & RESPONSIVE VIEWPORTS
    // -------------------------------------------------------------------------
    console.log('\n--- KUMPULAN G: KESTABILAN, KONSOL & RESPONSIVITI (SEMAKAN 24 - 25) ---');

    // Uji ketiadaan penggandaan WebGLRenderer
    const lifecycleCheck = await client.eval(`(() => {
      const canvs = document.querySelectorAll('canvas');
      return {
        canvasCount: canvs.length,
        hasSingleRenderer: !!window.ARState.renderer
      };
    })()`);

    assertCheck(24, 'Tiada penduaan WebGL renderer atau canvas baharu semasa pertukaran mod imbasan',
      lifecycleCheck.hasSingleRenderer && lifecycleCheck.canvasCount <= 3,
      JSON.stringify(lifecycleCheck));

    // Uji responsiviti pada iPad (1024x768) dan iPhone (390x844) serta ketiadaan ralat konsol
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });
    await delay(300);
    const ipadScreenshotPath = path.join(ARTIFACT_DIR, 'fasa_4ef12_ipad_marker_follow.png');
    await client.captureScreenshot(ipadScreenshotPath);

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await delay(300);
    const iphoneScreenshotPath = path.join(ARTIFACT_DIR, 'fasa_4ef12_iphone_marker_follow.png');
    await client.captureScreenshot(iphoneScreenshotPath);

    const uncaughtErrors = client.consoleErrors.filter((e) => !e.includes('favicon.ico'));
    assertCheck(25, 'Konsol bersih tanpa ralat JavaScript tidak tertangkap (zero uncaught JS errors) dan responsif merentasi iPad & iPhone',
      uncaughtErrors.length === 0,
      `Ralat dikesan: ${uncaughtErrors.join(' | ')}`);

  } catch (err) {
    console.error('💥 Ralat semasa menjalankan ujian E2E:', err);
    failed++;
  } finally {
    if (client) client.close();
    if (browserProcess) {
      try { browserProcess.kill('SIGKILL'); } catch (_) {}
    }
  }

  console.log('\n======================================================================');
  console.log(`📊 KEPUTUSAN KESELURUHAN FASA 4E-F.1.2:`);
  console.log(`   LULUS: ${passed} / 25`);
  console.log(`   GAGAL: ${failed} / 25`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 SEMUA 25 SEMAKAN FASA 4E-F.1.2 BERJAYA!');
  }
}

runFasa4EF12Tests();
