/**
 * ARSELNEL — AUTOMATED QA VERIFICATION SUITE
 * EMERGENCY RECOVERY HOTFIX 1.3
 * Repair Marker Routing, Overlapping AR Panels, POV State, WCAG AA Contrast & Mobile UI Layout
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60561;
const CDP_PORT = 9301;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_emergency_recovery_1_3');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise(resolve => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function findBrowser() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Chrome/Edge ditemui!');
}

function getPages(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
    });
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error((res.exceptionDetails.exception && res.exceptionDetails.exception.description) || res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 800
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const localPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(localPath, Buffer.from(res.data, 'base64'));
    const brainPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(brainPath, Buffer.from(res.data, 'base64'));
    return localPath;
  }

  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function runTestSuite() {
  console.log('==============================================================');
  console.log('🚀 ARSELNEL QA: EMERGENCY RECOVERY HOTFIX 1.3 TEST SUITE');
  console.log('==============================================================\n');

  const server = await startServer();
  console.log(`[1] Pelayan ujian aktif di http://127.0.0.1:${PORT}`);

  const browserPath = findBrowser();
  const tmpProfile = path.join(os.tmpdir(), 'arselnel_recovery13_test_' + Date.now());
  const browserProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    `--user-data-dir=${tmpProfile}`,
    'about:blank'
  ]);

  let client = null;
  const testResults = [];

  function recordTest(num, name, passed, detail = '') {
    testResults.push({ num, name, passed, detail });
    const mark = passed ? '✅ LULUS' : '❌ GAGAL';
    console.log(`  [Ujian ${num}] ${mark} - ${name}${detail ? ` (${detail})` : ''}`);
  }

  try {
    await new Promise(r => setTimeout(r, 1600));
    const pages = await getPages(CDP_PORT);
    const targetPage = pages.find(p => p.type === 'page');
    client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.ready;
    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    const url = `http://127.0.0.1:${PORT}/kotak_arselnel/code.html`;
    console.log(`[2] Navigasi ke ${url}...`);
    await client.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2400));

    // Set mobile iPhone 14 viewport (390x844)
    await client.setViewport(390, 844);
    await new Promise(r => setTimeout(r, 300));

    // Initialize deterministic Three.js & mock anchors if camera not streaming in headless
    await client.eval(`
      (() => {
        window.alert = () => {};
        window.confirm = () => true;
        // Close any initial onboarding / tour overlay so we test the actual AR panels
        try {
          localStorage.setItem('arselnel_tour_guest_kotak_arselnel', 'true');
          localStorage.setItem('arselnel_pov_guide_seen_v1', 'true');
        } catch (_) {}
        const closeTourOverlays = () => {
          const ob = document.getElementById('onboarding-guide-modal');
          if (ob) ob.classList.add('hidden');
          const loading = document.getElementById('loading-screen');
          if (loading) {
            loading.classList.add('hidden', 'fade-out');
            loading.style.display = 'none';
          }
          if (window.ArselnelTour && typeof window.ArselnelTour.closeTour === 'function') {
            window.ArselnelTour.closeTour();
          }
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.dismissPOVInteractiveGuide === 'function') {
            window.KotakARSELNEL.dismissPOVInteractiveGuide();
          }
        };
        closeTourOverlays();
        window.__closeTourOverlays = closeTourOverlays;
        const loading = document.getElementById('loading-screen');
        if (loading) loading.classList.add('hidden');

        if (window.THREE) {
          if (!ARState.scene) {
            const canvas = document.createElement('canvas');
            canvas.id = 'test-webgl-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.zIndex = '0';
            document.body.insertBefore(canvas, document.body.firstChild);

            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.05, 1000);
            scene.add(camera);

            const makeAnchor = () => {
              const g = new THREE.Group();
              g.visible = true;
              g.position.set(0, 0, -2.2);
              scene.add(g);
              return { group: g };
            };

            ARState.scene = scene;
            ARState.camera = camera;
            ARState.renderer = renderer;
            ARState.anchorVideo = makeAnchor();
            ARState.anchorNota = makeAnchor();
            ARState.anchorKuiz = makeAnchor();
            ARState.anchorCellQuestAnimal = makeAnchor();
            ARState.anchorCellQuestPlant = makeAnchor();
            ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
            ARState.hologramGroup = { group: new THREE.Group() };
            ARState.anchorVideo.group.add(ARState.hologramGroup.group);

            if (typeof CellQuestARController !== 'undefined') {
              CellQuestARController.init(scene, ARState.anchorCellQuest.group, camera, renderer);
            }
          }
        }
      })()
    `);

    // ----------------------------------------------------
    // TEST 1: Video marker (Target 0) opens Video
    // ----------------------------------------------------
    const t1 = await client.eval(`
      (() => {
        ARState.activePanels.clear();
        handleTargetFound(0);
        const floating = document.getElementById('floating-ar-anchor');
        const vidSel = document.getElementById('video-selection-view');
        const vidPlay = document.getElementById('active-player-view');
        const catText = document.getElementById('panel-category-text')?.textContent.trim();
        const isVidContentVisible = (vidSel && vidSel.style.display !== 'none') || (vidPlay && vidPlay.classList.contains('is-active'));
        return {
          activeModule: ARState.activeModule,
          hasVideoInSet: ARState.activePanels.has('video'),
          floatingVisible: floating && !floating.classList.contains('hidden') && floating.classList.contains('is-visible'),
          catText,
          isVidContentVisible
        };
      })()
    `);
    recordTest(1, 'Kad penanda Video (Target 0) membuka modul Video dengan kandungan Video',
      t1.activeModule === 'video' && t1.hasVideoInSet && t1.floatingVisible && t1.isVidContentVisible && t1.catText.includes('Video'),
      `Mod: ${t1.activeModule}, Tajuk: ${t1.catText}`);

    await client.captureScreenshot('recovery13_video_marker_iphone14.png');

    // ----------------------------------------------------
    // TEST 2: Nota marker (Target 1) opens Nota (even after Video was open!)
    // ----------------------------------------------------
    const t2 = await client.eval(`
      (() => {
        if (window.__closeTourOverlays) window.__closeTourOverlays();
        handleTargetFound(1);
        const povNota = document.getElementById('pov-panel-nota');
        const floating = document.getElementById('floating-ar-anchor');
        const notaVisible = (povNota && !povNota.classList.contains('hidden')) ||
                            (floating && !floating.classList.contains('hidden') && ARState.activeModule === 'nota');
        return {
          activeModule: ARState.activeModule,
          hasNotaInSet: ARState.activePanels.has('nota'),
          notaVisible
        };
      })()
    `);
    recordTest(2, 'Kad penanda Nota (Target 1) membuka modul Nota dengan kandungan Nota Interaktif',
      t2.activeModule === 'nota' && t2.hasNotaInSet && t2.notaVisible,
      `Mod: ${t2.activeModule}, Nota Kelihatan: ${t2.notaVisible}`);

    await client.captureScreenshot('recovery13_nota_marker_iphone14.png');

    // ----------------------------------------------------
    // TEST 3: Nota marker never opens Video unintentionally (even when pressing Kunci Pandangan on Nota!)
    // ----------------------------------------------------
    const t3 = await client.eval(`
      (async () => {
        // Test initial scan of Nota followed by pressing Kunci Pandangan (#btn-start-pov)
        destroyVideoSession();
        destroyNotaSession();
        ARState.markerCooldown = {};
        handleTargetFound(1); // Only Nota is scanned

        const floating = document.getElementById('floating-ar-anchor');
        const vidSelInFloat = document.getElementById('video-selection-view');
        const vidPlayInFloat = document.getElementById('active-player-view');
        const videoHiddenInSingle = (!vidSelInFloat || vidSelInFloat.style.display === 'none') &&
                                    (!vidPlayInFloat || !vidPlayInFloat.classList.contains('is-active'));

        // Now press #btn-start-pov on the Nota card (this caused Screenshot 1 in Hotfix 1.2!)
        const btnStart = document.getElementById('btn-start-pov');
        if (btnStart) btnStart.click();
        await new Promise(r => setTimeout(r, 60));

        const povVid = document.getElementById('pov-panel-video');
        const povNota = document.getElementById('pov-panel-nota');
        const povVidHidden = !povVid || povVid.classList.contains('hidden');
        const povNotaVisible = !!(povNota && !povNota.classList.contains('hidden'));
        const vidBtnText = document.getElementById('pov-btn-change-content-text')?.textContent.trim();

        // Cancel POV setup back to normal
        SpatialPanelManager.cancelPanelPOV('nota');

        return {
          videoHiddenInSingle,
          povVidHidden,
          povNotaVisible,
          vidBtnText,
          hasVideoInPanels: ARState.activePanels.has('video')
        };
      })()
    `);
    recordTest(3, 'Kad Nota TIDAK sesekali membuka panel Video (termasuk apabila menekan Kunci Pandangan)',
      t3.videoHiddenInSingle && t3.povVidHidden && t3.povNotaVisible && !t3.hasVideoInPanels && t3.vidBtnText === 'Tukar Video',
      `povVidHidden: ${t3.povVidHidden}, povNotaVisible: ${t3.povNotaVisible}`);

    // ----------------------------------------------------
    // TEST 4: Video marker never opens Nota unintentionally
    // ----------------------------------------------------
    const t4 = await client.eval(`
      (() => {
        destroyNotaSession();
        destroyVideoSession();
        ARState.markerCooldown = {};
        handleTargetFound(0); // Only Video is scanned

        const notaSelInFloat = document.getElementById('nota-selection-view');
        const notaActInFloat = document.getElementById('active-nota-view');
        const povNota = document.getElementById('pov-panel-nota');

        const notaHiddenInSingle = (!notaSelInFloat || notaSelInFloat.classList.contains('hidden')) &&
                                   (!notaActInFloat || notaActInFloat.classList.contains('hidden'));
        const povNotaHidden = !povNota || povNota.classList.contains('hidden');

        return {
          activeModule: ARState.activeModule,
          notaHiddenInSingle,
          povNotaHidden,
          hasNotaInPanels: ARState.activePanels.has('nota')
        };
      })()
    `);
    recordTest(4, 'Kad Video TIDAK sesekali membuka panel Nota secara tidak sengaja',
      t4.activeModule === 'video' && t4.notaHiddenInSingle && t4.povNotaHidden && !t4.hasNotaInPanels);

    // ----------------------------------------------------
    // TEST 5: Rapid marker switching does not corrupt module state
    // ----------------------------------------------------
    const t5 = await client.eval(`
      (() => {
        const sequence = [0, 1, 0, 3, 1, 0, 1];
        for (const idx of sequence) {
          handleTargetFound(idx);
        }
        // Final marker in sequence is 1 (Nota)
        const povNota = document.getElementById('pov-panel-nota');
        const povVid = document.getElementById('pov-panel-video');
        const floating = document.getElementById('floating-ar-anchor');
        return {
          activeModule: ARState.activeModule,
          notaVisible: povNota && !povNota.classList.contains('hidden'),
          vidHidden: povVid && povVid.classList.contains('hidden'),
          floatingHidden: floating && floating.classList.contains('hidden'),
          vidBtnText: document.getElementById('pov-btn-change-content-text')?.textContent.trim()
        };
      })()
    `);
    recordTest(5, 'Pertukaran pantas antara kad penanda (0→1→0→3→1→0→1) tidak merosakkan state modul',
      t5.activeModule === 'nota' && t5.notaVisible && t5.vidHidden && t5.floatingHidden && t5.vidBtnText === 'Tukar Video',
      `Mod Akhir: ${t5.activeModule}`);

    // ----------------------------------------------------
    // TEST 6: Repeated marker detection does not create duplicate panels
    // ----------------------------------------------------
    const t6 = await client.eval(`
      (() => {
        for (let i = 0; i < 5; i++) handleTargetFound(0);
        for (let i = 0; i < 5; i++) handleTargetFound(1);
        return {
          floatingCount: document.querySelectorAll('#floating-ar-anchor').length,
          povVidCount: document.querySelectorAll('#pov-panel-video').length,
          povNotaCount: document.querySelectorAll('#pov-panel-nota').length,
          pillsCount: document.querySelectorAll('#multi-panel-tags-list .multi-pill').length,
          activePanelsSize: ARState.activePanels.size
        };
      })()
    `);
    recordTest(6, 'Pengesanan marker berulang kali tidak mencipta panel atau pil pendua',
      t6.floatingCount === 1 && t6.povVidCount === 1 && t6.povNotaCount === 1 && t6.pillsCount === t6.activePanelsSize);

    // ----------------------------------------------------
    // TEST 7: Multiple registered modules remain accessible
    // ----------------------------------------------------
    const t7 = await client.eval(`
      (() => {
        const bar = document.getElementById('ar-multi-panel-bar');
        const barVisible = bar && !bar.classList.contains('hidden');
        const hasVid = ARState.activePanels.has('video');
        const hasNota = ARState.activePanels.has('nota');
        const hasCQ = ARState.activePanels.has('cellquest') || ARState.activePanels.has('cellquest-animal') || ARState.activePanels.has('cellquest-plant');
        const pillVid = !!document.querySelector('#multi-panel-tags-list .pill-video');
        const pillNota = !!document.querySelector('#multi-panel-tags-list .pill-nota');
        const pillCQ = !!document.querySelector('#multi-panel-tags-list .pill-cellquest');
        return { barVisible, hasVid, hasNota, hasCQ, pillVid, pillNota, pillCQ };
      })()
    `);
    recordTest(7, 'Semua modul berdaftar (Video, Nota, CellQuest 3D) kekal boleh diakses pada bar modul aktif',
      t7.barVisible && t7.hasVid && t7.hasNota && t7.hasCQ && t7.pillVid && t7.pillNota && t7.pillCQ);

    // ----------------------------------------------------
    // TEST 8: Only one expanded content panel is visible on mobile
    // ----------------------------------------------------
    const t8 = await client.eval(`
      (() => {
        const checkSingleExpanded = (modToFocus) => {
          focusPanel(modToFocus);
          const panels = [
            document.getElementById('floating-ar-anchor'),
            document.getElementById('pov-panel-video'),
            document.getElementById('pov-panel-nota'),
            document.getElementById('pov-panel-kuiz'),
            document.getElementById('pov-panel-selbot')
          ];
          const visiblePanels = panels.filter(el => {
            if (!el) return false;
            const cs = window.getComputedStyle(el);
            return !el.classList.contains('hidden') && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
          });
          return visiblePanels.map(el => el.id);
        };

        const visWhenVideo = checkSingleExpanded('video');
        const visWhenNota = checkSingleExpanded('nota');
        const visWhenCQ = checkSingleExpanded('cellquest');

        return { visWhenVideo, visWhenNota, visWhenCQ };
      })()
    `);
    recordTest(8, 'Hanya SATU panel kandungan berkembang kelihatan pada satu-satu masa di skrin mudah alih',
      t8.visWhenVideo.length === 1 && t8.visWhenVideo[0] === 'pov-panel-video' &&
      t8.visWhenNota.length === 1 && t8.visWhenNota[0] === 'pov-panel-nota' &&
      t8.visWhenCQ.length === 0,
      `Video:[${t8.visWhenVideo}], Nota:[${t8.visWhenNota}], CQ:[${t8.visWhenCQ}]`);

    // ----------------------------------------------------
    // TEST 9: Module switching works and preserves content
    // ----------------------------------------------------
    const t9 = await client.eval(`
      (() => {
        // Select a specific video and a specific note
        focusPanel('video');
        if (ARState.videos && ARState.videos.length > 0) selectVideo(ARState.videos[0]);
        const chosenVidId = ARState.activeVideo ? ARState.activeVideo.id : null;

        // Click Nota pill in multi-panel bar
        const pillNota = document.querySelector('#multi-panel-tags-list .pill-nota');
        if (pillNota) pillNota.click();
        if (ARState.notes && ARState.notes.length > 0) selectNote(ARState.notes[0]);
        const chosenNoteId = ARState.activeNote ? ARState.activeNote.id : null;
        const activeAfterNotaClick = ARState.activeModule;

        // Click Video pill in multi-panel bar
        const pillVid = document.querySelector('#multi-panel-tags-list .pill-video');
        if (pillVid) pillVid.click();
        const activeAfterVidClick = ARState.activeModule;
        const preservedVidId = ARState.activeVideo ? ARState.activeVideo.id : null;
        const preservedNoteId = ARState.activeNote ? ARState.activeNote.id : null;

        return {
          activeAfterNotaClick,
          activeAfterVidClick,
          vidPreserved: chosenVidId && chosenVidId === preservedVidId,
          notePreserved: chosenNoteId && chosenNoteId === preservedNoteId
        };
      })()
    `);
    recordTest(9, 'Pertukaran antara modul melalui bar modul aktif berfungsi lancar & mengekalkan kandungan',
      t9.activeAfterNotaClick === 'nota' && t9.activeAfterVidClick === 'video' && t9.vidPreserved && t9.notePreserved);

    // ----------------------------------------------------
    // TEST 10: Module closing works
    // ----------------------------------------------------
    const t10 = await client.eval(`
      (() => {
        const closeBtnVid = document.querySelector('#multi-panel-tags-list .pill-video .pill-close-btn');
        if (closeBtnVid) closeBtnVid.click();
        const hasVidAfterClose = ARState.activePanels.has('video');
        const povVidHidden = document.getElementById('pov-panel-video')?.classList.contains('hidden');
        const remainingActive = ARState.activeModule;
        return { hasVidAfterClose, povVidHidden, remainingActive };
      })()
    `);
    recordTest(10, 'Penutupan modul berfungsi & beralih dengan selamat ke modul aktif seterusnya',
      !t10.hasVidAfterClose && t10.povVidHidden && (t10.remainingActive === 'nota' || t10.remainingActive === 'cellquest'));

    // ----------------------------------------------------
    // TEST 11, 12, 13: POV State Sequence (AR_NORMAL ⇄ POV_SETUP ⇄ POV_LOCKED)
    // ----------------------------------------------------
    const t11to13 = await client.eval(`
      (async () => {
        focusPanel('nota');
        SpatialPanelManager.exitPanelPOV('nota');

        const btnStart = document.getElementById('pov-nota-btn-start-pov');
        const btnAnchor = document.getElementById('pov-nota-btn-anchor');
        const btnCancel = document.getElementById('pov-nota-btn-cancel');
        const btnExit = document.getElementById('pov-nota-btn-exit-pov');
        const dupTopBtn = document.getElementById('btn-switch-to-pov');
        const dupTopHidden = !dupTopBtn || window.getComputedStyle(dupTopBtn).display === 'none';

        // 11. AR_NORMAL
        const normalOk = !btnStart.classList.contains('hidden') &&
                         btnAnchor.classList.contains('hidden') &&
                         btnCancel.classList.contains('hidden') &&
                         btnExit.classList.contains('hidden') &&
                         dupTopHidden;

        // 12. Enter POV_SETUP
        await SpatialPanelManager.enterPanelPOVSetup('nota');
        const setupOk = btnStart.classList.contains('hidden') &&
                        !btnAnchor.classList.contains('hidden') &&
                        !btnCancel.classList.contains('hidden') &&
                        btnExit.classList.contains('hidden');

        // 13. Confirm Letak di Arah Ini -> POV_LOCKED
        SpatialPanelManager.lockPanelPOV('nota');
        const lockedOk = btnStart.classList.contains('hidden') &&
                         btnAnchor.classList.contains('hidden') &&
                         btnCancel.classList.contains('hidden') &&
                         !btnExit.classList.contains('hidden');

        // Exit POV_LOCKED -> AR_NORMAL
        SpatialPanelManager.exitPanelPOV('nota');
        const exitBackOk = !btnStart.classList.contains('hidden') &&
                           btnExit.classList.contains('hidden');

        return { normalOk, setupOk, lockedOk, exitBackOk };
      })()
    `);
    recordTest(11, 'Butang "Kunci Pandangan" kelihatan dalam AR_NORMAL tanpa butang pendua di bar atas', t11to13.normalOk);
    recordTest(12, 'Butang "Letak di Arah Ini" dan "Batal" muncul hanya dalam mod POV_SETUP', t11to13.setupOk);
    recordTest(13, 'Butang "Keluar Pandangan" muncul hanya selepas pandangan dikunci dalam POV_LOCKED', t11to13.lockedOk && t11to13.exitBackOk);

    // ----------------------------------------------------
    // TEST 14: No screen-pinning UI is visible
    // ----------------------------------------------------
    const t14 = await client.eval(`
      (() => {
        const pinBtns = Array.from(document.querySelectorAll('button')).filter(b => {
          const txt = (b.textContent || '').toLowerCase();
          return txt.includes('semat skrin') || txt.includes('semat pada skrin') || txt.includes('semat model');
        });
        return { count: pinBtns.length };
      })()
    `);
    recordTest(14, 'Tiada elemen UI "Semat Skrin" atau "Semat Model" wujud atau kelihatan', t14.count === 0);

    // ----------------------------------------------------
    // TEST 15: No large CellQuest bottom toolbar returns
    // ----------------------------------------------------
    const t15 = await client.eval(`
      (() => {
        const bar = document.getElementById('cq-bottom-controls');
        const visible = bar && window.getComputedStyle(bar).display !== 'none';
        return { exists: !!bar, visible };
      })()
    `);
    recordTest(15, 'Tiada bar alat bawah CellQuest (#cq-bottom-controls) dipaparkan', !t15.exists || !t15.visible);

    // ----------------------------------------------------
    // TEST 16: Marker-first CellQuest activation works
    // ----------------------------------------------------
    const t16 = await client.eval(`
      (() => {
        destroyCellQuestSession();
        ARState.markerCooldown = {};
        const beforeScanVisible = CellQuestARController.rootGroup ? CellQuestARController.rootGroup.visible : false;

        handleTargetFound(3); // Animal Cell marker
        const animalOk = CellQuestARController.displayMode === 'animal' &&
                         CellQuestARController.animalHolder.visible &&
                         !CellQuestARController.plantHolder.visible;

        handleTargetFound(4); // Plant Cell marker scanned -> independent Plant focus (NO auto-Compare Mode!)
        const plantOk = CellQuestARController.focusedCell === 'plant' &&
                        CellQuestARController.cells.plant.isActive &&
                        CellQuestARController.plantHolder.visible;

        return { beforeScanVisible, animalOk, dualOk: plantOk };
      })()
    `);
    recordTest(16, 'Pengaktifan model 3D berasaskan kad penanda (Sel Haiwan, Sel Tumbuhan & Dwi-Sel) berfungsi',
      !t16.beforeScanVisible && t16.animalOk && t16.dualOk);

    // ----------------------------------------------------
    // TEST 17: WCAG AA Text Contrast Audit (>= 4.5:1)
    // ----------------------------------------------------
    const t17 = await client.eval(`
      (() => {
        function parseRgb(str) {
          const m = (str || '').match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
          if (!m) return [255, 255, 255];
          return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
        }
        function luminance([r, g, b]) {
          const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        }
        function contrastRatio(rgb1, rgb2) {
          const l1 = luminance(rgb1);
          const l2 = luminance(rgb2);
          const brightest = Math.max(l1, l2);
          const darkest = Math.min(l1, l2);
          return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
        }

        const buttonIds = [
          'btn-start-pov',
          'btn-anchor-pov',
          'btn-cancel-pov',
          'btn-exit-pov',
          'btn-change-video',
          'btn-close-panel',
          'btn-toggle-cam',
          'pov-btn-start-pov',
          'pov-btn-anchor',
          'pov-btn-cancel',
          'pov-btn-exit-pov',
          'pov-btn-change-video',
          'pov-btn-close',
          'pov-btn-toggle-cam',
          'pov-nota-btn-start-pov',
          'pov-nota-btn-anchor',
          'pov-nota-btn-cancel',
          'pov-nota-btn-exit-pov',
          'pov-nota-btn-change-content',
          'pov-nota-btn-close',
          'pov-nota-btn-toggle-cam',
          'cq-btn-pov',
          'cq-btn-pov-anchor',
          'cq-btn-pov-cancel',
          'btn-add-scan'
        ];

        const results = {};
        let minRatio = 99;
        let minId = '';

        for (const id of buttonIds) {
          const el = document.getElementById(id);
          if (!el) continue;
          const cs = window.getComputedStyle(el);
          const span = el.querySelector('span:not(.material-symbols-outlined)') || el;
          const spanCs = window.getComputedStyle(span);
          const fg = parseRgb(spanCs.color || cs.color);
          const bg = parseRgb(cs.backgroundColor);
          const ratio = contrastRatio(fg, bg);
          results[id] = ratio;
          if (ratio < minRatio) {
            minRatio = ratio;
            minId = id;
          }
        }

        return { minRatio, minId, results };
      })()
    `);
    recordTest(17, 'Kontras teks semua butang kritikal melepasi piawaian WCAG AA (>= 4.5:1)',
      t17.minRatio >= 4.5,
      `Nisbah Minimum: ${t17.minRatio}:1 pada #${t17.minId}`);

    // ----------------------------------------------------
    // TEST 18 & 19: No Overlapping Critical Controls & Zero Horizontal Overflow Across All 8 Viewports
    // ----------------------------------------------------
    const viewports = [
      { name: 'Android Galaxy A (360x800)', w: 360, h: 800 },
      { name: 'iPhone SE (375x667)', w: 375, h: 667 },
      { name: 'iPhone 14 (390x844)', w: 390, h: 844 },
      { name: 'iPhone 15 Pro Max (430x932)', w: 430, h: 932 },
      { name: 'iPad Portrait (768x1024)', w: 768, h: 1024 },
      { name: 'iPad Landscape (1024x768)', w: 1024, h: 768 },
      { name: 'Laptop (1366x768)', w: 1366, h: 768 },
      { name: 'Desktop Full HD (1920x1080)', w: 1920, h: 1080 }
    ];

    let noOverlapAll = true;
    let noOverflowAll = true;
    const layoutIssues = [];

    for (const vp of viewports) {
      await client.setViewport(vp.w, vp.h);
      await new Promise(r => setTimeout(r, 220));

      const vpCheck = await client.eval(`
        (() => {
          if (window.__closeTourOverlays) window.__closeTourOverlays();

          // Ensure Nota panel is focused and positioned via updateSpatialPanelsPosition
          ARState.markerCooldown = {};
          handleTargetFound(1);
          updateSpatialPanelsPosition();

          const winW = window.innerWidth;
          const winH = window.innerHeight;
          const docW = document.documentElement.scrollWidth;
          const hasHScroll = docW > winW;

          const hud = document.querySelector('.ar-top-hud');
          const multiBar = document.getElementById('ar-multi-panel-bar');
          const panel = document.getElementById('pov-panel-nota');
          const card = panel ? panel.querySelector('.floating-card-container') : null;

          const hudRect = hud ? hud.getBoundingClientRect() : null;
          const barRect = (multiBar && !multiBar.classList.contains('hidden')) ? multiBar.getBoundingClientRect() : null;
          const cardRect = (card && panel && !panel.classList.contains('hidden')) ? card.getBoundingClientRect() : null;

          // Check HUD vs Multi-Panel Bar overlap
          const hudOverlapsBar = (hudRect && barRect)
            ? (hudRect.bottom > barRect.top + 4 && hudRect.top < barRect.bottom)
            : false;

          // Check panel stays inside horizontal & vertical viewport bounds
          const cardInsideViewport = cardRect
            ? (cardRect.left >= -1 && cardRect.right <= winW + 1 && cardRect.top >= 0 && cardRect.bottom <= winH + 2)
            : true;

          return {
            hasHScroll,
            hudOverlapsBar,
            cardInsideViewport,
            cardLeft: cardRect ? Math.round(cardRect.left) : 0,
            cardRight: cardRect ? Math.round(cardRect.right) : 0,
            cardTop: cardRect ? Math.round(cardRect.top) : 0,
            cardBottom: cardRect ? Math.round(cardRect.bottom) : 0,
            hudBottom: hudRect ? Math.round(hudRect.bottom) : 0,
            barTop: barRect ? Math.round(barRect.top) : 0,
            barBottom: barRect ? Math.round(barRect.bottom) : 0
          };
        })()
      `);

      if (vpCheck.hudOverlapsBar || !vpCheck.cardInsideViewport) {
        noOverlapAll = false;
        layoutIssues.push(`${vp.name}: hudBottom=${vpCheck.hudBottom}, barTop=${vpCheck.barTop}, card=[${vpCheck.cardLeft},${vpCheck.cardTop}..${vpCheck.cardRight},${vpCheck.cardBottom}]`);
      }
      if (vpCheck.hasHScroll) {
        noOverflowAll = false;
        layoutIssues.push(`${vp.name}: Horizontal scroll detected`);
      }

      await client.captureScreenshot(`recovery13_viewport_${vp.w}x${vp.h}.png`);
    }

    recordTest(18, 'Tiada pertindihan kawalan kritikal & panel kekal 100% di dalam sempadan viewport',
      noOverlapAll,
      layoutIssues.length > 0 ? layoutIssues.join(' | ') : 'Semua 8 viewport bersih');

    recordTest(19, 'Tiada limpahan mendatar (zero horizontal overflow) merentasi kesemua 8 viewport',
      noOverflowAll);

    // ----------------------------------------------------
    // TEST 20: Core modules & MARKER_REGISTRY integrity
    // ----------------------------------------------------
    const t20 = await client.eval(`
      (() => {
        const reg = window.MARKER_REGISTRY;
        const regValid = reg &&
                         reg[0] && reg[0].module === 'video' &&
                         reg[1] && reg[1].module === 'nota' &&
                         reg[3] && reg[3].module === 'cellquest-animal' && reg[3].cellType === 'animal' &&
                         reg[4] && reg[4].module === 'cellquest-plant' && reg[4].cellType === 'plant';
        return {
          regValid,
          hasSPM: typeof SpatialPanelManager !== 'undefined',
          hasCQA: typeof CellQuestARController !== 'undefined'
        };
      })()
    `);
    recordTest(20, 'MARKER_REGISTRY berwibawa dan semua modul teras ARSELNEL berfungsi dengan utuh',
      t20.regValid && t20.hasSPM && t20.hasCQA);

    console.log('\n==============================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    console.log(`🏁 KEPUTUSAN QA: ${passedCount} / ${testResults.length} UJIAN LULUS (${Math.round((passedCount / testResults.length) * 100)}%)`);
    console.log('==============================================================\n');

    if (passedCount < testResults.length) {
      process.exitCode = 1;
    }
  } finally {
    if (client) client.close();
    try { browserProc.kill(); } catch (_) {}
    server.close();
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
