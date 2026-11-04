const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const REF_IMG_PATH = 'C:/Users/Owner/.gemini/antigravity/brain/79bd7697-b4c0-4d63-a433-1c26b97eaefb/.user_uploaded/media_1793808676540_2bee969b.jpg';
const OUT_DIR = path.resolve(__dirname, '../assets/images/lobby');

function findEdgeBinary() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function extractAssets() {
  const edgeBin = findEdgeBinary();
  if (!edgeBin) throw new Error('Pelayar Edge tidak ditemui');

  const imgData = fs.readFileSync(REF_IMG_PATH).toString('base64');
  const dataUri = `data:image/jpeg;base64,${imgData}`;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html><body><img id="ref" src="${dataUri}" /></body></html>
    `);
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  const debugPort = 9295;
  const browserProc = spawn(edgeBin, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
  const pages = await listRes.json();
  const targetPage = pages.find(p => p.type === 'page') || pages[0];

  const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 1;
  const pendingCalls = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingCalls.has(data.id)) {
      const { resolve, reject } = pendingCalls.get(data.id);
      pendingCalls.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingCalls.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalExpr(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res ? res.result.value : undefined;
  }

  await sendCommand('Page.navigate', { url: `http://127.0.0.1:${port}` });
  await new Promise(r => setTimeout(r, 1000));

  // Define crops based on 1024x576 image
  // 1. hero_mascot_cells: from x=495, y=40, w=485, h=165
  // 2. card_a_illustration: monitor + gamepad: x=235, y=215, w=105, h=105
  // 3. card_b_illustration: phone + compass: x=550, y=215, w=105, h=105
  // 4. card_c_illustration: marker + mitochondrion: x=850, y=210, w=115, h=110
  // 5. hub_notes_book: x=85, y=488, w=80, h=62
  // 6. hub_videos_play: x=540, y=490, w=80, h=60

  const crops = [
    { name: 'hero_mascot_cells.png', x: 490, y: 45, w: 490, h: 155 },
    { name: 'card_a_illustration.png', x: 235, y: 215, w: 105, h: 105 },
    { name: 'card_b_illustration.png', x: 550, y: 215, w: 105, h: 105 },
    { name: 'card_c_illustration.png', x: 850, y: 210, w: 115, h: 110 },
    { name: 'hub_notes_book.png', x: 85, y: 488, w: 80, h: 62 },
    { name: 'hub_videos_play.png', x: 540, y: 490, w: 80, h: 60 }
  ];

  for (const c of crops) {
    const dataUrl = await evalExpr(`
      (() => {
        const img = document.getElementById('ref');
        const canvas = document.createElement('canvas');
        canvas.width = ${c.w};
        canvas.height = ${c.h};
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, ${c.x}, ${c.y}, ${c.w}, ${c.h}, 0, 0, ${c.w}, ${c.h});
        return canvas.toDataURL('image/png');
      })()
    `);

    const base64Png = dataUrl.replace(/^data:image\/png;base64,/, '');
    const outPath = path.join(OUT_DIR, c.name);
    fs.writeFileSync(outPath, Buffer.from(base64Png, 'base64'));
    console.log(`Saved: ${c.name} (${c.w}x${c.h})`);
  }

  ws.close();
  browserProc.kill();
  server.close();
}

extractAssets().then(() => {
  console.log('Semua aset berjaya diekstrak!');
  process.exit(0);
}).catch(err => {
  console.error('Ralat:', err);
  process.exit(1);
});

