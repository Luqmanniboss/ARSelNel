(function () {
  'use strict';

  // Elements
  const entryBtn = document.getElementById('ar-entry');
  const statusEl = document.getElementById('ar-status');
  const statusText = document.getElementById('ar-status-text');
  const availabilityText = document.getElementById('ar-availability');

  // Dialog elements
  const dialog = document.getElementById('ar-dialog');
  const dialogTitle = document.getElementById('ar-dialog-title');
  const dialogMsg = document.getElementById('ar-dialog-message');
  const dialogIcon = document.getElementById('ar-dialog-icon');
  const guideNote = document.getElementById('ar-guide-note');
  const explore3dBtn = document.getElementById('ar-explore-3d');
  const guideBtn = document.getElementById('ar-guide');
  const confirmBtn = document.getElementById('ar-confirm');
  const retryBtn = document.getElementById('ar-retry');

  // AR Container & Viewport elements
  const arContainer = document.getElementById('cq-ar-container');
  const arVideo = document.getElementById('cq-ar-video');
  const arCanvasHost = document.getElementById('cq-ar-canvas-host');
  const arOverlay = document.getElementById('ar-overlay');
  const arModeBadge = document.getElementById('ar-mode-badge');
  const arInstruction = document.getElementById('ar-instruction');
  const arExitBtn = document.getElementById('ar-exit');
  const arFlipBtn = document.getElementById('ar-flip-cam');

  // AR Tools
  const btnSmaller = document.getElementById('ar-smaller');
  const btnLarger = document.getElementById('ar-larger');
  const btnRotate = document.getElementById('ar-rotate');
  const btnReset = document.getElementById('ar-reset');
  const btnPlace = document.getElementById('ar-place');
  const btnReposition = document.getElementById('ar-reposition');

  const api = () => window.CellQuest3D;

  // State
  let videoStream = null;
  let isCameraArActive = false;
  let isWebXrActive = false;
  let currentFacingMode = 'environment';
  let xrSupported = false;
  let cameraSupported = false;
  let availableVideoInputs = [];

  const BM_MESSAGES = {
    permissionDenied: 'Kebenaran kamera diperlukan untuk menggunakan fungsi AR. Sila benarkan akses kamera melalui tetapan pelayar anda.',
    cameraUnavailable: 'Kamera tidak dapat dikesan pada peranti ini.',
    unsupportedBrowser: 'Peranti atau pelayar ini tidak menyokong mod AR yang diperlukan.',
    insecureContext: 'Ciri Realiti Terimbuh (AR) dan akses kamera memerlukan sambungan selamat (HTTPS) atau localhost. Model 3D kekal boleh diterokai dalam mod paparan biasa.',
    guideTitle: 'Cara Menggunakan AR',
    guideSteps: '1. Tekan "Mulakan Pengembaraan AR".\n2. Benarkan akses kamera apabila diminta.\n3. Ikut arahan pada skrin untuk memaparkan model sel.\n4. Terokai organel menggunakan kawalan yang tersedia.\n5. Tekan "Keluar AR" apabila selesai.'
  };

  function setBadgeStatus(state, mainText, subText) {
    if (!statusEl) return;
    statusEl.classList.remove('is-checking', 'is-available', 'is-unsupported');
    statusEl.classList.add('is-' + state);
    if (statusText) statusText.textContent = mainText;
    if (availabilityText) availabilityText.textContent = subText;
  }

  // Initial compatibility audit
  async function auditCapabilities() {
    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      setBadgeStatus('unsupported', 'Sambungan Tidak Selamat', 'AR memerlukan HTTPS atau localhost.');
      return;
    }

    // Check WebXR immersive-ar
    if (navigator.xr && typeof navigator.xr.isSessionSupported === 'function') {
      try {
        xrSupported = await navigator.xr.isSessionSupported('immersive-ar');
      } catch (_) {
        xrSupported = false;
      }
    }

    // Check mediaDevices camera
    cameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (cameraSupported) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableVideoInputs = devices.filter(d => d.kind === 'videoinput');
      } catch (_) {}
    }

    if (xrSupported) {
      setBadgeStatus('available', 'WebXR AR Disokong', 'Sedia untuk penerokaan AR spasial atau kamera.');
    } else if (cameraSupported) {
      setBadgeStatus('available', 'Kamera AR Disokong', 'Sedia untuk pratonton AR tindanan kamera langsung.');
    } else {
      setBadgeStatus('unsupported', 'AR Tidak Disokong', 'Peranti tidak mempunyai akses kamera; mod 3D sedia digunakan.');
    }
  }

  function showDialog(title, message, opts = {}) {
    if (!dialog) return;
    dialogTitle.textContent = title;
    dialogMsg.textContent = message;
    dialogIcon.textContent = opts.icon || '📷';
    if (opts.guide) {
      guideNote.textContent = opts.guide;
      guideNote.hidden = false;
    } else {
      guideNote.hidden = true;
    }

    explore3dBtn.hidden = false;
    guideBtn.hidden = !!opts.hideGuide;
    confirmBtn.hidden = !opts.showConfirm;
    retryBtn.hidden = !opts.showRetry;

    dialog.hidden = false;
    if (opts.showConfirm) confirmBtn.focus();
    else explore3dBtn.focus();
  }

  function closeDialog() {
    if (!dialog) return;
    dialog.hidden = true;
    guideNote.hidden = true;
    if (entryBtn) entryBtn.focus();
  }

  // Camera cleanup
  function stopCameraTracks() {
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      videoStream = null;
    }
    if (arVideo) {
      arVideo.srcObject = null;
    }
  }

  // Exit all AR modes safely
  async function exitAR() {
    // End WebXR if active
    if (isWebXrActive) {
      isWebXrActive = false;
      try { await api().exitAR(); } catch (_) {}
    }

    // End Camera AR if active
    if (isCameraArActive) {
      isCameraArActive = false;
      stopCameraTracks();

      // Return Three.js canvas to main 3D stage
      const canvas = api().domElement;
      const stage = api().stage;
      if (canvas && stage && canvas.parentElement !== stage) {
        stage.prepend(canvas);
      }
      if (api().resize) api().resize();
    }

    if (arContainer) arContainer.hidden = true;
    if (arOverlay) arOverlay.hidden = true;

    setBadgeStatus('available', 'AR Bersedia', 'Sesi AR telah ditamatkan. Model 3D sedia digunakan.');
  }

  // Start Camera-based AR mode
  async function startCameraAR() {
    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      showDialog('Sambungan Selamat Diperlukan', BM_MESSAGES.insecureContext, { icon: '🔒', hideGuide: true });
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showDialog('Peranti Tidak Disokong', BM_MESSAGES.unsupportedBrowser, { icon: '⚠️', hideGuide: true });
      return;
    }

    setBadgeStatus('checking', 'Memulakan Kamera…', 'Meminta kebenaran kamera daripada pelayar…');

    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: currentFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStream = stream;
      arVideo.srcObject = stream;
      await arVideo.play();

      isCameraArActive = true;
      closeDialog();

      // Setup AR Viewport
      arContainer.hidden = false;
      arOverlay.hidden = false;

      // Move Three.js canvas over the live camera stream
      const canvas = api().domElement;
      if (canvas && arCanvasHost) {
        arCanvasHost.appendChild(canvas);
      }
      if (api().resize) api().resize();

      // Update instructions and badges
      if (arModeBadge) arModeBadge.textContent = '📷 Pratonton Kamera AR • Langsung';
      if (arInstruction) {
        arInstruction.textContent = 'Seret untuk pusingkan sel 3D • Cubit untuk zum • Ketik organel untuk belajar';
      }

      if (btnPlace) btnPlace.hidden = true;
      if (btnReposition) btnReposition.hidden = true;

      // Check if multi-camera flip button should be displayed
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        if (arFlipBtn) arFlipBtn.hidden = videoInputs.length <= 1;
      } catch (_) {}

      refreshLabels();
      setBadgeStatus('available', 'Kamera AR Aktif', 'Sesi AR sedang berjalan. Ketik "Keluar AR" untuk menamatkan.');

    } catch (err) {
      console.warn('Camera AR permission/access error:', err);
      stopCameraTracks();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showDialog('Kebenaran Kamera Diperlukan', BM_MESSAGES.permissionDenied, {
          icon: 'videocam_off',
          showRetry: true
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showDialog('Kamera Tidak Dikesan', BM_MESSAGES.cameraUnavailable, {
          icon: 'no_photography',
          hideGuide: true
        });
      } else {
        showDialog('Ralat Akses Kamera', BM_MESSAGES.unsupportedBrowser + ' (' + (err.message || err.name) + ')', {
          icon: 'error_outline',
          showRetry: true
        });
      }
      setBadgeStatus('unsupported', 'Akses Dihadkan', 'Kebenaran kamera tidak diberikan atau peranti tidak tersedia.');
    }
  }

  // Start WebXR mode if supported, otherwise fallback to Camera AR
  async function handleArEntry() {
    entryBtn.disabled = true;

    const isSecure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecure) {
      entryBtn.disabled = false;
      showDialog('Sambungan Selamat Diperlukan', BM_MESSAGES.insecureContext, { icon: '🔒', hideGuide: true });
      return;
    }

    // Try WebXR first if supported by the browser
    if (xrSupported) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['local', 'hit-test', 'dom-overlay'],
          domOverlay: { root: arOverlay }
        });

        isWebXrActive = true;
        arContainer.hidden = false;
        arOverlay.hidden = false;
        if (arModeBadge) arModeBadge.textContent = '✨ WebXR AR Spasial Aktif';
        if (arInstruction) arInstruction.textContent = 'Halakan kamera ke permukaan rata untuk mengesan lantai atau meja.';

        await api().enterAR(session);
        refreshLabels();
        entryBtn.disabled = false;
        return;
      } catch (xrErr) {
        console.warn('WebXR session launch failed or cancelled; falling back to Camera AR stream:', xrErr);
        isWebXrActive = false;
      }
    }

    // Default to true camera-based AR stream via getUserMedia
    await startCameraAR();
    entryBtn.disabled = false;
  }

  // Flip between front/back cameras
  async function flipCamera() {
    if (!isCameraArActive) return;
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    stopCameraTracks();
    await startCameraAR();
  }

  // Refresh organelle label buttons in AR bottom sheet
  function refreshLabels() {
    const host = document.getElementById('ar-label-list');
    if (!host || !api()) return;
    host.innerHTML = '';
    api().getCore().forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ar-label-button';
      b.dataset.id = item.id;
      b.textContent = item.icon + ' ' + item.name;
      b.addEventListener('click', () => api().select(item.id));
      host.appendChild(b);
    });

    document.querySelectorAll('[data-ar-cell]').forEach(b => {
      b.classList.toggle('active', b.dataset.arCell === api().getCell());
    });
  }

  // Organelle selection callback from Three.js scene
  function onSelect(id, d, cell) {
    const nameEl = document.getElementById('ar-selected-name');
    const descEl = document.getElementById('ar-selected-description');
    const iconEl = document.getElementById('ar-selected-icon');
    if (nameEl) nameEl.textContent = d.name;
    if (iconEl) iconEl.textContent = d.icon || '🧬';
    if (descEl) {
      descEl.textContent = (id === 'vacuole' && cell === 'animal')
        ? 'Sesetengah sel haiwan mempunyai vakuol kecil; vakuol pusat yang besar ialah ciri biasa sel tumbuhan.'
        : d.description;
    }
    document.querySelectorAll('.ar-label-button').forEach(b => {
      b.classList.toggle('active', b.dataset.id === id);
    });
  }

  // WebXR Surface callbacks
  function onSurfaceFound() {
    if (!api().isPlaced() && arInstruction) {
      arInstruction.textContent = 'Permukaan rata dikesan! Sentuh "Letak sel di sini" atau ketik pada skrin.';
      if (btnPlace) btnPlace.hidden = false;
    }
  }

  function onSurfaceLost() {
    if (!api().isPlaced() && arInstruction) {
      arInstruction.textContent = 'Gerakkan peranti perlahan-lahan untuk mencari permukaan rata.';
      if (btnPlace) btnPlace.hidden = true;
    }
  }

  function onPlaced() {
    if (arInstruction) arInstruction.textContent = 'Model sel telah diletakkan. Terokai organel dan laraskan putaran atau saiz.';
    if (btnPlace) btnPlace.hidden = true;
    if (btnReposition) btnReposition.hidden = false;
  }

  function onReposition() {
    if (arInstruction) arInstruction.textContent = 'Arahkan peranti ke permukaan baharu dan letakkan semula model.';
    if (btnPlace) btnPlace.hidden = true;
    if (btnReposition) btnReposition.hidden = true;
  }

  function onEnded() {
    exitAR();
  }

  // Event Listeners
  if (entryBtn) entryBtn.addEventListener('click', handleArEntry);
  if (arExitBtn) arExitBtn.addEventListener('click', exitAR);
  if (arFlipBtn) arFlipBtn.addEventListener('click', flipCamera);

  if (explore3dBtn) explore3dBtn.addEventListener('click', closeDialog);
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      closeDialog();
      startCameraAR();
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeDialog();
      handleArEntry();
    });
  }
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      showDialog(BM_MESSAGES.guideTitle, 'Ikuti langkah berikut untuk memulakan pengalaman Realiti Terimbuh (AR):', {
        icon: 'menu_book',
        guide: BM_MESSAGES.guideSteps,
        showConfirm: true
      });
    });
  }

  if (dialog) {
    dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('keydown', e => { if (e.key === 'Escape') closeDialog(); });
  }

  // AR interactive tools
  if (btnSmaller) {
    btnSmaller.addEventListener('click', () => {
      if (isWebXrActive) api().adjustARScale(0.82);
      else if (api().zoomBy) api().zoomBy(1.18);
    });
  }
  if (btnLarger) {
    btnLarger.addEventListener('click', () => {
      if (isWebXrActive) api().adjustARScale(1.22);
      else if (api().zoomBy) api().zoomBy(0.82);
    });
  }
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      if (isWebXrActive) api().rotateAR();
      else if (api().rotateBy) api().rotateBy(Math.PI / 8);
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (api().resetView) api().resetView();
    });
  }
  if (btnPlace) {
    btnPlace.addEventListener('click', () => api().placeFromReticle());
  }
  if (btnReposition) {
    btnReposition.addEventListener('click', () => api().repositionAR());
  }

  // Cell switcher inside AR
  document.querySelectorAll('[data-ar-cell]').forEach(button => {
    button.addEventListener('click', () => {
      api().switchCell(button.dataset.arCell);
      refreshLabels();
    });
  });

  // Safe resource cleanup on tab close or navigation
  window.addEventListener('beforeunload', stopCameraTracks);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isCameraArActive) {
      exitAR();
    }
  });

  // Expose API for Three.js callbacks
  window.CellQuestAR = {
    refreshLabels,
    onSelect,
    onSurfaceFound,
    onSurfaceLost,
    onPlaced,
    onReposition,
    onEnded,
    exitAR,
    startCameraAR,
    auditCapabilities
  };

  // Run initial non-intrusive support audit (no camera requested on page load)
  auditCapabilities();
})();
