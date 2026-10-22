/**
 * ARSelNel - Misi Makmal Sains: Operasi Kemas Makmal
 * Data, Map, Questions & Sound Engine
 * Topik: Sains Tingkatan 1 - Bab 2: Sel sebagai Unit Asas Hidupan
 */

(function(global) {
  'use strict';

  // 1. Keadaan Permainan (Game States)
  const LabGameState = {
    READY: 'ready',            // Skrin taklimat cikgu sebelum mula
    PLAYING: 'playing',        // Semasa meneroka makmal
    PAUSED: 'paused',          // Jeda / Pause
    QUESTION: 'question',      // Modal soalan peralatan aktif
    STORAGE_RETURN: 'return',  // Semua peralatan dijumpai, perlu ke kaunter simpanan
    FINISHED: 'finished'       // Misi selesai, pintu keluar dilepasi
  };

  // 2. Data 10 Soalan Sains Mengikut Aras Kognitif (Rendah -> Sederhana -> KBAT)
  // Format pemarkahan: Rendah (50 pts), Sederhana (100 pts), KBAT (150 pts), Bonus Pemulangan (50 pts) = 1000 pts max
  const LAB_QUESTIONS = [
    // ---------------- ARAS RENDAH (Soalan 1 - 4: 50 pts) ----------------
    {
      id: 1,
      equipmentId: 'bikar',
      equipmentName: 'Bikar Kaca',
      equipmentIcon: '🧪',
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      zone: 'Zon A — Meja Pelajar 1',
      question: 'Apakah unit asas paling kecil bagi semua organisma hidup yang mampu menjalankan fungsi kehidupan?',
      options: [
        'Organ',
        'Tisu',
        'Sel',
        'Molekul'
      ],
      correct: 2, // Index 2: Sel
      explanation: 'Sel merupakan unit asas hidupan bagi semua organisma seperti yang dinyatakan dalam Teori Sel. Sel menjalankan fungsi asas kehidupan seperti respirasi, pertumbuhan dan pembiakan.'
    },
    {
      id: 2,
      equipmentId: 'mikroskop',
      equipmentName: 'Mikroskop Cahaya',
      equipmentIcon: '🔬',
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      zone: 'Zon B — Sudut Mikroskopi',
      question: 'Organel sel manakah yang berfungsi sebagai pusat kawalan keseluruhan aktiviti sel dan menyimpan maklumat genetik (DNA)?',
      options: [
        'Vakuol',
        'Nukleus',
        'Sitoplasma',
        'Mitokondria'
      ],
      correct: 1, // Index 1: Nukleus
      explanation: 'Nukleus mengandungi kromosom yang membawa asid deoksiribonukleik (DNA). Ia mengawal semua tindak balas biokimia dan pembahagian sel.'
    },
    {
      id: 3,
      equipmentId: 'kaca_slaid',
      equipmentName: 'Kaca Slaid & Kaca Penutup',
      equipmentIcon: '🧫',
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      zone: 'Zon B — Meja Penyediaan Slaid',
      question: 'Antara struktur berikut, yang manakah HANYA wujud dalam sel tumbuhan dan TIDAK terdapat dalam sel haiwan?',
      options: [
        'Membran sel dan Sitoplasma',
        'Nukleus dan Mitokondria',
        'Dinding sel dan Kloroplas',
        'Ribosom dan Vakuol kecil'
      ],
      correct: 2, // Index 2: Dinding sel dan Kloroplas
      explanation: 'Dinding sel selulosa dan kloroplas hanya terdapat pada sel tumbuhan. Sel haiwan tidak mempunyai dinding sel atau kloroplas.'
    },
    {
      id: 4,
      equipmentId: 'penitis',
      equipmentName: 'Penitis Makmal',
      equipmentIcon: '💧',
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      zone: 'Zon A — Kaunter Singki',
      question: 'Apakah peranan utama membran sel yang menyelaputi sitoplasma?',
      options: [
        'Membekalkan tenaga ATP untuk respirasi',
        'Mengawal pergerakan bahan keluar dan masuk ke dalam sel',
        'Membuat makanan melalui fotosintesis',
        'Memberi bentuk tegar yang tidak boleh berubah'
      ],
      correct: 1, // Index 1: Mengawal pergerakan bahan
      explanation: 'Membran sel bersifat separa telap (telap memilih) yang mengawal laluan molekul seperti air, oksigen, glukosa dan bahan kumuh keluar masuk sel.'
    },

    // ---------------- ARAS SEDERHANA (Soalan 5 - 7: 100 pts) ----------------
    {
      id: 5,
      equipmentId: 'kelalang_kon',
      equipmentName: 'Kelalang Kon',
      equipmentIcon: '⚗️',
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      zone: 'Zon D — Meja Demonstrasi Guru',
      question: 'Mengapakah sel tumbuhan memerlukan dinding sel tegar daripada gentian selulosa, manakala sel haiwan tidak memilikinya?',
      options: [
        'Untuk membolehkan sel tumbuhan bergerak bebas mencari cahaya matahari',
        'Untuk memberikan sokongan mekanikal dan bentuk tetap kerana tumbuhan tiada rangka tulang',
        'Supaya sel tumbuhan dapat menyerap lebih banyak gas karbon dioksida melalui liang dinding',
        'Bagi membolehkan sel tumbuhan membahagi secara mitosis dengan lebih pantas'
      ],
      correct: 1, // Index 1: Sokongan mekanikal dan bentuk tetap
      explanation: 'Tumbuhan tidak mempunyai sistem rangka dalaman (tulang) seperti haiwan. Dinding selulosa yang kuat dan tegar menyokong sel supaya tumbuhan herba dan berkayu dapat berdiri tegak.'
    },
    {
      id: 6,
      equipmentId: 'silinder_penyukat',
      equipmentName: 'Silinder Penyukat',
      equipmentIcon: '🧪',
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      zone: 'Zon A — Meja Pelajar 2',
      question: 'Apakah kesan fisiologi terhadap sehelai daun tumbuhan sekiranya sel-sel mesofilnya mengalami mutasi yang menyebabkan kloroplas tidak terbentuk?',
      options: [
        'Sel daun menghasilkan lebih banyak glukosa secara respirasi anaerob',
        'Sel daun tidak dapat menyerap tenaga cahaya matahari dan gagal menjalankan fotosintesis',
        'Dinding sel daun akan pecah akibat tekanan osmosis yang terlalu tinggi',
        'Sel daun akan bertukar menjadi sel haiwan secara automatik'
      ],
      correct: 1, // Index 1: Tidak dapat fotosintesis
      explanation: 'Kloroplas mengandungi pigmen hijau klorofil yang menyerap tenaga foton cahaya matahari. Tanpa kloroplas, sintesis glukosa melalui fotosintesis tidak dapat berlaku, menyebabkan bahagian daun tersebut menjadi pucat (etiolasi) dan kekurangan nutrien.'
    },
    {
      id: 7,
      equipmentId: 'rak_tabung_uji',
      equipmentName: 'Rak Tabung Uji Kayu',
      equipmentIcon: '🧬',
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      zone: 'Zon A — Meja Sisi Makmal',
      question: 'Di dalam sel tumbuhan matang, bagaimanakah vakuol besar yang dipenuhi sap sel membantu mengekalkan kesegahan sel (turgidity)?',
      options: [
        'Air meresap masuk ke vakuol secara osmosis dan menghasilkan tekanan turgor yang menolak sitoplasma ke dinding sel',
        'Vakuol mengepam oksigen ke luar membran sel untuk mengelakkan sel daripada meletus',
        'Sap sel di dalam vakuol membeku menjadi pepejal untuk menampung berat daun',
        'Vakuol memendekkan kromosom supaya isipadu sel mengecil'
      ],
      correct: 0, // Index 0: Tekanan turgor osmosis
      explanation: 'Air yang meresap ke dalam vakuol mengembangkan isipadunya dan mengenakan tekanan hidraulik (tekanan segah / turgor) terhadap dinding sel, mengekalkan kesegahan sel herba.'
    },

    // ---------------- ARAS TINGGI / KBAT (Soalan 8 - 10: 150 pts) ----------------
    {
      id: 8,
      equipmentId: 'kanta_pembesar',
      equipmentName: 'Kanta Pembesar Logam',
      equipmentIcon: '🔍',
      difficulty: 'high',
      difficultyLabel: 'Aras Tinggi (KBAT)',
      badgeColor: 'purple',
      points: 150,
      zone: 'Zon B — Meja Pemerhatian Makmal',
      question: 'Seorang murid memerhati suatu spesimen sel di bawah mikroskop. Beliau mendapati sel itu mempunyai nukleus di tengah, membran sel lentur dan sitoplasma, tetapi tiada dinding sel dan tiada vakuol besar. Apakah kesimpulan saintifik paling munasabah?',
      options: [
        'Ia ialah sel tumbuhan yang telah mati dan kehilangan dinding selnya',
        'Ia ialah sel haiwan (contohnya sel pipi manusia) kerana tiada dinding sel dan bentuknya tidak tetap',
        'Ia adalah bakteria kerana hanya bakteria yang tidak memiliki vakuol besar',
        'Ia adalah sel daun yang belum matang sepenuhnya'
      ],
      correct: 1, // Index 1: Sel haiwan (sel pipi manusia)
      explanation: 'Ciri-ciri ketiadaan dinding sel, ketiadaan kloroplas, membran sel yang fleksibel, dan vakuol kecil/tiada vakuol merupakan ciri khas sel haiwan, seperti sel pipi manusia.'
    },
    {
      id: 9,
      equipmentId: 'tabung_uji',
      equipmentName: 'Tabung Uji Kaca',
      equipmentIcon: '🧪',
      difficulty: 'high',
      difficultyLabel: 'Aras Tinggi (KBAT)',
      badgeColor: 'purple',
      points: 150,
      zone: 'Zon C — Troli Peralatan Makmal',
      question: 'Dua hirisan sel daun tumbuhan diletakkan dalam dua piring petri: Sel X kekal segah, manakala Sel Y mengalami pengecutan vakuol yang teruk dan sitoplasmanya tertarik menjauhi dinding sel (plasmolisis). Apakah perbezaan persekitaran antara Sel X dan Sel Y?',
      options: [
        'Sel X diletakkan di tempat gelap, manakala Sel Y diletakkan di bawah cahaya terik',
        'Sel X berada dalam air suling (hipotonik), manakala Sel Y berada dalam larutan sukrosa pekat (hipertonik) yang menarik keluar air secara osmosis',
        'Sel X kekurangan oksigen, manakala Sel Y mempunyai karbon dioksida berlebihan',
        'Sel Y telah dijangkiti kulat parasit yang memakan dinding selnya'
      ],
      correct: 1, // Index 1: Larutan hipertonik menyebabkan plasmolisis
      explanation: 'Dalam larutan hipertonik (pekat), keupayaan air di luar lebih rendah daripada sap sel. Air meresap keluar secara osmosis daripada vakuol ke persekitaran, menyebabkan vakuol mengecut dan membran plasma tertarik dari dinding sel (plasmolisis).'
    },
    {
      id: 10,
      equipmentId: 'forseps',
      equipmentName: 'Forseps Keluli Tahan Karat',
      equipmentIcon: '🥢',
      difficulty: 'high',
      difficultyLabel: 'Aras Tinggi (KBAT)',
      badgeColor: 'purple',
      points: 150,
      zone: 'Zon D — Rak Radang Guru',
      question: 'Seorang penyelidik menemui suatu sel daripada tisu tumbuhan yang memiliki dinding sel selulosa tebal, nukleus dan vakuol, tetapi tiada langsung kloroplas di bawah mikroskop elektron. Adakah ketiadaan kloroplas ini mencukupi untuk membuktikan sel itu BUKAN sel tumbuhan?',
      options: [
        'Ya, kerana semua sel dalam tubuh tumbuhan tanpa pengecualian wajib mempunyai kloroplas',
        'Tidak, kerana sel tumbuhan di bahagian bukan fotosintesis (seperti sel rambut akar atau sel umbisi bawah tanah) sememangnya tidak mengandungi kloroplas',
        'Ya, kerana sel tanpa kloroplas pasti tergolong dalam alam kulat atau bakteria',
        'Tidak, kerana kloroplas hanya akan terbentuk apabila sel itu dimasukkan ke dalam air panas'
      ],
      correct: 1, // Index 1: Sel akar / bawah tanah tidak mengandungi kloroplas
      explanation: 'Kloroplas hanya terdapat pada sel tumbuhan yang terdedah kepada cahaya matahari (cth: sel mesofil daun). Bahagian tumbuhan di bawah tanah seperti sel rambut akar tidak terdedah kepada cahaya dan tidak berfotosintesis, namun tetap merupakan sel tumbuhan kerana memiliki dinding sel selulosa dan vakuol.'
    }
  ];

  // 3. Konfigurasi 10 Peralatan yang Tersebar di Makmal (Tile Coordinates)
  const LAB_EQUIPMENT = [
    { id: 1, key: 'bikar', name: 'Bikar Kaca', icon: '🧪', col: 8, row: 14, zone: 'Zon A — Meja 1' },
    { id: 2, key: 'mikroskop', name: 'Mikroskop Cahaya', icon: '🔬', col: 6, row: 6, zone: 'Zon B — Meja Mikroskopi' },
    { id: 3, key: 'kaca_slaid', name: 'Kaca Slaid', icon: '🧫', col: 12, row: 8, zone: 'Zon B — Meja Slaid' },
    { id: 4, key: 'penitis', name: 'Penitis Makmal', icon: '💧', col: 14, row: 20, zone: 'Zon A — Kaunter Singki' },
    { id: 5, key: 'kelalang_kon', name: 'Kelalang Kon', icon: '⚗️', col: 20, row: 7, zone: 'Zon D — Meja Guru' },
    { id: 6, key: 'silinder_penyukat', name: 'Silinder Penyukat', icon: '🧪', col: 22, row: 14, zone: 'Zon A — Meja 2' },
    { id: 7, key: 'rak_tabung_uji', name: 'Rak Tabung Uji', icon: '🧬', col: 18, row: 21, zone: 'Zon A — Meja Sisi' },
    { id: 8, key: 'kanta_pembesar', name: 'Kanta Pembesar', icon: '🔍', col: 4, row: 9, zone: 'Zon B — Meja Pemerhatian' },
    { id: 9, key: 'tabung_uji', name: 'Tabung Uji', icon: '🧪', col: 31, row: 18, zone: 'Zon C — Troli Makmal' },
    { id: 10, key: 'forseps', name: 'Forseps Keluli', icon: '🥢', col: 29, row: 7, zone: 'Zon D — Rak Radang' }
  ];

  // 4. Stesen Pemulangan Peralatan (Equipment Return Counter di Zon C)
  const STORAGE_STATION = {
    col: 30,
    row: 23,
    width: 2,
    height: 2,
    name: 'Kaunter Penyimpanan Peralatan (Zon C)',
    bonusPoints: 50
  };

  // 5. Pintu Keluar Makmal (Zon E - Pintu Keluar di Dinding Utara)
  const EXIT_DOOR = {
    col: 18,
    row: 1,
    width: 2,
    height: 2,
    name: 'PINTU KELUAR MAKMAL'
  };

  // 6. Dimensi Peta Makmal (38 kolum x 26 baris @ 32px = 1216 x 832 px)
  const LAB_MAP_COLS = 38;
  const LAB_MAP_ROWS = 26;
  const LAB_TILE_SIZE = 32;

  // Nilai Tile:
  // 0  = Lantai Jubin Makmal Putih/Kelabu (Walkable)
  // 1  = Jubin Berpola / Jalur Keselamatan Makmal (Walkable)
  // 2  = Dinding Luar Makmal / Bata Simen (SOLID)
  // 3  = Tingkap Kaca Dinding Makmal (SOLID)
  // 4  = Meja Makmal Hitam Berkualiti Tinggi (SOLID)
  // 5  = Singki Makmal Keluli Tahan Karat & Paip Air (SOLID)
  // 6  = Meja Demonstrasi Guru (SOLID)
  // 7  = Papan Putih Besar & Carta Biologi Sel (SOLID di Dinding Utara)
  // 8  = Kabinet Reagen & Kaca (SOLID)
  // 9  = Kerusi Bangku Makmal / Halangan Kerusi (SOLID)
  // 10 = Kebuk Wasap / Fume Hood (SOLID)
  // 11 = Troli Peralatan Makmal (SOLID)
  // 12 = Stesen Pemulangan Peralatan (Interactive Return Target)
  // 13 = Pintu Keluar Makmal Terkunci (SOLID)
  // 14 = Pintu Keluar Makmal DIBUKA (Walkable Portal)
  // 15 = Pintu Masuk / Hiasan Dalaman (SOLID)

  // Jana peta 100% di dalam makmal sains sekolah
  function generateLabMap() {
    const map = [];
    for (let r = 0; r < LAB_MAP_ROWS; r++) {
      const row = [];
      for (let c = 0; c < LAB_MAP_COLS; c++) {
        // Dinding perimeter makmal (Dinding Luar)
        if (r === 0 || r === LAB_MAP_ROWS - 1 || c === 0 || c === LAB_MAP_COLS - 1) {
          row.push(2); // Dinding konkrit luar
        }
        // PINTU KELUAR MAKMAL di Utara (r: 1, c: 18, 19)
        else if (r === 1 && (c === 18 || c === 19)) {
          row.push(13); // Mula sebagai Pintu Keluar Terkunci
        }
        // Papan Putih Besar & Carta Sel di Dinding Depan Guru (r: 1, c: 21-27)
        else if (r === 1 && c >= 21 && c <= 27) {
          row.push(7); // Papan putih / carta sel
        }
        // Dinding Kaca / Tingkap Makmal di Dinding Utara Kiri (r: 1, c: 3-15)
        else if (r === 1 && c >= 3 && c <= 15) {
          row.push(3); // Tingkap kaca makmal
        }
        // ZON B: Sudut Mikroskopi (Barat Laut: r: 4-10, c: 3-14)
        // Meja Mikroskopi Berbaris dengan bangku
        else if ((r === 5 || r === 8) && c >= 5 && c <= 13 && c !== 9) {
          row.push(4); // Meja makmal mikroskop
        }
        else if ((r === 6 || r === 9) && (c === 7 || c === 11)) {
          row.push(9); // Kerusi bangku makmal sebagai halangan
        }
        // ZON D: Meja Demonstrasi Guru & Kebuk Wasap (Utara Tengah: r: 4-9, c: 18-34)
        else if (r === 4 && (c === 32 || c === 33)) {
          row.push(10); // Kebuk Wasap / Fume Hood
        }
        else if (r === 6 && c >= 20 && c <= 26) {
          row.push(6); // Meja demonstrasi guru panjang
        }
        else if (r === 4 && c >= 28 && c <= 30) {
          row.push(8); // Kabinet bahan kimia guru
        }
        // Dinding Pembahagi Sisi (Pemisah Zon Penyimpanan Kanan: r: 12-16, c: 27)
        else if (r >= 12 && r <= 15 && c === 27) {
          row.push(2); // Dinding pembahagi
        }
        // ZON C: Stesen Simpanan Peralatan & Kaunter Pemulangan (Tenggara: r: 17-24, c: 28-35)
        else if (r >= 17 && r <= 19 && (c === 33 || c === 34 || c === 35)) {
          row.push(8); // Kabinet radas kaca besar
        }
        else if (r === 23 && (c === 30 || c === 31)) {
          row.push(12); // STESEN PEMULANGAN PERALATAN (Return Counter Tile)
        }
        else if (r === 22 && (c === 30 || c === 31)) {
          row.push(4); // Kaunter atas
        }
        else if (r === 19 && c === 30) {
          row.push(11); // Troli peralatan beroda
        }
        // ZON A: Meja Eksperimen Pelajar Utama (Pusat: r: 12-22, c: 4-25)
        // Meja Pelajar Baris 1: r: 13, c: 6-12 dan c: 16-22
        else if (r === 13 && ((c >= 6 && c <= 11) || (c >= 17 && c <= 22))) {
          row.push(4); // Meja eksperimen
        }
        // Singki di hujung Meja Pelajar Baris 1: c: 12 dan c: 16
        else if (r === 13 && (c === 12 || c === 16)) {
          row.push(5); // Singki makmal
        }
        // Halangan kerusi meja 1:
        else if (r === 14 && (c === 9 || c === 20)) {
          row.push(9); // Bangku makmal
        }
        // Meja Pelajar Baris 2: r: 17, c: 6-12 dan c: 16-22
        else if (r === 17 && ((c >= 6 && c <= 11) || (c >= 17 && c <= 22))) {
          row.push(4); // Meja eksperimen
        }
        // Singki di hujung Meja Pelajar Baris 2: c: 12 dan c: 16
        else if (r === 17 && (c === 12 || c === 16)) {
          row.push(5); // Singki makmal
        }
        // Halangan kerusi meja 2:
        else if (r === 18 && (c === 7 || c === 18)) {
          row.push(9); // Bangku makmal
        }
        // Meja Pelajar Baris 3 (Belakang): r: 21, c: 6-12 dan c: 16-22
        else if (r === 21 && ((c >= 6 && c <= 11) || (c >= 17 && c <= 22))) {
          row.push(4); // Meja eksperimen
        }
        else if (r === 21 && (c === 12 || c === 16)) {
          row.push(5); // Singki makmal
        }
        // Koridor dan Laluan Utama (Jalur Keselamatan Kuning/Hitam)
        else if (c === 14 || c === 15) {
          row.push(1); // Laluan utama tengah makmal (Walkable safety line)
        }
        else if (r === 11 || r === 24) {
          row.push(1); // Koridor mendatar
        }
        // Default: Lantai Jubin Makmal Biasa
        else {
          row.push(0); // Lantai jubin makmal
        }
      }
      map.push(row);
    }
    return map;
  }

  // 7. Audio Synthesizer Enjin (Web Audio API - Nada Makmal & Interaksi Sains)
  class LabAudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.init();
    }

    init() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn('Web Audio API tidak disokong pada peranti ini');
      }
    }

    ensureContext() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.12) {
      if (this.muted || !this.ctx) return;
      this.ensureContext();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Abaikan ralat audio
      }
    }

    // Bunyi kutip radas makmal (Crystal pickup chime)
    playPickup() {
      if (this.muted) return;
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.15), idx * 60);
      });
    }

    // Bunyi jawapan betul (Happy laboratory success chord)
    playCorrect() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.16), idx * 80);
      });
    }

    // Bunyi jawapan salah (Gentle laboratory caution buzzer)
    playIncorrect() {
      if (this.muted) return;
      this.playTone(220, 'sawtooth', 0.22, 0.12);
      setTimeout(() => this.playTone(185, 'sawtooth', 0.3, 0.12), 140);
    }

    // Bunyi pintu terbuka (Door mechanism unlocked)
    playUnlockDoor() {
      if (this.muted) return;
      const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      arpeggio.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.18), idx * 90);
      });
    }

    // Bunyi pulangkan peralatan (Storage deposit chime)
    playReturnStorage() {
      if (this.muted) return;
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.28, 0.18), idx * 75);
      });
    }

    // Bunyi kemenangan tamat misi (Victory Fanfare)
    playVictory() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 880, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.18), idx * 110);
      });
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }
  }

  // Eksport ke skop global
  global.ARSelNelLabAdventure = {
    GameState: LabGameState,
    QUESTIONS: LAB_QUESTIONS,
    EQUIPMENT: LAB_EQUIPMENT,
    STORAGE_STATION,
    EXIT_DOOR,
    MAP_COLS: LAB_MAP_COLS,
    MAP_ROWS: LAB_MAP_ROWS,
    TILE_SIZE: LAB_TILE_SIZE,
    generateLabMap,
    Audio: new LabAudioEngine()
  };

})(window);
