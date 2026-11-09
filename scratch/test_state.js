const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const CDP_PORT = 9337;

async function checkState() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_check_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 4000));
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

  const r = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      hasKotak: !!window.KotakARSELNEL,
      hasState: !!window.KotakARSELNEL?.state,
      videosLen: window.KotakARSELNEL?.state?.videos?.length,
      notesLen: window.KotakARSELNEL?.state?.notes?.length,
      povFrameHtml: document.getElementById('pov-player-frame')?.innerHTML,
      activeVideo: window.KotakARSELNEL?.state?.activeVideo
    })`,
    returnByValue: true
  });
  console.log('State inspection:', r.result.value);

  chromeProc.kill();
  process.exit(0);
}
checkState();

