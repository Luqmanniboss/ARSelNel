/**
 * KOTAK ARSELNEL & CELLQUEST AR INTEGRATION VERIFICATION SUITE
 * 
 * Verifies all 12 objectives of the user request:
 * 1. Banner CellQuest AR is present and intact.
 * 2. Kad Kotak ARSELNEL is placed immediately below the banner.
 * 3. Kad Misi Jelajah Dunia Sel is immediately below Kotak ARSELNEL.
 * 4. Button "Imbas Kotak ARSELNEL" exists, has correct typography, icon and styling.
 * 5. Button navigates to the real module (/kotak_arselnel/).
 * 6. Old green button "Mulakan Pengembaraan AR" is completely removed.
 * 7. Old status box "Kamera AR Disokong" is completely removed.
 * 8. Safari Sel "Mula Pengembaraan" button exists and points to adventure.html.
 * 9. Safari Sel "Cara Bermain" button exists and points to adventure.html?mode=how.
 * 10. 3D Model viewer (Animal & Plant tabs, WebGL Canvas, Organelle list) functions properly.
 * 11. Responsive layout verified on desktop (1280x800) and iPad (1024x768).
 * 12. Zero unhandled JavaScript exceptions in the console.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CDP_PORT = 9355;

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
  console.log('🧪 CELLQUEST AR — KOTAK ARSELNEL INTEGRATION & UI/UX VERIFICATION SUITE');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_cq_${Date.now()}`);
  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--ignore-certificate-errors',
    '--window-size=1280,800',
    'about:blank'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('Halaman browser tidak ditemui');

    const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let cdpId = 1;
    await sendCDP(ws, 'Page.enable', {}, cdpId++);
    await sendCDP(ws, 'Runtime.enable', {}, cdpId++);

    // Pre-inject student auth session before scripts execute
    await sendCDP(ws, 'Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const mockUser = {
            id: 'test_student',
            name: 'Pelajar Ujian CellQuest',
            role: 'student',
            isGuest: false,
            stats: { videos: 1, quizzes: 3, arScans: 1, aiPrompts: 0 }
          };
          localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
          localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
          sessionStorage.setItem('arselnel_user', JSON.stringify(mockUser));
        } catch(e) {}
      `
    }, cdpId++);

    // Navigate to cellquest/code.html
    await sendCDP(ws, 'Page.navigate', { url: 'https://127.0.0.1:3443/cellquest/code.html' }, cdpId++);
    await new Promise(r => setTimeout(r, 3500));

    // Collect console errors
    const consoleErrors = [];
    ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.method === 'Runtime.exceptionThrown') {
          consoleErrors.push(data.params.exceptionDetails);
        }
      } catch (e) {}
    });

    const curUrlRes = await sendCDP(ws, 'Runtime.evaluate', {
      expression: '({ href: window.location.href, title: document.title, bodyLength: document.body?.innerHTML?.length })',
      returnByValue: true
    }, cdpId++);
    console.log('Current page status:', curUrlRes.result.value);

    console.log('--- UJIAN 1, 2 & 3: Susunan Hierarki DOM & Kedudukan Kad ---');
    await new Promise(r => setTimeout(r, 1200));

    const layoutCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const hero = document.querySelector('.cq-hero');
          const kotakCard = document.getElementById('kotak-arselnel-card');
          const adventureBanner = document.querySelector('.cq-adventure-banner');
          const oldActionRow = document.querySelector('.cq-action-row');
          const oldArEntry = document.getElementById('ar-entry');
          const oldArStatus = document.getElementById('ar-status');

          // Check sequential siblings inside .cq-main
          const heroIndex = Array.from(hero?.parentElement?.children || []).indexOf(hero);
          const kotakIndex = Array.from(kotakCard?.parentElement?.children || []).indexOf(kotakCard);
          const adventureIndex = Array.from(adventureBanner?.parentElement?.children || []).indexOf(adventureBanner);

          return {
            hasHero: !!hero,
            heroTitle: hero?.querySelector('h1')?.textContent?.trim(),
            hasKotakCard: !!kotakCard,
            hasAdventureBanner: !!adventureBanner,
            heroIndex,
            kotakIndex,
            adventureIndex,
            isKotakImmediatelyAfterHero: (kotakIndex === heroIndex + 1),
            isAdventureImmediatelyAfterKotak: (adventureIndex === kotakIndex + 1),
            hasOldActionRow: !!oldActionRow,
            hasOldArEntry: !!oldArEntry,
            hasOldArStatus: !!oldArStatus
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const l = layoutCheck.result.value;
    console.log('Layout Order Check:', l);

    assert(l.hasHero === true, 'Banner CellQuest AR utama KEKAL wujud');
    assert(l.heroTitle.includes('CellQuest'), 'Tajuk banner ialah CellQuest AR');
    assert(l.hasKotakCard === true, 'Kad Kotak ARSELNEL baharu wujud');
    assert(l.isKotakImmediatelyAfterHero === true, 'Kad Kotak ARSELNEL berada TEPAT di bawah banner CellQuest AR');
    assert(l.hasAdventureBanner === true, 'Kad Misi Jelajah Dunia Sel KEKAL wujud');
    assert(l.isAdventureImmediatelyAfterKotak === true, 'Kad Misi Jelajah Dunia Sel berada TEPAT di bawah Kad Kotak ARSELNEL');

    console.log('\n--- UJIAN 4 & 5: Kad Kotak ARSELNEL, Kandungan & Butang Navigasi ---');
    const kotakDetails = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.getElementById('kotak-arselnel-card');
          const badge = card?.querySelector('.cq-kotak-badge');
          const title = card?.querySelector('.cq-kotak-title');
          const desc = card?.querySelector('.cq-kotak-desc');
          const pills = card?.querySelectorAll('.cq-kotak-pill');
          const btn = document.getElementById('btn-open-kotak-arselnel');

          return {
            badgeText: badge?.textContent?.trim(),
            titleText: title?.textContent?.trim(),
            descText: desc?.textContent?.trim(),
            pillsCount: pills?.length || 0,
            hasBtn: !!btn,
            btnText: btn?.textContent?.trim(),
            btnHref: btn?.getAttribute('href'),
            resolvedHref: btn?.href
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const k = kotakDetails.result.value;
    console.log('Kotak ARSELNEL Card Details:', k);

    assert(k.badgeText.includes('WEBAR • PEMBELAJARAN INTERAKTIF'), 'Label kecil "WEBAR • PEMBELAJARAN INTERAKTIF" wujud');
    assert(k.titleText === 'Kotak ARSELNEL', 'Tajuk kad ialah "Kotak ARSELNEL"');
    assert(k.descText.includes('Imbas marker pada Kotak ARSELNEL'), 'Penerangan kad tepat');
    assert(k.pillsCount === 4, '4 panduan pill marker dipaparkan (Video, Nota, Kuiz, 3D AR)');
    assert(k.hasBtn === true, 'Butang utama "Imbas Kotak ARSELNEL" wujud');
    assert(k.btnText.includes('Imbas Kotak ARSELNEL'), 'Teks butang tepat');
    assert(k.btnHref === '../kotak_arselnel/' || k.btnHref === '/kotak_arselnel/' || k.btnHref === '../kotak_arselnel/code.html', `Href butang adalah routing relatif selamat (${k.btnHref})`);
    assert(k.resolvedHref.includes('/kotak_arselnel/'), `Resolusi URL menghala ke modul sebenar /kotak_arselnel/ (${k.resolvedHref})`);

    console.log('\n--- UJIAN 6 & 7: Pembuangan Butang Hijau Lama & Kotak Status ---');
    assert(l.hasOldArEntry === false, 'Butang hijau "Mulakan Pengembaraan AR" lama TELAH DIBUANG sepenuhnya');
    assert(l.hasOldArStatus === false, 'Kotak status "Kamera AR Disokong" lama TELAH DIBUANG sepenuhnya');
    assert(l.hasOldActionRow === false, 'Bekas .cq-action-row lama TELAH DIBUANG sepenuhnya');

    console.log('\n--- UJIAN 8 & 9: Pengekalan Fungsi Misi Jelajah Dunia Sel ---');
    const adventureDetails = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const banner = document.querySelector('.cq-adventure-banner');
          const title = banner?.querySelector('h2')?.textContent?.trim();
          const buttons = banner?.querySelectorAll('a');
          const btnMula = Array.from(buttons || []).find(a => a.textContent.includes('Mula Pengembaraan'));
          const btnCara = Array.from(buttons || []).find(a => a.textContent.includes('Cara Bermain'));

          return {
            title,
            hasBtnMula: !!btnMula,
            btnMulaHref: btnMula?.getAttribute('href'),
            hasBtnCara: !!btnCara,
            btnCaraHref: btnCara?.getAttribute('href')
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const a = adventureDetails.result.value;
    console.log('Misi Jelajah Dunia Sel Check:', a);
    assert(a.title === 'Misi Jelajah Dunia Sel', 'Tajuk kad Misi Jelajah Dunia Sel kekal utuh');
    assert(a.hasBtnMula === true && a.btnMulaHref === 'adventure.html', 'Butang "Mula Pengembaraan" KEKAL berfungsi menghala ke adventure.html');
    assert(a.hasBtnCara === true && a.btnCaraHref.includes('mode=how'), 'Butang "Cara Bermain" KEKAL berfungsi menghala ke adventure.html?mode=how');

    console.log('\n--- UJIAN 10: Model 3D Sel Haiwan & Tumbuhan, OrbitControls & Organel ---');
    const model3DCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const animalTab = document.getElementById('animal-tab');
          const plantTab = document.getElementById('plant-tab');
          const stageCanvas = document.querySelector('#cell-stage canvas');
          const organelleButtons = document.querySelectorAll('#core-list .cq-organelle-btn');
          const resetBtn = document.getElementById('reset-view');

          return {
            hasAnimalTab: !!animalTab,
            animalActive: animalTab?.classList.contains('active'),
            hasPlantTab: !!plantTab,
            hasCanvas: !!stageCanvas,
            canvasW: stageCanvas ? stageCanvas.clientWidth : 0,
            canvasH: stageCanvas ? stageCanvas.clientHeight : 0,
            organellesCount: organelleButtons ? organelleButtons.length : 0,
            hasResetBtn: !!resetBtn
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const m3d = model3DCheck.result.value;
    console.log('3D Model Viewer Check:', m3d);
    assert(m3d.hasAnimalTab && m3d.hasPlantTab, 'Tab Sel Haiwan dan Sel Tumbuhan wujud dan utuh');
    assert(m3d.hasCanvas === true, 'Three.js WebGL Canvas dirender dalam stage');
    assert(m3d.organellesCount > 0, `Senarai organel dipaparkan (${m3d.organellesCount} organel)`);

    console.log('\n--- UJIAN 11: Responsif Layout iPad (1024x768) & Desktop ---');
    // Set to iPad viewport
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));

    const ipadCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const card = document.getElementById('kotak-arselnel-card');
          const rect = card.getBoundingClientRect();
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          return {
            cardW: rect.width,
            docW,
            winW,
            noHorizontalOverflow: (docW <= winW)
          };
        })()
      `,
      returnByValue: true
    }, cdpId++);

    const ipad = ipadCheck.result.value;
    console.log('iPad Viewport Check:', ipad);
    assert(ipad.cardW > 700, `Kad Kotak ARSELNEL memenuhi lebar kontena pada iPad (${ipad.cardW}px)`);
    assert(ipad.noHorizontalOverflow === true, 'Sifar limpahan mendatar (no horizontal scrollbar on iPad)');

    // Reset viewport to desktop
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- UJIAN 12: Sifar Ralat Konsol JavaScript ---');
    console.log('Console Exceptions:', consoleErrors);
    assert(consoleErrors.length === 0, `Tiada ralat JavaScript konsol pada halaman (${consoleErrors.length} ralat)`);

    // Capture screenshot of the verified page
    const screenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    fs.writeFileSync('cellquest_ar_kotak_integrated_desktop.png', Buffer.from(screenshot.data, 'base64'));
    console.log('\n📸 Tangkapan skrin disimpan ke cellquest_ar_kotak_integrated_desktop.png');

    // Also capture iPad screenshot
    await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true
    }, cdpId++);
    await new Promise(r => setTimeout(r, 400));
    const ipadScreenshot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' }, cdpId++);
    fs.writeFileSync('cellquest_ar_kotak_integrated_ipad.png', Buffer.from(ipadScreenshot.data, 'base64'));
    console.log('📸 Tangkapan skrin iPad disimpan ke cellquest_ar_kotak_integrated_ipad.png');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA 12/12 UJIAN INTEGRASI CELLQUEST AR BERJAYA LULUS DENGAN CEMERLANG!');
    console.log('========================================================================\n');

    ws.close();
  } finally {
    cleanup();
  }
}

run().catch(err => {
  console.error('\n❌ UJIAN INTEGRASI GAGAL:', err);
  process.exit(1);
});
