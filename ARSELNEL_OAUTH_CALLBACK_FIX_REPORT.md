# ARSelNel — Laporan Pembaikan Kritikal Google OAuth & Laluan Callback (404 & bad_oauth_state)

**Tarikh:** 25 Oktober 2026  
**Status:** SELESAI & DISAHKAN (23/23 Ujian Pembaikan Berjaya Melepasi 100%)  
**Dokumentasi Kod:** ARSelNel Google OAuth PKCE Security & Callback Architecture  

---

## 1. Ringkasan Eksekutif & Punca Masalah (Root Causes)

Pemeriksaan menyeluruh terhadap kod sumber versi `20261024-172349` telah mengenal pasti punca teras kepada 4 ralat utama yang dilaporkan semasa cubaan log masuk Google:

| Ralat / Simptom | Punca Teras (Root Cause) | Status Pembaikan |
|---|---|---|
| **Error 1: `bad_oauth_state` (OAuth state has expired)** | 1. **Dwi-klik / Permintaan Bersaing (Concurrent Clicks):** Butang "Teruskan dengan Google" tidak mempunyai kawalan debounce atau status kunci (`disabled`), membolehkan pengguna menekan butang beberapa kali dalam sesaat. Setiap klik memulakan aliran PKCE baharu di mana penjanaan verifier baharu menimpa nilai cookie/state sebelumnya di pelayan auth Supabase.<br>2. **Muat Semula URL Lapuk (Stale URL Reload):** Pengguna memuat semula halaman callback atau membuka pautan dari tab lama di mana parameter `state` telah luput tempoh sah (timeout 5-10 minit di Supabase).<br>3. **Ketiadaan Pengendalian Ralat:** Tiada mesej ramah atau butang permulaan semula sesi baharu, menyebabkan pengguna terperangkap pada URL rosak. | **Selesai:** Ditambah debounce lock `isGoogleAuthBusy` pada butang, mesej rasmi BM, pembersihan parameter URL lapuk melalui `history.replaceState()`, dan butang **"Cuba Log Masuk Google Semula"** yang menjana sesi PKCE bersih. |
| **Error 2: Callback 404 ("Halaman Tidak Ditemui")** | 1. **Fail Fizikal Hilang:** Fail `auth/callback.html` **langsung tidak wujud** di dalam direktori `auth/` pada projek asal.<br>2. **Ketiadaan Rewrite di `vercel.json`:** Tiada laluan rewrite khusus untuk `/auth/callback` atau `/callback`.<br>3. **Penyaluran ke `404.html`:** Apabila Supabase mengalihkan pengguna kembali ke `https://arselnel-seven.vercel.app/auth/callback.html`, Vercel tidak menemui fail dan secara automatik memaparkan `404.html` ("Halaman Tidak Ditemui"). | **Selesai:** Membina fail fizikal `auth/callback.html` lengkap dengan UI modern ARSelNel, logik pertukaran kod PKCE, pengesahan peranan, dan menambah rewrite `/auth/callback` serta `/callback` di `vercel.json` & `local-server.js`. |
| **Error 3: Halahan ke `localhost:3000` (ERR_CONNECTION_REFUSED)** | 1. **Konfigurasi "Site URL" Supabase:** Di panel Supabase Auth -> URL Configuration, "Site URL" projek asalnya ditetapkan ke `http://localhost:3000`.<br>2. **Fallback Redirect:** Apabila `redirectTo` yang dihantar oleh klien tidak tersenarai dalam senarai putih (*Redirect URLs Whitelist*) Supabase, atau berlaku ralat pada domain pengeluaran, Supabase secara automatik mengembalikan pelayar ke "Site URL" lalai (`http://localhost:3000`), menyebabkan peranti pengeluaran gagal menyambung. | **Selesai:** Menyeragamkan fungsi `ARSupabase.getOAuthRedirectUrl()` yang secara pintar mengesan domain produksi `arselnel-seven.vercel.app` dan menggunakan URL mutlak yang sah. Menyediakan senarai semak konfigurasi Site URL Supabase. |
| **Error 4: "Unable to exchange external code"** | 1. **Pertukaran Kod Luaran di Pelayan Supabase:** Ralat ini dijana oleh enjin Supabase GoTrue apabila Supabase cuba menukar kod kebenaran Google di `oauth2.googleapis.com/token`. Ia berlaku jika Google Client Secret/ID tidak sepadan, atau URI Panggilan Balik Dibenarkan (*Authorized Redirect URI*) di Google Cloud Console tersilap diisi dengan URL frontend ARSelNel dan bukannya URI Supabase.<br>2. **Pertukaran Kod Berganda (Duplicate Code Exchange):** Dalam SDK Supabase JS v2, pilihan `detectSessionInUrl: true` menukar kod PKCE secara automatik. Jika kod aplikasi cuba memanggil `exchangeCodeForSession(code)` secara serentak, kod sekali guna (*single-use code*) tersebut gagal ditukar kali kedua. | **Selesai:** Pengendali callback di `auth/callback.html` dan `assets/js/supabase-client.js` kini mengutamakan sesi sedia ada yang dikesan oleh SDK (`getSession()`), dan hanya melakukan fallback sekali sahaja secara selamat dengan perlindungan dwi-eksekusi. Dokumentasi semakan Google Cloud & Supabase disertakan. |

