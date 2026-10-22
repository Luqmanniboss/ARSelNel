const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testPage(width, height, isMobile = false) {
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

          const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\f90d237f-1cfd-44dd-8e91-b62fa945072a';

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

          const capture = (filename) => {
            return new Promise((res) => {
              const shotId = send('Page.captureScreenshot', { format: 'png' });
              const shotHandler = (shotEvent) => {
                const shotMsg = JSON.parse(shotEvent.data);
                if (shotMsg.id === shotId) {
                  ws.removeEventListener('message', shotHandler);
                  const fullPath = path.join(artifactDir, filename);
                  fs.writeFileSync(fullPath, Buffer.from(shotMsg.result.data, 'base64'));
                  console.log('Saved screenshot:', fullPath);
                  res();
                }
              };
              ws.addEventListener('message', shotHandler);
            });
          };

          ws.addEventListener('message', async (event) => {
            const msg = JSON.parse(event.data);
            if (msg.method === 'Page.loadEventFired') {
              setTimeout(async () => {
                const domChecks = await evalExpr(`({
                  currentUrl: window.location.href,
                  hasMissionCard: !!document.getElementById('mission-card'),
                  hasQuestSection: !!document.getElementById('quest-section'),
                  hasOldMissionsText: document.body.innerText.includes('Enam Misi Dunia Sel'),
                  hasXpText: document.body.innerText.includes('XP ANDA'),
                  hasEksperimenInSidebar: Array.from(document.querySelectorAll('.ars-nav a')).some(a => a.textContent.includes('Eksperimen Interaktif')),
                  sidebarItems: Array.from(document.querySelectorAll('.ars-nav a')).map(a => a.textContent.trim()),
                  arEntryBtnText: document.getElementById('ar-entry')?.textContent?.trim(),
                  hasAnimalTab: !!document.getElementById('animal-tab'),
                  hasPlantTab: !!document.getElementById('plant-tab'),
                  canvasPresent: !!document.querySelector('#cell-stage canvas'),
                  organellesCount: document.querySelectorAll('#core-list .cq-organelle-btn').length,
                  cellTitle: document.getElementById('cell-title')?.textContent?.trim()
                })`);

                console.log('DOM Checks (' + (isMobile ? 'Mobile' : 'Desktop') + '):', JSON.stringify(domChecks, null, 2));

                // 1. Capture Resting State (No dialog)
                const baseShotName = isMobile ? 'cellquest_ar_mobile.png' : 'cellquest_ar_desktop.png';
                await capture(baseShotName);

                // 2. On Desktop, trigger "Mulakan Pengembaraan AR" to capture permission dialog
                if (!isMobile) {
                  await evalExpr(`(() => {
                    const btn = document.getElementById('ar-entry');
                    if (btn) btn.click();
                  })()`);

                  await new Promise(r => setTimeout(r, 600));

                  const dialogInfo = await evalExpr(`({
                    title: document.getElementById('ar-dialog-title')?.textContent?.trim(),
                    msg: document.getElementById('ar-dialog-message')?.textContent?.trim()
                  })`);
                  console.log('Permission Dialog Triggered:', JSON.stringify(dialogInfo, null, 2));

                  await capture('cellquest_ar_permission_dialog.png');
                }

                ws.close();
                chrome.kill();
                resolve(domChecks);
              }, 1800);
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
  console.log('Testing Desktop view...');
  await testPage(1280, 800, false);
  console.log('Testing Mobile view...');
  await testPage(390, 844, true);
  console.log('All tests completed successfully!');
}

run().catch(console.error);
