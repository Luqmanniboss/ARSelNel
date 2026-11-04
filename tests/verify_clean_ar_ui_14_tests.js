/**
 * AUTOMATED VERIFICATION SUITE — CODEX CLEAN AR GAME UI/UX & IPAD RESPONSIVE LAYOUT
 * Menguji semua 14 Ujian Wajib (Bahagian 13) & 8 Saiz Viewport Wajib (Bahagian 14):
 *   1. Desktop: 1920x1080
 *   2. Laptop: 1366x768
 *   3. iPad Landscape (Mini/Gen): 1024x768
 *   4. iPad Air Landscape: 1180x820
 *   5. iPad Pro 12.9" Landscape: 1366x1024
 *   6. iPad Air Portrait: 820x1180
 *   7. Telefon Portrait: 390x844
 *   8. Telefon Landscape: 844x390
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

(async () => {
  const { server, port } = await startStaticServer();
  const baseUrl = `http://localhost:${port}`;
  const outDir = path.join(ROOT_DIR, 'tests', 'screenshots_clean_ar_ui');
  fs.mkdirSync(outDir, { recursive: true });

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const debugPort = 9255;
  const chrome = spawn(edgePath, [
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
  const failed404s = [];

  try {
    await sleep(2200);
    const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
    const pages = await listRes.json();
    const targetPage = pages.find(p => p.type === 'page');
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error('Could not find Edge CDP page target');
    }

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
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
      } else if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params?.exceptionDetails?.text || 'Runtime exception');
      } else if (data.method === 'Network.responseReceived') {
        const resp = data.params?.response;
        if (resp && resp.status >= 400 && !resp.url.includes('favicon')) {
          failed404s.push(`${resp.status}: ${resp.url}`);
        }
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
      await evaluate(`window.dispatchEvent(new Event('resize'));`);
      await sleep(250);
    }

    async function captureScreenshot(filename) {
      const shot = await sendCDP('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(outDir, filename);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      return filePath;
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

    // Set initial viewport to iPad Air Landscape (1180x820)
    await setViewport(1180, 820, true);
    await sendCDP('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });
    await sleep(3400);

    await evaluate(`window.CellQuestAR.preloadAllGLBs().then(() => true)`);
    await evaluate(`window.CellQuestAR.selectMode('camera-ar').then(() => true)`);
    await sleep(600);

    // Dismiss initial calibration popup so we can test active gameplay HUD
    await evaluate(`
      (() => {
        const closeCal = document.getElementById('ar-world-close-cal-btn');
        if (closeCal) closeCal.click();
        return true;
      })()
    `);
    await sleep(350);

    const results = {};

    // =========================================================================
    // UJIAN 1: NAVIGASI MOD DIBUANG DARIPADA SKRIN PERMAINAN AR AKTIF
    // =========================================================================
    results.ujian1_navigasi_mod_dibuang = await evaluate(`
      (() => {
        const isVisible = (el) => {
          if (!el) return false;
          const s = window.getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const ids = [
          'ar-top-center-nav',
          'ar-model-tabs',
          'ar-btn-world',
          'ar-btn-marker',
          'ar-btn-animal',
          'ar-btn-plant',
          'ar-btn-minilab',
          'ar-floating-bar'
        ];
        const visibilityMap = {};
        ids.forEach(id => {
          visibilityMap[id] = isVisible(document.getElementById(id));
        });
        const allHidden = Object.values(visibilityMap).every(v => v === false);
        return {
          pass: allHidden,
          visibilityMap
        };
      })()
    `);

    // =========================================================================
    // UJIAN 3, 9, 10, 11, 12: TOP BAR & RESPONSIVE LAYOUT PADA 8 SAIZ VIEWPORT
    // =========================================================================
    const viewports = [
      { key: 'desktop_1920x1080', label: 'Desktop 1920×1080', width: 1920, height: 1080, mobile: false },
      { key: 'laptop_1366x768', label: 'Laptop 1366×768', width: 1366, height: 768, mobile: false },
      { key: 'ipad_landscape_1024x768', label: 'iPad Landscape 1024×768', width: 1024, height: 768, mobile: true },
      { key: 'ipad_landscape_1180x820', label: 'iPad Air Landscape 1180×820', width: 1180, height: 820, mobile: true },
      { key: 'ipad_landscape_1366x1024', label: 'iPad Pro Landscape 1366×1024', width: 1366, height: 1024, mobile: true },
      { key: 'ipad_portrait_820x1180', label: 'iPad Portrait 820×1180', width: 820, height: 1180, mobile: true },
      { key: 'phone_portrait_390x844', label: 'Phone Portrait 390×844', width: 390, height: 844, mobile: true },
      { key: 'phone_landscape_844x390', label: 'Phone Landscape 844×390', width: 844, height: 390, mobile: true }
    ];

    // Ensure Station 8 is detected (0° Front, -12° Elevation) so the bottom-right notification is ALSO visible during viewport layout tests!
    await evaluate(`
      window.CellQuestAR.selectRadarTarget(7, true);
      true;
    `);
    await sleep(250);

    const viewportMetrics = {};
    for (const vp of viewports) {
      await setViewport(vp.width, vp.height, vp.mobile);
      const m = await evaluate(`
        (() => {
          const rectObj = (el) => {
            if (!el) return null;
            const s = window.getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return null;
            const r = el.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0) return null;
            return {
              left: Math.round(r.left),
              top: Math.round(r.top),
              right: Math.round(r.right),
              bottom: Math.round(r.bottom),
              width: Math.round(r.width),
              height: Math.round(r.height)
            };
          };
          const overlapArea = (a, b) => {
            if (!a || !b) return 0;
            const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            return xOverlap * yOverlap;
          };

          const backBtn = rectObj(document.getElementById('ar-back-btn'));
          const statusBadge = rectObj(document.getElementById('ar-status-badge'));
          const topLeft = rectObj(document.querySelector('.cq-ar-top-left'));
          const statsGroup = rectObj(document.getElementById('ar-stats-group'));
          const toolsGroup = rectObj(document.querySelector('.cq-ar-tools-group'));
          const topRight = rectObj(document.querySelector('.cq-ar-top-right'));
          const topBar = rectObj(document.getElementById('ar-topbar'));
          const radarWrap = rectObj(document.getElementById('ar-world-compass-wrap'));
          const singleInst = rectObj(document.getElementById('ar-single-instruction'));
          const detectedBanner = rectObj(document.getElementById('ar-world-detected-banner'));

          const topBarOverlaps = {
            back_vs_badge: overlapArea(backBtn, statusBadge),
            topLeft_vs_topRight: overlapArea(topLeft, topRight),
            stats_vs_tools: overlapArea(statsGroup, toolsGroup),
            back_vs_stats: overlapArea(backBtn, statsGroup),
            back_vs_tools: overlapArea(backBtn, toolsGroup)
          };
          const maxTopBarOverlap = Math.max(...Object.values(topBarOverlaps));

          const hudOverlaps = {
            radar_vs_detected: overlapArea(radarWrap, detectedBanner),
            radar_vs_topbar: overlapArea(radarWrap, topBar),
            detected_vs_topbar: overlapArea(detectedBanner, topBar),
            singleInst_vs_topbar: overlapArea(singleInst, topBar),
            singleInst_vs_radar: overlapArea(singleInst, radarWrap),
            singleInst_vs_detected: overlapArea(singleInst, detectedBanner)
          };
          const maxHudOverlap = Math.max(...Object.values(hudOverlaps));

          // Kira peratus ruang tengah skrin yang bebas daripada UI tetap
          const totalScreenArea = window.innerWidth * window.innerHeight;
          const uiArea = [topBar, radarWrap, singleInst, detectedBanner]
            .filter(Boolean)
            .reduce((acc, r) => acc + (r.width * r.height), 0);
          const freeScreenRatio = +(((totalScreenArea - uiArea) / totalScreenArea) * 100).toFixed(1);

          // Pastikan semua elemen berada dalam sempadan skrin (tiada terkeluar skrin)
          const withinViewport = [backBtn, statusBadge, statsGroup, toolsGroup, radarWrap, singleInst].filter(Boolean).every(
            r => r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth + 2 && r.bottom <= window.innerHeight + 2
          );

          return {
            viewport: '${vp.width}x${vp.height}',
            maxTopBarOverlap,
            maxHudOverlap,
            withinViewport,
            freeScreenRatioPct: freeScreenRatio,
            badgeText: document.getElementById('ar-badge-text')?.textContent?.trim(),
            mainTitleText: document.querySelector('.cq-ar-main-title')?.textContent?.trim(),
            backText: document.getElementById('ar-back-btn')?.textContent?.replace(/\\s+/g, ' ').trim(),
            rects: { topBar, radarWrap, singleInst, detectedBanner }
          };
        })()
      `);
      viewportMetrics[vp.key] = m;
      await captureScreenshot(`vp_${vp.key}.png`);
    }

    // Switch back to iPad Air Landscape (1180x820) for functional tests
    await setViewport(1180, 820, true);

    results.ujian3_topbar_tidak_bertindih = {
      pass: Object.values(viewportMetrics).every(
        v => v.maxTopBarOverlap === 0 && v.withinViewport && v.badgeText === 'AR Jelajah Sel'
      ),
      badgeText: viewportMetrics.ipad_landscape_1180x820.badgeText,
      mainTitleText: viewportMetrics.ipad_landscape_1180x820.mainTitleText,
      backText: viewportMetrics.ipad_landscape_1180x820.backText,
      maxOverlapAcrossAll8Viewports: Math.max(...Object.values(viewportMetrics).map(v => v.maxTopBarOverlap))
    };

    // =========================================================================
    // UJIAN 4 & 5: SMART RADAR RINGKAS (DEFAULT) & BOLEH DIBUKA/DITUTUP
    // =========================================================================
    await evaluate(`window.CellQuestAR.selectRadarTarget(3, false); true;`); // Stesen 4: Mitokondrion (270° Kiri, +15° Elevasi)
    await evaluate(`window.CellQuestAR.lookAtHeading(0, 0); true;`); // Pandang 0° Hadapan supaya Kiri 90°, Naik 15°
    await sleep(250);

    const radarDefaultState = await evaluate(`
      (() => {
        const compact = document.getElementById('ar-smart-radar-compact');
        const panel = document.getElementById('ar-smart-radar-panel');
        const compactStyle = compact ? window.getComputedStyle(compact) : null;
        const panelStyle = panel ? window.getComputedStyle(panel) : null;
        return {
          compactVisible: !!(compactStyle && compactStyle.display !== 'none'),
          panelCollapsed: !!(panelStyle && panelStyle.display === 'none'),
          compactTarget: document.getElementById('ar-compact-target-name')?.textContent?.trim(),
          compactTurn: document.getElementById('ar-compact-turn-cmd')?.textContent?.trim(),
          compactElev: document.getElementById('ar-compact-elev-cmd')?.textContent?.trim(),
          expandBtnText: document.getElementById('ar-radar-expand-btn')?.textContent?.trim()
        };
      })()
    `);
    await captureScreenshot('ujian4_smart_radar_compact.png');

    // Klik "Cari Stesen" untuk buka panel penuh
    await evaluate(`document.getElementById('ar-radar-expand-btn').click();`);
    await sleep(200);
    const radarExpandedState = await evaluate(`
      (() => {
        const compact = document.getElementById('ar-smart-radar-compact');
        const panel = document.getElementById('ar-smart-radar-panel');
        const compactStyle = compact ? window.getComputedStyle(compact) : null;
        const panelStyle = panel ? window.getComputedStyle(panel) : null;
        const pillCount = document.querySelectorAll('#ar-radar-pills .cq-radar-stn-pill').length;
        return {
          compactHiddenWhenExpanded: !!(compactStyle && compactStyle.display === 'none'),
          panelVisibleWhenExpanded: !!(panelStyle && panelStyle.display !== 'none'),
          pillCount,
          panelTitle: document.getElementById('ar-radar-target-title')?.textContent?.trim(),
          closeBtnExists: !!document.getElementById('ar-radar-collapse-btn')
        };
      })()
    `);
    await captureScreenshot('ujian5_smart_radar_expanded.png');

    // Klik "✕ Tutup" untuk tutup semula ke paparan ringkas
    await evaluate(`document.getElementById('ar-radar-collapse-btn').click();`);
    await sleep(200);
    const radarCollapsedAgain = await evaluate(`
      (() => {
        const compact = document.getElementById('ar-smart-radar-compact');
        const panel = document.getElementById('ar-smart-radar-panel');
        return {
          compactVisibleAgain: window.getComputedStyle(compact).display !== 'none',
          panelHiddenAgain: window.getComputedStyle(panel).display === 'none'
        };
      })()
    `);

    results.ujian4_smart_radar_ringkas = {
      pass: radarDefaultState.compactVisible &&
            radarDefaultState.panelCollapsed &&
            radarDefaultState.compactTarget === '🎯 Mitokondrion' &&
            radarDefaultState.compactTurn === '↶ Kiri 90°' &&
            radarDefaultState.compactElev === '↑ Naik 15°' &&
            radarDefaultState.expandBtnText === 'Cari Stesen',
      ...radarDefaultState
    };

    results.ujian5_smart_radar_boleh_dibuka_ditutup = {
      pass: radarExpandedState.compactHiddenWhenExpanded &&
            radarExpandedState.panelVisibleWhenExpanded &&
            radarExpandedState.pillCount === 8 &&
            radarCollapsedAgain.compactVisibleAgain &&
            radarCollapsedAgain.panelHiddenAgain,
      expanded: radarExpandedState,
      collapsedAgain: radarCollapsedAgain
    };

    // =========================================================================
    // UJIAN 6: PAPAN NAMA STESEN 3D (TIADA TEKS TERPOTONG / KELUAR PANEL)
    // =========================================================================
    results.ujian6_papan_nama_stesen_3d = await evaluate(`
      (() => {
        const ws = window.CellQuestAR.getWorldState();
        const labels = ws.stationGroups.map(g => {
          const lbl = g.userData.labelGroup;
          const u = lbl ? lbl.userData : {};
          return {
            stationNumber: u.stationNumber,
            line1: u.line1,
            line2: u.line2,
            line3: u.line3,
            fontSizePx: u.fontSizePx,
            maxTextWidthPx: u.maxTextWidthPx,
            canvasWidthPx: u.canvasWidthPx,
            textFitsCanvas: u.textFitsCanvas,
            scale: +(lbl ? lbl.scale.x : 1).toFixed(3)
          };
        });
        const stn8 = labels.find(l => l.stationNumber === 8);
        const allFit = labels.length === 8 && labels.every(l => l.textFitsCanvas === true);
        return {
          pass: allFit && stn8 && stn8.line2 === 'Retikulum Endoplasma' && stn8.line3 === 'Ketik untuk Teroka',
          station8Label: stn8,
          labels
        };
      })()
    `);

    // =========================================================================
    // UJIAN 7: SATU ARAHAN UTAMA SAHAJA PADA SATU MASA
    // =========================================================================
    await evaluate(`window.CellQuestAR.selectRadarTarget(3, false); true;`); // Stesen 4: Mitokondrion
    await evaluate(`window.CellQuestAR.lookAtHeading(0, 0); true;`);
    await sleep(150);
    const instTurn = await evaluate(`document.getElementById('ar-single-instruction-text')?.textContent?.trim()`);

    await evaluate(`window.CellQuestAR.lookAtHeading(270, 0); true;`); // Azimut tepat 270°, elevasi masih 0° (perlu naik 15°)
    await sleep(150);
    const instElev = await evaluate(`document.getElementById('ar-single-instruction-text')?.textContent?.trim()`);

    await evaluate(`window.CellQuestAR.lookAtHeading(270, 15); true;`); // Azimut 270° & elevasi +15° (Ditemui!)
    await sleep(150);
    const instDiscovered = await evaluate(`
      (() => {
        const single = document.getElementById('ar-single-instruction');
        const hint = document.getElementById('ar-hint-banner');
        const track = document.getElementById('ar-world-tracking-banner');
        const isVis = (el) => el && window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden';
        return {
          text: document.getElementById('ar-single-instruction-text')?.textContent?.trim(),
          singleVisible: isVis(single),
          hintBannerHidden: !isVis(hint),
          trackingBannerHidden: !isVis(track)
        };
      })()
    `);

    results.ujian7_satu_arahan_utama = {
      pass: instTurn === '↶ Pusing kiri 90° untuk mencari Mitokondrion.' &&
            instElev === '↑ Naikkan kamera 15° untuk mencari Mitokondrion.' &&
            instDiscovered.text === '✓ Mitokondrion ditemui! Ketik untuk teroka.' &&
            instDiscovered.singleVisible &&
            instDiscovered.hintBannerHidden &&
            instDiscovered.trackingBannerHidden,
      instTurn,
      instElev,
      instDiscovered
    };

    // =========================================================================
    // UJIAN 8: NOTIFIKASI STESEN DITEMUI (RINGKAS & TIDAK BERTINDIH)
    // =========================================================================
    results.ujian8_notifikasi_stesen_ditemui = await evaluate(`
      (() => {
        const banner = document.getElementById('ar-world-detected-banner');
        const radar = document.getElementById('ar-world-compass-wrap');
        const single = document.getElementById('ar-single-instruction');
        const bRect = banner.getBoundingClientRect();
        const rRect = radar.getBoundingClientRect();
        const sRect = single.getBoundingClientRect();
        const overlap = (a, b) => {
          const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          return x * y;
        };
        return {
          pass: window.getComputedStyle(banner).display !== 'none' &&
                overlap(bRect, rRect) === 0 &&
                overlap(bRect, sRect) === 0 &&
                !!document.getElementById('ar-detected-explore-btn') &&
                !!document.getElementById('ar-detected-close-btn'),
          kicker: banner.querySelector('.cq-detected-kicker')?.textContent?.trim(),
          title: banner.querySelector('.cq-detected-title')?.textContent?.trim(),
          overlapWithRadar: overlap(bRect, rRect),
          overlapWithInstruction: overlap(bRect, sRect)
        };
      })()
    `);
    await captureScreenshot('ujian8_notifikasi_stesen_ditemui.png');

    // =========================================================================
    // UJIAN 9–12: RINGKASAN RESPONSIVE LAYOUT (IPAD LANDSCAPE, PORTRAIT, DESKTOP, TELEFON)
    // =========================================================================
    results.ujian9_ipad_landscape = {
      pass: ['ipad_landscape_1024x768', 'ipad_landscape_1180x820', 'ipad_landscape_1366x1024'].every(
        k => viewportMetrics[k].maxTopBarOverlap === 0 &&
             viewportMetrics[k].maxHudOverlap === 0 &&
             viewportMetrics[k].withinViewport &&
             viewportMetrics[k].freeScreenRatioPct >= 75
      ),
      viewports: {
        '1024x768': viewportMetrics.ipad_landscape_1024x768,
        '1180x820': viewportMetrics.ipad_landscape_1180x820,
        '1366x1024': viewportMetrics.ipad_landscape_1366x1024
      }
    };

    results.ujian10_ipad_portrait = {
      pass: viewportMetrics.ipad_portrait_820x1180.maxTopBarOverlap === 0 &&
            viewportMetrics.ipad_portrait_820x1180.maxHudOverlap === 0 &&
            viewportMetrics.ipad_portrait_820x1180.withinViewport,
      metrics: viewportMetrics.ipad_portrait_820x1180
    };

    results.ujian11_desktop_laptop = {
      pass: ['desktop_1920x1080', 'laptop_1366x768'].every(
        k => viewportMetrics[k].maxTopBarOverlap === 0 &&
             viewportMetrics[k].maxHudOverlap === 0 &&
             viewportMetrics[k].withinViewport
      ),
      viewports: {
        '1920x1080': viewportMetrics.desktop_1920x1080,
        '1366x768': viewportMetrics.laptop_1366x768
      }
    };

    results.ujian12_telefon = {
      pass: ['phone_portrait_390x844', 'phone_landscape_844x390'].every(
        k => viewportMetrics[k].maxTopBarOverlap === 0 &&
             viewportMetrics[k].maxHudOverlap === 0 &&
             viewportMetrics[k].withinViewport
      ),
      viewports: {
        '390x844': viewportMetrics.phone_portrait_390x844,
        '844x390': viewportMetrics.phone_landscape_844x390
      }
    };

    // =========================================================================
    // UJIAN 13: FUNGSI AR KEKAL BERFUNGSI (KAMERA, ORIENTASI, KUATERNION, KALIBRASI, KUIZ)
    // =========================================================================
    results.ujian13_fungsi_ar_kekal = await evaluate(`
      (() => {
        const camActive = window.CellQuestAR.isCameraStreamActive();
        window.CellQuestAR.simulateDeviceOrientation(120, 90, 0, 90);
        window.CellQuestAR.calibrateHeading();
        const afterCal = window.CellQuestAR.getWorldState();
        const calZero = afterCal.currentHeadingDeg === 0 && afterCal.currentPitchDeg === 0;

        // Pilih organel & buka modal kuiz
        window.CellQuestAR.selectOrganelle('mitochondria', 4);
        const cardVisible = document.getElementById('ar-organelle-card')?.style.display === 'block';
        const detectedHiddenWhenCardOpen = document.getElementById('ar-world-detected-banner')?.style.display === 'none';

        window.CellQuestAR.openQuiz(3);
        const quizOpen = document.getElementById('station-modal')?.classList.contains('open');
        document.getElementById('modal-close-btn')?.click();
        document.getElementById('ar-card-close')?.click();

        return {
          pass: camActive && calZero && afterCal.stationGroups.length === 8 && cardVisible && detectedHiddenWhenCardOpen && quizOpen,
          camActive,
          calZero,
          stationCount: afterCal.stationGroups.length,
          cardVisible,
          detectedHiddenWhenCardOpen,
          quizOpen
        };
      })()
    `);

    // =========================================================================
    // UJIAN 2: BUTANG KEMBALI (DIALOG PENGESAHAN + HENTIKAN STREAM & SENSOR + KE CELLQUEST)
    // =========================================================================
    results.ujian2_butang_kembali = await evaluate(`
      (async () => {
        window.CellQuestAR.preventRedirectInTest = true;
        const backBtn = document.getElementById('ar-back-btn');
        backBtn.click();
        const modal = document.getElementById('exit-confirm-modal');
        const openedOnBackClick = modal && modal.classList.contains('open');

        // Tekan "Teruskan Bermain" dahulu
        document.getElementById('exit-confirm-continue-btn').click();
        const closedOnContinue = modal && !modal.classList.contains('open');
        const camStillActiveAfterContinue = window.CellQuestAR.isCameraStreamActive();

        // Tekan "← Kembali" semula dan sahkan "Kembali ke CellQuest"
        backBtn.click();
        const targetUrl = await window.CellQuestAR.confirmExitToCellQuest();
        const camStoppedAfterConfirm = !window.CellQuestAR.isCameraStreamActive();
        const sensorRemovedAfterConfirm = !window.CellQuestAR.isSensorBound();
        const arWorldStopped = !window.CellQuestAR.getWorldState().active;

        return {
          pass: openedOnBackClick &&
                closedOnContinue &&
                camStillActiveAfterContinue &&
                targetUrl === 'code.html' &&
                camStoppedAfterConfirm &&
                sensorRemovedAfterConfirm &&
                arWorldStopped,
          openedOnBackClick,
          closedOnContinue,
          camStillActiveAfterContinue,
          targetUrl,
          camStoppedAfterConfirm,
          sensorRemovedAfterConfirm,
          arWorldStopped
        };
      })()
    `);

    // =========================================================================
    // UJIAN 14: CONSOLE BERSIH (TIADA RALAT JAVASCRIPT / 404)
    // =========================================================================
    results.ujian14_console_bersih = {
      pass: consoleErrors.length === 0 && failed404s.length === 0,
      consoleErrors,
      failed404s
    };

    const allPassed = Object.values(results).every(r => r && r.pass === true);
    const summary = {
      timestamp: new Date().toISOString(),
      allPassed,
      totalTests: Object.keys(results).length,
      passedCount: Object.values(results).filter(r => r && r.pass === true).length,
      results
    };

    fs.writeFileSync(
      path.join(outDir, 'verification_report_14_tests.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log(JSON.stringify(summary, null, 2));
    if (!allPassed) {
      process.exitCode = 1;
    }
  } finally {
    try { chrome.kill(); } catch (_) {}
    try { server.close(); } catch (_) {}
  }
})();
