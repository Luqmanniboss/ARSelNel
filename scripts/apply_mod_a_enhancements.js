const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'assets', 'js', 'cellquest-adventure.js');
let js = fs.readFileSync(jsPath, 'utf8');

// 1. In State, add Mod A Cell Core variables
const targetState = `    // Misi Akhir: Treasure Hunt ARSELNel State
    treasureHuntUnlocked: false,`;

const replState = `    // Mod A: Secret Door & Cell Core Chamber State
    cellCoreActivated: false,
    cellCoreChamberUnlocked: false,
    nearCellCoreCrystal: false,
    nearSecretDoor: false,
    // Misi Akhir: Treasure Hunt ARSELNel State
    treasureHuntUnlocked: false,`;

if (!js.includes('cellCoreActivated: false,')) {
  if (js.includes(targetState)) {
    js = js.replace(targetState, replState);
    console.log('✓ Updated State object with Mod A variables');
  } else {
    console.error('Target state not found');
    process.exit(1);
  }
}

// 2. Add modAGyro state object before setupThree()
const targetBeforeSetupThree = `  function setupThree() {`;
const modAGyroCode = `  // Mod A Gyroscope & Motion Look State
  const modAGyro = {
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
  };

  let cellCoreCrystalGroup = null;
  let cellCoreChamberGroup = null;
  let floorGuideTrailGroup = null;

  `;

if (!js.includes('const modAGyro = {')) {
  js = js.replace(targetBeforeSetupThree, modAGyroCode + targetBeforeSetupThree);
  console.log('✓ Added modAGyro and chamber group variables');
}

// 3. Cache DOM elements for Mod A modals
const targetCacheDOM = `    // Misi AR Orientasi & Modal Cerita Pra-Permainan
    DOM.arStoryMissionModal = document.getElementById('ar-story-mission-modal');`;

const replCacheDOM = `    // Mod A: Misi Rahsia Makmal 3D & Kalibrasi & Crystal Victory
    DOM.lab3dStoryMissionModal = document.getElementById('lab3d-story-mission-modal');
    DOM.closeLab3dMissionBtn = document.getElementById('close-lab3d-mission-btn');
    DOM.lab3dMissionBackBtn = document.getElementById('lab3d-mission-back-btn');
    DOM.lab3dMissionStartBtn = document.getElementById('lab3d-mission-start-btn');
    DOM.lab3dCalibrationModal = document.getElementById('lab3d-calibration-modal');
    DOM.lab3dCalSensorBtn = document.getElementById('lab3d-cal-sensor-btn');
    DOM.lab3dCalTouchBtn = document.getElementById('lab3d-cal-touch-btn');
    DOM.lab3dCrystalVictoryModal = document.getElementById('lab3d-crystal-victory-modal');
    DOM.lab3dFinalScore = document.getElementById('lab3d-final-score');
    DOM.lab3dFinalStations = document.getElementById('lab3d-final-stations');
    DOM.lab3dFinalTime = document.getElementById('lab3d-final-time');
    DOM.lab3dExploreAgainBtn = document.getElementById('lab3d-explore-again-btn');
    DOM.lab3dReturnLobbyBtn = document.getElementById('lab3d-return-lobby-btn');

    // Misi AR Orientasi & Modal Cerita Pra-Permainan
    DOM.arStoryMissionModal = document.getElementById('ar-story-mission-modal');`;

if (!js.includes('DOM.lab3dStoryMissionModal = document.getElementById(\'lab3d-story-mission-modal\');')) {
  js = js.replace(targetCacheDOM, replCacheDOM);
  console.log('✓ Cached Mod A DOM elements');
}

fs.writeFileSync(jsPath, js, 'utf8');
console.log('Part 1 applied successfully');

