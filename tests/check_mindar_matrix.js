const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    let idx = data.indexOf('group.matrix=s');
    console.log('Around group.matrix=s:', data.slice(idx - 200, idx + 400));
  });
});

