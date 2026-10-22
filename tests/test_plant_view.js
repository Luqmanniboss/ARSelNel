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
    '--remote-debugging-port=9235',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9235/json');
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

    // Replace current 3D model with plantcellnew.glb in the scene
    await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();
        const gltf = await new Promise((res, rej) => loader.load('../models/plantcellnew.glb', res, undefined, rej));
        
        // Clear children of root in CellQuest3D
        // Let's find root from stage canvas
        // In cellquest3d.js: window.CellQuest3D.stage has canvas, and window.CellQuest3D has methods
        // Let's use cellquest's own root if we inspect it:
        const canvas = document.querySelector('#cell-stage canvas');
        // Let's find Three scene from renderer or create a quick test render
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const fit = 2.8 / maxDim;

        const holder = new THREE.Group();
        holder.scale.setScalar(fit);
        holder.position.copy(center).multiplyScalar(-fit);
        holder.add(gltf.scene);

        // Access scene
        // We can access scene through renderer or OrbitControls
        let scene = null;
        // In Three.js: scene is rendered in requestAnimationFrame
        // We can get scene from objects
        const testObj = document.getElementById('cell-stage');
      })()
    `);

  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

run();
