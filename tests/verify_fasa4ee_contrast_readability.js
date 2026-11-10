/**
 * tests/verify_fasa4ee_contrast_readability.js
 * Automated WCAG Contrast Ratio & Accessibility Verification Suite
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9398;

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function calculateContrast(textColorStr, bgColorStr) {
  const tc = parseRgb(textColorStr);
  const bc = parseRgb(bgColorStr);
  const L1 = getLuminance(tc.r, tc.g, tc.b);
  const L2 = getLuminance(bc.r, bc.g, bc.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function verifyContrast() {
  console.log('========================================================================');
  console.log('🧪 KOTAK ARSELNEL — WCAG TEXT CONTRAST & READABILITY AUDIT');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_wcag_${Date.now()}`);

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
      console.log(`✅ PASS: ${testName} (${details})`);
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

    // Activate all 4 modules and lock POV
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          window.handleTargetFound(0, 'video');
          if (window.ARState.videos && window.ARState.videos.length > 0) window.selectVideo(window.ARState.videos[0]);
          if (window.KotakARSELNEL && typeof window.KotakARSELNEL.startPOVMode === 'function') await window.KotakARSELNEL.startPOVMode();
          document.getElementById('pov-btn-anchor')?.click();

          window.handleTargetFound(1, 'nota');
          document.getElementById('pov-nota-btn-anchor')?.click();

          window.handleTargetFound(2, 'kuiz');
          document.getElementById('pov-kuiz-btn-anchor')?.click();

          window.handleTargetFound(3, 'cellquest');
          document.getElementById('cq-organelle-card')?.classList.remove('hidden');
        })()
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1200));

    // Evaluate colors of text vs backgrounds
    const auditData = await send('Runtime.evaluate', {
      expression: `
        (() => {
          function getColorAndBg(elSelector, bgSelector) {
            const el = document.querySelector(elSelector);
            const bgEl = bgSelector ? document.querySelector(bgSelector) : el?.parentElement;
            if (!el) return null;
            const cs = window.getComputedStyle(el);
            let bgCs = bgEl ? window.getComputedStyle(bgEl) : cs;
            let bgColor = bgCs.backgroundColor;
            // Traverse up if transparent
            let curr = bgEl;
            while (curr && (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)')) {
              curr = curr.parentElement;
              if (curr) bgColor = window.getComputedStyle(curr).backgroundColor;
            }
            return {
              color: cs.color,
              bgColor: bgColor || 'rgb(255, 255, 255)',
              fontSize: parseFloat(cs.fontSize),
              fontWeight: cs.fontWeight
            };
          }

          return {
            kuizTitle: getColorAndBg('#pov-kuiz-selection-view .kuiz-title-box h3', '#pov-kuiz-selection-view .kuiz-title-box'),
            kuizDesc: getColorAndBg('#pov-kuiz-selection-view .kuiz-title-box p', '#pov-kuiz-selection-view .kuiz-title-box'),
            kuizGameTitle: getColorAndBg('#pov-panel-kuiz .minimal-game-title', '#pov-panel-kuiz .minimal-game-row'),
            kuizNumBadge: getColorAndBg('#pov-panel-kuiz .minimal-num-badge', '#pov-panel-kuiz .minimal-num-badge'),
            kuizYawVal: getColorAndBg('#pov-kuiz-telemetry-hud-strip #pov-kuiz-val-yaw', '#pov-kuiz-telemetry-hud-strip'),
            kuizYawLabel: getColorAndBg('#pov-kuiz-telemetry-hud-strip .hud-chip-label', '#pov-kuiz-telemetry-hud-strip'),
            
            notaTitle: getColorAndBg('#pov-panel-nota .nota-title') || getColorAndBg('#pov-panel-nota .selection-title-box h3'),
            notaDesc: getColorAndBg('#pov-panel-nota .nota-body-rendered') || getColorAndBg('#pov-panel-nota .selection-title-box p'),
            notaCardTitle: getColorAndBg('.nota-card-title') || getColorAndBg('#pov-panel-nota .nota-title'),
            notaCardDesc: getColorAndBg('.nota-card-desc') || getColorAndBg('#pov-panel-nota .nota-body-rendered'),
            notaChapter: getColorAndBg('.nota-chapter-badge') || getColorAndBg('.nota-card-chapter'),
            notaYawVal: getColorAndBg('#pov-nota-telemetry-hud-strip #pov-nota-val-yaw', '#pov-nota-telemetry-hud-strip'),

            videoTitle: getColorAndBg('#pov-panel-video .active-video-details h3', '#pov-panel-video .active-video-details'),
            videoDesc: getColorAndBg('#pov-panel-video .active-video-details p', '#pov-panel-video .active-video-details'),
            videoYawVal: getColorAndBg('#pov-val-yaw', '#pov-panel-video .pov-telemetry-hud-strip'),

            cqStatusText: getColorAndBg('#cq-status-text', '.cq-hud-tracking-status'),
            cqActionLabel: getColorAndBg('.cq-action-btn:not(.is-active) .cq-action-label', '.cq-action-btn:not(.is-active)'),
            cqCardName: getColorAndBg('.cq-card-name', '#cq-organelle-card'),
            cqCardCategory: getColorAndBg('.cq-card-category', '#cq-organelle-card'),
            cqSectionLabel: getColorAndBg('.cq-section-label', '#cq-organelle-card'),
            cqSectionText: getColorAndBg('.cq-section-text', '#cq-organelle-card'),

            multiPillNota: getColorAndBg('.multi-pill.pill-nota') || getColorAndBg('.multi-pill'),
            multiPillVideo: getColorAndBg('.multi-pill.pill-video') || getColorAndBg('.multi-pill'),
            multiPillKuiz: getColorAndBg('.multi-pill.pill-kuiz') || getColorAndBg('.multi-pill'),
            multiPillCq: getColorAndBg('.multi-pill.pill-cellquest') || getColorAndBg('.multi-pill')
          };
        })()
      `,
      returnByValue: true
    });

    const res = auditData.result.value;

    console.log('--- 1. AUDIT KONTRAS MODUL KUIZ ---');
    const cKuizTitle = calculateContrast(res.kuizTitle.color, res.kuizTitle.bgColor);
    assert(cKuizTitle >= 7.0, 'Tajuk Kuiz & Permainan ARSELNEL (POV)', `Contrast: ${cKuizTitle.toFixed(2)}:1 (WCAG AAA)`);

    const cKuizDesc = calculateContrast(res.kuizDesc.color, res.kuizDesc.bgColor);
    assert(cKuizDesc >= 4.5, 'Penerangan di bawah tajuk Kuiz', `Contrast: ${cKuizDesc.toFixed(2)}:1 (WCAG AA/AAA)`);

    const cKuizGameTitle = calculateContrast(res.kuizGameTitle.color, res.kuizGameTitle.bgColor);
    assert(cKuizGameTitle >= 7.0, 'Tajuk Permainan Kuiz', `Contrast: ${cKuizGameTitle.toFixed(2)}:1 (WCAG AAA)`);

    const cKuizNum = calculateContrast(res.kuizNumBadge.color, res.kuizNumBadge.bgColor);
    assert(cKuizNum >= 4.5, 'Badge Nombor Permainan Kuiz', `Contrast: ${cKuizNum.toFixed(2)}:1 (WCAG AA/AAA)`);

    const cKuizYaw = calculateContrast(res.kuizYawVal.color, res.kuizYawVal.bgColor);
    assert(cKuizYaw >= 7.0, 'Kuiz Nilai Yaw/Pitch (Angka Telemetri)', `Contrast: ${cKuizYaw.toFixed(2)}:1 (WCAG AAA)`);

    console.log('\n--- 2. AUDIT KONTRAS MODUL NOTA ---');
    const cNotaTitle = calculateContrast(res.notaTitle.color, res.notaTitle.bgColor);
    assert(cNotaTitle >= 7.0, 'Tajuk Header Senarai Nota', `Contrast: ${cNotaTitle.toFixed(2)}:1 (WCAG AAA)`);

    const cNotaDesc = calculateContrast(res.notaDesc.color, res.notaDesc.bgColor);
    assert(cNotaDesc >= 4.5, 'Penerangan Senarai Nota', `Contrast: ${cNotaDesc.toFixed(2)}:1 (WCAG AA)`);

    const cNotaCardTitle = calculateContrast(res.notaCardTitle.color, res.notaCardTitle.bgColor);
    assert(cNotaCardTitle >= 7.0, 'Tajuk Kad Nota Individu', `Contrast: ${cNotaCardTitle.toFixed(2)}:1 (WCAG AAA)`);

    const cNotaCardDesc = calculateContrast(res.notaCardDesc.color, res.notaCardDesc.bgColor);
    assert(cNotaCardDesc >= 4.5, 'Penerangan Kad Nota Individu', `Contrast: ${cNotaCardDesc.toFixed(2)}:1 (WCAG AA)`);

    const cNotaCardChap = calculateContrast(res.notaChapter.color, res.notaChapter.bgColor);
    assert(cNotaCardChap >= 4.5, 'Tag Bab/Badge Nota', `Contrast: ${cNotaCardChap.toFixed(2)}:1 (WCAG AA/AAA)`);

    const cNotaYaw = calculateContrast(res.notaYawVal.color, res.notaYawVal.bgColor);
    assert(cNotaYaw >= 7.0, 'Nota Nilai Yaw/Pitch', `Contrast: ${cNotaYaw.toFixed(2)}:1 (WCAG AAA)`);

    console.log('\n--- 3. AUDIT KONTRAS MODUL VIDEO ---');
    const cVidTitle = calculateContrast(res.videoTitle.color, res.videoTitle.bgColor);
    assert(cVidTitle >= 7.0, 'Tajuk Video Pembelajaran', `Contrast: ${cVidTitle.toFixed(2)}:1 (WCAG AAA)`);

    const cVidDesc = calculateContrast(res.videoDesc.color, res.videoDesc.bgColor);
    assert(cVidDesc >= 4.5, 'Penerangan Video Pembelajaran', `Contrast: ${cVidDesc.toFixed(2)}:1 (WCAG AA)`);

    const cVidYaw = calculateContrast(res.videoYawVal.color, res.videoYawVal.bgColor);
    assert(cVidYaw >= 7.0, 'Video Nilai Yaw/Pitch', `Contrast: ${cVidYaw.toFixed(2)}:1 (WCAG AAA)`);

    console.log('\n--- 4. AUDIT KONTRAS MODUL CELLQUEST 3D ---');
    const cCqStatus = calculateContrast(res.cqStatusText.color, res.cqStatusText.bgColor);
    assert(cCqStatus >= 4.5, 'CellQuest Status Tracking Text', `Contrast: ${cCqStatus.toFixed(2)}:1 (WCAG AA)`);

    const cCqAction = calculateContrast(res.cqActionLabel.color, res.cqActionLabel.bgColor);
    assert(cCqAction >= 4.5, 'CellQuest Action Label (Inaktif)', `Contrast: ${cCqAction.toFixed(2)}:1 (WCAG AA)`);

    const cCqCardName = calculateContrast(res.cqCardName.color, res.cqCardName.bgColor);
    assert(cCqCardName >= 7.0, 'CellQuest Nama Organel Card', `Contrast: ${cCqCardName.toFixed(2)}:1 (WCAG AAA)`);

    const cCqCategory = calculateContrast(res.cqCardCategory.color, res.cqCardCategory.bgColor);
    assert(cCqCategory >= 4.5, 'CellQuest Kategori Organel', `Contrast: ${cCqCategory.toFixed(2)}:1 (WCAG AA)`);

    const cCqSectionLabel = calculateContrast(res.cqSectionLabel.color, res.cqSectionLabel.bgColor);
    assert(cCqSectionLabel >= 4.5, 'CellQuest Label Seksyen', `Contrast: ${cCqSectionLabel.toFixed(2)}:1 (WCAG AA)`);

    const cCqSectionText = calculateContrast(res.cqSectionText.color, res.cqSectionText.bgColor);
    assert(cCqSectionText >= 4.5, 'CellQuest Teks Penerangan Organel', `Contrast: ${cCqSectionText.toFixed(2)}:1 (WCAG AA)`);

    console.log('\n--- 5. AUDIT KONTRAS TOOLBAR MULTI-PANEL PILLS ---');
    const cPillNota = calculateContrast(res.multiPillNota.color, res.multiPillNota.bgColor);
    assert(cPillNota >= 4.5, 'Toolbar Pil Nota', `Contrast: ${cPillNota.toFixed(2)}:1 (WCAG AA)`);

    const cPillVideo = calculateContrast(res.multiPillVideo.color, res.multiPillVideo.bgColor);
    assert(cPillVideo >= 4.5, 'Toolbar Pil Video', `Contrast: ${cPillVideo.toFixed(2)}:1 (WCAG AA)`);

    const cPillKuiz = calculateContrast(res.multiPillKuiz.color, res.multiPillKuiz.bgColor);
    assert(cPillKuiz >= 4.5, 'Toolbar Pil Kuiz', `Contrast: ${cPillKuiz.toFixed(2)}:1 (WCAG AA)`);

    const cPillCq = calculateContrast(res.multiPillCq.color, res.multiPillCq.bgColor);
    assert(cPillCq >= 4.5, 'Toolbar Pil CellQuest', `Contrast: ${cPillCq.toFixed(2)}:1 (WCAG AA)`);

    console.log('========================================================================');
    console.log(`📊 KEPUTUSAN AKHIR: ${passCount} LULUS, ${failCount} GAGAL`);
    console.log('========================================================================\n');

    ws.close();
    if (failCount > 0) process.exit(1);
    else process.exit(0);
  } catch(err) {
    console.error('Audit error:', err);
    process.exit(1);
  } finally {
    try { edgeProcess.kill(); } catch(e) {}
  }
}

verifyContrast();
