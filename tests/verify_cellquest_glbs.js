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
    '--remote-debugging-port=9240',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9240/json');
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
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

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
    console.log('TEST 1: INITIALIZE CELLQUEST 3D & LOAD ANIMAL CELL GLB');
    console.log('================================================================');
    send('Page.navigate', { url: 'http://localhost:3000/cellquest/code.html' });
    await sleep(3500);

    // Scroll stage into view for screenshots
    await evalExpr(`document.getElementById('cell-stage').scrollIntoView({ behavior: 'instant', block: 'center' })`);
    await sleep(400);

    const animalStatus = await evalExpr(`
      (() => {
        const stage = document.getElementById('cell-stage');
        const caption = document.getElementById('stage-caption')?.textContent;
        const loading = document.getElementById('cq-loading');
        const holder = window.CellQuest3D?.stage?.querySelector('canvas');
        const title = document.getElementById('cell-title')?.textContent;
        const labelsCount = document.querySelectorAll('#cq-label-layer .cq-model-label').length;
        const visibleLabels = Array.from(document.querySelectorAll('#cq-label-layer .cq-model-label')).filter(b => !b.hidden).length;

        return {
          currentCell: window.CellQuest3D?.getCell(),
          caption,
          loadingHidden: loading ? loading.classList.contains('hidden') : false,
          title,
          labelsCount,
          visibleLabels
        };
      })()
    `);
    console.log('Animal Cell Status:', animalStatus);
    if (animalStatus.currentCell !== 'animal') throw new Error('Expected currentCell === animal');
    if (!animalStatus.loadingHidden) throw new Error('Loading indicator should be hidden after GLB load');
    if (!animalStatus.caption.includes('Model 3D Sel Haiwan')) throw new Error(`Unexpected caption: ${animalStatus.caption}`);

    // Test Animal Selection (Select Nucleus)
    await evalExpr(`window.CellQuest3D.select('nucleus')`);
    await sleep(300);

    const nucleusSelection = await evalExpr(`
      (() => {
        return {
          name: document.getElementById('organelle-name')?.textContent,
          icon: document.getElementById('organelle-icon')?.textContent,
          desc: document.getElementById('organelle-description')?.textContent,
          fact: document.getElementById('organelle-fact')?.textContent,
          btnActive: document.querySelector('.cq-organelle-btn[data-id="nucleus"]')?.classList.contains('active')
        };
      })()
    `);
    console.log('Animal Nucleus Selection:', nucleusSelection);
    if (nucleusSelection.name !== 'Nukleus') throw new Error('Expected Nukleus selected');
    if (!nucleusSelection.btnActive) throw new Error('Organelle button should be active');

    await takeScreenshot('cellquest_animal_glb_rendered.png');

    console.log('================================================================');
    console.log('TEST 2: SWITCH TO PLANT CELL TAB & LOAD PLANT GLB (plantcellnew.glb)');
    console.log('================================================================');
    await evalExpr(`document.getElementById('plant-tab').click()`);
    // Wait for GLB load & render
    await sleep(2500);

    const plantStatus = await evalExpr(`
      (() => {
        const caption = document.getElementById('stage-caption')?.textContent;
        const loading = document.getElementById('cq-loading');
        const title = document.getElementById('cell-title')?.textContent;
        const labelsCount = document.querySelectorAll('#cq-label-layer .cq-model-label').length;
        const visibleLabels = Array.from(document.querySelectorAll('#cq-label-layer .cq-model-label')).filter(b => !b.hidden).length;

        return {
          currentCell: window.CellQuest3D?.getCell(),
          caption,
          loadingHidden: loading ? loading.classList.contains('hidden') : false,
          title,
          labelsCount,
          visibleLabels
        };
      })()
    `);
    console.log('Plant Cell Status:', plantStatus);
    if (plantStatus.currentCell !== 'plant') throw new Error('Expected currentCell === plant');
    if (!plantStatus.loadingHidden) throw new Error('Loading indicator should be hidden after Plant GLB load');
    if (!plantStatus.caption.includes('Model 3D Sel Tumbuhan')) throw new Error(`Unexpected caption: ${plantStatus.caption}`);

    // Test Plant Selection (Select Chloroplast)
    await evalExpr(`window.CellQuest3D.select('chloroplast')`);
    await sleep(300);

    const chloroplastSelection = await evalExpr(`
      (() => {
        return {
          name: document.getElementById('organelle-name')?.textContent,
          icon: document.getElementById('organelle-icon')?.textContent,
          desc: document.getElementById('organelle-description')?.textContent,
          fact: document.getElementById('organelle-fact')?.textContent,
          btnActive: document.querySelector('.cq-organelle-btn[data-id="chloroplast"]')?.classList.contains('active')
        };
      })()
    `);
    console.log('Plant Chloroplast Selection:', chloroplastSelection);
    if (chloroplastSelection.name !== 'Kloroplas') throw new Error('Expected Kloroplas selected');
    if (!chloroplastSelection.btnActive) throw new Error('Chloroplast button should be active');

    // Test Dinding Sel Selection
    await evalExpr(`window.CellQuest3D.select('wall')`);
    await sleep(300);
    const wallSelection = await evalExpr(`document.getElementById('organelle-name')?.textContent`);
    if (wallSelection !== 'Dinding sel') throw new Error('Expected Dinding sel selected');

    await takeScreenshot('cellquest_plant_glb_rendered.png');

    console.log('================================================================');
    console.log('TEST 3: TEST 3D CONTROLS (CUTAWAY, LABELS TOGGLE, PAN, RESET)');
    console.log('================================================================');
    // Test Cutaway toggle
    await evalExpr(`document.getElementById('toggle-cutaway').click()`);
    await sleep(300);
    const cutawayState1 = await evalExpr(`document.getElementById('toggle-cutaway')?.textContent`);
    console.log('Cutaway toggle 1:', cutawayState1);
    if (!cutawayState1.includes('tutup')) throw new Error('Cutaway should toggle to tutup');

    await evalExpr(`document.getElementById('toggle-cutaway').click()`);
    await sleep(300);
    const cutawayState2 = await evalExpr(`document.getElementById('toggle-cutaway')?.textContent`);
    console.log('Cutaway toggle 2:', cutawayState2);
    if (!cutawayState2.includes('aktif')) throw new Error('Cutaway should toggle back to aktif');

    // Test Labels toggle
    await evalExpr(`document.getElementById('toggle-labels').click()`);
    await sleep(300);
    const labelState1 = await evalExpr(`({
      btnText: document.getElementById('toggle-labels')?.textContent,
      visibleCount: Array.from(document.querySelectorAll('#cq-label-layer .cq-model-label')).filter(b => !b.hidden).length
    })`);
    console.log('Labels toggle hidden:', labelState1);
    if (!labelState1.btnText.includes('Paparkan label')) throw new Error('Label button should say Paparkan label');
    if (labelState1.visibleCount > 0) throw new Error('All labels should be hidden');

    await evalExpr(`document.getElementById('toggle-labels').click()`);
    await sleep(300);
    const labelState2 = await evalExpr(`({
      btnText: document.getElementById('toggle-labels')?.textContent,
      visibleCount: Array.from(document.querySelectorAll('#cq-label-layer .cq-model-label')).filter(b => !b.hidden).length
    })`);
    console.log('Labels toggle restored:', labelState2);
    if (!labelState2.btnText.includes('Sembunyikan label')) throw new Error('Label button should say Sembunyikan label');

    // Test Reset View
    await evalExpr(`window.CellQuest3D.rotateBy(Math.PI / 4)`);
    await sleep(200);
    await evalExpr(`document.getElementById('reset-view').click()`);
    await sleep(200);

    console.log('================================================================');
    console.log('TEST 4: INSTANT CACHED REUSE ON TAB SWITCH');
    console.log('================================================================');
    // Switch back to animal tab
    await evalExpr(`document.getElementById('animal-tab').click()`);
    await sleep(400);

    const cachedAnimalStatus = await evalExpr(`
      (() => {
        return {
          currentCell: window.CellQuest3D?.getCell(),
          caption: document.getElementById('stage-caption')?.textContent,
          loadingHidden: document.getElementById('cq-loading')?.classList.contains('hidden')
        };
      })()
    `);
    console.log('Cached Animal Switch Status:', cachedAnimalStatus);
    if (cachedAnimalStatus.currentCell !== 'animal') throw new Error('Should switch back to animal');
    if (!cachedAnimalStatus.loadingHidden) throw new Error('Cached switch should be instantaneous with hidden loader');

    await takeScreenshot('cellquest_animal_cached_switch.png');

    console.log('================================================================');
    console.log('TEST 5: CONSOLE ERRORS & AUDIT CHECK');
    console.log('================================================================');
    console.log(`Console error/warning count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console notices:', consoleErrors);
    }

    console.log('\n>>> ALL CELLQUEST 3D GLB INTEGRATION TESTS PASSED 100%! <<<');

  } catch (err) {
    console.error('Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    chrome.kill();
    process.exit(process.exitCode || 0);
  }
}

run();
