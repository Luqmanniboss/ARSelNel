const http = require('http');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), 'edge_cdp_auth_' + Date.now());

const edge = spawn(chromePath, [
  '--remote-debugging-port=9407',
  '--user-data-dir=' + userDataDir,
  '--headless=new',
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  'http://localhost:3000/auth/login.html'
]);

setTimeout(async () => {
  const targets = await new Promise(res => {
    http.get('http://127.0.0.1:9407/json/list', r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    });
  });
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  // Set user on login page
  await new Promise(res => {
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (() => {
            const user = { id: 'test_student', name: 'Pelajar Sains', role: 'student', isGuest: false };
            localStorage.setItem('arselnel_current_user', JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(user));
            return localStorage.getItem('arselnel_current_user');
          })()
        `,
        returnByValue: true
      }
    }));
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) res(msg.result.result.value);
    };
  });

  // Navigate to adventure.html with camera-ar mode
  ws.send(JSON.stringify({
    id: 2,
    method: 'Page.navigate',
    params: { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' }
  }));

  setTimeout(async () => {
    ws.send(JSON.stringify({
      id: 3,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (() => {
            return {
              url: window.location.href,
              hasCellQuestAR: typeof window.CellQuestAR !== 'undefined',
              hasThree: typeof window.THREE !== 'undefined',
              stns: window.CellQuestAR ? window.CellQuestAR.getStationsConfig().map(s => ({
                num: s.stationNumber,
                label: s.label,
                azimuth: s.azimuthDeg,
                elevation: s.elevationDeg,
                radius: s.radius,
                tier: s.distanceTier
              })) : null
            };
          })()
        `,
        returnByValue: true
      }
    }));
  }, 3000);

  const prevOnMessage = ws.onmessage;
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id === 3) {
      console.log('SUCCESS Result:', JSON.stringify(msg.result.result.value, null, 2));
      edge.kill();
      process.exit(0);
    }
  };
}, 2500);