/**
 * ARSelNel 2D Open World Quiz Adventure - Data, Map & Audio Engine
 * Topik: Sains Tingkatan 1 - Bab 2: Sel sebagai Unit Asas Hidupan
 */

(function(global) {
  'use strict';

  // 1. Data Soalan Sains Tingkatan 1 (10 Soalan DSKP)
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

  // 2. Konfigurasi Dunia Permainan (48x36 tiles @ 32px = 1536 x 1152 px)
  const MAP_COLS = 48;
  const MAP_ROWS = 36;
  const TILE_SIZE = 32;

  // Nilai Tile:
  // 0 = Rumput (Walkable)
  // 1 = Laluan Batu / Koridor (Walkable)
  // 2 = Lantai Makmal Jubin (Walkable)
  // 3 = Lantai Rumah Hijau (Walkable)
  // 4 = Dataran Jubin Mar-mar (Walkable)
  // 10 = Dinding Bata Luar (SOLID)
  // 11 = Dinding Kaca Makmal (SOLID)
  // 12 = Pagar / Pokok Renek (SOLID)
  // 13 = Meja Makmal / Console (SOLID)
  // 14 = Pokok Rendang Besar (SOLID)
  // 15 = Kolam Air / Air Pancut (SOLID)
  // 16 = Dinding Rumah Hijau (SOLID)
  // 17 = Rak Paparan Sains / Mikroskop Besar (SOLID)
  // 20 = Jubin FINISH Checkered (Walkable - Trigger Finish Check)
  // 21 = Tiang Pintu Gerbang FINISH (SOLID)

  // Jana peta kampus berstruktur
  function generateCampusMap() {
    const map = [];
    for (let r = 0; r < MAP_ROWS; r++) {
      const row = [];
      for (let c = 0; c < MAP_COLS; c++) {
        // Border sempadan kampus (Pagar Luar)
        if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
          row.push(12); // Pagar luar
        }
        // Bangunan 1: Makmal Biologi Sel (Barat Laut: r: 3-12, c: 3-18)
        else if (r >= 3 && r <= 12 && c >= 3 && c <= 18) {
          if (r === 3 || c === 3 || c === 18) {
            row.push(11); // Dinding kaca makmal
          } else if (r === 12) {
            // Pintu masuk makmal pada c: 8-10
            if (c >= 8 && c <= 10) row.push(2);
            else row.push(11);
          } else {
            // Dalam makmal: meja eksperimen dan lantai
            if ((r === 6 || r === 9) && c >= 6 && c <= 15 && c !== 10 && c !== 11) {
              row.push(13); // Meja makmal
            } else if (r === 4 && (c === 6 || c === 15)) {
              row.push(17); // Konsol sains
            } else {
              row.push(2); // Lantai jubin makmal
            }
          }
        }
        // Bangunan 2: Rumah Hijau & Taman Botani (Timur Laut: r: 3-12, c: 29-44)
        else if (r >= 3 && r <= 12 && c >= 29 && c <= 44) {
          if (r === 3 || c === 29 || c === 44) {
            row.push(16); // Dinding rumah kaca
          } else if (r === 12) {
            if (c >= 35 && c <= 37) row.push(3); // Pintu masuk
            else row.push(16);
          } else {
            if ((r === 6 || r === 9) && c >= 32 && c <= 41 && c !== 36) {
              row.push(12); // Pasu tumbuhan panjang
            } else {
              row.push(3); // Lantai rumah hijau
            }
          }
        }
        // Zon Penamat (FINISH Portal): Utara Tengah (r: 1-4, c: 22-26)
        else if (r >= 1 && r <= 4 && c >= 21 && c <= 27) {
          if ((c === 21 || c === 27) && (r === 2 || r === 3)) {
            row.push(21); // Tiang gerbang
          } else if (r >= 2 && r <= 4 && c >= 22 && c <= 26) {
            row.push(20); // FINISH CHECKERED TILE
          } else {
            row.push(4); // Laluan dataran
          }
        }
        // Bangunan 3: Makmal Bio-Tenaga & Mitokondria (Barat Daya: r: 23-32, c: 3-18)
        else if (r >= 23 && r <= 32 && c >= 3 && c <= 18) {
          if (r === 23) {
            if (c >= 8 && c <= 10) row.push(2); // Pintu masuk
            else row.push(10);
          } else if (r === 32 || c === 3 || c === 18) {
            row.push(10); // Dinding bata
          } else {
            if ((r === 26 || r === 29) && c >= 6 && c <= 15 && c !== 10) {
              row.push(13); // Meja generator tenaga
            } else {
              row.push(2); // Lantai makmal
            }
          }
        }
        // Bangunan 4: Pavilion Hierarki & Sel Khusus (Timur Daya: r: 23-32, c: 29-44)
        else if (r >= 23 && r <= 32 && c >= 29 && c <= 44) {
          if (r === 23) {
            if (c >= 35 && c <= 37) row.push(4); // Pintu masuk
            else row.push(11);
          } else if (r === 32 || c === 29 || c === 44) {
            row.push(11);
          } else {
            if ((r === 26 || r === 29) && c >= 32 && c <= 41 && c !== 36) {
              row.push(17); // Meja spesimen
            } else {
              row.push(4); // Lantai mar-mar
            }
          }
        }
        // Pancutan Air & Kolam Dataran Utama: Pusat (r: 17-19, c: 23-25)
        else if (r >= 17 && r <= 19 && c >= 23 && c <= 25) {
          row.push(15); // Kolam air pancut
        }
        // Pokok-pokok hiasan kampus
        else if (
          (r === 15 && (c === 6 || c === 14 || c === 33 || c === 41)) ||
          (r === 21 && (c === 6 || c === 14 || c === 33 || c === 41)) ||
          (r === 7 && (c === 23 || c === 25)) ||
          (r === 28 && (c === 23 || c === 25))
        ) {
          row.push(14); // Pokok rendang
        }
        // Laluan utama berturap (Laluan rentas kampus)
        else if (
          (r >= 14 && r <= 22 && c >= 19 && c <= 29) || // Dataran utama tengah
          (c >= 22 && c <= 26) || // Laluan koridor utara-selatan
          (r >= 17 && r <= 19) || // Laluan koridor timur-barat
          (c >= 8 && c <= 10 && r >= 12 && r <= 23) || // Sambungan makmal barat
          (c >= 35 && c <= 37 && r >= 12 && r <= 23) // Sambungan makmal timur
        ) {
          row.push(1); // Laluan batu berturap
        }
        // Selebihnya adalah padang rumput kampus
        else {
          row.push(0); // Rumput
        }
      }
      map.push(row);
    }
    return map;
  }

  // 3. Posisi 10 Burger Collectibles
  // Dijajarkan di atas lantai yang sah (walkable) di seluruh 5 zon kampus
  const BURGER_LOCATIONS = [
    { questionId: 1,  col: 19, row: 17, zone: "Dataran Sains Utama (Pusat Kampus)" },
    { questionId: 2,  col: 9,  row: 11, zone: "Pintu Masuk Makmal Biologi Sel" },
    { questionId: 3,  col: 10, row: 5,  zone: "Meja Mikroskopi Makmal Biologi" },
    { questionId: 4,  col: 26, row: 14, zone: "Laluan Masuk Taman Botani" },
    { questionId: 5,  col: 36, row: 8,  zone: "Tengah Rumah Hijau Kloroplas" },
    { questionId: 6,  col: 42, row: 10, zone: "Sudut Turgiditi & Vakuol Tumbuhan" },
    { questionId: 7,  col: 10, row: 27, zone: "Pusat Makmal Tenaga Mitokondria" },
    { questionId: 8,  col: 24, row: 26, zone: "Koridor Selatan Komparatif Sel" },
    { questionId: 9,  col: 36, row: 27, zone: "Pavilion Hierarki Organisasi Sel" },
    { questionId: 10, col: 41, row: 25, zone: "Stesen Sel Khusus & Hemoglobin" }
  ];

  // 4. Audio Synthesizer Engine (Web Audio API - Tiada Fail Audio Luaran)
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
      this.playTone(180, 'triangle', 0.04, 0.02);
    }

    playCollect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Arpeggio gembira)
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.12, 0.12);
        }, i * 65);
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
        }, i * 80);
      });
    }

    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const notes = [311.13, 277.18, 233.08]; // Eb4, C#4, Bb3 (Menurun)
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.15, 0.08);
        }, i * 90);
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
    COMPLETED: 'completed'
  };

  // Eksport modul ke global scope
  global.ARSelNelAdventure = {
    GameState,
    QUESTIONS: ADVENTURE_QUESTIONS,
    MAP_COLS,
    MAP_ROWS,
    TILE_SIZE,
    generateCampusMap,
    BURGER_LOCATIONS,
    Audio: new RetroAudioEngine()
  };

})(window);
