/**
 * Script to capture real high-quality screenshots of ARSELNEL modules
 * for the new Manual Penggunaan 2.0 (Panduan Saintis Muda).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60520;
const CDP_PORT = 9265;
const ROOT_DIR = path.resolve(__dirname, '..');
const MANUAL_ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'manual');

if (!fs.existsSync(MANUAL_ASSETS_DIR)) {
  fs.mkdirSync(MANUAL_ASSETS_DIR, { recursive: true });
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
  throw new Error('Browser executable not found');
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
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const { res, rej } = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) rej(new Error(JSON.stringify(data.error)));
        else res(data.result);
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    return new Promise((res, rej) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { res, rej });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error('Eval Exception: ' + (r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails)));
    }
    return r.result ? r.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const r = await this.send('Page.captureScreenshot', { format: 'png', quality: 95 });
    const buf = Buffer.from(r.data, 'base64');
    const outPath = path.join(MANUAL_ASSETS_DIR, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Saved screenshot: assets/manual/${filename} (${Math.round(buf.length / 1024)} KB)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function captureAll() {
  console.log('[Capture] Starting screenshot capture pipeline...');
  const server = await startServer();

  const browserBin = findBrowser();
  const tmpDir = path.join(os.tmpdir(), 'arselnel_manual_cap_' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const browserProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  let pages = [];
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      pages = await getPages(CDP_PORT);
      if (pages.length > 0) break;
    } catch (_) {}
  }

  if (pages.length === 0) {
    throw new Error('Browser did not expose CDP endpoint');
  }

  const page = pages.find(p => p.type === 'page') || pages[0];
  const cdp = new CDPClient(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // Set default viewport 1280x800 for high readability on desktop/tablet
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Inject student auth mock
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('arselnel_current_user', JSON.stringify({
        id: 'usr_student_umie_123',
        name: 'Umie (Pelajar Sains)',
        nickname: 'Umie',
        role: 'student'
      }));
      localStorage.setItem('arselnel_kotak_onboarding_completed', 'true');
    `
  });

  try {
    // 1. MISI 1: Dashboard
    console.log('\n[1/8] Capturing Dashboard...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/halaman_utama/code.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi1_dashboard.png');

    // 2. MISI 2: Nota Interaktif
    console.log('\n[2/8] Capturing Nota Interaktif (Slaid Interaktif)...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/nota_pembelajaran/slaid_interaktif.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi2_nota_interaktif.png');

    // 3. MISI 3: Video Pembelajaran
    console.log('\n[3/8] Capturing Video Pembelajaran...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/perpustakaan_video/code.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi3_video_pembelajaran.png');

    // 4. MISI 4: SelBot AI
    console.log('\n[4/8] Capturing SelBot AI...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/selbot_ai/code.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi4_selbot_ai.png');

    // 5. MISI 5: Hab Permainan Sains
    console.log('\n[5/8] Capturing Hab Permainan Sains...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/hab_permainan/code.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi5_permainan_sains.png');

    // 6. MISI 6: CellQuest 3D
    console.log('\n[6/8] Capturing CellQuest 3D...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/code.html` });
    await new Promise(r => setTimeout(r, 2000));
    await cdp.captureScreenshot('misi6_cellquest_3d.png');

    // 7. MISI 7: Kotak ARSELNEL (Modal Cetak Kad AR 6 Marker)
    console.log('\n[7/8] Capturing Modal Cetak Kad AR & Marker Print...');
    await cdp.eval(`
      const btn = document.getElementById('btn-open-print-modal');
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 800));
    await cdp.captureScreenshot('misi7_cetak_kad_ar.png');

    // 8. MISI 8: Profil & Tetapan
    console.log('\n[8/8] Capturing Profil & Tetapan...');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/profil/code.html` });
    await new Promise(r => setTimeout(r, 1500));
    await cdp.captureScreenshot('misi8_profil_tetapan.png');

    console.log('\n🎉 ALL 8 MODULE SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } finally {
    cdp.close();
    browserProc.kill();
    server.close();
  }
}

captureAll().catch(e => {
  console.error('Fatal capture error:', e);
  process.exit(1);
});
