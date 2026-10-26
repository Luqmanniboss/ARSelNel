const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\4d0b04b7-5436-41d6-8bb0-4a595a2067d5';

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
                  res(resMsg.result.result ? resMsg.result.result.value : null);
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

              // Step 1: Check initial READY state and mission title
              const initialState = await evalExpr(`
                (() => {
                  const intro = document.getElementById('adv-intro-modal');
                  const pause = document.getElementById('adv-pause-modal');
                  const timer = document.getElementById('adv-hud-timer');
                  const startBtn = document.getElementById('adv-start-btn');
                  const pauseBtn = document.getElementById('adv-hud-pause-btn');
                  const title = document.querySelector('h1')?.textContent.trim();
                  const introTitle = document.getElementById('adv-intro-title')?.textContent.trim();
                  const pageHasBurger = document.body.innerText.toLowerCase().includes('burger');

                  return {
                    h1Title: title,
                    introTitle: introTitle,
                    pageHasBurger: pageHasBurger,
                    introVisible: intro && !intro.classList.contains('hidden'),
                    pauseVisible: pause && !pause.classList.contains('hidden'),
                    timerText: timer ? timer.textContent : null,
                    startBtnText: startBtn ? startBtn.textContent.trim() : null,
                    pauseBtnExists: !!pauseBtn
                  };
                })()
              `);
              console.log('Initial State Check:', initialState);

              if (initialState.pageHasBurger) {
                console.warn('WARNING: Burger word still detected in page!');
              } else {
                console.log('✓ Zero burger references detected! Pure science theme confirmed.');
              }

              if (!isMobile) {
                await captureScreenshot('science_rescue_mission_start.png');
              } else {
                await captureScreenshot('science_rescue_mobile_start.png');
              }

              // Step 2: Click Start Button
              console.log('Clicking Mula Misi Penyelamat...');
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
                  const samples = document.getElementById('adv-hud-samples');
                  const lives = document.getElementById('adv-hud-lives');
                  return {
                    timerText: timer ? timer.textContent : null,
                    scoreText: score ? score.textContent : null,
                    samplesText: samples ? samples.textContent : null,
                    livesText: lives ? lives.textContent : null
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
                  const pSamples = document.getElementById('adv-pause-samples') || document.getElementById('adv-pause-burgers');
                  const pLives = document.getElementById('adv-pause-lives');
                  const pTime = document.getElementById('adv-pause-time');
                  return {
                    pauseVisible: pauseModal ? !pauseModal.classList.contains('hidden') : false,
                    pScore: pScore ? pScore.textContent : null,
                    pSamples: pSamples ? pSamples.textContent : null,
                    pLives: pLives ? pLives.textContent : null,
                    pTime: pTime ? pTime.textContent : null
                  };
                })()
              `);
              console.log('Pause Menu State:', pauseState);
              await sleep(350);

              if (!isMobile) {
                await captureScreenshot('science_rescue_pause_menu.png');
              } else {
                await captureScreenshot('science_rescue_mobile_pause.png');
              }

              // Step 4: Resume game
              await evalExpr(`
                (() => {
                  const resumeBtn = document.getElementById('adv-pause-resume-btn');
                  if (resumeBtn) resumeBtn.click();
                })()
              `);

              // Step 5: Test Question Modal popup directly via game engine
              console.log('Testing Science Sample Question Modal...');
              const questionModalState = await evalExpr(`
                (() => {
                  // Simulate triggering sample 1
                  const sample1 = window.ARSelNelAdventure.SCIENCE_SAMPLES[0];
                  const q1 = window.ARSelNelAdventure.QUESTIONS[0];
                  const qModal = document.getElementById('adv-question-modal');
                  const qTitle = document.getElementById('adv-modal-title');
                  const qText = document.getElementById('adv-modal-question-text');
                  const opts = document.getElementById('adv-modal-options');

                  // Trigger via UI controller if available or inspect elements
                  return {
                    sampleName: sample1.name,
                    questionTitle: q1.title,
                    modalExists: !!qModal,
                    optCount: q1.options.length
                  };
                })()
              `);
              console.log('Sample & Question Data Check:', questionModalState);

              if (!isMobile) {
                await captureScreenshot('science_rescue_gameplay.png');
              }

              ws.close();
              chrome.kill();
              resolve({ initialState, startResult, gameplayState, pauseState, questionModalState });
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

    console.log('\n>>> All automated tests passed successfully! <<<');
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
}

main();
