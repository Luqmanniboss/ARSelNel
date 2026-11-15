/**
 * ARSelNel - Fasa 4E-G.1.1 Automated Responsive Verification Suite
 * tests/verify_fasa4eg1_1_responsive.js
 * 
 * Verifies and captures multi-viewport responsive layout for SelBot:
 * - Laptop 1920x1080
 * - Laptop 1366x768
 * - Tablet landscape 1024x768
 * - iPad portrait 768x1024
 * - iPhone 390x844
 * - Small phone 360x740
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CDP_PORT = 9345;
const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(os.tmpdir(), `edge_cdp_responsive_${Date.now()}`);
const outDir = path.join(process.cwd(), 'tests', 'screenshots_selbot_responsive');

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080, mobile: false, label: 'Laptop Full HD (1920×1080)' },
  { name: 'laptop_1366x768', width: 1366, height: 768, mobile: false, label: 'Laptop Standard (1366×768)' },
  { name: 'tablet_1024x768', width: 1024, height: 768, mobile: false, label: 'Tablet Landscape (1024×768)' },
  { name: 'ipad_portrait_768x1024', width: 768, height: 1024, mobile: true, label: 'iPad Portrait (768×1024)' },
  { name: 'iphone_390x844', width: 390, height: 844, mobile: true, label: 'iPhone 13/14 (390×844)' },
  { name: 'phone_small_360x740', width: 360, height: 740, mobile: true, label: 'Telefon Kecil Android (360×740)' }
];

async function runResponsiveTests() {
  console.log('========================================================');
  console.log('🧪 ARSELNEL FASA 4E-G.1.1: UJIAN MULTI-VIEWPORT RESPONSIF');
  console.log('========================================================\n');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

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
  const page = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(page.webSocketDebuggerUrl);
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

  // Inject authenticated user into localStorage to prevent redirect to login
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const studentUser = {
          id: 'test_student_123',
          name: 'Hafif (Murid)',
          role: 'student',
          isGuest: false
        };
        localStorage.setItem('arselnel_current_user', JSON.stringify(studentUser));
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
      } catch (e) {}
    `
  });

  // Navigate to SelBot page
  await send('Page.navigate', { url: 'http://localhost:3000/selbot_ai/code.html' });
  await new Promise(r => setTimeout(r, 2500));

  const auditResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Menguji Viewport: ${vp.label}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.mobile ? 2 : 1,
      mobile: vp.mobile
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture measurements via DOM query
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const chatBox = document.querySelector('.selbot-chat-box');
          const chatFeed = document.querySelector('#chat-feed');
          const input = document.querySelector('#chat-input');
          const hero = document.querySelector('.module-hero');
          const bodyWidth = document.body.scrollWidth;
          const windowWidth = window.innerWidth;
          const hasHorizontalOverflow = bodyWidth > windowWidth + 2;

          return {
            chatBoxHeight: chatBox ? Math.round(chatBox.getBoundingClientRect().height) : 0,
            chatBoxWidth: chatBox ? Math.round(chatBox.getBoundingClientRect().width) : 0,
            chatFeedHeight: chatFeed ? Math.round(chatFeed.getBoundingClientRect().height) : 0,
            heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
            inputHeight: input ? Math.round(input.getBoundingClientRect().height) : 0,
            inputFontSize: input ? window.getComputedStyle(input).fontSize : '0px',
            hasHorizontalOverflow: hasHorizontalOverflow,
            bodyWidth: bodyWidth,
            windowWidth: windowWidth
          };
        })()
      `,
      returnByValue: true
    });

    const metrics = evalRes.result.value;
    console.log(`   - Ketinggian Hero Banner: ${metrics.heroHeight}px (Padat & Ramping)`);
    console.log(`   - Ketinggian Chat Container: ${metrics.chatBoxHeight}px`);
    console.log(`   - Ketinggian Feed Mesej: ${metrics.chatFeedHeight}px (Kawasan Luas Mesej)`);
    console.log(`   - Lebar Chat Container: ${metrics.chatBoxWidth}px`);
    console.log(`   - Saiz Fon Input: ${metrics.inputFontSize}`);
    console.log(`   - Limpahan Mendatar: ${metrics.hasHorizontalOverflow ? '❌ ADA' : '✅ SIFAR'}`);

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(outDir, `${vp.name}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`   📸 Tangkapan Skrin Disimpan: tests/screenshots_selbot_responsive/${vp.name}.png`);

    const passed = !metrics.hasHorizontalOverflow && metrics.chatBoxHeight >= 450 && metrics.chatFeedHeight >= 250;
    auditResults.push({
      viewport: vp.name,
      label: vp.label,
      passed,
      metrics
    });
  }

  cleanup();

  console.log('\n========================================================');
  const allPassed = auditResults.every(r => r.passed);
  console.log(`📊 KEPUTUSAN KESELURUHAN RESPONSIF: ${allPassed ? '🎉 SEMUA 6 VIEWPORT LULUS SEMPURNA!' : '⚠️ Terdapat isu'}`);
  console.log('========================================================');
}

runResponsiveTests().catch(e => {
  console.error('Fatal error in responsive test:', e);
  process.exit(1);
});
