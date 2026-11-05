const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'assets', 'js', 'cellquest-adventure.js');
let js = fs.readFileSync(jsPath, 'utf8');

// ==============================================================================
// 1. ADD MODAL, GYRO, INTERACTION, AND CELL CORE FUNCTIONS
// We will place them right before "function updatePlayerMovement()"
// ==============================================================================

const helperFunctionsBlock = `
  // ==============================================================================
  // MOD A — ENHANCED FUNCTIONS (MODAL, GYRO, INTERACTION, BILIK TERAS SEL)
  // ==============================================================================

  function openLab3DStoryMissionModal() {
    if (DOM.lab3dStoryMissionModal) {
      DOM.lab3dStoryMissionModal.classList.add('open');
      SoundFX.interact();
    }
  }

  function closeLab3DStoryMissionModal() {
    if (DOM.lab3dStoryMissionModal) {
      DOM.lab3dStoryMissionModal.classList.remove('open');
    }
  }

  function openLab3DCalibrationModal() {
    if (DOM.lab3dCalibrationModal) {
      DOM.lab3dCalibrationModal.classList.add('open');
      SoundFX.interact();
    }
  }

  function closeLab3DCalibrationModal() {
    if (DOM.lab3dCalibrationModal) {
      DOM.lab3dCalibrationModal.classList.remove('open');
    }
  }

  function openLab3DCrystalVictoryModal() {
    if (DOM.lab3dCrystalVictoryModal) {
      if (DOM.lab3dFinalScore) DOM.lab3dFinalScore.textContent = \`\${State.score} Mata\`;
      if (DOM.lab3dFinalStations) DOM.lab3dFinalStations.textContent = \`\${State.completedStations.size} / 8 Stesen\`;
      if (DOM.lab3dFinalTime) DOM.lab3dFinalTime.textContent = formatTime(State.durationSeconds);
      DOM.lab3dCrystalVictoryModal.classList.add('open');
      SoundFX.victory();
    }
  }

  function closeLab3DCrystalVictoryModal() {
    if (DOM.lab3dCrystalVictoryModal) {
      DOM.lab3dCrystalVictoryModal.classList.remove('open');
    }
  }

  function onModADeviceOrientation(e) {
    if (!modAGyro.active || State.mode !== '3d') return;
    if (e.alpha === null || e.beta === null || e.gamma === null) return;

    if (!modAGyro.calibrated) {
      modAGyro.calibrated = true;
      modAGyro.baseAlpha = e.alpha;
      modAGyro.baseBeta = e.beta;
      modAGyro.baseGamma = e.gamma;
      modAGyro.currentAlpha = e.alpha;
      modAGyro.currentBeta = e.beta;
      modAGyro.currentGamma = e.gamma;
      return;
    }

    const smoothing = 0.25;
    modAGyro.currentAlpha += (e.alpha - modAGyro.currentAlpha) * smoothing;
    modAGyro.currentBeta += (e.beta - modAGyro.currentBeta) * smoothing;
    modAGyro.currentGamma += (e.gamma - modAGyro.currentGamma) * smoothing;

    let deltaAlpha = modAGyro.currentAlpha - modAGyro.baseAlpha;
    while (deltaAlpha > 180) deltaAlpha -= 360;
    while (deltaAlpha < -180) deltaAlpha += 360;

    const restingBeta = 45;
    let deltaBeta = (modAGyro.currentBeta - restingBeta);
    deltaBeta = Math.max(-60, Math.min(60, deltaBeta));

    modAGyro.yaw = THREE.MathUtils.degToRad(-deltaAlpha);
    modAGyro.pitch = THREE.MathUtils.degToRad(-deltaBeta);
  }

  async function enableModAGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          modAGyro.active = true;
          modAGyro.calibrated = false;
          window.addEventListener('deviceorientation', onModADeviceOrientation);
          alertToast('🧭 Sensor pandangan diaktifkan!');
          return true;
        }
      } catch (err) {
        console.warn('Orientation permission error:', err);
      }
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      modAGyro.active = true;
      modAGyro.calibrated = false;
      window.addEventListener('deviceorientation', onModADeviceOrientation);
      alertToast('🧭 Sensor pandangan diaktifkan!');
      return true;
    }
    modAGyro.active = false;
    return false;
  }

  function calibrateModAGyroHeading() {
    modAGyro.baseAlpha = modAGyro.currentAlpha;
    modAGyro.yaw = 0;
    modAGyro.pitch = 0;
    alertToast('🎯 Pandangan dikalibrasi ke hadapan!');
  }

  function showCellCorePrompt() {
    if (!DOM.promptContainer) return;
    DOM.promptContainer.style.setProperty('--station-color', '#06b6d4');
    DOM.promptContainer.style.setProperty('--station-glow', 'rgba(6, 182, 212, 0.5)');
    DOM.promptIcon.textContent = '⚡';
    if (State.cellCoreActivated) {
      DOM.promptTitle.textContent = 'Teras Sel Aktif! Makmal ARSELNEL Selamat!';
      DOM.promptActionBtn.innerHTML = '<span>Telah Aktif</span><span class="cq-prompt-key">✓</span>';
    } else {
      DOM.promptTitle.textContent = 'Bilik Teras: Teras Tenaga Utama Makmal';
      DOM.promptActionBtn.innerHTML = '<span>Aktifkan Teras</span><span class="cq-prompt-key">E</span>';
    }
    DOM.promptContainer.classList.add('active');
    if (DOM.mobileInteractBtn) DOM.mobileInteractBtn.classList.add('visible');
  }

  async function activateCellCoreCrystal() {
    if (State.cellCoreActivated) {
      openLab3DCrystalVictoryModal();
      return;
    }
    State.cellCoreActivated = true;
    SoundFX.victory();
    alertToast('⚡ TERAS TENAGA TELAH DIAKTIFKAN! MAKMAL ARSELNEL PULIH SEPENUHNYA!');

    if (cellCoreCrystalGroup) {
      animatedObjects.push({
        progress: 0,
        update() {
          if (this.progress < 2.0) {
            this.progress += 0.05;
            cellCoreCrystalGroup.rotation.y += 0.08;
          }
        }
      });
    }

    showCellCorePrompt();
    State.score += 500;
    State.isCompleted = true;
    clearInterval(State.timerInterval);
    await saveLearningRecord();

    setTimeout(() => {
      openLab3DCrystalVictoryModal();
    }, 1200);
  }

  function handlePlayerInteract() {
    if (State.nearCellCoreCrystal) {
      activateCellCoreCrystal();
      return;
    }
    if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
      openStationModal(State.nearbyStationIndex);
      return;
    }
    if (State.nearSecretDoor) {
      if (!exitDoorMeshes || !exitDoorMeshes.unlocked) {
        alertToast('🔒 Pintu Teras Sel masih terkunci! Selesaikan 8 cabaran stesen untuk membukanya.');
        SoundFX.interact();
      } else {
        alertToast('⚡ Pintu Teras Sel terbuka! Masuk ke hadapan untuk meneroka Bilik Teras Sel.');
        SoundFX.interact();
      }
    }
  }
`;

