const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'assets', 'js', 'cellquest-adventure.js');
let js = fs.readFileSync(jsPath, 'utf8');

// ==============================================================================
// 1. BUANG PETI HARTA KARUN DARIPADA MOD A
// ==============================================================================

const targetMarkStation = `    // Semak sama ada semua 8 stesen telah selesai
    if (State.completedStations.size >= 8) {
      unlockExitDoor();
      State.treasureHuntUnlocked = true;
      if (!State.treasureHuntCompleted && !State.treasureHuntActive) {
        setTimeout(() => {
          showTreasureHuntIntroModal();
        }, 1200);
      }
    }`;

const replMarkStation = `    // Semak sama ada semua 8 stesen telah selesai
    if (State.completedStations.size >= 8) {
      unlockExitDoor();
      // MOD A: Terus buka Pintu Teras Sel ke Bilik Teras Sel (TIADA PETI HARTA KARUN DALAM MOD A)
      if (State.mode !== '3d') {
        State.treasureHuntUnlocked = true;
        if (!State.treasureHuntCompleted && !State.treasureHuntActive) {
          setTimeout(() => {
            showTreasureHuntIntroModal();
          }, 1200);
        }
      }
    }`;

if (js.includes(targetMarkStation)) {
  js = js.replace(targetMarkStation, replMarkStation);
  console.log('✓ Prevented treasure hunt modal from launching in Mod A');
}

const targetSelectMode3D = `      // Show full room & walkthrough stations, hide AR objects
      if (labEnvironmentGroup) labEnvironmentGroup.visible = true;
      if (walkthroughStationsGroup) walkthroughStationsGroup.visible = true;
      if (arObjectGroup) arObjectGroup.visible = false;`;

const replSelectMode3D = `      // Show full room & walkthrough stations, hide AR objects
      if (labEnvironmentGroup) labEnvironmentGroup.visible = true;
      if (walkthroughStationsGroup) walkthroughStationsGroup.visible = true;
      if (arObjectGroup) arObjectGroup.visible = false;

      // MOD A: Pastikan tiada model peti harta karun atau modal peti dipaparkan
      if (arWorldState && arWorldState.treasureChestGroup) {
        arWorldState.treasureChestGroup.visible = false;
      }
      State.treasureHuntActive = false;
      if (DOM.treasureHuntIntroModal) DOM.treasureHuntIntroModal.classList.remove('open');
      if (DOM.treasureChestModal) DOM.treasureChestModal.classList.remove('open');
      if (DOM.treasureRewardModal) DOM.treasureRewardModal.classList.remove('open');`;

if (js.includes(targetSelectMode3D)) {
  js = js.replace(targetSelectMode3D, replSelectMode3D);
  console.log('✓ Ensured treasure chest is completely hidden when entering Mod A');
}

// ==============================================================================
// 2. REBUILD FUTURISTIC AUTOMATIC SLIDING DOOR (PINTU TERAS SEL)
// ==============================================================================

const targetBuildExitDoor = `  // Build the futuristic Secret Door: PINTU TERAS SEL
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
    exitDoorMeshes.exitSignText = text;
  }`;

