const { spawn } = require('child_process');
const CDP_PORT = 9336;

async function run() {
  const p = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--remote-debugging-port=' + CDP_PORT,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ]);

  await new Promise(r => setTimeout(r, 3500));
  const res = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);

  await new Promise(r => ws.onopen = r);

  const evalRes = await new Promise((resolve) => {
    ws.onmessage = (m) => resolve(JSON.parse(m.data));
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          const THREE = window.THREE;
          const DEG2RAD = Math.PI / 180;
          const RAD2DEG = 180 / Math.PI;
          const fnCustom = window.KotakARSELNEL.computeDeviceCameraQuaternion;

          function fnOfficial(aD, bD, gD, oD) {
            const a = aD * DEG2RAD, b = bD * DEG2RAD, g = gD * DEG2RAD, o = oD * DEG2RAD;
            const zee = new THREE.Vector3(0, 0, 1);
            const euler = new THREE.Euler(b, a, -g, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
            const q0 = new THREE.Quaternion().setFromAxisAngle(zee, -o);
            q.multiply(q1);
            q.multiply(q0);
            return q;
          }

          const fwd = new THREE.Vector3(0, 0, -1);
          const up = new THREE.Vector3(0, 1, 0);

          function checkAngles(fn, a, b, g, o) {
            const q = fn(a, b, g, o);
            const vf = fwd.clone().applyQuaternion(q);
            const vu = up.clone().applyQuaternion(q);
            const yaw = Math.atan2(vf.x, -vf.z) * RAD2DEG;
            const pitch = Math.asin(Math.max(-1, Math.min(1, vf.y))) * RAD2DEG;
            return {
              fwd: [vf.x.toFixed(2), vf.y.toFixed(2), vf.z.toFixed(2)],
              up: [vu.x.toFixed(2), vu.y.toFixed(2), vu.z.toFixed(2)],
              yaw: yaw.toFixed(1),
              pitch: pitch.toFixed(1)
            };
          }

          return {
            custom_portrait_horizon: checkAngles(fnCustom, 0, 90, 0, 0),
            custom_portrait_tilt_up: checkAngles(fnCustom, 0, 60, 0, 0),
            custom_portrait_tilt_down: checkAngles(fnCustom, 0, 120, 0, 0),

            custom_land_horizon: checkAngles(fnCustom, 0, 0, 90, 90),
            custom_land_beta30: checkAngles(fnCustom, 0, 30, 90, 90),
            custom_land_gamma60: checkAngles(fnCustom, 0, 0, 60, 90),

            official_portrait_horizon: checkAngles(fnOfficial, 0, 90, 0, 0),
            official_portrait_tilt_up: checkAngles(fnOfficial, 0, 60, 0, 0),
            official_portrait_tilt_down: checkAngles(fnOfficial, 0, 120, 0, 0),

            official_land_horizon: checkAngles(fnOfficial, 0, 0, 90, 90),
            official_land_beta30: checkAngles(fnOfficial, 0, 30, 90, 90),
            official_land_gamma60: checkAngles(fnOfficial, 0, 0, 60, 90)
          };
        })()`,
        returnByValue: true
      }
    }));
  });

  console.log('Result:\n', JSON.stringify(evalRes.result.result.value, null, 2));
  p.kill();
  process.exit(0);
}

run();

