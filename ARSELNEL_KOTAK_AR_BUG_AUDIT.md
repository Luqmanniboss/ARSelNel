# ARSELNEL — Laporan Audit Pepijat Kotak ARSELNEL (WebAR & Three.js)

> **Dokumen:** Audit Kualiti, Kebolehpercayaan WebAR, Timbunan Pepijat & Pelan Pembaikan  
> **Sasaran Modul:** `kotak_arselnel` (Kotak ARSELNEL / WebAR Marker System)  
> **Peranan:** Senior WebAR, Three.js, MindAR, JavaScript & Browser Debugging Engineer  
> **Status Kod:** Mod Baca Sahaja (Tiada kod aplikasi diubah semasa audit ini)  
> **Tarikh Audit:** 22 November 2026

---

## A. Titik Masuk Aktif & Peta Kebergantungan (Active Entry Points & Dependency Map)

Berdasarkan audit fail fizikal dan kod sumber sebenar:

### 1. Titik Masuk (Entry Points)
- **Pelayar Masuk:** `kotak_arselnel/index.html` — Mengalihkan pengguna serta-merta ke `kotak_arselnel/code.html` dengan mengekalkan parameter URL dan hash (`location.replace('code.html' + location.search + location.hash)`).
- **Halaman Pengimbas Utama:** `kotak_arselnel/code.html` (1,415 baris).
- **Halaman Cetakan Marker:** `kotak_arselnel/marker-print.html` (436 baris).

### 2. Fail Pengeluaran Aktif vs Fail Sejarah (.bak)
- **Aktif Pengeluaran:**
  - `kotak_arselnel/code.html`
  - `kotak_arselnel/kotak-arselnel.js` (13,373 baris, 554 KB)
  - `kotak_arselnel/kotak-arselnel.css` (5,142 baris, 212 KB)
  - `kotak_arselnel/marker-print.html`
  - `kotak_arselnel/assets/markers/kotak_arselnel.mind` (4.83 MB)
- **Fail Arkib / Sandaran (Tidak digunakan dalam runtime):**
  - Terdapat 23 fail `.bak.html`, 16 fail `.bak.js`, 15 fail `.bak.css`, dan 6 fail `.bak.mind` (contoh: `code.fasa4eb24.bak.html`, `kotak-arselnel.fasa4f.bak.js`, `kotak_arselnel.fasa4f.bak.mind`). Fail-fail ini tidak diimport oleh `code.html`.

### 3. Peta Kebergantungan Luaran & Dalaman (Runtime Dependencies)
```
kotak_arselnel/code.html
├── CDN Scripts:
│   ├── mindar-image-three.prod.js (MindAR v1.1.5 + Three.js r128 bundle)
│   ├── GLTFLoader.js (Three.js v0.128.0 GLTFLoader)
│   ├── @supabase/supabase-js@2 (v2.x)
│   └── pdf.min.js (PDF.js v3.11.174 CDN fallback)
├── Aset Skrip Tempatan:
│   ├── ../assets/js/supabase-client.js
│   ├── ../assets/js/auth-guard.js
│   ├── ../assets/js/selbot-conversation-service.js
│   ├── ../assets/js/cms-content-adapter.js
│   ├── ../assets/vendor/pdfjs/pdf.min.js
│   ├── /kotak_arselnel/kotak-arselnel.js
│   ├── ../assets/js/guided-tour-config.js
│   └── ../assets/js/guided-tour.js
├── Aset Gaya (CSS):
│   ├── /kotak_arselnel/kotak-arselnel.css
│   └── ../assets/css/guided-tour.css
├── Aset Binari WebAR & 3D:
│   ├── /kotak_arselnel/assets/markers/kotak_arselnel.mind (4,828,773 bait — 8 sasaran)
│   ├── /models/animal_cell_final.glb (2.8 MB)
│   └── /models/plantcellnew.glb (9.6 MB)
```

---

## B. Ringkasan Klasifikasi Penemuan & Tahap Keterukan