const replBuildExitDoor = `  // ==============================================================================
  // FUTURISTIC AUTOMATIC SLIDING DOOR (PINTU TERAS SEL)
  // Reka bentuk berpandukan konsep Sci-Fi Lab Airlock: Bingkai berlubang (hollow frame),
  // dua panel pintu berasingan bergerak ke kiri & kanan, panel status digital,
  // jalur lampu LED sian/ungu, dan pengimbas biometrik tangan.
  // ==============================================================================
  function buildExitDoor(parent) {
    const doorGroup = new THREE.Group();
    doorGroup.name = 'PintuTerasSel_Group';
    doorGroup.position.set(0, 0, -10.8);

    // Bahan Logam Sci-Fi Premium
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.22
    });
    const doorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    const doorTrimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. BINGKAI PINTU HOLLOW (Tiada blok pepejal di tengah laluan bukaan!)
    // A. Tiang Bingkai Kiri (X = -2.45, Width 0.7m, Height 4.2m, Depth 0.5m)
    const pillarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.5), frameMat);
    pillarLeft.position.set(-2.45, 2.1, 0);
    doorGroup.add(pillarLeft);

    // Jalur LED Sian pada Tiang Kiri
    const pillarLightL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.8, 0.52),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    pillarLightL.position.set(-2.15, 2.0, 0.02);
    doorGroup.add(pillarLightL);

    // B. Tiang Bingkai Kanan (X = 2.45, Width 0.7m, Height 4.2m, Depth 0.5m)
    const pillarRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.5), frameMat);
    pillarRight.position.set(2.45, 2.1, 0);
    doorGroup.add(pillarRight);

    // Jalur LED Sian pada Tiang Kanan
    const pillarLightR = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.8, 0.52),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    pillarLightR.position.set(2.15, 2.0, 0.02);
    doorGroup.add(pillarLightR);

    // Pengimbas Biometrik / Status Terminal pada Tiang Kanan
    const scannerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 })
    );
    scannerBox.position.set(2.45, 1.6, 0.28);
    doorGroup.add(scannerBox);

    const scannerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    scannerScreen.position.set(2.45, 1.6, 0.35);
    doorGroup.add(scannerScreen);

    const scannerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    scannerLed.position.set(2.45, 1.95, 0.35);
    doorGroup.add(scannerLed);

    // C. Rasuk Lintel Atas (Header Beam: X = 0, Y = 4.35, Width 5.6m, Height 0.65m, Depth 0.55m)
    const lintelHeader = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.65, 0.55), frameMat);
    lintelHeader.position.set(0, 4.35, 0);
    doorGroup.add(lintelHeader);

    // Jalur Neon Sian Mendatar Atas & Bawah Lintel
    const lintelStripBottom = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.06, 0.57),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    lintelStripBottom.position.set(0, 4.02, 0.02);
    doorGroup.add(lintelStripBottom);

    const lintelStripTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.06, 0.57),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    lintelStripTop.position.set(0, 4.68, 0.02);
    doorGroup.add(lintelStripTop);

    // D. Jalur Ambang Lantai (Floor Threshold Runner)
    const floorRunner = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.025, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    floorRunner.position.set(0, 0.012, 0);
    doorGroup.add(floorRunner);

    // Lampu Siling Pintu (Downlight Spotlight)
    const doorLight = new THREE.PointLight(0xf59e0b, 1.2, 8);
    doorLight.position.set(0, 3.9, 0.3);
    doorGroup.add(doorLight);

    // 2. DUA PANEL PINTU MENGGELONGSOR (SLIDING DOOR LEAVES)
    // Pintu Kiri (Lebar 2.05m, Tinggi 3.7m, Tebal 0.16m)
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.name = 'LeftDoorGroup';
    leftDoorGroup.position.set(-1.025, 1.85, 0); // Kedudukan tertutup rapat di tengah

    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.7, 0.16), doorPanelMat);
    leftDoorGroup.add(leftPanel);

    // Panel inset perak/kelabu sci-fi
    const leftInset = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.4, 0.18), doorTrimMat);
    leftInset.position.set(0.05, 0, 0);
    leftDoorGroup.add(leftInset);

    // 3 Jalur Pengudaraan Sian Bersudut (Diagonal Sci-Fi Vents ///)
    [-0.5, 0, 0.5].forEach(yOffset => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.08, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      vent.position.set(0.2, yOffset, 0.01);
      vent.rotation.z = Math.PI / 6;
      leftDoorGroup.add(vent);
    });

    // Jalur Seam Sian pada Tepi Kanan Pintu Kiri
    const leftSeamLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 3.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    leftSeamLight.position.set(0.98, 0, 0.01);
    leftDoorGroup.add(leftSeamLight);

    // Lencana Bio-DNA Bercahaya pada Pintu Kiri
    const leftDnaBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    leftDnaBadge.rotation.x = Math.PI / 2;
    leftDnaBadge.position.set(-0.35, 1.1, 0.09);
    leftDoorGroup.add(leftDnaBadge);

    doorGroup.add(leftDoorGroup);

    // Pintu Kanan (Lebar 2.05m, Tinggi 3.7m, Tebal 0.16m)
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.name = 'RightDoorGroup';
    rightDoorGroup.position.set(1.025, 1.85, 0); // Kedudukan tertutup rapat di tengah

    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.7, 0.16), doorPanelMat);
    rightDoorGroup.add(rightPanel);

    // Panel inset perak/kelabu sci-fi
    const rightInset = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.4, 0.18), doorTrimMat);
    rightInset.position.set(-0.05, 0, 0);
    rightDoorGroup.add(rightInset);

    // 3 Jalur Pengudaraan Sian Bersudut Mirrored (\\\ )
    [-0.5, 0, 0.5].forEach(yOffset => {
      const vent = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.08, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      vent.position.set(-0.2, yOffset, 0.01);
      vent.rotation.z = -Math.PI / 6;
      rightDoorGroup.add(vent);
    });

    // Jalur Seam Sian pada Tepi Kiri Pintu Kanan
    const rightSeamLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 3.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    rightSeamLight.position.set(-0.98, 0, 0.01);
    rightDoorGroup.add(rightSeamLight);

    // Lencana Bio-DNA Bercahaya pada Pintu Kanan
    const rightDnaBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    rightDnaBadge.rotation.x = Math.PI / 2;
    rightDnaBadge.position.set(0.35, 1.1, 0.09);
    rightDoorGroup.add(rightDnaBadge);

    doorGroup.add(rightDoorGroup);

    // 3. PENGHADANG TENAGA HOLOGRAFIK (ENERGY SHIELD)
    const shieldGeo = new THREE.PlaneGeometry(4.0, 3.6);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.85, 0.08);
    doorGroup.add(shield);

    // 4. PAPAN TANDA DIGITAL STATUS PINTU
    const exitSign = createTextPlane('🔒 PINTU TERAS SEL • TERKUNCI (0/8 STESEN DIPULIHKAN)', '#ef4444', 4.8, 0.65);
    exitSign.position.set(0, 4.4, 0.29);
    doorGroup.add(exitSign);

    // 5. 8 INDIKATOR LED STATUS STESEN (Pill LED Indicators di bawah papan tanda)
    const statusLedMeshes = [];
    const ledMatOff = new THREE.MeshBasicMaterial({ color: 0x334155 });
    for (let i = 0; i < 8; i++) {
      const ledX = -1.575 + (i * 0.45);
      const led = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), ledMatOff.clone());
      led.rotation.x = Math.PI / 2;
      led.position.set(ledX, 4.02, 0.29);
      led.userData = { stationNumber: i + 1 };
      doorGroup.add(led);
      statusLedMeshes.push(led);
    }

    exitDoorMeshes = {
      group: doorGroup,
      leftDoor: leftDoorGroup,
      rightDoor: rightDoorGroup,
      shield,
      exitSign,
      exitSignText: '🔒 PINTU TERAS SEL • TERKUNCI (0/8 STESEN DIPULIHKAN)',
      state: 'LOCKED', // 'LOCKED' | 'OPENING' | 'OPEN'
      unlocked: false,
      scannerLed,
      doorLight,
      pillarLightL,
      pillarLightR,
      statusLeds: statusLedMeshes,
      openProgress: 0
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
    const newSign = createTextPlane(text, colorHex, 4.8, 0.65);
    newSign.position.set(0, 4.4, 0.29);
    exitDoorMeshes.group.add(newSign);
    exitDoorMeshes.exitSign = newSign;
    exitDoorMeshes.exitSignText = text;

    // Kemas kini 8 LED indikator stesen
    if (exitDoorMeshes.statusLeds && State.completedStations) {
      exitDoorMeshes.statusLeds.forEach((led, idx) => {
        const isCompleted = State.completedStations.has(idx + 1);
        if (isCompleted) {
          led.material.color.setHex(0x10b981); // Hijau zamrud
        } else {
          led.material.color.setHex(0x334155); // Kelabu gelap
        }
      });
    }
  }`;

