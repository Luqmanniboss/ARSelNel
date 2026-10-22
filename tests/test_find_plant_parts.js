const { spawn } = require('child_process');
const fs = require('fs');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9236',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch('http://127.0.0.1:9236/json');
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
    await new Promise(r => setTimeout(r, 3500));

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

    const details = await evalExpr(`
      (async () => {
        const loader = new THREE.GLTFLoader();
        const gltf = await new Promise((res, rej) => loader.load('../models/plantcellnew.glb', res, undefined, rej));
        
        const labelsMesh = gltf.scene.getObjectByName('Labels');
        const posAttr = labelsMesh.geometry.attributes.position;
        const uvAttr = labelsMesh.geometry.attributes.uv;
        const index = labelsMesh.geometry.index;

        // Group triangles by UV regions on plant_tex_0
        // We know from plant_tex_0.jpg:
        // Golgi Apparatus: top-left (u: 0..0.5, v: 0.8..1.0)
        // Ribosomes: top-right (u: 0.5..1.0, v: 0.8..1.0)
        // Mitochondria: mid-upper-left (u: 0..0.5, v: 0.65..0.85)
        // Plasma Membrane: mid-upper-right (u: 0.5..1.0, v: 0.65..0.85)
        // Nucleus: center (u: 0.3..0.7, v: 0.5..0.7)
        // Chloroplast: mid-left (u: 0..0.5, v: 0.38..0.58)
        // Central Vacuole: mid-right (u: 0.5..1.0, v: 0.38..0.58)
        // Cell Wall: lower-left (u: 0..0.5, v: 0.22..0.42)
        // Vesicles: lower-right (u: 0.5..1.0, v: 0.22..0.42)
        // Plasmodesma: bottom-left (u: 0..0.5, v: 0.08..0.28)
        // Endoplasmic Reticulum: bottom-right (u: 0.5..1.0, v: 0..0.2)
        // Granum: bottom-left-most (u: 0..0.5, v: 0..0.15)

        // Find connected components in labelsMesh
        const count = posAttr.count;
        const adj = Array.from({ length: count }, () => []);
        for (let i = 0; i < index.count; i += 3) {
          const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
          adj[a].push(b, c);
          adj[b].push(a, c);
          adj[c].push(a, b);
        }

        const visited = new Uint8Array(count);
        const parts = [];

        for (let i = 0; i < count; i++) {
          if (visited[i]) continue;
          const component = [];
          const q = [i];
          visited[i] = 1;
          while (q.length > 0) {
            const u = q.pop();
            component.push(u);
            for (const v of adj[u]) {
              if (!visited[v]) {
                visited[v] = 1;
                q.push(v);
              }
            }
          }

          if (component.length > 10) {
            const box = new THREE.Box3();
            let avgU = 0, avgV = 0;
            component.forEach(idx => {
              box.expandByPoint(new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)));
              avgU += uvAttr.getX(idx);
              avgV += uvAttr.getY(idx);
            });
            avgU /= component.length;
            avgV /= component.length;

            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            parts.push({
              verts: component.length,
              center: { x: +center.x.toFixed(2), y: +center.y.toFixed(2), z: +center.z.toFixed(2) },
              size: { x: +size.x.toFixed(2), y: +size.y.toFixed(2), z: +size.z.toFixed(2) },
              uv: { u: +avgU.toFixed(2), v: +avgV.toFixed(2) }
            });
          }
        }

        return parts;
      })()
    `);

    console.log('Detected Label Parts in plantcellnew.glb:');
    console.log(JSON.stringify(details, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

run();
