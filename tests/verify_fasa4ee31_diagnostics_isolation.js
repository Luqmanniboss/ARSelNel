/**
 * ARSELNEL — FASA 4E-E.3.1 DIAGNOSTIK & UJIAN PENGASINGAN (MOD A - E)
 * Mengumpul profil memori WebGL (renderer.info.memory), AnimationMixer, GLB dimuatkan,
 * active render loops, JS heap, dan menguji 5 mod pengasingan (A..E) tanpa mengubah
 * pengalaman pengguna biasa.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
const DEBUG_PORT = 9357;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Tiada pelayar Edge/Chrome ditemui.');
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
    this.consoleErrors = [];
    this.pageErrors = [];
    this.http404s = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const details = msg.params?.exceptionDetails;
        this.pageErrors.push(details?.exception?.description || details?.text || 'Unknown exception');
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params?.type === 'error') {
          const args = (msg.params.args || []).map((a) => a.value || a.description || '').join(' ');
          if (!args.includes('favicon') && !args.includes('supabase')) {
            this.consoleErrors.push(args);
          }
        }
      } else if (msg.method === 'Network.responseReceived') {
        const resp = msg.params?.response;
        if (resp && resp.status === 404 && !resp.url.includes('favicon')) {
          this.http404s.push(resp.url);
        }
      }
    });
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    try { this.ws && this.ws.close(); } catch (_) {}
  }
}

async function runIsolationScenario(browserExe, userDataDir, modeCode) {
  const browserArgs = [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=430,932', // Saiz skrin iPhone Pro Max
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-gpu-sandbox',
    'about:blank'
  ];
  const proc = spawn(browserExe, browserArgs, { stdio: 'ignore' });
  try {
    let targets = null;
    for (let i = 0; i < 40; i++) {
      try {
        targets = await getJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
        if (Array.isArray(targets) && targets.length > 0) break;
      } catch (_) {}
      await sleep(250);
    }
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    // Simulasi DPR=3 seperti iPhone sebenar
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      mobile: true
    });

    // Aktifkan sesi tetamu sah melalui AuthGuard sebelum memasuki adventure.html
    await client.navigate(`${BASE_URL}/auth/login.html`);
    for (let i = 0; i < 20; i++) {
      const hasGuard = await client.eval(`!!(window.AuthGuard && typeof window.AuthGuard.setGuestSession === 'function')`).catch(() => false);
      if (hasGuard) {
        await client.eval(`window.AuthGuard.setGuestSession()`);
        break;
      }
      await sleep(150);
    }

    const query = modeCode
      ? `?mode=camera-ar&from=kotak&diag=1&diag_isolation=${modeCode}`
      : `?mode=camera-ar&from=kotak`;
    await client.navigate(`${BASE_URL}/cellquest/adventure.html${query}`);

    let ready = false;
    for (let i = 0; i < 80; i++) {
      try {
        ready = await client.eval(`!!(window.CellQuestAR && window.CellQuestAR.getWorldState().active)`);
      } catch (_) {
        ready = false;
      }
      if (ready) break;
      await sleep(250);
    }
    if (!ready) {
      const debugState = await client.eval(`({ href: location.href, readyState: document.readyState, hasAPI: !!window.CellQuestAR })`);
      throw new Error(`Timeout menunggu CellQuestAR (${modeCode || 'NORMAL'}): ${JSON.stringify(debugState)} errors=${JSON.stringify(client.pageErrors)}`);
    }

    // Tunggu semua GLB organel (+ GLB peti jika bukan mod A/D) selesai dimuatkan untuk bacaan memori tepat
    await client.eval(`(async () => {
      if (window.CellQuestAR && window.CellQuestAR.preloadAllGLBs) {
        await Promise.allSettled([window.CellQuestAR.preloadAllGLBs()]);
      }
      if (window.CellQuestAR && window.CellQuestAR.loadTreasureChestGLB) {
        await Promise.allSettled([window.CellQuestAR.loadTreasureChestGLB()]);
      }
    })()`);
    await sleep(1000);

    if (modeCode === 'B' || modeCode === 'C') {
      await client.eval(`window.CellQuestAR.startTreasureHunt()`);
      await sleep(1500);
    } else if (modeCode === 'D' || modeCode === 'E' || modeCode === null) {
      // Simulasi aliran sebenar: buka modal Teroka & jawab soalan stesen 1 (Nukleus), stesen 4 (Mitokondrion), stesen 2 (Membran)
      await client.eval(`window.CellQuestAR.openQuiz(0)`);
      await sleep(1200);
      await client.eval(`document.querySelectorAll('#quiz-options .cq-quiz-opt')[1]?.click()`);
      await sleep(400);
      await client.eval(`document.getElementById('close-station-btn')?.click()`);
      await sleep(300);

      await client.eval(`window.CellQuestAR.openQuiz(3)`);
      await sleep(1500);
      await client.eval(`document.querySelectorAll('#quiz-options .cq-quiz-opt')[2]?.click()`);
      await sleep(400);
      await client.eval(`document.getElementById('close-station-btn')?.click()`);
      await sleep(300);

      await client.eval(`window.CellQuestAR.openQuiz(1)`);
      await sleep(1200);
      await client.eval(`document.querySelectorAll('#quiz-options .cq-quiz-opt')[0]?.click()`);
      await sleep(400);

      // Kini aktifkan Treasure Hunt dan buka kuiz peti sementara modal stesen ditutup
      await client.eval(`document.getElementById('close-station-btn')?.click()`);
      await sleep(300);
      await client.eval(`window.CellQuestAR.startTreasureHunt()`);
      await sleep(1200);
      await client.eval(`window.CellQuestAR.openTreasureChestModal(0)`);
      await sleep(600);
      await client.eval(`window.CellQuestAR.answerBonusQuestion(1)`);
      await sleep(600);
    }

    const report = await client.eval(`(() => {
      const diag = window.CellQuestAR.getCrashDiagnostics();
      const overlayVisible = !!document.getElementById('cq-crash-diag-overlay');
      const mem = performance && performance.memory ? {
        usedMB: +(performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        totalMB: +(performance.memory.totalJSHeapSize / 1048576).toFixed(2)
      } : null;
      return { diag, overlayVisible, jsHeap: mem };
    })()`);

    client.close();
    return {
      modeCode: modeCode || 'NORMAL',
      ...report,
      consoleErrors: client.consoleErrors,
      pageErrors: client.pageErrors,
      http404s: client.http404s
    };
  } finally {
    try { proc.kill('SIGKILL'); } catch (_) {}
    await sleep(500);
  }
}

async function main() {
  const browserExe = findBrowserExecutable();
  const tempRoot = path.join(__dirname, '..', 'scratch_diag_profile');
  fs.mkdirSync(tempRoot, { recursive: true });

  const results = [];
  for (const mode of [null, 'A', 'B', 'C', 'D', 'E']) {
    const profileDir = path.join(tempRoot, `prof_${mode || 'NORMAL'}`);
    fs.rmSync(profileDir, { recursive: true, force: true });
    fs.mkdirSync(profileDir, { recursive: true });
    console.log(`Menjalankan ujian pengasingan: ${mode || 'NORMAL (Pengguna Biasa)'}...`);
    const r = await runIsolationScenario(browserExe, profileDir, mode);
    results.push(r);
  }

  fs.rmSync(tempRoot, { recursive: true, force: true });

  console.log('\n=== RINGKASAN PROFIL PENGASINGAN FASA 4E-E.3.1 ===');
  console.table(results.map((r) => ({
    Mod: r.modeCode,
    Overlay: r.overlayVisible,
    Renderers: r.diag.activeRenderers,
    Loops: r.diag.activeAnimationLoops,
    Mixers: r.diag.activeAnimationMixers,
    MainGeo: r.diag.mainRendererInfo.memory.geometries,
    MainTex: r.diag.mainRendererInfo.memory.textures,
    MainCalls: r.diag.mainRendererInfo.render.calls,
    PrevGeo: r.diag.previewRendererInfo.memory.geometries,
    PrevTex: r.diag.previewRendererInfo.memory.textures,
    OrganelGLB: r.diag.glbLoaded.organelleCount,
    ChestGLB: r.diag.glbLoaded.treasureChestCached,
    Chests: r.diag.glbLoaded.chestGroupsCount,
    JSHeapMB: r.jsHeap ? r.jsHeap.usedMB : 'N/A',
    Errs: r.pageErrors.length + r.diag.jsErrorsCount + r.diag.unhandledRejectionsCount
  })));

  // Semakan pengesahan ketat
  const checks = [];
  const check = (name, cond, detail) => {
    checks.push({ name, pass: !!cond, detail });
    console.log(`[${cond ? 'LULUS' : 'GAGAL'}] ${name} -> ${detail}`);
  };

  const normal = results.find(r => r.modeCode === 'NORMAL');
  const modA = results.find(r => r.modeCode === 'A');
  const modB = results.find(r => r.modeCode === 'B');
  const modC = results.find(r => r.modeCode === 'C');
  const modD = results.find(r => r.modeCode === 'D');
  const modE = results.find(r => r.modeCode === 'E');

  check('Pengguna Biasa: isolationMode null & overlay tersembunyi', normal.diag.isolationMode === null && !normal.overlayVisible, `isolationMode=${normal.diag.isolationMode}, overlay=${normal.overlayVisible}`);
  check('Mod A: AR Orientasi tanpa peti GLB', modA.diag.glbLoaded.treasureChestCached === false && modA.diag.glbLoaded.chestGroupsCount === 0, `chestCached=${modA.diag.glbLoaded.treasureChestCached}, chests=${modA.diag.glbLoaded.chestGroupsCount}`);
  check('Mod B: AR Orientasi dengan 1 peti GLB', modB.diag.glbLoaded.treasureChestCached === true && modB.diag.glbLoaded.chestGroupsCount === 1 && modB.diag.activeAnimationMixers === 1, `chests=${modB.diag.glbLoaded.chestGroupsCount}, mixers=${modB.diag.activeAnimationMixers}`);
  check('Mod C: AR Orientasi dengan 3 peti GLB', modC.diag.glbLoaded.treasureChestCached === true && modC.diag.glbLoaded.chestGroupsCount === 3 && modC.diag.activeAnimationMixers === 3, `chests=${modC.diag.glbLoaded.chestGroupsCount}, mixers=${modC.diag.activeAnimationMixers}`);
  check('Mod D: Kuiz aktif tanpa peti GLB', modD.diag.glbLoaded.treasureChestCached === false && modD.diag.previewRendererInfo.memory.textures > 0, `chestCached=${modD.diag.glbLoaded.treasureChestCached}, prevTex=${modD.diag.previewRendererInfo.memory.textures}`);
  check('Mod E: Kuiz aktif + semua 3 peti GLB', modE.diag.glbLoaded.treasureChestCached === true && modE.diag.glbLoaded.chestGroupsCount === 3 && modE.diag.previewRendererInfo.memory.textures > 0, `chests=${modE.diag.glbLoaded.chestGroupsCount}, prevTex=${modE.diag.previewRendererInfo.memory.textures}`);
  check('Tiada JS Error / 404 / WebGL Lost pada semua mod pengasingan', results.every(r => r.pageErrors.length === 0 && r.http404s.length === 0 && r.diag.webglEvents.mainLost === 0), `totalErrors=${results.reduce((s, r) => s + r.pageErrors.length + r.diag.jsErrorsCount, 0)}`);

  const passed = checks.filter(c => c.pass).length;
  console.log(`\nKEPUTUSAN: ${passed}/${checks.length} semakan diagnostik & pengasingan LULUS.`);
  if (passed !== checks.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

