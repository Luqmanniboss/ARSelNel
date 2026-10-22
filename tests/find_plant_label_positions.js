const fs = require('fs');

const buf = fs.readFileSync('models/plantcellnew.glb');
const chunk0Length = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + chunk0Length));

const binChunkOffset = 20 + chunk0Length;
const chunk1Length = buf.readUInt32LE(binChunkOffset);
const binBuffer = buf.subarray(binChunkOffset + 8, binChunkOffset + 8 + chunk1Length);

// Labels mesh is mesh 0
const labelsMesh = gltf.meshes[0];
const prim = labelsMesh.primitives[0];
const posAccessor = gltf.accessors[prim.attributes.POSITION];
const uvAccessor = gltf.accessors[prim.attributes.TEXCOORD_0];
const idxAccessor = gltf.accessors[prim.indices];

console.log('Position count:', posAccessor.count);

function getAccessorData(acc) {
  const bv = gltf.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const stride = bv.byteStride || 0;
  return { offset, stride, count: acc.count, compType: acc.componentType, type: acc.type };
}

const posInfo = getAccessorData(posAccessor);
const uvInfo = getAccessorData(uvAccessor);
const idxInfo = getAccessorData(idxAccessor);

// Read triangles
const indices = [];
const idxBuf = binBuffer.subarray(idxInfo.offset);
for (let i = 0; i < idxInfo.count; i++) {
  indices.push(idxInfo.compType === 5123 ? idxBuf.readUInt16LE(i * 2) : idxBuf.readUInt32LE(i * 4));
}

// Read vertices
const positions = [];
const posBuf = binBuffer.subarray(posInfo.offset);
const pStride = posInfo.stride || 12;
for (let i = 0; i < posInfo.count; i++) {
  const o = i * pStride;
  positions.push({
    x: posBuf.readFloatLE(o),
    y: posBuf.readFloatLE(o + 4),
    z: posBuf.readFloatLE(o + 8)
  });
}

// Read UVs
const uvs = [];
const uvBuf = binBuffer.subarray(uvInfo.offset);
const uStride = uvInfo.stride || 8;
for (let i = 0; i < uvInfo.count; i++) {
  const o = i * uStride;
  uvs.push({
    u: uvBuf.readFloatLE(o),
    v: uvBuf.readFloatLE(o + 4)
  });
}

// Cluster connected triangles in Labels mesh
const adj = Array.from({ length: posInfo.count }, () => []);
for (let i = 0; i < indices.length; i += 3) {
  const a = indices[i], b = indices[i + 1], c = indices[i + 2];
  adj[a].push(b, c);
  adj[b].push(a, c);
  adj[c].push(a, b);
}

const visited = new Uint8Array(posInfo.count);
const clusters = [];

for (let i = 0; i < posInfo.count; i++) {
  if (visited[i]) continue;
  const cluster = [];
  const queue = [i];
  visited[i] = 1;
  while (queue.length > 0) {
    const u = queue.pop();
    cluster.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = 1;
        queue.push(v);
      }
    }
  }
  if (cluster.length > 5) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    cluster.forEach(idx => {
      const p = positions[idx];
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
      const uv = uvs[idx];
      minU = Math.min(minU, uv.u); maxU = Math.max(maxU, uv.u);
      minV = Math.min(minV, uv.v); maxV = Math.max(maxV, uv.v);
    });
    clusters.push({
      vertexCount: cluster.length,
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 },
      size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
      uvCenter: { u: (minU + maxU) / 2, v: (minV + maxV) / 2 }
    });
  }
}

console.log('Found', clusters.length, 'clusters in Labels:');
clusters.sort((a, b) => b.vertexCount - a.vertexCount);
clusters.forEach((c, idx) => {
  console.log(`Cluster ${idx}: count=${c.vertexCount}, center=(${c.center.x.toFixed(2)}, ${c.center.y.toFixed(2)}, ${c.center.z.toFixed(2)}), UV=(${c.uvCenter.u.toFixed(2)}, ${c.uvCenter.v.toFixed(2)})`);
});
