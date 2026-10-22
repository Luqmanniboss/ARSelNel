(function () {
  'use strict';
  const content = document.getElementById('manual-step-content');
  if (!content) return;

  const steps = [
    {
      icon: '🧫', color: 'mint', title: 'A. Pengenalan ARSelNel',
      lead: 'Platform pembelajaran sains biologi sel interaktif Tingkatan 1.',
      body: '<p><strong>ARSelNel (Augmented Reality & Science Learning)</strong> ialah kit pembelajaran digital interaktif yang direka khas untuk membantu murid Tingkatan 1 menguasai <em>Bab 2: Sel Sebagai Unit Asas Hidupan</em> dalam Kurikulum Standard Sekolah Menengah (KSSM).</p><p>Kit ini menggabungkan penerokaan visual 3D, Realiti Terimbuh (AR), nota padat, video animasi, pembantu kecerdasan buatan (SelBot AI), serta pelbagai permainan sains interaktif.</p><ul class="manual-instruction-list"><li><span>🧭</span><span><strong>Navigasi Bar Sisi:</strong> Gunakan menu di sebelah kiri untuk berpindah dengan pantas antara 6 modul utama: <strong>Dashboard</strong>, <strong>CellQuest</strong>, <strong>Nota</strong>, <strong>Video</strong>, <strong>Tanya AI</strong>, dan <strong>Kuiz & Permainan</strong>.</span></li><li><span>📱</span><span><strong>Reka Bentuk Responsif:</strong> Berfungsi dengan lancar pada komputer meja, komputer riba, mahupun telefon pintar.</span></li></ul>',
      visual: '<div class="manual-cell-visual"><img src="../assets/home/cell_model.svg" alt="Model Sel Biologi ARSelNel"><div class="manual-float-chip chip-one">🐾 Sel Haiwan</div><div class="manual-float-chip chip-two">🌿 Sel Tumbuhan</div><span class="manual-sparkle sparkle-one" aria-hidden="true">✦</span><span class="manual-sparkle sparkle-two" aria-hidden="true">✧</span></div>'
    },
    {
      icon: '🔬', color: 'blue', title: 'B. CellQuest 3D & AR',
      lead: 'Terokai struktur sel haiwan dan tumbuhan dalam 3D dan Realiti Terimbuh.',
      body: '<p>Modul <strong>CellQuest</strong> membolehkan anda membedah dan meneliti organel biologi sel secara terperinci:</p><ul class="manual-instruction-list"><li><span>🐾</span><span><strong>Tukar Jenis Sel:</strong> Klik tab <strong>🐾 Sel Haiwan</strong> atau <strong>🌿 Sel Tumbuhan</strong> untuk menukar model 3D Blender GLB.</span></li><li><span>🖱️</span><span><strong>Kawalan Kamera 360°:</strong> Seret tetikus/jari untuk memutar model; gunakan roda tetikus atau cubit skrin untuk zum masuk/keluar; klik kanan atau gunakan butang <strong>Anjak</strong> untuk mengalihkan kedudukan kamera.</span></li><li><span>👆</span><span><strong>Pilih Organel:</strong> Klik mana-mana organel pada model 3D atau klik namanya dalam senarai sisi untuk membaca fungsi biologi dan fakta sains KSSM.</span></li><li><span>◐</span><span><strong>Keratan & Label:</strong> Gunakan butang <strong>◐ Keratan: aktif</strong> untuk melihat keratan rentas organel dalaman, dan <strong>🏷️ Sembunyikan label</strong> untuk mematikan paparan teks. Tekan <strong>⟳ Tetapkan semula</strong> untuk kembali ke paparan asal.</span></li><li><span>📱</span><span><strong>Aktifkan AR:</strong> Tekan <strong>Mulakan Pengembaraan AR</strong> dan berikan kebenaran kamera pelayar apabila diminta. Halakan kamera ke permukaan rata untuk meletakkan model 3D. <em>(Keserasian AR bergantung pada sokongan WebXR peranti anda; mod 3D tetap berfungsi penuh tanpa kamera).</em></span></li></ul>',
      visual: '<div class="manual-interaction-demo"><div class="manual-orbit"><div class="manual-orbit-cell">🧫</div><span class="orbit-arrow">↻</span><span class="orbit-dot">🟣</span><span class="orbit-dot second">🟢</span></div><div class="manual-gesture-pills"><span>↔ Pusing 360°</span><span>＋ Zum & Anjak</span><span>👆 Pilih Organel</span><span>◐ Mod Keratan</span></div><div class="manual-info-demo"><span>🧬</span><div><b>Nukleus Sel</b><small>Mengawal aktiviti sel & DNA</small></div></div></div>'
    },
    {
      icon: '📖', color: 'orange', title: 'C. Nota Interaktif',
      lead: 'Ringkasan padat fakta biologi sel berpandukan silibus KSSM.',
      body: '<p>Modul <strong>Nota Pembelajaran</strong> menyediakan rujukan visual lengkap untuk membantu pemahaman konsep sains:</p><ul class="manual-instruction-list"><li><span>📚</span><span><strong>Buka Modul Nota:</strong> Klik menu <strong>Nota</strong> pada bar sisi atau klik <strong>Mula Belajar Sekarang</strong> pada kad Cadangan Hari Ini di Dashboard.</span></li><li><span>🔬</span><span><strong>Struktur Sel Haiwan & Tumbuhan:</strong> Pelajari setiap organel seperti membran sel, sitoplasma, nukleus, mitokondrion, vakuol, kloroplas, dan dinding sel.</span></li><li><span>⚖️</span><span><strong>Jadual Perbandingan Interaktif:</strong> Bandingkan persamaan dan perbezaan antara sel haiwan dan sel tumbuhan dengan jelas dan mudah difahami.</span></li><li><span>💡</span><span><strong>Fakta Tambahan & Ulangkaji:</strong> Manfaatkan tip sains penting bagi memperkukuh pemahaman sebelum menduduki kuiz atau ujian pentaksiran sekolah.</span></li></ul>',
      visual: '<div class="manual-ui-demo"><span class="manual-demo-label">NOTA SAINS INTERAKTIF</span><div class="manual-demo-tabs"><span>🔬 Struktur Sel</span><span class="selected">⚖️ Perbandingan</span></div><div class="manual-demo-cell" style="font-size:42px;flex-direction:column;gap:6px;padding:12px;">📑<b style="position:static;font-size:12px;color:#1e3a8a;">Jadual Sel Haiwan vs Tumbuhan</b><small style="color:#64748b;font-size:10px;">Dinding sel • Kloroplas • Vakuol</small></div><span class="manual-demo-arrow">Akses nota melalui pautan Mula Belajar Sekarang</span></div>'
    },
    {
      icon: '🎬', color: 'violet', title: 'D. Video Pembelajaran',
      lead: 'Perkukuh kefahaman sains dengan animasi 3D dan simulasi eksperimen.',
      body: '<p>Modul <strong>Perpustakaan Video</strong> menawarkan media video interaktif bagi membantu visualisasi proses biologi mikroskopik:</p><ul class="manual-instruction-list"><li><span>▶️</span><span><strong>Tonton Video Animasi:</strong> Saksikan simulasi pergerakan bahan melalui membran sel, proses fotosintesis di dalam kloroplas, dan respirasi sel di mitokondrion.</span></li><li><span>🔬</span><span><strong>Demonstrasi Makmal:</strong> Tonton cara penyediaan slaid sel pipi (sel haiwan) dan slaid sel epidermis bawang (sel tumbuhan) di bawah mikroskop cahaya.</span></li><li><span>⏯️</span><span><strong>Kawalan Penuh:</strong> Anda boleh menjeda (*pause*), mengulang (*replay*), dan menonton dalam mod skrin penuh untuk mencatat maklumat sains penting.</span></li></ul>',
      visual: '<div class="manual-ui-demo"><span class="manual-demo-label">SIMULASI VIDEO 3D</span><div class="manual-demo-cell" style="font-size:52px;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#a5b4fc;">🎥<b style="color:#e0e7ff;font-size:11px;">Animasi Mikroskopik Sel</b></div><div class="manual-gesture-pills" style="margin-top:12px;"><span>▶ Main</span><span>⏸ Jeda</span><span>↺ Ulang</span><span>⛶ Skrin Penuh</span></div></div>'
    },
    {
      icon: '🤖', color: 'pink', title: 'E. Tanya AI — SelBot',
      lead: 'Pembantu tutor maya anda untuk menjawab soalan sains sepanjang masa.',
      body: '<p><strong>SelBot AI</strong> ialah pembantu pintar peribadi anda untuk menyelesaikan sebarang kemusykilan biologi sel:</p><ul class="manual-instruction-list"><li><span>💬</span><span><strong>Cara Bertanya:</strong> Buka modul <strong>Tanya AI</strong>, taipkan soalan sains anda ke dalam kotak sembang, dan tekan butang hantar atau Enter.</span></li><li><span>💡</span><span><strong>Contoh Soalan Yang Boleh Ditanya:</strong></span></li></ul><div class="manual-note" style="margin-top:4px;">• <em>"Apakah fungsi nukleus?"</em><br>• <em>"Apakah perbezaan sel haiwan dan sel tumbuhan?"</em><br>• <em>"Mengapa sel tumbuhan mempunyai kloroplas?"</em><br>• <em>"Apakah peranan mitokondrion sebagai penjana tenaga?"</em></div><p style="margin-top:10px;">Anda boleh terus bertanya soalan susulan untuk mendapatkan penerangan sains yang lebih mendalam.</p>',
      visual: '<div class="manual-ui-demo"><span class="manual-demo-label">SEMBANG SELBOT AI</span><div class="manual-info-demo" style="background:#fdf2f8;color:#9d174d;"><span>🤖</span><div><b>SelBot Pembantu Sains</b><small>"Hai! Ada soalan tentang sel?"</small></div></div><div class="manual-info-demo" style="margin-top:8px;background:#f0fdf4;color:#166534;"><span>🧑‍🎓</span><div><b>Soalan Murid</b><small>"Apakah fungsi nukleus?"</small></div></div></div>'
    },
    {
      icon: '🎮', color: 'green', title: 'F. Kuiz & Permainan Sains',
      lead: 'Uji pengetahuan anda melalui 5 cabaran permainan interaktif yang menyeronokkan!',
      body: '<p>Akses <strong>Kuiz & Permainan Sains</strong> melalui bar sisi atau butang <strong>Mulakan Cabaran Sains</strong> di Dashboard. Terdapat 5 permainan interaktif utama:</p><ul class="manual-instruction-list"><li><span>🏷️</span><span><strong>Labelkan Organel:</strong> Tarik dan lepaskan label nama organel pada gambar rajah sel haiwan dan sel tumbuhan dengan tepat.</span></li><li><span>🕹️</span><span><strong>Maze Chase: Misi Sel Haiwan & Tumbuhan:</strong> Permainan arked 2D! Baca soalan sains, cari zon jawapan yang betul di dalam maze, kutip <em>power-up</em>, dan elak virus yang mengejar anda.</span></li><li><span>🌳</span><span><strong>Susun Organisasi Kehidupan:</strong> Susun hierarki organisasi kehidupan mengikut urutan yang betul: <em>Sel → Tisu → Organ → Sistem → Organisma</em>.</span></li><li><span>⚡</span><span><strong>Kuiz Saintis Muda:</strong> Jawab soalan kuiz aneka pilihan rawak secara pantas untuk mengumpul mata ganjaran.</span></li><li><span>🔬</span><span><strong>Misi Makmal Sains:</strong> Pengembaraan makmal 2D interaktif meneroka 10 radas makmal dan menyelesaikan soalan eksperimen sains.</span></li></ul>',
      visual: '<div class="manual-mission-demo"><span class="manual-demo-label">5 PERMAINAN SAINS TERSEDIA</span><div class="manual-mission-row" style="margin:12px 0 6px;flex-wrap:wrap;gap:8px;"><span>🏷️<small>Label</small></span><span>🕹️<small>Maze</small></span><span>🌳<small>Susun</small></span><span>⚡<small>Kuiz</small></span><span>🔬<small>Makmal</small></span></div><div class="manual-xp-demo">🏆 Skor Mata • ⏱️ Cabaran Masa • 🎮 Pembelajaran Gamifikasi</div></div>'
    },
    {
      icon: '🛠️', color: 'teal', title: 'G. Bantuan & Penyelesaian Masalah',
      lead: 'Panduan pantas sekiranya anda menghadapi sebarang kekangan teknikal.',
      body: '<p>Berikut merupakan langkah penyelesaian mudah untuk isu-isu teknikal lazim:</p><ul class="manual-instruction-list"><li><span>🌐</span><span><strong>Model 3D gagal dimuatkan:</strong> Pastikan anda membuka ARSelNel melalui pelayan web tempatan (contoh: <code>http://localhost:3000</code>) dan bukannya membuka fail secara terus (<code>file://</code>).</span></li><li><span>📷</span><span><strong>Kamera AR tidak berfungsi:</strong> Semak sama ada pelayar dan peranti anda menyokong WebXR serta berikan kebenaran kamera (*Allow Camera*). Jika peranti tidak menyokong AR, gunakan mod 3D interaktif yang berfungsi sepenuhnya.</span></li><li><span>🎬</span><span><strong>Video tidak dimainkan:</strong> Semak kelajuan capaian internet anda dan pastikan tetapan pelayar tidak menyekat media.</span></li><li><span>🤖</span><span><strong>SelBot tidak memberi respons:</strong> Pastikan soalan berkaitan topik sains ditaip dengan ringkas dan jelas, kemudian tekan butang hantar sekali lagi.</span></li><li><span>🎮</span><span><strong>Permainan tidak dapat dikawal:</strong> Gunakan kekunci anak panah atau WASD pada papan kekunci komputer, atau gunakan butang kawalan skrin pada peranti sentuh.</span></li><li><span>🏠</span><span><strong>Cara kembali ke Dashboard:</strong> Anda boleh menekan pautan <strong>← Kembali ke Dashboard</strong> di bahagian atas atau memilih menu <strong>Dashboard</strong> pada bar sisi bila-bila masa.</span></li></ul>',
      visual: '<div class="manual-finish-art" style="min-height:220px;"><span class="finish-cell">🚀</span><span class="finish-star star-a">✨</span><span class="finish-star star-b">⭐</span><span class="finish-star star-c">💡</span><span class="finish-ribbon">Selamat Meneroka ARSelNel!</span></div>'
    }
  ];

  let activeSteps = [...steps];
  const user = window.AuthGuard && AuthGuard.getUser ? AuthGuard.getUser() : null;
  const storageKey = 'arselnel_manual_step_' + (user && user.id ? String(user.id) : 'guest');
  let active = 0;
  try { active = Math.max(0, Math.min(activeSteps.length - 1, Number(localStorage.getItem(storageKey)) || 0)); } catch (_) {}

  const stepLabel = document.getElementById('manual-step-label');
  const progress = document.getElementById('manual-progress');
  const progressBar = document.getElementById('manual-progress-bar');
  const nav = document.getElementById('manual-step-nav');
  const previous = document.getElementById('manual-prev');
  const next = document.getElementById('manual-next');
  const finish = document.getElementById('manual-finish');

  function savePosition() {
    try { localStorage.setItem(storageKey, String(active)); } catch (_) {}
  }
  function render() {
    if (!activeSteps || activeSteps.length === 0) return;
    const step = activeSteps[active] || activeSteps[0];
    stepLabel.textContent = `Langkah ${active + 1} daripada ${activeSteps.length}`;
    progress.setAttribute('aria-valuenow', String(active + 1));
    progress.setAttribute('aria-valuemax', String(activeSteps.length));
    progressBar.style.width = `${((active + 1) / activeSteps.length) * 100}%`;
    nav.replaceChildren();
    activeSteps.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'manual-step-dot' + (index === active ? ' is-current' : '') + (index < active ? ' is-done' : '');
      button.setAttribute('aria-label', `Langkah ${index + 1}: ${item.title}`);
      if (index === active) button.setAttribute('aria-current', 'step');
      button.innerHTML = `<span>${index < active ? '✓' : index + 1}</span><small>${item.title}</small>`;
      button.addEventListener('click', () => go(index));
      nav.appendChild(button);
    });
    content.innerHTML = `<article class="manual-step manual-${step.color || 'blue'}"><div class="manual-step-copy"><span class="manual-step-icon" aria-hidden="true">${step.icon || '📖'}</span><span class="manual-eyebrow">LANGKAH ${active + 1} • PANDUAN SAINTIS MUDA</span><h2 tabindex="-1" id="manual-step-heading">${step.title}</h2><h3>${step.lead || ''}</h3><div class="manual-step-body">${step.body || ''}</div></div><div class="manual-step-visual">${step.visual || ''}</div></article>`;
    previous.disabled = active === 0;
    next.hidden = active === activeSteps.length - 1;
    finish.hidden = active !== activeSteps.length - 1;
    savePosition();
  }
  function go(index) {
    active = Math.max(0, Math.min(activeSteps.length - 1, index));
    render();
    const heading = document.getElementById('manual-step-heading');
    if (heading) heading.focus({ preventScroll: true });
  }
  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  document.getElementById('manual-restart').addEventListener('click', () => go(0));
  render();

  // Async load from CMS if available
  if (window.CMSAdapter) {
    CMSAdapter.getManualSteps({ status: 'published' }).then((cmsSteps) => {
      if (cmsSteps && Array.isArray(cmsSteps) && cmsSteps.length > 0) {
        activeSteps = cmsSteps;
        if (active >= activeSteps.length) active = 0;
        render();
      }
    }).catch((err) => {
      console.warn('Manual CMS load fallback:', err);
    });
  }
})();