---

## 2. Fail yang Dicipta & Diubah Suai

### Fail Baharu Dicipta:
1. [auth/callback.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/callback.html)
   - Laman pengesahan kanonikal Google OAuth ARSelNel.
   - Antara muka moden berasaskan Tailwind CSS, Google Fonts, ikon Material Symbols, dan maskot SelBot AI.
   - Mengendalikan pertukaran kod PKCE secara atomik sekali sahaja (*single-exchange guarantee*).
   - Mengendalikan ralat penyedia terlebih dahulu (`bad_oauth_state`, `access_denied`, `unable to exchange external code`).
   - Melindungi peranan pentadbir (menyemak jadual `admin_users`, bukan `user_metadata` klien).
   - Menyelaraskan profil pelajar baharu ke jadual `profiles` dengan klausa `onConflict: 'id'`.
   - Mengalihkan pelajar ke Papan Pemuka Pelajar (`../halaman_utama/code.html`) dan Pentadbir ke Panel CMS (`../admin_dashboard/code.html`).
   - Membersihkan parameter URL melalui `history.replaceState` untuk melindungi token dan kod kebenaran daripada log pelayar.
2. [callback.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/callback.html)
   - Fail penghalaan sandaran (*fallback redirector*) pada punca domain bagi mengalihkan sebarang capaian `/callback.html` terus ke `auth/callback.html` bersama parameter carian dan fragmen cincangan (*hash*).
3. [tests/test_oauth_callback_fix.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/tests/test_oauth_callback_fix.js)
   - Suite ujian automatik penuh merangkumi 23 senario ujian bagi mengesahkan semua keperluan fasa audit.

### Fail Sedia Ada Diubah Suai:
1. [assets/js/supabase-client.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/supabase-client.js)
   - Menambah fungsi kanonikal `getOAuthRedirectUrl()` yang dieksport pada `ARSupabase`.
   - Mengemas kini `signInWithGoogle(redirectTo)` supaya menggunakan laluan kanonikal `/auth/callback.html`.
   - Menambah pemetaan mesej ramah Bahasa Melayu untuk `bad_oauth_state`, `unable to exchange external code`, dan `access_denied` dalam `friendlyError()`.
   - Memperkukuh `handleOAuthCallback()` untuk menyokong pertukaran sesi yang selamat tanpa perlumbaan eksekusi (*race conditions*).
