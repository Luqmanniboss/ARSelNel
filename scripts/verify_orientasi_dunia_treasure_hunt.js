/**
 * scripts/verify_orientasi_dunia_treasure_hunt.js
 * Verification and automated screenshot generation for AR Orientasi Dunia — Fasa A.1
 * Treasure Hunt Spatial Layout Enhancement.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const CDP_PORT = 9408;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WS = global.WebSocket || require('ws');
    this.ws = new WS(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const screenshotsDir = path.join(__dirname, '..', 'tests', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const artifactDir = path.join('C:', 'Users', 'Owner', '.gemini', 'antigravity', 'brain', '79bd7697-b4c0-4d63-a433-1c26b97eaefb');
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), `edge_cdp_treasurehunt_${Date.now()}`);

  console.log('[1/7] Launching headless Edge (iPad landscape 1024x768) on auth page to seed session...');
  const edgeProcess = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--window-size=1024,768',
    'http://localhost:3000/auth/login.html'
  ], { detached: false });

  try {
    await delay(3000);

    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${CDP_PORT}/json/list`, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('Target page not found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    // 1. Seed user session
    await cdp.eval(`
      (() => {
        const user = { id: 'test_student', name: 'Pelajar Sains Tingkatan 1', role: 'student', isGuest: false };
        localStorage.setItem('arselnel_current_user', JSON.stringify(user));
        localStorage.setItem('currentUser', JSON.stringify(user));
      })()
    `);

    // 2. Set iPad landscape viewport
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
      mobile: true,
      screenOrientation: { angle: 90, type: 'landscapePrimary' }
    });

    // 3. Navigate to adventure.html with camera-ar mode
    console.log('[2/7] Navigating to adventure.html?mode=camera-ar...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/cellquest/adventure.html?mode=camera-ar' });
    await delay(4000);

    // 4. Audit 8 stations
    console.log('[3/7] Auditing 8 stations spatial configuration...');
    const auditData = await cdp.eval(`
      (() => {
        if (!window.CellQuestAR || !window.CellQuestAR.getStationsConfig) {
          return { error: 'CellQuestAR not yet available' };
        }
        return window.CellQuestAR.getStationsConfig().map(s => ({
          num: s.stationNumber,
          label: s.label,
          dir: s.directionName,
          azimuthDeg: s.azimuthDeg,
          elevationDeg: s.elevationDeg,
          radius: s.radius,
          tier: s.distanceTier
        }));
      })()
    `);
    console.log('8 Stations Config:', JSON.stringify(auditData, null, 2));

    // Dismiss calibration dialog if shown
    await cdp.eval(`
      (() => {
        const calClose = document.getElementById('ar-world-close-cal-btn');
        if (calClose) calClose.click();
        const calUI = document.getElementById('ar-world-calibration-ui');
        if (calUI) calUI.style.display = 'none';
      })()
    `);
    await delay(1000);

    // 5. STAGE 1: Looking away at 180° so Stesen 1 (0°) and Stesen 3 (90°) are in mystery mode
    console.log('[4/7] Capturing Stage 1: Mystery Silhouette (? icon on glowing floor ring)...');
    await cdp.eval(`
      (() => {
        // Point camera towards 180° (Belakang - Kloroplas)
        if (window.CellQuestAR && window.CellQuestAR.lookAtHeading) {
          window.CellQuestAR.lookAtHeading(180, -9);
        }
      })()
    `);
    await delay(1200);

    const stage1File = path.join(screenshotsDir, 'treasure_hunt_stage1_mystery.png');
    await cdp.captureScreenshot(stage1File);
    fs.copyFileSync(stage1File, path.join(artifactDir, 'treasure_hunt_stage1_mystery.png'));
    console.log(`📸 Saved Stage 1: ${stage1File}`);

    // 6. STAGE 2: Approaching Stesen 1 Nukleus (Point camera to Azimuth 0°, Elevation -23°)
    console.log('[5/7] Capturing Stage 2: Approaching Stesen 1 Nukleus (0°, -23° at table level)...');
    await cdp.eval(`
      (() => {
        if (window.CellQuestAR && window.CellQuestAR.lookAtHeading) {
          window.CellQuestAR.lookAtHeading(0, -23);
        }
      })()
    `);
    await delay(1500);

    const stage2File = path.join(screenshotsDir, 'treasure_hunt_stage2_approaching.png');
    await cdp.captureScreenshot(stage2File);
    fs.copyFileSync(stage2File, path.join(artifactDir, 'treasure_hunt_stage2_approaching.png'));
    console.log(`📸 Saved Stage 2: ${stage2File}`);

    // 7. STAGE 3: Detection Banner & Prompt
    console.log('[6/7] Capturing Stage 3: Station Detected Banner with Teroka button...');
    const bannerInfo = await cdp.eval(`
      (() => {
        const b = document.getElementById('ar-world-detected-banner');
        const inst = document.getElementById('ar-single-instruction-text');
        return {
          bannerVisible: b ? (b.style.display !== 'none' && b.style.opacity !== '0') : false,
          bannerTitle: b ? b.querySelector('.cq-detected-title')?.textContent : null,
          bannerKicker: b ? b.querySelector('.cq-detected-kicker')?.textContent : null,
          bannerDesc: b ? b.querySelector('.cq-detected-desc')?.textContent : null,
          hasExploreBtn: b ? !!b.querySelector('#ar-detected-explore-btn') : false,
          instructionText: inst ? inst.textContent : null
        };
      })()
    `);
    console.log('Stage 3 Telemetry:', bannerInfo);

    const stage3File = path.join(screenshotsDir, 'treasure_hunt_stage3_detected.png');
    await cdp.captureScreenshot(stage3File);
    fs.copyFileSync(stage3File, path.join(artifactDir, 'treasure_hunt_stage3_detected.png'));
    console.log(`📸 Saved Stage 3: ${stage3File}`);

    // 8. SMART RADAR OVERVIEW
    console.log('[7/7] Capturing Smart Radar Overview...');
    await cdp.eval(`
      (() => {
        if (window.CellQuestAR && window.CellQuestAR.toggleSmartRadarPanel) {
          window.CellQuestAR.toggleSmartRadarPanel(true);
        }
      })()
    `);
    await delay(800);

    const radarFile = path.join(screenshotsDir, 'treasure_hunt_smart_radar_overview.png');
    await cdp.captureScreenshot(radarFile);
    fs.copyFileSync(radarFile, path.join(artifactDir, 'treasure_hunt_smart_radar_overview.png'));
    console.log(`📸 Saved Radar Overview: ${radarFile}`);

    cdp.close();
    console.log('✅ ALL VERIFICATION SCREENSHOTS AND DATA SUCCESSFULLY CAPTURED!');
  } finally {
    try {
      edgeProcess.kill('SIGKILL');
    } catch (e) {}
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
