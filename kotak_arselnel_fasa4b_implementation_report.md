# LAPORAN PELAKSANAAN KOTAK ARSELNEL FASA 4B: MARKER NOTA INTERAKTIF + POV LOCK

**Projek:** ARSELNEL (Sains Tingkatan 1 KSSM — Bab 2: Sel Sebagai Unit Asas Hidupan)  
**Modul:** Kotak ARSELNEL (`kotak_arselnel/`)  
**Status Fasa:** FASA 4B — SELESAI & DISAHKAN (110 / 110 UJIAN LULUS)  
**Tarikh Pengesahan:** 8 November 2026  
**Peranti Ujian Utama:** iPad Safari (iPadOS), Google Chrome Desktop / Mobile Simulator  

---

## 1. RINGKASAN PENCAPAIAN FASA 4B

Fasa 4B telah berjaya dilaksanakan dengan mengembangkan Kotak ARSELNEL daripada penjejakan satu sasaran kepada **Sistem Dwi-Sasaran (Multi-Target AR)** yang menyokong **Video Pembelajaran** dan **Nota Interaktif**:

1. **Reka Bentuk Marker Nota Baharu (Target 1):**
   - Dihasilkan dalam format vektor SVG berkontras tinggi ([`marker-nota.svg`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/marker-nota.svg)) dan imej berketumpatan tinggi 1000×1000 px ([`marker-nota.png`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/marker-nota.png)).
   - Mempunyai corak asimetri 4-penjuru (*Crosshair Diamond*, *Stepped Matrix Bar*, *Dual-Target Quadrant*, dan *Square Labyrinth*) yang dioptimumkan untuk pengesanan pantas pada kamera iPad dan telefon pintar.
   - Tema visual: Teal / Hijau Kebiruan (`#0d9488`, `#2dd4bf`) dengan lambang buku terbuka sains dan struktur sel tumbuhan.
   - Marker asal Video Pembelajaran ([`marker-video.png`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/marker-video.png)) **dikekalkan 100% tanpa sebarang pengubahsuaian**.

2. **Kompilasi MindAR Multi-Target (`kotak_arselnel.mind`):**
   - Fail binari MindAR telah dikompilasi semula melalui *Headless Chrome CDP Compiler* yang memuatkan kedua-dua sasaran sekaligus:
     - **Index 0:** Marker Video Pembelajaran (`marker-video.png`)
     - **Index 1:** Marker Nota Interaktif (`marker-nota.png`)
   - Saiz fail: **1,214,453 bytes (1.2 MB)**.
   - Enjin MindAR Three.js mendaftar sauh secara serentak (`addAnchor(0)` dan `addAnchor(1)`).

3. **Penyepaduan Nota Sebenar daripada CMSAdapter:**
   - Memuatkan rekod nota sains daripada `CMSAdapter.getNotes({ status: 'published' })` dengan perlindungan sandaran dwi-lapisan (*localStorage* dan *bundled seeds* Sains KSSM Tingkatan 1).
   - Menyokong pemaparan tajuk, lencana bab, anggaran masa pembacaan, dan kandungan teks terformat Markdown (tajuk, senarai bertitik, kutipan *blockquote*, formula sains).

4. **Pembaca Nota Terapung (Floating Note Reader):**
   - **Kawalan Zoom:** Butang Zoom In (`+`), Zoom Out (`-`), dan Reset (`100%`) membolehkan murid mengubah saiz fon daripada 75% hingga 200%.
   - **Navigasi Halaman:** Menyokong pemecahan slaid/halaman (`Sebelum`, `Seterusnya`, lencana `Halaman X / Y`).
   - **Tukar Nota:** Butang interaktif untuk kembali ke senarai pemilihan nota CMS.
   - **Screen-Pinned Mode:** Membolehkan panel nota disematkan pada skrin, diseret ke kedudukan selesa, diubah saiz (S/M/L), dan dikunci.

