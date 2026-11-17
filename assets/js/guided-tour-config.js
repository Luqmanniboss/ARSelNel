/**
 * ARSelNel Guided Tour Configurations (guided-tour-config.js)
 * Step-by-step contextual tours tailored for Form 1 Science students (13 y/o).
 * Clean Bahasa Melayu instructions, real DOM selectors, and responsive placements.
 */

(function (global) {
  'use strict';

  const TOUR_CONFIGS = {
    // ------------------------------------------------------------------------
    // A. DASHBOARD (halaman_utama/code.html)
    // ------------------------------------------------------------------------
    dashboard: {
      id: 'dashboard',
      version: 1,
      title: 'Panduan Dashboard Utama',
      theme: 'dashboard',
      steps: [
        {
          target: '.hero h1#hero-title, .hero',
          title: 'Selamat Datang ke ARSELNEL!',
          desc: 'Hai Saintis Muda! Ini adalah pusat pengembaraan Sains Tingkatan 1 anda. Terokai dunia sel, eksperimen, video dan aktiviti 3D di sini.',
          tip: 'Anda boleh memulakan penerokaan dengan menekan butang Mula Teroka Sel.',
          placement: 'bottom'
        },
        {
          target: '#ars-sidebar, .site-header nav',
          title: 'Bar Navigasi Utama',
          desc: 'Gunakan bar navigasi ini untuk melompat pantas ke CellQuest, Nota, Video, Tanya AI, atau Kuiz & Permainan pada bila-bila masa.',
          tip: 'Di telefon pintar, anda boleh menekan ikon menu untuk membuka senarai ini.',
          placement: 'right'
        },
        {
          target: '.hero a[href*="cellquest"], .module-card:nth-of-type(1)',
          title: 'CellQuest 3D & AR',
          desc: 'Terokai model hologram sel haiwan dan sel tumbuhan secara interaktif dalam mod 3D dan Realiti Terimbuh (AR).',
          tip: 'Anda boleh memutar, mengezum dan memilih setiap organel sel.',
          placement: 'top'
        },
        {
          target: 'a[data-nav-id="notes"], .module-grid .module-card:nth-of-type(2)',
          title: 'Nota Pintar Interaktif',
          desc: 'Ulang kaji topik Sains Bab 1, 2 dan 3 dengan slaid nota visual yang padat, jelas dan mudah difahami.',
          tip: 'Dilengkapi pen digital dan penyerlah untuk mencatat nota terus pada skrin.',
          placement: 'top'
        },
        {
          target: 'a[data-nav-id="videos"], .module-grid .module-card:nth-of-type(3)',
          title: 'Video Pembelajaran Sains',
          desc: 'Tonton animasi sains menarik tentang fungsi mitokondria, nukleus, kloroplas dan proses fotosintesis.',
          tip: 'Sesuai untuk mengulang kaji konsep yang sukar divisualkan.',
          placement: 'top'
        },
        {
          target: 'a[data-nav-id="ai"], .module-card[onclick*="selbot_ai"]',
          title: 'Tanya AI — SelBot',
          desc: 'Ada soalan sains yang tidak faham? Tanya SelBot, tutor pintar AI yang sedia menjawab soalan anda 24 jam sehari.',
          tip: 'Gunakan cadangan pantas atau taip sendiri soalan anda.',
          placement: 'top'
        },
        {
          target: 'a[data-nav-id="games"], .hero a[href*="hab_permainan"]',
          title: 'Kuiz & Permainan Sains',
          desc: 'Uji kehebatan anda melalui permainan interaktif seperti Misi Makmal Sains, Maze Chase dan Kuiz Saintis Muda!',
          tip: 'Kumpul mata ganjaran dan cipta rekod baharu di Papan Skor!',
          placement: 'top'
        },
        {
          target: '.manual-dashboard-card',
          title: 'Manual Penggunaan Interaktif',
          desc: 'Perlukan panduan terperinci? Buka Manual Penggunaan untuk melihat 8 misi lengkap berserta tangkap layar panduan.',
          tip: 'Manual ini boleh diakses bila-bila masa dari dashboard.',
          placement: 'top'
        },
        {
          target: '#profile-dropdown-btn, a[data-nav-id="profile"]',
          title: 'Profil & Tetapan Anda',
          desc: 'Pantau kemajuan pembelajaran anda, lihat lencana pencapaian, dan sesuaikan tema atau saiz tulisan mengikut keselesaan anda.',
          tip: 'Klik gambar profil untuk menyunting nama dan avatar anda.',
          placement: 'left'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // B. NOTA INTERAKTIF (nota_pembelajaran/code.html)
    // ------------------------------------------------------------------------
    notes: {
      id: 'notes',
      version: 1,
      title: 'Panduan Nota Interaktif',
      theme: 'notes',
      steps: [
        {
          target: '#search-input',
          title: 'Cari Nota Pantas',
          desc: 'Taip nama organel, bab atau kata kunci seperti "mitokondria" atau "kloroplas" untuk mencari slaid nota dengan pantas.',
          tip: 'Hasil carian akan dipaparkan secara langsung semasa anda menaip.',
          placement: 'bottom'
        },
        {
          target: '.slide-filter-pill[data-chapter="all"], .slide-filter-pill',
          title: 'Penapis Mengikut Bab',
          desc: 'Pilih bab sains tertentu (Bab 1, Bab 2, atau Bab 3) untuk melihat nota yang tersusun mengikut sukatan pelajaran KSSM.',
          tip: 'Tekan "Semua Bab" untuk memaparkan semula keseluruhan koleksi slaid.',
          placement: 'bottom'
        },
        {
          target: '#interactive-slides-grid',
          title: 'Katalog Slaid Pembelajaran',
          desc: 'Setiap kad memaparkan tajuk nota, tahap kesukaran dan bilangan slaid. Tekan butang pada kad untuk membuka pembaca slaid interaktif.',
          tip: 'Anda boleh membaca nota dan mencatat anotasi digital serentak.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // B2. PEMBACA SLAID INTERAKTIF (nota_pembelajaran/slaid_interaktif.html)
    // ------------------------------------------------------------------------
    slides: {
      id: 'slides',
      version: 1,
      title: 'Panduan Pembaca Slaid & Anotasi',
      theme: 'notes',
      steps: [
        {
          target: '#viewer-note-title',
          title: 'Tajuk Slaid & Status Simpanan',
          desc: 'Di sini dipaparkan tajuk nota semasa. Setiap anotasi atau coretan anda akan disimpan secara automatik ke dalam pelayan.',
          tip: 'Lencana "Disimpan" berwarna hijau menandakan nota anda selamat.',
          placement: 'bottom'
        },
        {
          target: '#tool-pen',
          title: 'Pen Digital',
          desc: 'Pilih pen ini untuk menulis, melukis rajah sel atau mencatat penerangan penting terus pada slaid nota.',
          tip: 'Ketik sekali lagi atau gunakan pemilih warna untuk menukar warna pen.',
          placement: 'bottom'
        },
        {
          target: '#tool-highlighter',
          title: 'Penyerlah (Highlighter)',
          desc: 'Gunakan penyerlah semi-telus ini untuk menonjolkan fakta sains dan definisi penting tanpa menutup teks asal.',
          tip: 'Terdapat pelbagai warna penyerlah yang cerah dan kemas.',
          placement: 'bottom'
        },
        {
          target: '#tool-eraser',
          title: 'Pemadam Anotasi',
          desc: 'Padam garisan pen atau penyerlah yang tersilap dengan mudah menggunakan alat pemadam ini.',
          tip: 'Anda juga boleh menekan butang Undo (Ctrl+Z) untuk membatalkan coretan terakhir.',
          placement: 'bottom'
        },
        {
          target: '#btn-color-picker',
          title: 'Warna & Ketebalan Garisan',
          desc: 'Sesuaikan warna dakwat pen dan ubah ketebalan garisan mengikut keselesaan mencatat anda.',
          tip: 'Gunakan garisan nipis untuk tulisan teks dan garisan tebal untuk melabel.',
          placement: 'bottom'
        },
        {
          target: '#top-zoom-label',
          title: 'Kawalan Zum Skrin',
          desc: 'Zum masuk untuk melihat butiran rajah sel dengan lebih jelas, atau zum keluar untuk melihat keseluruhan halaman slaid.',
          tip: 'Ketik peratusan zum untuk menetapkan semula saiz paparan (100% Fit).',
          placement: 'bottom'
        },
        {
          target: '#btn-export',
          title: 'Eksport ke PDF',
          desc: 'Muat turun slaid lengkap berserta anotasi peribadi anda dalam format fail PDF untuk diulang kaji di luar talian.',
          tip: 'Sangat berguna untuk dicetak atau dikongsi bersama rakan sekelas.',
          placement: 'bottom'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // C. PERPUSTAKAAN VIDEO (perpustakaan_video/code.html)
    // ------------------------------------------------------------------------
    videos: {
      id: 'videos',
      version: 1,
      title: 'Panduan Perpustakaan Video',
      theme: 'videos',
      steps: [
        {
          target: '#search-input',
          title: 'Cari Video Sains',
          desc: 'Cari animasi sel atau video eksperimen makmal dengan menaip tajuk atau konsep sains yang ingin ditonton.',
          tip: 'Contoh carian: "organel", "sel pipi", atau "mikroskop".',
          placement: 'bottom'
        },
        {
          target: 'button[data-category="all"], button[data-category]',
          title: 'Penapis Kategori Video',
          desc: 'Tapis video mengikut topik: Struktur Sel, Fungsi Organel, atau Organisasi Sel untuk memudahkan fokus pembelajaran.',
          tip: 'Ketik butang kategori untuk menyaring senarai video serta-merta.',
          placement: 'bottom'
        },
        {
          target: '#video-grid-container',
          title: 'Senarai Video Pembelajaran',
          desc: 'Ketik mana-mana kad video untuk membuka pemain video berdefinisi tinggi lengkap dengan penerangan sains.',
          tip: 'Setiap video disertakan durasi dan ringkasan pembelajaran.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // C2. PEMAIN VIDEO (pemain_video/code.html)
    // ------------------------------------------------------------------------
    player: {
      id: 'player',
      version: 1,
      title: 'Panduan Pemain Video Sains',
      theme: 'videos',
      steps: [
        {
          target: '#btn-back-to-library',
          title: 'Kembali ke Senarai Video',
          desc: 'Ketik butang ini pada bila-bila masa untuk kembali ke perpustakaan video sains utama.',
          tip: 'Pilihan video anda tidak akan hilang semasa anda kembali.',
          placement: 'bottom'
        },
        {
          target: '#player-container',
          title: 'Pemain Video Interaktif',
          desc: 'Tonton video animasi sains dalam resolusi tinggi. Gunakan kawalan main/jeda (Play/Pause), peluncur garis masa, kawalan audio dan mod skrin penuh pada pemain.',
          tip: 'Ketik dua kali atau gunakan bar kawalan di bahagian bawah pemain untuk mengawal video.',
          placement: 'inner-top-right'
        },
        {
          target: '#video-title, #video-category',
          title: 'Tajuk & Kategori Video',
          desc: 'Ketahui topik khusus dan sukatan bab yang diterangkan dalam video ini.',
          tip: 'Diselaraskan dengan standard kurikulum KSSM Tingkatan 1.',
          placement: 'top'
        },
        {
          target: '#video-description',
          title: 'Penerangan Konsep',
          desc: 'Baca nota ringkas dan poin penting yang berkaitan dengan video untuk mengukuhkan kefahaman anda.',
          tip: 'Catat kata kunci penting dalam buku nota sains anda.',
          placement: 'top'
        },
        {
          target: '#related-videos-container',
          title: 'Cadangan Video Seterusnya',
          desc: 'Teruskan pembelajaran dengan memilih video berkaitan yang dicadangkan di bahagian bawah.',
          tip: 'Ketik mana-mana video cadangan untuk terus memainkannya.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // D. CELLQUEST (cellquest/code.html)
    // ------------------------------------------------------------------------
    cellquest: {
      id: 'cellquest',
      version: 1,
      title: 'Panduan CellQuest 3D & AR',
      theme: 'cellquest',
      steps: [
        {
          target: '.cq-adventure-banner',
          title: 'Kenali Misi Jelajah Dunia Sel',
          desc: 'Selamat datang ke Misi Jelajah Dunia Sel! Di sini, anda boleh meneroka dunia sel secara interaktif dan menyelesaikan cabaran sains.',
          tip: 'Penuh dengan aktiviti makmal 3D, sensor orientasi dan cabaran organel.',
          placement: 'bottom'
        },
        {
          target: '#btn-cq-start-adventure, a[href="adventure.html"]',
          title: 'Mula Pengembaraan',
          desc: 'Tekan butang Mula Pengembaraan untuk memilih cara anda mahu meneroka dunia sel.',
          tip: 'Pilih mod yang paling serasi dengan peranti anda.',
          placement: 'bottom'
        },
        {
          target: '.cq-adventure-banner',
          title: 'Pilih Mod Pengembaraan',
          desc: 'Anda boleh memilih mod pengembaraan yang sesuai dengan peranti anda. Ada mod tanpa kamera, mod AR orientasi dunia dan mod kad penanda.',
          tip: 'Pengembaraan ini menghubungkan anda ke makmal eksplorasi AR yang menakjubkan.',
          placement: 'bottom'
        },
        {
          target: '#animal-tab, #plant-tab',
          title: 'Pilih Jenis Sel',
          desc: 'Beralih antara model 3D Sel Haiwan dan Sel Tumbuhan dengan satu ketikan.',
          tip: 'Perhatikan perbezaan bentuk dan kehadiran dinding sel tegar pada sel tumbuhan.',
          placement: 'bottom'
        },
        {
          target: '#cell-stage',
          title: 'Pentas Model 3D Interaktif',
          desc: 'Seret untuk memutar model 360°, gunakan roda tetikus atau cubit untuk zum, dan seret dua jari untuk menginjak kedudukan sel.',
          tip: 'Ketik mana-mana bahagian atau organel untuk melihat penerangan terperinci.',
          placement: 'top'
        },
        {
          target: '#reset-view',
          title: 'Tetapkan Semula Kedudukan',
          desc: 'Jika kedudukan model sel teranjak terlalu jauh, ketik butang ini untuk mengembalikannya ke posisi asal.',
          tip: 'Sangat berguna selepas anda mengezum masuk ke organel halus.',
          placement: 'top'
        },
        {
          target: '#toggle-labels, #toggle-cutaway',
          title: 'Label & Keratan Rentas',
          desc: 'Paparkan atau sembunyikan penunjuk nama organel, serta aktifkan mod keratan rentas untuk melihat bahagian dalam sel.',
          tip: 'Mod keratan rentas membolehkan anda melihat nukleus dan vakuol dengan lebih jelas.',
          placement: 'top'
        },
        {
          target: '#organelle-name, #core-list',
          title: 'Pusat Maklumat Organel',
          desc: 'Di sini dipaparkan nama struktur, penerangan fungsi sains, serta fakta menarik tentang organel yang dipilih.',
          tip: 'Pilih nama organel daripada senarai untuk memfokuskan kamera terus ke struktur tersebut.',
          placement: 'left'
        },
        {
          target: '#btn-open-print-modal',
          title: 'Galeri & Cetak Kad AR',
          desc: 'Buka galeri kad penanda AR untuk mencetak atau memaparkan kad fizikal bagi pengimbasan Realiti Terimbuh.',
          tip: 'Terdapat 6 kad penanda aktif yang boleh anda cetak untuk Kotak ARSELNEL.',
          placement: 'top'
        },
        {
          target: '#btn-open-kotak-arselnel',
          title: 'Pengimbas Kotak ARSELNEL',
          desc: 'Ketik butang ini apabila anda bersedia untuk mengimbas kad penanda AR menggunakan kamera telefon atau komputer riba.',
          tip: 'Pastikan kawasan anda cukup terang sebelum memulakan imbasan AR.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // D2. CELLQUEST ADVENTURE — TEROKAI DUNIA AR (cellquest/adventure.html)
    // ------------------------------------------------------------------------
    ar_adventure: {
      id: 'ar_adventure',
      version: 1,
      title: 'Panduan Terokai Dunia AR',
      theme: 'cellquest',
      steps: [
        {
          target: '.cq-lobby-hero-content, .cq-lobby-title',
          title: 'Selamat Datang ke Pengembaraan Sel',
          desc: 'Di sini anda boleh memilih cara untuk meneroka dunia sel. Jom kenali tiga mod pengembaraan yang tersedia!',
          tip: 'Pengalaman interaktif yang menggabungkan visual 3D dan Realiti Terimbuh.',
          placement: 'bottom'
        },
        {
          target: '#lobby-card-mod-a',
          title: 'Mod A: Jelajah Makmal 3D',
          desc: 'Terokai makmal maya tanpa menggunakan kamera. Gunakan papan kekunci atau joystick untuk bergerak, lawati 8 stesen dan jawab cabaran sains.',
          tip: 'Pilihan terbaik jika anda menggunakan komputer tanpa kamera atau mahu bermain santai.',
          placement: 'top'
        },
        {
          target: '#lobby-card-mod-b',
          title: 'Mod B: AR Orientasi Dunia',
          desc: 'Gunakan kamera dan sensor peranti untuk mencari stesen organel di sekeliling anda dengan bantuan radar pintar.',
          tip: 'Fungsi sensor orientasi bergantung pada sokongan peranti dan kebenaran akses kamera.',
          placement: 'top'
        },
        {
          target: '#lobby-card-mod-c',
          title: 'Mod C: AR Kad Penanda',
          desc: 'Imbas kad penanda menggunakan kamera untuk memunculkan model organel 3D dan menyelesaikan kuiz interaktif.',
          tip: 'Sediakan kad penanda bercetak untuk mengimbas organel di atas meja.',
          placement: 'top'
        },
        {
          target: '#lobby-btn-mod-a',
          title: 'Mulakan Pengembaraan',
          desc: 'Pilih mod yang anda suka dan tekan butang Mula untuk memulakan pengembaraan sains anda!',
          tip: 'Ketik butang Mula pada mana-mana mod pilihan anda untuk terus masuk ke pengembaraan.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // E. SELBOT AI (selbot_ai/code.html)
    // ------------------------------------------------------------------------
    ai: {
      id: 'ai',
      version: 1,
      title: 'Panduan SelBot AI',
      theme: 'ai',
      steps: [
        {
          target: '#chat-feed',
          title: 'Ruang Sembang Pintar',
          desc: 'Semua jawapan, penerangan konsep dan analogi daripada SelBot akan dipaparkan di sini dalam gaya perbualan yang mudah.',
          tip: 'SelBot dilatih khas dengan silibus Sains Tingkatan 1 KSSM.',
          placement: 'top'
        },
        {
          target: '.quick-action-btn[data-action="explain_easy"], .quick-action-btn',
          title: 'Tindakan Pantas',
          desc: 'Minta SelBot menerangkan semula dengan lebih mudah, beri contoh praktikal harian, buat analogi menarik, atau beri soalan KBAT!',
          tip: 'Satu klik sahaja tanpa perlu menaip panjang.',
          placement: 'top'
        },
        {
          target: '.suggestion-chip-container, .suggestion-chip:first-of-type, .suggestion-chip',
          title: 'Soalan Cadangan Lazim',
          desc: 'Ketik cip soalan cadangan ini untuk bertanyakan soalan popular seperti fungsi nukleus atau beza sel haiwan dan tumbuhan.',
          tip: 'Sangat sesuai jika anda tidak pasti soalan apa yang hendak ditanya.',
          placement: 'top'
        },
        {
          target: '.composer-container, #chat-input',
          title: 'Ruang Menaip Soalan',
          desc: 'Taipkan apa-apa soalan sains anda di sini dan tekan butang Hantar (ikon pesawat kertas) atau tekan kekunci Enter.',
          tip: 'Tulis soalan yang jelas dan ringkas untuk mendapatkan jawapan paling tepat.',
          placement: 'top'
        },
        {
          target: '#new-chat-btn',
          title: 'Mulakan Sesi Baharu',
          desc: 'Ketik butang "Baharu" untuk memulakan sesi perbualan segar tentang topik sains lain.',
          tip: 'Perbualan lama anda tidak akan hilang, ia disimpan secara automatik dalam sejarah.',
          placement: 'bottom'
        },
        {
          target: '#toggle-history-btn',
          title: 'Sejarah Perbualan',
          desc: 'Buka laci sejarah sembang untuk membaca semula perbincangan terdahulu anda bersama SelBot pada bila-bila masa.',
          tip: 'Disimpan dengan selamat di pelayan Supabase akaun anda.',
          placement: 'bottom'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // F. HAB KUIZ & PERMAINAN (hab_permainan/code.html)
    // ------------------------------------------------------------------------
    games: {
      id: 'games',
      version: 1,
      title: 'Panduan Hab Permainan Sains',
      theme: 'games',
      steps: [
        {
          target: '#btn-main-leaderboard',
          title: 'Papan Skor Saintis Muda',
          desc: 'Ketik butang ini untuk melihat kedudukan markah tertinggi, lencana pencapaian dan sejarah permainan anda.',
          tip: 'Kumpulkan mata sebanyak mungkin untuk berada di kedudukan teratas!',
          placement: 'bottom'
        },
        {
          target: '#card-game-labelkan, a[href*="labelkan-organel.html"]',
          title: 'Permainan: Labelkan Organel',
          desc: 'Uji daya ingatan anda dengan menarik dan melepaskan label organel pada rajah sel haiwan dan sel tumbuhan yang betul.',
          tip: 'Ganjaran +150 mata dengan had masa 3 minit.',
          placement: 'top'
        },
        {
          target: '#card-game-maze, a[href*="klasifikasi-sel.html"]',
          title: 'Permainan: Maze Chase 2D',
          desc: 'Kawal avatar anda merentasi laluan maze, elakkan virus yang mengejar dan capai zon jawapan sains yang betul!',
          tip: 'Ganjaran lumayan sehingga +1000 mata untuk cabaran penuh aksi.',
          placement: 'top'
        },
        {
          target: '#card-game-organisasi, a[href*="organisasi-kehidupan.html"]',
          title: 'Permainan: Susun Organisasi',
          desc: 'Susun urutan hierarki kehidupan daripada peringkat sel, tisu, organ, sistem sehinggalah organisma lengkap.',
          tip: 'Cabaran menarik untuk menguasai konsep pembahagian kerja sel.',
          placement: 'top'
        },
        {
          target: '#card-game-kuiz, a[href*="kuiz_interaktif"]',
          title: 'Kuiz Saintis Muda',
          desc: 'Jawab soalan aneka pilihan secara pantas dan tepat untuk menguji kefahaman keseluruhan bab sel.',
          tip: 'Ulang kaji nota sebelum memulakan kuiz untuk markah maksimum.',
          placement: 'top'
        },
        {
          target: '#card-game-makmal, a[href*="misi-makmal-sains.html"]',
          title: 'Pengembaraan: Misi Makmal Sains',
          desc: 'Bantu cikgu sains mengemas makmal 2D! Kumpulkan 10 radas makmal dan selesaikan soalan biologi sel sebelum masa tamat.',
          tip: 'Gunakan joystick atau kekunci anak panah untuk bergerak dalam makmal.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // F2. MISI MAKMAL SAINS (games/misi-makmal-sains.html)
    // ------------------------------------------------------------------------
    lab: {
      id: 'lab',
      version: 1,
      title: 'Panduan Misi Makmal Sains',
      theme: 'games',
      steps: [
        {
          target: '#lab-hud-score, #lab-hud-lives',
          title: 'Skor & Nyawa Pemain',
          desc: 'Pantau mata yang berjaya dikumpul dan baki nyawa saintis muda anda sepanjang misi mengemas makmal.',
          tip: 'Elakkan menyentuh halangan agar nyawa anda tidak berkurangan.',
          placement: 'bottom'
        },
        {
          target: '#lab-hud-equipment, #lab-hud-inventory-btn',
          title: 'Status Kutipan Radas Makmal',
          desc: 'Matlamat anda adalah mencari dan mengutip 10 radas seperti bikar, mikroskop dan kelalang kon yang berterabur di makmal.',
          tip: 'Ketik butang inventori untuk melihat senarai radas yang telah dikutip.',
          placement: 'bottom'
        },
        {
          target: '#lab-mobile-dpad, #lab-canvas',
          title: 'Kawalan Pergerakan Avatar',
          desc: 'Gunakan D-Pad maya pada skrin telefon atau kekunci anak panah (WASD) pada papan kekunci komputer untuk menggerakkan watak.',
          tip: 'Gerakkan watak mendekati radas untuk mengutipnya secara automatik.',
          placement: 'top'
        },
        {
          target: '#lab-hud-pause-btn, #lab-hud-exit-btn',
          title: 'Kawalan Jeda & Keluar',
          desc: 'Perlukan rehat seketika? Tekan butang jeda (Esc / P) pada bila-bila masa tanpa kehilangan kemajuan permainan anda.',
          tip: 'Ketik butang keluar apabila anda ingin kembali ke Hab Permainan.',
          placement: 'bottom'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // F3. MAZE CHASE (games/klasifikasi-sel.html)
    // ------------------------------------------------------------------------
    maze: {
      id: 'maze',
      version: 1,
      title: 'Panduan Maze Chase 2D',
      theme: 'games',
      steps: [
        {
          target: '#maze-sticky-question-panel, #maze-question-text',
          title: 'Soalan Cabaran Semasa',
          desc: 'Baca soalan biologi sel di bahagian atas skrin. Kenal pasti pilihan jawapan yang tepat sebelum melangkah ke laluan maze.',
          tip: 'Pilihan jawapan (Zon A, B, C, D) ditandakan dengan jelas dalam kawasan maze.',
          placement: 'bottom'
        },
        {
          target: '#maze-hud-score, #maze-hud-lives',
          title: 'Mata Ganjaran & Nyawa',
          desc: 'Kumpulkan mata bagi setiap jawapan yang betul. Berhati-hati dengan virus yang meronda di lorong-lorong maze!',
          tip: 'Kutip kuasa tambahan (power-up) untuk meningkatkan kelajuan avatar anda.',
          placement: 'bottom'
        },
        {
          target: '#maze-mobile-dpad, #maze-canvas',
          title: 'Kawalan Pergerakan Maze',
          desc: 'Kawal arah avatar menggunakan D-Pad sentuhan atau kekunci anak panah. Rancang laluan anda dengan bijak.',
          tip: 'Jangan terperangkap di sudut mati semasa virus sedang mendekat!',
          placement: 'top'
        },
        {
          target: '#maze-hud-pause-btn',
          title: 'Jeda Permainan',
          desc: 'Ketik butang ini untuk menjeda permainan dan membaca semula objektif misi secara tenang.',
          tip: 'Masa dan kedudukan avatar anda akan kekal disimpan semasa jeda.',
          placement: 'bottom'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // G. KOTAK ARSELNEL (kotak_arselnel/code.html)
    // ------------------------------------------------------------------------
    kotak_arselnel: {
      id: 'kotak_arselnel',
      version: 1,
      title: 'Panduan Pengimbas Kotak ARSELNEL',
      theme: 'ar',
      steps: [
        {
          target: '.ar-top-hud, .ar-title-badge',
          title: 'Pengimbas Realiti Terimbuh (WebAR)',
          desc: 'Halakan kamera peranti anda ke arah kad penanda fizikal pada Kotak ARSELNEL untuk memunculkan kandungan sains 3D.',
          tip: 'Pastikan pencahayaan bilik mencukupi dan pegang peranti dengan stabil.',
          placement: 'bottom'
        },
        {
          target: '.btn-jelajah-3d',
          title: 'Mod Makmal Jelajah 3D',
          desc: 'Ketik butang ini untuk meneroka stesen makmal 3D maya bagi mengenal pasti instrumen sains secara bebas.',
          tip: 'Boleh diakses bila-bila masa tanpa memerlukan penanda fizikal.',
          placement: 'bottom'
        },
        {
          target: '.btn-orientasi-dunia',
          title: 'AR Orientasi Dunia (Radar 360°)',
          desc: 'Aktifkan kompas dan radar AR untuk memulakan Misi Jelajah Dunia Sel 360° di persekitaran fizikal anda.',
          tip: 'Pusingkan badan anda mengikut arah radar untuk mengesan stesen organel.',
          placement: 'bottom'
        },
        {
          target: '.ar-hud-user-guide-btn',
          title: 'Panduan Kad Penanda',
          desc: 'Ketik ikon bantuan ini untuk melihat panduan langkah demi langkah 6 kad penanda aktif yang disokong oleh sistem.',
          tip: 'Marker Kuiz dan SelBot telah dikeluarkan dari WebAR dan kekal di modul biasa.',
          placement: 'bottom'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // H1. PROFIL (profil/code.html)
    // ------------------------------------------------------------------------
    profile: {
      id: 'profile',
      version: 1,
      title: 'Panduan Profil Saintis Muda',
      theme: 'profile',
      steps: [
        {
          target: '#profile-avatar-preview, .ars-big-avatar',
          title: 'Avatar & Gambar Diri',
          desc: 'Lihat gambar profil watak saintis muda anda. Anda boleh memuat naik gambar avatar kegemaran anda di sini.',
          tip: 'Gunakan gambar berformat PNG atau JPG yang jelas.',
          placement: 'bottom'
        },
        {
          target: '#profile-nickname, #profile-name',
          title: 'Nama Panggilan & Maklumat Diri',
          desc: 'Kemaskini nama panggilan dan maklumat kelas anda supaya dipaparkan dengan betul dalam papan skor dan ucapan sistem.',
          tip: 'Nama panggilan yang mesra memudahkan rakan sekelas mengenali anda.',
          placement: 'top'
        },
        {
          target: '#profile-quiz-count, #profile-lesson-count',
          title: 'Statistik Aktiviti Pembelajaran',
          desc: 'Pantau bilangan kuiz yang telah anda selesaikan, nota yang telah dibaca, dan markah terbaik yang pernah dicapai.',
          tip: 'Statistik ini dikemas kini secara automatik setiap kali anda belajar.',
          placement: 'top'
        },
        {
          target: '#profile-badges',
          title: 'Lencana Pencapaian',
          desc: 'Koleksi lencana kejayaan anda seperti Saintis Unggul, Pakar Sel, dan Penjelajah Makmal yang berjaya dibuka!',
          tip: 'Selesaikan lebih banyak kuiz dan misi untuk membuka kesemua lencana.',
          placement: 'top'
        }
      ]
    },

    // ------------------------------------------------------------------------
    // H2. TETAPAN (tetapan/code.html)
    // ------------------------------------------------------------------------
    settings: {
      id: 'settings',
      version: 1,
      title: 'Panduan Tetapan Sistem',
      theme: 'settings',
      steps: [
        {
          target: '#setting-appearance',
          title: 'Tema Penampilan (Cerah / Gelap)',
          desc: 'Pilih tema paparan cerah untuk suasana belajar waktu siang atau mod gelap yang selesa untuk mata pada waktu malam.',
          tip: 'Pilihan tema akan diaplikasikan ke seluruh halaman ARSELNEL.',
          placement: 'bottom'
        },
        {
          target: '#setting-font, #setting-font-value',
          title: 'Saiz Tulisan (Tipografi)',
          desc: 'Laraskan saiz tulisan (Kecil, Sederhana, Besar) supaya teks nota dan arahan dapat dibaca dengan mudah dan selesa.',
          tip: 'Saiz tulisan yang sesuai mengelakkan keletihan mata.',
          placement: 'bottom'
        },
        {
          target: '#setting-contrast, #setting-reduced-motion',
          title: 'Aksesibiliti & Pengurangan Animasi',
          desc: 'Aktifkan mod kontras tinggi untuk teks lebih jelas, atau kurangkan animasi jika anda mengalami sensitiviti pergerakan skrin.',
          tip: 'Direka untuk memastikan semua murid dapat belajar dengan selesa.',
          placement: 'top'
        },
        {
          target: '#setting-sound, #reset-progress',
          title: 'Bunyi & Pengurusan Kemajuan',
          desc: 'Kawal kesan bunyi permainan dan latar belakang, atau tetapkan semula kemajuan pembelajaran anda jika ingin mengulang kaji dari awal.',
          tip: 'Tetapan anda disimpan dengan selamat dalam storan peranti anda.',
          placement: 'top'
        }
      ]
    }
  };

  // Expose to global namespace
  global.ARSELNEL_TOUR_CONFIGS = TOUR_CONFIGS;

})(typeof window !== 'undefined' ? window : this);
