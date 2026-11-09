/**
 * KOTAK ARSELNEL — FASA 4E-B.2.3 VERIFICATION SUITE
 * Restore Stable Gyroscope POV + Fix Nota Disappearing After Lock
 * Tests:
 * 1. Screen orientation detection on iPad landscape
 * 2. Deterministic 3DoF Quaternion Math (Zero Yaw-Pitch cross-talk)
 * 3. Bug 1 Fix: Nota remains visible and locked when Lock POV is clicked on Nota
 * 4. Dual Independent Spatial Panel POV Locks (Video + Nota simultaneously locked)
 * 5. Unlock / Relocate independent toggle without affecting other panels
 * 6. Diagnostics Telemetry reporting
 * 7. CellQuest 3D backward compatibility
 * 8. 5 Original Games persistence
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9338;

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
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-B.2.3: STABLE GYRO POV + DUAL LOCK SUITE');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4eb23_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    '--window-size=1280,800',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  try {
    await new Promise(r => setTimeout(r, 3500));
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('Halaman Kotak ARSELNEL tidak ditemui');

    const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let cdpId = 1;
    await sendCDP(ws, 'Page.enable', {}, cdpId++);
    await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

    // 1. Tunggu inisialisasi Kotak ARSELNEL
    console.log('--- UJIAN 1: Permulaan Kotak ARSELNEL & SpatialPanelManager ---');
    for (let i = 0; i < 20; i++) {
      const ready = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `!!(window.KotakARSELNEL && window.SpatialPanelManager && window.THREE)`
      }, cdpId++);
      if (ready && ready.result && ready.result.value) break;
      await new Promise(r => setTimeout(r, 400));
    }

    const initCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const sm = window.SpatialPanelManager;
        return {
          hasVideo: !!sm.getPanel('video'),
          hasNota: !!sm.getPanel('nota'),
          hasLockMethod: typeof sm.lockPanelPOV === 'function',
          hasToggleMethod: typeof sm.togglePanelLock === 'function'
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    assert(initCheck.result.value.hasVideo, 'Panel Video didaftarkan dalam SpatialPanelManager');
    assert(initCheck.result.value.hasNota, 'Panel Nota didaftarkan dalam SpatialPanelManager');
    assert(initCheck.result.value.hasLockMethod, 'lockPanelPOV() wujud dalam SpatialPanelManager');
    assert(initCheck.result.value.hasToggleMethod, 'togglePanelLock() wujud dalam SpatialPanelManager');

    // 2. Deterministic Gyro Quaternion Math Isolation (Bug 2 Verification)
    console.log('\n--- UJIAN 2: Matematik Giroskop Bebas Silang (Zero Yaw-Pitch Crosstalk) ---');
    const mathCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const computeQ = window.KotakARSELNEL.computeDeviceCameraQuaternion;
        const fwd = new window.THREE.Vector3(0, 0, -1);
        const RAD2DEG = 180 / Math.PI;

        // Baseline: Landscape upright orient=90
        // Anchor at alpha=90, beta=0, gamma=90
        const q0 = computeQ(90, 0, 90, 90);
        const anchor = fwd.clone().applyQuaternion(q0);

        // Turn right by 30° (alpha=120)
        const qRight = computeQ(120, 0, 90, 90);
        const vRight = anchor.clone().applyQuaternion(qRight.clone().invert());
        const deltaYawRight = Math.atan2(vRight.x, -vRight.z) * RAD2DEG;
        const deltaPitchRight = Math.atan2(vRight.y, -vRight.z) * RAD2DEG;

        // Tilt down by 30° (gamma=60)
        const qDown = computeQ(90, 0, 60, 90);
        const vDown = anchor.clone().applyQuaternion(qDown.clone().invert());
        const deltaYawDown = Math.atan2(vDown.x, -vDown.z) * RAD2DEG;
        const deltaPitchDown = Math.atan2(vDown.y, -vDown.z) * RAD2DEG;

        // Screen angle resolution in landscape viewport (1280x800)
        const detectedAngle = window.KotakARSELNEL.getScreenOrientationAngle();

        return {
          detectedAngle,
          deltaYawRight,
          deltaPitchRight,
          vRightY: vRight.y,
          deltaYawDown,
          deltaPitchDown,
          vDownX: vDown.x
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Math Check Output:', mathCheck.result.value);
    assert(mathCheck.result.value.detectedAngle === 90, `Orientasi landskap dikesan tepat (90°), dapat: ${mathCheck.result.value.detectedAngle}°`);
    assert(Math.abs(mathCheck.result.value.deltaYawRight - (-30)) < 0.1, `Pusing kanan menghasilkan Delta Yaw -30°, dapat: ${mathCheck.result.value.deltaYawRight.toFixed(1)}°`);
    assert(Math.abs(mathCheck.result.value.deltaPitchRight) < 0.001, `Pusing kanan mempunyai ZERO cross-talk ke Pitch (0.0°), dapat: ${mathCheck.result.value.deltaPitchRight.toFixed(4)}°`);
    assert(Math.abs(mathCheck.result.value.vRightY) < 0.001, `Vektor paksi Y kekal 0 semasa pusing mendatar (tidak ternaik ke atas)`);
    assert(Math.abs(mathCheck.result.value.deltaPitchDown - (-30)) < 0.1, `Dongak/tunduk menghasilkan Delta Pitch tepat (-30°), dapat: ${mathCheck.result.value.deltaPitchDown.toFixed(1)}°`);
    assert(Math.abs(mathCheck.result.value.vDownX) < 0.001, `Vektor paksi X kekal 0 semasa dongak menegak`);

    // 3. Imbas Video & Masuk ke Mod POV Video
    console.log('\n--- UJIAN 3: Imbasan Video & Masuk ke Mod POV ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const loadEl = document.getElementById('loading-screen');
        if (loadEl) loadEl.classList.add('hidden');
        window.handleTargetFound(0, 'video');
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    // Masuk mod POV
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(async () => {
        await window.KotakARSELNEL.startPOVMode();
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 300));

    const videoPOVState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('pov-panel-video');
        const p = window.SpatialPanelManager.getPanel('video');
        return {
          visible: p.isVisible && !el.classList.contains('hidden'),
          placementMode: p.placementMode,
          isCentered: el.classList.contains('is-centered')
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Video POV State:', videoPOVState.result.value);
    assert(videoPOVState.result.value.visible === true, 'Panel Video kelihatan dalam mod POV');
    assert(videoPOVState.result.value.isCentered === true, 'Panel Video berpusat di tengah semasa POV_SETUP');

    // 4. Kunci POV Video (Video Locked)
    console.log('\n--- UJIAN 4: Kunci POV Video (#pov-btn-anchor) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.state.pov.screenAngle = 90;
        const qRef = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, 90, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qRef;
        window.KotakARSELNEL.state.pov.currentQuaternion = qRef.clone();
        document.getElementById('pov-btn-anchor').click();
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const videoLockedCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const p = window.SpatialPanelManager.getPanel('video');
        const btn = document.getElementById('pov-btn-anchor');
        const txt = document.getElementById('pov-anchor-text');
        const el = document.getElementById('pov-panel-video');
        return {
          placementMode: p.placementMode,
          isLocked: p.isLocked,
          btnLocked: btn.classList.contains('is-locked'),
          btnText: txt ? txt.textContent : '',
          isCentered: el.classList.contains('is-centered')
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Video Locked Check:', videoLockedCheck.result.value);
    assert(videoLockedCheck.result.value.placementMode === 'POV_LOCKED', 'Video placementMode bertukar ke POV_LOCKED');
    assert(videoLockedCheck.result.value.btnLocked === true, 'Butang Kunci Video mempunyai kelas is-locked');
    assert(videoLockedCheck.result.value.btnText === 'Alih / Letak Semula', 'Teks butang Video bertukar ke "Alih / Letak Semula"');
    assert(videoLockedCheck.result.value.isCentered === false, 'Kelas .is-centered ditanggalkan dari Video');

    // 5. Tambah Imbasan Baharu & Imbas Nota
    console.log('\n--- UJIAN 5: Tambah Imbasan Baharu & Buka Panel Nota Kedua ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.startAddPanelScan();
        window.handleTargetFound(1, 'nota');
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 300));

    const dualPanelOpenState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const vid = window.SpatialPanelManager.getPanel('video');
        const not = window.SpatialPanelManager.getPanel('nota');
        const vidEl = document.getElementById('pov-panel-video');
        const notEl = document.getElementById('pov-panel-nota');
        return {
          activePanelsCount: window.KotakARSELNEL.state.activePanels.size,
          videoVisible: vid.isVisible && !vidEl.classList.contains('hidden'),
          videoMode: vid.placementMode,
          notaVisible: not.isVisible && !notEl.classList.contains('hidden'),
          notaMode: not.placementMode,
          notaCentered: notEl.classList.contains('is-centered')
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Dual Panel Open State:', dualPanelOpenState.result.value);
    assert(dualPanelOpenState.result.value.activePanelsCount === 2, '2 panel aktif dalam ARState.activePanels');
    assert(dualPanelOpenState.result.value.videoVisible === true, 'Panel Video KEKAL kelihatan');
    assert(dualPanelOpenState.result.value.videoMode === 'POV_LOCKED', 'Panel Video KEKAL dalam mod POV_LOCKED');
    assert(dualPanelOpenState.result.value.notaVisible === true, 'Panel Nota kini kelihatan sebagai panel kedua');
    assert(dualPanelOpenState.result.value.notaMode === 'POV_SETUP', 'Panel Nota sedia dalam mod POV_SETUP');

    // 6. UJIAN KRITIKAL: KUNCI POV NOTA (#pov-nota-btn-anchor) — BUG 1 FIX VERIFICATION
    console.log('\n--- UJIAN 6: Kunci POV Nota & Sahkan Nota TIDAK HILANG (BUG 1 FIX) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        // Pusingkan sedikit orientasi sebelum kunci Nota (alpha=135, 45° offset)
        const qNota = window.KotakARSELNEL.computeDeviceCameraQuaternion(135, 0, 90, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qNota;
        window.KotakARSELNEL.state.pov.currentQuaternion = qNota.clone();
        
        // Tekan Kunci POV pada Nota
        document.getElementById('pov-nota-btn-anchor').click();
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const bug1FixState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const vid = window.SpatialPanelManager.getPanel('video');
        const not = window.SpatialPanelManager.getPanel('nota');
        const vidEl = document.getElementById('pov-panel-video');
        const notEl = document.getElementById('pov-panel-nota');
        const notBtn = document.getElementById('pov-nota-btn-anchor');
        const notTxt = document.getElementById('pov-nota-anchor-text');
        return {
          notaVisible: not.isVisible && !notEl.classList.contains('hidden') && notEl.classList.contains('is-visible'),
          notElStyleDisplay: window.getComputedStyle(notEl).display,
          notaPlacementMode: not.placementMode,
          notaIsLocked: not.isLocked,
          notaBtnLocked: notBtn.classList.contains('is-locked'),
          notaBtnText: notTxt ? notTxt.textContent : '',
          notaAnchorYaw: not.anchorYaw,
          videoVisible: vid.isVisible && !vidEl.classList.contains('hidden') && vidEl.classList.contains('is-visible'),
          videoPlacementMode: vid.placementMode,
          videoAnchorYaw: vid.anchorYaw
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('BUG 1 Fix State:', bug1FixState.result.value);
    assert(bug1FixState.result.value.notaVisible === true, '🎉 NOTA TIDAK HILANG! Kekal kelihatan selepas ditekan Lock POV');
    assert(bug1FixState.result.value.notaPlacementMode === 'POV_LOCKED', 'Nota placementMode bertukar ke POV_LOCKED');
    assert(bug1FixState.result.value.notaBtnLocked === true, 'Butang Nota mempunyai kelas is-locked');
    assert(bug1FixState.result.value.notaBtnText === 'Alih / Letak Semula', 'Teks butang Nota bertukar ke "Alih / Letak Semula"');
    assert(bug1FixState.result.value.videoVisible === true, 'Video KEKAL kelihatan bersama Nota');
    assert(bug1FixState.result.value.videoPlacementMode === 'POV_LOCKED', 'Video KEKAL dalam POV_LOCKED');

    // 7. Pengesahan Pengekalan Orientasi Spatial Kedua-dua Panel (Simultaneous 3DoF Projections)
    console.log('\n--- UJIAN 7: Unjuran Spatial Serentak Kedua-dua Panel Tanpa Campur-Aduk ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        // Pusingkan kamera ke arah asal Video (alpha=90)
        const qLookAtVid = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, 90, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qLookAtVid;
        window.KotakARSELNEL.state.pov.currentQuaternion = qLookAtVid.clone();
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const projectionCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const vidEl = document.getElementById('pov-panel-video');
        const notEl = document.getElementById('pov-panel-nota');
        const pVid = window.SpatialPanelManager.getPanel('video');
        const pNot = window.SpatialPanelManager.getPanel('nota');
        return {
          vidLeft: vidEl.style.left,
          vidTop: vidEl.style.top,
          vidDeltaYaw: pVid.deltaYaw,
          notLeft: notEl.style.left,
          notTop: notEl.style.top,
          notDeltaYaw: pNot.deltaYaw
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Dual Projection Output:', projectionCheck.result.value);
    assert(Math.abs(projectionCheck.result.value.vidDeltaYaw) < 1, `Video berpusat di hadapan kamera (ΔYaw=${projectionCheck.result.value.vidDeltaYaw.toFixed(1)}°)`);
    assert(Math.abs(projectionCheck.result.value.notDeltaYaw) > 20, `Nota berada pada sudut spatial tersendiri (ΔYaw=${projectionCheck.result.value.notDeltaYaw.toFixed(1)}°)`);

    // 8. Ujian Alih / Unlock Bebas (Toggle Lock Independent)
    console.log('\n--- UJIAN 8: Alih / Letak Semula Bebas (Unlock Nota Tanpa Ganggu Video) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        document.getElementById('pov-nota-btn-anchor').click(); // Unlock Nota
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const unlockNotaCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const vid = window.SpatialPanelManager.getPanel('video');
        const not = window.SpatialPanelManager.getPanel('nota');
        const notBtn = document.getElementById('pov-nota-btn-anchor');
        const notTxt = document.getElementById('pov-nota-anchor-text');
        return {
          notaMode: not.placementMode,
          notaBtnLocked: notBtn.classList.contains('is-locked'),
          notaBtnText: notTxt ? notTxt.textContent : '',
          videoMode: vid.placementMode,
          videoIsLocked: vid.isLocked
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Unlock Nota Output:', unlockNotaCheck.result.value);
    assert(unlockNotaCheck.result.value.notaMode === 'POV_SETUP', 'Nota kembali ke POV_SETUP (sedia dialihkan)');
    assert(unlockNotaCheck.result.value.notaBtnLocked === false, 'Kelas is-locked Nota ditanggalkan');
    assert(unlockNotaCheck.result.value.notaBtnText === 'Letak di Arah Ini', 'Teks butang Nota kembali ke "Letak di Arah Ini"');
    assert(unlockNotaCheck.result.value.videoMode === 'POV_LOCKED', 'Video KEKAL POV_LOCKED tanpa terjejas!');

    // 9. Telemetri Diagnostik
    console.log('\n--- UJIAN 9: Telemetri Diagnostik Real-Time Multi-Panel ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.updateDiagnosticsData(true);
      })()`
    }, cdpId++);

    const diagCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        return {
          screenOrient: document.getElementById('diag-screen-orient')?.textContent,
          videoStatus: document.getElementById('diag-video-status')?.textContent,
          notaStatus: document.getElementById('diag-nota-status')?.textContent
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Diagnostics DOM Check:', diagCheck.result.value);
    assert(diagCheck.result.value.screenOrient.includes('Landscape'), 'Telemetri skrin memaparkan Landscape');
    assert(diagCheck.result.value.videoStatus.includes('POV_LOCKED'), 'Telemetri Video memaparkan POV_LOCKED');
    assert(diagCheck.result.value.notaStatus.includes('POV_SETUP'), 'Telemetri Nota memaparkan POV_SETUP');

    // 10. Regresi CellQuest 3D
    console.log('\n--- UJIAN 10: Ujian Regresi CellQuest 3D GLB & Organel ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.switchActiveModule('cellquest');
        const cq = window.CellQuestARController;
        cq.loadModel('plant');
        cq.onTargetFound();
        cq.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 600));

    const cqCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          activeCell: cq.activeCellType,
          visible: cq.rootGroup.visible,
          organelles: cq.interactiveObjects.length
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('CellQuest Check:', cqCheck.result.value);
    assert(cqCheck.result.value.activeCell === 'plant', 'Model Sel Tumbuhan CellQuest dimuatkan');
    assert(cqCheck.result.value.visible === true, 'CellQuest rootGroup kelihatan');
    assert(cqCheck.result.value.organelles > 0, `Organel mesh wujud (${cqCheck.result.value.organelles} mesh)`);

    // 11. Regresi 5 Original Games
    console.log('\n--- UJIAN 11: Ujian Regresi Katalog 5 Permainan Sains ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.switchActiveModule('kuiz');
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 300));

    const gameCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const games = window.KotakARSELNEL.state.games;
        return {
          gamesCount: games ? games.length : 0,
          catalogRendered: !!document.getElementById('kuiz-cards-scroll')
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('5 Games Check:', gameCheck.result.value);
    assert(gameCheck.result.value.gamesCount === 5, '5 permainan sains asal kekal dalam katalog');

    // 12. Tangkap Gambar Skrin Pengesahan Visual
    console.log('\n--- UJIAN 12: Tangkap Gambar Bukti Visual Fasa 4E-B.2.3 ---');
    const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    const imgBuf = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync('kotak_arselnel_fasa4eb23_verified.png', imgBuf);
    console.log('📸 Tangkapan skrin disimpan ke kotak_arselnel_fasa4eb23_verified.png');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 12/12 UJIAN FASA 4E-B.2.3 BERJAYA LULUS DENGAN CEMERLANG!');
    console.log('========================================================================\n');

    await ws.close();
    chromeProc.kill();
    process.exit(0);

  } catch (err) {
    console.error('\n❌ RALAT SEMASA UJIAN:', err);
    cleanup();
    process.exit(1);
  }
}

run();

