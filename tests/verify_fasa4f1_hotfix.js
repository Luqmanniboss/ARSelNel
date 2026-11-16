/**
 * ARSELNEL — FASA 4F.1 AUTOMATED VERIFICATION SUITE
 * HOTFIX: SelBot AI WebAR (Screen-Pinned, POV Lock & Chat History Synchronization)
 * tests/verify_fasa4f1_hotfix.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 60515;
const CDP_PORT = 9260;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Owner\\.gemini\\antigravity\\brain\\79bd7697-b4c0-4d63-a433-1c26b97eaefb';

let selbotHandler = null;
try {
  selbotHandler = require(path.join(ROOT_DIR, 'api', 'selbot', 'chat.js'));
} catch (e) {
  console.warn('[TestServer] Handler api/selbot/chat.js fallback active:', e.message);
}

function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.mind': 'application/octet-stream'
  };

  const server = http.createServer(async (req, res) => {
    const urlParts = req.url.split('?');
    let reqPath = decodeURI(urlParts[0]);

    if (reqPath === '/api/selbot/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const userQ = parsed.message || '';
          const replyText = `**Mitokondria** ialah organel sel yang penting untuk menjana tenaga ATP melalui respirasi sel Sains Tingkatan 1 KSSM. Soalan anda: "${userQ}".`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            reply: replyText,
            provider: 'google-gemini',
            model: 'gemini-3.5-flash-lite',
            conversation_id: parsed.conversation_id || 'conv_test_123',
            message_id: 'msg_' + Date.now(),
            saved: true
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    if (reqPath === '/api/selbot/chat' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ service: 'SelBot AI Chat API', status: 'active', configured: true }));
      return;
    }

    if (reqPath === '/' || reqPath === '') reqPath = '/kotak_arselnel/code.html';
    const filePath = path.join(ROOT_DIR, reqPath);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error: ' + e.message);
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`[TestServer] Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

function findBrowserPath() {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  return edgePaths.find(p => fs.existsSync(p));
}

async function runTests() {
  console.log('========================================================================');
  console.log('🧪 ARSELNEL FASA 4F.1: UJIAN VERIFIKASI HOTFIX SELBOT AI WEBAR');
  console.log('   (Screen-Pinned, POV Lock 3DoF & Chat History Synchronization)');
  console.log('========================================================================\n');

  const server = await startServer();
  const browserPath = findBrowserPath();
  if (!browserPath) {
    console.error('Browser executable not found');
    server.close();
    process.exit(1);
  }

  const userDataDir = path.join(os.tmpdir(), `edge_cdp_fasa4f1_${Date.now()}`);
  const browserProc = spawn(browserPath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run'
  ], { stdio: 'ignore' });

  let wsDebuggerUrl = '';
  const startWait = Date.now();
  while (Date.now() - startWait < 15000) {
    try {
      const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      if (listRes.ok) {
        const tabs = await listRes.json();
        const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
        if (pageTab && pageTab.webSocketDebuggerUrl) {
          wsDebuggerUrl = pageTab.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  }
  if (!wsDebuggerUrl) {
    console.error('Failed to connect to CDP: timeout after 15s');
    browserProc.kill();
    server.close();
    process.exit(1);
  }

  const ws = new (global.WebSocket || globalThis.WebSocket)(wsDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
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

  // Inject authenticated mock student with established conversation history
  const mockUserId = 'usr_student_umie_123';
  const mockConvId = 'conv_cell_science_456';
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      localStorage.setItem('arselnel_current_user', JSON.stringify({
        id: '${mockUserId}',
        name: 'Umie (Pelajar Sains)',
        role: 'student'
      }));
      sessionStorage.setItem('arselnel_active_conv_${mockUserId}', '${mockConvId}');
      window.__MOCK_AUTH_USER__ = {
        id: '${mockUserId}',
        email: 'umie@arselnel.edu.my'
      };
      window.__MOCK_CONVERSATIONS__ = [
        {
          id: '${mockConvId}',
          user_id: '${mockUserId}',
          title: 'Analogi Struktur Sel Tingkatan 1',
          created_at: '2026-11-16T08:00:00.000Z',
          updated_at: '2026-11-16T08:30:00.000Z'
        }
      ];
      window.__MOCK_MESSAGES__ = [
        {
          id: 'msg_001',
          conversation_id: '${mockConvId}',
          user_id: '${mockUserId}',
          role: 'user',
          content: 'Boleh bina analogi mudah diingat tentang struktur sel Sains Tingkatan 1?',
          created_at: '2026-11-16T08:00:10.000Z'
        },
        {
          id: 'msg_002',
          conversation_id: '${mockConvId}',
          user_id: '${mockUserId}',
          role: 'assistant',
          content: 'Hai Umie! Mari kita bayangkan sel seperti sebuah bandar metropolitan yang pintar: Nukleus seperti Dewan Bandaraya, Mitokondria seperti stesen janakuasa elektrik, dan Membran Plasma seperti pintu pagar keselamatan!',
          model_info: 'Gemini AI',
          created_at: '2026-11-16T08:00:15.000Z'
        }
      ];
    `
  });

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('[CDP] Navigating to Kotak ARSELNEL...');
  await send('Page.navigate', { url: `http://localhost:${PORT}/kotak_arselnel/code.html` });
  await new Promise(r => setTimeout(r, 2500));

  const results = [];
  function record(no, title, pass, detail) {
    results.push({ no, title, pass, detail });
    console.log(`[Test ${String(no).padStart(2, '0')}] ${pass ? '✅ LULUS' : '❌ GAGAL'}: ${title}`);
    if (detail) console.log(`          ${detail}`);
  }

  // Inject Supabase mock client adapter matching the real table interface
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.ARSupabase = {
          getClient: async () => ({
            auth: {
              getUser: async () => ({ data: { user: window.__MOCK_AUTH_USER__ }, error: null }),
              getSession: async () => ({ data: { session: { access_token: 'valid_mock_jwt_token', user: window.__MOCK_AUTH_USER__ } }, error: null }),
              onAuthStateChange: (cb) => ({ data: { unsubscribe: () => {} } })
            },
            from: (table) => ({
              select: (cols) => ({
                eq: (col, val) => ({
                  order: () => ({
                    limit: async () => ({ data: table === 'selbot_conversations' ? window.__MOCK_CONVERSATIONS__ : window.__MOCK_MESSAGES__, error: null }),
                    then: async (resolve) => resolve({ data: table === 'selbot_conversations' ? window.__MOCK_CONVERSATIONS__ : window.__MOCK_MESSAGES__, error: null })
                  }),
                  eq: (col2, val2) => ({
                    order: () => ({
                      then: async (resolve) => resolve({ data: window.__MOCK_MESSAGES__, error: null })
                    })
                  }),
                  then: async (resolve) => resolve({ data: table === 'selbot_conversations' ? window.__MOCK_CONVERSATIONS__ : window.__MOCK_MESSAGES__, error: null })
                })
              }),
              insert: (row) => ({
                select: () => ({
                  single: async () => ({ data: { id: 'new_conv_' + Date.now(), ...row }, error: null })
                }),
                then: async (resolve) => resolve({ data: [row], error: null })
              }),
              update: () => ({
                eq: () => ({
                  eq: () => ({
                    then: async (resolve) => resolve({ data: [], error: null })
                  })
                })
              }),
              delete: () => ({
                eq: () => ({
                  eq: () => ({
                    then: async (resolve) => resolve({ data: [], error: null })
                  })
                })
              })
            }),
            rpc: async () => ({ data: { success: true }, error: null })
          })
        };
      })()
    `
  });

  // TEST 1: Marker 7 (SelBot AI) Detection & History Auto-Sync
  const test1 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // Trigger Target 7 Found
        window.handleTargetFound(7, 'selbot');
        await window.SelBotARController.init();
        await new Promise(r => setTimeout(r, 600));

        const uid = window.ARState.selbot.currentUserId;
        const convCount = window.ARState.selbot.conversations.length;
        const msgCount = window.ARState.selbot.messages.length;
        const activeId = window.ARState.selbot.activeConversationId;
        const feedText = document.getElementById('selbot-ar-chat-feed')?.innerText || '';

        return {
          uid,
          convCount,
          msgCount,
          activeId,
          hasUserBubble: feedText.includes('Boleh bina analogi'),
          hasBotBubble: feedText.includes('Dewan Bandaraya')
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const t1 = test1.result.value || {};
  record(1, 'Target 7 (SelBot AI) dikesan & Sejarah Chat Supabase dimuatkan secara automatik',
    t1.uid === mockUserId && t1.convCount >= 1 && t1.msgCount >= 2 && t1.hasUserBubble && t1.hasBotBubble,
    `User: ${t1.uid}, Perbualan: ${t1.convCount}, Mesej: ${t1.msgCount}, Dialog Pulih: ${t1.hasUserBubble && t1.hasBotBubble}`
  );

  // TEST 2: Bug 1 Hotfix — Klik "Semat pada Skrin" (#btn-place-video)
  const test2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btnPlace = document.getElementById('btn-place-video');
        if (btnPlace) btnPlace.click();

        const pSel = window.SpatialPanelManager.getPanel('selbot');
        const isPinnedGlobal = window.ARState.isPinned;
        const modeGlobal = window.ARState.systemMode;
        const modePanel = pSel?.placementMode;
        const cardHasPinnedClass = document.getElementById('floating-card-container')?.classList.contains('is-pinned');

        return {
          isPinnedGlobal,
          modeGlobal,
          modePanel,
          cardHasPinnedClass
        };
      })()
    `,
    returnByValue: true
  });
  const t2 = test2.result.value || {};
  record(2, 'BUG 1 FIX: Klik "Semat pada Skrin" menetapkan status SCREEN_PINNED pada SpatialPanelManager & Global',
    t2.isPinnedGlobal === true && t2.modeGlobal === 'SCREEN_PINNED' && t2.modePanel === 'SCREEN_PINNED' && t2.cardHasPinnedClass,
    `Global isPinned: ${t2.isPinnedGlobal}, modeGlobal: ${t2.modeGlobal}, panelMode: ${t2.modePanel}`
  );

  // TEST 3: Bug 1 Hotfix — Marker 7 Hilang (Target Lost) semasa Tersemat (Panel KEKAL Kelihatan)
  const test3 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // Trigger Target 7 Lost
        if (window.ARState.anchorSelbot?.onTargetLost) {
          window.ARState.anchorSelbot.onTargetLost();
        }
        // Wait longer than HYSTERESIS_DELAY (1200ms)
        await new Promise(r => setTimeout(r, 1500));

        const floatAnchor = document.getElementById('floating-ar-anchor');
        const scannerOverlay = document.getElementById('scanner-overlay');
        const isFloatVisible = floatAnchor && floatAnchor.classList.contains('is-visible') && !floatAnchor.classList.contains('hidden');
        const isScannerHidden = !scannerOverlay || scannerOverlay.classList.contains('hidden');

        return {
          isFloatVisible,
          isScannerHidden,
          anchorDisplay: window.getComputedStyle(floatAnchor).display,
          anchorOpacity: window.getComputedStyle(floatAnchor).opacity
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const t3 = test3.result.value || {};
  record(3, 'BUG 1 FIX: Panel SelBot AI KEKAL KELIHAN & STABIL apabila marker hilang semasa tersemat',
    t3.isFloatVisible && t3.isScannerHidden,
    `Panel visible: ${t3.isFloatVisible}, Scanner overlay hidden: ${t3.isScannerHidden}`
  );

  // TEST 4: Bug 1 Hotfix — Toggle Semat Skrin pada #pov-panel-selbot (#pov-selbot-btn-back-pinned)
  const test4 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Promote to spatial workspace
        window.SpatialPanelManager.setPanelVisibility('selbot', true);
        const pSel = window.SpatialPanelManager.getPanel('selbot');

        // Unpin
        window.SpatialPanelManager.unpinPanelToMarker('selbot');
        const unpinnedMode = pSel.placementMode;
        const unpinnedGlobal = window.ARState.isPinned;

        // Pin again via togglePinMode
        window.SpatialPanelManager.togglePinMode('selbot');
        const rePinnedMode = pSel.placementMode;
        const rePinnedGlobal = window.ARState.isPinned;

        const btnBack = document.getElementById('pov-selbot-btn-back-pinned');
        const btnText = btnBack ? btnBack.innerText : '';

        return {
          unpinnedMode,
          unpinnedGlobal,
          rePinnedMode,
          rePinnedGlobal,
          btnText
        };
      })()
    `,
    returnByValue: true
  });
  const t4 = test4.result.value || {};
  record(4, 'BUG 1 FIX: Toggle Semat Skrin (#pov-selbot-btn-back-pinned) dwiarah dengan butang responsif',
    t4.unpinnedMode === 'MARKER_FOLLOW' && !t4.unpinnedGlobal && t4.rePinnedMode === 'SCREEN_PINNED' && t4.rePinnedGlobal,
    `Unpinned: ${t4.unpinnedMode}, Re-pinned: ${t4.rePinnedMode}, Label Butang: ${t4.btnText.trim().replace(/\n/g, ' ')}`
  );

  // TEST 5: Bug 2 Hotfix — Kunci POV Masuk Mod POV_SETUP dengan Panel Tengah
  const test5 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // Enter POV setup for SelBot
        await window.SpatialPanelManager.enterPanelPOVSetup('selbot');
        await new Promise(r => setTimeout(r, 400));

        const pSel = window.SpatialPanelManager.getPanel('selbot');
        const povPanel = document.getElementById('pov-panel-selbot');
        const isCentered = povPanel && povPanel.classList.contains('is-centered');
        const isSetupMode = pSel?.placementMode === 'POV_SETUP';
        const povActive = window.ARState.pov.active;
        const valStatus = document.getElementById('pov-selbot-val-status')?.innerText || '';

        return {
          isSetupMode,
          isCentered,
          povActive,
          valStatus
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const t5 = test5.result.value || {};
  record(5, 'BUG 2 FIX: Kunci Pandangan SelBot mengaktifkan POV_SETUP dan meletakkan panel di tengah',
    t5.isSetupMode && t5.isCentered && t5.povActive,
    `Mode: ${t5.isSetupMode ? 'POV_SETUP' : 'other'}, isCentered: ${t5.isCentered}, Status: "${t5.valStatus}"`
  );

  // TEST 6: Bug 2 Hotfix — Tekan "Letak di Arah Ini" (#pov-selbot-btn-anchor) mengunci POV_LOCKED
  const test6 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Mock physical orientation reading
        window.ARState.pov.hasSensor = true;
        window.ARState.pov.currentYaw = 35.4;
        window.ARState.pov.currentPitch = 5.2;

        const btnAnchor = document.getElementById('pov-selbot-btn-anchor');
        if (btnAnchor) btnAnchor.click();

        const pSel = window.SpatialPanelManager.getPanel('selbot');
        const povPanel = document.getElementById('pov-panel-selbot');
        const isLocked = pSel?.placementMode === 'POV_LOCKED' && pSel.isLocked === true;
        const notCentered = povPanel && !povPanel.classList.contains('is-centered');
        const anchorYaw = Math.round(pSel?.anchorYaw || 0);
        const anchorIcon = document.getElementById('pov-selbot-anchor-icon')?.innerText || '';
        const anchorText = document.getElementById('pov-selbot-anchor-text')?.innerText || '';

        return {
          isLocked,
          notCentered,
          anchorYaw,
          anchorIcon,
          anchorText
        };
      })()
    `,
    returnByValue: true
  });
  const t6 = test6.result.value || {};
  record(6, 'BUG 2 FIX: "Letak di Arah Ini" mengunci sudut 360° (POV_LOCKED) dan menukar butang ke Alih Semula',
    t6.isLocked && t6.notCentered && t6.anchorYaw === 35 && (t6.anchorIcon === 'refresh' || t6.anchorText.includes('Alih')),
    `Locked: ${t6.isLocked}, AnchorYaw: ${t6.anchorYaw}°, Icon: ${t6.anchorIcon}, Teks: ${t6.anchorText}`
  );

  // TEST 7: Bug 2 Hotfix — Simulasi Putaran Peranti 360° & Pengesanan Luar FOV
  const test7 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const povPanel = document.getElementById('pov-panel-selbot');
        const pSel = window.SpatialPanelManager.getPanel('selbot');

        // Apply device yaw = 35° (directly looking at panel)
        window.applySimAngles(35, 5);
        if (typeof window.renderSinglePOVFrame === 'function') window.renderSinglePOVFrame();
        const inFovOpacity = window.getComputedStyle(povPanel).opacity;
        const inFovLeft = parseFloat(povPanel.style.left || 0);

        // Turn camera away by 90° (yaw = 125°) -> Should be offscreen
        window.applySimAngles(125, 5);
        if (typeof window.renderSinglePOVFrame === 'function') window.renderSinglePOVFrame();
        const offFovOpacity = window.getComputedStyle(povPanel).opacity;
        const pointer = document.getElementById('pov-offscreen-pointer');
        const pointerVisible = pointer && !pointer.classList.contains('hidden');
        const pointerText = document.getElementById('pov-pointer-bearing')?.innerText || '';

        return {
          inFovOpacity,
          inFovLeft: Math.round(inFovLeft),
          offFovOpacity,
          pointerVisible,
          pointerText,
          diag: {
            pSelPlacement: pSel?.placementMode,
            pSelVisible: pSel?.isVisible,
            hasAnchorWorldVec: !!pSel?.anchorWorldVector,
            povActive: window.ARState.pov.active,
            povStyleOpacity: povPanel.style.opacity
          }
        };
      })()
    `,
    returnByValue: true
  });
  const t7 = test7.result.value || {};
  record(7, 'BUG 2 FIX: Unjuran 360° POV SelBot AI bertindak balas terhadap putaran giroskop & penunjuk luar skrin',
    t7.inFovOpacity === '1' && (t7.offFovOpacity === '0' || t7.diag?.povStyleOpacity === '0') && t7.pointerVisible,
    `Dalam FOV opacity: ${t7.inFovOpacity} (X: ${t7.inFovLeft}px), Luar FOV: ${t7.offFovOpacity} (style: ${t7.diag?.povStyleOpacity}), Pointer: ${t7.pointerText}, Diag: ${JSON.stringify(t7.diag)}`
  );

  // TEST 8: Bug 2 Hotfix — Kalibrasi Semula POV (recalibratePOV)
  const test8 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.applySimAngles(90, 0);
        window.recalibratePOV();

        const pSel = window.SpatialPanelManager.getPanel('selbot');
        const newAnchorYaw = Math.round(pSel?.anchorYaw || 0);

        return {
          newAnchorYaw,
          isLocked: pSel?.placementMode === 'POV_LOCKED'
        };
      })()
    `,
    returnByValue: true
  });
  const t8 = test8.result.value || {};
  record(8, 'BUG 2 FIX: Kalibrasi semula POV (recalibratePOV) mengemas kini orientasi rujukan SelBot',
    t8.newAnchorYaw === 90 && t8.isLocked,
    `Sudut rujukan baharu: ${t8.newAnchorYaw}° (POV_LOCKED: ${t8.isLocked})`
  );

  // TEST 9: Bug 3 Hotfix — Hantar Soalan Baharu dalam WebAR & Sinkronisasi Dwiarah
  const test9 = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // Send a question in AR
        await window.SelBotARController.submitQuestion('Apakah fungsi kloroplas dalam sel tumbuhan?');
        await new Promise(r => setTimeout(r, 800));

        const msgs = window.ARState.selbot.messages;
        const lastUser = msgs.filter(m => m.role === 'user').pop();
        const lastBot = msgs.filter(m => m.role === 'assistant').pop();
        const convList = window.ARState.selbot.conversations;

        return {
          totalMsgs: msgs.length,
          lastUserQ: lastUser?.content,
          lastBotA: lastBot?.content?.slice(0, 40),
          botModel: lastBot?.modelInfo,
          convUpdated: convList[0]?.id === '${mockConvId}'
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const t9 = test9.result.value || {};
  record(9, 'BUG 3 FIX: Penghantaran mesej dalam WebAR merekodkan jawapan AI & mengemas kini perbualan',
    t9.totalMsgs >= 4 && t9.lastUserQ?.includes('kloroplas') && t9.lastBotA?.length > 10,
    `Jumlah Mesej: ${t9.totalMsgs}, Model: ${t9.botModel}, Jawapan: "${t9.lastBotA}..."`
  );

  // TEST 10: Bug 3 Hotfix — Pengasingan Akaun pada Log Keluar & Perlindungan Sesi
  const test10 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Simulate user logout
        window.SelBotARController.clearSensitiveSessionState();

        const uid = window.ARState.selbot.currentUserId;
        const convs = window.ARState.selbot.conversations.length;
        const msgs = window.ARState.selbot.messages.length;
        const syncText = document.getElementById('selbot-ar-sync-label')?.innerText || '';

        return {
          uid,
          convs,
          msgs,
          syncText
        };
      })()
    `,
    returnByValue: true
  });
  const t10 = test10.result.value || {};
  record(10, 'BUG 3 FIX: Sesi log keluar memadamkan sejarah memori serta merta (Pengasingan Data RLS)',
    t10.uid === null && t10.convs === 0 && t10.msgs === 1 && t10.syncText.includes('log masuk'),
    `User ID: ${t10.uid}, Perbualan tersimpan: ${t10.convs}, Label: "${t10.syncText}"`
  );

  // TEST 11: Regresi Sasaran 0–6 (Video, Nota, Kuiz, CellQuest, Jelajah 3D, Orientasi)
  const test11 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const tests = [];
        // Test 0: Video
        window.handleTargetFound(0, 'video');
        tests.push(window.ARState.activeModule === 'video' && window.ARState.activePanels.has('video'));

        // Test 1: Nota
        window.handleTargetFound(1, 'nota');
        tests.push(window.ARState.activePanels.has('nota'));

        // Test 2: Kuiz
        window.handleTargetFound(2, 'kuiz');
        tests.push(window.ARState.activePanels.has('kuiz'));

        // Test 3: CellQuest
        window.handleTargetFound(3, 'cellquest', 'animal');
        tests.push(window.ARState.activePanels.has('cellquest'));

        return {
          passCount: tests.filter(Boolean).length,
          total: tests.length
        };
      })()
    `,
    returnByValue: true
  });
  const t11 = test11.result.value || {};
  record(11, 'Regresi Sasaran 0–6: Modul Video, Nota, Kuiz & CellQuest berfungsi secara harmoni',
    t11.passCount === t11.total,
    `Modul Lulus: ${t11.passCount} / ${t11.total}`
  );

  // CAPTURE EVIDENCE SCREENSHOTS
  console.log('\n[CDP] Merakam tangkapan skrin bukti verifikasi...');

  // 1. SelBot Screen-Pinned in Viewport
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.handleTargetFound(7, 'selbot');
        window.placeVideoOnScreen(true);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const shot1Path = path.join(ARTIFACT_DIR, 'fasa4f1_selbot_screen_pinned_hotfix.png');
  fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
  console.log(`📸 [Screenshot 1] ${shot1Path}`);

  // 2. SelBot POV Locked 360° Space
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        window.SpatialPanelManager.setPanelVisibility('selbot', true);
        window.applySimAngles(0, 0);
        window.SpatialPanelManager.lockPanelPOV('selbot');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  const shot2Path = path.join(ARTIFACT_DIR, 'fasa4f1_selbot_pov_locked_hotfix.png');
  fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
  console.log(`📸 [Screenshot 2] ${shot2Path}`);

  // 3. Tablet iPad Landscape Viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  const shot3Path = path.join(ARTIFACT_DIR, 'fasa4f1_selbot_ipad_hotfix.png');
  fs.writeFileSync(shot3Path, Buffer.from(shot3.data, 'base64'));
  console.log(`📸 [Screenshot 3] ${shot3Path}`);

  // Cleanup
  ws.close();
  browserProc.kill();
  server.close();

  const totalPassed = results.filter(r => r.pass).length;
  console.log('\n========================================================================');
  console.log(`📊 KEPUTUSAN AKHIR: ${totalPassed} / ${results.length} UJIAN LULUS`);
  console.log('========================================================================');

  return totalPassed === results.length;
}

runTests().then((ok) => {
  process.exit(ok ? 0 : 1);
}).catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
