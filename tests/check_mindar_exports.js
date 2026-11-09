const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Search for window.MINDAR
    const idx = data.indexOf('MINDAR');
    console.log('Index of MINDAR:', idx);
    const matches = data.match(/[a-zA-Z0-9_$]+\.MINDAR\s*=\s*\{[^}]+\}/g) || data.match(/MINDAR\.[a-zA-Z0-9_$.]+/g);
    console.log('Matches:', matches ? matches.slice(0, 10) : 'none');
    // Look at end of file where UMD exports usually are
    console.log('Last 500 chars:', data.slice(-500));
  });
});

