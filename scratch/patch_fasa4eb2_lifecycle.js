const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'kotak_arselnel', 'kotak-arselnel.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove global document.getElementById shim and replace with explicit mapping
const targetShim = `    // Fasa 4E-B.1: Backward compatibility shim: map pov-ar-anchor lookup to pov-panel-video if requested
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
    DOM.povAnchor = DOM.povPanelVideo || document.getElementById('pov-ar-anchor');`;

const targetShimAlt = targetShim.replace(/\n/g, '\r\n');

const replacementShim = `    // Fasa 4E-B.2: Explicit Element Mapping (Zero monkey-patching of global DOM API)
    DOM.povPanelVideo = document.getElementById('pov-panel-video');
    DOM.povPanelNota = document.getElementById('pov-panel-nota');
    DOM.povAnchor = DOM.povPanelVideo;`;

if (code.includes(targetShim)) {
  code = code.replace(targetShim, replacementShim);
} else if (code.includes(targetShimAlt)) {
  code = code.replace(targetShimAlt, replacementShim);
} else {
  console.warn('Target shim exact match not found, checking regex...');
  const shimRegex = /\/\/ Fasa 4E-B\.1: Backward compatibility shim[\s\S]*?DOM\.povAnchor = DOM\.povPanelVideo \|\| document\.getElementById\('pov-ar-anchor'\);/;
  if (shimRegex.test(code)) {
    code = code.replace(shimRegex, replacementShim);
    console.log('Target shim matched via regex!');
  } else {
    console.error('Target shim could not be replaced!');
    process.exit(1);
  }
}

// 2. Enhance SpatialPanelManager with granular lifecycle methods
const targetSPM = `  const SpatialPanelManager = {
    panels: new Map(),
    activePanelId: 'video',`;
const targetSPMAlt = targetSPM.replace(/\n/g, '\r\n');

