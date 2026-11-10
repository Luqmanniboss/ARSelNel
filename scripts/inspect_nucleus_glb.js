const fs = require('fs');
const path = require('path');

// Let's inspect the GLTF/GLB JSON header of nucleus_opt.glb
const glbBuffer = fs.readFileSync(path.join(__dirname, '..', 'models', 'nucleus_opt.glb'));

// GLB header: magic (4), version (4), length (4)
// Chunk 0: length (4), type (4: 0x4E4F534A 'JSON')
const chunk0Length = glbBuffer.readUInt32LE(12);
const chunk0Type = glbBuffer.readUInt32LE(16);
const jsonBuffer = glbBuffer.slice(20, 20 + chunk0Length);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

console.log('--- NUCLEUS_OPT.GLB INSPECTION ---');
console.log('Meshes:', gltf.meshes?.map(m => m.name));
console.log('Materials:', JSON.stringify(gltf.materials, null, 2));

