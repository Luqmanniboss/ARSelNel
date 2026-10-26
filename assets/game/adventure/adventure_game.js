/**
 * ARSelNel 2D Science Rescue Adventure - Game Engine & Renderer
 * Engine Canvas 2D: Physics, Camera, Collision, Dynamic Hazards, Patrol Bots, Power-ups & Particle Systems
 */

(function(global) {
  'use strict';

  const {
    MAP_COLS,
    MAP_ROWS,
    TILE_SIZE,
    QUESTIONS,
    SCIENCE_SAMPLES,
    POWERUP_LOCATIONS,
    HAZARD_PUDDLES,
    PATROL_ROBOTS,
    generateCampusMap,
    Audio,
    GameState
  } = global.ARSelNelAdventure;

  class AdventureGameEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = options;

      this.worldWidth = MAP_COLS * TILE_SIZE; // 1536 px
      this.worldHeight = MAP_ROWS * TILE_SIZE; // 1152 px

      this.map = generateCampusMap();

      // Kamera
      this.camera = { x: 0, y: 0, width: 800, height: 600 };

      // Pemain (Saintis Muda)
      this.player = {
        x: 19 * TILE_SIZE, // Mula di Dataran Sains Utama
        y: 19 * TILE_SIZE,
        width: 22,
        height: 28,
        baseSpeed: 155, // px per saat
        speed: 155,
        lives: 3,
        maxLives: 3,
        hasShield: false,
        speedBoostTimer: 0,
        invulnerableTimer: 0,
        direction: 'down', // 'down', 'up', 'left', 'right'
        isMoving: false,
        animFrame: 0,
        animTimer: 0,
        stepSoundTimer: 0,
        trailTimer: 0,
        name: options.playerName || 'Pelajar Saintis'
      };

      // Input keys
      this.keys = {
        up: false,
        down: false,
        left: false,
        right: false
      };

      // Virtual touch joystick / dpad state
      this.touchVector = { x: 0, y: 0, active: false };

      // 10 Objek & Sampel Sains
      this.samples = SCIENCE_SAMPLES.map((loc, idx) => ({
        id: idx + 1,
        questionId: loc.questionId,
        name: loc.name,
        type: loc.type,
        icon: loc.icon,
        description: loc.description,
        x: loc.col * TILE_SIZE + TILE_SIZE / 2,
        y: loc.row * TILE_SIZE + TILE_SIZE / 2,
        zone: loc.zone,
        collected: false,
        bobOffset: idx * 0.65
      }));

      // Power-ups
      this.powerups = POWERUP_LOCATIONS.map((p) => ({
        id: p.id,
        type: p.type,
        name: p.name,
        icon: p.icon,
        duration: p.duration,
        x: p.col * TILE_SIZE + TILE_SIZE / 2,
        y: p.row * TILE_SIZE + TILE_SIZE / 2,
        zone: p.zone,
        description: p.description,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      }));

      // Halangan Statik (Tumpahan Bahan Kimia)
      this.hazards = HAZARD_PUDDLES.map((h) => ({
        id: h.id,
        type: h.type,
        x: h.col * TILE_SIZE + TILE_SIZE / 2,
        y: h.row * TILE_SIZE + TILE_SIZE / 2,
        radius: h.radius || 18,
        label: h.label
      }));

      // Halangan Bergerak (Robot Pembersih Makmal Rosak)
      this.robots = PATROL_ROBOTS.map((r) => ({
        id: r.id,
        name: r.name,
        axis: r.axis,
        x: r.axis === 'x' ? r.minCol * TILE_SIZE : r.col * TILE_SIZE + TILE_SIZE / 2,
        y: r.axis === 'y' ? r.minRow * TILE_SIZE : r.row * TILE_SIZE + TILE_SIZE / 2,
        min: r.axis === 'x' ? r.minCol * TILE_SIZE : r.minRow * TILE_SIZE,
        max: r.axis === 'x' ? r.maxCol * TILE_SIZE : r.maxRow * TILE_SIZE,
        speed: r.speed,
        dir: r.dir,
        width: r.width || 24,
        height: r.height || 24,
        sparkTimer: Math.random()
      }));

      // Partikel
      this.particles = [];

      // Keadaan permainan (Bermula dalam mod READY sebelum pemain menekan Mula)
      this.state = GameState ? GameState.READY : 'ready';
      this.isPaused = true;
      this.lastTime = 0;
      this.finishCooldown = 0;
      this.animReqId = null;
      this.screenShake = 0;

      // Event Callbacks
      this.onSampleTrigger = options.onSampleTrigger || options.onBurgerTrigger || (() => {});
      this.onFinishZoneTrigger = options.onFinishZoneTrigger || (() => {});
      this.onPlayerMove = options.onPlayerMove || (() => {});
      this.onPlayerHurt = options.onPlayerHurt || (() => {});
      this.onPowerupCollect = options.onPowerupCollect || (() => {});
      this.onGameOver = options.onGameOver || (() => {});

      // Sediakan cache tekstur tile, watak, sampel sains & power-ups
      this.tileSprites = this.createTileTextures();
      this.playerSprites = this.createPlayerSprites();
      this.sampleSprites = this.createSampleSprites();
      this.powerupSprites = this.createPowerupSprites();
      this.robotSprite = this.createRobotSprite();

      // Dengar input keyboard & resize
      this.initInput();
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }

    // 1. Cipta Tekstur Tile Map
    createTileTextures() {
      const textures = {};
      const size = TILE_SIZE;

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 0: Rumput Kampus Sains
      textures[0] = makeCanvas((c) => {
        c.fillStyle = '#4ade80';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#22c55e';
        c.fillRect(4, 6, 2, 4);
        c.fillRect(18, 12, 2, 4);
        c.fillRect(10, 24, 2, 4);
        c.fillRect(26, 22, 2, 4);
        c.fillStyle = '#86efac';
        c.fillRect(5, 5, 2, 2);
        c.fillRect(19, 11, 2, 2);
        c.fillStyle = '#fef08a'; // Bunga liar sains
        c.fillRect(24, 8, 2, 2);
      });

      // 1: Laluan Batu Berturap / Koridor
      textures[1] = makeCanvas((c) => {
        c.fillStyle = '#e2e8f0';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1;
        c.strokeRect(1, 1, 14, 14);
        c.strokeRect(17, 1, 14, 14);
        c.strokeRect(1, 17, 14, 14);
        c.strokeRect(17, 17, 14, 14);
        c.fillStyle = '#f8fafc';
        c.fillRect(3, 3, 4, 3);
        c.fillRect(19, 3, 4, 3);
        c.fillRect(3, 19, 4, 3);
        c.fillRect(19, 19, 4, 3);
      });

      // 2: Jubin Makmal Biologi (Teal Aksen)
      textures[2] = makeCanvas((c) => {
        c.fillStyle = '#f1f5f9';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#e2eaf4';
        c.fillRect(0, 0, size, 1);
        c.fillRect(0, 0, 1, size);
        c.fillStyle = '#0d9488'; // Aksen teal makmal
        c.fillRect(15, 15, 2, 2);
      });

      // 3: Lantai Rumah Hijau Botanik
      textures[3] = makeCanvas((c) => {
        c.fillStyle = '#dcfce7';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#bbf7d0';
        c.strokeRect(0, 0, size, size);
        c.fillStyle = '#86efac';
        c.fillRect(8, 8, 4, 4);
        c.fillRect(20, 20, 4, 4);
      });

      // 4: Dataran Mar-mar Pavilion
      textures[4] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#e2e8f0';
        c.strokeRect(0, 0, size, size);
        c.fillStyle = '#e0f2fe';
        c.fillRect(4, 4, 24, 24);
      });

      // 5: Lantai Makmal Utama (Bilik Bersih High-Tech)
      textures[5] = makeCanvas((c) => {
        c.fillStyle = '#0f172a';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#1e293b';
        c.fillRect(2, 2, size - 4, size - 4);
        c.fillStyle = '#0284c7';
        c.fillRect(6, 6, 2, 2);
        c.fillRect(24, 24, 2, 2);
        c.strokeStyle = '#0369a1';
        c.lineWidth = 1;
        c.strokeRect(4, 4, size - 8, size - 8);
      });

      // 10: Dinding Bata Luar (SOLID)
      textures[10] = makeCanvas((c) => {
        c.fillStyle = '#334155';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#475569';
        c.fillRect(0, 0, size, 6);
        c.fillStyle = '#1e293b';
        c.fillRect(0, size - 4, size, 4);
        c.fillStyle = '#64748b';
        c.fillRect(2, 8, 12, 6);
        c.fillRect(18, 8, 12, 6);
        c.fillRect(10, 18, 12, 6);
      });

      // 11: Dinding Kaca Makmal Berkaca (SOLID)
      textures[11] = makeCanvas((c) => {
        c.fillStyle = '#0f766e';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#14b8a6';
        c.fillRect(2, 2, size - 4, size - 4);
        c.fillStyle = '#99f6e4';
        c.fillRect(4, 4, 6, size - 8);
        c.fillStyle = '#ffffff';
        c.fillRect(6, 6, 2, size - 12);
      });

      // 12: Pagar / Pokok Renek Sempadan (SOLID)
      textures[12] = makeCanvas((c) => {
        c.fillStyle = '#15803d';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#16a34a';
        c.beginPath();
        c.arc(8, 8, 6, 0, Math.PI * 2);
        c.arc(24, 8, 6, 0, Math.PI * 2);
        c.arc(16, 22, 7, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#4ade80';
        c.fillRect(6, 6, 3, 3);
        c.fillRect(22, 6, 3, 3);
        c.fillRect(14, 20, 3, 3);
      });

      // 13: Meja Eksperimen Makmal (SOLID)
      textures[13] = makeCanvas((c) => {
        c.fillStyle = '#64748b';
        c.fillRect(2, 4, size - 4, size - 8);
        c.fillStyle = '#94a3b8';
        c.fillRect(4, 6, size - 8, 6);
        // Beaker & kelalang makmal
        c.fillStyle = '#38bdf8';
        c.fillRect(8, 14, 4, 6);
        c.fillStyle = '#ec4899';
        c.fillRect(18, 14, 4, 6);
      });

      // 14: Pokok Rendang Kampus (SOLID)
      textures[14] = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath();
        c.ellipse(16, 26, 12, 5, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#78350f';
        c.fillRect(13, 16, 6, 12);
        c.fillStyle = '#15803d';
        c.beginPath();
        c.arc(16, 12, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.arc(14, 9, 8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#86efac';
        c.fillRect(10, 6, 4, 3);
      });

      // 15: Kolam Air Pancut Dataran (SOLID)
      textures[15] = makeCanvas((c) => {
        c.fillStyle = '#0284c7';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(16, 16, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.fillRect(14, 12, 4, 4);
        c.strokeStyle = '#94a3b8';
        c.lineWidth = 2;
        c.strokeRect(1, 1, size - 2, size - 2);
      });

      // 16: Dinding Rumah Kaca (SOLID)
      textures[16] = makeCanvas((c) => {
        c.fillStyle = '#15803d';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#dcfce7';
        c.fillRect(2, 2, size - 4, size - 4);
        c.strokeStyle = '#86efac';
        c.lineWidth = 1;
        c.strokeRect(4, 4, size - 8, size - 8);
      });

      // 17: Rak Instrumen / Mikroskop (SOLID)
      textures[17] = makeCanvas((c) => {
        c.fillStyle = '#475569';
        c.fillRect(2, 4, size - 4, size - 8);
        c.fillStyle = '#e2e8f0';
        c.fillRect(14, 8, 4, 12);
        c.fillRect(10, 18, 12, 3);
        c.fillStyle = '#0ea5e9';
        c.fillRect(16, 6, 6, 3);
      });

      // 18: Papan Tanda Arah Zon Makmal (SOLID)
      textures[18] = makeCanvas((c) => {
        c.fillStyle = '#78350f';
        c.fillRect(14, 16, 4, 14);
        c.fillStyle = '#0284c7';
        c.fillRect(4, 4, 24, 12);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.strokeRect(5, 5, 22, 10);
        c.fillStyle = '#ffffff';
        c.fillRect(7, 8, 4, 2);
        c.fillRect(13, 8, 4, 2);
        c.fillRect(19, 8, 4, 2);
      });

      // 20: Terminal Pengaktifan Keselamatan Makmal (FINISH Zone)
      textures[20] = makeCanvas((c) => {
        c.fillStyle = '#0f172a';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#0284c7';
        c.fillRect(4, 4, size - 8, size - 8);
        c.fillStyle = '#38bdf8';
        c.fillRect(8, 8, size - 16, size - 16);
        c.fillStyle = '#ffffff';
        c.fillRect(14, 12, 4, 8);
        c.fillRect(12, 14, 8, 4);
      });

      // 21: Tiang Struktur Gerbang Makmal (SOLID)
      textures[21] = makeCanvas((c) => {
        c.fillStyle = '#0f766e';
        c.fillRect(4, 0, size - 8, size);
        c.fillStyle = '#14b8a6';
        c.fillRect(6, 2, 4, size - 4);
        c.fillStyle = '#134e4a';
        c.fillRect(4, size - 4, size - 8, 4);
      });

      return textures;
    }

    // 2. Sprite Watak Pelajar Comel 4-arah (Down, Up, Left, Right)
    createPlayerSprites() {
      const sprites = {};
      const directions = ['down', 'up', 'left', 'right'];

      directions.forEach(dir => {
        sprites[dir] = [];
        for (let frame = 0; frame < 4; frame++) {
          const c = document.createElement('canvas');
          c.width = 32;
          c.height = 36;
          const cx = c.getContext('2d');
          cx.imageSmoothingEnabled = false;

          const legOffset = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;
          const bob = (frame % 2 === 1) ? -1 : 0;

          // Bayang bawah
          cx.fillStyle = 'rgba(0,0,0,0.22)';
          cx.beginPath();
          cx.ellipse(16, 33, 9, 3.5, 0, 0, Math.PI * 2);
          cx.fill();

          // Kaki & Kasut
          cx.fillStyle = '#1e293b';
          if (dir === 'left' || dir === 'right') {
            cx.fillRect(14 + legOffset, 27, 5, 6);
          } else {
            cx.fillRect(10 - legOffset, 27, 4, 6);
            cx.fillRect(18 + legOffset, 27, 4, 6);
          }

          // Kot Makmal Putih & Baju Teal
          cx.fillStyle = '#0d9488'; // Baju dalam teal
          cx.fillRect(11, 15 + bob, 10, 13);
          cx.fillStyle = '#ffffff'; // Kot makmal putih
          cx.fillRect(9, 15 + bob, 4, 13);
          cx.fillRect(19, 15 + bob, 4, 13);

          // Lencana saintis
          cx.fillStyle = '#0f766e';
          cx.fillRect(14, 17 + bob, 4, 4);

          // Kepala (Kulit cerah)
          cx.fillStyle = '#fed7aa';
          cx.fillRect(10, 7 + bob, 12, 10);

          // Rambut Coklat Pelajar
          cx.fillStyle = '#451a03';
          cx.fillRect(9, 4 + bob, 14, 5);
          cx.fillRect(8, 7 + bob, 3, 5);
          cx.fillRect(21, 7 + bob, 3, 5);

          // Mata & Wajah
          cx.fillStyle = '#1e293b';
          if (dir === 'down') {
            cx.fillRect(12, 10 + bob, 2, 3);
            cx.fillRect(18, 10 + bob, 2, 3);
            cx.fillStyle = '#e11d48'; // Senyuman
            cx.fillRect(15, 14 + bob, 2, 1);
          } else if (dir === 'left') {
            cx.fillRect(10, 10 + bob, 2, 3);
          } else if (dir === 'right') {
            cx.fillRect(20, 10 + bob, 2, 3);
          } else if (dir === 'up') {
            cx.fillStyle = '#451a03';
            cx.fillRect(9, 5 + bob, 14, 10);
          }

          sprites[dir].push(c);
        }
      });

      return sprites;
    }

    // 3. 10 Sprite Objek & Sampel Sains (Pixel Art Menggantikan Burger)
    createSampleSprites() {
      const sprites = {};
      const size = 32;

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 1. animal_cell: Kelalang spesimen sel haiwan bulat & nukleus biru
      sprites.animal_cell = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#38bdf8'; // Cecair biru
        c.beginPath(); c.arc(16, 16, 9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#bae6fd'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#0369a1'; // Nukleus di dalam
        c.beginPath(); c.arc(16, 16, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.fillRect(13, 12, 2, 2); // Kilauan kaca
      });

      // 2. plant_cell: Kelalang spesimen sel tumbuhan heksagon hijau & kloroplas
      sprites.plant_cell = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#15803d'; // Dinding sel tegar
        c.fillRect(7, 8, 18, 16);
        c.fillStyle = '#4ade80'; // Sitoplasma hijau
        c.fillRect(9, 10, 14, 12);
        c.fillStyle = '#166534'; // Kloroplas berbintik
        c.fillRect(10, 12, 2, 2);
        c.fillRect(19, 13, 2, 2);
        c.fillRect(15, 17, 3, 2);
        c.fillStyle = '#bbf7d0'; // Vakuol pusat
        c.fillRect(12, 13, 6, 6);
      });

      // 3. micro_slide: Slaid kaca mikroskop segi empat tepat
      sprites.micro_slide = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 27, 11, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#f1f5f9';
        c.fillRect(5, 11, 22, 10);
        c.strokeStyle = '#94a3b8'; c.lineWidth = 1; c.strokeRect(5, 11, 22, 10);
        c.fillStyle = '#e11d48'; // Titisan pewarna spesimen merah
        c.fillRect(14, 14, 4, 4);
        c.fillStyle = 'rgba(56, 189, 248, 0.4)'; // Kaca penutup
        c.fillRect(12, 12, 8, 8);
      });

      // 4. obj_lens: Kanta objektif mikroskop logam keluli / tembaga
      sprites.obj_lens = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#475569'; // Badan kanta logam
        c.fillRect(11, 7, 10, 15);
        c.fillStyle = '#94a3b8';
        c.fillRect(12, 9, 8, 11);
        c.fillStyle = '#d97706'; // Gelung emas pembesaran 40x
        c.fillRect(10, 13, 12, 3);
        c.fillStyle = '#38bdf8'; // Lensa kaca optik bawah
        c.fillRect(13, 22, 6, 2);
      });

      // 5. test_tube: Tabung uji dengan larutan bercahaya sian
      sprites.test_tube = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 7, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#64748b'; // Rak tabung uji
        c.fillRect(9, 23, 14, 3);
        c.fillStyle = '#ffffff'; // Kaca tabung uji
        c.fillRect(13, 6, 6, 17);
        c.beginPath(); c.arc(16, 23, 3, 0, Math.PI); c.fill();
        c.fillStyle = '#06b6d4'; // Cecair kimia aktif
        c.fillRect(14, 12, 4, 10);
        c.beginPath(); c.arc(16, 22, 2, 0, Math.PI); c.fill();
        c.fillStyle = '#cffafe'; c.fillRect(14, 8, 1, 6); // Kilauan kaca
      });

      // 6. petri_dish: Piring petri bulat dengan kultur bakteria/sel
      sprites.petri_dish = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 26, 12, 4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(241, 245, 249, 0.9)';
        c.beginPath(); c.arc(16, 16, 11, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#94a3b8'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#fef08a'; // Medium agar kuning
        c.beginPath(); c.arc(16, 16, 9, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ef4444'; // Koloni sel merah
        c.fillRect(13, 13, 2, 2);
        c.fillRect(17, 15, 3, 2);
        c.fillStyle = '#3b82f6'; // Koloni sel biru
        c.fillRect(14, 18, 2, 2);
      });

      // 7. tissue_sample: Kelalang sampel tisu berjalur
      sprites.tissue_sample = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 27, 8, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#b45309'; // Botol kaca amber
        c.fillRect(10, 9, 12, 15);
        c.fillStyle = '#78350f'; // Penutup botol
        c.fillRect(12, 6, 8, 3);
        c.fillStyle = '#f43f5e'; // Gentian tisu di dalam
        c.fillRect(13, 12, 6, 2);
        c.fillRect(13, 16, 6, 2);
        c.fillRect(13, 20, 6, 2);
      });

      // 8. nucleus_model: Model sfera nukleus 3D
      sprites.nucleus_model = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#7c3aed'; // Membran luar nukleus ungu
        c.beginPath(); c.arc(16, 16, 10, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#a78bfa'; // Nukleoplasma
        c.beginPath(); c.arc(16, 16, 8, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#4c1d95'; // Nukleolus tengah
        c.beginPath(); c.arc(16, 16, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; c.fillRect(12, 11, 2, 2);
      });

      // 9. mito_model: Model mitokondria bujur dengan lipatan krista
      sprites.mito_model = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 10, 3, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ea580c'; // Dinding luar oren
        c.beginPath(); c.ellipse(16, 16, 11, 7, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fed7aa'; // Matriks dalaman
        c.beginPath(); c.ellipse(16, 16, 9, 5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#c2410c'; // Lipatan krista
        c.fillRect(11, 13, 2, 6);
        c.fillRect(15, 13, 2, 6);
        c.fillRect(19, 13, 2, 6);
      });

      // 10. cell_kit: Kotak kit pemerhatian sel lapangan logam
      sprites.cell_kit = makeCanvas((c) => {
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath(); c.ellipse(16, 28, 11, 3.5, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#0f766e'; // Kotak logam teal
        c.fillRect(6, 10, 20, 14);
        c.strokeStyle = '#14b8a6'; c.lineWidth = 1; c.strokeRect(6, 10, 20, 14);
        c.fillStyle = '#334155'; // Pemegang kotak
        c.fillRect(13, 6, 6, 4);
        c.fillStyle = '#ffffff'; // Lambang palang sains
        c.fillRect(15, 13, 2, 8);
        c.fillRect(12, 16, 8, 2);
      });

      return sprites;
    }

    // 4. Sprite Power-Ups (Kasut Pantas, Perisai Keselamatan & Medkit)
    createPowerupSprites() {
      const sprites = {};
      const size = 28;

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // Kasut Pantas (Speed Boost): Kasut sayap kilat emas
      sprites.speed = makeCanvas((c) => {
        c.fillStyle = '#eab308';
        c.beginPath();
        c.arc(14, 14, 11, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#fef08a'; c.lineWidth = 2; c.stroke();
        // Lambang kilat putih
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(15, 5);
        c.lineTo(8, 15);
        c.lineTo(14, 15);
        c.lineTo(12, 23);
        c.lineTo(20, 12);
        c.lineTo(14, 12);
        c.closePath();
        c.fill();
      });

      // Perisai Keselamatan: Medan tenaga sian
      sprites.shield = makeCanvas((c) => {
        c.fillStyle = '#06b6d4';
        c.beginPath();
        c.arc(14, 14, 11, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#cffafe'; c.lineWidth = 2; c.stroke();
        // Lambang perisai
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(14, 7);
        c.lineTo(20, 9);
        c.lineTo(20, 15);
        c.quadraticCurveTo(14, 21, 14, 22);
        c.quadraticCurveTo(14, 21, 8, 15);
        c.lineTo(8, 9);
        c.closePath();
        c.fill();
      });

      // Kit Pertolongan Cemas: Kotak medkit dengan palang merah
      sprites.medkit = makeCanvas((c) => {
        c.fillStyle = '#ffffff';
        c.fillRect(4, 5, 20, 18);
        c.strokeStyle = '#e2e8f0'; c.lineWidth = 1; c.strokeRect(4, 5, 20, 18);
        c.fillStyle = '#ef4444'; // Palang perubatan merah
        c.fillRect(12, 8, 4, 12);
        c.fillRect(8, 12, 12, 4);
      });

      return sprites;
    }

    // 5. Sprite Robot Pembersih Makmal Rosak (Patrol Bot)
    createRobotSprite() {
      const c = document.createElement('canvas');
      c.width = 28;
      c.height = 28;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;

      // Bayang bawah
      cx.fillStyle = 'rgba(0,0,0,0.25)';
      cx.beginPath();
      cx.ellipse(14, 25, 9, 3, 0, 0, Math.PI * 2);
      cx.fill();

      // Roda bawah bot
      cx.fillStyle = '#1e293b';
      cx.fillRect(5, 20, 4, 4);
      cx.fillRect(19, 20, 4, 4);

      // Badan robot silinder logam
      cx.fillStyle = '#64748b';
      cx.fillRect(6, 9, 16, 12);
      cx.fillStyle = '#94a3b8';
      cx.fillRect(8, 10, 12, 9);

      // Skrin sensor wajah robot
      cx.fillStyle = '#0f172a';
      cx.fillRect(9, 11, 10, 5);
      cx.fillStyle = '#ef4444'; // Mata amaran merah berkerlip
      cx.fillRect(10, 12, 2, 2);
      cx.fillRect(16, 12, 2, 2);

      // Lampu kubah amaran kecemasan berputar
      cx.fillStyle = '#dc2626';
      cx.beginPath();
      cx.arc(14, 7, 4, Math.PI, 0);
      cx.fill();
      cx.fillStyle = '#f87171';
      cx.fillRect(13, 5, 2, 2);

      return c;
    }

    // 6. Input Keyboard & Touch
    initInput() {
      window.addEventListener('keydown', (e) => {
        if (this.isPaused || this.state !== (GameState ? GameState.PLAYING : 'playing')) return;

        const k = e.key.toLowerCase();
        if (['arrowup', 'w'].includes(k)) { this.keys.up = true; e.preventDefault(); }
        if (['arrowdown', 's'].includes(k)) { this.keys.down = true; e.preventDefault(); }
        if (['arrowleft', 'a'].includes(k)) { this.keys.left = true; e.preventDefault(); }
        if (['arrowright', 'd'].includes(k)) { this.keys.right = true; e.preventDefault(); }
      });

      window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (['arrowup', 'w'].includes(k)) this.keys.up = false;
        if (['arrowdown', 's'].includes(k)) this.keys.down = false;
        if (['arrowleft', 'a'].includes(k)) this.keys.left = false;
        if (['arrowright', 'd'].includes(k)) this.keys.right = false;
      });
    }

    setTouchVector(vx, vy, isActive = true) {
      if (this.state !== (GameState ? GameState.PLAYING : 'playing')) {
        this.touchVector.active = false;
        this.touchVector.x = 0;
        this.touchVector.y = 0;
        return;
      }
      this.touchVector.x = vx;
      this.touchVector.y = vy;
      this.touchVector.active = isActive;
    }

    resetInputs() {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
      this.touchVector.x = 0;
      this.touchVector.y = 0;
      this.touchVector.active = false;
    }

    handleResize() {
      if (!this.canvas || !this.canvas.parentElement) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.min(Math.max(460, window.innerHeight - 200), 720);

      this.canvas.width = w;
      this.canvas.height = h;

      this.camera.width = w;
      this.camera.height = h;
      this.ctx.imageSmoothingEnabled = false;
    }

    // 7. Semakan Pelanggaran Dinding (Tile Collision)
    isSolidTile(col, row) {
      if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
      const tile = this.map[row][col];

      // Tile 19 ialah Pintu Keselamatan Makmal: SOLID jika sampel < 10, TERBUKA jika sampel = 10
      if (tile === 19) {
        const collectedCount = this.samples.filter(s => s.collected).length;
        return collectedCount < 10;
      }

      // Tile 10 ke atas adalah pepejal (solid), kecuali tile 20 (Terminal Finish)
      return tile >= 10 && tile !== 20;
    }

    checkCollision(newX, newY) {
      const halfW = this.player.width / 2;

      const left = newX - halfW + 2;
      const right = newX + halfW - 2;
      const top = newY - 10;
      const bottom = newY + 2;

      const minCol = Math.floor(left / TILE_SIZE);
      const maxCol = Math.floor(right / TILE_SIZE);
      const minRow = Math.floor(top / TILE_SIZE);
      const maxRow = Math.floor(bottom / TILE_SIZE);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (this.isSolidTile(c, r)) {
            return true;
          }
        }
      }
      return false;
    }

    // 8. Kerosakan & Nyawa Pemain
    damagePlayer(sourceLabel) {
      if (this.player.invulnerableTimer > 0) return;

      // Jika ada perisai keselamatan, serap kerosakan tanpa tolak nyawa!
      if (this.player.hasShield) {
        this.player.hasShield = false;
        this.player.invulnerableTimer = 1.6;
        Audio.playShieldBreak();
        this.spawnShieldBreakBurst(this.player.x, this.player.y);
        this.onPlayerHurt(this.player.lives, true, sourceLabel);
        return;
      }

      // Tolak 1 nyawa
      this.player.lives = Math.max(0, this.player.lives - 1);
      this.player.invulnerableTimer = 1.8; // Tempoh kebal 1.8 saat
      this.screenShake = 0.3; // Goncangan skrin sedikit
      Audio.playHurt();
      this.spawnHurtBurst(this.player.x, this.player.y);
      this.onPlayerHurt(this.player.lives, false, sourceLabel);

      // Jika nyawa habis -> Game Over
      if (this.player.lives <= 0) {
        this.setState(GameState ? GameState.GAMEOVER : 'gameover');
        Audio.playGameOver();
        this.onGameOver();
      }
    }

    // 9. Kemas Kini Gelung Permainan (Update Physics, Hazards, Robots, Pickups)
    update(dt) {
      if (this.isPaused) return;

      if (this.finishCooldown > 0) this.finishCooldown -= dt;
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt);

      // Kemas kini pemasa kebal pemain
      if (this.player.invulnerableTimer > 0) {
        this.player.invulnerableTimer -= dt;
      }

      // Kemas kini Kasut Pantas (Speed Boost Timer)
      if (this.player.speedBoostTimer > 0) {
        this.player.speedBoostTimer -= dt;
        this.player.speed = this.player.baseSpeed * 1.5;

        // Jejak zarah kelajuan di belakang pemain
        this.player.trailTimer += dt;
        if (this.player.trailTimer > 0.08) {
          this.player.trailTimer = 0;
          this.particles.push({
            x: this.player.x - 4 + Math.random() * 8,
            y: this.player.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: 2.5,
            color: '#facc15',
            life: 0.35
          });
        }
      } else {
        this.player.speed = this.player.baseSpeed;
      }

      // Tentukan pergerakan pemain
      let moveX = 0;
      let moveY = 0;

      if (this.touchVector.active) {
        moveX = this.touchVector.x;
        moveY = this.touchVector.y;
      } else {
        if (this.keys.up) moveY -= 1;
        if (this.keys.down) moveY += 1;
        if (this.keys.left) moveX -= 1;
        if (this.keys.right) moveX += 1;
      }

      const len = Math.hypot(moveX, moveY);
      this.player.isMoving = len > 0.1;

      if (this.player.isMoving) {
        const normX = (moveX / len);
        const normY = (moveY / len);

        if (Math.abs(normX) > Math.abs(normY)) {
          this.player.direction = normX > 0 ? 'right' : 'left';
        } else {
          this.player.direction = normY > 0 ? 'down' : 'up';
        }

        const delta = this.player.speed * dt;
        const targetX = this.player.x + normX * delta;
        const targetY = this.player.y + normY * delta;

        // Sliding collision resolution
        if (!this.checkCollision(targetX, this.player.y)) {
          this.player.x = targetX;
        }
        if (!this.checkCollision(this.player.x, targetY)) {
          this.player.y = targetY;
        }

        this.player.animTimer += dt * 10;
        this.player.animFrame = Math.floor(this.player.animTimer) % 4;

        this.player.stepSoundTimer += dt;
        if (this.player.stepSoundTimer > 0.32) {
          this.player.stepSoundTimer = 0;
          Audio.playStep();
        }

        this.onPlayerMove(this.player);
      } else {
        this.player.animFrame = 0;
      }

      // Hadkan posisi pemain dalam sempadan peta
      this.player.x = Math.max(TILE_SIZE, Math.min(this.worldWidth - TILE_SIZE, this.player.x));
      this.player.y = Math.max(TILE_SIZE, Math.min(this.worldHeight - TILE_SIZE, this.player.y));

      // Kemas kini Kamera (Lerp licin mengikut pemain)
      const targetCamX = this.player.x - this.camera.width / 2;
      const targetCamY = this.player.y - this.camera.height / 2;
      this.camera.x += (targetCamX - this.camera.x) * 0.12;
      this.camera.y += (targetCamY - this.camera.y) * 0.12;
      this.camera.x = Math.max(0, Math.min(this.worldWidth - this.camera.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.worldHeight - this.camera.height, this.camera.y));

      // Kemas kini Robot Ronda Makmal
      this.robots.forEach((bot) => {
        if (bot.axis === 'x') {
          bot.x += bot.speed * bot.dir * dt;
          if (bot.x >= bot.max) {
            bot.x = bot.max;
            bot.dir = -1;
          } else if (bot.x <= bot.min) {
            bot.x = bot.min;
            bot.dir = 1;
          }
        } else {
          bot.y += bot.speed * bot.dir * dt;
          if (bot.y >= bot.max) {
            bot.y = bot.max;
            bot.dir = -1;
          } else if (bot.y <= bot.min) {
            bot.y = bot.min;
            bot.dir = 1;
          }
        }

        // Percikan elektrik kecil daripada robot rosak
        bot.sparkTimer += dt;
        if (bot.sparkTimer > 0.7) {
          bot.sparkTimer = 0;
          this.particles.push({
            x: bot.x,
            y: bot.y - 10,
            vx: (Math.random() - 0.5) * 40,
            vy: -20 - Math.random() * 20,
            size: 2,
            color: '#ef4444',
            life: 0.3
          });
        }

        // Semak perlanggaran Robot vs Pemain
        const distBot = Math.hypot(this.player.x - bot.x, this.player.y - bot.y);
        if (distBot < 22) {
          this.damagePlayer(bot.name);
        }
      });

      // Semak Bahaya Tumpahan Bahan Kimia Statik
      this.hazards.forEach((h) => {
        const distH = Math.hypot(this.player.x - h.x, this.player.y - h.y);
        if (distH < h.radius) {
          this.damagePlayer(h.label);
        }
      });

      // Semak Kutipan Power-ups
      this.powerups.forEach((p) => {
        if (!p.collected) {
          const distP = Math.hypot(this.player.x - p.x, this.player.y - p.y);
          if (distP < 24) {
            p.collected = true;
            Audio.playPowerup();
            this.spawnCollectBurst(p.x, p.y, ['#38bdf8', '#facc15', '#4ade80']);

            if (p.type === 'speed') {
              this.player.speedBoostTimer = p.duration;
            } else if (p.type === 'shield') {
              this.player.hasShield = true;
            } else if (p.type === 'medkit') {
              this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
            }
            this.onPowerupCollect(p);
          }
        }
      });

      // Semak Kutipan 10 Sampel Sains
      this.samples.forEach((s) => {
        if (!s.collected) {
          const dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
          if (dist < 26) {
            s.collected = true;
            this.spawnCollectBurst(s.x, s.y, ['#06b6d4', '#10b981', '#fbbf24', '#ffffff']);
            Audio.playCollect();
            this.setState(GameState ? GameState.QUESTION : 'question');

            const qData = QUESTIONS.find((q) => q.id === s.questionId);
            this.onSampleTrigger(s, qData);
          }
        }
      });

      // Semak Zon Makmal Utama (Tile 20: Terminal Pengaktifan Keselamatan)
      const currentTileCol = Math.floor(this.player.x / TILE_SIZE);
      const currentTileRow = Math.floor(this.player.y / TILE_SIZE);

      if (
        currentTileCol >= 0 && currentTileCol < MAP_COLS &&
        currentTileRow >= 0 && currentTileRow < MAP_ROWS
      ) {
        if (this.map[currentTileRow][currentTileCol] === 20 && this.finishCooldown <= 0) {
          this.finishCooldown = 3.0;
          const collectedCount = this.samples.filter(s => s.collected).length;
          const isComplete = collectedCount === this.samples.length;

          if (isComplete) {
            this.setState(GameState ? GameState.COMPLETED : 'completed');
            Audio.playReactivate();
            setTimeout(() => {
              Audio.playVictory();
            }, 600);
            this.spawnVictoryConfetti();
          }
          this.onFinishZoneTrigger(isComplete, collectedCount, this.samples.length);
        }
      }

      // Kemas kini Zarah Partikel
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    // Percikan kutipan sampel
    spawnCollectBurst(x, y, colors = ['#06b6d4', '#10b981', '#fbbf24']) {
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 80;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          size: 3 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0.6 + Math.random() * 0.4
        });
      }
    }

    // Percikan kerosakan (hurt)
    spawnHurtBurst(x, y) {
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 60;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 15,
          size: 3,
          color: '#ef4444',
          life: 0.45
        });
      }
    }

    // Percikan perisai pecah
    spawnShieldBreakBurst(x, y) {
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 90;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3.5,
          color: '#38bdf8',
          life: 0.6
        });
      }
    }

    // Konfeti kemenangan
    spawnVictoryConfetti() {
      const colors = ['#0d9488', '#06b6d4', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
      for (let i = 0; i < 90; i++) {
        this.particles.push({
          x: this.player.x - 120 + Math.random() * 240,
          y: this.player.y - 140 + Math.random() * 40,
          vx: -60 + Math.random() * 120,
          vy: 40 + Math.random() * 130,
          size: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 2.8 + Math.random() * 1.5
        });
      }
    }

    // 10. Render Seluruh Dunia Permainan
    render(time) {
      const ctx = this.ctx;
      const cam = this.camera;

      // Screen shake offset jika terkena kerosakan
      let shakeX = 0;
      let shakeY = 0;
      if (this.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * 8 * (this.screenShake / 0.3);
        shakeY = (Math.random() - 0.5) * 8 * (this.screenShake / 0.3);
      }

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.save();
      ctx.translate(-Math.floor(cam.x + shakeX), -Math.floor(cam.y + shakeY));

      const startCol = Math.max(0, Math.floor(cam.x / TILE_SIZE));
      const endCol = Math.min(MAP_COLS - 1, Math.ceil((cam.x + cam.width) / TILE_SIZE));
      const startRow = Math.max(0, Math.floor(cam.y / TILE_SIZE));
      const endRow = Math.min(MAP_ROWS - 1, Math.ceil((cam.y + cam.height) / TILE_SIZE));

      // A. Lukis Tile Map
      const allSamplesGathered = this.samples.every(s => s.collected);

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tile = this.map[r][c];

          // Jika tile 19 (Pintu Keselamatan Makmal):
          if (tile === 19) {
            if (allSamplesGathered) {
              // Pintu dibuka: lantai bilik bersih hijau bercahaya
              ctx.fillStyle = '#064e3b';
              ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#10b981';
              ctx.fillRect(c * TILE_SIZE + 4, r * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('BUKA', c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
            } else {
              // Pintu terkunci: palang laser merah amaran
              ctx.fillStyle = '#7f1d1d';
              ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 8, TILE_SIZE - 4, 4);
              ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 20, TILE_SIZE - 4, 4);
              ctx.fillStyle = '#fee2e2';
              ctx.font = 'bold 8px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🔒 KUNCI', c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + 14);
            }
            continue;
          }

          const img = this.tileSprites[tile] || this.tileSprites[0];
          ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE);
        }
      }

      // B. Lukis Halangan Tumpahan Bahan Kimia
      this.hazards.forEach((h) => {
        ctx.save();
        const pulse = Math.sin(time * 0.006 + h.x) * 2;
        if (h.type === 'biohazard') {
          // Zon pencemaran biohazard ungu berpendar
          ctx.fillStyle = 'rgba(147, 51, 234, 0.45)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#581c87';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ BIOHAZARD', h.x, h.y + 3);
        } else {
          // Tumpahan asid / reagen hijau neon
          ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#14532d';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ ASID', h.x, h.y + 3);
        }
        ctx.restore();
      });

      // C. Lukis Robot Pembersih Makmal Ronda
      this.robots.forEach((bot) => {
        ctx.drawImage(this.robotSprite, bot.x - 14, bot.y - 14);

        // Amaran laser merah kecil di hadapan robot
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (bot.axis === 'x') {
          ctx.moveTo(bot.x, bot.y);
          ctx.lineTo(bot.x + bot.dir * 28, bot.y);
        } else {
          ctx.moveTo(bot.x, bot.y);
          ctx.lineTo(bot.x, bot.y + bot.dir * 28);
        }
        ctx.stroke();
        ctx.restore();
      });

      // D. Lukis Power-ups
      this.powerups.forEach((p) => {
        if (!p.collected) {
          const bob = Math.sin(time * 0.005 + p.bobOffset) * 4;
          // Lingkaran aura bercahaya
          ctx.save();
          ctx.fillStyle = p.type === 'speed' ? 'rgba(234, 179, 8, 0.3)' : p.type === 'shield' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(239, 68, 68, 0.25)';
          ctx.beginPath();
          ctx.arc(p.x, p.y + bob, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          const sprite = this.powerupSprites[p.type];
          if (sprite) {
            ctx.drawImage(sprite, p.x - 14, p.y - 14 + bob);
          }

          // Label nama kuasa kecil
          ctx.save();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(p.x - 22, p.y - 25 + bob, 44, 11, 5);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7.5px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.name.split(' ')[0], p.x, p.y - 19.5 + bob);
          ctx.restore();
        }
      });

      // E. Lukis 10 Objek & Sampel Sains
      this.samples.forEach((s) => {
        if (!s.collected) {
          const bob = Math.sin(time * 0.005 + s.bobOffset) * 4;

          // Aura cahaya sains bercahaya
          ctx.save();
          ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.beginPath();
          ctx.arc(s.x, s.y + bob, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Lukis sprite spesimen sains
          const spr = this.sampleSprites[s.type] || this.sampleSprites.animal_cell;
          ctx.drawImage(spr, s.x - 16, s.y - 16 + bob);

          // Tag Nombor Soalan & Sampel
          ctx.save();
          ctx.fillStyle = '#0f766e';
          ctx.beginPath();
          ctx.roundRect(s.x - 16, s.y - 28 + bob, 32, 12, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Q${s.questionId}`, s.x, s.y - 22 + bob);
          ctx.restore();
        } else {
          // Tanda semak hijau apabila sampel telah dikutip
          ctx.save();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', s.x, s.y);
          ctx.restore();
        }
      });

      // F. Lukis Gerbang & Terminal Makmal Utama
      this.drawMainLabArchway(ctx, allSamplesGathered);

      // G. Lukis Pemain (Avatar Saintis Muda)
      const p = this.player;

      // Jika kebal (flicker berkedip)
      const isFlicker = p.invulnerableTimer > 0 && Math.floor(time * 0.02) % 2 === 0;
      if (!isFlicker) {
        const sprite = this.playerSprites[p.direction][p.animFrame];
        ctx.drawImage(sprite, p.x - 16, p.y - 28);
      }

      // Jika ada Perisai Keselamatan aktif: lukis gelang tenaga sian berputar
      if (p.hasShield) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.arc(p.x, p.y - 12, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 12, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Tag Nama & Nyawa Pemain di atas Watak
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      const nameWidth = ctx.measureText(p.name).width + 12;
      ctx.beginPath();
      ctx.roundRect(p.x - nameWidth / 2, p.y - 44, nameWidth, 14, 7);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.name, p.x, p.y - 37);
      ctx.restore();

      // H. Lukis Zarah Partikel
      this.particles.forEach((pt) => {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // Lukis Gerbang & Terminal Makmal Utama ARSelNel
    drawMainLabArchway(ctx, isUnlocked) {
      const archX = 20 * TILE_SIZE;
      const archY = 1 * TILE_SIZE;
      const archW = 8 * TILE_SIZE;

      ctx.save();
      // Banner makmal
      ctx.fillStyle = isUnlocked ? '#065f46' : '#0f766e';
      ctx.fillRect(archX + 10, archY + 4, archW - 20, 16);
      ctx.strokeStyle = isUnlocked ? '#34d399' : '#5eead4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(archX + 10, archY + 4, archW - 20, 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = isUnlocked ? '⚡ MAKMAL UTAMA: SISTEM SEDIA DIAKTIFKAN ⚡' : '🔬 PINTU MAKMAL UTAMA (MISI PENYELAMAT)';
      ctx.fillText(text, archX + archW / 2, archY + 12);

      // Lampu status gerbang
      const glow = Math.sin(Date.now() * 0.006) * 4 + 8;
      ctx.fillStyle = isUnlocked ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(archX + 8, archY + 12, glow, 0, Math.PI * 2);
      ctx.arc(archX + archW - 8, archY + 12, glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 11. Kawalan Gelung Utama (Loop)
    start() {
      this.lastTime = performance.now();
      const loop = (time) => {
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        this.update(dt);
        this.render(time);

        this.animReqId = requestAnimationFrame(loop);
      };
      this.animReqId = requestAnimationFrame(loop);
    }

    stop() {
      if (this.animReqId) {
        cancelAnimationFrame(this.animReqId);
        this.animReqId = null;
      }
    }

    setState(newState) {
      this.state = newState;
      if (newState === (GameState ? GameState.PLAYING : 'playing')) {
        this.isPaused = false;
        this.lastTime = performance.now();
      } else {
        this.isPaused = true;
        this.resetInputs();
      }
    }

    resume() {
      this.setState(GameState ? GameState.PLAYING : 'playing');
    }

    resetRun() {
      this.player.x = 19 * TILE_SIZE;
      this.player.y = 19 * TILE_SIZE;
      this.player.direction = 'down';
      this.player.isMoving = false;
      this.player.animFrame = 0;
      this.player.animTimer = 0;
      this.player.stepSoundTimer = 0;
      this.player.lives = 3;
      this.player.hasShield = false;
      this.player.speedBoostTimer = 0;
      this.player.invulnerableTimer = 0;
      this.samples.forEach((s) => { s.collected = false; });
      this.powerups.forEach((p) => { p.collected = false; });
      this.particles = [];
      this.finishCooldown = 0;
      this.screenShake = 0;
      this.resetInputs();
    }
  }

  global.ARSelNelAdventure.AdventureGameEngine = AdventureGameEngine;

})(window);
