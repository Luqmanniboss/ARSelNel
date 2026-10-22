// Test script to build valid GLB files for Animal Cell and Plant Cell
const fs = require('fs');
const path = require('path');

// Helper to generate sphere geometry (positions, normals, indices)
function createSphere(radius = 1, widthSegments = 16, heightSegments = 12) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const phi = v * Math.PI;
    for (let x = 0; x <= widthSegments; x++) {
      const u = x / widthSegments;
      const theta = u * Math.PI * 2;

      const px = -radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.cos(phi);
      const pz = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(px, py, pz);
      // Normalized normal
      const len = Math.hypot(px, py, pz) || 1;
      normals.push(px / len, py / len, pz / len);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const first = (y * (widthSegments + 1)) + x;
      const second = first + widthSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { positions, normals, indices };
}

// Helper to generate rounded box / cylinder geometry for plant cell
function createRoundedBox(width = 1.6, height = 1.2, depth = 1.4, segments = 16) {
  // Simple rectangular prism with rounded corner subdivision
  const positions = [];
  const normals = [];
  const indices = [];

  // Generate a squarish rounded prism
  for (let y = 0; y <= 8; y++) {
    const py = (y / 8 - 0.5) * height;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // superellipse profile for plant cell shape: |x/a|^4 + |z/b|^4 = 1
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const r = Math.pow(Math.pow(Math.abs(cosA), 3) + Math.pow(Math.abs(sinA), 3), -0.33);
      const px = r * cosA * (width * 0.5);
      const pz = r * sinA * (depth * 0.5);

      positions.push(px, py, pz);
      const len = Math.hypot(px, 0, pz) || 1;
      normals.push(px / len, y === 0 ? -1 : y === 8 ? 1 : 0, pz / len);
    }
  }

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < segments; x++) {
      const first = (y * (segments + 1)) + x;
      const second = first + segments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { positions, normals, indices };
}

