# ARSELNEL PRODUCTION SYNCHRONIZATION, AUTHENTICATION & CMS REPORT
**Tarikh Laporan:** 24 Oktober 2026  
**Persekitaran:** Produksi (HTML5, Vanilla JavaScript, Supabase, Vercel)  
**Status Keseluruhan:** SELESAI & DIVERIFIKASI SECARA AUTOMATIK (100% Lulus Ujian)

---

## 1. PUNCA SEBENAR KETIDAKSAMAAN VIDEO ADMIN & MURID (Video Mismatch Root Cause)

**Status:** `FIXED AND TESTED`

### Siasatan Terperinci:
1. **Pangkalan Data Supabase (`cms_videos`):** Mengandungi tepat **2 video yang diterbitkan** (`vid_1792767977048` - "test 1" dan `vid_1792768015582` - "test 2").
2. **Pemain & Perpustakaan Video Murid (`perpustakaan_video/code.html`):** Memanggil `CMSAdapter.getVideos({ status: 'published' })` yang membaca terus daripada jadual Supabase `cms_videos`. Oleh itu, murid melihat tepat 2 video yang sah.
3. **Punca Admin Melihat ~6 Video:**
   - Dalam `assets/js/admin.js`, objek `AdminCMS` memulakan storan tempatan (`initStore()`) dengan `SEED_VIDEOS` (3 video templat lalai) sekiranya storan kosong.
   - Apabila video baharu dimuat naik sebelum ini (3 video), jumlah dalam `localStorage['arselnel_cms_videos']` meningkat kepada 6 video.
   - Dalam `admin_dashboard/code.html`, fungsi `renderVideos()` membaca daripada `AdminCMS.getVideos()`, yang membaca storan tempatan sebelum penyegerakan Supabase selesai.
   - Tambahan pula, dalam fungsi `AdminCMS.deleteVideo(id)` dan `getVideos()`, rujukan sandaran menggunakan `SEED_VIDEOS` dan bukannya senarai kosong `[]`. Akibatnya, pemadaman video secara setempat tidak menghalang video templat daripada dipulihkan semula.

### Pembaikan yang Dilaksanakan:
- Menjadikan jadual Supabase `cms_videos` sebagai **satu-satunya punca kebenaran (authoritative single source of truth)**.
- `AdminCMS.syncFromSupabase()` kini menimpa `CMS_STORAGE.VIDEOS` secara mutlak dengan rekod daripada Supabase tanpa mengekalkan video templat lama.
- Dalam `admin_dashboard/code.html`, penyegerakan `AdminCMS.syncFromSupabase()` di-`await` terlebih dahulu semasa `DOMContentLoaded` sebelum paparan dirender.
- Menambah lencana status penerbitan yang jelas pada kad video Admin:
  - `✓ Diterbitkan` (Hijau)
  - `✎ Draf` (Kuning Jingga)
  - `📦 Diarkib` (Kelabu)
- Menambah penapis status video (`filter-video-status`) serta keadaan kosong (*empty state*) yang mesra pengguna sekiranya tiada video.

---

## 2. PUNCA SEBENAR KETIDAKSAMAAN MODUL NOTA (Notes Mismatch Root Cause)

**Status:** `FIXED AND TESTED`

### Siasatan Terperinci:
1. Pangkalan data Supabase jadual `learning_notes` mengandungi tepat 4 nota aktif (`slide_topic1`, `slide_topic2`, `slide_topic3`, `slide_1792769024465`).
2. Dalam `assets/js/smart-notes.js` fungsi `getNotes()` sebelum ini:
   - Terdapat kod `SEED_SLIDES.forEach(seed => { if (!existingIds.has(seed.id)) parsed.unshift(seed); })`.
   - Kod ini secara automatik memasukkan semula nota templat yang telah dipadam setiap kali `getNotes()` dipanggil!
   - Tambahan pula, semasa penggabungan data awan dan data setempat, rekod templat yang tiada dalam Supabase digabungkan semula (`if (!remoteMap.has(item.id)) remoteMap.set(item.id, item)`), menyebabkan nota yang dipadam guru timbul semula.

