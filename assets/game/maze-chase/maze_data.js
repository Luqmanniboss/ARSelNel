/**
 * ARSelNel - Maze Chase 2D: Misi Sel Haiwan & Tumbuhan
 * Game Data, 10 Questions, 10 Distinct Solvable Maze Layouts, Reachability Validator & Web Audio
 * Topik: Sains Tingkatan 1 - Bab 2: Sel sebagai Unit Asas Hidupan
 */

(function(global) {
  'use strict';

  // 1. Game States
  const MazeGameState = {
    READY: 'ready',                       // Skrin alu-aluan / Cara Bermain
    QUESTION_PREVIEW: 'question_preview', // Fasa membaca soalan 15 saat (Task 4 & 5)
    PLAYING: 'playing',                   // Semasa bermain dalam maze
    PAUSED: 'paused',                     // Jeda / Pause
    TRANSITION: 'transition',             // Peralihan animasi antara maze
    CORRECT_ANSWER: 'correct',            // Menjawab dengan betul (Maklum balas & penjelasan)
    FEEDBACK: 'correct',                  // Alias untuk maklum balas
    LIFE_PENALTY: 'penalty',              // Kena virus atau masuk zon salah (Penalti nyawa)
    GAME_OVER: 'gameover',                // Kehabisan nyawa (0 nyawa)
    VICTORY: 'victory',                   // Menang 10 soalan (1000 pts)
    COMPLETED: 'victory'                  // Alias tamat permainan
  };

  // 2. Enemy AI States & Configuration (Task 2 & 4: Clear AI State Machine)
  const EnemyState = {
    RANDOM_PATROL: 'RANDOM_PATROL',
    DETECT_PLAYER: 'DETECT_PLAYER',
    CHASE_PLAYER: 'CHASE_PLAYER',
    LOST_PLAYER: 'LOST_PLAYER',
    // Aliases untuk keserasian sedia ada
    PATROL: 'RANDOM_PATROL',
    CHASE: 'CHASE_PLAYER',
    RETURN: 'LOST_PLAYER'
  };

  // Konfigurasi ketat bagi 3 jenis virus:
  // Green: 3 tiles detection, random patrol, shortest-path chase, speed 0.75
  // Purple: 6 tiles detection, random patrol, pathfinding chase, speed 0.90
  // Red: 9 tiles detection, random patrol, shortest-path chase, speed 1.05
  const VIRUS_CONFIG = {
    green: {
      id: 'green',
      name: 'Virus Hijau',
      detectionRange: 3, // Jarak pengesanan tepat 3 petak (jarak dekat)
      patrolMode: 'random',
      chaseMode: 'shortest-path',
      speedMultiplier: 0.75,
      baseSpeed: 75,
      color: '#84cc16',
      secondaryColor: '#4d7c0f',
      alertColor: '#84cc16',
      disengageDelay: 1.2 // Masa bertenang sebelum kembali ke rondaan (saat)
    },
    purple: {
      id: 'purple',
      name: 'Virus Ungu',
      detectionRange: 6, // Jarak pengesanan tepat 6 petak (jarak sederhana)
      patrolMode: 'random',
      chaseMode: 'pathfinding',
      speedMultiplier: 0.90,
      baseSpeed: 92,
      color: '#c084fc',
      secondaryColor: '#7e22ce',
      alertColor: '#c084fc',
      disengageDelay: 1.5
    },
    red: {
      id: 'red',
      name: 'Virus Merah',
      detectionRange: 9, // Jarak pengesanan tepat 9 petak (jarak jauh, dikemaskini ke 9)
      patrolMode: 'random',
      chaseMode: 'shortest-path',
      speedMultiplier: 1.05,
      baseSpeed: 105,
      color: '#f87171',
      secondaryColor: '#b91c1c',
      alertColor: '#ef4444',
      disengageDelay: 1.8
    }
  };

  // 2b. Konfigurasi Power-Up Kolektibel (Task 4 & 5)
  const POWERUP_CONFIG = {
    speed: {
      id: 'speed',
      type: 'speed',
      name: 'Pecutan Saintis',
      icon: '⚡',
      color: '#facc15',
      glow: 'rgba(250, 204, 21, 0.45)',
      duration: 3, // 3 saat
      description: 'Kelajuan avatar bertambah +50% selama 3 saat!'
    },
    life: {
      id: 'life',
      type: 'life',
      name: 'Nyawa Tambahan',
      icon: '❤️',
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.45)',
      duration: 0, // Segera
      description: '+1 Nyawa tambahan (Maksimum 5 nyawa)!'
    },
    freeze: {
      id: 'freeze',
      type: 'freeze',
      name: 'Pembeku Virus',
      icon: '❄️',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.45)',
      duration: 3, // 3 saat
      description: 'Semua virus dibekukan selama 3 saat!'
    },
    shield: {
      id: 'shield',
      type: 'shield',
      name: 'Perisai Sel',
      icon: '🛡️',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      duration: 0, // Menahan 1 pelanggaran
      description: 'Perisai sel aktif! Menahan 1 pelanggaran virus!'
    },
    radar: {
      id: 'radar',
      type: 'radar',
      name: 'Radar Saintis',
      icon: '📡',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.45)',
      duration: 5, // 5 saat
      description: 'Lokasi dan aura virus didedahkan selama 5 saat!'
    }
  };

  // 3. Data 10 Soalan Sains Tingkatan 1 (Bab 2: Sel)
  const MAZE_QUESTIONS = [
    // ---------------- ARAS RENDAH (Soalan 1 - 4: 50 pts) ----------------
    {
      id: 1,
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      mazeTitle: 'Maze 1: Koridor Asas Sel',
      question: 'Apakah struktur yang terdapat pada sel tumbuhan tetapi tiada pada sel haiwan?',
      options: [
        'Membran sel',
        'Sitoplasma',
        'Dinding sel',
        'Nukleus'
      ],
      correct: 2, // C: Dinding sel
      illustration: 'dinding_sel',
      explanation: 'Dinding sel merupakan lapisan tegar terbina daripada selulosa yang hanya wujud pada sel tumbuhan. Sel haiwan tidak mempunyai dinding sel, sebaliknya hanya diselaputi membran sel yang fleksibel.'
    },
    {
      id: 2,
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      mazeTitle: 'Maze 2: Liku-liku Nukleus',
      question: 'Organel manakah yang berfungsi mengawal keseluruhan aktiviti sel serta membawa maklumat genetik (DNA)?',
      options: [
        'Nukleus',
        'Vakuol',
        'Kloroplas',
        'Dinding sel'
      ],
      correct: 0, // A: Nukleus
      illustration: 'nukleus',
      explanation: 'Nukleus ialah pusat kawalan sel yang mengandungi kromosom dan bahan genetik (DNA). Ia mengawal semua tindak balas biokimia, sintesis protein dan pembahagian sel.'
    },
    {
      id: 3,
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      mazeTitle: 'Maze 3: Laluan Membran Sel',
      question: 'Apakah fungsi utama membran sel?',
      options: [
        'Menghasilkan cahaya dan warna',
        'Mengawal pergerakan bahan masuk dan keluar',
        'Menghasilkan makanan melalui fotosintesis',
        'Mengekalkan bentuk sel sahaja'
      ],
      correct: 1, // B: Mengawal pergerakan bahan
      illustration: 'membran_sel',
      explanation: 'Membran sel bersifat separa telap yang bertindak sebagai pintu kawalan, membenarkan molekul tertentu seperti air dan nutrien masuk sambil menyingkirkan bahan kumuh daripada sel.'
    },
    {
      id: 4,
      difficulty: 'low',
      difficultyLabel: 'Aras Rendah',
      badgeColor: 'emerald',
      points: 50,
      mazeTitle: 'Maze 4: Cabang Klorofil Hijau',
      question: 'Organel manakah mengandungi klorofil untuk menyerap tenaga cahaya matahari bagi fotosintesis?',
      options: [
        'Nukleus',
        'Mitokondrion',
        'Kloroplas',
        'Sitoplasma'
      ],
      correct: 2, // C: Kloroplas
      illustration: 'kloroplas',
      explanation: 'Kloroplas mengandungi pigmen hijau klorofil yang bertindak menyerap tenaga cahaya matahari untuk menukarkan karbon dioksida dan air kepada glukosa dan oksigen.'
    },

    // ---------------- ARAS SEDERHANA (Soalan 5 - 7: 100 pts) ----------------
    {
      id: 5,
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      mazeTitle: 'Maze 5: Labyrinth Dinding Sel Tegar',
      question: 'Mengapakah sel tumbuhan biasanya mempunyai bentuk yang lebih tetap berbanding sel haiwan?',
      options: [
        'Mempunyai dinding sel yang tegar',
        'Tiada membran sel',
        'Tiada nukleus di dalam sel',
        'Mempunyai lebih banyak sitoplasma'
      ],
      correct: 0, // A: Mempunyai dinding sel
      illustration: 'sel_tumbuhan',
      explanation: 'Dinding sel terbina daripada mikrofibril selulosa yang kuat dan tegar, memberikan sokongan mekanikal serta menetapkan bentuk geometri sel tumbuhan.'
    },
    {
      id: 6,
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      mazeTitle: 'Maze 6: Simpang Sel Eukariot',
      question: 'Apakah persamaan penting antara sel haiwan dan sel tumbuhan?',
      options: [
        'Kedua-duanya mempunyai kloroplas',
        'Kedua-duanya mempunyai dinding sel',
        'Kedua-duanya mempunyai membran sel dan nukleus',
        'Kedua-duanya menjalankan fotosintesis'
      ],
      correct: 2, // C: Membran sel dan nukleus
      illustration: 'sel_haiwan',
      explanation: 'Kedua-dua sel haiwan dan sel tumbuhan merupakan sel eukariot yang berkongsi struktur asas penting seperti membran sel, sitoplasma, nukleus dan mitokondria.'
    },
    {
      id: 7,
      difficulty: 'medium',
      difficultyLabel: 'Aras Sederhana',
      badgeColor: 'amber',
      points: 100,
      mazeTitle: 'Maze 7: Rintangan Fotosintesis Daun',
      question: 'Apakah kemungkinan kesan sekiranya kloroplas di dalam sel daun tumbuhan tidak berfungsi?',
      options: [
        'Proses fotosintesis terganggu dan makanan tidak dapat dihasilkan',
        'Sel menghasilkan lebih banyak klorofil',
        'Dinding sel hilang serta-merta',
        'Nukleus bertukar menjadi vakuol'
      ],
      correct: 0, // A: Fotosintesis terganggu
      illustration: 'kloroplas',
      explanation: 'Tanpa kloroplas yang berfungsi, klorofil tidak dapat memerangkap tenaga cahaya. Akibatnya fotosintesis gagal berlaku dan tumbuhan tidak mampu membina makanannya sendiri.'
    },

    // ---------------- ARAS TINGGI / KBAT (Soalan 8 - 10: 150 pts) ----------------
    {
      id: 8,
      difficulty: 'high',
      difficultyLabel: 'KBAT (Analisis)',
      badgeColor: 'rose',
      points: 150,
      mazeTitle: 'Maze 8: Analisis Mikroskopi Pipi',
      question: 'Seorang murid memerhati sel di bawah mikroskop: mempunyai membran sel, sitoplasma dan nukleus tetapi tiada dinding sel. Apakah kesimpulan paling munasabah?',
      options: [
        'Sel itu berkemungkinan besar sel haiwan (seperti sel pipi)',
        'Sel itu semestinya sel tumbuhan yang sihat',
        'Sel itu merupakan sel mati yang tidak hidup',
        'Sel itu tidak mempunyai sebarang organel'
      ],
      correct: 0, // A: Sel haiwan
      illustration: 'sel_haiwan',
      explanation: 'Ketiadaan dinding selulosa dan bentuknya yang fleksibel adalah ciri khas sel haiwan (contohnya sel pipi manusia). Sel tumbuhan sentiasa mempunyai dinding sel luar.'
    },
    {
      id: 9,
      difficulty: 'high',
      difficultyLabel: 'KBAT (Aplikasi)',
      badgeColor: 'rose',
      points: 150,
      mazeTitle: 'Maze 9: Penyahsegarahan Vakuol Sap',
      question: 'Sel tumbuhan kehilangan banyak air sehingga vakuol mengecut (plasmolisis). Apakah kesan yang paling mungkin berlaku pada sel tersebut?',
      options: [
        'Sel menjadi lebih segah dan mengembang',
        'Tekanan segah berkurang dan tumbuhan layu',
        'Kloroplas bertukar menjadi nukleus',
        'Dinding sel terus hilang sepenuhnya'
      ],
      correct: 1, // B: Tekanan segah berkurang
      illustration: 'vakuol',
      explanation: 'Apabila air keluar daripada vakuol sap sel, sitoplasma mengecut menjauhi dinding sel (kelayuan). Tekanan segah menurun menyebabkan tisu tumbuhan kehilangan sokongan hidrostatik.'
    },
    {
      id: 10,
      difficulty: 'high',
      difficultyLabel: 'KBAT (Sintesis)',
      badgeColor: 'rose',
      points: 150,
      mazeTitle: 'Maze 10: Grand Labyrinth Sel Akar',
      question: 'Seorang murid memerhati sel tumbuhan daripada bahagian akar dan tidak menjumpai sebarang kloroplas. Apakah penjelasan saintifik terbaik?',
      options: [
        'Semua sel tumbuhan mesti mempunyai kloroplas tanpa pengecualian',
        'Sel akar biasanya tidak menjalankan fotosintesis kerana berada di bawah tanah tanpa cahaya matahari',
        'Sel akar sebenarnya diklasifikasikan sebagai sel haiwan',
        'Sel akar tidak mempunyai membran sel atau nukleus'
      ],
      correct: 1, // B: Sel akar tiada fotosintesis
      illustration: 'sel_tumbuhan',
      explanation: 'Akar tumbuhan berada di bawah tanah dan tidak menerima cahaya matahari. Oleh itu, sel akar tidak memerlukan kloroplas untuk fotosintesis, sebaliknya berfungsi menyerap air dan garam mineral.'
    }
  ];

  // 4. SEPULUH (10) REKA BENTUK MAZE BERBEZA & DISAHKAN (23 Kolum x 17 Baris)
  // Setiap maze mempunyai susunan dinding, koridor, zon jawapan A/B/C/D, dan spawn yang unik!
  // '1' = Dinding, '0' = Laluan, 'S' = Spawn Pemain, 'A'/'B'/'C'/'D' = Zon Jawapan, 'G' = Green, 'P' = Purple, 'R' = Red
  const MAZE_LAYOUTS_RAW = [
    // --- LAYOUT 1: Koridor Asas Sel (Mudah & Terbuka) ---
    [
      "11111111111111111111111",
      "1AAAA0000011100000BBBB1",
      "1AAAA0110011100110BBBB1",
      "1AAAA0110000000110BBBB1",
      "10000011110101111000001",
      "10110000000G00000001101",
      "10111101111111110111101",
      "10000001100R00110000001",
      "11101101100000110110111",
      "11101100001P10000110111",
      "10000001111111110000001",
      "10110000000000000001101",
      "10111101111011110111101",
      "1CCCC000000S000000DDDD1",
      "1CCCC0110111110110DDDD1",
      "1CCCC0000000000000DDDD1",
      "11111111111111111111111"
    ],

    // --- LAYOUT 2: Liku-liku Nukleus (Zon Jawapan di Sudut Luar & Sisi Tengah) ---
    [
      "11111111111111111111111",
      "10000011100000111000001",
      "10CCCC011000001100DDDD1",
      "10CCCC00000G000000DDDD1",
      "11101111000000011110111",
      "10000000000000000000001",
      "10111011000R00011011101",
      "1AAAA0011100011100BBBB1",
      "1AAAA0111000001110BBBB1",
      "1AAAA0011100011100BBBB1",
      "10111000000P00000011101",
      "10001101110001110110001",
      "11000000000000000000011",
      "11011101110S01110111011",
      "10000000110001100000001",
      "10111110000000001111101",
      "11111111111111111111111"
    ],

    // --- LAYOUT 3: Laluan Membran Sel (Gelung Orbit Tengah) ---
    [
      "11111111111111111111111",
      "10000000001110000000001",
      "10111111000000011111101",
      "1011DDDD110G011CCCC1101",
      "1011DDDD1100011CCCC1101",
      "10000000001110000000001",
      "11101111100000111110111",
      "10001110001R10001110001",
      "10100000111S11100000101",
      "10101110001P10001110101",
      "11101111100000111110111",
      "10000000001110000000001",
      "1011BBBB1100011AAAA1101",
      "1011BBBB1100011AAAA1101",
      "10111111000100011111101",
      "10000000011111000000001",
      "11111111111111111111111"
    ],

    // --- LAYOUT 4: Cabang Klorofil Hijau (Koridor Bersilang & Terbuka) ---
    [
      "11111111111111111111111",
      "1AAAA0000001000000BBBB1",
      "1AAAA0111100011110BBBB1",
      "10000011110101111000001",
      "10110000000G00000001101",
      "10111101111111110111101",
      "10000000000R00000000001",
      "11101111011011011110111",
      "10000011000S00011000001",
      "11101111011011011110111",
      "10000000000P00000000001",
      "10111101111111110111101",
      "10110000000000000001101",
      "10000011110101111000001",
      "1CCCC0111100011110DDDD1",
      "1CCCC0000001000000DDDD1",
      "11111111111111111111111"
    ],

    // --- LAYOUT 5: Labyrinth Dinding Sel Tegar (Lorong Sempit & Taktikal) ---
    [
      "11111111111111111111111",
      "10000000011111000000001",
      "10111011000000011011101",
      "10111011110101111011101",
      "10000000110G01100000001",
      "1CCCC1100000000011BBBB1",
      "1CCCC1101111111011BBBB1",
      "10000000110R01100000001",
      "11101110000S00001110111",
      "10000000110P01100000001",
      "1AAAA1101111111011DDDD1",
      "1AAAA1100000000011DDDD1",
      "10000000110101100000001",
      "10111011110001111011101",
      "10111011000000011011101",
      "10000000011111000000001",
      "11111111111111111111111"
    ],

    // --- LAYOUT 6: Simpang Sel Eukariot (Persimpangan Berganda) ---
    [
      "11111111111111111111111",
      "1BBBB0000110110000AAAA1",
      "1BBBB0110000000110AAAA1",
      "10000011110101111000001",
      "10110000000G00000001101",
      "10110111111011111101101",
      "10000000011011000000001",
      "11101111000R00011110111",
      "10001100011S11000110001",
      "11101111000P00011110111",
      "10000000011011000000001",
      "10110111111011111101101",
      "10110000000000000001101",
      "10000011110101111000001",
      "1DDDD0110000000110CCCC1",
      "1DDDD0000110110000CCCC1",
      "11111111111111111111111"
    ],

    // --- LAYOUT 7: Rintangan Fotosintesis Daun (Blok Berlapis) ---
    [
      "11111111111111111111111",
      "10000011000000011000001",
      "10CCCC01011111010DDDD01",
      "10CCCC00001G10000DDDD01",
      "11101111100000111110111",
      "10000001110101110000001",
      "10111000000R00000011101",
      "10111011110001111011101",
      "10000011000S00011000001",
      "10111011110001111011101",
      "10111000000P00000011101",
      "10000001110101110000001",
      "11101111100000111110111",
      "10AAAA00001010000BBBB01",
      "10AAAA01011111010BBBB01",
      "10000011000000011000001",
      "11111111111111111111111"
    ],

    // --- LAYOUT 8: Analisis Mikroskopi Pipi (Sektor Terbahagi Taktikal) ---
    [
      "11111111111111111111111",
      "1AAAA0000000000000BBBB1",
      "1AAAA0111101011110BBBB1",
      "10000011000000011000001",
      "10111111011G11011111101",
      "10000000011011000000001",
      "11101111000R00011110111",
      "10001100011011000110001",
      "10100001100S00110000101",
      "10001100011011000110001",
      "11101111000P00011110111",
      "10000000011011000000001",
      "10111111011011011111101",
      "10000011000000011000001",
      "1CCCC0111101011110DDDD1",
      "1CCCC0000000000000DDDD1",
      "11111111111111111111111"
    ],

    // --- LAYOUT 9: Penyahsegarahan Vakuol Sap (Laluan Panjang Berbelok) ---
    [
      "11111111111111111111111",
      "10000000110001100000001",
      "10DDDD10110G01101CCCC01",
      "10DDDD10000000001CCCC01",
      "10111111101110111111101",
      "10000000000R00000000001",
      "11101110111111101110111",
      "10001100001010000110001",
      "10100001100S00110000101",
      "10001100001P10000110001",
      "11101110111111101110111",
      "10000000000000000000001",
      "10111111101110111111101",
      "10BBBB10000000001AAAA01",
      "10BBBB10110101101AAAA01",
      "10000000110001100000001",
      "11111111111111111111111"
    ],

    // --- LAYOUT 10: Grand Labyrinth Sel Akar (Labyrinth Penuh Aras Tinggi) ---
    [
      "11111111111111111111111",
      "1AAAA0001100011000BBBB1",
      "1AAAA0101101011010BBBB1",
      "10000010000G00001000001",
      "10111111011111011111101",
      "10110000000000000001101",
      "10110111101R10111101101",
      "10000001100000110000001",
      "11101100001S10000110111",
      "10000001100P00110000001",
      "10110111101110111101101",
      "10110000000000000001101",
      "10111111011111011111101",
      "10000010000000001000001",
      "1CCCC0101101011010DDDD1",
      "1CCCC0001100011000DDDD1",
      "11111111111111111111111"
    ]
  ];

  // 5a. Penjana Portal Teleport & Power-Up Dinamik (Task 3, 4 & 5)
  function generatePortalsAndPowerups(grid, playerSpawn, answerZones, enemySpawns, layoutIndex = 0, questionIndex = 0) {
    const rows = grid.length;
    const cols = grid[0].length;

    // Set jubin rizab: spawn murid, zon jawapan A/B/C/D, spawn musuh
    const reserved = new Set();
    reserved.add(`${playerSpawn.x},${playerSpawn.y}`);
    ['A', 'B', 'C', 'D'].forEach(k => {
      if (answerZones && answerZones[k]) {
        answerZones[k].forEach(t => reserved.add(`${t.x},${t.y}`));
      }
    });
    if (enemySpawns) {
      ['green', 'purple', 'red'].forEach(k => {
        if (enemySpawns[k]) reserved.add(`${enemySpawns[k].x},${enemySpawns[k].y}`);
      });
    }

    // Kira jarak BFS dari spawn murid untuk memastikan ketercapaian 100%
    const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const queue = [{ x: playerSpawn.x, y: playerSpawn.y, d: 0 }];
    dist[playerSpawn.y][playerSpawn.x] = 0;
    const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

    while (queue.length > 0) {
      const cur = queue.shift();
      for (let i = 0; i < dirs.length; i++) {
        const nx = cur.x + dirs[i].x;
        const ny = cur.y + dirs[i].y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0 && dist[ny][nx] === Infinity) {
          dist[ny][nx] = cur.d + 1;
          queue.push({ x: nx, y: ny, d: cur.d + 1 });
        }
      }
    }

    // Kumpulkan calon jubin koridor boleh jalan
    const candidates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dist[r][c] !== Infinity && !reserved.has(`${c},${r}`)) {
          let walkableNeighbors = 0;
          for (let d = 0; d < dirs.length; d++) {
            const nx = c + dirs[d].x;
            const ny = r + dirs[d].y;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0) {
              walkableNeighbors++;
            }
          }
          if (walkableNeighbors >= 1) {
            candidates.push({ x: c, y: r, d: dist[r][c] });
          }
        }
      }
    }

    // 1. Pasangan Portal Teleport (Portal A & Portal B)
    const farFromSpawn = candidates.filter(c => c.d >= 4);
    const pool = farFromSpawn.length >= 6 ? farFromSpawn : candidates;

    const offsetA = (layoutIndex * 7 + questionIndex * 13 + 3) % pool.length;
    const portalA = {
      x: pool[offsetA].x,
      y: pool[offsetA].y,
      id: 'portal_a',
      color: '#06b6d4',
      secondaryColor: '#22d3ee',
      name: 'Portal A (Sian)'
    };
    reserved.add(`${portalA.x},${portalA.y}`);

    let bestB = null;
    let maxDistB = 0;
    for (let i = 0; i < pool.length; i++) {
      const idx = (offsetA + 5 + i * 3) % pool.length;
      const cand = pool[idx];
      if (reserved.has(`${cand.x},${cand.y}`)) continue;
      const d = getWalkableTileDistance(grid, portalA.x, portalA.y, cand.x, cand.y, 40);
      if (d >= 7 && d > maxDistB) {
        maxDistB = d;
        bestB = cand;
        if (d >= 10) break;
      }
    }
    if (!bestB) {
      bestB = pool.find(c => !reserved.has(`${c.x},${c.y}`)) || candidates[0];
    }
    const portalB = {
      x: bestB.x,
      y: bestB.y,
      id: 'portal_b',
      color: '#a855f7',
      secondaryColor: '#c084fc',
      name: 'Portal B (Ungu)'
    };
    reserved.add(`${portalB.x},${portalB.y}`);

    // 2. Taburan Power-up Rawak & Seimbang (Semua 5 Power-Up Sedia Ada Berpeluang Muncul)
    // Jenis sedia ada dalam projek: 'speed', 'freeze', 'shield', 'radar', 'life'
    const allPowerupTypes = ['speed', 'freeze', 'shield', 'radar', 'life'];

    // Bilangan power-up setiap maze: 2 hingga 3 power-up yang berbeza setiap pusingan
    const numToSpawn = (questionIndex < 4) ? 2 : 3;

    // Rawakkan susunan jenis power-up supaya setiap jenis mempunyai peluang setara untuk dipilih
    const shuffledTypes = [...allPowerupTypes];
    for (let i = shuffledTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledTypes[i];
      shuffledTypes[i] = shuffledTypes[j];
      shuffledTypes[j] = temp;
    }
    const powerupTypes = shuffledTypes.slice(0, numToSpawn);

    const powerups = [];
    const availableCandidates = candidates.filter(c => !reserved.has(`${c.x},${c.y}`) && c.d >= 2);

    powerupTypes.forEach((type, pIdx) => {
      if (availableCandidates.length === 0) return;
      const pickIdx = ((pIdx + 1) * 11 + questionIndex * 5 + layoutIndex * 3) % availableCandidates.length;
      const tile = availableCandidates.splice(pickIdx, 1)[0];
      reserved.add(`${tile.x},${tile.y}`);
      const cfg = POWERUP_CONFIG[type];
      powerups.push({
        id: `powerup_${type}_${pIdx}`,
        type: type,
        x: tile.x,
        y: tile.y,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        glow: cfg.glow,
        duration: cfg.duration,
        collected: false
      });
    });

    return {
      portals: {
        A: portalA,
        B: portalB
      },
      powerups
    };
  }

  // 5. Penyahkod & Pengesah Ketercapaian Maze (BFS Solvability Validator)
  function parseMazeLayout(layoutIndex = 0, questionIndex = 0) {
    const raw = MAZE_LAYOUTS_RAW[layoutIndex % MAZE_LAYOUTS_RAW.length];
    const grid = [];
    const answerZones = { A: [], B: [], C: [], D: [] };
    let playerSpawn = { x: 11, y: 13 };
    const enemySpawns = { green: { x: 11, y: 4 }, purple: { x: 11, y: 10 }, red: { x: 11, y: 7 } };

    for (let r = 0; r < raw.length; r++) {
      const rowStr = raw[r];
      const row = [];
      for (let c = 0; c < rowStr.length; c++) {
        const char = rowStr[c];
        if (char === '1') {
          row.push(1); // Wall
        } else if (char === '0') {
          row.push(0); // Walkable path
        } else if (char === 'S') {
          row.push(0);
          playerSpawn = { x: c, y: r };
        } else if (char === 'A') {
          row.push(0);
          answerZones.A.push({ x: c, y: r });
        } else if (char === 'B') {
          row.push(0);
          answerZones.B.push({ x: c, y: r });
        } else if (char === 'C') {
          row.push(0);
          answerZones.C.push({ x: c, y: r });
        } else if (char === 'D') {
          row.push(0);
          answerZones.D.push({ x: c, y: r });
        } else if (char === 'G') {
          row.push(0);
          enemySpawns.green = { x: c, y: r };
        } else if (char === 'P') {
          row.push(0);
          enemySpawns.purple = { x: c, y: r };
        } else if (char === 'R') {
          row.push(0);
          enemySpawns.red = { x: c, y: r };
        } else {
          row.push(0);
        }
      }
      grid.push(row);
    }

    // Dapatkan titik spawn musuh yang disahkan selamat & jauh dari murid (Task 6 & 7)
    const safeSpawns = calculateSafeEnemySpawns(grid, playerSpawn, answerZones);
    if (safeSpawns) {
      enemySpawns.green = safeSpawns.green;
      enemySpawns.purple = safeSpawns.purple;
      enemySpawns.red = safeSpawns.red;
    }

    // Sahkan ketercapaian 100% menggunakan BFS
    const isValid = validateMazeReachability(grid, playerSpawn, answerZones, enemySpawns);
    if (!isValid) {
      console.warn(`[Maze Validator] Layout ${layoutIndex} gagal ujian BFS, menggunakan susun atur sandaran 0.`);
      return parseMazeLayout(0, questionIndex);
    }

    // Jana portal teleport & power-up dinamik (Task 3, 4 & 5)
    const extra = generatePortalsAndPowerups(grid, playerSpawn, answerZones, enemySpawns, layoutIndex, questionIndex);

    return {
      grid,
      cols: raw[0].length,
      rows: raw.length,
      playerSpawn,
      enemySpawns,
      answerZones,
      portals: extra.portals,
      powerups: extra.powerups,
      layoutIndex: layoutIndex % MAZE_LAYOUTS_RAW.length
    };
  }

  // 6. Algoritma Pengesahan BFS (Menjamin tiada Zon Jawapan / Musuh tersekat)
  function validateMazeReachability(grid, playerSpawn, answerZones, enemySpawns) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ x: playerSpawn.x, y: playerSpawn.y }];
    visited[playerSpawn.y][playerSpawn.x] = true;

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      for (let i = 0; i < dirs.length; i++) {
        const nx = current.x + dirs[i].x;
        const ny = current.y + dirs[i].y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          if (!visited[ny][nx] && grid[ny][nx] === 0) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    // Semak sama ada kesemua 4 Zon Jawapan A, B, C, D boleh dicapai dari spawn murid
    const zoneLetters = ['A', 'B', 'C', 'D'];
    for (let z = 0; z < zoneLetters.length; z++) {
      const letter = zoneLetters[z];
      const tiles = answerZones[letter];
      if (!tiles || tiles.length === 0) return false;
      const reachable = tiles.some(t => visited[t.y] && visited[t.y][t.x]);
      if (!reachable) return false;
    }

    // Semak ketercapaian musuh
    const enemies = [enemySpawns.green, enemySpawns.purple, enemySpawns.red];
    for (let e = 0; e < enemies.length; e++) {
      const sp = enemies[e];
      if (sp && (!visited[sp.y] || !visited[sp.y][sp.x])) {
        return false;
      }
    }

    return true;
  }

  // 7. Algoritma BFS Navigasi Terpendek (Shortest-Path Navigation) dalam kiraan Jubin
  // Mengembalikan senarai koordinat jubin [{x, y}, ...] dari mula ke sasaran
  function findShortestPathBFS(grid, startCol, startRow, targetCol, targetRow, maxDepth = 50) {
    const rows = grid.length;
    const cols = grid[0].length;

    if (startCol === targetCol && startRow === targetRow) {
      return [{ x: startCol, y: startRow }];
    }

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const parent = Array.from({ length: rows }, () => Array(cols).fill(null));

    const queue = [{ x: startCol, y: startRow, dist: 0 }];
    visited[startRow][startCol] = true;

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    let found = false;

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.x === targetCol && cur.y === targetRow) {
        found = true;
        break;
      }

      if (cur.dist >= maxDepth) continue;

      for (let i = 0; i < dirs.length; i++) {
        const nx = cur.x + dirs[i].x;
        const ny = cur.y + dirs[i].y;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          if (!visited[ny][nx] && grid[ny][nx] === 0) {
            visited[ny][nx] = true;
            parent[ny][nx] = { x: cur.x, y: cur.y };
            queue.push({ x: nx, y: ny, dist: cur.dist + 1 });
          }
        }
      }
    }

    if (!found) return null;

    // Bina semula laluan dari sasaran kembali ke titik mula
    const path = [];
    let curr = { x: targetCol, y: targetRow };
    while (curr) {
      path.unshift(curr);
      if (curr.x === startCol && curr.y === startRow) break;
      curr = parent[curr.y][curr.x];
    }

    return path;
  }

  // Jarak sebenar melalui koridor dalam kiraan jubin grid (Shortest Walkable Path Distance)
  function getWalkableTileDistance(grid, fromCol, fromRow, toCol, toRow, maxRange = 50) {
    const path = findShortestPathBFS(grid, fromCol, fromRow, toCol, toRow, maxRange);
    if (!path) return Infinity;
    return path.length - 1; // Bilangan langkah jubin
  }

  // 7b. Algoritma Pemilihan Titik Spawn Musuh Selamat & Terpisah (Task 6 & 7)
  // Menjamin:
  // - Green spawn: jarak terpendek dari murid >= 6 jubin
  // - Purple spawn: jarak terpendek dari murid >= 9 jubin
  // - Red spawn: jarak terpendek dari murid >= 12 jubin
  // - Musuh-ke-musuh: jarak terpisah >= 4 jubin
  // - Di luar dinding, di luar zon jawapan A/B/C/D, di luar titik murid
  function calculateSafeEnemySpawns(grid, playerSpawn, answerZones) {
    const rows = grid.length;
    const cols = grid[0].length;
    const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const queue = [{ x: playerSpawn.x, y: playerSpawn.y, d: 0 }];
    dist[playerSpawn.y][playerSpawn.x] = 0;

    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      for (let i = 0; i < dirs.length; i++) {
        const nx = cur.x + dirs[i].x;
        const ny = cur.y + dirs[i].y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0 && dist[ny][nx] === Infinity) {
          dist[ny][nx] = cur.d + 1;
          queue.push({ x: nx, y: ny, d: cur.d + 1 });
        }
      }
    }

    const zoneSet = new Set();
    ['A', 'B', 'C', 'D'].forEach(k => {
      if (answerZones && answerZones[k]) {
        answerZones[k].forEach(t => zoneSet.add(t.x + ',' + t.y));
      }
    });

    const walkable = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dist[r][c] !== Infinity && !zoneSet.has(c + ',' + r) && !(c === playerSpawn.x && r === playerSpawn.y)) {
          walkable.push({ x: c, y: r, d: dist[r][c] });
        }
      }
    }

    walkable.sort((a, b) => b.d - a.d);

    // 1. Red: Jarak sekurang-kurangnya 12 jubin dari pemain (Task 6)
    const redCand = walkable.filter(t => t.d >= 12);
    const red = redCand.length > 0 ? redCand[Math.floor(redCand.length / 2)] : walkable[0];

    // 2. Purple: Jarak sekurang-kurangnya 9 jubin dari pemain & >= 4 jubin dari Red (Task 6)
    const purCand = walkable.filter(t => 
      t.d >= 9 && 
      !(t.x === red.x && t.y === red.y) && 
      getWalkableTileDistance(grid, t.x, t.y, red.x, red.y, 50) >= 4
    );
    const purple = purCand.length > 0 ? purCand[Math.floor(purCand.length / 2)] : 
      (walkable.find(t => !(t.x === red.x && t.y === red.y)) || walkable[1]);

    // 3. Green: Jarak sekurang-kurangnya 6 jubin dari pemain & >= 4 jubin dari Red & Purple (Task 6)
    const grnCand = walkable.filter(t => 
      t.d >= 6 && 
      !(t.x === red.x && t.y === red.y) && 
      !(t.x === purple.x && t.y === purple.y) && 
      getWalkableTileDistance(grid, t.x, t.y, red.x, red.y, 50) >= 4 &&
      getWalkableTileDistance(grid, t.x, t.y, purple.x, purple.y, 50) >= 4
    );
    const green = grnCand.length > 0 ? grnCand[Math.floor(grnCand.length / 2)] :
      (walkable.find(t => !(t.x === red.x && t.y === red.y) && !(t.x === purple.x && t.y === purple.y)) || walkable[2]);

    return {
      green: { x: green.x, y: green.y, d: green.d },
      purple: { x: purple.x, y: purple.y, d: purple.d },
      red: { x: red.x, y: red.y, d: red.d }
    };
  }

  // 8. Sintesis Audio Web Audio API (Chimes, Glitches, Fanfares)
  class MazeAudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.initialized = true;
        }
      } catch (e) {}
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.12) {
      if (this.muted) return;
      this.init();
      this.resume();
      if (!this.ctx) return;

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
      } catch (e) {}
    }

    playStep() {
      if (this.muted) return;
      this.playTone(280, 'triangle', 0.04, 0.03);
    }

    playCorrect() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.22, 0.16), idx * 70);
      });
    }

    playIncorrect() {
      if (this.muted) return;
      this.playTone(220, 'sawtooth', 0.2, 0.14);
      setTimeout(() => this.playTone(180, 'sawtooth', 0.25, 0.14), 110);
    }

    playVirusAlert() {
      if (this.muted) return;
      this.playTone(480, 'sine', 0.08, 0.09);
      setTimeout(() => this.playTone(640, 'sine', 0.1, 0.09), 60);
    }

    playVirusHit() {
      if (this.muted) return;
      this.playTone(330, 'square', 0.12, 0.15);
      setTimeout(() => this.playTone(220, 'square', 0.15, 0.15), 60);
      setTimeout(() => this.playTone(140, 'sawtooth', 0.25, 0.18), 120);
    }

    playTransition() {
      if (this.muted) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.1), idx * 80);
      });
    }

    playGameOver() {
      if (this.muted) return;
      const notes = [392.00, 349.23, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sawtooth', 0.35, 0.15), idx * 140);
      });
    }

    playVictory() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.18), idx * 95);
      });
    }

    playTeleport() {
      if (this.muted) return;
      // Bunyi warp futuristik: nada meluncur naik laju
      const notes = [330, 440, 587.33, 880, 1174.66];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.12, 0.12), idx * 35);
      });
    }

    playPowerup() {
      if (this.muted) return;
      // Arpeggio ceria kutipan power-up
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.14, 0.15), idx * 50);
      });
    }

    playShieldBreak() {
      if (this.muted) return;
      // Dentuman pelindung pecah
      this.playTone(600, 'triangle', 0.08, 0.18);
      setTimeout(() => this.playTone(250, 'square', 0.18, 0.18), 50);
    }

    playElimination() {
      if (this.muted) return;
      // Bunyi penyingkiran zon jawapan salah
      this.playTone(320, 'sawtooth', 0.15, 0.14);
      setTimeout(() => this.playTone(196, 'sawtooth', 0.22, 0.16), 80);
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }
  }

  // Eksport ke skop global
  global.ARSelNelMazeData = {
    GameState: MazeGameState,
    EnemyState,
    VIRUS_CONFIG,
    POWERUP_CONFIG,
    QUESTIONS: MAZE_QUESTIONS,
    LAYOUTS_COUNT: MAZE_LAYOUTS_RAW.length,
    MAZE_LAYOUTS_RAW,
    parseMazeGrid: (idx = 0, qIdx = 0) => parseMazeLayout(idx, qIdx),
    generatePortalsAndPowerups,
    findShortestPathBFS,
    getWalkableTileDistance,
    calculateSafeEnemySpawns,
    validateMazeReachability,
    Audio: new MazeAudioEngine()
  };

})(window);
