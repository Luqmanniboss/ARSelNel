/**
 * ARSelNel - Automated Verification for Fasa 4E-G.1.3
 * HOTFIX: SelBot Chat History Drawer & Main Sidebar Overlap
 * tests/verify_fasa4eg13_drawer_overlap.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9565;
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = edgePaths.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('Edge executable not found');
  process.exit(1);
}

const userDataDir = path.join(os.tmpdir(), `edge_cdp_verify_drawer_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop_expanded_1920x1080', label: 'Desktop FHD Expanded (1920×1080)', w: 1920, h: 1080, mobile: false, collapsed: false },
  { name: 'desktop_collapsed_1920x1080', label: 'Desktop FHD Collapsed (1920×1080)', w: 1920, h: 1080, mobile: false, collapsed: true },
  { name: 'laptop_expanded_1366x768', label: 'Laptop Standard Expanded (1366×768)', w: 1366, h: 768, mobile: false, collapsed: false },
  { name: 'laptop_collapsed_1366x768', label: 'Laptop Standard Collapsed (1366×768)', w: 1366, h: 768, mobile: false, collapsed: true },
  { name: 'laptop_1280x800', label: 'Laptop WXGA (1280×800)', w: 1280, h: 800, mobile: false, collapsed: false },
  { name: 'ipad_landscape_1024x768', label: 'iPad Landscape (1024×768)', w: 1024, h: 768, mobile: false, collapsed: false },
  { name: 'ipad_portrait_768x1024', label: 'iPad Portrait (768×1024)', w: 768, h: 1024, mobile: true, collapsed: false },
  { name: 'mobile_390x844', label: 'Mobile Modern (390×844)', w: 390, h: 844, mobile: true, collapsed: false },
  { name: 'mobile_360x740', label: 'Mobile Compact (360×740)', w: 360, h: 740, mobile: true, collapsed: false }
];

async function runVerification() {
  console.log('================================================================');
  console.log('🔍 ARSELNEL: FASA 4E-G.1.3 HOTFIX VERIFICATION');
  console.log('   SELBOT CHAT HISTORY DRAWER & MAIN SIDEBAR OVERLAP');
  console.log('================================================================\n');

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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('arselnel_current_user', JSON.stringify({id:'u_test_fasa4eg13', name:'Hafif (Murid)', role:'student'}));
    `
  });

  const testReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Menguji Viewport: ${vp.label} ---`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
    await new Promise(r => setTimeout(r, 1200));

    // Handle collapsed sidebar if needed
    if (vp.collapsed) {
      await send('Runtime.evaluate', {
        expression: `document.body.classList.add('ars-collapsed');`
      });
      await new Promise(r => setTimeout(r, 300));
    }

    // Open history drawer
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById('toggle-history-btn');
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 400));

    // Evaluate layout geometries
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sidebar = document.querySelector('.ars-sidebar');
          const wrapper = document.getElementById('history-drawer-wrapper');
          const drawer = document.getElementById('history-drawer');
          const backdrop = document.getElementById('history-backdrop');
          const newChatBtn = document.getElementById('drawer-new-chat-btn');
          const searchInput = document.getElementById('history-search-input');
          const closeBtn = document.getElementById('close-history-btn');
          const isCollapsed = document.body.classList.contains('ars-collapsed');

          const sRect = sidebar ? sidebar.getBoundingClientRect() : null;
          const wRect = wrapper ? wrapper.getBoundingClientRect() : null;
          const dRect = drawer ? drawer.getBoundingClientRect() : null;
          const bRect = backdrop ? backdrop.getBoundingClientRect() : null;
          const nRect = newChatBtn ? newChatBtn.getBoundingClientRect() : null;
          const searchRect = searchInput ? searchInput.getBoundingClientRect() : null;
          const cRect = closeBtn ? closeBtn.getBoundingClientRect() : null;

          const sStyle = sidebar ? window.getComputedStyle(sidebar) : null;
          const wStyle = wrapper ? window.getComputedStyle(wrapper) : null;
          const dStyle = drawer ? window.getComputedStyle(drawer) : null;
          const bStyle = backdrop ? window.getComputedStyle(backdrop) : null;

          return {
            windowWidth: window.innerWidth,
            isCollapsed,
            sidebar: sRect ? { left: sRect.left, right: sRect.right, width: sRect.width, zIndex: sStyle?.zIndex } : null,
            wrapper: wRect ? { left: wRect.left, right: wRect.right, width: wRect.width, zIndex: wStyle?.zIndex } : null,
            drawer: dRect ? { left: dRect.left, right: dRect.right, width: dRect.width, zIndex: dStyle?.zIndex } : null,
            backdrop: bRect ? { left: bRect.left, right: bRect.right, width: bRect.width, zIndex: bStyle?.zIndex, opacity: bStyle?.opacity } : null,
            newChatBtn: nRect ? { left: nRect.left, right: nRect.right, width: nRect.width, height: nRect.height } : null,
            searchInput: searchRect ? { left: searchRect.left, right: searchRect.right, width: searchRect.width } : null,
            closeBtn: cRect ? { left: cRect.left, right: cRect.right, width: cRect.width } : null,
            isOpen: wrapper?.classList.contains('is-open')
          };
        })()
      `,
      returnByValue: true
    });

    const metrics = evalRes.result.value;
    const isDesktop = vp.w > 1024;

    console.log(`  State: ${metrics.isCollapsed ? 'Sidebar Collapsed' : 'Sidebar Expanded'} | Window Width: ${metrics.windowWidth}px`);
    if (metrics.sidebar) {
      console.log(`  Sidebar: Width=${metrics.sidebar.width.toFixed(1)}px, Left=${metrics.sidebar.left.toFixed(1)}px, Right=${metrics.sidebar.right.toFixed(1)}px, Z-Index=${metrics.sidebar.zIndex}`);
    }
    if (metrics.drawer) {
      console.log(`  Drawer:  Width=${metrics.drawer.width.toFixed(1)}px, Left=${metrics.drawer.left.toFixed(1)}px, Right=${metrics.drawer.right.toFixed(1)}px, Z-Index=${metrics.wrapper.zIndex}`);
    }
    if (metrics.backdrop) {
      console.log(`  Backdrop: Left=${metrics.backdrop.left.toFixed(1)}px, Z-Index=${metrics.backdrop.zIndex}`);
    }
    if (metrics.newChatBtn) {
      console.log(`  New Chat Btn: Width=${metrics.newChatBtn.width.toFixed(1)}px, Left=${metrics.newChatBtn.left.toFixed(1)}px, Visible=${metrics.newChatBtn.width > 200}`);
    }
    if (metrics.searchInput) {
      console.log(`  Search Box:   Width=${metrics.searchInput.width.toFixed(1)}px, Left=${metrics.searchInput.left.toFixed(1)}px, Visible=${metrics.searchInput.width > 200}`);
    }

    // Overlap validation
    let pass = true;
    let reason = '';

    if (isDesktop && metrics.sidebar) {
      const sidebarRight = metrics.sidebar.right;
      const drawerLeft = metrics.drawer.left;
      // Drawer should start at or immediately adjacent to sidebar right edge (within 1px rounding)
      const diff = Math.abs(drawerLeft - sidebarRight);
      if (diff > 2) {
        pass = false;
        reason = `Drawer left (${drawerLeft}px) does not match sidebar right (${sidebarRight}px), diff=${diff}px`;
      }
      if (drawerLeft < sidebarRight - 1) {
        pass = false;
        reason = `Drawer overlaps sidebar! Drawer left=${drawerLeft}px < Sidebar right=${sidebarRight}px`;
      }
    }

    if (!isDesktop && metrics.drawer) {
      if (metrics.drawer.left !== 0) {
        pass = false;
        reason = `On mobile/tablet, drawer left should be 0, got ${metrics.drawer.left}px`;
      }
    }

    if (metrics.newChatBtn && metrics.newChatBtn.width < 160) {
      pass = false;
      reason = `New chat button width is truncated: ${metrics.newChatBtn.width}px`;
    }

    console.log(`  Hasil: ${pass ? '✅ LULUS (Tiada Overlap / Susun Atur Tepat)' : '❌ GAGAL: ' + reason}`);
    testReport.push({ viewport: vp.label, pass, reason: reason || 'Sempurna' });

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotName = `fasa4eg13_${vp.name}.png`;
    const shotPath = path.join(ARTIFACT_DIR, shotName);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`  📸 Tangkapan Skrin Disimpan: ${shotName}`);
  }

  // INTERACTIVE TESTS: Close via Escape, Close via Backdrop, Close via X, and Focus Return
  console.log('\n--- UJIAN INTERAKSI: Escape, Backdrop, Butang X & Fokus ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 1000));

  // Test 1: Open and close via Escape
  const escapeTest = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toggleBtn = document.getElementById('toggle-history-btn');
        toggleBtn.focus();
        toggleBtn.click();
        const wrapper = document.getElementById('history-drawer-wrapper');
        const opened = wrapper.classList.contains('is-open');

        // Dispatch Escape key
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        const closed = !wrapper.classList.contains('is-open');
        const focusReturned = document.activeElement === toggleBtn;

        return { opened, closed, focusReturned };
      })()
    `,
    returnByValue: true
  });
  console.log('  Ujian Escape Key:', escapeTest.result.value);

  // Test 2: Open and close via Backdrop
  const backdropTest = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toggleBtn = document.getElementById('toggle-history-btn');
        toggleBtn.click();
        const wrapper = document.getElementById('history-drawer-wrapper');
        const backdrop = document.getElementById('history-backdrop');

        backdrop.click();
        const closed = !wrapper.classList.contains('is-open');
        return { closed };
      })()
    `,
    returnByValue: true
  });
  console.log('  Ujian Klik Backdrop:', backdropTest.result.value);

  // Test 3: Open and close via X button
  const closeBtnTest = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toggleBtn = document.getElementById('toggle-history-btn');
        toggleBtn.click();
        const wrapper = document.getElementById('history-drawer-wrapper');
        const closeBtn = document.getElementById('close-history-btn');

        closeBtn.click();
        const closed = !wrapper.classList.contains('is-open');
        return { closed };
      })()
    `,
    returnByValue: true
  });
  console.log('  Ujian Butang Tutup (X):', closeBtnTest.result.value);

  // Test 4: Dynamic sidebar collapse while drawer is open
  const dynamicToggleTest = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const toggleBtn = document.getElementById('toggle-history-btn');
        toggleBtn.click();
        const wrapper = document.getElementById('history-drawer-wrapper');
        const initialLeft = wrapper.getBoundingClientRect().left;

        // Toggle collapse
        document.body.classList.add('ars-collapsed');
        await new Promise(r => setTimeout(r, 350));
        const collapsedLeft = wrapper.getBoundingClientRect().left;

        // Toggle back to expanded
        document.body.classList.remove('ars-collapsed');
        await new Promise(r => setTimeout(r, 350));
        const expandedLeft = wrapper.getBoundingClientRect().left;

        return { initialLeft, collapsedLeft, expandedLeft };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('  Ujian Dinamik Tukar Sidebar (Drawer Terbuka):', dynamicToggleTest.result.value);

  ws.close();
  p.kill();

  console.log('\n================================================================');
  console.log('📊 RINGKASAN VERIFIKASI FASA 4E-G.1.3:');
  testReport.forEach(r => console.log(`   ${r.pass ? '✅' : '❌'} ${r.viewport}: ${r.reason}`));
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
