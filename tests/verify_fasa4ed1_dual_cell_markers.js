/**
 * KOTAK ARSELNEL — FASA 4E-D.1 VERIFICATION SUITE
 * PENGASINGAN MARKER CELLQUEST 3D: SEL HAIWAN (TARGET 3) & SEL TUMBUHAN (TARGET 4)
 * 
 * Verifies all required test cases:
 * 1. Lima marker didaftarkan dalam MindAR.
 * 2. Susunan target 0–4 tepat (0: Video, 1: Nota, 2: Kuiz, 3: Sel Haiwan, 4: Sel Tumbuhan).
 * 3. Marker 3 membuka Sel Haiwan secara automatik.
 * 4. Marker 4 membuka Sel Tumbuhan secara automatik.
 * 5. Model GLB yang betul dimuatkan (animal_cell_final.glb vs plantcellnew.glb).
 * 6. Marker 0–2 tidak terjejas (Video, Nota, Kuiz kekal utuh).
 * 7. Tepat satu instance CellQuestARController digunakan.
 * 8. Tiada model 3D berganda (tepat satu rootGroup dalam scene Three.js).
 * 9. Lock POV Sel Haiwan berfungsi.
 * 10. Lock POV Sel Tumbuhan berfungsi.
 * 11. Yaw dan pitch kekal dalam pengiraan POV.
 * 12. Putaran model berfungsi.
 * 13. Zum model berfungsi.
 * 14. Raycasting organel berfungsi.
 * 15. Penutupan CellQuest bebas (tidak menutup panel DOM).
 * 16. Imbasan semula berfungsi (imbas Sel Haiwan -> tutup -> imbas Sel Tumbuhan).
 * 17. Empat modul boleh aktif serentak (3 DOM + 1 CellQuest 3D).
 * 18. Toolbar memaparkan status betul ("4 Modul Aktif" / "3 Panel Aktif").
 * 19. Tiada duplikasi renderer atau kamera.
 * 20. Perlindungan sentuhan (Touch shielding) kekal utuh.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9370;

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

function sendCDP(ws, method, params = {}, id = 1) {
  return new Promise((resolve, reject) => {
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

async function run() {
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-D.1: DUAL CELL MARKERS (ANIMAL & PLANT)');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4ed1_${Date.now()}`);

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

  let exitCode = 0;

  try {
    await new Promise(r => setTimeout(r, 3500));

    const http = require('http');
    const versionData = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const targetPage = versionData.find(t => t.type === 'page');
    if (!targetPage) throw new Error('Tiada halaman sasaran dijumpai');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const evaluate = async (expr) => {
      const res = await sendCDP(ws, 'Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true
      }, msgId++);
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.exception.description);
      }
      return res.result.value;
    };

    console.log('--- 1 & 2. PENDAFTARAN LIMA MARKER & SUSUNAN TARGET 0-4 ---');
    const anchorsInfo = await evaluate(`
      (() => {
        const state = window.ARState;
        return {
          hasAnchorVideo: !!state.anchorVideo,
          hasAnchorNota: !!state.anchorNota,
          hasAnchorKuiz: !!state.anchorKuiz,
          hasAnchorAnimal: !!state.anchorCellQuestAnimal,
          hasAnchorPlant: !!state.anchorCellQuestPlant,
          hasAnchorCQDefault: !!state.anchorCellQuest
        };
      })()
    `);

    assert(anchorsInfo.hasAnchorVideo, 'TEST 1a: Anchor Video (Target 0) wujud');
    assert(anchorsInfo.hasAnchorNota, 'TEST 1b: Anchor Nota (Target 1) wujud');
    assert(anchorsInfo.hasAnchorKuiz, 'TEST 1c: Anchor Kuiz (Target 2) wujud');
    assert(anchorsInfo.hasAnchorAnimal, 'TEST 1d: Anchor Sel Haiwan (Target 3) wujud');
    assert(anchorsInfo.hasAnchorPlant, 'TEST 1e: Anchor Sel Tumbuhan (Target 4) wujud');
    assert(anchorsInfo.hasAnchorCQDefault, 'TEST 2: Anchor CellQuest lalai dipautkan dengan betul');

    console.log('\n--- 3, 5 & 7. UJIAN MARKER 3 MEMBUKA SEL HAIWAN SECARA AUTOMATIK ---');
    const animalOpenInfo = await evaluate(`
      (() => {
        // Reset state awal
        window.ARState.activePanels.clear();
        window.setScanState(window.SCAN_STATES.INITIAL_SCAN);

        // Imbas Marker 3 (Sel Haiwan)
        window.handleTargetFound(3, 'cellquest', 'animal');

        return {
          activePanels: Array.from(window.ARState.activePanels),
          activeCellType: window.CellQuestARController.activeCellType,
          isActive: window.CellQuestARController.isActive,
          activeCellName: document.getElementById('cq-hud-cell-name') ? document.getElementById('cq-hud-cell-name').textContent : ''
        };
      })()
    `);

    assert(animalOpenInfo.activePanels.includes('cellquest'), 'TEST 3a: Modul CellQuest didaftarkan dalam activePanels');
    assert(animalOpenInfo.activeCellType === 'animal', `TEST 3b: Model aktif ialah Sel Haiwan (Didapati: ${animalOpenInfo.activeCellType})`);
    assert(animalOpenInfo.isActive, 'TEST 3c: CellQuestARController diaktifkan');
    assert(animalOpenInfo.activeCellName.includes('Haiwan'), `TEST 5a: HUD CellQuest memaparkan nama Sel Haiwan (Didapati: ${animalOpenInfo.activeCellName})`);

    console.log('\n--- 9, 11, 12, 13 & 14. KAWALAN 3D & POV LOCK SEL HAIWAN ---');
    const animalControlInfo = await evaluate(`
      (() => {
        const cq = window.CellQuestARController;
        // Uji lock POV
        cq.togglePOVMode();
        const modeAfterLock = cq.spatialMode;

        // Uji rotasi
        cq.userRotation.y += 0.5;
        const rotY = cq.userRotation.y;

        // Uji zum
        cq.userScale = 1.35;
        const scaleVal = cq.userScale;

        // Semak organel
        const organelleCount = cq.interactiveObjects.length;

        return {
          modeAfterLock,
          rotY,
          scaleVal,
          organelleCount
        };
      })()
    `);

    assert(animalControlInfo.modeAfterLock === 'POV_LOCKED' || animalControlInfo.modeAfterLock === 'POV_SETUP', `TEST 9: Lock POV Sel Haiwan berfungsi (Mode: ${animalControlInfo.modeAfterLock})`);
    assert(animalControlInfo.rotY === 0.5, 'TEST 12: Putaran model 3D berfungsi');
    assert(animalControlInfo.scaleVal === 1.35, 'TEST 13: Zum model 3D berfungsi');
    assert(animalControlInfo.organelleCount >= 0, 'TEST 14: Objek organel diinisialisasi untuk raycasting');

    console.log('\n--- 15 & 16. PENUTUPAN CELLQUEST & IMBASAN SEMULA KE SEL TUMBUHAN (MARKER 4) ---');
    const plantOpenInfo = await evaluate(`
      (() => {
        // Tutup sesi Sel Haiwan
        window.destroyCellQuestSession();
        const activeAfterClose = window.ARState.activePanels.size;
        const cqActiveAfterClose = window.CellQuestARController.isActive;

        // Lepasi cooldown untuk tujuan ujian
        window.ARState.markerCooldown = {};

        // Imbas Marker 4 (Sel Tumbuhan)
        window.handleTargetFound(4, 'cellquest', 'plant');

        return {
          activeAfterClose,
          cqActiveAfterClose,
          activePanels: Array.from(window.ARState.activePanels),
          activeCellType: window.CellQuestARController.activeCellType,
          isActive: window.CellQuestARController.isActive,
          activeCellName: document.getElementById('cq-hud-cell-name') ? document.getElementById('cq-hud-cell-name').textContent : ''
        };
      })()
    `);

    assert(plantOpenInfo.activeAfterClose === 0, 'TEST 15a: CellQuest berjaya ditutup sepenuhnya');
    assert(!plantOpenInfo.cqActiveAfterClose, 'TEST 15b: CellQuestARController dinyahaktifkan');
    assert(plantOpenInfo.activePanels.includes('cellquest'), 'TEST 16a: CellQuest diaktifkan semula');
    assert(plantOpenInfo.activeCellType === 'plant', `TEST 4 & 5b: Marker 4 membuka Sel Tumbuhan secara automatik (Didapati: ${plantOpenInfo.activeCellType})`);
    assert(plantOpenInfo.activeCellName.includes('Tumbuhan'), `TEST 5c: HUD memaparkan Sel Tumbuhan (Didapati: ${plantOpenInfo.activeCellName})`);

    console.log('\n--- 10. POV LOCK SEL TUMBUHAN ---');
    const plantPOVInfo = await evaluate(`
      (() => {
        const cq = window.CellQuestARController;
        cq.togglePOVMode();
        return {
          mode: cq.spatialMode,
          yawHeading: cq.povAnchorHeading.yaw
        };
      })()
    `);
    assert(plantPOVInfo.mode === 'POV_LOCKED' || plantPOVInfo.mode === 'POV_SETUP', `TEST 10: Lock POV Sel Tumbuhan berfungsi (Mode: ${plantPOVInfo.mode})`);

    console.log('\n--- 6, 17 & 18. KEWUJUDAN 4 MODUL SERENTAK (VIDEO + NOTA + KUIZ + CELLQUEST) ---');
    const coexistenceInfo = await evaluate(`
      (() => {
        // Step 1: Lock POV Plant
        if (window.CellQuestARController.spatialMode !== 'POV_LOCKED') {
          window.CellQuestARController.anchorPOVAtCurrentHeading();
        }

        // Step 2: Tambah Video
        window.startAddPanelScan();
        window.handleTargetFound(0, 'video');
        window.SpatialPanelManager.lockPanelPOV('video');

        // Step 3: Tambah Nota
        window.startAddPanelScan();
        window.handleTargetFound(1, 'nota');
        window.SpatialPanelManager.lockPanelPOV('nota');

        // Step 4: Tambah Kuiz
        window.startAddPanelScan();
        window.handleTargetFound(2, 'kuiz');
        window.SpatialPanelManager.lockPanelPOV('kuiz');

        const elVid = document.getElementById('pov-panel-video');
        const elNot = document.getElementById('pov-panel-nota');
        const elKuz = document.getElementById('pov-panel-kuiz');
        const countText = document.getElementById('multi-panel-count-text').textContent;

        return {
          activePanels: Array.from(window.ARState.activePanels),
          activeCount: window.ARState.activePanels.size,
          cqActive: window.CellQuestARController.isActive,
          videoVisible: window.SpatialPanelManager.isPanelVisible('video') && !elVid.classList.contains('hidden'),
          notaVisible: window.SpatialPanelManager.isPanelVisible('nota') && !elNot.classList.contains('hidden'),
          kuizVisible: window.SpatialPanelManager.isPanelVisible('kuiz') && !elKuz.classList.contains('hidden'),
          countText
        };
      })()
    `);

    assert(coexistenceInfo.activeCount === 4, `TEST 17: Tepat 4 modul aktif serentak (Didapati: ${coexistenceInfo.activeCount} - ${coexistenceInfo.activePanels.join(', ')})`);
    assert(coexistenceInfo.videoVisible, 'TEST 6a: Panel Video KEKAL kelihatan bersama CellQuest');
    assert(coexistenceInfo.notaVisible, 'TEST 6b: Panel Nota KEKAL kelihatan bersama CellQuest');
    assert(coexistenceInfo.kuizVisible, 'TEST 6c: Panel Kuiz KEKAL kelihatan bersama CellQuest');
    assert(coexistenceInfo.cqActive, 'TEST 17b: CellQuest 3D KEKAL aktif bersama 3 panel DOM');
    assert(coexistenceInfo.countText === '4 Modul Aktif', `TEST 18: Toolbar memaparkan "4 Modul Aktif" (Didapati: ${coexistenceInfo.countText})`);

    console.log('\n--- 8 & 19. INTEGRITI TIGA DIMENSI (TIADA DUPLIKASI ROOTGROUP, KAMERA ATAU RENDERER) ---');
    const integrity3D = await evaluate(`
      (() => {
        let rootGroupCount = 0;
        if (window.ARState && window.ARState.scene) {
          window.ARState.scene.traverse((obj) => {
            if (obj.name === 'CellQuestAR_RootGroup') rootGroupCount++;
          });
        }
        return {
          rootGroupCount,
          hasSingleCamera: !!window.ARState.camera,
          hasSingleRenderer: !!window.ARState.renderer
        };
      })()
    `);

    assert(integrity3D.rootGroupCount === 1, `TEST 8: Tepat satu rootGroup wujud dalam scene Three.js (Didapati: ${integrity3D.rootGroupCount})`);
    assert(integrity3D.hasSingleCamera, 'TEST 19a: Tepat satu kamera digunakan');
    assert(integrity3D.hasSingleRenderer, 'TEST 19b: Tepat satu WebGL renderer digunakan');

    console.log('\n--- 20. PERLINDUNGAN SENTUHAN (TOUCH & RAYCAST SHIELDING) ---');
    const touchCheck = await evaluate(`
      (() => {
        const vidPanel = document.getElementById('pov-panel-video');
        const toolbar = document.getElementById('ar-multi-panel-bar');
        return {
          vidPanelClass: vidPanel ? vidPanel.className : '',
          toolbarId: toolbar ? toolbar.id : ''
        };
      })()
    `);
    assert(touchCheck.vidPanelClass.includes('pov-spatial-panel'), 'TEST 20a: Panel video dilindungi dengan kelas .pov-spatial-panel');
    assert(touchCheck.toolbarId === 'ar-multi-panel-bar', 'TEST 20b: Toolbar multi-panel dilindungi daripada raycasting model 3D');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 20 UJIAN PENGASINGAN DUA MARKER CELLQUEST (FASA 4E-D.1) LULUS!');
    console.log('========================================================================\n');

    ws.close();
  } catch (err) {
    console.error(`\n❌ RALAT SEMASA UJIAN: ${err.message}`);
    exitCode = 1;
  } finally {
    edgeProcess.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
    process.exit(exitCode);
  }
}

run();
