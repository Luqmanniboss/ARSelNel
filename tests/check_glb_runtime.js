const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9225;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-test-glb-'));

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

  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', msg.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'https://127.0.0.1:3443/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 3000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      return new Promise((resolve) => {
        if (!window.THREE || !window.THREE.GLTFLoader) {
          return resolve({ error: 'No GLTFLoader', hasThree: !!window.THREE });
        }
        const loader = new window.THREE.GLTFLoader();
        loader.load(
          '/models/animal_cell_final.glb',
          (gltf) => {
            const meshes = [];
            gltf.scene.traverse(n => { if (n.isMesh) meshes.push(n.name); });
            resolve({ success: true, meshCount: meshes.length, sampleMeshes: meshes.slice(0, 5) });
          },
          (progress) => {},
          (err) => resolve({ error: err ? (err.message || String(err)) : 'Unknown GLTF error' })
        );
      });
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('GLTF Load Result:', JSON.stringify(res, null, 2));

  // Also check CellQuestARController state after switchActiveModule('cellquest')
  const cqCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const ctrl = window.CellQuestARController;
      return {
        isActive: ctrl.isActive,
        activeCellType: ctrl.activeCellType,
        rootGroupAttached: !!ctrl.rootGroup.parent,
        parentName: ctrl.rootGroup.parent ? ctrl.rootGroup.parent.name : null,
        parentVisible: ctrl.rootGroup.parent ? ctrl.rootGroup.parent.visible : null,
        rootGroupVisible: ctrl.rootGroup.visible,
        modelHolderChildren: ctrl.modelHolder.children.length,
        interactiveObjectsCount: ctrl.interactiveObjects.length
      };
    })()`,
    returnByValue: true
  });
  console.log('CellQuest state:', JSON.stringify(cqCheck, null, 2));

  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch(e) {}
}
main().catch(err => { console.error(err); proc.kill(); });

