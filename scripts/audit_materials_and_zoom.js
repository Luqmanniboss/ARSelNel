const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const CDP_PORT = 9412;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WS = global.WebSocket || require('ws');
    this.ws = new WS(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
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
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_audit_${Date.now()}`);

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

    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page');
    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');

    await cdp.eval(`
      (() => {
        const user = { id: 'test_student', name: 'Pelajar', role: 'student', isGuest: false };
        localStorage.setItem('arselnel_current_user', JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
      })()
    `);

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' });
    await delay(5000);

    const report = await cdp.eval(`
      (async () => {
        const diag = window.CellQuestAR.getGLBDiagnostics();
        
        // Also check what is inside station 1 in AR world
        const cfg = window.CellQuestAR.getStationsConfig();
        
        // Open modal for station 1
        window.CellQuestAR.openQuiz(0);
        await new Promise(r => setTimeout(r, 1500));
        
        // Inspect preview scene
        const canvas = document.getElementById('cq-stn-preview-canvas');
        const modal = document.getElementById('cq-station-modal');
        
        return {
          diagnostics: diag,
          modalDisplay: modal ? modal.style.display : null,
          hasCanvas: !!canvas
        };
      })()
    `);

    console.log('AUDIT REPORT:\n', JSON.stringify(report, null, 2));

    cdp.close();
  } finally {
    try { edgeProcess.kill('SIGKILL'); } catch (e) {}
  }
}

run().catch(console.error);