const enhancedSPMInit = `  const SpatialPanelManager = {
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
        placementMode: 'MARKER_MODE',
        referenceQuaternion: null,
        anchorWorldVector: null,
        isRegistered: true,
        isLoaded: false,
        isActive: false,
        isVisible: false,
        isLocked: false,
        isClosed: false,
        isDestroyed: false,
        playbackState: 'idle',
        savedScrollTop: 0,
        page: 1,
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
        isRegistered: true,
        isLoaded: false,
        isActive: false,
        isVisible: false,
        isLocked: false,
        isClosed: false,
        isDestroyed: false,
        playbackState: 'idle',
        savedScrollTop: 0,
        page: 1,
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

    getPanelElement(id) {
      const p = this.panels.get(id);
      return p ? p.element : null;
    },

    getAllPanels() {
      return Array.from(this.panels.values());
    },

    isPanelLoaded(id) {
      const p = this.panels.get(id);
      return p ? p.isLoaded : false;
    },

    setPanelLoaded(id, loaded) {
      const p = this.panels.get(id);
      if (p) p.isLoaded = !!loaded;
    },

    isPanelVisible(id) {
      const p = this.panels.get(id);
      return p ? p.isVisible : false;
    },

    setPanelVisibility(id, visible) {
      const p = this.panels.get(id);
      if (!p) return;
      p.isVisible = !!visible;
      p.visible = !!visible; // backward compatibility
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
      p.isLocked = (mode === 'POV_LOCKED');
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

    setPlaybackState(id, state) {
      const p = this.panels.get(id);
      if (p) p.playbackState = state;
    },

    savePanelScroll(id, scrollTop) {
      const p = this.panels.get(id);
      if (p) p.savedScrollTop = scrollTop;
    },

    getPanelScroll(id) {
      const p = this.panels.get(id);
      return p ? p.savedScrollTop : 0;
    },

    setPanelPage(id, page) {
      const p = this.panels.get(id);
      if (p) p.page = page;
    },

    closePanel(id) {
      const p = this.panels.get(id);
      if (!p) return;
      p.isClosed = true;
      this.setPanelVisibility(id, false);
      if (id === 'video') pauseVideo();
    },

    destroyPanel(id) {
      const p = this.panels.get(id);
      if (!p) return;
      p.isDestroyed = true;
      p.isLoaded = false;
      this.setPanelVisibility(id, false);
      if (id === 'video') destroyVideoSession();
      if (id === 'nota') destroyNotaSession();
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
        this.panels.forEach((p, k) => {
          p.isActive = (k === id);
        });
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
          isRegistered: panel.isRegistered,
          isLoaded: panel.isLoaded,
          isActive: panel.isActive,
          isVisible: panel.isVisible,
          isLocked: panel.isLocked,
          isClosed: panel.isClosed,
          isDestroyed: panel.isDestroyed,
          playbackState: panel.playbackState,
          savedScrollTop: panel.savedScrollTop,
          page: panel.page,
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

// Replace entire old SpatialPanelManager block
const spmRegex = /const SpatialPanelManager = \{[\s\S]*?activePanelId: this\.activePanelId,\s*panels: snapshot\s*\}\;\s*\}\s*\};/;
if (spmRegex.test(code)) {
  code = code.replace(spmRegex, enhancedSPMInit);
  console.log('SpatialPanelManager updated with full lifecycle methods!');
} else {
  console.error('SpatialPanelManager regex did not match!');
  process.exit(1);
}

// 3. Define the Video and Nota Lifecycle Management Functions
const lifecycleFunctions = `
  /**
   * ==============================================================================
   * FASA 4E-B.2: VIDEO & NOTA INDEPENDENT LIFECYCLE MANAGEMENT
   * Membezakan: pauseVideo, resumeVideo, hideVideoPanel, showVideoPanel, destroyVideoSession
   * Membezakan: hideNotaPanel, showNotaPanel, destroyNotaSession
   * Prinsip Utama: Menukar modul tidak sama dengan memusnahkan sesi video/nota!
   * ==============================================================================
   */

  function sendYouTubeCommand(iframe, func, args = '') {
    if (!iframe || !iframe.contentWindow) return;
    try {
      const payload = JSON.stringify({
        event: 'command',
        func: func,
        args: args ? [args] : ''
      });
      iframe.contentWindow.postMessage(payload, '*');
    } catch (e) {
      console.warn('[VideoLifecycle] Failed to postMessage to iframe:', e);
    }
  }

  function pauseHtml5Video(videoEl) {
    if (videoEl && typeof videoEl.pause === 'function' && !videoEl.paused) {
      videoEl.pause();
    }
  }

  function resumeHtml5Video(videoEl) {
    if (videoEl && typeof videoEl.play === 'function' && videoEl.paused) {
      videoEl.play().catch(err => {
        console.warn('[VideoLifecycle] Autoplay on resume restricted by browser policy:', err);
      });
    }
  }

  function pauseVideo() {
    console.log('[VideoLifecycle] ⏸️ Menjeda video sambil mengekalkan sesi DOM & iframe...');
    // 1. POV Player Frame
    if (DOM.povPlayerFrame) {
      const povVideo = DOM.povPlayerFrame.querySelector('video');
      if (povVideo) pauseHtml5Video(povVideo);
      const povIframe = DOM.povPlayerFrame.querySelector('iframe');
      if (povIframe) sendYouTubeCommand(povIframe, 'pauseVideo');
    }
    // 2. Floating Player Frame
    if (DOM.playerFrame) {
      const floatVideo = DOM.playerFrame.querySelector('video');
      if (floatVideo) pauseHtml5Video(floatVideo);
      const floatIframe = DOM.playerFrame.querySelector('iframe');
      if (floatIframe) sendYouTubeCommand(floatIframe, 'pauseVideo');
    }
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPlaybackState('video', 'paused');
    }
  }

  function resumeVideo() {
    console.log('[VideoLifecycle] ▶️ Menyambung semula video pada sesi sedia ada...');
    if (DOM.povPlayerFrame) {
      const povVideo = DOM.povPlayerFrame.querySelector('video');
      if (povVideo) resumeHtml5Video(povVideo);
      const povIframe = DOM.povPlayerFrame.querySelector('iframe');
      if (povIframe) sendYouTubeCommand(povIframe, 'playVideo');
    }
    if (DOM.playerFrame) {
      const floatVideo = DOM.playerFrame.querySelector('video');
      if (floatVideo) resumeHtml5Video(floatVideo);
      const floatIframe = DOM.playerFrame.querySelector('iframe');
      if (floatIframe) sendYouTubeCommand(floatIframe, 'playVideo');
    }
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPlaybackState('video', 'playing');
    }
  }

  function hideVideoPanel() {
    pauseVideo();
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('video', false);
    }
    if (DOM.povPanelVideo) {
      DOM.povPanelVideo.classList.remove('is-visible');
      DOM.povPanelVideo.classList.add('hidden');
    }
  }

  function showVideoPanel() {
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('video', true);
    }
    if (DOM.povPanelVideo) {
      DOM.povPanelVideo.classList.remove('hidden');
      DOM.povPanelVideo.classList.add('is-visible');
    }
    if (ARState.activeVideo) {
      if (DOM.activePlayerView) DOM.activePlayerView.classList.add('is-active');
      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
      syncPOVVideoPlayer(ARState.activeVideo);
    }
  }

  function destroyVideoSession() {
    console.log('[VideoLifecycle] 🛑 Memusnahkan sesi video secara eksplisit atas arahan pengguna...');
    pauseVideo();
    if (DOM.playerFrame) DOM.playerFrame.innerHTML = '';
    if (DOM.povPlayerFrame) DOM.povPlayerFrame.innerHTML = '';
    ARState.activeVideo = null;
    if (ARState.pov) ARState.pov.loadedVideoId = null;
    if (typeof SpatialPanelManager !== 'undefined') {
      const p = SpatialPanelManager.getPanel('video');
      if (p) {
        p.isLoaded = false;
        p.playbackState = 'destroyed';
      }
      SpatialPanelManager.setPanelVisibility('video', false);
    }
    if (DOM.povPanelVideo) {
      DOM.povPanelVideo.classList.add('hidden');
      DOM.povPanelVideo.classList.remove('is-visible');
    }
  }

  function hideNotaPanel() {
    if (DOM.povNotaScrollableBody) {
      ARState.povNotaSavedScrollTop = DOM.povNotaScrollableBody.scrollTop;
    }
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('nota', false);
      SpatialPanelManager.savePanelScroll('nota', ARState.povNotaSavedScrollTop || 0);
    }
    if (DOM.povPanelNota) {
      DOM.povPanelNota.classList.remove('is-visible');
      DOM.povPanelNota.classList.add('hidden');
    }
  }

  function showNotaPanel() {
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('nota', true);
    }
    if (DOM.povPanelNota) {
      DOM.povPanelNota.classList.remove('hidden');
      DOM.povPanelNota.classList.add('is-visible');
    }
    // Only load from CMS/seed if no note was ever chosen
    if (!ARState.activeNote) {
      if (ARState.notes && ARState.notes.length > 0) {
        selectNote(ARState.notes[0]);
      }
    } else {
      // Note already loaded! Maintain content, page, and scroll without destroying DOM
      if (DOM.activeNotaView) DOM.activeNotaView.classList.remove('hidden');
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
      if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      if (DOM.povNotaScrollableBody && ARState.povNotaSavedScrollTop !== undefined) {
        DOM.povNotaScrollableBody.scrollTop = ARState.povNotaSavedScrollTop;
      }
    }
  }

  function destroyNotaSession() {
    console.log('[NotaLifecycle] 🛑 Memusnahkan sesi nota secara eksplisit atas arahan pengguna...');
    ARState.activeNote = null;
    if (typeof SpatialPanelManager !== 'undefined') {
      const p = SpatialPanelManager.getPanel('nota');
      if (p) {
        p.isLoaded = false;
      }
      SpatialPanelManager.setPanelVisibility('nota', false);
    }
    if (DOM.povPanelNota) {
      DOM.povPanelNota.classList.add('hidden');
      DOM.povPanelNota.classList.remove('is-visible');
    }
  }
