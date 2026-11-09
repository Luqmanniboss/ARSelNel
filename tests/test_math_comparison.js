/**
 * Diagnostic tool: Test computeDeviceCameraQuaternion vs canonical Three.js
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testMath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9349;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-test-math-' + Date.now());
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
      (() => {
        const THREE = window.THREE;
        const RAD2DEG = 180 / Math.PI;
        const DEG2RAD = Math.PI / 180;
        const forward = new THREE.Vector3(0, 0, -1);

        const computeQ = window.KotakARSELNEL.computeDeviceCameraQuaternion;

        // Test angles from iPad in Landscape:
        // Scenario 1: Anchor at 0 deg Yaw, 0 deg Pitch
        // Suppose sensor at anchor is (alpha=180, beta=0, gamma=90) in Landscape-90
        const qAnchor = computeQ(180, 0, 90, 90);
        const aVec = forward.clone().applyQuaternion(qAnchor);

        // When user tilts iPad DOWN by 30 deg:
        // In landscape, tilt axis is physical Y-axis (gamma changes from 90 to 60)
        const qDown30 = computeQ(180, 0, 60, 90);
        const vCamDown30 = aVec.clone().applyQuaternion(qDown30.clone().invert());
        const deltaPitchDown30 = Math.atan2(vCamDown30.y, -vCamDown30.z) * RAD2DEG;
        const deltaYawDown30 = Math.atan2(vCamDown30.x, -vCamDown30.z) * RAD2DEG;

        // When user tilts iPad UP by 30 deg:
        // (gamma changes from 90 to 120, but gamma is clamped to 90, so in iOS when tilting up, beta or gamma changes)
        // What if beta changes? (e.g. beta = 30)
        const qBeta30 = computeQ(180, 30, 90, 90);
        const vCamBeta30 = aVec.clone().applyQuaternion(qBeta30.clone().invert());
        const deltaPitchBeta30 = Math.atan2(vCamBeta30.y, -vCamBeta30.z) * RAD2DEG;

        // Case 2: What if iPad Safari upright in landscape is beta=90, gamma=0?
        const qAnchor2 = computeQ(180, 90, 0, 90);
        const aVec2 = forward.clone().applyQuaternion(qAnchor2);

        // Tilt forward/back: beta changes from 90 to 60 (tilt down 30)
        const qDown30_2 = computeQ(180, 60, 0, 90);
        const vCamDown30_2 = aVec2.clone().applyQuaternion(qDown30_2.clone().invert());
        const deltaPitch2 = Math.atan2(vCamDown30_2.y, -vCamDown30_2.z) * RAD2DEG;
        const deltaYaw2 = Math.atan2(vCamDown30_2.x, -vCamDown30_2.z) * RAD2DEG;

        return {
          deltaPitchDown30,
          deltaYawDown30,
          case2_upright_beta90: {
            deltaPitch2,
            deltaYaw2
          }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Math Comparison:', JSON.stringify(res.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testMath().catch(console.error);
