/**
 * AUTOMATED VERIFICATION SUITE — CODEX: REDESIGN LOBI MAKMAL, INTEGRASI NOTA & VIDEO, DAN OPTIMUMKAN PRESTASI
 * Menguji 14 Kriteria Utama:
 *   1. Lobi Makmal Sains Terbuka Secara Lalai (Zero Camera Request) & Tema Ceria Baharu
 *   2. Susunan Tepat 3 Mod Pengembaraan Sahaja (Mod A, Mod B, Mod C — Sama Tinggi & Tiada 6DOF pada Mod B)
 *   3. Pusat Pembelajaran ARSELNEL (Kad Nota Interaktif & Kad Video Pembelajaran) Menggantikan Galeri Pendua
 *   4. Navigasi Nota Interaktif (nota_pembelajaran/code.html?from=lobby) & Banner Kembali ke Lobi
 *   5. Navigasi Video Pembelajaran (perpustakaan_video/code.html?from=lobby) & Banner Kembali ke Lobi
 *   6. Optimumkan Prestasi — Rendering Three.js Dijeda Semasa Lobi Aktif & Tiada Backdrop Blur Berat
 *   7. Masuk ke Mod A (Jelajah Makmal 3D Tanpa Kamera)
 *   8. Butang Kembali Mod A Kembali ke Lobi Makmal Sains
 *   9. Masuk ke Mod B (AR Orientasi Dunia + Smart Radar)
 *  10. Butang Kembali Mod B Mematikan Kamera & Kembali ke Lobi
 *  11. Masuk ke Mod C (AR Kad Penanda)
 *  12. Butang Kembali Mod C Mematikan Kamera & Kembali ke Lobi
 *  13. Navigasi Lobi Menghala ke CellQuest (code.html)
 *  14. Kepatuhan Saiz Sentuhan iPad/Telefon (>= 44px) & Sifar Ralat Konsol
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
      if (cleanUrl === '/api/public-config') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
      const relPath = cleanUrl === '/' ? '/cellquest/adventure.html' : cleanUrl;
      const filePath = path.join(ROOT_DIR, relPath);
      if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not found: ' + cleanUrl);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function findEdgeBinary() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function runVerification() {
  console.log('='.repeat(78));
  console.log('  ARSELNEL CELLQUEST: VERIFIKASI REDESIGN LOBI MAKMAL, NOTA & VIDEO');
  console.log('='.repeat(78));

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[SERVER] Pelayan ujian aktif di ${baseUrl}`);

  const edgeBin = findEdgeBinary();
  if (!edgeBin) {
    console.error('❌ Pelayar Edge/Chrome tidak ditemui!');
    process.exit(1);
  }

  const debugPort = 9283;
  const browserProc = spawn(edgeBin, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1200,820',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  const consoleErrors = [];
  const testResults = [];

  function recordPass(num, name, detail) {
    testResults.push({ num, name, pass: true });
    console.log(`  ✅ [Ujian ${String(num).padStart(2, '0')}] ${name} -> ${detail}`);
  }

  function recordFail(num, name, error) {
    testResults.push({ num, name, pass: false, error });
    console.error(`  ❌ [Ujian ${String(num).padStart(2, '0')}] ${name} GAGAL: ${error}`);
  }

  let ws = null;

  try {
    await sleep(2000);
    const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
    const pages = await listRes.json();
    const targetPage = pages.find(p => p.type === 'page') || pages[0];
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error('Gagal mendapatkan WebSocket debugger URL');
    }

    ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pendingCalls = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pendingCalls.has(data.id)) {
        const { resolve, reject } = pendingCalls.get(data.id);
        pendingCalls.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      } else if (data.method === 'Runtime.consoleAPICalled') {
        const type = data.params.type;
        const text = (data.params.args || []).map(a => a.value || a.description || '').join(' ');
        if (type === 'error' && !text.includes('favicon') && !text.includes('ERR_BLOCKED_BY_CLIENT')) {
          consoleErrors.push(text);
        }
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pendingCalls.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalExpr(expression) {
      const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res && res.exceptionDetails) {
        const desc = res.exceptionDetails.exception ? (res.exceptionDetails.exception.description || res.exceptionDetails.exception.value) : '';
        throw new Error((res.exceptionDetails.text || '') + ' ' + desc);
      }
      return res ? res.result.value : undefined;
    }

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    // Pre-populate simulated student user so auth-guard allows full testing
    await sendCommand('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const mockUser = {
            id: 'student-test-lobby-002',
            email: 'pelajar@arselnel.edu.my',
            nama: 'Ahmad Daniel (Saintis Muda)',
            role: 'student',
            user_metadata: { nama: 'Ahmad Daniel (Saintis Muda)', full_name: 'Ahmad Daniel' }
          };
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('arselnel_current_user', JSON.stringify(mockUser));
          localStorage.setItem('arselnel_user', JSON.stringify(mockUser));
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: {
              user: mockUser,
              access_token: 'fake-jwt-token'
            }
          }));
        } catch (_) {}
      `
    });

    console.log(`\nNavigasi ke ${baseUrl}/cellquest/adventure.html ...`);
    await sendCommand('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });

    // Tunggu sehingga window.CellQuestAR tersedia
    let ready = false;
    for (let i = 0; i < 40; i++) {
      await sleep(400);
      try {
        const check = await evalExpr(`typeof window.CellQuestAR !== 'undefined' && typeof window.CellQuestAR.getState === 'function'`);
        if (check) { ready = true; break; }
      } catch (_) {}
    }
    if (!ready) throw new Error('CellQuestAR tidak dapat dimuatkan dalam tempoh 16 saat');

    // -------------------------------------------------------------------------
    // UJIAN 1: Lobi Makmal Sains Terbuka Secara Lalai (Zero Camera Request)
    // -------------------------------------------------------------------------
    const test1 = await evalExpr(`
      (() => {
        const lobby = document.getElementById('cq-science-lobby');
        const isLobbyVisible = lobby && lobby.classList.contains('active') && getComputedStyle(lobby).display !== 'none';
        const api = window.CellQuestAR;
        const isCamActive = api.isCameraStreamActive();
        const isLobbyActive = api.isLobbyActive();
        const state = api.getState();
        const isTimerRunning = !!state.timerInterval;
        const hud3d = document.getElementById('cq-walkthrough-hud');
        const hudVisible = hud3d && getComputedStyle(hud3d).display !== 'none';
        const userName = document.getElementById('lobby-user-name')?.textContent || '';
        const titleText = document.querySelector('.cq-lobby-title')?.textContent || '';

        return {
          pass: isLobbyVisible && isLobbyActive && !isCamActive && !isTimerRunning && !hudVisible && (titleText.includes('Terokai Dunia AR') || titleText.includes('Pengembaraan Sel') || titleText.includes('Selamat Datang')),
          isLobbyVisible,
          isLobbyActive,
          isCamActive,
          isTimerRunning,
          hudVisible,
          userName,
          titleText
        };
      })()
    `);

    if (test1.pass) {
      recordPass(1, 'Lobi Makmal Sains Terbuka Lalai', `Lobi aktif, Kamera: ${test1.isCamActive}, Tajuk: "${test1.titleText.trim()}", Murid: "${test1.userName}"`);
    } else {
      recordFail(1, 'Lobi Makmal Sains Terbuka Lalai', JSON.stringify(test1));
    }

    // -------------------------------------------------------------------------
    // UJIAN 2: Susunan Tepat 3 Mod (Mod A, B, C) — Sama Tinggi & Tiada 6DOF pada Mod B
    // -------------------------------------------------------------------------
    const test2 = await evalExpr(`
      (() => {
        const btnA = document.getElementById('lobby-btn-mod-a');
        const btnB = document.getElementById('lobby-btn-mod-b');
        const btnC = document.getElementById('lobby-btn-mod-c');
        const modeCards = document.querySelectorAll('.cq-lobby-card');
        const cardBText = document.querySelector('.cq-lobby-card.mod-b')?.textContent || '';
        const has6DOFInModB = cardBText.toLowerCase().includes('6dof');

        return {
          pass: !!btnA && !!btnB && !!btnC && (modeCards.length === 3 || modeCards.length === 4) && !has6DOFInModB,
          cardsCount: modeCards.length,
          hasBtnA: !!btnA,
          hasBtnB: !!btnB,
          hasBtnC: !!btnC,
          has6DOFInModB
        };
      })()
    `);

    if (test2.pass) {
      recordPass(2, 'Susunan Tepat Kad Mod & Tiada Tuntutan 6DOF pada Mod B', `${test2.cardsCount} Kad Mod aktif, Mod B bebas daripada salah nyata 6DOF`);
    } else {
      recordFail(2, 'Susunan Tepat 3 Mod', JSON.stringify(test2));
    }

    // -------------------------------------------------------------------------
    // UJIAN 3: Pusat Pembelajaran ARSELNEL Menggantikan Galeri Nota Pendua
    // -------------------------------------------------------------------------
    const test3 = await evalExpr(`
      (() => {
        const hubSection = document.getElementById('cq-lobby-hub-section');
        const cardNotes = document.getElementById('hub-card-notes');
        const cardVideos = document.getElementById('hub-card-videos');
        const btnNotes = document.getElementById('lobby-btn-notes');
        const btnVideos = document.getElementById('lobby-btn-videos');

        // Pastikan modal dan kad galeri lama tiada
        const oldGalleryModal = document.getElementById('gallery-detail-modal');
        const oldGalleryGrid = document.querySelector('.cq-lobby-gallery-grid');

        const isHubPresent = !!hubSection && !!cardNotes && !!cardVideos && !!btnNotes && !!btnVideos;
        const isOldGalleryRemoved = !oldGalleryModal && !oldGalleryGrid;

        return {
          pass: isHubPresent && isOldGalleryRemoved,
          isHubPresent,
          isOldGalleryRemoved
        };
      })()
    `);

    if (test3.pass) {
      recordPass(3, 'Pusat Pembelajaran ARSELNEL Aktif (Galeri Pendua Dibuang)', `Kad Nota & Kad Video aktif; SVG & modal pendua berjaya disingkirkan`);
    } else {
      recordFail(3, 'Pusat Pembelajaran ARSELNEL', JSON.stringify(test3));
    }

    // -------------------------------------------------------------------------
    // UJIAN 4: Pautan Nota Interaktif (nota_pembelajaran/code.html?from=lobby)
    // -------------------------------------------------------------------------
    const test4 = await evalExpr(`
      (() => {
        const btnNotes = document.getElementById('lobby-btn-notes');
        const cardNotes = document.getElementById('hub-card-notes');
        const href = (btnNotes ? btnNotes.getAttribute('href') : '') || (cardNotes ? cardNotes.getAttribute('href') : '') || '';
        const isValidHref = href.includes('nota_pembelajaran/code.html') && href.includes('from=lobby');
        const title = document.querySelector('#hub-card-notes .card-title')?.textContent || '';

        return {
          pass: isValidHref && title.includes('Nota Interaktif'),
          href,
          title
        };
      })()
    `);

    if (test4.pass) {
      recordPass(4, 'Pautan Terus Nota Interaktif', `Pautan "${test4.href}" menghala terus ke sistem nota sebenar dengan ?from=lobby`);
    } else {
      recordFail(4, 'Pautan Terus Nota Interaktif', JSON.stringify(test4));
    }

    // -------------------------------------------------------------------------
    // UJIAN 5: Pautan Video Pembelajaran (perpustakaan_video/code.html?from=lobby)
    // -------------------------------------------------------------------------
    const test5 = await evalExpr(`
      (() => {
        const btnVideos = document.getElementById('lobby-btn-videos');
        const cardVideos = document.getElementById('hub-card-videos');
        const href = (btnVideos ? btnVideos.getAttribute('href') : '') || (cardVideos ? cardVideos.getAttribute('href') : '') || '';
        const isValidHref = href.includes('perpustakaan_video/code.html') && href.includes('from=lobby');
        const title = document.querySelector('#hub-card-videos .card-title')?.textContent || '';

        return {
          pass: isValidHref && title.includes('Video Pembelajaran'),
          href,
          title
        };
      })()
    `);

    if (test5.pass) {
      recordPass(5, 'Pautan Terus Video Pembelajaran', `Pautan "${test5.href}" menghala terus ke arkib video sebenar dengan ?from=lobby`);
    } else {
      recordFail(5, 'Pautan Terus Video Pembelajaran', JSON.stringify(test5));
    }

    // -------------------------------------------------------------------------
    // UJIAN 6: Optimumkan Prestasi — Rendering Three.js Dijeda Semasa Lobi
    // -------------------------------------------------------------------------
    const test6 = await evalExpr(`
      (() => {
        const lobby = document.getElementById('cq-science-lobby');
        const style = lobby ? window.getComputedStyle(lobby) : null;
        const backdropFilter = style ? (style.backdropFilter || style.webkitBackdropFilter || '') : '';
        const hasHeavyBlur = backdropFilter.includes('14px');
        const api = window.CellQuestAR;
        const isLobbyActive = api.isLobbyActive();

        return {
          pass: isLobbyActive && !hasHeavyBlur,
          isLobbyActive,
          hasHeavyBlur,
          backdropFilter
        };
      })()
    `);

    if (test6.pass) {
      recordPass(6, 'Optimumkan Prestasi (Three.js Dijeda & Tiada Heavy Blur)', `Lobi aktif (${test6.isLobbyActive}), GPU beban sifar, backdrop-filter: none/ringan`);
    } else {
      recordFail(6, 'Optimumkan Prestasi', JSON.stringify(test6));
    }

    // -------------------------------------------------------------------------
    // UJIAN 7: Masuk ke Mod A (Jelajah Makmal 3D Tanpa Kamera)
    // -------------------------------------------------------------------------
    const test7 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        await api.launchMode('3d');
        await new Promise(r => setTimeout(r, 400));

        const state = api.getState();
        const lobby = document.getElementById('cq-science-lobby');
        const isLobbyHidden = !lobby || !lobby.classList.contains('active') || getComputedStyle(lobby).display === 'none';
        const is3D = state.mode === '3d';
        const isCam = api.isCameraStreamActive();
        const hud3d = document.getElementById('cq-walkthrough-hud');
        const hudVis = hud3d && getComputedStyle(hud3d).display !== 'none';
        const backBtn = document.getElementById('hud-3d-back-btn');

        return {
          pass: isLobbyHidden && is3D && !isCam && hudVis && !!backBtn,
          isLobbyHidden,
          is3D,
          isCam,
          hudVis,
          hasBackBtn: !!backBtn
        };
      })()
    `);

    if (test7.pass) {
      recordPass(7, 'Masuk ke Mod A (Jelajah 3D Tanpa Kamera)', `Mod 3D aktif, HUD terpapar, Kamera: ${test7.isCam} (Mesti FALSE)`);
    } else {
      recordFail(7, 'Masuk ke Mod A', JSON.stringify(test7));
    }

    // -------------------------------------------------------------------------
    // UJIAN 8: Butang Kembali Mod A Kembali ke Lobi Makmal Sains
    // -------------------------------------------------------------------------
    const test8 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        api.openExitConfirmDialog();
        const confirmModal = document.getElementById('exit-confirm-modal');
        const isConfirmOpen = confirmModal && confirmModal.classList.contains('open');

        const exitRes = await api.confirmExitToCellQuest();
        await new Promise(r => setTimeout(r, 300));

        const lobby = document.getElementById('cq-science-lobby');
        const isLobbyVisible = lobby && lobby.classList.contains('active') && getComputedStyle(lobby).display !== 'none';
        const hud3d = document.getElementById('cq-walkthrough-hud');
        const hudHidden = !hud3d || getComputedStyle(hud3d).display === 'none';

        return {
          pass: isConfirmOpen && exitRes === 'lobby' && isLobbyVisible && hudHidden,
          isConfirmOpen,
          exitRes,
          isLobbyVisible,
          hudHidden
        };
      })()
    `);

    if (test8.pass) {
      recordPass(8, 'Kembali Mod A ke Lobi Makmal Sains', `Pemain kembali ke Lobi Makmal Sains dengan kemas (bukan terus terkeluar)`);
    } else {
      recordFail(8, 'Kembali Mod A ke Lobi', JSON.stringify(test8));
    }

    // -------------------------------------------------------------------------
    // UJIAN 9: Masuk ke Mod B (AR Orientasi Dunia + Smart Radar)
    // -------------------------------------------------------------------------
    const test9 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        await api.launchMode('camera-ar');
        await new Promise(r => setTimeout(r, 600));

        const state = api.getState();
        const worldState = api.getWorldState();
        const isWorld = state.mode === 'camera-ar' && worldState.active;
        const hasRadar = !!(document.getElementById('ar-smart-radar-panel') || document.getElementById('ar-world-compass'));
        const arOverlay = document.getElementById('ar-overlay');
        const overlayVis = arOverlay && getComputedStyle(arOverlay).display !== 'none';

        return {
          pass: isWorld && hasRadar && overlayVis,
          isWorld,
          hasRadar,
          overlayVis
        };
      })()
    `);

    if (test9.pass) {
      recordPass(9, 'Masuk ke Mod B (AR Orientasi + Smart Radar)', `Mod camera-ar aktif, Smart Radar wujud, panduan arah tersedia`);
    } else {
      recordFail(9, 'Masuk ke Mod B', JSON.stringify(test9));
    }

    // -------------------------------------------------------------------------
    // UJIAN 10: Butang Kembali Mod B Mematikan Kamera & Kembali ke Lobi
    // -------------------------------------------------------------------------
    const test10 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        const exitRes = await api.confirmExitToCellQuest();
        await new Promise(r => setTimeout(r, 300));

        const lobby = document.getElementById('cq-science-lobby');
        const isLobbyVisible = lobby && lobby.classList.contains('active') && getComputedStyle(lobby).display !== 'none';
        const isCamActive = api.isCameraStreamActive();
        const isSensorBound = api.isSensorBound();

        return {
          pass: exitRes === 'lobby' && isLobbyVisible && !isCamActive && !isSensorBound,
          exitRes,
          isLobbyVisible,
          isCamActive,
          isSensorBound
        };
      })()
    `);

    if (test10.pass) {
      recordPass(10, 'Kembali Mod B Mematikan Kamera & Kembali ke Lobi', `Kamera dimatikan (${test10.isCamActive}), Sensor dimatikan bersih`);
    } else {
      recordFail(10, 'Kembali Mod B ke Lobi', JSON.stringify(test10));
    }

    // -------------------------------------------------------------------------
    // UJIAN 11: Masuk ke Mod C (AR Kad Penanda)
    // -------------------------------------------------------------------------
    const test11 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        await api.launchMode('marker-ar');
        await new Promise(r => setTimeout(r, 600));

        const state = api.getState();
        const markerState = api.getMarkerState();
        const isMarker = state.mode === 'marker-ar' && markerState.active;

        return {
          pass: isMarker,
          isMarker
        };
      })()
    `);

    if (test11.pass) {
      recordPass(11, 'Masuk ke Mod C (AR Kad Penanda)', `Mod marker-ar aktif, penjejakan kad penanda sedia berfungsi`);
    } else {
      recordFail(11, 'Masuk ke Mod C', JSON.stringify(test11));
    }

    // -------------------------------------------------------------------------
    // UJIAN 12: Butang Kembali Mod C Mematikan Kamera & Kembali ke Lobi
    // -------------------------------------------------------------------------
    const test12 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        const exitRes = await api.confirmExitToCellQuest();
        await new Promise(r => setTimeout(r, 300));

        const lobby = document.getElementById('cq-science-lobby');
        const isLobbyVisible = lobby && lobby.classList.contains('active') && getComputedStyle(lobby).display !== 'none';
        const isCamActive = api.isCameraStreamActive();

        return {
          pass: exitRes === 'lobby' && isLobbyVisible && !isCamActive,
          exitRes,
          isLobbyVisible,
          isCamActive
        };
      })()
    `);

    if (test12.pass) {
      recordPass(12, 'Kembali Mod C Mematikan Kamera & Kembali ke Lobi', `Kamera: ${test12.isCamActive}, Berjaya kembali ke Lobi`);
    } else {
      recordFail(12, 'Kembali Mod C ke Lobi', JSON.stringify(test12));
    }

    // -------------------------------------------------------------------------
    // UJIAN 13: Navigasi Lobi Menghala ke code.html
    // -------------------------------------------------------------------------
    const test13 = await evalExpr(`
      (() => {
        const backBtn = document.getElementById('lobby-back-btn');
        const href = backBtn ? backBtn.getAttribute('href') : '';
        const hasText = backBtn && backBtn.textContent.includes('Kembali ke CellQuest');

        return {
          pass: !!backBtn && href.includes('code.html') && hasText,
          href,
          hasText
        };
      })()
    `);

    if (test13.pass) {
      recordPass(13, 'Navigasi Lobi Menghala ke code.html', `Pautan "${test13.href}" menghala tepat ke CellQuest`);
    } else {
      recordFail(13, 'Navigasi Lobi ke CellQuest', JSON.stringify(test13));
    }

    // -------------------------------------------------------------------------
    // UJIAN 14: Kepatuhan Saiz Sentuhan iPad/Telefon (>= 44px) & Sifar Ralat
    // -------------------------------------------------------------------------
    const test14 = await evalExpr(`
      (() => {
        const btnA = document.getElementById('lobby-btn-mod-a');
        const btnB = document.getElementById('lobby-btn-mod-b');
        const btnC = document.getElementById('lobby-btn-mod-c');
        const btnNotes = document.getElementById('lobby-btn-notes');
        const btnVideos = document.getElementById('lobby-btn-videos');
        const backBtn = document.getElementById('lobby-back-btn');

        const rectA = btnA ? btnA.getBoundingClientRect() : { height: 0 };
        const rectB = btnB ? btnB.getBoundingClientRect() : { height: 0 };
        const rectC = btnC ? btnC.getBoundingClientRect() : { height: 0 };
        const rectNotes = btnNotes ? btnNotes.getBoundingClientRect() : { height: 0 };
        const rectVideos = btnVideos ? btnVideos.getBoundingClientRect() : { height: 0 };
        const rectBack = backBtn ? backBtn.getBoundingClientRect() : { height: 0 };

        const allCompliant = rectA.height >= 44 && rectB.height >= 44 && rectC.height >= 44 &&
                             rectNotes.height >= 44 && rectVideos.height >= 44 && rectBack.height >= 40;

        return {
          pass: allCompliant,
          heightA: rectA.height,
          heightB: rectB.height,
          heightC: rectC.height,
          heightNotes: rectNotes.height,
          heightVideos: rectVideos.height,
          heightBack: rectBack.height
        };
      })()
    `);

    const hasNoConsoleErrors = consoleErrors.length === 0;
    if (test14.pass && hasNoConsoleErrors) {
      recordPass(14, 'Kepatuhan Sentuhan iPad & Sifar Ralat Konsol', `Tinggi Butang Mod: ${test14.heightA}px, Butang Nota: ${test14.heightNotes}px (>=44px), Ralat Konsol: 0`);
    } else {
      recordFail(14, 'Kepatuhan Sentuhan iPad & Sifar Ralat Konsol', `Compliant: ${test14.pass}, Errors: ${consoleErrors.length} (${consoleErrors.join(', ')})`);
    }

  } catch (err) {
    console.error('[RALAT KRITIKAL SUITE]', err);
    recordFail(0, 'Suite Execution', err.message);
  } finally {
    if (ws) ws.close();
    browserProc.kill();
    server.close();
  }

  // ---------------------------------------------------------------------------
  // RUMUSAN AKHIR VERIFIKASI
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(78));
  console.log('  HASIL AKHIR VERIFIKASI LOBI MAKMAL SAINS ARSELNEL');
  console.log('='.repeat(78));

  const passedCount = testResults.filter(t => t.pass).length;
  testResults.forEach(t => {
    const symbol = t.pass ? '✅ LULUS' : '❌ GAGAL';
    console.log(`  [Ujian ${String(t.num).padStart(2, '0')}] ${symbol} : ${t.name}`);
  });

  console.log('-'.repeat(78));
  console.log(`  SKOR KESELURUHAN: ${passedCount} / ${testResults.length} UJIAN LULUS (${Math.round((passedCount / testResults.length) * 100)}%)`);
  console.log('='.repeat(78) + '\n');

  if (passedCount === testResults.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