`;

// Insert lifecycle functions before stopVideoPlayback
const targetStopVideo = `  function stopVideoPlayback() {`;
if (code.includes(targetStopVideo)) {
  code = code.replace(targetStopVideo, lifecycleFunctions + '\n  function stopVideoPlayback() {');
  console.log('Lifecycle functions inserted before stopVideoPlayback!');
} else {
  console.error('Target stopVideoPlayback not found!');
  process.exit(1);
}

// 4. Update stopVideoPlayback() implementation to pauseVideo() without destroying innerHTML
const targetStopBody = `  function stopVideoPlayback() {
    if (DOM.playerFrame) DOM.playerFrame.innerHTML = '';
    if (DOM.povPlayerFrame) DOM.povPlayerFrame.innerHTML = '';
  }`;
const altTargetStopBody = targetStopBody.replace(/\n/g, '\r\n');

const replacementStopBody = `  function stopVideoPlayback() {
    // Fasa 4E-B.2: Non-destructive audio & playback silencing. Iframe and session remain intact!
    pauseVideo();
  }`;

if (code.includes(targetStopBody)) {
  code = code.replace(targetStopBody, replacementStopBody);
} else if (code.includes(altTargetStopBody)) {
  code = code.replace(altTargetStopBody, replacementStopBody);
} else {
  console.warn('Target stopVideoPlayback body not exact match, using regex...');
  const stopRegex = /function stopVideoPlayback\(\)\s*\{[\s\S]*?DOM\.povPlayerFrame\.innerHTML = '';\s*\}/;
  if (stopRegex.test(code)) {
    code = code.replace(stopRegex, replacementStopBody);
    console.log('stopVideoPlayback replaced via regex!');
  } else {
    console.error('stopVideoPlayback could not be replaced!');
    process.exit(1);
  }
}

// 5. Update switchActiveModule to use show/hide lifecycle functions
// When mod === 'nota'
const targetSwitchNota = `      // 1. Pause & clear video to silence audio
      stopVideoPlayback();`;
const replacementSwitchNota = `      // 1. Pause video without destroying session & hide video panel
      hideVideoPanel();
      showNotaPanel();`;

if (code.includes(targetSwitchNota)) {
  code = code.replace(targetSwitchNota, replacementSwitchNota);
}

// When mod === 'video'
const targetSwitchVideo = `      // Hide note views
      if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
      if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');`;

const replacementSwitchVideo = `      // Hide note panel preserving session, show video panel and resume
      hideNotaPanel();
      showVideoPanel();
      resumeVideo();
      if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
      if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');`;

if (code.includes(targetSwitchVideo)) {
  code = code.replace(targetSwitchVideo, replacementSwitchVideo);
}

// 6. Update selectVideo and syncPOVVideoPlayer to include enablejsapi=1 in YouTube URLs
code = code.replace(
  'src="${embedUrl}?autoplay=1&rel=0&playsinline=1"',
  'src="${embedUrl}?autoplay=1&enablejsapi=1&rel=0&playsinline=1"'
);
code = code.replace(
  'src="${embedUrl}?autoplay=1&rel=0&playsinline=1"',
  'src="${embedUrl}?autoplay=1&enablejsapi=1&rel=0&playsinline=1"'
);

// 7. Update close button listeners to invoke explicit destroy functions
const targetCloseBtn = `if (DOM.povBtnClose) DOM.povBtnClose.addEventListener('click', () => exitPOVMode(false));`;
const replacementCloseBtn = `if (DOM.povBtnClose) DOM.povBtnClose.addEventListener('click', () => { destroyVideoSession(); exitPOVMode(false); });`;
if (code.includes(targetCloseBtn)) {
  code = code.replace(targetCloseBtn, replacementCloseBtn);
}

const targetNotaCloseBtn = `if (DOM.povNotaBtnClose) DOM.povNotaBtnClose.addEventListener('click', () => exitPOVMode(false));`;
const replacementNotaCloseBtn = `if (DOM.povNotaBtnClose) DOM.povNotaBtnClose.addEventListener('click', () => { destroyNotaSession(); exitPOVMode(false); });`;
if (code.includes(targetNotaCloseBtn)) {
  code = code.replace(targetNotaCloseBtn, replacementNotaCloseBtn);
}

// 8. Export new lifecycle methods in KotakARSELNEL and global
const targetExportList = `    // Fasa 4E-B.1 Exports
    SpatialPanelManager
  };`;
const replacementExportList = `    // Fasa 4E-B.1 Exports
    SpatialPanelManager,
    // Fasa 4E-B.2 Lifecycle Exports
    pauseVideo,
    resumeVideo,
    hideVideoPanel,
    showVideoPanel,
    destroyVideoSession,
    hideNotaPanel,
    showNotaPanel,
    destroyNotaSession
  };`;

if (code.includes(targetExportList)) {
  code = code.replace(targetExportList, replacementExportList);
}

const targetGlobalExport = `  global.SpatialPanelManager = SpatialPanelManager;`;
const replacementGlobalExport = `  global.SpatialPanelManager = SpatialPanelManager;
  global.pauseVideo = pauseVideo;
  global.resumeVideo = resumeVideo;
  global.hideVideoPanel = hideVideoPanel;
  global.showVideoPanel = showVideoPanel;
  global.destroyVideoSession = destroyVideoSession;
  global.hideNotaPanel = hideNotaPanel;
  global.showNotaPanel = showNotaPanel;
  global.destroyNotaSession = destroyNotaSession;`;

if (code.includes(targetGlobalExport)) {
  code = code.replace(targetGlobalExport, replacementGlobalExport);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched kotak-arselnel.js for Fasa 4E-B.2 Lifecycle Management!');