if (js.includes(targetBuildExitDoor)) {
  js = js.replace(targetBuildExitDoor, replBuildExitDoor);
  console.log('✓ Replaced buildExitDoor with Futuristic Automatic Sliding Door');
} else {
  console.error('Target buildExitDoor not found');
  process.exit(1);
}

// ==============================================================================
// 3. ENHANCE unlockExitDoor() WITH STATE MACHINE & SMOOTH SLIDING ANIMATION
// ==============================================================================

const targetUnlockDoor = `  // Unlock Exit Door when all 8 stations are cleared
  function unlockExitDoor() {
    if (!exitDoorMeshes || exitDoorMeshes.unlocked) return;
    exitDoorMeshes.unlocked = true;
    State.cellCoreChamberUnlocked = true;

    if (exitDoorMeshes.shield) {
      exitDoorMeshes.shield.material.color.setHex(0x10b981);
      exitDoorMeshes.shield.material.opacity = 0.15;
    }

    updateSecretDoorSign('⚡ PINTU TERAS SEL • DIBUKA! MASUK KE BILIK TERAS SEL', 0x10b981);

    if (floorGuideTrailGroup) {
      floorGuideTrailGroup.visible = true;
      if (floorGuideTrailGroup.userData) floorGuideTrailGroup.userData.active = true;
    }

    animatedObjects.push({
      progress: 0,
      update() {
        if (this.progress < 1.5) {
          this.progress += 0.025;
          if (exitDoorMeshes.leftDoor) exitDoorMeshes.leftDoor.position.x = -1.05 - this.progress;
          if (exitDoorMeshes.rightDoor) exitDoorMeshes.rightDoor.position.x = 1.05 + this.progress;
        }
      }
    });

    SoundFX.victory();
    alertToast('🌟 TAHNIAH! Semua 8 Lencana Diperoleh! Pintu Teras Sel Kini Terbuka! Masuk ke Bilik Teras!');
  }`;

