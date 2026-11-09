/**
 * ==============================================================================
 * UJIAN AUTOMATIK: HOTFIX PITCH LOCK + FASA C INTEGRASI VIDEO SEBENAR
 * ARSELNEL WebAR (16 Ujian Lengkap)
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
  console.log('🎯 UJIAN AUTOMATIK: PITCH LOCK & FASA C INTEGRASI VIDEO SEBENAR');
  console.log('================================================================\n');

  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-fasa-c-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9284',
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
      http.get('http://127.0.0.1:9284/json/list', res => {
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

    // Simulate iPad Landscape
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
    await new Promise(r => setTimeout(r, 2200));

    console.log('--- BAHAGIAN 1: PEMULAAN SIMULASI & AUTOPILIH VIDEO (FASA C) ---');
    // Start simulation mode and await startPOVMode
    await sendCmd('Runtime.evaluate', {
      expression: `
        (async () => {
          window.KotakARSELNEL.startSimulationMode();
          // Do not explicitly select a video first to verify auto-selection
          await window.KotakARSELNEL.startPOVMode();
        })()
      `,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 800));

    // Ujian 1: Mod POV aktif dan video pertama autopilih daripada CMS
    const evalInit = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const activeVid = state.activeVideo;
          const hasFrameChild = document.getElementById('pov-player-frame')?.hasChildNodes() || false;
          const title = document.getElementById('pov-player-title')?.textContent || '';
          const povVisible = document.getElementById('pov-ar-anchor')?.classList.contains('is-visible') || false;
          return {
            mode: state.systemMode,
            hasActiveVid: !!activeVid,
            vidTitle: activeVid?.title || '',
            hasFrameChild,
            domTitle: title,
            povVisible
          };
        })()
      `,
      returnByValue: true
    });
    const dInit = evalInit.result.value;
    assert(dInit.mode === 'POV_SETUP', `Ujian 1: Mod POV bermula dalam POV_SETUP (tengah skrin)`);
    assert(dInit.hasActiveVid && dInit.hasFrameChild, `Ujian 2: Pemain video sebenar aktif di dalam #pov-player-frame (Tajuk: "${dInit.vidTitle}")`);
    assert(dInit.domTitle === dInit.vidTitle, `Ujian 3: Tajuk video POV memaparkan "${dInit.domTitle}"`);

    console.log('\n--- BAHAGIAN 2: KUNCI ARAH POV & KEDUDUKAN TENGAH ---');
    // Tekan "Letak di Arah Ini"
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.anchorPOVAtCurrentHeading();`
    });
    await new Promise(r => setTimeout(r, 200));

    const evalAnchored = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          const centerY = r.top + r.height / 2;
          return {
            mode: window.KotakARSELNEL.state.systemMode,
            isAnchored: window.KotakARSELNEL.state.pov.isAnchored,
            diffX: Math.abs(centerX - (window.innerWidth / 2)),
            diffY: Math.abs(centerY - (window.innerHeight / 2))
          };
        })()
      `,
      returnByValue: true
    });
    const dAnch = evalAnchored.result.value;
    assert(dAnch.mode === 'POV_LOCKED' && dAnch.isAnchored, `Ujian 4: Mod sistem beralih ke POV_LOCKED dengan status terkunci`);
    assert(dAnch.diffX < 3 && dAnch.diffY < 3, `Ujian 5: Panel terkunci tepat di tengah viewport (${dAnch.diffX.toFixed(1)}px, ${dAnch.diffY.toFixed(1)}px)`);

    console.log('\n--- BAHAGIAN 3: UJIAN PITCH LOCK (TUNDUK / DONGAK) ---');
    // Ujian 6: Tunduk peranti ke bawah (-25°) -> Panel bergerak ke ATAS pada skrin (projY < height/2)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.applySimAngles(0, -25);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTiltDown = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerY = r.top + r.height / 2;
          const deltaPitch = window.KotakARSELNEL.state.pov.deltaPitch;
          return {
            centerY,
            deltaPitch,
            screenH: window.innerHeight,
            movedUp: centerY < (window.innerHeight / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dTiltDown = evalTiltDown.result.value;
    assert(dTiltDown.movedUp, `Ujian 6: Menundukkan peranti (-25°) menggerakkan panel ke ATAS (Pusat Y: ${Math.round(dTiltDown.centerY)}px < ${dTiltDown.screenH / 2}px)`);

    // Ujian 7: Dongak peranti ke atas (+25°) -> Panel bergerak ke BAWAH pada skrin (projY > height/2)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.applySimAngles(0, 25);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTiltUp = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerY = r.top + r.height / 2;
          const deltaPitch = window.KotakARSELNEL.state.pov.deltaPitch;
          return {
            centerY,
            deltaPitch,
            screenH: window.innerHeight,
            movedDown: centerY > (window.innerHeight / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dTiltUp = evalTiltUp.result.value;
    assert(dTiltUp.movedDown, `Ujian 7: Mendongakkan peranti (+25°) menggerakkan panel ke BAWAH (Pusat Y: ${Math.round(dTiltUp.centerY)}px > ${dTiltUp.screenH / 2}px)`);

    console.log('\n--- BAHAGIAN 4: UJIAN YAW LOCK (PUSING KANAN / KIRI) ---');
    // Ujian 8: Pusing ke kanan (+35°) -> Panel bergerak ke KIRI pada skrin (projX < width/2)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.applySimAngles(35, 0);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTurnRight = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          return {
            centerX,
            screenW: window.innerWidth,
            movedLeft: centerX < (window.innerWidth / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dTurnRight = evalTurnRight.result.value;
    assert(dTurnRight.movedLeft, `Ujian 8: Memusingkan peranti ke kanan (+35°) menggerakkan panel ke KIRI (Pusat X: ${Math.round(dTurnRight.centerX)}px < ${dTurnRight.screenW / 2}px)`);

    // Ujian 9: Pusing ke kiri (-35°) -> Panel bergerak ke KANAN pada skrin (projX > width/2)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.applySimAngles(-35, 0);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalTurnLeft = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          return {
            centerX,
            screenW: window.innerWidth,
            movedRight: centerX > (window.innerWidth / 2)
          };
        })()
      `,
      returnByValue: true
    });
    const dTurnLeft = evalTurnLeft.result.value;
    assert(dTurnLeft.movedRight, `Ujian 9: Memusingkan peranti ke kiri (-35°) menggerakkan panel ke KANAN (Pusat X: ${Math.round(dTurnLeft.centerX)}px > ${dTurnLeft.screenW / 2}px)`);

    console.log('\n--- BAHAGIAN 5: UJIAN SERENTAK 2-AXIS (YAW + PITCH) TANPA GIMBAL LOCK ---');
    // Ujian 10: Putaran serentak Yaw 30° + Pitch -20° (Kanan + Tunduk)
    await sendCmd('Runtime.evaluate', {
      expression: `
        window.KotakARSELNEL.applySimAngles(30, -20);
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalSimult = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          const centerX = r.left + r.width / 2;
          const centerY = r.top + r.height / 2;
          return {
            movedLeftAndUp: centerX < (window.innerWidth / 2) && centerY < (window.innerHeight / 2),
            centerX,
            centerY
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalSimult.result.value.movedLeftAndUp, `Ujian 10: Putaran 2-paksi serentak (Yaw +30°, Pitch -20°) menggerakkan panel ke Kiri & Atas tanpa ralat`);

    // Ujian 11: Kembali ke 0°, 0° -> Panel kembali tepat ke tengah
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.applySimAngles(0, 0);`
    });
    await new Promise(r => setTimeout(r, 200));

    const evalReturn = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          const r = c.getBoundingClientRect();
          return {
            diffX: Math.abs((r.left + r.width / 2) - (window.innerWidth / 2)),
            diffY: Math.abs((r.top + r.height / 2) - (window.innerHeight / 2))
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalReturn.result.value.diffX < 2 && evalReturn.result.value.diffY < 2, `Ujian 11: Menghalakan semula ke arah asal mengembalikan panel tepat ke tengah skrin`);

    console.log('\n--- BAHAGIAN 6: UJIAN KEKALAN PEMAIN VIDEO TANPA RELOAD ---');
    // Inject a test marker inside iframe to detect if DOM gets wiped
    await sendCmd('Runtime.evaluate', {
      expression: `
        const frame = document.getElementById('pov-player-frame');
        if (frame) frame.setAttribute('data-playback-persistent-marker', 'active-token-9988');
      `
    });

    // Pusing jauh ke kanan (+90°) sehingga panel keluar daripada skrin (Offscreen)
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.applySimAngles(90, 0);`
    });
    await new Promise(r => setTimeout(r, 300));

    // Pusing kembali ke tengah (0°)
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.applySimAngles(0, 0);`
    });
    await new Promise(r => setTimeout(r, 300));

    const evalPersistence = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const frame = document.getElementById('pov-player-frame');
          const marker = frame?.getAttribute('data-playback-persistent-marker');
          return {
            hasMarker: marker === 'active-token-9988',
            hasIframe: !!frame?.querySelector('iframe, video')
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalPersistence.result.value.hasMarker && evalPersistence.result.value.hasIframe, `Ujian 12: Pemain video kekal aktif tanpa dimuat semula (reload/restart) semasa panel keluar dan masuk semula ke FOV`);

    console.log('\n--- BAHAGIAN 7: UJIAN TUKAR VIDEO DI DALAM MOD POV ---');
    // Klik butang "Tukar Video"
    await sendCmd('Runtime.evaluate', {
      expression: `
        document.getElementById('pov-btn-change-video')?.click();
      `
    });
    await new Promise(r => setTimeout(r, 200));

    const evalSelectionView = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const selView = document.getElementById('pov-video-selection-view');
          const isShown = !selView.classList.contains('hidden');
          const cardCount = selView.querySelectorAll('.video-item-card').length;
          return { isShown, cardCount };
        })()
      `,
      returnByValue: true
    });
    assert(evalSelectionView.result.value.isShown && evalSelectionView.result.value.cardCount > 0, `Ujian 13: Butang "Tukar Video" membuka senarai video CMS (${evalSelectionView.result.value.cardCount} video disenaraikan)`);

    // Pilih video kedua jika ada
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('#pov-video-selection-view .video-item-card');
          if (cards.length > 1) {
            cards[1].click();
          } else if (cards.length > 0) {
            cards[0].click();
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 300));

    const evalVideoChanged = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const activeView = document.getElementById('pov-active-player-view');
          const isPlayerVisible = !activeView.classList.contains('hidden');
          const currentTitle = document.getElementById('pov-player-title')?.textContent || '';
          return { isPlayerVisible, currentTitle };
        })()
      `,
      returnByValue: true
    });
    assert(evalVideoChanged.result.value.isPlayerVisible, `Ujian 14: Memilih video baru kembali ke pemain video POV secara lancar ("${evalVideoChanged.result.value.currentTitle}")`);

    console.log('\n--- BAHAGIAN 8: UJIAN SAIZ PANEL POV S/M/L & SEMAT SKRIN ---');
    // Ujian 15: Ubah saiz panel ke 'large'
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.setPOVPanelSize('large');`
    });
    await new Promise(r => setTimeout(r, 150));

    const evalSizeL = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.getElementById('pov-card-container');
          return {
            hasSizeL: c.classList.contains('size-large'),
            activeState: window.KotakARSELNEL.state.pov.size
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalSizeL.result.value.hasSizeL && evalSizeL.result.value.activeState === 'large', `Ujian 15: Preset saiz L dikemaskini pada panel POV (#pov-card-container.size-large)`);

    // Ujian 16: Beralih ke "Semat Skrin"
    await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('pov-btn-back-pinned')?.click();`
    });
    await new Promise(r => setTimeout(r, 300));

    const evalSemat = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const floatingVis = document.getElementById('floating-ar-anchor')?.classList.contains('is-visible');
          return {
            mode: state.systemMode,
            isPinned: state.isPinned,
            floatingVis
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalSemat.result.value.mode === 'SCREEN_PINNED' && evalSemat.result.value.isPinned, `Ujian 16: Butang "Semat Skrin" beralih semula ke SCREEN_PINNED tanpa gangguan`);

    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN UJIAN: ${passedTests} / ${totalTests} BERJAYA (${failedTests} GAGAL)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Ralat pelaksanaan suite ujian:', err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTestSuite();
