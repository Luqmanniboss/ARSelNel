const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Owner\\.gemini\\antigravity-ide\\brain\\d23aec0a-ad24-4569-924f-62e9b824666e';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9244',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  try {
    await sleep(2000);
    const listRes = await fetch('http://127.0.0.1:9244/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.addEventListener('open', res));

    let id = 1;
    const callbacks = new Map();
    const send = (method, params = {}) => {
      const currentId = id++;
      return new Promise((resolve) => {
        callbacks.set(currentId, resolve);
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    };

    const consoleErrors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');

    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (_) {}
      `
    });

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    };

    const captureScreenshot = async (filename) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const fullPath = path.join(artifactDir, filename);
      fs.writeFileSync(fullPath, Buffer.from(res.data, 'base64'));
      console.log(`[Screenshot saved]: ${filename}`);
      return fullPath;
    };

    // ================================================================
    // TEST 1: DASHBOARD AUDIT (DESKTOP 1920x1080)
    // ================================================================
    console.log('='.repeat(65));
    console.log('TEST 1: DASHBOARD AUDIT & NAVIGATION (DESKTOP 1920x1080)');
    console.log('='.repeat(65));

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3000/halaman_utama/code.html' });
    await sleep(2500);

    // 1. Hero Buttons Verification
    const heroButtons = await evaluate(`(() => {
      const hero = document.querySelector('.hero');
      const links = Array.from(hero.querySelectorAll('a'));
      return links.map(a => ({
        text: a.innerText.replace(/\\s+/g, ' ').trim(),
        href: a.getAttribute('href'),
        icon: a.querySelector('.material-symbols-outlined')?.textContent.trim()
      }));
    })()`);
    console.log('Hero Buttons:', JSON.stringify(heroButtons, null, 2));

    if (!heroButtons[0].href.includes('cellquest') || !heroButtons[0].text.includes('Mula Teroka Sel')) {
      throw new Error('Hero button 1 must navigate to cellquest with Mula Teroka Sel');
    }
    if (!heroButtons[1].href.includes('hab_permainan') || !heroButtons[1].text.includes('Mulakan Cabaran Sains') || heroButtons[1].icon !== 'sports_esports') {
      throw new Error('Hero button 2 must navigate to hab_permainan with Mulakan Cabaran Sains and sports_esports icon');
    }

    // 2. Manual Dashboard Card Verification
    const manualCard = await evaluate(`(() => {
      const card = document.querySelector('.manual-dashboard-card');
      if (!card) return null;
      const comp = window.getComputedStyle(card);
      return {
        href: card.getAttribute('href'),
        badge: card.querySelector('.uppercase')?.textContent.trim(),
        heading: card.querySelector('h3')?.textContent.trim(),
        btnText: card.querySelector('div.mt-6 span')?.innerText.replace(/\\s+/g, ' ').trim(),
        color: comp.color,
        backgroundImage: comp.backgroundImage,
        boxShadow: comp.boxShadow
      };
    })()`);
    console.log('Manual Dashboard Card:', JSON.stringify(manualCard, null, 2));

    if (!manualCard.href.includes('manual_penggunaan')) throw new Error('Manual card must link to manual_penggunaan');
    if (manualCard.badge !== 'PANDUAN INTERAKTIF') throw new Error('Manual badge must be PANDUAN INTERAKTIF');
    if (manualCard.heading !== 'Manual Penggunaan ARSelNel') throw new Error('Manual heading mismatch: ' + manualCard.heading);
    if (!manualCard.btnText.includes('Lihat Manual Penggunaan')) throw new Error('Button text must include Lihat Manual Penggunaan');
    if (manualCard.color !== 'rgb(255, 255, 255)') throw new Error('Manual card text color must be pure white');

    // 3. Module Card 1 (Terokai AR) Verification
    const moduleCard1 = await evaluate(`(() => {
      const card = document.querySelectorAll('.module-grid > div.module-card')[0];
      return {
        onclick: card.getAttribute('onclick'),
        title: card.querySelector('h3')?.textContent.trim(),
        actionText: card.querySelector('.font-headline.text-sm.font-bold')?.innerText.replace(/\\s+/g, ' ').trim()
      };
    })()`);
    console.log('Module Card 1 (Terokai AR):', JSON.stringify(moduleCard1, null, 2));

    if (!moduleCard1.onclick.includes('cellquest')) throw new Error('Module Card 1 must navigate to cellquest');
    if (!moduleCard1.actionText.includes('Teroka CellQuest')) throw new Error('Action text must be Teroka CellQuest');

    // 4. Cadangan Hari Ini (Mula Belajar Sekarang) Verification
    const recCard = await evaluate(`(() => {
      const card = document.querySelector('.recommendation-card');
      const btn = card.querySelector('.bg-primary');
      return {
        cardOnclick: card.getAttribute('onclick'),
        btnText: btn.innerText.replace(/\\s+/g, ' ').trim()
      };
    })()`);
    console.log('Cadangan Hari Ini:', JSON.stringify(recCard, null, 2));

    if (!recCard.cardOnclick.includes('nota_pembelajaran')) throw new Error('Card must navigate to nota_pembelajaran');
    if (!recCard.btnText.includes('Mula Belajar Sekarang')) throw new Error('Button text mismatch');

    // 5. Sidebar Navigation Order & Icons Verification
    const sidebarItems = await evaluate(`(() => {
      const nav = document.querySelector('.ars-nav');
      return Array.from(nav.querySelectorAll('a')).map(a => ({
        navId: a.getAttribute('data-nav-id'),
        title: a.getAttribute('title'),
        icon: a.querySelector('.material-symbols-outlined')?.textContent.trim(),
        href: a.getAttribute('href')
      }));
    })()`);
    console.log('Sidebar Items Order:', JSON.stringify(sidebarItems, null, 2));

    const expectedOrder = [
      { navId: 'home', title: 'Dashboard', icon: 'home' },
      { navId: 'cellquest', title: 'CellQuest', icon: 'view_in_ar' },
      { navId: 'notes', title: 'Nota', icon: 'menu_book' },
      { navId: 'videos', title: 'Video', icon: 'play_circle' },
      { navId: 'ai', title: 'Tanya AI', icon: 'smart_toy' },
      { navId: 'games', title: 'Kuiz & Permainan', icon: 'sports_esports' }
    ];

    expectedOrder.forEach((exp, idx) => {
      const actual = sidebarItems[idx];
      if (!actual) throw new Error(`Missing sidebar item ${idx}`);
      if (actual.navId !== exp.navId || actual.title !== exp.title || actual.icon !== exp.icon) {
        throw new Error(`Sidebar index ${idx} mismatch. Expected ${JSON.stringify(exp)}, got ${JSON.stringify(actual)}`);
      }
    });

    await captureScreenshot('dashboard_desktop_1920.png');

    // ================================================================
    // TEST 2: RESPONSIVE VIEWS (1366x768 & 390x844)
    // ================================================================
    console.log('='.repeat(65));
    console.log('TEST 2: RESPONSIVE VIEWS (LAPTOP 1366x768 & MOBILE 390x844)');
    console.log('='.repeat(65));

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(500);
    await captureScreenshot('dashboard_laptop_1366.png');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);
    await captureScreenshot('dashboard_mobile_390.png');

    // ================================================================
    // TEST 3: INTERACTIVE MANUAL (7 STEPS)
    // ================================================================
    console.log('='.repeat(65));
    console.log('TEST 3: INTERACTIVE MANUAL (7 STEPS A - G)');
    console.log('='.repeat(65));

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:3000/manual_penggunaan/code.html' });
    await sleep(2000);

    const manualHeader = await evaluate(`(() => {
      return {
        label: document.getElementById('manual-step-label')?.textContent.trim(),
        kicker: document.querySelector('.manual-kicker')?.textContent.trim(),
        dotsCount: document.querySelectorAll('.manual-step-dot').length
      };
    })()`);
    console.log('Manual Header & Step Count:', JSON.stringify(manualHeader, null, 2));

    if (manualHeader.dotsCount !== 7) throw new Error('Manual must have 7 steps, got: ' + manualHeader.dotsCount);

    // Step through each of the 7 steps
    for (let s = 0; s < 7; s++) {
      const stepInfo = await evaluate(`(() => {
        const heading = document.getElementById('manual-step-heading')?.textContent.trim();
        const next = document.getElementById('manual-next');
        const finish = document.getElementById('manual-finish');
        return {
          heading,
          nextHidden: next ? next.hidden : true,
          finishHidden: finish ? finish.hidden : true
        };
      })()`);
      console.log(`Step ${s + 1} of 7: "${stepInfo.heading}"`);

      if (s < 6) {
        if (stepInfo.nextHidden) throw new Error(`Next button should be visible on step ${s + 1}`);
        await evaluate(`document.getElementById('manual-next').click()`);
        await sleep(300);
      } else {
        if (!stepInfo.nextHidden) throw new Error('Next button should be hidden on final step');
        if (stepInfo.finishHidden) throw new Error('Finish button should be visible on final step');
      }
    }

    await captureScreenshot('manual_step7_troubleshooting.png');

    // ================================================================
    // TEST 4: CELLQUEST HEADER & SIDEBAR VERIFICATION
    // ================================================================
    console.log('='.repeat(65));
    console.log('TEST 4: CELLQUEST NO JOYSTICK EMOJI CHECK');
    console.log('='.repeat(65));

    await send('Page.navigate', { url: 'http://localhost:3000/cellquest/code.html' });
    await sleep(2000);

    const cqCheck = await evaluate(`(() => {
      const h1 = document.querySelector('.cq-hero h1')?.innerText.replace(/\\s+/g, ' ').trim();
      const topbarTitle = document.querySelector('.ars-page-title')?.textContent.trim();
      const activeLink = document.querySelector('.ars-nav a[aria-current="page"]');
      return {
        h1,
        topbarTitle,
        sidebarLabel: activeLink ? activeLink.getAttribute('title') : null,
        sidebarIcon: activeLink ? activeLink.querySelector('.material-symbols-outlined')?.textContent.trim() : null
      };
    })()`);
    console.log('CellQuest Headings & Icons:', JSON.stringify(cqCheck, null, 2));

    if (cqCheck.h1.includes('🎮')) throw new Error('CellQuest H1 still contains gamepad emoji!');
    if (cqCheck.topbarTitle.includes('🎮')) throw new Error('Topbar title still contains gamepad emoji!');
    if (cqCheck.sidebarLabel !== 'CellQuest') throw new Error('Sidebar label must be CellQuest');
    if (cqCheck.sidebarIcon !== 'view_in_ar') throw new Error('Sidebar icon must be view_in_ar');

    await captureScreenshot('cellquest_clean_header.png');

    console.log('='.repeat(65));
    console.log('Console Errors/Warnings Count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
    console.log('>>> ALL DASHBOARD & NAVIGATION TESTS PASSED 100%! <<<');
    console.log('='.repeat(65));

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