const replUnlockDoor = `  // Unlock Exit Door when all 8 stations are cleared
  function unlockExitDoor() {
    if (!exitDoorMeshes || exitDoorMeshes.unlocked) return;
    exitDoorMeshes.unlocked = true;
    exitDoorMeshes.state = 'OPENING';
    State.cellCoreChamberUnlocked = true;

    // Tukar lampu pengimbas dan rasuk pintu ke hijau zamrud
    if (exitDoorMeshes.scannerLed) exitDoorMeshes.scannerLed.material.color.setHex(0x10b981);
    if (exitDoorMeshes.doorLight) exitDoorMeshes.doorLight.color.setHex(0x10b981);
    if (exitDoorMeshes.pillarLightL) exitDoorMeshes.pillarLightL.material.color.setHex(0x10b981);
    if (exitDoorMeshes.pillarLightR) exitDoorMeshes.pillarLightR.material.color.setHex(0x10b981);

    // Semua 8 LED indikator stesen menyala hijau zamrud
    if (exitDoorMeshes.statusLeds) {
      exitDoorMeshes.statusLeds.forEach(led => led.material.color.setHex(0x10b981));
    }

    // Kemas kini papan tanda status dengan fasa pembukaan
    updateSecretDoorSign('⚡ MEMBUKA PINTU... AKSES DIBENARKAN (8/8)', 0x22d3ee);

    // Aktifkan laluan berlampu lantai menuju ke bilik teras
    if (floorGuideTrailGroup) {
      floorGuideTrailGroup.visible = true;
      if (floorGuideTrailGroup.userData) floorGuideTrailGroup.userData.active = true;
    }

    // Bunyi futuristik & Notifikasi Pencapaian
    SoundFX.victory();
    alertToast('🌟 SEMUA STESEN BERJAYA DIPULIHKAN!\nSyabas, Saintis Muda! Pintu Teras Sel kini dibuka. Pergi ke bilik rahsia untuk menyelesaikan misi terakhir!');

    // Animasi kedua-dua panel pintu menggelongsor ke tepi (Left door -> -3.15, Right door -> +3.15)
    // Berjalan lancar selama ~1.8 saat dengan kelonggaran quadratic ease-out
    animatedObjects.push({
      animProgress: 0,
      duration: 1.8,
      update(elapsed, delta) {
        if (!exitDoorMeshes || exitDoorMeshes.state === 'OPEN') return;
        const dt = delta || 0.016;
        this.animProgress = Math.min(1.0, this.animProgress + dt / this.duration);
        const ease = 1.0 - Math.pow(1.0 - this.animProgress, 2);

        // Panel Kiri menggelongsor ke dalam dinding kiri: dari -1.025 ke -3.15 (anjakan 2.125m)
        if (exitDoorMeshes.leftDoor) {
          exitDoorMeshes.leftDoor.position.x = -1.025 - (2.125 * ease);
        }
        // Panel Kanan menggelongsor ke dalam dinding kanan: dari +1.025 ke +3.15 (anjakan 2.125m)
        if (exitDoorMeshes.rightDoor) {
          exitDoorMeshes.rightDoor.position.x = 1.025 + (2.125 * ease);
        }

        // Penghadang tenaga memudar dan hilang sepenuhnya
        if (exitDoorMeshes.shield) {
          exitDoorMeshes.shield.material.opacity = Math.max(0, 0.35 * (1.0 - ease));
          if (this.animProgress >= 0.7) {
            exitDoorMeshes.shield.visible = false;
          }
        }

        exitDoorMeshes.openProgress = this.animProgress;

        // Setelah selesai sepenuhnya, tukar state ke OPEN & kemas kini papan tanda
        if (this.animProgress >= 1.0) {
          exitDoorMeshes.state = 'OPEN';
          if (exitDoorMeshes.shield) exitDoorMeshes.shield.visible = false;
          updateSecretDoorSign('⚡ SILA MASUK — BILIK TERAS SEL', 0x10b981);
        }
      }
    });
  }`;