const targetBeforeUpdatePlayer = `  function updatePlayerMovement() {`;
if (js.includes(targetBeforeUpdatePlayer)) {
  js = js.replace(targetBeforeUpdatePlayer, helperFunctionsBlock + '\n  function updatePlayerMovement() {');
  console.log('✓ Added Mod A helper functions before updatePlayerMovement');
} else {
  console.error('Target updatePlayerMovement not found');
  process.exit(1);
}

// ==============================================================================
// 2. REPLACE updatePlayerMovement() WITH MULTI-ZONE COLLISION & GYRO INTEGRATION
// ==============================================================================

const targetUpdatePlayerMovement = `  function updatePlayerMovement() {
    if (State.isPaused || DOM.stationModal.classList.contains('open')) return;

    // In Three.js standard coordinates, the camera looks down -Z when rotY = 0.
    // Horizontal Forward Unit Vector (where the camera is looking):
    // forwardX = -sin(rotY), forwardZ = -cos(rotY)
    // Horizontal Strafe Right Unit Vector (90 deg clockwise to the right):
    // rightX = cos(rotY), rightZ = -sin(rotY)
    const forwardX = -Math.sin(player.rotY);
    const forwardZ = -Math.cos(player.rotY);
    const rightX = Math.cos(player.rotY);
    const rightZ = -Math.sin(player.rotY);

    let inputFwd = 0;
    let inputStr = 0;

    // Keyboard inputs
    if (player.keys.forward) inputFwd += 1;
    if (player.keys.backward) inputFwd -= 1;
    if (player.keys.right) inputStr += 1;
    if (player.keys.left) inputStr -= 1;

    // Virtual Joystick inputs (smooth analog blending)
    if (joystickState.active) {
      inputFwd += joystickState.y; // Positive is forward
      inputStr += joystickState.x; // Positive is right
    }

    // Combine direction vectors
    let moveX = (inputFwd * forwardX) + (inputStr * rightX);
    let moveZ = (inputFwd * forwardZ) + (inputStr * rightZ);

    // Normalize diagonal or composite movement so diagonal is not faster
    const inputMagnitude = Math.hypot(moveX, moveZ);
    if (inputMagnitude > 0) {
      const scale = (Math.min(inputMagnitude, 1.0) / inputMagnitude) * player.speed;
      moveX *= scale;
      moveZ *= scale;
    }

    // Candidate new player coordinates
    const nextX = player.x + moveX;
    const nextZ = player.z + moveZ;

    // 1. Room Boundary Collision (Walls at -8.2 to 8.2 and -10.2 to 10.2)
    const minX = -8.2;
    const maxX = 8.2;
    const minZ = -10.2;
    const maxZ = 10.2;

    let validX = Math.max(minX, Math.min(maxX, nextX));
    let validZ = Math.max(minZ, Math.min(maxZ, nextZ));

    // 2. Central ARSelNel Research Monument Collision (Radius 2.6m)
    const distToCenter = Math.hypot(validX, validZ);
    if (distToCenter < 2.6) {
      const angle = Math.atan2(validZ, validX);
      validX = Math.cos(angle) * 2.6;
      validZ = Math.sin(angle) * 2.6;
    }

    player.x = validX;
    player.z = validZ;

    // In WebXR immersive-ar mode with real physical tracking, WebXR sets camera pose.
    // In standard 3D and Camera AR modes, update Three.js camera from player coordinates:
    if (!renderer.xr.isPresenting) {
      camera.position.set(player.x, player.y, player.z);

      // If DeviceOrientation Gyro is active, blend gyro orientation
      if (gyroState.active && State.mode === 'camera-ar') {
        const radYaw = THREE.MathUtils.degToRad(gyroState.alpha - (gyroState.initialAlpha || 0));
        camera.rotation.set(player.pitch, player.rotY - radYaw, 0, 'YXZ');
      } else {
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
    }

    // 3. Proximity detection to 8 stations
    checkStationProximity();

    // 4. Proximity detection to unlocked exit door ("Pintu Pakar Sel")
    if (exitDoorMeshes && exitDoorMeshes.unlocked && Math.abs(player.x) < 2.2 && player.z < -9.0) {
      if (!State.isCompleted) {
        completeMission();
      }
    }
  }`;

