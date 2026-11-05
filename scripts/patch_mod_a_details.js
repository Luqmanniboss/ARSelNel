const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'assets', 'js', 'cellquest-adventure.js');
let js = fs.readFileSync(jsPath, 'utf8');

// 1. In modAGyro object definition: ensure active, yaw, pitch, calibrated exist
const targetModAGyro = `  const modAGyro = {
    supported: false,
    enabled: false,
    hasCalibrated: false,
    baseAlpha: null,
    baseBeta: null,
    baseGamma: null,
    currentAlpha: 0,
    currentBeta: 0,
    currentGamma: 0,
    smoothedYaw: 0,
    smoothedPitch: 0
  };`;

const replModAGyro = `  const modAGyro = {
    supported: false,
    enabled: false,
    active: false,
    calibrated: false,
    hasCalibrated: false,
    yaw: 0,
    pitch: 0,
    baseAlpha: null,
    baseBeta: null,
    baseGamma: null,
    currentAlpha: 0,
    currentBeta: 0,
    currentGamma: 0,
    smoothedYaw: 0,
    smoothedPitch: 0
  };`;

if (js.includes(targetModAGyro)) {
  js = js.replace(targetModAGyro, replModAGyro);
  console.log('✓ Updated modAGyro state object properties');
} else {
  console.log('ℹ modAGyro already has properties or differs');
}

// 2. In buildFloorGuideTrail: set trailGroup.visible = false initially
const targetTrailInit = `    animatedObjects.push(trailGroup.userData);
    return trailGroup;`;

const replTrailInit = `    trailGroup.visible = false;
    animatedObjects.push(trailGroup.userData);
    return trailGroup;`;

if (js.includes(targetTrailInit)) {
  js = js.replace(targetTrailInit, replTrailInit);
  console.log('✓ Set trailGroup.visible = false initially in buildFloorGuideTrail');
}

// 3. In updateSecretDoorSign: add exitDoorMeshes.exitSignText = text;
const targetDoorSign = `    const newSign = createTextPlane(text, colorHex, 4.8, 0.7);
    newSign.position.set(0, 4.45, 0.22);
    exitDoorMeshes.group.add(newSign);
    exitDoorMeshes.exitSign = newSign;
  }`;

const replDoorSign = `    const newSign = createTextPlane(text, colorHex, 4.8, 0.7);
    newSign.position.set(0, 4.45, 0.22);
    exitDoorMeshes.group.add(newSign);
    exitDoorMeshes.exitSign = newSign;
    exitDoorMeshes.exitSignText = text;
  }`;

if (js.includes(targetDoorSign)) {
  js = js.replace(targetDoorSign, replDoorSign);
  console.log('✓ Added exitDoorMeshes.exitSignText = text in updateSecretDoorSign');
}

// 4. In buildCellCoreChamber: attach shards, sparks, rings, coreLight aliases to crystalGroup.userData
const targetCrystalUserData = `    crystalGroup.userData = {
      mainCrystal,
      coreSphere,
      crystalLight,
      crystalPurpleLight,
      chamberAmbient,
      ring1,
      ring2,
      shardMeshes,
      sparkMeshes,`;

const replCrystalUserData = `    crystalGroup.userData = {
      mainCrystal,
      coreSphere,
      crystalLight,
      crystalPurpleLight,
      chamberAmbient,
      ring1,
      ring2,
      shardMeshes,
      sparkMeshes,
      shards: shardMeshes,
      sparks: sparkMeshes,
      rings: [ring1, ring2],
      coreLight: crystalLight,`;

if (js.includes(targetCrystalUserData)) {
  js = js.replace(targetCrystalUserData, replCrystalUserData);
  console.log('✓ Added aliases to crystalGroup.userData in buildCellCoreChamber');
}

// 5. In DOM.lab3dReturnLobbyBtn event listener: call openScienceLabLobby()
const targetReturnLobbyBtn = `    if (DOM.lab3dReturnLobbyBtn) {
      DOM.lab3dReturnLobbyBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        launchMode('lobby');
      });
    }`;

const replReturnLobbyBtn = `    if (DOM.lab3dReturnLobbyBtn) {
      DOM.lab3dReturnLobbyBtn.addEventListener('click', () => {
        closeLab3DCrystalVictoryModal();
        player.x = 0;
        player.z = 0;
        openScienceLabLobby();
      });
    }`;

if (js.includes(targetReturnLobbyBtn)) {
  js = js.replace(targetReturnLobbyBtn, replReturnLobbyBtn);
  console.log('✓ Updated lab3dReturnLobbyBtn to call openScienceLabLobby');
}

// 6. In launchMode: support mode === 'lobby' gracefully
const targetLaunchMode = `  async function launchMode(mode) {
    SoundFX.interact();`;

const replLaunchMode = `  async function launchMode(mode) {
    if (mode === 'lobby') {
      SoundFX.interact();
      openScienceLabLobby();
      return;
    }
    SoundFX.interact();`;

if (js.includes(targetLaunchMode)) {
  js = js.replace(targetLaunchMode, replLaunchMode);
  console.log('✓ Added mode === lobby handling in launchMode');
}

// 7. In unlockExitDoor: also set floorGuideTrailGroup.userData.active = true
const targetUnlockExit = `    if (floorGuideTrailGroup) {
      floorGuideTrailGroup.visible = true;
    }`;

const replUnlockExit = `    if (floorGuideTrailGroup) {
      floorGuideTrailGroup.visible = true;
      if (floorGuideTrailGroup.userData) floorGuideTrailGroup.userData.active = true;
    }`;

if (js.includes(targetUnlockExit)) {
  js = js.replace(targetUnlockExit, replUnlockExit);
  console.log('✓ Updated unlockExitDoor to activate floorGuideTrailGroup.userData.active');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Patches successfully applied to cellquest-adventure.js');
