const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9329;

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
  console.log('🧪 VERIFIKASI AUTOMATIK LENGKAP KOTAK ARSELNEL FASA 4D-D.2');
  console.log('   Kunci POV 3DoF, Telemetri, Orientasi & Ujian Regresi');
  console.log('================================================================');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_pov_${Date.now()}`);
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

  await new Promise(r => setTimeout(r, 4000));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  // 1. Camera Safety & Depth Buffer Audit
  console.log('\n--- UJIAN 1: Keselamatan Frustum Kamera & Depth Buffer ---');
  // Tunggu sehingga window.KotakARSELNEL sedia
  for (let i = 0; i < 20; i++) {
    const ready = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `!!(window.KotakARSELNEL && window.KotakARSELNEL.state && window.KotakARSELNEL.state.camera)`
    }, cdpId++);
    if (ready && ready.result && ready.result.value) break;
    await new Promise(r => setTimeout(r, 500));
  }

  const camCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      try {
        const cam = window.KotakARSELNEL.state.camera;
        const m3 = window.KotakARSELNEL.state.mindarThree;
        if (m3 && typeof m3.resize === 'function') m3.resize();
        return {
          camExists: !!cam,
          near: cam ? cam.near : null,
          far: cam ? cam.far : null
        };
      } catch (err) {
        return { error: err.message };
      }
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('camCheck raw:', JSON.stringify(camCheck));
  const camInfo = (camCheck && camCheck.result) ? camCheck.result.value : null;
  assert(camInfo.camExists, 'Kamera Three.js wujud');
  assert(camInfo.near <= 0.1, `Near plane kamera selamat dimampatkan (near=${camInfo.near} <= 0.1)`);
  assert(camInfo.far >= 1000, `Far plane kamera mencukupi (far=${camInfo.far})`);

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
    })()`
  }, cdpId++);

  for (let i = 0; i < 30; i++) {
    const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
    if (st.result.value && st.result.value.includes('Berjaya')) {
      console.log(`Status GLB Sel Tumbuhan: ${st.result.value}`);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
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
  assert(modelState.result.value.meshCount > 0, `Mesh organel dimuatkan (${modelState.result.value.meshCount} mesh)`);
  assert(modelState.result.value.visible === true, 'RootGroup model kelihatan');

  // 3. Uji Semat Model & Seret Model (X/Y)
  console.log('\n--- UJIAN 3: Semat Model & Seret Model (X & Y) ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pin').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const pinInfo = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        mode: cq.spatialMode,
        visible: cq.rootGroup.visible,
        parent: cq.rootGroup.parent.type,
        pinLabel: document.getElementById('cq-pin-label').textContent.trim()
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(pinInfo.result.value.mode === 'SCREEN_PINNED', 'Mod berpindah ke SCREEN_PINNED');
  assert(pinInfo.result.value.visible === true, 'Model kekal kelihatan selepas disemat');
  assert(pinInfo.result.value.pinLabel === 'Nyahsemat', 'Label butang bertukar ke Nyahsemat');

  // Uji Seret
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      cq.setTouchMode('DRAG');
      const down = new PointerEvent('pointerdown', { clientX: 200, clientY: 200, pointerId: 1, bubbles: true, cancelable: true });
      const move = new PointerEvent('pointermove', { clientX: 250, clientY: 280, pointerId: 1, bubbles: true, cancelable: true });
      const up = new PointerEvent('pointerup', { clientX: 250, clientY: 280, pointerId: 1, bubbles: true, cancelable: true });
      window.dispatchEvent(down);
      window.dispatchEvent(move);
      window.dispatchEvent(up);
      return {
        dragX: cq.dragOffset.x,
        dragY: cq.dragOffset.y,
        posX: cq.rootGroup.position.x,
        posY: cq.rootGroup.position.y
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  const dragInfo = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `({ dragX: window.CellQuestARController.dragOffset.x, dragY: window.CellQuestARController.dragOffset.y })`,
    returnByValue: true
  }, cdpId++);
  assert(dragInfo.result.value.dragX !== 0 || dragInfo.result.value.dragY !== 0, 'Seret mengemas kini koordinat anjakan');

  // 4. Masuk ke Mod POV Setup
  console.log('\n--- UJIAN 4: Masuk ke Mod POV Setup & Banner Panduan ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pov').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 300));

  const povSetupState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const banner = document.getElementById('cq-pov-setup-banner');
      const bannerVisible = banner && !banner.classList.contains('hidden');
      return {
        mode: cq.spatialMode,
        bannerVisible,
        modelVisible: cq.rootGroup.visible,
        camNear: cq.camera.near
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(povSetupState.result.value.mode === 'POV_SETUP', 'Mod bertukar ke POV_SETUP');
  assert(povSetupState.result.value.bannerVisible === true, 'Banner #cq-pov-setup-banner dipaparkan');
  assert(povSetupState.result.value.modelVisible === true, 'Model kekal kelihatan di hadapan pengguna semasa membidik');

  // 5. Kunci Heading Rujukan ("Letak di Arah Ini")
  console.log('\n--- UJIAN 5: Kunci Heading Rujukan ("Letak di Arah Ini") ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pov-anchor').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const povLockedState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const banner = document.getElementById('cq-pov-setup-banner');
      const povBtn = document.getElementById('cq-btn-pov');
      const povLabel = document.getElementById('cq-pov-label');
      return {
        mode: cq.spatialMode,
        bannerHidden: banner.classList.contains('hidden'),
        btnLocked: povBtn.classList.contains('is-locked'),
        btnLabel: povLabel.textContent.trim(),
        hasAnchorVector: !!cq.povAnchorWorldVector,
        modelVisible: cq.rootGroup.visible
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(povLockedState.result.value.mode === 'POV_LOCKED', 'Mod berjaya bertukar ke POV_LOCKED');
  assert(povLockedState.result.value.bannerHidden === true, 'Banner setup disembunyikan');
  assert(povLockedState.result.value.btnLocked === true, 'Butang POV mempunyai kelas .is-locked');
  assert(povLockedState.result.value.btnLabel === 'Keluar POV', 'Label butang ialah "Keluar POV"');
  assert(povLockedState.result.value.hasAnchorVector === true, 'Vektor sauh 3D dunia berjaya direkodkan');
  assert(povLockedState.result.value.modelVisible === true, 'Model 3D kelihatan di tengah skrin');

  // 6. Simulasi Pusingan Giroskop Yaw +50° (Pusing Kanan -> Model Beralih ke Kiri)
  console.log('\n--- UJIAN 6: Simulasi Yaw +50° (Pusing Kanan) ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.applySimAngles(50, 0);
      window.CellQuestARController.update(performance.now());
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 100));

  const yaw50State = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const pointer = document.getElementById('pov-offscreen-pointer');
      const bearing = document.getElementById('pov-pointer-bearing');
      return {
        posX: cq.rootGroup.position.x,
        posZ: cq.rootGroup.position.z,
        deltaYaw: cq.lastDeltaYaw,
        pointerVisible: pointer && !pointer.classList.contains('hidden'),
        pointerAtLeft: pointer && pointer.classList.contains('at-left'),
        bearingText: bearing ? bearing.textContent.trim() : ''
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Yaw +50° Data:', yaw50State.result.value);
  assert(yaw50State.result.value.posX < -1.5, `Model beralih ke kiri keluar viewport (X=${yaw50State.result.value.posX.toFixed(2)})`);
  assert(yaw50State.result.value.pointerVisible === true, 'Penunjuk luar skrin (Offscreen Pointer) muncul');
  assert(yaw50State.result.value.pointerAtLeft === true, 'Penunjuk berada di sisi KIRI');
  assert(yaw50State.result.value.bearingText.includes('Kiri'), 'Teks bearing menyatakan Model di Kiri');

  // 7. Simulasi Kembali ke Yaw 0° (Model Kembali ke Tengah)
  console.log('\n--- UJIAN 7: Simulasi Yaw 0° (Kembali Menghadap Sauh) ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.applySimAngles(0, 0);
      window.CellQuestARController.update(performance.now());
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 100));

  const yaw0State = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const pointer = document.getElementById('pov-offscreen-pointer');
      return {
        posX: cq.rootGroup.position.x,
        posZ: cq.rootGroup.position.z,
        dragOffsetX: cq.dragOffset.x,
        deltaYaw: cq.lastDeltaYaw,
        modelVisible: cq.rootGroup.visible,
        pointerHidden: pointer.classList.contains('hidden')
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Yaw 0° Data:', yaw0State.result.value);
  assert(Math.abs(yaw0State.result.value.posX - yaw0State.result.value.dragOffsetX) < 0.05, 'Model kembali ke tengah skrin mengikut sauh');
  assert(yaw0State.result.value.modelVisible === true, 'Model kekal kelihatan');
  assert(yaw0State.result.value.pointerHidden === true, 'Penunjuk luar skrin disembunyikan secara automatik');

  // 8. Simulasi Pitch +45° (Dongak Atas) & Pitch -45° (Tunduk Bawah)
  console.log('\n--- UJIAN 8: Simulasi Pitch +45° dan Pitch -45° ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.applySimAngles(0, 45);
      window.CellQuestARController.update(performance.now());
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 100));

  const pitchUpState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const pointer = document.getElementById('pov-offscreen-pointer');
      return {
        posY: cq.rootGroup.position.y,
        pointerAtBottom: pointer && pointer.classList.contains('at-bottom')
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  console.log('Pitch +45° Data:', pitchUpState.result.value);
  assert(pitchUpState.result.value.posY < -1.2, `Dongak atas menyebabkan model beralih ke bawah (Y=${pitchUpState.result.value.posY.toFixed(2)})`);
  assert(pitchUpState.result.value.pointerAtBottom === true, 'Penunjuk menunjukkan arah BAWAH');

  // Kembali ke Pitch 0
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.applySimAngles(0, 0);
      window.CellQuestARController.update(performance.now());
    })()`
  }, cdpId++);

  // 9. Uji Model Tidak Dimuat Semula & Pengekalan Objek
  console.log('\n--- UJIAN 9: Pengekalan Objek 3D Tanpa Memuat Semula GLB ---');
  const cacheCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        hasPlantCache: !!cq.cachedGltfScenes.plant,
        meshCount: cq.interactiveObjects.length,
        status: cq.glbLoadStatus
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(cacheCheck.result.value.hasPlantCache === true, 'Cache GLB sedia dalam memori');
  assert(cacheCheck.result.value.status.includes('Berjaya'), 'Status muat GLB kekal Berjaya tanpa reset');

  // 10. Uji Kalibrasi Semula / Recenter dalam Mod POV
  console.log('\n--- UJIAN 10: Kalibrasi Semula / Recenter dalam Mod POV ---');
  // Pusingkan ke 30 darjah dan tekan Recenter
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.KotakARSELNEL.applySimAngles(30, 0);
      window.CellQuestARController.recenterModel();
      window.CellQuestARController.update(performance.now());
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 100));

  const recenterState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        anchorYaw: cq.povAnchorHeading.yaw,
        posX: cq.rootGroup.position.x,
        posZ: cq.rootGroup.position.z
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(recenterState.result.value.anchorYaw === 30, 'Sauh POV berjaya dikalibrasi semula ke sudut 30°');
  assert(Math.abs(recenterState.result.value.posX) < 0.05, 'Model kembali serta-merta ke tengah skrin selepas kalibrasi semula');

  // 11. Uji Keluar POV
  console.log('\n--- UJIAN 11: Keluar daripada Mod Kunci POV ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-pov').click()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const exitPOVState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      const povBtn = document.getElementById('cq-btn-pov');
      const povLabel = document.getElementById('cq-pov-label');
      const pointer = document.getElementById('pov-offscreen-pointer');
      return {
        mode: cq.spatialMode,
        btnLocked: povBtn.classList.contains('is-locked'),
        btnLabel: povLabel.textContent.trim(),
        pointerHidden: pointer.classList.contains('hidden'),
        modelVisible: cq.rootGroup.visible
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(exitPOVState.result.value.mode === 'SCREEN_PINNED', 'Mod kembali ke SCREEN_PINNED');
  assert(exitPOVState.result.value.btnLocked === false, 'Kelas .is-locked ditanggalkan');
  assert(exitPOVState.result.value.btnLabel === 'Kunci POV', 'Label butang kembali ke "Kunci POV"');
  assert(exitPOVState.result.value.pointerHidden === true, 'Penunjuk luar skrin ditutup');
  assert(exitPOVState.result.value.modelVisible === true, 'Model kekal kelihatan');

  // 12. Uji Penukaran Model ke Sel Haiwan
  console.log('\n--- UJIAN 12: Penukaran Model ke Sel Haiwan ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('cq-btn-animal').click()`
  }, cdpId++);

  for (let i = 0; i < 30; i++) {
    const st = await sendCDP(ws, 'Runtime.evaluate', { expression: 'window.CellQuestARController.glbLoadStatus' }, cdpId++);
    if (st.result.value && st.result.value.includes('Berjaya')) {
      console.log(`Status GLB Sel Haiwan: ${st.result.value}`);
      break;
    }
    await new Promise(r => setTimeout(r, 400));
  }

  const animalState = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cq = window.CellQuestARController;
      return {
        activeCell: cq.activeCellType,
        meshCount: cq.interactiveObjects.length,
        visible: cq.rootGroup.visible
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(animalState.result.value.activeCell === 'animal', 'Model bertukar ke Sel Haiwan');
  assert(animalState.result.value.meshCount > 0, `Mesh organel haiwan sedia (${animalState.result.value.meshCount} mesh)`);
  assert(animalState.result.value.visible === true, 'Model Sel Haiwan kelihatan');

  // 13. Tangkap Tangkapan Skrin Pengesahan Visual (Artifact)
  console.log('\n--- UJIAN 13: Tangkapan Skrin Pengesahan Visual ---');
  const shot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const artifactPath = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4dd2_verified.png';
  fs.writeFileSync(artifactPath, Buffer.from(shot.data, 'base64'));
  console.log(`✅ Tangkapan skrin disimpan ke: ${artifactPath}`);

  // 14. Ujian Regresi Marker 0 (Video), Marker 1 (Nota), Marker 2 (Kuiz)
  console.log('\n--- UJIAN 14: Ujian Regresi Marker 0, 1 & 2 ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Deactivate CellQuest
      window.CellQuestARController.deactivate();
      
      // Test Marker 0 (Video)
      window.KotakARSELNEL.switchActiveModule('video');
    })()`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));

  const videoRegress = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const topHud = document.querySelector('.ar-top-hud');
      const floating = document.getElementById('floating-ar-anchor');
      return {
        topHudVisible: !topHud.classList.contains('hidden'),
        activeModule: window.KotakARSELNEL.state.activeModule,
        floatingExists: !!floating
      };
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(videoRegress.result.value.activeModule === 'video', 'Marker 0 (Video) aktif');
  assert(videoRegress.result.value.topHudVisible === true, 'HUD atas dikembalikan untuk Video');

  // Test Marker 1 (Nota)
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.KotakARSELNEL.switchActiveModule('nota')`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));
  const notaRegress = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.activeModule`
  }, cdpId++);
  assert(notaRegress.result.value === 'nota', 'Marker 1 (Nota) aktif');

  // Test Marker 2 (Kuiz)
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.KotakARSELNEL.switchActiveModule('kuiz')`
  }, cdpId++);
  await new Promise(r => setTimeout(r, 200));
  const kuizRegress = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `window.KotakARSELNEL.state.activeModule`
  }, cdpId++);
  assert(kuizRegress.result.value === 'kuiz', 'Marker 2 (Kuiz) aktif');

  console.log('\n================================================================');
  console.log('🎉 SEMUA 14 UJIAN INTEGRASI & REGRESI FASA 4D-D.2 TELAH LULUS!');
  console.log('================================================================');

  ws.close();
  cleanup();
}

run().catch((err) => {
  console.error('\n❌ RALAT UJIAN:', err);
  process.exit(1);
});
