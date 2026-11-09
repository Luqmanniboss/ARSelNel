const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-dbg-sim-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9285',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9285/json/list', res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    }).on('error', reject);
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let reqId = 1;
  const sendCmd = (method, params = {}) => new Promise((resolve, reject) => {
    const id = reqId++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');
  await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.startSimulationMode();
        window.KotakARSELNEL.startPOVMode();
        window.KotakARSELNEL.anchorPOVAtCurrentHeading();

        const beforeAngles = {
          mode: window.KotakARSELNEL.state.systemMode,
          isAnchored: window.KotakARSELNEL.state.pov.isAnchored,
          anchorWorldVec: window.KotakARSELNEL.state.pov.anchorWorldVector ? {
            x: window.KotakARSELNEL.state.pov.anchorWorldVector.x,
            y: window.KotakARSELNEL.state.pov.anchorWorldVector.y,
            z: window.KotakARSELNEL.state.pov.anchorWorldVector.z
          } : null,
          anchorClasses: document.getElementById('pov-ar-anchor')?.className,
          anchorLeft: document.getElementById('pov-ar-anchor')?.style.left,
          anchorTop: document.getElementById('pov-ar-anchor')?.style.top
        };

        // Call applySimAngles(35, 0)
        let simError = null;
        try {
          window.KotakARSELNEL.applySimAngles(35, 0);
        } catch(e) {
          simError = e.message + ' ' + e.stack;
        }

        const afterCall = {
          simError,
          targetQ: window.KotakARSELNEL.state.pov.targetQuaternion,
          currentQ: window.KotakARSELNEL.state.pov.currentQuaternion,
          hasSensor: window.KotakARSELNEL.state.pov.hasSensor,
          isSimulated: window.KotakARSELNEL.state.pov.isSimulated,
          simYaw: window.KotakARSELNEL.state.pov.simYaw,
          simPitch: window.KotakARSELNEL.state.pov.simPitch
        };

        return { beforeAngles, afterCall };
      })()
    `,
    returnByValue: true
  });

  console.log('DEBUG:', JSON.stringify(debugInfo.result.value, null, 2));

  // Wait 300ms for render loop to execute
  await new Promise(r => setTimeout(r, 300));

  const afterRender = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const anchor = document.getElementById('pov-ar-anchor');
        const card = document.getElementById('pov-card-container');
        const r = card.getBoundingClientRect();
        return {
          anchorClass: anchor.className,
          anchorStyleLeft: anchor.style.left,
          anchorStyleTop: anchor.style.top,
          cardRect: { left: r.left, top: r.top, width: r.width, height: r.height },
          deltaYaw: window.KotakARSELNEL.state.pov.deltaYaw,
          deltaPitch: window.KotakARSELNEL.state.pov.deltaPitch,
          isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen
        };
      })()
    `,
    returnByValue: true
  });

  console.log('AFTER RENDER:', JSON.stringify(afterRender.result.value, null, 2));

  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

