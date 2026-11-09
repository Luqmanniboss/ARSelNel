const https = require('https');
https.get('https://cdn.jsdelivr.net/npm/mind-ar@1.1.5/dist/mindar-image-three.prod.js', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const revMatch = data.match(/REVISION=["'](\d+)["']/i) || data.match(/THREE\.REVISION/);
    console.log('Match:', revMatch);
    // Find exports in bundle
    const m = data.match(/var [a-zA-Z0-9_$]+=\{REVISION:["'](\d+)["']/);
    console.log('Revision search:', m);
    // Check if THREE is attached to window
    const winThree = data.match(/window\.THREE/g);
    console.log('window.THREE occurrences:', winThree ? winThree.length : 0);
  });
});

