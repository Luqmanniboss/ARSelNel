const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');

const CDP_PORT = 9416;
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) { this.wsUrl = wsUrl; this.id = 1; this.callbacks = new Map(); }
  async connect() {
    const WS = global.WebSocket || require('ws');
    this.ws = new WS(this.wsUrl);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error); else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expr) {
    const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
    return res.result ? res.result.value : undefined;
  }
  close() { if (this.ws) this.ws.close(); }
}

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_inspect_preview_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/auth/login.html'
  ], { detached: false });

  try {
    await delay(3000);
    const targets = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, r => {
        let raw = ''; r.on('data', c => raw += c); r.on('end', () => res(JSON.parse(raw)));
      }).on('error', rej);
    });
    const cdp = new CDPClient(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');

    await cdp.eval(`
      (() => {
        const u = { id: 'test_student', name: 'Pelajar', role: 'student' };
        localStorage.setItem('arselnel_current_user', JSON.stringify(u));
        localStorage.setItem('currentUser', JSON.stringify(u));
      })()
    `);

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' });
    await delay(5000);

    const detailedInspect = await cdp.eval(`
      (async () => {
        window.CellQuestAR.openQuiz(0);
        await new Promise(r => setTimeout(r, 2000));

        // Let's traverse the preview scene!
        const scene = window.CellQuestAR.getPreviewScene ? window.CellQuestAR.getPreviewScene() : null;
        // In adventure.js, let's find the preview model via window / DOM
        // Or inspect the global glbScene
        const canvas = document.getElementById('stn-preview-canvas');
        
        // Let's inspect all 8 stations in AR world as well
        const stationsReport = [];
        const groups = window.CellQuestAR.getARStationGroups ? window.CellQuestAR.getARStationGroups() : [];
        
        return {
          hasPreviewScene: !!scene,
          groupsCount: groups.length
        };
      })()
    `);
    console.log('Inspect Result:', detailedInspect);

    cdp.close();
  } finally {
    try { edgeProcess.kill('SIGKILL'); } catch (e) {}
  }
}

run().catch(console.error);

