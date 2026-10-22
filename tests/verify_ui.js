const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testPage(width, height, screenshotName) {
  return new Promise((resolve, reject) => {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const chrome = spawn(edgePath, [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--window-size=${width},${height}`,
      'about:blank'
    ]);

    setTimeout(async () => {
      try {
        const listRes = await fetch('http://127.0.0.1:9222/json');
        const pages = await listRes.json();
        const page = pages.find(p => p.type === 'page');
        
        if (!page || !page.webSocketDebuggerUrl) {
          throw new Error('Could not find debugger target');
        }

        const ws = new WebSocket(page.webSocketDebuggerUrl);

        ws.addEventListener('open', () => {
          let id = 1;
          const send = (method, params = {}) => {
            const currentId = id++;
            ws.send(JSON.stringify({ id: currentId, method, params }));
            return currentId;
          };

          send('Runtime.enable');
          send('Page.enable');

          // Inject user session so AuthGuard lets us access the page
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

          // Navigate to hab_permainan/code.html
          send('Page.navigate', { url: 'http://localhost:3000/hab_permainan/code.html' });

          let consoleMessages = [];
          ws.addEventListener('message', async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.method === 'Runtime.consoleAPICalled') {
              consoleMessages.push(msg.params);
            }
            if (msg.method === 'Page.loadEventFired') {
              setTimeout(async () => {
                const evalExpr = (expression) => {
                  return new Promise((res) => {
                    const evalId = send('Runtime.evaluate', { expression, returnByValue: true });
                    const handler = (evalEvent) => {
                      const resMsg = JSON.parse(evalEvent.data);
                      if (resMsg.id === evalId) {
                        ws.removeEventListener('message', handler);
                        res(resMsg.result.result.value);
                      }
                    };
                    ws.addEventListener('message', handler);
                  });
                };

                const domChecks = await evalExpr(`({
                  currentUrl: window.location.href,
                  hasOldHeaderH2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()),
                  hasStatsCards: !!document.getElementById('game-stat-quizzes'),
                  hasScoreRecord: !!document.getElementById('game-record-name'),
                  hasRewardsSection: !!document.querySelector('.grid.grid-cols-2.sm\\\\:grid-cols-5'),
                  hasDataStatusInDom: !!document.querySelector('.ars-data-status'),
                  bannerTitle: document.querySelector('.module-hero h3')?.textContent?.trim(),
                  quizCardsCount: document.querySelectorAll('.grid.grid-cols-1.lg\\\\:grid-cols-2 > div').length,
                  pilihHeading: Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Pilih Permainan Kuiz'))?.textContent?.trim(),
                  sidebarLogout: !!document.querySelector('[data-ars-logout]')
                })`);

                console.log('DOM Checks for ' + path.basename(screenshotName) + ':', JSON.stringify(domChecks, null, 2));

                const shotId = send('Page.captureScreenshot', { format: 'png' });
                const shotHandler = (shotEvent) => {
                  const shotMsg = JSON.parse(shotEvent.data);
                  if (shotMsg.id === shotId) {
                    ws.removeEventListener('message', shotHandler);
                    fs.writeFileSync(screenshotName, Buffer.from(shotMsg.result.data, 'base64'));
                    console.log('Saved screenshot:', screenshotName);
                    ws.close();
                    chrome.kill();
                    resolve({ domChecks, consoleMessages });
                  }
                };
                ws.addEventListener('message', shotHandler);
              }, 1200);
            }
          });
        });

        ws.addEventListener('error', (err) => {
          chrome.kill();
          reject(err);
        });

      } catch (err) {
        chrome.kill();
        reject(err);
      }
    }, 1500);
  });
}

async function run() {
  const outDir = path.join(__dirname, '..', 'artifacts_temp');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('Testing Desktop view...');
  await testPage(1280, 800, path.join(outDir, 'hab_permainan_desktop.png'));
  console.log('Testing Mobile view...');
  await testPage(390, 844, path.join(outDir, 'hab_permainan_mobile.png'));
  console.log('All tests completed successfully!');
}

run().catch(console.error);
