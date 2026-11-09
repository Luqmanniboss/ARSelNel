# LAPORAN AUDIT & PERANCANGAN SENI BINA MULTI-MARKER AR (FASA 4A)
**Projek:** ARSELNEL (Sains Tingkatan 1 KSSM — Bab 2: Sel Sebagai Unit Asas Hidupan)  
**Modul:** Kotak ARSELNEL (`kotak_arselnel/`)  
**Status Fasa:** FASA 4A — AUDIT DAN PERANCANGAN SENI BINA SAHAJA  
**Tarikh Audit:** 8 November 2026  
**Peranti Sasaran:** iPad Safari (iPadOS), iPhone (iOS Safari), Tablet & Telefon Android (Chrome)

---

## 1. STRUKTUR PROJEK SEBENAR

Berdasarkan audit fizikal fail dalam workspace projek, modul `kotak_arselnel/` beroperasi bersama modul sokongan ARSELNEL seperti berikut:

### 1.1 Struktur Folder `kotak_arselnel/`
```text
kotak_arselnel/
├── code.html               # 23.9 KB - Halaman utama WebAR (HUD, kamera, panel terapung, POV container)
├── kotak-arselnel.js       # 97.6 KB (2,587 baris) - Logik teras (MindAR, Three.js, POV Lock 3DoF, CMS)
├── kotak-arselnel.css      # 41.0 KB - Penggayaan responsive, glassmorphism, 100dvh safe-area
├── marker-print.html       # 6.9 KB  - Templat cetakan marker untuk murid/guru
└── assets/
    └── markers/
        ├── kotak_arselnel.mind  # 582 KB - Fail binari MindAR (kini mengandungi sasaran Index 0)
        ├── marker-video.png     # 355 KB - Imej marker video 1024x1024 px
        └── marker-video.svg     # 10.4 KB - Vektor resolusi tinggi marker video
```

### 1.2 Kebergantungan Projek ARSELNEL Berkaitan
- **Skrip Kompilasi Marker:** `scripts/compile_marker_mind.js` (6.2 KB) — Menggunakan Headless Chrome dan protokol CDP untuk memanggil `window.MINDAR.IMAGE.Compiler.compileImageTargets()`.
- **Penyesuai Kandungan CMS:** `assets/js/cms-content-adapter.js` (2,583 baris) — Menguruskan pengambilan rekod daripada Supabase dengan sandaran automatik ke `localStorage` dan `BUNDLED_SEEDS`.
- **Pengesahan & Kawalan Akses:** `assets/js/auth-guard.js` & `assets/js/supabase-client.js` — Menguruskan token sesi, semakan tetamu, dan sambungan klien Supabase.
- **Model 3D Sel:** `assets/models/animal_cell.glb`, `assets/models/plant_cell.glb`, `models/animal_cell_final.glb`, dan `models/plantcellnew.glb`.
- **Modul Pembelajaran Rujukan:**
  - `nota_pembelajaran/code.html` & `assets/js/smart-notes.js` (slaid & nota interaktif).
  - `kuiz_interaktif/code.html` (soalan objektif MCQ & pemarkahan).
  - `cellquest/code.html` & `assets/js/cellquest3d.js` (enjin 3D orbit & inspektor organel).
  - `selbot_ai/code.html` (pembantu AI pintar sel & semakan had tetamu).
- **Pelayan Tempatan:** `local-server.js` — Menyediakan HTTP (port 3000) dan HTTPS (port 3443) dengan sokongan sijil SSL sendiri bagi membolehkan capaian kamera WebRTC pada iPad/iPhone dalam rangkaian LAN yang sama.

---

## 2. KOMPONEN YANG BOLEH DIGUNAKAN SEMULA (REUSABILITY)

Hasil audit membuktikan banyak komponen kritikal telah siap dan stabil 100% serta sedia dikongsi tanpa perlu dibina semula:

