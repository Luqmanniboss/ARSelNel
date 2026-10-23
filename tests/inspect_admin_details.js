const fs = require('fs');

const adminHtml = fs.readFileSync('admin_dashboard/code.html', 'utf8');
const lines = adminHtml.split('\n');

console.log('=== DIALOGS / MODALS ===');
lines.forEach((l, i) => {
  if (l.includes('<dialog') || l.includes('id="modal') || l.includes('id=\'modal')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

console.log('\n=== SECTIONS ===');
lines.forEach((l, i) => {
  if (l.includes('<section id="section-')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

console.log('\n=== SCRIPT TAGS & HANDLERS ===');
lines.forEach((l, i) => {
  if (l.includes('<script') || l.includes('openVideoModal') || l.includes('handleSave') || l.includes('slides/upload')) {
    if (i > 100) console.log(`${i + 1}: ${l.trim().slice(0, 100)}`);
  }
});
