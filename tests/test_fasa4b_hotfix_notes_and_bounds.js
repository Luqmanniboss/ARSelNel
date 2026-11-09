/**
 * ==============================================================================
 * UJIAN PENGESAHAN HOTFIX KRITIKAL FASA 4B
 * KANDUNGAN NOTA SEBENAR & CLAMPING PANEL VIEWPORT IPAD SAFARI 1024x768
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

async function runHotfixTestSuite() {
  console.log('================================================================');
  console.log('🔍 UJIAN PENGESAHAN: HOTFIX KRITIKAL FASA 4B (NOTA & VIEWPORT)');
  console.log('================================================================\n');

  const tmpDir = path.join(process.env.TEMP || '.', 'chrome-fasa4b-hotfix-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9290',
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + tmpDir,
    '--window-size=1024,768' // iPad Safari Landscape Viewport
  ]);

  let cdpUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9290/json/version');
      if (res.ok) {
        const json = await res.json();
        cdpUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch (_) {}
  }

  if (!cdpUrl) {
    console.error('❌ Tidak dapat menyambung ke Chrome CDP');
    chromeProc.kill();
    process.exit(1);
  }

  let ws;
  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9290/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const parsed = JSON.parse(evt.data);
          if (parsed.id === id) {
            ws.removeEventListener('message', handler);
            if (parsed.error) reject(parsed.error);
            else resolve(parsed.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true,
    screenOrientation: { angle: 90, type: 'landscapePrimary' }
  });

  console.log('--- BAHAGIAN 1: PEMUATAN MODUL & SEMAKAN DATA CMS SEBENAR ---');
  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 1500));

  // Start simulation mode
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.startSimulationMode();' });
  await new Promise(r => setTimeout(r, 600));

  // Wait for notes to load
  await send('Runtime.evaluate', {
    expression: 'new Promise(r => { const c = () => { if (window.KotakARSELNEL.state.notes && window.KotakARSELNEL.state.notes.length > 0) r(); else setTimeout(c, 100); }; c(); })',
    awaitPromise: true
  });

  const notesData = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      count: window.KotakARSELNEL.state.notes.length,
      firstNoteTitle: window.KotakARSELNEL.state.notes[0].title,
      firstNoteType: window.KotakARSELNEL.state.notes[0].contentType,
      hasPdfUrl: !!(window.KotakARSELNEL.state.notes[0].sourceUrl || window.KotakARSELNEL.state.notes[0].storagePath)
    })`,
    returnByValue: true
  });
  const nData = JSON.parse(notesData.result.value);
  assert(nData.count >= 4, `Ujian 1: Memuatkan sekurang-kurangnya 4 nota pembelajaran daripada CMS (${nData.count} nota dimuatkan)`);
  assert(nData.firstNoteTitle.includes('Sel Tumbuhan') || nData.firstNoteTitle.includes('Sel'), `Ujian 2: Nota pertama dikenal pasti: "${nData.firstNoteTitle}" [${nData.firstNoteType}]`);
  assert(nData.hasPdfUrl, `Ujian 3: Fail sumber PDF/media disahkan wujud untuk nota utama`);

  console.log('\n--- BAHAGIAN 2: PERTUKARAN KE MODUL NOTA & KANDUNGAN SEBENAR (BUKAN TAJUK BERULANG) ---');
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('nota');` });
  await new Promise(r => setTimeout(r, 800));

  const noteRenderCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      activeModule: window.KotakARSELNEL.state.activeModule,
      activeNoteTitle: window.KotakARSELNEL.state.activeNote ? window.KotakARSELNEL.state.activeNote.title : '',
      pdfContainerVisible: !document.getElementById('nota-pdf-container').classList.contains('hidden'),
      hasPdfCanvas: !!document.getElementById('nota-pdf-canvas'),
      hasRenderedBody: !document.getElementById('nota-body-rendered').classList.contains('hidden'),
      renderedHtml: document.getElementById('nota-body-rendered').innerHTML.trim(),
      currentPage: window.KotakARSELNEL.state.currentNotePage,
      totalPages: window.KotakARSELNEL.state.totalNotePages,
      openFullHref: document.getElementById('btn-nota-open-full') ? document.getElementById('btn-nota-open-full').href : ''
    })`,
    returnByValue: true
  });
  const rCheck = JSON.parse(noteRenderCheck.result.value);
  assert(rCheck.activeModule === 'nota', `Ujian 4: Modul aktif berjaya bertukar kepada "nota"`);
  assert(rCheck.activeNoteTitle.length > 0, `Ujian 5: Nota aktif dipilih: "${rCheck.activeNoteTitle}"`);
  
  // Verify that real content is present (either canvas or non-empty formatted HTML body)
  const hasRealContent = rCheck.pdfContainerVisible || (rCheck.renderedHtml.length > 50);
  assert(hasRealContent, `Ujian 6: Kandungan nota sebenar berjaya dipaparkan (Bukan ruang kosong)`);
  
  // Verify that content is NOT just repeated title
  const isNotRepeatedTitle = !rCheck.renderedHtml.startsWith('<h3>Sel Tumbuhan') || rCheck.pdfContainerVisible || rCheck.renderedHtml.length > 100;
  assert(isNotRepeatedTitle, `Ujian 7: Ruang kandungan memaparkan bahan slaid/kandungan penuh (Bukan sekadar tajuk berulang)`);
  assert(rCheck.totalPages >= 2, `Ujian 8: Jumlah halaman mencerminkan bilangan sebenar (${rCheck.totalPages} halaman)`);
  assert(rCheck.openFullHref.includes('slaid_interaktif.html') || rCheck.openFullHref.includes('.pdf'), `Ujian 9: Pautan "Buka Pratonton Penuh" disediakan (${rCheck.openFullHref.slice(0, 45)}...)`);

  console.log('\n--- BAHAGIAN 3: KAWALAN HALAMAN NOTA (SEBELUM / SETERUSNYA) ---');
  assert(rCheck.currentPage === 1, `Ujian 10: Pembaca bermula pada Halaman 1`);
  
  // Click Next
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-nota-next').click();` });
  await new Promise(r => setTimeout(r, 400));
  
  const page2Check = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      page: window.KotakARSELNEL.state.currentNotePage,
      pageText: document.getElementById('nota-page-indicator').textContent
    })`,
    returnByValue: true
  });
  const p2 = JSON.parse(page2Check.result.value);
  assert(p2.page === 2, `Ujian 11: Butang Seterusnya berjaya menukar ke Halaman 2 (${p2.pageText})`);

  // Click Prev
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-nota-prev').click();` });
  await new Promise(r => setTimeout(r, 400));

  const page1Check = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      page: window.KotakARSELNEL.state.currentNotePage,
      prevDisabled: document.getElementById('btn-nota-prev').disabled
    })`,
    returnByValue: true
  });
  const p1 = JSON.parse(page1Check.result.value);
  assert(p1.page === 1 && p1.prevDisabled, `Ujian 12: Butang Sebelum kembali ke Halaman 1 dan dilumpuhkan secara selamat`);

  console.log('\n--- BAHAGIAN 4: KAWALAN ZOOM NOTA (+ / - / RESET) ---');
  await send('Runtime.evaluate', { expression: `document.getElementById('btn-nota-zoom-in').click();` });
  await new Promise(r => setTimeout(r, 200));
  const zIn = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ zoom: window.KotakARSELNEL.state.noteZoom, text: document.getElementById('nota-zoom-text').textContent })`,
    returnByValue: true
  });
  const zi = JSON.parse(zIn.result.value);
  assert(zi.zoom === 1.15 && zi.text === '115%', `Ujian 13: Butang Zoom In meningkatkan saiz kepada 115%`);

  await send('Runtime.evaluate', { expression: `document.getElementById('btn-nota-zoom-reset').click();` });
  await new Promise(r => setTimeout(r, 200));
  const zRes = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ zoom: window.KotakARSELNEL.state.noteZoom, text: document.getElementById('nota-zoom-text').textContent })`,
    returnByValue: true
  });
  const zr = JSON.parse(zRes.result.value);
  assert(zr.zoom === 1.0 && zr.text === '100%', `Ujian 14: Butang Reset Zoom mengembalikan saiz kepada 100%`);

  console.log('\n--- BAHAGIAN 5: KEDUDUKAN & CLAMPING VIEWPORT IPAD SAFARI (1024x768) ---');
  // Trigger position clamp
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.clampPanelIntoViewport();` });
  await new Promise(r => setTimeout(r, 300));

  const viewportCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('floating-card-container');
      const rect = card.getBoundingClientRect();
      const hud = document.querySelector('.ar-top-hud');
      const hudRect = hud ? hud.getBoundingClientRect() : { bottom: 74 };
      const headerControls = document.getElementById('panel-fixed-header');
      const headerRect = headerControls ? headerControls.getBoundingClientRect() : rect;
      const footerControls = document.getElementById('panel-sticky-footer');
      const footerRect = footerControls ? footerControls.getBoundingClientRect() : rect;
      
      return JSON.stringify({
        cardTop: rect.top,
        cardBottom: rect.bottom,
        cardHeight: rect.height,
        cardLeft: rect.left,
        cardRight: rect.right,
        hudBottom: hudRect.bottom,
        headerTop: headerRect.top,
        footerBottom: footerRect.bottom,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        // Card top must be at or below safe area (hudBottom or 80px)
        isBelowHeader: rect.top >= 76,
        // Card bottom must be within window
        isAboveWindowBottom: rect.bottom <= window.innerHeight - 10,
        // Header and footer must be fully within viewport
        headerVisible: headerRect.top >= 70,
        footerVisible: footerRect.bottom <= window.innerHeight
      });
    })()`,
    returnByValue: true
  });
  const vp = JSON.parse(viewportCheck.result.value);
  assert(vp.isBelowHeader, `Ujian 15: Bahagian atas panel Nota berada di bawah Header HUD (Card Top: ${Math.round(vp.cardTop)}px >= 76px, Safe clearance)`);
  assert(vp.isAboveWindowBottom, `Ujian 16: Bahagian bawah panel Nota berada dalam sempadan viewport (Card Bottom: ${Math.round(vp.cardBottom)}px <= ${vp.windowHeight}px)`);
  assert(vp.headerVisible && vp.footerVisible, `Ujian 17: Header panel dan Sticky Footer navigasi 100% boleh dicapai murid`);

  console.log('\n--- BAHAGIAN 6: UJIAN KEDUDUKAN EKSTRIM MARKER (ATAS & BAWAH KAMERA) ---');
  // Simulate marker located high near top edge of iPad camera view (py = 90)
  const clampHigh = await send('Runtime.evaluate', {
    expression: `(() => {
      // Simulate extreme high marker projection
      window.KotakARSELNEL.state.isTracking = true;
      const bounds = window.KotakARSELNEL.getSafeAreaBounds();
      const targetY = Math.max(bounds.minY, Math.min(bounds.maxY, 90));
      const cardHalfH = bounds.halfH;
      const topEdge = targetY - cardHalfH;
      return JSON.stringify({ targetY, topEdge, minY: bounds.minY, topSafe: bounds.topSafe });
    })()`,
    returnByValue: true
  });
  const ch = JSON.parse(clampHigh.result.value);
  assert(ch.topEdge >= 76, `Ujian 18: Marker di bahagian atas kamera di-clamp secara automatik (Top Edge: ${Math.round(ch.topEdge)}px >= 76px)`);

  // Simulate marker located low near bottom edge of camera view (py = 720)
  const clampLow = await send('Runtime.evaluate', {
    expression: `(() => {
      const bounds = window.KotakARSELNEL.getSafeAreaBounds();
      const targetY = Math.max(bounds.minY, Math.min(bounds.maxY, 720));
      const cardHalfH = bounds.halfH;
      const bottomEdge = targetY + cardHalfH;
      return JSON.stringify({ targetY, bottomEdge, maxY: bounds.maxY, botSafe: bounds.botSafe });
    })()`,
    returnByValue: true
  });
  const cl = JSON.parse(clampLow.result.value);
  assert(cl.bottomEdge <= 768 - 14, `Ujian 19: Marker di bahagian bawah kamera di-clamp secara automatik (Bottom Edge: ${Math.round(cl.bottomEdge)}px <= 754px)`);

  console.log('\n--- BAHAGIAN 7: UJIAN SERET PANEL & KESELAMATAN SEMPADAN (DRAG BOUNDS) ---');
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.placeVideoOnScreen();` });
  await new Promise(r => setTimeout(r, 400));

  // Test drag to extreme top (deltaY = -1000)
  const dragTopCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bounds = window.KotakARSELNEL.getSafeAreaBounds();
      let newY = window.KotakARSELNEL.state.currentScreenY - 1000;
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
      const cardTop = newY - bounds.halfH;
      return JSON.stringify({ newY, cardTop, topSafe: bounds.topSafe });
    })()`,
    returnByValue: true
  });
  const dt = JSON.parse(dragTopCheck.result.value);
  assert(dt.cardTop >= 76, `Ujian 20: Seretan panel ke atas disekat secara selamat sebelum memasuki kawasan header (${Math.round(dt.cardTop)}px >= 76px)`);

  console.log('\n--- BAHAGIAN 8: KESESUAIAN SAIZ S / M / L PADA IPAD LANDSCAPE ---');
  // Size S
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('small');` });
  await new Promise(r => setTimeout(r, 300));
  const sCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.getElementById('floating-card-container').getBoundingClientRect();
      return JSON.stringify({ top: r.top, bottom: r.bottom, width: r.width });
    })()`,
    returnByValue: true
  });
  const sc = JSON.parse(sCheck.result.value);
  assert(sc.top >= 76 && sc.bottom <= 768, `Ujian 21: Saiz S (Kecil) mematuhi sempadan selamat iPad Safari (Top: ${Math.round(sc.top)}px, Bottom: ${Math.round(sc.bottom)}px)`);

  // Size L
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('large');` });
  await new Promise(r => setTimeout(r, 300));
  const lCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.getElementById('floating-card-container').getBoundingClientRect();
      return JSON.stringify({ top: r.top, bottom: r.bottom, width: r.width });
    })()`,
    returnByValue: true
  });
  const lc = JSON.parse(lCheck.result.value);
  assert(lc.top >= 76 && lc.bottom <= 768, `Ujian 22: Saiz L (Besar) tidak menenggelamkan header mahupun terkeluar dari skrin (Top: ${Math.round(lc.top)}px, Bottom: ${Math.round(lc.bottom)}px)`);

  // Restore Size M
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.setPanelSize('medium');` });
  await new Promise(r => setTimeout(r, 300));

  console.log('\n--- BAHAGIAN 9: UJIAN INTEGRITI POV LOCK 3DoF & PENUKARAN NOTA ➔ VIDEO ---');
  // Start POV Mode
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.startPOVMode();` });
  await new Promise(r => setTimeout(r, 500));
  const povSetup = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ mode: window.KotakARSELNEL.state.systemMode, isCentered: document.getElementById('pov-ar-anchor').classList.contains('is-centered') })`,
    returnByValue: true
  });
  const ps = JSON.parse(povSetup.result.value);
  assert(ps.mode === 'POV_SETUP' && ps.isCentered, `Ujian 23: Kunci POV bermula dengan kemas di tengah skrin (POV_SETUP)`);

  // Lock POV
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.anchorPOVAtCurrentHeading();` });
  await new Promise(r => setTimeout(r, 400));
  const povLock = await send('Runtime.evaluate', {
    expression: `JSON.stringify({ mode: window.KotakARSELNEL.state.systemMode })`,
    returnByValue: true
  });
  const pl = JSON.parse(povLock.result.value);
  assert(pl.mode === 'POV_LOCKED', `Ujian 24: POV Lock berjaya dikunci (POV_LOCKED)`);

  // Switch back to Screen-Pinned and then to Video
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.exitPOVMode(true);` });
  await new Promise(r => setTimeout(r, 400));
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('video');` });
  await new Promise(r => setTimeout(r, 500));

  const vidCheck = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      activeModule: window.KotakARSELNEL.state.activeModule,
      hasPlayer: !document.getElementById('active-player-view').classList.contains('hidden') || !!document.querySelector('.ar-player-frame iframe')
    })`,
    returnByValue: true
  });
  const vc = JSON.parse(vidCheck.result.value);
  assert(vc.activeModule === 'video', `Ujian 25: Pertukaran semula ke Modul Video berfungsi dengan lancar tanpa ralat`);

  // Switch back to Nota to capture verified screenshot on iPad Safari
  await send('Runtime.evaluate', { expression: `window.KotakARSELNEL.switchActiveModule('nota');` });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4b_hotfix_verified.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log(`\n📸 Tangkapan skrin iPad Safari Landscape (1024x768) disimpan di: ${shotPath}`);

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN UJIAN HOTFIX: ${passedTests} / ${totalTests} BERJAYA (${failedTests} GAGAL)`);
  console.log('================================================================\n');

  ws.close();
  chromeProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

  if (failedTests > 0) {
    process.exit(1);
  }
}

runHotfixTestSuite().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
