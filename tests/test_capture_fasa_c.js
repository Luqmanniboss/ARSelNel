const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function run() {
  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-fasa-c-shot-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9286',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9286/json/list', res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    }).on('error', reject);
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let reqId = 1;
  const sendCmd = (method, params = {}) => new Promise((resolve, reject) => {
    const id = reqId++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await sendCmd('Page.enable');
  await sendCmd('Runtime.enable');

  // iPad Landscape (1024 x 768)
  await sendCmd('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: 'landscapePrimary' }
  });

  await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 2200));

  await sendCmd('Runtime.evaluate', {
    expression: `
      (async () => {
        window.KotakARSELNEL.startSimulationMode();
        await window.KotakARSELNEL.startPOVMode();
        window.KotakARSELNEL.anchorPOVAtCurrentHeading();
        // Slight tilt down and turn right to showcase 2-axis 3DoF tracking with video
        window.KotakARSELNEL.applySimAngles(15, -12);
      })()
    `,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 800));

  const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
  const outPath = 'C:\\\\Users\\\\Owner\\\\.gemini\\\\antigravity\\\\brain\\\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\\\kotak_arselnel_fasa_c_video_pov_ipad.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  chromeProc.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