if (js.includes(targetUnlockDoor)) {
  js = js.replace(targetUnlockDoor, replUnlockDoor);
  console.log('✓ Updated unlockExitDoor with smooth sliding animation and OPEN state');
} else {
  console.error('Target unlockDoor not found');
  process.exit(1);
}

// ==============================================================================
// 4. UPDATE updatePlayerMovement() COLLISION FOR CLEAN DOOR PASS-THROUGH
// ==============================================================================

const targetMovementCollision = `    // Multi-Zone Collision System (Main Lab, Corridor, & Bilik Teras Sel)
    let candidateX = nextX;
    let candidateZ = nextZ;
    const doorUnlocked = exitDoorMeshes && exitDoorMeshes.unlocked;

    if (candidateZ < -10.2) {
      // Trying to enter corridor (Z: -10.2 to -14.0) or chamber (Z: -14.0 to -25.0)
      if (!doorUnlocked) {
        // Door is locked, block at Z = -10.2
        candidateZ = -10.2;
        candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      } else {
        // Door is unlocked
        if (candidateZ >= -14.0) {
          // Inside the corridor
          candidateX = Math.max(-1.6, Math.min(1.6, candidateX));
        } else {
          // Inside Bilik Teras Sel (Center: 0, -19.5)
          const distToChamberCenter = Math.hypot(candidateX, candidateZ - (-19.5));
          if (distToChamberCenter > 5.5) {
            if (candidateZ > -15.0 && Math.abs(candidateX) <= 1.6) {
              // Returning back through corridor doorway
            } else {
              const angle = Math.atan2(candidateZ - (-19.5), candidateX);
              candidateX = Math.cos(angle) * 5.5;
              candidateZ = -19.5 + Math.sin(angle) * 5.5;
            }
          }
          // Crystal central barrier (radius 0.8m around 0, -19.5)
          const distToCrystal = Math.hypot(candidateX, candidateZ - (-19.5));
          if (distToCrystal < 0.8) {
            const angle = Math.atan2(candidateZ - (-19.5), candidateX);
            candidateX = Math.cos(angle) * 0.8;
            candidateZ = -19.5 + Math.sin(angle) * 0.8;
          }
        }
      }
    } else {
      // Inside Main Laboratory Room (-10.2 <= Z <= 10.2)
      candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      candidateZ = Math.min(10.2, candidateZ);

      // Central ARSelNel Research Monument Collision in main lab (Radius 2.6m)
      const distToCenter = Math.hypot(candidateX, candidateZ);
      if (distToCenter < 2.6) {
        const angle = Math.atan2(candidateZ, candidateX);
        candidateX = Math.cos(angle) * 2.6;
        candidateZ = Math.sin(angle) * 2.6;
      }
    }`;

