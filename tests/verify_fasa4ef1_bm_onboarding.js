/**
 * ARSELNEL — FASA 4E-F.1 E2E VERIFICATION SUITE (25 CHECKS)
 * Menguji Penyeragaman Bahasa Melayu, Onboarding 6 Langkah, Panduan Imbasan,
 * Panduan Selepas Pengesanan Kad AR, Panduan 5 Langkah Kunci Pandangan,
 * Ketahanan Storan, Kitaran Hayat Kamera MindAR & Susun Atur Responsif (iPad/iPhone).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const KOTAK_URL = `${BASE_URL}/kotak_arselnel/code.html`;
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const CDP_PORT = 9335;

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
    this.events = [];
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
        } else if (msg.method) {
          this.events.push(msg);
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
    try { this.ws && this.ws.close(); } catch (_) {}
  }
}

async function waitForCondition(client, expr, timeoutMs = 20000, pollMs = 150) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await client.eval(expr);
      if (ok) return true;
    } catch (_) {}
    await delay(pollMs);
  }
  return false;
}

async function run() {
  const browserBin = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-f4ef1-'));
  const proc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1024,768',
    '--disable-gpu-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank'
  ], { stdio: 'ignore' });

  const checks = [];
  function record(id, label, pass, detail = '') {
    checks.push({ id, label, pass: !!pass, detail });
    console.log(`${pass ? '✅ LULUS' : '❌ GAGAL'} [${id}/25] ${label}${detail ? ' — ' + detail : ''}`);
  }

  let client = null;
  try {
    const targets = await waitForCDP(CDP_PORT);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    const pageErrors = [];
    client.events = [];
    const origOnMessage = client.ws.onmessage;
    client.ws.onmessage = (evt) => {
      origOnMessage(evt);
      try {
        const msg = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.data.toString());
        if (msg.method === 'Runtime.exceptionThrown') {
          pageErrors.push(msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'Exception');
        }
      } catch (_) {}
    };

    // Mock user session without onboarding key so first load sees New User Onboarding
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        (() => {
          const u = { id: 'student-f4ef1', full_name: 'Amira F4EF1', nama: 'Amira F4EF1', kelas: '1 Bestari', role: 'student' };
          try {
            localStorage.setItem('arselnel_session', JSON.stringify({ user: u }));
            localStorage.setItem('arselnel_current_user', JSON.stringify(u));
          } catch (_) {}
        })();
      `
    });

    await client.setViewport(1024, 768, true);

    // -----------------------------------------------------------------------
    // 1. Page load HTTP 200 & zero fatal page errors
    // -----------------------------------------------------------------------
    await client.send('Page.navigate', { url: KOTAK_URL });
    const loaded = await waitForCondition(client, "!!(window.KotakARSELNEL && document.getElementById('kotak-onboarding-backdrop'))", 25000);
    await delay(400);
    record(1, 'Halaman Kotak ARSELNEL dimuat tanpa ralat kritikal', loaded && pageErrors.length === 0, `errors=${pageErrors.length}`);

    // -----------------------------------------------------------------------
    // 2. Top HUD Bahasa Melayu Standardization
    // -----------------------------------------------------------------------
    const hudAudit = await client.eval(`(() => {
      const back = document.getElementById('back-hud-text')?.textContent.trim();
      const badge = document.getElementById('ar-title-badge-text')?.textContent.trim();
      const markerBtn = document.getElementById('btn-open-marker')?.textContent.replace(/\\s+/g, ' ').trim();
      const guideBtn = document.getElementById('btn-open-user-guide')?.textContent.replace(/\\s+/g, ' ').trim();
      const bodyHud = document.querySelector('.ar-top-hud')?.textContent || '';
      return {
        back, badge, markerBtn, guideBtn,
        hasDashboard: /Dashboard/i.test(bodyHud)
      };
    })()`);
    record(2, 'Top HUD diseragamkan sepenuhnya kepada Bahasa Melayu',
      hudAudit.back === 'Kembali ke ARSELNEL' &&
      hudAudit.badge.includes('KOTAK ARSELNEL') &&
      hudAudit.markerBtn.includes('Papar Kad AR') &&
      hudAudit.guideBtn.includes('Panduan Pengguna') &&
      !hudAudit.hasDashboard,
      JSON.stringify(hudAudit)
    );

    // -----------------------------------------------------------------------
    // 3. First-time visitor sees 6-step Onboarding Modal at 1/6
    // -----------------------------------------------------------------------
    const onbStep1 = await client.eval(`(() => {
      const bd = document.getElementById('kotak-onboarding-backdrop');
      const open = bd && !bd.classList.contains('hidden');
      const title = document.getElementById('onboarding-title')?.textContent.trim();
      const prog = document.getElementById('onboarding-progress-text')?.textContent.trim();
      const prevHidden = document.getElementById('btn-onboarding-prev')?.classList.contains('hidden');
      return { open, title, prog, prevHidden };
    })()`);
    await client.screenshot('fasa_4ef1_onboarding_ipad_1024x768.png');
    record(3, 'Pengguna baharu dipaparkan Modal Onboarding 6 langkah (1/6)',
      onbStep1.open && onbStep1.title === 'Selamat Datang ke Kotak ARSELNEL!' && onbStep1.prog === '1/6' && onbStep1.prevHidden,
      JSON.stringify(onbStep1)
    );

    // -----------------------------------------------------------------------
    // 4. Camera & MindAR NOT initialized before onboarding ends
    // -----------------------------------------------------------------------
    const preCam = await client.eval(`(() => ({
      mindarThree: window.ARState ? window.ARState.mindarThree : 'NA',
      cameraActive: window.ARState ? window.ARState.cameraActive : 'NA',
      mindarInitCount: window.ARState ? window.ARState.mindarInitCount : -1
    }))()`);
    record(4, 'Kamera dan MindAR tidak dimulakan sebelum onboarding selesai',
      preCam.mindarThree === null && preCam.cameraActive === false && preCam.mindarInitCount === 0,
      JSON.stringify(preCam)
    );

    // -----------------------------------------------------------------------
    // 5. Onboarding navigation 1/6 -> 6/6, Back & Mula Mengimbas button
    // -----------------------------------------------------------------------
    const navAudit = await client.eval(`(() => {
      const titles = [];
      for (let i = 0; i < 5; i++) {
        document.getElementById('btn-onboarding-next').click();
        titles.push({
          prog: document.getElementById('onboarding-progress-text').textContent.trim(),
          title: document.getElementById('onboarding-title').textContent.trim(),
          prevHidden: document.getElementById('btn-onboarding-prev').classList.contains('hidden'),
          nextHidden: document.getElementById('btn-onboarding-next').classList.contains('hidden'),
          startHidden: document.getElementById('btn-onboarding-start').classList.contains('hidden'),
          startText: document.getElementById('btn-onboarding-start').textContent.trim()
        });
      }
      document.getElementById('btn-onboarding-prev').click();
      const backStep = document.getElementById('onboarding-progress-text').textContent.trim();
      document.getElementById('btn-onboarding-next').click();
      const last = titles[titles.length - 1];
      return { count: titles.length, last, backStep };
    })()`);
    record(5, 'Navigasi Seterusnya/Kembali dan butang "Mula Mengimbas" pada langkah 6/6 berfungsi',
      navAudit.count === 5 && navAudit.last.prog === '6/6' && !navAudit.last.prevHidden && navAudit.last.nextHidden && !navAudit.last.startHidden && navAudit.last.startText === 'Mula Mengimbas' && navAudit.backStep === '5/6',
      JSON.stringify(navAudit)
    );

    // -----------------------------------------------------------------------
    // 6. Clicking "Mula Mengimbas" closes onboarding, saves storage, & starts MindAR once
    // -----------------------------------------------------------------------
    await client.eval(`document.getElementById('btn-onboarding-start').click();`);
    const camStarted = await waitForCondition(client, "window.ARState && window.ARState.mindarInitCount >= 1 && window.ARState.cameraActive === true && !!window.ARState.mindarThree && document.getElementById('loading-screen')?.classList.contains('hidden')", 30000);
    await delay(250);
    const postStart = await client.eval(`(() => ({
      stored: localStorage.getItem('arselnel_kotak_onboarding_v1'),
      modalHidden: document.getElementById('kotak-onboarding-backdrop')?.classList.contains('hidden'),
      mindarInitCount: window.ARState?.mindarInitCount,
      cameraActive: window.ARState?.cameraActive,
      hasMindar: !!window.ARState?.mindarThree
    }))()`);
    record(6, 'Klik "Mula Mengimbas" menyimpan status & memulakan kamera MindAR',
      camStarted && postStart.stored === 'completed' && postStart.modalHidden && postStart.mindarInitCount === 1 && postStart.cameraActive === true && postStart.hasMindar,
      JSON.stringify(postStart)
    );

    // -----------------------------------------------------------------------
    // 7. Skipping onboarding ("Langkau") works from fresh state
    // -----------------------------------------------------------------------
    await client.eval(`localStorage.removeItem('arselnel_kotak_onboarding_v1');`);
    await client.send('Page.reload', { ignoreCache: true });
    await waitForCondition(client, "window.KotakARSELNEL && !document.getElementById('kotak-onboarding-backdrop').classList.contains('hidden')", 15000);
    await client.eval(`document.getElementById('btn-onboarding-skip').click();`);
    const skippedReady = await waitForCondition(client, "window.ARState && window.ARState.mindarInitCount >= 1 && localStorage.getItem('arselnel_kotak_onboarding_v1') === 'completed' && document.getElementById('loading-screen')?.classList.contains('hidden')", 30000);
    record(7, 'Butang "Langkau" menutup onboarding, menyimpan status & memulakan imbasan', skippedReady);

    // -----------------------------------------------------------------------
    // 8. Storage exception resilience (Private Safari Mode fallback)
    // -----------------------------------------------------------------------
    const memFallbackOk = await client.eval(`(() => {
      const origGet = Storage.prototype.getItem;
      const origSet = Storage.prototype.setItem;
      let errCount = 0;
      try {
        Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
        Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
        window.KotakARSELNEL.openOnboardingModal(0);
        window.KotakARSELNEL.nextOnboardingStep();
        window.KotakARSELNEL.finishOnboarding();
      } catch (e) {
        errCount++;
      } finally {
        Storage.prototype.getItem = origGet;
        Storage.prototype.setItem = origSet;
      }
      return { errCount, memDone: window.KotakARSELNEL.hasCompletedOnboarding() };
    })()`);
    record(8, 'Ketahanan storan localStorage disekat menggunakan fallback memori tanpa ralat',
      memFallbackOk.errCount === 0 && memFallbackOk.memDone === true,
      JSON.stringify(memFallbackOk)
    );

    // -----------------------------------------------------------------------
    // 9. Returning user skips onboarding modal & starts MindAR directly
    // -----------------------------------------------------------------------
    await client.eval(`localStorage.setItem('arselnel_kotak_onboarding_v1', 'completed');`);
    await client.send('Page.reload', { ignoreCache: true });
    const returningReady = await waitForCondition(client, "window.ARState && window.ARState.mindarInitCount >= 1 && !!window.ARState.mindarThree && document.getElementById('loading-screen')?.classList.contains('hidden')", 30000);
    const modalStayedHidden = await client.eval(`document.getElementById('kotak-onboarding-backdrop')?.classList.contains('hidden')`);
    record(9, 'Pengguna berulang terus memulakan MindAR tanpa modal onboarding automatik',
      returningReady && modalStayedHidden === true
    );

    // -----------------------------------------------------------------------
    // 10. Reopening Panduan Pengguna mid-session does NOT double-init MindAR
    // -----------------------------------------------------------------------
    const countBeforeReopen = await client.eval(`window.ARState.mindarInitCount`);
    await client.eval(`document.getElementById('btn-open-user-guide').click();`);
    await delay(150);
    const reopenedAt1 = await client.eval(`!document.getElementById('kotak-onboarding-backdrop').classList.contains('hidden') && document.getElementById('onboarding-progress-text').textContent.trim() === '1/6'`);
    await client.eval(`document.getElementById('btn-onboarding-skip').click();`);
    await delay(200);
    const countAfterClose = await client.eval(`window.ARState.mindarInitCount`);
    record(10, 'Membuka semula "Panduan Pengguna" tidak menginisialisasi MindAR dua kali',
      reopenedAt1 && countAfterClose === countBeforeReopen,
      `before=${countBeforeReopen}, after=${countAfterClose}`
    );

    // -----------------------------------------------------------------------
    // 11. Scanning Guidance Overlay text inside #scanner-overlay
    // -----------------------------------------------------------------------
    const scanBanner = await client.eval(`(() => ({
      visible: !document.getElementById('scanner-overlay')?.classList.contains('hidden'),
      title: document.getElementById('scanner-guide-title')?.textContent.trim(),
      subtitle: document.getElementById('scanner-guide-subtitle')?.textContent.trim(),
      prompt: document.getElementById('scanner-prompt-text')?.textContent.trim()
    }))()`);
    record(11, 'Sepanduk Panduan Imbasan memaparkan arahan Bahasa Melayu yang jelas',
      scanBanner.visible && scanBanner.title === 'Sedia untuk Mengimbas!' && scanBanner.subtitle.includes('kad AR') && scanBanner.prompt.includes('Kad AR'),
      JSON.stringify(scanBanner)
    );

    // -----------------------------------------------------------------------
    // 12. Delayed Scanning Tips appear cleanly with all 4 tips
    // -----------------------------------------------------------------------
    await client.eval(`window.KotakARSELNEL.showScannerDelayedTips();`);
    await delay(150);
    const tipsCheck = await client.eval(`(() => {
      const box = document.getElementById('scanner-tips-box');
      const items = Array.from(box.querySelectorAll('li')).map(li => li.textContent.trim());
      return { visible: !box.classList.contains('hidden'), items };
    })()`);
    await client.screenshot('fasa_4ef1_scanner_tips_ipad_1024x768.png');
    record(12, 'Tip imbasan tertunda memaparkan keempat-empat petua asas BM',
      tipsCheck.visible && tipsCheck.items.length === 4 &&
      tipsCheck.items.some(t => t.includes('terlalu jauh')) &&
      tipsCheck.items.some(t => t.includes('pantulan cahaya')) &&
      tipsCheck.items.some(t => t.includes('keseluruhan corak')) &&
      tipsCheck.items.some(t => t.includes('stabil')),
      JSON.stringify(tipsCheck)
    );

    // -----------------------------------------------------------------------
    // 13 & 14. Post-detection Guidance across modules & dismiss button
    // -----------------------------------------------------------------------
    await client.eval(`window.handleTargetFound(0, 'video');`);
    await delay(200);
    const postVid = await client.eval(`(() => ({
      tipsHidden: document.getElementById('scanner-tips-box')?.classList.contains('hidden'),
      postVisible: !document.getElementById('ar-post-detection-guide')?.classList.contains('hidden'),
      title: document.getElementById('post-detect-title')?.textContent.trim(),
      sub: document.getElementById('post-detect-subtitle')?.textContent.trim()
    }))()`);
    await client.screenshot('fasa_4ef1_post_detect_ipad_1024x768.png');

    await client.eval(`window.KotakARSELNEL.showPostDetectionGuide('nota');`);
    const postNotaSub = await client.eval(`document.getElementById('post-detect-subtitle')?.textContent.trim()`);
    await client.eval(`window.KotakARSELNEL.showPostDetectionGuide('orientasi_dunia');`);
    const postOrientSub = await client.eval(`document.getElementById('post-detect-subtitle')?.textContent.trim()`);
    record(13, 'Panduan Selepas Pengesanan Kad AR berfungsi untuk modul & menyembunyikan tip imbasan',
      postVid.tipsHidden && postVid.postVisible && postVid.title === 'Kad AR Berjaya Dikesan!' &&
      postNotaSub.includes('nota') && postOrientSub.includes('8 stesen organel')
    );

    await client.eval(`document.getElementById('btn-dismiss-post-detect').click();`);
    await delay(100);
    const postDismissed = await client.eval(`document.getElementById('ar-post-detection-guide')?.classList.contains('hidden')`);
    record(14, 'Butang "Fahami" menutup Sepanduk Selepas Pengesanan secara serta-merta', postDismissed === true);

    // -----------------------------------------------------------------------
    // 15. CellQuest HUD, Floating Card & POV Panels Bahasa Melayu consistency
    // -----------------------------------------------------------------------
    const uiBmAudit = await client.eval(`(() => {
      const cqBack = document.querySelector('#cq-hud-btn-back .cq-btn-label')?.textContent.trim();
      const cqPov = document.getElementById('cq-pov-label')?.textContent.trim();
      const cqReset = document.querySelector('#cq-btn-reset .cq-action-label')?.textContent.trim();
      const floatTrack = document.getElementById('tracking-status-text')?.textContent.trim();
      const povChip = document.querySelector('#pov-telemetry-hud-strip .hud-chip-label')?.textContent.trim();
      const ptr = document.querySelector('#pov-offscreen-pointer .pointer-label')?.textContent.trim();
      return { cqBack, cqPov, cqReset, floatTrack, povChip, ptr };
    })()`);
    record(15, 'Label CellQuest HUD, Panel Terapung, Kunci Pandangan & Penuding Luar Skrin dalam BM',
      uiBmAudit.cqBack === 'Tukar Kad AR' &&
      uiBmAudit.cqPov === 'Kunci Pandangan' &&
      uiBmAudit.cqReset === 'Set Semula' &&
      uiBmAudit.floatTrack === 'Kad AR Dikesan' &&
      uiBmAudit.povChip === 'Arah:' &&
      uiBmAudit.ptr === 'SASARAN PANEL TERKUNCI',
      JSON.stringify(uiBmAudit)
    );

    // -----------------------------------------------------------------------
    // 16. Kuiz & Permainan Catalog uses Mata / Kejar Arked 2D (no pts/Arcade)
    // -----------------------------------------------------------------------
    const gamesAudit = await client.eval(`(() => {
      const games = window.ARState?.games || [];
      const joined = games.map(g => (g.points || '') + ' ' + (g.typeBadge || '')).join(' | ');
      return {
        count: games.length,
        hasMata: joined.includes('Mata'),
        hasKejar: joined.includes('Kejar Arked 2D'),
        hasPts: /\\bpts\\b/i.test(joined),
        hasArcade: /Arcade/i.test(joined)
      };
    })()`);
    record(16, 'Katalog Permainan Kuiz menggunakan istilah "Mata" & "Kejar Arked 2D"',
      gamesAudit.count === 5 && gamesAudit.hasMata && gamesAudit.hasKejar && !gamesAudit.hasPts && !gamesAudit.hasArcade,
      JSON.stringify(gamesAudit)
    );

    // -----------------------------------------------------------------------
    // 17. Diagnostics Drawer & Exit Modal Bahasa Melayu labels
    // -----------------------------------------------------------------------
    const diagExit = await client.eval(`(() => {
      window.KotakARSELNEL.updateDiagnosticsData();
      const mindStat = document.getElementById('diag-marker-mind-status')?.textContent.trim();
      const exitDesc = document.querySelector('.exit-modal-desc')?.textContent.trim();
      const exitConfirm = document.getElementById('btn-exit-confirm')?.textContent.trim();
      return { mindStat, exitDesc, exitConfirm };
    })()`);
    record(17, 'Laci Diagnostik & Modal Keluar menggunakan istilah Bahasa Melayu yang tepat',
      diagExit.mindStat === '7 Sasaran (0-6 Sedia)' &&
      diagExit.exitDesc.includes('Halaman Utama ARSELNEL') &&
      diagExit.exitConfirm === 'Keluar ke Halaman Utama',
      JSON.stringify(diagExit)
    );

    // -----------------------------------------------------------------------
    // 18. Intro Panels (Target 5 & Target 6) preserve titles & feature counts + BM labels
    // -----------------------------------------------------------------------
    const intros = await client.eval(`(() => {
      const jTitle = document.getElementById('jelajah3d-intro-title')?.textContent.trim();
      const jCount = document.querySelectorAll('#jelajah3d-intro-features .jelajah3d-intro-feature-item').length;
      const oTitle = document.getElementById('orientasi-intro-title')?.textContent.trim();
      const oCount = document.querySelectorAll('.orientasi-intro-features .orientasi-intro-feature-item').length;
      const oText = document.getElementById('orientasi-dunia-marker-intro-backdrop')?.textContent || '';
      return { jTitle, jCount, oTitle, oCount, hasRadarPintar: oText.includes('Radar Pintar') };
    })()`);
    record(18, 'Panel Pengenalan Sasaran 5 & 6 mengekalkan keserasian regresi dengan istilah BM',
      intros.jTitle === 'MAKMAL EKSPLORASI 3D' && intros.jCount === 4 &&
      intros.oTitle.includes('AR ORIENTASI DUNIA') && intros.oCount === 6 && intros.hasRadarPintar,
      JSON.stringify(intros)
    );

    // -----------------------------------------------------------------------
    // 19 & 20. 5-step Interactive POV Guide triggers on first spatial open & persists
    // -----------------------------------------------------------------------
    await client.eval(`localStorage.removeItem('arselnel_kotak_pov_guide_v1'); window.KotakARSELNEL.placeVideoOnScreen(false);`);
    await delay(200);
    const povStepCheck = await client.eval(`(() => {
      const box = document.getElementById('ar-pov-interactive-guide');
      const visible = box && !box.classList.contains('hidden');
      const b1 = document.getElementById('pov-guide-step-badge')?.textContent.trim();
      const t1 = document.getElementById('pov-guide-title')?.textContent.trim();
      const steps = [b1];
      for (let i = 0; i < 4; i++) {
        document.getElementById('btn-pov-guide-next').click();
        steps.push(document.getElementById('pov-guide-step-badge')?.textContent.trim());
      }
      const nextLabel5 = document.getElementById('btn-pov-guide-next')?.textContent.trim();
      return { visible, t1, steps, nextLabel5 };
    })()`);
    await client.screenshot('fasa_4ef1_pov_guide_ipad_1024x768.png');
    await client.eval(`document.getElementById('btn-pov-guide-next').click();`);
    await delay(150);
    const povSaved = await client.eval(`(() => ({
      hiddenAfterFinish: document.getElementById('ar-pov-interactive-guide')?.classList.contains('hidden'),
      stored: localStorage.getItem('arselnel_kotak_pov_guide_v1')
    }))()`);
    record(19, 'Panduan 5 Langkah Kunci Pandangan terbuka pada mod spatial pertama (1/5..5/5)',
      povStepCheck.visible && povStepCheck.t1.includes('Semat Skrin') && povStepCheck.steps.join(',') === 'Langkah 1/5,Langkah 2/5,Langkah 3/5,Langkah 4/5,Langkah 5/5' && povStepCheck.nextLabel5 === 'Selesai',
      JSON.stringify(povStepCheck)
    );
    record(20, 'Menamatkan Panduan Kunci Pandangan menyimpan status & tidak muncul semula',
      povSaved.hiddenAfterFinish === true && povSaved.stored === 'completed',
      JSON.stringify(povSaved)
    );

    // -----------------------------------------------------------------------
    // 21. POV rotation & anchor math untouched
    // -----------------------------------------------------------------------
    const povMath = await client.eval(`(() => {
      const dPlus = window.KotakARSELNEL.shortestAngleDelta(10, 350);
      const dMinus = window.KotakARSELNEL.shortestAngleDelta(350, 10);
      window.KotakARSELNEL.applySimAngles(25, -10);
      return { dPlus, dMinus, yaw: window.ARState?.pov?.currentYaw, pitch: window.ARState?.pov?.currentPitch };
    })()`);
    record(21, 'Kiraan sudut 3DoF POV dan kawalan simulasi kekal berfungsi tepat',
      Math.abs(povMath.dPlus - 20) < 0.001 && Math.abs(povMath.dMinus + 20) < 0.001 && Number.isFinite(povMath.yaw),
      JSON.stringify(povMath)
    );

    // -----------------------------------------------------------------------
    // 22. Only 1 Three.js canvas inside #ar-container (zero extra WebGL renderers)
    // -----------------------------------------------------------------------
    const canvasCount = await client.eval(`document.querySelectorAll('#ar-container canvas').length`);
    record(22, 'Tiada renderer Three.js/WebGL tambahan dicipta oleh modul panduan', canvasCount <= 1, `canvases=${canvasCount}`);

    // -----------------------------------------------------------------------
    // 23. Touch Targets >= 44x44px on interactive guide & HUD buttons
    // -----------------------------------------------------------------------
    await client.eval(`window.KotakARSELNEL.openOnboardingModal(0);`);
    await delay(150);
    const targetSizes = await client.eval(`(() => {
      const ids = ['btn-back-dashboard', 'btn-open-marker', 'btn-open-user-guide', 'btn-onboarding-skip', 'btn-onboarding-next'];
      return ids.map(id => {
        const el = document.getElementById(id);
        const r = el ? el.getBoundingClientRect() : { width: 0, height: 0 };
        return { id, w: Math.round(r.width), h: Math.round(r.height) };
      });
    })()`);
    record(23, 'Semua butang utama HUD & Onboarding memenuhi sasaran sentuh minimum >= 44px',
      targetSizes.every(t => t.w >= 44 && t.h >= 44),
      JSON.stringify(targetSizes)
    );

    // -----------------------------------------------------------------------
    // 24. Responsive & Zero-Overlap Verification: iPad Landscape 1024x768
    // -----------------------------------------------------------------------
    await client.eval(`document.getElementById('btn-onboarding-skip').click();`);
    await client.eval(`
      if (window.ARState && window.ARState.activePanels) {
        Array.from(window.ARState.activePanels).forEach(m => window.KotakARSELNEL.handlePanelClosed(m));
      }
      window.KotakARSELNEL.showScannerDelayedTips();
    `);
    await delay(200);
    const ipadLayout = await client.eval(`(() => {
      const hud = document.querySelector('.ar-top-hud')?.getBoundingClientRect();
      const banner = document.getElementById('scanner-guide-banner')?.getBoundingClientRect();
      const tips = document.getElementById('scanner-tips-box')?.getBoundingClientRect();
      const noOverflow = document.documentElement.scrollWidth <= window.innerWidth;
      const overlapHudBanner = (hud && banner) ? !(hud.bottom <= banner.top + 2) : false;
      return { noOverflow, overlapHudBanner, hudH: hud ? Math.round(hud.height) : 0, bannerTop: banner ? Math.round(banner.top) : 0 };
    })()`);
    record(24, 'Susun atur responsif iPad Landskap (1024x768) bebas limpahan dan pertindihan HUD',
      ipadLayout.noOverflow && !ipadLayout.overlapHudBanner,
      JSON.stringify(ipadLayout)
    );

    // -----------------------------------------------------------------------
    // 25. Responsive & Zero-Overlap Verification: iPhone Portrait 390x844
    // -----------------------------------------------------------------------
    await client.setViewport(390, 844, true);
    await client.eval(`window.KotakARSELNEL.openOnboardingModal(0);`);
    await delay(250);
    await client.screenshot('fasa_4ef1_onboarding_iphone_390x844.png');
    await client.eval(`document.getElementById('btn-onboarding-skip').click(); window.KotakARSELNEL.showScannerDelayedTips();`);
    await delay(250);
    await client.screenshot('fasa_4ef1_scanner_iphone_390x844.png');
    await client.eval(`window.KotakARSELNEL.showPostDetectionGuide('video'); window.KotakARSELNEL.showPOVInteractiveGuide(0);`);
    await delay(250);
    await client.screenshot('fasa_4ef1_guides_iphone_390x844.png');
    const iphoneLayout = await client.eval(`(() => {
      const hud = document.querySelector('.ar-top-hud')?.getBoundingClientRect();
      const post = document.getElementById('ar-post-detection-guide')?.getBoundingClientRect();
      const povG = document.getElementById('ar-pov-interactive-guide')?.getBoundingClientRect();
      const noOverflow = document.documentElement.scrollWidth <= window.innerWidth;
      const hudClearPost = (hud && post && post.height > 0) ? (hud.bottom <= post.top + 2) : true;
      const postClearPov = (post && povG && povG.height > 0) ? (post.bottom <= povG.top + 2) : true;
      const povWithinScreen = (povG && povG.width > 0) ? (povG.left >= 0 && povG.right <= window.innerWidth) : true;
      const postWithinScreen = (post && post.width > 0) ? (post.left >= 0 && post.right <= window.innerWidth) : true;
      return {
        noOverflow,
        hudClearPost,
        postClearPov,
        povWithinScreen,
        postWithinScreen,
        hudBottom: hud ? Math.round(hud.bottom) : 0,
        postTop: post ? Math.round(post.top) : 0,
        postBottom: post ? Math.round(post.bottom) : 0,
        povTop: povG ? Math.round(povG.top) : 0,
        povRight: povG ? Math.round(povG.right) : 0
      };
    })()`);
    record(25, 'Susun atur responsif iPhone Potret (390x844) tanpa pertindihan atau terpotong HUD/Panduan',
      iphoneLayout.noOverflow && iphoneLayout.hudClearPost && iphoneLayout.postClearPov && iphoneLayout.povWithinScreen && iphoneLayout.postWithinScreen,
      JSON.stringify(iphoneLayout)
    );

    const passed = checks.filter(c => c.pass).length;
    console.log(`\n=== RINGKASAN FASA 4E-F.1: ${passed}/25 LULUS ===`);
    if (passed < 25) {
      process.exitCode = 1;
    }
  } finally {
    client && client.close();
    try { proc.kill(); } catch (_) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
  }
}

run().catch((err) => {
  console.error('❌ Ujian Fasa 4E-F.1 gagal dengan ralat:', err);
  process.exit(1);
});
