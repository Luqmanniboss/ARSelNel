/**
 * ARSELNEL — Test Suite: FASA 3C HOTFIX VERIFICATION
 * Testing: Single Active Panel, Anti-Blank Screen, Fixed Recovery Bar,
 * Stepwise Back Navigation, Diagnostics Drawer, Camera Off State, and iPad Responsiveness.
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

async function runHotfixTests() {
  console.log('================================================================');
  console.log('🛠️ UJIAN HOTFIX KOTAK ARSELNEL: FASA 3C (POV LOCK & IPAD SAFARI)');
  console.log('================================================================\n');

  const browserBin = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-hotfix-test-'));
  const cdpPort = 9272;

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

    // Emulate iPad Air / Pro Landscape: 1180 x 820
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1180,
      height: 820,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('--- BAHAGIAN 1: PEMUATAN & SEMAKAN SISTEM MOD TUNGGAL (NO OVERLAP) ---');
    await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
    await new Promise(r => setTimeout(r, 2200));

    // Buka mod simulasi
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.startSimulationMode();
        window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0]);
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // Tekan "Kunci POV"
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-start-pov').click();
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const evalOverlap = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const origAnchor = document.getElementById('floating-ar-anchor');
          const povAnchor = document.getElementById('pov-ar-anchor');
          const mode = window.KotakARSELNEL.state.systemMode;
          const origHidden = origAnchor.classList.contains('hidden') || origAnchor.style.display === 'none' || !origAnchor.classList.contains('is-visible');
          const povVisible = !povAnchor.classList.contains('hidden') && povAnchor.classList.contains('is-visible');
          const povCentered = povAnchor.classList.contains('is-centered');
          return {
            mode: mode,
            origHidden: origHidden,
            povVisible: povVisible,
            povCentered: povCentered
          };
        })()
      `,
      returnByValue: true
    });

    const overlapData = evalOverlap.result.value;
    assert(overlapData.mode === 'POV_SETUP', 'Mod beralih ke POV_SETUP dengan selamat');
    assert(overlapData.origHidden, 'Panel video asal disembunyikan sepenuhnya (TIADA pertindihan panel pada iPad)');
    assert(overlapData.povVisible, 'Panel Prototaip POV dipaparkan dengan jelas');
    assert(overlapData.povCentered, 'Panel POV terkunci di tengah skrin (.is-centered) semasa fasa persediaan');

    console.log('\n--- BAHAGIAN 2: ANTI-SKRIN KOSONG (SENSOR GYRO TIDAK MENGHILANGKAN PANEL SEBELUM DIKUNCI) ---');
    // Simulasikan bacaan sensor rawak (contoh: iPad membaca yaw 260.9°)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.state.pov.smoothAlpha = 260.9;
        window.KotakARSELNEL.state.pov.rawAlpha = 260.9;
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalAntiBlank = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const povCard = document.getElementById('pov-card-container');
          const rect = povCard.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const viewW = window.innerWidth;
          const viewH = window.innerHeight;
          const isCentered = Math.abs(centerX - (viewW / 2)) < 20 && Math.abs(centerY - (viewH / 2)) < 30;
          return {
            isCentered: isCentered,
            centerX: Math.round(centerX),
            centerY: Math.round(centerY),
            isAnchored: window.KotakARSELNEL.state.pov.isAnchored
          };
        })()
      `,
      returnByValue: true
    });

    const blankData = evalAntiBlank.result.value;
    assert(blankData.isCentered, `Panel kekal di tengah viewport (Pusat: ${blankData.centerX}px) walaupun giroskop membaca 260.9°`);
    assert(!blankData.isAnchored, 'POV spatial drift TIDAK aktif sebelum murid menekan "Letak di Arah Ini"');

    console.log('\n--- BAHAGIAN 3: FIXED FLOATING RECOVERY TOOLBAR SELALU BERFUNGSI ---');
    const evalRecoveryBar = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.getElementById('pov-fixed-recovery-bar');
          const btnCenter = document.getElementById('pov-rec-center');
          const btnRecal = document.getElementById('pov-rec-recalibrate');
          const btnCam = document.getElementById('pov-rec-cam');
          const btnPinned = document.getElementById('pov-rec-back-pinned');
          return {
            barVisible: bar && !bar.classList.contains('hidden'),
            hasCenter: !!btnCenter,
            hasRecal: !!btnRecal,
            hasCam: !!btnCam,
            hasPinned: !!btnPinned
          };
        })()
      `,
      returnByValue: true
    });

    const recData = evalRecoveryBar.result.value;
    assert(recData.barVisible, 'Floating Recovery Toolbar (#pov-fixed-recovery-bar) dipaparkan');
    assert(recData.hasCenter && recData.hasRecal && recData.hasCam && recData.hasPinned, 'Semua butang pemulihan wujud dalam recovery bar');

    console.log('\n--- BAHAGIAN 4: KUNCI ARAH, DRIFT KELUAR & PEMULIHAN "BAWA KE TENGAH" ---');
    // Tekan "Letak di Arah Ini" pada arah 260.9°
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-anchor').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    // Pusing peranti ke kanan (+50° -> 310.9°)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.state.pov.smoothAlpha = 310.9;
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalDrift = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const pointer = document.getElementById('pov-offscreen-pointer');
          return {
            isOffscreen: window.KotakARSELNEL.state.pov.isOffscreen,
            pointerVisible: pointer && !pointer.classList.contains('hidden'),
            mode: window.KotakARSELNEL.state.systemMode
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalDrift.result.value.isOffscreen, 'Panel keluar daripada POV apabila berpusing menjauhi sasaran');
    assert(evalDrift.result.value.pointerVisible, 'Indikator penunjuk tebing skrin dipaparkan');

    // Uji butang "Bawa ke Tengah" pada recovery toolbar
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-rec-center').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalRecCenter = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const mode = window.KotakARSELNEL.state.systemMode;
          const pointer = document.getElementById('pov-offscreen-pointer');
          const povAnchor = document.getElementById('pov-ar-anchor');
          return {
            mode: mode,
            pointerHidden: !pointer || pointer.classList.contains('hidden'),
            isCentered: povAnchor.classList.contains('is-centered')
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalRecCenter.result.value.mode === 'POV_SETUP', 'Menekan "Bawa ke Tengah" mengembalikan mod ke POV_SETUP serta-merta');
    assert(evalRecCenter.result.value.isCentered, 'Panel dipulihkan semula ke tengah skrin');
    assert(evalRecCenter.result.value.pointerHidden, 'Indikator luar skrin disembunyikan');

    console.log('\n--- BAHAGIAN 5: NAVIGASI BERPERINGKAT (STEPWISE BACK) & MODAL PENGESAHAN ---');
    // Klik 1: Dari POV_SETUP -> kembali ke SCREEN_PINNED
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-back-dashboard').click();
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalBack1 = await sendCmd('Runtime.evaluate', {
      expression: `
        ({ mode: window.KotakARSELNEL.state.systemMode, text: document.getElementById('back-hud-text')?.innerText })
      `,
      returnByValue: true
    });
    assert(evalBack1.result.value.mode === 'SCREEN_PINNED', 'Klik 1: Beralih daripada POV_SETUP ke SCREEN_PINNED');
    assert(evalBack1.result.value.text.includes('Imbas'), `Teks butang Kembali dikemas kini: "${evalBack1.result.value.text}"`);

    // Klik 2: Dari SCREEN_PINNED -> kembali ke MARKER scanner
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-back-dashboard').click();
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalBack2 = await sendCmd('Runtime.evaluate', {
      expression: `
        ({ mode: window.KotakARSELNEL.state.systemMode, text: document.getElementById('back-hud-text')?.innerText })
      `,
      returnByValue: true
    });
    assert(evalBack2.result.value.mode === 'MARKER', 'Klik 2: Beralih daripada SCREEN_PINNED ke MARKER');
    assert(evalBack2.result.value.text.includes('Dashboard'), `Teks butang Kembali dikemas kini: "${evalBack2.result.value.text}"`);

    // Klik 3: Dari MARKER -> Memaparkan dialog pengesahan (tidak terus keluar)
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-back-dashboard').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalBack3 = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const modal = document.getElementById('exit-modal-backdrop');
          return {
            modalVisible: modal && !modal.classList.contains('hidden')
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalBack3.result.value.modalVisible, 'Klik 3: Dialog pengesahan keluar dipaparkan (menghalang keluar secara tidak sengaja)');

    // Tekan "Teruskan Pembelajaran"
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-exit-cancel').click();
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalCancel = await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('exit-modal-backdrop').classList.contains('hidden')
      `,
      returnByValue: true
    });
    assert(evalCancel.result.value, '"Teruskan Pembelajaran" mengekalkan sesi dan menutup dialog');

    console.log('\n--- BAHAGIAN 6: DIAGNOSTIK SENSOR & VERIFIKASI ZERO-NaN ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-toggle-diagnostics').click();
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalDiag = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const drawer = document.getElementById('diagnostics-drawer');
          const dev = document.getElementById('diag-device')?.textContent?.trim() || '';
          const yaw = document.getElementById('diag-yaw')?.textContent?.trim() || '';
          const pitch = document.getElementById('diag-pitch')?.textContent?.trim() || '';
          const mode = document.getElementById('diag-mode')?.textContent?.trim() || '';
          const noNaN = !yaw.includes('NaN') && !pitch.includes('NaN');
          return {
            drawerOpen: drawer && !drawer.classList.contains('hidden'),
            dev: dev,
            yaw: yaw,
            noNaN: noNaN,
            mode: mode
          };
        })()
      `,
      returnByValue: true
    });

    const diagData = evalDiag.result.value;
    assert(diagData.drawerOpen, 'Sensor Diagnostics Drawer dibuka dengan jayanya');
    assert(diagData.dev.length > 0, `Diagnostik mengesan peranti: "${diagData.dev}"`);
    assert(diagData.noNaN, `Tiada sebarang nilai NaN dalam telemetri (Yaw: ${diagData.yaw})`);

    // Ambil gambar pengesahan iPad Safari
    const scrShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const imgData = scrShot.data || (scrShot.result && scrShot.result.data);
    const imgBuf = Buffer.from(imgData, 'base64');
    const outImgPath = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb\\kotak_arselnel_ipad_hotfix_verified.png';
    fs.writeFileSync(outImgPath, imgBuf);
    console.log(`  📸 Tangkapan skrin Hotfix iPad disimpan di: ${outImgPath}`);

    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN HOTFIX FASA 3C: ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
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

runHotfixTests();
