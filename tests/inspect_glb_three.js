const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9226;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-inspect-three-'));

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
      const inspect = (url) => new Promise((resolve) => {
        loader.load(url, (gltf) => {
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const meshes = [];
          gltf.scene.traverse(node => {
            if (node.isMesh) {
              meshes.push({
                name: node.name,
                visible: node.visible,
                frustumCulled: node.frustumCulled,
                materialSide: node.material ? (Array.isArray(node.material) ? node.material.map(m => m.side) : node.material.side) : null,
                opacity: node.material ? (Array.isArray(node.material) ? node.material.map(m => m.opacity) : node.material.opacity) : null,
                transparent: node.material ? (Array.isArray(node.material) ? node.material.map(m => m.transparent) : node.material.transparent) : null
              });
            }
          });
          resolve({
            url,
            boxMin: box.min.toArray(),
            boxMax: box.max.toArray(),
            size: size.toArray(),
            center: center.toArray(),
            maxDim: Math.max(size.x, size.y, size.z),
            meshCount: meshes.length,
            meshes: meshes
          });
        }, null, (err) => resolve({ url, error: String(err) }));
      });

      const animal = await inspect('/models/animal_cell_final.glb');
      const plant = await inspect('/models/plantcellnew.glb');
      return { animal, plant };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Inspection result:', JSON.stringify(result, null, 2));

  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
}
main().catch(err => { console.error(err); proc.kill(); });

