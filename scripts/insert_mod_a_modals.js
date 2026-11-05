const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'cellquest', 'adventure.html');
let content = fs.readFileSync(filePath, 'utf8');

const markerCRLF = '  <!-- ==============================================================================\r\n       MODAL: ARAHAN SEBELUM PERMAINAN AR ORIENTASI DUNIA (COLOURFUL SCIENCE ADVENTURE)';
const markerLF = '  <!-- ==============================================================================\n       MODAL: ARAHAN SEBELUM PERMAINAN AR ORIENTASI DUNIA (COLOURFUL SCIENCE ADVENTURE)';

const modalsHTML = `  <!-- ==============================================================================
       MODAL: ARAHAN SEBELUM PERMAINAN MOD A — JELAJAH MAKMAL 3D
       ============================================================================== -->
  <div class="cq-modal-backdrop" id="lab3d-story-mission-modal" role="dialog" aria-modal="true" aria-labelledby="lab3d-mission-title">
    <div class="cq-modal cq-mission-briefing-card">
      <button type="button" class="cq-modal-close" id="close-lab3d-mission-btn" aria-label="Tutup">
        <span class="material-symbols-outlined">close</span>
      </button>

      <!-- Hero Header -->
      <div class="cq-mission-hero">
        <div class="cq-mission-badge-chip">
          <span class="material-symbols-outlined" style="font-size: 16px;">view_in_ar</span>
          <span>MOD A • JELAJAH MAKMAL 3D</span>
        </div>
        <h2 id="lab3d-mission-title" class="cq-mission-title">MISI RAHSIA: SELAMATKAN MAKMAL ARSELNEL!</h2>
        <p class="cq-mission-subtitle">
          🔬 Jom jadi Saintis Muda! Terokai makmal 3D, selesaikan 8 cabaran dan buka pintu rahsia! 🧪
        </p>
      </div>

      <!-- Kotak Cerita Misi Kecemasan (Pastel Yellow / Orange Alert Card) -->
      <div class="cq-mission-story-box">
        <div class="cq-mission-alert-heading">
          <span class="alert-pulse-icon">⚡</span>
          <strong>AMARAN! MAKMAL ARSELNEL MEMERLUKAN BANTUAN!</strong>
        </div>
        <div class="cq-mission-alert-body">
          <p class="story-p">Oh tidak! Sistem tenaga Makmal ARSELNEL telah mengalami kerosakan misteri!</p>
          <p class="story-p">Lapan stesen organel di dalam makmal telah kehilangan tenaga dan pintu menuju ke <strong>Bilik Teras Sel</strong> telah terkunci.</p>
          <p class="story-p">Sebagai Saintis Muda, anda telah dipilih untuk menyelamatkan makmal ini! Terokai makmal 3D, cari 8 stesen organel, pelajari fungsi setiap organel dan jawab cabaran sains.</p>
          <p class="story-p">Setiap cabaran yang berjaya diselesaikan akan memulihkan satu bahagian tenaga makmal.</p>
          <p class="story-p">Apabila kesemua 8 stesen berjaya dipulihkan, <strong>pintu rahsia akan terbuka!</strong></p>
          <p class="story-p">Masuk ke <strong>Bilik Teras Sel</strong> dan aktifkan <strong>Teras Tenaga Utama</strong> untuk menyelamatkan Makmal ARSELNEL!</p>
        </div>
      </div>

      <!-- Section Title: CARA BERMAIN -->
      <div class="cq-mission-section-title">
        <span class="material-symbols-outlined">sports_esports</span>
        <span>CARA BERMAIN (6 LANGKAH MUDAH)</span>
      </div>

      <!-- 6 Colourful Pastel Step Cards Grid -->
      <div class="cq-mission-steps-grid">
        <!-- Step 1: Gerakkan Watak (Pastel Blue) -->
        <div class="cq-mission-step-card step-blue">
          <div class="step-card-header">
            <span class="step-badge">1</span>
            <span class="material-symbols-outlined step-icon">sports_esports</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Gerakkan Watak</strong>
            <p class="step-desc">Gunakan joystick untuk berjalan di dalam makmal 3D. Pada komputer, gunakan WASD.</p>
          </div>
        </div>

        <!-- Step 2: Lihat Sekeliling (Mint Green) -->
        <div class="cq-mission-step-card step-mint">
          <div class="step-card-header">
            <span class="step-badge">2</span>
            <span class="material-symbols-outlined step-icon">screen_rotation</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Lihat Sekeliling</strong>
            <p class="step-desc">Pusingkan telefon atau iPad untuk melihat kiri, kanan, atas dan bawah. Anda juga boleh menggunakan kawalan sentuhan.</p>
          </div>
        </div>

        <!-- Step 3: Cari 8 Stesen (Pastel Yellow) -->
        <div class="cq-mission-step-card step-yellow">
          <div class="step-card-header">
            <span class="step-badge">3</span>
            <span class="material-symbols-outlined step-icon">biotech</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Cari 8 Stesen</strong>
            <p class="step-desc">Terokai makmal dan cari 8 stesen organel yang tersembunyi.</p>
          </div>
        </div>

        <!-- Step 4: Teroka Organel (Lavender Purple) -->
        <div class="cq-mission-step-card step-lavender">
          <div class="step-card-header">
            <span class="step-badge">4</span>
            <span class="material-symbols-outlined step-icon">view_in_ar</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Teroka Organel</strong>
            <p class="step-desc">Dekati stesen dan tekan Teroka untuk mempelajari struktur serta fungsi organel.</p>
          </div>
        </div>

        <!-- Step 5: Selesaikan Kuiz (Pastel Pink) -->
        <div class="cq-mission-step-card step-pink">
          <div class="step-card-header">
            <span class="step-badge">5</span>
            <span class="material-symbols-outlined step-icon">quiz</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Selesaikan Kuiz</strong>
            <p class="step-desc">Jawab soalan sains untuk memulihkan tenaga setiap stesen.</p>
          </div>
        </div>

        <!-- Step 6: Buka Pintu Rahsia (Pastel Orange) -->
        <div class="cq-mission-step-card step-orange">
          <div class="step-card-header">
            <span class="step-badge">6</span>
            <span class="material-symbols-outlined step-icon">meeting_room</span>
          </div>
          <div class="step-card-content">
            <strong class="step-title">Buka Pintu Rahsia</strong>
            <p class="step-desc">Selepas 8 cabaran selesai, cari pintu rahsia dan masuk ke Bilik Teras Sel!</p>
          </div>
        </div>
      </div>

      <!-- Tip Keselamatan Saintis Muda -->
      <div class="cq-mission-safety-card">
        <div class="safety-icon-wrapper">💡</div>
        <div class="safety-text-wrapper">
          <strong>TIP KESELAMATAN SAINTIS MUDA</strong>
          <p>Main di kawasan yang selamat dan selesa. Anda boleh bermain secara duduk. Gunakan joystick untuk bergerak dan pusingkan peranti atau sentuh skrin untuk melihat sekeliling.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="cq-mission-actions">
        <button type="button" class="btn-mission-back" id="lab3d-mission-back-btn">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Kembali ke Lobi</span>
        </button>
        <button type="button" class="btn-mission-start" id="lab3d-mission-start-btn">
          <span class="material-symbols-outlined">rocket_launch</span>
          <span>Mulakan Pengembaraan 3D 🚀</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ==============================================================================
       MODAL: KALIBRASI KAMERA MOD A (VR-LIKE SENSOR & TOUCH CONTROLS)
       ============================================================================== -->
  <div class="cq-modal-backdrop" id="lab3d-calibration-modal" role="dialog" aria-modal="true" aria-labelledby="lab3d-cal-title">
    <div class="cq-modal" style="max-width: 480px; text-align: center; padding: 24px 22px; background: #ffffff; border-radius: 22px; border: 2px solid #bae6fd; box-shadow: 0 20px 60px rgba(15,23,42,0.18); color: #1e293b;">
      <div style="font-size: 40px; margin-bottom: 8px;">🧭</div>
      <div class="cq-mission-badge-chip" style="margin-bottom: 8px;">KAWALAN PANDANGAN VR</div>
      <h2 id="lab3d-cal-title" style="font-size: 21px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">SEDIA UNTUK MENEROKA?</h2>
      <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 0 0 18px 0;">
        Pegang telefon atau iPad pada kedudukan yang selesa, kemudian tekan <strong>Kalibrasi Pandangan</strong> untuk menetapkan arah pandangan anda. Anda juga boleh bermain menggunakan kawalan sentuhan.
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="cq-btn-primary" id="lab3d-cal-sensor-btn" style="justify-content: center; width: 100%; font-size: 14.5px; padding: 12px 18px; background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);">
          <span class="material-symbols-outlined" style="font-size: 19px;">screen_rotation</span>
          <span>Kalibrasi Pandangan &amp; Aktifkan Sensor</span>
        </button>
        <button type="button" class="cq-btn-secondary" id="lab3d-cal-touch-btn" style="justify-content: center; width: 100%; font-size: 13.5px; padding: 10px 18px; border-color: #bae6fd; color: #0284c7; background: #f0f9ff;">
          <span class="material-symbols-outlined" style="font-size: 18px;">touch_app</span>
          <span>Gunakan Kawalan Sentuhan (Tanpa Sensor)</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ==============================================================================
       MODAL: KEJAYAAN TERAS TENAGA UTAMA (CELL CORE VICTORY MODAL)
       ============================================================================== -->
  <div class="cq-modal-backdrop" id="lab3d-crystal-victory-modal" role="dialog" aria-modal="true" aria-labelledby="lab3d-vic-title">
    <div class="cq-modal" style="max-width: 520px; text-align: center; padding: 28px 24px; background: #ffffff; border-radius: 24px; border: 2px solid #a7f3d0; box-shadow: 0 24px 70px rgba(15,23,42,0.18); color: #1e293b;">
      <div style="font-size: 48px; margin-bottom: 6px;">💎</div>
      <div class="cq-mission-badge-chip" style="background: #d1fae5; border-color: #6ee7b7; color: #047857; margin-bottom: 8px;">
        ⭐ MISI MAKMAL SELESAI 100% ⭐
      </div>
      <h2 id="lab3d-vic-title" style="font-size: 24px; font-weight: 900; color: #065f46; margin: 0 0 6px 0;">TAHNIAH, SAINTIS MUDA!</h2>
      <p style="font-size: 14.5px; color: #047857; font-weight: 800; margin: 0 0 6px 0;">
        Anda berjaya memulihkan kesemua 8 stesen organel dan mengaktifkan Teras Tenaga Utama!
      </p>
      <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 0 0 18px 0;">
        Makmal ARSELNEL kini kembali berfungsi sepenuhnya! Semua sistem tenaga dan kestabilan sel telah pulih.
      </p>

      <div class="cq-cert-stats" style="margin-bottom: 20px;">
        <div class="cq-cert-stat-box" style="background: #f0fdf4; border: 1.5px solid #a7f3d0;">
          <span style="color: #047857;">JUMLAH MARKAH</span>
          <strong id="lab3d-final-score" style="color: #065f46;">800 Mata</strong>
        </div>
        <div class="cq-cert-stat-box" style="background: #f0fdf4; border: 1.5px solid #a7f3d0;">
          <span style="color: #047857;">STESEN SELESAI</span>
          <strong id="lab3d-final-stations" style="color: #065f46;">8 / 8 Stesen</strong>
        </div>
        <div class="cq-cert-stat-box" style="background: #f0fdf4; border: 1.5px solid #a7f3d0;">
          <span style="color: #047857;">TEMPOH MASA</span>
          <strong id="lab3d-final-time" style="color: #065f46;">00:00</strong>
        </div>
      </div>

      <div class="cq-modal-actions" style="justify-content: center; gap: 12px; border-top: 1.5px solid #e2e8f0; padding-top: 16px;">
        <button type="button" class="cq-btn-secondary" id="lab3d-explore-again-btn" style="flex: 1; padding: 11px 18px; font-size: 13.5px; border-color: #bae6fd; color: #0284c7; background: #f0f9ff; justify-content: center;">
          <span class="material-symbols-outlined" style="font-size: 18px;">explore</span>
          <span>Teroka Makmal Semula</span>
        </button>
        <button type="button" class="cq-btn-primary" id="lab3d-return-lobby-btn" style="flex: 1; padding: 11px 18px; font-size: 13.5px; background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%); justify-content: center;">
          <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
          <span>Kembali ke Lobi</span>
        </button>
      </div>
    </div>
  </div>\n\n`;

if (!content.includes('id="lab3d-story-mission-modal"')) {
  if (content.includes(markerCRLF)) {
    content = content.replace(markerCRLF, modalsHTML.replace(/\n/g, '\r\n') + markerCRLF);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Modals inserted into adventure.html (CRLF)');
  } else if (content.includes(markerLF)) {
    content = content.replace(markerLF, modalsHTML + markerLF);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Modals inserted into adventure.html (LF)');
  } else {
    console.error('Marker not found in adventure.html');
    process.exit(1);
  }
} else {
  console.log('Modals already present');
}

