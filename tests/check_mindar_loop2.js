const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    let idx = data.indexOf('onTargetLost');
    idx = data.indexOf('onTargetLost', idx + 1);
    console.log('Second onTargetLost:', data.slice(idx - 300, idx + 300));
  });
});