| ID | Penemuan | Keterukan | Klasifikasi | Modul Terlibat |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Kawalan UI CellQuest 3D Hilang dalam HTML (Butang Tukar Sel, Bandingkan, Label & Modal Sains) | **High** | **VERIFIED** | `code.html`, `kotak-arselnel.js` |
| **BUG-02** | Desinkronisasi Paparan Tab & Kad Marker pada `marker-print.html` | **Medium** | **VERIFIED** | `marker-print.html` |
| **BUG-03** | Kebocoran Memori WebGL (Geometri & Bahan Klonan Tidak Dilupuskan Semasa Pertukaran Model 3D) | **Medium** | **VERIFIED** | `kotak-arselnel.js` (CellQuest) |
| **BUG-04** | Laluan Mutlak GLB Berisiko Gagal Jika Dihoskan Bawah Sub-Direktori | **Medium** | **VERIFIED** | `kotak-arselnel.js` (GLTF Loading) |
| **BUG-05** | Kekaburan Pemilihan Sentuhan Model Semasa Mod Dwi-Sel (Compare Mode Touch Ambiguity) | **Medium** | **VERIFIED** | `kotak-arselnel.js` (Raycast/Pointers) |
| **BUG-06** | Kegagalan Kamera Tanpa Mesej Jelas pada Akses IP Rangkaian Tempatan (Bukan HTTPS/Localhost) | **High** | **VERIFIED** | `kotak-arselnel.js` (MindAR Init) |
| **BUG-07** | Kod Mati (Dead Code) & 209 Rujukan DOM Terbiar untuk Kuiz & SelBot AR yang Dinyahaktifkan | **Low** | **VERIFIED** | `kotak-arselnel.js` |
| **BUG-08** | Risiko Sekatan Keizinan `DeviceOrientationEvent` pada iOS Safari Jika Tidak Segerak | **High** | **NEEDS DEVICE TESTING** | `kotak-arselnel.js` (Sensor POV) |
| **BUG-09** | Sekatan Skrol Sentuhan Safari Berpotensi Terjejas oleh `pointermove` Global | **Medium** | **NEEDS DEVICE TESTING** | `kotak-arselnel.js` (Event Listeners) |
| **BUG-10** | Pertindihan Pemasa Hysteresis 2200ms Semasa Pertukaran Marker Berkelajuan Tinggi | **Low** | **SUSPECTED** | `kotak-arselnel.js` (State Machine) |

---

## C. Perincian Penemuan Bukti-Berasaskan (Detailed Evidence-Based Findings)

### BUG-01: Kawalan UI CellQuest 3D Hilang dalam HTML (Butang Tukar Sel, Bandingkan & Modal Sains)
- **Status:** `VERIFIED`
- **Keterukan:** **High**
- **Fail Terlibat:**
  - `kotak_arselnel/code.html` (Baris 200–425)
  - `kotak_arselnel/kotak-arselnel.js` (Baris 646–676, 7604–7646, 12193–12245)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Buka `kotak_arselnel/code.html`.
  2. Imbas Marker 3 (Sel Haiwan 3D). Model 3D Sel Haiwan berjaya muncul.
  3. Perhatikan antara muka di skrin: Tiada butang untuk murid bertukar ke Sel Tumbuhan, tiada butang mod Perbandingan ("Bandingkan"), tiada butang Label Organel, dan tiada butang untuk membuka modal fakta sains KSSM (`#cq-compare-modal`).
- **Punca Masalah (Root Cause):**
  Semasa fasa Hotfix 1.2, bar alat bawah CellQuest (`#cq-bottom-controls`) telah dipadamkan daripada fail HTML `code.html` atas permintaan membersihkan "Screen Pinning". Namun, pemadaman itu turut membuang butang penting:
  `#cq-btn-animal`, `#cq-btn-plant`, `#cq-btn-compare`, `#cq-btn-labels`, dan `#cq-btn-diff-modal`.
  Akibatnya, fungsi JavaScript yang telah dibina dengan lengkap untuk pertukaran sel dan modal perbandingan sains KSSM (baris 321–424 `code.html`) tidak mempunyai sebarang elemen pemicu (trigger) dalam DOM.
- **Bukti (Evidence):**
  Pemeriksaan statik mendapati `kotak-arselnel.js` mengandungi kod:
  ```javascript
  DOM.cqBtnAnimal = document.getElementById('cq-btn-animal'); // null
  DOM.cqBtnPlant = document.getElementById('cq-btn-plant');   // null
  DOM.cqBtnCompare = document.getElementById('cq-btn-compare'); // null
  DOM.cqBtnDiffModal = document.getElementById('cq-btn-diff-modal'); // null
  ```
  Kesemua elemen ini mengembalikan `null`, menyebabkan murid hanya boleh melihat Sel Haiwan melainkan mereka secara fizikal mengimbas Marker 4.
