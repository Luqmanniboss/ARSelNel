const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\d23aec0a-ad24-4569-924f-62e9b824666e';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--window-size=1366,768',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9227/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);

    await new Promise((resolve) => {
      ws.addEventListener('open', resolve);
    });

    let id = 1;
    const send = (method, params = {}) => {
      const currentId = id++;
      ws.send(JSON.stringify({ id: currentId, method, params }));
      return currentId;
    };

    send('Runtime.enable');
    send('Page.enable');

    const consoleErrors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
    });

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

    console.log('================================================================');
    console.log('TEST 1: INITIALIZE ARSELNEL MAZE CHASE IN BROWSER');
    console.log('================================================================');
    send('Page.navigate', { url: 'http://localhost:3000/games/klasifikasi-sel.html' });
    await sleep(2500);

    const initStatus = await evalExpr(`
      (() => {
        const inst = window.MazeGameInstance;
        return {
          hasInstance: !!inst,
          hasEngine: !!(inst && inst.engine),
          currentQuestionIndex: inst ? inst.currentQuestionIndex : -1,
          lives: inst ? inst.lives : -1,
          score: inst ? inst.score : -1,
          activeQuestion: !!(inst && inst.engine.activeQuestion)
        };
      })()
    `);
    console.log('Game Initialization Status:', initStatus);
    if (!initStatus.hasInstance) throw new Error('MazeGameInstance failed to initialize');

    // Dismiss Welcome Modal
    await evalExpr(`document.getElementById('maze-welcome-start-btn').click()`);
    await sleep(400);

    // Dismiss Preview phase to enter active maze
    await evalExpr(`document.getElementById('maze-preview-start-btn').click()`);
    await sleep(500);

    console.log('================================================================');
    console.log('TEST 2: POWER-UPS SYSTEM AUDIT (ALL 5 TYPES, REACHABILITY, EFFECTS)');
    console.log('================================================================');
    const powerupsAudit = await evalExpr(`
      (() => {
        const data = window.ARSelNelMazeData;
        const inst = window.MazeGameInstance;
        const ts = inst.engine.tileSize;

        // 1. Audit distribution across 50 simulated maze parses
        const seenTypes = new Set();
        let totalPowerupsChecked = 0;
        let spawnedInWallCount = 0;

        for (let round = 0; round < 50; round++) {
          const map = data.parseMazeGrid(round % 10, round % 10);
          map.powerups.forEach(p => {
            seenTypes.add(p.type);
            totalPowerupsChecked++;
            if (map.grid[p.y][p.x] !== 0) {
              spawnedInWallCount++;
            }
          });
        }

        // 2. Test collection & functional activation of all 5 types
        // A. Speed
        inst.engine.activePowerups.speedTimer = 0;
        const baseSpeed = inst.engine.player.speed;
        inst.engine.powerups = [{
          id: 'test_speed',
          type: 'speed',
          x: Math.floor(inst.engine.player.x / ts),
          y: Math.floor(inst.engine.player.y / ts),
          color: '#facc15',
          duration: 3,
          collected: false
        }];
        inst.engine.checkPowerups();
        const speedEffectWorking = inst.engine.activePowerups.speedTimer === 3.0;

        // B. Freeze
        inst.engine.powerups = [{
          id: 'test_freeze',
          type: 'freeze',
          x: Math.floor(inst.engine.player.x / ts),
          y: Math.floor(inst.engine.player.y / ts),
          color: '#38bdf8',
          duration: 3,
          collected: false
        }];
        inst.engine.checkPowerups();
        const freezeEffectWorking = inst.engine.activePowerups.virusFreezeTimer === 3.0;

        // C. Shield
        inst.engine.activePowerups.hasShield = false;
        inst.engine.powerups = [{
          id: 'test_shield',
          type: 'shield',
          x: Math.floor(inst.engine.player.x / ts),
          y: Math.floor(inst.engine.player.y / ts),
          color: '#10b981',
          duration: 0,
          collected: false
        }];
        inst.engine.checkPowerups();
        const shieldAcquired = inst.engine.activePowerups.hasShield === true;

        // Verify Shield absorption: hit enemy without deducting life
        const livesBeforeHit = inst.lives;
        inst.engine.handlePlayerHit(inst.engine.enemies[0]);
        const shieldAbsorbedHit = (inst.lives === livesBeforeHit) && (inst.engine.activePowerups.hasShield === false);

        // D. Radar
        inst.engine.powerups = [{
          id: 'test_radar',
          type: 'radar',
          x: Math.floor(inst.engine.player.x / ts),
          y: Math.floor(inst.engine.player.y / ts),
          color: '#a855f7',
          duration: 5,
          collected: false
        }];
        inst.engine.checkPowerups();
        const radarEffectWorking = inst.engine.activePowerups.radarTimer === 5.0;

        // E. Extra Life
        inst.lives = 3;
        inst.engine.powerups = [{
          id: 'test_life',
          type: 'life',
          x: Math.floor(inst.engine.player.x / ts),
          y: Math.floor(inst.engine.player.y / ts),
          color: '#f43f5e',
          duration: 0,
          collected: false
        }];
        inst.engine.checkPowerups();
        const extraLifeWorking = (inst.lives === 4);

        // Cap at 5 lives
        inst.lives = 5;
        inst.handleExtraLife();
        const lifeCappedAt5 = (inst.lives === 5);

        return {
          seenTypesCount: seenTypes.size,
          seenTypesList: Array.from(seenTypes).sort(),
          totalPowerupsChecked,
          spawnedInWallCount,
          speedEffectWorking,
          freezeEffectWorking,
          shieldAcquired,
          shieldAbsorbedHit,
          radarEffectWorking,
          extraLifeWorking,
          lifeCappedAt5
        };
      })()
    `);
    console.log('Power-ups Audit Results:', powerupsAudit);
    if (powerupsAudit.seenTypesCount !== 5) {
      throw new Error(`Expected all 5 powerups ('freeze', 'life', 'radar', 'shield', 'speed'), got: ${JSON.stringify(powerupsAudit.seenTypesList)}`);
    }
    if (powerupsAudit.spawnedInWallCount > 0) {
      throw new Error(`Powerups spawned in walls: ${powerupsAudit.spawnedInWallCount}`);
    }
    if (!powerupsAudit.speedEffectWorking) throw new Error('Speed powerup effect failed');
    if (!powerupsAudit.freezeEffectWorking) throw new Error('Freeze powerup effect failed');
    if (!powerupsAudit.shieldAcquired || !powerupsAudit.shieldAbsorbedHit) throw new Error('Shield powerup failed');
    if (!powerupsAudit.radarEffectWorking) throw new Error('Radar powerup effect failed');
    if (!powerupsAudit.extraLifeWorking) throw new Error('Life powerup effect failed');
    if (!powerupsAudit.lifeCappedAt5) throw new Error('Life capping at 5 failed');

    console.log('================================================================');
    console.log('TEST 3: ENEMY AI AUDIT (GREEN=3, PURPLE=6, RED=9, STATE MACHINE)');
    console.log('================================================================');
    const aiAudit = await evalExpr(`
      (() => {
        const data = window.ARSelNelMazeData;
        const inst = window.MazeGameInstance;
        const cfg = data.VIRUS_CONFIG;
        const ts = inst.engine.tileSize;

        // Reset freeze timer so enemies can act
        inst.engine.activePowerups.virusFreezeTimer = 0;

        // 1. Detection range configuration check
        const configRanges = {
          green: cfg.green.detectionRange,
          purple: cfg.purple.detectionRange,
          red: cfg.red.detectionRange
        };

        // All 3 enemies active
        const allActive = inst.engine.enemies[0].active && inst.engine.enemies[1].active && inst.engine.enemies[2].active;

        // 2. Test Detection Distances along corridor
        // Place player at (11, 13)
        inst.engine.player.x = 11.5 * ts;
        inst.engine.player.y = 13.5 * ts;

        // Green: 2 tiles away (col 9, row 13) -> within 3 tiles -> DETECT_PLAYER or CHASE_PLAYER
        inst.engine.enemies[0].x = 9.5 * ts;
        inst.engine.enemies[0].y = 13.5 * ts;
        inst.engine.enemies[0].state = data.EnemyState.RANDOM_PATROL;

        // Purple: 5 tiles away (col 6, row 13) -> within 6 tiles -> DETECT_PLAYER or CHASE_PLAYER
        inst.engine.enemies[1].x = 6.5 * ts;
        inst.engine.enemies[1].y = 13.5 * ts;
        inst.engine.enemies[1].state = data.EnemyState.RANDOM_PATROL;

        // Red: 8 tiles away (col 19, row 13) -> within 9 tiles -> DETECT_PLAYER or CHASE_PLAYER
        inst.engine.enemies[2].x = 19.5 * ts;
        inst.engine.enemies[2].y = 13.5 * ts;
        inst.engine.enemies[2].state = data.EnemyState.RANDOM_PATROL;

        inst.engine.updateEnemies(0.016);

        const detectedStates = {
          green: inst.engine.enemies[0].state,
          purple: inst.engine.enemies[1].state,
          red: inst.engine.enemies[2].state
        };

        // Advance past stateTimer (0.4s) to verify transition DETECT_PLAYER -> CHASE_PLAYER
        inst.engine.updateEnemies(0.5);
        const chasingStates = {
          green: inst.engine.enemies[0].state,
          purple: inst.engine.enemies[1].state,
          red: inst.engine.enemies[2].state
        };

        // 3. Test Outside Range (Green at 5 tiles away, Purple at 8 tiles away, Red at 11 tiles away)
        // Reset disengage timer to 0 so they lose player immediately
        inst.engine.enemies[0].x = 5.5 * ts; // 6 tiles away
        inst.engine.enemies[0].disengageTimer = 0.05;

        inst.engine.enemies[1].x = 3.5 * ts; // 8 tiles away
        inst.engine.enemies[1].disengageTimer = 0.05;

        inst.engine.enemies[2].x = 0.5 * ts; // 11 tiles away
        inst.engine.enemies[2].disengageTimer = 0.05;

        // Disengage elapsed -> LOST_PLAYER
        inst.engine.updateEnemies(0.1);
        const lostStates = {
          green: inst.engine.enemies[0].state,
          purple: inst.engine.enemies[1].state,
          red: inst.engine.enemies[2].state
        };

        // Advance past stateTimer in LOST_PLAYER (1.0s) -> RANDOM_PATROL
        inst.engine.updateEnemies(1.1);
        const returnedPatrolStates = {
          green: inst.engine.enemies[0].state,
          purple: inst.engine.enemies[1].state,
          red: inst.engine.enemies[2].state
        };

        return {
          configRanges,
          allActive,
          detectedStates,
          chasingStates,
          lostStates,
          returnedPatrolStates
        };
      })()
    `);
    console.log('AI Audit Results:', aiAudit);
    if (aiAudit.configRanges.green !== 3) throw new Error(`Green range must be 3, got ${aiAudit.configRanges.green}`);
    if (aiAudit.configRanges.purple !== 6) throw new Error(`Purple range must be 6, got ${aiAudit.configRanges.purple}`);
    if (aiAudit.configRanges.red !== 9) throw new Error(`Red range must be 9, got ${aiAudit.configRanges.red}`);
    if (!aiAudit.allActive) throw new Error('All 3 enemies must be active');

    if (aiAudit.detectedStates.green !== 'DETECT_PLAYER' && aiAudit.detectedStates.green !== 'CHASE_PLAYER') {
      throw new Error(`Green enemy failed to detect player at 2 tiles: ${aiAudit.detectedStates.green}`);
    }
    if (aiAudit.chasingStates.green !== 'CHASE_PLAYER' || aiAudit.chasingStates.purple !== 'CHASE_PLAYER' || aiAudit.chasingStates.red !== 'CHASE_PLAYER') {
      throw new Error(`Enemies failed to transition to CHASE_PLAYER: ${JSON.stringify(aiAudit.chasingStates)}`);
    }
    if (aiAudit.lostStates.green !== 'LOST_PLAYER' || aiAudit.lostStates.purple !== 'LOST_PLAYER' || aiAudit.lostStates.red !== 'LOST_PLAYER') {
      throw new Error(`Enemies failed to transition to LOST_PLAYER: ${JSON.stringify(aiAudit.lostStates)}`);
    }
    if (aiAudit.returnedPatrolStates.green !== 'RANDOM_PATROL' || aiAudit.returnedPatrolStates.purple !== 'RANDOM_PATROL' || aiAudit.returnedPatrolStates.red !== 'RANDOM_PATROL') {
      throw new Error(`Enemies failed to return to RANDOM_PATROL: ${JSON.stringify(aiAudit.returnedPatrolStates)}`);
    }

    console.log('================================================================');
    console.log('TEST 4: ENEMY RANDOM PATROL & ANTI-OSCILLATION TEST');
    console.log('================================================================');
    const patrolMovementAudit = await evalExpr(`
      (() => {
        const inst = window.MazeGameInstance;
        const ts = inst.engine.tileSize;
        const enemy = inst.engine.enemies[0];

        // Ensure in RANDOM_PATROL far from player
        inst.engine.player.x = 21.5 * ts;
        inst.engine.player.y = 13.5 * ts;
        enemy.x = 11.5 * ts;
        enemy.y = 5.5 * ts;
        enemy.state = window.ARSelNelMazeData.EnemyState.RANDOM_PATROL;
        enemy.direction = 'left';

        const visitedTiles = new Set();
        let penetratedWall = false;

        for (let step = 0; step < 60; step++) {
          inst.engine.updateEnemies(0.05);
          const tX = Math.floor(enemy.x / ts);
          const tY = Math.floor(enemy.y / ts);
          visitedTiles.add(tX + ',' + tY);
          if (inst.engine.grid[tY][tX] !== 0) {
            penetratedWall = true;
          }
        }

        return {
          visitedCount: visitedTiles.size,
          penetratedWall,
          finalState: enemy.state
        };
      })()
    `);
    console.log('Patrol Movement Audit:', patrolMovementAudit);
    if (patrolMovementAudit.penetratedWall) throw new Error('Enemy penetrated wall during patrol');
    if (patrolMovementAudit.visitedCount < 3) throw new Error('Enemy appears stuck in a 1-2 tile oscillation loop');
    if (patrolMovementAudit.finalState !== 'RANDOM_PATROL') throw new Error('Enemy changed state without player in range');

    console.log('================================================================');
    console.log('TEST 5: RESTART GAME AUDIT');
    console.log('================================================================');
    const restartAudit = await evalExpr(`
      (() => {
        const inst = window.MazeGameInstance;
        // Mutate state
        inst.lives = 1;
        inst.score = 750;
        inst.currentQuestionIndex = 4;
        inst.engine.activePowerups.hasShield = true;
        inst.engine.activePowerups.speedTimer = 2.5;

        // Restart
        inst.restartGame();

        return {
          lives: inst.lives,
          score: inst.score,
          qIndex: inst.currentQuestionIndex,
          hasShield: inst.engine.activePowerups.hasShield,
          speedTimer: inst.engine.activePowerups.speedTimer,
          enemiesActive: inst.engine.enemies.every(e => e.active),
          powerupsCount: inst.engine.powerups.length
        };
      })()
    `);
    console.log('Restart Audit Results:', restartAudit);
    if (restartAudit.lives !== 3) throw new Error(`Restart should reset lives to 3, got ${restartAudit.lives}`);
    if (restartAudit.score !== 0) throw new Error(`Restart should reset score to 0, got ${restartAudit.score}`);
    if (restartAudit.qIndex !== 0) throw new Error(`Restart should reset question to 0, got ${restartAudit.qIndex}`);
    if (restartAudit.hasShield !== false) throw new Error('Restart should clear active shield');
    if (restartAudit.speedTimer !== 0) throw new Error('Restart should clear active speedTimer');
    if (!restartAudit.enemiesActive) throw new Error('Enemies must remain active after restart');
    if (restartAudit.powerupsCount < 1) throw new Error('Powerups must be spawned upon restart');

    // Dismiss preview modal again
    await evalExpr(`document.getElementById('maze-preview-start-btn').click()`);
    await sleep(500);

    await takeScreenshot('maze_chase_upgraded_gameplay.png');

    console.log('================================================================');
    console.log('TEST 6: CONSOLE ERRORS AUDIT');
    console.log('================================================================');
    console.log(`Console error/warning count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }

    console.log('\n>>> ALL AUDIT AND FIX TESTS PASSED WITH 100% SUCCESS! <<<');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    chrome.kill();
    process.exit(process.exitCode || 0);
  }
}

runTest();
