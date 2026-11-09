/**
 * Diagnostic tool: Test iPad Safari orientation handling in Landscape
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testOrientation() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9348;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-test-pitch-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + tmpDir,
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1024,768'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (res.ok) break;
    } catch (_) {}
  }

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + port + '/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const handler = evt => {
      const resp = JSON.parse(evt.data);
      if (resp.id === curId) {
        ws.removeEventListener('message', handler);
        res(resp);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' });
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const THREE = window.THREE;
          const forward = new THREE.Vector3(0, 0, -1);
          const RAD2DEG = 180 / Math.PI;

          await window.KotakARSELNEL.startPOVMode();

          const qBefore = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.5); // has pitch!
          window.KotakARSELNEL.state.pov.currentQuaternion = qBefore.clone();
          window.KotakARSELNEL.state.pov.isSimulated = false; // physical device!

          // Now assign smoothAlpha:
          window.KotakARSELNEL.state.pov.smoothAlpha = 45;
          const qAfter = window.KotakARSELNEL.state.pov.currentQuaternion.clone();

          const fwdBefore = forward.clone().applyQuaternion(qBefore);
          const fwdAfter = forward.clone().applyQuaternion(qAfter);

          const pitchBefore = Math.asin(fwdBefore.y) * RAD2DEG;
          const pitchAfter = Math.asin(fwdAfter.y) * RAD2DEG;

          return {
            pitchBefore,
            pitchAfter
          };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(res.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testOrientation().catch(console.error);
