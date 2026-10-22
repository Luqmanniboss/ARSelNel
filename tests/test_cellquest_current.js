const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--window-size=1366,768',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9228/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

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

    const consoleLogs = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(`[Console ${msg.params.type}]: ` + msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleLogs.push(`[Exception]: ` + msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
    });

    send('Page.navigate', { url: 'http://localhost:3000/cellquest/code.html' });
    await sleep(4000);

    const evalExpr = (expression) => {
      return new Promise((res) => {
        const evalId = send('Runtime.evaluate', { expression, returnByValue: true });
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

    const status = await evalExpr(`
      (() => {
        return {
          url: window.location.href,
          caption: document.getElementById('stage-caption')?.textContent,
          loadingHidden: document.getElementById('cq-loading')?.classList.contains('hidden'),
          loadingText: document.getElementById('cq-loading')?.textContent,
          currentCell: window.CellQuest3D?.getCell(),
          threeLoaded: !!window.THREE,
          gltfLoaderLoaded: !!(window.THREE && window.THREE.GLTFLoader),
          objectsCount: (window.CellQuest3D ? true : false)
        };
      })()
    `);

    console.log('Page status:', status);
    console.log('Console logs count:', consoleLogs.length);
    consoleLogs.forEach(l => console.log(l));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

run();
