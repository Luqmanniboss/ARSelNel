const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-check-params-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9299',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9299/json/list', res => {
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

        function computeDeviceCameraQuaternionRobust(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
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

          // W3C Matrix
          const mDeviceToEarth = new THREE.Matrix4().set(
            cZ * cY - sZ * sX * sY,   -cX * sZ,   cY * sZ * sX + cZ * sY,  0,
            cY * sZ + cZ * sX * sY,    cX * cZ,   sZ * sY - cZ * cY * sX,  0,
            -cX * sY,                  sX,        cX * cY,                 0,
            0,                         0,         0,                       1
          );

          // Transform to Three world frame
          const mDeviceToThree = new THREE.Matrix4().multiplyMatrices(earthToThree, mDeviceToEarth);
          const q = new THREE.Quaternion().setFromRotationMatrix(mDeviceToThree);

          // Camera looks out back (-90 on X)
          const qBackCam = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
          q.multiply(qBackCam);

          // Screen orientation compensation (-orient on Z)
          const qScreen = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient);
          q.multiply(qScreen);

          return q;
        }

        function testMotion(name, a0, b0, g0, a1, b1, g1, orient) {
          const screenW = 1024;
          const screenH = 768;

          const q0 = computeDeviceCameraQuaternionRobust(a0, b0, g0, orient);
          const q1 = computeDeviceCameraQuaternionRobust(a1, b1, g1, orient);

          const fwd = new THREE.Vector3(0, 0, -1);
          const anchorWorld = fwd.clone().applyQuaternion(q0);

          const vCam = anchorWorld.clone().applyQuaternion(q1.clone().invert());
          const deltaYaw = Math.atan2(vCam.x, -vCam.z) * RAD2DEG;
          const deltaPitch = Math.atan2(vCam.y, -vCam.z) * RAD2DEG;

          const fovHRad = (65 * Math.PI) / 180;
          const tanHalfFovH = Math.tan(fovHRad / 2);
          const aspect = screenW / screenH;
          const tanHalfFovV = tanHalfFovH / aspect;

          const ndcX = vCam.x / (-vCam.z * tanHalfFovH);
          const ndcY = vCam.y / (-vCam.z * tanHalfFovV);

          const projX = (screenW / 2) + (ndcX * (screenW / 2));
          const projY = (screenH / 2) - (ndcY * (screenH / 2));

          return {
            name,
            deltaYaw: deltaYaw.toFixed(1),
            deltaPitch: deltaPitch.toFixed(1),
            projX: Math.round(projX),
            projY: Math.round(projY),
            centerDiffX: Math.round(projX - (screenW / 2)),
            centerDiffY: Math.round(projY - (screenH / 2)),
          };
        }

        return [
          testMotion('Portrait: Tilt DOWN 20 deg', 0, 90, 0, 0, 70, 0, 0),
          testMotion('Portrait: Tilt UP 20 deg', 0, 90, 0, 0, 110, 0, 0),
          testMotion('Portrait: Turn RIGHT 30 deg', 0, 90, 0, 30, 90, 0, 0),
          testMotion('Portrait: Turn LEFT 30 deg', 0, 90, 0, 330, 90, 0, 0),

          testMotion('Landscape: Tilt DOWN (beta: 0 -> -20)', 0, 0, 90, 0, -20, 90, 90),
          testMotion('Landscape: Tilt UP (beta: 0 -> +20)', 0, 0, 90, 0, 20, 90, 90),
          testMotion('Landscape: Turn RIGHT (alpha: 0 -> 30)', 0, 0, 90, 30, 0, 90, 90),
          testMotion('Landscape: Turn LEFT (alpha: 0 -> 330)', 0, 0, 90, 330, 0, 90, 90),
        ];
      })()
    `,
    returnByValue: true
  });

  console.log('Results with correct params:\n', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

