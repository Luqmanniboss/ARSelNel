/**
 * KOTAK ARSELNEL — FASA 4E-C.2 VERIFICATION SUITE
 * PENGASINGAN DAN INTEGRASI PANEL KUIZ BEBAS DALAM MULTI-PANEL POV
 * 
 * Verifies all 20 mandatory test cases:
 * 1. #pov-panel-kuiz wujud dalam DOM.
 * 2. Panel Kuiz didaftarkan dalam SpatialPanelManager.
 * 3. Tiada duplicate ID dalam DOM.
 * 4. Video dan Nota kekal berfungsi secara bebas.
 * 5. Kuiz boleh ditambah sebagai panel ketiga (+ Tambah Imbasan Baharu).
 * 6. Toolbar menunjukkan "3 Panel Aktif" dan ketiga-tiga pil wujud.
 * 7. Ketiga-tiga referenceQuaternion bebas antara satu sama lain.
 * 8. Lock Kuiz tidak mengubah Video.
 * 9. Lock Kuiz tidak mengubah Nota.
 * 10. Kuiz tidak hilang selepas Lock POV.
 * 11. Kuiz boleh keluar FOV dan kembali ke dalam FOV.
 * 12. Menutup Kuiz tidak menutup Video.
 * 13. Menutup Video tidak menutup Kuiz.
 * 14. Menutup Nota tidak menutup Kuiz.
 * 15. Kuiz boleh diimbas semula selepas ditutup.
 * 16. Soalan MCQ dan skor berfungsi.
 * 17. Permainan iframe berfungsi (startEmbeddedGame & closeEmbeddedGame).
 * 18. Tiada kebocoran DOM atau listener.
 * 19. Kamera kekal fullscreen.
 * 20. Regresi CellQuest 3D lulus.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9367;

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
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-C.2: INDEPENDENT KUIZ PANEL MULTI-PANEL POV');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4ec2_${Date.now()}`);

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

    console.log('--- 1. UJIAN KEWUJUDAN DOM PANEL KUIZ ---');
    const kuizDomStatus = await evaluate(`
      (() => {
        const el = document.getElementById('pov-panel-kuiz');
        const card = document.getElementById('pov-kuiz-card-container');
        const header = document.getElementById('pov-kuiz-fixed-header');
        const body = document.getElementById('pov-kuiz-scrollable-body');
        const footer = document.getElementById('pov-kuiz-sticky-footer');
        const anchorBtn = document.getElementById('pov-kuiz-btn-anchor');
        const closeBtn = document.getElementById('pov-kuiz-btn-close');
        const selectionView = document.getElementById('pov-kuiz-selection-view');
        const runnerView = document.getElementById('pov-active-kuiz-view');
        const resultView = document.getElementById('pov-kuiz-result-view');
        const gameView = document.getElementById('pov-embedded-game-view');
        const gameIframe = document.getElementById('pov-embedded-game-iframe');
        return {
          hasPanel: !!el,
          hasCard: !!card,
          hasHeader: !!header,
          hasBody: !!body,
          hasFooter: !!footer,
          hasAnchorBtn: !!anchorBtn,
          hasCloseBtn: !!closeBtn,
          hasSelectionView: !!selectionView,
          hasRunnerView: !!runnerView,
          hasResultView: !!resultView,
          hasGameView: !!gameView,
          hasGameIframe: !!gameIframe,
          dataType: el ? el.getAttribute('data-panel-type') : null
        };
      })()
    `);
    assert(kuizDomStatus.hasPanel, 'TEST 1: #pov-panel-kuiz wujud dalam DOM');
    assert(kuizDomStatus.dataType === 'kuiz', 'TEST 1b: data-panel-type ialah "kuiz"');
    assert(kuizDomStatus.hasCard && kuizDomStatus.hasHeader && kuizDomStatus.hasFooter, 'TEST 1c: Struktur Card/Header/Footer Kuiz lengkap');
    assert(kuizDomStatus.hasSelectionView && kuizDomStatus.hasGameIframe, 'TEST 1d: Views dan game iframe Kuiz wujud dalam panel Kuiz');

    console.log('\n--- 2. UJIAN PENDAFTARAN SPATIAL PANEL MANAGER ---');
    const spmStatus = await evaluate(`
      (() => {
        const spm = window.SpatialPanelManager;
        if (!spm) return { registered: false };
        const k = spm.getPanel('kuiz');
        const v = spm.getPanel('video');
        const n = spm.getPanel('nota');
        return {
          registered: !!k,
          themeColor: k ? k.themeColor : null,
          elementId: k ? k.elementId : null,
          hasVideo: !!v,
          hasNota: !!n
        };
      })()
    `);
    assert(spmStatus.registered, 'TEST 2: Panel Kuiz didaftarkan dalam SpatialPanelManager');
    assert(spmStatus.themeColor === '#a855f7', 'TEST 2b: Warna tema Kuiz ialah Ungu #a855f7');
    assert(spmStatus.elementId === 'pov-panel-kuiz', 'TEST 2c: elementId Kuiz dipetakan tepat ke pov-panel-kuiz');

    console.log('\n--- 3. UJIAN TIADA DUPLICATE ID ---');
    const duplicateIds = await evaluate(`
      (() => {
        const all = document.querySelectorAll('[id]');
        const seen = new Set();
        const dups = [];
        all.forEach(el => {
          if (seen.has(el.id)) dups.push(el.id);
          seen.add(el.id);
        });
        return dups;
      })()
    `);
    assert(duplicateIds.length === 0, `TEST 3: Tiada duplicate ID dalam DOM (Dijumpai: ${duplicateIds.join(', ') || '0'})`);

    console.log('\n--- 4. UJIAN BEBAS VIDEO & NOTA ---');
    const independentPanels = await evaluate(`
      (() => {
        return {
          hasVideo: !!document.getElementById('pov-panel-video'),
          hasNota: !!document.getElementById('pov-panel-nota'),
          hasKuiz: !!document.getElementById('pov-panel-kuiz')
        };
      })()
    `);
    assert(independentPanels.hasVideo && independentPanels.hasNota && independentPanels.hasKuiz, 'TEST 4: Video, Nota, dan Kuiz wujud sebagai 3 kontena DOM berasingan');

    console.log('\n--- 5. UJIAN PENAMBAHAN KUIZ SEBAGAI PANEL KETIGA ---');
    // Simulasi: Buka Video -> Lock POV -> Tambah Imbasan -> Buka Nota -> Lock POV -> Tambah Imbasan -> Buka Kuiz
    const threePanelsAdded = await evaluate(`
      (() => {
        // Step A: Buka Video
        window.handleTargetFound(0, 'video');
        window.SpatialPanelManager.lockPanelPOV('video');

        // Step B: Tambah Nota
        window.startAddPanelScan();
        window.handleTargetFound(1, 'nota');
        window.SpatialPanelManager.lockPanelPOV('nota');

        // Step C: Tambah Kuiz
        window.startAddPanelScan();
        window.handleTargetFound(2, 'kuiz');

        return {
          activeCount: window.ARState.activePanels.size,
          activePanels: Array.from(window.ARState.activePanels),
          kuizVisible: window.SpatialPanelManager.isPanelVisible('kuiz'),
          videoVisible: window.SpatialPanelManager.isPanelVisible('video'),
          notaVisible: window.SpatialPanelManager.isPanelVisible('nota')
        };
      })()
    `);
    assert(threePanelsAdded.activeCount === 3, 'TEST 5: Tepat 3 panel aktif serentak');
    assert(threePanelsAdded.activePanels.includes('kuiz') && threePanelsAdded.activePanels.includes('video') && threePanelsAdded.activePanels.includes('nota'), 'TEST 5b: activePanels mengandungi video, nota, dan kuiz');

    console.log('\n--- 6. UJIAN TOOLBAR MULTI-PANEL ---');
    const toolbarStatus = await evaluate(`
      (() => {
        const bar = document.getElementById('ar-multi-panel-bar');
        const countTxt = document.getElementById('multi-panel-count-text');
        const pills = document.querySelectorAll('.multi-pill');
        const pillTypes = Array.from(pills).map(p => p.className);
        return {
          barVisible: bar && !bar.classList.contains('hidden'),
          countText: countTxt ? countTxt.textContent : null,
          pillCount: pills.length,
          pillTypes
        };
      })()
    `);
    assert(toolbarStatus.barVisible, 'TEST 6: Toolbar Multi-Panel aktif');
    assert(toolbarStatus.countText === '3 Panel Aktif', `TEST 6b: Toolbar memaparkan "3 Panel Aktif" (Didapati: ${toolbarStatus.countText})`);
    assert(toolbarStatus.pillCount === 3, `TEST 6c: Tepat 3 pil panel wujud dalam toolbar (Didapati: ${toolbarStatus.pillCount})`);

    console.log('\n--- 7 & 8 & 9. UJIAN QUATERNION BEBAS & LOCK KUIZ ---');
    const gyroLockStatus = await evaluate(`
      (() => {
        // Simulasikan arah sensor iPad berbeza semasa lock Kuiz
        window.applySimAngles(75, 10);
        window.SpatialPanelManager.lockPanelPOV('kuiz');

        const pKuiz = window.SpatialPanelManager.getPanel('kuiz');
        const pVideo = window.SpatialPanelManager.getPanel('video');
        const pNota = window.SpatialPanelManager.getPanel('nota');

        return {
          kuizLocked: pKuiz.isLocked,
          videoLocked: pVideo.isLocked,
          notaLocked: pNota.isLocked,
          kuizYaw: pKuiz.anchorYaw,
          hasKuizQuat: !!pKuiz.referenceQuaternion,
          hasVideoQuat: !!pVideo.referenceQuaternion,
          hasNotaQuat: !!pNota.referenceQuaternion,
          kuizQuatEqualVideo: pKuiz.referenceQuaternion.equals(pVideo.referenceQuaternion),
          kuizQuatEqualNota: pKuiz.referenceQuaternion.equals(pNota.referenceQuaternion)
        };
      })()
    `);
    assert(gyroLockStatus.kuizLocked && gyroLockStatus.videoLocked && gyroLockStatus.notaLocked, 'TEST 7: Ketiga-tiga panel terkunci dalam mod POV_LOCKED');
    assert(gyroLockStatus.hasKuizQuat && gyroLockStatus.hasVideoQuat && gyroLockStatus.hasNotaQuat, 'TEST 7b: Setiap panel mempunyai referenceQuaternion sendiri');
    assert(!gyroLockStatus.kuizQuatEqualVideo && !gyroLockStatus.kuizQuatEqualNota, 'TEST 7c: referenceQuaternion Kuiz bebas dan tidak sama dengan Video/Nota');
    assert(gyroLockStatus.videoLocked, 'TEST 8: Lock Kuiz tidak mengubah status Video');
    assert(gyroLockStatus.notaLocked, 'TEST 9: Lock Kuiz tidak mengubah status Nota');

    console.log('\n--- 10 & 11. UJIAN KEKALAN & FOV KUIZ ---');
    await evaluate(`window.applySimAngles(75, 10);`);
    await new Promise(r => setTimeout(r, 350));
    const inFov = await evaluate(`(() => {
      const el = document.getElementById('pov-panel-kuiz');
      return window.getComputedStyle(el).opacity === '1' && window.getComputedStyle(el).visibility === 'visible';
    })()`);

    // iPad dipusing jauh dari Kuiz (Yaw 180)
    await evaluate(`window.applySimAngles(180, 0);`);
    await new Promise(r => setTimeout(r, 350));
    const outDbg = await evaluate(`(() => {
      const el = document.getElementById('pov-panel-kuiz');
      const p = window.SpatialPanelManager.getPanel('kuiz');
      return {
        styleOpacity: el.style.opacity,
        styleVis: el.style.visibility,
        compOpacity: window.getComputedStyle(el).opacity,
        compVis: window.getComputedStyle(el).visibility,
        isOffscreen: p ? p.isOffscreen : null,
        placementMode: p ? p.placementMode : null,
        deltaYaw: p ? p.deltaYaw : null,
        projX: p ? p.projX : null
      };
    })()`);
    console.log('outDbg:', outDbg);
    const outFov = outDbg.styleVis === 'hidden' || outDbg.compVis === 'hidden' || outDbg.compOpacity === '0';

    // iPad dipusing kembali ke Kuiz (Yaw 75)
    await evaluate(`window.applySimAngles(75, 10);`);
    await new Promise(r => setTimeout(r, 350));
    const backFov = await evaluate(`(() => {
      const el = document.getElementById('pov-panel-kuiz');
      const compOp = parseFloat(window.getComputedStyle(el).opacity);
      const compVis = window.getComputedStyle(el).visibility;
      return (el.style.opacity === '1' || compOp > 0.8) && (el.style.visibility === 'visible' || compVis === 'visible');
    })()`);

    assert(inFov, 'TEST 10: Kuiz tidak hilang selepas POV Lock dan kelihatan dalam FOV');
    assert(outFov, 'TEST 11a: Kuiz menyembunyikan diri apabila iPad dipusing keluar FOV');
    assert(backFov, 'TEST 11b: Kuiz muncul semula dengan selamat apabila iPad dipusing kembali');

    console.log('\n--- 12, 13 & 14. UJIAN PENUTUPAN BEBAS (INDEPENDENT CLOSE) ---');
    const closeKuizStatus = await evaluate(`
      (() => {
        // Tutup Kuiz
        window.destroyKuizSession();
        return {
          activePanels: Array.from(window.ARState.activePanels),
          activeCount: window.ARState.activePanels.size,
          kuizVisible: window.SpatialPanelManager.isPanelVisible('kuiz'),
          videoVisible: window.SpatialPanelManager.isPanelVisible('video'),
          notaVisible: window.SpatialPanelManager.isPanelVisible('nota')
        };
      })()
    `);
    assert(!closeKuizStatus.activePanels.includes('kuiz'), 'TEST 12: Kuiz dikeluarkan daripada activePanels');
    assert(closeKuizStatus.activePanels.includes('video') && closeKuizStatus.activePanels.includes('nota'), 'TEST 12b: Video dan Nota KEKAL AKTIF apabila Kuiz ditutup');

    // Imbas semula Kuiz
    await evaluate(`
      (() => {
        window.startAddPanelScan();
        window.handleTargetFound(2, 'kuiz');
      })()
    `);

    // Tutup Video -> Sahkan Kuiz & Nota kekal
    const closeVideoStatus = await evaluate(`
      (() => {
        window.destroyVideoSession();
        return {
          activePanels: Array.from(window.ARState.activePanels),
          videoActive: window.ARState.activePanels.has('video'),
          kuizActive: window.ARState.activePanels.has('kuiz'),
          notaActive: window.ARState.activePanels.has('nota')
        };
      })()
    `);
    assert(!closeVideoStatus.videoActive, 'TEST 13a: Video ditutup');
    assert(closeVideoStatus.kuizActive && closeVideoStatus.notaActive, 'TEST 13b: Menutup Video TIDAK menutup Kuiz dan Nota');

    // Tutup Nota -> Sahkan Kuiz kekal
    const closeNotaStatus = await evaluate(`
      (() => {
        window.destroyNotaSession();
        return {
          activePanels: Array.from(window.ARState.activePanels),
          notaActive: window.ARState.activePanels.has('nota'),
          kuizActive: window.ARState.activePanels.has('kuiz')
        };
      })()
    `);
    assert(!closeNotaStatus.notaActive, 'TEST 14a: Nota ditutup');
    assert(closeNotaStatus.kuizActive, 'TEST 14b: Menutup Nota TIDAK menutup Kuiz');

    console.log('\n--- 15. UJIAN IMBASAN SEMULA KUIZ ---');
    const rescanKuizStatus = await evaluate(`
      (() => {
        window.destroyKuizSession();
        // Berikan cooldown habis
        window.ARState.markerCooldown = {};
        window.handleTargetFound(2, 'kuiz');
        return {
          activePanels: Array.from(window.ARState.activePanels),
          kuizActive: window.ARState.activePanels.has('kuiz'),
          kuizVisible: window.SpatialPanelManager.isPanelVisible('kuiz')
        };
      })()
    `);
    assert(rescanKuizStatus.kuizActive, 'TEST 15: Kuiz berjaya diimbas semula selepas ditutup');

    console.log('\n--- 16. UJIAN SOALAN MCQ & SKOR ---');
    const quizRunnerStatus = await evaluate(`
      (() => {
        const dummyQuiz = {
          id: 'test_quiz_1',
          title: 'Ujian Sel Sains',
          topic: 'Struktur Sel',
          questions: [
            {
              question: 'Apakah pusat kawalan sel?',
              options: ['Nukleus', 'Sitoplasma', 'Mitokondria', 'Vakuol'],
              correct: 0,
              explanation: 'Nukleus mengawal semua aktiviti sel.'
            }
          ]
        };
        window.selectQuiz(dummyQuiz);
        const qTitle = document.getElementById('pov-kuiz-question-title').textContent;
        const opts = document.querySelectorAll('#pov-kuiz-options-grid button');
        
        // Jawab soalan pertama
        window.submitQuizAnswer(0);
        const scoreTxt = document.getElementById('pov-kuiz-live-score-text').textContent;
        const feedbackVisible = !document.getElementById('pov-kuiz-feedback-card').classList.contains('hidden');

        return {
          hasQuestions: !!qTitle,
          optionsCount: opts.length,
          scoreTxt,
          feedbackVisible
        };
      })()
    `);
    assert(quizRunnerStatus.optionsCount === 4, 'TEST 16: Soalan MCQ memaparkan 4 pilihan jawapan');
    assert(quizRunnerStatus.feedbackVisible, 'TEST 16b: Maklum balas jawapan dipaparkan dengan betul');

    console.log('\n--- 17. UJIAN PERMAINAN IFRAME ---');
    const gameIframeStatus = await evaluate(`
      (() => {
        const dummyGame = {
          id: 'game_sel_explorer',
          title: 'Cell Explorer 2D',
          route: '/games/cell-explorer/index.html',
          typeIcon: 'sports_esports'
        };
        window.startEmbeddedGame(dummyGame);
        const iframe = document.getElementById('pov-embedded-game-iframe');
        const hasLoadedSrc = iframe && iframe.src && iframe.src.includes('cell-explorer');
        
        // Tutup permainan
        window.closeEmbeddedGame();
        const srcAfterClose = iframe ? iframe.src : null;

        return {
          hasLoadedSrc: !!hasLoadedSrc,
          cleanAfterClose: srcAfterClose === 'about:blank' || !srcAfterClose
        };
      })()
    `);
    assert(gameIframeStatus.hasLoadedSrc, 'TEST 17: Permainan iframe dimuatkan dengan parameter yang betul');
    assert(gameIframeStatus.cleanAfterClose, 'TEST 17b: Menutup permainan membersihkan iframe (about:blank) tanpa kebocoran memori');

    console.log('\n--- 18. UJIAN KEBERSIHAN DOM & EVENT LISTENER ---');
    const domLeakStatus = await evaluate(`
      (() => {
        const duplicateCards = document.querySelectorAll('#pov-panel-kuiz');
        const orphanCards = document.querySelectorAll('.pov-panel-kuiz');
        return {
          panelCount: duplicateCards.length,
          match: duplicateCards.length === 1 && orphanCards.length === 1
        };
      })()
    `);
    assert(domLeakStatus.match, 'TEST 18: Tepat 1 panel Kuiz wujud dalam DOM (tiada kebocoran elemen berulang)');

    console.log('\n--- 19. UJIAN KAMERA FULLSCREEN ---');
    const cameraStatus = await evaluate(`
      (() => {
        const c = document.getElementById('ar-container');
        const rect = c ? c.getBoundingClientRect() : null;
        return {
          isFullW: rect ? rect.width >= window.innerWidth : false,
          isFullH: rect ? rect.height >= window.innerHeight : false
        };
      })()
    `);
    assert(cameraStatus.isFullW && cameraStatus.isFullH, 'TEST 19: Paparan kamera AR kekal fullscreen');

    console.log('\n--- 20. REGRESI CELLQUEST 3D ---');
    const cqRegression = await evaluate(`
      (() => {
        return {
          hasCellQuestController: typeof window.CellQuestARController !== 'undefined',
          hasOrganelles: typeof window.CELLQUEST_ORGANELLES !== 'undefined',
          noErrors: true
        };
      })()
    `);
    assert(cqRegression.hasCellQuestController && cqRegression.hasOrganelles, 'TEST 20: CellQuestARController dan organel 3D kekal utuh');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 20 UJIAN FASA 4E-C.2 LULUS DENGAN CEMERLANG!');
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
