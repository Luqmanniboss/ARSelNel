const { spawn } = require('child_process');
const CDP_PORT = 9338;
const chromeProc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--remote-debugging-port=' + CDP_PORT,
  '--headless=new',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--ignore-certificate-errors',
  'https://127.0.0.1:3443/kotak_arselnel/'
], { stdio: 'ignore' });

async function run() {
  await new Promise(r => setTimeout(r, 3000));
  const res = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const computeQ = window.KotakARSELNEL.computeDeviceCameraQuaternion;
      const fwd = new window.THREE.Vector3(0, 0, -1);
      const RAD2DEG = 180 / Math.PI;

      function test(name, a0, b0, g0, orient0, a1, b1, g1, orient1) {
        const q0 = computeQ(a0, b0, g0, orient0);
        const anchor = fwd.clone().applyQuaternion(q0);
        const q1 = computeQ(a1, b1, g1, orient1);
        const vCam = anchor.clone().applyQuaternion(q1.clone().invert());
        const deltaYaw = Math.atan2(vCam.x, -vCam.z) * RAD2DEG;
        const deltaPitch = Math.atan2(vCam.y, -vCam.z) * RAD2DEG;
        return { name, deltaYaw: deltaYaw.toFixed(1), deltaPitch: deltaPitch.toFixed(1), vCamY: vCam.y.toFixed(3) };
      }

      return [
        test('orient=90: Turn Right 30 (alpha 0->30)', 0, 0, 90, 90, 30, 0, 90, 90),
        test('orient=-90: Turn Right 30 (alpha 0->30)', 0, 0, -90, -90, 30, 0, -90, -90),
        test('orient=270: Turn Right 30 (alpha 0->30)', 0, 0, -90, 270, 30, 0, -90, 270),
        test('orient=0 (device is portrait, held landscape): Turn Right 30 (alpha 0->30)', 0, 0, 90, 0, 30, 0, 90, 0),
        test('orient=0 (beta changes on turn right): Turn Right 30 (beta 0->30)', 0, 0, 90, 0, 0, 30, 90, 0),
        test('orient=90 (beta changes on turn right): Turn Right 30 (beta 0->30)', 0, 0, 90, 90, 0, 30, 90, 90),
        test('orient=90 (gamma changes on turn right): Turn Right 30 (gamma 90->60)', 0, 0, 90, 90, 0, 0, 60, 90),
        test('orient=-90 (gamma changes on turn right): Turn Right 30 (gamma -90->-60)', 0, 0, -90, -90, 0, 0, -60, -90),
      ];
    })()`,
    returnByValue: true
  });
  console.log('Test Orientations:\n', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
  chromeProc.kill();
}
run();
