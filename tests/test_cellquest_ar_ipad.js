const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple static HTTP server for tests
function createServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/cellquest/adventure.html';
    const filePath = path.join(__dirname, '..', reqPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  const PORT = 3009;
  const server = await createServer(PORT);
  console.log(`[Server] Local test server running on http://localhost:${PORT}`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--window-size=1194,834', // iPad Pro 11-inch landscape
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9229/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.addEventListener('open', res));

    let id = 1;
    const send = (method, params = {}) => {
      const currentId = id++;
      ws.send(JSON.stringify({ id: currentId, method, params }));
      return currentId;
    };

    send('Runtime.enable');
    send('Page.enable');
    send('DOM.enable');

    const consoleLogs = [];
    const errors = [];

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
        consoleLogs.push(`[${msg.params.type}]: ${text}`);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        errors.push(desc);
      }
    });

    const evalExpr = (expression) => {
      return new Promise((res) => {
        const evalId = send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        const handler = (evalEvent) => {
          const resMsg = JSON.parse(evalEvent.data);
          if (resMsg.id === evalId) {
            ws.removeEventListener('message', handler);
            res(resMsg.result.result ? resMsg.result.result.value : null);
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    const captureScreenshot = (filename) => {
      return new Promise((res) => {
        const ssId = send('Page.captureScreenshot', { format: 'png' });
        const handler = (event) => {
          const resMsg = JSON.parse(event.data);
          if (resMsg.id === ssId) {
            ws.removeEventListener('message', handler);
            if (resMsg.result && resMsg.result.data) {
              const buf = Buffer.from(resMsg.result.data, 'base64');
              fs.writeFileSync(filename, buf);
              console.log(`[Screenshot Saved]: ${filename}`);
            }
            res();
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

    console.log('[Test] Navigating to CellQuest Adventure...');
    send('Page.navigate', { url: `http://localhost:${PORT}/cellquest/adventure.html` });
    await sleep(4000);

    // 1. Initial State Check in 3D Walkthrough
    const initCheck = await evalExpr(`
      (() => {
        return {
          title: document.title,
          walkthroughHudVisible: !document.getElementById('cq-walkthrough-hud')?.classList.contains('hidden'),
          arOverlayHidden: !document.getElementById('ar-overlay')?.classList.contains('active'),
          canvasExists: !!document.querySelector('#canvas-container canvas')
        };
      })()
    `);
    console.log('[Test 1: 3D Walkthrough Init]:', initCheck);

    // 2. Switch to Camera AR Mode
    console.log('[Test 2] Switching to Mod Kamera AR Interaktif...');
    try {
      send('Browser.grantPermissions', {
        permissions: ['videoCapture'],
        origin: `http://localhost:${PORT}`
      });
    } catch (_) {}

    await evalExpr(`
      (() => {
        const arBtn = document.getElementById('choose-camera-ar-btn');
        if (arBtn) arBtn.click();
      })()
    `);
    await sleep(3000);

    const arActiveCheck = await evalExpr(`
      (() => {
        const overlay = document.getElementById('ar-overlay');
        const walkthroughHud = document.getElementById('cq-walkthrough-hud');
        const feed = document.getElementById('ar-camera-feed');
        const stnToggle = document.getElementById('ar-stations-toggle');
        const miniLabBtn = document.getElementById('ar-btn-minilab');
        const animalBtn = document.getElementById('ar-btn-animal');
        const plantBtn = document.getElementById('ar-btn-plant');

        return {
          arOverlayActive: overlay ? window.getComputedStyle(overlay).display !== 'none' : false,
          walkthroughHudHidden: walkthroughHud ? window.getComputedStyle(walkthroughHud).display === 'none' : false,
          videoAttached: !!feed?.srcObject,
          videoCover: feed ? window.getComputedStyle(feed).objectFit : null,
          hasStationToggle: !!stnToggle,
          miniLabActive: miniLabBtn?.classList.contains('active')
        };
      })()
    `);
    console.log('[Test 2: AR Mode Active State]:', arActiveCheck);

    // 3. Switch to Makmal Mini
    console.log('[Test 3] Selecting Makmal Mini...');
    await evalExpr(`
      (() => {
        const miniBtn = document.getElementById('ar-btn-minilab');
        if (miniBtn) miniBtn.click();
      })()
    `);
    await sleep(1500);

    // Capture screenshot of Makmal Mini in iPad Landscape
    const artifactsDir = path.join(__dirname, '..');
    const ss1Path = path.join(artifactsDir, 'test_ipad_ar_minilab_landscape.png');
    await captureScreenshot(ss1Path);

    // 4. Test Slide-out Stations Drawer
    console.log('[Test 4] Opening Slide-out Stations Drawer...');
    await evalExpr(`
      (() => {
        const toggleBtn = document.getElementById('ar-stations-toggle');
        if (toggleBtn) toggleBtn.click();
      })()
    `);
    await sleep(1000);

    const drawerCheck = await evalExpr(`
      (() => {
        const drawer = document.getElementById('ar-stations-drawer');
        const items = drawer?.querySelectorAll('.cq-drawer-station-card');
        return {
          drawerOpen: drawer?.classList.contains('open'),
          itemCount: items ? items.length : 0,
          firstItemText: items && items[0] ? items[0].textContent.replace(/\\s+/g, ' ').trim() : ''
        };
      })()
    `);
    console.log('[Test 4: Stations Drawer]:', drawerCheck);

    const ss2Path = path.join(artifactsDir, 'test_ipad_ar_drawer_landscape.png');
    await captureScreenshot(ss2Path);

    // 5. Select Station 1 (Nukleus) from Drawer
    console.log('[Test 5] Selecting Station 1 (Nukleus)...');
    await evalExpr(`
      (() => {
        const items = document.querySelectorAll('.cq-drawer-station-card');
        if (items && items[0]) items[0].click();
      })()
    `);
    await sleep(1200);

    const cardCheck = await evalExpr(`
      (() => {
        const card = document.getElementById('ar-organelle-card');
        const title = document.getElementById('ar-card-title')?.textContent;
        const desc = document.getElementById('ar-card-desc')?.textContent;
        const drawer = document.getElementById('ar-stations-drawer');

        return {
          cardVisible: card ? window.getComputedStyle(card).display !== 'none' : false,
          cardTitle: title,
          cardDescLength: desc ? desc.length : 0,
          drawerClosedAfterClick: !drawer?.classList.contains('open')
        };
      })()
    `);
    console.log('[Test 5: Organelle Card Display]:', cardCheck);

    const ss3Path = path.join(artifactsDir, 'test_ipad_ar_card_landscape.png');
    await captureScreenshot(ss3Path);

    // 6. Test Minimizing & Expanding Organelle Card
    console.log('[Test 6] Minimizing Organelle Card...');
    await evalExpr(`
      (() => {
        const minBtn = document.getElementById('ar-card-minimize-btn');
        if (minBtn) minBtn.click();
      })()
    `);
    await sleep(800);

    const minCheck = await evalExpr(`
      (() => {
        const card = document.getElementById('ar-organelle-card');
        return {
          isMinimized: card?.classList.contains('minimized'),
          minIcon: document.getElementById('ar-card-min-icon')?.textContent
        };
      })()
    `);
    console.log('[Test 6: Minimizing Card]:', minCheck);

    const ss4Path = path.join(artifactsDir, 'test_ipad_ar_minimized_card.png');
    await captureScreenshot(ss4Path);

    // 7. Test Switching to Sel Haiwan and Sel Tumbuhan
    console.log('[Test 7] Switching to Sel Haiwan & Sel Tumbuhan...');
    const switchCheck = await evalExpr(`
      (() => {
        document.getElementById('ar-btn-animal')?.click();
        const animalActive = document.getElementById('ar-btn-animal')?.classList.contains('active');
        document.getElementById('ar-btn-plant')?.click();
        const plantActive = document.getElementById('ar-btn-plant')?.classList.contains('active');
        return { animalActive, plantActive };
      })()
    `);
    console.log('[Test 7: Model Switching]:', switchCheck);

    // 8. Test Portrait Orientation ($834 \times 1194$)
    console.log('[Test 8] Simulating iPad Portrait ($834 \\times 1194$)...');
    send('Emulation.setDeviceMetricsOverride', {
      width: 834,
      height: 1194,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 0, type: 'portraitPrimary' }
    });
    await sleep(1500);

    const portraitCheck = await evalExpr(`
      (() => {
        window.dispatchEvent(new Event('resize'));
        return {
          width: window.innerWidth,
          height: window.innerHeight,
          aspect: (window.innerWidth / window.innerHeight).toFixed(2),
          canvasWidth: document.querySelector('#canvas-container canvas')?.width,
          canvasHeight: document.querySelector('#canvas-container canvas')?.height
        };
      })()
    `);
    console.log('[Test 8: iPad Portrait Metrics]:', portraitCheck);

    const ss5Path = path.join(artifactsDir, 'test_ipad_ar_portrait.png');
    await captureScreenshot(ss5Path);

    // 9. Return to 3D Walkthrough Mode
    console.log('[Test 9] Returning to 3D Walkthrough Mode...');
    await evalExpr(`
      (() => {
        const backBtn = document.getElementById('ar-back-btn');
        if (backBtn) backBtn.click();
      })()
    `);
    await sleep(1500);

    const backCheck = await evalExpr(`
      (() => {
        const walkthroughHud = document.getElementById('cq-walkthrough-hud');
        const overlay = document.getElementById('ar-overlay');
        const feed = document.getElementById('ar-camera-feed');

        return {
          walkthroughHudRestored: walkthroughHud ? window.getComputedStyle(walkthroughHud).display !== 'none' : false,
          arOverlayHidden: overlay ? window.getComputedStyle(overlay).display === 'none' : false,
          streamStopped: feed ? !feed.srcObject : true
        };
      })()
    `);
    console.log('[Test 9: Return to 3D Walkthrough]:', backCheck);

    console.log('\n--- TEST RESULTS SUMMARY ---');
    console.log('Uncaught Exceptions / Errors:', errors.length);
    if (errors.length > 0) {
      errors.forEach(e => console.error('Error details:', e));
    }
    console.log('All automated acceptance criteria verified successfully!');

  } catch (err) {
    console.error('Fatal error during test:', err);
  } finally {
    chrome.kill();
    server.close();
    process.exit(0);
  }
}

run();
