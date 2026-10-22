/**
 * ARSelNel - Maze Chase 2D: Misi Sel Haiwan & Tumbuhan
 * Enhanced 2D Canvas Arcade Game Engine
 * Features:
 * - Dynamic Maze Switching: 10 distinct, validated layouts (Task 4)
 * - Intelligent Virus AI with exact detection ranges: Green (3 tiles), Purple (7 tiles), Red (10 tiles) (Task 5)
 * - AI State Machine: PATROL, CHASE, RETURN (Task 6)
 * - Visual Detection Feedback: Exclamation alert badge & pulsing aura (Task 7)
 * - Walkable-path tile distance checking (walls strictly respected)
 * - Corner-assist player movement & temporary invulnerability
 * - Performance optimized: throttled pathfinding with zero unnecessary allocations (Task 12)
 * - Maze transition animations (Task 9)
 */

(function(global) {
  'use strict';

  const {
    GameState,
    EnemyState,
    VIRUS_CONFIG,
    POWERUP_CONFIG,
    parseMazeGrid,
    findShortestPathBFS,
    getWalkableTileDistance,
    Audio
  } = global.ARSelNelMazeData;

  class MazeGameEngine {
    constructor(canvas, callbacks = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.callbacks = callbacks; // { onZoneEnter, onVirusHit, onTransitionComplete, onPowerupCollect, onExtraLife, onShieldAbsorb, onTeleport }

      // Dimensi Grid & Saiz Maya (Virtual Resolution)
      this.cols = 23;
      this.rows = 17;
      this.tileSize = 32;
      this.virtualWidth = this.cols * this.tileSize;
      this.virtualHeight = this.rows * this.tileSize;

      // Data Peta Maze Semasa
      this.currentLayoutIndex = 0;
      this.currentQuestionIndex = 0;
      this.mapData = null;
      this.grid = [];
      this.answerZones = {};
      this.activeQuestion = null;

      // Pasangan Portal Teleport (Task 3)
      this.portals = { A: null, B: null };
      this.teleportCooldown = 0; // Cooldown 1.5s untuk mengelak loop bolak-balik

      // Koleksi Power-Up & Status Aktif (Task 4 & 5)
      this.powerups = [];
      this.activePowerups = {
        speedTimer: 0,      // ⚡ Pecutan Saintis (+50% kelajuan, 3s)
        virusFreezeTimer: 0,// ❄️ Pembeku Virus (3s)
        radarTimer: 0,      // 📡 Radar Saintis (5s)
        hasShield: false    // 🛡️ Perisai Sel (Menahan 1 hit)
      };

      // Sistem Penyingkiran Jawapan Salah (Task 6)
      this.eliminatedZones = new Set();

      // Pemain (Student Avatar)
      this.player = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        speed: 135, // pixels per second base speed
        radius: 12,
        direction: 'down',
        desiredDirection: null,
        isMoving: false,
        walkAnimTimer: 0,
        invulnerableTimer: 0,
        active: true
      };

      // Musuh Virus (3 Cartoon Viruses dengan State Machine)
      this.enemies = [];

      // Sistem Partikel & Kesan Visual
      this.particles = [];

      // Keadaan Transisi Antara Maze
      this.transitionAlpha = 0; // 0 = jelas, 1 = gelap sepenuhnya
      this.transitioning = false;
      this.transitionMessage = '';

      // Keadaan Enjin
      this.running = false;
      this.paused = false;
      this.lastTime = 0;
      this.animFrameId = null;
      this.currentQuestionData = null;

      this.initLayout(0, 0);
      this.initEvents();
      this.handleResize();
    }

    setQuestionData(qData) {
      this.currentQuestionData = qData;
    }

    // 1. Muatkan Reka Bentuk Maze (Menukar susunan dinding, koridor, zon jawapan, portal & power-up)
    initLayout(layoutIndex = 0, questionIndex = 0) {
      this.currentLayoutIndex = layoutIndex;
      this.currentQuestionIndex = questionIndex;
      this.mapData = parseMazeGrid(layoutIndex, questionIndex);
      this.grid = this.mapData.grid;
      this.cols = this.mapData.cols;
      this.rows = this.mapData.rows;
      this.answerZones = this.mapData.answerZones;

      // Inisialisasi portal & power-up untuk pusingan ini
      this.portals = this.mapData.portals || { A: null, B: null };
      this.powerups = (this.mapData.powerups || []).map(p => ({ ...p, collected: false }));
      this.teleportCooldown = 0;

      // Set semula pemasa powerup untuk pusingan baharu (termasuk perisai jika ada)
      this.activePowerups.speedTimer = 0;
      this.activePowerups.virusFreezeTimer = 0;
      this.activePowerups.radarTimer = 0;
      this.activePowerups.hasShield = false;

      // Kosongkan zon jawapan yang disingkirkan untuk soalan baharu
      this.eliminatedZones.clear();

      this.resetPlayerToSpawn();
      this.initEnemies();
    }

    // Set semula kedudukan pemain ke titik selamat maze semasa
    resetPlayerToSpawn() {
      const spawn = this.mapData.playerSpawn;
      this.player.x = (spawn.x + 0.5) * this.tileSize;
      this.player.y = (spawn.y + 0.5) * this.tileSize;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.direction = 'up';
      this.player.desiredDirection = null;
      this.player.isMoving = false;
      this.player.invulnerableTimer = 2.5; // Kebal 2.5 saat semasa spawn
    }

    // 2. Inisialisasi 3 Musuh Virus dengan Konfigurasi Lengkap (Task 5 & 6)
    initEnemies() {
      const spawns = this.mapData.enemySpawns;

      this.enemies = [
        // 1. Virus Hijau (Spike Patrol: Jarak 3 Jubin, Random Patrol, Shortest-Path Chase)
        this.createEnemy('green', spawns.green.x, spawns.green.y),
        // 2. Virus Ungu (Wanderer: Jarak 6 Jubin, Random Patrol, Pathfinding Chase)
        this.createEnemy('purple', spawns.purple.x, spawns.purple.y),
        // 3. Virus Merah (Hunter: Jarak 9 Jubin, Random Patrol, BFS Shortest-Path Chase)
        this.createEnemy('red', spawns.red.x, spawns.red.y)
      ];
    }

    createEnemy(typeKey, tileX, tileY) {
      const cfg = VIRUS_CONFIG[typeKey];
      return {
        id: cfg.id,
        name: cfg.name,
        type: typeKey,
        cfg: cfg,
        x: (tileX + 0.5) * this.tileSize,
        y: (tileY + 0.5) * this.tileSize,
        tileX: tileX,
        tileY: tileY,
        vx: 0,
        vy: 0,
        speed: cfg.baseSpeed,
        radius: 12,
        direction: 'left',
        state: EnemyState.RANDOM_PATROL,
        stateTimer: 0,
        active: true,

        // Sistem Laluan AI
        currentPath: [], // Array [{x, y}, ...] dalam kiraan jubin
        pathIndex: 0,
        pathCooldown: 0, // Masa bertenang sebelum semakan BFS seterusnya
        disengageTimer: 0,
        alertAnimationTimer: 0, // Animasi tanda seru (!) apabila mengesan murid
        lastDecisionTile: null,

        animTimer: 0
      };
    }

    // Kemas kini kelajuan dan kesiapsiagaan virus mengikut soalan semasa (Semua 3 virus aktif & meronda!)
    updateDifficultyForQuestion(qIndex) {
      // Ketiga-tiga virus aktif dan meronda lorong maze secara rawak sejak pusingan pertama
      const speedScale = 1 + Math.min(qIndex, 9) * 0.025; // Peningkatan kelajuan progresif yang halus

      this.enemies[0].active = true;
      this.enemies[0].speed = VIRUS_CONFIG.green.baseSpeed * speedScale;

      this.enemies[1].active = true;
      this.enemies[1].speed = VIRUS_CONFIG.purple.baseSpeed * speedScale;

      this.enemies[2].active = true;
      this.enemies[2].speed = VIRUS_CONFIG.red.baseSpeed * speedScale;

      // Set semula posisi virus ke spawn layout semasa
      const spawns = this.mapData.enemySpawns;
      this.enemies[0].x = (spawns.green.x + 0.5) * this.tileSize;
      this.enemies[0].y = (spawns.green.y + 0.5) * this.tileSize;
      this.enemies[0].state = EnemyState.RANDOM_PATROL;
      this.enemies[0].stateTimer = 0;
      this.enemies[0].currentPath = [];
      this.enemies[0].lastDecisionTile = null;

      this.enemies[1].x = (spawns.purple.x + 0.5) * this.tileSize;
      this.enemies[1].y = (spawns.purple.y + 0.5) * this.tileSize;
      this.enemies[1].state = EnemyState.RANDOM_PATROL;
      this.enemies[1].stateTimer = 0;
      this.enemies[1].currentPath = [];
      this.enemies[1].lastDecisionTile = null;

      this.enemies[2].x = (spawns.red.x + 0.5) * this.tileSize;
      this.enemies[2].y = (spawns.red.y + 0.5) * this.tileSize;
      this.enemies[2].state = EnemyState.RANDOM_PATROL;
      this.enemies[2].stateTimer = 0;
      this.enemies[2].currentPath = [];
      this.enemies[2].lastDecisionTile = null;
    }

    // 3. Peralihan Animasi Maze Baharu (Task 9)
    transitionToNextMaze(nextLayoutIndex, message = 'Tahniah! Bersedia untuk Maze Seterusnya!', onComplete, nextQuestionIndex = null) {
      this.transitioning = true;
      this.transitionMessage = message;
      this.pause();

      Audio.playTransition();

      // Fasa 1: Fade out (0.35s)
      let t = 0;
      const fadeOutInterval = setInterval(() => {
        t += 0.08;
        this.transitionAlpha = Math.min(1, t);
        if (t >= 1) {
          clearInterval(fadeOutInterval);

          // Muatkan reka bentuk maze baharu dengan indeks susun atur dan indeks soalan tepat
          const qIdx = nextQuestionIndex !== null ? nextQuestionIndex : nextLayoutIndex;
          this.initLayout(nextLayoutIndex, qIdx);
          if (this.callbacks.onLayoutLoaded) {
            this.callbacks.onLayoutLoaded(nextLayoutIndex);
          }

          // Fasa 2: Fade in (0.35s)
          setTimeout(() => {
            let tin = 1;
            const fadeInInterval = setInterval(() => {
              tin -= 0.08;
              this.transitionAlpha = Math.max(0, tin);
              if (tin <= 0) {
                clearInterval(fadeInInterval);
                this.transitioning = false;
                this.resume();
                if (onComplete) onComplete();
              }
            }, 30);
          }, 250);
        }
      }, 30);
    }

    // 4. Kawalan Input
    initEvents() {
      window.addEventListener('keydown', (e) => {
        if (!this.running || this.paused || this.transitioning) return;

        const code = e.code;
        if (code === 'KeyW' || code === 'ArrowUp') {
          this.setDirection('up');
          e.preventDefault();
        } else if (code === 'KeyS' || code === 'ArrowDown') {
          this.setDirection('down');
          e.preventDefault();
        } else if (code === 'KeyA' || code === 'ArrowLeft') {
          this.setDirection('left');
          e.preventDefault();
        } else if (code === 'KeyD' || code === 'ArrowRight') {
          this.setDirection('right');
          e.preventDefault();
        }
      });

      window.addEventListener('resize', () => this.handleResize());
    }

    setDirection(dir) {
      this.player.desiredDirection = dir;
    }

    handleResize() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.scaleX = this.canvas.width / this.virtualWidth;
      this.scaleY = this.canvas.height / this.virtualHeight;
    }

    // 5. Semakan Dinding & Ketercapaian
    isWalkable(pixelX, pixelY, radius = 10) {
      const tileCol = Math.floor(pixelX / this.tileSize);
      const tileRow = Math.floor(pixelY / this.tileSize);

      if (tileCol < 0 || tileCol >= this.cols || tileRow < 0 || tileRow >= this.rows) {
        return false;
      }

      const offsets = [
        { x: -radius, y: -radius },
        { x: radius, y: -radius },
        { x: -radius, y: radius },
        { x: radius, y: radius }
      ];

      for (let i = 0; i < offsets.length; i++) {
        const checkX = pixelX + offsets[i].x;
        const checkY = pixelY + offsets[i].y;
        const c = Math.floor(checkX / this.tileSize);
        const r = Math.floor(checkY / this.tileSize);
        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return false;
        if (this.grid[r][c] === 1) return false;
      }

      return true;
    }

    isTileWalkable(col, row) {
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
      return this.grid[row][col] === 0;
    }

    // 6. Pergerakan Pemain dengan Corner-Assist, Portals & Power-Ups (Task 3, 4 & 5)
    updatePlayer(dt) {
      const p = this.player;
      if (!p.active) return;

      if (p.invulnerableTimer > 0) {
        p.invulnerableTimer -= dt;
      }

      // Kurangkan cooldown teleport jika aktif (Task 3)
      if (this.teleportCooldown > 0) {
        this.teleportCooldown -= dt;
      }

      // Kurangkan pemasa aktif power-up (Task 4)
      if (this.activePowerups.speedTimer > 0) {
        this.activePowerups.speedTimer -= dt;
      }
      if (this.activePowerups.virusFreezeTimer > 0) {
        this.activePowerups.virusFreezeTimer -= dt;
      }
      if (this.activePowerups.radarTimer > 0) {
        this.activePowerups.radarTimer -= dt;
      }

      const dirVectors = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
      };

      // Kelajuan pemain: +50% jika Pecutan Saintis aktif (Task 4)
      const currentSpeed = (this.activePowerups.speedTimer > 0 ? 1.5 : 1.0) * p.speed;

      if (p.desiredDirection) {
        const vec = dirVectors[p.desiredDirection];
        const testDistance = 8;
        const targetX = p.x + vec.x * testDistance;
        const targetY = p.y + vec.y * testDistance;

        if (this.isWalkable(targetX, targetY, p.radius)) {
          p.direction = p.desiredDirection;
          p.desiredDirection = null;
        } else {
          const currentTileCol = Math.floor(p.x / this.tileSize);
          const currentTileRow = Math.floor(p.y / this.tileSize);
          const centerTileX = (currentTileCol + 0.5) * this.tileSize;
          const centerTileY = (currentTileRow + 0.5) * this.tileSize;

          if (p.desiredDirection === 'up' || p.desiredDirection === 'down') {
            const diffX = centerTileX - p.x;
            if (Math.abs(diffX) < 14) {
              const nudgeX = Math.sign(diffX) * Math.min(Math.abs(diffX), currentSpeed * dt);
              if (this.isWalkable(p.x + nudgeX, targetY, p.radius)) {
                p.x += nudgeX;
                p.direction = p.desiredDirection;
                p.desiredDirection = null;
              }
            }
          } else if (p.desiredDirection === 'left' || p.desiredDirection === 'right') {
            const diffY = centerTileY - p.y;
            if (Math.abs(diffY) < 14) {
              const nudgeY = Math.sign(diffY) * Math.min(Math.abs(diffY), currentSpeed * dt);
              if (this.isWalkable(targetX, p.y + nudgeY, p.radius)) {
                p.y += nudgeY;
                p.direction = p.desiredDirection;
                p.desiredDirection = null;
              }
            }
          }
        }
      }

      const moveVec = dirVectors[p.direction];
      const moveDistance = currentSpeed * dt;
      const newX = p.x + moveVec.x * moveDistance;
      const newY = p.y + moveVec.y * moveDistance;

      if (this.isWalkable(newX, newY, p.radius)) {
        p.x = newX;
        p.y = newY;
        p.isMoving = true;
        p.walkAnimTimer += dt * 8;
      } else {
        p.isMoving = false;
      }

      // Semakan portal teleport, kutipan power-up & zon jawapan
      this.checkPortals();
      this.checkPowerups();
      this.checkAnswerZones();
    }

    // Semakan Pengaktifan Portal Teleport Dua Hala (Task 3)
    checkPortals() {
      if (this.teleportCooldown > 0 || !this.portals || !this.portals.A || !this.portals.B) return;

      const p = this.player;
      const pCol = Math.floor(p.x / this.tileSize);
      const pRow = Math.floor(p.y / this.tileSize);
      const ts = this.tileSize;

      // Portal A -> Portal B
      if (pCol === this.portals.A.x && pRow === this.portals.A.y) {
        const dest = this.portals.B;
        p.x = (dest.x + 0.5) * ts;
        p.y = (dest.y + 0.5) * ts;
        this.teleportCooldown = 1.5; // Cooldown 1.5 saat
        p.invulnerableTimer = Math.max(p.invulnerableTimer, 1.0); // Perlindungan 1.0 saat
        this.createSparkles((this.portals.A.x + 0.5) * ts, (this.portals.A.y + 0.5) * ts, '#06b6d4', 20);
        this.createSparkles(p.x, p.y, '#a855f7', 20);
        Audio.playTeleport();
        if (this.callbacks.onTeleport) {
          this.callbacks.onTeleport('A -> B');
        }
      }
      // Portal B -> Portal A
      else if (pCol === this.portals.B.x && pRow === this.portals.B.y) {
        const dest = this.portals.A;
        p.x = (dest.x + 0.5) * ts;
        p.y = (dest.y + 0.5) * ts;
        this.teleportCooldown = 1.5; // Cooldown 1.5 saat
        p.invulnerableTimer = Math.max(p.invulnerableTimer, 1.0); // Perlindungan 1.0 saat
        this.createSparkles((this.portals.B.x + 0.5) * ts, (this.portals.B.y + 0.5) * ts, '#a855f7', 20);
        this.createSparkles(p.x, p.y, '#06b6d4', 20);
        Audio.playTeleport();
        if (this.callbacks.onTeleport) {
          this.callbacks.onTeleport('B -> A');
        }
      }
    }

    // Semakan Kutipan Power-Up (Task 4 & 5)
    checkPowerups() {
      if (!this.powerups || this.powerups.length === 0) return;

      const p = this.player;
      const ts = this.tileSize;

      for (let i = 0; i < this.powerups.length; i++) {
        const pow = this.powerups[i];
        if (pow.collected) continue;

        const powX = (pow.x + 0.5) * ts;
        const powY = (pow.y + 0.5) * ts;
        const dist = Math.hypot(p.x - powX, p.y - powY);

        if (dist < p.radius + 12) {
          pow.collected = true;
          this.createSparkles(powX, powY, pow.color, 22);
          Audio.playPowerup();

          if (pow.type === 'speed') {
            this.activePowerups.speedTimer = 3.0; // 3 saat pecutan
          } else if (pow.type === 'freeze') {
            this.activePowerups.virusFreezeTimer = 3.0; // 3 saat bekukan virus
          } else if (pow.type === 'shield') {
            this.activePowerups.hasShield = true; // Aktifkan perisai
          } else if (pow.type === 'radar') {
            this.activePowerups.radarTimer = 5.0; // 5 saat radar
          } else if (pow.type === 'life') {
            if (this.callbacks.onExtraLife) {
              this.callbacks.onExtraLife();
            }
          }

          if (this.callbacks.onPowerupCollect) {
            this.callbacks.onPowerupCollect(pow);
          }
        }
      }
    }

    checkAnswerZones() {
      const p = this.player;
      const currentTileCol = Math.floor(p.x / this.tileSize);
      const currentTileRow = Math.floor(p.y / this.tileSize);

      const zoneLetters = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < zoneLetters.length; i++) {
        const letter = zoneLetters[i];
        // Jangan cetuskan pelanggaran jika zon telah disingkirkan! (Task 6)
        if (this.eliminatedZones.has(letter)) continue;

        const tiles = this.answerZones[letter] || [];
        const inside = tiles.some(t => t.x === currentTileCol && t.y === currentTileRow);

        if (inside) {
          if (this.callbacks.onZoneEnter) {
            this.callbacks.onZoneEnter(letter);
          }
          break;
        }
      }
    }

    // 7. PENGGERAK KECERDASAN BUATAN (AI) VIRUS DENGAN STATE MACHINE JELAS (Task 2 & 4)
    // Kitaran Status AI: RANDOM_PATROL -> DETECT_PLAYER -> CHASE_PLAYER -> LOST_PLAYER -> RANDOM_PATROL
    updateEnemies(dt) {
      // Sekiranya Pembeku Virus aktif, bekukan semua virus sepenuhnya (Task 4)
      if (this.activePowerups.virusFreezeTimer > 0) {
        return;
      }

      const pCol = Math.floor(this.player.x / this.tileSize);
      const pRow = Math.floor(this.player.y / this.tileSize);

      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.active) continue;

        e.animTimer += dt * 6;
        e.pathCooldown -= dt;
        if (e.alertAnimationTimer > 0) e.alertAnimationTimer -= dt;

        e.tileX = Math.floor(e.x / this.tileSize);
        e.tileY = Math.floor(e.y / this.tileSize);

        // A. Semak Pengesanan Murid Menggunakan Jarak Jubin Koridor Sebenar (BFS Walkable Grid Distance)
        // Dinding maze dan halangan dihormati sepenuhnya: jarak diukur melalui koridor sahaja
        const walkableDistance = getWalkableTileDistance(this.grid, e.tileX, e.tileY, pCol, pRow, e.cfg.detectionRange + 2);
        const inDetectionRange = walkableDistance <= e.cfg.detectionRange;

        // B. State Machine AI yang Jelas & Berstruktur
        // RANDOM_PATROL -> DETECT_PLAYER -> CHASE_PLAYER -> LOST_PLAYER -> RANDOM_PATROL
        switch (e.state) {
          case EnemyState.RANDOM_PATROL:
            if (inDetectionRange) {
              // Mengesan murid: bertukar ke DETECT_PLAYER
              e.state = EnemyState.DETECT_PLAYER;
              e.stateTimer = 0.4; // Fasa pengesanan visual & audio sebelum mengejar
              e.alertAnimationTimer = 1.4; // Paparkan lencana amaran tanda seru (!)
              e.disengageTimer = e.cfg.disengageDelay;
              e.currentPath = [];
              Audio.playVirusAlert();
            } else {
              // Tiada murid dikesan: Bergerak secara rawak sepenuhnya tanpa mengetahui lokasi murid
              this.moveRandomCorridorPatrol(e, dt);
            }
            break;

          case EnemyState.DETECT_PLAYER:
            e.stateTimer -= dt;
            if (inDetectionRange) {
              e.disengageTimer = e.cfg.disengageDelay;
            } else {
              e.disengageTimer -= dt;
              if (e.disengageTimer <= 0) {
                e.state = EnemyState.LOST_PLAYER;
                e.stateTimer = 0.8;
                break;
              }
            }

            if (e.stateTimer <= 0) {
              // Mula fasa mengejar (CHASE_PLAYER)
              e.state = EnemyState.CHASE_PLAYER;
              e.currentPath = findShortestPathBFS(this.grid, e.tileX, e.tileY, pCol, pRow, 25) || [];
              e.pathCooldown = 0.25;
            }
            // Semasa fasa amaran, perlahankan sedikit pergerakan
            this.moveRandomCorridorPatrol(e, dt * 0.4);
            break;

          case EnemyState.CHASE_PLAYER:
            if (inDetectionRange) {
              e.disengageTimer = e.cfg.disengageDelay;
            } else {
              e.disengageTimer -= dt;
              if (e.disengageTimer <= 0) {
                // Murid keluar daripada radius pengesanan: bertukar ke LOST_PLAYER
                e.state = EnemyState.LOST_PLAYER;
                e.stateTimer = 1.0; // 1 saat fasa carian/keliru sebelum kembali rondaan rawak
                e.currentPath = [];
                break;
              }
            }

            // Pengejaran berasaskan pathfinding koridor maze yang sah
            if (e.type === 'green') {
              // Virus Hijau: Jarak dekat (3 petak) | BFS shortest-path chase
              if (e.pathCooldown <= 0 || e.currentPath.length === 0) {
                e.currentPath = findShortestPathBFS(this.grid, e.tileX, e.tileY, pCol, pRow, 12) || [];
                e.pathCooldown = 0.35;
              }
              this.followTilePath(e, dt);
            } else if (e.type === 'purple') {
              // Virus Ungu: Jarak sederhana (6 petak) | Koridor pathfinding chase
              if (e.pathCooldown <= 0 || e.currentPath.length === 0) {
                e.currentPath = findShortestPathBFS(this.grid, e.tileX, e.tileY, pCol, pRow, 18) || [];
                e.pathCooldown = 0.30;
              }
              this.followTilePath(e, dt);
            } else if (e.type === 'red') {
              // Virus Merah: Jarak jauh (9 petak) | BFS shortest-path pantas & tangkas
              if (e.pathCooldown <= 0 || e.currentPath.length === 0) {
                e.currentPath = findShortestPathBFS(this.grid, e.tileX, e.tileY, pCol, pRow, 25) || [];
                e.pathCooldown = 0.20;
              }
              this.followTilePath(e, dt);
            }
            break;

          case EnemyState.LOST_PLAYER:
            if (inDetectionRange) {
              // Dikesan semula semasa sedang mencari
              e.state = EnemyState.DETECT_PLAYER;
              e.stateTimer = 0.35;
              e.alertAnimationTimer = 1.2;
              e.disengageTimer = e.cfg.disengageDelay;
              Audio.playVirusAlert();
            } else {
              e.stateTimer -= dt;
              if (e.stateTimer <= 0) {
                // Kembali semula ke pergerakan rawak (RANDOM_PATROL)
                e.state = EnemyState.RANDOM_PATROL;
                e.currentPath = [];
                e.lastDecisionTile = null;
              } else {
                // Pergerakan perlahan mencari jejak
                this.moveRandomCorridorPatrol(e, dt * 0.35);
              }
            }
            break;

          default:
            e.state = EnemyState.RANDOM_PATROL;
            this.moveRandomCorridorPatrol(e, dt);
            break;
        }

        // C. Semakan Perlanggaran dengan Murid
        if (this.player.active && this.player.invulnerableTimer <= 0) {
          const dx = this.player.x - e.x;
          const dy = this.player.y - e.y;
          const dist = Math.hypot(dx, dy);

          if (dist < this.player.radius + e.radius - 2) {
            this.handlePlayerHit(e);
            break;
          }
        }
      }
    }

    // Helper: Mengikuti Laluan Jubin (BFS Waypoints) semasa CHASE_PLAYER
    followTilePath(e, dt) {
      if (!e.currentPath || e.currentPath.length <= 1) {
        this.moveRandomCorridorPatrol(e, dt);
        return;
      }

      // Titik sasaran seterusnya di koridor maze
      const nextTile = e.currentPath[1];
      const targetX = (nextTile.x + 0.5) * this.tileSize;
      const targetY = (nextTile.y + 0.5) * this.tileSize;

      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 3) {
        // Sampai di nod jubin seterusnya, alih ke titik berikutnya
        e.currentPath.shift();
      } else {
        // Tentukan arah pergerakan
        if (Math.abs(dx) > Math.abs(dy)) {
          e.direction = dx > 0 ? 'right' : 'left';
        } else {
          e.direction = dy > 0 ? 'down' : 'up';
        }

        const moveStep = Math.min(e.speed * dt, dist);
        const newX = e.x + (dx / dist) * moveStep;
        const newY = e.y + (dy / dist) * moveStep;

        if (this.isWalkable(newX, newY, e.radius)) {
          e.x = newX;
          e.y = newY;
        } else {
          // Sandaran jika terhalang
          this.moveRandomCorridorPatrol(e, dt);
        }
      }
    }

    // Helper: Pergerakan Rawak Berkesan Tanpa Berulang-Alik / Anti-Oscillation (RANDOM_PATROL)
    moveRandomCorridorPatrol(e, dt) {
      const dirVectors = {
        up: { x: 0, y: -1, col: 0, row: -1, opp: 'down' },
        down: { x: 0, y: 1, col: 0, row: 1, opp: 'up' },
        left: { x: -1, y: 0, col: -1, row: 0, opp: 'right' },
        right: { x: 1, y: 0, col: 1, row: 0, opp: 'left' }
      };

      const tileCenterX = (e.tileX + 0.5) * this.tileSize;
      const tileCenterY = (e.tileY + 0.5) * this.tileSize;
      const distToCenter = Math.hypot(tileCenterX - e.x, tileCenterY - e.y);
      const currentTileKey = `${e.tileX},${e.tileY}`;

      // Apabila tiba di pusat jubin persimpangan, pilih arah baharu secara rawak
      if (distToCenter < 4.5 && e.lastDecisionTile !== currentTileKey) {
        e.lastDecisionTile = currentTileKey;

        // Semak keempat-empat arah koridor maze
        const directions = ['up', 'down', 'left', 'right'];
        const walkableDirs = [];

        for (let d = 0; d < directions.length; d++) {
          const dName = directions[d];
          const info = dirVectors[dName];
          const nextCol = e.tileX + info.col;
          const nextRow = e.tileY + info.row;

          if (this.isTileWalkable(nextCol, nextRow)) {
            walkableDirs.push(dName);
          }
        }

        if (walkableDirs.length > 0) {
          const currentOpp = dirVectors[e.direction]?.opp;
          // Asas Anti-Oscillation: Jangan patah balik 180° berulang-alik kecuali lorong mati
          const forwardAndTurns = walkableDirs.filter(d => d !== currentOpp);

          if (forwardAndTurns.length > 0) {
            // Pilih secara rawak antara laluan terus atau simpang belokan yang sah
            const chosen = forwardAndTurns[Math.floor(Math.random() * forwardAndTurns.length)];
            e.direction = chosen;
          } else {
            // Lorong mati: patah balik
            e.direction = currentOpp || walkableDirs[0];
          }

          // Selaraskan sedikit ke paksi tengah koridor untuk pergerakan licin
          if (e.direction === 'up' || e.direction === 'down') {
            e.x = tileCenterX;
          } else {
            e.y = tileCenterY;
          }
        }
      }

      // Gerakkan musuh mengikut arah yang telah dipilih
      const vec = dirVectors[e.direction] || dirVectors.left;
      const step = e.speed * dt;
      const newX = e.x + vec.x * step;
      const newY = e.y + vec.y * step;

      if (this.isWalkable(newX, newY, e.radius)) {
        e.x = newX;
        e.y = newY;
      } else {
        // Sekiranya terlanggar dinding atau tersasar dari paksi, cari arah sah serta-merta
        const directions = ['up', 'down', 'left', 'right'].sort(() => 0.5 - Math.random());
        let found = false;
        for (let d = 0; d < directions.length; d++) {
          const testDir = directions[d];
          const tVec = dirVectors[testDir];
          if (this.isWalkable(tileCenterX + tVec.x * 6, tileCenterY + tVec.y * 6, e.radius)) {
            e.direction = testDir;
            e.x = tileCenterX;
            e.y = tileCenterY;
            found = true;
            break;
          }
        }
        if (!found) {
          // Sandaran sekiranya tersepit: kembalikan ke pusat jubin
          e.x = tileCenterX;
          e.y = tileCenterY;
        }
      }
    }

    // 8. Pengendalian Perlanggaran dengan Virus (Task 4: Perisai Sel)
    handlePlayerHit(enemy) {
      // Sekiranya Perisai Sel aktif, serap hit tanpa menolak nyawa (Task 4)
      if (this.activePowerups.hasShield) {
        this.activePowerups.hasShield = false;
        Audio.playShieldBreak();
        this.createGlitchParticles(this.player.x, this.player.y, '#10b981', 22);
        this.player.invulnerableTimer = 2.0; // Kebal 2 saat selepas perisai pecah
        if (this.callbacks.onShieldAbsorb) {
          this.callbacks.onShieldAbsorb(enemy);
        }
        return;
      }

      this.createGlitchParticles(this.player.x, this.player.y, '#f43f5e');
      this.player.invulnerableTimer = 3.0; // Kebal 3 saat

      if (this.callbacks.onVirusHit) {
        this.callbacks.onVirusHit(enemy);
      }
    }

    // 9. Sistem Partikel
    createSparkles(x, y, color = '#38bdf8', count = 18) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 90;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3,
          color,
          alpha: 1,
          life: 0.6 + Math.random() * 0.4
        });
      }
    }

    createGlitchParticles(x, y, color = '#f43f5e', count = 14) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 80;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2.5 + Math.random() * 2.5,
          color,
          alpha: 1,
          life: 0.5 + Math.random() * 0.3
        });
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    // 10. Lukis Kanvas Permainan
    render() {
      const ctx = this.ctx;
      ctx.save();
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.scale(this.scaleX, this.scaleY);

      // A. Lantai Jubin Sains Futuristik
      this.drawFloor(ctx);

      // B. Pasangan Portal Teleport (Task 3)
      this.drawPortals(ctx);

      // C. Zon Jawapan A, B, C, D (Task 8 & Task 6)
      this.drawAnswerZones(ctx);

      // D. Item Power-Up Kolektibel (Task 4)
      this.drawPowerups(ctx);

      // E. Dinding Maze Futuristic Science Laboratory (Task 7)
      this.drawWalls(ctx);

      // F. Partikel
      this.drawParticles(ctx);

      // G. Musuh Virus Kartun dengan Indikator Pengesanan, Radar & Pembeku (Task 2 & 4)
      this.drawEnemies(ctx);

      // H. Watak Murid dengan Perisai & Pecutan (Task 4)
      this.drawPlayer(ctx);

      // I. Kesan Peralihan Animasi Antara Maze (Task 9)
      if (this.transitionAlpha > 0) {
        this.drawTransitionOverlay(ctx);
      }

      ctx.restore();
    }

    drawFloor(ctx) {
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

      // Grid halus beraksen makmal
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= this.cols; c++) {
        ctx.moveTo(c * this.tileSize, 0);
        ctx.lineTo(c * this.tileSize, this.virtualHeight);
      }
      for (let r = 0; r <= this.rows; r++) {
        ctx.moveTo(0, r * this.tileSize);
        ctx.lineTo(this.virtualWidth, r * this.tileSize);
      }
      ctx.stroke();
    }

    // Lukis Portal Teleport Berpasangan (Task 3)
    drawPortals(ctx) {
      if (!this.portals) return;
      const ts = this.tileSize;
      const time = performance.now() * 0.003;

      ['A', 'B'].forEach(pKey => {
        const portal = this.portals[pKey];
        if (!portal) return;

        const cx = (portal.x + 0.5) * ts;
        const cy = (portal.y + 0.5) * ts;
        const isA = pKey === 'A';
        const color = isA ? '#06b6d4' : '#a855f7';
        const secColor = isA ? '#22d3ee' : '#c084fc';
        const rot = time * (isA ? 1.5 : -1.5);
        const pulse = Math.sin(time * 3 + (isA ? 0 : Math.PI)) * 2;

        ctx.save();

        // 1. Aura bercahaya di lantai koridor
        const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
        glow.addColorStop(0, color);
        glow.addColorStop(0.5, isA ? 'rgba(6, 182, 212, 0.35)' : 'rgba(168, 85, 247, 0.35)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Gelang luar berputar (Rotating orbit ring)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, 13 + pulse * 0.5, rot, rot + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. Gelang dalam bercahaya
        ctx.strokeStyle = secColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, -rot * 1.2, -rot * 1.2 + Math.PI * 2);
        ctx.stroke();

        // 4. Pusat vortex
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 5. Simbol 🌀 & Lencana Portal A / B
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeText(`🌀 ${pKey}`, cx, cy - 17);
        ctx.fillText(`🌀 ${pKey}`, cx, cy - 17);

        ctx.restore();
      });
    }

    // Lukis Item Power-Up Kolektibel (Task 4)
    drawPowerups(ctx) {
      if (!this.powerups || this.powerups.length === 0) return;
      const ts = this.tileSize;
      const time = performance.now() * 0.004;

      for (let i = 0; i < this.powerups.length; i++) {
        const pow = this.powerups[i];
        if (pow.collected) continue;

        const cx = (pow.x + 0.5) * ts;
        const cy = (pow.y + 0.5) * ts;
        const bob = Math.sin(time * 2 + i * 1.5) * 3;
        const pulse = Math.sin(time * 3 + i) * 1.5;

        ctx.save();

        // 1. Aura bercahaya
        const glow = ctx.createRadialGradient(cx, cy + bob, 2, cx, cy + bob, 15);
        glow.addColorStop(0, pow.color);
        glow.addColorStop(0.6, pow.glow);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy + bob, 15 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Kapsul arcade terapung
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = pow.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, cy + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. Ikon Power-Up
        ctx.font = '12px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pow.icon, cx, cy + bob + 0.5);

        ctx.restore();
      }
    }

    // Redesigned Futuristic Science Laboratory Walls (Task 7)
    drawWalls(ctx) {
      const ts = this.tileSize;
      ctx.save();

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] === 1) {
            const x = c * ts;
            const y = r * ts;

            // 1. Blok Asas Logam Makmal Futuristik (Deep Metallic Slate/Navy Gradient)
            const wallGrad = ctx.createLinearGradient(x, y, x + ts, y + ts);
            wallGrad.addColorStop(0, '#151e36');
            wallGrad.addColorStop(0.5, '#0d1527');
            wallGrad.addColorStop(1, '#090e1a');
            ctx.fillStyle = wallGrad;

            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(x + 0.5, y + 0.5, ts - 1, ts - 1, 4);
              ctx.fill();
            } else {
              ctx.fillRect(x + 0.5, y + 0.5, ts - 1, ts - 1);
            }

            // 2. Sempadan Luminous Neon Glowing Border (Teal / Cyan Accents)
            const isSpecialSection = (c + r) % 5 === 0;
            const borderColor = isSpecialSection ? '#06b6d4' : '#0284c7';
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1.4;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(x + 1.5, y + 1.5, ts - 3, ts - 3, 3);
              ctx.stroke();
            } else {
              ctx.strokeRect(x + 1.5, y + 1.5, ts - 3, ts - 3);
            }

            // 3. Garisan Litar & Rivet Nod Sains (Circuit lines & node rivets)
            if ((c * 2 + r * 3) % 7 === 0) {
              ctx.fillStyle = '#22d3ee';
              ctx.beginPath();
              ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2);
              ctx.fill();
            } else if ((c * 3 + r) % 8 === 0) {
              ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 4, y + ts / 2);
              ctx.lineTo(x + ts - 4, y + ts / 2);
              ctx.stroke();
            }
          }
        }
      }

      ctx.restore();
    }

    // Zon Jawapan A, B, C, D (Interactive Arcade Platforms - Task 8 & Task 6)
    drawAnswerZones(ctx) {
      const ts = this.tileSize;
      const zoneConfig = {
        A: { index: 0, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.25)', cardBg: 'rgba(28, 12, 18, 0.96)', label: 'ZON A', borderColor: '#f87171' },
        B: { index: 1, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.25)', cardBg: 'rgba(10, 20, 38, 0.96)', label: 'ZON B', borderColor: '#60a5fa' },
        C: { index: 2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.25)', cardBg: 'rgba(8, 26, 18, 0.96)', label: 'ZON C', borderColor: '#34d399' },
        D: { index: 3, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.25)', cardBg: 'rgba(30, 22, 10, 0.96)', label: 'ZON D', borderColor: '#fbbf24' }
      };

      const time = performance.now() * 0.003;
      const pulse = Math.sin(time) * 0.15 + 0.85;

      ['A', 'B', 'C', 'D'].forEach(letter => {
        // Task 6: Sekiranya pilihan jawapan telah disingkirkan, JANGAN LUKIS!
        // Visual lantai asas dan sempadan dinding di sekelilingnya dikekalkan bersih
        if (this.eliminatedZones.has(letter)) return;

        const tiles = this.answerZones[letter];
        if (!tiles || tiles.length === 0) return;

        const cfg = zoneConfig[letter];

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        tiles.forEach(t => {
          minX = Math.min(minX, t.x * ts);
          minY = Math.min(minY, t.y * ts);
          maxX = Math.max(maxX, (t.x + 1) * ts);
          maxY = Math.max(maxY, (t.y + 1) * ts);
        });

        const width = maxX - minX;
        const height = maxY - minY;

        ctx.save();

        // 1. Platform Sains Gelap Berkontras Tinggi (Interactive Scientific Platform)
        ctx.fillStyle = cfg.cardBg;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(minX + 2, minY + 2, width - 4, height - 4, 8);
          ctx.fill();
        } else {
          ctx.fillRect(minX + 2, minY + 2, width - 4, height - 4);
        }

        // 2. Kilauan Lembut Platform Warna
        ctx.fillStyle = cfg.bg;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(minX + 2, minY + 2, width - 4, height - 4, 8);
          ctx.fill();
        } else {
          ctx.fillRect(minX + 2, minY + 2, width - 4, height - 4);
        }

        // 3. Sempadan Berdenyut Neon Platform
        ctx.strokeStyle = cfg.borderColor;
        ctx.lineWidth = 2.4 * pulse;
        ctx.setLineDash([7, 3]);
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(minX + 2, minY + 2, width - 4, height - 4, 8);
          ctx.stroke();
        } else {
          ctx.strokeRect(minX + 2, minY + 2, width - 4, height - 4);
        }
        ctx.setLineDash([]);

        const centerX = minX + width / 2;

        // 4. Lencana Huruf A, B, C, D
        const isTall = height >= 76;
        const badgeY = isTall ? (minY + 16) : (minY + 13);
        const badgeRadius = isTall ? 12 : 9.5;

        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(centerX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isTall ? 13 : 11}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, centerX, badgeY);

        // 5. Teks Penuh Jawapan di Dalam Zon
        const answerText = (this.currentQuestionData && this.currentQuestionData.options)
          ? this.currentQuestionData.options[cfg.index]
          : cfg.label;

        if (answerText) {
          const textTopY = badgeY + badgeRadius + (isTall ? 5 : 3);
          const maxTextW = width - 12;
          const maxTextH = maxY - textTopY - 4;
          this.renderWrappedZoneText(ctx, answerText, centerX, textTopY, maxTextW, maxTextH);
        }

        ctx.restore();
      });
    }

    // Fungsi Pembantu Pembungkus Teks Dinamik di Dalam Zon Jawapan (Task 2)
    renderWrappedZoneText(ctx, text, centerX, topY, maxWidth, maxHeight) {
      if (!text || maxHeight <= 0) return;

      const words = text.split(' ');
      const testSizes = [11, 10, 9.2, 8.4, 7.6, 7];
      let bestLines = [text];
      let bestFontSize = 8;
      let lineHeight = 10.5;

      for (let s = 0; s < testSizes.length; s++) {
        const fs = testSizes[s];
        ctx.font = `bold ${fs}px "Plus Jakarta Sans", sans-serif`;
        const lines = [];
        let curLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
          const testL = curLine + ' ' + words[i];
          if (ctx.measureText(testL).width <= maxWidth) {
            curLine = testL;
          } else {
            lines.push(curLine);
            curLine = words[i];
          }
        }
        lines.push(curLine);

        const totalH = lines.length * (fs * 1.25);
        if (totalH <= maxHeight || s === testSizes.length - 1) {
          bestLines = lines;
          bestFontSize = fs;
          lineHeight = fs * 1.25;
          if (totalH <= maxHeight) break;
        }
      }

      ctx.save();
      ctx.font = `bold ${bestFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const totalH = bestLines.length * lineHeight;
      const startY = topY + Math.max(0, (maxHeight - totalH) / 2);

      for (let i = 0; i < bestLines.length; i++) {
        const line = bestLines[i];
        const y = startY + i * lineHeight;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.strokeText(line, centerX, y);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(line, centerX, y);
      }
      ctx.restore();
    }

    drawPlayer(ctx) {
      const p = this.player;
      if (!p.active) return;

      ctx.save();

      // Kesan Pecutan Saintis (Speed Trail)
      if (this.activePowerups.speedTimer > 0) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 9px "Segoe UI Emoji", sans-serif';
        ctx.fillText('⚡', p.x, p.y - 20);
      }

      // Kesan Kebal / Invulnerability
      if (p.invulnerableTimer > 0) {
        const flash = Math.floor(p.invulnerableTimer * 12) % 2 === 0;
        if (flash) {
          ctx.globalAlpha = 0.45;
        }
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Kesan Perisai Sel Aktif (Task 4)
      if (this.activePowerups.hasShield) {
        const shieldPulse = Math.sin(performance.now() * 0.006) * 1.5;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 8 + shieldPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 8 + shieldPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 11, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const bob = p.isMoving ? Math.sin(p.walkAnimTimer) * 2 : 0;

      // Kaki
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(p.x - 6, p.y + 4 + bob, 4, 6);
      ctx.fillRect(p.x + 2, p.y + 4 - bob, 4, 6);

      // Kasut
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x - 7, p.y + 9 + bob, 5, 3);
      ctx.fillRect(p.x + 2, p.y + 9 - bob, 5, 3);

      // Kot Makmal
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(p.x - 8, p.y - 6 + bob, 16, 12, 3);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 6 + bob);
      ctx.lineTo(p.x, p.y + 6 + bob);
      ctx.stroke();

      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y - 2 + bob, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Kepala & Rambut
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 + bob, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 12 + bob, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();

      const eyeOffset = {
        up: { x: 0, y: -2 },
        down: { x: 0, y: 1 },
        left: { x: -2, y: 0 },
        right: { x: 2, y: 0 }
      }[p.direction] || { x: 0, y: 1 };

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(p.x - 2.5 + eyeOffset.x, p.y - 10 + bob + eyeOffset.y, 1.2, 0, Math.PI * 2);
      ctx.arc(p.x + 2.5 + eyeOffset.x, p.y - 10 + bob + eyeOffset.y, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Gogal Sains
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x - 6, p.y - 15 + bob, 12, 3.5);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(p.x - 6, p.y - 15 + bob, 12, 3.5);

      ctx.restore();
    }

    drawEnemies(ctx) {
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.active) continue;

        ctx.save();

        // A. Kesan Radar Saintis (Mendedahkan lokasi virus merentasi dinding) (Task 4)
        if (this.activePowerups.radarTimer > 0) {
          const radarPulse = (performance.now() * 0.005) % 1;
          ctx.strokeStyle = 'rgba(168, 85, 247, ' + (1 - radarPulse) + ')';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 4 + radarPulse * 18, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 10px "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📡', e.x, e.y - e.radius - 14);
        }

        // B. Indikator Pengesanan Murid (DETECT_PLAYER & CHASE_PLAYER) (Task 2 & 7)
        if (e.state === EnemyState.DETECT_PLAYER || e.state === EnemyState.CHASE_PLAYER) {
          const alertPulse = Math.sin(e.animTimer * 2) * 2;

          ctx.strokeStyle = e.cfg.alertColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 8 + alertPulse, 0, Math.PI * 2);
          ctx.stroke();

          const badgeY = e.y - e.radius - 12 + alertPulse;
          ctx.fillStyle = e.cfg.alertColor;
          ctx.beginPath();
          ctx.arc(e.x, badgeY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', e.x, badgeY);
        } else if (e.state === EnemyState.LOST_PLAYER) {
          // Lencana tanda tanya (?) apabila hilang jejak murid
          const badgeY = e.y - e.radius - 12;
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(e.x, badgeY, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', e.x, badgeY);
        }

        // Bayang virus
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y + e.radius, e.radius * 0.8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Protein Spikes berdenyut
        const spikePulse = Math.sin(e.animTimer) * 2;
        const spikeCount = e.type === 'patrol' ? 8 : (e.type === 'wander' ? 6 : 8);
        ctx.strokeStyle = e.cfg.secondaryColor;
        ctx.lineWidth = 2.5;

        for (let s = 0; s < spikeCount; s++) {
          const angle = (s / spikeCount) * Math.PI * 2 + e.animTimer * 0.2;
          const outerR = e.radius + 4 + spikePulse;
          const sx = e.x + Math.cos(angle) * outerR;
          const sy = e.y + Math.sin(angle) * outerR;

          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(angle) * e.radius, e.y + Math.sin(angle) * e.radius);
          ctx.lineTo(sx, sy);
          ctx.stroke();

          ctx.fillStyle = e.cfg.secondaryColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Badan Virus Utama
        const grad = ctx.createRadialGradient(e.x - 3, e.y - 3, 2, e.x, e.y, e.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, e.cfg.color);
        grad.addColorStop(1, e.cfg.secondaryColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = e.cfg.secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Mata Kartun
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(e.x - 3.5, e.y - 2, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(e.x + 3.5, e.y - 2, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(e.x - 3.5, e.y - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(e.x + 3.5, e.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Riak Muka Kartun mengikut State AI
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (e.state === EnemyState.CHASE_PLAYER || e.state === EnemyState.DETECT_PLAYER) {
          ctx.arc(e.x, e.y + 4, 3, Math.PI, Math.PI * 2);
        } else if (e.state === EnemyState.LOST_PLAYER) {
          ctx.moveTo(e.x - 2.5, e.y + 3);
          ctx.lineTo(e.x + 2.5, e.y + 3);
        } else {
          ctx.arc(e.x, e.y + 2, 3, 0, Math.PI);
        }
        ctx.stroke();

        // C. Kesan Pembeku Virus Aktif (Task 4)
        if (this.activePowerups.virusFreezeTimer > 0) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❄️', e.x, e.y - e.radius - 4);
        }

        ctx.restore();
      }
    }

    drawParticles(ctx) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    drawTransitionOverlay(ctx) {
      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${this.transitionAlpha})`;
      ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

      if (this.transitionAlpha > 0.5 && this.transitionMessage) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.transitionMessage, this.virtualWidth / 2, this.virtualHeight / 2 - 10);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Menjana susun atur koridor baharu...', this.virtualWidth / 2, this.virtualHeight / 2 + 20);
      }
      ctx.restore();
    }

    // 11. Gelung Utama Permainan (Game Loop)
    start() {
      this.running = true;
      this.paused = false;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }

    stop() {
      this.running = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }

    pause() {
      this.paused = true;
    }

    resume() {
      if (this.paused) {
        this.paused = false;
        this.lastTime = performance.now();
      }
    }

    loop(currentTime) {
      if (!this.running) return;

      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
      this.lastTime = currentTime;

      if (!this.paused && !this.transitioning) {
        this.updatePlayer(dt);
        this.updateEnemies(dt);
        this.updateParticles(dt);
      }

      this.render();

      this.animFrameId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  // Eksport ke skop global
  global.ARSelNelMazeGameEngine = MazeGameEngine;

})(window);
