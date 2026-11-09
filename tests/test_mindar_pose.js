const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9319;

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_cdp_pincheck_' + Date.now());
  const proc = spawn(chromePath, [
    '--remote-debugging-port=' + CDP_PORT,
    '--user-data-dir=' + userDataDir,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  process.on('exit', () => { try { proc.kill(); } catch (e) {} });

  await new Promise(r => setTimeout(r, 4500));
  const res = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');

  // Wait for postMatrixs
  for (let i = 0; i < 30; i++) {
    const chk = await send('Runtime.evaluate', {
      expression: '!!(window.KotakARSELNEL && window.KotakARSELNEL.state.mindarThree && window.KotakARSELNEL.state.mindarThree.postMatrixs)'
    });
    if (chk.result.value) break;
    await new Promise(r => setTimeout(r, 500));
  }

  const calcRes = await send('Runtime.evaluate', {
    expression: `(() => {
      try {
        const m3 = window.KotakARSELNEL.state.mindarThree;
        if (!m3 || !m3.postMatrixs) return { error: 'no postMatrixs' };
        const post = m3.postMatrixs[3];
        
        const s = new THREE.Matrix4();
        // Suppose distance is 1.2m: tz = -1.2
        s.elements = [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0.05, -0.02, -1.2, 1
        ];
        s.multiply(post);
        
        const pos = new THREE.Vector3();
        const rot = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        s.decompose(pos, rot, scale);
        
        return {
          pos: [pos.x, pos.y, pos.z],
          scale: [scale.x, scale.y, scale.z],
          rot: [rot.x, rot.y, rot.z, rot.w]
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    returnByValue: true
  });
  console.log('Result:', calcRes.result.value);

  ws.close();
  proc.kill();
  process.exit(0);
}
run().catch(console.error);
