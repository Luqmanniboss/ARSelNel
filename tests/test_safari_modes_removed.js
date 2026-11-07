const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60490;
const CDP_PORT = 9240;
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
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
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
      } catch (err) { }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  console.log('================================================================');
  console.log('🧪 PENGESAHAN: PEMBUANGAN SEPENUHNYA 2 MOD SAFARI ARSELNEL');
  console.log('================================================================\n');

  // 1. Static Audit of Files
  console.log('--- BAHAGIAN 1: AUDIT STATIK KOD & HTML ---');
  const adventureHtml = fs.readFileSync(path.join(ROOT_DIR, 'cellquest/adventure.html'), 'utf8');
  const adventureCss = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/cellquest-adventure.css'), 'utf8');
  const adventureJs = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/cellquest-adventure.js'), 'utf8');
  const localServerJs = fs.readFileSync(path.join(ROOT_DIR, 'local-server.js'), 'utf8');

  assert(!adventureHtml.includes('lobby-card-mod-d'), 'Kad MOD D (lobby-card-mod-d) tiada dalam adventure.html');
  assert(!adventureHtml.includes('Cell Safari: Hutan Sel 3D'), 'Teks "Cell Safari: Hutan Sel 3D" tiada dalam adventure.html');
  assert(!adventureHtml.includes('Mula Jelajah Hutan Sel'), 'Butang "Mula Jelajah Hutan Sel" tiada dalam adventure.html');
  assert(!adventureHtml.includes('lobby-card-mod-safari3d'), 'Kad Safari Sel 3D (lobby-card-mod-safari3d) tiada dalam adventure.html');
  assert(!adventureHtml.includes('Safari Sel: Misi Saintis Muda'), 'Teks "Safari Sel: Misi Saintis Muda" tiada dalam adventure.html');
  assert(!adventureHtml.includes('Mula Safari Sel 3D'), 'Butang "Mula Safari Sel 3D" tiada dalam adventure.html');

  assert(adventureHtml.includes('lobby-card-mod-a'), 'Kad MOD A (Jelajah Makmal 3D) dikekalkan');
  assert(adventureHtml.includes('lobby-card-mod-b'), 'Kad MOD B (AR Orientasi Dunia) dikekalkan');
  assert(adventureHtml.includes('lobby-card-mod-c'), 'Kad MOD C (AR Kad Penanda) dikekalkan');

  assert(adventureCss.includes('grid-template-columns: repeat(3, 1fr)'), 'CSS Grid disetkan kepada 3 lajur seimbang (repeat(3, 1fr))');
  assert(!adventureCss.includes('.cq-lobby-card.mod-d'), 'CSS khusus .cq-lobby-card.mod-d telah dibersihkan');
  assert(!adventureJs.includes('DOM.lobbyBtnModD'), 'Rujukan DOM.lobbyBtnModD telah dibuang daripada cellquest-adventure.js');
  assert(!localServerJs.includes('/cellquest/safari3d'), 'Laluan routing /cellquest/safari3d telah dibuang daripada local-server.js');

  // 2. Headless Browser Verification
  console.log('\n--- BAHAGIAN 2: UJIAN PAPARAN WEBGL & BROWSER HEADLESS ---');
  const server = await startServer();
  const browserBin = findBrowserBinary();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arselnel-adventure-'));

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
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

  // Set mock student session
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

  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/adventure.html` }, msgId++);
  await new Promise(r => setTimeout(r, 2000));

  // Evaluate DOM state
  async function evalInPage(expr) {
    const res = await sendCDP(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true }, msgId++);
    return res.result ? res.result.value : null;
  }

  const cardsCount = await evalInPage("document.querySelectorAll('.cq-lobby-modes-grid .cq-lobby-card').length");
  assert(cardsCount === 3, `Bilangan kad mod pengembaraan dalam grid ialah tepat 3 (Sebenar: ${cardsCount})`);

  const cardTitles = await evalInPage("Array.from(document.querySelectorAll('.cq-lobby-modes-grid .card-title')).map(el => el.textContent.trim())");
  assert(cardTitles && cardTitles.includes('Jelajah Makmal 3D'), 'Mod A "Jelajah Makmal 3D" terpapar');
  assert(cardTitles && cardTitles.includes('AR Orientasi Dunia'), 'Mod B "AR Orientasi Dunia" terpapar');
  assert(cardTitles && cardTitles.includes('AR Kad Penanda'), 'Mod C "AR Kad Penanda" terpapar');
  assert(!cardTitles.includes('Cell Safari: Hutan Sel 3D'), 'Tiada tajuk Cell Safari di paparan');
  assert(!cardTitles.includes('Safari Sel: Misi Saintis Muda'), 'Tiada tajuk Safari Sel di paparan');

  const gridStyles = await evalInPage("window.getComputedStyle(document.querySelector('.cq-lobby-modes-grid')).gridTemplateColumns");
  assert(gridStyles && gridStyles.split(' ').length === 3, `Grid responsif desktop memaparkan 3 lajur seimbang: "${gridStyles}"`);

  // Capture screenshot of the clean 3-card adventure lobby
  const snap = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, msgId++);
  const outSnap = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/adventure_clean_3_modes.png';
  fs.writeFileSync(outSnap, Buffer.from(snap.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin lobi bersih disimpan di: ${outSnap}`);

  assert(consoleErrors.length === 0, `Sifar ralat konsol pada halaman lobi pengembaraan (Ralat: ${consoleErrors.join(', ') || 'Tiada'})`);

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