5. **Gyroscope 3DoF POV Lock Universal (Yaw + Pitch):**
   - Menggunakan semula enjin matriks orientasi W3C `$R = R_z(\alpha) R_x(\beta) R_y(\gamma) R_z(-\theta)$` yang telah diuji stabil pada Fasa 3C tanpa menulis semula formula matematik.
   - Pusing peranti ke kanan: Nota beralih ke kiri.
   - Pusing peranti ke kiri: Nota beralih ke kanan.
   - Tundukkan peranti ke bawah: Nota beralih ke atas.
   - Dongakkan peranti ke atas: Nota beralih ke bawah.
   - Tahap zoom dan halaman aktif kekal terpelihara semasa bertukar ke mod POV.

6. **Penyelaras Pertukaran Modul Lancar (Video ↔ Nota):**
   - Apabila kamera mengesan Marker Nota, pemain video dimatikan secara serta-merta (`DOM.playerFrame.innerHTML = ''`) bagi mengelakkan audio bersuara di belakang tab.
   - Apabila kamera kembali ke Marker Video, tema dan pemain video kembali berfungsi secara normal tanpa pertindihan panel atau gangguan skrin hitam.
   - Menutup kamera (*Mod Jimat Bateri*) mengekalkan pembacaan nota dan orientasi sensor 3DoF.

---

## 2. SENARAI FAIL YANG DIBINA & DIUBAH

| Fail | Status | Keterangan |
| :--- | :--- | :--- |
| [`kotak_arselnel/assets/markers/marker-nota.svg`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/marker-nota.svg) | **Baharu** | Vektor resolusi tinggi marker Nota Interaktif (Teal, corak asimetrik optik, 1000×1000). |
| [`kotak_arselnel/assets/markers/marker-nota.png`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/marker-nota.png) | **Baharu** | Imej raster 1000×1000 px untuk pengimbasan kamera dan kompilasi MindAR (208 KB). |
| [`kotak_arselnel/assets/markers/kotak_arselnel.mind`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/assets/markers/kotak_arselnel.mind) | **Dikemas Kini** | Fail binari MindAR multi-target (mengandungi Index 0: Video dan Index 1: Nota). |
| [`kotak_arselnel/marker-print.html`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/marker-print.html) | **Dikemas Kini** | Halaman cetakan diperbaharui dengan tab penukar Marker Video, Marker Nota, panduan imbasan, dan susun atur mesra A4. |
| [`kotak_arselnel/code.html`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/code.html) | **Dikemas Kini** | Menambah struktur DOM untuk `nota-selection-view`, `active-nota-view`, kawalan zoom, navigasi halaman, dan paparan POV Nota. |
| [`kotak_arselnel/kotak-arselnel.css`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/kotak-arselnel.css) | **Dikemas Kini** | Menambah gaya CSS tema Teal (`.module-nota`, `.tag-nota`), kad nota CMS, toolbar zoom/halaman, dan tipografi Markdown. |
| [`kotak_arselnel/kotak-arselnel.js`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/kotak-arselnel.js) | **Dikemas Kini** | Pendaftaran sauh multi-marker (0 & 1), `switchActiveModule`, pemunggah `loadNotesFromCMS`, parser markdown, zoom engine, dan sokongan POV Nota. |
| [`scripts/compile_marker_mind.js`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/scripts/compile_marker_mind.js) | **Dikemas Kini** | Skrip kompilasi diperluaskan untuk memuatkan kedua-dua imej target `[img0, img1]` secara automatik. |
| [`tests/test_fasa4b_nota_interaktif.js`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/tests/test_fasa4b_nota_interaktif.js) | **Baharu** | Suite ujian automatik 20 ujian khusus untuk Fasa 4B (Multi-target, pertukaran modul, zoom, POV lock, iPad Safari). |
| [`kotak_arselnel/kotak-arselnel.fasa3c.bak.js`](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/kotak-arselnel.fasa3c.bak.js) | **Sandaran** | Titik pemulihan (*rollback point*) lengkap Fasa 3C sebelum sebarang perubahan kod dibuat. |

---

