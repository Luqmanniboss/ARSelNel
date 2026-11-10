/**
 * scripts/capture_multi_theme_screenshots.js
 * Captures iPad 1024x768 screenshots for each module and for all 4 modules.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9392;

async function runCapture(prefix = 'before') {
  const screenshotsDir = path.join(__dirname, '..', 'tests', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_themes_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/kotak_arselnel/code.html'
  ], { detached: false });

  try {
    await new Promise(r => setTimeout(r, 3500));
    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('kotak_arselnel'));
    if (!pageTarget) throw new Error('Target page not found');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = ++id;
        const handler = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.id === curId) {
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          } catch(err) {}
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });

    async function takeScreenshot(name) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(screenshotsDir, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`📸 Saved: ${filePath}`);
    }

    // 1. Capture VIDEO
    console.log(`Evaluating Video for ${prefix}...`);
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(0, 'video');
          if (window.ARState.videos && window.ARState.videos.length > 0) {
            window.selectVideo(window.ARState.videos[0]);
          }
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') {
            await window.KotakARSELNEL.startPOVMode();
          }
          const anchorBtn = document.getElementById('pov-btn-anchor');
          if (anchorBtn) anchorBtn.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot(`${prefix}_video`);

    // 2. Capture NOTA
    console.log(`Evaluating Nota for ${prefix}...`);
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(1, 'nota');
          if (window.ARState.notes && window.ARState.notes.length > 0) {
            window.selectNote(window.ARState.notes[0]);
          }
          const anchorBtn = document.getElementById('pov-nota-btn-anchor');
          if (anchorBtn) anchorBtn.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot(`${prefix}_nota`);

    // 3. Capture KUIZ
    console.log(`Evaluating Kuiz for ${prefix}...`);
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(2, 'kuiz');
          const anchorBtn = document.getElementById('pov-kuiz-btn-anchor');
          if (anchorBtn) anchorBtn.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot(`${prefix}_kuiz`);

    // 4. Capture CELLQUEST
    console.log(`Evaluating CellQuest for ${prefix}...`);
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(3, 'cellquest');
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot(`${prefix}_cellquest`);

    // 5. Capture 4 MODULES ACTIVE
    console.log(`Capturing all 4 modules active for ${prefix}...`);
    await takeScreenshot(`${prefix}_four_modules`);

    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    try { edgeProcess.kill(); } catch(e) {}
  }
}

const prefixArg = process.argv[2] || 'before';
runCapture(prefixArg).then(() => {
  console.log('Capture finished for prefix:', prefixArg);
  process.exit(0);
});