const replUpdatePlayerMovement = `  function updatePlayerMovement() {
    if (State.isPaused || (DOM.stationModal && DOM.stationModal.classList.contains('open')) ||
        (DOM.lab3dStoryMissionModal && DOM.lab3dStoryMissionModal.classList.contains('open')) ||
        (DOM.lab3dCalibrationModal && DOM.lab3dCalibrationModal.classList.contains('open')) ||
        (DOM.lab3dCrystalVictoryModal && DOM.lab3dCrystalVictoryModal.classList.contains('open'))) return;

    // In Three.js standard coordinates, the camera looks down -Z when rotY = 0.
    // Horizontal Forward Unit Vector (where the camera is looking):
    const forwardX = -Math.sin(player.rotY);
    const forwardZ = -Math.cos(player.rotY);
    const rightX = Math.cos(player.rotY);
    const rightZ = -Math.sin(player.rotY);

    let inputFwd = 0;
    let inputStr = 0;

    // Keyboard inputs
    if (player.keys.forward) inputFwd += 1;
    if (player.keys.backward) inputFwd -= 1;
    if (player.keys.right) inputStr += 1;
    if (player.keys.left) inputStr -= 1;

    // Virtual Joystick inputs (smooth analog blending)
    if (joystickState.active) {
      inputFwd += joystickState.y; // Positive is forward
      inputStr += joystickState.x; // Positive is right
    }

    // Combine direction vectors
    let moveX = (inputFwd * forwardX) + (inputStr * rightX);
    let moveZ = (inputFwd * forwardZ) + (inputStr * rightZ);

    // Normalize diagonal or composite movement so diagonal is not faster
    const inputMagnitude = Math.hypot(moveX, moveZ);
    if (inputMagnitude > 0) {
      const scale = (Math.min(inputMagnitude, 1.0) / inputMagnitude) * player.speed;
      moveX *= scale;
      moveZ *= scale;
    }

    // Candidate new player coordinates
    const nextX = player.x + moveX;
    const nextZ = player.z + moveZ;

    // Multi-Zone Collision System (Main Lab, Corridor, & Bilik Teras Sel)
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
    }

    player.x = candidateX;
    player.z = candidateZ;

    // Update Three.js camera from player coordinates
    if (!renderer.xr.isPresenting) {
      camera.position.set(player.x, player.y, player.z);

      if (State.mode === '3d' && modAGyro.active) {
        // Blend Mod A Gyroscope with mouse/touch look
        const combinedPitch = Math.max(-1.05, Math.min(1.05, player.pitch + modAGyro.pitch));
        camera.rotation.set(combinedPitch, player.rotY + modAGyro.yaw, 0, 'YXZ');
      } else if (gyroState.active && State.mode === 'camera-ar') {
        const radYaw = THREE.MathUtils.degToRad(gyroState.alpha - (gyroState.initialAlpha || 0));
        camera.rotation.set(player.pitch, player.rotY - radYaw, 0, 'YXZ');
      } else {
        camera.rotation.set(player.pitch, player.rotY, 0, 'YXZ');
      }
    }

    // Proximity detection to Cell Core Crystal in Bilik Teras Sel
    const distToCrystal = Math.hypot(player.x - 0, player.z - (-19.5));
    if (distToCrystal <= 3.2 && exitDoorMeshes && exitDoorMeshes.unlocked) {
      State.nearCellCoreCrystal = true;
      State.nearbyStationIndex = -1;
      showCellCorePrompt();
    } else {
      State.nearCellCoreCrystal = false;
      // Proximity detection to 8 stations in main lab
      checkStationProximity();
    }

    // Proximity detection to Secret Door
    if (Math.abs(player.x) < 2.5 && player.z < -8.5 && player.z > -12.0) {
      State.nearSecretDoor = true;
    } else {
      State.nearSecretDoor = false;
    }
  }`;