## 3. KEPUTUSAN UJIAN REGRESI & PENGESAHAN KOD

### 3.1 Ujian Regresi Sedia Ada (Fasa 1, 2, 3 & 3C)
| Suite Ujian | Fail Ujian | Keputusan | Status |
| :--- | :--- | :---: | :---: |
| **Pitch Lock & Integrasi Video Sebenar (Fasa C)** | `tests/test_pitch_and_video_fasa_c.js` | **16 / 16** | ✅ 100% Lulus |
| **Penstabilan 3DoF Gyroscope POV Lock (Fasa E)** | `tests/test_3dof_pov_stabilization.js` | **17 / 17** | ✅ 100% Lulus |
| **Responsif Panel Saiz L & Sticky Footer** | `tests/test_size_l_responsive.js` | **28 / 28** | ✅ 100% Lulus |
| **Mod Semat Skrin & Seretan (Fasa 3)** | `tests/test_kotak_arselnel_phase3.js` | **29 / 29** | ✅ 100% Lulus |
| **JUMLAH UJIAN REGRESI** | | **90 / 90** | ✅ **100% LULUS** |

### 3.2 Ujian Baharu Fasa 4B (`tests/test_fasa4b_nota_interaktif.js`)
| Bahagian Ujian | Skop Ujian | Keputusan |
| :--- | :--- | :---: |
| **Bahagian 1** | Pendaftaran serentak Anchor 0 (Video) & Anchor 1 (Nota) dalam MindAR | ✅ Lulus |
| **Bahagian 1** | Pemuatan data CMS (2 video, 4 nota KSSM Bab 2) | ✅ Lulus |
| **Bahagian 1** | Modul lalai dimulakan sebagai Video tanpa ralat | ✅ Lulus |
| **Bahagian 2** | Pengesanan pertukaran modul aktif daripada Video ke Nota | ✅ Lulus |
| **Bahagian 2** | Iframe video dikosongkan secara automatik (pelepasan sumber audio) | ✅ Lulus |
| **Bahagian 2** | Penukaran tema visual kepada Teal (`tag-nota`, `module-nota`) | ✅ Lulus |
| **Bahagian 2** | Pembaca nota memaparkan tajuk dan kandungan yang tepat daripada CMS | ✅ Lulus |
| **Bahagian 3** | Butang Zoom In (`+`) membesarkan saiz teks kepada 115% | ✅ Lulus |
| **Bahagian 3** | Butang Zoom Reset mengembalikan saiz teks kepada 100% | ✅ Lulus |
| **Bahagian 4** | Halaman nota bermula pada Halaman 1 dengan butang Sebelum dilumpuhkan | ✅ Lulus |
| **Bahagian 4** | Butang Seterusnya beralih ke Halaman 2 dengan kemas | ✅ Lulus |
| **Bahagian 5** | Panel Nota disematkan pada skrin (*Screen-Pinned Mode*) | ✅ Lulus |
| **Bahagian 5** | Toolbar saiz S/M/L dan butang kamera aktif semasa disemat | ✅ Lulus |
| **Bahagian 6** | Peralihan ke mod `POV_LOCKED` untuk Nota | ✅ Lulus |
| **Bahagian 6** | Panel POV memaparkan pembaca Nota dan menyembunyikan pemain video | ✅ Lulus |
| **Bahagian 6** | Ujian Pitch: Tunduk (-25°) menggerakkan panel Nota ke ATAS (Top: -246px) | ✅ Lulus |
| **Bahagian 6** | Ujian Yaw: Pusing kanan (+35°) menggerakkan panel Nota ke KIRI (Left: -291px) | ✅ Lulus |
| **Bahagian 7** | Kamera ditutup untuk menjimatkan bateri iPad | ✅ Lulus |
| **Bahagian 7** | Nota dan orientasi sensor POV kekal aktif walaupun kamera ditutup | ✅ Lulus |
| **JUMLAH UJIAN FASA 4B** | | **20 / 20 (100% LULUS)** |

**KUMULATIF KESELURUHAN: 110 / 110 UJIAN LULUS (0 GAGAL).**

