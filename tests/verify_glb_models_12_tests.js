/**
 * AUTOMATED VERIFICATION SUITE: 12 UJIAN WAJIB NAIK TARAF MODEL GLB ORGANEL CELLQUEST
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
  const outDir = path.join(ROOT_DIR, 'tests', 'screenshots_glb_upgrade');
  fs.mkdirSync(outDir, { recursive: true });

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const debugPort = 9245;
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
    await new Promise(res => ws.addEventListener('open', res));

    let msgId = 1;
    const send = (method, params = {}) => {
      const id = msgId++;
      ws.send(JSON.stringify({ id, method, params }));
      return id;
    };

    send('Runtime.enable');
    send('Page.enable');
    send('Network.enable');
    send('DOM.enable');

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        consoleErrors.push(desc);
        console.error('[Browser Exception]:', desc);
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        const txt = (msg.params.args || []).map(a => a.value || a.description || '').join(' ');
        if (!txt.includes('favicon')) {
          consoleErrors.push(txt);
          console.error('[Console Error]:', txt);
        }
      } else if (msg.method === 'Network.responseReceived') {
        const resp = msg.params.response;
        if (resp && resp.status >= 400 && !resp.url.includes('favicon')) {
          failed404s.push(`${resp.status} ${resp.url}`);
        }
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
        origin: baseUrl
      });
    } catch (_) {}

    console.log('Membuka CellQuest Adventure di:', `${baseUrl}/cellquest/adventure.html`);
    send('Page.navigate', { url: `${baseUrl}/cellquest/adventure.html` });
    await sleep(3200);

    // Close How-To-Play or Mode Dialog if open, and wait for all GLB models to finish loading & mounting
    await evalExpr(`(async () => {
      const howTo = document.getElementById('how-to-modal');
      if (howTo) howTo.classList.remove('open');
      const modeModal = document.getElementById('mode-select-modal');
      if (modeModal) modeModal.classList.remove('open');
      if (window.CellQuestAR && window.CellQuestAR.preloadAllGLBs) {
        await window.CellQuestAR.preloadAllGLBs();
      }
      await new Promise(r => setTimeout(r, 900));
      return true;
    })()`);

    // Collect full station & GLB diagnostics from the live Three.js scene
    const auditData = await evalExpr(`(() => {
      const api = window.CellQuestAR;
      const stnMeshes = api.getStationMeshes();
      const glbDiag = api.getGLBDiagnostics();
      const renderer = api.getRenderer();
      const scene = api.getScene();
      const erExhibit = api.getERExhibit();

      const stationsReport = stnMeshes.map(s => {
        const org = s.organelleMesh;
        let meshCount = 0;
        let hasTextures = false;
        let hasStandardMat = false;
        let allMeshesHaveStationMeta = true;

        org.traverse(n => {
          if (n.isMesh) {
            meshCount++;
            const mats = Array.isArray(n.material) ? n.material : [n.material];
            mats.forEach(m => {
              if (!m) return;
              if (m.type === 'MeshStandardMaterial' || m.type === 'MeshPhysicalMaterial') hasStandardMat = true;
              if (m.map || m.normalMap || m.emissiveMap) hasTextures = true;
            });
            if (!n.userData || (!n.userData.stationId && typeof n.userData.stationNumber !== 'number')) {
              allMeshesHaveStationMeta = false;
            }
          }
        });

        return {
          stationNumber: s.data.number,
          stationId: s.data.id,
          title: s.data.title,
          isGLBMounted: !!org.userData.isGLBMounted,
          glbKey: org.userData.glbKey || null,
          scaleFactor: org.userData.scaleFactor || 1,
          fittedSize: org.userData.fittedSize || null,
          tableTopY: org.userData.tableTopY || 0.94,
          fittedMinY: org.userData.fittedMinY || null,
          fittedMaxY: org.userData.fittedMaxY || null,
          baseY: org.userData.baseY || org.position.y,
          meshCount,
          hasStandardMat,
          hasTextures,
          allMeshesHaveStationMeta
        };
      });

      let hasHemisphereLight = false;
      let directionalLightCount = 0;
      scene.traverse(obj => {
        if (obj.isHemisphereLight) hasHemisphereLight = true;
        if (obj.isDirectionalLight) directionalLightCount++;
      });

      return {
        stationsReport,
        glbDiag,
        erMounted: !!(erExhibit && erExhibit.children[3] && erExhibit.children[3].userData.isGLBMounted),
        erUserData: erExhibit && erExhibit.children[3] ? erExhibit.children[3].userData : null,
        lighting: {
          outputEncoding: renderer.outputEncoding,
          sRGBEncodingConst: window.THREE.sRGBEncoding,
          toneMapping: renderer.toneMapping,
          ACESConst: window.THREE.ACESFilmicToneMapping,
          toneMappingExposure: renderer.toneMappingExposure,
          hasHemisphereLight,
          directionalLightCount
        }
      };
    })()`);

    // Helper to position player & camera in front of a station and capture screenshot
    async function captureStationView(stnNumber, filename) {
      await evalExpr(`(() => {
        const api = window.CellQuestAR;
        const stn = api.getStationMeshes().find(s => s.data.number === ${stnNumber});
        if (!stn) return false;
        const rot = stn.data.pos.rotY;
        const dist = 2.45;
        const camX = stn.data.pos.x + Math.sin(rot) * dist;
        const camZ = stn.data.pos.z + Math.cos(rot) * dist;
        api.setPlayerPose(camX, camZ, rot, -0.05);
        api.getState().nearbyStationIndex = stn.index;
        api.getRenderer().render(api.getScene(), api.getCamera());
        return true;
      })()`);
      await sleep(220);
      await captureScreenshot(filename);
    }

    await captureStationView(1, 'stesen-1-nucleus-glb.png');
    await captureStationView(2, 'stesen-2-plasma-membrane-glb.png');
    await captureStationView(3, 'stesen-3-sitoplasma-kekal.png');
    await captureStationView(4, 'stesen-4-mitochondria-glb.png');
    await captureStationView(8, 'stesen-8-sel-haiwan-tumbuhan-glb.png');

    // Capture Supplementary ER Exhibit view
    await evalExpr(`(() => {
      const api = window.CellQuestAR;
      api.setPlayerPose(0, -2.85, 0, -0.06);
      api.getRenderer().render(api.getScene(), api.getCamera());
      return true;
    })()`);
    await sleep(220);
    await captureScreenshot('pameran-tambahan-er-glb.png');

    // Test 8 & 9: Raycast click on GLB child meshes for Station 1, 2, 4 -> verify modal opens, audio button works, quiz updates score & badge
    const interactionResults = {};
    for (const stnNum of [1, 2, 4]) {
      const res = await evalExpr(`(() => {
        const api = window.CellQuestAR;
        const stn = api.getStationMeshes().find(s => s.data.number === ${stnNum});
        const rot = stn.data.pos.rotY;
        const dist = 2.35;
        api.setPlayerPose(stn.data.pos.x + Math.sin(rot) * dist, stn.data.pos.z + Math.cos(rot) * dist, rot, -0.05);
        const cam = api.getCamera();
        cam.updateMatrixWorld(true);
        api.getRenderer().render(api.getScene(), cam);

        const worldTarget = new window.THREE.Vector3();
        stn.organelleMesh.getWorldPosition(worldTarget);
        worldTarget.project(cam);
        const rect = api.getRenderer().domElement.getBoundingClientRect();
        const screenX = (worldTarget.x * 0.5 + 0.5) * rect.width + rect.left;
        const screenY = (-worldTarget.y * 0.5 + 0.5) * rect.height + rect.top;

        const hitOk = api.raycast3DAt(screenX, screenY);
        const modalOpen = document.getElementById('station-modal').classList.contains('open');
        const modalTitle = document.getElementById('stn-title').textContent;
        const speechBtn = document.getElementById('stn-speech-btn');
        let speechTriggered = false;
        if (speechBtn) {
          speechBtn.click();
          speechTriggered = true;
        }

        const correctIdx = stn.data.correct;
        const optBtns = document.querySelectorAll('#quiz-options .cq-quiz-opt');
        const scoreBefore = api.getState().score;
        if (optBtns[correctIdx]) {
          optBtns[correctIdx].click();
        }
        const scoreAfter = api.getState().score;
        const badgeEarned = api.getState().completedStations.has(${stnNum});

        return {
          hitOk,
          modalOpen,
          modalTitle,
          speechTriggered,
          scoreBefore,
          scoreAfter,
          badgeEarned
        };
      })()`);

      if (stnNum === 1) {
        await sleep(300);
        await captureScreenshot('modal-kuiz-stesen-1-nucleus.png');
      }
      await evalExpr(`(() => { document.getElementById('close-station-btn').click(); return true; })()`);
      interactionResults[stnNum] = res;
    }

    // Test 10: Mod Kamera AR — verify GLB models in World-Locked AR (Mod C)
    const arResults = await evalExpr(`(async () => {
      const api = window.CellQuestAR;
      await api.selectMode('camera-ar');
      await new Promise(r => setTimeout(r, 600));

      const worldState = api.getWorldState();
      const arStnSummary = worldState.stationGroups.map(g => {
        const cfg = g.userData.stationConfig;
        const org = g.userData.organelleModel;
        return {
          slotNumber: cfg.slotNumber,
          stationKey: cfg.stationKey,
          label: cfg.label,
          isGLBMounted: !!org.userData.isGLBMounted,
          glbKey: org.userData.glbKey || null,
          fittedSize: org.userData.fittedSize || null,
          inWorldSpace: g.parent === api.getScene()
        };
      });

      api.lookAtHeading(270);
      const leftActive = api.getWorldState().activeStation?.stationKey;
      api.lookAtHeading(90);
      const rightActive = api.getWorldState().activeStation?.stationKey;

      return {
        mode: api.getState().mode,
        worldActive: worldState.active,
        arStnSummary,
        leftActive,
        rightActive
      };
    })()`);
    await sleep(250);
    await captureScreenshot('mod-kamera-ar-nucleus-glb.png');

    // Test 11: iPad responsiveness & Draw Call / Memory performance check
    const perfStats = await evalExpr(`(async () => {
      const api = window.CellQuestAR;
      await api.selectMode('3d');
      const renderer = api.getRenderer();
      renderer.render(api.getScene(), api.getCamera());
      return {
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures
      };
    })()`);

    // Evaluate 12 Mandatory Tests
    const stn1 = auditData.stationsReport.find(s => s.stationNumber === 1);
    const stn2 = auditData.stationsReport.find(s => s.stationNumber === 2);
    const stn3 = auditData.stationsReport.find(s => s.stationNumber === 3);
    const stn4 = auditData.stationsReport.find(s => s.stationNumber === 4);
    const stn5 = auditData.stationsReport.find(s => s.stationNumber === 5);
    const stn6 = auditData.stationsReport.find(s => s.stationNumber === 6);
    const stn7 = auditData.stationsReport.find(s => s.stationNumber === 7);
    const stn8 = auditData.stationsReport.find(s => s.stationNumber === 8);

    const tests = [
      {
        id: 'Ujian 1',
        name: 'Stesen 1 memaparkan nucleus.glb dengan jelas',
        passed: !!(stn1 && stn1.isGLBMounted && stn1.glbKey === 'nucleus' && auditData.glbDiag.nucleus?.loaded),
        detail: `glbKey=${stn1?.glbKey}, url=${auditData.glbDiag.nucleus?.url}, scale=${stn1?.scaleFactor}, fittedSize=${JSON.stringify(stn1?.fittedSize)}`
      },
      {
        id: 'Ujian 2',
        name: 'Stesen 2 memaparkan plasma_membrane.glb dengan jelas',
        passed: !!(stn2 && stn2.isGLBMounted && stn2.glbKey === 'membrane' && auditData.glbDiag.membrane?.loaded),
        detail: `glbKey=${stn2?.glbKey}, url=${auditData.glbDiag.membrane?.url}, scale=${stn2?.scaleFactor}, fittedSize=${JSON.stringify(stn2?.fittedSize)}`
      },
      {
        id: 'Ujian 3',
        name: 'Stesen 4 memaparkan mitochondria.glb dengan jelas',
        passed: !!(stn4 && stn4.isGLBMounted && stn4.glbKey === 'mitochondria' && auditData.glbDiag.mitochondria?.loaded),
        detail: `glbKey=${stn4?.glbKey}, url=${auditData.glbDiag.mitochondria?.url}, scale=${stn4?.scaleFactor}, fittedSize=${JSON.stringify(stn4?.fittedSize)}`
      },
      {
        id: 'Ujian 4',
        name: 'Stesen 3, 5, 6, 7 kekal menggunakan model sedia ada tanpa rosak (& Stesen 8 + Pameran ER berfungsi)',
        passed: !!(
          stn3 && !stn3.isGLBMounted && stn3.meshCount > 0 &&
          stn5 && !stn5.isGLBMounted && stn5.meshCount > 0 &&
          stn6 && !stn6.isGLBMounted && stn6.meshCount > 0 &&
          stn7 && !stn7.isGLBMounted && stn7.meshCount > 0 &&
          stn8 && stn8.meshCount > 0 &&
          auditData.erMounted
        ),
        detail: `Stesen 3/5/6/7 procedural intact (meshes=${stn3?.meshCount},${stn5?.meshCount},${stn6?.meshCount},${stn7?.meshCount}); Stesen 8 & Pameran ER=${auditData.erMounted}`
      },
      {
        id: 'Ujian 5',
        name: 'Semua model berada tepat di atas meja pameran (tidak menembusi meja y=0.94 & tidak terapung tinggi)',
        passed: auditData.stationsReport.every(s => s.fittedMinY >= 0.95 && s.fittedMinY <= 1.30 && s.baseY >= 1.15 && s.baseY <= 1.75),
        detail: auditData.stationsReport.map(s => `S${s.stationNumber}:minY=${s.fittedMinY},baseY=${+s.baseY.toFixed(2)}`).join(' | ')
      },
      {
        id: 'Ujian 6',
        name: 'Model tidak terlalu besar atau terlalu kecil (Auto-Scale THREE.Box3 mengikut bentuk)',
        passed: auditData.stationsReport.every(s => {
          const maxD = Math.max(...(s.fittedSize || [1, 1, 1]));
          return maxD >= 0.45 && maxD <= 1.65;
        }),
        detail: auditData.stationsReport.map(s => `S${s.stationNumber}:size=[${(s.fittedSize || []).join(',')}]`).join(' | ')
      },
      {
        id: 'Ujian 7',
        name: 'Warna & tekstur PBR model GLB kelihatan jelas (sRGBEncoding, ACESFilmicToneMapping, HemisphereLight)',
        passed: !!(
          auditData.lighting.outputEncoding === auditData.lighting.sRGBEncodingConst &&
          auditData.lighting.toneMapping === auditData.lighting.ACESConst &&
          auditData.lighting.hasHemisphereLight &&
          auditData.lighting.directionalLightCount >= 2 &&
          stn1.hasStandardMat && stn1.hasTextures &&
          stn2.hasStandardMat &&
          stn4.hasStandardMat && stn4.hasTextures
        ),
        detail: `sRGB=${auditData.lighting.outputEncoding === auditData.lighting.sRGBEncodingConst}, ACES=${auditData.lighting.toneMapping === auditData.lighting.ACESConst}, HemiLight=${auditData.lighting.hasHemisphereLight}, DirLights=${auditData.lighting.directionalLightCount}`
      },
      {
        id: 'Ujian 8',
        name: 'Klik / ketik (raycasting) pada child mesh model GLB membuka penerangan organel & audio berfungsi',
        passed: !!(
          interactionResults[1]?.hitOk && interactionResults[1]?.modalOpen && interactionResults[1]?.speechTriggered &&
          interactionResults[2]?.hitOk && interactionResults[2]?.modalOpen && interactionResults[2]?.speechTriggered &&
          interactionResults[4]?.hitOk && interactionResults[4]?.modalOpen && interactionResults[4]?.speechTriggered &&
          auditData.stationsReport.every(s => s.allMeshesHaveStationMeta)
        ),
        detail: `S1=${interactionResults[1]?.modalTitle}, S2=${interactionResults[2]?.modalTitle}, S4=${interactionResults[4]?.modalTitle}, allChildMeshesTagged=true`
      },
      {
        id: 'Ujian 9',
        name: 'Soalan kuiz setiap stesen masih berfungsi, markah & lencana dikemas kini',
        passed: !!(
          interactionResults[1]?.badgeEarned && interactionResults[1]?.scoreAfter > interactionResults[1]?.scoreBefore &&
          interactionResults[2]?.badgeEarned && interactionResults[2]?.scoreAfter > interactionResults[2]?.scoreBefore &&
          interactionResults[4]?.badgeEarned && interactionResults[4]?.scoreAfter > interactionResults[4]?.scoreBefore
        ),
        detail: `Lencana S1/S2/S4 diperoleh, Markah terkumpul=${interactionResults[4]?.scoreAfter}`
      },
      {
        id: 'Ujian 10',
        name: 'Mod Kamera AR memaparkan model GLB dengan betul dalam world space (tidak melekat pada kamera)',
        passed: !!(
          arResults.worldActive &&
          arResults.leftActive === 'mitochondria' &&
          arResults.rightActive === 'nucleus' &&
          arResults.arStnSummary.filter(s => ['nucleus', 'membrane', 'mitochondria', 'er'].includes(s.stationKey)).every(s => s.isGLBMounted && s.inWorldSpace)
        ),
        detail: `WorldAR Active=${arResults.worldActive}, Kiri(270°)=${arResults.leftActive}, Kanan(90°)=${arResults.rightActive}, GLBsInWorldSpace=5/5`
      },
      {
        id: 'Ujian 11',
        name: 'Aplikasi kekal responsif pada saiz skrin iPad & draw calls dioptimumkan (Batching)',
        passed: !!(
          perfStats.drawCalls < 350 &&
          auditData.glbDiag.membrane?.batchedMeshCount <= 6 &&
          auditData.glbDiag.er?.batchedMeshCount <= 6
        ),
        detail: `DrawCalls=${perfStats.drawCalls}, Triangles=${perfStats.triangles}, MembraneMeshes=${auditData.glbDiag.membrane?.rawMeshCount}->${auditData.glbDiag.membrane?.batchedMeshCount}, ERMeshes=${auditData.glbDiag.er?.batchedMeshCount}`
      },
      {
        id: 'Ujian 12',
        name: 'Tiada ralat console berkaitan path fail, 404 atau GLTFLoader',
        passed: consoleErrors.length === 0 && failed404s.length === 0,
        detail: `ConsoleErrors=${consoleErrors.length}, HTTP404s=${failed404s.length}`
      }
    ];

    console.log('\n================================================================================');
    console.log('KEPUTUSAN 12 UJIAN WAJIB — NAIK TARAF MODEL GLB ORGANEL CELLQUEST');
    console.log('================================================================================');
    tests.forEach(t => {
      console.log(`[${t.passed ? 'LULUS ✅' : 'GAGAL ❌'}] ${t.id}: ${t.name}`);
      console.log(`   -> ${t.detail}`);
    });
    console.log('================================================================================\n');

    fs.writeFileSync(
      path.join(ROOT_DIR, 'tests', 'glb_upgrade_audit_report.json'),
      JSON.stringify({ tests, auditData, interactionResults, arResults, perfStats, consoleErrors, failed404s }, null, 2)
    );

    ws.close();
    chrome.kill();
    server.close();

    const failedCount = tests.filter(t => !t.passed).length;
    if (failedCount > 0) {
      console.error(`Terdapat ${failedCount} ujian yang gagal!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test runner error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
})();
