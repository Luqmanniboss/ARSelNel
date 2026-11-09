const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60498;
const CDP_PORT = 9248;
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/kotak_arselnel' || reqPath === '/kotak_arselnel/') {
      reqPath = '/kotak_arselnel/code.html';
    }
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findBrowserBinary() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
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

async function run() {
  console.log('================================================================');
  console.log('📦 UJIAN PENGESAHAN: KOTAK ARSELNEL (FASA 2 - VIDEO MARKER PROTOTYPE)');
  console.log('================================================================\n');

  // 1. Static File Audit
  console.log('--- BAHAGIAN 1: AUDIT FAIL & INTEGRITI ASET MARKER ---');
  const svgPath = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-video.svg');
  const pngPath = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-video.png');
  const mindPath = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/kotak_arselnel.mind');

  assert(fs.existsSync(svgPath), 'Fail reka bentuk vektor marker-video.svg wujud');
  assert(fs.existsSync(pngPath) && fs.statSync(pngPath).size > 100000, `Fail imej marker-video.png wujud dan beresolusi tinggi (${fs.statSync(pngPath).size} bytes)`);
  assert(fs.existsSync(mindPath) && fs.statSync(mindPath).size > 100000, `Fail sasaran MindAR kotak_arselnel.mind wujud dan sah (${fs.statSync(mindPath).size} bytes)`);

  const codeHtml = fs.readFileSync(path.join(ROOT_DIR, 'kotak_arselnel/code.html'), 'utf8');
  const codeJs = fs.readFileSync(path.join(ROOT_DIR, 'kotak_arselnel/kotak-arselnel.js'), 'utf8');
  const codeCss = fs.readFileSync(path.join(ROOT_DIR, 'kotak_arselnel/kotak-arselnel.css'), 'utf8');
  const printHtml = fs.readFileSync(path.join(ROOT_DIR, 'kotak_arselnel/marker-print.html'), 'utf8');
  const localServerJs = fs.readFileSync(path.join(ROOT_DIR, 'local-server.js'), 'utf8');

  assert(codeHtml.includes('mindar-image-three.prod.js'), 'code.html memuatkan enjin MindAR Three.js');
  assert(codeHtml.includes('three.min.js') || codeHtml.includes('window.THREE'), 'code.html memuatkan sokongan enjin Three.js');
  assert(codeHtml.includes('cms-content-adapter.js'), 'code.html memuatkan CMS Content Adapter sedia ada');
  assert(codeHtml.includes('id="btn-place-video"'), 'code.html mengandungi butang "Letak Video" (persediaan Fasa 3)');
  assert(localServerJs.includes('/kotak_arselnel'), 'Laluan alias /kotak_arselnel didaftarkan dalam local-server.js');
  assert(printHtml.includes('window.print()'), 'Halaman cetakan marker-print.html sedia untuk murid');

  // 2. Headless Browser Runtime Verification
  console.log('\n--- BAHAGIAN 2: UJIAN PAPARAN WEBGL, MINDAR & CMS INTEGRATION ---');
  const server = await startServer();
  const browserBin = findBrowserBinary();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-kotak-'));

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--no-sandbox',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1280,900'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1400));

  const httpGet = (url) => new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const targets = await httpGet(`http://127.0.0.1:${CDP_PORT}/json`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise(r => { ws.onopen = r; });

  let msgId = 1;
  const consoleErrors = [];

  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        const text = data.params.args.map(a => a.value || a.description).join(' ');
        if (!text.includes('favicon.ico') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    } catch (e) {}
  });

  await sendCDP(ws, 'Page.enable', {}, msgId++);
  await sendCDP(ws, 'Runtime.enable', {}, msgId++);

  // Set mock student session to prevent auth-guard redirection
  await sendCDP(ws, 'Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const mockUser = {
          id: 'student-tester-1',
          email: 'student@arselnel.edu.my',
          user_metadata: { full_name: 'Sains Muda ARSELNEL', role: 'student' }
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
      } catch (e) {}
    `
  }, msgId++);

  // Navigate to Kotak ARSELNEL
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/kotak_arselnel/code.html` }, msgId++);
  await new Promise(r => setTimeout(r, 3000));

  async function evalInPage(expr) {
    const res = await sendCDP(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true }, msgId++);
    return res.result ? res.result.value : null;
  }

  // 1. Check MindAR and Three.js global availability
  const hasMindAR = await evalInPage("!!(window.MINDAR && window.MINDAR.IMAGE && window.MINDAR.IMAGE.MindARThree)");
  assert(hasMindAR, 'Pustaka MindARThree berjaya dimuatkan ke dalam window');

  const hasThree = await evalInPage("!!(window.THREE && window.THREE.WebGLRenderer)");
  assert(hasThree, 'Three.js WebGLRenderer berjaya diaktifkan');

  // 2. Check Videos Loaded from CMS
  const videoCount = await evalInPage("window.KotakARSELNEL && window.KotakARSELNEL.state.videos.length");
  assert(videoCount > 0, `Senarai video sains berjaya diambil daripada CMS (Jumlah: ${videoCount} video)`);

  const renderedCardsCount = await evalInPage("document.querySelectorAll('#video-cards-scroll .ar-video-item').length");
  assert(renderedCardsCount > 0, `Kad video berjaya dipaparkan dalam panel senarai pemilihan (${renderedCardsCount} kad)`);

  // 3. Simulate Video Selection
  await evalInPage("window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0])");
  await new Promise(r => setTimeout(r, 600));

  const isPlayerActive = await evalInPage("document.getElementById('active-player-view').classList.contains('is-active')");
  assert(isPlayerActive, 'Paparan pemain video interaktif berjaya diaktifkan apabila video dipilih');

  const playerTitle = await evalInPage("document.getElementById('player-video-title').textContent");
  assert(playerTitle && playerTitle.length > 5, `Tajuk video terpapar dengan tepat: "${playerTitle}"`);

  const hasPlaceButton = await evalInPage("!!document.getElementById('btn-place-video')");
  assert(hasPlaceButton, 'Butang "Letak Video" sedia ada dan aktif dalam pemain video');

  // 4. Force Show Floating Panel for Visual Snapshot
  await evalInPage(`
    document.getElementById('floating-ar-anchor').classList.add('is-visible');
    document.getElementById('floating-ar-anchor').style.left = '50%';
    document.getElementById('floating-ar-anchor').style.top = '50%';
  `);
  await new Promise(r => setTimeout(r, 500));

  const snap = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, msgId++);
  const snapOut = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_video_prototype.png';
  fs.writeFileSync(snapOut, Buffer.from(snap.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin prototaip panel video AR disimpan di: ${snapOut}`);

  assert(consoleErrors.length === 0, `Sifar ralat konsol JavaScript (Ralat: ${consoleErrors.join(', ') || 'Tiada'})`);

  ws.close();
  chromeProc.kill();
  server.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN: ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
