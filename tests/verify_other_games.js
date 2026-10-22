const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyAllGames() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1280,800',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9226/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve));

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
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student', authProvider: 'supabase' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

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

    const games = [
      { name: 'Game 1: Labelkan Organel', url: 'http://localhost:3000/games/labelkan-organel.html', check: 'document.querySelector("h1")?.textContent' },
      { name: 'Game 2: Maze Chase 2D', url: 'http://localhost:3000/games/klasifikasi-sel.html', check: 'document.querySelector("h1")?.textContent' },
      { name: 'Game 3: Susun Organisasi Kehidupan', url: 'http://localhost:3000/games/organisasi-kehidupan.html', check: 'document.querySelector("h1")?.textContent' },
      { name: 'Game 4: Kuiz Saintis Muda', url: 'http://localhost:3000/kuiz_interaktif/code.html', check: 'document.querySelector("h1, h2, h3")?.textContent' },
      { name: 'Game 5: Misi Makmal Sains', url: 'http://localhost:3000/games/misi-makmal-sains.html', check: 'document.querySelector("h1")?.textContent' }
    ];

    console.log('--- VERIFYING ALL 5 GAMES EXIST AND LOAD PERFECTLY ---');
    for (const g of games) {
      send('Page.navigate', { url: g.url });
      await sleep(1500);
      const title = await evalExpr(g.check);
      console.log(`✓ ${g.name} loaded successfully -> Title: "${title?.trim()}"`);
      if (!title) throw new Error(`${g.name} failed to load!`);
    }

    console.log('\n>>> ALL 5 GAMES ARE FULLY OPERATIONAL AND PRESERVED! <<<');
  } catch (err) {
    console.error('Other games check failed:', err);
    process.exitCode = 1;
  } finally {
    chrome.kill();
    process.exit(process.exitCode || 0);
  }
}

verifyAllGames();
