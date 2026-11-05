const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'assets', 'js', 'cellquest-adventure.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Target the Front wall creation in buildLaboratoryRoom()
const targetFrontWall = `    // Front Wall (Exit / "Pintu Pakar Sel" - Z = -11)
    const wallFront = new THREE.Mesh(new THREE.BoxGeometry(18, 5, 0.4), wallMat);
    wallFront.position.set(0, 2.5, -11);
    labGroup.add(wallFront);

    // Exit Door Structure ("Pintu Pakar Sel")
    buildExitDoor(labGroup);`;

const replFrontWall = `    // Front Wall with Doorway Opening to Bilik Teras Sel (Z = -11)
    // Left front wall (-9 to -2.1)
    const wallFrontLeft = new THREE.Mesh(new THREE.BoxGeometry(6.9, 5, 0.4), wallMat);
    wallFrontLeft.position.set(-5.55, 2.5, -11);
    labGroup.add(wallFrontLeft);

    // Right front wall (2.1 to 9)
    const wallFrontRight = new THREE.Mesh(new THREE.BoxGeometry(6.9, 5, 0.4), wallMat);
    wallFrontRight.position.set(5.55, 2.5, -11);
    labGroup.add(wallFrontRight);

    // Lintel header wall above doorway opening (Y: 3.8 to 5.0)
    const wallFrontTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 0.4), wallMat);
    wallFrontTop.position.set(0, 4.4, -11);
    labGroup.add(wallFrontTop);

    // Floor Guide Trail (Animated glowing trail leading from center to Pintu Teras Sel)
    floorGuideTrailGroup = buildFloorGuideTrail();
    labGroup.add(floorGuideTrailGroup);

    // Secret Door Structure ("PINTU TERAS SEL")
    buildExitDoor(labGroup);

    // Bonus Room: BILIK TERAS SEL (Cell Core Chamber) behind the secret door
    buildCellCoreChamber(labGroup);`;

if (js.includes(targetFrontWall)) {
  js = js.replace(targetFrontWall, replFrontWall);
  console.log('✓ Updated buildLaboratoryRoom with doorway opening, floor guide, and bonus chamber');
} else {
  console.error('Target front wall not found');
  process.exit(1);
}

// Now replace buildExitDoor with the full enhanced version and add buildFloorGuideTrail, buildCellCoreChamber, updateSecretDoorSign
const targetBuildExitDoor = `  // Build the glowing Exit Door that opens when all 8 badges are earned
  function buildExitDoor(parent) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 0, -10.8);

    // Outer sci-fi frame
    const frameGeo = new THREE.BoxGeometry(5.2, 4.2, 0.6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e2530, metalness: 0.6, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.1;
    doorGroup.add(frame);

    // Door panels (Left & Right sliding doors)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1f3c4d,
      metalness: 0.4,
      roughness: 0.2
    });

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3.6, 0.2), panelMat);
    leftDoor.position.set(-1.05, 1.8, 0);
    doorGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3.6, 0.2), panelMat);
    rightDoor.position.set(1.05, 1.8, 0);
    doorGroup.add(rightDoor);

    // Holographic Lock Shield / Energy Field
    const shieldGeo = new THREE.PlaneGeometry(4.2, 3.6);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Red initially when locked
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.8, 0.15);
    doorGroup.add(shield);

    // Exit Signboard
    const exitSign = createTextPlane('🔒 PINTU PAKAR SEL (KUMPUL 8 LENCANA)', '#ef4444', 4.5, 0.7);
    exitSign.position.set(0, 4.4, 0.2);
    doorGroup.add(exitSign);

    exitDoorMeshes = {
      group: doorGroup,
      leftDoor,
      rightDoor,
      shield,
      exitSign,
      unlocked: false
    };

    parent.add(doorGroup);
  }`;

