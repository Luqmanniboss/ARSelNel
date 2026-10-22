/**
 * ARSelNel - Safe Educational Content Backup & Export Engine
 * Exports all existing seed data, questions, notes, videos, models, and game configurations
 * to a standardized JSON backup file before any schema migrations or CMS edits.
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'data');
const BACKUP_FILE = path.join(BACKUP_DIR, 'cms_backup.json');

// Ensure data directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 1. Quizzes Seed
const SEED_QUIZZES = [
  {
    id: 'quiz_1',
    title: 'Pusat Kawalan Sel & Bahan Genetik',
    question: 'Apakah organel yang berfungsi sebagai "pusat kawalan" segala aktiviti sel dan mengandungi maklumat genetik (DNA)?',
    topic: 'Struktur Sel Haiwan & Tumbuhan',
    type: 'mcq',
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
    publicationStatus: 'published',
    displayOrder: 2,
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
    publicationStatus: 'published',
    displayOrder: 3,
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
    publicationStatus: 'published',
    displayOrder: 4,
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
    publicationStatus: 'published',
    displayOrder: 5,
    createdAt: '2026-03-10'
  }
];

// 2. Notes Seed
const SEED_NOTES = [
  {
    id: 'note_1',
    title: '1. Sel sebagai Unit Asas Kehidupan',
    chapter: 'Bab 2: Sel Sebagai Unit Asas',
    form: 'Tingkatan 1',
    readingTime: '5 Minit',
    description: 'Asal usul teori sel, penemuan Robert Hooke pada 1665, dan kepentingan sel dalam biologi moden.',
    content: `### Pengenalan Kepada Sel\nSemua hidupan terdiri daripada unit asas mikroskopik yang dinamakan **sel**. Pada tahun 1665, saintis Inggeris Robert Hooke pertama kali memerhatikan rongga halus seperti sarang lebah pada hirisan gabus kayu menggunakan mikroskop ciptaannya.\n\n#### Teras Teori Sel Moden:\n1. Semua organisma hidup terdiri daripada satu atau lebih sel.\n2. Sel merupakan unit struktur dan fungsi asas semua hidupan.\n3. Sel baru terhasil daripada pembahagian sel sedia ada.\n\n> Sel membolehkan organisma unisel seperti Amoeba sp. dan Paramecium sp. meneruskan kemandirian hidup walaupun hanya mempunyai satu sel tunggal.`,
    image: '../assets/nota/icon_topic1.svg',
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
    publicationStatus: 'draft',
    views: 89,
    displayOrder: 4,
    createdAt: '2026-03-01'
  }
];

// 3. Videos Seed
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
];

// 4. AR Models Seed
const SEED_AR_MODELS = [
  {
    id: 'ar_1',
    name: 'Model 3D Sel Haiwan Holistik',
    markerId: 'MARKER-ANIMAL-01',
    fileUrl: '../models/animal_cell_final.glb',
    format: 'GLB 3D Model',
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
    fileUrl: '../models/plantcellnew.glb',
    format: 'GLB 3D Model',
    color: '#0a844f',
    hotspots: 'Kloroplas hijau menyerap foton cahaya. Dinding selulosa memberi sokongan mekanikal.',
    targetStatus: 'active',
    scansCount: 389,
    createdAt: '2026-02-11'
  }
];

// 5. Maze Chase Questions Seed
const MAZE_QUESTIONS = [
  {
    id: 'maze_q1',
    gameId: 'maze_chase',
    difficulty: 'low',
    difficultyLabel: 'Aras Rendah',
    points: 50,
    mazeTitle: 'Maze 1: Koridor Asas Sel',
    question: 'Apakah struktur yang terdapat pada sel tumbuhan tetapi tiada pada sel haiwan?',
    options: ['Membran sel', 'Sitoplasma', 'Dinding sel', 'Nukleus'],
    correctAnswer: 'Dinding sel',
    correctIndex: 2,
    explanation: 'Dinding sel merupakan lapisan tegar terbina daripada selulosa yang hanya wujud pada sel tumbuhan. Sel haiwan tidak mempunyai dinding sel, sebaliknya hanya diselaputi membran sel yang fleksibel.',
    displayOrder: 1,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q2',
    gameId: 'maze_chase',
    difficulty: 'low',
    difficultyLabel: 'Aras Rendah',
    points: 50,
    mazeTitle: 'Maze 2: Liku-liku Nukleus',
    question: 'Organel manakah yang berfungsi mengawal keseluruhan aktiviti sel serta membawa maklumat genetik (DNA)?',
    options: ['Nukleus', 'Vakuol', 'Kloroplas', 'Dinding sel'],
    correctAnswer: 'Nukleus',
    correctIndex: 0,
    explanation: 'Nukleus ialah pusat kawalan sel yang mengandungi kromosom dan bahan genetik (DNA). Ia mengawal semua tindak balas biokimia, sintesis protein dan pembahagian sel.',
    displayOrder: 2,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q3',
    gameId: 'maze_chase',
    difficulty: 'low',
    difficultyLabel: 'Aras Rendah',
    points: 50,
    mazeTitle: 'Maze 3: Denai Mitokondria',
    question: 'Organel manakah yang digelar sebagai "stesen janakuasa sel" kerana menghasilkan tenaga ATP melalui respirasi sel?',
    options: ['Kloroplas', 'Mitokondria', 'Jasad Golgi', 'Sentriol'],
    correctAnswer: 'Mitokondria',
    correctIndex: 1,
    explanation: 'Mitokondria mengoksidakan glukosa melalui respirasi aerob untuk membebaskan tenaga dalam bentuk molekul ATP yang sangat penting bagi kemandirian sel.',
    displayOrder: 3,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q4',
    gameId: 'maze_chase',
    difficulty: 'low',
    difficultyLabel: 'Aras Rendah',
    points: 50,
    mazeTitle: 'Maze 4: Kubu Kloroplas',
    question: 'Apakah pigmen hijau di dalam kloroplas yang berfungsi menyerap tenaga cahaya matahari bagi fotosintesis?',
    options: ['Klorofil', 'Karotenoid', 'Hemoglobin', 'Melanin'],
    correctAnswer: 'Klorofil',
    correctIndex: 0,
    explanation: 'Klorofil ialah pigmen fotosintetik hijau yang memerangkap foton cahaya suria untuk menukarkan karbon dioksida dan air kepada glukosa serta oksigen.',
    displayOrder: 4,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q5',
    gameId: 'maze_chase',
    difficulty: 'medium',
    difficultyLabel: 'Aras Sederhana',
    points: 100,
    mazeTitle: 'Maze 5: Tasik Vakuol',
    question: 'Apakah perbezaan saiz dan ciri vakuol antara sel tumbuhan dengan sel haiwan?',
    options: [
      'Tumbuhan mempunyai vakuol sentral yang besar; haiwan mempunyai vakuol kecil jika ada',
      'Tumbuhan tiada vakuol langsung; haiwan ada vakuol besar',
      'Kedua-dua sel tumbuhan dan haiwan berkongsi vakuol yang sama besar',
      'Hanya sel haiwan yang mempunyai vakuol berisi sap sel'
    ],
    correctAnswer: 'Tumbuhan mempunyai vakuol sentral yang besar; haiwan mempunyai vakuol kecil jika ada',
    correctIndex: 0,
    explanation: 'Sel tumbuhan matang memiliki vakuol tengah kekal yang besar berisi sap sel untuk mengekalkan kesegahan (turgiditi), manakala sel haiwan hanya mempunyai vakuol kecil bersaiz mikroskopik yang bersifat sementara.',
    displayOrder: 5,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q6',
    gameId: 'maze_chase',
    difficulty: 'medium',
    difficultyLabel: 'Aras Sederhana',
    points: 100,
    mazeTitle: 'Maze 6: Membran Separa Telap',
    question: 'Apakah fungsi utama membran sel (plasma) yang mengelilingi sitoplasma?',
    options: [
      'Menghasilkan pigmen klorofil',
      'Mengawal pergerakan bahan keluar dan masuk sel secara telap memilih',
      'Membekalkan tenaga mekanikal tetap',
      'Menyimpan maklumat kromosom'
    ],
    correctAnswer: 'Mengawal pergerakan bahan keluar dan masuk sel secara telap memilih',
    correctIndex: 1,
    explanation: 'Membran sel merupakan lapisan dwilapisan fosfolipid separa telap yang bertindak sebagai pos kawalan sempadan sel, membenarkan molekul tertentu merentasinya.',
    displayOrder: 6,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q7',
    gameId: 'maze_chase',
    difficulty: 'medium',
    difficultyLabel: 'Aras Sederhana',
    points: 100,
    mazeTitle: 'Maze 7: Gelombang Sitoplasma',
    question: 'Apakah komposisi dan peranan cecair jeli sitoplasma di dalam sel?',
    options: [
      'Hanya terdiri daripada udara kering untuk pernafasan',
      'Bahan seperti jeli yang menjadi medium bagi tindak balas biokimia sel',
      'Lapisan keras luar sel',
      'Gentian gentian selulosa tegar'
    ],
    correctAnswer: 'Bahan seperti jeli yang menjadi medium bagi tindak balas biokimia sel',
    correctIndex: 1,
    explanation: 'Sitoplasma mengandungi air, ion, enzim terlarut dan organel, menyediakan persekitaran akueus optimum untuk ribuan tindak balas metabolik sel.',
    displayOrder: 7,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q8',
    gameId: 'maze_chase',
    difficulty: 'high',
    difficultyLabel: 'Aras Tinggi / KBAT',
    points: 150,
    mazeTitle: 'Maze 8: Cabaran Sel Kering',
    question: 'Mengapakah sel tumbuhan tidak pecah (lisis) apabila diletakkan di dalam air suling berkepekatan rendah, berbanding sel darah merah haiwan?',
    options: [
      'Kerana sel tumbuhan mempunyai klorofil tebal',
      'Kerana dinding selulosa yang kuat menahan tekanan osmosis turgor',
      'Kerana sel tumbuhan tidak menyerap molekul air',
      'Kerana vakuol tumbuhan mengecut serta-merta'
    ],
    correctAnswer: 'Kerana dinding selulosa yang kuat menahan tekanan osmosis turgor',
    correctIndex: 1,
    explanation: 'Dinding selulosa tegar menghasilkan tekanan dinding bertentangan yang menahan kemasukan air osmosis berlebihan, mencegah sel tumbuhan daripada meletus (lisis).',
    displayOrder: 8,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q9',
    gameId: 'maze_chase',
    difficulty: 'high',
    difficultyLabel: 'Aras Tinggi / KBAT',
    points: 150,
    mazeTitle: 'Maze 9: Hierarki Organisasi',
    question: 'Susun urutan organisasi sel manusia daripada peringkat paling asas kepada kompleks dengan betul:',
    options: [
      'Sel → Tisu → Organ → Sistem → Organisma',
      'Tisu → Sel → Organ → Sistem → Organisma',
      'Organ → Tisu → Sel → Sistem → Organisma',
      'Sistem → Organ → Tisu → Sel → Organisma'
    ],
    correctAnswer: 'Sel → Tisu → Organ → Sistem → Organisma',
    correctIndex: 0,
    explanation: 'Sel-sel khusus membentuk tisu, pelbagai tisu membentuk organ berfungsi, pelbagai organ membentuk sistem organ, dan rangkaian sistem menyokong organisma lengkap.',
    displayOrder: 9,
    publicationStatus: 'published'
  },
  {
    id: 'maze_q10',
    gameId: 'maze_chase',
    difficulty: 'high',
    difficultyLabel: 'Aras Tinggi / KBAT',
    points: 150,
    mazeTitle: 'Maze 10: Pengkhususan Sel',
    question: 'Sel darah merah matang pada mamalia tidak mempunyai nukleus. Apakah kelebihan penyesuaian biologi ini?',
    options: [
      'Menyediakan lebih banyak ruang bagi hemoglobin untuk mengangkut gas oksigen secara maksimum',
      'Membolehkan sel membelah dengan lebih laju di dalam paru-paru',
      'Mengurangkan berat sel supaya tidak mendap di saluran kapilari darah',
      'Menghasilkan lebih banyak molekul glukosa dan ATP'
    ],
    correctAnswer: 'Menyediakan lebih banyak ruang bagi hemoglobin untuk mengangkut gas oksigen secara maksimum',
    correctIndex: 0,
    explanation: 'Ketiadaan nukleus menghasilkan bentuk dwicekung yang meningkatkan nisbah luas permukaan kepada isi padu dan memuatkan lebih 250 juta molekul hemoglobin per sel.',
    displayOrder: 10,
    publicationStatus: 'published'
  }
];

// 6. CellQuest Organelles Seed
const CELLQUEST_ORGANELLES = [
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
];

// 7. Manual Steps Seed
const MANUAL_STEPS = [
  {
    id: 'step_1',
    icon: '🧫',
    color: 'mint',
    title: 'A. Pengenalan ARSelNel',
    lead: 'Platform pembelajaran sains biologi sel interaktif Tingkatan 1.',
    body: '<p><strong>ARSelNel (Augmented Reality & Science Learning)</strong> ialah kit pembelajaran digital interaktif yang direka khas untuk membantu murid Tingkatan 1 menguasai <em>Bab 2: Sel Sebagai Unit Asas Hidupan</em> dalam Kurikulum Standard Sekolah Menengah (KSSM).</p><p>Kit ini menggabungkan penerokaan visual 3D, Realiti Terimbuh (AR), nota padat, video animasi, pembantu kecerdasan buatan (SelBot AI), serta pelbagai permainan sains interaktif.</p><ul class="manual-instruction-list"><li><span>🧭</span><span><strong>Navigasi Bar Sisi:</strong> Gunakan menu di sebelah kiri untuk berpindah dengan pantas antara 6 modul utama: <strong>Dashboard</strong>, <strong>CellQuest</strong>, <strong>Nota</strong>, <strong>Video</strong>, <strong>Tanya AI</strong>, dan <strong>Kuiz & Permainan</strong>.</span></li><li><span>📱</span><span><strong>Reka Bentuk Responsif:</strong> Berfungsi dengan lancar pada komputer meja, komputer riba, mahupun telefon pintar.</span></li></ul>',
    visualHtml: '<div class="manual-cell-visual"><img src="../assets/home/cell_model.svg" alt="Model Sel Biologi ARSelNel"><div class="manual-float-chip chip-one">🐾 Sel Haiwan</div><div class="manual-float-chip chip-two">🌿 Sel Tumbuhan</div><span class="manual-sparkle sparkle-one" aria-hidden="true">✦</span><span class="manual-sparkle sparkle-two" aria-hidden="true">✧</span></div>',
    displayOrder: 1,
    publicationStatus: 'published'
  },
  {
    id: 'step_2',
    icon: '🔬',
    color: 'blue',
    title: 'B. CellQuest 3D & AR',
    lead: 'Terokai struktur sel haiwan dan tumbuhan dalam 3D dan Realiti Terimbuh.',
    body: '<p>Modul <strong>CellQuest</strong> membolehkan anda membedah dan meneliti organel biologi sel secara terperinci:</p><ul class="manual-instruction-list"><li><span>🐾</span><span><strong>Tukar Jenis Sel:</strong> Klik tab <strong>🐾 Sel Haiwan</strong> atau <strong>🌿 Sel Tumbuhan</strong> untuk menukar model 3D Blender GLB.</span></li><li><span>🖱️</span><span><strong>Kawalan Kamera 360°:</strong> Seret tetikus/jari untuk memutar model; gunakan roda tetikus atau cubit skrin untuk zum masuk/keluar; klik kanan atau gunakan butang <strong>Anjak</strong> untuk mengalihkan kedudukan kamera.</span></li><li><span>👆</span><span><strong>Pilih Organel:</strong> Klik mana-mana organel pada model 3D atau klik namanya dalam senarai sisi untuk membaca fungsi biologi dan fakta sains KSSM.</span></li><li><span>◐</span><span><strong>Keratan & Label:</strong> Gunakan butang <strong>◐ Keratan: aktif</strong> untuk melihat keratan rentas organel dalaman, dan <strong>🏷️ Sembunyikan label</strong> untuk mematikan paparan teks. Tekan <strong>⟳ Tetapkan semula</strong> untuk kembali ke paparan asal.</span></li><li><span>📱</span><span><strong>Aktifkan AR:</strong> Tekan <strong>Mulakan Pengembaraan AR</strong> dan berikan kebenaran kamera pelayar apabila diminta. Halakan kamera ke permukaan rata untuk meletakkan model 3D. <em>(Keserasian AR bergantung pada sokongan WebXR peranti anda; mod 3D tetap berfungsi penuh tanpa kamera).</em></span></li></ul>',
    visualHtml: '<div class="manual-interaction-demo"><div class="manual-orbit"><div class="manual-orbit-cell">🧫</div><span class="orbit-arrow">↻</span><span class="orbit-dot">🟣</span><span class="orbit-dot second">🟢</span></div><div class="manual-gesture-pills"><span>↔ Pusing 360°</span><span>＋ Zum & Anjak</span><span>👆 Pilih Organel</span><span>◐ Mod Keratan</span></div><div class="manual-info-demo"><span>🧬</span><div><b>Nukleus Sel</b><small>Mengawal aktiviti sel & DNA</small></div></div></div>',
    displayOrder: 2,
    publicationStatus: 'published'
  },
  {
    id: 'step_3',
    icon: '📖',
    color: 'orange',
    title: 'C. Nota Interaktif',
    lead: 'Ringkasan padat fakta biologi sel berpandukan silibus KSSM.',
    body: '<p>Modul <strong>Nota Pembelajaran</strong> menyediakan rujukan visual lengkap untuk membantu pemahaman konsep sains:</p><ul class="manual-instruction-list"><li><span>📚</span><span><strong>Buka Modul Nota:</strong> Klik menu <strong>Nota</strong> pada bar sisi atau klik <strong>Mula Belajar Sekarang</strong> pada kad Cadangan Hari Ini di Dashboard.</span></li><li><span>🔬</span><span><strong>Struktur Sel Haiwan & Tumbuhan:</strong> Pelajari setiap organel seperti membran sel, sitoplasma, nukleus, mitokondrion, vakuol, kloroplas, dan dinding sel.</span></li><li><span>⚖️</span><span><strong>Jadual Perbandingan Interaktif:</strong> Bandingkan persamaan dan perbezaan antara sel haiwan dan sel tumbuhan dengan jelas dan mudah difahami.</span></li><li><span>💡</span><span><strong>Fakta Tambahan & Ulangkaji:</strong> Manfaatkan tip sains penting bagi memperkukuh pemahaman sebelum menduduki kuiz atau ujian pentaksiran sekolah.</span></li></ul>',
    visualHtml: '<div class="manual-ui-demo"><span class="manual-demo-label">NOTA SAINS INTERAKTIF</span><div class="manual-demo-tabs"><span>🔬 Struktur Sel</span><span class="selected">⚖️ Perbandingan</span></div><div class="manual-demo-cell" style="font-size:42px;flex-direction:column;gap:6px;padding:12px;">📑<b style="position:static;font-size:12px;color:#1e3a8a;">Jadual Sel Haiwan vs Tumbuhan</b><small style="color:#64748b;font-size:10px;">Dinding sel • Kloroplas • Vakuol</small></div><span class="manual-demo-arrow">Akses nota melalui pautan Mula Belajar Sekarang</span></div>',
    displayOrder: 3,
    publicationStatus: 'published'
  },
  {
    id: 'step_4',
    icon: '🎬',
    color: 'violet',
    title: 'D. Video Pembelajaran',
    lead: 'Perkukuh kefahaman sains dengan animasi 3D dan simulasi eksperimen.',
    body: '<p>Modul <strong>Perpustakaan Video</strong> menawarkan media video interaktif bagi membantu visualisasi proses biologi mikroskopik:</p><ul class="manual-instruction-list"><li><span>▶️</span><span><strong>Tonton Video Animasi:</strong> Saksikan simulasi pergerakan bahan melalui membran sel, proses fotosintesis di dalam kloroplas, dan respirasi sel di mitokondrion.</span></li><li><span>🔬</span><span><strong>Demonstrasi Makmal:</strong> Tonton cara penyediaan slaid sel pipi (sel haiwan) dan slaid sel epidermis bawang (sel tumbuhan) di bawah mikroskop cahaya.</span></li><li><span>⏯️</span><span><strong>Kawalan Penuh:</strong> Anda boleh menjeda (*pause*), mengulang (*replay*), dan menonton dalam mod skrin penuh untuk mencatat maklumat sains penting.</span></li></ul>',
    visualHtml: '<div class="manual-ui-demo"><span class="manual-demo-label">SIMULASI VIDEO 3D</span><div class="manual-demo-cell" style="font-size:52px;background:linear-gradient(135deg,#1e1b4b,#312e81);color:#a5b4fc;">🎥<b style="color:#e0e7ff;font-size:11px;">Animasi Mikroskopik Sel</b></div><div class="manual-gesture-pills" style="margin-top:12px;"><span>▶ Main</span><span>⏸ Jeda</span><span>↺ Ulang</span><span>⛶ Skrin Penuh</span></div></div>',
    displayOrder: 4,
    publicationStatus: 'published'
  },
  {
    id: 'step_5',
    icon: '🤖',
    color: 'pink',
    title: 'E. Tanya AI — SelBot',
    lead: 'Pembantu tutor maya anda untuk menjawab soalan sains sepanjang masa.',
    body: '<p><strong>SelBot AI</strong> ialah pembantu pintar peribadi anda untuk menyelesaikan sebarang kemusykilan biologi sel:</p><ul class="manual-instruction-list"><li><span>💬</span><span><strong>Cara Bertanya:</strong> Buka modul <strong>Tanya AI</strong>, taipkan soalan sains anda ke dalam kotak sembang, dan tekan butang hantar atau Enter.</span></li><li><span>💡</span><span><strong>Contoh Soalan Yang Boleh Ditanya:</strong></span></li></ul><div class="manual-note" style="margin-top:4px;">• <em>"Apakah fungsi nukleus?"</em><br>• <em>"Apakah perbezaan sel haiwan dan sel tumbuhan?"</em><br>• <em>"Mengapa sel tumbuhan mempunyai kloroplas?"</em><br>• <em>"Apakah peranan mitokondrion sebagai penjana tenaga?"</em></div><p style="margin-top:10px;">Anda boleh terus bertanya soalan susulan untuk mendapatkan penerangan sains yang lebih mendalam.</p>',
    visualHtml: '<div class="manual-ui-demo"><span class="manual-demo-label">SEMBANG SELBOT AI</span><div class="manual-info-demo" style="background:#fdf2f8;color:#9d174d;"><span>🤖</span><div><b>SelBot Pembantu Sains</b><small>"Hai! Ada soalan tentang sel?"</small></div></div><div class="manual-info-demo" style="margin-top:8px;background:#f0fdf4;color:#166534;"><span>🧑‍🎓</span><div><b>Soalan Murid</b><small>"Apakah fungsi nukleus?"</small></div></div></div>',
    displayOrder: 5,
    publicationStatus: 'published'
  },
  {
    id: 'step_6',
    icon: '🎮',
    color: 'green',
    title: 'F. Kuiz & Permainan Sains',
    lead: 'Uji pengetahuan anda melalui 5 cabaran permainan interaktif yang menyeronokkan!',
    body: '<p>Akses <strong>Kuiz & Permainan Sains</strong> melalui bar sisi atau butang <strong>Mulakan Cabaran Sains</strong> di Dashboard. Terdapat 5 permainan interaktif utama:</p><ul class="manual-instruction-list"><li><span>🏷️</span><span><strong>Labelkan Organel:</strong> Tarik dan lepaskan label nama organel pada gambar rajah sel haiwan dan sel tumbuhan dengan tepat.</span></li><li><span>🕹️</span><span><strong>Maze Chase: Misi Sel Haiwan & Tumbuhan:</strong> Permainan arked 2D! Baca soalan sains, cari zon jawapan yang betul di dalam maze, kutip <em>power-up</em>, dan elak virus yang mengejar anda.</span></li><li><span>🌳</span><span><strong>Susun Organisasi Kehidupan:</strong> Susun hierarki organisasi kehidupan mengikut urutan yang betul: <em>Sel → Tisu → Organ → Sistem → Organisma</em>.</span></li><li><span>⚡</span><span><strong>Kuiz Saintis Muda:</strong> Jawab soalan kuiz aneka pilihan rawak secara pantas untuk mengumpul mata ganjaran.</span></li><li><span>🔬</span><span><strong>Misi Makmal Sains:</strong> Pengembaraan makmal 2D interaktif meneroka 10 radas makmal dan menyelesaikan soalan eksperimen sains.</span></li></ul>',
    visualHtml: '<div class="manual-mission-demo"><span class="manual-demo-label">5 PERMAINAN SAINS TERSEDIA</span><div class="manual-mission-row" style="margin:12px 0 6px;flex-wrap:wrap;gap:8px;"><span>🏷️<small>Label</small></span><span>🕹️<small>Maze</small></span><span>🌳<small>Susun</small></span><span>⚡<small>Kuiz</small></span><span>🔬<small>Makmal</small></span></div><div class="manual-xp-demo">🏆 Skor Mata • ⏱️ Cabaran Masa • 🎮 Pembelajaran Gamifikasi</div></div>',
    displayOrder: 6,
    publicationStatus: 'published'
  },
  {
    id: 'step_7',
    icon: '🛠️',
    color: 'teal',
    title: 'G. Bantuan & Penyelesaian Masalah',
    lead: 'Panduan pantas sekiranya anda menghadapi sebarang kekangan teknikal.',
    body: '<p>Berikut merupakan langkah penyelesaian mudah untuk isu-isu teknikal lazim:</p><ul class="manual-instruction-list"><li><span>🌐</span><span><strong>Model 3D gagal dimuatkan:</strong> Pastikan anda membuka ARSelNel melalui pelayan web tempatan (contoh: <code>http://localhost:3000</code>) dan bukannya membuka fail secara terus (<code>file://</code>).</span></li><li><span>📷</span><span><strong>Kamera AR tidak berfungsi:</strong> Semak sama ada pelayar dan peranti anda menyokong WebXR serta berikan kebenaran kamera (*Allow Camera*). Jika peranti tidak menyokong AR, gunakan mod 3D interaktif yang berfungsi sepenuhnya.</span></li><li><span>🎬</span><span><strong>Video tidak dimainkan:</strong> Semak kelajuan capaian internet anda dan pastikan tetapan pelayar tidak menyekat media.</span></li><li><span>🤖</span><span><strong>SelBot tidak memberi respons:</strong> Pastikan soalan berkaitan topik sains ditaip dengan ringkas dan jelas, kemudian tekan butang hantar sekali lagi.</span></li><li><span>🎮</span><span><strong>Permainan tidak dapat dikawal:</strong> Gunakan kekunci anak panah atau WASD pada papan kekunci komputer, atau gunakan butang kawalan skrin pada peranti sentuh.</span></li><li><span>🏠</span><span><strong>Cara kembali ke Dashboard:</strong> Anda boleh menekan pautan <strong>← Kembali ke Dashboard</strong> di bahagian atas atau memilih menu <strong>Dashboard</strong> pada bar sisi bila-bila masa.</span></li></ul>',
    visualHtml: '<div class="manual-finish-art" style="min-height:220px;"><span class="finish-cell">🚀</span><span class="finish-star star-a">✨</span><span class="finish-star star-b">⭐</span><span class="finish-star star-c">💡</span><span class="finish-ribbon">Selamat Meneroka ARSelNel!</span></div>',
    displayOrder: 7,
    publicationStatus: 'published'
  }
];

// 8. Student Dashboard Configuration Seed
const DASHBOARD_CONFIG = {
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
};

const fullBackup = {
  version: '2026.10.23',
  appName: 'ARSelNel Interactive Science Learning Kit',
  backupDate: new Date().toISOString(),
  preservationPolicy: 'All existing data preserved strictly. No destructive resets or replacements.',
  collections: {
    quizzes: SEED_QUIZZES,
    notes: SEED_NOTES,
    videos: SEED_VIDEOS,
    ar_models: SEED_AR_MODELS,
    maze_questions: MAZE_QUESTIONS,
    cellquest_organelles: CELLQUEST_ORGANELLES,
    manual_steps: MANUAL_STEPS,
    dashboard_config: DASHBOARD_CONFIG
  }
};

fs.writeFileSync(BACKUP_FILE, JSON.stringify(fullBackup, null, 2), 'utf-8');
console.log(`[Backup Success] CMS data safely backed up to ${BACKUP_FILE}`);
console.log(`Summary of preserved items:
- Quizzes: ${SEED_QUIZZES.length}
- Notes: ${SEED_NOTES.length}
- Videos: ${SEED_VIDEOS.length}
- AR Models: ${SEED_AR_MODELS.length}
- Maze Questions: ${MAZE_QUESTIONS.length}
- CellQuest Organelles: ${CELLQUEST_ORGANELLES.length}
- Manual Steps: ${MANUAL_STEPS.length}
- Dashboard Config: 1 item`);
