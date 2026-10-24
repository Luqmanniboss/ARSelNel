/**
 * ARSelNel - Admin CMS Manager (admin.js)
 * Comprehensive state manager and CRUD controller for Science Interactive Learning App.
 * Manages Quizzes, Notes, Videos, AR Models, and Students with persistent storage.
 */

(function (global) {
  'use strict';

  const CMS_STORAGE = {
    QUIZZES: 'arselnel_cms_quizzes',
    NOTES: 'arselnel_cms_notes',
    VIDEOS: 'arselnel_cms_videos',
    AR_MODELS: 'arselnel_cms_ar_models',
    STUDENTS: 'arselnel_cms_students',
    ACTIVITIES: 'arselnel_cms_activity_logs',
    MODULES: 'arselnel_cms_modules',
    SUBMISSIONS: 'arselnel_quiz_submissions',
  };
  // Demo workspaces never read or modify the normal browser CMS collections.
  if (localStorage.getItem('arselnel_demo_mode') === 'true') {
    Object.keys(CMS_STORAGE).forEach(key => { CMS_STORAGE[key] = `arselnel_demo_${CMS_STORAGE[key]}`; });
  }

  // Seed Data for Interactive Science Modules
  const SEED_QUIZZES = [
    {
      id: 'quiz_1',
      title: 'Pusat Kawalan Sel & Bahan Genetik',
      question: 'Apakah organel yang berfungsi sebagai "pusat kawalan" segala aktiviti sel dan mengandungi maklumat genetik (DNA)?',
      topic: 'Struktur Sel Haiwan & Tumbuhan',
      type: 'mcq', // mcq, tf, matching
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
      createdAt: '2026-03-01'
    },
    {
      id: 'quiz_2',
      title: 'Perbezaan Dinding Sel Tumbuhan',
      question: 'Sel tumbuhan mempunyai dinding sel tetap yang diperbuat daripada selulosa, manakala sel haiwan tidak mempunyai dinding sel.',
      topic: 'Sel Haiwan vs Sel Tumbuhan',
      type: 'tf',
      options: [
        { label: 'A', text: 'Betul' },
        { label: 'B', text: 'Salah' }
      ],
      correctAnswer: 'A',
      points: 10,
      difficulty: 'Mudah',
      explanation: 'Dinding selulosa memberikan sokongan mekanikal dan bentuk yang tetap kepada sel tumbuhan.',
      image: '../assets/nota/icon_topic3.svg',
      createdAt: '2026-03-02'
    },
    {
      id: 'quiz_3',
      title: 'Stesen Janakuasa Sel (ATP)',
      question: 'Organel manakah yang dikenali sebagai "stesen janakuasa sel" kerana menghasilkan tenaga dalam bentuk ATP melalui respirasi sel aerob?',
      topic: 'Organel & Fungsi',
      type: 'mcq',
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
      createdAt: '2026-03-05'
    },
    {
      id: 'quiz_4',
      title: 'Kloroplas & Fotosintesis',
      question: 'Semua sel haiwan mengandungi kloroplas untuk menghasilkan makanan mereka sendiri melalui fotosintesis.',
      topic: 'Sel Haiwan vs Sel Tumbuhan',
      type: 'tf',
      options: [
        { label: 'A', text: 'Betul' },
        { label: 'B', text: 'Salah' }
      ],
      correctAnswer: 'B',
      points: 10,
      difficulty: 'Mudah',
      explanation: 'Sel haiwan tidak mempunyai kloroplas. Hanya sel tumbuhan berklorofil dan alga tertentu yang menjalankan fotosintesis.',
      image: '../assets/nota/icon_topic3.svg',
      createdAt: '2026-03-07'
    },
    {
      id: 'quiz_5',
      title: 'Hierarki Organisasi Sel',
      question: 'Pilih urutan hierarki organisasi sel daripada peringkat paling ringkas kepada paling kompleks dalam organisma multisel.',
      topic: 'Organisasi Sel & Sistem',
      type: 'matching',
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
      createdAt: '2026-03-10'
    }
  ];

  const SEED_NOTES = [
    {
      id: 'note_1',
      title: '1. Sel sebagai Unit Asas Kehidupan',
      topic: 'Bab 2: Sel Sebagai Unit Asas',
      form: 'Tingkatan 1',
      readingTime: '5 Minit',
      summary: 'Asal usul teori sel, penemuan Robert Hooke pada 1665, dan kepentingan sel dalam biologi moden.',
      content: `### Pengenalan Kepada Sel
Semua hidupan terdiri daripada unit asas mikroskopik yang dinamakan **sel**. Pada tahun 1665, saintis Inggeris Robert Hooke pertama kali memerhatikan rongga halus seperti sarang lebah pada hirisan gabus kayu menggunakan mikroskop ciptaannya.

#### Teras Teori Sel Moden:
1. Semua organisma hidup terdiri daripada satu atau lebih sel.
2. Sel merupakan unit struktur dan fungsi asas semua hidupan.
3. Sel baru terhasil daripada pembahagian sel sedia ada.

> Sel membolehkan organisma unisel seperti Amoeba sp. dan Paramecium sp. meneruskan kemandirian hidup walaupun hanya mempunyai satu sel tunggal.`,
      image: '../assets/nota/icon_topic1.svg',
      status: 'published', // 'published' | 'draft'
      views: 342,
      createdAt: '2026-02-18'
    },
    {
      id: 'note_2',
      title: '2. Struktur & Organel Sel Haiwan',
      topic: 'Bab 2: Struktur Sel',
      form: 'Tingkatan 1',
      readingTime: '6 Minit',
      summary: 'Analisis mendalam membran sel, sitoplasma, nukleus, serta peranan mitokondria dalam respirasi sel.',
      content: `### Ciri-Ciri Utama Sel Haiwan
Sel haiwan tidak mempunyai bentuk yang tetap kerana tidak disokong oleh dinding selulosa yang tegar.

#### Organel Penting Sel Haiwan:
* **Membran Plasma:** Lapisan separa telap yang mengawal keluar masuk bahan terlarut.
* **Nukleus:** Mengandungi kromosom (DNA) dan mengawal aktiviti sintesis kimia sel.
* **Sitoplasma:** Medium seperti jeli tempat berlakunya tindak balas biokimia.
* **Mitokondria:** Menghasilkan tenaga ATP melalui metabolisme glukosa respirasi aerob.
* **Vakuol Kecil:** Bertindak mengawal imbangan osmosis dan menyimpan bahan buangan.`,
      image: '../assets/nota/icon_topic2.svg',
      status: 'published',
      views: 520,
      createdAt: '2026-02-20'
    },
    {
      id: 'note_3',
      title: '3. Struktur Sel Tumbuhan & Keunikannya',
      topic: 'Bab 2: Struktur Sel',
      form: 'Tingkatan 1',
      readingTime: '5 Minit',
      summary: 'Memahami kloroplas, vakuol bersaiz besar, dinding selulosa, dan keupayaan fotosintesis.',
      content: `### Keistimewaan Sel Tumbuhan
Sel tumbuhan mempunyai adaptasi morfologi khas untuk menghasilkan makanan sendiri (autotrof) dan kekal tegak melawan tarikan graviti.

#### 3 Struktur Unik Sel Tumbuhan:
1. **Dinding Selulosa:** Melindungi integriti sel dan menghalang sel daripada meletup apabila menyerap air berlebihan.
2. **Kloroplas:** Mengandungi pigmen klorofil yang menyerap tenaga suria bagi sintesis glukosa.
3. **Vakuol Sentral Besar:** Dipenuhi sap sel yang mengekalkan tekanan kesegahan (turgid) daun dan batang herba.`,
      image: '../assets/nota/icon_topic3.svg',
      status: 'published',
      views: 410,
      createdAt: '2026-02-22'
    },
    {
      id: 'note_4',
      title: '4. Organisasi Sel Dalam Organisma Multisel',
      topic: 'Bab 2: Organisasi Sel',
      form: 'Tingkatan 1',
      readingTime: '7 Minit',
      summary: 'Hierarki biologi: Pembentukan tisu epitelium, organ perkumuhan, dan sistem peredaran darah manusia.',
      content: `### Pembahagian Kerja Dalam Sel Multisel
Dalam hidupan kompleks seperti manusia, sel tidak boleh bekerja secara bersendirian. Sel mengalami pengkhususan (*differentiation*) bentuk dan fungsi untuk membentuk sistem terselaras.`,
      image: '../assets/nota/icon_topic4.svg',
      status: 'draft',
      views: 89,
      createdAt: '2026-03-01'
    }
  ];

  const SEED_VIDEOS = [
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
      createdAt: '2026-02-28'
    }
  ];

  const SEED_AR_MODELS = [
    {
      id: 'ar_1',
      name: 'Model 3D Sel Haiwan Holistik',
      markerId: 'MARKER-ANIMAL-01',
      fileUrl: '../assets/home/cell_model.svg',
      format: 'GLTF / SVG Model',
      color: '#008080',
      hotspots: 'Nukleus tengah mengandungi kromosom. Mitokondria bertaburan membekalkan tenaga.',
      targetStatus: 'active',
      scansCount: 412,
      createdAt: '2026-02-05'
    },
    {
      id: 'ar_2',
      name: 'Model 3D Sel Tumbuhan Berlapis',
      markerId: 'MARKER-PLANT-02',
      fileUrl: '../assets/home/recommendation_cell.svg',
      format: 'GLB / USDZ',
      color: '#0a844f',
      hotspots: 'Kloroplas hijau menyerap foton cahaya. Dinding selulosa memberi sokongan mekanikal.',
      targetStatus: 'active',
      scansCount: 389,
      createdAt: '2026-02-11'
    },
    {
      id: 'ar_3',
      name: 'Mitokondria Keratan Rentas 3D',
      markerId: 'MARKER-MITO-03',
      fileUrl: '../assets/home/cell_model.svg',
      format: 'GLTF',
      color: '#f59e0b',
      hotspots: 'Membran dalam berlipat-lipat (krista) memaksimumkan luas permukaan sintesis ATP.',
      targetStatus: 'testing',
      scansCount: 154,
      createdAt: '2026-03-01'
    }
  ];

  const SEED_STUDENTS = [
    {
      id: 'std_1',
      name: 'Aina Sofea binti Ahmad',
      email: 'aina@email.com',
      grade: 'Tingkatan 1 Al-Farabi',
      score: 95,
      quizzesTaken: 12,
      badge: 'Pakar Sel Emas',
      status: 'active',
      registeredAt: '2026-02-01',
      lastActive: 'Hari ini'
    },
    {
      id: 'std_2',
      name: 'Danial Hakim bin Rosli',
      email: 'danial@email.com',
      grade: 'Tingkatan 1 Ibn Sina',
      score: 85,
      quizzesTaken: 10,
      badge: 'Saintis Muda Perak',
      status: 'active',
      registeredAt: '2026-02-03',
      lastActive: 'Semalam'
    },
    {
      id: 'std_3',
      name: 'Nurul Izzah binti Razali',
      email: 'izzah@email.com',
      grade: 'Tingkatan 1 Al-Biruni',
      score: 90,
      quizzesTaken: 11,
      badge: 'Penjelajah AR Emas',
      status: 'active',
      registeredAt: '2026-02-08',
      lastActive: 'Hari ini'
    },
    {
      id: 'std_4',
      name: 'Muhammad Harith bin Zulkifli',
      email: 'harith@email.com',
      grade: 'Tingkatan 1 Al-Khawarizmi',
      score: 75,
      quizzesTaken: 7,
      badge: 'Pelatih Mikroskop',
      status: 'active',
      registeredAt: '2026-02-14',
      lastActive: '3 hari lalu'
    },
    {
      id: 'std_5',
      name: 'Siti Sarah binti Kamaruddin',
      email: 'sarah@email.com',
      grade: 'Tingkatan 1 Al-Farabi',
      score: 80,
      quizzesTaken: 9,
      badge: 'Penjelajah AR Perak',
      status: 'active',
      registeredAt: '2026-02-18',
      lastActive: 'Hari ini'
    },
    {
      id: 'std_6',
      name: 'Adam Rayyan bin Fadhil',
      email: 'rayyan@email.com',
      grade: 'Tingkatan 1 Ibn Rushd',
      score: 60,
      quizzesTaken: 4,
      badge: 'Peringkat Asas',
      status: 'inactive',
      registeredAt: '2026-02-25',
      lastActive: '2 minggu lalu'
    }
  ];

  const SEED_ACTIVITIES = [
    { text: 'Aina Sofea mencapai markah 95% dalam Kuiz Struktur Sel', time: '10 minit lalu', type: 'quiz' },
    { text: 'Nota baru "Struktur Sel Tumbuhan" telah diterbitkan oleh Guru', time: '1 jam lalu', type: 'note' },
    { text: 'Model AR Sel Haiwan diimbas sebanyak 42 kali hari ini', time: '3 jam lalu', type: 'ar' },
    { text: 'Muhammad Harith telah mendaftar akaun pelajar baru', time: '5 jam lalu', type: 'user' }
  ];

  class AdminCMS {
    constructor() {
      this.initStore();
    }

    initStore() {
      try {
        if (!localStorage.getItem(CMS_STORAGE.QUIZZES)) {
          localStorage.setItem(CMS_STORAGE.QUIZZES, JSON.stringify(SEED_QUIZZES));
        }
        if (!localStorage.getItem(CMS_STORAGE.NOTES)) {
          localStorage.setItem(CMS_STORAGE.NOTES, JSON.stringify(SEED_NOTES));
        }
        if (!localStorage.getItem(CMS_STORAGE.VIDEOS)) {
          localStorage.setItem(CMS_STORAGE.VIDEOS, JSON.stringify(SEED_VIDEOS));
        }
        if (!localStorage.getItem(CMS_STORAGE.AR_MODELS)) {
          localStorage.setItem(CMS_STORAGE.AR_MODELS, JSON.stringify(SEED_AR_MODELS));
        }
        if (!localStorage.getItem(CMS_STORAGE.STUDENTS)) {
          localStorage.setItem(CMS_STORAGE.STUDENTS, JSON.stringify(SEED_STUDENTS));
        }
        if (!localStorage.getItem(CMS_STORAGE.ACTIVITIES)) {
          localStorage.setItem(CMS_STORAGE.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
        }
        if (!localStorage.getItem(CMS_STORAGE.MODULES)) {
          localStorage.setItem(CMS_STORAGE.MODULES, JSON.stringify([
            { id: 'module_cell_basics', title: 'Struktur dan Fungsi Sel', chapter: 'Bab 2 — Sel Sebagai Unit Asas Hidupan', description: 'Kenali bahagian sel haiwan dan tumbuhan serta fungsinya.', content: 'Jom kenali sel\n\nSel ialah unit asas bagi semua benda hidup. Sel haiwan dan sel tumbuhan mempunyai beberapa struktur yang membantu menjalankan proses hidup.\n\n• Nukleus mengawal aktiviti sel.\n• Membran sel mengawal pergerakan bahan masuk dan keluar.\n• Mitokondria membebaskan tenaga.', status: 'published', updatedAt: new Date().toISOString() }
          ]));
        }
      } catch (e) {
        console.warn('Storage initialisation warning', e);
      }
    }

    // Generic Storage Helpers
    getCollection(key, fallback) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    saveCollection(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save to storage', key, e);
      }
    }

    logActivity(text, type = 'general') {
      const activities = this.getCollection(CMS_STORAGE.ACTIVITIES, []);
      activities.unshift({
        text,
        time: 'Baru sahaja',
        type
      });
      if (activities.length > 20) activities.pop();
      this.saveCollection(CMS_STORAGE.ACTIVITIES, activities);
    }

    // --- Statistics ---
    async getStats() {
      if (global.CMSAdapter && typeof global.CMSAdapter.getRealAnalytics === 'function') {
        try {
          const realStats = await global.CMSAdapter.getRealAnalytics();
          return realStats;
        } catch (err) {
          console.warn('[AdminCMS] Live analytics query failed or offline; using local counts:', err);
        }
      }

      const quizzes = this.getQuizzes();
      const notes = this.getNotes();
      const videos = this.getVideos();
      const publishedNotes = notes.filter(n => n.status === 'published' || n.publicationStatus === 'published').length;

      return {
        totalStudents: 0,
        activeStudents: 0,
        totalQuizzes: quizzes.length,
        totalQuizAttempts: 0,
        avgQuizScore: 0,
        quizPassRate: 0,
        totalNotes: notes.length,
        publishedNotes,
        draftNotes: notes.length - publishedNotes,
        totalNoteViews: notes.reduce((sum, n) => sum + (Number(n.views) || 0), 0),
        totalVideos: videos.length,
        totalVideoViews: videos.reduce((sum, v) => sum + (Number(v.views) || 0), 0),
        activeModelsCount: 2,
        popularTopics: [],
        hasSufficientData: false,
        activities: [],
        lastUpdated: new Date().toISOString()
      };
    }

    getModules() { return this.getCollection(CMS_STORAGE.MODULES, []); }

    getModuleById(id) { return this.getModules().find(module => module.id === id); }

    saveModule(data) {
      if (!data || !String(data.title || '').trim() || !String(data.content || '').trim()) return false;
      const list = this.getModules();
      const safe = { ...data, title: String(data.title).trim().slice(0, 120), chapter: String(data.chapter || '').trim().slice(0, 120), description: String(data.description || '').trim().slice(0, 500), content: String(data.content).slice(0, 30000), updatedAt: new Date().toISOString() };
      const index = list.findIndex(item => item.id === safe.id);
      if (index >= 0) list[index] = { ...list[index], ...safe };
      else { safe.id = `module_${Date.now()}`; list.unshift(safe); }
      this.saveCollection(CMS_STORAGE.MODULES, list);
      this.logActivity(`Modul "${safe.title}" ${safe.status === 'published' ? 'diterbitkan' : 'disimpan sebagai draf'}`, 'module');
      return safe.id;
    }

    deleteModule(id) {
      this.saveCollection(CMS_STORAGE.MODULES, this.getModules().filter(item => item.id !== id));
      this.logActivity('Modul pembelajaran dipadam', 'module');
      return true;
    }

    // --- Quizzes CRUD ---
    getQuizzes(filterTopic = '', searchQuery = '') {
      let list = this.getCollection(CMS_STORAGE.QUIZZES, null);
      if (list === null) {
        list = SEED_QUIZZES.slice();
      }
      if (filterTopic && filterTopic !== 'all') {
        list = list.filter(q => (q.topic || '').toLowerCase() === filterTopic.toLowerCase());
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(item => 
          (item.title || '').toLowerCase().includes(q) || 
          (item.question || '').toLowerCase().includes(q) ||
          (item.topic || '').toLowerCase().includes(q)
        );
      }
      return list;
    }

    getQuizById(id) {
      const list = this.getQuizzes();
      return list.find(q => q.id === id);
    }

    async syncFromSupabase() {
      if (!global.CMSAdapter) return false;
      try {
        const [videos, quizzes, notes] = await Promise.all([
          typeof global.CMSAdapter.getVideos === 'function' ? global.CMSAdapter.getVideos({ status: 'all' }) : Promise.resolve(null),
          typeof global.CMSAdapter.getQuizzes === 'function' ? global.CMSAdapter.getQuizzes() : Promise.resolve(null),
          typeof global.CMSAdapter.getNotes === 'function' ? global.CMSAdapter.getNotes({ status: 'all' }) : Promise.resolve(null)
        ]);
        if (Array.isArray(videos)) {
          this.saveCollection(CMS_STORAGE.VIDEOS, videos);
        }
        if (Array.isArray(quizzes)) {
          this.saveCollection(CMS_STORAGE.QUIZZES, quizzes);
        }
        if (Array.isArray(notes)) {
          this.saveCollection(CMS_STORAGE.NOTES, notes);
        }
        return true;
      } catch (e) {
        console.warn('AdminCMS.syncFromSupabase notice:', e);
        return false;
      }
    }

    async saveQuiz(quizData) {
      let saved = null;
      if (global.CMSAdapter && typeof global.CMSAdapter.saveQuiz === 'function') {
        saved = await global.CMSAdapter.saveQuiz(quizData);
      }
      const list = this.getCollection(CMS_STORAGE.QUIZZES, []);
      const targetId = (saved && saved.id) || quizData.id;
      if (targetId) {
        const index = list.findIndex(q => q.id === targetId);
        if (index !== -1) {
          list[index] = { ...list[index], ...(saved || quizData), updatedAt: new Date().toISOString() };
          this.logActivity(`Soalan kuiz "${quizData.title}" telah dikemas kini`, 'quiz');
        } else {
          list.unshift(saved || { ...quizData, id: targetId, createdAt: new Date().toISOString().split('T')[0] });
          this.logActivity(`Soalan kuiz baru "${quizData.title}" telah ditambah`, 'quiz');
        }
      } else {
        const newQuiz = saved || {
          ...quizData,
          id: 'quiz_' + Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        };
        list.unshift(newQuiz);
        this.logActivity(`Soalan kuiz baru "${newQuiz.title}" telah ditambah`, 'quiz');
      }
      this.saveCollection(CMS_STORAGE.QUIZZES, list);
      return saved || true;
    }

    async deleteQuiz(id) {
      if (global.CMSAdapter && typeof global.CMSAdapter.deleteQuiz === 'function') {
        await global.CMSAdapter.deleteQuiz(id);
      }
      let list = this.getCollection(CMS_STORAGE.QUIZZES, []);
      const target = list.find(q => q.id === id);
      list = list.filter(q => q.id !== id);
      this.saveCollection(CMS_STORAGE.QUIZZES, list);
      if (target) this.logActivity(`Soalan kuiz "${target.title}" telah dipadam`, 'quiz');
      return true;
    }

    // --- Notes CRUD ---
    getNotes(searchQuery = '', statusFilter = 'all') {
      let list = this.getCollection(CMS_STORAGE.NOTES, null);
      if (list === null) {
        list = SEED_NOTES.slice();
      }
      if (statusFilter !== 'all') {
        list = list.filter(n => (n.status || n.publicationStatus || 'published') === statusFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(n => 
          (n.title || '').toLowerCase().includes(q) || 
          (n.topic || n.chapter || '').toLowerCase().includes(q) ||
          (n.summary || n.description || '').toLowerCase().includes(q)
        );
      }
      return list;
    }

    getNoteById(id) {
      const list = this.getNotes();
      return list.find(n => n.id === id);
    }

    async saveNote(noteData) {
      let saved = null;
      if (global.CMSAdapter && typeof global.CMSAdapter.saveNote === 'function') {
        saved = await global.CMSAdapter.saveNote(noteData);
      }
      if (global.SmartNotes && typeof global.SmartNotes.saveNote === 'function') {
        try {
          await global.SmartNotes.saveNote({
            id: (saved && saved.id) || noteData.id,
            title: noteData.title,
            chapter: noteData.topic || noteData.chapter || 'Bab 2: Sel Sebagai Unit Asas Hidupan',
            description: noteData.summary || noteData.description || '',
            contentType: noteData.contentType || 'text',
            publicationStatus: noteData.status || noteData.publicationStatus || 'published'
          });
        } catch (e) {
          console.warn('SmartNotes sync notice:', e);
        }
      }
      const list = this.getCollection(CMS_STORAGE.NOTES, []);
      const targetId = (saved && saved.id) || noteData.id;
      if (targetId) {
        const index = list.findIndex(n => n.id === targetId);
        if (index !== -1) {
          list[index] = { ...list[index], ...(saved || noteData), updatedAt: new Date().toISOString() };
          this.logActivity(`Nota "${noteData.title}" telah dikemas kini`, 'note');
        } else {
          list.unshift(saved || { ...noteData, id: targetId, views: 0, createdAt: new Date().toISOString().split('T')[0] });
          this.logActivity(`Nota baru "${noteData.title}" telah ditambah`, 'note');
        }
      } else {
        const newNote = saved || {
          ...noteData,
          id: 'note_' + Date.now(),
          views: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        list.unshift(newNote);
        this.logActivity(`Nota baru "${newNote.title}" telah ditambah`, 'note');
      }
      this.saveCollection(CMS_STORAGE.NOTES, list);
      return saved || true;
    }

    async deleteNote(id) {
      if (global.CMSAdapter && typeof global.CMSAdapter.deleteNote === 'function') {
        await global.CMSAdapter.deleteNote(id);
      }
      if (global.SmartNotes && typeof global.SmartNotes.deleteNote === 'function') {
        try { await global.SmartNotes.deleteNote(id); } catch (_) {}
      }
      let list = this.getCollection(CMS_STORAGE.NOTES, []);
      const target = list.find(n => n.id === id);
      list = list.filter(n => n.id !== id);
      this.saveCollection(CMS_STORAGE.NOTES, list);
      if (target) this.logActivity(`Nota "${target.title}" telah dipadam`, 'note');
      return true;
    }

    // --- Videos CRUD ---
    getVideos(category = 'all', searchQuery = '', statusFilter = 'all') {
      let list = this.getCollection(CMS_STORAGE.VIDEOS, null);
      if (list === null) {
        list = SEED_VIDEOS.slice();
      }
      if (category !== 'all') {
        list = list.filter(v => (v.category || '').toLowerCase() === category.toLowerCase());
      }
      if (statusFilter !== 'all') {
        list = list.filter(v => (v.status || v.publicationStatus || 'published') === statusFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(v => 
          (v.title || '').toLowerCase().includes(q) || 
          (v.description || '').toLowerCase().includes(q)
        );
      }
      return list;
    }

    getVideoById(id) {
      const list = this.getVideos();
      return list.find(v => v.id === id);
    }

    async saveVideo(videoData) {
      let saved = null;
      if (global.CMSAdapter && typeof global.CMSAdapter.saveVideo === 'function') {
        saved = await global.CMSAdapter.saveVideo(videoData);
      }
      const list = this.getCollection(CMS_STORAGE.VIDEOS, []);
      const targetId = (saved && saved.id) || videoData.id;
      if (targetId) {
        const index = list.findIndex(v => v.id === targetId);
        if (index !== -1) {
          list[index] = { ...list[index], ...(saved || videoData) };
          this.logActivity(`Video "${videoData.title}" dikemas kini`, 'video');
        } else {
          list.unshift(saved || { ...videoData, id: targetId, views: 0, createdAt: new Date().toISOString().split('T')[0] });
          this.logActivity(`Video baru "${videoData.title}" dimuat naik`, 'video');
        }
      } else {
        const newVid = saved || {
          ...videoData,
          id: 'vid_' + Date.now(),
          views: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        list.unshift(newVid);
        this.logActivity(`Video baru "${newVid.title}" dimuat naik`, 'video');
      }
      this.saveCollection(CMS_STORAGE.VIDEOS, list);
      return saved || true;
    }

    async deleteVideo(id) {
      if (global.CMSAdapter && typeof global.CMSAdapter.deleteVideo === 'function') {
        await global.CMSAdapter.deleteVideo(id);
      }
      let list = this.getCollection(CMS_STORAGE.VIDEOS, []);
      const target = list.find(v => v.id === id);
      list = list.filter(v => v.id !== id);
      this.saveCollection(CMS_STORAGE.VIDEOS, list);
      if (target) this.logActivity(`Video "${target.title}" telah dipadam`, 'video');
      return true;
    }

    // --- AR Models CRUD ---
    getARModels(searchQuery = '') {
      let list = this.getCollection(CMS_STORAGE.AR_MODELS, SEED_AR_MODELS);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m => 
          m.name.toLowerCase().includes(q) || 
          m.markerId.toLowerCase().includes(q)
        );
      }
      return list;
    }

    getARModelById(id) {
      const list = this.getARModels();
      return list.find(m => m.id === id);
    }

    saveARModel(modelData) {
      const list = this.getCollection(CMS_STORAGE.AR_MODELS, SEED_AR_MODELS);
      if (modelData.id) {
        const index = list.findIndex(m => m.id === modelData.id);
        if (index !== -1) {
          list[index] = { ...list[index], ...modelData };
          this.logActivity(`Model AR "${modelData.name}" dikemas kini`, 'ar');
        }
      } else {
        const newModel = {
          ...modelData,
          id: 'ar_' + Date.now(),
          scansCount: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        list.unshift(newModel);
        this.logActivity(`Model AR sasaran baru "${newModel.name}" ditambah`, 'ar');
      }
      this.saveCollection(CMS_STORAGE.AR_MODELS, list);
      return true;
    }

    deleteARModel(id) {
      let list = this.getCollection(CMS_STORAGE.AR_MODELS, SEED_AR_MODELS);
      const target = list.find(m => m.id === id);
      list = list.filter(m => m.id !== id);
      this.saveCollection(CMS_STORAGE.AR_MODELS, list);
      if (target) this.logActivity(`Model AR "${target.name}" telah dipadam`, 'ar');
      return true;
    }

    // --- Students CRUD ---
    getStudents(searchQuery = '', statusFilter = 'all') {
      let list = this.getCollection(CMS_STORAGE.STUDENTS, SEED_STUDENTS);
      if (statusFilter !== 'all') {
        list = list.filter(s => s.status === statusFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(s => 
          s.name.toLowerCase().includes(q) || 
          s.email.toLowerCase().includes(q) ||
          s.grade.toLowerCase().includes(q)
        );
      }
      return list;
    }

    saveStudent(studentData) {
      const list = this.getCollection(CMS_STORAGE.STUDENTS, SEED_STUDENTS);
      if (studentData.id) {
        const index = list.findIndex(s => s.id === studentData.id);
        if (index !== -1) {
          list[index] = { ...list[index], ...studentData };
          this.logActivity(`Rekod pelajar "${studentData.name}" dikemas kini`, 'user');
        }
      } else {
        const newStudent = {
          ...studentData,
          id: 'std_' + Date.now(),
          score: studentData.score || 0,
          quizzesTaken: 0,
          badge: 'Pelajar Baru',
          registeredAt: new Date().toISOString().split('T')[0],
          lastActive: 'Baru mendaftar',
          status: studentData.status || 'active'
        };
        list.unshift(newStudent);
        this.logActivity(`Pelajar baru "${newStudent.name}" ditambah ke sistem`, 'user');
      }
      this.saveCollection(CMS_STORAGE.STUDENTS, list);
      return true;
    }

    deleteStudent(id) {
      let list = this.getCollection(CMS_STORAGE.STUDENTS, SEED_STUDENTS);
      const target = list.find(s => s.id === id);
      list = list.filter(s => s.id !== id);
      this.saveCollection(CMS_STORAGE.STUDENTS, list);
      if (target) this.logActivity(`Akaun pelajar "${target.name}" dipadam`, 'user');
      return true;
    }

    toggleStudentStatus(id) {
      const list = this.getCollection(CMS_STORAGE.STUDENTS, SEED_STUDENTS);
      const student = list.find(s => s.id === id);
      if (student) {
        student.status = student.status === 'active' ? 'inactive' : 'active';
        this.saveCollection(CMS_STORAGE.STUDENTS, list);
        this.logActivity(`Status pelajar "${student.name}" diubah ke ${student.status}`, 'user');
        return student.status;
      }
      return null;
    }

    getActivities() {
      return this.getCollection(CMS_STORAGE.ACTIVITIES, SEED_ACTIVITIES);
    }

    getQuizSubmissions() { return this.getCollection(CMS_STORAGE.SUBMISSIONS, []); }

    // Reset all data to rich defaults
    resetToDefaults() {
      localStorage.setItem(CMS_STORAGE.QUIZZES, JSON.stringify(SEED_QUIZZES));
      localStorage.setItem(CMS_STORAGE.NOTES, JSON.stringify(SEED_NOTES));
      localStorage.setItem(CMS_STORAGE.VIDEOS, JSON.stringify(SEED_VIDEOS));
      localStorage.setItem(CMS_STORAGE.AR_MODELS, JSON.stringify(SEED_AR_MODELS));
      localStorage.setItem(CMS_STORAGE.STUDENTS, JSON.stringify(SEED_STUDENTS));
      localStorage.setItem(CMS_STORAGE.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
      localStorage.setItem(CMS_STORAGE.MODULES, JSON.stringify([]));
      localStorage.setItem(CMS_STORAGE.SUBMISSIONS, JSON.stringify([]));
      return true;
    }

    exportJSON() {
      const backup = {
        exportedAt: new Date().toISOString(),
        quizzes: this.getQuizzes(),
        notes: this.getNotes(),
        videos: this.getVideos(),
        arModels: this.getARModels(),
        students: this.getStudents(),
        modules: this.getModules(),
        quizSubmissions: this.getQuizSubmissions()
      };
      return JSON.stringify(backup, null, 2);
    }
  }

  // Toast Notification helper
  global.showToast = function (message, type = 'success') {
    let container = document.getElementById('arselnel-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'arselnel-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-teal-700 text-white shadow-teal-900/20',
      error: 'bg-rose-600 text-white shadow-rose-900/20',
      info: 'bg-slate-800 text-white shadow-slate-900/20',
      warning: 'bg-amber-600 text-white shadow-amber-900/20'
    };
    const icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    };

    toast.className = `flex items-center gap-3 p-4 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-3 opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-2xl shrink-0">${icons[type] || 'info'}</span>
      <p class="text-sm font-semibold flex-1 leading-snug">${message}</p>
      <button class="opacity-75 hover:opacity-100 text-lg leading-none shrink-0" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  global.AdminCMS = new AdminCMS();

})(typeof window !== 'undefined' ? window : this);