| Komponen | Fail Sumber | Status Ujian | Catatan Penggunaan Semula |
| :--- | :--- | :--- | :--- |
| **Enjin 3DoF Gyroscope POV Lock (Yaw & Pitch)** | `kotak-arselnel.js` (L1300–L1650) | 16/16 Lulus (iPad Safari) | Algoritma penukaran matriks orientasi W3C `$R = R_z(\alpha) R_x(\beta) R_y(\gamma) R_z(-\theta)$` dan pengekstrakan relatif bebas *gimbal lock* dikongsi untuk semua modul. |
| **Rangka UI Screen-Pinned & S/M/L** | `kotak-arselnel.js` (L1050–L1250) & CSS | 28/28 Lulus | Menjadi templat universal (*AR Floating Panel Manager*) dengan *header*, *scrollable content*, dan *sticky footer*. |
| **Kawalan Kamera (Tutup/Buka Kamera)** | `kotak-arselnel.js` (L750–L785) | Teruji Stabil | Menghentikan *track* kamera WebRTC untuk menjimatkan bateri iPad sambil mengekalkan interaktiviti panel AR. |
| **Fixed POV Recovery Toolbar & Top HUD** | `code.html` & `kotak-arselnel.js` | Teruji Stabil | Butang pemulihan (*Bawa ke Tengah*, *Kalibrasi*, *Tutup Kamera*, *Keluar*) sentiasa berada di luar lapisan transformasi POV. |
| **CMSAdapter Data Layer** | `assets/js/cms-content-adapter.js` | Teruji Penuh | Menyediakan `getVideos`, `getNotes`, `getQuizzes`, `getCellQuestModels`, dan `getCellQuestOrganelles` secara *read-only*. |
| **Skrip Kompilasi MindAR** | `scripts/compile_marker_mind.js` | Teruji Stabil | Boleh menerima tatasusunan imej `[img0, img1, img2, img3, img4]` untuk menghasilkan fail `.mind` multi-marker. |
| **Model 3D Sel Haiwan & Tumbuhan** | `models/` & `assets/models/` | Sah | Model `.glb` yang telah dioptimumkan saiznya untuk peranti mudah alih. |
| **Enjin Dialog Pintar SelBot** | `selbot_ai/code.html` | Teruji Penuh | Logik pemadanan soalan berasaskan kata kunci Sains KSSM dan kawalan had tetamu (2 soalan maksimum). |

---

## 3. KOMPONEN YANG PERLU DIBANGUNKAN

Untuk melengkapkan Fasa 4, komponen baharu berikut perlu dibangunkan secara berperingkat:

1. **Aset Marker Baharu (Fasa 4B):**
   - 4 fail vektor/imej baharu: `marker-nota.svg/png`, `marker-kuiz.svg/png`, `marker-cellquest.svg/png`, `marker-selbot.svg/png`.
   - Menggunakan bingkai geometri berkontras tinggi dan corak visual unik berketumpatan ciri tinggi (*high feature density*) bagi memudahkan pengesanan kamera MindAR.
2. **Fail `.mind` Multi-Target (Fasa 4B):**
   - Kompilasi semula `kotak_arselnel.mind` yang mengandungi 5 sasaran (Index 0 hingga Index 4).
3. **Penyelaras Multi-Sauh AR (AR Marker Manager) (Fasa 4B):**
   - Logik inisialisasi MindAR yang mendaftar kelima-lima anchor dan menguruskan masa henti penapis (*hysteresis debounce*) agar tidak berlaku pertukaran modul yang tidak disengajakan semasa murid memegang kotak.
4. **Pendaftar Modul (AR Module Registry) (Fasa 4B):**
   - Struktur data deklaratif yang memetakan nombor indeks sasaran kepada konfigurasi modul (ID, Tajuk, Warna Tema, Ikon, Pemunggah Kandungan, Pembersih Memori).
5. **Panel Nota Interaktif (Fasa 4C):**
   - Paparan slaid ringkasan sel, navigasi muka surat, kawalan zum teks/rajah, dan senarai fakta penting KSSM Bab 2.
6. **Panel Kuiz & Permainan (Fasa 4D):**
   - Antara muka soalan objektif MCQ, pilihan jawapan interaktif, maklum balas warna segera, pengiraan skor, dan butang cuba semula.
7. **Panel CellQuest 3D (Fasa 4E):**
   - Paparan model 3D interaktif di dalam panel dengan pusingan 360°, suis tab Sel Haiwan vs Sel Tumbuhan, dan label organel.
8. **Panel Tanya AI / SelBot (Fasa 4F):**
   - Antara muka perbualan ringkas dengan cadangan soalan (*quick prompts*), jawapan mesra murid, dan kad visual.
9. **Helaian Cetakan Kotak 6 Muka (Fasa 4F):**
   - Halaman cetakan kemas (PDF/HTML) yang memaparkan bentangan kotak kubus 3D (net) untuk digunting dan dilipat oleh murid.

---

## 4. CADANGAN SENI BINA MULTI-MARKER

