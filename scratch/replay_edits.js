const fs = require('fs');
const readline = require('readline');

async function restore() {
  let content = fs.readFileSync('kotak_arselnel/kotak-arselnel.fasa4c.bak.js', 'utf8');
  console.log('Initial length:', content.length);

  // Read full transcript
  const fileStream = fs.createReadStream('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream });

  let appliedCount = 0;
  let missingCount = 0;
  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 8345 && obj.step_index <= 9535 && obj.tool_calls) {
        for (const t of obj.tool_calls) {
          if (t.name === 'edit_file' && t.args.Path && t.args.Path.includes('kotak-arselnel.js')) {
            let target = t.args.Target;
            let replacement = t.args.Replacement;
            if (content.includes(target)) {
              content = content.replace(target, replacement);
              appliedCount++;
            } else {
              // Try normalizing CRLF / LF
              const targetLF = target.replace(/\r\n/g, '\n');
              const targetCRLF = target.replace(/\r?\n/g, '\r\n');
              if (content.includes(targetLF)) {
                content = content.replace(targetLF, replacement.replace(/\r\n/g, '\n'));
                appliedCount++;
              } else if (content.includes(targetCRLF)) {
                content = content.replace(targetCRLF, replacement.replace(/\r?\n/g, '\r\n'));
                appliedCount++;
              } else {
                missingCount++;
                console.warn('Target not found for step:', obj.step_index);
              }
            }
          }
        }
      }
    } catch(e) {}
  }

  console.log('Total edits applied:', appliedCount, 'Missing:', missingCount, 'Final length:', content.length);
  fs.writeFileSync('kotak_arselnel/kotak-arselnel.js', content, 'utf8');
}

restore().catch(console.error);
