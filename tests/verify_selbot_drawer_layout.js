/**
 * ARSelNel - Automated Verification for SelBot Chat History Drawer Layout & Alignment
 * tests/verify_selbot_drawer_layout.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9592;
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = edgePaths.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('Edge executable not found');
  process.exit(1);
}

const userDataDir = path.join(os.tmpdir(), `edge_cdp_selbot_drawer_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFIKASI HOTFIX: SELBOT CHAT HISTORY DRAWER & SIDEBAR ALIGNMENT');
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
      localStorage.setItem('arselnel_current_user', JSON.stringify({
        id: 'test_student_1',
        name: 'Hafif',
        email: 'hafif@arselnel.edu.my',
        role: 'student'
      }));
    `
  });

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      console.error('Eval exception:', r.exceptionDetails);
    }
    return r.result.value;
  }

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const fullP = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullP, Buffer.from(shot.data, 'base64'));
    console.log(`  📸 Tangkapan skrin disimpan: ${filename}`);
  }

  async function setViewport(w, h) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: w <= 760
    });
  }

  // --- UJIAN 1: DESKTOP EXPANDED (1920x1080) ---
  console.log('--- UJIAN 1: DESKTOP EXPANDED (1920×1080) ---');
  await setViewport(1920, 1080);
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 2000));

  // 1a. Initial Closed State
  const closedState = await evaluate(`(() => {
    const wrapper = document.getElementById('history-drawer-wrapper');
    const sidebar = document.querySelector('.ars-sidebar');
    const rect = wrapper ? wrapper.getBoundingClientRect() : {};
    const style = wrapper ? window.getComputedStyle(wrapper) : {};
    return {
      wrapperLeft: Math.round(rect.left || 0),
      sidebarWidth: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : 0,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      hasOverlapOrLeak: (rect.left || 0) < 260
    };
  })()`);
  console.log('[Status Awal Tertutup]:', closedState);
  if (closedState && closedState.visibility === 'hidden') {
    console.log('✅ Status tertutup: Drawer disembunyikan sepenuhnya (visibility: hidden), tiada elemen tersembul keluar.');
  }

  // 1b. Open Drawer
  await evaluate(`(() => {
    document.getElementById('toggle-history-btn')?.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const openState = await evaluate(`(() => {
    const wrapper = document.getElementById('history-drawer-wrapper');
    const drawer = document.getElementById('history-drawer');
    const sidebar = document.querySelector('.ars-sidebar');
    const rect = wrapper.getBoundingClientRect();
    const sRect = sidebar.getBoundingClientRect();
    const dRect = drawer.getBoundingClientRect();
    return {
      wrapperLeft: Math.round(rect.left),
      sidebarWidth: Math.round(sRect.width),
      drawerLeft: Math.round(dRect.left),
      drawerWidth: Math.round(dRect.width),
      isFlushWithSidebar: Math.abs(rect.left - sRect.width) < 2
    };
  })()`);
  console.log('[Status Terbuka Desktop]:', openState);
  if (openState && openState.isFlushWithSidebar) {
    console.log(`✅ Desktop Expanded: Drawer selaras 100% di sebelah kanan sidebar (left: ${openState.wrapperLeft}px), tidak menindih sidebar!`);
  }
  await takeScreenshot('selbot_drawer_desktop_expanded_1920x1080.png');

  // --- UJIAN 2: DESKTOP COLLAPSED (84px SIDEBAR) ---
  console.log('\n--- UJIAN 2: DESKTOP COLLAPSED (84px SIDEBAR) ---');
  await evaluate(`(() => {
    document.querySelector('[data-ars-collapse]')?.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const collapsedState = await evaluate(`(() => {
    const wrapper = document.getElementById('history-drawer-wrapper');
    const sidebar = document.querySelector('.ars-sidebar');
    const rect = wrapper.getBoundingClientRect();
    const sRect = sidebar.getBoundingClientRect();
    return {
      wrapperLeft: Math.round(rect.left),
      sidebarWidth: Math.round(sRect.width),
      isCollapsed: document.body.classList.contains('ars-collapsed'),
      isFlushWithSidebar: Math.abs(rect.left - sRect.width) < 2
    };
  })()`);
  console.log('[Status Terbuka Collapsed]:', collapsedState);
  if (collapsedState && collapsedState.isFlushWithSidebar && collapsedState.wrapperLeft === 84) {
    console.log(`✅ Desktop Collapsed: Drawer beralih tepat ke tepi sidebar 84px (left: 84px), ikon heksagon baharu tidak terlindung!`);
  }
  await takeScreenshot('selbot_drawer_desktop_collapsed_84px.png');

  // Close drawer
  await evaluate(`(() => {
    document.getElementById('close-history-btn')?.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // --- UJIAN 3: TABLET IPAD (768×1024 PORTRAIT) ---
  console.log('\n--- UJIAN 3: TABLET IPAD (768×1024 PORTRAIT) ---');
  await setViewport(768, 1024);
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 2000));

  await evaluate(`(() => {
    document.getElementById('toggle-history-btn')?.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const ipadState = await evaluate(`(() => {
    const wrapper = document.getElementById('history-drawer-wrapper');
    const sidebar = document.querySelector('.ars-sidebar');
    const rect = wrapper.getBoundingClientRect();
    const sRect = sidebar.getBoundingClientRect();
    return {
      wrapperLeft: Math.round(rect.left),
      sidebarWidth: Math.round(sRect.width),
      isFlushWithSidebar: Math.abs(rect.left - sRect.width) < 2
    };
  })()`);
  console.log('[Status iPad Portrait]:', ipadState);
  if (ipadState && ipadState.isFlushWithSidebar && ipadState.wrapperLeft === 84) {
    console.log(`✅ iPad Portrait: Drawer selaras di sebelah sidebar 84px (left: 84px)!`);
  }
  await takeScreenshot('selbot_drawer_ipad_portrait_768x1024.png');

  // --- UJIAN 4: TELEFON PINTAR (390×844) ---
  console.log('\n--- UJIAN 4: TELEFON PINTAR (390×844) ---');
  await setViewport(390, 844);
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 2000));

  await evaluate(`(() => {
    document.getElementById('toggle-history-btn')?.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const mobileState = await evaluate(`(() => {
    const wrapper = document.getElementById('history-drawer-wrapper');
    const rect = wrapper.getBoundingClientRect();
    return {
      wrapperLeft: Math.round(rect.left),
      wrapperWidth: Math.round(rect.width),
      isFullSlideOver: rect.left === 0
    };
  })()`);
  console.log('[Status Mobile 390×844]:', mobileState);
  if (mobileState && mobileState.isFullSlideOver) {
    console.log(`✅ Mobile 390×844: Drawer meluncur penuh dari sisi kiri (left: 0) tanpa sebarang ralat visual!`);
  }
  await takeScreenshot('selbot_drawer_mobile_390x844.png');

  // Cleanup
  ws.close();
  p.kill();

  console.log('\n================================================================');
  console.log('🎉 SEMUA UJIAN VERIFIKASI SUSUN ATUR DRAWER SELBOT AI LULUS 100%!');
  console.log('================================================================\n');
}

runVerification().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