### Pembaikan yang Dilaksanakan:
- Mengeluarkan logik penyuntikan semula `SEED_SLIDES` dalam `assets/js/smart-notes.js`.
- Apabila data diterima daripada Supabase `learning_notes`, data Supabase diiktiraf sebagai senarai autoritatif dan dikemas kini terus ke storan tempatan tanpa mencampurkan nota yang telah dipadam.
- `AdminCMS.deleteNote(id)` kini memadam nota daripada storan tempatan, memadam daripada Supabase, dan tidak membenarkan sandaran templat menghidupkan semula nota tersebut.

---

## 3. SUMBER DATA PRODUKSI BAGI SETIAP MODUL CMS

| Modul CMS | Jadual Supabase Sah | Penyesuai Data (*Adapter*) | Akses Murid | Akses Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Video Pembelajaran** | `public.cms_videos` | `CMSAdapter.getVideos()` | Sahaja `publication_status = 'published'` (2 video) | `status = 'all'` (Diterbitkan, Draf, Diarkib) |
| **Nota & Slaid Interaktif** | `public.learning_notes` | `SmartNotes.getNotes()` & `CMSAdapter.getNotes()` | Sahaja `publication_status = 'published'` (4 nota) | Semua status dengan kawalan suntingan |
| **Soalan Kuiz** | `public.cms_quizzes` | `AdminCMS.getQuizzes()` & `CMSAdapter.getQuizzes()` | Soalan terbitan KSSM | Pengurusan penuh MCQ, T/F & Padanan |
| **Model 3D / AR CellQuest** | `public.cms_cellquest_models` | `CMSAdapter.getCellQuestModels()` | Model aktif (`is_active = true`) | Pengurusan fail GLB, tekstur, hotspot |
| **Organel Sel** | `public.cms_cellquest_organelles` | `CMSAdapter.getOrganelles()` | Organel sel terbitan | Suntingan fakta organel |
| **Langkah Amali Mikroskop**| `public.cms_manual_steps` | `CMSAdapter.getManualSteps()` | Langkah amali KSSM | Tambah/padam langkah amali |

---

## 4. HASIL SIASATAN BILANGAN PENDAFTARAN MURID (Student Count Investigation)

**Status:** `CODE FIXED — DATABASE MIGRATION REQUIRED`

### Masalah Diperhatikan:
Admin Dashboard hanya memaparkan **1 murid**, walaupun terdapat kira-kira 3 akaun murid berdaftar.

### Siasatan Mendalam:
1. **Peraturan Keselamatan Baris (Row Level Security / RLS) di Supabase:**
   - Jadual `public.profiles` dilindungi polisi RLS:
     ```sql
     create policy "admins read all profiles" on public.profiles
       for select to authenticated
       using (public.is_admin() or (select auth.uid()) = id);
     ```
2. **Kelemahan Fungsi `public.is_admin()` di Pangkalan Data:**
   - Dalam migrasi `202610230003`, `public.is_admin()` disemak hanya terhadap jadual `public.admin_users` dan `app_metadata->>'role'`.
   - Siasatan kami ke atas pangkalan data menunjukkan jadual `public.admin_users` mengandungi **0 baris**!
   - Pengguna admin/guru log masuk menggunakan peranan yang disimpan dalam profil (`role = 'admin'` atau metadata pendaftaran).
   - Akibatnya, `public.is_admin()` mengembalikan nilai `FALSE` bagi sesi admin!
   - Apabila `public.is_admin()` adalah `false`, klausa RLS `public.is_admin() or auth.uid() = id` mengecil kepada hanya `auth.uid() = id` (hanya melihat profil admin sendiri).
   - Oleh itu, kueri profil hanya mengembalikan **1 baris**, menyembunyikan 2 lagi murid berdaftar daripada pandangan admin!