if (js.includes(targetUpdatePlayerMovement)) {
  js = js.replace(targetUpdatePlayerMovement, replUpdatePlayerMovement);
  console.log('✓ Replaced updatePlayerMovement with multi-zone collision & Mod A gyro look');
} else {
  console.error('Target updatePlayerMovement exact block not found');
  process.exit(1);
}

// ==============================================================================
// 3. UPDATE onKeyDown TO CALL handlePlayerInteract()
// ==============================================================================

const targetOnKeyDown = `    // Press 'E' or Space to interact with station
    if (e.code === 'KeyE' || e.code === 'Space') {
      if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
        openStationModal(State.nearbyStationIndex);
      }
    }`;

const replOnKeyDown = `    // Press 'E' or Space to interact with station, cell core crystal, or secret door
    if (e.code === 'KeyE' || e.code === 'Space') {
      handlePlayerInteract();
    }`;

if (js.includes(targetOnKeyDown)) {
  js = js.replace(targetOnKeyDown, replOnKeyDown);
  console.log('✓ Updated onKeyDown with handlePlayerInteract()');
} else {
  console.error('Target onKeyDown not found');
  process.exit(1);
}

// ==============================================================================
// 4. UPDATE unlockExitDoor()
// ==============================================================================

const targetUnlockExitDoor = `  // Unlock Exit Door when all 8 stations are cleared
  function unlockExitDoor() {
    if (!exitDoorMeshes || exitDoorMeshes.unlocked) return;
    exitDoorMeshes.unlocked = true;

    exitDoorMeshes.shield.material.color.setHex(0x10b981);
    exitDoorMeshes.shield.material.opacity = 0.2;
    exitDoorMeshes.exitSign.material.color?.setHex?.(0x10b981);

    animatedObjects.push({
      progress: 0,
      update() {
        if (this.progress < 1.4) {
          this.progress += 0.02;
          exitDoorMeshes.leftDoor.position.x = -1.05 - this.progress;
          exitDoorMeshes.rightDoor.position.x = 1.05 + this.progress;
        }
      }
    });

    SoundFX.victory();
    alertToast('🌟 TAHNIAH! Semua 8 Lencana Diperoleh! Pintu Pakar Sel Kini Terbuka!');
  }`;

