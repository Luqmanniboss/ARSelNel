const fs = require('fs');
const path = require('path');
const THREE = require('three');
// Polyfill GLTFLoader in Node
global.THREE = THREE;
global.FileReader = class {};
global.self = global;

const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

async function inspect(glbRelPath) {
  const filePath = path.join(__dirname, '..', glbRelPath);
  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(arrayBuffer, '', (gltf) => {
      console.log(`\n=== INSPECTING ${glbRelPath} ===`);
      const scene = gltf.scene;
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      console.log('Original Box Size:', [size.x, size.y, size.z]);
      console.log('Original Box Center:', [center.x, center.y, center.z]);

      let meshCount = 0;
      scene.traverse((node) => {
        if (node.isMesh) {
          meshCount++;
          const mat = node.material;
          console.log(`Mesh #${meshCount}: ${node.name} | Visible: ${node.visible} | Mat: ${mat ? mat.type : 'none'}, color: ${mat && mat.color ? '#' + mat.color.getHexString() : 'none'}, opacity: ${mat ? mat.opacity : 'none'}, transparent: ${mat ? mat.transparent : 'none'}`);
        }
      });
      resolve(scene);
    }, (err) => reject(err));
  });
}

async function run() {
  await inspect('models/animal_cell_final.glb');
  await inspect('models/plantcellnew.glb');
}

run().catch(console.error);

