const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9227;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-inspect-render-'));

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
  await new Promise(r => setTimeout(r, 3000));

  const diag = await send('Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const ctrl = window.CellQuestARController;
      const mindar = window.KotakARSELNEL.ARState ? window.KotakARSELNEL.ARState.mindarThree : null;
      const camera = ctrl.camera;
      const scene = ctrl.scene;
      const renderer = ctrl.renderer;
      const canvas = renderer ? renderer.domElement : null;

      // Check canvas styles
      const canvasStyle = canvas ? {
        width: canvas.style.width,
        height: canvas.style.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        zIndex: getComputedStyle(canvas).zIndex,
        display: getComputedStyle(canvas).display,
        visibility: getComputedStyle(canvas).visibility,
        opacity: getComputedStyle(canvas).opacity
      } : null;

      // Check camera settings
      const camInfo = camera ? {
        near: camera.near,
        far: camera.far,
        fov: camera.fov,
        position: camera.position.toArray(),
        matrixWorld: camera.matrixWorld.elements
      } : null;

      // Check rootGroup & modelHolder
      const rootInfo = ctrl.rootGroup ? {
        visible: ctrl.rootGroup.visible,
        position: ctrl.rootGroup.position.toArray(),
        scale: ctrl.rootGroup.scale.toArray(),
        quaternion: ctrl.rootGroup.quaternion.toArray(),
        matrix: ctrl.rootGroup.matrix.elements,
        matrixWorld: ctrl.rootGroup.matrixWorld.elements,
        childrenCount: ctrl.rootGroup.children.length,
        modelHolderChildren: ctrl.modelHolder ? ctrl.modelHolder.children.length : 0
      } : null;

      // Project center of model to 2D screen coordinates
      let projectedScreen = null;
      if (camera && ctrl.rootGroup) {
        const v = new THREE.Vector3();
        ctrl.rootGroup.getWorldPosition(v);
        const worldPos = v.clone();
        v.project(camera);
        projectedScreen = {
          worldPos: worldPos.toArray(),
          ndcX: v.x,
          ndcY: v.y,
          ndcZ: v.z,
          screenX: ((v.x + 1) / 2) * window.innerWidth,
          screenY: ((-v.y + 1) / 2) * window.innerHeight,
          isInFrontOfCamera: v.z < 1 && v.z > -1
        };
      }

      // Check meshes
      const meshList = ctrl.interactiveObjects.map(m => ({
        name: m.name,
        visible: m.visible,
        frustumCulled: m.frustumCulled,
        matSide: m.material ? (Array.isArray(m.material) ? m.material[0].side : m.material.side) : null,
        matOpacity: m.material ? (Array.isArray(m.material) ? m.material[0].opacity : m.material.opacity) : null,
        matTransparent: m.material ? (Array.isArray(m.material) ? m.material[0].transparent : m.material.transparent) : null
      }));

      // Render one frame manually and check for errors
      let renderError = null;
      try {
        renderer.render(scene, camera);
      } catch (err) {
        renderError = err.message + ' ' + err.stack;
      }

      return {
        canvasStyle,
        camInfo,
        rootInfo,
        projectedScreen,
        meshCount: meshList.length,
        sampleMeshes: meshList.slice(0, 5),
        renderError
      };
    })()`,
    returnByValue: true
  });

  console.log('Diagnostic result:', JSON.stringify(diag, null, 2));

  proc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
}
main().catch(err => { console.error(err); proc.kill(); });

