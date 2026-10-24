(function () {
  'use strict';

  const loading = document.getElementById('cq-loading');
  if (!window.THREE || !THREE.OrbitControls) {
    if (loading) loading.textContent = 'Model 3D tidak dapat dimuatkan. Semak sambungan internet dan muat semula halaman.';
    return;
  }

  // 1. Data Struktur & Fakta Biologi KSSM Tingkatan 1 Bab 2
  const data = {
    membrane: {
      name: 'Membran sel',
      icon: '🫧',
      description: 'Lapisan nipis yang mengelilingi sel. Membran mengawal pergerakan bahan masuk dan keluar sel.',
      fact: 'Membran sel terdapat pada kedua-dua sel haiwan dan sel tumbuhan.'
    },
    cytoplasm: {
      name: 'Sitoplasma',
      icon: '💧',
      description: 'Bahan seperti jeli yang mengisi ruang di dalam sel. Banyak tindak balas kimia sel berlaku dalam sitoplasma.',
      fact: 'Organel sel berada di dalam sitoplasma.'
    },
    nucleus: {
      name: 'Nukleus',
      icon: '🧬',
      description: 'Nukleus mengandungi bahan genetik (DNA) dan mengawal seluruh aktiviti sel.',
      fact: 'Nukleus ialah antara struktur sel yang paling mudah diperhatikan menggunakan mikroskop cahaya makmal sekolah.'
    },
    mitochondria: {
      name: 'Mitokondrion',
      icon: '⚡',
      description: 'Mitokondrion ialah tapak respirasi sel untuk membebaskan tenaga dalam bentuk ATP daripada makanan.',
      fact: 'Bentuknya lazimnya bujur atau memanjang dengan lipatan membran dalam (krista).'
    },
    wall: {
      name: 'Dinding sel',
      icon: '🧱',
      description: 'Lapisan tegar di luar membran sel tumbuhan. Dinding sel menyokong dan melindungi sel serta membantu mengekalkan bentuk tetapnya.',
      fact: 'Dinding sel tumbuhan terutamanya terdiri daripada gentian selulosa.'
    },
    chloroplast: {
      name: 'Kloroplas',
      icon: '☀️',
      description: 'Kloroplas mengandungi pigmen klorofil dan menjadi tapak fotosintesis, iaitu proses menghasilkan glukosa menggunakan tenaga cahaya matahari.',
      fact: 'Kloroplas terdapat dalam sel tumbuhan hijau, tetapi tiada dalam sel haiwan.'
    },
    vacuole: {
      name: 'Vakuol',
      icon: '💧',
      description: 'Dalam sel tumbuhan, vakuol pusat bersaiz besar menyimpan sap sel dan mengekalkan kesegahan sel. Sel haiwan mempunyai vakuol kecil jika ada.',
      fact: 'Vakuol pusat tumbuhan biasanya besar; vakuol sel haiwan bersaiz kecil dan bersifat sementara.'
    },
    er: {
      name: 'Retikulum endoplasma',
      icon: '🛤️',
      description: 'Rangkaian kantung membran dalam sel yang mengangkut bahan sintesis. Jenis kasar mempunyai ribosom pada permukaannya.',
      fact: 'Struktur tambahan untuk penerokaan; bukan fokus utama soalan asas Bab 2.'
    },
    golgi: {
      name: 'Jasad Golgi',
      icon: '📦',
      description: 'Jasad Golgi mengubah suai, menyusun dan membungkus protein serta bahan sel sebelum dihantar ke destinasi tertentu.',
      fact: 'Struktur tambahan untuk penerokaan lanjut biologi sel.'
    },
    ribosome: {
      name: 'Ribosom',
      icon: '🟣',
      description: 'Struktur halus yang terlibat dalam sintesis protein sel.',
      fact: 'Ribosom terlalu seni untuk dilihat secara individu menggunakan mikroskop cahaya biasa.'
    },
    centrioles: {
      name: 'Sentriol',
      icon: '🧭',
      description: 'Sepasang struktur silinder kecil yang membantu pembentukan gentian gelendong semasa pembahagian sel haiwan.',
      fact: 'Sentriol hadir dalam kebanyakan sel haiwan tetapi lazimnya tiada dalam sel tumbuhan aras tinggi.'
    },
    lysosome: {
      name: 'Lisosom',
      icon: '🫧',
      description: 'Vesikel bermembran yang mengandungi enzim hidrolitik untuk mencerna zarah makanan atau menguraikan komponen sel usang.',
      fact: 'Lisosom bertindak sebagai sistem pelupusan dan pertahanan sel.'
    }
  };

  // Sync published organelle facts from Supabase CMS
  if (window.CMSAdapter && typeof window.CMSAdapter.getCellQuestOrganelles === 'function') {
    window.CMSAdapter.getCellQuestOrganelles({ status: 'published' }).then(cmsList => {
      if (Array.isArray(cmsList)) {
        cmsList.forEach(org => {
          if (data[org.id]) {
            data[org.id].name = org.name || data[org.id].name;
            data[org.id].description = org.description || data[org.id].description;
            data[org.id].fact = org.fact || data[org.id].fact;
            if (org.icon) data[org.id].icon = org.icon;
          }
        });
      }
    }).catch(e => console.warn('CellQuest CMS organelle sync warning', e));
  }

  const colors = {
    membrane: 0x13a99c,
    cytoplasm: 0x8ddbd3,
    nucleus: 0x8e4cc4,
    mitochondria: 0xe66a35,
    wall: 0x348a4d,
    chloroplast: 0x4c9b36,
    vacuole: 0x38a9c6,
    er: 0x327bb5,
    golgi: 0xe0a51b,
    ribosome: 0x5943a4,
    centrioles: 0xf0b429,
    lysosome: 0xe985b8
  };

  const core = {
    animal: ['membrane', 'cytoplasm', 'nucleus', 'mitochondria', 'vacuole', 'centrioles', 'lysosome'],
    plant: ['wall', 'membrane', 'cytoplasm', 'nucleus', 'chloroplast', 'vacuole', 'mitochondria']
  };
  const advanced = ['ribosome', 'er', 'golgi'];

  // 2. Laluan Model GLB Baharu
  const CELL_MODELS = {
    animal: '../models/animal_cell_final.glb',
    plant: '../models/plantcellnew.glb'
  };

  // Sync published 3D models from Supabase CMS
  if (window.CMSAdapter && typeof window.CMSAdapter.getCellQuestModels === 'function') {
    window.CMSAdapter.getCellQuestModels({ activeOnly: true }).then(cmsModels => {
      if (Array.isArray(cmsModels)) {
        cmsModels.forEach(m => {
          if (m.cellType && m.modelUrl) {
            CELL_MODELS[m.cellType] = m.modelUrl;
          }
        });
      }
    }).catch(e => console.warn('CellQuest CMS model sync warning', e));
  }

  // Cache Model GLB dalam memori (Muat sekali, guna semula sekerap mungkin)
  const cachedGltfScenes = {
    animal: null,
    plant: null
  };
  let activeLoadRequestId = 0;

  // Pemetaan mesh nama Blender sebenar ke ID organel
  const ANIMAL_MESH_MAP = {
    CellBody_Inner: 'cytoplasm',
    CellBody_Outer: 'membrane',
    Centrioles_01: 'centrioles',
    Centrioles_02: 'centrioles',
    EndoplasmicReticulum: 'er',
    GolgiApparatus: 'golgi',
    Lysosome_01: 'lysosome',
    Lysosome_02: 'lysosome',
    Mitochondria_OuterMembrane: 'mitochondria',
    Mitochondrion: 'mitochondria',
    Nucleus: 'nucleus',
    Nucleus_Cutaway: 'nucleus',
    Nucleus_Inner: 'nucleus',
    Nucleus_Outer: 'nucleus',
    Sphere001: 'vacuole',
    'Sphere.001': 'vacuole'
  };

  // Koordinat Hotspot Anatomi Sel Tumbuhan (Berasaskan skala visual seragam)
  const PLANT_HOTSPOTS = [
    { id: 'wall', pos: [1.32, 0.45, 0.82], radius: 0.22 },
    { id: 'membrane', pos: [1.18, 0.15, 0.72], radius: 0.18 },
    { id: 'vacuole', pos: [-0.05, 0.18, -0.05], radius: 0.35 },
    { id: 'nucleus', pos: [0.72, 0.36, -0.48], radius: 0.28 },
    { id: 'chloroplast', pos: [-0.82, 0.48, 0.65], radius: 0.24 },
    { id: 'chloroplast', pos: [-0.75, -0.35, -0.55], radius: 0.22 },
    { id: 'mitochondria', pos: [0.55, -0.32, 0.25], radius: 0.20 },
    { id: 'mitochondria', pos: [-0.60, -0.28, 0.20], radius: 0.18 },
    { id: 'cytoplasm', pos: [-0.58, 0.12, 0.58], radius: 0.22 },
    { id: 'er', pos: [0.42, 0.62, -0.25], radius: 0.20, advanced: true },
    { id: 'golgi', pos: [0.52, -0.08, 0.30], radius: 0.18, advanced: true },
    { id: 'ribosome', pos: [-0.88, 0.50, 0.78], radius: 0.16, advanced: true }
  ];

  // 3. Konfigurasi Pentas & Render Three.js
  const stage = document.getElementById('cell-stage');
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(4.3, 3.1, 5.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0, 0);
  stage.prepend(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.minDistance = 2.2;
  controls.maxDistance = 10;
  controls.target.set(0, 0.05, 0);
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  // Pencahayaan Makmal 3D yang Terang & Seimbang (Mengekalkan Warna Sebenar GLB)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x66779a, 0.95);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
  keyLight.position.set(4, 7, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.65);
  fillLight.position.set(-4, 2, -4);
  scene.add(fillLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  // Lantai Estetik Hologram
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 48),
    new THREE.MeshBasicMaterial({ color: 0x75cfc3, transparent: true, opacity: 0.07 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.25;
  scene.add(ground);

  // Kumpulan Hierarki Model & AR
  const placement = new THREE.Group();
  scene.add(placement);
  const root = new THREE.Group();
  placement.add(root);

  // Retikel AR
  const reticleGeometry = new THREE.RingGeometry(0.085, 0.11, 36);
  reticleGeometry.rotateX(Math.PI / 2);
  const reticle = new THREE.Mesh(reticleGeometry, new THREE.MeshBasicMaterial({ color: 0x12b8a6, side: THREE.DoubleSide }));
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hitSource = null, xrSession = null, arScale = 0.24, arRotation = 0, pickStart = null;
  const arBasePosition = new THREE.Vector3(), arBaseQuaternion = new THREE.Quaternion();

  // Keadaan UI & Model
  let cell = 'animal';
  let selected = '';
  let showLabels = true;
  let cutaway = true;
  let showAdvanced = false;
  const objects = [];
  const labels = {};
  const repairHidden = new Set();
  let activePlantLabelsMesh = null;
  let activeCutawayMeshes = [];

  // Helper Penciptaan Bahan Sandaran
  function mat(color, opacity = 1) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity >= 0.98,
      side: THREE.DoubleSide
    });
  }

  function addMesh(id, geometry, pos, scale, opacity = 1, opts = {}) {
    const m = new THREE.Mesh(geometry, mat(colors[id], opacity));
    m.position.set(...pos);
    if (scale) m.scale.set(...scale);
    m.userData = {
      id,
      pickable: opts.pickable !== false,
      advanced: !!opts.advanced,
      role: opts.role || '',
      baseEmissive: m.material.emissive ? m.material.emissive.getHex() : 0,
      baseEmissiveIntensity: m.material.emissiveIntensity || 0
    };
    root.add(m);
    objects.push(m);
    return m;
  }

  function ball(id, pos, scale, opts = {}) {
    return addMesh(id, new THREE.SphereGeometry(1, 32, 22), pos, scale, opts.opacity === undefined ? 1 : opts.opacity, opts);
  }

  function tube(id, points, radius, opts = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return addMesh(id, new THREE.TubeGeometry(curve, 32, radius, 7, false), [0, 0, 0], null, 1, { ...opts, pickable: false });
  }

  function label(id, pos) {
    labels[id] = { position: new THREE.Vector3(...pos), button: null };
  }

  function disposeMaterial(material) {
    if (Array.isArray(material)) {
      material.forEach(m => m && m.dispose && m.dispose());
    } else if (material && material.dispose) {
      material.dispose();
    }
  }

  // Pembersihan Model Pentas (Mengelakkan kebocoran memori tanpa memusnahkan cache GLB)
  function clearModel() {
    activePlantLabelsMesh = null;
    activeCutawayMeshes = [];

    root.children.slice().forEach(child => {
      child.traverse(m => {
        // Hanya lupuskan geometri dan bahan prosedural sandaran, JANGAN lupuskan aset GLTF berkongsi
        if (m.geometry && !m.userData.assetShared) {
          m.geometry.dispose();
        }
        if (m.material && !m.userData.assetShared) {
          disposeMaterial(m.material);
        }
      });
      root.remove(child);
    });

    objects.length = 0;
    Object.values(labels).forEach(l => l.button && l.button.remove());
    for (const k of Object.keys(labels)) delete labels[k];
    selected = '';
  }

  function setLabelAnchors() {
    if (cell === 'animal') {
      label('membrane', [1.28, 0.55, 0.05]);
      label('cytoplasm', [1.03, -0.44, 0.14]);
      label('nucleus', [-0.15, 0.32, -0.08]);
      label('mitochondria', [0.7, -0.37, -0.22]);
      label('vacuole', [-0.88, 0.65, 0.38]);
      label('er', [-0.68, 0.56, -0.49]);
      label('golgi', [-0.75, -0.2, 0.05]);
      label('ribosome', [0.9, 0.27, 0.42]);
      label('centrioles', [-0.65, -0.65, 0.32]);
      label('lysosome', [0.98, 0.12, -0.24]);
    } else {
      label('wall', [1.38, 0.65, 0.85]);
      label('membrane', [1.22, 0.12, 0.78]);
      label('cytoplasm', [-0.65, 0.15, 0.68]);
      label('nucleus', [0.74, 0.40, -0.52]);
      label('chloroplast', [-0.84, 0.55, 0.68]);
      label('vacuole', [-0.06, 0.28, -0.05]);
      label('mitochondria', [0.55, -0.34, 0.26]);
      label('er', [0.42, 0.67, -0.22]);
      label('golgi', [0.52, -0.08, 0.3]);
      label('ribosome', [-0.92, 0.55, 0.83]);
    }

    const labelHost = stage.querySelector('#cq-label-layer');
    if (!labelHost) return;

    Object.entries(labels).forEach(([id, l]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cq-model-label';
      b.dataset.id = id;
      b.textContent = data[id] ? data[id].name : id;
      b.setAttribute('aria-label', 'Pilih ' + (data[id] ? data[id].name : id));
      b.addEventListener('click', () => select(id));
      labelHost.appendChild(b);
      l.button = b;
    });
  }

  // 4. Pembinaan Model Import GLB Sebenar (Animal & Plant)
  function buildImportedModel(type, gltfScene) {
    const instance = gltfScene.clone(true);

    // Pengiraan Automatik Bounding Box & Pemusatan Model (Section 7)
    const bounds = new THREE.Box3().setFromObject(instance);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 2.8; // Skala visual optimum seragam
    const fit = targetSize / maxDim;

    const holder = new THREE.Group();
    holder.name = `CellQuest_${type}_AutoFit`;
    holder.scale.setScalar(fit);
    holder.position.copy(center).multiplyScalar(-fit);
    holder.add(instance);
    root.add(holder);
    holder.updateMatrixWorld(true);

    if (type === 'animal') {
      // Pemetaan Organel Sel Haiwan Mengikut Mesh Sebenar
      instance.traverse(node => {
        if (!node.isMesh) return;

        let id = '';
        for (let parent = node; parent && parent !== instance.parent; parent = parent.parent) {
          if (ANIMAL_MESH_MAP[parent.name]) {
            id = ANIMAL_MESH_MAP[parent.name];
            break;
          }
        }
        if (!id && ANIMAL_MESH_MAP[node.name]) {
          id = ANIMAL_MESH_MAP[node.name];
        }

        node.userData = {
          ...node.userData,
          assetShared: true,
          sourceMeshName: node.name,
          id,
          pickable: !!id,
          advanced: id === 'er' || id === 'golgi' || id === 'ribosome',
          role: node.name === 'CellBody_Outer' ? 'outerMembrane' : 'importedOrganelle'
        };

        // Klon bahan agar emissive highlight berfungsi secara bebas tanpa merosakkan cache
        const cloneMat = matInst => {
          const c = matInst.clone();
          c.side = THREE.DoubleSide;
          return c;
        };
        node.material = Array.isArray(node.material) ? node.material.map(cloneMat) : cloneMat(node.material);

        const materials = Array.isArray(node.material) ? node.material : [node.material];
        node.userData.baseEmissive = materials.map(m => (m.emissive ? m.emissive.getHex() : 0));
        node.userData.baseEmissiveIntensity = materials.map(m => m.emissiveIntensity || 0);

        if (node.name === 'CellBody_Outer') {
          activeCutawayMeshes.push(node);
        }

        objects.push(node);
      });

      setLabelAnchors();
      root.updateMatrixWorld(true);

      // Kemas kini kedudukan label mengikut pusat kotak mesh sebenar
      Object.entries(labels).forEach(([id, labelData]) => {
        const group = objects.filter(mesh => mesh.userData.id === id);
        if (!group.length) return;
        const box = new THREE.Box3();
        group.forEach(mesh => box.expandByObject(mesh));
        box.getCenter(labelData.position);
      });

    } else if (type === 'plant') {
      // Model Sel Tumbuhan GLB (opaque, transparent, Labels)
      instance.traverse(node => {
        if (!node.isMesh) return;

        node.userData = {
          ...node.userData,
          assetShared: true,
          sourceMeshName: node.name,
          pickable: true
        };

        const cloneMat = matInst => {
          const c = matInst.clone();
          c.side = THREE.DoubleSide;
          if (c.map) c.map.encoding = THREE.sRGBEncoding;
          return c;
        };
        node.material = Array.isArray(node.material) ? node.material.map(cloneMat) : cloneMat(node.material);

        if (node.name === 'Labels') {
          activePlantLabelsMesh = node;
          node.visible = false; // Sembunyikan label bahasa Inggeris terbina Blender bagi mengelakkan pertindihan teks dengan label KSSM Bahasa Melayu
        } else if (node.name === 'transparent') {
          activeCutawayMeshes.push(node);
          if (node.material) {
            node.material.transparent = true;
            node.material.opacity = cutaway ? 0.32 : 0.85;
          }
        }

        objects.push(node);
      });

      setLabelAnchors();

      // Bina Hotspot & Titik Raycast Interaktif untuk Sel Tumbuhan
      PLANT_HOTSPOTS.forEach(spot => {
        const hitGeo = new THREE.SphereGeometry(spot.radius, 16, 12);
        const hitMat = new THREE.MeshBasicMaterial({
          color: colors[spot.id] || 0x10b981,
          transparent: true,
          opacity: 0.001, // Halimunan semasa biasa, peka sentuhan/klik
          depthWrite: false
        });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.position.set(...spot.pos);
        hitMesh.userData = {
          id: spot.id,
          pickable: true,
          advanced: !!spot.advanced,
          role: 'plantHotspot',
          baseEmissive: 0,
          baseEmissiveIntensity: 0
        };
        root.add(hitMesh);
        objects.push(hitMesh);

        // Selaraskan posisi label HTML
        if (labels[spot.id]) {
          labels[spot.id].position.set(...spot.pos);
        }
      });

      root.updateMatrixWorld(true);
    }
  }

  // 5. Sandaran Prosedural (Procedural Fallback jika GLB gagal)
  function buildAnimalProceduralBackup() {
    addMesh('membrane', new THREE.SphereGeometry(1.45, 56, 36), [0, 0, 0], [1.12, 0.88, 0.92], 0.17, { pickable: false, role: 'closedShell' });
    const curvedShell = addMesh('membrane', new THREE.SphereGeometry(1.45, 56, 36, 0, Math.PI * 2, 0.5, Math.PI - 0.5), [0, 0, 0], [1.12, 0.88, 0.92], 0.22, { pickable: false, role: 'openShell' });
    activeCutawayMeshes.push(curvedShell);

    ball('cytoplasm', [0, 0, 0], [1.39, 0.94, 1.17], { opacity: 0.12, pickable: false });
    ball('nucleus', [-0.14, 0.18, -0.06], [0.45, 0.47, 0.44]);
    ball('nucleus', [-0.04, 0.34, 0.02], [0.13, 0.14, 0.13], { advanced: true });
    ball('vacuole', [-0.72, 0.58, 0.28], [0.12, 0.1, 0.11], { opacity: 0.48 });
    ball('vacuole', [0.83, -0.55, 0.4], [0.1, 0.08, 0.09], { opacity: 0.46 });

    [[-0.78, -0.3, 0.3], [0.68, -0.34, -0.22], [0.58, 0.43, 0.46]].forEach(p => {
      ball('mitochondria', p, [0.34, 0.17, 0.2]);
      const q = p;
      tube('mitochondria', [[q[0] - 0.19, q[1], q[2]], [q[0] - 0.08, q[1] + 0.06, q[2]], [q[0] + 0.02, q[1] - 0.06, q[2]], [q[0] + 0.17, q[1], q[2]]], 0.018, { advanced: true });
    });

    tube('er', [[-0.72, 0.25, -0.5], [-0.46, 0.53, -0.52], [-0.02, 0.57, -0.5], [0.38, 0.42, -0.43], [0.53, 0.12, -0.4]], 0.05, { advanced: true });
    tube('er', [[-0.76, 0.1, -0.55], [-0.47, 0.25, -0.6], [-0.02, 0.31, -0.55], [0.42, 0.17, -0.48], [0.62, -0.05, -0.34]], 0.045, { advanced: true });
    [-0.13, -0.02, 0.09, 0.2].forEach((y) => tube('golgi', [[-0.82 + y * 0.3, y, -0.03], [-0.61 + y * 0.2, y + 0.07, 0.03], [-0.38 + y * 0.15, y + 0.06, 0.05], [-0.18 + y * 0.1, y, 0]], 0.031, { advanced: true }));
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4;
      ball('ribosome', [Math.cos(a) * (0.72 + (i % 3) * 0.05), Math.sin(i * 1.7) * 0.58, Math.sin(a) * 0.73], [0.035, 0.035, 0.035], { advanced: true });
    }
    setLabelAnchors();
  }

  function wallPanel(pos, size, rotation) {
    const mesh = addMesh('wall', new THREE.PlaneGeometry(size[0], size[1]), pos, null, 0.36, { pickable: false, role: 'wallPanel' });
    mesh.rotation.set(...rotation);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0x267442, transparent: true, opacity: 0.8 }));
    edge.position.copy(mesh.position);
    edge.rotation.copy(mesh.rotation);
    edge.userData = { id: 'wall', pickable: false, advanced: false, role: 'wallEdge', panel: mesh };
    root.add(edge);
    objects.push(edge);
    mesh.userData.border = edge;
    return mesh;
  }

  function buildPlantProceduralBackup() {
    wallPanel([0, 0, -1.17], [2.8, 1.95], [0, 0, 0]);
    wallPanel([-1.4, 0, 0], [2.34, 1.95], [0, -Math.PI / 2, 0]);
    wallPanel([1.4, 0, 0], [2.34, 1.95], [0, Math.PI / 2, 0]);
    wallPanel([0, 0.97, 0], [2.8, 2.34], [-Math.PI / 2, 0, 0]);
    wallPanel([0, -0.97, 0], [2.8, 2.34], [Math.PI / 2, 0, 0]);

    const front = wallPanel([0, 0, 1.17], [2.8, 1.95], [0, Math.PI, 0]);
    front.userData.role = 'frontWall';
    if (front.userData.border) {
      front.userData.border.userData.role = 'wallEdge';
      front.userData.border.userData.panel = front;
    }
    activeCutawayMeshes.push(front);

    const inner = addMesh('membrane', new THREE.BoxGeometry(2.55, 1.68, 2.12), [0, 0, 0], null, 0.055, { pickable: false, role: 'innerMembrane' });
    inner.material.wireframe = true;
    inner.material.depthWrite = false;

    ball('cytoplasm', [0, 0, 0], [1.13, 0.68, 0.91], { opacity: 0.09, pickable: false });
    ball('vacuole', [-0.08, -0.02, -0.02], [0.78, 0.53, 0.69], { opacity: 0.52 });
    ball('nucleus', [0.79, 0.34, -0.54], [0.27, 0.29, 0.27]);

    [[-0.86, 0.57, 0.7], [0.74, 0.54, 0.68], [-0.91, -0.49, -0.65], [0.83, -0.5, -0.63], [0.83, 0.49, -0.05], [-0.83, 0.52, -0.43]].forEach((p, i) => {
      const c = ball('chloroplast', p, [0.24, 0.12, 0.15]);
      c.rotation.z = i % 2 ? 0.38 : -0.32;
    });

    [[-0.68, -0.34, 0.18], [0.57, -0.34, 0.25], [0.35, 0.58, 0.5]].forEach(p => ball('mitochondria', p, [0.19, 0.1, 0.11]));
    tube('er', [[0.39, 0.46, -0.53], [0.28, 0.62, -0.23], [0.37, 0.54, 0.08], [0.57, 0.4, 0.25]], 0.035, { advanced: true });
    [-0.15, -0.05, 0.05, 0.15].forEach(y => tube('golgi', [[0.2 + y, y, 0.28], [0.4 + y, y + 0.04, 0.32], [0.58 + y, y + 0.02, 0.29]], 0.026, { advanced: true }));
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4;
      ball('ribosome', [Math.cos(a) * 0.89, Math.sin(i * 1.7) * 0.44, Math.sin(a) * 0.77], [0.03, 0.03, 0.03], { advanced: true });
    }
    setLabelAnchors();
  }

  // 6. Sistem Pemuat Model Bersatu (Shared Model Loading System - Section 5)
  function loadModel(cellType) {
    const requestId = ++activeLoadRequestId;
    const caption = document.getElementById('stage-caption');

    // Jika model sudah dimuatkan dalam cache, paparkan terus
    if (cachedGltfScenes[cellType]) {
      if (cell === cellType) {
        clearModel();
        buildImportedModel(cellType, cachedGltfScenes[cellType]);
        applyVisibility();
        loading.classList.add('hidden');
        if (caption) {
          caption.textContent = cellType === 'animal'
            ? 'Model 3D Sel Haiwan • klik organel untuk meneroka'
            : 'Model 3D Sel Tumbuhan • klik organel untuk meneroka';
          caption.title = 'Model GLB sedia ada berjaya dipaparkan.';
        }
      }
      return;
    }

    // Teks Memuatkan mengikut jenis sel (Section 3 & 4)
    const loadingText = cellType === 'animal'
      ? 'Memuatkan model sel haiwan…'
      : 'Memuatkan model sel tumbuhan…';

    if (loading) {
      loading.textContent = loadingText;
      loading.classList.remove('hidden');
    }
    if (caption) {
      caption.textContent = loadingText;
    }

    if (location.protocol === 'file:') {
      failLoad(cellType, new Error('Pelayar menyekat pemuatan GLB melalui file://. Sila buka melalui http://localhost:3000/cellquest/code.html.'));
      return;
    }

    if (!THREE.GLTFLoader) {
      failLoad(cellType, new Error('THREE.GLTFLoader tidak tersedia pada pelayar.'));
      return;
    }

    const loader = new THREE.GLTFLoader();
    const assetUrl = CELL_MODELS[cellType];

    try {
      loader.load(
        assetUrl,
        (gltf) => {
          cachedGltfScenes[cellType] = gltf.scene;

          // Semak sama ada murid masih berada pada tab ini (Elak race-condition pertukaran tab pantas)
          if (cell === cellType && requestId === activeLoadRequestId) {
            clearModel();
            buildImportedModel(cellType, gltf.scene);
            applyVisibility();
            if (caption) {
              caption.textContent = cellType === 'animal'
                ? 'Model 3D Sel Haiwan • klik organel untuk meneroka'
                : 'Model 3D Sel Tumbuhan • klik organel untuk meneroka';
              caption.title = 'Model GLB berjaya dimuatkan dan dirender.';
            }
          }
          if (cell === cellType) {
            if (loading) loading.classList.add('hidden');
          }
        },
        (event) => {
          if (event.lengthComputable && cell === cellType && loading) {
            const pct = Math.round((event.loaded / event.total) * 100);
            loading.textContent = `${loadingText} ${pct}%`;
          }
        },
        (error) => {
          failLoad(cellType, error);
        }
      );
    } catch (err) {
      failLoad(cellType, err);
    }
  }

  function failLoad(cellType, error) {
    console.error(`[CellQuest3D] Ralat memuatkan model GLB (${cellType}):`, error);
    if (loading) loading.classList.add('hidden');

    const caption = document.getElementById('stage-caption');
    const msg = error && error.message ? error.message : 'Fail GLB tidak dapat diakses atau ralat rangkaian.';
    if (caption) {
      caption.textContent = `Model ${cellType === 'animal' ? 'sel haiwan' : 'sel tumbuhan'} gagal dimuatkan: ${msg} (Model sandaran dipaparkan).`;
      caption.title = msg;
    }

    // Aktifkan model prosedural sandaran sekiranya gagal memuatkan GLB
    if (cell === cellType) {
      clearModel();
      if (cellType === 'animal') {
        buildAnimalProceduralBackup();
      } else {
        buildPlantProceduralBackup();
      }
      applyVisibility();
    }
  }

  // 7. Pengurusan Antara Muka & Senarai Organel
  function renderList() {
    const coreHost = document.getElementById('core-list');
    const advHost = document.getElementById('advanced-list');
    if (!coreHost || !advHost) return;

    coreHost.innerHTML = '';
    advHost.innerHTML = '';

    const keys = core[cell];
    const countEl = document.getElementById('core-count');
    if (countEl) countEl.textContent = keys.length + ' struktur';

    keys.forEach(id => makeListButton(coreHost, id));
    advanced.forEach(id => makeListButton(advHost, id));
  }

  function makeListButton(host, id) {
    if (!data[id]) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cq-organelle-btn';
    b.dataset.id = id;
    b.innerHTML = `<span class="emoji">${data[id].icon}</span><span>${data[id].name}</span>`;
    b.addEventListener('click', () => select(id));
    host.appendChild(b);
  }

  function select(id) {
    if (!data[id]) return;
    selected = id;
    const d = data[id];

    const iconEl = document.getElementById('organelle-icon');
    const nameEl = document.getElementById('organelle-name');
    const descEl = document.getElementById('organelle-description');
    const factEl = document.getElementById('organelle-fact');

    if (iconEl) iconEl.textContent = d.icon;
    if (nameEl) nameEl.textContent = d.name;

    let description = (id === 'vacuole' && cell === 'animal')
      ? 'Sesetengah sel haiwan mempunyai vakuol kecil yang menyimpan bahan; vakuol ini tidak sebesar vakuol pusat sel tumbuhan.'
      : d.description;

    if (descEl) descEl.textContent = description;
    if (factEl) factEl.textContent = '💡 ' + d.fact;

    document.querySelectorAll('.cq-organelle-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.id === id);
    });

    if (window.CellQuestMissions) CellQuestMissions.onSelect(id, cell);
    if (window.CellQuestAR) window.CellQuestAR.onSelect(id, d, cell);
  }

  function applyVisibility() {
    objects.forEach(m => {
      m.visible = !m.userData.advanced || showAdvanced;

      if (m.userData.role === 'closedShell') m.visible = !cutaway;
      if (m.userData.role === 'openShell') m.visible = cutaway;
      if (m.userData.role === 'frontWall') m.visible = !cutaway;
      if (m.userData.role === 'wallEdge') m.visible = m.userData.panel && m.userData.panel.visible;
      if (m.userData.role === 'outerMembrane') {
        if (m.material) {
          m.material.transparent = true;
          m.material.opacity = cutaway ? 0.45 : 1.0;
        }
      }
      if (m.name === 'transparent') {
        if (m.material) {
          m.material.transparent = true;
          m.material.opacity = cutaway ? 0.32 : 0.85;
        }
      }
      if (repairHidden.has(m.userData.id)) m.visible = false;
    });

    // Sembunyikan label 3D bahasa Inggeris terbina Blender supaya tidak bertindih dengan label KSSM Bahasa Melayu
    if (activePlantLabelsMesh) {
      activePlantLabelsMesh.visible = false;
    }

    // Kawalan Paparan Label Butang HTML
    Object.entries(labels).forEach(([id, l]) => {
      const isVisibleType = core[cell].includes(id) || showAdvanced;
      if (l.button) {
        l.button.hidden = !showLabels || !isVisibleType;
      }
    });
  }

  function switchCell(next) {
    cell = next;
    repairHidden.clear();
    clearModel();

    renderList();

    document.querySelectorAll('.cq-tab').forEach(b => {
      const active = b.dataset.cell === next;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });

    const titleEl = document.getElementById('cell-title');
    if (titleEl) titleEl.textContent = next === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan';

    const iconEl = document.getElementById('organelle-icon');
    if (iconEl) iconEl.textContent = next === 'animal' ? '🧬' : '🌿';

    const nameEl = document.getElementById('organelle-name');
    if (nameEl) nameEl.textContent = 'Pilih satu struktur';

    const descEl = document.getElementById('organelle-description');
    if (descEl) descEl.textContent = 'Pilih label pada model atau nama struktur dalam senarai.';

    const factEl = document.getElementById('organelle-fact');
    if (factEl) factEl.textContent = '💡 Model ini menunjukkan struktur biologi sel sebenar.';

    const advToggle = document.getElementById('advanced-toggle');
    if (advToggle) {
      advToggle.setAttribute('aria-expanded', 'false');
      advToggle.textContent = '＋ Struktur tambahan untuk penerokaan';
    }
    const advNote = document.getElementById('advanced-note');
    if (advNote) advNote.hidden = true;
    const advList = document.getElementById('advanced-list');
    if (advList) advList.hidden = true;
    showAdvanced = false;

    // Muatkan Model GLB Melalui Sistem Pemuat Bersatu
    loadModel(next);

    camera.position.set(4.3, 3.1, 5.5);
    controls.target.set(0, 0.05, 0);
    controls.update();

    if (window.CellQuestMissions) CellQuestMissions.onCellChange(cell);
    if (window.CellQuestAR) CellQuestAR.refreshLabels();
  }

  function updateLabels() {
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    const placed = [];
    const candidates = [
      [0, 0], [0, -34], [0, 34], [56, 0], [-56, 0],
      [48, -35], [-48, -35], [48, 35], [-48, 35],
      [0, -70], [0, 70], [90, 0], [-90, 0],
      [80, -65], [-80, -65], [80, 65], [-80, 65]
    ];

    const entries = Object.entries(labels)
      .filter(([id, l]) => l.button && (core[cell].includes(id) || (showAdvanced && advanced.includes(id))))
      .sort(([a], [b]) => Number(advanced.includes(a)) - Number(advanced.includes(b)));

    Object.entries(labels).forEach(([, l]) => {
      if (l.button) l.button.hidden = true;
    });

    if (!showLabels) return;

    entries.forEach(([id, l]) => {
      const v = l.position.clone().project(camera);
      if (v.z <= -1 || v.z >= 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) return;

      const b = l.button;
      b.hidden = false;
      const bw = b.offsetWidth || 88;
      const bh = b.offsetHeight || 26;
      const baseX = (v.x + 1) * 0.5 * width;
      const baseY = (1 - v.y) * 0.5 * height;

      let chosen = null;
      for (const [dx, dy] of candidates) {
        const x = Math.min(width - bw / 2 - 4, Math.max(bw / 2 + 4, baseX + dx));
        const y = Math.min(height - bh / 2 - 4, Math.max(bh / 2 + 4, baseY + dy));
        const box = { left: x - bw / 2 - 4, right: x + bw / 2 + 4, top: y - bh / 2 - 3, bottom: y + bh / 2 + 3 };
        if (!placed.some(p => box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top)) {
          chosen = { x, y, box };
          break;
        }
      }
      if (!chosen) {
        b.hidden = true;
        return;
      }
      b.style.left = chosen.x + 'px';
      b.style.top = chosen.y + 'px';
      placed.push(chosen.box);
    });
  }

  // 8. Interaksi Tetikus & Sentuhan (Raycasting Pintar)
  renderer.domElement.addEventListener('pointerdown', event => {
    pickStart = { x: event.clientX, y: event.clientY };
  });

  renderer.domElement.addEventListener('pointerup', event => {
    if (!pickStart) return;
    const moved = Math.hypot(event.clientX - pickStart.x, event.clientY - pickStart.y);
    pickStart = null;
    if (moved > 6) return; // Mengabaikan seretan putaran kamera

    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - r.left) / r.width) * 2 - 1,
      -((event.clientY - r.top) / r.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);

    const pickables = objects.filter(m => m.visible && m.userData.pickable);
    const hits = raycaster.intersectObjects(pickables, false);

    if (hits.length > 0) {
      const topHit = hits[0];
      if (topHit.object.userData.id) {
        select(topHit.object.userData.id);
      } else if (cell === 'plant') {
        // Jika klik pada mesh sel tumbuhan (opaque/transparent), cari hotspot terdekat dengan titik persilangan
        const hitPoint = topHit.point;
        let nearestId = 'membrane';
        let nearestDist = Infinity;

        PLANT_HOTSPOTS.forEach(spot => {
          const sPos = new THREE.Vector3(...spot.pos);
          const d = hitPoint.distanceTo(sPos);
          if (d < nearestDist) {
            nearestDist = d;
            nearestId = spot.id;
          }
        });

        if (nearestId) {
          select(nearestId);
        }
      }
    }
  });

  document.querySelectorAll('.cq-tab').forEach(b => {
    b.addEventListener('click', () => switchCell(b.dataset.cell));
  });

  function resetView() {
    camera.position.set(4.3, 3.1, 5.5);
    controls.target.set(0, 0.05, 0);
    controls.update();
  }

  const resetBtn = document.getElementById('reset-view');
  if (resetBtn) resetBtn.addEventListener('click', resetView);

  const toggleLabelsBtn = document.getElementById('toggle-labels');
  if (toggleLabelsBtn) {
    toggleLabelsBtn.addEventListener('click', e => {
      showLabels = !showLabels;
      e.currentTarget.setAttribute('aria-pressed', String(showLabels));
      e.currentTarget.textContent = showLabels ? '🏷️ Sembunyikan label' : '🏷️ Paparkan label';
      applyVisibility();
    });
  }

  const toggleCutawayBtn = document.getElementById('toggle-cutaway');
  if (toggleCutawayBtn) {
    toggleCutawayBtn.addEventListener('click', e => {
      cutaway = !cutaway;
      e.currentTarget.setAttribute('aria-pressed', String(cutaway));
      e.currentTarget.textContent = cutaway ? '◐ Keratan: aktif' : '◐ Keratan: tutup';
      applyVisibility();
    });
  }

  const togglePanBtn = document.getElementById('toggle-pan');
  if (togglePanBtn) {
    togglePanBtn.addEventListener('click', e => {
      controls.enablePan = !controls.enablePan;
      e.currentTarget.setAttribute('aria-pressed', String(controls.enablePan));
      e.currentTarget.textContent = controls.enablePan ? '✥ Anjak: aktif' : '✥ Anjak: tutup';
    });
  }

  const advToggleBtn = document.getElementById('advanced-toggle');
  if (advToggleBtn) {
    advToggleBtn.addEventListener('click', e => {
      showAdvanced = !showAdvanced;
      e.currentTarget.setAttribute('aria-expanded', String(showAdvanced));
      e.currentTarget.textContent = showAdvanced ? '− Tutup struktur tambahan' : '＋ Struktur tambahan untuk penerokaan';

      const advNote = document.getElementById('advanced-note');
      if (advNote) advNote.hidden = !showAdvanced;
      const advList = document.getElementById('advanced-list');
      if (advList) advList.hidden = !showAdvanced;

      applyVisibility();

      if (selected && advanced.includes(selected) && !showAdvanced) {
        selected = '';
        const nameEl = document.getElementById('organelle-name');
        if (nameEl) nameEl.textContent = 'Pilih satu struktur';
        const descEl = document.getElementById('organelle-description');
        if (descEl) descEl.textContent = 'Pilih label pada model atau nama struktur dalam senarai.';
      }
    });
  }

  function resize() {
    const host = renderer.domElement.parentElement || stage;
    if (!host) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(resize).observe(stage);
  resize();

  // 9. Fungsi Keserasian AR (Realiti Terimbuh)
  function updateArPose() {
    placement.quaternion.copy(arBaseQuaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), arRotation));
    placement.position.copy(arBasePosition).add(new THREE.Vector3(0, (cell === 'animal' ? 1.26 : 1.0) * arScale, 0).applyQuaternion(arBaseQuaternion));
    placement.scale.setScalar(arScale);
  }

  function setRepairDamage(id, damaged) {
    if (damaged) repairHidden.add(id);
    else repairHidden.delete(id);
    applyVisibility();
  }

  function placeRepairOrganelle(id) {
    repairHidden.delete(id);
    applyVisibility();
    if (window.CellQuestAR) CellQuestAR.refreshLabels();
  }

  function placeOnHit(pose) {
    if (!pose) return;
    const scale = new THREE.Vector3();
    reticle.matrix.decompose(arBasePosition, arBaseQuaternion, scale);
    arRotation = 0;
    updateArPose();
    placement.visible = true;
    reticle.visible = false;
    if (window.CellQuestAR) CellQuestAR.onPlaced();
  }

  async function enterAR(session) {
    xrSession = session;
    arScale = 0.24;
    placement.visible = false;
    reticle.visible = false;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    controls.enabled = false;
    try {
      await renderer.xr.setSession(session);
    } catch (error) {
      xrSession = null;
      controls.enabled = true;
      renderer.xr.enabled = false;
      placement.visible = true;
      throw error;
    }
    session.addEventListener('end', () => {
      if (hitSource) {
        hitSource.cancel();
        hitSource = null;
      }
      xrSession = null;
      reticle.visible = false;
      placement.visible = true;
      controls.enabled = true;
      renderer.xr.enabled = false;
      if (window.CellQuestAR) CellQuestAR.onEnded();
    }, { once: true });
    try {
      const viewer = await session.requestReferenceSpace('viewer');
      hitSource = await session.requestHitTestSource({ space: viewer });
    } catch (error) {
      await session.end();
      throw error;
    }
  }

  async function exitAR() {
    if (xrSession) await xrSession.end();
  }

  function repositionAR() {
    placement.visible = false;
    reticle.visible = false;
    if (window.CellQuestAR) CellQuestAR.onReposition();
  }

  function adjustARScale(factor) {
    arScale = Math.max(0.12, Math.min(0.65, arScale * factor));
    updateArPose();
  }

  function rotateAR() {
    arRotation += Math.PI / 12;
    updateArPose();
  }

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (!renderer.xr.isPresenting) return;
    if (!placement.visible) {
      if (reticle.visible) placeOnHit(true);
      return;
    }
    raycaster.setFromXRController(controller);
    const hits = raycaster.intersectObjects(objects.filter(m => m.visible && m.userData.pickable), false);
    if (hits.length && hits[0].object.userData.id) select(hits[0].object.userData.id);
  });
  scene.add(controller);

  // 10. Gelung Animasi (Render Loop dengan Emissive Pulse untuk Pilihan Aktif)
  function animate(time, frame) {
    if (controls.enabled) controls.update();

    if (frame && renderer.xr.isPresenting && hitSource && !placement.visible) {
      const results = frame.getHitTestResults(hitSource);
      if (results.length) {
        const pose = results[0].getPose(renderer.xr.getReferenceSpace());
        reticle.matrix.fromArray(pose.transform.matrix);
        reticle.matrixWorldNeedsUpdate = true;
        reticle.visible = true;
        if (window.CellQuestAR) CellQuestAR.onSurfaceFound();
      } else {
        reticle.visible = false;
        if (window.CellQuestAR) CellQuestAR.onSurfaceLost();
      }
    }

    const pulse = 0.38 + 0.28 * (0.5 + 0.5 * Math.sin(performance.now() * 0.004));

    objects.forEach(m => {
      const materials = Array.isArray(m.material) ? m.material : [m.material];
      const baseColors = Array.isArray(m.userData.baseEmissive) ? m.userData.baseEmissive : [m.userData.baseEmissive ?? 0];
      const baseIntensities = Array.isArray(m.userData.baseEmissiveIntensity) ? m.userData.baseEmissiveIntensity : [m.userData.baseEmissiveIntensity ?? 0];

      materials.forEach((material, i) => {
        if (!material || !material.emissive) return;
        const active = m.userData.id === selected;
        material.emissive.setHex(active ? 0xffd166 : (baseColors[i] || 0));
        material.emissiveIntensity = active ? pulse : (baseIntensities[i] || 0);
      });
    });

    updateLabels();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  // Permulaan Awal: Muatkan Sel Haiwan
  switchCell('animal');

  // API Awam Window
  window.CellQuest3D = {
    getCell: () => cell,
    switchCell,
    select,
    getCore: () => core[cell].map(id => ({ id, ...data[id] })),
    setRepairDamage,
    placeRepairOrganelle,
    enterAR,
    exitAR,
    repositionAR,
    placeFromReticle: () => {
      if (reticle.visible) placeOnHit(true);
    },
    adjustARScale,
    rotateAR,
    isArActive: () => renderer.xr.isPresenting,
    isPlaced: () => placement.visible,
    domElement: renderer.domElement,
    stage: stage,
    resize: resize,
    resetView: resetView,
    zoomBy: (factor) => {
      camera.position.multiplyScalar(factor);
      controls.update();
    },
    rotateBy: (rad) => {
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);
      controls.update();
    }
  };
})();