- **Cadangan Pembaikan Minimal:**
  Sediakan bar kawalan atas atau bawah yang ringkas dan moden khusus untuk CellQuest HUD (`.cq-hud-center` atau bar navigasi kompak) yang mengandungi butang bertukar `Sel Haiwan`, `Sel Tumbuhan`, `Bandingkan`, dan pemicu `Nota Sains (Jadual Perbandingan)`.
- **Risiko Regresi:** Rendah jika diletakkan di dalam `.cellquest-ar-hud` tanpa mengganggu viewport panel Video/Nota.

---

### BUG-02: Desinkronisasi Paparan Tab & Kad Marker pada `marker-print.html`
- **Status:** `VERIFIED`
- **Keterukan:** **Medium**
- **Fail Terlibat:**
  - `kotak_arselnel/marker-print.html` (Baris 277–370)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Buka fail `kotak_arselnel/marker-print.html` di pelayar web.
  2. Lihat tab yang aktif: Tab `1. Video` bertanda aktif (warna oren).
  3. Skrol ke bawah: Kelihatan Kad 0 (Video), Kad 1 (Nota), dan Kad 3 (Sel Haiwan) dipaparkan serentak secara bertindih secara menegak.
  4. Kad 4 (Sel Tumbuhan), Kad 5 (Jelajah 3D), dan Kad 6 (AR Orientasi Dunia) pula tersembunyi kerana mempunyai atribut inline `style="display:none;"`.
- **Punca Masalah (Root Cause):**
  Pada markup HTML `marker-print.html`:
  - Baris 322: `<div class="marker-frame frame-video" id="card-video">` (tiada `display:none`)
  - Baris 331: `<div class="marker-frame frame-nota" id="card-nota">` (tiada `display:none`)
  - Baris 340: `<div class="marker-frame frame-haiwan" id="card-haiwan">` (tiada `display:none`)
  - Baris 348: `<div ... id="card-tumbuhan" style="display:none;">`
  - Baris 357: `<div ... id="card-jelajah3d" style="display:none;">`
  - Baris 366: `<div ... id="card-orientasi" style="display:none;">`
  Skrip `showMarker(type)` hanya dipanggil apabila butang tab diklik. Semasa pemuatan awal (initial load), skrip tidak dipanggil, menyebabkan 3 kad pertama dipaparkan serentak walaupun tab yang aktif hanya menandakan "Video".
- **Bukti (Evidence):**
  Pemeriksaan baris 320–370 mengesahkan kehadiran atribut inline `style="display:none;"` yang tidak sekata antara kad 0..2 dengan kad 3..5.
- **Cadangan Pembaikan Minimal:**
  Panggil `showMarker('video')` (atau `showMarker('all')` jika mod cetakan lalai) semasa `DOMContentLoaded` di dalam `marker-print.html`, atau letakkan `style="display:none;"` pada semua kad selain kad video semasa pemuatan awal.
- **Risiko Regresi:** Sifar. Hanya melibatkan halaman bantuan cetakan statik.

---

### BUG-03: Kebocoran Memori WebGL (Geometri & Bahan Klonan Tidak Dilupuskan Semasa Pertukaran Model)
- **Status:** `VERIFIED`
- **Keterukan:** **Medium**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 7729–7840, `buildModel`)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Buka Kotak ARSELNEL pada peranti mudah alih (iPhone Safari / Android Chrome).
  2. Imbas Marker Sel Haiwan, kemudian Marker Sel Tumbuhan, kemudian kembali ke Sel Haiwan berulang kali (10–15 kali).
  3. Buka tab Memory / Performance di Safari Web Inspector.
  4. Perhatikan peningkatan berterusan memori GPU WebGL dan objek material.
- **Punca Masalah (Root Cause):**
  Di dalam fungsi `buildModel(cellType, gltfScene)`:
  ```javascript
  while (targetHolder.children.length > 0) {
    const child = targetHolder.children[0];
    targetHolder.remove(child); // Hanya membuang dari scene graph!
  }
  ```
  Setiap kali model dibina, `gltfScene.clone(true)` dipanggil dan setiap mesh diklonkan bahan baharu (`c = m.clone()`, baris 7776). Tambahan pula, geometri sfera `new THREE.SphereGeometry(...)` dan sprite teks kanvas dicipta semula. Objek `geometry`, `material`, dan `texture` lama tidak pernah memanggil kaedah `.dispose()`.
