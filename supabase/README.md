# Supabase untuk ARSelNel

## Susun atur dan data

ARSelNel ialah aplikasi HTML, CSS dan JavaScript tanpa framework build. `server.js` ialah pelayan Node.js tanpa dependency tambahan. Sebelum perubahan, sesi demo/guru dan akaun pelajar contoh disimpan dalam `localStorage`/`sessionStorage`; kuiz, CellQuest, profil, penampilan dan CMS guru juga menggunakan localStorage. API akaun sebenar sebelum ini menjawab HTTP 501. Tiada IndexedDB atau pangkalan data pelayan aplikasi ditemui.

Data yang kini dihantar ke Supabase apabila pelajar menggunakan akaun Auth: profil, tetapan peribadi, rekod kuiz baharu dan kemajuan CellQuest. Salinan setempat kekal. Kandungan nota, video, kuiz CMS, model AR, data dashboard guru dan aktiviti demo kekal setempat kerana ia memerlukan pengurusan/peranan guru yang belum disambungkan.

## Tetapan tempatan

1. Pastikan Node.js 18 atau lebih baharu dipasang.
2. Salin `.env.example` sebagai `.env`. Nilai Supabase projek ini telah dimasukkan ke `.env` pada salinan kerja ini; jangan salin fail itu ke Git atau hantar ke orang lain.
3. Mulakan semula pelayan: `npm start`.
4. Buka `http://localhost:3000/auth/login.html` atau `http://localhost:3000/auth/register.html`.
5. Untuk produksi, tetapkan `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` sebagai pembolehubah persekitaran pelayan. Aplikasi memerlukan HTTPS di luar localhost.

Pelayan hanya menghantar URL dan publishable key kepada klien melalui `/api/public-config`. Publishable key memang untuk klien, tetapi keselamatan data bergantung pada Auth dan RLS. Jangan tambah `service_role`, secret key atau kata laluan ke `.env`, kod pelayar, atau sistem kawalan versi.

Supabase JavaScript v2 dimuat melalui CDN rasmi yang didokumenkan Supabase. Token sesi Auth dihadkan kepada `sessionStorage` tab; ia tidak ditulis ke `localStorage`. Maklumat akaun pelajar bukan kata laluan disimpan dalam cache sesi ARSelNel.

## Migrasi pangkalan data

Belum dijalankan. Dalam Supabase Dashboard projek `kxjhlbudsiojpvzwqwva`:

1. Buka **SQL Editor** dan pilih **New query**.
2. Jalankan semakan baca sahaja ini dahulu:

   ```sql
   select table_name
   from information_schema.tables
   where table_schema = 'public'
     and table_name in ('profiles','learning_progress','quiz_attempts','activity_results','user_settings');
   ```

   Jika ia memulangkan mana-mana jadual, jangan terus jalankan migrasi. Semak struktur dan semua polisi sedia ada dahulu supaya jadual/polisi lama yang permissive tidak bercanggah.
3. Jika tiada jadual bertindih, buka `supabase/migrations/202610200001_initial_learning_data.sql`, salin keseluruhan kandungan dan tampal ke SQL Editor.
4. Semak projek/organisasi yang dipilih sebelum menekan **Run**. Skrip hanya menambah jadual, indeks, polisi RLS, fungsi dan trigger; ia tidak memadam atau mengubah kandungan sedia ada.
5. Jika query gagal, hentikan dan periksa konflik dahulu. Jangan jalankan skrip reset atau `truncate`.
6. Dalam **Authentication → URL Configuration**, set Site URL kepada URL HTTPS produksi anda. Tambah `http://localhost:3000/auth/login.html` ke Redirect URLs untuk pembangunan.
7. Dalam **Authentication → Providers → Email**, pastikan Email provider diaktifkan. Pengesahan emel boleh aktif; pendaftaran akan meminta pelajar menyemak e-mel dan kembali ke halaman log masuk.
8. Dalam **Project Settings → API**, pastikan nilai URL dan publishable key sepadan dengan `.env`.

Jadual: `profiles`, `learning_progress`, `quiz_attempts`, `activity_results`, `user_settings`. Semua jadual mengaktifkan RLS; polisi membatasi rekod peribadi kepada `auth.uid()`. Pelajar hanya boleh memasukkan/mengemas kini rekod milik sendiri. Percubaan kuiz dan hasil aktiviti hanya boleh dibaca atau dimasukkan, bukan diubah. Peranan guru tidak diberikan melalui metadata klien.

