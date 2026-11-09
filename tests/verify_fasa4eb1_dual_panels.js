const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9335;

async function runDualPanelVerification() {
  console.log('========================================================================');
  console.log('   VERIFIKASI FASA 4E-B.1: DUA PANEL DOM BEBAS (VIDEO + NOTA)');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_4eb1_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 4500));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const errors = [];
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Track console exceptions
  await send('Runtime.enable');
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails);
    }
  });

  async function evaluate(expr) {
    const r = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) {
      throw new Error(JSON.stringify(r.exceptionDetails));
    }
    return r.result.value;
  }

  let passed = 0;
  let total = 0;
  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${name} - ${details}`);
    }
  }

  try {
    // Test 1: #pov-panel-video exists in DOM
    const videoPanelExists = await evaluate(`!!document.getElementById('pov-panel-video')`);
    assert('#pov-panel-video wujud dalam DOM', videoPanelExists);

    // Test 2: #pov-panel-nota exists in DOM
    const notaPanelExists = await evaluate(`!!document.getElementById('pov-panel-nota')`);
    assert('#pov-panel-nota wujud dalam DOM', notaPanelExists);

    // Test 3: Zero duplicate IDs in document
    const duplicateIds = await evaluate(`(() => {
      const ids = {};
      const dupes = [];
      document.querySelectorAll('[id]').forEach(el => {
        if (ids[el.id]) dupes.push(el.id);
        else ids[el.id] = true;
      });
      return dupes;
    })()`);
    assert('Tiada ID bertindih (zero duplicate IDs)', duplicateIds.length === 0, `Duplicates found: ${duplicateIds.join(', ')}`);

    // Test 4: SpatialPanelManager initialized and globally accessible
    const spmActive = await evaluate(`typeof window.SpatialPanelManager !== 'undefined' && typeof window.KotakARSELNEL.SpatialPanelManager !== 'undefined'`);
    assert('SpatialPanelManager didaftar dan boleh diakses secara global', spmActive);

    // Test 5: SpatialPanelManager holds metadata for 'video' and 'nota'
    const spmState = await evaluate(`window.SpatialPanelManager.getState()`);
    assert('SpatialPanelManager mendaftar panel "video"', !!spmState.panels.video && spmState.panels.video.theme === 'orange');
    assert('SpatialPanelManager mendaftar panel "nota"', !!spmState.panels.nota && spmState.panels.nota.theme === 'teal');

    // Test 6: Backward compatibility: getPanelElement('pov-ar-anchor') returns video panel
    const povAnchorShim = await evaluate(`(() => {
      const el = window.KotakARSELNEL.getPanelElement('pov-ar-anchor');
      return el && el.id === 'pov-panel-video';
    })()`);
    assert('Keserasian ke belakang: getPanelElement("pov-ar-anchor") mengembalikan #pov-panel-video', povAnchorShim);

    // Test 7: Video panel visibility can be set via SpatialPanelManager
    const videoVisTest = await evaluate(`(() => {
      window.SpatialPanelManager.setPanelVisibility('video', true);
      const el = document.getElementById('pov-panel-video');
      const isVisible = el && !el.classList.contains('hidden') && el.classList.contains('is-visible');
      window.SpatialPanelManager.setPanelVisibility('video', false);
      const isHidden = el && el.classList.contains('hidden');
      return isVisible && isHidden;
    })()`);
    assert('Kawalan visibiliti panel Video bebas berfungsi', videoVisTest);

    // Test 8: Nota panel visibility can be set via SpatialPanelManager
    const notaVisTest = await evaluate(`(() => {
      window.SpatialPanelManager.setPanelVisibility('nota', true);
      const el = document.getElementById('pov-panel-nota');
      const isVisible = el && !el.classList.contains('hidden') && el.classList.contains('is-visible');
      window.SpatialPanelManager.setPanelVisibility('nota', false);
      const isHidden = el && el.classList.contains('hidden');
      return isVisible && isHidden;
    })()`);
    assert('Kawalan visibiliti panel Nota bebas berfungsi', notaVisTest);

    // Test 9: Independent size control for Video and Nota
    const sizeControlTest = await evaluate(`(() => {
      window.SpatialPanelManager.setPanelSize('video', 'large');
      window.SpatialPanelManager.setPanelSize('nota', 'small');
      const videoCard = document.getElementById('pov-card-container');
      const notaCard = document.getElementById('pov-nota-card-container');
      const vLarge = videoCard.classList.contains('size-large');
      const nSmall = notaCard.classList.contains('size-small');
      // Reset back to medium
      window.SpatialPanelManager.setPanelSize('video', 'medium');
      window.SpatialPanelManager.setPanelSize('nota', 'medium');
      return vLarge && nSmall;
    })()`);
    assert('Kawalan saiz berasingan untuk Video dan Nota berfungsi', sizeControlTest);

    // Test 10: Corner resize grips are bound on both panels
    const cornerGripTest = await evaluate(`(() => {
      const vGrip = document.getElementById('pov-corner-resize-handle');
      const nGrip = document.getElementById('pov-nota-corner-resize-handle');
      return !!vGrip && !!nGrip;
    })()`);
    assert('Handle pengubah saiz penjuru bebas wujud pada kedua-dua panel', cornerGripTest);

    // Test 11: Module switching updates active panel cleanly
    const switchTest = await evaluate(`(() => {
      window.KotakARSELNEL.switchActiveModule('video');
      const act1 = window.SpatialPanelManager.getActivePanel().id;
      window.KotakARSELNEL.switchActiveModule('nota');
      const act2 = window.SpatialPanelManager.getActivePanel().id;
      window.KotakARSELNEL.switchActiveModule('video');
      return act1 === 'video' && act2 === 'nota';
    })()`);
    assert('Pertukaran modul antara Video dan Nota menyegerakkan SpatialPanelManager', switchTest);

    // Test 12: CellQuest 3D Controller remains completely intact and unaffected
    const cellQuestIntact = await evaluate(`(() => {
      const c = window.CellQuestARController;
      return c && typeof c.activate === 'function' && typeof c.deactivate === 'function';
    })()`);
    assert('CellQuest 3D Controller kekal utuh dan tidak terjejas', cellQuestIntact);

    // Test 13: Zero unhandled console exceptions
    assert('Tiada ralat JavaScript dalam konsol (zero unhandled exceptions)', errors.length === 0, `${errors.length} errors: ${JSON.stringify(errors)}`);

    console.log(`\n========================================================================`);
    console.log(`   KEPUTUSAN: ${passed} / ${total} UJIAN LULUS (${Math.round((passed/total)*100)}%)`);
    console.log(`========================================================================\n`);

    if (passed === total) {
      console.log('🎉 FASA 4E-B.1 TELAH BERJAYA DISELESAIKAN DENGAN SEMPURNA!');
      cleanup();
      process.exit(0);
    } else {
      console.error('❌ SEBAHAGIAN UJIAN GAGAL');
      cleanup();
      process.exit(1);
    }

  } catch (err) {
    console.error('Ralat pelaksanaan ujian:', err);
    cleanup();
    process.exit(1);
  }
}

runDualPanelVerification();

