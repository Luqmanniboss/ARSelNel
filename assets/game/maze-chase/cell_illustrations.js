/**
 * ARSelNel - Maze Chase 2D: Misi Sel Haiwan & Tumbuhan
 * Educational SVG Illustrations for Animal & Plant Cells and Organelles
 * Scientifically accurate for KSSM Sains Tingkatan 1
 */

(function(global) {
  'use strict';

  const CellIllustrations = {
    // 1. Sel Haiwan Lengkap (Flexible round/irregular shape, no cell wall, no chloroplast)
    sel_haiwan: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <radialGradient id="ahCytoplasm" cx="45%" cy="45%" r="60%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="85%" stop-color="#fef3c7"/>
              <stop offset="100%" stop-color="#fde68a"/>
            </radialGradient>
            <radialGradient id="ahNucleus" cx="40%" cy="40%" r="55%">
              <stop offset="0%" stop-color="#e9d5ff"/>
              <stop offset="60%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#6b21a8"/>
            </radialGradient>
          </defs>
          <!-- Membran Sel Haiwan (Bentuk fleksibel tidak tetap) -->
          <path d="M 45 40 C 95 20, 160 30, 180 80 C 195 120, 185 165, 150 185 C 115 200, 50 190, 25 155 C 5 120, 10 60, 45 40 Z"
                fill="url(#ahCytoplasm)" stroke="#d97706" stroke-width="4" stroke-linejoin="round"/>
          
          <!-- Sitoplasma berbintik (Ribosom bebas) -->
          <circle cx="55" cy="80" r="1.5" fill="#b45309" opacity="0.5"/>
          <circle cx="70" cy="140" r="1.5" fill="#b45309" opacity="0.5"/>
          <circle cx="150" cy="70" r="1.5" fill="#b45309" opacity="0.5"/>
          <circle cx="140" cy="150" r="1.5" fill="#b45309" opacity="0.5"/>
          
          <!-- Nukleus Pusat Kawalan -->
          <circle cx="105" cy="100" r="32" fill="url(#ahNucleus)" stroke="#581c87" stroke-width="2.5"/>
          <circle cx="100" cy="95" r="11" fill="#4c1d95"/>
          <circle cx="112" cy="90" r="3" fill="#f3e8ff" opacity="0.8"/>
          
          <!-- Mitokondria 1 & 2 -->
          <g transform="translate(50, 110) rotate(-30)">
            <ellipse cx="14" cy="8" rx="14" ry="8" fill="#f87171" stroke="#b91c1c" stroke-width="1.8"/>
            <path d="M 5 8 Q 9 4, 14 8 T 23 8" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          </g>
          <g transform="translate(135, 110) rotate(25)">
            <ellipse cx="13" cy="7" rx="13" ry="7" fill="#f87171" stroke="#b91c1c" stroke-width="1.8"/>
            <path d="M 4 7 Q 8 3, 13 7 T 22 7" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          </g>
          
          <!-- Jasad Golgi & Vesikel -->
          <path d="M 65 52 Q 80 48, 95 55" stroke="#ea580c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 68 58 Q 80 54, 92 60" stroke="#ea580c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <circle cx="102" cy="56" r="2.5" fill="#ea580c"/>
          <circle cx="62" cy="54" r="2" fill="#ea580c"/>
          
          <!-- Vakuol Kecil (jika ada pada sel haiwan) -->
          <circle cx="140" cy="55" r="6" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2" opacity="0.85"/>
        </svg>
      `;
    },

    // 2. Sel Tumbuhan Lengkap (Rigid cellulose cell wall, large central vacuole, green chloroplasts)
    sel_tumbuhan: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <radialGradient id="plVacuole" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="#e0f2fe"/>
              <stop offset="70%" stop-color="#bae6fd"/>
              <stop offset="100%" stop-color="#7dd3fc"/>
            </radialGradient>
            <linearGradient id="plChloroplast" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4ade80"/>
              <stop offset="100%" stop-color="#15803d"/>
            </linearGradient>
          </defs>
          <!-- Dinding Sel Selulosa Luar (Tebal & Tetap) -->
          <polygon points="20,18 180,18 190,182 10,182" fill="#dcfce7" stroke="#15803d" stroke-width="7" stroke-linejoin="round"/>
          <!-- Membran Sel Dalam -->
          <polygon points="26,24 174,24 183,176 17,176" fill="#f0fdf4" stroke="#22c55e" stroke-width="2" stroke-linejoin="round"/>
          
          <!-- Vakuol Pusat Besar (Sap Sel) -->
          <ellipse cx="115" cy="110" rx="46" ry="34" fill="url(#plVacuole)" stroke="#0284c7" stroke-width="2"/>
          <text x="115" y="113" font-size="8" fill="#0369a1" font-weight="bold" text-anchor="middle" opacity="0.7">Sap Sel</text>
          
          <!-- Nukleus di Sisi Tepi -->
          <circle cx="62" cy="70" r="20" fill="#a855f7" stroke="#6b21a8" stroke-width="2"/>
          <circle cx="58" cy="67" r="7" fill="#4c1d95"/>
          <circle cx="65" cy="64" r="2.5" fill="#f3e8ff"/>
          
          <!-- Kloroplas Hijau (Mengandungi Klorofil) -->
          <g transform="translate(138, 42) rotate(15)">
            <ellipse cx="12" cy="7" rx="12" ry="7" fill="url(#plChloroplast)" stroke="#14532d" stroke-width="1.5"/>
            <line x1="4" y1="7" x2="20" y2="7" stroke="#86efac" stroke-width="1"/>
          </g>
          <g transform="translate(142, 148) rotate(-15)">
            <ellipse cx="12" cy="7" rx="12" ry="7" fill="url(#plChloroplast)" stroke="#14532d" stroke-width="1.5"/>
            <line x1="4" y1="7" x2="20" y2="7" stroke="#86efac" stroke-width="1"/>
          </g>
          <g transform="translate(48, 142) rotate(25)">
            <ellipse cx="11" cy="6.5" rx="11" ry="6.5" fill="url(#plChloroplast)" stroke="#14532d" stroke-width="1.5"/>
            <line x1="3" y1="6.5" x2="19" y2="6.5" stroke="#86efac" stroke-width="1"/>
          </g>

          <!-- Mitokondria Sel Tumbuhan -->
          <g transform="translate(80, 36) rotate(-20)">
            <ellipse cx="9" cy="5" rx="9" ry="5" fill="#f87171" stroke="#b91c1c" stroke-width="1.2"/>
            <path d="M 3 5 Q 6 2, 9 5 T 15 5" stroke="#ffffff" stroke-width="1" fill="none"/>
          </g>
        </svg>
      `;
    },

    // 3. Dinding Sel (Cell Wall detail)
    dinding_sel: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <pattern id="celluloseMesh" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 0 8 L 16 8 M 8 0 L 8 16" stroke="#16a34a" stroke-width="1.5" opacity="0.6"/>
              <circle cx="8" cy="8" r="2" fill="#15803d"/>
            </pattern>
          </defs>
          <rect x="25" y="30" width="150" height="140" rx="18" fill="#dcfce7" stroke="#15803d" stroke-width="8"/>
          <rect x="35" y="40" width="130" height="120" rx="12" fill="url(#celluloseMesh)"/>
          <rect x="50" y="55" width="100" height="90" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="3" stroke-dasharray="4 4"/>
          <text x="100" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#14532d" text-anchor="middle">Serabut Selulosa</text>
        </svg>
      `;
    },

    // 4. Nukleus (Nucleus detail)
    nukleus: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <radialGradient id="nucGlow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#f3e8ff"/>
              <stop offset="45%" stop-color="#c084fc"/>
              <stop offset="85%" stop-color="#7e22ce"/>
              <stop offset="100%" stop-color="#4c1d95"/>
            </radialGradient>
          </defs>
          <!-- Membran Nukleus Dwiselaput dengan Liang Nukleus -->
          <circle cx="100" cy="100" r="70" fill="url(#nucGlow)" stroke="#581c87" stroke-width="4" stroke-dasharray="14 3"/>
          <!-- Kromatin / Gentian DNA -->
          <path d="M 55 90 Q 75 70, 95 90 T 135 85" stroke="#9333ea" stroke-width="3" fill="none" opacity="0.7"/>
          <path d="M 65 115 Q 90 135, 120 115 T 145 125" stroke="#9333ea" stroke-width="3" fill="none" opacity="0.7"/>
          <!-- Nukleolus Padat -->
          <circle cx="100" cy="98" r="24" fill="#3b0764" stroke="#581c87" stroke-width="2"/>
          <circle cx="108" cy="90" r="5" fill="#e9d5ff" opacity="0.6"/>
          <text x="100" y="155" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#fae8ff" text-anchor="middle">DNA & Kromosom</text>
        </svg>
      `;
    },

    // 5. Membran Sel (Cell Membrane detail)
    membran_sel: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <!-- Lapisan Dwilapisan Fosfolipid -->
          <rect x="20" y="70" width="160" height="60" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
          <!-- Kepala Hidrofilik & Ekor Hidrofobik -->
          <g fill="#f59e0b" stroke="#b45309" stroke-width="1">
            <circle cx="40" cy="78" r="6"/><line x1="40" y1="84" x2="40" y2="96"/>
            <circle cx="60" cy="78" r="6"/><line x1="60" y1="84" x2="60" y2="96"/>
            <circle cx="120" cy="78" r="6"/><line x1="120" y1="84" x2="120" y2="96"/>
            <circle cx="140" cy="78" r="6"/><line x1="140" y1="84" x2="140" y2="96"/>
            <circle cx="160" cy="78" r="6"/><line x1="160" y1="84" x2="160" y2="96"/>
            <!-- Lapisan bawah -->
            <circle cx="40" cy="122" r="6"/><line x1="40" y1="116" x2="40" y2="104"/>
            <circle cx="60" cy="122" r="6"/><line x1="60" y1="116" x2="60" y2="104"/>
            <circle cx="120" cy="122" r="6"/><line x1="120" y1="116" x2="120" y2="104"/>
            <circle cx="140" cy="122" r="6"/><line x1="140" y1="116" x2="140" y2="104"/>
            <circle cx="160" cy="122" r="6"/><line x1="160" y1="116" x2="160" y2="104"/>
          </g>
          <!-- Protein Pembawa / Saluran Pengangkutan -->
          <rect x="80" y="62" width="26" height="76" rx="6" fill="#38bdf8" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M 93 62 V 138" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 2"/>
          <!-- Label Arah Keluar Masuk -->
          <text x="100" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">Luar Sel ➔</text>
          <text x="100" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">Dalam Sel (Sitoplasma)</text>
        </svg>
      `;
    },

    // 6. Kloroplas (Chloroplast detail)
    kloroplas: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <linearGradient id="chloroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#86efac"/>
              <stop offset="50%" stop-color="#22c55e"/>
              <stop offset="100%" stop-color="#15803d"/>
            </linearGradient>
          </defs>
          <!-- Badan Kloroplas Bujur -->
          <ellipse cx="100" cy="100" rx="76" ry="48" fill="url(#chloroGrad)" stroke="#14532d" stroke-width="4"/>
          <ellipse cx="100" cy="100" rx="68" ry="41" fill="none" stroke="#166534" stroke-width="2"/>
          
          <!-- Timbunan Grana (Thylakoids) -->
          <!-- Granum 1 -->
          <rect x="52" y="80" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="52" y="88" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="52" y="96" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="52" y="104" width="22" height="6" rx="2" fill="#14532d"/>

          <!-- Granum 2 -->
          <rect x="89" y="76" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="89" y="84" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="89" y="92" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="89" y="100" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="89" y="108" width="22" height="6" rx="2" fill="#14532d"/>

          <!-- Granum 3 -->
          <rect x="126" y="82" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="126" y="90" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="126" y="98" width="22" height="6" rx="2" fill="#14532d"/>
          <rect x="126" y="106" width="22" height="6" rx="2" fill="#14532d"/>

          <!-- Lamela Penyambung -->
          <line x1="74" y1="92" x2="89" y2="92" stroke="#14532d" stroke-width="2"/>
          <line x1="111" y1="96" x2="126" y2="96" stroke="#14532d" stroke-width="2"/>

          <!-- Sinaran Cahaya Mentari -->
          <path d="M 40 40 L 60 60" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
          <path d="M 65 30 L 78 55" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
          <text x="100" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">Klorofil & Fotosintesis</text>
        </svg>
      `;
    },

    // 7. Vakuol (Vacuole detail)
    vakuol: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <radialGradient id="vacGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#f0f9ff"/>
              <stop offset="40%" stop-color="#bae6fd"/>
              <stop offset="85%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </radialGradient>
          </defs>
          <!-- Membran Tonoplas & Cecair Sap Sel -->
          <ellipse cx="100" cy="100" rx="75" ry="58" fill="url(#vacGrad)" stroke="#0369a1" stroke-width="4"/>
          <!-- Kilauan Pantulan Cecair -->
          <ellipse cx="78" cy="75" rx="28" ry="14" fill="#ffffff" opacity="0.45" transform="rotate(-20, 78, 75)"/>
          <!-- Butiran Gula & Ion Terlarut -->
          <circle cx="110" cy="95" r="4" fill="#0284c7" opacity="0.7"/>
          <circle cx="85" cy="120" r="3" fill="#0284c7" opacity="0.7"/>
          <circle cx="130" cy="115" r="3.5" fill="#0284c7" opacity="0.7"/>
          <text x="100" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#0c4a6e" text-anchor="middle">Sap Sel (Tekanan Segah)</text>
        </svg>
      `;
    },

    // 8. Mitokondria (Mitochondria detail)
    mitokondria: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fca5a5"/>
              <stop offset="50%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#b91c1c"/>
            </linearGradient>
          </defs>
          <!-- Membran Luar Bujur Kacang -->
          <ellipse cx="100" cy="100" rx="74" ry="46" fill="url(#mitoGrad)" stroke="#991b1b" stroke-width="4" transform="rotate(-15, 100, 100)"/>
          <!-- Lipatan Membran Dalam (Cristae) -->
          <g transform="rotate(-15, 100, 100)">
            <path d="M 45 92 Q 65 75, 80 92 T 115 90 T 145 92" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M 50 108 Q 75 125, 95 108 T 130 110 T 150 106" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g>
          <!-- Simbol Tenaga Kilat ATP -->
          <polygon points="100,42 90,62 98,62 94,80 108,58 100,58" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
          <text x="100" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="bold" fill="#991b1b" text-anchor="middle">Penjana Tenaga (ATP)</text>
        </svg>
      `;
    },

    // 9. Sitoplasma (Cytoplasm detail)
    sitoplasma: function(width = 160, height = 160) {
      return `
        <svg viewBox="0 0 200 200" width="${width}" height="${height}" class="cell-illustration-svg drop-shadow-md">
          <defs>
            <radialGradient id="cytoBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fef9c3"/>
              <stop offset="80%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#facc15"/>
            </radialGradient>
          </defs>
          <rect x="25" y="25" width="150" height="150" rx="30" fill="url(#cytoBg)" stroke="#ca8a04" stroke-width="4"/>
          <!-- Arus Sitoplasma (Cytoplasmic Streaming) -->
          <path d="M 45 65 Q 85 45, 125 65 T 155 105" stroke="#eab308" stroke-width="3" fill="none" stroke-dasharray="6 3"/>
          <path d="M 45 135 Q 85 155, 125 135 T 155 95" stroke="#eab308" stroke-width="3" fill="none" stroke-dasharray="6 3"/>
          <circle cx="65" cy="90" r="5" fill="#f97316"/>
          <circle cx="135" cy="80" r="4" fill="#06b6d4"/>
          <circle cx="100" cy="130" r="4.5" fill="#84cc16"/>
          <circle cx="80" cy="110" r="3" fill="#a855f7"/>
          <text x="100" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="bold" fill="#854d0e" text-anchor="middle">Medium Jeli Biokimia</text>
        </svg>
      `;
    }
  };

  // Helper function to return SVG string or container
  function getIllustration(type, width = 160, height = 160) {
    if (CellIllustrations[type]) {
      return CellIllustrations[type](width, height);
    }
    return CellIllustrations.sel_haiwan(width, height);
  }

  global.ARSelNelCellIllustrations = {
    getIllustration,
    illustrations: CellIllustrations
  };

})(window);
