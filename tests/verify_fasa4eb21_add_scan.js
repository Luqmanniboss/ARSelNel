const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9338;

async function runAddScanVerification() {
  console.log('========================================================================');
  console.log('   VERIFIKASI FASA 4E-B.2.1: + TAMBAH IMBASAN BAHARU & MULTI-PANEL');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_4eb21_${Date.now()}`);

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
    // Tunggu halaman siap dimuatkan
    await evaluate(`new Promise(r => {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r);
    })`);

    // UJIAN 1: Struktur Multi-Panel Toolbar Wujud dalam DOM
    const barExists = await evaluate(`(() => {
      const bar = document.getElementById('ar-multi-panel-bar');
      const btnAdd = document.getElementById('btn-add-scan');
      const btnCancel = document.getElementById('btn-cancel-scan');
      const badge = document.getElementById('multi-panel-badge-count');
      const tagsList = document.getElementById('multi-panel-tags-list');
      return !!(bar && btnAdd && btnCancel && badge && tagsList);
    })()`);
    assert('Struktur Multi-Panel Toolbar wujud dalam DOM', barExists);

    // UJIAN 2: Initial Scan - Imbas Marker 0 (Video)
    const initialVideoScan = await evaluate(`(() => {
      const v = (window.KotakARSELNEL && window.KotakARSELNEL.ARState && window.KotakARSELNEL.ARState.videos[0]) || { id: 'v1', title: 'Video Sel', url: 'https://example.com/v1' };
      window.KotakARSELNEL.ARState.activeVideo = v;
      window.KotakARSELNEL.handleTargetFound(0, 'video');
      window.KotakARSELNEL.syncPOVVideoPlayer(v);
      const state = window.KotakARSELNEL.ARState;
      return {
        scanState: state.scanState,
        hasVideo: state.activePanels.has('video'),
        activeCount: state.activePanels.size
      };
    })()`);
    assert('Imbasan Marker Video mengaktifkan panel Video dan menetapkan scanState ke PANEL_ACTIVE',
      initialVideoScan.scanState === 'PANEL_ACTIVE' && initialVideoScan.hasVideo && initialVideoScan.activeCount === 1,
      JSON.stringify(initialVideoScan));

    // UJIAN 3: Perlindungan Sesi Semasa PANEL_ACTIVE (Pengesanan Marker Lain Disekat)
    const protectedScan = await evaluate(`(() => {
      // Cuba imbas marker Nota (Target 1) semasa PANEL_ACTIVE tanpa menekan + Tambah Imbasan
      window.KotakARSELNEL.handleTargetFound(1, 'nota');
      const state = window.KotakARSELNEL.ARState;
      const videoEl = window.KotakARSELNEL.getPanelElement('video');
      const videoVisible = videoEl && !videoEl.classList.contains('hidden');
      return {
        hasNota: state.activePanels.has('nota'),
        activeCount: state.activePanels.size,
        videoVisible: videoVisible
      };
    })()`);
    assert('Marker Nota TIDAK menggantikan paparan Video semasa panel Video sedang aktif (Perlindungan Sesi)',
      protectedScan.hasNota === false && protectedScan.activeCount === 1 && protectedScan.videoVisible === true,
      JSON.stringify(protectedScan));

    // UJIAN 4: Pengaktifan Mod "+ Tambah Imbasan Baharu"
    const addScanTrigger = await evaluate(`(() => {
      window.KotakARSELNEL.startAddPanelScan();
      const state = window.KotakARSELNEL.ARState;
      const btnAdd = document.getElementById('btn-add-scan');
      const btnCancel = document.getElementById('btn-cancel-scan');
      return {
        scanState: state.scanState,
        isAddPulsing: btnAdd.classList.contains('scanning-pulse'),
        isCancelVisible: !btnCancel.classList.contains('hidden')
      };
    })()`);
    assert('Tekan "+ Tambah Imbasan Baharu" menukar scanState ke ADD_PANEL dan memaparkan butang Batal',
      addScanTrigger.scanState === 'ADD_PANEL' && addScanTrigger.isAddPulsing && addScanTrigger.isCancelVisible,
      JSON.stringify(addScanTrigger));

    // UJIAN 5: Pengesanan Marker Tambahan dalam Mod ADD_PANEL (Menambah Nota Sebagai Panel Kedua)
    const addSecondPanel = await evaluate(`(() => {
      // Imbas marker Nota (Target 1) semasa dalam ADD_PANEL
      window.KotakARSELNEL.handleTargetFound(1, 'nota');
      const state = window.KotakARSELNEL.ARState;
      const videoEl = window.KotakARSELNEL.getPanelElement('video');
      const notaEl = window.KotakARSELNEL.getPanelElement('nota');
      return {
        scanState: state.scanState,
        activeCount: state.activePanels.size,
        hasVideo: state.activePanels.has('video'),
        hasNota: state.activePanels.has('nota'),
        videoVisible: videoEl && !videoEl.classList.contains('hidden'),
        notaVisible: notaEl && !notaEl.classList.contains('hidden')
      };
    })()`);
    assert('Pengesanan Marker Nota dalam ADD_PANEL menambah Nota sebagai panel kedua tanpa memadam Video',
      addSecondPanel.activeCount === 2 && addSecondPanel.hasVideo && addSecondPanel.hasNota && addSecondPanel.videoVisible && addSecondPanel.notaVisible,
      JSON.stringify(addSecondPanel));

    // UJIAN 6: Pengekalan Iframe/DOM Video Semasa Nota Ditambah
    const videoPersistence = await evaluate(`(() => {
      const povPlayer = document.getElementById('pov-player-frame');
      const hasContent = povPlayer && povPlayer.children.length > 0;
      const panelState = window.KotakARSELNEL.SpatialPanelManager.getPanel('video');
      return {
        hasContent: hasContent,
        isLoaded: panelState ? panelState.isLoaded : false,
        playbackState: panelState ? panelState.playbackState : null
      };
    })()`);
    assert('Sesi dan iframe Video kekal utuh dalam DOM tanpa dimusnahkan',
      videoPersistence.hasContent && videoPersistence.isLoaded,
      JSON.stringify(videoPersistence));

    // UJIAN 7: Susun Atur Posisi Spatial Sebelah-Menyebelah (Side-by-Side Spatial Layout)
    const spatialLayout = await evaluate(`(() => {
      const videoEl = window.KotakARSELNEL.getPanelElement('video');
      const notaEl = window.KotakARSELNEL.getPanelElement('nota');
      return {
        videoSpatialLeft: videoEl.classList.contains('spatial-left'),
        notaSpatialRight: notaEl.classList.contains('spatial-right')
      };
    })()`);
    assert('Kedudukan spatial sebelah-menyebelah digunakan (.spatial-left pada Video, .spatial-right pada Nota)',
      spatialLayout.videoSpatialLeft && spatialLayout.notaSpatialRight,
      JSON.stringify(spatialLayout));

    // UJIAN 8: Kemas Kini Bar Alat Multi-Panel HUD (Badge & Pills)
    const hudUpdate = await evaluate(`(() => {
      const badgeText = document.getElementById('multi-panel-count-text').textContent;
      const pills = document.querySelectorAll('#multi-panel-tags-list .multi-pill');
      const pillClasses = Array.from(pills).map(p => p.className);
      return {
        badgeText: badgeText,
        pillCount: pills.length,
        hasVideoPill: pillClasses.some(c => c.includes('pill-video')),
        hasNotaPill: pillClasses.some(c => c.includes('pill-nota'))
      };
    })()`);
    assert('Multi-panel HUD memaparkan 2 panel aktif berserta pil interaktif Video & Nota',
      hudUpdate.badgeText.includes('2 Panel Aktif') && hudUpdate.pillCount === 2 && hudUpdate.hasVideoPill && hudUpdate.hasNotaPill,
      JSON.stringify(hudUpdate));

    // UJIAN 9: Butang Batal Imbasan
    const cancelScanTest = await evaluate(`(() => {
      // Simulasikan 1 panel aktif dahulu
      window.KotakARSELNEL.ARState.activePanels = new Set(['video']);
      window.KotakARSELNEL.setScanState('ADD_PANEL');
      window.KotakARSELNEL.cancelAddPanelScan();
      const state = window.KotakARSELNEL.ARState;
      const btnCancel = document.getElementById('btn-cancel-scan');
      return {
        scanState: state.scanState,
        cancelHidden: btnCancel.classList.contains('hidden')
      };
    })()`);
    assert('Fungsi "Batal Imbasan" mengembalikan state ke PANEL_ACTIVE dan menyembunyikan butang Batal',
      cancelScanTest.scanState === 'PANEL_ACTIVE' && cancelScanTest.cancelHidden,
      JSON.stringify(cancelScanTest));

    // UJIAN 10: Penutupan Bebas Panel Nota dari Pil (Video Kekal)
    const closeNotaTest = await evaluate(`(() => {
      // Set semula 2 panel aktif
      window.KotakARSELNEL.ARState.activePanels = new Set(['video', 'nota']);
      window.KotakARSELNEL.arrangeMultiPanelSpatialLayout();
      window.KotakARSELNEL.updateMultiPanelUI();

      // Tutup nota
      window.KotakARSELNEL.destroyNotaSession();
      const state = window.KotakARSELNEL.ARState;
      const videoEl = window.KotakARSELNEL.getPanelElement('video');
      const notaEl = window.KotakARSELNEL.getPanelElement('nota');
      return {
        activeCount: state.activePanels.size,
        hasVideo: state.activePanels.has('video'),
        hasNota: state.activePanels.has('nota'),
        videoVisible: videoEl && !videoEl.classList.contains('hidden'),
        notaHidden: notaEl && notaEl.classList.contains('hidden'),
        badgeText: document.getElementById('multi-panel-count-text').textContent
      };
    })()`);
    assert('Menutup Nota tidak menutup atau mengganggu sesi panel Video',
      closeNotaTest.activeCount === 1 && closeNotaTest.hasVideo && !closeNotaTest.hasNota && closeNotaTest.videoVisible && closeNotaTest.notaHidden && closeNotaTest.badgeText.includes('1 Panel Aktif'),
      JSON.stringify(closeNotaTest));

    // UJIAN 11: Penutupan Bebas Panel Video (Nota Kekal)
    const closeVideoTest = await evaluate(`(() => {
      // Set semula 2 panel aktif
      window.KotakARSELNEL.ARState.activePanels = new Set(['video', 'nota']);
      window.KotakARSELNEL.showVideoPanel();
      window.KotakARSELNEL.showNotaPanel();

      // Tutup video
      window.KotakARSELNEL.destroyVideoSession();
      const state = window.KotakARSELNEL.ARState;
      const videoEl = window.KotakARSELNEL.getPanelElement('video');
      const notaEl = window.KotakARSELNEL.getPanelElement('nota');
      return {
        activeCount: state.activePanels.size,
        hasVideo: state.activePanels.has('video'),
        hasNota: state.activePanels.has('nota'),
        videoHidden: videoEl && videoEl.classList.contains('hidden'),
        notaVisible: notaEl && !notaEl.classList.contains('hidden')
      };
    })()`);
    assert('Menutup Video tidak menutup atau mengganggu sesi panel Nota',
      closeVideoTest.activeCount === 1 && !closeVideoTest.hasVideo && closeVideoTest.hasNota && closeVideoTest.videoHidden && closeVideoTest.notaVisible,
      JSON.stringify(closeVideoTest));

    // UJIAN 12: Pengesanan Automatik Anchor Kelihatan (checkCurrentlyVisibleAnchors)
    const visibleAnchorDetection = await evaluate(`(() => {
      window.KotakARSELNEL.ARState.activePanels = new Set(['video']);
      window.KotakARSELNEL.ARState.anchorNota = { group: { visible: true } };
      window.KotakARSELNEL.setScanState('ADD_PANEL'); // auto-trigger checkCurrentlyVisibleAnchors
      const state = window.KotakARSELNEL.ARState;
      return {
        autoAddedNota: state.activePanels.has('nota'),
        scanState: state.scanState
      };
    })()`);
    assert('checkCurrentlyVisibleAnchors menambah panel serta-merta jika marker sudah kelihatan dalam kamera',
      visibleAnchorDetection.autoAddedNota && visibleAnchorDetection.scanState === 'PANEL_ACTIVE',
      JSON.stringify(visibleAnchorDetection));

    // UJIAN 13: Sifar Duplikasi ID DOM
    const duplicateIds = await evaluate(`(() => {
      const allEls = document.querySelectorAll('[id]');
      const seen = new Set();
      const dups = [];
      allEls.forEach(el => {
        if (seen.has(el.id)) dups.push(el.id);
        seen.add(el.id);
      });
      return dups;
    })()`);
    assert('Sifar duplikasi ID DOM (zero duplicate IDs)',
      duplicateIds.length === 0,
      `ID bertindih: ${duplicateIds.join(', ')}`);

    // UJIAN 14: Sifar Ralat JavaScript / Pengecualian Konsol
    assert('Sifar ralat JavaScript konsol (zero unhandled exceptions)',
      errors.length === 0,
      JSON.stringify(errors));

    console.log('\n========================================================================');
    console.log(`   KEPUTUSAN: ${passed} / ${total} UJIAN LULUS (${Math.round((passed / total) * 100)}%)`);
    console.log('========================================================================\n');

    if (passed === total) {
      console.log('🎉 FASA 4E-B.2.1 TELAH BERJAYA DISELESAIKAN DENGAN SEMPURNA!\n');
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

runAddScanVerification();

