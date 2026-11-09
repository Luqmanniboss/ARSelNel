const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9330;

async function auditClipping() {
  console.log('=== TASK 2: AUDIT KESELAMATAN NEAR/FAR CLIPPING & DEPTH BUFFER ===');
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_audit_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 4000));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
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

  await send('Page.enable');
  await send('Runtime.enable');

  const auditResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const m3 = window.KotakARSELNEL.state.mindarThree;
      const cam = window.KotakARSELNEL.state.camera;
      const renderer = window.KotakARSELNEL.state.renderer;
      const gl = renderer.getContext();

      // 1. Matrix Elements
      const p = cam.projectionMatrix.elements;
      // p[10] = -(far + near) / (far - near)
      // p[14] = -2 * far * near / (far - near)
      const p10 = p[10];
      const p14 = p[14];
      const computedNear = p14 / (p10 - 1);
      const computedFar = p14 / (p10 + 1);

      // 2. Depth buffer bit depth
      const depthBits = gl.getParameter(gl.DEPTH_BITS);

      // 3. WebGL capabilities
      const hasDepthTexture = !!gl.getExtension('WEBGL_depth_texture');
      const maxAnisotropy = gl.getParameter(gl.MAX_TEXTURE_MAX_ANISOTROPY_EXT || 0);

      // 4. Test depth precision at D = 2.8 and D = 1200
      function calcNdcZ(z, near, far) {
        // In Three.js: gl_Position.z = -(far+near)/(far-near)*z - 2*far*near/(far-near) * w
        // with view-space position (0, 0, -dist):
        const dist = Math.abs(z);
        const zClip = dist * ((far + near) / (far - near)) - (2 * far * near / (far - near));
        return zClip / dist;
      }

      function calcDepthDelta(dist, deltaDist, near, far) {
        const ndc1 = calcNdcZ(dist, near, far);
        const ndc2 = calcNdcZ(dist + deltaDist, near, far);
        const buf1 = (ndc1 * 0.5 + 0.5) * Math.pow(2, depthBits);
        const buf2 = (ndc2 * 0.5 + 0.5) * Math.pow(2, depthBits);
        return Math.abs(buf2 - buf1);
      }

      // Delta for 1mm (0.001 unit at D=2.8) and 1mm (1 unit at D=1200)
      const depthDeltaAt2_8 = calcDepthDelta(2.8, 0.001, computedNear, computedFar);
      const depthDeltaAt1200 = calcDepthDelta(1200, 1.0, computedNear, computedFar);

      return {
        propertyNear: cam.near,
        propertyFar: cam.far,
        computedNear,
        computedFar,
        matrixP10: p10,
        matrixP14: p14,
        depthBits,
        hasDepthTexture,
        depthDeltaAt2_8, // Distinct values in 24-bit depth buffer for 1mm separation
        depthDeltaAt1200
      };
    })()`,
    returnByValue: true
  });

  console.log('Clipping & Depth Buffer Audit Data:');
  console.log(JSON.stringify(auditResult.result.value, null, 2));

  ws.close();
  cleanup();
  process.exit(0);
}

auditClipping().catch(console.error);

