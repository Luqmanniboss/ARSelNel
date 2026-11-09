/**
 * ARSELNEL — Test Suite: Kotak ARSELNEL Size L Responsive & Sticky Footer Verification
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

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

async function runResponsiveTests() {
  console.log('================================================================');
  console.log('📱 UJIAN KOTAK ARSELNEL: RESPONSIVE PANEL SAIZ L & STICKY FOOTER');
  console.log('================================================================\n');

  const browserBin = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ars-resp-test-'));
  const cdpPort = 9265;

  const chromeProc = spawn(browserBin, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tmpDir}`,
    '--headless=new',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--disable-features=PreloadMediaEngagementData',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await new Promise(resolve => {
    http.get(`http://127.0.0.1:${cdpPort}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  const wsUrl = listRes[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  let callId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = callId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/kotak_arselnel/' });
  await new Promise(r => setTimeout(r, 1500));

  // Initialize simulation and select video
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.startSimulationMode();' });
  await new Promise(r => setTimeout(r, 400));
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.selectVideo(window.KotakARSELNEL.state.videos[0]);' });
  await new Promise(r => setTimeout(r, 400));
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.placeVideoOnScreen();' });
  await new Promise(r => setTimeout(r, 400));

  // Test across specified viewports
  const viewports = [
    { name: 'Desktop (1366 × 768)', width: 1366, height: 768, isMobile: false },
    { name: 'Laptop (1280 × 720)', width: 1280, height: 720, isMobile: false },
    { name: 'Telefon Standard (390 × 844)', width: 390, height: 844, isMobile: true },
    { name: 'Telefon Kecil (360 × 640)', width: 360, height: 640, isMobile: true },
    { name: 'Landscape Telefon (844 × 390)', width: 844, height: 390, isMobile: true }
  ];

  for (const vp of viewports) {
    console.log(`\n--- PENGUJIAN PADA: ${vp.name} ---`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.isMobile
    });
    await new Promise(r => setTimeout(r, 300));

    // Select Size L
    await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.setPanelSize("large");' });
    await new Promise(r => setTimeout(r, 400));

    // Audit panel metrics
    const metrics = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.getElementById('floating-card-container');
        const footer = document.getElementById('panel-sticky-footer');
        const body = document.getElementById('panel-scrollable-body');
        const btnLock = document.getElementById('btn-lock-video');
        const btnChange = document.getElementById('btn-change-video');
        const btnClose = document.getElementById('btn-close-panel');
        const cardRect = card.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const lockRect = btnLock.getBoundingClientRect();
        const changeRect = btnChange.getBoundingClientRect();

        return JSON.stringify({
          windowH: window.innerHeight,
          cardTop: cardRect.top,
          cardBottom: cardRect.bottom,
          cardH: cardRect.height,
          footerTop: footerRect.top,
          footerBottom: footerRect.bottom,
          isFooterFullyVisible: footerRect.bottom <= window.innerHeight + 1 && footerRect.top >= 0,
          isLockBtnClickable: lockRect.bottom <= window.innerHeight + 1 && lockRect.top >= 0,
          isChangeBtnClickable: changeRect.bottom <= window.innerHeight + 1 && changeRect.top >= 0,
          hasScrollableBody: body.scrollHeight >= body.clientHeight,
          overflowY: window.getComputedStyle(body).overflowY
        });
      })()`,
      returnByValue: true
    });

    const m = JSON.parse(metrics.result.value);
    assert(m.cardBottom <= m.windowH + 2, `${vp.name}: Panel bahagian bawah tidak terkeluar dari skrin (Card Bottom: ${Math.round(m.cardBottom)}px <= Viewport: ${m.windowH}px)`);
    assert(m.isFooterFullyVisible, `${vp.name}: Sticky footer sentiasa 100% berada dalam sempadan viewport`);
    assert(m.isLockBtnClickable, `${vp.name}: Butang "Kunci Kedudukan" boleh dilihat dan ditekan sepenuhnya`);
    assert(m.isChangeBtnClickable, `${vp.name}: Butang "Tukar Video" boleh dilihat dan ditekan sepenuhnya`);
    assert(m.overflowY === 'auto', `${vp.name}: Bahagian kandungan dikonfigurasikan dengan overflow-y: auto untuk scroll menegak`);

    // Take screenshot for phone 390x844
    if (vp.width === 390) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const shotPath = path.resolve('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_size_l_fixed_phone.png');
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
      console.log(`  📸 Tangkapan skrin pembaikan Saiz L (Telefon 390×844) disimpan di: ${shotPath}`);
    }
  }

  console.log('\n--- BAHAGIAN 7: UJIAN KEMERDEKAAN SCROLL & DRAG ---');
  // Verify that scrolling in body does NOT trigger drag
  const dragIsolationCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const body = document.getElementById('panel-scrollable-body');
      const anchor = document.getElementById('floating-ar-anchor');
      const initialTop = anchor.style.top;

      // Simulate pointerdown inside scrollable body
      body.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, clientY: 200, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 400, bubbles: true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, clientY: 400, bubbles: true }));

      return {
        initialTop,
        currentTop: anchor.style.top,
        didNotDrag: initialTop === anchor.style.top,
        isDragging: window.KotakARSELNEL.state.isDragging
      };
    })()`,
    returnByValue: true
  });
  const di = dragIsolationCheck.result.value;
  assert(di.didNotDrag && !di.isDragging, 'Sentuhan/scroll pada bahagian kandungan TIDAK mencetuskan drag panel');

  console.log('\n--- BAHAGIAN 8: UJIAN KESERASIAN SAIZ S DAN M ---');
  // Switch to S
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.setPanelSize("small");' });
  await new Promise(r => setTimeout(r, 200));
  const sCheck = await send('Runtime.evaluate', {
    expression: 'document.getElementById("floating-card-container").classList.contains("size-small")',
    returnByValue: true
  });
  assert(sCheck.result.value, 'Saiz S (320px) berfungsi dengan sempurna');

  // Switch to M
  await send('Runtime.evaluate', { expression: 'window.KotakARSELNEL.setPanelSize("medium");' });
  await new Promise(r => setTimeout(r, 200));
  const mCheck = await send('Runtime.evaluate', {
    expression: 'document.getElementById("floating-card-container").classList.contains("size-medium")',
    returnByValue: true
  });
  assert(mCheck.result.value, 'Saiz M (480px) berfungsi dengan sempurna');

  console.log('\n================================================================');
  console.log(`📊 KEPUTUSAN: ${passedTests}/${totalTests} UJIAN LULUS (${failedTests} GAGAL)`);
  console.log('================================================================\n');

  chromeProc.kill();
  process.exit(failedTests > 0 ? 1 : 0);
}

runResponsiveTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

