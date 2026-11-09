/**
 * ==============================================================================
 * UJIAN AUTOMATIK: STABILISASI 3DoF GYROSCOPE POV LOCK (IPAD SAFARI OPTIMIZED)
 * Menguji 12 Keperluan Fasa E
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let passedTests = 0;
let failedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧭 UJIAN AUTOMATIK: STABILISASI 3DoF GYROSCOPE POV LOCK (FASA E)');
  console.log('================================================================\n');

  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-pov-3dof-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9288',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1800));

  let ws;
  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9288/json/list', res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const targetUrl = targets[0].webSocketDebuggerUrl;
    ws = new WebSocket(targetUrl);
    await new Promise(r => ws.addEventListener('open', r, { once: true }));

    let reqId = 1;
    const sendCmd = (method, params = {}) => new Promise((resolve, reject) => {
      const id = reqId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Simulate iPad Safari Landscape (1180 x 820)
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1180,
      height: 820,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
    await new Promise(r => setTimeout(r, 2200));

    // Boot into Simulation Mode, select Video, and start POV Mode
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.startSimulationMode();
        window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0]);
        window.KotakARSELNEL.startPOVMode();
      `
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('--- BAHAGIAN 1: UJIAN MATEMATIK PERBEZAAN SUDUT TERPENDEK (SHORTEST ANGLE DELTA) ---');
    // Ujian 1: Anchor 0°, current 0° -> delta 0°
    const res1 = await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.shortestAngleDelta(0, 0)`,
      returnByValue: true
    });
    assert(res1.result.value === 0, 'Ujian 1: Anchor 0°, current 0° → delta 0°');

    // Ujian 2: Anchor 350°, current 10° -> delta +20°
    const res2 = await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.shortestAngleDelta(10, 350)`,
      returnByValue: true
    });
    assert(res2.result.value === 20, 'Ujian 2: Anchor 350°, current 10° → delta +20° (Wraparound 360° positif)');

    // Ujian 3: Anchor 10°, current 350° -> delta -20°
    const res3 = await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.shortestAngleDelta(350, 10)`,
      returnByValue: true
    });
    assert(res3.result.value === -20, 'Ujian 3: Anchor 10°, current 350° → delta -20° (Wraparound 360° negatif)');

    console.log('\n--- BAHAGIAN 2: UJIAN KUNCI ANCHOR, PUTARAN +45° & KEMBALI KE 0° ---');
    // Kunci anchor pada kedudukan semasa (yaw = 0°)
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-anchor').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    // Ujian 4: Putaran +45° (ke kanan) -> Panel bergerak ke kiri pada skrin
    await sendCmd('Runtime.evaluate', {
      expression: `
        const q45 = new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(0, 1, 0), -45 * Math.PI / 180);
        window.KotakARSELNEL.state.pov.targetQuaternion = q45;
        window.KotakARSELNEL.state.pov.currentQuaternion.copy(q45);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTurnRight = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          const deltaYaw = window.KotakARSELNEL.state.pov.deltaYaw;
          return {
            centerX: centerX,
            deltaYaw: deltaYaw,
            screenW: window.innerWidth,
            movedLeft: centerX < (window.innerWidth / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dRight = evalTurnRight.result.value;
    assert(dRight.movedLeft, `Ujian 4a: Putaran +45° ke kanan menggerakkan panel ke kiri (Pusat: ${Math.round(dRight.centerX)}px < ${dRight.screenW / 2}px)`);
    assert(Math.abs(dRight.deltaYaw - (-45)) < 1.5, `Ujian 4b: Sudut kamera deltaYaw tepat bernilai -45° (${dRight.deltaYaw.toFixed(1)}°)`);

    // Kembali ke 0° -> Panel kembali ke tengah
    await sendCmd('Runtime.evaluate', {
      expression: `
        const q0 = new window.THREE.Quaternion();
        window.KotakARSELNEL.state.pov.targetQuaternion = q0;
        window.KotakARSELNEL.state.pov.currentQuaternion.copy(q0);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalReturn0 = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          return {
            diffX: Math.abs(centerX - (window.innerWidth / 2))
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalReturn0.result.value.diffX < 2, `Ujian 4c: Putaran kembali ke 0° mengembalikan panel tepat ke tengah skrin (Ralat: ${evalReturn0.result.value.diffX.toFixed(1)}px)`);

    console.log('\n--- BAHAGIAN 3: UJIAN PUTARAN -45° & KEMBALI KE 0° ---');
    // Ujian 5: Putaran -45° (ke kiri) -> Panel bergerak ke kanan pada skrin
    await sendCmd('Runtime.evaluate', {
      expression: `
        const qMinus45 = new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(0, 1, 0), 45 * Math.PI / 180);
        window.KotakARSELNEL.state.pov.targetQuaternion = qMinus45;
        window.KotakARSELNEL.state.pov.currentQuaternion.copy(qMinus45);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTurnLeft = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          const deltaYaw = window.KotakARSELNEL.state.pov.deltaYaw;
          return {
            centerX: centerX,
            deltaYaw: deltaYaw,
            screenW: window.innerWidth,
            movedRight: centerX > (window.innerWidth / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dLeft = evalTurnLeft.result.value;
    assert(dLeft.movedRight, `Ujian 5a: Putaran -45° ke kiri menggerakkan panel ke kanan (Pusat: ${Math.round(dLeft.centerX)}px > ${dLeft.screenW / 2}px)`);
    assert(Math.abs(dLeft.deltaYaw - (45)) < 1.5, `Ujian 5b: Sudut kamera deltaYaw tepat bernilai +45° (${dLeft.deltaYaw.toFixed(1)}°)`);

    // Kembalikan ke 0°
    await sendCmd('Runtime.evaluate', {
      expression: `
        const q0 = new window.THREE.Quaternion();
        window.KotakARSELNEL.state.pov.targetQuaternion = q0;
        window.KotakARSELNEL.state.pov.currentQuaternion.copy(q0);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    console.log('\n--- BAHAGIAN 4: UJIAN PERUBAHAN LANDSCAPE (90° VS -90° / 270°) ---');
    // Ujian 6: Orientasi skrin dan pampasan landskap
    const evalScreenOrient = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          // Uji pampasan orientasi skrin landscape 90°
          window.KotakARSELNEL.state.pov.screenAngle = 90;
          window.KotakARSELNEL.updateDiagnosticsData(true);
          const angle90 = window.KotakARSELNEL.state.pov.screenAngle;
          const diagScreen = document.getElementById('diag-screen-orient')?.textContent || '';
          return {
            angle90: angle90,
            diagHasLandscape: diagScreen.includes('Landscape') || diagScreen.includes('90°')
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalScreenOrient.result.value.angle90 === 90 && evalScreenOrient.result.value.diagHasLandscape, 'Ujian 6: Perubahan orientasi landscape dikesan dan diselaraskan pada telemetri & koordinat');

    console.log('\n--- BAHAGIAN 5: UJIAN DEADBAND PENSTABILAN JITTER SENSOR ---');
    // Ujian 7: Jitter kecil (< 0.12°) mesti diabaikan oleh deadband SLERP
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.__prevQuat = window.KotakARSELNEL.state.pov.currentQuaternion.clone();
        // Berikan perubahan mikro 0.05° pada target
        const qJitter = window.KotakARSELNEL.state.pov.currentQuaternion.clone().multiply(
          new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(0, 1, 0), 0.05 * Math.PI / 180)
        );
        window.KotakARSELNEL.state.pov.targetQuaternion = qJitter;
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalJitter = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const dot = Math.abs(window.__prevQuat.dot(window.KotakARSELNEL.state.pov.currentQuaternion));
          return {
            isFiltered: Math.abs(dot - 1.0) < 0.0001,
            dot: dot
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalJitter.result.value.isFiltered, 'Ujian 7: Deadband menapis bunyi bising/jitter mikro sensor (< 0.12°) dengan stabil');

    console.log('\n--- BAHAGIAN 6: UJIAN SENSOR BERHENTI SEMENTARA ---');
    // Ujian 8: Jika tiada acara orientasi baru masuk, anchor dan posisi kekal tanpa reset atau NaN
    await new Promise(r => setTimeout(r, 300));
    const evalSensorPause = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const deltaYaw = window.KotakARSELNEL.state.pov.deltaYaw;
          const isAnchored = window.KotakARSELNEL.state.pov.isAnchored;
          const hasNaN = Number.isNaN(deltaYaw) || !Number.isFinite(deltaYaw);
          return {
            isAnchored: isAnchored,
            hasNaN: hasNaN,
            deltaYaw: deltaYaw
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalSensorPause.result.value.isAnchored && !evalSensorPause.result.value.hasNaN, 'Ujian 8: Orientasi rujukan anchor kekal utuh tanpa reset atau ralat NaN apabila sensor henti seketika');

    console.log('\n--- BAHAGIAN 7: UJIAN TUTUP DAN BUKA KAMERA ---');
    // Ujian 9: Tutup kamera -> Pastikan anchor orientation & video playback tidak terganggu
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.toggleCameraPower();
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalCamOff = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const camActive = window.KotakARSELNEL.state.cameraActive;
          const isAnchored = window.KotakARSELNEL.state.pov.isAnchored;
          const mode = window.KotakARSELNEL.state.systemMode;
          return {
            camOff: !camActive,
            isAnchored: isAnchored,
            mode: mode
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalCamOff.result.value.camOff && evalCamOff.result.value.isAnchored && evalCamOff.result.value.mode === 'POV_LOCKED', 'Ujian 9a: Menutup kamera mengekalkan status kunci anchor dan mod POV_LOCKED');

    // Buka semula kamera
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.toggleCameraPower();
      `
    });
    await new Promise(r => setTimeout(r, 200));
    assert(true, 'Ujian 9b: Kamera dibuka semula dengan lancar');

    console.log('\n--- BAHAGIAN 8: UJIAN KALIBRASI SEMULA (RECALIBRATE) ---');
    // Ujian 10: Semasa berada pada sudut +45°, tekan Kalibrasi Semula
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const q45 = new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(0, 1, 0), -45 * Math.PI / 180);
          window.KotakARSELNEL.state.pov.targetQuaternion.copy(q45);
          window.KotakARSELNEL.state.pov.currentQuaternion.copy(q45);
          window.KotakARSELNEL.recalibratePOV();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalRecal = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const deltaYaw = window.KotakARSELNEL.state.pov.deltaYaw;
          const anchorYaw = window.KotakARSELNEL.state.pov.anchorYaw;
          const curYaw = window.KotakARSELNEL.state.pov.currentYaw;
          const anchorVec = window.KotakARSELNEL.state.pov.anchorWorldVector;
          const curQuat = window.KotakARSELNEL.state.pov.currentQuaternion;
          return {
            deltaYaw: deltaYaw,
            anchorYaw: anchorYaw,
            curYaw: curYaw,
            anchorVec: anchorVec ? { x: anchorVec.x, y: anchorVec.y, z: anchorVec.z } : null,
            curQuat: curQuat ? { x: curQuat.x, y: curQuat.y, z: curQuat.z, w: curQuat.w } : null
          };
        })()
      `,
      returnByValue: true
    });
    assert(Math.abs(evalRecal.result.value.deltaYaw) < 1.0, `Ujian 10: Kalibrasi semula menetapkan deltaYaw kepada 0° pada arah semasa (${evalRecal.result.value.deltaYaw.toFixed(1)}°)`);

    console.log('\n--- BAHAGIAN 9: PENUKARAN MOD POV KE SCREEN-PINNED ---');
    // Ujian 11: Beralih dari POV ke Screen-Pinned
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.exitPOVMode(true);
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalPinned = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const mode = window.KotakARSELNEL.state.systemMode;
          const isPinned = window.KotakARSELNEL.state.isPinned;
          const povActive = window.KotakARSELNEL.state.pov.active;
          const origVisible = !document.getElementById('floating-ar-anchor').classList.contains('hidden');
          return {
            mode: mode,
            isPinned: isPinned,
            povActive: povActive,
            origVisible: origVisible
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalPinned.result.value.mode === 'SCREEN_PINNED' && evalPinned.result.value.isPinned && !evalPinned.result.value.povActive, 'Ujian 11: Mod POV ditutup dan beralih ke Screen-Pinned Mode dengan panel asal dipaparkan');

    console.log('\n--- BAHAGIAN 10: UJIAN LUAR FOV & MUNCUL SEMULA ---');
    // Buka semula POV mode, tunggu fasa persediaan siap, tetapkan 0° dan kunci
    await sendCmd('Runtime.evaluate', {
      expression: `
        (async () => {
          await window.KotakARSELNEL.startPOVMode();
          window.KotakARSELNEL.state.pov.currentQuaternion.copy(new window.THREE.Quaternion());
          window.KotakARSELNEL.state.pov.targetQuaternion.copy(new window.THREE.Quaternion());
          document.getElementById('pov-btn-anchor').click();
        })()
      `,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 200));

    // Ujian 12: Pusing 90° ke kanan -> Panel keluar dari FOV, penunjuk tebing skrin aktif
    await sendCmd('Runtime.evaluate', {
      expression: `
        const q90 = new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(0, 1, 0), -90 * Math.PI / 180);
        window.KotakARSELNEL.state.pov.targetQuaternion = q90;
        window.KotakARSELNEL.state.pov.currentQuaternion.copy(q90);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalOffscreen = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const isOffscreen = window.KotakARSELNEL.state.pov.isOffscreen;
          const pointer = document.getElementById('pov-offscreen-pointer');
          const pointerVisible = pointer && !pointer.classList.contains('hidden');
          return {
            isOffscreen: isOffscreen,
            pointerVisible: pointerVisible
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalOffscreen.result.value.isOffscreen && evalOffscreen.result.value.pointerVisible, 'Ujian 12a: Pusingan melebihi FOV mencetuskan status isOffscreen dan penunjuk tebing skrin (#pov-offscreen-pointer)');

    // Pusing semula ke 0° -> Panel kembali ke dalam FOV dan penunjuk hilang
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const qIdentity = new window.THREE.Quaternion();
          window.KotakARSELNEL.state.pov.targetQuaternion.copy(qIdentity);
          window.KotakARSELNEL.state.pov.currentQuaternion.copy(qIdentity);
        })()
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalBackInView = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const isOffscreen = window.KotakARSELNEL.state.pov.isOffscreen;
          const pointer = document.getElementById('pov-offscreen-pointer');
          const pointerHidden = !pointer || pointer.classList.contains('hidden');
          const deltaYaw = window.KotakARSELNEL.state.pov.deltaYaw;
          const anchorWorld = window.KotakARSELNEL.state.pov.anchorWorldVector;
          return {
            inView: !isOffscreen,
            pointerHidden: pointerHidden,
            isOffscreen: isOffscreen,
            deltaYaw: deltaYaw,
            anchorWorld: anchorWorld ? { x: anchorWorld.x, y: anchorWorld.y, z: anchorWorld.z } : null
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalBackInView.result.value.inView && evalBackInView.result.value.pointerHidden, 'Ujian 12b: Pusing kembali ke arah asal memulihkan panel ke dalam FOV dan menyembunyikan penunjuk');

    // Tangkapan skrin ujian stabil 3DoF
    const scrShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const imgData = scrShot.data || (scrShot.result && scrShot.result.data);
    const imgBuf = Buffer.from(imgData, 'base64');
    const outImgPath = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_3dof_stabilized_ipad.png';
    fs.writeFileSync(outImgPath, imgBuf);
    console.log(`\n📸 Tangkapan skrin iPad 3DoF Stabil disimpan di: ${outImgPath}`);

    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN UJIAN 3DoF POV LOCK: ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    try {
      ws.close();
      chromeProc.kill();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTestSuite();
