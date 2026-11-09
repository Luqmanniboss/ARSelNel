const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function convert() {
  const chromePath = findChrome();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-svg2png-'));
  const svgPath = path.resolve(__dirname, '../kotak_arselnel/assets/markers/marker-kuiz.svg');
  const outPngPath = path.resolve(__dirname, '../kotak_arselnel/assets/markers/marker-kuiz.png');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 1000px; height: 1000px; overflow: hidden; background: #fff; }
        img { width: 1000px; height: 1000px; display: block; }
      </style>
    </head>
    <body>
      <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" />
    </body>
    </html>
  `;
  const tmpHtml = path.join(tmpDir, 'marker.html');
  fs.writeFileSync(tmpHtml, html);

  const CDP_PORT = 9266;
  const cp = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--window-size=1000,1000',
    '--no-sandbox'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const p = list.find(t => t.type === 'page');
        if (p) { wsUrl = p.webSocketDebuggerUrl; break; }
      }
    } catch (_) {}
  }

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params) => new Promise(res => {
    const curId = id++;
    const h = (m) => {
      const data = JSON.parse(m.data);
      if (data.id === curId) { ws.removeEventListener('message', h); res(data.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'file:///' + tmpHtml.replace(/\\/g, '/') });
  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1000, height: 1000, scale: 1 }
  });

  fs.writeFileSync(outPngPath, Buffer.from(screenshot.data, 'base64'));
  console.log('Successfully saved marker-kuiz.png:', outPngPath, 'Size:', fs.statSync(outPngPath).size, 'bytes');

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

convert().catch(console.error);

