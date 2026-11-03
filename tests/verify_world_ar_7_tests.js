const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/cellquest/adventure.html';
    const filePath = path.join(__dirname, '..', reqPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  const PORT = 3014;
  const server = await createServer(PORT);
  console.log(`[Server] Running on http://localhost:${PORT}`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--window-size=1194,834', // iPad Pro 11-inch Landscape
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    'about:blank'
  ]);

  const results = {};
  const errors = [];

  try {
    await sleep(2200);
    const listRes = await fetch('http://127.0.0.1:9234/json');
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Could not find debugger target');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(res => ws.addEventListener('open', res));

    let id = 1;
    const send = (method, params = {}) => {
      const currentId = id++;
      ws.send(JSON.stringify({ id: currentId, method, params }));
      return currentId;
    };

    send('Runtime.enable');
    send('Page.enable');
    send('DOM.enable');

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        errors.push(desc);
        console.error('[Browser Exception]:', desc);
      }
    });

    const evalExpr = (expression) => {
      return new Promise((res) => {
        const evalId = send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        const handler = (evalEvent) => {
          const resMsg = JSON.parse(evalEvent.data);
          if (resMsg.id === evalId) {
            ws.removeEventListener('message', handler);
            if (resMsg.result?.exceptionDetails) {
              console.error('[Eval Exception]:', resMsg.result.exceptionDetails.text, resMsg.result.exceptionDetails.exception?.description);
            }
            res(resMsg.result?.result ? resMsg.result.result.value : null);
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    const captureScreenshot = (filename) => {
      return new Promise((res) => {
        const ssId = send('Page.captureScreenshot', { format: 'png' });
        const handler = (event) => {
          const resMsg = JSON.parse(event.data);
          if (resMsg.id === ssId) {
            ws.removeEventListener('message', handler);
            if (resMsg.result && resMsg.result.data) {
              const outDir = path.join(__dirname, 'screenshots');
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
              const outPath = path.join(outDir, filename);
              fs.writeFileSync(outPath, Buffer.from(resMsg.result.data, 'base64'));
              res(outPath);
            } else {
              res(null);
            }
          }
        };
        ws.addEventListener('message', handler);
      });
    };

    // 1. Seed Auth Session & Grant Camera Permissions
    send('Page.addScriptToEvaluateOnNewDocument', {
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
      send('Browser.grantPermissions', {
        permissions: ['videoCapture'],
        origin: `http://localhost:${PORT}`
      });
    } catch (_) {}

    // Navigate to CellQuest Adventure
    send('Page.navigate', { url: `http://localhost:${PORT}/cellquest/adventure.html` });
    await sleep(3500);

    // Activate Mod C (World-Locked AR Exploration)
    await evalExpr(`(async () => {
      await window.CellQuestAR.selectMode('camera-ar');
      return true;
    })()`);
    await sleep(1000);

    // =========================================================================
    // UJIAN 1: PANDANG KIRI (270°) -> STESEN 1: MITOKONDRION
    // =========================================================================
    results.ujian1 = await evalExpr(`(() => {
      window.CellQuestAR.lookAtHeading(270);
      const ws = window.CellQuestAR.getWorldState();
      const mitoGroup = ws.stationGroups[0];
      return {
        headingDeg: ws.currentHeadingDeg,
        activeStationLabel: ws.activeStation ? ws.activeStation.label : null,
        activeDirection: ws.activeStation ? ws.activeStation.directionName : null,
        lastDetectedIdx: ws.lastDetectedIdx,
        mitoInFrustum: ws.stationVisibility[0],
        nukleusInFrustum: ws.stationVisibility[1],
        haiwanInFrustum: ws.stationVisibility[2],
        tumbuhanInFrustum: ws.stationVisibility[3],
        mitoWorldPos: {
          x: Number(mitoGroup.position.x.toFixed(2)),
          y: Number(mitoGroup.position.y.toFixed(2)),
          z: Number(mitoGroup.position.z.toFixed(2))
        },
        detectedBannerText: document.getElementById('ar-world-detected-banner')?.textContent?.trim() || ''
      };
    })()`);
    await captureScreenshot('ujian1_pandang_kiri_mitokondrion.png');
    console.log('[Ujian 1 - Pandang Kiri]:', results.ujian1);

    // =========================================================================
    // UJIAN 2: PANDANG KANAN (90°) -> STESEN 2: NUKLEUS
    // =========================================================================
    results.ujian2 = await evalExpr(`(() => {
      window.CellQuestAR.lookAtHeading(90);
      const ws = window.CellQuestAR.getWorldState();
      const nucGroup = ws.stationGroups[1];
      return {
        headingDeg: ws.currentHeadingDeg,
        activeStationLabel: ws.activeStation ? ws.activeStation.label : null,
        activeDirection: ws.activeStation ? ws.activeStation.directionName : null,
        lastDetectedIdx: ws.lastDetectedIdx,
        mitoInFrustum: ws.stationVisibility[0],
        nukleusInFrustum: ws.stationVisibility[1],
        haiwanInFrustum: ws.stationVisibility[2],
        tumbuhanInFrustum: ws.stationVisibility[3],
        nukleusWorldPos: {
          x: Number(nucGroup.position.x.toFixed(2)),
          y: Number(nucGroup.position.y.toFixed(2)),
          z: Number(nucGroup.position.z.toFixed(2))
        },
        detectedBannerText: document.getElementById('ar-world-detected-banner')?.textContent?.trim() || ''
      };
    })()`);
    await captureScreenshot('ujian2_pandang_kanan_nukleus.png');
    console.log('[Ujian 2 - Pandang Kanan]:', results.ujian2);

    // =========================================================================
    // UJIAN 3: PANDANG SEMULA KE KIRI (270°) -> MITOKONDRION KEKAL PADA KEDUDUKAN ASAL
    // =========================================================================
    results.ujian3 = await evalExpr(`(() => {
      window.CellQuestAR.lookAtHeading(270);
      const ws = window.CellQuestAR.getWorldState();
      const mitoGroup = ws.stationGroups[0];
      return {
        headingDeg: ws.currentHeadingDeg,
        activeStationLabel: ws.activeStation ? ws.activeStation.label : null,
        mitoInFrustum: ws.stationVisibility[0],
        nukleusInFrustum: ws.stationVisibility[1],
        mitoWorldPos: {
          x: Number(mitoGroup.position.x.toFixed(2)),
          y: Number(mitoGroup.position.y.toFixed(2)),
          z: Number(mitoGroup.position.z.toFixed(2))
        }
      };
    })()`);
    console.log('[Ujian 3 - Pandang Semula Kiri]:', results.ujian3);

    // Semak juga Depan (0° -> Sel Haiwan) & Belakang (180° -> Sel Tumbuhan) & 4 Pepenjuru
    results.all8Directions = await evalExpr(`(() => {
      const angles = [270, 90, 0, 180, 315, 45, 225, 135];
      const checks = [];
      for (const a of angles) {
        window.CellQuestAR.lookAtHeading(a);
        const ws = window.CellQuestAR.getWorldState();
        checks.push({
          angle: a,
          foundLabel: ws.activeStation ? ws.activeStation.label : null,
          foundDir: ws.activeStation ? ws.activeStation.directionName : null,
          slotNumber: ws.activeStation ? ws.activeStation.slotNumber : null
        });
      }
      return checks;
    })()`);
    console.log('[8 Arah Stesen]:', results.all8Directions);

    // =========================================================================
    // UJIAN 4: KAMERA BERGERAK & PENGESAHAN WORLD-LOCKED (TIADA camera.add)
    // =========================================================================
    results.ujian4 = await evalExpr(`(() => {
      const cam = window.CellQuestAR.getCamera();
      const scene = window.CellQuestAR.getScene();
      const ws = window.CellQuestAR.getWorldState();

      // 1. Pastikan tiada stesen menjadi child kepada kamera
      const cameraChildrenCount = cam.children.length;
      const allStationsParentIsScene = ws.stationGroups.every(g => g.parent === scene);

      // 2. Uji Mod A (Spatial AR): tempatkan stesen pada (0, 0, -1.5), gerakkan posisi kamera, semak koordinat stesen kekal
      window.CellQuestAR.placeSpatialStations({ x: 0, y: 0, z: -1.5, copy(v){} }, 0);
      const beforeCamMove = ws.stationGroups.map(g => ({ x: g.position.x, y: g.position.y, z: g.position.z }));
      cam.position.set(1.2, 1.5, 0.8);
      cam.updateMatrixWorld();
      const afterCamMove = ws.stationGroups.map(g => ({ x: g.position.x, y: g.position.y, z: g.position.z }));
      const positionsUnchangedOnCamMove = beforeCamMove.every((p, idx) =>
        Math.abs(p.x - afterCamMove[idx].x) < 1e-6 &&
        Math.abs(p.y - afterCamMove[idx].y) < 1e-6 &&
        Math.abs(p.z - afterCamMove[idx].z) < 1e-6
      );

      // Kembalikan ke orientasi standard
      window.CellQuestAR.calibrateHeading();
      const trackingBannerText = document.getElementById('ar-world-tracking-banner')?.textContent || '';

      return {
        cameraChildrenCount,
        allStationsParentIsScene,
        positionsUnchangedOnCamMove,
        honest3DOFDisclosurePresent: trackingBannerText.includes('3DOF') || trackingBannerText.includes('orientasi') || trackingBannerText.includes('Simulasi')
      };
    })()`);
    console.log('[Ujian 4 - World-Locked & Pergerakan Kamera]:', results.ujian4);

    // =========================================================================
    // UJIAN 5: SOKONGAN IPAD SAFARI (KAMERA, SENSOR PERMISSION, MARKER AR 6DOF, RESPONSIF)
    // =========================================================================
    await evalExpr(`window.CellQuestAR.selectMode('marker-ar')`);
    await sleep(800);

    // Lukis imej SVG Penanda #0 (Mitokondrion) dan #1 (Nukleus) ke atas kanvas & uji pengesanan ArUco + POSIT 6DOF sebenar!
    results.ujian5_marker6DOF = await evalExpr(`(async () => {
      const ms = window.CellQuestAR.getMarkerState();
      if (!ms.detector || !ms.posit) return { error: 'Detector or POSIT not initialized' };

      async function detectSvgMarker(svgUrl) {
        const resp = await fetch(svgUrl);
        const svgText = await resp.text();
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 240;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 320, 240);
        // Lukis bahagian kod penanda di tengah kanvas kamera
        ctx.drawImage(img, 70, 20, 180, 200);
        URL.revokeObjectURL(url);

        const imgData = ctx.getImageData(0, 0, 320, 240);
        const markers = ms.detector.detect(imgData);
        if (markers.length > 0) {
          const m = markers[0];
          const corners = m.corners.map(pt => ({ x: pt.x - 160, y: 120 - pt.y }));
          const pose = ms.posit.pose(corners);
          return {
            detectedId: m.id,
            bestError: pose ? Number(pose.bestError.toFixed(4)) : null,
            translation: pose ? pose.bestTranslation.map(v => Number(v.toFixed(3))) : null
          };
        }
        return { detectedId: null };
      }

      const m0 = await detectSvgMarker('../assets/markers/marker-0-mitokondrion.svg');
      const m1 = await detectSvgMarker('../assets/markers/marker-1-nukleus.svg');
      const m2 = await detectSvgMarker('../assets/markers/marker-2-sel-haiwan.svg');

      // Uji juga pengikatan anchor apabila marker dikesan
      ms.simulatedMarkerId = 0;
      await new Promise(r => setTimeout(r, 120));
      const anchor0VisibleWhenDetected = ms.anchors[0].visible;
      const anchor1VisibleWhen0Detected = ms.anchors[1].visible;

      return {
        arucoLibraryLoaded: !!(window.AR && window.POS),
        svgMarker0: m0,
        svgMarker1: m1,
        svgMarker2: m2,
        anchor0VisibleWhenDetected,
        anchor1VisibleWhen0Detected
      };
    })()`);
    await captureScreenshot('ujian5_marker_ar_active.png');
    console.log('[Ujian 5 - iPad Safari Marker AR 6DOF]:', results.ujian5_marker6DOF);

    // Uji iPad Portrait (834 x 1194) & Kuiz Interaksi + Markah Tidak Bertambah Dua Kali
    send('Emulation.setDeviceMetricsOverride', {
      width: 834,
      height: 1194,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    results.ujian5_interaksiDanMarkah = await evalExpr(`(() => {
      window.CellQuestAR.selectOrganelle('mitochondria', 4);
      const cardVisible = document.getElementById('ar-organelle-card')?.style.display !== 'none';
      const cardTitle = document.getElementById('ar-card-title')?.textContent?.trim();

      // Buka kuiz Stesen 4 (indeks 3) dan jawab soalan betul dua kali untuk pastikan markah tidak berganda
      window.CellQuestAR.openQuiz(3);
      const st = window.CellQuestAR.getState();
      const correctIdx = st.stations[3].correct;
      const opts = document.querySelectorAll('#quiz-options .cq-quiz-opt');
      if (opts[correctIdx]) opts[correctIdx].click();
      const scoreAfterFirst = st.score;

      // Cuba jawab semula stesen yang sama
      window.CellQuestAR.openQuiz(3);
      const opts2 = document.querySelectorAll('#quiz-options .cq-quiz-opt');
      if (opts2[correctIdx]) opts2[correctIdx].click();
      const scoreAfterSecond = st.score;

      document.getElementById('close-station-btn')?.click();

      return {
        cardVisible,
        cardTitle,
        scoreAfterFirst,
        scoreAfterSecond,
        noDoubleScore: (scoreAfterFirst === 100 && scoreAfterSecond === 100),
        badgeCompleted: st.completedStations.has(4)
      };
    })()`);
    await captureScreenshot('ujian5_ipad_portrait_organelle_card.png');
    console.log('[Ujian 5 - Interaksi & Markah]:', results.ujian5_interaksiDanMarkah);

    // =========================================================================
    // UJIAN 7: TRACKING HILANG (MODEL DISEMBUNYIKAN SERTA-MERTA, TIADA TERAPUNG PALSU)
    // =========================================================================
    results.ujian7 = await evalExpr(`(async () => {
      const ms = window.CellQuestAR.getMarkerState();
      // 1. Semasa penanda #0 dikesan
      ms.simulatedMarkerId = 0;
      await new Promise(r => setTimeout(r, 100));
      const visibleDuringTrack = ms.anchors[0].visible;

      // 2. Tanggalkan penanda (tracking hilang)
      ms.simulatedMarkerId = null;
      ms.trackedMap = {};
      await new Promise(r => setTimeout(r, 150));
      const visibleAfterLost = ms.anchors[0].visible;
      const allAnchorsHidden = ms.anchors.every(a => a.visible === false);
      const statusBannerText = document.getElementById('ar-world-tracking-banner')?.textContent || '';

      return {
        visibleDuringTrack,
        visibleAfterLost,
        allAnchorsHidden,
        statusBannerShowsRecoveryHint: statusBannerText.includes('Tiada penanda dikesan') || statusBannerText.includes('Halakan kamera semula')
      };
    })()`);
    console.log('[Ujian 7 - Tracking Hilang]:', results.ujian7);

    // =========================================================================
    // UJIAN 6: PERTUKARAN MOD (3D <-> CAMERA-AR <-> MARKER-AR <-> SPATIAL AR FALLBACK) & KAMERA DITUTUP
    // =========================================================================
    results.ujian6 = await evalExpr(`(async () => {
      await window.CellQuestAR.selectMode('camera-ar');
      const modeC = window.CellQuestAR.getState().mode;
      const worldActiveInC = window.CellQuestAR.getWorldState().active;

      await window.CellQuestAR.selectMode('marker-ar');
      const modeB = window.CellQuestAR.getState().mode;
      const markerActiveInB = window.CellQuestAR.getMarkerState().active;

      await window.CellQuestAR.selectMode('3d');
      const mode3D = window.CellQuestAR.getState().mode;
      const worldStoppedIn3D = !window.CellQuestAR.getWorldState().active;
      const markerStoppedIn3D = !window.CellQuestAR.getMarkerState().active;
      const videoSrcCleared = (document.getElementById('ar-camera-feed')?.srcObject === null);

      return {
        modeC,
        worldActiveInC,
        modeB,
        markerActiveInB,
        mode3D,
        worldStoppedIn3D,
        markerStoppedIn3D,
        videoSrcCleared
      };
    })()`);
    console.log('[Ujian 6 - Pertukaran Mod & Penutupan Kamera]:', results.ujian6);

    results.runtimeErrors = errors;

    // Semakan kelulusan keseluruhan
    const allPassed =
      results.ujian1.activeStationLabel === 'Mitokondrion' &&
      results.ujian1.mitoInFrustum === true &&
      results.ujian1.nukleusInFrustum === false &&
      results.ujian2.activeStationLabel === 'Nukleus' &&
      results.ujian2.nukleusInFrustum === true &&
      results.ujian2.mitoInFrustum === false &&
      results.ujian3.activeStationLabel === 'Mitokondrion' &&
      results.ujian3.mitoWorldPos.x === -5.5 &&
      results.ujian4.cameraChildrenCount === 0 &&
      results.ujian4.allStationsParentIsScene === true &&
      results.ujian4.positionsUnchangedOnCamMove === true &&
      results.ujian5_marker6DOF.svgMarker0.detectedId === 0 &&
      results.ujian5_marker6DOF.svgMarker1.detectedId === 1 &&
      results.ujian5_marker6DOF.svgMarker2.detectedId === 2 &&
      results.ujian5_interaksiDanMarkah.noDoubleScore === true &&
      results.ujian6.mode3D === '3d' &&
      results.ujian6.videoSrcCleared === true &&
      results.ujian7.visibleDuringTrack === true &&
      results.ujian7.visibleAfterLost === false &&
      results.ujian7.allAnchorsHidden === true &&
      errors.length === 0;

    console.log('\n============================================================');
    console.log('KEPUTUSAN KESELURUHAN UJIAN 1 - UJIAN 7:', allPassed ? 'LULUS 100% ✅' : 'GAGAL ❌');
    console.log('============================================================\n');

    if (!allPassed) {
      process.exitCode = 1;
    }

    ws.close();
  } finally {
    chrome.kill();
    server.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
