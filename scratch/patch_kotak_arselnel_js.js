const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'kotak_arselnel', 'kotak-arselnel.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. In initDOM(): Update DOM bindings
const targetDOMInit = `    // Fasa 3C POV DOM Elements\r\n    DOM.povAnchor = document.getElementById('pov-ar-anchor');`;
const altTargetDOMInit = `    // Fasa 3C POV DOM Elements\n    DOM.povAnchor = document.getElementById('pov-ar-anchor');`;

const domInitReplacement = `    // Fasa 4E-B.1: Backward compatibility shim: map pov-ar-anchor lookup to pov-panel-video if requested
    if (typeof document !== 'undefined' && !document.getElementById('pov-ar-anchor')) {
      const _origGet = document.getElementById.bind(document);
      document.getElementById = function(id) {
        if (id === 'pov-ar-anchor') {
          return _origGet('pov-panel-video') || _origGet('pov-ar-anchor');
        }
        return _origGet(id);
      };
    }

    // Fasa 4E-B.1: Dual Independent DOM Panels (Video & Nota)
    DOM.povPanelVideo = document.getElementById('pov-panel-video');
    DOM.povPanelNota = document.getElementById('pov-panel-nota');
    DOM.povAnchor = DOM.povPanelVideo || document.getElementById('pov-ar-anchor');

    // Fasa 4E-B.1: Nota Panel Specific DOM Elements
    DOM.povNotaCard = document.getElementById('pov-nota-card-container');
    DOM.povNotaHeader = document.getElementById('pov-nota-fixed-header');
    DOM.povNotaBody = document.getElementById('pov-nota-scrollable-body');
    DOM.povNotaFooter = document.getElementById('pov-nota-sticky-footer');
    DOM.povNotaCornerResizeHandle = document.getElementById('pov-nota-corner-resize-handle');
    DOM.povNotaSensorPill = document.getElementById('pov-nota-sensor-pill');
    DOM.povNotaSensorPing = document.getElementById('pov-nota-sensor-ping');
    DOM.povNotaSensorText = document.getElementById('pov-nota-sensor-text');
    DOM.povNotaToolbar = document.getElementById('pov-nota-toolbar');
    DOM.povNotaBtnToggleCam = document.getElementById('pov-nota-btn-toggle-cam');
    DOM.povNotaCamIcon = document.getElementById('pov-nota-cam-icon');
    DOM.povNotaCamText = document.getElementById('pov-nota-cam-text');
    DOM.povNotaSizeS = document.getElementById('pov-nota-size-s');
    DOM.povNotaSizeM = document.getElementById('pov-nota-size-m');
    DOM.povNotaSizeL = document.getElementById('pov-nota-size-l');
    DOM.povNotaBtnAnchor = document.getElementById('pov-nota-btn-anchor');
    DOM.povNotaAnchorIcon = document.getElementById('pov-nota-anchor-icon');
    DOM.povNotaAnchorText = document.getElementById('pov-nota-anchor-text');
    DOM.povNotaBtnChangeContent = document.getElementById('pov-nota-btn-change-content');
    DOM.povNotaBtnBackPinned = document.getElementById('pov-nota-btn-back-pinned');
    DOM.povNotaBtnClose = document.getElementById('pov-nota-btn-close');

    // Fasa 3C POV Video DOM Elements`;

if (code.includes(targetDOMInit)) {
  code = code.replace(targetDOMInit, domInitReplacement);
} else if (code.includes(altTargetDOMInit)) {
  code = code.replace(altTargetDOMInit, domInitReplacement);
} else {
  console.error('Target 1 (DOMInit) not found!');
  process.exit(1);
}

// 2. Define SpatialPanelManager right after GameSessionManager
const targetGameSession = `      ARState.gameSessionState = newState;\r\n      ARState.activeGameId = this.activeGameId;\r\n      ARState.activeGameRoute = this.activeGameRoute;\r\n    }\r\n  };`;
const altTargetGameSession = `      ARState.gameSessionState = newState;\n      ARState.activeGameId = this.activeGameId;\n      ARState.activeGameRoute = this.activeGameRoute;\n    }\n  };`;

