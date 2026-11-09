const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function checkRect() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9338;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-rect-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1024,768'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (res.ok) break;
    } catch (_) {}
  }

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + port + '/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = evt => {
      const resp = JSON.parse(evt.data);
      if (resp.id === curId) {
        ws.removeEventListener('message', handler);
        res(resp);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: 'landscapePrimary' }
  });

  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 2500));

  const result = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.switchActiveModule('nota');
        window.KotakARSELNEL.placeVideoOnScreen(true);
        const card = document.getElementById('floating-card-container');
        const anchor = document.getElementById('floating-ar-anchor');
        const rect = card.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        
        const hudClearance = 82;
        const topSafe = 82;
        const botSafe = 18;
        const leftSafe = 16;
        const rightSafe = 16;
        const cardW = rect.width;
        const cardH = rect.height;
        const halfW = cardW / 2;
        const halfH = cardH / 2;
        const minX = leftSafe + halfW;
        const maxX = window.innerWidth - rightSafe - halfW;
        const minY = topSafe + halfH;
        const maxY = window.innerHeight - botSafe - halfH;

        return {
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          cardRect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
          anchorRect: { width: anchorRect.width, height: anchorRect.height, left: anchorRect.left, top: anchorRect.top },
          bounds: { minX, maxX, minY, maxY, isMinXGreater: minX > maxX, isMinYGreater: minY > maxY },
          anchorStyle: { left: anchor.style.left, top: anchor.style.top, transform: getComputedStyle(anchor).transform }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Full result:', JSON.stringify(result, null, 2));

  ws.close();
  proc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

checkRect().catch(console.error);
