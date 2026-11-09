/**
 * ARSELNEL — KOTAK ARSELNEL: IMBAS & BELAJAR (FASA 2: PROTOTAIP VIDEO MARKER)
 * MindAR Three.js Controller, Floating AR Video Panel & CMS Integration
 */

(function (global) {
  'use strict';

  // State Management
  const ARState = {
    mindarThree: null,
    renderer: null,
    scene: null,
    camera: null,
    anchor: null,
    hologramGroup: null,
    
    // Tracking & Hysteresis
    isTracking: false,
    lostTimeout: null,
    HYSTERESIS_DELAY: 450, // ms before hiding panel to prevent flicker
    
    // Content Data
    videos: [],
    activeVideo: null,
    
    // Interpolation (LERP) coordinates for smooth floating panel
    targetScreenX: window.innerWidth / 2,
    targetScreenY: window.innerHeight / 2,
    currentScreenX: window.innerWidth / 2,
    currentScreenY: window.innerHeight / 2,
    lerpFactor: 0.22,
    isPanelVisible: false,

    // Phase 3: Screen-Pinned Mode & Position Locking
    isPinned: false,
    isLocked: false,
    panelSize: 'medium', // 'small' | 'medium' | 'large'
    cameraActive: true,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialPanelX: 0,
    initialPanelY: 0,
    isResizing: false,
    resizeStartWidth: 0,
    resizeStartX: 0,

    // Active Global Mode: 'MARKER' | 'SCREEN_PINNED' | 'POV_SETUP' | 'POV_LOCKED'
    systemMode: 'MARKER',

    // Fasa 3C: Gyroscope POV Lock Engine State
    pov: {
      active: false,
      hasSensor: false,
      permissionGranted: false,
      isSimulated: false,
      isAnchored: false,
      listenersAttached: false,
      eventCount: 0,
      rawAlpha: 0,
      rawBeta: 0,
      rawGamma: 0,
      smoothAlpha: 0,
      smoothBeta: 0,
      smoothGamma: 0,
      screenAngle: 0,
      currentYaw: 0,
      currentPitch: 0,
      currentRoll: 0,
      targetQuaternion: null,
      currentQuaternion: null,
      anchorQuaternion: null,
      anchorWorldVector: null,
      anchorYaw: 0,
      anchorPitch: 0,
      anchorAlpha: 0,
      anchorBeta: 0,
      deltaYaw: 0,
      deltaPitch: 0,
      virtualCamera: null,
      rafId: null,
      size: 'medium',
      isOffscreen: false,
      pointerSide: 'left',
      loadedVideoId: null,
      simYaw: 0,
      simPitch: 0
    }
  };

  // DOM Elements Cache
  const DOM = {};

  function cacheDOM() {
    DOM.container = document.getElementById('ar-container');
    DOM.scannerOverlay = document.getElementById('scanner-overlay');
    DOM.floatingAnchor = document.getElementById('floating-ar-anchor');
    DOM.floatingCard = document.getElementById('floating-card-container');
    DOM.panelHeader = document.getElementById('panel-fixed-header');
    DOM.panelBody = document.getElementById('panel-scrollable-body');
    DOM.panelFooter = document.getElementById('panel-sticky-footer');
    DOM.cardDragBar = document.getElementById('card-drag-bar');
    DOM.dragLockBadge = document.getElementById('drag-lock-badge');
    DOM.dragLockIcon = document.getElementById('drag-lock-icon');
    DOM.dragLockText = document.getElementById('drag-lock-text');
    DOM.cardHeader = document.getElementById('floating-card-header');
    DOM.trackingBadge = document.getElementById('tracking-status-badge');
    DOM.trackingText = document.getElementById('tracking-status-text');
    DOM.trackingPing = document.getElementById('tracking-ping');
    DOM.pinnedToolbar = document.getElementById('pinned-toolbar');
    DOM.btnSizeS = document.getElementById('btn-size-s');
    DOM.btnSizeM = document.getElementById('btn-size-m');
    DOM.btnSizeL = document.getElementById('btn-size-l');
    DOM.btnToggleCam = document.getElementById('btn-toggle-cam');
    DOM.camToggleIcon = document.getElementById('cam-toggle-icon');
    DOM.camToggleText = document.getElementById('cam-toggle-text');
    DOM.btnSwitchToPOV = document.getElementById('btn-switch-to-pov');
    DOM.btnLockVideo = document.getElementById('btn-lock-video');
    DOM.lockBtnIcon = document.getElementById('lock-btn-icon');
    DOM.lockBtnText = document.getElementById('lock-btn-text');
    DOM.cornerResizeHandle = document.getElementById('corner-resize-handle');
    DOM.videoSelectionView = document.getElementById('video-selection-view');
    DOM.activePlayerView = document.getElementById('active-player-view');
    DOM.videoCardsScroll = document.getElementById('video-cards-scroll');
    DOM.playerFrame = document.getElementById('ar-player-frame');
    DOM.playerTitle = document.getElementById('player-video-title');
    DOM.playerDesc = document.getElementById('player-video-desc');
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.loadingDesc = document.getElementById('loading-desc');
    DOM.btnChangeVideo = document.getElementById('btn-change-video');
    DOM.btnPlaceVideo = document.getElementById('btn-place-video');
    DOM.btnStartPOV = document.getElementById('btn-start-pov');
    DOM.btnClosePanel = document.getElementById('btn-close-panel');
    DOM.toast = document.getElementById('ar-toast');
    DOM.toastText = document.getElementById('toast-text');

    // Navigation & Header HUD
    DOM.btnBackDashboard = document.getElementById('btn-back-dashboard');
    DOM.backHudIcon = document.getElementById('back-hud-icon');
    DOM.backHudText = document.getElementById('back-hud-text');
    DOM.btnToggleDiagnostics = document.getElementById('btn-toggle-diagnostics');

    // Fasa 3C POV DOM Elements
    DOM.povAnchor = document.getElementById('pov-ar-anchor');
    DOM.povCard = document.getElementById('pov-card-container');
    DOM.povHeader = document.getElementById('pov-fixed-header');
    DOM.povBody = document.getElementById('pov-scrollable-body');
    DOM.povFooter = document.getElementById('pov-sticky-footer');
    DOM.povSensorPill = document.getElementById('pov-sensor-pill');
    DOM.povSensorPing = document.getElementById('pov-sensor-ping');
    DOM.povSensorText = document.getElementById('pov-sensor-text');
    DOM.povToolbar = document.getElementById('pov-toolbar');
    DOM.povBtnToggleCam = document.getElementById('pov-btn-toggle-cam');
    DOM.povCamIcon = document.getElementById('pov-cam-icon');
    DOM.povCamText = document.getElementById('pov-cam-text');
    DOM.povSizeS = document.getElementById('pov-size-s');
    DOM.povSizeM = document.getElementById('pov-size-m');
    DOM.povSizeL = document.getElementById('pov-size-l');
    DOM.povCompassRing = document.getElementById('pov-compass-ring');
    DOM.povNeedle = document.getElementById('pov-needle');
    DOM.povTargetLockIcon = document.getElementById('pov-target-lock-icon');
    DOM.povStatusBanner = document.getElementById('pov-status-banner');
    DOM.povBannerIcon = document.getElementById('pov-banner-icon');
    DOM.povBannerText = document.getElementById('pov-banner-text');
    DOM.povValYaw = document.getElementById('pov-val-yaw');
    DOM.povValPitch = document.getElementById('pov-val-pitch');
    DOM.povValStatus = document.getElementById('pov-val-status');
    DOM.povBtnAnchor = document.getElementById('pov-btn-anchor');
    DOM.povAnchorIcon = document.getElementById('pov-anchor-icon');
    DOM.povAnchorText = document.getElementById('pov-anchor-text');
    DOM.povBtnChangeVideo = document.getElementById('pov-btn-change-video');
    DOM.povBtnRecalibrate = document.getElementById('pov-btn-recalibrate');
    DOM.povBtnBackPinned = document.getElementById('pov-btn-back-pinned');
    DOM.povBtnClose = document.getElementById('pov-btn-close');
    DOM.povOffscreenPointer = document.getElementById('pov-offscreen-pointer');
    DOM.povPointerArrow = document.getElementById('pov-pointer-arrow');
    DOM.povPointerBearing = document.getElementById('pov-pointer-bearing');

    // Fasa C: Real Video Player Elements in POV
    DOM.povActivePlayerView = document.getElementById('pov-active-player-view');
    DOM.povPlayerFrame = document.getElementById('pov-player-frame');
    DOM.povPlayerTitle = document.getElementById('pov-player-title');
    DOM.povPlayerDesc = document.getElementById('pov-player-desc');
    DOM.povVideoSelectionView = document.getElementById('pov-video-selection-view');
    DOM.povVideoCardsScroll = document.getElementById('pov-video-cards-scroll');

    // Fixed Floating Recovery Bar
    DOM.povFixedRecoveryBar = document.getElementById('pov-fixed-recovery-bar');
    DOM.povRecCenter = document.getElementById('pov-rec-center');
    DOM.povRecRecalibrate = document.getElementById('pov-rec-recalibrate');
    DOM.povRecCam = document.getElementById('pov-rec-cam');
    DOM.povRecCamIcon = document.getElementById('pov-rec-cam-icon');
    DOM.povRecCamText = document.getElementById('pov-rec-cam-text');
    DOM.povRecBackPinned = document.getElementById('pov-rec-back-pinned');
    DOM.povRecClose = document.getElementById('pov-rec-close');

    // Desktop POV Simulator & Collapsible Toggle
    DOM.povSimController = document.getElementById('pov-sim-controller');
    DOM.povSimAngleBadge = document.getElementById('pov-sim-angle-badge');
    DOM.btnToggleSimCollapse = document.getElementById('btn-toggle-sim-collapse');
    DOM.simCollapseIcon = document.getElementById('sim-collapse-icon');
    DOM.simControlsBody = document.getElementById('sim-controls-body');
    DOM.povSimSlider = document.getElementById('pov-sim-slider');
    DOM.povSimLeft = document.getElementById('pov-sim-left');
    DOM.povSimCenter = document.getElementById('pov-sim-center');
    DOM.povSimRight = document.getElementById('pov-sim-right');
    DOM.povSimPitchSlider = document.getElementById('pov-sim-pitch-slider');
    DOM.povSimDown = document.getElementById('pov-sim-down');
    DOM.povSimPitchCenter = document.getElementById('pov-sim-pitch-center');
    DOM.povSimUp = document.getElementById('pov-sim-up');

    // Sensor Diagnostics Drawer
    DOM.diagnosticsDrawer = document.getElementById('diagnostics-drawer');
    DOM.btnCloseDiagnostics = document.getElementById('btn-close-diagnostics');
    DOM.diagDevice = document.getElementById('diag-device');
    DOM.diagBrowser = document.getElementById('diag-browser');
    DOM.diagScreenOrient = document.getElementById('diag-screen-orient');
    DOM.diagPermission = document.getElementById('diag-permission');
    DOM.diagSensorActive = document.getElementById('diag-sensor-active');
    DOM.diagEventCount = document.getElementById('diag-event-count');
    DOM.diagRawAngles = document.getElementById('diag-raw-angles');
    DOM.diagYaw = document.getElementById('diag-yaw');
    DOM.diagPitch = document.getElementById('diag-pitch');
    DOM.diagRoll = document.getElementById('diag-roll');
    DOM.diagAnchor = document.getElementById('diag-anchor');
    DOM.diagDeltaYaw = document.getElementById('diag-delta-yaw');
    DOM.diagDeltaPitch = document.getElementById('diag-delta-pitch');
    DOM.diagMode = document.getElementById('diag-mode');
    DOM.diagCam = document.getElementById('diag-cam');
    DOM.diagPanelVis = document.getElementById('diag-panel-vis');

    // Exit Confirmation Modal Dialog
    DOM.exitModalBackdrop = document.getElementById('exit-modal-backdrop');
    DOM.btnExitCancel = document.getElementById('btn-exit-cancel');
    DOM.btnExitConfirm = document.getElementById('btn-exit-confirm');
  }

  /**
   * Show non-intrusive floating toast notification
   */
  function showToast(message, duration = 3000) {
    if (!DOM.toast || !DOM.toastText) return;
    DOM.toastText.textContent = message;
    DOM.toast.classList.add('is-show');
    clearTimeout(DOM.toast._timer);
    DOM.toast._timer = setTimeout(() => {
      DOM.toast.classList.remove('is-show');
    }, duration);
  }

  /**
   * Load real published video list from ARSELNEL CMS
   */
  async function loadVideosFromCMS() {
    try {
      if (window.CMSAdapter && typeof window.CMSAdapter.getVideos === 'function') {
        const published = await window.CMSAdapter.getVideos({ status: 'published' });
        if (Array.isArray(published) && published.length > 0) {
          ARState.videos = published;
          console.log('[KotakAR] Loaded videos from CMSAdapter:', published.length);
          return;
        }
      }
    } catch (err) {
      console.warn('[KotakAR] CMSAdapter query failed, falling back to local seeds:', err);
    }

    // High quality bundled seeds fallback
    ARState.videos = [
      {
        id: 'vid-cell-structure-1',
        title: 'Pengenalan Sel Haiwan & Sel Tumbuhan (KSSM Tingkatan 1)',
        description: 'Terokai struktur unit asas hidupan, perbezaan membran sel, nukleus, kloroplas dan sitoplasma.',
        category: 'Struktur Sel',
        duration: '04:15',
        url: 'https://www.youtube.com/watch?v=URUJD5NEXC8',
        thumbnail: '../assets/nota/cover_topic1.svg'
      },
      {
        id: 'vid-organelles-2',
        title: 'Fungsi Organel Sel: Mitokondria & Nukleus',
        description: 'Kaji peranan stesen janakuasa sel (ATP) dan bagaimana nukleus menyimpan maklumat genetik DNA.',
        category: 'Organel Sel',
        duration: '05:30',
        url: 'https://www.youtube.com/watch?v=fKEa-z6i26k',
        thumbnail: '../assets/nota/cover_topic2.svg'
      },
      {
        id: 'vid-cell-org-3',
        title: 'Organisasi Sel: Daripada Sel Menjadi Organisma Kompleks',
        description: 'Bagaimana sel membentuk tisu, organ, sistem saraf, sistem respirasi dan organisma sempurna.',
        category: 'Organisasi Sel',
        duration: '06:10',
        url: 'https://www.youtube.com/watch?v=cbdyff23v7Q',
        thumbnail: '../assets/nota/cover_topic3.svg'
      }
    ];
  }

  /**
   * Render video list into floating panel
   */
  function renderVideoList() {
    if (!DOM.videoCardsScroll) return;
    DOM.videoCardsScroll.innerHTML = '';

    ARState.videos.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'ar-video-item';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Pilih video: ${video.title}`);

      // Thumbnail resolver
      let thumb = (video.thumbnail || '').trim();
      if (!thumb || thumb.includes('unsplash')) {
        const ytMatch = (video.url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1]) {
          thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        } else {
          thumb = '../assets/nota/cover_topic1.svg';
        }
      }

      card.innerHTML = `
        <div class="ar-video-thumb-wrap">
          <img src="${thumb}" alt="${video.title}" loading="lazy" />
          <div class="play-badge">
            <span class="material-symbols-outlined">play_arrow</span>
          </div>
        </div>
        <div class="ar-video-info">
          <h4>${video.title}</h4>
          <div class="ar-video-meta">
            <span class="cat-chip">${video.category || 'Biologi Sel'}</span>
            <span>⏱️ ${video.duration || '04:00'}</span>
          </div>
        </div>
        <button type="button" class="btn-choose-video">Pilih</button>
      `;

      card.addEventListener('click', () => selectVideo(video));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectVideo(video);
        }
      });

      DOM.videoCardsScroll.appendChild(card);
    });
  }

  /**
   * Switch to Active Video Player
   */
  function selectVideo(video) {
    ARState.activeVideo = video;
    if (DOM.playerTitle) DOM.playerTitle.textContent = video.title;
    if (DOM.playerDesc) DOM.playerDesc.textContent = video.description || 'Penerangan video pembelajaran sains ARSELNEL.';

    // Embed Video Player
    if (DOM.playerFrame) {
      DOM.playerFrame.innerHTML = '';
      const url = (video.url || '').trim();

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = window.CMSAdapter && typeof window.CMSAdapter.normalizeVideoUrl === 'function'
          ? window.CMSAdapter.normalizeVideoUrl(url)
          : url.replace('watch?v=', 'embed/').split('&')[0];

        DOM.playerFrame.innerHTML = `
          <iframe 
            src="${embedUrl}?autoplay=1&rel=0&playsinline=1" 
            title="${video.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        `;
      } else if (url) {
        DOM.playerFrame.innerHTML = `
          <video controls autoplay playsinline poster="${video.thumbnail || ''}">
            <source src="${url}" type="video/mp4">
            <source src="${url}" type="video/webm">
            Pelayar anda tidak menyokong tag video HTML5.
          </video>
        `;
      }
    }

    // Toggle views
    if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
    if (DOM.activePlayerView) DOM.activePlayerView.classList.add('is-active');

    // Update Phase 3 buttons
    if (!ARState.isPinned) {
      if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.remove('hidden');
      if (DOM.btnLockVideo) DOM.btnLockVideo.classList.add('hidden');
    } else {
      if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.add('hidden');
      if (DOM.btnLockVideo) DOM.btnLockVideo.classList.remove('hidden');
    }

    showToast(`Video dipilih: ${video.title}`);
  }

  /**
   * Return back to Video Selection List
   */
  function returnToSelectionList() {
    // Clear video frame to stop playback sound
    if (DOM.playerFrame) DOM.playerFrame.innerHTML = '';
    ARState.activeVideo = null;

    if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
    if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'flex';
  }

  /**
   * Setup 3D Holographic Base on the marker in Three.js
   */
  function create3DHologramBase() {
    const group = new THREE.Group();

    // 1. Glowing Neon Boundary Square around Marker (1 unit = 1 marker width)
    const lineGeo = new THREE.BufferGeometry();
    const s = 0.52;
    const vertices = new Float32Array([
      -s, -s, 0,   s, -s, 0,
       s, -s, 0,   s,  s, 0,
       s,  s, 0,  -s,  s, 0,
      -s,  s, 0,  -s, -s, 0
    ]);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xff7a00,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const frameMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(frameMesh);

    // 2. Corner Target Brackets (Sci-fi feel)
    const cs = 0.12;
    const bracketGeo = new THREE.BufferGeometry();
    const bVerts = new Float32Array([
      // Top-left
      -s, s - cs, 0, -s, s, 0,  -s, s, 0, -s + cs, s, 0,
      // Top-right
       s - cs, s, 0,  s, s, 0,   s, s, 0,  s, s - cs, 0,
      // Bottom-right
       s, -s + cs, 0,  s, -s, 0,  s, -s, 0,  s - cs, -s, 0,
      // Bottom-left
      -s + cs, -s, 0, -s, -s, 0, -s, -s, 0, -s, -s + cs, 0
    ]);
    bracketGeo.setAttribute('position', new THREE.BufferAttribute(bVerts, 3));
    const bracketMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, linewidth: 4 });
    const brackets = new THREE.LineSegments(bracketGeo, bracketMat);
    group.add(brackets);

    // 3. Central Pulsing Hologram Beacon Disk
    const circleGeo = new THREE.RingGeometry(0.08, 0.28, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0xff7a00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const beaconMesh = new THREE.Mesh(circleGeo, circleMat);
    beaconMesh.position.z = 0.02;
    group.add(beaconMesh);

    // 4. Upward Hologram Projector Light Beam
    const cylinderGeo = new THREE.CylinderGeometry(0.24, 0.12, 0.4, 32, 1, true);
    cylinderGeo.rotateX(Math.PI / 2);
    cylinderGeo.translate(0, 0, 0.2);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const beamMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
    group.add(beamMesh);

    return { group, beaconMesh, frameMesh };
  }

  // System Modes (Single Active State Architecture)
  const SYSTEM_MODES = {
    MARKER: 'MARKER',                 // Scanning / floating on marker
    SCREEN_PINNED: 'SCREEN_PINNED',   // Pinned on screen (draggable)
    POV_SETUP: 'POV_SETUP',           // In POV mode, aiming towards desired target (CENTERED, NO SPATIAL DRIFT)
    POV_LOCKED: 'POV_LOCKED'          // Anchored on 3D spatial heading (active gyro projection)
  };

  /**
   * Transition System State explicitly to prevent overlapping panels and unexpected drift
   */
  function setSystemMode(newMode) {
    ARState.systemMode = newMode;
    console.log('[KotakAR] 🔄 Mod Sistem:', newMode);

    // Update diagnostics badge
    if (DOM.diagMode) DOM.diagMode.textContent = newMode;

    if (newMode === SYSTEM_MODES.POV_SETUP) {
      // 1. Hide original video floating anchor completely
      if (DOM.floatingAnchor) {
        DOM.floatingAnchor.classList.add('hidden');
        DOM.floatingAnchor.classList.remove('is-visible');
      }
      if (DOM.scannerOverlay) {
        DOM.scannerOverlay.classList.add('hidden');
      }

      // 2. Reveal POV panel firmly in center
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.remove('hidden');
        DOM.povAnchor.classList.add('is-visible', 'is-centered');
        DOM.povAnchor.style.left = '50%';
        DOM.povAnchor.style.top = '50%';
        DOM.povAnchor.style.transform = 'translate(-50%, -50%)';
        DOM.povAnchor.style.opacity = '1';
      }

      // 3. Show persistent recovery toolbar
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.remove('hidden');
      }

      // 4. Hide off-screen pointer
      if (DOM.povOffscreenPointer) {
        DOM.povOffscreenPointer.classList.add('hidden');
      }

      // 5. Setup / Reset Button States
      ARState.pov.isAnchored = false;
      if (DOM.povBtnAnchor) {
        DOM.povBtnAnchor.classList.remove('is-locked');
        if (DOM.povAnchorIcon) DOM.povAnchorIcon.textContent = 'my_location';
        if (DOM.povAnchorText) DOM.povAnchorText.textContent = 'Letak di Arah Ini';
      }
      if (DOM.povValStatus) {
        DOM.povValStatus.textContent = 'Menghalakan';
        DOM.povValStatus.style.color = '#38bdf8';
      }
      if (DOM.povStatusBanner) {
        if (DOM.povBannerIcon) DOM.povBannerIcon.textContent = 'sensors';
        if (DOM.povBannerText) DOM.povBannerText.textContent = 'Halakan peranti ke arah pilihan anda, kemudian tekan "Letak di Arah Ini".';
      }

      // 6. Update stepwise back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Semat Skrin';
      if (DOM.backHudIcon) DOM.backHudIcon.textContent = 'arrow_back';

    } else if (newMode === SYSTEM_MODES.POV_LOCKED) {
      // Anchored spatial mode: Remove .is-centered so projected transforms can position it
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.remove('is-centered');
      }
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.remove('hidden');
      }
      if (DOM.backHudText) DOM.backHudText.textContent = 'Setup POV';

    } else if (newMode === SYSTEM_MODES.SCREEN_PINNED) {
      // Return to Screen-Pinned Mode
      ARState.isPinned = true;
      ARState.pov.active = false;
      if (ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }

      // Hide POV components
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.add('hidden');
        DOM.povAnchor.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.add('hidden');
      }
      if (DOM.povOffscreenPointer) {
        DOM.povOffscreenPointer.classList.add('hidden');
      }
      if (DOM.povSimController) {
        DOM.povSimController.classList.add('hidden');
      }

      // Show floating panel in pinned mode
      if (DOM.floatingAnchor) {
        DOM.floatingAnchor.classList.remove('hidden');
        DOM.floatingAnchor.classList.add('is-visible');
      }
      placeVideoOnScreen();

      // Update back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Imbas Marker';

    } else if (newMode === SYSTEM_MODES.MARKER) {
      // Return to standard marker scanning
      ARState.isPinned = false;
      ARState.pov.active = false;
      if (ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }

      if (DOM.povAnchor) {
        DOM.povAnchor.classList.add('hidden');
        DOM.povAnchor.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.add('hidden');
      }
      if (DOM.povOffscreenPointer) {
        DOM.povOffscreenPointer.classList.add('hidden');
      }
      if (DOM.povSimController) {
        DOM.povSimController.classList.add('hidden');
      }

      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('is-pinned');
      }
      if (DOM.cardDragBar) DOM.cardDragBar.classList.add('hidden');
      if (DOM.pinnedToolbar) DOM.pinnedToolbar.classList.add('hidden');
      if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.remove('hidden');
      if (DOM.btnLockVideo) DOM.btnLockVideo.classList.add('hidden');

      if (!ARState.isTracking) {
        if (DOM.floatingAnchor) {
          DOM.floatingAnchor.classList.remove('is-visible');
        }
        if (DOM.scannerOverlay) {
          DOM.scannerOverlay.classList.remove('hidden');
        }
      }

      // Update back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Dashboard';
    }
  }

  /**
   * Project 3D Marker coordinates to 2D Screen for smooth floating panel placement
   */
  function updateFloatingPanelPosition() {
    if (!ARState.anchor || !ARState.camera) return;

    // In Screen-Pinned Mode, POV Mode, or during manual drag, do NOT let marker tracking overwrite student placement
    if (ARState.isPinned || ARState.isDragging || ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) return;

    if (ARState.isTracking) {
      const markerWorldPos = new THREE.Vector3();
      // Anchor target group center with slight upward hover offset (+0.35 in local Y/Z)
      ARState.hologramGroup.group.getWorldPosition(markerWorldPos);
      markerWorldPos.y += 0.25; // Hover directly above marker

      // Project 3D coordinates to Screen Space [-1 to 1]
      const screenPos = markerWorldPos.clone().project(ARState.camera);

      // Convert to CSS Pixel coordinates
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const px = (screenPos.x * halfW) + halfW;
      const py = (-(screenPos.y * halfH)) + halfH;

      // Keep within comfortable viewport bounds
      ARState.targetScreenX = Math.max(halfW * 0.4, Math.min(window.innerWidth - (halfW * 0.4), px));
      ARState.targetScreenY = Math.max(160, Math.min(window.innerHeight - 180, py));
    }

    // Smooth LERP interpolation
    ARState.currentScreenX += (ARState.targetScreenX - ARState.currentScreenX) * ARState.lerpFactor;
    ARState.currentScreenY += (ARState.targetScreenY - ARState.currentScreenY) * ARState.lerpFactor;

    if (DOM.floatingAnchor) {
      DOM.floatingAnchor.style.left = `${ARState.currentScreenX}px`;
      DOM.floatingAnchor.style.top = `${ARState.currentScreenY}px`;
    }
  }

  /**
   * Resolve marker .mind file URL robustly across any URL structure
   */
  function getMarkerMindUrl() {
    const loc = window.location;
    if (loc.pathname.includes('/kotak_arselnel')) {
      const rootPart = loc.pathname.substring(0, loc.pathname.indexOf('/kotak_arselnel') + '/kotak_arselnel'.length);
      return `${loc.origin}${rootPart}/assets/markers/kotak_arselnel.mind`;
    }
    return new URL('assets/markers/kotak_arselnel.mind', loc.href).href;
  }

  /**
   * Reset previous MindAR tracking session before restart
   */
  function cleanupSession() {
    if (ARState.mindarThree) {
      try {
        ARState.mindarThree.stop();
      } catch (e) {}
      ARState.mindarThree = null;
    }
    if (DOM.container) {
      DOM.container.innerHTML = '';
    }
    ARState.isTracking = false;
  }

  /**
   * Start MindAR with camera permission check, timeout protection & secure context handling
   */
  async function startMindARTracking() {
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocal) {
      const err = new Error('Pelayar telefon memerlukan HTTPS untuk menggunakan kamera WebAR.');
      err.code = 'SECURE_CONTEXT_REQUIRED';
      throw err;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error('Pelayar ini tidak menyokong akses kamera (navigator.mediaDevices tidak tersedia).');
      err.code = 'NO_MEDIA_DEVICES';
      throw err;
    }

    if (DOM.loadingDesc) {
      DOM.loadingDesc.innerHTML = 'Memohon akses kamera... Sila klik <strong>"Allow / Benarkan"</strong> pada tetingkap pelayar jika dipaparkan.';
    }

    let timeoutTimer = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutTimer = setTimeout(() => {
        const tErr = new Error('Kamera mengambil masa terlalu lama untuk membalas atau kebenaran belum dibenarkan.');
        tErr.code = 'CAMERA_TIMEOUT';
        reject(tErr);
      }, 12000);
    });

    try {
      await Promise.race([
        ARState.mindarThree.start(),
        timeoutPromise
      ]);
    } catch (startErr) {
      let normalized = startErr;
      if (!normalized) {
        normalized = new Error('Akses kamera tidak dibenarkan atau disekat.');
        normalized.code = 'NotAllowedError';
      } else if (typeof normalized === 'string') {
        normalized = new Error(normalized);
      }
      throw normalized;
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
    }
  }

  /**
   * Initialize MindAR Image Tracking Session
   */
  async function initMindAR() {
    console.log('[KotakAR] Memulakan MindAR Image Tracking Engine...');
    cleanupSession();

    if (!window.MINDAR || !window.MINDAR.IMAGE || !window.MINDAR.IMAGE.MindARThree) {
      throw new Error('Pustaka MindAR Three.js tidak ditemui. Sila semak sambungan internet.');
    }

    // Ensure THREE is globally mapped from MindAR
    if (!window.THREE && window.MINDAR.IMAGE.THREE) {
      window.THREE = window.MINDAR.IMAGE.THREE;
    }
    const THREE = window.THREE;

    const markerMindUrl = getMarkerMindUrl();
    console.log('[KotakAR] Menggunakan fail marker:', markerMindUrl);

    ARState.mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: DOM.container,
      imageTargetSrc: markerMindUrl,
      maxTrack: 1,
      filterMinCF: 0.001,
      filterBeta: 1000,
      warmupTolerance: 5,
      missTolerance: 5
    });

    const { renderer, scene, camera } = ARState.mindarThree;
    ARState.renderer = renderer;
    ARState.scene = scene;
    ARState.camera = camera;

    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    // Target 0 = VIDEO MARKER
    ARState.anchor = ARState.mindarThree.addAnchor(0);
    ARState.hologramGroup = create3DHologramBase();
    if (ARState.hologramGroup && ARState.hologramGroup.group) {
      ARState.anchor.group.add(ARState.hologramGroup.group);
    }

    // Target Found Event
    ARState.anchor.onTargetFound = () => {
      console.log('[KotakAR] 🎯 Marker Video dikesan!');
      clearTimeout(ARState.lostTimeout);
      ARState.isTracking = true;

      // Only show floating panel if in pure MARKER mode (prevent overlapping in Pinned or POV modes)
      if (ARState.systemMode === SYSTEM_MODES.MARKER) {
        if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
        if (DOM.floatingAnchor) DOM.floatingAnchor.classList.add('is-visible');
      }
    };

    // Target Lost Event with Debounce Hysteresis
    ARState.anchor.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker hilang dari pandangan, mengaktifkan penapis henti sementara...');
      clearTimeout(ARState.lostTimeout);

      ARState.lostTimeout = setTimeout(() => {
        ARState.isTracking = false;
        console.log('[KotakAR] Marker disahkan hilang.');

        // Only hide panel if video is NOT actively playing AND panel is in MARKER mode
        if (!ARState.activeVideo && !ARState.isPinned && ARState.systemMode === SYSTEM_MODES.MARKER) {
          if (DOM.floatingAnchor) DOM.floatingAnchor.classList.remove('is-visible');
          if (DOM.scannerOverlay) DOM.scannerOverlay.classList.remove('hidden');
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // Start camera stream safely
    await startMindARTracking();
    console.log('[KotakAR] MindAR Tracking aktif dan sedia.');

    // Start render loop
    renderer.setAnimationLoop(() => {
      // Pulse 3D beacon
      if (ARState.hologramGroup && ARState.hologramGroup.beaconMesh) {
        const time = performance.now() * 0.003;
        ARState.hologramGroup.beaconMesh.rotation.z = time * 0.5;
        const scale = 1 + Math.sin(time * 2) * 0.08;
        ARState.hologramGroup.beaconMesh.scale.set(scale, scale, scale);
      }

      updateFloatingPanelPosition();
      renderer.render(scene, camera);
    });
  }

  /**
   * Simulation mode allows full testing even without a working camera
   */
  function startSimulationMode() {
    console.log('[KotakAR] 🎮 Mengaktifkan Mod Simulasi (Tanpa Kamera)...');
    
    // Stop any hanging mindar camera stream
    cleanupSession();

    ARState.pov.isSimulated = true;
    ARState.pov.hasSensor = true;

    // Hide overlays
    if (DOM.loadingScreen) DOM.loadingScreen.classList.add('hidden');
    if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');

    // Display floating panel in center of view
    if (DOM.floatingAnchor) {
      DOM.floatingAnchor.classList.add('is-visible');
      ARState.targetScreenX = window.innerWidth / 2;
      ARState.targetScreenY = window.innerHeight / 2;
      ARState.currentScreenX = window.innerWidth / 2;
      ARState.currentScreenY = window.innerHeight / 2;
      DOM.floatingAnchor.style.left = `${ARState.currentScreenX}px`;
      DOM.floatingAnchor.style.top = `${ARState.currentScreenY}px`;
    }

    showToast('🎮 Mod Simulasi Aktif — Terokai video sains tanpa kamera!');
  }

  /**
   * Render clear, actionable error screen with Retry and Simulation Mode options
   */
  function renderErrorScreen(err) {
    if (!DOM.loadingScreen) return;

    const code = (err && (err.code || err.name)) || '';
    const rawMsg = (err && err.message) || (typeof err === 'string' ? err : '');
    
    let title = 'Akses Kamera Diperlukan';
    let icon = 'videocam_off';
    let desc = 'Sila benarkan akses kamera untuk mengimbas Marker Video Kotak ARSELNEL.';

    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

    if (code === 'SECURE_CONTEXT_REQUIRED' || (!window.isSecureContext && !isLocal)) {
      title = 'Sambungan HTTPS Diperlukan';
      icon = 'lock';
      const httpsUrl = window.location.origin.replace('http:', 'https:').replace(':3000', ':3443') + window.location.pathname;
      desc = `Pelayar telefon mudah alih mewajibkan sambungan HTTPS selamat untuk menggunakan kamera WebAR.<br><br>
              Sila buka pautan HTTPS ini pada telefon anda:<br>
              <strong style="color:var(--ars-orange);word-break:break-all;">${httpsUrl}</strong>`;
    } else if (code === 'CAMERA_TIMEOUT') {
      title = 'Menunggu Kebenaran Kamera';
      icon = 'schedule';
      desc = 'Kamera mengambil masa terlalu lama untuk dimulakan. Sila semak popup kebenaran pelayar atau pastikan kamera tidak dibuka oleh aplikasi lain.';
    } else if (code === 'NotAllowedError' || code === 'PermissionDeniedError' || rawMsg.toLowerCase().includes('not allowed') || rawMsg.toLowerCase().includes('permission')) {
      title = 'Kebenaran Kamera Disekat';
      icon = 'block';
      desc = 'Akses kamera tidak dibenarkan oleh pelayar. Sila klik ikon kamera/kunci pada palang URL pelayar anda, pilih <strong>"Allow / Benarkan"</strong>, kemudian klik butang <strong>"Cuba Semula"</strong>.';
    } else if (code === 'NotFoundError' || code === 'DevicesNotFoundError' || rawMsg.toLowerCase().includes('not found')) {
      title = 'Kamera Tidak Ditemui';
      icon = 'no_photography';
      desc = 'Tiada peranti kamera dikesan pada komputer atau telefon ini. Anda boleh menggunakan <strong>Mod Simulasi</strong> untuk terus menguji.';
    } else if (rawMsg) {
      desc = rawMsg;
    }

    DOM.loadingScreen.classList.remove('hidden');
    DOM.loadingScreen.innerHTML = `
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span class="material-symbols-outlined" style="font-size:36px;color:#ef4444;">${icon}</span>
      </div>
      <div class="overlay-title" style="color:#ffffff;">${title}</div>
      <div class="overlay-desc" style="margin-bottom:24px;">${desc}</div>

      <div class="overlay-actions">
        <button type="button" class="ar-hud-btn" id="btn-retry-init" style="background:var(--ars-orange);border-color:var(--ars-orange);color:#fff;font-weight:700;">
          <span class="material-symbols-outlined">refresh</span>
          <span>Cuba Semula</span>
        </button>

        <button type="button" class="ar-hud-btn" id="btn-simulation-mode" style="background:rgba(13,148,136,0.25);border-color:var(--ars-teal);color:#2dd4bf;font-weight:700;">
          <span class="material-symbols-outlined">play_circle</span>
          <span>Mod Simulasi (Uji Tanpa Kamera)</span>
        </button>

        <a href="../halaman_utama/code.html" class="ar-hud-btn" style="background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:#94a3b8;">
          <span class="material-symbols-outlined">home</span>
          <span>Dashboard</span>
        </a>
      </div>
    `;

    // Hook retry button
    const btnRetry = document.getElementById('btn-retry-init');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        DOM.loadingScreen.innerHTML = `
          <div class="spinner-cube"></div>
          <div class="overlay-title">Menyediakan Kotak ARSELNEL</div>
          <p class="overlay-desc" id="loading-desc">Memulakan semula kamera dan enjin pengesanan...</p>
        `;
        cacheDOM();
        init();
      });
    }

    // Hook simulation button
    const btnSim = document.getElementById('btn-simulation-mode');
    if (btnSim) {
      btnSim.addEventListener('click', () => {
        startSimulationMode();
      });
    }
  }

  /**
   * ==============================================================================
   * FASA 3: SCREEN-PINNED MODE, RESPONSIVE RESIZE, DRAG & LOCK ARCHITECTURE
   * ==============================================================================
   */

  /**
   * Clamp panel safely within viewport so header and footer NEVER cut off
   */
  function clampPanelIntoViewport() {
    if (!DOM.floatingAnchor || !DOM.floatingCard) return;

    const rect = DOM.floatingCard.getBoundingClientRect();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    const margin = 10;
    const minX = halfW + margin;
    const maxX = window.innerWidth - halfW - margin;

    let clampedX = ARState.currentScreenX;
    let clampedY = ARState.currentScreenY;

    if (minX > maxX) {
      clampedX = window.innerWidth / 2;
    } else {
      clampedX = Math.max(minX, Math.min(maxX, clampedX));
    }

    // Direct mathematical viewport clamping for top & bottom
    if (clampedY + halfH > window.innerHeight - margin) {
      clampedY = window.innerHeight - margin - halfH;
    }
    if (clampedY - halfH < margin) {
      clampedY = halfH + margin;
    }

    ARState.targetScreenX = clampedX;
    ARState.targetScreenY = clampedY;
    ARState.currentScreenX = clampedX;
    ARState.currentScreenY = clampedY;

    DOM.floatingAnchor.style.left = `${clampedX}px`;
    DOM.floatingAnchor.style.top = `${clampedY}px`;
  }

  /**
   * Activate Screen-Pinned Mode
   */
  function placeVideoOnScreen() {
    if (ARState.isPinned) return;
    ARState.isPinned = true;
    ARState.isLocked = false;

    // Reveal pinned toolbar, drag bar, and lock button
    if (DOM.floatingCard) {
      DOM.floatingCard.classList.add('is-pinned');
    }
    if (DOM.cardDragBar) {
      DOM.cardDragBar.classList.remove('hidden', 'is-locked');
    }
    if (DOM.pinnedToolbar) {
      DOM.pinnedToolbar.classList.remove('hidden');
    }
    if (DOM.btnPlaceVideo) {
      DOM.btnPlaceVideo.classList.add('hidden');
    }
    if (DOM.btnLockVideo) {
      DOM.btnLockVideo.classList.remove('hidden', 'is-locked');
      if (DOM.lockBtnIcon) DOM.lockBtnIcon.textContent = 'lock';
      if (DOM.lockBtnText) DOM.lockBtnText.textContent = 'Kunci Kedudukan';
    }
    if (DOM.dragLockBadge) {
      DOM.dragLockBadge.classList.remove('is-locked');
      if (DOM.dragLockIcon) DOM.dragLockIcon.textContent = 'lock_open';
      if (DOM.dragLockText) DOM.dragLockText.textContent = 'Boleh Dialih';
    }
    if (DOM.trackingText) {
      DOM.trackingText.textContent = 'Tersemat pada Skrin';
    }
    if (DOM.trackingPing) {
      DOM.trackingPing.style.background = '#10b981';
      DOM.trackingPing.style.boxShadow = '0 0 10px #10b981';
    }

    // Auto-clamp so that newly revealed controls never push footer off-screen
    requestAnimationFrame(() => {
      clampPanelIntoViewport();
    });

    showToast('📌 Video disematkan ke skrin! Anda boleh seret panel atau ubah saiz.');
  }

  /**
   * Toggle Lock Position / Alih Semula
   */
  function toggleLockPosition() {
    if (!ARState.isPinned) return;

    ARState.isLocked = !ARState.isLocked;

    if (ARState.isLocked) {
      // Locked state: disable dragging
      if (DOM.btnLockVideo) {
        DOM.btnLockVideo.classList.add('is-locked');
        if (DOM.lockBtnIcon) DOM.lockBtnIcon.textContent = 'lock_open';
        if (DOM.lockBtnText) DOM.lockBtnText.textContent = 'Alih Semula';
      }
      if (DOM.cardDragBar) {
        DOM.cardDragBar.classList.add('is-locked');
      }
      if (DOM.dragLockBadge) {
        DOM.dragLockBadge.classList.add('is-locked');
        if (DOM.dragLockIcon) DOM.dragLockIcon.textContent = 'lock';
        if (DOM.dragLockText) DOM.dragLockText.textContent = 'Dikunci';
      }
      showToast('🔒 Kedudukan panel dikunci!');
    } else {
      // Unlocked state: allow dragging
      if (DOM.btnLockVideo) {
        DOM.btnLockVideo.classList.remove('is-locked');
        if (DOM.lockBtnIcon) DOM.lockBtnIcon.textContent = 'lock';
        if (DOM.lockBtnText) DOM.lockBtnText.textContent = 'Kunci Kedudukan';
      }
      if (DOM.cardDragBar) {
        DOM.cardDragBar.classList.remove('is-locked');
      }
      if (DOM.dragLockBadge) {
        DOM.dragLockBadge.classList.remove('is-locked');
        if (DOM.dragLockIcon) DOM.dragLockIcon.textContent = 'lock_open';
        if (DOM.dragLockText) DOM.dragLockText.textContent = 'Boleh Dialih';
      }
      showToast('🔓 Panel sedia untuk dialihkan!');
    }
  }

  /**
   * Change Panel Size Preset: S, M, L
   */
  function setPanelSize(size) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    ARState.panelSize = size;

    if (DOM.floatingCard) {
      DOM.floatingCard.classList.remove('size-small', 'size-medium', 'size-large');
      DOM.floatingCard.classList.add(`size-${size}`);
      // Clear manual inline width set by freeform corner resize
      DOM.floatingCard.style.width = '';
    }

    // Update active button indicator
    [DOM.btnSizeS, DOM.btnSizeM, DOM.btnSizeL].forEach(btn => {
      if (!btn) return;
      if (btn.getAttribute('data-size') === size) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Auto-clamp immediately so Size L never overflows bottom of screen
    requestAnimationFrame(() => {
      clampPanelIntoViewport();
    });

    const labels = { small: 'Kecil (S)', medium: 'Sederhana (M)', large: 'Besar (L)' };
    showToast(`📐 Saiz panel: ${labels[size]}`);
  }

  /**
   * Close Panel gracefully
   */
  function closePanel() {
    if (DOM.floatingAnchor) {
      DOM.floatingAnchor.classList.remove('is-visible');
    }
    if (DOM.playerFrame) {
      DOM.playerFrame.innerHTML = '';
    }
    ARState.activeVideo = null;
    ARState.isPinned = false;
    if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.remove('hidden');
    if (DOM.btnLockVideo) DOM.btnLockVideo.classList.add('hidden');
    if (DOM.cardDragBar) DOM.cardDragBar.classList.add('hidden');
    if (DOM.pinnedToolbar) DOM.pinnedToolbar.classList.add('hidden');
    if (DOM.floatingCard) DOM.floatingCard.classList.remove('is-pinned');
    if (DOM.scannerOverlay) DOM.scannerOverlay.classList.remove('hidden');
    showToast('Panel ditutup. Imbas marker untuk buka semula.');
  }

  /**
   * Toggle Camera Stream Power (Battery Saver Mode)
   */
  function toggleCameraPower() {
    ARState.cameraActive = !ARState.cameraActive;

    // Toggle camera hardware tracks without affecting video playback or orientation reference
    if (DOM.container) {
      const videoEl = DOM.container.querySelector('video');
      if (videoEl && videoEl.srcObject && typeof videoEl.srcObject.getVideoTracks === 'function') {
        const tracks = videoEl.srcObject.getVideoTracks();
        tracks.forEach(track => {
          track.enabled = ARState.cameraActive;
        });
      }
      if (!ARState.cameraActive) {
        DOM.container.classList.add('camera-off');
      } else {
        DOM.container.classList.remove('camera-off');
      }
    }

    if (!ARState.cameraActive) {
      // Pinned toolbar toggle
      if (DOM.btnToggleCam) DOM.btnToggleCam.classList.add('is-cam-off');
      if (DOM.camToggleIcon) DOM.camToggleIcon.textContent = 'videocam';
      if (DOM.camToggleText) DOM.camToggleText.textContent = 'Buka Kamera';

      // POV toolbar toggle
      if (DOM.povBtnToggleCam) DOM.povBtnToggleCam.classList.add('is-cam-off');
      if (DOM.povCamIcon) DOM.povCamIcon.textContent = 'videocam';
      if (DOM.povCamText) DOM.povCamText.textContent = 'Buka Kamera';

      // Fixed recovery bar toggle
      if (DOM.povRecCam) DOM.povRecCam.classList.add('is-cam-off');
      if (DOM.povRecCamIcon) DOM.povRecCamIcon.textContent = 'videocam';
      if (DOM.povRecCamText) DOM.povRecCamText.textContent = 'Buka Kamera';

      showToast('🔋 Mod Jimat Bateri: Kamera ditutup, audio & video diteruskan.');
    } else {
      // Pinned toolbar toggle
      if (DOM.btnToggleCam) DOM.btnToggleCam.classList.remove('is-cam-off');
      if (DOM.camToggleIcon) DOM.camToggleIcon.textContent = 'videocam_off';
      if (DOM.camToggleText) DOM.camToggleText.textContent = 'Tutup Kamera';

      // POV toolbar toggle
      if (DOM.povBtnToggleCam) DOM.povBtnToggleCam.classList.remove('is-cam-off');
      if (DOM.povCamIcon) DOM.povCamIcon.textContent = 'videocam_off';
      if (DOM.povCamText) DOM.povCamText.textContent = 'Tutup Kamera';

      // Fixed recovery bar toggle
      if (DOM.povRecCam) DOM.povRecCam.classList.remove('is-cam-off');
      if (DOM.povRecCamIcon) DOM.povRecCamIcon.textContent = 'videocam_off';
      if (DOM.povRecCamText) DOM.povRecCamText.textContent = 'Tutup Kamera';

      showToast('📹 Kamera dibuka semula.');
    }

    updateDiagnosticsData();
  }

  /**
   * Setup Drag & Resize Pointer Handlers
   */
  function initDragHandlers() {
    const handleDragStart = (e) => {
      if (!ARState.isPinned || ARState.isLocked) return;

      // Crucial: Only drag from header or drag bar; ignore scrollable body and sticky footer
      if (e.target.closest('#panel-scrollable-body') || e.target.closest('#panel-sticky-footer')) {
        return;
      }
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.corner-resize-handle')) {
        return;
      }

      ARState.isDragging = true;
      ARState.dragStartX = e.clientX;
      ARState.dragStartY = e.clientY;
      ARState.initialPanelX = ARState.currentScreenX;
      ARState.initialPanelY = ARState.currentScreenY;

      if (DOM.floatingCard) {
        DOM.floatingCard.classList.add('is-dragging');
      }

      window.addEventListener('pointermove', handleDragMove, { passive: false });
      window.addEventListener('pointerup', handleDragEnd);
      window.addEventListener('pointercancel', handleDragEnd);
    };

    const handleDragMove = (e) => {
      if (!ARState.isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - ARState.dragStartX;
      const deltaY = e.clientY - ARState.dragStartY;

      const rect = DOM.floatingCard ? DOM.floatingCard.getBoundingClientRect() : { width: 440, height: 360 };
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;

      // Viewport safety boundary clamping
      const margin = 10;
      const minX = halfW + margin;
      const maxX = window.innerWidth - halfW - margin;

      let newX = ARState.initialPanelX + deltaX;
      let newY = ARState.initialPanelY + deltaY;

      if (minX > maxX) {
        newX = window.innerWidth / 2;
      } else {
        newX = Math.max(minX, Math.min(maxX, newX));
      }

      if (newY + halfH > window.innerHeight - margin) {
        newY = window.innerHeight - margin - halfH;
      }
      if (newY - halfH < margin) {
        newY = halfH + margin;
      }

      ARState.targetScreenX = newX;
      ARState.targetScreenY = newY;
      ARState.currentScreenX = newX;
      ARState.currentScreenY = newY;

      if (DOM.floatingAnchor) {
        DOM.floatingAnchor.style.left = `${newX}px`;
        DOM.floatingAnchor.style.top = `${newY}px`;
      }
    };

    const handleDragEnd = () => {
      if (!ARState.isDragging) return;
      ARState.isDragging = false;

      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('is-dragging');
      }

      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
      window.removeEventListener('pointercancel', handleDragEnd);

      clampPanelIntoViewport();
    };

    if (DOM.cardDragBar) {
      DOM.cardDragBar.addEventListener('pointerdown', handleDragStart);
    }
    if (DOM.cardHeader) {
      DOM.cardHeader.addEventListener('pointerdown', (e) => {
        if (ARState.isPinned) handleDragStart(e);
      });
    }

    // Freeform Corner Resize Grip
    if (DOM.cornerResizeHandle) {
      DOM.cornerResizeHandle.addEventListener('pointerdown', (e) => {
        if (!ARState.isPinned) return;
        e.stopPropagation();
        e.preventDefault();

        ARState.isResizing = true;
        ARState.resizeStartX = e.clientX;
        const rect = DOM.floatingCard.getBoundingClientRect();
        ARState.resizeStartWidth = rect.width;

        if (DOM.floatingCard) {
          DOM.floatingCard.classList.add('is-dragging');
        }

        const handleResizeMove = (ev) => {
          if (!ARState.isResizing) return;
          ev.preventDefault();
          const dX = ev.clientX - ARState.resizeStartX;
          const maxAllowed = Math.min(window.innerWidth - 24, 680);
          const newW = Math.max(280, Math.min(maxAllowed, ARState.resizeStartWidth + dX * 2));
          if (DOM.floatingCard) {
            DOM.floatingCard.style.width = `${newW}px`;
          }
          clampPanelIntoViewport();
        };

        const handleResizeEnd = () => {
          ARState.isResizing = false;
          if (DOM.floatingCard) {
            DOM.floatingCard.classList.remove('is-dragging');
          }
          window.removeEventListener('pointermove', handleResizeMove);
          window.removeEventListener('pointerup', handleResizeEnd);
          window.removeEventListener('pointercancel', handleResizeEnd);
          clampPanelIntoViewport();
        };

        window.addEventListener('pointermove', handleResizeMove, { passive: false });
        window.addEventListener('pointerup', handleResizeEnd);
        window.addEventListener('pointercancel', handleResizeEnd);
      });
    }
  }

  /**
   * ==============================================================================
   * FASA 3C: STABILIZED 3DoF GYROSCOPE POV LOCK ENGINE (IPAD SAFARI OPTIMIZED)
   * ==============================================================================
   */

  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;

  let _Q_MINUS_HALF_PI_X = null;
  let _Z_AXIS = null;
  let _WORLD_FORWARD = null;
  let _WORLD_UP = null;
  let _EARTH_TO_THREE = null;

  function initThreeHelpers() {
    if (window.THREE && !_Q_MINUS_HALF_PI_X) {
      _Q_MINUS_HALF_PI_X = new window.THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
      _Z_AXIS = new window.THREE.Vector3(0, 0, 1);
      _WORLD_FORWARD = new window.THREE.Vector3(0, 0, -1);
      _WORLD_UP = new window.THREE.Vector3(0, 1, 0);

      // Coordinate change: Earth (X:East, Y:North, Z:Up) -> Three.js (X:East, Y:Up, Z:-North)
      _EARTH_TO_THREE = new window.THREE.Matrix4().set(
        1,  0,  0,  0,
        0,  0,  1,  0,
        0, -1,  0,  0,
        0,  0,  0,  1
      );

      // Support direct smoothAlpha assignment for simulator and test backwards-compatibility
      let _sA = ARState.pov.smoothAlpha || 0;
      let _isInternalSync = false;

      try {
        Object.defineProperty(ARState.pov, 'smoothAlpha', {
          get() { return _sA; },
          set(val) {
            _sA = Number.isFinite(val) ? val : 0;
            if (_isInternalSync) return;
            _isInternalSync = true;
            try {
              ARState.pov.currentYaw = _sA;
              if (ARState.pov.isSimulated && typeof applySimAngles === 'function') {
                applySimAngles(_sA, ARState.pov.simPitch || 0);
              } else {
                const yawRad = (_sA * Math.PI) / 180;
                const q = new window.THREE.Quaternion().setFromAxisAngle(_WORLD_UP, -yawRad);
                ARState.pov.targetQuaternion = q;
                if (ARState.pov.currentQuaternion) {
                  ARState.pov.currentQuaternion.copy(q);
                } else {
                  ARState.pov.currentQuaternion = q.clone();
                }
              }
            } finally {
              _isInternalSync = false;
            }
          },
          configurable: true
        });
      } catch (e) {}

      // Support direct smoothBeta assignment for pitch testing backwards-compatibility
      let _sB = ARState.pov.smoothBeta || 0;
      try {
        Object.defineProperty(ARState.pov, 'smoothBeta', {
          get() { return _sB; },
          set(val) {
            _sB = Number.isFinite(val) ? val : 0;
            if (_isInternalSync) return;
            _isInternalSync = true;
            try {
              ARState.pov.currentPitch = _sB;
              if (ARState.pov.isSimulated && typeof applySimAngles === 'function') {
                applySimAngles(ARState.pov.simYaw || 0, _sB);
              }
            } finally {
              _isInternalSync = false;
            }
          },
          configurable: true
        });
      } catch (e) {}
    }
  }

  /**
   * Shortest angle delta between current and anchor in degrees [-180, 180]
   * Ensures smooth wraparound across the 0° / 360° boundary
   */
  function shortestAngleDelta(current, anchor) {
    return ((current - anchor + 540) % 360) - 180;
  }

  function initPOVVirtualCamera() {
    if (window.THREE && !ARState.pov.virtualCamera) {
      ARState.pov.virtualCamera = new window.THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
    }
  }

  async function requestSensorPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          ARState.pov.permissionGranted = true;
          return true;
        } else {
          console.warn('[KotakAR-POV] Izin sensor iOS ditolak:', permissionState);
          return false;
        }
      } catch (err) {
        console.warn('[KotakAR-POV] Ralat kebenaran iOS:', err);
        return false;
      }
    }
    return true; // Android / Desktop
  }

  function isMobileOrTabletDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const ua = navigator.userAgent || '';
    const isMobileUa = /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
    const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isTouch && (isMobileUa || isIPadOS);
  }

  function getScreenOrientationAngle() {
    if (window.screen && window.screen.orientation && Number.isFinite(window.screen.orientation.angle)) {
      return window.screen.orientation.angle;
    }
    if (typeof window.orientation !== 'undefined' && Number.isFinite(window.orientation)) {
      return window.orientation;
    }
    return 0;
  }

  /**
   * Mathematically accurate transformation from DeviceOrientation to Camera World Quaternion
   * Utilizes W3C Earth rotation matrix to completely eliminate Euler gimbal lock on iPad Safari
   */
  function computeDeviceCameraQuaternion(alphaDeg, betaDeg, gammaDeg, screenAngleDeg) {
    initThreeHelpers();
    if (!window.THREE) return null;

    const a = (Number.isFinite(alphaDeg) ? alphaDeg : 0) * DEG2RAD;
    const b = (Number.isFinite(betaDeg) ? betaDeg : 0) * DEG2RAD;
    const g = (Number.isFinite(gammaDeg) ? gammaDeg : 0) * DEG2RAD;
    const orient = (Number.isFinite(screenAngleDeg) ? screenAngleDeg : 0) * DEG2RAD;

    const cX = Math.cos(b);
    const cY = Math.cos(g);
    const cZ = Math.cos(a);
    const sX = Math.sin(b);
    const sY = Math.sin(g);
    const sZ = Math.sin(a);

    // W3C Device-to-Earth matrix (R = Rz * Rx * Ry)
    const m = new window.THREE.Matrix4().set(
      cZ * cY - sZ * sX * sY,   -cX * sZ,   cY * sZ * sX + cZ * sY,  0,
      cY * sZ + cZ * sX * sY,    cX * cZ,   sZ * sY - cZ * cY * sX,  0,
      -cX * sY,                  sX,        cX * cY,                 0,
      0,                         0,         0,                       1
    );

    // Screen rotation compensation in device coordinates
    const mCamToDevice = new window.THREE.Matrix4().set(
       Math.cos(orient),  Math.sin(orient), 0, 0,
      -Math.sin(orient),  Math.cos(orient), 0, 0,
       0,                 0,                1, 0,
       0,                 0,                0, 1
    );

    const mCamToEarth = new window.THREE.Matrix4().multiplyMatrices(m, mCamToDevice);
    const mCamToThree = new window.THREE.Matrix4().multiplyMatrices(_EARTH_TO_THREE, mCamToEarth);

    return new window.THREE.Quaternion().setFromRotationMatrix(mCamToThree);
  }

  /**
   * Derive heading, pitch, and roll in real-world degrees from the current camera quaternion
   */
  function updatePOVHeadingFromQuaternion() {
    initThreeHelpers();
    if (!window.THREE || !ARState.pov.currentQuaternion) return;

    // Camera line-of-sight in world space
    const fwdWorld = _WORLD_FORWARD.clone().applyQuaternion(ARState.pov.currentQuaternion);

    // Azimuth / Yaw in [0, 360) degrees
    const yaw = (Math.atan2(fwdWorld.x, -fwdWorld.z) * RAD2DEG + 360) % 360;
    // Pitch inclination in [-90, 90] degrees
    const pitch = Math.asin(Math.max(-1, Math.min(1, fwdWorld.y))) * RAD2DEG;

    // Camera UP vector in world space for roll
    const upWorld = _WORLD_UP.clone().applyQuaternion(ARState.pov.currentQuaternion);
    const roll = Math.atan2(upWorld.x, upWorld.y) * RAD2DEG;

    ARState.pov.currentYaw = Number.isFinite(yaw) ? yaw : 0;
    ARState.pov.currentPitch = Number.isFinite(pitch) ? pitch : 0;
    ARState.pov.currentRoll = Number.isFinite(roll) ? roll : 0;
    ARState.pov.smoothAlpha = ARState.pov.currentYaw;
    ARState.pov.smoothBeta = ARState.pov.currentPitch;
    ARState.pov.smoothGamma = ARState.pov.currentRoll;
  }

  /**
   * Quaternion SLERP filter with micro-jitter deadband
   */
  function updateSmoothedQuaternion() {
    if (!ARState.pov.targetQuaternion) return;

    if (!ARState.pov.currentQuaternion) {
      ARState.pov.currentQuaternion = ARState.pov.targetQuaternion.clone();
      return;
    }

    const dot = Math.abs(ARState.pov.currentQuaternion.dot(ARState.pov.targetQuaternion));
    const angleRad = 2 * Math.acos(Math.min(1, Math.max(0, dot)));
    const angleDeg = angleRad * RAD2DEG;

    // Deadband for tiny sensor noise (< 0.12 deg)
    if (angleDeg > 0.12) {
      // Dynamic interpolation: faster response for fast head turns, smooth for gentle pans
      const t = Math.min(0.75, Math.max(0.20, angleDeg * 0.05));
      ARState.pov.currentQuaternion.slerp(ARState.pov.targetQuaternion, t);
    }
  }

  function handleDeviceOrientation(e) {
    if (e.alpha === null || e.alpha === undefined) {
      return;
    }
    if (ARState.pov.isSimulated) {
      return;
    }

    const rawA = Number.isFinite(e.alpha) ? e.alpha : 0;
    const rawB = Number.isFinite(e.beta) ? e.beta : 0;
    const rawG = Number.isFinite(e.gamma) ? e.gamma : 0;

    ARState.pov.hasSensor = true;
    ARState.pov.isSimulated = false;
    ARState.pov.eventCount = (ARState.pov.eventCount || 0) + 1;
    ARState.pov.rawAlpha = rawA;
    ARState.pov.rawBeta = rawB;
    ARState.pov.rawGamma = rawG;

    const screenAngle = getScreenOrientationAngle();
    ARState.pov.screenAngle = screenAngle;

    initThreeHelpers();
    if (window.THREE) {
      const qTarget = computeDeviceCameraQuaternion(rawA, rawB, rawG, screenAngle);
      if (qTarget) {
        ARState.pov.targetQuaternion = qTarget;
        if (!ARState.pov.currentQuaternion) {
          ARState.pov.currentQuaternion = qTarget.clone();
        }
      }
    }

    // Update sensor badge
    if (DOM.povSensorText) {
      DOM.povSensorText.textContent = 'Giroskop Aktif';
    }
    if (DOM.povSensorPing) {
      DOM.povSensorPing.style.background = '#10b981';
      DOM.povSensorPing.style.boxShadow = '0 0 10px #10b981';
    }

    updateDiagnosticsData();
  }

  function handleScreenOrientationChange() {
    const angle = getScreenOrientationAngle();
    ARState.pov.screenAngle = angle;
    console.log('[KotakAR-POV] 🔄 Orientasi skrin berubah:', angle);

    if (ARState.pov.hasSensor && Number.isFinite(ARState.pov.rawAlpha)) {
      const q = computeDeviceCameraQuaternion(ARState.pov.rawAlpha, ARState.pov.rawBeta, ARState.pov.rawGamma, angle);
      if (q) {
        ARState.pov.targetQuaternion = q;
        if (ARState.pov.currentQuaternion) {
          ARState.pov.currentQuaternion.copy(q);
        }
      }
    }
    updateDiagnosticsData();
  }

  function setupPOVSensorListeners() {
    if (ARState.pov.listenersAttached) return;

    window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    }
    window.addEventListener('orientationchange', handleScreenOrientationChange);
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.addEventListener === 'function') {
      window.screen.orientation.addEventListener('change', handleScreenOrientationChange);
    }

    ARState.pov.listenersAttached = true;

    // Verify after 850ms if physical sensor responded
    setTimeout(() => {
      if (!ARState.pov.hasSensor && ARState.pov.active) {
        if (isMobileOrTabletDevice()) {
          console.warn('[KotakAR-POV] Peranti mudah alih dikesan tetapi sensor tidak aktif.');
          if (DOM.povSensorText) DOM.povSensorText.textContent = 'Sensor Disekat/Tiada';
          if (DOM.povSensorPing) {
            DOM.povSensorPing.style.background = '#ef4444';
            DOM.povSensorPing.style.boxShadow = '0 0 8px #ef4444';
          }
          showToast('⚠️ Sensor giroskop tidak membalas. Sila pastikan sensor dibenarkan di Settings pelayar.', 4000);
        } else {
          console.log('[KotakAR-POV] Komputer riba dikesan. Mengaktifkan mod simulasi giroskop desktop.');
          ARState.pov.isSimulated = true;
          if (DOM.povSensorText) DOM.povSensorText.textContent = 'Simulasi Desktop';
          if (DOM.povSensorPing) {
            DOM.povSensorPing.style.background = '#38bdf8';
            DOM.povSensorPing.style.boxShadow = '0 0 8px #38bdf8';
          }
          if (DOM.povSimController) DOM.povSimController.classList.remove('hidden');
          showToast('ℹ️ Komputer riba dikesan. Mod simulasi giroskop diaktifkan.');
        }
      }
    }, 850);
  }

  function cleanupPOVListeners() {
    if (!ARState.pov.listenersAttached) return;
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    if ('ondeviceorientationabsolute' in window) {
      window.removeEventListener('deviceorientationabsolute', handleDeviceOrientation, true);
    }
    window.removeEventListener('orientationchange', handleScreenOrientationChange);
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.removeEventListener === 'function') {
      window.screen.orientation.removeEventListener('change', handleScreenOrientationChange);
    }
    ARState.pov.listenersAttached = false;
  }

  /**
   * Fasa C: Synchronize Real Interactive Video Player inside POV Panel
   * Preserves ongoing playback without reloading iframe or video element
   */
  function syncPOVVideoPlayer(video) {
    if (!video) return;
    ARState.activeVideo = video;

    const vidKey = video.id || video.url || 'default_vid';

    // Update Video Title & Description
    if (DOM.povPlayerTitle) DOM.povPlayerTitle.textContent = video.title || 'Video Pembelajaran';
    if (DOM.povPlayerDesc) DOM.povPlayerDesc.textContent = video.description || 'Penerangan video pembelajaran sains ARSELNEL.';

    // Synchronize to main player labels as well
    if (DOM.playerTitle) DOM.playerTitle.textContent = video.title || 'Video Pembelajaran';
    if (DOM.playerDesc) DOM.playerDesc.textContent = video.description || 'Penerangan video pembelajaran sains ARSELNEL.';

    // Embed Video into POV Frame ONLY if not already loaded
    if (DOM.povPlayerFrame && (ARState.pov.loadedVideoId !== vidKey || !DOM.povPlayerFrame.hasChildNodes())) {
      DOM.povPlayerFrame.innerHTML = '';
      const url = (video.url || '').trim();

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = window.CMSAdapter && typeof window.CMSAdapter.normalizeVideoUrl === 'function'
          ? window.CMSAdapter.normalizeVideoUrl(url)
          : url.replace('watch?v=', 'embed/').split('&')[0];

        DOM.povPlayerFrame.innerHTML = `
          <iframe 
            src="${embedUrl}?autoplay=1&rel=0&playsinline=1" 
            title="${video.title || 'Video POV'}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        `;
      } else if (url) {
        DOM.povPlayerFrame.innerHTML = `
          <video controls autoplay playsinline poster="${video.thumbnail || ''}">
            <source src="${url}" type="video/mp4">
            <source src="${url}" type="video/webm">
            Pelayar anda tidak menyokong tag video HTML5.
          </video>
        `;
      }

      ARState.pov.loadedVideoId = vidKey;
    }

    // Ensure Active Player View is displayed and Selection View is hidden
    if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
    if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
  }

  /**
   * Fasa C: Render Video Selection Cards inside POV Panel
   */
  function renderPOVVideoCardsList() {
    if (!DOM.povVideoCardsScroll) return;
    DOM.povVideoCardsScroll.innerHTML = '';

    const videos = (ARState.videos && ARState.videos.length > 0) ? ARState.videos : [];
    if (videos.length === 0) {
      DOM.povVideoCardsScroll.innerHTML = `
        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">
          Tiada video sains tersedia dalam CMS.
        </div>
      `;
      return;
    }

    videos.forEach((video) => {
      const card = document.createElement('div');
      card.className = 'video-item-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      card.innerHTML = `
        <div class="video-item-thumb">
          <img src="${video.thumbnail || 'assets/images/placeholder_thumb.jpg'}" alt="${video.title}" loading="lazy" />
          <div class="video-play-badge">
            <span class="material-symbols-outlined">play_arrow</span>
          </div>
        </div>
        <div class="video-item-info">
          <h4>${video.title}</h4>
          <div class="video-meta-tags">
            <span class="meta-tag topic-tag">${video.category || 'Biologi Sel'}</span>
            <span class="meta-tag duration-tag">
              <span class="material-symbols-outlined" style="font-size:13px;">schedule</span>
              ${video.duration || '03:00'}
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        syncPOVVideoPlayer(video);
        if (typeof selectVideo === 'function' && DOM.playerFrame) {
          selectVideo(video);
        }
        showToast(`▶️ Memainkan: ${video.title}`);
      });

      DOM.povVideoCardsScroll.appendChild(card);
    });
  }

  async function startPOVMode() {
    console.log('[KotakAR] 🚀 Memulakan Mod Kunci POV...');

    const permitted = await requestSensorPermission();
    if (!permitted) {
      showToast('⚠️ Kebenaran sensor giroskop ditolak. Menggunakan Semat Skrin.', 4000);
      setSystemMode(SYSTEM_MODES.SCREEN_PINNED);
      return;
    }

    ARState.pov.active = true;
    initThreeHelpers();
    initPOVVirtualCamera();

    // 1. Fasa C: Auto-select active video from CMS if none selected
    if (!ARState.activeVideo) {
      ARState.activeVideo = (ARState.videos && ARState.videos.length > 0) ? ARState.videos[0] : null;
    }
    if (ARState.activeVideo) {
      syncPOVVideoPlayer(ARState.activeVideo);
    }
    renderPOVVideoCardsList();

    // Set mode to POV_SETUP (Panel is firmly CENTERED; spatial drift is NOT active yet)
    setSystemMode(SYSTEM_MODES.POV_SETUP);

    setupPOVSensorListeners();
    startPOVRenderLoop();

    showToast('🧭 Mod Kunci POV Aktif! Halakan peranti dan tekan "Letak di Arah Ini".');
  }

  function exitPOVMode(switchToPinned = false) {
    if (switchToPinned) {
      setSystemMode(SYSTEM_MODES.SCREEN_PINNED);
      showToast('📌 Beralih semula ke Mod Semat pada Skrin.');
    } else {
      setSystemMode(SYSTEM_MODES.MARKER);
      showToast('Mod POV ditutup.');
    }
  }

  function bringPOVPanelToCenter() {
    setSystemMode(SYSTEM_MODES.POV_SETUP);
    showToast('🎯 Panel dikembalikan ke tengah skrin!');
  }

  function anchorPOVAtCurrentHeading() {
    if (ARState.systemMode !== SYSTEM_MODES.POV_SETUP && ARState.systemMode !== SYSTEM_MODES.POV_LOCKED) {
      return;
    }

    if (!ARState.pov.isAnchored) {
      initThreeHelpers();
      if (!ARState.pov.currentQuaternion) {
        ARState.pov.currentQuaternion = new window.THREE.Quaternion();
      }

      ARState.pov.isAnchored = true;
      // 1. Save reference anchor quaternion
      ARState.pov.anchorQuaternion = ARState.pov.currentQuaternion.clone();

      // 2. Compute anchor forward direction vector in world space
      ARState.pov.anchorWorldVector = _WORLD_FORWARD.clone().applyQuaternion(ARState.pov.anchorQuaternion);

      // 3. Save anchor yaw and pitch for HUD display & diagnostics
      ARState.pov.anchorYaw = ARState.pov.currentYaw;
      ARState.pov.anchorPitch = ARState.pov.currentPitch;
      ARState.pov.anchorAlpha = ARState.pov.rawAlpha;
      ARState.pov.anchorBeta = ARState.pov.rawBeta;

      setSystemMode(SYSTEM_MODES.POV_LOCKED);

      if (DOM.povBtnAnchor) {
        DOM.povBtnAnchor.classList.add('is-locked');
        if (DOM.povAnchorIcon) DOM.povAnchorIcon.textContent = 'refresh';
        if (DOM.povAnchorText) DOM.povAnchorText.textContent = 'Alih / Letak Semula';
      }
      if (DOM.povValStatus) {
        DOM.povValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
        DOM.povValStatus.style.color = '#10b981';
      }
      if (DOM.povStatusBanner) {
        if (DOM.povBannerIcon) DOM.povBannerIcon.textContent = 'check_circle';
        if (DOM.povBannerText) DOM.povBannerText.textContent = 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji POV.';
      }

      showToast('🎯 Arah dikunci! Pusingkan peranti ke kanan/kiri/atas/bawah.');
    } else {
      // Re-anchor (brings back to POV_SETUP so user can re-aim)
      bringPOVPanelToCenter();
    }
  }

  function recalibratePOV() {
    if (ARState.systemMode !== SYSTEM_MODES.POV_SETUP && ARState.systemMode !== SYSTEM_MODES.POV_LOCKED) return;
    initThreeHelpers();
    if (!ARState.pov.currentQuaternion) return;

    ARState.pov.anchorQuaternion = ARState.pov.currentQuaternion.clone();
    ARState.pov.anchorWorldVector = _WORLD_FORWARD.clone().applyQuaternion(ARState.pov.anchorQuaternion);
    ARState.pov.anchorYaw = ARState.pov.currentYaw;
    ARState.pov.anchorPitch = ARState.pov.currentPitch;
    ARState.pov.anchorAlpha = ARState.pov.rawAlpha;
    ARState.pov.anchorBeta = ARState.pov.rawBeta;
    ARState.pov.deltaYaw = 0;
    ARState.pov.deltaPitch = 0;

    if (DOM.povValStatus) {
      DOM.povValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
    }
    showToast('🧭 Orientasi rujukan dikalibrasi semula ke arah semasa!');
  }

  function setPOVPanelSize(size) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    ARState.pov.size = size;

    if (DOM.povCard) {
      DOM.povCard.classList.remove('size-small', 'size-medium', 'size-large');
      DOM.povCard.classList.add(`size-${size}`);
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
    showToast(`📐 Saiz POV: ${labels[size]}`);
  }

  function startPOVRenderLoop() {
    if (ARState.pov.rafId) {
      cancelAnimationFrame(ARState.pov.rafId);
    }

    const render = () => {
      if (!ARState.pov.active) return;

      initThreeHelpers();
      updateSmoothedQuaternion();
      updatePOVHeadingFromQuaternion();

      const curYaw = Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0;
      const curPitch = Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0;

      // Update telemetry numbers
      if (DOM.povValYaw) DOM.povValYaw.textContent = `${curYaw.toFixed(1)}°`;
      if (DOM.povValPitch) DOM.povValPitch.textContent = `${curPitch.toFixed(1)}°`;

      // Rotate compass needle if present
      if (DOM.povNeedle) {
        DOM.povNeedle.style.transform = `rotate(${360 - curYaw}deg)`;
      }

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      if (ARState.systemMode !== SYSTEM_MODES.POV_LOCKED) {
        // Free aiming setup mode: Panel is locked in center by .is-centered!
        if (DOM.povOffscreenPointer) {
          DOM.povOffscreenPointer.classList.add('hidden');
        }
        if (DOM.diagPanelVis) DOM.diagPanelVis.textContent = 'TENGAH';
      } else {
        // Anchored 3DoF spatial projection mode (Horizontal Yaw + Vertical Pitch)
        if (ARState.pov.anchorWorldVector && ARState.pov.currentQuaternion) {
          // Transform anchorWorldVector from world frame into current camera frame
          const qCamInv = ARState.pov.currentQuaternion.clone().invert();
          const vCam = ARState.pov.anchorWorldVector.clone().applyQuaternion(qCamInv);

          // In camera coordinate system: +X is right, +Y is up, -Z is forward
          const deltaYaw = Math.atan2(vCam.x, -vCam.z) * RAD2DEG;
          const deltaPitch = Math.atan2(vCam.y, -vCam.z) * RAD2DEG;
          ARState.pov.deltaYaw = deltaYaw;
          ARState.pov.deltaPitch = deltaPitch;

          const isInFront = vCam.z < 0;

          // Camera horizontal FOV ~65 degrees
          const fovHRad = (65 * Math.PI) / 180;
          const tanHalfFovH = Math.tan(fovHRad / 2);
          const aspect = screenW / screenH;
          const tanHalfFovV = tanHalfFovH / aspect;

          let projX, projY, isOffscreen;

          if (!isInFront) {
            // Anchor is behind camera (> 90° away)
            isOffscreen = true;
            const dirX = vCam.x >= 0 ? 1 : -1;
            projX = (screenW / 2) + dirX * (screenW * 1.5);
            projY = screenH / 2;
          } else {
            // Perspective division:
            // Turning RIGHT -> anchor is to camera's LEFT (vCam.x < 0) -> projX < screenW/2 (moves LEFT)
            // Turning LEFT  -> anchor is to camera's RIGHT (vCam.x > 0) -> projX > screenW/2 (moves RIGHT)
            // Tilting DOWN  -> camera looks down -> anchor is ABOVE (vCam.y > 0) -> projY < screenH/2 (moves UP)
            // Tilting UP    -> camera looks up -> anchor is BELOW (vCam.y < 0) -> projY > screenH/2 (moves DOWN)
            const ndcX = vCam.x / (-vCam.z * tanHalfFovH);
            const ndcY = vCam.y / (-vCam.z * tanHalfFovV);

            projX = (screenW / 2) + (ndcX * (screenW / 2));
            projY = (screenH / 2) - (ndcY * (screenH / 2));

            isOffscreen = (projX < -120 || projX > screenW + 120 ||
                           projY < -120 || projY > screenH + 120 ||
                           Math.abs(deltaYaw) > 38 || Math.abs(deltaPitch) > 38);
          }

          const safeX = Number.isFinite(projX) ? projX : screenW / 2;
          const safeY = Number.isFinite(projY) ? projY : screenH / 2;

          if (DOM.povAnchor) {
            DOM.povAnchor.style.left = `${safeX}px`;
            DOM.povAnchor.style.top = `${safeY}px`;
            DOM.povAnchor.style.transform = 'translate(-50%, -50%)';
          }

          ARState.pov.isOffscreen = isOffscreen;

          if (DOM.diagPanelVis) {
            DOM.diagPanelVis.textContent = isOffscreen ? 'LUAR FOV' : 'DALAM FOV';
          }

          if (isOffscreen) {
            if (DOM.povOffscreenPointer) {
              DOM.povOffscreenPointer.classList.remove('hidden');

              // Determine whether vertical tilt or horizontal turn is dominant
              if (Math.abs(deltaPitch) > Math.abs(deltaYaw) && Math.abs(deltaPitch) > 25) {
                // Vertical Offscreen Pointer (Panel di Atas atau Panel di Bawah)
                DOM.povOffscreenPointer.classList.remove('at-left', 'at-right');
                if (deltaPitch > 0) {
                  DOM.povOffscreenPointer.classList.remove('at-bottom');
                  DOM.povOffscreenPointer.classList.add('at-top');
                  if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_upward';
                  if (DOM.povPointerBearing) {
                    DOM.povPointerBearing.textContent = `Panel di Atas (${Math.round(Math.abs(deltaPitch))}°)`;
                  }
                } else {
                  DOM.povOffscreenPointer.classList.remove('at-top');
                  DOM.povOffscreenPointer.classList.add('at-bottom');
                  if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_downward';
                  if (DOM.povPointerBearing) {
                    DOM.povPointerBearing.textContent = `Panel di Bawah (${Math.round(Math.abs(deltaPitch))}°)`;
                  }
                }
              } else {
                // Horizontal Offscreen Pointer (Panel di Kiri atau Panel di Kanan)
                DOM.povOffscreenPointer.classList.remove('at-top', 'at-bottom');
                // deltaYaw < 0 means anchor is to the LEFT (user turned right)
                if (deltaYaw < 0 || (!isInFront && vCam.x < 0)) {
                  DOM.povOffscreenPointer.classList.remove('at-right');
                  DOM.povOffscreenPointer.classList.add('at-left');
                  if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_back';
                  if (DOM.povPointerBearing) {
                    DOM.povPointerBearing.textContent = `Panel di Kiri (${Math.round(Math.abs(deltaYaw))}°)`;
                  }
                } else {
                  DOM.povOffscreenPointer.classList.remove('at-left');
                  DOM.povOffscreenPointer.classList.add('at-right');
                  if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_forward';
                  if (DOM.povPointerBearing) {
                    DOM.povPointerBearing.textContent = `Panel di Kanan (${Math.round(Math.abs(deltaYaw))}°)`;
                  }
                }
              }
            }
          } else {
            if (DOM.povOffscreenPointer) {
              DOM.povOffscreenPointer.classList.add('hidden');
            }
          }
        }
      }

      // Update diagnostics drawer if open
      if (DOM.diagnosticsDrawer && !DOM.diagnosticsDrawer.classList.contains('hidden')) {
        updateDiagnosticsData();
      }

      ARState.pov.rafId = requestAnimationFrame(render);
    };

    ARState.pov.rafId = requestAnimationFrame(render);
  }

  /**
   * Helper function to apply simulated 2-axis angles (Yaw & Pitch)
   */
  function applySimAngles(yawDeg, pitchDeg) {
    initThreeHelpers();
    const yaw = parseFloat(yawDeg) || 0;
    const pitch = parseFloat(pitchDeg) || 0;

    ARState.pov.simYaw = yaw;
    ARState.pov.simPitch = pitch;

    if (DOM.povSimAngleBadge) {
      DOM.povSimAngleBadge.textContent = `${Math.round(yaw)}° / ${Math.round(pitch)}°`;
    }
    if (DOM.povSimSlider) {
      DOM.povSimSlider.value = yaw;
    }
    if (DOM.povSimPitchSlider) {
      DOM.povSimPitchSlider.value = pitch;
    }

    const yawRad = yaw * DEG2RAD;
    const pitchRad = pitch * DEG2RAD;

    // Simulated 2-axis rotation: Yaw about world UP, Pitch about camera right (X)
    const qYaw = new window.THREE.Quaternion().setFromAxisAngle(_WORLD_UP, -yawRad);
    const qPitch = new window.THREE.Quaternion().setFromAxisAngle(new window.THREE.Vector3(1, 0, 0), pitchRad);
    const q = qYaw.clone().multiply(qPitch);

    ARState.pov.targetQuaternion = q;
    if (!ARState.pov.currentQuaternion) {
      ARState.pov.currentQuaternion = q.clone();
    } else {
      ARState.pov.currentQuaternion.copy(q);
    }
    ARState.pov.hasSensor = true;
    ARState.pov.isSimulated = true;
    updatePOVHeadingFromQuaternion();
    updateDiagnosticsData();
  }

  function setupPOVDesktopSimulator() {
    if (!DOM.povSimSlider && !DOM.povSimPitchSlider) return;

    // Yaw Slider listener
    if (DOM.povSimSlider) {
      DOM.povSimSlider.addEventListener('input', (e) => {
        applySimAngles(e.target.value, ARState.pov.simPitch || 0);
      });
    }

    // Pitch Slider listener
    if (DOM.povSimPitchSlider) {
      DOM.povSimPitchSlider.addEventListener('input', (e) => {
        applySimAngles(ARState.pov.simYaw || 0, e.target.value);
      });
    }

    // Yaw buttons
    if (DOM.povSimLeft) {
      DOM.povSimLeft.addEventListener('click', () => {
        const cur = (parseFloat(DOM.povSimSlider.value) || 0) - 45;
        applySimAngles(Math.max(-180, cur), ARState.pov.simPitch || 0);
      });
    }

    if (DOM.povSimCenter) {
      DOM.povSimCenter.addEventListener('click', () => {
        applySimAngles(0, ARState.pov.simPitch || 0);
      });
    }

    if (DOM.povSimRight) {
      DOM.povSimRight.addEventListener('click', () => {
        const cur = (parseFloat(DOM.povSimSlider.value) || 0) + 45;
        applySimAngles(Math.min(180, cur), ARState.pov.simPitch || 0);
      });
    }

    // Pitch buttons
    if (DOM.povSimDown) {
      DOM.povSimDown.addEventListener('click', () => {
        const cur = (parseFloat(ARState.pov.simPitch) || 0) - 30;
        applySimAngles(ARState.pov.simYaw || 0, Math.max(-80, cur));
      });
    }

    if (DOM.povSimPitchCenter) {
      DOM.povSimPitchCenter.addEventListener('click', () => {
        applySimAngles(ARState.pov.simYaw || 0, 0);
      });
    }

    if (DOM.povSimUp) {
      DOM.povSimUp.addEventListener('click', () => {
        const cur = (parseFloat(ARState.pov.simPitch) || 0) + 30;
        applySimAngles(ARState.pov.simYaw || 0, Math.min(80, cur));
      });
    }

    if (DOM.btnToggleSimCollapse) {
      DOM.btnToggleSimCollapse.addEventListener('click', () => {
        if (!DOM.povSimController) return;
        DOM.povSimController.classList.toggle('is-collapsed');
        const isCollapsed = DOM.povSimController.classList.contains('is-collapsed');
        if (DOM.simCollapseIcon) {
          DOM.simCollapseIcon.textContent = isCollapsed ? 'keyboard_arrow_left' : 'keyboard_arrow_down';
        }
      });
    }
  }

  /**
   * Sensor Diagnostics Drawer Controller
   */
  function toggleDiagnosticsDrawer() {
    if (!DOM.diagnosticsDrawer) return;
    DOM.diagnosticsDrawer.classList.toggle('hidden');
    updateDiagnosticsData();
  }

  function updateDiagnosticsData(force = false) {
    if (!force && (!DOM.diagnosticsDrawer || DOM.diagnosticsDrawer.classList.contains('hidden'))) return;

    const ua = navigator.userAgent || '';
    let dev = 'Desktop (Windows/Mac/Linux)';
    if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) dev = 'iPad (iPadOS)';
    else if (/iPhone/i.test(ua)) dev = 'iPhone (iOS)';
    else if (/Android/i.test(ua)) dev = 'Android Device';

    let browser = 'Chrome/Chromium';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
    else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';

    const screenAngle = ARState.pov.screenAngle || 0;
    const orientType = (screenAngle === 90 || screenAngle === -90 || screenAngle === 270) ? 'Landscape' : 'Portrait';

    if (DOM.diagDevice) DOM.diagDevice.textContent = dev;
    if (DOM.diagBrowser) DOM.diagBrowser.textContent = browser;
    if (DOM.diagScreenOrient) DOM.diagScreenOrient.textContent = `${screenAngle}° (${orientType})`;
    if (DOM.diagPermission) DOM.diagPermission.textContent = ARState.pov.permissionGranted ? 'GRANTED' : (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission ? 'PERLU IZIN' : 'DEFAULT');
    if (DOM.diagSensorActive) DOM.diagSensorActive.textContent = ARState.pov.hasSensor ? (ARState.pov.isSimulated ? 'SIMULASI' : 'AKTIF') : 'TIDAK AKTIF';
    if (DOM.diagEventCount) DOM.diagEventCount.textContent = `${ARState.pov.eventCount || 0} acara`;

    // Raw readings
    const rA = Number.isFinite(ARState.pov.rawAlpha) ? ARState.pov.rawAlpha.toFixed(1) : '0.0';
    const rB = Number.isFinite(ARState.pov.rawBeta) ? ARState.pov.rawBeta.toFixed(1) : '0.0';
    const rG = Number.isFinite(ARState.pov.rawGamma) ? ARState.pov.rawGamma.toFixed(1) : '0.0';
    if (DOM.diagRawAngles) DOM.diagRawAngles.textContent = `${rA}°, ${rB}°, ${rG}°`;

    // Normalized filtered readings
    const y = Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw.toFixed(1) : '0.0';
    const p = Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch.toFixed(1) : '0.0';
    const r = Number.isFinite(ARState.pov.currentRoll) ? ARState.pov.currentRoll.toFixed(1) : '0.0';
    if (DOM.diagYaw) DOM.diagYaw.textContent = `${y}°`;
    if (DOM.diagPitch) DOM.diagPitch.textContent = `${p}°`;
    if (DOM.diagRoll) DOM.diagRoll.textContent = `${r}°`;

    // Anchor reference
    if (DOM.diagAnchor) {
      if (ARState.pov.isAnchored) {
        const aY = Number.isFinite(ARState.pov.anchorYaw) ? ARState.pov.anchorYaw.toFixed(1) : '0.0';
        const aP = Number.isFinite(ARState.pov.anchorPitch) ? ARState.pov.anchorPitch.toFixed(1) : '0.0';
        DOM.diagAnchor.textContent = `${aY}°, ${aP}°`;
      } else {
        DOM.diagAnchor.textContent = 'Belum ditetapkan';
      }
    }

    // Delta angles
    const dY = Number.isFinite(ARState.pov.deltaYaw) ? ARState.pov.deltaYaw.toFixed(1) : '0.0';
    const dP = Number.isFinite(ARState.pov.deltaPitch) ? ARState.pov.deltaPitch.toFixed(1) : '0.0';
    if (DOM.diagDeltaYaw) DOM.diagDeltaYaw.textContent = `${dY}°`;
    if (DOM.diagDeltaPitch) DOM.diagDeltaPitch.textContent = `${dP}°`;

    if (DOM.diagMode) DOM.diagMode.textContent = ARState.systemMode;
    if (DOM.diagCam) DOM.diagCam.textContent = ARState.cameraActive ? 'AKTIF' : 'DITUTUP';
    if (DOM.diagPanelVis) {
      if (ARState.systemMode === SYSTEM_MODES.POV_SETUP) {
        DOM.diagPanelVis.textContent = 'TENGAH';
      } else if (ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
        DOM.diagPanelVis.textContent = ARState.pov.isOffscreen ? 'LUAR FOV' : 'DALAM FOV';
      } else {
        DOM.diagPanelVis.textContent = 'SEMAT/MARKER';
      }
    }
  }

  /**
   * Stepwise Navigation & Exit Confirmation Dialog
   */
  function handleStepwiseBack() {
    const mode = ARState.systemMode;
    if (mode === SYSTEM_MODES.POV_LOCKED) {
      // Step back to POV_SETUP (re-centering panel)
      bringPOVPanelToCenter();
    } else if (mode === SYSTEM_MODES.POV_SETUP) {
      // Step back to SCREEN_PINNED
      exitPOVMode(true);
    } else if (mode === SYSTEM_MODES.SCREEN_PINNED) {
      // Step back to MARKER scanner
      setSystemMode(SYSTEM_MODES.MARKER);
      showToast('Mod Semat Skrin ditutup. Mengimbas marker semula.');
    } else {
      // In MARKER scanner, show exit confirmation dialog
      showExitConfirmDialog();
    }
  }

  function showExitConfirmDialog() {
    if (DOM.exitModalBackdrop) {
      DOM.exitModalBackdrop.classList.remove('hidden');
    }
  }

  function hideExitConfirmDialog() {
    if (DOM.exitModalBackdrop) {
      DOM.exitModalBackdrop.classList.add('hidden');
    }
  }

  /**
   * Event Listeners Setup
   */
  function initListeners() {
    // Stepwise Back Navigation
    if (DOM.btnBackDashboard) {
      DOM.btnBackDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        handleStepwiseBack();
      });
    }

    // Diagnostics Toggle
    if (DOM.btnToggleDiagnostics) {
      DOM.btnToggleDiagnostics.addEventListener('click', toggleDiagnosticsDrawer);
    }
    if (DOM.btnCloseDiagnostics) {
      DOM.btnCloseDiagnostics.addEventListener('click', toggleDiagnosticsDrawer);
    }

    // Exit Confirmation Dialog Actions
    if (DOM.btnExitCancel) {
      DOM.btnExitCancel.addEventListener('click', hideExitConfirmDialog);
    }
    if (DOM.btnExitConfirm) {
      DOM.btnExitConfirm.addEventListener('click', () => {
        cleanupSession();
        window.location.href = '../halaman_utama/code.html';
      });
    }

    // Fixed Floating Recovery Bar Controls
    if (DOM.povRecCenter) {
      DOM.povRecCenter.addEventListener('click', bringPOVPanelToCenter);
    }
    if (DOM.povRecRecalibrate) {
      DOM.povRecRecalibrate.addEventListener('click', recalibratePOV);
    }
    if (DOM.povRecCam) {
      DOM.povRecCam.addEventListener('click', toggleCameraPower);
    }
    if (DOM.povRecBackPinned) {
      DOM.povRecBackPinned.addEventListener('click', () => exitPOVMode(true));
    }
    if (DOM.povRecClose) {
      DOM.povRecClose.addEventListener('click', () => exitPOVMode(false));
    }

    // Change Video button
    if (DOM.btnChangeVideo) {
      DOM.btnChangeVideo.addEventListener('click', () => {
        returnToSelectionList();
      });
    }

    // Close Panel button
    if (DOM.btnClosePanel) {
      DOM.btnClosePanel.addEventListener('click', () => {
        closePanel();
      });
    }

    // Place Video button (Fasa 3 Screen-Pinned Mode)
    if (DOM.btnPlaceVideo) {
      DOM.btnPlaceVideo.addEventListener('click', () => {
        placeVideoOnScreen();
      });
    }

    // Fasa 3C: Gyroscope POV Lock Buttons
    if (DOM.btnStartPOV) {
      DOM.btnStartPOV.addEventListener('click', () => {
        startPOVMode();
      });
    }
    if (DOM.btnSwitchToPOV) {
      DOM.btnSwitchToPOV.addEventListener('click', () => {
        startPOVMode();
      });
    }

    // POV Card Controls
    if (DOM.povBtnAnchor) {
      DOM.povBtnAnchor.addEventListener('click', () => {
        anchorPOVAtCurrentHeading();
      });
    }
    if (DOM.povBtnChangeVideo) {
      DOM.povBtnChangeVideo.addEventListener('click', () => {
        if (!DOM.povVideoSelectionView) return;
        const isHidden = DOM.povVideoSelectionView.classList.contains('hidden');
        if (isHidden) {
          DOM.povVideoSelectionView.classList.remove('hidden');
          if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
          showToast('Pilih video baharu daripada senarai.');
        } else {
          DOM.povVideoSelectionView.classList.add('hidden');
          if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
        }
      });
    }
    if (DOM.povBtnRecalibrate) {
      DOM.povBtnRecalibrate.addEventListener('click', () => {
        recalibratePOV();
      });
    }
    if (DOM.povBtnBackPinned) {
      DOM.povBtnBackPinned.addEventListener('click', () => {
        exitPOVMode(true);
      });
    }
    if (DOM.povBtnClose) {
      DOM.povBtnClose.addEventListener('click', () => {
        exitPOVMode(false);
      });
    }
    if (DOM.povBtnToggleCam) {
      DOM.povBtnToggleCam.addEventListener('click', () => {
        toggleCameraPower();
      });
    }

    // POV Size Preset buttons
    if (DOM.povSizeS) {
      DOM.povSizeS.addEventListener('click', () => setPOVPanelSize('small'));
    }
    if (DOM.povSizeM) {
      DOM.povSizeM.addEventListener('click', () => setPOVPanelSize('medium'));
    }
    if (DOM.povSizeL) {
      DOM.povSizeL.addEventListener('click', () => setPOVPanelSize('large'));
    }

    // Setup desktop gyro angle simulator
    setupPOVDesktopSimulator();

    // Lock Position button (Fasa 3 Lock & Re-position)
    if (DOM.btnLockVideo) {
      DOM.btnLockVideo.addEventListener('click', () => {
        toggleLockPosition();
      });
    }

    // Battery-saver Camera Toggle button (Fasa 3)
    if (DOM.btnToggleCam) {
      DOM.btnToggleCam.addEventListener('click', () => {
        toggleCameraPower();
      });
    }

    // Size Preset buttons S, M, L (Fasa 3)
    if (DOM.btnSizeS) {
      DOM.btnSizeS.addEventListener('click', () => setPanelSize('small'));
    }
    if (DOM.btnSizeM) {
      DOM.btnSizeM.addEventListener('click', () => setPanelSize('medium'));
    }
    if (DOM.btnSizeL) {
      DOM.btnSizeL.addEventListener('click', () => setPanelSize('large'));
    }

    // Initialize unified pointer drag & resize handlers
    initDragHandlers();

    // Auto-clamp when screen rotates or resizes
    window.addEventListener('resize', () => {
      clampPanelIntoViewport();
      updateDiagnosticsData();
    });

    // Safe exit on window unload
    window.addEventListener('beforeunload', () => {
      cleanupSession();
    });
  }

  /**
   * Main Module Bootstrap
   */
  async function init() {
    cacheDOM();
    initListeners();

    try {
      await loadVideosFromCMS();
      renderVideoList();
      await initMindAR();

      // Hide loading screen smoothly
      if (DOM.loadingScreen) {
        DOM.loadingScreen.classList.add('hidden');
      }
    } catch (err) {
      console.error('[KotakAR] Ralat inisialisasi:', err);
      renderErrorScreen(err);
    }
  }

  // Export to global scope
  global.KotakARSELNEL = {
    init,
    state: ARState,
    modes: SYSTEM_MODES,
    setSystemMode,
    selectVideo,
    returnToSelectionList,
    showToast,
    startSimulationMode,
    placeVideoOnScreen,
    toggleLockPosition,
    setPanelSize,
    toggleCameraPower,
    // Fasa 3C Exports
    startPOVMode,
    exitPOVMode,
    bringPOVPanelToCenter,
    anchorPOVAtCurrentHeading,
    recalibratePOV,
    setPOVPanelSize,
    syncPOVVideoPlayer,
    renderPOVVideoCardsList,
    applySimAngles,
    handleStepwiseBack,
    toggleDiagnosticsDrawer,
    showExitConfirmDialog,
    hideExitConfirmDialog,
    shortestAngleDelta,
    computeDeviceCameraQuaternion,
    handleScreenOrientationChange,
    updateDiagnosticsData
  };

  // Auto boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);


