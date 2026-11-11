/**
 * ==============================================================================
 * CellQuest AR Adventure — Misi Jelajah Dunia Sel
 * 3D Engine, Virtual Room Walkthrough, Interactive Stations & WebXR AR
 * ==============================================================================
 */

(function () {
  'use strict';

  // 1. DATA STESEN PEMBELAJARAN KSSM (DEFAULT / INITIAL SEED)
  const DEFAULT_STATIONS = [
    {
      id: 'stn-1-nucleus',
      number: 1,
      title: 'Nukleus',
      organelle: 'Nukleus',
      color: '#8b5cf6',
      colorHex: 0x8b5cf6,
      icon: '🧬',
      description: 'Nukleus merupakan pusat kawalan sel yang paling utama. Di dalamnya tersimpan asid deoksiribonukleik (DNA) yang membawa maklumat genetik bagi mengawal semua proses biologi dan sintesis protein sel.',
      question: 'Apakah fungsi utama nukleus?',
      options: [
        'A. Menghasilkan tenaga',
        'B. Mengawal aktiviti sel',
        'C. Menghasilkan makanan',
        'D. Melindungi dinding sel'
      ],
      correct: 1, // B
      explanation: 'Jawapan Tepat: B. Nukleus mengawal semua aktiviti sel. Menghasilkan tenaga dilakukan oleh mitokondrion, manakala menghasilkan makanan dilakukan oleh kloroplas melalui fotosintesis.',
      pos: { x: -7.5, z: 6, rotY: Math.PI / 2 }
    },
    {
      id: 'stn-2-membrane',
      number: 2,
      title: 'Membran Sel',
      organelle: 'Membran Sel',
      color: '#3b82f6',
      colorHex: 0x3b82f6,
      icon: '🛡️',
      description: 'Lapisan nipis dan fleksibel yang mengelilingi protoplasma sel. Membran ini bersifat telap memilih (separa telap) dan bertindak seperti pengawal keselamatan pintu gerbang sel.',
      question: 'Apakah fungsi membran sel?',
      options: [
        'A. Mengawal pergerakan bahan masuk dan keluar dari sel',
        'B. Menghasilkan cahaya',
        'C. Menyimpan klorofil',
        'D. Membina dinding sel'
      ],
      correct: 0, // A
      explanation: 'Jawapan Tepat: A. Membran sel mengawal pergerakan bahan masuk dan keluar dari sel supaya nutrien penting dapat diserap dan bahan kumuh dapat disingkirkan.',
      pos: { x: -7.5, z: 2, rotY: Math.PI / 2 }
    },
    {
      id: 'stn-3-cytoplasm',
      number: 3,
      title: 'Sitoplasma',
      organelle: 'Sitoplasma',
      color: '#eab308',
      colorHex: 0xeab308,
      icon: '💧',
      description: 'Bahan seperti jeli yang merangkumi ruang di antara membran sel dan membran nukleus. Mengandungi 70-80% air, ion terlarut, dan pelbagai enzim kimia penting.',
      question: 'Apakah sitoplasma?',
      options: [
        'A. Lapisan luar dinding sel',
        'B. Struktur yang mengandungi klorofil',
        'C. Bahan seperti jeli tempat banyak tindak balas kimia berlaku',
        'D. Bahagian yang menghasilkan cahaya'
      ],
      correct: 2, // C
      explanation: 'Jawapan Tepat: C. Sitoplasma ialah bahan seperti jeli di mana organel sel terapung dan merupakan medium berlakunya pelbagai tindak balas kimia serta metabolisme sel.',
      pos: { x: -7.5, z: -2, rotY: Math.PI / 2 }
    },
    {
      id: 'stn-4-mitochondria',
      number: 4,
      title: 'Mitokondrion',
      organelle: 'Mitokondrion',
      color: '#f97316',
      colorHex: 0xf97316,
      icon: '⚡',
      description: 'Organel berbentuk silinder bujur yang dikenali sebagai "Pusat Tenaga Sel". Mitokondrion mempunyai dua lapisan membran; membran dalamnya berlipat-lipat membentuk krista.',
      question: 'Apakah fungsi mitokondrion?',
      options: [
        'A. Mengawal pembahagian cahaya',
        'B. Menyimpan pigmen hijau',
        'C. Membentuk dinding sel',
        'D. Menjalankan respirasi sel untuk membebaskan tenaga'
      ],
      correct: 3, // D
      explanation: 'Jawapan Tepat: D. Mitokondrion menjalankan respirasi sel dengan menguraikan molekul glukosa dan oksigen untuk membebaskan tenaga kimia (ATP) bagi kegunaan sel hidup.',
      pos: { x: -7.5, z: -6, rotY: Math.PI / 2 }
    },
    {
      id: 'stn-5-chloroplast',
      number: 5,
      title: 'Kloroplas',
      organelle: 'Kloroplas',
      color: '#22c55e',
      colorHex: 0x22c55e,
      icon: '🌿',
      description: 'Organel hijau berbentuk cakera kanta cembung yang mengandungi pigmen klorofil. Hanya dijumpai pada sel tumbuhan hijau dan fitoplankton untuk fotosintesis.',
      question: 'Mengapakah kloroplas penting kepada sel tumbuhan?',
      options: [
        'A. Mengawal semua aktiviti sel',
        'B. Menjalankan fotosintesis',
        'C. Menghasilkan protein sahaja',
        'D. Mengawal pergerakan bahan'
      ],
      correct: 1, // B
      explanation: 'Jawapan Tepat: B. Kloroplas mengandungi pigmen hijau (klorofil) yang menyerap tenaga cahaya matahari untuk menjalankan proses fotosintesis bagi menghasilkan makanan (glukosa).',
      pos: { x: 7.5, z: -6, rotY: -Math.PI / 2 }
    },
    {
      id: 'stn-6-cellwall',
      number: 6,
      title: 'Dinding Sel',
      organelle: 'Dinding Sel',
      color: '#92400e',
      colorHex: 0x92400e,
      icon: '🧱',
      description: 'Lapisan tegar yang tebal di bahagian paling luar sel tumbuhan. Terbina daripada gentian selulosa yang kuat, telap sepenuhnya kepada air dan bahan larut.',
      question: 'Apakah fungsi dinding sel tumbuhan?',
      options: [
        'A. Memberikan sokongan dan mengekalkan bentuk sel',
        'B. Menghasilkan tenaga',
        'C. Mengawal aktiviti sel',
        'D. Menjalankan respirasi'
      ],
      correct: 0, // A
      explanation: 'Jawapan Tepat: A. Dinding sel memberikan kekuatan mekanikal, sokongan struktur, dan mengekalkan bentuk tetap pada sel tumbuhan serta melindunginya daripada pecah.',
      pos: { x: 7.5, z: -2, rotY: -Math.PI / 2 }
    },
    {
      id: 'stn-7-vacuole',
      number: 7,
      title: 'Vakuol',
      organelle: 'Vakuol',
      color: '#06b6d4',
      colorHex: 0x06b6d4,
      icon: '🫧',
      description: 'Kantung bermembran (tonoplas) yang besar dalam sel tumbuhan matang berisi cecair sap sel. Sel haiwan biasanya mempunyai vakuol kecil dan sementara atau tiada langsung.',
      question: 'Apakah fungsi utama vakuol besar dalam sel tumbuhan?',
      options: [
        'A. Menghasilkan cahaya',
        'B. Mengawal aktiviti sel',
        'C. Menyimpan sap sel dan membantu mengekalkan kesegahan sel',
        'D. Menghasilkan klorofil'
      ],
      correct: 2, // C
      explanation: 'Jawapan Tepat: C. Vakuol pusat menyimpan sap sel (air, mineral dan gula terlarut). Apabila vakuol penuh, ia mengenakan tekanan turgor untuk mengekalkan kesegahan sel tumbuhan.',
      pos: { x: 7.5, z: 2, rotY: -Math.PI / 2 }
    },
    {
      id: 'stn-8-comparison',
      number: 8,
      title: 'Sel Haiwan vs Sel Tumbuhan',
      organelle: 'Perbandingan Sel',
      color: '#ec4899',
      colorHex: 0xec4899,
      icon: '⚖️',
      description: 'Sel tumbuhan mempunyai dinding sel, kloroplas dan vakuol pusat besar dengan bentuk tetap. Sel haiwan tidak mempunyai dinding sel mahupun kloroplas, mempunyai vakuol kecil, dan bentuknya tidak tetap.',
      question: 'Antara berikut, struktur manakah terdapat pada sel tumbuhan biasa tetapi tiada pada sel haiwan?',
      options: [
        'A. Membran sel',
        'B. Sitoplasma',
        'C. Nukleus',
        'D. Dinding sel'
      ],
      correct: 3, // D
      explanation: 'Jawapan Tepat: D. Dinding sel dan kloroplas hanya terdapat pada sel tumbuhan biasa. Nukleus, membran sel, dan sitoplasma hadir pada kedua-dua sel haiwan dan sel tumbuhan.',
      pos: { x: 7.5, z: 6, rotY: -Math.PI / 2 }
    }
  ];

  // 2. AUDIO SYNTHESIZER (WEB AUDIO API - ZERO ASSET DEPENDENCY)
  const SoundFX = {
    ctx: null,
    muted: false,
    init() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      } catch (_) {}
    },
    ensure() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },
    playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
      if (this.muted || !this.ctx) return;
      this.ensure();
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
      } catch (_) {}
    },
    correct() {
      if (this.muted) return;
      this.playTone(523.25, 'triangle', 0.15, 0.2); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.2), 100); // E5
      setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.25), 200); // G5
      setTimeout(() => this.playTone(1046.50, 'triangle', 0.4, 0.3), 320); // C6
    },
    incorrect() {
      if (this.muted) return;
      this.playTone(311.13, 'sawtooth', 0.2, 0.15);
      setTimeout(() => this.playTone(277.18, 'sawtooth', 0.35, 0.15), 180);
    },
    interact() {
      if (this.muted) return;
      this.playTone(440, 'sine', 0.1, 0.1);
      setTimeout(() => this.playTone(880, 'sine', 0.12, 0.12), 80);
    },
    victory() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.3, 0.25), idx * 120);
      });
    },
    powerUp() {
      if (this.muted) return;
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'sine', 0.15, 0.18), idx * 75);
      });
    },
    fanfare() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, idx) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.22, 0.2), idx * 90);
      });
    }
  };

  // 3. GAME STATE
  const State = {
    stations: JSON.parse(JSON.stringify(DEFAULT_STATIONS)),
    activeStationIndex: -1,
    nearbyStationIndex: -1,
    completedStations: new Set(),
    score: 0,
    startTime: Date.now(),
    timerInterval: null,
    durationSeconds: 0,
    attemptsCount: {},
    isPaused: false,
    isCompleted: false,
    mode: '3d', // '3d' | 'camera-ar' | 'ar'
    user: null,
    // Mod A: Secret Door & Cell Core Chamber State
    cellCoreActivated: false,
    cellCoreChamberUnlocked: false,
    nearCellCoreCrystal: false,
    nearSecretDoor: false,
    hasShownChamberWelcome: false,
    // Misi Akhir: Multi-Treasure Chest ARSELNel State (Fasa A.4: 3 Peti Bonus x 1 Soalan)
    treasureHuntUnlocked: false,
    treasureHuntActive: false,
    treasureHuntCompleted: false,
    treasureHuntBonusClaimed: false,
    treasureHuntCurrentChestIndex: 0, // 0 = Peti 1, 1 = Peti 2, 2 = Peti 3
    treasureHuntCompletedCount: 0,    // 0 / 3, 1 / 3, 2 / 3, 3 / 3
    treasureHuntChests: [
      {
        id: 1,
        slotNumber: 1,
        title: 'Peti Harta Karun 1',
        subtitle: 'Misi Bonus 1 / 3 • Barat Daya',
        azimuthDeg: 225,
        elevationDeg: -12,
        radius: 4.8,
        directionName: 'Barat Daya',
        completed: false,
        points: 100,
        question: {
          question: 'Organel manakah yang digelar sebagai "Pusat Tenaga Sel" kerana menjalankan respirasi sel untuk membebaskan molekul ATP?',
          options: [
            'Ribosom',
            'Mitokondrion',
            'Kloroplas',
            'Vakuol'
          ],
          correct: 1, // Mitokondrion
          explanation: 'Mitokondrion berfungsi menguraikan glukosa dan oksigen melalui respirasi sel untuk membebaskan tenaga kimia (ATP) bagi aktiviti sel hidup.'
        }
      },
      {
        id: 2,
        slotNumber: 2,
        title: 'Peti Harta Karun 2',
        subtitle: 'Misi Bonus 2 / 3 • Timur Laut',
        azimuthDeg: 45,
        elevationDeg: 14,
        radius: 5.6,
        directionName: 'Timur Laut',
        completed: false,
        points: 100,
        question: {
          question: 'Apakah perbezaan utama antara sel tumbuhan dan sel haiwan dari segi sokongan fizikal luar?',
          options: [
            'Sel tumbuhan mempunyai dinding sel selulosa tegap, manakala sel haiwan tiada.',
            'Sel haiwan mempunyai dinding selulosa, manakala sel tumbuhan hanya membran nipis.',
            'Sel tumbuhan tidak mempunyai nukleus.',
            'Sel haiwan mempunyai kloroplas besar.'
          ],
          correct: 0, // A
          explanation: 'Sel tumbuhan mempunyai dinding sel daripada gentian selulosa tegap yang mengekalkan bentuk dan memberikan sokongan mekanikal, manakala sel haiwan hanya mempunyai membran sel.'
        }
      },
      {
        id: 3,
        slotNumber: 3,
        title: 'Peti Harta Karun 3',
        subtitle: 'Misi Bonus 3 / 3 • Tenggara (Kemuncak)',
        azimuthDeg: 135,
        elevationDeg: -6,
        radius: 6.2,
        directionName: 'Tenggara',
        completed: false,
        points: 100,
        question: {
          question: 'Di manakah terletaknya asid deoksiribonukleik (DNA) yang mengawal semua sintesis protein dan pewarisan ciri dalam sel?',
          options: [
            'Di dalam vakuol',
            'Di dalam sitoplasma secara bebas',
            'Di dalam nukleus',
            'Pada membran sel'
          ],
          correct: 2, // C
          explanation: 'Nukleus mengandungi kromosom yang membawa DNA, bertindak sebagai pusat kawalan utama bagi semua proses biologi dan metabolisme sel.'
        }
      }
    ]
  };

  // 4. THREE.JS ENGINE COMPONENTS
  let scene, camera, renderer;
  let labEnvironmentGroup = null; // Group containing the full 3D lab room for AR scaling
  let player = {
    x: 0,
    y: 1.6, // Eye height
    z: 8.5, // Start near entrance door (z=8.5)
    rotY: 0, // In Three.js, rotY=0 looks down -Z towards room center (z=0) & exit door (z=-10.8)!
    pitch: 0,
    speed: 0.12,
    turnSpeed: 0.035,
    keys: { forward: false, backward: false, left: false, right: false }
  };
  let stationMeshes = [];
  let exitDoorMeshes = null;
  let animatedObjects = [];
  let reticleMesh = null;
  let xrSession = null;
  let xrRefSpace = null;
  let xrHitTestSource = null;

  // ------------------------------------------------------------------------------
  // REAL AUGMENTED REALITY (CAMERA PASSTHROUGH & 3D CELL OVERLAY) ENGINE STATE
  // ------------------------------------------------------------------------------
  let arObjectGroup = null;
  let arAnimalHolder = null;
  let arPlantHolder = null;
  let arMiniLabHolder = null;
  let arPickableObjects = [];
  const arState = {
    activeModel: 'animal', // 'animal' | 'plant' | 'minilab'
    selectedOrganelle: null,
    autoRotate: true,
    scale: 1.0,
    isPlaced: false
  };
  const arRaycaster = new THREE.Raycaster();
  const arPointer = new THREE.Vector2();

  // ==============================================================================
  // AR WORLD-LOCKED EXPLORATION SYSTEM — Stesen berasingan dalam dunia AR
  // ==============================================================================
  // Setiap stesen AR diletakkan pada sudut berbeza relatif kepada titik mula.
  // Dalam Mod Orientasi: sudut adalah relatif kepada arah hadapan kamera semasa sesi dimulakan.
  // Dalam Mod WebXR Spasial: koordinat dalam ruang XR sebenar.

  // Susun atur 8 stesen AR Orientasi Dunia — Fasa A.2 Jauhkan Stesen, Sebaran 360° & 3-Aras Ketinggian
  // 1. Jarak Sebenar Jauh (>= 4.0m): 4.5m hingga 10.0m merentasi 4 kuadran
  // 2. Sebaran 360° Penuh: Hadapan, Kanan, Belakang, Kiri merentasi semua sudut
  // 3. Tiga Aras Ketinggian: Rendah (0.3m-0.7m), Sederhana (1.2m-1.6m), Tinggi (2.2m-3.2m)
  const AR_WORLD_STATIONS = [
    { id: 'stn-1-nucleus',      slotNumber: 1, stationNumber: 1, markerId: 1, directionName: 'Kiri Hadapan',   stationKey: 'nucleus',      azimuthDeg: 325, angleDeg: 325, elevationDeg: -13, virtualHeight: 0.5, heightTier: 'Rendah',    radius: 4.5,  distanceTier: 'Dekat',       label: 'Nukleus',                      color: 0x8b5cf6, icon: '🧬' },
    { id: 'stn-2-membrane',     slotNumber: 2, stationNumber: 2, markerId: 4, directionName: 'Kanan Hadapan',  stationKey: 'membrane',     azimuthDeg: 40,  angleDeg: 40,  elevationDeg: 1,   virtualHeight: 1.6, heightTier: 'Sederhana', radius: 6.5,  distanceTier: 'Sederhana',   label: 'Membran Sel',                  color: 0x3b82f6, icon: '🛡️' },
    { id: 'stn-3-cytoplasm',    slotNumber: 3, stationNumber: 3, markerId: 6, directionName: 'Kiri',           stationKey: 'cytoplasm',    azimuthDeg: 270, angleDeg: 270, elevationDeg: -9,  virtualHeight: 0.3, heightTier: 'Rendah',    radius: 8.0,  distanceTier: 'Jauh',        label: 'Sitoplasma',                   color: 0xeab308, icon: '💧' },
    { id: 'stn-4-mitochondria', slotNumber: 4, stationNumber: 4, markerId: 0, directionName: 'Kanan Belakang', stationKey: 'mitochondria', azimuthDeg: 135, angleDeg: 135, elevationDeg: 5,   virtualHeight: 2.2, heightTier: 'Tinggi',    radius: 7.5,  distanceTier: 'Jauh',        label: 'Mitokondrion',                 color: 0xf97316, icon: '⚡' },
    { id: 'stn-5-chloroplast',  slotNumber: 5, stationNumber: 5, markerId: 5, directionName: 'Belakang',       stationKey: 'chloroplast',  azimuthDeg: 175, angleDeg: 175, elevationDeg: 10,  virtualHeight: 3.2, heightTier: 'Tinggi',    radius: 9.5,  distanceTier: 'Sangat Jauh', label: 'Kloroplas',                    color: 0x22c55e, icon: '🌿' },
    { id: 'stn-6-cellwall',     slotNumber: 6, stationNumber: 6, markerId: 3, directionName: 'Kanan',          stationKey: 'wall',         azimuthDeg: 95,  angleDeg: 95,  elevationDeg: -5,  virtualHeight: 0.7, heightTier: 'Rendah',    radius: 10.0, distanceTier: 'Sangat Jauh', label: 'Dinding Sel',                  color: 0x92400e, icon: '🧱' },
    { id: 'stn-7-vacuole',      slotNumber: 7, stationNumber: 7, markerId: 7, directionName: 'Kiri Belakang',  stationKey: 'vacuole',      azimuthDeg: 240, angleDeg: 240, elevationDeg: -3,  virtualHeight: 1.2, heightTier: 'Sederhana', radius: 5.5,  distanceTier: 'Sederhana',   label: 'Vakuol',                       color: 0x06b6d4, icon: '🫧' },
    { id: 'stn-8-comparison',   slotNumber: 8, stationNumber: 8, markerId: 2, directionName: 'Kiri Belakang',  stationKey: 'comparison',   azimuthDeg: 200, angleDeg: 200, elevationDeg: 10,  virtualHeight: 3.0, heightTier: 'Tinggi',    radius: 9.0,  distanceTier: 'Jauh',        label: 'Retikulum Endoplasma',         color: 0xec4899, icon: '⚖️' }
  ];

  // World-locked AR state — dikekalkan sepanjang sesi
  const arWorldState = {
    active: false,               // Adakah Mod Penerokaan Dunia AR aktif?
    subMode: 'orientation',      // 'orientation' (Mod C) | 'marker' (Mod B) | 'spatial' (Mod A)
    baseHeadingDeg: 0,           // Arah hadapan kalibrasi (dalam darjah sensor)
    baseSensorAzimuthDeg: 0,     // Azimut sensor rujukan semasa butang Kalibrasi ditekan
    baseSensorElevationDeg: 0,   // Elevasi sensor rujukan semasa butang Kalibrasi ditekan
    rawSensorAzimuthDeg: 0,      // Azimut mentah daripada kuaternion DeviceOrientation (terkompensasi orientasi skrin)
    rawSensorElevationDeg: 0,    // Elevasi mentah daripada kuaternion DeviceOrientation (terkompensasi orientasi skrin)
    smoothedSensorAzimuthDeg: null,
    smoothedSensorElevationDeg: null,
    screenOrientationAngle: 0,   // 0 (Portrait), 90 (Landscape Left), -90/270 (Landscape Right), 180 (Upside Down)
    currentHeadingDeg: 0,        // Azimut relatif semasa kamera (0°=Hadapan, 90°=Kanan, 180°=Belakang, 270°=Kiri)
    currentPitchDeg: 0,          // Elevasi relatif semasa kamera (-60° hingga +60° dalam darjah)
    manualYawDeg: 0,             // Kawalan pusing manual / duduk (darjah)
    manualPitchDeg: 0,           // Kawalan dongak manual (darjah)
    hasCalibrated: false,        // Sudahkah pengguna kalibrasi arah?
    sensorReceived: false,       // Adakah peristiwa DeviceOrientation sebenar diterima?
    isSimulationFallback: false, // Label jujur jika sensor tiada (Mod Simulasi Manual)
    postureMode: 'seated',       // 'seated' (Duduk) | 'standing' (Berdiri)
    stationGroups: [],           // Array THREE.Group untuk setiap stesen dalam world space
    stationVisibility: new Array(8).fill(false),
    discoveredStations: new Set(), // Set stationNumber yang telah ditemui melalui kamera
    targetStationIdx: 0,         // Indeks stesen yang sedang diburu pada Smart Radar (Lalai: Stesen 1 Nukleus / auto-next)
    radarPanelExpanded: false,   // Lalai: Paparan ringkas (compact) di sebelah radar bulat; boleh dikembangkan (expanded)
    horizontalToleranceDeg: 14,  // Toleransi sudut mendatar (azimut ±14°) untuk penemuan stesen
    verticalToleranceDeg: 12,    // Toleransi sudut menegak (elevasi ±12°) untuk penemuan stesen
    activeStation: null,         // Stesen yang sedang dalam pandangan
    focusedStationIdx: -1,       // Indeks stesen yang sedang difokus/diperbesar
    focusedStationScale: 1.0,    // Skala zum pemeriksaan bagi stesen aktif
    compassEl: null,             // Elemen kompas/radar HTML
    smartRadarPanelEl: null,     // Panel navigasi Smart Radar / AR Organel Hunter
    detectedBanner: null,        // Banner "Stesen Ditemui!"
    trackingBannerEl: null,      // Banner status tracking & arahan pemulihan
    fovThresholdDeg: 36,         // Sudut pandang untuk stesen dianggap dalam medan pandangan kamera
    lastDetectedIdx: -1,         // Indeks stesen terakhir yang dikesan
    lastExitTargetUrl: null,     // URL destinasi apabila keluar ke CellQuest
    spatialOrigin: new THREE.Vector3(0, 0, -1.5), // Pusat ruang bagi Mod A (Spatial AR)
    spatialAnchors: [],          // Senarai WebXR XRAnchor jika disokong
    // Misi Akhir: Peti Harta Karun ARSELNel
    isTreasureHuntActive: false,
    treasureChestGroup: null,
    treasureChestConfig: {
      stationKey: 'treasure_chest',
      stationNumber: 99,
      slotNumber: 9,
      label: 'Peti ARSELNel',
      directionName: 'Kiri Hadapan',
      azimuthDeg: 330,
      elevationDeg: 8,
      radius: 5.0,
      icon: '🎁',
      color: 0xf59e0b
    },
    isChestLidOpen: false,
    chestLidPivot: null,
    chestLight: null,
    chestParticles: []
  };

  // Konfigurasi transform khusus mengikut model untuk Mod B (Marker AR)
  // Struktur: MarkerAnchor -> ModelOrientationGroup -> ModelScaleGroup -> GLBScene
  const MARKER_MODEL_CONFIG = {
    nucleus:      { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    membrane:     { scale: 0.18, offsetY: 0.14, rotCorrection: [0, 0, 0] },
    cytoplasm:    { scale: 0.19, offsetY: 0.14, rotCorrection: [0, 0, 0] },
    mitochondria: { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    chloroplast:  { scale: 0.19, offsetY: 0.14, rotCorrection: [0, 0, 0] },
    wall:         { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    vacuole:      { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    comparison:   { scale: 0.18, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    animal:       { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    plant:        { scale: 0.19, offsetY: 0.15, rotCorrection: [0, 0, 0] },
    er:           { scale: 0.18, offsetY: 0.15, rotCorrection: [0, 0, 0] }
  };

  // Marker AR (Mod B — iPad Safari 6DOF Fiducial Tracking) state
  const arMarkerState = {
    active: false,
    detector: null,
    posit: null,
    procCanvas: null,
    procCtx: null,
    markerSizeMeters: 0.14,      // 14cm fizikal saiz kad penanda
    anchors: [],                 // 8 THREE.Group (MarkerAnchor) yang dikemas kini dengan pose 6DOF marker
    trackedMap: {},              // markerId -> { lastSeen, pose, visible, error, confidence }
    activeMarkerIds: [],         // Senarai markerId yang sah pada frame semasa
    simulatedMarkerId: null,     // Untuk ujian makmal / simulasi kad pada desktop
    simulatedPoseOffset: { x: 0, y: 0, z: -0.65, rotY: 0, cardRotDeg: 0, tableTiltDeg: 55 },
    simulatedCornersMap: {},     // markerId -> 4 penjuru 2D untuk ujian POSIT penuh
    maxReprojError: 42,          // Had ralat unjuran semula POSIT untuk penapisan keyakinan
    gracePeriodMs: 340,          // Tempoh tangguh pendek supaya model tidak berkelip apabila hilang 1-2 frame
    lastDetectTime: 0
  };

  // DOM untuk AR Penerokaan Dunia
  const arWorldDOM = {};

  // KSSM Tingkatan 1 Bab 2 Organelle Facts & Biology Specifications
  const ORGANELLE_DATA = {
    nucleus: {
      stationNumber: 1,
      name: 'Nukleus',
      icon: '🧬',
      colorHex: 0x8b5cf6,
      color: '#8b5cf6',
      description: 'Pusat kawalan sel yang mengandungi bahan genetik (DNA). Mengawal semua proses dan aktiviti sel.',
      fact: 'Nukleus terdapat dalam kedua-dua sel haiwan dan sel tumbuhan.'
    },
    membrane: {
      stationNumber: 2,
      name: 'Membran Sel',
      icon: '🛡️',
      colorHex: 0x3b82f6,
      color: '#3b82f6',
      description: 'Lapisan luar separa telap yang mengawal pergerakan bahan masuk dan keluar dari sel.',
      fact: 'Membran sel bersifat telap memilih dan terdapat pada sel haiwan dan tumbuhan.'
    },
    cytoplasm: {
      stationNumber: 3,
      name: 'Sitoplasma',
      icon: '💧',
      colorHex: 0xeab308,
      color: '#eab308',
      description: 'Bahan seperti jeli yang mengisi ruang sel. Medium berlakunya tindak balas biokimia dan metabolisme sel.',
      fact: 'Semua organel sel terapung di dalam sitoplasma.'
    },
    mitochondria: {
      stationNumber: 4,
      name: 'Mitokondrion',
      icon: '⚡',
      colorHex: 0xf97316,
      color: '#f97316',
      description: 'Pusat penjanaan tenaga sel ("Powerhouse"). Menjalankan respirasi sel untuk membebaskan tenaga kimia (ATP).',
      fact: 'Bentuknya bujur dengan lipatan krista di dalamnya.'
    },
    chloroplast: {
      stationNumber: 5,
      name: 'Kloroplas',
      icon: '🌿',
      colorHex: 0x22c55e,
      color: '#22c55e',
      description: 'Mengandungi klorofil untuk menyerap tenaga cahaya matahari bagi menjalankan proses fotosintesis.',
      fact: 'Hanya terdapat pada sel tumbuhan hijau, TIDAK terdapat pada sel haiwan.'
    },
    wall: {
      stationNumber: 6,
      name: 'Dinding Sel',
      icon: '🧱',
      colorHex: 0x92400e,
      color: '#92400e',
      description: 'Lapisan tegar selulosa di bahagian paling luar sel tumbuhan yang memberikan sokongan, kekuatan dan bentuk tetap.',
      fact: 'Dinding sel telap sepenuhnya dan hanya wujud pada sel tumbuhan.'
    },
    vacuole: {
      stationNumber: 7,
      name: 'Vakuol',
      icon: '🫧',
      colorHex: 0x06b6d4,
      color: '#06b6d4',
      description: 'Kantung bermembran berisi cecair sap sel. Pada sel tumbuhan matang, vakuol bersaiz besar untuk mengekalkan kesegahan.',
      fact: 'Sel tumbuhan mempunyai vakuol pusat besar; sel haiwan mempunyai vakuol kecil dan sementara.'
    },
    centrioles: {
      stationNumber: 8,
      name: 'Sentriol',
      icon: '🧭',
      colorHex: 0xfacc15,
      color: '#facc15',
      description: 'Sepasang struktur silinder yang membantu pembentukan gentian gelendong semasa pembahagian sel haiwan.',
      fact: 'Hanya hadir dalam sel haiwan.'
    },
    lysosome: {
      stationNumber: 8,
      name: 'Lisosom',
      icon: '✨',
      colorHex: 0xec4899,
      color: '#ec4899',
      description: 'Vesikel mengandungi enzim pencernaan untuk menguraikan zarah makanan atau bahan sel usang.',
      fact: 'Bertindak sebagai sistem pelupusan sel haiwan.'
    },
    animal: {
      stationNumber: 8,
      name: 'Sel Haiwan',
      icon: '🐾',
      colorHex: 0x3b82f6,
      color: '#3b82f6',
      description: 'Sel haiwan mempunyai membran sel, sitoplasma, nukleus dan mitokondrion. Ia tidak mempunyai dinding sel mahupun kloroplas, menyebabkan bentuknya tidak tetap.',
      fact: 'Sel haiwan mempunyai sentriol tetapi tiada vakuol pusat yang besar.'
    },
    plant: {
      stationNumber: 6,
      name: 'Sel Tumbuhan',
      icon: '🌿',
      colorHex: 0x22c55e,
      color: '#22c55e',
      description: 'Sel tumbuhan mempunyai dinding sel selulosa yang tegar, kloroplas untuk fotosintesis, dan vakuol pusat yang besar untuk mengekalkan kesegahan sel.',
      fact: 'Bentuk sel tumbuhan adalah tetap kerana disokong oleh dinding sel.'
    },
    comparison: {
      stationNumber: 8,
      name: 'Retikulum Endoplasma & Perbandingan Sel',
      icon: '⚖️',
      colorHex: 0xec4899,
      color: '#ec4899',
      description: 'Stesen 8 menggabungkan rangkaian membran Retikulum Endoplasma serta perbandingan struktur penuh Sel Haiwan dan Sel Tumbuhan.',
      fact: 'Sel tumbuhan mempunyai dinding sel, kloroplas dan vakuol besar; sel haiwan tiada dinding sel atau kloroplas.'
    },
    er: {
      stationNumber: 8,
      name: 'Retikulum Endoplasma',
      icon: '🧬',
      colorHex: 0x38bdf8,
      color: '#38bdf8',
      description: 'Rangkaian membran berlipat yang bersambung dengan membran nukleus untuk mengangkut protein dan mensintesis lipid.',
      fact: 'Hadir dalam kedua-dua sel haiwan dan sel tumbuhan.'
    }
  };

  const ANIMAL_MESH_MAP = {
    CellBody_Inner: 'cytoplasm',
    CellBody_Outer: 'membrane',
    Centrioles_01: 'centrioles',
    Centrioles_02: 'centrioles',
    EndoplasmicReticulum: 'er',
    GolgiApparatus: 'golgi',
    Lysosome_01: 'lysosome',
    Lysosome_02: 'lysosome',
    Mitochondria_OuterMembrane: 'mitochondria',
    Mitochondrion: 'mitochondria',
    Nucleus: 'nucleus',
    Nucleus_Cutaway: 'nucleus',
    Nucleus_Inner: 'nucleus',
    Nucleus_Outer: 'nucleus',
    Sphere001: 'vacuole',
    'Sphere.001': 'vacuole'
  };

  const PLANT_HOTSPOTS = [
    { id: 'wall', pos: [1.32, 0.45, 0.82], radius: 0.28 },
    { id: 'membrane', pos: [1.18, 0.15, 0.72], radius: 0.24 },
    { id: 'vacuole', pos: [-0.05, 0.18, -0.05], radius: 0.44 },
    { id: 'nucleus', pos: [0.72, 0.36, -0.48], radius: 0.32 },
    { id: 'chloroplast', pos: [-0.82, 0.48, 0.65], radius: 0.28 },
    { id: 'chloroplast', pos: [-0.75, -0.35, -0.55], radius: 0.26 },
    { id: 'mitochondria', pos: [0.55, -0.32, 0.25], radius: 0.24 },
    { id: 'mitochondria', pos: [-0.60, -0.28, 0.20], radius: 0.22 },
    { id: 'cytoplasm', pos: [-0.58, 0.12, 0.58], radius: 0.26 }
  ];

  // Mobile Joystick & Touch Controls State
  const joystickState = {
    active: false,
    touchId: null,
    x: 0, // -1 (left) to +1 (right)
    y: 0  // -1 (backward) to +1 (forward)
  };
  const touchLookState = {
    active: false,
    touchId: null,
    prevX: 0,
    prevY: 0
  };

  // Camera & Device Orientation (Gyro) State
  let cameraStream = null;
  const gyroState = {
    supported: false,
    active: false,
    initialAlpha: null,
    alpha: 0,
    beta: 0,
    gamma: 0,
    baseRotY: 0
  };
  let arScaleMode = 'mini'; // 'mini' | 'room'

  // Modal 3D Organelle Preview Engine
  let previewScene = null;
  let previewCamera = null;
  let previewRenderer = null;
  let previewModelGroup = null;
  let previewAnimId = null;

  // DOM Elements
  const DOM = {};

  // ==============================================================================
  // INITIALIZATION & SETUP
  // ==============================================================================

  async function init() {
    cacheDOM();
    SoundFX.init();
    bindEvents();
    loadUser();
    await loadCMSStations();
    setupThree();
    buildLaboratoryRoom();
    buildStations();
    buildARSystem();
    buildMiniBadgeStrip();
    initStationPreview();
    hideLoadingScreen();
    animate();

    // Check URL search params for direct mode launch (e.g. ?mode=3d, ?mode=camera-ar, ?mode=marker-ar, ?mode=how)
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === '3d') {
      launchMode('3d');
    } else if (modeParam === 'camera' || modeParam === 'world-ar' || modeParam === 'camera-ar') {
      launchMode('camera-ar');
    } else if (modeParam === 'marker-ar') {
      launchMode('marker-ar');
    } else if (modeParam === 'how') {
      openHowToPlayDialog();
    } else {
      // DEFAULT ALIRAN BAHARU: Masuk ke Lobi Makmal Sains (Zero Camera Request)
      openScienceLabLobby();
    }
  }

  function cacheDOM() {
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.canvasContainer = document.getElementById('canvas-container');
    DOM.cameraFeed = document.getElementById('ar-camera-feed');
    DOM.hudModePill = document.getElementById('hud-mode-pill');
    DOM.hudModeIcon = document.getElementById('hud-mode-icon');
    DOM.hudModeText = document.getElementById('hud-mode-text');
    DOM.gyroResetBtn = document.getElementById('gyro-reset-btn');
    DOM.badgeCount = document.getElementById('hud-badge-count');
    DOM.score = document.getElementById('hud-score');
    DOM.timer = document.getElementById('hud-timer');
    DOM.badgeStrip = document.getElementById('hud-badge-strip');
    DOM.promptContainer = document.getElementById('prompt-container');
    DOM.promptTitle = document.getElementById('prompt-title');
    DOM.promptIcon = document.getElementById('prompt-icon');
    DOM.promptActionBtn = document.getElementById('prompt-action-btn');
    DOM.mobileInteractBtn = document.getElementById('mobile-interact-btn');
    DOM.soundToggleBtn = document.getElementById('sound-toggle-btn');
    DOM.soundIcon = document.getElementById('sound-icon');
    DOM.pauseBtn = document.getElementById('pause-btn');
    DOM.helpBtn = document.getElementById('help-btn');
    DOM.modeSelectBtn = document.getElementById('mode-select-btn');

    // Modals
    DOM.stationModal = document.getElementById('station-modal');
    DOM.stationNumberChip = document.getElementById('stn-number-chip');
    DOM.stationTitle = document.getElementById('stn-title');
    DOM.stationDesc = document.getElementById('stn-description');
    DOM.stnPreviewHost = document.getElementById('stn-preview-host');
    DOM.stnPreviewCanvas = document.getElementById('stn-preview-canvas');
    DOM.quizQuestion = document.getElementById('quiz-question');
    DOM.quizOptions = document.getElementById('quiz-options');
    DOM.quizFeedback = document.getElementById('quiz-feedback');
    DOM.quizModalActions = document.getElementById('quiz-modal-actions');
    DOM.closeStationBtn = document.getElementById('close-station-btn');

    // How to play dialog
    DOM.howToModal = document.getElementById('howto-modal');
    DOM.startPlayingBtn = document.getElementById('start-playing-btn');
    DOM.closeHowToBtn = document.getElementById('close-howto-btn');

    // Mode Selector Modal
    DOM.modeModal = document.getElementById('mode-modal');
    DOM.choose3dBtn = document.getElementById('choose-3d-btn');
    DOM.chooseCameraArBtn = document.getElementById('choose-camera-ar-btn');
    DOM.chooseWorldArBtn = document.getElementById('choose-world-ar-btn');
    DOM.chooseArBtn = document.getElementById('choose-ar-btn');
    DOM.closeModeBtn = document.getElementById('close-mode-btn');
    DOM.arScaleChooser = document.getElementById('ar-scale-chooser');
    DOM.scaleMiniBtn = document.getElementById('scale-mini-btn');
    DOM.scaleRoomBtn = document.getElementById('scale-room-btn');

    // Camera Fallback Modal
    DOM.cameraFallbackModal = document.getElementById('camera-fallback-modal');
    DOM.cameraFallbackTitle = document.getElementById('camera-fallback-title');
    DOM.cameraFallbackMsg = document.getElementById('camera-fallback-msg');
    DOM.retryCameraBtn = document.getElementById('retry-camera-btn');
    DOM.fallbackTo3dBtn = document.getElementById('fallback-to-3d-btn');

    // Victory Certificate Modal
    DOM.victoryModal = document.getElementById('victory-modal');
    DOM.certStudentName = document.getElementById('cert-student-name');
    DOM.certScore = document.getElementById('cert-score');
    DOM.certTime = document.getElementById('cert-time');
    DOM.certDate = document.getElementById('cert-date');
    DOM.downloadCertBtn = document.getElementById('download-cert-btn');
    DOM.restartGameBtn = document.getElementById('restart-game-btn');
    DOM.closeVictoryBtn = document.getElementById('close-victory-btn');

    // AR HUD Overlay & Interactive Controls
    DOM.arOverlay = document.getElementById('ar-overlay');
    DOM.arStatusBadge = document.getElementById('ar-status-badge');
    DOM.arBadgeIcon = document.getElementById('ar-badge-icon');
    DOM.arBadgeText = document.getElementById('ar-badge-text');
    DOM.arModelTabs = document.getElementById('ar-model-tabs');
    DOM.arBtnWorld = document.getElementById('ar-btn-world');
    DOM.arBtnMarker = document.getElementById('ar-btn-marker');
    DOM.arBtnAnimal = document.getElementById('ar-btn-animal');
    DOM.arBtnPlant = document.getElementById('ar-btn-plant');
    DOM.arBtnMinilab = document.getElementById('ar-btn-minilab');
    DOM.arAutorotateBtn = document.getElementById('ar-autorotate-btn');
    DOM.arResetViewBtn = document.getElementById('ar-reset-view-btn');
    DOM.arChangeModeBtn = document.getElementById('ar-change-mode-btn');
    DOM.arExitBtn = document.getElementById('ar-exit-btn');
    DOM.arHintBanner = document.getElementById('ar-hint-banner');
    DOM.arOrganelleStrip = document.getElementById('ar-organelle-strip');
    DOM.arOrganelleCard = document.getElementById('ar-organelle-card');
    DOM.arCardIcon = document.getElementById('ar-card-icon');
    DOM.arCardTitle = document.getElementById('ar-card-title');
    DOM.arCardBadge = document.getElementById('ar-card-badge');
    DOM.arCardDesc = document.getElementById('ar-card-desc');
    DOM.arCardQuizBtn = document.getElementById('ar-card-quiz-btn');
    DOM.arCardSpeechBtn = document.getElementById('ar-card-speech-btn');
    DOM.arCardFocusBtn = document.getElementById('ar-card-focus-btn');
    DOM.arCardCloseBtn = document.getElementById('ar-card-close-btn');

    // Spatial WebXR Tools
    DOM.arSpatialTools = document.getElementById('ar-spatial-tools');
    DOM.arPlaceBtn = document.getElementById('ar-place-btn');
    DOM.arSmallerBtn = document.getElementById('ar-smaller-btn');
    DOM.arLargerBtn = document.getElementById('ar-larger-btn');
    DOM.arRotateBtn = document.getElementById('ar-rotate-btn');
    DOM.arRepositionBtn = document.getElementById('ar-reposition-btn');

    // Mobile Virtual Joystick & Touch Zone
    DOM.virtualJoystick = document.getElementById('virtual-joystick');
    DOM.joystickBase = document.getElementById('joystick-base');
    DOM.joystickThumb = document.getElementById('joystick-thumb');
    DOM.touchZone = document.getElementById('touch-look-zone');
    DOM.crosshair = document.getElementById('crosshair');

    // Walkthrough HUD container
    DOM.walkthroughHud = document.getElementById('cq-walkthrough-hud');
    DOM.walkthroughBackBtn = document.getElementById('walkthrough-back-btn');

    // New AR HUD, Drawer & Window Controls
    DOM.arTopBar = document.getElementById('ar-topbar');
    DOM.arBackBtn = document.getElementById('ar-back-btn');
    DOM.arSoundBtn = document.getElementById('ar-sound-btn');
    DOM.arSoundIcon = document.getElementById('ar-sound-icon');
    DOM.arPauseBtn = document.getElementById('ar-pause-btn');
    DOM.arPauseIcon = document.getElementById('ar-pause-icon');
    DOM.arHelpBtn = document.getElementById('ar-help-btn');
    DOM.arHudScore = document.getElementById('ar-hud-score');
    DOM.arHudBadges = document.getElementById('ar-hud-badges');
    DOM.arHudTimer = document.getElementById('ar-hud-timer');
    DOM.arHudChestChip = document.getElementById('ar-hud-chest-chip');
    DOM.arHudChests = document.getElementById('ar-hud-chests');
    DOM.arSingleInstruction = document.getElementById('ar-single-instruction');
    DOM.arSingleInstructionText = document.getElementById('ar-single-instruction-text');
    DOM.arStationsToggle = document.getElementById('ar-stations-toggle');
    DOM.arStnDoneCount = document.getElementById('ar-stn-done-count');
    DOM.arRecenterBtn = document.getElementById('ar-recenter-btn');
    DOM.arRecenterText = document.getElementById('ar-recenter-text');
    DOM.arPostureBtn = document.getElementById('ar-posture-btn');
    DOM.arPostureIcon = document.getElementById('ar-posture-icon');
    DOM.arPostureText = document.getElementById('ar-posture-text');
    DOM.arPrintMarkersBtn = document.getElementById('ar-print-markers-btn');
    DOM.arStationsDrawer = document.getElementById('ar-stations-drawer');
    DOM.arDrawerCloseBtn = document.getElementById('ar-drawer-close-btn');
    DOM.arDrawerList = document.getElementById('ar-drawer-list');
    DOM.arCardMinimizeBtn = document.getElementById('ar-card-minimize-btn');
    DOM.arCardMinIcon = document.getElementById('ar-card-min-icon');
    DOM.arCardHeader = document.getElementById('ar-card-header');
    DOM.arCardBody = document.getElementById('ar-card-body');

    // Exit Confirmation Dialog (Bahagian 2)
    DOM.exitConfirmModal = document.getElementById('exit-confirm-modal');
    DOM.exitConfirmContinueBtn = document.getElementById('exit-confirm-continue-btn');
    DOM.exitConfirmLeaveBtn = document.getElementById('exit-confirm-leave-btn');
    DOM.exitConfirmKotakBtn = document.getElementById('exit-confirm-kotak-btn');
    DOM.hudReturnKotakBtn = document.getElementById('hud-return-kotak-btn');
    DOM.lobbyReturnKotakBtn = document.getElementById('lobby-return-kotak-btn');

    // Misi Akhir: Treasure Hunt ARSELNel Dialogs
    DOM.treasureHuntIntroModal = document.getElementById('treasure-hunt-intro-modal');
    DOM.startTreasureHuntBtn = document.getElementById('start-treasure-hunt-btn');
    DOM.closeTreasureIntroBtn = document.getElementById('close-treasure-intro-btn');
    DOM.treasureChestModal = document.getElementById('treasure-chest-modal');
    DOM.closeTreasureModalBtn = document.getElementById('close-treasure-modal-btn');
    DOM.tcChestBadge = document.getElementById('tc-chest-badge');
    DOM.tcVisualTitle = document.getElementById('tc-visual-title');
    DOM.tcQuestionProgress = document.getElementById('tc-question-progress');
    DOM.tcQuizQuestion = document.getElementById('tc-quiz-question');
    DOM.tcQuizOptions = document.getElementById('tc-quiz-options');
    DOM.tcQuizFeedback = document.getElementById('tc-quiz-feedback');
    DOM.tcModalActions = document.getElementById('tc-modal-actions');
    DOM.tcNextBtn = document.getElementById('tc-next-btn');
    DOM.tcNextBtnText = document.getElementById('tc-next-btn-text');
    DOM.treasureRewardModal = document.getElementById('treasure-reward-modal');
    DOM.trFinalScore = document.getElementById('tr-final-score');
    DOM.trFinalTime = document.getElementById('tr-final-time');
    DOM.trPrintBtn = document.getElementById('tr-print-btn');
    DOM.trReplayBtn = document.getElementById('tr-replay-btn');
    DOM.trExitBtn = document.getElementById('tr-exit-btn');

    // Lobi Makmal Sains & Galeri Pendidikan
    DOM.lobbyScreen = document.getElementById('cq-science-lobby');
    DOM.lobbyBackBtn = document.getElementById('lobby-back-btn');
    DOM.lobbyBtnModA = document.getElementById('lobby-btn-mod-a');
    DOM.lobbyBtnModB = document.getElementById('lobby-btn-mod-b');
    DOM.lobbyBtnModC = document.getElementById('lobby-btn-mod-c');
    DOM.lobbyPrintMarkersBtn = document.getElementById('lobby-print-markers-btn');
    DOM.lobbyUserName = document.getElementById('lobby-user-name');
    DOM.lobbyUserRole = document.getElementById('lobby-user-role');
    DOM.lobbyStatBadges = document.getElementById('lobby-stat-badges');
    DOM.lobbyBtnNotes = document.getElementById('lobby-btn-notes');
    DOM.lobbyBtnVideos = document.getElementById('lobby-btn-videos');
    DOM.galleryCards = document.querySelectorAll('.cq-gallery-card');
    DOM.galleryDetailModal = document.getElementById('gallery-detail-modal');
    DOM.closeGalleryDetailBtn = document.getElementById('close-gallery-detail-btn');
    DOM.galleryDetailCloseBtn = document.getElementById('gallery-detail-close-btn');
    DOM.galleryDetailTitle = document.getElementById('gallery-detail-title');
    DOM.galleryDetailSubtitle = document.getElementById('gallery-detail-subtitle');
    DOM.galleryDetailChip = document.getElementById('gallery-detail-chip');
    DOM.galleryDetailImg = document.getElementById('gallery-detail-img');
    DOM.galleryDetailNotes = document.getElementById('gallery-detail-notes');
    DOM.hud3dBackBtn = document.getElementById('hud-3d-back-btn');

    // Mod A: Misi Rahsia Makmal 3D & Kalibrasi & Crystal Victory
    DOM.lab3dStoryMissionModal = document.getElementById('lab3d-story-mission-modal');
    DOM.closeLab3dMissionBtn = document.getElementById('close-lab3d-mission-btn');
    DOM.lab3dMissionBackBtn = document.getElementById('lab3d-mission-back-btn');
    DOM.lab3dMissionStartBtn = document.getElementById('lab3d-mission-start-btn');
    DOM.lab3dCalibrationModal = document.getElementById('lab3d-calibration-modal');
    DOM.lab3dCalSensorBtn = document.getElementById('lab3d-cal-sensor-btn');
    DOM.lab3dCalTouchBtn = document.getElementById('lab3d-cal-touch-btn');
    DOM.lab3dCrystalVictoryModal = document.getElementById('lab3d-crystal-victory-modal');
    DOM.lab3dFinalScore = document.getElementById('lab3d-final-score');
    DOM.lab3dFinalStations = document.getElementById('lab3d-final-stations');
    DOM.lab3dFinalTime = document.getElementById('lab3d-final-time');
    DOM.lab3dExploreAgainBtn = document.getElementById('lab3d-explore-again-btn');
    DOM.lab3dReturnLobbyBtn = document.getElementById('lab3d-return-lobby-btn');

    // Misi AR Orientasi & Modal Cerita Pra-Permainan
    DOM.arStoryMissionModal = document.getElementById('ar-story-mission-modal');
    DOM.closeArMissionBtn = document.getElementById('close-ar-mission-btn');
    DOM.arMissionBackBtn = document.getElementById('ar-mission-back-btn');
    DOM.arMissionStartBtn = document.getElementById('ar-mission-start-btn');
    DOM.arMissionBanner = document.getElementById('ar-mission-banner');
    DOM.arMissionStatusText = document.getElementById('ar-mission-status-text');
  }

  function loadUser() {
    try {
      if (window.AuthGuard && typeof window.AuthGuard.getUser === 'function') {
        State.user = window.AuthGuard.getUser();
      } else if (window.ARSupabase && typeof window.ARSupabase.getUser === 'function') {
        State.user = window.ARSupabase.getUser();
      }
    } catch (_) {}
  }

  // Sync station configuration from Supabase if published
  async function loadCMSStations() {
    if (!window.ARSupabase || !window.ARSupabase.client) return;
    try {
      const { data, error } = await window.ARSupabase.client
        .from('cellquest_adventure_config')
        .select('*')
        .eq('is_active', true)
        .order('station_number', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const idx = State.stations.findIndex(s => s.number === item.station_number || s.id === item.id);
          if (idx >= 0) {
            State.stations[idx].title = item.title || State.stations[idx].title;
            State.stations[idx].organelle = item.organelle || State.stations[idx].organelle;
            State.stations[idx].description = item.description || State.stations[idx].description;
            State.stations[idx].question = item.question_text || State.stations[idx].question;
            State.stations[idx].options = [item.option_a, item.option_b, item.option_c, item.option_d];
            const letterMap = { A: 0, B: 1, C: 2, D: 3 };
            State.stations[idx].correct = letterMap[item.correct_option] ?? State.stations[idx].correct;
            State.stations[idx].explanation = item.explanation || State.stations[idx].explanation;
            if (item.color) {
              State.stations[idx].color = item.color;
              State.stations[idx].colorHex = parseInt(item.color.replace('#', '0x'), 16);
            }
          }
        });
      }
    } catch (e) {
      console.warn('CMS station sync warning:', e);
    }
  }

  function hideLoadingScreen() {
    if (DOM.loadingScreen) {
      setTimeout(() => {
        DOM.loadingScreen.classList.add('done');
      }, 350);
    }
  }

  // ==============================================================================
  // THREE.JS SCENE SETUP
  // ==============================================================================

  // Mod A Gyroscope & Motion Look State (Fasa A.5: Kuaternion 360° bebas gimbal lock & sokongan penuh iPad Portrait/Landscape)
  const modAGyro = {
    supported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
    enabled: false,
    active: false,
    listenerBound: false,
    listenerCount: 0,
    screenListenerBound: false,
    calibrated: false,
    hasCalibrated: false,
    yaw: 0,
    pitch: 0,
    rawAzimuthDeg: 0,
    rawElevationDeg: 0,
    smoothedAzimuthDeg: 0,
    smoothedElevationDeg: 0,
    baseAzimuthDeg: null,
    baseElevationDeg: null,
    screenOrientationAngle: 0,
    baseAlpha: null,
    baseBeta: null,
    baseGamma: null,
    currentAlpha: 0,
    currentBeta: 0,
    currentGamma: 0,
    smoothedYaw: 0,
    smoothedPitch: 0,
    quaternion: new THREE.Quaternion()
  };

  // Fasa A.5: Muat naik tekstur ke memori GPU WebGL serta-merta semasa dicipta
  // bagi mengelakkan pengusiran (eviction) backing store kanvas 2D luar skrin pada Safari iPadOS
  function initTextureForGPU(tex) {
    if (!tex) return tex;
    tex.needsUpdate = true;
    try {
      if (renderer && typeof renderer.initTexture === 'function') {
        renderer.initTexture(tex);
      }
    } catch (_) {}
    return tex;
  }

  let cellCoreCrystalGroup = null;
  let cellCoreChamberGroup = null;
  let floorGuideTrailGroup = null;

    function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a161e);
    scene.fog = new THREE.FogExp2(0x0a161e, 0.025);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(player.x, player.y, player.z);
    scene.add(camera);

    // Fasa A.4 & A.5: Camera Headlamp (Lampu hadapan seimbang mengikut arah pandangan kamera 360°)
    const cameraHeadlamp = new THREE.DirectionalLight(0xffffff, 0.52);
    cameraHeadlamp.name = 'CameraHeadlamp';
    cameraHeadlamp.position.set(0, 0, 1);
    camera.add(cameraHeadlamp);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.xr.enabled = true; // Enable WebXR on renderer

    DOM.canvasContainer.appendChild(renderer.domElement);

    // Dedicated Root Group for AR Models (Animal Cell, Plant Cell & Mini Lab)
    arObjectGroup = new THREE.Group();
    arObjectGroup.visible = false;
    scene.add(arObjectGroup);

    // Ambient, Hemisphere & Directional PBR Studio Lighting (Seimbang untuk warna organel tepu & tidak over-exposed)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.68);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x334155, 0.62);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(6, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillDirLight = new THREE.DirectionalLight(0xe0f2fe, 0.45);
    fillDirLight.position.set(-6, 9, -6);
    scene.add(fillDirLight);

    // Lampu hadapan (camera view fill) untuk menerangi organel di paras rendah/lantai
    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.38);
    frontFillLight.position.set(0, 3, 6);
    scene.add(frontFillLight);

    // Warm laboratory accent point lights
    const warmLight1 = new THREE.PointLight(0x38bdf8, 1.2, 18);
    warmLight1.position.set(-4, 4, 0);
    scene.add(warmLight1);

    const warmLight2 = new THREE.PointLight(0x2dd4bf, 1.2, 18);
    warmLight2.position.set(4, 4, 0);
    scene.add(warmLight2);
  }

  // ==============================================================================
  // 3D LAB ROOM ENVIRONMENT (CARTOON SCI-FI LAB)
  // ==============================================================================

  function buildLaboratoryRoom() {
    const labGroup = new THREE.Group();

    // 1. Glossy Tiled Lab Floor (18m wide x 22m long)
    const floorGeo = new THREE.PlaneGeometry(18, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x132630,
      roughness: 0.25,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    labGroup.add(floor);

    // Subtle Hexagonal / Grid Accent Lines on Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x2dd4bf, 0x1e3a47);
    gridHelper.position.y = 0.01;
    labGroup.add(gridHelper);

    // 2. Ceiling with Skylights
    const ceilingGeo = new THREE.PlaneGeometry(18, 22);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x0c1a22,
      roughness: 0.8
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = 5;
    ceiling.rotation.x = Math.PI / 2;
    labGroup.add(ceiling);

    // Glowing Ceiling Light Strips
    for (let z = -8; z <= 8; z += 4) {
      const stripGeo = new THREE.BoxGeometry(10, 0.1, 0.4);
      const stripMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, 4.95, z);
      labGroup.add(strip);
    }

    // 3. Walls (Left, Right, Front/Exit, Back/Entrance)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x162c38,
      roughness: 0.5,
      metalness: 0.1
    });

    // Left Wall (X = -9)
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 22), wallMat);
    wallLeft.position.set(-9, 2.5, 0);
    labGroup.add(wallLeft);

    // Right Wall (X = 9)
    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 22), wallMat);
    wallRight.position.set(9, 2.5, 0);
    labGroup.add(wallRight);

    // Glowing Baseboard Trims
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 22), trimMat);
    trimLeft.position.set(-8.95, 0.075, 0);
    labGroup.add(trimLeft);

    const trimRight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 22), trimMat);
    trimRight.position.set(8.95, 0.075, 0);
    labGroup.add(trimRight);

    // Back Wall (Entrance - Z = 11)
    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 0.4), wallMat);
    wallBack.position.set(0, 2.5, 11);
    labGroup.add(wallBack);

    // Entrance Door Frame & Signboard
    const entranceFrame = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 3.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    entranceFrame.position.set(0, 1.75, 10.8);
    labGroup.add(entranceFrame);

    const entranceSign = createTextPlane('PINTU MASUK • MAKMAL SEL', '#2dd4bf', 3.5, 0.7);
    entranceSign.position.set(0, 3.8, 10.7);
    entranceSign.rotation.y = Math.PI;
    labGroup.add(entranceSign);

    // Front Wall with Doorway Opening to Bilik Teras Sel (Z = -11)
    // Left front wall (-9 to -2.1)
    const wallFrontLeft = new THREE.Mesh(new THREE.BoxGeometry(6.9, 5, 0.4), wallMat);
    wallFrontLeft.position.set(-5.55, 2.5, -11);
    labGroup.add(wallFrontLeft);

    // Right front wall (2.1 to 9)
    const wallFrontRight = new THREE.Mesh(new THREE.BoxGeometry(6.9, 5, 0.4), wallMat);
    wallFrontRight.position.set(5.55, 2.5, -11);
    labGroup.add(wallFrontRight);

    // Lintel header wall above doorway opening (Y: 3.8 to 5.0)
    const wallFrontTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.4), wallMat);
    wallFrontTop.position.set(0, 4.4, -11);
    labGroup.add(wallFrontTop);

    // Floor Guide Trail (Animated glowing trail leading from center to Pintu Teras Sel)
    floorGuideTrailGroup = buildFloorGuideTrail();
    labGroup.add(floorGuideTrailGroup);

    // Secret Door Structure ("PINTU TERAS SEL")
    buildExitDoor(labGroup);

    // Bonus Room: BILIK TERAS SEL (Cell Core Chamber) behind the secret door
    buildCellCoreChamber(labGroup);

    // 4. Central Research Table & Holographic ARSelNel Display Monument
    buildCenterpiece(labGroup);

    // 5. Scientific Wall Posters (KSSM Animal & Plant Cell Charts)
    buildPosters(labGroup);

    // 6. Pameran Tambahan: Retikulum Endoplasma (Supplementary Exhibit using endoplasmic_reticulum.glb)
    buildSupplementaryERExhibit(labGroup);

    // 7. Futuristic Wall Panels, LED Conduits & Telemetry Displays
    buildFuturisticWallDecorations(labGroup);

    // 8. Glowing Floor Guide Runners & Station Connectors
    buildFuturisticFloorRunners(labGroup);

    // 9. Corner Sci-Fi Lab Equipment & Holographic DNA Columns
    buildCornerLabDecorations(labGroup);

    labEnvironmentGroup = labGroup;
    if (walkthroughStationsGroup && walkthroughStationsGroup.parent !== labGroup) {
      labGroup.add(walkthroughStationsGroup);
    }
    scene.add(labGroup);
  }

  // Animated Floor Guide Trail pointing towards Pintu Teras Sel
  function buildFloorGuideTrail() {
    const trailGroup = new THREE.Group();
    trailGroup.name = 'FloorGuideTrail';
    const chevronCount = 7;
    const chevronMeshes = [];

    const chevronMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    // Jalur pemandu neon tengah yang menghubungkan anak panah terus ke Pintu Teras Sel
    const runwayLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.012, 7.8),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35 })
    );
    runwayLine.position.set(0, 0.015, -5.6);
    trailGroup.add(runwayLine);

    for (let i = 0; i < chevronCount; i++) {
      const zPos = -2.0 - (i * 1.15);
      const shape = new THREE.Shape();
      // Puncak anak panah menghala tepat ke hadapan (+Y dalam 2D = -Z dunia ke arah Pintu Teras Sel)
      shape.moveTo(0, 0.35);
      shape.lineTo(0.45, -0.2);
      shape.lineTo(0.32, -0.32);
      shape.lineTo(0, 0.05);
      shape.lineTo(-0.32, -0.32);
      shape.lineTo(-0.45, -0.2);
      shape.closePath();

      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, chevronMat.clone());
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0.025, zPos);
      mesh.userData = { index: i, baseZ: zPos };
      trailGroup.add(mesh);
      chevronMeshes.push(mesh);
    }

    trailGroup.userData = {
      active: false,
      chevrons: chevronMeshes,
      update(t) {
        if (!this.active) return;
        this.chevrons.forEach((m, idx) => {
          const wave = Math.sin(t * 4.0 - idx * 0.85);
          m.material.opacity = 0.35 + Math.max(0, wave) * 0.65;
          m.material.color.setHex(wave > 0.5 ? 0x22d3ee : 0x10b981);
        });
      }
    };

    trailGroup.visible = false;
    animatedObjects.push(trailGroup.userData);
    return trailGroup;
  }

  // ==============================================================================
  // FUTURISTIC AUTOMATIC SLIDING DOOR (PINTU TERAS SEL)
  // Reka bentuk berpandukan konsep Sci-Fi Lab Airlock: Bingkai berlubang (hollow frame),
  // dua panel pintu berasingan bergerak ke kiri & kanan, panel status digital,
  // jalur lampu LED sian/ungu, dan pengimbas biometrik tangan.
  // ==============================================================================
  function buildExitDoor(parent) {
    const doorGroup = new THREE.Group();
    doorGroup.name = 'PintuTerasSel_Group';
    doorGroup.position.set(0, 0, -10.8);

    // Bahan Logam Sci-Fi Premium
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.22
    });
    const doorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const doorTrimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. BINGKAI PINTU HOLLOW (Tiada blok pepejal di tengah laluan bukaan!)
    // A. Tiang Bingkai Kiri (X = -2.45, Width 0.7m, Height 4.2m, Depth 0.5m)
    const pillarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.5), frameMat);
    pillarLeft.position.set(-2.45, 2.1, 0);
    doorGroup.add(pillarLeft);

    // Jalur LED Sian pada Tiang Kiri
    const pillarLightL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.8, 0.52),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    pillarLightL.position.set(-2.15, 2.0, 0.02);
    doorGroup.add(pillarLightL);

    // B. Tiang Bingkai Kanan (X = 2.45, Width 0.7m, Height 4.2m, Depth 0.5m)
    const pillarRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.5), frameMat);
    pillarRight.position.set(2.45, 2.1, 0);
    doorGroup.add(pillarRight);

    // Jalur LED Sian pada Tiang Kanan
    const pillarLightR = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.8, 0.52),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    pillarLightR.position.set(2.15, 2.0, 0.02);
    doorGroup.add(pillarLightR);

    // Pengimbas Biometrik / Status Terminal pada Tiang Kanan
    const scannerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 })
    );
    scannerBox.position.set(2.45, 1.6, 0.28);
    doorGroup.add(scannerBox);

    const scannerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    scannerScreen.position.set(2.45, 1.6, 0.35);
    doorGroup.add(scannerScreen);

    const scannerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    scannerLed.position.set(2.45, 1.95, 0.35);
    doorGroup.add(scannerLed);

    // C. Rasuk Lintel Atas (Header Beam: X = 0, Y = 4.35, Width 5.6m, Height 0.65m, Depth 0.55m)
    const lintelHeader = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.65, 0.55), frameMat);
    lintelHeader.position.set(0, 4.35, 0);
    doorGroup.add(lintelHeader);

    // Jalur Neon Sian Mendatar Atas & Bawah Lintel
    const lintelStripBottom = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.06, 0.57),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    lintelStripBottom.position.set(0, 4.02, 0.02);
    doorGroup.add(lintelStripBottom);

    const lintelStripTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.06, 0.57),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    lintelStripTop.position.set(0, 4.68, 0.02);
    doorGroup.add(lintelStripTop);

    // D. Jalur Ambang Lantai (Floor Threshold Runner)
    const floorRunner = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.025, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    floorRunner.position.set(0, 0.012, 0);
    doorGroup.add(floorRunner);

    // Lampu Siling Pintu (Downlight Spotlight)
    const doorLight = new THREE.PointLight(0xf59e0b, 1.2, 8);
    doorLight.position.set(0, 3.9, 0.3);
    doorGroup.add(doorLight);

    // 2. DUA PANEL PINTU MENGGELONGSOR (SLIDING DOOR LEAVES)
    // Pintu Kiri (Lebar 2.05m, Tinggi 3.7m, Tebal 0.16m)
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.name = 'LeftDoorGroup';
    leftDoorGroup.position.set(-1.025, 1.85, 0); // Kedudukan tertutup rapat di tengah

    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.7, 0.16), doorPanelMat);
    leftDoorGroup.add(leftPanel);

    // Panel inset perak/kelabu sci-fi
    const leftInset = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.4, 0.18), doorTrimMat);
    leftInset.position.set(0.05, 0, 0);
    leftDoorGroup.add(leftInset);

    // 3 Jalur Pengudaraan Sian Bersudut (Diagonal Sci-Fi Vents ///)
    [-0.5, 0, 0.5].forEach(yOffset => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.08, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      vent.position.set(0.2, yOffset, 0.01);
      vent.rotation.z = Math.PI / 6;
      leftDoorGroup.add(vent);
    });

    // Jalur Seam Sian pada Tepi Kanan Pintu Kiri
    const leftSeamLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 3.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    leftSeamLight.position.set(0.98, 0, 0.01);
    leftDoorGroup.add(leftSeamLight);

    // Lencana Bio-DNA Bercahaya pada Pintu Kiri
    const leftDnaBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    leftDnaBadge.rotation.x = Math.PI / 2;
    leftDnaBadge.position.set(-0.35, 1.1, 0.09);
    leftDoorGroup.add(leftDnaBadge);

    doorGroup.add(leftDoorGroup);

    // Pintu Kanan (Lebar 2.05m, Tinggi 3.7m, Tebal 0.16m)
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.name = 'RightDoorGroup';
    rightDoorGroup.position.set(1.025, 1.85, 0); // Kedudukan tertutup rapat di tengah

    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.7, 0.16), doorPanelMat);
    rightDoorGroup.add(rightPanel);

    // Panel inset perak/kelabu sci-fi
    const rightInset = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.4, 0.18), doorTrimMat);
    rightInset.position.set(-0.05, 0, 0);
    rightDoorGroup.add(rightInset);

    // 3 Jalur Pengudaraan Sian Bersudut Mirrored (\ )
    [-0.5, 0, 0.5].forEach(yOffset => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.08, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      vent.position.set(-0.2, yOffset, 0.01);
      vent.rotation.z = -Math.PI / 6;
      rightDoorGroup.add(vent);
    });

    // Jalur Seam Sian pada Tepi Kiri Pintu Kanan
    const rightSeamLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 3.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    rightSeamLight.position.set(-0.98, 0, 0.01);
    rightDoorGroup.add(rightSeamLight);

    // Lencana Bio-DNA Bercahaya pada Pintu Kanan
    const rightDnaBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    rightDnaBadge.rotation.x = Math.PI / 2;
    rightDnaBadge.position.set(0.35, 1.1, 0.09);
    rightDoorGroup.add(rightDnaBadge);

    doorGroup.add(rightDoorGroup);

    // 3. PENGHADANG TENAGA HOLOGRAFIK (ENERGY SHIELD)
    const shieldGeo = new THREE.PlaneGeometry(4.0, 3.6);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.85, 0.08);
    doorGroup.add(shield);

    // 4. PAPAN TANDA DIGITAL STATUS PINTU
    const exitSign = createTextPlane('🔒 PINTU TERAS SEL • TERKUNCI (0/8 STESEN DIPULIHKAN)', '#ef4444', 4.8, 0.65);
    exitSign.position.set(0, 4.4, 0.29);
    doorGroup.add(exitSign);

    // 5. 8 INDIKATOR LED STATUS STESEN (Pill LED Indicators di bawah papan tanda)
    const statusLedMeshes = [];
    const ledMatOff = new THREE.MeshBasicMaterial({ color: 0x334155 });
    for (let i = 0; i < 8; i++) {
      const ledX = -1.575 + (i * 0.45);
      const led = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), ledMatOff.clone());
      led.rotation.x = Math.PI / 2;
      led.position.set(ledX, 4.02, 0.29);
      led.userData = { stationNumber: i + 1 };
      doorGroup.add(led);
      statusLedMeshes.push(led);
    }

    exitDoorMeshes = {
      group: doorGroup,
      leftDoor: leftDoorGroup,
      rightDoor: rightDoorGroup,
      shield,
      exitSign,
      exitSignText: '🔒 PINTU TERAS SEL • TERKUNCI (0/8 STESEN DIPULIHKAN)',
      state: 'LOCKED', // 'LOCKED' | 'OPENING' | 'OPEN'
      unlocked: false,
      scannerLed,
      doorLight,
      pillarLightL,
      pillarLightR,
      statusLeds: statusLedMeshes,
      openProgress: 0
    };

    parent.add(doorGroup);
  }

  // Update Secret Door Signboard Text & Color dynamically
  function updateSecretDoorSign(text, colorHex = '#ef4444') {
    if (!exitDoorMeshes || !exitDoorMeshes.group) return;
    if (exitDoorMeshes.exitSign) {
      exitDoorMeshes.group.remove(exitDoorMeshes.exitSign);
      if (exitDoorMeshes.exitSign.geometry) exitDoorMeshes.exitSign.geometry.dispose();
      if (exitDoorMeshes.exitSign.material) exitDoorMeshes.exitSign.material.dispose();
    }
    const newSign = createTextPlane(text, colorHex, 4.8, 0.65);
    newSign.position.set(0, 4.4, 0.29);
    exitDoorMeshes.group.add(newSign);
    exitDoorMeshes.exitSign = newSign;
    exitDoorMeshes.exitSignText = text;

    // Kemas kini 8 LED indikator stesen
    if (exitDoorMeshes.statusLeds && State.completedStations) {
      exitDoorMeshes.statusLeds.forEach((led, idx) => {
        const isCompleted = State.completedStations.has(idx + 1);
        if (isCompleted) {
          led.material.color.setHex(0x10b981); // Hijau zamrud
        } else {
          led.material.color.setHex(0x334155); // Kelabu gelap
        }
      });
    }
  }

  // Bonus Room: BILIK TERAS SEL (Cell Core Chamber) with floating CELL CORE CRYSTAL
  function buildCellCoreChamber(parent) {
    const chamberGroup = new THREE.Group();
    chamberGroup.name = 'CellCoreChamber';

    // 1. Connecting Corridor (from Z = -11.0 to Z = -13.5, width 4.2m, height 5.0m)
    const corridorFloorGeo = new THREE.PlaneGeometry(4.2, 2.8);
    const corridorFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.3
    });
    const corridorFloor = new THREE.Mesh(corridorFloorGeo, corridorFloorMat);
    corridorFloor.rotation.x = -Math.PI / 2;
    corridorFloor.position.set(0, 0.005, -12.3);
    chamberGroup.add(corridorFloor);

    // Corridor walls (Left at X = -2.1, Right at X = 2.1)
    const cWallMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4, metalness: 0.25 });
    const cWallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 2.8), cWallMat);
    cWallL.position.set(-2.1, 2.5, -12.3);
    chamberGroup.add(cWallL);

    const cWallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 2.8), cWallMat);
    cWallR.position.set(2.1, 2.5, -12.3);
    chamberGroup.add(cWallR);

    // Corridor ceiling
    const cCeil = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    cCeil.rotation.x = Math.PI / 2;
    cCeil.position.set(0, 5.0, -12.3);
    chamberGroup.add(cCeil);

    // Sci-fi illuminated archways along corridor
    [-11.0, -12.4, -13.5].forEach(z => {
      const arch = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.15, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      arch.position.set(0, 3.8, z);
      chamberGroup.add(arch);

      const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      pillarL.position.set(-2.0, 1.9, z);
      chamberGroup.add(pillarL);

      const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      pillarR.position.set(2.0, 1.9, z);
      chamberGroup.add(pillarR);
    });

    // 2. Octagonal Chamber Room (Center: X = 0, Z = -19, Radius: 6.2m, Height: 6.0m)
    const chamberCenterX = 0;
    const chamberCenterZ = -19;
    const chamberRadius = 6.2;
    const numSides = 8;

    // Chamber Floor (Octagonal)
    const chamberFloorGeo = new THREE.CylinderGeometry(chamberRadius, chamberRadius, 0.1, numSides);
    const chamberFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.18,
      metalness: 0.4
    });
    const chamberFloor = new THREE.Mesh(chamberFloorGeo, chamberFloorMat);
    chamberFloor.position.set(chamberCenterX, -0.05, chamberCenterZ);
    chamberGroup.add(chamberFloor);

    // Concentric futuristic glowing circuit rings on floor
    [2.8, 4.2, 5.5].forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.04, r + 0.04, 32),
        new THREE.MeshBasicMaterial({
          color: idx % 2 === 0 ? 0x22d3ee : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(chamberCenterX, 0.015, chamberCenterZ);
      chamberGroup.add(ring);
    });

    // Chamber Walls (8 panels around the octagon)
    const sideAngle = (Math.PI * 2) / numSides;
    const wallWidth = 2 * chamberRadius * Math.sin(sideAngle / 2) + 0.15;
    const wallHeight = 6.0;

    for (let i = 0; i < numSides; i++) {
      const angle = i * sideAngle;
      const wallMidX = chamberCenterX + Math.sin(angle) * (chamberRadius * Math.cos(sideAngle / 2));
      const wallMidZ = chamberCenterZ + Math.cos(angle) * (chamberRadius * Math.cos(sideAngle / 2));

      // Leave South entrance open for doorway corridor
      if (Math.abs(wallMidX) < 1.6 && wallMidZ > -15.0) {
        continue;
      }

      const wallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(wallWidth, wallHeight, 0.35),
        new THREE.MeshStandardMaterial({
          color: (i % 2 === 0) ? 0x1e1b4b : 0x0f172a,
          roughness: 0.45,
          metalness: 0.25
        })
      );
      wallMesh.position.set(wallMidX, wallHeight / 2, wallMidZ);
      wallMesh.rotation.y = angle;
      chamberGroup.add(wallMesh);

      // Glowing corner pillars & vertical LED conduits
      const cornerAngle = angle + sideAngle / 2;
      const cornerX = chamberCenterX + Math.sin(cornerAngle) * chamberRadius;
      const cornerZ = chamberCenterZ + Math.cos(cornerAngle) * chamberRadius;

      const cornerPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, wallHeight, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.2 })
      );
      cornerPillar.position.set(cornerX, wallHeight / 2, cornerZ);
      chamberGroup.add(cornerPillar);

      const cornerLED = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, wallHeight - 0.4, 0.08),
        new THREE.MeshBasicMaterial({ color: (i % 2 === 0) ? 0x22d3ee : 0xc084fc })
      );
      cornerLED.position.set(cornerX, wallHeight / 2, cornerZ);
      chamberGroup.add(cornerLED);
    }

    // Chamber Ceiling
    const chamberCeilGeo = new THREE.CylinderGeometry(chamberRadius * 0.95, chamberRadius, 0.4, numSides);
    const chamberCeil = new THREE.Mesh(chamberCeilGeo, new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6 }));
    chamberCeil.position.set(chamberCenterX, wallHeight + 0.2, chamberCenterZ);
    chamberGroup.add(chamberCeil);

    // Central Chamber Skylight Oculus
    const oculus = new THREE.Mesh(
      new THREE.CircleGeometry(2.0, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    oculus.rotation.x = Math.PI / 2;
    oculus.position.set(chamberCenterX, wallHeight + 0.01, chamberCenterZ);
    chamberGroup.add(oculus);

    // 3. Central Raised Energy Dais Platform at (0, 0, -19)
    const daisBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.7, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x0e1b2e, metalness: 0.5, roughness: 0.2 })
    );
    daisBase.position.set(chamberCenterX, 0.15, chamberCenterZ);
    chamberGroup.add(daisBase);

    const daisUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.1, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.15 })
    );
    daisUpper.position.set(chamberCenterX, 0.42, chamberCenterZ);
    chamberGroup.add(daisUpper);

    // Glowing cyan neon rim on dais
    const daisRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.04, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    daisRim.rotation.x = Math.PI / 2;
    daisRim.position.set(chamberCenterX, 0.55, chamberCenterZ);
    chamberGroup.add(daisRim);

    // 4. FLOATING 3D CELL CORE CRYSTAL (TERAS TENAGA UTAMA)
    const crystalGroup = new THREE.Group();
    crystalGroup.name = 'CellCoreCrystalGroup';
    crystalGroup.position.set(chamberCenterX, 2.1, chamberCenterZ);

    // Main Polyhedron Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
    crystalGeo.scale(1.0, 1.45, 1.0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92
    });
    const mainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystalGroup.add(mainCrystal);

    // Soft Cyan Outer Glow Shell (Additive Blending)
    const glowGeo = new THREE.OctahedronGeometry(0.96, 0);
    glowGeo.scale(1.0, 1.45, 1.0);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    crystalGroup.add(glowMesh);

    // Inner Core Glow Sphere
    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    crystalGroup.add(coreSphere);

    // 4 Satellite Orbiting Crystal Shards (Amethyst / Purple)
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88
    });
    const shardMeshes = [];
    for (let s = 0; s < 4; s++) {
      const sGeo = new THREE.OctahedronGeometry(0.24, 0);
      sGeo.scale(0.8, 1.3, 0.8);
      const sMesh = new THREE.Mesh(sGeo, shardMat);
      const initAngle = (s / 4) * Math.PI * 2;
      const sRadius = 1.35;
      sMesh.position.set(Math.cos(initAngle) * sRadius, (s % 2 === 0 ? 0.25 : -0.25), Math.sin(initAngle) * sRadius);
      sMesh.userData = { angle: initAngle, radius: sRadius, speed: 0.8 + (s * 0.15), yOffset: sMesh.position.y };
      crystalGroup.add(sMesh);
      shardMeshes.push(sMesh);
    }

    // Holographic Gimbal Rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.035, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide })
    );
    ring1.rotation.x = Math.PI / 4;
    crystalGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.03, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide })
    );
    ring2.rotation.y = Math.PI / 4;
    crystalGroup.add(ring2);

    // Floating Energy Spark Particles (16 particles)
    const sparkGroup = new THREE.Group();
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.85 });
    const sparkMeshes = [];
    for (let p = 0; p < 16; p++) {
      const spark = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), sparkMat);
      const pAngle = (p / 16) * Math.PI * 2;
      const pRad = 0.9 + Math.random() * 1.1;
      const pY = -0.6 + Math.random() * 1.3;
      spark.position.set(Math.cos(pAngle) * pRad, pY, Math.sin(pAngle) * pRad);
      spark.userData = { angle: pAngle, radius: pRad, speed: 0.5 + Math.random() * 0.5, yBase: pY };
      sparkGroup.add(spark);
      sparkMeshes.push(spark);
    }
    crystalGroup.add(sparkGroup);

    // PointLights for the crystal
    const crystalLight = new THREE.PointLight(0x22d3ee, 2.5, 12);
    crystalLight.position.set(0, 0, 0);
    crystalGroup.add(crystalLight);

    const crystalPurpleLight = new THREE.PointLight(0xa855f7, 1.8, 10);
    crystalPurpleLight.position.set(0, 0.5, 0);
    crystalGroup.add(crystalPurpleLight);

    // Chamber Ambient Light
    const chamberAmbient = new THREE.PointLight(0x6366f1, 1.2, 16);
    chamberAmbient.position.set(chamberCenterX, 5.0, chamberCenterZ);
    chamberGroup.add(chamberAmbient);

    crystalGroup.userData = {
      mainCrystal,
      coreSphere,
      crystalLight,
      crystalPurpleLight,
      chamberAmbient,
      ring1,
      ring2,
      shardMeshes,
      sparkMeshes,
      shards: shardMeshes,
      sparks: sparkMeshes,
      rings: [ring1, ring2],
      coreLight: crystalLight,
      animatingActivation: false,
      activationProgress: 0,
      update(t) {
        if (this.animatingActivation) {
          this.activationProgress = Math.min(1.0, this.activationProgress + 0.02);
          const spinMultiplier = 1.0 + this.activationProgress * 6.0;
          crystalGroup.rotation.y += 0.025 * spinMultiplier;
          ring1.rotation.z += 0.04 * spinMultiplier;
          ring2.rotation.x -= 0.04 * spinMultiplier;

          mainCrystal.material.emissiveIntensity = 0.7 + this.activationProgress * 1.8;
          crystalLight.intensity = 2.5 + this.activationProgress * 3.5;
          crystalLight.color.setHex(0xfbbf24);
          chamberAmbient.color.setHex(0xf59e0b);
          chamberAmbient.intensity = 1.2 + this.activationProgress * 1.5;
        } else {
          crystalGroup.position.y = 2.1 + Math.sin(t * 1.8) * 0.1;
          crystalGroup.rotation.y = t * 0.5;
          ring1.rotation.z = t * 0.65;
          ring2.rotation.x = -t * 0.55;

          crystalLight.intensity = 2.0 + Math.sin(t * 2.5) * 0.5;

          shardMeshes.forEach(sm => {
            sm.userData.angle += 0.015 * sm.userData.speed;
            sm.position.x = Math.cos(sm.userData.angle) * sm.userData.radius;
            sm.position.z = Math.sin(sm.userData.angle) * sm.userData.radius;
            sm.position.y = sm.userData.yOffset + Math.sin(t * 2.0 + sm.userData.angle) * 0.1;
            sm.rotation.x += 0.02;
            sm.rotation.y += 0.02;
          });

          sparkMeshes.forEach(sp => {
            sp.userData.angle += 0.02 * sp.userData.speed;
            sp.position.x = Math.cos(sp.userData.angle) * sp.userData.radius;
            sp.position.z = Math.sin(sp.userData.angle) * sp.userData.radius;
            sp.position.y = sp.userData.yBase + Math.sin(t * 3.0 + sp.userData.angle) * 0.08;
          });
        }
      }
    };

    animatedObjects.push(crystalGroup.userData);
    chamberGroup.add(crystalGroup);

    cellCoreCrystalGroup = crystalGroup;
    cellCoreChamberGroup = chamberGroup;
    parent.add(chamberGroup);
  }

  // Central Table & Floating 3D Holographic ARSelNel Logo Monument
  function buildCenterpiece(parent) {
    const centerGroup = new THREE.Group();
    centerGroup.position.set(0, 0, 0);

    // 1. Octagonal research table base
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.9, 8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x132733,
      metalness: 0.35,
      roughness: 0.25
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.45;
    table.castShadow = true;
    table.receiveShadow = true;
    centerGroup.add(table);

    // Glowing Neon Rim around table
    const rimGeo = new THREE.TorusGeometry(2.5, 0.06, 8, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.92;
    centerGroup.add(rim);

    // 4 Angled Interactive Touch Kiosk Terminals around table edge (referencing science lab kiosks)
    [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4].forEach((angle, kIdx) => {
      const kioskGroup = new THREE.Group();
      const kDist = 2.15;
      kioskGroup.position.set(Math.cos(angle) * kDist, 0.92, Math.sin(angle) * kDist);
      kioskGroup.rotation.y = angle + Math.PI / 2;

      const kPed = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.12, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
      );
      kPed.position.y = 0.06;
      kioskGroup.add(kPed);

      const kScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.28, 0.04),
        new THREE.MeshBasicMaterial({ color: kIdx % 2 === 0 ? 0x22d3ee : 0x38bdf8 })
      );
      kScreen.position.set(0, 0.22, 0);
      kScreen.rotation.x = -Math.PI / 4;
      kioskGroup.add(kScreen);

      centerGroup.add(kioskGroup);
    });

    // Hologram Emitter Platform in Center of table
    const emitterGeo = new THREE.CylinderGeometry(1.0, 1.15, 0.16, 24);
    const emitterMat = new THREE.MeshStandardMaterial({ color: 0x091720, metalness: 0.8, roughness: 0.2 });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.y = 0.98;
    centerGroup.add(emitter);

    // Concentric Pulsing Hologram Energy Rings on Emitter Base
    const holoRing1 = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.55, 32),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    holoRing1.rotation.x = -Math.PI / 2;
    holoRing1.position.y = 1.07;
    centerGroup.add(holoRing1);

    const holoRing2 = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x008080, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    );
    holoRing2.rotation.x = -Math.PI / 2;
    holoRing2.position.y = 1.065;
    centerGroup.add(holoRing2);

    // Hologram Light Pillar beam
    const beamGeo = new THREE.CylinderGeometry(0.9, 1.2, 2.4, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.2;
    centerGroup.add(beam);

    // 2. Floating Animated 3D ARSelNel Brand Monument
    const brandGroup = new THREE.Group();
    brandGroup.position.set(0, 2.4, 0);

    // 2.1 Hexagonal Cell Border (Based on assets/home/logo.svg)
    const hexShape = new THREE.Shape();
    const hexR = 0.95;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const x = Math.cos(a) * hexR;
      const y = Math.sin(a) * hexR;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    // Extrude outer hexagonal frame
    const extrudeSettings = {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03
    };
    const hexGeo = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    hexGeo.center();
    const hexMat = new THREE.MeshStandardMaterial({
      color: 0x008080,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x004040
    });
    const hexMesh = new THREE.Mesh(hexGeo, hexMat);
    brandGroup.add(hexMesh);

    // Glowing Neon Hexagon Edge Outline
    const hexEdgeGeo = new THREE.EdgesGeometry(hexGeo);
    const hexEdgeMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, linewidth: 2 });
    const hexEdges = new THREE.LineSegments(hexEdgeGeo, hexEdgeMat);
    brandGroup.add(hexEdges);

    // 2.2 Inner Translucent Cytoplasm Membrane Disc (#76d6d5 from logo.svg)
    const innerDiscGeo = new THREE.CircleGeometry(0.68, 32);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x76d6d5,
      transparent: true,
      opacity: 0.78,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.position.z = 0.01;
    brandGroup.add(innerDisc);

    // 2.3 Center Glowing Nucleus Core (#002020 / #2dd4bf from logo.svg)
    const nucCoreGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const nucCoreMat = new THREE.MeshStandardMaterial({
      color: 0x002020,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const nucCore = new THREE.Mesh(nucCoreGeo, nucCoreMat);
    brandGroup.add(nucCore);

    // Dedicated Point Light for ARSelNel Core Glow
    const coreLight = new THREE.PointLight(0x2dd4bf, 1.6, 8);
    coreLight.position.set(0, 0, 0.2);
    brandGroup.add(coreLight);

    // 2.4 4 Crosshair Membrane Markers (#006565 from logo.svg)
    const crossMat = new THREE.MeshStandardMaterial({ color: 0x006565, metalness: 0.5, roughness: 0.3 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.06), crossMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.06), crossMat);
    crossV.position.z = 0.04;
    crossH.position.z = 0.04;
    brandGroup.add(crossV);
    brandGroup.add(crossH);

    // 2.5 Orbiting Dual Holographic Gimbal Rings (Turquoise & Cyan)
    const ring1Geo = new THREE.TorusGeometry(1.42, 0.025, 8, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 4;
    brandGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.28, 0.025, 8, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    brandGroup.add(ring2);

    // 2.6 Floating 3D Text Plaques for Identity ("ARSelNel" & "Science Adventure")
    const titlePlaque = createBrandTextPlane('ARSelNel', 'SCIENCE ADVENTURE', 2.8, 0.85);
    titlePlaque.position.set(0, -1.25, 0);
    brandGroup.add(titlePlaque);

    // 2.7 Floating Ambient Spark Particles (24 particles orbiting & floating)
    const particleGroup = new THREE.Group();
    const particleCount = 24;
    const particleMeshes = [];
    const pMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.85 });

    for (let p = 0; p < particleCount; p++) {
      const pMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04 + Math.random() * 0.03), pMat);
      const angle = (p / particleCount) * Math.PI * 2;
      const radius = 1.0 + Math.random() * 0.9;
      const pY = -0.8 + Math.random() * 1.8;
      pMesh.position.set(Math.cos(angle) * radius, pY, Math.sin(angle) * radius);
      pMesh.userData = { angle, radius, speed: 0.4 + Math.random() * 0.6, yBase: pY };
      particleGroup.add(pMesh);
      particleMeshes.push(pMesh);
    }
    brandGroup.add(particleGroup);

    centerGroup.add(brandGroup);

    // Register rotation & floating animation
    animatedObjects.push({
      update(t) {
        // Slow majestic rotation of ARSelNel 3D emblem
        brandGroup.rotation.y = t * 0.45;
        brandGroup.position.y = 2.4 + Math.sin(t * 1.5) * 0.09;

        // Gimbal rings counter-rotation
        ring1.rotation.z = t * 0.6;
        ring2.rotation.x = -t * 0.55;

        // Hologram pulse
        holoRing1.material.opacity = 0.55 + Math.sin(t * 3) * 0.25;

        // Particle floating simulation
        particleMeshes.forEach((pm) => {
          pm.userData.angle += 0.015 * pm.userData.speed;
          pm.position.x = Math.cos(pm.userData.angle) * pm.userData.radius;
          pm.position.z = Math.sin(pm.userData.angle) * pm.userData.radius;
          pm.position.y = pm.userData.yBase + Math.sin(t * 2 + pm.userData.angle) * 0.15;
        });
      }
    });

    // Laboratory Accessories (Microscopes and Bubbling Flasks)
    buildLabProps(centerGroup);

    parent.add(centerGroup);
  }

  // Lab props: Cartoon Microscope & Flasks on table
  function buildLabProps(parent) {
    // Microscope
    const microGroup = new THREE.Group();
    microGroup.position.set(1.4, 0.95, 0.8);
    microGroup.rotation.y = -Math.PI / 4;

    const microBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    microGroup.add(microBase);

    const microArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f766e })
    );
    microArm.position.set(0, 0.22, -0.1);
    microGroup.add(microArm);

    const eyepiece = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b })
    );
    eyepiece.position.set(0, 0.42, 0.02);
    eyepiece.rotation.x = Math.PI / 6;
    microGroup.add(eyepiece);

    parent.add(microGroup);

    // Colorful Chemical Flasks
    const flaskColors = [0xec4899, 0x10b981, 0x06b6d4];
    flaskColors.forEach((col, idx) => {
      const flask = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.26, 12),
        new THREE.MeshStandardMaterial({
          color: col,
          transparent: true,
          opacity: 0.85,
          roughness: 0.1
        })
      );
      const angle = (idx * 0.4) - 2.2;
      flask.position.set(Math.cos(angle) * 1.6, 1.08, Math.sin(angle) * 1.6);
      parent.add(flask);
    });

    // Colorful Test Tube Rack on central table
    const ttRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.14, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 })
    );
    ttRack.position.set(-1.4, 0.98, 0.6);
    ttRack.rotation.y = Math.PI / 4;
    parent.add(ttRack);

    const ttColors = [0x22c55e, 0x06b6d4, 0xec4899, 0xf59e0b];
    ttColors.forEach((col, idx) => {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
      );
      const angle = Math.PI / 4;
      const offDist = -0.18 + idx * 0.12;
      tube.position.set(-1.4 + offDist * Math.cos(angle), 1.08, 0.6 - offDist * Math.sin(angle));
      parent.add(tube);
    });
  }

  // Wall posters: KSSM Animal Cell and Plant Cell
  function buildPosters(parent) {
    // Animal Cell Poster on Back Wall Left
    const animalPoster = createPosterPlane(
      '🔬 CARTA SEL HAIWAN KSSM',
      ['• Nukleus (Kawal aktiviti)', '• Membran Sel (Separuh telap)', '• Sitoplasma (Tindak balas)', '• Tiada Dinding Sel / Kloroplas'],
      '#3b82f6'
    );
    animalPoster.position.set(-5, 2.8, 10.7);
    animalPoster.rotation.y = Math.PI;
    parent.add(animalPoster);

    // Plant Cell Poster on Back Wall Right
    const plantPoster = createPosterPlane(
      '🌿 CARTA SEL TUMBUHAN KSSM',
      ['• Dinding Sel (Sokongan tetap)', '• Kloroplas (Fotosintesis)', '• Vakuol Besar (Kesegahan)', '• Nukleus & Sitoplasma'],
      '#10b981'
    );
    plantPoster.position.set(5, 2.8, 10.7);
    plantPoster.rotation.y = Math.PI;
    parent.add(plantPoster);
  }

  // Futuristic Wall Panels, Glowing LED Conduits, and Science Telemetry Displays
  function buildFuturisticWallDecorations(parent) {
    const wallDecorGroup = new THREE.Group();
    wallDecorGroup.name = 'FuturisticWallDecor';

    // 1. Dual Glowing Neon Conduit Lines running horizontally along walls
    // Upper line (Lavender / Purple at Y = 4.2)
    const upperTrimMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const trimLeftUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 21.6), upperTrimMat);
    trimLeftUpper.position.set(-8.78, 4.2, 0);
    wallDecorGroup.add(trimLeftUpper);

    const trimRightUpper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 21.6), upperTrimMat);
    trimRightUpper.position.set(8.78, 4.2, 0);
    wallDecorGroup.add(trimRightUpper);

    // Mid line (Cyan / Turquoise at Y = 2.4)
    const midTrimMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const trimLeftMid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 21.6), midTrimMat);
    trimLeftMid.position.set(-8.78, 2.4, 0);
    wallDecorGroup.add(trimLeftMid);

    const trimRightMid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 21.6), midTrimMat);
    trimRightMid.position.set(8.78, 2.4, 0);
    wallDecorGroup.add(trimRightMid);

    // 2. Vertical LED Accent Pillars between station bays (at Z = -8, -4, 0, 4, 8)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    [-8, -4, 0, 4, 8].forEach(z => {
      // Left Wall Pillars
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.6, 0.35), pillarMat);
      pL.position.set(-8.82, 2.5, z);
      wallDecorGroup.add(pL);

      const pLightL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 4.4, 0.1), (z % 8 === 0 ? upperTrimMat : midTrimMat));
      pLightL.position.set(-8.72, 2.5, z);
      wallDecorGroup.add(pLightL);

      // Right Wall Pillars
      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.6, 0.35), pillarMat);
      pR.position.set(8.82, 2.5, z);
      wallDecorGroup.add(pR);

      const pLightR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 4.4, 0.1), (z % 8 === 0 ? upperTrimMat : midTrimMat));
      pLightR.position.set(8.72, 2.5, z);
      wallDecorGroup.add(pLightR);
    });

    // 3. Four Science Wall Displays on side walls
    const display1 = createPosterPlane(
      '🧬 ANALISIS STRUKTUR DNA',
      ['• Heliks ganda di dalam nukleus', '• Mengawal pewarisan genetik sel', '• Menentukan sintesis protein'],
      '#8b5cf6'
    );
    display1.scale.set(0.72, 0.72, 1);
    display1.position.set(-8.72, 3.2, 4);
    display1.rotation.y = Math.PI / 2;
    wallDecorGroup.add(display1);

    const display2 = createPosterPlane(
      '⚡ PENJANAAN TENAGA ATP',
      ['• Mitokondrion: Pusat Tenaga Sel', '• Respirasi sel menghasilkan tenaga', '• Membebaskan molekul ATP'],
      '#f97316'
    );
    display2.scale.set(0.72, 0.72, 1);
    display2.position.set(-8.72, 3.2, -4);
    display2.rotation.y = Math.PI / 2;
    wallDecorGroup.add(display2);

    const display3 = createPosterPlane(
      '🌿 FOTOSINTESIS KLOROPLAS',
      ['• Klorofil menyerap cahaya suria', '• Karbon dioksida + Air -> Glukosa', '• Membebaskan oksigen ke udara'],
      '#22c55e'
    );
    display3.scale.set(0.72, 0.72, 1);
    display3.position.set(8.72, 3.2, -4);
    display3.rotation.y = -Math.PI / 2;
    wallDecorGroup.add(display3);

    const display4 = createPosterPlane(
      '🛡️ MEMBRAN & TEKANAN TURGOR',
      ['• Membran sel bersifat separa telap', '• Vakuol besar mengekalkan kesegahan', '• Dinding sel memberi sokongan'],
      '#06b6d4'
    );
    display4.scale.set(0.72, 0.72, 1);
    display4.position.set(8.72, 3.2, 4);
    display4.rotation.y = -Math.PI / 2;
    wallDecorGroup.add(display4);

    parent.add(wallDecorGroup);
  }

  // Glowing Cyan & Violet Floor Guide Lines & Station Connectors
  function buildFuturisticFloorRunners(parent) {
    const floorRunnersGroup = new THREE.Group();
    floorRunnersGroup.name = 'FuturisticFloorRunners';

    const runnerMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45
    });
    const crossMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35
    });

    // Left and right main walkway runners (running along Z from -8.5 to 8.5 at X = -5.0 and X = 5.0)
    const runnerL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 17.0), runnerMat);
    runnerL.position.set(-5.0, 0.015, 0);
    floorRunnersGroup.add(runnerL);

    const runnerR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 17.0), runnerMat);
    runnerR.position.set(5.0, 0.015, 0);
    floorRunnersGroup.add(runnerR);

    // Cross connectors leading to station rows at Z = -6, -2, 2, 6
    [-6, -2, 2, 6].forEach(z => {
      // Line from center corridor to left station
      const branchL = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.012, 0.035), crossMat);
      branchL.position.set(-6.15, 0.015, z);
      floorRunnersGroup.add(branchL);

      // Line from center corridor to right station
      const branchR = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.012, 0.035), crossMat);
      branchR.position.set(6.15, 0.015, z);
      floorRunnersGroup.add(branchR);

      // Chevrons pointing towards stations
      const arrowGeo = new THREE.ConeGeometry(0.12, 0.22, 3);
      const arrL = new THREE.Mesh(arrowGeo, runnerMat);
      arrL.rotation.z = Math.PI / 2;
      arrL.rotation.x = -Math.PI / 2;
      arrL.position.set(-6.0, 0.018, z);
      floorRunnersGroup.add(arrL);

      const arrR = new THREE.Mesh(arrowGeo, runnerMat);
      arrR.rotation.z = -Math.PI / 2;
      arrR.rotation.x = -Math.PI / 2;
      arrR.position.set(6.0, 0.018, z);
      floorRunnersGroup.add(arrR);
    });

    parent.add(floorRunnersGroup);
  }

  // Corner Sci-Fi Lab Equipment: Computer Console, DNA Pillars & Secondary Workbench
  function buildCornerLabDecorations(parent) {
    const cornerGroup = new THREE.Group();
    cornerGroup.name = 'CornerLabDecorations';

    // 1. Futuristic Computer Server Console (Back-Left Corner: X = -6.8, Z = 9.2)
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(-6.8, 0, 9.2);
    consoleGroup.rotation.y = Math.PI / 4;

    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.8), deskMat);
    desk.position.y = 0.425;
    consoleGroup.add(desk);

    // Glowing Cyan Desk Trim
    const deskTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.82, 0.04, 0.82),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    deskTrim.position.y = 0.85;
    consoleGroup.add(deskTrim);

    // Curved Sci-Fi Monitor Screen
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const screen = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16, 1, true, -Math.PI / 6, Math.PI / 3), screenMat);
    screen.position.set(0, 1.15, -0.15);
    screen.rotation.y = Math.PI;
    consoleGroup.add(screen);

    // Keyboard & Server Lights
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.3), new THREE.MeshBasicMaterial({ color: 0x334155 }));
    kb.position.set(0, 0.86, 0.15);
    consoleGroup.add(kb);

    cornerGroup.add(consoleGroup);

    // 2. Secondary Science Workbench (Back-Right Corner: X = 6.8, Z = 9.2)
    const benchGroup = new THREE.Group();
    benchGroup.position.set(6.8, 0, 9.2);
    benchGroup.rotation.y = -Math.PI / 4;

    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.8), deskMat);
    bench.position.y = 0.425;
    benchGroup.add(bench);

    const benchTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.82, 0.04, 0.82),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    benchTrim.position.y = 0.85;
    benchGroup.add(benchTrim);

    // Test Tube Rack on bench
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.18), rackMat);
    rack.position.set(0, 0.96, 0);
    benchGroup.add(rack);

    const ttColors = [0x22c55e, 0x06b6d4, 0xec4899, 0xf59e0b];
    ttColors.forEach((c, idx) => {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.28, 8),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85 })
      );
      tube.position.set(-0.2 + idx * 0.13, 1.05, 0);
      benchGroup.add(tube);
    });

    cornerGroup.add(benchGroup);

    // 3. Two Decorative Rotating DNA Hologram Columns in Front Corners (X = -7.5, Z = -9.2 and X = 7.5, Z = -9.2)
    const createDnaColumn = (x, z) => {
      const dnaGroup = new THREE.Group();
      dnaGroup.position.set(x, 0, z);

      // Base & Top Pedestal Caps
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
      const baseCap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.25, 16), capMat);
      baseCap.position.y = 0.125;
      dnaGroup.add(baseCap);

      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.25, 16), capMat);
      topCap.position.y = 4.75;
      dnaGroup.add(topCap);

      // Glass Enclosure Cylinder
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 4.4, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      );
      glass.position.y = 2.45;
      dnaGroup.add(glass);

      // Rotating Helix Rungs inside
      const helixGroup = new THREE.Group();
      helixGroup.position.y = 0.4;
      const rungCount = 14;
      const rungColors = [0x22c55e, 0x38bdf8, 0xa855f7, 0xf43f5e];
      for (let r = 0; r < rungCount; r++) {
        const rungMat = new THREE.MeshBasicMaterial({ color: rungColors[r % rungColors.length] });
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.52, 6), rungMat);
        const yPos = 0.25 + (r * 0.26);
        const rotY = (r * 0.45);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = rotY;
        rung.position.set(0, yPos, 0);
        helixGroup.add(rung);

        const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const nodeL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), nodeMat);
        nodeL.position.set(Math.cos(rotY) * 0.26, yPos, Math.sin(rotY) * 0.26);
        helixGroup.add(nodeL);

        const nodeR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), nodeMat);
        nodeR.position.set(-Math.cos(rotY) * 0.26, yPos, -Math.sin(rotY) * 0.26);
        helixGroup.add(nodeR);
      }
      dnaGroup.add(helixGroup);

      animatedObjects.push({
        update(t) {
          helixGroup.rotation.y = t * 0.75;
        }
      });

      return dnaGroup;
    };

    cornerGroup.add(createDnaColumn(-7.5, -9.2));
    cornerGroup.add(createDnaColumn(7.5, -9.2));

    parent.add(cornerGroup);
  }

  // ==============================================================================
  // HIGH-QUALITY GLB ORGANELLE LOADER, CACHE, CLONER & THREE.BOX3 AUTO-FIT ENGINE
  // ==============================================================================

  // Bina model 3D Sitoplasma separa lut sinar bercirikan cecair gel biologi hidup (cytosol matrix + cyclosis streaming)
  // Menepati arahan KSSM & sains sel: jeli separa lut sinar dengan organel terampai, bukan pinjaman model organel lain.
  function buildCytoplasmGelVisual() {
    const gelGroup = new THREE.Group();
    gelGroup.name = 'Cytoplasm_Gel_Visual';

    // 1. Lapisan Gel Luar (Semi-translucent colloidal gel fluid — Biru cair separa lutsinar)
    const outerGeo = new THREE.IcosahedronGeometry(0.48, 3);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.54,
      roughness: 0.16,
      metalness: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    gelGroup.add(outerMesh);

    // 2. Lapisan Sol / Matriks Dalaman (Colloidal core — Biru muda / sian lembut)
    const innerGeo = new THREE.IcosahedronGeometry(0.36, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0369a1,
      emissiveIntensity: 0.20,
      transparent: true,
      opacity: 0.36,
      roughness: 0.24,
      metalness: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    gelGroup.add(innerMesh);

    // 3. Jaringan Sitoskeleton (Microfilaments & Microtubules lattice)
    const cytoskelGroup = new THREE.Group();
    const fiberColors = [0x06b6d4, 0xf59e0b, 0xa855f7];
    for (let f = 0; f < 6; f++) {
      const fCol = fiberColors[f % fiberColors.length];
      const fiberMat = new THREE.MeshStandardMaterial({
        color: fCol,
        emissive: fCol,
        emissiveIntensity: 0.20,
        roughness: 0.35,
        metalness: 0.0,
        transparent: true,
        opacity: 0.78
      });
      const fiber = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.62, 8), fiberMat);
      fiber.rotation.set(
        (f * Math.PI) / 3 + 0.2,
        (f * Math.PI) / 4 + 0.1,
        (f * Math.PI) / 5
      );
      cytoskelGroup.add(fiber);
    }
    gelGroup.add(cytoskelGroup);

    // 4. Granul & Vesikel Terampai (Suspended metabolic granules, ribosomes & enzymes)
    const granulesGroup = new THREE.Group();
    const granColors = [0x67e8f9, 0xfde047, 0xf472b6, 0x4ade80, 0xa78bfa];
    const granuleMeshes = [];
    for (let g = 0; g < 14; g++) {
      const gCol = granColors[g % granColors.length];
      const gMat = new THREE.MeshStandardMaterial({
        color: gCol,
        emissive: gCol,
        emissiveIntensity: 0.20,
        roughness: 0.3,
        metalness: 0.0
      });
      const gSize = 0.028 + (g % 3) * 0.012;
      const gMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(gSize), gMat);
      const angle = (g / 14) * Math.PI * 2;
      const dist = 0.14 + ((g * 7) % 10) * 0.018;
      const yOff = ((g % 5) - 2) * 0.07;
      gMesh.position.set(Math.cos(angle) * dist, yOff, Math.sin(angle) * dist);
      gMesh.userData = {
        orbitAngle: angle,
        orbitDist: dist,
        orbitSpeed: 0.4 + (g % 4) * 0.2,
        baseY: yOff
      };
      granulesGroup.add(gMesh);
      granuleMeshes.push(gMesh);
    }
    gelGroup.add(granulesGroup);

    // 5. Halo Cahaya Sitosol (Bioluminescent aura)
    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.58, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    auraRing.rotation.x = Math.PI / 2;
    gelGroup.add(auraRing);

    gelGroup.userData = {
      isCytoplasmGel: true,
      outerMesh,
      innerMesh,
      cytoskelGroup,
      granuleMeshes,
      updateAnimation(elapsedTime) {
        if (outerMesh) {
          const s = 1.0 + Math.sin(elapsedTime * 1.8) * 0.035;
          outerMesh.scale.set(s, 1.0 + Math.cos(elapsedTime * 1.5) * 0.03, s);
        }
        if (innerMesh) {
          const sIn = 1.0 + Math.cos(elapsedTime * 1.6) * 0.04;
          innerMesh.scale.set(sIn, sIn, sIn);
        }
        if (cytoskelGroup) {
          cytoskelGroup.rotation.y = elapsedTime * 0.15;
        }
        if (granuleMeshes) {
          granuleMeshes.forEach(gm => {
            gm.userData.orbitAngle += gm.userData.orbitSpeed * 0.015;
            gm.position.x = Math.cos(gm.userData.orbitAngle) * gm.userData.orbitDist;
            gm.position.z = Math.sin(gm.userData.orbitAngle) * gm.userData.orbitDist;
            gm.position.y = gm.userData.baseY + Math.sin(elapsedTime * 2.0 + gm.userData.orbitDist) * 0.03;
            gm.rotation.x += 0.02;
            gm.rotation.y += 0.03;
          });
        }
      }
    };

    return gelGroup;
  }

  const STATION_GLB_MAP = {
    nucleus: {
      key: 'nucleus',
      stationNumber: 1,
      stationId: 'stn-1-nucleus',
      label: 'Nukleus',
      url: '../models/nucleus_opt.glb',
      fallbackUrl: '../models/nucleus.glb',
      targetSize3D: 0.95,
      targetSizeARWorld: 0.90,
      targetSizePreview: 1.35,
      targetSizeMini: 0.32,
      rot: [0.16, -0.35, 0],
      tableClearanceY: 0.14
    },
    membrane: {
      key: 'membrane',
      stationNumber: 2,
      stationId: 'stn-2-membrane',
      label: 'Membran Sel',
      url: '../models/plasma_membrane_opt.glb',
      fallbackUrl: '../models/plasma_membrane.glb',
      targetSize3D: 1.25,
      targetSizeARWorld: 0.95,
      targetSizePreview: 1.50,
      targetSizeMini: 0.38,
      rot: [0.22, 0.25, Math.PI],
      tableClearanceY: 0.14
    },
    cytoplasm: {
      key: 'cytoplasm',
      stationNumber: 3,
      stationId: 'stn-3-cytoplasm',
      label: 'Sitoplasma',
      url: 'cytoplasm_gel_visual',
      fallbackUrl: 'cytoplasm_gel_visual',
      targetSize3D: 1.10,
      targetSizeARWorld: 0.85,
      targetSizePreview: 1.35,
      targetSizeMini: 0.35,
      rot: [0, 0, 0],
      tableClearanceY: 0.14
    },
    mitochondria: {
      key: 'mitochondria',
      stationNumber: 4,
      stationId: 'stn-4-mitochondria',
      label: 'Mitokondrion',
      url: '../models/mitochondria.glb',
      fallbackUrl: '../models/mitochondria.glb',
      targetSize3D: 1.16,
      targetSizeARWorld: 0.92,
      targetSizePreview: 1.48,
      targetSizeMini: 0.36,
      rot: [0.24, -0.30, 0.10],
      tableClearanceY: 0.14
    },
    chloroplast: {
      key: 'chloroplast',
      stationNumber: 5,
      stationId: 'stn-5-chloroplast',
      label: 'Kloroplas',
      url: '../models/chloroplast%20(1).glb',
      fallbackUrl: '../models/chloroplast.glb',
      targetSize3D: 1.15,
      targetSizeARWorld: 0.90,
      targetSizePreview: 1.40,
      targetSizeMini: 0.35,
      rot: [0.35, 0.20, 0],
      tableClearanceY: 0.14
    },
    wall: {
      key: 'wall',
      stationNumber: 6,
      stationId: 'stn-6-cellwall',
      label: 'Dinding Sel',
      url: '../models/cell_wall.glb',
      fallbackUrl: '../models/cell_wall%20(1).glb',
      targetSize3D: 1.15,
      targetSizeARWorld: 0.90,
      targetSizePreview: 1.40,
      targetSizeMini: 0.35,
      rot: [0.20, 0.30, 0],
      tableClearanceY: 0.14
    },
    vacuole: {
      key: 'vacuole',
      stationNumber: 7,
      stationId: 'stn-7-vacuole',
      label: 'Vakuol',
      url: '../models/vacuole.glb',
      fallbackUrl: '../models/vacuole%20(1).glb',
      targetSize3D: 1.20,
      targetSizeARWorld: 0.90,
      targetSizePreview: 1.40,
      targetSizeMini: 0.35,
      rot: [0.20, 0.25, 0],
      tableClearanceY: 0.14
    },
    animal: {
      key: 'animal',
      stationNumber: 8,
      stationId: 'stn-8-comparison',
      label: 'Sel Haiwan',
      url: '../models/animal_cell_final.glb',
      fallbackUrl: '../models/animal_cell_final.glb',
      targetSize3D: 0.72,
      targetSizeARWorld: 0.85,
      targetSizePreview: 0.95,
      targetSizeMini: 0.32,
      rot: [0.18, -0.25, 0],
      tableClearanceY: 0.20
    },
    plant: {
      key: 'plant',
      stationNumber: 8,
      stationId: 'stn-8-comparison',
      label: 'Sel Tumbuhan',
      url: '../models/plantcellnew.glb',
      fallbackUrl: '../models/plant_cell.glb',
      targetSize3D: 0.76,
      targetSizeARWorld: 0.88,
      targetSizePreview: 0.98,
      targetSizeMini: 0.32,
      rot: [0.18, 0.25, 0],
      tableClearanceY: 0.20
    },
    er: {
      key: 'er',
      stationNumber: 8,
      stationId: 'stn-8-comparison',
      label: 'Retikulum Endoplasma',
      url: '../models/endoplasmic_reticulum_opt.glb',
      fallbackUrl: '../models/endoplasmic_reticulum.glb',
      targetSize3D: 1.15,
      targetSizeARWorld: 0.88,
      targetSizePreview: 1.40,
      targetSizeMini: 0.32,
      rot: [0.26, 0.20, 0],
      tableClearanceY: 0.14
    },
    chest: {
      key: 'chest',
      stationNumber: 99,
      stationId: 'treasure_chest',
      label: 'Peti Harta Karun',
      url: '../models/treasure_chests_asset_pack.glb',
      fallbackUrl: '../models/treasure_chests_asset_pack.glb',
      targetSize3D: 0.90,
      targetSizeARWorld: 0.95,
      targetSizePreview: 1.20,
      targetSizeMini: 0.35,
      rot: [0, 0, 0],
      tableClearanceY: 0.14
    }
  };

  const cachedOrganelleGLBs = {};
  const pendingGLBPromises = {};
  const glbDiagnostics = {};
  let erExhibitGroup = null;

  // Gabungkan mesh yang berkongsi material yang sama untuk mengurangkan draw calls pada iPad/mudah alih
  // sambil mengekalkan 100% bentuk, warna PBR dan tekstur asal model GLB
  function batchOptimizeGLBScene(sourceScene) {
    sourceScene.updateMatrixWorld(true);
    const meshes = [];
    sourceScene.traverse(node => {
      if (node.isMesh && node.geometry) {
        if (node.name === 'Labels') {
          node.visible = false;
          return;
        }
        meshes.push(node);
      }
    });

    // Hanya gabungkan jika model mempunyai banyak pecahan mesh (> 16 mesh, cth: plasma_membrane 38 mesh / ER 10,008 mesh)
    if (meshes.length <= 16) {
      return sourceScene;
    }

    const byMaterial = new Map();
    meshes.forEach(m => {
      const mat = Array.isArray(m.material) ? m.material[0] : m.material;
      const key = mat ? mat.uuid : 'default';
      if (!byMaterial.has(key)) {
        byMaterial.set(key, { material: mat, list: [] });
      }
      byMaterial.get(key).list.push(m);
    });

    const batchedGroup = new THREE.Group();
    batchedGroup.name = (sourceScene.name || 'GLBScene') + '_Batched';

    byMaterial.forEach(({ material, list }) => {
      let totalVerts = 0;
      let totalIndices = 0;
      let hasUV = false;

      const worldGeos = list.map(mesh => {
        const g = mesh.geometry.clone();
        g.applyMatrix4(mesh.matrixWorld);
        if (!g.attributes.normal) g.computeVertexNormals();
        const pos = g.attributes.position;
        totalVerts += pos.count;
        if (g.attributes.uv) hasUV = true;
        if (g.index) {
          totalIndices += g.index.count;
        } else {
          totalIndices += pos.count;
        }
        return g;
      });

      const mergedPos = new Float32Array(totalVerts * 3);
      const mergedNorm = new Float32Array(totalVerts * 3);
      const mergedUV = hasUV ? new Float32Array(totalVerts * 2) : null;
      const mergedIdx = new Uint32Array(totalIndices);

      let vOffset = 0;
      let iOffset = 0;

      worldGeos.forEach(g => {
        const pos = g.attributes.position;
        const norm = g.attributes.normal;
        const uv = g.attributes.uv;
        const count = pos.count;

        mergedPos.set(pos.array, vOffset * 3);
        if (norm && norm.array.length === count * 3) {
          mergedNorm.set(norm.array, vOffset * 3);
        }
        if (hasUV && uv && uv.array.length === count * 2) {
          mergedUV.set(uv.array, vOffset * 2);
        }

        if (g.index) {
          const idxArr = g.index.array;
          for (let k = 0; k < idxArr.length; k++) {
            mergedIdx[iOffset + k] = idxArr[k] + vOffset;
          }
          iOffset += idxArr.length;
        } else {
          for (let k = 0; k < count; k++) {
            mergedIdx[iOffset + k] = vOffset + k;
          }
          iOffset += count;
        }
        vOffset += count;
        g.dispose();
      });

      const mergedGeo = new THREE.BufferGeometry();
      mergedGeo.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
      mergedGeo.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
      if (mergedUV) {
        mergedGeo.setAttribute('uv', new THREE.BufferAttribute(mergedUV, 2));
      }
      mergedGeo.setIndex(new THREE.BufferAttribute(mergedIdx, 1));
      mergedGeo.computeBoundingBox();
      mergedGeo.computeBoundingSphere();

      const batchedMesh = new THREE.Mesh(mergedGeo, material);
      batchedMesh.name = (material && material.name) ? `Batched_${material.name}` : 'Batched_OrganelleMesh';
      batchedGroup.add(batchedMesh);
    });

    return batchedGroup;
  }

  // Fasa A.5: Pemulihan & Penambahbaikan Material PBR Organel Pendidikan Sains Tingkatan 1
  // Memastikan semua 8 stesen mempunyai warna saintifik yang terang, jelas, bertekstur & tidak pernah hitam (#000000) pada iPad Safari
  function applyOrganelleEducationalMaterial(m, key, nodeName = '', cloneTextureWrapper = false) {
    if (!m) return m;
    let c = m.clone();

    // Tukar MeshBasicMaterial (contoh: KHR_materials_unlit pada plantcellnew.glb) kepada MeshStandardMaterial
    // supaya model mempunyai kedalaman pencahayaan 3D (bukan flat) dan sokongan emissive lembut
    if (!c.isMeshStandardMaterial || c.type !== 'MeshStandardMaterial') {
      const upgraded = new THREE.MeshStandardMaterial({
        name: c.name || 'UpgradedOrganelleMat',
        color: c.color ? c.color.clone() : new THREE.Color(0xffffff),
        map: c.map || null,
        transparent: !!c.transparent,
        opacity: typeof c.opacity === 'number' ? c.opacity : 1.0,
        alphaTest: c.alphaTest || 0,
        roughness: 0.42,
        metalness: 0.0,
        side: THREE.DoubleSide
      });
      c = upgraded;
    }

    c.side = THREE.DoubleSide;
    c.metalness = 0.0;
    c.metalnessMap = null;
    c.vertexColors = false; // Elakkan atribut COLOR_0 gelap menghitamkan tekstur/warna

    if (c.map) {
      if (cloneTextureWrapper && c.map.image) {
        const clonedTex = c.map.clone();
        clonedTex.image = c.map.image;
        clonedTex.flipY = c.map.flipY;
        clonedTex.encoding = THREE.sRGBEncoding;
        clonedTex.needsUpdate = true;
        c.map = clonedTex;
      } else {
        c.map.encoding = THREE.sRGBEncoding;
        initTextureForGPU(c.map);
      }
    }
    if (c.emissiveMap) {
      c.emissiveMap.encoding = THREE.sRGBEncoding;
    }

    const matName = String(c.name || '').toLowerCase();
    const nName = String(nodeName || '').toLowerCase();

    if (key === 'nucleus') {
      // Stesen 1 — Nukleus: Ungu / violet kaya dengan nukleolus lebih terang & kromatin jelas
      c.map = null;
      c.normalMap = null;
      if (matName.includes('material.002') || nName.includes('nucleolus') || nName.includes('material_002')) {
        // Nukleolus (Teras dalaman lebih terang — magenta / violet cerah)
        c.color.setHex(0xec4899);
        c.emissive.setHex(0x831843);
        c.emissiveIntensity = 0.22;
        c.roughness = 0.40;
      } else if (matName.includes('material.003') || nName.includes('chromatin') || nName.includes('material_003')) {
        // Benang Kromatin / DNA (Kuning keemasan jelas)
        c.color.setHex(0xf59e0b);
        c.emissive.setHex(0x78350f);
        c.emissiveIntensity = 0.18;
        c.roughness = 0.42;
      } else if (matName.includes('material.004') || nName.includes('material_004')) {
        // Liang Nukleus / Nuclear Pores (Ungu lavender terang)
        c.color.setHex(0xd8b4fe);
        c.emissive.setHex(0x581c87);
        c.emissiveIntensity = 0.15;
        c.roughness = 0.45;
      } else {
        // Membran Nukleus Luar (Material.001 — Ungu / Violet diraja yang jelas & kontras tinggi)
        c.color.setHex(0x6d28d9);
        c.emissive.setHex(0x2e1065);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.55;
      }
    } else if (key === 'membrane') {
      // Stesen 2 — Membran Sel: Kuning lembut / biru lapisan fosfolipid
      if (matName.includes('lipid')) {
        c.color.setHex(0xeab308);
        c.emissive.setHex(0x713f12);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.48;
      } else if (matName.includes('protein1') || matName.includes('protein3')) {
        c.color.setHex(0x0284c7);
        c.emissive.setHex(0x0c4a6e);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.44;
      } else if (matName.includes('protein2')) {
        c.color.setHex(0xdb2777);
        c.emissive.setHex(0x831843);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.45;
      } else {
        c.color.setHex(0x0d9488);
        c.emissive.setHex(0x134e4a);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.45;
      }
    } else if (key === 'mitochondria') {
      // Stesen 4 — Mitokondrion: Merah-jingga kaya dengan lipatan dalaman (krista) jelas
      if (matName.includes('object_2') || matName.includes('object_4') || nName.includes('object_2') || nName.includes('object_4')) {
        // Lipatan dalaman krista & matriks (Jingga keemasan kontras dengan kulit luar merah-jingga)
        c.color.setHex(0xf97316);
        c.emissive.setHex(0x9a3412);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.50;
      } else {
        // Membran luar & keratan rentas (Merah-jingga pekat #dc2626 / #ea580c)
        c.color.setHex(0xdc2626);
        c.emissive.setHex(0x7f1d1d);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.52;
      }
    } else if (key === 'chloroplast') {
      // Stesen 5 — Kloroplas: Hijau terang dengan cakera tilakoid hijau gelap
      if (matName.includes('06_-_default')) {
        // Cakera tilakoid / grana (Hijau zamrud gelap yang jelas)
        c.color.setHex(0x14532d);
        c.emissive.setHex(0x052e16);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.45;
      } else {
        // Membran kloroplas & stroma (Hijau terang)
        c.color.setHex(0x16a34a);
        c.emissive.setHex(0x14532d);
        c.emissiveIntensity = 0.14;
        c.roughness = 0.48;
      }
    } else if (key === 'wall') {
      // Stesen 6 — Dinding Sel: Hijau zamrud / struktur selulosa jelas
      c.color.setHex(0x059669);
      c.emissive.setHex(0x064e3b);
      c.emissiveIntensity = 0.14;
      c.roughness = 0.48;
    } else if (key === 'vacuole') {
      // Stesen 7 — Vakuol: Biru muda separa lutsinar
      if (matName.includes('material.022') || c.transparent) {
        c.color.setHex(0x38bdf8);
        c.emissive.setHex(0x0369a1);
        c.emissiveIntensity = 0.15;
        c.transparent = true;
        c.opacity = 0.62;
        c.roughness = 0.28;
      } else {
        c.color.setHex(0x0284c7);
        c.emissive.setHex(0x0c4a6e);
        c.emissiveIntensity = 0.16;
        c.roughness = 0.40;
      }
    } else if (key === 'er') {
      // Stesen 8 — Retikulum Endoplasma: Ungu / merah jambu berstruktur jelas
      if (matName.includes('cekirdek')) {
        c.color.setHex(0x7e22ce);
        c.emissive.setHex(0x3b0764);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.52;
      } else if (matName.includes('material.001')) {
        c.color.setHex(0xdb2777);
        c.emissive.setHex(0x500724);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.50;
      } else {
        c.color.setHex(0xc026d3);
        c.emissive.setHex(0x4a044e);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.52;
      }
    } else if (key === 'plant') {
      // Stesen 8 — Sel Tumbuhan (plantcellnew.glb): Hijau terang & struktur dalaman jelas tanpa bahagian hitam
      if (matName.includes('37')) {
        c.color.setHex(0x4ade80);
        c.emissive.setHex(0x14532d);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.50;
      } else if (matName.includes('36')) {
        c.color.setHex(0xfef08a);
        c.emissive.setHex(0x065f46);
        c.emissiveIntensity = 0.10;
        c.roughness = 0.48;
      } else {
        c.color.setHex(0x22c55e);
        c.emissive.setHex(0x14532d);
        c.emissiveIntensity = 0.12;
        c.roughness = 0.48;
      }
    } else if (key === 'animal') {
      // Stesen 8 — Sel Haiwan (animal_cell_final.glb, termasuk Jasad Golgi merah jambu / ungu lembut)
      if (c.roughness < 0.35) c.roughness = 0.48;
      if (c.color) {
        if (c.color.r < 0.26 && c.color.g < 0.18 && c.color.b < 0.45) {
          c.color.setHex(0x9333ea);
          c.emissive.setHex(0x3b0764);
          c.emissiveIntensity = 0.12;
        } else {
          c.emissive.copy(c.color).multiplyScalar(0.15);
          if (c.emissive.getHex() === 0) c.emissive.setHex(0x4a044e);
          c.emissiveIntensity = 0.85;
        }
      }
    } else {
      if (c.roughness < 0.25) c.roughness = 0.40;
      if (c.color && c.color.r < 0.15 && c.color.g < 0.15 && c.color.b < 0.15 && !c.map) {
        c.color.setHex(0xe2e8f0);
      }
      if (c.emissive && c.emissive.getHex() === 0) {
        c.emissive.setHex(0x1e293b);
        c.emissiveIntensity = 0.15;
      }
    }

    c.needsUpdate = true;
    return c;
  }

  // Muat turun & cache model GLB secara asynchronous dengan semakan ralat & statistik penuh
  function loadAndCacheOrganelleGLB(key) {
    const cfg = STATION_GLB_MAP[key];
    if (!cfg) return Promise.reject(new Error(`Tiada konfigurasi GLB untuk kunci: ${key}`));

    if (cachedOrganelleGLBs[key]) {
      return Promise.resolve(cachedOrganelleGLBs[key]);
    }
    if (pendingGLBPromises[key]) {
      return pendingGLBPromises[key];
    }

    // Untuk Sitoplasma, hasilkan visual gel biologi separa lut sinar beranimasi siklosis secara terus
    if (key === 'cytoplasm') {
      const gelScene = buildCytoplasmGelVisual();
      cachedOrganelleGLBs['cytoplasm'] = gelScene;
      glbDiagnostics['cytoplasm'] = {
        key: 'cytoplasm',
        label: cfg.label,
        stationNumber: cfg.stationNumber,
        stationId: cfg.stationId,
        url: 'cytoplasm_gel_visual',
        usedFallbackUrl: false,
        loaded: true,
        status: 'OK_BIOLOGICAL_GEL',
        loadMs: 1,
        rawMeshCount: 16,
        batchedMeshCount: 16,
        materialCount: 4,
        textureCount: 0,
        vertexCount: 380,
        triangleCount: 520
      };
      return Promise.resolve(gelScene);
    }

    if (typeof THREE.GLTFLoader === 'undefined') {
      return Promise.reject(new Error('THREE.GLTFLoader tidak tersedia'));
    }

    // Fasa A.5: Paksa GLTFLoader menggunakan THREE.TextureLoader (elemen <img> standard)
    // dan bukannya THREE.ImageBitmapLoader yang menyebabkan tekstur GLB menjadi hitam pada Safari iPadOS (Three.js PR #22426)
    if (typeof THREE !== 'undefined' && THREE.TextureLoader) {
      THREE.ImageBitmapLoader = THREE.TextureLoader;
    }

    const loader = new THREE.GLTFLoader();
    if (THREE.TextureLoader) {
      loader.textureLoader = new THREE.TextureLoader(loader.manager);
    }
    const t0 = performance.now();

    const tryLoadUrl = (urlToLoad, isFallback) => new Promise((resolve, reject) => {
      const candidateUrls = [
        urlToLoad,
        encodeURI(urlToLoad),
        decodeURI(urlToLoad),
        urlToLoad.replace(/^\.\.\//, ''),
        '/' + urlToLoad.replace(/^\.\.\//, '')
      ].filter((u, i, arr) => arr.indexOf(u) === i);

      let curIdx = 0;
      function attemptNext() {
        if (curIdx >= candidateUrls.length) {
          reject(new Error(`Fail GLB tidak dapat dimuatkan dari semua varian URL: ${urlToLoad}`));
          return;
        }
        const targetUrl = candidateUrls[curIdx++];
        loader.load(
          targetUrl,
          gltf => {
            if (!gltf || !gltf.scene) {
              attemptNext();
              return;
            }

            let rawMeshCount = 0;
            let vertexCount = 0;
            let triangleCount = 0;
            const matSet = new Set();
            const texSet = new Set();

            gltf.scene.traverse(node => {
              if (!node.isMesh) return;
              if (node.name === 'Labels' || node.name === 'Sphere' || node.name === 'gel-material') {
                node.visible = false;
                return;
              }
              rawMeshCount++;
              const g = node.geometry;
              if (g && g.attributes && g.attributes.position) {
                vertexCount += g.attributes.position.count;
                triangleCount += g.index ? (g.index.count / 3) : (g.attributes.position.count / 3);
              }
              const upgradeNodeMat = m => {
                if (!m) return m;
                const upgraded = applyOrganelleEducationalMaterial(m, key, node.name, false);
                matSet.add(upgraded.uuid);
                ['map', 'emissiveMap'].forEach(tKey => {
                  if (upgraded[tKey]) {
                    upgraded[tKey].encoding = THREE.sRGBEncoding;
                    initTextureForGPU(upgraded[tKey]);
                    texSet.add(upgraded[tKey].uuid);
                  }
                });
                ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach(tKey => {
                  if (upgraded[tKey]) texSet.add(upgraded[tKey].uuid);
                });
                return upgraded;
              };
              node.material = Array.isArray(node.material)
                ? node.material.map(upgradeNodeMat)
                : upgradeNodeMat(node.material);
            });

            const rawBox = new THREE.Box3().setFromObject(gltf.scene);
            const rawSize = rawBox.getSize(new THREE.Vector3());
            const rawCenter = rawBox.getCenter(new THREE.Vector3());

            const optimizedScene = batchOptimizeGLBScene(gltf.scene);
            let finalMeshCount = 0;
            optimizedScene.traverse(n => { if (n.isMesh && n.visible !== false) finalMeshCount++; });

            const loadMs = Math.round(performance.now() - t0);
            cachedOrganelleGLBs[key] = optimizedScene;
            if (key === 'animal') cachedGltfScenes.animal = optimizedScene;
            if (key === 'plant') cachedGltfScenes.plant = optimizedScene;

            glbDiagnostics[key] = {
              ...(glbDiagnostics[key] || {}),
              key,
              label: cfg.label,
              stationNumber: cfg.stationNumber,
              stationId: cfg.stationId,
              url: targetUrl,
              usedFallbackUrl: !!isFallback,
              loaded: true,
              status: 'OK',
              loadMs,
              rawMin: [+rawBox.min.x.toFixed(3), +rawBox.min.y.toFixed(3), +rawBox.min.z.toFixed(3)],
              rawMax: [+rawBox.max.x.toFixed(3), +rawBox.max.y.toFixed(3), +rawBox.max.z.toFixed(3)],
              rawSize: [+rawSize.x.toFixed(3), +rawSize.y.toFixed(3), +rawSize.z.toFixed(3)],
              rawCenter: [+rawCenter.x.toFixed(3), +rawCenter.y.toFixed(3), +rawCenter.z.toFixed(3)],
              rawMeshCount,
              batchedMeshCount: finalMeshCount,
              materialCount: matSet.size,
              textureCount: texSet.size,
              vertexCount,
              triangleCount: Math.round(triangleCount)
            };

            resolve(optimizedScene);
          },
          undefined,
          err => {
            attemptNext();
          }
        );
      }
      attemptNext();
    });

    pendingGLBPromises[key] = tryLoadUrl(cfg.url, false).catch(err => {
      if (cfg.fallbackUrl && cfg.fallbackUrl !== cfg.url) {
        return tryLoadUrl(cfg.fallbackUrl, true);
      }
      glbDiagnostics[key] = {
        key,
        label: cfg.label,
        url: cfg.url,
        loaded: false,
        status: 'FALLBACK_PROCEDURAL',
        error: String(err && err.message ? err.message : err)
      };
      throw err;
    });

    return pendingGLBPromises[key];
  }

  // Clone scene GLB yang telah di-cache, auto-center & auto-scale menggunakan THREE.Box3,
  // serta letakkan tepat di atas meja pameran tanpa menembusi meja atau terapung terlalu tinggi.
  function mountGLBIntoContainer(containerGroup, key, modeType, meta = {}) {
    const cfg = STATION_GLB_MAP[key];
    if (!cfg || !containerGroup) return Promise.resolve(false);

    const applyMetadataToTree = (rootObj, isGLB) => {
      const mergedMeta = {
        stationId: meta.stationId || cfg.stationId,
        stationNumber: meta.stationNumber || cfg.stationNumber,
        stationIndex: typeof meta.stationIndex === 'number' ? meta.stationIndex : (cfg.stationNumber - 1),
        id: meta.organelleId || key,
        organelleId: meta.organelleId || key,
        glbKey: key,
        isMiniStation: !!meta.isMiniStation,
        pickable: true,
        isGLBModel: !!isGLB
      };
      rootObj.userData = { ...rootObj.userData, ...mergedMeta };
      rootObj.traverse(child => {
        if (child.isMesh) {
          child.userData = { ...child.userData, ...mergedMeta };
          if (meta.registerARPickable && !arPickableObjects.includes(child)) {
            arPickableObjects.push(child);
          }
        }
      });
    };

    // Tandakan metadata pada fallback sedia ada sementara menunggu GLB selesai dimuatkan
    applyMetadataToTree(containerGroup, false);

    // Khas untuk Sitoplasma: Visual Gel Biologi Separa Lut Sinar
    if (key === 'cytoplasm') {
      const gelVisual = buildCytoplasmGelVisual();
      containerGroup.clear();
      containerGroup.add(gelVisual);
      containerGroup.userData.isGLBMounted = true;
      containerGroup.userData.glbKey = 'cytoplasm';
      containerGroup.userData.isCytoplasmGel = true;
      containerGroup.userData.gelVisual = gelVisual;
      if (meta.alignOnTable) {
        const tableTopY = typeof meta.tableTopY === 'number' ? meta.tableTopY : 0.97;
        const clearanceY = typeof meta.clearanceY === 'number' ? meta.clearanceY : (cfg.tableClearanceY || 0.14);
        const targetCenterY = tableTopY + clearanceY + 0.45;
        containerGroup.position.y = targetCenterY;
        containerGroup.userData.baseY = targetCenterY;
        containerGroup.userData.tableTopY = tableTopY;
        containerGroup.userData.clearanceY = clearanceY;
        containerGroup.userData.fittedMinY = +(targetCenterY - 0.45).toFixed(3);
        containerGroup.userData.fittedMaxY = +(targetCenterY + 0.45).toFixed(3);
      }
      applyMetadataToTree(containerGroup, true);
      return Promise.resolve(true);
    }

    return loadAndCacheOrganelleGLB(key)
      .then(cachedScene => {
        // Clone struktur scene & clone material supaya highlight emissive pada satu stesen tidak menjejaskan stesen lain
        const clonedScene = cachedScene.clone(true);
        clonedScene.traverse(node => {
          if (!node.isMesh) return;
          if (node.name === 'Labels' || node.name === 'Sphere' || node.name === 'gel-material') {
            node.visible = false;
            return;
          }
          const cloneMat = m => applyOrganelleEducationalMaterial(m, key, node.name, modeType === 'preview');
          node.material = Array.isArray(node.material) ? node.material.map(cloneMat) : cloneMat(node.material);
          node.castShadow = (modeType === '3d');
          node.receiveShadow = (modeType === '3d');
          node.frustumCulled = false; // Pastikan model organel sentiasa sedia di GPU tanpa risiko tekstur hilang apabila kamera pusing 360°
        });

        // 1. Kira THREE.Box3 asal & auto-center pada (0, 0, 0)
        clonedScene.updateMatrixWorld(true);
        const rawBox = new THREE.Box3().setFromObject(clonedScene);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const rawCenter = rawBox.getCenter(new THREE.Vector3());
        const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;

        let targetSize = cfg.targetSize3D || 1.05;
        if (modeType === 'ar-world') targetSize = cfg.targetSizeARWorld || 1.45;
        else if (modeType === 'preview') targetSize = cfg.targetSizePreview || 1.40;
        else if (modeType === 'mini') targetSize = cfg.targetSizeMini || 0.34;
        if (typeof meta.customTargetSize === 'number') targetSize = meta.customTargetSize;

        const scaleFactor = targetSize / maxDim;

        const centerWrap = new THREE.Group();
        centerWrap.name = `GLBCentered_${key}`;
        clonedScene.position.set(
          -rawCenter.x * scaleFactor,
          -rawCenter.y * scaleFactor,
          -rawCenter.z * scaleFactor
        );
        clonedScene.scale.setScalar(scaleFactor);
        centerWrap.add(clonedScene);

        const pivotWrap = new THREE.Group();
        pivotWrap.name = `GLBPivot_${key}`;
        const rot = meta.rot || cfg.rot || [0, 0, 0];
        pivotWrap.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
        pivotWrap.add(centerWrap);

        // 2. Kira THREE.Box3 dalam ruang tempatan (SEBELUM dimasukkan ke dalam containerGroup yang mempunyai transform dunia!)
        pivotWrap.updateMatrixWorld(true);
        const fittedBox = new THREE.Box3().setFromObject(pivotWrap);
        const fittedSize = fittedBox.getSize(new THREE.Vector3());
        const fittedCenter = fittedBox.getCenter(new THREE.Vector3());

        // Centerkan semula paksi X, Y, Z tepat pada (0, 0, 0) tempatan selepas putaran
        pivotWrap.position.set(-fittedCenter.x, -fittedCenter.y, -fittedCenter.z);

        // Bersihkan model prosedur lama dan gantikan dengan model GLB beresolusi tinggi
        containerGroup.clear();
        containerGroup.add(pivotWrap);

        if (meta.alignOnTable) {
          const tableTopY = typeof meta.tableTopY === 'number' ? meta.tableTopY : 0.97;
          const clearanceY = typeof meta.clearanceY === 'number' ? meta.clearanceY : (cfg.tableClearanceY || 0.14);
          const halfHeight = fittedSize.y / 2;
          const targetCenterY = tableTopY + clearanceY + halfHeight;
          containerGroup.position.y = targetCenterY;
          containerGroup.userData.baseY = targetCenterY;
          containerGroup.userData.tableTopY = tableTopY;
          containerGroup.userData.clearanceY = clearanceY;
          containerGroup.userData.fittedMinY = +(targetCenterY - halfHeight).toFixed(3);
          containerGroup.userData.fittedMaxY = +(targetCenterY + halfHeight).toFixed(3);
        }

        containerGroup.userData.isGLBMounted = true;
        containerGroup.userData.glbKey = key;
        containerGroup.userData.scaleFactor = +scaleFactor.toFixed(5);
        containerGroup.userData.fittedSize = [+fittedSize.x.toFixed(3), +fittedSize.y.toFixed(3), +fittedSize.z.toFixed(3)];

        applyMetadataToTree(containerGroup, true);

        // Simpan diagnostik per-mod untuk laporan & ujian automatik
        if (glbDiagnostics[key]) {
          if (!glbDiagnostics[key].mounts) glbDiagnostics[key].mounts = {};
          const worldPos = new THREE.Vector3();
          containerGroup.getWorldPosition(worldPos);
          glbDiagnostics[key].mounts[modeType] = {
            targetSize,
            scaleFactor: +scaleFactor.toFixed(5),
            fittedSize: [+fittedSize.x.toFixed(3), +fittedSize.y.toFixed(3), +fittedSize.z.toFixed(3)],
            localPos: [+containerGroup.position.x.toFixed(3), +containerGroup.position.y.toFixed(3), +containerGroup.position.z.toFixed(3)],
            worldPos: [+worldPos.x.toFixed(3), +worldPos.y.toFixed(3), +worldPos.z.toFixed(3)],
            tableTopY: meta.tableTopY || null,
            fittedMinY: containerGroup.userData.fittedMinY || null,
            fittedMaxY: containerGroup.userData.fittedMaxY || null
          };
        }

        return true;
      })
      .catch(err => {
        console.warn(`Fallback prosedur digunakan untuk ${key} (${modeType}):`, err);
        return false;
      });
  }

  // Laraskan kedudukan model prosedur (Stesen 3, 5, 6, 7) di atas meja menggunakan THREE.Box3
  function alignProceduralOnTable(containerGroup, tableTopY, clearanceY, meta = {}) {
    containerGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(containerGroup);
    const size = box.getSize(new THREE.Vector3());
    const halfH = (size.y || 0.6) / 2;
    const targetY = tableTopY + clearanceY + halfH;
    containerGroup.position.y = targetY;
    containerGroup.userData = {
      ...containerGroup.userData,
      stationId: meta.stationId,
      stationNumber: meta.stationNumber,
      stationIndex: meta.stationIndex,
      id: meta.organelleId,
      organelleId: meta.organelleId,
      pickable: true,
      isGLBMounted: false,
      baseY: targetY,
      tableTopY,
      clearanceY,
      fittedSize: [+size.x.toFixed(3), +size.y.toFixed(3), +size.z.toFixed(3)],
      fittedMinY: +(targetY - halfH).toFixed(3),
      fittedMaxY: +(targetY + halfH).toFixed(3)
    };
    containerGroup.traverse(child => {
      if (child.isMesh) {
        child.userData = {
          ...child.userData,
          stationId: meta.stationId,
          stationNumber: meta.stationNumber,
          stationIndex: meta.stationIndex,
          id: meta.organelleId,
          organelleId: meta.organelleId,
          pickable: true
        };
      }
    });
  }

  // Pameran Tambahan: Retikulum Endoplasma (menggunakan models/endoplasmic_reticulum.glb tanpa mengganggu 8 stesen utama)
  function buildSupplementaryERExhibit(parent) {
    const erGroup = new THREE.Group();
    erGroup.name = 'SupplementaryExhibit_EndoplasmicReticulum';
    erGroup.position.set(0, 0, -5.2);
    erGroup.userData = {
      stationId: 'exhibit-er',
      organelleId: 'er',
      isSupplementaryExhibit: true,
      title: 'Retikulum Endoplasma',
      description: 'Pameran Tambahan Sains Sel: Retikulum Endoplasma ialah rangkaian membran berlipat yang bersambung dengan membran nukleus. Ia berfungsi mengangkut protein (Retikulum Endoplasma Kasar yang mempunyai ribosom) serta mensintesis lipid (Retikulum Endoplasma Licin).'
    };

    // Meja Pameran Tambahan
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.9, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x11232e, metalness: 0.35, roughness: 0.35 })
    );
    baseMesh.position.y = 0.45;
    baseMesh.castShadow = true;
    erGroup.add(baseMesh);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.80, 0.10, 1.15),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    stripe.position.y = 0.89;
    erGroup.add(stripe);

    const plaque = createTextPlane('🧬 PAMERAN TAMBAHAN: RETIKULUM ENDOPLASMA', '#38bdf8', 1.85, 0.38);
    plaque.position.set(0, 2.28, -0.28);
    erGroup.add(plaque);

    const erContainer = new THREE.Group();
    erContainer.position.set(0, 1.38, 0.12);
    // Fallback prosedur sementara GLB dimuatkan secara malas (lazy load)
    const fallbackER = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.28, 0.08, 48, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
    );
    erContainer.add(fallbackER);
    erGroup.add(erContainer);

    // Lazy-load endoplasmic_reticulum selepas stesen utama dimulakan supaya permulaan pantas pada iPad
    setTimeout(() => {
      mountGLBIntoContainer(erContainer, 'er', '3d', {
        stationId: 'exhibit-er',
        stationNumber: 9,
        stationIndex: -2,
        organelleId: 'er',
        alignOnTable: true,
        tableTopY: 0.94,
        clearanceY: 0.14
      });
    }, 150);

    animatedObjects.push({
      update(t) {
        const baseY = erContainer.userData.baseY || 1.38;
        erContainer.rotation.y = t * 0.35;
        erContainer.position.y = baseY + Math.sin(t * 1.4) * 0.02;
      }
    });

    erExhibitGroup = erGroup;
    parent.add(erGroup);
  }

  // ==============================================================================
  // 8 INTERACTIVE STATIONS CREATION
  // ==============================================================================

  let walkthroughStationsGroup = null;

  function buildStations() {
    stationMeshes = [];

    if (!walkthroughStationsGroup) {
      walkthroughStationsGroup = new THREE.Group();
      walkthroughStationsGroup.name = 'WalkthroughStationsGroup';
      if (labEnvironmentGroup) {
        labEnvironmentGroup.add(walkthroughStationsGroup);
      } else {
        scene.add(walkthroughStationsGroup);
      }
    }
    walkthroughStationsGroup.clear();

    const stationNumToGLBKey = {
      1: 'nucleus',
      2: 'membrane',
      3: 'cytoplasm',
      4: 'mitochondria',
      5: 'chloroplast',
      6: 'wall',
      7: 'vacuole',
      8: 'comparison'
    };

    State.stations.forEach((stn, index) => {
      const stnGroup = new THREE.Group();
      stnGroup.name = `Station_${stn.number}_${stn.id}`;
      stnGroup.position.set(stn.pos.x, 0, stn.pos.z);
      stnGroup.rotation.y = stn.pos.rotY;
      stnGroup.userData = {
        stationId: stn.id,
        stationNumber: stn.number,
        stationIndex: index,
        organelleId: stn.id,
        pickable: true
      };

      // 1. Futuristic Kiosk Pedestal (Top of pedestal stripe is at y = 0.94)
      const baseGeo = new THREE.BoxGeometry(2.2, 0.9, 1.2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x11232e,
        metalness: 0.3,
        roughness: 0.4
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.45;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      stnGroup.add(baseMesh);

      // Neon Accent Base Stripe matching station color (top surface y = 0.88 + 0.06 = 0.94)
      const stripeGeo = new THREE.BoxGeometry(2.25, 0.12, 1.25);
      const stripeMat = new THREE.MeshBasicMaterial({ color: stn.colorHex });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.88;
      stnGroup.add(stripe);

      // Glowing Display Plinth Pad on top of the table for the 3D Organelle Model
      const padGeo = new THREE.CylinderGeometry(0.56, 0.62, 0.03, 28);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x0b1924,
        metalness: 0.6,
        roughness: 0.25,
        emissive: stn.colorHex,
        emissiveIntensity: 0.18
      });
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.set(0, 0.955, 0.16);
      stnGroup.add(padMesh);

      // 2. Glowing Billboard Interactive Screen positioned slightly back & higher
      // so the 3D GLB organelle model on the front-center of the table is never clipped or blocked!
      const screenGeo = new THREE.BoxGeometry(2.0, 1.1, 0.1);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x09141b,
        metalness: 0.5,
        roughness: 0.2
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 2.38, -0.34);
      stnGroup.add(screenMesh);

      // Station Screen Label Canvas Texture
      const textCanvas = createStationCanvas(stn.number, stn.title, stn.color);
      const textTexture = initTextureForGPU(new THREE.CanvasTexture(textCanvas));
      const screenFaceGeo = new THREE.PlaneGeometry(1.9, 1.0);
      const screenFaceMat = new THREE.MeshBasicMaterial({ map: textTexture });
      const screenFace = new THREE.Mesh(screenFaceGeo, screenFaceMat);
      screenFace.position.set(0, 2.38, -0.28);
      screenFace.frustumCulled = false;
      screenFace.userData = {
        stationId: stn.id,
        stationNumber: stn.number,
        stationIndex: index,
        pickable: true
      };
      stnGroup.add(screenFace);

      // 3. 3D Organelle Exhibition Model (GLB untuk semua 8 Stesen; fallback prosedur sedia ada dikekalkan)
      const organelleMesh = buildStylizedOrganelle(stn.number, stn.colorHex);
      organelleMesh.position.set(0, 1.38, 0.16);
      stnGroup.add(organelleMesh);

      // Laraskan posisi fallback sementara menunggu GLB selesai dimuatkan
      alignProceduralOnTable(organelleMesh, 0.97, 0.14, {
        stationId: stn.id,
        stationNumber: stn.number,
        stationIndex: index,
        organelleId: stn.id
      });

      const glbKey = stationNumToGLBKey[stn.number];
      if (glbKey && stn.number !== 8) {
        // Stesen 1-7: Nukleus, Membran Sel, Sitoplasma Gel, Mitokondrion, Kloroplas, Dinding Sel, Vakuol
        mountGLBIntoContainer(organelleMesh, glbKey, '3d', {
          stationId: stn.id,
          stationNumber: stn.number,
          stationIndex: index,
          organelleId: glbKey,
          alignOnTable: true,
          tableTopY: 0.97,
          clearanceY: 0.14
        });
      } else if (stn.number === 8) {
        // Stesen 8: Perbandingan Sel Haiwan & Sel Tumbuhan + Retikulum Endoplasma
        const compGroup = organelleMesh.children[0];
        if (compGroup && compGroup.children.length >= 2) {
          const leftAnimalSlot = new THREE.Group();
          leftAnimalSlot.position.set(-0.52, 0.08, 0);
          const animLabel = createTextPlane('SEL HAIWAN', '#f472b6', 0.86, 0.24);
          animLabel.position.set(-0.52, -0.36, 0.12);
          animLabel.userData = { stationId: stn.id, stationNumber: stn.number, stationIndex: index, organelleId: 'animal', pickable: true };

          const rightPlantSlot = new THREE.Group();
          rightPlantSlot.position.set(0.52, 0.08, 0);
          const plantLabel = createTextPlane('SEL TUMBUHAN', '#4ade80', 0.92, 0.24);
          plantLabel.position.set(0.52, -0.36, 0.12);
          plantLabel.userData = { stationId: stn.id, stationNumber: stn.number, stationIndex: index, organelleId: 'plant', pickable: true };

          const erCenterSlot = new THREE.Group();
          erCenterSlot.position.set(0, 0.38, 0.04);
          const erLabel = createTextPlane('RETIKULUM ENDOPLASMA', '#ec4899', 1.10, 0.22);
          erLabel.position.set(0, 0.02, 0.14);
          erLabel.userData = { stationId: stn.id, stationNumber: stn.number, stationIndex: index, organelleId: 'er', pickable: true };

          compGroup.clear();
          compGroup.add(leftAnimalSlot, animLabel, rightPlantSlot, plantLabel, erCenterSlot, erLabel);

          mountGLBIntoContainer(leftAnimalSlot, 'animal', '3d', {
            stationId: stn.id,
            stationNumber: stn.number,
            stationIndex: index,
            organelleId: 'animal',
            customTargetSize: 0.72,
            alignOnTable: false
          });
          mountGLBIntoContainer(rightPlantSlot, 'plant', '3d', {
            stationId: stn.id,
            stationNumber: stn.number,
            stationIndex: index,
            organelleId: 'plant',
            customTargetSize: 0.76,
            alignOnTable: false
          });
          mountGLBIntoContainer(erCenterSlot, 'er', '3d', {
            stationId: stn.id,
            stationNumber: stn.number,
            stationIndex: index,
            organelleId: 'er',
            customTargetSize: 0.65,
            alignOnTable: false
          });

          organelleMesh.position.y = 1.42;
          organelleMesh.userData.isGLBMounted = true;
          organelleMesh.userData.glbKey = 'animal+plant+er';
          organelleMesh.userData.baseY = 1.42;
          organelleMesh.userData.tableTopY = 0.97;
          organelleMesh.userData.fittedMinY = 1.05;
        }
      }

      // 4. Floating Badge Indicator Beacon (? -> ✓)
      const badgeBeacon = createBeaconMesh(stn.colorHex);
      badgeBeacon.position.set(0, 3.18, -0.30);
      stnGroup.add(badgeBeacon);

      // Pulsing Station Glow Halo on Floor
      const haloGeo = new THREE.RingGeometry(0.7, 0.95, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: stn.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(0, 0.02, 0.6);
      stnGroup.add(halo);

      // Rotating Holographic Theme Ring hovering on the display plinth below the organelle
      const stnHoloRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.018, 8, 32),
        new THREE.MeshBasicMaterial({
          color: stn.colorHex,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        })
      );
      stnHoloRing.rotation.x = Math.PI / 2;
      stnHoloRing.position.set(0, 1.02, 0.16);
      stnGroup.add(stnHoloRing);

      // Generous invisible raycast collider box around the organelle model & kiosk top for effortless click/tap on iPad/desktop
      const stationHitBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.85, 1.45, 1.25),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
      );
      stationHitBox.position.set(0, 1.45, 0.12);
      stationHitBox.userData = {
        stationId: stn.id,
        stationNumber: stn.number,
        stationIndex: index,
        organelleId: stn.id,
        pickable: true
      };
      stnGroup.add(stationHitBox);

      walkthroughStationsGroup.add(stnGroup);

      // 5. Pameran Animasi Lembut (putaran perlahan, floating sangat minimum, highlight & sedikit pembesaran apabila dihampiri/dipilih,
      // serta berhenti berputar apabila murid sedang memeriksa model dalam modal stesen)
      let currentHoverScale = 1.0;
      animatedObjects.push({
        update(t) {
          const isModalInspectingThis = DOM.stationModal && DOM.stationModal.classList.contains('open') && State.activeStationIndex === index;
          const isNearby = (State.nearbyStationIndex === index) || isModalInspectingThis;

          // Berhenti berputar ketika murid sedang memeriksa stesen secara interaktif
          if (!isModalInspectingThis) {
            organelleMesh.rotation.y += 0.0065; // Putaran pameran yang lembut & tenang (~0.39 rad/s)
          }

          // Animasi pergerakan protoplasma/siklosis zarah hidup untuk model Sitoplasma
          if (organelleMesh.userData && organelleMesh.userData.isCytoplasmGel && organelleMesh.userData.gelVisual) {
            organelleMesh.userData.gelVisual.userData.updateAnimation(t);
          }

          // Floating yang sangat minimum (±0.022m) supaya model tidak menembusi meja atau terapung terlalu tinggi
          const baseY = organelleMesh.userData.baseY || 1.38;
          organelleMesh.position.y = baseY + (isModalInspectingThis ? 0 : Math.sin(t * 1.5 + index) * 0.022);

          // Highlight & sedikit pembesaran (1.08x) apabila murid menghampiri atau memilih stesen
          const targetScale = isNearby ? 1.08 : 1.0;
          currentHoverScale += (targetScale - currentHoverScale) * 0.12;
          organelleMesh.scale.setScalar(currentHoverScale);

          if (padMesh.material) {
            padMesh.material.emissiveIntensity = isNearby ? 0.55 : 0.18;
          }
          halo.material.opacity = isNearby ? (0.85 + Math.sin(t * 4) * 0.15) : 0.55;
          badgeBeacon.rotation.y = t * 1.2;
          stnHoloRing.rotation.z = t * 0.9;
        }
      });

      stationMeshes.push({
        index,
        data: stn,
        group: stnGroup,
        beacon: badgeBeacon,
        screenFace,
        halo,
        padMesh,
        organelleMesh,
        worldPos: new THREE.Vector3(stn.pos.x, 1.5, stn.pos.z)
      });
    });
  }

  // Create biologically detailed, recognizable 3D representation for each of the 8 stations
  function buildStylizedOrganelle(number, colorHex) {
    const group = new THREE.Group();

    if (number === 1) {
      // ========================================================================
      // STESEN 1: NUKLEUS (Double-membrane sphere with 90° cutaway, nucleolus & pores)
      // ========================================================================
      // Outer purple nuclear envelope (cutaway menghadap ke hadapan & kanan supaya teras kelihatan jelas)
      const envelopeGeo = new THREE.SphereGeometry(0.38, 28, 28, -Math.PI * 0.25, Math.PI * 1.5, 0, Math.PI);
      const envelopeMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Ungu terang biologi
        emissive: 0x581c87,
        emissiveIntensity: 0.22,
        roughness: 0.40,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      const envelopeMesh = new THREE.Mesh(envelopeGeo, envelopeMat);
      group.add(envelopeMesh);

      // Inner dense nucleolus core in glowing magenta
      const nucleolusGeo = new THREE.SphereGeometry(0.16, 20, 20);
      const nucleolusMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.0
      });
      const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
      group.add(nucleolus);

      // Chromatin network threads (entangled DNA loops)
      const chromatinGeo = new THREE.TorusGeometry(0.24, 0.02, 10, 32);
      const chrom1 = new THREE.Mesh(chromatinGeo, new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0x9d174d,
        emissiveIntensity: 0.35,
        roughness: 0.30
      }));
      chrom1.rotation.set(Math.PI / 4, Math.PI / 6, 0);
      group.add(chrom1);

      const chrom2 = new THREE.Mesh(chromatinGeo, new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.30
      }));
      chrom2.rotation.set(-Math.PI / 4, 0, Math.PI / 3);
      group.add(chrom2);

      // Nuclear pores (Golden dots arrayed on the outer envelope)
      const poreGeo = new THREE.SphereGeometry(0.028, 8, 8);
      const poreMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfacc15,
        emissiveIntensity: 0.50,
        roughness: 0.20
      });
      for (let i = 0; i < 10; i++) {
        const pore = new THREE.Mesh(poreGeo, poreMat);
        const theta = 0.5 + (i * 0.45);
        const phi = 0.55 + (i * 0.60);
        pore.position.set(
          0.385 * Math.sin(phi) * Math.cos(theta),
          0.385 * Math.cos(phi),
          0.385 * Math.sin(phi) * Math.sin(theta)
        );
        group.add(pore);
      }
    } else if (number === 2) {
      // ========================================================================
      // STESEN 2: MEMBRAN SEL (Phospholipid bilayer segment with transmembrane protein pore)
      // ========================================================================
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0369a1,
        emissiveIntensity: 0.20,
        roughness: 0.25,
        metalness: 0.05
      });
      const tailMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });

      // Dual layers of spherical phospholipid heads with hydrophobic tails
      for (let row = -2; row <= 2; row++) {
        for (let col = -2; col <= 2; col++) {
          // Leave central slot open for channel protein
          if (Math.abs(row) <= 1 && Math.abs(col) <= 1) continue;

          // Upper hydrophilic head
          const headTop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), headMat);
          headTop.position.set(row * 0.12, 0.16, col * 0.12);
          group.add(headTop);

          // Lower hydrophilic head
          const headBottom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), headMat);
          headBottom.position.set(row * 0.12, -0.16, col * 0.12);
          group.add(headBottom);

          // Connecting tail lines
          const tailGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.24, 4);
          const tail = new THREE.Mesh(tailGeo, tailMat);
          tail.position.set(row * 0.12, 0, col * 0.12);
          group.add(tail);
        }
      }

      // Transmembrane Channel Protein (Green barrel embedded in bilayer)
      const channelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.42, 16, 1, true);
      const channelMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        emissiveIntensity: 0.30,
        roughness: 0.30,
        side: THREE.DoubleSide
      });
      const channelMesh = new THREE.Mesh(channelGeo, channelMat);
      group.add(channelMesh);

      // Translucent protective field halo
      const shieldRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.025, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      shieldRing.rotation.x = Math.PI / 2;
      group.add(shieldRing);
    } else if (number === 3) {
      // ========================================================================
      // STESEN 3: SITOPLASMA (Translucent amber cellular jelly with cytoskeleton)
      // ========================================================================
      // Jellied droplet medium
      const jellyGeo = new THREE.SphereGeometry(0.36, 24, 24);
      const jellyMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        metalness: 0.1
      });
      const jellyMesh = new THREE.Mesh(jellyGeo, jellyMat);
      group.add(jellyMesh);

      // Cytoskeletal microfilaments lattice inside
      const fiberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      for (let f = 0; f < 5; f++) {
        const fiber = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6), fiberMat);
        fiber.rotation.set((f * Math.PI) / 4, (f * Math.PI) / 3, (f * Math.PI) / 6);
        group.add(fiber);
      }

      // Suspended nutrient granules / metabolic vesicles
      const granMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      for (let g = 0; g < 8; g++) {
        const granule = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), granMat);
        const a = (g / 8) * Math.PI * 2;
        granule.position.set(Math.cos(a) * 0.22, (g % 3 - 1) * 0.12, Math.sin(a) * 0.22);
        group.add(granule);
      }
    } else if (number === 4) {
      // ========================================================================
      // STESEN 4: MITOKONDRION (Capsule with outer cutaway revealing inner cristae)
      // ========================================================================
      // Outer transparent orange capsule
      const outerMitoGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.52, 16);
      const outerMitoMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.65,
        roughness: 0.2
      });
      const outerMito = new THREE.Mesh(outerMitoGeo, outerMitoMat);
      outerMito.rotation.z = Math.PI / 3;
      group.add(outerMito);

      // Inner folded cristae ridges (Zigzag folded inner membrane shelves)
      const cristaeMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0xc2410c,
        emissiveIntensity: 0.35,
        roughness: 0.30
      });
      for (let c = -3; c <= 3; c++) {
        const crista = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.14), cristaeMat);
        crista.position.set((c * 0.06) * Math.cos(Math.PI / 3), -(c * 0.06) * Math.sin(Math.PI / 3), 0);
        crista.rotation.z = Math.PI / 3;
        group.add(crista);
      }

      // ATP energy spark particles
      const atpMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      for (let a = 0; a < 4; a++) {
        const spark = new THREE.Mesh(new THREE.TetrahedronGeometry(0.03), atpMat);
        spark.position.set((a - 1.5) * 0.08, (a % 2 - 0.5) * 0.08, 0.08);
        group.add(spark);
      }
    } else if (number === 5) {
      // ========================================================================
      // STESEN 5: KLOROPLAS (Biconvex green disc with stacked thylakoid grana & stroma)
      // ========================================================================
      // Outer translucent green membrane disc
      const chloroGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 20);
      const chloroMat = new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        emissive: 0x14532d,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.70,
        roughness: 0.25
      });
      const chloroMesh = new THREE.Mesh(chloroGeo, chloroMat);
      group.add(chloroMesh);

      // Stacked thylakoids (grana stacks of green coin-like discs)
      const thylaMat = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        emissive: 0x15803d,
        emissiveIntensity: 0.35,
        roughness: 0.25
      });
      const granumPositions = [
        [-0.16, -0.1], [0.16, -0.1], [0, 0.16], [-0.08, 0.06]
      ];

      granumPositions.forEach(([gx, gz]) => {
        for (let l = 0; l < 4; l++) {
          const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 12), thylaMat);
          disc.position.set(gx, -0.05 + (l * 0.035), gz);
          group.add(disc);
        }
      });

      // Stroma lamellae interconnecting rods
      const lamellaMat = new THREE.MeshBasicMaterial({ color: 0x86efac });
      const lam1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.015), lamellaMat);
      lam1.position.y = 0.02;
      group.add(lam1);
    } else if (number === 6) {
      // ========================================================================
      // STESEN 6: DINDING SEL (Rigid hexagonal & rectangular cellulose cell wall)
      // ========================================================================
      // Rigid rectangular cell framework block in vivid cellulose green/gold
      const wallBoxGeo = new THREE.BoxGeometry(0.56, 0.56, 0.56);
      const wallBoxMat = new THREE.MeshStandardMaterial({
        color: 0x65a30d,
        emissive: 0x365314,
        emissiveIntensity: 0.25,
        roughness: 0.35,
        metalness: 0.05
      });
      const wallBox = new THREE.Mesh(wallBoxGeo, wallBoxMat);
      group.add(wallBox);

      // Cellulose microfibril ribbed frame edges
      const edgeGeo = new THREE.EdgesGeometry(wallBoxGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 3 });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      group.add(edges);

      // Middle lamella layer plate
      const lamellaPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.04, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.3 })
      );
      group.add(lamellaPlate);
    } else if (number === 7) {
      // ========================================================================
      // STESEN 7: VAKUOL (Large crystal-clear turgid water sap bubble with tonoplast)
      // ========================================================================
      // Main central fluid vacuole bubble
      const vacuoleGeo = new THREE.SphereGeometry(0.42, 24, 24);
      const vacuoleMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0e7490,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.72,
        roughness: 0.05,
        metalness: 0.05
      });
      const vacuoleMesh = new THREE.Mesh(vacuoleGeo, vacuoleMat);
      group.add(vacuoleMesh);

      // Tonoplast membrane boundary ring
      const tonoRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.02, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      tonoRing.rotation.x = Math.PI / 3;
      group.add(tonoRing);

      // Internal cell sap droplets
      const dropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.8 });
      for (let d = 0; d < 5; d++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), dropMat);
        const da = (d / 5) * Math.PI * 2;
        drop.position.set(Math.cos(da) * 0.2, (d - 2) * 0.08, Math.sin(da) * 0.2);
        group.add(drop);
      }
    } else {
      // ========================================================================
      // STESEN 8: PERBANDINGAN SEL HAIWAN VS SEL TUMBUHAN
      // (Flexible round animal cell vs rigid angular hexagonal plant cell)
      // ========================================================================
      const compGroup = new THREE.Group();

      // Left: Animal Cell (Round, flexible membrane, nucleus, mitochondria)
      const animalGroup = new THREE.Group();
      animalGroup.position.set(-0.35, 0, 0);

      const animMembrane = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.75, roughness: 0.2 })
      );
      animalGroup.add(animMembrane);

      const animNucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 })
      );
      animNucleus.position.set(0.04, 0.04, 0);
      animalGroup.add(animNucleus);

      const animMito = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.09, 8),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
      );
      animMito.position.set(-0.12, -0.06, 0.08);
      animMito.rotation.z = Math.PI / 4;
      animalGroup.add(animMito);

      const animLabel = createTextPlane('SEL HAIWAN', '#f472b6', 0.9, 0.28);
      animLabel.position.set(0, -0.42, 0);
      animalGroup.add(animLabel);
      compGroup.add(animalGroup);

      // Right: Plant Cell (Rigid hexagonal/angular, thick cell wall, large vacuole, chloroplasts)
      const plantGroup = new THREE.Group();
      plantGroup.position.set(0.35, 0, 0);

      // Rigid thick cell wall (hexagonal prism)
      const plantWall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.36, 6),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35, metalness: 0.1 })
      );
      plantGroup.add(plantWall);

      // Large central vacuole inside
      const plantVacuole = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
      );
      plantVacuole.position.set(-0.04, 0, 0);
      plantGroup.add(plantVacuole);

      // Green chloroplasts
      for (let ch = 0; ch < 3; ch++) {
        const chloro = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8),
          new THREE.MeshStandardMaterial({ color: 0x22c55e })
        );
        const ca = (ch * Math.PI * 2) / 3;
        chloro.position.set(Math.cos(ca) * 0.18, 0.06, Math.sin(ca) * 0.18);
        plantGroup.add(chloro);
      }

      // Nucleus pushed to side
      const plantNucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6 })
      );
      plantNucleus.position.set(0.14, -0.04, 0.06);
      plantGroup.add(plantNucleus);

      const plantLabel = createTextPlane('SEL TUMBUHAN', '#4ade80', 1.0, 0.28);
      plantLabel.position.set(0, -0.42, 0);
      plantGroup.add(plantLabel);
      compGroup.add(plantGroup);

      group.add(compGroup);
    }

    return group;
  }

  // Create Brand Identity Text Plaque for ARSelNel Center Monument (Front & Back non-mirrored)
  function createBrandTextPlane(title, subtitle, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Rounded glowing glass panel
    ctx.fillStyle = 'rgba(9, 23, 32, 0.92)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(6, 6, 500, 148, 20) : ctx.fillRect(6, 6, 500, 148);
    ctx.fill();

    // Glowing cyan border
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Brand Title: ARSelNel
    ctx.fillStyle = '#2dd4bf';
    ctx.font = '900 52px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 55);

    // Subtitle
    ctx.fillStyle = '#facc15';
    ctx.font = '800 24px Nunito, sans-serif';
    ctx.fillText(`★  ${subtitle}  ★`, 256, 115);

    const texture = initTextureForGPU(new THREE.CanvasTexture(canvas));
    const plaqueGroup = new THREE.Group();
    const planeGeo = new THREE.PlaneGeometry(width, height);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true });

    // Front Face
    const frontPlane = new THREE.Mesh(planeGeo, planeMat);
    frontPlane.position.z = 0.01;
    frontPlane.frustumCulled = false;
    plaqueGroup.add(frontPlane);

    // Back Face (Rotated 180° so text is never mirrored/backwards!)
    const backPlane = new THREE.Mesh(planeGeo, planeMat);
    backPlane.rotation.y = Math.PI;
    backPlane.position.z = -0.01;
    backPlane.frustumCulled = false;
    plaqueGroup.add(backPlane);

    return plaqueGroup;
  }

  // Floating Badge Beacon on top of station
  function createBeaconMesh(colorHex) {
    const group = new THREE.Group();
    const octGeo = new THREE.OctahedronGeometry(0.24, 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Yellow '?' initially
      emissive: 0x713f12,
      roughness: 0.2
    });
    const oct = new THREE.Mesh(octGeo, octMat);
    group.add(oct);
    return group;
  }

  // Station canvas texture for display screen
  function createStationCanvas(number, title, colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, '#0c1d27');
    grad.addColorStop(1, '#050c11');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Glowing border
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 498, 242);

    // Number Badge
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    ctx.arc(60, 60, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 60, 60);

    // Kicker
    ctx.fillStyle = colorStr;
    ctx.font = 'bold 22px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`STESEN ${number} • KSSM T1`, 115, 50);

    // Station Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px Nunito, sans-serif';
    ctx.fillText(title, 115, 90);

    // Instruction Banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(30, 140, 452, 80, 16) : ctx.fillRect(30, 140, 452, 80);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔍 DEKATI & KETIK UNTUK TEROKA', 256, 185);

    return canvas;
  }

  // Create Text Plane Helper
  function createTextPlane(text, colorStr, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = colorStr;
    ctx.font = 'bold 32px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = initTextureForGPU(new THREE.CanvasTexture(canvas));
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    plane.frustumCulled = false;
    return plane;
  }

  // Create Educational Poster Plane Helper
  function createPosterPlane(title, bullets, headerColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f1f2c';
    ctx.fillRect(0, 0, 512, 512);

    // Header banner
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, 512, 88);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 44);

    // Bullet points
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 22px Nunito, sans-serif';
    ctx.textAlign = 'left';
    bullets.forEach((b, i) => {
      ctx.fillText(b, 32, 155 + (i * 64));
    });

    // Border
    ctx.strokeStyle = headerColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    const texture = initTextureForGPU(new THREE.CanvasTexture(canvas));
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.5),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    plane.frustumCulled = false;
    return plane;
  }

  // Mini Badge Strip at Top of HUD
  function buildMiniBadgeStrip() {
    if (!DOM.badgeStrip) return;
    DOM.badgeStrip.innerHTML = '';
    State.stations.forEach(s => {
      const badge = document.createElement('div');
      badge.className = 'cq-mini-badge';
      badge.id = `mini-badge-${s.number}`;
      badge.textContent = s.number;
      badge.title = `Stesen ${s.number}: ${s.title}`;
      DOM.badgeStrip.appendChild(badge);
    });
  }

  // ==============================================================================
  // INPUT HANDLING & MOVEMENT (KEYBOARD & TOUCH)
  // ==============================================================================

  // ==============================================================================
  // INPUT HANDLING & MOVEMENT (KEYBOARD & TOUCH)
  // ==============================================================================

  function bindEvents() {
    // 1. Keyboard Controls (WASD / Arrows)
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 2. Desktop Mouse Drag Look & 3D Station Raycast Click/Tap
    let isMouseDragging = false;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;

    DOM.canvasContainer.addEventListener('mousedown', (e) => {
      if (State.isPaused || DOM.stationModal.classList.contains('open')) return;
      isMouseDragging = true;
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDragging || State.isPaused || DOM.stationModal.classList.contains('open')) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      player.rotY -= deltaX * 0.0035;
      player.pitch = Math.max(-0.75, Math.min(0.75, player.pitch - deltaY * 0.003));
    });

    window.addEventListener('mouseup', (e) => {
      if (isMouseDragging && State.mode === '3d' && !State.isPaused && !DOM.stationModal.classList.contains('open')) {
        const dragDist = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
        if (dragDist < 10) {
          handle3DStationRaycastTap(e.clientX, e.clientY);
        }
      }
      isMouseDragging = false;
    });

    // Touch tap on 3D station models (iPad & mobile in 3D Walkthrough mode)
    let touchStart3DX = 0;
    let touchStart3DY = 0;
    DOM.canvasContainer.addEventListener('touchstart', (e) => {
      if (State.mode !== '3d' || State.isPaused || DOM.stationModal.classList.contains('open')) return;
      if (e.changedTouches.length > 0) {
        touchStart3DX = e.changedTouches[0].clientX;
        touchStart3DY = e.changedTouches[0].clientY;
      }
    }, { passive: true });
    DOM.canvasContainer.addEventListener('touchend', (e) => {
      if (State.mode !== '3d' || State.isPaused || DOM.stationModal.classList.contains('open')) return;
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        if (Math.hypot(t.clientX - touchStart3DX, t.clientY - touchStart3DY) < 12) {
          handle3DStationRaycastTap(t.clientX, t.clientY);
        }
      }
    }, { passive: true });

    // 3. Mobile Right-Side Touch Look Zone (Pan camera with right thumb)
    if (DOM.touchZone) {
      let touchZoneStartX = 0;
      let touchZoneStartY = 0;
      DOM.touchZone.addEventListener('touchstart', (e) => {
        if (State.isPaused || DOM.stationModal.classList.contains('open')) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (!touchLookState.active) {
            touchLookState.active = true;
            touchLookState.touchId = t.identifier;
            touchLookState.prevX = t.clientX;
            touchLookState.prevY = t.clientY;
            touchZoneStartX = t.clientX;
            touchZoneStartY = t.clientY;
            break;
          }
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!touchLookState.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchLookState.touchId) {
            e.preventDefault();
            const deltaX = t.clientX - touchLookState.prevX;
            const deltaY = t.clientY - touchLookState.prevY;
            touchLookState.prevX = t.clientX;
            touchLookState.prevY = t.clientY;

            player.rotY -= deltaX * 0.0045;
            player.pitch = Math.max(-0.75, Math.min(0.75, player.pitch - deltaY * 0.0035));
            break;
          }
        }
      }, { passive: false });

      const endTouchLook = (e) => {
        if (!touchLookState.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchLookState.touchId) {
            touchLookState.active = false;
            touchLookState.touchId = null;
            if (State.mode === '3d' && !State.isPaused && !DOM.stationModal.classList.contains('open')) {
              if (Math.hypot(t.clientX - touchZoneStartX, t.clientY - touchZoneStartY) < 12) {
                handle3DStationRaycastTap(t.clientX, t.clientY);
              }
            }
            break;
          }
        }
      };
      window.addEventListener('touchend', endTouchLook, { passive: true });
      window.addEventListener('touchcancel', endTouchLook, { passive: true });
    }

    // 4. Mobile Analog Virtual Joystick (Left bottom)
    setupVirtualJoystick();

    // 5. Dedicated Mobile Quick Interact Button
    if (DOM.mobileInteractBtn) {
      const handleMobileInteract = (e) => {
        e.preventDefault();
        handlePlayerInteract();
      };
      DOM.mobileInteractBtn.addEventListener('click', handleMobileInteract);
      DOM.mobileInteractBtn.addEventListener('touchstart', handleMobileInteract, { passive: false });
    }

    // 6. HUD Buttons
    if (DOM.promptActionBtn) {
      DOM.promptActionBtn.addEventListener('click', () => {
        handlePlayerInteract();
      });
    }

    if (DOM.soundToggleBtn) DOM.soundToggleBtn.addEventListener('click', toggleSound);
    if (DOM.pauseBtn) DOM.pauseBtn.addEventListener('click', togglePause);
    if (DOM.helpBtn) DOM.helpBtn.addEventListener('click', openHowToPlayDialog);
    if (DOM.modeSelectBtn) DOM.modeSelectBtn.addEventListener('click', openModeDialog);
    if (DOM.gyroResetBtn) DOM.gyroResetBtn.addEventListener('click', () => {
      if (State.mode === '3d') {
        calibrateModAGyroHeading(true);
      } else {
        resetGyroOrientation();
      }
    });
    if (DOM.closeStationBtn) DOM.closeStationBtn.addEventListener('click', closeStationModal);
    if (DOM.closeHowToBtn) DOM.closeHowToBtn.addEventListener('click', closeHowToPlayDialog);
    if (DOM.startPlayingBtn) DOM.startPlayingBtn.addEventListener('click', closeHowToPlayDialog);

    // 7. Mode Selector Options
    if (DOM.choose3dBtn) {
      DOM.choose3dBtn.addEventListener('click', () => selectMode('3d'));
    }
    if (DOM.chooseCameraArBtn) {
      DOM.chooseCameraArBtn.addEventListener('click', () => selectMode('camera-ar'));
    }
    if (DOM.chooseWorldArBtn) {
      DOM.chooseWorldArBtn.addEventListener('click', () => selectMode('marker-ar'));
    }
    if (DOM.chooseArBtn) {
      DOM.chooseArBtn.addEventListener('click', () => selectMode('ar'));
    }
    if (DOM.closeModeBtn) DOM.closeModeBtn.addEventListener('click', closeModeDialog);

    // 8. AR Placement Scale Switcher
    if (DOM.scaleMiniBtn && DOM.scaleRoomBtn) {
      DOM.scaleMiniBtn.addEventListener('click', () => {
        arScaleMode = 'mini';
        DOM.scaleMiniBtn.classList.add('active');
        DOM.scaleRoomBtn.classList.remove('active');
        if (labEnvironmentGroup && State.mode === 'ar') {
          labEnvironmentGroup.scale.set(0.12, 0.12, 0.12);
        }
      });
      DOM.scaleRoomBtn.addEventListener('click', () => {
        arScaleMode = 'room';
        DOM.scaleRoomBtn.classList.add('active');
        DOM.scaleMiniBtn.classList.remove('active');
        if (labEnvironmentGroup && State.mode === 'ar') {
          labEnvironmentGroup.scale.set(1.0, 1.0, 1.0);
        }
      });
    }

    // 9. Camera Fallback Modal Buttons
    if (DOM.retryCameraBtn) {
      DOM.retryCameraBtn.addEventListener('click', () => {
        if (DOM.cameraFallbackModal) DOM.cameraFallbackModal.classList.remove('open');
        selectMode('camera-ar');
      });
    }
    if (DOM.fallbackTo3dBtn) {
      DOM.fallbackTo3dBtn.addEventListener('click', () => {
        if (DOM.cameraFallbackModal) DOM.cameraFallbackModal.classList.remove('open');
        selectMode('3d');
      });
    }

    // 10. Victory Modal
    if (DOM.closeVictoryBtn) DOM.closeVictoryBtn.addEventListener('click', closeVictoryModal);
    if (DOM.restartGameBtn) DOM.restartGameBtn.addEventListener('click', restartGame);
    if (DOM.downloadCertBtn) DOM.downloadCertBtn.addEventListener('click', printOrSaveCertificate);

    // 11. AR Interface & WebXR Buttons
    if (DOM.arBackBtn) DOM.arBackBtn.addEventListener('click', openExitConfirmDialog);
    if (DOM.arExitBtn) DOM.arExitBtn.addEventListener('click', openExitConfirmDialog);
    if (DOM.hud3dBackBtn) DOM.hud3dBackBtn.addEventListener('click', openExitConfirmDialog);
    if (DOM.walkthroughBackBtn) DOM.walkthroughBackBtn.addEventListener('click', openExitConfirmDialog);
    if (DOM.exitConfirmContinueBtn) DOM.exitConfirmContinueBtn.addEventListener('click', closeExitConfirmDialog);
    if (DOM.exitConfirmLeaveBtn) DOM.exitConfirmLeaveBtn.addEventListener('click', confirmExitToCellQuest);
    if (DOM.exitConfirmKotakBtn) DOM.exitConfirmKotakBtn.addEventListener('click', returnToKotakARSELNEL);
    if (DOM.hudReturnKotakBtn) DOM.hudReturnKotakBtn.addEventListener('click', returnToKotakARSELNEL);
    if (DOM.lobbyReturnKotakBtn) DOM.lobbyReturnKotakBtn.addEventListener('click', returnToKotakARSELNEL);

    // 12. Lobi Makmal Sains & Galeri Pendidikan
    if (DOM.lobbyBtnModA) {
      DOM.lobbyBtnModA.addEventListener('click', () => {
        openLab3DStoryMissionModal();
      });
    }

    // Mod A — Story Mission Modal Buttons
    if (DOM.closeLab3DMissionBtn) {
      DOM.closeLab3DMissionBtn.addEventListener('click', () => closeLab3DStoryMissionModal());
    }
    if (DOM.lab3dMissionBackBtn) {
      DOM.lab3dMissionBackBtn.addEventListener('click', () => closeLab3DStoryMissionModal());
    }
    if (DOM.lab3dMissionStartBtn) {
      DOM.lab3dMissionStartBtn.addEventListener('click', () => {
        closeLab3DStoryMissionModal();
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
        if (isTouchDevice && typeof window.DeviceOrientationEvent !== 'undefined') {
          openLab3DCalibrationModal();
        } else {
          launchMode('3d');
        }
      });
    }

    // Mod A — Calibration Modal Buttons
    if (DOM.lab3dCalSensorBtn) {
      DOM.lab3dCalSensorBtn.addEventListener('click', () => {
        enableModAGyroscope().then(() => {
          closeLab3DCalibrationModal();
          launchMode('3d');
        }).catch(() => {
          closeLab3DCalibrationModal();
          launchMode('3d');
        });
      });
    }
    if (DOM.lab3dCalTouchBtn) {
      DOM.lab3dCalTouchBtn.addEventListener('click', () => {
        modAGyro.active = false;
        closeLab3DCalibrationModal();
        launchMode('3d');
      });
    }

    // Mod A — Cell Core Victory Modal Buttons
    if (DOM.lab3dExploreAgainBtn) {
      DOM.lab3dExploreAgainBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        player.x = 0;
        player.z = 0;
      });
    }
    if (DOM.lab3dReturnLobbyBtn) {
      DOM.lab3dReturnLobbyBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        player.x = 0;
        player.z = 0;
        openScienceLabLobby();
      });
    }
    if (DOM.lobbyBtnModB) {
      DOM.lobbyBtnModB.addEventListener('click', () => {
        openARStoryMissionModal();
      });
    }

    if (DOM.closeArMissionBtn) {
      DOM.closeArMissionBtn.addEventListener('click', () => closeARStoryMissionModal());
    }
    if (DOM.arMissionBackBtn) {
      DOM.arMissionBackBtn.addEventListener('click', () => closeARStoryMissionModal());
    }
    if (DOM.arMissionStartBtn) {
      DOM.arMissionStartBtn.addEventListener('click', () => {
        closeARStoryMissionModal();
        launchMode('camera-ar');
      });
    }
    if (DOM.lobbyBtnModC) {
      DOM.lobbyBtnModC.addEventListener('click', () => launchMode('marker-ar'));
    }
    if (DOM.lobbyBtnNotes) {
      DOM.lobbyBtnNotes.addEventListener('click', () => SoundFX.interact());
    }
    if (DOM.lobbyBtnVideos) {
      DOM.lobbyBtnVideos.addEventListener('click', () => SoundFX.interact());
    }

    if (DOM.galleryCards && DOM.galleryCards.length) {
      DOM.galleryCards.forEach(card => {
        card.addEventListener('click', () => {
          const type = card.dataset.gallery || 'animal';
          openCellGalleryModal(type);
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const type = card.dataset.gallery || 'animal';
            openCellGalleryModal(type);
          }
        });
      });
    }
    if (DOM.closeGalleryDetailBtn) {
      DOM.closeGalleryDetailBtn.addEventListener('click', closeCellGalleryModal);
    }
    if (DOM.galleryDetailCloseBtn) {
      DOM.galleryDetailCloseBtn.addEventListener('click', closeCellGalleryModal);
    }
    if (DOM.galleryDetailModal) {
      DOM.galleryDetailModal.addEventListener('click', (e) => {
        if (e.target === DOM.galleryDetailModal) closeCellGalleryModal();
      });
    }
    if (DOM.arBtnWorld) DOM.arBtnWorld.addEventListener('click', () => switchARModel('world'));
    if (DOM.arBtnMarker) DOM.arBtnMarker.addEventListener('click', () => selectMode('marker-ar'));
    if (DOM.arBtnAnimal) DOM.arBtnAnimal.addEventListener('click', () => switchARModel('animal'));
    if (DOM.arBtnPlant) DOM.arBtnPlant.addEventListener('click', () => switchARModel('plant'));
    if (DOM.arBtnMinilab) DOM.arBtnMinilab.addEventListener('click', () => switchARModel('minilab'));
    if (DOM.arPostureBtn) DOM.arPostureBtn.addEventListener('click', toggleARPostureMode);
    if (DOM.arSoundBtn) DOM.arSoundBtn.addEventListener('click', toggleSound);
    if (DOM.arPauseBtn) DOM.arPauseBtn.addEventListener('click', togglePause);
    if (DOM.arHelpBtn) DOM.arHelpBtn.addEventListener('click', openHowToPlayDialog);
    if (DOM.arStationsToggle) DOM.arStationsToggle.addEventListener('click', () => toggleStationsDrawer());
    if (DOM.arDrawerCloseBtn) DOM.arDrawerCloseBtn.addEventListener('click', () => toggleStationsDrawer(false));
    if (DOM.arRecenterBtn) DOM.arRecenterBtn.addEventListener('click', resetARView);
    if (DOM.arResetViewBtn) DOM.arResetViewBtn.addEventListener('click', resetARView);
    if (DOM.arCardMinimizeBtn) {
      DOM.arCardMinimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleOrganelleCardMinimize();
      });
    }
    if (DOM.arCardHeader) {
      DOM.arCardHeader.addEventListener('click', (e) => {
        if (e.target.closest('.cq-card-icon-btn')) return;
        if (DOM.arOrganelleCard && DOM.arOrganelleCard.classList.contains('minimized')) {
          toggleOrganelleCardMinimize(false);
        }
      });
    }
    if (DOM.arAutorotateBtn) {
      DOM.arAutorotateBtn.addEventListener('click', () => {
        arState.autoRotate = !arState.autoRotate;
        alertToast(arState.autoRotate ? '🔄 Putaran Automatik Dihidupkan' : '⏸️ Putaran Automatik Dijeda');
      });
    }
    if (DOM.arChangeModeBtn) {
      DOM.arChangeModeBtn.addEventListener('click', openModeDialog);
    }
    if (DOM.arCardCloseBtn) {
      DOM.arCardCloseBtn.addEventListener('click', () => {
        if (DOM.arOrganelleCard) DOM.arOrganelleCard.style.display = 'none';
        if (DOM.arSingleInstruction) {
          DOM.arSingleInstruction.style.opacity = '1';
        }
      });
    }
    if (DOM.arSmallerBtn) {
      DOM.arSmallerBtn.addEventListener('click', () => {
        if (arObjectGroup) {
          arObjectGroup.scale.multiplyScalar(0.85);
          alertToast('− Saiz Model Dikecilkan');
        }
      });
    }
    if (DOM.arLargerBtn) {
      DOM.arLargerBtn.addEventListener('click', () => {
        if (arObjectGroup) {
          arObjectGroup.scale.multiplyScalar(1.18);
          alertToast('＋ Saiz Model Dibesarkan');
        }
      });
    }
    if (DOM.arRotateBtn) {
      DOM.arRotateBtn.addEventListener('click', () => {
        if (arObjectGroup) {
          arObjectGroup.rotation.y += Math.PI / 4;
        }
      });
    }
    if (DOM.arRepositionBtn) {
      DOM.arRepositionBtn.addEventListener('click', () => {
        arState.isPlaced = false;
        alertToast('🔄 Halakan kamera ke permukaan meja/lantai');
      });
    }

    // 11.1 Misi Akhir: Peti Harta Karun ARSELNel Event Listeners
    if (DOM.startTreasureHuntBtn) {
      DOM.startTreasureHuntBtn.addEventListener('click', startTreasureHuntMission);
    }
    if (DOM.closeTreasureIntroBtn) {
      DOM.closeTreasureIntroBtn.addEventListener('click', hideTreasureHuntIntroModal);
    }
    if (DOM.closeTreasureModalBtn) {
      DOM.closeTreasureModalBtn.addEventListener('click', closeTreasureChestModal);
    }
    if (DOM.tcNextBtn) {
      DOM.tcNextBtn.addEventListener('click', onTreasureNextButtonClicked);
    }
    if (DOM.trPrintBtn) {
      DOM.trPrintBtn.addEventListener('click', printOrSaveCertificate);
    }
    if (DOM.trReplayBtn) {
      DOM.trReplayBtn.addEventListener('click', () => {
        hideTreasureRewardModal();
        restartGame();
      });
    }

    // Stop pointer/touch propagation on all AR overlay cards & drawer so canvas doesn't receive drag/tap
    const uiShields = [
      DOM.arTopBar,
      DOM.arStationsDrawer,
      DOM.arOrganelleCard,
      DOM.exitConfirmModal,
      DOM.treasureHuntIntroModal,
      DOM.treasureChestModal,
      DOM.treasureRewardModal,
      document.getElementById('ar-floating-bar')
    ];
    uiShields.forEach(el => {
      if (!el) return;
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(evt => {
        el.addEventListener(evt, e => e.stopPropagation(), { passive: true });
      });
    });

    // 12. Window Resize & Orientation Change
    window.addEventListener('resize', onWindowResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onWindowResize);
    }
    window.addEventListener('orientationchange', () => {
      setTimeout(onWindowResize, 200);
    });
  }

  // Virtual Analog Joystick Controller Implementation
  function setupVirtualJoystick() {
    if (!DOM.virtualJoystick || !DOM.joystickBase || !DOM.joystickThumb) return;

    const base = DOM.joystickBase;
    const thumb = DOM.joystickThumb;
    const maxRadius = 42; // Maximum pixel distance knob can move from center

    const updateJoystickPosition = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      // Normalized coordinates:
      // dx > 0 = strafe right (+1), dx < 0 = strafe left (-1)
      // dy < 0 = forward (+1) because screen Y is down, dy > 0 = backward (-1)
      joystickState.x = dx / maxRadius;
      joystickState.y = -dy / maxRadius;
      joystickState.active = (Math.abs(joystickState.x) > 0.08 || Math.abs(joystickState.y) > 0.08);
    };

    const resetJoystick = () => {
      joystickState.active = false;
      joystickState.touchId = null;
      joystickState.x = 0;
      joystickState.y = 0;
      thumb.style.transition = 'transform 0.15s ease-out';
      thumb.style.transform = 'translate(-50%, -50%)';
      setTimeout(() => { thumb.style.transition = ''; }, 160);
    };

    // Touch events (stopPropagation memastikan sentuhan joystick tidak bocor ke touch-look atau kanvas)
    base.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (e.changedTouches.length > 0 && !joystickState.touchId) {
        e.preventDefault();
        const t = e.changedTouches[0];
        joystickState.touchId = t.identifier;
        thumb.style.transition = '';
        updateJoystickPosition(t.clientX, t.clientY);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!joystickState.touchId) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickState.touchId) {
          e.preventDefault();
          updateJoystickPosition(t.clientX, t.clientY);
          break;
        }
      }
    }, { passive: false });

    const handleTouchEnd = (e) => {
      if (!joystickState.touchId) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickState.touchId) {
          resetJoystick();
          break;
        }
      }
    };
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Pointer events (Desktop mouse testing support)
    base.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (e.pointerType === 'mouse' && e.button === 0) {
        base.setPointerCapture(e.pointerId);
        thumb.style.transition = '';
        updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    base.addEventListener('pointermove', (e) => {
      e.stopPropagation();
      if (base.hasPointerCapture && base.hasPointerCapture(e.pointerId)) {
        updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    const handlePointerUp = (e) => {
      e.stopPropagation();
      if (base.hasPointerCapture && base.hasPointerCapture(e.pointerId)) {
        base.releasePointerCapture(e.pointerId);
        resetJoystick();
      }
    };
    base.addEventListener('pointerup', handlePointerUp);
    base.addEventListener('pointercancel', handlePointerUp);
  }

  function onKeyDown(e) {
    if (State.isPaused) return;

    if (e.code === 'KeyW' || e.code === 'ArrowUp') player.keys.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') player.keys.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') player.keys.right = true;

    // Press 'E' or Space to interact with station, cell core crystal, or secret door
    if (e.code === 'KeyE' || e.code === 'Space') {
      handlePlayerInteract();
    }
  }

  function onKeyUp(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') player.keys.forward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') player.keys.backward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') player.keys.right = false;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // Auto-reframe active AR model on orientation change / resize ONLY when in legacy diorama overlay
    if ((State.mode === 'camera-ar' || State.mode === 'ar') && !arWorldState.active && !arMarkerState.active && typeof frameARObject === 'function') {
      let activeHolder = arMiniLabHolder;
      if (arState && arState.activeModel === 'animal') activeHolder = arAnimalHolder;
      else if (arState && arState.activeModel === 'plant') activeHolder = arPlantHolder;
      if (activeHolder) frameARObject(activeHolder);
    }

    if (previewRenderer && DOM.stnPreviewCanvas) {
      const rect = DOM.stnPreviewCanvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        previewCamera.aspect = rect.width / rect.height;
        previewCamera.updateProjectionMatrix();
        previewRenderer.setSize(rect.width, rect.height);
      }
    }
  }

  // ==============================================================================
  // MATHEMATICALLY CORRECT CAMERA-RELATIVE MOVEMENT & COLLISION
  // ==============================================================================


  // ==============================================================================
  // MOD A — ENHANCED FUNCTIONS (MODAL, GYRO, INTERACTION, BILIK TERAS SEL)
  // ==============================================================================

  function openLab3DStoryMissionModal() {
    if (DOM.lab3dStoryMissionModal) {
      DOM.lab3dStoryMissionModal.classList.add('open');
      SoundFX.interact();
    }
  }

  function closeLab3DStoryMissionModal() {
    if (DOM.lab3dStoryMissionModal) {
      DOM.lab3dStoryMissionModal.classList.remove('open');
    }
  }

  function openLab3DCalibrationModal() {
    if (DOM.lab3dCalibrationModal) {
      DOM.lab3dCalibrationModal.classList.add('open');
      SoundFX.interact();
    }
  }

  function closeLab3DCalibrationModal() {
    if (DOM.lab3dCalibrationModal) {
      DOM.lab3dCalibrationModal.classList.remove('open');
    }
  }

  function openLab3DCrystalVictoryModal() {
    if (DOM.lab3dCrystalVictoryModal) {
      if (DOM.lab3dFinalScore) DOM.lab3dFinalScore.textContent = `${State.score} Mata`;
      if (DOM.lab3dFinalStations) DOM.lab3dFinalStations.textContent = `${State.completedStations.size} / 8 Stesen`;
      if (DOM.lab3dFinalTime) DOM.lab3dFinalTime.textContent = formatTime(State.durationSeconds);
      DOM.lab3dCrystalVictoryModal.classList.add('open');
      SoundFX.victory();
    }
  }

  function closeLab3DCrystalVictoryModal() {
    if (DOM.lab3dCrystalVictoryModal) {
      DOM.lab3dCrystalVictoryModal.classList.remove('open');
    }
  }

  // ==============================================================================
  // FASA A.5 — MODULAR QUATERNION 360° GYROSCOPE & CALIBRATION ENGINE (MOD JELAJAH 3D)
  // Menyokong iPadOS Safari Portrait (0°), Landscape (90°/-90°/270°) & Upside-Down (180°)
  // tanpa gimbal lock dan tanpa masalah kamera menghadap siling pada permulaan.
  // ==============================================================================

  function initializeOrientation() {
    modAGyro.supported = (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window);
    modAGyro.screenOrientationAngle = getScreenOrientationAngle();
    if (!modAGyro.hasCalibrated) {
      modAGyro.yaw = 0;
      modAGyro.pitch = 0;
      player.pitch = 0;
    }

    if (!modAGyro.screenListenerBound && typeof window !== 'undefined') {
      modAGyro.screenListenerBound = true;
      const onScreenOrientChange = () => {
        const nextAngle = getScreenOrientationAngle();
        if (nextAngle !== modAGyro.screenOrientationAngle) {
          modAGyro.screenOrientationAngle = nextAngle;
          // Kalibrasi semula rujukan secara lancar apabila iPad diputar antara Portrait dan Landscape
          if (modAGyro.active) {
            modAGyro.calibrated = false;
          }
        }
      };
      window.addEventListener('orientationchange', onScreenOrientChange);
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.addEventListener === 'function') {
        window.screen.orientation.addEventListener('change', onScreenOrientChange);
      }
    }
    return modAGyro.supported;
  }

  function bindModADeviceOrientationListenerOnce() {
    if (typeof window === 'undefined') return;
    if (!modAGyro.listenerBound) {
      window.removeEventListener('deviceorientation', onModADeviceOrientation);
      window.addEventListener('deviceorientation', onModADeviceOrientation);
      modAGyro.listenerBound = true;
      modAGyro.listenerCount = 1;
    }
  }

  function updateDeviceOrientation(e, immediate = false) {
    if (!modAGyro.active || State.mode !== '3d') return null;
    if (!e || (e.alpha === null && e.beta === null && e.gamma === null)) return null;

    // Jangan ubah orientasi kamera makmal semasa modal kuiz sedang dibuka (kecuali dalam ujian simulasi langsung)
    if (!immediate && DOM.stationModal && DOM.stationModal.classList.contains('open')) {
      return null;
    }

    const alpha = typeof e.alpha === 'number' ? e.alpha : 0;
    const beta = typeof e.beta === 'number' ? e.beta : 90;
    const gamma = typeof e.gamma === 'number' ? e.gamma : 0;
    const screenAngle = getScreenOrientationAngle();
    modAGyro.screenOrientationAngle = screenAngle;

    const q = computeDeviceWorldQuaternion(alpha, beta, gamma, screenAngle);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();
    const rawAzimuthDeg = ((THREE.MathUtils.radToDeg(Math.atan2(forward.x, -forward.z)) % 360) + 360) % 360;
    const rawElevationDeg = THREE.MathUtils.clamp(
      THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, forward.y)))),
      -65,
      65
    );

    modAGyro.rawAzimuthDeg = rawAzimuthDeg;
    modAGyro.rawElevationDeg = rawElevationDeg;
    modAGyro.currentAlpha = alpha;
    modAGyro.currentBeta = beta;
    modAGyro.currentGamma = gamma;
    modAGyro.quaternion.copy(q);

    // Bacaan pertama (atau selepas tukar orientasi skrin): Jadikan kedudukan semasa peranti sebagai ufuk hadapan (pitch = 0, yaw = 0)
    // Ini menghalang kamera daripada menghadap ke siling atau lantai semasa mula bermain pada iPad!
    if (!modAGyro.calibrated || modAGyro.baseAzimuthDeg === null || modAGyro.baseElevationDeg === null) {
      modAGyro.calibrated = true;
      modAGyro.hasCalibrated = true;
      modAGyro.baseAlpha = alpha;
      modAGyro.baseBeta = beta;
      modAGyro.baseGamma = gamma;
      modAGyro.baseAzimuthDeg = rawAzimuthDeg;
      modAGyro.baseElevationDeg = rawElevationDeg;
      modAGyro.smoothedAzimuthDeg = rawAzimuthDeg;
      modAGyro.smoothedElevationDeg = rawElevationDeg;
      modAGyro.yaw = 0;
      modAGyro.pitch = 0;
      modAGyro.smoothedYaw = 0;
      modAGyro.smoothedPitch = 0;
      player.pitch = 0;
      if (camera && State.mode === '3d') {
        camera.rotation.set(0, player.rotY, 0, 'YXZ');
      }
      return {
        yaw: 0,
        pitch: 0,
        rawAzimuthDeg,
        rawElevationDeg
      };
    }

    const smoothing = immediate ? 1.0 : 0.32;
    const azStep = shortestAngleDeltaDeg(rawAzimuthDeg, modAGyro.smoothedAzimuthDeg) * smoothing;
    modAGyro.smoothedAzimuthDeg = ((modAGyro.smoothedAzimuthDeg + azStep) % 360 + 360) % 360;
    modAGyro.smoothedElevationDeg += (rawElevationDeg - modAGyro.smoothedElevationDeg) * smoothing;

    // Kira perubahan sudut relatif terhadap rujukan kalibrasi (bebas gimbal lock & selamat merentasi 0°/360°)
    const deltaAzimuthDeg = shortestAngleDeltaDeg(modAGyro.smoothedAzimuthDeg, modAGyro.baseAzimuthDeg);
    const deltaElevationDeg = THREE.MathUtils.clamp(
      modAGyro.smoothedElevationDeg - modAGyro.baseElevationDeg,
      -65,
      65
    );

    // Dalam Three.js Euler 'YXZ':
    // - Pusing kiri (deltaAzimuthDeg < 0) -> +yaw (kamera pusing kiri)
    // - Pusing kanan (deltaAzimuthDeg > 0) -> -yaw (kamera pusing kanan)
    // - Dongak atas (deltaElevationDeg > 0) -> +pitch (kamera pandang atas)
    // - Tunduk bawah (deltaElevationDeg < 0) -> -pitch (kamera pandang bawah)
    modAGyro.yaw = THREE.MathUtils.degToRad(-deltaAzimuthDeg);
    modAGyro.pitch = THREE.MathUtils.degToRad(deltaElevationDeg);
    modAGyro.smoothedYaw = modAGyro.yaw;
    modAGyro.smoothedPitch = modAGyro.pitch;

    if (camera && State.mode === '3d' && !renderer.xr.isPresenting) {
      const combinedPitch = Math.max(-1.05, Math.min(1.05, player.pitch + modAGyro.pitch));
      camera.rotation.set(combinedPitch, player.rotY + modAGyro.yaw, 0, 'YXZ');
    }

    return {
      yaw: modAGyro.yaw,
      pitch: modAGyro.pitch,
      rawAzimuthDeg,
      rawElevationDeg,
      deltaAzimuthDeg,
      deltaElevationDeg
    };
  }

  function onModADeviceOrientation(e) {
    updateDeviceOrientation(e, false);
  }

  async function requestOrientationPermission() {
    initializeOrientation();
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          modAGyro.enabled = true;
          modAGyro.active = true;
          modAGyro.calibrated = false;
          modAGyro.yaw = 0;
          modAGyro.pitch = 0;
          player.pitch = 0;
          bindModADeviceOrientationListenerOnce();
          alertToast('🧭 Sensor pandangan 360° diaktifkan & dikalibrasi!');
          return true;
        }
      } catch (err) {
        console.warn('Orientation permission error:', err);
      }
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      modAGyro.enabled = true;
      modAGyro.active = true;
      modAGyro.calibrated = false;
      modAGyro.yaw = 0;
      modAGyro.pitch = 0;
      player.pitch = 0;
      bindModADeviceOrientationListenerOnce();
      alertToast('🧭 Sensor pandangan 360° diaktifkan & dikalibrasi!');
      return true;
    }
    modAGyro.active = false;
    return false;
  }

  async function enableModAGyroscope() {
    return requestOrientationPermission();
  }

  function calibrateForwardDirection(showToast = true) {
    // Jika sensor belum aktif tetapi disokong (tanpa perlu prompt iOS baharu), aktifkan listener
    if (!modAGyro.listenerBound && typeof window !== 'undefined' && 'DeviceOrientationEvent' in window &&
        typeof DeviceOrientationEvent.requestPermission !== 'function') {
      modAGyro.enabled = true;
      modAGyro.active = true;
      bindModADeviceOrientationListenerOnce();
    }

    if (modAGyro.hasCalibrated || modAGyro.baseAzimuthDeg !== null) {
      modAGyro.baseAzimuthDeg = modAGyro.smoothedAzimuthDeg;
      modAGyro.baseElevationDeg = modAGyro.smoothedElevationDeg;
      modAGyro.baseAlpha = modAGyro.currentAlpha;
      modAGyro.baseBeta = modAGyro.currentBeta;
      modAGyro.baseGamma = modAGyro.currentGamma;
      modAGyro.calibrated = true;
    } else {
      modAGyro.calibrated = false;
    }

    modAGyro.yaw = 0;
    modAGyro.pitch = 0;
    modAGyro.smoothedYaw = 0;
    modAGyro.smoothedPitch = 0;
    player.pitch = 0;

    if (camera && State.mode === '3d' && !renderer.xr.isPresenting) {
      camera.rotation.set(0, player.rotY, 0, 'YXZ');
    }

    if (showToast) {
      alertToast('🎯 Pandangan dikalibrasi semula ke arah hadapan & paras mendatar!');
    }
    return {
      baseAzimuthDeg: modAGyro.baseAzimuthDeg,
      baseElevationDeg: modAGyro.baseElevationDeg,
      yaw: modAGyro.yaw,
      pitch: modAGyro.pitch
    };
  }

  function resetViewDirection(showToast = false) {
    player.rotY = 0;
    player.pitch = 0;
    return calibrateForwardDirection(showToast);
  }

  function calibrateModAGyroHeading(showToast = true) {
    return calibrateForwardDirection(showToast);
  }

  function showCellCorePrompt() {
    if (!DOM.promptContainer) return;
    DOM.promptContainer.style.setProperty('--station-color', '#06b6d4');
    DOM.promptContainer.style.setProperty('--station-glow', 'rgba(6, 182, 212, 0.5)');
    DOM.promptIcon.textContent = '⚡';
    if (State.cellCoreActivated) {
      DOM.promptTitle.textContent = 'Teras Sel Aktif! Makmal ARSELNEL Selamat!';
      DOM.promptActionBtn.innerHTML = '<span>Telah Aktif</span><span class="cq-prompt-key">✓</span>';
    } else {
      DOM.promptTitle.textContent = 'Bilik Teras: Teras Tenaga Utama Makmal';
      DOM.promptActionBtn.innerHTML = '<span>Aktifkan Teras</span><span class="cq-prompt-key">E</span>';
    }
    DOM.promptContainer.classList.add('active');
    if (DOM.mobileInteractBtn) DOM.mobileInteractBtn.classList.add('visible');
  }

  async function activateCellCoreCrystal() {
    if (State.cellCoreActivated) {
      openLab3DCrystalVictoryModal();
      return;
    }
    State.cellCoreActivated = true;
    SoundFX.victory();
    alertToast('⚡ TERAS TENAGA TELAH DIAKTIFKAN! MAKMAL ARSELNEL PULIH SEPENUHNYA!');

    if (cellCoreCrystalGroup) {
      animatedObjects.push({
        progress: 0,
        update() {
          if (this.progress < 2.0) {
            this.progress += 0.05;
            cellCoreCrystalGroup.rotation.y += 0.08;
          }
        }
      });
    }

    showCellCorePrompt();
    State.score += 500;
    State.isCompleted = true;
    clearInterval(State.timerInterval);
    await saveLearningRecord();

    setTimeout(() => {
      openLab3DCrystalVictoryModal();
    }, 1200);
  }

  function handlePlayerInteract() {
    const distToCrystal = Math.hypot(player.x - 0, player.z - (-19.0));
    if (distToCrystal <= 3.5 && exitDoorMeshes && exitDoorMeshes.unlocked) {
      State.nearCellCoreCrystal = true;
    }
    if (State.nearCellCoreCrystal) {
      activateCellCoreCrystal();
      return;
    }
    if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
      openStationModal(State.nearbyStationIndex);
      return;
    }
    if (State.nearSecretDoor) {
      if (!exitDoorMeshes || !exitDoorMeshes.unlocked) {
        alertToast('🔒 Pintu Teras Sel masih terkunci! Selesaikan 8 cabaran stesen untuk membukanya.');
        SoundFX.interact();
      } else {
        alertToast('⚡ Pintu Teras Sel terbuka! Masuk ke hadapan untuk meneroka Bilik Teras Sel.');
        SoundFX.interact();
      }
    }
  }

  function updatePlayerMovement() {
    if (State.isPaused || (DOM.stationModal && DOM.stationModal.classList.contains('open')) ||
        (DOM.lab3dStoryMissionModal && DOM.lab3dStoryMissionModal.classList.contains('open')) ||
        (DOM.lab3dCalibrationModal && DOM.lab3dCalibrationModal.classList.contains('open')) ||
        (DOM.lab3dCrystalVictoryModal && DOM.lab3dCrystalVictoryModal.classList.contains('open'))) return;

    // In Three.js standard coordinates, the camera looks down -Z when rotY = 0.
    // CAMERA-RELATIVE MOVEMENT:
    // Compute the actual horizontal look heading (yaw), blending player.rotY with
    // modAGyro.yaw when device orientation / gyroscope is active on iPad or mobile.
    let currentLookYaw = player.rotY;
    if (State.mode === '3d' && modAGyro.active) {
      currentLookYaw += modAGyro.yaw;
    }

    const forwardX = -Math.sin(currentLookYaw);
    const forwardZ = -Math.cos(currentLookYaw);
    const rightX = Math.cos(currentLookYaw);
    const rightZ = -Math.sin(currentLookYaw);

    let inputFwd = 0;
    let inputStr = 0;

    // Keyboard inputs
    if (player.keys.forward) inputFwd += 1;
    if (player.keys.backward) inputFwd -= 1;
    if (player.keys.right) inputStr += 1;
    if (player.keys.left) inputStr -= 1;

    // Virtual Joystick inputs (smooth analog blending)
    if (joystickState.active) {
      inputFwd += joystickState.y; // Positive is forward
      inputStr += joystickState.x; // Positive is right
    }

    // Combine direction vectors
    let moveX = (inputFwd * forwardX) + (inputStr * rightX);
    let moveZ = (inputFwd * forwardZ) + (inputStr * rightZ);

    // Normalize diagonal or composite movement so diagonal is not faster
    const inputMagnitude = Math.hypot(moveX, moveZ);
    if (inputMagnitude > 0) {
      const scale = (Math.min(inputMagnitude, 1.0) / inputMagnitude) * player.speed;
      moveX *= scale;
      moveZ *= scale;
    }

    // Candidate new player coordinates
    const nextX = player.x + moveX;
    const nextZ = player.z + moveZ;

    // Multi-Zone Collision System (Main Lab, Corridor, & Bilik Teras Sel)
    let candidateX = nextX;
    let candidateZ = nextZ;
    // Pintu hanya boleh dilalui apabila pintu dalam keadaan 'OPEN' (atau openProgress >= 0.75)
    const isDoorPassable = exitDoorMeshes && (exitDoorMeshes.state === 'OPEN' || exitDoorMeshes.openProgress >= 0.75);

    if (candidateZ < -10.2) {
      // Hendak melangkah melepasi dinding hadapan / ambang pintu ke lorong atau bilik teras
      if (!isDoorPassable) {
        // Pintu masih TERKUNCI atau sedang MEMBUKA: sekat pergerakan pada Z = -10.2
        candidateZ = -10.2;
        candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      } else {
        // Pintu telah DIBUKA SEPENUHNYA
        if (candidateZ >= -14.0) {
          // Di dalam lorong penghubung (-14.0 <= Z <= -10.2):
          // Ruang bukaan lorong adalah antara X = -1.7 hingga X = 1.7 (lebar 3.4m)
          candidateX = Math.max(-1.7, Math.min(1.7, candidateX));
        } else {
          // Di dalam Bilik Teras Sel (Pusat bilik oktagon: X = 0, Z = -19.0)
          if (candidateZ <= -14.8 && !State.hasShownChamberWelcome) {
            State.hasShownChamberWelcome = true;
            alertToast('✨ SELAMAT DATANG KE BILIK TERAS SEL!\nAnda telah berjaya membuka bilik rahsia. Aktifkan kristal tenaga untuk menyelesaikan misi!');
          }

          const chamberCenterZ = -19.0;
          const distToChamberCenter = Math.hypot(candidateX, candidateZ - chamberCenterZ);
          if (distToChamberCenter > 5.5) {
            // Pemain berada di dalam lingkungan radius bilik 5.5m; benarkan keluar semula ke lorong di utara
            if (candidateZ > -15.0 && Math.abs(candidateX) <= 1.7) {
              // Melangkah kembali ke lorong
            } else {
              const angle = Math.atan2(candidateZ - chamberCenterZ, candidateX);
              candidateX = Math.cos(angle) * 5.5;
              candidateZ = chamberCenterZ + Math.sin(angle) * 5.5;
            }
          }
          // Penghadang kristal teras pusat (radius 0.85m sekeliling 0, -19.0)
          const distToCrystal = Math.hypot(candidateX, candidateZ - chamberCenterZ);
          if (distToCrystal < 0.85) {
            const angle = Math.atan2(candidateZ - chamberCenterZ, candidateX);
            candidateX = Math.cos(angle) * 0.85;
            candidateZ = chamberCenterZ + Math.sin(angle) * 0.85;
          }
        }
      }
    } else {
      // Di dalam Makmal Utama (-10.2 <= Z <= 10.2)
      candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      candidateZ = Math.min(10.2, candidateZ);

      // Perlanggaran Meja Penyelidikan Tugu Pusat Makmal (Radius 2.6m)
      const distToCenter = Math.hypot(candidateX, candidateZ);
      if (distToCenter < 2.6) {
        const angle = Math.atan2(candidateZ, candidateX);
        candidateX = Math.cos(angle) * 2.6;
        candidateZ = Math.sin(angle) * 2.6;
      }
    }

    player.x = candidateX;
    player.z = candidateZ;

    // Update Three.js camera from player coordinates
    if (!renderer.xr.isPresenting) {
      camera.position.set(player.x, player.y, player.z);

      if (State.mode === '3d' && modAGyro.active) {
        // Blend Mod A Gyroscope with mouse/touch look
        const combinedPitch = Math.max(-1.05, Math.min(1.05, player.pitch + modAGyro.pitch));
        camera.rotation.set(combinedPitch, player.rotY + modAGyro.yaw, 0, 'YXZ');
      } else if (gyroState.active && State.mode === 'camera-ar') {
        const radYaw = THREE.MathUtils.degToRad(gyroState.alpha - (gyroState.initialAlpha || 0));
        camera.rotation.set(player.pitch, player.rotY - radYaw, 0, 'YXZ');
      } else {
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
    }

    // Proximity detection to Cell Core Crystal in Bilik Teras Sel (Center Z = -19.0)
    const distToCrystal = Math.hypot(player.x - 0, player.z - (-19.0));
    if (distToCrystal <= 3.4 && exitDoorMeshes && exitDoorMeshes.unlocked) {
      State.nearCellCoreCrystal = true;
      State.nearbyStationIndex = -1;
      showCellCorePrompt();
    } else {
      State.nearCellCoreCrystal = false;
      // Proximity detection to 8 stations in main lab
      checkStationProximity();
    }

    // Proximity detection to Secret Door
    if (Math.abs(player.x) < 2.5 && player.z < -8.5 && player.z > -12.0) {
      State.nearSecretDoor = true;
    } else {
      State.nearSecretDoor = false;
    }
  }

  // Check proximity to stations (~3.2 meters threshold)
  function checkStationProximity() {
    let closestIndex = -1;
    let closestDist = Infinity;

    stationMeshes.forEach(stn => {
      const dist = Math.hypot(player.x - stn.data.pos.x, player.z - stn.data.pos.z);
      if (dist < 3.2 && dist < closestDist) {
        closestDist = dist;
        closestIndex = stn.index;
      }
    });

    if (closestIndex !== State.nearbyStationIndex) {
      State.nearbyStationIndex = closestIndex;
      updatePromptUI();
    }
  }

  function updatePromptUI() {
    if (State.nearbyStationIndex >= 0) {
      const stn = State.stations[State.nearbyStationIndex];
      const isDone = State.completedStations.has(stn.number);

      DOM.promptContainer.style.setProperty('--station-color', stn.color);
      DOM.promptContainer.style.setProperty('--station-glow', `${stn.color}66`);
      DOM.promptIcon.textContent = isDone ? '✓' : stn.number;
      DOM.promptTitle.textContent = isDone ? `${stn.title} (Selesai)` : `Stesen ${stn.number}: ${stn.title}`;
      DOM.promptActionBtn.innerHTML = `<span>${isDone ? 'Ulang Kaji' : 'Teroka'}</span><span class="cq-prompt-key">E</span>`;
      DOM.promptContainer.classList.add('active');

      if (DOM.mobileInteractBtn) {
        DOM.mobileInteractBtn.classList.add('visible');
      }

      SoundFX.interact();
    } else {
      DOM.promptContainer.classList.remove('active');
      if (DOM.mobileInteractBtn) {
        DOM.mobileInteractBtn.classList.remove('visible');
      }
    }
  }

  // Raycasting 3D untuk memilih model organel (termasuk semua child mesh GLB) menggunakan metadata parent group
  function handle3DStationRaycastTap(clientX, clientY) {
    if (!renderer || !camera || State.mode !== '3d') return false;
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    arPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    arPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    arRaycaster.setFromCamera(arPointer, camera);

    const targets = [];
    if (walkthroughStationsGroup) targets.push(walkthroughStationsGroup);
    if (erExhibitGroup) targets.push(erExhibitGroup);
    if (!targets.length) return false;

    const hits = arRaycaster.intersectObjects(targets, true);
    if (!hits.length) return false;

    for (const hit of hits) {
      let node = hit.object;
      while (node) {
        if (node.userData && node.userData.isSupplementaryExhibit) {
          SoundFX.interact();
          alertToast(`🧬 ${node.userData.title}: ${node.userData.description}`);
          speakExplanation(`${node.userData.title}. ${node.userData.description}`);
          return true;
        }
        if (node.userData && typeof node.userData.stationIndex === 'number' && node.userData.stationIndex >= 0) {
          const stnIdx = node.userData.stationIndex;
          State.nearbyStationIndex = stnIdx;
          updatePromptUI();
          openStationModal(stnIdx);
          return true;
        }
        if (node.userData && node.userData.stationId) {
          const foundIdx = State.stations.findIndex(s => s.id === node.userData.stationId);
          if (foundIdx >= 0) {
            State.nearbyStationIndex = foundIdx;
            updatePromptUI();
            openStationModal(foundIdx);
            return true;
          }
        }
        node = node.parent;
      }
    }
    return false;
  }

  // ==============================================================================
  // 3D INTERACTIVE ORGANELLE PREVIEW BOX IN MODAL
  // ==============================================================================

  let isPreviewDraggingGlobal = false;
  const previewZoomState = {
    distance: 2.35,
    defaultDistance: 2.35,
    minDistance: 0.35,
    maxDistance: 4.8,
    isPinching: false,
    startPinchDist: 0,
    startZoomDist: 2.35
  };

  function applyPreviewCameraDistance() {
    if (!previewCamera) return;
    previewCamera.position.set(0, 0.25, previewZoomState.distance);
    previewCamera.lookAt(0, 0, 0);
  }

  function setPreviewZoom(targetDist) {
    if (!previewCamera) return;
    const clamped = Math.max(previewZoomState.minDistance, Math.min(previewZoomState.maxDistance, targetDist));
    previewZoomState.distance = clamped;
    applyPreviewCameraDistance();
  }

  function recalculatePreviewBounds() {
    if (!previewModelGroup || !previewCamera) return;
    previewModelGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(previewModelGroup);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    // Fasa A.3: Had jarak dinamik mengikut saiz fizikal bounding box model
    previewZoomState.minDistance = Math.max(0.25, maxDim * 0.45);
    previewZoomState.maxDistance = Math.max(3.2, maxDim * 3.4);
    previewZoomState.defaultDistance = Math.max(1.6, maxDim * 1.75);
    previewZoomState.distance = previewZoomState.defaultDistance;

    // Perlindungan satah pemotongan hadapan kamera (near clipping plane 0.02)
    previewCamera.near = Math.min(0.02, previewZoomState.minDistance * 0.1);
    previewCamera.updateProjectionMatrix();

    applyPreviewCameraDistance();
  }

  function initStationPreview() {
    if (!DOM.stnPreviewCanvas) return;

    previewScene = new THREE.Scene();
    previewCamera = new THREE.PerspectiveCamera(40, 2, 0.02, 50);
    previewCamera.position.set(0, 0.25, previewZoomState.distance);
    previewCamera.lookAt(0, 0, 0);

    previewRenderer = new THREE.WebGLRenderer({
      canvas: DOM.stnPreviewCanvas,
      antialias: true,
      alpha: true
    });
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    previewRenderer.outputEncoding = THREE.sRGBEncoding;
    previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    previewRenderer.toneMappingExposure = 1.35;

    // Studio PBR Lights for preview (Pencahayaan dipertingkatkan untuk organel & rongga dalaman)
    const ambLight = new THREE.AmbientLight(0xffffff, 1.45);
    previewScene.add(ambLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.20);
    hemiLight.position.set(0, 10, 0);
    previewScene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.45);
    dirLight1.position.set(3, 5, 4);
    previewScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe0f2fe, 1.05);
    dirLight2.position.set(-3, 2, -2);
    previewScene.add(dirLight2);

    // Lampu Hadapan Pandangan Kamera (Camera-view fill) untuk menerangi permukaan hadapan & rongga Nukleus
    const frontFillLight = new THREE.DirectionalLight(0xffffff, 1.15);
    frontFillLight.position.set(0, 0.5, 3.5);
    previewScene.add(frontFillLight);

    // Warm laboratory accent light
    const accentLight = new THREE.PointLight(0x38bdf8, 1.20, 10);
    accentLight.position.set(-2, 3, 2);
    previewScene.add(accentLight);

    // Interactive Drag to Rotate & Deep Zoom (Pinch / Wheel / Toolbar)
    let prevX = 0;
    let prevY = 0;
    const host = DOM.stnPreviewHost || DOM.stnPreviewCanvas;

    const onStart = (clientX, clientY) => {
      isPreviewDraggingGlobal = true;
      prevX = clientX;
      prevY = clientY;
    };
    const onMove = (clientX, clientY) => {
      if (!isPreviewDraggingGlobal || !previewModelGroup) return;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      previewModelGroup.rotation.y += dx * 0.015;
      previewModelGroup.rotation.x = Math.max(-0.6, Math.min(0.6, previewModelGroup.rotation.x + dy * 0.015));
    };

    // Mouse Controls (Rotate & Wheel Zoom)
    host.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => { isPreviewDraggingGlobal = false; });

    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      const step = (previewZoomState.maxDistance - previewZoomState.minDistance) * 0.08;
      const delta = Math.sign(e.deltaY) * step;
      setPreviewZoom(previewZoomState.distance + delta);
    }, { passive: false });

    // Touch Controls (Single-touch rotate & 2-finger Pinch Zoom for iPad Safari)
    host.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        isPreviewDraggingGlobal = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        previewZoomState.isPinching = true;
        previewZoomState.startPinchDist = Math.hypot(dx, dy);
        previewZoomState.startZoomDist = previewZoomState.distance;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (previewZoomState.isPinching && e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const curDist = Math.hypot(dx, dy);
        if (previewZoomState.startPinchDist > 0) {
          const ratio = curDist / previewZoomState.startPinchDist;
          setPreviewZoom(previewZoomState.startZoomDist / ratio);
        }
      } else if (isPreviewDraggingGlobal && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        previewZoomState.isPinching = false;
      }
      if (e.touches.length === 0) {
        isPreviewDraggingGlobal = false;
      }
    }, { passive: true });

    // Toolbar Buttons Zoom (+ / - / Fit)
    const btnIn = document.getElementById('cq-zoom-in-btn');
    const btnOut = document.getElementById('cq-zoom-out-btn');
    const btnFit = document.getElementById('cq-zoom-fit-btn');

    if (btnIn) {
      btnIn.onclick = (e) => {
        e.stopPropagation();
        const step = (previewZoomState.maxDistance - previewZoomState.minDistance) * 0.15;
        setPreviewZoom(previewZoomState.distance - step);
      };
    }
    if (btnOut) {
      btnOut.onclick = (e) => {
        e.stopPropagation();
        const step = (previewZoomState.maxDistance - previewZoomState.minDistance) * 0.15;
        setPreviewZoom(previewZoomState.distance + step);
      };
    }
    if (btnFit) {
      btnFit.onclick = (e) => {
        e.stopPropagation();
        setPreviewZoom(previewZoomState.defaultDistance);
        if (previewModelGroup) {
          previewModelGroup.rotation.set(0, 0, 0);
        }
      };
    }
  }

  function startStationPreviewLoop() {
    cancelAnimationFrame(previewAnimId);
    function animatePreview() {
      if (DOM.stationModal && DOM.stationModal.classList.contains('open')) {
        previewAnimId = requestAnimationFrame(animatePreview);
        if (previewModelGroup && !isPreviewDraggingGlobal && !previewZoomState.isPinching) {
          previewModelGroup.rotation.y += 0.006; // Putaran pameran lembut
        }
        if (previewModelGroup && previewModelGroup.userData && previewModelGroup.userData.isCytoplasmGel && previewModelGroup.userData.gelVisual) {
          previewModelGroup.userData.gelVisual.userData.updateAnimation(performance.now() * 0.001);
        }
        if (previewRenderer && previewScene && previewCamera) {
          previewRenderer.render(previewScene, previewCamera);
        }
      }
    }
    animatePreview();
  }

  function updateStationPreview(stn) {
    if (!previewScene) return;

    // Bersihkan model preview lama daripada scene.
    // JANGAN sesekali panggil child.geometry.dispose() atau child.material.dispose() di sini
    // kerana objek berkongsi buffer geometri bersama cache master GLB (cachedOrganelleGLBs)!
    if (previewModelGroup) {
      previewScene.remove(previewModelGroup);
      previewModelGroup = null;
    }

    // Bina perwakilan visual organel (fallback prosedur + peningkatan GLB untuk semua 8 stesen)
    previewModelGroup = buildStylizedOrganelle(stn.number, stn.colorHex);
    previewModelGroup.scale.set(1.4, 1.4, 1.4);
    previewModelGroup.rotation.set(0, 0, 0);
    previewScene.add(previewModelGroup);
    recalculatePreviewBounds();

    const previewGLBMap = {
      1: 'nucleus',
      2: 'membrane',
      3: 'cytoplasm',
      4: 'mitochondria',
      5: 'chloroplast',
      6: 'wall',
      7: 'vacuole'
    };
    const glbKey = previewGLBMap[stn.number];
    if (glbKey) {
      previewModelGroup.scale.set(1, 1, 1);
      mountGLBIntoContainer(previewModelGroup, glbKey, 'preview', {
        stationId: stn.id,
        stationNumber: stn.number,
        organelleId: glbKey,
        alignOnTable: false
      }).then(() => {
        recalculatePreviewBounds();
        startStationPreviewLoop();
      });
    } else if (stn.number === 8) {
      previewModelGroup.scale.set(1, 1, 1);
      const compGroup = previewModelGroup.children[0];
      if (compGroup && compGroup.children.length >= 2) {
        const leftAnimal = new THREE.Group();
        leftAnimal.position.set(-0.52, 0.04, 0);
        const rightPlant = new THREE.Group();
        rightPlant.position.set(0.52, 0.04, 0);
        const erCenter = new THREE.Group();
        erCenter.position.set(0, 0.32, 0.04);
        compGroup.clear();
        compGroup.add(leftAnimal, rightPlant, erCenter);
        Promise.all([
          mountGLBIntoContainer(leftAnimal, 'animal', 'preview', { customTargetSize: 0.85, alignOnTable: false }),
          mountGLBIntoContainer(rightPlant, 'plant', 'preview', { customTargetSize: 0.88, alignOnTable: false }),
          mountGLBIntoContainer(erCenter, 'er', 'preview', { customTargetSize: 0.70, alignOnTable: false })
        ]).then(() => {
          recalculatePreviewBounds();
          startStationPreviewLoop();
        });
      }
    }

    // Resize preview renderer to match container
    const rect = DOM.stnPreviewCanvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      previewCamera.aspect = rect.width / rect.height;
      previewCamera.updateProjectionMatrix();
      previewRenderer.setSize(rect.width, rect.height);
    }

    startStationPreviewLoop();
  }

  // ==============================================================================
  // STATION MODAL & QUIZ CHALLENGE
  // ==============================================================================

  function openStationModal(index) {
    State.activeStationIndex = index;
    const stn = State.stations[index];

    DOM.stationModal.style.setProperty('--current-color', stn.color);
    DOM.stationNumberChip.textContent = `STESEN ${stn.number} • ${stn.organelle.toUpperCase()}`;
    DOM.stationNumberChip.style.background = `${stn.color}22`;
    DOM.stationNumberChip.style.color = stn.color;
    DOM.stationTitle.textContent = stn.title;
    DOM.stationDesc.textContent = stn.description;

    const stnSpeechBtn = document.getElementById('stn-speech-btn');
    if (stnSpeechBtn) {
      stnSpeechBtn.onclick = (e) => {
        e.stopPropagation();
        speakExplanation(`${stn.title}. ${stn.description}`);
      };
    }

    DOM.quizQuestion.textContent = stn.question;
    renderQuizOptions(stn);

    DOM.quizFeedback.style.display = 'none';
    DOM.stationModal.classList.add('open');

    // Update 3D Interactive Preview Box SELEPAS modal dibuka supaya saiz kanvas > 0 dan gelung animasi berjalan
    updateStationPreview(stn);
    startStationPreviewLoop();

    SoundFX.interact();
  }

  function closeStationModal() {
    logARDiagnostic('MODAL', 'close_station_modal', { activeStation: State.activeStationIndex });
    DOM.stationModal.classList.remove('open');
    cancelAnimationFrame(previewAnimId);
    State.activeStationIndex = -1;

    // Fasa A.4: Pastikan strim video kamera diteruskan semula jika dihentikan oleh WebKit iPad
    if ((State.mode === 'camera-ar' || State.mode === 'marker-ar') && DOM.cameraFeed && cameraStream) {
      if (DOM.cameraFeed.paused) {
        DOM.cameraFeed.play().catch(e => {
          logARDiagnostic('CAMERA', 'resume_on_station_modal_close_err', { error: String(e) });
        });
      }
    }

    // Jika semua 8 stesen selesai, paparkan modal Treasure Hunt secara kemas SELEPAS modal stesen ditutup
    if (State.completedStations.size >= 8 && State.treasureHuntUnlocked && !State.treasureHuntCompleted && !State.treasureHuntActive) {
      setTimeout(() => {
        showTreasureHuntIntroModal();
      }, 350);
    }
  }

  function renderQuizOptions(stn) {
    DOM.quizOptions.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    stn.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cq-quiz-opt';
      btn.innerHTML = `<span class="cq-opt-letter">${letters[optIdx]}</span><span>${optText.replace(/^[A-D]\.\s*/, '')}</span>`;
      btn.addEventListener('click', () => handleQuizAnswer(stn, optIdx, btn));
      DOM.quizOptions.appendChild(btn);
    });
  }

  function handleQuizAnswer(stn, selectedIdx, optBtn) {
    // Disable all options after clicking
    const allBtns = DOM.quizOptions.querySelectorAll('.cq-quiz-opt');
    allBtns.forEach(b => b.disabled = true);

    State.attemptsCount[stn.number] = (State.attemptsCount[stn.number] || 0) + 1;
    const attemptNum = State.attemptsCount[stn.number];

    const isCorrect = selectedIdx === stn.correct;

    if (isCorrect) {
      optBtn.classList.add('correct');
      SoundFX.correct();

      // Points calculation: 1st try = 100, 2nd try = 70, 3rd+ = 50
      let points = 50;
      if (attemptNum === 1) points = 100;
      else if (attemptNum === 2) points = 70;

      if (!State.completedStations.has(stn.number)) {
        State.completedStations.add(stn.number);
        State.score += points;
        markStationCompleted(stn.number);
      }

      DOM.quizFeedback.className = 'cq-feedback-box correct';
      DOM.quizFeedback.innerHTML = `
        <strong>🎉 TAHNIAH! JAWAPAN TEPAT!</strong>
        <p style="margin-top: 6px;">${stn.explanation}</p>
        <div class="cq-feedback-badge-reward">
          <span style="font-size: 24px;">🎖️</span>
          <span>+${points} Mata Diperoleh! Lencana Stesen ${stn.number} Diterima!</span>
        </div>
      `;
      DOM.quizFeedback.style.display = 'block';

      // Check if all 8 stations completed!
      if (State.completedStations.size === 8) {
        unlockExitDoor();
      }
    } else {
      optBtn.classList.add('incorrect');
      SoundFX.incorrect();

      // Highlight correct button
      if (allBtns[stn.correct]) {
        allBtns[stn.correct].classList.add('correct');
      }

      DOM.quizFeedback.className = 'cq-feedback-box incorrect';
      DOM.quizFeedback.innerHTML = `
        <strong>❌ KURANG TEPAT, SILA BACA PENERANGAN DI BAWAH:</strong>
        <p style="margin-top: 6px;">${stn.explanation}</p>
        <div style="margin-top: 10px;">
          <button type="button" class="cq-btn-secondary" id="retry-question-btn" style="padding: 6px 14px; font-size: 13px;">
            🔄 Cuba Semula Soalan
          </button>
        </div>
      `;
      DOM.quizFeedback.style.display = 'block';

      const retryBtn = document.getElementById('retry-question-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          renderQuizOptions(stn);
          DOM.quizFeedback.style.display = 'none';
        });
      }
    }

    updateHUD();
  }

  // Station completed visual feedback in 3D world, AR mini lab & HUD
  function markStationCompleted(stationNumber) {
    State.completedStations.add(stationNumber);
    State.lastCompletedStationNumber = stationNumber;
    const stnMesh = stationMeshes.find(s => s.data.number === stationNumber);
    if (stnMesh) {
      stnMesh.halo.material.color.setHex(0x10b981);
      stnMesh.beacon.children[0].material.color.setHex(0x10b981);
      stnMesh.beacon.children[0].material.emissive.setHex(0x064e3b);
    }

    const miniBadge = document.getElementById(`mini-badge-${stationNumber}`);
    if (miniBadge) {
      miniBadge.classList.add('completed');
      miniBadge.textContent = '✓';
    }

    // Also update mini lab AR beacon if present
    if (arMiniLabHolder && arMiniLabHolder.children[0]?.userData?.stationMeshesMini) {
      const miniStn = arMiniLabHolder.children[0].userData.stationMeshesMini.find(m => m.stationNumber === stationNumber);
      if (miniStn && miniStn.beacon) {
        miniStn.beacon.children[0]?.material?.color?.setHex?.(0x10b981);
        miniStn.beacon.children[0]?.material?.emissive?.setHex?.(0x064e3b);
      }
    }

    // Update 8 World-Locked AR Stations & Marker Anchors
    arWorldState.stationGroups.forEach(group => {
      if (group.userData && group.userData.stationConfig && group.userData.stationConfig.stationNumber === stationNumber) {
        const cfg = group.userData.stationConfig;
        if (group.userData.beacon && group.userData.beacon.children && group.userData.beacon.children[0]?.material) {
          group.userData.beacon.children[0].material.color.setHex(0x10b981);
        }
        const oldLabel = group.userData.labelGroup;
        if (oldLabel && cfg) {
          const elevStr = cfg.elevationDeg > 0 ? `+${cfg.elevationDeg}°` : `${cfg.elevationDeg}°`;
          const labelTitle = `Stesen ${cfg.stationNumber}: ${cfg.label}`;
          const labelSub = `Arah ${cfg.directionName} (${cfg.azimuthDeg}°, Elevasi ${elevStr}) • Selesai ✓`;
          const newLabel = buildStationLabel(labelTitle, labelSub, cfg.icon, cfg.color, cfg.stationNumber);
          newLabel.position.copy(oldLabel.position);
          group.remove(oldLabel);
          group.add(newLabel);
          group.userData.labelGroup = newLabel;
        }
      }
    });

    arMarkerState.anchors.forEach(anchor => {
      if (anchor.userData && anchor.userData.stationConfig && anchor.userData.stationConfig.stationNumber === stationNumber) {
        const cfg = anchor.userData.stationConfig;
        const oldLabel = anchor.userData.labelGroup;
        if (oldLabel && cfg) {
          const labelTitle = `Kad #${cfg.markerId}: ${cfg.label}`;
          const labelSub = `Stesen ${cfg.stationNumber} • Selesai ✓`;
          const newLabel = buildStationLabel(labelTitle, labelSub, cfg.icon, cfg.color, cfg.stationNumber);
          newLabel.position.copy(oldLabel.position);
          newLabel.scale.copy(oldLabel.scale);
          anchor.remove(oldLabel);
          anchor.add(newLabel);
          anchor.userData.labelGroup = newLabel;
        }
      }
    });

    if (arWorldState.active) {
      updateARWorldCompass();
    }

    if (DOM.arStationsDrawer && DOM.arStationsDrawer.classList.contains('open')) {
      renderARStationsDrawer();
    }

    // Update active AR card badge if open
    if (DOM.arCardBadge && State.completedStations.has(stationNumber)) {
      DOM.arCardBadge.textContent = `Lencana Stesen ${stationNumber} Selesai ✓`;
      DOM.arCardBadge.classList.add('completed');
    }

    if (DOM.arMissionStatusText) {
      DOM.arMissionStatusText.textContent = `Stesen Dipulihkan: ${State.completedStations.size}/8`;
    }
    updateSecretDoorSign(`PINTU TERAS SEL • TERKUNCI (${State.completedStations.size}/8 DIPULIHKAN)`, 0xf59e0b);
    alertToast('TAHNIAH! Tenaga organel berjaya dipulihkan!');

    // Semak sama ada semua 8 stesen telah selesai
    if (State.completedStations.size >= 8) {
      unlockExitDoor();
      // MOD A: Terus buka Pintu Teras Sel ke Bilik Teras Sel (TIADA PETI HARTA KARUN DALAM MOD A)
      if (State.mode !== '3d') {
        State.treasureHuntUnlocked = true;
        // Paparan modal Treasure Hunt akan dipicu secara selamat di closeStationModal()
        // sebaik sahaja murid selesai membaca maklum balas dan menutup modal stesen 8.
      }
    } else if (arWorldState.active) {
      // Auto-Next Station: Tukar sasaran Smart Radar kepada stesen seterusnya yang belum selesai
      const nextIdx = findNextUncompletedStation(arWorldState.targetStationIdx);
      if (nextIdx >= 0) {
        selectRadarTargetStation(nextIdx, false);
        const nextCfg = AR_WORLD_STATIONS[nextIdx];
        if (nextCfg) {
          alertToast(`🎯 Sasaran Seterusnya: Stesen ${nextCfg.stationNumber} (${nextCfg.label})`);
        }
      }
    }
  }

  // Cari stesen seterusnya yang belum selesai mengikut urutan bulatan 1..8 (Auto-Next Station)
  function findNextUncompletedStation(fromIdx = 0) {
    if (typeof fromIdx !== 'number' || fromIdx < 0) fromIdx = 0;
    for (let offset = 1; offset <= 8; offset++) {
      const idx = (fromIdx + offset) % 8;
      const stnNum = AR_WORLD_STATIONS[idx]?.stationNumber;
      if (stnNum && !State.completedStations.has(stnNum)) {
        return idx;
      }
    }
    return -1; // Semua 8 stesen telah selesai
  }

  function showTreasureHuntIntroModal() {
    if (DOM.treasureHuntIntroModal) {
      DOM.treasureHuntIntroModal.classList.add('open');
      SoundFX.fanfare();
    }
  }

  function hideTreasureHuntIntroModal() {
    if (DOM.treasureHuntIntroModal) {
      DOM.treasureHuntIntroModal.classList.remove('open');
    }
    if ((State.mode === 'camera-ar' || State.mode === 'marker-ar') && DOM.cameraFeed && cameraStream) {
      if (DOM.cameraFeed.paused) {
        DOM.cameraFeed.play().catch(() => {});
      }
    }
  }

  // Unlock Exit Door when all 8 stations are cleared
  function unlockExitDoor() {
    if (!exitDoorMeshes || exitDoorMeshes.unlocked) return;
    exitDoorMeshes.unlocked = true;
    exitDoorMeshes.state = 'OPENING';
    State.cellCoreChamberUnlocked = true;

    // Tukar lampu pengimbas dan rasuk pintu ke hijau zamrud
    if (exitDoorMeshes.scannerLed) exitDoorMeshes.scannerLed.material.color.setHex(0x10b981);
    if (exitDoorMeshes.doorLight) exitDoorMeshes.doorLight.color.setHex(0x10b981);
    if (exitDoorMeshes.pillarLightL) exitDoorMeshes.pillarLightL.material.color.setHex(0x10b981);
    if (exitDoorMeshes.pillarLightR) exitDoorMeshes.pillarLightR.material.color.setHex(0x10b981);

    // Semua 8 LED indikator stesen menyala hijau zamrud
    if (exitDoorMeshes.statusLeds) {
      exitDoorMeshes.statusLeds.forEach(led => led.material.color.setHex(0x10b981));
    }

    // Kemas kini papan tanda status dengan fasa pembukaan
    updateSecretDoorSign('⚡ MEMBUKA PINTU... AKSES DIBENARKAN (8/8)', 0x22d3ee);

    // Aktifkan laluan berlampu lantai menuju ke bilik teras
    if (floorGuideTrailGroup) {
      floorGuideTrailGroup.visible = true;
      if (floorGuideTrailGroup.userData) floorGuideTrailGroup.userData.active = true;
    }

    // Bunyi futuristik & Notifikasi Pencapaian
    SoundFX.victory();
    alertToast('🌟 SEMUA STESEN BERJAYA DIPULIHKAN! Syabas, Saintis Muda! Pintu Teras Sel kini dibuka. Pergi ke bilik rahsia untuk menyelesaikan misi terakhir!');

    // Animasi kedua-dua panel pintu menggelongsor ke tepi (Left door -> -3.15, Right door -> +3.15)
    // Berjalan lancar selama ~1.8 saat dengan kelonggaran quadratic ease-out
    animatedObjects.push({
      animProgress: 0,
      duration: 1.8,
      update(elapsed, delta) {
        if (!exitDoorMeshes || exitDoorMeshes.state === 'OPEN') return;
        const dt = delta || 0.016;
        this.animProgress = Math.min(1.0, this.animProgress + dt / this.duration);
        const ease = 1.0 - Math.pow(1.0 - this.animProgress, 2);

        // Panel Kiri menggelongsor ke dalam dinding kiri: dari -1.025 ke -3.15 (anjakan 2.125m)
        if (exitDoorMeshes.leftDoor) {
          exitDoorMeshes.leftDoor.position.x = -1.025 - (2.125 * ease);
        }
        // Panel Kanan menggelongsor ke dalam dinding kanan: dari +1.025 ke +3.15 (anjakan 2.125m)
        if (exitDoorMeshes.rightDoor) {
          exitDoorMeshes.rightDoor.position.x = 1.025 + (2.125 * ease);
        }

        // Penghadang tenaga memudar dan hilang sepenuhnya
        if (exitDoorMeshes.shield) {
          exitDoorMeshes.shield.material.opacity = Math.max(0, 0.35 * (1.0 - ease));
          if (this.animProgress >= 0.7) {
            exitDoorMeshes.shield.visible = false;
          }
        }

        exitDoorMeshes.openProgress = this.animProgress;

        // Setelah selesai sepenuhnya, tukar state ke OPEN & kemas kini papan tanda
        if (this.animProgress >= 1.0) {
          exitDoorMeshes.state = 'OPEN';
          if (exitDoorMeshes.shield) exitDoorMeshes.shield.visible = false;
          updateSecretDoorSign('⚡ SILA MASUK — BILIK TERAS SEL', 0x10b981);
        }
      }
    });
  }

  function alertToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 110px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #0d9488, #10b981); color: #fff;
      padding: 12px 22px; border-radius: 999px; font-weight: 800; font-size: 14px;
      z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: none;
      animation: fadeIn 0.4s ease; text-align: center; max-width: 90vw;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // ==============================================================================
  // VICTORY CELEBRATION & DIGITAL CERTIFICATE
  // ==============================================================================

  async function completeMission() {
    if (State.isCompleted) return;
    State.isCompleted = true;
    clearInterval(State.timerInterval);

    SoundFX.victory();

    const studentName = (State.user && (State.user.name || State.user.nickname)) 
      ? (State.user.name || State.user.nickname) 
      : 'Saintis Muda';

    DOM.certStudentName.textContent = studentName;
    DOM.certScore.textContent = `${State.score} Mata`;
    DOM.certTime.textContent = formatTime(State.durationSeconds);
    DOM.certDate.textContent = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    DOM.victoryModal.classList.add('open');
    await saveLearningRecord();
  }

  async function saveLearningRecord() {
    const totalQuestions = State.stations.length;
    const correctCount = State.completedStations.size;

    const recordData = {
      id: `cq_adv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      quiz_id: 'cellquest-ar-adventure',
      quizId: 'cellquest-ar-adventure',
      game_id: 'cellquest-ar-adventure',
      score: State.score,
      correct: correctCount,
      correct_answers: correctCount,
      total: totalQuestions,
      total_questions: totalQuestions,
      duration_seconds: State.durationSeconds,
      durationSeconds: State.durationSeconds,
      completedAt: new Date().toISOString(),
      meta: {
        game_title: 'CellQuest AR Adventure — Misi Jelajah Dunia Sel',
        badges_collected: correctCount,
        attempts: State.attemptsCount,
        mode: State.mode
      }
    };

    try {
      if (window.ARSupabase && typeof window.ARSupabase.saveGameRecord === 'function') {
        const res = await window.ARSupabase.saveGameRecord(recordData);
        console.log('Record saved successfully:', res);
      } else {
        const list = JSON.parse(localStorage.getItem('cellquest_adventure_records') || '[]');
        list.push(recordData);
        localStorage.setItem('cellquest_adventure_records', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to save record to Supabase, cached locally:', err);
    }
  }

  function printOrSaveCertificate() {
    window.print();
  }

  function closeVictoryModal() {
    DOM.victoryModal.classList.remove('open');
  }

  function restartGame() {
    State.completedStations.clear();
    State.score = 0;
    State.durationSeconds = 0;
    State.attemptsCount = {};
    State.isCompleted = false;
    State.lastCompletedStationNumber = null;

    // Reset Misi Akhir: Treasure Hunt ARSELNel
    State.treasureHuntUnlocked = false;
    State.treasureHuntActive = false;
    State.treasureHuntCompleted = false;
    State.treasureHuntBonusClaimed = false;
    State.treasureHuntQuestions = [];
    State.treasureHuntCurrentQIndex = 0;
    State.treasureHuntCorrectCount = 0;
    arWorldState.isTreasureHuntActive = false;
    arWorldState.isChestLidOpen = false;
    if (arWorldState.treasureChestGroup) {
      arWorldState.treasureChestGroup.visible = false;
      if (arWorldState.chestLidPivot) arWorldState.chestLidPivot.rotation.x = 0;
      if (arWorldState.chestLight) arWorldState.chestLight.intensity = 0.6;
    }

    player.x = 0;
    player.z = 8.5;
    player.rotY = 0; // Look down -Z towards lab center

    buildMiniBadgeStrip();
    stationMeshes.forEach(stn => {
      stn.halo.material.color.setHex(stn.data.colorHex);
      stn.beacon.children[0].material.color.setHex(0xfacc15);
      stn.beacon.children[0].material.emissive.setHex(0x713f12);
    });

    if (exitDoorMeshes) {
      exitDoorMeshes.unlocked = false;
      exitDoorMeshes.shield.material.color.setHex(0xef4444);
      exitDoorMeshes.leftDoor.position.x = -1.05;
      exitDoorMeshes.rightDoor.position.x = 1.05;
    }

    startTimer();
    updateHUD();
    closeVictoryModal();
    hideTreasureRewardModal();
    hideTreasureHuntIntroModal();
    closeTreasureChestModal();
  }

  // ==============================================================================
  // MISI AKHIR: PETI HARTA KARUN ARSELNEL (SELEPAS 8/8 STESEN SELESAI)
  // 3 Soalan Bonus Biologi (Perbandingan Sel Haiwan & Sel Tumbuhan KSSM)
  // Ganjaran: +300 Mata Bonus Sekali Sahaja & Lencana Khas: Penjelajah Dunia Sel
  // ==============================================================================

  const BONUS_TREASURE_QUESTIONS = [
    {
      question: "Organel manakah yang hanya hadir dalam sel tumbuhan dan berfungsi menyerap tenaga cahaya untuk fotosintesis?",
      options: ["Mitokondrion", "Kloroplas", "Nukleus", "Vakuol"],
      correctIndex: 1,
      explanation: "Kloroplas mengandungi pigmen klorofil yang menyerap cahaya matahari untuk fotosintesis. Organel ini hanya wujud dalam sel tumbuhan."
    },
    {
      question: "Struktur manakah yang tegar, diperbuat daripada selulosa, dan memberikan sokongan mekanikal serta bentuk tetap kepada sel tumbuhan?",
      options: ["Membran Sel", "Dinding Sel", "Sitoplasma", "Jasad Golgi"],
      correctIndex: 1,
      explanation: "Dinding sel terbina daripada gentian selulosa tegar untuk mengekalkan bentuk sel tumbuhan. Sel haiwan tidak mempunyai dinding sel."
    },
    {
      question: "Apakah fungsi utama Mitokondrion yang terdapat dalam kedua-dua sel haiwan dan sel tumbuhan?",
      options: ["Menghasilkan tenaga (ATP) melalui respirasi sel", "Mengawal pembahagian nukleus", "Menyimpan air dan garam mineral", "Membina dinding sel"],
      correctIndex: 0,
      explanation: "Mitokondrion ialah 'penjana tenaga' (powerhouse) sel yang menjalankan respirasi sel untuk menjana tenaga bagi aktiviti biokimia sel."
    },
    {
      question: "Vakuol yang besar dan matang dalam sel tumbuhan diisi dengan sejenis cecair penting yang dikenali sebagai apa?",
      options: ["Air suling tulen", "Sap sel", "Sitoplasma pekat", "Nukleoplasma"],
      correctIndex: 1,
      explanation: "Vakuol sel tumbuhan mengandungi sap sel yang terdiri daripada air, gula, asid organik dan garam mineral untuk mengekalkan kesegahan sel."
    },
    {
      question: "Struktur sel yang mengandungi kromosom (DNA) dan bertindak sebagai pusat kawalan seluruh aktiviti sel ialah...",
      options: ["Nukleus", "Membran Plasma", "Ribosom", "Retikulum Endoplasma"],
      correctIndex: 0,
      explanation: "Nukleus mengandungi maklumat genetik (DNA) dan mengawal sintesis protein serta seluruh aktiviti metabolisme sel."
    },
    {
      question: "Mengapakah sel haiwan mempunyai bentuk yang fleksibel / tidak tetap berbanding sel tumbuhan?",
      options: ["Kerana sel haiwan tiada nukleus", "Kerana sel haiwan ketiadaan kloroplas", "Kerana sel haiwan tidak mempunyai dinding sel", "Kerana membran sel haiwan sangat keras"],
      correctIndex: 2,
      explanation: "Sel haiwan hanya diliputi membran plasma fleksibel tanpa dinding sel selulosa tegar, menyebabkan bentuknya fleksibel dan boleh berubah mengikut fungsi."
    }
  ];

  // Dapatkan nama arah kardinal daripada darjah azimut (0..360)
  function getDirectionNameFromAzimuth(deg) {
    const norm = ((deg % 360) + 360) % 360;
    if (norm >= 337.5 || norm < 22.5) return 'Hadapan';
    if (norm >= 22.5 && norm < 67.5) return 'Kanan Hadapan';
    if (norm >= 67.5 && norm < 112.5) return 'Kanan';
    if (norm >= 112.5 && norm < 157.5) return 'Kanan Belakang';
    if (norm >= 157.5 && norm < 202.5) return 'Belakang';
    if (norm >= 202.5 && norm < 247.5) return 'Kiri Belakang';
    if (norm >= 247.5 && norm < 292.5) return 'Kiri';
    return 'Kiri Hadapan';
  }

  // Kira penempatan Peti Ganjaran AR di lokasi berasingan:
  // - Jarak sudut sekurang-kurangnya 35° (khususnya 67.5°) dari stesen terakhir selesai
  // - Tepat pada titik tengah antara dua stesen (selang 22.5° dari stesen terdekat) untuk elak pertindihan
  // - Ketinggian +6° (pitch rendah-sederhana) & jarak 4.8m untuk kedalaman 3D tersendiri
  function getRewardChestPlacement() {
    const lastStnNum = State.lastCompletedStationNumber || 8;
    const lastStn = AR_WORLD_STATIONS.find(s => s.stationNumber === lastStnNum) || AR_WORLD_STATIONS[7];
    const lastAz = typeof lastStn.azimuthDeg === 'number' ? lastStn.azimuthDeg : 315;
    const chestAz = ((lastAz + 67.5) % 360 + 360) % 360;
    const chestEl = -22; // Elevasi -22° (aras terendah, jauh di bawah semua 8 stesen)
    const chestRadius = 4.5;
    const dirName = getDirectionNameFromAzimuth(chestAz);
    return {
      azimuthDeg: chestAz,
      elevationDeg: chestEl,
      radius: chestRadius,
      directionName: dirName
    };
  }

  // Bina model 3D Peti Harta Karun ARSELNel di koordinat dunia (Fasa A.4: Reka Bentuk Kartun Ungu & Emas 3D)
  function buildTreasureChest3D() {
    if (arWorldState.treasureChestGroup) {
      return arWorldState.treasureChestGroup;
    }
    const group = new THREE.Group();
    group.name = 'ARWorld_TreasureChest';

    // Dimensi Peti Kartun Stylized: Lebar 1.40m, Ketinggian Badan Bawah 0.50m, Kedalaman 0.88m
    const chestW = 1.40;
    const chestH = 0.50;
    const chestD = 0.88;

    // 1. Material Kartun Ungu Diraja (Royal Purple Stylized Satin)
    const purpleMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,       // Ungu diraja cerah rujukan
      roughness: 0.38,
      metalness: 0.12
    });

    const darkPurpleMat = new THREE.MeshStandardMaterial({
      color: 0x5b21b6,
      roughness: 0.55,
      metalness: 0.08
    });

    // 2. Material Emas Kartun Cerah & Berkilat (Bright Stylized Cartoon Gold)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,       // Emas kuning pekat
      metalness: 0.82,
      roughness: 0.22
    });
    const brightGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,       // Emas highlight cerah
      metalness: 0.88,
      roughness: 0.18
    });

    // Badan Peti Bawah (Purple Box)
    const bodyGeo = new THREE.BoxGeometry(chestW, chestH, chestD);
    const body = new THREE.Mesh(bodyGeo, purpleMat);
    body.position.y = chestH / 2;
    group.add(body);

    // Panel recessed depan & belakang warna ungu gelap (aksen kartun 3D)
    const frontPanelGeo = new THREE.BoxGeometry(chestW - 0.24, chestH - 0.14, 0.02);
    const frontPanel = new THREE.Mesh(frontPanelGeo, darkPurpleMat);
    frontPanel.position.set(0, chestH / 2, chestD / 2 + 0.002);
    group.add(frontPanel);

    const backPanel = new THREE.Mesh(frontPanelGeo, darkPurpleMat);
    backPanel.position.set(0, chestH / 2, -chestD / 2 - 0.002);
    group.add(backPanel);

    // 4 Sudut Logam Keemasan Tebal Kartun (Vertical Corner Plates)
    const cornerW = 0.10;
    const cornerH = chestH + 0.02;
    const cornerD = 0.10;
    const cornerPositions = [
      [-chestW / 2 + cornerW / 2, chestH / 2, -chestD / 2 + cornerD / 2],
      [ chestW / 2 - cornerW / 2, chestH / 2, -chestD / 2 + cornerD / 2],
      [-chestW / 2 + cornerW / 2, chestH / 2,  chestD / 2 - cornerD / 2],
      [ chestW / 2 - cornerW / 2, chestH / 2,  chestD / 2 - cornerD / 2]
    ];
    cornerPositions.forEach(pos => {
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(cornerW, cornerH, cornerD), goldMat);
      cMesh.position.set(pos[0], pos[1], pos[2]);
      group.add(cMesh);

      // Rivet bulat kartun (Spherical Gold Studs)
      for (const ry of [0.10, 0.25, 0.40]) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), brightGoldMat);
        rivet.position.set(pos[0] * 1.02, ry, pos[2] * 1.02);
        group.add(rivet);
      }
    });

    // Jalur Logam Keemasan Bawah & Rim Atas Badan Peti
    const bottomTrim = new THREE.Mesh(new THREE.BoxGeometry(chestW + 0.04, 0.07, chestD + 0.04), goldMat);
    bottomTrim.position.y = 0.035;
    group.add(bottomTrim);

    const rimTrim = new THREE.Mesh(new THREE.BoxGeometry(chestW + 0.03, 0.06, chestD + 0.03), goldMat);
    rimTrim.position.y = chestH - 0.03;
    group.add(rimTrim);

    // 2. Bahagian Dalam Peti (Interior): Timbunan Emas & Syiling Kartun
    const interiorGroup = new THREE.Group();
    interiorGroup.position.set(0, chestH - 0.06, 0);

    const moundGeo = new THREE.CylinderGeometry(0.40, 0.62, 0.20, 18);
    const moundMesh = new THREE.Mesh(moundGeo, brightGoldMat);
    interiorGroup.add(moundMesh);

    // Syiling Emas Bertaburan
    const coinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.016, 12);
    for (let i = 0; i < 16; i++) {
      const coin = new THREE.Mesh(coinGeo, brightGoldMat);
      const angle = (i / 16) * Math.PI * 2;
      const dist = 0.14 + (i % 3) * 0.12;
      coin.position.set(Math.cos(angle) * dist, 0.11 + Math.random() * 0.03, Math.sin(angle) * dist);
      coin.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
      interiorGroup.add(coin);
    }

    // Kristal Pirus ARSELNel di dalam timbunan emas
    const cryMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.1,
      roughness: 0.15,
      metalness: 0.3
    });
    const cryOffsets = [[-0.20, 0.15, -0.06], [0.22, 0.16, 0.07], [0.03, 0.19, 0.16]];
    cryOffsets.forEach((co, idx) => {
      const cry = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), cryMat);
      cry.position.set(co[0], co[1], co[2]);
      cry.scale.set(0.85, 1.6, 0.85);
      cry.rotation.set((idx % 2 ? 0.3 : -0.2), idx * 0.9, 0.2);
      interiorGroup.add(cry);
    });

    // Rasuk Cahaya Emas / God Rays ke atas apabila peti dibuka
    const beamGeo = new THREE.CylinderGeometry(0.18, 0.85, 2.8, 18, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 1.35;
    interiorGroup.add(beamMesh);
    arWorldState.chestBeamMesh = beamMesh;

    group.add(interiorGroup);

    // 3. Penutup Peti Berengsel Melengkung Volumetrik (Volumetric Arched Hinged Lid)
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, chestH, -chestD / 2);

    const lidRadius = chestD / 2; // 0.44m

    // Kubah Melengkung Ungu (Arched Roof)
    const lidArchGeo = new THREE.CylinderGeometry(lidRadius, lidRadius, chestW, 36, 1, false, 0, Math.PI);
    const lidMesh = new THREE.Mesh(lidArchGeo, purpleMat);
    lidMesh.rotation.z = Math.PI / 2;
    lidMesh.rotation.y = Math.PI / 2;
    lidMesh.position.set(0, 0, lidRadius);
    lidPivot.add(lidMesh);

    // Penutup Sisi Melengkung Berdimensi Volumetrik (Tebal 4cm, bukan 2D flat CircleGeometry)
    const capThickness = 0.04;
    const capGeo = new THREE.CylinderGeometry(lidRadius, lidRadius, capThickness, 32, 1, false, 0, Math.PI);

    const capL = new THREE.Mesh(capGeo, purpleMat);
    capL.rotation.z = Math.PI / 2;
    capL.rotation.y = Math.PI / 2;
    capL.position.set(-chestW / 2 + capThickness / 2, 0, lidRadius);
    lidPivot.add(capL);

    const capR = new THREE.Mesh(capGeo, purpleMat);
    capR.rotation.z = Math.PI / 2;
    capR.rotation.y = Math.PI / 2;
    capR.position.set(chestW / 2 - capThickness / 2, 0, lidRadius);
    lidPivot.add(capR);

    // Rim Bawah Penutup Peti (Thick Golden Lid Rim)
    const lidRim = new THREE.Mesh(new THREE.BoxGeometry(chestW + 0.04, 0.06, chestD + 0.04), goldMat);
    lidRim.position.set(0, 0.03, lidRadius);
    lidPivot.add(lidRim);

    // 3 Jalur Logam Lengkung Keemasan di atas penutup melengkung (Thick Gold Arched Straps)
    [-chestW / 2 + 0.12, 0, chestW / 2 - 0.12].forEach(strapX => {
      const strapGeo = new THREE.CylinderGeometry(lidRadius + 0.014, lidRadius + 0.014, 0.09, 36, 1, false, 0, Math.PI);
      const strapMesh = new THREE.Mesh(strapGeo, goldMat);
      strapMesh.rotation.z = Math.PI / 2;
      strapMesh.rotation.y = Math.PI / 2;
      strapMesh.position.set(strapX, 0, lidRadius);
      lidPivot.add(strapMesh);

      // Rivet bulat kartun pada setiap jalur lengkung
      for (let a = 0.35; a <= 2.8; a += 0.55) {
        const sr = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), brightGoldMat);
        const rx = strapX;
        const ry = Math.sin(a) * (lidRadius + 0.024);
        const rz = lidRadius - Math.cos(a) * (lidRadius + 0.024);
        sr.position.set(rx, ry, rz);
        lidPivot.add(sr);
      }
    });

    // 4. Plat Kunci Keemasan di Hadapan (Chunky Cartoon Keyhole Plate with Keyhole & Cyan Gem)
    const claspGroup = new THREE.Group();
    claspGroup.position.set(0, 0.02, lidRadius * 2);

    const claspPlate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.07), goldMat);
    claspPlate.position.y = -0.05;
    claspGroup.add(claspPlate);

    const claspTrim = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.075), brightGoldMat);
    claspTrim.position.y = 0.06;
    claspGroup.add(claspTrim);

    const keyholeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), darkPurpleMat);
    keyholeTop.rotation.x = Math.PI / 2;
    keyholeTop.position.set(0, -0.04, 0.038);
    claspGroup.add(keyholeTop);

    const keyholeBottom = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.02), darkPurpleMat);
    keyholeBottom.position.set(0, -0.065, 0.038);
    claspGroup.add(keyholeBottom);

    const coreGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.065, 0),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.2
      })
    );
    coreGem.position.set(0, 0.04, 0.042);
    claspGroup.add(coreGem);

    const gemLight = new THREE.PointLight(0x06b6d4, 0.8, 1.8);
    gemLight.position.set(0, 0.04, 0.15);
    claspGroup.add(gemLight);

    lidPivot.add(claspGroup);
    group.add(lidPivot);
    arWorldState.chestLidPivot = lidPivot;

    // 5. Sumber Cahaya Emas di dalam Peti (Glow memancar apabila dibuka)
    const chestLight = new THREE.PointLight(0xfbbf24, 0.8, 5.0);
    chestLight.position.set(0, chestH + 0.2, 0);
    group.add(chestLight);
    arWorldState.chestLight = chestLight;

    // 6. Zarah Cahaya Bintang Emas & Pirus (Sparkles Terapung)
    const partGroup = new THREE.Group();
    const partMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.95 });
    const partGeo = new THREE.OctahedronGeometry(0.055, 0);
    arWorldState.chestParticles = [];
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(partGeo, partMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 1.1,
        chestH + 0.1 + Math.random() * 0.7,
        (Math.random() - 0.5) * 0.8
      );
      p.userData = {
        baseY: p.position.y,
        speed: 1.0 + Math.random() * 1.8,
        offset: Math.random() * Math.PI * 2
      };
      partGroup.add(p);
      arWorldState.chestParticles.push(p);
    }
    group.add(partGroup);

    // 7. Hologram Gelang Penanda Terapung di Lantai (Golden Rings)
    const chestHoloGroup = new THREE.Group();
    chestHoloGroup.position.y = 0.02;

    const ringGeo1 = new THREE.RingGeometry(0.95, 1.05, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthWrite: false
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    chestHoloGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(1.25, 1.35, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.65, depthWrite: false
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    chestHoloGroup.add(ring2);

    group.add(chestHoloGroup);

    // 8. Penanda Interaksi (Glowing Diamond Beacon di atas peti)
    const beacon = createBeaconMesh(0xf59e0b);
    beacon.scale.setScalar(0.85);
    beacon.position.set(0, 2.05, 0);
    group.add(beacon);

    // 9. Papan Nama 3D Peti Harta Karun Awal
    const initialTitle = State.treasureHuntChests[0]?.title || 'Peti Harta Karun 1';
    const labelGroup = buildStationLabel(`🎁 ${initialTitle}`, 'Misi Bonus 1/3 • Ketik Buka', '🎁', 0xf59e0b, 99);
    labelGroup.position.set(0, 1.45, 0);
    group.add(labelGroup);

    // 10. Sfera Collider Besar untuk Ketikan Skrin Sentuh (Radius 1.65m)
    const hitCollider = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 14, 14),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
    );
    hitCollider.position.set(0, 0.5, 0);
    hitCollider.userData = {
      pickable: true,
      isTreasureChest: true,
      id: 'treasure_chest'
    };
    group.add(hitCollider);

    group.userData = {
      stationConfig: arWorldState.treasureChestConfig,
      labelGroup,
      beacon,
      ring: ring1,
      hitCollider,
      isTreasureChest: true
    };

    group.visible = false;
    scene.add(group);
    arWorldState.treasureChestGroup = group;
    return group;
  }

  // Mulakan Misi Multi-Peti: Buka Peti 1 (Fasa A.4)
  function startTreasureHuntMission() {
    hideTreasureHuntIntroModal();
    State.treasureHuntUnlocked = true;
    State.treasureHuntActive = true;
    State.treasureHuntCompleted = false;
    arWorldState.isTreasureHuntActive = true;
    State.treasureHuntCurrentChestIndex = 0;
    State.treasureHuntCompletedCount = 0;

    spawnOrRelocateTreasureChest(0);
    SoundFX.powerUp();
    alertToast('🎁 TAHNIAH! Misi 8/8 Selesai! Cari Peti Harta Karun 1 menggunakan Smart Radar! (+100 Markah Bonus)');
    updateHUD();
  }

  // Alih atau Lahirkan Peti 3D di koordinat khusus peti berkenaan (Peti 1, 2, atau 3)
  function spawnOrRelocateTreasureChest(chestIdx) {
    if (!State.treasureHuntChests || chestIdx < 0 || chestIdx >= State.treasureHuntChests.length) return;
    State.treasureHuntCurrentChestIndex = chestIdx;
    const chestCfg = State.treasureHuntChests[chestIdx];

    // Kemas kini konfigurasi aktif Peti untuk radar & penjejakan spatial
    arWorldState.treasureChestConfig.azimuthDeg = chestCfg.azimuthDeg;
    arWorldState.treasureChestConfig.elevationDeg = chestCfg.elevationDeg;
    arWorldState.treasureChestConfig.radius = chestCfg.radius;
    arWorldState.treasureChestConfig.directionName = chestCfg.directionName;
    arWorldState.treasureChestConfig.slotNumber = chestCfg.slotNumber;
    arWorldState.treasureChestConfig.label = chestCfg.title;

    buildTreasureChest3D();
    const group = arWorldState.treasureChestGroup;
    if (!group) return;

    // Tutup semula penutup peti & tetapkan keamatan lampu
    arWorldState.isChestLidOpen = false;
    if (arWorldState.chestLidPivot) {
      arWorldState.chestLidPivot.rotation.x = 0;
    }
    if (arWorldState.chestBeamMesh) {
      arWorldState.chestBeamMesh.material.opacity = 0;
    }
    if (arWorldState.chestLight) {
      arWorldState.chestLight.intensity = 0.6;
    }

    // Kira posisi 3D di koordinat spatial
    const azRad = THREE.MathUtils.degToRad(chestCfg.azimuthDeg);
    const elRad = THREE.MathUtils.degToRad(chestCfg.elevationDeg);
    const R = chestCfg.radius || 5.0;
    const eyeY = arWorldState.postureMode === 'seated' ? 1.25 : 1.6;
    const horizR = Math.cos(elRad) * R;

    group.position.set(
      Math.sin(azRad) * horizR,
      eyeY + Math.sin(elRad) * R,
      -Math.cos(azRad) * horizR
    );
    group.lookAt(0, group.position.y, 0);

    // Kemas kini papan nama 3D (Label Billboard)
    if (group.userData && group.userData.labelGroup) {
      group.remove(group.userData.labelGroup);
      group.userData.labelGroup.traverse(child => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      });
    }
    const labelGroup = buildStationLabel(
      `🎁 ${chestCfg.title}`,
      `Misi Bonus ${chestCfg.slotNumber}/3 • Ketik Teroka`,
      '🎁',
      0xf59e0b,
      90 + chestCfg.slotNumber
    );
    labelGroup.position.set(0, 1.45, 0);
    group.add(labelGroup);
    group.userData.labelGroup = labelGroup;

    group.visible = true;

    // Arahkan Smart Radar kepada Peti (-1)
    selectRadarTargetStation(-1, false);

    if (DOM.arSingleInstructionText) {
      DOM.arSingleInstructionText.textContent = `🎯 Cari ${chestCfg.title} (${chestCfg.directionName}) menggunakan Smart Radar!`;
    }
    updateHUD();
  }

  // Buka Modal Cabaran 1 Soalan Bonus untuk Peti Harta Karun Semasa
  function openTreasureChestModal() {
    logARDiagnostic('MODAL', 'open_treasure_chest_modal', {
      currentChestIndex: State.treasureHuntCurrentChestIndex,
      completedCount: State.treasureHuntCompletedCount
    });

    if (State.treasureHuntCompleted) {
      showTreasureRewardModal();
      return;
    }

    const chestIdx = State.treasureHuntCurrentChestIndex || 0;
    const chest = State.treasureHuntChests[chestIdx];
    if (!chest) return;

    if (DOM.tcChestBadge) {
      DOM.tcChestBadge.textContent = `🎁 ${chest.title.toUpperCase()}`;
    }
    if (DOM.tcQuestionProgress) {
      DOM.tcQuestionProgress.textContent = `Soalan 1 / 1`;
    }
    if (DOM.tcVisualTitle) {
      DOM.tcVisualTitle.textContent = `Peti ${chest.slotNumber} / 3`;
    }

    renderTreasureBonusQuestion();

    if (DOM.treasureChestModal) {
      DOM.treasureChestModal.classList.add('open');
    }
    SoundFX.interact();
  }

  function closeTreasureChestModal() {
    logARDiagnostic('MODAL', 'close_treasure_modal', {});
    if (DOM.treasureChestModal) {
      DOM.treasureChestModal.classList.remove('open');
    }
    // Fasa A.4: Safari iPad auto-resume camera feed
    if ((State.mode === 'camera-ar' || State.mode === 'marker-ar') && DOM.cameraFeed) {
      if (DOM.cameraFeed.paused) {
        DOM.cameraFeed.play().catch(e => {
          logARDiagnostic('CAMERA', 'resume_on_treasure_modal_close_err', { error: String(e) });
        });
      }
    }
  }

  // Paparkan soalan bonus tunggal bagi peti semasa
  function renderTreasureBonusQuestion() {
    const chestIdx = State.treasureHuntCurrentChestIndex || 0;
    const chest = State.treasureHuntChests[chestIdx];
    if (!chest || !chest.question) return;
    const q = chest.question;

    if (DOM.tcQuizQuestion) {
      DOM.tcQuizQuestion.textContent = q.question;
    }
    if (DOM.tcQuizOptions) {
      DOM.tcQuizOptions.innerHTML = '';
      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tc-quiz-opt';
        btn.id = `tc-opt-${optIdx}`;
        btn.innerHTML = `<span style="font-weight:900; color:#facc15; margin-right:8px;">${String.fromCharCode(65 + optIdx)}.</span> <span>${optText}</span>`;
        btn.onclick = () => checkTreasureBonusAnswer(optIdx);
        DOM.tcQuizOptions.appendChild(btn);
      });
    }

    if (DOM.tcQuizFeedback) DOM.tcQuizFeedback.style.display = 'none';
    if (DOM.tcModalActions) DOM.tcModalActions.style.display = 'none';
  }

  // Semak jawapan soalan bonus bagi peti semasa
  function checkTreasureBonusAnswer(choiceIdx) {
    const chestIdx = State.treasureHuntCurrentChestIndex || 0;
    const chest = State.treasureHuntChests[chestIdx];
    if (!chest || !chest.question) return;
    const q = chest.question;

    const optButtons = DOM.tcQuizOptions ? DOM.tcQuizOptions.querySelectorAll('.tc-quiz-opt') : [];
    optButtons.forEach(btn => btn.disabled = true);

    const isCorrect = (choiceIdx === q.correct);
    const chosenBtn = optButtons[choiceIdx];

    if (isCorrect) {
      if (chosenBtn) chosenBtn.classList.add('correct');
      SoundFX.correct();

      // Animasi pembukaan penutup peti 3D dengan cahaya rasuk emas
      arWorldState.isChestLidOpen = true;
      if (arWorldState.chestLidPivot) {
        let p = 0;
        const openInt = setInterval(() => {
          p += 0.1;
          if (p >= 1) { p = 1; clearInterval(openInt); }
          if (arWorldState.chestLidPivot) arWorldState.chestLidPivot.rotation.x = -p * 1.25;
          if (arWorldState.chestLight) arWorldState.chestLight.intensity = 0.6 + p * 2.2;
          if (arWorldState.chestBeamMesh) arWorldState.chestBeamMesh.material.opacity = p * 0.45;
        }, 25);
      }

      // Berikan markah +100 SEKALI SAHAJA untuk peti ini
      if (!chest.completed) {
        chest.completed = true;
        State.score += (chest.points || 100);
        State.treasureHuntCompletedCount = Math.min(3, (State.treasureHuntCompletedCount || 0) + 1);
        updateHUD();
      }

      if (DOM.tcQuizFeedback) {
        DOM.tcQuizFeedback.className = 'cq-feedback-box correct';
        DOM.tcQuizFeedback.innerHTML = `
          <strong style="color:#34d399;">🎉 TAHNIAH! JAWAPAN TEPAT! (+${chest.points || 100} MATA BONUS)</strong>
          <p style="margin-top: 6px; font-size: 13px; color:#e2e8f0;">${q.explanation}</p>
        `;
        DOM.tcQuizFeedback.style.display = 'block';
      }

      if (DOM.tcModalActions) {
        DOM.tcModalActions.style.display = 'flex';
      }
      if (DOM.tcNextBtnText) {
        if (chestIdx < 2) {
          DOM.tcNextBtnText.textContent = `Tutup & Cari Peti Harta Karun ${chestIdx + 2} >`;
        } else {
          DOM.tcNextBtnText.textContent = 'Buka Ganjaran Akhir 🏆';
        }
      }
    } else {
      if (chosenBtn) chosenBtn.classList.add('incorrect');
      if (optButtons[q.correct]) {
        optButtons[q.correct].classList.add('correct');
      }
      SoundFX.incorrect();

      if (DOM.tcQuizFeedback) {
        DOM.tcQuizFeedback.className = 'cq-feedback-box incorrect';
        DOM.tcQuizFeedback.innerHTML = `
          <strong style="color:#f87171;">❌ KURANG TEPAT, SILA FAHAMI KONSEP INI:</strong>
          <p style="margin-top: 6px; font-size: 13px; color:#cbd5e1;">${q.explanation}</p>
          <div style="margin-top: 10px;">
            <button type="button" class="cq-btn-secondary" id="tc-retry-btn" style="padding: 6px 14px; font-size: 12.5px;">
              🔄 Cuba Semula Soalan
            </button>
          </div>
        `;
        DOM.tcQuizFeedback.style.display = 'block';

        const retryBtn = document.getElementById('tc-retry-btn');
        if (retryBtn) {
          retryBtn.onclick = () => renderTreasureBonusQuestion();
        }
      }
    }
  }

  // Butang 'Cari Peti Seterusnya' atau 'Ganjaran Akhir'
  function onTreasureNextButtonClicked() {
    closeTreasureChestModal();
    const currentIdx = State.treasureHuntCurrentChestIndex || 0;

    if (currentIdx < 2) {
      const nextIdx = currentIdx + 1;
      spawnOrRelocateTreasureChest(nextIdx);
      SoundFX.powerUp();
      alertToast(`🎉 Peti ${currentIdx + 1} Selesai! Peti Harta Karun ${nextIdx + 1} kini dikesan di arah ${State.treasureHuntChests[nextIdx].directionName}!`);
    } else {
      onAllTreasureChestsCompleted();
    }
  }

  // Berjaya menyelesaikan SEMUA 3 Peti Harta Karun
  async function onAllTreasureChestsCompleted() {
    closeTreasureChestModal();
    State.treasureHuntCompleted = true;
    SoundFX.victory();
    alertToast('🏆 SYABAS! Anda telah menyelesaikan SEMUA 3 Peti Harta Karun ARSELNel!');

    updateHUD();
    await saveLearningRecord();

    setTimeout(() => {
      showTreasureRewardModal();
    }, 1000);
  }

  // Tunjuk Modal 9: Ganjaran Akhir, Lencana Khas & Sijil
  function showTreasureRewardModal() {
    if (DOM.trFinalScore) {
      DOM.trFinalScore.textContent = `${State.score} Mata`;
    }
    if (DOM.trFinalTime) {
      DOM.trFinalTime.textContent = formatTime(State.durationSeconds);
    }
    if (DOM.treasureRewardModal) {
      DOM.treasureRewardModal.classList.add('open');
    }
    // Sembunyikan peti 3D daripada ruang AR selepas dituntut sepenuhnya
    if (arWorldState.treasureChestGroup) {
      arWorldState.treasureChestGroup.visible = false;
    }
    SoundFX.fanfare();
  }

  function hideTreasureRewardModal() {
    if (DOM.treasureRewardModal) {
      DOM.treasureRewardModal.classList.remove('open');
    }
  }

  // ==============================================================================
  // MODE SELECTION: MOD JELAJAH 3D, MOD KAMERA INTERAKTIF, MOD AR SPASIAL (WEBXR)
  // ==============================================================================

  // ==============================================================================
  // MODE SELECTION: MOD 1 (JELAJAH 3D), MOD 2 (KAMERA AR), MOD 3 (AR SPASIAL WEBXR)
  // ==============================================================================

  function openModeDialog() {
    DOM.modeModal.classList.add('open');
    if (DOM.arScaleChooser) {
      DOM.arScaleChooser.style.display = 'block';
    }
  }

  function closeModeDialog() {
    DOM.modeModal.classList.remove('open');
  }

  async function selectMode(mode) {
    closeModeDialog();
    closeScienceLabLobby();

    // Mulakan pemasa jika belum berjalan
    if (!State.timerInterval) {
      startTimer();
    }

    // 1. Cleanup existing active mode
    if (State.mode !== mode) {
      if (State.mode === 'camera-ar' || State.mode === 'marker-ar') {
        stopARWorldExploration();
        stopMarkerAR();
        stopInteractiveCamera();
      }
      if (State.mode === 'ar') {
        await exitARSession();
      }
    }

    State.mode = mode;

    if (mode === '3d') {
      // ----------------------------------------------------------------------
      // MOD 1: MOD JELAJAH 3D (MAKMAL MAYA PENUH TANPA KAMERA)
      // ----------------------------------------------------------------------
      stopARWorldExploration();
      stopMarkerAR();
      stopInteractiveCamera();
      document.body.classList.remove('cq-ar-mode');

      // Restore 3D lab environment & fog
      scene.background = new THREE.Color(0x0a161e);
      scene.fog = new THREE.FogExp2(0x0a161e, 0.025);
      renderer.setClearColor(0x0a161e, 1);
      renderer.xr.enabled = false;

      // Show full room & walkthrough stations, hide AR objects
      if (labEnvironmentGroup) labEnvironmentGroup.visible = true;
      if (walkthroughStationsGroup) walkthroughStationsGroup.visible = true;
      if (arObjectGroup) arObjectGroup.visible = false;

      // MOD A: Pastikan tiada model peti harta karun atau modal peti dipaparkan
      if (arWorldState && arWorldState.treasureChestGroup) {
        arWorldState.treasureChestGroup.visible = false;
      }
      State.treasureHuntActive = false;
      if (DOM.treasureHuntIntroModal) DOM.treasureHuntIntroModal.classList.remove('open');
      if (DOM.treasureChestModal) DOM.treasureChestModal.classList.remove('open');
      if (DOM.treasureRewardModal) DOM.treasureRewardModal.classList.remove('open');

      // Restore 3D walkthrough HUD items
      if (DOM.walkthroughHud) DOM.walkthroughHud.style.display = 'flex';
      if (DOM.badgeStrip) DOM.badgeStrip.style.display = 'flex';
      if (DOM.arOverlay) DOM.arOverlay.style.display = 'none';
      if (DOM.arStationsDrawer) DOM.arStationsDrawer.classList.remove('open');
      if (DOM.arOrganelleCard) DOM.arOrganelleCard.style.display = 'none';

      if (DOM.crosshair) DOM.crosshair.style.display = 'flex';
      if (DOM.touchZone) DOM.touchZone.style.display = 'block';
      if (DOM.virtualJoystick) DOM.virtualJoystick.style.display = 'block';

      if (DOM.hudModeIcon) DOM.hudModeIcon.textContent = '🖥️';
      if (DOM.hudModeText) DOM.hudModeText.textContent = 'Mod Jelajah 3D';
      if (DOM.gyroResetBtn) DOM.gyroResetBtn.style.display = 'inline-flex';

      // Fasa A.5: Mulakan orientasi 360° dan pastikan kamera menghadap mendatar (horizon level) pada permulaan
      initializeOrientation();
      if (!modAGyro.hasCalibrated) {
        player.pitch = 0;
        modAGyro.pitch = 0;
        modAGyro.yaw = 0;
      }

      // Restore player first-person camera
      camera.position.set(player.x, player.y, player.z);
      camera.rotation.set(
        player.pitch + (modAGyro.active ? modAGyro.pitch : 0),
        player.rotY + (modAGyro.active ? modAGyro.yaw : 0),
        0,
        'YXZ'
      );

      alertToast('🖥️ Mod Jelajah 3D Aktif: Terokai makmal menggunakan peranti 360°, kekunci atau joystick.');
    } else if (mode === 'camera-ar') {
      // ----------------------------------------------------------------------
      // MOD C: AR ORIENTASI DUNIA (8 STESEN BERASINGAN DI SEKELILING MURID)
      // ----------------------------------------------------------------------
      await startARWorldExploration();
    } else if (mode === 'marker-ar') {
      // ----------------------------------------------------------------------
      // MOD B: MARKER AR (8 KAD PENANDA 6DOF POSE TRACKING - IPAD SAFARI)
      // ----------------------------------------------------------------------
      await startMarkerAR();
    } else if (mode === 'ar') {
      // ----------------------------------------------------------------------
      // MOD A: SPATIAL AR (WEBXR IMMERSIVE-AR DENGAN HIT-TEST & ANCHOR)
      // ----------------------------------------------------------------------
      await startWebXRAR();
    }
  }

  // ------------------------------------------------------------------------------
  // 6.2 DIAGNOSTIK & WATCHDOG KESTABILAN KAMERA WEBAR (FASA A.4 HOTFIX)
  // Memantau 5 Status: Camera Track, Video Frame, WebGL Context, Clear Color & Overlay
  // ------------------------------------------------------------------------------
  window.__AR_DIAG_LOGS = [];
  let arCameraWatchdogActive = false;
  let arWatchdogFrameCount = 0;
  let lastCameraRestartTimestamp = 0;

  function logARDiagnostic(category, event, details = {}) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const logObj = {
      timestamp: now.toISOString(),
      timeStr,
      category,
      event,
      ...details
    };
    console.log(`[AR-DIAG ${timeStr}] [${category}] ${event}`, details);
    if (!window.__AR_DIAG_LOGS) window.__AR_DIAG_LOGS = [];
    window.__AR_DIAG_LOGS.push(logObj);
    if (window.__AR_DIAG_LOGS.length > 250) window.__AR_DIAG_LOGS.shift();
    return logObj;
  }

  function initARCameraWatchdog() {
    if (arCameraWatchdogActive) return;
    arCameraWatchdogActive = true;

    if (DOM.cameraFeed) {
      DOM.cameraFeed.addEventListener('pause', () => {
        logARDiagnostic('CAMERA', 'video_pause_detected', {
          mode: State.mode,
          readyState: DOM.cameraFeed.readyState,
          currentTime: DOM.cameraFeed.currentTime
        });
        // JANGAN panggil DOM.cameraFeed.play() secara synchronous di sini!
        // Safari iPadOS auto-pause video semasa modal menutupi skrin.
        // Kamera akan di-resume secara teratur sebaik sahaja modal ditutup (closeStationModal / closeTreasureChestModal).
      });

      DOM.cameraFeed.addEventListener('playing', () => {
        logARDiagnostic('CAMERA', 'video_playing_confirmed', {
          videoWidth: DOM.cameraFeed.videoWidth,
          videoHeight: DOM.cameraFeed.videoHeight
        });
      });

      DOM.cameraFeed.addEventListener('stalled', () => {
        logARDiagnostic('CAMERA', 'stream_stalled', { readyState: DOM.cameraFeed.readyState });
      });

      DOM.cameraFeed.addEventListener('waiting', () => {
        logARDiagnostic('CAMERA', 'stream_waiting', { readyState: DOM.cameraFeed.readyState });
      });

      DOM.cameraFeed.addEventListener('error', (e) => {
        logARDiagnostic('CAMERA', 'video_element_error', { error: String(e && e.message ? e.message : e) });
      });
    }

    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault(); // Benarkan pemulihan automatik WebGL context
        logARDiagnostic('WEBGL', 'context_lost', {
          mode: State.mode,
          completedStations: State.completedStations.size,
          score: State.score
        });
      });

      renderer.domElement.addEventListener('webglcontextrestored', () => {
        logARDiagnostic('WEBGL', 'context_restored', { mode: State.mode });
        // Pulihkan warna lut sinar dan null background untuk passthrough kamera
        if (State.mode === 'camera-ar' || State.mode === 'marker-ar') {
          if (scene) scene.background = null;
          if (renderer) renderer.setClearColor(0x000000, 0);
          if (DOM.cameraFeed && DOM.cameraFeed.paused) {
            DOM.cameraFeed.play().catch(() => {});
          }
        }
      });
    }

    window.addEventListener('pageshow', () => {
      logARDiagnostic('LIFECYCLE', 'pageshow', { mode: State.mode });
      if ((State.mode === 'camera-ar' || State.mode === 'marker-ar') && DOM.cameraFeed && cameraStream) {
        if (DOM.cameraFeed.paused) DOM.cameraFeed.play().catch(() => {});
      }
    });

    document.addEventListener('visibilitychange', () => {
      logARDiagnostic('LIFECYCLE', 'visibilitychange', { hidden: document.hidden, mode: State.mode });
      if (!document.hidden && (State.mode === 'camera-ar' || State.mode === 'marker-ar')) {
        if (DOM.cameraFeed && cameraStream && DOM.cameraFeed.paused) {
          DOM.cameraFeed.play().catch(() => {});
        }
      }
    });
  }

  function checkAndRecoverARCamera() {
    if (State.mode !== 'camera-ar' && State.mode !== 'marker-ar') return;
    if (!cameraStream || !DOM.cameraFeed) return;

    // Jangan paksa sambung playback video jika sebarang modal aktif dibuka di hadapan skrin
    // Ini mengelakkan lambakan ralat rejected play() pada WebKit Safari iPad sepanjang sesi menjawab soalan.
    const isModalOpen = (DOM.stationModal && DOM.stationModal.classList.contains('open')) ||
                        (DOM.treasureHuntIntroModal && DOM.treasureHuntIntroModal.classList.contains('open')) ||
                        (DOM.treasureChestModal && DOM.treasureChestModal.classList.contains('open'));
    if (isModalOpen) return;

    const track = cameraStream.getVideoTracks()[0];
    if (!track) return;

    // Status A: Camera track berakhir -> auto-recover semula strim kamera (debounced 4s)
    if (track.readyState === 'ended') {
      const now = Date.now();
      if (now - lastCameraRestartTimestamp > 4000) {
        lastCameraRestartTimestamp = now;
        logARDiagnostic('WATCHDOG', 'track_ended_auto_restart', {});
        startInteractiveCamera();
      }
      return;
    }

    // Status B: Camera track live tetapi video paused -> sambung semula playback
    if (DOM.cameraFeed.paused && track.readyState === 'live') {
      DOM.cameraFeed.play().catch(e => {
        logARDiagnostic('WATCHDOG', 'periodic_resume_error', { error: String(e) });
      });
    }

    // Status D: Pastikan latar belakang scene WebGL kekal lut sinar
    if (scene && scene.background !== null) {
      logARDiagnostic('WATCHDOG', 'resetting_non_null_background', {});
      scene.background = null;
    }
    if (renderer && renderer.getClearAlpha() !== 0) {
      logARDiagnostic('WATCHDOG', 'resetting_non_zero_clear_alpha', {});
      renderer.setClearColor(0x000000, 0);
    }
  }

  // ------------------------------------------------------------------------------
  // 6.2 PENYEDIAAN STRIM KAMERA SEBENAR (DIGUNAKAN OLEH MOD B & MOD C)
  // ------------------------------------------------------------------------------
  async function startInteractiveCamera(skipLegacyInit = false) {
    initARCameraWatchdog();
    logARDiagnostic('CAMERA', 'start_interactive_camera_invoked', { isSecure: window.isSecureContext });
    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      showCameraErrorModal('Sambungan Selamat Diperlukan (HTTPS)', 'Akses kamera pada iPad/telefon pintar memerlukan sambungan selamat (HTTPS) atau localhost.');
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraErrorModal('Kamera Tidak Disokong', 'Pelayar web ini tidak menyokong fungsi capaian kamera getUserMedia.');
      return false;
    }

    try {
      let stream = cameraStream;
      const hasLiveTrack = stream && stream.getVideoTracks().some(t => t.readyState === 'live');
      if (!hasLiveTrack) {
        try {
          // Prefer rear camera (environment) on iPad & mobile phones
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (camErr) {
          console.warn('Specific environment camera constraint failed, retrying with basic video constraint:', camErr);
          stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        }
      }

      cameraStream = stream;
      if (DOM.cameraFeed) {
        DOM.cameraFeed.srcObject = stream;
        DOM.cameraFeed.style.display = 'block';
        try {
          await DOM.cameraFeed.play();
        } catch (playErr) {
          console.warn('Camera feed play warning:', playErr);
        }
      }

      // Add cq-ar-mode class to body for background transparency
      document.body.classList.add('cq-ar-mode');

      // 1. Transparent WebGL background so camera feed is visible behind
      scene.background = null;
      scene.fog = null;
      renderer.setClearColor(0x000000, 0);

      // 2. Hide virtual 3D room walls, ceiling and floor so camera feed is completely unobstructed!
      if (labEnvironmentGroup) labEnvironmentGroup.visible = false;
      if (walkthroughStationsGroup) walkthroughStationsGroup.visible = false;

      // 3. Hide walkthrough HUD & controls
      if (DOM.walkthroughHud) DOM.walkthroughHud.style.display = 'none';
      if (DOM.badgeStrip) DOM.badgeStrip.style.display = 'none';
      if (DOM.crosshair) DOM.crosshair.style.display = 'none';
      if (DOM.touchZone) DOM.touchZone.style.display = 'none';
      if (DOM.virtualJoystick) DOM.virtualJoystick.style.display = 'none';
      if (DOM.promptContainer) DOM.promptContainer.classList.remove('active');
      if (DOM.mobileInteractBtn) DOM.mobileInteractBtn.classList.remove('visible');

      // 4. Show AR HUD Overlay & update elements
      if (DOM.arOverlay) DOM.arOverlay.style.display = 'flex';
      if (DOM.arSpatialTools) DOM.arSpatialTools.style.display = 'none';

      // Sync stats & drawer
      updateHUD();
      renderARStationsDrawer();

      if (!skipLegacyInit) {
        // Default kepada Mod C: Penerokaan 8 Stesen Berasingan di sekeliling pengguna
        if (arObjectGroup) arObjectGroup.visible = false;
      }

      if (DOM.hudModeIcon) DOM.hudModeIcon.textContent = '🧭';
      if (DOM.hudModeText) DOM.hudModeText.textContent = 'Mod AR Dunia';
      if (DOM.gyroResetBtn) DOM.gyroResetBtn.style.display = 'flex';
      return true;
    } catch (err) {
      console.warn('Camera AR initialization error:', err);
      let errMsg = 'Kebenaran capaian kamera ditolak oleh pelayar atau peranti tidak mempunyai kamera aktif.';
      if (err.name === 'NotAllowedError') {
        errMsg = 'Kebenaran kamera telah ditolak. Sila benarkan akses kamera dalam tetapan Safari / pelayar anda untuk mod ini.';
      } else if (err.name === 'NotFoundError') {
        errMsg = 'Tiada sensor kamera dikesan pada peranti ini.';
      } else if (err.name === 'NotReadableError') {
        errMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      showCameraErrorModal('Kebenaran Kamera Diperlukan', errMsg);
      return false;
    }
  }

  function stopInteractiveCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      cameraStream = null;
    }
    if (DOM.cameraFeed) {
      DOM.cameraFeed.srcObject = null;
      DOM.cameraFeed.style.display = 'none';
    }
    document.body.classList.remove('cq-ar-mode');
    gyroState.active = false;
  }

  function showCameraErrorModal(title, message) {
    if (DOM.cameraFallbackTitle) DOM.cameraFallbackTitle.textContent = title;
    if (DOM.cameraFallbackMsg) DOM.cameraFallbackMsg.textContent = message;
    if (DOM.cameraFallbackModal) DOM.cameraFallbackModal.classList.add('open');
  }

  // ==============================================================================
  // SENSOR ORIENTASI PERANTI (IPAD SAFARI PORTRAIT & LANDSCAPE QUATERNION)
  // ==============================================================================
  let deviceOrientationBound = false;
  let screenOrientationBound = false;

  function getScreenOrientationAngle() {
    if (typeof window.arSimulatedScreenOrientation === 'number') {
      return window.arSimulatedScreenOrientation;
    }
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number') {
      return window.screen.orientation.angle;
    }
    if (typeof window.orientation === 'number') {
      return window.orientation;
    }
    return 0;
  }

  // Kira kuaternion orientasi 3D kamera dunia daripada W3C DeviceOrientation (alpha, beta, gamma)
  // dengan pampasan penuh untuk orientasi skrin iPad (Portrait 0°, Landscape 90° / -90° / 270°, Upside-Down 180°)
  function computeDeviceWorldQuaternion(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
    const degToRad = THREE.MathUtils.degToRad;
    const alpha = degToRad(typeof alphaDeg === 'number' ? alphaDeg : 0);
    const beta  = degToRad(typeof betaDeg === 'number' ? betaDeg : 90);
    const gamma = degToRad(typeof gammaDeg === 'number' ? gammaDeg : 0);
    const orient = degToRad(typeof screenAngleDeg === 'number' ? screenAngleDeg : 0);

    const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
    const q = new THREE.Quaternion().setFromEuler(euler);
    // Laraskan daripada kerangka peranti ke ufuk dunia (-90° pada paksi X)
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    q.multiply(q1);
    // Pampasan putaran skrin (Portrait / Landscape)
    const q0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient);
    q.multiply(q0);
    return q;
  }

  // Ekstrak azimut ikut jam (0°..360°) dan elevasi dongak/tunduk (-60°..+60°) daripada kuaternion kamera
  function extractCameraAzimuthAndElevation( alphaDeg, betaDeg, gammaDeg ) {
    const screenAngle = getScreenOrientationAngle();
    arWorldState.screenOrientationAngle = screenAngle;
    const q = computeDeviceWorldQuaternion(alphaDeg, betaDeg, gammaDeg, screenAngle);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();

    const rawAzimuthDeg = ((THREE.MathUtils.radToDeg(Math.atan2(forward.x, -forward.z)) % 360) + 360) % 360;
    const rawElevationDeg = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, forward.y))));
    return {
      rawAzimuthDeg,
      rawElevationDeg: Math.max(-60, Math.min(60, rawElevationDeg)),
      quaternion: q
    };
  }

  // Kira perbezaan sudut terpendek dalam julat [-180°, +180°]
  function shortestAngleDeltaDeg(targetAngleDeg, currentAngleDeg) {
    return ((targetAngleDeg - currentAngleDeg + 540) % 360) - 180;
  }

  function onDeviceOrientationEvent(e) {
    if (e.alpha === null && e.beta === null) return;
    const alpha = typeof e.alpha === 'number' ? e.alpha : 0;
    const beta = typeof e.beta === 'number' ? e.beta : 90;
    const gamma = typeof e.gamma === 'number' ? e.gamma : 0;

    if (gyroState.initialAlpha === null) {
      gyroState.initialAlpha = alpha;
    }
    gyroState.alpha = alpha;
    gyroState.beta = beta;
    gyroState.gamma = gamma;
    gyroState.active = true;
    arWorldState.sensorReceived = true;
    arWorldState.isSimulationFallback = false;

    const { rawAzimuthDeg, rawElevationDeg } = extractCameraAzimuthAndElevation(alpha, beta, gamma);
    arWorldState.rawSensorAzimuthDeg = rawAzimuthDeg;
    arWorldState.rawSensorElevationDeg = rawElevationDeg;

    // Smoothing sudut tanpa lompatan 359° <-> 0° (wraparound-safe low-pass filter)
    if (arWorldState.smoothedSensorAzimuthDeg === null) {
      arWorldState.smoothedSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.smoothedSensorElevationDeg = rawElevationDeg;
    } else {
      const dAz = shortestAngleDeltaDeg(rawAzimuthDeg, arWorldState.smoothedSensorAzimuthDeg);
      arWorldState.smoothedSensorAzimuthDeg = ((arWorldState.smoothedSensorAzimuthDeg + dAz * 0.35) % 360 + 360) % 360;
      arWorldState.smoothedSensorElevationDeg = arWorldState.smoothedSensorElevationDeg + (rawElevationDeg - arWorldState.smoothedSensorElevationDeg) * 0.35;
    }

    if (arWorldState.active && arWorldState.subMode === 'orientation') {
      if (!arWorldState.hasCalibrated) {
        arWorldState.baseHeadingDeg = alpha;
        arWorldState.baseSensorAzimuthDeg = arWorldState.smoothedSensorAzimuthDeg;
        arWorldState.baseSensorElevationDeg = arWorldState.smoothedSensorElevationDeg;
        arWorldState.hasCalibrated = true;
      }
      updateARWorldCamera(alpha, beta, gamma);
    }
  }

  function onScreenOrientationChange() {
    arWorldState.screenOrientationAngle = getScreenOrientationAngle();
    if (arWorldState.active && arWorldState.subMode === 'orientation' && arWorldState.sensorReceived) {
      // Kemas kini bacaan kuaternion selepas pertukaran Portrait <-> Landscape
      const { rawAzimuthDeg, rawElevationDeg } = extractCameraAzimuthAndElevation(gyroState.alpha, gyroState.beta, gyroState.gamma);
      arWorldState.rawSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.rawSensorElevationDeg = rawElevationDeg;
      arWorldState.smoothedSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.smoothedSensorElevationDeg = rawElevationDeg;
      updateARWorldCamera(gyroState.alpha, gyroState.beta, gyroState.gamma);
    }
  }

  function setupDeviceOrientation() {
    if (!screenOrientationBound) {
      window.addEventListener('orientationchange', onScreenOrientationChange);
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.addEventListener === 'function') {
        window.screen.orientation.addEventListener('change', onScreenOrientationChange);
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && (State.mode === 'camera-ar' || State.mode === 'marker-ar')) {
          if (DOM.cameraFeed && DOM.cameraFeed.paused && cameraStream) {
            DOM.cameraFeed.play().catch(() => {});
          }
          if (arWorldState.active) {
            checkARWorldStationVisibility();
            updateARWorldCompass();
          }
        }
      });
      screenOrientationBound = true;
    }

    if (typeof DeviceOrientationEvent === 'undefined') {
      arWorldState.isSimulationFallback = true;
      return;
    }
    if (!deviceOrientationBound && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onDeviceOrientationEvent);
      deviceOrientationBound = true;
    }
  }

  function teardownDeviceOrientation() {
    if (deviceOrientationBound) {
      window.removeEventListener('deviceorientation', onDeviceOrientationEvent);
      deviceOrientationBound = false;
    }
    if (screenOrientationBound) {
      window.removeEventListener('orientationchange', onScreenOrientationChange);
      if (window.screen && window.screen.orientation && typeof window.screen.orientation.removeEventListener === 'function') {
        window.screen.orientation.removeEventListener('change', onScreenOrientationChange);
      }
      screenOrientationBound = false;
    }
    gyroState.active = false;
  }

  // Dialog Pengesahan Keluar ("← Kembali" — Bahagian 2)
  function openExitConfirmDialog(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    SoundFX.interact();
    if (DOM.exitConfirmModal) {
      DOM.exitConfirmModal.classList.add('open');
    }
  }

  function closeExitConfirmDialog(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    SoundFX.interact();
    if (DOM.exitConfirmModal) {
      DOM.exitConfirmModal.classList.remove('open');
    }
  }

  async function confirmExitToCellQuest(e, forceRedirect = false) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (DOM.exitConfirmModal) {
      DOM.exitConfirmModal.classList.remove('open');
    }

    // 1. Tutup sesi AR dengan kemas (WebXR, Mod B World AR, Mod C Marker AR)
    if (xrSession) {
      try { await xrSession.end(); } catch (_) {}
      xrSession = null;
    }
    stopARWorldExploration();
    stopMarkerAR();

    // 2. Hentikan semua camera stream tracks & sensor orientation listeners
    stopInteractiveCamera();
    teardownDeviceOrientation();
    if (State.timerInterval) {
      clearInterval(State.timerInterval);
      State.timerInterval = null;
    }

    // 3. Navigasi kembali ke Lobi Makmal Sains (atau redirect ke code.html jika diminta)
    if (forceRedirect) {
      const targetUrl = 'code.html';
      arWorldState.lastExitTargetUrl = targetUrl;
      if (!window.CellQuestAR || !window.CellQuestAR.preventRedirectInTest) {
        window.location.href = targetUrl;
      }
      return targetUrl;
    }

    openScienceLabLobby();
    arWorldState.lastExitTargetUrl = 'lobby';
    return 'lobby';
  }

  // Fasa 4E-E.1: Navigasi Kembali ke Kotak ARSELNEL dengan Pembersihan Lifecycle Penuh
  const KOTAK_ARSELNEL_RETURN_URL = '/kotak_arselnel/code.html';

  async function returnToKotakARSELNEL(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (DOM.exitConfirmModal) {
      DOM.exitConfirmModal.classList.remove('open');
    }

    // 1. Tutup sebarang sesi WebXR atau AR aktif
    if (xrSession) {
      try { await xrSession.end(); } catch (_) {}
      xrSession = null;
    }
    stopARWorldExploration();
    stopMarkerAR();
    stopInteractiveCamera();

    // 2. Nyahaktifkan semua listener sensor orientasi & gyroscope Mod A
    teardownDeviceOrientation();
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', onModADeviceOrientation);
      modAGyro.listenerBound = false;
      modAGyro.listenerCount = 0;
      modAGyro.active = false;
    }

    // 3. Hentikan pemasa dan gelung animasi WebGL Three.js dengan selamat
    if (State.timerInterval) {
      clearInterval(State.timerInterval);
      State.timerInterval = null;
    }
    if (renderer && typeof renderer.setAnimationLoop === 'function') {
      try {
        renderer.setAnimationLoop(null);
      } catch (_) {}
    }

    // 4. Simpan penanda kepulangan dalam sessionStorage
    try {
      sessionStorage.setItem('arselnel_returned_from_jelajah3d', 'true');
      sessionStorage.removeItem('arselnel_return_to_kotak');
    } catch (_) {}

    // 5. Navigasi kembali ke halaman Kotak ARSELNEL
    arWorldState.lastExitTargetUrl = KOTAK_ARSELNEL_RETURN_URL;
    if (!window.CellQuestAR || !window.CellQuestAR.preventRedirectInTest) {
      window.location.href = KOTAK_ARSELNEL_RETURN_URL;
    }
    return KOTAK_ARSELNEL_RETURN_URL;
  }

  function requestiOSOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      return DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            if (!deviceOrientationBound) {
              window.addEventListener('deviceorientation', onDeviceOrientationEvent);
              deviceOrientationBound = true;
            }
            alertToast('📡 Sensor orientasi iPad/iOS diaktifkan!');
            return true;
          } else {
            arWorldState.isSimulationFallback = true;
            updateARTrackingStatusBanner('warning', '⚠️ Kebenaran sensor ditolak. Mod Simulasi Manual aktif (seret skrin untuk memusing pandangan).');
            return false;
          }
        })
        .catch(() => {
          arWorldState.isSimulationFallback = true;
          return false;
        });
    }
    setupDeviceOrientation();
    return Promise.resolve(true);
  }

  function resetGyroOrientation() {
    calibrateARWorldHeading();
  }

  // ------------------------------------------------------------------------------
  // 6.1 MOD A: SPATIAL AR (WEBXR IMMERSIVE-AR DENGAN HIT-TEST & ANCHOR DUNIA)
  // ------------------------------------------------------------------------------
  async function startWebXRAR() {
    if (!navigator.xr || typeof navigator.xr.isSessionSupported !== 'function') {
      showARUnsupportedNotice('Pelayar ini (cth. iPad Safari) tidak menyokong WebXR immersive-ar. Membuka Mod C (AR Orientasi Dunia) sebagai alternatif.');
      await selectMode('camera-ar');
      return;
    }

    let isSupported = false;
    try {
      isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    } catch (_) {
      isSupported = false;
    }

    if (!isSupported) {
      showARUnsupportedNotice('Peranti ini tidak menyokong sesi WebXR immersive-ar. Beralih ke Mod C (AR Orientasi Dunia).');
      await selectMode('camera-ar');
      return;
    }

    try {
      const sessionInit = {
        requiredFeatures: ['local', 'hit-test'],
        optionalFeatures: ['anchors', 'dom-overlay']
      };
      if (DOM.arOverlay) {
        sessionInit.domOverlay = { root: DOM.arOverlay };
      }
      const session = await navigator.xr.requestSession('immersive-ar', sessionInit);

      xrSession = session;
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      xrRefSpace = await session.requestReferenceSpace('local');
      const viewerSpace = await session.requestReferenceSpace('viewer');
      xrHitTestSource = await session.requestHitTestSource({ space: viewerSpace });

      document.body.classList.add('cq-ar-mode');
      scene.background = null;
      scene.fog = null;
      renderer.setClearColor(0x000000, 0);

      // Hide 3D virtual room, walkthrough stations, and centered overlay
      if (labEnvironmentGroup) labEnvironmentGroup.visible = false;
      if (walkthroughStationsGroup) walkthroughStationsGroup.visible = false;
      if (arObjectGroup) arObjectGroup.visible = false;

      // Hide walkthrough HUD & controls
      if (DOM.walkthroughHud) DOM.walkthroughHud.style.display = 'none';
      if (DOM.badgeStrip) DOM.badgeStrip.style.display = 'none';
      if (DOM.crosshair) DOM.crosshair.style.display = 'none';
      if (DOM.touchZone) DOM.touchZone.style.display = 'none';
      if (DOM.virtualJoystick) DOM.virtualJoystick.style.display = 'none';

      // Show AR HUD overlay with spatial placement tools
      if (DOM.arOverlay) DOM.arOverlay.style.display = 'flex';
      if (DOM.arSpatialTools) DOM.arSpatialTools.style.display = 'flex';
      if (DOM.arPrintMarkersBtn) DOM.arPrintMarkersBtn.style.display = 'none';
      if (DOM.arStatusBadge) {
        if (DOM.arBadgeIcon) DOM.arBadgeIcon.textContent = '✨';
        if (DOM.arBadgeText) DOM.arBadgeText.textContent = 'Mod A: Spatial AR (WebXR)';
      }
      if (DOM.arHintBanner) {
        DOM.arHintBanner.innerHTML = '<span>✨ Halakan peranti ke lantai/meja dan tekan <strong>Letak 8 Stesen di Ruang Ini</strong> • Ketik organel untuk teroka</span>';
      }

      // Aktifkan 8 stesen world-locked untuk Mod A (Spatial AR)
      arWorldState.active = true;
      arWorldState.subMode = 'spatial';
      arState.isPlaced = false;
      buildARWorldStations();
      buildARWorldCompass();
      // Letakkan 8 stesen pada koordinat awal ruang XR (0, 0, -1.5) sehingga pengguna memilih titik permukaan hit-test
      positionARWorldStationsSpatial(new THREE.Vector3(0, -0.25, -1.4), 0);

      updateHUD();
      renderARStationsDrawer();
      setupARReticle();

      updateARTrackingStatusBanner('ok', '✨ Spatial AR (WebXR) Aktif: Gerakkan kamera perlahan untuk mengesan permukaan & letakkan 8 stesen.');

      session.addEventListener('end', () => {
        xrSession = null;
        xrHitTestSource = null;
        if (reticleMesh) reticleMesh.visible = false;
        selectMode('3d');
      });

      alertToast('✨ Mod A (Spatial AR WebXR) Aktif: 8 stesen ditempatkan di sekeliling ruang fizikal anda.');
    } catch (err) {
      console.warn('WebXR AR session request failed:', err);
      showARUnsupportedNotice('Sesi WebXR AR tidak dapat dimulakan. Beralih ke Mod C (AR Orientasi Dunia).');
      await selectMode('camera-ar');
    }
  }

  // Letakkan 8 stesen dalam koordinat dunia sebenar (Mod A Spatial WebXR)
  function positionARWorldStationsSpatial(centerPos, headingRad = 0) {
    arWorldState.spatialOrigin.copy(centerPos);
    const cosH = Math.cos(headingRad);
    const sinH = Math.sin(headingRad);

    arWorldState.stationGroups.forEach((group) => {
      const cfg = group.userData.stationConfig;
      const [ox, oy, oz] = cfg.spatialOffset || [0, 0, -1.4];
      const rx = ox * cosH - oz * sinH;
      const rz = ox * sinH + oz * cosH;

      group.position.set(centerPos.x + rx, centerPos.y + oy, centerPos.z + rz);
      group.scale.setScalar(0.38);
      group.visible = true;
      group.lookAt(centerPos.x, group.position.y, centerPos.z);
    });
  }

  function setupARReticle() {
    if (!reticleMesh) {
      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide });
      reticleMesh = new THREE.Mesh(ringGeo, ringMat);
      reticleMesh.rotation.x = -Math.PI / 2;
      reticleMesh.visible = false;
      scene.add(reticleMesh);
    }

    if (DOM.arPlaceBtn) {
      DOM.arPlaceBtn.textContent = '📍 Letak 8 Stesen AR di Ruang Ini';
      DOM.arPlaceBtn.onclick = () => {
        if (reticleMesh && reticleMesh.visible) {
          const pos = new THREE.Vector3();
          const quat = new THREE.Quaternion();
          const scl = new THREE.Vector3();
          reticleMesh.matrix.decompose(pos, quat, scl);

          const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
          positionARWorldStationsSpatial(pos, euler.y);
          arState.isPlaced = true;
          reticleMesh.visible = false;
          updateARTrackingStatusBanner('ok', '📍 8 Stesen Organel dikunci pada koordinat dunia ruang fizikal anda!');
          alertToast('📍 8 Stesen berjaya dikunci di sekeliling permukaan ruang ini!');
        } else {
          // Jika permukaan belum dikesan, letakkan relatif pada kedudukan semasa dalam world space
          const camPos = new THREE.Vector3();
          camera.getWorldPosition(camPos);
          positionARWorldStationsSpatial(new THREE.Vector3(camPos.x, camPos.y - 0.35, camPos.z), 0);
          arState.isPlaced = true;
          alertToast('📍 8 Stesen ditempatkan di sekeliling kedudukan semasa anda (World Space).');
        }
      };
    }
  }

  function showARUnsupportedNotice(reason) {
    alertToast(`⚠️ ${reason}`);
  }

  async function exitARSession() {
    if (xrSession) {
      try { await xrSession.end(); } catch (_) {}
      xrSession = null;
    }
    stopARWorldExploration();
    if (DOM.arOverlay) DOM.arOverlay.style.display = 'none';
    renderer.xr.enabled = false;
  }

  // ==============================================================================
  // 6.3 AR 3D MODEL SYSTEM: ANIMAL CELL, PLANT CELL & MAKMAL MINI ARSELNEL
  // ==============================================================================

  const CELL_MODELS = {
    animal: '../models/animal_cell_final.glb',
    plant: '../models/plantcellnew.glb'
  };

  const cachedGltfScenes = {
    animal: null,
    plant: null
  };

  // ==============================================================================
  // AR WORLD-LOCKED STATION BUILDER — Bina 8 stesen AR pada lokasi berasingan
  // ==============================================================================

  // Cipta sprite tanda soal '?' bercahaya ungu untuk Stage 1 (Stesen Jauh / Tersembunyi)
  function createMysteryQuestionMarkSprite() {
    const qCanvas = document.createElement('canvas');
    qCanvas.width = 128;
    qCanvas.height = 128;
    const qCtx = qCanvas.getContext('2d');
    qCtx.clearRect(0, 0, 128, 128);

    const grad = qCtx.createRadialGradient(64, 64, 12, 64, 64, 54);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.95)');
    grad.addColorStop(0.85, 'rgba(126, 34, 206, 0.90)');
    grad.addColorStop(1, 'rgba(88, 28, 135, 0.70)');

    qCtx.beginPath();
    qCtx.arc(64, 64, 52, 0, Math.PI * 2);
    qCtx.fillStyle = grad;
    qCtx.fill();
    qCtx.strokeStyle = '#f3e8ff';
    qCtx.lineWidth = 4.5;
    qCtx.stroke();

    qCtx.fillStyle = '#ffffff';
    qCtx.font = '900 64px "Nunito", Arial, sans-serif';
    qCtx.textAlign = 'center';
    qCtx.textBaseline = 'middle';
    qCtx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    qCtx.shadowBlur = 8;
    qCtx.fillText('?', 64, 66);

    const qTex = new THREE.CanvasTexture(qCanvas);
    const qMat = new THREE.SpriteMaterial({ map: qTex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(qMat);
    sprite.scale.set(0.68, 0.68, 1.0);
    return sprite;
  }

  // Cipta awan bayangan misteri geometri lembut untuk stesen tersembunyi
  function createMysteryCloudMesh() {
    const group = new THREE.Group();
    const geo1 = new THREE.DodecahedronGeometry(0.34, 1);
    const mat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    group.add(mesh1);

    const geo2 = new THREE.SphereGeometry(0.24, 12, 10);
    const mat2 = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    group.add(mesh2);

    return group;
  }

  function buildARWorldStations() {
    // Bersih stesen lama jika ada
    arWorldState.stationGroups.forEach(g => { if (g.parent) g.parent.remove(g); });
    arWorldState.stationGroups = [];

    AR_WORLD_STATIONS.forEach((stnConfig, idx) => {
      const stationGroup = new THREE.Group();
      stationGroup.name = `ARWorldStation_${idx}_${stnConfig.stationKey}`;

      // 1. Model 3D Organel terperinci (KSSM Tingkatan 1 + GLB Sel Haiwan/Tumbuhan)
      const organelleModel = buildOrganelleModel(stnConfig.stationKey, stnConfig.color);
      organelleModel.position.set(0, 0.12, 0);
      organelleModel.visible = false; // Tersembunyi pada Stage 1 sehingga murid mendekati
      stationGroup.add(organelleModel);

      // 2. Papan nama stesen 3 baris yang kemas (melayang di atas model pada paras rendah)
      const labelGroup = buildStationLabel(stnConfig.label, 'Ketik untuk Teroka', stnConfig.icon, stnConfig.color, stnConfig.stationNumber);
      labelGroup.position.set(0, 0.88, 0);
      labelGroup.visible = false; // Tersembunyi pada Stage 1
      stationGroup.add(labelGroup);

      // 3. Floating Scientific Hologram (Cincin nipis pada paras lantai/meja)
      const holoGroup = new THREE.Group();
      holoGroup.name = 'HologramBase';
      holoGroup.position.y = -0.32;

      // Cincin hologram luar (luar nipis cyan/sky)
      const outerRingGeo = new THREE.RingGeometry(0.66, 0.70, 48);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.rotation.x = -Math.PI / 2;
      holoGroup.add(outerRing);

      // Cincin hologram dalam (warna stesen)
      const innerRingGeo = new THREE.RingGeometry(0.44, 0.48, 48);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: stnConfig.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.70,
        depthWrite: false
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = -Math.PI / 2;
      holoGroup.add(innerRing);

      // Piring unjuran cahaya hologram pusat (sangat lembut & lut sinar)
      const centerDiscGeo = new THREE.RingGeometry(0.02, 0.26, 32);
      const centerDiscMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.20,
        depthWrite: false
      });
      const centerDisc = new THREE.Mesh(centerDiscGeo, centerDiscMat);
      centerDisc.rotation.x = -Math.PI / 2;
      holoGroup.add(centerDisc);

      stationGroup.add(holoGroup);

      // 3.1 Bayangan Misteri & Tanda Tanya '?' (Stage 1: Stesen Jauh / Tersembunyi)
      const mysteryGroup = new THREE.Group();
      mysteryGroup.name = 'MysteryGroup';
      const cloud = createMysteryCloudMesh();
      cloud.position.set(0, 0.12, 0);
      mysteryGroup.add(cloud);

      const qSprite = createMysteryQuestionMarkSprite();
      qSprite.position.set(0, 0.64, 0);
      mysteryGroup.add(qSprite);

      mysteryGroup.visible = true;
      stationGroup.add(mysteryGroup);

      // 4. Penanda Interaksi (Glowing Interactive Beacon di atas papan nama)
      const beacon = createBeaconMesh(stnConfig.color);
      beacon.scale.setScalar(0.55);
      beacon.position.set(0, 1.45, 0);
      stationGroup.add(beacon);

      // 5. Tiang cahaya hologram lembut (cone beam)
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.46, 1.6, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8, transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 0.35;
      stationGroup.add(beam);

      // 5.1 Zarah holografik halus terapung mengelilingi organel
      const holoParticles = [];
      const pGeo = new THREE.OctahedronGeometry(0.025, 0);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.75 });
      for (let pIdx = 0; pIdx < 4; pIdx++) {
        const pMesh = new THREE.Mesh(pGeo, pMat.clone());
        const angle = (pIdx / 4) * Math.PI * 2;
        pMesh.position.set(Math.cos(angle) * 0.40, -0.15 + (pIdx * 0.12), Math.sin(angle) * 0.40);
        pMesh.userData = { angle, baseRadius: 0.40, baseHeight: pMesh.position.y, speed: 0.8 + pIdx * 0.2 };
        stationGroup.add(pMesh);
        holoParticles.push(pMesh);
      }

      // 6. Sfera collider besar supaya mudah diketik pada skrin iPad/telefon
      const hitCollider = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
      );
      hitCollider.position.set(0, 0.25, 0);
      hitCollider.userData = {
        id: stnConfig.stationKey,
        stationNumber: stnConfig.stationNumber,
        slotNumber: stnConfig.slotNumber,
        pickable: true
      };
      stationGroup.add(hitCollider);

      // Simpan metadata
      stationGroup.userData = {
        stationConfig: stnConfig,
        stationIndex: idx,
        organelleModel,
        labelGroup,
        mysteryGroup,
        qSprite,
        cloud,
        beacon,
        ring: outerRing,
        outerRing,
        innerRing,
        centerDisc,
        holoGroup,
        holoParticles,
        beam,
        baseAngleDeg: stnConfig.angleDeg,
        radius: stnConfig.radius
      };

      // PENTING: Letakkan terus dalam scene (WORLD SPACE), BUKAN camera.add()!
      stationGroup.visible = false;
      scene.add(stationGroup);
      arWorldState.stationGroups.push(stationGroup);
    });
  }

  // Kira koordinat world-space untuk 8 stesen berdasarkan Azimut Relatif (360°),
  // Jarak Maya R (4.5m - 10.0m), dan Ketinggian Maya vHeight (0.3m - 3.2m):
  // Rendah: Sitoplasma (0.3m), Nukleus (0.5m), Dinding Sel (0.7m)
  // Sederhana: Vakuol (1.2m), Membran Sel (1.6m)
  // Tinggi: Mitokondrion (2.2m), Retikulum Endoplasma (3.0m), Kloroplas (3.2m)
  function positionARWorldStations() {
    const eyeY = arWorldState.postureMode === 'seated' ? 1.20 : 1.50;
    arWorldState.stationGroups.forEach((group, idx) => {
      const cfg = group.userData.stationConfig;
      const azDeg = typeof cfg.azimuthDeg === 'number' ? cfg.azimuthDeg : (cfg.angleDeg || 0);
      const R = cfg.radius || 4.5;
      const vHeight = typeof cfg.virtualHeight === 'number' ? cfg.virtualHeight : (cfg.height || 0.5);
      const deltaY = vHeight - eyeY;
      const elRad = Math.asin(Math.max(-0.95, Math.min(0.95, deltaY / R)));
      const elDeg = THREE.MathUtils.radToDeg(elRad);

      cfg.azimuthDeg = azDeg;
      cfg.angleDeg = azDeg;
      cfg.elevationDeg = elDeg;
      cfg.virtualHeight = vHeight;

      const azRad = THREE.MathUtils.degToRad(azDeg);
      const horizR = Math.sqrt(Math.max(0.1, R * R - deltaY * deltaY));
      const stationX = Math.sin(azRad) * horizR;
      const stationZ = -Math.cos(azRad) * horizR;
      const stationY = vHeight;

      group.position.set(stationX, stationY, stationZ);
      const isFocused = (arWorldState.focusedStationIdx === idx);
      group.scale.setScalar(isFocused ? arWorldState.focusedStationScale : 1.0);
      group.visible = true;

      // Model menghadap ke arah titik pemerhati di pusat dunia (0, stationY, 0)
      group.lookAt(0, stationY, 0);
    });

    // Kemas kini kedudukan Peti Harta Karun ARSELNel jika wujud
    if (arWorldState.treasureChestGroup) {
      const chestCfg = arWorldState.treasureChestConfig;
      const azRad = THREE.MathUtils.degToRad(chestCfg.azimuthDeg);
      const R = chestCfg.radius || 6.0;
      const vHeight = typeof chestCfg.virtualHeight === 'number' ? chestCfg.virtualHeight : 0.8;
      const deltaY = vHeight - eyeY;
      const elRad = Math.asin(Math.max(-0.95, Math.min(0.95, deltaY / R)));
      chestCfg.elevationDeg = THREE.MathUtils.radToDeg(elRad);
      const horizR = Math.sqrt(Math.max(0.1, R * R - deltaY * deltaY));
      const chestX = Math.sin(azRad) * horizR;
      const chestZ = -Math.cos(azRad) * horizR;
      const chestY = vHeight;
      arWorldState.treasureChestGroup.position.set(chestX, chestY, chestZ);
      arWorldState.treasureChestGroup.lookAt(0, chestY, 0);
    }
  }

  // Konfigurasi semula susun atur 8 stesen secara dinamik jika diperlukan selepas ujian
  function setARWorldStationsConfig(customList) {
    if (!Array.isArray(customList)) return AR_WORLD_STATIONS;
    customList.forEach((item, idx) => {
      const target = AR_WORLD_STATIONS.find(
        s => s.stationNumber === item.stationNumber || s.slotNumber === item.slotNumber || s.stationKey === item.stationKey
      ) || AR_WORLD_STATIONS[idx];
      if (!target) return;
      if (typeof item.azimuthDeg === 'number') {
        target.azimuthDeg = item.azimuthDeg;
        target.angleDeg = item.azimuthDeg;
      } else if (typeof item.angleDeg === 'number') {
        target.azimuthDeg = item.angleDeg;
        target.angleDeg = item.angleDeg;
      }
      if (typeof item.elevationDeg === 'number') target.elevationDeg = item.elevationDeg;
      if (typeof item.radius === 'number') target.radius = item.radius;
      if (typeof item.directionName === 'string') target.directionName = item.directionName;
      if (typeof item.label === 'string') target.label = item.label;
    });
    if (arWorldState.stationGroups.length === 8) {
      positionARWorldStations();
      checkARWorldStationVisibility();
      updateARWorldCompass();
    }
    return AR_WORLD_STATIONS;
  }

  // Bina model 3D pendidikan yang jelas & tepat untuk setiap stesen AR (menggunakan GLB berkualiti tinggi untuk Nukleus, Membran Sel, Mitokondrion, Retikulum Endoplasma, Sel Haiwan & Sel Tumbuhan)
  function buildOrganelleModel(organelleKey, color) {
    const group = new THREE.Group();
    group.userData = { id: organelleKey, organelleId: organelleKey, pickable: true };

    // 1. Stesen 8: Pameran Gabungan Retikulum Endoplasma + Perbandingan Sel Haiwan & Tumbuhan
    if (organelleKey === 'comparison' || organelleKey === 'er') {
      const compHolder = new THREE.Group();
      const detailed8 = buildStylizedOrganelle(8, color || 0xec4899);
      detailed8.scale.setScalar(1.35);
      compHolder.add(detailed8);
      group.add(compHolder);

      // Muatkan model GLB Retikulum Endoplasma di tengah-atas serta Sel Haiwan (kiri) & Sel Tumbuhan (kanan)
      const erSlot = new THREE.Group();
      erSlot.position.set(0, 0.26, 0.08);
      const animalSlot = new THREE.Group();
      animalSlot.position.set(-0.56, -0.18, 0);
      const plantSlot = new THREE.Group();
      plantSlot.position.set(0.56, -0.18, 0);

      mountGLBIntoContainer(erSlot, 'er', 'ar-world', {
        organelleId: 'comparison',
        stationId: 'stn-8-comparison',
        stationNumber: 8,
        customTargetSize: 0.92,
        alignOnTable: false
      }).then(ok => {
        if (ok) {
          compHolder.clear();
          compHolder.add(erSlot, animalSlot, plantSlot);
        }
      });
      mountGLBIntoContainer(animalSlot, 'animal', 'ar-world', {
        organelleId: 'comparison',
        stationId: 'stn-8-comparison',
        stationNumber: 8,
        customTargetSize: 0.78,
        alignOnTable: false
      });
      mountGLBIntoContainer(plantSlot, 'plant', 'ar-world', {
        organelleId: 'comparison',
        stationId: 'stn-8-comparison',
        stationNumber: 8,
        customTargetSize: 0.80,
        alignOnTable: false
      });
      return group;
    }

    // 2. Model Penuh Sel Haiwan & Sel Tumbuhan (GLB + fallback prosedur)
    if (organelleKey === 'animal') {
      const holder = new THREE.Group();
      buildProceduralAnimalCell(holder);
      holder.scale.setScalar(0.55);
      group.add(holder);
      mountGLBIntoContainer(group, 'animal', 'ar-world', {
        organelleId: 'animal',
        stationId: 'stn-8-comparison',
        stationNumber: 8,
        alignOnTable: false
      });
      return group;
    }

    if (organelleKey === 'plant') {
      const holder = new THREE.Group();
      buildProceduralPlantCell(holder);
      holder.scale.setScalar(0.55);
      group.add(holder);
      mountGLBIntoContainer(group, 'plant', 'ar-world', {
        organelleId: 'plant',
        stationId: 'stn-6-cellwall',
        stationNumber: 6,
        alignOnTable: false
      });
      return group;
    }

    // 3. Pemetaan organel kepada nombor stesen (buildStylizedOrganelle sebagai fallback segera)
    const keyToNum = {
      nucleus: 1,
      membrane: 2,
      cytoplasm: 3,
      mitochondria: 4,
      chloroplast: 5,
      wall: 6,
      vacuole: 7
    };

    const stnNum = keyToNum[organelleKey];
    if (stnNum) {
      const detailed = buildStylizedOrganelle(stnNum, color);
      detailed.scale.setScalar(1.20);
      detailed.traverse(n => {
        if (n.isMesh) {
          n.userData = { ...n.userData, id: organelleKey, organelleId: organelleKey, stationNumber: stnNum, pickable: true };
        }
      });
      group.add(detailed);

      // Naik taraf kepada model GLB untuk Nukleus (Stesen 1), Membran Sel (Stesen 2), dan Mitokondrion (Stesen 4)
      if (STATION_GLB_MAP[organelleKey]) {
        mountGLBIntoContainer(group, organelleKey, 'ar-world', {
          organelleId: organelleKey,
          stationId: STATION_GLB_MAP[organelleKey].stationId,
          stationNumber: stnNum,
          alignOnTable: false
        });
      }
      return group;
    }

    const fallbackMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 18, 14),
      new THREE.MeshStandardMaterial({ color: color || 0x2dd4bf, roughness: 0.3 })
    );
    fallbackMesh.userData = { id: organelleKey, organelleId: organelleKey, pickable: true };
    group.add(fallbackMesh);
    return group;
  }

  // Bina papan nama stesen 3D 3 baris yang kemas & tidak pernah terpotong (Bahagian 5)
  // Format:
  //   Baris 1: Stesen 8
  //   Baris 2: Retikulum Endoplasma
  //   Baris 3: Ketik untuk Teroka
  function buildStationLabel(titleText, subText, icon, color, stationNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');

    const isDone = State.completedStations.has(stationNumber);
    const borderHex = isDone ? '#10b981' : ('#' + (typeof color === 'number' ? color.toString(16).padStart(6, '0') : '2dd4bf'));

    // Latar belakang kaca gelap dengan padding mencukupi
    ctx.fillStyle = 'rgba(8, 15, 28, 0.92)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(8, 8, 544, 204, 26);
      ctx.fill();
    } else {
      ctx.fillRect(8, 8, 544, 204);
    }

    // Sempadan warna stesen
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 4.5;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(8, 8, 544, 204, 26);
      ctx.stroke();
    } else {
      ctx.strokeRect(8, 8, 544, 204);
    }

    // Ekstrak nama organel yang ringkas & bersih
    let cleanName = String(titleText || '')
      .replace(/^(Stesen\s*\d+\s*:\s*|Kad\s*#\d+\s*:\s*)/i, '')
      .replace(/Retikulum Endoplasma\s*&\s*Sel/i, 'Retikulum Endoplasma')
      .trim();
    if (!cleanName) cleanName = `Stesen ${stationNumber}`;

    const line1 = `${icon || '🧬'} Stesen ${stationNumber}${isDone ? ' ✓' : ''}`;
    const line2 = cleanName;
    const line3 = isDone ? '✓ Lencana Diperoleh • Ulang Kaji' : 'Ketik untuk Teroka';

    const maxAllowedWidth = canvas.width - 64; // Padding minimum 32px kiri & 32px kanan

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Baris 1: Nombor Stesen
    ctx.fillStyle = isDone ? '#34d399' : '#5eead4';
    ctx.font = '800 22px Nunito, Arial, sans-serif';
    ctx.fillText(line1, 280, 50);

    // Baris 2: Nama Organel (auto-fit font supaya tidak terpotong walau nama panjang)
    let font2Size = 33;
    ctx.font = `900 ${font2Size}px Nunito, Arial, sans-serif`;
    while (ctx.measureText(line2).width > maxAllowedWidth && font2Size > 18) {
      font2Size -= 1;
      ctx.font = `900 ${font2Size}px Nunito, Arial, sans-serif`;
    }
    const w2 = ctx.measureText(line2).width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line2, 280, 110);

    // Baris 3: Tindakan ("Ketik untuk Teroka")
    let font3Size = 20;
    ctx.font = `700 ${font3Size}px Nunito, Arial, sans-serif`;
    while (ctx.measureText(line3).width > maxAllowedWidth && font3Size > 14) {
      font3Size -= 1;
      ctx.font = `700 ${font3Size}px Nunito, Arial, sans-serif`;
    }
    const w3 = ctx.measureText(line3).width;
    ctx.fillStyle = isDone ? '#a7f3d0' : '#cbd5e1';
    ctx.fillText(line3, 280, 168);

    const maxMeasuredWidth = Math.max(w2, w3);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.62, 0.64),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    );
    labelMesh.userData = {
      isLabel: true,
      stationNumber,
      line1,
      line2,
      line3,
      fontSizePx: font2Size,
      maxTextWidthPx: Math.round(maxMeasuredWidth),
      canvasWidthPx: canvas.width,
      textFitsCanvas: maxMeasuredWidth <= (canvas.width - 48)
    };
    return labelMesh;
  }

  // Kalibrasi arah hadapan — tetapkan orientasi semasa peranti sebagai 0° Hadapan & 0° Elevasi
  // Tanpa memadam markah, masa, atau kemajuan lencana murid!
  function calibrateARWorldHeading() {
    if (arWorldState.sensorReceived && gyroState.active) {
      const { rawAzimuthDeg, rawElevationDeg } = extractCameraAzimuthAndElevation(
        gyroState.alpha,
        gyroState.beta,
        gyroState.gamma
      );
      arWorldState.baseHeadingDeg = gyroState.alpha;
      arWorldState.rawSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.rawSensorElevationDeg = rawElevationDeg;
      arWorldState.smoothedSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.smoothedSensorElevationDeg = rawElevationDeg;
      arWorldState.baseSensorAzimuthDeg = rawAzimuthDeg;
      arWorldState.baseSensorElevationDeg = rawElevationDeg;
    } else {
      arWorldState.baseHeadingDeg = 0;
      arWorldState.baseSensorAzimuthDeg = 0;
      arWorldState.baseSensorElevationDeg = 0;
    }
    arWorldState.manualYawDeg = 0;
    arWorldState.manualPitchDeg = 0;
    arWorldState.currentHeadingDeg = 0;
    arWorldState.currentPitchDeg = 0;
    arWorldState.hasCalibrated = true;
    arWorldState.focusedStationIdx = -1;
    arWorldState.focusedStationScale = 1.0;

    // Kekalkan semua 8 stesen pada koordinat dunia mengelilingi pengguna
    positionARWorldStations();

    // Tetapkan kedudukan kamera mengikut mod duduk/berdiri & pandang terus ke 0° (Hadapan, Elevasi 0°)
    const eyeY = arWorldState.postureMode === 'seated' ? 1.25 : 1.6;
    camera.position.set(0, eyeY, 0);
    camera.rotation.set(0, 0, 0, 'YXZ');

    checkARWorldStationVisibility();
    updateARWorldCompass();
    alertToast('🧭 Kalibrasi Semula Selesai! Arah semasa ditetapkan sebagai 0° Hadapan & 0° Elevasi.');
  }

  // Tukar Mod Duduk / Berdiri (Keselamatan & Keselesaan Murid)
  function toggleARPostureMode() {
    arWorldState.postureMode = (arWorldState.postureMode === 'seated') ? 'standing' : 'seated';
    const isSeated = (arWorldState.postureMode === 'seated');
    if (DOM.arPostureIcon) DOM.arPostureIcon.textContent = isSeated ? 'chair' : 'accessibility_new';
    if (DOM.arPostureText) DOM.arPostureText.textContent = isSeated ? 'Duduk' : 'Berdiri';

    if (arWorldState.active && arWorldState.subMode === 'orientation') {
      const eyeY = isSeated ? 1.25 : 1.6;
      camera.position.set(0, eyeY, 0);
      positionARWorldStations();
      checkARWorldStationVisibility();
      updateARWorldCompass();
    }
    alertToast(isSeated
      ? '🪑 Mod Duduk Aktif: Pusing kerusi atau seret skrin tanpa perlu berjalan.'
      : '🧍 Mod Berdiri Aktif: Pusing badan dengan selamat di tempat anda.');
  }

  // Kemas kini kamera berdasarkan orientasi peranti (terkompensasi orientasi skrin Portrait/Landscape) + offset manual
  function updateARWorldCamera(alphaDeg, betaDeg, gammaDeg) {
    if (!arWorldState.active || arWorldState.subMode !== 'orientation') return;

    let sensorHeadingCW = 0;
    let sensorPitchDeg = 0;

    if (arWorldState.sensorReceived) {
      const a = typeof alphaDeg === 'number' ? alphaDeg : gyroState.alpha;
      const b = typeof betaDeg === 'number' ? betaDeg : gyroState.beta;
      const g = typeof gammaDeg === 'number' ? gammaDeg : gyroState.gamma;

      const { rawAzimuthDeg, rawElevationDeg } = extractCameraAzimuthAndElevation(a, b, g);
      const activeAz = typeof arWorldState.smoothedSensorAzimuthDeg === 'number'
        ? arWorldState.smoothedSensorAzimuthDeg
        : rawAzimuthDeg;
      const activeEl = typeof arWorldState.smoothedSensorElevationDeg === 'number'
        ? arWorldState.smoothedSensorElevationDeg
        : rawElevationDeg;

      sensorHeadingCW = ((activeAz - arWorldState.baseSensorAzimuthDeg) % 360 + 360) % 360;
      sensorPitchDeg = Math.max(-50, Math.min(50, activeEl - arWorldState.baseSensorElevationDeg));
    }

    const totalHeadingDeg = ((sensorHeadingCW + arWorldState.manualYawDeg) % 360 + 360) % 360;
    arWorldState.currentHeadingDeg = totalHeadingDeg;

    // Dalam Three.js (YXZ): rotation.y = 0 pandang -Z (0° Hadapan).
    // rotation.y = -90° (-PI/2) pandang +X (90° Kanan).
    // rotation.y = +90° (+PI/2) pandang -X (270° Kiri).
    const yawRad = -THREE.MathUtils.degToRad(totalHeadingDeg);

    const totalPitchDeg = Math.max(-55, Math.min(55, sensorPitchDeg + (arWorldState.manualPitchDeg || 0)));
    arWorldState.currentPitchDeg = totalPitchDeg;
    const pitchRad = THREE.MathUtils.degToRad(totalPitchDeg);

    const eyeY = arWorldState.postureMode === 'seated' ? 1.25 : 1.6;
    camera.position.set(0, eyeY, 0);
    camera.rotation.set(pitchRad, yawRad, 0, 'YXZ');

    checkARWorldStationVisibility();
    updateARWorldCompass();
  }

  // Fungsi pembantu untuk menghalakan pandangan ke arah sudut azimut & elevasi tertentu
  // (Jika targetPitchDeg tidak dinyatakan, gunakan elevasi stesen pada azimut tersebut supaya stesen tepat di tengah skrin)
  function lookAtARHeading(targetHeadingDeg, targetPitchDeg) {
    if (!arWorldState.active) return;
    const calPrompt = document.getElementById('ar-world-calibration-ui');
    if (calPrompt) calPrompt.style.display = 'none';

    const normAz = ((targetHeadingDeg % 360) + 360) % 360;
    let resolvedPitch = targetPitchDeg;
    if (typeof resolvedPitch !== 'number') {
      const matchedStn = AR_WORLD_STATIONS.find(s => Math.abs(shortestAngleDeltaDeg(s.azimuthDeg, normAz)) <= 5);
      resolvedPitch = matchedStn ? (matchedStn.elevationDeg || 0) : 0;
    }

    let sensorHeadingCW = 0;
    let sensorPitchDeg = 0;
    if (arWorldState.sensorReceived) {
      const activeAz = typeof arWorldState.smoothedSensorAzimuthDeg === 'number'
        ? arWorldState.smoothedSensorAzimuthDeg
        : arWorldState.rawSensorAzimuthDeg;
      const activeEl = typeof arWorldState.smoothedSensorElevationDeg === 'number'
        ? arWorldState.smoothedSensorElevationDeg
        : arWorldState.rawSensorElevationDeg;
      sensorHeadingCW = ((activeAz - arWorldState.baseSensorAzimuthDeg) % 360 + 360) % 360;
      sensorPitchDeg = Math.max(-50, Math.min(50, activeEl - arWorldState.baseSensorElevationDeg));
    }

    arWorldState.manualYawDeg = normAz - sensorHeadingCW;
    arWorldState.manualPitchDeg = resolvedPitch - sensorPitchDeg;
    updateARWorldCamera(gyroState.alpha, gyroState.beta, gyroState.gamma);
  }

  // Sistem Penemuan Stesen (Bahagian 6) & Semakan Medan Pandangan Kamera — Fasa A.1 Multi-Stage Reveal
  // Stage 1: Jauh / Belum Ditemui -> Bayangan Misteri + Tanda Tanya '?'
  // Stage 2: Menghadap Arah Sasaran -> Model 3D Organel + Papan Nama muncul pada paras lantai/meja
  // Stage 3: Sasaran Aktif / Dekat -> Kad Penerokaan Kanan Bawah muncul bersama butang "Teroka >"
  function checkARWorldStationVisibility() {
    if (!arWorldState.active || !camera) return;
    const camPos = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    camera.getWorldDirection(camDir);

    const hTol = arWorldState.horizontalToleranceDeg || 14;
    const vTol = arWorldState.verticalToleranceDeg || 12;

    let closestInFOV = null;
    let closestAngle = arWorldState.fovThresholdDeg || 36;
    let closestIdx = -1;

    arWorldState.stationGroups.forEach((group, idx) => {
      const cfg = group.userData.stationConfig;
      const stationDir = new THREE.Vector3();
      stationDir.subVectors(group.position, camPos).normalize();

      const dotProduct = camDir.dot(stationDir);
      const angleDeg = THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, dotProduct))));

      const deltaAz = Math.abs(shortestAngleDeltaDeg(cfg.azimuthDeg, arWorldState.currentHeadingDeg));
      const deltaEl = Math.abs((cfg.elevationDeg || -15) - arWorldState.currentPitchDeg);

      const isWithinDiscovery = (deltaAz <= hTol && deltaEl <= vTol) || (angleDeg <= Math.hypot(hTol, vTol));
      const isVisibleInFrustum = (angleDeg <= 36) || isWithinDiscovery;

      arWorldState.stationVisibility[idx] = isVisibleInFrustum;
      group.visible = true;

      const isDiscovered = arWorldState.discoveredStations.has(cfg.stationNumber);
      const isDone = State.completedStations.has(cfg.stationNumber);
      const isTarget = (idx === arWorldState.targetStationIdx);

      // Multi-stage reveal:
      // Model dan papan nama didedahkan jika sudah ditemui, sudah siap, atau sedang disasarkan dalam toleransi FOV
      const shouldReveal = isDiscovered || isDone || isWithinDiscovery || (isTarget && deltaAz <= (hTol + 4));

      const organelle = group.userData.organelleModel;
      const label = group.userData.labelGroup;
      const mystery = group.userData.mysteryGroup;

      if (shouldReveal) {
        if (organelle) organelle.visible = true;
        if (label) label.visible = true;
        if (mystery) mystery.visible = false;
        if (isWithinDiscovery) {
          arWorldState.discoveredStations.add(cfg.stationNumber);
        }
      } else {
        if (organelle) organelle.visible = false;
        if (label) label.visible = false;
        if (mystery) mystery.visible = true;
      }

      if (angleDeg < closestAngle || (isWithinDiscovery && angleDeg <= closestAngle + 4)) {
        closestAngle = angleDeg;
        closestInFOV = group;
        closestIdx = idx;
      }
    });

    // Semak juga pengesanan Peti Harta Karun ARSELNel jika Misi Akhir aktif & belum dituntut
    if (State.treasureHuntActive && !State.treasureHuntCompleted && arWorldState.treasureChestGroup && arWorldState.treasureChestGroup.visible) {
      const chestGroup = arWorldState.treasureChestGroup;
      const chestCfg = arWorldState.treasureChestConfig;
      const chestDir = new THREE.Vector3();
      chestDir.subVectors(chestGroup.position, camPos).normalize();
      const chestDot = camDir.dot(chestDir);
      const chestAngleDeg = THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, chestDot))));
      const deltaAzChest = Math.abs(shortestAngleDeltaDeg(chestCfg.azimuthDeg, arWorldState.currentHeadingDeg));
      const deltaElChest = Math.abs((chestCfg.elevationDeg || -12) - arWorldState.currentPitchDeg);
      const isChestWithinDiscovery = (deltaAzChest <= hTol && deltaElChest <= vTol) || (chestAngleDeg <= Math.hypot(hTol, vTol));

      if (isChestWithinDiscovery) {
        closestAngle = chestAngleDeg;
        closestInFOV = chestGroup;
        closestIdx = -99;
      }
    }

    arWorldState.activeStation = (closestInFOV && closestIdx >= 0) ? closestInFOV.userData.stationConfig : (closestIdx === -99 ? arWorldState.treasureChestConfig : null);

    // Animasi highlight apabila stesen ditemui / dalam pandangan kamera
    arWorldState.stationGroups.forEach((group, idx) => {
      const inFOV = (idx === closestIdx);
      const isTarget = (idx === arWorldState.targetStationIdx);
      const outerRing = group.userData.outerRing || group.userData.ring;
      const innerRing = group.userData.innerRing;
      const beam = group.userData.beam;
      if (outerRing) {
        outerRing.material.opacity = inFOV ? 0.90 : (isTarget ? 0.75 : 0.45);
        outerRing.scale.setScalar(inFOV ? 1.20 : (isTarget ? 1.08 : 1.0));
      }
      if (innerRing) {
        innerRing.material.opacity = inFOV ? 0.95 : (isTarget ? 0.85 : 0.55);
        innerRing.scale.setScalar(inFOV ? 1.20 : (isTarget ? 1.08 : 1.0));
      }
      if (beam) beam.material.opacity = inFOV ? 0.28 : (isTarget ? 0.18 : 0.08);
    });

    // Tunjuk banner "Stesen <Nama> Ditemui!" atau "Peti Harta Karun Ditemui!"
    if (closestIdx !== arWorldState.lastDetectedIdx) {
      arWorldState.lastDetectedIdx = closestIdx;
      if (closestIdx === -99) {
        showARTreasureDetectedBanner();
      } else if (closestIdx >= 0 && closestInFOV) {
        const cfg = closestInFOV.userData.stationConfig;
        showARStationDetectedBanner(cfg);
      } else {
        hideARStationDetectedBanner();
      }
    }
  }

  // Paparkan notifikasi Peti Harta Karun Ditemui di penjuru kanan bawah
  function showARTreasureDetectedBanner() {
    if ((DOM.stationModal && DOM.stationModal.classList.contains('open')) ||
        (DOM.treasureChestModal && DOM.treasureChestModal.classList.contains('open')) ||
        (DOM.treasureRewardModal && DOM.treasureRewardModal.classList.contains('open'))) {
      hideARStationDetectedBanner();
      return;
    }
    let banner = document.getElementById('ar-world-detected-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'ar-world-detected-banner';
      document.body.appendChild(banner);
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(evt => {
        banner.addEventListener(evt, e => e.stopPropagation(), { passive: true });
      });
    }
    banner.style.borderColor = '#f59e0b';
    banner.style.display = 'flex';
    banner.style.opacity = '1';
    banner.style.pointerEvents = 'auto';
    banner.innerHTML = `
      <div class="cq-detected-info">
        <span class="cq-detected-kicker" style="color:#fde047;">🎁 Misi Akhir ARSELNel</span>
        <strong class="cq-detected-title">Peti Harta Karun Ditemui!</strong>
        <p class="cq-detected-desc">Buka peti harta karun untuk menuntut ganjaran dan sijil penyempurnaan Misi Jelajah Sel.</p>
      </div>
      <div class="cq-detected-actions">
        <button type="button" class="cq-detected-explore-btn" id="ar-treasure-open-btn" style="background:linear-gradient(135deg, #f59e0b, #ea580c);">Buka Peti &gt;</button>
        <button type="button" class="cq-detected-close-btn" id="ar-detected-close-btn" aria-label="Tutup notifikasi" title="Tutup">✕</button>
      </div>
    `;
    const openBtn = document.getElementById('ar-treasure-open-btn');
    if (openBtn) {
      openBtn.onclick = (e) => {
        e.stopPropagation();
        hideARStationDetectedBanner();
        openTreasureChestModal();
      };
    }
    const closeBtn = document.getElementById('ar-detected-close-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        hideARStationDetectedBanner();
      };
    }
    banner.onclick = (e) => {
      if (e.target.closest('#ar-detected-close-btn')) return;
      e.stopPropagation();
      hideARStationDetectedBanner();
      openTreasureChestModal();
    };
    arWorldState.detectedBanner = banner;
  }

  // Paparkan kad notifikasi ringkas "✓ Stesen Ditemui" di penjuru kanan bawah (Stage 3: Stesen Ditemui & Teroka)
  // Tanpa bertindih dengan Smart Radar (kiri bawah), model 3D (tengah), atau modal kuiz!
  function showARStationDetectedBanner(cfg) {
    if (!cfg) return;
    // Jangan paparkan jika kad organel atau modal kuiz sedang dibuka
    if ((DOM.arOrganelleCard && DOM.arOrganelleCard.style.display === 'block') ||
        (DOM.stationModal && DOM.stationModal.classList.contains('open'))) {
      hideARStationDetectedBanner();
      return;
    }

    let banner = document.getElementById('ar-world-detected-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'ar-world-detected-banner';
      document.body.appendChild(banner);
      ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(evt => {
        banner.addEventListener(evt, e => e.stopPropagation(), { passive: true });
      });
    }
    const hexColor = '#' + (typeof cfg.color === 'number' ? cfg.color.toString(16).padStart(6, '0') : '2dd4bf');
    const info = ORGANELLE_DATA[cfg.stationKey] || {};
    const descText = info.description || (State.stations && State.stations[cfg.stationNumber - 1]?.description) || 'Menjalankan aktiviti penting dan respirasi sel.';
    const distTier = cfg.distanceTier || (cfg.radius <= 3.0 ? 'Dekat' : cfg.radius <= 5.0 ? 'Sederhana' : 'Jauh');

    banner.style.borderColor = hexColor;
    banner.style.display = 'flex';
    banner.style.opacity = '1';
    banner.style.pointerEvents = 'auto';
    banner.innerHTML = `
      <div class="cq-detected-info">
        <span class="cq-detected-kicker" style="color:${hexColor};">📍 Stesen ${cfg.stationNumber} • ${cfg.directionName} (${distTier} ~${cfg.radius}m Maya)</span>
        <strong class="cq-detected-title">${cfg.icon || '🧬'} ${cfg.label}</strong>
        <p class="cq-detected-desc">${descText}</p>
      </div>
      <div class="cq-detected-actions">
        <button type="button" class="cq-detected-explore-btn" id="ar-detected-explore-btn" style="background:${hexColor};">Teroka &gt;</button>
        <button type="button" class="cq-detected-close-btn" id="ar-detected-close-btn" aria-label="Tutup notifikasi" title="Tutup">✕</button>
      </div>
    `;
    const exploreBtn = document.getElementById('ar-detected-explore-btn');
    if (exploreBtn) {
      exploreBtn.onclick = (e) => {
        e.stopPropagation();
        hideARStationDetectedBanner();
        selectAROrganelle(cfg.stationKey, cfg.stationNumber);
      };
    }
    const closeBtn = document.getElementById('ar-detected-close-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        hideARStationDetectedBanner();
      };
    }
    banner.onclick = (e) => {
      if (e.target.closest('#ar-detected-close-btn')) return;
      e.stopPropagation();
      hideARStationDetectedBanner();
      selectAROrganelle(cfg.stationKey, cfg.stationNumber);
    };
    arWorldState.detectedBanner = banner;
  }

  function hideARStationDetectedBanner() {
    const banner = document.getElementById('ar-world-detected-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.pointerEvents = 'none';
      banner.style.display = 'none';
    }
  }

  // Paparkan banner status tracking & arahan pemulihan yang jujur (hanya untuk amaran sensor / Mod B Marker AR)
  function updateARTrackingStatusBanner(level, message) {
    let el = document.getElementById('ar-world-tracking-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ar-world-tracking-banner';
      document.body.appendChild(el);
    }
    // Dalam Mod C (Orientasi), kita gunakan #ar-single-instruction tunggal supaya tiada pertindihan teks di bawah!
    if (!message || (arWorldState.active && arWorldState.subMode === 'orientation' && level === 'ok')) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    if (level === 'lost' || level === 'warning') {
      el.style.borderColor = '#f59e0b';
      el.style.color = '#fde047';
      el.style.background = 'rgba(28, 18, 8, 0.92)';
    } else {
      el.style.borderColor = 'rgba(45, 212, 191, 0.45)';
      el.style.color = '#cbd5e1';
      el.style.background = 'rgba(15, 23, 42, 0.85)';
    }
    el.innerHTML = message;
    arWorldState.trackingBannerEl = el;
  }

  // Pilih stesen sasaran pada Smart Radar ("AR Organel Hunter" — Bahagian 4 & 5)
  // idx = 0..7 untuk Stesen 1..8, idx = -1 untuk Peti Harta Karun ARSELNel
  function selectRadarTargetStation(idx, autoTurn = false) {
    if (idx === -1) {
      arWorldState.targetStationIdx = -1;
      const chestCfg = arWorldState.treasureChestConfig;
      if (autoTurn && arWorldState.active && arWorldState.subMode === 'orientation') {
        lookAtARHeading(chestCfg.azimuthDeg, chestCfg.elevationDeg);
      } else {
        checkARWorldStationVisibility();
        updateARWorldCompass();
      }
      renderSmartRadarStationList();
      SoundFX.interact();
      return chestCfg;
    }

    if (typeof idx !== 'number' || idx < 0 || idx >= AR_WORLD_STATIONS.length) return null;
    arWorldState.targetStationIdx = idx;
    const cfg = AR_WORLD_STATIONS[idx];
    if (autoTurn && arWorldState.active && arWorldState.subMode === 'orientation') {
      lookAtARHeading(cfg.azimuthDeg, cfg.elevationDeg);
    } else {
      checkARWorldStationVisibility();
      updateARWorldCompass();
    }
    renderSmartRadarStationList();
    SoundFX.interact();
    return cfg;
  }

  // Buka / tutup panel penuh Smart Radar (Bahagian 4: Expandable / Collapsible)
  function toggleSmartRadarPanel(forceExpand) {
    const nextState = typeof forceExpand === 'boolean'
      ? forceExpand
      : !arWorldState.radarPanelExpanded;
    arWorldState.radarPanelExpanded = nextState;

    const compactEl = document.getElementById('ar-smart-radar-compact');
    const panelEl = document.getElementById('ar-smart-radar-panel');
    if (compactEl) {
      compactEl.style.display = nextState ? 'none' : 'flex';
    }
    if (panelEl) {
      panelEl.classList.toggle('expanded', nextState);
      panelEl.classList.toggle('collapsed', !nextState);
      panelEl.style.display = nextState ? 'flex' : 'none';
    }
    SoundFX.interact();
    return nextState;
  }

  // Bina Smart Radar ("AR Organel Hunter") + Kad Sasaran Ringkas (Minimal) + Panel Terperinci (Expandable)
  function buildARWorldCompass() {
    if (!document.getElementById('ar-world-style')) {
      const style = document.createElement('style');
      style.id = 'ar-world-style';
      style.textContent = `
        #ar-world-compass-wrap {
          position: fixed;
          bottom: max(14px, env(safe-area-inset-bottom));
          left: max(14px, env(safe-area-inset-left));
          z-index: 30;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          pointer-events: auto;
          max-width: min(460px, calc(100vw - 28px));
          font-family: 'Nunito', Arial, sans-serif;
        }
        .cq-radar-dial-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(8, 15, 28, 0.90);
          border: 1.5px solid rgba(45, 212, 191, 0.55);
          border-radius: 18px;
          padding: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
        #ar-world-compass {
          width: 108px;
          height: 108px;
          border-radius: 50%;
          cursor: pointer;
          display: block;
          touch-action: manipulation;
        }
        .cq-elev-gauge {
          width: 22px;
          height: 102px;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 10px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 3px 0;
          font-size: 7.5px;
          font-weight: 800;
          color: #94a3b8;
          user-select: none;
        }
        .cq-elev-zero-line {
          position: absolute;
          top: 50%;
          left: 2px;
          right: 2px;
          height: 1px;
          background: rgba(148, 163, 184, 0.45);
        }
        .cq-elev-target-dot {
          position: absolute;
          left: 50%;
          width: 12px;
          height: 5px;
          border-radius: 3px;
          background: #facc15;
          box-shadow: 0 0 6px #facc15;
          transform: translate(-50%, -50%);
          transition: top 0.15s ease-out;
        }
        .cq-elev-cam-dot {
          position: absolute;
          left: 50%;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #38bdf8;
          border: 1.5px solid #fff;
          transform: translate(-50%, -50%);
          transition: top 0.12s ease-out;
        }
        /* PAPARAN LALAI (MINIMAL CARD — Bahagian 4) */
        #ar-smart-radar-compact {
          background: rgba(8, 15, 28, 0.90);
          border: 1.5px solid rgba(45, 212, 191, 0.5);
          border-radius: 16px;
          padding: 8px 11px;
          color: #f1f5f9;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          min-width: 152px;
          max-width: 196px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .cq-compact-target {
          font-size: 12.5px;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cq-compact-dirs {
          display: flex;
          flex-direction: column;
          gap: 1px;
          font-size: 11px;
          font-weight: 800;
        }
        .cq-compact-turn {
          color: #fde047;
          white-space: nowrap;
        }
        .cq-compact-elev {
          color: #38bdf8;
          white-space: nowrap;
        }
        .cq-compact-expand-btn {
          margin-top: 3px;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid rgba(45, 212, 191, 0.55);
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.9), rgba(16, 185, 129, 0.9));
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s ease;
        }
        .cq-compact-expand-btn:hover {
          filter: brightness(1.1);
        }
        /* PAPARAN TERPERINCI (EXPANDABLE / COLLAPSIBLE PANEL — Bahagian 4) */
        #ar-smart-radar-panel {
          background: rgba(8, 15, 28, 0.94);
          border: 1.5px solid rgba(45, 212, 191, 0.55);
          border-radius: 16px;
          padding: 9px 11px;
          color: #f1f5f9;
          box-shadow: 0 12px 32px rgba(0,0,0,0.65);
          backdrop-filter: blur(12px);
          min-width: 235px;
          max-width: 276px;
          display: none;
          flex-direction: column;
          gap: 5px;
        }
        .cq-radar-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          padding-bottom: 3px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .cq-radar-panel-kicker {
          font-size: 10.5px;
          font-weight: 900;
          color: #5eead4;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .cq-radar-collapse-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }
        .cq-radar-pills {
          display: flex;
          gap: 4px;
          flex-wrap: nowrap;
        }
        .cq-radar-stn-pill {
          flex: 1;
          min-width: 24px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(56, 189, 248, 0.18);
          color: #e2e8f0;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
          padding: 0;
          transition: all 0.15s;
        }
        .cq-radar-stn-pill.target {
          background: #facc15;
          color: #0f172a;
          border-color: #fef08a;
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.65);
        }
        .cq-radar-stn-pill.done {
          background: rgba(16, 185, 129, 0.28);
          color: #34d399;
          border-color: #10b981;
        }
        .cq-radar-target-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .cq-radar-target-name {
          font-size: 12.5px;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cq-radar-status-chip {
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 999px;
          background: rgba(250, 204, 21, 0.2);
          color: #fde047;
          border: 1px solid rgba(250, 204, 21, 0.45);
          white-space: nowrap;
        }
        .cq-radar-telemetry {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 8px;
          background: rgba(15, 23, 42, 0.75);
          padding: 5px 8px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 10px;
          line-height: 1.35;
        }
        .cq-radar-cmd {
          grid-column: 1 / -1;
          font-size: 11px;
          font-weight: 900;
          color: #fde047;
          display: flex;
          justify-content: space-between;
          gap: 6px;
          padding-top: 2px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .cq-radar-coach {
          font-size: 10.5px;
          font-weight: 700;
          color: #5eead4;
          line-height: 1.35;
        }
        .cq-radar-actions {
          display: flex;
          gap: 6px;
        }
        .cq-radar-act-btn {
          flex: 1;
          padding: 5px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #e2e8f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .cq-radar-act-btn.primary {
          background: linear-gradient(135deg, #0d9488, #10b981);
          color: #fff;
          border-color: #2dd4bf;
        }
        /* NOTIFIKASI STESEN DITEMUI (KANAN BAWAH — Stage 3) */
        #ar-world-detected-banner {
          position: fixed;
          bottom: max(14px, env(safe-area-inset-bottom));
          right: max(14px, env(safe-area-inset-right));
          z-index: 31;
          background: rgba(8, 15, 28, 0.94);
          border: 1.5px solid #2dd4bf;
          border-radius: 18px;
          padding: 10px 14px;
          font-family: 'Nunito', Arial, sans-serif;
          color: #fff;
          pointer-events: auto;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          display: none;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          max-width: min(340px, calc(100vw - 28px));
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .cq-detected-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 2px;
        }
        .cq-detected-kicker {
          font-size: 10px;
          font-weight: 900;
          color: #34d399;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .cq-detected-title {
          font-size: 13.5px;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cq-detected-desc {
          margin: 2px 0 0 0;
          font-size: 11px;
          line-height: 1.35;
          color: #cbd5e1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cq-detected-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .cq-detected-explore-btn {
          border: none;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 900;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          transition: transform 0.12s ease;
        }
        .cq-detected-explore-btn:active {
          transform: scale(0.96);
        }
        .cq-detected-close-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        #ar-world-tracking-banner {
          position: fixed;
          bottom: max(136px, calc(env(safe-area-inset-bottom) + 126px));
          left: 50%;
          transform: translateX(-50%);
          z-index: 29;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(45, 212, 191, 0.45);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11px;
          font-weight: 800;
          color: #e2e8f0;
          pointer-events: auto;
          text-align: center;
          max-width: 90vw;
          display: none;
        }
        @media (max-width: 900px) {
          #ar-world-compass { width: 96px; height: 96px; }
          .cq-elev-gauge { height: 90px; }
          #ar-smart-radar-compact { min-width: 140px; max-width: 178px; padding: 7px 9px; }
        }
        /* Telefon Portrait (390x844): Susun menegak tanpa bertindih & jadikan panel penuh bottom-sheet */
        @media (max-width: 640px) {
          #ar-world-compass { width: 84px; height: 84px; }
          .cq-elev-gauge { height: 78px; width: 20px; }
          #ar-smart-radar-compact { min-width: 135px; max-width: calc(100vw - 148px); padding: 6px 9px; }
          #ar-smart-radar-panel.expanded {
            position: fixed;
            left: 10px;
            right: 10px;
            bottom: max(116px, calc(env(safe-area-inset-bottom) + 108px));
            max-width: calc(100vw - 20px);
            z-index: 36;
          }
          #ar-world-detected-banner {
            bottom: max(118px, calc(env(safe-area-inset-bottom) + 110px));
            right: 10px;
            left: 10px;
            max-width: calc(100vw - 20px);
          }
        }
        /* Telefon Landscape (844x390): Padatkan tinggi radar supaya ruang tengah kamera luas */
        @media (max-height: 480px) and (orientation: landscape) {
          #ar-world-compass-wrap {
            bottom: max(8px, env(safe-area-inset-bottom));
            left: max(10px, env(safe-area-inset-left));
          }
          #ar-world-compass { width: 78px; height: 78px; }
          .cq-elev-gauge { height: 74px; width: 19px; }
          #ar-smart-radar-compact { padding: 5px 8px; min-width: 132px; }
          .cq-compact-target { font-size: 11.5px; }
          .cq-compact-dirs { font-size: 10px; }
          .cq-compact-expand-btn { padding: 4px 8px; font-size: 10px; }
          #ar-world-detected-banner {
            bottom: max(8px, env(safe-area-inset-bottom));
            right: max(10px, env(safe-area-inset-right));
            padding: 6px 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let wrap = document.getElementById('ar-world-compass-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'ar-world-compass-wrap';
      wrap.innerHTML = `
        <div class="cq-radar-dial-box">
          <canvas id="ar-world-compass" width="160" height="160" title="Smart Radar Organel: Ketik titik stesen (1-8) untuk memilih sasaran navigasi"></canvas>
          <div class="cq-elev-gauge" id="ar-elevation-gauge" title="Penunjuk Elevasi Kamera vs Sasaran (Darjah)">
            <span>+30°</span>
            <div class="cq-elev-zero-line"></div>
            <div class="cq-elev-target-dot" id="ar-elev-target-dot" title="Elevasi Sasaran"></div>
            <div class="cq-elev-cam-dot" id="ar-elev-cam-dot" title="Elevasi Kamera Semasa"></div>
            <span>-30°</span>
          </div>
        </div>
        <!-- PAPARAN LALAI (MINIMAL CARD — Bahagian 4) -->
        <div id="ar-smart-radar-compact">
          <div class="cq-compact-target" id="ar-compact-target-name">🎯 Nukleus</div>
          <div class="cq-compact-dirs">
            <span class="cq-compact-turn" id="ar-compact-turn-cmd">↷ Kanan 90°</span>
            <span class="cq-compact-elev" id="ar-compact-elev-cmd">Aras tepat</span>
          </div>
          <button type="button" class="cq-compact-expand-btn" id="ar-radar-expand-btn" title="Buka senarai 8 stesen & maklumat penuh radar">
            Cari Stesen
          </button>
        </div>
        <!-- PAPARAN TERPERINCI (BOLEH DIKEMBANGKAN & DITUTUP SEMULA — Bahagian 4) -->
        <div id="ar-smart-radar-panel" class="collapsed">
          <div class="cq-radar-panel-header">
            <span class="cq-radar-panel-kicker">🧭 Smart Radar (Stesen 1–8)</span>
            <button type="button" class="cq-radar-collapse-btn" id="ar-radar-collapse-btn" title="Tutup panel penuh">✕ Tutup</button>
          </div>
          <div class="cq-radar-pills" id="ar-radar-pills"></div>
          <div class="cq-radar-target-row">
            <span class="cq-radar-target-name" id="ar-radar-target-title">🎯 Stesen 1: Nukleus</span>
            <span class="cq-radar-status-chip" id="ar-radar-status-chip">Sedang Dicari</span>
          </div>
          <div class="cq-radar-telemetry">
            <div id="ar-radar-az-target">Sasaran: <strong>90°</strong> (Kanan)</div>
            <div id="ar-radar-az-cam">Kamera: <strong>0°</strong></div>
            <div id="ar-radar-el-target">Elevasi: <strong>0°</strong></div>
            <div id="ar-radar-el-cam">Dongak: <strong>0°</strong></div>
            <div class="cq-radar-cmd">
              <span id="ar-radar-turn-cmd">↪ Pusing kanan 90°</span>
              <span id="ar-radar-elev-cmd">✓ Aras tepat</span>
            </div>
          </div>
          <div class="cq-radar-coach" id="ar-radar-coach-msg">Pilih mana-mana stesen untuk memulakan navigasi Smart Radar.</div>
          <div class="cq-radar-stations-list" id="ar-radar-station-list"></div>
          <div class="cq-radar-actions">
            <button type="button" class="cq-radar-act-btn primary" id="ar-radar-recalibrate-btn" title="Tetapkan arah semasa sebagai 0° Hadapan & 0° Elevasi">
              🧭 Kalibrasi
            </button>
            <button type="button" class="cq-radar-act-btn" id="ar-radar-look-btn" title="Halakan pandangan ke stesen sasaran (Mod Duduk)">
              🎯 Pandang Sasaran
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);

      ['pointerdown', 'pointerup', 'touchstart', 'touchend'].forEach(evt => {
        wrap.addEventListener(evt, e => e.stopPropagation(), { passive: true });
      });

      const compass = document.getElementById('ar-world-compass');
      compass.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!arWorldState.active) return;
        const rect = compass.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 160;
        const y = ((e.clientY - rect.top) / rect.height) * 160;
        const cx = 80, cy = 80, r = 68;
        const headingRad = THREE.MathUtils.degToRad(arWorldState.currentHeadingDeg || 0);

        // Cari titik stesen yang paling hampir dengan ketikan jari murid pada radar
        let clickedIdx = -1;
        let minDist = 22;
        AR_WORLD_STATIONS.forEach((cfg, idx) => {
          const stationAngleRad = THREE.MathUtils.degToRad(cfg.azimuthDeg);
          const relAngle = stationAngleRad - headingRad;
          const dotR = r - 15;
          const dotX = cx + Math.sin(relAngle) * dotR;
          const dotY = cy - Math.cos(relAngle) * dotR;
          const d = Math.hypot(x - dotX, y - dotY);
          if (d < minDist) {
            minDist = d;
            clickedIdx = idx;
          }
        });

        if (clickedIdx >= 0) {
          selectRadarTargetStation(clickedIdx, false);
        } else {
          // Ketik bahagian tengah radar untuk buka/tutup panel penuh
          toggleSmartRadarPanel();
        }
      });

      const expandBtn = document.getElementById('ar-radar-expand-btn');
      if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSmartRadarPanel(true);
        });
      }

      const collapseBtn = document.getElementById('ar-radar-collapse-btn');
      if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSmartRadarPanel(false);
        });
      }

      const recalBtn = document.getElementById('ar-radar-recalibrate-btn');
      if (recalBtn) {
        recalBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          calibrateARWorldHeading();
        });
      }

      const lookBtn = document.getElementById('ar-radar-look-btn');
      if (lookBtn) {
        lookBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tIdx = arWorldState.targetStationIdx;
          const cfg = AR_WORLD_STATIONS[tIdx] || AR_WORLD_STATIONS[0];
          lookAtARHeading(cfg.azimuthDeg, cfg.elevationDeg);
        });
      }
    }

    // Bina butang pil nombor stesen 1..8 pada panel Smart Radar
    const pillsHost = document.getElementById('ar-radar-pills');
    if (pillsHost && pillsHost.children.length !== AR_WORLD_STATIONS.length) {
      pillsHost.innerHTML = '';
      AR_WORLD_STATIONS.forEach((cfg, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cq-radar-stn-pill';
        btn.id = `ar-radar-pill-${cfg.stationNumber}`;
        btn.textContent = String(cfg.stationNumber);
        btn.title = `Cari Stesen ${cfg.stationNumber}: ${cfg.label}`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectRadarTargetStation(idx, false);
        });
        pillsHost.appendChild(btn);
      });
    }

    renderSmartRadarStationList();

    wrap.style.display = 'flex';
    arWorldState.compassEl = document.getElementById('ar-world-compass');
    arWorldState.smartRadarPanelEl = document.getElementById('ar-smart-radar-panel');
    // Pastikan permulaan dalam keadaan ringkas (compact)
    toggleSmartRadarPanel(Boolean(arWorldState.radarPanelExpanded));
  }

  // Bina / kemas kini senarai 8 stesen + Peti ARSELNel dalam panel Smart Radar yang boleh dikembangkan
  function renderSmartRadarStationList() {
    const listHost = document.getElementById('ar-radar-station-list');
    if (!listHost) return;
    listHost.innerHTML = '';

    // Jika Treasure Hunt sedang aktif & belum dituntut, letakkan Peti ARSELNel di bahagian atas senarai sasaran!
    if (State.treasureHuntActive && !State.treasureHuntCompleted) {
      const chestCfg = arWorldState.treasureChestConfig;
      const sgn = (chestCfg.elevationDeg >= 0) ? '+' : '';
      const chestItem = document.createElement('div');
      const isChestTarget = (arWorldState.targetStationIdx === -1);
      chestItem.className = `cq-radar-list-item${isChestTarget ? ' active' : ''}`;
      chestItem.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
          <span style="font-size:14px;">🎁</span>
          <span style="font-weight:900; font-size:11px; color:#fde047; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
            Peti ARSELNel (${Math.round(chestCfg.azimuthDeg)}°, ${sgn}${Math.round(chestCfg.elevationDeg)}°)
          </span>
        </div>
        <span class="cq-stn-badge ${State.treasureHuntCompleted ? 'done' : 'discovered'}">
          ${State.treasureHuntCompleted ? 'Selesai ✓' : 'Misi Akhir 🎁'}
        </span>
      `;
      chestItem.onclick = (e) => {
        e.stopPropagation();
        selectRadarTargetStation(-1, false);
      };
      listHost.appendChild(chestItem);
    }

    AR_WORLD_STATIONS.forEach((cfg, idx) => {
      const isTarget = (idx === arWorldState.targetStationIdx);
      const isDone = State.completedStations.has(cfg.stationNumber);
      const isDiscovered = arWorldState.discoveredStations.has(cfg.stationNumber);
      const hTier = cfg.heightTier || (cfg.virtualHeight <= 0.8 ? 'Rendah' : cfg.virtualHeight <= 1.8 ? 'Sederhana' : 'Tinggi');

      let badgeHtml = '<span class="cq-stn-badge pending">Belum Ditemui</span>';
      if (isDone) {
        badgeHtml = '<span class="cq-stn-badge done">Selesai ✓</span>';
      } else if (isDiscovered) {
        badgeHtml = '<span class="cq-stn-badge discovered">Ditemui ✨</span>';
      }

      const item = document.createElement('div');
      item.className = `cq-radar-list-item${isTarget ? ' active' : ''}`;
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
          <span style="font-size:13px;">${cfg.icon || '🧬'}</span>
          <span style="font-weight:800; font-size:11px; color:#fff; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
            Stesen ${cfg.stationNumber}: ${cfg.label} <small style="color:#5eead4;font-size:9.5px;">(${cfg.distanceTier} • ${hTier})</small>
          </span>
        </div>
        ${badgeHtml}
      `;
      item.onclick = (e) => {
        e.stopPropagation();
        selectRadarTargetStation(idx, false);
      };
      listHost.appendChild(item);
    });
  }

  // Kemas kini paparan Smart Radar (8 titik warna status, garisan panduan sasaran, azimut & elevasi dalam darjah)
  function updateARWorldCompass() {
    const canvas = arWorldState.compassEl;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width || 160;
    const H = canvas.height || 160;
    const cx = W / 2, cy = H / 2, r = (W / 2) - 10;

    ctx.clearRect(0, 0, W, H);

    // 1. Bulatan latar radar
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 15, 28, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Gelang grid jarak maya Treasure Hunt (Dekat ~3.0m, Sederhana ~5.0m) & paksi silang
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - r + 8, cy);
    ctx.lineTo(cx + r - 8, cy);
    ctx.moveTo(cx, cy - r + 8);
    ctx.lineTo(cx, cy + r - 8);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.stroke();

    // 3. Kon medan pandangan semasa kamera (di bahagian atas radar = arah pandangan semasa)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 4, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fillStyle = 'rgba(45, 212, 191, 0.20)';
    ctx.fill();

    // Garisan arah pandangan kamera semasa (ke atas radar)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - (r - 6));
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.stroke();

    const currentAz = ((arWorldState.currentHeadingDeg % 360) + 360) % 360;
    const currentEl = arWorldState.currentPitchDeg || 0;
    const headingRad = THREE.MathUtils.degToRad(currentAz);
    const targetIdx = (typeof arWorldState.targetStationIdx === 'number')
      ? arWorldState.targetStationIdx
      : 0;

    // 4. Garisan panduan putus-putus kuning ke stesen sasaran atau Peti Harta Karun
    const isChestTarget = (targetIdx === -1);
    const targetCfg = isChestTarget ? arWorldState.treasureChestConfig : (AR_WORLD_STATIONS[targetIdx] || AR_WORLD_STATIONS[0]);
    if (targetCfg) {
      const targetRelRad = THREE.MathUtils.degToRad(targetCfg.azimuthDeg) - headingRad;
      const targetNormR = Math.max(0, Math.min(1, ((targetCfg.radius || 4.5) - 4.0) / 6.5));
      const targetDotR = (r * 0.30) + targetNormR * (r * 0.60);
      const tx = cx + Math.sin(targetRelRad) * targetDotR;
      const ty = cy - Math.cos(targetRelRad) * targetDotR;
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = isChestTarget ? '#fbbf24' : '#facc15';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Lukis 8 titik stesen dengan posisi jarak maya proporsional & status visual:
    //    - Biru (#38bdf8): Belum diteroka / belum dalam pandangan
    //    - Kuning (#facc15): Sedang dicari (sasaran aktif)
    //    - Hijau (#10b981): Sudah selesai (lencana kuiz diperoleh)
    AR_WORLD_STATIONS.forEach((cfg, idx) => {
      const stationAngleRad = THREE.MathUtils.degToRad(cfg.azimuthDeg);
      const relAngle = stationAngleRad - headingRad;
      const normDist = Math.max(0, Math.min(1, ((cfg.radius || 4.5) - 4.0) / 6.5));
      const dotR = (r * 0.30) + normDist * (r * 0.60);
      const dotX = cx + Math.sin(relAngle) * dotR;
      const dotY = cy - Math.cos(relAngle) * dotR;

      const isTarget = (idx === targetIdx);
      const isInView = (idx === arWorldState.lastDetectedIdx);
      const isDone = State.completedStations.has(cfg.stationNumber);
      const isDiscovered = arWorldState.discoveredStations.has(cfg.stationNumber);

      let dotColor = '#38bdf8'; // Biru = Belum diteroka
      if (isDone) dotColor = '#10b981'; // Hijau = Sudah selesai
      if (isTarget) dotColor = '#facc15'; // Kuning = Sedang dicari

      if (isTarget || isInView) {
        ctx.beginPath();
        ctx.arc(dotX, dotY, 11, 0, Math.PI * 2);
        ctx.fillStyle = isTarget ? 'rgba(250, 204, 21, 0.30)' : 'rgba(45, 212, 191, 0.28)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(dotX, dotY, isTarget ? 8.2 : 6.6, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.strokeStyle = (isTarget || isInView) ? '#ffffff' : 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = (isTarget || isInView) ? 2 : 1.2;
      ctx.stroke();

      ctx.fillStyle = isTarget ? '#0f172a' : '#ffffff';
      ctx.font = '900 9.5px Nunito, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isDone ? '✓' : String(cfg.stationNumber), dotX, dotY + 0.5);
    });

    // 5.1 Lukis titik Peti Harta Karun ARSELNel pada azimut dinamik jika Misi Akhir aktif & belum selesai
    if (State.treasureHuntActive && !State.treasureHuntCompleted) {
      const chestAngleRad = THREE.MathUtils.degToRad(arWorldState.treasureChestConfig.azimuthDeg);
      const chestRelAngle = chestAngleRad - headingRad;
      const cDotR = r - 16;
      const chestDotX = cx + Math.sin(chestRelAngle) * cDotR;
      const chestDotY = cy - Math.cos(chestRelAngle) * cDotR;

      if (isChestTarget) {
        ctx.beginPath();
        ctx.arc(chestDotX, chestDotY, 11.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(chestDotX, chestDotY, isChestTarget ? 8.2 : 6.8, 0, Math.PI * 2);
      ctx.fillStyle = State.treasureHuntCompleted ? '#10b981' : '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = isChestTarget ? '#ffffff' : 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = isChestTarget ? 2 : 1.2;
      ctx.stroke();

      ctx.font = '10px Nunito, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎁', chestDotX, chestDotY);
    }

    // 6. Titik pengguna di tengah radar
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Teks azimut semasa di bawah pusat radar
    ctx.fillStyle = '#5eead4';
    ctx.font = '900 10px Nunito, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(currentAz)}°`, cx, cy + 17);

    // 7. Kemas kini Panel Panduan Smart Radar & Penunjuk Elevasi (Bahagian 4, 5 & 6)
    updateSmartRadarNavigationPanel(targetCfg, targetIdx, currentAz, currentEl);
  }

  function updateSmartRadarNavigationPanel(targetCfg, targetIdx, currentAz, currentEl) {
    if (!targetCfg) return;

    const isChestTarget = (targetIdx === -1);
    const targetAz = targetCfg.azimuthDeg;
    const targetEl = targetCfg.elevationDeg || 0;
    const deltaAz = shortestAngleDeltaDeg(targetAz, currentAz);
    const deltaEl = targetEl - currentEl;

    const hTol = arWorldState.horizontalToleranceDeg || 14;
    const vTol = arWorldState.verticalToleranceDeg || 12;
    const azAligned = Math.abs(deltaAz) <= hTol;
    const elAligned = Math.abs(deltaEl) <= vTol;
    const isTargetDiscovered = azAligned && elAligned;
    const isDone = isChestTarget ? State.treasureHuntCompleted : State.completedStations.has(targetCfg.stationNumber);
    const distTier = targetCfg.distanceTier || (targetCfg.radius <= 5.0 ? 'Dekat' : targetCfg.radius <= 7.0 ? 'Sederhana' : targetCfg.radius <= 9.0 ? 'Jauh' : 'Sangat Jauh');
    const heightTier = targetCfg.heightTier || (targetCfg.virtualHeight <= 0.8 ? 'Rendah' : targetCfg.virtualHeight <= 1.8 ? 'Sederhana' : 'Tinggi');
    const heightDesc = heightTier === 'Rendah' ? 'paras lantai/meja' : heightTier === 'Tinggi' ? 'terapung tinggi' : 'aras mata';

    // Kemas kini pil stesen 1..8
    AR_WORLD_STATIONS.forEach((cfg, idx) => {
      const pill = document.getElementById(`ar-radar-pill-${cfg.stationNumber}`);
      if (pill) {
        const done = State.completedStations.has(cfg.stationNumber);
        pill.classList.toggle('target', idx === targetIdx && !isChestTarget);
        pill.classList.toggle('done', done && idx !== targetIdx);
      }
    });

    // Kemas kini Penunjuk Elevasi Menegak (-30° hingga +30°)
    const elevTargetDot = document.getElementById('ar-elev-target-dot');
    const elevCamDot = document.getElementById('ar-elev-cam-dot');
    if (elevTargetDot) {
      const clampedT = Math.max(-30, Math.min(30, targetEl));
      const pctT = 50 - (clampedT / 30) * 38;
      elevTargetDot.style.top = `${pctT}%`;
    }
    if (elevCamDot) {
      const clampedC = Math.max(-30, Math.min(30, currentEl));
      const pctC = 50 - (clampedC / 30) * 38;
      elevCamDot.style.top = `${pctC}%`;
      elevCamDot.style.background = elAligned ? '#10b981' : '#38bdf8';
    }

    const titleEl = document.getElementById('ar-radar-target-title');
    if (titleEl) {
      titleEl.textContent = isChestTarget
        ? '🎁 Misi Akhir: Peti Harta Karun ARSELNel'
        : `🎯 Stesen ${targetCfg.stationNumber}: ${targetCfg.label}`;
    }

    const statusChip = document.getElementById('ar-radar-status-chip');
    if (statusChip) {
      if (isDone) {
        statusChip.textContent = 'Selesai ✓';
        statusChip.style.background = 'rgba(16, 185, 129, 0.22)';
        statusChip.style.color = '#34d399';
        statusChip.style.borderColor = '#10b981';
      } else if (isTargetDiscovered) {
        statusChip.textContent = isChestTarget ? 'Peti Ditemui! 🎁' : 'Stesen Ditemui! ✨';
        statusChip.style.background = 'rgba(45, 212, 191, 0.25)';
        statusChip.style.color = '#5eead4';
        statusChip.style.borderColor = '#2dd4bf';
      } else {
        statusChip.textContent = isChestTarget ? 'Harta Karun ARSELNel 🎁' : `${distTier} • ${heightTier} (~${targetCfg.radius}m)`;
        statusChip.style.background = 'rgba(250, 204, 21, 0.2)';
        statusChip.style.color = '#fde047';
        statusChip.style.borderColor = 'rgba(250, 204, 21, 0.45)';
      }
    }

    const azTargetEl = document.getElementById('ar-radar-az-target');
    if (azTargetEl) azTargetEl.innerHTML = `Arah sasaran: <strong>${Math.round(targetAz)}°</strong> (${targetCfg.directionName}) • <em style="color:#5eead4;">${distTier} (~${targetCfg.radius}m Maya)</em>`;

    const azCamEl = document.getElementById('ar-radar-az-cam');
    if (azCamEl) azCamEl.innerHTML = `Arah kamera: <strong>${Math.round(currentAz)}°</strong> relatif`;

    const fmtSignedDeg = (v) => (Math.round(v) > 0 ? `+${Math.round(v)}°` : `${Math.round(v)}°`);
    const elTargetEl = document.getElementById('ar-radar-el-target');
    if (elTargetEl) elTargetEl.innerHTML = `Elevasi sasaran: <strong>${fmtSignedDeg(targetEl)}</strong> (${heightTier}: ${targetCfg.virtualHeight || 1.5}m)`;

    const elCamEl = document.getElementById('ar-radar-el-cam');
    if (elCamEl) elCamEl.innerHTML = `Elevasi kamera: <strong>${fmtSignedDeg(currentEl)}</strong>`;

    const turnCmdEl = document.getElementById('ar-radar-turn-cmd');
    if (turnCmdEl) {
      if (azAligned) {
        turnCmdEl.textContent = '✓ Arah mendatar tepat!';
        turnCmdEl.style.color = '#34d399';
      } else if (deltaAz > 0) {
        turnCmdEl.textContent = `↪ Pusing kanan ${Math.round(deltaAz)}°`;
        turnCmdEl.style.color = '#fde047';
      } else {
        turnCmdEl.textContent = `↩ Pusing kiri ${Math.round(Math.abs(deltaAz))}°`;
        turnCmdEl.style.color = '#fde047';
      }
    }

    const elevCmdEl = document.getElementById('ar-radar-elev-cmd');
    if (elevCmdEl) {
      if (elAligned) {
        elevCmdEl.textContent = `✓ Aras elevasi tepat (${heightTier})!`;
        elevCmdEl.style.color = '#34d399';
      } else if (deltaEl > 0) {
        elevCmdEl.textContent = `⬆ Naikkan kamera ${Math.round(deltaEl)}° (Sasaran ${heightDesc})`;
        elevCmdEl.style.color = '#38bdf8';
      } else {
        elevCmdEl.textContent = `⬇ Turunkan kamera ${Math.round(Math.abs(deltaEl))}° (Sasaran ${heightDesc})`;
        elevCmdEl.style.color = '#38bdf8';
      }
    }

    const coachEl = document.getElementById('ar-radar-coach-msg');
    const absAz = Math.round(Math.abs(deltaAz));
    const absEl = Math.round(Math.abs(deltaEl));
    const turnWord = deltaAz > 0 ? 'kanan' : 'kiri';
    if (coachEl) {
      if (isTargetDiscovered) {
        coachEl.textContent = isChestTarget ? 'Peti Harta Karun ARSELNel ditemui! Ketik untuk buka.' : `Stesen ${targetCfg.label} dikesan! Teruskan bergerak dan ketik Teroka.`;
        coachEl.style.color = '#34d399';
      } else if (isChestTarget && azAligned && !elAligned) {
        const verb = deltaEl > 0 ? 'Naikkan' : 'Turunkan';
        const arrow = deltaEl > 0 ? '⬆' : '⬇';
        coachEl.textContent = `${arrow} ${verb} kamera ${absEl}° untuk mencari Peti Harta Karun!`;
        coachEl.style.color = '#38bdf8';
      } else if (!azAligned && absAz <= 28) {
        coachEl.textContent = isChestTarget
          ? `Bagus! Anda hampir menghadap Peti Harta Karun. Pusing ${turnWord} ${absAz}° lagi.`
          : `Stesen berada di hadapan (± ${distTier.toLowerCase()}). Pusing ${turnWord} ${absAz}° lagi.`;
        coachEl.style.color = '#fde047';
      } else if (!azAligned) {
        coachEl.textContent = isChestTarget
          ? `Peti Harta Karun berada di sebelah ${targetCfg.directionName.toLowerCase()}. Pusing ${turnWord} ${absAz}° lagi.`
          : `Stesen ${targetCfg.label} berada di hadapan (± ${distTier.toLowerCase()}). Pusing ke arah penunjuk (${turnWord} ${absAz}°).`;
        coachEl.style.color = '#5eead4';
      } else if (!elAligned) {
        const verb = deltaEl > 0 ? 'Naikkan' : 'Turunkan';
        const arrow = deltaEl > 0 ? '⬆' : '⬇';
        coachEl.textContent = isChestTarget
          ? `${arrow} ${verb} kamera ${absEl}° untuk mencari Peti Harta Karun!`
          : `${arrow} ${verb} kamera ${absEl}° (${heightDesc}) untuk mencari Stesen ${targetCfg.label}.`;
        coachEl.style.color = '#38bdf8';
      }
    }

    // 8. Kemas kini Paparan Lalai Ringkas (Minimal Card — Bahagian 4)
    const compactTargetEl = document.getElementById('ar-compact-target-name');
    if (compactTargetEl) {
      compactTargetEl.innerHTML = isChestTarget ? '🎁 Peti ARSELNel' : `🎯 ${targetCfg.label} <small style="color:#5eead4;font-size:10px;font-weight:700;">• ${distTier} (${heightTier})</small>`;
    }
    const compactTurnEl = document.getElementById('ar-compact-turn-cmd');
    if (compactTurnEl) {
      if (azAligned) {
        compactTurnEl.textContent = '✓ Arah tepat';
        compactTurnEl.style.color = '#34d399';
      } else if (deltaAz > 0) {
        compactTurnEl.textContent = `↷ Kanan ${absAz}°`;
        compactTurnEl.style.color = '#fde047';
      } else {
        compactTurnEl.textContent = `↶ Kiri ${absAz}°`;
        compactTurnEl.style.color = '#fde047';
      }
    }
    const compactElevEl = document.getElementById('ar-compact-elev-cmd');
    if (compactElevEl) {
      if (elAligned) {
        compactElevEl.textContent = `✓ Aras tepat (${heightTier})`;
        compactElevEl.style.color = '#34d399';
      } else if (deltaEl > 0) {
        compactElevEl.textContent = `▲ Dongak +${absEl}°`;
        compactElevEl.style.color = '#38bdf8';
      } else {
        compactElevEl.textContent = `▼ Tunduk -${absEl}°`;
        compactElevEl.style.color = '#38bdf8';
      }
    }

    // 9. Kemas kini SATU Arahan Utama di bahagian tengah (Fasa A.3: Bebas Pertindihan HUD)
    if (DOM.arSingleInstruction && DOM.arSingleInstructionText && arWorldState.active) {
      // Keutamaan 1: Sekiranya Kad Butiran Organel dibuka penuh di sebelah kanan, sembunyikan arahan tengah
      // untuk menghapuskan sebarang kemungkinan teks bertindih pada skrin iPad (1024x768).
      const isCardOpenFull = DOM.arOrganelleCard &&
        DOM.arOrganelleCard.style.display === 'block' &&
        !DOM.arOrganelleCard.classList.contains('minimized');

      if (isCardOpenFull) {
        DOM.arSingleInstruction.style.opacity = '0';
        DOM.arSingleInstruction.style.pointerEvents = 'none';
      } else {
        DOM.arSingleInstruction.style.display = 'block';
        DOM.arSingleInstruction.style.opacity = '1';
        DOM.arSingleInstruction.style.pointerEvents = 'none';

        if (isTargetDiscovered) {
          DOM.arSingleInstructionText.textContent = isChestTarget 
            ? '✓ Peti Harta Karun Ditemui! Ketik untuk buka.' 
            : `✓ Stesen ${targetCfg.label} dikesan! Dekati & ketik untuk teroka.`;
          DOM.arSingleInstruction.classList.add('discovered');
        } else if (!azAligned) {
          const arrow = deltaAz > 0 ? '↷' : '↶';
          const lbl = isChestTarget ? 'Peti Harta Karun' : targetCfg.label;
          DOM.arSingleInstructionText.textContent = `${arrow} Pusing ${turnWord} ${absAz}° (${lbl})`;
          DOM.arSingleInstruction.classList.remove('discovered');
        } else {
          const arrow = deltaEl > 0 ? '▲' : '▼';
          const verb = deltaEl > 0 ? 'Dongak' : 'Tunduk';
          const lbl = isChestTarget ? 'Peti' : targetCfg.label;
          DOM.arSingleInstructionText.textContent = `${arrow} ${verb} kamera ${absEl}° (${lbl})`;
          DOM.arSingleInstruction.classList.remove('discovered');
        }
      }
    }
  }

  // Animasi stesen AR dunia (dipanggil setiap frame dalam renderLoop)
  function animateARWorldStations(elapsedTime) {
    if (!arWorldState.active) return;
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    arWorldState.stationGroups.forEach((group, idx) => {
      if (!group.visible) return;
      const organelle = group.userData.organelleModel;
      if (organelle && organelle.visible) {
        organelle.position.y = 0.12 + Math.sin(elapsedTime * 1.3 + idx * 0.8) * 0.04;
        if (arState.autoRotate) {
          organelle.rotation.y = elapsedTime * 0.45 + idx * (Math.PI / 4);
        }
        if (organelle.userData && organelle.userData.isCytoplasmGel && organelle.userData.gelVisual) {
          organelle.userData.gelVisual.userData.updateAnimation(elapsedTime);
        }
      }
      // Animasi kumpulan bayangan misteri (Stage 1)
      if (group.userData.mysteryGroup && group.userData.mysteryGroup.visible) {
        group.userData.mysteryGroup.rotation.y = elapsedTime * 0.6;
        if (group.userData.qSprite) {
          group.userData.qSprite.position.y = 0.64 + Math.sin(elapsedTime * 2.2 + idx * 0.7) * 0.05;
        }
      }
      if (group.userData.beacon) {
        group.userData.beacon.rotation.y = elapsedTime * 1.5;
      }
      // Animasi apungan hologram & putaran cincin bercahaya
      if (group.userData.outerRing) {
        group.userData.outerRing.rotation.z = -elapsedTime * 0.25;
      }
      if (group.userData.innerRing) {
        group.userData.innerRing.rotation.z = elapsedTime * 0.38;
      }
      if (Array.isArray(group.userData.holoParticles)) {
        group.userData.holoParticles.forEach(p => {
          const u = p.userData;
          const a = u.angle + elapsedTime * u.speed * 0.45;
          p.position.x = Math.cos(a) * u.baseRadius;
          p.position.z = Math.sin(a) * u.baseRadius;
          p.position.y = u.baseHeight + Math.sin(elapsedTime * 1.6 + u.angle) * 0.04;
        });
      }
      // Pastikan papan nama sentiasa menghadap kamera dengan tegak & skala terhad mengikut jarak perspektif
      const stnPos = new THREE.Vector3();
      group.getWorldPosition(stnPos);
      const dist = camPos.distanceTo(stnPos);
      const clampedLabelScale = Math.max(0.55, Math.min(0.95, 4.8 / Math.max(4.0, dist)));
      group.children.forEach(child => {
        if (child.userData && child.userData.isLabel) {
          child.lookAt(camPos);
          child.scale.setScalar(clampedLabelScale);
        }
      });
    });

    // Animasi Peti Harta Karun ARSELNel (Misi Akhir)
    if (State.treasureHuntActive && !State.treasureHuntCompleted && arWorldState.treasureChestGroup && arWorldState.treasureChestGroup.visible) {
      const chest = arWorldState.treasureChestGroup;
      const chestCfg = arWorldState.treasureChestConfig;
      const baseEyeY = arWorldState.postureMode === 'seated' ? 1.25 : 1.6;
      const elRad = THREE.MathUtils.degToRad(chestCfg.elevationDeg || 6);
      const R = chestCfg.radius || 4.8;
      const baseY = baseEyeY + Math.sin(elRad) * R;
      chest.position.y = baseY + Math.sin(elapsedTime * 2.2) * 0.05;

      if (chest.userData.beacon) {
        chest.userData.beacon.rotation.y = elapsedTime * 2.2;
      }
      if (chest.userData.labelGroup) {
        chest.userData.labelGroup.lookAt(camPos);
      }

      // Animasi pembukaan penutup peti (lid opening lerp)
      if (arWorldState.isChestLidOpen && arWorldState.chestLidPivot) {
        arWorldState.chestLidPivot.rotation.x = THREE.MathUtils.lerp(
          arWorldState.chestLidPivot.rotation.x,
          -1.75,
          0.06
        );
        if (arWorldState.chestLight) {
          arWorldState.chestLight.intensity = THREE.MathUtils.lerp(
            arWorldState.chestLight.intensity,
            2.8,
            0.06
          );
        }
      }

      // Animasi zarah bintang / sparkles
      if (Array.isArray(arWorldState.chestParticles)) {
        arWorldState.chestParticles.forEach(p => {
          p.position.y = p.userData.baseY + Math.sin(elapsedTime * p.userData.speed + p.userData.offset) * 0.12;
          p.rotation.y += 0.03;
          p.rotation.x += 0.02;
        });
      }
    }

    if (arWorldState.subMode === 'spatial') {
      // Dalam Mod A (WebXR), kemas kini arah kompas & stesen dalam FOV daripada pose kamera XR sebenar
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const headingDeg = ((THREE.MathUtils.radToDeg(Math.atan2(camDir.x, -camDir.z)) % 360) + 360) % 360;
      const pitchDeg = THREE.MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, camDir.y))));
      arWorldState.currentHeadingDeg = headingDeg;
      arWorldState.currentPitchDeg = pitchDeg;
      checkARWorldStationVisibility();
      updateARWorldCompass();
    }
  }

  // Mulakan Mod C — Penerokaan AR Dunia Berasaskan Orientasi (8 Stesen Berasingan + Smart Radar)
  async function startARWorldExploration() {
    stopMarkerAR();
    const camOk = await startInteractiveCamera(true);
    if (!camOk) return;

    arWorldState.active = true;
    arWorldState.subMode = 'orientation';
    arState.activeModel = 'world';

    // PENTING: Sembunyikan arObjectGroup lama supaya tiada Makmal Mini berkumpul di tengah skrin!
    if (arObjectGroup) arObjectGroup.visible = false;

    // Kemas kini butang tab aktif
    if (DOM.arBtnWorld) DOM.arBtnWorld.classList.add('active');
    if (DOM.arBtnMarker) DOM.arBtnMarker.classList.remove('active');
    if (DOM.arBtnAnimal) DOM.arBtnAnimal.classList.remove('active');
    if (DOM.arBtnPlant) DOM.arBtnPlant.classList.remove('active');
    if (DOM.arBtnMinilab) DOM.arBtnMinilab.classList.remove('active');
    if (DOM.arPrintMarkersBtn) DOM.arPrintMarkersBtn.style.display = 'none';
    if (DOM.arPostureBtn) DOM.arPostureBtn.style.display = 'inline-flex';
    if (DOM.arRecenterText) DOM.arRecenterText.textContent = 'Kalibrasi Semula';

    // Bina 8 stesen AR di lokasi sudut & elevasi berasingan dalam world space
    buildARWorldStations();
    buildARWorldCompass();

    if (State.treasureHuntActive) {
      buildTreasureChest3D();
      if (arWorldState.treasureChestGroup) {
        arWorldState.treasureChestGroup.visible = true;
      }
    }

    // Setup DeviceOrientation (untuk peranti yang tidak memerlukan klik izin iOS)
    setupDeviceOrientation();

    // Kalibrasi awal supaya arah semasa menjadi 0° Hadapan & 0° Elevasi
    calibrateARWorldHeading();

    // Tunjuk dialog kalibrasi & kebenaran sensor iOS
    showARWorldCalibrationUI();

    if (DOM.arBadgeIcon) DOM.arBadgeIcon.textContent = '🧭';
    if (DOM.arBadgeText) {
      DOM.arBadgeText.textContent = 'AR Jelajah Sel';
    }
    if (DOM.arHintBanner) {
      DOM.arHintBanner.style.display = 'none';
    }
    if (DOM.arSingleInstruction) {
      DOM.arSingleInstruction.style.display = 'block';
    }
    document.body.classList.add('ar-world-active');

    updateARTrackingStatusBanner('ok', '');
  }

  // Tunjuk UI Kalibrasi & Permintaan Sensor iOS Safari
  function showARWorldCalibrationUI() {
    let calUI = document.getElementById('ar-world-calibration-ui');
    if (!calUI) {
      calUI = document.createElement('div');
      calUI.id = 'ar-world-calibration-ui';
      calUI.style.cssText = `
        position: fixed; bottom: max(22px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%);
        background: rgba(8, 15, 28, 0.96); border: 2px solid #2dd4bf;
        border-radius: 18px; padding: 14px 20px; z-index: 38;
        font-family: 'Nunito', Arial, sans-serif; color: #fff; text-align: center;
        width: min(440px, 92vw); box-shadow: 0 12px 32px rgba(0,0,0,0.6);
        pointer-events: auto;
      `;
      document.body.appendChild(calUI);
    }
    calUI.style.display = 'block';
    const needsIOSPerm = (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function');
    calUI.innerHTML = `
      <div style="font-size:14px; margin-bottom:6px; color:#2dd4bf; font-weight:900;">🧭 Kalibrasi Arah Dunia AR (Mod B)</div>
      <div style="font-size:12px; margin-bottom:12px; color:#cbd5e1; line-height:1.45;">
        Hadapkan peranti / kamera ke arah hadapan yang selesa dan tekan <strong>Kalibrasi &amp; Aktifkan Sensor</strong>.<br>
        <span style="color:#94a3b8; font-size:11px;">Arah 360°: Hadapan (0°): Nukleus • Kanan (90°): Sitoplasma • Belakang (180°): Kloroplas • Kiri (270°): Vakuol</span>
      </div>
      <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
        <button type="button" id="ar-world-calibrate-btn" style="
          background: linear-gradient(135deg, #0d9488, #10b981);
          color: white; border: none; border-radius: 10px; padding: 9px 18px;
          font-size: 13px; font-weight: 900; cursor: pointer;
        ">${needsIOSPerm ? '📡 Aktifkan Sensor iPad & Kalibrasi' : '🧭 Tetapkan Arah Hadapan (0°)'}</button>
        <button type="button" id="ar-world-close-cal-btn" style="
          background: rgba(255,255,255,0.1); color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 9px 14px;
          font-size: 12px; font-weight: 800; cursor: pointer;
        ">Mula Teroka</button>
      </div>
    `;

    document.getElementById('ar-world-calibrate-btn').onclick = async (e) => {
      e.stopPropagation();
      await requestiOSOrientationPermission();
      calibrateARWorldHeading();
      calUI.style.display = 'none';
    };
    document.getElementById('ar-world-close-cal-btn').onclick = (e) => {
      e.stopPropagation();
      calUI.style.display = 'none';
      if (!arWorldState.hasCalibrated) {
        calibrateARWorldHeading();
      }
    };
  }

  // Hentikan Mod Penerokaan AR Dunia
  function stopARWorldExploration() {
    arWorldState.active = false;
    arWorldState.hasCalibrated = false;
    arWorldState.lastDetectedIdx = -1;
    arWorldState.focusedStationIdx = -1;

    arWorldState.stationGroups.forEach(g => { g.visible = false; });

    const calUI = document.getElementById('ar-world-calibration-ui');
    if (calUI) calUI.style.display = 'none';
    const compassWrap = document.getElementById('ar-world-compass-wrap');
    if (compassWrap) compassWrap.style.display = 'none';
    const trackBanner = document.getElementById('ar-world-tracking-banner');
    if (trackBanner) trackBanner.style.display = 'none';
    if (DOM.arSingleInstruction) DOM.arSingleInstruction.style.display = 'none';
    document.body.classList.remove('ar-world-active');
    hideARStationDetectedBanner();
  }

  // Handle ketukan (tap) pada stesen AR dunia atau stesen Marker AR
  function handleARWorldTap(clientX, clientY) {
    if (!renderer || !camera) return false;

    const rect = renderer.domElement.getBoundingClientRect();
    arPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    arPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    arRaycaster.setFromCamera(arPointer, camera);

    const targetGroups = arMarkerState.active
      ? arMarkerState.anchors
      : (arWorldState.active ? [...arWorldState.stationGroups] : []);

    // Sertakan Peti Harta Karun dalam sasaran ketikan jika Misi Akhir aktif
    if (arWorldState.active && State.treasureHuntActive && arWorldState.treasureChestGroup && arWorldState.treasureChestGroup.visible) {
      targetGroups.push(arWorldState.treasureChestGroup);
    }

    if (!targetGroups.length) return false;

    const pickables = [];
    targetGroups.forEach(group => {
      if (!group.visible) return;
      group.traverse(child => {
        if (child.isMesh && child.userData && child.userData.pickable) {
          pickables.push(child);
        }
      });
    });

    const hits = arRaycaster.intersectObjects(pickables, true);
    if (hits.length > 0) {
      let hitObj = hits[0].object;
      let stationGroup = hitObj;
      while (stationGroup && (!stationGroup.userData || !stationGroup.userData.stationConfig)) {
        stationGroup = stationGroup.parent;
      }
      if (stationGroup && stationGroup.userData && stationGroup.userData.stationConfig) {
        if (stationGroup.userData.isTreasureChest) {
          SoundFX.interact();
          openTreasureChestModal();
          return true;
        }
        const cfg = stationGroup.userData.stationConfig;
        arWorldState.focusedStationIdx = stationGroup.userData.stationIndex;
        SoundFX.interact();
        selectAROrganelle(cfg.stationKey, cfg.stationNumber);
        return true;
      }
    }
    return false;
  }

  // ==============================================================================
  // 6.4 MOD B: MARKER AR (8 KAD PENANDA AR BOLEH CETAK — IPAD SAFARI 6DOF POSE)
  // Struktur Hirarki Wajib: MarkerAnchor -> ModelOrientationGroup -> ModelScaleGroup -> GLBScene
  // ==============================================================================
  function buildMarkerARAnchors() {
    arMarkerState.anchors.forEach(a => { if (a.parent) a.parent.remove(a); });
    arMarkerState.anchors = [];
    arMarkerState.trackedMap = {};

    AR_WORLD_STATIONS.forEach((stnConfig, idx) => {
      const mCfg = MARKER_MODEL_CONFIG[stnConfig.stationKey] || { scale: 0.27, offsetY: 0.15, rotCorrection: [0, 0, 0] };

      // 1. Parent Group: MarkerAnchor (mengikut pose 3D permukaan kad secara langsung, +Y = normal keluar kad)
      const anchorGroup = new THREE.Group();
      anchorGroup.name = `MarkerAnchor_${stnConfig.markerId}_${stnConfig.stationKey}`;

      // 2. Child Group: ModelOrientationGroup (pembetulan orientasi khusus mengikut model, terasing daripada pose marker)
      const modelOrientationGroup = new THREE.Group();
      modelOrientationGroup.name = `ModelOrientationGroup_${stnConfig.stationKey}`;
      const [rx, ry, rz] = mCfg.rotCorrection || [0, 0, 0];
      modelOrientationGroup.rotation.set(rx, ry, rz);
      anchorGroup.add(modelOrientationGroup);

      // 3. Grandchild Group: ModelScaleGroup (skala & ketinggian di atas permukaan kad supaya tidak menembusi kad)
      const modelScaleGroup = new THREE.Group();
      modelScaleGroup.name = `ModelScaleGroup_${stnConfig.stationKey}`;
      modelScaleGroup.scale.setScalar(mCfg.scale || 0.27);
      modelScaleGroup.position.set(0, mCfg.offsetY || 0.15, 0);
      modelOrientationGroup.add(modelScaleGroup);

      // 4. Leaf Group: GLBScene / OrganelleModel
      const organelleModel = buildOrganelleModel(stnConfig.stationKey, stnConfig.color);
      organelleModel.name = `GLBScene_${stnConfig.stationKey}`;
      modelScaleGroup.add(organelleModel);

      // 5. Papan Nama 3D di atas model (sentiasa menghadap kamera secara tegak & tidak terbalik/mirrored)
      const labelTitle = `Kad #${stnConfig.markerId}: ${stnConfig.label}`;
      const labelSub = `Stesen ${stnConfig.stationNumber} • Ketik Model Untuk Info & Kuiz`;
      const labelGroup = buildStationLabel(labelTitle, labelSub, stnConfig.icon, stnConfig.color, stnConfig.stationNumber);
      labelGroup.scale.setScalar(0.16);
      labelGroup.position.set(0, 0.04, 0);
      anchorGroup.add(labelGroup);

      // 6. Gelang tapak di atas permukaan kad (selari dengan satah XZ MarkerAnchor, y = 0.008m di atas kad)
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.21, 32),
        new THREE.MeshBasicMaterial({ color: stnConfig.color, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.008;
      anchorGroup.add(ring);

      // 7. Sfera collider untuk ketikan (tap) pada iPad
      const hitCollider = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
      );
      hitCollider.position.set(0, 0.18, 0);
      hitCollider.userData = {
        id: stnConfig.stationKey,
        stationNumber: stnConfig.stationNumber,
        pickable: true
      };
      anchorGroup.add(hitCollider);

      anchorGroup.userData = {
        stationConfig: stnConfig,
        stationIndex: idx,
        markerId: stnConfig.markerId,
        modelOrientationGroup,
        modelScaleGroup,
        organelleModel,
        labelGroup,
        ring
      };

      // PENTING: Sembunyikan apabila penanda belum dikesan
      anchorGroup.visible = false;
      scene.add(anchorGroup);
      arMarkerState.anchors.push(anchorGroup);
    });
  }

  // Tukar keputusan POSIT (R_posit, t_posit) kepada transform tangan-kanan (det = +1, tiada pantulan/mirroring)
  // di mana:
  //   +X_anchor = cardRight (vektor kanan kad)
  //   +Y_anchor = cardNormal (normal permukaan kad menghala keluar dari kad ke arah kamera/atas meja)
  //   +Z_anchor = cardForward (-cardUp, menghala ke tepi bawah kad / menghadap murid)
  function computeRightHandedMarkerPose(pose) {
    if (!pose || !pose.bestTranslation || !pose.bestRotation) return null;
    const err = typeof pose.bestError === 'number' ? pose.bestError : 0;
    if (err > (arMarkerState.maxReprojError || 42)) return null;

    const t = pose.bestTranslation; // dalam mm (X kanan, Y atas, Z jauh dari kamera > 0)
    let r = pose.bestRotation;      // matriks 3x3 POSIT

    // Tukar translasi dari mm ke meter dalam ruang kamera Three.js (-Z ke hadapan)
    const tx = (t[0] / 1000);
    const ty = (t[1] / 1000);
    const tz = -Math.max(0.18, Math.min(3.0, Math.abs(t[2] / 1000)));

    const extractBasis = (rot3x3) => {
      const right = new THREE.Vector3(rot3x3[0][0], rot3x3[1][0], -rot3x3[2][0]).normalize();
      const upAlongCard = new THREE.Vector3(rot3x3[0][1], rot3x3[1][1], -rot3x3[2][1]).normalize();
      const normal = new THREE.Vector3().crossVectors(right, upAlongCard).normalize();
      return { right, upAlongCard, normal };
    };

    let { right: cardRight, upAlongCard: cardUp, normal: cardNormal } = extractBasis(r);

    // Jika cabang pertama POSIT menghasilkan normal yang menghala menjauhi kamera (z < 0),
    // semak alternativeRotation atau pastikan normal permukaan kad menghadap keluar ke arah pemerhati
    if (cardNormal.z < 0 && pose.alternativeRotation) {
      const alt = extractBasis(pose.alternativeRotation);
      if (alt.normal.z > cardNormal.z) {
        cardRight = alt.right;
        cardUp = alt.upAlongCard;
        cardNormal = alt.normal;
      }
    }
    if (cardNormal.z < 0 && cardNormal.y < 0) {
      cardNormal.negate();
    }

    // Bina asas ortonormal tangan-kanan (det = +1.0)
    // X = cardRight, Y = cardNormal (berdiri tegak keluar dari permukaan kad), Z = cardRight x cardNormal = -cardUp
    const cardForward = new THREE.Vector3().crossVectors(cardRight, cardNormal).normalize();
    cardRight.crossVectors(cardNormal, cardForward).normalize();

    const rotMat = new THREE.Matrix4().makeBasis(cardRight, cardNormal, cardForward);
    const quat = new THREE.Quaternion().setFromRotationMatrix(rotMat);
    const determinant = rotMat.determinant();

    return {
      position: new THREE.Vector3(tx, ty, tz),
      quaternion: quat,
      cardRight,
      cardNormal,
      cardForward,
      determinant: +determinant.toFixed(4),
      error: +err.toFixed(3)
    };
  }

  // Jana 4 penjuru 2D simulasi bagi kad di atas meja mendatar pada sebarang sudut putaran (0°, 90°, 180°),
  // sudut condong (oblique), dan jarak kamera (dekat/jauh) untuk ujian automatik POSIT
  function projectSyntheticMarkerCorners(opts = {}) {
    const cardRotDeg = typeof opts.cardRotDeg === 'number' ? opts.cardRotDeg : 0;
    const tableTiltDeg = typeof opts.tableTiltDeg === 'number' ? opts.tableTiltDeg : 55;
    const obliqueYawDeg = typeof opts.obliqueYawDeg === 'number' ? opts.obliqueYawDeg : 0;
    const distanceMm = (typeof opts.distanceMeters === 'number' ? opts.distanceMeters : 0.55) * 1000;
    const offsetXMm = (typeof opts.offsetX === 'number' ? opts.offsetX : 0) * 1000;
    const offsetYMm = (typeof opts.offsetY === 'number' ? opts.offsetY : 0) * 1000;

    const focalLen = arMarkerState.posit
      ? arMarkerState.posit.focalLength
      : (360 / 2) / Math.tan(THREE.MathUtils.degToRad((camera ? camera.fov : 60) / 2));

    const half = (arMarkerState.markerSizeMeters * 1000) / 2; // 70mm
    const cornersLocal = [
      [-half,  half, 0], // Top-Left
      [ half,  half, 0], // Top-Right
      [ half, -half, 0], // Bottom-Right
      [-half, -half, 0]  // Bottom-Left
    ];

    const radRot = THREE.MathUtils.degToRad(cardRotDeg);
    const cR = Math.cos(radRot), sR = Math.sin(radRot);
    const radTilt = THREE.MathUtils.degToRad(tableTiltDeg);
    const cT = Math.cos(radTilt), sT = Math.sin(radTilt);
    const radObl = THREE.MathUtils.degToRad(obliqueYawDeg);
    const cO = Math.cos(radObl), sO = Math.sin(radObl);

    return cornersLocal.map(([lx, ly]) => {
      // 1. Putar kad di atas satah meja (0°, 90°, 180°, dll.)
      const rx = lx * cR - ly * sR;
      const ry = lx * sR + ly * cR;
      // 2. Condongkan satah meja relatif kepada kamera (tableTiltDeg) & sudut serong (obliqueYawDeg)
      const tx = rx * cO;
      const ty = ry * cT;
      const tz = distanceMm + ry * sT + rx * sO;
      return {
        x: (focalLen * (tx + offsetXMm)) / tz,
        y: (focalLen * (ty + offsetYMm)) / tz
      };
    });
  }

  async function startMarkerAR() {
    stopARWorldExploration();
    const camOk = await startInteractiveCamera(true);
    if (!camOk) return;

    arMarkerState.active = true;
    arMarkerState.simulatedMarkerId = null;
    arMarkerState.simulatedCornersMap = {};
    arState.activeModel = 'marker';

    if (arObjectGroup) arObjectGroup.visible = false;

    if (DOM.arBtnWorld) DOM.arBtnWorld.classList.remove('active');
    if (DOM.arBtnMarker) DOM.arBtnMarker.classList.add('active');
    if (DOM.arBtnAnimal) DOM.arBtnAnimal.classList.remove('active');
    if (DOM.arBtnPlant) DOM.arBtnPlant.classList.remove('active');
    if (DOM.arBtnMinilab) DOM.arBtnMinilab.classList.remove('active');
    if (DOM.arPrintMarkersBtn) DOM.arPrintMarkersBtn.style.display = 'inline-flex';
    if (DOM.arPostureBtn) DOM.arPostureBtn.style.display = 'none';

    if (DOM.arBadgeIcon) DOM.arBadgeIcon.textContent = '🃏';
    if (DOM.arBadgeText) DOM.arBadgeText.textContent = 'AR Kad Penanda';
    if (DOM.arHintBanner) {
      DOM.arHintBanner.style.display = 'none';
    }

    // Sediakan pengesan ArUco & penganggar pose 3D POSIT
    if (window.AR && window.POS && !arMarkerState.detector) {
      arMarkerState.detector = new window.AR.Detector({ dictionaryName: 'ARUCO_MIP_36h12', maxHammingDistance: 5 });
      arMarkerState.procCanvas = document.createElement('canvas');
      arMarkerState.procCanvas.width = 360;
      arMarkerState.procCanvas.height = 270;
      arMarkerState.procCtx = arMarkerState.procCanvas.getContext('2d', { willReadFrequently: true });
      const focalLen = (360 / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      arMarkerState.posit = new window.POS.Posit(arMarkerState.markerSizeMeters * 1000, focalLen);
    }

    // Kamera berada di origin (0,0,0) menghadap -Z; setiap anchor kad dikemas kini mengikut pose 6DOF kamera->marker
    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0, 'YXZ');

    buildMarkerARAnchors();
    updateARTrackingStatusBanner(
      'lost',
      '🔍 Menunggu Kad Penanda AR (#0 Mitokondrion .. #7 Vakuol). Halakan kamera ke kad atau buka <a href="markers.html" target="_blank" style="color:#5eead4;text-decoration:underline;">Halaman 8 Kad Cetak</a>.'
    );
    alertToast('🃏 Mod B (Marker AR) Aktif: Halakan kamera ke Kad Penanda AR di atas meja.');
  }

  function stopMarkerAR() {
    arMarkerState.active = false;
    arMarkerState.activeMarkerIds = [];
    arMarkerState.simulatedMarkerId = null;
    arMarkerState.simulatedCornersMap = {};
    arMarkerState.anchors.forEach(a => { a.visible = false; });
    const trackBanner = document.getElementById('ar-world-tracking-banner');
    if (trackBanner) trackBanner.style.display = 'none';
    hideARStationDetectedBanner();
  }

  // Kemas kini penjejakan pose 6DOF kad penanda setiap frame
  function updateMarkerARTracking(elapsedTime) {
    if (!arMarkerState.active) return;

    const detectedNow = new Set();
    const now = performance.now();

    const applyPoseToMarkerAnchor = (anchor, mId, centeredCorners, immediate = false) => {
      if (!arMarkerState.posit || !centeredCorners) return false;
      const rawPose = arMarkerState.posit.pose(centeredCorners);
      const solved = computeRightHandedMarkerPose(rawPose);
      if (!solved) return false;

      detectedNow.add(mId);
      const wasVisible = anchor.visible;
      const lerpAlpha = (!wasVisible || immediate) ? 1.0 : 0.48;

      anchor.position.lerp(solved.position, lerpAlpha);
      anchor.quaternion.slerp(solved.quaternion, lerpAlpha);
      anchor.visible = true;
      anchor.updateMatrixWorld(true);

      // Pastikan papan nama 3D di atas kad sentiasa menghadap kamera secara tegak & tidak terbalik/mirrored
      if (anchor.userData.labelGroup && camera) {
        anchor.userData.labelGroup.quaternion.copy(anchor.quaternion).invert().multiply(camera.quaternion);
      }

      arMarkerState.trackedMap[mId] = {
        lastSeen: now,
        visible: true,
        error: solved.error,
        determinant: solved.determinant,
        cardNormal: [
          +solved.cardNormal.x.toFixed(3),
          +solved.cardNormal.y.toFixed(3),
          +solved.cardNormal.z.toFixed(3)
        ],
        cardRight: [
          +solved.cardRight.x.toFixed(3),
          +solved.cardRight.y.toFixed(3),
          +solved.cardRight.z.toFixed(3)
        ],
        position: [
          +anchor.position.x.toFixed(3),
          +anchor.position.y.toFixed(3),
          +anchor.position.z.toFixed(3)
        ]
      };
      return true;
    };

    // 1. Jika dalam ujian / simulasi makmal (menggunakan unjuran penjuru POSIT sebenar)
    if (typeof arMarkerState.simulatedMarkerId === 'number' && arMarkerState.simulatedMarkerId >= 0) {
      const mId = arMarkerState.simulatedMarkerId;
      const anchor = arMarkerState.anchors.find(a => a.userData.markerId === mId);
      if (anchor) {
        const off = arMarkerState.simulatedPoseOffset || {};
        const corners = arMarkerState.simulatedCornersMap[mId] || projectSyntheticMarkerCorners({
          cardRotDeg: typeof off.cardRotDeg === 'number' ? off.cardRotDeg : THREE.MathUtils.radToDeg(off.rotY || 0),
          tableTiltDeg: typeof off.tableTiltDeg === 'number' ? off.tableTiltDeg : 55,
          obliqueYawDeg: typeof off.obliqueYawDeg === 'number' ? off.obliqueYawDeg : 0,
          distanceMeters: typeof off.z === 'number' ? Math.abs(off.z) : 0.58,
          offsetX: off.x || 0,
          offsetY: off.y || 0
        });
        applyPoseToMarkerAnchor(anchor, mId, corners, true);
      }
    } else if (arMarkerState.detector && arMarkerState.posit && DOM.cameraFeed && DOM.cameraFeed.readyState >= 2) {
      // 2. Pengesanan sebenar daripada frame video kamera (iPad Safari / Desktop Webcam)
      if (now - arMarkerState.lastDetectTime > 50) {
        arMarkerState.lastDetectTime = now;
        const cw = arMarkerState.procCanvas.width;
        const ch = arMarkerState.procCanvas.height;
        try {
          arMarkerState.procCtx.drawImage(DOM.cameraFeed, 0, 0, cw, ch);
          const imgData = arMarkerState.procCtx.getImageData(0, 0, cw, ch);
          const markers = arMarkerState.detector.detect(imgData) || [];

          markers.forEach(marker => {
            const mId = marker.id;
            const anchor = arMarkerState.anchors.find(a => a.userData.markerId === mId);
            if (!anchor) return;

            const centeredCorners = marker.corners.map(c => ({
              x: c.x - (cw / 2),
              y: (ch / 2) - c.y
            }));

            applyPoseToMarkerAnchor(anchor, mId, centeredCorners, false);
          });
        } catch (_) {}
      }

      // Kekalkan keterlihatan semasa tempoh tangguh pendek (grace period 340ms) supaya model tidak berkelip
      // tetapi sembunyikan serta-merta apabila penanda benar-benar hilang
      const graceMs = arMarkerState.gracePeriodMs || 340;
      Object.keys(arMarkerState.trackedMap).forEach(k => {
        const item = arMarkerState.trackedMap[k];
        if (item && (now - item.lastSeen) <= graceMs) {
          detectedNow.add(Number(k));
        }
      });
    }

    // 3. Kemas kini keterlihatan & putaran pameran lembut di atas kad
    arMarkerState.activeMarkerIds = Array.from(detectedNow);
    arMarkerState.anchors.forEach((anchor) => {
      const mId = anchor.userData.markerId;
      const isTracked = detectedNow.has(mId);
      anchor.visible = isTracked;
      if (isTracked && anchor.userData.organelleModel) {
        if (arState.autoRotate) {
          anchor.userData.organelleModel.rotation.y = elapsedTime * 0.55;
        }
        if (anchor.userData.labelGroup && camera) {
          anchor.userData.labelGroup.quaternion.copy(anchor.quaternion).invert().multiply(camera.quaternion);
        }
      }
    });

    if (arMarkerState.activeMarkerIds.length > 0) {
      const firstId = arMarkerState.activeMarkerIds[0];
      const anchor = arMarkerState.anchors.find(a => a.userData.markerId === firstId);
      if (anchor) {
        const cfg = anchor.userData.stationConfig;
        showARStationDetectedBanner(cfg);
        updateARTrackingStatusBanner(
          'ok',
          `✅ Penanda #${firstId} (${cfg.label}) dikesan! Model 3D berdiri tegak mengikut permukaan kad.`
        );
      }
    } else {
      hideARStationDetectedBanner();
      updateARTrackingStatusBanner(
        'lost',
        '⚠️ Tiada penanda dikesan dalam pandangan kamera. Halakan kamera semula ke Kad Penanda AR (#0–#7) dengan pencahayaan jelas.'
      );
    }
  }

  function buildARSystem() {
    // 1. Dedicated Root Group for AR Models
    if (!arObjectGroup) {
      arObjectGroup = new THREE.Group();
      arObjectGroup.visible = false;
      scene.add(arObjectGroup);
    }

    // 2. Holders for the 3 distinct AR models
    arAnimalHolder = new THREE.Group();
    arAnimalHolder.name = 'AR_Animal_Cell';
    arObjectGroup.add(arAnimalHolder);

    arPlantHolder = new THREE.Group();
    arPlantHolder.name = 'AR_Plant_Cell';
    arPlantHolder.visible = false;
    arObjectGroup.add(arPlantHolder);

    arMiniLabHolder = new THREE.Group();
    arMiniLabHolder.name = 'AR_Mini_Lab';
    arMiniLabHolder.visible = false;
    arObjectGroup.add(arMiniLabHolder);

    // 3. Build the 8-station interactive Makmal Mini ARSelNel
    const miniLabMesh = buildMiniLabGroup();
    arMiniLabHolder.add(miniLabMesh);

    // 4. Load real GLB models (with procedural fallback for instant display)
    loadAnimalCellGLB(arAnimalHolder);
    loadPlantCellGLB(arPlantHolder);

    // 5. Setup touch gestures and mouse interaction on canvas
    setupARGestures();
  }

  // Helper: Create Glowing Station Number Badge for Mini Lab Pedestals (1 to 8)
  function createStationNumberBadge(number, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const hexColor = typeof colorHex === 'number'
      ? '#' + colorHex.toString(16).padStart(6, '0')
      : (colorHex || '#2dd4bf');

    // Circular background
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = hexColor;
    ctx.fill();

    // Glowing border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Station number
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 64, 67);

    const texture = new THREE.CanvasTexture(canvas);
    const badgeGeo = new THREE.CircleGeometry(0.12, 24);
    const badgeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    return badgeMesh;
  }

  // Helper: Miniature 3D Animal Cell for Makmal Mini Diorama
  function buildMiniAnimalModel() {
    const group = new THREE.Group();

    // Outer membrane & cytoplasm with cutaway
    const outerGeo = new THREE.SphereGeometry(0.24, 24, 18, 0, Math.PI * 1.5, 0, Math.PI);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // Glowing Nucleus
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.7 })
    );
    nucleus.position.set(0.04, 0.04, 0.04);
    group.add(nucleus);

    // Folded Mitochondria (red pills)
    const mitoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const m1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), mitoMat);
    m1.position.set(-0.09, -0.04, 0.08);
    m1.rotation.z = 0.6;
    group.add(m1);

    const m2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), mitoMat);
    m2.position.set(0.09, -0.08, 0.04);
    m2.rotation.x = 0.8;
    group.add(m2);

    // Floating Pill Label: "Sel Haiwan"
    const labelMesh = createTextPlane('🐾 Sel Haiwan', '#38bdf8', 0.65, 0.2);
    labelMesh.position.set(0, 0.32, 0);
    group.add(labelMesh);

    return group;
  }

  // Helper: Miniature 3D Plant Cell for Makmal Mini Diorama
  function buildMiniPlantModel() {
    const group = new THREE.Group();

    // Rigid Hexagonal/Prismatic Plant Cell Wall
    const wallGeo = new THREE.BoxGeometry(0.42, 0.32, 0.3);
    const wallEdges = new THREE.EdgesGeometry(wallGeo);
    const wallLine = new THREE.LineSegments(
      wallEdges,
      new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 })
    );
    group.add(wallLine);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      transparent: true,
      opacity: 0.35,
      roughness: 0.3
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    group.add(wallMesh);

    // Large Blue Central Vacuole
    const vacuole = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.2, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65 })
    );
    vacuole.position.set(-0.04, 0, 0);
    group.add(vacuole);

    // Green Chloroplast discs
    const chloroMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2 });
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), chloroMat);
      const angle = (i * Math.PI * 2) / 3;
      c.position.set(Math.cos(angle) * 0.12, 0.06, Math.sin(angle) * 0.09);
      group.add(c);
    }

    // Nucleus pushed to the side
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x5b21b6, emissiveIntensity: 0.6 })
    );
    nucleus.position.set(0.12, 0.04, 0.05);
    group.add(nucleus);

    // Floating Pill Label: "Sel Tumbuhan"
    const labelMesh = createTextPlane('🌿 Sel Tumbuhan', '#4ade80', 0.68, 0.2);
    labelMesh.position.set(0, 0.32, 0);
    group.add(labelMesh);

    return group;
  }

  // Build the 8-station Tabletop Makmal Mini ARSelNel Diorama
  function buildMiniLabGroup() {
    const miniLab = new THREE.Group();
    miniLab.name = 'MiniLabDiorama';

    // 1. Sleek Tabletop Circular/Octagonal Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.76, 0.2, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c1921,
      roughness: 0.3,
      metalness: 0.4
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.1;
    baseMesh.receiveShadow = true;
    miniLab.add(baseMesh);

    // Glowing Neon Turquoise Outer Rim
    const rimGeo = new THREE.TorusGeometry(1.65, 0.03, 8, 48);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.005;
    miniLab.add(rim);

    // Inner Concentric Cyan Accent Ring
    const innerRimGeo = new THREE.TorusGeometry(0.95, 0.018, 8, 36);
    const innerRimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
    innerRim.rotation.x = Math.PI / 2;
    innerRim.position.y = 0.008;
    miniLab.add(innerRim);

    // Futuristic Hexagonal grid on tabletop
    const miniGrid = new THREE.GridHelper(3.0, 10, 0x2dd4bf, 0x133e4d);
    miniGrid.position.y = 0.01;
    miniLab.add(miniGrid);

    // 2. Central ARSelNel Holographic Monument
    const centerEmblem = new THREE.Group();
    centerEmblem.position.set(0, 0.35, 0);

    // Extruded hexagonal border
    const hexShape = new THREE.Shape();
    const hexR = 0.48;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const x = Math.cos(a) * hexR;
      const y = Math.sin(a) * hexR;
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const hexGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    hexGeo.center();
    const hexMesh = new THREE.Mesh(hexGeo, new THREE.MeshStandardMaterial({ color: 0x008080, metalness: 0.7, roughness: 0.2 }));
    centerEmblem.add(hexMesh);

    // Central glowing nucleus core
    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x002020, emissive: 0x2dd4bf, emissiveIntensity: 0.95 })
    );
    coreSphere.position.set(0, 0, 0.05);
    centerEmblem.add(coreSphere);

    // Orbiting Gimbal Rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.016, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    ring1.rotation.x = Math.PI / 3;
    centerEmblem.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.016, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf })
    );
    ring2.rotation.y = Math.PI / 3;
    centerEmblem.add(ring2);

    // Two-sided non-mirrored brand plaque
    const brandPlaque = createBrandTextPlane('ARSelNel', 'MAKMAL MINI SAINS', 1.35, 0.42);
    brandPlaque.position.set(0, 0.68, 0);
    centerEmblem.add(brandPlaque);

    miniLab.add(centerEmblem);

    // 3. Miniature Sel Haiwan & Sel Tumbuhan on the platform
    const miniAnimal = buildMiniAnimalModel();
    miniAnimal.position.set(-0.62, 0.20, 0);
    miniAnimal.userData = {
      isMiniAnimal: true,
      organelleId: 'nucleus',
      pickable: true
    };
    miniLab.add(miniAnimal);

    // Pickable collider for mini animal cell
    const animalCollider = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
    );
    animalCollider.position.set(-0.62, 0.20, 0);
    animalCollider.userData = {
      isMiniAnimal: true,
      organelleId: 'nucleus',
      pickable: true
    };
    miniLab.add(animalCollider);
    arPickableObjects.push(animalCollider);

    const miniPlant = buildMiniPlantModel();
    miniPlant.position.set(0.62, 0.20, 0);
    miniPlant.userData = {
      isMiniPlant: true,
      organelleId: 'chloroplast',
      pickable: true
    };
    miniLab.add(miniPlant);

    // Pickable collider for mini plant cell
    const plantCollider = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.36, 0.34),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false })
    );
    plantCollider.position.set(0.62, 0.20, 0);
    plantCollider.userData = {
      isMiniPlant: true,
      organelleId: 'chloroplast',
      pickable: true
    };
    miniLab.add(plantCollider);
    arPickableObjects.push(plantCollider);

    // 4. 8 Orbital Mini Learning Stations (numbered 1 to 8 around perimeter)
    const stationMeshesMini = [];
    const radius = 1.25;

    State.stations.forEach((stn, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const sx = Math.cos(angle) * radius;
      const sz = Math.sin(angle) * radius;

      const miniStnGroup = new THREE.Group();
      miniStnGroup.position.set(sx, 0.01, sz);

      // Station mini pedestal
      const pedGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.16, 16);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x11232e, roughness: 0.4 });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.y = 0.08;
      miniStnGroup.add(pedMesh);

      // Glowing trim matching station color
      const trimGeo = new THREE.TorusGeometry(0.19, 0.014, 8, 20);
      const trimMat = new THREE.MeshBasicMaterial({ color: stn.colorHex });
      const miniTrim = new THREE.Mesh(trimGeo, trimMat);
      miniTrim.rotation.x = Math.PI / 2;
      miniTrim.position.y = 0.16;
      miniStnGroup.add(miniTrim);

      // Distinct Glowing Station Number Badge (1 to 8) tilted at 45°
      const numBadge = createStationNumberBadge(stn.number, stn.colorHex);
      numBadge.position.set(0, 0.17, 0.14);
      numBadge.rotation.x = -Math.PI / 4;
      numBadge.rotation.y = angle;
      miniStnGroup.add(numBadge);

      // Mini Organelle Model (GLB untuk semua 8 stesen; fallback prosedur)
      const organelleMini = buildStylizedOrganelle(stn.number, stn.colorHex);
      organelleMini.scale.set(0.34, 0.34, 0.34);
      organelleMini.position.set(0, 0.32, 0);
      miniStnGroup.add(organelleMini);

      const miniGLBMap = {
        1: 'nucleus',
        2: 'membrane',
        3: 'cytoplasm',
        4: 'mitochondria',
        5: 'chloroplast',
        6: 'wall',
        7: 'vacuole',
        8: 'er'
      };
      if (miniGLBMap[stn.number]) {
        organelleMini.scale.set(1, 1, 1);
        mountGLBIntoContainer(organelleMini, miniGLBMap[stn.number], 'mini', {
          stationId: stn.id,
          stationNumber: stn.number,
          stationIndex: i,
          organelleId: stn.id,
          isMiniStation: true,
          registerARPickable: true,
          alignOnTable: false
        });
      }

      // Floating Mini Beacon (? or ✓)
      const beaconMini = createBeaconMesh(stn.colorHex);
      beaconMini.scale.set(0.32, 0.32, 0.32);
      beaconMini.position.set(0, 0.62, 0);
      miniStnGroup.add(beaconMini);

      // Floating Selection Label (Hidden initially, appears on select)
      const labelMesh = createTextPlane(`Stesen ${stn.number}: ${stn.title}`, stn.color || '#2dd4bf', 1.0, 0.24);
      labelMesh.position.set(0, 0.82, 0);
      labelMesh.visible = false;
      miniStnGroup.add(labelMesh);

      // Pickable collider mesh covering the station for raycasting
      const clickGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12);
      const clickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false });
      const clickMesh = new THREE.Mesh(clickGeo, clickMat);
      clickMesh.position.y = 0.38;
      clickMesh.userData = {
        isMiniStation: true,
        stationNumber: stn.number,
        stationIndex: i,
        organelleId: stn.id,
        pickable: true
      };
      miniStnGroup.add(clickMesh);
      arPickableObjects.push(clickMesh);

      miniLab.add(miniStnGroup);

      animatedObjects.push({
        update(t) {
          organelleMini.rotation.y = t * 1.1 + i;
          beaconMini.rotation.y = t * 1.4;
          // Keep selection label facing viewer camera
          if (labelMesh.visible && camera) {
            labelMesh.quaternion.copy(camera.quaternion);
          }
        }
      });

      stationMeshesMini.push({
        stationNumber: stn.number,
        group: miniStnGroup,
        beacon: beaconMini,
        label: labelMesh
      });
    });

    // 5. Soft Turquoise/Emerald Localized Lighting
    const miniLight = new THREE.PointLight(0x2dd4bf, 0.85, 5);
    miniLight.position.set(0, 1.2, 0);
    miniLab.add(miniLight);

    animatedObjects.push({
      update(t) {
        ring1.rotation.z = t * 0.7;
        ring2.rotation.x = -t * 0.6;
        centerEmblem.rotation.y = t * 0.35;
        miniAnimal.rotation.y = t * 0.4;
        miniPlant.rotation.y = -t * 0.4;
      }
    });

    miniLab.userData = { stationMeshesMini };
    return miniLab;
  }

  // Load Animal Cell GLB Model
  function loadAnimalCellGLB(holder) {
    // Show instant procedural model while GLB downloads
    buildProceduralAnimalCell(holder);

    if (cachedGltfScenes.animal) {
      setupAnimalCellInstance(cachedGltfScenes.animal, holder);
      return;
    }

    if (typeof THREE.GLTFLoader === 'undefined') return;

    const loader = new THREE.GLTFLoader();
    loader.load(
      CELL_MODELS.animal,
      gltf => {
        cachedGltfScenes.animal = gltf.scene;
        setupAnimalCellInstance(gltf.scene, holder);
      },
      undefined,
      err => {
        console.warn('Animal cell GLB load notice, using procedural animal cell:', err);
      }
    );
  }

  function setupAnimalCellInstance(sourceScene, holder) {
    holder.clear();
    const instance = sourceScene.clone(true);

    const bounds = new THREE.Box3().setFromObject(instance);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.4;
    const fit = targetSize / maxDim;

    const subHolder = new THREE.Group();
    subHolder.scale.setScalar(fit);
    subHolder.position.copy(center).multiplyScalar(-fit);
    subHolder.add(instance);
    holder.add(subHolder);

    instance.traverse(node => {
      if (!node.isMesh) return;

      let id = '';
      for (let p = node; p && p !== instance.parent; p = p.parent) {
        if (ANIMAL_MESH_MAP[p.name]) {
          id = ANIMAL_MESH_MAP[p.name];
          break;
        }
      }
      if (!id && ANIMAL_MESH_MAP[node.name]) {
        id = ANIMAL_MESH_MAP[node.name];
      }

      node.userData = {
        ...node.userData,
        id,
        pickable: !!id,
        organelleId: id
      };

      const cloneM = m => {
        const c = m.clone();
        c.side = THREE.DoubleSide;
        return c;
      };
      node.material = Array.isArray(node.material) ? node.material.map(cloneM) : cloneM(node.material);
      if (id) {
        arPickableObjects.push(node);
      }
    });
  }

  // High quality procedural Animal Cell fallback
  function buildProceduralAnimalCell(holder) {
    holder.clear();
    const cellGroup = new THREE.Group();

    // 1. Outer Membrane & Cytoplasm with 90° Cutaway
    const outerGeo = new THREE.SphereGeometry(1.2, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const membraneMesh = new THREE.Mesh(outerGeo, outerMat);
    membraneMesh.userData = { id: 'membrane', pickable: true };
    cellGroup.add(membraneMesh);
    arPickableObjects.push(membraneMesh);

    // Inner Cytoplasm Jellied Core
    const cytoGeo = new THREE.SphereGeometry(1.15, 28, 20, 0, Math.PI * 1.5, 0, Math.PI);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
    cytoMesh.userData = { id: 'cytoplasm', pickable: true };
    cellGroup.add(cytoMesh);
    arPickableObjects.push(cytoMesh);

    // 2. Central Nucleus with Cutaway
    const nucGeo = new THREE.SphereGeometry(0.42, 24, 20, 0, Math.PI * 1.5, 0, Math.PI);
    const nucMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3, side: THREE.DoubleSide });
    const nucMesh = new THREE.Mesh(nucGeo, nucMat);
    nucMesh.position.set(-0.1, 0.2, -0.1);
    nucMesh.userData = { id: 'nucleus', pickable: true };
    cellGroup.add(nucMesh);
    arPickableObjects.push(nucMesh);

    // Dense Nucleolus core
    const nucCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0x86198f, roughness: 0.2 })
    );
    nucCore.position.set(-0.1, 0.2, -0.1);
    nucCore.userData = { id: 'nucleus', pickable: true };
    cellGroup.add(nucCore);
    arPickableObjects.push(nucCore);

    // 3. Mitochondria (4 sausage shapes with cristae)
    const mitoPositions = [
      [0.65, -0.35, 0.2],
      [-0.55, -0.45, 0.3],
      [0.5, 0.45, -0.4],
      [-0.6, 0.4, 0.35]
    ];
    mitoPositions.forEach((pos, idx) => {
      const mito = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 })
      );
      mito.position.set(...pos);
      mito.rotation.set(idx, idx * 0.5, idx * 0.3);
      mito.userData = { id: 'mitochondria', pickable: true };
      cellGroup.add(mito);
      arPickableObjects.push(mito);
    });

    // 4. Vacuoles (small spheres)
    const vacPositions = [[0.65, 0.3, 0.45], [-0.7, -0.2, -0.45]];
    vacPositions.forEach(pos => {
      const vac = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.75 })
      );
      vac.position.set(...pos);
      vac.userData = { id: 'vacuole', pickable: true };
      cellGroup.add(vac);
      arPickableObjects.push(vac);
    });

    // 5. Centrioles & Lysosomes
    const cenMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.26, 10),
      new THREE.MeshStandardMaterial({ color: 0xfacc15 })
    );
    cenMesh.position.set(-0.4, -0.5, 0.1);
    cenMesh.userData = { id: 'centrioles', pickable: true };
    cellGroup.add(cenMesh);
    arPickableObjects.push(cenMesh);

    const lysoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xec4899 })
    );
    lysoMesh.position.set(0.3, -0.5, -0.4);
    lysoMesh.userData = { id: 'lysosome', pickable: true };
    cellGroup.add(lysoMesh);
    arPickableObjects.push(lysoMesh);

    holder.add(cellGroup);
  }

  // Load Plant Cell GLB Model
  function loadPlantCellGLB(holder) {
    buildProceduralPlantCell(holder);

    if (cachedGltfScenes.plant) {
      setupPlantCellInstance(cachedGltfScenes.plant, holder);
      return;
    }

    if (typeof THREE.GLTFLoader === 'undefined') return;

    const loader = new THREE.GLTFLoader();
    loader.load(
      CELL_MODELS.plant,
      gltf => {
        cachedGltfScenes.plant = gltf.scene;
        setupPlantCellInstance(gltf.scene, holder);
      },
      undefined,
      err => {
        console.warn('Plant cell GLB load notice, using procedural plant cell:', err);
      }
    );
  }

  function setupPlantCellInstance(sourceScene, holder) {
    holder.clear();
    const instance = sourceScene.clone(true);

    const bounds = new THREE.Box3().setFromObject(instance);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.4;
    const fit = targetSize / maxDim;

    const subHolder = new THREE.Group();
    subHolder.scale.setScalar(fit);
    subHolder.position.copy(center).multiplyScalar(-fit);
    subHolder.add(instance);
    holder.add(subHolder);

    instance.traverse(node => {
      if (!node.isMesh) return;
      if (node.name === 'Labels') {
        node.visible = false;
      }
      const cloneM = m => {
        const c = m.clone();
        c.side = THREE.DoubleSide;
        if (c.map) c.map.encoding = THREE.sRGBEncoding;
        return c;
      };
      node.material = Array.isArray(node.material) ? node.material.map(cloneM) : cloneM(node.material);
    });

    PLANT_HOTSPOTS.forEach(spot => {
      const hitGeo = new THREE.SphereGeometry(spot.radius, 16, 12);
      const hitMat = new THREE.MeshBasicMaterial({
        color: ORGANELLE_DATA[spot.id] ? ORGANELLE_DATA[spot.id].colorHex : 0x10b981,
        transparent: true,
        opacity: 0.001,
        depthWrite: false
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(...spot.pos);
      hitMesh.userData = {
        id: spot.id,
        organelleId: spot.id,
        pickable: true
      };
      subHolder.add(hitMesh);
      arPickableObjects.push(hitMesh);
    });
  }

  // High quality procedural Plant Cell fallback
  function buildProceduralPlantCell(holder) {
    holder.clear();
    const plantGroup = new THREE.Group();

    // 1. Rigid Hexagonal Prism Cell Wall
    const wallGeo = new THREE.BoxGeometry(2.3, 1.7, 1.4);
    const wallEdges = new THREE.EdgesGeometry(wallGeo);
    const wallLine = new THREE.LineSegments(wallEdges, new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }));
    plantGroup.add(wallLine);

    const wallMesh = new THREE.Mesh(
      wallGeo,
      new THREE.MeshStandardMaterial({ color: 0x064e3b, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    wallMesh.userData = { id: 'wall', pickable: true };
    plantGroup.add(wallMesh);
    arPickableObjects.push(wallMesh);

    // 2. Inner Plasma Membrane
    const memGeo = new THREE.BoxGeometry(2.18, 1.58, 1.28);
    const memMesh = new THREE.Mesh(
      memGeo,
      new THREE.MeshStandardMaterial({ color: 0x34d399, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    memMesh.userData = { id: 'membrane', pickable: true };
    plantGroup.add(memMesh);
    arPickableObjects.push(memMesh);

    // 3. Huge Central Vacuole (Key distinctive feature of plant cell)
    const vacGeo = new THREE.SphereGeometry(0.55, 24, 20);
    vacGeo.scale(1.2, 0.85, 0.9);
    const vacMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65, roughness: 0.1 });
    const vacMesh = new THREE.Mesh(vacGeo, vacMat);
    vacMesh.position.set(-0.25, 0, 0);
    vacMesh.userData = { id: 'vacuole', pickable: true };
    plantGroup.add(vacMesh);
    arPickableObjects.push(vacMesh);

    // 4. Plant Nucleus (Pushed to the side by large vacuole)
    const nucMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 })
    );
    nucMesh.position.set(0.65, 0.25, 0.1);
    nucMesh.userData = { id: 'nucleus', pickable: true };
    plantGroup.add(nucMesh);
    arPickableObjects.push(nucMesh);

    // 5. Chloroplasts (Green lenses containing thylakoids)
    const chloroPositions = [
      [-0.6, 0.5, 0.35],
      [0.45, -0.45, 0.35],
      [-0.75, -0.4, -0.2],
      [0.65, 0.45, -0.3],
      [-0.1, 0.55, -0.35]
    ];
    chloroPositions.forEach(pos => {
      const chloro = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.25 })
      );
      chloro.position.set(...pos);
      chloro.rotation.x = Math.PI / 4;
      chloro.userData = { id: 'chloroplast', pickable: true };
      plantGroup.add(chloro);
      arPickableObjects.push(chloro);
    });

    // 6. Mitochondria
    const mito = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xf97316 })
    );
    mito.position.set(0.4, -0.35, -0.25);
    mito.rotation.set(0.4, 0.6, 0.2);
    mito.userData = { id: 'mitochondria', pickable: true };
    plantGroup.add(mito);
    arPickableObjects.push(mito);

    holder.add(plantGroup);
  }

  // ==============================================================================
  // AR MODEL SWITCHING, CAMERA FRAMING & STATIONS DRAWER
  // ==============================================================================

  // Switch between 8 World-Locked AR Stations, Marker AR, Animal Cell, Plant Cell and Makmal Mini
  function switchARModel(modelType) {
    if (modelType === 'marker') {
      selectMode('marker-ar');
      return;
    }

    if (modelType === 'world') {
      arState.activeModel = 'world';
      if (DOM.arBtnWorld) DOM.arBtnWorld.classList.add('active');
      if (DOM.arBtnMarker) DOM.arBtnMarker.classList.remove('active');
      if (DOM.arBtnAnimal) DOM.arBtnAnimal.classList.remove('active');
      if (DOM.arBtnPlant) DOM.arBtnPlant.classList.remove('active');
      if (DOM.arBtnMinilab) DOM.arBtnMinilab.classList.remove('active');

      if (arObjectGroup) arObjectGroup.visible = false;
      if (State.mode === 'marker-ar') {
        selectMode('camera-ar');
        return;
      }
      startARWorldExploration();
      alertToast('🧭 Mod 8 Stesen AR Dunia Aktif: Pusing kiri, kanan, depan & belakang!');
      return;
    }

    // Jika berada dalam Mod C (World-Locked AR) dan murid menekan Sel Haiwan atau Sel Tumbuhan,
    // pusingkan pandangan ke stesen dunia tersebut (Depan 0° atau Belakang 180°) tanpa meruntuhkan 8 stesen dunia!
    if (arWorldState.active && (modelType === 'animal' || modelType === 'plant')) {
      arState.activeModel = modelType;
      if (DOM.arBtnWorld) DOM.arBtnWorld.classList.remove('active');
      if (DOM.arBtnMarker) DOM.arBtnMarker.classList.remove('active');
      if (DOM.arBtnAnimal) DOM.arBtnAnimal.classList.toggle('active', modelType === 'animal');
      if (DOM.arBtnPlant) DOM.arBtnPlant.classList.toggle('active', modelType === 'plant');
      if (DOM.arBtnMinilab) DOM.arBtnMinilab.classList.remove('active');

      if (arObjectGroup) arObjectGroup.visible = false;
      arWorldState.stationGroups.forEach(g => { g.visible = true; });

      if (modelType === 'animal') {
        selectRadarTargetStation(7, true); // Stesen 8: Retikulum Endoplasma & Sel (Hadapan 0°, Elevasi -12°)
        selectAROrganelle('animal', 8);
        alertToast('🐾 Menghadap Stesen 8: Sel Haiwan & Retikulum Endoplasma (Arah Hadapan 0°)');
      } else {
        selectRadarTargetStation(6, true); // Stesen 7: Vakuol & Sel Tumbuhan (Belakang 180°, Elevasi 0°)
        selectAROrganelle('plant', 6);
        alertToast('🌿 Menghadap Stesen 7: Vakuol & Sel Tumbuhan (Arah Belakang 180°)');
      }
      return;
    }

    // Jika pengguna memilih 'minilab' secara eksplisit (atau berada luar mod world AR)
    arState.activeModel = modelType;

    if (DOM.arBtnWorld) DOM.arBtnWorld.classList.toggle('active', modelType === 'world');
    if (DOM.arBtnMarker) DOM.arBtnMarker.classList.toggle('active', modelType === 'marker');
    if (DOM.arBtnAnimal) DOM.arBtnAnimal.classList.toggle('active', modelType === 'animal');
    if (DOM.arBtnPlant) DOM.arBtnPlant.classList.toggle('active', modelType === 'plant');
    if (DOM.arBtnMinilab) DOM.arBtnMinilab.classList.toggle('active', modelType === 'minilab');

    if (modelType === 'minilab') {
      // Sembunyikan 8 stesen keliling sementara apabila meninjau meja Makmal Mini
      arWorldState.active = false;
      arWorldState.stationGroups.forEach(g => { g.visible = false; });
      if (arObjectGroup) arObjectGroup.visible = true;
    }

    if (arAnimalHolder) arAnimalHolder.visible = (modelType === 'animal');
    if (arPlantHolder) arPlantHolder.visible = (modelType === 'plant');
    if (arMiniLabHolder) arMiniLabHolder.visible = (modelType === 'minilab');

    // Rebuild pickable objects array for active model
    arPickableObjects = [];
    let activeHolder = null;
    if (modelType === 'animal' && arAnimalHolder) {
      activeHolder = arAnimalHolder;
      arAnimalHolder.traverse(n => { if (n.userData && n.userData.pickable) arPickableObjects.push(n); });
    } else if (modelType === 'plant' && arPlantHolder) {
      activeHolder = arPlantHolder;
      arPlantHolder.traverse(n => { if (n.userData && n.userData.pickable) arPickableObjects.push(n); });
    } else if (modelType === 'minilab' && arMiniLabHolder) {
      activeHolder = arMiniLabHolder;
      arMiniLabHolder.traverse(n => { if (n.userData && n.userData.pickable) arPickableObjects.push(n); });
    }

    // Auto-frame active model with aspect-ratio awareness
    if (activeHolder) {
      frameARObject(activeHolder);
    }

    // Close organelle card when switching model
    if (DOM.arOrganelleCard) DOM.arOrganelleCard.style.display = 'none';

    // If stations drawer is open, re-render to reflect new model context
    if (DOM.arStationsDrawer && DOM.arStationsDrawer.classList.contains('open')) {
      renderARStationsDrawer();
    }

    const modelNames = {
      animal: '🐾 Model Sel Haiwan 3D Aktif',
      plant: '🌿 Model Sel Tumbuhan 3D Aktif',
      minilab: '🏛️ Makmal Mini ARSelNel 3D Aktif'
    };
    alertToast(modelNames[modelType] || 'Model Ditukar');
  }

  // Aspect-ratio aware framing for AR Models (prevents clipping on iPad portrait/landscape)
  function frameARObject(targetObject) {
    if (!targetObject || !camera) return;

    if (arObjectGroup) {
      arObjectGroup.position.set(0, 0, 0);
      arObjectGroup.rotation.set(0.12, 0, 0);
      arObjectGroup.scale.set(1.0, 1.0, 1.0);
    }

    // Compute precise bounding box
    const bbox = new THREE.Box3().setFromObject(targetObject);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 1.2);
    const fovRad = (camera.fov * Math.PI) / 180;
    let dist = Math.abs(maxDim / 2 / Math.tan(fovRad / 2));

    // iPad / Tablet aspect ratio compensation (e.g. portrait aspect < 1.0)
    const aspect = camera.aspect || (window.innerWidth / window.innerHeight);
    if (aspect < 1.0) {
      dist = dist / aspect;
    }

    // 35% comfortable padding so model doesn't touch HUD or edges
    dist = Math.max(2.6, dist * 1.35);

    camera.position.set(0, maxDim * 0.28, dist);
    camera.lookAt(0, 0, 0);
  }

  // Reset AR Model view or recalibrate World AR heading
  function resetARView() {
    if (arWorldState.active) {
      arWorldState.focusedStationScale = 1.0;
      arWorldState.stationGroups.forEach(g => g.scale.setScalar(1.0));
      calibrateARWorldHeading();
      return;
    }

    if (arObjectGroup) {
      arObjectGroup.position.set(0, 0, 0);
      arObjectGroup.rotation.set(0.12, 0, 0);
      arObjectGroup.scale.set(1.0, 1.0, 1.0);
    }
    arState.autoRotate = false;

    let activeHolder = arMiniLabHolder;
    if (arState.activeModel === 'animal') activeHolder = arAnimalHolder;
    else if (arState.activeModel === 'plant') activeHolder = arPlantHolder;

    if (activeHolder) {
      frameARObject(activeHolder);
    }

    SoundFX.interact();
    alertToast('🎯 Paparan AR Disetkan Semula');
  }

  // Toggle Stations Drawer (Slide-out panel for 8 stations)
  function toggleStationsDrawer(forceOpen) {
    if (!DOM.arStationsDrawer) return;
    const shouldOpen = (typeof forceOpen === 'boolean') 
      ? forceOpen 
      : !DOM.arStationsDrawer.classList.contains('open');

    DOM.arStationsDrawer.classList.toggle('open', shouldOpen);
    if (DOM.arStationsToggle) DOM.arStationsToggle.classList.toggle('active', shouldOpen);

    if (shouldOpen) {
      renderARStationsDrawer();
      SoundFX.interact();
    }
  }

  // Render 8 Learning Stations in Slide-out Drawer
  function renderARStationsDrawer() {
    if (DOM.arStnDoneCount) {
      DOM.arStnDoneCount.textContent = `${State.completedStations.size}/8`;
    }
    if (!DOM.arDrawerList) return;
    DOM.arDrawerList.innerHTML = '';

    // Susun mengikut 8 Stesen Dunia AR supaya murid tahu arah kompas, elevasi & ID Kad Marker setiap stesen
    AR_WORLD_STATIONS.forEach((worldCfg, idx) => {
      const stn = State.stations[worldCfg.stationNumber - 1] || State.stations[0];
      const isDone = State.completedStations.has(worldCfg.stationNumber);
      const isSelected = arState.selectedOrganelle === worldCfg.stationKey || arState.selectedOrganelle === stn.id;
      const elevStr = worldCfg.elevationDeg > 0 ? `+${worldCfg.elevationDeg}°` : `${worldCfg.elevationDeg}°`;

      const stationColor = stn.color || '#' + worldCfg.color.toString(16).padStart(6, '0');
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `cq-drawer-station-card ${isSelected ? 'active' : ''} ${isDone ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="cq-drawer-stn-num" style="background: ${stationColor}25; border: 1.5px solid ${stationColor}; color: ${stationColor};">${worldCfg.stationNumber}</div>
        <div class="cq-drawer-stn-info">
          <strong>${worldCfg.icon || '📍'} Stesen ${worldCfg.stationNumber}: ${worldCfg.label}</strong>
          <span>🧭 Arah: ${worldCfg.directionName} (${worldCfg.azimuthDeg}°, Elevasi ${elevStr}) • Kad #${worldCfg.markerId}</span>
        </div>
        <div class="cq-drawer-stn-status ${isDone ? 'done' : ''}">
          ${isDone ? '✓ Lencana' : 'Belum'}
        </div>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (arWorldState.active && arWorldState.subMode === 'orientation') {
          selectRadarTargetStation(idx, true);
        }
        selectAROrganelle(worldCfg.stationKey, worldCfg.stationNumber);
        toggleStationsDrawer(false);
      });

      DOM.arDrawerList.appendChild(item);
    });
  }

  // Toggle Minimize / Expand state of Organelle Card
  function toggleOrganelleCardMinimize(forceMin) {
    if (!DOM.arOrganelleCard) return;
    const shouldMin = (typeof forceMin === 'boolean')
      ? forceMin
      : !DOM.arOrganelleCard.classList.contains('minimized');

    DOM.arOrganelleCard.classList.toggle('minimized', shouldMin);
    if (DOM.arCardMinIcon) {
      DOM.arCardMinIcon.textContent = shouldMin ? 'expand_less' : 'expand_more';
    }
    // Fasa A.3: Selaraskan keterlihatan arahan tengah dengan keadaan minimum kad
    if (DOM.arSingleInstruction) {
      DOM.arSingleInstruction.style.opacity = shouldMin ? '1' : '0';
    }
    SoundFX.interact();
  }

  // Select an organelle in AR, display card & pulse highlight
  function selectAROrganelle(organelleId, stationNumber) {
    arState.selectedOrganelle = organelleId;
    hideARStationDetectedBanner();

    const info = ORGANELLE_DATA[organelleId] || {};
    const stnIdx = (stationNumber ? stationNumber - 1 : (info.stationNumber ? info.stationNumber - 1 : 0));
    const stnData = State.stations[stnIdx] || State.stations[0];
    const worldCfg = AR_WORLD_STATIONS.find(w => w.stationKey === organelleId || w.stationNumber === stnData.number);

    const organelleName = info.name || worldCfg?.label || stnData.organelle || stnData.title;
    const organelleIcon = info.icon || worldCfg?.icon || stnData.icon || '🧬';
    const organelleDesc = info.description || stnData.description;
    const isCompleted = State.completedStations.has(stnData.number);

    // In Makmal Mini, update mini station label plane visibility:
    if (arState.activeModel === 'minilab' && arMiniLabHolder) {
      arMiniLabHolder.traverse(m => {
        if (m.userData && m.userData.isStationLabel) {
          m.visible = (m.userData.stationNumber === stnData.number);
        }
      });
    }

    if (DOM.arOrganelleCard) {
      if (DOM.arCardIcon) DOM.arCardIcon.textContent = organelleIcon;
      if (DOM.arCardTitle) DOM.arCardTitle.textContent = organelleName;
      if (DOM.arCardBadge) {
        const dirInfo = worldCfg ? ` • Arah ${worldCfg.directionName}` : '';
        DOM.arCardBadge.textContent = isCompleted 
          ? `Lencana Stesen ${stnData.number} Selesai ✓${dirInfo}` 
          : `Stesen ${worldCfg ? worldCfg.slotNumber : stnData.number}${dirInfo} • Sains Tingkatan 1`;
        DOM.arCardBadge.classList.toggle('completed', isCompleted);
      }
      if (DOM.arCardDesc) DOM.arCardDesc.textContent = organelleDesc;

      // Ensure card is expanded when new organelle is selected
      toggleOrganelleCardMinimize(false);
      DOM.arOrganelleCard.style.display = 'block';

      // Fasa A.3: Sembunyikan arahan bawah tengah secara anggun untuk menghapuskan sebarang kemungkinan pertindihan HUD
      if (DOM.arSingleInstruction) {
        DOM.arSingleInstruction.style.opacity = '0';
        DOM.arSingleInstruction.style.pointerEvents = 'none';
      }

      if (DOM.arCardSpeechBtn) {
        DOM.arCardSpeechBtn.onclick = (e) => {
          e.stopPropagation();
          speakExplanation(`${organelleName}. ${organelleDesc}`);
        };
      }
      if (DOM.arCardQuizBtn) {
        DOM.arCardQuizBtn.onclick = (e) => {
          e.stopPropagation();
          openStationModal(stnIdx);
        };
      }
      if (DOM.arCardFocusBtn) {
        DOM.arCardFocusBtn.onclick = (e) => {
          e.stopPropagation();
          if (arWorldState.active && worldCfg) {
            if (arWorldState.subMode === 'orientation') {
              lookAtARHeading(worldCfg.azimuthDeg, worldCfg.elevationDeg);
            }
            // Toggle zoom / scale inspection on the world-space station
            const stnGroup = arWorldState.stationGroups.find(g => g.userData.stationConfig.stationKey === worldCfg.stationKey);
            if (stnGroup) {
              const nextScale = stnGroup.scale.x > 1.2 ? 1.0 : 1.45;
              arWorldState.focusedStationScale = nextScale;
              arWorldState.focusedStationIdx = stnGroup.userData.stationIndex;
              stnGroup.scale.setScalar(nextScale);
              alertToast(nextScale > 1.2 ? `🔍 Model ${worldCfg.label} Diperbesar (1.45x)` : `🔍 Saiz Model ${worldCfg.label} Asal (1.0x)`);
            }
          }
          pulseHighlightMesh(organelleId);
        };
      }
    }

    // Refresh active item styling in stations drawer
    if (DOM.arDrawerList) {
      DOM.arDrawerList.querySelectorAll('.cq-drawer-station-card').forEach((item, idx) => {
        const cfg = AR_WORLD_STATIONS[idx];
        item.classList.toggle('active', cfg ? cfg.stationNumber === stnData.number : (idx + 1) === stnData.number);
      });
    }

    pulseHighlightMesh(organelleId);
    SoundFX.interact();
  }

  // Pulse glowing highlight on clicked 3D organelle
  function pulseHighlightMesh(organelleId) {
    let targetMeshes = [];

    if (arWorldState.active) {
      arWorldState.stationGroups.forEach(group => {
        if (group.userData && group.userData.stationConfig && group.userData.stationConfig.stationKey === organelleId) {
          group.traverse(m => {
            if (m.isMesh && m.material && m.material.emissive) targetMeshes.push(m);
          });
        }
      });
    } else if (arMarkerState.active) {
      arMarkerState.anchors.forEach(anchor => {
        if (anchor.userData && anchor.userData.stationConfig && anchor.userData.stationConfig.stationKey === organelleId) {
          anchor.traverse(m => {
            if (m.isMesh && m.material && m.material.emissive) targetMeshes.push(m);
          });
        }
      });
    } else if (arState.activeModel === 'animal' && arAnimalHolder) {
      arAnimalHolder.traverse(m => {
        if (m.isMesh && m.userData && m.userData.id === organelleId) targetMeshes.push(m);
      });
    } else if (arState.activeModel === 'plant' && arPlantHolder) {
      arPlantHolder.traverse(m => {
        if (m.isMesh && m.userData && m.userData.id === organelleId) targetMeshes.push(m);
      });
    } else if (arState.activeModel === 'minilab' && arMiniLabHolder) {
      const stationNum = ORGANELLE_DATA[organelleId]?.stationNumber;
      arMiniLabHolder.traverse(m => {
        if (m.isMesh && m.userData && (m.userData.stationNumber === stationNum || m.userData.organelleId === organelleId)) {
          targetMeshes.push(m);
        }
      });
    }

    targetMeshes.forEach(m => {
      if (m.material && m.material.emissive) {
        if (m.userData.__isPulsing) return; // Lindungi daripada dipanggil berganda
        m.userData.__isPulsing = true;

        if (m.userData.__origEmissiveHex === undefined) {
          m.userData.__origEmissiveHex = m.material.emissive.getHex();
          m.userData.__origEmissiveIntensity = (m.material.emissiveIntensity !== undefined) ? m.material.emissiveIntensity : 0;
        }

        m.material.emissive.setHex(0x2dd4bf);
        m.material.emissiveIntensity = 1.5;

        setTimeout(() => {
          if (m.material && m.material.emissive) {
            m.material.emissive.setHex(m.userData.__origEmissiveHex);
            m.material.emissiveIntensity = m.userData.__origEmissiveIntensity;
          }
          m.userData.__isPulsing = false;
        }, 1200);
      }
    });
  }

  // Web Speech API Text-to-Speech in Bahasa Melayu
  function speakExplanation(text) {
    if (!('speechSynthesis' in window)) {
      SoundFX.interact();
      alertToast('🔊 ' + text);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ms-MY';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const malayVoice = voices.find(v => v.lang.startsWith('ms') || v.lang.startsWith('id'));
      if (malayVoice) utterance.voice = malayVoice;
      window.speechSynthesis.speak(utterance);
      SoundFX.interact();
    } catch (_) {
      SoundFX.interact();
    }
  }

  // Setup Touch Look-Around (World AR), Pinch Zoom Inspection & Raycast Tap Gestures
  function setupARGestures() {
    if (!renderer || !renderer.domElement) return;
    const dom = renderer.domElement;

    const activePointers = new Map();
    let initialPinchDist = 0;
    let initialPinchCenter = { x: 0, y: 0 };
    let initialScale = 1.0;
    let initialPos = new THREE.Vector3();

    dom.addEventListener('pointerdown', e => {
      if (State.mode !== 'camera-ar' && State.mode !== 'marker-ar' && State.mode !== 'ar') return;
      if (e.target !== dom) return;

      activePointers.set(e.pointerId, {
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        startTime: Date.now()
      });

      if (activePointers.size === 1 && arObjectGroup && arObjectGroup.visible) {
        arState.autoRotate = false;
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        initialPinchDist = Math.hypot(pts[0].currentX - pts[1].currentX, pts[0].currentY - pts[1].currentY);
        initialPinchCenter = {
          x: (pts[0].currentX + pts[1].currentX) / 2,
          y: (pts[0].currentY + pts[1].currentY) / 2
        };
        if (arWorldState.active) {
          initialScale = arWorldState.focusedStationScale || 1.0;
        } else if (arObjectGroup) {
          initialScale = arObjectGroup.scale.x;
          initialPos.copy(arObjectGroup.position);
        }
      }
    });

    dom.addEventListener('pointermove', e => {
      if (State.mode !== 'camera-ar' && State.mode !== 'marker-ar' && State.mode !== 'ar') return;
      if (!activePointers.has(e.pointerId)) return;

      const p = activePointers.get(e.pointerId);
      const prevX = p.currentX;
      const prevY = p.currentY;
      p.currentX = e.clientX;
      p.currentY = e.clientY;

      // MOD C (World-Locked AR Exploration):
      // 1-finger drag rotates camera view 360° around the world; stations remain fixed in world coordinates!
      if (arWorldState.active && (!arObjectGroup || !arObjectGroup.visible)) {
        const calPrompt = document.getElementById('ar-world-calibration-ui');
        if (calPrompt && calPrompt.style.display !== 'none') calPrompt.style.display = 'none';
        if (activePointers.size === 1 && arWorldState.subMode === 'orientation') {
          const dx = e.clientX - prevX;
          const dy = e.clientY - prevY;
          arWorldState.manualYawDeg = (arWorldState.manualYawDeg - dx * 0.28 + 360) % 360;
          arWorldState.manualPitchDeg = Math.max(-40, Math.min(40, (arWorldState.manualPitchDeg || 0) - dy * 0.22));
          updateARWorldCamera();
        } else if (activePointers.size === 2 && initialPinchDist > 0) {
          const pts = Array.from(activePointers.values());
          const currentDist = Math.hypot(pts[0].currentX - pts[1].currentX, pts[0].currentY - pts[1].currentY);
          const scaleFactor = currentDist / initialPinchDist;
          const nextScale = Math.max(0.65, Math.min(2.2, initialScale * scaleFactor));
          arWorldState.focusedStationScale = nextScale;
          if (arWorldState.lastDetectedIdx >= 0 && arWorldState.stationGroups[arWorldState.lastDetectedIdx]) {
            arWorldState.stationGroups[arWorldState.lastDetectedIdx].scale.setScalar(nextScale);
          }
        }
        return;
      }

      if (!arObjectGroup || !arObjectGroup.visible) return;

      if (activePointers.size === 1) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        arObjectGroup.rotation.y += dx * 0.007;
        arObjectGroup.rotation.x = Math.max(-1.1, Math.min(1.1, arObjectGroup.rotation.x + dy * 0.007));
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const currentDist = Math.hypot(pts[0].currentX - pts[1].currentX, pts[0].currentY - pts[1].currentY);

        if (initialPinchDist > 0) {
          const scaleFactor = currentDist / initialPinchDist;
          const nextScale = Math.max(0.35, Math.min(2.8, initialScale * scaleFactor));
          arObjectGroup.scale.setScalar(nextScale);
        }

        const currentCenter = {
          x: (pts[0].currentX + pts[1].currentX) / 2,
          y: (pts[0].currentY + pts[1].currentY) / 2
        };
        const panDx = (currentCenter.x - initialPinchCenter.x) * 0.003;
        const panDy = (currentCenter.y - initialPinchCenter.y) * 0.003;
        arObjectGroup.position.x = initialPos.x + panDx;
        arObjectGroup.position.y = Math.max(-1.5, Math.min(1.5, initialPos.y - panDy));
      }
    });

    const onPointerEnd = e => {
      if (!activePointers.has(e.pointerId)) return;
      const p = activePointers.get(e.pointerId);
      const dist = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);
      const duration = Date.now() - p.startTime;

      activePointers.delete(e.pointerId);

      // Tap / Click Detection (< 12px move, < 450ms duration)
      if (dist < 12 && duration < 450 && (State.mode === 'camera-ar' || State.mode === 'marker-ar' || State.mode === 'ar')) {
        if (arWorldState.active || arMarkerState.active) {
          const hitWorld = handleARWorldTap(e.clientX, e.clientY);
          if (!hitWorld && arObjectGroup && arObjectGroup.visible) {
            handleARTap(e.clientX, e.clientY);
          }
        } else {
          handleARTap(e.clientX, e.clientY);
        }
      }

      if (activePointers.size === 1) {
        const remaining = activePointers.values().next().value;
        remaining.startX = remaining.currentX;
        remaining.startY = remaining.currentY;
      }
    };

    dom.addEventListener('pointerup', onPointerEnd);
    dom.addEventListener('pointercancel', onPointerEnd);

    // Mouse wheel zoom for desktop inspection
    dom.addEventListener('wheel', e => {
      if (State.mode !== 'camera-ar' && State.mode !== 'marker-ar' && State.mode !== 'ar') return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;

      if (arWorldState.active && (!arObjectGroup || !arObjectGroup.visible)) {
        const nextScale = Math.max(0.65, Math.min(2.2, (arWorldState.focusedStationScale || 1.0) * factor));
        arWorldState.focusedStationScale = nextScale;
        if (arWorldState.lastDetectedIdx >= 0 && arWorldState.stationGroups[arWorldState.lastDetectedIdx]) {
          arWorldState.stationGroups[arWorldState.lastDetectedIdx].scale.setScalar(nextScale);
        }
        return;
      }

      if (!arObjectGroup || !arObjectGroup.visible) return;
      const nextScale = Math.max(0.35, Math.min(2.8, arObjectGroup.scale.x * factor));
      arObjectGroup.scale.setScalar(nextScale);
    }, { passive: false });
  }

  // Handle Raycast Tap in AR scene
  function handleARTap(clientX, clientY) {
    if (!renderer || !camera || !arPickableObjects.length) return;
    const dom = renderer.domElement;
    const rect = dom.getBoundingClientRect();

    arPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    arPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    arRaycaster.setFromCamera(arPointer, camera);

    const hits = arRaycaster.intersectObjects(arPickableObjects, true);
    if (hits.length > 0) {
      let hitObj = null;
      for (const h of hits) {
        if (h.object && h.object.userData && (h.object.userData.isMiniStation || h.object.userData.id)) {
          hitObj = h.object;
          break;
        }
      }
      if (!hitObj) hitObj = hits[0].object;

      if (hitObj && hitObj.userData) {
        if (hitObj.userData.isMiniStation) {
          const stnNum = hitObj.userData.stationNumber;
          const stn = State.stations[stnNum - 1];
          if (stn) selectAROrganelle(stn.id, stnNum);
        } else if (hitObj.userData.id === 'mini_animal') {
          switchARModel('animal');
        } else if (hitObj.userData.id === 'mini_plant') {
          switchARModel('plant');
        } else if (hitObj.userData.id) {
          const orgId = hitObj.userData.id;
          const info = ORGANELLE_DATA[orgId];
          selectAROrganelle(orgId, info?.stationNumber);
        }
      }
    }
  }

  // ==============================================================================
  // LOBI MAKMAL SAINS ARSELNEL & GALERI PENDIDIKAN SEL
  // ==============================================================================

  let isLobbyActive = false;

  // Stubs for backwards-compatibility
  const GALLERY_CONTENT = {};

  function openScienceLabLobby() {
    isLobbyActive = true;

    // 1. Matikan sebarang penstriman kamera dan pengesan orientasi dengan bersih (Zero Camera in Lobby)
    stopInteractiveCamera();
    teardownDeviceOrientation();
    stopARWorldExploration();
    stopMarkerAR();

    // 2. Sembunyikan semua HUD dalam permainan
    if (DOM.walkthroughHud) DOM.walkthroughHud.style.display = 'none';
    if (DOM.badgeStrip) DOM.badgeStrip.style.display = 'none';
    if (DOM.crosshair) DOM.crosshair.style.display = 'none';
    if (DOM.promptContainer) DOM.promptContainer.classList.remove('active');
    if (DOM.mobileControls) DOM.mobileControls.style.display = 'none';
    if (DOM.mobileInteractBtn) DOM.mobileInteractBtn.style.display = 'none';
    if (DOM.arOverlay) DOM.arOverlay.style.display = 'none';
    if (DOM.touchZone) DOM.touchZone.style.display = 'none';

    // 3. Jeda pemasa permainan semasa berada di lobi
    if (State.timerInterval) {
      clearInterval(State.timerInterval);
      State.timerInterval = null;
    }

    // 4. Paparkan Lobi Makmal Sains
    if (DOM.lobbyScreen) {
      DOM.lobbyScreen.classList.add('active');
      DOM.lobbyScreen.style.display = 'flex';
      DOM.lobbyScreen.scrollTop = 0;
    }

    // 5. Kemas kini status murid
    if (DOM.lobbyUserName && State.user && State.user.nama) {
      DOM.lobbyUserName.textContent = State.user.nama;
    }
    if (DOM.lobbyStatBadges) {
      DOM.lobbyStatBadges.textContent = `${State.completedStations ? State.completedStations.size : 0}/8`;
    }

    // 6. Pastikan persekitaran makmal 3D kekal aktif sebagai latar belakang estetik
    if (labEnvironmentGroup) labEnvironmentGroup.visible = true;
    if (walkthroughStationsGroup) walkthroughStationsGroup.visible = true;
    if (arObjectGroup) arObjectGroup.visible = false;
    if (scene) {
      scene.background = new THREE.Color(0x0a161e);
      scene.fog = new THREE.FogExp2(0x0a161e, 0.025);
    }
  }

  function closeScienceLabLobby() {
    isLobbyActive = false;
    if (DOM.lobbyScreen) {
      DOM.lobbyScreen.classList.remove('active');
      DOM.lobbyScreen.style.display = 'none';
    }
  }

  async function launchMode(mode) {
    if (mode === 'lobby') {
      SoundFX.interact();
      openScienceLabLobby();
      return;
    }
    SoundFX.interact();
    closeScienceLabLobby();
    await selectMode(mode);
    if (!State.timerInterval) {
      startTimer();
    }
  }

  // Fungsi Buka & Tutup Modal Arahan Misi Pra-Permainan AR Orientasi (Mod B)
  function openARStoryMissionModal() {
    if (DOM.arStoryMissionModal) {
      DOM.arStoryMissionModal.classList.add('open');
      SoundFX.interact();
    }
  }

  function closeARStoryMissionModal() {
    if (DOM.arStoryMissionModal) {
      DOM.arStoryMissionModal.classList.remove('open');
      SoundFX.interact();
    }
  }

  function openCellGalleryModal(type) {
    SoundFX.interact();
  }

  function closeCellGalleryModal() {
    SoundFX.interact();
  }

  // ==============================================================================
  // HOW TO PLAY DIALOG (CARA BERMAIN)
  // ==============================================================================

  function openHowToPlayDialog() {
    DOM.howToModal.classList.add('open');
  }

  function closeHowToPlayDialog() {
    DOM.howToModal.classList.remove('open');
  }

  // ==============================================================================
  // HUD, TIMER & UTILITIES
  // ==============================================================================

  function updateHUD() {
    if (DOM.arMissionStatusText) {
      DOM.arMissionStatusText.textContent = `Stesen Dipulihkan: ${State.completedStations.size}/8`;
    }
    if (DOM.badgeCount) DOM.badgeCount.textContent = `${State.completedStations.size}/8`;
    if (DOM.score) DOM.score.textContent = String(State.score);
    if (DOM.arHudBadges) DOM.arHudBadges.textContent = `${State.completedStations.size}/8`;
    if (DOM.arHudScore) DOM.arHudScore.textContent = String(State.score);
    if (DOM.arStnDoneCount) DOM.arStnDoneCount.textContent = `${State.completedStations.size}/8`;

    // Fasa A.4: Kemas kini stat cip Peti Harta Karun (0/3, 1/3, 2/3, 3/3)
    if (DOM.arHudChests) {
      DOM.arHudChests.textContent = `${State.treasureHuntCompletedCount || 0}/3`;
    }
    if (DOM.arHudChestChip) {
      if (State.treasureHuntUnlocked || State.completedStations.size >= 8) {
        DOM.arHudChestChip.style.display = 'inline-flex';
      }
    }
  }

  function startTimer() {
    clearInterval(State.timerInterval);
    State.startTime = Date.now();
    State.timerInterval = setInterval(() => {
      if (!State.isPaused && !State.isCompleted) {
        State.durationSeconds++;
        const formatted = formatTime(State.durationSeconds);
        if (DOM.timer) DOM.timer.textContent = formatted;
        if (DOM.arHudTimer) DOM.arHudTimer.textContent = formatted;
      }
    }, 1000);
  }

  function formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function toggleSound() {
    SoundFX.muted = !SoundFX.muted;
    if (DOM.soundIcon) {
      DOM.soundIcon.textContent = SoundFX.muted ? 'volume_off' : 'volume_up';
    }
    if (DOM.arSoundIcon) {
      DOM.arSoundIcon.textContent = SoundFX.muted ? 'volume_off' : 'volume_up';
    }
  }

  function togglePause() {
    State.isPaused = !State.isPaused;
    if (DOM.arPauseIcon) {
      DOM.arPauseIcon.textContent = State.isPaused ? 'play_arrow' : 'pause';
    }
    if (State.isPaused) {
      alertToast('⏸️ Permainan Dijeda');
    } else {
      alertToast('▶️ Permainan Disambung');
    }
  }

  // ==============================================================================
  // MAIN ANIMATION LOOP
  // ==============================================================================

  const clock = new THREE.Clock();

  function animate() {
    renderer.setAnimationLoop(renderLoop);
  }

  function renderLoop(timestamp, frame) {
    // 0. Optimumkan Prestasi: Jeda rendering Three.js semasa Lobi Makmal aktif untuk elakkan beban GPU & lag
    if (isLobbyActive) {
      return;
    }

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Update Mode Specific Logic
    if (State.mode === '3d') {
      updatePlayerMovement();
    } else {
      // Animasi 8 stesen AR world-locked (Mod A Spatial & Mod C Orientasi)
      if (arWorldState.active) {
        animateARWorldStations(elapsedTime);
      }

      // Pengesanan penanda 6DOF (Mod B Marker AR)
      if (arMarkerState.active) {
        updateMarkerARTracking(elapsedTime);
      }

      // In tabletop Makmal Mini mode, apply gentle auto-rotation if enabled
      if (arState.autoRotate && arObjectGroup && arObjectGroup.visible) {
        arObjectGroup.rotation.y += delta * 0.35;
      }

      // Handle WebXR hit-test in immersive-ar session (Mod A Spatial AR)
      if (frame && xrHitTestSource && xrRefSpace) {
        const hitTestResults = frame.getHitTestResults(xrHitTestSource);
        if (hitTestResults.length > 0) {
          const hitPose = hitTestResults[0].getPose(xrRefSpace);
          if (hitPose && reticleMesh) {
            reticleMesh.visible = !arState.isPlaced;
            reticleMesh.matrix.fromArray(hitPose.transform.matrix);
            reticleMesh.matrixAutoUpdate = false;
          }
        } else if (reticleMesh) {
          reticleMesh.visible = false;
        }
      }
      // Watchdog Kestabilan Kamera WebAR (Fasa A.4) - semak setiap 30 frame
      if ((State.mode === 'camera-ar' || State.mode === 'marker-ar') && ++arWatchdogFrameCount % 30 === 0) {
        checkAndRecoverARCamera();
      }
    }

    // 2. Update Animated 3D Objects
    animatedObjects.forEach(obj => {
      if (typeof obj.update === 'function') obj.update(elapsedTime, delta);
    });

    // 3. Render Three.js Scene
    renderer.render(scene, camera);
  }

  // ==============================================================================
  // PUBLIC DIAGNOSTIC & AUTOMATED VERIFICATION API (UJIAN 1 - UJIAN 12)
  // ==============================================================================
  window.CellQuestAR = {
    getState: () => State,
    // Mod A Enhanced Public API Helpers
    openLab3DStoryMissionModal,
    closeLab3DStoryMissionModal,
    openLab3DCalibrationModal,
    closeLab3DCalibrationModal,
    openLab3DCrystalVictoryModal,
    closeLab3DCrystalVictoryModal,
    activateCellCoreCrystal,
    enableModAGyroscope,
    calibrateModAGyroHeading,
    initializeOrientation,
    requestOrientationPermission,
    getScreenOrientationAngle,
    updateDeviceOrientation,
    calibrateForwardDirection,
    resetViewDirection,
    simulateModADeviceOrientation: (alpha, beta, gamma, screenAngle = 0) => {
      window.arSimulatedScreenOrientation = screenAngle;
      modAGyro.enabled = true;
      modAGyro.active = true;
      bindModADeviceOrientationListenerOnce();
      const res = updateDeviceOrientation({ alpha, beta, gamma }, true);
      updatePlayerMovement();
      return {
        ...res,
        cameraPitch: camera ? camera.rotation.x : 0,
        cameraYaw: camera ? camera.rotation.y : 0,
        playerPitch: player.pitch,
        playerRotY: player.rotY,
        gyroPitch: modAGyro.pitch,
        gyroYaw: modAGyro.yaw
      };
    },
    setJoystickInput: (x, y, active = true) => {
      joystickState.x = x;
      joystickState.y = y;
      joystickState.active = active;
      updatePlayerMovement();
      return {
        x: player.x,
        z: player.z,
        rotY: player.rotY,
        pitch: player.pitch,
        cameraYaw: camera ? camera.rotation.y : 0,
        cameraPitch: camera ? camera.rotation.x : 0
      };
    },
    inspectAll3DStationMaterials: () => {
      return stationMeshes.map((st) => {
        const meshes = [];
        const root = st.organelleMesh || st.organelleVisual;
        if (root) {
          root.traverse((node) => {
            if (!node.isMesh || !node.visible) return;
            // Skip decorative 2D plane labels and flat aura rings when auditing 3D organelle materials
            if (node.geometry && (node.geometry.type === 'PlaneGeometry' || node.geometry.type === 'RingGeometry')) {
              return;
            }
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m) => {
              if (!m) return;
              meshes.push({
                nodeName: node.name || 'unnamed',
                visible: node.visible,
                frustumCulled: node.frustumCulled,
                materialType: m.type,
                colorHex: m.color ? '#' + m.color.getHexString() : null,
                emissiveHex: m.emissive ? '#' + m.emissive.getHexString() : null,
                emissiveIntensity: m.emissiveIntensity,
                roughness: m.roughness,
                metalness: m.metalness,
                vertexColors: !!m.vertexColors,
                hasMap: !!m.map,
                mapImageValid: !!(m.map && m.map.image && (m.map.image.width > 0 || m.map.image.naturalWidth > 0))
              });
            });
          });
        }
        return {
          stationId: st.data.id,
          stationNum: st.data.number || st.data.num,
          stationName: st.data.title || st.data.name,
          meshCount: meshes.length,
          meshes
        };
      });
    },
    handlePlayerInteract,
    updateSecretDoorSign,
    getModAGyroState: () => modAGyro,
    getJoystickState: () => joystickState,
    getCurrentLookYaw: () => player.rotY + (State.mode === '3d' && modAGyro.active ? modAGyro.yaw : 0),
    getCellCoreCrystalGroup: () => cellCoreCrystalGroup,
    getFloorGuideTrailGroup: () => floorGuideTrailGroup,
    getExitDoorMeshes: () => exitDoorMeshes,
    getARState: () => arState,
    getWorldState: () => arWorldState,
    getMarkerState: () => arMarkerState,
    getStationsConfig: () => AR_WORLD_STATIONS,
    getStationMeshes: () => stationMeshes,
    getERExhibit: () => erExhibitGroup,
    getGLBDiagnostics: () => glbDiagnostics,
    getStationGLBMap: () => STATION_GLB_MAP,
    preloadAllGLBs: () => Promise.all(Object.keys(STATION_GLB_MAP).map(k => loadAndCacheOrganelleGLB(k))),
    getCamera: () => camera,
    getScene: () => scene,
    getRenderer: () => renderer,
    setPlayerPose: (x, z, rotY, pitch = 0) => {
      player.x = x;
      player.z = z;
      player.rotY = rotY;
      player.pitch = pitch;
      if (z <= -14.8 && !State.hasShownChamberWelcome) {
        State.hasShownChamberWelcome = true;
        alertToast('✨ SELAMAT DATANG KE BILIK TERAS SEL!\nAnda telah berjaya membuka bilik rahsia. Aktifkan kristal tenaga untuk menyelesaikan misi!');
      }
      camera.position.set(player.x, player.y, player.z);
      camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
    },
    selectMode: (m) => selectMode(m),
    switchARModel: (m) => switchARModel(m),
    lookAtHeading: (deg, pitchDeg) => lookAtARHeading(deg, pitchDeg),
    selectRadarTarget: (idx, autoTurn = false) => selectRadarTargetStation(idx, autoTurn),
    setWorldStationsConfig: (list) => setARWorldStationsConfig(list),
    setDiscoveryTolerance: (h, v) => {
      if (typeof h === 'number') arWorldState.horizontalToleranceDeg = h;
      if (typeof v === 'number') arWorldState.verticalToleranceDeg = v;
      checkARWorldStationVisibility();
      updateARWorldCompass();
    },
    simulateDeviceOrientation: (alpha, beta, gamma, screenAngle = 0) => {
      window.arSimulatedScreenOrientation = screenAngle;
      arWorldState.screenOrientationAngle = screenAngle;
      onDeviceOrientationEvent({ alpha, beta, gamma });
      // Untuk simulasi langkah-demi-langkah dalam ujian automatik, kemas kini nilai smoothed serta-merta
      arWorldState.smoothedSensorAzimuthDeg = arWorldState.rawSensorAzimuthDeg;
      arWorldState.smoothedSensorElevationDeg = arWorldState.rawSensorElevationDeg;
      updateARWorldCamera(alpha, beta, gamma);
      return {
        rawAzimuthDeg: arWorldState.rawSensorAzimuthDeg,
        rawElevationDeg: arWorldState.rawSensorElevationDeg,
        currentHeadingDeg: arWorldState.currentHeadingDeg,
        currentPitchDeg: arWorldState.currentPitchDeg
      };
    },
    simulateMarkerPose: (markerId, opts = {}) => {
      arMarkerState.simulatedMarkerId = markerId;
      arMarkerState.simulatedPoseOffset = opts;
      if (typeof markerId === 'number' && markerId >= 0) {
        arMarkerState.simulatedCornersMap[markerId] = projectSyntheticMarkerCorners(opts);
      }
      updateMarkerARTracking(0);
      return arMarkerState.trackedMap[markerId] || null;
    },
    calibrateHeading: () => calibrateARWorldHeading(),
    togglePosture: () => toggleARPostureMode(),
    toggleSmartRadarPanel: (expand) => toggleSmartRadarPanel(expand),
    openExitConfirmDialog: () => openExitConfirmDialog(),
    closeExitConfirmDialog: () => closeExitConfirmDialog(),
    confirmExitToCellQuest: (skipRedirect = false) => confirmExitToCellQuest(skipRedirect),
    returnToKotakARSELNEL: (e) => returnToKotakARSELNEL(e),
    KOTAK_ARSELNEL_RETURN_URL,
    isCameraStreamActive: () => !!cameraStream,
    isSensorBound: () => !!(deviceOrientationBound || screenOrientationBound),
    placeSpatialStations: (pos, yaw) => positionARWorldStationsSpatial(pos, yaw),
    checkVisibility: () => checkARWorldStationVisibility(),
    tapAt: (x, y) => handleARWorldTap(x, y),
    raycast3DAt: (x, y) => handle3DStationRaycastTap(x, y),
    selectOrganelle: (id, num) => selectAROrganelle(id, num),
    openQuiz: (idx) => openStationModal(idx),
    getPreviewZoomState: () => previewZoomState,
    getPreviewModelGroup: () => previewModelGroup,
    getPreviewCamera: () => previewCamera,
    getTreasureHuntState: () => ({
      unlocked: State.treasureHuntUnlocked,
      active: State.treasureHuntActive,
      completed: State.treasureHuntCompleted,
      bonusClaimed: State.treasureHuntBonusClaimed,
      isChestLidOpen: arWorldState.isChestLidOpen,
      chestGroup: arWorldState.treasureChestGroup,
      chestConfig: arWorldState.treasureChestConfig,
      currentChestIndex: State.treasureHuntCurrentChestIndex,
      completedCount: State.treasureHuntCompletedCount,
      chests: State.treasureHuntChests
    }),
    getDiagnosticsLog: () => (window.__AR_DIAG_LOGS || []),
    getCurrentChestIndex: () => State.treasureHuntCurrentChestIndex,
    spawnChest: (idx) => spawnOrRelocateTreasureChest(idx),
    advanceChest: () => onTreasureNextButtonClicked(),
    checkARCamera: () => checkAndRecoverARCamera(),
    getRewardChestPlacement: () => getRewardChestPlacement(),
    startTreasureHunt: () => startTreasureHuntMission(),
    openTreasureChestModal: () => openTreasureChestModal(),
    closeTreasureChestModal: () => closeTreasureChestModal(),
    answerBonusQuestion: (choiceIdx) => checkTreasureBonusAnswer(choiceIdx),
    nextBonusQuestion: () => onTreasureNextButtonClicked(),
    showTreasureRewardModal: () => showTreasureRewardModal(),
    hideTreasureRewardModal: () => hideTreasureRewardModal(),
    findNextUncompletedStation: (fromIdx) => findNextUncompletedStation(fromIdx),
    markStationCompleted: (num) => markStationCompleted(num),
    openScienceLabLobby: () => openScienceLabLobby(),
    closeScienceLabLobby: () => closeScienceLabLobby(),
    isLobbyActive: () => isLobbyActive,
    launchMode: (m) => launchMode(m),
    openARStoryMissionModal: () => openARStoryMissionModal(),
    closeARStoryMissionModal: () => closeARStoryMissionModal(),
    openCellGalleryModal: (t) => openCellGalleryModal(t),
    closeCellGalleryModal: () => closeCellGalleryModal(),
    getLobbyState: () => ({
      active: isLobbyActive,
      user: State.user,
      completedCount: State.completedStations ? State.completedStations.size : 0
    })
  };
  window.CellQuestTestAPI = window.CellQuestAR;

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
