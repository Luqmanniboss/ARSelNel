/**
 * ==============================================================================
 * MOD D — CELL SAFARI: JELAJAH HUTAN SEL 3D (ARSELNEL)
 * Enjin Pengembaraan Hutan Fantasi 3D, Haiwan Interaktif, 3D Cell Explorer,
 * Cabaran Pembelajaran KSSM Tingkatan 1 & Pemulihan Pokok Kehidupan
 * ==============================================================================
 */

(function () {
  'use strict';

  // 1. DATA 5 ZON HUTAN & HAIWAN SAFARI (KSSM TINGKATAN 1)
  const SAFARI_ZONES = [
    {
      id: 'zone-1-rabbit',
      index: 0,
      name: 'Padang Rumput Arnab',
      animal: 'Arnab Comel',
      species: 'Oryctolagus cuniculus',
      emoji: '🐰',
      color: '#10b981',
      colorHex: 0x10b981,
      pos: { x: -30, z: 26 },
      topic: 'Membran Sel & Sitoplasma',
      badge: 'Penyelidik Membran',
      fact: 'Arnab ialah herbivor yang pantas. Trilion sel di dalam tubuh arnab dilindungi oleh membran sel yang fleksibel dan telap memilih!',
      focusOrganelle: 'Membran Sel',
      challenge: {
        title: 'Cabaran 1: Kenal Pasti Lapisan & Jeli Sel',
        question: 'Bahagian manakah yang mengawal pergerakan bahan masuk dan keluar dari sel haiwan?',
        options: [
          'A. Sitoplasma — medium tindak balas kimia',
          'B. Membran Sel — lapisan separa telap',
          'C. Dinding Sel — lapisan tegar selulosa',
          'D. Kloroplas — menyerap cahaya suria'
        ],
        correct: 1, // B
        explanation: 'Jawapan Tepat: B. Membran sel bersifat separa telap dan mengawal pergerakan bahan masuk dan keluar dari sel haiwan. (Nota Sains: Sel haiwan TIADA dinding sel atau kloroplas).'
      }
    },
    {
      id: 'zone-2-deer',
      index: 1,
      name: 'Lembah Rusa',
      animal: 'Rusa Anggun',
      species: 'Rusa unicolor',
      emoji: '🦌',
      color: '#0ea5e9',
      colorHex: 0x0ea5e9,
      pos: { x: 32, z: 28 },
      topic: 'Nukleus: Pusat Kawalan Sel',
      badge: 'Pakar Genetik Sel',
      fact: 'Rusa mempunyai deria pendengaran dan penglihatan yang tajam. Seluruh aktiviti sel rusa dikawal oleh nukleus yang mengandungi maklumat genetik (DNA).',
      focusOrganelle: 'Nukleus',
      challenge: {
        title: 'Cabaran 2: Misi Pusat Kawalan Sel',
        question: 'Apakah peranan utama nukleus di dalam sel haiwan seperti rusa?',
        options: [
          'A. Menghasilkan glukosa melalui fotosintesis',
          'B. Mengawal semua aktiviti sel serta menyimpan maklumat genetik (DNA)',
          'C. Menyerap nutrien dari luar sel secara langsung',
          'D. Membentuk struktur tegar luar sel'
        ],
        correct: 1, // B
        explanation: 'Jawapan Tepat: B. Nukleus merupakan pusat kawalan sel yang mengawal semua aktiviti biologi sel dan mengandungi kromosom yang membawa DNA.'
      }
    },
    {
      id: 'zone-3-monkey',
      index: 2,
      name: 'Hutan Monyet',
      animal: 'Monyet Ceria',
      species: 'Macaca fascicularis',
      emoji: '🐵',
      color: '#f59e0b',
      colorHex: 0xf59e0b,
      pos: { x: 34, z: -30 },
      topic: 'Mitokondrion: Bio-Tenaga Sel',
      badge: 'Penjana Bio-Tenaga',
      fact: 'Monyet melompat aktif di antara dahan pokok tropika. Aktiviti cergas ini memerlukan bekalan tenaga ATP berterusan yang dijana oleh mitokondrion!',
      focusOrganelle: 'Mitokondria',
      challenge: {
        title: 'Cabaran 3: Misi Penjana Tenaga Sel',
        question: 'Organel manakah yang dikenali sebagai "Pusat Tenaga Sel" kerana menjalankan respirasi sel untuk membebaskan tenaga?',
        options: [
          'A. Nukleus',
          'B. Sitoplasma',
          'C. Mitokondrion',
          'D. Vakuol Pusat'
        ],
        correct: 2, // C
        explanation: 'Jawapan Tepat: C. Mitokondrion menguraikan glukosa melalui proses respirasi sel aerob untuk membebaskan tenaga (ATP) bagi membolehkan haiwan bergerak aktif.'
      }
    },
    {
      id: 'zone-4-bird',
      index: 3,
      name: 'Taman Burung',
      animal: 'Burung Rimba',
      species: 'Copsychus malabaricus',
      emoji: '🐦',
      color: '#8b5cf6',
      colorHex: 0x8b5cf6,
      pos: { x: -32, z: -28 },
      topic: 'Persamaan Struktur Asas Sel Haiwan',
      badge: 'Penyelaras Struktur Sel',
      fact: 'Burung boleh terbang tinggi dengan otot kepak yang kuat. Walaupun rupa burung berbeza daripada rusa atau arnab, SEMUA haiwan terbina daripada unit asas sel haiwan yang sama!',
      focusOrganelle: 'Struktur Asas',
      challenge: {
        title: 'Cabaran 4: Padanan Struktur Sel Haiwan',
        question: 'Antara berikut, manakah ciri yang BENAR tentang sel haiwan (seperti burung, arnab, dan manusia)?',
        options: [
          'A. Mempunyai membran sel, sitoplasma, dan nukleus; tidak mempunyai bentuk tetap',
          'B. Mempunyai kloroplas untuk membuat makanan sendiri',
          'C. Dilindungi oleh dinding sel yang tegar daripada selulosa',
          'D. Mengandungi vakuol pusat bersaiz sangat besar'
        ],
        correct: 0, // A
        explanation: 'Jawapan Tepat: A. Sel haiwan tidak mempunyai dinding sel atau kloroplas, mempunyai bentuk tidak tetap, dan mengandungi membran sel, sitoplasma, nukleus serta mitokondrion.'
      }
    },
    {
      id: 'zone-5-fox',
      index: 4,
      name: 'Hutan Misteri Musang',
      animal: 'Musang Pintar',
      species: 'Vulpes vulpes',
      emoji: '🦊',
      color: '#ec4899',
      colorHex: 0xec4899,
      pos: { x: 0, z: -46 },
      topic: 'Pengukuhan Keseluruhan Sel Haiwan',
      badge: 'Penjaga Hutan Sel',
      fact: 'Musang terkenal dengan kepintarannya menyusup di hutan misteri. Musang menyimpan Kristal Kehidupan kelima untuk saintis muda yang berjaya menguasai sains sel!',
      focusOrganelle: 'Semua Organel',
      challenge: {
        title: 'Cabaran 5: Kuiz Master Saintis Hutan',
        question: 'Seorang murid memerhatikan sel haiwan di bawah mikroskop cahaya. Struktur manakah yang PASTI TIDAK AKAN ditemui dalam sel tersebut?',
        options: [
          'A. Nukleus dan membran sel',
          'B. Sitoplasma dan mitokondrion',
          'C. Dinding sel dan kloroplas',
          'D. Membran nukleus'
        ],
        correct: 2, // C
        explanation: 'Jawapan Tepat: C. Dinding sel dan kloroplas hanya terdapat pada sel tumbuhan hijau, dan tiada dalam sel haiwan.'
      }
    }
  ];

  // KANDUNGAN ORGANEL SEL HAIWAN (KSSM TINGKATAN 1)
  const ORGANELLES_INFO = {
    'Membran Sel': {
      title: 'Membran Sel',
      icon: '🛡️',
      color: '#06b6d4',
      function: 'Lapisan nipis dan fleksibel yang menyelaputi protoplasma sel. Bersifat telap memilih (separa telap) dan mengawal pergerakan bahan (nutrien, air, bahan kumuh) masuk dan keluar dari sel.'
    },
    'Sitoplasma': {
      title: 'Sitoplasma',
      icon: '💧',
      color: '#eab308',
      function: 'Bahan seperti jeli yang mengisi ruang antara membran sel dan nukleus. Mengandungi 70-80% air dan enzim; merupakan medium tempat berlakunya pelbagai tindak balas kimia dan metabolisme biologi.'
    },
    'Nukleus': {
      title: 'Nukleus & Nukleolus',
      icon: '🧬',
      color: '#8b5cf6',
      function: 'Pusat kawalan utama sel yang berbentuk sfera atau bujur. Mengandungi asid deoksiribonukleik (DNA) dan kromosom yang membawa maklumat pewarisan genetik serta mengawal semua aktiviti sel.'
    },
    'Mitokondria': {
      title: 'Mitokondrion (Pusat Tenaga Sel)',
      icon: '⚡',
      color: '#f97316',
      function: 'Organel berbentuk rod bujur yang menjalankan respirasi sel aerob. Mitokondrion menguraikan glukosa dengan oksigen untuk membebaskan tenaga kimia (ATP) bagi aktiviti hidup haiwan.'
    },
    'Jasad Golgi': {
      title: 'Jasad Golgi (Aparatus Golgi)',
      icon: '📦',
      color: '#ec4899',
      function: 'Kantung bermembran selari yang memproses, mengubah suai, membungkus, dan mengangkut protein serta karbohidrat ke bahagian sel lain atau dirembes keluar.'
    }
  };

  // 2. SYNTHESIZER AUDIO SAINS (WEB AUDIO API — BEBAS ASET)
  const SafariAudio = {
    ctx: null,
    muted: false,
    init() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) this.ctx = new AudioCtx();
      } catch (_) {}
    },
    play(freq, type, duration, gainVal = 0.12) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
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
    chime() {
      this.play(523.25, 'sine', 0.25, 0.1);
      setTimeout(() => this.play(659.25, 'sine', 0.25, 0.1), 100);
      setTimeout(() => this.play(783.99, 'sine', 0.4, 0.12), 200);
    },
    correct() {
      this.play(587.33, 'triangle', 0.15, 0.12);
      setTimeout(() => this.play(880.0, 'sine', 0.35, 0.15), 120);
    },
    wrong() {
      this.play(261.63, 'sawtooth', 0.2, 0.1);
      setTimeout(() => this.play(220.0, 'sawtooth', 0.3, 0.1), 160);
    },
    rabbitPop() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (_) {}
    },
    deerChime() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      try {
        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 gentle forest chime
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.35);
        });
      } catch (_) {}
    },
    monkeyCall() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      try {
        const now = this.ctx.currentTime;
        [440, 660, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.09 + 0.05);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + idx * 0.09 + 0.12);
          gain.gain.setValueAtTime(0.08, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.14);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.14);
        });
      } catch (_) {}
    },
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, idx) => setTimeout(() => this.play(f, 'sine', 0.5, 0.16), idx * 140));
    },
    birdChirp() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      try {
        const now = this.ctx.currentTime;
        // Chirp 1
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2800, now);
        osc1.frequency.exponentialRampToValueAtTime(4200, now + 0.05);
        osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.11);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);

        // Chirp 2 (sweeter second note)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(3300, now + 0.13);
        osc2.frequency.exponentialRampToValueAtTime(4700, now + 0.18);
        osc2.frequency.exponentialRampToValueAtTime(3100, now + 0.24);
        gain2.gain.setValueAtTime(0.07, now + 0.13);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.13);
        osc2.stop(now + 0.26);
      } catch (_) {}
    }
  };

  // 3. STATE PENGEMBARAAN CELL SAFARI
  const State = {
    running: false,
    zones: SAFARI_ZONES,
    activeZoneIndex: -1,
    nearbyZoneIndex: -1,
    completedZones: new Set(), // Set of zone indices [0..4]
    score: 0,
    startTime: Date.now(),
    durationSeconds: 0,
    timerInterval: null,
    isPaused: false,
    isCompleted: false,
    nearTreeOfLife: false,
    treeActivated: false,
    crystalsCount: 0,
    user: null,
    // Explorer state
    selectedOrganelleKey: 'Membran Sel',
    explorerModel: null,
    challengeAnswered: {} // zoneIndex -> bool
  };

  // 4. THREE.JS ENGINE COMPONENTS (MAIN FOREST 3D)
  let scene, camera, renderer;
  let forestEnvironmentGroup = null;
  let treeOfLifeGroup = null;
  let animalMeshes = [];
  let firefliesGroup = null;
  let butterfliesGroup = null;
  let monkeyForestGroup = null;
  let decorativeMonkeys = [];
  let animGroup_zone3_monkeyAudio = false;
  let deerValleyGroup = null;
  let decorativeDeers = [];
  let animGroup_zone2_deerAudio = false;
  let rabbitMeadowGroup = null;
  let decorativeRabbits = [];
  let animGroup_zone1_rabbitAudio = false;
  let birdSanctuaryGroup = null;
  let decorativeBirds = [];
  let animGroup_zone4_chirped = false;
  let animatedObjects = [];

  // PLAYER FIRST-PERSON STATE
  const player = {
    x: 0,
    y: 1.6,
    z: 20, // Start just south of the Tree of Life
    rotY: 0,
    pitch: 0,
    speed: 0.15,
    keys: { forward: false, backward: false, left: false, right: false }
  };

  // JOYSTICK & TOUCH STATE (CAMERA-RELATIVE)
  const joystickState = { active: false, touchId: null, x: 0, y: 0 };
  const touchLookState = { active: false, touchId: null, prevX: 0, prevY: 0 };

  // GYROSCOPE ORIENTATION STATE (IPAD / MOBILE)
  const gyro = {
    supported: false,
    enabled: false,
    active: false,
    calibrated: false,
    baseAlpha: 0,
    baseBeta: 0,
    baseGamma: 0,
    currentAlpha: 0,
    currentBeta: 0,
    currentGamma: 0,
    yaw: 0,
    pitch: 0
  };

  // 5. 3D CELL EXPLORER ENGINE (MODAL EMBEDDED SCENE)
  let explorerScene, explorerCamera, explorerRenderer;
  let explorerOrganelleMeshes = {};
  let explorerAnimId = null;
  let explorerDrag = { active: false, prevX: 0, prevY: 0, rotY: 0, rotX: 0, targetZoom: 3.2 };

  // 6. DOM REFERENCES
  const DOM = {};

  function initDOM() {
    DOM.canvasWrap = document.getElementById('cs-canvas-wrap');
    DOM.hud = document.getElementById('cs-hud');
    DOM.backBtn = document.getElementById('cs-back-btn');
    DOM.statFound = document.getElementById('cs-stat-found');
    DOM.statCrystal = document.getElementById('cs-stat-crystal');
    DOM.statScore = document.getElementById('cs-stat-score');
    DOM.statTime = document.getElementById('cs-stat-time');
    DOM.bookBtn = document.getElementById('cs-book-btn');
    DOM.gyroBtn = document.getElementById('cs-gyro-btn');
    DOM.soundBtn = document.getElementById('cs-sound-btn');
    DOM.helpBtn = document.getElementById('cs-help-btn');
    DOM.minimap = document.getElementById('cs-minimap');
    DOM.objective = document.getElementById('cs-objective');
    DOM.joystick = document.getElementById('cs-joystick');
    DOM.joystickBase = document.getElementById('cs-joystick-base');
    DOM.joystickThumb = document.getElementById('cs-joystick-thumb');
    DOM.touchLook = document.getElementById('cs-touch-look');
    DOM.prompt = document.getElementById('cs-prompt');
    DOM.promptIcon = document.getElementById('cs-prompt-icon');
    DOM.promptTitle = document.getElementById('cs-prompt-title');
    DOM.promptSub = document.getElementById('cs-prompt-sub');
    DOM.promptBtn = document.getElementById('cs-prompt-btn');
    DOM.promptBtnText = document.getElementById('cs-prompt-btn-text');
    DOM.toast = document.getElementById('cs-toast');
    DOM.intro = document.getElementById('cs-intro');
    DOM.introStart = document.getElementById('cs-intro-start');
    DOM.introBack = document.getElementById('cs-intro-back');
    DOM.loading = document.getElementById('cs-loading');
    DOM.explorer = document.getElementById('cs-explorer');
    DOM.explorerCanvas = document.getElementById('cs-explorer-canvas');
    DOM.explorerClose = document.getElementById('cs-explorer-close');
    DOM.explorerBack = document.getElementById('cs-explorer-back');
    DOM.explorerKicker = document.getElementById('cs-explorer-kicker');
    DOM.focusNote = document.getElementById('cs-focus-note');
    DOM.organelleChips = document.getElementById('cs-organelle-chips');
    DOM.organelleInfo = document.getElementById('cs-organelle-info');
    DOM.challenge = document.getElementById('cs-challenge');
    DOM.challengeStart = document.getElementById('cs-challenge-start');
    DOM.challengeStartText = document.getElementById('cs-challenge-start-text');
    DOM.zoomIn = document.getElementById('cs-zoom-in');
    DOM.zoomOut = document.getElementById('cs-zoom-out');
    DOM.book = document.getElementById('cs-book');
    DOM.bookClose = document.getElementById('cs-book-close');
    DOM.bookGrid = document.getElementById('cs-book-grid');
    DOM.victory = document.getElementById('cs-victory');
    DOM.vAnimals = document.getElementById('cs-v-animals');
    DOM.vScore = document.getElementById('cs-v-score');
    DOM.vTime = document.getElementById('cs-v-time');
    DOM.vExplore = document.getElementById('cs-v-explore');
    DOM.vLobby = document.getElementById('cs-v-lobby');
    DOM.saveStatus = document.getElementById('cs-save-status');
  }

  function alertToast(msg) {
    if (!DOM.toast) return;
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    clearTimeout(DOM.toast._timer);
    DOM.toast._timer = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 3200);
  }

  // 7. INITIALIZE THREE.JS MAIN FOREST SCENE
  function initForestScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbbf7d0);
    scene.fog = new THREE.FogExp2(0xbbf7d0, 0.013);

    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 250);
    camera.rotation.order = 'YXZ';
    camera.position.set(player.x, player.y, player.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = false; // Keep smooth 60fps on mobile/iPad
    renderer.outputEncoding = THREE.sRGBEncoding;

    DOM.canvasWrap.innerHTML = '';
    DOM.canvasWrap.appendChild(renderer.domElement);

    // Pencahayaan Hutan Fantasi
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x10b981, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 0.85);
    sunLight.position.set(45, 60, 30);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    buildForestEnvironment();
    buildTreeOfLife();
    buildSafariAnimals();
    buildFirefliesAndButterflies();

    window.addEventListener('resize', onWindowResize);
    requestAnimationFrame(renderLoop);
  }

  function onWindowResize() {
    if (!renderer || !camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // 8. BUILD COLOURFUL LOW-POLY FANTASY FOREST (FASA 5 & 6)
  function buildForestEnvironment() {
    forestEnvironmentGroup = new THREE.Group();
    forestEnvironmentGroup.name = 'ForestEnvironment';

    // 1. Terrain Base (110m x 110m)
    const groundGeo = new THREE.PlaneGeometry(120, 120, 24, 24);
    // Berikan sedikit beralun low-poly pada puncak
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getY(i);
      // Kekalkan tengah rata untuk Tree of Life
      const dist = Math.hypot(vx, vz);
      if (dist > 8) {
        const h = Math.sin(vx * 0.12) * Math.cos(vz * 0.12) * 0.75 + Math.sin(vx * 0.05 + vz * 0.05) * 0.5;
        posAttr.setZ(i, h);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    forestEnvironmentGroup.add(ground);

    // 2. Laluan Tanah / Dirt Trails connecting Tree of Life to 5 Zones
    const trailMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.9,
      flatShading: true
    });
    SAFARI_ZONES.forEach(z => {
      const dx = z.pos.x;
      const dz = z.pos.z;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const trail = new THREE.Mesh(new THREE.PlaneGeometry(2.4, len), trailMat);
      trail.rotation.x = -Math.PI / 2;
      trail.rotation.z = -angle;
      trail.position.set(dx / 2, 0.02, dz / 2);
      forestEnvironmentGroup.add(trail);

      // Papan Tanda Kawasan di zon
      buildZoneSignpost(z.name, z.pos.x, z.pos.z);
    });

    // 3. Sungai Mengalir & Jambatan Kayu (River from North-East to South-West)
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.78
    });
    const river = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 90), riverMat);
    river.rotation.x = -Math.PI / 2;
    river.rotation.z = Math.PI / 4;
    river.position.set(16, 0.03, -8);
    forestEnvironmentGroup.add(river);

    // Wooden Bridge at (16, 0.25, -8)
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.22, 7.5), bridgeMat);
    bridge.rotation.y = -Math.PI / 4;
    bridge.position.set(16, 0.22, -8);
    forestEnvironmentGroup.add(bridge);

    // 4. Low-Poly Trees (120 pokok pelbagai jenis)
    buildScatteredTrees(forestEnvironmentGroup);

    // 5. Batu, Bunga & Cendawan Comel
    buildScatteredFlora(forestEnvironmentGroup);

    // 6. Zon 4: Magical Colourful 3D Bird Sanctuary
    buildBirdSanctuaryZone4(forestEnvironmentGroup);

    // 7. Zon 1: Rabbit Meadow Sanctuary (Taman Arnab 3D)
    buildRabbitMeadowZone1(forestEnvironmentGroup);

    // 8. Zon 2: Deer Valley Sanctuary (Lembah Rusa Ajaib 3D)
    buildDeerValleyZone2(forestEnvironmentGroup);

    // 9. Zon 3: Monkey Forest Sanctuary (Hutan Monyet Tropika 3D)
    buildMonkeyForestZone3(forestEnvironmentGroup);

    scene.add(forestEnvironmentGroup);
  }

  function buildZoneSignpost(zoneTitle, x, z) {
    if (zoneTitle.includes('Arnab') || zoneTitle.includes('Rusa') || zoneTitle.includes('Monyet')) return; // Replaced by bespoke 3D Rabbit Sanctuary Signboard
    const postGroup = new THREE.Group();
    // Offset slightly from animal position
    postGroup.position.set(x - 3.5, 0, z + 2.5);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8), woodMat);
    pole.position.y = 0.9;
    postGroup.add(pole);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.08), woodMat);
    signBoard.position.set(0, 1.6, 0);
    postGroup.add(signBoard);

    // Canvas label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 256, 96);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 90);
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zoneTitle.split(' ')[0] || 'ZON', 128, 34);
    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.fillText(zoneTitle.split(' ').slice(1).join(' ') || '', 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.4), new THREE.MeshBasicMaterial({ map: texture }));
    labelMesh.position.set(0, 1.6, 0.05);
    postGroup.add(labelMesh);

    forestEnvironmentGroup.add(postGroup);
  }

  function buildScatteredTrees(parent) {
    const treeMatGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, flatShading: true, roughness: 0.8 });
    const treeMatPine = new THREE.MeshStandardMaterial({ color: 0x047857, flatShading: true, roughness: 0.8 });
    const treeMatFantasy = new THREE.MeshStandardMaterial({ color: 0x0d9488, flatShading: true, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });

    // Deterministic PRNG
    let seed = 42;
    function rnd() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    for (let i = 0; i < 95; i++) {
      const angle = rnd() * Math.PI * 2;
      const dist = 12 + rnd() * 42;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;

      // Jangan tanam di atas laluan terus haiwan atau di tengah pokok kehidupan
      if (Math.hypot(tx, tz) < 9) continue;
      // Jangan tanam di dalam kawasan khas Zon 4 Taman Burung (radius 16m dari x: -32, z: -28)
      if (Math.hypot(tx - (-32), tz - (-28)) < 16) continue;
      // Jangan tanam di dalam kawasan khas Zon 1 Taman Arnab (radius 15m dari x: -30, z: 26)
      if (Math.hypot(tx - (-30), tz - 26) < 15) continue;
      // Jangan tanam di dalam kawasan khas Zon 2 Lembah Rusa (radius 16m dari x: 32, z: 28)
      if (Math.hypot(tx - 32, tz - 28) < 16) continue;
      // Jangan tanam di dalam kawasan khas Zon 3 Hutan Monyet (radius 16m dari x: 34, z: -30)
      if (Math.hypot(tx - 34, tz - (-30)) < 16) continue;
      let tooCloseToAnimal = false;
      SAFARI_ZONES.forEach(z => {
        if (Math.hypot(tx - z.pos.x, tz - z.pos.z) < 4.5) tooCloseToAnimal = true;
      });
      if (tooCloseToAnimal) continue;

      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const type = Math.floor(rnd() * 3);
      const scale = 0.8 + rnd() * 0.6;

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 1.8 * scale, 7), trunkMat);
      trunk.position.y = 0.9 * scale;
      tree.add(trunk);

      if (type === 0) {
        // Pine Tree (3 stacked cones)
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.6 * scale, 2.0 * scale, 7), treeMatPine);
        c1.position.y = (1.8 + 0.8) * scale;
        const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.3 * scale, 1.8 * scale, 7), treeMatPine);
        c2.position.y = (1.8 + 1.8) * scale;
        const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 1.4 * scale, 7), treeMatPine);
        c3.position.y = (1.8 + 2.7) * scale;
        tree.add(c1, c2, c3);
      } else if (type === 1) {
        // Round Deciduous Tree
        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.7 * scale, 1), treeMatGreen);
        foliage.position.y = (1.8 + 1.2) * scale;
        tree.add(foliage);
      } else {
        // Fantasy Teal Tree
        const f1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 * scale, 0), treeMatFantasy);
        f1.position.y = (1.8 + 1.1) * scale;
        tree.add(f1);
      }

      parent.add(tree);
    }
  }

  function buildScatteredFlora(parent) {
    const flowerColors = [0xef4444, 0xf59e0b, 0xec4899, 0xa855f7, 0x38bdf8];
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, flatShading: true, roughness: 0.9 });

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 7 + Math.random() * 45;
      const fx = Math.cos(angle) * dist;
      const fz = Math.sin(angle) * dist;

      // Elakkan bunga/batu rawak bertindih dengan elemen terperinci Taman Burung
      if (Math.hypot(fx - (-32), fz - (-28)) < 16) continue;
      // Elakkan bunga/batu rawak bertindih dengan elemen terperinci Taman Arnab
      if (Math.hypot(fx - (-30), fz - 26) < 15) continue;
      // Elakkan bunga/batu rawak bertindih dengan elemen terperinci Lembah Rusa
      if (Math.hypot(fx - 32, fz - 28) < 16) continue;
      // Elakkan bunga/batu rawak bertindih dengan elemen terperinci Hutan Monyet
      if (Math.hypot(fx - 34, fz - (-30)) < 16) continue;

      if (i % 2 === 0) {
        // Flower Cluster
        const col = flowerColors[i % flowerColors.length];
        const fl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 5), new THREE.MeshBasicMaterial({ color: col }));
        fl.position.set(fx, 0.2, fz);
        parent.add(fl);
      } else {
        // Rock
        const s = 0.3 + Math.random() * 0.6;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rockMat);
        rock.position.set(fx, s * 0.4, fz);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        parent.add(rock);
      }
    }
  }

  // 9. TREE OF LIFE — POKOK KEHIDUPAN (FASA 13 & 14)
  function buildTreeOfLife() {
    treeOfLifeGroup = new THREE.Group();
    treeOfLifeGroup.name = 'TreeOfLife';
    treeOfLifeGroup.position.set(0, 0, 0);

    // 1. Raised Dais
    const daisMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.2 });
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.8, 0.45, 12), daisMat);
    dais.position.y = 0.225;
    treeOfLifeGroup.add(dais);

    const rimMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5.1, 0.08, 8, 36), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.46;
    treeOfLifeGroup.add(rim);

    // 2. Trunk with Gnarled Roots
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9, flatShading: true });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 5.5, 9), trunkMat);
    trunk.position.y = 3.0;
    treeOfLifeGroup.add(trunk);

    // 3. Crystal Leaves Foliage (Canopy of Glowing Crystals)
    const foliageGroup = new THREE.Group();
    foliageGroup.position.y = 6.2;
    const crystalLeafMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x047857,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92,
      flatShading: true
    });
    for (let c = 0; c < 7; c++) {
      const cLeaf = new THREE.Mesh(new THREE.OctahedronGeometry(1.6 + (c % 3) * 0.3, 0), crystalLeafMat);
      const cAngle = (c / 7) * Math.PI * 2;
      const cDist = c === 0 ? 0 : 2.2;
      cLeaf.position.set(Math.cos(cAngle) * cDist, (c % 2 === 0 ? 0.4 : -0.2), Math.sin(cAngle) * cDist);
      cLeaf.rotation.set(0.3, cAngle, 0.2);
      foliageGroup.add(cLeaf);
    }
    treeOfLifeGroup.add(foliageGroup);

    // 4. Five Crystal Sockets on Trunk (1 for each zone crystal)
    const crystalSlots = [];
    const slotColors = [0x10b981, 0x0ea5e9, 0xf59e0b, 0x8b5cf6, 0xec4899];
    for (let s = 0; s < 5; s++) {
      const sAngle = (s / 5) * Math.PI * 2 - Math.PI / 2;
      const sRadius = 1.7;
      const sGeo = new THREE.OctahedronGeometry(0.32, 0);
      sGeo.scale(0.8, 1.4, 0.8);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0x334155, // Malap pada permulaan
        emissive: 0x0f172a,
        emissiveIntensity: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.6
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set(Math.cos(sAngle) * sRadius, 2.8, Math.sin(sAngle) * sRadius);
      sMesh.userData = { slotIndex: s, targetColor: slotColors[s], lit: false };
      treeOfLifeGroup.add(sMesh);
      crystalSlots.push(sMesh);
    }

    // 5. Light Pillar & Orbiting Gimbal Ring
    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.04, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0x34d399, side: THREE.DoubleSide })
    );
    holoRing.rotation.x = Math.PI / 3;
    holoRing.position.y = 5.2;
    treeOfLifeGroup.add(holoRing);

    const treeLight = new THREE.PointLight(0x34d399, 1.4, 25);
    treeLight.position.set(0, 5.5, 0);
    treeOfLifeGroup.add(treeLight);

    treeOfLifeGroup.userData = {
      slots: crystalSlots,
      foliageGroup,
      crystalLeafMat,
      treeLight,
      holoRing,
      update(t) {
        foliageGroup.rotation.y = t * 0.15;
        holoRing.rotation.z = t * 0.25;
      }
    };

    animatedObjects.push(treeOfLifeGroup.userData);
    scene.add(treeOfLifeGroup);
  }

  // 10. FIVE PROCEDURAL LOW-POLY 3D ANIMALS (FASA 6 & 7)
  function buildSafariAnimals() {
    animalMeshes = [];

    SAFARI_ZONES.forEach((z, index) => {
      const animGroup = new THREE.Group();
      animGroup.name = `Animal_${z.id}`;
      animGroup.position.set(z.pos.x, 0, z.pos.z);
      animGroup.userData = { zoneIndex: index, zoneId: z.id, name: z.animal, emoji: z.emoji };

      // Base Halo on ground (Hero animals: Arnab Comel, Rusa Anggun, Monyet Ceria & Burung Rimba)
      const isHero = (index === 0 || index === 1 || index === 2 || index === 3);
      const haloColor = (index === 0) ? 0x10b981 : (index === 1 ? 0x0ea5e9 : (index === 2 ? 0xf59e0b : (index === 3 ? 0xfbbf24 : z.colorHex)));
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(isHero ? 1.15 : 0.8, isHero ? 1.65 : 1.15, 24),
        new THREE.MeshBasicMaterial({ color: haloColor, side: THREE.DoubleSide, transparent: true, opacity: isHero ? 0.85 : 0.65 })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.03;
      animGroup.add(halo);

      // Model Haiwan Mengikut Zon
      let creatureMesh;
      if (index === 0) creatureMesh = createHeroRabbitModel();
      else if (index === 1) creatureMesh = createHeroDeerModel();
      else if (index === 2) creatureMesh = createHeroMonkeyModel();
      else if (index === 3) creatureMesh = createBurungRimbaModel();
      else creatureMesh = createFoxModel();

      animGroup.add(creatureMesh);

      // Floating Name Badge
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
      ctx.roundRect ? ctx.roundRect(4, 4, 248, 64, 16) : ctx.fillRect(4, 4, 248, 64);
      ctx.fill();
      ctx.strokeStyle = (index === 0) ? '#10b981' : (index === 1 ? '#0ea5e9' : (index === 2 ? '#f59e0b' : (index === 3 ? '#fbbf24' : z.color)));
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${z.emoji} ${z.animal}`, 128, 36);

      const badgeTexture = new THREE.CanvasTexture(canvas);
      const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), new THREE.MeshBasicMaterial({ map: badgeTexture, side: THREE.DoubleSide }));
      badge.position.y = (index === 1) ? 3.1 : (isHero ? 2.85 : 2.4);
      animGroup.add(badge);

      // Floating Life Crystal / Mission Beacon Preview above animal
      const beaconColor = (index === 0) ? 0x10b981 : (index === 1 ? 0x0ea5e9 : (index === 2 ? 0xf59e0b : (index === 3 ? 0xfbbf24 : z.colorHex)));
      const crystalIco = new THREE.Mesh(
        new THREE.OctahedronGeometry(isHero ? 0.32 : 0.24, 0),
        new THREE.MeshStandardMaterial({
          color: beaconColor,
          emissive: beaconColor,
          emissiveIntensity: isHero ? 0.85 : 0.6,
          roughness: 0.15
        })
      );
      crystalIco.scale.set(isHero ? 1.0 : 0.8, isHero ? 1.6 : 1.3, isHero ? 1.0 : 0.8);
      crystalIco.position.y = (index === 1) ? 3.65 : (isHero ? 3.4 : 2.95);
      animGroup.add(crystalIco);

      animGroup.userData.creature = creatureMesh;
      animGroup.userData.badge = badge;
      animGroup.userData.crystalIco = crystalIco;
      animGroup.userData.halo = halo;

      animatedObjects.push({
        update(t) {
          badge.rotation.y = player.rotY; // Face player
          crystalIco.rotation.y = t * 1.5;
          crystalIco.position.y = 2.95 + Math.sin(t * 3 + index) * 0.08;
          halo.material.opacity = (State.nearbyZoneIndex === index) ? 0.9 : 0.55;
          if (creatureMesh.userData && creatureMesh.userData.animate) {
            creatureMesh.userData.animate(t);
          }
        }
      });

      scene.add(animGroup);
      animalMeshes.push(animGroup);
    });
  }

  // ============================================================================
  // RABBIT MEADOW SANCTUARY — TAMAN ARNAB 3D (ZON 1: PADANG RUMPUT ARNAB)
  // ============================================================================

  // A. Arnab Comel Hero 3D (Hero Animal for Zone 1 - Only Interactive Target)
  function createHeroRabbitModel() {
    const g = new THREE.Group();
    g.name = 'ArnabComel_Hero';

    // 1. Two-Tiered Magical Meadow Dais
    const daisMat1 = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, flatShading: true }); // Slate stone base
    const daisMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6, flatShading: true }); // Clover moss plinth
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.35, roughness: 0.3 });

    // Tier 1: Carved slate circular base
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.2, 12), daisMat1);
    tier1.position.y = 0.1;

    // Tier 2: Lush clover mound with gold runic trim
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.18, 12), daisMat2);
    tier2.position.y = 0.28;

    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.04, 6, 16), goldTrimMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.36;

    // Dais Wild Daisies
    const daisyPetal = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const daisyCenter = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let di = 0; di < 6; di++) {
      const da = (di / 6) * Math.PI * 2;
      const dMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), daisyPetal);
      dMesh.position.set(Math.cos(da) * 0.95, 0.38, Math.sin(da) * 0.95);
      const dC = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), daisyCenter);
      dC.position.set(Math.cos(da) * 0.95, 0.42, Math.sin(da) * 0.95);
      g.add(dMesh, dC);
    }

    g.add(tier1, tier2, goldRing);

    // 2. Articulated Arnab Comel Hero Body
    const bunnyFurMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, flatShading: true });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
    const pinkInnerEar = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });

    const bunnyRoot = new THREE.Group();
    bunnyRoot.position.y = 0.38; // Atop tier 2

    // Plump chubby body
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), bunnyFurMat);
    body.position.y = 0.45;
    body.scale.set(0.95, 1.0, 1.25);
    bunnyRoot.add(body);

    // Fluffy chest/belly patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 7), bellyMat);
    belly.position.set(0, 0.42, 0.25);
    bunnyRoot.add(belly);

    // Rounded paws
    const pawGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const pawFL = new THREE.Mesh(pawGeo, bunnyFurMat);
    pawFL.position.set(-0.2, 0.12, 0.35);
    const pawFR = new THREE.Mesh(pawGeo, bunnyFurMat);
    pawFR.position.set(0.2, 0.12, 0.35);
    const pawBL = new THREE.Mesh(pawGeo, bunnyFurMat);
    pawBL.position.set(-0.32, 0.12, -0.2);
    pawBL.scale.set(1.1, 1.0, 1.4);
    const pawBR = new THREE.Mesh(pawGeo, bunnyFurMat);
    pawBR.position.set(0.32, 0.12, -0.2);
    pawBR.scale.set(1.1, 1.0, 1.4);
    bunnyRoot.add(pawFL, pawFR, pawBL, pawBR);

    // Cotton Ball Tail
    const tail = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 1), bunnyFurMat);
    tail.position.set(0, 0.45, -0.6);
    bunnyRoot.add(tail);

    // Articulated Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.9, 0.35);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), bunnyFurMat);
    headGroup.add(head);

    // Chubby Cheeks
    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), bunnyFurMat);
    cheekL.position.set(-0.2, -0.06, 0.16);
    const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), bunnyFurMat);
    cheekR.position.set(0.2, -0.06, 0.16);
    headGroup.add(cheekL, cheekR);

    // Eyes with corneal reflection
    [-0.18, 0.18].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeBlackMat);
      eye.position.set(ex, 0.08, 0.26);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), eyeHighlightMat);
      hl.position.set(ex + (ex > 0 ? 0.015 : -0.015), 0.1, 0.3);
      headGroup.add(eye, hl);
    });

    // Cute Pink Nose & Muzzle
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.08, 4), noseMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.02, 0.38);
    headGroup.add(nose);

    // Long Floppy/Upright Ears with Pink Inlays
    const earGroupL = new THREE.Group();
    earGroupL.position.set(-0.16, 0.32, 0);
    const earMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.58, 0.06), bunnyFurMat);
    earMeshL.position.y = 0.28;
    const earPinkL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.02), pinkInnerEar);
    earPinkL.position.set(0, 0.28, 0.035);
    earGroupL.add(earMeshL, earPinkL);
    earGroupL.rotation.z = -0.12;

    const earGroupR = new THREE.Group();
    earGroupR.position.set(0.16, 0.32, 0);
    const earMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.58, 0.06), bunnyFurMat);
    earMeshR.position.y = 0.28;
    const earPinkR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.02), pinkInnerEar);
    earPinkR.position.set(0, 0.28, 0.035);
    earGroupR.add(earMeshR, earPinkR);
    earGroupR.rotation.z = 0.12;

    headGroup.add(earGroupL, earGroupR);
    bunnyRoot.add(headGroup);
    g.add(bunnyRoot);

    // 3. Orbiting Sparkles
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xa7f3d0 });
    const sparkles = [];
    for (let si = 0; si < 4; si++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), sparkleMat);
      sp.position.set(Math.cos(si * 1.57) * 0.9, 1.0 + (si % 2) * 0.3, Math.sin(si * 1.57) * 0.9);
      g.add(sp);
      sparkles.push(sp);
    }

    g.userData = {
      bunnyRoot,
      headGroup,
      earGroupL,
      earGroupR,
      nose,
      sparkles,
      animate(t) {
        // Cute light hopping animation
        const hop = Math.max(0, Math.sin(t * 3.5)) * 0.12;
        bunnyRoot.position.y = 0.38 + hop;

        // Ear twitches
        earGroupL.rotation.x = Math.sin(t * 5) * 0.15;
        earGroupR.rotation.x = Math.sin(t * 5 + 0.6) * 0.15;
        earGroupL.rotation.z = -0.12 + Math.sin(t * 2) * 0.05;
        earGroupR.rotation.z = 0.12 - Math.sin(t * 2) * 0.05;

        // Head looking around with alert curiosity
        headGroup.rotation.y = Math.sin(t * 1.3) * 0.28;
        headGroup.rotation.x = Math.sin(t * 2.5) * 0.08;

        // Nose wiggle
        nose.scale.set(1 + Math.sin(t * 8) * 0.15, 1 + Math.sin(t * 8) * 0.15, 1);

        // Orbiting sparkles
        sparkles.forEach((sp, i) => {
          const sa = t * 1.8 + i * 1.57;
          sp.position.x = Math.cos(sa) * 0.9;
          sp.position.z = Math.sin(sa) * 0.9;
          sp.position.y = 1.0 + Math.sin(t * 3 + i) * 0.18;
          sp.rotation.y = t * 4;
        });
      }
    };

    return g;
  }

  // Backward compatibility alias
  function createRabbitModel() {
    return createHeroRabbitModel();
  }

  // Helper: Create Decorative NPC Rabbit (Purely Ambient Life - Non Interactive)
  function createNPCRabbit(cfg, index) {
    const bg = new THREE.Group();
    bg.name = cfg.id;
    bg.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);
    if (cfg.rotY) bg.rotation.y = cfg.rotY;

    const furMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.65, flatShading: true });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const pinkNose = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });

    const s = cfg.scale || 0.7;

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36 * s, 1), furMat);
    body.position.y = 0.32 * s;
    body.scale.set(0.9, 0.95, 1.25);
    bg.add(body);

    // Optional Spot Patch
    if (cfg.spotColor) {
      const spotMat = new THREE.MeshStandardMaterial({ color: cfg.spotColor, roughness: 0.65 });
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.2 * s, 5, 5), spotMat);
      spot.position.set(0.12 * s, 0.38 * s, 0);
      bg.add(spot);
    }

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 5, 5), furMat);
    tail.position.set(0, 0.3 * s, -0.42 * s);
    bg.add(tail);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58 * s, 0.26 * s);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 * s, 1), furMat);
    headGroup.add(head);

    // Tiny Eyes
    [-0.12 * s, 0.12 * s].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035 * s, 4, 4), eyeMat);
      eye.position.set(ex, 0.05 * s, 0.18 * s);
      headGroup.add(eye);
    });

    // Tiny Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025 * s, 4, 4), pinkNose);
    nose.position.set(0, 0, 0.25 * s);
    headGroup.add(nose);

    // Ears
    const earGeo = new THREE.BoxGeometry(0.08 * s, 0.42 * s, 0.04 * s);
    const earL = new THREE.Mesh(earGeo, furMat);
    earL.position.set(-0.1 * s, 0.25 * s, 0);
    earL.rotation.z = -0.15;
    const earR = new THREE.Mesh(earGeo, furMat);
    earR.position.set(0.1 * s, 0.25 * s, 0);
    earR.rotation.z = 0.15;
    headGroup.add(earL, earR);

    bg.add(headGroup);

    // Attached carrot for munching behavior
    let heldCarrot = null;
    if (cfg.behavior === 'munching') {
      const cMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
      const cTopMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
      heldCarrot = new THREE.Group();
      const cCone = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.3 * s, 5), cMat);
      cCone.rotation.x = -Math.PI / 3;
      const cTop = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 4, 4), cTopMat);
      cTop.position.set(0, -0.06 * s, -0.14 * s);
      heldCarrot.add(cCone, cTop);
      heldCarrot.position.set(0, 0.22 * s, 0.38 * s);
      bg.add(heldCarrot);
    }

    // Floating Zzz icon for sleeping behavior
    let zzzCanvas = null;
    let zzzMesh = null;
    if (cfg.behavior === 'sleeping') {
      const zCanv = document.createElement('canvas');
      zCanv.width = 128;
      zCanv.height = 64;
      const zCtx = zCanv.getContext('2d');
      zCtx.fillStyle = '#60a5fa';
      zCtx.font = 'bold 36px Nunito, sans-serif';
      zCtx.textAlign = 'center';
      zCtx.fillText('Zzz...', 64, 44);
      const zTex = new THREE.CanvasTexture(zCanv);
      zzzMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: zTex, transparent: true, side: THREE.DoubleSide }));
      zzzMesh.position.set(0.2, 0.7 * s, 0.2);
      bg.add(zzzMesh);
    }

    bg.userData = {
      cfg,
      index,
      headGroup,
      earL,
      earR,
      heldCarrot,
      zzzMesh,
      basePos: { ...cfg.pos },
      animate(t) {
        const offset = index * 1.1;
        if (cfg.behavior === 'munching') {
          // Nibbling carrot
          const nibble = Math.sin(t * 8 + offset) * 0.12;
          headGroup.rotation.x = 0.2 + nibble;
          if (heldCarrot) heldCarrot.rotation.x = nibble * 0.5;
        } else if (cfg.behavior === 'sleeping') {
          // Breathing slowly
          const breath = 1.0 + Math.sin(t * 2 + offset) * 0.05;
          body.scale.set(0.95 * breath, 0.9 * breath, 1.25);
          if (zzzMesh) {
            zzzMesh.position.y = 0.65 * s + Math.sin(t * 1.5 + offset) * 0.08;
            zzzMesh.rotation.y = player.rotY; // Face player
          }
        } else if (cfg.behavior === 'hopping') {
          // Hopping in small place
          const hop = Math.max(0, Math.sin(t * 4.5 + offset)) * 0.14;
          bg.position.y = cfg.pos.y + hop;
          earL.rotation.x = Math.sin(t * 6) * 0.18;
          earR.rotation.x = Math.sin(t * 6 + 0.5) * 0.18;
        } else if (cfg.behavior === 'grooming') {
          // Grooming cheeks
          headGroup.rotation.z = Math.sin(t * 3 + offset) * 0.18;
          headGroup.rotation.x = 0.15 + Math.sin(t * 4 + offset) * 0.08;
        } else {
          // 'headBob'
          headGroup.rotation.y = Math.sin(t * 1.6 + offset) * 0.35;
          earL.rotation.z = -0.15 + Math.sin(t * 3.5 + offset) * 0.08;
          earR.rotation.z = 0.15 - Math.sin(t * 3.5 + offset) * 0.08;
        }
      }
    };

    animatedObjects.push({
      update(t) {
        bg.userData.animate(t);
      }
    });

    return bg;
  }

  // BUILD THE COMPLETE 3D RABBIT MEADOW SANCTUARY IN ZONE 1 (x: -30, z: 26)
  function buildRabbitMeadowZone1(parent) {
    rabbitMeadowGroup = new THREE.Group();
    rabbitMeadowGroup.name = 'RabbitMeadowSanctuary_Zone1';
    rabbitMeadowGroup.position.set(-30, 0, 26);
    decorativeRabbits = [];

    // A. Lush Circular Meadow Turf Pad (radius 13.5m)
    const meadowTurf = new THREE.Mesh(
      new THREE.CircleGeometry(13.5, 24),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85, flatShading: true })
    );
    meadowTurf.rotation.x = -Math.PI / 2;
    meadowTurf.position.y = 0.015;
    rabbitMeadowGroup.add(meadowTurf);

    // Clover decorative patches
    const cloverMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
    const cloverPatches = [
      { x: -5, z: -3, r: 2.5 },
      { x: 5, z: -2, r: 2.8 },
      { x: -4, z: 5, r: 2.2 },
      { x: 4, z: 6, r: 2.4 }
    ];
    cloverPatches.forEach(cp => {
      const cMesh = new THREE.Mesh(new THREE.CircleGeometry(cp.r, 12), cloverMat);
      cMesh.rotation.x = -Math.PI / 2;
      cMesh.position.set(cp.x, 0.02, cp.z);
      rabbitMeadowGroup.add(cMesh);
    });

    // B. Rounded Cobblestone Enclosure Wall & Entrance Archway (Matching Reference Image)
    const stoneBlockMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9, flatShading: true });
    const stoneDarkMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true });

    // Cobblestone Perimeter Wall (radius ~8.2m)
    const wallSegments = 26;
    for (let wi = 0; wi < wallSegments; wi++) {
      const wa = -Math.PI * 0.72 + (wi / (wallSegments - 1)) * Math.PI * 1.44;
      // Leave entrance opening at south (around wa = Math.PI/2, z = 7.5 to 8.2)
      if (Math.abs(wa - Math.PI / 2) < 0.26) continue;

      const wx = Math.cos(wa) * 8.2;
      const wz = Math.sin(wa) * 8.2;

      // Stacked rounded chunky stone block
      const sBlock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.38, 1),
        (wi % 2 === 0) ? stoneBlockMat : stoneDarkMat
      );
      sBlock.scale.set(1.4, 0.9, 1.1);
      sBlock.position.set(wx, 0.32, wz);
      sBlock.rotation.y = wa + Math.PI / 2;
      rabbitMeadowGroup.add(sBlock);
    }

    // Majestic Rounded Stone Archway at South Entrance (Clearance width 2.8m, height 3.2m)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 7.5);

    // Left & Right Stone Pillars
    [-1.5, 1.5].forEach(px => {
      for (let py = 0; py < 5; py++) {
        const pillarBlock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.36, 1),
          py % 2 === 0 ? stoneBlockMat : stoneDarkMat
        );
        pillarBlock.scale.set(1.2, 0.9, 1.2);
        pillarBlock.position.set(px, 0.3 + py * 0.52, 0);
        archGroup.add(pillarBlock);
      }
    });

    // Curved Stone Arch Lintels
    for (let ai = -3; ai <= 3; ai++) {
      const aAng = (ai / 3) * (Math.PI / 2.8);
      const aX = Math.sin(aAng) * 1.5;
      const aY = 2.6 + Math.cos(aAng) * 0.65;
      const archStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 1), stoneBlockMat);
      archStone.scale.set(1.3, 0.85, 1.1);
      archStone.position.set(aX, aY, 0);
      archStone.rotation.z = -aAng;
      archGroup.add(archStone);
    }

    // Wooden Plank Boardwalk Railway Trail leading to Arch (Matching reference image)
    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    for (let pl = 0; pl < 8; pl++) {
      const pz = 7.5 + pl * 0.65;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.38), woodPlankMat);
      plank.position.set(0, 0.04, pz);
      rabbitMeadowGroup.add(plank);
    }

    rabbitMeadowGroup.add(archGroup);

    // C. Stone Water Well (Perigi Batu) (North end, matching reference image)
    const wellGroup = new THREE.Group();
    wellGroup.position.set(1.0, 0, -4.5);

    const wellCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.7, 10), stoneBlockMat);
    wellCylinder.position.y = 0.35;
    const wellWater = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.85 })
    );
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.55;

    // Upright timber posts & crossbeam
    const wellWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.6, 6), wellWoodMat);
    postL.position.set(-0.85, 0.8, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.6, 6), wellWoodMat);
    postR.position.set(0.85, 0.8, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.1), wellWoodMat);
    beam.position.set(0, 1.55, 0);

    // Pulley & Hanging Wooden Bucket
    const pulley = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 4, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    pulley.position.set(0, 1.48, 0);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0xfef08a }));
    rope.position.set(0, 1.18, 0);
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.24, 7), wellWoodMat);
    bucket.position.set(0, 0.82, 0);

    wellGroup.add(wellCylinder, wellWater, postL, postR, beam, pulley, rope, bucket);
    rabbitMeadowGroup.add(wellGroup);

    // D. Carrot Garden (Taman Lobak Merah - 2 Plots, matching reference image)
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const carrotTopMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });

    function createCarrotPlot(px, pz) {
      const plot = new THREE.Group();
      plot.position.set(px, 0, pz);

      // Mounded brown earth bed
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 2.2), soilMat);
      bed.position.y = 0.09;
      plot.add(bed);

      // Border stones/tiles
      for (let bi = 0; bi < 8; bi++) {
        const borderX = -1.2 + (bi / 7) * 2.4;
        const bS1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.15), stoneBlockMat);
        bS1.position.set(borderX, 0.12, -1.05);
        const bS2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.15), stoneBlockMat);
        bS2.position.set(borderX, 0.12, 1.05);
        plot.add(bS1, bS2);
      }

      // Rows of carrots in ground
      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          const cx = col * 0.75 + (row % 2 === 0 ? 0.1 : -0.1);
          const cz = row * 0.6;
          // Tapered carrot root peeking out
          const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 6), carrotMat);
          carrot.rotation.x = Math.PI;
          carrot.position.set(cx, 0.22, cz);
          // Leafy green carrot top
          const top1 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 5), carrotTopMat);
          top1.position.set(cx, 0.38, cz);
          top1.rotation.z = 0.2;
          const top2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 5), carrotTopMat);
          top2.position.set(cx, 0.38, cz);
          top2.rotation.z = -0.22;
          plot.add(carrot, top1, top2);
        }
      }

      return plot;
    }

    const carrotPlot1 = createCarrotPlot(-3.5, -1.5);
    const carrotPlot2 = createCarrotPlot(3.2, -1.5);
    rabbitMeadowGroup.add(carrotPlot1, carrotPlot2);

    // Carrot Garden Mini Signpost
    const carrotSignCanvas = document.createElement('canvas');
    carrotSignCanvas.width = 256;
    carrotSignCanvas.height = 96;
    const cCtx = carrotSignCanvas.getContext('2d');
    cCtx.fillStyle = '#fef3c7';
    cCtx.roundRect ? cCtx.roundRect(4, 4, 248, 88, 12) : cCtx.fillRect(4, 4, 248, 88);
    cCtx.fill();
    cCtx.strokeStyle = '#ea580c';
    cCtx.lineWidth = 4;
    cCtx.stroke();
    cCtx.fillStyle = '#ea580c';
    cCtx.font = 'bold 24px Nunito, sans-serif';
    cCtx.textAlign = 'center';
    cCtx.fillText('🥕 TAMAN LOBAK', 128, 42);
    cCtx.font = 'bold 16px Nunito, sans-serif';
    cCtx.fillStyle = '#15803d';
    cCtx.fillText('Makanan Segar Arnab', 128, 72);

    const cSignTex = new THREE.CanvasTexture(carrotSignCanvas);
    const cSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.42), new THREE.MeshBasicMaterial({ map: cSignTex, side: THREE.DoubleSide }));
    cSignMesh.position.set(-0.2, 0.65, -0.4);
    const cPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), wellWoodMat);
    cPost.position.set(-0.2, 0.4, -0.42);
    rabbitMeadowGroup.add(cSignMesh, cPost);

    // Harvested carrot basket
    const basketMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.28, 8), basketMat);
    basket.position.set(-1.8, 0.14, -1.6);
    rabbitMeadowGroup.add(basket);

    // E. 3 Cute Wooden Rabbit Cottages / Hutches (Rumah Arnab 3D)
    function createRabbitCottage(x, z, roofCol = 0x15803d, rot = 0) {
      const cottage = new THREE.Group();
      cottage.position.set(x, 0, z);
      cottage.rotation.y = rot;

      const wallMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 });
      const roofMat = new THREE.MeshStandardMaterial({ color: roofCol, roughness: 0.7, flatShading: true });
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

      // Base Log Walls
      const walls = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.6), wallMat);
      walls.position.y = 0.6;
      cottage.add(walls);

      // Pitched Wooden Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.8, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 1.6;
      roof.scale.set(1.2, 1.0, 1.1);
      cottage.add(roof);

      // Arched Bunny Doorway
      const door = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.65, 8), doorMat);
      door.position.set(0, 0.32, 0.81);
      cottage.add(door);

      // Window with Flower Planter Box
      const win = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
      win.position.set(0.5, 0.85, 0.81);
      const fBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.15), new THREE.MeshStandardMaterial({ color: 0x78350f }));
      fBox.position.set(0.5, 0.62, 0.85);
      const flw1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      flw1.position.set(0.4, 0.72, 0.88);
      const flw2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      flw2.position.set(0.6, 0.72, 0.88);
      cottage.add(win, fBox, flw1, flw2);

      return cottage;
    }

    const cottage1 = createRabbitCottage(7.2, 1.8, 0x15803d, -0.6); // Green roof
    const cottage2 = createRabbitCottage(-7.5, 1.5, 0xb45309, 0.6); // Terracotta roof
    const cottage3 = createRabbitCottage(-5.5, -5.8, 0x059669, 0.2); // Emerald roof
    rabbitMeadowGroup.add(cottage1, cottage2, cottage3);

    // F. Trees (Fruit Tree & Pink Blossom Tree, matching reference image)
    // 1. Fruit Tree (Orange/Apple) on the West
    const fruitTreeGroup = new THREE.Group();
    fruitTreeGroup.position.set(-8.2, 0, 5.2);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.9 });
    const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.4, 7), trunkMat);
    trunk1.position.y = 1.2;
    const foliageGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, flatShading: true, roughness: 0.8 });
    const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 1), foliageGreen);
    canopy1.position.y = 3.2;
    fruitTreeGroup.add(trunk1, canopy1);

    // Oranges & White Blossom Flowers on Fruit Tree
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const whitePetalMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let fi = 0; fi < 8; fi++) {
      const fa = (fi / 8) * Math.PI * 2;
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 5, 5), orangeMat);
      fruit.position.set(Math.cos(fa) * 1.8, 3.0 + (fi % 3) * 0.4, Math.sin(fa) * 1.8);
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), whitePetalMat);
      flower.position.set(Math.cos(fa + 0.3) * 1.9, 3.4 - (fi % 2) * 0.5, Math.sin(fa + 0.3) * 1.9);
      fruitTreeGroup.add(fruit, flower);
    }
    rabbitMeadowGroup.add(fruitTreeGroup);

    // 2. Pink Blossom Tree (Sakura / Peach) on the East
    const blossomTreeGroup = new THREE.Group();
    blossomTreeGroup.position.set(8.2, 0, 5.2);
    const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 2.4, 7), trunkMat);
    trunk2.position.y = 1.2;
    const pinkFoliageMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, flatShading: true, roughness: 0.7 });
    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 1), pinkFoliageMat);
    canopy2.position.y = 3.2;
    blossomTreeGroup.add(trunk2, canopy2);

    for (let bi = 0; bi < 8; bi++) {
      const ba = (bi / 8) * Math.PI * 2;
      const bFlw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 4, 4), whitePetalMat);
      bFlw.position.set(Math.cos(ba) * 1.85, 3.2 + (bi % 3) * 0.3, Math.sin(ba) * 1.85);
      blossomTreeGroup.add(bFlw);
    }
    rabbitMeadowGroup.add(blossomTreeGroup);

    // G. Flower Beds, Hollow Log & Hay Bed
    // Hollow Log Tunnel (x = -4.0, z = 4.0)
    const logGroup = new THREE.Group();
    logGroup.position.set(-4.0, 0.32, 4.0);
    logGroup.rotation.y = 0.5;
    const logOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.6, 8, 1, true), trunkMat);
    logOuter.rotation.x = Math.PI / 2;
    logGroup.add(logOuter);
    rabbitMeadowGroup.add(logGroup);

    // Hay Bed / Straw mound
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const hayMound = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.25, 8), hayMat);
    hayMound.position.set(5.0, 0.12, -4.5);
    rabbitMeadowGroup.add(hayMound);

    // Flower clusters
    const flowerRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const flowerYellow = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const flowerTulips = [
      { x: 3.2, z: -3.8 },
      { x: -1.5, z: -4.2 },
      { x: -5.5, z: 3.2 },
      { x: 5.5, z: 3.8 }
    ];
    flowerTulips.forEach((tp, ti) => {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 5), ti % 2 === 0 ? flowerRed : flowerYellow);
      fl.position.set(tp.x, 0.2, tp.z);
      rabbitMeadowGroup.add(fl);
    });

    // H. Beautiful 3D Signboard (FASA 8)
    const signGroup = new THREE.Group();
    signGroup.position.set(-3.2, 0, 9.8);
    signGroup.rotation.y = 0.25;

    const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), wellWoodMat);
    signPole.position.y = 1.1;
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.1), wellWoodMat);
    signBoard.position.y = 1.85;

    const mainSignCanvas = document.createElement('canvas');
    mainSignCanvas.width = 512;
    mainSignCanvas.height = 240;
    const msCtx = mainSignCanvas.getContext('2d');
    msCtx.fillStyle = '#fef3c7';
    msCtx.roundRect ? msCtx.roundRect(8, 8, 496, 224, 20) : msCtx.fillRect(8, 8, 496, 224);
    msCtx.fill();
    msCtx.strokeStyle = '#b45309';
    msCtx.lineWidth = 8;
    msCtx.stroke();

    msCtx.fillStyle = '#78350f';
    msCtx.font = 'bold 30px Nunito, sans-serif';
    msCtx.textAlign = 'center';
    msCtx.fillText('🐰 TAMAN ARNAB 3D 🥕', 256, 56);

    msCtx.fillStyle = '#15803d';
    msCtx.font = 'bold 24px Nunito, sans-serif';
    msCtx.fillText('SELAMAT DATANG KE TAMAN ARNAB!', 256, 108);

    msCtx.fillStyle = '#64748b';
    msCtx.font = 'bold 18px Nunito, sans-serif';
    msCtx.fillText('Temui Arnab Comel dan terokai rahsia sel haiwan.', 256, 156);

    msCtx.fillStyle = '#d97706';
    msCtx.font = 'bold 16px Nunito, sans-serif';
    msCtx.fillText('ZON 1 • KSSM TINGKATAN 1 SAINS', 256, 196);

    const msTex = new THREE.CanvasTexture(mainSignCanvas);
    const msLabel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), new THREE.MeshBasicMaterial({ map: msTex, side: THREE.DoubleSide }));
    msLabel.position.set(0, 1.85, 0.06);

    // Little flowers on sign frame corners
    const sf1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), flowerRed);
    sf1.position.set(-1.25, 2.4, 0.07);
    const sf2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), flowerYellow);
    sf2.position.set(1.25, 2.4, 0.07);
    signGroup.add(signPole, signBoard, msLabel, sf1, sf2);
    rabbitMeadowGroup.add(signGroup);

    // I. 4 Animated Butterflies
    const bFlyColors = [0xf472b6, 0xfacc15, 0x38bdf8, 0xa855f7];
    const bFlyMeshes = [];
    for (let bi = 0; bi < 4; bi++) {
      const bFly = new THREE.Group();
      const bMat = new THREE.MeshBasicMaterial({ color: bFlyColors[bi], side: THREE.DoubleSide });
      const wGeo = new THREE.PlaneGeometry(0.14, 0.12);
      const wL = new THREE.Mesh(wGeo, bMat);
      wL.position.x = -0.07;
      const wR = new THREE.Mesh(wGeo, bMat);
      wR.position.x = 0.07;
      bFly.add(wL, wR);

      const bAngle = (bi / 4) * Math.PI * 2;
      const bDist = 3.2 + (bi % 2) * 1.8;
      bFly.position.set(Math.cos(bAngle) * bDist, 1.0 + (bi % 2) * 0.4, Math.sin(bAngle) * bDist);
      bFly.userData = { wL, wR, baseAngle: bAngle, dist: bDist, baseY: bFly.position.y, speed: 0.7 + bi * 0.3 };
      rabbitMeadowGroup.add(bFly);
      bFlyMeshes.push(bFly);
    }
    animatedObjects.push({
      update(t) {
        bFlyMeshes.forEach((bf, idx) => {
          const flap = Math.sin(t * 18 + idx) * 0.75;
          bf.userData.wL.rotation.y = flap;
          bf.userData.wR.rotation.y = -flap;
          const a = bf.userData.baseAngle + t * bf.userData.speed * 0.35;
          bf.position.x = Math.cos(a) * bf.userData.dist;
          bf.position.z = Math.sin(a) * bf.userData.dist;
          bf.position.y = bf.userData.baseY + Math.sin(t * 4 + idx) * 0.2;
        });
      }
    });

    // J. 7 Decorative NPC Rabbits (Purely Ambient Life - Non Interactive)
    const npcRabbitConfigs = [
      // 1. Caramel Bunny munching on a carrot at Plot 1
      { id: 'npc-rabbit-caramel', name: 'Arnab Coklat Karamel', color: 0xb45309, scale: 0.68, pos: { x: -3.5, y: 0.12, z: -1.2 }, rotY: 0.4, behavior: 'munching' },
      // 2. Cream Bunny near the water well
      { id: 'npc-rabbit-cream', name: 'Arnab Krim Gebu', color: 0xfef3c7, scale: 0.65, pos: { x: 0.2, y: 0.02, z: -3.6 }, rotY: 0.1, behavior: 'headBob' },
      // 3. Soft Grey Bunny sleeping under the fruit tree with floating Zzz
      { id: 'npc-rabbit-grey-sleep', name: 'Arnab Kelabu Berehat', color: 0x94a3b8, scale: 0.7, pos: { x: -7.0, y: 0.02, z: 4.2 }, rotY: 0.8, behavior: 'sleeping' },
      // 4. Dutch Spotted Bunny greeting at the stone arch entrance
      { id: 'npc-rabbit-dutch', name: 'Arnab Corak Belang', color: 0xffffff, spotColor: 0x78350f, scale: 0.72, pos: { x: -1.2, y: 0.02, z: 6.2 }, rotY: 0.2, behavior: 'headBob' },
      // 5. Snow White Bunny munching at Plot 2
      { id: 'npc-rabbit-white-munch', name: 'Arnab Putih Salji', color: 0xffffff, scale: 0.68, pos: { x: 3.6, y: 0.12, z: -1.0 }, rotY: -0.4, behavior: 'munching' },
      // 6. Brown Bunny grooming paws at Cottage 1 porch
      { id: 'npc-rabbit-brown-porch', name: 'Arnab Coklat Porch', color: 0x78350f, scale: 0.7, pos: { x: 6.2, y: 0.02, z: 1.5 }, rotY: -1.2, behavior: 'grooming' },
      // 7. Grey Hopper Bunny hopping along the wooden plank walkway
      { id: 'npc-rabbit-grey-path', name: 'Arnab Kelabu Melompat', color: 0x64748b, scale: 0.64, pos: { x: 1.2, y: 0.04, z: 8.5 }, rotY: -Math.PI / 2, behavior: 'hopping' }
    ];

    npcRabbitConfigs.forEach((cfg, ci) => {
      const rabbitMesh = createNPCRabbit(cfg, ci);
      rabbitMeadowGroup.add(rabbitMesh);
      decorativeRabbits.push(rabbitMesh);
    });

    parent.add(rabbitMeadowGroup);
  }


  // ============================================================================
  // DEER VALLEY SANCTUARY — LEMBAH RUSA AJAIB 3D (ZON 2: LEMBAH RUSA)
  // ============================================================================

  // Helper: Build Majestic Branching Antlers for Stags
  function createBranchingAntlers(hornMat, s = 1.0) {
    const antlers = new THREE.Group();
    antlers.name = 'BranchingAntlers';

    // Left main beam
    const beamL = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * s, 0.04 * s, 0.65 * s, 6), hornMat);
    beamL.position.set(-0.18 * s, 0.3 * s, 0);
    beamL.rotation.z = -0.42;
    beamL.rotation.x = -0.15;

    // Left Brow tine
    const tineL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * s, 0.025 * s, 0.25 * s, 5), hornMat);
    tineL1.position.set(-0.16 * s, 0.22 * s, 0.12 * s);
    tineL1.rotation.x = 0.6;
    tineL1.rotation.z = -0.2;

    // Left Crown tine
    const tineL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * s, 0.022 * s, 0.28 * s, 5), hornMat);
    tineL2.position.set(-0.32 * s, 0.52 * s, -0.05 * s);
    tineL2.rotation.z = -0.7;
    tineL2.rotation.y = -0.25;

    // Right main beam
    const beamR = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * s, 0.04 * s, 0.65 * s, 6), hornMat);
    beamR.position.set(0.18 * s, 0.3 * s, 0);
    beamR.rotation.z = 0.42;
    beamR.rotation.x = -0.15;

    // Right Brow tine
    const tineR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * s, 0.025 * s, 0.25 * s, 5), hornMat);
    tineR1.position.set(0.16 * s, 0.22 * s, 0.12 * s);
    tineR1.rotation.x = 0.6;
    tineR1.rotation.z = 0.2;

    // Right Crown tine
    const tineR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * s, 0.022 * s, 0.28 * s, 5), hornMat);
    tineR2.position.set(0.32 * s, 0.52 * s, -0.05 * s);
    tineR2.rotation.z = 0.7;
    tineR2.rotation.y = 0.25;

    antlers.add(beamL, tineL1, tineL2, beamR, tineR1, tineR2);
    return antlers;
  }

  // B. Rusa Anggun Hero 3D (Hero Animal for Zone 2 - Only Interactive Target)
  function createHeroDeerModel() {
    const g = new THREE.Group();
    g.name = 'RusaAnggun_Hero';

    // 1. Two-Tiered Magical Forest Dais
    const daisMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, flatShading: true }); // Slate base
    const daisMat2 = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.3 }); // Azure runic ring
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45, roughness: 0.2 });

    // Tier 1: Slate base
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.22, 12), daisMat1);
    tier1.position.y = 0.11;

    // Tier 2: Azure runic ring
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.18, 12), daisMat2);
    tier2.position.y = 0.29;

    const runicTorus = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.04, 6, 16), goldTrimMat);
    runicTorus.rotation.x = Math.PI / 2;
    runicTorus.position.y = 0.37;

    // Dais mountain flora
    const flwPetalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flwWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let di = 0; di < 8; di++) {
      const da = (di / 8) * Math.PI * 2;
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 5), (di % 2 === 0) ? flwPetalMat : flwWhiteMat);
      fl.position.set(Math.cos(da) * 1.1, 0.39, Math.sin(da) * 1.1);
      g.add(fl);
    }

    g.add(tier1, tier2, runicTorus);

    // 2. Majestic Sculpted Rusa Anggun Stag
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65, flatShading: true }); // Rich chestnut
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 }); // Cream belly
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.75 }); // Dark antler horn
    const muzzleMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5 }); // Dark muzzle
    const hoofMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 }); // Black hooves
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const eyeDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });

    const deerRoot = new THREE.Group();
    deerRoot.position.y = 0.38; // Atop tier 2

    // Sculpted Slender Torso
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), coatMat);
    body.scale.set(0.85, 0.95, 1.55);
    body.position.y = 1.15;
    deerRoot.add(body);

    // Cream Belly Patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 7), bellyMat);
    belly.position.set(0, 1.05, 0.15);
    belly.scale.set(0.9, 0.9, 1.3);
    deerRoot.add(belly);

    // 4 Slender Legs with Joint Bends & Dark Hooves
    function createDeerLeg(px, pz, isFront) {
      const legGroup = new THREE.Group();
      legGroup.position.set(px, 1.05, pz);

      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.55, 6), coatMat);
      upper.position.y = -0.25;
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.55, 6), coatMat);
      lower.position.y = -0.68;
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.058, 0.12, 6), hoofMat);
      hoof.position.y = -0.98;

      if (isFront) {
        upper.rotation.x = -0.06;
        lower.rotation.x = 0.08;
      } else {
        upper.rotation.x = 0.12;
        lower.rotation.x = -0.15;
      }

      legGroup.add(upper, lower, hoof);
      return legGroup;
    }

    const legFL = createDeerLeg(-0.28, 0.55, true);
    const legFR = createDeerLeg(0.28, 0.55, true);
    const legBL = createDeerLeg(-0.28, -0.55, false);
    const legBR = createDeerLeg(0.28, -0.55, false);
    deerRoot.add(legFL, legFR, legBL, legBR);

    // Perky Deer Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), coatMat);
    tail.position.set(0, 1.35, -0.85);
    tail.rotation.x = -0.4;
    deerRoot.add(tail);

    // Slender Graceful Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.85, 7), coatMat);
    neck.position.set(0, 1.62, 0.65);
    neck.rotation.x = 0.45;
    deerRoot.add(neck);

    // Articulated Deer Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.05, 0.88);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), coatMat);
    head.scale.set(0.85, 0.9, 1.25);
    headGroup.add(head);

    // Tapered Snout & Dark Muzzle
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 6), coatMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.04, 0.32);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), muzzleMat);
    muzzle.position.set(0, -0.04, 0.48);
    headGroup.add(snout, muzzle);

    // Eyes with corneal reflection
    [-0.15, 0.15].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
      eye.position.set(ex, 0.08, 0.16);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 4, 4), eyeDotMat);
      dot.position.set(ex + (ex > 0 ? 0.012 : -0.012), 0.095, 0.19);
      headGroup.add(eye, dot);
    });

    // Alert Pointed Ears
    const earGeo = new THREE.ConeGeometry(0.07, 0.32, 5);
    const earL = new THREE.Mesh(earGeo, coatMat);
    earL.position.set(-0.18, 0.22, -0.08);
    earL.rotation.z = -0.55;
    earL.rotation.x = -0.2;
    const earR = new THREE.Mesh(earGeo, coatMat);
    earR.position.set(0.18, 0.22, -0.08);
    earR.rotation.z = 0.55;
    earR.rotation.x = -0.2;
    headGroup.add(earL, earR);

    // Magnificent Branching Antlers
    const antlers = createBranchingAntlers(hornMat, 1.15);
    antlers.position.set(0, 0.26, -0.05);
    headGroup.add(antlers);

    deerRoot.add(headGroup);
    g.add(deerRoot);

    // 3. Orbiting Sparkles
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const sparkles = [];
    for (let si = 0; si < 4; si++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), sparkleMat);
      sp.position.set(Math.cos(si * 1.57) * 1.1, 1.6 + (si % 2) * 0.4, Math.sin(si * 1.57) * 1.1);
      g.add(sp);
      sparkles.push(sp);
    }

    g.userData = {
      deerRoot,
      headGroup,
      earL,
      earR,
      tail,
      sparkles,
      tier2,
      animate(t) {
        // Stately calm head turns
        headGroup.rotation.y = Math.sin(t * 1.2) * 0.25;
        headGroup.rotation.x = Math.sin(t * 1.8) * 0.08;

        // Ear twitches
        earL.rotation.x = -0.2 + Math.sin(t * 4.5) * 0.12;
        earR.rotation.x = -0.2 + Math.sin(t * 4.5 + 0.6) * 0.12;

        // Tail gentle flick
        tail.rotation.y = Math.sin(t * 3.5) * 0.25;

        // Breathing animation
        body.scale.set(0.85, 0.95 + Math.sin(t * 2) * 0.03, 1.55);

        // Orbiting sparkles
        sparkles.forEach((sp, i) => {
          const sa = t * 1.6 + i * 1.57;
          sp.position.x = Math.cos(sa) * 1.1;
          sp.position.z = Math.sin(sa) * 1.1;
          sp.position.y = 1.6 + Math.sin(t * 3 + i) * 0.2;
          sp.rotation.y = t * 3;
        });

        // Pulsing runic dais
        if (tier2.material) {
          tier2.material.emissive = new THREE.Color(0x0284c7);
          tier2.material.emissiveIntensity = 0.35 + Math.sin(t * 3) * 0.25;
        }
      }
    };

    return g;
  }

  // Backward compatibility alias
  function createDeerModel() {
    return createHeroDeerModel();
  }

  // Helper: Create Decorative NPC Deer (Purely Ambient Life - Non Interactive)
  function createNPCDeer(cfg, index) {
    const dg = new THREE.Group();
    dg.name = cfg.id;
    dg.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);
    if (cfg.rotY) dg.rotation.y = cfg.rotY;

    const coatMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.7, flatShading: true });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const hoofMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const muzzleMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.6 });

    const s = cfg.scale || 0.85;

    // Body
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * s, 1), coatMat);
    body.scale.set(0.85, 0.95, 1.5);
    body.position.y = 0.95 * s;
    dg.add(body);

    // Optional Spots on Fawn
    if (cfg.spotted) {
      const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let sp = 0; sp < 6; sp++) {
        const spotL = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 4, 4), spotMat);
        spotL.position.set(-0.35 * s, (0.95 + (sp % 2) * 0.15) * s, (-0.35 + sp * 0.15) * s);
        const spotR = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 4, 4), spotMat);
        spotR.position.set(0.35 * s, (0.95 + (sp % 2) * 0.15) * s, (-0.35 + sp * 0.15) * s);
        dg.add(spotL, spotR);
      }
    }

    // 4 Legs
    function makeLeg(px, pz) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.04 * s, 0.85 * s, 6), coatMat);
      leg.position.set(px, 0.42 * s, pz);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.1 * s, 6), hoofMat);
      hoof.position.set(px, 0.05 * s, pz);
      dg.add(leg, hoof);
    }
    if (cfg.behavior !== 'resting') {
      makeLeg(-0.22 * s, 0.45 * s);
      makeLeg(0.22 * s, 0.45 * s);
      makeLeg(-0.22 * s, -0.45 * s);
      makeLeg(0.22 * s, -0.45 * s);
    } else {
      // Tucked legs for resting deer
      body.position.y = 0.45 * s;
    }

    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1 * s, 0.14 * s, 0.1 * s), coatMat);
    tail.position.set(0, (cfg.behavior === 'resting' ? 0.65 : 1.15) * s, -0.75 * s);
    dg.add(tail);

    // Neck & Head
    const headGroup = new THREE.Group();
    const neckY = cfg.behavior === 'resting' ? 0.7 * s : 1.35 * s;
    headGroup.position.set(0, neckY, 0.55 * s);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 0.65 * s, 6), coatMat);
    neck.position.set(0, 0.25 * s, 0.15 * s);
    neck.rotation.x = cfg.behavior === 'grazing' ? 0.95 : 0.4;
    headGroup.add(neck);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 * s, 1), coatMat);
    head.scale.set(0.85, 0.9, 1.25);
    const headOffsetY = cfg.behavior === 'grazing' ? -0.15 * s : 0.55 * s;
    const headOffsetZ = cfg.behavior === 'grazing' ? 0.55 * s : 0.35 * s;
    head.position.set(0, headOffsetY, headOffsetZ);
    headGroup.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.11 * s, 0.28 * s, 5), coatMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, headOffsetY - 0.04 * s, headOffsetZ + 0.25 * s);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 5, 5), muzzleMat);
    muzzle.position.set(0, headOffsetY - 0.04 * s, headOffsetZ + 0.38 * s);
    headGroup.add(snout, muzzle);

    // Eyes
    [-0.12 * s, 0.12 * s].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035 * s, 4, 4), eyeMat);
      eye.position.set(ex, headOffsetY + 0.06 * s, headOffsetZ + 0.12 * s);
      headGroup.add(eye);
    });

    // Ears
    const earGeo = new THREE.ConeGeometry(0.06 * s, 0.26 * s, 4);
    const earL = new THREE.Mesh(earGeo, coatMat);
    earL.position.set(-0.15 * s, headOffsetY + 0.18 * s, headOffsetZ - 0.06 * s);
    earL.rotation.z = -0.5;
    const earR = new THREE.Mesh(earGeo, coatMat);
    earR.position.set(0.15 * s, headOffsetY + 0.18 * s, headOffsetZ - 0.06 * s);
    earR.rotation.z = 0.5;
    headGroup.add(earL, earR);

    // Optional Antlers for Stag NPC
    if (cfg.hasAntlers) {
      const antlers = createBranchingAntlers(hornMat, s * 0.9);
      antlers.position.set(0, headOffsetY + 0.22 * s, headOffsetZ - 0.04 * s);
      headGroup.add(antlers);
    }

    dg.add(headGroup);

    dg.userData = {
      cfg,
      index,
      headGroup,
      earL,
      earR,
      tail,
      basePos: { ...cfg.pos },
      animate(t) {
        const offset = index * 1.3;
        if (cfg.behavior === 'grazing') {
          // Nibbling grass rhythmically
          headGroup.rotation.x = 0.35 + Math.sin(t * 3.5 + offset) * 0.15;
          headGroup.rotation.y = Math.sin(t * 1.5 + offset) * 0.2;
        } else if (cfg.behavior === 'drinking') {
          // Drinking from river
          const drink = Math.sin(t * 1.8 + offset);
          headGroup.rotation.x = (drink > 0) ? 0.45 : 0.15;
        } else if (cfg.behavior === 'resting') {
          // Gentle breathing in shelter
          body.scale.y = 0.95 + Math.sin(t * 2 + offset) * 0.04;
          headGroup.rotation.y = Math.sin(t * 1.2 + offset) * 0.2;
        } else if (cfg.behavior === 'hopping') {
          // Fawn little playful hops
          const hop = Math.max(0, Math.sin(t * 5 + offset)) * 0.12;
          dg.position.y = cfg.pos.y + hop;
          headGroup.rotation.y = Math.sin(t * 3 + offset) * 0.25;
        } else {
          // 'headBob'
          headGroup.rotation.y = Math.sin(t * 1.6 + offset) * 0.3;
          earL.rotation.x = Math.sin(t * 4 + offset) * 0.15;
          earR.rotation.x = Math.sin(t * 4 + offset + 0.5) * 0.15;
        }
      }
    };

    animatedObjects.push({
      update(t) {
        dg.userData.animate(t);
      }
    });

    return dg;
  }

  // BUILD THE COMPLETE 3D DEER VALLEY SANCTUARY IN ZONE 2 (x: 32, z: 28)
  function buildDeerValleyZone2(parent) {
    deerValleyGroup = new THREE.Group();
    deerValleyGroup.name = 'DeerValleySanctuary_Zone2';
    deerValleyGroup.position.set(32, 0, 28);
    decorativeDeers = [];

    // A. Lush Valley Pasture Turf (radius 15m)
    const valleyTurf = new THREE.Mesh(
      new THREE.CircleGeometry(15, 24),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85, flatShading: true })
    );
    valleyTurf.rotation.x = -Math.PI / 2;
    valleyTurf.position.y = 0.015;
    deerValleyGroup.add(valleyTurf);

    // Wildflower carpet patches (pink, yellow, violet, white flower dots matching Image 1)
    const flwMatPink = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
    const flwMatYellow = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const flwMatViolet = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const flwMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const flwMats = [flwMatPink, flwMatYellow, flwMatViolet, flwMatWhite];

    for (let f = 0; f < 36; f++) {
      const fAng = (f / 36) * Math.PI * 2;
      const fDist = 3.5 + (f % 5) * 2.2;
      const fx = Math.cos(fAng) * fDist;
      const fz = Math.sin(fAng) * fDist;
      // Leave river corridor clear
      if (Math.abs(fx - (fz * 0.7)) < 2.0) continue;

      const fMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), flwMats[f % flwMats.length]);
      fMesh.position.set(fx, 0.15, fz);
      deerValleyGroup.add(fMesh);
    }

    // B. Mini Waterfall & Winding Stream (Sungai Kecil & Air Terjun Mini)
    // 1. Mini Waterfall at North-East boundary (x = 7.5, z = -8.5)
    const canyonRockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true });
    const waterfallRock1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), canyonRockMat);
    waterfallRock1.position.set(7.5, 1.2, -8.5);
    waterfallRock1.scale.set(1.4, 1.2, 1.2);
    const waterfallRock2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), canyonRockMat);
    waterfallRock2.position.set(9.2, 0.8, -7.5);
    deerValleyGroup.add(waterfallRock1, waterfallRock2);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85
    });
    // Cascading fall
    const fallMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), waterMat);
    fallMesh.position.set(7.5, 1.1, -8.2);
    fallMesh.rotation.x = 0.2;
    deerValleyGroup.add(fallMesh);

    // Ripple ring at waterfall base
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.95, 12), rippleMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(7.5, 0.05, -7.2);
    deerValleyGroup.add(ripple);

    animatedObjects.push({
      update(t) {
        fallMesh.position.y = 1.1 + Math.sin(t * 12) * 0.04;
        const s = 1.0 + Math.sin(t * 5) * 0.18;
        ripple.scale.set(s, s, s);
        rippleMat.opacity = 0.45 + Math.sin(t * 5) * 0.25;
      }
    });

    // 2. Winding Stream Bed (flowing from (7.5, -7.5) to (-6.0, 7.0))
    const streamPoints = [
      { x: 7.2, z: -7.0 },
      { x: 5.5, z: -4.5 },
      { x: 3.5, z: -2.5 },
      { x: 1.0, z: -0.5 }, // Under the bridge
      { x: -1.8, z: 2.0 },
      { x: -4.2, z: 4.5 },
      { x: -6.5, z: 7.5 }
    ];

    for (let sp = 0; sp < streamPoints.length - 1; sp++) {
      const p1 = streamPoints[sp];
      const p2 = streamPoints[sp + 1];
      const sMidX = (p1.x + p2.x) / 2;
      const sMidZ = (p1.z + p2.z) / 2;
      const sLen = Math.hypot(p2.x - p1.x, p2.z - p1.z);
      const sAng = Math.atan2(p2.x - p1.x, p2.z - p1.z);

      const streamSegment = new THREE.Mesh(new THREE.PlaneGeometry(2.4, sLen + 0.2), waterMat);
      streamSegment.rotation.x = -Math.PI / 2;
      streamSegment.rotation.z = -sAng;
      streamSegment.position.set(sMidX, 0.035, sMidZ);
      deerValleyGroup.add(streamSegment);

      // Riverbank pebbles
      const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.85 });
      const pbL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), pebbleMat);
      pbL.position.set(sMidX - Math.cos(sAng) * 1.3, 0.08, sMidZ + Math.sin(sAng) * 1.3);
      const pbR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pebbleMat);
      pbR.position.set(sMidX + Math.cos(sAng) * 1.3, 0.08, sMidZ - Math.sin(sAng) * 1.3);
      deerValleyGroup.add(pbL, pbR);
    }

    // Riverside reeds & ferns
    const reedMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    [
      { x: 4.8, z: -3.5 },
      { x: 2.2, z: -1.2 },
      { x: -0.5, z: 1.2 },
      { x: -3.2, z: 3.5 }
    ].forEach(rp => {
      for (let r = 0; r < 3; r++) {
        const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.75, 4), reedMat);
        reed.position.set(rp.x + (r - 1) * 0.15, 0.38, rp.z + (r % 2 === 0 ? 0.1 : -0.1));
        reed.rotation.z = (r - 1) * 0.15;
        deerValleyGroup.add(reed);
      }
    });

    // C. Rustic Arched Wooden Footbridge (Jambatan Kayu)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(1.0, 0, -0.5);
    bridgeGroup.rotation.y = 0.55; // Crossing perpendicular to stream

    const bridgeWoodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const bridgeDarkWood = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.85 });

    // Arched Planks Deck
    const plankCount = 12;
    for (let pk = 0; pk < plankCount; pk++) {
      const prog = (pk / (plankCount - 1)) - 0.5;
      const px = prog * 4.8;
      const py = (1 - (prog * 2) * (prog * 2)) * 0.45 + 0.22;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 2.4), bridgeWoodMat);
      plank.position.set(px, py, 0);
      plank.rotation.z = -prog * 0.38;
      bridgeGroup.add(plank);
    }

    // Railings with timber posts
    [-1.15, 1.15].forEach(side => {
      for (let rp = -2; rp <= 2; rp++) {
        const prog = (rp / 2) * 0.5;
        const postX = prog * 4.6;
        const postY = (1 - (prog * 2) * (prog * 2)) * 0.45 + 0.22;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 6), bridgeDarkWood);
        post.position.set(postX, postY + 0.38, side);
        bridgeGroup.add(post);
      }
      for (let s = 0; s < 4; s++) {
        const prog = (s / 3) - 0.5;
        const railX = prog * 3.8;
        const railY = (1 - (prog * 2) * (prog * 2)) * 0.45 + 0.85;
        const railSeg = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.05, 0.07), bridgeWoodMat);
        railSeg.position.set(railX, railY, side);
        railSeg.rotation.z = -prog * 0.38;
        bridgeGroup.add(railSeg);
      }
    });

    deerValleyGroup.add(bridgeGroup);

    // D. Open Timber Deer Shelter & Hay Feeder (Tempat Perlindungan Rusa)
    const shelterGroup = new THREE.Group();
    shelterGroup.position.set(-7.0, 0, -3.5);

    const logMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const shingleMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8, flatShading: true });

    // 4 Corner Timber Pillars
    [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.2], [1.5, 1.2]].forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.6, 6), logMat);
      pillar.position.set(px, 1.3, pz);
      shelterGroup.add(pillar);
    });

    // Sloped Weathered Cedar Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.2, 4), shingleMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 3.1;
    roof.scale.set(1.1, 1.0, 0.9);
    shelterGroup.add(roof);

    // Wooden Hay Feeder Trough inside
    const troughMat = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.85 });
    const trough = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.65), troughMat);
    trough.position.set(0, 0.35, 0);
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const hayTrough = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.5), hayMat);
    hayTrough.position.set(0, 0.5, 0);
    shelterGroup.add(trough, hayTrough);

    // Low rustic split-rail fence around shelter paddock
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    for (let f = 0; f < 4; f++) {
      const fPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.0, 5), fenceMat);
      fPost.position.set(-2.6 + f * 1.6, 0.5, 1.8);
      shelterGroup.add(fPost);
      if (f < 3) {
        const fRail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.06), fenceMat);
        fRail.position.set(-1.8 + f * 1.6, 0.65, 1.8);
        shelterGroup.add(fRail);
      }
    }

    deerValleyGroup.add(shelterGroup);

    // E. Trees & Foliage (Matching Reference Image 1 & 2)
    // 1. Golden Amber / Fantasy Willow Tree (Image 1 highlight)
    const goldenTreeGroup = new THREE.Group();
    goldenTreeGroup.position.set(8.0, 0, 2.5);

    const trunkWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const amberFoliage = new THREE.MeshStandardMaterial({ color: 0xf59e0b, flatShading: true, roughness: 0.75 });
    const honeyFoliage = new THREE.MeshStandardMaterial({ color: 0xd97706, flatShading: true, roughness: 0.75 });

    const gTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.48, 2.8, 7), trunkWood);
    gTrunk.position.y = 1.4;
    gTrunk.rotation.z = 0.08;

    const gCanopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), amberFoliage);
    gCanopy1.position.set(0, 3.6, 0);
    const gCanopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), honeyFoliage);
    gCanopy2.position.set(-0.8, 3.1, 0.4);
    const gCanopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 1), amberFoliage);
    gCanopy3.position.set(0.9, 3.2, -0.3);

    goldenTreeGroup.add(gTrunk, gCanopy1, gCanopy2, gCanopy3);
    deerValleyGroup.add(goldenTreeGroup);

    // 2. Lush Canopy Forest Shade Tree (West boundary)
    const shadeTreeGroup = new THREE.Group();
    shadeTreeGroup.position.set(-6.5, 0, 6.5);
    const sTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 2.8, 7), trunkWood);
    sTrunk.position.y = 1.4;
    const greenFoliage = new THREE.MeshStandardMaterial({ color: 0x15803d, flatShading: true, roughness: 0.8 });
    const sCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), greenFoliage);
    sCanopy.position.y = 3.6;
    shadeTreeGroup.add(sTrunk, sCanopy);
    deerValleyGroup.add(shadeTreeGroup);

    // 3. Two Evergreen Mountain Pines
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x047857, flatShading: true, roughness: 0.8 });
    function createMountainPine(px, pz, s = 1.0) {
      const pine = new THREE.Group();
      pine.position.set(px, 0, pz);
      const pTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.32 * s, 1.8 * s, 6), trunkWood);
      pTrunk.position.y = 0.9 * s;
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5 * s, 1.8 * s, 7), pineMat);
      c1.position.y = 2.2 * s;
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.2 * s, 1.6 * s, 7), pineMat);
      c2.position.y = 3.1 * s;
      const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.85 * s, 1.3 * s, 7), pineMat);
      c3.position.y = 3.9 * s;
      pine.add(pTrunk, c1, c2, c3);
      return pine;
    }
    const pine1 = createMountainPine(5.5, -10.0, 1.1);
    const pine2 = createMountainPine(-8.5, -9.0, 1.0);
    deerValleyGroup.add(pine1, pine2);

    // F. 3D Signboard Lembah Rusa (FASA 7)
    // Positioned neatly at entrance trail without any tree obstruction
    const signGroup = new THREE.Group();
    signGroup.position.set(-2.5, 0, 12.0);
    signGroup.rotation.y = -0.25; // Facing arriving player

    const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.2, 8), logMat);
    signPole.position.y = 1.1;
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.1), logMat);
    signBoard.position.y = 1.85;

    const mainSignCanvas = document.createElement('canvas');
    mainSignCanvas.width = 512;
    mainSignCanvas.height = 240;
    const msCtx = mainSignCanvas.getContext('2d');
    msCtx.fillStyle = '#fef3c7';
    msCtx.roundRect ? msCtx.roundRect(8, 8, 496, 224, 20) : msCtx.fillRect(8, 8, 496, 224);
    msCtx.fill();
    msCtx.strokeStyle = '#0284c7';
    msCtx.lineWidth = 8;
    msCtx.stroke();

    msCtx.fillStyle = '#0369a1';
    msCtx.font = 'bold 30px Nunito, sans-serif';
    msCtx.textAlign = 'center';
    msCtx.fillText('🦌 LEMBAH RUSA AJAIB 🌿', 256, 56);

    msCtx.fillStyle = '#78350f';
    msCtx.font = 'bold 24px Nunito, sans-serif';
    msCtx.fillText('SELAMAT DATANG KE LEMBAH RUSA!', 256, 108);

    msCtx.fillStyle = '#64748b';
    msCtx.font = 'bold 18px Nunito, sans-serif';
    msCtx.fillText('Temui Rusa Anggun dan terokai rahsia nukleus.', 256, 156);

    msCtx.fillStyle = '#0284c7';
    msCtx.font = 'bold 16px Nunito, sans-serif';
    msCtx.fillText('ZON 2 • KSSM TINGKATAN 1 SAINS', 256, 196);

    const msTex = new THREE.CanvasTexture(mainSignCanvas);
    const msLabel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), new THREE.MeshBasicMaterial({ map: msTex, side: THREE.DoubleSide }));
    msLabel.position.set(0, 1.85, 0.06);

    // Decorative leaf corners on sign
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const lf1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), leafMat);
    lf1.position.set(-1.25, 2.4, 0.07);
    const lf2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), leafMat);
    lf2.position.set(1.25, 2.4, 0.07);
    signGroup.add(signPole, signBoard, msLabel, lf1, lf2);
    deerValleyGroup.add(signGroup);

    // G. 4 Animated Butterflies
    const bFlyColors = [0x38bdf8, 0xfacc15, 0xf472b6, 0xa855f7];
    const bFlyMeshes = [];
    for (let bi = 0; bi < 4; bi++) {
      const bFly = new THREE.Group();
      const bMat = new THREE.MeshBasicMaterial({ color: bFlyColors[bi], side: THREE.DoubleSide });
      const wGeo = new THREE.PlaneGeometry(0.14, 0.12);
      const wL = new THREE.Mesh(wGeo, bMat);
      wL.position.x = -0.07;
      const wR = new THREE.Mesh(wGeo, bMat);
      wR.position.x = 0.07;
      bFly.add(wL, wR);

      const bAngle = (bi / 4) * Math.PI * 2;
      const bDist = 3.6 + (bi % 2) * 2.0;
      bFly.position.set(Math.cos(bAngle) * bDist, 1.2 + (bi % 2) * 0.4, Math.sin(bAngle) * bDist);
      bFly.userData = { wL, wR, baseAngle: bAngle, dist: bDist, baseY: bFly.position.y, speed: 0.7 + bi * 0.25 };
      deerValleyGroup.add(bFly);
      bFlyMeshes.push(bFly);
    }
    animatedObjects.push({
      update(t) {
        bFlyMeshes.forEach((bf, idx) => {
          const flap = Math.sin(t * 18 + idx) * 0.75;
          bf.userData.wL.rotation.y = flap;
          bf.userData.wR.rotation.y = -flap;
          const a = bf.userData.baseAngle + t * bf.userData.speed * 0.35;
          bf.position.x = Math.cos(a) * bf.userData.dist;
          bf.position.z = Math.sin(a) * bf.userData.dist;
          bf.position.y = bf.userData.baseY + Math.sin(t * 4 + idx) * 0.2;
        });
      }
    });

    // H. 5 Decorative NPC Deers (Ambient Life - Non Interactive)
    const npcDeerConfigs = [
      // 1. Grazing Stag in the wildflower meadow
      { id: 'npc-deer-grazing', name: 'Rusa Jantan Meragut', color: 0x92400e, scale: 0.88, pos: { x: 4.5, y: 0.02, z: 4.0 }, rotY: -0.6, behavior: 'grazing', hasAntlers: true },
      // 2. Graceful Doe by the riverbank near bridge
      { id: 'npc-deer-doe', name: 'Rusa Betina di Sungai', color: 0xa16207, scale: 0.82, pos: { x: 2.8, y: 0.02, z: -3.5 }, rotY: 1.2, behavior: 'drinking', hasAntlers: false },
      // 3. Playful Spotted Fawn 1 following Doe
      { id: 'npc-deer-fawn1', name: 'Anak Rusa Bintik 1', color: 0xb45309, scale: 0.55, pos: { x: 4.2, y: 0.02, z: -4.5 }, rotY: 0.8, behavior: 'hopping', spotted: true, hasAntlers: false },
      // 4. Resting Doe under the wooden shelter
      { id: 'npc-deer-resting', name: 'Rusa Berehat di Pondok', color: 0x78350f, scale: 0.8, pos: { x: -6.5, y: 0.02, z: -3.2 }, rotY: 0.4, behavior: 'resting', hasAntlers: false },
      // 5. Spotted Fawn 2 in the flower bed near Golden Willow
      { id: 'npc-deer-fawn2', name: 'Anak Rusa Bintik 2', color: 0xa16207, scale: 0.58, pos: { x: 6.5, y: 0.02, z: 1.8 }, rotY: -1.4, behavior: 'headBob', spotted: true, hasAntlers: false }
    ];

    npcDeerConfigs.forEach((cfg, ci) => {
      const deerMesh = createNPCDeer(cfg, ci);
      deerValleyGroup.add(deerMesh);
      decorativeDeers.push(deerMesh);
    });

    parent.add(deerValleyGroup);
  }


  // ============================================================================
  // MAGICAL TROPICAL MONKEY FOREST — HUTAN MONYET 3D (ZON 3: HUTAN MONYET)
  // ============================================================================

  // Helper: Build a peeled yellow banana
  function createBananaModel(s = 1.0) {
    const bg = new THREE.Group();
    const peelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const pulpMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.8 });

    // Inner delicious banana pulp
    const pulp = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * s, 0.05 * s, 0.28 * s, 6), pulpMat);
    pulp.position.y = 0.14 * s;
    pulp.rotation.x = 0.12;
    bg.add(pulp);

    // 3 Opened Peels
    for (let pi = 0; pi < 3; pi++) {
      const pa = (pi / 3) * Math.PI * 2;
      const peel = new THREE.Mesh(new THREE.ConeGeometry(0.04 * s, 0.2 * s, 4), peelMat);
      peel.position.set(Math.cos(pa) * 0.04 * s, 0.06 * s, Math.sin(pa) * 0.04 * s);
      peel.rotation.x = 0.6 * Math.sin(pa);
      peel.rotation.z = -0.6 * Math.cos(pa);
      bg.add(peel);
    }

    // Stem base
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * s, 0.03 * s, 0.1 * s, 5), tipMat);
    stem.position.y = -0.04 * s;
    bg.add(stem);

    return bg;
  }

  // C. Monyet Ceria Hero 3D (Hero Animal for Zone 3 - Only Interactive Target)
  function createHeroMonkeyModel() {
    const g = new THREE.Group();
    g.name = 'MonyetCeria_Hero';

    // 1. Two-Tiered Magical Tropical Dais
    const daisMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, flatShading: true }); // Carved river slate
    const daisMat2 = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.25 }); // Amber runic plinth
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.45, roughness: 0.2 });

    // Tier 1: Slate base
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.22, 12), daisMat1);
    tier1.position.y = 0.11;

    // Tier 2: Amber runic plinth
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.18, 12), daisMat2);
    tier2.position.y = 0.29;

    const runicTorus = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.04, 6, 16), goldTrimMat);
    runicTorus.rotation.x = Math.PI / 2;
    runicTorus.position.y = 0.37;

    // Dais Tropical Hibiscus Flowers
    const petalMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let di = 0; di < 6; di++) {
      const da = (di / 6) * Math.PI * 2;
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.065, 5, 5), petalMat);
      fl.position.set(Math.cos(da) * 0.95, 0.39, Math.sin(da) * 0.95);
      const ct = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), centerMat);
      ct.position.set(Math.cos(da) * 0.95, 0.43, Math.sin(da) * 0.95);
      g.add(fl, ct);
    }

    g.add(tier1, tier2, runicTorus);

    // 2. Sculpted Expressive Monyet Ceria Body
    const furMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, flatShading: true }); // Warm chestnut brown
    const creamFaceMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.55 }); // Peach/cream face & belly
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pinkEarMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

    const monkeyRoot = new THREE.Group();
    monkeyRoot.position.y = 0.38; // Atop tier 2

    // Torso sitting upright
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.44, 1), furMat);
    body.scale.set(0.9, 1.05, 0.9);
    body.position.y = 0.52;
    monkeyRoot.add(body);

    // Cream Belly Patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 7), creamFaceMat);
    belly.position.set(0, 0.5, 0.2);
    belly.scale.set(0.9, 1.0, 0.6);
    monkeyRoot.add(belly);

    // Sitting Legs & Feet
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.45, 6), furMat);
    legL.position.set(-0.25, 0.22, 0.15);
    legL.rotation.z = 0.7;
    legL.rotation.x = -0.3;
    const footL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), creamFaceMat);
    footL.position.set(-0.38, 0.1, 0.28);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.45, 6), furMat);
    legR.position.set(0.25, 0.22, 0.15);
    legR.rotation.z = -0.7;
    legR.rotation.x = -0.3;
    const footR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), creamFaceMat);
    footR.position.set(0.38, 0.1, 0.28);
    monkeyRoot.add(legL, footL, legR, footR);

    // Flexible Arms resting cutely forward
    const armL = new THREE.Group();
    armL.position.set(-0.35, 0.72, 0.05);
    const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.48, 6), furMat);
    armMeshL.position.y = -0.22;
    armMeshL.rotation.z = 0.25;
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), creamFaceMat);
    handL.position.set(-0.06, -0.42, 0.12);
    armL.add(armMeshL, handL);

    const armR = new THREE.Group();
    armR.position.set(0.35, 0.72, 0.05);
    const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.48, 6), furMat);
    armMeshR.position.y = -0.22;
    armMeshR.rotation.z = -0.25;
    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), creamFaceMat);
    handR.position.set(0.06, -0.42, 0.12);
    armR.add(armMeshR, handR);
    monkeyRoot.add(armL, armR);

    // Prehensile Curved Spiral Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.38, -0.38);
    const tailCurve = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 6, 16, Math.PI * 1.35), furMat);
    tailCurve.rotation.y = Math.PI / 2;
    tailCurve.rotation.z = 0.4;
    tailGroup.add(tailCurve);
    monkeyRoot.add(tailGroup);

    // Round Cheerful Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0.12);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), furMat);
    headGroup.add(head);

    // Cream Face Mask with Chubby Cheeks
    const faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), creamFaceMat);
    faceMask.position.set(0, -0.02, 0.2);
    faceMask.scale.set(1.05, 0.95, 0.65);
    headGroup.add(faceMask);

    // Muzzle & Smiling Mouth
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), creamFaceMat);
    muzzle.position.set(0, -0.09, 0.3);
    muzzle.scale.set(1.2, 0.8, 0.8);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 5), noseMat);
    nose.position.set(0, -0.05, 0.39);
    headGroup.add(muzzle, nose);

    // Big Shiny Cheerful Eyes
    [-0.11, 0.11].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeMat);
      eye.position.set(ex, 0.06, 0.28);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), eyeHighlightMat);
      hl.position.set(ex + (ex > 0 ? 0.015 : -0.015), 0.08, 0.32);
      headGroup.add(eye, hl);
    });

    // Big Round Ears with Pinkish Inners
    [-0.32, 0.32].forEach(ex => {
      const earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 8), furMat);
      earOuter.rotation.z = Math.PI / 2;
      earOuter.position.set(ex, 0.02, 0.02);
      const earInner = new THREE.Mesh(new THREE.CircleGeometry(0.08, 8), pinkEarMat);
      earInner.rotation.y = ex > 0 ? -Math.PI / 2 : Math.PI / 2;
      earInner.position.set(ex + (ex > 0 ? -0.025 : 0.025), 0.02, 0.02);
      headGroup.add(earOuter, earInner);
    });

    monkeyRoot.add(headGroup);
    g.add(monkeyRoot);

    // 3. Orbiting Golden/Amber Sparkles
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sparkles = [];
    for (let si = 0; si < 4; si++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), sparkleMat);
      sp.position.set(Math.cos(si * 1.57) * 1.0, 1.2 + (si % 2) * 0.35, Math.sin(si * 1.57) * 1.0);
      g.add(sp);
      sparkles.push(sp);
    }

    g.userData = {
      monkeyRoot,
      headGroup,
      armL,
      armR,
      tailGroup,
      sparkles,
      tier2,
      animate(t) {
        // Cheerful head looking around
        headGroup.rotation.y = Math.sin(t * 1.4) * 0.3;
        headGroup.rotation.x = Math.sin(t * 2.2) * 0.1;

        // Tail swish
        tailGroup.rotation.z = Math.sin(t * 3.5) * 0.35;
        tailGroup.rotation.y = Math.sin(t * 2.5) * 0.2;

        // Playful arm wave
        armR.rotation.z = Math.sin(t * 4) * 0.2;
        armL.rotation.z = -Math.sin(t * 3.5) * 0.15;

        // Body gentle bob
        monkeyRoot.position.y = 0.38 + Math.sin(t * 3) * 0.04;

        // Orbiting sparkles
        sparkles.forEach((sp, i) => {
          const sa = t * 1.8 + i * 1.57;
          sp.position.x = Math.cos(sa) * 1.0;
          sp.position.z = Math.sin(sa) * 1.0;
          sp.position.y = 1.2 + Math.sin(t * 3 + i) * 0.2;
          sp.rotation.y = t * 3.5;
        });

        // Pulsing runic dais
        if (tier2.material) {
          tier2.material.emissive = new THREE.Color(0xf59e0b);
          tier2.material.emissiveIntensity = 0.35 + Math.sin(t * 3) * 0.25;
        }
      }
    };

    return g;
  }

  // Backward compatibility alias
  function createMonkeyModel() {
    return createHeroMonkeyModel();
  }

  // Helper: Create Decorative NPC Monkey (Purely Ambient Life - Non Interactive)
  function createNPCMonkey(cfg, index) {
    const mg = new THREE.Group();
    mg.name = cfg.id;
    mg.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);
    if (cfg.rotY) mg.rotation.y = cfg.rotY;

    const furMat = new THREE.MeshStandardMaterial({ color: cfg.color || 0x78350f, roughness: 0.75, flatShading: true });
    const creamFaceMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    const s = cfg.scale || 0.75;

    // Body
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 * s, 1), furMat);
    body.position.y = 0.45 * s;
    mg.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24 * s, 6, 6), creamFaceMat);
    belly.position.set(0, 0.42 * s, 0.16 * s);
    belly.scale.set(0.9, 1.0, 0.6);
    mg.add(belly);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.88 * s, 0.1 * s);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 7, 7), furMat);
    headGroup.add(head);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.2 * s, 7, 7), creamFaceMat);
    face.position.set(0, -0.02 * s, 0.16 * s);
    face.scale.set(1.0, 0.9, 0.6);
    headGroup.add(face);

    // Eyes
    [-0.09 * s, 0.09 * s].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 4, 4), eyeMat);
      eye.position.set(ex, 0.05 * s, 0.22 * s);
      headGroup.add(eye);
    });

    // Ears
    [-0.26 * s, 0.26 * s].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.09 * s, 0.03 * s, 6), furMat);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(ex, 0.02 * s, 0);
      headGroup.add(ear);
    });

    mg.add(headGroup);

    // Tail
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.3 * s, 0.04 * s, 5, 12, Math.PI * 1.3), furMat);
    tail.position.set(0, 0.35 * s, -0.32 * s);
    tail.rotation.y = Math.PI / 2;
    mg.add(tail);

    // Limbs depending on behavior
    let bananaProp = null;
    let armL = null;
    let armR = null;

    if (cfg.behavior === 'eatingBanana') {
      // Sitting on rock holding peeled banana
      bananaProp = createBananaModel(s * 1.1);
      bananaProp.position.set(0, 0.48 * s, 0.32 * s);
      bananaProp.rotation.x = 0.4;
      mg.add(bananaProp);
    } else if (cfg.behavior === 'swinging') {
      // Arms raised holding overhead vine
      armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.6 * s, 5), furMat);
      armL.position.set(-0.25 * s, 0.85 * s, 0);
      armL.rotation.z = 0.4;
      armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.6 * s, 5), furMat);
      armR.position.set(0.25 * s, 0.85 * s, 0);
      armR.rotation.z = -0.4;
      mg.add(armL, armR);
    } else {
      // General playful arms
      armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.45 * s, 5), furMat);
      armL.position.set(-0.28 * s, 0.45 * s, 0.1 * s);
      armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.45 * s, 5), furMat);
      armR.position.set(0.28 * s, 0.45 * s, 0.1 * s);
      mg.add(armL, armR);
    }

    mg.userData = {
      cfg,
      index,
      headGroup,
      tail,
      bananaProp,
      basePos: { ...cfg.pos },
      animate(t) {
        const offset = index * 1.2;
        if (cfg.behavior === 'eatingBanana') {
          // Nibbling banana
          const chew = Math.sin(t * 7 + offset) * 0.12;
          headGroup.rotation.x = 0.2 + chew;
          if (bananaProp) bananaProp.position.y = (0.48 + chew * 0.05) * s;
          tail.rotation.z = Math.sin(t * 3 + offset) * 0.2;
        } else if (cfg.behavior === 'swinging') {
          // Swinging from vine
          const swing = Math.sin(t * 2.5 + offset) * 0.35;
          mg.rotation.z = swing;
          mg.position.x = cfg.pos.x + Math.sin(swing) * 0.6;
          tail.rotation.z = -swing * 0.8;
        } else if (cfg.behavior === 'hoppingPath') {
          // Hopping on all fours
          const hop = Math.max(0, Math.sin(t * 5 + offset)) * 0.14;
          mg.position.y = cfg.pos.y + hop;
          headGroup.rotation.y = Math.sin(t * 2 + offset) * 0.25;
        } else {
          // 'perched' / looking around
          headGroup.rotation.y = Math.sin(t * 1.5 + offset) * 0.35;
          headGroup.rotation.x = Math.sin(t * 2.5 + offset) * 0.1;
          tail.rotation.z = Math.sin(t * 3 + offset) * 0.25;
        }
      }
    };

    animatedObjects.push({
      update(t) {
        mg.userData.animate(t);
      }
    });

    return mg;
  }

  // BUILD THE COMPLETE 3D MONKEY FOREST SANCTUARY IN ZONE 3 (x: 34, z: -30)
  function buildMonkeyForestZone3(parent) {
    monkeyForestGroup = new THREE.Group();
    monkeyForestGroup.name = 'MonkeyForestSanctuary_Zone3';
    monkeyForestGroup.position.set(34, 0, -30);
    decorativeMonkeys = [];

    // A. Lush Tropical Forest Turf (radius 15m)
    const forestTurf = new THREE.Mesh(
      new THREE.CircleGeometry(15, 24),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85, flatShading: true })
    );
    forestTurf.rotation.x = -Math.PI / 2;
    forestTurf.position.y = 0.015;
    monkeyForestGroup.add(forestTurf);

    // B. Winding Curved Stepping Stone Pathway (matching reference image!)
    const stonePathMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.9, flatShading: true });
    const steppingStones = [
      { x: -3.5, z: 12.0 },
      { x: -3.2, z: 10.2 },
      { x: -2.8, z: 8.5 },
      { x: -2.2, z: 6.8 },
      { x: -1.2, z: 5.0 },
      { x: 0.2, z: 3.5 },
      { x: 1.8, z: 2.2 },
      { x: 3.2, z: 1.2 }, // Branching to Monyet Ceria dais (x: 4.2, z: 2.0)
      // Branching towards the treehouse ladder
      { x: 4.5, z: 0.0 },
      { x: 5.8, z: -1.5 },
      { x: 6.8, z: -2.8 }
    ];
    steppingStones.forEach(st => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.08, 7), stonePathMat);
      stone.position.set(st.x, 0.04, st.z);
      stone.rotation.y = Math.random() * Math.PI;
      monkeyForestGroup.add(stone);
    });

    // C. Natural Hollow Fallen Log (Batang Pokok Tumbang - matching image!)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.9 });
    const hollowLog = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.4, 8, 1, true), trunkMat);
    hollowLog.rotation.z = Math.PI / 2;
    hollowLog.position.set(-2.0, 0.35, 2.5);
    hollowLog.rotation.y = 0.2;
    monkeyForestGroup.add(hollowLog);

    // D. Tropical Banana Plants (Pokok Pisang - matching image!)
    function createBananaPlant(px, pz, s = 1.0) {
      const bPlant = new THREE.Group();
      bPlant.position.set(px, 0, pz);

      const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6, side: THREE.DoubleSide });

      // Fleshy green stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.22 * s, 2.2 * s, 6), stemMat);
      stem.position.y = 1.1 * s;
      bPlant.add(stem);

      // Arching broad leaves
      for (let li = 0; li < 5; li++) {
        const la = (li / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.5 * s, 1.6 * s), leafMat);
        leaf.position.set(Math.cos(la) * 0.5 * s, 2.1 * s, Math.sin(la) * 0.5 * s);
        leaf.rotation.x = 0.7;
        leaf.rotation.y = la;
        bPlant.add(leaf);
      }

      // Hanging banana bunch
      const bunch = new THREE.Group();
      bunch.position.set(0.1 * s, 1.8 * s, 0.2 * s);
      const bColor = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
      for (let bn = 0; bn < 4; bn++) {
        const b = new THREE.Mesh(new THREE.ConeGeometry(0.04 * s, 0.22 * s, 4), bColor);
        b.rotation.x = Math.PI - 0.3;
        b.position.set((bn % 2) * 0.06 * s, -(bn * 0.04) * s, 0);
        bunch.add(b);
      }
      bPlant.add(bunch);

      return bPlant;
    }

    const banana1 = createBananaPlant(-7.5, 2.0, 1.1);
    const banana2 = createBananaPlant(-8.5, -2.5, 0.95);
    monkeyForestGroup.add(banana1, banana2);

    // E. Large Tropical Banyan Tree with Treehouse (Rumah Pokok - matching image!)
    const treehouseGroup = new THREE.Group();
    treehouseGroup.position.set(7.5, 0, -3.5);

    const banyanWoodMat = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.9 });
    const thatchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8, flatShading: true });
    const deckWoodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.75 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, flatShading: true, roughness: 0.8 });

    // Massive twisting trunk & buttress roots
    const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.1, 4.8, 8), banyanWoodMat);
    mainTrunk.position.y = 2.4;
    treehouseGroup.add(mainTrunk);

    // Lush Treehouse Canopy
    const tCanopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5, 1), canopyMat);
    tCanopy1.position.set(0, 5.5, 0);
    const tCanopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), canopyMat);
    tCanopy2.position.set(-1.2, 4.8, 0.8);
    treehouseGroup.add(tCanopy1, tCanopy2);

    // Elevated Balcony Platform (y = 2.8m)
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.22, 8), deckWoodMat);
    deck.position.y = 2.8;
    treehouseGroup.add(deck);

    // Balcony safety railing
    for (let rp = 0; rp < 8; rp++) {
      const ra = (rp / 8) * Math.PI * 2;
      // Leave ladder gap at south
      if (Math.abs(ra - Math.PI / 2) < 0.35) continue;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 5), deckWoodMat);
      post.position.set(Math.cos(ra) * 1.6, 3.25, Math.sin(ra) * 1.6);
      treehouseGroup.add(post);
    }
    const handrail = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 5, 16, Math.PI * 1.6), deckWoodMat);
    handrail.rotation.x = Math.PI / 2;
    handrail.rotation.z = 0.6;
    handrail.position.y = 3.6;
    treehouseGroup.add(handrail);

    // Conical Thatch Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 7), thatchMat);
    roof.position.y = 4.6;
    treehouseGroup.add(roof);

    // Wooden Climbing Ladder with Rungs
    const ladderGroup = new THREE.Group();
    ladderGroup.position.set(0, 0, 1.55);
    const railL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.0, 5), deckWoodMat);
    railL.position.set(-0.35, 1.45, 0);
    railL.rotation.x = -0.15;
    const railR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.0, 5), deckWoodMat);
    railR.position.set(0.35, 1.45, 0);
    railR.rotation.x = -0.15;
    ladderGroup.add(railL, railR);

    for (let rg = 0; rg < 7; rg++) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 5), deckWoodMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, 0.4 + rg * 0.38, -rg * 0.06);
      ladderGroup.add(rung);
    }
    treehouseGroup.add(ladderGroup);

    monkeyForestGroup.add(treehouseGroup);

    // F. Second Tree & Suspended Rope Bridge (Jambatan Tali - matching image!)
    const secondTree = new THREE.Group();
    secondTree.position.set(-1.5, 0, -8.0);
    const sTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 4.5, 7), banyanWoodMat);
    sTrunk.position.y = 2.25;
    const sCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), canopyMat);
    sCanopy.position.y = 5.0;
    const sDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 7), deckWoodMat);
    sDeck.position.y = 2.8;
    secondTree.add(sTrunk, sCanopy, sDeck);
    monkeyForestGroup.add(secondTree);

    // Rope Bridge spanning from treehouse (7.5, 2.8, -3.5) to second tree (-1.5, 2.8, -8.0)
    const bridgeGroup = new THREE.Group();
    const pStart = new THREE.Vector3(6.0, 2.8, -3.8);
    const pEnd = new THREE.Vector3(-0.3, 2.8, -7.5);
    const bridgePlankCount = 12;

    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    for (let bi = 0; bi < bridgePlankCount; bi++) {
      const t = bi / (bridgePlankCount - 1);
      const px = pStart.x + (pEnd.x - pStart.x) * t;
      const pz = pStart.z + (pEnd.z - pStart.z) * t;
      // Catenary dip in middle
      const sag = Math.sin(t * Math.PI) * 0.45;
      const py = 2.8 - sag;

      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.3), deckWoodMat);
      plank.position.set(px, py, pz);
      const ang = Math.atan2(pEnd.x - pStart.x, pEnd.z - pStart.z);
      plank.rotation.y = ang + Math.PI / 2;
      bridgeGroup.add(plank);
    }

    // Trailing Liana Vine for monkey swinging (overhead branch, center of image!)
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
    const swingVine = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), vineMat);
    swingVine.position.set(-1.2, 4.6, 0.5);
    monkeyForestGroup.add(swingVine);

    monkeyForestGroup.add(bridgeGroup);

    // G. Tropical Waterfall & Lagoon Pond (Latar Belakang Air Terjun - matching image!)
    const waterfallRockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, flatShading: true });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.35, transparent: true, opacity: 0.85 });

    const rockWall1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 1), waterfallRockMat);
    rockWall1.position.set(2.0, 1.4, -11.5);
    rockWall1.scale.set(1.6, 1.4, 1.0);
    const rockWall2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), waterfallRockMat);
    rockWall2.position.set(4.5, 1.2, -10.5);
    monkeyForestGroup.add(rockWall1, rockWall2);

    const fallMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.6), waterMat);
    fallMesh.position.set(2.0, 1.3, -11.0);
    fallMesh.rotation.x = 0.15;
    monkeyForestGroup.add(fallMesh);

    // Lagoon Pond
    const lagoonPond = new THREE.Mesh(new THREE.CircleGeometry(4.5, 18), waterMat);
    lagoonPond.rotation.x = -Math.PI / 2;
    lagoonPond.scale.set(1.2, 0.8, 1.0);
    lagoonPond.position.set(2.5, 0.04, -8.5);
    monkeyForestGroup.add(lagoonPond);

    // Animated splash ripples
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.1, 14), rippleMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(2.0, 0.06, -9.8);
    monkeyForestGroup.add(ripple);

    animatedObjects.push({
      update(t) {
        fallMesh.position.y = 1.3 + Math.sin(t * 12) * 0.04;
        const s = 1.0 + Math.sin(t * 5.5) * 0.2;
        ripple.scale.set(s, s, s);
        rippleMat.opacity = 0.45 + Math.sin(t * 5.5) * 0.25;
      }
    });

    // H. Tropical Hibiscus Flowers & Low Split-Rail Fence (matching image!)
    const flowerPink = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const flowerYellow = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const flowerClusters = [
      { x: -5.0, z: 7.5 },
      { x: -3.8, z: 6.2 },
      { x: -0.5, z: 7.2 },
      { x: 3.2, z: 4.8 },
      { x: 6.5, z: 4.5 }
    ];
    flowerClusters.forEach((fc, fi) => {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 5, 5), (fi % 2 === 0) ? flowerPink : flowerYellow);
      fl.position.set(fc.x, 0.2, fc.z);
      monkeyForestGroup.add(fl);
    });

    // Low Rustic Wooden Split-Rail Fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    for (let fp = 0; fp < 5; fp++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.0, 5), fenceMat);
      post.position.set(2.5 + fp * 1.5, 0.5, 4.8);
      monkeyForestGroup.add(post);
      if (fp < 4) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.06), fenceMat);
        rail.position.set(3.25 + fp * 1.5, 0.65, 4.8);
        monkeyForestGroup.add(rail);
      }
    }

    // I. Custom 3D Signboard "HUTAN MONYET" (Left entrance, matching image!)
    const signGroup = new THREE.Group();
    signGroup.position.set(-6.5, 0, 9.5);
    signGroup.rotation.y = 0.25;

    const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8), banyanWoodMat);
    signPole.position.y = 1.1;
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.25, 0.1), banyanWoodMat);
    signBoard.position.y = 1.85;

    const mainSignCanvas = document.createElement('canvas');
    mainSignCanvas.width = 512;
    mainSignCanvas.height = 240;
    const msCtx = mainSignCanvas.getContext('2d');
    msCtx.fillStyle = '#fef3c7';
    msCtx.roundRect ? msCtx.roundRect(8, 8, 496, 224, 20) : msCtx.fillRect(8, 8, 496, 224);
    msCtx.fill();
    msCtx.strokeStyle = '#b45309';
    msCtx.lineWidth = 8;
    msCtx.stroke();

    msCtx.fillStyle = '#d97706';
    msCtx.font = 'bold 32px Nunito, sans-serif';
    msCtx.textAlign = 'center';
    msCtx.fillText('🐵 HUTAN MONYET 🌴', 256, 58);

    msCtx.fillStyle = '#78350f';
    msCtx.font = 'bold 24px Nunito, sans-serif';
    msCtx.fillText('SELAMAT DATANG KE HUTAN MONYET!', 256, 110);

    msCtx.fillStyle = '#15803d';
    msCtx.font = 'bold 18px Nunito, sans-serif';
    msCtx.fillText('Terokai hutan dan temui Monyet Ceria!', 256, 156);

    msCtx.fillStyle = '#0284c7';
    msCtx.font = 'bold 16px Nunito, sans-serif';
    msCtx.fillText('ZON 3 • KSSM TINGKATAN 1 SAINS', 256, 196);

    const msTex = new THREE.CanvasTexture(mainSignCanvas);
    const msLabel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.15), new THREE.MeshBasicMaterial({ map: msTex, side: THREE.DoubleSide }));
    msLabel.position.set(0, 1.85, 0.06);

    // Decorative palm leaves at sign corners
    const palmLeafMat = new THREE.MeshBasicMaterial({ color: 0x16a34a });
    const pl1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), palmLeafMat);
    pl1.position.set(-1.25, 2.45, 0.07);
    pl1.rotation.z = 0.5;
    const pl2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), palmLeafMat);
    pl2.position.set(1.25, 2.45, 0.07);
    pl2.rotation.z = -0.5;
    signGroup.add(signPole, signBoard, msLabel, pl1, pl2);
    monkeyForestGroup.add(signGroup);

    // J. 4 Animated Butterflies
    const bFlyColors = [0xfacc15, 0xec4899, 0x38bdf8, 0xa855f7];
    const bFlyMeshes = [];
    for (let bi = 0; bi < 4; bi++) {
      const bFly = new THREE.Group();
      const bMat = new THREE.MeshBasicMaterial({ color: bFlyColors[bi], side: THREE.DoubleSide });
      const wGeo = new THREE.PlaneGeometry(0.14, 0.12);
      const wL = new THREE.Mesh(wGeo, bMat);
      wL.position.x = -0.07;
      const wR = new THREE.Mesh(wGeo, bMat);
      wR.position.x = 0.07;
      bFly.add(wL, wR);

      const bAngle = (bi / 4) * Math.PI * 2;
      const bDist = 3.5 + (bi % 2) * 1.8;
      bFly.position.set(Math.cos(bAngle) * bDist, 1.2 + (bi % 2) * 0.4, Math.sin(bAngle) * bDist);
      bFly.userData = { wL, wR, baseAngle: bAngle, dist: bDist, baseY: bFly.position.y, speed: 0.75 + bi * 0.25 };
      monkeyForestGroup.add(bFly);
      bFlyMeshes.push(bFly);
    }
    animatedObjects.push({
      update(t) {
        bFlyMeshes.forEach((bf, idx) => {
          const flap = Math.sin(t * 18 + idx) * 0.75;
          bf.userData.wL.rotation.y = flap;
          bf.userData.wR.rotation.y = -flap;
          const a = bf.userData.baseAngle + t * bf.userData.speed * 0.35;
          bf.position.x = Math.cos(a) * bf.userData.dist;
          bf.position.z = Math.sin(a) * bf.userData.dist;
          bf.position.y = bf.userData.baseY + Math.sin(t * 4 + idx) * 0.2;
        });
      }
    });

    // K. 5 Decorative NPC Monkeys (Purely Ambient Life - Matching Reference Image!)
    // 1. Rock plinth for NPC 1 (left side of image)
    const rockPlinth = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), waterfallRockMat);
    rockPlinth.position.set(-6.8, 0.35, 4.2);
    rockPlinth.scale.set(1.2, 0.7, 1.2);
    monkeyForestGroup.add(rockPlinth);

    const npcMonkeyConfigs = [
      // 1. Monkey on rock on the left eating a peeled banana (matching image!)
      { id: 'npc-monkey-banana', name: 'Monyet Makan Pisang', color: 0x92400e, scale: 0.78, pos: { x: -6.8, y: 0.65, z: 4.2 }, rotY: 0.6, behavior: 'eatingBanana' },
      // 2. Monkey swinging from overhead vine branch in center (matching image!)
      { id: 'npc-monkey-swing', name: 'Monyet Bergayut', color: 0x78350f, scale: 0.75, pos: { x: -1.2, y: 3.6, z: 0.5 }, rotY: 0.2, behavior: 'swinging' },
      // 3. Monkey on the treehouse deck balcony looking out (matching image!)
      { id: 'npc-monkey-treehouse', name: 'Monyet di Rumah Pokok', color: 0x854d0e, scale: 0.74, pos: { x: 7.8, y: 2.9, z: -3.2 }, rotY: -0.8, behavior: 'perched' },
      // 4. Monkey walking/hopping along the stepping stones on all fours (matching image!)
      { id: 'npc-monkey-path', name: 'Monyet Melompat Laluan', color: 0x713f12, scale: 0.72, pos: { x: -1.5, y: 0.05, z: 5.2 }, rotY: -0.4, behavior: 'hoppingPath' },
      // 5. Playful baby monkey perched atop the fallen tree log (matching image!)
      { id: 'npc-monkey-log', name: 'Anak Monyet di Batang Kayu', color: 0x92400e, scale: 0.58, pos: { x: -2.0, y: 0.58, z: 2.5 }, rotY: 1.1, behavior: 'perched' }
    ];

    npcMonkeyConfigs.forEach((cfg, ci) => {
      const monkeyMesh = createNPCMonkey(cfg, ci);
      monkeyForestGroup.add(monkeyMesh);
      decorativeMonkeys.push(monkeyMesh);
    });

    parent.add(monkeyForestGroup);
  }


  // ============================================================================
  // MAGICAL COLOURFUL 3D BIRD SANCTUARY (ZON 4: TAMAN BURUNG)
  // ============================================================================

  // D. Burung Rimba 3D (Hero Animal for Zone 4 - Only Interactive Target)
  function createBurungRimbaModel() {
    const g = new THREE.Group();
    g.name = 'BurungRimba_Hero';

    // 1. 3-Tiered Magical Bird Discovery Platform (Dais)
    const daisMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85, flatShading: true }); // Carved slate
    const daisMat2 = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.3 }); // Polished rune ring
    const perchMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }); // Hardwood perch plinth

    // Tier 1: Slate base
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.22, 12), daisMat1);
    tier1.position.y = 0.11;
    // Tier 2: Glowing cyan runic ring
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.18, 12), daisMat2);
    tier2.position.y = 0.29;
    // Tier 3: Natural wooden/stone plinth
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.22, 10), perchMat);
    tier3.position.y = 0.48;
    g.add(tier1, tier2, tier3);

    // 2. Articulated Burung Rimba Body
    const royalBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.15, flatShading: true });
    const wingTipMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5, flatShading: true });
    const goldenChestMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.35, roughness: 0.4 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const eyeDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const birdRoot = new THREE.Group();
    birdRoot.position.y = 0.6; // Sit atop Tier 3 plinth

    // Body
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), royalBlueMat);
    body.position.y = 0.42;
    body.scale.set(0.9, 1.05, 1.35);
    birdRoot.add(body);

    // Glowing Golden Chest
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), goldenChestMat);
    chest.position.set(0, 0.42, 0.22);
    birdRoot.add(chest);

    // Articulated Head & Royal Crest
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.86, 0.28);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), royalBlueMat);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 4), goldenChestMat);
    crest.rotation.x = -0.4;
    crest.position.set(0, 0.3, -0.05);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.02, 0.32);

    // Eyes with corneal reflection
    [-0.17, 0.17].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
      eye.position.set(ex, 0.05, 0.16);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), eyeDotMat);
      dot.position.set(ex + (ex > 0 ? 0.01 : -0.01), 0.065, 0.19);
      headGroup.add(eye, dot);
    });

    headGroup.add(head, crest, beak);
    birdRoot.add(headGroup);

    // Layered Articulated Wings
    const wingGeo = new THREE.BoxGeometry(0.55, 0.22, 0.05);
    const wingTipGeo = new THREE.BoxGeometry(0.24, 0.16, 0.04);

    const wingL = new THREE.Group();
    wingL.position.set(-0.38, 0.52, 0);
    const wBaseL = new THREE.Mesh(wingGeo, royalBlueMat);
    const wTipL = new THREE.Mesh(wingTipGeo, wingTipMat);
    wTipL.position.set(-0.32, -0.02, 0);
    wingL.add(wBaseL, wTipL);

    const wingR = new THREE.Group();
    wingR.position.set(0.38, 0.52, 0);
    const wBaseR = new THREE.Mesh(wingGeo, royalBlueMat);
    const wTipR = new THREE.Mesh(wingTipGeo, wingTipMat);
    wTipR.position.set(0.32, -0.02, 0);
    wingR.add(wBaseR, wTipR);

    birdRoot.add(wingL, wingR);

    // Royal Long Tail Feathers
    const tailFeather = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.65), royalBlueMat);
    tailFeather.position.set(0, 0.35, -0.55);
    tailFeather.rotation.x = -0.45;
    birdRoot.add(tailFeather);

    g.add(birdRoot);

    // 3. Orbiting Golden Sparkles
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sparkles = [];
    for (let si = 0; si < 4; si++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), sparkleMat);
      sp.position.set(Math.cos(si * 1.57) * 0.9, 1.2 + (si % 2) * 0.3, Math.sin(si * 1.57) * 0.9);
      g.add(sp);
      sparkles.push(sp);
    }

    g.userData = {
      birdRoot,
      headGroup,
      wingL,
      wingR,
      chest,
      sparkles,
      tier2,
      animate(t) {
        // Head looking around with alert curiosity
        headGroup.rotation.y = Math.sin(t * 1.4) * 0.32;
        headGroup.rotation.x = Math.sin(t * 2.1) * 0.12;

        // Gentle wing flutter
        const flap = Math.sin(t * 6) * 0.18;
        wingL.rotation.z = flap;
        wingR.rotation.z = -flap;

        // Chest breathing
        const breath = 1.0 + Math.sin(t * 3) * 0.06;
        chest.scale.set(breath, breath, breath);

        // Body gentle bob
        birdRoot.position.y = 0.6 + Math.sin(t * 3) * 0.03;

        // Sparkles orbiting
        sparkles.forEach((sp, i) => {
          const sa = t * 1.8 + i * 1.57;
          sp.position.x = Math.cos(sa) * 0.9;
          sp.position.z = Math.sin(sa) * 0.9;
          sp.position.y = 1.2 + Math.sin(t * 3 + i) * 0.2;
          sp.rotation.y = t * 4;
        });

        // Pulsing runic dais
        if (tier2.material) {
          tier2.material.emissive = new THREE.Color(0x0284c7);
          tier2.material.emissiveIntensity = 0.3 + Math.sin(t * 3) * 0.25;
        }
      }
    };

    return g;
  }

  // Backward compatibility alias
  function createBirdModel() {
    return createBurungRimbaModel();
  }

  // Helper: Create Decorative NPC Bird (Purely Ambient Life - Non Interactive)
  function createNPCBird(cfg, index) {
    const bg = new THREE.Group();
    bg.name = cfg.id;
    bg.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);

    const featherMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.65, flatShading: true });
    const chestMat = new THREE.MeshStandardMaterial({ color: cfg.chestColor || 0xffffff, roughness: 0.6 });
    const beakMat = new THREE.MeshStandardMaterial({ color: cfg.beakColor || 0xf97316, roughness: 0.5 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const s = cfg.scale || 0.7;
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 * s, 1), featherMat);
    body.scale.set(0.9, 1.0, 1.3);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 6, 6), chestMat);
    chest.position.set(0, -0.02 * s, 0.16 * s);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.28 * s, 0.2 * s);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17 * s, 6, 6), featherMat);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045 * s, 0.16 * s, 4), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.02 * s, 0.18 * s);
    // Tiny eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025 * s, 4, 4), eyeMat);
    eyeL.position.set(-0.11 * s, 0.04 * s, 0.09 * s);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025 * s, 4, 4), eyeMat);
    eyeR.position.set(0.11 * s, 0.04 * s, 0.09 * s);
    headGroup.add(head, beak, eyeL, eyeR);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.36 * s, 0.12 * s, 0.03 * s);
    const wingL = new THREE.Mesh(wingGeo, featherMat);
    wingL.position.set(-0.25 * s, 0.05 * s, 0);
    const wingR = new THREE.Mesh(wingGeo, featherMat);
    wingR.position.set(0.25 * s, 0.05 * s, 0);

    // Tail
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14 * s, 0.03 * s, 0.3 * s), featherMat);
    tail.position.set(0, -0.02 * s, -0.28 * s);
    tail.rotation.x = -0.3;

    bg.add(body, chest, headGroup, wingL, wingR, tail);

    bg.userData = {
      cfg,
      index,
      headGroup,
      wingL,
      wingR,
      basePos: { ...cfg.pos },
      animate(t) {
        const offset = index * 0.9;
        if (cfg.behavior === 'headBob') {
          headGroup.rotation.y = Math.sin(t * 2.2 + offset) * 0.4;
          headGroup.rotation.x = Math.sin(t * 3.5 + offset) * 0.15;
          tail.rotation.y = Math.sin(t * 2.8 + offset) * 0.2;
        } else if (cfg.behavior === 'pecking') {
          const peckCycle = Math.sin(t * 4.5 + offset);
          if (peckCycle > 0.4) {
            headGroup.rotation.x = 0.65;
            bg.position.y = cfg.pos.y - 0.04;
          } else {
            headGroup.rotation.x = 0.0;
            bg.position.y = cfg.pos.y + Math.max(0, Math.sin(t * 5 + offset) * 0.06);
          }
        } else if (cfg.behavior === 'drinking') {
          const drink = Math.sin(t * 1.6 + offset);
          headGroup.rotation.x = (drink > 0) ? -0.4 : 0.55;
        } else if (cfg.behavior === 'flyingCircle') {
          const r = cfg.orbitRadius || 8.0;
          const spd = cfg.orbitSpeed || 0.5;
          const ang = t * spd + offset;
          bg.position.x = Math.cos(ang) * r;
          bg.position.z = -4.0 + Math.sin(ang) * r;
          bg.rotation.y = -ang - Math.PI / 2;
          const flap = Math.sin(t * 14) * 0.55;
          wingL.rotation.z = flap;
          wingR.rotation.z = -flap;
        } else if (cfg.behavior === 'hovering') {
          const buzz = Math.sin(t * 36) * 0.7;
          wingL.rotation.z = buzz;
          wingR.rotation.z = -buzz;
          bg.position.x = cfg.pos.x + Math.sin(t * 4) * 0.14;
          bg.position.y = cfg.pos.y + Math.sin(t * 8) * 0.06;
          bg.position.z = cfg.pos.z + Math.cos(t * 3) * 0.08;
        } else {
          // 'perched'
          body.scale.y = 1.0 + Math.sin(t * 2.5 + offset) * 0.03;
          headGroup.rotation.y = Math.sin(t * 1.2 + offset) * 0.25;
        }
      }
    };

    animatedObjects.push({
      update(t) {
        bg.userData.animate(t);
      }
    });

    return bg;
  }

  // BUILD THE COMPLETE 3D BIRD SANCTUARY IN ZONE 4 (x: -32, z: -28)
  function buildBirdSanctuaryZone4(parent) {
    birdSanctuaryGroup = new THREE.Group();
    birdSanctuaryGroup.name = 'BirdSanctuaryZone4';
    birdSanctuaryGroup.position.set(-32, 0, -28);
    decorativeBirds = [];

    // A. Lush circular turf pad (radius 14m)
    const gardenTurf = new THREE.Mesh(
      new THREE.CircleGeometry(14, 24),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, flatShading: true })
    );
    gardenTurf.rotation.x = -Math.PI / 2;
    gardenTurf.position.y = 0.015;
    birdSanctuaryGroup.add(gardenTurf);

    // B. Rocky Canyon Backdrop & Amphitheater
    const canyonRockMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9, flatShading: true });
    const canyonDarkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
    const mossRockMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85, flatShading: true });

    const canyonRocks = [
      { x: -9, y: 3.5, z: -11, w: 4.5, h: 7.0, d: 3.5, mat: canyonRockMat },
      { x: -5, y: 3.2, z: -12, w: 5.0, h: 6.5, d: 4.0, mat: canyonDarkMat },
      { x: 0, y: 4.0, z: -13, w: 6.0, h: 8.0, d: 3.5, mat: canyonRockMat },
      { x: 5, y: 3.4, z: -12, w: 5.5, h: 6.8, d: 4.0, mat: canyonDarkMat },
      { x: 9, y: 3.0, z: -11, w: 4.8, h: 6.0, d: 3.5, mat: canyonRockMat },
      { x: -2.5, y: 1.8, z: -10, w: 3.2, h: 3.6, d: 2.8, mat: mossRockMat },
      { x: 2.5, y: 1.6, z: -10, w: 3.5, h: 3.2, d: 2.5, mat: mossRockMat }
    ];

    canyonRocks.forEach(r => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r.h * 0.45, 1), r.mat);
      rock.position.set(r.x, r.y, r.z);
      rock.scale.set(r.w / (r.h * 0.45), 1.0, r.d / (r.h * 0.45));
      birdSanctuaryGroup.add(rock);
    });

    // C. Stepped Waterfall cascading down into the pond
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const waterfallUpper = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), waterMat);
    waterfallUpper.position.set(0, 4.2, -11.5);
    const waterfallLower = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.5), waterMat);
    waterfallLower.position.set(0, 1.4, -9.8);
    waterfallLower.rotation.x = 0.15;
    birdSanctuaryGroup.add(waterfallUpper, waterfallLower);

    // Waterfall Splash Ring & Ripples
    const splashMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
    const splashRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.8, 16), splashMat);
    splashRing.rotation.x = -Math.PI / 2;
    splashRing.position.set(0, 0.08, -8.6);
    birdSanctuaryGroup.add(splashRing);

    animatedObjects.push({
      update(t) {
        waterfallUpper.position.y = 4.2 + Math.sin(t * 12) * 0.05;
        waterfallLower.position.y = 1.4 + Math.cos(t * 14) * 0.05;
        const s = 1.0 + Math.sin(t * 6) * 0.2;
        splashRing.scale.set(s, s, s);
        splashMat.opacity = 0.5 + Math.sin(t * 6) * 0.25;
      }
    });

    // D. Turquoise Pond
    const pondGeo = new THREE.CircleGeometry(5.2, 24);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.scale.set(1.15, 0.85, 1.0); // Oval shape
    pond.position.set(3.5, 0.04, -5.0);
    birdSanctuaryGroup.add(pond);

    // Shoreline Pebbles
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    for (let p = 0; p < 18; p++) {
      const pAngle = (p / 18) * Math.PI * 2;
      const px = 3.5 + Math.cos(pAngle) * 5.3 * 1.15;
      const pz = -5.0 + Math.sin(pAngle) * 4.3;
      const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + (p % 3) * 0.1, 0), pebbleMat);
      pebble.position.set(px, 0.12, pz);
      birdSanctuaryGroup.add(pebble);
    }

    // Water Lily Pads & Lotus Flowers
    const lilyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const lotusPinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const lotusWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const lilyPositions = [
      { x: 1.8, z: -4.0 },
      { x: 4.8, z: -6.2 },
      { x: 5.5, z: -3.8 },
      { x: 2.2, z: -6.5 }
    ];
    lilyPositions.forEach((lp, li) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 12), lilyMat);
      pad.position.set(lp.x, 0.05, lp.z);
      const lotus = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 6), li % 2 === 0 ? lotusPinkMat : lotusWhiteMat);
      lotus.position.set(lp.x, 0.15, lp.z);
      birdSanctuaryGroup.add(pad, lotus);
    });

    // E. Arched Wooden Footbridge across the pond (with Flower Planter Boxes)
    const bridgeWoodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.75 });
    const bridgeDarkWood = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.8 });
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(3.5, 0, -4.5);
    bridgeGroup.rotation.y = -0.45;

    // Arched Planks Deck
    const deckPlanks = 14;
    for (let k = 0; k < deckPlanks; k++) {
      const prog = (k / (deckPlanks - 1)) - 0.5;
      const plankX = prog * 7.0;
      const plankY = (1 - (prog * 2) * (prog * 2)) * 0.75 + 0.3;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 2.2), bridgeWoodMat);
      plank.position.set(plankX, plankY, 0);
      plank.rotation.z = -prog * 0.45;
      bridgeGroup.add(plank);
    }

    // Railings both sides
    [-1.0, 1.0].forEach(side => {
      for (let rp = -3; rp <= 3; rp++) {
        const prog = (rp / 3) * 0.5;
        const postX = prog * 7.0;
        const postY = (1 - (prog * 2) * (prog * 2)) * 0.75 + 0.3;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), bridgeDarkWood);
        post.position.set(postX, postY + 0.4, side);
        bridgeGroup.add(post);
      }
      for (let s = 0; s < 6; s++) {
        const prog = (s / 5) - 0.5;
        const railX = prog * 5.8;
        const railY = (1 - (prog * 2) * (prog * 2)) * 0.75 + 0.95;
        const railSeg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.08), bridgeWoodMat);
        railSeg.position.set(railX, railY, side);
        railSeg.rotation.z = -prog * 0.45;
        bridgeGroup.add(railSeg);
      }
    });

    // Flower Planter Boxes Mounted on Bridge Handrails
    const flowerBoxMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    const flowerColors = [0xef4444, 0xf59e0b, 0xec4899, 0x3b82f6, 0xa855f7];
    [-1.0, 1.0].forEach(side => {
      [-1.4, 1.4].forEach(bx => {
        const prog = bx / 3.5;
        const by = (1 - (prog * 2) * (prog * 2)) * 0.75 + 0.7;
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.35), flowerBoxMat);
        box.position.set(bx, by, side + (side > 0 ? 0.2 : -0.2));
        bridgeGroup.add(box);

        for (let fl = 0; fl < 5; fl++) {
          const flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 5, 5),
            new THREE.MeshStandardMaterial({ color: flowerColors[(fl + (side > 0 ? 1 : 0)) % flowerColors.length] })
          );
          flower.position.set(bx - 0.4 + fl * 0.2, by + 0.16, side + (side > 0 ? 0.2 : -0.2) + (fl % 2 === 0 ? 0.05 : -0.05));
          bridgeGroup.add(flower);
        }
      });
    });

    birdSanctuaryGroup.add(bridgeGroup);

    // F. Wooden Entrance Archway (Pergola Arch) at South Entrance
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 13.0);

    const archPostMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const archBeamMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });

    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.6, 8), archPostMat);
    postL.position.set(-2.0, 1.8, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.6, 8), archPostMat);
    postR.position.set(2.0, 1.8, 0);
    archGroup.add(postL, postR);

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 0.45), archBeamMat);
    crossBeam.position.set(0, 3.4, 0);
    archGroup.add(crossBeam);
    for (let sl = -3; sl <= 3; sl++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 1.1), archBeamMat);
      slat.position.set(sl * 0.65, 3.6, 0);
      archGroup.add(slat);
    }

    // Wooden Signboard Canvas Texture
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 140;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#78350f';
    sCtx.roundRect ? sCtx.roundRect(8, 8, 496, 124, 20) : sCtx.fillRect(8, 8, 496, 124);
    sCtx.fill();
    sCtx.strokeStyle = '#fef08a';
    sCtx.lineWidth = 6;
    sCtx.stroke();
    sCtx.fillStyle = '#fef08a';
    sCtx.font = 'bold 36px Nunito, sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('🌸 TAMAN BURUNG 🐦', 256, 52);
    sCtx.font = 'bold 20px Nunito, sans-serif';
    sCtx.fillStyle = '#a7f3d0';
    sCtx.fillText('ZON 4: CELL SAFARI SANCTUARY', 256, 96);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.88), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signBoard.position.set(0, 2.7, 0.05);
    archGroup.add(signBoard);

    // Hanging Wicker Flower Baskets on Arch
    [-1.8, 1.8].forEach(hx => {
      const basket = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 7), new THREE.MeshStandardMaterial({ color: 0x92400e }));
      basket.rotation.x = Math.PI;
      basket.position.set(hx, 2.7, 0);
      const hangingChain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0x475569 }));
      hangingChain.position.set(hx, 3.1, 0);
      const flowerBall = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
      flowerBall.position.set(hx, 2.75, 0);
      archGroup.add(basket, hangingChain, flowerBall);
    });

    birdSanctuaryGroup.add(archGroup);

    // G. Curved Stepping-Stone Pathway
    const stonePathMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.9, flatShading: true });
    const steppingStones = [
      { x: 0, z: 12.0 },
      { x: -0.4, z: 10.2 },
      { x: -0.7, z: 8.5 },
      { x: -0.8, z: 6.8 },
      { x: -0.6, z: 5.0 },
      { x: -0.3, z: 3.2 },
      { x: -0.1, z: 1.5 },
      // Towards Gazebo
      { x: -2.2, z: 2.2 },
      { x: -4.2, z: 2.5 },
      { x: -6.0, z: 2.8 },
      // Towards Bridge
      { x: 1.2, z: 0.5 },
      { x: 2.2, z: -1.2 },
      { x: 3.0, z: -2.8 },
      { x: 3.5, z: -4.5 }
    ];
    steppingStones.forEach(st => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.08, 7), stonePathMat);
      stone.position.set(st.x, 0.04, st.z);
      stone.rotation.y = Math.random() * Math.PI;
      birdSanctuaryGroup.add(stone);
    });

    // H. Hexagonal Wooden Gazebo (Astaka Taman)
    const gazeboGroup = new THREE.Group();
    gazeboGroup.position.set(-8.0, 0, 3.0);

    const gazeboWood = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const gazeboRoofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, flatShading: true });

    const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.25, 6), gazeboWood);
    floor.position.y = 0.125;
    gazeboGroup.add(floor);

    for (let gp = 0; gp < 6; gp++) {
      const ga = (gp / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 6), gazeboWood);
      pillar.position.set(Math.cos(ga) * 2.3, 1.52, Math.sin(ga) * 2.3);
      gazeboGroup.add(pillar);
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.6, 6), gazeboRoofMat);
    roof.position.y = 3.6;
    const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
    roofFinial.position.y = 4.5;
    gazeboGroup.add(roof, roofFinial);

    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.45), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    bench.position.set(0, 0.45, -0.8);
    const benchLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 5), gazeboWood);
    benchLeg1.position.set(-0.6, 0.25, -0.8);
    const benchLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 5), gazeboWood);
    benchLeg2.position.set(0.6, 0.25, -0.8);
    gazeboGroup.add(bench, benchLeg1, benchLeg2);

    birdSanctuaryGroup.add(gazeboGroup);

    // I. 2 Sakura / Cherry Blossom Trees
    const sakuraTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const sakuraPinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, flatShading: true, roughness: 0.7 });
    const sakuraLightMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, flatShading: true, roughness: 0.7 });

    function createSakuraTree(x, z, s = 1.0) {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.45 * s, 2.6 * s, 7), sakuraTrunkMat);
      trunk.position.set(0, 1.3 * s, 0);
      trunk.rotation.z = 0.08;
      tree.add(trunk);

      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 1.5 * s, 6), sakuraTrunkMat);
      b1.position.set(-0.5 * s, 2.3 * s, 0);
      b1.rotation.z = 0.6;
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 1.5 * s, 6), sakuraTrunkMat);
      b2.position.set(0.5 * s, 2.3 * s, 0.2 * s);
      b2.rotation.z = -0.55;
      tree.add(b1, b2);

      const clusters = [
        { x: 0, y: 3.5 * s, z: 0, r: 1.6 * s, mat: sakuraPinkMat },
        { x: -1.0 * s, y: 3.0 * s, z: 0.2 * s, r: 1.3 * s, mat: sakuraLightMat },
        { x: 1.0 * s, y: 2.9 * s, z: -0.2 * s, r: 1.3 * s, mat: sakuraPinkMat },
        { x: 0.2 * s, y: 3.2 * s, z: 1.0 * s, r: 1.2 * s, mat: sakuraLightMat }
      ];
      clusters.forEach(c => {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 1), c.mat);
        puff.position.set(c.x, c.y, c.z);
        tree.add(puff);
      });
      return tree;
    }

    const sakuraTree1 = createSakuraTree(6.0, 6.0, 1.1);
    const sakuraTree2 = createSakuraTree(-9.0, -7.0, 0.95);
    birdSanctuaryGroup.add(sakuraTree1, sakuraTree2);

    // 2 Canopy Shade Trees
    const canopyTrunk = new THREE.MeshStandardMaterial({ color: 0x582a0a, roughness: 0.9 });
    const canopyGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, flatShading: true, roughness: 0.8 });
    function createShadeTree(x, z, s = 1.0) {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * s, 0.5 * s, 2.8 * s, 7), canopyTrunk);
      trunk.position.y = 1.4 * s;
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * s, 1), canopyGreen);
      foliage.position.y = 3.6 * s;
      tree.add(trunk, foliage);
      return tree;
    }
    const shadeTree1 = createShadeTree(-8.0, 10.0, 1.0);
    const shadeTree2 = createShadeTree(9.0, -10.0, 1.05);
    birdSanctuaryGroup.add(shadeTree1, shadeTree2);

    // J. 2 Wooden Birdhouses on Posts
    function createBirdhouse(x, z, roofCol = 0x16a34a) {
      const bh = new THREE.Group();
      bh.position.set(x, 0, z);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), archPostMat);
      post.position.y = 0.9;
      const house = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.45), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
      house.position.y = 1.95;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 4), new THREE.MeshStandardMaterial({ color: roofCol }));
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 2.35;
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), new THREE.MeshBasicMaterial({ color: 0x1f2937 }));
      hole.position.set(0, 1.98, 0.23);
      const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), archPostMat);
      perch.rotation.x = Math.PI / 2;
      perch.position.set(0, 1.82, 0.3);
      bh.add(post, house, roof, hole, perch);
      return bh;
    }
    const birdhouse1 = createBirdhouse(-5.0, 8.0, 0x16a34a);
    const birdhouse2 = createBirdhouse(7.5, -4.0, 0xef4444);
    birdSanctuaryGroup.add(birdhouse1, birdhouse2);

    // K. 2 Woven Twig Nests with Speckled Eggs
    const nestMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.4 });
    function createNest(x, y, z) {
      const ng = new THREE.Group();
      ng.position.set(x, y, z);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.2, 0.16, 8), nestMat);
      const egg1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eggMat);
      egg1.scale.set(0.8, 1.2, 0.8);
      egg1.position.set(-0.06, 0.08, 0);
      const egg2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eggMat);
      egg2.scale.set(0.8, 1.2, 0.8);
      egg2.position.set(0.06, 0.08, 0.04);
      ng.add(bowl, egg1, egg2);
      return ng;
    }
    const nest1 = createNest(5.8, 2.4, 5.8);
    const nest2 = createNest(-4.0, 2.8, -10.5);
    birdSanctuaryGroup.add(nest1, nest2);

    // L. Stone Bird Bath with Sparkling Water
    const stoneBathMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const bathWaterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.9 });
    const bathGroup = new THREE.Group();
    bathGroup.position.set(-4.0, 0, -2.0);
    const bathBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.15, 8), stoneBathMat);
    bathBase.position.y = 0.075;
    const bathPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 8), stoneBathMat);
    bathPedestal.position.y = 0.45;
    const bathBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.4, 0.22, 10), stoneBathMat);
    bathBowl.position.y = 0.85;
    const bathWater = new THREE.Mesh(new THREE.CircleGeometry(0.55, 10), bathWaterMat);
    bathWater.rotation.x = -Math.PI / 2;
    bathWater.position.y = 0.93;
    bathGroup.add(bathBase, bathPedestal, bathBowl, bathWater);
    birdSanctuaryGroup.add(bathGroup);

    // M. Rustic Wooden Split-Rail Perimeter Fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    for (let f = 0; f < 12; f++) {
      const fa = -Math.PI * 0.7 + (f / 11) * Math.PI * 1.4;
      if (Math.abs(fa - Math.PI / 2) < 0.28) continue;
      const fx = Math.cos(fa) * 13.5;
      const fz = Math.sin(fa) * 13.5;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 6), fenceMat);
      post.position.set(fx, 0.55, fz);
      birdSanctuaryGroup.add(post);

      if (f < 11) {
        const nextFa = -Math.PI * 0.7 + ((f + 1) / 11) * Math.PI * 1.4;
        if (Math.abs(nextFa - Math.PI / 2) >= 0.28) {
          const nfx = Math.cos(nextFa) * 13.5;
          const nfz = Math.sin(nextFa) * 13.5;
          const midX = (fx + nfx) / 2;
          const midZ = (fz + nfz) / 2;
          const len = Math.hypot(nfx - fx, nfz - fz);
          const ang = Math.atan2(nfx - fx, nfz - fz);
          const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len), fenceMat);
          railTop.position.set(midX, 0.85, midZ);
          railTop.rotation.y = ang;
          const railBot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len), fenceMat);
          railBot.position.set(midX, 0.45, midZ);
          railBot.rotation.y = ang;
          birdSanctuaryGroup.add(railTop, railBot);
        }
      }
    }

    // N. 6 Animated Butterflies
    const bFlyColors = [0xf472b6, 0xfacc15, 0x38bdf8, 0xa855f7, 0x34d399, 0xf97316];
    const bFlyMeshes = [];
    for (let bi = 0; bi < 6; bi++) {
      const bFly = new THREE.Group();
      const bMat = new THREE.MeshBasicMaterial({ color: bFlyColors[bi], side: THREE.DoubleSide });
      const wGeo = new THREE.PlaneGeometry(0.14, 0.12);
      const wL = new THREE.Mesh(wGeo, bMat);
      wL.position.x = -0.07;
      const wR = new THREE.Mesh(wGeo, bMat);
      wR.position.x = 0.07;
      bFly.add(wL, wR);

      const bAngle = (bi / 6) * Math.PI * 2;
      const bDist = 3.5 + (bi % 3) * 2.2;
      bFly.position.set(Math.cos(bAngle) * bDist, 1.2 + (bi % 2) * 0.5, Math.sin(bAngle) * bDist);
      bFly.userData = { wL, wR, baseAngle: bAngle, dist: bDist, baseY: bFly.position.y, speed: 0.8 + (bi % 3) * 0.4 };
      birdSanctuaryGroup.add(bFly);
      bFlyMeshes.push(bFly);
    }
    animatedObjects.push({
      update(t) {
        bFlyMeshes.forEach((bf, idx) => {
          const flap = Math.sin(t * 18 + idx) * 0.75;
          bf.userData.wL.rotation.y = flap;
          bf.userData.wR.rotation.y = -flap;
          const a = bf.userData.baseAngle + t * bf.userData.speed * 0.35;
          bf.position.x = Math.cos(a) * bf.userData.dist;
          bf.position.z = Math.sin(a) * bf.userData.dist;
          bf.position.y = bf.userData.baseY + Math.sin(t * 4 + idx) * 0.25;
        });
      }
    });

    // O. 12 Decorative NPC Birds (Ambient Life - Non-Interactive)
    const npcBirdConfigs = [
      { id: 'npc-canary', name: 'Canary Kuning', color: 0xfacc15, chestColor: 0xfef08a, beakColor: 0xf97316, scale: 0.65, pos: { x: -8.0, y: 4.65, z: 3.0 }, behavior: 'headBob' },
      { id: 'npc-cardinal', name: 'Cardinal Merah', color: 0xef4444, chestColor: 0xb91c1c, beakColor: 0x1f2937, scale: 0.7, pos: { x: 5.4, y: 2.7, z: 5.6 }, behavior: 'headBob' },
      { id: 'npc-parakeet', name: 'Parkit Zamrud', color: 0x22c55e, chestColor: 0xfacc15, beakColor: 0xf97316, scale: 0.68, pos: { x: 4.2, y: 1.35, z: -4.5 }, behavior: 'headBob' },
      { id: 'npc-violet', name: 'Pipit Ungu', color: 0xa855f7, chestColor: 0xf472b6, beakColor: 0xfbbf24, scale: 0.62, pos: { x: -3.6, y: 0.95, z: -2.0 }, behavior: 'drinking' },
      { id: 'npc-sunconure', name: 'Nuri Oren', color: 0xf97316, chestColor: 0xfacc15, beakColor: 0x1f2937, scale: 0.7, pos: { x: -5.0, y: 2.15, z: 8.3 }, behavior: 'headBob' },
      { id: 'npc-rosefinch', name: 'Pipit Merah Jambu', color: 0xf472b6, chestColor: 0xffffff, beakColor: 0xfbbf24, scale: 0.65, pos: { x: -8.5, y: 2.55, z: -6.8 }, behavior: 'perched' },
      { id: 'npc-bluebird', name: 'Burung Biru Nilam', color: 0x3b82f6, chestColor: 0xf97316, beakColor: 0x1f2937, scale: 0.68, pos: { x: -2.8, y: 1.15, z: 13.5 }, behavior: 'headBob' },
      { id: 'npc-whitedove', name: 'Merpati Putih', color: 0xf8fafc, chestColor: 0xf1f5f9, beakColor: 0xf472b6, scale: 0.72, pos: { x: -7.6, y: 0.68, z: 2.3 }, behavior: 'perched' },
      { id: 'npc-goldfinch', name: 'Goldfinch Kuning', color: 0xfde047, chestColor: 0x65a30d, beakColor: 0xf97316, scale: 0.6, pos: { x: -1.6, y: 0.12, z: 4.8 }, behavior: 'pecking' },
      { id: 'npc-flamerobin', name: 'Robin Merah', color: 0xf97316, chestColor: 0xef4444, beakColor: 0x1f2937, scale: 0.62, pos: { x: 1.8, y: 0.12, z: 2.4 }, behavior: 'pecking' },
      { id: 'npc-falcon', name: 'Helang Mini', color: 0x78350f, chestColor: 0xf8fafc, beakColor: 0xfacc15, scale: 0.85, pos: { x: 0, y: 6.8, z: -4 }, behavior: 'flyingCircle', orbitRadius: 9.5, orbitSpeed: 0.6 },
      { id: 'npc-hummingbird', name: 'Kelicap Madu', color: 0x06b6d4, chestColor: 0x10b981, beakColor: 0x0f172a, scale: 0.45, pos: { x: 1.8, y: 2.75, z: 13.0 }, behavior: 'hovering' }
    ];

    npcBirdConfigs.forEach((cfg, ci) => {
      const birdMesh = createNPCBird(cfg, ci);
      birdSanctuaryGroup.add(birdMesh);
      decorativeBirds.push(birdMesh);
    });

    parent.add(birdSanctuaryGroup);
  }

  // E. Musang 3D (Fox)
  function createFoxModel() {
    const g = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7, flatShading: true });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 1.1), coatMat);
    body.position.y = 0.65;
    g.add(body);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.38, 0.35), whiteMat);
    chest.position.set(0, 0.62, 0.4);
    g.add(chest);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 6), coatMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.95, 0.6);
    g.add(head);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.24, 4);
    const earL = new THREE.Mesh(earGeo, coatMat);
    earL.position.set(-0.16, 1.22, 0.48);
    const earR = new THREE.Mesh(earGeo, coatMat);
    earR.position.set(0.16, 1.22, 0.48);
    g.add(earL, earR);

    // Big Bushy Tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 7), coatMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.75, -0.75);
    g.add(tail);

    g.userData = {
      animate(t) {
        tail.rotation.y = Math.sin(t * 2.5) * 0.3;
        head.rotation.y = Math.sin(t * 1.2) * 0.15;
      }
    };
    return g;
  }

  // 11. FIREFLIES & BUTTERFLIES (FASA 5 & 11)
  function buildFirefliesAndButterflies() {
    firefliesGroup = new THREE.Group();
    firefliesGroup.name = 'FirefliesGuideTrail';

    const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 });
    const flyMeshes = [];

    for (let f = 0; f < 32; f++) {
      const fly = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 4), fireflyMat);
      const angle = (f / 32) * Math.PI * 2;
      const r = 8 + (f % 5) * 6;
      fly.position.set(Math.cos(angle) * r, 1.2 + (f % 4) * 0.4, Math.sin(angle) * r);
      fly.userData = { baseAngle: angle, radius: r, baseY: fly.position.y, speed: 0.3 + (f % 3) * 0.2 };
      firefliesGroup.add(fly);
      flyMeshes.push(fly);
    }

    animatedObjects.push({
      update(t) {
        flyMeshes.forEach(fm => {
          const a = fm.userData.baseAngle + t * fm.userData.speed * 0.15;
          fm.position.x = Math.cos(a) * fm.userData.radius;
          fm.position.z = Math.sin(a) * fm.userData.radius;
          fm.position.y = fm.userData.baseY + Math.sin(t * 2 + a) * 0.3;
        });
      }
    });

    scene.add(firefliesGroup);
  }

  // 12. CAMERA-RELATIVE FIRST-PERSON MOVEMENT & COLLISION (FASA 12 & 17)
  function updatePlayerMovement() {
    if (State.isPaused || DOM.explorer.classList.contains('open') || DOM.victory.classList.contains('open') || DOM.book.classList.contains('open') || DOM.intro.classList.contains('open')) return;

    // CAMERA-RELATIVE MOVEMENT MATH (Identical to verified Mod A standard):
    let currentLookYaw = player.rotY;
    if (gyro.active) currentLookYaw += gyro.yaw;

    const forwardX = -Math.sin(currentLookYaw);
    const forwardZ = -Math.cos(currentLookYaw);
    const rightX = Math.cos(currentLookYaw);
    const rightZ = -Math.sin(currentLookYaw);

    let inputFwd = 0;
    let inputStr = 0;

    if (player.keys.forward) inputFwd += 1;
    if (player.keys.backward) inputFwd -= 1;
    if (player.keys.right) inputStr += 1;
    if (player.keys.left) inputStr -= 1;

    if (joystickState.active) {
      inputFwd += joystickState.y; // Positive is forward (joystick dragged up)
      inputStr += joystickState.x; // Positive is right
    }

    let moveX = (inputFwd * forwardX) + (inputStr * rightX);
    let moveZ = (inputFwd * forwardZ) + (inputStr * rightZ);

    const mag = Math.hypot(moveX, moveZ);
    if (mag > 0) {
      const scale = (Math.min(mag, 1.0) / mag) * player.speed;
      moveX *= scale;
      moveZ *= scale;
    }

    let nextX = player.x + moveX;
    let nextZ = player.z + moveZ;

    // COLLISION 1: Forest Boundaries (-52 to +52)
    nextX = Math.max(-52, Math.min(52, nextX));
    nextZ = Math.max(-52, Math.min(52, nextZ));

    // COLLISION 2: Tree of Life Trunk (radius 2.2m around 0,0)
    const distToTree = Math.hypot(nextX, nextZ);
    if (distToTree < 2.4) {
      const a = Math.atan2(nextZ, nextX);
      nextX = Math.cos(a) * 2.4;
      nextZ = Math.sin(a) * 2.4;
    }

    player.x = nextX;
    player.z = nextZ;

    // Camera update
    camera.position.set(player.x, player.y, player.z);
    if (gyro.active) {
      const combinedPitch = Math.max(-1.0, Math.min(1.0, player.pitch + gyro.pitch));
      camera.rotation.set(combinedPitch, player.rotY + gyro.yaw, 0, 'YXZ');
    } else {
      camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
    }

    checkProximity();
    drawMiniMap();
  }

  // 13. PROXIMITY DETECTION TO ANIMALS & TREE OF LIFE
  function checkProximity() {
    let closestIndex = -1;
    let minDist = 5.2;

    SAFARI_ZONES.forEach((z, idx) => {
      const d = Math.hypot(player.x - z.pos.x, player.z - z.pos.z);
      if (d < minDist) {
        minDist = d;
        closestIndex = idx;
      }
    });

    State.nearbyZoneIndex = closestIndex;

    const distToCenter = Math.hypot(player.x, player.z);
    State.nearTreeOfLife = (distToCenter <= 5.8);

    if (State.nearTreeOfLife && State.crystalsCount >= 5 && !State.treeActivated) {
      DOM.promptIcon.textContent = '🌳';
      DOM.promptTitle.textContent = 'POKOK KEHIDUPAN BERSEDIA!';
      DOM.promptSub.textContent = 'Semua 5 Kristal Bersedia Untuk Dipulihkan';
      DOM.promptBtnText.textContent = 'Aktifkan Pokok Kehidupan';
      DOM.prompt.classList.add('active');
    } else if (closestIndex >= 0) {
      const cz = SAFARI_ZONES[closestIndex];
      const isDone = State.completedZones.has(closestIndex);
      DOM.promptIcon.textContent = cz.emoji;

      if (closestIndex === 0) {
        // Special custom prompt for Arnab Comel (Zone 1)
        DOM.promptTitle.textContent = 'ARNAB COMEL DITEMUI!';
        DOM.promptSub.textContent = 'Hebat! Anda telah menemui Arnab Comel. Jom terokai sel haiwan dan kenali struktur asasnya!';
        DOM.promptBtnText.textContent = 'Teroka Sel Haiwan';

        if (!animGroup_zone1_rabbitAudio) {
          SafariAudio.rabbitPop && SafariAudio.rabbitPop();
          animGroup_zone1_rabbitAudio = true;
        }
      } else if (closestIndex === 1) {
        // Special custom prompt for Rusa Anggun (Zone 2)
        DOM.promptTitle.textContent = 'RUSA ANGGUN DITEMUI!';
        DOM.promptSub.textContent = 'Hebat, Saintis Muda! Anda telah menemui Rusa Anggun. Mari terokai nukleus, pusat kawalan sel haiwan!';
        DOM.promptBtnText.textContent = 'Teroka Sel Haiwan';

        if (!animGroup_zone2_deerAudio) {
          SafariAudio.deerChime && SafariAudio.deerChime();
          animGroup_zone2_deerAudio = true;
        }
      } else if (closestIndex === 2) {
        // Special custom prompt for Monyet Ceria (Zone 3)
        DOM.promptTitle.textContent = 'MONYET CERIA DITEMUI!';
        DOM.promptSub.textContent = 'Tahniah, Saintis Muda! Anda berjaya menemui Monyet Ceria. Jom terokai struktur sel haiwan!';
        DOM.promptBtnText.textContent = 'Teroka Sel Haiwan';

        if (!animGroup_zone3_monkeyAudio) {
          SafariAudio.monkeyCall && SafariAudio.monkeyCall();
          animGroup_zone3_monkeyAudio = true;
        }
      } else if (closestIndex === 3) {
        // Special custom prompt for Burung Rimba (Zone 4)
        DOM.promptTitle.textContent = 'BURUNG RIMBA DITEMUI!';
        DOM.promptSub.textContent = 'Hebat! Anda berjaya menemui Burung Rimba. Jom terokai sel haiwan dan ketahui rahsia kehidupan!';
        DOM.promptBtnText.textContent = 'Teroka Sel Haiwan';

        if (!animGroup_zone4_chirped) {
          SafariAudio.birdChirp();
          animGroup_zone4_chirped = true;
        }
      } else {
        DOM.promptTitle.textContent = `${cz.animal.toUpperCase()} DITEMUI!`;
        DOM.promptSub.textContent = `${cz.name} • ${cz.topic} ${isDone ? '✓ (Kristal Telah Dituntut)' : ''}`;
        DOM.promptBtnText.textContent = isDone ? 'Teroka Semula Sel' : 'Teroka Sel Haiwan';
      }

      DOM.prompt.classList.add('active');
    } else {
      animGroup_zone4_chirped = false;
      DOM.prompt.classList.remove('active');
    }
  }

  // 14. MINIMAP RADAR CANVAS (FASA 11)
  function drawMiniMap() {
    if (!DOM.minimap) return;
    const ctx = DOM.minimap.getContext('2d');
    const w = DOM.minimap.width;
    const h = DOM.minimap.height;
    ctx.clearRect(0, 0, w, h);

    // Map Coordinates (-55..55 -> 0..w)
    const toMap = (wx, wz) => ({
      x: ((wx + 55) / 110) * w,
      y: ((wz + 55) / 110) * h
    });

    // Background circle
    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(0, 0, w, h);

    // River line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.8);
    ctx.lineTo(w * 0.85, h * 0.15);
    ctx.stroke();

    // Center Tree of Life
    const cp = toMap(0, 0);
    ctx.fillStyle = State.crystalsCount >= 5 ? '#34d399' : '#065f46';
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 9, 0, Math.PI * 2);
    ctx.fill();

    // 5 Animal Zone Dots
    SAFARI_ZONES.forEach((z, idx) => {
      const p = toMap(z.pos.x, z.pos.z);
      const isDone = State.completedZones.has(idx);
      ctx.fillStyle = isDone ? '#22c55e' : z.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.emoji, p.x, p.y - 10);
    });

    // Player position & heading arrow
    const pp = toMap(player.x, player.z);
    ctx.save();
    ctx.translate(pp.x, pp.y);
    let lookYaw = player.rotY + (gyro.active ? gyro.yaw : 0);
    ctx.rotate(lookYaw);

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 15. MAIN RENDER LOOP
  let lastTime = 0;
  function renderLoop(time) {
    requestAnimationFrame(renderLoop);
    const t = time * 0.001;

    updatePlayerMovement();

    // Update animated forest entities
    animatedObjects.forEach(obj => {
      if (typeof obj.update === 'function') obj.update(t);
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // 16. CELL EXPLORER 3D IMPLEMENTATION (FASA 8)
  function initExplorer3D() {
    explorerScene = new THREE.Scene();
    explorerScene.background = new THREE.Color(0xf0fdfa);

    const w = DOM.explorerCanvas.clientWidth || 480;
    const h = DOM.explorerCanvas.clientHeight || 360;

    explorerCamera = new THREE.PerspectiveCamera(50, w / h, 0.1, 50);
    explorerCamera.position.set(0, 0, 3.2);

    explorerRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    explorerRenderer.setSize(w, h);
    explorerRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    DOM.explorerCanvas.innerHTML = '';
    DOM.explorerCanvas.appendChild(explorerRenderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x99f6e4, 1.1);
    explorerScene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 8, 5);
    explorerScene.add(dir);

    // Build or Load 3D Animal Cell
    buildInteractiveAnimalCell(explorerScene);

    setupExplorerControls();
    animateExplorer();
  }

  function buildInteractiveAnimalCell(parent) {
    const cellRoot = new THREE.Group();
    cellRoot.name = 'AnimalCellRoot';
    explorerOrganelleMeshes = {};

    // 1. Semi-translucent Outer Plasma Membrane Sphere
    const membraneGeo = new THREE.SphereGeometry(1.25, 32, 32);
    const membraneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    membraneMesh.userData = { organelleKey: 'Membran Sel' };
    cellRoot.add(membraneMesh);
    explorerOrganelleMeshes['Membran Sel'] = membraneMesh;

    // 2. Cytoplasm Inner Matrix
    const cytoGeo = new THREE.SphereGeometry(1.18, 24, 24);
    const cytoMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.28,
      roughness: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
    cytoMesh.userData = { organelleKey: 'Sitoplasma' };
    cellRoot.add(cytoMesh);
    explorerOrganelleMeshes['Sitoplasma'] = cytoMesh;

    // 3. Center Nucleus with cutaway nucleolus
    const nucGroup = new THREE.Group();
    nucGroup.position.set(0, 0.05, 0);
    const nucGeo = new THREE.SphereGeometry(0.48, 24, 24);
    const nucMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x5b21b6,
      emissiveIntensity: 0.35,
      roughness: 0.35
    });
    const nucMesh = new THREE.Mesh(nucGeo, nucMat);
    nucGroup.add(nucMesh);

    // Nucleolus
    const nucCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xbe185d, emissiveIntensity: 0.5 })
    );
    nucCore.position.set(0.1, 0.1, 0.22);
    nucGroup.add(nucCore);
    nucGroup.userData = { organelleKey: 'Nukleus' };
    cellRoot.add(nucGroup);
    explorerOrganelleMeshes['Nukleus'] = nucGroup;

    // 4. Mitochondria (4 bujur berlipat)
    const mitoGroup = new THREE.Group();
    const mitoMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.2 });
    const mitoOffsets = [
      { x: -0.65, y: 0.45, z: 0.35, rot: [0.3, 0.4, 0] },
      { x: 0.72, y: -0.4, z: 0.3, rot: [-0.4, 0.5, 0.2] },
      { x: -0.5, y: -0.5, z: -0.45, rot: [0.6, -0.3, 0] },
      { x: 0.55, y: 0.5, z: -0.35, rot: [-0.2, -0.6, 0.4] }
    ];
    mitoOffsets.forEach(pos => {
      const mMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.42, 12), mitoMat);
      mMesh.scale.set(1.0, 1.0, 0.75);
      mMesh.position.set(pos.x, pos.y, pos.z);
      mMesh.rotation.set(...pos.rot);
      mitoGroup.add(mMesh);
    });
    mitoGroup.userData = { organelleKey: 'Mitokondria' };
    cellRoot.add(mitoGroup);
    explorerOrganelleMeshes['Mitokondria'] = mitoGroup;

    // 5. Jasad Golgi
    const golgiGroup = new THREE.Group();
    const golgiMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 });
    for (let g = 0; g < 4; g++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.35 + g * 0.08, 0.035, 8, 20, Math.PI * 0.7), golgiMat);
      arc.position.set(0.2, -0.35 + g * 0.08, -0.5);
      arc.rotation.x = Math.PI / 4;
      golgiGroup.add(arc);
    }
    golgiGroup.userData = { organelleKey: 'Jasad Golgi' };
    cellRoot.add(golgiGroup);
    explorerOrganelleMeshes['Jasad Golgi'] = golgiGroup;

    // Cuba muatkan GLB aset sedia ada jika boleh
    tryMountGLBAnimalCell(cellRoot);

    parent.add(cellRoot);
    State.explorerModel = cellRoot;
  }

  function tryMountGLBAnimalCell(cellRoot) {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    const loader = new THREE.GLTFLoader();
    const glbUrl = '../assets/models/animal_cell.glb';
    loader.load(glbUrl, (gltf) => {
      if (gltf && gltf.scene) {
        gltf.scene.scale.set(1.4, 1.4, 1.4);
        gltf.scene.position.set(0, 0, 0);
        // Sembunyikan mesh asas dan gunakan GLB
        cellRoot.clear();
        cellRoot.add(gltf.scene);
        // Map mesh nodes
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            const n = node.name.toLowerCase();
            if (n.includes('membran')) node.userData.organelleKey = 'Membran Sel';
            else if (n.includes('sitoplasma')) node.userData.organelleKey = 'Sitoplasma';
            else if (n.includes('nukleus')) node.userData.organelleKey = 'Nukleus';
            else if (n.includes('mitokondria')) node.userData.organelleKey = 'Mitokondria';
            else if (n.includes('golgi')) node.userData.organelleKey = 'Jasad Golgi';
          }
        });
      }
    }, undefined, () => {});
  }

  function setupExplorerControls() {
    const el = DOM.explorerCanvas;
    if (!el) return;

    const startDrag = (cx, cy) => {
      explorerDrag.active = true;
      explorerDrag.prevX = cx;
      explorerDrag.prevY = cy;
    };

    const moveDrag = (cx, cy) => {
      if (!explorerDrag.active || !State.explorerModel) return;
      const dx = cx - explorerDrag.prevX;
      const dy = cy - explorerDrag.prevY;
      explorerDrag.prevX = cx;
      explorerDrag.prevY = cy;
      explorerDrag.rotY += dx * 0.008;
      explorerDrag.rotX = Math.max(-1.0, Math.min(1.0, explorerDrag.rotX + dy * 0.008));
      State.explorerModel.rotation.y = explorerDrag.rotY;
      State.explorerModel.rotation.x = explorerDrag.rotX;
    };

    const endDrag = () => { explorerDrag.active = false; };

    el.addEventListener('pointerdown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('pointermove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('pointerup', endDrag);

    // Zoom
    const applyZoom = (delta) => {
      if (!explorerCamera) return;
      explorerDrag.targetZoom = Math.max(1.8, Math.min(5.5, explorerDrag.targetZoom + delta));
    };

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      applyZoom(e.deltaY * 0.002);
    }, { passive: false });

    if (DOM.zoomIn) DOM.zoomIn.addEventListener('click', () => applyZoom(-0.5));
    if (DOM.zoomOut) DOM.zoomOut.addEventListener('click', () => applyZoom(0.5));

    // Tap Organelle raycasting
    el.addEventListener('click', (e) => {
      if (!explorerCamera || !State.explorerModel) return;
      const rect = el.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, explorerCamera);
      const hits = raycaster.intersectObjects(State.explorerModel.children, true);
      for (let i = 0; i < hits.length; i++) {
        let cur = hits[i].object;
        while (cur && cur !== State.explorerModel) {
          if (cur.userData && cur.userData.organelleKey) {
            selectOrganelle(cur.userData.organelleKey);
            return;
          }
          cur = cur.parent;
        }
      }
    });
  }

  function animateExplorer() {
    explorerAnimId = requestAnimationFrame(animateExplorer);
    if (!DOM.explorer.classList.contains('open')) return;

    if (explorerCamera) {
      explorerCamera.position.z += (explorerDrag.targetZoom - explorerCamera.position.z) * 0.1;
    }
    if (State.explorerModel && !explorerDrag.active) {
      State.explorerModel.rotation.y += 0.004; // Slow ambient rotation
    }
    if (explorerRenderer && explorerScene && explorerCamera) {
      explorerRenderer.render(explorerScene, explorerCamera);
    }
  }

  function selectOrganelle(key) {
    if (!ORGANELLES_INFO[key]) return;
    State.selectedOrganelleKey = key;
    const info = ORGANELLES_INFO[key];

    // Highlight chips
    const chips = DOM.organelleChips.querySelectorAll('.cs-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-organelle') === key);
    });

    DOM.organelleInfo.innerHTML = `
      <strong style="color:${info.color}">${info.icon} ${info.title}</strong>
      <p>${info.function}</p>
    `;

    SafariAudio.chime();
  }

  // 17. BUKA CELL EXPLORER BAGI ZON SEMASA
  function openCellExplorer(zoneIndex) {
    State.activeZoneIndex = zoneIndex;
    const zone = SAFARI_ZONES[zoneIndex];
    if (!zone) return;

    DOM.explorerKicker.textContent = `${zone.emoji} ${zone.animal.toUpperCase()} • ${zone.name.toUpperCase()}`;
    DOM.focusNote.innerHTML = `🎯 <strong>Fokus Pembelajaran Zon:</strong> ${zone.topic}. Selesaikan cabaran sains untuk menyelamatkan ${zone.animal} dan mendapatkan Kristal Kehidupan!`;

    // Render Organelle Chips
    DOM.organelleChips.innerHTML = '';
    Object.keys(ORGANELLES_INFO).forEach(key => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'cs-chip' + (key === zone.focusOrganelle ? ' active' : '');
      chip.setAttribute('data-organelle', key);
      chip.textContent = `${ORGANELLES_INFO[key].icon} ${key}`;
      chip.addEventListener('click', () => selectOrganelle(key));
      DOM.organelleChips.appendChild(chip);
    });

    // Select initial organelle
    selectOrganelle(zone.focusOrganelle in ORGANELLES_INFO ? zone.focusOrganelle : 'Membran Sel');

    // Setup challenge container
    renderChallengeUI(zoneIndex);

    DOM.explorer.classList.add('open');
    if (!explorerRenderer) initExplorer3D();
  }

  function closeCellExplorer() {
    DOM.explorer.classList.remove('open');
  }

  // 18. CABARAN SAINS KSSM & PEMBERIAN KRISTAL KEHIDUPAN (FASA 9 & 10)
  function renderChallengeUI(zoneIndex) {
    const zone = SAFARI_ZONES[zoneIndex];
    const ch = zone.challenge;
    const isCompleted = State.completedZones.has(zoneIndex);

    if (isCompleted) {
      DOM.challenge.innerHTML = `
        <div class="cs-feedback ok">
          ✅ <strong>Cabaran Telah Berjaya Selesai!</strong><br/>
          Kristal Kehidupan telah diperoleh dan Pokok Kehidupan telah dipulihkan untuk zon ini. (+200 Skor)
        </div>
      `;
      DOM.challengeStart.classList.add('hidden');
      return;
    }

    DOM.challenge.innerHTML = `
      <h3>${ch.title}</h3>
      <div class="cs-q">${ch.question}</div>
      <div class="cs-options">
        ${ch.options.map((opt, i) => `
          <button type="button" class="cs-opt" data-opt="${i}">${opt}</button>
        `).join('')}
      </div>
      <div class="cs-feedback hidden" id="cs-ch-feedback"></div>
    `;

    DOM.challengeStart.classList.remove('hidden');
    DOM.challengeStartText.textContent = 'Semak Jawapan';

    let selectedOption = -1;
    const optBtns = DOM.challenge.querySelectorAll('.cs-opt');
    optBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        optBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOption = parseInt(btn.getAttribute('data-opt'), 10);
      });
    });

    DOM.challengeStart.onclick = () => {
      if (selectedOption < 0) {
        alertToast('⚠️ Sila pilih satu jawapan sebelum menyemak.');
        return;
      }
      const feedback = document.getElementById('cs-ch-feedback');
      feedback.classList.remove('hidden');

      if (selectedOption === ch.correct) {
        optBtns[selectedOption].classList.add('correct');
        optBtns.forEach(b => b.disabled = true);
        feedback.className = 'cs-feedback ok';
        feedback.innerHTML = `🎉 <strong>TAHNIAH! TEPAT SEKALI!</strong><br/>${ch.explanation}<br/><strong>💎 +1 KRISTAL KEHIDUPAN (+200 Skor)</strong>`;
        SafariAudio.correct();

        // Award Crystal (Once per zone)
        awardLifeCrystal(zoneIndex);
        DOM.challengeStart.classList.add('hidden');
      } else {
        optBtns[selectedOption].classList.add('wrong');
        feedback.className = 'cs-feedback bad';
        feedback.innerHTML = `❌ <strong>Kurang Tepat.</strong> Sila cuba lagi! Fikirkan fungsi organel yang telah anda pelajari di atas.`;
        SafariAudio.wrong();
      }
    };
  }

  function awardLifeCrystal(zoneIndex) {
    if (State.completedZones.has(zoneIndex)) return;
    State.completedZones.add(zoneIndex);
    State.crystalsCount = State.completedZones.size;
    State.score += 200;

    // Update HUD
    updateHUDStats();

    // Update Tree of Life visuals
    if (treeOfLifeGroup && treeOfLifeGroup.userData && treeOfLifeGroup.userData.slots) {
      const slot = treeOfLifeGroup.userData.slots[zoneIndex];
      if (slot) {
        slot.material.color.setHex(slot.userData.targetColor);
        slot.material.emissive.setHex(slot.userData.targetColor);
        slot.material.emissiveIntensity = 0.9;
        slot.material.opacity = 1.0;
        slot.userData.lit = true;
      }
      // Brighten tree canopy
      if (treeOfLifeGroup.userData.crystalLeafMat) {
        treeOfLifeGroup.userData.crystalLeafMat.emissiveIntensity = 0.35 + (State.crystalsCount * 0.15);
      }
    }

    // Animal celebration
    const anim = animalMeshes[zoneIndex];
    if (anim && anim.userData && anim.userData.halo) {
      anim.userData.halo.material.color.setHex(0x22d3ee);
    }

    if (State.crystalsCount >= 5) {
      DOM.objective.innerHTML = '🌟 <strong>SEMUA KRISTAL DIKUMPULKAN!</strong> Kembali ke Pokok Kehidupan!';
      alertToast('💎 SEMUA 5 KRISTAL KEHIDUPAN BERJAYA DIKUMPULKAN!\nKembali ke Pokok Kehidupan untuk memulihkan Hutan ARSELNEL!');
      SafariAudio.victory();
    } else {
      DOM.objective.innerHTML = `🎯 Selesai: ${State.crystalsCount}/5. Cari haiwan seterusnya!`;
      alertToast(`💎 Kristal Kehidupan Ke-${State.crystalsCount} Dituntut!\nPokok Kehidupan semakin bercahaya!`);
    }
  }

  // 19. AKTIFKAN POKOK KEHIDUPAN & ANIMASI KEMENANGAN (FASA 13 & 14)
  function activateTreeOfLife() {
    if (State.treeActivated || State.crystalsCount < 5) return;
    State.treeActivated = true;
    State.isCompleted = true;
    State.score += 500; // Victory bonus score
    updateHUDStats();

    clearInterval(State.timerInterval);
    SafariAudio.victory();
    alertToast('🌳 POKOK KEHIDUPAN TELAH PULIH SEPENUHNYA!\nHUTAN ARSELNEL BERJAYA DISELAMATKAN!');

    // Victory animation on Tree of Life
    if (treeOfLifeGroup && treeOfLifeGroup.userData) {
      const ud = treeOfLifeGroup.userData;
      let victoryTime = 0;
      animatedObjects.push({
        update() {
          if (victoryTime < 4.0) {
            victoryTime += 0.05;
            ud.foliageGroup.rotation.y += 0.05;
            ud.treeLight.intensity = 2.5 + Math.sin(victoryTime * 6) * 1.5;
            ud.treeLight.color.setHex(0xfef08a);
          }
        }
      });
    }

    // Save record to Supabase & LocalStorage
    saveCellSafariResult();

    // Display Victory Modal
    setTimeout(() => {
      openVictoryModal();
    }, 1800);
  }

  function openVictoryModal() {
    DOM.vAnimals.textContent = `${State.completedZones.size}/5`;
    DOM.vScore.textContent = State.score.toString();
    const mm = String(Math.floor(State.durationSeconds / 60)).padStart(2, '0');
    const ss = String(State.durationSeconds % 60).padStart(2, '0');
    DOM.vTime.textContent = `${mm}:${ss}`;
    DOM.victory.classList.add('open');
  }

  // 20. BUKU SAFARI DIGITAL (FASA 15)
  function renderSafariBook() {
    DOM.bookGrid.innerHTML = '';
    SAFARI_ZONES.forEach((z, idx) => {
      const isDone = State.completedZones.has(idx);
      const entry = document.createElement('div');
      entry.className = 'cs-book-entry' + (isDone ? '' : ' locked');
      entry.innerHTML = `
        <div class="emoji">${z.emoji}</div>
        <h3>${z.animal}</h3>
        <div class="zone">${z.name} • <em>${z.species}</em></div>
        <p><strong>Topik:</strong> ${z.topic}</p>
        <p>${z.fact}</p>
        <div class="cs-book-status ${isDone ? 'done' : ''}">
          ${isDone ? '✓ Kristal Kehidupan Diperoleh' : '⏳ Belum Diselamatkan'}
        </div>
      `;
      DOM.bookGrid.appendChild(entry);
    });
    DOM.book.classList.add('open');
  }

  // 21. KAWALAN JOYSTICK & GYROSCOPE (FASA 12)
  function setupControls() {
    // 1. Virtual Joystick
    if (DOM.joystickBase && DOM.joystickThumb) {
      const maxRadius = 42;
      const base = DOM.joystickBase;
      const thumb = DOM.joystickThumb;

      const updateJoy = (clientX, clientY) => {
        const rect = base.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }
        thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        joystickState.x = dx / maxRadius;
        joystickState.y = -dy / maxRadius; // Screen dy < 0 is forward!
        joystickState.active = (Math.abs(joystickState.x) > 0.08 || Math.abs(joystickState.y) > 0.08);
      };

      const resetJoy = () => {
        joystickState.active = false;
        joystickState.touchId = null;
        joystickState.x = 0;
        joystickState.y = 0;
        thumb.style.transform = 'translate(-50%, -50%)';
      };

      base.addEventListener('touchstart', (e) => {
        if (e.changedTouches.length > 0 && !joystickState.touchId) {
          e.preventDefault();
          const t = e.changedTouches[0];
          joystickState.touchId = t.identifier;
          updateJoy(t.clientX, t.clientY);
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!joystickState.touchId) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === joystickState.touchId) {
            e.preventDefault();
            updateJoy(t.clientX, t.clientY);
            break;
          }
        }
      }, { passive: false });

      const onTouchEnd = (e) => {
        if (!joystickState.touchId) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joystickState.touchId) {
            resetJoy();
            break;
          }
        }
      };
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }

    // 2. Touch Look fallback
    if (DOM.touchLook) {
      DOM.touchLook.addEventListener('touchstart', (e) => {
        if (e.changedTouches.length > 0 && !touchLookState.active) {
          const t = e.changedTouches[0];
          touchLookState.active = true;
          touchLookState.touchId = t.identifier;
          touchLookState.prevX = t.clientX;
          touchLookState.prevY = t.clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!touchLookState.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchLookState.touchId) {
            const dx = t.clientX - touchLookState.prevX;
            const dy = t.clientY - touchLookState.prevY;
            touchLookState.prevX = t.clientX;
            touchLookState.prevY = t.clientY;
            player.rotY -= dx * 0.0045;
            player.pitch = Math.max(-0.85, Math.min(0.85, player.pitch - dy * 0.0035));
            break;
          }
        }
      }, { passive: true });

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

    // 3. Desktop Mouse Drag Look
    let mouseDrag = false;
    let prevMouseX = 0, prevMouseY = 0;
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#cs-hud') || e.target.closest('.cs-overlay') || e.target.closest('button')) return;
      mouseDrag = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!mouseDrag) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      player.rotY -= dx * 0.0035;
      player.pitch = Math.max(-0.85, Math.min(0.85, player.pitch - dy * 0.0028));
    });
    window.addEventListener('mouseup', () => { mouseDrag = false; });

    // 4. Keyboard WASD
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') player.keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') player.keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') player.keys.right = true;
      if (e.code === 'KeyE') handleInteractAction();
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') player.keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') player.keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') player.keys.right = false;
    });

    // 5. Gyroscope Orientation Listener
    window.addEventListener('deviceorientation', onDeviceOrientation);
  }

  function onDeviceOrientation(e) {
    if (!gyro.active) return;
    if (e.alpha === null || e.beta === null || e.gamma === null) return;

    if (!gyro.calibrated) {
      gyro.calibrated = true;
      gyro.baseAlpha = e.alpha;
      gyro.baseBeta = e.beta;
      gyro.baseGamma = e.gamma;
      gyro.currentAlpha = e.alpha;
      gyro.currentBeta = e.beta;
      gyro.currentGamma = e.gamma;
      return;
    }

    const smoothing = 0.25;
    gyro.currentAlpha += (e.alpha - gyro.currentAlpha) * smoothing;
    gyro.currentBeta += (e.beta - gyro.currentBeta) * smoothing;
    gyro.currentGamma += (e.gamma - gyro.currentGamma) * smoothing;

    let deltaAlpha = gyro.currentAlpha - gyro.baseAlpha;
    while (deltaAlpha > 180) deltaAlpha -= 360;
    while (deltaAlpha < -180) deltaAlpha += 360;

    const restingBeta = 45;
    let deltaBeta = (gyro.currentBeta - restingBeta);
    deltaBeta = Math.max(-60, Math.min(60, deltaBeta));

    gyro.yaw = THREE.MathUtils.degToRad(-deltaAlpha);
    gyro.pitch = THREE.MathUtils.degToRad(-deltaBeta);
  }

  async function enableGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') {
          gyro.active = true;
          gyro.calibrated = false;
          alertToast('🧭 Sensor pandangan diaktifkan!');
          if (DOM.gyroBtn) DOM.gyroBtn.classList.add('active');
          return true;
        }
      } catch (_) {}
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      gyro.active = !gyro.active;
      gyro.calibrated = false;
      alertToast(gyro.active ? '🧭 Sensor pandangan diaktifkan!' : 'Sensor dimatikan.');
      if (DOM.gyroBtn) DOM.gyroBtn.classList.toggle('active', gyro.active);
      return gyro.active;
    }
    return false;
  }

  function calibrateGyroHeading() {
    gyro.baseAlpha = gyro.currentAlpha;
    gyro.yaw = 0;
    gyro.pitch = 0;
    alertToast('🎯 Pandangan dikalibrasi ke hadapan!');
  }

  // 22. INTERACTION HANDLER (PROMPT BUTTON / 'E' KEY)
  function handleInteractAction() {
    if (State.nearTreeOfLife && State.crystalsCount >= 5 && !State.treeActivated) {
      activateTreeOfLife();
    } else if (State.nearbyZoneIndex >= 0) {
      openCellExplorer(State.nearbyZoneIndex);
    }
  }

  // 23. HUD STATS UPDATE & TIMER
  function updateHUDStats() {
    if (DOM.statFound) DOM.statFound.textContent = `${State.completedZones.size}/5`;
    if (DOM.statCrystal) DOM.statCrystal.textContent = `${State.crystalsCount}/5`;
    if (DOM.statScore) DOM.statScore.textContent = State.score.toString();
  }

  function startTimer() {
    State.startTime = Date.now();
    clearInterval(State.timerInterval);
    State.timerInterval = setInterval(() => {
      State.durationSeconds = Math.floor((Date.now() - State.startTime) / 1000);
      const mm = String(Math.floor(State.durationSeconds / 60)).padStart(2, '0');
      const ss = String(State.durationSeconds % 60).padStart(2, '0');
      if (DOM.statTime) DOM.statTime.textContent = `${mm}:${ss}`;
    }, 1000);
  }

  // 24. SAVE PROGRESS & ATTEMPT TO SUPABASE / LOCALSTORAGE (FASA 18)
  async function saveCellSafariResult() {
    const record = {
      quizId: 'cell_safari',
      gameId: 'cell_safari',
      title: 'Cell Safari: Jelajah Hutan Sel 3D',
      score: State.score,
      correct: State.completedZones.size,
      total: 5,
      durationSeconds: State.durationSeconds,
      completedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('arselnel_cell_safari_latest', JSON.stringify(record));
    } catch (_) {}

    if (window.ARSupabase && typeof window.ARSupabase.saveQuizAttempt === 'function') {
      try {
        if (DOM.saveStatus) DOM.saveStatus.textContent = 'Menyimpan rekod ke profil ARSELNEL…';
        await window.ARSupabase.saveQuizAttempt(record);
        if (typeof window.ARSupabase.saveProgress === 'function') {
          await window.ARSupabase.saveProgress('cellquest-safari', 100, record);
        }
        if (DOM.saveStatus) DOM.saveStatus.textContent = '✓ Rekod berjaya disimpan ke profil anda!';
      } catch (err) {
        if (DOM.saveStatus) DOM.saveStatus.textContent = 'Disimpan secara setempat (Luar Talian).';
      }
    }
  }

  // 25. INITIALIZE PAGE & EVENT LISTENERS
  function initGame() {
    initDOM();
    setupControls();

    // Event Listeners
    DOM.introStart.addEventListener('click', () => {
      State.running = true;
      DOM.intro.classList.remove('open');
      DOM.hud.classList.remove('hidden');
      initForestScene();
      startTimer();
      SafariAudio.init();
      SafariAudio.chime();
      alertToast('🌲 Selamat datang ke Hutan ARSELNEL!\nTerokai hutan dan cari haiwan pertama!');
    });

    DOM.introBack.addEventListener('click', () => {
      window.location.href = 'adventure.html';
    });

    DOM.backBtn.addEventListener('click', () => {
      window.location.href = 'adventure.html';
    });

    DOM.promptBtn.addEventListener('click', handleInteractAction);

    DOM.bookBtn.addEventListener('click', renderSafariBook);
    DOM.bookClose.addEventListener('click', () => DOM.book.classList.remove('open'));

    DOM.gyroBtn.addEventListener('click', () => {
      if (!gyro.active) enableGyroscope();
      else calibrateGyroHeading();
    });

    DOM.soundBtn.addEventListener('click', () => {
      SafariAudio.muted = !SafariAudio.muted;
      DOM.soundBtn.classList.toggle('active', !SafariAudio.muted);
      alertToast(SafariAudio.muted ? '🔇 Bunyi dimatikan.' : '🔊 Bunyi diaktifkan.');
    });

    DOM.helpBtn.addEventListener('click', () => {
      DOM.intro.classList.add('open');
    });

    DOM.explorerClose.addEventListener('click', closeCellExplorer);
    DOM.explorerBack.addEventListener('click', closeCellExplorer);

    DOM.vExplore.addEventListener('click', () => {
      DOM.victory.classList.remove('open');
    });

    DOM.vLobby.addEventListener('click', () => {
      window.location.href = 'adventure.html';
    });
  }

  // 26. PUBLIC DIAGNOSTIC & AUTOMATED VERIFICATION API (FOR TEST SUITE)
  window.CellSafari = {
    getState: () => State,
    getZones: () => SAFARI_ZONES,
    getPlayer: () => player,
    getGyro: () => gyro,
    getJoystickState: () => joystickState,
    getCurrentLookYaw: () => player.rotY + (gyro.active ? gyro.yaw : 0),
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => renderer,
    getTreeOfLife: () => treeOfLifeGroup,
    getAnimalMeshes: () => animalMeshes,
    getOrganellesInfo: () => ORGANELLES_INFO,
    isRunning: () => State.running,
    setPlayerPose: (x, z, rotY = 0, pitch = 0) => {
      player.x = x;
      player.z = z;
      player.rotY = rotY;
      player.pitch = pitch;
      if (camera) {
        camera.position.set(player.x, player.y, player.z);
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
      checkProximity();
    },
    teleport: (x, z, rotY = 0) => {
      player.x = x;
      player.z = z;
      player.rotY = rotY;
      if (camera) {
        camera.position.set(player.x, player.y, player.z);
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
      checkProximity();
    },
    setCameraRotation: (rotY) => {
      player.rotY = rotY;
      if (camera) {
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
    },
    calculateMovementVector: (nx, ny) => {
      const yaw = player.rotY + (gyro.active ? gyro.yaw : 0);
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);
      let vx = forwardX * (-ny) + rightX * nx;
      let vz = forwardZ * (-ny) + rightZ * nx;
      const mag = Math.hypot(vx, vz);
      if (mag > 1.0) {
        vx /= mag;
        vz /= mag;
      }
      return { vx, vz };
    },
    updateProximity: () => checkProximity(),
    getScore: () => State.score,
    getCrystalCount: () => State.completedZones ? State.completedZones.size : 0,
    getCurrentQuizCorrectIndex: () => {
      const zone = SAFARI_ZONES[State.activeZoneIndex >= 0 ? State.activeZoneIndex : 0];
      return (zone && zone.challenge) ? zone.challenge.correct : 0;
    },
    grantCrystal: (zoneIndex) => {
      awardLifeCrystal(zoneIndex);
    },
    isTreeOfLifeReady: () => State.completedZones ? State.completedZones.size >= 5 : false,
    getActiveCrystalSlotCount: () => {
      return (treeOfLifeGroup && treeOfLifeGroup.userData && treeOfLifeGroup.userData.slots)
        ? treeOfLifeGroup.userData.slots.filter(s => s.userData.lit || s.userData.active).length
        : 0;
    },
    getDiagnostics: () => ({
      terrain: !!forestEnvironmentGroup,
      river: !!forestEnvironmentGroup,
      bridge: !!forestEnvironmentGroup,
      zoneSignCount: 5,
      treeOfLife: !!treeOfLifeGroup,
      treeCrystalSlotCount: (treeOfLifeGroup && treeOfLifeGroup.userData && treeOfLifeGroup.userData.slots)
        ? treeOfLifeGroup.userData.slots.length
        : 5,
      fireflyCount: firefliesGroup ? 32 : 0,
      animalCount: animalMeshes ? animalMeshes.length : 0,
      sanctuary: !!birdSanctuaryGroup,
      rabbitMeadow: !!rabbitMeadowGroup,
      deerValley: !!deerValleyGroup,
      monkeyForest: !!monkeyForestGroup,
      totalMonkeyCount: decorativeMonkeys.length + (animalMeshes[2] ? 1 : 0),
      totalDeerCount: decorativeDeers.length + (animalMeshes[1] ? 1 : 0),
      totalRabbitCount: decorativeRabbits.length + (animalMeshes[0] ? 1 : 0),
      totalBirdCount: decorativeBirds.length + (animalMeshes[3] ? 1 : 0)
    }),
    getAnimalZones: () => SAFARI_ZONES,
    getMonkeyForest: () => monkeyForestGroup,
    getDecorativeMonkeys: () => decorativeMonkeys,
    getTotalMonkeyCount: () => decorativeMonkeys.length + (animalMeshes[2] ? 1 : 0),
    getInteractiveMonkey: () => (animalMeshes[2] ? animalMeshes[2].userData.creature : null),
    getDeerValley: () => deerValleyGroup,
    getDecorativeDeers: () => decorativeDeers,
    getTotalDeerCount: () => decorativeDeers.length + (animalMeshes[1] ? 1 : 0),
    getInteractiveDeer: () => (animalMeshes[1] ? animalMeshes[1].userData.creature : null),
    getRabbitMeadow: () => rabbitMeadowGroup,
    getDecorativeRabbits: () => decorativeRabbits,
    getTotalRabbitCount: () => decorativeRabbits.length + (animalMeshes[0] ? 1 : 0),
    getInteractiveRabbit: () => (animalMeshes[0] ? animalMeshes[0].userData.creature : null),
    getBirdSanctuary: () => birdSanctuaryGroup,
    getDecorativeBirds: () => decorativeBirds,
    getTotalBirdCount: () => decorativeBirds.length + (animalMeshes[3] ? 1 : 0),
    getInteractiveBird: () => (animalMeshes[3] ? animalMeshes[3].userData.creature : null),
    openCellExplorer,
    closeCellExplorer,
    awardLifeCrystal,
    activateTreeOfLife,
    enableGyroscope,
    calibrateGyroHeading,
    renderSafariBook,
    saveCellSafariResult
  };

  window.addEventListener('DOMContentLoaded', initGame);
})();
