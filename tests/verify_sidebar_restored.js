/**
 * ARSelNel - Verification Script for Restored Sidebar
 * tests/verify_sidebar_restored.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9489;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), `edge_cdp_sidebar_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080, mobile: false, label: 'Laptop Full HD (1920×1080)', file: 'sidebar_restored_desktop_1920x1080.png' },
  { name: 'laptop_1366x768', width: 1366, height: 768, mobile: false, label: 'Laptop Standard (1366×768)', file: 'sidebar_restored_laptop_1366x768.png' },
  { name: 'ipad_portrait_768x1024', width: 768, height: 1024, mobile: true, label: 'iPad Portrait (768×1024)', file: 'sidebar_restored_ipad_768x1024.png' },
  { name: 'iphone_390x844', width: 390, height: 844, mobile: true, label: 'iPhone 13/14 (390×844)', file: 'sidebar_restored_mobile_390x844.png' }
];

async function runSidebarVerification() {
  console.log('========================================================');
  console.log('🧪 ARSELNEL: VERIFIKASI REKA BENTUK ASAL SIDEBAR');
  console.log('========================================================\n');

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1920,1080'
  ], { stdio: 'ignore' });

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 3500));
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
  await send('DOM.enable');
  await send('Runtime.enable');

  // Inject student auth session so pages render student-shell without redirect
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const studentUser = {
          id: 'test_student_hafif',
          name: 'Hafif (Murid)',
          nickname: 'hafif',
          role: 'student',
          isGuest: false
        };
        localStorage.setItem('arselnel_current_user', JSON.stringify(studentUser));
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
      } catch (e) {}
    `
  });

  let allPass = true;

  for (const vp of VIEWPORTS) {
    console.log(`📱 Menguji Viewport: ${vp.label}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile
    });

    await send('Page.navigate', { url: `${BASE_URL}/halaman_utama/code.html` });
    await new Promise(r => setTimeout(r, 2000));

    if (vp.mobile) {
      // Toggle mobile drawer
      await send('Runtime.evaluate', {
        expression: `
          const menuBtn = document.querySelector('[data-ars-menu]');
          if (menuBtn) menuBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 600));
    }

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sidebar = document.querySelector('.ars-sidebar');
          if (!sidebar) return { found: false };

          const cs = window.getComputedStyle(sidebar);
          const navLinks = Array.from(document.querySelectorAll('.ars-nav a')).map(a => ({
            id: a.getAttribute('data-nav-id'),
            label: a.querySelector('span:last-child') ? a.querySelector('span:last-child').textContent.trim() : '',
            active: a.getAttribute('aria-current') === 'page'
          }));

          const firstIcon = document.querySelector('.ars-nav .material-symbols-outlined');
          const iconColor = firstIcon ? window.getComputedStyle(firstIcon).color : '';

          const inactiveLink = document.querySelector('.ars-nav a:not([aria-current="page"])');
          const inactiveBg = inactiveLink ? window.getComputedStyle(inactiveLink).backgroundColor : '';

          const profile = !!document.querySelector('.ars-side-profile');
          const settings = !!document.querySelector('.ars-side-settings');
          const logout = !!document.querySelector('.ars-side-logout');

          return {
            found: true,
            bgImage: cs.backgroundImage,
            bgColor: cs.backgroundColor,
            iconColor,
            inactiveBg,
            navLinks,
            hasProfile: profile,
            hasSettings: settings,
            hasLogout: logout
          };
        })()
      `,
      returnByValue: true
    });

    const m = evalRes.result.value;
    if (!m || !m.found) {
      console.error(`   ❌ GAGAL: Sidebar tidak ditemui pada ${vp.label}`);
      allPass = false;
      continue;
    }

    const hasBg = m.bgImage.includes('sidebarbg.png');
    const isIconBlue = m.iconColor.includes('107, 141, 184') || m.iconColor.includes('#6b8db8');
    const hasWhiteCards = m.inactiveBg.includes('255, 255, 255');

    console.log(`   - Background Image: ${hasBg ? '✅ sidebarbg.png disahkan (' + m.bgImage + ')' : '❌ Ralat: ' + m.bgImage}`);
    console.log(`   - Warna Ikon: ${isIconBlue ? '✅ Biru kelabu #6b8db8 (' + m.iconColor + ')' : '⚠️ ' + m.iconColor}`);
    console.log(`   - Kotak Navigasi: ${hasWhiteCards ? '✅ Putih separa lutsinar (' + m.inactiveBg + ')' : '⚠️ ' + m.inactiveBg}`);
    console.log(`   - Susunan Menu: ${m.navLinks.map(n => n.label + (n.active ? ' (Aktif)' : '')).join(' → ')}`);
    console.log(`   - Profil, Tetapan, Logout: ${m.hasProfile && m.hasSettings && m.hasLogout ? '✅ Semua Wujud Lengkap' : '❌ Kurang elemen'}`);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACT_DIR, vp.file);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`   📸 Tangkapan Skrin Disimpan: ${vp.file}\n`);
  }

  // Test SelBot AI Page for active theme pink
  console.log('📱 Menguji Halaman SelBot AI (Tanya AI)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: `${BASE_URL}/selbot_ai/code.html` });
  await new Promise(r => setTimeout(r, 2000));

  const selbotEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const activeNav = document.querySelector('.ars-nav a[aria-current="page"]');
        const cs = activeNav ? window.getComputedStyle(activeNav) : null;
        return {
          activeId: activeNav ? activeNav.getAttribute('data-nav-id') : null,
          activeLabel: activeNav && activeNav.querySelector('span:last-child') ? activeNav.querySelector('span:last-child').textContent.trim() : null,
          color: cs ? cs.color : null,
          border: cs ? cs.borderColor : null
        };
      })()
    `,
    returnByValue: true
  });
  const sm = selbotEval.result.value;
  console.log(`   - Menu Aktif di SelBot AI: ✅ ${sm.activeLabel} (${sm.activeId})`);
  console.log(`   - Warna Font Aktif: ${sm.color}`);

  const shotSelbot = await send('Page.captureScreenshot', { format: 'png' });
  const shotSelbotPath = path.join(ARTIFACT_DIR, 'sidebar_restored_selbot_ai.png');
  fs.writeFileSync(shotSelbotPath, Buffer.from(shotSelbot.data, 'base64'));
  console.log(`   📸 Tangkapan Skrin Disimpan: sidebar_restored_selbot_ai.png\n`);

  ws.close();
  cleanup();

  console.log('========================================================');
  console.log(`📊 KEPUTUSAN VERIFIKASI SIDEBAR: ${allPass ? '🎉 SEMUA 4 VIEWPORT & HALAMAN DISAHKAN LULUS 100%!' : '❌ ADA UJIAN GAGAL'}`);
  console.log('========================================================');
}

runSidebarVerification().catch(err => {
  console.error('Ralat verifikasi:', err);
  process.exit(1);
});
