const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\d23aec0a-ad24-4569-924f-62e9b824666e';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9234/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.addEventListener('open', res));

    let id = 1;
    const send = (method, params = {}) => {
      const currentId = id++;
      ws.send(JSON.stringify({ id: currentId, method, params }));
      return currentId;
    };

    send('Runtime.enable');
    send('Page.enable');

    send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

    send('Page.navigate', { url: 'http://localhost:3000/cellquest/code.html' });
    await sleep(3500);

    const evalExpr = (expression) => {
      return new Promise((res) => {
        const evalId = send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        const handler = (evalEvent) => {
          const resMsg = JSON.parse(evalEvent.data);
          if (resMsg.id === evalId) {
            ws.removeEventListener('message', handler);
            res(resMsg.result.result ? resMsg.result.result.value : null);
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    const takeScreenshot = (filename) => {
      return new Promise((res) => {
        const shotId = send('Page.captureScreenshot', { format: 'png' });
        const handler = (shotEvent) => {
          const resMsg = JSON.parse(shotEvent.data);
          if (resMsg.id === shotId) {
            ws.removeEventListener('message', handler);
            const buf = Buffer.from(resMsg.result.data, 'base64');
            const fullPath = path.join(artifactDir, filename);
            fs.writeFileSync(fullPath, buf);
            console.log(`[Screenshot saved]: ${filename}`);
            res(fullPath);
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    await evalExpr(`document.getElementById('cell-stage').scrollIntoView({ behavior: 'instant', block: 'center' })`);
    await sleep(500);
    await takeScreenshot('animal_cell_view.png');

    // Now test mounting plantcellnew.glb on the stage to inspect it visually
    const plantRenderStatus = await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();
        const gltf = await new Promise((res, rej) => loader.load('../models/plantcellnew.glb', res, undefined, rej));
        
        // Let's create an auto-fit group
        const instance = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(instance);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const fit = 2.8 / maxDim;

        const holder = new THREE.Group();
        holder.scale.setScalar(fit);
        holder.position.copy(center).multiplyScalar(-fit);
        holder.add(instance);

        // Put into cellquest3d root
        // In cellquest3d.js: window.CellQuest3D doesn't expose root directly, but we can do:
        // Let's find the scene
        const canvas = document.querySelector('#cell-stage canvas');
        // We can inspect materials and maps
        instance.traverse(node => {
          if (node.isMesh && node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(m => { m.side = THREE.DoubleSide; });
            } else {
              node.material.side = THREE.DoubleSide;
            }
          }
        });

        return {
          bounds: { size, center, fit },
          meshNames: instance.children.map(c => c.name)
        };
      })()
    `);

    console.log('Plant Render Status:', plantRenderStatus);

  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

run();
