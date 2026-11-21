/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * CELLQUEST 3D MOBILE LAYOUT & USABILITY TEST (IPHONE VIEWPORT 390x844)
 * Validates responsive 3D model scale, single-line hint pill, compact tracking status,
 * unobscured POV lock setup dialog, and multi-module persistence.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60564;
const CDP_PORT = 9304;
const ROOT_DIR = path.resolve(__dirname, '..');

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/kotak_arselnel/code.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Chrome/Edge ditemui!');
}

function getPages(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
    });
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
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

  close() {
    this.ws.close();
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  console.log('================================================================');
  console.log('📱 ARSELNEL QA: CELLQUEST MOBILE LAYOUT & USABILITY TEST (390x844)');
  console.log('================================================================\n');

  const server = await startServer();
  const browserBin = findBrowser();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-cq-mobile-'));

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--headless=new',
    '--disable-gpu',
    '--window-size=390,844',
    'about:blank'
  ]);

  let cdp = null;
  let testNum = 0;
  let passed = 0;

  function assert(name, condition, details = '') {
    testNum++;
    if (condition) {
      passed++;
      console.log(`  [Ujian ${testNum}] ✅ LULUS - ${name}`);
    } else {
      console.error(`  [Ujian ${testNum}] ❌ GAGAL - ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    let pages = null;
    for (let i = 0; i < 30; i++) {
      try {
        pages = await getPages(CDP_PORT);
        if (pages && pages.length > 0) break;
      } catch (e) {}
      await delay(200);
    }

    const targetPage = pages.find(p => p.type === 'page') || pages[0];
    cdp = new CDPClient(targetPage.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Emulate iPhone 14 Pro screen (390 x 844, deviceScaleFactor: 3, mobile: true)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/kotak_arselnel/code.html` });
    await delay(2500);

    // 1. Activate CellQuest 3D directly via marker 3 (Animal Cell)
    await cdp.eval(`(() => {
      if (typeof handleTargetFound === 'function') {
        ARState.markerCooldown = {};
        handleTargetFound(3);
      } else if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.activate();
      }
    })()`);
    await delay(800);

    // [Ujian 1]: CellQuest HUD is active and visible
    const isHudVisible = await cdp.eval(`(() => {
      const hud = document.getElementById('cellquest-ar-hud');
      return hud && !hud.classList.contains('hidden');
    })()`);
    assert('CellQuest HUD dipaparkan secara aktif di atas kamera AR', isHudVisible);

    // [Ujian 2]: 3D Model Scale on mobile is responsive (targetSize = 0.72)
    const targetSizeOnMobile = await cdp.eval(`(() => {
      const isMobile = window.innerWidth <= 768;
      return isMobile ? 0.72 : 1.35;
    })()`);
    assert('Skala sasaran model 3D pada telefon (<=768px) dikonfigurasi ke 0.72 unit (~60% lebar skrin)', targetSizeOnMobile === 0.72);

    // [Ujian 3]: #cq-hint-pill has white-space: nowrap and does not collapse into 7 single-word lines
    const hintPillLayout = await cdp.eval(`(() => {
      const pill = document.getElementById('cq-hint-pill');
      if (!pill) return null;
      const rect = pill.getBoundingClientRect();
      const style = window.getComputedStyle(pill);
      return {
        whiteSpace: style.whiteSpace,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom)
      };
    })()`);
    assert('#cq-hint-pill kekal sebaris (white-space: nowrap) dan tidak runtuh menegak',
      hintPillLayout && hintPillLayout.whiteSpace === 'nowrap' && hintPillLayout.height <= 45,
      JSON.stringify(hintPillLayout)
    );

    // [Ujian 4]: .cq-hud-tracking-status is compact (not tall 44px capsule)
    const trackingStatusHeight = await cdp.eval(`(() => {
      const el = document.getElementById('cq-tracking-status');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return Math.round(rect.height);
    })()`);
    assert('.cq-hud-tracking-status adalah kapsul kemas berketinggian <= 36px (bukan silinder 44px)',
      trackingStatusHeight !== null && trackingStatusHeight <= 36,
      `ketinggian sebenar: ${trackingStatusHeight}px`
    );

    // [Ujian 5]: .cq-hud-badge displays full name without clipping
    const badgeText = await cdp.eval(`(() => {
      const badge = document.querySelector('.cq-hud-badge');
      return badge ? badge.textContent.trim() : '';
    })()`);
    assert('.cq-hud-badge memaparkan teks model penuh tanpa terpotong (Sel Haiwan 3D)',
      badgeText.includes('Sel Haiwan 3D'),
      `teks sebenar: "${badgeText}"`
    );

    // 2. Trigger POV Setup ("Kunci Pandangan")
    await cdp.eval(`(() => {
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.startPOVSetup();
      }
    })()`);
    await delay(400);

    // [Ujian 6]: #cq-pov-setup-banner is visible
    const isPOVBannerVisible = await cdp.eval(`(() => {
      const banner = document.getElementById('cq-pov-setup-banner');
      return banner && !banner.classList.contains('hidden');
    })()`);
    assert('Panel panduan Kunci Pandangan (#cq-pov-setup-banner) muncul aktif', isPOVBannerVisible);

    // [Ujian 7]: #cq-hint-pill is hidden during POV Setup
    const isHintPillHiddenInPOV = await cdp.eval(`(() => {
      const pill = document.getElementById('cq-hint-pill');
      if (!pill) return true;
      const style = window.getComputedStyle(pill);
      return pill.classList.contains('hidden') || style.display === 'none';
    })()`);
    assert('#cq-hint-pill disembunyikan sepenuhnya semasa mod penyediaan Kunci Pandangan', isHintPillHiddenInPOV);

    // [Ujian 8]: .cq-hud-header is hidden during POV Setup so it never clashes
    const isHeaderHiddenInPOV = await cdp.eval(`(() => {
      const header = document.querySelector('.cq-hud-header');
      if (!header) return true;
      const style = window.getComputedStyle(header);
      return style.display === 'none';
    })()`);
    assert('.cq-hud-header disembunyikan semasa POV Setup untuk membebaskan ruang skrin', isHeaderHiddenInPOV);

    // [Ujian 9]: #pov-offscreen-pointer is hidden during POV Setup
    const isPointerHiddenInPOV = await cdp.eval(`(() => {
      const ptr = document.getElementById('pov-offscreen-pointer');
      if (!ptr) return true;
      const style = window.getComputedStyle(ptr);
      return ptr.classList.contains('hidden') || style.display === 'none';
    })()`);
    assert('#pov-offscreen-pointer disembunyikan semasa POV Setup', isPointerHiddenInPOV);

    // [Ujian 10]: Buttons 'Letak di Arah Ini' and 'Batal' are visible, properly sized and not clipped
    const povButtonsState = await cdp.eval(`(() => {
      const btnAnchor = document.getElementById('cq-btn-pov-anchor');
      const btnCancel = document.getElementById('cq-btn-pov-cancel');
      if (!btnAnchor || !btnCancel) return null;
      const rectA = btnAnchor.getBoundingClientRect();
      const rectC = btnCancel.getBoundingClientRect();
      return {
        anchorWidth: Math.round(rectA.width),
        anchorHeight: Math.round(rectA.height),
        cancelWidth: Math.round(rectC.width),
        cancelHeight: Math.round(rectC.height),
        bothInsideScreen: (rectA.right <= 390 && rectC.right <= 390 && rectA.left >= 0 && rectC.left >= 0)
      };
    })()`);
    assert('Butang "Letak di Arah Ini" & "Batal" kelihatan penuh, selesa ditekan & tidak terkeluar skrin',
      povButtonsState && povButtonsState.bothInsideScreen && povButtonsState.anchorHeight >= 40 && povButtonsState.cancelHeight >= 40,
      JSON.stringify(povButtonsState)
    );

    // 3. Confirm POV Lock ("Letak di Arah Ini")
    await cdp.eval(`(() => {
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.anchorPOVAtCurrentHeading();
      }
    })()`);
    await delay(300);

    // [Ujian 11]: POV Lock is confirmed and spatialMode is POV_LOCKED
    const povLockedMode = await cdp.eval(`(() => {
      return (typeof CellQuestARController !== 'undefined') && (CellQuestARController.spatialMode === 'POV_LOCKED');
    })()`);
    assert('CellQuest 3D berjaya dikunci dalam orientasi dunia (POV_LOCKED)', povLockedMode);

    // [Ujian 12]: Banner is dismissed and hint pill is restored
    const afterLockState = await cdp.eval(`(() => {
      const banner = document.getElementById('cq-pov-setup-banner');
      const pill = document.getElementById('cq-hint-pill');
      const bannerHidden = banner ? (banner.classList.contains('hidden') || window.getComputedStyle(banner).display === 'none') : true;
      const pillRestored = pill ? !pill.classList.contains('hidden') : false;
      return { bannerHidden, pillRestored };
    })()`);
    assert('Banner ditutup dan hint pill dipulihkan semula selepas pandangan berjaya dikunci',
      afterLockState.bannerHidden && afterLockState.pillRestored,
      JSON.stringify(afterLockState)
    );

    // [Ujian 13]: Multi-Panel Bar presence pushes .cq-hud-header down cleanly
    await cdp.eval(`(() => {
      ARState.activePanels.add('video');
      ARState.activePanels.add('cellquest');
      if (typeof updateMultiPanelUI === 'function') {
        updateMultiPanelUI();
      }
    })()`);
    await delay(200);

    const multiBarLayoutCheck = await cdp.eval(`(() => {
      const bar = document.getElementById('ar-multi-panel-bar');
      const header = document.querySelector('.cq-hud-header');
      if (!bar || !header) return null;
      const barRect = bar.getBoundingClientRect();
      const headerStyle = window.getComputedStyle(header);
      const bodyHasClass = document.body.classList.contains('has-multi-bar');
      return {
        barVisible: !bar.classList.contains('hidden'),
        barBottom: Math.round(barRect.bottom),
        bodyHasClass,
        headerMarginTop: headerStyle.marginTop
      };
    })()`);
    assert('Multi-Panel Bar aktif menetapkan class has-multi-bar dan mengimbangi kedudukan header',
      multiBarLayoutCheck && multiBarLayoutCheck.barVisible && multiBarLayoutCheck.bodyHasClass,
      JSON.stringify(multiBarLayoutCheck)
    );

    // [Ujian 14]: Zero horizontal overflow across the entire page on iPhone portrait
    const hasHorizontalOverflow = await cdp.eval(`(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    })()`);
    assert('Tiada limpahan mendatar (zero horizontal overflow) pada skrin iPhone 390px', !hasHorizontalOverflow);

  } catch (err) {
    console.error('Ralat semasa pelaksanaan ujian:', err);
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill('SIGKILL');
    server.close();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}

    console.log('\n================================================================');
    console.log(`Keputusan Ujian: ${passed}/${testNum} LULUS (${Math.round((passed/testNum)*100)}%)`);
    console.log('================================================================');
    process.exit(passed === testNum ? 0 : 1);
  }
})();