const spatialPanelManagerCode = `      ARState.gameSessionState = newState;
      ARState.activeGameId = this.activeGameId;
      ARState.activeGameRoute = this.activeGameRoute;
    }
  };

  /**
   * ==============================================================================
   * FASA 4E-B.1: SPATIAL PANEL MANAGER (MULTI-PANEL FOUNDATION)
   * Pengurus Asas Dua Panel DOM Bebas: Video (#pov-panel-video) & Nota (#pov-panel-nota)
   * Menyediakan state terasing, pengurusan visibiliti, saiz, dan mod penempatan.
   * ==============================================================================
   */
  const SpatialPanelManager = {
    panels: new Map(),
    activePanelId: 'video',

    init() {
      // 1. Mendaftar Panel Video (Tema Jingga #f97316)
      this.register('video', {
        elementId: 'pov-panel-video',
        theme: 'orange',
        themeColor: '#f97316',
        title: 'Video Pembelajaran',
        icon: 'smart_display',
        markerIndex: 0,
        size: 'medium',
        dragOffset: { x: 0, y: 0 },
        placementMode: 'MARKER_MODE', // 'MARKER_MODE' | 'PINNED_MODE' | 'POV_LOCKED'
        referenceQuaternion: null,
        anchorWorldVector: null,
        visible: false,
        isInteractive: true,
        lastInteractionTime: Date.now()
      });

      // 2. Mendaftar Panel Nota (Tema Teal #14b8a6)
      this.register('nota', {
        elementId: 'pov-panel-nota',
        theme: 'teal',
        themeColor: '#14b8a6',
        title: 'Nota Interaktif',
        icon: 'auto_stories',
        markerIndex: 1,
        size: 'medium',
        dragOffset: { x: 0, y: 0 },
        placementMode: 'MARKER_MODE',
        referenceQuaternion: null,
        anchorWorldVector: null,
        visible: false,
        isInteractive: true,
        lastInteractionTime: Date.now()
      });

      console.log('✅ [SpatialPanelManager] Inisialisasi siap: Video (#pov-panel-video) & Nota (#pov-panel-nota).');
    },

    register(id, config) {
      const el = typeof document !== 'undefined' ? document.getElementById(config.elementId) : null;
      this.panels.set(id, {
        id,
        ...config,
        element: el
      });
    },

    getPanel(id) {
      return this.panels.get(id);
    },

    getAllPanels() {
      return Array.from(this.panels.values());
    },

    setPanelVisibility(id, visible) {
      const p = this.panels.get(id);
      if (!p) return;
      p.visible = !!visible;
      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        p.element = el;
        if (visible) {
          el.classList.remove('hidden');
          el.classList.add('is-visible');
        } else {
          el.classList.remove('is-visible');
          el.classList.add('hidden');
        }
      }
    },

    setPlacementMode(id, mode) {
      const p = this.panels.get(id);
      if (!p) return;
      p.placementMode = mode;
      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.setAttribute('data-placement-mode', mode);
      }
    },

    setPanelSize(id, size) {
      const p = this.panels.get(id);
      if (!p) return;
      p.size = size;
      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      const card = el ? el.querySelector('.floating-card-container') : null;
      if (card) {
        card.classList.remove('size-small', 'size-medium', 'size-large');
        card.classList.add(\`size-\${size}\`);
      }
    },

    setDragOffset(id, x, y) {
      const p = this.panels.get(id);
      if (!p) return;
      p.dragOffset = { x, y };
    },

    setReferenceOrientation(id, quat, worldVector) {
      const p = this.panels.get(id);
      if (!p) return;
      p.referenceQuaternion = quat ? quat.clone() : null;
      p.anchorWorldVector = worldVector ? worldVector.clone() : null;
    },

    setActivePanel(id) {
      if (this.panels.has(id)) {
        this.activePanelId = id;
        this.panels.get(id).lastInteractionTime = Date.now();
      }
    },

    getActivePanel() {
      return this.panels.get(this.activePanelId);
    },

    getState() {
      const snapshot = {};
      this.panels.forEach((panel, key) => {
        snapshot[key] = {
          id: panel.id,
          elementId: panel.elementId,
          theme: panel.theme,
          size: panel.size,
          visible: panel.visible,
          placementMode: panel.placementMode,
          dragOffset: { ...panel.dragOffset },
          hasRefQuaternion: !!panel.referenceQuaternion,
          hasAnchorVector: !!panel.anchorWorldVector
        };
      });
      return {
        activePanelId: this.activePanelId,
        panels: snapshot
      };
    }
  };`;

