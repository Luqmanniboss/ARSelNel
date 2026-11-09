const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-robust-all-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9282',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9282/json/list', res => {
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

        function projectMotion(qAnchor, qCurrent, screenW = 1024, screenH = 768) {
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

          // In screen space:
          // Turning right -> anchor is to camera's left -> ndcX < 0 -> projX < screenW / 2 (moves LEFT)
          // Turning left -> anchor is to camera's right -> ndcX > 0 -> projX > screenW / 2 (moves RIGHT)
          // Tilting down -> camera looks down -> anchor is above line of sight -> ndcY > 0 -> projY < screenH / 2 (moves UP)
          // Tilting up -> camera looks up -> anchor is below line of sight -> ndcY < 0 -> projY > screenH / 2 (moves DOWN)
          const projX = (screenW / 2) + (ndcX * (screenW / 2));
          const projY = (screenH / 2) - (ndcY * (screenH / 2));

          return {
            vCam: { x: vCam.x.toFixed(3), y: vCam.y.toFixed(3), z: vCam.z.toFixed(3) },
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

        // Test Scenarios:
        // Landscape (90 deg):
        // Upright anchor: a=180, b=0, g=90, orient=90
        const qAnchorLand = computeDeviceCameraQuaternionRobust(180, 0, 90, 90);

        // 1. Turn RIGHT 45 deg in Landscape (alpha: 180 -> 135)
        const qTurnRightLand = computeDeviceCameraQuaternionRobust(135, 0, 90, 90);
        const rRight = projectMotion(qAnchorLand, qTurnRightLand);

        // 2. Turn LEFT 45 deg in Landscape (alpha: 180 -> 225)
        const qTurnLeftLand = computeDeviceCameraQuaternionRobust(225, 0, 90, 90);
        const rLeft = projectMotion(qAnchorLand, qTurnLeftLand);

        // 3. Tilt DOWN 25 deg in Landscape (gamma: 90 -> 65)
        const qTiltDownLand = computeDeviceCameraQuaternionRobust(180, 0, 65, 90);
        const rDown = projectMotion(qAnchorLand, qTiltDownLand);

        // 4. Tilt UP 25 deg in Landscape (gamma: 90 -> 115)
        const qTiltUpLand = computeDeviceCameraQuaternionRobust(180, 0, 115, 90);
        const rUp = projectMotion(qAnchorLand, qTiltUpLand);

        // 5. Simultaneous Turn RIGHT 30 deg + Tilt DOWN 20 deg
        const qDiagLand = computeDeviceCameraQuaternionRobust(150, 0, 70, 90);
        const rDiag = projectMotion(qAnchorLand, qDiagLand);

        // 6. Return to Anchor
        const rCenter = projectMotion(qAnchorLand, qAnchorLand);

        // 7. Portrait (0 deg):
        // Anchor: a=180, b=90, g=0, orient=0
        const qAnchorPort = computeDeviceCameraQuaternionRobust(180, 90, 0, 0);
        // Tilt DOWN 20 deg in Portrait (beta: 90 -> 70)
        const qTiltDownPort = computeDeviceCameraQuaternionRobust(180, 70, 0, 0);
        const rDownPort = projectMotion(qAnchorPort, qTiltDownPort);
        // Tilt UP 20 deg in Portrait (beta: 90 -> 110)
        const qTiltUpPort = computeDeviceCameraQuaternionRobust(180, 110, 0, 0);
        const rUpPort = projectMotion(qAnchorPort, qTiltUpPort);

        return {
          rRight,
          rLeft,
          rDown,
          rUp,
          rDiag,
          rCenter,
          rDownPort,
          rUpPort
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Robust Verification Suite:\n', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

