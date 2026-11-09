const fs = require('fs');

async function replay() {
  const lines = fs.readFileSync('C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

  let content = fs.readFileSync('kotak_arselnel/kotak-arselnel.fasa4c.bak.js', 'utf8');
  console.log('Initial length (as of step 8675):', content.length);

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const step = JSON.parse(lines[i]);
      if (step.step_index > 8675 && step.step_index <= 9535 && step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'edit_file' && tc.args.Path && tc.args.Path.includes('kotak-arselnel.js')) {
            // Find next step for tool result
            let success = false;
            if (i + 1 < lines.length && lines[i + 1].trim()) {
              const nextStep = JSON.parse(lines[i + 1]);
              if (nextStep.content && nextStep.content.includes('Made 1 replacement')) {
                success = true;
              }
            }
            if (success) {
              const target = tc.args.Target;
              const replacement = tc.args.Replacement;
              if (content.includes(target)) {
                content = content.replace(target, replacement);
                console.log(`[OK] Applied successful edit at step ${step.step_index}`);
              } else {
                const targetLF = target.replace(/\r\n/g, '\n');
                const targetCRLF = target.replace(/\r?\n/g, '\r\n');
                if (content.includes(targetLF)) {
                  content = content.replace(targetLF, replacement.replace(/\r\n/g, '\n'));
                  console.log(`[OK] Applied LF edit at step ${step.step_index}`);
                } else if (content.includes(targetCRLF)) {
                  content = content.replace(targetCRLF, replacement.replace(/\r?\n/g, '\r\n'));
                  console.log(`[OK] Applied CRLF edit at step ${step.step_index}`);
                } else {
                  console.error(`[FAIL] Target missing for successful edit step ${step.step_index}`);
                }
              }
            } else {
              console.log(`[SKIP] Step ${step.step_index} was not successful or retried`);
            }
          }
        }
      }
    } catch (e) {}
  }

  console.log('Final restored length:', content.length);
  fs.writeFileSync('kotak_arselnel/kotak-arselnel.js', content, 'utf8');
}

replay().catch(console.error);
