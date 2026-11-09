const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'diag-pdf-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });
  const cp = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9296', '--headless=new', '--ignore-certificate-errors', '--user-data-dir=' + tmpDir
  ]);
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9296/json/list');
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
  await send('Page.enable');
  await send('Page.navigate', { url: 'https://127.0.0.1:3443/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 3000));
  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        window.KotakARSELNEL.switchActiveModule('nota');
        await new Promise(r => setTimeout(r, 2000));
        const canvas = document.getElementById('nota-pdf-canvas');
        const container = document.getElementById('nota-pdf-container');
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, Math.min(canvas.width || 1, 100), Math.min(canvas.height || 1, 100));
        let nonZero = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
          if (imgData.data[i+3] > 0) nonZero++;
        }
        return {
          canvasW: canvas.width,
          canvasH: canvas.height,
          canvasStyleW: canvas.style.width,
          canvasStyleH: canvas.style.height,
          nonZeroPixels: nonZero,
          pdfDocLoaded: !!window.KotakARSELNEL.state.pdfDoc,
          numPages: window.KotakARSELNEL.state.pdfDoc ? window.KotakARSELNEL.state.pdfDoc.numPages : 0
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(evalRes));
  ws.close();
  cp.kill();
}
run();
