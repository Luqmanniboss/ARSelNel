const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const CDP_PORT = 9338;

async function checkTest1() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_debug1_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

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

  const r = await send('Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('video');
      const v = window.KotakARSELNEL.state.videos ? window.KotakARSELNEL.state.videos[0] : null;
      window.KotakARSELNEL.syncPOVVideoPlayer(v);
      const f = document.getElementById('pov-player-frame');
      return {
        vExists: !!v,
        fExists: !!f,
        fHtml: f ? f.innerHTML : '',
        childrenCount: f ? f.children.length : 0
      };
    })()`,
    returnByValue: true
  });
  console.log('Test 1 evaluation result:', r.result.value);

  chromeProc.kill();
  process.exit(0);
}
checkTest1();

