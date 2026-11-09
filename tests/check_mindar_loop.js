const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Search around onTargetLost
    const idx = data.indexOf('onTargetLost');
    console.log('Around onTargetLost:', data.slice(idx - 200, idx + 300));
  });
});

