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
    isPanelVisible: false
  };

  // DOM Elements Cache
  const DOM = {};

  function cacheDOM() {
    DOM.container = document.getElementById('ar-container');
    DOM.scannerOverlay = document.getElementById('scanner-overlay');
    DOM.floatingAnchor = document.getElementById('floating-ar-anchor');
    DOM.videoSelectionView = document.getElementById('video-selection-view');
    DOM.activePlayerView = document.getElementById('active-player-view');
    DOM.videoCardsScroll = document.getElementById('video-cards-scroll');
    DOM.playerFrame = document.getElementById('ar-player-frame');
    DOM.playerTitle = document.getElementById('player-video-title');
    DOM.playerDesc = document.getElementById('player-video-desc');
    DOM.loadingScreen = document.getElementById('loading-screen');
    DOM.btnChangeVideo = document.getElementById('btn-change-video');
    DOM.btnPlaceVideo = document.getElementById('btn-place-video');
    DOM.toast = document.getElementById('ar-toast');
    DOM.toastText = document.getElementById('toast-text');
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

  /**
   * Project 3D Marker coordinates to 2D Screen for smooth floating panel placement
   */
  function updateFloatingPanelPosition() {
    if (!ARState.anchor || !ARState.camera) return;

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
   * Initialize MindAR Image Tracking Session
   */
  async function initMindAR() {
    console.log('[KotakAR] Memulakan MindAR Image Tracking Engine...');

    if (!window.MINDAR || !window.MINDAR.IMAGE || !window.MINDAR.IMAGE.MindARThree) {
      throw new Error('Pustaka MindAR Three.js tidak ditemui. Sila semak sambungan internet.');
    }

    ARState.mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: DOM.container,
      imageTargetSrc: 'assets/markers/kotak_arselnel.mind',
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
    ARState.anchor.group.add(ARState.hologramGroup.group);

    // Target Found Event
    ARState.anchor.onTargetFound = () => {
      console.log('[KotakAR] 🎯 Marker Video dikesan!');
      clearTimeout(ARState.lostTimeout);
      ARState.isTracking = true;

      if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
      if (DOM.floatingAnchor) DOM.floatingAnchor.classList.add('is-visible');
    };

    // Target Lost Event with Debounce Hysteresis
    ARState.anchor.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker hilang dari pandangan, mengaktifkan penapis henti sementara...');
      clearTimeout(ARState.lostTimeout);

      // Debounce delay to prevent flickering during micro camera movements
      ARState.lostTimeout = setTimeout(() => {
        ARState.isTracking = false;
        console.log('[KotakAR] Marker disahkan hilang.');

        // Only hide panel if student has NOT chosen to place or lock it
        if (!ARState.activeVideo) {
          if (DOM.floatingAnchor) DOM.floatingAnchor.classList.remove('is-visible');
          if (DOM.scannerOverlay) DOM.scannerOverlay.classList.remove('hidden');
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // Start MindAR Camera stream
    await ARState.mindarThree.start();
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
   * Event Listeners Setup
   */
  function initListeners() {
    // Change Video button
    if (DOM.btnChangeVideo) {
      DOM.btnChangeVideo.addEventListener('click', () => {
        returnToSelectionList();
      });
    }

    // Place Video button (Phase 2 -> Phase 3 transition preview)
    if (DOM.btnPlaceVideo) {
      DOM.btnPlaceVideo.addEventListener('click', () => {
        showToast('📍 Mod Penempatan (Place & Lock) bersedia untuk FASA 3!');
      });
    }

    // Safe exit on window unload
    window.addEventListener('beforeunload', () => {
      if (ARState.mindarThree) {
        try { ARState.mindarThree.stop(); } catch (e) {}
      }
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
      if (DOM.loadingScreen) {
        DOM.loadingScreen.innerHTML = `
          <div class="overlay-title" style="color:#ef4444">Akses Kamera Diperlukan</div>
          <p class="overlay-desc">${err.message || 'Sila benarkan akses kamera untuk menggunakan mod imbasan Kotak ARSELNEL.'}</p>
          <a href="../halaman_utama/code.html" class="ar-hud-btn" style="margin-top:20px">Kembali ke Dashboard</a>
        `;
      }
    }
  }

  // Export to global scope
  global.KotakARSELNEL = {
    init,
    state: ARState,
    selectVideo,
    returnToSelectionList,
    showToast
  };

  // Auto boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
