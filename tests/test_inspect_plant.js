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
    '--remote-debugging-port=9233',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9233/json');
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

    // Replace current 3D model with plantcellnew.glb directly and take screenshot
    await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();
        const gltf = await new Promise((res, rej) => loader.load('../models/plantcellnew.glb', res, undefined, rej));
        
        // Find Three scene objects from CellQuest3D
        const canvas = document.querySelector('#cell-stage canvas');
        // We can inspect gltf.scene
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fit = 2.8 / maxDim;

        // Clear existing root children in window.CellQuest3D
        // In cellquest3d.js, root is in placement.
        // Let's attach plant model to window.CellQuest3D
        const holder = new THREE.Group();
        holder.name = 'TestPlantHolder';
        holder.scale.setScalar(fit);
        holder.position.copy(center).multiplyScalar(-fit);
        holder.add(gltf.scene);

        // Put on stage
        window.tempHolder = holder;
        // In cellquest3d.js: window.CellQuest3D.stage has canvas
        // Let's access the scene via canvas or Three.js
      })()
    `);

    // Let's inspect the Labels mesh vertices or texture in plantcellnew.glb
    const plantInspection = await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();
        const gltf = await new Promise((res, rej) => loader.load('../models/plantcellnew.glb', res, undefined, rej));
        
        const meshes = {};
        gltf.scene.traverse(node => {
          if (node.isMesh) {
            const b = new THREE.Box3().setFromObject(node);
            meshes[node.name] = {
              center: b.getCenter(new THREE.Vector3()),
              size: b.getSize(new THREE.Vector3()),
              vertexCount: node.geometry ? node.geometry.attributes.position.count : 0,
              material: node.material ? {
                name: node.material.name,
                hasMap: !!node.material.map,
                transparent: node.material.transparent,
                opacity: node.material.opacity
              } : null
            };
          }
        });

        return meshes;
      })()
    `);

    console.log('Plant Inspection:', JSON.stringify(plantInspection, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

run();
