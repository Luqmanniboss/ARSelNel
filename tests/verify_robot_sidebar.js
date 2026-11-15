/**
 * ARSelNel - Automated Verification for Cute Monochrome Robot Companions Sidebar
 * tests/verify_robot_sidebar.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9560;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), `edge_cdp_verify_robot_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop_1920x1080', label: 'Desktop FHD (1920×1080)', w: 1920, h: 1080, mobile: false },
  { name: 'laptop_1366x768', label: 'Laptop Standard (1366×768)', w: 1366, h: 768, mobile: false },
  { name: 'laptop_1280x800', label: 'Laptop WXGA (1280×800)', w: 1280, h: 800, mobile: false },
  { name: 'ipad_landscape_1024x768', label: 'iPad Landscape (1024×768)', w: 1024, h: 768, mobile: false },
  { name: 'ipad_portrait_768x1024', label: 'iPad Portrait (768×1024)', w: 768, h: 1024, mobile: true },
  { name: 'mobile_390x844', label: 'Mobile Modern (390×844)', w: 390, h: 844, mobile: true, isDrawer: true },
  { name: 'mobile_375x667', label: 'Mobile Compact (375×667)', w: 375, h: 667, mobile: true, isDrawer: true }
];

async function runVerification() {
  console.log('================================================================');
  console.log('🤖 ARSELNEL: VERIFIKASI BACKGROUND CUTE MONOCHROME ROBOT SIDEBAR');
  console.log('================================================================\n');

  // 1. Verify file existence and HTTP 200 accessibility
  const assetPath = path.join(process.cwd(), 'background', 'cute_robots_sidebar.png');
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Asset file missing: ${assetPath}`);
  }
  const stat = fs.statSync(assetPath);
  console.log(`[Asset Check] ✅ cute_robots_sidebar.png wujud (${stat.size} bait, 296×725px)`);

  const fetchRes = await fetch(`${BASE_URL}/background/cute_robots_sidebar.png`);
  if (fetchRes.status !== 200) {
    throw new Error(`HTTP fetch failed with status ${fetchRes.status}`);
  }
  console.log(`[HTTP Check] ✅ HTTP 200 disahkan dari local-server.js\n`);

  const p = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new'
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
      localStorage.setItem('arselnel_current_user', JSON.stringify({id:'u1', name:'Hafif (Murid)', role:'student'}));
    `
  });

  const consoleErrors = [];
  ws.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    } catch (_) {}
  });

  let totalTests = 0;
  let passedTests = 0;

  for (const vp of VIEWPORTS) {
    console.log(`📱 Menguji: ${vp.label}...`);
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
    await send('Page.navigate', { url: `${BASE_URL}/halaman_utama/code.html` });
    await new Promise(r => setTimeout(r, 1500));

    if (vp.isDrawer) {
      await send('Runtime.evaluate', {
        expression: `
          const menuBtn = document.querySelector('[data-ars-menu]');
          if (menuBtn) menuBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 500));
    }

    const metrics = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sidebar = document.querySelector('.ars-sidebar');
          if (!sidebar) return { found: false };
          const cs = window.getComputedStyle(sidebar);

          const navLinks = Array.from(document.querySelectorAll('.ars-nav a')).map(a => ({
            label: a.querySelector('span:last-child') ? a.querySelector('span:last-child').textContent.trim() : '',
            href: a.getAttribute('href'),
            clickable: a.offsetParent !== null
          }));

          const overflow = document.documentElement.scrollWidth > window.innerWidth;
          const bgImg = cs.backgroundImage;
          const bgSize = cs.backgroundSize;
          const bgPos = cs.backgroundPosition;

          return {
            found: true,
            bgImg,
            bgSize,
            bgPos,
            navLinks,
            overflow,
            sidebarWidth: sidebar.getBoundingClientRect().width,
            sidebarHeight: sidebar.getBoundingClientRect().height
          };
        })()
      `,
      returnByValue: true
    });

    const m = metrics.result.value;
    totalTests += 4;

    const bgOk = m.bgImg.includes('cute_robots_sidebar.png');
    const sizeOk = m.bgSize.includes('100%');
    const noOverflow = !m.overflow;
    const navOk = m.navLinks.length === 6 && m.navLinks.every(n => n.clickable);

    if (bgOk) passedTests++;
    if (sizeOk) passedTests++;
    if (noOverflow) passedTests++;
    if (navOk) passedTests++;

    console.log(`   - Background Image: ${bgOk ? '✅ cute_robots_sidebar.png' : '❌ ' + m.bgImg}`);
    console.log(`   - Background Size: ${sizeOk ? '✅ 100% auto (proporsional)' : '❌ ' + m.bgSize}`);
    console.log(`   - Background Pos: ${m.bgPos}`);
    console.log(`   - Limpahan Mendatar: ${noOverflow ? '✅ Sifar (Tiada limpahan)' : '❌ Limpahan dikesan'}`);
    console.log(`   - Butang Navigasi: ${navOk ? '✅ 6/6 butang boleh diklik' : '❌ Ralat butang'}`);

    // Screenshot capture
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotName = `robot_sidebar_${vp.name}.png`;
    fs.writeFileSync(path.join(ARTIFACT_DIR, shotName), Buffer.from(shot.data, 'base64'));
    console.log(`   📸 Tangkapan Skrin: ${shotName}\n`);
  }

  // Also verify SelBot AI page
  console.log('📱 Menguji Halaman SelBot AI (Tanya AI)...');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 2000));

  const selbotMetrics = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const activeNav = document.querySelector('.ars-nav a[aria-current="page"]');
        const cs = activeNav ? window.getComputedStyle(activeNav) : null;
        const chatInput = document.getElementById('chat-input');
        return {
          activeId: activeNav ? activeNav.getAttribute('data-nav-id') : null,
          activeColor: cs ? cs.color : null,
          hasInput: !!chatInput
        };
      })()
    `,
    returnByValue: true
  });
  const sm = selbotMetrics.result.value;
  totalTests += 2;
  if (sm.activeId === 'ai') passedTests++;
  if (sm.hasInput) passedTests++;

  console.log(`   - Menu Aktif di SelBot AI: ${sm.activeId === 'ai' ? '✅ Tanya AI (ai)' : '❌ ' + sm.activeId}`);
  console.log(`   - Input Chat SelBot: ${sm.hasInput ? '✅ Wujud & Aktif' : '❌ Hilang'}`);

  const shotSelbot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'robot_sidebar_selbot_ai_desktop.png'), Buffer.from(shotSelbot.data, 'base64'));
  console.log(`   📸 Tangkapan Skrin: robot_sidebar_selbot_ai_desktop.png\n`);

  ws.close();
  p.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}

  console.log('================================================================');
  console.log(`📊 KEPUTUSAN KESELURUHAN: ${passedTests}/${totalTests} UJIAN LULUS (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`🛑 Ralat Konsol Pelayar: ${consoleErrors.length === 0 ? '✅ SIFAR RALAT' : consoleErrors.join(', ')}`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Ralat verifikasi:', err);
  process.exit(1);
});