2. [auth/login.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/login.html)
   - Mengemas kini fungsi `handleGoogleLogin()` untuk menggunakan `ARSupabase.getOAuthRedirectUrl()`.
   - Menambah kawalan kunci serentak (`isGoogleAuthBusy`) bagi menyahdayakan butang Google dan menghalang dwi-klik.
3. [auth/register.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/register.html)
   - Mengemas kini fungsi `handleGoogleAuth()` untuk menggunakan `ARSupabase.getOAuthRedirectUrl()`.
   - Menambah kawalan kunci serentak (`isGoogleAuthBusy`) bagi menyahdayakan butang Google semasa pemprosesan.
4. [vercel.json](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/vercel.json)
   - Menambah pemetaan rewrite rasmi:
     - `{"source": "/auth/callback", "destination": "/auth/callback.html"}`
     - `{"source": "/callback", "destination": "/auth/callback.html"}`
5. [local-server.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/local-server.js)
   - Menambah pemetaan kamus `ROUTE_ALIASES` bagi menyokong capaian `/auth/callback`, `/callback`, `/login`, dan `/register` setara dengan kelakuan Vercel.

---

## 3. Laluan Panggilan Balik Kanonikal (Canonical Callback Routes)

Laluan berikut kini diselaraskan sepenuhnya di seluruh aplikasi:

| Persekitaran | Laluan Kanonikal (Canonical URL) |
|---|---|
| **Produksi (Vercel)** | `https://arselnel-seven.vercel.app/auth/callback.html` |
| **Pembangunan Tempatan** | `http://localhost:3000/auth/callback.html` (atau port aktif `window.location.origin`) |
| **Laluan Ringkas (Rewrite)** | `https://arselnel-seven.vercel.app/auth/callback` &rarr; `auth/callback.html` |
| **Laluan Punca (Rewrite)** | `https://arselnel-seven.vercel.app/callback` &rarr; `auth/callback.html` |

Pengguna produksi tidak lagi dihantar ke `localhost:3000` atau `auth/login.html?oauth=google`.

---

## 4. Mekanisme Penyelesaian `bad_oauth_state` & Pertukaran Kod PKCE

### Pencegahan Permintaan Serentak (Debounce & Double-Click Guard):
Pada fail `auth/login.html` dan `auth/register.html`:
```javascript
let isGoogleAuthBusy = false;
async function handleGoogleLogin() {
  if (isGoogleAuthBusy) return; // Menghalang panggilan kedua
  isGoogleAuthBusy = true;
  googleBtn.disabled = true;
  googleText.textContent = 'Menghubungkan ke Google...';
  
  const canonicalCallback = ARSupabase.getOAuthRedirectUrl();
  await ARSupabase.signInWithGoogle(canonicalCallback);
}
```

### Pengendalian Sesi Luput Tempoh di `auth/callback.html`:
Apabila parameter URL mengandungi `error_code=bad_oauth_state` atau ralat luput tempoh:
1. Pelayan tidak lagi cuba memproses pertukaran kod yang sudah terbatal.
2. Pelayar memaparkan mesej rasmi Bahasa Melayu:
   > **"Sesi log masuk Google telah tamat. Sila cuba log masuk semula."**
3. Butang interaktif disediakan:
   > **"Cuba Log Masuk Google Semula"**
4. Menekan butang ini akan mencetuskan `ARSupabase.signInWithGoogle()` yang menjana keadaan PKCE segar yang sah.
5. Parameter URL dibersihkan melalui `window.history.replaceState(null, '', window.location.pathname)` agar muat semula halaman tidak mencetuskan ralat berulang.

---

## 5. Keselamatan Akaun & Perlindungan Peranan (Security Guardrails)

