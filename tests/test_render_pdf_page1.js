const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const tmpDir = path.join(process.env.TEMP || '.', 'pdf-render-page1-' + Date.now());
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 3000));

  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const note = window.KotakARSELNEL.state.notes[0];
        const pdfUrl = note.sourceUrl;
        const task = window.pdfjsLib.getDocument(pdfUrl);
        const doc = await task.promise;
        const page = await doc.getPage(1);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const vp = page.getViewport({ scale: 1.0 });
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const dataUrl = canvas.toDataURL('image/png').slice(0, 100);
        // sample center pixel
        const pData = ctx.getImageData(Math.floor(vp.width/2), Math.floor(vp.height/2), 1, 1).data;
        return {
          vpWidth: vp.width,
          vpHeight: vp.height,
          dataUrlPrefix: dataUrl,
          centerPixel: Array.from(pData)
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Page 1 render test:', result.result.result.value);
  cp.kill();
  process.exit(0);
}
test();

