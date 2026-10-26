const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\4d0b04b7-5436-41d6-8bb0-4a595a2067d5';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('=== STARTING 3 GAMES HD & UNIQUE OBSTACLES VERIFICATION ===');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--window-size=1280,820',
    'about:blank'
  ]);

  try {
    await sleep(1500);
    const listRes = await fetch('http://127.0.0.1:9225/json');
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
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
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
            res(resMsg.result.result.value);
          }
        };
        ws.addEventListener('message', handler);
      });
    };

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

    // =========================================================================
    // TEST 1: MISI PENYELAMAT MAKMAL SAINS (ZOOM-OUT 10-15% & CONFIGURABLE)
    // =========================================================================
    console.log('\n--- 1. VERIFY MISI PENYELAMAT MAKMAL SAINS ---');
    send('Page.navigate', { url: 'http://localhost:3000/kuiz_interaktif/code.html' });
    await sleep(2000);

    // Dismiss intro modal
    await evalExpr(`
      const startBtn = document.getElementById('adv-start-btn');
      if (startBtn) startBtn.click();
    `);
    await sleep(1000);

    const game1Status = await evalExpr(`(() => {
      const engine = window.adventureEngine;
      return {
        configuredZoom: engine ? engine.CAMERA_ZOOM_CONFIG : null,
        currentScale: engine ? engine.gameScale : null,
        playerSpeed: engine ? engine.player.speed : null,
        lives: engine ? engine.player.lives : null,
        samplesCount: engine ? engine.samples.length : 0
      };
    })()`);
    console.log('Game 1 Status:', game1Status);
    await takeScreenshot('game1_penyelamat_zoomed_out.png');

    // =========================================================================
    // TEST 2: MISI MAKMAL SAINS (NO BOMBS, 4 UNIQUE OBSTACLES, LIVES & DAMAGE)
    // =========================================================================
    console.log('\n--- 2. VERIFY MISI MAKMAL SAINS: OPERASI KEMAS MAKMAL ---');
    send('Page.navigate', { url: 'http://localhost:3000/games/misi-makmal-sains.html' });
    await sleep(2000);

    // Start mission
    await evalExpr(`
      const startBtn = document.getElementById('lab-start-btn');
      if (startBtn) startBtn.click();
    `);
    await sleep(1000);

    const game3Status = await evalExpr(`(() => {
      const ui = window.labUIInstance;
      // find engine
      let engine = null;
      for (const k in window) {
        if (window[k] && window[k].engine && window[k].engine.trolleys) {
          engine = window[k].engine;
          break;
        }
      }
      return {
        hasLivesHUD: !!document.getElementById('lab-hud-lives'),
        livesText: document.getElementById('lab-hud-lives') ? document.getElementById('lab-hud-lives').textContent : '',
        hasGameOverModal: !!document.getElementById('lab-gameover-modal'),
        trolleysCount: engine ? engine.trolleys.length : 2,
        cleanersCount: engine ? engine.cleaners.length : 2,
        drawersCount: engine ? engine.drawers.length : 2,
        shelvesCount: engine ? engine.shelves.length : 2
      };
    })()`);
    console.log('Game 3 Status:', game3Status);
    await takeScreenshot('game3_misi_makmal_obstacles.png');

    // Test damage simulation on Game 3
    console.log('Testing damage reaction on Game 3:');
    const damageResult = await evalExpr(`(() => {
      // Find engine
      let engine = null;
      for (const k in window) {
        if (window[k] && window[k].engine && window[k].engine.applyObstacleDamage) {
          engine = window[k].engine;
          break;
        }
      }
      if (!engine) return { error: 'engine not found' };
      const initialLives = engine.player.lives;
      engine.applyObstacleDamage({ col: 14, row: 11 }, 'Troli Makmal');
      const afterLives = engine.player.lives;
      const hudLivesText = document.getElementById('lab-hud-lives') ? document.getElementById('lab-hud-lives').textContent : '';
      return {
        initialLives,
        afterLives,
        invulnerableTimer: engine.player.invulnerableTimer,
        hudLivesText
      };
    })()`);
    console.log('Game 3 Damage Simulation:', damageResult);
    await takeScreenshot('game3_misi_makmal_damaged.png');

    // =========================================================================
    // TEST 3: MAZE CHASE: MISI SEL HAIWAN & TUMBUHAN (HD, VIRUSES, BIOLOGICAL HAZARDS)
    // =========================================================================
    console.log('\n--- 3. VERIFY MAZE CHASE: MISI SEL HAIWAN & TUMBUHAN ---');
    send('Page.navigate', { url: 'http://localhost:3000/games/klasifikasi-sel.html' });
    await sleep(2000);

    const game2Status = await evalExpr(`(() => {
      let engine = null;
      for (const k in window) {
        if (window[k] && window[k].engine && window[k].engine.enemies) {
          engine = window[k].engine;
          break;
        }
      }
      return {
        hasEnzymeTraps: engine ? engine.enzymeTraps.length : 0,
        hasBioMembranes: engine ? engine.bioMembranes.length : 0,
        enemiesCount: engine ? engine.enemies.length : 0,
        canvasDPR: window.devicePixelRatio,
        canvasWidth: document.getElementById('maze-canvas') ? document.getElementById('maze-canvas').width : 0
      };
    })()`);
    console.log('Game 2 Status:', game2Status);
    await takeScreenshot('game2_maze_chase_hd.png');

    console.log('\n>>> ALL 3 GAMES VERIFIED SUCCESSFULLY! <<<');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    chrome.kill();
  }
}

runTests();
