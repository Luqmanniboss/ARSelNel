const fs = require('fs');

// Read GLB and parse vertex attributes of Labels mesh
const buf = fs.readFileSync('models/plantcellnew.glb');
const chunk0Length = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

console.log('Images in plantcellnew.glb:');
gltf.images.forEach((img, idx) => {
  console.log(`Image ${idx}: name="${img.name || ''}", mimeType=${img.mimeType}`);
});

console.log('Meshes:');
gltf.meshes.forEach((m, idx) => {
  console.log(`Mesh ${idx}: name="${m.name}"`);
});

// Let's dump image 0 (texture for Labels) to disk to see what text labels are on it!
const binChunkOffset = 20 + chunk0Length;
const chunk1Length = buf.readUInt32LE(binChunkOffset);
const chunk1Type = buf.toString('utf8', binChunkOffset + 4, binChunkOffset + 8);
const binBuffer = buf.subarray(binChunkOffset + 8, binChunkOffset + 8 + chunk1Length);

gltf.images.forEach((img, idx) => {
  if (img.bufferView !== undefined) {
    const bv = gltf.bufferViews[img.bufferView];
    const imgData = binBuffer.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outName = `plant_tex_${idx}_${img.name || 'image'}.${ext}`;
    fs.writeFileSync(outName, imgData);
    console.log(`Saved texture ${idx} to ${outName} (${imgData.length} bytes)`);
  }
});