Bagi memastikan kod kekal bersih, stabil dan mudah diselenggara, keseluruhan sistem beroperasi melalui 5 lapisan seni bina:

```
+--------------------------------------------------------------------------+
|                        INPUT PERKAKASAN & DATA                           |
|  Kamera WebRTC (MindAR) | Sensor Giroskop (3DoF) | CMSAdapter / Seeds    |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                  AR MARKER MANAGER & STATE LIFECYCLE                     |
|  - Inisialisasi MindAR Three (Single Renderer Shared Context)            |
|  - addAnchor(0..4) dengan Pemasa Histeresis Penyahpental (Debounce)      |
|  - Pengurus Status Aktif (Active Module State Switcher)                  |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                           AR MODULE REGISTRY                             |
|  Index 0: Video | Index 1: Nota | Index 2: Kuiz | Index 3: 3D | Index 4: AI|
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                    UNIVERSAL FLOATING PANEL MANAGER                      |
|  - Header Responsif (Ikon Modul, Tajuk Modul, Saiz S/M/L, Tutup Kamera)  |
|  - Scrollable Body (Kandungan Khusus Modul: Video / Nota / Kuiz / 3D / AI|
|  - Sticky Footer (Kunci POV, Kunci Kedudukan, Tukar Kandungan, Tutup)    |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                  UNIVERSAL 3DoF POV LOCK CONTROLLER                      |
|  - Formula W3C Orientation Matrix (Yaw Azimuth & Pitch Elevation)        |
|  - Ununjuran Skrin FOV Maya (Virtual POV Camera Projection)              |
|  - Bar Pemulihan Terapung Tetap (Fixed Recovery Toolbar)                 |
+--------------------------------------------------------------------------+
```

### Kitaran Hayat Pertukaran Modul (Module Switching Lifecycle):
1. **Pengecaman Sasaran Baharu:** Kamera mengesan muka kotak baharu (cth. Index 1: Nota).
2. **Hentikan Media & Kosongkan Memori Modul Terdahulu:**
   - Sekiranya Modul Video aktif: Iframe YouTube/HTML5 dipadamkan segera bagi menghentikan audio.
   - Sekiranya Modul 3D aktif: Objek Three.js dilupuskan bagi mengelakkan kebocoran memori GPU.
3. **Pemuatan Data & Render Bersih:** Modul baharu mengambil data melalui `CMSAdapter` dan mengisi bahagian *Scrollable Body* panel universal.
4. **Kekalkan Mod Semasa:** Sekiranya panel berada dalam mod *Screen-Pinned* atau *POV Lock*, kedudukan panel dan mod paparan dikekalkan tanpa gangguan skrin hitam.

---

## 5. PEMETAAN LIMA MARKER PADA KOTAK FIZIKAL (CUBE SIDES MAPPING)

Kotak ARSELNEL direka sebagai kubus pembelajaran 10 cm x 10 cm x 10 cm:

| Muka Kubus | Sasaran Marker | Indeks MindAR | Warna Aksen | Simbol Visual Marker | Modul ARSELNEL |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Muka 1 (Hadapan)** | `marker-video` | 0 | Jingga (`#f97316`) | Ikon *Play* Segi Tiga & Gelombang Isyarat | Video Pembelajaran KSSM |
| **Muka 2 (Kanan)** | `marker-nota` | 1 | Teal (`#0d9488`) | Buku Sains Terbuka & Teks Garisan | Nota & Slaid Interaktif |
| **Muka 3 (Belakang)** | `marker-kuiz` | 2 | Ungu (`#7c3aed`) | Trofi Kejayaan & Simbol Tanda Soal | Kuiz Uji Minda & Skor |
| **Muka 4 (Kiri)** | `marker-cellquest` | 3 | Biru Laut (`#2563eb`) | Struktur Heliks Sel & Kubus 3D | Model 3D Sel Haiwan & Tumbuhan |
| **Muka 5 (Atas)** | `marker-selbot` | 4 | Merah Rose (`#e11d48`) | Maskot Robot SelBot & Antena AI | Tanya AI / SelBot |
| **Muka 6 (Tapak Bawah)** | *Bukan Marker* | - | Kelabu Gelap (`#334155`) | QR Kod Laman Web & Petunjuk Hak Cipta | Tapak Meja (Tiada AR) |

---

## 6. RISIKO TEKNIKAL DAN MITIGASI

