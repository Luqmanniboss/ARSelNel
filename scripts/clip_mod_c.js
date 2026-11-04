const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = process.cwd();
const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/cellquest/adventure.html';
  const filePath = path.join(rootDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cdpPort = 9488;
  const browser = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${cdpPort}`,
    '--window-size=1280,820',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const targetsRes = await fetch(`http://127.0.0.1:${cdpPort}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        res(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(res => ws.addEventListener('open', res));
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      const mockUser = { id: 'test-1', nama: 'Saintis Muda' };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
    `
  });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/cellquest/adventure.html` });
  await new Promise(r => setTimeout(r, 2500));

  const clipEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.getElementById('lobby-card-mod-c');
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  const rect = clipEval.result.value;
  console.log('Mod C rect:', rect);

  const ss = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: Math.max(0, rect.x - 10), y: Math.max(0, rect.y - 10), width: rect.width + 20, height: rect.height + 20, scale: 1 }
  });

  fs.writeFileSync('assets/images/lobby/mod_c_refined_clip.png', Buffer.from(ss.data, 'base64'));
  fs.copyFileSync('assets/images/lobby/mod_c_refined_clip.png', 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/mod_c_refined_clip.png');
  console.log('Saved Mod C clip screenshot!');

  ws.close();
  browser.kill();
  server.close();
  process.exit(0);
});

