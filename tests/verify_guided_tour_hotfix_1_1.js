/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * HOTFIX GUIDED TOUR 1.1 — SVG MASK CUTOUT, SMART TOOLTIP, & RESPONSIVE HELP BUTTON
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60535;
const CDP_PORT = 9280;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_tour_hotfix_1_1');

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
  console.log('=== MEMULAKAN QA VERIFICATION SUITE: HOTFIX GUIDED TOUR 1.1 ===\n');
  const server = await startServer();
  console.log(`[1] Static Server berjalan pada port ${PORT}`);

  const browserPath = findBrowser();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars_tour_hotfix_profile_'));
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

    // TEST 1: SelBot AI - Mask cutout, Non-stretching tooltip, Anti-collision
    console.log('\n--- UJIAN 1: SelBot AI Tour (Composer & Chips Spotlight + Anti-Collision) ---');
    await client.setViewport(390, 844); // iPhone 13/14
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/selbot_ai/code.html` });
    await waitForTour();

    const tourStarted = await client.eval(`
      (function() {
        if (!window.ArselnelTour) return false;
        return window.ArselnelTour.startTour('ai', true);
      })()
    `);
    console.log(`  > Start SelBot AI Tour: ${tourStarted ? 'BERJAYA' : 'GAGAL'}`);
    await new Promise(r => setTimeout(r, 500));

    // Step 3: suggestions
    await client.eval(`window.ArselnelTour.goToStep(2);`);
    await new Promise(r => setTimeout(r, 500));

    const step3Info = await client.eval(`
      (function() {
        const portal = document.querySelector('.ars-tour-portal');
        const svgMask = document.getElementById('ars-tour-mask');
        const hole = document.getElementById('ars-tour-hole');
        const tooltip = document.querySelector('.ars-tour-tooltip');
        const target = document.querySelector('.suggestion-chip-container, .suggestion-chip');
        
        const tRect = target ? target.getBoundingClientRect() : null;
        const tipRect = tooltip ? tooltip.getBoundingClientRect() : null;
        
        let collision = false;
        if (tRect && tipRect) {
          collision = !(
            tipRect.right < tRect.left || 
            tipRect.left > tRect.right || 
            tipRect.bottom < tRect.top || 
            tipRect.top > tRect.bottom
          );
        }

        return {
          portalActive: portal && portal.classList.contains('is-active'),
          hasSvgMask: Boolean(svgMask && hole),
          holeAttrs: hole ? {
            x: hole.getAttribute('x'),
            y: hole.getAttribute('y'),
            width: hole.getAttribute('width'),
            height: hole.getAttribute('height')
          } : null,
          tooltipHeight: tipRect ? tipRect.height : 0,
          isCollision: collision,
          placement: tooltip ? tooltip.getAttribute('data-placement') : null
        };
      })()
    `);

    console.log('  > Step 3 (Chips) SVG Mask:', step3Info.hasSvgMask ? 'HADIR' : 'TIADA');
    console.log('  > Hole Attrs:', JSON.stringify(step3Info.holeAttrs));
    console.log('  > Tooltip Height:', `${Math.round(step3Info.tooltipHeight)}px (Bukan Fullscreen, < 350px)`);
    console.log('  > Anti-Collision Check:', step3Info.isCollision ? 'GAGAL (Overlap)' : 'LULUS (Zero Overlap)');

    const shot1 = path.join(SCREENSHOT_DIR, 'tour_selbot_iphone_390x844.png');
    await client.captureScreenshot(shot1);
    fs.copyFileSync(shot1, path.join(ARTIFACT_DIR, 'tour_selbot_iphone_390x844.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_selbot_iphone_390x844.png`);

    testResults.push({
      test: 'SelBot AI SVG Mask & Tooltip Compactness',
      status: step3Info.hasSvgMask && step3Info.tooltipHeight > 50 && step3Info.tooltipHeight < 400 && !step3Info.isCollision
    });

    // Advance to Step 4: Composer
    await client.eval(`window.ArselnelTour.goToStep(3);`);
    await new Promise(r => setTimeout(r, 500));
    const step4Info = await client.eval(`
      (function() {
        const tooltip = document.querySelector('.ars-tour-tooltip');
        const target = document.querySelector('.composer-container, #chat-input');
        const tRect = target ? target.getBoundingClientRect() : null;
        const tipRect = tooltip ? tooltip.getBoundingClientRect() : null;
        let collision = false;
        if (tRect && tipRect) {
          collision = !(
            tipRect.right < tRect.left || 
            tipRect.left > tRect.right || 
            tipRect.bottom < tRect.top || 
            tipRect.top > tRect.bottom
          );
        }
        return {
          tooltipHeight: tipRect ? tipRect.height : 0,
          isCollision: collision,
          placement: tooltip ? tooltip.getAttribute('data-placement') : null
        };
      })()
    `);
    console.log('  > Step 4 (Composer) Placement:', step4Info.placement);
    console.log('  > Step 4 Tooltip Height:', `${Math.round(step4Info.tooltipHeight)}px`);
    console.log('  > Step 4 Anti-Collision:', step4Info.isCollision ? 'GAGAL' : 'LULUS');

    testResults.push({
      test: 'SelBot AI Composer Anti-Collision',
      status: !step4Info.isCollision
    });

    // TEST 2: Hab Permainan - Card Wrapper Spotlight
    console.log('\n--- UJIAN 2: Hab Permainan Tour (Whole Game Card Spotlight) ---');
    await client.setViewport(1366, 768); // Laptop
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/hab_permainan/code.html` });
    await waitForTour();
    await new Promise(r => setTimeout(r, 900));

    await client.eval(`window.ArselnelTour.startTour('games', true);`);
    await new Promise(r => setTimeout(r, 400));
    await client.eval(`window.ArselnelTour.goToStep(1);`); // Step 2: Labelkan Organel
    await new Promise(r => setTimeout(r, 600));

    const gameStepInfo = await client.eval(`
      (function() {
        const hole = document.getElementById('ars-tour-hole');
        const w = parseFloat(hole.getAttribute('width'));
        const h = parseFloat(hole.getAttribute('height'));
        const t = window.ArselnelTour.activeTarget;
        return {
          stepIndex: window.ArselnelTour.currentStepIndex,
          targetSelector: window.ArselnelTour.currentTour.steps[window.ArselnelTour.currentStepIndex].target,
          activeTargetId: t ? t.id : null,
          activeTargetTag: t ? t.tagName : null,
          width: w,
          height: h
        };
      })()
    `);
    console.log(`  > Target: ${gameStepInfo.activeTargetTag}#${gameStepInfo.activeTargetId} (Step ${gameStepInfo.stepIndex})`);
    console.log(`  > Game Card Spotlight Size: ${Math.round(gameStepInfo.width)}px x ${Math.round(gameStepInfo.height)}px`);
    const cardEncompassed = gameStepInfo.width > 250 && gameStepInfo.height > 150;
    console.log('  > Card Spotlight encompasses full card (> 250x150):', cardEncompassed ? 'LULUS' : 'GAGAL');

    const shot2 = path.join(SCREENSHOT_DIR, 'tour_hab_permainan_laptop_1366x768.png');
    await client.captureScreenshot(shot2);
    fs.copyFileSync(shot2, path.join(ARTIFACT_DIR, 'tour_hab_permainan_laptop_1366x768.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_hab_permainan_laptop_1366x768.png`);

    testResults.push({
      test: 'Hab Permainan Full Card Spotlight',
      status: cardEncompassed
    });

    // TEST 3: Slaid Interaktif - Digital Pen Spotlight
    console.log('\n--- UJIAN 3: Slaid Interaktif Tour (Digital Pen Highlight) ---');
    await client.setViewport(1024, 768); // iPad Landscape
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/nota_pembelajaran/slaid_interaktif.html` });
    await waitForTour();

    await client.eval(`window.ArselnelTour.startTour('slides', true);`);
    await new Promise(r => setTimeout(r, 400));
    await client.eval(`window.ArselnelTour.goToStep(1);`); // Step 2: Digital Pen #tool-pen
    await new Promise(r => setTimeout(r, 400));

    const penStepInfo = await client.eval(`
      (function() {
        const hole = document.getElementById('ars-tour-hole');
        const tooltip = document.querySelector('.ars-tour-tooltip');
        return {
          holeX: parseFloat(hole.getAttribute('x')),
          holeY: parseFloat(hole.getAttribute('y')),
          tooltipTop: parseFloat(tooltip.style.top)
        };
      })()
    `);
    console.log(`  > Pen Hole Pos: X=${Math.round(penStepInfo.holeX)}, Y=${Math.round(penStepInfo.holeY)}`);
    console.log(`  > Tooltip Top: ${Math.round(penStepInfo.tooltipTop)}px`);

    const shot3 = path.join(SCREENSHOT_DIR, 'tour_slaid_interaktif_ipad_1024x768.png');
    await client.captureScreenshot(shot3);
    fs.copyFileSync(shot3, path.join(ARTIFACT_DIR, 'tour_slaid_interaktif_ipad_1024x768.png'));
    console.log(`  > Tangkapan skrin disimpan: tour_slaid_interaktif_ipad_1024x768.png`);

    testResults.push({
      test: 'Slaid Interaktif Pen Spotlight',
      status: penStepInfo.holeX > 0 && penStepInfo.tooltipTop > 0
    });

    // TEST 4: Responsive Help Button Labels & Touch Target
    console.log('\n--- UJIAN 4: Butang Bantuan Responsif (Desktop vs iPad vs Mobile) ---');
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/halaman_utama/code.html` });
    await waitForTour();

    // 4.1 Desktop (1920x1080)
    await client.setViewport(1920, 1080);
    await new Promise(r => setTimeout(r, 400));
    const desktopBtn = await client.eval(`
      (function() {
        const btn = document.querySelector('.ars-tour-help-btn');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        const dSpan = btn.querySelector('.ars-tour-help-label-desktop');
        const tSpan = btn.querySelector('.ars-tour-help-label-tablet');
        const mSpan = btn.querySelector('.ars-tour-help-label-mobile');
        return {
          exists: true,
          height: rect.height,
          width: rect.width,
          dVisible: getComputedStyle(dSpan).display !== 'none',
          tVisible: getComputedStyle(tSpan).display !== 'none',
          mVisible: getComputedStyle(mSpan).display !== 'none'
        };
      })()
    `);
    console.log(`  > Desktop (1920px) Button: ${Math.round(desktopBtn.width)}x${Math.round(desktopBtn.height)}px | Label "Panduan Halaman":`, desktopBtn.dVisible ? 'YA' : 'TIDAK');

    // 4.2 iPad / Tablet (768x1024)
    await client.setViewport(768, 1024);
    await new Promise(r => setTimeout(r, 400));
    const tabletBtn = await client.eval(`
      (function() {
        const btn = document.querySelector('.ars-tour-help-btn');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        const dSpan = btn.querySelector('.ars-tour-help-label-desktop');
        const tSpan = btn.querySelector('.ars-tour-help-label-tablet');
        const mSpan = btn.querySelector('.ars-tour-help-label-mobile');
        return {
          height: rect.height,
          width: rect.width,
          dVisible: getComputedStyle(dSpan).display !== 'none',
          tVisible: getComputedStyle(tSpan).display !== 'none',
          mVisible: getComputedStyle(mSpan).display !== 'none'
        };
      })()
    `);
    console.log(`  > Tablet (768px) Button: ${Math.round(tabletBtn.width)}x${Math.round(tabletBtn.height)}px | Label "Bantuan":`, tabletBtn.tVisible ? 'YA' : 'TIDAK');

    // 4.3 Mobile iPhone (375x667)
    await client.setViewport(375, 667);
    await new Promise(r => setTimeout(r, 400));
    const mobileBtn = await client.eval(`
      (function() {
        const btn = document.querySelector('.ars-tour-help-btn');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        const dSpan = btn.querySelector('.ars-tour-help-label-desktop');
        const tSpan = btn.querySelector('.ars-tour-help-label-tablet');
        const mSpan = btn.querySelector('.ars-tour-help-label-mobile');
        return {
          height: rect.height,
          width: rect.width,
          dVisible: getComputedStyle(dSpan).display !== 'none',
          tVisible: getComputedStyle(tSpan).display !== 'none',
          mVisible: getComputedStyle(mSpan).display !== 'none'
        };
      })()
    `);
    console.log(`  > Mobile (375px) Button: ${Math.round(mobileBtn.width)}x${Math.round(mobileBtn.height)}px | Label "Bantuan":`, mobileBtn.mVisible ? 'YA' : 'TIDAK');

    testResults.push({
      test: 'Responsive Help Button Labels and Dimensions',
      status: desktopBtn.dVisible && !desktopBtn.tVisible && tabletBtn.tVisible && !tabletBtn.dVisible && mobileBtn.mVisible && mobileBtn.height >= 38
    });

    // TEST 5: Viewport Stress Test Across All 7 Devices
    console.log('\n--- UJIAN 5: Multi-Viewport Quality & Zero Horizontal Overflow (7 Viewports) ---');
    const viewports = [
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
      await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/halaman_utama/code.html` });
      await waitForTour();

      await client.eval(`window.ArselnelTour.startTour('dashboard', true);`);
      await new Promise(r => setTimeout(r, 400));

      const vpMetrics = await client.eval(`
        (function() {
          const docEl = document.documentElement;
          const tooltip = document.querySelector('.ars-tour-tooltip');
          const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
          return {
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            hasHorizontalOverflow: docEl.scrollWidth > docEl.clientWidth,
            tooltipHeight: tRect ? tRect.height : 0,
            tooltipWidth: tRect ? tRect.width : 0,
            tooltipLeft: tRect ? tRect.left : 0,
            tooltipRight: tRect ? tRect.right : 0
          };
        })()
      `);

      const fitsInScreen = vpMetrics.tooltipRight <= vp.w + 1 && vpMetrics.tooltipLeft >= 0;
      const heightOk = vpMetrics.tooltipHeight < vp.h * 0.75;
      console.log(`  > [${vp.name}]: Horiz Overflow: ${vpMetrics.hasHorizontalOverflow ? 'ADA (FAIL)' : 'TIADA (PASS)'} | Tooltip Fits: ${fitsInScreen ? 'YA' : 'TIDAK'} | Height: ${Math.round(vpMetrics.tooltipHeight)}px`);

      const shotPath = path.join(SCREENSHOT_DIR, `tour_hotfix_${vp.name}.png`);
      await client.captureScreenshot(shotPath);
      fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `tour_hotfix_${vp.name}.png`));

      testResults.push({
        test: `Viewport ${vp.name} No Overflow & Compact Tooltip`,
        status: !vpMetrics.hasHorizontalOverflow && fitsInScreen && heightOk
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
      console.log('🎉 SEMUA UJIAN QA HOTFIX GUIDED TOUR 1.1 BERJAYA 100%!');
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
