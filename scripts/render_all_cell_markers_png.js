const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60495;
const CDP_PORT = 9245;
const ROOT_DIR = path.resolve(__dirname, '..');

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
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

async function renderSvgToPng(ws, msgIdRef, svgRelativeUrl, outPngPath) {
  console.log(`Navigating to ${svgRelativeUrl}...`);
  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}${svgRelativeUrl}` }, msgIdRef.id++);
  await new Promise(r => setTimeout(r, 1500));

  console.log(`Capturing screenshot for ${outPngPath}...`);
  const snap = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1000, height: 1000, scale: 1 }
  }, msgIdRef.id++);

  const buf = Buffer.from(snap.data, 'base64');
  fs.writeFileSync(outPngPath, buf);
  console.log(`✅ Saved ${path.basename(outPngPath)} (${buf.length} bytes)`);
}

async function main() {
  const server = await startServer();
  const chromePath = findChrome();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-marker-render-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1000,1000'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1500));

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

  const msgIdRef = { id: 1 };
  await sendCDP(ws, 'Page.enable', {}, msgIdRef.id++);
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1000,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  }, msgIdRef.id++);

  const forceAll = process.argv.includes('--all');

  if (forceAll) {
    // Render Sel Haiwan
    const outHaiwan = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-sel-haiwan.png');
    await renderSvgToPng(ws, msgIdRef, '/kotak_arselnel/assets/markers/marker-sel-haiwan.svg', outHaiwan);

    // Render Sel Tumbuhan
    const outTumbuhan = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-sel-tumbuhan.png');
    await renderSvgToPng(ws, msgIdRef, '/kotak_arselnel/assets/markers/marker-sel-tumbuhan.svg', outTumbuhan);

    // Copy Sel Haiwan to marker-cellquest.png for backwards compatibility
    const outCellQuest = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-cellquest.png');
    fs.copyFileSync(outHaiwan, outCellQuest);
    console.log(`✅ Synced backwards-compatible marker-cellquest.png`);

    // Render Jelajah 3D (Target Index 5 - Fasa 4E-E.2)
    const outJelajah3D = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-jelajah3d.png');
    await renderSvgToPng(ws, msgIdRef, '/kotak_arselnel/assets/markers/marker-jelajah3d.svg', outJelajah3D);

    // Render AR Orientasi Dunia (Target Index 6 - Fasa 4E-E.3)
    const outOrientasiDunia = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-orientasi-dunia.png');
    await renderSvgToPng(ws, msgIdRef, '/kotak_arselnel/assets/markers/marker-orientasi-dunia.svg', outOrientasiDunia);
  }

  // Render SelBot AI (Target Index 7 - Fasa 4F)
  const outSelbot = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/marker-selbot.png');
  await renderSvgToPng(ws, msgIdRef, '/kotak_arselnel/assets/markers/marker-selbot.svg', outSelbot);

  ws.close();
  chromeProc.kill();
  server.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

main().catch(err => {
  console.error('Error rendering PNG markers:', err);
  process.exit(1);
});