Selaras dengan Phase 7, pembaikan ini memastikan:
1. **Tiada Kenaikan Kuasa Automatik (No Auto-Admin):** Log masuk Google secara lalai memberikan peranan `student`. Peranan `admin` hanya diberikan jika `user.id` pengguna disahkan wujud dalam jadual `admin_users` di pangkalan data Supabase. Metadata klien (`user_metadata.role`) tidak dipercayai secara membuta-tuli.
2. **Pengasingan Akaun Sebenar:** Log masuk Google tidak pernah menyuntik profil demo Aina (`ainasofea` / `usr_std_1`) atau mencampurkan akaun berbeza.
3. **Penyisipan Profil Selamat:** Menggunakan arahan SQL `upsert` dengan klausa `onConflict: 'id'` berdasarkan `session.user.id` Supabase sebenar, menghalang pertindihan profil atau ralat kunci primer.
4. **Pemeliharaan Data Pembelajaran:** Markah kuiz, pencapaian CellQuest, dan kemajuan pembelajaran pelajar yang sedia ada dikekalkan sepenuhnya tanpa pengubahsuaian struktur jadual.

---

## 6. Senarai Semak Konfigurasi Manual (Developer Checklist)

Sila sahkan tetapan berikut di papan pemuka pelayan luaran (Supabase & Google Cloud):

### A. Papan Pemuka Supabase (Supabase Dashboard):
Navigasi ke: **Authentication** &rarr; **URL Configuration**

1. **Site URL:**
   ```text
   https://arselnel-seven.vercel.app
   ```
   *(PENTING: Pastikan bukan `http://localhost:3000`)*

2. **Redirect URLs (Senarai Putih Panggilan Balik):**
   Pastikan entri berikut ditambah ke dalam senarai:
   - `https://arselnel-seven.vercel.app/auth/callback.html`
   - `https://arselnel-seven.vercel.app/auth/callback`
   - `https://arselnel-seven.vercel.app/callback`
   - `https://arselnel-seven.vercel.app/**`
   - `http://localhost:3000/auth/callback.html` (untuk pembangunan setempat)
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`

3. **Google Provider:**
   Navigasi ke: **Authentication** &rarr; **Providers** &rarr; **Google**
   - Pastikan status adalah **Enabled**.
   - Masukkan **Client ID** dan **Client Secret** daripada Google Cloud Console yang sah.
   - Salin **Callback URL (for OAuth)** yang dipaparkan oleh Supabase, lazimnya berformat:
     ```text
     https://kxjhlbudsiojpvzwqwva.supabase.co/auth/v1/callback
     ```

### B. Konsol Google Cloud (Google Cloud Console):
Navigasi ke: **APIs & Services** &rarr; **Credentials** &rarr; Pilih OAuth 2.0 Client ID web anda.

1. **Authorized JavaScript Origins:**
   - `https://arselnel-seven.vercel.app`
   - `http://localhost:3000` (pilihan untuk ujian setempat)

2. **Authorized Redirect URIs:**
   *(AMARAN KRITIKAL: Google Cloud mesti menerima URL panggilan balik Supabase Auth, BUKAN URL frontend ARSelNel)*
   - `https://kxjhlbudsiojpvzwqwva.supabase.co/auth/v1/callback`

---

## 7. Ringkasan Ujian yang Dijalankan (Verification Results)

Tiga suite ujian automatik telah dijalankan dan lulus 100%:

```bash
# 1. Suite Ujian Sistem Pengesahan Teras (Terdahulu)
node tests/test_auth_system.js
-> 22 / 22 tests passed (100%)

# 2. Suite Ujian Penyelarasan Produksi & Pengasingan Akaun (Terdahulu)
node tests/test_production_sync_and_auth_fix.js
-> 18 / 18 tests passed (100%)

# 3. Suite Ujian Khas Pembaikan Google OAuth & Callback (Baharu)
node tests/test_oauth_callback_fix.js
-> 23 / 23 tests passed (100%)
```

