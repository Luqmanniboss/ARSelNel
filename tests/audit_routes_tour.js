const fs = require('fs');
const path = require('path');

const routes = [
  'halaman_utama/code.html',
  'cellquest/code.html',
  'nota_pembelajaran/code.html',
  'nota_pembelajaran/slaid_interaktif.html',
  'perpustakaan_video/code.html',
  'pemain_video/code.html',
  'selbot_ai/code.html',
  'hab_permainan/code.html',
  'kotak_arselnel/code.html',
  'profil/code.html',
  'tetapan/code.html',
  'manual_penggunaan/code.html',
  'games/misi-makmal-sains.html',
  'games/klasifikasi-sel.html'
];

routes.forEach(r => {
  const full = path.resolve(r);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, 'utf8');
  console.log('\n========================================');
  console.log('ROUTE:', r);
  console.log('========================================');
  
  // Extract IDs
  const idMatches = content.match(/id=["']([^"']+)["']/g) || [];
  const ids = idMatches.map(m => m.replace(/id=["']/, '').replace(/["']/, ''));
  console.log('IDs (' + ids.length + '):', ids.slice(0, 20).join(', '));
  
  // Extract key buttons and action links
  const btnMatches = content.match(/<(?:button|a)[^>]+(?:id|class|data-[a-z-]+)=["'][^"']+["'][^>]*>/gi) || [];
  console.log('Sample Action Elements (' + btnMatches.length + '):');
  btnMatches.slice(0, 10).forEach(b => {
    const clean = b.replace(/\s+/g, ' ').slice(0, 120);
    console.log('  ', clean);
  });
});


function inspect(file, label) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log('\n========================================');
  console.log('DEEP INSPECT:', label, '->', file);
  console.log('========================================');
  const lines = content.split('\n');
  const ids = [];
  const importantSelectors = [];
  lines.forEach((line, idx) => {
    const idMatch = line.match(/id=["']([^"']+)["']/);
    if (idMatch) ids.push(idMatch[1]);
    if (line.includes('class=') && (line.includes('btn') || line.includes('card') || line.includes('search') || line.includes('nav') || line.includes('header') || line.includes('tab') || line.includes('control') || line.includes('ars-') || line.includes('chat') || line.includes('prompt') || line.includes('player') || line.includes('ar-'))) {
      const clsMatch = line.match(/class=["']([^"']+)["']/);
      if (clsMatch) importantSelectors.push({ line: idx + 1, cls: clsMatch[1].slice(0, 80) });
    }
  });
  console.log('All IDs (' + ids.length + '):', ids.join(', '));
  console.log('Sample classes (first 10):');
  importantSelectors.slice(0, 10).forEach(s => console.log('  L' + s.line + ': .' + s.cls));
}

inspect('halaman_utama/code.html', 'A. Dashboard');
inspect('nota_pembelajaran/code.html', 'B1. Nota Katalog');
inspect('nota_pembelajaran/slaid_interaktif.html', 'B2. Slaid Interaktif');
inspect('perpustakaan_video/code.html', 'C1. Video Katalog');
inspect('pemain_video/code.html', 'C2. Pemain Video');
inspect('cellquest/code.html', 'D. CellQuest');
inspect('selbot_ai/code.html', 'E. SelBot AI');
inspect('hab_permainan/code.html', 'F1. Hab Permainan');
inspect('games/misi-makmal-sains.html', 'F2. Misi Makmal Sains');
inspect('games/klasifikasi-sel.html', 'F3. Maze Chase');
inspect('kotak_arselnel/code.html', 'G. Kotak ARSELNEL');
inspect('profil/code.html', 'H1. Profil');
inspect('tetapan/code.html', 'H2. Tetapan');
inspect('manual_penggunaan/code.html', 'I. Manual Penggunaan');