if (code.includes(targetGameSession)) {
  code = code.replace(targetGameSession, spatialPanelManagerCode);
} else if (code.includes(altTargetGameSession)) {
  code = code.replace(altTargetGameSession, spatialPanelManagerCode);
} else {
  console.error('Target 2 (GameSession) not found!');
  process.exit(1);
}

// 3. In setPOVPanelSize: Support both video and nota panels
const targetPOVSize = `  function setPOVPanelSize(size) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    ARState.pov.size = size;

    if (DOM.povCard) {
      DOM.povCard.classList.remove('size-small', 'size-medium', 'size-large');
      DOM.povCard.classList.add(\`size-\${size}\`);
    }

    [DOM.povSizeS, DOM.povSizeM, DOM.povSizeL].forEach(btn => {
      if (!btn) return;
      if (btn.getAttribute('data-size') === size) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    const labels = { small: 'Kecil (S)', medium: 'Sederhana (M)', large: 'Besar (L)' };
    showToast(\`📐 Saiz POV: \${labels[size]}\`);
  }`;

const altTargetPOVSize = targetPOVSize.replace(/\n/g, '\r\n');

const replacementPOVSize = `  function setPOVPanelSize(size, targetPanel = null) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    ARState.pov.size = size;

    if (!targetPanel || targetPanel === 'video') {
      if (DOM.povCard) {
        DOM.povCard.classList.remove('size-small', 'size-medium', 'size-large');
        DOM.povCard.classList.add(\`size-\${size}\`);
      }
      [DOM.povSizeS, DOM.povSizeM, DOM.povSizeL].forEach(btn => {
        if (!btn) return;
        if (btn.getAttribute('data-size') === size) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
      if (typeof SpatialPanelManager !== 'undefined') SpatialPanelManager.setPanelSize('video', size);
    }

    if (!targetPanel || targetPanel === 'nota') {
      if (DOM.povNotaCard) {
        DOM.povNotaCard.classList.remove('size-small', 'size-medium', 'size-large');
        DOM.povNotaCard.classList.add(\`size-\${size}\`);
      }
      [DOM.povNotaSizeS, DOM.povNotaSizeM, DOM.povNotaSizeL].forEach(btn => {
        if (!btn) return;
        if (btn.getAttribute('data-size') === size) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
      if (typeof SpatialPanelManager !== 'undefined') SpatialPanelManager.setPanelSize('nota', size);
    }

    const labels = { small: 'Kecil (S)', medium: 'Sederhana (M)', large: 'Besar (L)' };
    showToast(\`📐 Saiz POV: \${labels[size]}\`);
  }`;

if (code.includes(targetPOVSize)) {
  code = code.replace(targetPOVSize, replacementPOVSize);
} else if (code.includes(altTargetPOVSize)) {
  code = code.replace(altTargetPOVSize, replacementPOVSize);
} else {
  console.warn('Target 3 (setPOVPanelSize) exact match not found, searching with regex...');
  const povSizeRegex = /function setPOVPanelSize\(size\)[\s\S]*?showToast\(`📐 Saiz POV: \$\{labels\[size\]\}`\);\s*\}/;
  if (povSizeRegex.test(code)) {
    code = code.replace(povSizeRegex, replacementPOVSize);
    console.log('Target 3 matched via regex!');
  } else {
    console.error('Target 3 could not be replaced!');
    process.exit(1);
  }
}

// 4. Update switchActiveModule to sync with SpatialPanelManager
const targetModVideo = `    } else if (mod === 'video') {\r\n      ARState.activeModule = 'video';`;
const altTargetModVideo = `    } else if (mod === 'video') {\n      ARState.activeModule = 'video';`;

