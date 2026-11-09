const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-quat-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9295',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9295/json/list', res => {
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

        const _X = new THREE.Vector3(1, 0, 0);
        const _Y = new THREE.Vector3(0, 1, 0);
        const _Z = new THREE.Vector3(0, 0, 1);
        const _Q_MINUS_HALF_PI_X = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
        const _WORLD_FORWARD = new THREE.Vector3(0, 0, -1);

        // Direct Quaternion construction from W3C intrinsic Z-X'-Y'' rotations:
        function computeQuatDirect(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
          const a = (Number.isFinite(alphaDeg) ? alphaDeg : 0) * DEG2RAD;
          const b = (Number.isFinite(betaDeg) ? betaDeg : 0) * DEG2RAD;
          const g = (Number.isFinite(gammaDeg) ? gammaDeg : 0) * DEG2RAD;
          const orient = (Number.isFinite(screenAngleDeg) ? screenAngleDeg : 0) * DEG2RAD;

          // Intrinsic rotations Z(alpha) -> X'(beta) -> Y''(gamma):
          // In extrinsic (fixed world) axes: R = R_z(alpha) * R_x(beta) * R_y(gamma)
          const qZ = new THREE.Quaternion().setFromAxisAngle(_Z, a);
          const qX = new THREE.Quaternion().setFromAxisAngle(_X, b);
          const qY = new THREE.Quaternion().setFromAxisAngle(_Y, g);

          // Combined device orientation in earth frame
          const qDevice = new THREE.Quaternion();
          qDevice.multiply(qZ);
          qDevice.multiply(qX);
          qDevice.multiply(qY);

          // Camera looks out the back (-90 on X)
          qDevice.multiply(_Q_MINUS_HALF_PI_X);

          // Screen orientation compensation (-orient on Z)
          const qScreen = new THREE.Quaternion().setFromAxisAngle(_Z, -orient);
          qDevice.multiply(qScreen);

          return qDevice;
        }

        // Test in Landscape (orient = 90)
        // Anchor: alpha=180, beta=0, gamma=90 (iPad held vertical in landscape facing South)
        const qAnchor = computeQuatDirect(180, 0, 90, 90);
        const anchorVec = _WORLD_FORWARD.clone().applyQuaternion(qAnchor);

        // Now user tilts iPad DOWN towards desk in Landscape:
        // When holding iPad in landscape, tilting towards desk rotates about the horizontal edge (which is device Y: gamma decreases from 90 to 60)
        // OR does beta change?
        // Let's test BOTH!
        // 1. If gamma decreases: 90 -> 60 (tilt down by 30 deg)
        const qDownG = computeQuatDirect(180, 0, 60, 90);
        const vCamDownG = anchorVec.clone().applyQuaternion(qDownG.clone().invert());
        const pitchDownG = Math.atan2(vCamDownG.y, -vCamDownG.z) * RAD2DEG;

        // 2. If gamma increases: 90 -> 120 (tilt up by 30 deg)
        const qUpG = computeQuatDirect(180, 0, 120, 90);
        const vCamUpG = anchorVec.clone().applyQuaternion(qUpG.clone().invert());
        const pitchUpG = Math.atan2(vCamUpG.y, -vCamUpG.z) * RAD2DEG;

        // 3. User turns iPad RIGHT in landscape (alpha decreases: 180 -> 150)
        const qRight = computeQuatDirect(150, 0, 90, 90);
        const vCamRight = anchorVec.clone().applyQuaternion(qRight.clone().invert());
        const yawRight = Math.atan2(vCamRight.x, -vCamRight.z) * RAD2DEG;

        // 4. User turns iPad LEFT in landscape (alpha increases: 180 -> 210)
        const qLeft = computeQuatDirect(210, 0, 90, 90);
        const vCamLeft = anchorVec.clone().applyQuaternion(qLeft.clone().invert());
        const yawLeft = Math.atan2(vCamLeft.x, -vCamLeft.z) * RAD2DEG;

        return {
          vCamDownG: { x: vCamDownG.x.toFixed(3), y: vCamDownG.y.toFixed(3), z: vCamDownG.z.toFixed(3), pitch: pitchDownG.toFixed(1) },
          vCamUpG: { x: vCamUpG.x.toFixed(3), y: vCamUpG.y.toFixed(3), z: vCamUpG.z.toFixed(3), pitch: pitchUpG.toFixed(1) },
          vCamRight: { x: vCamRight.x.toFixed(3), y: vCamRight.y.toFixed(3), z: vCamRight.z.toFixed(3), yaw: yawRight.toFixed(1) },
          vCamLeft: { x: vCamLeft.x.toFixed(3), y: vCamLeft.y.toFixed(3), z: vCamLeft.z.toFixed(3), yaw: yawLeft.toFixed(1) }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Quat Direct Results:', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

