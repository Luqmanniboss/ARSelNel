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
  console.log('================================================================');
  console.log('🧪 KOTAK ARSELNEL — FASA 4D-D.3: UJIAN LENGKAP PITCH KUNCI POV');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4dd3_${Date.now()}`);
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
    console.log('--- UJIAN 1: Permulaan Kotak ARSELNEL & Kamera Three.js ---');
    for (let i = 0; i < 20; i++) {
      const ready = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `!!(window.KotakARSELNEL && window.KotakARSELNEL.state && window.KotakARSELNEL.state.camera)`
      }, cdpId++);
      if (ready && ready.result && ready.result.value) break;
      await new Promise(r => setTimeout(r, 400));
    }

    const camCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cam = window.KotakARSELNEL.state.camera;
        return {
          camExists: !!cam,
          near: cam ? cam.near : null,
          far: cam ? cam.far : null
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    assert(camCheck.result.value.camExists, 'Kamera Three.js wujud dan aktif');
    assert(camCheck.result.value.near <= 0.1, `Near plane selamat dimampatkan (near=${camCheck.result.value.near})`);

    // 2. Aktifkan CellQuest 3D & Muat Model GLB Sel Tumbuhan
    console.log('\n--- UJIAN 2: Pemuatan Model Asal GLB CellQuest 3D ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const loadEl = document.getElementById('loading-screen');
        if (loadEl) loadEl.classList.add('hidden');
        window.KotakARSELNEL.switchActiveModule('cellquest');
        const cq = window.CellQuestARController;
        cq.loadModel('plant');
        cq.onTargetFound();
        cq.update(performance.now());
      })()`
    }, cdpId++);

    for (let i = 0; i < 30; i++) {
      const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
      if (st.result.value && st.result.value.includes('Berjaya')) {
        console.log(`Status GLB Sel Tumbuhan: ${st.result.value}`);
        break;
      }
      await new Promise(r => setTimeout(r, 300));
    }

    const modelState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          activeCell: cq.activeCellType,
          meshCount: cq.interactiveObjects.length,
          visible: cq.rootGroup.visible,
          status: cq.glbLoadStatus
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    assert(modelState.result.value.activeCell === 'plant', 'Model aktif ialah Sel Tumbuhan');
    assert(modelState.result.value.meshCount > 0, `Organel dimuatkan (${modelState.result.value.meshCount} mesh)`);
    assert(modelState.result.value.visible === true, 'RootGroup model kelihatan pada kamera');

    // 3. Semat Model (Screen Pinned)
    console.log('\n--- UJIAN 3: Semat Model (Screen Pinned) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('cq-btn-pin').click()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const pinnedCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          spatialMode: cq.spatialMode,
          visible: cq.rootGroup.visible,
          depth: cq.rootGroup.position.z
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Pinned Check:', pinnedCheck.result.value);
    assert(pinnedCheck.result.value.spatialMode === 'SCREEN_PINNED', 'Spatial mode bertukar ke SCREEN_PINNED');
    assert(pinnedCheck.result.value.visible === true, 'Model kekal kelihatan semasa disemat');

    // 4. Masuk ke Mod Penyediaan Kunci POV (Aiming Setup)
    console.log('\n--- UJIAN 4: Masuk ke Mod Kunci POV (Aiming Setup) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('cq-btn-pov').click()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const setupBannerCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        const banner = document.getElementById('cq-pov-setup-banner');
        return {
          spatialMode: cq.spatialMode,
          bannerVisible: banner && !banner.classList.contains('hidden')
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    assert(setupBannerCheck.result.value.spatialMode === 'POV_SETUP', 'Spatial mode bertukar ke POV_SETUP');
    assert(setupBannerCheck.result.value.bannerVisible === true, 'Banner penyediaan POV dipaparkan');

    // 5. Kunci POV pada Orientasi Rujukan (Landscape orient=90)
    console.log('\n--- UJIAN 5: Kunci POV pada Orientasi Rujukan (Landscape orient=90) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.state.pov.screenAngle = 90;
        const qRef = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, -90, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qRef;
        window.KotakARSELNEL.state.pov.currentQuaternion = qRef.clone();
        window.CellQuestARController.anchorPOVAtCurrentHeading();
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const anchorCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          spatialMode: cq.spatialMode,
          posX: cq.rootGroup.position.x,
          posY: cq.rootGroup.position.y,
          posZ: cq.rootGroup.position.z,
          visible: cq.rootGroup.visible,
          deltaYaw: cq.lastDeltaYaw,
          deltaPitch: cq.lastDeltaPitch
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Anchor State:', anchorCheck.result.value);
    assert(anchorCheck.result.value.spatialMode === 'POV_LOCKED', 'Spatial mode bertukar ke POV_LOCKED');
    assert(Math.abs(anchorCheck.result.value.posX) < 0.05, 'Model berpusat di tengah paksi X');
    assert(Math.abs(anchorCheck.result.value.posY) < 0.05, 'Model berpusat di tengah paksi Y');
    assert(anchorCheck.result.value.visible === true, 'Model kekal kelihatan di hadapan');

    // 6. UJIAN PITCH DONGAK (Tilt iPad UP 30°)
    console.log('\n--- UJIAN 6: Ujian Pitch Dongak (Tilt iPad UP 30°) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        // iPad didongakkan ke atas: gamma berubah dari -90 ke -120 (tilting top back by 30 deg)
        const qDongak = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, -120, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qDongak;
        window.KotakARSELNEL.state.pov.currentQuaternion = qDongak.clone();
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const dongakState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        const pointer = document.getElementById('pov-offscreen-pointer');
        const bearing = document.getElementById('pov-pointer-bearing');
        return {
          posY: cq.rootGroup.position.y,
          deltaPitch: cq.lastDeltaPitch,
          deltaYaw: cq.lastDeltaYaw,
          vCamY: cq.lastVCam ? cq.lastVCam.y : null,
          pointerVisible: pointer && !pointer.classList.contains('hidden'),
          pointerAtBottom: pointer && pointer.classList.contains('at-bottom'),
          bearingText: bearing ? bearing.textContent.trim() : ''
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Dongak State (Tilt UP):', dongakState.result.value);
    assert(dongakState.result.value.posY < -1.0, `Model beralih ke BAWAH dalam viewport (Y=${dongakState.result.value.posY.toFixed(2)})`);
    assert(dongakState.result.value.deltaPitch < -20, `Delta pitch negatif dikesan (ΔPitch=${dongakState.result.value.deltaPitch.toFixed(1)}°)`);
    assert(dongakState.result.value.pointerAtBottom === true, 'Penunjuk luar skrin (pointer) di bahagian BAWAH');
    assert(dongakState.result.value.bearingText.includes('Model di Bawah'), 'Teks bearing memaparkan "Model di Bawah"');

    // 7. UJIAN PITCH TUNDUK (Tilt iPad DOWN 30°)
    console.log('\n--- UJIAN 7: Ujian Pitch Tunduk (Tilt iPad DOWN 30°) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        // iPad ditundukkan ke bawah: gamma berubah dari -90 ke -60 (tilting top forward by 30 deg)
        const qTunduk = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, -60, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qTunduk;
        window.KotakARSELNEL.state.pov.currentQuaternion = qTunduk.clone();
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const tundukState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        const pointer = document.getElementById('pov-offscreen-pointer');
        const bearing = document.getElementById('pov-pointer-bearing');
        return {
          posY: cq.rootGroup.position.y,
          deltaPitch: cq.lastDeltaPitch,
          deltaYaw: cq.lastDeltaYaw,
          vCamY: cq.lastVCam ? cq.lastVCam.y : null,
          pointerVisible: pointer && !pointer.classList.contains('hidden'),
          pointerAtTop: pointer && pointer.classList.contains('at-top'),
          bearingText: bearing ? bearing.textContent.trim() : ''
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Tunduk State (Tilt DOWN):', tundukState.result.value);
    assert(tundukState.result.value.posY > 1.0, `Model beralih ke ATAS dalam viewport (Y=${tundukState.result.value.posY.toFixed(2)})`);
    assert(tundukState.result.value.deltaPitch > 20, `Delta pitch positif dikesan (ΔPitch=${tundukState.result.value.deltaPitch.toFixed(1)}°)`);
    assert(tundukState.result.value.pointerAtTop === true, 'Penunjuk luar skrin (pointer) di bahagian ATAS');
    assert(tundukState.result.value.bearingText.includes('Model di Atas'), 'Teks bearing memaparkan "Model di Atas"');

    // 8. UJIAN KEMBALI KE RUJUKAN ASAL
    console.log('\n--- UJIAN 8: Ujian Kembali ke Orientasi Rujukan (Zero Tilt/Yaw) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const qRef = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, -90, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qRef;
        window.KotakARSELNEL.state.pov.currentQuaternion = qRef.clone();
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const returnState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        const pointer = document.getElementById('pov-offscreen-pointer');
        return {
          posX: cq.rootGroup.position.x,
          posY: cq.rootGroup.position.y,
          posZ: cq.rootGroup.position.z,
          deltaPitch: cq.lastDeltaPitch,
          deltaYaw: cq.lastDeltaYaw,
          pointerHidden: pointer.classList.contains('hidden'),
          modelVisible: cq.rootGroup.visible
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Return State:', returnState.result.value);
    assert(Math.abs(returnState.result.value.posY) < 0.05, 'Model kembali tegak ke tengah paksi Y');
    assert(Math.abs(returnState.result.value.posX) < 0.05, 'Model kembali tegak ke tengah paksi X');
    assert(returnState.result.value.modelVisible === true, 'Model kelihatan di tengah skrin');
    assert(returnState.result.value.pointerHidden === true, 'Penunjuk luar skrin disembunyikan');

    // 9. UJIAN SIMULASI SUDUT (applySimAngles)
    console.log('\n--- UJIAN 9: Pengesahan applySimAngles(yaw, pitch) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.applySimAngles(0, 35);
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const simPitchState = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          posY: cq.rootGroup.position.y,
          deltaPitch: cq.lastDeltaPitch
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Simulated Pitch +35°:', simPitchState.result.value);
    assert(simPitchState.result.value.posY < -1.0, `applySimAngles(0, 35) menganjak model ke bawah (Y=${simPitchState.result.value.posY.toFixed(2)})`);

    // Reset angles
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.applySimAngles(0, 0);
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);

    // 10. UJIAN TELEMETRI DIAGNOSTIK
    console.log('\n--- UJIAN 10: Pengesahan Telemetri Diagnostik Real-Time ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.updateDiagnosticsData(true);
      })()`
    }, cdpId++);

    const diagCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        return {
          vCamText: document.getElementById('diag-cq-vcam') ? document.getElementById('diag-cq-vcam').textContent : null,
          deltaText: document.getElementById('diag-cq-delta') ? document.getElementById('diag-cq-delta').textContent : null,
          diagDeltaPitch: document.getElementById('diag-delta-pitch') ? document.getElementById('diag-delta-pitch').textContent : null,
          diagDeltaYaw: document.getElementById('diag-delta-yaw') ? document.getElementById('diag-delta-yaw').textContent : null
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Diagnostics DOM check:', diagCheck.result.value);
    assert(diagCheck.result.value.vCamText && diagCheck.result.value.vCamText.includes('X:'), 'diag-cq-vcam memaparkan koordinat vektor 3D');
    assert(diagCheck.result.value.deltaText && diagCheck.result.value.deltaText.includes('ΔP:'), 'diag-cq-delta memaparkan nilai delta pitch');

    // 11. UJIAN RECENTER / RECALIBRATE DALAM POV
    console.log('\n--- UJIAN 11: Pengesahan Recalibrate / Recenter dalam Mod POV ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.state.pov.isSimulated = false;
        // Didongakkan ke atas dan tekan recenter
        const qTilt = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, -120, 90);
        window.KotakARSELNEL.state.pov.targetQuaternion = qTilt;
        window.KotakARSELNEL.state.pov.currentQuaternion = qTilt.clone();
        window.CellQuestARController.recenterModel();
        window.CellQuestARController.update(performance.now());
      })()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 150));

    const recenterCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          posY: cq.rootGroup.position.y,
          deltaPitch: cq.lastDeltaPitch
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Recenter Check in POV:', recenterCheck.result.value);
    assert(Math.abs(recenterCheck.result.value.posY) < 0.05, 'Model kembali ke tengah (Y=0) selepas ditekan Recenter');

    // 12. UJIAN KELUAR POV & SEMAT SEMULA
    console.log('\n--- UJIAN 12: Keluar POV dan Pengekalan Objek GLB ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('cq-btn-pov').click()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const exitCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          spatialMode: cq.spatialMode,
          visible: cq.rootGroup.visible,
          meshCount: cq.interactiveObjects.length,
          glbStatus: cq.glbLoadStatus
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Exit POV Check:', exitCheck.result.value);
    assert(exitCheck.result.value.spatialMode === 'SCREEN_PINNED', 'Spatial mode kembali ke SCREEN_PINNED');
    assert(exitCheck.result.value.visible === true, 'Model kekal kelihatan tanpa hilang');
    assert(exitCheck.result.value.meshCount > 0, 'Organel mesh kekal dalam memori');

    // 13. TUKAR MODEL SEL HAIWAN & TUMBUHAN
    console.log('\n--- UJIAN 13: Pertukaran Model Sel Haiwan & Sel Tumbuhan ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('cq-btn-plant').click()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));

    const plantCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          activeCellType: cq.activeCellType,
          visible: cq.rootGroup.visible,
          meshCount: cq.interactiveObjects.length
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Plant Cell Check:', plantCheck.result.value);
    assert(plantCheck.result.value.activeCellType === 'plant', 'Model Sel Tumbuhan aktif');
    assert(plantCheck.result.value.visible === true, 'Model Sel Tumbuhan kelihatan');

    // 14. UJIAN NYAHSEMAT & KEMBALI KE MARKER MODE
    console.log('\n--- UJIAN 14: Nyahsemat & Kembali ke Mod Marker Asal ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `document.getElementById('cq-btn-pin').click()`
    }, cdpId++);
    await new Promise(r => setTimeout(r, 200));

    const unpinCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const cq = window.CellQuestARController;
        return {
          spatialMode: cq.spatialMode,
          parent: cq.rootGroup.parent === cq.anchorGroup ? 'anchorGroup' : 'camera'
        };
      })()`,
      returnByValue: true
    }, cdpId++);
    console.log('Unpin Check:', unpinCheck.result.value);
    assert(unpinCheck.result.value.spatialMode === 'MARKER_MODE', 'Spatial mode kembali ke MARKER_MODE');
    assert(unpinCheck.result.value.parent === 'anchorGroup', 'Model dipasang semula sebagai anak kepada anchorGroup fizikal');

    // Tangkap tangkap layar pengesahan
    const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    fs.writeFileSync('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_fasa4dd3_verified.png', Buffer.from(shot.data, 'base64'));
    console.log('📸 Tangkap layar disimpan: kotak_arselnel_fasa4dd3_verified.png');

    console.log('\n===============================================================');
    console.log('🎉 SEMUA 14/14 UJIAN FASA 4D-D.3 LULUS DENGAN CEMERLANG!');
    console.log('===============================================================');

  } finally {
    cleanup();
  }
}

run().catch((err) => {
  console.error('CRITICAL TEST ERROR:', err);
  process.exit(1);
});
