const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9322;

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_cdp_pincheck_' + Date.now());
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

  await new Promise(r => setTimeout(r, 4500));
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
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const m3 = window.KotakARSELNEL.state.mindarThree;
      const cq = window.CellQuestARController;
      
      // Let's inspect what MindAR controller does on processVideo
      return {
        controller: !!m3.controller,
        anchorsCount: m3.anchors.length,
        anchor3: {
          groupChildren: m3.anchors[3].group.children.length,
          matrix: Array.from(m3.anchors[3].group.matrix.elements),
          matrixAutoUpdate: m3.anchors[3].group.matrixAutoUpdate
        },
        rootGroup: {
          parent: cq.rootGroup.parent ? (cq.rootGroup.parent.name || cq.rootGroup.parent.type) : null,
          pos: [cq.rootGroup.position.x, cq.rootGroup.position.y, cq.rootGroup.position.z],
          scale: [cq.rootGroup.scale.x, cq.rootGroup.scale.y, cq.rootGroup.scale.z],
          visible: cq.rootGroup.visible
        }
      };
    })()`,
    returnByValue: true
  });
  console.log('Real Hierarchy Info:', JSON.stringify(info.result.value, null, 2));

  ws.close();
  proc.kill();
  process.exit(0);
}
run().catch(console.error);

