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
    mode: '3d', // '3d' | 'camera-ar' | 'ar'
    user: null
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
    buildMiniBadgeStrip();
    initStationPreview();
    startTimer();
    hideLoadingScreen();
    animate();

    // Check URL search params for quick mode launch (e.g. ?mode=ar, ?mode=camera, ?mode=how)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'ar') {
      openModeDialog();
    } else if (urlParams.get('mode') === 'camera') {
      selectMode('camera-ar');
    } else if (urlParams.get('mode') === 'how') {
      openHowToPlayDialog();
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

    // AR HUD Overlay
    DOM.arOverlay = document.getElementById('ar-overlay');
    DOM.arPlaceBtn = document.getElementById('ar-place-btn');
    DOM.arExitBtn = document.getElementById('ar-exit-btn');
    DOM.arSmallerBtn = document.getElementById('ar-smaller-btn');
    DOM.arLargerBtn = document.getElementById('ar-larger-btn');
    DOM.arRotateBtn = document.getElementById('ar-rotate-btn');

    // Mobile Virtual Joystick & Touch Zone
    DOM.virtualJoystick = document.getElementById('virtual-joystick');
    DOM.joystickBase = document.getElementById('joystick-base');
    DOM.joystickThumb = document.getElementById('joystick-thumb');
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

    // 4. Central Research Table & Holographic ARSelNel Display Monument
    buildCenterpiece(labGroup);

    // 5. Scientific Wall Posters (KSSM Animal & Plant Cell Charts)
    buildPosters(labGroup);

    labEnvironmentGroup = labGroup;
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

  // Create biologically detailed, recognizable 3D representation for each of the 8 stations
  function buildStylizedOrganelle(number, colorHex) {
    const group = new THREE.Group();

    if (number === 1) {
      // ========================================================================
      // STESEN 1: NUKLEUS (Double-membrane sphere with 90° cutaway, nucleolus & pores)
      // ========================================================================
      // Outer purple nuclear envelope (cutaway exposing interior)
      const envelopeGeo = new THREE.SphereGeometry(0.38, 24, 24, 0, Math.PI * 1.5, 0, Math.PI);
      const envelopeMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide
      });
      const envelopeMesh = new THREE.Mesh(envelopeGeo, envelopeMat);
      group.add(envelopeMesh);

      // Inner dense nucleolus core in glowing magenta
      const nucleolusGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const nucleolusMat = new THREE.MeshStandardMaterial({
        color: 0xd946ef,
        emissive: 0x86198f,
        roughness: 0.2
      });
      const nucleolus = new THREE.Mesh(nucleolusGeo, nucleolusMat);
      group.add(nucleolus);

      // Chromatin network threads (entangled DNA loops)
      const chromatinGeo = new THREE.TorusGeometry(0.24, 0.02, 8, 24);
      const chromatinMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3 });
      const chrom1 = new THREE.Mesh(chromatinGeo, chromatinMat);
      chrom1.rotation.x = Math.PI / 3;
      group.add(chrom1);

      const chrom2 = new THREE.Mesh(chromatinGeo, chromatinMat);
      chrom2.rotation.y = Math.PI / 3;
      group.add(chrom2);

      // Nuclear pores (Golden dots arrayed on the outer envelope)
      const poreGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const poreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      for (let i = 0; i < 8; i++) {
        const pore = new THREE.Mesh(poreGeo, poreMat);
        const theta = 0.3 + (i * 0.4);
        const phi = 0.5 + (i * 0.7);
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
      const headMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.1 });
      const tailMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

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
        emissive: 0x064e3b,
        roughness: 0.3,
        side: THREE.DoubleSide
      });
      const channelMesh = new THREE.Mesh(channelGeo, channelMat);
      group.add(channelMesh);

      // Translucent protective field halo
      const shieldRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.025, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
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
        emissive: 0x7c2d12,
        roughness: 0.3
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
        transparent: true,
        opacity: 0.6,
        roughness: 0.25
      });
      const chloroMesh = new THREE.Mesh(chloroGeo, chloroMat);
      group.add(chloroMesh);

      // Stacked thylakoids (grana stacks of green coin-like discs)
      const thylaMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.3 });
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
      // Rigid rectangular cell framework block
      const wallBoxGeo = new THREE.BoxGeometry(0.56, 0.56, 0.56);
      const wallBoxMat = new THREE.MeshStandardMaterial({
        color: 0x92400e,
        roughness: 0.45,
        metalness: 0.1
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
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 })
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
        transparent: true,
        opacity: 0.72,
        roughness: 0.05,
        metalness: 0.15
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

  // Create Brand Identity Text Plane for ARSelNel Center Monument
  function createBrandTextPlane(title, subtitle, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Rounded glowing glass panel
    ctx.fillStyle = 'rgba(9, 23, 32, 0.88)';
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

    // Subtitle: SCIENCE ADVENTURE
    ctx.fillStyle = '#facc15';
    ctx.font = '800 24px Nunito, sans-serif';
    ctx.fillText(`★  ${subtitle}  ★`, 256, 115);

    const texture = new THREE.CanvasTexture(canvas);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
    );
    return plane;
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

  // ==============================================================================
  // INPUT HANDLING & MOVEMENT (KEYBOARD & TOUCH)
  // ==============================================================================

  function bindEvents() {
    // 1. Keyboard Controls (WASD / Arrows)
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 2. Desktop Mouse Drag Look (Pan camera when dragging canvas)
    let isMouseDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    DOM.canvasContainer.addEventListener('mousedown', (e) => {
      if (State.isPaused || DOM.stationModal.classList.contains('open')) return;
      isMouseDragging = true;
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

    window.addEventListener('mouseup', () => { isMouseDragging = false; });

    // 3. Mobile Right-Side Touch Look Zone (Pan camera with right thumb)
    if (DOM.touchZone) {
      DOM.touchZone.addEventListener('touchstart', (e) => {
        if (State.isPaused || DOM.stationModal.classList.contains('open')) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (!touchLookState.active) {
            touchLookState.active = true;
            touchLookState.touchId = t.identifier;
            touchLookState.prevX = t.clientX;
            touchLookState.prevY = t.clientY;
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
          if (e.changedTouches[i].identifier === touchLookState.touchId) {
            touchLookState.active = false;
            touchLookState.touchId = null;
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
        if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
          openStationModal(State.nearbyStationIndex);
        }
      };
      DOM.mobileInteractBtn.addEventListener('click', handleMobileInteract);
      DOM.mobileInteractBtn.addEventListener('touchstart', handleMobileInteract, { passive: false });
    }

    // 6. HUD Buttons
    if (DOM.promptActionBtn) {
      DOM.promptActionBtn.addEventListener('click', () => {
        if (State.nearbyStationIndex >= 0) {
          openStationModal(State.nearbyStationIndex);
        }
      });
    }

    if (DOM.soundToggleBtn) DOM.soundToggleBtn.addEventListener('click', toggleSound);
    if (DOM.pauseBtn) DOM.pauseBtn.addEventListener('click', togglePause);
    if (DOM.helpBtn) DOM.helpBtn.addEventListener('click', openHowToPlayDialog);
    if (DOM.modeSelectBtn) DOM.modeSelectBtn.addEventListener('click', openModeDialog);
    if (DOM.gyroResetBtn) DOM.gyroResetBtn.addEventListener('click', resetGyroOrientation);
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

    // 11. WebXR AR overlay buttons
    if (DOM.arExitBtn) DOM.arExitBtn.addEventListener('click', exitARSession);

    // 12. Window Resize & Orientation Change
    window.addEventListener('resize', onWindowResize);
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

    // Touch events
    base.addEventListener('touchstart', (e) => {
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
      if (e.pointerType === 'mouse' && e.button === 0) {
        base.setPointerCapture(e.pointerId);
        thumb.style.transition = '';
        updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    base.addEventListener('pointermove', (e) => {
      if (base.hasPointerCapture && base.hasPointerCapture(e.pointerId)) {
        updateJoystickPosition(e.clientX, e.clientY);
      }
    });

    const handlePointerUp = (e) => {
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

  function updatePlayerMovement() {
    if (State.isPaused || DOM.stationModal.classList.contains('open')) return;

    // In Three.js standard coordinates, the camera looks down -Z when rotY = 0.
    // Horizontal Forward Unit Vector (where the camera is looking):
    // forwardX = -sin(rotY), forwardZ = -cos(rotY)
    // Horizontal Strafe Right Unit Vector (90 deg clockwise to the right):
    // rightX = cos(rotY), rightZ = -sin(rotY)
    const forwardX = -Math.sin(player.rotY);
    const forwardZ = -Math.cos(player.rotY);
    const rightX = Math.cos(player.rotY);
    const rightZ = -Math.sin(player.rotY);

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

    // 1. Room Boundary Collision (Walls at -8.2 to 8.2 and -10.2 to 10.2)
    const minX = -8.2;
    const maxX = 8.2;
    const minZ = -10.2;
    const maxZ = 10.2;

    let validX = Math.max(minX, Math.min(maxX, nextX));
    let validZ = Math.max(minZ, Math.min(maxZ, nextZ));

    // 2. Central ARSelNel Research Monument Collision (Radius 2.6m)
    const distToCenter = Math.hypot(validX, validZ);
    if (distToCenter < 2.6) {
      const angle = Math.atan2(validZ, validX);
      validX = Math.cos(angle) * 2.6;
      validZ = Math.sin(angle) * 2.6;
    }

    player.x = validX;
    player.z = validZ;

    // In WebXR immersive-ar mode with real physical tracking, WebXR sets camera pose.
    // In standard 3D and Camera AR modes, update Three.js camera from player coordinates:
    if (!renderer.xr.isPresenting) {
      camera.position.set(player.x, player.y, player.z);

      // If DeviceOrientation Gyro is active, blend gyro orientation
      if (gyroState.active && State.mode === 'camera-ar') {
        const radYaw = THREE.MathUtils.degToRad(gyroState.alpha - (gyroState.initialAlpha || 0));
        camera.rotation.set(player.pitch, player.rotY - radYaw, 0, 'YXZ');
      } else {
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
    }

    // 3. Proximity detection to 8 stations
    checkStationProximity();

    // 4. Proximity detection to unlocked exit door ("Pintu Pakar Sel")
    if (exitDoorMeshes && exitDoorMeshes.unlocked && Math.abs(player.x) < 2.2 && player.z < -9.0) {
      if (!State.isCompleted) {
        completeMission();
      }
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

  // ==============================================================================
  // 3D INTERACTIVE ORGANELLE PREVIEW BOX IN MODAL
  // ==============================================================================

  function initStationPreview() {
    if (!DOM.stnPreviewCanvas) return;

    previewScene = new THREE.Scene();
    previewCamera = new THREE.PerspectiveCamera(40, 2, 0.1, 50);
    previewCamera.position.set(0, 0.4, 2.2);
    previewCamera.lookAt(0, 0, 0);

    previewRenderer = new THREE.WebGLRenderer({
      canvas: DOM.stnPreviewCanvas,
      antialias: true,
      alpha: true
    });
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lights for preview
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    previewScene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xdcfce7, 1.2);
    dirLight1.position.set(2, 4, 3);
    previewScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.7);
    dirLight2.position.set(-2, -2, -2);
    previewScene.add(dirLight2);

    // Interactive Drag to Rotate Preview Model
    let isPreviewDragging = false;
    let prevX = 0;
    let prevY = 0;
    const host = DOM.stnPreviewHost || DOM.stnPreviewCanvas;

    const onStart = (clientX, clientY) => {
      isPreviewDragging = true;
      prevX = clientX;
      prevY = clientY;
    };
    const onMove = (clientX, clientY) => {
      if (!isPreviewDragging || !previewModelGroup) return;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      previewModelGroup.rotation.y += dx * 0.015;
      previewModelGroup.rotation.x = Math.max(-0.6, Math.min(0.6, previewModelGroup.rotation.x + dy * 0.015));
    };

    host.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', () => { isPreviewDragging = false; });

    host.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', () => { isPreviewDragging = false; }, { passive: true });
  }

  function updateStationPreview(stn) {
    if (!previewScene) return;

    // Remove existing preview model
    if (previewModelGroup) {
      previewScene.remove(previewModelGroup);
      previewModelGroup = null;
    }

    // Build dedicated preview representation of the organelle
    previewModelGroup = buildStylizedOrganelle(stn.number, stn.colorHex);
    previewModelGroup.scale.set(1.4, 1.4, 1.4);
    previewScene.add(previewModelGroup);

    // Resize preview renderer to match container
    const rect = DOM.stnPreviewCanvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      previewCamera.aspect = rect.width / rect.height;
      previewCamera.updateProjectionMatrix();
      previewRenderer.setSize(rect.width, rect.height);
    }

    // Render loop for modal preview
    cancelAnimationFrame(previewAnimId);
    function animatePreview() {
      if (DOM.stationModal.classList.contains('open')) {
        previewAnimId = requestAnimationFrame(animatePreview);
        if (previewModelGroup) {
          previewModelGroup.rotation.y += 0.008; // Gentle auto-rotation
        }
        previewRenderer.render(previewScene, previewCamera);
      }
    }
    animatePreview();
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

    // Update 3D Interactive Preview Box
    updateStationPreview(stn);

    DOM.quizFeedback.style.display = 'none';
    DOM.stationModal.classList.add('open');

    SoundFX.interact();
  }

  function closeStationModal() {
    DOM.stationModal.classList.remove('open');
    cancelAnimationFrame(previewAnimId);
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
      stnMesh.halo.material.color.setHex(0x10b981);
      stnMesh.beacon.children[0].material.color.setHex(0x10b981);
      stnMesh.beacon.children[0].material.emissive.setHex(0x064e3b);
    }

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

    exitDoorMeshes.shield.material.color.setHex(0x10b981);
    exitDoorMeshes.shield.material.opacity = 0.2;
    exitDoorMeshes.exitSign.material.color?.setHex?.(0x10b981);

    animatedObjects.push({
      progress: 0,
      update() {
        if (this.progress < 1.4) {
          this.progress += 0.02;
          exitDoorMeshes.leftDoor.position.x = -1.05 - this.progress;
          exitDoorMeshes.rightDoor.position.x = 1.05 + this.progress;
        }
      }
    });

    SoundFX.victory();
    alertToast('🌟 TAHNIAH! Semua 8 Lencana Diperoleh! Pintu Pakar Sel Kini Terbuka!');
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
  }

  // ==============================================================================
  // MODE SELECTION: MOD JELAJAH 3D, MOD KAMERA INTERAKTIF, MOD AR SPASIAL (WEBXR)
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

    // 1. Cleanup existing active mode
    if (State.mode === 'camera-ar' && mode !== 'camera-ar') {
      stopInteractiveCamera();
    }
    if (State.mode === 'ar' && mode !== 'ar') {
      await exitARSession();
    }

    State.mode = mode;

    if (mode === '3d') {
      // 3D Walkthrough Mode (Default)
      scene.background = new THREE.Color(0x0a161e);
      renderer.setClearColor(0x0a161e, 1);
      renderer.xr.enabled = false;
      if (DOM.hudModeIcon) DOM.hudModeIcon.textContent = '🖥️';
      if (DOM.hudModeText) DOM.hudModeText.textContent = 'Mod Jelajah 3D';
      if (DOM.gyroResetBtn) DOM.gyroResetBtn.style.display = 'none';
      alertToast('🖥️ Mod Jelajah 3D Aktif: Terokai makmal menggunakan kekunci atau joystick.');
    } else if (mode === 'camera-ar') {
      // Live Mobile Camera AR Mode
      await startInteractiveCamera();
    } else if (mode === 'ar') {
      // Real WebXR Spatial AR Mode
      await startWebXRAR();
    }
  }

  // ------------------------------------------------------------------------------
  // 6.2 MOD KAMERA INTERAKTIF (MOBILE CAMERA AR OVERLAY)
  // ------------------------------------------------------------------------------
  async function startInteractiveCamera() {
    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      showCameraErrorModal('Sambungan Selamat Diperlukan (HTTPS)', 'Akses kamera pada telefon pintar memerlukan sambungan selamat (HTTPS) atau localhost.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraErrorModal('Kamera Tidak Disokong', 'Pelayar web ini tidak menyokong fungsi capaian kamera getUserMedia.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      cameraStream = stream;
      if (DOM.cameraFeed) {
        DOM.cameraFeed.srcObject = stream;
        DOM.cameraFeed.style.display = 'block';
        await DOM.cameraFeed.play();
      }

      // Make 3D scene background transparent so real camera feed is visible behind
      scene.background = null;
      renderer.setClearColor(0x000000, 0);

      // Setup Device Orientation (Gyroscope view)
      setupDeviceOrientation();

      if (DOM.hudModeIcon) DOM.hudModeIcon.textContent = '📷';
      if (DOM.hudModeText) DOM.hudModeText.textContent = 'Mod Kamera Interaktif';
      if (DOM.gyroResetBtn) DOM.gyroResetBtn.style.display = 'flex';

      alertToast('📷 Mod Kamera Interaktif Aktif: Halakan telefon & gunakan joystick untuk bergerak.');
    } catch (err) {
      console.warn('Camera AR initialization error:', err);
      let errMsg = 'Kebenaran capaian kamera ditolak oleh pelayar atau peranti tidak mempunyai kamera aktif.';
      if (err.name === 'NotAllowedError') {
        errMsg = 'Kebenaran kamera telah ditolak. Sila benarkan akses kamera dalam tetapan pelayar anda untuk mod ini.';
      } else if (err.name === 'NotFoundError') {
        errMsg = 'Tiada sensor kamera belakang dikesan pada peranti ini.';
      } else if (err.name === 'NotReadableError') {
        errMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      showCameraErrorModal('Kebenaran Kamera Diperlukan', errMsg);
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
    gyroState.active = false;
  }

  function showCameraErrorModal(title, message) {
    if (DOM.cameraFallbackTitle) DOM.cameraFallbackTitle.textContent = title;
    if (DOM.cameraFallbackMsg) DOM.cameraFallbackMsg.textContent = message;
    if (DOM.cameraFallbackModal) DOM.cameraFallbackModal.classList.add('open');
  }

  // Device Orientation (Gyroscope / Compass) handling
  function setupDeviceOrientation() {
    if (typeof DeviceOrientationEvent === 'undefined') return;

    const onOrientation = (e) => {
      if (e.alpha === null) return;
      if (gyroState.initialAlpha === null) {
        gyroState.initialAlpha = e.alpha;
      }
      gyroState.alpha = e.alpha;
      gyroState.beta = e.beta;
      gyroState.gamma = e.gamma;
      gyroState.active = true;
    };

    // iOS 13+ permission request
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', onOrientation);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientation', onOrientation);
    }
  }

  function resetGyroOrientation() {
    gyroState.initialAlpha = gyroState.alpha;
    player.rotY = 0;
    alertToast('🔄 Orientasi Giroskop Ditetapkan Semula');
  }

  // ------------------------------------------------------------------------------
  // 6.1 MOD AR SPASIAL (WEBXR IMMERSIVE-AR WITH HIT-TEST)
  // ------------------------------------------------------------------------------
  async function startWebXRAR() {
    if (!navigator.xr || typeof navigator.xr.isSessionSupported !== 'function') {
      showARUnsupportedNotice('Pelayar anda tidak menyokong WebXR AR Spasial. Mod Kamera Interaktif dibuka sebagai alternatif.');
      selectMode('camera-ar');
      return;
    }

    let isSupported = false;
    try {
      isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    } catch (_) {
      isSupported = false;
    }

    if (!isSupported) {
      showARUnsupportedNotice('Peranti anda tidak mempunyai penderia AR Spasial WebXR (ARCore). Beralih ke Mod Kamera Interaktif.');
      selectMode('camera-ar');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local', 'hit-test']
      });

      xrSession = session;
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);

      // Apply Tabletop Mini Lab scale or Room scale
      if (labEnvironmentGroup) {
        if (arScaleMode === 'mini') {
          labEnvironmentGroup.scale.set(0.12, 0.12, 0.12);
        } else {
          labEnvironmentGroup.scale.set(1.0, 1.0, 1.0);
        }
      }

      DOM.arOverlay.style.display = 'flex';
      setupARReticle();

      if (DOM.hudModeIcon) DOM.hudModeIcon.textContent = '✨';
      if (DOM.hudModeText) DOM.hudModeText.textContent = 'Mod AR Spasial (WebXR)';

      session.addEventListener('end', () => {
        xrSession = null;
        DOM.arOverlay.style.display = 'none';
        if (labEnvironmentGroup) labEnvironmentGroup.scale.set(1.0, 1.0, 1.0);
        selectMode('3d');
      });

      alertToast('✨ Mod AR Spasial Aktif: Halakan telefon ke lantai atau meja untuk meletakkan makmal.');
    } catch (err) {
      console.warn('WebXR AR session request failed:', err);
      showARUnsupportedNotice('Sesi WebXR AR tidak dapat dimulakan. Beralih ke Mod Kamera Interaktif.');
      selectMode('camera-ar');
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
        if (reticleMesh && reticleMesh.visible && labEnvironmentGroup) {
          labEnvironmentGroup.position.copy(reticleMesh.position);
          alertToast('📍 Makmal diletakkan di atas permukaan yang dikesan!');
        }
      });
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
    DOM.arOverlay.style.display = 'none';
    if (labEnvironmentGroup) labEnvironmentGroup.scale.set(1.0, 1.0, 1.0);
    renderer.xr.enabled = false;
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
