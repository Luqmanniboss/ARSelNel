const fs = require('fs');
const path = require('path');

const migrationsDir = 'supabase/migrations';
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

const keywords = [
  'DROP TABLE',
  'DROP COLUMN',
  'TRUNCATE',
  'DELETE',
  'UPDATE',
  'ALTER TABLE',
  'DROP POLICY',
  'DROP FUNCTION',
  'CREATE OR REPLACE FUNCTION',
  'ON CONFLICT',
  'CASCADE'
];

console.log(`Auditing ${files.length} migration files in ${migrationsDir}:`);

const results = [];

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Skip single-line comments
    if (trimmed.startsWith('--')) return;

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(trimmed)) {
        // Collect context (up to 3 lines)
        results.push({
          file,
          lineNum: idx + 1,
          keyword: kw,
          statement: trimmed,
          context: lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).map(l => l.trim()).join(' | ')
        });
      }
    });
  });
});

console.log(`Found ${results.length} occurrences.`);
fs.writeFileSync('tests/audit_scan_results.json', JSON.stringify(results, null, 2));
console.log('Results written to tests/audit_scan_results.json');
