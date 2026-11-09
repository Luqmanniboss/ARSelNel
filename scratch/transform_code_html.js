const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'kotak_arselnel', 'code.html');
let html = fs.readFileSync(filePath, 'utf8');

// Target marker: from "<!-- =========================================================================\n       FASA 3C: GYROSCOPE POV LOCK"
// to the closing div of pov-ar-anchor right before "<!-- OFF-SCREEN TARGET POINTER"

const startMarker = '<!-- =========================================================================\r\n       FASA 3C: GYROSCOPE POV LOCK';
const altStartMarker = '<!-- =========================================================================\n       FASA 3C: GYROSCOPE POV LOCK';

let startIndex = html.indexOf(startMarker);
if (startIndex === -1) startIndex = html.indexOf(altStartMarker);

const endMarker = '<!-- OFF-SCREEN TARGET POINTER';
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
  process.exit(1);
}

const originalBlock = html.substring(startIndex, endIndex);

// Check that views 3 and 4 (nota) are in originalBlock
const notaStartMarker = '<!-- VIEW 3: Active Nota View in POV Mode (Fasa 4B) -->';
const kuizStartMarker = '<!-- VIEW 5: Kuiz & Permainan Selection View in POV Mode (Fasa 4C) -->';

const notaIndex = originalBlock.indexOf(notaStartMarker);
const kuizIndex = originalBlock.indexOf(kuizStartMarker);

if (notaIndex === -1 || kuizIndex === -1) {
  console.error('Nota or Kuiz markers not found inside originalBlock!');
  process.exit(1);
}

// Extract nota views block (VIEW 3 and VIEW 4)
const notaViewsContent = originalBlock.substring(notaIndex, kuizIndex).trim();

// Remove nota views from video body
const videoBodyBeforeNota = originalBlock.substring(0, notaIndex);
const videoBodyFromKuiz = originalBlock.substring(kuizIndex);

// Update Video container opening tag
let videoBlock = videoBodyBeforeNota + videoBodyFromKuiz;
videoBlock = videoBlock.replace(
  '<div class="floating-ar-anchor pov-ar-anchor hidden" id="pov-ar-anchor">',
  '<!-- =========================================================================\n       FASA 4E-B.1: PANEL POV 1 - VIDEO PEMBELAJARAN (TEMA JINGGA #f97316)\n       ========================================================================= -->\n  <div class="floating-ar-anchor pov-ar-anchor pov-panel-container pov-panel-video hidden" id="pov-panel-video" data-panel-type="video">'
);
videoBlock = videoBlock.replace(
  'FASA 3C: GYROSCOPE POV LOCK PROTOTYPE PANEL & OFF-SCREEN INDICATOR\r\n       =========================================================================',
  'FASA 4E-B.1: PANEL POV 1 - VIDEO PEMBELAJARAN\r\n       ========================================================================='
);
videoBlock = videoBlock.replace(
  'FASA 3C: GYROSCOPE POV LOCK PROTOTYPE PANEL & OFF-SCREEN INDICATOR\n       =========================================================================',
  'FASA 4E-B.1: PANEL POV 1 - VIDEO PEMBELAJARAN\n       ========================================================================='
);

// Update category tag in Video header to Orange theme
videoBlock = videoBlock.replace(
  '<span>KUNCI POV • GIROSKOP 3DoF</span>',
  '<span>1. VIDEO PEMBELAJARAN • POV</span>'
);
videoBlock = videoBlock.replace(
  '<div class="category-tag pov-tag">',
  '<div class="category-tag pov-tag pov-tag-video">'
);
videoBlock = videoBlock.replace(
  '<header class="panel-fixed-header" id="pov-fixed-header">',
  '<header class="panel-fixed-header pov-header-video" id="pov-fixed-header">'
);
videoBlock = videoBlock.replace(
  '<div class="floating-card-container size-medium pov-card-theme is-pinned" id="pov-card-container">',
  '<div class="floating-card-container size-medium pov-card-theme pov-card-video is-pinned" id="pov-card-container">'
);

