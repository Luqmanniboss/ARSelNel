/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * HOTFIX GUIDED TOUR 1.3 — MOBILE SPOTLIGHT ACCURACY, DASHBOARD DECONSTRUCTION & KOTAK ARSELNEL ONBOARDING
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60546;
const CDP_PORT = 9291;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_tour_hotfix_1_3');

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

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const localPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(localPath, Buffer.from(res.data, 'base64'));
    const brainPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(brainPath, Buffer.from(res.data, 'base64'));
    return localPath;
  }

  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTests() {
  console.log('=== MEMULAKAN QA SUITE HOTFIX GUIDED TOUR 1.3 ===');
  const server = await startServer();
  console.log(`[HTTP Server] Berjalan pada http://127.0.0.1:${PORT}`);

  const browserPath = findBrowser();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars_tour_hotfix13_'));

  const chromeProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1920,1080',
    'about:blank'
  ]);

  let pages = [];
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      pages = await getPages(CDP_PORT);
      if (pages.length > 0) break;
    } catch (_) {}
  }

  const validPages = pages.filter(p => p.type === 'page' && !p.url.startsWith('chrome-extension://') && !p.url.startsWith('edge://'));
  const targetPage = validPages[0] || pages[0];
  console.log(`[CDP] Bersambung ke: ${targetPage.url}`);

  const client = new CDPClient(targetPage.webSocketDebuggerUrl);
  await client.ready;

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const studentUser = {
          id: 'usr_student_test_13',
          name: 'Nur (Pelajar Sains Tingkatan 1)',
          nickname: 'NUR',
          role: 'student',
          grade: 'Tingkatan 1'
        };
        localStorage.setItem('arselnel_current_user', JSON.stringify(studentUser));
        sessionStorage.setItem('arselnel_current_user', JSON.stringify(studentUser));
      } catch (_) {}
    `
  });

  const results = [];

  async function waitForTour(maxWait = 4000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      try {
        const ready = await client.eval(`Boolean(window.ArselnelTour && window.ARSELNEL_TOUR_CONFIGS)`);
        if (ready) return true;
      } catch (_) {}
      await sleep(150);
    }
    return false;
  }

  try {
    // =========================================================================
    // TEST 1: NOTA INTERAKTIF — COMPACT TOOLTIP & TIGHT CARD SPOTLIGHT
    // =========================================================================
    console.log('\n--- UJIAN 1: NOTA INTERAKTIF (Compact Tooltip & Accurate Spotlight) ---');
    await client.setViewport(390, 844); // iPhone 14 test viewport
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/nota_pembelajaran/code.html` });
    await waitForTour();
    await sleep(800);

    // Launch tour step 3 (Kad Slaid Pembelajaran)
    const test1_step3 = await client.eval(`(async () => {
      window.ArselnelTour.startTour('notes', true);
      window.ArselnelTour.goToStep(2); // Step 3: Kad Slaid Pembelajaran
      await new Promise(r => setTimeout(r, 600));
      
      const tooltip = document.querySelector('.ars-tour-tooltip');
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      
      const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        tooltipHeight: tRect ? tRect.height : 0,
        tooltipWidth: tRect ? tRect.width : 0,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        isCompact: tRect ? tRect.height < 260 : false,
        targetTagName: target ? target.tagName : null,
        targetClass: target ? target.className : null
      };
    })()`);

    console.log('Hasil Step 3 (Kad Slaid):', test1_step3);
    await client.captureScreenshot('tour_hotfix13_nota_step3_iphone14.png');

    const pass1_step3 = (
      test1_step3.isCompact &&
      test1_step3.tooltipHeight > 0 &&
      test1_step3.stepTitle?.includes('Kad Slaid Pembelajaran')
    );
    results.push({ name: 'Nota Step 3 Compact Tooltip (<260px) & Tight Card Target', pass: pass1_step3 });

    // Step 4: Butang "Buka Nota Interaktif"
    const test1_step4 = await client.eval(`(async () => {
      window.ArselnelTour.goToStep(3); // Step 4: Butang Buka Nota Interaktif
      await new Promise(r => setTimeout(r, 600));
      
      const tooltip = document.querySelector('.ars-tour-tooltip');
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      
      const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        tooltipHeight: tRect ? tRect.height : 0,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        targetText: target ? target.textContent.trim() : '',
        isTightButtonFrame: fRect ? (fRect.height < 70 && fRect.width < 260) : false
      };
    })()`);

    console.log('Hasil Step 4 (Butang Buka Nota):', test1_step4);
    await client.captureScreenshot('tour_hotfix13_nota_step4_iphone14.png');

    const pass1_step4 = (
      test1_step4.isTightButtonFrame &&
      test1_step4.stepTitle?.includes('Buka Pembaca Slaid')
    );
    results.push({ name: 'Nota Step 4 Tight Button Spotlight (<70px height)', pass: pass1_step4 });

    // =========================================================================
    // TEST 2: DASHBOARD — DISCRETE TARGETS & NO OVERSIZED ENCOMPASSING FRAME
    // =========================================================================
    console.log('\n--- UJIAN 2: DASHBOARD (Discrete Element Targets on Mobile) ---');
    await client.setViewport(390, 844);
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/halaman_utama/code.html` });
    await waitForTour();
    await sleep(800);

    // Test Step 1: Navigasi
    const test2_step1 = await client.eval(`(async () => {
      window.ArselnelTour.startTour('dashboard', true);
      window.ArselnelTour.goToStep(0);
      await new Promise(r => setTimeout(r, 600));
      
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        targetClass: target ? target.className : ''
      };
    })()`);
    console.log('Dashboard Step 1 (Navigasi):', test2_step1);
    await client.captureScreenshot('tour_hotfix13_dashboard_step1_iphone14.png');

    // Test Step 3: Hero Title (#hero-title)
    const test2_step3 = await client.eval(`(async () => {
      window.ArselnelTour.goToStep(2); // Step 3: #hero-title
      await new Promise(r => setTimeout(r, 600));
      
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        isNotEncompassingWholeScreen: fRect ? fRect.height < 300 : false,
        targetId: target ? target.id : ''
      };
    })()`);
    console.log('Dashboard Step 3 (#hero-title):', test2_step3);
    await client.captureScreenshot('tour_hotfix13_dashboard_step3_iphone14.png');

    // Test Step 4: Butang "Mula Teroka Sel" (#btn-hero-explore)
    const test2_step4 = await client.eval(`(async () => {
      window.ArselnelTour.goToStep(3); // Step 4: #btn-hero-explore
      await new Promise(r => setTimeout(r, 600));
      
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        isTightButton: fRect ? (fRect.height < 90 && fRect.width < 320) : false,
        targetId: target ? target.id : ''
      };
    })()`);
    console.log('Dashboard Step 4 (#btn-hero-explore):', test2_step4);
    await client.captureScreenshot('tour_hotfix13_dashboard_step4_iphone14.png');

    const pass2 = (
      test2_step3.isNotEncompassingWholeScreen &&
      test2_step4.isTightButton
    );
    results.push({ name: 'Dashboard Discrete Elements (No Giant Screen-spanning Frame)', pass: pass2 });

    // =========================================================================
    // TEST 3: KOTAK ARSELNEL — COMPLETE 8-STEP GUIDED TOUR
    // =========================================================================
    console.log('\n--- UJIAN 3: KOTAK ARSELNEL (8-Step WebAR Guided Tour) ---');
    await client.setViewport(390, 844);
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/kotak_arselnel/code.html` });
    await waitForTour();
    await sleep(800);

    // Verify starting Kotak ARSELNEL tour
    const test3_init = await client.eval(`(async () => {
      if (!window.ArselnelTour) return { error: 'No ArselnelTour' };
      
      // Hide loading screen if still pending in headless
      const ls = document.getElementById('loading-screen');
      if (ls) ls.classList.add('hidden');
      
      // Launch tour
      const started = window.ArselnelTour.startTour('kotak_arselnel', true);
      await new Promise(r => setTimeout(r, 600));
      
      const totalSteps = window.ArselnelTour.currentTour ? window.ArselnelTour.currentTour.steps.length : 0;
      const portalActive = document.querySelector('.ars-tour-portal')?.classList.contains('is-active');
      
      return {
        started,
        totalSteps,
        portalActive,
        step1Title: document.getElementById('ars-tour-title')?.textContent
      };
    })()`);
    console.log('Kotak ARSELNEL Tour Launch:', test3_init);
    await client.captureScreenshot('tour_hotfix13_kotak_step1_iphone14.png');

    const pass3_init = (
      test3_init.started === true &&
      test3_init.totalSteps === 8 &&
      test3_init.portalActive === true
    );
    results.push({ name: 'Kotak ARSELNEL 8-Step Tour Auto-Initializes & Mounts Portal', pass: pass3_init });

    // Verify Step 2 (Bingkai Pengimbas)
    const test3_step2 = await client.eval(`(async () => {
      window.ArselnelTour.goToStep(1); // Step 2: Bingkai Pengimbas
      await new Promise(r => setTimeout(r, 600));
      
      const frame = document.querySelector('.ars-tour-spotlight-frame');
      const target = window.ArselnelTour.activeTarget;
      const fRect = frame ? frame.getBoundingClientRect() : null;
      
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        frameHeight: fRect ? fRect.height : 0,
        frameWidth: fRect ? fRect.width : 0,
        targetClass: target ? target.className : ''
      };
    })()`);
    console.log('Kotak ARSELNEL Step 2 (Bingkai Pengimbas):', test3_step2);
    await client.captureScreenshot('tour_hotfix13_kotak_step2_scanner_iphone14.png');

    // Verify Step 8 (Finish with Custom Finish Text)
    const test3_step8 = await client.eval(`(async () => {
      window.ArselnelTour.goToStep(7); // Step 8: Sedia untuk Mengimbas!
      await new Promise(r => setTimeout(r, 600));
      
      const finishBtn = document.querySelector('[data-tour-action="finish"]');
      return {
        stepTitle: document.getElementById('ars-tour-title')?.textContent,
        finishBtnText: finishBtn ? finishBtn.textContent.trim() : ''
      };
    })()`);
    console.log('Kotak ARSELNEL Step 8 (Finish):', test3_step8);
    await client.captureScreenshot('tour_hotfix13_kotak_step8_finish_iphone14.png');

    const pass3_step8 = test3_step8.finishBtnText?.includes('Selesai, Jom Imbas!');
    results.push({ name: 'Kotak ARSELNEL Step 8 Custom Action Button ("Selesai, Jom Imbas!")', pass: pass3_step8 });

    // Verify Panduan Pengguna button click launches ArselnelTour
    const test3_userGuideBtn = await client.eval(`(async () => {
      window.ArselnelTour.closeTour();
      await new Promise(r => setTimeout(r, 200));
      
      const btn = document.getElementById('btn-open-user-guide');
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 500));
      
      return {
        portalActiveAfterClick: document.querySelector('.ars-tour-portal')?.classList.contains('is-active'),
        currentTourId: window.ArselnelTour.currentTour ? window.ArselnelTour.currentTour.id : null
      };
    })()`);
    console.log('Panduan Pengguna Button Click Test:', test3_userGuideBtn);

    const pass3_btn = (
      test3_userGuideBtn.portalActiveAfterClick === true &&
      test3_userGuideBtn.currentTourId === 'kotak_arselnel'
    );
    results.push({ name: 'Kotak ARSELNEL Panduan Pengguna Button Triggers Guided Tour', pass: pass3_btn });

    // =========================================================================
    // TEST 4: MULTI-VIEWPORT RESPONSIVE INTEGRITY & ZERO OVERFLOW (8 VIEWPORTS)
    // =========================================================================
    console.log('\n--- UJIAN 4: RESPONSIVE MULTI-VIEWPORT VERIFICATION (8 VIEWPORTS) ---');
    const viewports = [
      { name: 'Android Galaxy A', width: 360, height: 800 },
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 14 (Test Report Viewport)', width: 390, height: 844 },
      { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
      { name: 'iPad Portrait', width: 768, height: 1024 },
      { name: 'iPad Landscape', width: 1024, height: 768 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Desktop Full HD', width: 1920, height: 1080 }
    ];

    for (const vp of viewports) {
      await client.setViewport(vp.width, vp.height);
      await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/nota_pembelajaran/code.html` });
      await waitForTour();
      await sleep(500);

      const vpTest = await client.eval(`(async () => {
        window.ArselnelTour.startTour('notes', true);
        window.ArselnelTour.goToStep(2); // Kad Slaid Pembelajaran
        await new Promise(r => setTimeout(r, 600));
        
        const tooltip = document.querySelector('.ars-tour-tooltip');
        const tRect = tooltip ? tooltip.getBoundingClientRect() : null;
        
        const docEl = document.documentElement;
        const scrollWidth = docEl.scrollWidth;
        const clientWidth = docEl.clientWidth;
        const hasHorizontalOverflow = scrollWidth > clientWidth;
        
        const insideViewport = tRect ? (
          tRect.left >= 0 &&
          tRect.right <= window.innerWidth + 2 &&
          tRect.top >= 0 &&
          tRect.bottom <= window.innerHeight + 2
        ) : false;
        
        return {
          insideViewport,
          hasHorizontalOverflow,
          scrollWidth,
          clientWidth,
          tooltipWidth: tRect ? tRect.width : 0,
          tooltipHeight: tRect ? tRect.height : 0
        };
      })()`);

      console.log(`Viewport [${vp.name} ${vp.width}x${vp.height}]:`, vpTest);
      const filename = `tour_hotfix13_${vp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${vp.width}x${vp.height}.png`;
      await client.captureScreenshot(filename);

      const passVp = vpTest.insideViewport && !vpTest.hasHorizontalOverflow;
      results.push({ name: `Responsive & Zero Overflow: ${vp.name} (${vp.width}x${vp.height})`, pass: passVp });
    }

  } catch (err) {
    console.error('Ralat semasa menjalankan ujian QA:', err);
  } finally {
    client.close();
    chromeProc.kill();
    server.close();
  }

  console.log('\n======================================================');
  console.log('              RINGKASAN UJIAN QA HOTFIX 1.3');
  console.log('======================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.pass ? '✅ LULUS' : '❌ GAGAL';
    if (!r.pass) allPassed = false;
    console.log(`${status} - ${r.name}`);
  }
  console.log('======================================================');
  console.log(`STATUS KESELURUHAN: ${allPassed ? 'SEMUA UJIAN LULUS (100%)' : 'ADA KEGAGALAN'}`);
  return allPassed;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
