const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const tmpDir = path.join(process.env.TEMP || '.', 'pdf-err-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9295', '--headless=new', '--user-data-dir=' + tmpDir
  ]);
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9295/json/list');
      if (res.ok) {
        const list = await res.json();
        const page = list.find(t => t.type === 'page');
        if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
      }
    } catch (_) {}
  }
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 1;
  const send = (method, params) => new Promise(res => {
    const curId = id++;
    const h = (m) => {
      const p = JSON.parse(m.data);
      if (p.id === curId) { ws.removeEventListener('message', h); res(p); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.addEventListener('message', (m) => {
    const p = JSON.parse(m.data);
    if (p.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', p.params.type, p.params.args.map(a => a.value || a.description));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 2500));
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        window.KotakARSELNEL.switchActiveModule('nota');
        await new Promise(r => setTimeout(r, 4000));
      })()
    `,
    awaitPromise: true
  });

  cp.kill();
  process.exit(0);
}
test();