### Butiran 23 Ujian Pembaikan OAuth:
- [x] **1.1** Fail `auth/callback.html` wujud, lengkap dengan SDK Supabase JS v2, `supabase-client.js`, `auth.js`, dan `auth-guard.js`.
- [x] **1.2** Fail sandaran punca `callback.html` wujud dan menghala ke `auth/callback.html`.
- [x] **1.3** Konfigurasi `vercel.json` mempunyai rewrite `/auth/callback` & `/callback` ke `auth/callback.html`.
- [x] **1.4** Pelayan tempatan `local-server.js` menyokong penghalaan statik ke `auth/callback.html`.
- [x] **2.1** `ARSupabase.getOAuthRedirectUrl()` menghasilkan URL kanonikal pada domain produksi `arselnel-seven.vercel.app`.
- [x] **2.2** `ARSupabase.getOAuthRedirectUrl()` menyokong origin tempatan secara dinamik untuk pembangunan tanpa kod keras.
- [x] **2.3** `auth/login.html` menggunakan `ARSupabase.getOAuthRedirectUrl()`.
- [x] **2.4** `auth/register.html` menggunakan `ARSupabase.getOAuthRedirectUrl()`.
- [x] **3.1** Perlindungan dwi-klik serentak pada borang log masuk Google (`isGoogleAuthBusy`).
- [x] **3.2** Perlindungan dwi-klik serentak pada borang pendaftaran Google (`isGoogleAuthBusy`).
- [x] **4.1** Paparan mesej rasmi Bahasa Melayu semasa `bad_oauth_state` ("Sesi log masuk Google telah tamat. Sila cuba log masuk semula.").
- [x] **4.2** Butang "Cuba Log Masuk Google Semula" memulakan sesi OAuth segar.
- [x] **4.3** Fungsi `friendlyError()` memetakan ralat `bad_oauth_state`, `unable to exchange external code`, dan `access_denied` ke BM.
- [x] **4.4** Capaian langsung tanpa parameter memaparkan panduan ramah tanpa ranap atau gelung halaan.
- [x] **5.1** Peranan pengguna Google disahkan kepada `student` dan pentadbir disahkan melalui jadual `admin_users`.
- [x] **5.2** Penciptaan profil pelajar baharu menggunakan `onConflict: 'id'` untuk mengelakkan pertindihan data.
- [x] **5.3** Tiada profil statik Aina disuntik ke akaun Google.
- [x] **5.4** Halahan pelajar berjaya disasarkan ke Papan Pemuka Pelajar (`../halaman_utama/code.html`).
- [x] **5.5** Halahan pentadbir disasarkan ke Panel Kawalan CMS (`../admin_dashboard/code.html`).
- [x] **5.6** Kod PKCE ditukar secara tunggal dan parameter dibersihkan daripada sejarah URL pelayar.
- [x] **6.1** Permintaan HTTP `GET /auth/callback.html` mengembalikan status 200 OK dengan HTML sah.
- [x] **6.2** Permintaan HTTP `GET /auth/callback` (tanpa .html) mengembalikan status 200 OK melalui rewrite.
- [x] **6.3** Permintaan HTTP `GET /callback` mengembalikan status 200 OK melalui rewrite.

---

## 8. Kesimpulan

Dengan pelaksanaan ini:
1. Pelajar dan guru yang menekan "Teruskan dengan Google" akan dialihkan ke akaun Google, meluluskan kebenaran, kembali ke `https://arselnel-seven.vercel.app/auth/callback.html`, dan terus memasuki papan pemuka yang sah.
2. Tiada lagi ralat 404 pada laluan callback.
3. Tiada lagi halaan tersasar ke `localhost:3000`.
4. Ralat `bad_oauth_state` dihalang secara proaktif melalui kawalan serentak, dan jika sesi luput berlaku, mesej rasmi Bahasa Melayu bersama butang cuba semula disediakan dengan lancar.
5. Semua rekod pembelajaran sains, modul interaktif 3D/AR, dan markah kuiz KSSM ARSelNel kekal terpelihara dengan selamat.