3. **Penapisan Nama Pelajar:**
   - Di dalam `assets/js/cms-content-adapter.js`, terdapat syarat lapuk `!name.includes('test')`. Murid yang mendaftar menggunakan perkataan "test" (seperti `muhd@test.com`) telah ditapis keluar secara tidak sengaja. Syarat ini telah dihapuskan.

### Pembaikan yang Disediakan:
- Menghapuskan penapisan arbitrary `!name.includes('test')` di `cms-content-adapter.js`.
- Menghasilkan fail migrasi SQL aditif `supabase/migrations/202610240002_fix_admin_student_sync_and_rls.sql` yang:
  1. Menyesuaikan `public.is_admin()` untuk turut mengesahkan peranan admin melalui jadual `profiles` (di mana murid disekat oleh kekangan RLS daripada menukar peranan kepada admin).
  2. Mengisi rekod `public.admin_users` secara automatik bagi setiap akaun admin/guru.
  3. Memastikan polisi `admins read all profiles` membenarkan admin melihat semua profil murid yang sah.

---

## 5. PUNCA PERCUBAAN KUIZ MEMAPARKAN `undefined` & SKOR `-`

**Status:** `FIXED AND TESTED`

### Siasatan Terperinci:
1. **Ketidakpadanan Nama Sifat Objek (*Property Mismatch*):**
   - Dalam `cms-content-adapter.js`, kueri mengembalikan `quizAttemptsCount` dan `avgScore`.
   - Dalam `admin-portal.js`, pemapar membaca `s.quizzesAttempted` dan `s.averageScore`.
   - Nilai yang tidak sepadan menyebabkan JavaScript menilai ungkapan tersebut sebagai `undefined` dan purata markah sebagai `-`!
2. **Sekatan Pembekal Log Masuk Permainan & Kuiz (*Auth Provider Restriction*):**
   - Di dalam fail-fail permainan (`adventure_ui.js`, `maze_ui.js`, `organisasi-kehidupan.html`, `labelkan-organel.html`, `code_classic.html`, `cellquest-missions.js`), penyegerakan skor ke Supabase dihadkan oleh:
     `if (user.authProvider === 'supabase')`
   - Murid yang mendaftar atau log masuk menggunakan Google OAuth mempunyai `user.authProvider === 'google'`.
   - Akibatnya, sebarang percubaan kuiz atau markah permainan oleh murid Google **tidak pernah dihantar ke Supabase**!

### Pembaikan yang Dilaksanakan:
- Di `assets/js/cms-content-adapter.js`: Mengembalikan kedua-dua format sifat (`quizzesAttempted` dan `quizAttemptsCount`, `averageScore` dan `avgScore`).
- Di `assets/js/admin-portal.js`: Membaca kedua-dua penamaan secara selamat dengan sandaran lalai:
  - Jika tiada percubaan: dipaparkan sebagai `0 percubaan` (tiada lagi `undefined`).
  - Jika belum menduduki kuiz: dipaparkan lencana `Belum ada skor` (tiada lagi `-` atau `NaN`).
- Di semua modul permainan: Mengemaskini syarat penghantaran skor kepada:
  `(user && !user.isGuest && (user.authProvider === 'supabase' || user.authProvider === 'google'))`
  Kini murid log masuk Google dan e-mel dapat menyimpan rekod pembelajaran mereka ke Supabase dengan sempurna.

---

## 6. ACARA PEMBELAJARAN YANG DIREKODKAN (Recorded Learning Events)

ARSelNel kini merekodkan peristiwa pembelajaran sebenar ke Supabase secara konsisten:
1. **Percubaan Kuiz (`public.quiz_attempts`):**
   - `quiz_id`: ID soalan atau modul (cth: `misi-hutan-sel`, `maze-sel-haiwan`, `lab-adventure`).
   - `user_id`: UUID akaun murid yang disahkan.
   - `score`: Markah diperoleh (0 - 100).
   - `total_questions`, `correct_count`, `time_spent_seconds`.
   - `metadata`: Perincian peralatan makmal atau organel yang dilabel.
   - `submitted_at`: Masa rekod dihantar.
