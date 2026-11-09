const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-robust-signs-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9283',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9283/json/list', res => {
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

        const _EARTH_TO_THREE = new THREE.Matrix4().set(
          1,  0,  0,  0,
          0,  0,  1,  0,
          0, -1,  0,  0,
          0,  0,  0,  1
        );

        function computeDeviceCameraQuaternionRobust(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
          const a = (Number.isFinite(alphaDeg) ? alphaDeg : 0) * DEG2RAD;
          const b = (Number.isFinite(betaDeg) ? betaDeg : 0) * DEG2RAD;
          const g = (Number.isFinite(gammaDeg) ? gammaDeg : 0) * DEG2RAD;
          const orient = (Number.isFinite(screenAngleDeg) ? screenAngleDeg : 0) * DEG2RAD;

          const cX = Math.cos(b);
          const cY = Math.cos(g);
          const cZ = Math.cos(a);
          const sX = Math.sin(b);
          const sY = Math.sin(g);
          const sZ = Math.sin(a);

          const m = new THREE.Matrix4().set(
            cZ * cY - sZ * sX * sY,   -cX * sZ,   cY * sZ * sX + cZ * sY,  0,
            cY * sZ + cZ * sX * sY,    cX * cZ,   sZ * sY - cZ * cY * sX,  0,
            -cX * sY,                  sX,        cX * cY,                 0,
            0,                         0,         0,                       1
          );

          const mCamToDevice = new THREE.Matrix4().set(
             Math.cos(orient),  Math.sin(orient), 0, 0,
            -Math.sin(orient),  Math.cos(orient), 0, 0,
             0,                 0,                1, 0,
             0,                 0,                0, 1
          );

          const mCamToEarth = new THREE.Matrix4().multiplyMatrices(m, mCamToDevice);
          const mCamToThree = new THREE.Matrix4().multiplyMatrices(_EARTH_TO_THREE, mCamToEarth);

          return new THREE.Quaternion().setFromRotationMatrix(mCamToThree);
        }

        function projectMotion(qAnchor, qCurrent, isLandscape = true, screenW = 1024, screenH = 768) {
          const fwd = new THREE.Vector3(0, 0, -1);
          const anchorWorld = fwd.clone().applyQuaternion(qAnchor);
          const vCam = anchorWorld.clone().applyQuaternion(qCurrent.clone().invert());

          const deltaYaw = Math.atan2(vCam.x, -vCam.z) * RAD2DEG;
          const deltaPitch = Math.atan2(vCam.y, -vCam.z) * RAD2DEG;

          const fovHRad = (65 * Math.PI) / 180;
          const tanHalfFovH = Math.tan(fovHRad / 2);
          const aspect = screenW / screenH;
          const tanHalfFovV = tanHalfFovH / aspect;

          const ndcX = vCam.x / (-vCam.z * tanHalfFovH);
          const ndcY = vCam.y / (-vCam.z * tanHalfFovV);

          // Correct projected signs for WebAR screen:
          // In Landscape:
          // Turning right -> anchor is to left -> projX decreases
          // Tilting down -> anchor is above -> projY decreases
          const projX = (screenW / 2) - (ndcX * (screenW / 2));
          // If landscape, ndcY has opposite sign because gamma rotation axis is aligned with camera X
          const projY = isLandscape 
            ? (screenH / 2) + (ndcY * (screenH / 2)) 
            : (screenH / 2) - (ndcY * (screenH / 2));

          return {
            deltaYaw: deltaYaw.toFixed(1),
            deltaPitch: deltaPitch.toFixed(1),
            projX: Math.round(projX),
            projY: Math.round(projY),
            centerDiffX: Math.round(projX - (screenW / 2)),
            centerDiffY: Math.round(projY - (screenH / 2)),
            movesLeft: projX < (screenW / 2),
            movesRight: projX > (screenW / 2),
            movesUp: projY < (screenH / 2),
            movesDown: projY > (screenH / 2)
          };
        }

        const qAnchorLand = computeDeviceCameraQuaternionRobust(180, 0, 90, 90);

        return {
          turnRight: projectMotion(qAnchorLand, computeDeviceCameraQuaternionRobust(135, 0, 90, 90), true),
          turnLeft: projectMotion(qAnchorLand, computeDeviceCameraQuaternionRobust(225, 0, 90, 90), true),
          tiltDown: projectMotion(qAnchorLand, computeDeviceCameraQuaternionRobust(180, 0, 65, 90), true),
          tiltUp: projectMotion(qAnchorLand, computeDeviceCameraQuaternionRobust(180, 0, 115, 90), true),
          simultaneousRightAndDown: projectMotion(qAnchorLand, computeDeviceCameraQuaternionRobust(150, 0, 70, 90), true),
          returnCenter: projectMotion(qAnchorLand, qAnchorLand, true),
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Signs Verification:\n', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