- **Bukti (Evidence):**
  Tiada panggilan `geometry.dispose()` atau `material.dispose()` ditemui di dalam `clearModelHolder()` atau `buildModel()`.
- **Cadangan Pembaikan Minimal:**
  Cipta fungsi rekursif `disposeHierarchy(obj)` yang menelusuri anak-anak objek dan melupuskan geometri, bahan, dan tekstur sebelum membuang objek daripada `targetHolder`:
  ```javascript
  function disposeHierarchy(node) {
    node.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }
  ```
- **Risiko Regresi:** Rendah, memastikan kestabilan WebGL pada iPhone dan mengelakkan isu *web process crash*.

---

### BUG-04: Laluan Mutlak GLB Berisiko Gagal Jika Dihoskan Bawah Sub-Direktori
- **Status:** `VERIFIED`
- **Keterukan:** **Medium**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 7681)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Pasang aplikasi di bawah sub-laluan pelayan (contoh: `https://sekolah.edu.my/arselnel/`).
  2. Navigasi ke `https://sekolah.edu.my/arselnel/kotak_arselnel/code.html`.
  3. Imbas kad Sel Haiwan.
  4. Pelayar akan memohon `https://sekolah.edu.my/models/animal_cell_final.glb` (mengabaikan `/arselnel/`) dan menerima ralat `404 Not Found`.
- **Punca Masalah (Root Cause):**
  Baris 7681 menetapkan laluan mutlak berpunca dari domain (`/`):
  ```javascript
  const modelUrl = cellType === 'animal' ? '/models/animal_cell_final.glb' : '/models/plantcellnew.glb';
  ```
  Berbeza dengan `getMarkerMindUrl()` (baris 8780) yang menyemak `loc.pathname` secara dinamik, `loadSingleCell()` menggunakan rentetan statik yang bermula dengan tanda `/`.
- **Bukti (Evidence):**
  Perbandingan kod antara `getMarkerMindUrl()` (dinamik) dan `loadSingleCell()` (statik mutlak) menunjukkan ketidakkonsistenan resolusi URL.
- **Cadangan Pembaikan Minimal:**
  Gunakan resolusi URL berasaskan lokasi relatif atau semak punca aplikasi:
  ```javascript
  function getModelAssetUrl(filename) {
    const loc = window.location;
    if (loc.pathname.includes('/kotak_arselnel')) {
      const rootPart = loc.pathname.substring(0, loc.pathname.indexOf('/kotak_arselnel'));
      return `${loc.origin}${rootPart}/models/${filename}`;
    }
    return `/models/${filename}`;
  }
  ```
- **Risiko Regresi:** Rendah.

---

### BUG-05: Kekaburan Pemilihan Sentuhan Model Semasa Mod Dwi-Sel (Compare Mode Touch Ambiguity)
- **Status:** `VERIFIED`
- **Keterukan:** **Medium**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 6640–6670, `initPointerInteractions`)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Aktifkan mod perbandingan sel (Marker 3 dan Marker 4 dikesan serentak).
  2. Sel Haiwan dipaparkan di sebelah kiri, Sel Tumbuhan di sebelah kanan skrin.
  3. Murid meletakkan jari di atas Sel Tumbuhan (kanan) dan membuat seretan putaran.
  4. Jika `this.selectedCell` masih bertetapan pada `'animal'`, model Sel Haiwan (kiri) yang akan berputar, bukan Sel Tumbuhan yang sedang disentuh oleh murid.
- **Punca Masalah (Root Cause):**
  Pengendali `pointerdown` dan `pointermove` menggunakan `this.selectedCell` sedia ada untuk operasi putaran dan penskalaan tanpa menyemak sama ada titik sentuhan awal (`e.clientX`, `e.clientY`) berada pada separuh kiri (Sel Haiwan) atau separuh kanan (Sel Tumbuhan) skrin. Fungsi pemilihan sentuhan `handleTapRaycast` hanya dipanggil jika pergerakan jari kurang daripada 10px dan masa sentuhan kurang daripada 400ms (iaitu ketukan pegun / stationary tap sahaja).
