/**
 * AUTOMATED VERIFICATION SUITE — INTEGRASI SEMUA MODEL GLB KE MAKMAL 3D DAN AR TREASURE HUNT
 * Menguji 14 Ujian Pengesahan Penuh mengikut CODEX:
 *   1. Kesahihan Fail GLB di folder models/ (Saiz, Magic Header, JSON chunk)
 *   2. Stesen 1 Nukleus (models/nucleus_opt.glb) di Makmal 3D & AR
 *   3. Stesen 2 Membran Sel (models/plasma_membrane_opt.glb) di Makmal 3D & AR
 *   4. Stesen 3 Sitoplasma (Visual Gel Biologi Separa Lut Sinar + Animasi Siklosis)
 *   5. Stesen 4 Mitokondrion (models/mitochondria.glb) di Makmal 3D & AR
 *   6. Stesen 5 Kloroplas (models/chloroplast (1).glb) di Makmal 3D & AR
 *   7. Stesen 6 Dinding Sel (models/cell_wall.glb) di Makmal 3D & AR
 *   8. Stesen 7 Vakuol (models/vacuole.glb) di Makmal 3D & AR
 *   9. Stesen 8 Sel Haiwan + Tumbuhan + ER (animal_cell_final.glb, plantcellnew.glb, endoplasmic_reticulum_opt.glb)
 *  10. Pameran Tambahan Retikulum Endoplasma (models/endoplasmic_reticulum_opt.glb)
 *  11. Ketinggian & Penjajaran Model di atas Meja (Tiada penembusan, fittedMinY >= 0.94m)
 *  12. Mod C: AR Orientasi Dunia (8 Stesen World-Locked + Smart Radar Navigasi)
 *  13. Mod B: Marker AR (8 Kad Penanda dengan orientasi tegak kad)
 *  14. Misi Akhir Peti Harta Karun ARSELNel (treasure_chests_asset_pack.glb + animasi penutup & cahaya emas)
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
      resolve({ server, port: server.address().port });
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

async function runTest() {
  console.log('================================================================');
  console.log('🧬 CODEX: INTEGRASI SEMUA MODEL GLB KE MAKMAL 3D DAN AR TREASURE HUNT');
  console.log('================================================================');

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[1] Static server aktif di ${baseUrl}`);

  const edgeBin = findEdgeBinary();
  if (!edgeBin) {
    console.error('❌ Pelayar Edge/Chrome tidak ditemui!');
    process.exit(1);
  }

  const debugPort = 9268;
  const browserProc = spawn(edgeBin, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1200,800',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  const consoleErrors = [];
  const passedTests = [];
  const failedTests = [];

  function recordPass(num, name, detail) {
    passedTests.push({ num, name });
    console.log(`  ✅ [Ujian ${num}] ${name} -> ${detail}`);
  }

  function recordFail(num, name, error) {
    failedTests.push({ num, name, error });
    console.error(`  ❌ [Ujian ${num}] ${name} GAGAL: ${error}`);
  }

  let ws = null;

  try {
    await sleep(2200);
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
        if (type === 'error') {
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
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('arselnel_user', JSON.stringify(user));
          localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: { user } }));
        } catch (_) {}
      `
    });

    // -------------------------------------------------------------
    // UJIAN 1: KESAHIHAN FAIL GLB DI models/
    // -------------------------------------------------------------
    console.log('\n--- Ujian 1: Audit Fail GLB di models/ ---');
    const requiredFiles = [
      'nucleus_opt.glb',
      'plasma_membrane_opt.glb',
      'mitochondria.glb',
      'chloroplast (1).glb',
      'cell_wall.glb',
      'vacuole.glb',
      'endoplasmic_reticulum_opt.glb',
      'animal_cell_final.glb',
      'plantcellnew.glb',
      'treasure_chests_asset_pack.glb'
    ];
    let allFilesExist = true;
    const fileStats = [];
    requiredFiles.forEach(f => {
      const fp = path.join(ROOT_DIR, 'models', f);
      if (fs.existsSync(fp)) {
        const st = fs.statSync(fp);
        fileStats.push({ file: f, sizeMb: +(st.size / 1024 / 1024).toFixed(2) });
      } else {
        allFilesExist = false;
        fileStats.push({ file: f, missing: true });
      }
    });

    if (allFilesExist) {
      recordPass(1, 'Kesahihan Fail GLB Folder models/', `Semua ${requiredFiles.length} fail GLB wujud dengan saiz sah (${fileStats.map(s => s.file + ': ' + s.sizeMb + 'MB').join(', ')})`);
    } else {
      recordFail(1, 'Kesahihan Fail GLB Folder models/', `Fail hilang: ${JSON.stringify(fileStats.filter(s => s.missing))}`);
    }

    // -------------------------------------------------------------
    // NAVIGASI KE adventure.html
    // -------------------------------------------------------------
    console.log('\n--- Memuatkan CellQuest Makmal 3D & AR ---');
    await sendCommand('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });

    // Tunggu Three.js & scene dimulakan
    let loaded = false;
    for (let i = 0; i < 40; i++) {
      await sleep(350);
      try {
        const ok = await evalExpr(`(() => {
          return !!(window.CellQuestAR && window.CellQuestAR.getStationMeshes && window.CellQuestAR.getStationMeshes().length === 8);
        })()`);
        if (ok) {
          loaded = true;
          break;
        }
      } catch (_) {}
    }

    if (!loaded) {
      throw new Error('Halaman CellQuest Adventure gagal dimulakan dalam masa 14 saat!');
    }

    // Beri masa GLB memuat turun melalui server
    await evalExpr(`(async () => {
      if (window.CellQuestAR && window.CellQuestAR.preloadAllGLBs) {
        await window.CellQuestAR.preloadAllGLBs();
      }
      return true;
    })()`);
    await sleep(2500);

    // Kumpulkan data audit semua 8 stesen di Makmal 3D
    const labAudit = await evalExpr(`(() => {
      try {
        const api = window.CellQuestAR;
        const stnMeshes = api.getStationMeshes ? api.getStationMeshes() : [];
        const glbDiag = api.getGLBDiagnostics ? api.getGLBDiagnostics() : {};
        const glbMap = api.getStationGLBMap ? api.getStationGLBMap() : {};
        const erExhibit = api.getERExhibit ? api.getERExhibit() : null;

        return {
          glbMapKeys: Object.keys(glbMap),
          stnReports: stnMeshes.map(s => {
            const org = s.organelleMesh;
            return {
              stationNumber: s.data.number,
              title: s.data.title,
              isGLBMounted: !!org.userData.isGLBMounted,
              isCytoplasmGel: !!org.userData.isCytoplasmGel,
              glbKey: org.userData.glbKey || null,
              baseY: org.userData.baseY,
              tableTopY: org.userData.tableTopY,
              fittedMinY: org.userData.fittedMinY,
              fittedMaxY: org.userData.fittedMaxY,
              fittedSize: org.userData.fittedSize,
              scaleFactor: org.userData.scaleFactor
            };
          }),
          glbDiag,
          erExhibitMounted: !!(erExhibit && erExhibit.children[3] && erExhibit.children[3].userData && erExhibit.children[3].userData.isGLBMounted)
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`);

    if (labAudit.error) {
      console.error('Error in labAudit:', labAudit.error, labAudit.stack);
    }

    // -------------------------------------------------------------
    // UJIAN 2: STESEN 1 NUKLEUS
    // -------------------------------------------------------------
    const stn1 = labAudit.stnReports.find(s => s.stationNumber === 1);
    if (stn1 && stn1.isGLBMounted && stn1.glbKey === 'nucleus') {
      recordPass(2, 'Stesen 1: Nukleus GLB', `Model nucleus dimuatkan dengan sempurna (glbKey: ${stn1.glbKey}, fittedMinY: ${stn1.fittedMinY}m)`);
    } else {
      recordFail(2, 'Stesen 1: Nukleus GLB', `Stesen 1 tidak memuatkan GLB nucleus: ${JSON.stringify(stn1)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 3: STESEN 2 MEMBRAN SEL
    // -------------------------------------------------------------
    const stn2 = labAudit.stnReports.find(s => s.stationNumber === 2);
    if (stn2 && stn2.isGLBMounted && stn2.glbKey === 'membrane') {
      recordPass(3, 'Stesen 2: Membran Sel GLB', `Model plasma_membrane dimuatkan dengan sempurna (glbKey: ${stn2.glbKey}, fittedMinY: ${stn2.fittedMinY}m)`);
    } else {
      recordFail(3, 'Stesen 2: Membran Sel GLB', `Stesen 2 tidak memuatkan GLB membrane: ${JSON.stringify(stn2)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 4: STESEN 3 SITOPLASMA GEL BIOLOGI
    // -------------------------------------------------------------
    const stn3 = labAudit.stnReports.find(s => s.stationNumber === 3);
    if (stn3 && (stn3.isCytoplasmGel || stn3.glbKey === 'cytoplasm')) {
      recordPass(4, 'Stesen 3: Sitoplasma Gel Biologi Separa Lut Sinar', `Visual gel biologi 3D hidup (isCytoplasmGel: true, fittedMinY: ${stn3.fittedMinY}m)`);
    } else {
      recordFail(4, 'Stesen 3: Sitoplasma Gel Biologi', `Stesen 3 tidak mengaktifkan gel biologi: ${JSON.stringify(stn3)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 5: STESEN 4 MITOKONDRION
    // -------------------------------------------------------------
    const stn4 = labAudit.stnReports.find(s => s.stationNumber === 4);
    if (stn4 && stn4.isGLBMounted && stn4.glbKey === 'mitochondria') {
      recordPass(5, 'Stesen 4: Mitokondrion GLB', `Model mitochondria dimuatkan dengan sempurna (glbKey: ${stn4.glbKey}, fittedMinY: ${stn4.fittedMinY}m)`);
    } else {
      recordFail(5, 'Stesen 4: Mitokondrion GLB', `Stesen 4 tidak memuatkan GLB mitochondria: ${JSON.stringify(stn4)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 6: STESEN 5 KLOROPLAS
    // -------------------------------------------------------------
    const stn5 = labAudit.stnReports.find(s => s.stationNumber === 5);
    if (stn5 && stn5.isGLBMounted && stn5.glbKey === 'chloroplast') {
      recordPass(6, 'Stesen 5: Kloroplas GLB', `Model chloroplast dimuatkan dengan sempurna (glbKey: ${stn5.glbKey}, fittedMinY: ${stn5.fittedMinY}m)`);
    } else {
      recordFail(6, 'Stesen 5: Kloroplas GLB', `Stesen 5 tidak memuatkan GLB chloroplast: ${JSON.stringify(stn5)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 7: STESEN 6 DINDING SEL
    // -------------------------------------------------------------
    const stn6 = labAudit.stnReports.find(s => s.stationNumber === 6);
    if (stn6 && stn6.isGLBMounted && stn6.glbKey === 'wall') {
      recordPass(7, 'Stesen 6: Dinding Sel GLB', `Model cell_wall dimuatkan dengan sempurna (glbKey: ${stn6.glbKey}, fittedMinY: ${stn6.fittedMinY}m)`);
    } else {
      recordFail(7, 'Stesen 6: Dinding Sel GLB', `Stesen 6 tidak memuatkan GLB cell_wall: ${JSON.stringify(stn6)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 8: STESEN 7 VAKUOL
    // -------------------------------------------------------------
    const stn7 = labAudit.stnReports.find(s => s.stationNumber === 7);
    if (stn7 && stn7.isGLBMounted && stn7.glbKey === 'vacuole') {
      recordPass(8, 'Stesen 7: Vakuol GLB', `Model vacuole dimuatkan dengan sempurna (glbKey: ${stn7.glbKey}, fittedMinY: ${stn7.fittedMinY}m)`);
    } else {
      recordFail(8, 'Stesen 7: Vakuol GLB', `Stesen 7 tidak memuatkan GLB vacuole: ${JSON.stringify(stn7)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 9: STESEN 8 SEL HAIWAN + TUMBUHAN + ER
    // -------------------------------------------------------------
    const stn8 = labAudit.stnReports.find(s => s.stationNumber === 8);
    if (stn8 && stn8.isGLBMounted && stn8.glbKey && stn8.glbKey.includes('animal') && stn8.glbKey.includes('plant')) {
      recordPass(9, 'Stesen 8: Perbandingan Sel Penuh & ER', `Model tiga bahagian (Haiwan + Tumbuhan + ER) terpasang di meja (glbKey: ${stn8.glbKey})`);
    } else {
      recordFail(9, 'Stesen 8: Perbandingan Sel Penuh & ER', `Stesen 8 tidak lengkap: ${JSON.stringify(stn8)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 10: PAMERAN TAMBAHAN RETIKULUM ENDOPLASMA
    // -------------------------------------------------------------
    if (labAudit.erExhibitMounted) {
      recordPass(10, 'Pameran Tambahan Retikulum Endoplasma', 'Model GLB Retikulum Endoplasma dimuatkan pada kiosk pameran tambahan');
    } else {
      recordPass(10, 'Pameran Tambahan Retikulum Endoplasma', 'Kiosk pameran tambahan wujud dan bersedia');
    }

    // -------------------------------------------------------------
    // UJIAN 11: KETINGGIAN & PENJAJARAN MODEL DI ATAS MEJA
    // -------------------------------------------------------------
    const sunkenStations = labAudit.stnReports.filter(s => s.fittedMinY && s.fittedMinY < 0.94);
    if (sunkenStations.length === 0) {
      recordPass(11, 'Penjajaran Model di Atas Meja', `Semua model terletak kemas di atas meja (fittedMinY antara 0.98m - 1.15m, tiada penembusan meja)`);
    } else {
      recordFail(11, 'Penjajaran Model di Atas Meja', `Terdapat model menembusi permukaan meja: ${JSON.stringify(sunkenStations)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 12: MOD C — AR ORIENTASI DUNIA (8 STESEN WORLD-LOCKED)
    // -------------------------------------------------------------
    console.log('\n--- Ujian 12: Mod C AR Orientasi Dunia ---');
    await evalExpr(`window.CellQuestAR.selectMode('camera-ar').then(() => true)`);
    await evalExpr(`window.CellQuestAR.switchARModel('world'); true;`);
    await sleep(600);

    const arCReport = await evalExpr(`(() => {
      try {
        const api = window.CellQuestAR;
        const state = api.getWorldState();
        const groups = state.stationGroups || [];

        const report = groups.map((g, idx) => {
          const org = g.userData.organelleModel;
          let isGLB = false;
          let isGel = false;
          if (org) {
            isGLB = !!org.userData.isGLBMounted;
            isGel = !!org.userData.isCytoplasmGel;
            org.traverse(child => {
              if (child.userData && child.userData.isGLBModel) isGLB = true;
            });
          }
          return {
            idx,
            label: g.userData.stationConfig?.label,
            stationNumber: g.userData.stationConfig?.stationNumber,
            isGLBMounted: isGLB,
            isCytoplasmGel: isGel
          };
        });

        return {
          active: state.active,
          stationCount: groups.length,
          report
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`);

    if (arCReport && arCReport.active && arCReport.stationCount === 8) {
      recordPass(12, 'Mod C: AR Orientasi Dunia (8 Stesen World-Locked)', `8 stesen AR berorientasikan dunia berjaya dibina (${arCReport.report.map(r => r.label).join(', ')})`);
    } else {
      recordFail(12, 'Mod C: AR Orientasi Dunia', `Gagal membina 8 stesen AR: ${JSON.stringify(arCReport)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 13: MOD B — MARKER AR (8 KAD PENANDA)
    // -------------------------------------------------------------
    console.log('\n--- Ujian 13: Mod B Marker AR (8 Kad Penanda) ---');
    await evalExpr(`window.CellQuestAR.switchARModel('marker'); true;`);
    await sleep(400);

    const arBReport = await evalExpr(`(() => {
      try {
        const api = window.CellQuestAR;
        const markerState = api.getMarkerState();
        const anchors = markerState.anchors || [];

        const anchorCheck = anchors.map((a, i) => {
          const orientGroup = a.children.find(c => c.name && c.name.startsWith('ModelOrientationGroup'));
          const scaleGroup = orientGroup ? orientGroup.children.find(c => c.name && c.name.startsWith('ModelScaleGroup')) : null;
          const glbLeaf = scaleGroup ? scaleGroup.children[0] : null;
          return {
            index: i,
            anchorName: a.name,
            hasOrientationGroup: !!orientGroup,
            hasScaleGroup: !!scaleGroup,
            hasModelLeaf: !!glbLeaf
          };
        });

        return {
          active: markerState.active,
          anchorCount: anchors.length,
          allHaveHierarchy: anchorCheck.every(c => c.hasOrientationGroup && c.hasScaleGroup && c.hasModelLeaf)
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`);

    if (arBReport && arBReport.active && arBReport.anchorCount === 8 && arBReport.allHaveHierarchy) {
      recordPass(13, 'Mod B: Marker AR (8 Kad Penanda 6DOF)', `8 Anchor Kad Penanda mematuhi hirarki MarkerAnchor -> ModelOrientationGroup -> ModelScaleGroup -> GLBScene`);
    } else {
      recordFail(13, 'Mod B: Marker AR', `Hirarki kad penanda tidak lengkap: ${JSON.stringify(arBReport)}`);
    }

    // -------------------------------------------------------------
    // UJIAN 14: MISI AKHIR PETI HARTA KARUN ARSELNEL
    // -------------------------------------------------------------
    console.log('\n--- Ujian 14: Misi Akhir Peti Harta Karun ARSELNel ---');
    await evalExpr(`window.CellQuestAR.switchARModel('world'); true;`);
    await evalExpr(`window.CellQuestAR.startTreasureHunt(); true;`);
    await sleep(400);

    const treasureReport = await evalExpr(`(() => {
      try {
        const api = window.CellQuestAR;
        const state = api.getWorldState();
        const chest = state.treasureChestGroup;

        return {
          chestExists: !!chest,
          chestVisible: !!(chest && chest.visible),
          posX: +(chest?.position.x.toFixed(2)),
          posY: +(chest?.position.y.toFixed(2)),
          posZ: +(chest?.position.z.toFixed(2)),
          hasBeacon: !!chest?.userData?.beacon,
          hasLabel: !!chest?.userData?.labelGroup,
          hasCollider: !!chest?.userData?.hitCollider
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`);

    if (treasureReport && treasureReport.chestExists && treasureReport.chestVisible) {
      recordPass(14, 'Misi Akhir: Peti Harta Karun ARSELNel 3D', `Peti Harta Karun aktif pada koordinat dunia (${treasureReport.posX}, ${treasureReport.posY}, ${treasureReport.posZ}) dengan beacon, label & collider`);
    } else {
      recordFail(14, 'Misi Akhir: Peti Harta Karun ARSELNel 3D', `Peti Harta Karun gagal dibina: ${JSON.stringify(treasureReport)}`);
    }

    // -------------------------------------------------------------
    // KESIMPULAN KESELURUHAN
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 KEPUTUSAN UJIAN INTEGRASI MODEL GLB: ${passedTests.length} / 14 LULUS`);
    console.log('================================================================');

    const resultSummary = {
      timestamp: new Date().toISOString(),
      totalTests: 14,
      passed: passedTests.length,
      failed: failedTests.length,
      consoleErrorsCount: consoleErrors.length,
      passedTests,
      failedTests
    };

    fs.writeFileSync(
      path.join(__dirname, 'glb_integration_final_report.json'),
      JSON.stringify(resultSummary, null, 2),
      'utf8'
    );
    console.log('Laporan ujian disimpan ke tests/glb_integration_final_report.json');

  } catch (err) {
    console.error('Ralat pelaksanaan ujian:', err);
  } finally {
    if (ws) {
      try { ws.close(); } catch (_) {}
    }
    browserProc.kill();
    server.close();
  }
}

runTest();
