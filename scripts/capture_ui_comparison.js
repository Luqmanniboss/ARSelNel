/**
 * capture_ui_comparison.js
 * Captures iPad 1024x768 screenshot for before/after comparison
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9390;

async function capture(filename = 'ui_before_ipad.png') {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_cap_${Date.now()}`);

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
    const http = require('http');
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

    // Emulate iPad screen
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });

    await new Promise(r => setTimeout(r, 1000));

    // Open Nota Panel and lock POV to match user reference image
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(1, 'nota');
          if (window.ARState.notes && window.ARState.notes.length > 0) {
            window.selectNote(window.ARState.notes[0]);
          }
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') {
            await window.KotakARSELNEL.startPOVMode();
          } else {
            const btn = document.getElementById('btn-switch-to-pov');
            if (btn) btn.click();
          }
          const anchorBtn = document.getElementById('pov-nota-btn-anchor');
          if (anchorBtn) anchorBtn.click();
        })()
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outDir = path.join(__dirname, '..', 'tests', 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, filename);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`📸 Screenshot saved: ${outPath}`);

    ws.close();
  } finally {
    edgeProcess.kill();
  }
}

const fname = process.argv[2] || 'ui_before_ipad.png';
capture(fname);
