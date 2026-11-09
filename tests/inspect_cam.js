const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9312;

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_cdp_inspect_' + Date.now());
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

  await new Promise(r => setTimeout(r, 3500));
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
        if (m.id === id) { ws.removeEventListener('message', h); resolve(m.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const cam = window.KotakARSELNEL.state.camera;
      const scene = window.KotakARSELNEL.state.scene;
      return {
        camExists: !!cam,
        camType: cam ? cam.type : null,
        near: cam ? cam.near : null,
        far: cam ? cam.far : null,
        fov: cam ? cam.fov : null,
        projMat: cam ? Array.from(cam.projectionMatrix.elements) : null,
        camPos: cam ? [cam.position.x, cam.position.y, cam.position.z] : null,
        sceneChildren: scene ? scene.children.map(c => ({ name: c.name, type: c.type, childrenCount: c.children.length })) : []
      };
    })()`,
    returnByValue: true
  });
  console.log('Camera info:', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
  proc.kill();
  process.exit(0);
}
run().catch(console.error);

