/**
 * ARSelNel - Misi Makmal Sains: Operasi Kemas Makmal
 * 2D Canvas Engine: Physics, Lab Tile Textures, Sprite Animations, Collision & Particles
 */

(function(global) {
  'use strict';

  const {
    MAP_COLS,
    MAP_ROWS,
    TILE_SIZE,
    QUESTIONS,
    EQUIPMENT,
    STORAGE_STATION,
    EXIT_DOOR,
    generateLabMap,
    Audio,
    GameState
  } = global.ARSelNelLabAdventure;

  class LabAdventureGameEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = options;

      this.worldWidth = MAP_COLS * TILE_SIZE;  // 1216 px
      this.worldHeight = MAP_ROWS * TILE_SIZE; // 832 px

      this.map = generateLabMap();

      // Camera
      this.camera = { x: 0, y: 0, width: 800, height: 600 };

      // Pemain (Mula di bahagian tengah-selatan makmal: r: 24, c: 15)
      this.player = {
        x: 15 * TILE_SIZE,
        y: 24 * TILE_SIZE,
        width: 24,
        height: 30,
        speed: 160, // px per saat
        direction: 'up', // 'down', 'up', 'left', 'right'
        isMoving: false,
        animFrame: 0,
        animTimer: 0,
        name: options.playerName || 'Pelajar Saintis'
      };

      // Input keys
      this.keys = {
        up: false,
        down: false,
        left: false,
        right: false
      };

      // Touch joystick / dpad state
      this.touchVector = { x: 0, y: 0, active: false };

      // 10 Peralatan Makmal
      this.equipmentList = EQUIPMENT.map((item, idx) => ({
        id: item.id,
        key: item.key,
        name: item.name,
        icon: item.icon,
        questionId: item.id,
        col: item.col,
        row: item.row,
        x: item.col * TILE_SIZE + TILE_SIZE / 2,
        y: item.row * TILE_SIZE + TILE_SIZE / 2,
        zone: item.zone,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2
      }));

      // Partikel
      this.particles = [];

      // Keadaan permainan (Bermula dalam mod READY sebelum pemain menekan butang mula)
      this.state = GameState.READY;
      this.isPaused = true;
      this.isExitUnlocked = false;
      this.isReturnedToStorage = false;
      this.lastTime = 0;
      this.exitCooldown = 0;
      this.animReqId = null;

      // Event Callbacks
      this.onEquipmentTrigger = options.onEquipmentTrigger || (() => {});
      this.onStorageStationTrigger = options.onStorageStationTrigger || (() => {});
      this.onExitDoorTrigger = options.onExitDoorTrigger || (() => {});
      this.onPlayerMove = options.onPlayerMove || (() => {});

      // Sediakan tekstur tile & sprite canvas secara prosedural
      this.tileSprites = this.createLabTileTextures();
      this.playerSprites = this.createStudentSprites();
      this.equipmentSprites = this.createEquipmentSprites();

      // Dengar input keyboard & resize
      this.initInput();
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }

    // 1. Cipta tekstur pixel art untuk Makmal Sains (100% Prosedural & Berdefinisi Tinggi)
    createLabTileTextures() {
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

      // 0: Lantai Jubin Makmal (Glossy White/Light Slate Lab Tiles)
      textures[0] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc'; // Putih bersih
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#e2e8f0'; // Garis grout halus
        c.lineWidth = 1;
        c.strokeRect(0, 0, size, size);
        // Kilauan cahaya makmal
        c.fillStyle = '#ffffff';
        c.fillRect(2, 2, size - 4, 2);
        c.fillRect(2, 2, 2, size - 4);
      });

      // 1: Jalur Keselamatan Makmal / Koridor (Safety Walkway with subtle cyan/teal border)
      textures[1] = makeCanvas((c) => {
        c.fillStyle = '#f1f5f9';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#cbd5e1';
        c.lineWidth = 1;
        c.strokeRect(0, 0, size, size);
        // Jalur bimbingan makmal
        c.fillStyle = '#ccfbf1';
        c.fillRect(6, 6, size - 12, size - 12);
        c.strokeStyle = '#5eead4';
        c.strokeRect(6, 6, size - 12, size - 12);
      });

      // 2: Dinding Konkrit Luar / Pembahagi Makmal (Solid Lab Wall with trim)
      textures[2] = makeCanvas((c) => {
        c.fillStyle = '#334155'; // Slate gelap
        c.fillRect(0, 0, size, size);
        // Skirting trim bawah
        c.fillStyle = '#1e293b';
        c.fillRect(0, size - 6, size, 6);
        // Garis bata/panel makmal
        c.strokeStyle = '#475569';
        c.lineWidth = 1;
        c.strokeRect(0, 0, size, size - 6);
        c.fillStyle = '#64748b';
        c.fillRect(4, 4, size - 8, 2);
      });

      // 3: Tingkap Kaca Dinding Makmal
      textures[3] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);
        // Panel kaca
        c.fillStyle = '#38bdf8';
        c.fillRect(2, 2, size - 4, size - 8);
        c.fillStyle = '#7dd3fc';
        c.fillRect(4, 4, size - 8, 4);
        // Refleksi serong kaca
        c.fillStyle = '#ffffff';
        c.globalAlpha = 0.4;
        c.beginPath();
        c.moveTo(6, size - 10);
        c.lineTo(size - 6, 4);
        c.lineTo(size - 10, 4);
        c.lineTo(4, size - 10);
        c.closePath();
        c.fill();
        c.globalAlpha = 1.0;
        // Bingkai aluminium
        c.strokeStyle = '#94a3b8';
        c.lineWidth = 1.5;
        c.strokeRect(2, 2, size - 4, size - 8);
      });

      // 4: Meja Eksperimen Makmal Hitam (Epoxy Resin Top Lab Bench)
      textures[4] = makeCanvas((c) => {
        // Bahagian bawah meja
        c.fillStyle = '#334155';
        c.fillRect(0, 0, size, size);
        // Permukaan hitam rintang kimia
        c.fillStyle = '#0f172a';
        c.fillRect(1, 1, size - 2, size - 5);
        // Kilauan permukaan meja
        c.fillStyle = '#1e293b';
        c.fillRect(2, 2, size - 4, 2);
        // Botol reagen hiasan kecil di atas meja
        c.fillStyle = '#38bdf8';
        c.fillRect(6, 6, 3, 5);
        c.fillStyle = '#f59e0b';
        c.fillRect(11, 7, 3, 4);
        c.fillStyle = '#10b981';
        c.fillRect(size - 8, 6, 4, 6);
      });

      // 5: Singki Makmal Keluli Tahan Karat & Paip Air (Stainless Steel Lab Sink)
      textures[5] = makeCanvas((c) => {
        c.fillStyle = '#0f172a';
        c.fillRect(0, 0, size, size);
        // Besen singki keluli
        c.fillStyle = '#94a3b8';
        c.fillRect(4, 4, size - 8, size - 8);
        c.fillStyle = '#64748b';
        c.fillRect(6, 6, size - 12, size - 12);
        // Lubang salir air
        c.fillStyle = '#334155';
        c.beginPath();
        c.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
        c.fill();
        // Paip leher angsa
        c.fillStyle = '#cbd5e1';
        c.fillRect(size / 2 - 2, 1, 4, 6);
      });

      // 6: Meja Demonstrasi Guru (Large Teacher Podium Desk)
      textures[6] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);
        c.fillStyle = '#0f172a';
        c.fillRect(1, 1, size - 2, size - 6);
        c.fillStyle = '#3b82f6';
        c.fillRect(4, 5, 8, 6); // Buku sains guru
        c.fillStyle = '#ffffff';
        c.fillRect(5, 6, 6, 4);
        c.fillStyle = '#a855f7';
        c.fillRect(18, 5, 4, 7); // Kelalang demonstrasi
      });

      // 7: Papan Putih Besar & Carta Sel (Whiteboard on North Wall)
      textures[7] = makeCanvas((c) => {
        c.fillStyle = '#334155';
        c.fillRect(0, 0, size, size);
        // Bingkai aluminium
        c.fillStyle = '#e2e8f0';
        c.fillRect(1, 2, size - 2, size - 4);
        // Permukaan putih
        c.fillStyle = '#ffffff';
        c.fillRect(2, 3, size - 4, size - 6);
        // Lakaran rajah sel (Nukleus & membran)
        c.strokeStyle = '#059669'; // Sel tumbuhan hijau
        c.lineWidth = 1;
        c.strokeRect(5, 6, 10, 10);
        c.fillStyle = '#ec4899'; // Nukleus merah jambu
        c.beginPath();
        c.arc(10, 11, 2.5, 0, Math.PI * 2);
        c.fill();
        // Lakaran sel haiwan bulat
        c.strokeStyle = '#2563eb';
        c.beginPath();
        c.arc(23, 11, 5, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = '#ec4899';
        c.beginPath();
        c.arc(23, 11, 2, 0, Math.PI * 2);
        c.fill();
        // Label teks
        c.fillStyle = '#0f172a';
        c.fillRect(5, 20, 8, 2);
        c.fillRect(18, 20, 9, 2);
      });

      // 8: Kabinet Simpanan Kimia / Kaca Radas (Glassware Storage Cabinet)
      textures[8] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);
        // Pintu kaca kabinet
        c.fillStyle = '#0f2b38';
        c.fillRect(2, 2, size - 4, size - 4);
        // Rak bertingkat
        c.fillStyle = '#334155';
        c.fillRect(2, 10, size - 4, 2);
        c.fillRect(2, 20, size - 4, 2);
        // Siluet radas kaca di dalam kabinet
        c.fillStyle = '#5eead4';
        c.fillRect(6, 4, 4, 6);
        c.fillRect(14, 4, 3, 6);
        c.fillRect(22, 4, 4, 6);
        c.fillStyle = '#fcd34d';
        c.fillRect(8, 14, 5, 6);
        c.fillRect(18, 14, 6, 6);
        // Pemegang pintu
        c.fillStyle = '#e2e8f0';
        c.fillRect(size / 2 - 1, size / 2 - 4, 2, 8);
      });

      // 9: Kerusi Bangku Makmal (Lab Stool Obstacle)
      textures[9] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);
        // Kaki logam kerusi
        c.strokeStyle = '#64748b';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(8, 8);
        c.lineTo(24, 24);
        c.moveTo(24, 8);
        c.lineTo(8, 24);
        c.stroke();
        // Tempat duduk bulat kerusi
        c.fillStyle = '#1e293b';
        c.beginPath();
        c.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#334155';
        c.beginPath();
        c.arc(size / 2 - 2, size / 2 - 2, 5, 0, Math.PI * 2);
        c.fill();
      });

      // 10: Kebuk Wasap / Fume Hood
      textures[10] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);
        // Tingkap kebuk wasap
        c.fillStyle = '#064e3b';
        c.fillRect(3, 4, size - 6, size - 8);
        c.fillStyle = '#34d399';
        c.globalAlpha = 0.6;
        c.fillRect(4, 6, size - 8, size - 12);
        c.globalAlpha = 1.0;
        // Jalur amaran kuning/hitam atas kebuk
        c.fillStyle = '#f59e0b';
        c.fillRect(0, 0, size, 4);
        c.fillStyle = '#000000';
        c.fillRect(6, 0, 4, 4);
        c.fillRect(16, 0, 4, 4);
        c.fillRect(26, 0, 4, 4);
      });

      // 11: Troli Peralatan Makmal (Equipment Trolley)
      textures[11] = makeCanvas((c) => {
        c.fillStyle = '#f8fafc';
        c.fillRect(0, 0, size, size);
        // Badan troli keluli
        c.fillStyle = '#475569';
        c.fillRect(3, 3, size - 6, size - 6);
        c.fillStyle = '#94a3b8';
        c.fillRect(5, 5, size - 10, size - 10);
        // Kotak alat atas troli
        c.fillStyle = '#0284c7';
        c.fillRect(8, 8, 8, 8);
        c.fillStyle = '#f59e0b';
        c.fillRect(18, 9, 6, 6);
        // Roda troli
        c.fillStyle = '#0f172a';
        c.fillRect(2, 2, 3, 3);
        c.fillRect(size - 5, 2, 3, 3);
        c.fillRect(2, size - 5, 3, 3);
        c.fillRect(size - 5, size - 5, 3, 3);
      });

      // 12: Stesen Pemulangan Peralatan (Interactive Storage Drop-off Target)
      textures[12] = makeCanvas((c) => {
        // Jubin bercahaya teal berseri
        c.fillStyle = '#042f2e';
        c.fillRect(0, 0, size, size);
        c.strokeStyle = '#14b8a6';
        c.lineWidth = 2;
        c.strokeRect(1, 1, size - 2, size - 2);
        // Simbol kotak pemulangan
        c.fillStyle = '#2dd4bf';
        c.fillRect(6, 6, size - 12, size - 12);
        c.fillStyle = '#042f2e';
        c.fillRect(8, 8, size - 16, size - 16);
        // Anak panah ke bawah (Deposit arrow)
        c.fillStyle = '#facc15';
        c.beginPath();
        c.moveTo(size / 2, 22);
        c.lineTo(size / 2 - 5, 14);
        c.lineTo(size / 2 + 5, 14);
        c.closePath();
        c.fill();
        c.fillRect(size / 2 - 2, 9, 4, 6);
      });

      // 13: Pintu Keluar Makmal Terkunci (Red Locked Exit Double Door)
      textures[13] = makeCanvas((c) => {
        c.fillStyle = '#1e293b';
        c.fillRect(0, 0, size, size);
        // Daun pintu keluli
        c.fillStyle = '#334155';
        c.fillRect(2, 0, size - 4, size);
        // Bingkai panel
        c.strokeStyle = '#475569';
        c.lineWidth = 1;
        c.strokeRect(4, 2, size - 8, size - 4);
        // Palang keselamatan merah terkunci
        c.fillStyle = '#ef4444';
        c.fillRect(2, size / 2 - 3, size - 4, 6);
        // Ikon mangga kunci merah bersinar
        c.fillStyle = '#fca5a5';
        c.beginPath();
        c.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
        c.fill();
      });

      // 14: Pintu Keluar Makmal DIBUKA (Green Glowing Exit Door Portal)
      textures[14] = makeCanvas((c) => {
        c.fillStyle = '#064e3b';
        c.fillRect(0, 0, size, size);
        // Cahaya hijau portal keluar
        c.fillStyle = '#10b981';
        c.fillRect(2, 0, size - 4, size);
        c.fillStyle = '#6ee7b7';
        c.fillRect(4, 2, size - 8, size - 4);
        // Tanda EXIT hijau
        c.fillStyle = '#ffffff';
        c.font = 'bold 8px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('BUKA', size / 2, size / 2);
      });

      return textures;
    }

    // 2. Cipta Sprite Pemain Pelajar Saintis (4 Arah, Jubah Makmal Putih & Cermin Mata)
    createStudentSprites() {
      const sprites = { down: [], up: [], left: [], right: [] };
      const w = 24;
      const h = 30;

      const makeFrame = (dir, step) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;

        // Ayunan kaki semasa berjalan
        const legOffset = (step === 1) ? 2 : (step === 2) ? -2 : 0;

        // Kaki seluar gelap
        cx.fillStyle = '#1e293b';
        if (dir === 'left' || dir === 'right') {
          cx.fillRect(9 + legOffset, 22, 6, 8);
        } else {
          cx.fillRect(6, 22 + (legOffset > 0 ? -1 : 0), 4, 8);
          cx.fillRect(14, 22 + (legOffset < 0 ? -1 : 0), 4, 8);
        }

        // Kasut hitam makmal
        cx.fillStyle = '#0f172a';
        if (dir === 'left') {
          cx.fillRect(7 + legOffset, 28, 7, 2);
        } else if (dir === 'right') {
          cx.fillRect(10 + legOffset, 28, 7, 2);
        } else {
          cx.fillRect(5, 28, 5, 2);
          cx.fillRect(14, 28, 5, 2);
        }

        // Jubah Makmal Putih (White Science Lab Coat)
        cx.fillStyle = '#f8fafc';
        cx.fillRect(5, 12, 14, 11);
        // Kolar dan butang makmal
        cx.strokeStyle = '#cbd5e1';
        cx.lineWidth = 1;
        cx.strokeRect(5, 12, 14, 11);
        cx.fillStyle = '#0f766e'; // Tali leher / lencana sekolah teal
        cx.fillRect(11, 13, 2, 4);
        cx.fillStyle = '#0d9488'; // Butang jubah
        cx.fillRect(11, 18, 2, 2);

        // Lengan jubah makmal
        cx.fillStyle = '#ffffff';
        if (dir === 'down') {
          cx.fillRect(3, 13, 3, 8);
          cx.fillRect(18, 13, 3, 8);
          cx.fillStyle = '#fbcfe8'; // Tangan
          cx.fillRect(3, 20, 3, 2);
          cx.fillRect(18, 20, 3, 2);
        } else if (dir === 'up') {
          cx.fillRect(3, 13, 3, 8);
          cx.fillRect(18, 13, 3, 8);
        } else if (dir === 'left') {
          cx.fillRect(6 + legOffset, 14, 4, 7);
          cx.fillStyle = '#fbcfe8';
          cx.fillRect(5 + legOffset, 19, 3, 2);
        } else if (dir === 'right') {
          cx.fillRect(14 + legOffset, 14, 4, 7);
          cx.fillStyle = '#fbcfe8';
          cx.fillRect(16 + legOffset, 19, 3, 2);
        }

        // Kepala / Rambut
        cx.fillStyle = '#451a03'; // Rambut coklat kemas
        cx.fillRect(6, 2, 12, 11);
        cx.fillStyle = '#fbcfe8'; // Muka tona kulit cerah
        cx.fillRect(7, 5, 10, 8);

        // Ciri muka mengikut arah
        if (dir === 'down') {
          // Rambut hadapan
          cx.fillStyle = '#451a03';
          cx.fillRect(7, 2, 10, 4);
          // Cermin mata keselamatan makmal (Teal frames)
          cx.strokeStyle = '#0d9488';
          cx.lineWidth = 1;
          cx.strokeRect(7, 6, 4, 3);
          cx.strokeRect(13, 6, 4, 3);
          cx.fillStyle = '#0d9488';
          cx.fillRect(11, 7, 2, 1);
          // Mata
          cx.fillStyle = '#0f172a';
          cx.fillRect(9, 7, 1, 1);
          cx.fillRect(14, 7, 1, 1);
          // Senyuman mesra
          cx.fillStyle = '#f43f5e';
          cx.fillRect(11, 11, 2, 1);
        } else if (dir === 'up') {
          // Rambut belakang penuh
          cx.fillStyle = '#451a03';
          cx.fillRect(6, 2, 12, 10);
        } else if (dir === 'left') {
          // Pandangan sisi kiri
          cx.fillStyle = '#451a03';
          cx.fillRect(8, 2, 10, 9);
          cx.fillStyle = '#fbcfe8';
          cx.fillRect(6, 6, 5, 6);
          // Cermin mata sisi
          cx.strokeStyle = '#0d9488';
          cx.lineWidth = 1;
          cx.strokeRect(6, 6, 3, 3);
          cx.fillStyle = '#0f172a';
          cx.fillRect(7, 7, 1, 1);
        } else if (dir === 'right') {
          // Pandangan sisi kanan
          cx.fillStyle = '#451a03';
          cx.fillRect(6, 2, 10, 9);
          cx.fillStyle = '#fbcfe8';
          cx.fillRect(13, 6, 5, 6);
          // Cermin mata sisi
          cx.strokeStyle = '#0d9488';
          cx.lineWidth = 1;
          cx.strokeRect(15, 6, 3, 3);
          cx.fillStyle = '#0f172a';
          cx.fillRect(16, 7, 1, 1);
        }

        return c;
      };

      ['down', 'up', 'left', 'right'].forEach((dir) => {
        sprites[dir] = [
          makeFrame(dir, 0), // Diam
          makeFrame(dir, 1), // Kaki kanan
          makeFrame(dir, 0), // Diam
          makeFrame(dir, 2)  // Kaki kiri
        ];
      });

      return sprites;
    }

    // 3. Cipta Sprite bagi 10 Peralatan Makmal (Original Crisp Procedural Sprites)
    createEquipmentSprites() {
      const sprites = {};
      const size = 26;

      const makeItemCanvas = (drawFn) => {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        drawFn(cx);
        return c;
      };

      // 1. Bikar (Beaker)
      sprites['bikar'] = makeItemCanvas((c) => {
        c.fillStyle = '#0d9488';
        c.fillRect(5, 8, 16, 15);
        c.fillStyle = '#2dd4bf'; // Cecair biru kehijauan
        c.fillRect(6, 12, 14, 10);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.strokeRect(5, 7, 16, 16);
        c.fillStyle = '#ffffff';
        c.fillRect(7, 10, 2, 2); // Gelembung
      });

      // 2. Mikroskop (Microscope)
      sprites['mikroskop'] = makeItemCanvas((c) => {
        c.fillStyle = '#334155';
        c.fillRect(4, 20, 18, 4); // Tapak
        c.fillStyle = '#64748b';
        c.fillRect(14, 8, 4, 13); // Lengan
        c.fillStyle = '#0284c7';
        c.fillRect(8, 6, 8, 5);  // Tiub kanta
        c.fillStyle = '#38bdf8';
        c.fillRect(6, 4, 4, 3);  // Kanta mata
        c.fillStyle = '#f59e0b';
        c.fillRect(8, 14, 4, 3); // Kanta objek
      });

      // 3. Kaca Slaid (Glass Slide)
      sprites['kaca_slaid'] = makeItemCanvas((c) => {
        c.fillStyle = '#bae6fd';
        c.fillRect(3, 8, 20, 10);
        c.strokeStyle = '#0284c7';
        c.lineWidth = 1;
        c.strokeRect(3, 8, 20, 10);
        c.fillStyle = '#f43f5e'; // Spesimen sel merah jambu
        c.fillRect(11, 11, 4, 4);
      });

      // 4. Penitis (Dropper)
      sprites['penitis'] = makeItemCanvas((c) => {
        c.fillStyle = '#ef4444'; // Puting getah merah
        c.fillRect(8, 4, 10, 5);
        c.fillStyle = '#e2e8f0'; // Tiub kaca
        c.fillRect(11, 9, 4, 10);
        c.fillStyle = '#38bdf8'; // Titisan cecair biru
        c.fillRect(12, 20, 2, 3);
      });

      // 5. Kelalang Kon (Conical Flask)
      sprites['kelalang_kon'] = makeItemCanvas((c) => {
        c.fillStyle = '#10b981'; // Cecair hijau
        c.beginPath();
        c.moveTo(10, 9);
        c.lineTo(16, 9);
        c.lineTo(21, 21);
        c.lineTo(5, 21);
        c.closePath();
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();
      });

      // 6. Silinder Penyukat (Measuring Cylinder)
      sprites['silinder_penyukat'] = makeItemCanvas((c) => {
        c.fillStyle = '#f59e0b'; // Cecair kuning jingga
        c.fillRect(9, 6, 8, 15);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.strokeRect(9, 4, 8, 18);
        c.fillStyle = '#ffffff';
        c.fillRect(8, 22, 10, 2); // Tapak
        c.fillRect(14, 8, 3, 1);  // Skala
        c.fillRect(14, 12, 3, 1);
        c.fillRect(14, 16, 3, 1);
      });

      // 7. Rak Tabung Uji (Test Tube Rack)
      sprites['rak_tabung_uji'] = makeItemCanvas((c) => {
        c.fillStyle = '#d97706'; // Rak kayu
        c.fillRect(3, 14, 20, 9);
        // Tabung warna-warni
        c.fillStyle = '#a855f7';
        c.fillRect(6, 6, 3, 12);
        c.fillStyle = '#3b82f6';
        c.fillRect(11, 8, 3, 10);
        c.fillStyle = '#ef4444';
        c.fillRect(16, 5, 3, 13);
      });

      // 8. Kanta Pembesar (Magnifying Glass)
      sprites['kanta_pembesar'] = makeItemCanvas((c) => {
        c.fillStyle = '#38bdf8'; // Kaca pembesar
        c.beginPath();
        c.arc(10, 10, 6, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#f59e0b'; // Bingkai tembaga
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = '#78350f'; // Pemegang
        c.fillRect(14, 14, 7, 7);
      });

      // 9. Tabung Uji (Single Test Tube)
      sprites['tabung_uji'] = makeItemCanvas((c) => {
        c.fillStyle = '#a855f7'; // Cecair ungu
        c.fillRect(10, 8, 6, 12);
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.strokeRect(10, 4, 6, 16);
      });

      // 10. Forseps (Forceps / Tweezers)
      sprites['forseps'] = makeItemCanvas((c) => {
        c.strokeStyle = '#cbd5e1'; // Keluli tahan karat
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(13, 4);
        c.lineTo(8, 22);
        c.moveTo(13, 4);
        c.lineTo(18, 22);
        c.stroke();
      });

      return sprites;
    }

    // 4. Kawalan Input Keyboard
    initInput() {
      const preventScroll = (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
        if (keys.includes(e.code)) e.preventDefault();
      };

      window.addEventListener('keydown', (e) => {
        preventScroll(e);
        if (this.isPaused || this.state !== GameState.PLAYING) return;

        switch (e.code) {
          case 'KeyW':
          case 'ArrowUp':
            this.keys.up = true;
            break;
          case 'KeyS':
          case 'ArrowDown':
            this.keys.down = true;
            break;
          case 'KeyA':
          case 'ArrowLeft':
            this.keys.left = true;
            break;
          case 'KeyD':
          case 'ArrowRight':
            this.keys.right = true;
            break;
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'KeyW':
          case 'ArrowUp':
            this.keys.up = false;
            break;
          case 'KeyS':
          case 'ArrowDown':
            this.keys.down = false;
            break;
          case 'KeyA':
          case 'ArrowLeft':
            this.keys.left = false;
            break;
          case 'KeyD':
          case 'ArrowRight':
            this.keys.right = false;
            break;
        }
      });
    }

    // Kawalan Maya Skrin Sentuh (D-pad)
    setTouchDirection(dir, isPressed) {
      if (this.isPaused || this.state !== GameState.PLAYING) return;
      if (dir === 'up') this.keys.up = isPressed;
      if (dir === 'down') this.keys.down = isPressed;
      if (dir === 'left') this.keys.left = isPressed;
      if (dir === 'right') this.keys.right = isPressed;
    }

    resetInputs() {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
      this.player.isMoving = false;
    }

    // 5. Penyesuaian Saiz Skrin & Canvas Responsive
    handleResize() {
      const container = this.canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      // Hadkan tinggi kanvas mengikut perkadaran makmal yang selesa
      const height = Math.min(Math.floor(width * 0.68), 580);

      this.canvas.width = width;
      this.canvas.height = height;

      this.camera.width = width;
      this.camera.height = height;

      this.ctx.imageSmoothingEnabled = false;
    }

    // 6. Pengesanan Perlanggaran (Collision Detection)
    // Nilai Tile Pepejal (SOLID): 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13
    isSolidTile(col, row) {
      if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return true;
      const tile = this.map[row][col];
      // Jika pintu keluar sudah dibuka (Tile 14), ia tidak lagi menghalang (Walkable)
      if (tile === 14) return false;
      // Jubin pepejal
      const solidTiles = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
      return solidTiles.includes(tile);
    }

    checkCollision(x, y, w, h) {
      // Periksa 4 bucu kotak sempadan pemain
      const leftCol = Math.floor((x - w / 2) / TILE_SIZE);
      const rightCol = Math.floor((x + w / 2 - 1) / TILE_SIZE);
      const topRow = Math.floor((y - h / 2) / TILE_SIZE);
      const bottomRow = Math.floor((y + h / 2 - 1) / TILE_SIZE);

      for (let r = topRow; r <= bottomRow; r++) {
        for (let c = leftCol; c <= rightCol; c++) {
          if (this.isSolidTile(c, r)) return true;
        }
      }
      return false;
    }

    // Buka Pintu Keluar Makmal selepas semua tugasan selesai
    unlockExitDoor() {
      this.isExitUnlocked = true;
      // Tukar tile pintu keluar kepada 14 (DIBUKA)
      this.map[EXIT_DOOR.row][EXIT_DOOR.col] = 14;
      this.map[EXIT_DOOR.row][EXIT_DOOR.col + 1] = 14;
      Audio.playUnlockDoor();

      // Tambah partikel perayaan di pintu keluar
      const doorX = (EXIT_DOOR.col + 1) * TILE_SIZE;
      const doorY = (EXIT_DOOR.row + 1) * TILE_SIZE;
      for (let i = 0; i < 35; i++) {
        this.particles.push({
          x: doorX + (Math.random() - 0.5) * 40,
          y: doorY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 120,
          vy: (Math.random() - 0.5) * 120 - 30,
          color: ['#10b981', '#34d399', '#facc15', '#38bdf8'][Math.floor(Math.random() * 4)],
          life: 1.5,
          maxLife: 1.5,
          size: 3 + Math.random() * 3
        });
      }
    }

    // 7. Kitaran Kemas Kini Fizik & Logik (Update Loop)
    update(dt) {
      if (this.isPaused || this.state !== GameState.PLAYING) return;

      // Kemas kini pemasa cooldown pintu
      if (this.exitCooldown > 0) this.exitCooldown -= dt;

      // Vektor pergerakan
      let dx = 0;
      let dy = 0;

      if (this.keys.up) dy -= 1;
      if (this.keys.down) dy += 1;
      if (this.keys.left) dx -= 1;
      if (this.keys.right) dx += 1;

      // Normalisasikan jika bergerak menyerong
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.SQRT2;
        dx *= factor;
        dy *= factor;
      }

      this.player.isMoving = (dx !== 0 || dy !== 0);

      if (this.player.isMoving) {
        // Tentukan arah hadap
        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.direction = dx > 0 ? 'right' : 'left';
        } else {
          this.player.direction = dy > 0 ? 'down' : 'up';
        }

        // Animasi hayunan kaki
        this.player.animTimer += dt;
        if (this.player.animTimer >= 0.14) {
          this.player.animTimer = 0;
          this.player.animFrame = (this.player.animFrame + 1) % 4;
        }

        // Pergerakan X berasingan dengan pengesanan halangan
        const newX = this.player.x + dx * this.player.speed * dt;
        if (!this.checkCollision(newX, this.player.y, this.player.width, this.player.height)) {
          this.player.x = newX;
        }

        // Pergerakan Y berasingan dengan pengesanan halangan
        const newY = this.player.y + dy * this.player.speed * dt;
        if (!this.checkCollision(this.player.x, newY, this.player.width, this.player.height)) {
          this.player.y = newY;
        }

        // Simpan dalam sempadan dunia
        this.player.x = Math.max(this.player.width, Math.min(this.worldWidth - this.player.width, this.player.x));
        this.player.y = Math.max(this.player.height, Math.min(this.worldHeight - this.player.height, this.player.y));

        this.onPlayerMove(this.player.x, this.player.y);
      } else {
        this.player.animFrame = 0;
      }

      // 8. Pengesanan Sentuhan 10 Peralatan Makmal
      const playerRadius = 18;
      for (let i = 0; i < this.equipmentList.length; i++) {
        const item = this.equipmentList[i];
        if (item.collected) continue;

        const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
        if (dist < playerRadius + 16) {
          // Pemain menyentuh peralatan!
          this.resetInputs();
          Audio.playPickup();

          // Partikel bersinar semasa mengambil peralatan
          for (let p = 0; p < 18; p++) {
            this.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80 - 20,
              color: '#facc15',
              life: 0.8,
              maxLife: 0.8,
              size: 2.5 + Math.random() * 2.5
            });
          }

          this.onEquipmentTrigger(item);
          break; // Elak cetus berganda
        }
      }

      // 9. Pengesanan Stesen Pemulangan Peralatan (Zone C)
      const storageX = (STORAGE_STATION.col + 1) * TILE_SIZE;
      const storageY = (STORAGE_STATION.row + 0.5) * TILE_SIZE;
      const distToStorage = Math.hypot(this.player.x - storageX, this.player.y - storageY);
      if (distToStorage < 32) {
        this.onStorageStationTrigger();
      }

      // 10. Pengesanan Pintu Keluar Makmal (Zon E)
      const exitDoorX = (EXIT_DOOR.col + 1) * TILE_SIZE;
      const exitDoorY = (EXIT_DOOR.row + 1) * TILE_SIZE;
      const distToExit = Math.hypot(this.player.x - exitDoorX, this.player.y - exitDoorY);

      if (distToExit < 38 && this.exitCooldown <= 0) {
        this.exitCooldown = 1.0; // Elak banjir cetusan
        this.onExitDoorTrigger(this.isExitUnlocked);
      }

      // Kemas kini partikel
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // 11. Kemas kini Kamera (Mengikut pemain dengan lancar)
      this.camera.x = Math.floor(this.player.x - this.camera.width / 2);
      this.camera.y = Math.floor(this.player.y - this.camera.height / 2);

      // Hadkan kamera kepada sempadan makmal
      this.camera.x = Math.max(0, Math.min(this.worldWidth - this.camera.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.worldHeight - this.camera.height, this.camera.y));
    }

    // 12. Render Paparan Dunia Makmal (Render Loop)
    render(time) {
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      // Bersihkan kanvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(-this.camera.x, -this.camera.y);

      // Tentukan julat jubin yang kelihatan dalam skrin (Culling)
      const startCol = Math.max(0, Math.floor(this.camera.x / TILE_SIZE));
      const endCol = Math.min(MAP_COLS - 1, Math.ceil((this.camera.x + this.camera.width) / TILE_SIZE));
      const startRow = Math.max(0, Math.floor(this.camera.y / TILE_SIZE));
      const endRow = Math.min(MAP_ROWS - 1, Math.ceil((this.camera.y + this.camera.height) / TILE_SIZE));

      // Lukis Jubin Peta Makmal
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tile = this.map[r][c];
          const sprite = this.tileSprites[tile] || this.tileSprites[0];
          ctx.drawImage(sprite, c * TILE_SIZE, r * TILE_SIZE);
        }
      }

      // Lukis Tanda Nama Zon Makmal di Lantai
      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.45;
      ctx.fillText('ZON B — SUDUT MIKROSKOPI', 9 * TILE_SIZE, 3.5 * TILE_SIZE);
      ctx.fillText('ZON D — DEMONSTRASI GURU', 25 * TILE_SIZE, 3.5 * TILE_SIZE);
      ctx.fillText('ZON A — MEJA EKSPERIMEN PELAJAR', 15 * TILE_SIZE, 12.5 * TILE_SIZE);
      ctx.fillText('ZON C — SIMPANAN RADAS', 31 * TILE_SIZE, 16.5 * TILE_SIZE);
      ctx.globalAlpha = 1.0;

      // Lukis Garis & Tanda Pintu Keluar Makmal di Dinding Atas
      ctx.fillStyle = this.isExitUnlocked ? '#10b981' : '#ef4444';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      const exitTitle = this.isExitUnlocked ? 'PINTU KELUAR MAKMAL (DIBUKA)' : 'PINTU KELUAR MAKMAL (TERKUNCI)';
      ctx.fillText(exitTitle, 19 * TILE_SIZE, 0.75 * TILE_SIZE);

      // Lukis 10 Peralatan Makmal yang Belum Dikumpulkan
      const now = (time || performance.now()) / 1000;
      for (let i = 0; i < this.equipmentList.length; i++) {
        const item = this.equipmentList[i];
        if (item.collected) continue;

        // Ayunan terapung lembut (Gentle bobbing animation)
        const bob = Math.sin(now * 3.5 + item.bobOffset) * 4;
        const drawX = item.x - 13;
        const drawY = item.y - 13 + bob;

        // Bayang kecil di bawah peralatan
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(item.x, item.y + 11, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lingkaran cahaya berseri di sekeliling peralatan (Golden glowing aura)
        const glowPulse = 0.5 + Math.sin(now * 4 + item.bobOffset) * 0.25;
        ctx.fillStyle = `rgba(20, 184, 166, ${glowPulse * 0.45})`;
        ctx.beginPath();
        ctx.arc(item.x, item.y + bob, 15, 0, Math.PI * 2);
        ctx.fill();

        // Lukis Sprite Peralatan
        const eqSprite = this.equipmentSprites[item.key];
        if (eqSprite) {
          ctx.drawImage(eqSprite, drawX, drawY);
        }

        // Nombor urutan peralatan kecil
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.id}`, item.x, drawY - 3);
      }

      // Lukis Pemain Pelajar Saintis
      const p = this.player;
      const pSprite = this.playerSprites[p.direction][p.animFrame];

      // Bayang pemain di lantai makmal
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 14, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lukis badan pemain
      ctx.drawImage(pSprite, Math.floor(p.x - p.width / 2), Math.floor(p.y - p.height / 2));

      // Lencana Nama Pemain di atas kepala
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(p.name).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(Math.floor(p.x - textWidth / 2 - 4), Math.floor(p.y - p.height / 2 - 16), textWidth + 8, 14);
      ctx.fillStyle = '#5eead4';
      ctx.fillText(p.name, p.x, p.y - p.height / 2 - 5);

      // Lukis Partikel Kesan Khas
      for (let i = 0; i < this.particles.length; i++) {
        const pt = this.particles[i];
        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      ctx.restore();
    }

    // 13. Kitaran Utama Animasi (Game Loop)
    loop(currentTime) {
      if (!this.lastTime) this.lastTime = currentTime;
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Hadkan dt maks 100ms
      this.lastTime = currentTime;

      this.update(dt);
      this.render(currentTime);

      this.animReqId = requestAnimationFrame((t) => this.loop(t));
    }

    start() {
      this.state = GameState.PLAYING;
      this.isPaused = false;
      this.lastTime = performance.now();
      if (!this.animReqId) {
        this.animReqId = requestAnimationFrame((t) => this.loop(t));
      }
    }

    pause() {
      this.state = GameState.PAUSED;
      this.isPaused = true;
      this.resetInputs();
    }

    resume() {
      this.state = GameState.PLAYING;
      this.isPaused = false;
      this.lastTime = performance.now();
    }

    stop() {
      if (this.animReqId) {
        cancelAnimationFrame(this.animReqId);
        this.animReqId = null;
      }
    }
  }

  // Eksport enjin ke skop global
  global.ARSelNelLabAdventure.LabAdventureGameEngine = LabAdventureGameEngine;

})(window);