## Data lama dan pemulihan

- Tiada localStorage dibersihkan atau ditukar secara pukal. Kata laluan/token yang mungkin pernah tersimpan dalam rekod pendaftaran lama dibuang apabila `auth.js` dimuatkan; medan profil yang lain dikekalkan.
- Selepas log masuk akaun Supabase, aplikasi memuat semula rekod kuiz dan kemajuan CellQuest bagi UUID akaun itu. Ia menggabungkan rekod tanpa memadam rekod setempat.
- Jika sesi pelajar demo/setempat sedang aktif ketika log masuk atau mendaftar akaun Supabase, aplikasi menawarkan import hanya selepas pengesahan dialog yang menunjukkan profil sumber dan e-mel sasaran. Rekod asal tidak dipadam. Kegagalan rangkaian meninggalkan rekod dalam storan tempatan/queue; butang **Cuba semula** dicetuskan dari menu pelajar.
- Jangan import demo Aina, tetamu atau pelajar lain ke akaun murid sebenar. Batalkan dialog jika profil sumber bukan pelajar itu. Data CMS demo guru tidak dipindahkan.
- Sebelum migrasi manual, simpan salinan data pelayar: buka DevTools → Console pada origin ARSelNel, jalankan `copy(JSON.stringify(Object.fromEntries(Object.entries(localStorage)), null, 2))`, tampal ke fail JSON tempatan yang selamat. Fail ini boleh mengandungi maklumat profil; jangan kongsi secara terbuka.
- Impor kuiz menggunakan ID sumber stabil dan `upsert` unik pada pasangan pengguna/sumber supaya percubaan semula tidak menggandakan. Data asal setempat kekal sehingga pengguna memadamnya sendiri.

## Ujian sambungan dan status

Semakan baca sahaja ke `/auth/v1/settings` bagi URL dan publishable key yang diberi berjaya dengan HTTP 200. Ini mengesahkan endpoint Auth boleh dicapai dan key diterima. Ia **tidak** membuktikan skema Postgres tersedia atau operasi tulis berfungsi. API REST belum boleh diuji sehingga migrasi di atas dijalankan. UI hanya memaparkan “Data disimpan ke Supabase” selepas operasi pangkalan data berjaya; status lain menerangkan data setempat atau rekod tertangguh.

## Batasan belum selesai

- Guru/pentadbir masih mod demo setempat. Tiada role guru/Auth berprivilej atau analitik sekolah awan disediakan; tiada rekod pelajar dipaparkan kepada guru melalui Supabase.
- Tiada penyegerakan CMS (kuiz, nota, video, model AR, pelajar, modul dan submission guru) lagi.
- Migrasi memerlukan pemilik projek menjalankan SQL dan mengkonfigurasi redirect/email Supabase. Ujian insert/read/RLS sebenar belum dapat dibuat sebelum langkah ini.
- Mod offline menyimpan rekod yang gagal pada peranti untuk cuba semula selepas kembali online dan selepas akaun sama disahkan. Tiada resolusi konflik untuk suntingan serentak pelbagai peranti selain upsert rekod aktiviti terkini.
- Foto avatar custom berupa data URI mungkin menghampiri had saiz baris; untuk skala produksi gunakan Supabase Storage dengan polisi bucket per pengguna.

## Migrasi 2: Sistem Slaid Interaktif & Anotasi Pelajar (Smart Notes)

Fail migrasi kedua: `supabase/migrations/202610200002_smart_notes_annotation_system.sql`.
- Jadual:
  - `learning_notes`: Bahan slaid yang dimuat naik atau dipautkan oleh guru (PDF, PPTX, Google Slides, Embed).
  - `student_annotations`: Anotasi vektor digital murid (pen, penyerlah, teks, bentuk) bagi setiap slaid, terpencil mengikut `student_id`.
  - `student_note_progress`: Jejak slaid terakhir yang dibuka murid bagi setiap nota.
- Polisi RLS:
  - Nota diterbitkan boleh dibaca oleh semua pengguna.
  - Guru/pentadbir boleh menambah, mengemas kini dan memadam bahan slaid.
  - Murid hanya boleh membaca, menyimpan dan mengemas kini anotasi milik sendiri (`student_id = auth.uid()`). Anotasi murid lain tidak boleh dicapai.
  - Slaid asal guru kekal selamat dan tidak boleh diubah oleh murid.
