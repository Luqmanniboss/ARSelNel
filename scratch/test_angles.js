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

          // In landscape on iOS:
          // How does iOS report (alpha, beta, gamma) when in landscape-primary (orient = 90)?
          // Note: On iOS, alpha/beta/gamma are ALWAYS reported in the device physical coordinate system!
          // Device coordinate system:
          // X: along short edge (pointing right when held portrait)
          // Y: along long edge (pointing up when held portrait)
          // Z: out of screen
          // When rotated 90 deg counter-clockwise to landscape:
          // The long edge (Y) is horizontal (pointing left in screen, or right in world).
          // The short edge (X) is vertical (pointing down in screen, or up in world)!
          // When standing upright in landscape:
          // If X is vertical: rotation around device X is beta. But device X is vertical!
          // So rotation around vertical is beta!
          // And rotation around horizontal is gamma!
          // BUT wait! Does iOS rotate sensor data or does it keep raw sensor data?
          // In Safari on iPad:
          // If beta is around horizontal or vertical?
          // Let's test two possibilities for iPad in landscape upright:
          // Possibility A: beta = 0, gamma = 90
          // Possibility B: beta = 90, gamma = 0
          // Let's test both with threeDOC:

          // Test A: beta = 0, gamma = 90 (or -90)
          const qA_ref = threeDOC(0, 0, 90, 90);
          const fwdA_ref = new THREE.Vector3(0, 0, -1).applyQuaternion(qA_ref);
          const upA_ref = new THREE.Vector3(0, 1, 0).applyQuaternion(qA_ref);

          // If gamma tilts to 120 (dongak) vs 60 (tunduk):
          const qA_dongak = threeDOC(0, 0, 60, 90);
          const vCamA_dongak = fwdA_ref.clone().applyQuaternion(qA_dongak.clone().invert());
          const qA_tunduk = threeDOC(0, 0, 120, 90);
          const vCamA_tunduk = fwdA_ref.clone().applyQuaternion(qA_tunduk.clone().invert());

          // Test B: What if user tilts iPad when orient = 90, but beta is 90?
          const qB_ref = threeDOC(0, 90, 0, 90);
          const fwdB_ref = new THREE.Vector3(0, 0, -1).applyQuaternion(qB_ref);
          const upB_ref = new THREE.Vector3(0, 1, 0).applyQuaternion(qB_ref);

          // If beta tilts to 120 vs 60:
          const qB_dongak = threeDOC(0, 120, 0, 90);
          const vCamB_dongak = fwdB_ref.clone().applyQuaternion(qB_dongak.clone().invert());
          const qB_tunduk = threeDOC(0, 60, 0, 90);
          const vCamB_tunduk = fwdB_ref.clone().applyQuaternion(qB_tunduk.clone().invert());

          return {
            CaseA: {
              fwdRef: [fwdA_ref.x.toFixed(2), fwdA_ref.y.toFixed(2), fwdA_ref.z.toFixed(2)],
              upRef: [upA_ref.x.toFixed(2), upA_ref.y.toFixed(2), upA_ref.z.toFixed(2)],
              vCamDongak: [vCamA_dongak.x.toFixed(2), vCamA_dongak.y.toFixed(2), vCamA_dongak.z.toFixed(2)],
              vCamTunduk: [vCamA_tunduk.x.toFixed(2), vCamA_tunduk.y.toFixed(2), vCamA_tunduk.z.toFixed(2)]
            },
            CaseB: {
              fwdRef: [fwdB_ref.x.toFixed(2), fwdB_ref.y.toFixed(2), fwdB_ref.z.toFixed(2)],
              upRef: [upB_ref.x.toFixed(2), upB_ref.y.toFixed(2), upB_ref.z.toFixed(2)],
              vCamDongak: [vCamB_dongak.x.toFixed(2), vCamB_dongak.y.toFixed(2), vCamB_dongak.z.toFixed(2)],
              vCamTunduk: [vCamB_tunduk.x.toFixed(2), vCamB_tunduk.y.toFixed(2), vCamB_tunduk.z.toFixed(2)]
            }
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
