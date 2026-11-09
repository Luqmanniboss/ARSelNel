const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const CDP_PORT = 9346;

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

(async () => {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_cdp_test_' + Date.now());
  const proc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    '--window-size=1280,800',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  setTimeout(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      const ws = new (globalThis.WebSocket)(page.webSocketDebuggerUrl);
      await new Promise(r => ws.onopen = r);
      let id = 1;
      await sendCDP(ws, 'Runtime.enable', {}, id++);

      const evalRes = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `
          (() => {
            const container = document.createElement('div');
            container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;overflow:hidden;contain:strict;pointer-events:none;z-index:40;';
            document.body.appendChild(container);

            const testEl = document.createElement('div');
            testEl.style.cssText = 'position:absolute;width:400px;height:400px;left:50000px;top:5000px;';
            container.appendChild(testEl);

            return {
              docW: document.documentElement.scrollWidth,
              docH: document.documentElement.scrollHeight,
              bodyW: document.body.scrollWidth,
              bodyH: document.body.scrollHeight
            };
          })()
        `,
        returnByValue: true
      }, id++);
      console.log('With contained spatial layer:', evalRes.result.value);
      proc.kill();
    } catch(err) {
      console.error(err);
      proc.kill();
    }
  }, 3500);
})();