- **Bukti (Evidence):**
  Pada baris 6605:
  ```javascript
  const targetState = this.cellState && this.cellState[this.selectedCell];
  ```
  Model yang dimanipulasi adalah statik mengikut `this.selectedCell` tanpa pengesanan kedudukan skrin X (`e.clientX < window.innerWidth / 2 ? 'animal' : 'plant'`).
- **Cadangan Pembaikan Minimal:**
  Semasa `displayMode === 'compare'`, pada `pointerdown`, jika sentuhan bermula di kawasan kanan skrin (`e.clientX > window.innerWidth / 2`), kemas kini `this.setSelectedCell('plant')` secara automatik, dan sebaliknya jika di kawasan kiri.
- **Risiko Regresi:** Rendah; meningkatkan ketepatan intuisi sentuhan murid Tingkatan 1 secara signifikan.

---

### BUG-06: Kegagalan Kamera Tanpa Mesej Jelas pada Akses IP Rangkaian Tempatan (Bukan HTTPS/Localhost)
- **Status:** `VERIFIED`
- **Keterukan:** **High**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 8920–8945, `initMindAR`)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Jalankan `local-server.js` pada komputer guru/pembangun (contoh port 3000).
  2. Buka pelayar Safari/Chrome pada iPad atau telefon pintar menggunakan alamat IP LAN: `http://192.168.0.105:3000/kotak_arselnel/code.html`.
  3. Halaman tersekat pada skrin pemuatan "Menyediakan Kotak ARSELNEL" atau terus bertukar ke mod simulasi tanpa amaran jelas.
- **Punca Masalah (Root Cause):**
  Spesifikasi keselamatan W3C WebRTC melarang `navigator.mediaDevices.getUserMedia` pada mana-mana protokol `http://` kecuali `localhost` (127.0.0.1). Pelayar mudah alih menolak kamera dengan `NotAllowedError` atau menyekat API tersebut sama sekali (`navigator.mediaDevices === undefined`). Tangkapan ralat pada `initMindAR` menangkap ralat ini tetapi mesej diagnostik tidak menerangkan kepada guru/murid bahawa protokol HTTPS diperlukan untuk ujian rentas peranti dalam talian setempat.
- **Bukti (Evidence):**
  Konsol memaparkan `[KotakAR] Ralat kritikal semasa initMindAR: NotAllowedError` dan jatuh ke mod simulasi komputer tanpa panduan pemulihan SSL/HTTPS.
- **Cadangan Pembaikan Minimal:**
  Kesan `window.isSecureContext === false && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1'`. Jika dikesan, paparkan modal amaran mesra pengguna dalam Bahasa Melayu:
  *"Kamera WebAR memerlukan sambungan selamat (HTTPS) atau 'localhost'. Untuk menguji pada telefon pintar, gunakan alamat HTTPS Vercel atau aktifkan mod HTTPS pada pelayar anda."*
- **Risiko Regresi:** Sifar; menambah baik kebolehgunaan sistem semasa bengkel/makmal sains sekolah.

---

### BUG-07: Kod Mati & 209 Rujukan DOM Terbiar untuk Kuiz & SelBot AR
- **Status:** `VERIFIED`
- **Keterukan:** **Low**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 2870–3550, 3950–4300)
- **Langkah Pembiakan (Reproduction Steps):**
  1. Laksanakan audit skrip ke atas `kotak-arselnel.js`.
  2. Cari elemen-elemen seperti `kuiz-cards-scroll`, `active-kuiz-view`, `selbot-ar-chat-feed`, `pov-panel-selbot`.
- **Punca Masalah (Root Cause):**
  Pada fasa terdahulu (Fasa 4C & 4F), fungsi Kuiz dan SelBot AR dibina terus di dalam Kotak ARSELNEL. Dalam fasa pembersihan dan pemulihan kecemasan 1.3, elemen-elemen HTML ini telah dikeluarkan daripada `code.html` bagi meringankan beban antara muka dan mengelakkan pertindihan panel. Namun, logik skrip yang menguruskan puluhan acara, fungsi render, dan pertanyaan DOM masih kekal di dalam fail `kotak-arselnel.js` (~2,500 baris kod terbiar).
- **Bukti (Evidence):**
  Ujian audit DOM menemui **209 ID** yang dirujuk dalam skrip JavaScript tetapi tidak wujud dalam HTML `code.html`. Mujurlah, kebanyakan capaian dilindungi dengan `if (DOM.elemen)`, mengelakkan berlakunya *uncaught TypeError*.
