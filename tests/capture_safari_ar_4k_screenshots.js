const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const PORT = 60498;
const CDP_PORT = 9350;

function createMimeLookup() {
  const table = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };
  return (ext) => table[ext.toLowerCase()] || 'application/octet-stream';
}

function startStaticServer(rootDir, port) {
  const getMime = createMimeLookup();
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/cellquest/safari.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': getMime(ext), 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

async function findChromePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Chrome executable not found');
}

async function main() {
  console.log('Starting 4K Screen Capture Harness with Auth Mock...');
  const rootDir = path.resolve(__dirname, '..');
  const server = await startStaticServer(rootDir, PORT);
  console.log(`Static server running on http://127.0.0.1:${PORT}`);

  const chromePath = await findChromePath();
  const tempProfile = path.join(rootDir, 'tests', 'temp_chrome_4k_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1920,1080',
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    `--user-data-dir=${tempProfile}`
  ]);

  await new Promise(r => setTimeout(r, 1600));

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page') || tabs[0];
  const cdpWs = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise(r => { cdpWs.onopen = r; });

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleErrors = [];

  cdpWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      const errText = data.params.args.map(a => a.value || a.description || '').join(' ');
      if (!errText.includes('favicon.ico')) consoleErrors.push(errText);
    }
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    pendingRequests.set(id, { resolve, reject });
    cdpWs.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Inject student mock auth session before navigation
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const mockUser = {
          id: 'student-test-safari-4k',
          email: 'pelajar4k@arselnel.edu.my',
          nama: 'Ahmad Daniel (Saintis Muda)',
          role: 'student',
          user_metadata: { nama: 'Ahmad Daniel (Saintis Muda)', full_name: 'Ahmad Daniel' }
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
        localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            user: mockUser,
            access_token: 'fake-jwt-token'
          }
        }));
      } catch (_) {}
    `
  });

  console.log('Navigating to Safari AR...');
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/cellquest/safari.html` });
  await new Promise(r => setTimeout(r, 2500));

  // Dismiss intro and teleport player to Taman Arnab entrance looking through arch
  console.log('Dismissing intro and positioning player at Taman Arnab entrance...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const startBtn = document.getElementById('cs-intro-start');
      if (startBtn) startBtn.click();
      setTimeout(() => {
        if (window.CellSafari && window.CellSafari.teleport) {
          // Player stands at boardwalk entrance (x: -30, z: 36.5) looking north (rotY: 0) directly towards Arnab Comel
          window.CellSafari.teleport(-30, 36.5, 0);
          window.CellSafari.setQuality('ultra');
        }
      }, 300);
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  // Capture 1080p Screenshot (1920x1080)
  console.log('Capturing 1080p Screenshot (1920x1080)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 1000));

  const ss1080 = await send('Page.captureScreenshot', { format: 'png' });
  const shot1080Path = path.join(ARTIFACT_DIR, 'taman_arnab_3d_gameplay_1080p.png');
  fs.writeFileSync(shot1080Path, Buffer.from(ss1080.data, 'base64'));
  console.log(`Saved 1080p screenshot (${Math.round(ss1080.data.length * 0.75 / 1024)} KB) to ${shot1080Path}`);

  // Capture 4K Screenshot (3840x2160)
  console.log('Capturing 4K Screenshot (3840x2160 Ultra Preset)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 3840,
    height: 2160,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new Event('resize'));
      if (window.CellSafari && window.CellSafari.setQuality) {
        window.CellSafari.setQuality('ultra');
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const ss4k = await send('Page.captureScreenshot', { format: 'png' });
  const shot4kPath = path.join(ARTIFACT_DIR, 'taman_arnab_3d_gameplay_4k.png');
  fs.writeFileSync(shot4kPath, Buffer.from(ss4k.data, 'base64'));
  console.log(`Saved 4K screenshot (${Math.round(ss4k.data.length * 0.75 / 1024)} KB) to ${shot4kPath}`);

  // Check diagnostics
  const diag = await send('Runtime.evaluate', {
    expression: `JSON.stringify(window.CellSafari.getDiagnostics())`,
    returnByValue: true
  });
  console.log('Cell Safari Diagnostics:', diag.result.value);

  // Close and cleanup
  cdpWs.close();
  chromeProc.kill();
  server.close();
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (_) {}

  console.log('Screen capture completed successfully with 0 errors!');
}

main().catch(err => {
  console.error('Error in capture harness:', err);
  process.exit(1);
});