const replUnlockExitDoor = `  // Unlock Exit Door when all 8 stations are cleared
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

if (js.includes(targetUnlockExitDoor)) {
  js = js.replace(targetUnlockExitDoor, replUnlockExitDoor);
  console.log('✓ Updated unlockExitDoor with dynamic sign and floor guide trail activation');
} else {
  console.error('Target unlockExitDoor not found');
  process.exit(1);
}

// ==============================================================================
// 5. UPDATE markStationCompleted() TO UPDATE SECRET DOOR SIGNBOARD
// ==============================================================================

const targetInMarkStation = `    if (DOM.arMissionStatusText) {
      DOM.arMissionStatusText.textContent = \`Stesen Dipulihkan: \${State.completedStations.size}/8\`;
    }
    alertToast('TAHNIAH! Tenaga organel berjaya dipulihkan!');`;

const replInMarkStation = `    if (DOM.arMissionStatusText) {
      DOM.arMissionStatusText.textContent = \`Stesen Dipulihkan: \${State.completedStations.size}/8\`;
    }
    updateSecretDoorSign(\`PINTU TERAS SEL • TERKUNCI (\${State.completedStations.size}/8 DIPULIHKAN)\`, 0xf59e0b);
    alertToast('TAHNIAH! Tenaga organel berjaya dipulihkan!');`;

if (js.includes(targetInMarkStation)) {
  js = js.replace(targetInMarkStation, replInMarkStation);
  console.log('✓ Updated markStationCompleted with dynamic secret door signboard progress');
} else {
  console.error('Target in markStationCompleted not found');
  process.exit(1);
}

// ==============================================================================
// 6. UPDATE bindEvents() TO WIRE UP MOD A BUTTONS & MODALS
// ==============================================================================

const targetLobbyModABind = `    // 12. Lobi Makmal Sains & Galeri Pendidikan
    if (DOM.lobbyBtnModA) {
      DOM.lobbyBtnModA.addEventListener('click', () => launchMode('3d'));
    }`;

const replLobbyModABind = `    // 12. Lobi Makmal Sains & Galeri Pendidikan
    if (DOM.lobbyBtnModA) {
      DOM.lobbyBtnModA.addEventListener('click', () => {
        openLab3DStoryMissionModal();
      });
    }

    // Mod A — Story Mission Modal Buttons
    if (DOM.closeLab3DMissionBtn) {
      DOM.closeLab3DMissionBtn.addEventListener('click', () => closeLab3DStoryMissionModal());
    }
    if (DOM.lab3dMissionBackBtn) {
      DOM.lab3dMissionBackBtn.addEventListener('click', () => closeLab3DStoryMissionModal());
    }
    if (DOM.lab3dMissionStartBtn) {
      DOM.lab3dMissionStartBtn.addEventListener('click', () => {
        closeLab3DStoryMissionModal();
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
        if (isTouchDevice && typeof window.DeviceOrientationEvent !== 'undefined') {
          openLab3DCalibrationModal();
        } else {
          launchMode('3d');
        }
      });
    }

    // Mod A — Calibration Modal Buttons
    if (DOM.lab3dCalSensorBtn) {
      DOM.lab3dCalSensorBtn.addEventListener('click', () => {
        enableModAGyroscope().then(() => {
          closeLab3DCalibrationModal();
          launchMode('3d');
        }).catch(() => {
          closeLab3DCalibrationModal();
          launchMode('3d');
        });
      });
    }
    if (DOM.lab3dCalTouchBtn) {
      DOM.lab3dCalTouchBtn.addEventListener('click', () => {
        modAGyro.active = false;
        closeLab3DCalibrationModal();
        launchMode('3d');
      });
    }

    // Mod A — Cell Core Victory Modal Buttons
    if (DOM.lab3dExploreAgainBtn) {
      DOM.lab3dExploreAgainBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        player.x = 0;
        player.z = 0;
      });
    }
    if (DOM.lab3dReturnLobbyBtn) {
      DOM.lab3dReturnLobbyBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        launchMode('lobby');
      });
    }`;

if (js.includes(targetLobbyModABind)) {
  js = js.replace(targetLobbyModABind, replLobbyModABind);
  console.log('✓ Wired up Mod A modal buttons in bindEvents');
} else {
  console.error('Target lobbyBtnModA not found in bindEvents');
  process.exit(1);
}

// Update mobileInteractBtn & promptActionBtn to call handlePlayerInteract
const targetMobileInteract = `      const handleMobileInteract = (e) => {
        e.preventDefault();
        if (State.nearbyStationIndex >= 0 && !DOM.stationModal.classList.contains('open')) {
          openStationModal(State.nearbyStationIndex);
        }
      };`;

const replMobileInteract = `      const handleMobileInteract = (e) => {
        e.preventDefault();
        handlePlayerInteract();
      };`;

if (js.includes(targetMobileInteract)) {
  js = js.replace(targetMobileInteract, replMobileInteract);
  console.log('✓ Updated handleMobileInteract to call handlePlayerInteract');
} else {
  console.error('Target handleMobileInteract not found');
  process.exit(1);
}

const targetPromptAction = `    if (DOM.promptActionBtn) {
      DOM.promptActionBtn.addEventListener('click', () => {
        if (State.nearbyStationIndex >= 0) {
          openStationModal(State.nearbyStationIndex);
        }
      });
    }`;

const replPromptAction = `    if (DOM.promptActionBtn) {
      DOM.promptActionBtn.addEventListener('click', () => {
        handlePlayerInteract();
      });
    }`;

if (js.includes(targetPromptAction)) {
  js = js.replace(targetPromptAction, replPromptAction);
  console.log('✓ Updated promptActionBtn click to call handlePlayerInteract');
} else {
  console.error('Target promptActionBtn not found');
  process.exit(1);
}

// Update gyroResetBtn to also calibrate Mod A gyro
const targetGyroReset = `    if (DOM.gyroResetBtn) DOM.gyroResetBtn.addEventListener('click', resetGyroOrientation);`;
const replGyroReset = `    if (DOM.gyroResetBtn) DOM.gyroResetBtn.addEventListener('click', () => {
      if (State.mode === '3d') {
        calibrateModAGyroHeading();
      } else {
        resetGyroOrientation();
      }
    });`;

if (js.includes(targetGyroReset)) {
  js = js.replace(targetGyroReset, replGyroReset);
  console.log('✓ Updated gyroResetBtn to support Mod A calibration');
} else {
  console.error('Target gyroResetBtn not found');
  process.exit(1);
}

// ==============================================================================
// 7. EXPOSE MOD A PUBLIC APIS ON window.CellQuestAR
// ==============================================================================

const targetPublicApi = `  window.CellQuestAR = {
    getState: () => State,`;

const replPublicApi = `  window.CellQuestAR = {
    getState: () => State,
    // Mod A Enhanced Public API Helpers
    openLab3DStoryMissionModal,
    closeLab3DStoryMissionModal,
    openLab3DCalibrationModal,
    closeLab3DCalibrationModal,
    openLab3DCrystalVictoryModal,
    closeLab3DCrystalVictoryModal,
    activateCellCoreCrystal,
    enableModAGyroscope,
    calibrateModAGyroHeading,
    handlePlayerInteract,
    updateSecretDoorSign,
    getModAGyroState: () => modAGyro,
    getCellCoreCrystalGroup: () => cellCoreCrystalGroup,
    getFloorGuideTrailGroup: () => floorGuideTrailGroup,
    getExitDoorMeshes: () => exitDoorMeshes,`;

if (js.includes(targetPublicApi)) {
  js = js.replace(targetPublicApi, replPublicApi);
  console.log('✓ Exposed Mod A APIs on window.CellQuestAR');
} else {
  console.error('Target window.CellQuestAR not found');
  process.exit(1);
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Part 3 applied successfully to cellquest-adventure.js');