- **Cadangan Pembaikan Minimal:**
  Asingkan atau bersihkan kod mati ini ke fail arkib khusus, atau nyahaktifkan sepenuhnya pendaftaran pendengar acara bagi komponen yang telah dipindahkan ke hab permainan luaran.
- **Risiko Regresi:** Rendah jika dilaksanakan dengan teliti.

---

### BUG-08: Risiko Sekatan Keizinan `DeviceOrientationEvent` pada iOS Safari Jika Tidak Segerak
- **Status:** `NEEDS DEVICE TESTING`
- **Keterukan:** **High**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 7033, 12335, `ensureSensorPermission`)
- **Penerangan & Bukti Kod:**
  Pada iOS 13+, Apple mewajibkan `DeviceOrientationEvent.requestPermission()` dipanggil secara **segerak (synchronous)** dalam tindak balas langsung kepada interaksi sentuhan pengguna (*user gesture event*).
  Pada baris 12330:
  ```javascript
  DOM.cqBtnPOV.addEventListener('click', (e) => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then((state) => { ... });
    }
    CellQuestARController.togglePOVMode();
  });
  ```
  Kod ini memanggil keizinan dengan betul pada klik pertama. Walau bagaimanapun, di dalam `startPOVSetup()` (baris 7033), terdapat panggilan kedua:
  ```javascript
  await this.ensureSensorPermission();
  ```
  yang berlaku selepas beberapa operasi tak segerak (asynchronous). Jika panggilan pertama terlepas (contohnya jika dicetuskan oleh skrip panduan terarah / Guided Tour atau peralihan mod berantai), panggilan kedua akan ditolak serta-merta oleh iOS Safari tanpa memaparkan dialog keizinan kepada murid.
- **Ujian Diperlukan:** Ujian fizikal pada peranti iPhone sebenar (iOS 17/18 Safari) untuk memastikan dialog *"Allow access to motion and orientation sensors"* muncul dengan lancar.

---

### BUG-09: Sekatan Skrol Sentuhan Safari Berpotensi Terjejas oleh `pointermove` Global
- **Status:** `NEEDS DEVICE TESTING`
- **Keterukan:** **Medium**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 6634, `pointermove`)
- **Penerangan & Bukti Kod:**
  Di dalam `initPointerInteractions()`:
  ```javascript
  window.addEventListener('pointermove', (e) => {
    ...
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  ```
  Walaupun terdapat pemeriksaan `isHUDElement(e.target)` pada `pointerdown`, sekiranya murid meleret jari bermula dari kawasan kanvas 3D dan melepasi sempadan panel nota yang sedang terapung, panggilan `e.preventDefault()` global boleh menyekat keupayaan murid untuk menatal (scroll) kandungan nota yang panjang pada iPadOS Safari.
- **Ujian Diperlukan:** Ujian tatalan jari fizikal pada pembaca slaid nota semasa mod dwi-panel aktif pada iPad Safari.

---

### BUG-10: Pertindihan Pemasa Hysteresis 2200ms Semasa Pertukaran Marker Berkelajuan Tinggi
- **Status:** `SUSPECTED`
- **Keterukan:** **Low**
- **Fail Terlibat:**
  - `kotak_arselnel/kotak-arselnel.js` (Baris 4945–4965, 9005–9030)
- **Penerangan:**
  Pemalar `HYSTERESIS_DELAY = 2200` ms digunakan untuk mengelakkan panel daripada terpadam secara mengejut jika kamera telefon bergoyang seketika. Namun, jika murid mengalihkan kamera dengan sangat pantas dari Marker 0 ke Marker 1, dan kemudian segera kembali ke Marker 0 dalam tempoh kurang dari 2.2 saat, pemasa `lostTimeout` lama mungkin bertembung dengan status pengesanan baharu, menyebabkan kelipan amaran *"Kad AR tidak dikesan"* muncul seketika walaupun kad baharu telah dikesan.
- **Cadangan Pembaikan Minimal:**
  Pastikan `clearTimeout(ARState.lostTimeout)` dilaksanakan untuk setiap jenis modul secara bebas (`lostTimeout[module]`), bukan pemasa tunggal global.

---

## D. Ujian Automasi yang Dilaksanakan & Keputusan Sebenar

