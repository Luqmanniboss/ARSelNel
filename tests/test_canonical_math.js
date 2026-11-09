/**
 * Diagnostic tool: Test Three.js canonical setObjectQuaternion with iPad Landscape
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testMath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9350;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-test-canonical-' + Date.now());
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

        // Case A: Landscape iPad upright is beta=0, gamma=90
        const qA0 = canonicalQ(0, 0, 90, 90);
        const aVecA = forward.clone().applyQuaternion(qA0);
        // Tilt down: gamma goes from 90 to 60
        const qA_down = canonicalQ(0, 0, 60, 90);
        const vCamA_down = aVecA.clone().applyQuaternion(qA_down.clone().invert());
        const dYawA_down = Math.atan2(vCamA_down.x, -vCamA_down.z) * RAD2DEG;
        const dPitchA_down = Math.atan2(vCamA_down.y, -vCamA_down.z) * RAD2DEG;

        // Case B: Landscape iPad upright is beta=90, gamma=0
        const qB0 = canonicalQ(0, 90, 0, 90);
        const aVecB = forward.clone().applyQuaternion(qB0);
        // Tilt down: beta goes from 90 to 60
        const qB_down = canonicalQ(0, 60, 0, 90);
        const vCamB_down = aVecB.clone().applyQuaternion(qB_down.clone().invert());
        const dYawB_down = Math.atan2(vCamB_down.x, -vCamB_down.z) * RAD2DEG;
        const dPitchB_down = Math.atan2(vCamB_down.y, -vCamB_down.z) * RAD2DEG;

        return {
          caseA: { dYaw: dYawA_down, dPitch: dPitchA_down },
          caseB: { dYaw: dYawB_down, dPitch: dPitchB_down }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Results:', JSON.stringify(res.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testMath().catch(console.error);

