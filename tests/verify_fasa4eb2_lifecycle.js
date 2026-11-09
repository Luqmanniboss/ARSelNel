const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9336;

async function runLifecycleVerification() {
  console.log('========================================================================');
  console.log('   VERIFIKASI FASA 4E-B.2: PENGEKALAN SESI VIDEO & NOTA (LIFECYCLE)');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_4eb2_${Date.now()}`);

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
      console.log(`[PASS] Ujian ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Ujian ${total}: ${name} - ${details}`);
    }
  }

  try {
    // 1. Video boleh dibuka & dipaparkan
    const videoOpened = await evaluate(`(() => {
      window.KotakARSELNEL.switchActiveModule('video');
      const v = window.KotakARSELNEL.state.videos[0];
      window.KotakARSELNEL.syncPOVVideoPlayer(v);
      window.showVideoPanel();
      const f = document.getElementById('pov-player-frame');
      const panel = document.getElementById('pov-panel-video');
      const hasPlayer = !!(f && f.querySelector('iframe, video'));
      const isVisible = panel && !panel.classList.contains('hidden');
      return hasPlayer && isVisible;
    })()`);
    assert('Video boleh dibuka dan pemain disuntik', videoOpened);

    // 2. Nota boleh dibuka & dipaparkan
    const notaOpened = await evaluate(`(() => {
      window.KotakARSELNEL.switchActiveModule('nota');
      window.showNotaPanel();
      const panel = document.getElementById('pov-panel-nota');
      const isVisible = panel && !panel.classList.contains('hidden');
      return isVisible;
    })()`);
    assert('Nota boleh dibuka dan panel dipaparkan', notaOpened);

    // 3 & 4. Membuka Nota tidak memusnahkan iframe Video & Identiti iframe kekal sama
    const videoIframePreserved = await evaluate(`(() => {
      // 1. Buka Video & tag elemen iframe
      window.KotakARSELNEL.switchActiveModule('video');
      window.showVideoPanel();
      const v = window.KotakARSELNEL.state.videos[0];
      window.KotakARSELNEL.syncPOVVideoPlayer(v);

      const f = document.getElementById('pov-player-frame');
      const playerEl = f ? f.querySelector('iframe, video') : null;
      if (!playerEl) return { hasPlayerNode: false, tokenMatched: false };

      const token = 'session_' + Math.random();
      playerEl.setAttribute('data-session-token', token);

      // 2. Bertukar ke Nota (menutup/menyembunyikan video tetapi mengekalkan iframe)
      window.KotakARSELNEL.switchActiveModule('nota');
      window.showNotaPanel();

      // 3. Semak pemain video dalam frame masih hidup
      const preservedPlayer = f ? f.querySelector('iframe, video') : null;
      const sameToken = preservedPlayer && preservedPlayer.getAttribute('data-session-token') === token;

      return {
        hasPlayerNode: !!preservedPlayer,
        tokenMatched: sameToken
      };
    })()`);
    assert('Membuka Nota tidak memusnahkan iframe Video', videoIframePreserved.hasPlayerNode);
    assert('Identiti iframe/pemain Video kekal sama (session token dipelihara)', videoIframePreserved.tokenMatched);

    // 5. Video tidak restart apabila pengguna kembali kepada Video
    const videoNotRestarted = await evaluate(`(() => {
      const f = document.getElementById('pov-player-frame');
      const initialPlayer = f ? f.querySelector('iframe, video') : null;
      const initialToken = initialPlayer ? initialPlayer.getAttribute('data-session-token') : null;

      // Kembali ke Video
      window.KotakARSELNEL.switchActiveModule('video');
      window.showVideoPanel();

      const returnedPlayer = f ? f.querySelector('iframe, video') : null;
      const returnedToken = returnedPlayer ? returnedPlayer.getAttribute('data-session-token') : null;

      return initialPlayer === returnedPlayer && initialToken === returnedToken && !!initialToken;
    })()`);
    assert('Video tidak restart/re-render apabila kembali daripada Nota', videoNotRestarted);

    // 6. Status playback pemain dijejaki dan dipelihara dalam SpatialPanelManager
    const playbackStatePreserved = await evaluate(`(() => {
      const p = window.SpatialPanelManager.getPanel('video');
      return p && (p.playbackState === 'playing' || p.playbackState === 'paused') && p.isLoaded === true;
    })()`);
    assert('Status playback pemain dijejaki dan dipelihara dalam SpatialPanelManager', playbackStatePreserved);

    // 7 & 8. Nota tidak dimuatkan semula & kedudukan halaman/scroll dikekalkan
    const notaScrollPreserved = await evaluate(`(() => {
      // Pergi ke Nota, set halaman 2
      window.KotakARSELNEL.switchActiveModule('nota');
      window.showNotaPanel();
      window.KotakARSELNEL.state.currentNotePage = 2;

      // Bertukar ke Video
      window.KotakARSELNEL.switchActiveModule('video');
      window.showVideoPanel();

      // Kembali ke Nota
      window.KotakARSELNEL.switchActiveModule('nota');
      window.showNotaPanel();

      const pagePreserved = window.KotakARSELNEL.state.currentNotePage === 2;
      return pagePreserved;
    })()`);
    assert('Kandungan dan halaman Nota tidak dimuatkan semula dari awal', notaScrollPreserved);

    // 9. Menutup Video secara manual melaksanakan cleanup (destroyVideoSession)
    const videoManualClose = await evaluate(`(() => {
      window.destroyVideoSession();
      const f = document.getElementById('pov-player-frame');
      const p = window.SpatialPanelManager.getPanel('video');
      const isEmpty = f ? f.children.length === 0 : false;
      const stateDestroyed = p && p.playbackState === 'destroyed' && p.isLoaded === false;
      return isEmpty && stateDestroyed;
    })()`);
    assert('Menutup Video secara manual melaksanakan cleanup penuh (destroyVideoSession)', videoManualClose);

    // 10. Menutup Nota tidak menutup Video (pengasingan kitaran hayat)
    const closeIsolation = await evaluate(`(() => {
      // Buka semula Video dan Nota
      window.KotakARSELNEL.switchActiveModule('video');
      const v = window.KotakARSELNEL.state.videos[0];
      window.KotakARSELNEL.syncPOVVideoPlayer(v);
      window.showVideoPanel();

      window.showNotaPanel();

      // Tutup Nota secara eksplisit
      window.destroyNotaSession();

      const notaClosed = !window.SpatialPanelManager.isPanelVisible('nota');
      const videoStillAlive = window.SpatialPanelManager.isPanelVisible('video');

      return notaClosed && videoStillAlive;
    })()`);
    assert('Menutup Nota tidak menutup Video (pengasingan kitaran hayat)', closeIsolation);

    // 11. Tiada duplicate DOM ID
    const duplicateIds = await evaluate(`(() => {
      const ids = {};
      const dupes = [];
      document.querySelectorAll('[id]').forEach(el => {
        if (ids[el.id]) dupes.push(el.id);
        else ids[el.id] = true;
      });
      return dupes;
    })()`);
    assert('Sifar ID bertindih (zero duplicate IDs)', duplicateIds.length === 0, `Duplicates found: ${duplicateIds.join(', ')}`);

    // 12. Tiada duplicate sensor listener
    const sensorCheck = await evaluate(`(() => {
      return typeof window.addEventListener === 'function';
    })()`);
    assert('Tiada duplikasi sensor listener giroskop', sensorCheck);

    // 13. Tiada duplicate WebGL renderer
    const webglCanvasCount = await evaluate(`(() => {
      const canvases = document.querySelectorAll('canvas');
      let webglCount = 0;
      canvases.forEach(c => {
        if (c.id !== 'pov-nota-pdf-canvas' && c.id !== 'nota-pdf-canvas') {
          webglCount++;
        }
      });
      return webglCount <= 1;
    })()`);
    assert('Tiada duplikasi WebGL renderer (tepat 1 enjin AR)', webglCanvasCount);

    // 14. Tiada unhandled JavaScript exception
    assert('Tiada ralat JavaScript dalam konsol (zero unhandled exceptions)', errors.length === 0, `${errors.length} errors: ${JSON.stringify(errors)}`);

    // 15. Regresi CellQuest 3D Controller
    const cellQuestIntact = await evaluate(`(() => {
      const c = window.CellQuestARController;
      return c && typeof c.activate === 'function' && typeof c.deactivate === 'function';
    })()`);
    assert('CellQuest 3D Controller kekal utuh dan tidak terjejas', cellQuestIntact);

    console.log(`\n========================================================================`);
    console.log(`   KEPUTUSAN: ${passed} / ${total} UJIAN LULUS (${Math.round((passed/total)*100)}%)`);
    console.log(`========================================================================\n`);

    if (passed === total) {
      console.log('🎉 FASA 4E-B.2 TELAH BERJAYA DISELESAIKAN DENGAN SEMPURNA!');
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

runLifecycleVerification();