Audit ini telah menjalankan suite ujian regresi penuh `tests/verify_arselnel_emergency_recovery_1_3.js` menggunakan pelayan HTTP natif dan Chrome DevTools Protocol (CDP) tanpa mengubah kod aplikasi:

| No. Ujian | Skop Ujian | Status | Hasil Sebenar |
| :---: | :--- | :---: | :--- |
| **U1** | Pengesanan Marker Video (Target 0) | ✅ LULUS | Mod `video` aktif, tajuk disahkan |
| **U2** | Pengesanan Marker Nota (Target 1) | ✅ LULUS | Mod `nota` aktif, panel nota dipaparkan |
| **U3** | Pengasingan Panel: Kad Nota TIDAK membuka panel Video | ✅ LULUS | `povVidHidden: true`, `povNotaVisible: true` |
| **U4** | Pengasingan Panel: Kad Video TIDAK membuka panel Nota | ✅ LULUS | Tiada pertindihan panel video & nota |
| **U5** | Pertukaran Pantas Marker (0→1→0→3→1→0→1) | ✅ LULUS | State mesin stabil, mod akhir tepat |
| **U6** | Ketiadaan Pil atau Panel Pendua Semasa Imbasan Berulang | ✅ LULUS | Tiada elemen pendua tercipta |
| **U7** | Kebolehcapaian Modul pada Bar Multi-Panel Aktif | ✅ LULUS | Pil video, nota, cellquest berfungsi |
| **U8** | Had Satu Panel Berkembang Serentak pada Mudah Alih | ✅ LULUS | Mengelakkan kekacauan skrin kecil |
| **U9** | Pengekalan Kandungan Semasa Pertukaran Pil Modul | ✅ LULUS | Video dan nota mengekalkan keadaan bacaan |
| **U10** | Penutupan Modul & Peralihan ke Modul Aktif Seterusnya | ✅ LULUS | Kitaran hidup penutupan bersih |
| **U11** | Butang "Kunci Pandangan" Tunggal (Tiada Butang Pendua) | ✅ LULUS | Antara muka kemas tanpa butang bertindih |
| **U12** | Keterlihatan Butang "Letak di Arah Ini" Hanya dalam `POV_SETUP` | ✅ LULUS | Kawalan muncul tepat mengikut fasa |
| **U13** | Butang "Keluar Pandangan" Muncul Hanya dalam `POV_LOCKED` | ✅ LULUS | Peralihan state 3DoF terkawal |
| **U14** | Ketiadaan Elemen UI Usang "Semat Skrin" | ✅ LULUS | Elemen usang telah disingkirkan |
| **U15** | Ketiadaan Bar Bawah CellQuest (#cq-bottom-controls) | ✅ LULUS | Bar lama tidak mengganggu kanvas |
| **U16** | Pengaktifan Model 3D Berasaskan Marker (Haiwan/Tumbuhan/Dwi-Sel) | ✅ LULUS | Model dimuatkan mengikut sasaran |
| **U17** | Kontras Teks Mematuhi Piawaian WCAG AA (>= 4.5:1) | ✅ LULUS | Nisbah minimum 6.47:1 pada butang tutup |
| **U18** | Tiada Pertindihan Kawalan Merentasi 8 Saiz Viewport | ✅ LULUS | Ujian dari 360px hingga 1920px bersih |
| **U19** | Sifar Limpahan Mendatar (Zero Horizontal Overflow) | ✅ LULUS | Tiada *horizontal scrollbar* dikesan |
| **U20** | Integriti `MARKER_REGISTRY` & Modul Teras | ✅ LULUS | Registry memetakan indeks 0..6 dengan tepat |

---

## E. 5 Isu Paling Penting & Keutamaan Pembaikan

Berdasarkan impak langsung terhadap pengalaman murid dan guru semasa menggunakan Kotak ARSELNEL di dalam bilik darjah:

### 1. [KEUTAMAAN 1 — KRITIKAL]: Pemulihan Kawalan Pilihan Model & Modal Sains CellQuest 3D (BUG-01)
- **Mengapa Mesti Dibaiki Terlebih Dahulu:**  
  Murid yang mengimbas kad 3D tidak mempunyai sebarang cara pada UI skrin untuk bertukar antara Sel Haiwan dan Sel Tumbuhan tanpa mencari kad fizikal yang satu lagi. Paling merugikan, modal interaktif perbandingan sains KSSM Bab 2 (`#cq-compare-modal`) yang mengandungi jadual saintifik perbezaan organel tidak boleh dibuka langsung oleh murid kerana tiada butang pemicu dalam HTML.
- **Tindakan:** Tambah bar kawalan ringkas yang mesra murid di dalam `#cellquest-ar-hud` untuk pemilihan sel, perbandingan, dan pemicu modal perbandingan sains.

### 2. [KEUTAMAAN 2 — TINGGI]: Panduan Ralat Mesra Sambungan Selamat (HTTPS) / Wi-Fi Sekolah (BUG-06)
- **Mengapa Penting:**  
  Di sekolah, guru dan murid sering membuka alamat IP pelayan tempatan (contoh: `http://192.168.x.x:3000`). WebRTC menyekat kamera secara automatik pada sambungan HTTP bukan localhost. Tanpa modal penjelasan, pengguna menyangka aplikasi rosak.
- **Tindakan:** Tambah pengesanan `isSecureContext` untuk memberi notifikasi mesra tentang keperluan HTTPS pada peranti mudah alih.

### 3. [KEUTAMAAN 3 — SEDERHANA]: Pembetulan Paparan Awal Halaman Cetakan `marker-print.html` (BUG-02)
- **Mengapa Penting:**  
  Guru yang ingin mencetak marker fizikal untuk aktiviti kelas melihat paparan marker yang bertindih dan tidak lengkap (hanya 3 daripada 6 marker kelihatan pada pemuatan awal).
- **Tindakan:** Pastikan `showMarker('video')` dipanggil semasa pemuatan awal atau sediakan butang paparan cetakan penuh A4 yang teratur.

### 4. [KEUTAMAAN 4 — SEDERHANA]: Pengendalian Pelupusan Memori WebGL Model 3D (BUG-03)
- **Mengapa Penting:**  
  Mengelakkan isu *reload* mengejut atau kegagalan konteks WebGL pada peranti iPhone dan iPad apabila murid bertukar-tukar model sel berkali-kali semasa sesi penerokaan 3D.
- **Tindakan:** Laksanakan rutin `disposeHierarchy()` sebelum membersihkan anak-anak objek daripada `targetHolder`.

### 5. [KEUTAMAAN 5 — SEDERHANA]: Intuisi Sentuhan Semasa Mod Dwi-Sel (Compare Mode) (BUG-05)
- **Mengapa Penting:**  
  Apabila kedua-dua sel dipaparkan serentak, murid secara semula jadi menjangkakan model di sebelah kanan (Sel Tumbuhan) akan berputar apabila disentuh.
- **Tindakan:** Selaraskan `this.selectedCell` secara automatik berdasarkan kedudukan koordinat `X` sentuhan murid pada skrin.

---

## F. Pelan Pembaikan Bertahap (Prioritized Repair Plan)

```
+---------------------------------------------------------------------------------+
| FASA A: Pemulihan UI & Pedagogi Sains CellQuest (BUG-01, BUG-05)                |
| - Tambah bar pemicu kompak dalam .cellquest-ar-hud (Tukar Sel, Banding, Nota)  |
| - Sambungkan butang pemicu ke #cq-compare-modal (Jadual KSSM)                  |
| - Selaraskan sasaran putaran sentuhan mengikut zon skrin kiri/kanan            |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| FASA B: Kualiti & Kebolehpercayaan Cetakan Marker (BUG-02)                     |
| - Selaraskan tab dan keterlihatan kad dalam marker-print.html                  |
| - Pastikan mod cetakan 'Papar Semua' mencetak kesemua 6 kad secara kemas       |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| FASA C: Pengoptimuman Enjin Tiga Dimensi & Memori (BUG-03, BUG-04)             |
| - Laksanakan disposeHierarchy() untuk mengelakkan kebocoran memori WebGL       |
| - Gunakan resolusi URL dinamik untuk fail GLB                                   |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| FASA D: Kebolehgunaan Rangkaian & Ujian Peranti Fizikal (BUG-06, BUG-08, BUG-09)|
| - Tambah notifikasi pengesanan sambungan selamat (HTTPS)                       |
| - Uji keizinan sensor giroskop pada iPhone Safari fizikal                      |
+---------------------------------------------------------------------------------+
```
