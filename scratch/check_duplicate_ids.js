const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'kotak_arselnel', 'code.html');
const html = fs.readFileSync(filePath, 'utf8');

const idRegex = /\sid=["']([^"']+)["']/g;
const ids = new Map();
let match;
let duplicates = [];

while ((match = idRegex.exec(html)) !== null) {
  const id = match[1];
  if (ids.has(id)) {
    duplicates.push({ id, count: ids.get(id) + 1 });
    ids.set(id, ids.get(id) + 1);
  } else {
    ids.set(id, 1);
  }
}

if (duplicates.length > 0) {
  console.error('Found duplicate IDs:', duplicates);
  process.exit(1);
} else {
  console.log(`Success: Found ${ids.size} unique IDs and 0 duplicate IDs!`);
  // Verify both panels exist
  console.log('pov-panel-video exists:', ids.has('pov-panel-video'));
  console.log('pov-panel-nota exists:', ids.has('pov-panel-nota'));
}

