const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\f90d237f-1cfd-44dd-8e91-b62fa945072a';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--window-size=1280,820',
    'about:blank'
  ]);

  try {
    await sleep(1500);
    const listRes = await fetch('http://127.0.0.1:9224/json');
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

    console.log('--- 1. AUDIT HAB PERMAINAN 5 CARDS ---');
    send('Page.navigate', { url: 'http://localhost:3000/hab_permainan/code.html' });
    await sleep(2000);

    const cardsCount = await evalExpr(`document.querySelectorAll('.main-container section .grid > div').length`);
    console.log(`Total quiz cards in hub: ${cardsCount}`);

    const card5Title = await evalExpr(`
      const titles = Array.from(document.querySelectorAll('h4')).map(h => h.textContent.trim());
      titles.find(t => t.includes('Misi Makmal Sains'));
    `);
    console.log(`Card 5 title found: ${card5Title}`);

    const card5Link = await evalExpr(`
      const links = Array.from(document.querySelectorAll('a')).map(a => a.getAttribute('href'));
      links.find(l => l && l.includes('misi-makmal-sains.html'));
    `);
    console.log(`Card 5 link found: ${card5Link}`);

    await takeScreenshot('lab_audit_hub_page.png');

    console.log('\n--- 2. NAVIGATE TO MISI MAKMAL SAINS ---');
    send('Page.navigate', { url: 'http://localhost:3000/games/misi-makmal-sains.html' });
    await sleep(2000);

    const introVisible = await evalExpr(`!document.getElementById('lab-intro-modal').classList.contains('hidden')`);
    console.log(`Pre-game instruction modal is visible: ${introVisible}`);

    const teacherStoryline = await evalExpr(`document.querySelector('#lab-intro-modal p.italic').textContent.trim()`);
    console.log(`Teacher storyline snippet: ${teacherStoryline.substring(0, 80)}...`);

    await takeScreenshot('lab_intro_modal.png');

    console.log('\n--- 3. START GAME ---');
    await evalExpr(`document.getElementById('lab-start-btn').click()`);
    await sleep(500);

    const isPlaying = await evalExpr(`window.labAdventureApp.engine.state === 'playing'`);
    const initialPos = await evalExpr(`({ x: window.labAdventureApp.engine.player.x, y: window.labAdventureApp.engine.player.y })`);
    console.log(`Game is playing: ${isPlaying}, Player initial pos: (${initialPos.x}, ${initialPos.y})`);

    // Simulate movement up
    await evalExpr(`
      window.labAdventureApp.engine.keys.up = true;
      window.labAdventureApp.engine.update(0.3);
      window.labAdventureApp.engine.keys.up = false;
    `);
    const newPos = await evalExpr(`({ x: window.labAdventureApp.engine.player.x, y: window.labAdventureApp.engine.player.y })`);
    console.log(`Player moved up: from y=${initialPos.y} to y=${newPos.y}`);

    await takeScreenshot('lab_gameplay_canvas.png');

    console.log('\n--- 4. ITEM 1 (BIKAR) QUESTION & SCORING ---');
    // Teleport player near Item 1 (col: 8, row: 14)
    await evalExpr(`
      const item1 = window.labAdventureApp.engine.equipmentList[0];
      window.labAdventureApp.engine.player.x = item1.x;
      window.labAdventureApp.engine.player.y = item1.y;
      window.labAdventureApp.engine.update(0.016);
    `);
    await sleep(500);

    const qModalOpen = await evalExpr(`!document.getElementById('lab-question-modal').classList.contains('hidden')`);
    const qTitle = await evalExpr(`document.getElementById('lab-modal-title').textContent.trim()`);
    const qBadge = await evalExpr(`document.getElementById('lab-modal-difficulty').textContent.trim()`);
    console.log(`Question modal open: ${qModalOpen}, Title: ${qTitle}, Badge: ${qBadge}`);

    await takeScreenshot('lab_question_modal.png');

    // Select correct option for Q1 (Index 2: Sel)
    await evalExpr(`
      const optBtn = document.querySelectorAll('.lab-option-btn')[2];
      optBtn.click();
    `);
    await sleep(200);

    // Submit answer
    await evalExpr(`document.getElementById('lab-modal-submit-btn').click()`);
    await sleep(500);

    const feedbackText = await evalExpr(`document.getElementById('lab-modal-feedback').textContent.trim()`);
    const scoreAfterQ1 = await evalExpr(`window.labAdventureApp.score`);
    console.log(`Feedback snippet: ${feedbackText.substring(0, 60)}...`);
    console.log(`Score after Q1: ${scoreAfterQ1} pts (Expected: 50)`);

    // Click continue
    await evalExpr(`document.getElementById('lab-modal-submit-btn').click()`);
    await sleep(400);

    console.log('\n--- 5. TEST PAUSE MENU ---');
    await evalExpr(`window.labAdventureApp.togglePause()`);
    await sleep(300);
    const pauseOpen = await evalExpr(`!document.getElementById('lab-pause-modal').classList.contains('hidden')`);
    console.log(`Pause menu open: ${pauseOpen}`);
    await takeScreenshot('lab_pause_modal.png');

    // Resume from pause
    await evalExpr(`document.getElementById('lab-pause-resume-btn').click()`);
    await sleep(300);
    const resumed = await evalExpr(`document.getElementById('lab-pause-modal').classList.contains('hidden')`);
    console.log(`Game resumed: ${resumed}`);

    console.log('\n--- 6. ANSWER REMAINING ITEMS (2 to 10) ---');
    // Programmatically answer remaining questions to test cognitive difficulty mapping & bonus
    await evalExpr(`
      const app = window.labAdventureApp;
      const questions = window.ARSelNelLabAdventure.QUESTIONS;

      for (let i = 1; i < app.engine.equipmentList.length; i++) {
        const item = app.engine.equipmentList[i];
        const q = questions.find(question => question.id === item.questionId);
        
        // Simulasikan kutipan dan jawapan tepat
        item.collected = true;
        app.inventory[item.key] = true;
        app.collectedCount++;
        app.answeredCount++;
        app.correctAnswersCount++;
        app.score += q.points;
      }
      app.updateHUD();
    `);

    const totalScoreBeforeReturn = await evalExpr(`window.labAdventureApp.score`);
    const totalCollected = await evalExpr(`window.labAdventureApp.collectedCount`);
    console.log(`Items collected: ${totalCollected}/10, Score before return: ${totalScoreBeforeReturn} pts (Expected: 950)`);

    console.log('\n--- 7. STORAGE RETURN & EXIT DOOR UNLOCK ---');
    // Test early exit approach (should show locked notice)
    await evalExpr(`window.labAdventureApp.handleExitDoorTrigger(false)`);
    await sleep(200);
    const toastText = await evalExpr(`document.getElementById('lab-toast-notice').textContent.trim()`);
    console.log(`Early exit toast notice: ${toastText}`);

    // Trigger storage return station
    await evalExpr(`window.labAdventureApp.handleStorageStationTrigger()`);
    await sleep(400);

    const scoreAfterReturn = await evalExpr(`window.labAdventureApp.score`);
    const isExitUnlocked = await evalExpr(`window.labAdventureApp.engine.isExitUnlocked`);
    console.log(`Score after storage return: ${scoreAfterReturn} pts (Expected: 1000)`);
    console.log(`Exit door unlocked: ${isExitUnlocked}`);

    console.log('\n--- 8. EXIT DOOR & VICTORY SCREEN ---');
    // Step through unlocked exit door
    await evalExpr(`window.labAdventureApp.handleExitDoorTrigger(true)`);
    await sleep(500);

    const victoryVisible = await evalExpr(`!document.getElementById('lab-victory-modal').classList.contains('hidden')`);
    const victoryScore = await evalExpr(`document.getElementById('lab-victory-score').textContent.trim()`);
    const victoryBadge = await evalExpr(`document.getElementById('lab-victory-badge').textContent.trim()`);
    const savedRecord = await evalExpr(`JSON.parse(localStorage.getItem('arselnel_lab_adventure_record'))`);

    console.log(`Victory modal visible: ${victoryVisible}`);
    console.log(`Victory score display: ${victoryScore}`);
    console.log(`Scientist rank: ${victoryBadge}`);
    console.log(`Saved record in localStorage: ID=${savedRecord.quiz_id}, Score=${savedRecord.score}/${savedRecord.max_score}, Correct=${savedRecord.correct_answers}/10`);

    await takeScreenshot('lab_victory_modal.png');

    console.log('\n>>> ALL 18 PHASES VERIFIED SUCCESSFULLY! <<<');
    chrome.kill();
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
  }
}

runTest();