const replMovementCollision = `    // Multi-Zone Collision System (Main Lab, Corridor, & Bilik Teras Sel)
    let candidateX = nextX;
    let candidateZ = nextZ;
    // Pintu hanya boleh dilalui apabila pintu dalam keadaan 'OPEN' (atau openProgress >= 0.75)
    const isDoorPassable = exitDoorMeshes && (exitDoorMeshes.state === 'OPEN' || exitDoorMeshes.openProgress >= 0.75);

    if (candidateZ < -10.2) {
      // Hendak melangkah melepasi dinding hadapan / ambang pintu ke lorong atau bilik teras
      if (!isDoorPassable) {
        // Pintu masih TERKUNCI atau sedang MEMBUKA: sekat pergerakan pada Z = -10.2
        candidateZ = -10.2;
        candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      } else {
        // Pintu telah DIBUKA SEPENUHNYA
        if (candidateZ >= -14.0) {
          // Di dalam lorong penghubung (-14.0 <= Z <= -10.2):
          // Ruang bukaan lorong adalah antara X = -1.7 hingga X = 1.7 (lebar 3.4m)
          candidateX = Math.max(-1.7, Math.min(1.7, candidateX));
        } else {
          // Di dalam Bilik Teras Sel (Pusat bilik oktagon: X = 0, Z = -19.0)
          const chamberCenterZ = -19.0;
          const distToChamberCenter = Math.hypot(candidateX, candidateZ - chamberCenterZ);
          if (distToChamberCenter > 5.5) {
            // Pemain berada di dalam lingkungan radius bilik 5.5m; benarkan keluar semula ke lorong di utara
            if (candidateZ > -15.0 && Math.abs(candidateX) <= 1.7) {
              // Melangkah kembali ke lorong
            } else {
              const angle = Math.atan2(candidateZ - chamberCenterZ, candidateX);
              candidateX = Math.cos(angle) * 5.5;
              candidateZ = chamberCenterZ + Math.sin(angle) * 5.5;
            }
          }
          // Penghadang kristal teras pusat (radius 0.85m sekeliling 0, -19.0)
          const distToCrystal = Math.hypot(candidateX, candidateZ - chamberCenterZ);
          if (distToCrystal < 0.85) {
            const angle = Math.atan2(candidateZ - chamberCenterZ, candidateX);
            candidateX = Math.cos(angle) * 0.85;
            candidateZ = chamberCenterZ + Math.sin(angle) * 0.85;
          }
        }
      }
    } else {
      // Di dalam Makmal Utama (-10.2 <= Z <= 10.2)
      candidateX = Math.max(-8.2, Math.min(8.2, candidateX));
      candidateZ = Math.min(10.2, candidateZ);

      // Perlanggaran Meja Penyelidikan Tugu Pusat Makmal (Radius 2.6m)
      const distToCenter = Math.hypot(candidateX, candidateZ);
      if (distToCenter < 2.6) {
        const angle = Math.atan2(candidateZ, candidateX);
        candidateX = Math.cos(angle) * 2.6;
        candidateZ = Math.sin(angle) * 2.6;
      }
    }`;

if (js.includes(targetMovementCollision)) {
  js = js.replace(targetMovementCollision, replMovementCollision);
  console.log('✓ Updated player movement collision with isDoorPassable check');
} else {
  console.error('Target movementCollision not found');
  process.exit(1);
}

// ==============================================================================
// 5. UPDATE PROXIMITY CHECK FOR CELL CORE IN updatePlayerMovement()
// ==============================================================================

const targetProximityCheck = `    // Proximity detection to Cell Core Crystal in Bilik Teras Sel
    const distToCrystal = Math.hypot(player.x - 0, player.z - (-19.5));
    if (distToCrystal <= 3.2 && exitDoorMeshes && exitDoorMeshes.unlocked) {
      State.nearCellCoreCrystal = true;
      State.nearbyStationIndex = -1;
      showCellCorePrompt();
    } else {
      State.nearCellCoreCrystal = false;
      // Proximity detection to 8 stations in main lab
      checkStationProximity();
    }`;

const replProximityCheck = `    // Proximity detection to Cell Core Crystal in Bilik Teras Sel (Center Z = -19.0)
    const distToCrystal = Math.hypot(player.x - 0, player.z - (-19.0));
    if (distToCrystal <= 3.4 && exitDoorMeshes && exitDoorMeshes.unlocked) {
      State.nearCellCoreCrystal = true;
      State.nearbyStationIndex = -1;
      showCellCorePrompt();
    } else {
      State.nearCellCoreCrystal = false;
      // Proximity detection to 8 stations in main lab
      checkStationProximity();
    }`;

if (js.includes(targetProximityCheck)) {
  js = js.replace(targetProximityCheck, replProximityCheck);
  console.log('✓ Updated proximity check to Z = -19.0');
} else {
  console.error('Target proximityCheck not found');
  process.exit(1);
}

// ==============================================================================
// 6. ENHANCE VISUAL POLISH OF CELL CORE CRYSTAL (SOFT GLOW SHELL)
// ==============================================================================

const targetMainCrystal = `    const mainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystalGroup.add(mainCrystal);`;

const replMainCrystal = `    const mainCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystalGroup.add(mainCrystal);

    // Soft Cyan Outer Glow Shell (Additive Blending)
    const glowGeo = new THREE.OctahedronGeometry(0.96, 0);
    glowGeo.scale(1.0, 1.45, 1.0);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    crystalGroup.add(glowMesh);`;

if (js.includes(targetMainCrystal)) {
  js = js.replace(targetMainCrystal, replMainCrystal);
  console.log('✓ Added soft glow shell to Cell Core Crystal');
} else {
  console.error('Target mainCrystal not found');
  process.exit(1);
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Pintu Rahsia and Treasure Chest fixes applied successfully.');