const replBuildExitDoor = `  // Animated Floor Guide Trail pointing towards Pintu Teras Sel
  function buildFloorGuideTrail() {
    const trailGroup = new THREE.Group();
    trailGroup.name = 'FloorGuideTrail';
    const chevronCount = 7;
    const chevronMeshes = [];

    const chevronMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < chevronCount; i++) {
      const zPos = -2.0 - (i * 1.15);
      const shape = new THREE.Shape();
      shape.moveTo(-0.45, 0.25);
      shape.lineTo(0, -0.2);
      shape.lineTo(0.45, 0.25);
      shape.lineTo(0.32, 0.35);
      shape.lineTo(0, 0.0);
      shape.lineTo(-0.32, 0.35);
      shape.closePath();

      const geo = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geo, chevronMat.clone());
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, 0.025, zPos);
      mesh.userData = { index: i, baseZ: zPos };
      trailGroup.add(mesh);
      chevronMeshes.push(mesh);
    }

    trailGroup.userData = {
      active: false,
      chevrons: chevronMeshes,
      update(t) {
        if (!this.active) return;
        this.chevrons.forEach((m, idx) => {
          const wave = Math.sin(t * 4.0 - idx * 0.85);
          m.material.opacity = 0.35 + Math.max(0, wave) * 0.65;
          m.material.color.setHex(wave > 0.5 ? 0x22d3ee : 0x10b981);
        });
      }
    };

    animatedObjects.push(trailGroup.userData);
    return trailGroup;
  }

  // Build the futuristic Secret Door: PINTU TERAS SEL
  function buildExitDoor(parent) {
    const doorGroup = new THREE.Group();
    doorGroup.name = 'PintuTerasSel_Group';
    doorGroup.position.set(0, 0, -10.8);

    // Outer futuristic sci-fi frame
    const frameGeo = new THREE.BoxGeometry(5.4, 4.3, 0.65);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.7,
      roughness: 0.25
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.15;
    doorGroup.add(frame);

    // Glowing Neon Edge Trims (Cyan & Purple futuristic stripes)
    const trimCyan = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.08, 0.68),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    trimCyan.position.set(0, 4.25, 0);
    doorGroup.add(trimCyan);

    const trimPurpleL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.2, 0.68),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    trimPurpleL.position.set(-2.65, 2.1, 0);
    doorGroup.add(trimPurpleL);

    const trimPurpleR = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.2, 0.68),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    trimPurpleR.position.set(2.65, 2.1, 0);
    doorGroup.add(trimPurpleR);

    // Door panels (Left & Right futuristic sliding doors with hexagon tech patterns)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.2
    });

    const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.6, 0.22), panelMat);
    leftDoor.position.set(-1.05, 1.8, 0);
    doorGroup.add(leftDoor);

    const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.6, 0.22), panelMat);
    rightDoor.position.set(1.05, 1.8, 0);
    doorGroup.add(rightDoor);

    // Sci-fi vertical glow lines on door panels
    const leftDoorGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.2, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    leftDoorGlow.position.set(-0.2, 0, 0);
    leftDoor.add(leftDoorGlow);

    const rightDoorGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.2, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    rightDoorGlow.position.set(0.2, 0, 0);
    rightDoor.add(rightDoorGlow);

    // Holographic Lock Shield / Energy Barrier
    const shieldGeo = new THREE.PlaneGeometry(4.2, 3.6);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.8, 0.16);
    doorGroup.add(shield);

    // Secret Door Status Signboard
    const exitSign = createTextPlane('🔒 PINTU TERAS SEL • TERKUNCI (0/8 STESEN DIPULIHKAN)', '#ef4444', 4.8, 0.7);
    exitSign.position.set(0, 4.45, 0.22);
    doorGroup.add(exitSign);

    exitDoorMeshes = {
      group: doorGroup,
      leftDoor,
      rightDoor,
      shield,
      exitSign,
      unlocked: false
    };

    parent.add(doorGroup);
  }

  // Update Secret Door Signboard Text & Color dynamically
  function updateSecretDoorSign(text, colorHex = '#ef4444') {
    if (!exitDoorMeshes || !exitDoorMeshes.group) return;
    if (exitDoorMeshes.exitSign) {
      exitDoorMeshes.group.remove(exitDoorMeshes.exitSign);
      if (exitDoorMeshes.exitSign.geometry) exitDoorMeshes.exitSign.geometry.dispose();
      if (exitDoorMeshes.exitSign.material) exitDoorMeshes.exitSign.material.dispose();
    }
    const newSign = createTextPlane(text, colorHex, 4.8, 0.7);
    newSign.position.set(0, 4.45, 0.22);
    exitDoorMeshes.group.add(newSign);
    exitDoorMeshes.exitSign = newSign;
  }

  // Bonus Room: BILIK TERAS SEL (Cell Core Chamber) with floating CELL CORE CRYSTAL
  function buildCellCoreChamber(parent) {
    const chamberGroup = new THREE.Group();
    chamberGroup.name = 'CellCoreChamber';

    // 1. Connecting Corridor (from Z = -11.0 to Z = -13.5, width 4.2m, height 5.0m)
    const corridorFloorGeo = new THREE.PlaneGeometry(4.2, 2.8);
    const corridorFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.3
    });
    const corridorFloor = new THREE.Mesh(corridorFloorGeo, corridorFloorMat);
    corridorFloor.rotation.x = -Math.PI / 2;
    corridorFloor.position.set(0, 0.005, -12.3);
    chamberGroup.add(corridorFloor);

    // Corridor walls (Left at X = -2.1, Right at X = 2.1)
    const cWallMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4, metalness: 0.25 });
    const cWallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 2.8), cWallMat);
    cWallL.position.set(-2.1, 2.5, -12.3);
    chamberGroup.add(cWallL);

    const cWallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.0, 2.8), cWallMat);
    cWallR.position.set(2.1, 2.5, -12.3);
    chamberGroup.add(cWallR);

    // Corridor ceiling
    const cCeil = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    cCeil.rotation.x = Math.PI / 2;
    cCeil.position.set(0, 5.0, -12.3);
    chamberGroup.add(cCeil);

    // Sci-fi illuminated archways along corridor
    [-11.0, -12.4, -13.5].forEach(z => {
      const arch = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.15, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      arch.position.set(0, 3.8, z);
      chamberGroup.add(arch);

      const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      pillarL.position.set(-2.0, 1.9, z);
      chamberGroup.add(pillarL);

      const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.8, 0.2), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      pillarR.position.set(2.0, 1.9, z);
      chamberGroup.add(pillarR);
    });

    // 2. Octagonal Chamber Room (Center: X = 0, Z = -19, Radius: 6.2m, Height: 6.0m)
    const chamberCenterX = 0;
    const chamberCenterZ = -19;
    const chamberRadius = 6.2;
    const numSides = 8;

    // Chamber Floor (Octagonal)
    const chamberFloorGeo = new THREE.CylinderGeometry(chamberRadius, chamberRadius, 0.1, numSides);
    const chamberFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.18,
      metalness: 0.4
    });
    const chamberFloor = new THREE.Mesh(chamberFloorGeo, chamberFloorMat);
    chamberFloor.position.set(chamberCenterX, -0.05, chamberCenterZ);
    chamberGroup.add(chamberFloor);

    // Concentric futuristic glowing circuit rings on floor
    [2.8, 4.2, 5.5].forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.04, r + 0.04, 32),
        new THREE.MeshBasicMaterial({
          color: idx % 2 === 0 ? 0x22d3ee : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(chamberCenterX, 0.015, chamberCenterZ);
      chamberGroup.add(ring);
    });

    // Chamber Walls (8 panels around the octagon)
    const sideAngle = (Math.PI * 2) / numSides;
    const wallWidth = 2 * chamberRadius * Math.sin(sideAngle / 2) + 0.15;
    const wallHeight = 6.0;

    for (let i = 0; i < numSides; i++) {
      const angle = i * sideAngle;
      const wallMidX = chamberCenterX + Math.sin(angle) * (chamberRadius * Math.cos(sideAngle / 2));
      const wallMidZ = chamberCenterZ + Math.cos(angle) * (chamberRadius * Math.cos(sideAngle / 2));

      // Leave South entrance open for doorway corridor
      if (Math.abs(wallMidX) < 1.6 && wallMidZ > -15.0) {
        continue;
      }

      const wallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(wallWidth, wallHeight, 0.35),
        new THREE.MeshStandardMaterial({
          color: (i % 2 === 0) ? 0x1e1b4b : 0x0f172a,
          roughness: 0.45,
          metalness: 0.25
        })
      );
      wallMesh.position.set(wallMidX, wallHeight / 2, wallMidZ);
      wallMesh.rotation.y = angle;
      chamberGroup.add(wallMesh);

      // Glowing corner pillars & vertical LED conduits
      const cornerAngle = angle + sideAngle / 2;
      const cornerX = chamberCenterX + Math.sin(cornerAngle) * chamberRadius;
      const cornerZ = chamberCenterZ + Math.cos(cornerAngle) * chamberRadius;

      const cornerPillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, wallHeight, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.2 })
      );
      cornerPillar.position.set(cornerX, wallHeight / 2, cornerZ);
      chamberGroup.add(cornerPillar);

      const cornerLED = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, wallHeight - 0.4, 0.08),
        new THREE.MeshBasicMaterial({ color: (i % 2 === 0) ? 0x22d3ee : 0xc084fc })
      );
      cornerLED.position.set(cornerX, wallHeight / 2, cornerZ);
      chamberGroup.add(cornerLED);
    }

    // Chamber Ceiling
    const chamberCeilGeo = new THREE.CylinderGeometry(chamberRadius * 0.95, chamberRadius, 0.4, numSides);
    const chamberCeil = new THREE.Mesh(chamberCeilGeo, new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6 }));
    chamberCeil.position.set(chamberCenterX, wallHeight + 0.2, chamberCenterZ);
    chamberGroup.add(chamberCeil);

    // Central Chamber Skylight Oculus
    const oculus = new THREE.Mesh(
      new THREE.CircleGeometry(2.0, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    oculus.rotation.x = Math.PI / 2;
    oculus.position.set(chamberCenterX, wallHeight + 0.01, chamberCenterZ);
    chamberGroup.add(oculus);

    // 3. Central Raised Energy Dais Platform at (0, 0, -19)
    const daisBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.7, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x0e1b2e, metalness: 0.5, roughness: 0.2 })
    );
    daisBase.position.set(chamberCenterX, 0.15, chamberCenterZ);
    chamberGroup.add(daisBase);

    const daisUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.1, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.15 })
    );
    daisUpper.position.set(chamberCenterX, 0.42, chamberCenterZ);
    chamberGroup.add(daisUpper);

    // Glowing cyan neon rim on dais
    const daisRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.04, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    daisRim.rotation.x = Math.PI / 2;
    daisRim.position.set(chamberCenterX, 0.55, chamberCenterZ);
    chamberGroup.add(daisRim);

    // 4. FLOATING 3D CELL CORE CRYSTAL (TERAS TENAGA UTAMA)
    const crystalGroup = new THREE.Group();
    crystalGroup.name = 'CellCoreCrystalGroup';
    crystalGroup.position.set(chamberCenterX, 2.1, chamberCenterZ);

    // Main Polyhedron Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
    crystalGeo.scale(1.0, 1.45, 1.0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.92
    });
    const mainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystalGroup.add(mainCrystal);

    // Inner Core Glow Sphere
    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
    );
    crystalGroup.add(coreSphere);

    // 4 Satellite Orbiting Crystal Shards (Amethyst / Purple)
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88
    });
    const shardMeshes = [];
    for (let s = 0; s < 4; s++) {
      const sGeo = new THREE.OctahedronGeometry(0.24, 0);
      sGeo.scale(0.8, 1.3, 0.8);
      const sMesh = new THREE.Mesh(sGeo, shardMat);
      const initAngle = (s / 4) * Math.PI * 2;
      const sRadius = 1.35;
      sMesh.position.set(Math.cos(initAngle) * sRadius, (s % 2 === 0 ? 0.25 : -0.25), Math.sin(initAngle) * sRadius);
      sMesh.userData = { angle: initAngle, radius: sRadius, speed: 0.8 + (s * 0.15), yOffset: sMesh.position.y };
      crystalGroup.add(sMesh);
      shardMeshes.push(sMesh);
    }

    // Holographic Gimbal Rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.035, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide })
    );
    ring1.rotation.x = Math.PI / 4;
    crystalGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.03, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide })
    );
    ring2.rotation.y = Math.PI / 4;
    crystalGroup.add(ring2);

    // Floating Energy Spark Particles (16 particles)
    const sparkGroup = new THREE.Group();
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.85 });
    const sparkMeshes = [];
    for (let p = 0; p < 16; p++) {
      const spark = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04), sparkMat);
      const pAngle = (p / 16) * Math.PI * 2;
      const pRad = 0.9 + Math.random() * 1.1;
      const pY = -0.6 + Math.random() * 1.3;
      spark.position.set(Math.cos(pAngle) * pRad, pY, Math.sin(pAngle) * pRad);
      spark.userData = { angle: pAngle, radius: pRad, speed: 0.5 + Math.random() * 0.5, yBase: pY };
      sparkGroup.add(spark);
      sparkMeshes.push(spark);
    }
    crystalGroup.add(sparkGroup);

    // PointLights for the crystal
    const crystalLight = new THREE.PointLight(0x22d3ee, 2.5, 12);
    crystalLight.position.set(0, 0, 0);
    crystalGroup.add(crystalLight);

    const crystalPurpleLight = new THREE.PointLight(0xa855f7, 1.8, 10);
    crystalPurpleLight.position.set(0, 0.5, 0);
    crystalGroup.add(crystalPurpleLight);

    // Chamber Ambient Light
    const chamberAmbient = new THREE.PointLight(0x6366f1, 1.2, 16);
    chamberAmbient.position.set(chamberCenterX, 5.0, chamberCenterZ);
    chamberGroup.add(chamberAmbient);

    crystalGroup.userData = {
      mainCrystal,
      coreSphere,
      crystalLight,
      crystalPurpleLight,
      chamberAmbient,
      ring1,
      ring2,
      shardMeshes,
      sparkMeshes,
      animatingActivation: false,
      activationProgress: 0,
      update(t) {
        if (this.animatingActivation) {
          this.activationProgress = Math.min(1.0, this.activationProgress + 0.02);
          const spinMultiplier = 1.0 + this.activationProgress * 6.0;
          crystalGroup.rotation.y += 0.025 * spinMultiplier;
          ring1.rotation.z += 0.04 * spinMultiplier;
          ring2.rotation.x -= 0.04 * spinMultiplier;

          mainCrystal.material.emissiveIntensity = 0.7 + this.activationProgress * 1.8;
          crystalLight.intensity = 2.5 + this.activationProgress * 3.5;
          crystalLight.color.setHex(0xfbbf24);
          chamberAmbient.color.setHex(0xf59e0b);
          chamberAmbient.intensity = 1.2 + this.activationProgress * 1.5;
        } else {
          crystalGroup.position.y = 2.1 + Math.sin(t * 1.8) * 0.1;
          crystalGroup.rotation.y = t * 0.5;
          ring1.rotation.z = t * 0.65;
          ring2.rotation.x = -t * 0.55;

          crystalLight.intensity = 2.0 + Math.sin(t * 2.5) * 0.5;

          shardMeshes.forEach(sm => {
            sm.userData.angle += 0.015 * sm.userData.speed;
            sm.position.x = Math.cos(sm.userData.angle) * sm.userData.radius;
            sm.position.z = Math.sin(sm.userData.angle) * sm.userData.radius;
            sm.position.y = sm.userData.yOffset + Math.sin(t * 2.0 + sm.userData.angle) * 0.1;
            sm.rotation.x += 0.02;
            sm.rotation.y += 0.02;
          });

          sparkMeshes.forEach(sp => {
            sp.userData.angle += 0.02 * sp.userData.speed;
            sp.position.x = Math.cos(sp.userData.angle) * sp.userData.radius;
            sp.position.z = Math.sin(sp.userData.angle) * sp.userData.radius;
            sp.position.y = sp.userData.yBase + Math.sin(t * 3.0 + sp.userData.angle) * 0.08;
          });
        }
      }
    };

    animatedObjects.push(crystalGroup.userData);
    chamberGroup.add(crystalGroup);

    cellCoreCrystalGroup = crystalGroup;
    cellCoreChamberGroup = chamberGroup;
    parent.add(chamberGroup);
  }`;

if (js.includes(targetBuildExitDoor)) {
  js = js.replace(targetBuildExitDoor, replBuildExitDoor);
  console.log('✓ Replaced buildExitDoor and added buildFloorGuideTrail and buildCellCoreChamber');
} else {
  console.error('Target buildExitDoor not found');
  process.exit(1);
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Part 2 applied successfully');

