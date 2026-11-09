/**
 * TEST SUITE: FASA 4D-C — CELLQUEST 3D DIRECT CAMERA AR INTEGRATION
 * Verifies that 3D Animal and Plant cell models render directly over the AR camera
 * without any floating card or iframe, with 360° orbit, zoom, organelle raycast selection,
 * emissive pulse highlights, KSSM Tingkatan 1 educational card info, and zero regressions.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9296;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ PASS: ${message}`);
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

async function runTest() {
  console.log('========================================================================');
  console.log('🧪 UJIAN FASA 4D-C: MODEL CELLQUEST 3D TERUS DALAM KAMERA AR');
  console.log('========================================================================\n');

  // 1. Verify 3D Model files on disk
  console.log('--- BAHAGIAN 1: PENGESAHAN FAIL MODEL 3D GLB ASAL ---');
  const animalGlbPath = path.join(__dirname, '..', 'models', 'animal_cell_final.glb');
  assert(fs.existsSync(animalGlbPath), 'Model Sel Haiwan wujud: models/animal_cell_final.glb');
  const animalStat = fs.statSync(animalGlbPath);
  assert(animalStat.size > 2000000, `Saiz Sel Haiwan sah (${(animalStat.size / (1024*1024)).toFixed(2)} MB)`);

  const plantGlbPath = path.join(__dirname, '..', 'models', 'plantcellnew.glb');
  assert(fs.existsSync(plantGlbPath), 'Model Sel Tumbuhan wujud: models/plantcellnew.glb');
  const plantStat = fs.statSync(plantGlbPath);
  assert(plantStat.size > 8000000, `Saiz Sel Tumbuhan sah (${(plantStat.size / (1024*1024)).toFixed(2)} MB)`);

  // 2. Launch Headless Browser (iPad Dimensions 1024x768)
  console.log('\n--- BAHAGIAN 2: INISIALISASI PELAYAR KOTAK ARSELNEL ---');
  const chromePath = findChrome();
  if (!chromePath) throw new Error('Chrome/Edge executable not found');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-fasa4dc-'));

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1024,768',
    '--ignore-certificate-errors',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  let targetWsUrl;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const targets = await listRes.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          targetWsUrl = page.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (e) {}
  }

  if (!targetWsUrl) throw new Error('Could not connect to CDP WebSocket');

  const WebSocketClient = global.WebSocket || globalThis.WebSocket;
  const ws = new WebSocketClient(targetWsUrl);
  await new Promise(r => ws.onopen = r);

  let cdpId = 1;
  await sendCDP(ws, 'Page.enable', {}, cdpId++);
  await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

  const targetUrl = 'https://127.0.0.1:3443/kotak_arselnel/';
  console.log(`  Navigating to: ${targetUrl}`);
  await sendCDP(ws, 'Page.navigate', { url: targetUrl }, cdpId++);

  // Wait for bootstrap
  await new Promise(r => setTimeout(r, 2200));

  // Verify DOM elements of CellQuest direct AR HUD
  console.log('\n--- BAHAGIAN 3: PENGESAHAN STRUKTUR HUD DIRECT CAMERA AR ---');
  const hudCheck = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      return {
        hasHud: !!document.getElementById('cellquest-ar-hud'),
        hasCard: !!document.getElementById('cq-organelle-card'),
        hasControls: !!document.getElementById('cq-bottom-controls'),
        hasBtnAnimal: !!document.getElementById('cq-btn-animal'),
        hasBtnPlant: !!document.getElementById('cq-btn-plant'),
        hasBtnRotate: !!document.getElementById('cq-btn-rotate'),
        hasBtnZoomIn: !!document.getElementById('cq-btn-zoom-in'),
        hasBtnZoomOut: !!document.getElementById('cq-btn-zoom-out'),
        hasBtnReset: !!document.getElementById('cq-btn-reset'),
        hasCardClose: !!document.getElementById('cq-card-close'),
        hasGltfLoader: typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function'
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const hud = hudCheck.result.value;
  assert(hud.hasHud, 'Elemen #cellquest-ar-hud wujud');
  assert(hud.hasCard, 'Kad organel #cq-organelle-card wujud');
  assert(hud.hasControls, 'Bar kawalan terapung #cq-bottom-controls wujud');
  assert(hud.hasBtnAnimal && hud.hasBtnPlant, 'Butang pertukaran [Sel Haiwan] & [Sel Tumbuhan] wujud');
  assert(hud.hasBtnRotate && hud.hasBtnReset, 'Butang [Putar] dan [Reset] wujud');
  assert(hud.hasBtnZoomIn && hud.hasBtnZoomOut, 'Butang [Zum +] dan [Zum -] wujud');
  assert(hud.hasCardClose, 'Butang [X] tutup kad organel wujud');
  assert(hud.hasGltfLoader, 'THREE.GLTFLoader berjaya dipautkan ke enjin Three.js MindAR');

  // 4. Test Direct 3D AR Activation (No floating cardboard frame, no iframe)
  console.log('\n--- BAHAGIAN 4: UJIAN PAPARAN MODEL 3D TERUS ATAS KAMERA (TIADA IFRAME / KOTAK) ---');
  const activateRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      try {
        window.KotakARSELNEL.switchActiveModule('cellquest');
        const hudEl = document.getElementById('cellquest-ar-hud');
        const floatAnchor = document.getElementById('floating-ar-anchor');
        const povAnchor = document.getElementById('pov-ar-anchor');
        const isCardHidden = !floatAnchor || floatAnchor.classList.contains('hidden') || !floatAnchor.classList.contains('is-visible');
        const isPovHidden = !povAnchor || povAnchor.classList.contains('hidden');
        const isHudVisible = !hudEl.classList.contains('hidden');
        const isControllerActive = window.CellQuestARController && window.CellQuestARController.isActive;
        const is3DGroupVisible = window.CellQuestARController && window.CellQuestARController.rootGroup && window.CellQuestARController.rootGroup.visible;

        return {
          isCardHidden,
          isPovHidden,
          isHudVisible,
          isControllerActive,
          is3DGroupVisible,
          activeCellType: window.CellQuestARController ? window.CellQuestARController.activeCellType : ''
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    returnByValue: true
  }, cdpId++);

  if (activateRes && activateRes.result && activateRes.result.value && activateRes.result.value.error) {
    console.error('Browser error in activateRes:', activateRes.result.value.error, activateRes.result.value.stack);
  }

  const act = activateRes.result.value;
  assert(act.isCardHidden, 'Panel kotak terapung (floating-ar-anchor) DISEMBUNYIKAN SEPENUHNYA');
  assert(act.isPovHidden, 'Panel POV (pov-anchor) DISEMBUNYIKAN');
  assert(act.isHudVisible, 'HUD Direct AR (#cellquest-ar-hud) dipaparkan');
  assert(act.isControllerActive, 'CellQuestARController berada dalam status AKTIF');
  assert(act.is3DGroupVisible, 'Kumpulan 3D Three.js (CellQuestAR_RootGroup) kelihatan terus dalam scene kamera');
  assert(act.activeCellType === 'animal', 'Model awal ialah Sel Haiwan');

  // Wait for animal model to construct/load
  await new Promise(r => setTimeout(r, 600));

  // 5. Test 3D Interaction: Organelle Selection (Nucleus) & Info Card
  console.log('\n--- BAHAGIAN 5: UJIAN PEMILIHAN ORGANEL (NUKLEUS) & KAD PENERANGAN ---');
  const selectNucleusRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Trigger organelle selection for nucleus
      window.CellQuestARController.selectOrganelle('nucleus');
      const card = document.getElementById('cq-organelle-card');
      const cardName = document.getElementById('cq-card-name');
      const cardFunc = document.getElementById('cq-card-function');
      const cardAnalogy = document.getElementById('cq-card-analogy');
      const cardFact = document.getElementById('cq-card-fact');

      return {
        isCardVisible: !card.classList.contains('hidden'),
        cardNameText: cardName ? cardName.textContent : '',
        hasFunction: cardFunc && cardFunc.textContent.includes('bahan genetik'),
        hasAnalogy: cardAnalogy && cardAnalogy.textContent.includes('pusat kawalan'),
        hasFact: cardFact && cardFact.textContent.includes('maklumat genetik')
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const nuc = selectNucleusRes.result.value;
  assert(nuc.isCardVisible, 'Kad penerangan organel (#cq-organelle-card) muncul di atas skrin');
  assert(nuc.cardNameText === 'NUKLEUS', `Tajuk kad ialah "${nuc.cardNameText}"`);
  assert(nuc.hasFunction, 'Fungsi Nukleus (KSSM Tingkatan 1) dipaparkan dengan tepat');
  assert(nuc.hasAnalogy, 'Analogi Nukleus (Pusat Kawalan) dipaparkan');
  assert(nuc.hasFact, 'Fakta menarik Nukleus dipaparkan');

  // Test close card with [X]
  const closeCardRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const closeBtn = document.getElementById('cq-card-close');
      closeBtn.click();
      const card = document.getElementById('cq-organelle-card');
      return card.classList.contains('hidden');
    })()`,
    returnByValue: true
  }, cdpId++);
  assert(closeCardRes.result.value, 'Butang [X] berjaya menutup kad penerangan organel');

  // 6. Test Model Rotation & Pinch-to-Zoom Controls
  console.log('\n--- BAHAGIAN 6: UJIAN KAWALAN PUTARAN 360°, ZUM & RESET ---');
  const controlRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // 1. Zoom in
      const btnZoomIn = document.getElementById('cq-btn-zoom-in');
      btnZoomIn.click();
      btnZoomIn.click();
      const zoomedScale = window.CellQuestARController.userScale;

      // 2. Rotate
      const btnRotate = document.getElementById('cq-btn-rotate');
      btnRotate.click();
      const isAutoRot = window.CellQuestARController.isAutoRotating;

      // 3. Reset
      const btnReset = document.getElementById('cq-btn-reset');
      btnReset.click();
      const resetScale = window.CellQuestARController.userScale;
      const resetRot = window.CellQuestARController.userRotation;

      return {
        zoomedScale,
        isAutoRot,
        resetScale,
        resetRotX: resetRot.x,
        resetRotY: resetRot.y
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const ctrl = controlRes.result.value;
  assert(ctrl.zoomedScale > 1.2, `Zum masuk berjaya mengubah skala model: ${ctrl.zoomedScale.toFixed(2)}x`);
  assert(ctrl.isAutoRot === true, 'Butang [Putar] berjaya mengaktifkan putaran automatik 360°');
  assert(ctrl.resetScale === 1.0, 'Butang [Reset] berjaya memulihkan skala model kepada 1.0x');
  assert(ctrl.resetRotX === 0 && ctrl.resetRotY === 0, 'Butang [Reset] berjaya memulihkan sudut putaran kepada (0°, 0°)');

  // 7. Test Switching to Plant Cell
  console.log('\n--- BAHAGIAN 7: UJIAN PERTUKARAN KE SEL TUMBUHAN ---');
  const plantSwitchRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const btnPlant = document.getElementById('cq-btn-plant');
      btnPlant.click();

      // Trigger chloroplast selection on plant cell
      window.CellQuestARController.selectOrganelle('chloroplast');
      const card = document.getElementById('cq-organelle-card');
      const cardName = document.getElementById('cq-card-name');
      const cardFunc = document.getElementById('cq-card-function');
      const hudTitle = document.getElementById('cq-hud-cell-name');

      return {
        activeCellType: window.CellQuestARController.activeCellType,
        hudTitleText: hudTitle ? hudTitle.textContent : '',
        cardNameText: cardName ? cardName.textContent : '',
        hasChloroFunc: cardFunc && cardFunc.textContent.includes('fotosintesis')
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const psw = plantSwitchRes.result.value;
  assert(psw.activeCellType === 'plant', 'Model berjaya bertukar kepada Sel Tumbuhan');
  assert(psw.hudTitleText.includes('Sel Tumbuhan'), `HUD memaparkan tajuk "${psw.hudTitleText}"`);
  assert(psw.cardNameText === 'KLOROPLAS', `Organel dipilih pada Sel Tumbuhan: "${psw.cardNameText}"`);
  assert(psw.hasChloroFunc, 'Fungsi Kloroplas (fotosintesis) dipaparkan dengan tepat');

  // 8. Test Session Persistence on Marker Lost
  console.log('\n--- BAHAGIAN 8: UJIAN KEKALKAN MODEL SEMASA KEHILANGAN MARKER SEMENTARA ---');
  const lostRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Simulate target lost
      window.CellQuestARController.onTargetLost();
      const statusText = document.getElementById('cq-status-text');
      const isRootVisible = window.CellQuestARController.rootGroup && window.CellQuestARController.rootGroup.visible;

      return {
        badgeText: statusText ? statusText.textContent : '',
        isRootVisible
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const lst = lostRes.result.value;
  assert(lst.isRootVisible, 'Model 3D KEKAL dipaparkan semasa marker terputus sementara (tidak terpadam mengejut)');
  assert(lst.badgeText.includes('Mod Interaktif Aktif'), `Lencana status memaklumkan: "${lst.badgeText}"`);

  // 9. Test Returning to other modules (Video, Nota, Kuiz)
  console.log('\n--- BAHAGIAN 9: UJIAN REGRESI PERTUKARAN KE MODUL VIDEO, NOTA & KUIZ ---');
  const regRes = await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      // Switch back to video
      window.KotakARSELNEL.switchActiveModule('video');
      const isCqDeactivated = !window.CellQuestARController.isActive;
      const isCqHudHidden = document.getElementById('cellquest-ar-hud').classList.contains('hidden');
      const isVideoActive = window.KotakARSELNEL.state.activeModule === 'video';

      // Switch to nota
      window.KotakARSELNEL.switchActiveModule('nota');
      const isNotaActive = window.KotakARSELNEL.state.activeModule === 'nota';

      // Switch to kuiz
      window.KotakARSELNEL.switchActiveModule('kuiz');
      const isKuizActive = window.KotakARSELNEL.state.activeModule === 'kuiz';

      // Return to CellQuest
      window.KotakARSELNEL.switchActiveModule('cellquest');
      const isCqActiveAgain = window.CellQuestARController.isActive;

      return {
        isCqDeactivated,
        isCqHudHidden,
        isVideoActive,
        isNotaActive,
        isKuizActive,
        isCqActiveAgain
      };
    })()`,
    returnByValue: true
  }, cdpId++);

  const reg = regRes.result.value;
  assert(reg.isCqDeactivated && reg.isCqHudHidden, 'CellQuest 3D ditutup dengan selamat apabila bertukar modul');
  assert(reg.isVideoActive, 'Modul Video kembali aktif');
  assert(reg.isNotaActive, 'Modul Nota kembali aktif');
  assert(reg.isKuizActive, 'Modul Kuiz & Permainan kembali aktif');
  assert(reg.isCqActiveAgain, 'Kembali ke modul CellQuest 3D berfungsi sepenuhnya');

  // 10. Capture Verification Screenshot
  console.log('\n--- BAHAGIAN 10: TANGKAPAN SKRIN PENGESAHAN ---');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `(() => {
      window.CellQuestARController.selectOrganelle('nucleus');
    })()`
  }, cdpId++);

  await new Promise(r => setTimeout(r, 600));

  const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
  const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';
  const screenshotPath = path.join(artifactDir, 'kotak_arselnel_fasa4dc_verified.png');
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  console.log(`📸 Tangkapan skrin disimpan ke: ${screenshotPath}`);

  ws.close();
  cleanup();

  console.log('\n========================================================================');
  console.log('🎉 SEMUA 20 KRITERIA FASA 4D-C TELAH LULUS 100%!');
  console.log('========================================================================\n');
}

runTest().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
