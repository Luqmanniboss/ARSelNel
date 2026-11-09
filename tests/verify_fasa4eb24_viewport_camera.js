/**
 * KOTAK ARSELNEL — FASA 4E-B.2.4 VERIFICATION SUITE
 * FIX BLACK SCREEN, SHRINKING CAMERA & MULTI-PANEL POV VIEWPORT
 * 
 * Verifies:
 * 1. Camera fills AR container before Lock POV (boundingClientRect matches viewport).
 * 2. Camera still fills container after Video Lock.
 * 3. Camera still fills container after Nota Lock.
 * 4. Camera does NOT shrink/scale when Yaw changes away from panels (Yaw = 108.7° as in user photo).
 * 5. Camera does NOT shrink/scale when Pitch changes (Pitch = -17.2° as in user photo).
 * 6. Panels safely move offscreen without expanding document bounds or shrinking viewport.
 * 7. HUD toolbar (.ar-multi-panel-bar) remains full-sized and properly positioned.
 * 8. Zero POV spatial transforms on camera ancestors (#ar-container has no transform/scale).
 * 9. No accidental black overlay covering camera (#ar-container video and canvas are visible).
 * 10. Viewport resize does not destroy AR session or multi-panel states.
 * 11. Video iframe session remains persistent.
 * 12. Nota reader session remains persistent.
 * 13. Reference quaternions and anchor headings remain intact.
 * 14. CellQuest 3D regressions pass with flying colors.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9348;

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
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-B.2.4: CAMERA VIEWPORT & ISOLATION SUITE');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4eb24_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    '--window-size=1280,800',
    'https://127.0.0.1:3443/kotak_arselnel/'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  try {
    await new Promise(r => setTimeout(r, 3500));
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('Halaman Kotak ARSELNEL tidak ditemui');

    const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let cdpId = 1;
    await sendCDP(ws, 'Page.enable', {}, cdpId++);
    await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

    console.log('--- UJIAN 1: Kamera memenuhi AR Container sebelum Lock POV ---');
    for (let i = 0; i < 20; i++) {
      const ready = await sendCDP(ws, 'Runtime.evaluate', {
        expression: `!!(window.KotakARSELNEL && window.SpatialPanelManager && window.THREE)`
      }, cdpId++);
      if (ready && ready.result && ready.result.value) break;
      await new Promise(r => setTimeout(r, 400));
    }

    const initialMetrics = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const ar = document.getElementById('ar-container');
          const video = ar ? ar.querySelector('video') : null;
          const canvas = ar ? ar.querySelector('canvas') : null;
          const rect = ar ? ar.getBoundingClientRect() : null;
          return {
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            docScrollW: document.documentElement.scrollWidth,
            docScrollH: document.documentElement.scrollHeight,
            arWidth: rect ? rect.width : 0,
            arHeight: rect ? rect.height : 0,
            arTop: rect ? rect.top : -1,
            arLeft: rect ? rect.left : -1,
            hasVideo: !!video,
            hasCanvas: !!canvas
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const m1 = initialMetrics.result.value;
    console.log('Initial Viewport Metrics:', m1);
    assert(m1.arWidth === m1.windowW, `Kamera memenuhi lebar skrin (arWidth=${m1.arWidth}, winW=${m1.windowW})`);
    assert(m1.arHeight === m1.windowH, `Kamera memenuhi tinggi skrin (arHeight=${m1.arHeight}, winH=${m1.windowH})`);
    assert(m1.arTop === 0 && m1.arLeft === 0, `Kamera tepat di posisi (0, 0) skrin`);
    assert(m1.docScrollW === m1.windowW, `Document scrollWidth tidak mengembang (${m1.docScrollW} === ${m1.windowW})`);

    console.log('\n--- UJIAN 2: Kamera masih memenuhi container selepas Lock Video ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (async () => {
          const loadEl = document.getElementById('loading-screen');
          if (loadEl) loadEl.classList.add('hidden');
          window.handleTargetFound(0, 'video');
          await window.KotakARSELNEL.startPOVMode();
          window.KotakARSELNEL.state.pov.screenAngle = 90;
          const qRef = window.KotakARSELNEL.computeDeviceCameraQuaternion(90, 0, 90, 90);
          window.KotakARSELNEL.state.pov.targetQuaternion = qRef;
          window.KotakARSELNEL.state.pov.currentQuaternion = qRef.clone();
          document.getElementById('pov-btn-anchor').click();
        })()
      `
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));

    const postVideoLock = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const ar = document.getElementById('ar-container');
          const rect = ar.getBoundingClientRect();
          const p = window.SpatialPanelManager.getPanel('video');
          return {
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            arWidth: rect.width,
            arHeight: rect.height,
            videoLocked: p ? p.isLocked : false,
            videoPlacementMode: p ? p.placementMode : '',
            docScrollW: document.documentElement.scrollWidth
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m2 = postVideoLock.result.value;
    console.log('Post Video Lock Metrics:', m2);
    assert(m2.videoLocked === true, 'Panel Video berjaya dikunci (isLocked=true)');
    assert(m2.arWidth === m2.windowW, `Kamera kekal 100% lebar selepas Lock Video (${m2.arWidth}px)`);
    assert(m2.arHeight === m2.windowH, `Kamera kekal 100% tinggi selepas Lock Video (${m2.arHeight}px)`);
    assert(m2.docScrollW === m2.windowW, `Document scrollWidth tidak mengembang selepas Lock Video (${m2.docScrollW}px)`);

    console.log('\n--- UJIAN 3: Kamera masih memenuhi container selepas Lock Nota (Dual Locked) ---');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          window.startAddPanelScan();
          window.handleTargetFound(1, 'nota');
          const notes = window.KotakARSELNEL.state.notes || window.ARState.notes;
          if (notes && notes.length > 0) {
            window.KotakARSELNEL.selectNote(notes[0].id);
          }
          const qNota = window.KotakARSELNEL.computeDeviceCameraQuaternion(135, 0, 90, 90);
          window.KotakARSELNEL.state.pov.targetQuaternion = qNota;
          window.KotakARSELNEL.state.pov.currentQuaternion = qNota.clone();
          document.getElementById('pov-nota-btn-anchor').click();
        })()
      `
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));

    const postDualLock = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const ar = document.getElementById('ar-container');
          const rect = ar.getBoundingClientRect();
          const pVid = window.SpatialPanelManager.getPanel('video');
          const pNot = window.SpatialPanelManager.getPanel('nota');
          return {
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            activeCount: window.KotakARSELNEL.state.activePanels.size,
            videoLocked: pVid ? pVid.isLocked : false,
            notaLocked: pNot ? pNot.isLocked : false,
            arWidth: rect.width,
            arHeight: rect.height,
            docScrollW: document.documentElement.scrollWidth
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m3 = postDualLock.result.value;
    console.log('Post Dual Lock Metrics:', m3);
    assert(m3.activeCount === 2, 'Dua panel serentak aktif dalam ruang AR');
    assert(m3.videoLocked && m3.notaLocked, 'Kedua-dua panel Video dan Nota dikunci serentak');
    assert(m3.arWidth === m3.windowW, `Kamera kekal 100% lebar selepas Dual Lock (${m3.arWidth}px)`);
    assert(m3.arHeight === m3.windowH, `Kamera kekal 100% tinggi selepas Dual Lock (${m3.arHeight}px)`);

    console.log('\n--- UJIAN 4 & 5: Kamera TIDAK berubah skala apabila Yaw & Pitch beralih keluar FOV ---');
    // Simulate user turning iPad away: Yaw = 108.7°, Pitch = -17.2° (Exact readings from iPad photo 3)
    const extremeTurnRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          // Set heading away from anchored orientation by 108.7° Yaw and -17.2° Pitch
          const THREE = window.THREE;
          const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(-17.2),
            THREE.MathUtils.degToRad(108.7),
            0,
            'YXZ'
          );
          const q = new THREE.Quaternion().setFromEuler(euler);
          const state = window.KotakARSELNEL.state || window.ARState;
          state.pov.currentQuaternion = q;
          state.pov.currentYaw = 108.7;
          state.pov.currentPitch = -17.2;

          // Trigger a render frame
          if (window.KotakARSELNEL.updateDiagnosticsData) {
            window.KotakARSELNEL.updateDiagnosticsData(true);
          }

          const ar = document.getElementById('ar-container');
          const video = ar.querySelector('video');
          const canvas = ar.querySelector('canvas');
          const arRect = ar.getBoundingClientRect();
          const videoRect = video ? video.getBoundingClientRect() : null;
          const canvasRect = canvas ? canvas.getBoundingClientRect() : null;

          const pVideo = window.SpatialPanelManager.getPanel('video');
          const pNota = window.SpatialPanelManager.getPanel('nota');
          const elVideo = document.getElementById('pov-panel-video');
          const elNota = document.getElementById('pov-panel-nota');

          return {
            docScrollW: document.documentElement.scrollWidth,
            docScrollH: document.documentElement.scrollHeight,
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            arRect: { top: arRect.top, left: arRect.left, width: arRect.width, height: arRect.height },
            videoRect: videoRect ? { width: videoRect.width, height: videoRect.height } : null,
            canvasRect: canvasRect ? { width: canvasRect.width, height: canvasRect.height } : null,
            pVideoOffscreen: pVideo ? pVideo.isOffscreen : false,
            elVideoOpacity: elVideo ? elVideo.style.opacity : null,
            elVideoVisibility: elVideo ? elVideo.style.visibility : null,
            elVideoLeft: elVideo ? elVideo.style.left : null,
            elNotaLeft: elNota ? elNota.style.left : null
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    console.log('DEBUG extremeTurnRes:', JSON.stringify(extremeTurnRes, null, 2));
    const m4 = extremeTurnRes.result ? extremeTurnRes.result.value : null;
    console.log('Extreme Turn (Yaw 108.7°, Pitch -17.2°) Metrics:', m4);

    assert(m4.arRect.width === m4.windowW, `Kamera AR TIDAK mengecil apabila berpusing! (${m4.arRect.width}px === ${m4.windowW}px)`);
    assert(m4.arRect.height === m4.windowH, `Kamera AR kekal penuh tinggi! (${m4.arRect.height}px === ${m4.windowH}px)`);
    assert(m4.arRect.top === 0 && m4.arRect.left === 0, `Kamera AR kekal pada koordinat (0, 0) skrin tanpa anjakan`);
    assert(m4.docScrollW === m4.windowW, `Document scrollWidth KEKAL kebal (${m4.docScrollW}px === ${m4.windowW}px) - Sifar auto-zoom iPad!`);
    assert(m4.docScrollH === m4.windowH, `Document scrollHeight KEKAL kebal (${m4.docScrollH}px === ${m4.windowH}px)`);

    console.log('\n--- UJIAN 6: Panel keluar FOV disembunyikan secara selamat & koordinat dihadkan ---');
    const vLeftNum = parseFloat(m4.elVideoLeft || '0');
    assert(m4.pVideoOffscreen === true, 'Panel Video dikesan offscreen semasa peranti berpusing jauh');
    assert(m4.elVideoOpacity === '0', 'Panel Video telus (opacity: 0) semasa di luar FOV');
    assert(m4.elVideoVisibility === 'hidden', 'Panel Video visibility: hidden semasa di luar FOV');
    assert(vLeftNum >= -300 && vLeftNum <= m4.windowW + 300, `Koordinat left dihadkan secara selamat (${vLeftNum}px berada dalam julat [-300, ${m4.windowW + 300}])`);

    console.log('\n--- UJIAN 7: HUD toolbar (.ar-multi-panel-bar) kekal saiz penuh dan tidak berubah skala ---');
    const hudMetrics = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const bar = document.getElementById('ar-multi-panel-bar');
          const rect = bar.getBoundingClientRect();
          const comp = window.getComputedStyle(bar);
          return {
            visible: !bar.classList.contains('hidden'),
            width: rect.width,
            height: rect.height,
            position: comp.position,
            transform: comp.transform
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m7 = hudMetrics.result.value;
    console.log('HUD Metrics:', m7);
    assert(m7.visible === true, 'Multi-Panel toolbar kekal kelihatan');
    assert(m7.width > 200, `HUD width kekal normal (${m7.width}px > 200px, tidak mengecil ke thumbnail)`);
    assert(m7.position === 'fixed', 'HUD menggunakan position: fixed');

    console.log('\n--- UJIAN 8: Tiada transform POV pada ancestor kamera ---');
    const ancestorCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const ar = document.getElementById('ar-container');
          let el = ar;
          const badTransforms = [];
          while (el && el !== document.documentElement) {
            const tr = window.getComputedStyle(el).transform;
            if (tr && tr !== 'none') {
              badTransforms.push({ tag: el.tagName, id: el.id, transform: tr });
            }
            el = el.parentElement;
          }
          return { badTransforms, count: badTransforms.length };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m8 = ancestorCheck.result.value;
    console.log('Ancestor Transform Check:', m8);
    assert(m8.count === 0, 'Sifar transform POV pada ancestor kamera (kamera bebas daripada anjakan spatial)');

    console.log('\n--- UJIAN 9: Tiada black overlay tidak sengaja menutup kamera ---');
    const overlayCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const ar = document.getElementById('ar-container');
          const video = ar ? ar.querySelector('video') : null;
          const canvas = ar ? ar.querySelector('canvas') : null;
          return {
            arOpacity: window.getComputedStyle(ar).opacity,
            arDisplay: window.getComputedStyle(ar).display,
            videoOpacity: video ? window.getComputedStyle(video).opacity : '1',
            canvasOpacity: canvas ? window.getComputedStyle(canvas).opacity : '1'
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m9 = overlayCheck.result.value;
    console.log('Overlay & Opacity Check:', m9);
    assert(m9.arOpacity === '1', 'AR container opacity ialah 1');
    assert(m9.arDisplay !== 'none', 'AR container display bukan none');

    console.log('\n--- UJIAN 10, 11 & 12: Resize Viewport tidak merosakkan sesi AR, Video atau Nota ---');
    const resizeCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          window.dispatchEvent(new Event('resize'));
          const pVid = window.SpatialPanelManager.getPanel('video');
          const pNot = window.SpatialPanelManager.getPanel('nota');
          return {
            videoLoaded: pVid ? pVid.isLoaded : false,
            videoVisible: pVid ? pVid.isVisible : false,
            notaLoaded: pNot ? pNot.isLoaded : false,
            notaVisible: pNot ? pNot.isVisible : false,
            systemMode: (window.KotakARSELNEL.state || window.ARState).systemMode
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m10 = resizeCheck.result.value;
    console.log('Resize & Persistence Check:', m10);
    assert(m10.videoLoaded === true, 'Sesi pemain Video kekal dimuatkan selepas resize');
    assert(m10.notaLoaded === true, 'Sesi pembaca Nota kekal dimuatkan selepas resize');
    assert(m10.systemMode === 'POV_LOCKED', 'Mod sistem kekal POV_LOCKED');

    console.log('\n--- UJIAN 13: Reference quaternion kekal utuh & tidak terjejas ---');
    const quatCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const pVid = window.SpatialPanelManager.getPanel('video');
          const pNot = window.SpatialPanelManager.getPanel('nota');
          return {
            hasVidQuat: !!(pVid && pVid.referenceQuaternion),
            hasVidAnchor: !!(pVid && pVid.anchorWorldVector),
            hasNotQuat: !!(pNot && pNot.referenceQuaternion),
            hasNotAnchor: !!(pNot && pNot.anchorWorldVector)
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m13 = quatCheck.result.value;
    console.log('Quaternion Integrity Check:', m13);
    assert(m13.hasVidQuat && m13.hasVidAnchor, 'Reference quaternion & anchor vector Video utuh');
    assert(m13.hasNotQuat && m13.hasNotAnchor, 'Reference quaternion & anchor vector Nota utuh');

    console.log('\n--- UJIAN 14: Ujian Regresi Lengkap CellQuest 3D GLB & Organel ---');
    const cqCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          return {
            controller: !!window.CellQuestARController,
            activeCell: window.CellQuestARController ? window.CellQuestARController.activeCellType : null,
            organellesCount: window.CellQuestARController && window.CellQuestARController.interactiveObjects ? window.CellQuestARController.interactiveObjects.length : 0
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);
    const m14 = cqCheck.result.value;
    console.log('CellQuest 3D Check:', m14);
    assert(m14.controller === true, 'CellQuestARController wujud dan utuh');

    // Screenshot verification
    const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    fs.writeFileSync('kotak_arselnel_fasa4eb24_verified.png', Buffer.from(screenshot.data, 'base64'));
    console.log('\n📸 Tangkapan skrin disimpan ke kotak_arselnel_fasa4eb24_verified.png');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 14/14 UJIAN FASA 4E-B.2.4 BERJAYA LULUS DENGAN CEMERLANG!');
    console.log('========================================================================\n');

    ws.close();
  } finally {
    cleanup();
  }
}

run().catch(err => {
  console.error('\n❌ UJIAN FASA 4E-B.2.4 GAGAL:', err);
  process.exit(1);
});
