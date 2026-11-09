const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-pitch-inspect-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9294',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9294/json/list', res => {
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

  // Landscape
  await sendCmd('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: 'landscapePrimary' }
  });

  await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await sendCmd('Runtime.evaluate', {
    expression: `
      (() => {
        window.KotakARSELNEL.startSimulationMode();
        window.KotakARSELNEL.startPOVMode();

        // Simulate anchor at current heading (e.g. facing computer in Landscape)
        // On iPad in Landscape:
        // When held vertically facing a computer screen:
        // Typically alpha is compass heading (say 180).
        // What is beta and gamma?
        // In landscape (90 deg):
        // If the tablet is vertical:
        // iPad's short edge is vertical. Rotation around short edge (beta) is 0 or near 0 when screen is upright.
        // Rotation around long edge (gamma) is 90 or -90 when screen is upright!
        // OR: beta is 90 and gamma is 0!
        
        // Let's test BOTH cases:
        // Case A: beta = 0, gamma = 90, orient = 90
        // When tilting iPad down towards desk:
        // Does the user tilt around the long edge (gamma decreases, e.g. 90 -> 60)?
        // Or does beta change?
        
        const testCase = (a0, b0, g0, orient, a1, b1, g1, desc) => {
          const q0 = window.KotakARSELNEL.computeDeviceCameraQuaternion(a0, b0, g0, orient);
          const q1 = window.KotakARSELNEL.computeDeviceCameraQuaternion(a1, b1, g1, orient);
          
          const fwd = new window.THREE.Vector3(0, 0, -1);
          const anchorWorld = fwd.clone().applyQuaternion(q0);
          
          const vCam = anchorWorld.clone().applyQuaternion(q1.clone().invert());
          const deltaYaw = Math.atan2(vCam.x, -vCam.z) * (180 / Math.PI);
          const deltaPitch = Math.atan2(vCam.y, -vCam.z) * (180 / Math.PI);
          
          const screenW = 1024;
          const screenH = 768;
          const fovHRad = (65 * Math.PI) / 180;
          const tanHalfFovH = Math.tan(fovHRad / 2);
          const aspect = screenW / screenH;
          const tanHalfFovV = tanHalfFovH / aspect;
          
          const ndcX = vCam.x / (-vCam.z * tanHalfFovH);
          const ndcY = vCam.y / (-vCam.z * tanHalfFovV);
          
          const projX = (screenW / 2) + (ndcX * (screenW / 2));
          const projY = (screenH / 2) - (ndcY * (screenH / 2));
          
          return {
            desc,
            vCam: { x: vCam.x.toFixed(2), y: vCam.y.toFixed(2), z: vCam.z.toFixed(2) },
            deltaYaw: deltaYaw.toFixed(1),
            deltaPitch: deltaPitch.toFixed(1),
            projX: Math.round(projX),
            projY: Math.round(projY)
          };
        };

        const res = [
          // Case 1: Portrait (orient = 0)
          // Vertical: b=90, g=0. Tilt down: b=60.
          testCase(0, 90, 0, 0, 0, 60, 0, 0, 'Portrait: Tilt DOWN 30 deg (b: 90->60)'),
          // Vertical: b=90, g=0. Tilt up: b=120.
          testCase(0, 90, 0, 0, 0, 120, 0, 0, 'Portrait: Tilt UP 30 deg (b: 90->120)'),
          // Vertical: b=90, g=0. Turn right: a=30.
          testCase(0, 90, 0, 0, 30, 90, 0, 0, 'Portrait: Turn RIGHT 30 deg (a: 0->30)'),

          // Case 2: Landscape Left (orient = 90)
          // If vertical is b=0, g=90:
          // What happens if user tilts down? If g: 90->60:
          testCase(0, 0, 90, 90, 0, 0, 60, 90, 'Landscape 90: g: 90->60'),
          // What if b changes: b: 0->-30:
          testCase(0, 0, 90, 90, 0, -30, 90, 90, 'Landscape 90: b: 0->-30'),
          // What if b: 0->30:
          testCase(0, 0, 90, 90, 0, 30, 90, 90, 'Landscape 90: b: 0->30'),

          // Case 3: In iOS Landscape, what are the ACTUAL Euler angles when device is held upright facing forward?
          // Let us check W3C definition:
          // At rest flat on table: beta=0, gamma=0.
          // Lift device to landscape:
          // User tilts device upright along X axis: beta = 90.
          // Then rotates device in hand to landscape:
          // Gamma becomes -90 (or +90) or screen orientation changes!
          // BUT wait! In iOS Safari:
          // Does DeviceOrientationEvent change when screen orientation changes?
          // NO! The accelerometer/gyro is in HARDWARE coordinates!
          // In hardware coordinates:
          // When phone is upright: X is horizontal, Y is vertical, Z is out of screen.
          // Tilt towards user is beta.
          // If you rotate phone 90 deg into landscape and hold it upright:
          // HARDWARE Y is now horizontal! HARDWARE X is vertical!
          // Tilting towards floor in landscape rotates around HARDWARE Y (gamma)!
          // Let us check when g goes from 0 to 30:
          testCase(0, 0, 0, 90, 0, 0, 30, 90, 'Landscape 90: g: 0->30 from flat'),
        ];

        return res;
      })()
    `,
    returnByValue: true
  });

  console.log('Results:\n', JSON.stringify(result.result.value, null, 2));

  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