// Build Nota panel block
const notaPanelBlock = `
  <!-- =========================================================================
       FASA 4E-B.1: PANEL POV 2 - NOTA INTERAKTIF (TEMA TEAL #14b8a6)
       ========================================================================= -->
  <div class="floating-ar-anchor pov-ar-anchor pov-panel-container pov-panel-nota hidden" id="pov-panel-nota" data-panel-type="nota">
    <div class="floating-card-container size-medium pov-card-theme pov-card-nota is-pinned" id="pov-nota-card-container">
      
      <!-- A. FIXED HEADER NOTA -->
      <header class="panel-fixed-header pov-header-nota" id="pov-nota-fixed-header">
        <div class="pov-header-bar">
          <div class="category-tag pov-tag pov-tag-nota">
            <span class="material-symbols-outlined" style="font-size:16px;">auto_stories</span>
            <span>2. NOTA INTERAKTIF • POV</span>
          </div>
          <div class="pov-sensor-pill pov-nota-sensor-pill" id="pov-nota-sensor-pill">
            <div class="ping" id="pov-nota-sensor-ping"></div>
            <span id="pov-nota-sensor-text">Mengesan Sensor...</span>
          </div>
        </div>

        <!-- POV Nota Toolbar: Size presets & Battery Camera Toggle -->
        <div class="pinned-toolbar" id="pov-nota-toolbar">
          <div class="size-controls-group">
            <span class="tool-label">Saiz:</span>
            <div class="size-segmented-control" role="group" aria-label="Ubah saiz panel Nota">
              <button type="button" class="btn-size" data-size="small" id="pov-nota-size-s" title="Saiz Kecil (320px)">S</button>
              <button type="button" class="btn-size is-active" data-size="medium" id="pov-nota-size-m" title="Saiz Sederhana (480px)">M</button>
              <button type="button" class="btn-size" data-size="large" id="pov-nota-size-l" title="Saiz Besar (580px)">L</button>
            </div>
          </div>

          <button type="button" class="btn-cam-toggle" id="pov-nota-btn-toggle-cam" title="Tutup kamera untuk jimat bateri tanpa henti orientasi">
            <span class="material-symbols-outlined" id="pov-nota-cam-icon" style="font-size:15px;">videocam_off</span>
            <span id="pov-nota-cam-text">Tutup Kamera</span>
          </button>
        </div>
      </header>

      <!-- B. SCROLLABLE NOTA BODY -->
      <main class="panel-scrollable-body" id="pov-nota-scrollable-body">
        ${notaViewsContent}
      </main>

      <!-- C. STICKY FOOTER ACTIONS (NOTA) -->
      <footer class="panel-sticky-footer" id="pov-nota-sticky-footer">
        <div class="player-actions-bar">
          <button type="button" class="btn-place-video btn-place-nota" id="pov-nota-btn-anchor" title="Kunci arah orientasi peranti semasa">
            <span class="material-symbols-outlined" id="pov-nota-anchor-icon">my_location</span>
            <span id="pov-nota-anchor-text">Letak di Arah Ini</span>
          </button>

          <button type="button" class="btn-secondary-action" id="pov-nota-btn-change-content" title="Pilih nota lain tanpa keluar mod POV">
            <span class="material-symbols-outlined">sync</span>
            <span>Tukar Nota</span>
          </button>

          <button type="button" class="btn-secondary-action" id="pov-nota-btn-back-pinned" title="Kembali ke Mod Semat pada Skrin">
            <span class="material-symbols-outlined">push_pin</span>
            <span>Semat Skrin</span>
          </button>

          <button type="button" class="btn-secondary-action btn-close-panel" id="pov-nota-btn-close" title="Keluar dari mod POV">
            <span class="material-symbols-outlined">close</span>
            <span>Tutup</span>
          </button>
        </div>
      </footer>

      <!-- Interactive Corner Resize Grip Handle for Nota POV -->
      <div class="corner-resize-handle" id="pov-nota-corner-resize-handle" title="Tarik untuk ubah saiz panel secara bebas">
        <span class="material-symbols-outlined">fit_screen</span>
      </div>

    </div>
  </div>\n\n  `;

const replacement = videoBlock.trim() + '\n\n' + notaPanelBlock;
html = html.substring(0, startIndex) + replacement + html.substring(endIndex);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated code.html with separated #pov-panel-video and #pov-panel-nota!');

