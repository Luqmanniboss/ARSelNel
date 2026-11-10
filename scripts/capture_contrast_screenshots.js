/**
 * scripts/capture_contrast_screenshots.js
 * Captures iPad 1024x768 screenshots for all specific views requested in the contrast hotfix:
 * 1. Video — panel utama
 * 2. Nota — senarai nota
 * 3. Nota — paparan reader
 * 4. Kuiz — senarai permainan
 * 5. Kuiz — MCQ view
 * 6. CellQuest — kawalan model
 * 7. Empat modul aktif serentak
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9396;

async function run() {
  const screenshotsDir = path.join(__dirname, '..', 'tests', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_contrast_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/kotak_arselnel/code.html'
  ], { detached: false });

  try {
    await new Promise(r => setTimeout(r, 3500));
    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('kotak_arselnel'));
    if (!pageTarget) throw new Error('Target page not found');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = ++id;
        const handler = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.id === curId) {
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          } catch(err) {}
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });

    async function takeScreenshot(name) {
      await new Promise(r => setTimeout(r, 600));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(screenshotsDir, `${name}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`📸 Saved: ${filePath}`);
    }

    // 1. VIDEO — Panel Utama
    console.log('1. Capturing Video Panel Utama...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(0, 'video');
          if (window.ARState.videos && window.ARState.videos.length > 0) window.selectVideo(window.ARState.videos[0]);
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') await window.KotakARSELNEL.startPOVMode();
          document.getElementById('pov-btn-anchor')?.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_video_main');

    // 2. NOTA — Senarai Nota
    console.log('2. Capturing Nota Senarai...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(1, 'nota');
          // Switch to selection view in Nota
          const selView = document.getElementById('pov-nota-selection-view');
          const readView = document.getElementById('pov-nota-reader-view');
          if (selView && readView) {
            selView.classList.remove('hidden');
            readView.classList.add('hidden');
          }
          document.getElementById('pov-nota-btn-anchor')?.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_nota_list');

    // 3. NOTA — Paparan Reader PDF
    console.log('3. Capturing Nota Reader PDF...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          if (window.ARState.notes && window.ARState.notes.length > 0) window.selectNote(window.ARState.notes[0]);
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_nota_reader');

    // 4. KUIZ — Senarai Permainan
    console.log('4. Capturing Kuiz Senarai Permainan...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(2, 'kuiz');
          const selView = document.getElementById('pov-kuiz-selection-view');
          const playView = document.getElementById('pov-kuiz-player-view');
          if (selView && playView) {
            selView.classList.remove('hidden');
            playView.classList.add('hidden');
          }
          document.getElementById('pov-kuiz-btn-anchor')?.click();
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_kuiz_games');

    // 5. KUIZ — MCQ View
    console.log('5. Capturing Kuiz MCQ View...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          if (typeof window.startKuizMode === 'function') {
            window.startKuizMode('mcq');
          } else {
            const btn = document.getElementById('pov-btn-mode-mcq') || document.getElementById('btn-mode-mcq');
            if (btn) btn.click();
          }
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_kuiz_mcq');

    // 6. CELLQUEST — Kawalan Model & Organel Card
    console.log('6. Capturing CellQuest Kawalan Model...');
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(3, 'cellquest');
          // Show organelle card if hidden
          const orgCard = document.getElementById('cq-organelle-card');
          if (orgCard) orgCard.classList.remove('hidden');
        })()
      `,
      awaitPromise: true
    });
    await takeScreenshot('contrast_cellquest_controls');

    // 7. EMPAT MODUL AKTIF SERENTAK
    console.log('7. Capturing Empat Modul Aktif Serentak...');
    await takeScreenshot('contrast_four_modules');

    ws.close();
    console.log('All contrast screenshots captured successfully!');
  } catch(err) {
    console.error('Error during capture:', err);
  } finally {
    try { edgeProcess.kill(); } catch(e) {}
  }
}

run().then(() => process.exit(0));

