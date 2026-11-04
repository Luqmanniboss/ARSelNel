/**
 * Script untuk menjana set ilustrasi 3D vector SVG rasmi untuk Lobi Makmal Sains ARSELNEL
 * Memastikan 100% latar belakang transparent, visual 3D berkilat bergaya kartun pendidikan,
 * dan pengoptimuman untuk animasi CSS.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../assets/images/lobby');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// ============================================================================
// 1. HERO - SEL HAIWAN 3D (hero-animal-cell.svg)
// ============================================================================
const heroAnimalCellSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
  <defs>
    <!-- Bayang 3D Lembut -->
    <filter id="softGlowAnimal" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0284c7" flood-opacity="0.25"/>
    </filter>
    <filter id="specularGleam" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#ffffff" flood-opacity="0.8"/>
    </filter>

    <!-- Kecerunan Membran & Sitoplasma Sel Haiwan -->
    <radialGradient id="gradAnimalOuter" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="45%" stop-color="#38bdf8"/>
      <stop offset="85%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <!-- Kecerunan Bahagian Keratan Rentas Dalam -->
    <radialGradient id="gradAnimalInner" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="60%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </radialGradient>

    <!-- Nukleus Ungu 3D -->
    <radialGradient id="gradNucleus" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e9d5ff"/>
      <stop offset="40%" stop-color="#c084fc"/>
      <stop offset="80%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </radialGradient>

    <!-- Nukleolus Merah Jambu Dalam -->
    <radialGradient id="gradNucleolus" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="70%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </radialGradient>

    <!-- Mitokondrion Oren 3D -->
    <linearGradient id="gradMito" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="40%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>

    <!-- Jasad Golgi Kuning/Oren -->
    <linearGradient id="gradGolgi" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Sel Haiwan Utama Sfera 3D dengan Irisan Keratan Rentas -->
  <g filter="url(#softGlowAnimal)">
    <!-- Membran Luar (Bulatan Utama) -->
    <circle cx="80" cy="80" r="64" fill="url(#gradAnimalOuter)"/>
    
    <!-- Keratan Rentas Dalam (Sitoplasma) -->
    <path d="M80 18 C114 18 142 46 142 80 C142 114 114 142 80 142 C46 142 22 116 20 84 C48 88 74 62 80 18 Z" fill="url(#gradAnimalInner)" opacity="0.95"/>

    <!-- Jalur Membran Berlapis (Dwi-lapisan Lipid) -->
    <circle cx="80" cy="80" r="64" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.5" fill="none"/>
    <circle cx="80" cy="80" r="61" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.7" fill="none"/>

    <!-- Nukleus 3D Berkunci di Tengah Keratan Rentas -->
    <g transform="translate(74, 76)">
      <!-- Membran Nukleus -->
      <circle cx="0" cy="0" r="28" fill="url(#gradNucleus)"/>
      <circle cx="0" cy="0" r="28" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6" fill="none"/>
      <!-- Liang Nukleus Kecil -->
      <circle cx="-16" cy="-8" r="1.5" fill="#581c87" opacity="0.6"/>
      <circle cx="12" cy="-14" r="1.5" fill="#581c87" opacity="0.6"/>
      <circle cx="18" cy="10" r="1.5" fill="#581c87" opacity="0.6"/>
      <circle cx="-10" cy="18" r="1.5" fill="#581c87" opacity="0.6"/>
      <!-- Nukleolus Sfera Dalam -->
      <circle cx="-4" cy="-4" r="12" fill="url(#gradNucleolus)"/>
      <ellipse cx="-7" cy="-7" rx="4" ry="2.5" fill="#ffffff" opacity="0.75"/>
    </g>

    <!-- Mitokondrion 1 (Kiri Atas) -->
    <g transform="translate(42, 54) rotate(-25)">
      <rect x="-14" y="-8" width="28" height="16" rx="8" fill="url(#gradMito)"/>
      <!-- Krista Berlipat -->
      <path d="M-8 -5 Q-5 -2 -8 1 M-2 -6 Q1 -2 -2 2 M4 -5 Q7 -2 4 1" stroke="#ffedd5" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <ellipse cx="-6" cy="-4" rx="4" ry="1.5" fill="#ffffff" opacity="0.7"/>
    </g>

    <!-- Mitokondrion 2 (Kanan Bawah) -->
    <g transform="translate(112, 106) rotate(35)">
      <rect x="-12" y="-7" width="24" height="14" rx="7" fill="url(#gradMito)"/>
      <path d="M-6 -4 Q-3 -1 -6 2 M0 -5 Q3 -1 0 3 M6 -4 Q9 -1 6 2" stroke="#ffedd5" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Jasad Golgi 3D (Kanan Atas) -->
    <g transform="translate(110, 56) rotate(15)">
      <path d="M-10 -8 C-2 -12 10 -8 12 -4 C10 0 -2 -4 -10 0 Z" fill="url(#gradGolgi)"/>
      <path d="M-12 -2 C-3 -6 12 -2 14 2 C12 6 -3 2 -12 6 Z" fill="url(#gradGolgi)"/>
      <path d="M-10 4 C-2 1 10 4 12 8 C10 11 -2 8 -10 10 Z" fill="url(#gradGolgi)"/>
      <!-- Vesikel kecil terapung -->
      <circle cx="18" cy="-5" r="2.5" fill="#f59e0b"/>
      <circle cx="16" cy="7" r="2" fill="#fbbf24"/>
      <circle cx="-14" cy="5" r="2" fill="#f59e0b"/>
    </g>

    <!-- Vakuol Kecil & Lisosom -->
    <circle cx="48" cy="98" r="6" fill="#a7f3d0" stroke="#34d399" stroke-width="1.5"/>
    <ellipse cx="46" cy="96" rx="2" ry="1" fill="#ffffff" opacity="0.8"/>
    <circle cx="58" cy="118" r="4.5" fill="#fbcfe8" stroke="#f43f5e" stroke-width="1.2"/>

    <!-- Sorotan Cahaya Kilat 3D Specular (Glossy Top Highlight) -->
    <path d="M38 32 C52 22 72 18 92 20 C82 26 56 34 38 48 C36 42 36 37 38 32 Z" fill="#ffffff" opacity="0.65" filter="url(#specularGleam)"/>
    <circle cx="34" cy="46" r="3" fill="#ffffff" opacity="0.8"/>
  </g>
</svg>`;

// ============================================================================
// 2. HERO - SEL TUMBUHAN 3D (hero-plant-cell.svg)
// ============================================================================
const heroPlantCellSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
  <defs>
    <!-- Bayang 3D Hijau -->
    <filter id="softGlowPlant" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#15803d" flood-opacity="0.25"/>
    </filter>

    <!-- Dinding Sel Hijau Tegar 3D -->
    <linearGradient id="gradCellWall" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="40%" stop-color="#4ade80"/>
      <stop offset="85%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>

    <!-- Sitoplasma Hijau Lembut -->
    <radialGradient id="gradPlantCytoplasm" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#dcfce7"/>
      <stop offset="60%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#86efac"/>
    </radialGradient>

    <!-- Vakuol Besar Biru Aqua 3D -->
    <radialGradient id="gradPlantVacuole" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="40%" stop-color="#7dd3fc"/>
      <stop offset="85%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <!-- Kloroplas Hijau Zamrud -->
    <radialGradient id="gradChloroplast" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="45%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </radialGradient>

    <!-- Nukleus Ungu Tumbuhan -->
    <radialGradient id="gradPlantNucleus" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f3e8ff"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </radialGradient>
  </defs>

  <g filter="url(#softGlowPlant)">
    <!-- Dinding Sel Poligon Luar Tegar (Bentuk Khas Sel Tumbuhan Bersegi Bulat) -->
    <polygon points="40,20 120,18 146,52 142,118 116,144 38,142 16,108 18,48" 
             fill="url(#gradCellWall)" rx="16"/>

    <!-- Lapisan Membran Plasma Dalam -->
    <polygon points="42,26 116,24 138,54 134,114 112,136 42,134 24,104 26,52" 
             fill="url(#gradPlantCytoplasm)" stroke="#16a34a" stroke-width="2"/>

    <!-- Jalur Sudut 3D Bevel pada Dinding Sel -->
    <path d="M40 20 L42 26 M120 18 L116 24 M146 52 L138 54 M142 118 L134 114 M116 144 L112 136 M38 142 L42 134 M16 108 L24 104 M18 48 L26 52" 
          stroke="#bbf7d0" stroke-width="2" stroke-linecap="round"/>

    <!-- Vakuol Sentral Besar 3D (Ciri Utama Sel Tumbuhan) -->
    <g transform="translate(68, 86)">
      <ellipse cx="0" cy="0" rx="36" ry="26" fill="url(#gradPlantVacuole)" opacity="0.92"/>
      <ellipse cx="-12" cy="-8" rx="14" ry="6" fill="#ffffff" opacity="0.55"/>
      <circle cx="-16" cy="-4" r="3" fill="#ffffff" opacity="0.8"/>
      <!-- Sempadan Cecair Tonoplas Halus -->
      <ellipse cx="0" cy="0" rx="36" ry="26" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.6" fill="none"/>
    </g>

    <!-- Nukleus Sfera di Tepi (Ditolak ke sisi oleh Vakuol) -->
    <g transform="translate(112, 54)">
      <circle cx="0" cy="0" r="15" fill="url(#gradPlantNucleus)"/>
      <circle cx="0" cy="0" r="15" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" fill="none"/>
      <!-- Anak Nukleus -->
      <circle cx="-3" cy="-3" r="5" fill="#f43f5e"/>
      <ellipse cx="-5" cy="-5" rx="3" ry="1.5" fill="#ffffff" opacity="0.8"/>
    </g>

    <!-- Kloroplas 1 (Kiri Atas) -->
    <g transform="translate(42, 50) rotate(-35)">
      <ellipse cx="0" cy="0" rx="13" ry="8" fill="url(#gradChloroplast)"/>
      <!-- Grana / Tilakoid Dalam Kloroplas -->
      <ellipse cx="-4" cy="0" rx="2" ry="4" fill="#14532d"/>
      <ellipse cx="2" cy="0" rx="2" ry="4" fill="#14532d"/>
      <ellipse cx="7" cy="0" rx="1.5" ry="3" fill="#14532d"/>
      <ellipse cx="-4" cy="-3" rx="5" ry="1.5" fill="#ffffff" opacity="0.6"/>
    </g>

    <!-- Kloroplas 2 (Kiri Bawah) -->
    <g transform="translate(40, 112) rotate(25)">
      <ellipse cx="0" cy="0" rx="12" ry="7" fill="url(#gradChloroplast)"/>
      <ellipse cx="-3" cy="0" rx="1.8" ry="3.5" fill="#14532d"/>
      <ellipse cx="3" cy="0" rx="1.8" ry="3.5" fill="#14532d"/>
      <ellipse cx="-3" cy="-2.5" rx="4" ry="1.2" fill="#ffffff" opacity="0.6"/>
    </g>

    <!-- Kloroplas 3 (Kanan Bawah) -->
    <g transform="translate(108, 114) rotate(-20)">
      <ellipse cx="0" cy="0" rx="11" ry="7" fill="url(#gradChloroplast)"/>
      <ellipse cx="-2" cy="0" rx="1.8" ry="3" fill="#14532d"/>
      <ellipse cx="3" cy="0" rx="1.8" ry="3" fill="#14532d"/>
    </g>

    <!-- Mitokondrion Sel Tumbuhan (Bawah) -->
    <g transform="translate(68, 126) rotate(5)">
      <rect x="-9" y="-5" width="18" height="10" rx="5" fill="#ea580c"/>
      <path d="M-5 -2 Q-3 0 -5 2 M0 -2 Q2 0 0 2 M5 -2 Q7 0 5 2" stroke="#fed7aa" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Sorotan Glossy Bucu Atas -->
    <path d="M42 22 L112 20 C95 24 60 26 38 34 Z" fill="#ffffff" opacity="0.75"/>
  </g>
</svg>`;

// ============================================================================
// 3. HERO - ROBOT MASKOT ARSELNEL (hero-robot.svg)
// ============================================================================
const heroRobotSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170" width="160" height="170" fill="none">
  <defs>
    <!-- Bayang 3D Robot -->
    <filter id="softGlowRobot" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="7" flood-color="#0284c7" flood-opacity="0.3"/>
    </filter>

    <!-- Badan Robot Putih Mutiara 3D -->
    <radialGradient id="gradRobotBody" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f1f5f9"/>
      <stop offset="85%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>

    <!-- Pelindung Visor Muka Kaca Hitam Berkilat -->
    <linearGradient id="gradVisor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Aksen Cyan LED Menyala -->
    <linearGradient id="gradCyanLED" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>

    <!-- Aksen Oren Maskot -->
    <linearGradient id="gradRobotOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>

    <!-- Aksen Biru Maskot -->
    <linearGradient id="gradRobotBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>

  <g filter="url(#softGlowRobot)">
    <!-- Antena Atas dengan Bebola Bercahaya Cyan -->
    <g transform="translate(80, 24)">
      <rect x="-3" y="0" width="6" height="12" rx="3" fill="#cbd5e1"/>
      <circle cx="0" cy="-4" r="7" fill="url(#gradCyanLED)"/>
      <circle cx="-2" cy="-6" r="2.5" fill="#ffffff" opacity="0.8"/>
    </g>

    <!-- Fon Telinga 3D Kiri & Kanan (Earpads) -->
    <!-- Telinga Kiri -->
    <g transform="translate(26, 68)">
      <rect x="-6" y="-14" width="12" height="28" rx="6" fill="url(#gradRobotOrange)"/>
      <circle cx="0" cy="0" r="4" fill="url(#gradCyanLED)"/>
    </g>
    <!-- Telinga Kanan -->
    <g transform="translate(134, 68)">
      <rect x="-6" y="-14" width="12" height="28" rx="6" fill="url(#gradRobotOrange)"/>
      <circle cx="0" cy="0" r="4" fill="url(#gradCyanLED)"/>
    </g>

    <!-- Kepala Robot Sfera Lonjong 3D -->
    <ellipse cx="80" cy="68" rx="52" ry="42" fill="url(#gradRobotBody)"/>
    <!-- Bayang Tepi Kepala -->
    <ellipse cx="80" cy="68" rx="52" ry="42" stroke="#e2e8f0" stroke-width="2" fill="none"/>

    <!-- Skrin Muka Kaca Hitam (Visor) -->
    <g transform="translate(80, 70)">
      <rect x="-38" y="-24" width="76" height="48" rx="20" fill="url(#gradVisor)"/>
      <rect x="-38" y="-24" width="76" height="48" rx="20" stroke="#334155" stroke-width="1.5" fill="none"/>

      <!-- Mata Digital Cyan Melengkung Gembira (Happy ^ ^ Digital Eyes) -->
      <!-- Mata Kiri -->
      <path d="M-24 -2 C-22 -10 -12 -10 -10 -2" stroke="url(#gradCyanLED)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="-17" cy="4" r="2" fill="#22d3ee"/>
      <!-- Mata Kanan -->
      <path d="M10 -2 C12 -10 22 -10 24 -2" stroke="url(#gradCyanLED)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="17" cy="4" r="2" fill="#22d3ee"/>

      <!-- Mulut Senyum Comel Mini -->
      <path d="M-6 10 Q0 15 6 10" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" fill="none"/>

      <!-- Pantulan Kaca Specular Diagonal pada Skrin -->
      <path d="M-30 -18 L18 -18 L6 18 L-30 18 Z" fill="#ffffff" opacity="0.08"/>
      <ellipse cx="-22" cy="-16" rx="8" ry="3" fill="#ffffff" opacity="0.35"/>
    </g>

    <!-- Badan Robot 3D -->
    <g transform="translate(80, 130)">
      <!-- Leher Sendi Halus -->
      <rect x="-14" y="-24" width="28" height="10" rx="4" fill="#64748b"/>

      <!-- Torso Putih 3D Bulat -->
      <ellipse cx="0" cy="0" rx="36" ry="26" fill="url(#gradRobotBody)"/>
      <ellipse cx="0" cy="0" rx="36" ry="26" stroke="#e2e8f0" stroke-width="1.5" fill="none"/>

      <!-- Lambang Reaktor Atom / Sains ARSELNEL di Dada -->
      <circle cx="0" cy="0" r="12" fill="url(#gradRobotBlue)"/>
      <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.9"/>
      <!-- Tiga Garisan Orbit Atom -->
      <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#0284c7" stroke-width="1.2" fill="none"/>
      <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#0284c7" stroke-width="1.2" fill="none" transform="rotate(60)"/>
      <ellipse cx="0" cy="0" rx="10" ry="4" stroke="#0284c7" stroke-width="1.2" fill="none" transform="rotate(120)"/>
      <circle cx="0" cy="0" r="2" fill="#f97316"/>

      <!-- Aksen Pinggang Jingga -->
      <path d="M-22 18 Q0 24 22 18" stroke="url(#gradRobotOrange)" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>

    <!-- Tangan Robot Kanan Thumbs-Up Comel (Melambai / Syabas) -->
    <g transform="translate(132, 118)">
      <!-- Lengan Putih -->
      <path d="M-10 8 Q6 10 10 -4" stroke="url(#gradRobotBody)" stroke-width="12" stroke-linecap="round" fill="none"/>
      <!-- Sendi Lengan -->
      <circle cx="-10" cy="8" r="6" fill="url(#gradRobotBlue)"/>
      <!-- Tangan Sarung Penumbuk dengan Ibu Jari Naik (Thumbs-Up) -->
      <circle cx="12" cy="-6" r="10" fill="url(#gradRobotOrange)"/>
      <!-- Ibu Jari -->
      <rect x="8" y="-18" width="8" height="14" rx="4" fill="url(#gradRobotOrange)"/>
      <circle cx="12" cy="-18" r="4" fill="#fb923c"/>
      <!-- Penyerlah Putih -->
      <ellipse cx="10" cy="-8" rx="4" ry="2" fill="#ffffff" opacity="0.6"/>
    </g>

    <!-- Tangan Kiri Rehat Comel -->
    <g transform="translate(28, 126)">
      <path d="M10 2 Q-4 4 -8 14" stroke="url(#gradRobotBody)" stroke-width="11" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="2" r="5.5" fill="url(#gradRobotBlue)"/>
      <circle cx="-8" cy="14" r="8" fill="url(#gradRobotOrange)"/>
      <ellipse cx="-8" cy="12" rx="3" ry="1.5" fill="#ffffff" opacity="0.6"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// 4. MOD A - JELAJAH MAKMAL 3D (mode-a-3d-lab.svg)
// ============================================================================
const modeA3dLabSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 130" width="140" height="130" fill="none">
  <defs>
    <!-- Bayang 3D Mod A -->
    <filter id="glowModA" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#2563eb" flood-opacity="0.28"/>
    </filter>

    <!-- Monitor Badan Putih/Perak -->
    <linearGradient id="gradMonitorBezel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>

    <!-- Skrin Makmal Maya Cyan Hologram -->
    <linearGradient id="gradLabScreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#082f49"/>
      <stop offset="50%" stop-color="#0c4a6e"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Game Controller Ungu & Biru 3D -->
    <linearGradient id="gradController" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>

    <!-- Butang A/B/X/Y Controller -->
    <radialGradient id="gradBtnYellow" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#eab308"/>
    </radialGradient>
    <radialGradient id="gradBtnGreen" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </radialGradient>
  </defs>

  <g filter="url(#glowModA)">
    <!-- Monitor Komputer 3D (Belakang) -->
    <g transform="translate(70, 48)">
      <!-- Kaki & Tapak Monitor 3D -->
      <ellipse cx="0" cy="38" rx="26" ry="7" fill="#64748b"/>
      <ellipse cx="0" cy="37" rx="24" ry="5.5" fill="#cbd5e1"/>
      <path d="M-6 16 L6 16 L8 36 L-8 36 Z" fill="#94a3b8"/>

      <!-- Rangka Monitor (Bezel) -->
      <rect x="-48" y="-38" width="96" height="64" rx="10" fill="url(#gradMonitorBezel)"/>
      <rect x="-48" y="-38" width="96" height="64" rx="10" stroke="#cbd5e1" stroke-width="1.5" fill="none"/>

      <!-- Skrin Makmal 3D Maya -->
      <rect x="-42" y="-32" width="84" height="52" rx="6" fill="url(#gradLabScreen)"/>

      <!-- Grid Lantai Makmal Maya Cyan -->
      <path d="M-42 6 L42 6 M-42 12 L42 12 M-42 18 L42 18" stroke="#38bdf8" stroke-width="0.8" opacity="0.4"/>
      <path d="M-36 20 L-22 6 M-12 20 L-6 6 M12 20 L6 6 M36 20 L22 6" stroke="#38bdf8" stroke-width="0.8" opacity="0.4"/>

      <!-- Hologram Prisma Berlian Sel di Tengah Skrin -->
      <polygon points="0,-22 14,-10 0,2 -14,-10" fill="#38bdf8" opacity="0.6"/>
      <polygon points="0,-18 10,-8 0,0 -10,-8" fill="#a5f3fc" opacity="0.85"/>
      <circle cx="0" cy="-9" r="4" fill="#ffffff"/>
      <!-- Lingkaran Orbit Hologram -->
      <ellipse cx="0" cy="-9" rx="22" ry="6" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="3 2" fill="none"/>

      <!-- Pantulan Kaca Monitor Atas -->
      <path d="M-40 -30 L38 -30 L-8 6 L-40 6 Z" fill="#ffffff" opacity="0.12"/>

      <!-- LED Kuasa Monitor Cyan -->
      <circle cx="0" cy="26" r="1.5" fill="#22d3ee"/>
    </g>

    <!-- Game Controller 3D Terapung di Hadapan (Floating Joypad) -->
    <g transform="translate(70, 94)">
      <!-- Bentuk Asas Controller Ergonomik -->
      <path d="M-34 -14 C-20 -18 20 -18 34 -14 C44 -10 46 16 34 22 C26 26 18 14 12 14 C6 14 -6 14 -12 14 C-18 14 -26 26 -34 22 C-46 16 -44 -10 -34 -14 Z" 
            fill="url(#gradController)"/>
      <path d="M-34 -14 C-20 -18 20 -18 34 -14 C44 -10 46 16 34 22 C26 26 18 14 12 14 C6 14 -6 14 -12 14 C-18 14 -26 26 -34 22 C-46 16 -44 -10 -34 -14 Z" 
            stroke="#c084fc" stroke-width="1.5" fill="none"/>

      <!-- D-Pad Kiri (Palang Arah Hitam) -->
      <g transform="translate(-20, 2)">
        <rect x="-3" y="-8" width="6" height="16" rx="2" fill="#1e1b4b"/>
        <rect x="-8" y="-3" width="16" height="6" rx="2" fill="#1e1b4b"/>
        <circle cx="0" cy="0" r="2.5" fill="#475569"/>
      </g>

      <!-- Butang Tindakan Kanan (4 Butang Berwarna Warni) -->
      <g transform="translate(20, 2)">
        <circle cx="0" cy="-6" r="3.2" fill="url(#gradBtnYellow)"/> <!-- Top (Y) -->
        <circle cx="6" cy="0" r="3.2" fill="#f43f5e"/> <!-- Right (B) -->
        <circle cx="0" cy="6" r="3.2" fill="url(#gradBtnGreen)"/> <!-- Bottom (A) -->
        <circle cx="-6" cy="0" r="3.2" fill="#38bdf8"/> <!-- Left (X) -->
      </g>

      <!-- Dua Thumbstick Analog Berkubah -->
      <g transform="translate(-8, 10)">
        <circle cx="0" cy="0" r="5" fill="#1e1b4b"/>
        <circle cx="-1" cy="-1" r="3.5" fill="#475569"/>
        <ellipse cx="-1.5" cy="-1.5" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.5"/>
      </g>
      <g transform="translate(8, 10)">
        <circle cx="0" cy="0" r="5" fill="#1e1b4b"/>
        <circle cx="-1" cy="-1" r="3.5" fill="#475569"/>
        <ellipse cx="-1.5" cy="-1.5" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.5"/>
      </g>

      <!-- Butang Home ARSELNEL di Tengah Berlampu -->
      <circle cx="0" cy="-4" r="3.5" fill="#06b6d4"/>
      <circle cx="0" cy="-4" r="1.5" fill="#ffffff"/>

      <!-- Penyerlah Glos Controller Atas -->
      <path d="M-22 -14 C-10 -16 10 -16 22 -14" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
    </g>

    <!-- Sparkle Kecil Kanan Atas -->
    <g transform="translate(122, 28)">
      <path d="M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2 Z" fill="#38bdf8"/>
    </g>
    <g transform="translate(18, 42)">
      <path d="M0 -4 L1.5 -1.5 L4 0 L1.5 1.5 L0 4 L-1.5 1.5 L-4 0 L-1.5 -1.5 Z" fill="#fbbf24"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// 5. MOD B - AR ORIENTASI DUNIA (mode-b-ar-orientation.svg)
// ============================================================================
const modeBArOrientationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 130" width="140" height="130" fill="none">
  <defs>
    <!-- Bayang 3D Mod B -->
    <filter id="glowModB" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0d9488" flood-opacity="0.28"/>
    </filter>

    <!-- Badan Telefon 3D Logam Teal/Pudina -->
    <linearGradient id="gradPhoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#ccfbf1"/>
      <stop offset="85%" stop-color="#5eead4"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>

    <!-- Skrin AR Gelap Telus Realistik -->
    <linearGradient id="gradPhoneScreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#134e4a"/>
      <stop offset="60%" stop-color="#042f2e"/>
      <stop offset="100%" stop-color="#021c1a"/>
    </linearGradient>

    <!-- Kompas Emas 3D -->
    <radialGradient id="gradCompassGold" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#facc15"/>
      <stop offset="85%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </radialGradient>

    <!-- Jarum Kompas Merah & Putih -->
    <linearGradient id="gradNeedleRed" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>

    <!-- Mitokondrion AR Bercahaya Ungu/Merah Jambu -->
    <radialGradient id="gradMitoAR" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f5d0fe"/>
      <stop offset="50%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#86198f"/>
    </radialGradient>
  </defs>

  <g filter="url(#glowModB)">
    <!-- Telefon Pintar AR 3D (Kedudukan Tegak) -->
    <g transform="translate(64, 56)">
      <!-- Badan Telefon Luar -->
      <rect x="-30" y="-48" width="60" height="96" rx="14" fill="url(#gradPhoneBody)"/>
      <rect x="-30" y="-48" width="60" height="96" rx="14" stroke="#99f6e4" stroke-width="1.8" fill="none"/>

      <!-- Skrin Paparan AR Kamera -->
      <rect x="-26" y="-42" width="52" height="84" rx="10" fill="url(#gradPhoneScreen)"/>

      <!-- Lubang Kamera Depan & Pembesar Suara -->
      <ellipse cx="0" cy="-45" rx="5" ry="1.5" fill="#0f766e"/>
      <circle cx="-8" cy="-45" r="1.5" fill="#042f2e"/>

      <!-- Bingkai Sudut Imbasan AR Cyan (Scanning Reticle Corners) -->
      <path d="M-18 -28 L-22 -28 L-22 -24" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 -28 L22 -28 L22 -24" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>
      <path d="M-18 16 L-22 16 L-22 12" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 16 L22 16 L22 12" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round"/>

      <!-- Model Organel Mitokondrion Terapung Pada Skrin AR -->
      <g transform="translate(0, -6)">
        <!-- Aura Glow Organel -->
        <ellipse cx="0" cy="0" rx="18" ry="11" fill="#e879f9" opacity="0.3"/>
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="url(#gradMitoAR)"/>
        <!-- Lipatan Krista Ungu Cerah -->
        <path d="M-7 -2 Q-4 0 -7 2 M-1 -3 Q2 0 -1 3 M5 -2 Q8 0 5 2" stroke="#fdf4ff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="-4" cy="-3" rx="4" ry="1.5" fill="#ffffff" opacity="0.7"/>
      </g>

      <!-- Gelung Radar AR Halus di Bawah Skrin -->
      <ellipse cx="0" cy="26" rx="16" ry="6" stroke="#2dd4bf" stroke-width="1.2" stroke-dasharray="3 2" fill="none" opacity="0.8"/>
      <circle cx="4" cy="25" r="2" fill="#2dd4bf"/>

      <!-- Pantulan Kaca Specular Skrin Telefon -->
      <path d="M-24 -40 L16 -40 L-10 38 L-24 38 Z" fill="#ffffff" opacity="0.1"/>
    </g>

    <!-- Kompas Emas 3D di Hadapan Bawah Kanan Telefon -->
    <g transform="translate(100, 92)">
      <!-- Cincin Luar Kompas Emas -->
      <circle cx="0" cy="0" r="24" fill="url(#gradCompassGold)"/>
      <circle cx="0" cy="0" r="24" stroke="#fef08a" stroke-width="1.8" fill="none"/>

      <!-- Dail Kompas Dalam Putih/Krem -->
      <circle cx="0" cy="0" r="18" fill="#0f172a"/>
      <circle cx="0" cy="0" r="18" stroke="#ca8a04" stroke-width="1.2" fill="none"/>

      <!-- Tanda Arah U/S/T/B -->
      <path d="M0 -16 L0 -14 M0 16 L0 14 M-16 0 L-14 0 M16 0 L14 0" stroke="#facc15" stroke-width="1.5"/>

      <!-- Jarum Kompas 3D (Arah Utara Merah / Selatan Putih) -->
      <!-- Jarum Utara (Merah) -->
      <polygon points="0,0 -4,-2 0,-14 4,-2" fill="url(#gradNeedleRed)"/>
      <!-- Jarum Selatan (Putih Perak) -->
      <polygon points="0,0 -4,2 0,14 4,2" fill="#e2e8f0"/>

      <!-- Pivot Pusat Emas -->
      <circle cx="0" cy="0" r="3.5" fill="#facc15"/>
      <circle cx="0" cy="0" r="1.5" fill="#854d0e"/>

      <!-- Penyerlah Glos Kaca Kompas -->
      <ellipse cx="-6" cy="-8" rx="8" ry="4" fill="#ffffff" opacity="0.45" transform="rotate(-30, -6, -8)"/>
    </g>

    <!-- Sparkle Hijau/Cyan Kiri Bawah -->
    <g transform="translate(18, 76)">
      <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="#2dd4bf"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// 6. MOD C - AR KAD PENANDA (mode-c-marker-ar.svg)
// ============================================================================
const modeCMarkerArSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 130" width="140" height="130" fill="none">
  <defs>
    <!-- Bayang 3D Mod C -->
    <filter id="glowModC" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#7c3aed" flood-opacity="0.28"/>
    </filter>

    <!-- Kad Penanda Putih Bergaya Isometrik -->
    <linearGradient id="gradMarkerBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>

    <!-- Mitokondrion Oren Berapi 3D -->
    <radialGradient id="gradMitoMarker" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="85%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>

    <!-- Pancaran Cahaya Hologram Ungu & Sinar AR -->
    <linearGradient id="gradHoloBeam" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#c084fc" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <g filter="url(#glowModC)">
    <!-- Pancaran Sinar Hologram Menegak dari Kad ke Model -->
    <polygon points="30,95 110,95 95,30 45,30" fill="url(#gradHoloBeam)"/>

    <!-- Kad Penanda Isometrik 3D di Lantai/Permukaan -->
    <g transform="translate(70, 94)">
      <!-- Ketebalan Sisi Kad 3D Bawah -->
      <polygon points="-46,0 0,16 46,0 46,6 0,22 -46,6" fill="#94a3b8"/>

      <!-- Permukaan Atas Kad Putih -->
      <polygon points="-46,0 0,-16 46,0 0,16" fill="url(#gradMarkerBase)"/>
      <polygon points="-46,0 0,-16 46,0 0,16" stroke="#cbd5e1" stroke-width="1.2" fill="none"/>

      <!-- Corak Penanda AR Hitam-Putih Isometrik (Marker Pattern) -->
      <polygon points="-34,0 0,-12 34,0 0,12" fill="#0f172a"/>
      <polygon points="-24,0 0,-8 24,0 0,8" fill="#ffffff"/>
      <polygon points="-14,0 0,-5 14,0 0,5" fill="#0f172a"/>

      <!-- Bucu Biru Penanda Pengesanan AR -->
      <circle cx="-42" cy="0" r="2.5" fill="#38bdf8"/>
      <circle cx="42" cy="0" r="2.5" fill="#38bdf8"/>
      <circle cx="0" cy="-14" r="2.5" fill="#38bdf8"/>
      <circle cx="0" cy="14" r="2.5" fill="#38bdf8"/>

      <!-- Lingkaran Sinar Pengimbas AR di Atas Kad -->
      <ellipse cx="0" cy="0" rx="42" ry="14" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
    </g>

    <!-- Garisan Imbasan AR Laser Melintang (Horizontal Scan Line) -->
    <g transform="translate(70, 68)">
      <line x1="-38" y1="0" x2="38" y2="0" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="2" fill="#ffffff"/>
    </g>

    <!-- Model Organel Mitokondrion Oren 3D Terapung Tegak di Atas Kad -->
    <g transform="translate(70, 42)">
      <!-- Aura Glow Organel -->
      <ellipse cx="0" cy="0" rx="28" ry="18" fill="#fb923c" opacity="0.35"/>

      <!-- Badan Utama Mitokondrion 3D Bersegi Bujur Ergonomik -->
      <ellipse cx="0" cy="0" rx="24" ry="14" fill="url(#gradMitoMarker)"/>
      <ellipse cx="0" cy="0" rx="24" ry="14" stroke="#fef08a" stroke-width="1.5" stroke-opacity="0.8" fill="none"/>

      <!-- Lipatan Membran Dalam (Krista) 3D Kuning Terang -->
      <path d="M-14 -3 Q-9 0 -14 3 M-7 -5 Q-2 0 -7 5 M0 -6 Q5 0 0 6 M7 -5 Q12 0 7 5 M14 -3 Q19 0 14 3" 
            stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>

      <!-- Sorotan Glossy Specular Atas -->
      <ellipse cx="-8" cy="-6" rx="8" ry="3" fill="#ffffff" opacity="0.75"/>
      <circle cx="-14" cy="-5" r="2" fill="#ffffff" opacity="0.9"/>
    </g>

    <!-- Sparkle & Partikel Sains Terapung -->
    <g transform="translate(116, 32)">
      <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="#fb923c"/>
    </g>
    <g transform="translate(26, 34)">
      <path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="#a855f7"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// 7. NOTA INTERAKTIF (learning-notes.svg)
// ============================================================================
const learningNotesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80" fill="none">
  <defs>
    <!-- Bayang 3D Buku Nota -->
    <filter id="glowNotes" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#ca8a04" flood-opacity="0.25"/>
    </filter>

    <!-- Kulit Buku Emas/Jingga -->
    <linearGradient id="gradBookCover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="85%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>

    <!-- Halaman Kertas Putih Berkrim 3D -->
    <linearGradient id="gradBookPages" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#fefce8"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>

    <!-- Pensel Sains Oren 3D -->
    <linearGradient id="gradPencil" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>

  <g filter="url(#glowNotes)">
    <!-- Buku Sains Terbuka 3D -->
    <g transform="translate(48, 42)">
      <!-- Kulit Bawah Buku Terbuka Tebal -->
      <path d="M-40 18 Q0 12 40 18 L38 22 Q0 16 -38 22 Z" fill="#a16207"/>

      <!-- Helaian Kiri Terbuka Berlekuk -->
      <path d="M0 14 C-12 12 -28 10 -38 14 L-38 -12 C-28 -16 -12 -14 0 -10 Z" fill="url(#gradBookPages)"/>
      <path d="M0 14 C-12 12 -28 10 -38 14 L-38 -12 C-28 -16 -12 -14 0 -10 Z" stroke="#fef08a" stroke-width="1.2" fill="none"/>

      <!-- Helaian Kanan Terbuka Berlekuk -->
      <path d="M0 14 C12 12 28 10 38 14 L38 -12 C28 -16 12 -14 0 -10 Z" fill="url(#gradBookPages)"/>
      <path d="M0 14 C12 12 28 10 38 14 L38 -12 C28 -16 12 -14 0 -10 Z" stroke="#fef08a" stroke-width="1.2" fill="none"/>

      <!-- Tulang Buku Tengah & Bayang Lekukan -->
      <line x1="0" y1="-10" x2="0" y2="14" stroke="#ca8a04" stroke-width="2.5"/>

      <!-- Garisan Teks & Rajah Sains Mini Pada Muka Surat Kiri -->
      <!-- Rajah Sel Mini -->
      <circle cx="-18" cy="-2" r="5" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>
      <circle cx="-18" cy="-2" r="2" fill="#9333ea"/>
      <!-- Teks Garisan -->
      <line x1="-32" y1="6" x2="-8" y2="6" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="-32" y1="10" x2="-14" y2="10" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Garisan Teks Sains Pada Muka Surat Kanan -->
      <line x1="8" y1="-4" x2="32" y2="-4" stroke="#64748b" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="1" x2="30" y2="1" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="6" x2="28" y2="6" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="8" y1="11" x2="22" y2="11" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>

      <!-- Reben Penanda Buku Merah/Oren Terjuntai di Bawah -->
      <path d="M0 14 Q4 22 2 28 L-2 25 L-5 28 Q-3 20 0 14 Z" fill="#ea580c"/>
    </g>

    <!-- Pensel Sains 3D Comel di Sebelah Kanan Atas -->
    <g transform="translate(76, 26) rotate(35)">
      <!-- Badan Pensel -->
      <rect x="-3" y="-14" width="6" height="24" rx="1.5" fill="url(#gradPencil)"/>
      <!-- Gelang Logam Perak -->
      <rect x="-3" y="10" width="6" height="3" fill="#cbd5e1"/>
      <!-- Pemadam Merah Jambu -->
      <rect x="-3" y="13" width="6" height="5" rx="2" fill="#f43f5e"/>
      <!-- Mata Pensel Kayu & Grafit -->
      <polygon points="-3,-14 3,-14 0,-20" fill="#fed7aa"/>
      <polygon points="-1,-18 1,-18 0,-20" fill="#1e293b"/>
    </g>

    <!-- Bintang Sparkle Emas Kiri Atas -->
    <g transform="translate(14, 18)">
      <path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="#eab308"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// 8. VIDEO PEMBELAJARAN (learning-video.svg)
// ============================================================================
const learningVideoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80" fill="none">
  <defs>
    <!-- Bayang 3D Video Clapperboard -->
    <filter id="glowVideo" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="#e11d48" flood-opacity="0.25"/>
    </filter>

    <!-- Skrin Video Karang/Merah Jambu 3D -->
    <linearGradient id="gradVideoScreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </linearGradient>

    <!-- Butang Play Putih Mutiara 3D -->
    <radialGradient id="gradPlayBtn" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#fff1f2"/>
      <stop offset="100%" stop-color="#fecdd3"/>
    </radialGradient>
  </defs>

  <g filter="url(#glowVideo)">
    <!-- Clapperboard / Skrin Video 3D (Bentuk Kartun Bulat Comel) -->
    <g transform="translate(48, 44)">
      <!-- Badan Skrin Utama Clapperboard -->
      <rect x="-36" y="-24" width="72" height="48" rx="12" fill="url(#gradVideoScreen)"/>
      <rect x="-36" y="-24" width="72" height="48" rx="12" stroke="#fda4af" stroke-width="1.8" fill="none"/>

      <!-- Jalur Clapperboard Hitam & Putih di Bahagian Atas -->
      <g transform="translate(0, -17)">
        <rect x="-32" y="-5" width="64" height="10" rx="4" fill="#0f172a"/>
        <!-- Jalur Belang Diagonal Putih -->
        <polygon points="-26,5 -20,-5 -14,-5 -20,5" fill="#ffffff"/>
        <polygon points="-10,5 -4,-5 2,-5 -4,5" fill="#ffffff"/>
        <polygon points="6,5 12,-5 18,-5 12,5" fill="#ffffff"/>
        <polygon points="22,5 28,-5 32,-5 28,5" fill="#ffffff"/>
      </g>

      <!-- Butang Play 3D Besar Bercahaya Putih Mutiara -->
      <g transform="translate(0, 5)">
        <!-- Bayang Lembut Butang Play -->
        <circle cx="0" cy="0" r="16" fill="#be123c" opacity="0.35"/>
        <circle cx="0" cy="0" r="15" fill="url(#gradPlayBtn)"/>
        <circle cx="0" cy="0" r="15" stroke="#ffffff" stroke-width="1.5" fill="none"/>

        <!-- Simbol Segi Tiga Play Bulat Merah Karang -->
        <path d="M-3 -7 L7 0 L-3 7 Z" fill="#e11d48" stroke="#e11d48" stroke-width="1.5" stroke-linejoin="round"/>
        <ellipse cx="-4" cy="-5" rx="4" ry="2" fill="#ffffff" opacity="0.8"/>
      </g>

      <!-- Pantulan Kaca Specular Diagonal Skrin Video -->
      <path d="M-34 -10 L14 -10 L-10 22 L-34 22 Z" fill="#ffffff" opacity="0.12"/>
    </g>

    <!-- Sparkle Merah Jambu Kanan Bawah -->
    <g transform="translate(86, 60)">
      <path d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z" fill="#fb7185"/>
    </g>

    <!-- Ikon Sel Mini Comel di Kiri Atas -->
    <g transform="translate(18, 22)">
      <circle cx="0" cy="0" r="5" fill="#fed7aa" stroke="#ea580c" stroke-width="1"/>
      <circle cx="0" cy="0" r="2" fill="#ea580c"/>
    </g>
  </g>
</svg>`;

// Tulis semua fail SVG ke outDir
const assets = {
  'hero-animal-cell.svg': heroAnimalCellSvg,
  'hero-plant-cell.svg': heroPlantCellSvg,
  'hero-robot.svg': heroRobotSvg,
  'mode-a-3d-lab.svg': modeA3dLabSvg,
  'mode-b-ar-orientation.svg': modeBArOrientationSvg,
  'mode-c-marker-ar.svg': modeCMarkerArSvg,
  'learning-notes.svg': learningNotesSvg,
  'learning-video.svg': learningVideoSvg,
};

for (const [name, content] of Object.entries(assets)) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log(`✅ Aset berjaya dijana: ${name} (${content.length} bait)`);
}

console.log('\nSemua 8 aset ilustrasi 3D vector SVG rasmi telah siap!');

