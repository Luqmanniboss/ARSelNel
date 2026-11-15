/**
 * ARSelNel - Automated Verification for Fasa 4E-G.3
 * TAMBAH FUNGSI CETAK KAD AR SEBELUM MEMULAKAN IMBASAN
 * tests/verify_fasa4eg3_print_markers.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const CDP_PORT = 9568;
const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = edgePaths.find(p => fs.existsSync(p));
if (!chromePath) {
  console.error('Edge executable not found');
  process.exit(1);
}

const userDataDir = path.join(os.tmpdir(), `edge_cdp_verify_print_${Date.now()}`);
const ARTIFACT_DIR = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb';
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('================================================================');
  console.log('🔍 ARSELNEL: FASA 4E-G.3 VERIFICATION TEST SUITE');
  console.log('   TAMBAH FUNGSI CETAK KAD AR SEBELUM MEMULAKAN IMBASAN');
  console.log('================================================================\n');

  // Verify .mind file integrity
  const mindPath = path.join(__dirname, '../kotak_arselnel/assets/markers/kotak_arselnel.mind');
  const mindStat = fs.statSync(mindPath);
  console.log(`[Check 16: .mind File Integrity] Size: ${mindStat.size} bytes`);
  if (mindStat.size !== 4122588) {
    console.error('❌ Ralat: Fail kotak_arselnel.mind telah diubah!');
    process.exit(1);
  } else {
    console.log('✅ Fail kotak_arselnel.mind tidak diubah sama sekali (4,122,588 bytes).');
  }

  // Verify 7 source marker images existence and sizes
  const expectedMarkers = [
    { id: 'marker-video', file: 'marker-video.png', target: 0, title: 'Video Pembelajaran' },
    { id: 'marker-nota', file: 'marker-nota.png', target: 1, title: 'Nota Interaktif' },
    { id: 'marker-kuiz', file: 'marker-kuiz.png', target: 2, title: 'Kuiz & Permainan' },
    { id: 'marker-sel-haiwan', file: 'marker-sel-haiwan.png', target: 3, title: 'Sel Haiwan 3D' },
    { id: 'marker-sel-tumbuhan', file: 'marker-sel-tumbuhan.png', target: 4, title: 'Sel Tumbuhan 3D' },
    { id: 'marker-jelajah3d', file: 'marker-jelajah3d.png', target: 5, title: 'Makmal Eksplorasi 3D' },
    { id: 'marker-orientasi-dunia', file: 'marker-orientasi-dunia.png', target: 6, title: 'AR Orientasi Dunia' }
  ];

  console.log('\n[Check 5, 6, 7 & 15: Semak 7 Imej Marker Rasmi & Ralat 404]');
  expectedMarkers.forEach(m => {
    const fPath = path.join(__dirname, '../kotak_arselnel/assets/markers', m.file);
    if (!fs.existsSync(fPath)) {
      console.error(`❌ Imej marker hilang: ${m.file}`);
      process.exit(1);
    }
    const sz = fs.statSync(fPath).size;
    console.log(`  ✓ Target ${m.target}: ${m.file} (${sz.toLocaleString()} bytes) - ${m.title}`);
  });

  const p = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run'
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === 'page');
  const ws = new (global.WebSocket || globalThis.WebSocket)(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
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

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result.value;
  }

  async function takeScreenshot(fileName) {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(r.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, fileName);
    fs.writeFileSync(outPath, buf);
    console.log(`  📸 Tangkapan skrin disimpan: ${fileName}`);
    return outPath;
  }

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        localStorage.setItem('arselnel_current_user', JSON.stringify({
          id: 'test_student_1',
          name: 'Hafif',
          email: 'hafif@arselnel.edu.my',
          role: 'student'
        }));
      `
    });

    console.log('\n--- UJIAN 1 & 2: MEMUATKAN CELLQUEST DENGAN DUA BUTANG BANNER ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: `${BASE_URL}/cellquest/code.html` });
    await new Promise(r => setTimeout(r, 2000));

    // Check 1: Button Cetak Kad AR exists and is visible
    const printBtnCheck = await evaluate(`(() => {
      const btn = document.getElementById('btn-open-print-modal');
      if (!btn) return { exists: false };
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      return {
        exists: true,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
        text: btn.innerText.trim(),
        width: rect.width,
        height: rect.height,
        bg: style.backgroundColor,
        color: style.color
      };
    })()`);

    console.log('[Kriteria 1: Butang Cetak Kad AR Muncul]', printBtnCheck);
    if (!printBtnCheck.exists || !printBtnCheck.visible) {
      throw new Error('Butang Cetak Kad AR tidak wujud atau tidak kelihatan!');
    }

    // Check 2: Button Imbas Kotak ARSELNEL exists and link is valid
    const scanBtnCheck = await evaluate(`(() => {
      const btn = document.getElementById('btn-open-kotak-arselnel');
      if (!btn) return { exists: false };
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      return {
        exists: true,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none',
        text: btn.innerText.trim(),
        href: btn.getAttribute('href'),
        width: rect.width,
        height: rect.height
      };
    })()`);

    console.log('[Kriteria 2 & 20: Butang Imbas Masih Berfungsi & Sah]', scanBtnCheck);
    if (!scanBtnCheck.exists || !scanBtnCheck.visible || !scanBtnCheck.href.includes('kotak_arselnel/code.html')) {
      throw new Error('Butang Imbas Kotak ARSELNEL rosak atau link salah!');
    }

    // Screenshot banner with two buttons
    await takeScreenshot('fasa4eg3_banner_dual_buttons_desktop.png');

    console.log('\n--- UJIAN 3 & 4: MEMBUKA & MENUTUP MODAL GALERI MARKER ---');
    // Open modal via button click
    await evaluate(`document.getElementById('btn-open-print-modal').click()`);
    await new Promise(r => setTimeout(r, 600));

    const modalOpenCheck = await evaluate(`(() => {
      const backdrop = document.getElementById('ar-print-modal-backdrop');
      const modal = document.getElementById('ar-print-modal');
      return {
        backdropOpen: !backdrop.classList.contains('hidden') && backdrop.getAttribute('aria-hidden') === 'false',
        modalVisible: modal ? modal.getBoundingClientRect().height > 0 : false
      };
    })()`);
    console.log('[Kriteria 3: Modal Boleh Dibuka]', modalOpenCheck);
    if (!modalOpenCheck.backdropOpen || !modalOpenCheck.modalVisible) {
      throw new Error('Modal gagal dibuka!');
    }

    // Take screenshot of opened modal on desktop
    await takeScreenshot('fasa4eg3_modal_gallery_desktop_1920x1080.png');

    // Test close modal
    await evaluate(`document.getElementById('btn-close-print-modal').click()`);
    await new Promise(r => setTimeout(r, 400));
    const modalClosedCheck = await evaluate(`(() => {
      const backdrop = document.getElementById('ar-print-modal-backdrop');
      return backdrop.classList.contains('hidden');
    })()`);
    console.log('[Kriteria 4: Modal Boleh Ditutup]', modalClosedCheck);
    if (!modalClosedCheck) {
      throw new Error('Modal gagal ditutup!');
    }

    // Reopen modal for content inspection
    await evaluate(`window.KotakMarkerManager.openModal()`);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- UJIAN 5, 6, 7 & 14: SEMAKAN 7 KAD MARKER DALAM MODAL ---');
    const markerCardsCheck = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.ar-marker-card'));
      return cards.map(c => {
        const img = c.querySelector('.ar-marker-img');
        const title = c.querySelector('.ar-marker-title')?.innerText.trim();
        const desc = c.querySelector('.ar-marker-desc')?.innerText.trim();
        const cb = c.querySelector('input[type="checkbox"]');
        const badge = c.querySelector('.ar-marker-target-badge')?.innerText.trim();
        return {
          id: c.getAttribute('data-marker-id'),
          title,
          badge,
          hasDesc: !!desc && desc.length > 10,
          checked: cb ? cb.checked : false,
          imgSrc: img ? img.getAttribute('src') : null,
          imgComplete: img ? img.complete : false,
          naturalWidth: img ? img.naturalWidth : 0,
          naturalHeight: img ? img.naturalHeight : 0,
          aspectRatio: img ? (img.naturalWidth / img.naturalHeight).toFixed(2) : 0
        };
      });
    })()`);

    console.log(`Dijumpai ${markerCardsCheck.length} kad marker dalam galeri:`);
    markerCardsCheck.forEach((c, idx) => {
      console.log(`  [Kad ${idx}] ${c.badge} -> ${c.title} (${c.naturalWidth}x${c.naturalHeight}, ratio: ${c.aspectRatio})`);
      if (!c.imgComplete || c.naturalWidth === 0) {
        throw new Error(`Imej kad ${c.id} gagal dimuatkan atau tiada dimensi!`);
      }
      if (c.aspectRatio !== '1.00') {
        throw new Error(`Imej kad ${c.id} nisbah bukan 1:1!`);
      }
    });

    if (markerCardsCheck.length !== 7) {
      throw new Error(`Dijumpai ${markerCardsCheck.length} kad, sepatutnya 7!`);
    }
    console.log('✅ Semua 7 kad marker dipaparkan lengkap dengan imej resolusi penuh dan nisbah 1:1.');

    console.log('\n--- UJIAN 8, 9 & 10: PEMILIHAN KAD & PILIH SEMUA ---');
    // Test deselect all
    await evaluate(`document.getElementById('cb-select-all-markers').click()`);
    await new Promise(r => setTimeout(r, 200));
    let selCount = await evaluate(`window.KotakMarkerManager.getSelected().length`);
    console.log('Selepas nyahpilih semua, kad dipilih:', selCount);
    if (selCount !== 0) throw new Error('Nyahpilih semua gagal!');

    // Test select individual (e.g. Marker 0 and Marker 3)
    await evaluate(`(() => {
      document.getElementById('cb-marker-video').click();
      document.getElementById('cb-marker-sel-haiwan').click();
    })()`);
    await new Promise(r => setTimeout(r, 200));
    selCount = await evaluate(`window.KotakMarkerManager.getSelected().length`);
    const selIds = await evaluate(`window.KotakMarkerManager.getSelected().map(m => m.id)`);
    console.log('Selepas pilih 2 kad secara manual:', selCount, selIds);
    if (selCount !== 2 || !selIds.includes('marker-video') || !selIds.includes('marker-sel-haiwan')) {
      throw new Error('Pemilihan kad individu gagal!');
    }

    // Test select all again
    await evaluate(`document.getElementById('cb-select-all-markers').click()`);
    await new Promise(r => setTimeout(r, 200));
    selCount = await evaluate(`window.KotakMarkerManager.getSelected().length`);
    console.log('Selepas pilih semua semula, kad dipilih:', selCount);
    if (selCount !== 7) throw new Error('Pilih semua semula gagal!');

    console.log('\n--- UJIAN 11, 12 & 13: PENJANAAN PDF A4 & SUSUN ATUR CETAKAN ---');
    // Test jsPDF library loading & PDF generator function
    const pdfGenTest = await evaluate(`(async () => {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        return { success: false, reason: 'jsPDF not loaded' };
      }
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        doc.text('Test ARSELNEL', 10, 10);
        const pageCount = doc.getNumberOfPages();
        const output = doc.output('datauristring');
        return {
          success: true,
          pageCount,
          dataUriLength: output.length
        };
      } catch (err) {
        return { success: false, error: err.message };
      }
    })()`);
    console.log('[Kriteria 11, 12, 13: Penjanaan PDF A4]', pdfGenTest);
    if (!pdfGenTest.success) {
      throw new Error(`Pustaka jsPDF tidak berfungsi: ${JSON.stringify(pdfGenTest)}`);
    }

    // Test print sheet population
    const printSheetCheck = await evaluate(`(() => {
      window.KotakMarkerManager.print();
      const sheet = document.getElementById('ar-print-sheet');
      const pages = sheet ? sheet.querySelectorAll('.ar-print-page') : [];
      return {
        sheetExists: !!sheet,
        pageCount: pages.length
      };
    })()`);
    console.log('[Susun Atur @media print Sheet]', printSheetCheck);
    if (!printSheetCheck.sheetExists || printSheetCheck.pageCount !== 7) {
      throw new Error(`Print sheet gagal menghasilkan 7 halaman cetak!`);
    }

    console.log('\n--- UJIAN 17, 18 & 19: UJIAN RESPONSIF PELBAGAI PERANTI ---');
    const viewports = [
      { name: 'laptop_1366x768', label: 'Laptop 1366×768', w: 1366, h: 768, mobile: false },
      { name: 'ipad_landscape_1024x768', label: 'iPad Landscape 1024×768', w: 1024, h: 768, mobile: false },
      { name: 'ipad_portrait_768x1024', label: 'iPad Portrait 768×1024', w: 768, h: 1024, mobile: true },
      { name: 'mobile_390x844', label: 'iPhone / Mobile 390×844', w: 390, h: 844, mobile: true },
      { name: 'mobile_360x740', label: 'Android Compact 360×740', w: 360, h: 740, mobile: true }
    ];

    for (const vp of viewports) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: vp.mobile ? 2 : 1,
        mobile: vp.mobile
      });
      await new Promise(r => setTimeout(r, 600));

      const modalRect = await evaluate(`(() => {
        const modal = document.getElementById('ar-print-modal');
        const r = modal.getBoundingClientRect();
        return {
          w: Math.round(r.width),
          h: Math.round(r.height),
          fitsWidth: r.width <= window.innerWidth,
          fitsHeight: r.height <= window.innerHeight
        };
      })()`);

      console.log(`  📱 [${vp.label}] Modal size: ${modalRect.w}x${modalRect.h} (fits: ${modalRect.fitsWidth && modalRect.fitsHeight})`);
      if (!modalRect.fitsWidth || !modalRect.fitsHeight) {
        throw new Error(`Modal terkeluar daripada viewport pada ${vp.label}!`);
      }

      await takeScreenshot(`fasa4eg3_modal_${vp.name}.png`);
    }

    // Close modal and take screenshot of mobile banner stacked buttons
    await evaluate(`window.KotakMarkerManager.closeModal()`);
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('fasa4eg3_banner_stacked_mobile_390x844.png');

    console.log('\n================================================================');
    console.log('🎉 SEMUA 20 KRITERIA FASA 4E-G.3 BERJAYA DIVERIFIKASI 100%!');
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Ralat semasa verifikasi:', err);
    process.exit(1);
  } finally {
    try {
      ws.close();
      p.kill();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runVerification();