| Risiko Teknikal | Punca | Kesan | Langkah Mitigasi (Seni Bina) |
| :--- | :--- | :--- | :--- |
| **Kebocoran Memori & Ranap Safari iPadOS** | Penciptaan berbilang WebGL context (cth. MindAR + kanvas Three.js kedua untuk CellQuest 3D). | Ralat Safari: *"A problem repeatedly occurred on this webpage"* atau *WebProcess Terminated*. | **Seni bina Konteks Tunggal:** CellQuest 3D menggunakan canvas Three.js sedia ada milik MindAR, atau jika menggunakan mini-canvas di dalam panel, panggil `renderer.dispose()` dan kosongkan geometri/tekstur serta-merta apabila bertukar modul. |
| **Audio Video Terus Bermain Semasa Bertukar Modul** | Iframe YouTube tidak dimusnahkan apabila murid memusingkan kotak ke marker Nota/Kuiz. | Gangguan bunyi berlapis yang mengelirukan murid. | Setiap modul mendaftar fungsi `cleanup()`. Apabila `activeModule` bertukar, panggil `DOM.playerFrame.innerHTML = ''` dengan serta-merta. |
| **Gimbal Lock & Drift Orientasi Sensor pada iPad** | Nilai Euler rawak apabila peranti condong melebihi 90° atau bertukar mod landscape. | Panel POV lari arah atau berpusing sendiri. | Menggunakan pengiraan quaternion dan matriks W3C Device Orientation sedia ada yang telah disahkan stabil pada Fasa 3C. |
| **Kelewatan Pengesanan Semasa Memusing Kotak** | Algoritma pengesanan MindAR mencari 5 sasaran serentak. | Kadar bingkai sesaat (FPS) kamera menurun pada telefon kelas permulaan (*low-end*). | Tetapkan saiz kompilasi marker yang optimum (1024x1024 px) dan gunakan corak visual dengan kontras tinggi serta elakkan garis halus kabur. |
| **Kehilangan Akses Internet / Supabase Terputus** | Capaian internet sekolah atau makmal sains tidak stabil. | Halaman tersekat atau paparan kosong. | `CMSAdapter` dilengkapi sistem dwi-sandaran (*dual fallback*): membaca `localStorage` dan benih tempatan `BUNDLED_SEEDS` secara automatik tanpa memerlukan sambungan pangkalan data aktif. |

---

## 7. KEBERGANTUNGAN SUPABASE DAN CMS

Audit mengesahkan tahap kebergantungan adalah selamat dan berisiko sifar terhadap data produksi:

1. **Sifat Operasi:** **100% Read-Only (BACAAN SAHAJA)**.
2. **Skema & Jadual Sedia Ada:**
   - `cms_videos` (diterbitkan)
   - `notes` / `cms_notes` (diterbitkan)
   - `cms_quizzes` / `cms_game_questions` (diterbitkan)
   - `cms_cellquest_models` & `cms_cellquest_organelles` (diterbitkan)
3. **Tiada Migrasi:** Tiada jadual baharu dicipta, tiada kolum diubah, tiada rekod dipadam atau diubah suai.
4. **Sandaran Tempatan Luar Talian:** Sekiranya Supabase tidak boleh dicapai, kesemua 5 modul akan menggunakan data benih tempatan (`BUNDLED_SEEDS`) yang sedia wujud dalam `cms-content-adapter.js`.

---

## 8. PELAN UJIAN REGRESI DAN KESELAMATAN

Bagi memastikan Fasa 4 tidak merosakkan pencapaian Fasa 1, 2 dan 3, pelan ujian berikut ditetapkan:

### 8.1 Set Ujian Regresi Automatik (Sedia Ada)
Sebelum sebarang penggabungan kod:
1. `tests/test_pitch_and_video_fasa_c.js` (16 ujian) — Memastikan integrasi pemain video sebenar dan Pitch Lock kekal berfungsi.
2. `tests/test_3dof_pov_stabilization.js` (17 ujian) — Memastikan orientasi Yaw dan matriks penstabilan tidak terjejas.
3. `tests/test_size_l_responsive.js` (28 ujian) — Memastikan panel saiz L kekal responsif dengan `100dvh` dan *sticky footer*.
4. `tests/test_kotak_arselnel_phase3.js` (29 ujian) — Memastikan mod *Screen-Pinned*, seretan, dan *re-anchor* kekal normal.
*Jumlah ujian asas: 90 / 90 ujian mesti kekal lulus (100%).*

