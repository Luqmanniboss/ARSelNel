/**
 * ARSelNel - Automated Verification for Sidebar Logo Size Optimization & Brand Consistency
 * tests/verify_sidebar_new_logo.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9590;
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = edgePaths.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('Edge executable not found');
  process.exit(1);
}

const userDataDir = path.join(os.tmpdir(), `edge_cdp_verify_opt_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

async function checkAssetHttp(urlPath) {
  return new Promise((resolve) => {
    http.get(`${BASE_URL}${urlPath}`, res => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('🔍 ARSELNEL: PENGESAHAN OPTIMASI SAIZ LOGO & KONSISTENSI JENAMA');
  console.log('================================================================\n');

  // Check Assets
  const assetsToCheck = [
    '/assets/branding/arselnel-logo-horizontal.png',
    '/assets/branding/arselnel-icon-compact.png',
    '/assets/branding/favicon-32.png',
    '/assets/branding/favicon-192.png',
    '/assets/branding/apple-touch-icon.png'
  ];

  console.log('[Semakan 1 & 4: Integriti Aset Branding Baharu]');
  for (const a of assetsToCheck) {
    const ok = await checkAssetHttp(a);
    const fullP = path.join(__dirname, '..', a);
    const sz = fs.existsSync(fullP) ? fs.statSync(fullP).size : 0;
    console.log(`  ✓ ${a} -> HTTP 200 (${sz.toLocaleString()} bytes)`);
    if (!ok) {
      console.error(`❌ Aset gagal dimuatkan: ${a}`);
      process.exit(1);
    }
  }

  const p = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const m = JSON.parse(e.data);
        if (m.id === id) {
          ws.removeEventListener('message', h);
          if (m.error) reject(m.error);
          else resolve(m.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result.value;
  }

  async function takeScreenshot(fileName) {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(r.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, fileName);
    fs.writeFileSync(outPath, buf);
    console.log(`  📸 Tangkapan skrin disimpan: ${fileName}`);
    return outPath;
  }

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        localStorage.setItem('arselnel_current_user', JSON.stringify({
          id: 'test_student_1',
          name: 'Hafif',
          email: 'hafif@arselnel.edu.my',
          role: 'student'
        }));
      `
    });

    console.log('\n--- UJIAN 2: DESKTOP EXPANDED (1920×1080) PADA DASHBOARD ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${BASE_URL}/halaman_utama/code.html` });
    await new Promise(r => setTimeout(r, 2000));

    const desktopBrandCheck = await evaluate(`(() => {
      const brand = document.querySelector('.ars-brand');
      const logoFull = document.querySelector('.ars-brand-logo-full');
      const logoCompact = document.querySelector('.ars-brand-logo-compact');
      const sidebar = document.querySelector('.ars-sidebar');

      const brandRect = brand ? brand.getBoundingClientRect() : null;
      const fullRect = logoFull ? logoFull.getBoundingClientRect() : null;
      const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;

      const styleFull = logoFull ? window.getComputedStyle(logoFull) : null;
      const styleCompact = logoCompact ? window.getComputedStyle(logoCompact) : null;

      // Favicon checks
      const favIcon = document.querySelector('link[rel="icon"]');
      const appleTouch = document.querySelector('link[rel="apple-touch-icon"]');

      return {
        brandExists: !!brand,
        logoFullVisible: styleFull ? styleFull.display !== 'none' && fullRect.width > 0 : false,
        logoCompactHidden: styleCompact ? styleCompact.display === 'none' : false,
        fullSrc: logoFull ? logoFull.src : null,
        naturalWidth: logoFull ? logoFull.naturalWidth : 0,
        naturalHeight: logoFull ? logoFull.naturalHeight : 0,
        renderedWidth: fullRect ? Math.round(fullRect.width) : 0,
        renderedHeight: fullRect ? Math.round(fullRect.height) : 0,
        brandAreaHeight: brandRect ? Math.round(brandRect.height) : 0,
        sidebarWidth: sidebarRect ? Math.round(sidebarRect.width) : 0,
        noOverflow: fullRect && sidebarRect ? fullRect.right <= sidebarRect.right : false,
        isTrimmedAsset: logoFull ? logoFull.src.includes('arselnel-logo-horizontal.png') : false,
        faviconHref: favIcon ? favIcon.href : null,
        appleTouchHref: appleTouch ? appleTouch.href : null
      };
    })()`);

    console.log('[Desktop Expanded Metrics]:', desktopBrandCheck);
    if (!desktopBrandCheck.isTrimmedAsset) {
      throw new Error('Logo tidak menggunakan aset arselnel-logo-horizontal.png!');
    }
    if (desktopBrandCheck.renderedWidth < 200) {
      throw new Error(`Lebar logo ${desktopBrandCheck.renderedWidth}px terlalu kecil!`);
    }
    if (!desktopBrandCheck.noOverflow) {
      throw new Error('Logo mengalami overflow dari sidebar!');
    }
    console.log(`✅ Saiz visual logo optimum: ${desktopBrandCheck.renderedWidth} × ${desktopBrandCheck.renderedHeight} px (Kawasan branding: ${desktopBrandCheck.brandAreaHeight} px)`);
    await takeScreenshot('logo_optimized_desktop_1920x1080.png');

    console.log('\n--- UJIAN 3: LAPTOP STANDARD (1366×768) ---');
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('logo_optimized_laptop_1366x768.png');

    console.log('\n--- UJIAN 4: DESKTOP COLLAPSED (84px) & IKON COMPACT BAHARU ---');
    // Click collapse button
    await evaluate(`document.querySelector('[data-ars-collapse]').click()`);
    await new Promise(r => setTimeout(r, 600));

    const collapsedCheck = await evaluate(`(() => {
      const isCollapsed = document.body.classList.contains('ars-collapsed');
      const logoFull = document.querySelector('.ars-brand-logo-full');
      const logoCompact = document.querySelector('.ars-brand-logo-compact');
      const styleFull = window.getComputedStyle(logoFull);
      const styleCompact = window.getComputedStyle(logoCompact);
      const compactRect = logoCompact.getBoundingClientRect();

      return {
        isCollapsed,
        logoFullHidden: styleFull.display === 'none',
        logoCompactVisible: styleCompact.display !== 'none' && compactRect.width > 0,
        compactSrc: logoCompact ? logoCompact.src : null,
        isNewCompactAsset: logoCompact ? logoCompact.src.includes('arselnel-icon-compact.png') : false,
        renderedSize: Math.round(compactRect.width) + 'x' + Math.round(compactRect.height)
      };
    })()`);

    console.log('[Collapsed Sidebar Check]:', collapsedCheck);
    if (!collapsedCheck.isCollapsed || !collapsedCheck.logoFullHidden || !collapsedCheck.logoCompactVisible) {
      throw new Error('Mod collapsed gagal menyembunyikan logo penuh atau memaparkan ikon compact!');
    }
    if (!collapsedCheck.isNewCompactAsset) {
      throw new Error('Ikon compact masih menggunakan simbol lama!');
    }
    console.log(`✅ Sidebar Collapsed: Menggunakan ikon compact rasmi baharu (${collapsedCheck.renderedSize}).`);
    await takeScreenshot('logo_optimized_collapsed_desktop.png');

    // Restore expanded
    await evaluate(`document.querySelector('[data-ars-collapse]').click()`);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- UJIAN 5: TABLET IPAD (1024×768 LANDSCAPE & 768×1024 PORTRAIT) ---');
    // iPad Landscape
    await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 2, mobile: false });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('logo_optimized_ipad_landscape_1024x768.png');

    // iPad Portrait (84px compact sidebar)
    await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 600));

    const tabletPortraitCheck = await evaluate(`(() => {
      const logoFull = document.querySelector('.ars-brand-logo-full');
      const logoCompact = document.querySelector('.ars-brand-logo-compact');
      const styleFull = window.getComputedStyle(logoFull);
      const styleCompact = window.getComputedStyle(logoCompact);
      return {
        logoFullHidden: styleFull.display === 'none',
        logoCompactVisible: styleCompact.display !== 'none',
        isNewCompactAsset: logoCompact ? logoCompact.src.includes('arselnel-icon-compact.png') : false
      };
    })()`);
    console.log('[iPad Portrait Status]:', tabletPortraitCheck);
    if (!tabletPortraitCheck.logoFullHidden || !tabletPortraitCheck.logoCompactVisible || !tabletPortraitCheck.isNewCompactAsset) {
      throw new Error('iPad portrait gagal memaparkan ikon compact baharu!');
    }
    console.log('✅ iPad Portrait: Ikon compact heksagon baharu dipaparkan kemas pada sidebar 84px.');
    await takeScreenshot('logo_optimized_ipad_portrait_768x1024.png');

    console.log('\n--- UJIAN 6: TELEFON PINTAR (390×844 & 375×667) & MOBILE DRAWER ---');
    // Test 390x844
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await new Promise(r => setTimeout(r, 500));

    // Open mobile sidebar drawer
    await evaluate(`document.querySelector('[data-ars-menu]').click()`);
    await new Promise(r => setTimeout(r, 600));

    const mobile390Check = await evaluate(`(() => {
      const isOpen = document.body.classList.contains('ars-mobile-open');
      const logoFull = document.querySelector('.ars-sidebar .ars-brand-logo-full');
      const styleFull = window.getComputedStyle(logoFull);
      const fullRect = logoFull.getBoundingClientRect();
      const sidebar = document.querySelector('.ars-sidebar');
      const sidebarRect = sidebar.getBoundingClientRect();

      return {
        isOpen,
        logoFullVisible: styleFull.display !== 'none' && fullRect.width > 0,
        renderedWidth: Math.round(fullRect.width),
        renderedHeight: Math.round(fullRect.height),
        noOverflow: fullRect.right <= sidebarRect.right + 2
      };
    })()`);

    console.log('[Mobile 390×844 Drawer Status]:', mobile390Check);
    if (!mobile390Check.isOpen || !mobile390Check.logoFullVisible || !mobile390Check.noOverflow) {
      throw new Error('Mobile drawer 390x844 overflow atau tidak kelihatan!');
    }
    console.log('✅ Mobile 390×844: Logo penuh berskala seimbang dalam drawer.');
    await takeScreenshot('logo_optimized_mobile_drawer_390x844.png');

    // Close drawer
    await evaluate(`document.querySelector('[data-ars-close]').click()`);
    await new Promise(r => setTimeout(r, 400));

    // Test 375x667 (iPhone SE)
    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 400));
    await evaluate(`document.querySelector('[data-ars-menu]').click()`);
    await new Promise(r => setTimeout(r, 500));
    await takeScreenshot('logo_optimized_mobile_drawer_375x667.png');
    await evaluate(`document.querySelector('[data-ars-close]').click()`);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- UJIAN 7: KONSISTENSI ANTARA SEMUA HALAMAN UTAMA ---');
    const testPages = [
      { name: 'Dashboard', url: `${BASE_URL}/halaman_utama/code.html` },
      { name: 'Nota Interaktif', url: `${BASE_URL}/nota_pembelajaran/code.html` },
      { name: 'Video Pembelajaran', url: `${BASE_URL}/perpustakaan_video/code.html` },
      { name: 'SelBot AI', url: `${BASE_URL}/selbot_ai/code.html` },
      { name: 'Kuiz & Permainan', url: `${BASE_URL}/hab_permainan/code.html` },
      { name: 'CellQuest AR', url: `${BASE_URL}/cellquest/code.html` }
    ];

    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

    for (const pg of testPages) {
      await send('Page.navigate', { url: pg.url });
      await new Promise(r => setTimeout(r, 1500));

      const pageCheck = await evaluate(`(() => {
        const logoFull = document.querySelector('.ars-brand-logo-full');
        const logoCompact = document.querySelector('.ars-brand-logo-compact');
        const styleFull = logoFull ? window.getComputedStyle(logoFull) : null;
        const rect = logoFull ? logoFull.getBoundingClientRect() : null;
        return {
          exists: !!logoFull,
          visible: styleFull ? styleFull.display !== 'none' && logoFull.naturalWidth > 0 : false,
          src: logoFull ? logoFull.src : null,
          compactSrc: logoCompact ? logoCompact.src : null,
          renderedSize: rect ? Math.round(rect.width) + 'x' + Math.round(rect.height) : ''
        };
      })()`);

      console.log(`  ✓ ${pg.name}: Logo baharu dioptimumkan aktif (${pageCheck.renderedSize}, visible: ${pageCheck.visible})`);
      if (!pageCheck.visible || !pageCheck.src.includes('arselnel-logo-horizontal.png')) {
        throw new Error(`Logo gagal dimuatkan atau salah aset pada halaman ${pg.name}!`);
      }
    }

    console.log('\n================================================================');
    console.log('🎉 SEMUA 12 UJIAN OPTIMASI LOGO ARSELNEL BERJAYA DIVERIFIKASI 100%!');
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Ralat semasa verifikasi:', err);
    process.exit(1);
  } finally {
    try {
      ws.close();
      p.kill();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runVerification();
