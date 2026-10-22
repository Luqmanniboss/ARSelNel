const fs = require('fs');

function inspectGlb(glbPath) {
  const buf = fs.readFileSync(glbPath);
  const magic = buf.toString('utf8', 0, 4);
  if (magic !== 'glTF') {
    console.error('Not a valid GLB:', glbPath);
    return;
  }
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  const chunk0Length = buf.readUInt32LE(12);
  const chunk0Type = buf.toString('utf8', 16, 20);
  
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);
  
  console.log('=== GLB:', glbPath, '===');
  console.log('Asset:', gltf.asset);
  console.log('Scenes count:', gltf.scenes ? gltf.scenes.length : 0);
  console.log('Nodes count:', gltf.nodes ? gltf.nodes.length : 0);
  console.log('Meshes count:', gltf.meshes ? gltf.meshes.length : 0);
  console.log('Materials count:', gltf.materials ? gltf.materials.length : 0);
  console.log('Images count:', gltf.images ? gltf.images.length : 0);
  console.log('Textures count:', gltf.textures ? gltf.textures.length : 0);

  console.log('\n--- NODES ---');
  if (gltf.nodes) {
    gltf.nodes.forEach((n, idx) => {
      console.log(`Node [${idx}]: name="${n.name || ''}", mesh=${n.mesh !== undefined ? n.mesh : 'none'}, children=${n.children ? JSON.stringify(n.children) : 'none'}`);
    });
  }

  console.log('\n--- MESHES ---');
  if (gltf.meshes) {
    gltf.meshes.forEach((m, idx) => {
      console.log(`Mesh [${idx}]: name="${m.name || ''}", primitives=${m.primitives.length}`);
      m.primitives.forEach((p, pIdx) => {
        console.log(`   Prim [${pIdx}]: material=${p.material !== undefined ? p.material : 'none'} (material name: ${gltf.materials && gltf.materials[p.material] ? gltf.materials[p.material].name : 'none'})`);
      });
    });
  }

  console.log('\n--- MATERIALS ---');
  if (gltf.materials) {
    gltf.materials.forEach((mat, idx) => {
      console.log(`Material [${idx}]: name="${mat.name || ''}", pbr=${JSON.stringify(mat.pbrMetallicRoughness || {})}, alphaMode=${mat.alphaMode || 'OPAQUE'}, doubleSided=${!!mat.doubleSided}`);
    });
  }
}

inspectGlb('models/animal_cell_final.glb');
console.log('\n=========================================\n');
inspectGlb('models/plantcellnew.glb');
