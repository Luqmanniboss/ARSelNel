const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-pitch-exp-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9293',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9293/json/list', res => {
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

  const result = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.startSimulationMode();
        window.KotakARSELNEL.startPOVMode();
        
        const fwd = new window.THREE.Vector3(0, 0, -1);
        
        // On iOS Safari in Landscape (screenAngle = 90):
        // What are the actual alpha, beta, gamma values when holding iPad vertically facing forward?
        // In standard W3C:
        // Flat on table facing North: alpha=0, beta=0, gamma=0.
        // Standing upright in Portrait facing North: alpha=0, beta=90, gamma=0.
        // If from upright in portrait you rotate device 90 deg counter-clockwise to Landscape (screenAngle=90):
        // The device's X axis is now pointing UP, Y axis is pointing LEFT.
        // In W3C Euler angles:
        // Standing upright in Landscape (orient=90):
        // beta=0, gamma=90? Or beta=90, gamma=-90?
        // Let's test what DeviceOrientationControls Euler 'YXZ' produces for both!

        // Let's check Euler ('YXZ'):
        // euler.set(betaRad, alphaRad, -gammaRad, 'YXZ')
        // When gamma=90 and beta=0:
        const qLand1 = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 0, 90, 90);
        const fwdLand1 = fwd.clone().applyQuaternion(qLand1);
        
        // What is fwdLand1?
        // And when tilting iPad down in landscape:
        // Does beta change or does gamma change?
        // When iPad is in landscape (orient=90), tilting it DOWN is tilting around the world horizontal axis!
        // Let's test changing beta vs changing gamma:
        const qLand1_gammaDown = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 0, 60, 90);
        const vGammaDown = fwdLand1.clone().applyQuaternion(qLand1_gammaDown.clone().invert());

        const qLand1_betaDown = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, -30, 90, 90);
        const vBetaDown = fwdLand1.clone().applyQuaternion(qLand1_betaDown.clone().invert());
        
        // What if iPad in Landscape has beta=90, gamma=0?
        const qLand2 = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 90, 0, 90);
        const fwdLand2 = fwd.clone().applyQuaternion(qLand2);
        const qLand2_tiltDown = window.KotakARSELNEL.computeDeviceCameraQuaternion(0, 60, 0, 90);
        const vLand2_tiltDown = fwdLand2.clone().applyQuaternion(qLand2_tiltDown.clone().invert());
        
        return {
          fwdLand1: { x: fwdLand1.x.toFixed(3), y: fwdLand1.y.toFixed(3), z: fwdLand1.z.toFixed(3) },
          vGammaDown: { x: vGammaDown.x.toFixed(3), y: vGammaDown.y.toFixed(3), z: vGammaDown.z.toFixed(3) },
          vBetaDown: { x: vBetaDown.x.toFixed(3), y: vBetaDown.y.toFixed(3), z: vBetaDown.z.toFixed(3) },
          fwdLand2: { x: fwdLand2.x.toFixed(3), y: fwdLand2.y.toFixed(3), z: fwdLand2.z.toFixed(3) },
          vLand2_tiltDown: { x: vLand2_tiltDown.x.toFixed(3), y: vLand2_tiltDown.y.toFixed(3), z: vLand2_tiltDown.z.toFixed(3) },
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(result.result.value, null, 2));

  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