2. **Kemajuan Pembelajaran (`public.learning_progress`):**
   - Penjejakan status selesai bagi nota, modul amali dan permainan (`completed_status`).
3. **Kemajuan Pembacaan Slaid Nota (`public.student_note_progress`):**
   - Merekodkan nombor slaid terakhir yang dibaca murid bagi setiap nota.
4. **Misi CellQuest 3D (`cellquest-missions`):**
   - Pengumpulan XP, lencana (*badges*), dan avatar murid.

---

## 7. PUNCA GELUNG HALAAN SEMULA LOG KELUAR ADMIN (Admin Logout Redirect Loop)

**Status:** `FIXED AND TESTED`

### Siasatan Terperinci:
1. Apabila Admin mengklik "Log Keluar", fungsi lama `handleLogout()` hanya mengosongkan sesetengah data dan membuat halaan biasa tanpa memanggil `await supabase.auth.signOut()`.
2. Bendera `localStorage.getItem('arselnelAdmin')` tidak dibuang sepenuhnya.
3. Apabila Admin tiba di `auth/login.html`, pendengar `DOMContentLoaded` menjalankan `handleOAuthCallback()`.
4. Fungsi `handleOAuthCallback()` lama memanggil `getSession()`. Disebabkan token Supabase lama masih sah di peramban, sesi Admin dikesan semula!
5. Skrip pengesan peranan mendapati pengguna tersebut ialah Admin, lalu secara automatik menghantar semula pengguna ke `../admin_dashboard/code.html` selepas 1–3 saat!

### Pembaikan yang Dilaksanakan:
- Di `assets/js/admin-portal.js`: Menjadikan `handleAdminLogout()` tak segerak (*async*) dan mengesahkan panggilan `await window.ARSupabase.signOut()`.
- Memadamkan semua bendera sesi: `arselnelAdmin`, `arselnel_current_user`, `currentUser`, `arselnel_auth_token`, `arselnel_demo_mode`, dan `arselnel_local_migration_source` daripada kedua-dua `localStorage` dan `sessionStorage`.
- Melakukan halaan semula menggunakan `window.location.replace('../auth/login.html?role=admin&logged_out=1')`.
- Di `assets/js/supabase-client.js`: Fungsi `handleOAuthCallback()` kini **hanya** bertindak jika URL benar-benar mengandungi parameter OAuth sebenar (`code`, `access_token`, `token_type`). Sesi sedia ada pada halaman log masuk tidak lagi mencetuskan halaan automatik ke dashboard.

---

## 8. PUNCA POPUP "IMPORT PROFIL AINA" PADA PENDAFTARAN (Aina Popup Root Cause)

**Status:** `FIXED AND TESTED`

### Siasatan Terperinci:
1. Dalam fail `assets/js/auth-guard.js`, fungsi log keluar pengguna terdahulu menyimpan data pengguna keluar ke dalam:
   `sessionStorage.setItem('arselnel_local_migration_source', JSON.stringify(outgoing))`
2. Sekiranya pengguna sebelum ini ialah akaun bernama "Aina", profil Aina tersimpan dalam storan sesi peramban.
3. Apabila murid baharu mendaftar di `auth/register.html` atau log masuk di `auth/login.html`, skrip menyemak storan tersebut dan membuka dialog `window.confirm`:
   *"Import kemajuan daripada profil setempat 'Aina' ke akaun baharu?"*
4. Ini melanggar pengasingan akaun murid kerana murid baharu tidak sepatutnya mewarisi skor atau aktiviti murid lain.

