/**
 * AUTOMATED VERIFICATION SUITE:
 * - BAHAGIAN 1 & 10: UJIAN MOD B (MARKER AR ORIENTATION — 7 UJIAN WAJIB)
 * - BAHAGIAN 2–8 & 10: UJIAN MOD C (WORLD ORIENTATION AR + SMART RADAR — 13 UJIAN WAJIB)
 * Menggunakan Microsoft Edge Headless + Chrome DevTools Protocol (CDP)
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

(async () => {
  const { server, port } = await startStaticServer();
  const baseUrl = `http://localhost:${port}`;
  const outDir = path.join(ROOT_DIR, 'tests', 'screenshots_marker_radar_ar');
  fs.mkdirSync(outDir, { recursive: true });

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const debugPort = 9249;
  const chrome = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--window-size=1194,834', // iPad Pro 11-inch Landscape
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  const consoleErrors = [];
  const failed404s = [];

  try {
    await sleep(2200);
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
      } else if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params?.exceptionDetails?.text || 'Runtime exception');
      } else if (data.method === 'Network.responseReceived') {
        const resp = data.params?.response;
        if (resp && resp.status >= 400 && !resp.url.includes('favicon')) {
          failed404s.push(`${resp.status}: ${resp.url}`);
        }
      }
    };

    function sendCDP(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCDP('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error('Eval exception: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
      }
      return res.result ? res.result.value : undefined;
    }

    async function screenshot(filename) {
      const snap = await sendCDP('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(outDir, filename);
      fs.writeFileSync(filePath, Buffer.from(snap.data, 'base64'));
      return filePath;
    }

    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');
    await sendCDP('Network.enable');
    await sendCDP('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        try {
          const user = { id: 'student_1', name: 'Aina Safiyah', nickname: 'Aina', role: 'student' };
          localStorage.setItem('arselnel_current_user', JSON.stringify(user));
          sessionStorage.setItem('arselnel_current_user', JSON.stringify(user));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch(e) {}
      `
    });
    try {
      await sendCDP('Browser.grantPermissions', {
        origin: baseUrl,
        permissions: ['videoCapture', 'sensors']
      });
    } catch (_) {}
    await sendCDP('Emulation.setDeviceMetricsOverride', {
      width: 1194,
      height: 834,
      deviceScaleFactor: 2,
      mobile: true
    });

    await sendCDP('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });
    await sleep(3500);

    // Preload all GLB models
    await evaluate(`(async () => { await window.CellQuestAR.preloadAllGLBs(); return true; })()`);
    await sleep(1000);

    const report = {
      timestamp: new Date().toISOString(),
      viewport: '1194x834 (iPad Pro 11" Landscape & 834x1194 Portrait)',
      modBTests: {},
      modCTests: {},
      consoleErrors,
      failed404s
    };

    // =========================================================================
    // BAHAGIAN 1 & 10: UJIAN MOD B — MARKER AR (UJIAN B1 - B7)
    // =========================================================================
    await evaluate(`(async () => {
      await window.CellQuestAR.selectMode('marker-ar');
    })()`);
    await sleep(900);

    // B1 & B2: Imbas kad penanda (#4 Membran Sel, #0 Mitokondrion, #1 Nukleus) -> Model berdiri tegak
    const b1_b2 = await evaluate(`(() => {
      const results = {};
      [4, 0, 1].forEach(mId => {
        const poseInfo = window.CellQuestAR.simulateMarkerPose(mId, {
          cardRotDeg: 0,
          tableTiltDeg: 55,
          obliqueYawDeg: 0,
          distanceMeters: 0.55
        });
        const ms = window.CellQuestAR.getMarkerState();
        const anchor = ms.anchors.find(a => a.userData.markerId === mId);
        const orientGrp = anchor.userData.modelOrientationGroup;
        const scaleGrp = anchor.userData.modelScaleGroup;
        const glbGrp = anchor.userData.organelleModel;
        const labelGrp = anchor.userData.labelGroup;

        // Semak vektor atas (up) papan nama dalam ruang kamera untuk mengesahkan teks tidak terbalik
        const labelUpWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(
          anchor.quaternion.clone().multiply(labelGrp.quaternion)
        );

        results['marker_' + mId] = {
          visible: anchor.visible,
          hierarchy: [anchor.name, orientGrp.name, scaleGrp.name, glbGrp.name].join(' -> '),
          determinant: poseInfo.determinant,
          reprojError: poseInfo.error,
          cardNormal: poseInfo.cardNormal,
          scaleGroupOffsetY: +scaleGrp.position.y.toFixed(3),
          scaleGroupScale: +scaleGrp.scale.x.toFixed(3),
          labelUpWorldY: +labelUpWorld.y.toFixed(3),
          isUprightOnCard: poseInfo.determinant === 1 && poseInfo.cardNormal[1] > 0.4 && poseInfo.cardNormal[2] > 0.4 && scaleGrp.position.y >= 0.14 && labelUpWorld.y > 0.98
        };
      });
      // Tinggalkan Kad #4 (Membran Sel) aktif untuk screenshot B1/B2
      window.CellQuestAR.simulateMarkerPose(4, { cardRotDeg: 0, tableTiltDeg: 55, distanceMeters: 0.55 });
      return results;
    })()`);
    await screenshot('modB_1_2_marker4_membrane_upright.png');
    report.modBTests.B1_B2_scan_and_upright = {
      pass: Object.values(b1_b2).every(r => r.visible && r.isUprightOnCard),
      details: b1_b2
    };

    // B3: Kad dipusingkan 90°
    const b3_rot90 = await evaluate(`(() => {
      const poseInfo = window.CellQuestAR.simulateMarkerPose(4, {
        cardRotDeg: 90,
        tableTiltDeg: 55,
        obliqueYawDeg: 0,
        distanceMeters: 0.55
      });
      const anchor = window.CellQuestAR.getMarkerState().anchors.find(a => a.userData.markerId === 4);
      const labelUpWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(
        anchor.quaternion.clone().multiply(anchor.userData.labelGroup.quaternion)
      );
      return {
        cardRotDeg: 90,
        visible: anchor.visible,
        determinant: poseInfo.determinant,
        reprojError: poseInfo.error,
        cardNormal: poseInfo.cardNormal,
        cardRight: poseInfo.cardRight,
        labelUpWorldY: +labelUpWorld.y.toFixed(3),
        pass: anchor.visible && poseInfo.determinant === 1 && poseInfo.cardNormal[1] > 0.4 && poseInfo.cardNormal[2] > 0.4 && labelUpWorld.y > 0.98
      };
    })()`);
    await screenshot('modB_3_marker4_rotated_90deg.png');
    report.modBTests.B3_rotated_90deg = b3_rot90;

    // B4: Kad dipusingkan 180°
    const b4_rot180 = await evaluate(`(() => {
      const poseInfo = window.CellQuestAR.simulateMarkerPose(4, {
        cardRotDeg: 180,
        tableTiltDeg: 55,
        obliqueYawDeg: 0,
        distanceMeters: 0.55
      });
      const anchor = window.CellQuestAR.getMarkerState().anchors.find(a => a.userData.markerId === 4);
      const labelUpWorld = new THREE.Vector3(0, 1, 0).applyQuaternion(
        anchor.quaternion.clone().multiply(anchor.userData.labelGroup.quaternion)
      );
      return {
        cardRotDeg: 180,
        visible: anchor.visible,
        determinant: poseInfo.determinant,
        reprojError: poseInfo.error,
        cardNormal: poseInfo.cardNormal,
        cardRight: poseInfo.cardRight,
        labelUpWorldY: +labelUpWorld.y.toFixed(3),
        pass: anchor.visible && poseInfo.determinant === 1 && poseInfo.cardNormal[1] > 0.4 && poseInfo.cardNormal[2] > 0.4 && labelUpWorld.y > 0.98
      };
    })()`);
    await screenshot('modB_4_marker4_rotated_180deg.png');
    report.modBTests.B4_rotated_180deg = b4_rot180;

    // B5: Kad dilihat secara serong (Oblique angle)
    const b5_oblique = await evaluate(`(() => {
      const poseInfo = window.CellQuestAR.simulateMarkerPose(0, {
        cardRotDeg: 35,
        tableTiltDeg: 42,
        obliqueYawDeg: 26,
        distanceMeters: 0.58
      });
      const anchor = window.CellQuestAR.getMarkerState().anchors.find(a => a.userData.markerId === 0);
      return {
        markerId: 0,
        organelle: 'Mitokondrion',
        visible: anchor.visible,
        determinant: poseInfo.determinant,
        reprojError: poseInfo.error,
        cardNormal: poseInfo.cardNormal,
        pass: anchor.visible && poseInfo.determinant === 1 && poseInfo.cardNormal[2] > 0.25 && poseInfo.error <= 15
      };
    })()`);
    await screenshot('modB_5_marker0_oblique_angle.png');
    report.modBTests.B5_oblique_angle = b5_oblique;

    // B6: Kamera dekat (0.32m) dan jauh (0.95m)
    const b6_near_far = await evaluate(`(() => {
      const nearPose = window.CellQuestAR.simulateMarkerPose(1, {
        cardRotDeg: 0,
        tableTiltDeg: 55,
        distanceMeters: 0.32
      });
      const farPose = window.CellQuestAR.simulateMarkerPose(1, {
        cardRotDeg: 0,
        tableTiltDeg: 55,
        distanceMeters: 0.95
      });
      return {
        nearZ: nearPose.position[2],
        farZ: farPose.position[2],
        nearDet: nearPose.determinant,
        farDet: farPose.determinant,
        pass: nearPose.position[2] > farPose.position[2] && nearPose.determinant === 1 && farPose.determinant === 1
      };
    })()`);
    report.modBTests.B6_near_and_far_distance = b6_near_far;

    // B7: Interaksi stesen dalam Mod B membuka penerangan dan kuiz
    const b7_interaction = await evaluate(`(() => {
      window.CellQuestAR.selectOrganelle('membrane', 2);
      const card = document.getElementById('ar-organelle-card');
      const cardTitle = document.getElementById('ar-card-title')?.textContent || '';
      window.CellQuestAR.openQuiz(1); // Stesen 2: Membran Sel
      const modal = document.getElementById('station-modal');
      const modalOpen = modal && modal.classList.contains('open');
      const closeBtn = document.getElementById('close-station-btn');
      if (closeBtn) closeBtn.click();
      if (card) card.style.display = 'none';
      return {
        cardVisible: true,
        cardTitle,
        modalOpen,
        pass: !!(card && cardTitle.includes('Membran') && modalOpen)
      };
    })()`);
    report.modBTests.B7_station_interaction_and_quiz = b7_interaction;

    // =========================================================================
    // BAHAGIAN 2–8 & 10: UJIAN MOD C — AR ORIENTASI DUNIA + SMART RADAR (C1 - C13)
    // =========================================================================

    // C1, C2, C3: Buka kamera Mod C, aktifkan sensor orientasi & tekan "KALIBRASI SEMULA"
    await evaluate(`window.CellQuestAR.selectMode('camera-ar')`);
    await sleep(900);
    const c1_c2_c3 = await evaluate(`(() => {
      // Simulasi bacaan sensor iPad awal (alpha=120°, beta=82°, gamma=-5°, Portrait 0°)
      window.CellQuestAR.simulateDeviceOrientation(120, 82, -5, 0);
      const recalBtn = document.getElementById('ar-radar-recalibrate-btn');
      if (recalBtn) recalBtn.click();
      const calPopup = document.getElementById('ar-world-calibration-ui');
      if (calPopup) calPopup.style.display = 'none';
      const ws = window.CellQuestAR.getWorldState();
      return {
        modeActive: ws.active && ws.subMode === 'orientation',
        sensorReceived: ws.sensorReceived,
        hasCalibrated: ws.hasCalibrated,
        headingAfterCalibrate: Math.round(ws.currentHeadingDeg),
        pitchAfterCalibrate: Math.round(ws.currentPitchDeg),
        recalBtnExists: !!recalBtn,
        recalBtnText: recalBtn ? recalBtn.textContent.trim() : '',
        pass: ws.active && ws.hasCalibrated && Math.round(ws.currentHeadingDeg) === 0 && Math.round(ws.currentPitchDeg) === 0 && !!recalBtn
      };
    })()`);
    report.modCTests.C1_C2_C3_open_sensor_and_recalibrate = c1_c2_c3;

    // C4 & C5: Pilih Mitokondrion (Stesen 4, index 3) pada Smart Radar dan semak semua maklumat Smart Radar
    const c4_c5 = await evaluate(`(() => {
      // Kamera pada 0° Hadapan, 0° Elevasi; pilih Stesen 4 (Mitokondrion: Azimut 270° Kiri, Elevasi +15°)
      window.CellQuestAR.lookAtHeading(0, 0);
      window.CellQuestAR.selectRadarTarget(3, false);

      const title = document.getElementById('ar-radar-target-title')?.textContent.trim();
      const status = document.getElementById('ar-radar-status-chip')?.textContent.trim();
      const azTarget = document.getElementById('ar-radar-az-target')?.textContent.trim();
      const azCam = document.getElementById('ar-radar-az-cam')?.textContent.trim();
      const elTarget = document.getElementById('ar-radar-el-target')?.textContent.trim();
      const elCam = document.getElementById('ar-radar-el-cam')?.textContent.trim();
      const turnCmd = document.getElementById('ar-radar-turn-cmd')?.textContent.trim();
      const elevCmd = document.getElementById('ar-radar-elev-cmd')?.textContent.trim();
      const coachMsg = document.getElementById('ar-radar-coach-msg')?.textContent.trim();
      const pill4HasTarget = document.getElementById('ar-radar-pill-4')?.classList.contains('target');

      return {
        title,
        status,
        azTarget,
        azCam,
        elTarget,
        elCam,
        turnCmd,
        elevCmd,
        coachMsg,
        pill4HasTarget,
        pass: !!(
          title && title.includes('Mitokondrion') &&
          status === 'Sedang Dicari' &&
          azTarget.includes('270°') &&
          azCam.includes('0°') &&
          elTarget.includes('+15°') &&
          elCam.includes('0°') &&
          turnCmd.includes('Pusing kiri 90°') &&
          elevCmd.includes('Naikkan kamera 15°') &&
          coachMsg.includes('Mitokondrion') &&
          pill4HasTarget
        )
      };
    })()`);
    await screenshot('modC_4_5_smart_radar_hunting_mitochondria.png');
    report.modCTests.C4_C5_smart_radar_guidance_mitochondria = c4_c5;

    // C6 & C7: Pusing kamera mengikut panduan radar ke (270°, +15°) dan sahkan Mitokondrion muncul & ditemui
    const c6_c7 = await evaluate(`(() => {
      window.CellQuestAR.lookAtHeading(270, 15);
      const ws = window.CellQuestAR.getWorldState();
      const cam = window.CellQuestAR.getCamera();
      const mitoGroup = ws.stationGroups[3]; // Stesen 4: Mitokondrion
      const worldPos = new THREE.Vector3();
      mitoGroup.getWorldPosition(worldPos);
      const ndc = worldPos.clone().project(cam);

      const status = document.getElementById('ar-radar-status-chip')?.textContent.trim();
      const turnCmd = document.getElementById('ar-radar-turn-cmd')?.textContent.trim();
      const elevCmd = document.getElementById('ar-radar-elev-cmd')?.textContent.trim();
      const coachMsg = document.getElementById('ar-radar-coach-msg')?.textContent.trim();
      const detectedBanner = document.getElementById('ar-world-detected-banner');

      return {
        detectedStationIdx: ws.lastDetectedIdx,
        isDiscoveredInSet: ws.discoveredStations.has(4),
        ndcX: +ndc.x.toFixed(3),
        ndcY: +ndc.y.toFixed(3),
        status,
        turnCmd,
        elevCmd,
        coachMsg,
        bannerVisible: !!(detectedBanner && detectedBanner.style.opacity !== '0'),
        bannerText: detectedBanner ? detectedBanner.textContent.trim() : '',
        pass: (
          ws.lastDetectedIdx === 3 &&
          ws.discoveredStations.has(4) &&
          Math.abs(ndc.x) < 0.05 &&
          Math.abs(ndc.y) < 0.15 &&
          status.includes('Stesen Ditemui') &&
          turnCmd.includes('tepat') &&
          elevCmd.includes('tepat')
        )
      };
    })()`);
    await screenshot('modC_6_7_mitochondria_discovered_at_270_plus15.png');
    report.modCTests.C6_C7_rotate_to_target_and_discover = c6_c7;

    // C8: Pusing menjauhi Mitokondrion (ke Nukleus 90°, +5°) dan kembali semula ke (270°, +15°)
    const c8_world_lock = await evaluate(`(() => {
      const ws = window.CellQuestAR.getWorldState();
      const cam = window.CellQuestAR.getCamera();
      const mitoGroup = ws.stationGroups[3];
      const posBefore = mitoGroup.position.toArray().map(v => +v.toFixed(3));

      // Pusing ke Kanan (90°, +5° -> Nukleus)
      window.CellQuestAR.lookAtHeading(90, 5);
      const detectedAt90 = ws.lastDetectedIdx; // 0 = Stesen 1 Nukleus
      const mitoNdcAt90 = mitoGroup.position.clone().project(cam);
      const mitoOutOfViewAt90 = mitoNdcAt90.z > 1.0 || Math.abs(mitoNdcAt90.x) > 1.0;

      // Pusing kembali ke Kiri (270°, +15° -> Mitokondrion)
      window.CellQuestAR.lookAtHeading(270, 15);
      const detectedBackAt270 = ws.lastDetectedIdx;
      const posAfter = mitoGroup.position.toArray().map(v => +v.toFixed(3));

      return {
        posBefore,
        posAfter,
        detectedAt90_isNucleus: detectedAt90 === 0,
        mitoOutOfViewAt90,
        detectedBackAt270_isMito: detectedBackAt270 === 3,
        exactSameWorldPos: JSON.stringify(posBefore) === JSON.stringify(posAfter),
        pass: detectedAt90 === 0 && mitoOutOfViewAt90 && detectedBackAt270 === 3 && JSON.stringify(posBefore) === JSON.stringify(posAfter)
      };
    })()`);
    report.modCTests.C8_rotate_away_and_return_world_locked = c8_world_lock;

    // C9: Uji semua 8 stesen pada azimut & elevasi unik masing-masing
    const c9_all_8_stations = await evaluate(`(() => {
      const ws = window.CellQuestAR.getWorldState();
      const cfgList = window.CellQuestAR.getStationsConfig();
      const stationChecks = cfgList.map((cfg, idx) => {
        window.CellQuestAR.selectRadarTarget(idx, true); // Pilih pada radar & hadapkan kamera ke (azimuthDeg, elevationDeg)
        const group = ws.stationGroups[idx];
        return {
          stationNumber: cfg.stationNumber,
          label: cfg.label,
          azimuthDeg: cfg.azimuthDeg,
          elevationDeg: cfg.elevationDeg,
          directionName: cfg.directionName,
          groupVisible: group.visible,
          worldPos: group.position.toArray().map(v => +v.toFixed(2)),
          detectedAsActive: ws.lastDetectedIdx === idx,
          discovered: ws.discoveredStations.has(cfg.stationNumber)
        };
      });
      return {
        stationChecks,
        pass: stationChecks.every(s => s.groupVisible && s.detectedAsActive && s.discovered)
      };
    })()`);
    await screenshot('modC_9_station1_nucleus_at_90_plus5.png');
    report.modCTests.C9_all_8_stations_azimuth_elevation = c9_all_8_stations;

    // C10 & C11: Uji pusingan penuh 360° dan dongakan kamera ke atas/bawah (-20° hingga +20°) tanpa stesen hilang
    const c10_c11_full360_and_pitch = await evaluate(`(() => {
      const ws = window.CellQuestAR.getWorldState();
      const sweepAngles = [0, 45, 90, 135, 180, 225, 270, 315, 359, 360];
      const sweepResults = sweepAngles.map(az => {
        window.CellQuestAR.lookAtHeading(az, 0);
        const visibleGroupsCount = ws.stationGroups.filter(g => g.visible).length;
        return { az, currentHeading: Math.round(ws.currentHeadingDeg), visibleGroupsCount };
      });

      const pitchAngles = [-20, -12, -5, 0, 5, 12, 15, 20];
      const pitchResults = pitchAngles.map(el => {
        window.CellQuestAR.lookAtHeading(270, el);
        return { el, currentPitch: Math.round(ws.currentPitchDeg) };
      });

      return {
        allStationsAlwaysInSceneGraph: sweepResults.every(r => r.visibleGroupsCount === 8),
        pitchAccurate: pitchResults.every(p => p.currentPitch === p.el),
        sweepResults,
        pitchResults,
        pass: sweepResults.every(r => r.visibleGroupsCount === 8) && pitchResults.every(p => p.currentPitch === p.el)
      };
    })()`);
    report.modCTests.C10_C11_full_360_and_elevation_sweep = c10_c11_full360_and_pitch;

    // C12: Uji orientasi Portrait (0°) dan Landscape (90° & -90°) pada sensor quaternion iPad
    const c12_portrait_landscape = await evaluate(`(() => {
      // 1. Portrait (screenAngle = 0°): iPad dipegang tegak (beta = 80°, gamma = 0°), pusing alpha dari 100° ke 190°
      const p1 = window.CellQuestAR.simulateDeviceOrientation(100, 80, 0, 0);
      window.CellQuestAR.calibrateHeading();
      const p2 = window.CellQuestAR.simulateDeviceOrientation(10, 80, 0, 0); // Pusing kanan 90° (alpha berkurang 90°)

      // 2. Landscape Left (screenAngle = 90°): iPad dipegang melintang (beta = 0°, gamma = -80°)
      const l1 = window.CellQuestAR.simulateDeviceOrientation(100, 0, -80, 90);
      window.CellQuestAR.calibrateHeading();
      const l2 = window.CellQuestAR.simulateDeviceOrientation(10, 0, -80, 90); // Pusing kanan 90° dalam Landscape

      return {
        portraitTurn90Heading: Math.round(p2.currentHeadingDeg),
        portraitElevation: Math.round(p2.currentPitchDeg),
        landscapeTurn90Heading: Math.round(l2.currentHeadingDeg),
        landscapeElevation: Math.round(l2.currentPitchDeg),
        pass: (
          Math.abs(p2.currentHeadingDeg - 90) <= 3 &&
          Math.abs(p2.currentPitchDeg) <= 3 &&
          Math.abs(l2.currentHeadingDeg - 90) <= 3 &&
          Math.abs(l2.currentPitchDeg) <= 3
        )
      };
    })()`);
    report.modCTests.C12_portrait_and_landscape_sensor_quaternion = c12_portrait_landscape;

    // C13: Buka dan tutup kuiz stesen -> sahkan kedudukan dunia kekal & stesen hanya bertukar Hijau selepas kuiz dijawab
    const c13_quiz_and_completion = await evaluate(`(() => {
      window.CellQuestAR.selectRadarTarget(0, true); // Stesen 1: Nukleus (90°, +5°)
      const ws = window.CellQuestAR.getWorldState();
      const st = window.CellQuestAR.getState();
      const posBefore = ws.stationGroups[0].position.toArray();
      const completedBeforeQuiz = st.completedStations.has(1);

      // Buka modal kuiz Stesen 1 dan tutup tanpa menjawab
      window.CellQuestAR.openQuiz(0);
      const closeBtn = document.getElementById('close-station-btn');
      if (closeBtn) closeBtn.click();
      const completedAfterCloseOnly = st.completedStations.has(1);
      const posAfterClose = ws.stationGroups[0].position.toArray();

      // Sekarang buka semula dan jawab soalan dengan betul
      window.CellQuestAR.openQuiz(0);
      const correctIdx = st.stations[0].correct;
      const optBtns = document.querySelectorAll('#quiz-options .cq-quiz-opt');
      if (optBtns[correctIdx]) optBtns[correctIdx].click();
      if (closeBtn) closeBtn.click();

      window.CellQuestAR.selectRadarTarget(0, true);
      const completedAfterCorrectAnswer = st.completedStations.has(1);
      const statusChipText = document.getElementById('ar-radar-status-chip')?.textContent.trim();

      return {
        completedBeforeQuiz,
        completedAfterCloseOnly,
        completedAfterCorrectAnswer,
        statusChipText,
        worldPosUnchanged: JSON.stringify(posBefore) === JSON.stringify(posAfterClose),
        pass: (
          !completedBeforeQuiz &&
          !completedAfterCloseOnly &&
          completedAfterCorrectAnswer &&
          statusChipText === 'Selesai ✓' &&
          JSON.stringify(posBefore) === JSON.stringify(posAfterClose)
        )
      };
    })()`);
    await screenshot('modC_13_station1_completed_green_radar.png');
    report.modCTests.C13_quiz_completion_and_world_persistence = c13_quiz_and_completion;

    const reportPath = path.join(ROOT_DIR, 'tests', 'marker_and_radar_ar_verification_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('VERIFICATION_REPORT_SAVED:', reportPath);
    console.log(JSON.stringify(report, null, 2));

    ws.close();
  } finally {
    chrome.kill();
    server.close();
  }
})();
