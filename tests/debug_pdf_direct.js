const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const tmpDir = path.join(process.env.TEMP || '.', 'pdf-err2-' + Date.now());
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
  await new Promise(r => setTimeout(r, 2500));

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const note0 = window.KotakARSELNEL.state.notes[0];
          console.log('Testing note0:', note0);
          const pdfUrl = note0.sourceUrl || note0.storagePath;
          console.log('PDF URL:', pdfUrl);
          console.log('pdfjsLib exists:', !!window.pdfjsLib);
          const task = window.pdfjsLib.getDocument(pdfUrl);
          const doc = await task.promise;
          console.log('PDF loaded! numPages:', doc.numPages);
          const page1 = await doc.getPage(1);
          console.log('Page 1 loaded!', page1.view);
          return { success: true, numPages: doc.numPages };
        } catch (e) {
          console.error('PDF test failed:', e);
          return { success: false, error: e.message, stack: e.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Eval Result:', evalRes.result.result.value);
  cp.kill();
  process.exit(0);
}
test();

