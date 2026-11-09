const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9340;

async function runRestoreFlowVerification() {
  console.log('========================================================================');
  console.log('   VERIFIKASI FASA 4E-B.2.2: PEMULIHAN ALIRAN IMBASAN ASAL & REGRESI SEBENAR');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_4eb22_${Date.now()}`);

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1200,800',
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
    // Tunggu inisialisasi async CMS siap dimuatkan sepenuhnya
    await evaluate(`new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (window.KotakARSELNEL && window.KotakARSELNEL.state && 
            Array.isArray(window.KotakARSELNEL.state.videos) && window.KotakARSELNEL.state.videos.length > 0 &&
            Array.isArray(window.KotakARSELNEL.state.notes) && window.KotakARSELNEL.state.notes.length > 0) {
          resolve();
        } else if (Date.now() - start > 10000) {
          reject(new Error('Timeout menunggu inisialisasi videos/notes CMS'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })`);

    // LANGKAH 1 & 2: Imbas Marker Video (Marker 0) -> Pemilih Video asal MUNCUL (Bukan kad POV)
    const scanVideo = await evaluate(`(() => {
      // Pastikan belum ada video dipilih (seperti imbasan pertama kali oleh murid)
      window.KotakARSELNEL.state.activeVideo = null;
      window.KotakARSELNEL.handleTargetFound(0, 'video');

      const floatingAnchor = document.getElementById('floating-ar-anchor');
      const povPanelVideo = document.getElementById('pov-panel-video');
      const videoSelectionView = document.getElementById('video-selection-view');
      const cardsScroll = document.getElementById('video-cards-scroll');
      const cardsCount = cardsScroll ? cardsScroll.querySelectorAll('.ar-video-item').length : 0;

      return {
        floatingVisible: floatingAnchor && floatingAnchor.classList.contains('is-visible'),
        povPanelHidden: povPanelVideo && povPanelVideo.classList.contains('hidden'),
        selectionDisplay: videoSelectionView ? window.getComputedStyle(videoSelectionView).display : null,
        cardsCount: cardsCount,
        systemMode: window.KotakARSELNEL.state.systemMode
      };
    })()`);

    assert('Langkah 1 & 2: Imbas Marker Video memaparkan pemilih Video asal dalam floating anchor',
      scanVideo.floatingVisible && scanVideo.povPanelHidden && scanVideo.selectionDisplay === 'flex' && scanVideo.cardsCount > 0 && scanVideo.systemMode === 'MARKER',
      JSON.stringify(scanVideo));

    // LANGKAH 3 & 4: Pilih Video -> Video sebenar dimainkan dalam player
    const selectVideoTest = await evaluate(`(() => {
      const v = window.KotakARSELNEL.state.videos[0];
      window.KotakARSELNEL.selectVideo(v);

      const activePlayerView = document.getElementById('active-player-view');
      const playerFrame = document.getElementById('ar-player-frame');
      const hasIframeOrVideo = playerFrame && (playerFrame.querySelector('iframe') || playerFrame.querySelector('video'));
      const videoTitle = document.getElementById('player-video-title').textContent;

      return {
        playerActive: activePlayerView && activePlayerView.classList.contains('is-active'),
        hasPlayerElement: !!hasIframeOrVideo,
        videoTitle: videoTitle,
        hasActiveVideo: !!window.KotakARSELNEL.state.activeVideo
      };
    })()`);

    assert('Langkah 3 & 4: Memilih video memaparkan pemain video sebenar (YouTube/HTML5)',
      selectVideoTest.playerActive && selectVideoTest.hasPlayerElement && selectVideoTest.hasActiveVideo,
      JSON.stringify(selectVideoTest));

    // LANGKAH 5: Kawalan POV masih berfungsi (Tekan Kunci POV -> Masuk POV_SETUP)
    const povControls = await evaluate(`(async () => {
      await window.KotakARSELNEL.startPOVMode();
      const state = window.KotakARSELNEL.state;
      const povPanel = document.getElementById('pov-panel-video');
      const povPlayer = document.getElementById('pov-player-frame');
      const hasContentInPOV = povPlayer && (povPlayer.querySelector('iframe') || povPlayer.querySelector('video'));

      return {
        systemMode: state.systemMode,
        povPanelVisible: povPanel && !povPanel.classList.contains('hidden'),
        hasContentInPOV: !!hasContentInPOV
      };
    })()`);

    assert('Langkah 5: Kawalan Kunci POV memulakan mod POV_SETUP dengan video pemain diselaraskan',
      povControls.systemMode === 'POV_SETUP' && povControls.povPanelVisible && povControls.hasContentInPOV,
      JSON.stringify(povControls));

    // LANGKAH 6 & 7: Tekan "Letak di Arah Ini" -> Video kekal dalam sesi (POV_LOCKED)
    const anchorPOVTest = await evaluate(`(() => {
      // Simulasikan penguncian arah
      window.KotakARSELNEL.state.pov.isSimulated = true;
      window.KotakARSELNEL.anchorPOVAtCurrentHeading();
      const state = window.KotakARSELNEL.state;
      const povPlayer = document.getElementById('pov-player-frame');
      return {
        systemMode: state.systemMode,
        hasPlayer: povPlayer && povPlayer.children.length > 0,
        activeVideoId: state.activeVideo ? state.activeVideo.id : null
      };
    })()`);

    assert('Langkah 6 & 7: Tekan "Letak di Arah Ini" mengunci POV dan video kekal dalam sesi',
      anchorPOVTest.systemMode === 'POV_LOCKED' && anchorPOVTest.hasPlayer && anchorPOVTest.activeVideoId !== null,
      JSON.stringify(anchorPOVTest));

    // LANGKAH 8: Tekan "+ Tambah Imbasan Baharu"
    const addScanTest = await evaluate(`(() => {
      window.KotakARSELNEL.startAddPanelScan();
      const state = window.KotakARSELNEL.state;
      const btnAdd = document.getElementById('btn-add-scan');
      const btnCancel = document.getElementById('btn-cancel-scan');
      return {
        scanState: state.scanState,
        btnAddPulsing: btnAdd.classList.contains('scanning-pulse'),
        btnCancelVisible: !btnCancel.classList.contains('hidden')
      };
    })()`);

    assert('Langkah 8: Tekan "+ Tambah Imbasan Baharu" mengaktifkan scanState ADD_PANEL',
      addScanTest.scanState === 'ADD_PANEL' && addScanTest.btnAddPulsing && addScanTest.btnCancelVisible,
      JSON.stringify(addScanTest));

    // LANGKAH 9 & 10: Imbas Marker Nota (Target 1) -> Pemilih/Pembaca Nota asal muncul sebagai panel kedua
    const scanNotaSecond = await evaluate(`(() => {
      // Reset activeNote supaya pemilih nota dipaparkan secara tulen
      window.KotakARSELNEL.state.activeNote = null;
      window.KotakARSELNEL.handleTargetFound(1, 'nota');

      const notaPanel = document.getElementById('pov-panel-nota');
      const notaSelection = document.getElementById('pov-nota-selection-view');
      const cardsScroll = document.getElementById('pov-nota-cards-scroll');
      const cardsCount = cardsScroll ? cardsScroll.querySelectorAll('.nota-item-card').length : 0;

      return {
        notaPanelVisible: notaPanel && !notaPanel.classList.contains('hidden'),
        selectionVisible: notaSelection && !notaSelection.classList.contains('hidden'),
        cardsCount: cardsCount,
        hasNotaPanel: window.KotakARSELNEL.state.activePanels.has('nota')
      };
    })()`);

    assert('Langkah 9 & 10: Imbas Marker Nota dalam ADD_PANEL memaparkan pemilih Nota asal sebagai panel kedua',
      scanNotaSecond.notaPanelVisible && scanNotaSecond.selectionVisible && scanNotaSecond.cardsCount > 0 && scanNotaSecond.hasNotaPanel,
      JSON.stringify(scanNotaSecond));

    // LANGKAH 11 & 12: Pilih Nota -> Kandungan Nota sebenar dipaparkan
    const selectNotaTest = await evaluate(`(() => {
      const note = window.KotakARSELNEL.state.notes[0];
      window.KotakARSELNEL.selectNote(note);

      const activeNotaView = document.getElementById('pov-active-nota-view');
      const selectionView = document.getElementById('pov-nota-selection-view');
      const noteTitle = document.getElementById('pov-nota-title').textContent;

      return {
        activeNotaVisible: activeNotaView && !activeNotaView.classList.contains('hidden'),
        selectionHidden: selectionView && selectionView.classList.contains('hidden'),
        hasTitle: !!noteTitle,
        hasActiveNote: !!window.KotakARSELNEL.state.activeNote
      };
    })()`);

    assert('Langkah 11 & 12: Memilih nota memaparkan kandungan pembaca nota sebenar',
      selectNotaTest.activeNotaVisible && selectNotaTest.selectionHidden && selectNotaTest.hasTitle && selectNotaTest.hasActiveNote,
      JSON.stringify(selectNotaTest));

    // LANGKAH 13: Video TIDAK dimusnahkan (Sesi Video kekal utuh)
    const videoPreserved = await evaluate(`(() => {
      const povPlayer = document.getElementById('pov-player-frame');
      const videoPanel = document.getElementById('pov-panel-video');
      const hasPlayer = povPlayer && povPlayer.children.length > 0;
      return {
        hasVideoPanel: window.KotakARSELNEL.state.activePanels.has('video'),
        videoPanelVisible: videoPanel && !videoPanel.classList.contains('hidden'),
        hasPlayer: hasPlayer
      };
    })()`);

    assert('Langkah 13: Sesi Video TIDAK dimusnahkan semasa Nota ditambah',
      videoPreserved.hasVideoPanel && videoPreserved.videoPanelVisible && videoPreserved.hasPlayer,
      JSON.stringify(videoPreserved));

    // LANGKAH 14: Nota TIDAK menggantikan Video (Dua-dua wujud serentak)
    const dualCoexistence = await evaluate(`(() => {
      const activeCount = window.KotakARSELNEL.state.activePanels.size;
      const badgeText = document.getElementById('multi-panel-count-text').textContent;
      return {
        activeCount: activeCount,
        badgeText: badgeText
      };
    })()`);

    assert('Langkah 14: Nota TIDAK menggantikan Video (2 Panel Aktif Serentak)',
      dualCoexistence.activeCount === 2 && dualCoexistence.badgeText.includes('2 Panel Aktif'),
      JSON.stringify(dualCoexistence));

    // LANGKAH 15: Menutup Nota tidak menutup Video
    const closeNotaTest = await evaluate(`(() => {
      window.KotakARSELNEL.destroyNotaSession();
      const state = window.KotakARSELNEL.state;
      const videoPanel = document.getElementById('pov-panel-video');
      const notaPanel = document.getElementById('pov-panel-nota');
      return {
        hasVideo: state.activePanels.has('video'),
        hasNota: state.activePanels.has('nota'),
        videoVisible: videoPanel && !videoPanel.classList.contains('hidden'),
        notaHidden: notaPanel && notaPanel.classList.contains('hidden'),
        activeCount: state.activePanels.size
      };
    })()`);

    assert('Langkah 15: Menutup Nota TIDAK menutup atau memusnahkan sesi panel Video',
      closeNotaTest.hasVideo && !closeNotaTest.hasNota && closeNotaTest.videoVisible && closeNotaTest.notaHidden && closeNotaTest.activeCount === 1,
      JSON.stringify(closeNotaTest));

    // LANGKAH 16: Menutup Video tidak menutup Nota
    const closeVideoTest = await evaluate(`(() => {
      // Buka semula nota
      window.KotakARSELNEL.state.activePanels.add('nota');
      window.KotakARSELNEL.showNotaPanel();

      // Tutup video
      window.KotakARSELNEL.destroyVideoSession();
      const state = window.KotakARSELNEL.state;
      const videoPanel = document.getElementById('pov-panel-video');
      const notaPanel = document.getElementById('pov-panel-nota');
      return {
        hasVideo: state.activePanels.has('video'),
        hasNota: state.activePanels.has('nota'),
        videoHidden: videoPanel && videoPanel.classList.contains('hidden'),
        notaVisible: notaPanel && !notaPanel.classList.contains('hidden'),
        activeCount: state.activePanels.size
      };
    })()`);

    assert('Langkah 16: Menutup Video TIDAK menutup atau memusnahkan sesi panel Nota',
      !closeVideoTest.hasVideo && closeVideoTest.hasNota && closeVideoTest.videoHidden && closeVideoTest.notaVisible && closeVideoTest.activeCount === 1,
      JSON.stringify(closeVideoTest));

    // LANGKAH 17: Tiada Panel Kosong, Tiada Layout Rigid Kiri/Kanan yang Memaksa (!important)
    const cssCleanliness = await evaluate(`(() => {
      const videoEl = document.getElementById('pov-panel-video');
      const notaEl = document.getElementById('pov-panel-nota');
      const hasForcedLeftVideo = videoEl.classList.contains('spatial-left');
      const hasForcedRightNota = notaEl.classList.contains('spatial-right');
      return {
        hasForcedLeftVideo: hasForcedLeftVideo,
        hasForcedRightNota: hasForcedRightNota
      };
    })()`);

    assert('Langkah 17: Susun atur spatial tidak memaksa kedudukan rigid (.spatial-left / .spatial-right)',
      !cssCleanliness.hasForcedLeftVideo && !cssCleanliness.hasForcedRightNota,
      JSON.stringify(cssCleanliness));

    // Tangkap layar bukti pemulihan aliran asal
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(__dirname, '..', 'kotak_arselnel_fasa4eb22_verified.png');
    const artPath = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_fasa4eb22_verified.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    fs.writeFileSync(artPath, Buffer.from(shot.data, 'base64'));

    // LANGKAH 18: Sifar Pengecualian Konsol / Ralat JavaScript
    assert('Langkah 18: Sifar ralat JavaScript konsol (zero unhandled exceptions)',
      errors.length === 0,
      JSON.stringify(errors));

    console.log('\n========================================================================');
    console.log(`   KEPUTUSAN: ${passed} / ${total} UJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 FASA 4E-B.2.2 TELAH BERJAYA DISELESAIKAN DENGAN SEMPURNA!\n');
    } else {
      process.exitCode = 1;
    }

  } catch (err) {
    console.error('Ralat verifikasi:', err);
    process.exitCode = 1;
  } finally {
    try { ws.close(); } catch (e) {}
    cleanup();
  }
}

runRestoreFlowVerification();
