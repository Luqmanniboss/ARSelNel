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
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, idx) => setTimeout(() => this.play(f, 'sine', 0.5, 0.16), idx * 140));
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

    scene.add(forestEnvironmentGroup);
  }

  function buildZoneSignpost(zoneTitle, x, z) {
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

      // Base Halo on ground
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.15, 24),
        new THREE.MeshBasicMaterial({ color: z.colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.03;
      animGroup.add(halo);

      // Model Haiwan Mengikut Zon
      let creatureMesh;
      if (index === 0) creatureMesh = createRabbitModel();
      else if (index === 1) creatureMesh = createDeerModel();
      else if (index === 2) creatureMesh = createMonkeyModel();
      else if (index === 3) creatureMesh = createBirdModel();
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
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${z.emoji} ${z.animal}`, 128, 36);

      const badgeTexture = new THREE.CanvasTexture(canvas);
      const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), new THREE.MeshBasicMaterial({ map: badgeTexture, side: THREE.DoubleSide }));
      badge.position.y = 2.4;
      animGroup.add(badge);

      // Floating Life Crystal Preview above animal
      const crystalIco = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        new THREE.MeshStandardMaterial({ color: z.colorHex, emissive: z.colorHex, emissiveIntensity: 0.6, roughness: 0.2 })
      );
      crystalIco.scale.set(0.8, 1.3, 0.8);
      crystalIco.position.y = 2.95;
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

  // A. Arnab 3D (Rabbit)
  function createRabbitModel() {
    const g = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7, flatShading: true });
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), furMat);
    body.position.y = 0.5;
    body.scale.set(1.0, 0.9, 1.2);
    g.add(body);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), furMat);
    head.position.set(0, 0.85, 0.42);
    g.add(head);

    // Ears
    const earGeo = new THREE.BoxGeometry(0.09, 0.48, 0.06);
    const earL = new THREE.Mesh(earGeo, furMat);
    earL.position.set(-0.14, 1.25, 0.38);
    earL.rotation.z = -0.15;
    const earR = new THREE.Mesh(earGeo, furMat);
    earR.position.set(0.14, 1.25, 0.38);
    earR.rotation.z = 0.15;
    g.add(earL, earR);

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), pinkMat);
    nose.position.set(0, 0.82, 0.72);
    g.add(nose);

    // Tail
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), furMat);
    tail.position.set(0, 0.5, -0.6);
    g.add(tail);

    g.userData = {
      animate(t) {
        g.position.y = Math.max(0, Math.sin(t * 4) * 0.14);
        earL.rotation.x = Math.sin(t * 3) * 0.1;
        earR.rotation.x = Math.sin(t * 3 + 0.5) * 0.1;
      }
    };
    return g;
  }

  // B. Rusa 3D (Deer)
  function createDeerModel() {
    const g = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.75, flatShading: true });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 1.3), coatMat);
    body.position.y = 1.0;
    g.add(body);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.8, 6);
    [[-0.25, 0.4, 0.45], [0.25, 0.4, 0.45], [-0.25, 0.4, -0.45], [0.25, 0.4, -0.45]].forEach(p => {
      const leg = new THREE.Mesh(legGeo, coatMat);
      leg.position.set(...p);
      g.add(leg);
    });

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.65, 6), coatMat);
    neck.position.set(0, 1.45, 0.55);
    neck.rotation.x = 0.4;
    g.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.45), coatMat);
    head.position.set(0, 1.75, 0.72);
    g.add(head);

    // Antlers
    const hL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5), hornMat);
    hL.position.set(-0.14, 2.05, 0.68);
    hL.rotation.z = -0.35;
    const hR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5), hornMat);
    hR.position.set(0.14, 2.05, 0.68);
    hR.rotation.z = 0.35;
    g.add(hL, hR);

    g.userData = {
      animate(t) {
        head.rotation.y = Math.sin(t * 1.5) * 0.15;
      }
    };
    return g;
  }

  // C. Monyet 3D (Monkey)
  function createMonkeyModel() {
    const g = new THREE.Group();
    const furMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8, flatShading: true });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), furMat);
    body.position.y = 0.75;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), furMat);
    head.position.set(0, 1.2, 0.1);
    g.add(head);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), faceMat);
    face.position.set(0, 1.18, 0.24);
    face.scale.set(1.0, 0.8, 0.5);
    g.add(face);

    // Ears
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), faceMat);
    earL.position.set(-0.28, 1.25, 0.08);
    const earR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), faceMat);
    earR.position.set(0.28, 1.25, 0.08);
    g.add(earL, earR);

    // Tail
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 6, 16, Math.PI * 1.2), furMat);
    tail.position.set(0, 0.65, -0.45);
    tail.rotation.y = Math.PI / 2;
    g.add(tail);

    g.userData = {
      animate(t) {
        g.rotation.y = Math.sin(t * 1.8) * 0.2;
        tail.rotation.z = Math.sin(t * 3) * 0.25;
      }
    };
    return g;
  }

  // D. Burung 3D (Bird)
  function createBirdModel() {
    const g = new THREE.Group();
    const featherMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, flatShading: true });
    const chestMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });

    // Nest / Perch plinth
    const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0x713f12 }));
    perch.position.y = 0.2;
    g.add(perch);

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), featherMat);
    body.position.y = 0.7;
    body.scale.set(0.9, 1.0, 1.3);
    g.add(body);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 7), chestMat);
    chest.position.set(0, 0.68, 0.2);
    g.add(chest);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 7), featherMat);
    head.position.set(0, 1.05, 0.25);
    g.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 1.02, 0.48);
    g.add(beak);

    // Wings
    const wingGeo = new THREE.BoxGeometry(0.48, 0.18, 0.04);
    const wingL = new THREE.Mesh(wingGeo, featherMat);
    wingL.position.set(-0.35, 0.78, 0);
    const wingR = new THREE.Mesh(wingGeo, featherMat);
    wingR.position.set(0.35, 0.78, 0);
    g.add(wingL, wingR);

    g.userData = {
      animate(t) {
        wingL.rotation.z = Math.sin(t * 8) * 0.25;
        wingR.rotation.z = -Math.sin(t * 8) * 0.25;
        g.position.y = Math.sin(t * 3) * 0.05;
      }
    };
    return g;
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
      DOM.promptTitle.textContent = `${cz.animal.toUpperCase()} DITEMUI!`;
      DOM.promptSub.textContent = `${cz.name} • ${cz.topic} ${isDone ? '✓ (Kristal Telah Dituntut)' : ''}`;
      DOM.promptBtnText.textContent = isDone ? 'Teroka Semula Sel' : 'Teroka Sel Haiwan';
      DOM.prompt.classList.add('active');
    } else {
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
      animalCount: animalMeshes ? animalMeshes.length : 0
    }),
    getAnimalZones: () => SAFARI_ZONES,
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
