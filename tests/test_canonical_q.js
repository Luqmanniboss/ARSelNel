/**
 * Test Three.js canonical setObjectQuaternion vs custom matrix
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testCanonical() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9347;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-test-q-' + Date.now());
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
        const DEG2RAD = Math.PI / 180;
        const RAD2DEG = 180 / Math.PI;

        const zee = new THREE.Vector3(0, 0, 1);
        const euler = new THREE.Euler();
        const q0 = new THREE.Quaternion();
        const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X
        const forward = new THREE.Vector3(0, 0, -1);

        function canonicalQ(alphaDeg, betaDeg, gammaDeg, orientDeg) {
          const a = (alphaDeg || 0) * DEG2RAD;
          const b = (betaDeg || 0) * DEG2RAD;
          const g = (gammaDeg || 0) * DEG2RAD;
          const orient = (orientDeg || 0) * DEG2RAD;

          const q = new THREE.Quaternion();
          euler.set(b, a, -g, 'YXZ');
          q.setFromEuler(euler);
          q.multiply(q1);
          q.multiply(q0.setFromAxisAngle(zee, -orient));
          return q;
        }

        // Test in Landscape (orient = 90)
        // Holding upright:
        // In Safari iPad landscape, holding upright facing North:
        // beta ~ 0, gamma ~ 90 (or beta ~ 90, gamma ~ 0 depending on rotation).
        // Let's test upright: beta = 90, alpha = 0, gamma = 0, orient = 90
        const qUpright = canonicalQ(0, 90, 0, 90);
        const fwdUpright = forward.clone().applyQuaternion(qUpright);

        // When user tilts iPad DOWN by 30 deg in portrait: beta = 60
        const qTiltDownPortrait = canonicalQ(0, 60, 0, 0);
        const vCamPortrait = forward.clone().applyQuaternion(qTiltDownPortrait.clone().invert());

        // In Landscape (orient = 90):
        // Upright iPad held in landscape:
        // What are beta and gamma?
        // In landscape, holding device in front of you:
        // Device long edge is horizontal, short edge is vertical.
        // In iPadOS, DeviceOrientation angles:
        // When flat on table: alpha=compass, beta=0, gamma=0.
        // Tilt top edge up towards you (portrait upright): beta increases towards 90.
        // Tilt right edge up towards you (landscape): gamma increases towards 90.
        // So in landscape held upright: beta = 0, gamma = 90!
        // Now user tilts iPad DOWN (towards table):
        // Does the top long edge tilt down?
        // Yes, rotating around the long axis (which is device Y axis, so gamma changes from 90 towards 0)!
        // Or rotating around the short axis?
        const qAnchor = canonicalQ(0, 0, 90, 90);
        const aVec = forward.clone().applyQuaternion(qAnchor);

        // Tilt down: gamma goes from 90 to 60
        const qTiltGamma = canonicalQ(0, 0, 60, 90);
        const vCamGamma = aVec.clone().applyQuaternion(qTiltGamma.clone().invert());
        const dYawGamma = Math.atan2(vCamGamma.x, -vCamGamma.z) * RAD2DEG;
        const dPitchGamma = Math.atan2(vCamGamma.y, -vCamGamma.z) * RAD2DEG;

        // Tilt down: beta goes from 0 to -30
        const qTiltBeta = canonicalQ(0, -30, 90, 90);
        const vCamBeta = aVec.clone().applyQuaternion(qTiltBeta.clone().invert());
        const dYawBeta = Math.atan2(vCamBeta.x, -vCamBeta.z) * RAD2DEG;
        const dPitchBeta = Math.atan2(vCamBeta.y, -vCamBeta.z) * RAD2DEG;

        return {
          fwdUpright,
          gammaTest: { vCam: vCamGamma, dYaw: dYawGamma, dPitch: dPitchGamma },
          betaTest: { vCam: vCamBeta, dYaw: dYawBeta, dPitch: dPitchBeta }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Canonical Test Results:', JSON.stringify(res.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testCanonical().catch(console.error);

