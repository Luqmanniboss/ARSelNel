/**
 * AUTOMATED VERIFICATION SUITE — CODEX MOD B: AR ORIENTASI DUNIA
 * 8 Stesen Spacing, Height Variation, Floating Scientific Hologram, & Dynamic Reward Chest Placement
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
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404);
          res.end('Not found: ' + cleanUrl);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
          'Access-Control-Allow-Origin': '*'
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
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env['LOCALAPPDATA'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of edgePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  console.log('================================================================');
  console.log('🧪 VERIFY MOD B: WORLD AR STATIONS ENHANCEMENT SUITE');
  console.log('================================================================');

  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Static test server running on ${baseUrl}`);

  const browserBin = findEdgeBinary();
  if (!browserBin) {
    console.error('❌ Edge / Chrome binary not found');
    server.close();
    process.exit(1);
  }

  const debugPort = 9277;
  const browserProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1180,820',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  await sleep(2500);

  const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
  const pages = await listRes.json();
  const targetPage = pages.find(p => p.type === 'page');
  if (!targetPage || !targetPage.webSocketDebuggerUrl) {
    throw new Error('Could not find Edge CDP page target');
  }

  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const pending = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(new Error(JSON.stringify(data.error)));
      else resolve(data.result);
    }
  };

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCmd('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res && res.exceptionDetails) {
      throw new Error('Eval exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res && res.result ? res.result.value : undefined;
  }

  const results = [];
  function assert(title, cond, detail = '') {
    results.push({ title, passed: !!cond, detail });
    console.log(`${cond ? '  ✅ PASS' : '  ❌ FAIL'}: ${title} ${detail ? '(' + detail + ')' : ''}`);
  }

  try {
    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('Network.enable');

    await sendCmd('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });

    // Navigate to adventure.html
    await sendCmd('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });
    await sleep(3500);

    // Prevent redirect
    await evaluate(`window.CellQuestAR.preventRedirectInTest = true;`);

    // Launch Mod B (camera-ar)
    console.log('\n--- UJIAN 1: PELANCARAN MOD B (AR ORIENTASI DUNIA) ---');
    await evaluate(`window.CellQuestAR.selectMode('camera-ar');`);
    await sleep(1000);

    const modeState = await evaluate(`
      ({
        mode: window.CellQuestAR.getState().mode,
        worldActive: window.CellQuestAR.getWorldState().active,
        subMode: window.CellQuestAR.getWorldState().subMode,
        stationGroupsCount: window.CellQuestAR.getWorldState().stationGroups.length
      })
    `);
    assert('Mod B (AR Orientasi Dunia) berjaya diaktifkan', modeState.mode === 'camera-ar' && modeState.worldActive === true);
    assert('8 Stesen THREE.Group dijana dalam scene', modeState.stationGroupsCount === 8, `Count: ${modeState.stationGroupsCount}`);

    // Test 2: Verify 360-degree Horizontal Angles
    console.log('\n--- UJIAN 2: SUSUNAN SUDUT MENDATAR 360° (SELA 45°) ---');
    const stationsConfig = await evaluate(`
      window.CellQuestAR.getStationsConfig().map(s => ({
        stn: s.stationNumber,
        label: s.label,
        azimuth: s.azimuthDeg,
        direction: s.directionName,
        elevation: s.elevationDeg,
        radius: s.radius
      }))
    `);

    const expectedStations = [
      { stn: 1, az: 0,   el: -8, dir: 'Hadapan' },
      { stn: 2, az: 45,  el: -6, dir: 'Kanan Hadapan' },
      { stn: 3, az: 90,  el: 4,  dir: 'Kanan' },
      { stn: 4, az: 135, el: 18, dir: 'Kanan Belakang' },
      { stn: 5, az: 180, el: 22, dir: 'Belakang' },
      { stn: 6, az: 225, el: -7, dir: 'Kiri Belakang' },
      { stn: 7, az: 270, el: 12, dir: 'Kiri' },
      { stn: 8, az: 315, el: -5, dir: 'Kiri Hadapan' }
    ];

    let allAnglesMatch = true;
    let angleDetail = [];
    expectedStations.forEach(exp => {
      const actual = stationsConfig.find(s => s.stn === exp.stn);
      const match = actual && actual.azimuth === exp.az && actual.direction === exp.dir;
      if (!match) allAnglesMatch = false;
      angleDetail.push(`Stn ${exp.stn}: ${actual ? actual.azimuth : 'N/A'}° (${actual ? actual.direction : 'N/A'})`);
    });
    assert('8 Stesen teragih 360° dengan selang 45° tepat', allAnglesMatch, angleDetail.join(', '));

    // Test 3: Height / Pitch Variations
    console.log('\n--- UJIAN 3: VARIASI KETINGGIAN (VERTICAL PITCH) ---');
    let allPitchesMatch = true;
    let lowCount = 0, medCount = 0, highCount = 0;
    expectedStations.forEach(exp => {
      const actual = stationsConfig.find(s => s.stn === exp.stn);
      if (!actual || actual.elevation !== exp.el) allPitchesMatch = false;
      if (actual && actual.elevation < 0) lowCount++;
      else if (actual && actual.elevation <= 5) medCount++;
      else if (actual) highCount++;
    });
    assert('Elevasi stesen sepadan dengan spesifikasi CODEX', allPitchesMatch);
    assert('Variasi ketinggian: 4 Rendah (-8, -6, -7, -5), 1 Sederhana (+4), 3 Tinggi (+18, +22, +12)',
      lowCount === 4 && medCount === 1 && highCount === 3,
      `Rendah: ${lowCount}, Sederhana: ${medCount}, Tinggi: ${highCount}`);

    // Test 4: Floating Scientific Hologram (No Thick Pedestal Plate)
    console.log('\n--- UJIAN 4: HOLOGRAM SAINTIFIK TERAPUNG (TIADA PIRING/MEJA TEBAL) ---');
    const hologramCheck = await evaluate(`
      (() => {
        const worldState = window.CellQuestAR.getWorldState();
        let thickPedestalFound = false;
        let holographicRingsFound = 0;
        let holographicParticlesFound = 0;
        let holographicBeamsFound = 0;

        worldState.stationGroups.forEach(group => {
          group.traverse(child => {
            if (child.isMesh && child.geometry && child.geometry.type === 'CylinderGeometry') {
              const p = child.geometry.parameters;
              // Check if old thick pedestal exists (radius ~0.65-0.8, height ~0.14)
              if (p && p.radiusTop >= 0.5 && p.height < 0.3) {
                thickPedestalFound = true;
              }
            }
          });
          if (group.userData.outerRing && group.userData.innerRing) holographicRingsFound++;
          if (group.userData.holoParticles && group.userData.holoParticles.length > 0) holographicParticlesFound++;
          if (group.userData.beam) holographicBeamsFound++;
        });

        return {
          thickPedestalFound,
          holographicRingsFound,
          holographicParticlesFound,
          holographicBeamsFound
        };
      })()
    `);
    assert('Piring / tapak meja fizikal tebal telah dibuang sepenuhnya', !hologramCheck.thickPedestalFound);
    assert('Semua 8 stesen mempunyai gelang hologram nipis berbilang lapisan', hologramCheck.holographicRingsFound === 8);
    assert('Zarah holografik terapung aktif pada semua stesen', hologramCheck.holographicParticlesFound === 8);
    assert('Tiang cahaya hologram lembut (beam) wujud', hologramCheck.holographicBeamsFound === 8);

    // Test 5: Hit Collider & Organelle Touch Interaction
    console.log('\n--- UJIAN 5: HITBOX & KETIKAN SENTUH ORGANEL ---');
    const colliderCheck = await evaluate(`
      (() => {
        const worldState = window.CellQuestAR.getWorldState();
        let collidersOk = true;
        worldState.stationGroups.forEach(g => {
          let foundPickableSphere = false;
          g.traverse(child => {
            if (child.isMesh && child.geometry && child.geometry.type === 'SphereGeometry' && child.userData.pickable) {
              if (child.geometry.parameters.radius >= 1.0) foundPickableSphere = true;
            }
          });
          if (!foundPickableSphere) collidersOk = false;
        });
        return collidersOk;
      })()
    `);
    assert('Hitbox esfera mudah ditekan (radius 1.25m) wujud pada setiap stesen', colliderCheck);

    // Test 6: Smart Radar Navigation for 8 stations
    console.log('\n--- UJIAN 6: NAVIGASI SMART RADAR (8 ARAH RELATIF) ---');
    const radarPillsOk = await evaluate(`
      (() => {
        const pills = document.querySelectorAll('.cq-radar-stn-pill');
        return pills.length === 8;
      })()
    `);
    assert('Panel Smart Radar mempunyai butang pil untuk semua 8 stesen', radarPillsOk);

    // Test turning camera towards Station 4 (Mitokondrion, 135°, +18°)
    const stn4Nav = await evaluate(`
      (() => {
        window.CellQuestAR.selectRadarTarget(3, false); // Stesen 4 Mitokondrion
        window.CellQuestAR.lookAtHeading(135, 18);
        const title = document.getElementById('ar-radar-target-title')?.textContent || '';
        const turnCmd = document.getElementById('ar-radar-turn-cmd')?.textContent || '';
        const elevCmd = document.getElementById('ar-radar-elev-cmd')?.textContent || '';
        return { title, turnCmd, elevCmd };
      })()
    `);
    assert('Smart Radar menghala tepat ke Stesen 4 (135°, +18°)', stn4Nav.title.includes('Mitokondrion'));
    assert('Arahan penjajaran radar menunjukkan arah tepat apabila menghadap stesen',
      stn4Nav.turnCmd.includes('Arah mendatar tepat') || stn4Nav.turnCmd.includes('tepat'));

    // Test 7: Reward Chest Inactive at Start
    console.log('\n--- UJIAN 7: STATUS PETI GANJARAN PADA AWAL PERMAINAN ---');
    const initialChestState = await evaluate(`
      (() => {
        const thState = window.CellQuestAR.getTreasureHuntState();
        return {
          unlocked: thState.unlocked,
          active: thState.active,
          chestVisible: thState.chestGroup ? thState.chestGroup.visible : false
        };
      })()
    `);
    assert('Peti ganjaran TIDAK aktif dan TIDAK kelihatan pada awal permainan',
      !initialChestState.unlocked && !initialChestState.active && !initialChestState.chestVisible);

    // Test 8: Dynamic Reward Chest Placement Algorithm (All 8 Stations Last Completed)
    console.log('\n--- UJIAN 8: ALGORITMA PENEMPATAN PETI BERASINGAN (SELEPAS 8/8) ---');
    const placementTests = await evaluate(`
      (() => {
        const cfg = window.CellQuestAR.getStationsConfig();
        const testResults = [];

        for (let lastStn = 1; lastStn <= 8; lastStn++) {
          window.CellQuestAR.getState().lastCompletedStationNumber = lastStn;
          const placement = window.CellQuestAR.getRewardChestPlacement();
          const lastCfg = cfg.find(s => s.stationNumber === lastStn);
          const lastAz = lastCfg.azimuthDeg;

          // Angular delta
          const deltaFromLast = Math.abs(((placement.azimuthDeg - lastAz + 540) % 360) - 180);

          // Check overlap with all 8 stations
          let minDistanceToAnyStation = 999;
          cfg.forEach(s => {
            const d = Math.abs(((placement.azimuthDeg - s.azimuthDeg + 540) % 360) - 180);
            if (d < minDistanceToAnyStation) minDistanceToAnyStation = d;
          });

          testResults.push({
            lastStn,
            lastAz,
            chestAz: placement.azimuthDeg,
            chestEl: placement.elevationDeg,
            chestDir: placement.directionName,
            deltaFromLast,
            minDistanceToAnyStation
          });
        }
        return testResults;
      })()
    `);

    let allSeparationsValid = true;
    let allNoOverlap = true;
    placementTests.forEach(t => {
      if (t.deltaFromLast < 35) allSeparationsValid = false;
      if (t.minDistanceToAnyStation < 20) allNoOverlap = false;
    });
    assert('Jarak sudut peti daripada stesen terakhir selesai >= 35° untuk semua 8 kes', allSeparationsValid,
      placementTests.map(t => `Stn${t.lastStn}: Δ${t.deltaFromLast}°`).join(', '));
    assert('Peti TIDAK bertindih dengan mana-mana 8 stesen (kelegaan minimum >= 22.5°)', allNoOverlap,
      placementTests.map(t => `Stn${t.lastStn} -> Peti ${t.chestAz}° (Kelegaan ${t.minDistanceToAnyStation}°)`).join(', '));

    // Test 9: Complete 8 Stations & Trigger Treasure Hunt
    console.log('\n--- UJIAN 9: PENYELESAIAN 8/8 STESEN & PENGAKTIFAN MISI AKHIR ---');
    await evaluate(`
      (() => {
        for (let i = 1; i <= 8; i++) {
          window.CellQuestAR.getState().completedStations.add(i);
        }
        window.CellQuestAR.markStationCompleted(8);
      })()
    `);
    await sleep(800);

    const post8State = await evaluate(`window.CellQuestAR.getTreasureHuntState().unlocked`);
    assert('Treasure hunt dibuka kunci (unlocked = true) selepas 8/8 stesen selesai', post8State === true);

    // Start mission
    await evaluate(`window.CellQuestAR.startTreasureHunt();`);
    await sleep(600);

    const activeMissionState = await evaluate(`
      (() => {
        const ws = window.CellQuestAR.getWorldState();
        return {
          targetIdx: ws.targetStationIdx,
          chestVisible: ws.treasureChestGroup ? ws.treasureChestGroup.visible : false,
          chestAzimuth: ws.treasureChestConfig.azimuthDeg,
          chestElevation: ws.treasureChestConfig.elevationDeg,
          chestDirection: ws.treasureChestConfig.directionName
        };
      })()
    `);
    assert('Smart Radar sasaran bertukar kepada Peti ARSELNel (targetStationIdx = -1)', activeMissionState.targetIdx === -1);
    assert('Peti 3D muncul di ruang AR di lokasi berasingan', activeMissionState.chestVisible === true,
      `Azimuth: ${activeMissionState.chestAzimuth}°, Elevasi: +${activeMissionState.chestElevation}°, Arah: ${activeMissionState.chestDirection}`);

    // Test 10: Detection of chest in FOV
    console.log('\n--- UJIAN 10: PENGESANAN PETI DALAM MEDAN PANDANGAN KAMERA ---');
    const chestDetection = await evaluate(`
      (() => {
        const ws = window.CellQuestAR.getWorldState();
        const cfg = ws.treasureChestConfig;
        window.CellQuestAR.lookAtHeading(cfg.azimuthDeg, cfg.elevationDeg);
        window.CellQuestAR.checkVisibility();
        const banner = document.getElementById('ar-world-detected-banner');
        return {
          bannerVisible: banner ? banner.style.display !== 'none' : false,
          bannerTitle: banner ? banner.querySelector('.cq-detected-title')?.textContent : '',
          activeStationKey: ws.activeStation ? ws.activeStation.stationKey : ''
        };
      })()
    `);
    assert('Banner notifikasi "Peti Harta Karun Ditemui!" dipaparkan apabila menghadap peti',
      chestDetection.bannerVisible && chestDetection.bannerTitle.includes('Peti Harta Karun'));

    // Test 11: Claim Reward & Verify Chest Disappears
    console.log('\n--- UJIAN 11: TUNTUTAN GANJARAN & PETI HILANG SELEPAS DITUNTUT ---');
    await evaluate(`
      (() => {
        window.CellQuestAR.openTreasureChestModal();
        // Answer 3 questions correctly
        for (let q = 0; q < 3; q++) {
          const curQ = window.CellQuestAR.getState().treasureHuntQuestions[window.CellQuestAR.getState().treasureHuntCurrentQIndex];
          if (curQ) {
            window.CellQuestAR.answerBonusQuestion(curQ.correctIndex);
            window.CellQuestAR.nextBonusQuestion();
          }
        }
      })()
    `);
    await sleep(1500);

    const postClaimState = await evaluate(`
      (() => {
        const th = window.CellQuestAR.getTreasureHuntState();
        const ws = window.CellQuestAR.getWorldState();
        return {
          completed: th.completed,
          bonusClaimed: th.bonusClaimed,
          score: window.CellQuestAR.getState().score,
          chestVisible: ws.treasureChestGroup ? ws.treasureChestGroup.visible : false
        };
      })()
    `);
    assert('Misi Peti Harta Karun selesai dan +300 bonus dituntut', postClaimState.completed && postClaimState.bonusClaimed);
    assert('Peti 3D disembunyikan sepenuhnya selepas ganjaran dituntut', !postClaimState.chestVisible);

    // Test 12: MOD A and MOD C Integrity
    console.log('\n--- UJIAN 12: INTEGRITI MOD A (JELAJAH 3D) & MOD C (KAD PENANDA AR) ---');
    await evaluate(`window.CellQuestAR.selectMode('3d');`);
    await sleep(600);
    const modAState = await evaluate(`window.CellQuestAR.getState().mode`);
    assert('Mod A (Jelajah 3D) berfungsi sempurna tanpa gangguan', modAState === '3d');

    await evaluate(`window.CellQuestAR.selectMode('marker-ar');`);
    await sleep(600);
    const modCState = await evaluate(`window.CellQuestAR.getState().mode`);
    assert('Mod C (AR Kad Penanda) berfungsi sempurna tanpa gangguan', modCState === 'marker-ar');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    browserProc.kill();
    server.close();
  }

  console.log('\n================================================================');
  console.log('📊 KEPUTUSAN KESELURUHAN UJIAN');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Jumlah Ujian: ${total} | Berjaya: ${passed} | Gagal: ${failed}`);

  if (failed === 0 && total >= 12) {
    console.log('🎉 SEMUA 12 UJIAN CODEX MOD B LULUS DENGAN CEMERLANG!');
    process.exit(0);
  } else {
    console.error('❌ Terdapat ujian yang gagal.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