// Builder for glTF 2.0 GLB binary
function buildGLB(parts) {
  const bufferChunks = [];
  let byteOffset = 0;

  const accessors = [];
  const bufferViews = [];
  const meshes = [];
  const materials = [];
  const nodes = [];

  parts.forEach((part, partIdx) => {
    // 1. Positions (VEC3, FLOAT 5126)
    const posFloat32 = new Float32Array(part.positions);
    const posBuf = Buffer.from(posFloat32.buffer);
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < part.positions.length; i += 3) {
      minX = Math.min(minX, part.positions[i]);
      minY = Math.min(minY, part.positions[i + 1]);
      minZ = Math.min(minZ, part.positions[i + 2]);
      maxX = Math.max(maxX, part.positions[i]);
      maxY = Math.max(maxY, part.positions[i + 1]);
      maxZ = Math.max(maxZ, part.positions[i + 2]);
    }

    const posViewIdx = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: posBuf.length,
      target: 34962 // ARRAY_BUFFER
    });
    bufferChunks.push(posBuf);
    byteOffset += posBuf.length;

    const posAccIdx = accessors.length;
    accessors.push({
      bufferView: posViewIdx,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: part.positions.length / 3,
      type: "VEC3",
      max: [maxX, maxY, maxZ],
      min: [minX, minY, minZ]
    });

    // 2. Normals (VEC3, FLOAT 5126)
    const normFloat32 = new Float32Array(part.normals);
    const normBuf = Buffer.from(normFloat32.buffer);
    const normViewIdx = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: normBuf.length,
      target: 34962
    });
    bufferChunks.push(normBuf);
    byteOffset += normBuf.length;

    const normAccIdx = accessors.length;
    accessors.push({
      bufferView: normViewIdx,
      byteOffset: 0,
      componentType: 5126,
      count: part.normals.length / 3,
      type: "VEC3"
    });

    // 3. Indices (SCALAR, UNSIGNED_SHORT 5123)
    const indUint16 = new Uint16Array(part.indices);
    let indBuf = Buffer.from(indUint16.buffer);
    // Align to 4 bytes if needed
    const pad = indBuf.length % 4 === 0 ? 0 : 4 - (indBuf.length % 4);
    if (pad > 0) {
      indBuf = Buffer.concat([indBuf, Buffer.alloc(pad)]);
    }

    const indViewIdx = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: indUint16.byteLength,
      target: 34963 // ELEMENT_ARRAY_BUFFER
    });
    bufferChunks.push(indBuf);
    byteOffset += indBuf.length;

    let minIdx = 0, maxIdx = 0;
    for (let i = 0; i < part.indices.length; i++) {
      if (part.indices[i] > maxIdx) maxIdx = part.indices[i];
    }

    const indAccIdx = accessors.length;
    accessors.push({
      bufferView: indViewIdx,
      byteOffset: 0,
      componentType: 5123, // UNSIGNED_SHORT
      count: part.indices.length,
      type: "SCALAR",
      max: [maxIdx],
      min: [minIdx]
    });

    // Material
    const matIdx = materials.length;
    materials.push({
      name: part.name + "_Mat",
      pbrMetallicRoughness: {
        baseColorFactor: part.color || [0.8, 0.8, 0.8, 1.0],
        metallicFactor: part.metallic !== undefined ? part.metallic : 0.1,
        roughnessFactor: part.roughness !== undefined ? part.roughness : 0.4
      },
      alphaMode: (part.color && part.color[3] < 1.0) ? "BLEND" : "OPAQUE",
      doubleSided: true
    });

    // Mesh
    const meshIdx = meshes.length;
    meshes.push({
      name: part.name + "_Mesh",
      primitives: [{
        attributes: {
          POSITION: posAccIdx,
          NORMAL: normAccIdx
        },
        indices: indAccIdx,
        material: matIdx
      }]
    });

    // Node
    nodes.push({
      name: part.name,
      mesh: meshIdx,
      translation: part.translation || [0, 0, 0],
      scale: part.scale || [1, 1, 1]
    });
  });

  const binBuffer = Buffer.concat(bufferChunks);

  const gltf = {
    asset: { version: "2.0", generator: "ARSelNel Cell 3D Generator" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes: nodes,
    meshes: meshes,
    materials: materials,
    accessors: accessors,
    bufferViews: bufferViews,
    buffers: [{ byteLength: binBuffer.length }]
  };

  const jsonStr = JSON.stringify(gltf);
  let jsonBuf = Buffer.from(jsonStr, 'utf8');
  // Pad JSON chunk to 4-byte boundary with spaces (0x20)
  const jsonPadding = jsonBuf.length % 4 === 0 ? 0 : 4 - (jsonBuf.length % 4);
  if (jsonPadding > 0) {
    jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPadding, 0x20)]);
  }

  // GLB Header: 12 bytes
  // Chunk 0 (JSON): 8 bytes header + jsonBuf
  // Chunk 1 (BIN): 8 bytes header + binBuffer
  const totalLength = 12 + 8 + jsonBuf.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4);          // version 2
  header.writeUInt32LE(totalLength, 8);// total file length

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuffer.length, 0);
  binHeader.writeUInt32LE(0x004E4942, 4);  // "BIN\0"

  return Buffer.concat([header, jsonHeader, jsonBuf, binHeader, binBuffer]);
}

