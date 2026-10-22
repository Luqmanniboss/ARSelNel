# ARSelNel LMS 2.0 — local demo build

## Menjalankan aplikasi

1. Pasang Node.js 18 atau lebih baharu.
2. Buka terminal dalam folder projek ini.
3. Jalankan `node server.js` (atau `npm start` jika npm tersedia).
4. Buka `http://localhost:3000/auth/login.html`.

Tiada pakej tambahan diperlukan untuk pelayan fail statik setempat.

## Mod demo

Pilih **Demo Pelajar (Aina)** untuk masuk ke dashboard murid atau **Demo Guru (Admin)** untuk masuk ke papan pemuka CMS. Kedua-duanya ialah sesi demo setempat dan tidak memerlukan kata laluan. Data CMS dalam demo menggunakan ruang `arselnel_demo_*` yang terasing daripada koleksi biasa. Kandungan contoh dan kemajuan demo disimpan dalam localStorage pelayar ini sahaja.

Pelajar boleh cuba kuiz dan hasilnya muncul pada senarai Penyerahan Kuiz dalam papan pemuka guru demo. Guru demo boleh mengurus kuiz, nota, video, model AR, rekod murid, dan menerbitkan kandungan modul teks. Modul yang diterbitkan dipaparkan pada halaman Modul Pembelajaran. Tema gelap papan pemuka guru juga disimpan mengikut sesi pengguna.

## Batasan penting

- Akaun sekolah sebenar dan pendaftaran akaun tidak diaktifkan kerana projek ini belum mempunyai pelayan pengesahan yang menyimpan kata laluan dengan selamat. Halaman log masuk akan menerangkan batasan itu; gunakan butang demo untuk meneroka.
- Dashboard, kandungan, keputusan kuiz dan analitik setempat tidak dikongsi antara pelayar atau peranti. Nilai analitik contoh dilabel sebagai contoh dan bukan rekod sekolah langsung.
- RBAC dalam aplikasi statik tidak boleh melindungi operasi sensitif. Untuk penggunaan sekolah, sambungkan pengesahan, sesi, peranan dan kebenaran kepada API serta pangkalan data pelayan. Jangan masukkan kata laluan, PIN, token atau kunci API ke dalam kod klien.
- Pengurusan kelas/guru, pengumuman, tetapan SelBot, muat naik aset CMS, laporan berasaskan tarikh dan carta analitik langsung memerlukan model data dan API pelayan yang belum tersedia.

## Ciri yang tersedia sekarang

- Dashboard pelajar, modul sedia ada, eksperimen AR, SelBot, nota dan kuiz dikekalkan.
- Profil murid dan tetapan penampilan/kebolehcapaian disimpan setempat.
- CMS setempat sedia ada untuk kuiz, nota, video, model AR dan rekod murid.
- Editor modul teks dengan draf, terbit, edit dan padam; kandungan dipaparkan dengan selamat sebagai teks biasa.
- Rekod penyerahan kuiz setempat dan eksport CSV.
- Papan pemuka guru responsif dengan tema gelap.
