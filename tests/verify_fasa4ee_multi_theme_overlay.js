/**
 * tests/verify_fasa4ee_multi_theme_overlay.js
 * Comprehensive automated verification for FASA UI MULTI-THEME OVERLAY
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9394;

function rgbToHex(rgbStr) {
  if (!rgbStr) return '';
  if (rgbStr.startsWith('#')) return rgbStr.toLowerCase();
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgbStr;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toLowerCase();
}

async function verifyMultiTheme() {
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — FASA 4E-E: VERIFIKASI MULTI-THEME OVERLAY');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_test_theme_${Date.now()}`);

  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/kotak_arselnel/code.html'
  ], { detached: false });

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName} -> ${details}`);
      failCount++;
    }
  }

  try {
    await new Promise(r => setTimeout(r, 3500));
    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('kotak_arselnel'));
    if (!pageTarget) throw new Error('Target page not found');

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = ++id;
        const handler = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.id === curId) {
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          } catch(err) {}
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Step 1: Activate all 4 modules and lock POV
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          // Video
          window.handleTargetFound(0, 'video');
          if (window.ARState.videos && window.ARState.videos.length > 0) window.selectVideo(window.ARState.videos[0]);
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') await window.KotakARSELNEL.startPOVMode();
          document.getElementById('pov-btn-anchor')?.click();

          // Nota
          window.handleTargetFound(1, 'nota');
          if (window.ARState.notes && window.ARState.notes.length > 0) window.selectNote(window.ARState.notes[0]);
          document.getElementById('pov-nota-btn-anchor')?.click();

          // Kuiz
          window.handleTargetFound(2, 'kuiz');
          document.getElementById('pov-kuiz-btn-anchor')?.click();

          // CellQuest
          window.handleTargetFound(3, 'cellquest');
        })()
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1200));

    // Evaluate styles of each module
    const styles = await send('Runtime.evaluate', {
      expression: `
        (() => {
          function getStyles(selector) {
            const el = document.querySelector(selector);
            if (!el) return null;
            const cs = window.getComputedStyle(el);
            return {
              bg: cs.backgroundColor,
              border: cs.borderColor,
              borderTopColor: cs.borderTopColor,
              color: cs.color
            };
          }

          return {
            video: {
              card: getStyles('#pov-card-container'),
              headerTag: getStyles('#pov-panel-video .category-tag'),
              statusPill: getStyles('#pov-sensor-pill'),
              activeSize: getStyles('#pov-size-m'),
              innerCard: getStyles('#pov-panel-video .active-video-details'),
              btnPlace: getStyles('#pov-btn-anchor'),
              btnChange: getStyles('#pov-btn-change-video'),
              btnPin: getStyles('#pov-btn-back-pinned'),
              btnClose: getStyles('#pov-btn-close'),
              btnCam: getStyles('#pov-btn-toggle-cam')
            },
            nota: {
              card: getStyles('#pov-nota-card-container'),
              headerTag: getStyles('#pov-panel-nota .category-tag'),
              statusPill: getStyles('#pov-nota-sensor-pill'),
              activeSize: getStyles('#pov-nota-size-m'),
              innerCard: getStyles('#pov-panel-nota .nota-content-wrapper'),
              btnPlace: getStyles('#pov-nota-btn-anchor'),
              btnChange: getStyles('#pov-nota-btn-change-content'),
              btnPin: getStyles('#pov-nota-btn-back-pinned'),
              btnClose: getStyles('#pov-nota-btn-close'),
              btnCam: getStyles('#pov-nota-btn-toggle-cam')
            },
            kuiz: {
              card: getStyles('#pov-kuiz-card-container'),
              headerTag: getStyles('#pov-panel-kuiz .category-tag'),
              statusPill: getStyles('#pov-kuiz-sensor-pill'),
              activeSize: getStyles('#pov-kuiz-size-m'),
              innerCard: getStyles('#pov-panel-kuiz .minimal-game-row') || getStyles('#pov-panel-kuiz .selection-title-box'),
              btnPlace: getStyles('#pov-kuiz-btn-anchor'),
              btnChange: getStyles('#pov-kuiz-btn-change-content'),
              btnPin: getStyles('#pov-kuiz-btn-back-pinned'),
              btnClose: getStyles('#pov-kuiz-btn-close'),
              btnCam: getStyles('#pov-kuiz-btn-toggle-cam')
            },
            cellquest: {
              bottomControls: getStyles('#cq-bottom-controls') || getStyles('.cq-bottom-controls'),
              cellSwitcher: getStyles('.cq-cell-switcher'),
              activePill: getStyles('.cq-pill-btn.active'),
              actionBtn: getStyles('.cq-action-btn:not(.is-active)'),
              activeActionBtn: getStyles('.cq-action-btn.is-active'),
              hudBadge: getStyles('.cq-hud-badge')
            }
          };
        })()
      `,
      returnByValue: true
    });

    const res = styles.result.value;

    console.log('--- 1. UJIAN TEMA VIDEO (JINGGA) ---');
    assert(rgbToHex(res.video.card.borderTopColor) === '#f97316', 'Video border ialah #F97316', res.video.card.borderTopColor);
    assert(rgbToHex(res.video.card.bg) === '#fff0e3', 'Video panel bg ialah #FFF0E3', res.video.card.bg);
    assert(rgbToHex(res.video.headerTag.bg) === '#ea580c', 'Video header tag ialah #EA580C', res.video.headerTag.bg);
    assert(rgbToHex(res.video.statusPill.bg) === '#ffedd5', 'Video status pill bg ialah #FFEDD5', res.video.statusPill.bg);
    assert(rgbToHex(res.video.statusPill.borderTopColor) === '#fed7aa', 'Video status pill border ialah #FED7AA', res.video.statusPill.borderTopColor);
    assert(rgbToHex(res.video.statusPill.color) === '#9a3412' || rgbToHex(res.video.statusPill.color) === '#c2410c', 'Video status pill text ialah #9A3412 (High Contrast)', res.video.statusPill.color);
    assert(rgbToHex(res.video.activeSize.bg) === '#ea580c', 'Video active size M ialah #EA580C', res.video.activeSize.bg);
    assert(rgbToHex(res.video.innerCard.bg) === '#fff7ed', 'Video inner card bg ialah #FFF7ED', res.video.innerCard.bg);
    assert(rgbToHex(res.video.innerCard.borderTopColor) === '#fed7aa', 'Video inner card border ialah #FED7AA', res.video.innerCard.borderTopColor);

    console.log('\n--- 2. UJIAN TEMA NOTA (HIJAU) ---');
    assert(rgbToHex(res.nota.card.borderTopColor) === '#22c55e', 'Nota border ialah #22C55E', res.nota.card.borderTopColor);
    assert(rgbToHex(res.nota.card.bg) === '#e8fbef', 'Nota panel bg ialah #E8FBEF', res.nota.card.bg);
    assert(rgbToHex(res.nota.headerTag.bg) === '#16a34a', 'Nota header tag ialah #16A34A', res.nota.headerTag.bg);
    assert(rgbToHex(res.nota.statusPill.bg) === '#dcfce7', 'Nota status pill bg ialah #DCFCE7', res.nota.statusPill.bg);
    assert(rgbToHex(res.nota.statusPill.borderTopColor) === '#86efac', 'Nota status pill border ialah #86EFAC', res.nota.statusPill.borderTopColor);
    assert(rgbToHex(res.nota.statusPill.color) === '#166534' || rgbToHex(res.nota.statusPill.color) === '#15803d', 'Nota status pill text ialah #166534 (High Contrast)', res.nota.statusPill.color);
    assert(rgbToHex(res.nota.activeSize.bg) === '#16a34a', 'Nota active size M ialah #16A34A', res.nota.activeSize.bg);
    assert(rgbToHex(res.nota.innerCard.bg) === '#f0fdf4', 'Nota inner card bg ialah #F0FDF4', res.nota.innerCard.bg);
    assert(rgbToHex(res.nota.innerCard.borderTopColor) === '#bbf7d0', 'Nota inner card border ialah #BBF7D0', res.nota.innerCard.borderTopColor);

    console.log('\n--- 3. UJIAN TEMA KUIZ (UNGU) ---');
    assert(rgbToHex(res.kuiz.card.borderTopColor) === '#a855f7', 'Kuiz border ialah #A855F7', res.kuiz.card.borderTopColor);
    assert(rgbToHex(res.kuiz.card.bg) === '#f3e8ff', 'Kuiz panel bg ialah #F3E8FF', res.kuiz.card.bg);
    assert(rgbToHex(res.kuiz.headerTag.bg) === '#9333ea', 'Kuiz header tag ialah #9333EA', res.kuiz.headerTag.bg);
    assert(rgbToHex(res.kuiz.statusPill.bg) === '#f3e8ff', 'Kuiz status pill bg ialah #F3E8FF', res.kuiz.statusPill.bg);
    assert(rgbToHex(res.kuiz.statusPill.borderTopColor) === '#d8b4fe', 'Kuiz status pill border ialah #D8B4FE', res.kuiz.statusPill.borderTopColor);
    assert(rgbToHex(res.kuiz.statusPill.color) === '#6b21a8' || rgbToHex(res.kuiz.statusPill.color) === '#7e22ce', 'Kuiz status pill text ialah #6B21A8 (High Contrast)', res.kuiz.statusPill.color);
    assert(rgbToHex(res.kuiz.activeSize.bg) === '#9333ea', 'Kuiz active size M ialah #9333EA', res.kuiz.activeSize.bg);
    assert(rgbToHex(res.kuiz.innerCard.bg) === '#faf5ff', 'Kuiz inner card bg ialah #FAF5FF', res.kuiz.innerCard.bg);
    assert(rgbToHex(res.kuiz.innerCard.borderTopColor) === '#e9d5ff', 'Kuiz inner card border ialah #E9D5FF', res.kuiz.innerCard.borderTopColor);

    console.log('\n--- 4. UJIAN TEMA CELLQUEST 3D (SIAN) ---');
    assert(rgbToHex(res.cellquest.bottomControls.borderTopColor) === '#06b6d4', 'CellQuest controller border ialah #06B6D4', res.cellquest.bottomControls.borderTopColor);
    assert(rgbToHex(res.cellquest.hudBadge.bg) === '#0891b2', 'CellQuest HUD badge header ialah #0891B2', res.cellquest.hudBadge.bg);
    assert(rgbToHex(res.cellquest.cellSwitcher.bg) === '#cffafe', 'CellQuest switcher bg ialah #CFFAFE', res.cellquest.cellSwitcher.bg);
    assert(rgbToHex(res.cellquest.cellSwitcher.borderTopColor) === '#a5f3fc', 'CellQuest switcher border ialah #A5F3FC', res.cellquest.cellSwitcher.borderTopColor);
    assert(rgbToHex(res.cellquest.activePill.bg) === '#0891b2', 'CellQuest active pill ialah #0891B2', res.cellquest.activePill.bg);
    assert(rgbToHex(res.cellquest.actionBtn.bg) === '#ecfeff', 'CellQuest inactive action button bg ialah #ECFEFF', res.cellquest.actionBtn.bg);
    assert(rgbToHex(res.cellquest.actionBtn.borderTopColor) === '#a5f3fc', 'CellQuest inactive action button border ialah #A5F3FC', res.cellquest.actionBtn.borderTopColor);
    assert(rgbToHex(res.cellquest.activeActionBtn.bg) === '#06b6d4', 'CellQuest active action button bg ialah #06B6D4', res.cellquest.activeActionBtn.bg);

    console.log('\n--- 5. UJIAN BUTANG TINDAKAN KONSISTEN (UNIVERSAL ACTION COLORS) ---');
    // Alih / Letak Semula: Biru #2563EB
    assert(rgbToHex(res.video.btnPlace.bg) === '#2563eb', 'Video Alih btn ialah Biru #2563EB', res.video.btnPlace.bg);
    assert(rgbToHex(res.nota.btnPlace.bg) === '#2563eb', 'Nota Alih btn ialah Biru #2563EB', res.nota.btnPlace.bg);
    assert(rgbToHex(res.kuiz.btnPlace.bg) === '#2563eb', 'Kuiz Alih btn ialah Biru #2563EB', res.kuiz.btnPlace.bg);

    // Tukar Kandungan: Ungu #7C3AED
    assert(rgbToHex(res.video.btnChange.bg) === '#7c3aed', 'Video Tukar btn ialah Ungu #7C3AED', res.video.btnChange.bg);
    assert(rgbToHex(res.nota.btnChange.bg) === '#7c3aed', 'Nota Tukar btn ialah Ungu #7C3AED', res.nota.btnChange.bg);
    assert(rgbToHex(res.kuiz.btnChange.bg) === '#7c3aed', 'Kuiz Tukar btn ialah Ungu #7C3AED', res.kuiz.btnChange.bg);

    // Semat Skrin: Kuning #FACC15
    assert(rgbToHex(res.video.btnPin.bg) === '#facc15', 'Video Semat btn ialah Kuning #FACC15', res.video.btnPin.bg);
    assert(rgbToHex(res.nota.btnPin.bg) === '#facc15', 'Nota Semat btn ialah Kuning #FACC15', res.nota.btnPin.bg);
    assert(rgbToHex(res.kuiz.btnPin.bg) === '#facc15', 'Kuiz Semat btn ialah Kuning #FACC15', res.kuiz.btnPin.bg);

    // Tutup: Merah #EF4444
    assert(rgbToHex(res.video.btnClose.bg) === '#ef4444', 'Video Tutup btn ialah Merah #EF4444', res.video.btnClose.bg);
    assert(rgbToHex(res.nota.btnClose.bg) === '#ef4444', 'Nota Tutup btn ialah Merah #EF4444', res.nota.btnClose.bg);
    assert(rgbToHex(res.kuiz.btnClose.bg) === '#ef4444', 'Kuiz Tutup btn ialah Merah #EF4444', res.kuiz.btnClose.bg);

    // Tutup Kamera: Biru Cair #DBEAFE
    assert(rgbToHex(res.video.btnCam.bg) === '#dbeafe', 'Video Tutup Kamera btn ialah Biru Cair #DBEAFE', res.video.btnCam.bg);
    assert(rgbToHex(res.nota.btnCam.bg) === '#dbeafe', 'Nota Tutup Kamera btn ialah Biru Cair #DBEAFE', res.nota.btnCam.bg);
    assert(rgbToHex(res.kuiz.btnCam.bg) === '#dbeafe', 'Kuiz Tutup Kamera btn ialah Biru Cair #DBEAFE', res.kuiz.btnCam.bg);

    console.log('========================================================================');
    console.log(`📊 KEPUTUSAN AKHIR: ${passCount} LULUS, ${failCount} GAGAL`);
    console.log('========================================================================\n');

    ws.close();
    if (failCount > 0) process.exit(1);
    else process.exit(0);
  } catch(err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    try { edgeProcess.kill(); } catch(e) {}
  }
}

verifyMultiTheme();
