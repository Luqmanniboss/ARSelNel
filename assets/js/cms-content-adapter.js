/**
 * ARSelNel - Universal Supabase CMS Content Adapter (cms-content-adapter.js)
 * Connects Admin CMS and Student Pages to Supabase with automatic caching,
 * resilient offline fallback, and strict educational data preservation.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    NOTES: 'arselnel_smart_notes',
    VIDEOS: 'arselnel_cms_videos',
    QUIZZES: 'arselnel_cms_quizzes',
    GAME_QUESTIONS: 'arselnel_cms_game_questions',
    ORGANELLES: 'arselnel_cms_organelles',
    MODELS: 'arselnel_cms_models',
    DASHBOARD: 'arselnel_cms_dashboard_config',
    MANUAL: 'arselnel_cms_manual_steps',
    CONNECTION_CACHE: 'arselnel_cms_connection_state'
  };

  // =========================================================================
  // BUNDLED FALLBACK SEED DATA (Preserves 100% of existing content offline)
  // =========================================================================
  const BUNDLED_SEEDS = {
    quizzes: [
      {
        id: 'quiz_1',
        title: 'Pusat Kawalan Sel & Bahan Genetik',
        topic: 'Struktur Sel Haiwan & Tumbuhan',
        type: 'mcq',
        question: 'Apakah organel yang berfungsi sebagai "pusat kawalan" segala aktiviti sel dan mengandungi maklumat genetik (DNA)?',
        options: [
          { label: 'A', text: 'Ribosom' },
          { label: 'B', text: 'Nukleus' },
          { label: 'C', text: 'Vakuol' },
          { label: 'D', text: 'Sitoplasma' }
        ],
        correctAnswer: 'B',
        points: 10,
        difficulty: 'Sederhana',
        explanation: 'Nukleus mengandungi kromosom dengan DNA dan mengawal semua sintesis protein serta pembahagian sel.',
        image: '../assets/nota/icon_topic2.svg',
        publicationStatus: 'published',
        displayOrder: 1,
        createdAt: '2026-03-01'
      },
      {
        id: 'quiz_2',
        title: 'Perbezaan Dinding Sel Tumbuhan',
        topic: 'Sel Haiwan vs Sel Tumbuhan',
        type: 'tf',
        question: 'Sel tumbuhan mempunyai dinding sel tetap yang diperbuat daripada selulosa, manakala sel haiwan tidak mempunyai dinding sel.',
        options: [
          { label: 'A', text: 'Betul' },
          { label: 'B', text: 'Salah' }
        ],
        correctAnswer: 'A',
        points: 10,
        difficulty: 'Mudah',
        explanation: 'Dinding selulosa memberikan sokongan mekanikal dan bentuk yang tetap kepada sel tumbuhan.',
        image: '../assets/nota/icon_topic3.svg',
        publicationStatus: 'published',
        displayOrder: 2,
        createdAt: '2026-03-02'
      },
      {
        id: 'quiz_3',
        title: 'Stesen Janakuasa Sel (ATP)',
        topic: 'Organel & Fungsi',
        type: 'mcq',
        question: 'Organel manakah yang dikenali sebagai "stesen janakuasa sel" kerana menghasilkan tenaga dalam bentuk ATP melalui respirasi sel aerob?',
        options: [
          { label: 'A', text: 'Kloroplas' },
          { label: 'B', text: 'Mitokondria' },
          { label: 'C', text: 'Jasad Golgi' },
          { label: 'D', text: 'Sentriol' }
        ],
        correctAnswer: 'B',
        points: 10,
        difficulty: 'Sederhana',
        explanation: 'Mitokondria mengoksidakan glukosa bagi membebaskan tenaga kimia yang diperlukan oleh sel organisma.',
        image: '../assets/home/cell_model.svg',
        publicationStatus: 'published',
        displayOrder: 3,
        createdAt: '2026-03-05'
      },
      {
        id: 'quiz_4',
        title: 'Kloroplas & Fotosintesis',
        topic: 'Sel Haiwan vs Sel Tumbuhan',
        type: 'tf',
        question: 'Semua sel haiwan mengandungi kloroplas untuk menghasilkan makanan mereka sendiri melalui fotosintesis.',
        options: [
          { label: 'A', text: 'Betul' },
          { label: 'B', text: 'Salah' }
        ],
        correctAnswer: 'B',
        points: 10,
        difficulty: 'Mudah',
        explanation: 'Sel haiwan tidak mempunyai kloroplas. Hanya sel tumbuhan berklorofil dan alga tertentu yang menjalankan fotosintesis.',
        image: '../assets/nota/icon_topic3.svg',
        publicationStatus: 'published',
        displayOrder: 4,
        createdAt: '2026-03-07'
      },
      {
        id: 'quiz_5',
        title: 'Hierarki Organisasi Sel',
        topic: 'Organisasi Sel & Sistem',
        type: 'matching',
        question: 'Pilih urutan hierarki organisasi sel daripada peringkat paling ringkas kepada paling kompleks dalam organisma multisel.',
        options: [
          { label: 'A', text: 'Sel → Tisu → Organ → Sistem → Organisma' },
          { label: 'B', text: 'Tisu → Sel → Organ → Sistem → Organisma' },
          { label: 'C', text: 'Organ → Sel → Tisu → Organisma → Sistem' },
          { label: 'D', text: 'Sistem → Organ → Tisu → Sel → Organisma' }
        ],
        correctAnswer: 'A',
        points: 15,
        difficulty: 'Sukar',
        explanation: 'Sel membina tisu yang serupa fungsinya, tisu membina organ, organ membentuk sistem organ, dan sistem menyokong organisma lengkap.',
        image: '../assets/nota/icon_topic1.svg',
        publicationStatus: 'published',
        displayOrder: 5,
        createdAt: '2026-03-10'
      }
    ],
    notes: [
      {
        id: 'note_1',
        title: '1. Sel sebagai Unit Asas Kehidupan',
        chapter: 'Bab 2: Sel Sebagai Unit Asas',
        form: 'Tingkatan 1',
        readingTime: '5 Minit',
        description: 'Asal usul teori sel, penemuan Robert Hooke pada 1665, dan kepentingan sel dalam biologi moden.',
        content: `### Pengenalan Kepada Sel\nSemua hidupan terdiri daripada unit asas mikroskopik yang dinamakan **sel**. Pada tahun 1665, saintis Inggeris Robert Hooke pertama kali memerhatikan rongga halus seperti sarang lebah pada hirisan gabus kayu menggunakan mikroskop ciptaannya.\n\n#### Teras Teori Sel Moden:\n1. Semua organisma hidup terdiri daripada satu atau lebih sel.\n2. Sel merupakan unit struktur dan fungsi asas semua hidupan.\n3. Sel baru terhasil daripada pembahagian sel sedia ada.\n\n> Sel membolehkan organisma unisel seperti Amoeba sp. dan Paramecium sp. meneruskan kemandirian hidup walaupun hanya mempunyai satu sel tunggal.`,
        image: '../assets/nota/icon_topic1.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 342,
        displayOrder: 1,
        createdAt: '2026-02-18'
      },
      {
        id: 'note_2',
        title: '2. Struktur & Organel Sel Haiwan',
        chapter: 'Bab 2: Struktur Sel',
        form: 'Tingkatan 1',
        readingTime: '6 Minit',
        description: 'Analisis mendalam membran sel, sitoplasma, nukleus, serta peranan mitokondria dalam respirasi sel.',
        content: `### Ciri-Ciri Utama Sel Haiwan\nSel haiwan tidak mempunyai bentuk yang tetap kerana tidak disokong oleh dinding selulosa yang tegar.\n\n#### Organel Penting Sel Haiwan:\n* **Membran Plasma:** Lapisan separa telap yang mengawal keluar masuk bahan terlarut.\n* **Nukleus:** Mengandungi kromosom (DNA) dan mengawal aktiviti sintesis kimia sel.\n* **Sitoplasma:** Medium seperti jeli tempat berlakunya tindak balas biokimia.\n* **Mitokondria:** Menghasilkan tenaga ATP melalui metabolisme glukosa respirasi aerob.\n* **Vakuol Kecil:** Bertindak mengawal imbangan osmosis dan menyimpan bahan buangan.`,
        image: '../assets/nota/icon_topic2.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 520,
        displayOrder: 2,
        createdAt: '2026-02-20'
      },
      {
        id: 'note_3',
        title: '3. Struktur Sel Tumbuhan & Keunikannya',
        chapter: 'Bab 2: Struktur Sel',
        form: 'Tingkatan 1',
        readingTime: '5 Minit',
        description: 'Memahami kloroplas, vakuol bersaiz besar, dinding selulosa, dan keupayaan fotosintesis.',
        content: `### Keistimewaan Sel Tumbuhan\nSel tumbuhan mempunyai adaptasi morfologi khas untuk menghasilkan makanan sendiri (autotrof) dan kekal tegak melawan tarikan graviti.\n\n#### 3 Struktur Unik Sel Tumbuhan:\n1. **Dinding Selulosa:** Melindungi integriti sel dan menghalang sel daripada meletup apabila menyerap air berlebihan.\n2. **Kloroplas:** Mengandungi pigmen klorofil yang menyerap tenaga suria bagi sintesis glukosa.\n3. **Vakuol Sentral Besar:** Dipenuhi sap sel yang mengekalkan tekanan kesegahan (turgid) daun dan batang herba.`,
        image: '../assets/nota/icon_topic3.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 410,
        displayOrder: 3,
        createdAt: '2026-02-22'
      },
      {
        id: 'note_4',
        title: '4. Organisasi Sel Dalam Organisma Multisel',
        chapter: 'Bab 2: Organisasi Sel',
        form: 'Tingkatan 1',
        readingTime: '7 Minit',
        description: 'Hierarki biologi: Pembentukan tisu epitelium, organ perkumuhan, dan sistem peredaran darah manusia.',
        content: `### Pembahagian Kerja Dalam Sel Multisel\nDalam hidupan kompleks seperti manusia, sel tidak boleh bekerja secara bersendirian. Sel mengalami pengkhususan (*differentiation*) bentuk dan fungsi untuk membentuk sistem terselaras.`,
        image: '../assets/nota/icon_topic4.svg',
        contentType: 'interactive',
        publicationStatus: 'draft',
        views: 89,
        displayOrder: 4,
        createdAt: '2026-03-01'
      }
    ],
    videos: [
      {
        id: 'vid_1',
        title: 'Eksplorasi Struktur Sel Haiwan & Tumbuhan 3D',
        category: 'Biologi Sel',
        url: 'https://www.youtube.com/embed/URUJD5NEXC8',
        thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
        duration: '06:15',
        instructor: 'Cikgu Sains ARSelNel',
        description: 'Animasi visual 3D pergerakan organel mikroskopik sel di bawah mikroskop elektron resolusi tinggi.',
        views: 1240,
        publicationStatus: 'published',
        displayOrder: 1,
        createdAt: '2026-02-10'
      },
      {
        id: 'vid_2',
        title: 'Bagaimana Mitokondria Menjana Tenaga ATP?',
        category: 'Fisiologi Sel',
        url: 'https://www.youtube.com/embed/4GZ3p4vN6zY',
        thumbnail: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
        duration: '04:40',
        instructor: 'Dr. Farhan (Bioteknologi)',
        description: 'Kupasan mudah respirasi aerob dan fungsi krista mitokondria untuk pelajar Menengah Rendah.',
        views: 980,
        publicationStatus: 'published',
        displayOrder: 2,
        createdAt: '2026-02-14'
      },
      {
        id: 'vid_3',
        title: 'Amali Mikroskop: Mengamati Sel Bawang & Sel Pipi',
        category: 'Amali Sains',
        url: 'https://www.youtube.com/embed/9G3Xm8q2Uis',
        thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&auto=format&fit=crop&q=80',
        duration: '08:12',
        instructor: 'Makmal Maya ARSelNel',
        description: 'Langkah penyediaan slaid basah dengan larutan metilena biru dan iodin mengikut sukatan KSSM.',
        views: 1650,
        publicationStatus: 'published',
        displayOrder: 3,
        createdAt: '2026-02-28'
      }
    ],
    organelles: [
      {
        id: 'membrane',
        cellType: 'both',
        name: 'Membran sel',
        icon: '🫧',
        description: 'Lapisan nipis yang mengelilingi sel. Membran mengawal pergerakan bahan masuk dan keluar sel.',
        fact: 'Membran sel terdapat pada kedua-dua sel haiwan dan sel tumbuhan.',
        color: '#13a99c',
        displayOrder: 1,
        publicationStatus: 'published'
      },
      {
        id: 'cytoplasm',
        cellType: 'both',
        name: 'Sitoplasma',
        icon: '💧',
        description: 'Bahan seperti jeli yang mengisi ruang di dalam sel. Banyak tindak balas kimia sel berlaku dalam sitoplasma.',
        fact: 'Organel sel berada di dalam sitoplasma.',
        color: '#8ddbd3',
        displayOrder: 2,
        publicationStatus: 'published'
      },
      {
        id: 'nucleus',
        cellType: 'both',
        name: 'Nukleus',
        icon: '🧬',
        description: 'Nukleus mengandungi bahan genetik (DNA) dan mengawal seluruh aktiviti sel.',
        fact: 'Nukleus ialah antara struktur sel yang paling mudah diperhatikan menggunakan mikroskop cahaya makmal sekolah.',
        color: '#8e4cc4',
        displayOrder: 3,
        publicationStatus: 'published'
      },
      {
        id: 'mitochondria',
        cellType: 'both',
        name: 'Mitokondrion',
        icon: '⚡',
        description: 'Mitokondrion ialah tapak respirasi sel untuk membebaskan tenaga dalam bentuk ATP daripada makanan.',
        fact: 'Bentuknya lazimnya bujur atau memanjang dengan lipatan membran dalam (krista).',
        color: '#e66a35',
        displayOrder: 4,
        publicationStatus: 'published'
      },
      {
        id: 'wall',
        cellType: 'plant',
        name: 'Dinding sel',
        icon: '🧱',
        description: 'Lapisan tegar di luar membran sel tumbuhan. Dinding sel menyokong dan melindungi sel serta membantu mengekalkan bentuk tetapnya.',
        fact: 'Dinding sel tumbuhan terutamanya terdiri daripada gentian selulosa.',
        color: '#348a4d',
        displayOrder: 5,
        publicationStatus: 'published'
      },
      {
        id: 'chloroplast',
        cellType: 'plant',
        name: 'Kloroplas',
        icon: '☀️',
        description: 'Kloroplas mengandungi pigmen klorofil dan menjadi tapak fotosintesis, iaitu proses menghasilkan glukosa menggunakan tenaga cahaya matahari.',
        fact: 'Kloroplas terdapat dalam sel tumbuhan hijau, tetapi tiada dalam sel haiwan.',
        color: '#4c9b36',
        displayOrder: 6,
        publicationStatus: 'published'
      },
      {
        id: 'vacuole',
        cellType: 'both',
        name: 'Vakuol',
        icon: '💧',
        description: 'Dalam sel tumbuhan, vakuol pusat bersaiz besar menyimpan sap sel dan mengekalkan kesegahan sel. Sel haiwan mempunyai vakuol kecil jika ada.',
        fact: 'Vakuol pusat tumbuhan biasanya besar; vakuol sel haiwan bersaiz kecil dan bersifat sementara.',
        color: '#38a9c6',
        displayOrder: 7,
        publicationStatus: 'published'
      },
      {
        id: 'er',
        cellType: 'both',
        name: 'Retikulum endoplasma',
        icon: '🛤️',
        description: 'Rangkaian kantung membran dalam sel yang mengangkut bahan sintesis. Jenis kasar mempunyai ribosom pada permukaannya.',
        fact: 'Struktur tambahan untuk penerokaan; bukan fokus utama soalan asas Bab 2.',
        color: '#327bb5',
        displayOrder: 8,
        publicationStatus: 'published'
      },
      {
        id: 'golgi',
        cellType: 'both',
        name: 'Jasad Golgi',
        icon: '📦',
        description: 'Jasad Golgi mengubah suai, menyusun dan membungkus protein serta bahan sel sebelum dihantar ke destinasi tertentu.',
        fact: 'Struktur tambahan untuk penerokaan lanjut biologi sel.',
        color: '#e0a51b',
        displayOrder: 9,
        publicationStatus: 'published'
      },
      {
        id: 'ribosome',
        cellType: 'both',
        name: 'Ribosom',
        icon: '🟣',
        description: 'Struktur halus yang terlibat dalam sintesis protein sel.',
        fact: 'Ribosom terlalu seni untuk dilihat secara individu menggunakan mikroskop cahaya biasa.',
        color: '#5943a4',
        displayOrder: 10,
        publicationStatus: 'published'
      },
      {
        id: 'centrioles',
        cellType: 'animal',
        name: 'Sentriol',
        icon: '🧭',
        description: 'Sepasang struktur silinder kecil yang membantu pembentukan gentian gelendong semasa pembahagian sel haiwan.',
        fact: 'Sentriol hadir dalam kebanyakan sel haiwan tetapi lazimnya tiada dalam sel tumbuhan aras tinggi.',
        color: '#f0b429',
        displayOrder: 11,
        publicationStatus: 'published'
      },
      {
        id: 'lysosome',
        cellType: 'animal',
        name: 'Lisosom',
        icon: '🫧',
        description: 'Vesikel bermembran yang mengandungi enzim hidrolitik untuk mencerna zarah makanan atau menguraikan komponen sel usang.',
        fact: 'Lisosom bertindak sebagai sistem pelupusan dan pertahanan sel.',
        color: '#e985b8',
        displayOrder: 12,
        publicationStatus: 'published'
      }
    ],
    models: [
      {
        id: 'animal_cell',
        cellType: 'animal',
        name: 'Model 3D Sel Haiwan Blender GLB',
        modelUrl: '../models/animal_cell_final.glb',
        format: 'GLB',
        meshMappings: {},
        isActive: true
      },
      {
        id: 'plant_cell',
        cellType: 'plant',
        name: 'Model 3D Sel Tumbuhan Blender GLB',
        modelUrl: '../models/plantcellnew.glb',
        format: 'GLB',
        meshMappings: {},
        isActive: true
      }
    ],
    dashboardConfig: {
      id: 'default',
      heroGreeting: 'Hai, Saintis Muda!',
      heroModuleBadge: 'Modul 1: Sains Hayat',
      heroTitle: 'Struktur, Fungsi dan Organisasi Sel',
      heroDescription: 'Jom teroka dunia sains melalui eksperimen, video, AR dan permainan interaktif. Pilih aktiviti yang paling menarik untuk anda hari ini!',
      heroButtonPrimaryText: '🔬 Mula Teroka Sel',
      heroButtonPrimaryUrl: '../cellquest/code.html',
      heroButtonSecondaryText: 'Mulakan Cabaran Sains',
      heroButtonSecondaryUrl: '../hab_permainan/code.html',
      featuredRecommendation: {
        title: 'Cadangan Hari Ini: Perbandingan Sel Haiwan & Tumbuhan',
        description: 'Ketahui 3 perbezaan utama antara sel haiwan dan tumbuhan untuk menguasai soalan peperiksaan Sains.',
        buttonText: 'Mula Belajar Sekarang',
        buttonUrl: '../nota_pembelajaran/code.html',
        badge: 'Disyorkan'
      },
      moduleDescriptions: {
        cellquest: 'Terokai model 3D sel mikroskopik dalam Realiti Terimbuh (AR). Bedah dan lihat organel dari sudut 360 darjah.',
        notes: 'Akses nota ringkas padat berserta infografik visual menarik mengikut silibus Sains Tingkatan 1 KSSM.',
        videos: 'Koleksi video animasi dan demonstrasi amali eksperimen sains untuk pemahaman konsep yang mendalam.',
        selbot: 'Tanya soalan sains kepada tutor pintar berkuasa AI yang sedia membantu 24/7.',
        games: 'Uji pengetahuan anda melalui permainan arked seperti Maze Chase, cabaran susun organel dan misi makmal.'
      }
    }
  };

  // =========================================================================
  // ROBUST RESPONSE PARSER & MEDIA HELPERS
  // =========================================================================
  async function parseApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      let bodySnippet = '';
      try { bodySnippet = await response.text(); } catch (_) {}
      throw new Error(`Permintaan pelayan gagal (${response.status}): ${bodySnippet.slice(0, 180)}`);
    }
    if (!contentType.includes('application/json')) {
      throw new Error('Pelayan tidak memulangkan JSON. Sila semak konfigurasi API dan Vercel.');
    }
    return response.json();
  }

  function normalizeVideoUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const trimmed = rawUrl.trim();
    const watchMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/i);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    const shortMatch = trimmed.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/i);
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    const embedMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }
    return trimmed;
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  class CMSContentAdapter {
    constructor() {
      this.supabaseClient = null;
      this.connectionStatus = 'connecting'; // 'connected' | 'connecting' | 'failed' | 'unconfigured'
      this.connectionDetails = {
        message: 'Memulakan pengesahan sambungan...',
        latencyMs: 0,
        configured: false,
        authenticated: false,
        isAdmin: false,
        tablesVerified: []
      };
      this.parseApiResponse = parseApiResponse;
      this.normalizeVideoUrl = normalizeVideoUrl;
      this.initPromise = this.init();
    }

    async init(force = false) {
      if (this._inited && !force) return;
      this._inited = true;

      try {
        // 1. Fetch public configuration with resilient fallback
        let config = null;
        try {
          const res = await fetch('/api/public-config', { headers: { Accept: 'application/json' } });
          if (res.ok) config = await parseApiResponse(res);
        } catch (_) {}

        // Resilient fallback if running via file:// protocol or alternative local server
        if (!config || !config.configured || !config.url) {
          config = {
            configured: true,
            url: 'https://kxjhlbudsiojpvzwqwva.supabase.co',
            publishableKey: 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U'
          };
        }

        this.connectionDetails.configured = true;

        // 2. Initialize Supabase Client
        if (global.ARSupabase && typeof global.ARSupabase.getClient === 'function') {
          try {
            this.supabaseClient = await global.ARSupabase.getClient();
          } catch (_) {}
        }
        if (!this.supabaseClient && global.supabase && typeof global.supabase.createClient === 'function') {
          this.supabaseClient = global.supabase.createClient(config.url, config.publishableKey, {
            auth: { storage: global.sessionStorage, autoRefreshToken: true, persistSession: true }
          });
        }

        if (!this.supabaseClient) {
          this.setConnection('failed', 'Pustaka Supabase JS tidak tersedia');
          return;
        }

        // 3. Test latency and read connectivity with real REST ping
        const startTime = Date.now();
        const { data: pingData, error: pingErr } = await this.supabaseClient
          .from('cms_videos')
          .select('id')
          .limit(1);

        const latency = Math.max(12, Date.now() - startTime);
        this.connectionDetails.latencyMs = latency;

        if (pingErr) {
          console.warn('[CMSAdapter] REST ping warning:', pingErr);
        }

        // Check Auth session
        try {
          const { data: { session } } = await this.supabaseClient.auth.getSession();
          if (session && session.user) {
            this.connectionDetails.authenticated = true;
            this.connectionDetails.userEmail = session.user.email;
            const isAdmin = await this.verifyAdminRole(session.user);
            this.connectionDetails.isAdmin = isAdmin;
          } else {
            // Check local AuthGuard fallback
            const localUser = this.getLocalUser();
            if (localUser && (localUser.role === 'admin' || localUser.role === 'guru' || localUser.role === 'teacher')) {
              this.connectionDetails.isAdmin = true;
              this.connectionDetails.userEmail = localUser.email || 'admin@arselnel.my';
            }
          }
        } catch (_) {}

        this.setConnection('connected', `Bersambung ke Supabase (${latency}ms)`);
      } catch (err) {
        console.warn('[CMSAdapter] Init error; falling back to offline storage mode:', err);
        this.setConnection('failed', `Sambungan gagal: ${err.message || 'Ralat rangkaian'}`);
      }
    }

    setConnection(status, message) {
      this.connectionStatus = status;
      this.connectionDetails.message = message;
      try {
        localStorage.setItem(STORAGE_KEYS.CONNECTION_CACHE, JSON.stringify({ status, message, timestamp: Date.now() }));
      } catch (_) {}
      global.dispatchEvent(new CustomEvent('arselnel:cms-connection', { detail: { status, message, details: this.connectionDetails } }));
    }

    getLocalUser() {
      try {
        if (global.AuthGuard && typeof global.AuthGuard.getUser === 'function') return global.AuthGuard.getUser();
        if (global.Auth && typeof global.Auth.getCurrentUser === 'function') return global.Auth.getCurrentUser();
        const raw = sessionStorage.getItem('arselnel_current_user') || localStorage.getItem('arselnel_current_user');
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }

    async verifyAdminRole(authUser) {
      if (!authUser || !authUser.id) return false;
      try {
        if (!this.supabaseClient) return false;
        // Check admin_users table
        const { data, error } = await this.supabaseClient
          .from('admin_users')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (!error && data && (data.role === 'admin' || data.role === 'superadmin' || data.role === 'teacher')) {
          return true;
        }
      } catch (_) {}

      // Fallback check metadata
      const meta = authUser.user_metadata || {};
      if (meta.role === 'admin' || meta.role === 'guru' || meta.role === 'teacher') {
        return true;
      }
      return false;
    }

    async checkConnection(force = false) {
      if (force) {
        await this.init(true);
      } else {
        await this.initPromise;
      }
      return {
        status: this.connectionStatus,
        statusLabel: this.getConnectionStatusLabel(this.connectionStatus),
        details: this.connectionDetails
      };
    }

    getConnectionStatusLabel(status) {
      switch (status) {
        case 'connected': return 'Bersambung';
        case 'connecting': return 'Sedang menyambung';
        case 'failed': return 'Gagal disambungkan';
        case 'unconfigured': return 'Konfigurasi belum lengkap';
        default: return 'Tidak diketahui';
      }
    }

    // =========================================================================
    // MEDIA & FILE UPLOAD HANDLER (Supabase Storage First, Safe Serverless Fallback)
    // =========================================================================
    async uploadMedia(file, folder = 'media', onProgress = null) {
      await this.initPromise;
      if (!file) throw new Error('Tiada fail dipilih.');

      const cleanName = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = '.' + (cleanName.split('.').pop() || '').toLowerCase();
      const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
      const isDoc = ['.pdf', '.pptx', '.ppt'].includes(ext);
      const isImg = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);

      if (!isVideo && !isDoc && !isImg) {
        throw new Error(`Format fail '${ext}' tidak disokong. Sila pilih fail PDF, PPTX, imej, atau video.`);
      }

      const maxVideoSize = 100 * 1024 * 1024; // 100MB
      const maxDocSize = 50 * 1024 * 1024;    // 50MB
      const maxImgSize = 15 * 1024 * 1024;    // 15MB

      if (isVideo && file.size > maxVideoSize) {
        throw new Error('Saiz video melebihi had maksimum 100MB.');
      }
      if (isDoc && file.size > maxDocSize) {
        throw new Error('Saiz dokumen melebihi had maksimum 50MB.');
      }
      if (isImg && file.size > maxImgSize) {
        throw new Error('Saiz imej melebihi had maksimum 15MB.');
      }

      if (typeof onProgress === 'function') onProgress(15, 'Menyediakan fail untuk muat naik...');

      const timestamp = Date.now();
      const storagePath = `${folder}/${timestamp}_${cleanName}`;

      // 1. Direct upload to Supabase Storage if client connected
      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          if (typeof onProgress === 'function') onProgress(40, 'Memuat naik ke Supabase Storage...');
          const { data, error } = await this.supabaseClient.storage
            .from('educational_media')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (!error && data) {
            const { data: pubData } = this.supabaseClient.storage
              .from('educational_media')
              .getPublicUrl(storagePath);

            if (typeof onProgress === 'function') onProgress(100, 'Muat naik ke Supabase Storage selesai!');
            return {
              success: true,
              url: pubData ? pubData.publicUrl : '',
              storagePath: storagePath,
              filename: cleanName,
              size: file.size,
              source: 'supabase-storage',
              message: 'Fail berjaya dimuat naik ke Supabase Storage.'
            };
          } else if (error) {
            console.warn('[CMSAdapter] Supabase Storage upload error:', error.message || error);
          }
        } catch (e) {
          console.warn('[CMSAdapter] Supabase Storage exception:', e);
        }
      }

      // 2. Fallback to /api/slides/upload serverless function if <= 4.5MB
      if (file.size <= 4.5 * 1024 * 1024) {
        try {
          if (typeof onProgress === 'function') onProgress(60, 'Memuat naik melalui pelayan API...');
          const dataUrl = await readFileAsDataURL(file);
          const response = await fetch('/api/slides/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, dataUrl })
          });
          const json = await parseApiResponse(response);
          if (json && json.success) {
            if (typeof onProgress === 'function') onProgress(100, 'Muat naik pelayan berjaya!');
            return json;
          }
        } catch (apiErr) {
          console.warn('[CMSAdapter] /api/slides/upload fallback failed:', apiErr.message);
        }
      } else {
        throw new Error(`Muat naik gagal: Saiz fail (${(file.size / (1024*1024)).toFixed(1)}MB) melebihi had muat naik pelayan (4.5MB) dan storan Supabase belum tersedia. Sila semak sambungan Supabase Storage.`);
      }

      // 3. Fallback to Data URL for smaller documents/images (< 3MB)
      if (file.size <= 3 * 1024 * 1024) {
        if (typeof onProgress === 'function') onProgress(90, 'Memproses data tempatan...');
        const dataUrl = await readFileAsDataURL(file);
        if (typeof onProgress === 'function') onProgress(100, 'Selesai');
        return {
          success: true,
          url: dataUrl,
          storagePath: `data:${cleanName}`,
          filename: cleanName,
          size: file.size,
          source: 'data-url',
          message: 'Fail disimpan sebagai Data URL tempatan.'
        };
      }

      throw new Error('Muat naik gagal. Sila semak sambungan internet dan konfigurasi Supabase Storage.');
    }

    // =========================================================================
    // 1. NOTES CMS
    // =========================================================================
    async getNotes(filters = {}) {
      await this.initPromise;
      let notes = [];

      // Try Supabase first
      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('learning_notes').select('*').order('created_at', { ascending: false });
          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            notes = data.map(row => ({
              id: row.id,
              title: row.title,
              chapter: row.chapter,
              description: row.description || '',
              contentType: row.content_type || 'interactive',
              sourceUrl: row.source_url || '',
              storagePath: row.storage_path || '',
              slideCount: row.slide_count || 1,
              publicationStatus: row.publication_status || 'published',
              slides: row.slide_data || [],
              views: row.views || 0,
              createdAt: row.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
            return notes;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote notes read failed; using local cache.', e);
        }
      }

      // Fallback: LocalStorage
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.NOTES);
        if (cached) {
          notes = JSON.parse(cached);
        }
      } catch (_) {}

      // Fallback: Bundled seeds
      if (!Array.isArray(notes) || notes.length === 0) {
        notes = BUNDLED_SEEDS.notes.slice();
      }

      if (filters.status && filters.status !== 'all') {
        notes = notes.filter(n => n.publicationStatus === filters.status);
      }
      return notes;
    }

    async saveNote(note) {
      await this.initPromise;
      if (!note || !note.title) {
        throw new Error('Tajuk nota adalah wajib diisi.');
      }

      const record = {
        id: note.id || `note_${Date.now()}`,
        title: String(note.title).trim(),
        chapter: note.chapter || 'Bab 2: Sel Sebagai Unit Asas Hidupan',
        description: note.description || '',
        contentType: note.contentType || 'interactive',
        sourceUrl: note.sourceUrl || '',
        storagePath: note.storagePath || '',
        slideCount: Number(note.slideCount) || (note.slides ? note.slides.length : 1),
        publicationStatus: note.publicationStatus || 'published',
        slides: note.slides || [],
        views: Number(note.views) || 0,
        createdAt: note.createdAt || new Date().toISOString()
      };

      // 1. Save locally (guarantee caching)
      try {
        const local = await this.getNotes({ status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.unshift(record);
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save note locally:', err);
      }

      // 2. Sync to Supabase if connected
      let remotePersisted = false;
      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const dbRow = {
            id: record.id,
            title: record.title,
            chapter: record.chapter,
            description: record.description,
            content_type: record.contentType,
            source_url: record.sourceUrl,
            storage_path: record.storagePath,
            slide_count: record.slideCount,
            slide_data: record.slides,
            publication_status: record.publicationStatus,
            updated_at: new Date().toISOString()
          };
          const { error } = await this.supabaseClient
            .from('learning_notes')
            .upsert(dbRow, { onConflict: 'id' });
          if (error) {
            console.warn('[CMSAdapter] Remote saveNote error:', error);
            // If table doesn't exist, provide clear message
            if (error.code === 'PGRST205' || (error.message && error.message.includes('learning_notes'))) {
              throw new Error('Jadual "learning_notes" belum wujud di Supabase. Sila jalankan migrasi SQL di Supabase SQL Editor.');
            }
            throw new Error(`Gagal menyimpan ke Supabase: ${error.message || 'Ralat RLS/Pangkalan Data'}`);
          }
          remotePersisted = true;
        } catch (e) {
          throw e;
        }
      }

      return { ...record, remotePersisted };
    }

    async deleteNote(id) {
      await this.initPromise;
      try {
        const local = await this.getNotes({ status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('learning_notes').delete().eq('id', id);
          if (error && error.code !== 'PGRST205') {
            console.warn('[CMSAdapter] Remote deleteNote error:', error);
          }
        } catch (_) {}
      }
      return true;
    }

    // =========================================================================
    // 2. VIDEOS CMS
    // =========================================================================
    async getVideos(filters = {}) {
      await this.initPromise;
      let videos = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('cms_videos').select('*').order('display_order', { ascending: true });
          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            videos = data.map(r => ({
              id: r.id,
              title: r.title,
              category: r.category,
              url: r.url,
              thumbnail: r.thumbnail,
              duration: r.duration,
              instructor: r.instructor,
              description: r.description,
              views: r.views,
              publicationStatus: r.publication_status,
              displayOrder: r.display_order,
              createdAt: r.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
            return videos;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getVideos error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.VIDEOS);
        if (cached) videos = JSON.parse(cached);
      } catch (_) {}

      if (!Array.isArray(videos) || videos.length === 0) {
        videos = BUNDLED_SEEDS.videos.slice();
      }

      if (filters.status && filters.status !== 'all') {
        videos = videos.filter(v => v.publicationStatus === filters.status);
      }
      return videos;
    }

    async saveVideo(video) {
      await this.initPromise;
      if (!video || !video.title || !video.url) {
        throw new Error('Tajuk video dan pautan/fail video adalah wajib diisi.');
      }

      const normalizedUrl = normalizeVideoUrl(video.url);

      const record = {
        id: video.id || `vid_${Date.now()}`,
        title: String(video.title).trim(),
        category: video.category || 'Biologi Sel',
        url: normalizedUrl,
        thumbnail: video.thumbnail || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
        duration: video.duration || '05:00',
        instructor: video.instructor || 'Cikgu Sains ARSelNel',
        description: video.description || '',
        views: Number(video.views) || 0,
        publicationStatus: video.publicationStatus || 'published',
        displayOrder: Number(video.displayOrder) || 1,
        createdAt: video.createdAt || new Date().toISOString()
      };

      try {
        const local = await this.getVideos({ status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.push(record);
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save video locally:', err);
      }

      let remotePersisted = false;
      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_videos').upsert({
            id: record.id,
            title: record.title,
            category: record.category,
            url: record.url,
            thumbnail: record.thumbnail,
            duration: record.duration,
            instructor: record.instructor,
            description: record.description,
            views: record.views,
            publication_status: record.publicationStatus,
            display_order: record.displayOrder,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) {
            console.warn('[CMSAdapter] Remote saveVideo error:', error);
            throw new Error(`Gagal menyimpan video ke Supabase: ${error.message || 'Ralat pangkalan data'}`);
          }
          remotePersisted = true;
        } catch (e) {
          throw e;
        }
      }

      return { ...record, remotePersisted };
    }

    async deleteVideo(id) {
      await this.initPromise;
      try {
        const local = await this.getVideos({ status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_videos').delete().eq('id', id);
          if (error) console.warn('[CMSAdapter] Remote deleteVideo error:', error);
        } catch (_) {}
      }
      return true;
    }

    // =========================================================================
    // 3. QUIZZES CMS
    // =========================================================================
    async getQuizzes(filters = {}) {
      await this.initPromise;
      let quizzes = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('cms_quizzes').select('*').order('display_order', { ascending: true });
          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            quizzes = data.map(r => ({
              id: r.id,
              title: r.title,
              topic: r.topic,
              type: r.type,
              question: r.question,
              options: r.options,
              correctAnswer: r.correct_answer,
              points: r.points,
              difficulty: r.difficulty,
              explanation: r.explanation,
              image: r.image,
              publicationStatus: r.publication_status,
              displayOrder: r.display_order,
              createdAt: r.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
            return quizzes;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getQuizzes error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.QUIZZES);
        if (cached) quizzes = JSON.parse(cached);
      } catch (_) {}

      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        quizzes = BUNDLED_SEEDS.quizzes.slice();
      }

      if (filters.status && filters.status !== 'all') {
        quizzes = quizzes.filter(q => q.publicationStatus === filters.status);
      }
      return quizzes;
    }

    async saveQuiz(quiz) {
      await this.initPromise;
      if (!quiz || !quiz.question) {
        throw new Error('Teks soalan kuiz adalah wajib diisi.');
      }

      const record = {
        id: quiz.id || `quiz_${Date.now()}`,
        title: quiz.title || 'Soalan Kuiz Sains',
        topic: quiz.topic || 'Struktur Sel Haiwan & Tumbuhan',
        type: quiz.type || 'mcq',
        question: quiz.question,
        options: quiz.options || [],
        correctAnswer: quiz.correctAnswer || 'A',
        points: Number(quiz.points) || 10,
        difficulty: quiz.difficulty || 'Sederhana',
        explanation: quiz.explanation || '',
        image: quiz.image || '../assets/nota/icon_topic2.svg',
        publicationStatus: quiz.publicationStatus || 'published',
        displayOrder: Number(quiz.displayOrder) || 1,
        createdAt: quiz.createdAt || new Date().toISOString()
      };

      try {
        const local = await this.getQuizzes({ status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.push(record);
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save quiz locally:', err);
      }

      let remotePersisted = false;
      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_quizzes').upsert({
            id: record.id,
            title: record.title,
            topic: record.topic,
            type: record.type,
            question: record.question,
            options: record.options,
            correct_answer: record.correctAnswer,
            points: record.points,
            difficulty: record.difficulty,
            explanation: record.explanation,
            image: record.image,
            publication_status: record.publicationStatus,
            display_order: record.displayOrder,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) {
            console.warn('[CMSAdapter] Remote saveQuiz error:', error);
            throw new Error(`Gagal menyimpan soalan kuiz ke Supabase: ${error.message}`);
          }
          remotePersisted = true;
        } catch (e) {
          throw e;
        }
      }

      return { ...record, remotePersisted };
    }

    async deleteQuiz(id) {
      await this.initPromise;
      try {
        const local = await this.getQuizzes({ status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_quizzes').delete().eq('id', id);
          if (error) console.warn('[CMSAdapter] Remote deleteQuiz error:', error);
        } catch (_) {}
      }
      return true;
    }

    // =========================================================================
    // 4. GAME QUESTION BANKS (Maze Chase, Adventure 2D, Makmal Sains)
    // =========================================================================
    async getGameQuestions(gameId = 'maze_chase', filters = {}) {
      await this.initPromise;
      let questions = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient
            .from('cms_game_questions')
            .select('*')
            .eq('game_id', gameId)
            .order('display_order', { ascending: true });

          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            questions = data.map(r => ({
              id: r.id,
              gameId: r.game_id,
              mazeTitle: r.maze_title,
              landmark: r.landmark,
              difficulty: r.difficulty,
              difficultyLabel: r.difficulty_label,
              points: r.points,
              question: r.question,
              options: r.options,
              correctAnswer: r.correct_answer,
              correctIndex: r.correct_index,
              explanation: r.explanation,
              reward: r.reward,
              displayOrder: r.display_order,
              publicationStatus: r.publication_status,
              createdAt: r.created_at
            }));
            const localKey = `${STORAGE_KEYS.GAME_QUESTIONS}_${gameId}`;
            localStorage.setItem(localKey, JSON.stringify(questions));
            return questions;
          }
        } catch (e) {
          console.warn(`[CMSAdapter] Remote getGameQuestions for ${gameId} failed; using local.`, e);
        }
      }

      try {
        const cached = localStorage.getItem(`${STORAGE_KEYS.GAME_QUESTIONS}_${gameId}`);
        if (cached) questions = JSON.parse(cached);
      } catch (_) {}

      // Fallback to game-specific bundled data
      if (!Array.isArray(questions) || questions.length === 0) {
        if (gameId === 'maze_chase' && global.MAZE_QUESTIONS) {
          questions = global.MAZE_QUESTIONS.map((q, idx) => ({
            id: `maze_q${idx + 1}`,
            gameId: 'maze_chase',
            mazeTitle: q.mazeTitle || `Maze ${idx + 1}`,
            difficulty: q.difficulty || 'medium',
            difficultyLabel: q.difficultyLabel || 'Aras Sederhana',
            points: q.points || 100,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.options ? q.options[q.correct] : '',
            correctIndex: q.correct !== undefined ? q.correct : 0,
            explanation: q.explanation || '',
            displayOrder: idx + 1,
            publicationStatus: 'published'
          }));
        } else if (gameId === 'adventure_2d' && global.ADVENTURE_QUESTIONS) {
          questions = global.ADVENTURE_QUESTIONS.map((q, idx) => ({
            id: `adv_q${idx + 1}`,
            gameId: 'adventure_2d',
            mazeTitle: q.title,
            landmark: q.landmark || 'Dataran Sains',
            difficulty: 'medium',
            difficultyLabel: 'Aras Sederhana',
            points: 100,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.options ? q.options[q.correct] : '',
            correctIndex: q.correct !== undefined ? q.correct : 0,
            explanation: q.explanation || '',
            displayOrder: idx + 1,
            publicationStatus: 'published'
          }));
        }
      }

      if (filters.status && filters.status !== 'all') {
        questions = questions.filter(q => q.publicationStatus === filters.status);
      }
      return questions;
    }

    async saveGameQuestion(question) {
      await this.initPromise;
      const gameId = question.gameId || 'maze_chase';
      const record = {
        id: question.id || `${gameId}_q_${Date.now()}`,
        gameId: gameId,
        mazeTitle: question.mazeTitle || '',
        landmark: question.landmark || '',
        difficulty: question.difficulty || 'medium',
        difficultyLabel: question.difficultyLabel || 'Aras Sederhana',
        points: Number(question.points) || 100,
        question: question.question,
        options: question.options || [],
        correctAnswer: question.correctAnswer || (question.options ? question.options[question.correctIndex || 0] : ''),
        correctIndex: Number(question.correctIndex) || 0,
        explanation: question.explanation || '',
        reward: question.reward || '',
        displayOrder: Number(question.displayOrder) || 1,
        publicationStatus: question.publicationStatus || 'published',
        createdAt: question.createdAt || new Date().toISOString()
      };

      try {
        const localKey = `${STORAGE_KEYS.GAME_QUESTIONS}_${gameId}`;
        const local = await this.getGameQuestions(gameId, { status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.push(record);
        localStorage.setItem(localKey, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save game question locally:', err);
      }

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_game_questions').upsert({
            id: record.id,
            game_id: record.gameId,
            maze_title: record.mazeTitle,
            landmark: record.landmark,
            difficulty: record.difficulty,
            difficulty_label: record.difficultyLabel,
            points: record.points,
            question: record.question,
            options: record.options,
            correct_answer: record.correctAnswer,
            correct_index: record.correctIndex,
            explanation: record.explanation,
            reward: record.reward,
            display_order: record.displayOrder,
            publication_status: record.publicationStatus,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) console.warn('[CMSAdapter] Remote saveGameQuestion error:', error);
        } catch (e) {
          console.warn('[CMSAdapter] Remote saveGameQuestion exception:', e);
        }
      }

      return record;
    }

    // =========================================================================
    // 5. CELLQUEST ORGANELLES & 3D MODELS CMS
    // =========================================================================
    async getCellQuestOrganelles(filters = {}) {
      await this.initPromise;
      let organelles = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('cms_cellquest_organelles').select('*').order('display_order', { ascending: true });
          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          if (filters.cellType && filters.cellType !== 'all') {
            query = query.in('cell_type', [filters.cellType, 'both']);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            organelles = data.map(r => ({
              id: r.id,
              cellType: r.cell_type,
              name: r.name,
              icon: r.icon,
              description: r.description,
              fact: r.fact,
              color: r.color,
              displayOrder: r.display_order,
              publicationStatus: r.publication_status,
              createdAt: r.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.ORGANELLES, JSON.stringify(organelles));
            return organelles;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getCellQuestOrganelles error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.ORGANELLES);
        if (cached) organelles = JSON.parse(cached);
      } catch (_) {}

      if (!Array.isArray(organelles) || organelles.length === 0) {
        organelles = BUNDLED_SEEDS.organelles.slice();
      }

      if (filters.status && filters.status !== 'all') {
        organelles = organelles.filter(o => o.publicationStatus === filters.status);
      }
      if (filters.cellType && filters.cellType !== 'all') {
        organelles = organelles.filter(o => o.cellType === filters.cellType || o.cellType === 'both');
      }
      return organelles;
    }

    async saveCellQuestOrganelle(organelle) {
      await this.initPromise;
      const record = {
        id: organelle.id || `organelle_${Date.now()}`,
        cellType: organelle.cellType || 'both',
        name: organelle.name,
        icon: organelle.icon || '🧬',
        description: organelle.description,
        fact: organelle.fact || '',
        color: organelle.color || '#13a99c',
        displayOrder: Number(organelle.displayOrder) || 1,
        publicationStatus: organelle.publicationStatus || 'published',
        createdAt: organelle.createdAt || new Date().toISOString()
      };

      try {
        const local = await this.getCellQuestOrganelles({ status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.push(record);
        localStorage.setItem(STORAGE_KEYS.ORGANELLES, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save organelle locally:', err);
      }

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_cellquest_organelles').upsert({
            id: record.id,
            cell_type: record.cellType,
            name: record.name,
            icon: record.icon,
            description: record.description,
            fact: record.fact,
            color: record.color,
            display_order: record.displayOrder,
            publication_status: record.publicationStatus,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) console.warn('[CMSAdapter] Remote saveCellQuestOrganelle error:', error);
        } catch (e) {
          console.warn('[CMSAdapter] Remote saveCellQuestOrganelle exception:', e);
        }
      }

      return record;
    }

    // --- CellQuest 3D / AR Models Management ---
    async getCellQuestModels(filters = {}) {
      await this.initPromise;
      let models = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('cms_cellquest_models').select('*').order('created_at', { ascending: true });
          if (filters.cellType && filters.cellType !== 'all') {
            query = query.eq('cell_type', filters.cellType);
          }
          if (filters.activeOnly) {
            query = query.eq('is_active', true);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            models = data.map(r => ({
              id: r.id,
              cellType: r.cell_type,
              name: r.name,
              modelUrl: r.model_url,
              format: r.format || 'GLB',
              meshMappings: r.mesh_mappings || {},
              isActive: r.is_active !== false,
              description: r.description || (r.cell_type === 'animal' ? 'Model 3D Sel Haiwan KSSM' : 'Model 3D Sel Tumbuhan KSSM'),
              arAvailable: r.ar_available !== false,
              thumbnail: r.thumbnail || (r.cell_type === 'animal' ? '../assets/home/cell_model.svg' : '../assets/home/recommendation_cell.svg'),
              createdAt: r.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
            return models;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getCellQuestModels error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.MODELS);
        if (cached) models = JSON.parse(cached);
      } catch (_) {}

      if (!Array.isArray(models) || models.length === 0) {
        models = (BUNDLED_SEEDS.models || []).map(m => ({
          ...m,
          isActive: true,
          arAvailable: true,
          description: m.cellType === 'animal' ? 'Model mikroskopik 3D sel haiwan piawai KSSM.' : 'Model mikroskopik 3D sel tumbuhan dengan kloroplas & dinding sel.'
        }));
      }

      if (filters.cellType && filters.cellType !== 'all') {
        models = models.filter(m => m.cellType === filters.cellType);
      }
      if (filters.activeOnly) {
        models = models.filter(m => m.isActive);
      }
      return models;
    }

    async saveCellQuestModel(modelData) {
      await this.initPromise;
      const record = {
        id: modelData.id || `model_${Date.now()}`,
        cellType: modelData.cellType || 'animal',
        name: modelData.name || (modelData.cellType === 'animal' ? 'Model Sel Haiwan' : 'Model Sel Tumbuhan'),
        modelUrl: modelData.modelUrl || (modelData.cellType === 'animal' ? '../models/animal_cell_final.glb' : '../models/plantcellnew.glb'),
        format: modelData.format || 'GLB',
        meshMappings: modelData.meshMappings || {},
        isActive: modelData.isActive !== false,
        description: modelData.description || '',
        arAvailable: modelData.arAvailable !== false,
        thumbnail: modelData.thumbnail || '',
        updatedAt: new Date().toISOString()
      };

      try {
        const local = await this.getCellQuestModels({});
        const idx = local.findIndex(x => x.id === record.id || x.cellType === record.cellType);
        if (idx >= 0) local[idx] = { ...local[idx], ...record };
        else local.push(record);
        localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save model locally:', err);
      }

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_cellquest_models').upsert({
            id: record.id,
            cell_type: record.cellType,
            name: record.name,
            model_url: record.modelUrl,
            format: record.format,
            mesh_mappings: record.meshMappings,
            is_active: record.isActive,
            updated_at: record.updatedAt
          }, { onConflict: 'cell_type' });
          if (error) console.warn('[CMSAdapter] Remote saveCellQuestModel error:', error);
        } catch (e) {
          console.warn('[CMSAdapter] Remote saveCellQuestModel exception:', e);
        }
      }

      return record;
    }

    async deleteCellQuestModel(id) {
      await this.initPromise;
      try {
        const local = await this.getCellQuestModels({});
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          await this.supabaseClient.from('cms_cellquest_models').delete().eq('id', id);
        } catch (_) {}
      }
      return true;
    }

    async uploadMediaFile(file, folder = 'models') {
      await this.initPromise;
      if (!file) throw new Error('Tiada fail dipilih.');
      
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const allowedExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'mp4', 'webm', 'pdf', 'pptx'];
      if (!allowedExts.includes(ext)) {
        throw new Error(`Format fail .${ext} tidak disokong. Format yang dibenarkan: ${allowedExts.join(', ')}`);
      }

      if (!this.supabaseClient || this.connectionStatus !== 'connected') {
        throw new Error('Pangkalan data Supabase tidak disambungkan. Tidak dapat memuat naik fail ke pelayan awan.');
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${folder}/${Date.now()}_${safeName}`;

      const { data, error } = await this.supabaseClient.storage
        .from('educational_media')
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw new Error(`Gagal memuat naik ke storan Supabase: ${error.message}`);
      }

      const { data: pubData } = this.supabaseClient.storage
        .from('educational_media')
        .getPublicUrl(storagePath);

      return {
        path: storagePath,
        publicUrl: pubData ? pubData.publicUrl : storagePath
      };
    }

    // --- Real Database Learning Analytics ---
    async getRealAnalytics() {
      await this.initPromise;
      if (!this.supabaseClient || this.connectionStatus !== 'connected') {
        throw new Error('Tidak dapat menyambung ke pangkalan data Supabase.');
      }

      try {
        const [
          profilesRes,
          quizAttemptsRes,
          quizzesRes,
          notesRes,
          videosRes,
          modelsRes,
          eventsRes,
          progressRes
        ] = await Promise.all([
          this.supabaseClient.from('profiles').select('id, full_name, class_name, role, created_at').eq('role', 'student'),
          this.supabaseClient.from('quiz_attempts').select('id, user_id, quiz_id, score, total_questions, submitted_at').order('submitted_at', { ascending: false }),
          this.supabaseClient.from('cms_quizzes').select('id, topic, publication_status'),
          this.supabaseClient.from('learning_notes').select('id, title, chapter, views, publication_status'),
          this.supabaseClient.from('cms_videos').select('id, title, views, publication_status'),
          this.supabaseClient.from('cms_cellquest_models').select('id, is_active'),
          this.supabaseClient.from('student_learning_events').select('*').order('created_at', { ascending: false }).limit(30),
          this.supabaseClient.from('learning_progress').select('id, activity_id, completion_status')
        ]);

        const students = (profilesRes.data || []).filter(s => {
          const name = (s.full_name || '').toLowerCase();
          return !name.includes('demo') && !name.includes('test') && !name.includes('admin');
        });

        const attempts = quizAttemptsRes.data || [];
        const totalAttempts = attempts.length;
        const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / totalAttempts) : 0;
        const passedAttempts = attempts.filter(a => Number(a.score) >= 50).length;
        const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

        const quizzes = quizzesRes.data || [];
        const publishedQuizzes = quizzes.filter(q => q.publication_status === 'published');

        const notes = notesRes.data || [];
        const publishedNotes = notes.filter(n => n.publication_status === 'published');
        const draftNotes = notes.filter(n => n.publication_status === 'draft');
        const totalNoteViews = notes.reduce((sum, n) => sum + (Number(n.views) || 0), 0);

        const videos = videosRes.data || [];
        const publishedVideos = videos.filter(v => v.publication_status === 'published');
        const totalVideoViews = videos.reduce((sum, v) => sum + (Number(v.views) || 0), 0);

        const models = modelsRes.data || [];
        const activeModels = models.filter(m => m.is_active !== false);

        const progressList = progressRes.data || [];
        const completedNotesCount = progressList.filter(p => p.activity_id && p.activity_id.startsWith('note-') && p.completion_status === 'completed').length;
        const completedGamesCount = progressList.filter(p => p.activity_id && p.activity_id.startsWith('game-') && p.completion_status === 'completed').length;

        // Topic performance aggregation
        const topicMap = {};
        attempts.forEach(a => {
          const topic = a.quiz_id || 'Topik Asas Sel';
          if (!topicMap[topic]) topicMap[topic] = { totalScore: 0, count: 0 };
          topicMap[topic].totalScore += Number(a.score) || 0;
          topicMap[topic].count += 1;
        });

        const popularTopics = Object.keys(topicMap).map(topic => ({
          title: topic.replace(/[-_]/g, ' ').toUpperCase(),
          avgScore: Math.round(topicMap[topic].totalScore / topicMap[topic].count),
          attempts: topicMap[topic].count
        }));

        // Activity log from genuine database records
        const activities = [];
        if (Array.isArray(eventsRes.data) && eventsRes.data.length > 0) {
          eventsRes.data.forEach(ev => {
            activities.push({
              id: ev.id,
              type: ev.event_type,
              text: `${ev.title}`,
              time: ev.created_at,
              module: (ev.event_type || '').split('_')[0]
            });
          });
        } else if (attempts.length > 0) {
          attempts.slice(0, 15).forEach(att => {
            activities.push({
              id: att.id,
              type: 'quiz',
              text: `Murid menyempurnakan Kuiz Sel dengan skor ${att.score}%`,
              time: att.submitted_at,
              module: 'kuiz'
            });
          });
        }

        return {
          totalStudents: students.length,
          activeStudents: students.length,
          totalQuizzes: publishedQuizzes.length,
          totalQuizAttempts: totalAttempts,
          avgQuizScore: avgScore,
          quizPassRate: passRate,
          totalNotes: notes.length,
          publishedNotes: publishedNotes.length,
          draftNotes: draftNotes.length,
          totalNoteViews,
          completedNotesCount,
          completedGamesCount,
          totalVideos: publishedVideos.length,
          totalVideoViews,
          activeModelsCount: activeModels.length || 2,
          popularTopics,
          hasSufficientData: totalAttempts > 0,
          activities,
          lastUpdated: new Date().toISOString()
        };
      } catch (err) {
        console.error('[CMSAdapter] Real analytics fetch failed:', err);
        throw err;
      }
    }

    // --- Real Student Learning Records ---
    async getRealStudentRecords(options = {}) {
      await this.initPromise;
      if (!this.supabaseClient || this.connectionStatus !== 'connected') {
        throw new Error('Tidak dapat menyambung ke pangkalan data Supabase.');
      }

      const [profilesRes, attemptsRes, progressRes] = await Promise.all([
        this.supabaseClient.from('profiles').select('*').eq('role', 'student'),
        this.supabaseClient.from('quiz_attempts').select('*').order('submitted_at', { ascending: false }),
        this.supabaseClient.from('learning_progress').select('*')
      ]);

      if (profilesRes.error) throw profilesRes.error;

      let students = (profilesRes.data || []).filter(s => {
        const name = (s.full_name || '').toLowerCase();
        return !name.includes('demo') && !name.includes('test');
      }).map(p => {
        const studentAttempts = (attemptsRes.data || []).filter(a => a.user_id === p.id);
        const studentProgress = (progressRes.data || []).filter(pr => pr.user_id === p.id);

        const totalAttempts = studentAttempts.length;
        const avgScore = totalAttempts > 0
          ? Math.round(studentAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0) / totalAttempts)
          : 0;

        const completedNotes = studentProgress.filter(pr => pr.activity_id && pr.activity_id.startsWith('note-') && pr.completion_status === 'completed').length;
        const completedGames = studentProgress.filter(pr => pr.activity_id && pr.activity_id.startsWith('game-') && pr.completion_status === 'completed').length;

        const lastActivityTime = studentAttempts[0] ? studentAttempts[0].submitted_at : p.created_at;

        return {
          id: p.id,
          name: p.full_name || 'Pelajar Sains',
          email: p.nickname ? `${p.nickname}@sekolah.edu.my` : 'pelajar@arselnel.my',
          grade: p.class_name || 'Tingkatan 1',
          quizAttemptsCount: totalAttempts,
          avgScore,
          notesCompleted: completedNotes,
          gamesCompleted: completedGames,
          lastActive: lastActivityTime,
          status: 'active'
        };
      });

      if (options.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        students = students.filter(s => s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q));
      }
      if (options.classFilter && options.classFilter !== 'all') {
        students = students.filter(s => s.grade === options.classFilter);
      }

      return students;
    }

    async getStudentDetail(studentId) {
      await this.initPromise;
      if (!this.supabaseClient || this.connectionStatus !== 'connected') {
        throw new Error('Tidak dapat menyambung ke pangkalan data Supabase.');
      }

      const [profileRes, attemptsRes, progressRes] = await Promise.all([
        this.supabaseClient.from('profiles').select('*').eq('id', studentId).single(),
        this.supabaseClient.from('quiz_attempts').select('*').eq('user_id', studentId).order('submitted_at', { ascending: false }),
        this.supabaseClient.from('learning_progress').select('*').eq('user_id', studentId).order('updated_at', { ascending: false })
      ]);

      return {
        profile: profileRes.data || null,
        quizAttempts: attemptsRes.data || [],
        learningProgress: progressRes.data || []
      };
    }

    // =========================================================================
    // 6. STUDENT DASHBOARD CMS
    // =========================================================================
    async getDashboardConfig() {
      await this.initPromise;
      let config = null;

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { data, error } = await this.supabaseClient
            .from('cms_dashboard_config')
            .select('*')
            .eq('id', 'default')
            .maybeSingle();

          if (!error && data) {
            config = {
              id: data.id,
              heroGreeting: data.hero_greeting,
              heroModuleBadge: data.hero_module_badge,
              heroTitle: data.hero_title,
              heroDescription: data.hero_description,
              heroButtonPrimaryText: data.hero_button_primary_text,
              heroButtonPrimaryUrl: data.hero_button_primary_url,
              heroButtonSecondaryText: data.hero_button_secondary_text,
              heroButtonSecondaryUrl: data.hero_button_secondary_url,
              featuredRecommendation: data.featured_recommendation,
              moduleDescriptions: data.module_descriptions
            };
            localStorage.setItem(STORAGE_KEYS.DASHBOARD, JSON.stringify(config));
            return config;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getDashboardConfig error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.DASHBOARD);
        if (cached) config = JSON.parse(cached);
      } catch (_) {}

      return config || BUNDLED_SEEDS.dashboardConfig;
    }

    async saveDashboardConfig(config) {
      await this.initPromise;
      const record = {
        ...BUNDLED_SEEDS.dashboardConfig,
        ...config,
        id: 'default'
      };

      try {
        localStorage.setItem(STORAGE_KEYS.DASHBOARD, JSON.stringify(record));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save dashboard config locally:', err);
      }

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_dashboard_config').upsert({
            id: 'default',
            hero_greeting: record.heroGreeting,
            hero_module_badge: record.heroModuleBadge,
            hero_title: record.heroTitle,
            hero_description: record.heroDescription,
            hero_button_primary_text: record.heroButtonPrimaryText,
            hero_button_primary_url: record.heroButtonPrimaryUrl,
            hero_button_secondary_text: record.heroButtonSecondaryText,
            hero_button_secondary_url: record.heroButtonSecondaryUrl,
            featured_recommendation: record.featuredRecommendation,
            module_descriptions: record.moduleDescriptions,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) console.warn('[CMSAdapter] Remote saveDashboardConfig error:', error);
        } catch (e) {
          console.warn('[CMSAdapter] Remote saveDashboardConfig exception:', e);
        }
      }

      return record;
    }

    // =========================================================================
    // 7. MANUAL PENGGUNAAN CMS
    // =========================================================================
    async getManualSteps(filters = {}) {
      await this.initPromise;
      let steps = [];

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          let query = this.supabaseClient.from('cms_manual_steps').select('*').order('display_order', { ascending: true });
          if (filters.status && filters.status !== 'all') {
            query = query.eq('publication_status', filters.status);
          }
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            steps = data.map(r => ({
              id: r.id,
              icon: r.icon,
              color: r.color,
              title: r.title,
              lead: r.lead,
              body: r.body,
              visualHtml: r.visual_html,
              displayOrder: r.display_order,
              publicationStatus: r.publication_status,
              createdAt: r.created_at
            }));
            localStorage.setItem(STORAGE_KEYS.MANUAL, JSON.stringify(steps));
            return steps;
          }
        } catch (e) {
          console.warn('[CMSAdapter] Remote getManualSteps error; using local cache.', e);
        }
      }

      try {
        const cached = localStorage.getItem(STORAGE_KEYS.MANUAL);
        if (cached) steps = JSON.parse(cached);
      } catch (_) {}

      // Fallback from data/cms_backup or bundled
      if (!Array.isArray(steps) || steps.length === 0) {
        // Return default manual steps
        steps = [
          {
            id: 'step_1',
            icon: '🧫',
            color: 'mint',
            title: 'A. Pengenalan ARSelNel',
            lead: 'Platform pembelajaran sains biologi sel interaktif Tingkatan 1.',
            body: '<p><strong>ARSelNel</strong> ialah kit pembelajaran digital interaktif yang direka khas untuk membantu murid Tingkatan 1 menguasai Bab 2: Sel Sebagai Unit Asas Hidupan.</p>',
            displayOrder: 1,
            publicationStatus: 'published'
          }
        ];
      }

      if (filters.status && filters.status !== 'all') {
        steps = steps.filter(s => s.publicationStatus === filters.status);
      }
      return steps;
    }

    async saveManualStep(step) {
      await this.initPromise;
      const record = {
        id: step.id || `step_${Date.now()}`,
        icon: step.icon || '📖',
        color: step.color || 'teal',
        title: step.title,
        lead: step.lead || '',
        body: step.body || '',
        visualHtml: step.visualHtml || '',
        displayOrder: Number(step.displayOrder) || 1,
        publicationStatus: step.publicationStatus || 'published',
        createdAt: step.createdAt || new Date().toISOString()
      };

      try {
        const local = await this.getManualSteps({ status: 'all' });
        const idx = local.findIndex(x => x.id === record.id);
        if (idx >= 0) local[idx] = record;
        else local.push(record);
        localStorage.setItem(STORAGE_KEYS.MANUAL, JSON.stringify(local));
      } catch (err) {
        console.error('[CMSAdapter] Failed to save manual step locally:', err);
      }

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_manual_steps').upsert({
            id: record.id,
            icon: record.icon,
            color: record.color,
            title: record.title,
            lead: record.lead,
            body: record.body,
            visual_html: record.visualHtml,
            display_order: record.displayOrder,
            publication_status: record.publicationStatus,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (error) console.warn('[CMSAdapter] Remote saveManualStep error:', error);
        } catch (e) {
          console.warn('[CMSAdapter] Remote saveManualStep exception:', e);
        }
      }

      return record;
    }

    async deleteGameQuestion(gameId, id) {
      await this.initPromise;
      try {
        const localKey = `${STORAGE_KEYS.GAME_QUESTIONS}_${gameId}`;
        const local = await this.getGameQuestions(gameId, { status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_game_questions').delete().eq('id', id);
          if (error) console.warn('[CMSAdapter] Remote deleteGameQuestion error:', error);
        } catch (_) {}
      }
      return true;
    }

    async deleteCellQuestOrganelle(id) {
      await this.initPromise;
      try {
        const local = await this.getCellQuestOrganelles({ status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.ORGANELLES, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_cellquest_organelles').delete().eq('id', id);
          if (error) console.warn('[CMSAdapter] Remote deleteCellQuestOrganelle error:', error);
        } catch (_) {}
      }
      return true;
    }

    async deleteManualStep(id) {
      await this.initPromise;
      try {
        const local = await this.getManualSteps({ status: 'all' });
        const filtered = local.filter(x => x.id !== id);
        localStorage.setItem(STORAGE_KEYS.MANUAL, JSON.stringify(filtered));
      } catch (_) {}

      if (this.supabaseClient && this.connectionStatus === 'connected') {
        try {
          const { error } = await this.supabaseClient.from('cms_manual_steps').delete().eq('id', id);
          if (error) console.warn('[CMSAdapter] Remote deleteManualStep error:', error);
        } catch (_) {}
      }
      return true;
    }

    // =========================================================================
    // 8. DATA EXPORT & SAFE IMPORT UTILITIES
    // =========================================================================
    async exportAllData() {
      const [notes, videos, quizzes, mazeQuestions, organelles, dashboard, manual] = await Promise.all([
        this.getNotes({ status: 'all' }),
        this.getVideos({ status: 'all' }),
        this.getQuizzes({ status: 'all' }),
        this.getGameQuestions('maze_chase', { status: 'all' }),
        this.getCellQuestOrganelles({ status: 'all' }),
        this.getDashboardConfig(),
        this.getManualSteps({ status: 'all' })
      ]);

      return {
        exportedAt: new Date().toISOString(),
        version: '2026.10.23',
        collections: {
          notes,
          videos,
          quizzes,
          mazeQuestions,
          organelles,
          dashboard,
          manual
        }
      };
    }

    async importAllData(backupJson) {
      if (!backupJson || !backupJson.collections) {
        throw new Error('Format fail sandaran tidak sah: Tiada atribut collections.');
      }
      const results = { imported: 0, skipped: 0 };
      const col = backupJson.collections;

      if (Array.isArray(col.videos)) {
        for (const item of col.videos) {
          await this.saveVideo(item);
          results.imported++;
        }
      }
      if (Array.isArray(col.quizzes)) {
        for (const item of col.quizzes) {
          await this.saveQuiz(item);
          results.imported++;
        }
      }
      if (Array.isArray(col.mazeQuestions)) {
        for (const item of col.mazeQuestions) {
          await this.saveGameQuestion('maze_chase', item);
          results.imported++;
        }
      }
      if (Array.isArray(col.organelles)) {
        for (const item of col.organelles) {
          await this.saveCellQuestOrganelle(item);
          results.imported++;
        }
      }
      if (col.dashboard) {
        await this.saveDashboardConfig(col.dashboard);
        results.imported++;
      }
      if (Array.isArray(col.manual)) {
        for (const item of col.manual) {
          await this.saveManualStep(item);
          results.imported++;
        }
      }
      return results;
    }
  }

  // Attach global instance
  global.CMSAdapter = new CMSContentAdapter();
})(typeof window !== 'undefined' ? window : this);
