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
    mode: '3d', // '3d' | 'ar' | 'vr'
    user: null
  };

  // 4. THREE.JS ENGINE COMPONENTS
  let scene, camera, renderer;
  let player = {
    x: 0,
    y: 1.6, // Eye height
    z: 8.5, // Start near entrance door
    rotY: Math.PI, // Facing forward towards center & exit door
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
    buildMiniBadgeStrip();
    startTimer();
    hideLoadingScreen();
    animate();

    // Check URL search params for quick mode launch (e.g. ?mode=ar or ?mode=how)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'ar') {
      openModeDialog();
    } else if (urlParams.get('mode') === 'how') {
      openHowToPlayDialog();
    }
  }

  function cacheDOM() {
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.canvasContainer = document.getElementById('canvas-container');
    DOM.badgeCount = document.getElementById('hud-badge-count');
    DOM.score = document.getElementById('hud-score');
    DOM.timer = document.getElementById('hud-timer');
    DOM.badgeStrip = document.getElementById('hud-badge-strip');
    DOM.promptContainer = document.getElementById('prompt-container');
    DOM.promptTitle = document.getElementById('prompt-title');
    DOM.promptIcon = document.getElementById('prompt-icon');
    DOM.promptActionBtn = document.getElementById('prompt-action-btn');
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
    DOM.chooseArBtn = document.getElementById('choose-ar-btn');
    DOM.closeModeBtn = document.getElementById('close-mode-btn');

    // Victory Certificate Modal
    DOM.victoryModal = document.getElementById('victory-modal');
    DOM.certStudentName = document.getElementById('cert-student-name');
    DOM.certScore = document.getElementById('cert-score');
    DOM.certTime = document.getElementById('cert-time');
    DOM.certDate = document.getElementById('cert-date');
    DOM.downloadCertBtn = document.getElementById('download-cert-btn');
    DOM.restartGameBtn = document.getElementById('restart-game-btn');
    DOM.closeVictoryBtn = document.getElementById('close-victory-btn');

    // AR HUD Overlay
    DOM.arOverlay = document.getElementById('ar-overlay');
    DOM.arPlaceBtn = document.getElementById('ar-place-btn');
    DOM.arExitBtn = document.getElementById('ar-exit-btn');
    DOM.arSmallerBtn = document.getElementById('ar-smaller-btn');
    DOM.arLargerBtn = document.getElementById('ar-larger-btn');
    DOM.arRotateBtn = document.getElementById('ar-rotate-btn');

    // Mobile Virtual D-pad
    DOM.dpadUp = document.getElementById('dpad-up');
    DOM.dpadDown = document.getElementById('dpad-down');
    DOM.dpadLeft = document.getElementById('dpad-left');
    DOM.dpadRight = document.getElementById('dpad-right');
    DOM.touchZone = document.getElementById('touch-look-zone');
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

  function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a161e);
    scene.fog = new THREE.FogExp2(0x0a161e, 0.025);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(player.x, player.y, player.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.xr.enabled = true; // Enable WebXR on renderer

    DOM.canvasContainer.appendChild(renderer.domElement);

    // Ambient and Directional Soft Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xdcfce7, 0.7);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

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

    // Front Wall (Exit / "Pintu Pakar Sel" - Z = -11)
    const wallFront = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 0.4), wallMat);
    wallFront.position.set(0, 2.5, -11);
    labGroup.add(wallFront);

    // Exit Door Structure ("Pintu Pakar Sel")
    buildExitDoor(labGroup);

    // 4. Central Research Table & Holographic Display Pedestal
    buildCenterpiece(labGroup);

    // 5. Scientific Wall Posters (KSSM Animal & Plant Cell Charts)
    buildPosters(labGroup);

    scene.add(labGroup);
  }

  // Build the glowing Exit Door that opens when all 8 badges are earned
  function buildExitDoor(parent) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, -10.8);

    // Outer sci-fi frame
    const frameGeo = new THREE.BoxGeometry(5.2, 4.2, 0.6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e2530, metalness: 0.6, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.1;
    doorGroup.add(frame);

    // Door panels (Left & Right sliding doors)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1f3c4d,
      metalness: 0.4,
      roughness: 0.2
    });

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3.6, 0.2), panelMat);
    leftDoor.position.set(-1.05, 1.8, 0);
    doorGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3.6, 0.2), panelMat);
    rightDoor.position.set(1.05, 1.8, 0);
    doorGroup.add(rightDoor);

    // Holographic Lock Shield / Energy Field
    const shieldGeo = new THREE.PlaneGeometry(4.2, 3.6);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Red initially when locked
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.8, 0.15);
    doorGroup.add(shield);

    // Exit Signboard
    const exitSign = createTextPlane('🔒 PINTU PAKAR SEL (KUMPUL 8 LENCANA)', '#ef4444', 4.5, 0.7);
    exitSign.position.set(0, 4.4, 0.2);
    doorGroup.add(exitSign);

    exitDoorMeshes = {
      group: doorGroup,
      leftDoor,
      rightDoor,
      shield,
      exitSign,
      unlocked: false
    };

    parent.add(doorGroup);
  }

  // Central Table & Floating Holographic Cell
  function buildCenterpiece(parent) {
    const centerGroup = new THREE.Group();
    centerGroup.position.set(0, 0, 0);

    // Octagonal research table base
    const tableGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.9, 8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x132733,
      metalness: 0.3,
      roughness: 0.3
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

    // Hologram Emitter in Center
    const emitterGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.15, 16);
    const emitterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.y = 0.98;
    centerGroup.add(emitter);

    // Floating Animated Holographic 3D Cell Model
    const cellHoloGroup = new THREE.Group();
    cellHoloGroup.position.set(0, 2.2, 0);

    // Outer translucent membrane
    const cellGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.1
    });
    const cellMesh = new THREE.Mesh(cellGeo, cellMat);
    cellHoloGroup.add(cellMesh);

    // Floating purple nucleus inside
    const nucleusGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const nucleusMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    cellHoloGroup.add(nucleusMesh);

    // Orbiting green chloroplasts & orange mitochondria
    for (let i = 0; i < 4; i++) {
      const organGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);
      const organMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x22c55e : 0xf97316
      });
      const organ = new THREE.Mesh(organGeo, organMat);
      const angle = (i * Math.PI) / 2;
      organ.position.set(Math.cos(angle) * 0.55, (i - 1.5) * 0.15, Math.sin(angle) * 0.55);
      organ.rotation.y = angle;
      cellHoloGroup.add(organ);
    }

    centerGroup.add(cellHoloGroup);
    animatedObjects.push({
      update(t) {
        cellHoloGroup.rotation.y = t * 0.6;
        cellHoloGroup.position.y = 2.2 + Math.sin(t * 1.5) * 0.08;
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

  // ==============================================================================
  // 8 INTERACTIVE STATIONS CREATION
  // ==============================================================================

  function buildStations() {
    stationMeshes = [];

    State.stations.forEach((stn, index) => {
      const stnGroup = new THREE.Group();
      stnGroup.position.set(stn.pos.x, 0, stn.pos.z);
      stnGroup.rotation.y = stn.pos.rotY;

      // 1. Futuristic Kiosk Pedestal
      const baseGeo = new THREE.BoxGeometry(2.2, 0.9, 1.2);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x11232e,
        metalness: 0.3,
        roughness: 0.4
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.45;
      baseMesh.castShadow = true;
      stnGroup.add(baseMesh);

      // Neon Accent Base Stripe matching station color
      const stripeGeo = new THREE.BoxGeometry(2.25, 0.12, 1.25);
      const stripeMat = new THREE.MeshBasicMaterial({ color: stn.colorHex });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.88;
      stnGroup.add(stripe);

      // 2. Glowing Billboard Interactive Screen above Pedestal
      const screenGeo = new THREE.BoxGeometry(2.0, 1.1, 0.1);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x09141b,
        metalness: 0.5,
        roughness: 0.2
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 2.2, 0);
      stnGroup.add(screenMesh);

      // Station Screen Label Canvas Texture
      const textCanvas = createStationCanvas(stn.number, stn.title, stn.color);
      const textTexture = new THREE.CanvasTexture(textCanvas);
      const screenFaceGeo = new THREE.PlaneGeometry(1.9, 1.0);
      const screenFaceMat = new THREE.MeshBasicMaterial({ map: textTexture });
      const screenFace = new THREE.Mesh(screenFaceGeo, screenFaceMat);
      screenFace.position.set(0, 2.2, 0.06);
      stnGroup.add(screenFace);

      // 3. Floating 3D Stylized Representation of the Organelle
      const organelleMesh = buildStylizedOrganelle(stn.number, stn.colorHex);
      organelleMesh.position.set(0, 1.3, 0);
      stnGroup.add(organelleMesh);

      // 4. Floating Badge Indicator Beacon (? -> ✓)
      const badgeBeacon = createBeaconMesh(stn.colorHex);
      badgeBeacon.position.set(0, 3.1, 0);
      stnGroup.add(badgeBeacon);

      // Pulsing Station Glow Halo
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

      scene.add(stnGroup);

      // Register animated elements
      animatedObjects.push({
        update(t) {
          organelleMesh.rotation.y = t * 1.2;
          organelleMesh.position.y = 1.3 + Math.sin(t * 2 + index) * 0.06;
          badgeBeacon.rotation.y = t * 1.5;
        }
      });

      stationMeshes.push({
        index,
        data: stn,
        group: stnGroup,
        beacon: badgeBeacon,
        screenFace,
        halo,
        organelleMesh,
        worldPos: new THREE.Vector3(stn.pos.x, 1.5, stn.pos.z)
      });
    });
  }

  // Create stylized 3D representation for each of the 8 stations
  function buildStylizedOrganelle(number, colorHex) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.1
    });

    if (number === 1) {
      // 1. Nukleus: Sphere with nuclear pores
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), mat);
      group.add(core);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xc084fc })
      );
      ring.rotation.x = Math.PI / 3;
      group.add(ring);
    } else if (number === 2) {
      // 2. Membran Sel: Concentric protective shield rings
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: colorHex, transparent: true, opacity: 0.6 })
      );
      group.add(sphere);
      const shieldRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.04, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa })
      );
      group.add(shieldRing);
    } else if (number === 3) {
      // 3. Sitoplasma: Jellied droplets
      const droplet = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 1), mat);
      group.add(droplet);
    } else if (number === 4) {
      // 4. Mitokondrion: Oblong capsule with cristae ridges
      const mito = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.48, 12), mat);
      mito.rotation.z = Math.PI / 3;
      group.add(mito);
    } else if (number === 5) {
      // 5. Kloroplas: Green disc with thylakoid grana stack
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.14, 16), mat);
      group.add(disc);
      for (let g = 0; g < 3; g++) {
        const granum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8),
          new THREE.MeshBasicMaterial({ color: 0x86efac })
        );
        granum.position.set((g - 1) * 0.16, 0.06, 0);
        group.add(granum);
      }
    } else if (number === 6) {
      // 6. Dinding Sel: Rigid hexagonal cellular boundary box
      const wallBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), mat);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.49, 0.49, 0.49)),
        new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 2 })
      );
      group.add(wallBox);
      group.add(edges);
    } else if (number === 7) {
      // 7. Vakuol: Clear blue fluid bubble
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.75,
          roughness: 0.1
        })
      );
      group.add(bubble);
    } else {
      // 8. Sel Haiwan vs Sel Tumbuhan: Dual sphere comparison icon
      const animalHalf = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xec4899 })
      );
      animalHalf.position.x = -0.2;
      group.add(animalHalf);

      const plantHalf = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x10b981 })
      );
      plantHalf.position.x = 0.2;
      group.add(plantHalf);
    }

    return group;
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

    const texture = new THREE.CanvasTexture(canvas);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
    return plane;
  }

  // Create Educational Poster Plane Helper
  function createPosterPlane(title, bullets, headerColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f1f2c';
    ctx.fillRect(0, 0, 512, 360);

    // Header banner
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, 512, 64);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 32);

    // Bullet points
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 20px Nunito, sans-serif';
    ctx.textAlign = 'left';
    bullets.forEach((b, i) => {
      ctx.fillText(b, 30, 110 + (i * 44));
    });

    // Border
    ctx.strokeStyle = headerColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 506, 354);

    const texture = new THREE.CanvasTexture(canvas);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.5),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );
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

  function bindEvents() {
    // Keyboard Controls (WASD / Arrows)
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Look (Drag on canvas)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    DOM.canvasContainer.addEventListener('mousedown', (e) => {
      if (State.isPaused) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || State.isPaused) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      player.rotY -= deltaX * 0.0035;
      player.pitch = Math.max(-0.6, Math.min(0.6, player.pitch - deltaY * 0.003));
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch Zone Look for Mobile (Drag right side of screen)
    if (DOM.touchZone) {
      let touchStartX = 0;
      let touchStartY = 0;

      DOM.touchZone.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      DOM.touchZone.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const curX = e.touches[0].clientX;
          const curY = e.touches[0].clientY;
          const deltaX = curX - touchStartX;
          const deltaY = curY - touchStartY;
          touchStartX = curX;
          touchStartY = curY;

          player.rotY -= deltaX * 0.004;
          player.pitch = Math.max(-0.6, Math.min(0.6, player.pitch - deltaY * 0.003));
        }
      }, { passive: true });
    }

    // Virtual D-pad for Mobile (Up, Down, Left, Right)
    bindDpadButton(DOM.dpadUp, 'forward');
    bindDpadButton(DOM.dpadDown, 'backward');
    bindDpadButton(DOM.dpadLeft, 'left');
    bindDpadButton(DOM.dpadRight, 'right');

    // UI Buttons
    if (DOM.promptActionBtn) {
      DOM.promptActionBtn.addEventListener('click', () => {
        if (State.nearbyStationIndex >= 0) {
          openStationModal(State.nearbyStationIndex);
        }
      });
    }

    if (DOM.soundToggleBtn) {
      DOM.soundToggleBtn.addEventListener('click', toggleSound);
    }

    if (DOM.pauseBtn) {
      DOM.pauseBtn.addEventListener('click', togglePause);
    }

    if (DOM.helpBtn) {
      DOM.helpBtn.addEventListener('click', openHowToPlayDialog);
    }

    if (DOM.modeSelectBtn) {
      DOM.modeSelectBtn.addEventListener('click', openModeDialog);
    }

    if (DOM.closeStationBtn) {
      DOM.closeStationBtn.addEventListener('click', closeStationModal);
    }

    if (DOM.closeHowToBtn) {
      DOM.closeHowToBtn.addEventListener('click', closeHowToPlayDialog);
    }

    if (DOM.startPlayingBtn) {
      DOM.startPlayingBtn.addEventListener('click', closeHowToPlayDialog);
    }

    if (DOM.choose3dBtn) {
      DOM.choose3dBtn.addEventListener('click', () => {
        selectMode('3d');
      });
    }

    if (DOM.chooseArBtn) {
      DOM.chooseArBtn.addEventListener('click', () => {
        selectMode('ar');
      });
    }

    if (DOM.closeModeBtn) {
      DOM.closeModeBtn.addEventListener('click', closeModeDialog);
    }

    if (DOM.closeVictoryBtn) {
      DOM.closeVictoryBtn.addEventListener('click', closeVictoryModal);
    }

    if (DOM.restartGameBtn) {
      DOM.restartGameBtn.addEventListener('click', restartGame);
    }

    if (DOM.downloadCertBtn) {
      DOM.downloadCertBtn.addEventListener('click', printOrSaveCertificate);
    }

    // WebXR AR overlay buttons
    if (DOM.arExitBtn) {
      DOM.arExitBtn.addEventListener('click', exitARSession);
    }

    // Window Resize
    window.addEventListener('resize', onWindowResize);
  }

  function bindDpadButton(btn, keyName) {
    if (!btn) return;
    const startAction = (e) => {
      e.preventDefault();
      player.keys[keyName] = true;
    };
    const endAction = (e) => {
      e.preventDefault();
      player.keys[keyName] = false;
    };
    btn.addEventListener('touchstart', startAction, { passive: false });
    btn.addEventListener('touchend', endAction, { passive: false });
    btn.addEventListener('mousedown', startAction);
    btn.addEventListener('mouseup', endAction);
    btn.addEventListener('mouseleave', endAction);
  }

  function onKeyDown(e) {
    if (State.isPaused) return;

    if (e.code === 'KeyW' || e.code === 'ArrowUp') player.keys.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') player.keys.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') player.keys.right = true;

    // Press 'E' or Space to interact with station
    if (e.code === 'KeyE' || e.code === 'Space') {
      if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
        openStationModal(State.nearbyStationIndex);
      }
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ==============================================================================
  // MOVEMENT & COLLISION DETECTION
  // ==============================================================================

  function updatePlayerMovement() {
    if (State.isPaused || DOM.stationModal.classList.contains('open')) return;

    let moveX = 0;
    let moveZ = 0;

    // Direction vector from camera angle
    const sinY = Math.sin(player.rotY);
    const cosY = Math.cos(player.rotY);

    if (player.keys.forward) {
      moveX += sinY * player.speed;
      moveZ += cosY * player.speed;
    }
    if (player.keys.backward) {
      moveX -= sinY * player.speed;
      moveZ -= cosY * player.speed;
    }
    if (player.keys.left) {
      moveX += cosY * player.speed;
      moveZ -= sinY * player.speed;
    }
    if (player.keys.right) {
      moveX -= cosY * player.speed;
      moveZ += sinY * player.speed;
    }

    // Candidate new position
    const nextX = player.x + moveX;
    const nextZ = player.z + moveZ;

    // 1. Room Boundary Collision (Walls at -8.2 to 8.2 and -10.2 to 10.2)
    const minX = -8.2;
    const maxX = 8.2;
    const minZ = -10.2;
    const maxZ = 10.2;

    let validX = nextX;
    let validZ = nextZ;

    if (nextX < minX) validX = minX;
    if (nextX > maxX) validX = maxX;
    if (nextZ < minZ) validZ = minZ;
    if (nextZ > maxZ) validZ = maxZ;

    // 2. Central Research Table Obstacle Collision (Radius 2.6m)
    const distToCenter = Math.hypot(validX, validZ);
    if (distToCenter < 2.6) {
      const angle = Math.atan2(validZ, validX);
      validX = Math.cos(angle) * 2.6;
      validZ = Math.sin(angle) * 2.6;
    }

    player.x = validX;
    player.z = validZ;

    // Update Camera position & rotation
    camera.position.set(player.x, player.y, player.z);
    camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');

    // 3. Check proximity to the 8 stations
    checkStationProximity();

    // 4. Check proximity to the exit door (Z < -9.5 and X near center)
    if (exitDoorMeshes && exitDoorMeshes.unlocked && Math.abs(player.x) < 2.2 && player.z < -9.0) {
      if (!State.isCompleted) {
        completeMission();
      }
    }
  }

  // Check proximity to stations (~2.8 meters threshold)
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

      SoundFX.interact();
    } else {
      DOM.promptContainer.classList.remove('active');
    }
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

    DOM.quizQuestion.textContent = stn.question;
    renderQuizOptions(stn);

    DOM.quizFeedback.style.display = 'none';
    DOM.stationModal.classList.add('open');

    SoundFX.interact();
  }

  function closeStationModal() {
    DOM.stationModal.classList.remove('open');
    State.activeStationIndex = -1;
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

  // Station completed visual feedback in 3D world & HUD
  function markStationCompleted(stationNumber) {
    const stnMesh = stationMeshes.find(s => s.data.number === stationNumber);
    if (stnMesh) {
      // Turn station halo green
      stnMesh.halo.material.color.setHex(0x10b981);
      // Turn beacon to green checkmark
      stnMesh.beacon.children[0].material.color.setHex(0x10b981);
      stnMesh.beacon.children[0].material.emissive.setHex(0x064e3b);
    }

    // Mini badge strip
    const miniBadge = document.getElementById(`mini-badge-${stationNumber}`);
    if (miniBadge) {
      miniBadge.classList.add('completed');
      miniBadge.textContent = '✓';
    }
  }

  // Unlock Exit Door when all 8 stations are cleared
  function unlockExitDoor() {
    if (!exitDoorMeshes || exitDoorMeshes.unlocked) return;
    exitDoorMeshes.unlocked = true;

    // Green holographic beam
    exitDoorMeshes.shield.material.color.setHex(0x10b981);
    exitDoorMeshes.shield.material.opacity = 0.2;

    exitDoorMeshes.exitSign.material.color?.setHex?.(0x10b981);

    // Open sliding doors animation
    animatedObjects.push({
      progress: 0,
      update(t) {
        if (this.progress < 1.4) {
          this.progress += 0.02;
          exitDoorMeshes.leftDoor.position.x = -1.05 - this.progress;
          exitDoorMeshes.rightDoor.position.x = 1.05 + this.progress;
        }
      }
    });

    SoundFX.victory();

    // Show announcement toast
    alertToast('🌟 TAHNIAH! Semua 8 Lencana Diperoleh! Pintu Pakar Sel Kini Terbuka!');
  }

  function alertToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 120px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #0d9488, #10b981); color: #fff;
      padding: 14px 24px; border-radius: 999px; font-weight: 800; font-size: 15px;
      z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); pointer-events: none;
      animation: fadeIn 0.4s ease;
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

    // Save student learning record to Supabase
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
        // Fallback local storage
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
    player.x = 0;
    player.z = 8.5;
    player.rotY = Math.PI;

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
  }

  // ==============================================================================
  // MODE SELECTION & REAL WEBXR AR IMPLEMENTATION
  // ==============================================================================

  function openModeDialog() {
    DOM.modeModal.classList.add('open');
  }

  function closeModeDialog() {
    DOM.modeModal.classList.remove('open');
  }

  async function selectMode(mode) {
    closeModeDialog();
    State.mode = mode;

    if (mode === 'ar') {
      await startWebXRAR();
    } else {
      // Standard 3D Walkthrough
      DOM.arOverlay.style.display = 'none';
      renderer.xr.enabled = false;
    }
  }

  async function startWebXRAR() {
    // 1. Check if device supports immersive-ar
    if (!navigator.xr || typeof navigator.xr.isSessionSupported !== 'function') {
      showARUnsupportedNotice('Pelayar anda tidak menyokong WebXR AR Spasial. Memerlukan pelayar moden seperti Chrome Android dengan Google Play Services for AR (ARCore).');
      return;
    }

    let isSupported = false;
    try {
      isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    } catch (_) {
      isSupported = false;
    }

    if (!isSupported) {
      showARUnsupportedNotice('Peranti anda tidak mempunyai penderia AR Spasial (WebXR immersive-ar). Anda masih boleh menikmati keseluruhan pengembaraan sel dalam Mod Jelajah 3D!');
      return;
    }

    // 2. Request WebXR immersive-ar session with hit-test
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local', 'hit-test']
      });

      xrSession = session;
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      DOM.arOverlay.style.display = 'flex';
      setupARReticle();

      session.addEventListener('end', () => {
        xrSession = null;
        DOM.arOverlay.style.display = 'none';
        State.mode = '3d';
      });

      alertToast('✨ Mod AR Aktif: Halakan kamera ke permukaan lantai atau meja.');
    } catch (err) {
      console.warn('WebXR AR session request failed:', err);
      showARUnsupportedNotice('Kebenaran kamera tidak diberikan atau sesi AR dibatalkan. Beralih ke Mod Jelajah 3D.');
    }
  }

  function setupARReticle() {
    if (!reticleMesh) {
      const ringGeo = new THREE.RingGeometry(0.15, 0.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, side: THREE.DoubleSide });
      reticleMesh = new THREE.Mesh(ringGeo, ringMat);
      reticleMesh.rotation.x = -Math.PI / 2;
      reticleMesh.visible = false;
      scene.add(reticleMesh);
    }

    if (DOM.arPlaceBtn) {
      DOM.arPlaceBtn.addEventListener('click', () => {
        if (reticleMesh && reticleMesh.visible) {
          // Reposition laboratory at detected surface
          alertToast('📍 Makmal diletakkan di atas permukaan!');
        }
      });
    }
  }

  function showARUnsupportedNotice(reason) {
    alertToast(`⚠️ ${reason}`);
    State.mode = '3d';
    // Smooth transition back to 3D
  }

  async function exitARSession() {
    if (xrSession) {
      try { await xrSession.end(); } catch (_) {}
      xrSession = null;
    }
    DOM.arOverlay.style.display = 'none';
    State.mode = '3d';
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
    if (DOM.badgeCount) DOM.badgeCount.textContent = `${State.completedStations.size}/8`;
    if (DOM.score) DOM.score.textContent = String(State.score);
  }

  function startTimer() {
    clearInterval(State.timerInterval);
    State.startTime = Date.now();
    State.timerInterval = setInterval(() => {
      if (!State.isPaused && !State.isCompleted) {
        State.durationSeconds++;
        if (DOM.timer) DOM.timer.textContent = formatTime(State.durationSeconds);
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
  }

  function togglePause() {
    State.isPaused = !State.isPaused;
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
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Update Player & Camera
    updatePlayerMovement();

    // 2. Update Animated 3D Objects
    animatedObjects.forEach(obj => {
      if (typeof obj.update === 'function') obj.update(elapsedTime, delta);
    });

    // 3. Render Three.js Scene
    renderer.render(scene, camera);
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
