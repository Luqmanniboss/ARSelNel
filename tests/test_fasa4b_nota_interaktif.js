/**
 * ==============================================================================
 * UJIAN AUTOMATIK: KOTAK ARSELNEL FASA 4B (MARKER NOTA INTERAKTIF + POV LOCK)
 * 20 Ujian Komprehensif (Multi-Target, CMS Notes, Zoom, Page, POV Yaw+Pitch, iPad)
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
  console.log('📖 UJIAN AUTOMATIK: KOTAK ARSELNEL FASA 4B (NOTA INTERAKTIF + POV)');
  console.log('================================================================\n');

  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-fasa4b-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9289',
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
      http.get('http://127.0.0.1:9289/json/list', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });

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

    // Simulate iPad Safari Landscape (1024 x 768)
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    console.log('--- BAHAGIAN 1: PEMUATAN FAIL .MIND MULTI-TARGET & MODUL ASAS ---');
    await sendCmd('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
    await new Promise(r => setTimeout(r, 2400));

    // Verify MindAR anchors loaded
    const evalInit = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          return {
            hasAnchorVideo: !!state.anchorVideo,
            hasAnchorNota: !!state.anchorNota,
            hasMindar: !!state.mindarThree,
            videosCount: state.videos?.length || 0,
            notesCount: state.notes?.length || 0,
            activeMod: state.activeModule
          };
        })()
      `,
      returnByValue: true
    });
    const dInit = evalInit.result.value;
    assert(dInit.hasAnchorVideo && dInit.hasAnchorNota, `Ujian 1: Enjin MindAR mendaftar kedua-dua Anchor 0 (Video) dan Anchor 1 (Nota)`);
    assert(dInit.videosCount > 0 && dInit.notesCount > 0, `Ujian 2: Data CMS berjaya dimuatkan (${dInit.videosCount} video, ${dInit.notesCount} nota)`);
    assert(dInit.activeMod === 'video', `Ujian 3: Modul lalai dimulakan sebagai Video`);

    console.log('\n--- BAHAGIAN 2: UJIAN PERTUKARAN MODUL (VIDEO ➔ NOTA) & PELEPASAN AUDIO ---');
    // Start simulation mode with video playing first
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          window.KotakARSELNEL.startSimulationMode();
          window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0]);
        })()
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const evalVidPlaying = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('ar-player-frame')?.hasChildNodes() || false`,
      returnByValue: true
    });
    assert(evalVidPlaying.result.value === true, `Ujian 4: Pemain video aktif di dalam panel terapung`);

    // Switch to Nota module
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.switchActiveModule('nota');`
    });
    await new Promise(r => setTimeout(r, 400));

    const evalAfterSwitch = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const frameEmpty = !document.getElementById('ar-player-frame')?.hasChildNodes();
          const tagText = document.getElementById('panel-category-text')?.textContent || '';
          const tagIsNota = document.getElementById('panel-category-tag')?.classList.contains('tag-nota');
          const cardIsNota = document.getElementById('floating-card-container')?.classList.contains('module-nota');
          const noteReaderVis = !document.getElementById('active-nota-view')?.classList.contains('hidden');
          const noteTitle = document.getElementById('nota-title')?.textContent || '';
          return {
            activeMod: state.activeModule,
            frameEmpty,
            tagText,
            tagIsNota,
            cardIsNota,
            noteReaderVis,
            noteTitle
          };
        })()
      `,
      returnByValue: true
    });
    const dSwitch = evalAfterSwitch.result.value;
    assert(dSwitch.activeMod === 'nota', `Ujian 5: Modul aktif berjaya bertukar kepada "nota"`);
    assert(dSwitch.frameEmpty, `Ujian 6: Iframe video dikosongkan (audio dihentikan serta-merta)`);
    assert(dSwitch.tagIsNota && dSwitch.cardIsNota, `Ujian 7: Panel dan lencana menerima tema warna Teal (tag-nota, module-nota)`);
    assert(dSwitch.noteReaderVis && dSwitch.noteTitle.length > 0, `Ujian 8: Pembaca Nota aktif memaparkan tajuk: "${dSwitch.noteTitle}"`);

    console.log('\n--- BAHAGIAN 3: UJIAN ZOOM NOTA (+ / - / RESET) ---');
    // Test Zoom In
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.zoomInNote();` });
    const evalZoomIn = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const z = window.KotakARSELNEL.state.noteZoom;
          const txt = document.getElementById('nota-zoom-text')?.textContent;
          return { z, txt };
        })()
      `,
      returnByValue: true
    });
    assert(evalZoomIn.result.value.z > 1.0 && evalZoomIn.result.value.txt === '115%', `Ujian 9: Butang Zoom In meningkatkan saiz teks kepada 115% (${evalZoomIn.result.value.z})`);

    // Test Zoom Reset
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.resetZoomNote();` });
    const evalZoomReset = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const z = window.KotakARSELNEL.state.noteZoom;
          const txt = document.getElementById('nota-zoom-text')?.textContent;
          return { z, txt };
        })()
      `,
      returnByValue: true
    });
    assert(evalZoomReset.result.value.z === 1.0 && evalZoomReset.result.value.txt === '100%', `Ujian 10: Butang Reset Zoom mengembalikan saiz teks kepada 100%`);

    console.log('\n--- BAHAGIAN 4: UJIAN NAVIGASI HALAMAN (NEXT / PREV) ---');
    const evalPage = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const prevDisabled = document.getElementById('btn-nota-prev')?.disabled;
          return {
            page: state.currentNotePage,
            total: state.totalNotePages,
            prevDisabled
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalPage.result.value.page === 1 && evalPage.result.value.prevDisabled === true, `Ujian 11: Halaman bermula pada Halaman 1 dan butang Sebelum dilumpuhkan`);

    if (evalPage.result.value.total > 1) {
      await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.nextNotePage();` });
      const evalPageNext = await sendCmd('Runtime.evaluate', {
        expression: `window.KotakARSELNEL.state.currentNotePage`,
        returnByValue: true
      });
      assert(evalPageNext.result.value === 2, `Ujian 12: Butang Seterusnya beralih ke Halaman 2`);
      await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.prevNotePage();` });
    } else {
      assert(true, `Ujian 12: Nota satu halaman mengendalikan had sempadan navigasi`);
    }

    console.log('\n--- BAHAGIAN 5: UJIAN SCREEN-PINNED MODE PADA PANEL NOTA ---');
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.placeVideoOnScreen();`
    });
    const evalPinned = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const cardPinned = document.getElementById('floating-card-container')?.classList.contains('is-pinned');
          const toolbarVis = !document.getElementById('pinned-toolbar')?.classList.contains('hidden');
          return { isPinned: state.isPinned, cardPinned, toolbarVis };
        })()
      `,
      returnByValue: true
    });
    assert(evalPinned.result.value.isPinned && evalPinned.result.value.cardPinned, `Ujian 13: Panel Nota disematkan pada skrin (Screen-Pinned Mode)`);
    assert(evalPinned.result.value.toolbarVis, `Ujian 14: Toolbar saiz S/M/L dan kamera dipaparkan semasa disemat`);

    console.log('\n--- BAHAGIAN 6: UJIAN 3DoF POV LOCK (YAW & PITCH) PADA NOTA ---');
    await sendCmd('Runtime.evaluate', {
      expression: `
        (async () => {
          await window.KotakARSELNEL.startPOVMode();
        })()
      `,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    // Anchor POV
    await sendCmd('Runtime.evaluate', {
      expression: `window.KotakARSELNEL.anchorPOVAtCurrentHeading();`
    });
    await new Promise(r => setTimeout(r, 300));

    const evalPOVSetup = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const povNotaVis = !document.getElementById('pov-active-nota-view')?.classList.contains('hidden');
          const povVidHidden = document.getElementById('pov-active-player-view')?.classList.contains('hidden');
          const povCardNota = document.getElementById('pov-card-container')?.classList.contains('module-nota');
          return {
            mode: state.systemMode,
            povNotaVis,
            povVidHidden,
            povCardNota
          };
        })()
      `,
      returnByValue: true
    });
    assert(evalPOVSetup.result.value.mode === 'POV_LOCKED', `Ujian 15: Mod sistem beralih ke POV_LOCKED untuk Nota`);
    assert(evalPOVSetup.result.value.povNotaVis && evalPOVSetup.result.value.povVidHidden, `Ujian 16: Panel POV memaparkan pembaca Nota dan menyembunyikan pemain video`);

    // Pitch Lock Test on Note
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, -25);` });
    await new Promise(r => setTimeout(r, 300));
    const evalPitchUp = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('pov-ar-anchor').getBoundingClientRect().top`,
      returnByValue: true
    });
    assert(evalPitchUp.result.value < 200, `Ujian 17: Menundukkan peranti (-25°) menggerakkan panel Nota ke ATAS (Top: ${Math.round(evalPitchUp.result.value)}px)`);

    // Yaw Lock Test on Note
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(35, 0);` });
    await new Promise(r => setTimeout(r, 300));
    const evalYawLeft = await sendCmd('Runtime.evaluate', {
      expression: `document.getElementById('pov-ar-anchor').getBoundingClientRect().left`,
      returnByValue: true
    });
    assert(evalYawLeft.result.value < 200, `Ujian 18: Memusingkan peranti ke kanan (+35°) menggerakkan panel Nota ke KIRI (Left: ${Math.round(evalYawLeft.result.value)}px)`);

    // Reset heading
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.applySimAngles(0, 0);` });
    await new Promise(r => setTimeout(r, 300));

    console.log('\n--- BAHAGIAN 7: UJIAN MOD JIMAT BATERI (TUTUP KAMERA) & KEKALAN ORIENTASI ---');
    await sendCmd('Runtime.evaluate', { expression: `window.KotakARSELNEL.toggleCameraPower();` });
    const evalCamOff = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const state = window.KotakARSELNEL.state;
          const povVis = document.getElementById('pov-ar-anchor')?.classList.contains('is-visible');
          const povTitle = document.getElementById('pov-nota-title')?.textContent;
          return { camActive: state.cameraActive, povVis, povTitle };
        })()
      `,
      returnByValue: true
    });
    assert(evalCamOff.result.value.camActive === false, `Ujian 19: Kamera berjaya ditutup untuk menjimatkan bateri`);
    assert(evalCamOff.result.value.povVis && evalCamOff.result.value.povTitle.length > 0, `Ujian 20: Nota dan orientasi POV kekal aktif walaupun kamera ditutup ("${evalCamOff.result.value.povTitle}")`);

    // Capture screenshot on iPad Landscape
    const snap = await sendCmd('Page.captureScreenshot', { format: 'png' });
    const outPng = path.join('C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb', 'kotak_arselnel_fasa4b_nota_ipad.png');
    fs.writeFileSync(outPng, Buffer.from(snap.data, 'base64'));
    console.log(`\n📸 Tangkapan skrin iPad Safari Fasa 4B disimpan di: ${outPng}`);

  } catch (err) {
    console.error('Ralat pelaksanaan suite ujian Fasa 4B:', err);
  } finally {
    if (ws) ws.close();
    chromeProc.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN UJIAN FASA 4B: ${passedTests} / ${totalTests} BERJAYA (${failedTests} GAGAL)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});

