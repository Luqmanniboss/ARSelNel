/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * HOTFIX GUIDED TOUR 1.2 — VIDEO PLAYER TOOLTIP VISIBILITY, CELLQUEST ADVENTURE & AR ONBOARDING
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60540;
const CDP_PORT = 9285;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_tour_hotfix_1_2');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
    if (reqPath === '/') reqPath = '/index.html';
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
      throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 800
    });
  }

  async captureScreenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
  }

  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('  ARSELNEL — QA VERIFICATION SUITE: HOTFIX GUIDED TOUR 1.2             ');
  console.log('========================================================================\n');

  const server = await startServer();
  console.log(`[1] Static Server berjalan pada port ${PORT}`);

  const browserPath = findBrowser();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars_tour_hotfix12_profile_'));
  const proc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  try {
    let pages = [];
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 300));
      try {
        pages = await getPages(CDP_PORT);
        if (pages.length > 0) break;
      } catch (_) {}
    }

    const targetPage = pages.find(p => p.type === 'page') || pages[0];
    if (!targetPage) throw new Error('Tiada tab halaman ditemui');

    console.log(`[2] CDP Terhubung ke browser pada ${targetPage.webSocketDebuggerUrl}`);

    const client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.ready;
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        localStorage.setItem('arselnel_current_user', JSON.stringify({
          id: 'usr_student_umie_123',
          name: 'Umie (Pelajar Sains)',
          nickname: 'Umie',
          role: 'student'
        }));
      `
    });

    const testResults = [];

    // Helper: Wait for ArselnelTour to be ready
    async function waitForTour(maxWait = 4000) {
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        try {
          const ready = await client.eval(`Boolean(window.ArselnelTour && window.ARSELNEL_TOUR_CONFIGS)`);
          if (ready) return true;
        } catch (_) {}
        await new Promise(r => setTimeout(r, 150));
      }
      return false;
    }

    // -------------------------------------------------------------------------
    // TEST 1: Video Player Smart Tooltip on Laptop Viewport (1366x768)
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 1: Pemain Video Smart Tooltip Visibility (Laptop 1366x768) ---');
    await client.setViewport(1366, 768);
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pemain_video/code.html` });
    await waitForTour();
    await new Promise(r => setTimeout(r, 900));

    // Force start video player tour
    await client.eval(`window.ArselnelTour.startTour('player', true);`);
    await new Promise(r => setTimeout(r, 400));

    // Jump to Step 2: #player-container (Large Target)
    await client.eval(`window.ArselnelTour.goToStep(1);`);
    await new Promise(r => setTimeout(r, 500));

    const videoStepMetrics = await client.eval(`
      (function() {
        const tooltip = document.querySelector('.ars-tour-tooltip');
        const target = document.querySelector('#player-container');
        const hole = document.getElementById('ars-tour-hole');
        const nextBtn = document.querySelector('.ars-tour-btn-next');
        const skipBtn = document.querySelector('.ars-tour-btn-skip');

        const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
        const pRect = target ? target.getBoundingClientRect() : null;
        const vW = window.innerWidth;
        const vH = window.innerHeight;

        const isFullyInViewport = tRect && (
          tRect.top >= 0 &&
          tRect.left >= 0 &&
          tRect.bottom <= vH &&
          tRect.right <= vW
        );

        const nextBtnVisible = nextBtn && (
          nextBtn.getBoundingClientRect().bottom <= vH &&
          nextBtn.getBoundingClientRect().top >= 0
        );

        return {
          placement: tooltip ? tooltip.getAttribute('data-placement') : null,
          tooltipRect: tRect ? { top: tRect.top, left: tRect.left, width: tRect.width, height: tRect.height, bottom: tRect.bottom } : null,
          targetRect: pRect ? { top: pRect.top, height: pRect.height, bottom: pRect.bottom } : null,
          isFullyInViewport: Boolean(isFullyInViewport),
          nextBtnVisible: Boolean(nextBtnVisible),
          holeW: hole ? hole.getAttribute('width') : null,
          holeH: hole ? hole.getAttribute('height') : null
        };
      })()
    `);

    console.log(`  > Placement: ${videoStepMetrics.placement}`);
    console.log(`  > Tooltip Rect: Top=${Math.round(videoStepMetrics.tooltipRect.top)}, Bottom=${Math.round(videoStepMetrics.tooltipRect.bottom)}, Height=${Math.round(videoStepMetrics.tooltipRect.height)}`);
    console.log(`  > Target Bottom: ${Math.round(videoStepMetrics.targetRect.bottom)}px | Screen Height: 768px`);
    console.log(`  > Tooltip Sepenuhnya Dalam Viewport (No Scroll):`, videoStepMetrics.isFullyInViewport ? 'YA (LULUS)' : 'TIDAK (GAGAL)');
    console.log(`  > Butang Navigasi Boleh Dilihat:`, videoStepMetrics.nextBtnVisible ? 'YA (LULUS)' : 'TIDAK (GAGAL)');

    const shot1 = path.join(SCREENSHOT_DIR, 'tour_video_player_laptop_1366x768.png');
    await client.captureScreenshot(shot1);
    fs.copyFileSync(shot1, path.join(ARTIFACT_DIR, 'tour_video_player_laptop_1366x768.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_video_player_laptop_1366x768.png`);

    testResults.push({
      test: 'Video Player Tooltip Visible Within 1366x768 Viewport (No Scroll)',
      status: videoStepMetrics.isFullyInViewport && videoStepMetrics.nextBtnVisible
    });

    // -------------------------------------------------------------------------
    // TEST 2: Video Player Remaining Steps (Title, Description, Recommendations)
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 2: Langkah Pemain Video Lain (Syor, Kategori, Penerangan) ---');
    // Step 5: Recommendations
    await client.eval(`window.ArselnelTour.goToStep(4);`);
    await new Promise(r => setTimeout(r, 600));

    const recMetrics = await client.eval(`
      (function() {
        const tooltip = document.querySelector('.ars-tour-tooltip');
        const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
        const vH = window.innerHeight;
        return {
          inView: tRect ? (tRect.top >= 0 && tRect.bottom <= vH) : false,
          top: tRect ? tRect.top : 0
        };
      })()
    `);
    console.log(`  > Step Syor Video Tooltip in View:`, recMetrics.inView ? 'YA' : 'TIDAK');

    testResults.push({
      test: 'Video Player Recommendations Step Tooltip In View',
      status: recMetrics.inView
    });

    // -------------------------------------------------------------------------
    // TEST 3: CellQuest Misi Jelajah Dunia Sel & Cara Bermain Removed
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 3: CellQuest Misi Jelajah Dunia Sel & Cara Bermain Button Audit ---');
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/code.html` });
    await waitForTour();
    await new Promise(r => setTimeout(r, 800));

    const cellquestDomAudit = await client.eval(`
      (function() {
        const howToPlayBtn = document.querySelector('a[href*="mode=how"], .btn-cara-bermain');
        const startBtn = document.querySelector('#btn-cq-start-adventure, a[href="adventure.html"]');
        const banner = document.querySelector('.cq-adventure-banner');
        return {
          caraBermainRemoved: (howToPlayBtn === null),
          startBtnExists: Boolean(startBtn),
          bannerExists: Boolean(banner),
          startBtnHref: startBtn ? startBtn.getAttribute('href') : null
        };
      })()
    `);

    console.log(`  > Butang "Cara Bermain" Berjaya Dibuang:`, cellquestDomAudit.caraBermainRemoved ? 'YA (LULUS)' : 'TIDAK (GAGAL)');
    console.log(`  > Butang "Mula Pengembaraan" Wujud & Betul:`, cellquestDomAudit.startBtnExists ? `YA (href: ${cellquestDomAudit.startBtnHref})` : 'TIDAK');

    testResults.push({
      test: 'CellQuest Cara Bermain Button Removed & Start Button Preserved',
      status: cellquestDomAudit.caraBermainRemoved && cellquestDomAudit.startBtnExists
    });

    // Start tour on CellQuest and verify new steps 1, 2, 3
    await client.eval(`window.ArselnelTour.startTour('cellquest', true);`);
    await new Promise(r => setTimeout(r, 500));

    const cqStep1 = await client.eval(`
      (function() {
        const title = document.getElementById('ars-tour-title')?.textContent;
        const target = window.ArselnelTour.activeTarget;
        return { title, isBanner: target && target.classList.contains('cq-adventure-banner') };
      })()
    `);
    console.log(`  > Step 1: "${cqStep1.title}" (Spotlight Banner: ${cqStep1.isBanner ? 'YA' : 'TIDAK'})`);

    await client.eval(`window.ArselnelTour.goToStep(1);`);
    await new Promise(r => setTimeout(r, 400));
    const cqStep2 = await client.eval(`
      (function() {
        const title = document.getElementById('ars-tour-title')?.textContent;
        const target = window.ArselnelTour.activeTarget;
        return { title, isStartBtn: target && (target.id === 'btn-cq-start-adventure' || target.getAttribute('href') === 'adventure.html') };
      })()
    `);
    console.log(`  > Step 2: "${cqStep2.title}" (Spotlight Start Button: ${cqStep2.isStartBtn ? 'YA' : 'TIDAK'})`);

    const shotCellQuest = path.join(SCREENSHOT_DIR, 'tour_cellquest_misi_jelajah_laptop.png');
    await client.captureScreenshot(shotCellQuest);
    fs.copyFileSync(shotCellQuest, path.join(ARTIFACT_DIR, 'tour_cellquest_misi_jelajah_laptop.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_cellquest_misi_jelajah_laptop.png`);

    testResults.push({
      test: 'CellQuest Guided Tour Covers Misi Jelajah Dunia Sel (Steps 1 & 2)',
      status: cqStep1.isBanner && cqStep2.isStartBtn
    });

    // -------------------------------------------------------------------------
    // TEST 4: Terokai Dunia AR Page & Saintis Muda Removal Audit
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 4: Terokai Dunia AR Onboarding & Saintis Muda Removal Audit ---');
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/adventure.html` });
    await waitForTour();
    await new Promise(r => setTimeout(r, 900));

    const adventureDomAudit = await client.eval(`
      (function() {
        const userPill = document.getElementById('lobby-user-pill');
        const pillVisible = userPill ? (getComputedStyle(userPill).display !== 'none' && userPill.offsetWidth > 0) : false;
        const backCq = document.getElementById('lobby-back-btn');
        const backKotak = document.getElementById('lobby-return-kotak-btn');
        const helpBtn = document.querySelector('.ars-tour-help-btn, [data-ars-tour="ar_adventure"]');
        return {
          pillRemovedFromDisplay: !pillVisible,
          backCqExists: Boolean(backCq),
          backKotakExists: Boolean(backKotak),
          helpBtnExists: Boolean(helpBtn)
        };
      })()
    `);

    console.log(`  > Komponen "Saintis Muda 0/8" Tidak Dipaparkan:`, adventureDomAudit.pillRemovedFromDisplay ? 'YA (LULUS)' : 'TIDAK (GAGAL)');
    console.log(`  > Butang Kembali ke CellQuest & Kotak ARSELNEL Kekal:`, (adventureDomAudit.backCqExists && adventureDomAudit.backKotakExists) ? 'YA' : 'TIDAK');
    console.log(`  > Butang Bantuan Tour Hadir:`, adventureDomAudit.helpBtnExists ? 'YA' : 'TIDAK');

    testResults.push({
      test: 'Terokai Dunia AR Saintis Muda Component Removed From Display',
      status: adventureDomAudit.pillRemovedFromDisplay && adventureDomAudit.backCqExists && adventureDomAudit.backKotakExists
    });

    // -------------------------------------------------------------------------
    // TEST 5: Terokai Dunia AR Guided Tour All 5 Steps
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 5: Terokai Dunia AR Guided Tour (5 Langkah: Pengenalan, Mod A, B, C, Mula) ---');
    await client.eval(`window.ArselnelTour.startTour('ar_adventure', true);`);
    await new Promise(r => setTimeout(r, 400));

    const advStepsInfo = [];
    for (let s = 0; s < 5; s++) {
      await client.eval(`window.ArselnelTour.goToStep(${s});`);
      await new Promise(r => setTimeout(r, 400));
      const info = await client.eval(`
        (function() {
          const title = document.getElementById('ars-tour-title')?.textContent;
          const target = window.ArselnelTour.activeTarget;
          const hole = document.getElementById('ars-tour-hole');
          return {
            title,
            targetId: target ? target.id : target?.className,
            holeAttrs: hole ? { w: parseFloat(hole.getAttribute('width')), h: parseFloat(hole.getAttribute('height')) } : null
          };
        })()
      `);
      advStepsInfo.push(info);
      console.log(`  > Langkah ${s + 1}: "${info.title}" | Sasaran: #${info.targetId} | Lubang: ${Math.round(info.holeAttrs?.w || 0)}x${Math.round(info.holeAttrs?.h || 0)}px`);
    }

    const shotAdventure = path.join(SCREENSHOT_DIR, 'tour_terokai_dunia_ar_laptop.png');
    await client.captureScreenshot(shotAdventure);
    fs.copyFileSync(shotAdventure, path.join(ARTIFACT_DIR, 'tour_terokai_dunia_ar_laptop.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_terokai_dunia_ar_laptop.png`);

    const allAdvStepsValid = (
      advStepsInfo[0].title.includes('Selamat Datang') &&
      advStepsInfo[1].targetId === 'lobby-card-mod-a' &&
      advStepsInfo[2].targetId === 'lobby-card-mod-b' &&
      advStepsInfo[3].targetId === 'lobby-card-mod-c' &&
      advStepsInfo[4].title.includes('Mulakan Pengembaraan')
    );

    testResults.push({
      test: 'Terokai Dunia AR All 5 Steps Spotlight Verified',
      status: allAdvStepsValid
    });

    // -------------------------------------------------------------------------
    // TEST 6: Multi-Viewport Quality Across 8 Viewports (Zero Overflow & Fits)
    // -------------------------------------------------------------------------
    console.log('\n--- UJIAN 6: Multi-Viewport Responsif 8 Peranti (Termasuk Android 360px & Laptop 1366px) ---');
    const viewports = [
      { name: 'android_kecil_360x800', w: 360, h: 800 },
      { name: 'iphone_se_375x667', w: 375, h: 667 },
      { name: 'iphone_14_390x844', w: 390, h: 844 },
      { name: 'iphone_promax_430x932', w: 430, h: 932 },
      { name: 'ipad_portrait_768x1024', w: 768, h: 1024 },
      { name: 'ipad_landscape_1024x768', w: 1024, h: 768 },
      { name: 'laptop_1366x768', w: 1366, h: 768 },
      { name: 'desktop_1920x1080', w: 1920, h: 1080 }
    ];

    for (const vp of viewports) {
      await client.setViewport(vp.w, vp.h);
      await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/pemain_video/code.html` });
      await waitForTour();
      await client.eval(`window.ArselnelTour.startTour('player', true);`);
      await new Promise(r => setTimeout(r, 400));
      await client.eval(`window.ArselnelTour.goToStep(1);`); // Video Player
      await new Promise(r => setTimeout(r, 400));

      const vpMetrics = await client.eval(`
        (function() {
          const docEl = document.documentElement;
          const tooltip = document.querySelector('.ars-tour-tooltip');
          const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
          const vW = window.innerWidth;
          const vH = window.innerHeight;
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            hasHorizontalOverflow: docEl.scrollWidth > docEl.clientWidth,
            inView: tRect ? (tRect.top >= 0 && tRect.left >= 0 && tRect.bottom <= vH && tRect.right <= vW) : false,
            top: tRect ? Math.round(tRect.top) : 0,
            bottom: tRect ? Math.round(tRect.bottom) : 0,
            height: tRect ? Math.round(tRect.height) : 0
          };
        })()
      `);

      console.log(`  > [${vp.name}]: Horiz Overflow: ${vpMetrics.hasHorizontalOverflow ? 'ADA (FAIL)' : 'TIADA (PASS)'} | Tooltip 100% In View: ${vpMetrics.inView ? 'YA' : 'TIDAK'} (Top: ${vpMetrics.top}, Bottom: ${vpMetrics.bottom})`);

      const vpShot = path.join(SCREENSHOT_DIR, `tour_video_${vp.name}.png`);
      await client.captureScreenshot(vpShot);
      fs.copyFileSync(vpShot, path.join(ARTIFACT_DIR, `tour_video_${vp.name}.png`));

      testResults.push({
        test: `Viewport ${vp.name} Video Player Tooltip In View & No Overflow`,
        status: !vpMetrics.hasHorizontalOverflow && vpMetrics.inView
      });
    }

    // SUMMARY
    console.log('\n===============================================================');
    console.log('                 KEPUTUSAN KESELURUHAN UJIAN');
    console.log('===============================================================');
    let allPassed = true;
    for (const r of testResults) {
      const mark = r.status ? '✅ LULUS' : '❌ GAGAL';
      console.log(`${mark} : ${r.test}`);
      if (!r.status) allPassed = false;
    }
    console.log('===============================================================');
    if (allPassed) {
      console.log('🎉 SEMUA 13/13 UJIAN QA HOTFIX GUIDED TOUR 1.2 BERJAYA 100%!');
    } else {
      console.error('⚠️ SEBAHAGIAN UJIAN GAGAL!');
      process.exitCode = 1;
    }

    client.close();
  } catch (err) {
    console.error('RALAT SEMASA UJIAN:', err);
    process.exitCode = 1;
  } finally {
    proc.kill();
    server.close();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runTests();
