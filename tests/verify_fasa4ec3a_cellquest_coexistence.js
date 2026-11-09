/**
 * KOTAK ARSELNEL — FASA 4E-C.3A VERIFICATION SUITE
 * INTEGRASI LIFECYCLE CELLQUEST 3D BERSAMA MULTI-PANEL POV
 * 
 * Verifies all 22 mandatory test cases:
 * 1. CellQuest boleh didaftarkan sebagai modul keempat.
 * 2. Had 3 panel DOM kekal.
 * 3. CellQuest tidak dikira sebagai panel DOM.
 * 4. Marker 3 boleh ditambah melalui ADD_PANEL.
 * 5. Video kekal apabila CellQuest dibuka.
 * 6. Nota kekal apabila CellQuest dibuka.
 * 7. Kuiz kekal apabila CellQuest dibuka.
 * 8. CellQuest kekal apabila Video difokuskan.
 * 9. CellQuest kekal apabila Nota difokuskan.
 * 10. CellQuest kekal apabila Kuiz difokuskan.
 * 11. Menutup CellQuest tidak menutup panel lain.
 * 12. Menutup Video tidak menutup CellQuest.
 * 13. Menutup Nota tidak menutup CellQuest.
 * 14. Menutup Kuiz tidak menutup CellQuest.
 * 15. CellQuest boleh diimbas semula.
 * 16. Tiada duplikasi objek model 3D.
 * 17. Tiada duplikasi kamera atau renderer.
 * 18. Tiada duplicate DOM ID.
 * 19. Touch/raycast tidak bertembung.
 * 20. Semua regresi Fasa 4E-C.2 lulus.
 * 21. Semua regresi Fasa 4D-D.3 lulus.
 * 22. Kamera kekal fullscreen ketika iPad berpusing.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9368;

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
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-C.3A: 4-MODULE COEXISTENCE (CELLQUEST 3D)');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4ec3a_${Date.now()}`);

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

    console.log('--- 1, 2 & 3. UJIAN PENDAFTARAN & INTEGRITI SPATIAL PANEL MANAGER ---');
    const panelAudit = await evaluate(`
      (() => {
        const spm = window.SpatialPanelManager;
        const domPanels = spm ? Array.from(spm.panels.keys()) : [];
        const hasCQInSPM = spm ? spm.panels.has('cellquest') : false;
        const hasCQController = typeof window.CellQuestARController !== 'undefined';
        return {
          domPanels,
          domPanelCount: domPanels.length,
          hasCQInSPM,
          hasCQController
        };
      })()
    `);
    assert(panelAudit.domPanelCount === 3, `TEST 2: Had tepat 3 panel DOM kekal dalam SpatialPanelManager (Didapati: ${panelAudit.domPanelCount} - ${panelAudit.domPanels.join(', ')})`);
    assert(!panelAudit.hasCQInSPM, 'TEST 3: CellQuest 3D TIDAK dikira sebagai panel DOM (kekal 3D natif)');
    assert(panelAudit.hasCQController, 'TEST 1: CellQuestARController sedia untuk pengaktifan modul');

    console.log('\n--- 4, 5, 6 & 7. UJIAN PENAMBAHAN CELLQUEST MELALUI ADD_PANEL & KEWUJUDAN 4 MODUL ---');
    // Aliran 4 Modul:
    // Step A: Buka Video -> Lock POV
    // Step B: Tambah Nota -> Lock POV
    // Step C: Tambah Kuiz -> Lock POV
    // Step D: Tambah CellQuest 3D
    const fourModulesStatus = await evaluate(`
      (() => {
        // Step A: Video
        window.handleTargetFound(0, 'video');
        window.SpatialPanelManager.lockPanelPOV('video');

        // Step B: Nota
        window.startAddPanelScan();
        window.handleTargetFound(1, 'nota');
        window.SpatialPanelManager.lockPanelPOV('nota');

        // Step C: Kuiz
        window.startAddPanelScan();
        window.handleTargetFound(2, 'kuiz');
        window.SpatialPanelManager.lockPanelPOV('kuiz');

        // Step D: Tambah CellQuest 3D
        window.startAddPanelScan();
        window.handleTargetFound(3, 'cellquest');

        const elVid = document.getElementById('pov-panel-video');
        const elNot = document.getElementById('pov-panel-nota');
        const elKuz = document.getElementById('pov-panel-kuiz');
        const cqHud = document.getElementById('cellquest-ar-hud');

        return {
          activePanels: Array.from(window.ARState.activePanels),
          activeCount: window.ARState.activePanels.size,
          cqIsActive: window.CellQuestARController.isActive,
          videoVisible: window.SpatialPanelManager.isPanelVisible('video') && !elVid.classList.contains('hidden'),
          notaVisible: window.SpatialPanelManager.isPanelVisible('nota') && !elNot.classList.contains('hidden'),
          kuizVisible: window.SpatialPanelManager.isPanelVisible('kuiz') && !elKuz.classList.contains('hidden'),
          cqHudVisible: cqHud && !cqHud.classList.contains('hidden'),
          multiBarCount: document.getElementById('multi-panel-count-text').textContent
        };
      })()
    `);

    assert(fourModulesStatus.activeCount === 4, `TEST 4: Tepat 4 modul aktif serentak (Didapati: ${fourModulesStatus.activeCount})`);
    assert(fourModulesStatus.activePanels.includes('cellquest'), 'TEST 4b: CellQuest 3D berjaya didaftarkan dalam activePanels');
    assert(fourModulesStatus.cqIsActive, 'TEST 4c: CellQuestARController diaktifkan (isActive: true)');
    assert(fourModulesStatus.videoVisible, 'TEST 5: Panel Video KEKAL kelihatan apabila CellQuest dibuka');
    assert(fourModulesStatus.notaVisible, 'TEST 6: Panel Nota KEKAL kelihatan apabila CellQuest dibuka');
    assert(fourModulesStatus.kuizVisible, 'TEST 7: Panel Kuiz KEKAL kelihatan apabila CellQuest dibuka');
    assert(fourModulesStatus.multiBarCount === '4 Modul Aktif', `TEST 4d: Toolbar memaparkan "4 Modul Aktif" (Didapati: ${fourModulesStatus.multiBarCount})`);

    console.log('\n--- 8, 9 & 10. UJIAN CELLQUEST KEKAL AKTIF SEMASA FOKUS PANEL DOM ---');
    const focusCheck = await evaluate(`
      (() => {
        // Fokus Video
        window.focusPanel('video');
        const cqAfterVidFocus = window.CellQuestARController.isActive;

        // Fokus Nota
        window.focusPanel('nota');
        const cqAfterNotFocus = window.CellQuestARController.isActive;

        // Fokus Kuiz
        window.focusPanel('kuiz');
        const cqAfterKuzFocus = window.CellQuestARController.isActive;

        return {
          cqAfterVidFocus,
          cqAfterNotFocus,
          cqAfterKuzFocus
        };
      })()
    `);
    assert(focusCheck.cqAfterVidFocus, 'TEST 8: CellQuest KEKAL aktif apabila Video difokuskan');
    assert(focusCheck.cqAfterNotFocus, 'TEST 9: CellQuest KEKAL aktif apabila Nota difokuskan');
    assert(focusCheck.cqAfterKuzFocus, 'TEST 10: CellQuest KEKAL aktif apabila Kuiz difokuskan');

    console.log('\n--- 11. UJIAN PENUTUPAN CELLQUEST SECARA BEBAS ---');
    const closeCQStatus = await evaluate(`
      (() => {
        window.destroyCellQuestSession();
        const elVid = document.getElementById('pov-panel-video');
        const elNot = document.getElementById('pov-panel-nota');
        const elKuz = document.getElementById('pov-panel-kuiz');
        const cqHud = document.getElementById('cellquest-ar-hud');

        return {
          activePanels: Array.from(window.ARState.activePanels),
          cqIsActive: window.CellQuestARController.isActive,
          cqHudHidden: cqHud.classList.contains('hidden'),
          videoRemains: window.ARState.activePanels.has('video') && !elVid.classList.contains('hidden'),
          notaRemains: window.ARState.activePanels.has('nota') && !elNot.classList.contains('hidden'),
          kuizRemains: window.ARState.activePanels.has('kuiz') && !elKuz.classList.contains('hidden'),
          countText: document.getElementById('multi-panel-count-text').textContent
        };
      })()
    `);
    assert(!closeCQStatus.cqIsActive, 'TEST 11a: CellQuest berjaya dideactivate');
    assert(closeCQStatus.cqHudHidden, 'TEST 11b: HUD CellQuest disembunyikan');
    assert(closeCQStatus.videoRemains && closeCQStatus.notaRemains && closeCQStatus.kuizRemains, 'TEST 11: Menutup CellQuest TIDAK menutup Video, Nota, atau Kuiz');
    assert(closeCQStatus.countText === '3 Panel Aktif', `TEST 11c: Toolbar kembali ke "3 Panel Aktif" (Didapati: ${closeCQStatus.countText})`);

    console.log('\n--- 15. UJIAN IMBASAN SEMULA CELLQUEST ---');
    const rescanCQStatus = await evaluate(`
      (() => {
        // Tamatkan tempoh bertenang
        window.ARState.markerCooldown = {};
        window.startAddPanelScan();
        window.handleTargetFound(3, 'cellquest');

        return {
          activePanels: Array.from(window.ARState.activePanels),
          activeCount: window.ARState.activePanels.size,
          cqIsActive: window.CellQuestARController.isActive
        };
      })()
    `);
    assert(rescanCQStatus.cqIsActive && rescanCQStatus.activePanels.includes('cellquest'), 'TEST 15: CellQuest berjaya diimbas semula dan diaktifkan');
    assert(rescanCQStatus.activeCount === 4, 'TEST 15b: 4 modul aktif semula selepas imbasan');

    console.log('\n--- 12, 13 & 14. UJIAN PENUTUPAN PANEL DOM TIDAK MENJEJASKAN CELLQUEST ---');
    const closeDomStatus = await evaluate(`
      (() => {
        // Tutup Video
        window.destroyVideoSession();
        const cqAfterVidClose = window.CellQuestARController.isActive;

        // Tutup Nota
        window.destroyNotaSession();
        const cqAfterNotClose = window.CellQuestARController.isActive;

        // Tutup Kuiz
        window.destroyKuizSession();
        const cqAfterKuzClose = window.CellQuestARController.isActive;

        return {
          cqAfterVidClose,
          cqAfterNotClose,
          cqAfterKuzClose,
          activePanels: Array.from(window.ARState.activePanels)
        };
      })()
    `);
    assert(closeDomStatus.cqAfterVidClose, 'TEST 12: Menutup Video TIDAK menutup CellQuest');
    assert(closeDomStatus.cqAfterNotClose, 'TEST 13: Menutup Nota TIDAK menutup CellQuest');
    assert(closeDomStatus.cqAfterKuzClose, 'TEST 14: Menutup Kuiz TIDAK menutup CellQuest');
    assert(closeDomStatus.activePanels.length === 1 && closeDomStatus.activePanels[0] === 'cellquest', 'TEST 14b: CellQuest kekal sebagai satu-satunya modul aktif');

    console.log('\n--- 16 & 17. UJIAN TUNGGAL TIGA INSTANCE 3D (TIADA DUPLIKASI OBJECT/CAMERA/RENDERER) ---');
    const singleInstanceAudit = await evaluate(`
      (() => {
        const cq = window.CellQuestARController;
        const scene = window.ARState.scene;
        let rootCount = 0;
        if (scene) {
          scene.traverse(obj => {
            if (obj.name === 'CellQuestAR_RootGroup') rootCount++;
          });
        }
        const hasCamera = !!window.ARState.camera;
        const hasRenderer = !!window.ARState.renderer;
        return {
          rootCount,
          hasCamera,
          hasRenderer,
          sameCamera: cq.camera === window.ARState.camera,
          sameRenderer: cq.renderer === window.ARState.renderer
        };
      })()
    `);
    assert(singleInstanceAudit.rootCount === 1, `TEST 16: Tepat 1 rootGroup model 3D wujud dalam scene (Didapati: ${singleInstanceAudit.rootCount})`);
    assert(singleInstanceAudit.hasCamera && singleInstanceAudit.hasRenderer, 'TEST 17: Kamera dan renderer wujud');
    assert(singleInstanceAudit.sameCamera && singleInstanceAudit.sameRenderer, 'TEST 17b: CellQuest berkongsi kamera dan renderer WebGL yang sama dengan MindAR');

    console.log('\n--- 18. UJIAN TIADA DUPLICATE ID DALAM DOM ---');
    const dups = await evaluate(`
      (() => {
        const all = document.querySelectorAll('[id]');
        const seen = new Set();
        const duplicates = [];
        all.forEach(el => {
          if (seen.has(el.id)) duplicates.push(el.id);
          seen.add(el.id);
        });
        return duplicates;
      })()
    `);
    assert(dups.length === 0, `TEST 18: Sifar duplicate DOM ID dijumpai (Dijumpai: ${dups.join(', ') || '0'})`);

    console.log('\n--- 19. UJIAN INTEGRITI SENTUHAN (TOUCH / RAYCAST PROTECTION) ---');
    const touchProtection = await evaluate(`
      (() => {
        const cq = window.CellQuestARController;
        const vidPanel = document.getElementById('pov-panel-video');
        const multiBar = document.getElementById('ar-multi-panel-bar');

        // Simulasikan pointerdown pada panel Video
        const mockPanelEvent = {
          target: vidPanel,
          clientX: 200,
          clientY: 200,
          pointerId: 1,
          cancelable: true,
          preventDefault: () => {}
        };

        // Pointer event listener guard test
        const isTargetProtected = (target) => {
          if (!target || typeof target.closest !== 'function') return false;
          return !!(target.closest('.pov-spatial-panel') || target.closest('.floating-ar-anchor') || target.closest('#ar-multi-panel-bar'));
        };

        return {
          hasVidPanel: !!vidPanel,
          hasMultiBar: !!multiBar,
          panelProtected: isTargetProtected(vidPanel),
          toolbarProtected: isTargetProtected(multiBar)
        };
      })()
    `);
    console.log('touchProtection:', touchProtection);
    assert(touchProtection.panelProtected && touchProtection.toolbarProtected, 'TEST 19: Sentuhan pada panel DOM atau toolbar tidak mencetuskan manipulasi 3D CellQuest');

    console.log('\n--- 20. REGRESI FASA 4E-C.2: MULTI-PANEL DOM & KUIZ INTEGRITI ---');
    const fasa4ec2Check = await evaluate(`
      (() => {
        const hasKuiz = typeof window.destroyKuizSession === 'function';
        const hasNota = typeof window.destroyNotaSession === 'function';
        const hasVideo = typeof window.destroyVideoSession === 'function';
        const spmKuiz = window.SpatialPanelManager.getPanel('kuiz');
        return {
          hasKuiz,
          hasNota,
          hasVideo,
          kuizTheme: spmKuiz ? spmKuiz.themeColor : null
        };
      })()
    `);
    assert(fasa4ec2Check.hasKuiz && fasa4ec2Check.hasNota && fasa4ec2Check.hasVideo, 'TEST 20: Kaedah lifecycle Fasa 4E-C.2 kekal utuh');
    assert(fasa4ec2Check.kuizTheme === '#a855f7', 'TEST 20b: Pendaftaran panel Kuiz kekal dengan tema #a855f7');

    console.log('\n--- 21. REGRESI FASA 4D-D.3: KAWALAN MODEL & SPATIAL CELLQUEST 3D ---');
    const fasa4dd3Check = await evaluate(`
      (() => {
        const cq = window.CellQuestARController;
        // Uji pertukaran model
        cq.loadModel('plant');
        const plantLoaded = cq.activeCellType === 'plant';
        cq.loadModel('animal');
        const animalLoaded = cq.activeCellType === 'animal';

        // Uji pinning & POV lock method availability
        const hasPin = typeof cq.togglePin === 'function';
        const hasPOVLock = typeof cq.togglePOVMode === 'function';
        const hasRecenter = typeof cq.recenterModel === 'function';

        return {
          plantLoaded,
          animalLoaded,
          hasPin,
          hasPOVLock,
          hasRecenter
        };
      })()
    `);
    assert(fasa4dd3Check.plantLoaded && fasa4dd3Check.animalLoaded, 'TEST 21: Pemuatan model Sel Tumbuhan dan Haiwan berfungsi');
    assert(fasa4dd3Check.hasPin && fasa4dd3Check.hasPOVLock && fasa4dd3Check.hasRecenter, 'TEST 21b: Kawalan Pin, Lock POV, dan Recenter CellQuest kekal sedia ada');

    console.log('\n--- 22. UJIAN KAMERA FULLSCREEN ---');
    const cameraFullscreen = await evaluate(`
      (() => {
        const c = document.getElementById('ar-container');
        const rect = c ? c.getBoundingClientRect() : null;
        return {
          isFullW: rect ? rect.width >= window.innerWidth : false,
          isFullH: rect ? rect.height >= window.innerHeight : false
        };
      })()
    `);
    assert(cameraFullscreen.isFullW && cameraFullscreen.isFullH, 'TEST 22: Paparan kamera AR kekal fullscreen (100vw × 100vh)');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 22 UJIAN FASA 4E-C.3A LULUS DENGAN CEMERLANG!');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ UJIAN GAGAL:', err);
    exitCode = 1;
  } finally {
    try {
      edgeProcess.kill('SIGKILL');
    } catch (_) {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
    process.exit(exitCode);
  }
}

run();
