const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-matrix-test-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9297',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9297/json/list', res => {
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

        // W3C Rotation Matrix:
        // R = Rz(alpha) * Rx(beta) * Ry(gamma)
        function getRotationMatrix(alpha, beta, gamma) {
          const _x = beta * DEG2RAD;
          const _y = gamma * DEG2RAD;
          const _z = alpha * DEG2RAD;

          const cX = Math.cos(_x);
          const cY = Math.cos(_y);
          const cZ = Math.cos(_z);
          const sX = Math.sin(_x);
          const sY = Math.sin(_y);
          const sZ = Math.sin(_z);

          // Matrix components according to W3C spec
          const m11 = cZ * cY - sZ * sX * sY;
          const m12 = -cX * sZ;
          const m13 = cY * sZ * sX + cZ * sY;

          const m21 = cY * sZ + cZ * sX * sY;
          const m22 = cX * cZ;
          const m23 = sZ * sY - cZ * cY * sX;

          const m31 = -cX * sY;
          const m32 = sX;
          const m33 = cX * cY;

          // Three.js Matrix4 (column-major)
          const m = new THREE.Matrix4();
          m.set(
            m11, m12, m13, 0,
            m21, m22, m23, 0,
            m31, m32, m33, 0,
            0,   0,   0,   1
          );
          return m;
        }

        // Test in Landscape:
        const m1 = getRotationMatrix(0, 0, 90);
        const m2 = getRotationMatrix(0, 30, 90);

        return {
          m1_det: m1.determinant(),
          m2_det: m2.determinant(),
          m1_elements: m1.elements,
          m2_elements: m2.elements
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Matrix Test:', JSON.stringify(evalRes.result.value, null, 2));
  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

