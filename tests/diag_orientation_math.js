/**
 * Diagnostic tool: Test computeDeviceCameraQuaternion with real Safari iPadOS landscape angles
 */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testOrientationMath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9346;
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-diag-' + Date.now());
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

  const mathRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const results = [];
        const computeQ = window.KotakARSELNEL.computeDeviceCameraQuaternion;
        const forward = new window.THREE.Vector3(0, 0, -1);

        // Screen angle in Landscape iPad
        const screenAngle = 90;

        // On iPad in landscape:
        // When holding upright facing North:
        // alpha = 0 (North).
        // In landscape, beta is ~0 deg, gamma is ~90 deg (or beta 90, gamma 0 depending on definition).
        // Let's test BOTH conventions!
        
        // Convention 1: beta=0, gamma=90 (Holding landscape upright)
        // Tilting down 30 deg: does beta change or does gamma change?
        // Let's test:
        const qAnchor = computeQ(0, 0, 90, screenAngle);
        const anchorVec = forward.clone().applyQuaternion(qAnchor);

        // Case A: Beta changes (e.g. beta = -30, gamma = 90)
        const qBetaTilt = computeQ(0, -30, 90, screenAngle);
        const vCamBeta = anchorVec.clone().applyQuaternion(qBetaTilt.clone().invert());
        const deltaYawBeta = Math.atan2(vCamBeta.x, -vCamBeta.z) * 180 / Math.PI;
        const deltaPitchBeta = Math.atan2(vCamBeta.y, -vCamBeta.z) * 180 / Math.PI;

        // Case B: Gamma changes (e.g. beta = 0, gamma = 60)
        const qGammaTilt = computeQ(0, 0, 60, screenAngle);
        const vCamGamma = anchorVec.clone().applyQuaternion(qGammaTilt.clone().invert());
        const deltaYawGamma = Math.atan2(vCamGamma.x, -vCamGamma.z) * 180 / Math.PI;
        const deltaPitchGamma = Math.atan2(vCamGamma.y, -vCamGamma.z) * 180 / Math.PI;

        // Case C: What does iPad Safari ACTUALLY emit?
        // In iOS Safari DeviceOrientation specification:
        // alpha in [0, 360]
        // beta in [-180, 180] (pitch: tilt forward/back in portrait)
        // gamma in [-90, 90] (roll: tilt left/right in portrait)
        // When iPad is in landscape-primary (home button right, screen.orientation.angle = 90):
        // iPad is rotated 90 deg clockwise around screen Z.
        // Tilting iPad forward/back:
        // The rotation is around the HORIZONTAL axis of the iPad in landscape.
        // That axis in the iPad's body frame is the Y axis!
        // So gamma changes! BUT gamma is clamped to [-90, 90] in iOS!
        // What about beta?
        return {
          caseBeta: { vCam: vCamBeta, deltaYaw: deltaYawBeta, deltaPitch: deltaPitchBeta },
          caseGamma: { vCam: vCamGamma, deltaYaw: deltaYawGamma, deltaPitch: deltaPitchGamma }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Math Results:', JSON.stringify(mathRes.result.result.value, null, 2));

  await ws.close();
  proc.kill();
}

testOrientationMath().catch(console.error);