const replacementModVideo = `    } else if (mod === 'video') {
      ARState.activeModule = 'video';
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('video');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('video', true);
          SpatialPanelManager.setPanelVisibility('nota', false);
        }
      }`;

if (code.includes(targetModVideo)) {
  code = code.replace(targetModVideo, replacementModVideo);
} else if (code.includes(altTargetModVideo)) {
  code = code.replace(altTargetModVideo, replacementModVideo);
}

const targetModNota = `    } else if (mod === 'nota') {\r\n      ARState.activeModule = 'nota';`;
const altTargetModNota = `    } else if (mod === 'nota') {\n      ARState.activeModule = 'nota';`;

const replacementModNota = `    } else if (mod === 'nota') {
      ARState.activeModule = 'nota';
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('nota');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('nota', true);
          SpatialPanelManager.setPanelVisibility('video', false);
        }
      }`;

if (code.includes(targetModNota)) {
  code = code.replace(targetModNota, replacementModNota);
} else if (code.includes(altTargetModNota)) {
  code = code.replace(altTargetModNota, replacementModNota);
}

// 5. In setSystemMode, handle hiding/showing both panels
const targetPOVSetupShow = `      // 2. Reveal POV panel firmly in center\r\n      if (DOM.povAnchor) {\r\n        DOM.povAnchor.classList.remove('hidden');\r\n        DOM.povAnchor.classList.add('is-visible', 'is-centered');\r\n        DOM.povAnchor.style.left = '50%';\r\n        DOM.povAnchor.style.top = '50%';\r\n        DOM.povAnchor.style.transform = 'translate(-50%, -50%)';\r\n        DOM.povAnchor.style.opacity = '1';\r\n      }`;
const altTargetPOVSetupShow = `      // 2. Reveal POV panel firmly in center\n      if (DOM.povAnchor) {\n        DOM.povAnchor.classList.remove('hidden');\n        DOM.povAnchor.classList.add('is-visible', 'is-centered');\n        DOM.povAnchor.style.left = '50%';\n        DOM.povAnchor.style.top = '50%';\n        DOM.povAnchor.style.transform = 'translate(-50%, -50%)';\n        DOM.povAnchor.style.opacity = '1';\n      }`;

const replacementPOVSetupShow = `      // 2. Reveal appropriate POV panel (Video or Nota) via SpatialPanelManager
      if (typeof SpatialPanelManager !== 'undefined') {
        if (ARState.activeModule === 'nota') {
          SpatialPanelManager.setPanelVisibility('nota', true);
          SpatialPanelManager.setPanelVisibility('video', false);
          if (DOM.povPanelNota) {
            DOM.povPanelNota.classList.add('is-centered');
            DOM.povPanelNota.style.left = '50%';
            DOM.povPanelNota.style.top = '50%';
            DOM.povPanelNota.style.transform = 'translate(-50%, -50%)';
            DOM.povPanelNota.style.opacity = '1';
          }
        } else {
          SpatialPanelManager.setPanelVisibility('video', true);
          SpatialPanelManager.setPanelVisibility('nota', false);
          if (DOM.povPanelVideo) {
            DOM.povPanelVideo.classList.add('is-centered');
            DOM.povPanelVideo.style.left = '50%';
            DOM.povPanelVideo.style.top = '50%';
            DOM.povPanelVideo.style.transform = 'translate(-50%, -50%)';
            DOM.povPanelVideo.style.opacity = '1';
          }
        }
      } else {
        if (DOM.povAnchor) {
          DOM.povAnchor.classList.remove('hidden');
          DOM.povAnchor.classList.add('is-visible', 'is-centered');
          DOM.povAnchor.style.left = '50%';
          DOM.povAnchor.style.top = '50%';
          DOM.povAnchor.style.transform = 'translate(-50%, -50%)';
          DOM.povAnchor.style.opacity = '1';
        }
      }`;

if (code.includes(targetPOVSetupShow)) {
  code = code.replace(targetPOVSetupShow, replacementPOVSetupShow);
} else if (code.includes(altTargetPOVSetupShow)) {
  code = code.replace(altTargetPOVSetupShow, replacementPOVSetupShow);
}

