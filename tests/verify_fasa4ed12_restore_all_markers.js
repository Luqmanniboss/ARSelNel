/**
 * tests/verify_fasa4ed12_restore_all_markers.js
 *
 * UJIAN KOMPREHENSIF HOTFIX FASA 4E-D.1.2:
 * Memulihkan Video, Nota, Kuiz, dan Sel Haiwan tanpa menjejaskan Sel Tumbuhan.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');
const CDP_PORT = 9385;

let msgId = 1;

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (err) {}
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInPage(ws, expr) {
  const res = await sendCDP(ws, 'Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true
  });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception.description || 'Evaluation error');
  }
  return res.result.value;
}

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  }
}

async function run() {
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — HOTFIX FASA 4E-D.1.2: VERIFIKASI SEMUA 5 TARGET');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4ed12_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1280,800',
    'http://localhost:3000/kotak_arselnel/code.html'
  ], { detached: false });

  try {
    await new Promise(r => setTimeout(r, 3500));

    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('kotak_arselnel'));
    if (!pageTarget) throw new Error('Halaman Kotak ARSELNEL tidak dijumpai dalam target browser');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    await sendCDP(ws, 'Runtime.enable');
    await sendCDP(ws, 'Page.enable');

    await new Promise(r => setTimeout(r, 2000));

    // -------------------------------------------------------------------------
    // 1. SEMAK KANONIKAL PENDAFTARAN 5 TARGET
    // -------------------------------------------------------------------------
    console.log('--- 1. PENGESAHAN 5 SASARAN TARGET DALAM RUNTIME MINDAR ---');
    const targetStatus = await evalInPage(ws, `
      ({
        hasTarget0: !!ARState.anchorVideo,
        hasTarget1: !!ARState.anchorNota,
        hasTarget2: !!ARState.anchorKuiz,
        hasTarget3: !!ARState.anchorCellQuestAnimal,
        hasTarget4: !!ARState.anchorCellQuestPlant,
        hasAnchorCQDefault: !!ARState.anchorCellQuest
      })
    `);
    assert(targetStatus.hasTarget0, 'Target 0 (Video) anchor didaftarkan');
    assert(targetStatus.hasTarget1, 'Target 1 (Nota) anchor didaftarkan');
    assert(targetStatus.hasTarget2, 'Target 2 (Kuiz) anchor didaftarkan');
    assert(targetStatus.hasTarget3, 'Target 3 (Sel Haiwan) anchor didaftarkan');
    assert(targetStatus.hasTarget4, 'Target 4 (Sel Tumbuhan) anchor didaftarkan');
    assert(targetStatus.hasAnchorCQDefault, 'Anchor CellQuest lalai dipautkan dengan betul');

    // -------------------------------------------------------------------------
    // 2. ALIRAN TARGET 0: VIDEO (BUKA -> PILIH -> LOCK POV -> TUTUP -> IMBAS SEMULA)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. ALIRAN TARGET 0: VIDEO (BUKA -> PILIH -> LOCK POV -> TUTUP -> IMBAS SEMULA) ---');
    const videoFlow = await evalInPage(ws, `
      (async () => {
        window.handleTargetFound(0, 'video');
        if (ARState.videos && ARState.videos.length > 0) {
          window.selectVideo(ARState.videos[0]);
        }
        if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') {
          await window.KotakARSELNEL.startPOVMode();
        } else {
          document.getElementById('btn-switch-to-pov').click();
        }
        document.getElementById('pov-btn-anchor').click();

        const el = document.getElementById('pov-panel-video');
        const p = SpatialPanelManager.getPanel('video');
        const playerView = document.getElementById('pov-active-player-view');
        return {
          activePanels: Array.from(ARState.activePanels),
          panelVisible: el && !el.classList.contains('hidden'),
          opacity: el ? el.style.opacity : null,
          isLocked: p && p.isLocked,
          activeVideo: !!ARState.activeVideo,
          playerVisible: playerView && !playerView.classList.contains('hidden')
        };
      })()
    `);
    assert(videoFlow.activePanels.includes('video'), 'Target 0 mendaftar modul video ke activePanels');
    assert(videoFlow.panelVisible, 'DOM panel video dipaparkan (#pov-panel-video)');
    assert(videoFlow.isLocked, 'Video berjaya dikunci dalam mod POV (isLocked: true)');
    assert(videoFlow.playerVisible, 'Pemain video aktif kelihatan');

    // Tutup panel Video
    const videoClose = await evalInPage(ws, `
      (() => {
        window.destroyVideoSession();
        const el = document.getElementById('pov-panel-video');
        return {
          activePanels: Array.from(ARState.activePanels),
          hasHidden: el.classList.contains('hidden'),
          opacity: el.style.opacity
        };
      })()
    `);
    assert(!videoClose.activePanels.includes('video'), 'Video berjaya dikeluarkan dari activePanels');
    assert(videoClose.hasHidden, 'DOM panel video disembunyikan (.hidden)');
    assert(videoClose.opacity === '0', 'Opacity diset kepada 0 semasa pemusnahan');

    // Imbas semula Video & Lock POV
    const videoRescan = await evalInPage(ws, `
      (async () => {
        ARState.markerCooldown = {};
        window.handleTargetFound(0, 'video');
        if (ARState.videos && ARState.videos.length > 0) {
          window.selectVideo(ARState.videos[0]);
        }
        if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') {
          await window.KotakARSELNEL.startPOVMode();
        } else {
          document.getElementById('btn-switch-to-pov').click();
        }
        document.getElementById('pov-btn-anchor').click();

        const el = document.getElementById('pov-panel-video');
        const p = SpatialPanelManager.getPanel('video');
        const playerView = document.getElementById('pov-active-player-view');
        return {
          activePanels: Array.from(ARState.activePanels),
          hasHidden: el.classList.contains('hidden'),
          opacity: el.style.opacity,
          pointerEvents: el.style.pointerEvents,
          isLocked: p && p.isLocked,
          playerVisible: playerView && !playerView.classList.contains('hidden')
        };
      })()
    `);
    assert(videoRescan.activePanels.includes('video'), 'Video boleh diimbas semula dengan sah');
    assert(!videoRescan.hasHidden, 'Panel Video muncul semula tanpa kelas .hidden');
    assert(videoRescan.opacity === '1', 'Opacity dipulihkan semula ke "1"');
    assert(videoRescan.isLocked, 'Video dikunci semula dalam mod POV');
    assert(videoRescan.playerVisible, 'Pemain video aktif kelihatan semula');

    // -------------------------------------------------------------------------
    // 3. ALIRAN TARGET 1: NOTA INTERAKTIF
    // -------------------------------------------------------------------------
    console.log('\n--- 3. ALIRAN TARGET 1: NOTA (TAMBAH IMBASAN -> LOCK POV) ---');
    const notaFlow = await evalInPage(ws, `
      (() => {
        window.startAddPanelScan();
        ARState.markerCooldown = {};
        window.handleTargetFound(1, 'nota');
        if (ARState.notes && ARState.notes.length > 0) {
          window.selectNote(ARState.notes[0]);
        }
        document.getElementById('pov-nota-btn-anchor').click();

        const el = document.getElementById('pov-panel-nota');
        const p = SpatialPanelManager.getPanel('nota');
        const notaView = document.getElementById('pov-active-nota-view');
        return {
          activePanels: Array.from(ARState.activePanels),
          hasNota: ARState.activePanels.has('nota'),
          panelVisible: el && !el.classList.contains('hidden'),
          opacity: el ? el.style.opacity : null,
          isLocked: p && p.isLocked,
          notaViewVisible: notaView && !notaView.classList.contains('hidden')
        };
      })()
    `);
    assert(notaFlow.hasNota, 'Target 1 mendaftar modul nota ke activePanels bersama Video');
    assert(notaFlow.panelVisible, 'DOM panel nota dipaparkan (#pov-panel-nota)');
    assert(notaFlow.isLocked, 'Nota berjaya dikunci dalam mod POV');
    assert(notaFlow.notaViewVisible, 'Kandungan nota interaktif kelihatan');

    // Semak Video KEKAL kelihatan dan pemain tidak blank semasa Nota dibuka
    const videoPreserved = await evalInPage(ws, `
      (() => {
        const vidPanel = document.getElementById('pov-panel-video');
        const playerView = document.getElementById('pov-active-player-view');
        return {
          videoInPanels: ARState.activePanels.has('video'),
          videoVisible: vidPanel && !vidPanel.classList.contains('hidden'),
          playerFrameVisible: playerView && !playerView.classList.contains('hidden')
        };
      })()
    `);
    assert(videoPreserved.videoInPanels && videoPreserved.videoVisible, 'Panel Video KEKAL wujud dan kelihatan apabila Nota dibuka');
    assert(videoPreserved.playerFrameVisible, 'Player view Video TIDAK dikosongkan/blank apabila Nota aktif');

    // -------------------------------------------------------------------------
    // 4. ALIRAN TARGET 2: KUIZ & PERMAINAN
    // -------------------------------------------------------------------------
    console.log('\n--- 4. ALIRAN TARGET 2: KUIZ (TAMBAH IMBASAN -> 5 PERMAINAN -> LOCK POV) ---');
    const kuizFlow = await evalInPage(ws, `
      (() => {
        window.startAddPanelScan();
        ARState.markerCooldown = {};
        window.handleTargetFound(2, 'kuiz');
        document.getElementById('pov-kuiz-btn-anchor').click();

        const el = document.getElementById('pov-panel-kuiz');
        const cat = document.getElementById('pov-kuiz-selection-view');
        const p = SpatialPanelManager.getPanel('kuiz');
        return {
          activePanels: Array.from(ARState.activePanels),
          hasKuiz: ARState.activePanels.has('kuiz'),
          panelVisible: el && !el.classList.contains('hidden'),
          opacity: el ? el.style.opacity : null,
          catalogVisible: cat && !cat.classList.contains('hidden'),
          isLocked: p && p.isLocked
        };
      })()
    `);
    assert(kuizFlow.hasKuiz, 'Target 2 mendaftar modul kuiz ke activePanels (3 panel aktif)');
    assert(kuizFlow.panelVisible, 'DOM panel Kuiz dipaparkan (#pov-panel-kuiz)');
    assert(kuizFlow.isLocked, 'Kuiz berjaya dikunci dalam mod POV bebas');
    assert(kuizFlow.catalogVisible, 'Katalog 5 Permainan Sains dipaparkan dalam panel Kuiz');

    // -------------------------------------------------------------------------
    // 5. ALIRAN TARGET 3 (SEL HAIWAN) & TARGET 4 (SEL TUMBUHAN)
    // -------------------------------------------------------------------------
    console.log('\n--- 5. ALIRAN TARGET 3 (SEL HAIWAN) & TARGET 4 (SEL TUMBUHAN) ---');
    const animalFlow = await evalInPage(ws, `
      (() => {
        window.startAddPanelScan();
        ARState.markerCooldown = {};
        window.handleTargetFound(3, 'cellquest', 'animal');
        const vid = document.getElementById('pov-panel-video');
        const not = document.getElementById('pov-panel-nota');
        const kui = document.getElementById('pov-panel-kuiz');
        const hud = document.getElementById('cq-hud-cell-name');
        const countEl = document.getElementById('multi-panel-count-text') || document.getElementById('ar-multi-panel-count');
        return {
          activePanels: Array.from(ARState.activePanels),
          cellQuestActive: typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive,
          activeCellType: typeof CellQuestARController !== 'undefined' ? CellQuestARController.activeCellType : null,
          hudTitle: hud ? hud.textContent : null,
          videoVisible: vid && !vid.classList.contains('hidden'),
          notaVisible: not && !not.classList.contains('hidden'),
          kuizVisible: kui && !kui.classList.contains('hidden'),
          toolbarText: countEl ? countEl.textContent : ''
        };
      })()
    `);
    assert(animalFlow.activePanels.includes('cellquest'), 'CellQuest didaftarkan ke activePanels (4 modul serentak!)');
    assert(animalFlow.cellQuestActive, 'CellQuestARController diaktifkan');
    assert(animalFlow.activeCellType === 'animal', 'Target 3 mengaktifkan model Sel Haiwan (animal)');
    assert(animalFlow.hudTitle && animalFlow.hudTitle.includes('Haiwan'), 'HUD memaparkan Sel Haiwan 3D');
    assert(animalFlow.videoVisible, 'Panel Video KEKAL kelihatan bersama Sel Haiwan');
    assert(animalFlow.notaVisible, 'Panel Nota KEKAL kelihatan bersama Sel Haiwan');
    assert(animalFlow.kuizVisible, 'Panel Kuiz KEKAL kelihatan bersama Sel Haiwan');
    assert(animalFlow.toolbarText.includes('4 Modul'), 'Toolbar memaparkan "4 Modul Aktif"');

    // Uji penutupan CellQuest untuk bertukar ke Sel Tumbuhan
    const cellquestClose = await evalInPage(ws, `
      (() => {
        window.destroyCellQuestSession();
        return {
          activePanels: Array.from(ARState.activePanels),
          cellQuestActive: typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive,
          videoRemains: ARState.activePanels.has('video'),
          notaRemains: ARState.activePanels.has('nota'),
          kuizRemains: ARState.activePanels.has('kuiz')
        };
      })()
    `);
    assert(!cellquestClose.cellQuestActive, 'CellQuestARController berjaya dinyahaktifkan');
    assert(!cellquestClose.activePanels.includes('cellquest'), 'CellQuest dikeluarkan dari activePanels');
    assert(cellquestClose.videoRemains && cellquestClose.notaRemains && cellquestClose.kuizRemains, 'Ketiga-tiga panel Video, Nota, dan Kuiz KEKAL aktif');

    // Imbas Target 4 (Sel Tumbuhan)
    const plantFlow = await evalInPage(ws, `
      (() => {
        window.startAddPanelScan();
        ARState.markerCooldown = {};
        window.handleTargetFound(4, 'cellquest', 'plant');
        const hud = document.getElementById('cq-hud-cell-name');
        return {
          activeCellType: typeof CellQuestARController !== 'undefined' ? CellQuestARController.activeCellType : null,
          hudTitle: hud ? hud.textContent : null,
          cellQuestActive: typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive,
          activePanelsCount: ARState.activePanels.size
        };
      })()
    `);
    assert(plantFlow.activeCellType === 'plant', 'Target 4 mengaktifkan model Sel Tumbuhan (plant)');
    assert(plantFlow.hudTitle && plantFlow.hudTitle.includes('Tumbuhan'), 'HUD memaparkan Sel Tumbuhan 3D');
    assert(plantFlow.cellQuestActive, 'CellQuestARController kekal aktif untuk Sel Tumbuhan');
    assert(plantFlow.activePanelsCount === 4, '4 modul aktif bersama Sel Tumbuhan');

    // -------------------------------------------------------------------------
    // 6. INTEGRITI PAPARAN DALAMAN (TIADA BLANKING SEMASA FOKUS)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. INTEGRITI PAPARAN DALAMAN (TIADA BLANKING SEMASA FOKUS) ---');
    const innerViewCheck = await evalInPage(ws, `
      (() => {
        const notaView = document.getElementById('pov-active-nota-view');
        const playerView = document.getElementById('pov-active-player-view');
        const catView = document.getElementById('pov-kuiz-selection-view');

        window.focusPanel('nota');
        const notaCheck = {
          notaPlayerVisible: notaView ? !notaView.classList.contains('hidden') : false,
          videoPlayerVisible: playerView ? !playerView.classList.contains('hidden') : false,
          kuizCatalogVisible: catView ? !catView.classList.contains('hidden') : false
        };
        window.focusPanel('video');
        const videoCheck = {
          notaPlayerVisible: notaView ? !notaView.classList.contains('hidden') : false,
          videoPlayerVisible: playerView ? !playerView.classList.contains('hidden') : false
        };
        window.focusPanel('kuiz');
        const kuizCheck = {
          kuizCatalogVisible: catView ? !catView.classList.contains('hidden') : false,
          videoPlayerVisible: playerView ? !playerView.classList.contains('hidden') : false,
          notaPlayerVisible: notaView ? !notaView.classList.contains('hidden') : false
        };
        return {
          notaCheck,
          videoCheck,
          kuizCheck
        };
      })()
    `);

    assert(innerViewCheck.notaCheck.notaPlayerVisible, 'Pemandangan Nota KEKAL kelihatan semasa fokus pada Nota');
    assert(innerViewCheck.notaCheck.videoPlayerVisible, 'Pemandangan Video KEKAL kelihatan apabila Nota difokuskan (tidak blank)');
    assert(innerViewCheck.videoCheck.videoPlayerVisible, 'Pemandangan Video KEKAL kelihatan semasa fokus pada Video');
    assert(innerViewCheck.kuizCheck.kuizCatalogVisible, 'Pemandangan Kuiz KEKAL kelihatan semasa fokus pada Kuiz');

    // -------------------------------------------------------------------------
    // 7. INTEGRITI TUNGGAL THREE.JS & SIFAR DUPLIKASI KAMERA
    // -------------------------------------------------------------------------
    console.log('\n--- 7. INTEGRITI TUNGGAL THREE.JS & SIFAR DUPLIKASI KAMERA ---');
    const integrityCheck = await evalInPage(ws, `
      ({
        canvasCount: document.querySelectorAll('#ar-container canvas').length,
        videoCount: document.querySelectorAll('#ar-container video').length
      })
    `);
    assert(integrityCheck.canvasCount === 1, 'Tepat 1 canvas WebGL Three.js wujud (tiada duplikasi)');
    assert(integrityCheck.videoCount === 1, 'Tepat 1 video stream kamera wujud (tiada duplikasi kamera)');

    console.log('\n========================================================================');
    console.log(`📊 KEPUTUSAN AKHIR: ${passed} LULUS, ${failed} GAGAL`);
    console.log('========================================================================\n');

    ws.close();
  } catch (err) {
    console.error('Ralat pelaksanaan ujian:', err);
    failed++;
  } finally {
    edgeProcess.kill();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
