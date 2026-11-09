const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-vcam-check-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9290',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9290/json/list', res => {
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

  const evalRes = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        const THREE = window.THREE;
        const DEG2RAD = Math.PI / 180;
        const RAD2DEG = 180 / Math.PI;

        const earthToThree = new THREE.Matrix4().set(
          1,  0,  0,  0,
          0,  0,  1,  0,
          0, -1,  0,  0,
          0,  0,  0,  1
        );

        function computeQuat(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
          const _x = (Number.isFinite(betaDeg) ? betaDeg : 0) * DEG2RAD;
          const _y = (Number.isFinite(gammaDeg) ? gammaDeg : 0) * DEG2RAD;
          const _z = (Number.isFinite(alphaDeg) ? alphaDeg : 0) * DEG2RAD;
          const orient = (Number.isFinite(screenAngleDeg) ? screenAngleDeg : 0) * DEG2RAD;

          const cX = Math.cos(_x);
          const cY = Math.cos(_y);
          const cZ = Math.cos(_z);
          const sX = Math.sin(_x);
          const sY = Math.sin(_y);
          const sZ = Math.sin(_z);

          const mDeviceToEarth = new THREE.Matrix4().set(
            cZ * cY - sZ * sX * sY,   -cX * sZ,   cY * sZ * sX + cZ * sY,  0,
            cY * sZ + cZ * sX * sY,    cX * cZ,   sZ * sY - cZ * cY * sX,  0,
            -cX * sY,                  sX,        cX * cY,                 0,
            0,                         0,         0,                       1
          );

          const mDeviceToThree = new THREE.Matrix4().multiplyMatrices(earthToThree, mDeviceToEarth);
          const q = new THREE.Quaternion().setFromRotationMatrix(mDeviceToThree);

          const qBackCam = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
          q.multiply(qBackCam);

          const qScreen = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient);
          q.multiply(qScreen);

          return q;
        }

        const q0 = computeQuat(0, 90, 0, 0);
        const q30 = computeQuat(30, 90, 0, 0);

        const fwd = new THREE.Vector3(0, 0, -1);
        const fwd0 = fwd.clone().applyQuaternion(q0);
        const fwd30 = fwd.clone().applyQuaternion(q30);

        const vCam = fwd0.clone().applyQuaternion(q30.clone().invert());

        return {
          fwd0: { x: fwd0.x.toFixed(3), y: fwd0.y.toFixed(3), z: fwd0.z.toFixed(3) },
          fwd30: { x: fwd30.x.toFixed(3), y: fwd30.y.toFixed(3), z: fwd30.z.toFixed(3) },
          vCam: { x: vCam.x.toFixed(3), y: vCam.y.toFixed(3), z: vCam.z.toFixed(3) }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('VCAM Portrait:', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

