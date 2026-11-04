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
    res.end('Not found');
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  console.log('Testing server running on port', port);

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  const edgePath = edgePaths.find(p => fs.existsSync(p));

  const testViewports = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'ipad', width: 1024, height: 768 },
    { name: 'phone', width: 414, height: 896 }
  ];

  for (const vp of testViewports) {
    const cdpPort = 9440 + Math.floor(Math.random() * 100);
    const browser = spawn(edgePath, [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${cdpPort}`,
      `--window-size=${vp.width},${vp.height}`,
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
    await send('Runtime.enable');

    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const mockUser = {
            id: 'student-test-lobby-002',
            email: 'pelajar@arselnel.edu.my',
            nama: 'Ahmad Daniel (Saintis Muda)',
            role: 'student',
            user_metadata: { nama: 'Ahmad Daniel (Saintis Muda)', full_name: 'Ahmad Daniel' }
          };
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
          localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: {
              user: mockUser,
              access_token: 'fake-jwt-token'
            }
          }));
        } catch (_) {}
      `
    });

    await send('Page.navigate', { url: `http://127.0.0.1:${port}/cellquest/adventure.html` });
    await new Promise(r => setTimeout(r, 2500));

    // Semak ilustrasi termuat
    const checkInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const heroSVGs = document.querySelectorAll('.hero-3d-stage img');
        const cardSVGs = document.querySelectorAll('.card-3d-illus');
        const hubSVGs = document.querySelectorAll('.hub-3d-illus');
        const svgs = [...heroSVGs, ...cardSVGs, ...hubSVGs];
        const loaded = svgs.every(img => img.complete && img.naturalWidth > 0);
        return {
          totalCount: svgs.length,
          allLoaded: loaded,
          srcs: svgs.map(img => img.src.split('/').pop())
        };
      })()`,
      returnByValue: true
    });

    console.log(`[${vp.name.toUpperCase()} ${vp.width}x${vp.height}]`, checkInfo.result.value);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(rootDir, `assets/images/lobby/rendered_${vp.name}.png`);
    fs.writeFileSync(outPath, Buffer.from(ss.data, 'base64'));
    console.log(`Saved screenshot: ${outPath} (${ss.data.length} bytes)`);

    ws.close();
    browser.kill();
  }

  server.close();
  console.log('\nSemua tangkapan skrin ujian responsif berjaya dihasilkan!');
  process.exit(0);
});

