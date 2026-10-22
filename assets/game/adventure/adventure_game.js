/**
 * ARSelNel 2D Open World Quiz Adventure - Game Engine & Renderer
 * Engine Canvas 2D: Physics, Camera, Collision, Sprite Animations & Particles
 */

(function(global) {
  'use strict';

  const { MAP_COLS, MAP_ROWS, TILE_SIZE, QUESTIONS, BURGER_LOCATIONS, generateCampusMap, Audio, GameState } = global.ARSelNelAdventure;

  class AdventureGameEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = options;

      this.worldWidth = MAP_COLS * TILE_SIZE; // 1536 px
      this.worldHeight = MAP_ROWS * TILE_SIZE; // 1152 px

      this.map = generateCampusMap();

      // Camera
      this.camera = { x: 0, y: 0, width: 800, height: 600 };

      // Pemain
      this.player = {
        x: 19 * TILE_SIZE, // Mula berdekatan Dataran Utama
        y: 19 * TILE_SIZE,
        width: 22,
        height: 28,
        speed: 155, // px per saat
        direction: 'down', // 'down', 'up', 'left', 'right'
        isMoving: false,
        animFrame: 0,
        animTimer: 0,
        stepSoundTimer: 0,
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

      // Burgers
      this.burgers = BURGER_LOCATIONS.map((loc, idx) => ({
        id: idx + 1,
        questionId: loc.questionId,
        x: loc.col * TILE_SIZE + TILE_SIZE / 2,
        y: loc.row * TILE_SIZE + TILE_SIZE / 2,
        zone: loc.zone,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      }));

      // Partikel
      this.particles = [];

      // Keadaan permainan (Bermula dalam mod READY sebelum pemain menekan Mula)
      this.state = GameState ? GameState.READY : 'ready';
      this.isPaused = true;
      this.lastTime = 0;
      this.finishCooldown = 0;
      this.animReqId = null;

      // Event Callbacks
      this.onBurgerTrigger = options.onBurgerTrigger || (() => {});
      this.onFinishZoneTrigger = options.onFinishZoneTrigger || (() => {});
      this.onPlayerMove = options.onPlayerMove || (() => {});

      // Sediakan cache tekstur tile & sprite
      this.tileSprites = this.createTileTextures();
      this.playerSprites = this.createPlayerSprites();
      this.burgerSprite = this.createBurgerSprite();

      // Dengar input keyboard & resize
      this.initInput();
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }

    // 1. Cipta tekstur pixel art secara procedur (100% tepat, resolusi tajam)
    createTileTextures() {
      const textures = {};
      const size = TILE_SIZE;

      // Fungsi bantuan cipta canvas kecil
      const makeCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 0: Rumput (Grass)
      textures[0] = makeCanvas((c) => {
        c.fillStyle = '#4ade80'; // Emerald/green
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#22c55e';
        c.fillRect(4, 6, 2, 4);
        c.fillRect(18, 12, 2, 4);
        c.fillRect(10, 24, 2, 4);
        c.fillRect(26, 22, 2, 4);
        c.fillStyle = '#86efac';
        c.fillRect(5, 5, 2, 2);
        c.fillRect(19, 11, 2, 2);
        // Wildflower kecil
        c.fillStyle = '#fef08a';
        c.fillRect(24, 8, 2, 2);
      });

      // 1: Laluan Batu Cobblestone
      textures[1] = makeCanvas((c) => {
        c.fillStyle = '#e2e8f0'; // Slate light
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

      // 2: Jubin Lantai Makmal (Glossy Lab Tiles)
      textures[2] = makeCanvas((c) => {
        c.fillStyle = '#f1f5f9';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#e2eaf4';
        c.fillRect(0, 0, size, 1);
        c.fillRect(0, 0, 1, size);
        c.fillStyle = '#0d9488';
        c.fillRect(15, 15, 2, 2); // Aksen teal makmal
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

      // 4: Dataran Jubin Mar-mar (Plaza)
      textures[4] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#e2e8f0';
        c.strokeRect(0, 0, size, size);
        c.fillStyle = '#e0f2fe';
        c.fillRect(4, 4, 24, 24);
      });

      // 10: Dinding Bata Luar (SOLID)
      textures[10] = makeCanvas((c) => {
        c.fillStyle = '#334155'; // Slate dark
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

      // 12: Pagar / Pokok Renek (Hedge - SOLID)
      textures[12] = makeCanvas((c) => {
        c.fillStyle = '#15803d'; // Green hedge
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

      // 13: Meja Makmal / Console (SOLID)
      textures[13] = makeCanvas((c) => {
        c.fillStyle = '#64748b';
        c.fillRect(2, 4, size - 4, size - 8);
        c.fillStyle = '#94a3b8';
        c.fillRect(4, 6, size - 8, 6);
        // Beaker & kelalang
        c.fillStyle = '#38bdf8';
        c.fillRect(8, 14, 4, 6);
        c.fillStyle = '#ec4899';
        c.fillRect(18, 14, 4, 6);
      });

      // 14: Pokok Rendang Besar (SOLID)
      textures[14] = makeCanvas((c) => {
        // Shadow bawah
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath();
        c.ellipse(16, 26, 12, 5, 0, 0, Math.PI * 2);
        c.fill();
        // Batang pokok
        c.fillStyle = '#78350f';
        c.fillRect(13, 16, 6, 12);
        // Rimbunan daun
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

      // 15: Kolam Air Pancut (SOLID)
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

      // 16: Dinding Rumah Hijau (Glass Pane - SOLID)
      textures[16] = makeCanvas((c) => {
        c.fillStyle = '#15803d';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#dcfce7';
        c.fillRect(2, 2, size - 4, size - 4);
        c.strokeStyle = '#86efac';
        c.lineWidth = 1;
        c.strokeRect(4, 4, size - 8, size - 8);
      });

      // 17: Mikroskop / Stesen Eksperimen (SOLID)
      textures[17] = makeCanvas((c) => {
        c.fillStyle = '#475569';
        c.fillRect(2, 4, size - 4, size - 8);
        c.fillStyle = '#e2e8f0';
        // Bentuk mikroskop
        c.fillRect(14, 8, 4, 12);
        c.fillRect(10, 18, 12, 3);
        c.fillStyle = '#0ea5e9';
        c.fillRect(16, 6, 6, 3);
      });

      // 20: Jubin FINISH Checkered (Walkable)
      textures[20] = makeCanvas((c) => {
        const sq = size / 4;
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 4; y++) {
            c.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#ffffff';
            c.fillRect(x * sq, y * sq, sq, sq);
          }
        }
        c.fillStyle = 'rgba(251, 191, 36, 0.45)'; // Amber gold tint
        c.fillRect(0, 0, size, size);
      });

      // 21: Tiang Pintu Gerbang FINISH (SOLID)
      textures[21] = makeCanvas((c) => {
        c.fillStyle = '#d97706'; // Emas tembaga
        c.fillRect(4, 0, size - 8, size);
        c.fillStyle = '#fbbf24';
        c.fillRect(6, 2, 4, size - 4);
        c.fillStyle = '#78350f';
        c.fillRect(4, size - 4, size - 8, 4);
      });

      return textures;
    }

    // 2. Sprite watak pelajar comel 4-arah (Down, Up, Left, Right)
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
          cx.fillStyle = '#ffffff'; // Kot lab putih
          cx.fillRect(9, 15 + bob, 4, 13);
          cx.fillRect(19, 15 + bob, 4, 13);

          // Tali leher / lencana
          cx.fillStyle = '#0f766e';
          cx.fillRect(14, 17 + bob, 4, 4);

          // Kepala (Kulit cerah)
          cx.fillStyle = '#fed7aa';
          cx.fillRect(10, 7 + bob, 12, 10);

          // Rambut Coklat Kemas Pelajar
          cx.fillStyle = '#451a03';
          cx.fillRect(9, 4 + bob, 14, 5);
          cx.fillRect(8, 7 + bob, 3, 5);
          cx.fillRect(21, 7 + bob, 3, 5);

          // Mata & Wajah
          cx.fillStyle = '#1e293b';
          if (dir === 'down') {
            cx.fillRect(12, 10 + bob, 2, 3);
            cx.fillRect(18, 10 + bob, 2, 3);
            // Senyuman
            cx.fillStyle = '#e11d48';
            cx.fillRect(15, 14 + bob, 2, 1);
          } else if (dir === 'left') {
            cx.fillRect(10, 10 + bob, 2, 3);
          } else if (dir === 'right') {
            cx.fillRect(20, 10 + bob, 2, 3);
          } else if (dir === 'up') {
            // Rambut belakang penuh
            cx.fillStyle = '#451a03';
            cx.fillRect(9, 5 + bob, 14, 10);
          }

          sprites[dir].push(c);
        }
      });

      return sprites;
    }

    // 3. Sprite Burger Pixel Art Comel & Menyelerakan
    createBurgerSprite() {
      const c = document.createElement('canvas');
      c.width = 30;
      c.height = 30;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = false;

      // Bayang bawah
      cx.fillStyle = 'rgba(0,0,0,0.25)';
      cx.beginPath();
      cx.ellipse(15, 26, 11, 3.5, 0, 0, Math.PI * 2);
      cx.fill();

      // Roti Bawah (Golden Brown Bun)
      cx.fillStyle = '#d97706';
      cx.fillRect(5, 20, 20, 4);
      cx.fillStyle = '#f59e0b';
      cx.fillRect(6, 21, 18, 2);

      // Daging Patty Coklat Gelap
      cx.fillStyle = '#78350f';
      cx.fillRect(4, 16, 22, 4);

      // Keju Kuning Meleleh (Melted Cheddar Cheese)
      cx.fillStyle = '#facc15';
      cx.fillRect(4, 14, 22, 2);
      cx.fillRect(6, 16, 3, 2); // Lelehan keju
      cx.fillRect(18, 16, 3, 3);

      // Daun Salad Hijau Segar (Lettuce)
      cx.fillStyle = '#22c55e';
      cx.fillRect(3, 12, 24, 2);
      cx.fillStyle = '#4ade80';
      cx.fillRect(5, 12, 3, 1);
      cx.fillRect(14, 12, 4, 1);
      cx.fillRect(21, 12, 3, 1);

      // Tomato Merah
      cx.fillStyle = '#ef4444';
      cx.fillRect(5, 10, 20, 2);

      // Roti Atas Bulat (Top Bun)
      cx.fillStyle = '#f59e0b';
      cx.beginPath();
      cx.arc(15, 9, 10, Math.PI, 0);
      cx.fill();
      cx.fillStyle = '#d97706';
      cx.fillRect(5, 8, 20, 2);

      // Biji Bijan Putih (Sesame Seeds)
      cx.fillStyle = '#ffffff';
      cx.fillRect(10, 4, 2, 1);
      cx.fillRect(17, 3, 2, 1);
      cx.fillRect(14, 6, 2, 1);
      cx.fillRect(8, 7, 2, 1);
      cx.fillRect(20, 6, 2, 1);

      return c;
    }

    // 4. Input Keyboard & Touch Joystick
    initInput() {
      // Keyboard
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

    // Set virtual vector daripada UI Joystick/Dpad
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
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const w = Math.floor(rect.width);
      // Hadkan ketinggian mengikut saiz tingkap (antara 420px hingga 680px)
      const h = Math.min(Math.max(460, window.innerHeight - 200), 720);

      this.canvas.width = w;
      this.canvas.height = h;

      this.camera.width = w;
      this.camera.height = h;
      this.ctx.imageSmoothingEnabled = false;
    }

    // 5. Semakan Pelanggaran Solid Wall (AABB vs Tile Grid)
    isSolidTile(col, row) {
      if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
      const tile = this.map[row][col];
      // Tile 10 ke atas adalah pepejal (solid), kecuali tile 20 (Finish Checkered)
      return tile >= 10 && tile !== 20;
    }

    checkCollision(newX, newY) {
      const halfW = this.player.width / 2;
      const h = this.player.height;

      // Titik kotak sempadan kaki watak (hitbox di bahagian tapak kaki)
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

    // 6. Kemas Kini Fizik Watak & Interaksi
    update(dt) {
      if (this.isPaused) return;

      if (this.finishCooldown > 0) {
        this.finishCooldown -= dt;
      }

      // Tentukan vektor pergerakan
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

      // Normalisasikan pergerakan pepenjuru
      const len = Math.hypot(moveX, moveY);
      this.player.isMoving = len > 0.1;

      if (this.player.isMoving) {
        const normX = (moveX / len);
        const normY = (moveY / len);

        // Tentukan arah hadapan
        if (Math.abs(normX) > Math.abs(normY)) {
          this.player.direction = normX > 0 ? 'right' : 'left';
        } else {
          this.player.direction = normY > 0 ? 'down' : 'up';
        }

        const delta = this.player.speed * dt;
        const targetX = this.player.x + normX * delta;
        const targetY = this.player.y + normY * delta;

        // Sliding collision resolution (gerakkan paksi X, kemudian paksi Y secara bebas)
        if (!this.checkCollision(targetX, this.player.y)) {
          this.player.x = targetX;
        }
        if (!this.checkCollision(this.player.x, targetY)) {
          this.player.y = targetY;
        }

        // Kitaran animasi kaki
        this.player.animTimer += dt * 10;
        this.player.animFrame = Math.floor(this.player.animTimer) % 4;

        // Bunyi tapak kaki
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

      // Kemas kini Kamera (Ikut pemain dengan lerp licin)
      const targetCamX = this.player.x - this.camera.width / 2;
      const targetCamY = this.player.y - this.camera.height / 2;

      this.camera.x += (targetCamX - this.camera.x) * 0.12;
      this.camera.y += (targetCamY - this.camera.y) * 0.12;

      // Hadkan kamera kepada sempadan dunia
      this.camera.x = Math.max(0, Math.min(this.worldWidth - this.camera.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.worldHeight - this.camera.height, this.camera.y));

      // 7. Semak Kutipan Burger
      this.burgers.forEach(b => {
        if (!b.collected) {
          const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
          if (dist < 26) {
            // Kutip burger!
            b.collected = true;
            this.spawnCollectBurst(b.x, b.y);
            Audio.playCollect();
            this.setState(GameState ? GameState.QUESTION : 'question');

            const qData = QUESTIONS.find(q => q.id === b.questionId);
            this.onBurgerTrigger(b, qData);
          }
        }
      });

      // 8. Semak Zon FINISH (Tile 20)
      const currentTileCol = Math.floor(this.player.x / TILE_SIZE);
      const currentTileRow = Math.floor(this.player.y / TILE_SIZE);

      if (
        currentTileCol >= 0 && currentTileCol < MAP_COLS &&
        currentTileRow >= 0 && currentTileRow < MAP_ROWS
      ) {
        if (this.map[currentTileRow][currentTileCol] === 20 && this.finishCooldown <= 0) {
          this.finishCooldown = 2.5; // Elak cetusan berulang dalam selang masa singkat
          const collectedCount = this.burgers.filter(b => b.collected).length;
          const isComplete = collectedCount === this.burgers.length;

          if (isComplete) {
            this.setState(GameState ? GameState.COMPLETED : 'completed');
            Audio.playVictory();
            this.spawnVictoryConfetti();
          }
          this.onFinishZoneTrigger(isComplete, collectedCount, this.burgers.length);
        }
      }

      // 9. Kemas kini Partikel
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

    // Cipta percikan partikel kutipan burger
    spawnCollectBurst(x, y) {
      const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#38bdf8'];
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

    // Cipta konfeti kemenangan
    spawnVictoryConfetti() {
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < 80; i++) {
        this.particles.push({
          x: this.player.x - 100 + Math.random() * 200,
          y: this.player.y - 120 + Math.random() * 40,
          vx: -50 + Math.random() * 100,
          vy: 40 + Math.random() * 120,
          size: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 2.5 + Math.random() * 1.5
        });
      }
    }

    // 10. Render Seluruh Dunia Permainan
    render(time) {
      const ctx = this.ctx;
      const cam = this.camera;

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.save();
      ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));

      // Kira julat tile kelihatan dalam viewport kamera
      const startCol = Math.max(0, Math.floor(cam.x / TILE_SIZE));
      const endCol = Math.min(MAP_COLS - 1, Math.ceil((cam.x + cam.width) / TILE_SIZE));
      const startRow = Math.max(0, Math.floor(cam.y / TILE_SIZE));
      const endRow = Math.min(MAP_ROWS - 1, Math.ceil((cam.y + cam.height) / TILE_SIZE));

      // A. Lukis Lantai & Dinding (Tile Map)
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tile = this.map[r][c];
          const img = this.tileSprites[tile] || this.tileSprites[0];
          ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE);
        }
      }

      // B. Lukis Pintu Gerbang FINISH (Archway & Banners)
      this.drawFinishArchway(ctx);

      // C. Lukis Burger Collectibles
      this.burgers.forEach(b => {
        if (!b.collected) {
          const bob = Math.sin(time * 0.005 + b.bobOffset) * 4;
          // Aura cahaya keemasan berkelip
          ctx.save();
          ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
          ctx.beginPath();
          ctx.arc(b.x, b.y + bob, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Lukis Burger
          ctx.drawImage(this.burgerSprite, b.x - 15, b.y - 15 + bob);

          // Tag Nombor Soalan Kecil
          ctx.save();
          ctx.fillStyle = '#0f766e';
          ctx.beginPath();
          ctx.roundRect(b.x - 14, b.y - 28 + bob, 28, 12, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`Q${b.questionId}`, b.x, b.y - 22 + bob);
          ctx.restore();
        } else {
          // Tanda semak hijau selepas dikutip
          ctx.save();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', b.x, b.y);
          ctx.restore();
        }
      });

      // D. Lukis Pemain (Avatar)
      const p = this.player;
      const sprite = this.playerSprites[p.direction][p.animFrame];
      ctx.drawImage(sprite, p.x - 16, p.y - 28);

      // Tag Nama Pemain di atas Watak
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      const nameWidth = ctx.measureText(p.name).width + 12;
      ctx.beginPath();
      ctx.roundRect(p.x - nameWidth / 2, p.y - 42, nameWidth, 14, 7);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.name, p.x, p.y - 35);
      ctx.restore();

      // E. Lukis Partikel
      this.particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // Lukis Hiasan Gerbang Penamat
    drawFinishArchway(ctx) {
      const archX = 21 * TILE_SIZE;
      const archY = 1 * TILE_SIZE;
      const archW = 7 * TILE_SIZE;

      // Banner "ZON PENAMAT"
      ctx.save();
      ctx.fillStyle = '#d97706'; // Golden amber
      ctx.fillRect(archX + 16, archY + 4, archW - 32, 16);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(archX + 16, archY + 4, archW - 32, 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏁 PINTU GERBANG PENAMAT 🏁', archX + archW / 2, archY + 12);

      // Lampu neon berkelip di atas tiang
      const glow = Math.sin(Date.now() * 0.006) * 4 + 8;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(archX + 12, archY + 10, glow, 0, Math.PI * 2);
      ctx.arc(archX + archW - 12, archY + 10, glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 11. Gelung Utama Permainan (Game Loop)
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
      this.burgers.forEach(b => { b.collected = false; });
      this.particles = [];
      this.finishCooldown = 0;
      this.resetInputs();
    }
  }

  global.ARSelNelAdventure.AdventureGameEngine = AdventureGameEngine;

})(window);
