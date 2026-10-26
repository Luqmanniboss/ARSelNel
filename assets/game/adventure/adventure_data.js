/**
 * ARSelNel 2D Science Rescue Adventure - Data, Map, Hazards & Audio Engine
 * Modul: Misi Penyelamat Makmal Sains (Kuiz Saintis Muda)
 * Topik: Sains Tingkatan 1 - Bab 2: Sel sebagai Unit Asas Hidupan
 */

(function(global) {
  'use strict';

  // 1. Data Soalan Sains Tingkatan 1 (10 Soalan Objektif DSKP Asal - DIKEKALKAN SEPENUHNYA)
  const ADVENTURE_QUESTIONS = [
    {
      id: 1,
      title: "Pusat Kawalan Sel",
      topic: "Nukleus & DNA",
      landmark: "Dataran Sains Utama",
      question: "Apakah organel utama yang mengawal segala aktiviti di dalam sel dan mengandungi maklumat genetik (DNA)?",
      options: [
        "Mitokondria",
        "Nukleus",
        "Sitoplasma",
        "Vakuol"
      ],
      correct: 1, // Index 1: Nukleus
      explanation: "Nukleus bertindak sebagai 'otak' atau pusat kawalan sel. Di dalamnya tersimpan kromosom yang membawa asid deoksiribonukleik (DNA) untuk mengawal metabolisme dan pewarisan ciri sel."
    },
    {
      id: 2,
      title: "Pintu Masuk & Keluar Sel",
      topic: "Membran Sel",
      landmark: "Lobi Makmal Biologi Sel",
      question: "Struktur manakah yang bersifat separa telap dan mengawal pergerakan bahan kimia masuk dan keluar dari sel?",
      options: [
        "Membran sel",
        "Dinding sel",
        "Kloroplas",
        "Vakuol besar"
      ],
      correct: 0, // Index 0: Membran sel
      explanation: "Membran sel menyelaputi seluruh sitoplasma dan mengawal atur pergerakan bahan seperti air, nutrien, oksigen dan bahan kumur merentas sel secara telap memilih."
    },
    {
      id: 3,
      title: "Medium Reaksi Sel",
      topic: "Sitoplasma",
      landmark: "Stesen Mikroskopi & Larutan",
      question: "Apakah peranan utama bahan seperti jeli yang dikenali sebagai sitoplasma di dalam kedua-dua sel haiwan dan tumbuhan?",
      options: [
        "Menyerap tenaga cahaya matahari",
        "Menyimpan pigmen warna bunga",
        "Bertindak sebagai medium bagi berlakunya tindak balas biokimia",
        "Memberi bentuk tetap yang tegar kepada sel"
      ],
      correct: 2, // Index 2: Medium biokimia
      explanation: "Sitoplasma terdiri daripada air dan pelbagai bahan terlarut, berfungsi sebagai medium hidup di mana kebanyakan tindak balas kimia dan metabolisme sel berlangsung."
    },
    {
      id: 4,
      title: "Perisai & Sokongan Tumbuhan",
      topic: "Dinding Sel & Selulosa",
      landmark: "Pintu Masuk Taman Botani",
      question: "Apakah komponen penting yang membina dinding sel tumbuhan sehingga mampu memberi sokongan mekanikal dan bentuk yang tetap?",
      options: [
        "Hemoglobin",
        "Gentian Selulosa",
        "Glukosa cair",
        "Klorofil hijau"
      ],
      correct: 1, // Index 1: Selulosa
      explanation: "Dinding sel terbina daripada gentian selulosa yang kuat dan tegar, memberikan perlindungan fizikal, sokongan serta mengekalkan bentuk sel tumbuhan."
    },
    {
      id: 5,
      title: "Dapur Fotosintesis",
      topic: "Kloroplas & Klorofil",
      landmark: "Rumah Hijau Botanik",
      question: "Organel manakah yang mengandungi pigmen hijau klorofil untuk menyerap tenaga cahaya matahari bagi menjana makanan melalui fotosintesis?",
      options: [
        "Sentriol",
        "Ribosom",
        "Kloroplas",
        "Mitokondria"
      ],
      correct: 2, // Index 2: Kloroplas
      explanation: "Kloroplas mengandungi pigmen klorofil yang bertindak memerangkap tenaga foton suria untuk menghasilkan glukosa dan oksigen semasa proses fotosintesis."
    },
    {
      id: 6,
      title: "Takungan Segah Tumbuhan",
      topic: "Vakuol & Sap Sel",
      landmark: "Stesen Hidraulik Sel",
      question: "Di dalam sel tumbuhan matang, vakuol besar dipenuhi dengan sap sel. Apakah faedah utama struktur ini kepada sel tumbuhan herba?",
      options: [
        "Menjana impuls elektrik saraf",
        "Mengekalkan kesegahan sel (turgiditi) supaya tumbuhan tidak layu",
        "Menyingkirkan sisa kumuh melalui pernafasan",
        "Mengangkut hormon ke bahagian akar"
      ],
      correct: 1, // Index 1: Kesegahan sel
      explanation: "Penyerapan air ke dalam vakuol menghasilkan tekanan segah (turgor) terhadap dinding sel, mengekalkan kesegahan sel dan menyokong tumbuhan supaya berdiri tegak."
    },
    {
      id: 7,
      title: "Stesen Janakuasa Sel",
      topic: "Mitokondria & Respirasi Sel",
      landmark: "Makmal Bio-Tenaga",
      question: "Mengapakah mitokondria dinamakan sebagai 'stesen janakuasa' bagi sel haiwan dan tumbuhan?",
      options: [
        "Menghasilkan tenaga dalam bentuk ATP melalui proses respirasi sel",
        "Menyerap gelombang haba dari persekitaran",
        "Mengawal pembahagian kromosom semasa mitosis",
        "Menghasilkan cecair hempedu untuk pencernaan"
      ],
      correct: 0, // Index 0: Menghasilkan tenaga
      explanation: "Mitokondria mengoksidakan makanan (glukosa) semasa respirasi sel aerobik untuk membebaskan tenaga kimia berguna (ATP) bagi semua proses kehidupan."
    },
    {
      id: 8,
      title: "Perbezaan Dua Alam Sel",
      topic: "Sel Haiwan vs Sel Tumbuhan",
      landmark: "Pavilion Komparatif Sel",
      question: "Antara kombinasi berikut, pasangan struktur manakah yang HANYA wujud dalam sel tumbuhan dan TIDAK terdapat pada sel haiwan?",
      options: [
        "Nukleus dan Membran sel",
        "Dinding sel dan Kloroplas",
        "Mitokondria dan Sitoplasma",
        "Membran sel dan Ribosom"
      ],
      correct: 1, // Index 1: Dinding sel dan Kloroplas
      explanation: "Sel tumbuhan memiliki dinding sel selulosa, kloroplas dan vakuol pusat besar yang tidak dimiliki oleh sel haiwan. Sebaliknya, kedua-duanya berkongsi membran sel, nukleus, sitoplasma dan mitokondria."
    },
    {
      id: 9,
      title: "Hierarki Kehidupan Sel",
      topic: "Tahap Organisasi Sel",
      landmark: "Dataran Organisasi Biologi",
      question: "Manakah susunan hierarki organisasi sel daripada peringkat paling asas kepada peringkat paling rencam yang tepat?",
      options: [
        "Tisu → Sel → Organ → Sistem → Organisma",
        "Sel → Tisu → Organ → Sistem → Organisma",
        "Organ → Tisu → Sel → Organisma → Sistem",
        "Sel → Organ → Tisu → Sistem → Organisma"
      ],
      correct: 1, // Index 1: Sel -> Tisu -> Organ -> Sistem -> Organisma
      explanation: "Unit asas ialah Sel. Kumpulan sel serupa membentuk Tisu, beberapa tisu membina Organ, gabungan organ membentuk Sistem, dan kesemua sistem membina Organisma yang lengkap."
    },
    {
      id: 10,
      title: "Keistimewaan Sel Khusus",
      topic: "Pengkhususan Sel",
      landmark: "Pavilion Saintis Terbilang",
      question: "Mengapakah sel darah merah matang pada manusia tidak mempunyai nukleus dan berbentuk cakera dwicekung?",
      options: [
        "Supaya ia boleh melekat pada bakteria berbahaya",
        "Untuk memaksimumkan ruang bagi hemoglobin mengangkut lebih banyak gas oksigen",
        "Untuk memudahkan pembahagian sel berlaku dengan pantas",
        "Supaya tidak mudah dicerna oleh enzim perut"
      ],
      correct: 1, // Index 1: Maksimakan hemoglobin & oksigen
      explanation: "Ketiadaan nukleus memberi ruang maksimum untuk memuatkan pigmen hemoglobin, manakala bentuk dwicekung meningkatkan nisbah luas permukaan kepada isi padu bagi resapan oksigen yang sangat pantas."
    }
  ];

  // 2. 10 Sampel & Objek Sains (Menggantikan burger sepenuhnya)
  const SCIENCE_SAMPLES = [
    {
      questionId: 1,
      name: "Sampel Sel Haiwan",
      type: "animal_cell",
      icon: "🔬",
      col: 19,
      row: 17,
      zone: "Dataran Sains Utama (Pusat Kampus)",
      description: "Kelalang spesimen sel pipi haiwan dengan nukleus jelas."
    },
    {
      questionId: 2,
      name: "Sampel Sel Tumbuhan",
      type: "plant_cell",
      icon: "🌿",
      col: 9,
      row: 11,
      zone: "Pintu Masuk Makmal Biologi Sel",
      description: "Spesimen sel daun Elodea kaya dengan pigmen kloroplas."
    },
    {
      questionId: 3,
      name: "Slaid Mikroskop",
      type: "micro_slide",
      icon: "🔍",
      col: 10,
      row: 5,
      zone: "Bilik Mikroskop & Pemerhatian",
      description: "Slaid kaca berpenutup mengandungi kultur sel epidermis bawang."
    },
    {
      questionId: 4,
      name: "Kanta Objektif",
      type: "obj_lens",
      icon: "🔭",
      col: 26,
      row: 14,
      zone: "Laluan Masuk Taman Botani",
      description: "Kanta objektif pembesaran 40x untuk resolusi struktur organel halus."
    },
    {
      questionId: 5,
      name: "Tabung Uji",
      type: "test_tube",
      icon: "🧪",
      col: 36,
      row: 8,
      zone: "Rumah Hijau Botanik",
      description: "Tabung uji kaca dengan larutan penunjuk fotosintesis aktif."
    },
    {
      questionId: 6,
      name: "Piring Petri",
      type: "petri_dish",
      icon: "🧫",
      col: 42,
      row: 10,
      zone: "Sudut Turgiditi & Vakuol Tumbuhan",
      description: "Piring petri beragar kultur tisu kalus tumbuhan herba."
    },
    {
      questionId: 7,
      name: "Sampel Tisu",
      type: "tissue_sample",
      icon: "🧬",
      col: 10,
      row: 27,
      zone: "Stor Peralatan & Makmal Bio-Tenaga",
      description: "Kelalang bio-sampel tisu otot berketumpatan mitokondria tinggi."
    },
    {
      questionId: 8,
      name: "Model Nukleus",
      type: "nucleus_model",
      icon: "⚛️",
      col: 24,
      row: 26,
      zone: "Koridor Selatan Komparatif Sel",
      description: "Model anatomi 3D membran ganda nukleus dan benang kromatin."
    },
    {
      questionId: 9,
      name: "Model Mitokondrion",
      type: "mito_model",
      icon: "⚡",
      col: 36,
      row: 27,
      zone: "Pavilion Hierarki Organisasi Sel",
      description: "Model organel krista mitokondria penjana molekul ATP."
    },
    {
      questionId: 10,
      name: "Kit Pemerhatian Sel",
      type: "cell_kit",
      icon: "📦",
      col: 41,
      row: 25,
      zone: "Stesen Sel Khusus & Hemoglobin",
      description: "Kit instrumen pewarnaan metilena biru dan iodin lengkap."
    }
  ];

  // 3. Konfigurasi Kuasa Tambahan (Power-ups Sains)
  const POWERUP_LOCATIONS = [
    {
      id: "p_speed",
      type: "speed",
      name: "Kasut Pantas Makmal",
      icon: "⚡",
      col: 15,
      row: 18,
      duration: 8, // 8 saat rangsangan kelajuan
      zone: "Dataran Utama Barat",
      description: "Meningkatkan kelajuan larian avatar sebanyak 50% selama 8 saat."
    },
    {
      id: "p_shield",
      type: "shield",
      name: "Perisai Keselamatan Bio",
      icon: "🛡️",
      col: 31,
      row: 18,
      duration: 0, // bertahan sehingga 1 pelanggaran
      zone: "Dataran Utama Timur",
      description: "Membentuk medan tenaga pelindung yang menyerap 1 kerosakan halangan."
    },
    {
      id: "p_medkit",
      type: "medkit",
      name: "Kit Pertolongan Cemas",
      icon: "🩹",
      col: 24,
      row: 8,
      duration: 0,
      zone: "Laluan Menuju Makmal Utama",
      description: "Memulihkan 1 nyawa (sehingga maksimum 3 nyawa)."
    }
  ];

  // 4. Halangan Dinamik & Bahaya Persekitaran Makmal
  // A. Tumpahan Bahan Kimia & Biohazard Puddles (Statik Berbahaya)
  const HAZARD_PUDDLES = [
    { id: "h1", type: "chemical", col: 14, row: 8,  radius: 18, label: "Tumpahan Asid Bio" },
    { id: "h2", type: "chemical", col: 33, row: 8,  radius: 18, label: "Tumpahan Reagen Berasid" },
    { id: "h3", type: "biohazard", col: 14, row: 24, radius: 20, label: "Kawasan Pencemaran Bio" },
    { id: "h4", type: "chemical", col: 33, row: 24, radius: 18, label: "Tumpahan Pelarut Organik" }
  ];

  // B. Robot Pembersih Makmal Rosak (Halangan Bergerak Ronda)
  const PATROL_ROBOTS = [
    {
      id: "bot_1",
      name: "Bot Pembersih-01 (Rosak)",
      axis: "x",
      minCol: 18,
      maxCol: 30,
      row: 20,
      speed: 60,
      dir: 1,
      width: 24,
      height: 24
    },
    {
      id: "bot_2",
      name: "Bot Pembersih-02 (Rosak)",
      axis: "y",
      col: 9,
      minRow: 14,
      maxRow: 21,
      speed: 55,
      dir: 1,
      width: 24,
      height: 24
    },
    {
      id: "bot_3",
      name: "Bot Pembersih-03 (Rosak)",
      axis: "y",
      col: 36,
      minRow: 14,
      maxRow: 21,
      speed: 55,
      dir: -1,
      width: 24,
      height: 24
    }
  ];

  // 5. Konfigurasi Dunia Permainan (48x36 tiles @ 32px = 1536 x 1152 px)
  const MAP_COLS = 48;
  const MAP_ROWS = 36;
  const TILE_SIZE = 32;

  // Nilai Kod Tile:
  // 0 = Rumput Kampus Sains (Walkable)
  // 1 = Laluan Batu Berturap / Koridor (Walkable)
  // 2 = Jubin Makmal Biologi (Walkable)
  // 3 = Lantai Rumah Hijau Botanik (Walkable)
  // 4 = Dataran Mar-mar Pavilion (Walkable)
  // 5 = Lantai Bilik Bersih Makmal Utama (Walkable)
  // 10 = Dinding Bata Luar (SOLID)
  // 11 = Dinding Kaca Makmal (SOLID)
  // 12 = Pagar / Pokok Renek Sempadan (SOLID)
  // 13 = Meja Eksperimen Makmal (SOLID)
  // 14 = Pokok Rendang Kampus (SOLID)
  // 15 = Kolam Air Pancut Dataran (SOLID)
  // 16 = Dinding Rumah Hijau (SOLID)
  // 17 = Rak Instrumen / Mikroskop Gergasi (SOLID)
  // 18 = Papan Tanda Arah Zon Makmal (SOLID)
  // 19 = Pintu Keselamatan Makmal Utama (SOLID jika sampel < 10, TERBUKA jika sampel = 10)
  // 20 = Terminal Pengaktifan Keselamatan Makmal Utama (FINISH Zone)
  // 21 = Tiang Pintu Gerbang Makmal Utama (SOLID)

  function generateCampusMap() {
    const map = [];
    for (let r = 0; r < MAP_ROWS; r++) {
      const row = [];
      for (let c = 0; c < MAP_COLS; c++) {
        // Pagar Sempadan Luar Kampus
        if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
          row.push(12);
        }
        // Zon 1: Bilik Mikroskop & Makmal Biologi Sel (Barat Laut: r: 3-12, c: 3-18)
        else if (r >= 3 && r <= 12 && c >= 3 && c <= 18) {
          if (r === 3 || c === 3 || c === 18) {
            row.push(11); // Dinding kaca makmal
          } else if (r === 12) {
            if (c >= 8 && c <= 10) row.push(2); // Pintu masuk makmal
            else row.push(11);
          } else {
            // Meja eksperimen & instrumen mikroskopi
            if ((r === 6 || r === 9) && c >= 6 && c <= 15 && c !== 10 && c !== 11) {
              row.push(13); // Meja makmal
            } else if (r === 4 && (c === 6 || c === 15)) {
              row.push(17); // Rak mikroskop
            } else {
              row.push(2); // Jubin makmal biologi
            }
          }
        }
        // Zon 2: Rumah Hijau & Taman Botani (Timur Laut: r: 3-12, c: 29-44)
        else if (r >= 3 && r <= 12 && c >= 29 && c <= 44) {
          if (r === 3 || c === 29 || c === 44) {
            row.push(16); // Dinding rumah hijau
          } else if (r === 12) {
            if (c >= 35 && c <= 37) row.push(3); // Pintu masuk rumah hijau
            else row.push(16);
          } else {
            if ((r === 6 || r === 9) && c >= 32 && c <= 41 && c !== 36) {
              row.push(12); // Meja tanaman bertingkat
            } else {
              row.push(3); // Lantai rumah hijau
            }
          }
        }
        // Zon 5: Makmal Utama ARSelNel & Terminal Keselamatan (Utara Tengah: r: 1-4, c: 20-27)
        else if (r >= 1 && r <= 4 && c >= 20 && c <= 27) {
          if (r === 1 || c === 20 || c === 27) {
            row.push(21); // Tiang struktur dinding pelindung
          } else if (r === 4 && (c === 23 || c === 24)) {
            row.push(19); // PINTU KESELAMATAN BERKUNCI (Dibuka bila 10 sampel siap)
          } else if (r === 4) {
            row.push(21); // Dinding pintu gerbang
          } else if (r === 2 && (c === 23 || c === 24)) {
            row.push(20); // TERMINAL PENGAKTIFAN KESELAMATAN (FINISH TARGET)
          } else {
            row.push(5); // Lantai bilik bersih makmal utama
          }
        }
        // Zon 3: Stor Peralatan & Makmal Bio-Tenaga (Barat Daya: r: 23-32, c: 3-18)
        else if (r >= 23 && r <= 32 && c >= 3 && c <= 18) {
          if (r === 23) {
            if (c >= 8 && c <= 10) row.push(2); // Pintu masuk stor
            else row.push(10);
          } else if (r === 32 || c === 3 || c === 18) {
            row.push(10); // Dinding bata kukuh
          } else {
            if ((r === 26 || r === 29) && c >= 6 && c <= 15 && c !== 10) {
              row.push(13); // Rak peralatan berat
            } else if (r === 24 && c === 6) {
              row.push(17); // Kabinet bahan kimia
            } else {
              row.push(2);
            }
          }
        }
        // Zon 4: Pavilion Hierarki & Sel Khusus (Timur Daya: r: 23-32, c: 29-44)
        else if (r >= 23 && r <= 32 && c >= 29 && c <= 44) {
          if (r === 23) {
            if (c >= 35 && c <= 37) row.push(4); // Pintu masuk pavilion
            else row.push(11);
          } else if (r === 32 || c === 29 || c === 44) {
            row.push(11);
          } else {
            if ((r === 26 || r === 29) && c >= 32 && c <= 41 && c !== 36) {
              row.push(17); // Meja pameran spesimen
            } else {
              row.push(4);
            }
          }
        }
        // Kolam Dataran Sains Utama (Pusat Kampus: r: 17-19, c: 23-25)
        else if (r >= 17 && r <= 19 && c >= 23 && c <= 25) {
          row.push(15);
        }
        // Papan Tanda Arah Kampus Sains (Informatif untuk Pelajar)
        else if ((r === 15 && c === 21) || (r === 15 && c === 27) || (r === 21 && c === 24)) {
          row.push(18); // Papan tanda arah
        }
        // Pokok-pokok Rendang Kampus
        else if (
          (r === 15 && (c === 6 || c === 14 || c === 33 || c === 41)) ||
          (r === 21 && (c === 6 || c === 14 || c === 33 || c === 41)) ||
          (r === 7 && (c === 21 || c === 26)) ||
          (r === 28 && (c === 23 || c === 25))
        ) {
          row.push(14);
        }
        // Laluan Berturap (Koridor Penghubung Antara Zon)
        else if (
          (r >= 14 && r <= 22 && c >= 19 && c <= 28) || // Dataran utama
          (c >= 22 && c <= 25) || // Koridor menegak utara-selatan
          (r >= 17 && r <= 19) || // Koridor melintang timur-barat
          (c >= 8 && c <= 10 && r >= 12 && r <= 23) || // Sambungan makmal barat
          (c >= 35 && c <= 37 && r >= 12 && r <= 23) // Sambungan makmal timur
        ) {
          row.push(1);
        }
        // Padang Rumput Kampus
        else {
          row.push(0);
        }
      }
      map.push(row);
    }
    return map;
  }

  // 6. Audio Synthesizer Engine (Web Audio API - Nada Sains & Maklum Balas Tanpa Aset Luaran)
  class RetroAudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      try {
        const savedMute = localStorage.getItem('arselnel_adventure_sound_muted');
        this.muted = savedMute === 'true';
      } catch (_) {}
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    setMuted(isMuted) {
      this.muted = isMuted;
      try {
        localStorage.setItem('arselnel_adventure_sound_muted', isMuted ? 'true' : 'false');
      } catch (_) {}
    }

    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (_) {}
    }

    playStep() {
      if (this.muted) return;
      this.playTone(190, 'triangle', 0.04, 0.02);
    }

    playCollect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Arpeggio sci-fi ceria penemuan sampel
      const notes = [440.0, 554.37, 659.25, 880.0]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.14, 0.12);
        }, i * 60);
      });
    }

    playCorrect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.18, 0.15);
        }, i * 75);
      });
    }

    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [311.13, 277.18, 233.08]; // Menurun
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.15, 0.08);
        }, i * 90);
      });
    }

    playHurt() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Amaran terkena bahaya (tumpahan bahan kimia / robot)
      this.playTone(150, 'sawtooth', 0.22, 0.16);
      setTimeout(() => {
        this.playTone(95, 'sawtooth', 0.18, 0.14);
      }, 70);
    }

    playPowerup() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Nada meningkat bertenaga
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.12, 0.14);
        }, i * 45);
      });
    }

    playShieldBreak() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      this.playTone(400, 'square', 0.08, 0.1);
      setTimeout(() => {
        this.playTone(250, 'sawtooth', 0.16, 0.12);
      }, 50);
    }

    playReactivate() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      // Bunyi sci-fi pengaktifan semula sistem keselamatan makmal
      const chime = [440, 659.25, 880, 1108.73, 1318.51, 1760];
      chime.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.35, 0.15);
        }, i * 85);
      });
    }

    playGameOver() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [392.00, 349.23, 311.13, 261.63];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.25, 0.12);
        }, i * 140);
      });
    }

    playVictory() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const fanfare = [
        { f: 523.25, d: 0.15 }, { f: 659.25, d: 0.15 }, { f: 783.99, d: 0.2 },
        { f: 1046.50, d: 0.4 }, { f: 880.00, d: 0.15 }, { f: 1046.50, d: 0.6 }
      ];
      let delay = 0;
      fanfare.forEach(item => {
        setTimeout(() => {
          this.playTone(item.f, 'triangle', item.d, 0.18);
        }, delay);
        delay += item.d * 1000 + 30;
      });
    }
  }

  // Keadaan Permainan (Game States)
  const GameState = {
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    QUESTION: 'question',
    GAMEOVER: 'gameover',
    COMPLETED: 'completed'
  };

  // Eksport modul ke global scope
  global.ARSelNelAdventure = {
    GameState,
    QUESTIONS: ADVENTURE_QUESTIONS,
    SCIENCE_SAMPLES,
    POWERUP_LOCATIONS,
    HAZARD_PUDDLES,
    PATROL_ROBOTS,
    MAP_COLS,
    MAP_ROWS,
    TILE_SIZE,
    generateCampusMap,
    Audio: new RetroAudioEngine()
  };

})(window);
