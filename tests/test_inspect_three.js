const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--window-size=1366,768',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9229/json');
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
    await sleep(3000);

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

    // Load and inspect both GLBs using GLTFLoader directly in the browser
    const inspection = await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();

        function loadModel(url) {
          return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
          });
        }

        const res = {};

        try {
          const animalGltf = await loadModel('../models/animal_cell_final.glb');
          const aBox = new THREE.Box3().setFromObject(animalGltf.scene);
          const aSize = aBox.getSize(new THREE.Vector3());
          const aCenter = aBox.getCenter(new THREE.Vector3());
          
          const aMeshes = [];
          animalGltf.scene.traverse(node => {
            if (node.isMesh) {
              const mBox = new THREE.Box3().setFromObject(node);
              aMeshes.push({
                name: node.name,
                parentName: node.parent ? node.parent.name : null,
                materialName: node.material ? node.material.name : null,
                color: node.material && node.material.color ? '#' + node.material.color.getHexString() : null,
                opacity: node.material ? node.material.opacity : null,
                transparent: node.material ? node.material.transparent : null,
                center: mBox.getCenter(new THREE.Vector3()),
                size: mBox.getSize(new THREE.Vector3())
              });
            }
          });

          res.animal = {
            box: { min: aBox.min, max: aBox.max, size: aSize, center: aCenter },
            meshes: aMeshes
          };
        } catch(e) {
          res.animalError = e.message || String(e);
        }

        try {
          const plantGltf = await loadModel('../models/plantcellnew.glb');
          const pBox = new THREE.Box3().setFromObject(plantGltf.scene);
          const pSize = pBox.getSize(new THREE.Vector3());
          const pCenter = pBox.getCenter(new THREE.Vector3());

          const pMeshes = [];
          plantGltf.scene.traverse(node => {
            if (node.isMesh) {
              const mBox = new THREE.Box3().setFromObject(node);
              pMeshes.push({
                name: node.name,
                parentName: node.parent ? node.parent.name : null,
                materialName: node.material ? node.material.name : null,
                hasMap: !!(node.material && node.material.map),
                color: node.material && node.material.color ? '#' + node.material.color.getHexString() : null,
                opacity: node.material ? node.material.opacity : null,
                transparent: node.material ? node.material.transparent : null,
                alphaMode: node.material ? node.material.alphaMode : null,
                center: mBox.getCenter(new THREE.Vector3()),
                size: mBox.getSize(new THREE.Vector3())
              });
            }
          });

          res.plant = {
            box: { min: pBox.min, max: pBox.max, size: pSize, center: pCenter },
            meshes: pMeshes
          };
        } catch(e) {
          res.plantError = e.message || String(e);
        }

        return res;
      })()
    `);

    console.log('--- ANIMAL GLB ---');
    console.log('Animal Box:', inspection.animal?.box);
    console.log('Animal Meshes count:', inspection.animal?.meshes?.length);
    console.log('Animal Meshes:', JSON.stringify(inspection.animal?.meshes, null, 2));

    console.log('\n--- PLANT GLB ---');
    console.log('Plant Box:', inspection.plant?.box);
    console.log('Plant Meshes count:', inspection.plant?.meshes?.length);
    console.log('Plant Meshes:', JSON.stringify(inspection.plant?.meshes, null, 2));
    if (inspection.plantError) console.error('Plant Error:', inspection.plantError);

  } catch(err) {
    console.error('Fatal error:', err);
  } finally {
    chrome.kill();
  }
}

run();
