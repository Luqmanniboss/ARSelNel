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

          function threeDeviceOrientationControls(alpha, beta, gamma, orient) {
            const zee = new THREE.Vector3(0, 0, 1);
            const euler = new THREE.Euler(beta * DEG2RAD, alpha * DEG2RAD, -gamma * DEG2RAD, 'YXZ');
            const q = new THREE.Quaternion().setFromEuler(euler);
            const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X
            const q0 = new THREE.Quaternion().setFromAxisAngle(zee, -orient * DEG2RAD);
            q.multiply(q1);
            q.multiply(q0);
            return q;
          }

          // Let's test what threeDeviceOrientationControls does in Portrait vs Landscape!
          // 1. Portrait upright:
          // iPad in Portrait upright: alpha=0, beta=90, gamma=0, orient=0
          const qPortRef = threeDeviceOrientationControls(0, 90, 0, 0);
          const fwdPortRef = new THREE.Vector3(0, 0, -1).applyQuaternion(qPortRef);
          const upPortRef = new THREE.Vector3(0, 1, 0).applyQuaternion(qPortRef);

          // Tilt up in Portrait (dongak): beta goes to 60 (top moves back)
          const qPortDongak = threeDeviceOrientationControls(0, 60, 0, 0);
          const fwdPortDongak = new THREE.Vector3(0, 0, -1).applyQuaternion(qPortDongak);
          const vCamPortDongak = fwdPortRef.clone().applyQuaternion(qPortDongak.clone().invert());

          // Tilt down in Portrait (tunduk): beta goes to 120 (top moves forward)
          const qPortTunduk = threeDeviceOrientationControls(0, 120, 0, 0);
          const vCamPortTunduk = fwdPortRef.clone().applyQuaternion(qPortTunduk.clone().invert());

          // 2. Landscape on iPad:
          // When an iPad is held in Landscape upright:
          // orient = 90
          // What are (alpha, beta, gamma)?
          // In landscape-primary (orient=90):
          // Device is held upright. The long side is horizontal, short side is vertical.
          // On iPad Safari, when held upright in Landscape:
          // If top of iPad (in landscape) tilts back (dongak):
          // Which sensor angle changes?
          // Let's check: beta = 0, gamma = 90 (or gamma = -90).
          // If dongak (tilt up): gamma goes from 90 to 60!
          // Let's check:
          const qLandRef_g90 = threeDeviceOrientationControls(0, 0, 90, 90);
          const fwdLandRef = new THREE.Vector3(0, 0, -1).applyQuaternion(qLandRef_g90);
          const upLandRef = new THREE.Vector3(0, 1, 0).applyQuaternion(qLandRef_g90);

          const qLandDongak_g60 = threeDeviceOrientationControls(0, 0, 60, 90);
          const vCamLandDongak = fwdLandRef.clone().applyQuaternion(qLandDongak_g60.clone().invert());

          const qLandTunduk_g120 = threeDeviceOrientationControls(0, 0, 120, 90);
          const vCamLandTunduk = fwdLandRef.clone().applyQuaternion(qLandTunduk_g120.clone().invert());

          // What if iPad in landscape reports beta=90?
          // Let's check beta=90 with orient=90:
          const qLandRef_b90 = threeDeviceOrientationControls(0, 90, 0, 90);
          const fwdLand_b90 = new THREE.Vector3(0, 0, -1).applyQuaternion(qLandRef_b90);
          const upLand_b90 = new THREE.Vector3(0, 1, 0).applyQuaternion(qLandRef_b90);

          return {
            portRefFwd: [fwdPortRef.x.toFixed(2), fwdPortRef.y.toFixed(2), fwdPortRef.z.toFixed(2)],
            portRefUp: [upPortRef.x.toFixed(2), upPortRef.y.toFixed(2), upPortRef.z.toFixed(2)],
            vCamPortDongak: [vCamPortDongak.x.toFixed(2), vCamPortDongak.y.toFixed(2), vCamPortDongak.z.toFixed(2)],
            vCamPortTunduk: [vCamPortTunduk.x.toFixed(2), vCamPortTunduk.y.toFixed(2), vCamPortTunduk.z.toFixed(2)],
            fwdLandRef: [fwdLandRef.x.toFixed(2), fwdLandRef.y.toFixed(2), fwdLandRef.z.toFixed(2)],
            upLandRef: [upLandRef.x.toFixed(2), upLandRef.y.toFixed(2), upLandRef.z.toFixed(2)],
            vCamLandDongak: [vCamLandDongak.x.toFixed(2), vCamLandDongak.y.toFixed(2), vCamLandDongak.z.toFixed(2)],
            vCamLandTunduk: [vCamLandTunduk.x.toFixed(2), vCamLandTunduk.y.toFixed(2), vCamLandTunduk.z.toFixed(2)],
            fwdLand_b90: [fwdLand_b90.x.toFixed(2), fwdLand_b90.y.toFixed(2), fwdLand_b90.z.toFixed(2)],
            upLand_b90: [upLand_b90.x.toFixed(2), upLand_b90.y.toFixed(2), upLand_b90.z.toFixed(2)]
          };
        })()`,
        returnByValue: true
      }
    }));
  });

  p.kill();
  console.log('Test output:\n', JSON.stringify(evalRes.result.result.value, null, 2));
}

run();