// 6. In setSystemMode: when returning to SCREEN_PINNED or MARKER, hide both panels
const targetPOVHidePinned = `      // Hide POV components\r\n      if (DOM.povAnchor) {\r\n        DOM.povAnchor.classList.add('hidden');\r\n        DOM.povAnchor.classList.remove('is-visible', 'is-centered');\r\n      }`;
const altTargetPOVHidePinned = `      // Hide POV components\n      if (DOM.povAnchor) {\n        DOM.povAnchor.classList.add('hidden');\n        DOM.povAnchor.classList.remove('is-visible', 'is-centered');\n      }`;

const replacementPOVHidePinned = `      // Hide POV components (Video & Nota)
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('video', false);
        SpatialPanelManager.setPanelVisibility('nota', false);
      }
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.add('hidden');
        DOM.povAnchor.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povPanelNota) {
        DOM.povPanelNota.classList.add('hidden');
        DOM.povPanelNota.classList.remove('is-visible', 'is-centered');
      }`;

if (code.includes(targetPOVHidePinned)) {
  code = code.replace(targetPOVHidePinned, replacementPOVHidePinned);
} else if (code.includes(altTargetPOVHidePinned)) {
  code = code.replace(altTargetPOVHidePinned, replacementPOVHidePinned);
}

// 7. In orientation loop: position both panels
const targetOrientPos = `          if (DOM.povAnchor) {\r\n            DOM.povAnchor.style.left = \`\${safeX}px\`;\r\n            DOM.povAnchor.style.top = \`\${safeY}px\`;\r\n            DOM.povAnchor.style.transform = 'translate(-50%, -50%)';\r\n          }`;
const altTargetOrientPos = `          if (DOM.povAnchor) {\n            DOM.povAnchor.style.left = \`\${safeX}px\`;\n            DOM.povAnchor.style.top = \`\${safeY}px\`;\n            DOM.povAnchor.style.transform = 'translate(-50%, -50%)';\n          }`;

const replacementOrientPos = `          if (DOM.povAnchor) {
            DOM.povAnchor.style.left = \`\${safeX}px\`;
            DOM.povAnchor.style.top = \`\${safeY}px\`;
            DOM.povAnchor.style.transform = 'translate(-50%, -50%)';
          }
          if (DOM.povPanelNota && ARState.activeModule === 'nota') {
            DOM.povPanelNota.style.left = \`\${safeX}px\`;
            DOM.povPanelNota.style.top = \`\${safeY}px\`;
            DOM.povPanelNota.style.transform = 'translate(-50%, -50%)';
          }`;

if (code.includes(targetOrientPos)) {
  code = code.replace(targetOrientPos, replacementOrientPos);
} else if (code.includes(altTargetOrientPos)) {
  code = code.replace(altTargetOrientPos, replacementOrientPos);
}

// 8. Event listeners for Nota panel buttons
const targetListeners = `    // Fasa 4C.4: Freeform 2D Corner Resize Grips (X, Y, Diagonal, Double-Tap Maximize)\r\n    setupCornerResizeGrip(DOM.cornerResizeHandle, DOM.floatingCard, false);\r\n    setupCornerResizeGrip(DOM.povCornerResizeHandle, DOM.povCard, true);`;
const altTargetListeners = `    // Fasa 4C.4: Freeform 2D Corner Resize Grips (X, Y, Diagonal, Double-Tap Maximize)\n    setupCornerResizeGrip(DOM.cornerResizeHandle, DOM.floatingCard, false);\n    setupCornerResizeGrip(DOM.povCornerResizeHandle, DOM.povCard, true);`;

