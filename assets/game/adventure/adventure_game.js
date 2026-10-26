/**
 * ARSelNel 2D Science Rescue Adventure - High-Definition Game Engine & Renderer
 * Modul: Misi Penyelamat Makmal Sains (Kuiz Saintis Muda)
 * 
 * HD Upgrades:
 * - High-DPI / DevicePixelRatio support for razor-sharp rendering on all screens
 * - Smart camera scaling & zoom (1.85x - 2.05x) for optimal visibility & detail
 * - Detailed HD Pixel-Art procedural sprites for all 10 science samples
 * - Volumetric environment tiles (shaded trees, cobblestones, glossy lab benches, cleanroom)
 * - Animated hazards (bubbling chemical spills, biohazard zones, scanning patrol bots)
 * - Soft ambient shadows, pulsing halos, and polished particle effects
 * - 100% preservation of collision physics, speeds, coordinates, questions, and mechanics!
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

      // HD Viewport & Camera Scaling (Mudah dikonfigurasi - Fasa 3: Zoom out 10-15%)
      this.CAMERA_ZOOM_CONFIG = {
        mobile: 1.25,   // Sebelum ini 1.40 (-10.7%)
        tablet: 1.45,   // Sebelum ini 1.65 (-12.1%)
        laptop: 1.60,   // Sebelum ini 1.85 (-13.5% untuk paparan 1366x768 & laptop)
        wide: 1.75      // Sebelum ini 2.05 (-14.6% untuk 1080p & 2K)
      };
      this.dpr = 1;
      this.gameScale = this.CAMERA_ZOOM_CONFIG.laptop; // Skala kamera dikonfigurasikan
      this.camera = { x: 0, y: 0, width: 800, height: 600 };

      // Pemain (Saintis Muda) - KEKALKAN 100% SIFAT FIZIK & COLLISION BOX
      this.player = {
        x: 19 * TILE_SIZE, // Mula di Dataran Sains Utama
        y: 19 * TILE_SIZE,
        width: 22,
        height: 28,
        baseSpeed: 155, // px per saat (KEKAL)
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

      // 10 Objek & Sampel Sains (Lokasi & Soalan KEKAL)
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

      // Power-ups (Lokasi & Kesan KEKAL)
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

      // Keadaan permainan
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

      // Sediakan cache tekstur HD Pixel-Art
      this.tileSprites = this.createHDTileTextures();
      this.playerSprites = this.createHDPlayerSprites();
      this.sampleSprites = this.createHDSampleSprites();
      this.powerupSprites = this.createHDPowerupSprites();
      this.robotSprite = this.createHDRobotSprite();

      // Dengar input keyboard & resize
      this.initInput();
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }

    // =========================================================================
    // 1. HD PIXEL-ART PROCEDURAL TILE TEXTURES (32x32)
    // =========================================================================
    createHDTileTextures() {
      const textures = {};
      const size = TILE_SIZE; // 32px

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 0: Rumput Kampus Sains (Lush Emerald with Shading & Flowers)
      textures[0] = makeCanvas((c) => {
        // Base grass tone
        c.fillStyle = '#4ade80';
        c.fillRect(0, 0, size, size);

        // Subtle micro-pattern for grass blades
        c.fillStyle = '#22c55e';
        c.fillRect(3, 4, 2, 4);
        c.fillRect(14, 2, 2, 3);
        c.fillRect(24, 6, 2, 4);
        c.fillRect(8, 14, 2, 4);
        c.fillRect(20, 16, 2, 4);
        c.fillRect(5, 24, 2, 4);
        c.fillRect(17, 26, 2, 3);
        c.fillRect(27, 22, 2, 4);

        // Sunlight highlights on blade tips
        c.fillStyle = '#86efac';
        c.fillRect(4, 3, 2, 2);
        c.fillRect(15, 1, 2, 2);
        c.fillRect(25, 5, 2, 2);
        c.fillRect(9, 13, 2, 2);
        c.fillRect(21, 15, 2, 2);
        c.fillRect(6, 23, 2, 2);

        // Wildflowers (kuning & putih)
        c.fillStyle = '#fef08a';
        c.fillRect(11, 8, 3, 3);
        c.fillStyle = '#ffffff';
        c.fillRect(12, 9, 1, 1);

        c.fillStyle = '#ffffff';
        c.fillRect(25, 27, 3, 3);
        c.fillStyle = '#facc15';
        c.fillRect(26, 28, 1, 1);
      });

      // 1: Laluan Batu Berturap / Cobblestones (Beveled Slate Pavers)
      textures[1] = makeCanvas((c) => {
        // Base mortar tone
        c.fillStyle = '#cbd5e1';
        c.fillRect(0, 0, size, size);

        // Paver blocks (4 distinct pavers with light highlights & drop shadows)
        const drawPaver = (x, y, w, h) => {
          // Shadow underneath
          c.fillStyle = '#94a3b8';
          c.fillRect(x, y, w, h);
          // Face
          c.fillStyle = '#e2e8f0';
          c.fillRect(x, y, w - 1, h - 1);
          // Highlight
          c.fillStyle = '#f8fafc';
          c.fillRect(x, y, w - 2, 1);
          c.fillRect(x, y, 1, h - 2);
        };

        drawPaver(1, 1, 14, 14);
        drawPaver(17, 1, 14, 14);
        drawPaver(1, 17, 14, 14);
        drawPaver(17, 17, 14, 14);
      });

      // 2: Jubin Makmal Biologi (Glossy White Lab Tiles with Teal Trim)
      textures[2] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);

        // Grout grid
        c.fillStyle = '#e2e8f0';
        c.fillRect(0, 0, size, 1);
        c.fillRect(0, 0, 1, size);
        c.fillRect(0, size - 1, size, 1);
        c.fillRect(size - 1, 0, 1, size);

        // Specular light reflection on glossy floor
        c.fillStyle = '#ffffff';
        c.fillRect(3, 3, 10, 2);
        c.fillRect(3, 5, 2, 8);

        // Corner teal lab motif
        c.fillStyle = '#0d9488';
        c.fillRect(15, 15, 2, 2);
      });

      // 3: Lantai Rumah Hijau Botanik (Mint Terracotta Garden Tiles)
      textures[3] = makeCanvas((c) => {
        c.fillStyle = '#dcfce7';
        c.fillRect(0, 0, size, size);

        c.strokeStyle = '#bbf7d0';
        c.lineWidth = 1;
        c.strokeRect(1, 1, size - 2, size - 2);

        // Botanical terracotta diamond
        c.fillStyle = '#86efac';
        c.beginPath();
        c.moveTo(16, 6);
        c.lineTo(26, 16);
        c.lineTo(16, 26);
        c.lineTo(6, 16);
        c.closePath();
        c.fill();

        c.fillStyle = '#4ade80';
        c.fillRect(15, 15, 2, 2);
      });

      // 4: Dataran Mar-mar Pavilion (Plaza Marble with Soft Veins)
      textures[4] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);

        c.strokeStyle = '#e2e8f0';
        c.lineWidth = 1;
        c.strokeRect(0, 0, size, size);

        // Inner decorative frame
        c.fillStyle = '#f1f5f9';
        c.fillRect(3, 3, 26, 26);

        c.fillStyle = '#e0f2fe';
        c.fillRect(6, 6, 20, 20);

        // Soft marble vein
        c.fillStyle = '#bae6fd';
        c.fillRect(8, 12, 12, 1);
        c.fillRect(16, 13, 8, 1);
      });

      // 5: Lantai Makmal Utama (Futuristic Cleanroom Tiles)
      textures[5] = makeCanvas((c) => {
        c.fillStyle = '#0f172a';
        c.fillRect(0, 0, size, size);

        // Outer beveled edge
        c.fillStyle = '#1e293b';
        c.fillRect(2, 2, size - 4, size - 4);

        // High-tech circuit track
        c.strokeStyle = '#0284c7';
        c.lineWidth = 1;
        c.strokeRect(5, 5, size - 10, size - 10);

        // Corner blue LED nodes
        c.fillStyle = '#38bdf8';
        c.fillRect(6, 6, 2, 2);
        c.fillRect(24, 6, 2, 2);
        c.fillRect(6, 24, 2, 2);
        c.fillRect(24, 24, 2, 2);
      });

      // 10: Dinding Bata Luar (SOLID - Charcoal Slate Masonry with Coping)
      textures[10] = makeCanvas((c) => {
        // Wall base
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);

        // Stone coping cap on top
        c.fillStyle = '#475569';
        c.fillRect(0, 0, size, 5);
        c.fillStyle = '#64748b';
        c.fillRect(0, 0, size, 2);

        // Mortar lines & bricks
        c.fillStyle = '#334155';
        c.fillRect(2, 7, 12, 6);
        c.fillRect(16, 7, 14, 6);
        c.fillRect(1, 15, 14, 6);
        c.fillRect(17, 15, 13, 6);
        c.fillRect(3, 23, 12, 6);
        c.fillRect(17, 23, 12, 6);

        // Brick highlights
        c.fillStyle = '#475569';
        c.fillRect(3, 8, 10, 1);
        c.fillRect(17, 8, 12, 1);
        c.fillRect(2, 16, 12, 1);
        c.fillRect(18, 16, 11, 1);
      });

      // 11: Dinding Kaca Makmal (SOLID - Teal Reinforced Glass Partitions)
      textures[11] = makeCanvas((c) => {
        // Steel frame
        c.fillStyle = '#0f766e';
        c.fillRect(0, 0, size, size);

        // Translucent glass panel
        c.fillStyle = '#14b8a6';
        c.fillRect(2, 2, size - 4, size - 4);
        c.fillStyle = '#5eead4';
        c.fillRect(4, 4, size - 8, size - 8);

        // Glass reflection streaks
        c.fillStyle = '#ffffff';
        c.fillRect(6, 6, 3, size - 12);
        c.fillRect(12, 6, 1, size - 12);
        c.fillRect(22, 6, 2, size - 12);
      });

      // 12: Pagar / Pokok Renek Sempadan (SOLID - Volumetric Lush Hedge)
      textures[12] = makeCanvas((c) => {
        c.fillStyle = '#14532d';
        c.fillRect(0, 0, size, size);

        // Multiple overlapping foliage lobes
        const drawLobe = (cx, cy, r, fill, hi) => {
          c.fillStyle = fill;
          c.beginPath();
          c.arc(cx, cy, r, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = hi;
          c.beginPath();
          c.arc(cx - 2, cy - 2, r * 0.55, 0, Math.PI * 2);
          c.fill();
        };

        drawLobe(8, 8, 7, '#16a34a', '#4ade80');
        drawLobe(24, 8, 7, '#16a34a', '#4ade80');
        drawLobe(8, 24, 7, '#15803d', '#22c55e');
        drawLobe(24, 24, 7, '#15803d', '#22c55e');
        drawLobe(16, 16, 8, '#22c55e', '#86efac');
      });

      // 13: Meja Eksperimen Makmal (SOLID - Granite Bench with Lab Glassware)
      textures[13] = makeCanvas((c) => {
        // Wooden / steel frame shadow
        c.fillStyle = '#1e293b';
        c.fillRect(2, 4, size - 4, size - 8);

        // Granite worktop
        c.fillStyle = '#475569';
        c.fillRect(2, 4, size - 4, 10);
        c.fillStyle = '#64748b';
        c.fillRect(3, 4, size - 6, 2);

        // Bench drawer & legs
        c.fillStyle = '#334155';
        c.fillRect(4, 14, size - 8, size - 18);
        c.fillStyle = '#94a3b8'; // Drawer handle
        c.fillRect(13, 17, 6, 2);

        // Glassware on top: Erlenmeyer flask (cyan) & beaker (pink)
        // Flask
        c.fillStyle = '#38bdf8';
        c.fillRect(6, 6, 4, 5);
        c.fillStyle = '#ffffff';
        c.fillRect(7, 5, 2, 2);

        // Beaker
        c.fillStyle = '#f43f5e';
        c.fillRect(20, 6, 5, 5);
        c.fillStyle = '#ffffff';
        c.fillRect(20, 6, 1, 5);
      });

      // 14: Pokok Rendang Kampus (SOLID - Volumetric Shaded Tree)
      textures[14] = makeCanvas((c) => {
        // Cast shadow on ground
        c.fillStyle = 'rgba(15, 23, 42, 0.28)';
        c.beginPath();
        c.ellipse(16, 28, 12, 4, 0, 0, Math.PI * 2);
        c.fill();

        // Tree trunk
        c.fillStyle = '#78350f';
        c.fillRect(13, 16, 6, 12);
        c.fillStyle = '#92400e';
        c.fillRect(14, 16, 2, 12);

        // Tree canopy layers (Dark base -> Mid -> Light)
        c.fillStyle = '#14532d';
        c.beginPath();
        c.arc(16, 14, 13, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#16a34a';
        c.beginPath();
        c.arc(15, 12, 11, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#22c55e';
        c.beginPath();
        c.arc(13, 9, 8, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#86efac';
        c.fillRect(10, 6, 4, 3);
        c.fillRect(16, 7, 3, 2);
      });

      // 15: Kolam Air Pancut Dataran (SOLID - Rippling Fountain Basin)
      textures[15] = makeCanvas((c) => {
        // Stone basin rim
        c.fillStyle = '#64748b';
        c.fillRect(1, 1, size - 2, size - 2);
        c.fillStyle = '#94a3b8';
        c.fillRect(2, 2, size - 4, size - 4);

        // Deep water
        c.fillStyle = '#0284c7';
        c.fillRect(3, 3, size - 6, size - 6);

        // Water ripples & fountain spray
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(16, 16, 9, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#bae6fd';
        c.beginPath();
        c.arc(16, 16, 5, 0, Math.PI * 2);
        c.fill();

        // Water jet center
        c.fillStyle = '#ffffff';
        c.fillRect(15, 13, 2, 6);
        c.fillRect(13, 15, 6, 2);
      });

      // 16: Dinding Rumah Kaca (SOLID - Greenhouse Glass Structure)
      textures[16] = makeCanvas((c) => {
        c.fillStyle = '#14532d';
        c.fillRect(0, 0, size, size);

        // Glass panes
        c.fillStyle = '#bbf7d0';
        c.fillRect(2, 2, 13, 13);
        c.fillRect(17, 2, 13, 13);
        c.fillRect(2, 17, 13, 13);
        c.fillRect(17, 17, 13, 13);

        // Light sheen
        c.fillStyle = '#ffffff';
        c.fillRect(4, 4, 2, 6);
        c.fillRect(19, 4, 2, 6);
      });

      // 17: Rak Instrumen & Mikroskop (SOLID - High-Tech Equipment Console)
      textures[17] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(2, 2, size - 4, size - 4);

        c.fillStyle = '#334155';
        c.fillRect(3, 3, size - 6, size - 6);

        // Digital screen displaying waveform
        c.fillStyle = '#0f172a';
        c.fillRect(5, 5, 22, 12);
        c.fillStyle = '#06b6d4'; // Cyan oscilloscope line
        c.fillRect(6, 11, 4, 1);
        c.fillRect(10, 8, 3, 1);
        c.fillRect(13, 13, 3, 1);
        c.fillRect(16, 10, 5, 1);
        c.fillRect(21, 11, 5, 1);

        // Knobs & meters below
        c.fillStyle = '#10b981';
        c.fillRect(6, 20, 3, 3);
        c.fillStyle = '#f59e0b';
        c.fillRect(12, 20, 3, 3);
        c.fillStyle = '#ef4444';
        c.fillRect(18, 20, 3, 3);
      });

      // 18: Papan Tanda Arah Zon Makmal (SOLID - Clear Directional Signpost)
      textures[18] = makeCanvas((c) => {
        // Ground shadow
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath();
        c.ellipse(16, 28, 8, 3, 0, 0, Math.PI * 2);
        c.fill();

        // Wooden post
        c.fillStyle = '#78350f';
        c.fillRect(14, 14, 4, 15);

        // Signboard 1 (Makmal Utama - Blue pointing up/north)
        c.fillStyle = '#0284c7';
        c.fillRect(4, 3, 24, 7);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.strokeRect(4, 3, 24, 7);
        c.fillStyle = '#ffffff';
        c.fillRect(6, 6, 2, 2); // Arrow indicator
        c.fillRect(10, 6, 16, 1);

        // Signboard 2 (Bilik Mikroskop - Teal pointing side)
        c.fillStyle = '#0d9488';
        c.fillRect(4, 12, 24, 7);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.strokeRect(4, 12, 24, 7);
        c.fillStyle = '#ffffff';
        c.fillRect(6, 15, 2, 2);
        c.fillRect(10, 15, 16, 1);
      });

      // 20: Terminal Pengaktifan Keselamatan Makmal (Mainframe Finish Target)
      textures[20] = makeCanvas((c) => {
        c.fillStyle = '#0f172a';
        c.fillRect(0, 0, size, size);

        // Glowing reactor border
        c.fillStyle = '#0284c7';
        c.fillRect(2, 2, size - 4, size - 4);
        c.fillStyle = '#0369a1';
        c.fillRect(4, 4, size - 8, size - 8);

        // Supercomputer screen
        c.fillStyle = '#38bdf8';
        c.fillRect(8, 8, size - 16, size - 16);

        // Pulse icon in center
        c.fillStyle = '#ffffff';
        c.fillRect(13, 10, 6, 12);
        c.fillRect(10, 13, 12, 6);
      });

      // 21: Tiang Struktur Gerbang Makmal (SOLID - Reinforced Bronze/Teal Pillars)
      textures[21] = makeCanvas((c) => {
        c.fillStyle = '#0f766e';
        c.fillRect(2, 0, size - 4, size);

        c.fillStyle = '#14b8a6';
        c.fillRect(4, 2, size - 8, size - 4);

        // Fluted vertical ridges
        c.fillStyle = '#5eead4';
        c.fillRect(6, 2, 2, size - 4);
        c.fillRect(12, 2, 2, size - 4);
        c.fillRect(18, 2, 2, size - 4);
        c.fillRect(24, 2, 2, size - 4);

        // Top & bottom caps
        c.fillStyle = '#042f2e';
        c.fillRect(2, 0, size - 4, 3);
        c.fillRect(2, size - 3, size - 4, 3);
      });

      return textures;
    }

    // =========================================================================
    // 2. HD PIXEL-ART YOUNG SCIENTIST AVATAR (32x36)
    // =========================================================================
    createHDPlayerSprites() {
      const sprites = {};
      const directions = ['down', 'up', 'left', 'right'];

      directions.forEach((dir) => {
        sprites[dir] = [];
        for (let frame = 0; frame < 4; frame++) {
          const c = document.createElement('canvas');
          c.width = 32;
          c.height = 36;
          const cx = c.getContext('2d');
          cx.imageSmoothingEnabled = false;

          const legOffset = (frame === 1) ? 3 : (frame === 3) ? -3 : 0;
          const bob = (frame % 2 === 1) ? -1 : 0;
          const armSwing = (frame === 1) ? 2 : (frame === 3) ? -2 : 0;

          // 1. Soft Oval Drop Shadow
          cx.fillStyle = 'rgba(15, 23, 42, 0.32)';
          cx.beginPath();
          cx.ellipse(16, 33, 9, 3.5, 0, 0, Math.PI * 2);
          cx.fill();

          // 2. Shoes & Trousers
          cx.fillStyle = '#1e293b'; // Slate pants
          if (dir === 'left' || dir === 'right') {
            cx.fillRect(14 + legOffset, 26, 5, 5);
            cx.fillStyle = '#0f172a'; // Shoe
            cx.fillRect(14 + legOffset, 31, 6, 3);
          } else {
            cx.fillRect(10 - legOffset, 26, 4, 5);
            cx.fillRect(18 + legOffset, 26, 4, 5);
            cx.fillStyle = '#0f172a';
            cx.fillRect(9 - legOffset, 31, 5, 3);
            cx.fillRect(18 + legOffset, 31, 5, 3);
          }

          // 3. Lab Coat & Shirt (White Coat with Shading & Teal Undershirt)
          // Teal shirt
          cx.fillStyle = '#0d9488';
          cx.fillRect(12, 14 + bob, 8, 12);

          // White scientist coat (left & right flaps with depth)
          cx.fillStyle = '#e2e8f0'; // Coat shade
          cx.fillRect(8, 14 + bob, 5, 13);
          cx.fillRect(19, 14 + bob, 5, 13);

          cx.fillStyle = '#ffffff'; // Coat highlight
          cx.fillRect(9, 14 + bob, 4, 12);
          cx.fillRect(19, 14 + bob, 4, 12);

          // Coat collar / lapels
          cx.fillStyle = '#f8fafc';
          cx.fillRect(10, 14 + bob, 3, 5);
          cx.fillRect(19, 14 + bob, 3, 5);

          // Scientist ID badge & pen in pocket
          cx.fillStyle = '#0f766e'; // Badge
          cx.fillRect(10, 18 + bob, 3, 3);
          cx.fillStyle = '#ef4444'; // Red pen clip
          cx.fillRect(19, 16 + bob, 1, 3);

          // Arms swinging
          cx.fillStyle = '#ffffff';
          if (dir === 'left') {
            cx.fillRect(13 + armSwing, 16 + bob, 4, 8);
            cx.fillStyle = '#fed7aa'; // Hand
            cx.fillRect(13 + armSwing, 24 + bob, 3, 3);
          } else if (dir === 'right') {
            cx.fillRect(15 - armSwing, 16 + bob, 4, 8);
            cx.fillStyle = '#fed7aa';
            cx.fillRect(16 - armSwing, 24 + bob, 3, 3);
          } else {
            cx.fillRect(7 - armSwing, 16 + bob, 3, 8);
            cx.fillRect(22 + armSwing, 16 + bob, 3, 8);
            cx.fillStyle = '#fed7aa';
            cx.fillRect(7 - armSwing, 24 + bob, 3, 3);
            cx.fillRect(22 + armSwing, 24 + bob, 3, 3);
          }

          // 4. Head & Face (Peach skin with smooth neck)
          cx.fillStyle = '#fed7aa';
          cx.fillRect(10, 6 + bob, 12, 10);
          cx.fillStyle = '#fbcfe8'; // Soft cheek blush
          if (dir === 'down') {
            cx.fillRect(10, 12 + bob, 2, 2);
            cx.fillRect(20, 12 + bob, 2, 2);
          }

          // 5. Hair (Brunette with Highlight Layers)
          cx.fillStyle = '#451a03'; // Deep brown
          cx.fillRect(8, 3 + bob, 16, 5);
          cx.fillRect(7, 6 + bob, 3, 6);
          cx.fillRect(22, 6 + bob, 3, 6);

          cx.fillStyle = '#78350f'; // Hair mid-tone highlight
          cx.fillRect(11, 4 + bob, 10, 2);

          // 6. Facial Expressions (Eyes & Glasses)
          if (dir === 'down') {
            // Glasses frame (Modern teal/black specs)
            cx.fillStyle = '#0f172a';
            cx.strokeRect(11, 9 + bob, 3, 3);
            cx.strokeRect(18, 9 + bob, 3, 3);
            cx.fillRect(14, 10 + bob, 4, 1); // Bridge

            // Eyes
            cx.fillStyle = '#0284c7';
            cx.fillRect(12, 10 + bob, 2, 2);
            cx.fillRect(19, 10 + bob, 2, 2);

            // Smile
            cx.fillStyle = '#e11d48';
            cx.fillRect(15, 13 + bob, 2, 1);
          } else if (dir === 'left') {
            cx.fillStyle = '#0f172a';
            cx.fillRect(9, 9 + bob, 4, 3);
            cx.fillStyle = '#0284c7';
            cx.fillRect(9, 10 + bob, 2, 2);
          } else if (dir === 'right') {
            cx.fillStyle = '#0f172a';
            cx.fillRect(19, 9 + bob, 4, 3);
            cx.fillStyle = '#0284c7';
            cx.fillRect(21, 10 + bob, 2, 2);
          } else if (dir === 'up') {
            // Full back of hair
            cx.fillStyle = '#451a03';
            cx.fillRect(8, 4 + bob, 16, 11);
            cx.fillStyle = '#78350f';
            cx.fillRect(11, 5 + bob, 10, 4);
          }

          sprites[dir].push(c);
        }
      });

      return sprites;
    }

    // =========================================================================
    // 3. HD PROCEDURAL SPRITES FOR 10 SCIENCE SAMPLES (40x40 Canvas)
    // =========================================================================
    createHDSampleSprites() {
      const sprites = {};
      const size = 40;

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 1. animal_cell: Glass specimen jar with translucent blue animal cell & nucleus
      sprites.animal_cell = makeCanvas((c) => {
        // Shadow
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 11, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Glass vial body
        c.fillStyle = 'rgba(224, 242, 254, 0.85)';
        c.beginPath(); c.arc(20, 20, 13, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#0284c7'; c.lineWidth = 1.5; c.stroke();

        // Cytoplasm
        c.fillStyle = '#38bdf8';
        c.beginPath(); c.arc(20, 20, 11, 0, Math.PI * 2); c.fill();

        // Cell membrane outer ring
        c.strokeStyle = '#0369a1'; c.lineWidth = 1;
        c.beginPath(); c.arc(20, 20, 11, 0, Math.PI * 2); c.stroke();

        // Nucleus in center
        c.fillStyle = '#1e3a8a';
        c.beginPath(); c.arc(19, 19, 5, 0, Math.PI * 2); c.fill();

        // Nucleolus
        c.fillStyle = '#93c5fd';
        c.beginPath(); c.arc(18, 18, 2, 0, Math.PI * 2); c.fill();

        // Specular glass reflection
        c.fillStyle = 'rgba(255, 255, 255, 0.75)';
        c.fillRect(13, 11, 3, 3);
        c.fillRect(11, 14, 2, 4);
      });

      // 2. plant_cell: Hexagonal specimen flask with thick cell walls & chloroplasts
      sprites.plant_cell = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 12, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Hexagonal / Rectangular rigid cell wall (Dark emerald)
        c.fillStyle = '#14532d';
        c.fillRect(8, 9, 24, 22);
        c.fillStyle = '#16a34a'; // Inner wall
        c.fillRect(10, 11, 20, 18);

        // Cytoplasm
        c.fillStyle = '#4ade80';
        c.fillRect(12, 13, 16, 14);

        // Large central vacuole (sap)
        c.fillStyle = '#bbf7d0';
        c.fillRect(15, 15, 10, 10);
        c.strokeStyle = '#86efac'; c.lineWidth = 1; c.strokeRect(15, 15, 10, 10);

        // Chloroplast discs (vibrant green)
        c.fillStyle = '#15803d';
        c.fillRect(13, 14, 2, 2);
        c.fillRect(23, 14, 2, 2);
        c.fillRect(13, 23, 2, 2);
        c.fillRect(23, 23, 2, 2);

        // Nucleus at periphery
        c.fillStyle = '#1e3a8a';
        c.fillRect(19, 21, 3, 3);
      });

      // 3. micro_slide: Realistic ground glass slide with specimen & cover slip
      sprites.micro_slide = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 34, 14, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Glass slide rectangle
        c.fillStyle = '#f1f5f9';
        c.fillRect(6, 14, 28, 14);
        c.strokeStyle = '#94a3b8'; c.lineWidth = 1.5; c.strokeRect(6, 14, 28, 14);

        // Frosted label area on left
        c.fillStyle = '#e2e8f0';
        c.fillRect(7, 15, 6, 12);
        c.fillStyle = '#64748b'; // Barcode
        c.fillRect(8, 17, 4, 1);
        c.fillRect(8, 19, 4, 1);
        c.fillRect(8, 21, 4, 1);

        // Square glass cover slip in center
        c.fillStyle = 'rgba(224, 242, 254, 0.85)';
        c.fillRect(16, 15, 12, 12);
        c.strokeStyle = '#0ea5e9'; c.lineWidth = 1; c.strokeRect(16, 15, 12, 12);

        // Stained histological specimen (Crimson)
        c.fillStyle = '#e11d48';
        c.beginPath(); c.arc(22, 21, 4, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#881337';
        c.fillRect(21, 20, 2, 2);

        // Glass shine
        c.fillStyle = 'rgba(255, 255, 255, 0.8)';
        c.fillRect(17, 16, 4, 2);
      });

      // 4. obj_lens: High-precision 40x metal & brass objective lens
      sprites.obj_lens = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 10, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Screw thread top
        c.fillStyle = '#64748b';
        c.fillRect(16, 6, 8, 4);

        // Knurled chrome barrel
        c.fillStyle = '#334155';
        c.fillRect(13, 10, 14, 18);
        c.fillStyle = '#94a3b8';
        c.fillRect(14, 11, 12, 16);

        // Gold magnification 40x band
        c.fillStyle = '#d97706';
        c.fillRect(12, 16, 16, 5);
        c.fillStyle = '#fbbf24';
        c.fillRect(13, 17, 14, 3);
        c.fillStyle = '#78350f';
        c.fillRect(16, 18, 6, 1); // "40"

        // Front lens tip with blue optical reflection
        c.fillStyle = '#1e293b';
        c.fillRect(15, 28, 10, 4);
        c.fillStyle = '#0284c7';
        c.fillRect(17, 30, 6, 2);
        c.fillStyle = '#38bdf8';
        c.fillRect(18, 30, 2, 1);
      });

      // 5. test_tube: Glass test tube in rack with glowing bubbling cyan reagent
      sprites.test_tube = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 9, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Wooden test tube stand
        c.fillStyle = '#78350f';
        c.fillRect(12, 30, 16, 4);
        c.fillStyle = '#92400e';
        c.fillRect(13, 31, 14, 2);

        // Glass tube
        c.fillStyle = 'rgba(241, 245, 249, 0.85)';
        c.fillRect(16, 6, 8, 23);
        c.beginPath(); c.arc(20, 29, 4, 0, Math.PI); c.fill();
        c.strokeStyle = '#94a3b8'; c.lineWidth = 1; c.stroke();

        // Active cyan reagent liquid
        c.fillStyle = '#06b6d4';
        c.fillRect(17, 14, 6, 15);
        c.beginPath(); c.arc(20, 29, 3, 0, Math.PI); c.fill();

        // Meniscus & bubbles
        c.fillStyle = '#22d3ee';
        c.fillRect(17, 14, 6, 2);
        c.fillStyle = '#ffffff';
        c.fillRect(18, 18, 1, 1);
        c.fillRect(21, 22, 1, 1);

        // Glass highlight line
        c.fillStyle = 'rgba(255, 255, 255, 0.7)';
        c.fillRect(17, 8, 1, 18);
      });

      // 6. petri_dish: Glass petri dish with agar & vibrant microbial colonies
      sprites.petri_dish = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 33, 14, 4.5, 0, 0, Math.PI * 2); c.fill();

        // Outer dish rim
        c.fillStyle = 'rgba(224, 242, 254, 0.9)';
        c.beginPath(); c.arc(20, 20, 14, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#0284c7'; c.lineWidth = 1.5; c.stroke();

        // Nutrient agar plate (Amber yellow)
        c.fillStyle = '#fef08a';
        c.beginPath(); c.arc(20, 20, 11, 0, Math.PI * 2); c.fill();

        // Distinct cultured colonies (Red & Blue)
        c.fillStyle = '#ef4444';
        c.fillRect(16, 15, 3, 3);
        c.fillRect(22, 18, 3, 3);
        c.fillRect(15, 22, 2, 2);

        c.fillStyle = '#3b82f6';
        c.fillRect(20, 14, 2, 2);
        c.fillRect(17, 19, 3, 3);
        c.fillRect(22, 23, 2, 2);

        // Glass lid glare
        c.fillStyle = 'rgba(255, 255, 255, 0.7)';
        c.beginPath();
        c.arc(20, 20, 12, -Math.PI * 0.7, -Math.PI * 0.3);
        c.lineWidth = 2; c.stroke();
      });

      // 7. tissue_sample: Amber reagent bottle with striated tissue fibers
      sprites.tissue_sample = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 10, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Black ribbed cap
        c.fillStyle = '#1e293b';
        c.fillRect(16, 6, 8, 4);

        // Amber bottle glass
        c.fillStyle = '#b45309';
        c.fillRect(13, 10, 14, 21);
        c.strokeStyle = '#78350f'; c.lineWidth = 1; c.strokeRect(13, 10, 14, 21);

        // White paper label
        c.fillStyle = '#f8fafc';
        c.fillRect(14, 15, 12, 12);

        // Striated muscle/plant tissue fibers
        c.fillStyle = '#f43f5e';
        c.fillRect(16, 17, 8, 2);
        c.fillRect(16, 20, 8, 2);
        c.fillRect(16, 23, 8, 2);

        // Glass highlight
        c.fillStyle = 'rgba(254, 243, 199, 0.6)';
        c.fillRect(14, 11, 2, 18);
      });

      // 8. nucleus_model: Volumetric spherical cell nucleus with chromatin & nucleolus
      sprites.nucleus_model = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 12, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Outer nuclear membrane (Purple)
        c.fillStyle = '#6d28d9';
        c.beginPath(); c.arc(20, 20, 13, 0, Math.PI * 2); c.fill();

        // Nucleoplasm
        c.fillStyle = '#8b5cf6';
        c.beginPath(); c.arc(20, 20, 11, 0, Math.PI * 2); c.fill();

        // Chromatin thread network
        c.fillStyle = '#4c1d95';
        c.fillRect(14, 15, 4, 1);
        c.fillRect(22, 16, 5, 1);
        c.fillRect(15, 24, 6, 1);

        // Glowing dense nucleolus
        c.fillStyle = '#c4b5fd';
        c.beginPath(); c.arc(19, 19, 5, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff';
        c.fillRect(18, 17, 2, 2);
      });

      // 9. mito_model: Oblong bean-shaped mitochondrion with cristae inner folds
      sprites.mito_model = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 13, 3.5, 0, 0, Math.PI * 2); c.fill();

        // Outer membrane (Rich orange)
        c.fillStyle = '#ea580c';
        c.beginPath(); c.ellipse(20, 20, 15, 10, 0, 0, Math.PI * 2); c.fill();

        // Inner matrix (Peach)
        c.fillStyle = '#fed7aa';
        c.beginPath(); c.ellipse(20, 20, 13, 8, 0, 0, Math.PI * 2); c.fill();

        // Wavy Cristae baffles
        c.fillStyle = '#c2410c';
        c.fillRect(12, 15, 2, 8);
        c.fillRect(16, 14, 2, 9);
        c.fillRect(20, 15, 2, 8);
        c.fillRect(24, 14, 2, 9);

        // ATP spark
        c.fillStyle = '#fef08a';
        c.fillRect(18, 18, 2, 2);
      });

      // 10. cell_kit: Heavy-duty metallic scientific observation case
      sprites.cell_kit = makeCanvas((c) => {
        c.fillStyle = 'rgba(15, 23, 42, 0.25)';
        c.beginPath(); c.ellipse(20, 35, 14, 4, 0, 0, Math.PI * 2); c.fill();

        // Case handle
        c.fillStyle = '#334155';
        c.fillRect(16, 7, 8, 5);
        c.fillStyle = '#0f172a';
        c.fillRect(18, 9, 4, 3);

        // Case body (ARSelNel Teal)
        c.fillStyle = '#0f766e';
        c.fillRect(7, 12, 26, 18);
        c.strokeStyle = '#14b8a6'; c.lineWidth = 1.5; c.strokeRect(7, 12, 26, 18);

        // Silver corner bumpers
        c.fillStyle = '#94a3b8';
        c.fillRect(7, 12, 3, 3);
        c.fillRect(30, 12, 3, 3);
        c.fillRect(7, 27, 3, 3);
        c.fillRect(30, 27, 3, 3);

        // Silver latches
        c.fillStyle = '#f8fafc';
        c.fillRect(12, 19, 3, 4);
        c.fillRect(25, 19, 3, 4);

        // Science cross badge on center lid
        c.fillStyle = '#ffffff';
        c.fillRect(19, 16, 2, 10);
        c.fillRect(15, 20, 10, 2);
      });

      return sprites;
    }

    // =========================================================================
    // 4. HD POWER-UP SPRITES
    // =========================================================================
    createHDPowerupSprites() {
      const sprites = {};
      const size = 36;

      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // Kasut Pantas (Winged Lightning Sneaker)
      sprites.speed = makeCanvas((c) => {
        c.fillStyle = 'rgba(234, 179, 8, 0.3)';
        c.beginPath(); c.arc(18, 18, 15, 0, Math.PI * 2); c.fill();

        c.fillStyle = '#eab308';
        c.beginPath(); c.arc(18, 18, 12, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#fef08a'; c.lineWidth = 2; c.stroke();

        // Lightning bolt
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(19, 7);
        c.lineTo(10, 19);
        c.lineTo(18, 19);
        c.lineTo(15, 29);
        c.lineTo(26, 16);
        c.lineTo(18, 16);
        c.closePath();
        c.fill();
      });

      // Perisai Keselamatan (Holographic Energy Shield Orb)
      sprites.shield = makeCanvas((c) => {
        c.fillStyle = 'rgba(6, 182, 212, 0.3)';
        c.beginPath(); c.arc(18, 18, 15, 0, Math.PI * 2); c.fill();

        c.fillStyle = '#06b6d4';
        c.beginPath(); c.arc(18, 18, 12, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#cffafe'; c.lineWidth = 2; c.stroke();

        // Crest shield
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(18, 9);
        c.lineTo(25, 12);
        c.lineTo(25, 19);
        c.quadraticCurveTo(18, 27, 18, 28);
        c.quadraticCurveTo(18, 27, 11, 19);
        c.lineTo(11, 12);
        c.closePath();
        c.fill();
      });

      // Kit Pertolongan Cemas (Medical Box with Red Cross)
      sprites.medkit = makeCanvas((c) => {
        c.fillStyle = 'rgba(239, 68, 68, 0.25)';
        c.beginPath(); c.arc(18, 18, 15, 0, Math.PI * 2); c.fill();

        // Medkit box
        c.fillStyle = '#ffffff';
        c.fillRect(6, 8, 24, 20);
        c.strokeStyle = '#cbd5e1'; c.lineWidth = 1.5; c.strokeRect(6, 8, 24, 20);

        // Handle
        c.fillStyle = '#64748b';
        c.fillRect(15, 5, 6, 3);

        // Red cross
        c.fillStyle = '#ef4444';
        c.fillRect(16, 12, 4, 12);
        c.fillRect(12, 16, 12, 4);
      });

      return sprites;
    }

    // =========================================================================
    // 5. HD PATROL ROBOT SPRITE (32x32)
    // =========================================================================
    createHDRobotSprite() {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;

      // Drop shadow
      cx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      cx.beginPath();
      cx.ellipse(16, 29, 11, 3, 0, 0, Math.PI * 2);
      cx.fill();

      // Caterpillar treads / wheels
      cx.fillStyle = '#0f172a';
      cx.fillRect(5, 23, 6, 6);
      cx.fillRect(21, 23, 6, 6);
      cx.fillStyle = '#334155';
      cx.fillRect(6, 24, 4, 4);
      cx.fillRect(22, 24, 4, 4);

      // Chassis (Gunmetal steel with bevel)
      cx.fillStyle = '#475569';
      cx.fillRect(7, 10, 18, 14);
      cx.fillStyle = '#94a3b8';
      cx.fillRect(9, 11, 14, 11);

      // Sensor visor (Black glass)
      cx.fillStyle = '#0f172a';
      cx.fillRect(9, 13, 14, 6);

      // Red digital scanning eye
      cx.fillStyle = '#ef4444';
      cx.fillRect(11, 14, 4, 3);
      cx.fillRect(18, 14, 4, 3);
      cx.fillStyle = '#fca5a5';
      cx.fillRect(12, 15, 2, 1);
      cx.fillRect(19, 15, 2, 1);

      // Rotating emergency beacon siren on top
      cx.fillStyle = '#dc2626';
      cx.beginPath();
      cx.arc(16, 8, 4.5, Math.PI, 0);
      cx.fill();
      cx.fillStyle = '#fef2f2';
      cx.fillRect(15, 5, 2, 2);

      return c;
    }

    // =========================================================================
    // 6. INPUT HANDLING & RESIZING
    // =========================================================================
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
      const cssW = Math.floor(rect.width);
      const cssH = Math.min(Math.max(480, window.innerHeight - 200), 720);

      // Support High-DPI screens without pixelation
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      this.canvas.style.width = cssW + 'px';
      this.canvas.style.height = cssH + 'px';

      this.canvas.width = Math.round(cssW * dpr);
      this.canvas.height = Math.round(cssH * dpr);

      this.dpr = dpr;

      // Smart zoom scaling dikonfigurasikan (Fasa 3: Zoom out 10-15% daripada asal)
      const cfg = this.CAMERA_ZOOM_CONFIG || { mobile: 1.25, tablet: 1.45, laptop: 1.60, wide: 1.75 };
      let scale = cfg.laptop;
      if (cssW < 600) {
        scale = cfg.mobile;
      } else if (cssW < 960) {
        scale = cfg.tablet;
      } else if (cssW > 1400) {
        scale = cfg.wide;
      }

      this.gameScale = scale;

      // Virtual camera dimensions in game world units
      this.camera.width = cssW / scale;
      this.camera.height = cssH / scale;

      this.ctx.imageSmoothingEnabled = false;
    }

    // =========================================================================
    // 7. COLLISION & DAMAGE (100% KEKALKAN MEKANIK ASAL)
    // =========================================================================
    isSolidTile(col, row) {
      if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
      const tile = this.map[row][col];

      // Tile 19: Pintu Keselamatan Makmal: SOLID jika sampel < 10, TERBUKA jika sampel = 10
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

    // =========================================================================
    // 8. UPDATE GAME LOOP
    // =========================================================================
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
      this.camera.x += (targetCamX - this.camera.x) * 0.14;
      this.camera.y += (targetCamY - this.camera.y) * 0.14;
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

    // Partikel
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

    // =========================================================================
    // 9. HD RENDER TO CANVAS
    // =========================================================================
    render(time) {
      const ctx = this.ctx;
      const dpr = this.dpr || 1;
      const scale = this.gameScale || 1.85;
      const cam = this.camera;

      // Screen shake offset jika cedera
      let shakeX = 0;
      let shakeY = 0;
      if (this.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * 8 * (this.screenShake / 0.3);
        shakeY = (Math.random() - 0.5) * 8 * (this.screenShake / 0.3);
      }

      ctx.save();
      // Bersihkan kanvas fizikal
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Gunakan transformasi skala HD
      ctx.scale(dpr * scale, dpr * scale);
      ctx.translate(-Math.floor(cam.x + shakeX), -Math.floor(cam.y + shakeY));

      ctx.imageSmoothingEnabled = false;

      // Julat tile kelihatan dalam viewport kamera
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
              ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('BUKA', c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
            } else {
              // Pintu terkunci: palang laser merah beranimasi
              ctx.fillStyle = '#450a0a';
              ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              // Jalur amaran kuning/hitam
              ctx.fillStyle = '#ca8a04';
              ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, 4);
              ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE + TILE_SIZE - 4, TILE_SIZE, 4);

              // Laser bars berkedip
              const laserGlow = Math.sin(time * 0.008) * 0.3 + 0.7;
              ctx.fillStyle = `rgba(239, 68, 68, ${laserGlow})`;
              ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 8, TILE_SIZE - 4, 3);
              ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 15, TILE_SIZE - 4, 3);
              ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 22, TILE_SIZE - 4, 3);

              ctx.fillStyle = '#fee2e2';
              ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🔒 KUNCI', c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + 15);
            }
            continue;
          }

          const img = this.tileSprites[tile] || this.tileSprites[0];
          ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE);
        }
      }

      // B. Lukis Halangan Tumpahan Bahan Kimia (HD Dynamic Puddles)
      this.hazards.forEach((h) => {
        ctx.save();
        const pulse = Math.sin(time * 0.006 + h.x) * 2;
        if (h.type === 'biohazard') {
          // Zon pencemaran biohazard ungu berpendar
          const grad = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.radius + pulse);
          grad.addColorStop(0, 'rgba(192, 132, 252, 0.7)');
          grad.addColorStop(0.7, 'rgba(147, 51, 234, 0.45)');
          grad.addColorStop(1, 'rgba(107, 33, 168, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Lencana amaran
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.beginPath();
          ctx.roundRect(h.x - 28, h.y - 7, 56, 14, 7);
          ctx.fill();
          ctx.fillStyle = '#f3e8ff';
          ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚠️ BIOHAZARD', h.x, h.y);
        } else {
          // Tumpahan asid hijau neon berkilat
          const grad = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.radius + pulse);
          grad.addColorStop(0, 'rgba(134, 239, 172, 0.75)');
          grad.addColorStop(0.7, 'rgba(34, 197, 94, 0.5)');
          grad.addColorStop(1, 'rgba(21, 128, 61, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.beginPath();
          ctx.roundRect(h.x - 20, h.y - 7, 40, 14, 7);
          ctx.fill();
          ctx.fillStyle = '#dcfce7';
          ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚠️ ASID', h.x, h.y);
        }
        ctx.restore();
      });

      // C. Lukis Robot Pembersih Makmal Ronda
      this.robots.forEach((bot) => {
        // Lukis sprite robot HD
        ctx.drawImage(this.robotSprite, bot.x - 16, bot.y - 16);

        // Amaran laser pengimbas merah beranimasi di hadapan robot
        ctx.save();
        const laserLen = 32;
        const laserPulse = Math.sin(time * 0.01 + bot.x) * 0.25 + 0.6;
        ctx.strokeStyle = `rgba(239, 68, 68, ${laserPulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (bot.axis === 'x') {
          ctx.moveTo(bot.x, bot.y);
          ctx.lineTo(bot.x + bot.dir * laserLen, bot.y);
        } else {
          ctx.moveTo(bot.x, bot.y);
          ctx.lineTo(bot.x, bot.y + bot.dir * laserLen);
        }
        ctx.stroke();
        ctx.restore();
      });

      // D. Lukis Power-ups (HD Floating Orbs with Aura)
      this.powerups.forEach((p) => {
        if (!p.collected) {
          const bob = Math.sin(time * 0.005 + p.bobOffset) * 4;

          // Lingkaran aura bercahaya
          ctx.save();
          const haloColor = p.type === 'speed' ? 'rgba(234, 179, 8, 0.35)' : p.type === 'shield' ? 'rgba(6, 182, 212, 0.35)' : 'rgba(239, 68, 68, 0.3)';
          ctx.fillStyle = haloColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y + bob, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          const sprite = this.powerupSprites[p.type];
          if (sprite) {
            ctx.drawImage(sprite, p.x - 18, p.y - 18 + bob);
          }

          // Label nama kuasa HD
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.beginPath();
          ctx.roundRect(p.x - 24, p.y - 27 + bob, 48, 12, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.name.split(' ')[0], p.x, p.y - 21 + bob);
          ctx.restore();
        }
      });

      // E. Lukis 10 Objek & Sampel Sains (HD Sprites with Glowing Aura & High-Contrast Badges)
      this.samples.forEach((s) => {
        if (!s.collected) {
          const bob = Math.sin(time * 0.005 + s.bobOffset) * 4;

          // Soft Glowing Aura
          ctx.save();
          const grad = ctx.createRadialGradient(s.x, s.y + bob, 2, s.x, s.y + bob, 20);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
          grad.addColorStop(0.7, 'rgba(13, 148, 136, 0.25)');
          grad.addColorStop(1, 'rgba(13, 148, 136, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y + bob, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Lukis sprite spesimen sains HD (40x40 berpusat pada sampel)
          const spr = this.sampleSprites[s.type] || this.sampleSprites.animal_cell;
          ctx.drawImage(spr, s.x - 20, s.y - 20 + bob);

          // Tag Nombor Soalan HD (Q1 - Q10) - Jelas, Kontras Tinggi & Tidak Mengaburi Objek
          ctx.save();
          const tagW = 34;
          const tagH = 13;
          ctx.fillStyle = '#0f766e'; // Teal gelap
          ctx.strokeStyle = '#5eead4'; // Border cerah
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(s.x - tagW / 2, s.y - 30 + bob, tagW, tagH, 6.5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Q${s.questionId}`, s.x, s.y - 23.5 + bob);
          ctx.restore();
        } else {
          // Tanda semak hijau kemas apabila sampel telah dikutip
          ctx.save();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
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

      // G. Lukis Pemain (Avatar Saintis Muda HD)
      const p = this.player;

      // Jika kebal (flicker berkedip)
      const isFlicker = p.invulnerableTimer > 0 && Math.floor(time * 0.02) % 2 === 0;
      if (!isFlicker) {
        const sprite = this.playerSprites[p.direction][p.animFrame];
        ctx.drawImage(sprite, p.x - 16, p.y - 28);
      }

      // Jika ada Perisai Keselamatan aktif: gelang tenaga sian berputar
      if (p.hasShield) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.arc(p.x, p.y - 12, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.beginPath();
        ctx.arc(p.x, p.y - 12, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Tag Nama Pemain di atas Watak
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      const nameWidth = ctx.measureText(p.name).width + 14;
      ctx.beginPath();
      ctx.roundRect(p.x - nameWidth / 2, p.y - 44, nameWidth, 14, 7);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
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
      ctx.fillRect(archX + 8, archY + 4, archW - 16, 16);
      ctx.strokeStyle = isUnlocked ? '#34d399' : '#5eead4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(archX + 8, archY + 4, archW - 16, 16);

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

    // =========================================================================
    // 10. KAWALAN GELUNG UTAMA (LOOP)
    // =========================================================================
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
