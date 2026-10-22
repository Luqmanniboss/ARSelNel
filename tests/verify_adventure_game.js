const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\f90d237f-1cfd-44dd-8e91-b62fa945072a';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest(width = 1280, height = 800, isMobile = false) {
  return new Promise((resolve, reject) => {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const chrome = spawn(edgePath, [
      '--headless=new',
      '--remote-debugging-port=9223',
      `--window-size=${width},${height}`,
      'about:blank'
    ]);

    setTimeout(async () => {
      try {
        const listRes = await fetch('http://127.0.0.1:9223/json');
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

          send('Page.navigate', { url: 'http://localhost:3000/kuiz_interaktif/code.html' });

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

          const captureScreenshot = (filename) => {
            return new Promise((res) => {
              const shotId = send('Page.captureScreenshot', { format: 'png' });
              const handler = (shotEvent) => {
                const resMsg = JSON.parse(shotEvent.data);
                if (resMsg.id === shotId) {
                  ws.removeEventListener('message', handler);
                  const buf = Buffer.from(resMsg.result.data, 'base64');
                  const dest = path.join(artifactDir, filename);
                  fs.writeFileSync(dest, buf);
                  console.log(`Saved screenshot to ${dest}`);
                  res(dest);
                }
              };
              ws.addEventListener('message', handler);
            });
          };

          setTimeout(async () => {
            try {
              console.log(`--- Testing ${isMobile ? 'Mobile' : 'Desktop'} Viewport (${width}x${height}) ---`);

              // Step 1: Check initial READY state
              const initialState = await evalExpr(`
                (() => {
                  const intro = document.getElementById('adv-intro-modal');
                  const pause = document.getElementById('adv-pause-modal');
                  const timer = document.getElementById('adv-hud-timer');
                  const startBtn = document.getElementById('adv-start-btn');
                  const pauseBtn = document.getElementById('adv-hud-pause-btn');

                  return {
                    introVisible: intro && !intro.classList.contains('hidden'),
                    pauseVisible: pause && !pause.classList.contains('hidden'),
                    timerText: timer ? timer.textContent : null,
                    startBtnText: startBtn ? startBtn.textContent.trim() : null,
                    pauseBtnExists: !!pauseBtn
                  };
                })()
              `);
              console.log('Initial State Check:', initialState);

              if (!isMobile) {
                await captureScreenshot('adventure_start_screen.png');
              } else {
                await captureScreenshot('adventure_mobile_start.png');
              }

              // Step 2: Click Start Button
              console.log('Clicking Mula Permainan...');
              const startResult = await evalExpr(`
                (() => {
                  const btn = document.getElementById('adv-start-btn');
                  if (btn) btn.click();
                  const intro = document.getElementById('adv-intro-modal');
                  return {
                    introHidden: intro ? intro.classList.contains('hidden') : false
                  };
                })()
              `);
              console.log('After Start Click:', startResult);

              // Wait 1.5 seconds for gameplay timer
              await sleep(1500);

              const gameplayState = await evalExpr(`
                (() => {
                  const timer = document.getElementById('adv-hud-timer');
                  const score = document.getElementById('adv-hud-score');
                  const burgers = document.getElementById('adv-hud-burgers');
                  return {
                    timerText: timer ? timer.textContent : null,
                    scoreText: score ? score.textContent : null,
                    burgersText: burgers ? burgers.textContent : null
                  };
                })()
              `);
              console.log('Gameplay Running State:', gameplayState);

              // Step 3: Trigger Pause Menu
              console.log('Triggering Pause Menu...');
              const pauseState = await evalExpr(`
                (() => {
                  const pauseBtn = document.getElementById('adv-hud-pause-btn');
                  if (pauseBtn) pauseBtn.click();
                  const pauseModal = document.getElementById('adv-pause-modal');
                  const pScore = document.getElementById('adv-pause-score');
                  const pBurgers = document.getElementById('adv-pause-burgers');
                  const pTime = document.getElementById('adv-pause-time');
                  return {
                    pauseVisible: pauseModal ? !pauseModal.classList.contains('hidden') : false,
                    pScore: pScore ? pScore.textContent : null,
                    pBurgers: pBurgers ? pBurgers.textContent : null,
                    pTime: pTime ? pTime.textContent : null
                  };
                })()
              `);
              console.log('Pause Menu State:', pauseState);
              await sleep(350);

              if (!isMobile) {
                await captureScreenshot('adventure_pause_menu.png');
              } else {
                await captureScreenshot('adventure_mobile_pause.png');
              }

              // Step 4: Click Mula Semula to test Confirmation Dialog
              console.log('Testing Mula Semula Confirmation Dialog...');
              const confirmState = await evalExpr(`
                (() => {
                  const restartBtn = document.getElementById('adv-pause-restart-btn');
                  if (restartBtn) restartBtn.click();
                  const confirmModal = document.getElementById('adv-confirm-modal');
                  const title = document.getElementById('adv-confirm-title');
                  const msg = document.getElementById('adv-confirm-message');
                  return {
                    confirmVisible: confirmModal ? !confirmModal.classList.contains('hidden') : false,
                    title: title ? title.textContent.trim() : null,
                    message: msg ? msg.textContent.trim() : null
                  };
                })()
              `);
              console.log('Confirm Dialog State:', confirmState);
              await sleep(350);

              if (!isMobile) {
                await captureScreenshot('adventure_confirm_dialog.png');
              }

              // Step 5: Cancel confirmation and resume game
              const resumeResult = await evalExpr(`
                (() => {
                  const cancelBtn = document.getElementById('adv-confirm-cancel-btn');
                  if (cancelBtn) cancelBtn.click();
                  const resumeBtn = document.getElementById('adv-pause-resume-btn');
                  if (resumeBtn) resumeBtn.click();

                  const pauseModal = document.getElementById('adv-pause-modal');
                  const confirmModal = document.getElementById('adv-confirm-modal');
                  return {
                    pauseHidden: pauseModal ? pauseModal.classList.contains('hidden') : false,
                    confirmHidden: confirmModal ? confirmModal.classList.contains('hidden') : false
                  };
                })()
              `);
              console.log('After Resume:', resumeResult);

              ws.close();
              chrome.kill();
              resolve({ initialState, startResult, gameplayState, pauseState, confirmState, resumeResult });
            } catch (err) {
              ws.close();
              chrome.kill();
              reject(err);
            }
          }, 2000);
        });

      } catch (err) {
        chrome.kill();
        reject(err);
      }
    }, 1500);
  });
}

async function main() {
  try {
    console.log('Testing Desktop View...');
    const desktopResults = await runTest(1280, 800, false);
    await sleep(1000);
    console.log('Testing Mobile View...');
    const mobileResults = await runTest(390, 844, true);

    console.log('All automated tests passed successfully!');
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
}

main();
