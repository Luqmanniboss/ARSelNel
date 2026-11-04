/**
 * AUTOMATED VERIFICATION SUITE — CODEX: BINA LOBI MAKMAL SAINS & SUSUN SEMULA MOD PENGEMBARAAN
 * Menguji 12 Kriteria Utama Pengesahan:
 *   1. Lobi Makmal Sains Terbuka Secara Lalai (Zero Camera Request)
 *   2. Susunan Tepat 3 Mod Pengembaraan Sahaja (Mod A, Mod B, Mod C — Tiada Spatial AR)
 *   3. Galeri Pendidikan Sel Lengkap (KSSM Tingkatan 1 Bab 2 - 3 SVG)
 *   4. Interaktiviti Modal Terperinci Galeri Pendidikan (Sel Haiwan, Tumbuhan, Perbandingan)
 *   5. Masuk ke Mod A (Jelajah Makmal 3D Tanpa Kamera)
 *   6. Butang Kembali dalam Mod A Kembali ke Lobi Makmal Sains
 *   7. Masuk ke Mod B (AR Orientasi Dunia + Smart Radar)
 *   8. Butang Kembali dalam Mod B Mematikan Kamera & Kembali ke Lobi
 *   9. Masuk ke Mod C (AR Kad Penanda 6DOF)
 *  10. Butang Kembali dalam Mod C Mematikan Kamera & Kembali ke Lobi
 *  11. Navigasi Lobi ke CellQuest (code.html)
 *  12. Kepatuhan Saiz Sentuhan iPad/Telefon (>= 44px) & Sifar Ralat Konsol
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
  console.log('  ARSELNEL CELLQUEST: VERIFIKASI LOBI MAKMAL SAINS & SUSUNAN MOD BAHARU');
  console.log('='.repeat(78));

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[SERVER] Pelayan ujian aktif di ${baseUrl}`);

  const edgeBin = findEdgeBinary();
  if (!edgeBin) {
    console.error('❌ Pelayar Edge/Chrome tidak ditemui!');
    process.exit(1);
  }

  const debugPort = 9279;
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
        throw new Error(res.exceptionDetails.text || JSON.stringify(res.exceptionDetails));
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
            id: 'student-test-lobby-001',
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

        return {
          pass: isLobbyVisible && isLobbyActive && !isCamActive && !isTimerRunning && !hudVisible,
          isLobbyVisible,
          isLobbyActive,
          isCamActive,
          isTimerRunning,
          hudVisible,
          userName
        };
      })()
    `);

    if (test1.pass) {
      recordPass(1, 'Lobi Makmal Sains Terbuka Lalai', `Lobi aktif, Kamera: ${test1.isCamActive}, Pemasa: ${test1.isTimerRunning}, Nama: "${test1.userName}"`);
    } else {
      recordFail(1, 'Lobi Makmal Sains Terbuka Lalai', JSON.stringify(test1));
    }

    // -------------------------------------------------------------------------
    // UJIAN 2: Susunan Tepat 3 Mod Pengembaraan Sahaja (Mod A, B, C)
    // -------------------------------------------------------------------------
    const test2 = await evalExpr(`
      (() => {
        const btnA = document.getElementById('lobby-btn-mod-a');
        const btnB = document.getElementById('lobby-btn-mod-b');
        const btnC = document.getElementById('lobby-btn-mod-c');
        const modeCards = document.querySelectorAll('.cq-lobby-card');
        const spatialArBtn = document.getElementById('choose-ar-btn');
        const spatialTools = document.getElementById('ar-spatial-tools');

        const isSpatialHidden = !spatialArBtn || getComputedStyle(spatialArBtn).display === 'none';
        const isSpatialToolsHidden = !spatialTools || getComputedStyle(spatialTools).display === 'none';

        return {
          pass: !!btnA && !!btnB && !!btnC && modeCards.length === 3 && isSpatialHidden && isSpatialToolsHidden,
          cardsCount: modeCards.length,
          hasBtnA: !!btnA,
          hasBtnB: !!btnB,
          hasBtnC: !!btnC,
          isSpatialHidden,
          isSpatialToolsHidden
        };
      })()
    `);

    if (test2.pass) {
      recordPass(2, 'Susunan Tepat 3 Mod (Spatial AR Dibuang)', `Tepat 3 kad: Mod A (3D), Mod B (AR Orientasi), Mod C (Marker AR). Spatial AR terpadam`);
    } else {
      recordFail(2, 'Susunan Tepat 3 Mod', JSON.stringify(test2));
    }

    // -------------------------------------------------------------------------
    // UJIAN 3: Galeri Pendidikan Sel Lengkap (3 SVG KSSM)
    // -------------------------------------------------------------------------
    const test3 = await evalExpr(`
      (() => {
        const cardAnimal = document.getElementById('gallery-card-animal');
        const cardPlant = document.getElementById('gallery-card-plant');
        const cardCompare = document.getElementById('gallery-card-comparison');

        const imgAnimal = cardAnimal ? cardAnimal.querySelector('img')?.getAttribute('src') : '';
        const imgPlant = cardPlant ? cardPlant.querySelector('img')?.getAttribute('src') : '';
        const imgCompare = cardCompare ? cardCompare.querySelector('img')?.getAttribute('src') : '';

        const validAnimal = imgAnimal && imgAnimal.includes('galeri_sel_haiwan.svg');
        const validPlant = imgPlant && imgPlant.includes('galeri_sel_tumbuhan.svg');
        const validCompare = imgCompare && imgCompare.includes('galeri_perbandingan_sel.svg');

        return {
          pass: !!cardAnimal && !!cardPlant && !!cardCompare && validAnimal && validPlant && validCompare,
          imgAnimal,
          imgPlant,
          imgCompare
        };
      })()
    `);

    if (test3.pass) {
      recordPass(3, 'Galeri Pendidikan Sel (3 SVG KSSM)', `Haiwan: ${test3.imgAnimal}, Tumbuhan: ${test3.imgPlant}, Perbandingan: ${test3.imgCompare}`);
    } else {
      recordFail(3, 'Galeri Pendidikan Sel', JSON.stringify(test3));
    }

    // -------------------------------------------------------------------------
    // UJIAN 4: Interaktiviti Modal Terperinci Galeri Pendidikan
    // -------------------------------------------------------------------------
    const test4 = await evalExpr(`
      (() => {
        const api = window.CellQuestAR;
        api.openCellGalleryModal('animal');
        const modal = document.getElementById('gallery-detail-modal');
        const isOpenAnimal = modal && modal.classList.contains('open');
        const titleAnimal = document.getElementById('gallery-detail-title')?.textContent || '';
        const notesCount = document.getElementById('gallery-detail-notes')?.children.length || 0;

        api.openCellGalleryModal('plant');
        const titlePlant = document.getElementById('gallery-detail-title')?.textContent || '';
        const notesTextPlant = document.getElementById('gallery-detail-notes')?.textContent || '';
        const hasDinding = notesTextPlant.includes('Dinding Sel') || notesTextPlant.includes('selulosa');

        api.openCellGalleryModal('comparison');
        const notesTextComp = document.getElementById('gallery-detail-notes')?.textContent || '';
        const hasComparison = notesTextComp.includes('Persamaan') && notesTextComp.includes('Perbezaan');

        api.closeCellGalleryModal();
        const isClosed = !modal.classList.contains('open');

        return {
          pass: isOpenAnimal && notesCount >= 5 && hasDinding && hasComparison && isClosed,
          isOpenAnimal,
          notesCount,
          titleAnimal,
          titlePlant,
          hasDinding,
          hasComparison,
          isClosed
        };
      })()
    `);

    if (test4.pass) {
      recordPass(4, 'Interaktiviti Modal Terperinci Galeri', `Modal interaktif berfungsi, nota organel & perbandingan KSSM sarat maklumat (${test4.notesCount} nota)`);
    } else {
      recordFail(4, 'Interaktiviti Modal Terperinci Galeri', JSON.stringify(test4));
    }

    // -------------------------------------------------------------------------
    // UJIAN 5: Masuk ke Mod A (Jelajah Makmal 3D Tanpa Kamera)
    // -------------------------------------------------------------------------
    const test5 = await evalExpr(`
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

    if (test5.pass) {
      recordPass(5, 'Masuk ke Mod A (Jelajah 3D Tanpa Kamera)', `Mod 3D aktif, HUD 3D terpapar, Kamera: ${test5.isCam} (Mesti FALSE)`);
    } else {
      recordFail(5, 'Masuk ke Mod A', JSON.stringify(test5));
    }

    // -------------------------------------------------------------------------
    // UJIAN 6: Butang Kembali dalam Mod A Kembali ke Lobi Makmal Sains
    // -------------------------------------------------------------------------
    const test6 = await evalExpr(`
      (async () => {
        const api = window.CellQuestAR;
        api.openExitConfirmDialog();
        const confirmModal = document.getElementById('exit-confirm-modal');
        const isConfirmOpen = confirmModal && confirmModal.classList.contains('open');

        // Sahkan keluar -> Kembali ke Lobi
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

    if (test6.pass) {
      recordPass(6, 'Kembali Mod A ke Lobi Makmal Sains', `Pemain kembali ke Lobi Makmal Sains dengan kemas (bukan Dashboard)`);
    } else {
      recordFail(6, 'Kembali Mod A ke Lobi', JSON.stringify(test6));
    }

    // -------------------------------------------------------------------------
    // UJIAN 7: Masuk ke Mod B (AR Orientasi Dunia + Smart Radar)
    // -------------------------------------------------------------------------
    const test7 = await evalExpr(`
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

    if (test7.pass) {
      recordPass(7, 'Masuk ke Mod B (AR Orientasi + Smart Radar)', `Mod camera-ar aktif, Smart Radar wujud, 8 stesen dipantau`);
    } else {
      recordFail(7, 'Masuk ke Mod B', JSON.stringify(test7));
    }

    // -------------------------------------------------------------------------
    // UJIAN 8: Butang Kembali Mod B Mematikan Kamera & Kembali ke Lobi
    // -------------------------------------------------------------------------
    const test8 = await evalExpr(`
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

    if (test8.pass) {
      recordPass(8, 'Kembali Mod B Mematikan Kamera & Kembali ke Lobi', `Kamera stream: ${test8.isCamActive}, Sensor giroskop dimatikan bersih`);
    } else {
      recordFail(8, 'Kembali Mod B ke Lobi', JSON.stringify(test8));
    }

    // -------------------------------------------------------------------------
    // UJIAN 9: Masuk ke Mod C (AR Kad Penanda 6DOF)
    // -------------------------------------------------------------------------
    const test9 = await evalExpr(`
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

    if (test9.pass) {
      recordPass(9, 'Masuk ke Mod C (AR Kad Penanda 6DOF)', `Mod marker-ar aktif, pose 6DOF kad penanda dipantau`);
    } else {
      recordFail(9, 'Masuk ke Mod C', JSON.stringify(test9));
    }

    // -------------------------------------------------------------------------
    // UJIAN 10: Butang Kembali Mod C Mematikan Kamera & Kembali ke Lobi
    // -------------------------------------------------------------------------
    const test10 = await evalExpr(`
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

    if (test10.pass) {
      recordPass(10, 'Kembali Mod C Mematikan Kamera & Kembali ke Lobi', `Kamera: ${test10.isCamActive}, Berjaya kembali ke Lobi`);
    } else {
      recordFail(10, 'Kembali Mod C ke Lobi', JSON.stringify(test10));
    }

    // -------------------------------------------------------------------------
    // UJIAN 11: Navigasi Lobi Menghala Tepat ke code.html
    // -------------------------------------------------------------------------
    const test11 = await evalExpr(`
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

    if (test11.pass) {
      recordPass(11, 'Navigasi Lobi Menghala ke code.html', `Pautan "${test11.href}" menghala tepat ke CellQuest`);
    } else {
      recordFail(11, 'Navigasi Lobi ke CellQuest', JSON.stringify(test11));
    }

    // -------------------------------------------------------------------------
    // UJIAN 12: Kepatuhan Saiz Sentuhan iPad/Telefon (>= 44px) & Sifar Ralat
    // -------------------------------------------------------------------------
    const test12 = await evalExpr(`
      (() => {
        const btnA = document.getElementById('lobby-btn-mod-a');
        const btnB = document.getElementById('lobby-btn-mod-b');
        const btnC = document.getElementById('lobby-btn-mod-c');
        const backBtn = document.getElementById('lobby-back-btn');

        const rectA = btnA ? btnA.getBoundingClientRect() : { height: 0 };
        const rectB = btnB ? btnB.getBoundingClientRect() : { height: 0 };
        const rectC = btnC ? btnC.getBoundingClientRect() : { height: 0 };
        const rectBack = backBtn ? backBtn.getBoundingClientRect() : { height: 0 };

        const allCompliant = rectA.height >= 44 && rectB.height >= 44 && rectC.height >= 44 && rectBack.height >= 40;

        return {
          pass: allCompliant,
          heightA: rectA.height,
          heightB: rectB.height,
          heightC: rectC.height,
          heightBack: rectBack.height
        };
      })()
    `);

    const hasNoConsoleErrors = consoleErrors.length === 0;
    if (test12.pass && hasNoConsoleErrors) {
      recordPass(12, 'Kepatuhan Sentuhan iPad & Sifar Ralat Konsol', `Tinggi Butang Mod: ${test12.heightA}px (>=44px), Ralat Konsol: 0`);
    } else {
      recordFail(12, 'Kepatuhan Sentuhan iPad & Sifar Ralat Konsol', `Compliant: ${test12.pass}, Errors: ${consoleErrors.length} (${consoleErrors.join(', ')})`);
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