const replacementListeners = `    // Fasa 4C.4: Freeform 2D Corner Resize Grips (X, Y, Diagonal, Double-Tap Maximize)
    setupCornerResizeGrip(DOM.cornerResizeHandle, DOM.floatingCard, false);
    setupCornerResizeGrip(DOM.povCornerResizeHandle, DOM.povCard, true);
    if (DOM.povNotaCornerResizeHandle && DOM.povNotaCard) {
      setupCornerResizeGrip(DOM.povNotaCornerResizeHandle, DOM.povNotaCard, true);
    }

    // Fasa 4E-B.1: Event Listeners for Nota Independent POV Panel
    if (DOM.povNotaSizeS) DOM.povNotaSizeS.addEventListener('click', () => setPOVPanelSize('small', 'nota'));
    if (DOM.povNotaSizeM) DOM.povNotaSizeM.addEventListener('click', () => setPOVPanelSize('medium', 'nota'));
    if (DOM.povNotaSizeL) DOM.povNotaSizeL.addEventListener('click', () => setPOVPanelSize('large', 'nota'));
    if (DOM.povNotaBtnToggleCam) DOM.povNotaBtnToggleCam.addEventListener('click', toggleCameraPower);
    if (DOM.povNotaBtnAnchor) {
      DOM.povNotaBtnAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        anchorPOVAtCurrentHeading();
      });
    }
    if (DOM.povNotaBtnChangeContent) {
      DOM.povNotaBtnChangeContent.addEventListener('click', () => {
        if (!DOM.povNotaSelectionView) return;
        const isHidden = DOM.povNotaSelectionView.classList.contains('hidden');
        if (isHidden) {
          DOM.povNotaSelectionView.classList.remove('hidden');
          if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
          renderPOVNoteCardsList();
          showToast('Pilih nota baharu daripada senarai.');
        } else {
          DOM.povNotaSelectionView.classList.add('hidden');
          if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
        }
      });
    }
    if (DOM.povNotaBtnBackPinned) DOM.povNotaBtnBackPinned.addEventListener('click', () => exitPOVMode(true));
    if (DOM.povNotaBtnClose) DOM.povNotaBtnClose.addEventListener('click', () => exitPOVMode(false));`;

if (code.includes(targetListeners)) {
  code = code.replace(targetListeners, replacementListeners);
} else if (code.includes(altTargetListeners)) {
  code = code.replace(altTargetListeners, replacementListeners);
}

// 9. Call SpatialPanelManager.init() inside init() function
const targetInitCall = `    initDiagnostics();\r\n    initApp();`;
const altTargetInitCall = `    initDiagnostics();\n    initApp();`;

const replacementInitCall = `    initDiagnostics();
    SpatialPanelManager.init();
    initApp();`;

if (code.includes(targetInitCall)) {
  code = code.replace(targetInitCall, replacementInitCall);
} else if (code.includes(altTargetInitCall)) {
  code = code.replace(altTargetInitCall, replacementInitCall);
}

// 10. Export SpatialPanelManager
const targetExports = `    // Fasa 4D-C Exports\r\n    CellQuestARController,\r\n    CELLQUEST_ORGANELLES\r\n  };`;
const altTargetExports = `    // Fasa 4D-C Exports\n    CellQuestARController,\n    CELLQUEST_ORGANELLES\n  };`;

const replacementExports = `    // Fasa 4D-C Exports
    CellQuestARController,
    CELLQUEST_ORGANELLES,
    // Fasa 4E-B.1 Exports
    SpatialPanelManager
  };`;

if (code.includes(targetExports)) {
  code = code.replace(targetExports, replacementExports);
} else if (code.includes(altTargetExports)) {
  code = code.replace(altTargetExports, replacementExports);
}

const targetGlobalExports = `  global.CellQuestARController = CellQuestARController;\r\n  global.CELLQUEST_ORGANELLES = CELLQUEST_ORGANELLES;`;
const altTargetGlobalExports = `  global.CellQuestARController = CellQuestARController;\n  global.CELLQUEST_ORGANELLES = CELLQUEST_ORGANELLES;`;

const replacementGlobalExports = `  global.CellQuestARController = CellQuestARController;
  global.CELLQUEST_ORGANELLES = CELLQUEST_ORGANELLES;
  global.SpatialPanelManager = SpatialPanelManager;`;

if (code.includes(targetGlobalExports)) {
  code = code.replace(targetGlobalExports, replacementGlobalExports);
} else if (code.includes(altTargetGlobalExports)) {
  code = code.replace(altTargetGlobalExports, replacementGlobalExports);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched kotak-arselnel.js with SpatialPanelManager & dual panel support!');

