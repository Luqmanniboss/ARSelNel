const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9227;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-inspect-orient-'));

const proc = spawn(chromePath, [
  '--remote-debugging-port=' + CDP_PORT,
  '--user-data-dir=' + userDataDir,
  '--no-first-run',
  '--headless=new',
  '--ignore-certificate-errors',
  'about:blank'
]);

async function main() {
  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list');
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const cur = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === cur) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://127.0.0.1:3443/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 2500));

  const result = await send('Runtime.evaluate', {
    expression: `(async () => {
      const loader = new THREE.GLTFLoader();
      const gltf = await new Promise(r => loader.load('/models/animal_cell_final.glb', r));
      const box = new THREE.Box3().setFromObject(gltf.scene);
      return {
        boxMin: box.min.toArray(),
        boxMax: box.max.toArray(),
        children: gltf.scene.children.map(c => ({
          name: c.name,
          pos: c.position.toArray(),
          rot: [c.rotation.x, c.rotation.y, c.rotation.z],
          scale: c.scale.toArray()
        }))
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Animal cell orientations:', JSON.stringify(result, null, 2));

  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
}
main().catch(err => { console.error(err); proc.kill(); });