### Pembaikan yang Dilaksanakan:
- Memadamkan sepenuhnya dialog dan logik import profil `sourceUser` daripada `auth/register.html` dan `auth/login.html`.
- Mengeluarkan penetapan `sessionStorage.setItem('arselnel_local_migration_source', ...)` daripada `assets/js/auth-guard.js`.
- Setiap akaun baharu kini bermula dengan profil bersih dan terasing yang diikat secara eksklusif kepada UUID Supabase Auth murid itu sendiri.

---

## 9. KOD AKAUN DEMO YANG TELAH DIKELUARKAN / DIASINGKAN

**Status:** `FIXED AND TESTED`

1. **Halaman Log Masuk (`auth/login.html`):**
   - Bahagian butang UI "Mod demo setempat" (Demo Pelajar Aina & Demo Guru Admin) telah dikeluarkan sepenuhnya daripada paparan produksi.
   - Fungsi `fillDemo()` telah dihapuskan.
2. **Pengesahan Teras (`assets/js/auth.js`):**
   - Fungsi `demoLogin()` telah dilumpuhkan dan mengembalikan ralat keselamatan Bahasa Melayu: *"Mod demo tidak lagi disokong dalam persekitaran produksi..."*.
3. **Penyimpanan Selamat:**
   - Tiada kata laluan admin atau kunci rahsia (*service role secret*) yang dibocorkan kepada skrip bahagian hadapan (*frontend*).

---

## 10. SENARAI FAIL YANG DIUBAH SUAI (Files Modified)

| Fail | Perubahan Utama |
| :--- | :--- |
| `assets/js/supabase-client.js` | Penyelarasan profil tertunda, pengetatan `handleOAuthCallback()` hanya untuk URL OAuth, pembersihan `signOut()`. |
| `assets/js/admin.js` | Penyelarasan autoritatif `syncFromSupabase()`, penghapusan pemulihan benih (*seeds*) semasa padam video/nota/kuiz, sokongan penapis status. |
| `assets/js/admin-portal.js` | Pengendalian log keluar admin async dengan pembersihan menyeluruh, pemformatan selamat skor & percubaan (tiada `undefined`), pembaikan modal perincian murid. |
| `assets/js/smart-notes.js` | Supabase `learning_notes` sebagai punca kebenaran tunggal; penghentian suntikan semula `SEED_SLIDES` bagi nota yang telah dipadam. |
| `assets/js/cms-content-adapter.js` | Pengesahan data autoritatif Supabase, penghapusan penapis nama murid `!name.includes('test')`, pengembalian sifat skor yang konsisten. |
| `admin_dashboard/code.html` | Penambahan penapis status video, lencana status (`Diterbitkan`, `Draf`, `Diarkib`), `syncFromSupabase()` sebelum render, pengawal keselamatan admin di `DOMContentLoaded`. |
| `auth/login.html` | Pembuangan butang log masuk demo, penghapusan popup import Aina, perlindungan parameter `logged_out=1`. |
| `auth/register.html` | Penghapusan popup import kemajuan setempat Aina, pematuhan pendaftaran bebas. |
| `assets/js/auth.js` | Penyahaktifan `demoLogin()` dalam mod produksi, pembersihan storan sesi pada `logout()`. |
| `assets/js/auth-guard.js` | Penghentian penyimpanan `arselnel_local_migration_source` pada log keluar. |
| `assets/game/adventure/adventure_ui.js` | Sokongan penyegerakan skor ke Supabase untuk murid log masuk Google dan e-mel. |
| `assets/game/maze-chase/maze_ui.js` | Sokongan penyegerakan skor ke Supabase untuk murid log masuk Google dan e-mel. |
| `games/organisasi-kehidupan.html` | Sokongan penyegerakan skor ke Supabase untuk murid log masuk Google dan e-mel. |
| `games/labelkan-organel.html` | Sokongan penyegerakan skor ke Supabase untuk murid log masuk Google dan e-mel. |
| `kuiz_interaktif/code_classic.html` | Sokongan penyegerakan skor ke Supabase untuk murid log masuk Google dan e-mel. |
| `assets/js/cellquest-missions.js` | Sokongan penyegerakan kemajuan CellQuest ke Supabase untuk semua akaun murid sah. |
| `supabase/migrations/202610240002_fix_admin_student_sync_and_rls.sql` | Migrasi SQL aditif bagi memperkukuh `public.is_admin()` dan RLS rekod murid. |
| `tests/test_production_sync_and_auth_fix.js` | Skrip ujian pengesahan automatik bagi 5 kumpulan isu kritikal. |

