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
    '--remote-debugging-port=9231',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9231/json');
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
    await sleep(4000);

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

    const stageInfo = await evalExpr(`
      (() => {
        const stage = document.getElementById('cell-stage');
        const canvas = stage ? stage.querySelector('canvas') : null;
        const rect = stage ? stage.getBoundingClientRect() : null;
        return {
          stageRect: rect,
          canvasWidth: canvas ? canvas.width : null,
          canvasHeight: canvas ? canvas.height : null,
          canvasStyleWidth: canvas ? canvas.style.width : null,
          canvasStyleHeight: canvas ? canvas.style.height : null,
          loadingHidden: document.getElementById('cq-loading')?.classList.contains('hidden'),
          loadingText: document.getElementById('cq-loading')?.textContent,
          caption: document.getElementById('stage-caption')?.textContent
        };
      })()
    `);
    console.log('Stage Info:', stageInfo);

    // Scroll stage into view
    await evalExpr(`document.getElementById('cell-stage').scrollIntoView({ behavior: 'instant', block: 'center' })`);
    await sleep(500);

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

    await takeScreenshot('cellquest_scrolled_stage.png');

  } catch(e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

run();
