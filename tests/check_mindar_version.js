const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const m = data.match(/REVISION\s*[:=]\s*["'](\d+)["']/);
    console.log('Three REVISION in mind-ar 1.1.5:', m ? m[1] : 'none');
    console.log('Includes GLTFLoader?', data.includes('GLTFLoader'));
  });
});

