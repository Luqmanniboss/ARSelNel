/**
 * ARSELNEL — MANUAL PENGGUNAAN 2.0 (PANDUAN SAINTIS MUDA)
 * Interactive Controller for 8 Form-1 Science Missions
 *
 * Supports:
 * - 8 Mission Tabs with Icons and Numbers
 * - Progress Bar Tracking with Percentage
 * - Full Step-by-Step Numbered Instructions
 * - Real Screenshots with Lightbox Image Zoom
 * - "Cuba Sekarang!" Action Links
 * - Keyboard Navigation (ArrowLeft, ArrowRight, Home, End)
 * - LocalStorage State Persistence per Student
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATA 8 MISI UTAMA ARSELNEL SCIENCE ADVENTURE
  // =========================================================================
  const MISSIONS = [
    {
      id: 'misi-1',
      num: 1,
      badge: 'MISI 01 • ASAS SISTEM',
      icon: 'home',
      color: '#4f46e5',
      bgLight: '#eef2ff',
      shortTitle: 'Kenali ARSELNEL',
      title: 'Misi 1: Kenali ARSELNEL — Pintu Masuk Pengembaraan Sains',
      lead: 'Terokai cara log masuk, cipta profil saintis muda anda, dan kuasai navigasi Dashboard ARSELNEL.',
      routeLabel: 'halaman_utama/code.html',
      actionUrl: '../halaman_utama/code.html',
      actionText: 'Buka Dashboard',
      screenshot: '../assets/manual/misi1_dashboard.png',
      caption: 'Paparan Dashboard ARSELNEL yang mesra murid dengan bar sisi navigasi dan kad pembelajaran pantas.',
      steps: [
        {
          title: 'Daftar Akaun & Log Masuk',
          desc: 'Buka halaman log masuk. Masukkan emel dan kata laluan anda. Jika anda murid baharu, tekan pautan "Daftar Akaun" untuk mencipta profil saintis anda.'
        },
        {
          title: 'Gunakan Mod Tetamu (Guest Mode)',
          desc: 'Jika anda ingin mencuba dengan pantas tanpa mendaftar akaun dahulu, pilih "Masuk sebagai Tetamu" untuk terus meneroka modul pembelajaran asas.'
        },
        {
          title: 'Navigasi Dashboard Utama',
          desc: 'Dashboard memaparkan ucapan selamat datang, kad modul cadangan harian, ringkasan masa belajar, dan pautan pantas ke semua aktiviti sains.'
        },
        {
          title: 'Kuasai Menu Bar Sisi (Sidebar)',
          desc: 'Gunakan bar sisi di sebelah kiri (atau butang menu di telefon) untuk bertukar pantas antara: Dashboard, CellQuest, Nota, Video, Tanya AI, dan Kuiz & Permainan.'
        }
      ],
      tip: 'Pastikan anda menekan "Ingat Saya" semasa log masuk supaya anda tidak perlu menaip semula kata laluan setiap kali membuka pelayar!'
    },
    {
      id: 'misi-2',
      num: 2,
      badge: 'MISI 02 • SMART NOTES',
      icon: 'auto_stories',
      color: '#0d9488',
      bgLight: '#f0fdfa',
      shortTitle: 'Nota Interaktif',
      title: 'Misi 2: Smart Notes — Nota Slaid Interaktif Sains KSSM',
      lead: 'Baca ringkasan padat silibus Bab 2, conteng nota menggunakan pen digital, dan muat turun slaid ke fail PDF.',
      routeLabel: 'nota_pembelajaran/slaid_interaktif.html',
      actionUrl: '../nota_pembelajaran/code.html',
      actionText: 'Buka Modul Nota',
      screenshot: '../assets/manual/misi2_nota_interaktif.png',
      caption: 'Penonton slaid pintar ARSELNEL dengan sokongan pen conteng digital, pemadam, zum, dan muat turun PDF.',
      steps: [
        {
          title: 'Pilih Topik Nota Sains',
          desc: 'Tekan menu "Nota" pada bar sisi. Pilih topik seperti Struktur Sel Haiwan & Tumbuhan, Fungsi Organel, atau Jadual Perbandingan Sel.'
        },
        {
          title: 'Buka Pembaca Slaid Pintar',
          desc: 'Tekan butang "Buka Slaid" untuk memulakan mod pembacaan slaid beranimasi yang dioptimumkan untuk skrin komputer dan tablet.'
        },
        {
          title: 'Navigasi Halaman Slaid',
          desc: 'Tekan butang anak panah kiri (←) atau kanan (→), atau leret jari anda pada skrin sentuh telefon/iPad untuk bertukar helaian slaid.'
        },
        {
          title: 'Gunakan Pen Digital & Pemadam Anotasi',
          desc: 'Tekan ikon pen untuk menconteng, membulatkan istilah sains penting, atau mencatat nota terus di atas slaid! Tekan pemadam jika ingin membetulkannya.'
        },
        {
          title: 'Zum Masuk & Mod Skrin Penuh',
          desc: 'Gunakan butang zum (+) untuk melihat gambar rajah sel secara terperinci, dan butang skrin penuh (⛶) untuk ruang bacaan luas tanpa gangguan.'
        },
        {
          title: 'Muat Turun Nota ke Fail PDF',
          desc: 'Tekan butang "Muat Turun PDF" untuk menyimpan dokumen nota sains lengkap ke peranti anda bagi rujukan ulangkaji di rumah.'
        }
      ],
      tip: 'Contengan pen digital anda disimpan secara automatik pada peranti anda, membolehkan anda mengulangkaji nota peribadi bila-bila masa!'
    },
    {
      id: 'misi-3',
      num: 3,
      badge: 'MISI 03 • TEATER SAINS',
      icon: 'play_circle',
      color: '#ea580c',
      bgLight: '#fff7ed',
      shortTitle: 'Video Pembelajaran',
      title: 'Misi 3: Teater Sains — Tonton Animasi 3D & Eksperimen Makmal',
      lead: 'Fahami proses biologi mikroskopik melalui simulasi 3D dan tonton demonstrasi penyediaan slaid sel di makmal sains.',
      routeLabel: 'perpustakaan_video/code.html',
      actionUrl: '../perpustakaan_video/code.html',
      actionText: 'Tonton Video Sains',
      screenshot: '../assets/manual/misi3_video_pembelajaran.png',
      caption: 'Perpustakaan video pembelajaran ARSELNEL dengan pemain video interaktif dan ringkasan konsep KSSM.',
      steps: [
        {
          title: 'Buka Perpustakaan Video Sains',
          desc: 'Klik menu "Video" pada bar sisi untuk melihat senarai video animasi 3D dan eksperimen makmal mikroskop yang disediakan.'
        },
        {
          title: 'Pilih Video yang Ingin Dipelajari',
          desc: 'Pilih tajuk seperti "Simulasi Respirasi di Mitokondria" atau "Penyediaan Slaid Sel Pipi & Sel Bawang" untuk memulakan tayangan.'
        },
        {
          title: 'Kawal Main & Jeda Video',
          desc: 'Tekan butang Main (▶) untuk mula menonton dan butang Jeda (⏸) apabila anda ingin berhenti seketika untuk mencatat fakta sains.'
        },
        {
          title: 'Garis Masa & Pelarasan Audio',
          desc: 'Seret penunjuk garis masa untuk mengulang babak eksperimen yang sukar, dan laraskan kelantangan audio menggunakan ikon pembesar suara.'
        },
        {
          title: 'Tonton dalam Mod Skrin Penuh',
          desc: 'Tekan ikon skrin penuh di penjuru video untuk visual teater yang jelas. Di bahagian bawah video, baca ringkasan fakta penting KSSM.'
        }
      ],
      tip: 'Tonton video demonstrasi penyediaan slaid sel pipi sebelum kelas amali makmal sekolah anda bermula supaya eksperimen anda berjalan lancar!'
    },
    {
      id: 'misi-4',
      num: 4,
      badge: 'MISI 04 • TUTOR MAYA',
      icon: 'smart_toy',
      color: '#0284c7',
      bgLight: '#f0f9ff',
      shortTitle: 'SelBot AI',
      title: 'Misi 4: Tanya SelBot AI — Pembantu Sains Pintar Peribadi Anda',
      lead: 'Tanya apa sahaja kemusykilan biologi sel Tingkatan 1 kepada SelBot AI yang dikuasakan oleh kecerdasan buatan Google Gemini.',
      routeLabel: 'selbot_ai/code.html',
      actionUrl: '../selbot_ai/code.html',
      actionText: 'Buka Tanya AI',
      screenshot: '../assets/manual/misi4_selbot_ai.png',
      caption: 'Antaramuka sembang pintar SelBot AI dengan cadangan soalan pantas dan sejarah perbualan awan.',
      steps: [
        {
          title: 'Buka Modul Tanya AI',
          desc: 'Klik menu "Tanya AI" pada bar sisi untuk memasuki bilik sembang pintar bersama SelBot.'
        },
        {
          title: 'Taipkan Soalan Sains Anda',
          desc: 'Taipkan soalan anda pada kotak input (contohnya: "Apakah fungsi nukleus dalam sel?") dan tekan butang Hantar (➤) atau kekunci Enter.'
        },
        {
          title: 'Gunakan Cip Tindakan Pantas',
          desc: 'Malas menaip? Klik sahaja cip soalan pantas seperti 🧬 Fungsi Nukleus, 🌿 Haiwan vs Tumbuhan, atau ⚡ Fungsi Mitokondria untuk jawapan segera!'
        },
        {
          title: 'Mulakan Perbualan Baharu',
          desc: 'Tekan butang "+ Baharu" di bar atas bilik sembang apabila anda ingin memulakan topik perbincangan sains yang berbeza.'
        },
        {
          title: 'Buka Sejarah Sembang Terdahulu',
          desc: 'Tekan butang "Sejarah" untuk menyemak semula sesi soal jawab anda yang terdahulu. Semua perbualan disimpan dengan selamat di awan Supabase.'
        },
        {
          title: 'Gunakan AI Secara Berhemah',
          desc: 'Tanya soalan yang berkaitan dengan silibus sains sekolah dan sentiasa buat semakan silang jawapan bersama buku teks KSSM anda.'
        }
      ],
      tip: 'SelBot AI ialah modul bilik sembang utama — ia TIDAK memerlukan kad marker fizikal dan boleh diakses secara langsung bila-bila masa!'
    },
    {
      id: 'misi-5',
      num: 5,
      badge: 'MISI 05 • ARKED GAMIFIKASI',
      icon: 'sports_esports',
      color: '#7c3aed',
      bgLight: '#f5f3ff',
      shortTitle: 'Kuiz & Permainan',
      title: 'Misi 5: Arked Gamifikasi — 5 Cabaran Permainan Sains',
      lead: 'Uji kefahaman sains sel anda melalui 5 permainan arked interaktif, kumpul markah tinggi dan takluki papan pendahulu!',
      routeLabel: 'hab_permainan/code.html',
      actionUrl: '../hab_permainan/code.html',
      actionText: 'Masuk Hab Permainan',
      screenshot: '../assets/manual/misi5_permainan_sains.png',
      caption: 'Hab Permainan Sains ARSELNEL dengan 5 pilihan arked interaktif dan paparan skor pencapaian.',
      steps: [
        {
          title: 'Buka Hab Permainan Sains',
          desc: 'Klik menu "Kuiz & Permainan" pada bar sisi untuk melihat 5 cabaran permainan yang tersedia untuk dimainkan.'
        },
        {
          title: 'Game 1: Labelkan Organel Sel',
          desc: 'Tarik dan lepaskan label nama organel sel pada gambar rajah sel haiwan dan sel tumbuhan dengan tepat sebelum masa tamat.'
        },
        {
          title: 'Game 2: Maze Chase (Misi Sel)',
          desc: 'Permainan arked 2D! Gunakan Joystick Maya pada skrin sentuh telefon/iPad (atau kekunci WASD). Baca soalan sains, tuju ke zon jawapan betul, dan elak virus!'
        },
        {
          title: 'Game 3: Susun Organisasi Kehidupan',
          desc: 'Susun hierarki organisasi hidupan mengikut urutan sains yang betul: Sel → Tisu → Organ → Sistem → Organisma.'
        },
        {
          title: 'Game 4: Kuiz Saintis Muda',
          desc: 'Jawab soalan aneka pilihan secara pantas dan tepat untuk menguji kefahaman konsep asas Bab 2 dan mengumpul bintang ganjaran.'
        },
        {
          title: 'Game 5: Misi Makmal Sains',
          desc: 'Pengembaraan makmal 2D! Gunakan Joystick Maya untuk bergerak membersihkan makmal, kutip 10 radas sains (mikroskop, bikar, dll.), dan selesaikan soalan eksperimen.'
        },
        {
          title: 'Semak Skor di Papan Pendahulu',
          desc: 'Setiap mata yang anda peroleh disimpan ke akaun profil anda. Klik "Papan Pendahulu" untuk melihat kedudukan anda berbanding rakan sekelas!'
        }
      ],
      tip: 'Gunakan joystick maya dengan ibu jari kiri pada skrin telefon anda, dan perhatikan baki nyawa (hati) semasa bermain Maze Chase!'
    },
    {
      id: 'misi-6',
      num: 6,
      badge: 'MISI 06 • MODEL SPASIAL',
      icon: 'view_in_ar',
      color: '#059669',
      bgLight: '#ecfdf5',
      shortTitle: 'CellQuest 3D & AR',
      title: 'Misi 6: CellQuest 3D & AR — Bedah Model Sel Tiga Dimensi',
      lead: 'Putar model 3D sel haiwan dan tumbuhan, belah lapisan organel, dan bawa sel biologi ke meja anda menggunakan AR!',
      routeLabel: 'cellquest/code.html',
      actionUrl: '../cellquest/code.html',
      actionText: 'Terokai CellQuest 3D',
      screenshot: '../assets/manual/misi6_cellquest_3d.png',
      caption: 'Penerokaan model 3D interaktif CellQuest dengan kad penerangan organel dan kawalan putaran 360 darjah.',
      steps: [
        {
          title: 'Buka Modul CellQuest',
          desc: 'Klik menu "CellQuest" pada bar sisi untuk memuatkan paparan model 3D interaktif berdefinisi tinggi.'
        },
        {
          title: 'Pilih Sel Haiwan atau Sel Tumbuhan',
          desc: 'Tekan tab "🐾 Sel Haiwan" atau "🌿 Sel Tumbuhan" di bahagian atas untuk menukar model sel yang ingin anda bedah.'
        },
        {
          title: 'Kawalan Putaran 360° & Zum',
          desc: 'Seret satu jari atau klik tetikus untuk memutar sel dari mana-mana sudut. Cubit skrin atau gunakan roda tetikus untuk zum masuk dan keluar.'
        },
        {
          title: 'Sentuh Organel untuk Membaca Maklumat',
          desc: 'Klik mana-mana organel (contohnya Nukleus atau Kloroplas) pada model 3D atau senarai sisi untuk membaca nama, fungsi biologi, dan fakta sains KSSM.'
        },
        {
          title: 'Gunakan Togol Keratan Rentas & Label',
          desc: 'Tekan "◐ Keratan" untuk membelah sel dan melihat susunan organel dalaman. Tekan "🏷️ Label" untuk menghidupkan tag nama di atas model 3D.'
        },
        {
          title: 'Butang Tetapkan Semula (Reset)',
          desc: 'Jika kedudukan kamera tersasar, tekan butang "⟳ Reset" untuk mengembalikan kedudukan kamera sel kepada paparan asal.'
        },
        {
          title: 'Aktifkan Pengembaraan AR Permukaan (WebXR)',
          desc: 'Tekan butang "Mulakan Pengembaraan AR". Halakan kamera ke permukaan meja rata untuk meletakkan model sel terapung di dunia nyata!'
        }
      ],
      tip: 'Ciri WebXR AR permukaan memerlukan peranti yang menyokong teknologi AR. Jika peranti anda tiada sokongan ini, mod 3D interaktif tetap berfungsi 100% penuh!'
    },
    {
      id: 'misi-7',
      num: 7,
      badge: 'MISI 07 • WEBAR INTERAKTIF',
      icon: 'qr_code_scanner',
      color: '#9333ea',
      bgLight: '#faf5ff',
      shortTitle: 'Kotak ARSELNEL',
      title: 'Misi 7: Kotak ARSELNEL — Cetak & Imbas 6 Kad Realiti Terimbuh',
      lead: 'Halakan kamera peranti anda ke kad marker fizikal untuk menghidupkan video, nota, model 3D hologram dan radar jelajah!',
      routeLabel: 'kotak_arselnel/code.html',
      actionUrl: '../kotak_arselnel/code.html',
      actionText: 'Buka Pengimbas AR',
      screenshot: '../assets/manual/misi7_cetak_kad_ar.png',
      caption: 'Modal galeri Cetak Kad AR memaparkan 6 marker rasmi MindAR sedia dicetak pada kertas A4.',
      steps: [
        {
          title: 'Buka Modal "Cetak Kad AR"',
          desc: 'Di halaman CellQuest, tekan butang "Cetak Kad AR" untuk membuka galeri 6 kad marker rasmi MindAR.'
        },
        {
          title: 'Cetak Kad atau Paparkan di Skrin Komputer',
          desc: 'Tekan "Cetak Kad Dipilih (A4)" untuk mencetak kad pada kertas. Anda juga boleh memaparkan marker di skrin laptop lain melalui pautan Cetak Marker!'
        },
        {
          title: 'Kenali 6 Marker Aktif Rasmi:',
          desc: '• Muka 1 (Index 0): Video Pembelajaran<br>• Muka 2 (Index 1): Nota Interaktif Slaid KSSM<br>• Muka 4 (Index 3): Model 3D Sel Haiwan Hologram<br>• Muka 5 (Index 4): Model 3D Sel Tumbuhan Hologram<br>• Muka 6 (Index 5): Makmal Eksplorasi 3D Maya<br>• Muka 7 (Index 6): AR Orientasi Dunia — Misi Jelajah Radar'
        },
        {
          title: 'Buka Pengimbas Kotak ARSELNEL',
          desc: 'Tekan butang "Imbas Kotak ARSELNEL" (atau "Buka Pengimbas AR"). Benarkan kebenaran kamera (*Allow Camera*) pada pelayar anda.'
        },
        {
          title: 'Ikuti Panduan Pengguna 6 Langkah',
          desc: 'Pengguna baharu disambut dengan panduan interaktif 6 langkah yang menerangkan jarak imbasan yang sesuai (20–30 cm) dan pencahayaan bilik.'
        },
        {
          title: 'Gunakan Ciri "Semat Skrin"',
          desc: 'Tekan butang "Semat Skrin" pada panel untuk menetapkan paparan nota atau video di hadapan anda walaupun kad AR dialihkan dari kamera!'
        },
        {
          title: 'Gunakan Ciri "Kunci Pandangan" (POV 360°)',
          desc: 'Tekan "Kunci Pandangan" untuk mengunci panel di koordinat 360° bilik anda berasaskan sensor giroskop peranti. Pusingkan badan anda untuk mencarinya di udara!'
        },
        {
          title: 'Tutup Kamera untuk Menjimatkan Bateri',
          desc: 'Tekan butang "Tutup Kamera" semasa membaca nota panjang untuk mematikan suapan video kamera tanpa menutup kandungan yang sedang dipelajari.'
        },
        {
          title: 'Tutup Pengimbas Bila-bila Masa',
          desc: 'Tekan ikon pangkah (✕) atau butang "Tutup" untuk keluar dari pengimbas AR dan kembali ke halaman CellQuest/Dashboard.'
        }
      ],
      tip: 'Pastikan anda mengimbas marker di tempat yang terang tanpa silau cahaya langsung pada permukaan kertas untuk pengesanan segera!'
    },
    {
      id: 'misi-8',
      num: 8,
      badge: 'MISI 08 • PERIBADI & TETAPAN',
      icon: 'settings',
      color: '#475569',
      bgLight: '#f8fafc',
      shortTitle: 'Profil & Tetapan',
      title: 'Misi 8: Profil, Tetapan & Bantuan — Peribadikan Cara Anda Belajar',
      lead: 'Sesuaikan avatar kegemaran anda, nama panggilan, tema gelap/cerah, dan saiz tulisan agar selesa untuk pembelajaran harian.',
      routeLabel: 'profil/code.html',
      actionUrl: '../profil/code.html',
      actionText: 'Buka Profil Saya',
      screenshot: '../assets/manual/misi8_profil_tetapan.png',
      caption: 'Halaman Profil dan Tetapan membolehkan murid memilih avatar, mod paparan gelap/cerah, dan saiz teks.',
      steps: [
        {
          title: 'Buka Halaman Profil Saya',
          desc: 'Klik profil anda di sudut bawah bar sisi (atau avatar di bar atas) untuk melihat status maklumat saintis anda.'
        },
        {
          title: 'Tukar Nama Panggilan & Avatar',
          desc: 'Masukkan nama panggilan pilihan anda dan pilih avatar saintis muda kegemaran anda. Tekan butang "Simpan Profil" untuk mengemaskini maklumat.'
        },
        {
          title: 'Semak Lencana Pencapaian',
          desc: 'Di bahagian bawah profil, semak lencana ganjaran yang berjaya anda kumpulkan setelah melengkapkan modul dan permainan sains.'
        },
        {
          title: 'Buka Halaman Tetapan',
          desc: 'Klik menu "Tetapan" di bar sisi untuk melaraskan keselesaan antara muka aplikasi ARSELNEL mengikut keperluan peranti anda.'
        },
        {
          title: 'Pilih Mod Paparan Cerah atau Gelap',
          desc: 'Pilih mod Cerah untuk waktu siang, atau pilih mod Gelap (*Dark Mode*) bagi mengurangkan keletihan mata apabila belajar pada waktu malam.'
        },
        {
          title: 'Laraskan Saiz Tulisan Teks',
          desc: 'Seret pelaras saiz tulisan daripada 90% sehingga 125% untuk membesarkan teks agar lebih mudah dibaca pada skrin anda.'
        },
        {
          title: 'Togol Animasi & Kontras Tinggi',
          desc: 'Aktifkan "Kurangkan Animasi" jika telefon anda terasa perlahan, dan aktifkan "Kontras Lebih Jelas" untuk sempadan teks yang lebih tebal.'
        },
        {
          title: 'Cara Log Keluar Selamat',
          desc: 'Tekan butang "Log Keluar" di bar sisi apabila anda selesai menggunakan komputer makmal sekolah atau peranti berkongsi.'
        }
      ],
      tip: 'Pilihan tema gelap, kontras, dan saiz tulisan anda disimpan secara automatik pada peranti tersebut tanpa perlu ditetapkan semula setiap kali log masuk!'
    }
  ];

  // =========================================================================
  // 2. DOM REFERENCES
  // =========================================================================
  let activeIndex = 0;
  const storageKey = 'arselnel_manual_v2_active_mission';

  // Restore saved position
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!isNaN(idx) && idx >= 0 && idx < MISSIONS.length) {
        activeIndex = idx;
      }
    }
  } catch (_) {}

  // Elements
  const tabsContainer = document.getElementById('manual-missions-tabs');
  const panelContainer = document.getElementById('manual-mission-display');
  const progressBadge = document.getElementById('manual-progress-badge');
  const progressFill = document.getElementById('manual-progress-fill');
  const btnPrev = document.getElementById('manual-btn-prev');
  const btnNext = document.getElementById('manual-btn-next');
  const stepCounterText = document.getElementById('manual-step-counter-text');
  const btnReset = document.getElementById('manual-btn-reset');

  // Lightbox elements
  const lightboxBackdrop = document.getElementById('manual-lightbox');
  const lightboxImg = document.getElementById('manual-lightbox-img');
  const lightboxTitle = document.getElementById('manual-lightbox-title');
  const lightboxCloseBtn = document.getElementById('manual-lightbox-close');

  // =========================================================================
  // 3. RENDER FUNCTIONS
  // =========================================================================
  function renderMissionTabs() {
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    MISSIONS.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `manual-mission-tab-btn ${idx === activeIndex ? 'is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
      btn.setAttribute('aria-label', `Misi ${m.num}: ${m.shortTitle}`);
      btn.id = `tab-mission-${m.num}`;

      btn.innerHTML = `
        <div class="manual-tab-icon-wrap" style="${idx === activeIndex ? `background:${m.color};color:#ffffff;` : ''}">
          <span class="material-symbols-outlined">${m.icon}</span>
        </div>
        <span class="manual-tab-number">Misi ${m.num}</span>
        <span class="manual-tab-title">${m.shortTitle}</span>
      `;

      btn.addEventListener('click', () => {
        setMission(idx);
      });

      tabsContainer.appendChild(btn);
    });
  }

  function renderMissionPanel() {
    if (!panelContainer) return;
    const m = MISSIONS[activeIndex];

    // Update Progress Indicators
    if (progressBadge) {
      progressBadge.textContent = `Misi ${m.num} daripada ${MISSIONS.length}`;
    }
    if (progressFill) {
      const pct = ((activeIndex + 1) / MISSIONS.length) * 100;
      progressFill.style.width = `${pct}%`;
      progressFill.setAttribute('aria-valuenow', String(activeIndex + 1));
    }
    if (stepCounterText) {
      stepCounterText.textContent = `Misi ${m.num} / ${MISSIONS.length} (${m.shortTitle})`;
    }

    // Render Steps HTML
    const stepsHtml = m.steps.map((st, i) => `
      <div class="manual-step-item">
        <div class="manual-step-num" style="background:${m.bgLight};color:${m.color};">${i + 1}</div>
        <div class="manual-step-text-wrap">
          <h4 class="manual-step-title">${st.title}</h4>
          <p class="manual-step-desc">${st.desc}</p>
        </div>
      </div>
    `).join('');

    // Render Full Panel HTML
    panelContainer.innerHTML = `
      <article class="manual-mission-panel" id="panel-mission-${m.num}" role="tabpanel" aria-labelledby="tab-mission-${m.num}">
        <!-- Header -->
        <header class="manual-panel-header">
          <div class="manual-panel-header-left">
            <div class="manual-panel-icon-circle" style="background:${m.bgLight};color:${m.color};">
              <span class="material-symbols-outlined">${m.icon}</span>
            </div>
            <div>
              <div class="manual-panel-badge-group">
                <span class="manual-panel-badge" style="background:${m.bgLight};color:${m.color};border:1px solid ${m.color}33;">
                  ${m.badge}
                </span>
                <span class="manual-panel-route-tag">
                  <span class="material-symbols-outlined" style="font-size:14px;">link</span>
                  <span>${m.routeLabel}</span>
                </span>
              </div>
              <h3 class="manual-panel-title">${m.title}</h3>
            </div>
          </div>
          <div class="manual-panel-quick-action">
            <a href="${m.actionUrl}" class="manual-btn-cuba-sekarang" title="Buka ${m.shortTitle} sekarang">
              <span>🚀 ${m.actionText}</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </header>

        <!-- Body: 2 Columns (Left: Instructions, Right: Real Screenshot) -->
        <div class="manual-panel-body">
          <!-- Left Column: Lead, Steps & Callout Tip -->
          <div class="manual-panel-left">
            <div class="manual-lead-box" style="border-left-color:${m.color};">
              <p class="manual-lead-text">${m.lead}</p>
            </div>

            <div class="manual-steps-section">
              ${stepsHtml}
            </div>

            <!-- Tip Callout Box -->
            <div class="manual-tip-box">
              <span class="material-symbols-outlined manual-tip-icon">lightbulb</span>
              <div class="manual-tip-content">
                <h4>Tip Saintis Pintar</h4>
                <p>${m.tip}</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Real Screenshot Card -->
          <div class="manual-panel-right">
            <div class="manual-screenshot-card" id="screenshot-trigger-${m.num}" title="Klik untuk besarkan gambar screenshot" tabindex="0" role="button" aria-label="Besarkan screenshot ${m.shortTitle}">
              <img src="${m.screenshot}" alt="${m.title} Screenshot Sebenar" class="manual-screenshot-img" loading="lazy" />
              <div class="manual-screenshot-overlay">
                <span class="manual-screenshot-zoom-badge">
                  <span class="material-symbols-outlined" style="font-size:16px;">zoom_in</span>
                  <span>Klik untuk Besarkan</span>
                </span>
              </div>
            </div>
            <p class="manual-screenshot-caption">📸 ${m.caption}</p>
          </div>
        </div>

        <!-- Footer Navigation Inside Panel -->
        <footer class="manual-footer-nav">
          <button type="button" class="manual-nav-btn manual-btn-prev" id="inner-btn-prev" ${activeIndex === 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Misi Sebelum</span>
          </button>

          <a href="../halaman_utama/code.html" class="manual-nav-btn manual-btn-dashboard" title="Kembali ke Dashboard Utama">
            <span class="material-symbols-outlined">home</span>
            <span>Kembali ke Dashboard</span>
          </a>

          <button type="button" class="manual-nav-btn manual-btn-next" id="inner-btn-next">
            <span>${activeIndex === MISSIONS.length - 1 ? '🎉 Selesai Baca Panduan' : 'Misi Seterusnya'}</span>
            <span class="material-symbols-outlined">${activeIndex === MISSIONS.length - 1 ? 'task_alt' : 'arrow_forward'}</span>
          </button>
        </footer>
      </article>
    `;

    // Hook inner nav buttons
    const innerPrev = document.getElementById('inner-btn-prev');
    const innerNext = document.getElementById('inner-btn-next');
    if (innerPrev) {
      innerPrev.addEventListener('click', () => setMission(activeIndex - 1));
    }
    if (innerNext) {
      innerNext.addEventListener('click', () => {
        if (activeIndex === MISSIONS.length - 1) {
          window.location.href = '../halaman_utama/code.html';
        } else {
          setMission(activeIndex + 1);
        }
      });
    }

    // Hook screenshot lightbox trigger
    const trigger = document.getElementById(`screenshot-trigger-${m.num}`);
    if (trigger) {
      trigger.addEventListener('click', () => openLightbox(m.screenshot, m.title));
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(m.screenshot, m.title);
        }
      });
    }

    // Update Bottom Outer Controls
    if (btnPrev) btnPrev.disabled = activeIndex === 0;
    if (btnNext) {
      btnNext.querySelector('span:first-child').textContent = activeIndex === MISSIONS.length - 1 ? 'Selesai Panduan' : 'Misi Seterusnya';
    }

    // Persist position
    try {
      localStorage.setItem(storageKey, String(activeIndex));
    } catch (_) {}
  }

  function setMission(index) {
    if (index < 0 || index >= MISSIONS.length) return;
    activeIndex = index;
    renderMissionTabs();
    renderMissionPanel();

    // Smooth scroll to panel top if scrolled down
    const panel = document.getElementById('manual-mission-display');
    if (panel) {
      const topOffset = panel.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > topOffset) {
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    }
  }

  // =========================================================================
  // 4. LIGHTBOX MODAL HANDLERS
  // =========================================================================
  function openLightbox(imgSrc, title) {
    if (!lightboxBackdrop || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    if (lightboxTitle) lightboxTitle.textContent = title;
    lightboxBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxBackdrop) return;
    lightboxBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', (e) => {
      if (e.target === lightboxBackdrop) closeLightbox();
    });
  }

  // =========================================================================
  // 5. KEYBOARD ACCESSIBILITY
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    // ESC closes lightbox
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }

    // Ignore keyboard nav if typing in an input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    // Left Arrow: Previous Mission
    if (e.key === 'ArrowLeft' && activeIndex > 0) {
      setMission(activeIndex - 1);
    }
    // Right Arrow: Next Mission
    else if (e.key === 'ArrowRight' && activeIndex < MISSIONS.length - 1) {
      setMission(activeIndex + 1);
    }
    // Home: First Mission
    else if (e.key === 'Home') {
      setMission(0);
    }
    // End: Last Mission
    else if (e.key === 'End') {
      setMission(MISSIONS.length - 1);
    }
  });

  // =========================================================================
  // 6. BOTTOM OUTER CONTROLS
  // =========================================================================
  if (btnPrev) {
    btnPrev.addEventListener('click', () => setMission(activeIndex - 1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (activeIndex === MISSIONS.length - 1) {
        window.location.href = '../halaman_utama/code.html';
      } else {
        setMission(activeIndex + 1);
      }
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => setMission(0));
  }

  // =========================================================================
  // 7. INITIAL BOOTSTRAP
  // =========================================================================
  function init() {
    renderMissionTabs();
    renderMissionPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for QA test automation
  window.__ARSELNEL_MANUAL__ = {
    MISSIONS,
    getActiveIndex: () => activeIndex,
    setMission,
    openLightbox,
    closeLightbox
  };
})();
