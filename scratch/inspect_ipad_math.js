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

          function threeDOC(alpha, beta, gamma, orient) {
            const zee = new THREE.Vector3(0, 0, 1);
            const euler = new THREE.Euler(beta * DEG2RAD, alpha * DEG2RAD, -gamma * DEG2RAD, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X
            const q0 = new THREE.Quaternion().setFromAxisAngle(zee, -orient * DEG2RAD);
            q.multiply(q1);
            q.multiply(q0);
            return q;
          }

          const q90 = threeDOC(0, 90, 0, 0); // Upright horizon
          const q60 = threeDOC(0, 60, 0, 0); // Tilting top back (looking up)

          const fwd90 = new THREE.Vector3(0, 0, -1).applyQuaternion(q90);
          const fwd60 = new THREE.Vector3(0, 0, -1).applyQuaternion(q60);

          return {
            fwd90: [fwd90.x.toFixed(3), fwd90.y.toFixed(3), fwd90.z.toFixed(3)],
            fwd60: [fwd60.x.toFixed(3), fwd60.y.toFixed(3), fwd60.z.toFixed(3)]
          };
        })()`,
        returnByValue: true
      }
    }));
  });

  p.kill();
  console.log(evalRes.result.result.value);
}

run();