### 8.2 Set Ujian Baharu untuk Fasa 4
1. **Ujian Pengesanan Multi-Marker:** Menguji bahawa kelima-lima sasaran (Index 0 hingga 4) dikesan dengan tepat dan memaparkan modul yang sepadan.
2. **Ujian Penukaran Modul Bersih:** Menguji bahawa penukaran antara modul mematikan audio video dan tidak meninggalkan kesan memori.
3. **Ujian Kestabilan POV Universal:** Menguji fungsi POV Lock apabila diaktifkan pada modul Nota, Kuiz, 3D, dan SelBot.
4. **Ujian Memori iPad Safari:** Ujian simulasi 10 kali putaran kotak berturut-turut untuk memastikan penggunaan RAM GPU kekal di bawah 250 MB.

---

## 9. CADANGAN STRUKTUR FAIL & PELAN PELAKSANAAN FASA 4B HINGGA 4F

### 9.1 Cadangan Penambahan Struktur Fail Bersih
```text
kotak_arselnel/
├── assets/
│   └── markers/
│       ├── kotak_arselnel.mind       # Diperbaharui dengan 5 sasaran (Index 0..4)
│       ├── marker-video.png / .svg   # Muka 1 (Video) - Sedia ada
│       ├── marker-nota.png / .svg    # Muka 2 (Nota) - Baharu
│       ├── marker-kuiz.png / .svg    # Muka 3 (Kuiz) - Baharu
│       ├── marker-cellquest.png / .svg # Muka 4 (CellQuest 3D) - Baharu
│       └── marker-selbot.png / .svg  # Muka 5 (SelBot) - Baharu
├── modules/ (atau diintegrasikan secara modular dalam kotak-arselnel.js)
│   ├── module-registry.js           # Definisi pendaftar modul & kawalan kitaran hayat
│   ├── module-nota.js               # Render UI Nota Interaktif
│   ├── module-kuiz.js               # Render UI Kuiz Interaktif
│   ├── module-cellquest.js          # Render UI Model 3D Sel
│   └── module-selbot.js             # Render UI Tanya AI
└── marker-print.html                 # Diperluas dengan templat bentangan kubus 6 muka
```

### 9.2 Pelan Rollback
- Salinan sandaran titik pemulihan (*snapshot*): Fail `code.html`, `kotak-arselnel.js`, dan `kotak-arselnel.css` sebelum Fasa 4B akan disandarkan sebagai `kotak-arselnel.fasa3c.bak.js`.
- Sekiranya enjin multi-marker gagal dikesan dengan lancar, sistem boleh dikembalikan kepada `kotak_arselnel.mind` satu marker dalam masa kurang 1 minit.

### 9.3 Pelan Pelaksanaan Bertahap:
- **Fasa 4B: Enjin Multi-Marker & Penyedia 5 Sasaran Fizikal**
  - Hasilkan 4 reka bentuk vektor SVG berkejituan tinggi untuk Nota, Kuiz, CellQuest, dan SelBot.
  - Jana imej PNG 1024x1024 px bagi setiap sasaran.
  - Jalankan `scripts/compile_marker_mind.js` untuk menghasilkan `kotak_arselnel.mind` (5 targets).
  - Kemas kini `kotak-arselnel.js` untuk mendaftar sauh 0 hingga 4 berserta indikator modul asas.
  - Jalankan ujian pengesanan kamera dan berhenti untuk semakan.
- **Fasa 4C:** Pembangunan Modul Nota Interaktif.
- **Fasa 4D:** Pembangunan Modul Kuiz & Permainan Sains.
- **Fasa 4E:** Pembangunan Modul CellQuest 3D Organelle Inspector.
- **Fasa 4F:** Pembangunan Modul Tanya AI / SelBot & Lembaran Cetakan Kubus 6 Muka.

---

> [!IMPORTANT]
> **PENGESAHAN KEPATUHAN:**  
> Fasa 4A ini telah dijalankan secara audit dan perancangan seni bina semata-mata.  
> - Tiada sebarang data atau skema Supabase yang diubah.  
> - Tiada kod produksi yang dimodifikasi.  
> - Tiada commit atau push GitHub dijalankan.  
> - Tiada dakwaan ujian palsu.  
> 
> **STATUS:** Laporan audit siap. Saya **BERHENTI DI SINI** dan menantikan arahan serta kelulusan anda sebelum sebarang langkah Fasa 4B dimulakan.

