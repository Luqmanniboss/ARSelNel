const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'brain' || e.name === 'tests') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p);
    } else if (e.name.endsWith('.js') || e.name.endsWith('.html')) {
      const txt = fs.readFileSync(p, 'utf8');
      const lines = txt.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('.json()') && !l.includes('parseApiResponse')) {
          console.log(`${p}:${i+1}: ${l.trim().slice(0, 100)}`);
        }
      });
    }
  }
}

walk('.');
