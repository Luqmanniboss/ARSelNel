const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9339;

async function captureShot() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_shot_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1200,800',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 4500));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.evaluate', {
    expression: `(() => {
      const v = (window.KotakARSELNEL && window.KotakARSELNEL.ARState && window.KotakARSELNEL.ARState.videos[0]) || { id: 'v1', title: 'Video Struktur Sel', url: 'https://example.com/v1' };
      window.KotakARSELNEL.ARState.activeVideo = v;
      window.KotakARSELNEL.handleTargetFound(0, 'video');
      window.KotakARSELNEL.syncPOVVideoPlayer(v);

      window.KotakARSELNEL.startAddPanelScan();
      window.KotakARSELNEL.handleTargetFound(1, 'nota');
    })()`,
    awaitPromise: true
  });

  await new Promise(r => setTimeout(r, 1200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(__dirname, '..', 'kotak_arselnel_fasa4eb21_verified.png');
  const artPath = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_fasa4eb21_verified.png';
  
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  fs.writeFileSync(artPath, Buffer.from(shot.data, 'base64'));
  console.log('✅ Screenshot captured and saved to:', outPath);

  ws.close();
  cleanup();
}

captureShot();

