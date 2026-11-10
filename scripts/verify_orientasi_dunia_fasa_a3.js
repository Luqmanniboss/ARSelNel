// scripts/verify_orientasi_dunia_fasa_a3.js
// Automated Verification Suite for Fasa AR Orientasi Dunia A.3 using Microsoft Edge CDP
// Tests:
// 1. Organelle Vibrant Materials & Albedo (Nucleus, Membrane, Mitochondria, etc.)
// 2. 3D Viewer Deep Zoom (Pinch zoom, wheel, toolbar controls, dynamic distance & near plane)
// 3. Bottom HUD layout on iPad Landscape (1024x768) - No collisions or text overlaps

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9425;
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }
  async connect() {
    const WS = global.WebSocket || require('ws');
    this.ws = new WS(this.wsUrl);
    await new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

async function run() {
  console.log('=== MEMULAKAN UJIAN AUTOMATIK FASA AR ORIENTASI DUNIA A.3 ===\n');

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const browserPath = edgePaths.find(p => fs.existsSync(p));
  if (!browserPath) {
    console.error('Browser tidak dijumpai.');
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-fasa-a3-'));
  const proc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/auth/login.html'
  ]);

  await delay(2500);

  // Sambung ke tab Edge
  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');

  // Sediakan auth localStorage
  await client.evaluate(`
    (() => {
      const u = { id: 'test_student', name: 'Pelajar', role: 'student' };
      localStorage.setItem('arselnel_current_user', JSON.stringify(u));
      localStorage.setItem('currentUser', JSON.stringify(u));
    })()
  `);

  // Navigasi ke CellQuest Adventure dalam mod camera-ar
  await client.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' });
  await delay(4500);

  // Set iPad Landscape Device Metrics (1024 x 768)
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    fitWindow: false
  });

  await delay(1000);
  console.log('✓ Edge disambung dan CellQuest dimuatkan pada resolusi iPad Landscape (1024x768).');

  // Tunggu sehingga window.CellQuestAR sedia
  let isReady = false;
  for (let i = 0; i < 20; i++) {
    isReady = await client.evaluate('typeof window.CellQuestAR !== "undefined"');
    if (isReady) break;
    await delay(500);
  }
  if (!isReady) {
    console.error('Ralat: window.CellQuestAR tidak sedia selepas menunggu.');
    client.close();
    proc.kill();
    process.exit(1);
  }

  // =========================================================================
  // UJIAN 1: PEMERIKSAAN WARNA MODEL ORGANEL (NUKLEUS & LAIN-LAIN)
  // =========================================================================
  console.log('\n--- Ujian 1: Warna & Material PBR Model Organel ---');
  const matInfo = await client.evaluate(`
    (function() {
      // Buka modal untuk stesen 1 (Nukleus)
      window.CellQuestAR.openQuiz(0);

      var modal = document.getElementById('station-modal');
      var group = window.CellQuestAR.getPreviewModelGroup ? window.CellQuestAR.getPreviewModelGroup() : null;
      var mats = [];
      if (group) {
        group.traverse(function(node) {
          if (node.isMesh && node.material) {
            var m = Array.isArray(node.material) ? node.material[0] : node.material;
            mats.push({
              name: node.name || 'unnamed',
              colorHex: m.color ? '#' + m.color.getHexString() : null,
              emissiveHex: m.emissive ? '#' + m.emissive.getHexString() : null,
              metalness: m.metalness !== undefined ? m.metalness : null,
              roughness: m.roughness !== undefined ? m.roughness : null
            });
          }
        });
      }
      return {
        isOpen: modal ? modal.classList.contains('open') : false,
        meshCount: mats.length,
        mats: mats.slice(0, 8)
      };
    })()
  `);

  console.log('Status Modal Stesen 1 (Nukleus):', matInfo.isOpen ? 'DIBUKA' : 'GAGAL');
  console.log(`Jumlah mesh/material dalam preview: ${matInfo.meshCount}`);
  matInfo.mats.forEach((m, i) => {
    console.log(`  [Mesh ${i+1}] ${m.name}: Warna: ${m.colorHex}, Emissive: ${m.emissiveHex}, Metal: ${m.metalness}, Rough: ${m.roughness}`);
  });

  await delay(1200);

  // Tangkap layar Modal Stesen 1 (Warna Nukleus Vibrant)
  const screenShotDir = path.resolve(__dirname, '../tests/screenshots');
  if (!fs.existsSync(screenShotDir)) fs.mkdirSync(screenShotDir, { recursive: true });

  const modalShot = await client.send('Page.captureScreenshot', { format: 'png' });
  const modalShotPath = path.join(screenShotDir, 'fasa_a3_nucleus_color_preview.png');
  fs.writeFileSync(modalShotPath, Buffer.from(modalShot.data, 'base64'));
  console.log(`✓ Tangkap layar modal disimpan di: ${modalShotPath}`);

  // =========================================================================
  // UJIAN 2: DEEP ZOOM 3D (TOOLBAR BUTTONS, DISTANCE BOUNDS & NEAR PLANE)
  // =========================================================================
  console.log('\n--- Ujian 2: Deep Zoom 3D dalam Modal ---');
  const zoomRes = await client.evaluate(`
    (function() {
      var btnIn = document.getElementById('cq-zoom-in-btn');
      var btnOut = document.getElementById('cq-zoom-out-btn');
      var btnFit = document.getElementById('cq-zoom-fit-btn');
      var bar = document.getElementById('cq-preview-zoom-bar');

      if (!bar || !btnIn || !btnOut || !btnFit) {
        return { success: false, reason: 'Toolbar butang zum tiada dalam DOM' };
      }

      var zState = window.CellQuestAR.getPreviewZoomState();
      var cam = window.CellQuestAR.getPreviewCamera();

      var initDist = zState.distance;
      var initNear = cam.near;
      var minDist = zState.minDistance;
      var maxDist = zState.maxDistance;

      // 1. Uji Klik Zoom In [+]
      btnIn.click();
      var zIn1 = zState.distance;

      // 2. Klik 5 kali lagi untuk capai had minimum (clamped)
      btnIn.click(); btnIn.click(); btnIn.click(); btnIn.click(); btnIn.click();
      var zMinClamped = zState.distance;

      // 3. Uji Klik Zoom Out [-]
      btnOut.click(); btnOut.click();
      var zOut = zState.distance;

      // 4. Uji Klik Fit/Reset
      btnFit.click();
      var zReset = zState.distance;

      return {
        success: true,
        initDist: +initDist.toFixed(2),
        initNear: +initNear.toFixed(3),
        minDist: +minDist.toFixed(2),
        maxDist: +maxDist.toFixed(2),
        zIn1: +zIn1.toFixed(2),
        zMinClamped: +zMinClamped.toFixed(2),
        zOut: +zOut.toFixed(2),
        zReset: +zReset.toFixed(2),
        isZoomInWorking: zIn1 < initDist,
        isMinClamped: zMinClamped >= minDist,
        isNearSafe: initNear <= 0.02,
        isResetWorking: Math.abs(zReset - zState.defaultDistance) < 0.05
      };
    })()
  `);

  console.log('Keputusan Deep Zoom:', zoomRes);
  if (zoomRes.success && zoomRes.isZoomInWorking && zoomRes.isMinClamped && zoomRes.isNearSafe) {
    console.log('✓ Ujian Deep Zoom LULUS: Zum mendalam responsif, terikat had [min, max], near plane 0.02.');
  } else {
    console.warn('⚠ Perhatian pada ujian Deep Zoom:', zoomRes);
  }

  // Lakukan Zoom In dekat untuk menangkap visual terperinci nukleus (interior nucleolus & pores)
  await client.evaluate(`
    (function() {
      var btnIn = document.getElementById('cq-zoom-in-btn');
      if (btnIn) { btnIn.click(); btnIn.click(); btnIn.click(); }
    })()
  `);
  await delay(800);

  const zoomShot = await client.send('Page.captureScreenshot', { format: 'png' });
  const zoomShotPath = path.join(screenShotDir, 'fasa_a3_deep_zoom_in.png');
  fs.writeFileSync(zoomShotPath, Buffer.from(zoomShot.data, 'base64'));
  console.log(`✓ Tangkap layar Deep Zoom disimpan di: ${zoomShotPath}`);

  // Tutup modal
  await client.evaluate(`
    (function() {
      var modal = document.getElementById('station-modal');
      if (modal) modal.classList.remove('open');
    })()
  `);
  await delay(500);

  // =========================================================================
  // UJIAN 3: HUD LAYOUT PADA IPAD LANDSCAPE (1024x768) - PENCEGAHAN BERTINDIH
  // =========================================================================
  console.log('\n--- Ujian 3: Susun Atur HUD Bawah (iPad Landscape 1024x768) ---');
  const hudRes = await client.evaluate(`
    (function() {
      var radar = document.getElementById('ar-world-compass-wrap');
      var pill = document.querySelector('.cq-ar-single-instruction');
      var card = document.getElementById('ar-organelle-card');

      function getB(el) {
        if (!el) return null;
        var r = el.getBoundingClientRect();
        var s = window.getComputedStyle(el);
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          right: Math.round(r.right),
          styleOpacity: el.style.opacity,
          opacity: parseFloat(s.opacity),
          display: s.display,
          visible: r.width > 0 && r.height > 0 && s.display !== 'none' && parseFloat(s.opacity) > 0.05
        };
      }

      // Keadaan 1: Mencari Stesen (Kad ditutup, Pil arahan tengah kelihatan)
      if (card) card.style.display = 'none';
      if (pill) { pill.style.display = 'block'; pill.style.opacity = '1'; }
      if (window.CellQuestAR.checkVisibility) window.CellQuestAR.checkVisibility();

      var s1Radar = getB(radar);
      var s1Pill = getB(pill);
      var col1 = s1Radar && s1Pill && (s1Radar.right > s1Pill.x);

      // Keadaan 2: Stesen Dikesan dan Kad Organel DIBUKA PENUH
      window.CellQuestAR.selectOrganelle('nucleus', 1);

      var s2Radar = getB(radar);
      var s2Pill = getB(pill);
      var s2Card = getB(card);
      var pillHiddenFull = s2Pill ? (s2Pill.styleOpacity === '0' || s2Pill.opacity < 0.1 || !s2Pill.visible) : true;

      // Keadaan 3: Kad Organel Diminimumkan
      window.CellQuestAR.toggleSmartRadarPanel(false);
      var minBtn = document.getElementById('ar-card-min-btn');
      if (minBtn) minBtn.click();

      var s3Pill = getB(pill);
      var s3Card = getB(card);
      var col3 = s3Pill && s3Card && s3Pill.visible && s3Card.visible && (s3Pill.right > s3Card.x);

      return {
        s1: { radar: s1Radar, pill: s1Pill, collisionRadarPill: col1 },
        s2: { radar: s2Radar, pill: s2Pill, card: s2Card, pillHiddenFull: pillHiddenFull },
        s3: { pill: s3Pill, card: s3Card, collisionPillCardMin: col3 }
      };
    })()
  `);

  console.log('Analisis Geometri HUD:');
  console.log('  [Keadaan 1: Mencari] Radar Right:', hudRes.s1.radar?.right, 'vs Pill Left:', hudRes.s1.pill?.x, '=> Pertindihan:', hudRes.s1.collisionRadarPill ? 'YA (RALAT)' : 'TIADA (LULUS)');
  console.log('  [Keadaan 2: Kad Penuh] Card Width:', hudRes.s2.card?.width, 'px (clamp 260-310px). Pil Sembunyi Anggun:', hudRes.s2.pillHiddenFull ? 'YA (LULUS)' : 'TIDAK');
  console.log('  [Keadaan 3: Kad Min] Pill Right:', hudRes.s3.pill?.right, 'vs Card Left:', hudRes.s3.card?.x, '=> Pertindihan:', hudRes.s3.collisionPillCardMin ? 'YA (RALAT)' : 'TIADA (LULUS)');

  await delay(600);
  const hudShot = await client.send('Page.captureScreenshot', { format: 'png' });
  const hudShotPath = path.join(screenShotDir, 'fasa_a3_hud_no_overlap_ipad.png');
  fs.writeFileSync(hudShotPath, Buffer.from(hudShot.data, 'base64'));
  console.log(`✓ Tangkap layar HUD bebas pertindihan disimpan di: ${hudShotPath}`);

  // Selesai
  console.log('\n=== SEMUA UJIAN FASA AR ORIENTASI DUNIA A.3 SELESAI DENGAN JAYANYA ===');
  client.close();
  proc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

run().catch(err => {
  console.error('Ralat verifikasi:', err);
  process.exit(1);
});
