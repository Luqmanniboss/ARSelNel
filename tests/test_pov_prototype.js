/**
 * ARSELNEL — Test Suite: Fasa 3C Gyroscope POV Lock Prototype Verification
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

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

async function runPOVTests() {
  console.log('================================================================');
  console.log('🧭 UJIAN KOTAK ARSELNEL: FASA 3C (GYROSCOPE POV LOCK PROTOTYPE)');
  console.log('================================================================\n');

  const browserBin = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-pov-test-'));
  const cdpPort = 9268;

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1600));

  const listRes = await new Promise(resolve => {
    http.get(`http://127.0.0.1:${cdpPort}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', e => {
      console.error('CDP connect error:', e);
      process.exit(1);
    });
  });

  const wsUrl = listRes[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let callId = 1;
  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = callId++;
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
  }

  try {
    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    // Emulate iPhone / iPad viewport: 390 x 844
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('--- BAHAGIAN 1: PEMUATAN MODUL & SEMAKAN PILIHAN MOD ---');
    await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
    await new Promise(r => setTimeout(r, 2200));

    // Buka panel simulasi
    await sendCmd('Runtime.evaluate', {
      expression: `
        if (window.KotakARSELNEL) {
          window.KotakARSELNEL.startSimulationMode();
        }
      `
    });
    await new Promise(r => setTimeout(r, 800));

    // Semak ketersediaan butang Semat Skrin dan Kunci POV
    const evalModes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const btnPinned = document.getElementById('btn-place-video');
          const btnPOV = document.getElementById('btn-start-pov');
          return {
            hasPinnedBtn: !!btnPinned && !btnPinned.classList.contains('hidden'),
            hasPOVBtn: !!btnPOV && !btnPOV.classList.contains('hidden'),
            pinnedText: btnPinned ? btnPinned.innerText.trim() : '',
            povText: btnPOV ? btnPOV.innerText.trim() : ''
          };
        })()
      `,
      returnByValue: true
    });

    const modeData = evalModes.result.value;
    assert(modeData.hasPinnedBtn, 'Pilihan "Semat pada Skrin" wujud dan aktif');
    assert(modeData.hasPOVBtn, 'Pilihan "Kunci POV (Tanpa Kamera)" wujud dan aktif');

    console.log('\n--- BAHAGIAN 2: PENGAKTIFAN MOD KUNCI POV & PROTOTAIP PANEL KOSONG ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-start-pov').click();
      `
    });
    await new Promise(r => setTimeout(r, 800));

    const evalPOVState = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state.pov;
          const povAnchor = document.getElementById('pov-ar-anchor');
          const needle = document.getElementById('pov-needle');
          const statusText = document.getElementById('pov-sensor-text')?.innerText || '';
          const yawVal = document.getElementById('pov-val-yaw')?.innerText || '';
          return {
            active: state.active,
            anchorVisible: povAnchor && !povAnchor.classList.contains('hidden'),
            hasNeedle: !!needle,
            statusText: statusText,
            yawVal: yawVal
          };
        })()
      `,
      returnByValue: true
    });

    const povState = evalPOVState.result.value;
    assert(povState.active, 'Mod POV aktif dalam ARState (active = true)');
    assert(povState.anchorVisible, 'Panel Prototaip POV dipaparkan pada skrin');
    assert(povState.hasNeedle, 'Kompas reticle sasaran & jarum orientasi wujud');
    assert(povState.statusText.length > 0, `Status sensor dipaparkan: "${povState.statusText}"`);

    console.log('\n--- BAHAGIAN 3: PENGUNCIAN ORIENTASI SASARAN ("LETAK DI ARAH INI") ---');
    // Set arah awal (contoh Yaw: 60°)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.state.pov.smoothAlpha = 60;
        window.KotakARSELNEL.state.pov.rawAlpha = 60;
        document.getElementById('pov-btn-anchor').click();
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalAnchor = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state.pov;
          const btnText = document.getElementById('pov-anchor-text')?.innerText || '';
          const statusVal = document.getElementById('pov-val-status')?.innerText || '';
          return {
            isAnchored: state.isAnchored,
            anchorAlpha: state.anchorAlpha,
            btnText: btnText,
            statusVal: statusVal
          };
        })()
      `,
      returnByValue: true
    });

    const anchorData = evalAnchor.result.value;
    assert(anchorData.isAnchored, 'Orientasi berjaya dikunci (isAnchored = true)');
    assert(anchorData.anchorAlpha === 60, `Arah rujukan tersimpan pada 60° (Nilai: ${anchorData.anchorAlpha}°)`);
    assert(anchorData.btnText.includes('Alih') || anchorData.btnText.includes('Semula'), 'Butang bertukar kepada "Alih / Letak Semula"');
    assert(anchorData.statusVal.includes('Terkunci'), `Status orientasi mengesahkan: "${anchorData.statusVal}"`);

    console.log('\n--- BAHAGIAN 4: UJIAN PERANTI BERPUSING MENJAUHI SASARAN (PANEL KELUAR & INDIKATOR MUNCUL) ---');
    // Pusingkan peranti ke kanan (+45° -> Alpha bertukar ke 105°)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.state.pov.smoothAlpha = 105;
        window.KotakARSELNEL.state.pov.rawAlpha = 105;
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalTurnAway = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state.pov;
          const anchorEl = document.getElementById('pov-ar-anchor');
          const pointer = document.getElementById('pov-offscreen-pointer');
          const rect = anchorEl.getBoundingClientRect();
          const pointerVisible = pointer && !pointer.classList.contains('hidden');
          const isAtLeft = pointer && pointer.classList.contains('at-left');
          const bearingText = document.getElementById('pov-pointer-bearing')?.textContent || '';
          return {
            isOffscreen: state.isOffscreen,
            rectLeft: rect.left,
            pointerVisible: pointerVisible,
            isAtLeft: isAtLeft,
            bearingText: bearingText
          };
        })()
      `,
      returnByValue: true
    });

    const turnData = evalTurnAway.result.value;
    assert(turnData.isOffscreen, 'Panel dikesan berada di luar pandangan POV');
    assert(turnData.rectLeft < 0, `Panel bergerak keluar melepasi tebing kiri skrin (Left: ${Math.round(turnData.rectLeft)}px)`);
    assert(turnData.pointerVisible, 'Indikator arah luar POV (#pov-offscreen-pointer) dipaparkan');
    assert(turnData.isAtLeft, 'Indikator menunjuk ke tebing kiri (arah sebenar sasaran)');
    assert(turnData.bearingText.includes('Kiri'), `Teks indikator membimbing murid: "${turnData.bearingText}"`);

    console.log('\n--- BAHAGIAN 5: UJIAN PERANTI KEMBALI MENGHADAP SASARAN (PANEL MASUK SEMULA) ---');
    // Pusingkan peranti kembali ke arah 60° (menghadap sasaran)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.state.pov.smoothAlpha = 60;
        window.KotakARSELNEL.state.pov.rawAlpha = 60;
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalTurnBack = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state.pov;
          const anchorEl = document.getElementById('pov-ar-anchor');
          const pointer = document.getElementById('pov-offscreen-pointer');
          const rect = anchorEl.getBoundingClientRect();
          const pointerHidden = !pointer || pointer.classList.contains('hidden');
          return {
            isOffscreen: state.isOffscreen,
            centerX: rect.left + rect.width / 2,
            pointerHidden: pointerHidden
          };
        })()
      `,
      returnByValue: true
    });

    const backData = evalTurnBack.result.value;
    assert(!backData.isOffscreen, 'Panel kembali berada di dalam kawasan pandangan (isOffscreen = false)');
    assert(Math.abs(backData.centerX - 195) < 30, `Panel meluncur kembali ke tengah skrin (Pusat: ${Math.round(backData.centerX)}px)`);
    assert(backData.pointerHidden, 'Indikator tebing disembunyikan secara automatik');

    console.log('\n--- BAHAGIAN 6: UJIAN MOD JIMAT BATERI (TUTUP KAMERA) & PENGEKALAN ORIENTASI ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-toggle-cam').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalBattery = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const camActive = window.KotakARSELNEL.state.cameraActive;
          const containerHasClass = document.getElementById('ar-container').classList.contains('camera-off');
          const povStillActive = window.KotakARSELNEL.state.pov.active;
          return {
            camActive: camActive,
            containerHasClass: containerHasClass,
            povStillActive: povStillActive
          };
        })()
      `,
      returnByValue: true
    });

    const batData = evalBattery.result.value;
    assert(!batData.camActive, 'Kamera ditutup untuk mod jimat bateri (cameraActive = false)');
    assert(batData.containerHasClass, '#ar-container menerima kelas .camera-off dengan latar belakang bersih');
    assert(batData.povStillActive, 'Penjejakan giroskop POV kekal aktif tanpa gangguan semasa kamera ditutup');

    console.log('\n--- BAHAGIAN 7: UJIAN KALIBRASI SEMULA & PERTUKARAN SAIZ S, M, L ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-recalibrate').click();
        document.getElementById('pov-size-s').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalSizeS = await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-card-container').classList.contains('size-small')
      `,
      returnByValue: true
    });
    assert(evalSizeS.result.value, 'Saiz S (Kecil) berfungsi pada panel POV');

    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-size-l').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalSizeL = await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-card-container').classList.contains('size-large')
      `,
      returnByValue: true
    });
    assert(evalSizeL.result.value, 'Saiz L (Besar) berfungsi pada panel POV');

    // Tangkap gambar prototaip POV
    const scrShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const imgData = scrShot.data || (scrShot.result && scrShot.result.data);
    const imgBuf = Buffer.from(imgData, 'base64');
    const outImgPath = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_fasa3c_pov_prototype.png';
    fs.writeFileSync(outImgPath, imgBuf);
    console.log(`  📸 Tangkapan skrin Prototaip POV disimpan di: ${outImgPath}`);

    console.log('\n--- BAHAGIAN 8: KESERASIAN KEMBALI KE MOD SEMAT SKRIN (SCREEN-PINNED) ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-back-pinned').click();
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalBackPinned = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const povActive = window.KotakARSELNEL.state.pov.active;
          const isPinned = window.KotakARSELNEL.state.isPinned;
          const floatingVisible = document.getElementById('floating-ar-anchor').classList.contains('is-visible');
          return {
            povActive: povActive,
            isPinned: isPinned,
            floatingVisible: floatingVisible
          };
        })()
      `,
      returnByValue: true
    });

    const backPinnedData = evalBackPinned.result.value;
    assert(!backPinnedData.povActive, 'Mod POV dimatikan secara bersih');
    assert(backPinnedData.isPinned, 'Screen-Pinned Mode diaktifkan semula dengan sempurna');
    assert(backPinnedData.floatingVisible, 'Kad panel Screen-Pinned kembali kelihatan');

    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN FASA 3C (PROTOTAIP): ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
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

runPOVTests();