// Ensure assets/models exists
const modelsDir = path.join(__dirname, '..', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// 1. Build Sel Haiwan (Animal Cell)
const animalParts = [
  // Outer Membrane (Translucent Teal/Cyan)
  {
    name: "Membran_Sel",
    ...createSphere(1.0, 24, 16),
    color: [0.0, 0.65, 0.65, 0.45], // semi-transparent primary teal
    roughness: 0.2,
    metallic: 0.1,
    scale: [1.2, 1.0, 1.1]
  },
  // Cytoplasm interior (Soft blue)
  {
    name: "Sitoplasma",
    ...createSphere(0.85, 20, 14),
    color: [0.35, 0.75, 0.95, 0.35],
    roughness: 0.5,
    scale: [1.1, 0.9, 1.0]
  },
  // Nucleus (Center purple/magenta)
  {
    name: "Nukleus",
    ...createSphere(0.38, 20, 14),
    color: [0.55, 0.15, 0.75, 1.0],
    roughness: 0.3,
    metallic: 0.2,
    translation: [0.05, 0.1, -0.05]
  },
  // Nucleolus (Inside nucleus dark violet)
  {
    name: "Nukleolus",
    ...createSphere(0.15, 12, 10),
    color: [0.3, 0.05, 0.45, 1.0],
    roughness: 0.4,
    translation: [0.1, 0.15, 0.0]
  },
  // Mitochondria 1 (Orange/red energy powerhouse)
  {
    name: "Mitokondria_1",
    ...createSphere(0.18, 14, 10),
    color: [0.95, 0.35, 0.1, 1.0],
    roughness: 0.4,
    scale: [1.8, 0.8, 0.8],
    translation: [-0.55, -0.2, 0.3]
  },
  // Mitochondria 2
  {
    name: "Mitokondria_2",
    ...createSphere(0.16, 14, 10),
    color: [0.95, 0.45, 0.15, 1.0],
    roughness: 0.4,
    scale: [1.6, 0.8, 0.8],
    translation: [0.5, -0.25, -0.3]
  },
  // Golgi / Organelles
  {
    name: "Jasad_Golgi",
    ...createSphere(0.14, 12, 8),
    color: [0.95, 0.75, 0.1, 1.0],
    roughness: 0.3,
    scale: [1.8, 0.5, 0.7],
    translation: [-0.3, 0.35, -0.35]
  }
];

const animalGLB = buildGLB(animalParts);
const animalPath = path.join(modelsDir, 'animal_cell.glb');
fs.writeFileSync(animalPath, animalGLB);
console.log('Saved Animal Cell GLB:', animalPath, animalGLB.length, 'bytes');

// 2. Build Sel Tumbuhan (Plant Cell)
const plantParts = [
  // Rigid Outer Cell Wall (Emerald / Deep Forest Green)
  {
    name: "Dinding_Sel",
    ...createRoundedBox(1.5, 1.2, 1.3, 20),
    color: [0.05, 0.55, 0.25, 0.55], // Green translucent cell wall
    roughness: 0.3,
    metallic: 0.1,
    scale: [1.05, 1.05, 1.05]
  },
  // Inner Cell Membrane
  {
    name: "Membran_Sel_Tumbuhan",
    ...createRoundedBox(1.4, 1.1, 1.2, 18),
    color: [0.2, 0.75, 0.4, 0.35],
    roughness: 0.4,
    scale: [0.98, 0.98, 0.98]
  },
  // Large Central Vacuole (Large crystal clear cyan volume)
  {
    name: "Vakuol_Besar",
    ...createSphere(0.5, 20, 14),
    color: [0.2, 0.85, 0.95, 0.6],
    roughness: 0.1,
    scale: [1.1, 0.9, 0.9],
    translation: [-0.15, -0.05, 0.05]
  },
  // Nucleus (Pushed to the side in plant cell)
  {
    name: "Nukleus_Tumbuhan",
    ...createSphere(0.28, 16, 12),
    color: [0.55, 0.15, 0.75, 1.0],
    roughness: 0.3,
    translation: [0.45, 0.2, -0.2]
  },
  // Chloroplasts (Bright lime-green discs)
  {
    name: "Kloroplas_1",
    ...createSphere(0.15, 12, 10),
    color: [0.15, 0.85, 0.15, 1.0],
    roughness: 0.3,
    scale: [1.4, 0.6, 1.0],
    translation: [0.4, -0.3, 0.35]
  },
  {
    name: "Kloroplas_2",
    ...createSphere(0.15, 12, 10),
    color: [0.15, 0.85, 0.15, 1.0],
    roughness: 0.3,
    scale: [1.3, 0.6, 1.0],
    translation: [-0.4, 0.35, 0.3]
  },
  {
    name: "Kloroplas_3",
    ...createSphere(0.14, 12, 10),
    color: [0.15, 0.85, 0.15, 1.0],
    roughness: 0.3,
    scale: [1.3, 0.6, 1.0],
    translation: [-0.45, -0.25, -0.35]
  },
  // Mitochondria
  {
    name: "Mitokondria_Tumbuhan",
    ...createSphere(0.12, 12, 8),
    color: [0.95, 0.4, 0.1, 1.0],
    roughness: 0.4,
    scale: [1.5, 0.7, 0.7],
    translation: [0.35, 0.3, 0.3]
  }
];

const plantGLB = buildGLB(plantParts);
const plantPath = path.join(modelsDir, 'plant_cell.glb');
fs.writeFileSync(plantPath, plantGLB);
console.log('Saved Plant Cell GLB:', plantPath, plantGLB.length, 'bytes');
