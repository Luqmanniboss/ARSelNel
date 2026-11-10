const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');

const CDP_PORT = 9390;

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

async function runTests() {
  console.log('================================================================');
  console.log('🧪 VERIFIKASI HOTFIX FASA 4E-D.1.1: SAFARI IPAD CAMERA & MINDAR');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4ed1_1_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'about:blank'
  ], { detached: false });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [LULUS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [GAGAL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    await new Promise(r => setTimeout(r, 2000));

    const versionData = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const targetPage = versionData.find(t => t.type === 'page');
    if (!targetPage) throw new Error('Target page not found');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    await sendCDP(ws, 'Runtime.enable', {}, msgId++);
    await sendCDP(ws, 'Page.enable', {}, msgId++);

    const consoleLogs = [];
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          const text = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
          consoleLogs.push({ type: data.params.type, text });
        }
      } catch (e) {}
    });

    console.log('Navigating to http://localhost:3000/kotak_arselnel/code.html...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/code.html' }, msgId++);

    // Wait 5 seconds for MindAR and Camera initialization
    await new Promise(r => setTimeout(r, 5000));

    console.log('\n--- KUMPULAN 1: VERIFIKASI VIDEO & KAMERA WEBAR ---');
    const videoData = (await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const container = document.getElementById('ar-container');
          const video = container ? container.querySelector('video') : null;
          const canvas = container ? container.querySelector('canvas') : null;

          if (!video) return { exists: false };
          const cs = window.getComputedStyle(video);

          return {
            exists: true,
            hasCanvas: !!canvas,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            paused: video.paused,
            muted: video.muted,
            hasPlaysInline: video.hasAttribute('playsinline'),
            hasWebkitPlaysInline: video.hasAttribute('webkit-playsinline'),
            zIndex: cs.zIndex,
            position: cs.position,
            objectFit: cs.objectFit,
            width: cs.width,
            height: cs.height
          };
        })()
      `,
      returnByValue: true
    }, msgId++)).result.value;

    assert(videoData.exists === true, 'Elemen <video> kamera wujud dalam #ar-container');
    assert(videoData.hasCanvas === true, 'Elemen <canvas> Three.js wujud dalam #ar-container');
    assert(videoData.hasPlaysInline === true, 'Atribut playsinline hadir pada video');
    assert(videoData.hasWebkitPlaysInline === true, 'Atribut webkit-playsinline hadir pada video');
    assert(videoData.muted === true, 'Video muted ditetapkan kepada true');
    assert(videoData.paused === false, 'Video kamera sedang dimainkan (paused === false)');
    assert(videoData.readyState >= 2, `Video readyState mencukupi (readyState: ${videoData.readyState} >= 2)`);
    assert(videoData.videoWidth > 0 && videoData.videoHeight > 0, `Dimensi video aktif (${videoData.videoWidth}x${videoData.videoHeight})`);
    assert(videoData.zIndex === '1', `CSS z-index video ialah 1 (z-index: ${videoData.zIndex})`);
    assert(videoData.position === 'absolute', `CSS position video ialah absolute`);
    assert(videoData.objectFit === 'cover', `CSS object-fit video ialah cover`);

    console.log('\n--- KUMPULAN 2: VERIFIKASI SINGLE INITIALIZATION & PAGESHOW GUARD ---');
    const initLogs = consoleLogs.filter(l => l.text.includes('Memulakan MindAR Image Tracking Engine'));
    assert(initLogs.length === 1, `Hanya 1 kali initMindAR dipanggil (dikesan: ${initLogs.length} kali)`);

    const pageshowLogs = consoleLogs.filter(l => l.text.includes('pageshow event fired'));
    assert(pageshowLogs.length >= 1, `Acara pageshow berjaya dikesan (dikesan: ${pageshowLogs.length} kali)`);

    // Simulate second pageshow with persisted: false to verify it doesn't trigger double init
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false }));
      `
    }, msgId++);
    await new Promise(r => setTimeout(r, 500));

    const initLogsAfter = consoleLogs.filter(l => l.text.includes('Memulakan MindAR Image Tracking Engine'));
    assert(initLogsAfter.length === 1, 'pageshow (persisted: false) tidak mencetuskan inisialisasi semula');

    console.log('\n--- KUMPULAN 3: VERIFIKASI DIAGNOSTIK DRAWER TELEMETRI KAMERA ---');
    // Open diagnostics drawer and force update
    const diagData = (await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          window.KotakARSELNEL.updateDiagnosticsData(true);
          return {
            camStatus: document.getElementById('diag-cam-status')?.textContent,
            videoDim: document.getElementById('diag-video-dim')?.textContent,
            videoReady: document.getElementById('diag-video-ready')?.textContent,
            mindarStatus: document.getElementById('diag-mindar-status')?.textContent,
            markerMindStatus: document.getElementById('diag-marker-mind-status')?.textContent,
            webglStatus: document.getElementById('diag-webgl-status')?.textContent,
            lastError: document.getElementById('diag-last-error')?.textContent
          };
        })()
      `,
      returnByValue: true
    }, msgId++)).result.value;

    assert(diagData.camStatus === 'BERFUNGSI (PLAYING)', `diag-cam-status memaparkan status aktif: "${diagData.camStatus}"`);
    assert(diagData.videoDim !== '0 x 0' && diagData.videoDim.includes('x'), `diag-video-dim memaparkan resolusi aktif: "${diagData.videoDim}"`);
    assert(diagData.videoReady && diagData.videoReady.includes('HAVE_'), `diag-video-ready memaparkan readyState yang sah: "${diagData.videoReady}"`);
    assert(diagData.mindarStatus && diagData.mindarStatus !== 'BELUM DIINISIALISASI', `diag-mindar-status memaparkan status aktif: "${diagData.mindarStatus}"`);
    assert(diagData.markerMindStatus && diagData.markerMindStatus.includes('5 Sasaran'), `diag-marker-mind-status memaparkan 5 sasaran: "${diagData.markerMindStatus}"`);
    assert(diagData.webglStatus === 'Normal (WebGL)', `diag-webgl-status normal: "${diagData.webglStatus}"`);
    assert(diagData.lastError === 'Tiada Ralat' || diagData.lastError === 'Tiada', `diag-last-error tiada ralat: "${diagData.lastError}"`);

    console.log('\n--- KUMPULAN 4: VERIFIKASI 5 SASARAN MARKER KOTAK ARSELNEL ---');
    const markerAnchors = (await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const S = window.KotakARSELNEL.ARState;
          return {
            hasAnchorVideo: !!S.anchorVideo,
            hasAnchorNota: !!S.anchorNota,
            hasAnchorKuiz: !!S.anchorKuiz,
            hasAnchorCellQuestAnimal: !!S.anchorCellQuestAnimal,
            hasAnchorCellQuestPlant: !!S.anchorCellQuestPlant
          };
        })()
      `,
      returnByValue: true
    }, msgId++)).result.value;

    assert(markerAnchors.hasAnchorVideo, 'Marker 0 (Video) anchor wujud');
    assert(markerAnchors.hasAnchorNota, 'Marker 1 (Nota) anchor wujud');
    assert(markerAnchors.hasAnchorKuiz, 'Marker 2 (Kuiz & Permainan) anchor wujud');
    assert(markerAnchors.hasAnchorCellQuestAnimal, 'Marker 3 (Sel Haiwan) anchor wujud');
    assert(markerAnchors.hasAnchorCellQuestPlant, 'Marker 4 (Sel Tumbuhan) anchor wujud');

    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN UJIAN: ${passed} LULUS, ${failed} GAGAL`);
    console.log('================================================================');

    ws.close();
    edgeProcess.kill();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Ralat semasa menjalankan ujian:', err);
    try { edgeProcess.kill(); } catch (e) {}
    process.exit(1);
  }
}

runTests();