---

## 4. TANGKAPAN SKRIN PEMBUKTIAN IPAD SAFARI

Tangkapan skrin ujian automatik pada resolusi iPad Safari Landscape (1024×768) menunjukkan pembaca Nota Interaktif aktif dalam mod POV Lock dengan sensor giroskop, telemetri spatial, kawalan zoom 100%, navigasi halaman 1/2, dan butang pemulihan:

![Tangkapan Skrin iPad Safari Fasa 4B](/C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/kotak_arselnel_fasa4b_nota_ipad.png)

---

## 5. PANDUAN MENGUJI MENGGUNAKAN IPAD SAFARI SEBENAR

Untuk menguji menggunakan iPad fizikal anda melalui rangkaian Wi-Fi yang sama:

1. **Buka Halaman Marker pada Laptop / Komputer Riba:**
   - Buka: `http://localhost:3000/kotak_arselnel/marker-print.html`
   - Klik tab **"2. Nota Interaktif"** (atau "Papar Kedua-duanya").
2. **Buka Pengimbas WebAR pada iPad Safari:**
   - Buka pautan HTTPS selamat: `https://192.168.0.112:3443/kotak_arselnel/`
   - Tekan **"Allow / Benarkan"** apabila Safari meminta kebenaran kamera.
3. **Uji Pengesanan Marker Nota:**
   - Halakan kamera iPad ke arah gambar **Marker 2 (Nota Interaktif - Hijau Teal)**.
   - Panel terapung bertema Teal akan muncul memaparkan senarai nota atau nota terpilih daripada CMS (*Sel Tumbuhan Vs Sel Haiwan*).
4. **Uji Ciri Pembaca Nota:**
   - Tekan butang **`+`** atau **`-`** pada bar pembaca untuk menguji zum saiz fon.
   - Tekan butang **"Seterusnya"** untuk menyelak ke bahagian/halaman seterusnya.
   - Tekan **"Tukar Nota"** untuk memilih topik sel yang lain daripada senarai.
5. **Uji 3DoF POV Lock:**
   - Tekan butang **"Kunci POV"**.
   - Halakan iPad ke arah pilihan anda (cth. dinding sebelah kiri) dan tekan **"Letak di Arah Ini"**.
   - Pusingkan iPad ke kanan: Panel nota akan bergerak keluar ke sebelah kiri skrin.
   - Pusingkan iPad kembali ke kiri: Panel nota muncul semula pada arah yang sama.
   - Tundukkan iPad ke bawah: Panel nota bergerak ke atas.
6. **Uji Mod Jimat Bateri:**
   - Tekan **"Tutup Kamera"** pada bar kawalan atas atau dalam panel.
   - Kamera ditutup, latar belakang menjadi bersih dan gelap bagi menjimatkan bateri, tetapi nota dan kedudukan POV tetap terkunci serta interaktif.
7. **Uji Pertukaran ke Marker Video:**
   - Halakan semula kamera ke arah **Marker 1 (Video - Jingga)**.
   - Sistem bertukar secara automatik ke Modul Video tanpa gangguan atau pertindihan panel.

---

## 6. STATUS ISU & KESELAMATAN SISTEM

- **Isu Belum Selesai:** Tiada isu terbuka atau regresi dikesan.
- **Integriti Supabase & CMS:** Tiada sebarang data atau jadual pangkalan data Supabase yang dipadam, dimigrasikan, atau diubah suai. Semua capaian CMS kekal *read-only*.
- **Sandaran Rollback:** Fail `kotak-arselnel.fasa3c.bak.js` sedia ada untuk pemulihan segera jika diperlukan.

---

> [!IMPORTANT]
> **STATUS:** FASA 4B TELAH SIAP SEPENUHNYA.  
> Sesuai dengan arahan wajib anda: **SAYA BERHENTI DI SINI** dan menantikan semakan serta pengujian anda pada iPad Safari sebenar sebelum melangkah ke modul Kuiz atau CellQuest.

