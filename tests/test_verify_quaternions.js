/**
 * Test verify relative orientation deltaYaw and deltaPitch
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testQuaternions() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9351;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-test-qcomp-' + Date.now());
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

        const currentComputeQ = window.KotakARSELNEL.computeDeviceCameraQuaternion;

        const zee = new THREE.Vector3(0, 0, 1);
        const euler = new THREE.Euler();
        const q0 = new THREE.Quaternion();
        const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X

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

        // Test in Landscape 90:
        // When holding iPad upright in landscape facing North:
        // In canonical Three.js, upright facing North:
        // Camera looks forward (z = -1, y = 0, x = 0).
        // Let's find which angles give camera looking forward (0, 0, -1):
        const qCanonAnchor = canonicalQ(0, 0, 90, 90);
        const fwdCanonAnchor = forward.clone().applyQuaternion(qCanonAnchor);

        const qCustomAnchor = currentComputeQ(0, 0, 90, 90);
        const fwdCustomAnchor = forward.clone().applyQuaternion(qCustomAnchor);

        // Test relative delta when rotating Yaw by +30 deg:
        const qCanonYaw30 = canonicalQ(30, 0, 90, 90);
        const vCamCanonYaw = fwdCanonAnchor.clone().applyQuaternion(qCanonYaw30.clone().invert());
        const dYawCanon = Math.atan2(vCamCanonYaw.x, -vCamCanonYaw.z) * RAD2DEG;
        const dPitchCanonYaw = Math.atan2(vCamCanonYaw.y, -vCamCanonYaw.z) * RAD2DEG;

        const qCustomYaw30 = currentComputeQ(30, 0, 90, 90);
        const vCamCustomYaw = fwdCustomAnchor.clone().applyQuaternion(qCustomYaw30.clone().invert());
        const dYawCustom = Math.atan2(vCamCustomYaw.x, -vCamCustomYaw.z) * RAD2DEG;
        const dPitchCustomYaw = Math.atan2(vCamCustomYaw.y, -vCamCustomYaw.z) * RAD2DEG;

        // Test relative delta when tilting Pitch DOWN by -30 deg:
        // (In iPad landscape, tilt forward rotates around Y, so gamma decreases from 90 to 60)
        const qCanonPitchDown30 = canonicalQ(0, 0, 60, 90);
        const vCamCanonPitch = fwdCanonAnchor.clone().applyQuaternion(qCanonPitchDown30.clone().invert());
        const dYawCanonPitch = Math.atan2(vCamCanonPitch.x, -vCamCanonPitch.z) * RAD2DEG;
        const dPitchCanon = Math.atan2(vCamCanonPitch.y, -vCamCanonPitch.z) * RAD2DEG;

        const qCustomPitchDown30 = currentComputeQ(0, 0, 60, 90);
        const vCamCustomPitch = fwdCustomAnchor.clone().applyQuaternion(qCustomPitchDown30.clone().invert());
        const dYawCustomPitch = Math.atan2(vCamCustomPitch.x, -vCamCustomPitch.z) * RAD2DEG;
        const dPitchCustom = Math.atan2(vCamCustomPitch.y, -vCamCustomPitch.z) * RAD2DEG;

        return {
          fwdCanonAnchor,
          fwdCustomAnchor,
          yawTest: {
            canon: { dYaw: dYawCanon, dPitch: dPitchCanonYaw },
            custom: { dYaw: dYawCustom, dPitch: dPitchCustomYaw }
          },
          pitchTest: {
            canon: { dYaw: dYawCanonPitch, dPitch: dPitchCanon },
            custom: { dYaw: dYawCustomPitch, dPitch: dPitchCustom }
          }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Results:', JSON.stringify(res.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testQuaternions().catch(console.error);

