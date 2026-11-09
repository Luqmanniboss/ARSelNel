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

  await new Promise(r => setTimeout(r, 2500));
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

          function fnCanonical(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
            const a = (alphaDeg || 0) * DEG2RAD;
            const b = (betaDeg || 0) * DEG2RAD;
            const g = (gammaDeg || 0) * DEG2RAD;
            const o = (screenAngleDeg || 0) * DEG2RAD;

            const zee = new THREE.Vector3(0, 0, 1);
            const euler = new THREE.Euler(b, a, -g, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
            const q0 = new THREE.Quaternion().setFromAxisAngle(zee, -o);
            q.multiply(q1);
            q.multiply(q0);
            return q;
          }

          // Let's test Portrait: (alpha=0, beta=90, gamma=0, screenAngle=0)
          const qC_port = fnCustom(0, 90, 0, 0);
          const qCan_port = fnCanonical(0, 90, 0, 0);

          // Let's test Landscape 90: (alpha=90, beta=0, gamma=-90, screenAngle=90)
          const qC_land = fnCustom(90, 0, -90, 90);
          const qCan_land = fnCanonical(90, 0, -90, 90);

          // Let's test Landscape 270 (-90): (alpha=270, beta=0, gamma=90, screenAngle=270)
          const qC_land270 = fnCustom(270, 0, 90, 270);
          const qCan_land270 = fnCanonical(270, 0, 90, 270);

          return {
            diffPort: qC_port.dot(qCan_port).toFixed(4),
            diffLand90: qC_land.dot(qCan_land).toFixed(4),
            diffLand270: qC_land270.dot(qCan_land270).toFixed(4)
          };
        })()`,
        returnByValue: true
      }
    }));
  });

  p.kill();
  console.log('Result:\n', JSON.stringify(evalRes.result.result.value, null, 2));
}

run();
