const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60494;
const CDP_PORT = 9244;
const ROOT_DIR = path.resolve(__dirname, '..');

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/compiler-test') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image.prod.js"></script>
        </head>
        <body>
          <h1>MindAR Compiler Runner</h1>
        </body>
        </html>
      `);
      return;
    }
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
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

async function main() {
  const server = await startServer();
  const chromePath = findChrome();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-compile-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--no-sandbox',
    '--window-size=1000,800'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1200));

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
  await sendCDP(ws, 'Page.enable', {}, msgId++);
  await sendCDP(ws, 'Runtime.enable', {}, msgId++);

  // Listen to console
  ws.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description).join(' ');
        console.log('[Browser Console]', text);
      }
    } catch (e) {}
  });

  await sendCDP(ws, 'Page.navigate', { url: `http://127.0.0.1:${PORT}/compiler-test` }, msgId++);
  await new Promise(r => setTimeout(r, 2500));

  console.log('Compiling 5 multi-marker targets (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan) with MindAR Compiler...');

  const compileScript = `
    (async () => {
      try {
        const Compiler = window.MINDAR.IMAGE.Compiler;
        if (!Compiler) throw new Error('Compiler class not found on window.MINDAR.IMAGE');
        const compiler = new Compiler();

        const loadImage = (src) => new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => res(img);
          img.onerror = (e) => rej(new Error('Failed to load ' + src));
          img.src = src;
        });

        console.log('Loading marker-video.png (Target 0)...');
        const img0 = await loadImage('/kotak_arselnel/assets/markers/marker-video.png');
        console.log('Target 0 loaded:', img0.width, 'x', img0.height);

        console.log('Loading marker-nota.png (Target 1)...');
        const img1 = await loadImage('/kotak_arselnel/assets/markers/marker-nota.png');
        console.log('Target 1 loaded:', img1.width, 'x', img1.height);

        console.log('Loading marker-kuiz.png (Target 2)...');
        const img2 = await loadImage('/kotak_arselnel/assets/markers/marker-kuiz.png');
        console.log('Target 2 loaded:', img2.width, 'x', img2.height);

        console.log('Loading marker-cellquest.png (Target 3 - Sel Haiwan / Original Box Face 4)...');
        const img3 = await loadImage('/kotak_arselnel/assets/markers/marker-cellquest.png');
        console.log('Target 3 loaded:', img3.width, 'x', img3.height);

        console.log('Loading marker-sel-tumbuhan.png (Target 4)...');
        const img4 = await loadImage('/kotak_arselnel/assets/markers/marker-sel-tumbuhan.png');
        console.log('Target 4 loaded:', img4.width, 'x', img4.height);

        console.log('Compiling 5-target array [0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan]...');
        await compiler.compileImageTargets([img0, img1, img2, img3, img4], (progress) => {
          console.log('Compilation progress: ' + Math.round(progress) + '%');
        });

        const buffer = compiler.exportData();
        console.log('Compilation complete! Buffer size:', buffer.byteLength);

        // Convert Uint8Array to base64
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch (err) {
        console.error('Compilation failed:', err.message, err.stack);
        return { error: err.message };
      }
    })()
  `;

  const evalRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: compileScript,
    awaitPromise: true,
    returnByValue: true
  }, msgId++);

  const result = evalRes.result ? evalRes.result.value : null;

  if (result && !result.error && typeof result === 'string') {
    const mindBuffer = Buffer.from(result, 'base64');
    const outMind = path.join(ROOT_DIR, 'kotak_arselnel/assets/markers/kotak_arselnel.mind');
    fs.writeFileSync(outMind, mindBuffer);
    console.log(`\n🎉 SUKSES: Fail .mind berjaya dijana di ${outMind} (${mindBuffer.length} bytes)`);
  } else {
    console.error('Compilation did not return valid base64 data:', result);
  }

  ws.close();
  chromeProc.kill();
  server.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
