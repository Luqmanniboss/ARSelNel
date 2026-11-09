const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Search for matrix assignment on anchor.group
    const matches = data.match(/group\.matrix\s*=\s*[^;]+/g) || [];
    console.log('group.matrix assignments:', matches);

    // Search for addAnchor
    const anchorDef = data.match(/addAnchor\([a-zA-Z0-9_, ]*\)\{/);
    console.log('addAnchor:', anchorDef);
    if (anchorDef) {
      const idx = data.indexOf(anchorDef[0]);
      console.log('addAnchor body:', data.slice(idx, idx + 800));
    }
  });
});