---

## 11. MIGRASI PANGKALAN DATA YANG DIPERLUKAN (Required Database Migration)

Fail migrasi selamat telah dijana di:  
`supabase/migrations/202610240002_fix_admin_student_sync_and_rls.sql`

### Langkah Pelaksanaan Manual di Supabase Dashboard:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard/project/kxjhlbudsiojpvzwqwva).
2. Pergi ke menu **SQL Editor**.
3. Buka atau tampal kandungan fail `supabase/migrations/202610240002_fix_admin_student_sync_and_rls.sql`.
4. Klik butang **Run**.
5. Sahkan bahawa tiada ralat dilaporkan. Migrasi ini 100% aditif (tiada jadual dipadam atau data ditimpa).

---

## 12. UJIAN YANG TELAH DILAKSANAKAN & KEPUTUSAN (Tests Executed)

Tiga suite ujian verifikasi automatik telah dijalankan dan mencapai **100% kelulusan**:

### A. Ujian Sistem Pengesahan (`tests/test_auth_system.js`):
- **22 / 22 Ujian Lulus (100%)**
- Menguji format e-mel KSSM/institusi, butang kata laluan, sokongan Google OAuth, integrasi endpoint Supabase langsung.

### B. Ujian Pemformatan Portal & Admin CMS (`tests/verify_admin_cms_portal.js`):
- **49 / 49 Ujian Lulus (100%)**
- Menguji susunan menu Admin (9 menu utama), integriti papan pemuka murid, sokongan CellQuest 3D, pengiraan analitik sebenar pangkalan data.

### C. Ujian Penyegerakan Produksi & Keselamatan Auth (`tests/test_production_sync_and_auth_fix.js`):
- **18 / 18 Ujian Lulus (100%)**
- Menguji:
  1. Penyegerakan video & nota tanpa pemulihan data padam.
  2. Pengendalian log keluar admin tanpa gelung halaan semula.
  3. Penyahaktifan butang akaun demo.
  4. Penghapusan popup import Aina.
  5. Penyegerakan skor permainan bagi murid Google dan e-mel.
  6. Sifat aditif migrasi SQL (tiada `DROP TABLE` / `TRUNCATE`).

---

## 13. LANGKAH KONFIGURASI PRODUKSI SETERUSNYA (Next Production Steps)

1. Jalankan skrip SQL `202610240002_fix_admin_student_sync_and_rls.sql` di Supabase SQL Editor.
2. Sahkan bahawa akaun admin anda didaftarkan dalam `admin_users` atau mempunyai `role = 'admin'` di `public.profiles`.
3. Lakukan deploy kod terkini ke hosting Vercel.

---

## 14. PENGESAHAN PEMULIHARAAN DATA (Data Preservation Verification)

**Status:** `VERIFIED`

- **2 Video Terbitan:** Kekal selamat dan utuh di Supabase `cms_videos` (`vid_1792767977048` dan `vid_1792768015582`).
- **4 Nota Pembelajaran:** Kekal selamat dan utuh di Supabase `learning_notes`.
- **5 Soalan Kuiz KSSM:** Kekal selamat di Supabase `cms_quizzes`.
- **Akaun Murid & Kemajuan:** Tiada akaun murid yang dipadam.
- **Model 3D & CellQuest:** Tiada aset 3D (`models/animal_cell_final.glb`, `models/plantcellnew.glb`) yang terjejas.
