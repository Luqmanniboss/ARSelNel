const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const CDP_PORT = 9345;
async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_chk_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
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
    return new Promise((resolve) => {
      const id = 123;
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const r = await send('Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.state.activeVideo = null;
      window.KotakARSELNEL.handleTargetFound(0, 'video');

      const cardsScroll = document.getElementById('video-cards-scroll');
      return {
        cardsScrollExists: !!cardsScroll,
        innerHTML: cardsScroll ? cardsScroll.innerHTML.substring(0, 100) : null,
        queryCards: cardsScroll ? cardsScroll.querySelectorAll('.ar-video-item').length : 0,
        queryAny: cardsScroll ? cardsScroll.children.length : 0
      };
    })()`,
    returnByValue: true
  });
  console.log('Result after handleTargetFound:', JSON.stringify(r));
  ws.close();
  chromeProc.kill();
}
run();
