const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-landscape-debug-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9296',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9296/json/list', res => {
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

        const _Q_MINUS_HALF_PI_X = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
        const _Z_AXIS = new THREE.Vector3(0, 0, 1);
        const _WORLD_FORWARD = new THREE.Vector3(0, 0, -1);

        // Let's analyze computeDeviceCameraQuaternion:
        // In Landscape, screenAngle = 90
        // What does Euler 'YXZ' do?
        // euler.set(betaRad, alphaRad, -gammaRad, 'YXZ')
        // When beta = 0, alpha = 0, gamma = 90:
        // euler is (0, 0, -pi/2, 'YXZ')
        // q.setFromEuler(euler)
        // Then q.multiply(_Q_MINUS_HALF_PI_X)
        // Then q.multiply(qScreen) where qScreen is -90 around Z:
        
        // Let's test what happens when beta changes from 0 to 30:
        const q0 = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 0, 90, 90);
        const qBeta30 = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 30, 90, 90);

        // Forward vector in world for q0:
        const fwd0 = _WORLD_FORWARD.clone().applyQuaternion(q0);
        // Forward vector in world for qBeta30:
        const fwdBeta30 = _WORLD_FORWARD.clone().applyQuaternion(qBeta30);

        // What about when gamma changes:
        const qGamma60 = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 0, 60, 90);
        const fwdGamma60 = _WORLD_FORWARD.clone().applyQuaternion(qGamma60);

        return {
          fwd0: { x: fwd0.x.toFixed(3), y: fwd0.y.toFixed(3), z: fwd0.z.toFixed(3) },
          fwdBeta30: { x: fwdBeta30.x.toFixed(3), y: fwdBeta30.y.toFixed(3), z: fwdBeta30.z.toFixed(3) },
          fwdGamma60: { x: fwdGamma60.x.toFixed(3), y: fwdGamma60.y.toFixed(3), z: fwdGamma60.z.toFixed(3) },
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Landscape Debug:', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

