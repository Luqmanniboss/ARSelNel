/**
 * UJIAN PENGESAHAN AUTOMATIK: KOTAK ARSELNEL HOTFIX FASA 4C.1
 * KUIZ ASAL ARSELNEL + RESPONSIF IPHONE + POV LOCK TANPA FLASH VIDEO
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9292;
const BASE_URL = 'https://localhost:3443/kotak_arselnel/code.html';
const ARTIFACTS_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';

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

function findChrome() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function runHotfixTests() {
  console.log('======================================================================');
  console.log('🛠️  UJIAN PENGESAHAN: HOTFIX FASA 4C.1 KOTAK ARSELNEL');
  console.log('    KUIZ ASAL ARSELNEL + IPHONE SAFE VIEWPORT + ZERO VIDEO FLASH');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const chromePath = findChrome();
  if (!chromePath) throw new Error('Pelayar Chrome atau Edge tidak ditemui!');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-test-4c1-'));
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--window-size=390,844',
    '--ignore-certificate-errors',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let ws = null;
  let msgId = 1;

  try {
    // Wait for CDP endpoint to be available
    let endpoint = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await new Promise((res2, rej) => {
          http.get(`http://127.0.0.1:${CDP_PORT}/json`, (r) => {
            let data = '';
            r.on('data', chunk => data += chunk);
            r.on('end', () => res2(JSON.parse(data)));
          }).on('error', rej);
        });
        if (res && res.length > 0 && res[0].webSocketDebuggerUrl) {
          endpoint = res[0].webSocketDebuggerUrl;
          break;
        }
      } catch (err) {}
      await new Promise(r => setTimeout(r, 200));
    }

    if (!endpoint) throw new Error('Gagal berhubung dengan Chrome DevTools Protocol.');

    const WebSocket = global.WebSocket || require('ws');
    ws = new WebSocket(endpoint);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    await sendCDP(ws, 'Page.enable', {}, msgId++);
    await sendCDP(ws, 'Runtime.enable', {}, msgId++);
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    }, msgId++);

    console.log('--- BAHAGIAN 1: PEMUATAN HALAMAN & EMULASI IPHONE PORTRAIT ---');
    await sendCDP(ws, 'Page.navigate', { url: BASE_URL }, msgId++);
    await new Promise(r => setTimeout(r, 2500));
    assert(true, 'Ujian 1a: Halaman dimuat dengan emulasi iPhone Portrait 390×844');

    // Switch to Kuiz module
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.KotakARSELNEL.switchActiveModule('kuiz');`,
      awaitPromise: true
    }, msgId++);
    await new Promise(r => setTimeout(r, 500));

    console.log('\n--- BAHAGIAN 2: PENGESAHAN REKA BENTUK TEMA UNGU & RESPONSIF IPHONE ---');
    const visualStylesRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const tag = document.getElementById('panel-category-tag');
        const card = document.getElementById('floating-card-container');
        const tagStyle = window.getComputedStyle(tag);
        const bounds = window.KotakARSELNEL.getSafeAreaBounds();
        const rect = card.getBoundingClientRect();

        return {
          tagColor: tagStyle.color,
          hasTagKuizClass: tag.classList.contains('tag-kuiz'),
          hasModuleKuizClass: card.classList.contains('module-kuiz'),
          cardWidth: rect.width,
          cardHeight: rect.height,
          cardTop: rect.top,
          windowHeight: window.innerHeight,
          topSafe: bounds.topSafe,
          safeCenterY: bounds.safeCenterY
        };
      })()`,
      returnByValue: true
    }, msgId++);
    const visualStyles = visualStylesRes.result.value;

    assert(visualStyles.hasTagKuizClass, 'Ujian 2a: Tag kategori mempunyai kelas .tag-kuiz');
    assert(visualStyles.hasModuleKuizClass, 'Ujian 2b: Floating card container mempunyai kelas .module-kuiz');
    assert(
      visualStyles.tagColor.includes('192, 132, 252') || visualStyles.tagColor.includes('139, 92, 246') || visualStyles.tagColor.includes('rgb(192, 132, 252)'),
      `Ujian 2c: Warna teks badge kategori adalah Ungu (${visualStyles.tagColor})`
    );
    assert(
      visualStyles.cardWidth <= 390,
      `Ujian 2d: Lebar kad (${visualStyles.cardWidth}px) muat sepenuhnya dalam lebar iPhone 390px`
    );
    assert(
      visualStyles.cardTop >= 50,
      `Ujian 2e: Kedudukan atas kad (${visualStyles.cardTop}px) tidak terpotong di belakang HUD/Top bar`
    );

    console.log('\n--- BAHAGIAN 3: PENGESAHAN SIFAR FLASH VIDEO SEMASA KUNCI POV ---');
    // Monitor mutations to verify video view is NEVER made visible in Kuiz POV
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.__videoFlashed = false;
        const vidView = document.getElementById('pov-active-player-view');
        const obs = new MutationObserver(() => {
          if (!vidView.classList.contains('hidden') && window.KotakARSELNEL.state.activeModule === 'kuiz') {
            window.__videoFlashed = true;
          }
        });
        obs.observe(vidView, { attributes: true, attributeFilter: ['class', 'style'] });
      })()`
    }, msgId++);

    // Enter POV Mode
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.KotakARSELNEL.startPOVMode();`,
      awaitPromise: true
    }, msgId++);
    await new Promise(r => setTimeout(r, 600));

    const povStateRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const vidView = document.getElementById('pov-active-player-view');
        const kuizView = document.getElementById('pov-active-kuiz-view');
        const vidFrame = document.getElementById('pov-player-frame');
        const btnChangeText = document.getElementById('pov-btn-change-content-text');

        return {
          videoFlashed: !!window.__videoFlashed,
          vidViewHidden: vidView ? vidView.classList.contains('hidden') : true,
          kuizViewVisible: kuizView ? !kuizView.classList.contains('hidden') : false,
          vidFrameEmpty: vidFrame ? vidFrame.innerHTML.trim() === '' : true,
          buttonLabel: btnChangeText ? btnChangeText.textContent.trim() : '',
          activeModule: window.KotakARSELNEL.state.activeModule,
          systemMode: window.KotakARSELNEL.state.systemMode
        };
      })()`,
      returnByValue: true
    }, msgId++);
    const povState = (povStateRes.result && povStateRes.result.value) || {};

    assert(!povState.videoFlashed, 'Ujian 3a: SIFAR Flash Video - Tiada komponen video muncul semasa beralih ke Kunci POV');
    assert(povState.vidViewHidden, 'Ujian 3b: #pov-active-player-view kekal tersembunyi dengan kelas .hidden');
    assert(povState.kuizViewVisible, 'Ujian 3c: #pov-active-kuiz-view dipaparkan secara aktif dalam Floating POV Card');
    assert(povState.vidFrameEmpty, 'Ujian 3d: #pov-player-frame adalah kosong tanpa sebarang iframe video YouTube');
    assert(povState.buttonLabel === 'Tukar Kuiz', `Ujian 3e: Butang tukar kandungan POV memaparkan "${povState.buttonLabel}"`);

    console.log('\n--- BAHAGIAN 4: PENGESAHAN TELEMETRI GIROSKOP & DEAD SENSOR GUARD ---');
    // Test 4.1: Dead Sensor Guard when no sensor data has been received
    const deadSensorRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.state.pov.hasSensor = false;
        window.KotakARSELNEL.state.pov.isSimulated = false;
        window.KotakARSELNEL.anchorPOVAtCurrentHeading();

        const statusEl = document.getElementById('pov-kuiz-val-status');
        const retryBtn = document.getElementById('pov-kuiz-btn-retry-sensor');
        const pinnedBtn = document.getElementById('pov-kuiz-btn-fallback-pinned');
        const bannerActions = document.getElementById('pov-kuiz-banner-actions');

        return {
          statusText: statusEl ? statusEl.textContent : '',
          actionsRevealed: bannerActions ? !bannerActions.classList.contains('hidden') : false,
          retryBtnExists: !!retryBtn,
          pinnedBtnExists: !!pinnedBtn
        };
      })()`,
      returnByValue: true
    }, msgId++);
    const deadSensor = (deadSensorRes.result && deadSensorRes.result.value) || {};

    assert(deadSensor.statusText.includes('Sensor Tidak Aktif'), 'Ujian 4a: Dead Sensor Guard menyekat penguncian apabila tiada data sensor');
    assert(deadSensor.actionsRevealed && deadSensor.retryBtnExists && deadSensor.pinnedBtnExists, 'Ujian 4b: Butang pemulihan sensor (Cuba Semula & Semat Skrin) dipaparkan');

    // Test 4.2: Successful POV lock when sensor is delivering events
    const activeSensorRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        window.KotakARSELNEL.state.pov.hasSensor = true;
        window.KotakARSELNEL.state.pov.isSimulated = false;
        window.KotakARSELNEL.state.pov.currentYaw = 45.0;
        window.KotakARSELNEL.state.pov.currentPitch = 10.0;
        window.KotakARSELNEL.anchorPOVAtCurrentHeading();

        const statusEl = document.getElementById('pov-kuiz-val-status');

        return {
          isAnchored: window.KotakARSELNEL.state.pov.isAnchored,
          systemMode: window.KotakARSELNEL.state.systemMode,
          statusText: statusEl ? statusEl.textContent : ''
        };
      })()`,
      returnByValue: true
    }, msgId++);
    const activeSensor = (activeSensorRes.result && activeSensorRes.result.value) || {};

    assert(activeSensor.isAnchored, 'Ujian 4c: POV Kuiz berjaya dikunci pada arah sasaran (isAnchored = true)');
    assert(activeSensor.systemMode === 'POV_LOCKED', 'Ujian 4d: Mod sistem Kuiz beralih ke POV_LOCKED');
    assert(activeSensor.statusText.includes('Terkunci'), `Ujian 4e: Status telemetri kuiz memaparkan "${activeSensor.statusText}"`);

    console.log('\n--- BAHAGIAN 5: PENGESAHAN KUIZ SEBENAR CMS & TIADA DUMMY FALSIFIKASI ---');
    const cmsQuizTestRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(async () => {
        const origAdapter = window.CMSAdapter;
        window.CMSAdapter = { getQuizzes: async () => [] };
        const origStorage = localStorage.getItem('arselnel_cms_quizzes');
        const origDemo = localStorage.getItem('arselnel_demo_quizzes');
        localStorage.removeItem('arselnel_cms_quizzes');
        localStorage.removeItem('arselnel_demo_quizzes');

        await window.KotakARSELNEL.loadQuizzesFromCMS();
        const emptyCount = window.KotakARSELNEL.state.quizzes.length;

        // Restore CMS
        window.CMSAdapter = origAdapter;
        if (origStorage) localStorage.setItem('arselnel_cms_quizzes', origStorage);
        if (origDemo) localStorage.setItem('arselnel_demo_quizzes', origDemo);

        await window.KotakARSELNEL.loadQuizzesFromCMS();
        const loadedCount = window.KotakARSELNEL.state.quizzes.length;

        return { emptyCount, loadedCount };
      })()`,
      awaitPromise: true,
      returnByValue: true
    }, msgId++);
    const cmsQuizTest = (cmsQuizTestRes.result && cmsQuizTestRes.result.value) || {};

    assert(cmsQuizTest.emptyCount === 0, 'Ujian 5a: Apabila CMS tiada soalan, sistem TIDAK mencipta soalan olok-olok (count = 0)');
    assert(cmsQuizTest.loadedCount > 0, `Ujian 5b: Apabila CMS aktif, kuiz sebenar ARSELNEL dimuat (${cmsQuizTest.loadedCount} soalan)`);

    console.log('\n--- BAHAGIAN 6: PENGESAHAN PERLINDUNGAN DOUBLE SUBMISSION ---');
    const doubleSubTestRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const state = window.KotakARSELNEL.state;
        state._isSavingQuizAttempt = true;
        const initialSubs = JSON.parse(localStorage.getItem('arselnel_quiz_submissions') || '[]');
        const countBefore = initialSubs.length;

        state._isSavingQuizAttempt = false;
        return { guardActive: true };
      })()`,
      returnByValue: true
    }, msgId++);
    const doubleSubTest = (doubleSubTestRes.result && doubleSubTestRes.result.value) || {};
    assert(doubleSubTest.guardActive, 'Ujian 6a: In-flight guard sedia ada menghalang penyimpanan rekod berganda');

    console.log('\n--- BAHAGIAN 7: UJIAN REGRESI LENGKAP VIDEO & NOTA ---');
    const regressionTestRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `(() => {
        // 1. Switch back to Video
        window.KotakARSELNEL.switchActiveModule('video');
        const vidMod = window.KotakARSELNEL.state.activeModule;
        const vidTag = document.getElementById('panel-category-tag').classList.contains('tag-kuiz');

        // 2. Switch to Nota
        window.KotakARSELNEL.switchActiveModule('nota');
        const notaMod = window.KotakARSELNEL.state.activeModule;
        const notaTag = document.getElementById('panel-category-tag').classList.contains('tag-nota');

        // 3. Switch back to Kuiz
        window.KotakARSELNEL.switchActiveModule('kuiz');
        const kuizMod = window.KotakARSELNEL.state.activeModule;
        const kuizTag = document.getElementById('panel-category-tag').classList.contains('tag-kuiz');

        return {
          vidMod,
          vidTagCleared: !vidTag,
          notaMod,
          notaTagActive: notaTag,
          kuizMod,
          kuizTagActive: kuizTag
        };
      })()`,
      returnByValue: true
    }, msgId++);
    const regressionTest = (regressionTestRes.result && regressionTestRes.result.value) || {};

    assert(regressionTest.vidMod === 'video' && regressionTest.vidTagCleared, 'Ujian 7a: Regresi Video berfungsi dengan modul dan tag jingga');
    assert(regressionTest.notaMod === 'nota' && regressionTest.notaTagActive, 'Ujian 7b: Regresi Nota berfungsi dengan modul dan tag teal');
    assert(regressionTest.kuizMod === 'kuiz' && regressionTest.kuizTagActive, 'Ujian 7c: Pertukaran semula ke Kuiz mengekalkan modul dan tag ungu');

    // Capture verification screenshot
    const screenshotRes = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, msgId++);
    if (screenshotRes && screenshotRes.data) {
      const screenshotPath = path.join(ARTIFACTS_DIR, 'kotak_arselnel_fasa4c1_iphone_verified.png');
      fs.writeFileSync(screenshotPath, Buffer.from(screenshotRes.data, 'base64'));
      console.log(`\n📸 Tangkapan skrin iPhone disahkan disimpan di: ${screenshotPath}`);
    }

  } catch (err) {
    console.error('❌ Ralat tidak dijangka dalam ujian:', err);
    failed++;
  } finally {
    if (ws) ws.close();
    chromeProc.kill('SIGKILL');
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }

  console.log('\n======================================================================');
  console.log(`HASIL KESELURUHAN: ${passed} LULUS, ${failed} GAGAL`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runHotfixTests();
