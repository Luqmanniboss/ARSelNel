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
    mindarInitCount: 0,
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

    // Fasa 4E-B.2.1: Multi-Panel State Machine & Active Set
    scanState: 'INITIAL_SCAN', // 'IDLE' | 'INITIAL_SCAN' | 'PANEL_ACTIVE' | 'ADD_PANEL'
    activePanels: new Set(),

    // Fasa 4C: Multi-Marker & Active Learning Module State
    activeModule: 'video', // 'video' | 'nota' | 'kuiz' | 'cellquest' | 'selbot'
    anchorVideo: null,
    anchorNota: null,
    anchorKuiz: null,
    anchorSelbot: null,
    // Fasa 4E-D.1: Pengasingan Anchor Sel Haiwan (Target 3) & Sel Tumbuhan (Target 4)
    anchorCellQuestAnimal: null,
    anchorCellQuestPlant: null,
    anchorCellQuest: null,
    // Fasa 4F: SelBot AI AR State
    selbot: {
      initialized: false,
      currentUserId: null,
      activeConversationId: null,
      conversations: [],
      messages: [],
      conversationHistory: [],
      isRequestInProgress: false,
      lastSentMessage: '',
      historyOpen: false
    },
    notes: [],
    activeNote: null,
    currentNotePage: 1,
    totalNotePages: 1,
    noteZoom: 1.0,
    noteSections: [],

    // Fasa 4C: Kuiz & Permainan State
    quizzes: [],
    games: [],
    activeQuiz: null,
    quizState: {
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 1,
      userAnswers: [],
      isAnswered: false,
      isCompleted: false,
      startTime: null
    },

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

    // Fasa 4B: Nota Interaktif DOM Elements
    DOM.panelCategoryTag = document.getElementById('panel-category-tag');
    DOM.panelCategoryIcon = document.getElementById('panel-category-icon');
    DOM.panelCategoryText = document.getElementById('panel-category-text');
    DOM.btnPlaceText = document.getElementById('btn-place-text');
    DOM.btnChangeContentText = document.getElementById('btn-change-content-text');
    DOM.povBtnChangeContentText = document.getElementById('pov-btn-change-content-text');

    DOM.notaSelectionView = document.getElementById('nota-selection-view');
    DOM.notaCardsScroll = document.getElementById('nota-cards-scroll');
    DOM.activeNotaView = document.getElementById('active-nota-view');
    DOM.btnNotaPrev = document.getElementById('btn-nota-prev');
    DOM.btnNotaNext = document.getElementById('btn-nota-next');
    DOM.notaPageIndicator = document.getElementById('nota-page-indicator');
    DOM.btnNotaZoomIn = document.getElementById('btn-nota-zoom-in');
    DOM.btnNotaZoomOut = document.getElementById('btn-nota-zoom-out');
    DOM.btnNotaZoomReset = document.getElementById('btn-nota-zoom-reset');
    DOM.notaZoomText = document.getElementById('nota-zoom-text');
    DOM.notaContentWrapper = document.getElementById('nota-content-wrapper');
    DOM.notaTitle = document.getElementById('nota-title');
    DOM.notaChapterBadge = document.getElementById('nota-chapter-badge');
    DOM.notaTypeBadge = document.getElementById('nota-type-badge');
    DOM.notaTimeBadge = document.getElementById('nota-time-badge');
    DOM.notaTimeText = document.getElementById('nota-time-text');
    DOM.btnNotaOpenFull = document.getElementById('btn-nota-open-full');
    DOM.notaPdfContainer = document.getElementById('nota-pdf-container');
    DOM.notaPdfLoading = document.getElementById('nota-pdf-loading');
    DOM.notaPdfCanvas = document.getElementById('nota-pdf-canvas');
    DOM.notaEmbedContainer = document.getElementById('nota-embed-container');
    DOM.notaEmbedFrame = document.getElementById('nota-embed-frame');
    DOM.notaBodyRendered = document.getElementById('nota-body-rendered');

    // POV Nota DOM Elements
    DOM.povActiveNotaView = document.getElementById('pov-active-nota-view');
    DOM.povNotaCardsScroll = document.getElementById('pov-nota-cards-scroll');
    DOM.povNotaSelectionView = document.getElementById('pov-nota-selection-view');
    DOM.povBtnNotaPrev = document.getElementById('pov-btn-nota-prev');
    DOM.povBtnNotaNext = document.getElementById('pov-btn-nota-next');
    DOM.povNotaPageIndicator = document.getElementById('pov-nota-page-indicator');
    DOM.povBtnNotaZoomIn = document.getElementById('pov-btn-nota-zoom-in');
    DOM.povBtnNotaZoomOut = document.getElementById('pov-btn-nota-zoom-out');
    DOM.povBtnNotaZoomReset = document.getElementById('pov-btn-nota-zoom-reset');
    DOM.povNotaZoomText = document.getElementById('pov-nota-zoom-text');
    DOM.povNotaContentWrapper = document.getElementById('pov-nota-content-wrapper');
    DOM.povNotaTitle = document.getElementById('pov-nota-title');
    DOM.povNotaChapterBadge = document.getElementById('pov-nota-chapter-badge');
    DOM.povNotaTypeBadge = document.getElementById('pov-nota-type-badge');
    DOM.povNotaTimeBadge = document.getElementById('pov-nota-time-badge');
    DOM.povNotaTimeText = document.getElementById('pov-nota-time-text');
    DOM.povBtnNotaOpenFull = document.getElementById('pov-btn-nota-open-full');
    DOM.povNotaPdfContainer = document.getElementById('pov-nota-pdf-container');
    DOM.povNotaPdfLoading = document.getElementById('pov-nota-pdf-loading');
    DOM.povNotaPdfCanvas = document.getElementById('pov-nota-pdf-canvas');
    DOM.povNotaEmbedContainer = document.getElementById('pov-nota-embed-container');
    DOM.povNotaEmbedFrame = document.getElementById('pov-nota-embed-frame');
    DOM.povNotaBodyRendered = document.getElementById('pov-nota-body-rendered');

    // Fasa 4B.2: POV Nota Telemetry & Guidance Elements
    DOM.povNotaValYaw = document.getElementById('pov-nota-val-yaw');
    DOM.povNotaValPitch = document.getElementById('pov-nota-val-pitch');
    DOM.povNotaValStatus = document.getElementById('pov-nota-val-status');
    DOM.povNotaStatusBanner = document.getElementById('pov-nota-status-banner');
    DOM.povNotaBannerIcon = document.getElementById('pov-nota-banner-icon');
    DOM.povNotaBannerText = document.getElementById('pov-nota-banner-text');

    // Fasa 4C: Kuiz & Permainan DOM Elements (Standard Floating Panel)
    DOM.kuizSelectionView = document.getElementById('kuiz-selection-view');
    DOM.tabKuizObjective = document.getElementById('tab-kuiz-objective');
    DOM.tabKuizGames = document.getElementById('tab-kuiz-games');
    DOM.kuizCardsScroll = document.getElementById('kuiz-cards-scroll');
    DOM.gamesCardsScroll = document.getElementById('games-cards-scroll');
    DOM.activeKuizView = document.getElementById('active-kuiz-view');
    DOM.kuizQuestionCounter = document.getElementById('kuiz-question-counter');
    DOM.kuizTopicBadge = document.getElementById('kuiz-topic-badge');
    DOM.kuizLiveScoreText = document.getElementById('kuiz-live-score-text');
    DOM.kuizProgressBar = document.getElementById('kuiz-progress-bar');
    DOM.kuizQuestionTitle = document.getElementById('kuiz-question-title');
    DOM.kuizQuestionText = document.getElementById('kuiz-question-text');
    DOM.kuizImgContainer = document.getElementById('kuiz-img-container');
    DOM.kuizQuestionImg = document.getElementById('kuiz-question-img');
    DOM.kuizOptionsGrid = document.getElementById('kuiz-options-grid');
    DOM.kuizFeedbackCard = document.getElementById('kuiz-feedback-card');
    DOM.feedbackIcon = document.getElementById('feedback-icon');
    DOM.feedbackTitle = document.getElementById('feedback-title');
    DOM.feedbackExplanation = document.getElementById('feedback-explanation');
    DOM.btnKuizNext = document.getElementById('btn-kuiz-next');
    DOM.btnKuizNextText = document.getElementById('btn-kuiz-next-text');
    DOM.kuizResultView = document.getElementById('kuiz-result-view');
    DOM.resultHeadline = document.getElementById('result-headline');
    DOM.resultScorePercent = document.getElementById('result-score-percent');
    DOM.resultScorePoints = document.getElementById('result-score-points');
    DOM.resultFeedbackDesc = document.getElementById('result-feedback-desc');
    DOM.resultStatCorrect = document.getElementById('result-stat-correct');
    DOM.resultStatWrong = document.getElementById('result-stat-wrong');
    DOM.btnResultRetry = document.getElementById('btn-result-retry');
    DOM.btnResultChoose = document.getElementById('btn-result-choose');

    // Fasa 4C: Kuiz & Permainan DOM Elements (POV Card)
    DOM.povKuizSelectionView = document.getElementById('pov-kuiz-selection-view');
    DOM.povTabKuizObjective = document.getElementById('pov-tab-kuiz-objective');
    DOM.povTabKuizGames = document.getElementById('pov-tab-kuiz-games');
    DOM.povKuizCardsScroll = document.getElementById('pov-kuiz-cards-scroll');
    DOM.povGamesCardsScroll = document.getElementById('pov-games-cards-scroll');
    DOM.povActiveKuizView = document.getElementById('pov-active-kuiz-view');
    DOM.povKuizTelemetryHudStrip = document.getElementById('pov-kuiz-telemetry-hud-strip');
    DOM.povKuizValYaw = document.getElementById('pov-kuiz-val-yaw');
    DOM.povKuizValPitch = document.getElementById('pov-kuiz-val-pitch');
    DOM.povKuizValStatus = document.getElementById('pov-kuiz-val-status');
    DOM.povKuizStatusBanner = document.getElementById('pov-kuiz-status-banner');
    DOM.povKuizBannerIcon = document.getElementById('pov-kuiz-banner-icon');
    DOM.povKuizBannerText = document.getElementById('pov-kuiz-banner-text');
    DOM.povKuizBannerActions = document.getElementById('pov-kuiz-banner-actions');
    DOM.povKuizBtnRetrySensor = document.getElementById('pov-kuiz-btn-retry-sensor');
    DOM.povKuizBtnFallbackPinned = document.getElementById('pov-kuiz-btn-fallback-pinned');
    DOM.povKuizQuestionCounter = document.getElementById('pov-kuiz-question-counter');
    DOM.povKuizTopicBadge = document.getElementById('pov-kuiz-topic-badge');
    DOM.povKuizLiveScoreText = document.getElementById('pov-kuiz-live-score-text');
    DOM.povKuizProgressBar = document.getElementById('pov-kuiz-progress-bar');
    DOM.povKuizQuestionTitle = document.getElementById('pov-kuiz-question-title');
    DOM.povKuizQuestionText = document.getElementById('pov-kuiz-question-text');
    DOM.povKuizImgContainer = document.getElementById('pov-kuiz-img-container');
    DOM.povKuizQuestionImg = document.getElementById('pov-kuiz-question-img');
    DOM.povKuizOptionsGrid = document.getElementById('pov-kuiz-options-grid');
    DOM.povKuizFeedbackCard = document.getElementById('pov-kuiz-feedback-card');
    DOM.povFeedbackIcon = document.getElementById('pov-feedback-icon');
    DOM.povFeedbackTitle = document.getElementById('pov-feedback-title');
    DOM.povFeedbackExplanation = document.getElementById('pov-feedback-explanation');
    DOM.povBtnKuizNext = document.getElementById('pov-btn-kuiz-next');
    DOM.povBtnKuizNextText = document.getElementById('pov-btn-kuiz-next-text');
    DOM.povKuizResultView = document.getElementById('pov-kuiz-result-view');
    DOM.povResultHeadline = document.getElementById('pov-result-headline');
    DOM.povResultScorePercent = document.getElementById('pov-result-score-percent');
    DOM.povResultScorePoints = document.getElementById('pov-result-score-points');
    DOM.povResultFeedbackDesc = document.getElementById('pov-result-feedback-desc');
    DOM.povResultStatCorrect = document.getElementById('pov-result-stat-correct');
    DOM.povResultStatWrong = document.getElementById('pov-result-stat-wrong');
    DOM.povBtnResultRetry = document.getElementById('pov-btn-result-retry');
    DOM.povBtnResultChoose = document.getElementById('pov-btn-result-choose');

    // Fasa 4E-B.2: Explicit Element Mapping (Zero monkey-patching of global DOM API)
    DOM.povPanelVideo = document.getElementById('pov-panel-video');
    DOM.povPanelNota = document.getElementById('pov-panel-nota');
    DOM.povAnchor = DOM.povPanelVideo;

    // Fasa 4E-B.2.1: Multi-Panel Spatial Toolbar & Add Scan Elements
    DOM.arMultiPanelBar = document.getElementById('ar-multi-panel-bar');
    DOM.btnAddScan = document.getElementById('btn-add-scan');
    DOM.btnCancelScan = document.getElementById('btn-cancel-scan');
    DOM.multiPanelBadgeCount = document.getElementById('multi-panel-badge-count');
    DOM.multiPanelCountText = document.getElementById('multi-panel-count-text');
    DOM.multiPanelTagsList = document.getElementById('multi-panel-tags-list');

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

    // Fasa 4E-C.2: Kuiz Panel Specific DOM Elements
    DOM.povPanelKuiz = document.getElementById('pov-panel-kuiz');
    DOM.povKuizCard = document.getElementById('pov-kuiz-card-container');
    DOM.povKuizHeader = document.getElementById('pov-kuiz-fixed-header');
    DOM.povKuizScrollableBody = document.getElementById('pov-kuiz-scrollable-body');
    DOM.povKuizBody = DOM.povKuizScrollableBody;
    DOM.povKuizFooter = document.getElementById('pov-kuiz-sticky-footer');
    DOM.povKuizCornerResizeHandle = document.getElementById('pov-kuiz-corner-resize-handle');
    DOM.povKuizSensorPill = document.getElementById('pov-kuiz-sensor-pill');
    DOM.povKuizSensorPing = document.getElementById('pov-kuiz-sensor-ping');
    DOM.povKuizSensorText = document.getElementById('pov-kuiz-sensor-text');
    DOM.povKuizToolbar = document.getElementById('pov-kuiz-toolbar');
    DOM.povKuizBtnToggleCam = document.getElementById('pov-kuiz-btn-toggle-cam');
    DOM.povKuizCamIcon = document.getElementById('pov-kuiz-cam-icon');
    DOM.povKuizCamText = document.getElementById('pov-kuiz-cam-text');
    DOM.povKuizSizeS = document.getElementById('pov-kuiz-size-s');
    DOM.povKuizSizeM = document.getElementById('pov-kuiz-size-m');
    DOM.povKuizSizeL = document.getElementById('pov-kuiz-size-l');
    DOM.povKuizBtnAnchor = document.getElementById('pov-kuiz-btn-anchor');
    DOM.povKuizAnchorIcon = document.getElementById('pov-kuiz-anchor-icon');
    DOM.povKuizAnchorText = document.getElementById('pov-kuiz-anchor-text');
    DOM.povKuizBtnChangeContent = document.getElementById('pov-kuiz-btn-change-content');
    DOM.povKuizBtnBackPinned = document.getElementById('pov-kuiz-btn-back-pinned');
    DOM.povKuizBtnClose = document.getElementById('pov-kuiz-btn-close');

    // Fasa 4F: SelBot AI Panel Specific DOM Elements (Floating & POV)
    DOM.selbotArView = document.getElementById('selbot-ar-view');
    DOM.selbotArStatusBadge = document.getElementById('selbot-ar-status-badge');
    DOM.selbotArSyncLabel = document.getElementById('selbot-ar-sync-label');
    DOM.btnSelbotArNewChat = document.getElementById('btn-selbot-ar-new-chat');
    DOM.btnSelbotArHistoryToggle = document.getElementById('btn-selbot-ar-history-toggle');
    DOM.selbotArHistoryCount = document.getElementById('selbot-ar-history-count');
    DOM.selbotArHistoryPanel = document.getElementById('selbot-ar-history-panel');
    DOM.btnSelbotArHistoryClose = document.getElementById('btn-selbot-ar-history-close');
    DOM.selbotArConvList = document.getElementById('selbot-ar-conv-list');
    DOM.selbotArChatFeed = document.getElementById('selbot-ar-chat-feed');
    DOM.selbotArTypingIndicator = document.getElementById('selbot-ar-typing-indicator');
    DOM.selbotArSuggestions = document.getElementById('selbot-ar-suggestions');
    DOM.selbotArInput = document.getElementById('selbot-ar-input');
    DOM.btnSelbotArSend = document.getElementById('btn-selbot-ar-send');

    DOM.povPanelSelbot = document.getElementById('pov-panel-selbot');
    DOM.povSelbotCard = document.getElementById('pov-selbot-card-container');
    DOM.povSelbotHeader = document.getElementById('pov-selbot-fixed-header');
    DOM.povSelbotScrollableBody = document.getElementById('pov-selbot-scrollable-body');
    DOM.povSelbotBody = DOM.povSelbotScrollableBody;
    DOM.povSelbotFooter = document.getElementById('pov-selbot-sticky-footer');
    DOM.povSelbotCornerResizeHandle = document.getElementById('pov-selbot-corner-resize-handle');
    DOM.povSelbotSensorPill = document.getElementById('pov-selbot-sensor-pill');
    DOM.povSelbotSensorPing = document.getElementById('pov-selbot-sensor-ping');
    DOM.povSelbotSensorText = document.getElementById('pov-selbot-sensor-text');
    DOM.povSelbotToolbar = document.getElementById('pov-selbot-toolbar');
    DOM.povSelbotBtnToggleCam = document.getElementById('pov-selbot-btn-toggle-cam');
    DOM.povSelbotCamIcon = document.getElementById('pov-selbot-cam-icon');
    DOM.povSelbotCamText = document.getElementById('pov-selbot-cam-text');
    DOM.povSelbotSizeS = document.getElementById('pov-selbot-size-s');
    DOM.povSelbotSizeM = document.getElementById('pov-selbot-size-m');
    DOM.povSelbotSizeL = document.getElementById('pov-selbot-size-l');
    DOM.povSelbotValYaw = document.getElementById('pov-selbot-val-yaw');
    DOM.povSelbotValPitch = document.getElementById('pov-selbot-val-pitch');
    DOM.povSelbotValStatus = document.getElementById('pov-selbot-val-status');
    DOM.povSelbotStatusBanner = document.getElementById('pov-selbot-status-banner');
    DOM.povSelbotBannerIcon = document.getElementById('pov-selbot-banner-icon');
    DOM.povSelbotBannerText = document.getElementById('pov-selbot-banner-text');
    DOM.povSelbotBannerActions = document.getElementById('pov-selbot-banner-actions');
    DOM.povSelbotBtnRetrySensor = document.getElementById('pov-selbot-btn-retry-sensor');
    DOM.povSelbotBtnFallbackPinned = document.getElementById('pov-selbot-btn-fallback-pinned');
    DOM.povActiveSelbotView = document.getElementById('pov-active-selbot-view');
    DOM.povSelbotStatusBadge = document.getElementById('pov-selbot-status-badge');
    DOM.povSelbotSyncLabel = document.getElementById('pov-selbot-sync-label');
    DOM.btnPovSelbotNewChat = document.getElementById('btn-pov-selbot-new-chat');
    DOM.btnPovSelbotHistoryToggle = document.getElementById('btn-pov-selbot-history-toggle');
    DOM.povSelbotHistoryCount = document.getElementById('pov-selbot-history-count');
    DOM.povSelbotHistoryPanel = document.getElementById('pov-selbot-history-panel');
    DOM.btnPovSelbotHistoryClose = document.getElementById('btn-pov-selbot-history-close');
    DOM.povSelbotConvList = document.getElementById('pov-selbot-conv-list');
    DOM.povSelbotChatFeed = document.getElementById('pov-selbot-chat-feed');
    DOM.povSelbotTypingIndicator = document.getElementById('pov-selbot-typing-indicator');
    DOM.povSelbotSuggestions = document.getElementById('pov-selbot-suggestions');
    DOM.povSelbotInput = document.getElementById('pov-selbot-input');
    DOM.btnPovSelbotSend = document.getElementById('btn-pov-selbot-send');
    DOM.povSelbotBtnStartPOV = document.getElementById('pov-selbot-btn-start-pov');
    DOM.povSelbotBtnAnchor = document.getElementById('pov-selbot-btn-anchor');
    DOM.povSelbotAnchorIcon = document.getElementById('pov-selbot-anchor-icon');
    DOM.povSelbotAnchorText = document.getElementById('pov-selbot-anchor-text');
    DOM.povSelbotBtnChangeContent = document.getElementById('pov-selbot-btn-change-content');
    DOM.povSelbotBtnBackPinned = document.getElementById('pov-selbot-btn-back-pinned');
    DOM.povSelbotBtnClose = document.getElementById('pov-selbot-btn-close');

    // Fasa 3C POV Video DOM Elements
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
    DOM.povBannerActions = document.getElementById('pov-banner-actions');
    DOM.povBtnRetrySensor = document.getElementById('pov-btn-retry-sensor');
    DOM.povBtnFallbackPinned = document.getElementById('pov-btn-fallback-pinned');
    DOM.povNotaBannerActions = document.getElementById('pov-nota-banner-actions');
    DOM.povNotaBtnRetrySensor = document.getElementById('pov-nota-btn-retry-sensor');
    DOM.povNotaBtnFallbackPinned = document.getElementById('pov-nota-btn-fallback-pinned');
    DOM.povValYaw = document.getElementById('pov-val-yaw');
    DOM.povValPitch = document.getElementById('pov-val-pitch');
    DOM.povValStatus = document.getElementById('pov-val-status');
    DOM.povBtnStartPOV = document.getElementById('pov-btn-start-pov');
    DOM.povNotaBtnStartPOV = document.getElementById('pov-nota-btn-start-pov');
    DOM.povKuizBtnStartPOV = document.getElementById('pov-kuiz-btn-start-pov');
    DOM.floatingPovStatusBadge = document.getElementById('floating-pov-status-badge');
    DOM.floatingPovStatusIcon = document.getElementById('floating-pov-status-icon');
    DOM.floatingPovStatusText = document.getElementById('floating-pov-status-text');
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
    DOM.diagModule = document.getElementById('diag-module');
    DOM.diagLastUpdate = document.getElementById('diag-last-update');
    DOM.diagPanelPos = document.getElementById('diag-panel-pos');
    DOM.diagTransform = document.getElementById('diag-transform');
    DOM.diagVideoStatus = document.getElementById('diag-video-status');
    DOM.diagNotaStatus = document.getElementById('diag-nota-status');

    // Fasa 4E-D.1.1: Telemetri Kamera & MindAR WebAR
    DOM.diagCamStatus = document.getElementById('diag-cam-status');
    DOM.diagVideoDim = document.getElementById('diag-video-dim');
    DOM.diagVideoReady = document.getElementById('diag-video-ready');
    DOM.diagMindarStatus = document.getElementById('diag-mindar-status');
    DOM.diagMarkerMindStatus = document.getElementById('diag-marker-mind-status');
    DOM.diagWebglStatus = document.getElementById('diag-webgl-status');
    DOM.diagLastError = document.getElementById('diag-last-error');

    // Exit Confirmation Modal Dialog
    DOM.exitModalBackdrop = document.getElementById('exit-modal-backdrop');
    DOM.btnExitCancel = document.getElementById('btn-exit-cancel');
    DOM.btnExitConfirm = document.getElementById('btn-exit-confirm');

    // Fasa 4E-E.1: Jelajah 3D Integration Button & Confirmation Modal
    DOM.btnLaunchJelajah3d = document.getElementById('btn-launch-jelajah3d');
    DOM.jelajah3dModalBackdrop = document.getElementById('jelajah3d-modal-backdrop');
    DOM.btnJelajah3dCancel = document.getElementById('btn-jelajah3d-cancel');
    DOM.btnJelajah3dConfirm = document.getElementById('btn-jelajah3d-confirm');

    // Fasa 4C.3: Scanner Recovery & Embedded Games
    DOM.scannerPromptIcon = document.getElementById('scanner-prompt-icon');
    DOM.scannerPromptText = document.getElementById('scanner-prompt-text');
    DOM.scannerRecoveryBox = document.getElementById('scanner-recovery-box');
    DOM.btnRestartCamera = document.getElementById('btn-restart-camera');

    DOM.embeddedGameView = document.getElementById('embedded-game-view');
    DOM.btnCloseEmbeddedGame = document.getElementById('btn-close-embedded-game');
    DOM.embeddedGameIcon = document.getElementById('embedded-game-icon');
    DOM.embeddedGameTitle = document.getElementById('embedded-game-title');
    DOM.btnToggleGameFocus = document.getElementById('btn-toggle-game-focus');
    DOM.gameFocusIcon = document.getElementById('game-focus-icon');
    DOM.gameFocusText = document.getElementById('game-focus-text');
    DOM.embeddedGameLoading = document.getElementById('embedded-game-loading');
    DOM.embeddedGameIframe = document.getElementById('embedded-game-iframe');

    // POV Embedded Games
    DOM.povEmbeddedGameView = document.getElementById('pov-embedded-game-view');
    DOM.povBtnCloseEmbeddedGame = document.getElementById('pov-btn-close-embedded-game');
    DOM.povEmbeddedGameIcon = document.getElementById('pov-embedded-game-icon');
    DOM.povEmbeddedGameTitle = document.getElementById('pov-embedded-game-title');
    DOM.povBtnToggleGameFocus = document.getElementById('pov-btn-toggle-game-focus');
    DOM.povGameFocusIcon = document.getElementById('pov-game-focus-icon');
    DOM.povGameFocusText = document.getElementById('pov-game-focus-text');
    DOM.povEmbeddedGameLoading = document.getElementById('pov-embedded-game-loading');
    DOM.povEmbeddedGameIframe = document.getElementById('pov-embedded-game-iframe');
    DOM.embeddedIframeWrapper = document.getElementById('embedded-iframe-wrapper');
    DOM.povEmbeddedIframeWrapper = document.getElementById('pov-embedded-iframe-wrapper');
    DOM.povCornerResizeHandle = document.getElementById('pov-corner-resize-handle');

    // Fasa 4D-B: CellQuest 3D Elements
    DOM.cellquestSelectionView = document.getElementById('cellquest-selection-view');
    DOM.btnChoiceAnimal = document.getElementById('btn-choice-animal');
    DOM.btnChoicePlant = document.getElementById('btn-choice-plant');
    DOM.povCellquestSelectionView = document.getElementById('pov-cellquest-selection-view');
    DOM.povBtnChoiceAnimal = document.getElementById('pov-btn-choice-animal');
    DOM.povBtnChoicePlant = document.getElementById('pov-btn-choice-plant');
    DOM.cellquestStatusNoticeText = document.getElementById('cellquest-status-notice-text');
    DOM.povCellquestStatusNoticeText = document.getElementById('pov-cellquest-status-notice-text');

    // Fasa 4D-C: Direct AR CellQuest 3D Overlay Elements
    DOM.cellquestArHud = document.getElementById('cellquest-ar-hud');
    DOM.cqHudBtnBack = document.getElementById('cq-hud-btn-back');
    DOM.cqHudCellName = document.getElementById('cq-hud-cell-name');
    DOM.cqTrackingStatus = document.getElementById('cq-tracking-status');
    DOM.cqStatusText = document.getElementById('cq-status-text');
    DOM.cqLoadingSpinner = document.getElementById('cq-loading-spinner');
    DOM.cqSpinnerText = document.getElementById('cq-spinner-text');
    DOM.cqOrganelleCard = document.getElementById('cq-organelle-card');
    DOM.cqCardIcon = document.getElementById('cq-card-icon');
    DOM.cqCardName = document.getElementById('cq-card-name');
    DOM.cqCardCategory = document.getElementById('cq-card-category');
    DOM.cqCardClose = document.getElementById('cq-card-close');
    DOM.cqCardFunction = document.getElementById('cq-card-function');
    DOM.cqCardAnalogy = document.getElementById('cq-card-analogy');
    DOM.cqCardFact = document.getElementById('cq-card-fact');
    DOM.cqHintPill = document.getElementById('cq-hint-pill');
    DOM.cqBottomControls = document.getElementById('cq-bottom-controls');
    DOM.cqBtnAnimal = document.getElementById('cq-btn-animal');
    DOM.cqBtnPlant = document.getElementById('cq-btn-plant');
    DOM.cqBtnRotate = document.getElementById('cq-btn-rotate');
    DOM.cqBtnDrag = document.getElementById('cq-btn-drag');
    DOM.cqBtnPin = document.getElementById('cq-btn-pin');
    DOM.cqPinIcon = document.getElementById('cq-pin-icon');
    DOM.cqPinLabel = document.getElementById('cq-pin-label');
    DOM.cqBtnPOV = document.getElementById('cq-btn-pov');
    DOM.cqPovIcon = document.getElementById('cq-pov-icon');
    DOM.cqPovLabel = document.getElementById('cq-pov-label');
    DOM.cqBtnZoomIn = document.getElementById('cq-btn-zoom-in');
    DOM.cqBtnZoomOut = document.getElementById('cq-btn-zoom-out');
    DOM.cqBtnReset = document.getElementById('cq-btn-reset');
    DOM.cqBtnRecenter = document.getElementById('cq-btn-recenter');

    // Fasa 4D-C.1: Top HUD, CellQuest Diagnostics & Telemetry Elements
    DOM.topAppHud = document.querySelector('.ar-top-hud');
    DOM.cqHudBtnDiagnostics = document.getElementById('cq-hud-btn-diagnostics');
    DOM.diagBtnToggleDebugCube = document.getElementById('diag-btn-toggle-debug-cube');
    DOM.diagCqGlbStatus = document.getElementById('diag-cq-glb-status');
    DOM.diagCqActiveModel = document.getElementById('diag-cq-active-model');
    DOM.diagCqTrackingState = document.getElementById('diag-cq-tracking-state');
    DOM.diagCqInteractionMode = document.getElementById('diag-cq-interaction-mode');
    DOM.diagCqPinEnabled = document.getElementById('diag-cq-pin-enabled');
    DOM.diagCqParent = document.getElementById('diag-cq-parent');
    DOM.diagCqMeshCount = document.getElementById('diag-cq-mesh-count');
    DOM.diagCqPos = document.getElementById('diag-cq-pos');
    DOM.diagCqScale = document.getElementById('diag-cq-scale');
    DOM.diagCqPointerEvent = document.getElementById('diag-cq-pointer-event');
    DOM.diagCqBounds = document.getElementById('diag-cq-bounds');
    DOM.diagCqRadius = document.getElementById('diag-cq-radius');
    DOM.diagCqAnchor = document.getElementById('diag-cq-anchor');
    DOM.diagCqWebgl = document.getElementById('diag-cq-webgl');
    DOM.diagCqSpatialMode = document.getElementById('diag-cq-spatial-mode');
    DOM.diagCqAnchorHeading = document.getElementById('diag-cq-anchor-heading');
    DOM.diagCqVCam = document.getElementById('diag-cq-vcam');
    DOM.diagCqDelta = document.getElementById('diag-cq-delta');
    DOM.diagCqCamNearFar = document.getElementById('diag-cq-cam-near-far');
    DOM.diagCqFrustum = document.getElementById('diag-cq-frustum');

    // Fasa 4D-D.2: CellQuest POV Setup Banner & Action Controls
    DOM.cqPovSetupBanner = document.getElementById('cq-pov-setup-banner');
    DOM.cqPovSensorStatus = document.getElementById('cq-pov-sensor-status');
    DOM.cqPovStatusDot = document.getElementById('cq-pov-status-dot');
    DOM.cqPovSensorText = document.getElementById('cq-pov-sensor-text');
    DOM.cqBtnPovAnchor = document.getElementById('cq-btn-pov-anchor');
    DOM.cqBtnPovCancel = document.getElementById('cq-btn-pov-cancel');
    DOM.cqPovDeadSensorBox = document.getElementById('cq-pov-dead-sensor-box');
    DOM.cqBtnPovRetry = document.getElementById('cq-btn-pov-retry');
    DOM.cqBtnPovUsePin = document.getElementById('cq-btn-pov-use-pin');

    // Fasa 4E-E.2: Jelajah 3D Marker Intro Panel Elements (Target Index 5)
    DOM.jelajah3dIntroBackdrop = document.getElementById('jelajah3d-marker-intro-backdrop');
    DOM.jelajah3dIntroCard = document.getElementById('jelajah3d-marker-intro-card');
    DOM.btnJelajah3dIntroStart = document.getElementById('btn-jelajah3d-intro-start');
    DOM.btnJelajah3dIntroClose = document.getElementById('btn-jelajah3d-intro-close');

    // Fasa 4E-F.1: Onboarding, Panduan Imbasan, Selepas Kesan & Panduan Kunci Pandangan
    DOM.btnOpenUserGuide = document.getElementById('btn-open-user-guide');
    DOM.scannerGuideTitle = document.getElementById('scanner-guide-title');
    DOM.scannerGuideSubtitle = document.getElementById('scanner-guide-subtitle');
    DOM.scannerTipsBox = document.getElementById('scanner-tips-box');
    DOM.postDetectGuide = document.getElementById('ar-post-detection-guide');
    DOM.postDetectIcon = document.getElementById('post-detect-icon');
    DOM.postDetectTitle = document.getElementById('post-detect-title');
    DOM.postDetectSubtitle = document.getElementById('post-detect-subtitle');
    DOM.btnDismissPostDetect = document.getElementById('btn-dismiss-post-detect');
    DOM.povInteractiveGuide = document.getElementById('ar-pov-interactive-guide');
    DOM.povGuideStepBadge = document.getElementById('pov-guide-step-badge');
    DOM.povGuideTitle = document.getElementById('pov-guide-title');
    DOM.povGuideDesc = document.getElementById('pov-guide-desc');
    DOM.povGuideDots = document.getElementById('pov-guide-dots');
    DOM.btnPovGuidePrev = document.getElementById('btn-pov-guide-prev');
    DOM.btnPovGuideNext = document.getElementById('btn-pov-guide-next');
    DOM.btnPovGuideSkip = document.getElementById('btn-pov-guide-skip');
    DOM.onboardingBackdrop = document.getElementById('kotak-onboarding-backdrop');
    DOM.onboardingCard = document.getElementById('kotak-onboarding-card');
    DOM.onboardingProgressText = document.getElementById('onboarding-progress-text');
    DOM.onboardingProgressFill = document.getElementById('onboarding-progress-fill');
    DOM.onboardingVisualIcon = document.getElementById('onboarding-visual-icon');
    DOM.onboardingTitle = document.getElementById('onboarding-title');
    DOM.onboardingDesc = document.getElementById('onboarding-desc');
    DOM.onboardingTipText = document.getElementById('onboarding-tip-text');
    DOM.onboardingStepDots = document.getElementById('onboarding-step-dots');
    DOM.btnOnboardingSkip = document.getElementById('btn-onboarding-skip');
    DOM.btnOnboardingPrev = document.getElementById('btn-onboarding-prev');
    DOM.btnOnboardingNext = document.getElementById('btn-onboarding-next');
    DOM.btnOnboardingStart = document.getElementById('btn-onboarding-start');
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
   * Fasa 4C.3: AR Session Recovery Manager (7-State FSM & Lifecycle Resilience)
   * Prevents camera lockouts on navigation/tab switch, manages dynamic scanner prompts,
   * handles Safari BFCache (pageshow) and provides user-accessible camera recovery.
   */
  const ARSessionRecoveryManager = {
    State: {
      IDLE: 'IDLE',
      STARTING: 'STARTING',
      SCANNING: 'SCANNING',
      MARKER_ACTIVE: 'MARKER_ACTIVE',
      GAME_ACTIVE: 'GAME_ACTIVE',
      RECOVERING: 'RECOVERING',
      ERROR: 'ERROR'
    },
    currentState: 'IDLE',

    setState(newState, detail = {}) {
      console.log(`[ARRecovery] Transition: ${this.currentState} -> ${newState}`, detail);
      this.currentState = newState;
      this.updateScannerUI();
    },

    updateScannerUI() {
      if (!DOM.scannerPromptText) return;

      if (this.currentState === this.State.RECOVERING) {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'autorenew';
        DOM.scannerPromptText.textContent = 'Memulihkan sesi kamera WebAR...';
        if (DOM.scannerRecoveryBox) DOM.scannerRecoveryBox.classList.add('hidden');
        return;
      }

      if (this.currentState === this.State.ERROR) {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'error';
        DOM.scannerPromptText.textContent = 'Kamera terputus. Sila tekan butang untuk aktifkan semula.';
        if (DOM.scannerRecoveryBox) DOM.scannerRecoveryBox.classList.remove('hidden');
        return;
      }

      if (DOM.scannerRecoveryBox) DOM.scannerRecoveryBox.classList.add('hidden');

      const mod = ARState.activeModule || 'video';
      if (mod === 'cellquest') {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'view_in_ar';
        DOM.scannerPromptText.textContent = 'Halakan kamera ke Kad AR CellQuest 3D pada Kotak ARSELNEL';
      } else if (mod === 'kuiz') {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'sports_esports';
        DOM.scannerPromptText.textContent = 'Halakan kamera ke Kad AR Kuiz & Permainan pada Kotak ARSELNEL';
      } else if (mod === 'nota') {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'auto_stories';
        DOM.scannerPromptText.textContent = 'Halakan kamera ke Kad AR Nota pada Kotak ARSELNEL';
      } else {
        if (DOM.scannerPromptIcon) DOM.scannerPromptIcon.textContent = 'view_in_ar';
        DOM.scannerPromptText.textContent = 'Halakan kamera ke mana-mana Kad AR pada Kotak ARSELNEL';
      }
    },

    async recoverCameraSession() {
      console.log('[ARRecovery] Manual/Auto recovery triggered...');
      this.setState(this.State.RECOVERING);
      try {
        showToast('Memulakan semula kamera WebAR...', 2000);
        await initMindAR();
        this.setState(this.State.SCANNING);
        showToast('Kamera WebAR berjaya dipulihkan!', 2500);
      } catch (err) {
        console.error('[ARRecovery] Gagal memulihkan kamera:', err);
        this.setState(this.State.ERROR, { error: err.message });
        showToast('Gagal memulihkan kamera. Sila semak kebenaran peranti.', 4000);
      }
    },

    initLifecycleListeners() {
      // 1. Safari BFCache support (page restored from cache)
      // JANGAN semak !ARState.mindarThree di sini kerana pageshow sentiasa tercetus pada pelayar web
      // sejurus selepas DOMContentLoaded semasa startApp() sedang memuatkan CMS, yang akan menyebabkan double init collision!
      window.addEventListener('pageshow', (event) => {
        console.log('[ARRecovery] pageshow event fired, persisted:', event.persisted);
        if (event.persisted) {
          // Fasa 4E-F.1: Jangan mulakan kamera jika pengguna baharu masih dalam panduan onboarding
          if (!hasCompletedOnboarding() && !ARState.mindarThree) {
            return;
          }
          // BFCache restore Safari iOS: bersihkan pendengar sensor lama sebelum pulihkan sesi kamera
          try {
            cleanupPOVListeners();
            if (ARState.pov && ARState.pov.rafId) {
              cancelAnimationFrame(ARState.pov.rafId);
              ARState.pov.rafId = null;
            }
          } catch (_) {}
          this.recoverCameraSession();
        }
      });

      window.addEventListener('pagehide', () => {
        console.log('[ARRecovery] pagehide event fired, cleaning up session & POV sensors');
        try { cleanupPOVListeners(); } catch (_) {}
        try { cleanupSession(); } catch (_) {}
      });

      // 2. Tab visibility changes (waking back up)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('[ARRecovery] Tab visibility returned to visible.');
          if (ARState.cameraStream) {
            const allEnded = ARState.cameraStream.getTracks().every(t => t.readyState === 'ended');
            if (allEnded) {
              console.warn('[ARRecovery] Stream tracks ended while tab hidden. Recovering...');
              this.recoverCameraSession();
            }
          }
        }
      });

      // 3. Fallback recovery button
      if (DOM.btnRestartCamera) {
        DOM.btnRestartCamera.addEventListener('click', () => {
          this.recoverCameraSession();
        });
      }
    }
  };

  /**
   * Fasa 4C.4: Game Session State Machine & Isolation Manager
   * Guarantees that interactive AR games remain strictly isolated from marker jitter,
   * lost timeouts, sensor events, and accidental catalog resets.
   */
  const GameSessionManager = {
    State: {
      CATALOG_ACTIVE: 'CATALOG_ACTIVE',
      GAME_LOADING: 'GAME_LOADING',
      GAME_ACTIVE: 'GAME_ACTIVE',
      GAME_PAUSED: 'GAME_PAUSED',
      GAME_CLOSING: 'GAME_CLOSING',
      ERROR: 'ERROR'
    },
    state: 'CATALOG_ACTIVE',
    activeGameId: null,
    activeGameRoute: null,
    activeIframe: null,
    currentPanelMode: 'floating',

    isGameActive() {
      return this.state === this.State.GAME_ACTIVE || this.state === this.State.GAME_LOADING;
    },

    setSessionState(newState, meta = {}) {
      console.log(`[GameSession] 🔄 State Transition: ${this.state} ➔ ${newState}`, meta);
      this.state = newState;
      if (meta.gameId !== undefined) this.activeGameId = meta.gameId;
      if (meta.route !== undefined) this.activeGameRoute = meta.route;
      if (meta.iframe !== undefined) this.activeIframe = meta.iframe;
      if (meta.panelMode !== undefined) this.currentPanelMode = meta.panelMode;

      // Sync with global ARState
      ARState.gameSessionState = newState;
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
        placementMode: 'MARKER_FOLLOW',
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
        placementMode: 'MARKER_FOLLOW',
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

      console.log('✅ [SpatialPanelManager] Inisialisasi siap: Video (#pov-panel-video) & Nota (#pov-panel-nota) mod lalai: MARKER_FOLLOW (Fasa Pembersihan Kotak ARSELNEL - 6 Sasaran Aktif).');
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
      let normalized = mode;
      if (mode === 'MARKER' || mode === 'MARKER_MODE') normalized = 'MARKER_FOLLOW';
      if (mode === 'WORLD_LOCKED') normalized = 'POV_LOCKED';
      p.placementMode = normalized;
      p.isLocked = (normalized === 'POV_LOCKED');
      if (normalized !== 'POV_LOCKED') {
        p.referenceQuaternion = null;
        p.anchorWorldVector = null;
      }
      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.setAttribute('data-placement-mode', normalized);
        if (normalized === 'MARKER_FOLLOW') {
          el.classList.remove('is-centered');
        }
      }
      this.syncPanelControlUI(id);
    },

    syncPanelControlUI(id) {
      const p = this.panels.get(id);
      if (!p) return;
      const rawMode = p.placementMode || 'MARKER_FOLLOW';
      const isLocked = (rawMode === 'POV_LOCKED' || rawMode === 'WORLD_LOCKED');
      const isSetup = (rawMode === 'POV_SETUP');
      const isPinned = (rawMode === 'SCREEN_PINNED');

      let btnStart = null, btnAnchor = null, anchorIcon = null, anchorText = null;
      let valStatus = null, bannerIcon = null, bannerText = null, btnBackPinned = null;
      let setupColor = '#38bdf8';

      if (id === 'video') {
        btnStart = DOM.povBtnStartPOV || document.getElementById('pov-btn-start-pov');
        btnAnchor = DOM.povBtnAnchor || document.getElementById('pov-btn-anchor');
        anchorIcon = DOM.povAnchorIcon || document.getElementById('pov-anchor-icon');
        anchorText = DOM.povAnchorText || document.getElementById('pov-anchor-text');
        valStatus = DOM.povValStatus || document.getElementById('pov-val-status');
        bannerIcon = DOM.povBannerIcon || document.getElementById('pov-banner-icon');
        bannerText = DOM.povBannerText || document.getElementById('pov-banner-text');
        btnBackPinned = DOM.povBtnBackPinned || document.getElementById('pov-btn-back-pinned');
      } else if (id === 'nota') {
        btnStart = DOM.povNotaBtnStartPOV || document.getElementById('pov-nota-btn-start-pov');
        btnAnchor = DOM.povNotaBtnAnchor || document.getElementById('pov-nota-btn-anchor');
        anchorIcon = DOM.povNotaAnchorIcon || document.getElementById('pov-nota-anchor-icon');
        anchorText = DOM.povNotaAnchorText || document.getElementById('pov-nota-anchor-text');
        valStatus = DOM.povNotaValStatus || document.getElementById('pov-nota-val-status');
        bannerIcon = DOM.povNotaBannerIcon || document.getElementById('pov-nota-banner-icon');
        bannerText = DOM.povNotaBannerText || document.getElementById('pov-nota-banner-text');
        btnBackPinned = DOM.povNotaBtnBackPinned || document.getElementById('pov-nota-btn-back-pinned');
      } else if (id === 'kuiz') {
        btnStart = DOM.povKuizBtnStartPOV || document.getElementById('pov-kuiz-btn-start-pov');
        btnAnchor = DOM.povKuizBtnAnchor || document.getElementById('pov-kuiz-btn-anchor');
        anchorIcon = DOM.povKuizAnchorIcon || document.getElementById('pov-kuiz-anchor-icon');
        anchorText = DOM.povKuizAnchorText || document.getElementById('pov-kuiz-anchor-text');
        valStatus = DOM.povKuizValStatus || document.getElementById('pov-kuiz-val-status');
        bannerIcon = DOM.povKuizBannerIcon || document.getElementById('pov-kuiz-banner-icon');
        bannerText = DOM.povKuizBannerText || document.getElementById('pov-kuiz-banner-text');
        btnBackPinned = DOM.povKuizBtnBackPinned || document.getElementById('pov-kuiz-btn-back-pinned');
        setupColor = '#c084fc';
      } else if (id === 'selbot') {
        btnStart = DOM.povSelbotBtnStartPOV || document.getElementById('pov-selbot-btn-start-pov');
        btnAnchor = DOM.povSelbotBtnAnchor || document.getElementById('pov-selbot-btn-anchor');
        anchorIcon = DOM.povSelbotAnchorIcon || document.getElementById('pov-selbot-anchor-icon');
        anchorText = DOM.povSelbotAnchorText || document.getElementById('pov-selbot-anchor-text');
        valStatus = DOM.povSelbotValStatus || document.getElementById('pov-selbot-val-status');
        bannerIcon = DOM.povSelbotBannerIcon || document.getElementById('pov-selbot-banner-icon');
        bannerText = DOM.povSelbotBannerText || document.getElementById('pov-selbot-banner-text');
        btnBackPinned = DOM.povSelbotBtnBackPinned || document.getElementById('pov-selbot-btn-back-pinned');
        setupColor = '#06b6d4';
      }

      // Update Semat Skrin / Ikut Kad AR button state
      if (btnBackPinned) {
        btnBackPinned.classList.remove('hidden');
        const textSpan = btnBackPinned.querySelector('span:not(.material-symbols-outlined)') || btnBackPinned.lastElementChild;
        const iconSpan = btnBackPinned.querySelector('.material-symbols-outlined');
        if (isPinned) {
          if (textSpan) textSpan.textContent = 'Ikut Kad AR';
          if (iconSpan) iconSpan.textContent = 'qr_code_scanner';
          btnBackPinned.title = 'Batal semat skrin dan ikuti kad AR';
        } else {
          if (textSpan) textSpan.textContent = 'Semat Skrin';
          if (iconSpan) iconSpan.textContent = 'push_pin';
          btnBackPinned.title = 'Sematkan panel ke skrin agar kekal kelihatan tanpa kad AR';
        }
      }

      if (isLocked) {
        if (btnStart) btnStart.classList.add('hidden');
        if (btnAnchor) {
          btnAnchor.classList.remove('hidden');
          btnAnchor.classList.add('is-locked');
        }
        if (anchorIcon) anchorIcon.textContent = 'refresh';
        if (anchorText) anchorText.textContent = 'Alih / Letak Semula';
        if (valStatus) {
          valStatus.textContent = `Pandangan Dikunci (${Math.round(p.anchorYaw || 0)}°)`;
          valStatus.style.color = '#10b981';
        }
        if (bannerIcon) bannerIcon.textContent = 'lock';
        if (bannerText) bannerText.textContent = 'Pandangan Dikunci! Pusingkan peranti untuk melihat panel dalam ruang 360°.';
      } else if (isSetup) {
        if (btnStart) btnStart.classList.add('hidden');
        if (btnAnchor) {
          btnAnchor.classList.remove('hidden', 'is-locked');
        }
        if (anchorIcon) anchorIcon.textContent = 'my_location';
        if (anchorText) anchorText.textContent = 'Letak di Arah Ini';
        if (valStatus) {
          valStatus.textContent = 'Halakan peranti ke arah pilihan';
          valStatus.style.color = setupColor;
        }
        if (bannerIcon) bannerIcon.textContent = 'sensors';
        if (bannerText) bannerText.textContent = 'Halakan peranti ke arah pilihan, kemudian tekan "Letak di Arah Ini".';
      } else if (isPinned) {
        if (btnStart) btnStart.classList.remove('hidden');
        if (btnAnchor) {
          btnAnchor.classList.add('hidden');
          btnAnchor.classList.remove('is-locked');
        }
        if (anchorIcon) anchorIcon.textContent = 'my_location';
        if (anchorText) anchorText.textContent = 'Letak di Arah Ini';
        if (valStatus) {
          valStatus.textContent = 'Panel Disemat pada Skrin';
          valStatus.style.color = '#f59e0b';
        }
        if (bannerIcon) bannerIcon.textContent = 'push_pin';
        if (bannerText) bannerText.textContent = 'Panel Disemat pada Skrin — Anda boleh menyeret dan mengubah saiz panel dengan bebas.';
      } else {
        // MARKER_FOLLOW (Default Mod Imbasan AR)
        if (btnStart) btnStart.classList.remove('hidden');
        if (btnAnchor) {
          btnAnchor.classList.add('hidden');
          btnAnchor.classList.remove('is-locked');
        }
        if (anchorIcon) anchorIcon.textContent = 'my_location';
        if (anchorText) anchorText.textContent = 'Letak di Arah Ini';
        if (valStatus) {
          valStatus.textContent = 'Mod Imbasan AR — Panel Mengikuti Kad';
          valStatus.style.color = '#38bdf8';
        }
        if (bannerIcon) bannerIcon.textContent = 'qr_code_scanner';
        if (bannerText) bannerText.textContent = 'Mod Imbasan AR — Panel sedang mengikuti pergerakan kad AR anda.';
      }

      if (DOM.floatingPovStatusText) {
        if (ARState.systemMode === 'POV_LOCKED') {
          DOM.floatingPovStatusText.textContent = 'Pandangan Dikunci';
        } else if (ARState.systemMode === 'POV_SETUP') {
          DOM.floatingPovStatusText.textContent = 'Halakan peranti ke arah pilihan';
        } else {
          DOM.floatingPovStatusText.textContent = 'Pandangan Belum Dikunci';
        }
      }
    },

    async enterPanelPOVSetup(id) {
      const p = this.panels.get(id);
      if (!p) return;
      initThreeHelpers();
      initPOVVirtualCamera();
      ARState.pov.active = true;
      ARState.systemMode = SYSTEM_MODES.POV_SETUP;
      p.placementMode = 'POV_SETUP';
      p.isLocked = false;
      p.referenceQuaternion = null;
      p.anchorWorldVector = null;

      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.classList.remove('hidden');
        el.classList.add('is-visible', 'is-centered');
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';
        el.setAttribute('data-placement-mode', 'POV_SETUP');
      }

      this.syncPanelControlUI(id);
      setupPOVSensorListeners();
      startPOVRenderLoop();
      maybeShowPOVInteractiveGuide();
      if (typeof focusPanel === 'function') focusPanel(id);

      if (!ARState.pov.permissionGranted) {
        requestSensorPermission().catch((err) => {
          console.warn('[KotakAR-POV] Ralat semasa meminta kebenaran sensor:', err);
        });
      }

      const pNames = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', selbot: 'SelBot AI' };
      showToast(`🧭 Mod Kunci Pandangan (${pNames[id] || id}): Halakan peranti ke arah pilihan dan tekan "Letak di Arah Ini".`);
    },

    pinPanelToScreen(id) {
      const p = this.panels.get(id);
      if (!p) return;
      p.placementMode = 'SCREEN_PINNED';
      p.isLocked = false;
      p.referenceQuaternion = null;
      p.anchorWorldVector = null;

      // Fasa 4F.1: Sync global state so hysteresis & lost detection know this panel is screen-pinned
      if (id === 'selbot' || ARState.activeModule === id) {
        ARState.isPinned = true;
        ARState.systemMode = SYSTEM_MODES.SCREEN_PINNED;
      }

      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.classList.remove('hidden');
        el.classList.add('is-visible');
        if (!el.style.left || el.style.left === '0px') {
          el.classList.add('is-centered');
          el.style.left = '50%';
          el.style.top = '50%';
          el.style.transform = 'translate(-50%, -50%)';
        }
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';
        el.setAttribute('data-placement-mode', 'SCREEN_PINNED');
      }

      this.syncPanelControlUI(id);

      const anyStillPOV = Array.from(this.panels.values()).some(
        (panel) => panel.isVisible && (panel.placementMode === 'POV_SETUP' || panel.placementMode === 'POV_LOCKED')
      );
      if (!anyStillPOV) {
        ARState.pov.active = false;
        ARState.pov.isAnchored = false;
        if (ARState.pov.rafId) {
          cancelAnimationFrame(ARState.pov.rafId);
          ARState.pov.rafId = null;
        }
        if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');
      }

      const pNames = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', selbot: 'SelBot AI' };
      showToast(`📌 Panel ${pNames[id] || id} disematkan pada skrin.`);
    },

    unpinPanelToMarker(id) {
      const p = this.panels.get(id);
      if (!p) return;
      p.placementMode = 'MARKER_FOLLOW';
      p.isLocked = false;
      p.referenceQuaternion = null;
      p.anchorWorldVector = null;

      // Fasa 4F.1: Reset global pinned state
      if (id === 'selbot' || ARState.activeModule === id) {
        ARState.isPinned = false;
        ARState.systemMode = SYSTEM_MODES.MARKER;
      }

      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.classList.remove('is-centered');
        el.setAttribute('data-placement-mode', 'MARKER_FOLLOW');
      }

      this.syncPanelControlUI(id);

      const pNames = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', selbot: 'SelBot AI' };
      showToast(`📱 Panel ${pNames[id] || id} kini mengikuti kad AR.`);
    },

    togglePinMode(id) {
      const p = this.panels.get(id);
      if (!p) return;
      if (p.placementMode === 'SCREEN_PINNED') {
        this.unpinPanelToMarker(id);
      } else {
        this.pinPanelToScreen(id);
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
        card.classList.add(`size-${size}`);
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
      if (id === 'kuiz') destroyKuizSession();
      if (id === 'selbot') destroySelbotSession();
    },

    getActivePanelsCount() {
      return (typeof ARState !== 'undefined' && ARState.activePanels) ? ARState.activePanels.size : (this.panels ? this.panels.size : 0);
    },

    setReferenceOrientation(id, quat, worldVector) {
      const p = this.panels.get(id);
      if (!p) return;
      p.referenceQuaternion = quat ? quat.clone() : null;
      p.anchorWorldVector = worldVector ? worldVector.clone() : null;
    },

    lockPanelPOV(id) {
      const p = this.panels.get(id);
      if (!p) return;
      initThreeHelpers();
      if (!ARState.pov.currentQuaternion) {
        ARState.pov.currentQuaternion = new window.THREE.Quaternion();
      }
      p.referenceQuaternion = ARState.pov.currentQuaternion.clone();
      if (window.THREE && _WORLD_FORWARD) {
        p.anchorWorldVector = _WORLD_FORWARD.clone().applyQuaternion(p.referenceQuaternion);
      } else if (window.THREE) {
        p.anchorWorldVector = new window.THREE.Vector3(0, 0, -1).applyQuaternion(p.referenceQuaternion);
      }
      p.anchorYaw = Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0;
      p.anchorPitch = Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0;
      p.placementMode = 'POV_LOCKED';
      p.isLocked = true;
      p.isVisible = true;

      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.classList.remove('is-centered', 'hidden');
        el.classList.add('is-visible');
        el.setAttribute('data-placement-mode', 'POV_LOCKED');
      }

      this.syncPanelControlUI(id);

      // Backward compatibility for single panel / global tests
      ARState.pov.isAnchored = true;
      ARState.pov.anchorQuaternion = p.referenceQuaternion.clone();
      ARState.pov.anchorWorldVector = p.anchorWorldVector.clone();
      ARState.pov.anchorYaw = p.anchorYaw;
      ARState.pov.anchorPitch = p.anchorPitch;
      ARState.systemMode = SYSTEM_MODES.POV_LOCKED;

      if (!ARState.pov.active) {
        ARState.pov.active = true;
        setupPOVSensorListeners();
        startPOVRenderLoop();
      }

      updateDiagnosticsData();
      const pNames = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', selbot: 'SelBot AI' };
      showToast(`🧭 Panel ${pNames[id] || id} dikunci pada ${Math.round(p.anchorYaw)}°!`);
    },

    unlockPanelPOV(id) {
      const p = this.panels.get(id);
      if (!p) return;
      p.placementMode = 'POV_SETUP';
      p.isLocked = false;
      p.referenceQuaternion = null;
      p.anchorWorldVector = null;

      const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
      if (el) {
        el.classList.add('is-centered');
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';
        el.setAttribute('data-placement-mode', 'POV_SETUP');
      }

      this.syncPanelControlUI(id);

      updateDiagnosticsData();
      const pNames = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', selbot: 'SelBot AI' };
      showToast(`🎯 Panel ${pNames[id] || id} sedia dialihkan ke arah baharu.`);
    },

    togglePanelLock(id) {
      const p = this.panels.get(id);
      if (!p) return;
      if (p.placementMode === 'POV_LOCKED') {
        this.unlockPanelPOV(id);
      } else {
        this.lockPanelPOV(id);
      }
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
  };

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
    if (!video) return;
    ARState.activeVideo = video;
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelLoaded('video', true);
      SpatialPanelManager.setPlaybackState('video', 'playing');
    }
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
            src="${embedUrl}?autoplay=1&enablejsapi=1&rel=0&playsinline=1" 
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
   * Return back to Selection List (Video or Nota)
   */
  function returnToSelectionList() {
    if (ARState.activeModule === 'kuiz') {
      if (GameSessionManager.isGameActive()) {
        closeEmbeddedGame();
        return;
      }
      if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
      if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
      if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.remove('hidden');
      if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
      if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');
      renderQuizSelectionList();
      renderPOVQuizCardsList();
    } else if (ARState.activeModule === 'nota') {
      if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
      if (DOM.notaSelectionView) DOM.notaSelectionView.classList.remove('hidden');
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.remove('hidden');
      renderNoteSelectionList();
      renderPOVNoteCardsList();
    } else if (ARState.activeModule === 'cellquest') {
      if (DOM.cellquestSelectionView) DOM.cellquestSelectionView.classList.remove('hidden');
      if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.remove('hidden');
    } else {
      // Clear video frame to stop playback sound
      if (DOM.playerFrame) DOM.playerFrame.innerHTML = '';
      if (DOM.povPlayerFrame) DOM.povPlayerFrame.innerHTML = '';
      ARState.activeVideo = null;

      if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
      if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'flex';
      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
      if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.remove('hidden');
    }
  }

  /**
   * ==============================================================================
   * FASA 4B: MODUL NOTA INTERAKTIF — CMS INTEGRATION, PARSER & ZOOM ENGINE
   * ==============================================================================
   */

  /**
   * Load real published notes from ARSELNEL CMS (with resilient local seeds fallback)
   */
  async function loadNotesFromCMS() {
    try {
      if (window.CMSAdapter && typeof window.CMSAdapter.getNotes === 'function') {
        let published = await window.CMSAdapter.getNotes({ status: 'published' });
        if (!Array.isArray(published) || published.length === 0) {
          published = await window.CMSAdapter.getNotes();
        }
        if (Array.isArray(published) && published.length > 0) {
          ARState.notes = published;
          console.log('[KotakAR] Loaded notes from CMSAdapter:', published.length);
          return;
        }
      }
    } catch (err) {
      console.warn('[KotakAR] CMSAdapter query for notes failed, falling back to local seeds:', err);
    }

    // High quality bundled seeds fallback
    ARState.notes = [
      {
        id: 'note_1',
        title: '1. Sel sebagai Unit Asas Kehidupan',
        chapter: 'Bab 2: Sel Sebagai Unit Asas',
        form: 'Tingkatan 1',
        readingTime: '5 Minit',
        description: 'Asal usul teori sel, penemuan Robert Hooke pada 1665, dan kepentingan sel dalam biologi moden.',
        content: `### Pengenalan Kepada Sel
Semua hidupan terdiri daripada unit asas mikroskopik yang dinamakan **sel**. Pada tahun 1665, saintis Inggeris Robert Hooke pertama kali memerhatikan rongga halus seperti sarang lebah pada hirisan gabus kayu menggunakan mikroskop ciptaannya.

#### Teras Teori Sel Moden:
1. Semua organisma hidup terdiri daripada satu atau lebih sel.
2. Sel merupakan unit struktur dan fungsi asas semua hidupan.
3. Sel baru terhasil daripada pembahagian sel sedia ada.

> Sel membolehkan organisma unisel seperti Amoeba sp. dan Paramecium sp. meneruskan kemandirian hidup walaupun hanya mempunyai satu sel tunggal.`,
        image: '../assets/nota/icon_topic1.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 342,
        displayOrder: 1
      },
      {
        id: 'note_2',
        title: '2. Struktur & Organel Sel Haiwan',
        chapter: 'Bab 2: Struktur Sel',
        form: 'Tingkatan 1',
        readingTime: '6 Minit',
        description: 'Analisis mendalam membran sel, sitoplasma, nukleus, serta peranan mitokondria dalam respirasi sel.',
        content: `### Ciri-Ciri Utama Sel Haiwan
Sel haiwan tidak mempunyai bentuk yang tetap kerana tidak disokong oleh dinding selulosa yang tegar.

#### Organel Penting Sel Haiwan:
* **Membran Plasma:** Lapisan separa telap yang mengawal keluar masuk bahan terlarut.
* **Nukleus:** Mengandungi kromosom (DNA) dan mengawal aktiviti sintesis kimia sel.
* **Sitoplasma:** Medium seperti jeli tempat berlakunya tindak balas biokimia.
* **Mitokondria:** Menghasilkan tenaga ATP melalui metabolisme glukosa respirasi aerob.
* **Vakuol Kecil:** Bertindak mengawal imbangan osmosis dan menyimpan bahan buangan.`,
        image: '../assets/nota/icon_topic2.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 520,
        displayOrder: 2
      },
      {
        id: 'note_3',
        title: '3. Struktur & Organel Sel Tumbuhan',
        chapter: 'Bab 2: Struktur Sel',
        form: 'Tingkatan 1',
        readingTime: '6 Minit',
        description: 'Meneroka fungsi dinding selulosa, kloroplas untuk fotosintesis, dan vakuol pusat yang besar.',
        content: `### Keistimewaan Sel Tumbuhan
Sel tumbuhan mempunyai struktur tegar yang membolehkan tumbuhan berdiri tegak tanpa rangka tulang.

#### Ciri Khas Sel Tumbuhan:
* **Dinding Sel:** Terbina daripada selulosa tegar untuk sokongan mekanikal dan bentuk tetap.
* **Kloroplas:** Mengandungi pigmen klorofil hijau bagi menyerap cahaya matahari untuk fotosintesis.
* **Vakuol Besar:** Dipenuhi sap sel yang mengekalkan kesegahan sel (tekanan turgor).
* **Nukleus & Mitokondria:** Mengawal pembahagian serta membekalkan tenaga sel.`,
        image: '../assets/nota/icon_topic2.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 418,
        displayOrder: 3
      },
      {
        id: 'note_4',
        title: '4. Perbezaan Sel Haiwan vs Sel Tumbuhan',
        chapter: 'Bab 2: Perbandingan Sel',
        form: 'Tingkatan 1',
        readingTime: '7 Minit',
        description: 'Jadual perbandingan ringkas antara sel haiwan dan tumbuhan dari segi bentuk, organel dan fungsi.',
        content: `### Jadual Perbandingan Sel Haiwan & Sel Tumbuhan

#### Persamaan:
Kedua-dua sel mempunyai **Nukleus**, **Sitoplasma**, **Membran Sel**, dan **Mitokondria**.

#### Perbezaan Utama:
* **Bentuk Sel:** Sel haiwan tidak tetap; Sel tumbuhan tetap bersegi.
* **Dinding Sel:** Tiada pada sel haiwan; Ada pada sel tumbuhan.
* **Kloroplas:** Tiada pada sel haiwan; Ada pada sel tumbuhan.
* **Vakuol:** Kecil atau tiada pada sel haiwan; Vakuol besar pada sel tumbuhan.
* **Simpanan Karbohidrat:** Glikogen (haiwan) vs Kanji (tumbuhan).`,
        image: '../assets/nota/icon_topic1.svg',
        contentType: 'interactive',
        publicationStatus: 'published',
        views: 610,
        displayOrder: 4
      }
    ];
  }

  /**
   * Fast, reliable Markdown parser for Notes
   */
  function parseNoteMarkdown(markdownText) {
    if (!markdownText) return '';
    let html = markdownText
      .replace(/^### (.*$)/gim, '<h3><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;color:#2dd4bf;">article</span> $1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

    // Wrap list items
    html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Convert double linebreaks to paragraphs
    const paragraphs = html.split(/\n\s*\n/).map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<ol')) {
        return p;
      }
      return `<p>${p}</p>`;
    }).join('\n');

    return paragraphs;
  }

  /**
   * Split note content into pages / slides with full support for HTML slides, Markdown, and images
   */
  function splitNoteIntoPages(note) {
    if (!note) return [''];

    // 1. If note has slides array
    if (Array.isArray(note.slides) && note.slides.length > 0) {
      return note.slides.map((s, idx) => {
        if (typeof s === 'string') return parseNoteMarkdown(s);

        // If slide contains rich HTML markup (e.g. from ARSelNel slide editor)
        if (s.contentHtml) {
          return s.contentHtml;
        }

        // Build structured slide display with enhanced typography & science card styling
        const pageNum = s.page || (idx + 1);
        const totalP = (note.slides && note.slides.length) || 1;
        const slideBadge = `<div class="nota-slide-header"><span class="nota-slide-badge"><span class="material-symbols-outlined" style="font-size:14px;">auto_stories</span> Slaid ${pageNum} / ${totalP}</span><span style="font-size:11px;color:#94a3b8;font-weight:600;">Sains KSSM</span></div>`;
        const slideTitle = s.title ? `<h3><span class="material-symbols-outlined" style="font-size:18px;color:#2dd4bf;">biotech</span> ${s.title}</h3>` : '';
        let body = '';
        if (s.content) {
          body = parseNoteMarkdown(s.content);
        } else if (s.text) {
          body = parseNoteMarkdown(s.text);
        } else if (s.subtitle) {
          body = `<p class="nota-slide-subtitle" style="color:#94a3b8;font-size:12px;margin-bottom:8px;">${s.subtitle}</p>`;
        }

        let img = '';
        if (s.imageUrl || s.image) {
          img = `<div class="nota-image-callout"><img src="${s.imageUrl || s.image}" alt="${s.title || 'Slaid'}"></div>`;
        }

        if (!body && !img) {
          body = `<p style="color:#94a3b8;font-style:italic;">Halaman Slaid ${pageNum}</p>`;
        }

        return `<div class="nota-slide-card">${slideBadge}${slideTitle}${img}${body}</div>`;
      });
    }

    // 2. If note has raw Markdown / text content
    const raw = (note.content || note.description || '').trim();
    if (raw) {
      const parts = raw.split(/(?=### )/);
      if (parts.length > 1) {
        return parts.map(part => parseNoteMarkdown(part.trim()));
      }
      return [parseNoteMarkdown(raw)];
    }

    return ['<p style="color:#94a3b8;font-style:italic;">Tiada kandungan teks terperinci disediakan untuk nota ini.</p>'];
  }

  /**
   * Render real PDF note using PDF.js onto responsive high-DPI canvas
   */
  async function loadAndRenderPdfNote(note, pageNumber = 1) {
    let pdfUrl = note.sourceUrl || note.storagePath;
    if (!pdfUrl) return false;

    // Use fast local cached slide copy if available for instant (<100ms) local response
    if (pdfUrl.includes('sel_tumbuhan_vs_sel_haiwan.pdf')) {
      pdfUrl = '../assets/slides/sel_tumbuhan_vs_sel_haiwan.pdf';
    }

    // Show PDF containers & hide others
    if (DOM.notaPdfContainer) DOM.notaPdfContainer.classList.remove('hidden');
    if (DOM.povNotaPdfContainer) DOM.povNotaPdfContainer.classList.remove('hidden');
    if (DOM.notaEmbedContainer) DOM.notaEmbedContainer.classList.add('hidden');
    if (DOM.povNotaEmbedContainer) DOM.povNotaEmbedContainer.classList.add('hidden');

    // Immediate slide preview if available so student NEVER sees an empty blank screen
    if (Array.isArray(note.slides) && note.slides.length > 0 && note.slides[pageNumber - 1]) {
      const s = note.slides[pageNumber - 1];
      const previewHtml = s.contentHtml || (s.title ? `<div class="nota-slide-card"><div class="nota-slide-header"><span class="nota-slide-badge">Slaid ${pageNumber} / ${note.slides.length}</span></div><h3>${s.title}</h3><p style="color:#94a3b8;font-size:12px;">${s.subtitle || ''}</p></div>` : '');
      if (previewHtml) {
        if (DOM.notaBodyRendered) {
          DOM.notaBodyRendered.innerHTML = previewHtml;
          DOM.notaBodyRendered.classList.remove('hidden');
        }
        if (DOM.povNotaBodyRendered) {
          DOM.povNotaBodyRendered.innerHTML = previewHtml;
          DOM.povNotaBodyRendered.classList.remove('hidden');
        }
      }
    } else {
      if (DOM.notaBodyRendered) DOM.notaBodyRendered.classList.add('hidden');
      if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.classList.add('hidden');
    }

    if (DOM.notaPdfLoading) DOM.notaPdfLoading.classList.remove('hidden');
    if (DOM.povNotaPdfLoading) DOM.povNotaPdfLoading.classList.remove('hidden');

    try {
      if (!window.pdfjsLib) {
        console.warn('[KotakAR] pdfjsLib not available, falling back to slides/embed');
        renderFallbackContent(note);
        return false;
      }

      if (window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../assets/vendor/pdfjs/pdf.worker.min.js';
      }

      if (!ARState.pdfDoc || ARState.pdfDoc._loadedUrl !== pdfUrl) {
        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        ARState.pdfDoc = await loadingTask.promise;
        ARState.pdfDoc._loadedUrl = pdfUrl;
        ARState.totalNotePages = ARState.pdfDoc.numPages;
        console.log('[KotakAR] PDF loaded successfully! Total pages:', ARState.totalNotePages);
      }

      await renderPdfCanvasPage(ARState.pdfDoc, pageNumber);

      // Successfully drawn PDF canvas: hide preview HTML and loading spinner
      if (DOM.notaBodyRendered) DOM.notaBodyRendered.classList.add('hidden');
      if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.classList.add('hidden');
      if (DOM.notaPdfLoading) DOM.notaPdfLoading.classList.add('hidden');
      if (DOM.povNotaPdfLoading) DOM.povNotaPdfLoading.classList.add('hidden');
      return true;
    } catch (err) {
      console.warn('[KotakAR] PDF.js rendering error, using slide/HTML fallback:', err);
      if (DOM.notaPdfLoading) DOM.notaPdfLoading.classList.add('hidden');
      if (DOM.povNotaPdfLoading) DOM.povNotaPdfLoading.classList.add('hidden');
      renderFallbackContent(note);
      return false;
    }
  }

  async function renderPdfCanvasPage(pdfDoc, pageNumber) {
    if (!pdfDoc) return;
    const targetPage = Math.max(1, Math.min(pdfDoc.numPages, pageNumber));
    const page = await pdfDoc.getPage(targetPage);

    // Cancel any in-flight render task to prevent collision
    if (ARState._pdfRenderTask) {
      try { ARState._pdfRenderTask.cancel(); } catch (_) {}
      ARState._pdfRenderTask = null;
    }

    if (DOM.notaPdfCanvas) {
      await renderSinglePdfCanvas(page, DOM.notaPdfCanvas);
    }
    if (DOM.povNotaPdfCanvas && DOM.povActiveNotaView && !DOM.povActiveNotaView.classList.contains('hidden')) {
      await renderSinglePdfCanvas(page, DOM.povNotaPdfCanvas);
    }
  }

  async function renderSinglePdfCanvas(page, canvas) {
    if (!canvas) return;
    const container = canvas.parentElement || canvas;
    const containerW = (container.clientWidth > 60) ? container.clientWidth : (DOM.floatingCard ? DOM.floatingCard.clientWidth - 36 : 420);

    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const baseScale = Math.min(2.5, Math.max(0.4, (containerW - 8) / unscaledViewport.width));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const finalScale = baseScale * ARState.noteZoom * dpr;

    const viewport = page.getViewport({ scale: finalScale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;

    const ctx = canvas.getContext('2d');
    const renderTask = page.render({
      canvasContext: ctx,
      viewport: viewport
    });
    ARState._pdfRenderTask = renderTask;
    try {
      await renderTask.promise;
    } catch (err) {
      if (err && err.name === 'RenderingCancelledException') return;
      throw err;
    } finally {
      if (ARState._pdfRenderTask === renderTask) {
        ARState._pdfRenderTask = null;
      }
    }
  }

  function renderFallbackContent(note) {
    if (DOM.notaPdfContainer) DOM.notaPdfContainer.classList.add('hidden');
    if (DOM.povNotaPdfContainer) DOM.povNotaPdfContainer.classList.add('hidden');
    if (DOM.notaEmbedContainer) DOM.notaEmbedContainer.classList.add('hidden');
    if (DOM.povNotaEmbedContainer) DOM.povNotaEmbedContainer.classList.add('hidden');
    if (DOM.notaBodyRendered) DOM.notaBodyRendered.classList.remove('hidden');
    if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.classList.remove('hidden');

    ARState.noteSections = splitNoteIntoPages(note);
    ARState.totalNotePages = Math.max(1, ARState.noteSections.length);
    const content = ARState.noteSections[ARState.currentNotePage - 1] || '';
    if (DOM.notaBodyRendered) DOM.notaBodyRendered.innerHTML = content;
    if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.innerHTML = content;
  }

  function renderEmbedNote(note) {
    if (DOM.notaPdfContainer) DOM.notaPdfContainer.classList.add('hidden');
    if (DOM.povNotaPdfContainer) DOM.povNotaPdfContainer.classList.add('hidden');
    if (DOM.notaBodyRendered) DOM.notaBodyRendered.classList.add('hidden');
    if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.classList.add('hidden');

    let src = note.sourceUrl || '';
    if (DOM.notaEmbedContainer) DOM.notaEmbedContainer.classList.remove('hidden');
    if (DOM.notaEmbedFrame && DOM.notaEmbedFrame.src !== src) DOM.notaEmbedFrame.src = src;

    if (DOM.povNotaEmbedContainer) DOM.povNotaEmbedContainer.classList.remove('hidden');
    if (DOM.povNotaEmbedFrame && DOM.povNotaEmbedFrame.src !== src) DOM.povNotaEmbedFrame.src = src;
  }

  function renderHtmlNoteContent() {
    if (DOM.notaPdfContainer) DOM.notaPdfContainer.classList.add('hidden');
    if (DOM.povNotaPdfContainer) DOM.povNotaPdfContainer.classList.add('hidden');
    if (DOM.notaEmbedContainer) DOM.notaEmbedContainer.classList.add('hidden');
    if (DOM.povNotaEmbedContainer) DOM.povNotaEmbedContainer.classList.add('hidden');
    if (DOM.notaBodyRendered) DOM.notaBodyRendered.classList.remove('hidden');
    if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.classList.remove('hidden');

    const pageContent = ARState.noteSections[ARState.currentNotePage - 1] || '';
    if (DOM.notaBodyRendered) DOM.notaBodyRendered.innerHTML = pageContent;
    if (DOM.povNotaBodyRendered) DOM.povNotaBodyRendered.innerHTML = pageContent;

    applyNoteZoom();
  }

  /**
   * Update header, chapter badge, type badge, page indicators, and external fullscreen links
   */
  function updateNoteHeaderAndBadges(note) {
    if (!note) return;
    const cType = (note.contentType || 'interactive').toUpperCase();
    const timeStr = note.readingTime || (Math.max(3, Math.round((ARState.totalNotePages || 5) * 1.5)) + ' Minit');

    if (DOM.notaTitle) DOM.notaTitle.textContent = note.title;
    if (DOM.notaChapterBadge) DOM.notaChapterBadge.textContent = note.chapter || 'Bab 2';
    if (DOM.notaTimeText) DOM.notaTimeText.textContent = timeStr;
    if (DOM.notaTypeBadge) {
      DOM.notaTypeBadge.textContent = cType;
      DOM.notaTypeBadge.className = `nota-type-badge ${cType === 'INTERACTIVE' ? 'type-interactive' : ''}`;
    }

    if (DOM.povNotaTitle) DOM.povNotaTitle.textContent = note.title;
    if (DOM.povNotaChapterBadge) DOM.povNotaChapterBadge.textContent = note.chapter || 'Bab 2';
    if (DOM.povNotaTimeText) DOM.povNotaTimeText.textContent = timeStr;
    if (DOM.povNotaTypeBadge) {
      DOM.povNotaTypeBadge.textContent = cType;
      DOM.povNotaTypeBadge.className = `nota-type-badge ${cType === 'INTERACTIVE' ? 'type-interactive' : ''}`;
    }

    const pageText = `Halaman ${ARState.currentNotePage} / ${ARState.totalNotePages}`;
    if (DOM.notaPageIndicator) DOM.notaPageIndicator.textContent = pageText;
    if (DOM.povNotaPageIndicator) DOM.povNotaPageIndicator.textContent = pageText;

    if (DOM.btnNotaPrev) DOM.btnNotaPrev.disabled = (ARState.currentNotePage <= 1);
    if (DOM.btnNotaNext) DOM.btnNotaNext.disabled = (ARState.currentNotePage >= ARState.totalNotePages);
    if (DOM.povBtnNotaPrev) DOM.povBtnNotaPrev.disabled = (ARState.currentNotePage <= 1);
    if (DOM.povBtnNotaNext) DOM.povBtnNotaNext.disabled = (ARState.currentNotePage >= ARState.totalNotePages);

    // Fullscreen interactive slide URL
    const fullUrl = `../nota_pembelajaran/slaid_interaktif.html?id=${encodeURIComponent(note.id)}`;
    if (DOM.btnNotaOpenFull) DOM.btnNotaOpenFull.href = fullUrl;
    if (DOM.povBtnNotaOpenFull) DOM.povBtnNotaOpenFull.href = fullUrl;
  }

  /**
   * Render Note Selection List in Floating Panel
   */
  function renderNoteSelectionList() {
    if (!DOM.notaCardsScroll) return;
    DOM.notaCardsScroll.innerHTML = '';

    if (!Array.isArray(ARState.notes) || ARState.notes.length === 0) {
      DOM.notaCardsScroll.innerHTML = `
        <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">
          <span class="material-symbols-outlined" style="font-size:36px;color:#2dd4bf;margin-bottom:8px;">menu_book</span>
          <p>Tiada nota pembelajaran ditemui. Sila semak sambungan CMS.</p>
        </div>
      `;
      return;
    }

    ARState.notes.forEach(note => {
      const card = document.createElement('div');
      card.className = `nota-item-card ${ARState.activeNote && ARState.activeNote.id === note.id ? 'is-active' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      const timeStr = note.readingTime || (Math.max(3, Math.round((note.slideCount || 5) * 1.5)) + ' Minit');
      card.innerHTML = `
        <div class="nota-card-icon-wrap">
          <span class="material-symbols-outlined" style="font-size:22px;">auto_stories</span>
        </div>
        <div class="nota-card-meta">
          <div class="nota-card-badges">
            <span class="nota-card-chapter">${note.chapter || 'Bab 2'}</span>
            <span class="nota-card-time">⏱️ ${timeStr}</span>
          </div>
          <div class="nota-card-title">${note.title}</div>
          <div class="nota-card-desc">${note.description || ''}</div>
        </div>
      `;

      card.addEventListener('click', () => selectNote(note));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNote(note);
        }
      });

      DOM.notaCardsScroll.appendChild(card);
    });
  }

  /**
   * Render Note Selection List in POV Mode
   */
  function renderPOVNoteCardsList() {
    if (!DOM.povNotaCardsScroll) return;
    DOM.povNotaCardsScroll.innerHTML = '';

    if (!Array.isArray(ARState.notes) || ARState.notes.length === 0) {
      DOM.povNotaCardsScroll.innerHTML = `
        <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">
          <span class="material-symbols-outlined" style="font-size:36px;color:#2dd4bf;margin-bottom:8px;">menu_book</span>
          <p>Tiada nota pembelajaran ditemui.</p>
        </div>
      `;
      return;
    }

    ARState.notes.forEach(note => {
      const card = document.createElement('div');
      card.className = `nota-item-card ${ARState.activeNote && ARState.activeNote.id === note.id ? 'is-active' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      const timeStr = note.readingTime || (Math.max(3, Math.round((note.slideCount || 5) * 1.5)) + ' Minit');
      card.innerHTML = `
        <div class="nota-card-icon-wrap">
          <span class="material-symbols-outlined" style="font-size:22px;">auto_stories</span>
        </div>
        <div class="nota-card-meta">
          <div class="nota-card-badges">
            <span class="nota-card-chapter">${note.chapter || 'Bab 2'}</span>
            <span class="nota-card-time">⏱️ ${timeStr}</span>
          </div>
          <div class="nota-card-title">${note.title}</div>
          <div class="nota-card-desc">${note.description || ''}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        selectNote(note);
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
      });

      DOM.povNotaCardsScroll.appendChild(card);
    });
  }

  /**
   * Select a note and display in reader view
   */
  function selectNote(note, preserveZoom = true) {
    if (!note) return;
    ARState.activeNote = note;
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelLoaded('nota', true);
    }
    if (!preserveZoom) ARState.noteZoom = 1.0;
    ARState.currentNotePage = 1;

    const isPdf = note.contentType === 'pdf' || 
      (note.sourceUrl && note.sourceUrl.toLowerCase().endsWith('.pdf')) ||
      (note.storagePath && note.storagePath.toLowerCase().endsWith('.pdf'));

    const isEmbed = note.contentType === 'google_slides' || note.contentType === 'embed';

    if (isPdf) {
      ARState.totalNotePages = note.slideCount || 1;
      loadAndRenderPdfNote(note, 1);
    } else if (isEmbed) {
      ARState.totalNotePages = 1;
      renderEmbedNote(note);
    } else {
      // Interactive slides or text markdown
      ARState.noteSections = splitNoteIntoPages(note);
      ARState.totalNotePages = Math.max(1, ARState.noteSections.length);
      renderHtmlNoteContent();
    }

    updateNoteHeaderAndBadges(note);

    // Toggle views
    if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
    if (DOM.activeNotaView) DOM.activeNotaView.classList.remove('hidden');

    if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
    if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');

    // Update Phase 3 buttons
    if (!ARState.isPinned) {
      if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.remove('hidden');
      if (DOM.btnLockVideo) DOM.btnLockVideo.classList.add('hidden');
    } else {
      if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.add('hidden');
      if (DOM.btnLockVideo) DOM.btnLockVideo.classList.remove('hidden');
    }

    requestAnimationFrame(() => {
      clampPanelIntoViewport();
    });

    showToast(`Nota dipilih: ${note.title}`);
  }

  /**
   * Render note content in standard floating panel
   */
  function renderNoteContent() {
    const note = ARState.activeNote;
    if (!note) return;

    updateNoteHeaderAndBadges(note);

    const isPdf = note.contentType === 'pdf' || 
      (note.sourceUrl && note.sourceUrl.toLowerCase().endsWith('.pdf')) ||
      (note.storagePath && note.storagePath.toLowerCase().endsWith('.pdf'));

    if (isPdf && ARState.pdfDoc) {
      renderPdfCanvasPage(ARState.pdfDoc, ARState.currentNotePage);
    } else if (note.contentType === 'google_slides' || note.contentType === 'embed') {
      renderEmbedNote(note);
    } else {
      renderHtmlNoteContent();
    }
  }

  /**
   * Sync note content to POV panel
   */
  function syncPOVNoteContent() {
    renderNoteContent();
  }

  /**
   * Zoom controls for Note
   */
  function zoomInNote() {
    ARState.noteZoom = Math.min(2.0, parseFloat((ARState.noteZoom + 0.15).toFixed(2)));
    applyNoteZoom();
  }

  function zoomOutNote() {
    ARState.noteZoom = Math.max(0.75, parseFloat((ARState.noteZoom - 0.15).toFixed(2)));
    applyNoteZoom();
  }

  function resetZoomNote() {
    ARState.noteZoom = 1.0;
    applyNoteZoom();
  }

  function applyNoteZoom() {
    const pct = Math.round(ARState.noteZoom * 100) + '%';
    if (DOM.notaZoomText) DOM.notaZoomText.textContent = pct;
    if (DOM.povNotaZoomText) DOM.povNotaZoomText.textContent = pct;

    const note = ARState.activeNote;
    const isPdf = note && (note.contentType === 'pdf' || 
      (note.sourceUrl && note.sourceUrl.toLowerCase().endsWith('.pdf')) ||
      (note.storagePath && note.storagePath.toLowerCase().endsWith('.pdf')));

    if (isPdf && ARState.pdfDoc) {
      renderPdfCanvasPage(ARState.pdfDoc, ARState.currentNotePage);
    } else {
      if (DOM.notaBodyRendered) {
        DOM.notaBodyRendered.style.fontSize = `${13 * ARState.noteZoom}px`;
        DOM.notaBodyRendered.style.lineHeight = `${1.65 * ARState.noteZoom}`;
      }
      if (DOM.povNotaBodyRendered) {
        DOM.povNotaBodyRendered.style.fontSize = `${13 * ARState.noteZoom}px`;
        DOM.povNotaBodyRendered.style.lineHeight = `${1.65 * ARState.noteZoom}`;
      }
    }
  }

  /**
   * Pagination for Note
   */
  function prevNotePage() {
    if (ARState.currentNotePage > 1) {
      ARState.currentNotePage--;
      handleNotePageChange();
    }
  }

  function nextNotePage() {
    if (ARState.currentNotePage < ARState.totalNotePages) {
      ARState.currentNotePage++;
      handleNotePageChange();
    }
  }

  function handleNotePageChange() {
    const note = ARState.activeNote;
    if (!note) return;

    const isPdf = note.contentType === 'pdf' || 
      (note.sourceUrl && note.sourceUrl.toLowerCase().endsWith('.pdf')) ||
      (note.storagePath && note.storagePath.toLowerCase().endsWith('.pdf'));

    if (isPdf && ARState.pdfDoc) {
      renderPdfCanvasPage(ARState.pdfDoc, ARState.currentNotePage);
    } else {
      renderHtmlNoteContent();
    }

    updateNoteHeaderAndBadges(note);

    requestAnimationFrame(() => {
      clampPanelIntoViewport();
    });
  }

  /**
   * ==============================================================================
   * FASA 4C: MODUL KUIZ & PERMAINAN INTERAKTIF — CMS INTEGRATION & GAME LAUNCHER
   * ==============================================================================
   */

  /**
   * Load real published quizzes from ARSELNEL CMS (No synthetic dummy fallback)
   */
  async function loadQuizzesFromCMS() {
    let rawQuizzes = null;

    // 1. Query CMSAdapter (Supabase or official local CMS cache)
    try {
      if (window.CMSAdapter && typeof window.CMSAdapter.getQuizzes === 'function') {
        let published = await window.CMSAdapter.getQuizzes({ status: 'published' });
        if (!Array.isArray(published) || published.length === 0) {
          published = await window.CMSAdapter.getQuizzes();
        }
        if (Array.isArray(published) && published.length > 0) {
          const valid = published.filter(q => q.publicationStatus === 'published' || !q.publicationStatus);
          if (valid.length > 0) {
            rawQuizzes = valid;
          }
        }
      }
    } catch (err) {
      console.warn('[KotakAR] Ralat mendapatkan kuiz dari CMSAdapter:', err);
    }

    // 2. Fallback to localStorage official CMS storage cache if network failed
    if (!rawQuizzes || rawQuizzes.length === 0) {
      try {
        const cached = localStorage.getItem('arselnel_cms_quizzes');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawQuizzes = parsed.filter(q => q.publicationStatus === 'published' || !q.publicationStatus);
          }
        }
      } catch (_) {}
    }

    // 3. Fallback to demo quizzes storage cache if active
    if (!rawQuizzes || rawQuizzes.length === 0) {
      try {
        const demo = localStorage.getItem('arselnel_demo_quizzes');
        if (demo) {
          const parsedDemo = JSON.parse(demo);
          if (Array.isArray(parsedDemo) && parsedDemo.length > 0) {
            rawQuizzes = parsedDemo.filter(q => q.publicationStatus === 'published' || !q.publicationStatus);
          }
        }
      } catch (_) {}
    }

    if (Array.isArray(rawQuizzes) && rawQuizzes.length > 0) {
      ARState.quizzes = normalizeQuizzes(rawQuizzes);
      console.log('[KotakAR] Berjaya memuatkan kuiz CMS ARSELNEL:', ARState.quizzes.length);
    } else {
      // Clean empty state: Do NOT inject fake mockup questions!
      ARState.quizzes = [];
      console.warn('[KotakAR] Tiada kuiz diterbitkan ditemui dalam CMS ARSELNEL.');
    }

    loadGamesCatalog();
    return ARState.quizzes;
  }

  /**
   * Catalog of 5 original ARSELNEL interactive games (Matching hab_permainan)
   */
  function loadGamesCatalog() {
    ARState.games = [
      {
        id: 'labelkan_organel',
        title: 'Labelkan Organel',
        description: 'Tarik dan lepas nama organel pada gambar sel haiwan dan tumbuhan dengan betul.',
        topic: 'Struktur Sel',
        topicIcon: 'science',
        theme: 'emerald',
        difficulty: 'Sederhana',
        diffClass: 'amber',
        diffIcon: 'speed',
        points: '+150 Mata',
        duration: '3 minit',
        thumbnail: '../assets/game/game_label.svg',
        typeBadge: 'Interaktif',
        typeIcon: 'touch_app',
        route: '../games/labelkan-organel.html'
      },
      {
        id: 'maze_chase',
        title: 'Maze Chase: Misi Sel Haiwan & Tumbuhan',
        description: 'Terokai maze 2D, cari jawapan yang betul dan elakkan virus yang mengejar anda! Uji pengetahuan tentang sel haiwan dan sel tumbuhan melalui 10 cabaran interaktif.',
        topic: 'MAZE CHASE 2D',
        topicIcon: 'sports_esports',
        theme: 'indigo',
        difficulty: 'MENCABAR',
        diffClass: 'rose',
        diffIcon: 'bolt',
        points: '+1000 Mata',
        duration: '5 minit',
        thumbnail: '../assets/game/game_maze_chase.svg',
        thumbBoxClass: 'dark-thumb',
        typeBadge: 'Kejar Arked 2D',
        typeIcon: 'sports_esports',
        route: '../games/klasifikasi-sel.html'
      },
      {
        id: 'susun_organisasi',
        title: 'Susun Organisasi Kehidupan',
        description: 'Susun urutan organisasi kehidupan bermula dari sel, tisu, organ, sistem hingga organisma.',
        topic: 'Organisasi Sel',
        topicIcon: 'account_tree',
        theme: 'purple',
        difficulty: 'Sukar',
        diffClass: 'rose',
        diffIcon: 'speed',
        points: '+200 Mata',
        duration: '4 minit',
        thumbnail: '../assets/game/game_sequence.svg',
        typeBadge: 'Interaktif',
        typeIcon: 'touch_app',
        route: '../games/organisasi-kehidupan.html'
      },
      {
        id: 'kuiz_saintis_muda',
        title: 'Kuiz Saintis Muda',
        description: 'Jawab soalan objektif rawak tentang keseluruhan bab sel dalam masa terpantas.',
        topic: 'Kuiz Rawak',
        topicIcon: 'quiz',
        theme: 'amber',
        difficulty: 'Sederhana',
        diffClass: 'amber',
        diffIcon: 'speed',
        points: '+250 Mata',
        duration: '5 minit',
        thumbnail: '../assets/game/game_quiz.svg',
        typeBadge: 'Interaktif',
        typeIcon: 'touch_app',
        route: '../kuiz_interaktif/code.html'
      },
      {
        id: 'misi_makmal_sains',
        title: 'Misi Makmal Sains',
        subBadge: true,
        subBadgeText: 'Eksplorasi Baharu',
        subBadgeDesc: 'Operasi Kemas Makmal',
        description: 'Bantu cikgu mengemas makmal sains! Terokai makmal 2D, elakkan halangan, kumpulkan 10 peralatan dan jawab soalan tentang sel haiwan serta sel tumbuhan sebelum membuka pintu keluar.',
        topic: 'Pengembaraan Makmal 2D',
        topicIcon: 'science',
        theme: 'teal',
        difficulty: 'Mencabar',
        diffClass: 'rose',
        diffIcon: 'bolt',
        points: 'Sehingga +1000 Mata',
        duration: '10 Peralatan • 10 Soalan',
        thumbnail: '../assets/game/game_lab_mission.svg',
        typeBadge: 'Pengembaraan Penuh 2D Dalam Makmal',
        typeIcon: 'sports_esports',
        route: '../games/misi-makmal-sains.html'
      }
    ];
  }

  /**
   * Normalize quiz items for robust execution
   */
  function normalizeQuizzes(list) {
    if (!Array.isArray(list)) return [];
    return list.map((q, idx) => {
      let opts = [];
      if (Array.isArray(q.options)) {
        opts = q.options.map((opt, oIdx) => {
          if (typeof opt === 'string') {
            const letter = String.fromCharCode(65 + oIdx);
            return { label: letter, text: opt };
          } else if (opt && typeof opt === 'object') {
            return {
              label: opt.label || String.fromCharCode(65 + oIdx),
              text: opt.text || opt.title || ''
            };
          }
          return { label: String.fromCharCode(65 + oIdx), text: String(opt) };
        });
      }
      return {
        id: q.id || `quiz_${idx + 1}`,
        title: q.title || `Soalan ${idx + 1}`,
        topic: q.topic || 'Sains Tingkatan 1',
        type: q.type || 'mcq',
        question: q.question || '',
        options: opts,
        correctAnswer: (q.correctAnswer || q.correct_answer || 'A').toString().trim().toUpperCase(),
        points: Number(q.points) || 10,
        difficulty: q.difficulty || 'Sederhana',
        explanation: q.explanation || 'Jawapan telah disahkan mengikut silibus KSSM.',
        image: q.image || ''
      };
    });
  }

  /**
   * Render Quiz selection list in standard floating panel
   */
  /**
   * Helper to create a rich 5-game card element matching hab_permainan
   */
  function createGameCardElement(game) {
    const card = document.createElement('div');
    card.className = `arselnel-game-card theme-${game.theme || 'indigo'}`;
    card.tabIndex = 0;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `Permainan: ${game.title}`);

    card.innerHTML = `
      <div class="game-card-meta-top">
        <div class="game-meta-tags">
          <span class="tag-badge tag-${game.theme || 'indigo'}">
            <span class="material-symbols-outlined">${game.topicIcon || 'science'}</span>
            <span>${game.topic}</span>
          </span>
          <span class="tag-badge tag-diff diff-${game.diffClass || 'amber'}">
            <span class="material-symbols-outlined">${game.diffIcon || 'speed'}</span>
            <span>${game.difficulty}</span>
          </span>
        </div>
        <div class="game-rewards-chips">
          <span class="reward-chip pts-chip">
            <span class="material-symbols-outlined fill-star">stars</span>
            <span>${game.points}</span>
          </span>
          <span class="reward-chip time-chip">
            <span class="material-symbols-outlined">timer</span>
            <span>${game.duration}</span>
          </span>
        </div>
      </div>

      <div class="game-card-body-mid">
        <div class="game-text-content">
          ${game.subBadge ? `
            <div class="game-sub-badge">
              <span class="badge-pill">${game.subBadgeText || 'Eksplorasi Baharu'}</span>
              <span class="sub-text">${game.subBadgeDesc || 'Operasi Kemas Makmal'}</span>
            </div>
          ` : ''}
          <h4 class="game-title">${game.title}</h4>
          <p class="game-desc">${game.description}</p>
        </div>
        <div class="game-thumb-box ${game.thumbBoxClass || ''}">
          <img src="${game.thumbnail}" class="game-thumb-img" alt="${game.title}" loading="lazy" />
        </div>
      </div>

      <div class="game-card-action-bar">
        <span class="game-type-pill">
          <span class="material-symbols-outlined">${game.typeIcon || 'touch_app'}</span>
          <span>${game.typeBadge || 'Interaktif'}</span>
        </span>
        <button type="button" class="btn-launch-game btn-${game.theme || 'indigo'}" aria-label="Main sekarang: ${game.title}">
          <span>Main Sekarang</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    `;

    // Click handler for launch button
    const btn = card.querySelector('.btn-launch-game');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        launchInteractiveGame(game);
      });
    }

    // Clicking card itself also launches the game
    card.addEventListener('click', () => {
      launchInteractiveGame(game);
    });

    return card;
  }

  /**
   * Fasa 4C.3: Create Minimalist 5-Game Row Element
   * Crisp, high-contrast single row: [Number] + [Title] + [Play Icon]
   * Strips bloated tags, badges, points, duration, and SVG images for mobile clarity.
   */
  function createMinimalGameRowElement(game, index) {
    const row = document.createElement('div');
    const themeClass = `theme-${game.theme || 'indigo'}`;
    row.className = `minimal-game-row ${themeClass}`;
    row.setAttribute('data-game-id', game.id);
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-label', `Main ${game.title}`);

    const num = (index + 1);
    row.innerHTML = `
      <div class="minimal-game-left">
        <span class="minimal-num-badge">${num}</span>
        <span class="minimal-game-title">${game.title}</span>
      </div>
      <button type="button" class="btn-minimal-play" aria-label="Main ${game.title}">
        <span>Main</span>
        <span class="material-symbols-outlined icon-play">play_arrow</span>
      </button>
    `;

    // Click handler on row or button initiates embedded gameplay
    const handleLaunch = (e) => {
      if (e) e.stopPropagation();
      startEmbeddedGame(game);
    };

    row.addEventListener('click', handleLaunch);
    const playBtn = row.querySelector('.btn-minimal-play');
    if (playBtn) playBtn.addEventListener('click', handleLaunch);

    // Keyboard accessibility (Enter/Space)
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleLaunch(e);
      }
    });

    return row;
  }

  /**
   * Render the 5 original ARSELNEL games in Floating AR Panel (Minimalist Rows)
   */
  function render5GamesCatalog() {
    // 🛡️ ISOLATION: If game is actively playing, never overwrite running game with catalog!
    if (GameSessionManager.isGameActive()) {
      console.log('[KotakAR] 🛡️ Permainan aktif, render5GamesCatalog ditangguhkan.');
      return;
    }
    if (!DOM.kuizCardsScroll) return;
    DOM.kuizCardsScroll.innerHTML = '';
    if (!ARState.games || ARState.games.length === 0) {
      loadGamesCatalog();
    }
    ARState.games.forEach((game, index) => {
      DOM.kuizCardsScroll.appendChild(createMinimalGameRowElement(game, index));
    });
  }

  /**
   * Render the 5 original ARSELNEL games in POV Panel (Minimalist Rows)
   */
  function renderPOV5GamesCatalog() {
    // 🛡️ ISOLATION: If game is actively playing, never overwrite running game with catalog!
    if (GameSessionManager.isGameActive()) {
      console.log('[KotakAR] 🛡️ Permainan aktif, renderPOV5GamesCatalog ditangguhkan.');
      return;
    }
    if (!DOM.povKuizCardsScroll) return;
    DOM.povKuizCardsScroll.innerHTML = '';
    if (!ARState.games || ARState.games.length === 0) {
      loadGamesCatalog();
    }
    ARState.games.forEach((game, index) => {
      DOM.povKuizCardsScroll.appendChild(createMinimalGameRowElement(game, index));
    });
  }

  /**
   * Fasa 4C.3 & 4C.4: Start Embedded AR Game
   * Runs the original game inside the Floating AR Panel without interrupting WebAR camera/tracking!
   * Enforces GameSessionManager state machine to prevent unwanted catalog resets.
   */
  function startEmbeddedGame(game) {
    if (!game || !game.route) return;
    console.log('[KotakAR] 🎮 Memulakan Embedded AR Game:', game.title, game.route);

    GameSessionManager.setSessionState(GameSessionManager.State.GAME_LOADING, {
      gameId: game.id,
      route: game.route,
      panelMode: (ARState.systemMode === SYSTEM_MODES.POV || ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) ? 'pov' : (ARState.isPinned ? 'pinned' : 'floating')
    });

    ARState.activeGame = game;
    if (window.ARSessionRecoveryManager) {
      window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.GAME_ACTIVE, { game: game.id });
    }

    const sep = game.route.includes('?') ? '&' : '?';
    const embeddedUrl = `${game.route}${sep}from=kotak_ar&embedded=true`;

    const isPOV = (ARState.systemMode === SYSTEM_MODES.POV || 
                   ARState.systemMode === SYSTEM_MODES.POV_SETUP || 
                   ARState.systemMode === SYSTEM_MODES.POV_LOCKED ||
                   (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible('kuiz')) ||
                   (DOM.povPanelKuiz && !DOM.povPanelKuiz.classList.contains('hidden')));

    if (isPOV) {
      // Setup POV embedded game view
      if (DOM.povEmbeddedGameTitle) DOM.povEmbeddedGameTitle.textContent = game.title;
      if (DOM.povEmbeddedGameIcon) DOM.povEmbeddedGameIcon.textContent = game.typeIcon || 'sports_esports';
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
      if (DOM.povEmbeddedGameView) DOM.povEmbeddedGameView.classList.remove('hidden');
      if (DOM.povEmbeddedGameLoading) DOM.povEmbeddedGameLoading.classList.remove('hidden');

      if (DOM.povEmbeddedGameIframe) {
        GameSessionManager.activeIframe = DOM.povEmbeddedGameIframe;
        DOM.povEmbeddedGameIframe.onload = () => {
          if (DOM.povEmbeddedGameIframe.src && !DOM.povEmbeddedGameIframe.src.includes('about:blank')) {
            if (DOM.povEmbeddedGameLoading) DOM.povEmbeddedGameLoading.classList.add('hidden');
            GameSessionManager.setSessionState(GameSessionManager.State.GAME_ACTIVE);
          }
        };
        DOM.povEmbeddedGameIframe.onerror = () => {
          GameSessionManager.setSessionState(GameSessionManager.State.ERROR);
          showToast('❌ Ralat memuatkan permainan.');
        };
        DOM.povEmbeddedGameIframe.src = embeddedUrl;
      }
    } else {
      // Setup Standard Floating embedded game view
      if (DOM.embeddedGameTitle) DOM.embeddedGameTitle.textContent = game.title;
      if (DOM.embeddedGameIcon) DOM.embeddedGameIcon.textContent = game.typeIcon || 'sports_esports';
      if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
      if (DOM.embeddedGameView) DOM.embeddedGameView.classList.remove('hidden');
      if (DOM.embeddedGameLoading) DOM.embeddedGameLoading.classList.remove('hidden');

      if (DOM.embeddedGameIframe) {
        GameSessionManager.activeIframe = DOM.embeddedGameIframe;
        DOM.embeddedGameIframe.onload = () => {
          if (DOM.embeddedGameIframe.src && !DOM.embeddedGameIframe.src.includes('about:blank')) {
            if (DOM.embeddedGameLoading) DOM.embeddedGameLoading.classList.add('hidden');
            GameSessionManager.setSessionState(GameSessionManager.State.GAME_ACTIVE);
          }
        };
        DOM.embeddedGameIframe.onerror = () => {
          GameSessionManager.setSessionState(GameSessionManager.State.ERROR);
          showToast('❌ Ralat memuatkan permainan.');
        };
        DOM.embeddedGameIframe.src = embeddedUrl;
      }
    }

    showToast(`🎮 Permainan "${game.title}" sedia!`, 2000);
  }

  /**
   * Fasa 4C.3 & 4C.4: Close Embedded Game and safely return to catalog
   * Discharges iframe memory, silences game audio, and restores selection list.
   */
  function closeEmbeddedGame() {
    console.log('[KotakAR] 🔙 Menutup Embedded AR Game dan kembali ke senarai permainan.');
    GameSessionManager.setSessionState(GameSessionManager.State.GAME_CLOSING);
    ARState.activeGame = null;

    // Reset iframe sources to immediately stop scripts, requestAnimationFrame, and audio contexts
    if (DOM.embeddedGameIframe) {
      DOM.embeddedGameIframe.onload = null;
      DOM.embeddedGameIframe.onerror = null;
      DOM.embeddedGameIframe.src = 'about:blank';
    }
    if (DOM.povEmbeddedGameIframe) {
      DOM.povEmbeddedGameIframe.onload = null;
      DOM.povEmbeddedGameIframe.onerror = null;
      DOM.povEmbeddedGameIframe.src = 'about:blank';
    }

    // Remove focus mode / maximized if active
    if (DOM.floatingCard) {
      DOM.floatingCard.classList.remove('is-focus-mode', 'is-maximized');
    }
    if (DOM.povCard) {
      DOM.povCard.classList.remove('is-focus-mode', 'is-maximized');
    }
    updateFocusButtonState(false);

    // Hide embedded game views
    if (DOM.embeddedGameView) DOM.embeddedGameView.classList.add('hidden');
    if (DOM.povEmbeddedGameView) DOM.povEmbeddedGameView.classList.add('hidden');

    // Restore games catalog selection list
    if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.remove('hidden');
    if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');

    GameSessionManager.setSessionState(GameSessionManager.State.CATALOG_ACTIVE, { gameId: null, route: null, iframe: null });

    if (window.ARSessionRecoveryManager) {
      window.ARSessionRecoveryManager.setState(window.ARSessionRecoveryManager.State.MARKER_ACTIVE);
    }
  }

  /**
   * Fasa 4C.4: Double-Tap & Button Panel Maximize (Safe Responsive Scaling)
   */
  function toggleMaximizePanel() {
    const isPOV = (ARState.systemMode === SYSTEM_MODES.POV || 
                   ARState.systemMode === SYSTEM_MODES.POV_SETUP || 
                   ARState.systemMode === SYSTEM_MODES.POV_LOCKED ||
                   (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible('kuiz')) ||
                   (DOM.povPanelKuiz && !DOM.povPanelKuiz.classList.contains('hidden')));
    const targetCard = isPOV ? DOM.povCard : DOM.floatingCard;
    if (!targetCard) return;

    const isMaximized = targetCard.classList.contains('is-maximized');
    const safeBounds = getSafeAreaBounds();
    const maxW = Math.max(320, window.innerWidth - (safeBounds.leftSafe + safeBounds.rightSafe));
    const maxH = Math.max(360, window.innerHeight - (safeBounds.topSafe + safeBounds.botSafe));

    const wrapper = isPOV ? DOM.povEmbeddedIframeWrapper : DOM.embeddedIframeWrapper;

    if (!isMaximized) {
      const curRect = targetCard.getBoundingClientRect();
      targetCard._preMaxW = curRect.width;
      targetCard._preMaxH = curRect.height;

      targetCard.classList.add('is-maximized', 'is-focus-mode', 'is-custom-resized');
      targetCard.style.width = `${maxW}px`;
      targetCard.style.height = `${maxH}px`;
      targetCard.style.maxHeight = `${maxH}px`;

      if (wrapper) {
        const headerH = DOM.panelHeader ? DOM.panelHeader.offsetHeight : 54;
        const footerH = DOM.panelFooter ? DOM.panelFooter.offsetHeight : 54;
        wrapper.style.height = `${Math.max(280, maxH - headerH - footerH - 64)}px`;
      }
      updateFocusButtonState(true);
      showToast('🔍 Panel dibesarkan ke saiz maksimum', 1500);
    } else {
      targetCard.classList.remove('is-maximized', 'is-focus-mode');
      const prevW = targetCard._preMaxW || (window.innerWidth >= 768 ? 680 : 420);
      const prevH = targetCard._preMaxH || 540;

      targetCard.style.width = `${prevW}px`;
      targetCard.style.height = `${prevH}px`;
      if (wrapper) {
        wrapper.style.height = '';
      }
      updateFocusButtonState(false);
      showToast('Paparan asal dipulihkan', 1500);
    }
    clampPanelIntoViewport();
  }

  /**
   * Fasa 4C.3 & 4C.4: Toggle Game Focus Mode (Expanded Viewport for Gameplay)
   */
  function toggleGameFocusMode() {
    toggleMaximizePanel();
  }

  function updateFocusButtonState(isFocus) {
    if (DOM.gameFocusIcon) DOM.gameFocusIcon.textContent = isFocus ? 'close_fullscreen' : 'open_in_full';
    if (DOM.gameFocusText) DOM.gameFocusText.textContent = isFocus ? 'Kecil' : 'Fokus';
    if (DOM.povGameFocusIcon) DOM.povGameFocusIcon.textContent = isFocus ? 'close_fullscreen' : 'open_in_full';
    if (DOM.povGameFocusText) DOM.povGameFocusText.textContent = isFocus ? 'Kecil' : 'Fokus';
  }

  /**
   * Alias for backward compatibility with existing lifecycle callers
   */
  function renderQuizSelectionList() {
    render5GamesCatalog();
  }

  /**
   * Alias for backward compatibility with existing POV callers
   */
  function renderPOVQuizCardsList() {
    renderPOV5GamesCatalog();
  }

  /**
   * Tab switcher retained for compatibility
   */
  function switchQuizTab(tabName) {
    render5GamesCatalog();
    renderPOV5GamesCatalog();
  }

  /**
   * Launch an existing ARSELNEL interactive game safely:
   * - Saves return state into sessionStorage
   * - Stops camera streams and gyro listeners (power & battery conservation)
   * - Navigates directly with from=kotak_ar query parameter
   */
  function launchInteractiveGame(game) {
    if (!game || !game.route) return;
    console.log('[KotakAR] 🎮 Melancarkan Permainan Asal ARSELNEL:', game.title, game.route);

    showToast(`🎮 Membuka "${game.title}"... Sila tunggu.`);

    // 1. Save return session flags
    try {
      sessionStorage.setItem('arselnel_return_to_ar', 'true');
      sessionStorage.setItem('arselnel_last_module', 'kuiz');
      sessionStorage.setItem('arselnel_last_game_id', game.id);
    } catch (e) {
      console.warn('[KotakAR] sessionStorage error:', e);
    }

    // 2. Battery & resource saving: cleanly release camera hardware and stream tracks
    try {
      if (ARState.cameraStream) {
        ARState.cameraStream.getTracks().forEach(track => {
          try { track.stop(); } catch (err) {}
        });
        ARState.cameraStream = null;
      }
      if (ARState.cameraVideo) {
        ARState.cameraVideo.srcObject = null;
      }
    } catch (e) {
      console.warn('[KotakAR] Camera cleanup error:', e);
    }

    // 3. Remove orientation listeners
    if (ARState.pov && ARState.pov.orientationHandler) {
      try {
        window.removeEventListener('deviceorientation', ARState.pov.orientationHandler);
      } catch (e) {}
    }

    // 4. Navigate directly
    const sep = game.route.includes('?') ? '&' : '?';
    const targetUrl = `${game.route}${sep}from=kotak_ar`;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 120);
  }

  /**
   * Select a quiz and start the interactive runner session
   */
  function selectQuiz(quiz, qIdx = 0) {
    if (!quiz) return;
    ARState.activeQuiz = quiz;
    if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
      ARState.quizzes = quiz.questions;
    }

    // Reset quiz session state
    ARState.quizState = {
      currentQuestionIndex: Math.max(0, qIdx),
      score: 0,
      totalQuestions: (ARState.quizzes && ARState.quizzes.length > 0) ? ARState.quizzes.length : 1,
      userAnswers: [],
      isAnswered: false,
      isCompleted: false,
      startTime: Date.now()
    };

    // Toggle views
    if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
    if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
    if (DOM.activeKuizView) DOM.activeKuizView.classList.remove('hidden');

    if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
    if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
    if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.remove('hidden');

    renderCurrentQuizQuestion();
    syncPOVQuizContent();

    showToast(`Kuiz dimulakan: ${quiz.title}`);
  }

  /**
   * Render the current question in the active quiz session
   */
  function renderCurrentQuizQuestion() {
    const questions = ARState.quizzes || [];
    const idx = ARState.quizState.currentQuestionIndex;
    const currentQ = questions[idx] || ARState.activeQuiz;
    if (!currentQ) return;

    const total = ARState.quizState.totalQuestions;
    const progressPct = Math.round(((idx + 1) / total) * 100);

    // Update standard DOM
    if (DOM.kuizQuestionCounter) DOM.kuizQuestionCounter.textContent = `Soalan ${idx + 1} / ${total}`;
    if (DOM.kuizTopicBadge) DOM.kuizTopicBadge.textContent = currentQ.topic || 'Sains Tingkatan 1';
    if (DOM.kuizLiveScoreText) DOM.kuizLiveScoreText.textContent = `${ARState.quizState.score} Mata`;
    if (DOM.kuizProgressBar) DOM.kuizProgressBar.style.width = `${progressPct}%`;
    if (DOM.kuizQuestionTitle) DOM.kuizQuestionTitle.textContent = currentQ.title || `Soalan ${idx + 1}`;
    if (DOM.kuizQuestionText) DOM.kuizQuestionText.textContent = currentQ.question || '';

    // Handle image
    if (DOM.kuizImgContainer && DOM.kuizQuestionImg) {
      if (currentQ.image && !currentQ.image.includes('topic2.svg')) {
        DOM.kuizQuestionImg.src = currentQ.image;
        DOM.kuizImgContainer.classList.remove('hidden');
      } else {
        DOM.kuizImgContainer.classList.add('hidden');
      }
    }

    // Populate options
    if (DOM.kuizOptionsGrid) {
      DOM.kuizOptionsGrid.innerHTML = '';
      (currentQ.options || []).forEach((opt, oIdx) => {
        const optLabel = (typeof opt === 'object' && opt.label) ? opt.label : String.fromCharCode(65 + oIdx);
        const optText = (typeof opt === 'object' && opt.text) ? opt.text : String(opt);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-kuiz-option';
        btn.innerHTML = `
          <span class="opt-badge">${optLabel}</span>
          <span class="opt-text">${optText}</span>
        `;
        // Stop propagation so iPad dragging doesn't intercept option selection
        btn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btn.addEventListener('pointerdown', (e) => e.stopPropagation());
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          submitQuizAnswer(idx, optLabel);
        });
        DOM.kuizOptionsGrid.appendChild(btn);
      });
    }

    // Hide feedback card
    if (DOM.kuizFeedbackCard) DOM.kuizFeedbackCard.classList.add('hidden');

    // Auto-clamp panel
    requestAnimationFrame(() => clampPanelIntoViewport());
  }

  /**
   * Synchronize active question state into POV panel
   */
  function syncPOVQuizContent() {
    const questions = ARState.quizzes || [];
    const idx = ARState.quizState.currentQuestionIndex;
    const currentQ = questions[idx] || ARState.activeQuiz;
    if (!currentQ) return;

    const total = ARState.quizState.totalQuestions;
    const progressPct = Math.round(((idx + 1) / total) * 100);

    if (DOM.povKuizQuestionCounter) DOM.povKuizQuestionCounter.textContent = `Soalan ${idx + 1} / ${total}`;
    if (DOM.povKuizTopicBadge) DOM.povKuizTopicBadge.textContent = currentQ.topic || 'Sains Tingkatan 1';
    if (DOM.povKuizLiveScoreText) DOM.povKuizLiveScoreText.textContent = `${ARState.quizState.score} Mata`;
    if (DOM.povKuizProgressBar) DOM.povKuizProgressBar.style.width = `${progressPct}%`;
    if (DOM.povKuizQuestionTitle) DOM.povKuizQuestionTitle.textContent = currentQ.title || `Soalan ${idx + 1}`;
    if (DOM.povKuizQuestionText) DOM.povKuizQuestionText.textContent = currentQ.question || '';

    if (DOM.povKuizImgContainer && DOM.povKuizQuestionImg) {
      if (currentQ.image && !currentQ.image.includes('topic2.svg')) {
        DOM.povKuizQuestionImg.src = currentQ.image;
        DOM.povKuizImgContainer.classList.remove('hidden');
      } else {
        DOM.povKuizImgContainer.classList.add('hidden');
      }
    }

    if (DOM.povKuizOptionsGrid) {
      DOM.povKuizOptionsGrid.innerHTML = '';
      (currentQ.options || []).forEach((opt, oIdx) => {
        const optLabel = (typeof opt === 'object' && opt.label) ? opt.label : String.fromCharCode(65 + oIdx);
        const optText = (typeof opt === 'object' && opt.text) ? opt.text : String(opt);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-kuiz-option';
        btn.innerHTML = `
          <span class="opt-badge">${optLabel}</span>
          <span class="opt-text">${optText}</span>
        `;
        btn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
        btn.addEventListener('pointerdown', (e) => e.stopPropagation());
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          submitQuizAnswer(idx, optLabel);
        });
        DOM.povKuizOptionsGrid.appendChild(btn);
      });
    }

    if (DOM.povKuizFeedbackCard) DOM.povKuizFeedbackCard.classList.add('hidden');
  }

  /**
   * Submit an answer for the current question
   */
  function submitQuizAnswer(qIdx, chosenLabel) {
    if (ARState.quizState.isAnswered) return;
    ARState.quizState.isAnswered = true;

    const questions = ARState.quizzes || [];
    const idx = (typeof qIdx === 'number') ? qIdx : (ARState.quizState.currentQuestionIndex || 0);
    const currentQ = questions[idx] || ARState.activeQuiz;
    if (!currentQ) return;

    let selected = chosenLabel;
    if (selected === undefined || selected === null) {
      if (typeof qIdx === 'string') {
        selected = qIdx;
      } else if (typeof qIdx === 'number') {
        selected = String.fromCharCode(65 + qIdx);
      } else {
        selected = 'A';
      }
    }

    const correctLabel = (currentQ.correctAnswer || (typeof currentQ.correct === 'number' ? String.fromCharCode(65 + currentQ.correct) : 'A')).toUpperCase();
    const isCorrect = (String(selected).toUpperCase() === correctLabel);
    const earnedPoints = isCorrect ? (currentQ.points || 10) : 0;

    ARState.quizState.score += earnedPoints;
    ARState.quizState.userAnswers.push({
      questionIndex: idx,
      questionId: currentQ.id,
      selected: selected,
      correct: correctLabel,
      isCorrect: isCorrect,
      points: earnedPoints
    });

    // Update live score in headers
    if (DOM.kuizLiveScoreText) DOM.kuizLiveScoreText.textContent = `${ARState.quizState.score} Mata`;
    if (DOM.povKuizLiveScoreText) DOM.povKuizLiveScoreText.textContent = `${ARState.quizState.score} Mata`;

    // Highlight options in standard panel
    if (DOM.kuizOptionsGrid) {
      const btns = DOM.kuizOptionsGrid.querySelectorAll('.btn-kuiz-option');
      btns.forEach(btn => {
        btn.classList.add('is-disabled');
        const badge = btn.querySelector('.opt-badge');
        const label = badge ? badge.textContent.trim().toUpperCase() : '';
        if (label === chosenLabel) {
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        } else if (label === correctLabel && !isCorrect) {
          btn.classList.add('is-correct');
        }
      });
    }

    // Highlight options in POV panel
    if (DOM.povKuizOptionsGrid) {
      const pBtns = DOM.povKuizOptionsGrid.querySelectorAll('.btn-kuiz-option');
      pBtns.forEach(btn => {
        btn.classList.add('is-disabled');
        const badge = btn.querySelector('.opt-badge');
        const label = badge ? badge.textContent.trim().toUpperCase() : '';
        if (label === chosenLabel) {
          btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
        } else if (label === correctLabel && !isCorrect) {
          btn.classList.add('is-correct');
        }
      });
    }

    // Setup feedback message
    const isLastQuestion = (qIdx >= ARState.quizState.totalQuestions - 1);
    const nextBtnText = isLastQuestion ? 'Lihat Keputusan 🏆' : 'Soalan Seterusnya →';

    // Standard Feedback Card
    if (DOM.kuizFeedbackCard) {
      DOM.kuizFeedbackCard.className = `kuiz-feedback-card ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
      if (DOM.feedbackIcon) DOM.feedbackIcon.textContent = isCorrect ? 'check_circle' : 'cancel';
      if (DOM.feedbackTitle) DOM.feedbackTitle.textContent = isCorrect ? 'Tepat Sekali! 🎉 (+10 Mata)' : 'Kurang Tepat ❌';
      if (DOM.feedbackExplanation) DOM.feedbackExplanation.textContent = currentQ.explanation || 'Jawapan telah disahkan mengikut silibus KSSM.';
      if (DOM.btnKuizNextText) DOM.btnKuizNextText.textContent = nextBtnText;
      DOM.kuizFeedbackCard.classList.remove('hidden');
    }

    // POV Feedback Card
    if (DOM.povKuizFeedbackCard) {
      DOM.povKuizFeedbackCard.className = `kuiz-feedback-card ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
      if (DOM.povFeedbackIcon) DOM.povFeedbackIcon.textContent = isCorrect ? 'check_circle' : 'cancel';
      if (DOM.povFeedbackTitle) DOM.povFeedbackTitle.textContent = isCorrect ? 'Tepat Sekali! 🎉 (+10 Mata)' : 'Kurang Tepat ❌';
      if (DOM.povFeedbackExplanation) DOM.povFeedbackExplanation.textContent = currentQ.explanation || 'Jawapan telah disahkan mengikut silibus KSSM.';
      if (DOM.povBtnKuizNextText) DOM.povBtnKuizNextText.textContent = nextBtnText;
      DOM.povKuizFeedbackCard.classList.remove('hidden');
    }

    requestAnimationFrame(() => clampPanelIntoViewport());
  }

  /**
   * Advance to next question or finalize quiz
   */
  function nextQuizQuestion() {
    const nextIdx = ARState.quizState.currentQuestionIndex + 1;
    if (nextIdx < ARState.quizState.totalQuestions) {
      ARState.quizState.currentQuestionIndex = nextIdx;
      ARState.quizState.isAnswered = false;
      renderCurrentQuizQuestion();
      syncPOVQuizContent();
    } else {
      finishActiveQuiz();
    }
  }

  /**
   * Finalize quiz, calculate score, record attempt, and display result card
   */
  async function finishActiveQuiz() {
    ARState.quizState.isCompleted = true;
    const totalQ = ARState.quizState.totalQuestions;
    const questions = ARState.quizzes || [];
    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 10), 0) || (totalQ * 10);
    const finalScore = ARState.quizState.score;
    const percentage = Math.min(100, Math.round((finalScore / totalPoints) * 100));

    const correctCount = ARState.quizState.userAnswers.filter(a => a.isCorrect).length;
    const wrongCount = totalQ - correctCount;

    let headline = 'Tahniah! Kuiz Selesai! 🎉';
    let feedback = 'Hebat! Anda telah menguasai konsep ini dengan sangat cemerlang!';
    if (percentage < 60) {
      headline = 'Usaha Yang Baik! 💪';
      feedback = 'Ulang kaji semula nota berkaitan untuk memperkukuh pemahaman anda.';
    } else if (percentage < 80) {
      headline = 'Syabas! Pencapaian Baik! ⭐';
      feedback = 'Anda memahami sebahagian besar fakta sains sel ini dengan baik.';
    }

    // Update standard results DOM
    if (DOM.resultHeadline) DOM.resultHeadline.textContent = headline;
    if (DOM.resultScorePercent) DOM.resultScorePercent.textContent = `${percentage}%`;
    if (DOM.resultScorePoints) DOM.resultScorePoints.textContent = `${finalScore} / ${totalPoints} Mata`;
    if (DOM.resultFeedbackDesc) DOM.resultFeedbackDesc.textContent = feedback;
    if (DOM.resultStatCorrect) DOM.resultStatCorrect.textContent = `${correctCount} Betul`;
    if (DOM.resultStatWrong) DOM.resultStatWrong.textContent = `${wrongCount} Salah`;

    // Update POV results DOM
    if (DOM.povResultHeadline) DOM.povResultHeadline.textContent = headline;
    if (DOM.povResultScorePercent) DOM.povResultScorePercent.textContent = `${percentage}%`;
    if (DOM.povResultScorePoints) DOM.povResultScorePoints.textContent = `${finalScore} / ${totalPoints} Mata`;
    if (DOM.povResultFeedbackDesc) DOM.povResultFeedbackDesc.textContent = feedback;
    if (DOM.povResultStatCorrect) DOM.povResultStatCorrect.textContent = `${correctCount} Betul`;
    if (DOM.povResultStatWrong) DOM.povResultStatWrong.textContent = `${wrongCount} Salah`;

    // Switch view to results card
    if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
    if (DOM.kuizResultView) DOM.kuizResultView.classList.remove('hidden');

    if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
    if (DOM.povKuizResultView) DOM.povKuizResultView.classList.remove('hidden');

    // Save attempt via ARSupabase without schema modification (with double-submission protection)
    if (!ARState._isSavingQuizAttempt) {
      ARState._isSavingQuizAttempt = true;
      const attemptRecord = {
        quizId: (ARState.activeQuiz && ARState.activeQuiz.id) || 'kotak_ar_kuiz_sel',
        score: percentage,
        correct: correctCount,
        total: totalQ,
        durationSeconds: Math.round((Date.now() - ARState.quizState.startTime) / 1000),
        answers: ARState.quizState.userAnswers,
        completedAt: new Date().toISOString()
      };

      try {
        if (window.ARSupabase && typeof window.ARSupabase.saveQuizAttempt === 'function') {
          await window.ARSupabase.saveQuizAttempt(attemptRecord);
          console.log('[KotakAR] Percubaan kuiz berjaya disimpan ke cache/Supabase:', attemptRecord);
        } else {
          // Direct fallback to standard arselnel_quiz_submissions localStorage key
          try {
            const subs = JSON.parse(localStorage.getItem('arselnel_quiz_submissions') || '[]');
            subs.push(attemptRecord);
            localStorage.setItem('arselnel_quiz_submissions', JSON.stringify(subs));
          } catch (_) {}
        }
      } catch (err) {
        console.warn('[KotakAR] Ralat menyimpan percubaan kuiz:', err);
      } finally {
        ARState._isSavingQuizAttempt = false;
      }
    }

    showToast(`🏆 Kuiz Selesai! Skor anda: ${percentage}% (${finalScore} mata)`);
    requestAnimationFrame(() => clampPanelIntoViewport());
  }

  /**
   * Retry current active quiz
   */
  function retryActiveQuiz() {
    selectQuiz(ARState.activeQuiz, 0);
  }

  /**
   * Stop video playback sound and release media player
   */

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
      DOM.povPanelVideo.style.opacity = '1';
      DOM.povPanelVideo.style.visibility = 'visible';
      DOM.povPanelVideo.style.pointerEvents = 'auto';
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
    if (ARState.pov) {
      ARState.pov.loadedVideoId = null;
      ARState.pov.isAnchored = false;
    }
    ARState.isPinned = false;

    if (typeof SpatialPanelManager !== 'undefined') {
      const p = SpatialPanelManager.getPanel('video');
      if (p) {
        p.isLoaded = false;
        p.playbackState = 'destroyed';
        p.isVisible = false;
        p.isLocked = false;
        p.placementMode = 'MARKER_MODE';
        p.referenceQuaternion = null;
        p.anchorWorldVector = null;
      }
      SpatialPanelManager.setPanelVisibility('video', false);
      SpatialPanelManager.syncPanelControlUI('video');
    }
    if (DOM.povPanelVideo) {
      DOM.povPanelVideo.classList.add('hidden');
      DOM.povPanelVideo.classList.remove('is-visible', 'is-centered');
      DOM.povPanelVideo.style.opacity = '0';
      DOM.povPanelVideo.style.visibility = 'hidden';
      DOM.povPanelVideo.style.pointerEvents = 'none';
    }
    if (DOM.floatingAnchor) {
      DOM.floatingAnchor.classList.remove('is-visible');
    }
    if (DOM.floatingCard) {
      DOM.floatingCard.classList.remove('is-pinned');
    }
    if (DOM.pinnedToolbar) DOM.pinnedToolbar.classList.add('hidden');
    if (DOM.cardDragBar) DOM.cardDragBar.classList.add('hidden');
    if (DOM.btnPlaceVideo) DOM.btnPlaceVideo.classList.remove('hidden');
    if (DOM.btnLockVideo) DOM.btnLockVideo.classList.add('hidden');
    if (DOM.povBtnAnchor) {
      DOM.povBtnAnchor.classList.remove('is-locked');
      if (DOM.povAnchorIcon) DOM.povAnchorIcon.textContent = 'my_location';
      if (DOM.povAnchorText) DOM.povAnchorText.textContent = 'Letak di Arah Ini';
    }

    // Cooldown 600ms supaya marker video tidak mencetuskan scan serta-merta semasa penutupan manual
    ARState.markerCooldown = ARState.markerCooldown || {};
    ARState.markerCooldown['video'] = Date.now() + 600;

    if (typeof handlePanelClosed === 'function') {
      handlePanelClosed('video');
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
      DOM.povPanelNota.style.opacity = '1';
      DOM.povPanelNota.style.visibility = 'visible';
      DOM.povPanelNota.style.pointerEvents = 'auto';
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
        p.isVisible = false;
        p.isLocked = false;
        p.placementMode = 'MARKER_MODE';
        p.referenceQuaternion = null;
        p.anchorWorldVector = null;
      }
      SpatialPanelManager.setPanelVisibility('nota', false);
      SpatialPanelManager.syncPanelControlUI('nota');
    }
    if (DOM.povPanelNota) {
      DOM.povPanelNota.classList.add('hidden');
      DOM.povPanelNota.classList.remove('is-visible', 'is-centered');
      DOM.povPanelNota.style.opacity = '0';
      DOM.povPanelNota.style.visibility = 'hidden';
      DOM.povPanelNota.style.pointerEvents = 'none';
    }
    if (DOM.floatingAnchor && ARState.activeModule === 'nota' && ARState.activePanels.size <= 1) {
      DOM.floatingAnchor.classList.remove('is-visible');
    }
    if (DOM.povNotaBtnAnchor) {
      DOM.povNotaBtnAnchor.classList.remove('is-locked');
      if (DOM.povNotaAnchorIcon) DOM.povNotaAnchorIcon.textContent = 'my_location';
      if (DOM.povNotaAnchorText) DOM.povNotaAnchorText.textContent = 'Letak di Arah Ini';
    }

    // Cooldown 600ms supaya marker nota tidak mencetuskan scan serta-merta semasa penutupan manual
    ARState.markerCooldown = ARState.markerCooldown || {};
    ARState.markerCooldown['nota'] = Date.now() + 600;

    if (typeof handlePanelClosed === 'function') {
      handlePanelClosed('nota');
    }
  }

  // Fasa 4E-C.2: Kuiz Independent Lifecycle
  function hideKuizPanel() {
    if (DOM.povKuizScrollableBody) {
      ARState.povKuizSavedScrollTop = DOM.povKuizScrollableBody.scrollTop;
    }
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('kuiz', false);
      SpatialPanelManager.savePanelScroll('kuiz', ARState.povKuizSavedScrollTop || 0);
    }
    if (DOM.povPanelKuiz) {
      DOM.povPanelKuiz.classList.remove('is-visible');
      DOM.povPanelKuiz.classList.add('hidden');
    }
  }

  function showKuizPanel() {
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('kuiz', true);
    }
    if (DOM.povPanelKuiz) {
      DOM.povPanelKuiz.classList.remove('hidden');
      DOM.povPanelKuiz.classList.add('is-visible');
      DOM.povPanelKuiz.style.opacity = '1';
      DOM.povPanelKuiz.style.visibility = 'visible';
      DOM.povPanelKuiz.style.pointerEvents = 'auto';
    }
    if (!ARState.games || ARState.games.length === 0) {
      loadGamesCatalog();
    }
    if (!GameSessionManager.isGameActive() && !ARState.activeQuiz) {
      renderPOV5GamesCatalog();
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');
    }
  }

  function destroyKuizSession() {
    console.log('[KuizLifecycle] 🛑 Memusnahkan sesi kuiz secara eksplisit atas arahan pengguna...');
    closeEmbeddedGame();
    ARState.activeQuiz = null;
    if (typeof SpatialPanelManager !== 'undefined') {
      const p = SpatialPanelManager.getPanel('kuiz');
      if (p) {
        p.isLoaded = false;
        p.isVisible = false;
        p.isLocked = false;
        p.placementMode = 'MARKER_MODE';
        p.referenceQuaternion = null;
        p.anchorWorldVector = null;
      }
      SpatialPanelManager.setPanelVisibility('kuiz', false);
      SpatialPanelManager.syncPanelControlUI('kuiz');
    }
    if (DOM.povPanelKuiz) {
      DOM.povPanelKuiz.classList.add('hidden');
      DOM.povPanelKuiz.classList.remove('is-visible', 'is-centered');
      DOM.povPanelKuiz.style.opacity = '0';
      DOM.povPanelKuiz.style.visibility = 'hidden';
      DOM.povPanelKuiz.style.pointerEvents = 'none';
    }
    if (DOM.floatingAnchor && ARState.activeModule === 'kuiz' && ARState.activePanels.size <= 1) {
      DOM.floatingAnchor.classList.remove('is-visible');
    }
    if (DOM.povKuizBtnAnchor) {
      DOM.povKuizBtnAnchor.classList.remove('is-locked');
      if (DOM.povKuizAnchorIcon) DOM.povKuizAnchorIcon.textContent = 'my_location';
      if (DOM.povKuizAnchorText) DOM.povKuizAnchorText.textContent = 'Letak di Arah Ini';
    }

    // Cooldown 600ms supaya marker kuiz tidak mencetuskan scan serta-merta semasa penutupan manual
    ARState.markerCooldown = ARState.markerCooldown || {};
    ARState.markerCooldown['kuiz'] = Date.now() + 600;

    if (typeof handlePanelClosed === 'function') {
      handlePanelClosed('kuiz');
    }
  }

  // =========================================================================
  // FASA 4F: SELBOT AI INDEPENDENT LIFECYCLE & PERSISTENT AR CHAT CONTROLLER
  // =========================================================================

  function hideSelbotPanel() {
    if (DOM.selbotArChatFeed) {
      ARState.selbotSavedScrollTop = DOM.selbotArChatFeed.scrollTop;
    }
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('selbot', false);
      SpatialPanelManager.savePanelScroll('selbot', ARState.selbotSavedScrollTop || 0);
    }
    if (DOM.povPanelSelbot) {
      DOM.povPanelSelbot.classList.remove('is-visible');
      DOM.povPanelSelbot.classList.add('hidden');
    }
    if (DOM.selbotArView && ARState.activeModule !== 'selbot') {
      DOM.selbotArView.classList.add('hidden');
    }
  }

  function showSelbotPanel() {
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelVisibility('selbot', true);
    }
    if (DOM.povPanelSelbot) {
      DOM.povPanelSelbot.classList.remove('hidden');
      DOM.povPanelSelbot.classList.add('is-visible');
      DOM.povPanelSelbot.style.opacity = '1';
      DOM.povPanelSelbot.style.visibility = 'visible';
      DOM.povPanelSelbot.style.pointerEvents = 'auto';
    }
    if (DOM.selbotArView && ARState.activeModule === 'selbot') {
      DOM.selbotArView.classList.remove('hidden');
    }
    SelBotARController.init();
  }

  function destroySelbotSession() {
    console.log('[SelBotLifecycle] 🛑 Menutup panel SelBot AI (Sejarah perbualan dikekalkan dengan selamat)...');
    // PENTING (Fasa 6): JANGAN padam sejarah perbualan apabila panel ditutup!
    if (typeof SpatialPanelManager !== 'undefined') {
      const p = SpatialPanelManager.getPanel('selbot');
      if (p) {
        p.isVisible = false;
        p.isLocked = false;
        p.placementMode = 'MARKER_FOLLOW';
        p.referenceQuaternion = null;
        p.anchorWorldVector = null;
      }
      SpatialPanelManager.setPanelVisibility('selbot', false);
      SpatialPanelManager.syncPanelControlUI('selbot');
    }
    if (DOM.povPanelSelbot) {
      DOM.povPanelSelbot.classList.add('hidden');
      DOM.povPanelSelbot.classList.remove('is-visible', 'is-centered');
      DOM.povPanelSelbot.style.opacity = '0';
      DOM.povPanelSelbot.style.visibility = 'hidden';
      DOM.povPanelSelbot.style.pointerEvents = 'none';
    }
    if (DOM.floatingAnchor && ARState.activeModule === 'selbot' && ARState.activePanels.size <= 1) {
      DOM.floatingAnchor.classList.remove('is-visible');
    }
    if (DOM.povSelbotBtnAnchor) {
      DOM.povSelbotBtnAnchor.classList.remove('is-locked');
      if (DOM.povSelbotAnchorIcon) DOM.povSelbotAnchorIcon.textContent = 'my_location';
      if (DOM.povSelbotAnchorText) DOM.povSelbotAnchorText.textContent = 'Letak di Arah Ini';
    }

    ARState.markerCooldown = ARState.markerCooldown || {};
    ARState.markerCooldown['selbot'] = Date.now() + 600;

    if (typeof handlePanelClosed === 'function') {
      handlePanelClosed('selbot');
    }
  }

  const SelBotARController = {
    supabaseClient: null,
    listenersAttached: false,
    authSubscription: null,

    escapeHTML(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    formatReplyHTML(text) {
      let safe = this.escapeHTML(text);
      safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/\n/g, '<br/>');
      return safe;
    },

    async init() {
      this.attachListenersOnce();

      // Fasa 4F.1: If already initialized for an authenticated user and conversations exist, just re-render
      if (ARState.selbot.initialized && ARState.selbot.conversations.length > 0 && ARState.selbot.currentUserId && ARState.selbot.currentUserId !== 'guest') {
        this.renderMessagesToFeeds();
        this.renderConversationLists();
        return;
      }

      ARState.selbot.initialized = true;
      if (ARState.selbot.messages.length === 0) {
        this.resetToWelcomeUI();
      }

      this.checkBackendStatus();
      await this.initAuthAndHistory();
    },

    attachListenersOnce() {
      if (this.listenersAttached) return;
      this.listenersAttached = true;

      // Send buttons
      if (DOM.btnSelbotArSend) {
        DOM.btnSelbotArSend.addEventListener('click', () => {
          if (DOM.selbotArInput) this.submitQuestion(DOM.selbotArInput.value, false, 'floating');
        });
      }
      if (DOM.btnPovSelbotSend) {
        DOM.btnPovSelbotSend.addEventListener('click', () => {
          if (DOM.povSelbotInput) this.submitQuestion(DOM.povSelbotInput.value, false, 'pov');
        });
      }

      // Enter key on inputs
      if (DOM.selbotArInput) {
        DOM.selbotArInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.submitQuestion(DOM.selbotArInput.value, false, 'floating');
          }
        });
        DOM.selbotArInput.addEventListener('focus', () => this.ensureInputVisible(DOM.selbotArInput, DOM.selbotArChatFeed));
      }
      if (DOM.povSelbotInput) {
        DOM.povSelbotInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.submitQuestion(DOM.povSelbotInput.value, false, 'pov');
          }
        });
        DOM.povSelbotInput.addEventListener('focus', () => this.ensureInputVisible(DOM.povSelbotInput, DOM.povSelbotChatFeed));
      }

      // New Chat buttons
      if (DOM.btnSelbotArNewChat) {
        DOM.btnSelbotArNewChat.addEventListener('click', () => this.startNewConversation());
      }
      if (DOM.btnPovSelbotNewChat) {
        DOM.btnPovSelbotNewChat.addEventListener('click', () => this.startNewConversation());
      }

      // History Toggle & Close buttons
      if (DOM.btnSelbotArHistoryToggle) {
        DOM.btnSelbotArHistoryToggle.addEventListener('click', () => this.toggleHistoryPanel());
      }
      if (DOM.btnPovSelbotHistoryToggle) {
        DOM.btnPovSelbotHistoryToggle.addEventListener('click', () => this.toggleHistoryPanel());
      }
      if (DOM.btnSelbotArHistoryClose) {
        DOM.btnSelbotArHistoryClose.addEventListener('click', () => this.toggleHistoryPanel(false));
      }
      if (DOM.btnPovSelbotHistoryClose) {
        DOM.btnPovSelbotHistoryClose.addEventListener('click', () => this.toggleHistoryPanel(false));
      }

      // Quick Suggestion Chips
      [DOM.selbotArSuggestions, DOM.povSelbotSuggestions].forEach((container) => {
        if (!container) return;
        container.querySelectorAll('.selbot-ar-chip').forEach((chip) => {
          chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt) this.submitQuestion(prompt, false);
          });
        });
      });

      // Mobile virtual keyboard resilience
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          if (document.activeElement === DOM.selbotArInput) {
            this.scrollToBottom(DOM.selbotArChatFeed);
          } else if (document.activeElement === DOM.povSelbotInput) {
            this.scrollToBottom(DOM.povSelbotChatFeed);
          }
        });
      }
    },

    ensureInputVisible(inputEl, feedEl) {
      setTimeout(() => {
        this.scrollToBottom(feedEl);
        try {
          inputEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (_) {}
      }, 220);
    },

    async checkBackendStatus() {
      try {
        const res = await fetch('/api/selbot/chat');
        if (res.ok) {
          const data = await res.json();
          const label = data.configured ? 'AI Aktif (LLM)' : 'Kurikulum T1';
          if (DOM.selbotArStatusBadge) DOM.selbotArStatusBadge.textContent = label;
          if (DOM.povSelbotStatusBadge) DOM.povSelbotStatusBadge.textContent = label;
        }
      } catch (_) {
        if (DOM.selbotArStatusBadge) DOM.selbotArStatusBadge.textContent = 'Mod Kurikulum';
        if (DOM.povSelbotStatusBadge) DOM.povSelbotStatusBadge.textContent = 'Mod Kurikulum';
      }
    },

    async initAuthAndHistory() {
      try {
        // FASA 4F.2: Use Unified SelBotConversationService for single point of truth
        if (window.SelBotConversationService) {
          await window.SelBotConversationService.init();
          this.supabaseClient = window.SelBotConversationService.supabaseClient;
          const uid = window.SelBotConversationService.currentUserId;
          
          if (uid && uid !== 'guest') {
            if (ARState.selbot.currentUserId && ARState.selbot.currentUserId !== uid) {
              this.clearSensitiveSessionState();
            }
            ARState.selbot.currentUserId = uid;
            this.updateSyncLabels('Tutor Sains Tingkatan 1 • Disegerakkan ke Awan');
            await this.fetchUserConversations();
          } else {
            ARState.selbot.currentUserId = 'guest';
            this.updateSyncLabels('Tutor Sains Tingkatan 1 • Sesi Semasa');
          }

          if (!this.authSubscription) {
            this.authSubscription = window.SelBotConversationService.subscribe((event, data) => {
              if (event === 'conversations:updated') {
                ARState.selbot.conversations = window.SelBotConversationService.conversations;
                this.renderConversationLists();
              } else if (event === 'auth:signed_in') {
                ARState.selbot.currentUserId = data.user?.id;
                this.updateSyncLabels('Tutor Sains Tingkatan 1 • Disegerakkan ke Awan');
                this.fetchUserConversations();
              } else if (event === 'auth:signed_out') {
                this.clearSensitiveSessionState();
              }
            });
          }
          return;
        }

        if (!this.supabaseClient) {
          if (window.ARSupabase && typeof window.ARSupabase.getClient === 'function') {
            this.supabaseClient = await window.ARSupabase.getClient();
          } else if (window.supabase) {
            this.supabaseClient = window.supabase;
          }
        }

        let authUser = null;
        if (this.supabaseClient && this.supabaseClient.auth) {
          try {
            const { data: userData } = await this.supabaseClient.auth.getUser();
            authUser = userData?.user || null;
            if (!authUser) {
              const { data: sessData } = await this.supabaseClient.auth.getSession();
              authUser = sessData?.session?.user || null;
            }
          } catch (_) {}
        }

        // Fasa 4F.1: Secondary fallback to AuthGuard / localStorage if Supabase network call is pending
        if (!authUser) {
          const localUser = (window.AuthGuard && window.AuthGuard.getUser) ? window.AuthGuard.getUser() : null;
          if (localUser && localUser.id && !window.AuthGuard?.isGuest()) {
            authUser = localUser;
          } else {
            try {
              const stored = JSON.parse(localStorage.getItem('arselnel_current_user') || 'null');
              if (stored && stored.id && stored.id !== 'guest') {
                authUser = stored;
              }
            } catch (_) {}
          }
        }

        if (authUser && authUser.id) {
          // If user changed, clear previous user's state first
          if (ARState.selbot.currentUserId && ARState.selbot.currentUserId !== authUser.id) {
            this.clearSensitiveSessionState();
          }
          ARState.selbot.currentUserId = authUser.id;
          this.updateSyncLabels('Tutor Sains Tingkatan 1 • Disegerakkan ke Awan');
          await this.fetchUserConversations();
        } else {
          ARState.selbot.currentUserId = 'guest';
          this.updateSyncLabels('Tutor Sains Tingkatan 1 • Sesi Semasa');
        }

        if (this.supabaseClient && this.supabaseClient.auth && !this.authSubscription) {
          const { data: sub } = this.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
              this.clearSensitiveSessionState();
            } else if (event === 'SIGNED_IN' && session?.user?.id) {
              if (ARState.selbot.currentUserId !== session.user.id) {
                this.clearSensitiveSessionState();
                ARState.selbot.currentUserId = session.user.id;
                this.updateSyncLabels('Tutor Sains Tingkatan 1 • Disegerakkan ke Awan');
                await this.fetchUserConversations();
              }
            }
          });
          this.authSubscription = sub;
        }
      } catch (err) {
        console.warn('[SelBotAR] initAuthAndHistory notice:', err.message);
      }
    },

    updateSyncLabels(text) {
      if (DOM.selbotArSyncLabel) DOM.selbotArSyncLabel.textContent = text;
      if (DOM.povSelbotSyncLabel) DOM.povSelbotSyncLabel.textContent = text;
    },

    clearSensitiveSessionState() {
      const prevUser = ARState.selbot.currentUserId;
      if (prevUser) {
        try { sessionStorage.removeItem(`arselnel_active_conv_${prevUser}`); } catch (_) {}
      }
      ARState.selbot.currentUserId = null;
      ARState.selbot.activeConversationId = null;
      ARState.selbot.conversations = [];
      ARState.selbot.messages = [];
      ARState.selbot.conversationHistory = [];
      ARState.selbot.lastSentMessage = '';
      this.resetToWelcomeUI();
      this.renderConversationLists();
      this.updateSyncLabels('Sesi ditamatkan • Sila log masuk');
    },

    resetToWelcomeUI() {
      ARState.selbot.messages = [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hai, Saintis Muda! Saya **SelBot**, pembantu pembelajaran Sains Tingkatan 1 anda dalam ruang WebAR. Tanyakan apa-apa soalan tentang sel haiwan, sel tumbuhan, atau fungsi organel!',
          modelInfo: 'KSSM Bab 2',
          timeStr: this.getNowTimeStr()
        }
      ];
      this.renderMessagesToFeeds();
    },

    getNowTimeStr() {
      try {
        return new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
      } catch (_) {
        return 'Baru sahaja';
      }
    },

    async fetchUserConversations() {
      const uid = ARState.selbot.currentUserId;
      if (!uid || uid === 'guest') return;

      if (window.SelBotConversationService && uid !== 'guest') {
        try {
          const list = await window.SelBotConversationService.listConversations();
          ARState.selbot.conversations = list || [];
          this.renderConversationLists();

          const targetId = window.SelBotConversationService.activeConversationId || (list[0]?.id || null);
          if (targetId) {
            await this.loadConversation(targetId);
          }
        } catch (svcErr) {
          console.warn('[SelBotAR] fetchUserConversations service notice:', svcErr.message);
        }
        return;
      }

      if (!this.supabaseClient) return;

      try {
        const { data, error } = await this.supabaseClient
          .from('selbot_conversations')
          .select('id, user_id, title, created_at, updated_at')
          .eq('user_id', uid)
          .order('updated_at', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data)) {
          // Strict client-side ownership guard matching RLS
          ARState.selbot.conversations = data.filter(c => c.user_id === uid);
          this.renderConversationLists();

          const savedConvId = sessionStorage.getItem(`arselnel_active_conv_${uid}`);
          const targetConv = ARState.selbot.conversations.find(c => c.id === savedConvId) || ARState.selbot.conversations[0];

          if (targetConv) {
            await this.loadConversation(targetConv.id);
          }
        }
      } catch (err) {
        console.warn('[SelBotAR] fetchUserConversations notice:', err.message);
      }
    },

    async loadConversation(convId) {
      const uid = ARState.selbot.currentUserId;
      if (!uid || uid === 'guest' || !convId) return;

      if (window.SelBotConversationService && uid !== 'guest') {
        try {
          const msgs = await window.SelBotConversationService.getConversationMessages(convId);
          ARState.selbot.activeConversationId = convId;
          this.renderConversationLists();

          if (Array.isArray(msgs) && msgs.length > 0) {
            ARState.selbot.messages = msgs.map(m => ({
              id: m.id,
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content,
              modelInfo: m.model_info || (m.role === 'assistant' ? 'SelBot AI' : ''),
              timeStr: m.created_at ? new Date(m.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) : ''
            }));

            ARState.selbot.conversationHistory = msgs.slice(-10).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            }));

            this.renderMessagesToFeeds();
          } else {
            this.resetToWelcomeUI();
          }
        } catch (svcErr) {
          console.warn('[SelBotAR] loadConversation service notice:', svcErr.message);
        }
        return;
      }

      if (!this.supabaseClient) return;

      const targetConv = ARState.selbot.conversations.find(c => c.id === convId && c.user_id === uid);
      if (!targetConv) return;

      ARState.selbot.activeConversationId = convId;
      try {
        sessionStorage.setItem(`arselnel_active_conv_${uid}`, convId);
      } catch (_) {}

      this.renderConversationLists();

      try {
        const { data: msgs, error } = await this.supabaseClient
          .from('selbot_messages')
          .select('id, conversation_id, user_id, role, content, model_info, created_at')
          .eq('conversation_id', convId)
          .eq('user_id', uid)
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(msgs) && msgs.length > 0) {
          ARState.selbot.messages = msgs.map(m => ({
            id: m.id,
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            modelInfo: m.model_info || (m.role === 'assistant' ? 'SelBot AI' : ''),
            timeStr: m.created_at ? new Date(m.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) : ''
          }));

          ARState.selbot.conversationHistory = msgs.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }));

          this.renderMessagesToFeeds();
        } else {
          this.resetToWelcomeUI();
        }
      } catch (err) {
        console.warn('[SelBotAR] loadConversation notice:', err.message);
      }
    },

    startNewConversation() {
      const uid = ARState.selbot.currentUserId;
      ARState.selbot.activeConversationId = null;
      ARState.selbot.conversationHistory = [];
      if (uid) {
        try { sessionStorage.removeItem(`arselnel_active_conv_${uid}`); } catch (_) {}
      }
      this.resetToWelcomeUI();
      this.renderConversationLists();
      this.toggleHistoryPanel(false);
      showToast('Perbualan baharu SelBot AI dimulakan.');
    },

    async deleteConversation(convId) {
      const uid = ARState.selbot.currentUserId;
      if (!this.supabaseClient || !uid || uid === 'guest' || !convId) return;

      try {
        const { error } = await this.supabaseClient
          .from('selbot_conversations')
          .delete()
          .eq('id', convId)
          .eq('user_id', uid);

        if (!error) {
          ARState.selbot.conversations = ARState.selbot.conversations.filter(c => c.id !== convId);
          if (ARState.selbot.activeConversationId === convId) {
            this.startNewConversation();
          } else {
            this.renderConversationLists();
          }
          showToast('Rekod perbualan telah dipadam.');
        }
      } catch (err) {
        console.warn('[SelBotAR] deleteConversation notice:', err.message);
      }
    },

    toggleHistoryPanel(forceState) {
      const next = typeof forceState === 'boolean' ? forceState : !ARState.selbot.historyOpen;
      ARState.selbot.historyOpen = next;
      [DOM.selbotArHistoryPanel, DOM.povSelbotHistoryPanel].forEach((panel) => {
        if (!panel) return;
        if (next) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      });
      if (next) this.renderConversationLists();
    },

    renderConversationLists() {
      const list = ARState.selbot.conversations || [];
      const activeId = ARState.selbot.activeConversationId;

      if (DOM.selbotArHistoryCount) DOM.selbotArHistoryCount.textContent = String(list.length);
      if (DOM.povSelbotHistoryCount) DOM.povSelbotHistoryCount.textContent = String(list.length);

      [DOM.selbotArConvList, DOM.povSelbotConvList].forEach((container) => {
        if (!container) return;
        container.innerHTML = '';

        if (list.length === 0) {
          container.innerHTML = '<div class="selbot-ar-history-empty">Tiada sejarah perbualan lagi. Mulakan soalan sains pertama anda!</div>';
          return;
        }

        list.forEach((conv) => {
          const row = document.createElement('div');
          row.className = `selbot-ar-conv-item${conv.id === activeId ? ' is-active' : ''}`;
          row.innerHTML = `
            <span class="selbot-ar-conv-title">${this.escapeHTML(conv.title || 'Perbualan Sains')}</span>
            <button type="button" class="selbot-ar-conv-del" title="Padam perbualan">×</button>
          `;
          row.addEventListener('click', (e) => {
            if (e.target.closest('.selbot-ar-conv-del')) {
              e.stopPropagation();
              this.deleteConversation(conv.id);
              return;
            }
            this.loadConversation(conv.id);
            this.toggleHistoryPanel(false);
          });
          container.appendChild(row);
        });
      });
    },

    renderMessagesToFeeds() {
      const msgs = ARState.selbot.messages || [];

      [DOM.selbotArChatFeed, DOM.povSelbotChatFeed].forEach((feed) => {
        if (!feed) return;
        feed.innerHTML = '';

        msgs.forEach((m) => {
          const row = document.createElement('div');
          const isUser = m.role === 'user';
          const isErr = !!m.isError;
          row.className = `selbot-msg-row ${isUser ? 'is-user' : 'is-bot'}${isErr ? ' is-error' : ''}`;

          if (isUser) {
            row.innerHTML = `
              <div class="selbot-msg-bubble">
                <div>${this.escapeHTML(m.content)}</div>
                <div class="selbot-msg-meta" style="justify-content:flex-end;">
                  <span>${this.escapeHTML(m.timeStr || '')}</span>
                </div>
              </div>
            `;
          } else if (isErr) {
            row.innerHTML = `
              <img src="../assets/selbot/selbot-avatar.svg" alt="SelBot" class="selbot-msg-avatar" />
              <div class="selbot-msg-bubble">
                <div><strong>⚠️ Ralat Sambungan:</strong> ${this.escapeHTML(m.content)}</div>
                <button type="button" class="btn-selbot-retry">↻ Cuba Lagi</button>
              </div>
            `;
            const retryBtn = row.querySelector('.btn-selbot-retry');
            if (retryBtn) {
              retryBtn.addEventListener('click', () => {
                if (ARState.selbot.lastSentMessage) {
                  ARState.selbot.messages = ARState.selbot.messages.filter(item => item !== m);
                  this.renderMessagesToFeeds();
                  this.submitQuestion(ARState.selbot.lastSentMessage, true);
                }
              });
            }
          } else {
            const badgeHtml = m.modelInfo ? `<span class="selbot-msg-badge">${this.escapeHTML(m.modelInfo)}</span>` : '';
            row.innerHTML = `
              <img src="../assets/selbot/selbot-avatar.svg" alt="SelBot" class="selbot-msg-avatar" />
              <div class="selbot-msg-bubble">
                <div>${this.formatReplyHTML(m.content)}</div>
                <div class="selbot-msg-meta">
                  ${badgeHtml}
                  <span>${this.escapeHTML(m.timeStr || '')}</span>
                </div>
              </div>
            `;
          }

          feed.appendChild(row);
        });

        this.scrollToBottom(feed);
      });
    },

    scrollToBottom(feedEl) {
      if (!feedEl) return;
      requestAnimationFrame(() => {
        feedEl.scrollTop = feedEl.scrollHeight;
      });
    },

    setTypingState(isTyping) {
      ARState.selbot.isRequestInProgress = isTyping;
      [DOM.selbotArTypingIndicator, DOM.povSelbotTypingIndicator].forEach((el) => {
        if (!el) return;
        if (isTyping) el.classList.remove('hidden');
        else el.classList.add('hidden');
      });
      [DOM.btnSelbotArSend, DOM.btnPovSelbotSend].forEach((btn) => {
        if (btn) btn.disabled = isTyping;
      });
      if (isTyping) {
        this.scrollToBottom(DOM.selbotArChatFeed);
        this.scrollToBottom(DOM.povSelbotChatFeed);
      }
    },

    clearUserSessionState() {
      this.clearSensitiveSessionState();
    },

    sendMessage(rawVal, source = 'floating') {
      return this.submitQuestion(rawVal, false, source);
    },

    async submitQuestion(rawVal, isRetry = false) {
      if (!rawVal || ARState.selbot.isRequestInProgress) return;
      const cleanVal = String(rawVal).trim();
      if (!cleanVal) return;

      ARState.selbot.lastSentMessage = cleanVal;

      if (DOM.selbotArInput) DOM.selbotArInput.value = '';
      if (DOM.povSelbotInput) DOM.povSelbotInput.value = '';

      const requestUserId = ARState.selbot.currentUserId;
      let targetConvId = ARState.selbot.activeConversationId;
      const timeStr = this.getNowTimeStr();

      if (!isRetry) {
        ARState.selbot.messages.push({
          id: 'usr_' + Date.now(),
          role: 'user',
          content: cleanVal,
          timeStr
        });
        this.renderMessagesToFeeds();
      }

      this.setTypingState(true);

      // FASA 4F.2: Use Unified SelBotConversationService if available
      if (window.SelBotConversationService && requestUserId && requestUserId !== 'guest') {
        try {
          const res = await window.SelBotConversationService.sendMessage({
            message: cleanVal,
            history: ARState.selbot.conversationHistory
          });

          this.setTypingState(false);
          if (ARState.selbot.currentUserId !== requestUserId) return;

          ARState.selbot.conversationHistory.push({ role: 'user', content: cleanVal });
          ARState.selbot.conversationHistory.push({ role: 'assistant', content: res.reply });
          if (ARState.selbot.conversationHistory.length > 10) {
            ARState.selbot.conversationHistory = ARState.selbot.conversationHistory.slice(-10);
          }

          ARState.selbot.messages.push({
            id: res.messageId,
            role: 'assistant',
            content: res.reply,
            modelInfo: res.modelBadge,
            timeStr: this.getNowTimeStr()
          });
          this.renderMessagesToFeeds();
          ARState.selbot.activeConversationId = res.conversationId;
          ARState.selbot.conversations = window.SelBotConversationService.conversations;
          this.renderConversationLists();
          return;
        } catch (svcErr) {
          console.warn('[SelBotAR] Service send notice:', svcErr.message);
          this.setTypingState(false);
          ARState.selbot.messages.push({
            id: 'err_' + Date.now(),
            role: 'assistant',
            content: svcErr.message || 'Ralat sambungan dengan pelayan SelBot.',
            isError: true,
            timeStr: this.getNowTimeStr()
          });
          this.renderMessagesToFeeds();
          return;
        }
      }

      // 1. Create conversation in Supabase if authenticated and fresh conversation
      if (this.supabaseClient && requestUserId && requestUserId !== 'guest' && !targetConvId) {
        try {
          const autoTitle = cleanVal.length > 36 ? cleanVal.slice(0, 36) + '...' : cleanVal;
          const { data: newConv, error: newConvErr } = await this.supabaseClient
            .from('selbot_conversations')
            .insert({ user_id: requestUserId, title: autoTitle })
            .select()
            .single();

          if (!newConvErr && newConv) {
            targetConvId = newConv.id;
            ARState.selbot.activeConversationId = newConv.id;
            try { sessionStorage.setItem(`arselnel_active_conv_${requestUserId}`, targetConvId); } catch (_) {}
            ARState.selbot.conversations.unshift(newConv);
            this.renderConversationLists();
          }
        } catch (convErr) {
          console.warn('[SelBotAR] Create conv notice:', convErr.message);
        }
      }

      // 2. Save user message to Supabase (skip on retry to avoid duplicating DB user row)
      if (!isRetry && this.supabaseClient && requestUserId && requestUserId !== 'guest' && targetConvId) {
        try {
          await this.supabaseClient
            .from('selbot_messages')
            .insert({
              conversation_id: targetConvId,
              user_id: requestUserId,
              role: 'user',
              content: cleanVal
            });
        } catch (msgErr) {
          console.warn('[SelBotAR] User message save notice:', msgErr.message);
        }
      }

      // 3. Get JWT token if authenticated
      let userToken = '';
      if (this.supabaseClient && this.supabaseClient.auth) {
        try {
          const { data: sessionData } = await this.supabaseClient.auth.getSession();
          userToken = sessionData?.session?.access_token || '';
        } catch (_) {}
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
        }

        const response = await fetch('/api/selbot/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: cleanVal,
            conversation_id: targetConvId || undefined,
            history: ARState.selbot.conversationHistory
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json().catch(() => ({}));
        this.setTypingState(false);

        if (ARState.selbot.currentUserId !== requestUserId) {
          return;
        }

        if (response.ok && (data.success || data.reply)) {
          const replyText = data.reply || 'Maaf, saya tidak menerima respons yang lengkap.';
          const modelBadge = data.provider === 'google-gemini' ? 'Gemini AI' :
                             data.provider === 'openai' ? 'GPT-4o Mini' :
                             data.provider === 'groq' ? 'Groq Llama' :
                             'Kurikulum Sains T1';

          ARState.selbot.conversationHistory.push({ role: 'user', content: cleanVal });
          ARState.selbot.conversationHistory.push({ role: 'assistant', content: replyText });
          if (ARState.selbot.conversationHistory.length > 10) {
            ARState.selbot.conversationHistory = ARState.selbot.conversationHistory.slice(-10);
          }

          ARState.selbot.messages.push({
            id: data.message_id || ('bot_' + Date.now()),
            role: 'assistant',
            content: replyText,
            modelInfo: modelBadge,
            timeStr: this.getNowTimeStr()
          });
          this.renderMessagesToFeeds();

          // Client dual-persistence fallback if server did not record assistant message
          if (this.supabaseClient && requestUserId && requestUserId !== 'guest' && targetConvId && !data.saved) {
            try {
              const { error: rpcErr } = await this.supabaseClient.rpc('selbot_record_assistant_message', {
                p_conversation_id: targetConvId,
                p_content: replyText,
                p_model_info: modelBadge
              });
              if (rpcErr) {
                await this.supabaseClient.from('selbot_messages').insert({
                  conversation_id: targetConvId,
                  user_id: requestUserId,
                  role: 'assistant',
                  content: replyText,
                  model_info: modelBadge
                });
              }
            } catch (fbErr) {
              console.warn('[SelBotAR] Fallback assistant save notice:', fbErr.message);
            }
          }

          if (targetConvId) {
            const cur = ARState.selbot.conversations.find(c => c.id === targetConvId);
            if (cur) {
              cur.updated_at = new Date().toISOString();
              // Re-sort so current active conversation is at the top
              ARState.selbot.conversations = [
                cur,
                ...ARState.selbot.conversations.filter(c => c.id !== targetConvId)
              ];
              this.renderConversationLists();
            }
            if (this.supabaseClient && requestUserId && requestUserId !== 'guest') {
              this.supabaseClient
                .from('selbot_conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', targetConvId)
                .eq('user_id', requestUserId)
                .then(() => {})
                .catch(() => {});
            }
          }
        } else {
          const errMsg = data.error || `Ralat pelayan (${response.status}). Sila cuba lagi sebentar lagi.`;
          ARState.selbot.messages.push({
            id: 'err_' + Date.now(),
            role: 'assistant',
            content: errMsg,
            isError: true,
            timeStr: this.getNowTimeStr()
          });
          this.renderMessagesToFeeds();
        }
      } catch (err) {
        clearTimeout(timeoutId);
        this.setTypingState(false);
        const friendlyErr = err.name === 'AbortError'
          ? 'Masa menunggu tamat (respons terlalu lama). Sila cuba lagi.'
          : 'Tidak dapat menghubungi pelayan SelBot. Sila periksa sambungan internet anda.';
        ARState.selbot.messages.push({
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: friendlyErr,
          isError: true,
          timeStr: this.getNowTimeStr()
        });
        this.renderMessagesToFeeds();
      }
    }
  };

  function stopVideoPlayback() {
    // Fasa 4E-B.2: Non-destructive audio & playback silencing. Iframe and session remain intact!
    pauseVideo();
  }

  // =========================================================================
  // FASA 4E-B.2.1: MULTI-PANEL SPATIAL WORKSPACE & ADD SCAN ENGINE
  // =========================================================================

  const SCAN_STATES = {
    IDLE: 'IDLE',
    INITIAL_SCAN: 'INITIAL_SCAN',
    PANEL_ACTIVE: 'PANEL_ACTIVE',
    ADD_PANEL: 'ADD_PANEL'
  };

  /**
   * Set Multi-Panel Scan State
   */
  function setScanState(newState) {
    console.log(`[MultiPanel] 🔄 Perubahan Scan State: ${ARState.scanState} ➔ ${newState}`);
    ARState.scanState = newState;

    if (!DOM.btnAddScan) return;

    if (newState === SCAN_STATES.ADD_PANEL) {
      DOM.btnAddScan.classList.add('scanning-pulse');
      DOM.btnAddScan.innerHTML = `
        <span class="material-symbols-outlined">document_scanner</span>
        <span>Mengimbas Kad AR Baharu...</span>
      `;
      if (DOM.btnCancelScan) DOM.btnCancelScan.classList.remove('hidden');
      showToast('Arahkan kamera ke kad AR seterusnya (cth: Nota) untuk menambah panel.');
      
      // Semak jika marker seterusnya sudah berada dalam pandangan kamera
      checkCurrentlyVisibleAnchors();
    } else {
      DOM.btnAddScan.classList.remove('scanning-pulse');
      DOM.btnAddScan.innerHTML = `
        <span class="material-symbols-outlined">add_circle</span>
        <span>+ Tambah Imbasan Baharu</span>
      `;
      if (DOM.btnCancelScan) DOM.btnCancelScan.classList.add('hidden');
    }
  }

  /**
   * Semak jika mana-mana anchor marker sasaran sudah kelihatan dalam pandangan kamera
   */
  function checkCurrentlyVisibleAnchors() {
    if (ARState.scanState !== SCAN_STATES.ADD_PANEL) return;

    // Jika pengguna belum mempunyai nota dan marker nota kelihatan
    if (!ARState.activePanels.has('nota')) {
      if (ARState.anchorNota && ARState.anchorNota.group && ARState.anchorNota.group.visible) {
        console.log('[MultiPanel] 🎯 Marker Nota dikesan sedang dalam pandangan kamera!');
        addPanelToSpatialWorkspace('nota');
        return;
      }
    }

    // Jika pengguna belum mempunyai video dan marker video kelihatan
    if (!ARState.activePanels.has('video')) {
      if (ARState.anchorVideo && ARState.anchorVideo.group && ARState.anchorVideo.group.visible) {
        console.log('[MultiPanel] 🎯 Marker Video dikesan sedang dalam pandangan kamera!');
        addPanelToSpatialWorkspace('video');
        return;
      }
    }

    // Jika pengguna belum mempunyai CellQuest 3D dan marker CellQuest kelihatan (Fasa 4E-C.3A & 4E-D.1)
    if (!ARState.activePanels.has('cellquest')) {
      if (ARState.anchorCellQuestAnimal && ARState.anchorCellQuestAnimal.group && ARState.anchorCellQuestAnimal.group.visible) {
        console.log('[MultiPanel] 🎯 Marker Sel Haiwan dikesan sedang dalam pandangan kamera!');
        addPanelToSpatialWorkspace('cellquest', 'animal');
        return;
      }
      if (ARState.anchorCellQuestPlant && ARState.anchorCellQuestPlant.group && ARState.anchorCellQuestPlant.group.visible) {
        console.log('[MultiPanel] 🎯 Marker Sel Tumbuhan dikesan sedang dalam pandangan kamera!');
        addPanelToSpatialWorkspace('cellquest', 'plant');
        return;
      }
      if (ARState.anchorCellQuest && ARState.anchorCellQuest.group && ARState.anchorCellQuest.group.visible) {
        console.log('[MultiPanel] 🎯 Marker CellQuest 3D dikesan sedang dalam pandangan kamera!');
        addPanelToSpatialWorkspace('cellquest', (typeof CellQuestARController !== 'undefined' ? CellQuestARController.activeCellType : 'animal'));
        return;
      }
    }
  }

  /**
   * Permulaan mod imbas panel baharu
   */
  function startAddPanelScan() {
    const domCount = ['video', 'nota'].filter(m => ARState.activePanels.has(m)).length;
    const hasCQ = ARState.activePanels.has('cellquest');
    const totalCount = ARState.activePanels.size;

    if (totalCount >= 3 || (domCount >= 2 && hasCQ)) {
      showToast('Maksimum 3 modul aktif serentak (Video, Nota & CellQuest 3D).');
      return;
    }
    // Jika pengguna belum mengunci atau menyemat panel/model, berikan panduan jelas untuk meletakkannya terlebih dahulu
    const cqIsSpatial = (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive && (CellQuestARController.spatialMode === 'POV_LOCKED' || CellQuestARController.spatialMode === 'SCREEN_PINNED'));
    if (ARState.systemMode === SYSTEM_MODES.MARKER && !ARState.isPinned && !cqIsSpatial) {
      showToast('📌 Sila semat ("Semat Skrin") atau kunci pandangan panel/model terlebih dahulu sebelum menambah imbasan baharu.');
      return;
    }
    ARState.markerCooldown = {};
    setScanState(SCAN_STATES.ADD_PANEL);
  }

  /**
   * Batal mod imbas panel baharu
   */
  function cancelAddPanelScan() {
    setScanState(SCAN_STATES.PANEL_ACTIVE);
    showToast('Imbasan panel baharu dibatalkan.');
  }

  /**
   * Pengendali Utama Pengesanan Marker (Target Found)
   * Fasa 4E-D.1: Menyokong parameter pilihan cellType ('animal' | 'plant')
   */
  function handleTargetFound(targetIndex, moduleName, cellType) {
    // FASA PEMBERSIHAN KOTAK ARSELNEL: Kuiz (2) & SelBot AI (7) dinyahaktifkan sepenuhnya dari Kotak ARSELNEL
    if (targetIndex === 2 || moduleName === 'kuiz' || targetIndex === 7 || moduleName === 'selbot') {
      return;
    }

    // Fasa 4E-E.2: Target 5 = Marker Jelajah 3D (Lightweight Intro Panel)
    if (targetIndex === 5 || moduleName === 'jelajah3d') {
      if (typeof GameSessionManager !== 'undefined' && GameSessionManager.isGameActive()) {
        return;
      }
      const now5 = Date.now();
      if (ARState.markerCooldown && ARState.markerCooldown.jelajah3d && now5 < ARState.markerCooldown.jelajah3d) {
        return;
      }
      ARState.targetVisible = true;
      ARState.currentMarkerIndex = 5;
      ARState.lastDetectedTarget = 5;
      if (DOM.diagMarkerStatus) {
        DOM.diagMarkerStatus.textContent = 'Sasaran 5 Dikesan (Jelajah 3D)';
        DOM.diagMarkerStatus.className = 'v ok';
      }
      hideScannerDelayedTips();
      showPostDetectionGuide('jelajah3d');
      openJelajah3DIntroPanel();
      return;
    }

    // Fasa 4E-E.3: Target 6 = Marker AR Orientasi Dunia (Lightweight Intro Panel)
    if (targetIndex === 6 || moduleName === 'orientasi') {
      if (typeof GameSessionManager !== 'undefined' && GameSessionManager.isGameActive()) {
        return;
      }
      const now6 = Date.now();
      if (ARState.markerCooldown && ARState.markerCooldown.orientasi && now6 < ARState.markerCooldown.orientasi) {
        return;
      }
      ARState.targetVisible = true;
      ARState.currentMarkerIndex = 6;
      ARState.lastDetectedTarget = 6;
      if (DOM.diagMarkerStatus) {
        DOM.diagMarkerStatus.textContent = 'Sasaran 6 Dikesan (AR Orientasi Dunia)';
        DOM.diagMarkerStatus.className = 'v ok';
      }
      hideScannerDelayedTips();
      showPostDetectionGuide('orientasi_dunia');
      openOrientasiDuniaIntroPanel();
      return;
    }

    if (!moduleName) {
      if (targetIndex === 0) moduleName = 'video';
      else if (targetIndex === 1) moduleName = 'nota';
      else if (targetIndex === 2) moduleName = 'kuiz';
      else if (targetIndex === 3) { moduleName = 'cellquest'; cellType = cellType || 'animal'; }
      else if (targetIndex === 4) { moduleName = 'cellquest'; cellType = cellType || 'plant'; }
      else if (targetIndex === 7) moduleName = 'selbot';
    }

    // 🛡️ ISOLATION: Jika permainan aktif, sekat sebarang gangguan marker
    if (GameSessionManager.isGameActive()) {
      console.log(`[KotakAR] 🛡️ Permainan aktif, pengesanan Marker ${moduleName} diabaikan.`);
      return;
    }

    // 🛡️ FASA 4F.2 MODUL ISOLATION: Jika modul (terutamanya SelBot AI) sedang aktif / tersemat / POV_LOCKED,
    // sekat sebarang marker lain daripada mencelah atau membuka modul Kuiz/Video/Nota secara tiba-tiba
    // kecuali jika pengguna secara eksplisit menekan butang '+ Tambah Imbasan Baharu' (SCAN_STATES.ADD_PANEL)
    if (ARState.activePanels.size > 0 && !ARState.activePanels.has(moduleName)) {
      if (ARState.scanState !== SCAN_STATES.ADD_PANEL) {
        console.log(`[KotakAR] 🛡️ Modul '${ARState.activeModule}' sedang aktif. Pengesanan latar belakang marker '${moduleName}' diabaikan demi kestabilan.`);
        return;
      }
    }

    // Tentukan jenis sel jika CellQuest dikesan melalui indeks
    if (moduleName === 'cellquest' && !cellType) {
      cellType = (targetIndex === 4) ? 'plant' : 'animal';
    }

    // 🛡️ COOLDOWN: Jika marker baru sahaja ditutup secara manual, sekat pengesanan seketika
    if (ARState.markerCooldown) {
      if (ARState.markerCooldown[moduleName] && Date.now() < ARState.markerCooldown[moduleName]) {
        console.log(`[MultiPanel] ⏳ Marker ${moduleName} dalam tempoh bertenang (cooldown). Diabaikan.`);
        return;
      }
      if (cellType && ARState.markerCooldown[`cellquest_${cellType}`] && Date.now() < ARState.markerCooldown[`cellquest_${cellType}`]) {
        console.log(`[MultiPanel] ⏳ Marker ${moduleName} (${cellType}) dalam tempoh bertenang (cooldown). Diabaikan.`);
        return;
      }
    }

    console.log(`[MultiPanel] 🎯 Marker [${targetIndex}] (${moduleName}${cellType ? ':' + cellType : ''}) dikesan. ScanState semasa: ${ARState.scanState}`);
    ARState.targetVisible = true;
    ARState.currentMarkerIndex = targetIndex;
    ARState.lastDetectedTarget = targetIndex;

    // KES 1: Mod Imbas Panel Tambahan (+ Tambah Imbasan Baharu)
    if (ARState.scanState === SCAN_STATES.ADD_PANEL) {
      if (!ARState.activePanels.has(moduleName)) {
        addPanelToSpatialWorkspace(moduleName, cellType);
      } else {
        console.log(`[MultiPanel] ℹ️ Panel/Modul ${moduleName} sudah aktif dalam ruang kerja.`);
        focusPanel(moduleName);
        if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
        setScanState(SCAN_STATES.PANEL_ACTIVE);
        showToast('Panel sudah aktif. Paparan difokuskan.');
      }
      return;
    }

    // KES 2: Panel Sudah Aktif (PANEL_ACTIVE) ATAU modul ini sudah wujud dalam activePanels (Re-Scan)
    if (ARState.activePanels.has(moduleName)) {
      clearTimeout(ARState.lostTimeout);
      ARState.isTracking = true;
      if (moduleName === 'video' && ARState.anchorVideo) ARState.anchor = ARState.anchorVideo;
      if (moduleName === 'nota' && ARState.anchorNota) ARState.anchor = ARState.anchorNota;
      if (moduleName === 'kuiz' && ARState.anchorKuiz) ARState.anchor = ARState.anchorKuiz;
      if (moduleName === 'selbot' && ARState.anchorSelbot) ARState.anchor = ARState.anchorSelbot;

      const nameMap = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', cellquest: 'CellQuest 3D', selbot: 'SelBot AI' };
      const modLabel = nameMap[moduleName] || moduleName;

      if (moduleName === 'cellquest') {
        if (cellType && typeof CellQuestARController !== 'undefined' && CellQuestARController.activeCellType && cellType !== CellQuestARController.activeCellType) {
          console.log(`[CellQuestAR] 🛡️ Sesi CellQuest (${CellQuestARController.activeCellType}) sedang aktif. Pengesanan marker ${cellType} diabaikan tanpa gangguan.`);
          return;
        }
        if (cellType === 'plant' && ARState.anchorCellQuestPlant) {
          ARState.anchorCellQuest = ARState.anchorCellQuestPlant;
        } else if (ARState.anchorCellQuestAnimal) {
          ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
        }
        if (ARState.anchorCellQuest) {
          ARState.anchor = ARState.anchorCellQuest;
        }
        if (typeof CellQuestARController !== 'undefined') {
          if (CellQuestARController.spatialMode === 'MARKER_MODE' && ARState.anchorCellQuest) {
            CellQuestARController.anchorGroup = ARState.anchorCellQuest.group;
            if (CellQuestARController.rootGroup && CellQuestARController.rootGroup.parent !== CellQuestARController.anchorGroup) {
              CellQuestARController.anchorGroup.add(CellQuestARController.rootGroup);
            }
          }
          if (typeof CellQuestARController.onTargetFound === 'function') {
            CellQuestARController.onTargetFound();
          }
        }
        if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
        hideScannerDelayedTips();
        focusPanel('cellquest');
        setScanState(SCAN_STATES.PANEL_ACTIVE);
        showToast(`Panel ${modLabel} telah difokuskan.`);
        return;
      }

      // Check whether panel is in single-panel mode (#floating-ar-anchor) or multi-panel SpatialPanelManager (#pov-panel-[mod])
      const isMulti = ARState.activePanels.size > 1 || (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible(moduleName));
      let wasHidden = false;

      if (!isMulti && DOM.floatingAnchor && ARState.activePanels.size <= 1) {
        wasHidden = !DOM.floatingAnchor.classList.contains('is-visible') || DOM.floatingAnchor.classList.contains('hidden');
        DOM.floatingAnchor.classList.remove('hidden');
        DOM.floatingAnchor.classList.add('is-visible');
        requestAnimationFrame(() => clampPanelIntoViewport());
      } else if (typeof SpatialPanelManager !== 'undefined') {
        const p = SpatialPanelManager.getPanel(moduleName);
        const el = p ? (p.element || document.getElementById(p.elementId)) : null;
        wasHidden = !SpatialPanelManager.isPanelVisible(moduleName) || (el && (el.classList.contains('hidden') || el.style.opacity === '0' || el.style.visibility === 'hidden'));
        SpatialPanelManager.setPanelVisibility(moduleName, true);
        if (el) {
          el.classList.remove('hidden');
          el.classList.add('is-visible');
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        }
      }

      if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
      hideScannerDelayedTips();
      showPostDetectionGuide(moduleName);
      focusPanel(moduleName);
      setScanState(SCAN_STATES.PANEL_ACTIVE);

      if (wasHidden) {
        showToast(`Panel ${modLabel} telah dibuka semula.`);
      } else {
        showToast(`Panel ${modLabel} sudah aktif. Paparan telah difokuskan.`);
      }
      return;
    }

    // KES 3: Jika modul ini belum ada dan panel lain sudah aktif -> Tambah ke ruang kerja spatial
    if (ARState.activePanels.size > 0) {
      addPanelToSpatialWorkspace(moduleName, cellType);
      return;
    }

    // KES 4: Initial Scan (atau tiada panel aktif) - PULIHKAN ALIRAN MARKER ASAL
    clearTimeout(ARState.lostTimeout);
    ARState.isTracking = true;
    if (moduleName === 'video' && ARState.anchorVideo) ARState.anchor = ARState.anchorVideo;
    if (moduleName === 'nota' && ARState.anchorNota) ARState.anchor = ARState.anchorNota;
    if (moduleName === 'kuiz' && ARState.anchorKuiz) ARState.anchor = ARState.anchorKuiz;
    if (moduleName === 'selbot' && ARState.anchorSelbot) ARState.anchor = ARState.anchorSelbot;
    if (moduleName === 'cellquest') {
      if (cellType === 'plant' && ARState.anchorCellQuestPlant) {
        ARState.anchorCellQuest = ARState.anchorCellQuestPlant;
      } else if (ARState.anchorCellQuestAnimal) {
        ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
      }
      if (ARState.anchorCellQuest) {
        ARState.anchor = ARState.anchorCellQuest;
      }
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.anchorGroup = ARState.anchorCellQuest ? ARState.anchorCellQuest.group : CellQuestARController.anchorGroup;
        CellQuestARController.activeCellType = cellType || 'animal';
        CellQuestARController.loadModel(cellType || 'animal');
      }
    }

    switchActiveModule(moduleName);
    ARState.activePanels.add(moduleName);
    setScanState(SCAN_STATES.PANEL_ACTIVE);
    updateMultiPanelUI();

    if (moduleName === 'cellquest' && typeof CellQuestARController !== 'undefined') {
      CellQuestARController.activate();
      if (typeof CellQuestARController.onTargetFound === 'function') {
        CellQuestARController.onTargetFound();
      }
    }

    if (ARSessionRecoveryManager && typeof ARSessionRecoveryManager.setState === 'function') {
      ARSessionRecoveryManager.setState(ARSessionRecoveryManager.State.MARKER_ACTIVE, { module: moduleName });
    }

    if (ARState.systemMode === SYSTEM_MODES.MARKER && moduleName !== 'cellquest') {
      if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');
      if (DOM.floatingAnchor) DOM.floatingAnchor.classList.add('is-visible');
      requestAnimationFrame(() => clampPanelIntoViewport());
    }
    hideScannerDelayedTips();
    showPostDetectionGuide(moduleName);
    focusPanel(moduleName);
  }

  /**
   * Pengendali Kehilangan Marker (Target Lost)
   */
  function handleTargetLost(targetIndex, moduleName) {
    if (!moduleName) {
      if (targetIndex === 0) moduleName = 'video';
      else if (targetIndex === 1) moduleName = 'nota';
      else if (targetIndex === 2) moduleName = 'kuiz';
      else if (targetIndex === 3 || targetIndex === 4) moduleName = 'cellquest';
      else if (targetIndex === 7) moduleName = 'selbot';
    }
    if (ARState.markerCooldown && moduleName) {
      ARState.markerCooldown[moduleName] = 0;
    }
    if (moduleName === 'cellquest' && ARState.markerCooldown) {
      ARState.markerCooldown['cellquest_animal'] = 0;
      ARState.markerCooldown['cellquest_plant'] = 0;
    }
  }

  /**
   * Helper: Promosikan panel terapung tunggal (#floating-ar-anchor) ke panel bebas SpatialPanelManager
   */
  function promoteFloatingPanelToWorkspace() {
    ['video', 'nota', 'kuiz', 'selbot'].forEach((m) => {
      if (ARState.activePanels.has(m) && typeof SpatialPanelManager !== 'undefined' && !SpatialPanelManager.isPanelVisible(m)) {
        SpatialPanelManager.setPanelVisibility(m, true);
        const p = SpatialPanelManager.getPanel(m);
        if (p && p.placementMode !== 'POV_LOCKED' && p.placementMode !== 'SCREEN_PINNED') {
          SpatialPanelManager.setPlacementMode(m, 'MARKER_FOLLOW');
        }
        if (m === 'video') {
          if (ARState.activeVideo) syncPOVVideoPlayer(ARState.activeVideo);
          else renderPOVVideoCardsList();
        } else if (m === 'nota') {
          if (ARState.activeNote) syncPOVNoteContent();
          else renderPOVNoteCardsList();
        } else if (m === 'kuiz') {
          if (!ARState.activeQuiz && !GameSessionManager.isGameActive()) renderPOV5GamesCatalog();
        } else if (m === 'selbot') {
          SelBotARController.init();
        }
      }
    });
    if (DOM.floatingAnchor) {
      DOM.floatingAnchor.classList.remove('is-visible');
      DOM.floatingAnchor.classList.add('hidden');
    }
  }

  /**
   * Menambah Panel ke Ruang Kerja Spatial (Multi-Panel Persistence)
   * Fasa 4E-D.1: Menyokong parameter pilihan cellType ('animal' | 'plant')
   */
  function addPanelToSpatialWorkspace(moduleName, cellType) {
    console.log(`[MultiPanel] ➕ Menambah modul/panel ${moduleName}${cellType ? ':' + cellType : ''} ke ruang spatial...`);
    promoteFloatingPanelToWorkspace();
    ARState.activePanels.add(moduleName);

    if (moduleName === 'nota') {
      // 1. Jeda audio video secara sopan, sesi iframe kekal utuh
      pauseVideo();

      // 2. Buka panel Nota bebas (#pov-panel-nota) dalam mod MARKER_FOLLOW secara lalai
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('nota', true);
        const pNota = SpatialPanelManager.getPanel('nota');
        if (!pNota || (pNota.placementMode !== 'POV_LOCKED' && pNota.placementMode !== 'SCREEN_PINNED')) {
          SpatialPanelManager.setPlacementMode('nota', 'MARKER_FOLLOW');
        }
      }
      if (DOM.povPanelNota) {
        DOM.povPanelNota.classList.remove('hidden', 'is-centered');
        DOM.povPanelNota.classList.add('is-visible');
        DOM.povPanelNota.style.opacity = '1';
        DOM.povPanelNota.style.visibility = 'visible';
        DOM.povPanelNota.style.pointerEvents = 'auto';
      }
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.syncPanelControlUI('nota');
      }

      // 3. Paparkan pemilih atau pembaca Nota
      if (!ARState.activeNote) {
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.remove('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (!ARState.notes || ARState.notes.length === 0) {
          loadNotesFromCMS().then(() => {
            renderPOVNoteCardsList();
          });
        } else {
          renderPOVNoteCardsList();
        }
      } else {
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
        renderNoteContent();
        syncPOVNoteContent();
      }

      showToast('Panel Nota berjaya ditambah ke ruang AR!');
    } else if (moduleName === 'video') {
      // Buka panel Video bebas (#pov-panel-video) dalam mod MARKER_FOLLOW secara lalai
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('video', true);
        const pVid = SpatialPanelManager.getPanel('video');
        if (!pVid || (pVid.placementMode !== 'POV_LOCKED' && pVid.placementMode !== 'SCREEN_PINNED')) {
          SpatialPanelManager.setPlacementMode('video', 'MARKER_FOLLOW');
        }
      }
      if (DOM.povPanelVideo) {
        DOM.povPanelVideo.classList.remove('hidden', 'is-centered');
        DOM.povPanelVideo.classList.add('is-visible');
        DOM.povPanelVideo.style.opacity = '1';
        DOM.povPanelVideo.style.visibility = 'visible';
        DOM.povPanelVideo.style.pointerEvents = 'auto';
      }
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.syncPanelControlUI('video');
      }

      if (!ARState.activeVideo) {
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.remove('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (!ARState.videos || ARState.videos.length === 0) {
          loadVideosFromCMS().then(() => {
            renderPOVVideoCardsList();
          });
        } else {
          renderPOVVideoCardsList();
        }
      } else {
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
        syncPOVVideoPlayer(ARState.activeVideo);
      }

      showToast('Panel Video berjaya ditambah ke ruang AR!');
    } else if (moduleName === 'kuiz') {
      // 1. Jeda video secara sopan jika sedang bermain
      pauseVideo();

      // 2. Buka panel Kuiz bebas (#pov-panel-kuiz) dalam mod MARKER_FOLLOW secara lalai
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('kuiz', true);
        const pKuiz = SpatialPanelManager.getPanel('kuiz');
        if (!pKuiz || (pKuiz.placementMode !== 'POV_LOCKED' && pKuiz.placementMode !== 'SCREEN_PINNED')) {
          SpatialPanelManager.setPlacementMode('kuiz', 'MARKER_FOLLOW');
        }
      }
      if (DOM.povPanelKuiz) {
        DOM.povPanelKuiz.classList.remove('hidden', 'is-centered');
        DOM.povPanelKuiz.classList.add('is-visible');
        DOM.povPanelKuiz.style.opacity = '1';
        DOM.povPanelKuiz.style.visibility = 'visible';
        DOM.povPanelKuiz.style.pointerEvents = 'auto';
      }
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.syncPanelControlUI('kuiz');
      }

      // 3. Paparkan pemilih Kuiz / katalog 5 permainan
      if (!ARState.games || ARState.games.length === 0) {
        loadGamesCatalog();
      }
      if (!ARState.activeQuiz && !GameSessionManager.isGameActive()) {
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
        if (DOM.povEmbeddedGameView) DOM.povEmbeddedGameView.classList.add('hidden');
        renderPOV5GamesCatalog();
      }

      showToast('Panel Kuiz berjaya ditambah ke ruang AR!');
    } else if (moduleName === 'cellquest') {
      // 1. Jeda video secara sopan jika sedang bermain
      pauseVideo();

      const type = cellType || (typeof CellQuestARController !== 'undefined' ? CellQuestARController.activeCellType : 'animal');

      // 2. Halakan anchor aktif ke anchor CellQuest yang sepadan
      if (type === 'plant' && ARState.anchorCellQuestPlant) {
        ARState.anchorCellQuest = ARState.anchorCellQuestPlant;
      } else if (ARState.anchorCellQuestAnimal) {
        ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
      }
      if (ARState.anchorCellQuest) {
        ARState.anchor = ARState.anchorCellQuest;
      }

      // 3. Aktifkan CellQuest 3D Controller
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.anchorGroup = ARState.anchorCellQuest ? ARState.anchorCellQuest.group : CellQuestARController.anchorGroup;
        CellQuestARController.activeCellType = type;
        CellQuestARController.loadModel(type);
        CellQuestARController.activate();
        if (typeof CellQuestARController.onTargetFound === 'function') {
          CellQuestARController.onTargetFound();
        }
      }

      const cellLabel = type === 'plant' ? 'Sel Tumbuhan 3D' : 'Sel Haiwan 3D';
      showToast(`Modul ${cellLabel} berjaya ditambah ke ruang AR!`);
    } else if (moduleName === 'selbot') {
      pauseVideo();
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('selbot', true);
        const pSelbot = SpatialPanelManager.getPanel('selbot');
        if (!pSelbot || (pSelbot.placementMode !== 'POV_LOCKED' && pSelbot.placementMode !== 'SCREEN_PINNED')) {
          SpatialPanelManager.setPlacementMode('selbot', 'MARKER_FOLLOW');
        }
      }
      if (DOM.povPanelSelbot) {
        DOM.povPanelSelbot.classList.remove('hidden', 'is-centered');
        DOM.povPanelSelbot.classList.add('is-visible');
        DOM.povPanelSelbot.style.opacity = '1';
        DOM.povPanelSelbot.style.visibility = 'visible';
        DOM.povPanelSelbot.style.pointerEvents = 'auto';
      }
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.syncPanelControlUI('selbot');
      }
      SelBotARController.init();
      showToast('Panel SelBot AI berjaya ditambah ke ruang AR!');
    }

    // Kemas kini bar alat multi-panel
    updateMultiPanelUI();
    hideScannerDelayedTips();
    showPostDetectionGuide(moduleName);
    focusPanel(moduleName);

    // Kembali ke mod aktif
    setScanState(SCAN_STATES.PANEL_ACTIVE);
  }

  /**
   * Menyusun posisi spatial layout sebelah-menyebelah
   */
  function arrangeMultiPanelSpatialLayout() {
    // Neutral spatial layout: kekalkan kedudukan mengikut pilihan pengguna tanpa memaksa kedudukan rigid
    console.log('[MultiPanel] 📐 Multi-panel layout dikekalkan mengikut posisi pilihan pengguna.');
  }

  /**
   * Kemas kini UI bar Multi-Panel dan pil status
   */
  function updateMultiPanelUI() {
    if (!DOM.arMultiPanelBar) return;

    const count = ARState.activePanels.size;
    if (count === 0) {
      DOM.arMultiPanelBar.classList.add('hidden');
      return;
    }

    DOM.arMultiPanelBar.classList.remove('hidden');

    if (DOM.multiPanelCountText) {
      const hasCQ = ARState.activePanels.has('cellquest');
      DOM.multiPanelCountText.textContent = hasCQ ? `${count} Modul Aktif` : `${count} Panel Aktif`;
    }

    if (DOM.multiPanelTagsList) {
      DOM.multiPanelTagsList.innerHTML = '';
      ARState.activePanels.forEach((mod) => {
        if (!mod) return;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `multi-pill pill-${mod}`;
        pill.title = `Fokus ke panel ${mod}`;

        let icon = 'widgets';
        let label = mod.toUpperCase();
        if (mod === 'video') { icon = 'smart_display'; label = 'Video'; }
        if (mod === 'nota') { icon = 'auto_stories'; label = 'Nota'; }
        if (mod === 'kuiz') { icon = 'sports_esports'; label = 'Kuiz'; }
        if (mod === 'cellquest') { icon = 'biotech'; label = 'CellQuest 3D'; }
        if (mod === 'selbot') { icon = 'smart_toy'; label = 'SelBot AI'; }

        pill.innerHTML = `
          <span class="material-symbols-outlined" style="font-size:14px;">${icon}</span>
          <span>${label}</span>
          <span class="pill-close-btn" data-panel="${mod}" title="Tutup panel ${label}">×</span>
        `;

        pill.addEventListener('click', (e) => {
          if (e.target.classList.contains('pill-close-btn')) {
            e.stopPropagation();
            closePanelFromPill(mod);
          } else {
            focusPanel(mod);
          }
        });

        DOM.multiPanelTagsList.appendChild(pill);
      });
    }

    // Sorok atau paparkan butang "+ Tambah Imbasan Baharu" jika had tercapai (Maksimum 5 Modul)
    if (DOM.btnAddScan) {
      const domCount = ['video', 'nota', 'kuiz', 'selbot'].filter(m => ARState.activePanels.has(m)).length;
      const hasCQ = ARState.activePanels.has('cellquest');
      const maxReached = (count >= 5 || (domCount >= 4 && hasCQ));

      if (maxReached) {
        DOM.btnAddScan.style.opacity = '0.5';
        DOM.btnAddScan.style.pointerEvents = 'none';
        DOM.btnAddScan.title = 'Maksimum 5 modul aktif serentak (Video, Nota, Kuiz, SelBot AI & CellQuest 3D).';
      } else {
        DOM.btnAddScan.style.opacity = '1';
        DOM.btnAddScan.style.pointerEvents = 'auto';
        DOM.btnAddScan.title = 'Imbas marker baharu untuk menambah modul pembelajaran ke dalam ruang AR';
      }
    }
  }

  /**
   * Fokus atau bawa panel ke depan
   */
  function focusPanel(mod) {
    console.log(`[MultiPanel] 🔍 Fokus ke modul: ${mod}`);
    ARState.activeModule = mod;
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setActivePanel(mod);
    }

    if (mod === 'video') {
      if (DOM.povPanelVideo) DOM.povPanelVideo.style.zIndex = '2150';
      if (DOM.povPanelNota) DOM.povPanelNota.style.zIndex = '2000';
      if (DOM.povPanelKuiz) DOM.povPanelKuiz.style.zIndex = '2000';
      if (DOM.povPanelSelbot) DOM.povPanelSelbot.style.zIndex = '2000';
      if (DOM.floatingAnchor) DOM.floatingAnchor.style.zIndex = '2150';
    } else if (mod === 'nota') {
      if (DOM.povPanelNota) DOM.povPanelNota.style.zIndex = '2150';
      if (DOM.povPanelVideo) DOM.povPanelVideo.style.zIndex = '2000';
      if (DOM.povPanelKuiz) DOM.povPanelKuiz.style.zIndex = '2000';
      if (DOM.povPanelSelbot) DOM.povPanelSelbot.style.zIndex = '2000';
      if (DOM.floatingAnchor) DOM.floatingAnchor.style.zIndex = '2150';
    } else if (mod === 'kuiz') {
      if (DOM.povPanelKuiz) DOM.povPanelKuiz.style.zIndex = '2150';
      if (DOM.povPanelVideo) DOM.povPanelVideo.style.zIndex = '2000';
      if (DOM.povPanelNota) DOM.povPanelNota.style.zIndex = '2000';
      if (DOM.povPanelSelbot) DOM.povPanelSelbot.style.zIndex = '2000';
      if (DOM.floatingAnchor) DOM.floatingAnchor.style.zIndex = '2150';
    } else if (mod === 'selbot') {
      if (DOM.povPanelSelbot) DOM.povPanelSelbot.style.zIndex = '2150';
      if (DOM.povPanelVideo) DOM.povPanelVideo.style.zIndex = '2000';
      if (DOM.povPanelNota) DOM.povPanelNota.style.zIndex = '2000';
      if (DOM.povPanelKuiz) DOM.povPanelKuiz.style.zIndex = '2000';
      if (DOM.floatingAnchor) DOM.floatingAnchor.style.zIndex = '2150';
    } else if (mod === 'cellquest') {
      if (DOM.cellquestArHud) DOM.cellquestArHud.style.zIndex = '2200';
    }

    // Highlight active pill
    if (DOM.multiPanelTagsList) {
      const pills = DOM.multiPanelTagsList.querySelectorAll('.multi-pill');
      pills.forEach((p) => {
        if (p.classList.contains(`pill-${mod}`)) {
          p.classList.add('active-focus');
        } else {
          p.classList.remove('active-focus');
        }
      });
    }
  }

  /**
   * Menutup panel secara khusus dari pil atau butang tutup
   */
  function closePanelFromPill(mod) {
    console.log(`[MultiPanel] ❌ Menutup modul dari pil: ${mod}`);
    if (mod === 'video') {
      destroyVideoSession();
    } else if (mod === 'nota') {
      destroyNotaSession();
    } else if (mod === 'kuiz') {
      destroyKuizSession();
    } else if (mod === 'selbot') {
      destroySelbotSession();
    } else if (mod === 'cellquest') {
      destroyCellQuestSession();
    }
  }

  /**
   * Menamatkan sesi CellQuest 3D secara bebas tanpa menjejaskan panel Video, Nota atau Kuiz
   */
  function destroyCellQuestSession() {
    console.log('[MultiPanel] 🛑 Menutup sesi CellQuest 3D.');
    if (typeof CellQuestARController !== 'undefined') {
      CellQuestARController.deactivate();
    }
    if (DOM.cellquestArHud) DOM.cellquestArHud.classList.add('hidden');

    // Berikan tempoh bertenang 600ms agar tidak terus terbuka jika marker masih dalam pandangan kamera
    if (!ARState.markerCooldown) ARState.markerCooldown = {};
    ARState.markerCooldown['cellquest'] = Date.now() + 600;
    ARState.markerCooldown['cellquest_animal'] = Date.now() + 600;
    ARState.markerCooldown['cellquest_plant'] = Date.now() + 600;

    handlePanelClosed('cellquest');
  }

  /**
   * Pengendali penutupan panel berpusat (Lifecycle Multi-Panel Konsisten)
   */
  function handlePanelClosed(mod) {
    ARState.activePanels.delete(mod);
    console.log(`[MultiPanel] Modul ${mod} ditutup. Baki modul aktif: ${Array.from(ARState.activePanels).join(', ')}`);

    arrangeMultiPanelSpatialLayout();
    updateMultiPanelUI();

    const nameMap = { video: 'Video', nota: 'Nota', kuiz: 'Kuiz', cellquest: 'CellQuest 3D', selbot: 'SelBot AI' };
    const modLabel = nameMap[mod] || mod;

    if (ARState.activePanels.size === 0) {
      // 1. Semua modul ditutup: kembali ke keadaan sedia imbas asal
      setScanState(SCAN_STATES.INITIAL_SCAN);
      ARState.pov.active = false;
      if (ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }
      setSystemMode(SYSTEM_MODES.MARKER);
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.deactivate();
      }
      if (DOM.scannerOverlay) DOM.scannerOverlay.classList.remove('hidden');
      if (DOM.arMultiPanelBar) DOM.arMultiPanelBar.classList.add('hidden');
      ARState.markerCooldown = {};
      hidePostDetectionGuide();
      resetScannerTipsTimer();
      showToast(`Modul ${modLabel} ditutup. Sedia untuk imbasan baharu.`);
    } else {
      // 2. Masih ada modul aktif lain (cth: Nota masih aktif apabila Video ditutup)
      setScanState(SCAN_STATES.PANEL_ACTIVE);
      const remaining = Array.from(ARState.activePanels)[0];
      ARState.activeModule = remaining;
      focusPanel(remaining);
      const remainingLabel = nameMap[remaining] || remaining;
      showToast(`Modul ${modLabel} ditutup. Modul ${remainingLabel} kekal aktif.`);
    }
  }

  /**
   * Seamless Module Switching Engine (Video ↔ Nota ↔ Kuiz ↔ CellQuest)
   */
  function switchActiveModule(mod) {
    // 🛡️ ISOLATION: When an interactive AR game is ACTIVE or LOADING, protect the session!
    if (GameSessionManager.isGameActive()) {
      if (mod === 'kuiz') {
        console.log('[KotakAR] 🛡️ Sesi permainan kuiz sedang aktif. Pertukaran/render semula disekat.');
        return;
      }
      console.log(`[KotakAR] 🛡️ Permainan "${GameSessionManager.activeGameId}" sedang aktif. Pertukaran ke modul "${mod}" diabaikan.`);
      return;
    }

    if (ARState.activeModule === mod && ARState.activeNote && ARState.activeVideo && ARState.activeQuiz) return;
    console.log(`[KotakAR] 🔄 Pertukaran Modul Aktif: ${ARState.activeModule} ➔ ${mod}`);

    if (mod === 'kuiz') {
      ARState.activeModule = 'kuiz';

      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('kuiz');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('kuiz', true);
          if (!ARState.activePanels || !ARState.activePanels.has('video')) {
            SpatialPanelManager.setPanelVisibility('video', false);
          }
          if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
            SpatialPanelManager.setPanelVisibility('nota', false);
          }
        }
      }

      // 1. Pause video gracefully without destroying session & manage panel visibility
      if (ARState.activePanels && ARState.activePanels.has('video')) {
        pauseVideo();
      } else {
        hideVideoPanel();
      }
      if (ARState.activePanels && ARState.activePanels.has('nota')) {
        // preserve nota panel in workspace
      } else {
        hideNotaPanel();
      }
      if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED || (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible('kuiz'))) {
        showKuizPanel();
      } else {
        hideKuizPanel();
      }

      // 2. Point active anchor to anchorKuiz
      if (ARState.anchorKuiz) {
        ARState.anchor = ARState.anchorKuiz;
      }

      // 3. Update category tags to Purple theme
      if (DOM.panelCategoryTag) {
        DOM.panelCategoryTag.classList.remove('tag-nota', 'tag-cellquest', 'tag-selbot');
        DOM.panelCategoryTag.classList.add('tag-kuiz');
      }
      if (DOM.panelCategoryIcon) DOM.panelCategoryIcon.textContent = 'sports_esports';
      if (DOM.panelCategoryText) DOM.panelCategoryText.textContent = '3. Kuiz & Permainan ARSELNEL';

      // Update card containers to Purple theme
      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('module-nota', 'module-cellquest', 'module-selbot');
        DOM.floatingCard.classList.add('module-kuiz');
      }
      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota', 'module-cellquest', 'module-selbot');
        DOM.povCard.classList.add('module-kuiz');
      }

      // Update button labels
      if (DOM.btnChangeContentText) DOM.btnChangeContentText.textContent = 'Tukar Permainan';
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Permainan';

      // Hide SelBot view in single floating panel
      if (DOM.selbotArView) DOM.selbotArView.classList.add('hidden');
      if (!ARState.activePanels || !ARState.activePanels.has('selbot')) {
        hideSelbotPanel();
      }

      // Hide video views ONLY if video is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('video')) {
        if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
        if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      }

      // Hide note views ONLY if nota is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
        if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
        if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      }

      // Hide CellQuest views
      if (DOM.cellquestSelectionView) DOM.cellquestSelectionView.classList.add('hidden');
      if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');

      // Fasa 4D-C: Deactivate direct 3D AR mode when in Kuiz mode ONLY if CellQuest is NOT active in multi-panel
      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive && (!ARState.activePanels || !ARState.activePanels.has('cellquest'))) {
        CellQuestARController.deactivate();
      }

      // Hide MCQ runner and results views (always display the 5 games catalog if no active quiz!)
      if (!ARState.activeQuiz) {
        if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
        if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
      }

      // Ensure 5 Original Games are loaded and rendered
      if (!ARState.games || ARState.games.length === 0) {
        loadGamesCatalog();
      }
      if (!GameSessionManager.isGameActive()) {
        render5GamesCatalog();
        renderPOV5GamesCatalog();
        // Display the 5 Games Catalog in Screen-Pinned floating panel
        if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.remove('hidden');
      }

    } else if (mod === 'nota') {
      ARState.activeModule = 'nota';
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('nota');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('nota', true);
          if (!ARState.activePanels || !ARState.activePanels.has('video')) {
            SpatialPanelManager.setPanelVisibility('video', false);
          }
          if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
            SpatialPanelManager.setPanelVisibility('kuiz', false);
          }
        }
      }

      // 1. Pause video gracefully without destroying session & show nota panel
      if (ARState.activePanels && ARState.activePanels.has('video')) {
        pauseVideo();
      } else {
        hideVideoPanel();
      }
      if (ARState.activePanels && ARState.activePanels.has('kuiz')) {
        // preserve kuiz panel in workspace
      } else {
        hideKuizPanel();
      }
      if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED || (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible('nota'))) {
        showNotaPanel();
      } else {
        hideNotaPanel();
      }

      // 2. Point active anchor to anchorNota
      if (ARState.anchorNota) {
        ARState.anchor = ARState.anchorNota;
      }

      // 3. Update category tags to Teal theme
      if (DOM.panelCategoryTag) {
        DOM.panelCategoryTag.classList.remove('tag-kuiz', 'tag-cellquest', 'tag-selbot');
        DOM.panelCategoryTag.classList.add('tag-nota');
      }
      if (DOM.panelCategoryIcon) DOM.panelCategoryIcon.textContent = 'auto_stories';
      if (DOM.panelCategoryText) DOM.panelCategoryText.textContent = '2. Nota Interaktif';

      // Update card containers to Teal theme
      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('module-kuiz', 'module-cellquest', 'module-selbot');
        DOM.floatingCard.classList.add('module-nota');
      }
      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-kuiz', 'module-cellquest', 'module-selbot');
        DOM.povCard.classList.add('module-nota');
      }

      // Update button labels
      if (DOM.btnChangeContentText) DOM.btnChangeContentText.textContent = 'Tukar Nota';
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Nota';

      // Hide SelBot view in single floating panel
      if (DOM.selbotArView) DOM.selbotArView.classList.add('hidden');
      if (!ARState.activePanels || !ARState.activePanels.has('selbot')) {
        hideSelbotPanel();
      }

      // Hide video views ONLY if video is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('video')) {
        if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
        if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      }

      // Hide quiz views ONLY if kuiz is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
        if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
        if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
        if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
      }

      // Hide CellQuest views
      if (DOM.cellquestSelectionView) DOM.cellquestSelectionView.classList.add('hidden');
      if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');

      // Fasa 4D-C: Deactivate direct 3D AR mode when in Kuiz mode ONLY if CellQuest is NOT active in multi-panel
      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive && (!ARState.activePanels || !ARState.activePanels.has('cellquest'))) {
        CellQuestARController.deactivate();
      }

      // Ensure notes are loaded and selected
      if (!ARState.activeNote) {
        if (!ARState.notes || ARState.notes.length === 0) {
          loadNotesFromCMS().then(() => {
            renderNoteSelectionList();
            renderPOVNoteCardsList();
            if (ARState.notes.length > 0) selectNote(ARState.notes[0]);
          });
        } else {
          renderNoteSelectionList();
          renderPOVNoteCardsList();
          selectNote(ARState.notes[0]);
        }
      } else {
        renderNoteContent();
        syncPOVNoteContent();
        if (DOM.activeNotaView) DOM.activeNotaView.classList.remove('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
      }

    } else if (mod === 'video') {
      ARState.activeModule = 'video';
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('video');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('video', true);
          if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
            SpatialPanelManager.setPanelVisibility('nota', false);
          }
          if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
            SpatialPanelManager.setPanelVisibility('kuiz', false);
          }
        }
      }

      if (ARState.activePanels && ARState.activePanels.has('nota')) {
        // preserve nota panel in workspace
      } else {
        hideNotaPanel();
      }
      if (ARState.activePanels && ARState.activePanels.has('kuiz')) {
        // preserve kuiz panel in workspace
      } else {
        hideKuizPanel();
      }
      if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
        showVideoPanel();
      }
      resumeVideo();

      // Point active anchor to anchorVideo
      if (ARState.anchorVideo) {
        ARState.anchor = ARState.anchorVideo;
      }

      // Restore category tag to Orange theme
      if (DOM.panelCategoryTag) {
        DOM.panelCategoryTag.classList.remove('tag-nota', 'tag-kuiz', 'tag-cellquest', 'tag-selbot');
      }
      if (DOM.panelCategoryIcon) DOM.panelCategoryIcon.textContent = 'smart_display';
      if (DOM.panelCategoryText) DOM.panelCategoryText.textContent = '1. Video Pembelajaran';

      // Remove Teal/Purple/Blue theme from card containers
      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('module-nota', 'module-kuiz', 'module-cellquest', 'module-selbot');
      }
      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota', 'module-kuiz', 'module-cellquest', 'module-selbot');
      }

      // Restore button labels
      if (DOM.btnChangeContentText) DOM.btnChangeContentText.textContent = 'Tukar Video';
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Video';

      // Hide SelBot view in single floating panel
      if (DOM.selbotArView) DOM.selbotArView.classList.add('hidden');
      if (!ARState.activePanels || !ARState.activePanels.has('selbot')) {
        hideSelbotPanel();
      }

      // Hide note views ONLY if nota is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
        if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
        if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      }

      // Hide quiz views ONLY if kuiz is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
        if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
        if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
        if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
      }

      // Hide CellQuest views
      if (DOM.cellquestSelectionView) DOM.cellquestSelectionView.classList.add('hidden');
      if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');

      // Fasa 4D-C: Deactivate direct 3D AR mode when in Video mode ONLY if CellQuest is NOT active in multi-panel
      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive && (!ARState.activePanels || !ARState.activePanels.has('cellquest'))) {
        CellQuestARController.deactivate();
      }

      if (ARState.activeVideo) {
        if (DOM.activePlayerView) DOM.activePlayerView.classList.add('is-active');
        if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
        syncPOVVideoPlayer(ARState.activeVideo);
      } else {
        if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'flex';
        if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.remove('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (!DOM.videoCardsScroll || DOM.videoCardsScroll.children.length === 0) {
          renderVideoList();
        }
      }

    } else if (mod === 'cellquest') {
      ARState.activeModule = 'cellquest';

      // 1. Pause video gracefully without destroying session
      pauseVideo();
      // Only hide DOM panels in legacy single-module mode (no multi-panels active)
      if (ARState.activePanels.size <= 1 && !ARState.activePanels.has('video') && !ARState.activePanels.has('nota') && !ARState.activePanels.has('kuiz') && !ARState.activePanels.has('selbot')) {
        hideVideoPanel();
        hideNotaPanel();
        hideKuizPanel();
        hideSelbotPanel();
      }

      // 2. Point active anchor to anchorCellQuest
      if (ARState.anchorCellQuest) {
        ARState.anchor = ARState.anchorCellQuest;
      }

      // 3. Update category tags to Blue theme
      if (DOM.panelCategoryTag) {
        DOM.panelCategoryTag.classList.remove('tag-nota', 'tag-kuiz', 'tag-selbot');
        DOM.panelCategoryTag.classList.add('tag-cellquest');
      }
      if (DOM.panelCategoryIcon) DOM.panelCategoryIcon.textContent = 'view_in_ar';
      if (DOM.panelCategoryText) DOM.panelCategoryText.textContent = '4. CellQuest 3D';

      // Update card containers to Blue theme
      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('module-nota', 'module-kuiz', 'module-selbot');
        DOM.floatingCard.classList.add('module-cellquest');
      }
      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota', 'module-kuiz', 'module-selbot');
        DOM.povCard.classList.add('module-cellquest');
      }

      if (DOM.selbotArView) DOM.selbotArView.classList.add('hidden');

      // Hide video views ONLY if video is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('video')) {
        if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
        if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      }

      // Hide note views ONLY if nota is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
        if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
        if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      }

      // Hide quiz views ONLY if kuiz is not an active panel
      if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
        if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
        if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
        if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
        if (DOM.embeddedGameView) DOM.embeddedGameView.classList.add('hidden');
        if (DOM.povEmbeddedGameView) DOM.povEmbeddedGameView.classList.add('hidden');
      }

      // Fasa 4D-C: HIDE cardboard floating panel & POV panel so 3D model appears DIRECTLY in AR camera view!
      if (!ARState.activePanels || !ARState.activePanels.has('video')) {
        if (DOM.floatingAnchor) {
          DOM.floatingAnchor.classList.remove('is-visible');
          DOM.floatingAnchor.classList.add('hidden');
        }
        if (DOM.povAnchor) {
          DOM.povAnchor.classList.remove('is-visible');
          DOM.povAnchor.classList.add('hidden');
        }
      }

      // Activate Direct 3D CellQuest AR Experience
      if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.activate();
      }
    } else if (mod === 'selbot') {
      ARState.activeModule = 'selbot';

      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setActivePanel('selbot');
        if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) {
          SpatialPanelManager.setPanelVisibility('selbot', true);
          if (!ARState.activePanels || !ARState.activePanels.has('video')) {
            SpatialPanelManager.setPanelVisibility('video', false);
          }
          if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
            SpatialPanelManager.setPanelVisibility('nota', false);
          }
          if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
            SpatialPanelManager.setPanelVisibility('kuiz', false);
          }
        }
      }

      if (ARState.activePanels && ARState.activePanels.has('video')) {
        pauseVideo();
      } else {
        hideVideoPanel();
      }
      if (!ARState.activePanels || !ARState.activePanels.has('nota')) {
        hideNotaPanel();
      }
      if (!ARState.activePanels || !ARState.activePanels.has('kuiz')) {
        hideKuizPanel();
      }
      if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED || (typeof SpatialPanelManager !== 'undefined' && SpatialPanelManager.isPanelVisible('selbot'))) {
        showSelbotPanel();
      }

      // Point active anchor to anchorSelbot
      if (ARState.anchorSelbot) {
        ARState.anchor = ARState.anchorSelbot;
      }

      // Update category tags to SelBot Cyan/Teal/Purple theme
      if (DOM.panelCategoryTag) {
        DOM.panelCategoryTag.classList.remove('tag-nota', 'tag-kuiz', 'tag-cellquest');
        DOM.panelCategoryTag.classList.add('tag-selbot');
      }
      if (DOM.panelCategoryIcon) DOM.panelCategoryIcon.textContent = 'smart_toy';
      if (DOM.panelCategoryText) DOM.panelCategoryText.textContent = '8. SelBot AI — Pembantu Sains Pintar';

      // Update card containers to SelBot theme
      if (DOM.floatingCard) {
        DOM.floatingCard.classList.remove('module-nota', 'module-kuiz', 'module-cellquest');
        DOM.floatingCard.classList.add('module-selbot');
      }
      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota', 'module-kuiz', 'module-cellquest');
        DOM.povCard.classList.add('module-selbot');
      }

      // Update button labels
      if (DOM.btnChangeContentText) DOM.btnChangeContentText.textContent = 'Sejarah Chat';
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Sejarah Chat';

      // Hide video/nota/kuiz/cellquest views inside #floating-card-container
      if (DOM.videoSelectionView) DOM.videoSelectionView.style.display = 'none';
      if (DOM.activePlayerView) DOM.activePlayerView.classList.remove('is-active');
      if (DOM.notaSelectionView) DOM.notaSelectionView.classList.add('hidden');
      if (DOM.activeNotaView) DOM.activeNotaView.classList.add('hidden');
      if (DOM.kuizSelectionView) DOM.kuizSelectionView.classList.add('hidden');
      if (DOM.activeKuizView) DOM.activeKuizView.classList.add('hidden');
      if (DOM.kuizResultView) DOM.kuizResultView.classList.add('hidden');
      if (DOM.embeddedGameView) DOM.embeddedGameView.classList.add('hidden');
      if (DOM.cellquestSelectionView) DOM.cellquestSelectionView.classList.add('hidden');

      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive && (!ARState.activePanels || !ARState.activePanels.has('cellquest'))) {
        CellQuestARController.deactivate();
      }

      // Reveal SelBot AI view inside floating card
      if (DOM.selbotArView) {
        DOM.selbotArView.classList.remove('hidden');
      }
      SelBotARController.init();
    }

    // Fasa 4C.3: Update dynamic scanner prompt whenever active module changes
    if (ARSessionRecoveryManager && typeof ARSessionRecoveryManager.updateScannerUI === 'function') {
      ARSessionRecoveryManager.updateScannerUI();
    }
  }

  /**
   * ========================================================
   * FASA 4D-C: CELLQUEST 3D DIRECT CAMERA AR ENGINE
   * Renders Animal & Plant Cell 3D Models DIRECTLY in camera view
   * Supports 360° Orbit, Pinch-Zoom, Organelle Raycasting, Emissive
   * Highlighting, and KSSM Tingkatan 1 Info Card Presentation.
   * ========================================================
   */
  const CELLQUEST_ORGANELLES = {
    membrane: {
      name: 'Membran Sel',
      icon: '🫧',
      category: 'Lapisan Kawalan Separa Telap',
      description: 'Lapisan nipis yang mengelilingi sel. Membran mengawal pergerakan bahan masuk dan keluar sel.',
      analogy: 'Seperti pintu pagar keselamatan yang memeriksa dan mengawal keluar masuk pelawat.',
      fact: 'Membran sel bersifat separa telap dan terdapat pada kedua-dua sel haiwan dan sel tumbuhan.'
    },
    cytoplasm: {
      name: 'Sitoplasma',
      icon: '💧',
      category: 'Medium Jeli Biokimia',
      description: 'Bahan seperti jeli yang mengisi ruang di dalam sel. Banyak tindak balas biokimia sel berlaku dalam sitoplasma.',
      analogy: 'Seperti lantai kilang tempat semua mesin dan pekerja sel beroperasi menjalankan tugas.',
      fact: 'Organel sel terapung di dalam sitoplasma yang kaya dengan air, garam dan protein terlarut.'
    },
    nucleus: {
      name: 'Nukleus',
      icon: '🧬',
      category: 'Pusat Kawalan & Bahan Genetik',
      description: 'Mengawal semua aktiviti sel dan mengandungi bahan genetik (DNA).',
      analogy: 'Nukleus seperti pusat kawalan atau ibu pejabat sel yang menyelaraskan semua aktiviti.',
      fact: 'Nukleus menyimpan maklumat genetik (DNA) yang diwarisi daripada induk kepada anak.'
    },
    mitochondria: {
      name: 'Mitokondrion',
      icon: '⚡',
      category: 'Penjana Tenaga Sel (ATP)',
      description: 'Mitokondrion ialah tapak respirasi sel untuk membebaskan tenaga dalam bentuk ATP daripada glukosa.',
      analogy: 'Seperti stesen janakuasa elektrik yang membekalkan tenaga kepada seluruh bandar.',
      fact: 'Bentuknya bujur dengan lipatan membran dalam (krista) untuk memaksimumkan luas permukaan respirasi.'
    },
    wall: {
      name: 'Dinding Sel',
      icon: '🧱',
      category: 'Sokongan Struktur Tegar',
      description: 'Lapisan tegar di luar membran sel tumbuhan. Dinding sel menyokong dan melindungi sel serta mengekalkan bentuk tetapnya.',
      analogy: 'Seperti tembok kubu batu yang kukuh melindungi struktur bangunan daripada runtuh.',
      fact: 'Dinding sel tumbuhan terutamanya terdiri daripada gentian selulosa yang kuat dan tegar.'
    },
    chloroplast: {
      name: 'Kloroplas',
      icon: '☀️',
      category: 'Tapak Fotosintesis Hijau',
      description: 'Mengandungi pigmen klorofil dan menjadi tapak fotosintesis untuk menghasilkan glukosa menggunakan tenaga cahaya matahari.',
      analogy: 'Seperti panel solar yang menyerap cahaya suria untuk menghasilkan tenaga makanan.',
      fact: 'Kloroplas terdapat dalam sel tumbuhan hijau sahaja dan tiada dalam sel haiwan.'
    },
    vacuole: {
      name: 'Vakuol',
      icon: '💧',
      category: 'Penyimpanan Sap Sel',
      description: 'Menyimpan sap sel (air, gula dan mineral) serta mengekalkan kesegahan (turgiditi) sel tumbuhan.',
      analogy: 'Seperti tangki simpanan air yang mengekalkan tekanan dan membekalkan cecair berterusan.',
      fact: 'Vakuol tumbuhan bersaiz besar (vakuol pusat), manakala vakuol sel haiwan kecil dan sementara.'
    },
    er: {
      name: 'Retikulum Endoplasma',
      icon: '🛤️',
      category: 'Rangkaian Pengangkutan Sel',
      description: 'Rangkaian kantung membran dalam sel yang mengangkut bahan sintesis seperti protein dan lipid.',
      analogy: 'Seperti sistem lebuh raya atau koridor dalaman yang menghubungkan bahagian-bahagian kilang.',
      fact: 'Jenis kasar mempunyai ribosom pada permukaannya manakala jenis licin tiada ribosom.'
    },
    golgi: {
      name: 'Jasad Golgi',
      icon: '📦',
      category: 'Pusat Pembungkusan & Rembesan',
      description: 'Mengubah suai, menyusun dan membungkus protein serta bahan sel sebelum dihantar ke destinasi tertentu.',
      analogy: 'Seperti pejabat pos atau pusat kurier bungkusan yang membungkus dan mengepos barangan.',
      fact: 'Terdiri daripada timbunan kantung pipih bermembran yang dipanggil sisterna.'
    },
    ribosome: {
      name: 'Ribosom',
      icon: '🟣',
      category: 'Sintesis Protein',
      description: 'Struktur halus yang terlibat dalam sintesis protein sel daripada asid amino.',
      analogy: 'Seperti mesin pencetak atau tukang bina mikro yang menghasilkan bahan binaan sel.',
      fact: 'Ribosom ialah organel yang paling seni dan terdapat secara bebas atau melekat pada RE kasar.'
    },
    centrioles: {
      name: 'Sentriol',
      icon: '🧭',
      category: 'Pembahagian Sel Haiwan',
      description: 'Sepasang struktur silinder kecil yang membantu pembentukan gentian gelendong semasa pembahagian sel haiwan.',
      analogy: 'Seperti tali penarik atau kabel sauh yang menarik kromosom ke kutub bertentangan.',
      fact: 'Sentriol hadir dalam kebanyakan sel haiwan tetapi lazimnya tiada dalam sel tumbuhan aras tinggi.'
    },
    lysosome: {
      name: 'Lisosom',
      icon: '🫧',
      category: 'Pelupusan Sisa & Pertahanan',
      description: 'Vesikel bermembran yang mengandungi enzim hidrolitik untuk mencerna zarah makanan atau menguraikan komponen sel usang.',
      analogy: 'Seperti lori pelupusan sampah atau loji kitar semula yang memusnahkan sisa buangan.',
      fact: 'Lisosom membantu sel mempertahankan diri daripada jangkitan bakteria dengan mencernanya.'
    }
  };

  const ANIMAL_MESH_MAP = {
    CellBody_Inner: 'cytoplasm',
    CellBody_Outer: 'membrane',
    Centrioles_01: 'centrioles',
    Centrioles_02: 'centrioles',
    EndoplasmicReticulum: 'er',
    GolgiApparatus: 'golgi',
    Lysosome_01: 'lysosome',
    Lysosome_02: 'lysosome',
    Mitochondria_OuterMembrane: 'mitochondria',
    Mitochondrion: 'mitochondria',
    Nucleus: 'nucleus',
    Nucleus_Cutaway: 'nucleus',
    Nucleus_Inner: 'nucleus',
    Nucleus_Outer: 'nucleus',
    Sphere001: 'vacuole',
    'Sphere.001': 'vacuole'
  };

  const PLANT_HOTSPOTS = [
    { id: 'wall', pos: [1.32, 0.45, 0.82], radius: 0.22 },
    { id: 'membrane', pos: [1.18, 0.15, 0.72], radius: 0.18 },
    { id: 'vacuole', pos: [-0.05, 0.18, -0.05], radius: 0.35 },
    { id: 'nucleus', pos: [0.72, 0.36, -0.48], radius: 0.28 },
    { id: 'chloroplast', pos: [-0.82, 0.48, 0.65], radius: 0.24 },
    { id: 'chloroplast', pos: [-0.75, -0.35, -0.55], radius: 0.22 },
    { id: 'mitochondria', pos: [0.55, -0.32, 0.25], radius: 0.20 },
    { id: 'mitochondria', pos: [-0.60, -0.28, 0.20], radius: 0.18 },
    { id: 'cytoplasm', pos: [-0.58, 0.12, 0.58], radius: 0.22 },
    { id: 'er', pos: [0.42, 0.62, -0.25], radius: 0.20 },
    { id: 'golgi', pos: [0.52, -0.08, 0.30], radius: 0.18 },
    { id: 'ribosome', pos: [-0.88, 0.50, 0.78], radius: 0.16 }
  ];

  const CellQuestARController = {
    isActive: false,
    activeCellType: 'animal',
    selectedOrganelleId: null,
    rootGroup: null,
    modelHolder: null,
    interactiveObjects: [],
    cachedGltfScenes: { animal: null, plant: null },
    userRotation: { x: 0, y: 0 },
    userScale: 1.0,
    isAutoRotating: false,
    raycaster: null,
    pointer: null,
    isPointerDown: false,
    pointerStart: { x: 0, y: 0, time: 0 },
    lastMove: { x: 0, y: 0 },

    // Fasa 4D-D.1 & 4D-D.2: Decoupled Tracking, Spatial Modes & 3DoF POV Lock
    trackingState: 'IDLE',   // 'IDLE' | 'MARKER_TRACKED' | 'MARKER_LOST'
    spatialMode: 'MARKER_MODE', // 'MARKER_MODE' | 'SCREEN_PINNED' | 'POV_SETUP' | 'POV_LOCKED'
    previousModeBeforePOV: 'MARKER_MODE',
    touchMode: 'ROTATE',    // 'ROTATE' | 'DRAG'
    dragOffset: new THREE.Vector2(0, 0),
    dragStartOffset: { x: 0, y: 0 },
    pinnedBasePos: new THREE.Vector3(0, 0, -2.8),
    pinnedBaseScale: new THREE.Vector3(1, 1, 1),
    pinnedBaseQuat: new THREE.Quaternion(0, 0, 0, 1),
    fixedScreenDepth: 2.8,
    povAnchorQuat: null,
    povAnchorWorldVector: null,
    povAnchorHeading: { yaw: 0, pitch: 0 },
    lastDeltaYaw: 0,
    lastDeltaPitch: 0,
    frustumStatus: 'Dalam Skrin',
    isPinnedBeforePOV: false,
    pinnedGroup: null,      // Independent scene-level parent for SCREEN_PINNED & POV_LOCKED
    lastPointerEventStr: 'sedia',

    // Backwards-compatible getter/setter for mode
    get mode() {
      return this.spatialMode === 'MARKER_MODE' ? 'MARKER_TRACKED' : this.spatialMode;
    },
    set mode(val) {
      if (val === 'MARKER_TRACKED') this.spatialMode = 'MARKER_MODE';
      else this.spatialMode = val;
    },

    // Fasa 4D-C.1: Live Telemetry & Spatial Stabilization
    glbLoadStatus: 'Belum Mula',
    currentBoundsStr: '-',
    currentRadiusStr: '-',
    hasTargetLock: false,
    debugCubeMesh: null,
    hologramPedestal: null,

    init(scene, anchorGroup, camera, renderer) {
      if (this.rootGroup) return; // Prevent multiple attachments
      this.scene = scene;
      this.anchorGroup = anchorGroup; // ARState.anchorCellQuest.group
      this.camera = camera;
      this.renderer = renderer;

      this.raycaster = new THREE.Raycaster();
      this.pointer = new THREE.Vector2();

      this.rootGroup = new THREE.Group();
      this.rootGroup.name = 'CellQuestAR_RootGroup';
      this.rootGroup.visible = false; // Initially hidden until marker is tracked

      this.modelHolder = new THREE.Group();
      this.modelHolder.name = 'CellQuestAR_ModelHolder';
      this.rootGroup.add(this.modelHolder);

      // Studio multi-directional lighting for direct camera view on iPad Safari
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.95);
      this.rootGroup.add(hemiLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight1.position.set(3, 6, 5);
      this.rootGroup.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.75);
      dirLight2.position.set(-4, -2, 4);
      this.rootGroup.add(dirLight2);

      const pointFill = new THREE.PointLight(0xffffff, 0.65, 12);
      pointFill.position.set(0, 0, 3.5);
      this.rootGroup.add(pointFill);

      // 3D Sci-Fi Hologram Pedestal for Marker 3 (CellQuest 3D)
      this.hologramPedestal = createCellQuestHologramPedestal();
      if (this.hologramPedestal && this.hologramPedestal.group) {
        this.rootGroup.add(this.hologramPedestal.group);
      }

      // Fasa 4D-D.1: Create persistent pinnedGroup in Three.js scene (independent of marker anchor)
      this.pinnedGroup = new THREE.Group();
      this.pinnedGroup.name = 'CellQuestAR_PinnedGroup';
      if (this.scene) {
        this.scene.add(this.pinnedGroup);
      }

      // Default attachment to anchorGroup (Target 3)
      if (this.anchorGroup) {
        this.anchorGroup.add(this.rootGroup);
      }

      this.initPointerInteractions();
      console.log('[CellQuestAR] Engine diinisialisasi dengan sokongan PinnedGroup & Touch Stabilizer');
    },

    initPointerInteractions() {
      const targetEl = window;

      targetEl.addEventListener('pointerdown', (e) => {
        if (!this.isActive) return;
        // Ignore clicks on HUD buttons, HUD controls, DOM panels, or multi-panel toolbar
        if (e.target && typeof e.target.closest === 'function') {
          if (e.target.closest('#cellquest-ar-hud') && !e.target.classList.contains('cellquest-ar-hud')) return;
          if (e.target.closest('.pov-spatial-panel')) return;
          if (e.target.closest('.floating-ar-anchor')) return;
          if (e.target.closest('#ar-multi-panel-bar')) return;
          if (e.target.closest('.ar-top-hud')) return;
          if (e.target.closest('#diagnostics-drawer')) return;
          if (e.target.closest('#ar-toast')) return;
        }

        this.isPointerDown = true;
        this.pointerId = e.pointerId;
        this.pointerStart = { x: e.clientX, y: e.clientY, time: Date.now() };
        this.lastMove = { x: e.clientX, y: e.clientY };
        this.dragStartOffset = { x: this.dragOffset.x, y: this.dragOffset.y };
        this.lastPointerEventStr = `down (${Math.round(e.clientX)},${Math.round(e.clientY)})`;

        if (e.target && typeof e.target.setPointerCapture === 'function') {
          try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
        }
        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      targetEl.addEventListener('pointermove', (e) => {
        if (!this.isActive || !this.isPointerDown) return;
        if (this.pointerId !== undefined && this.pointerId !== null && e.pointerId !== this.pointerId) return;

        const totalDxPx = e.clientX - this.pointerStart.x;
        const totalDyPx = e.clientY - this.pointerStart.y;
        const moved = Math.hypot(totalDxPx, totalDyPx);

        if (moved > 6) {
          if (e.cancelable) e.preventDefault();

          if (this.touchMode === 'DRAG') {
            // ✥ Fasa 4D-D.1: 1-finger translation / repositioning in camera view space
            const fov = (this.camera && this.camera.fov) ? this.camera.fov : 36;
            const currentDepth = this.fixedScreenDepth || 2.8;
            const pxPerUnit = window.innerHeight / (2 * currentDepth * Math.tan((fov * Math.PI / 180) / 2));
            const totalDx = totalDxPx / (pxPerUnit || 350);
            const totalDy = -totalDyPx / (pxPerUnit || 350); // Downward drag translates model down

            // Clamping boundaries scaled dynamically to camera distance
            const maxDragX = 1.6;
            const maxDragY = 1.2;
            this.dragOffset.x = Math.max(-maxDragX, Math.min(maxDragX, this.dragStartOffset.x + totalDx));
            this.dragOffset.y = Math.max(-maxDragY, Math.min(maxDragY, this.dragStartOffset.y + totalDy));
            this.applyModelPosition();
            this.lastPointerEventStr = `drag (${this.dragOffset.x.toFixed(2)}, ${this.dragOffset.y.toFixed(2)})`;
          } else {
            // 🔄 Fasa 4D-D.1: 1-finger orbit rotation
            const dx = e.clientX - this.lastMove.x;
            const dy = e.clientY - this.lastMove.y;
            this.userRotation.y += dx * 0.009;
            this.userRotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.userRotation.x + dy * 0.009));

            if (this.modelHolder) {
              this.modelHolder.rotation.y = this.userRotation.y;
              this.modelHolder.rotation.x = this.userRotation.x;
            }
            this.lastPointerEventStr = `rotate (${this.userRotation.y.toFixed(2)})`;
          }
        }
        this.lastMove = { x: e.clientX, y: e.clientY };
      }, { passive: false });

      targetEl.addEventListener('pointerup', (e) => {
        if (!this.isActive || !this.isPointerDown) return;
        this.isPointerDown = false;
        this.pointerId = null;

        const moved = Math.hypot(e.clientX - this.pointerStart.x, e.clientY - this.pointerStart.y);
        const duration = Date.now() - this.pointerStart.time;

        // Separate tap vs drag: Movement under 8px and short duration is a selection tap!
        if (moved < 8 && duration < 380) {
          this.handleTapRaycast(e.clientX, e.clientY);
          this.lastPointerEventStr = `tap (${Math.round(e.clientX)},${Math.round(e.clientY)})`;
        }
      }, { passive: true });

      targetEl.addEventListener('pointercancel', (e) => {
        this.isPointerDown = false;
        this.pointerId = null;
        this.lastPointerEventStr = 'cancel';
      }, { passive: true });

      // Touch pinch-to-zoom (Active in both ROTATE and DRAG modes)
      let startPinchDist = 0;
      let startScale = 1.0;
      targetEl.addEventListener('touchstart', (e) => {
        if (!this.isActive || e.touches.length !== 2) return;
        if (e.target && typeof e.target.closest === 'function') {
          if (e.target.closest('.pov-spatial-panel') || e.target.closest('#ar-multi-panel-bar')) return;
        }
        startPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = this.userScale;
      }, { passive: true });

      targetEl.addEventListener('touchmove', (e) => {
        if (!this.isActive || e.touches.length !== 2 || startPinchDist <= 0) return;
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / startPinchDist;
        this.userScale = Math.max(0.45, Math.min(2.8, startScale * factor));
        if (this.modelHolder) {
          this.modelHolder.scale.setScalar(this.userScale);
        }
        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      targetEl.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) startPinchDist = 0;
      }, { passive: true });
    },

    handleTapRaycast(clientX, clientY) {
      if (!this.renderer || !this.camera || !this.interactiveObjects.length) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const pickables = this.interactiveObjects.filter(m => m.visible && m.userData.pickable);
      const hits = this.raycaster.intersectObjects(pickables, false);

      if (hits.length > 0) {
        const topHit = hits[0];
        const organelleId = topHit.object.userData.id;
        if (organelleId) {
          console.log('[CellQuestAR] 🎯 Organel dipilih:', organelleId);
          this.selectOrganelle(organelleId);
        }
      } else {
        // Tapped outside any organelle on empty camera space -> clear selection
        this.clearSelection();
      }
    },

    activate() {
      this.isActive = true;
      document.body.classList.add('cellquest-active'); // Enables pointer events on canvas & stabilizes touch

      // Only hide legacy cardboard floating panel if no other multi-panels are active
      if (ARState.activePanels.size <= 1 && !ARState.activePanels.has('video') && !ARState.activePanels.has('nota') && !ARState.activePanels.has('kuiz')) {
        if (DOM.floatingAnchor) DOM.floatingAnchor.classList.add('hidden');
        if (DOM.povAnchor) DOM.povAnchor.classList.add('hidden');
      }
      if (DOM.scannerOverlay) DOM.scannerOverlay.classList.add('hidden');

      // 🛡️ CRITICAL UI FIX: Hide .ar-top-hud only if multi-panel bar is not active
      if (DOM.topAppHud && (!DOM.arMultiPanelBar || DOM.arMultiPanelBar.classList.contains('hidden'))) {
        DOM.topAppHud.classList.add('hidden');
      }

      // Show CellQuest AR HUD
      if (DOM.cellquestArHud) DOM.cellquestArHud.classList.remove('hidden');

      // Position model according to current spatial mode
      this.applyModelPosition();

      // Sync HUD state & modes
      this.updateHUDModeUI();

      // Load active cell model if not yet loaded
      this.loadModel(this.activeCellType);
      updateDiagnosticsData();
      console.log('[CellQuestAR] Mod Direct 3D AR Aktif');
    },

    deactivate() {
      this.isActive = false;
      this.isAutoRotating = false;
      this.clearSelection();
      document.body.classList.remove('cellquest-active');

      // Restore spatial root attachment to anchor if it was pinned or POV locked
      if (this.anchorGroup && this.rootGroup && this.rootGroup.parent !== this.anchorGroup) {
        this.anchorGroup.add(this.rootGroup);
      }
      this.spatialMode = 'MARKER_MODE';
      this.touchMode = 'ROTATE';
      this.dragOffset.set(0, 0);

      if (this.anchorGroup) this.anchorGroup.visible = false;
      if (this.rootGroup) this.rootGroup.visible = false;
      if (DOM.cellquestArHud) DOM.cellquestArHud.classList.add('hidden');
      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.add('hidden');
      if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');

      // 🛡️ Restore .ar-top-hud when exiting CellQuest mode
      if (DOM.topAppHud) DOM.topAppHud.classList.remove('hidden');

      updateDiagnosticsData();
      console.log('[CellQuestAR] Mod Direct 3D AR Ditutup');
    },

    // ─────────────────────────────────────────────────────────────
    // Fasa 4D-D.1: Spatial Modes & Interaction Handlers
    // ─────────────────────────────────────────────────────────────

    setTouchMode(mode) {
      this.touchMode = mode;
      if (DOM.cqBtnRotate) DOM.cqBtnRotate.classList.toggle('is-active', mode === 'ROTATE');
      if (DOM.cqBtnDrag) {
        DOM.cqBtnDrag.classList.toggle('is-active', mode === 'DRAG');
        DOM.cqBtnDrag.classList.toggle('is-dragging', mode === 'DRAG');
      }
      if (mode === 'ROTATE') {
        showToast('🔄 Mod Putar Aktif (Leret 1 jari untuk pusing 360°)', 1500);
      } else if (mode === 'DRAG') {
        showToast('✥ Mod Seret Aktif (Leret 1 jari untuk anjak kedudukan)', 1500);
      }
    },

    toggleRotate() {
      if (this.touchMode !== 'ROTATE') {
        this.setTouchMode('ROTATE');
      } else {
        this.isAutoRotating = !this.isAutoRotating;
        if (DOM.cqBtnRotate) DOM.cqBtnRotate.classList.add('is-active');
        showToast(this.isAutoRotating ? '🔄 Putaran automatik aktif' : '⏸️ Putaran automatik dijeda', 1500);
      }
    },

    adjustZoom(factor) {
      this.userScale = Math.max(0.45, Math.min(2.8, this.userScale * factor));
      if (this.modelHolder) {
        this.modelHolder.scale.setScalar(this.userScale);
      }
      showToast(`🔍 Saiz: ${Math.round(this.userScale * 100)}%`, 1200);
      updateDiagnosticsData();
    },

    setMode(newMode) {
      if (newMode === 'MARKER_TRACKED') {
        this.spatialMode = 'MARKER_MODE';
      } else {
        this.spatialMode = newMode;
      }
      this.applyModelPosition();
      this.updateHUDModeUI();
      updateDiagnosticsData();
    },

    togglePin() {
      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.add('hidden');
      if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');

      if (this.spatialMode === 'SCREEN_PINNED') {
        // Nyahsemat: Kembali ke penjejakan marker fizikal
        this.spatialMode = 'MARKER_MODE';
        if (this.anchorGroup && this.rootGroup.parent !== this.anchorGroup) {
          this.anchorGroup.add(this.rootGroup);
        }
        this.rootGroup.position.set(0, 0, 0);
        this.rootGroup.rotation.set(0, 0, 0);
        this.rootGroup.scale.set(1, 1, 1);
        this.dragOffset.set(0, 0);

        if (this.trackingState === 'MARKER_TRACKED') {
          this.rootGroup.visible = true;
          if (this.anchorGroup) this.anchorGroup.visible = true;
          if (this.hologramPedestal && this.hologramPedestal.group) this.hologramPedestal.group.visible = true;
          showToast('📌 Model dinyahsemat (mengikuti kad AR fizikal)', 1800);
        } else {
          this.rootGroup.visible = false;
          if (this.anchorGroup) this.anchorGroup.visible = false;
          showToast('📌 Model dinyahsemat. Halakan kamera ke Kad AR CellQuest.', 2200);
        }
      } else {
        // Semat pada skrin
        this.spatialMode = 'SCREEN_PINNED';

        // 🛡️ Pastikan near plane kamera tidak mengehadkan frustum pada jarak model
        if (this.camera && this.camera.near > 0.1) {
          this.camera.near = 0.1;
          this.camera.updateProjectionMatrix();
        }

        if (this.camera && this.rootGroup.parent !== this.camera) {
          this.camera.add(this.rootGroup);
        }
        this.pinnedBasePos.set(0, 0, -this.fixedScreenDepth);
        this.pinnedBaseScale.set(1, 1, 1);
        this.pinnedBaseQuat.set(0, 0, 0, 1);
        this.applyModelPosition();
        this.rootGroup.visible = true;
        if (this.hologramPedestal && this.hologramPedestal.group) {
          this.hologramPedestal.group.visible = false;
        }
        showToast('📌 Model disemat pada skrin! Kamera kekal aktif.', 2000);
        maybeShowPOVInteractiveGuide();
      }
      this.updateHUDModeUI();
      updateDiagnosticsData();
    },

    async ensureSensorPermission() {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === 'granted') {
            ARState.pov.permissionGranted = true;
            return true;
          } else {
            showToast('⚠️ Keizinan sensor orientasi ditolak.', 2500);
            return false;
          }
        } catch (err) {
          console.warn('[CellQuestAR] Ralat keizinan sensor:', err);
          return false;
        }
      }
      return true;
    },

    async togglePOVMode() {
      if (this.spatialMode === 'POV_LOCKED') {
        this.exitPOV();
      } else if (this.spatialMode === 'POV_SETUP') {
        this.cancelPOVSetup();
      } else {
        await this.startPOVSetup();
      }
    },

    async startPOVSetup() {
      this.previousModeBeforePOV = this.spatialMode;

      // 🛡️ Ensure camera near plane is 0.1 so frustum never clips at 2.8 units
      if (this.camera && this.camera.near > 0.1) {
        this.camera.near = 0.1;
        this.camera.updateProjectionMatrix();
      }

      // Attach model to camera so it remains visible in front while user is aiming
      if (this.camera && this.rootGroup.parent !== this.camera) {
        this.camera.add(this.rootGroup);
      }
      this.rootGroup.position.set(this.dragOffset.x, this.dragOffset.y, -this.fixedScreenDepth);
      this.rootGroup.rotation.set(0, 0, 0);
      this.rootGroup.scale.set(1, 1, 1);
      this.rootGroup.visible = true;
      this.frustumStatus = 'Dalam Skrin (Menghalakan)';
      if (this.hologramPedestal && this.hologramPedestal.group) {
        this.hologramPedestal.group.visible = false;
      }
      if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');

      this.spatialMode = 'POV_SETUP';

      await this.ensureSensorPermission();
      setupPOVSensorListeners();

      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.remove('hidden');
      if (DOM.cqPovDeadSensorBox) DOM.cqPovDeadSensorBox.classList.add('hidden');

      this.updatePOVBannerSensorStatus();
      this.updateHUDModeUI();
      updateDiagnosticsData();
      maybeShowPOVInteractiveGuide();
      showToast('🧭 Halakan peranti ke arah sasaran dan tekan "Letak di Arah Ini"', 2500);
    },

    anchorPOVAtCurrentHeading() {
      if (this.spatialMode !== 'POV_SETUP' && this.spatialMode !== 'POV_LOCKED') {
        this.previousModeBeforePOV = this.spatialMode;
      }

      // Anchor the current orientation
      if (window.THREE && ARState.pov.currentQuaternion) {
        this.povAnchorQuat = ARState.pov.currentQuaternion.clone();
      } else if (window.THREE) {
        this.povAnchorQuat = new THREE.Quaternion();
      }
      if (window.THREE && this.povAnchorQuat) {
        this.povAnchorWorldVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.povAnchorQuat);
      } else if (window.THREE) {
        this.povAnchorWorldVector = new THREE.Vector3(0, 0, -1);
      }

      this.povAnchorHeading = {
        yaw: Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0,
        pitch: Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0
      };

      this.spatialMode = 'POV_LOCKED';

      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.add('hidden');

      this.applyModelPosition();
      this.updateHUDModeUI();
      updateDiagnosticsData();
      showToast('🧭 Orientasi 3D dikunci (3DoF)! Pusingkan peranti untuk meneroka.', 2200);
    },

    cancelPOVSetup() {
      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.add('hidden');
      if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');

      this.spatialMode = this.previousModeBeforePOV || 'MARKER_MODE';
      this.applyModelPosition();
      this.updateHUDModeUI();
      updateDiagnosticsData();
      showToast('Penyediaan Kunci Pandangan dibatalkan', 1500);
    },

    exitPOV() {
      if (DOM.cqPovSetupBanner) DOM.cqPovSetupBanner.classList.add('hidden');
      if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');

      this.spatialMode = this.previousModeBeforePOV || 'SCREEN_PINNED';
      this.applyModelPosition();
      this.updateHUDModeUI();
      updateDiagnosticsData();
      showToast('🧭 Keluar dari Mod Kunci Pandangan', 1800);
    },

    recalibratePOV() {
      if (this.spatialMode === 'POV_LOCKED') {
        if (window.THREE && ARState.pov.currentQuaternion) {
          this.povAnchorQuat = ARState.pov.currentQuaternion.clone();
        } else if (window.THREE) {
          this.povAnchorQuat = new THREE.Quaternion();
        }
        if (window.THREE && this.povAnchorQuat) {
          this.povAnchorWorldVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.povAnchorQuat);
        }
        this.povAnchorHeading = {
          yaw: Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0,
          pitch: Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0
        };
        this.dragOffset.set(0, 0);
        this.applyModelPosition();
        updateDiagnosticsData();
        showToast('🎯 Orientasi dikalibrasi semula ke tengah', 1500);
      }
    },

    updatePOVBannerSensorStatus() {
      if (!DOM.cqPovSetupBanner || DOM.cqPovSetupBanner.classList.contains('hidden')) return;

      const hasSensor = ARState.pov.hasSensor || ARState.pov.isSimulated;
      if (DOM.cqPovStatusDot) {
        DOM.cqPovStatusDot.className = 'cq-status-dot-sm' + (hasSensor ? '' : ' is-warning');
      }
      if (DOM.cqPovSensorText) {
        if (hasSensor) {
          const y = Math.round(ARState.pov.currentYaw || 0);
          const p = Math.round(ARState.pov.currentPitch || 0);
          DOM.cqPovSensorText.textContent = `Giroskop Aktif • Yaw: ${y}° | Pitch: ${p}°`;
        } else {
          DOM.cqPovSensorText.textContent = 'Menyambung Giroskop...';
        }
      }
    },

    recenterModel() {
      this.dragOffset.set(0, 0);
      this.pinnedBasePos.x = 0;
      this.pinnedBasePos.y = 0;
      if (this.spatialMode === 'POV_LOCKED') {
        this.recalibratePOV();
      } else {
        this.applyModelPosition();
        showToast('🎯 Model dibawa ke tengah skrin', 1500);
      }
      updateDiagnosticsData();
    },

    resetView() {
      this.userRotation = { x: 0, y: 0 };
      this.userScale = 1.0;
      this.isAutoRotating = false;
      this.dragOffset.set(0, 0);
      this.pinnedBasePos.x = 0;
      this.pinnedBasePos.y = 0;

      if (this.modelHolder) {
        this.modelHolder.rotation.set(0, 0, 0);
        this.modelHolder.scale.setScalar(1.0);
      }

      if (this.spatialMode === 'POV_LOCKED') {
        this.recalibratePOV();
      }

      this.applyModelPosition();
      if (DOM.cqBtnRotate) DOM.cqBtnRotate.classList.toggle('is-active', this.touchMode === 'ROTATE');
      showToast('↺ Orientasi, kedudukan & saiz asal dikembalikan', 1800);
      updateDiagnosticsData();
    },

    updateHUDModeUI() {
      // Butang Semat
      const isPinned = (this.spatialMode === 'SCREEN_PINNED');
      if (DOM.cqBtnPin) DOM.cqBtnPin.classList.toggle('is-pinned', isPinned);
      if (DOM.cqPinIcon) DOM.cqPinIcon.textContent = isPinned ? 'keep_off' : 'push_pin';
      if (DOM.cqPinLabel) DOM.cqPinLabel.textContent = isPinned ? 'Nyahsemat' : 'Semat Model';

      // Butang Kunci POV
      const isPOVLocked = (this.spatialMode === 'POV_LOCKED');
      const isPOVSetup = (this.spatialMode === 'POV_SETUP');
      if (DOM.cqBtnPOV) {
        DOM.cqBtnPOV.classList.toggle('is-locked', isPOVLocked);
        DOM.cqBtnPOV.classList.toggle('is-active', isPOVSetup);
      }
      if (DOM.cqPovIcon) {
        DOM.cqPovIcon.textContent = isPOVLocked ? 'explore_off' : (isPOVSetup ? 'cancel' : 'explore');
      }
      if (DOM.cqPovLabel) {
        DOM.cqPovLabel.textContent = isPOVLocked ? 'Keluar Pandangan' : (isPOVSetup ? 'Batal Pandangan' : 'Kunci Pandangan');
      }

      // Status Badge
      if (this.spatialMode === 'SCREEN_PINNED') {
        if (DOM.cqStatusText) DOM.cqStatusText.textContent = 'Semat pada Skrin';
        if (DOM.cqTrackingStatus) {
          const dot = DOM.cqTrackingStatus.querySelector('.cq-status-dot');
          if (dot) dot.style.background = '#06b6d4';
        }
      } else if (this.spatialMode === 'POV_LOCKED') {
        if (DOM.cqStatusText) DOM.cqStatusText.textContent = 'Kunci Pandangan (3DoF)';
        if (DOM.cqTrackingStatus) {
          const dot = DOM.cqTrackingStatus.querySelector('.cq-status-dot');
          if (dot) dot.style.background = '#8b5cf6';
        }
      } else if (this.spatialMode === 'POV_SETUP') {
        if (DOM.cqStatusText) DOM.cqStatusText.textContent = 'Menyediakan Pandangan...';
        if (DOM.cqTrackingStatus) {
          const dot = DOM.cqTrackingStatus.querySelector('.cq-status-dot');
          if (dot) dot.style.background = '#38bdf8';
        }
      } else {
        const isTracked = (this.trackingState === 'MARKER_TRACKED') && this.anchorGroup && this.anchorGroup.visible;
        if (DOM.cqStatusText) DOM.cqStatusText.textContent = isTracked ? 'Kad AR Dikesan' : 'Menunggu Kad AR...';
        if (DOM.cqTrackingStatus) {
          const dot = DOM.cqTrackingStatus.querySelector('.cq-status-dot');
          if (dot) dot.style.background = isTracked ? '#22c55e' : '#f59e0b';
        }
      }
    },

    applyModelPosition() {
      if (!this.rootGroup) return;

      // 🛡️ Sentiasa pastikan camera.near kekal 0.1 agar frustum kamera merangkumi kedalaman model
      if (this.camera && this.camera.near > 0.1) {
        this.camera.near = 0.1;
        this.camera.updateProjectionMatrix();
      }

      if (this.spatialMode === 'SCREEN_PINNED' || this.spatialMode === 'POV_SETUP') {
        // Model adalah anak kepada kamera pada kedalaman frustum 2.8 unit
        if (this.camera && this.rootGroup.parent !== this.camera) {
          this.camera.add(this.rootGroup);
        }
        this.rootGroup.position.set(
          this.dragOffset.x,
          this.dragOffset.y,
          -this.fixedScreenDepth
        );
        this.rootGroup.rotation.set(0, 0, 0);
        this.rootGroup.scale.set(1, 1, 1);
        this.rootGroup.visible = true;
        this.frustumStatus = (this.spatialMode === 'POV_SETUP') ? 'Dalam Skrin (Menghalakan)' : 'Dalam Skrin (Disemat)';
        if (this.hologramPedestal && this.hologramPedestal.group) {
          this.hologramPedestal.group.visible = false;
        }
        if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');
      } else if (this.spatialMode === 'POV_LOCKED') {
        // POV_LOCKED: Model adalah anak kepada kamera, diunjurkan mengikut orientasi peranti (3DoF)
        if (this.camera && this.rootGroup.parent !== this.camera) {
          this.camera.add(this.rootGroup);
        }

        // Dapatkan vektor arah dalam ruang kamera
        let vCam;
        if (this.povAnchorWorldVector && ARState.pov.currentQuaternion) {
          const qCamInv = ARState.pov.currentQuaternion.clone().invert();
          vCam = this.povAnchorWorldVector.clone().applyQuaternion(qCamInv);
        } else {
          const curYaw = Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0;
          const curPitch = Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0;
          const anchorYaw = this.povAnchorHeading ? this.povAnchorHeading.yaw : 0;
          const anchorPitch = this.povAnchorHeading ? this.povAnchorHeading.pitch : 0;

          const deltaYaw = shortestAngleDelta(curYaw, anchorYaw);
          const deltaPitch = shortestAngleDelta(curPitch, anchorPitch);

          const radY = (deltaYaw * Math.PI) / 180;
          const radP = (deltaPitch * Math.PI) / 180;
          vCam = new THREE.Vector3(-Math.sin(radY) * Math.cos(radP), -Math.sin(radP), -Math.cos(radY) * Math.cos(radP));
        }

        const deltaYaw = Math.atan2(vCam.x, -vCam.z) * (180 / Math.PI);
        const deltaPitch = Math.atan2(vCam.y, -vCam.z) * (180 / Math.PI);
        this.lastDeltaYaw = deltaYaw;
        this.lastDeltaPitch = deltaPitch;
        this.lastVCam = vCam;
        ARState.pov.deltaYaw = deltaYaw;
        ARState.pov.deltaPitch = deltaPitch;

        const D = this.fixedScreenDepth || 2.8;
        const isInFront = (vCam.z < -0.05);

        if (isInFront) {
          const posX = vCam.x * D + this.dragOffset.x;
          const posY = vCam.y * D + this.dragOffset.y;
          const posZ = vCam.z * D;

          this.rootGroup.position.set(posX, posY, posZ);
          this.rootGroup.rotation.set(0, 0, 0); // Selari dengan satah pandangan kamera
          this.rootGroup.scale.set(1, 1, 1);
          this.rootGroup.visible = true;
          this.frustumStatus = 'Dalam Skrin (Pandangan 3DoF)';
        } else {
          // Di belakang kamera -> sembunyikan daripada frustum
          this.rootGroup.visible = false;
          this.frustumStatus = 'Di Belakang Kamera';
        }

        if (this.hologramPedestal && this.hologramPedestal.group) {
          this.hologramPedestal.group.visible = false;
        }

        this.updateOffscreenPointer(deltaYaw, deltaPitch, vCam, isInFront);
      } else {
        // MARKER_MODE: Model adalah anak kepada anchorGroup pada marker fizikal
        if (this.anchorGroup && this.rootGroup.parent !== this.anchorGroup) {
          this.anchorGroup.add(this.rootGroup);
        }
        this.rootGroup.position.set(this.dragOffset.x, this.dragOffset.y, 0);
        this.rootGroup.rotation.set(0, 0, 0);
        this.rootGroup.scale.set(1, 1, 1);
        if (this.hologramPedestal && this.hologramPedestal.group) {
          this.hologramPedestal.group.visible = true;
        }
        const isTracked = (this.trackingState === 'MARKER_TRACKED');
        this.rootGroup.visible = isTracked;
        this.frustumStatus = isTracked ? 'Dalam Skrin (Kad AR)' : 'Kad AR Hilang';
        if (this.anchorGroup) {
          this.anchorGroup.visible = isTracked;
        }
        if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');
      }
    },

    updateOffscreenPointer(deltaYaw, deltaPitch, vCam, isInFront) {
      if (!DOM.povOffscreenPointer) return;

      const isOffscreen = (!isInFront) || Math.abs(deltaYaw) > 32 || Math.abs(deltaPitch) > 24;

      if (!isOffscreen) {
        DOM.povOffscreenPointer.classList.add('hidden');
        return;
      }

      DOM.povOffscreenPointer.classList.remove('hidden');

      const absYaw = Math.abs(deltaYaw);
      const absPitch = Math.abs(deltaPitch);

      if (absPitch > absYaw && isInFront) {
        DOM.povOffscreenPointer.classList.remove('at-left', 'at-right');
        if (deltaPitch > 0) {
          DOM.povOffscreenPointer.classList.remove('at-bottom');
          DOM.povOffscreenPointer.classList.add('at-top');
          if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_upward';
          if (DOM.povPointerBearing) DOM.povPointerBearing.textContent = `Model di Atas (${Math.round(absPitch)}°)`;
        } else {
          DOM.povOffscreenPointer.classList.remove('at-top');
          DOM.povOffscreenPointer.classList.add('at-bottom');
          if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_downward';
          if (DOM.povPointerBearing) DOM.povPointerBearing.textContent = `Model di Bawah (${Math.round(absPitch)}°)`;
        }
      } else {
        DOM.povOffscreenPointer.classList.remove('at-top', 'at-bottom');
        if (deltaYaw < 0 || (!isInFront && vCam.x < 0)) {
          DOM.povOffscreenPointer.classList.remove('at-right');
          DOM.povOffscreenPointer.classList.add('at-left');
          if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_back';
          if (DOM.povPointerBearing) DOM.povPointerBearing.textContent = `Model di Kiri (${Math.round(absYaw)}°)`;
        } else {
          DOM.povOffscreenPointer.classList.remove('at-left');
          DOM.povOffscreenPointer.classList.add('at-right');
          if (DOM.povPointerArrow) DOM.povPointerArrow.textContent = 'arrow_forward';
          if (DOM.povPointerBearing) DOM.povPointerBearing.textContent = `Model di Kanan (${Math.round(absYaw)}°)`;
        }
      }
    },

    loadModel(cellType) {
      this.activeCellType = cellType;
      this.clearSelection();

      // Fasa 4E-D.1: Re-anchor ke marker fizikal yang sepadan jika dalam MARKER_MODE
      if (this.spatialMode === 'MARKER_MODE') {
        if (cellType === 'plant' && ARState.anchorCellQuestPlant) {
          ARState.anchorCellQuest = ARState.anchorCellQuestPlant;
          this.anchorGroup = ARState.anchorCellQuestPlant.group;
        } else if (cellType === 'animal' && ARState.anchorCellQuestAnimal) {
          ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;
          this.anchorGroup = ARState.anchorCellQuestAnimal.group;
        }
        if (this.anchorGroup && this.rootGroup && this.rootGroup.parent !== this.anchorGroup && this.rootGroup.parent !== this.camera) {
          this.anchorGroup.add(this.rootGroup);
        }
      }

      // Update toggle buttons
      if (DOM.cqBtnAnimal) DOM.cqBtnAnimal.classList.toggle('active', cellType === 'animal');
      if (DOM.cqBtnPlant) DOM.cqBtnPlant.classList.toggle('active', cellType === 'plant');

      if (DOM.cqHudCellName) {
        DOM.cqHudCellName.textContent = cellType === 'animal' ? 'Sel Haiwan 3D' : 'Sel Tumbuhan 3D';
      }

      if (this.cachedGltfScenes[cellType]) {
        console.log(`[CellQuestAR] Menggunakan model cache memori: ${cellType}`);
        this.glbLoadStatus = `Berjaya (Cache Memori)`;
        this.buildModel(cellType, this.cachedGltfScenes[cellType]);
        updateDiagnosticsData();
        return;
      }

      // Show loading spinner
      this.glbLoadStatus = 'Memuatkan (0%)...';
      if (DOM.cqLoadingSpinner) DOM.cqLoadingSpinner.classList.remove('hidden');
      if (DOM.cqSpinnerText) {
        DOM.cqSpinnerText.textContent = cellType === 'animal' 
          ? 'Memuatkan Model 3D Sel Haiwan (2.8 MB)...' 
          : 'Memuatkan Model 3D Sel Tumbuhan (9.6 MB)...';
      }
      updateDiagnosticsData();

      const modelUrl = cellType === 'animal' ? '/models/animal_cell_final.glb' : '/models/plantcellnew.glb';
      console.log(`[CellQuestAR] Memuatkan GLB: ${modelUrl}`);

      if (window.THREE && typeof THREE.GLTFLoader === 'function') {
        const loader = new THREE.GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            this.cachedGltfScenes[cellType] = gltf.scene;
            this.buildModel(cellType, gltf.scene);
            this.glbLoadStatus = `Berjaya (${this.interactiveObjects.length} mesh)`;
            if (DOM.cqLoadingSpinner) DOM.cqLoadingSpinner.classList.add('hidden');
            showToast(`✨ Model 3D ${cellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan'} sedia!`, 2000);
            updateDiagnosticsData();
          },
          (xhr) => {
            if (xhr.lengthComputable && DOM.cqSpinnerText) {
              const pct = Math.round((xhr.loaded / xhr.total) * 100);
              this.glbLoadStatus = `Memuatkan (${pct}%)`;
              DOM.cqSpinnerText.textContent = `Memuatkan ${cellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan'} (${pct}%)...`;
              updateDiagnosticsData();
            }
          },
          (err) => {
            console.warn('[CellQuestAR] Ralat memuatkan fail GLB, membina sandaran prosedural 3D:', err);
            this.glbLoadStatus = `Gagal: ${err && err.message ? err.message : 'Ralat Fail'} (Sandaran Aktif)`;
            this.buildProceduralBackup(cellType);
            if (DOM.cqLoadingSpinner) DOM.cqLoadingSpinner.classList.add('hidden');
            showToast(`✨ Model 3D ${cellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan'} aktif!`, 2000);
            updateDiagnosticsData();
          }
        );
      } else {
        console.warn('[CellQuestAR] THREE.GLTFLoader belum sedia, membina sandaran prosedural 3D');
        this.glbLoadStatus = 'GLTFLoader Tiada (Sandaran Aktif)';
        this.buildProceduralBackup(cellType);
        if (DOM.cqLoadingSpinner) DOM.cqLoadingSpinner.classList.add('hidden');
        updateDiagnosticsData();
      }
    },

    buildModel(cellType, gltfScene) {
      if (!this.modelHolder) return;
      this.clearModelHolder();

      const instance = gltfScene.clone(true);

      // Auto-fit bounding box calculation
      const bounds = new THREE.Box3().setFromObject(instance);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 1.35; // Ideal 3D scale for comfortable iPad/iPhone viewing
      const fit = targetSize / maxDim;

      this.currentBoundsStr = `[${size.x.toFixed(1)}, ${size.y.toFixed(1)}, ${size.z.toFixed(1)}]`;
      this.currentRadiusStr = `${(maxDim * 0.5 * fit).toFixed(2)} unit`;

      const fitGroup = new THREE.Group();
      fitGroup.name = `CellQuest_${cellType}_Fit`;
      fitGroup.scale.setScalar(fit);
      fitGroup.position.x = -center.x * fit;
      fitGroup.position.y = -center.y * fit;
      fitGroup.position.z = -center.z * fit + (size.z * fit * 0.5) + 0.08; // Sits floating nicely above marker
      fitGroup.add(instance);
      this.modelHolder.add(fitGroup);

      if (cellType === 'animal') {
        instance.traverse((node) => {
          if (!node.isMesh) return;
          node.frustumCulled = false; // 🛡️ CRITICAL for iOS Safari clipping plane!

          let id = '';
          for (let p = node; p && p !== instance.parent; p = p.parent) {
            if (ANIMAL_MESH_MAP[p.name]) {
              id = ANIMAL_MESH_MAP[p.name];
              break;
            }
          }
          if (!id && ANIMAL_MESH_MAP[node.name]) {
            id = ANIMAL_MESH_MAP[node.name];
          }

          node.userData = {
            ...node.userData,
            id,
            pickable: !!id,
            baseEmissive: node.material && node.material.emissive ? node.material.emissive.getHex() : 0,
            baseEmissiveIntensity: node.material ? (node.material.emissiveIntensity || 0) : 0
          };

          // Clone material so emissive pulse operates safely & double sided for cutaways
          if (node.material) {
            const cloneMat = (m) => {
              const c = m.clone();
              c.side = THREE.DoubleSide;
              if (c.map) c.map.encoding = THREE.sRGBEncoding;
              return c;
            };
            node.material = Array.isArray(node.material) ? node.material.map(cloneMat) : cloneMat(node.material);
          }

          this.interactiveObjects.push(node);
        });

      } else if (cellType === 'plant') {
        instance.traverse((node) => {
          if (!node.isMesh) return;
          node.frustumCulled = false; // 🛡️ CRITICAL for iOS Safari clipping plane!

          if (node.name === 'Labels') {
            node.visible = false; // Hide baked Blender English labels
          }
          if (node.material) {
            const cloneMat = (m) => {
              const c = m.clone();
              c.side = THREE.DoubleSide;
              if (c.map) c.map.encoding = THREE.sRGBEncoding;
              return c;
            };
            node.material = Array.isArray(node.material) ? node.material.map(cloneMat) : cloneMat(node.material);
          }
          node.userData = { ...node.userData, pickable: true };
          this.interactiveObjects.push(node);
        });

        // Add interactive hotspot spheres for Plant Cell organelles directly on instance
        PLANT_HOTSPOTS.forEach((spot) => {
          const hitGeo = new THREE.SphereGeometry(spot.radius * 0.85, 14, 10);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.001,
            depthWrite: false
          });
          const hitMesh = new THREE.Mesh(hitGeo, hitMat);
          hitMesh.position.set(spot.pos[0], spot.pos[1], spot.pos[2]);
          hitMesh.userData = { id: spot.id, pickable: true };
          hitMesh.frustumCulled = false;
          instance.add(hitMesh);
          this.interactiveObjects.push(hitMesh);
        });
      }

      this.rootGroup.visible = true;
      updateDiagnosticsData();
      console.log(`[CellQuestAR] Model ${cellType} dibina dengan ${this.interactiveObjects.length} komponen interaktif`);
    },

    buildProceduralBackup(cellType) {
      this.clearModelHolder();
      const holder = new THREE.Group();
      holder.position.z += 0.35;

      this.currentBoundsStr = '[1.2, 0.9, 0.9]';
      this.currentRadiusStr = '0.72 unit';

      const addSphere = (id, pos, radius, color, opacity = 1) => {
        const geo = new THREE.SphereGeometry(radius, 24, 18);
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.5,
          transparent: opacity < 1,
          opacity,
          side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.frustumCulled = false;
        mesh.userData = { id, pickable: true, baseEmissive: 0, baseEmissiveIntensity: 0 };
        holder.add(mesh);
        this.interactiveObjects.push(mesh);
        return mesh;
      };

      if (cellType === 'animal') {
        // Membrane & Cytoplasm
        addSphere('membrane', [0, 0, 0], 0.72, 0x13a99c, 0.45);
        addSphere('cytoplasm', [0, 0, 0], 0.68, 0x8ddbd3, 0.25);
        // Nucleus
        addSphere('nucleus', [-0.08, 0.08, 0], 0.24, 0x8e4cc4);
        // Mitochondria
        addSphere('mitochondria', [0.35, -0.18, 0.1], 0.11, 0xe66a35);
        addSphere('mitochondria', [-0.32, -0.2, -0.1], 0.1, 0xe66a35);
        // Vacuole
        addSphere('vacuole', [-0.25, 0.28, 0.15], 0.09, 0x38a9c6, 0.7);
        // Centrioles
        addSphere('centrioles', [-0.28, -0.28, 0.12], 0.08, 0xf0b429);
        // Lysosome
        addSphere('lysosome', [0.38, 0.18, -0.1], 0.07, 0xe985b8);
      } else {
        // Plant cell box wall
        const wallGeo = new THREE.BoxGeometry(1.2, 0.85, 0.85);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x348a4d, roughness: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.frustumCulled = false;
        wallMesh.userData = { id: 'wall', pickable: true, baseEmissive: 0, baseEmissiveIntensity: 0 };
        holder.add(wallMesh);
        this.interactiveObjects.push(wallMesh);

        addSphere('membrane', [0, 0, 0], 0.45, 0x13a99c, 0.35);
        addSphere('vacuole', [-0.02, 0.05, 0], 0.22, 0x38a9c6, 0.65);
        addSphere('nucleus', [0.32, 0.15, -0.1], 0.14, 0x8e4cc4);
        addSphere('chloroplast', [-0.35, 0.18, 0.15], 0.11, 0x4c9b36);
        addSphere('chloroplast', [-0.32, -0.16, -0.15], 0.1, 0x4c9b36);
        addSphere('mitochondria', [0.24, -0.18, 0.12], 0.09, 0xe66a35);
      }

      this.modelHolder.add(holder);
      this.rootGroup.visible = true;
      updateDiagnosticsData();
    },

    toggleDebugCube() {
      if (this.debugCubeMesh) {
        this.modelHolder.remove(this.debugCubeMesh);
        if (this.debugCubeMesh.geometry) this.debugCubeMesh.geometry.dispose();
        if (this.debugCubeMesh.material) this.debugCubeMesh.material.dispose();
        this.debugCubeMesh = null;
        showToast('Kiub Debug 3D dimatikan', 1500);
        updateDiagnosticsData();
        return false;
      } else {
        const geo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x00ffcc,
          roughness: 0.2,
          metalness: 0.1,
          transparent: true,
          opacity: 0.85,
          emissive: 0x005544,
          emissiveIntensity: 0.8,
          side: THREE.DoubleSide
        });
        this.debugCubeMesh = new THREE.Mesh(geo, mat);
        this.debugCubeMesh.position.set(0, 0, 0.35);
        this.debugCubeMesh.frustumCulled = false;
        this.modelHolder.add(this.debugCubeMesh);
        showToast('✨ Kiub Debug 3D dipaparkan!', 2000);
        updateDiagnosticsData();
        return true;
      }
    },

    clearModelHolder() {
      if (!this.modelHolder) return;
      while (this.modelHolder.children.length > 0) {
        const child = this.modelHolder.children[0];
        child.traverse((m) => {
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
            else m.material.dispose();
          }
        });
        this.modelHolder.remove(child);
      }
      this.interactiveObjects = [];
      this.debugCubeMesh = null;
    },

    selectOrganelle(id) {
      const org = CELLQUEST_ORGANELLES[id];
      if (!org) return;

      this.selectedOrganelleId = id;

      if (DOM.cqCardIcon) DOM.cqCardIcon.textContent = org.icon;
      if (DOM.cqCardName) DOM.cqCardName.textContent = org.name.toUpperCase();
      if (DOM.cqCardCategory) DOM.cqCardCategory.textContent = org.category;
      if (DOM.cqCardFunction) DOM.cqCardFunction.textContent = org.description;
      if (DOM.cqCardAnalogy) DOM.cqCardAnalogy.textContent = org.analogy;
      if (DOM.cqCardFact) DOM.cqCardFact.textContent = org.fact;

      if (DOM.cqOrganelleCard) DOM.cqOrganelleCard.classList.remove('hidden');
      if (DOM.cqHintPill) DOM.cqHintPill.classList.add('hidden');

      showToast(`${org.icon} ${org.name} dipilih`, 1800);
    },

    clearSelection() {
      this.selectedOrganelleId = null;
      if (DOM.cqOrganelleCard) DOM.cqOrganelleCard.classList.add('hidden');
      if (DOM.cqHintPill) DOM.cqHintPill.classList.remove('hidden');

      // Restore base emissive on all objects
      this.interactiveObjects.forEach((m) => {
        const materials = Array.isArray(m.material) ? m.material : [m.material];
        const baseColors = Array.isArray(m.userData.baseEmissive) ? m.userData.baseEmissive : [m.userData.baseEmissive || 0];
        const baseIntensities = Array.isArray(m.userData.baseEmissiveIntensity) ? m.userData.baseEmissiveIntensity : [m.userData.baseEmissiveIntensity || 0];
        materials.forEach((mat, i) => {
          if (mat && mat.emissive) {
            mat.emissive.setHex(baseColors[i] || 0);
            mat.emissiveIntensity = baseIntensities[i] || 0;
          }
        });
      });
    },

    onTargetFound() {
      this.trackingState = 'MARKER_TRACKED';
      this.hasTargetLock = true;
      if (this.spatialMode === 'MARKER_MODE') {
        if (this.anchorGroup) this.anchorGroup.visible = true;
        if (this.rootGroup) this.rootGroup.visible = true;
        if (this.hologramPedestal && this.hologramPedestal.group) this.hologramPedestal.group.visible = true;
      }
      if (!this.isActive) {
        this.activate();
      } else {
        this.updateHUDModeUI();
      }
      updateDiagnosticsData();
    },

    onTargetLost() {
      this.trackingState = 'MARKER_LOST';
      if (this.spatialMode === 'MARKER_MODE') {
        this.hasTargetLock = false;
        if (this.rootGroup) this.rootGroup.visible = false;
        if (this.anchorGroup) this.anchorGroup.visible = false;
      }
      this.updateHUDModeUI();
      updateDiagnosticsData();
    },

    update(time) {
      if (!this.isActive || !this.rootGroup) return;

      // In POV mode or POV setup mode, continuously process gyroscope smoothing & orientation heading
      if (this.spatialMode === 'POV_LOCKED' || this.spatialMode === 'POV_SETUP') {
        initThreeHelpers();
        updateSmoothedQuaternion();
        updatePOVHeadingFromQuaternion();
      }

      // In POV mode, continuously project model position according to current orientation heading
      if (this.spatialMode === 'POV_LOCKED') {
        this.applyModelPosition();
      } else if (this.spatialMode === 'POV_SETUP') {
        this.updatePOVBannerSensorStatus();
      }

      // Auto-rotation around cell's vertical axis
      if (this.isAutoRotating && this.modelHolder) {
        this.userRotation.y += 0.01;
        this.modelHolder.rotation.y = this.userRotation.y;
      }

      // Pulse hologram base emitter if tracked on physical marker
      if (this.hologramPedestal && this.hologramPedestal.ringMesh && this.spatialMode === 'MARKER_MODE' && this.trackingState === 'MARKER_TRACKED') {
        const p = 1.0 + Math.sin(time * 0.004) * 0.06;
        this.hologramPedestal.ringMesh.scale.set(p, p, 1);
      }

      // Emissive pulse on selected organelle
      if (this.selectedOrganelleId) {
        const pulse = 0.5 + 0.4 * Math.sin(time * 0.006);
        this.interactiveObjects.forEach((m) => {
          if (m.userData.id === this.selectedOrganelleId) {
            const materials = Array.isArray(m.material) ? m.material : [m.material];
            materials.forEach((mat) => {
              if (mat && mat.emissive) {
                mat.emissive.setHex(0xffd166); // Gold glow
                mat.emissiveIntensity = pulse;
              }
            });
          }
        });
      }
    }
  };

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
   * Setup 3D Sci-Fi Hologram Pedestal for CellQuest 3D Marker (Target 3)
   */
  function createCellQuestHologramPedestal() {
    const group = new THREE.Group();
    group.name = 'CellQuest_HologramPedestal';

    const s = 0.52;
    // 1. Neon blue square frame
    const lineGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -s, -s, 0.01,   s, -s, 0.01,
       s, -s, 0.01,   s,  s, 0.01,
       s,  s, 0.01,  -s,  s, 0.01,
      -s,  s, 0.01,  -s, -s, 0.01
    ]);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const frameMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(frameMesh);

    // 2. Cyan corner target brackets
    const cs = 0.12;
    const bracketGeo = new THREE.BufferGeometry();
    const bVerts = new Float32Array([
      -s, s - cs, 0.015, -s, s, 0.015,  -s, s, 0.015, -s + cs, s, 0.015,
       s - cs, s, 0.015,  s, s, 0.015,   s, s, 0.015,  s, s - cs, 0.015,
       s, -s + cs, 0.015,  s, -s, 0.015,  s, -s, 0.015,  s - cs, -s, 0.015,
      -s + cs, -s, 0.015, -s, -s, 0.015, -s, -s, 0.015, -s, -s + cs, 0.015
    ]);
    bracketGeo.setAttribute('position', new THREE.BufferAttribute(bVerts, 3));
    const bracketMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 4 });
    const brackets = new THREE.LineSegments(bracketGeo, bracketMat);
    group.add(brackets);

    // 3. Central glowing blue emitter ring
    const circleGeo = new THREE.RingGeometry(0.12, 0.38, 36);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const ringMesh = new THREE.Mesh(circleGeo, circleMat);
    ringMesh.position.z = 0.02;
    group.add(ringMesh);

    // 4. Outer dashed projection circle
    const outerRingGeo = new THREE.RingGeometry(0.42, 0.46, 36);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.position.z = 0.02;
    group.add(outerRingMesh);

    return { group, ringMesh, outerRingMesh };
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

      // 2. Reveal appropriate POV panel (Video, Nota, Kuiz, or SelBot) via SpatialPanelManager
      if (typeof SpatialPanelManager !== 'undefined') {
        const hasVideo = ARState.activePanels && ARState.activePanels.has('video');
        const hasNota = ARState.activePanels && ARState.activePanels.has('nota');
        const hasKuiz = ARState.activePanels && ARState.activePanels.has('kuiz');
        const hasSelbot = ARState.activePanels && ARState.activePanels.has('selbot');

        // Manage SelBot POV Panel (Fasa 4F.1)
        if (hasSelbot || ARState.activeModule === 'selbot') {
          SpatialPanelManager.setPanelVisibility('selbot', true);
          if (DOM.povPanelSelbot) {
            const pSel = SpatialPanelManager.getPanel('selbot');
            if (!pSel || pSel.placementMode !== 'POV_LOCKED') {
              DOM.povPanelSelbot.classList.add('is-centered');
              DOM.povPanelSelbot.style.left = '50%';
              DOM.povPanelSelbot.style.top = '50%';
              DOM.povPanelSelbot.style.transform = 'translate(-50%, -50%)';
            }
            DOM.povPanelSelbot.style.opacity = '1';
            DOM.povPanelSelbot.style.visibility = 'visible';
            DOM.povPanelSelbot.style.pointerEvents = 'auto';
          }
          if (typeof SelBotARController !== 'undefined') {
            SelBotARController.init();
          }
        } else {
          SpatialPanelManager.setPanelVisibility('selbot', false);
        }

        // Manage Kuiz POV Panel
        if (hasKuiz || ARState.activeModule === 'kuiz') {
          SpatialPanelManager.setPanelVisibility('kuiz', true);
          if (DOM.povPanelKuiz) {
            const pKuiz = SpatialPanelManager.getPanel('kuiz');
            if (!pKuiz || pKuiz.placementMode !== 'POV_LOCKED') {
              DOM.povPanelKuiz.classList.add('is-centered');
              DOM.povPanelKuiz.style.left = '50%';
              DOM.povPanelKuiz.style.top = '50%';
              DOM.povPanelKuiz.style.transform = 'translate(-50%, -50%)';
            }
            DOM.povPanelKuiz.style.opacity = '1';
            DOM.povPanelKuiz.style.visibility = 'visible';
            DOM.povPanelKuiz.style.pointerEvents = 'auto';
          }
        } else {
          SpatialPanelManager.setPanelVisibility('kuiz', false);
        }

        // Manage Nota POV Panel
        if (hasNota || ARState.activeModule === 'nota') {
          SpatialPanelManager.setPanelVisibility('nota', true);
          if (DOM.povPanelNota) {
            const pNota = SpatialPanelManager.getPanel('nota');
            if (!pNota || pNota.placementMode !== 'POV_LOCKED') {
              DOM.povPanelNota.classList.add('is-centered');
              DOM.povPanelNota.style.left = '50%';
              DOM.povPanelNota.style.top = '50%';
              DOM.povPanelNota.style.transform = 'translate(-50%, -50%)';
            }
            DOM.povPanelNota.style.opacity = '1';
          }
        } else {
          SpatialPanelManager.setPanelVisibility('nota', false);
        }

        // Manage Video POV Panel
        if (hasVideo || (!hasNota && !hasKuiz && !hasSelbot && ARState.activeModule === 'video')) {
          SpatialPanelManager.setPanelVisibility('video', true);
          if (DOM.povPanelVideo) {
            const pVid = SpatialPanelManager.getPanel('video');
            if (!pVid || pVid.placementMode !== 'POV_LOCKED') {
              DOM.povPanelVideo.classList.add('is-centered');
              DOM.povPanelVideo.style.left = '50%';
              DOM.povPanelVideo.style.top = '50%';
              DOM.povPanelVideo.style.transform = 'translate(-50%, -50%)';
            }
            DOM.povPanelVideo.style.opacity = '1';
          }
        } else if (ARState.activeModule !== 'video' && !hasVideo) {
          SpatialPanelManager.setPanelVisibility('video', false);
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
      }

      // 3. Keep legacy recovery bar hidden (Multi-Panel Bar is active)
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.add('hidden');
      }

      // 4. Hide off-screen pointer
      if (DOM.povOffscreenPointer) {
        DOM.povOffscreenPointer.classList.add('hidden');
      }

      // 5. Setup / Reset Button States
      ARState.pov.isAnchored = false;
      if (DOM.povBtnAnchor) {
        DOM.povBtnAnchor.classList.remove('is-locked', 'hidden');
        if (DOM.povAnchorIcon) DOM.povAnchorIcon.textContent = 'my_location';
        if (DOM.povAnchorText) DOM.povAnchorText.textContent = 'Letak di Arah Ini';
      }
      if (DOM.povNotaBtnAnchor) {
        DOM.povNotaBtnAnchor.classList.remove('is-locked', 'hidden');
        if (DOM.povNotaAnchorIcon) DOM.povNotaAnchorIcon.textContent = 'my_location';
        if (DOM.povNotaAnchorText) DOM.povNotaAnchorText.textContent = 'Letak di Arah Ini';
      }
      if (DOM.povKuizBtnAnchor) {
        DOM.povKuizBtnAnchor.classList.remove('is-locked', 'hidden');
        if (DOM.povKuizAnchorIcon) DOM.povKuizAnchorIcon.textContent = 'my_location';
        if (DOM.povKuizAnchorText) DOM.povKuizAnchorText.textContent = 'Letak di Arah Ini';
      }
      if (DOM.povSelbotBtnAnchor) {
        DOM.povSelbotBtnAnchor.classList.remove('is-locked', 'hidden');
        if (DOM.povSelbotAnchorIcon) DOM.povSelbotAnchorIcon.textContent = 'my_location';
        if (DOM.povSelbotAnchorText) DOM.povSelbotAnchorText.textContent = 'Letak di Arah Ini';
      }
      if (DOM.povValStatus) {
        DOM.povValStatus.textContent = 'Halakan peranti ke arah pilihan';
        DOM.povValStatus.style.color = '#38bdf8';
      }
      if (DOM.povNotaValStatus) {
        DOM.povNotaValStatus.textContent = 'Halakan peranti ke arah pilihan';
        DOM.povNotaValStatus.style.color = '#38bdf8';
      }
      if (DOM.povKuizValStatus) {
        DOM.povKuizValStatus.textContent = 'Halakan peranti ke arah pilihan';
        DOM.povKuizValStatus.style.color = '#c084fc';
      }
      if (DOM.povSelbotValStatus) {
        DOM.povSelbotValStatus.textContent = 'Halakan peranti ke arah pilihan';
        DOM.povSelbotValStatus.style.color = '#06b6d4';
      }
      if (DOM.povStatusBanner) {
        if (DOM.povBannerIcon) DOM.povBannerIcon.textContent = 'sensors';
        if (DOM.povBannerText) DOM.povBannerText.textContent = 'Halakan peranti ke arah pilihan, kemudian tekan "Letak di Arah Ini".';
      }
      if (DOM.povNotaStatusBanner) {
        if (DOM.povNotaBannerIcon) DOM.povNotaBannerIcon.textContent = 'sensors';
        if (DOM.povNotaBannerText) DOM.povNotaBannerText.textContent = 'Halakan peranti ke arah pilihan, kemudian tekan "Letak di Arah Ini".';
      }
      if (DOM.povKuizStatusBanner) {
        if (DOM.povKuizBannerIcon) DOM.povKuizBannerIcon.textContent = 'sensors';
        if (DOM.povKuizBannerText) DOM.povKuizBannerText.textContent = 'Halakan peranti ke arah pilihan, kemudian tekan "Letak di Arah Ini".';
      }
      if (DOM.povSelbotStatusBanner) {
        if (DOM.povSelbotBannerIcon) DOM.povSelbotBannerIcon.textContent = 'sensors';
        if (DOM.povSelbotBannerText) DOM.povSelbotBannerText.textContent = 'Halakan peranti ke arah pilihan, kemudian tekan "Letak di Arah Ini".';
      }
      if (DOM.floatingPovStatusText) {
        DOM.floatingPovStatusText.textContent = 'Halakan peranti ke arah pilihan';
      }
      if (DOM.povBannerActions) DOM.povBannerActions.classList.add('hidden');
      if (DOM.povNotaBannerActions) DOM.povNotaBannerActions.classList.add('hidden');
      if (DOM.povKuizBannerActions) DOM.povKuizBannerActions.classList.add('hidden');
      if (DOM.povSelbotBannerActions) DOM.povSelbotBannerActions.classList.add('hidden');

      // 6. Update stepwise back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Semat Skrin';
      if (DOM.backHudIcon) DOM.backHudIcon.textContent = 'arrow_back';

    } else if (newMode === SYSTEM_MODES.POV_LOCKED) {
      // Anchored spatial mode: Remove .is-centered so projected transforms can position it
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.remove('is-centered');
      }
      if (DOM.povPanelNota) {
        DOM.povPanelNota.classList.remove('is-centered');
      }
      if (DOM.povPanelKuiz) {
        DOM.povPanelKuiz.classList.remove('is-centered');
      }
      if (DOM.povPanelSelbot) {
        DOM.povPanelSelbot.classList.remove('is-centered');
      }
      if (DOM.povFixedRecoveryBar) {
        DOM.povFixedRecoveryBar.classList.add('hidden');
      }
      if (DOM.backHudText) DOM.backHudText.textContent = 'Tetapan Pandangan';

    } else if (newMode === SYSTEM_MODES.SCREEN_PINNED) {
      // Return to Screen-Pinned Mode
      ARState.pov.active = false;
      if (ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }

      // Hide POV components (Video, Nota, Kuiz, SelBot)
      if (typeof SpatialPanelManager !== 'undefined') {
        SpatialPanelManager.setPanelVisibility('video', false);
        SpatialPanelManager.setPanelVisibility('nota', false);
        SpatialPanelManager.setPanelVisibility('kuiz', false);
        SpatialPanelManager.setPanelVisibility('selbot', false);
      }
      if (DOM.povAnchor) {
        DOM.povAnchor.classList.add('hidden');
        DOM.povAnchor.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povPanelNota) {
        DOM.povPanelNota.classList.add('hidden');
        DOM.povPanelNota.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povPanelKuiz) {
        DOM.povPanelKuiz.classList.add('hidden');
        DOM.povPanelKuiz.classList.remove('is-visible', 'is-centered');
      }
      if (DOM.povPanelSelbot) {
        DOM.povPanelSelbot.classList.add('hidden');
        DOM.povPanelSelbot.classList.remove('is-visible', 'is-centered');
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
      placeVideoOnScreen(true);

      // Update back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Imbas Kad AR';

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
          resetScannerTipsTimer();
        }
      }

      // Update back button HUD
      if (DOM.backHudText) DOM.backHudText.textContent = 'Kembali ke ARSELNEL';
    }
  }

  /**
   * Safe Area & Viewport Clamping Bounds Helper for iPad Safari & Mobile Viewports
   */
  function getSafeAreaBounds() {
    const isSmall = window.innerWidth <= 640 || window.innerHeight <= 700;
    const topInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0', 10) || 0;
    const botInset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0', 10) || 0;
    // .ar-top-hud clearance: on mobile HUD is more compact (56px), on tablet/desktop (82px)
    const hudClearance = isSmall ? 56 : 82;
    const topSafe = Math.max(hudClearance, topInset + (isSmall ? 44 : hudClearance));
    const botSafe = Math.max(isSmall ? 10 : 18, botInset + (isSmall ? 10 : 18));
    const leftSafe = isSmall ? 10 : 16;
    const rightSafe = isSmall ? 10 : 16;

    const cardRect = DOM.floatingCard ? DOM.floatingCard.getBoundingClientRect() : { width: 420, height: 460 };
    const cardW = cardRect.width || 420;
    const cardH = cardRect.height || 460;

    const halfW = cardW / 2;
    const halfH = cardH / 2;

    const minX = leftSafe + halfW;
    const maxX = window.innerWidth - rightSafe - halfW;

    const minY = topSafe + halfH;
    const maxY = window.innerHeight - botSafe - halfH;

    return {
      topSafe,
      botSafe,
      leftSafe,
      rightSafe,
      cardW,
      cardH,
      halfW,
      halfH,
      minX,
      maxX,
      minY,
      maxY,
      safeCenterY: (minY > maxY) ? (topSafe + halfH) : ((topSafe + (window.innerHeight - botSafe)) / 2)
    };
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
      ARState.hologramGroup.group.getWorldPosition(markerWorldPos);
      // Subtle hovering offset directly at marker plane without displacing card into header
      markerWorldPos.y += 0.05;

      // Project 3D coordinates to Screen Space [-1 to 1]
      const screenPos = markerWorldPos.clone().project(ARState.camera);

      // Convert to CSS Pixel coordinates
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const px = (screenPos.x * halfW) + halfW;
      const py = (-(screenPos.y * halfH)) + halfH;

      const bounds = getSafeAreaBounds();

      if (bounds.minX > bounds.maxX) {
        ARState.targetScreenX = halfW;
      } else {
        ARState.targetScreenX = Math.max(bounds.minX, Math.min(bounds.maxX, px));
      }

      if (bounds.minY > bounds.maxY) {
        ARState.targetScreenY = bounds.safeCenterY;
      } else {
        ARState.targetScreenY = Math.max(bounds.minY, Math.min(bounds.maxY, py));
      }
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
   * Fasa 4E-F.1.2: Kemas kini unjuran kedudukan spatial semua panel (MARKER_FOLLOW, SCREEN_PINNED, dll.)
   */
  function updateSpatialPanelsPosition() {
    // 1. Panel terapung tunggal (#floating-ar-anchor)
    if (DOM.floatingAnchor && ARState.activePanels.size <= 1 && DOM.floatingAnchor.classList.contains('is-visible')) {
      updateFloatingPanelPosition();
    }

    // 2. Multi-panel dalam SpatialPanelManager (#pov-panel-video, #pov-panel-nota, #pov-panel-kuiz)
    if (typeof SpatialPanelManager !== 'undefined') {
      const panels = SpatialPanelManager.getAllPanels();
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      const lerpFactor = ARState.lerpFactor || 0.25;

      panels.forEach((p) => {
        if (!p.isVisible) return;
        const el = p.element || document.getElementById(p.elementId);
        if (!el) return;

        const mode = p.placementMode || 'MARKER_FOLLOW';

        if (mode === 'MARKER_FOLLOW' || mode === 'MARKER_MODE' || mode === 'MARKER') {
          // Cari anchor sepadan bagi panel ini
          let anchor = null;
          if (p.id === 'video') anchor = ARState.anchorVideo || ARState.anchor;
          else if (p.id === 'nota') anchor = ARState.anchorNota;
          else if (p.id === 'kuiz') anchor = ARState.anchorKuiz;
          else if (p.id === 'selbot') anchor = ARState.anchorSelbot;

          const isVisible = anchor && anchor.group && anchor.group.visible;

          if (!isVisible) {
            // Kad tidak kelihatan -> sembunyikan panel sementara tanpa mengubah mod
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
            return;
          }

          // Kad kelihatan -> unjurkan kedudukan 3D marker ke piksel 2D skrin
          if (ARState.camera && anchor.group) {
            anchor.group.updateMatrixWorld(true);
            const markerWorldPos = new THREE.Vector3();
            anchor.group.getWorldPosition(markerWorldPos);
            markerWorldPos.y += 0.05; // Offset melayang sedikit di atas marker

            const screenPos = markerWorldPos.clone().project(ARState.camera);

            const px = (screenPos.x * halfW) + halfW + (p.dragOffset?.x || 0);
            const py = (-(screenPos.y * halfH)) + halfH + (p.dragOffset?.y || 0);

            if (typeof p.currentScreenX !== 'number' || isNaN(p.currentScreenX)) {
              p.currentScreenX = px;
              p.currentScreenY = py;
            } else {
              p.currentScreenX += (px - p.currentScreenX) * lerpFactor;
              p.currentScreenY += (py - p.currentScreenY) * lerpFactor;
            }

            const safeX = Math.max(10, Math.min(window.innerWidth - 10, p.currentScreenX));
            const safeY = Math.max(10, Math.min(window.innerHeight - 10, p.currentScreenY));

            el.classList.remove('is-centered');
            el.style.left = `${safeX}px`;
            el.style.top = `${safeY}px`;
            el.style.transform = 'translate(-50%, -50%)';
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.pointerEvents = 'auto';
          }
        } else if (mode === 'SCREEN_PINNED') {
          // Panel disemat pada skrin: pastikan kekal kelihatan walaupun kad hilang
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        }
        // POV_SETUP dan POV_LOCKED diuruskan oleh renderSinglePOVFrame()
      });
    }
  }

  /**
   * Resolve marker .mind file URL robustly across any URL structure
   */
  function getMarkerMindUrl() {
    const loc = window.location;
    const versionTag = 'v=fasa4f';
    if (loc.pathname.includes('/kotak_arselnel')) {
      const rootPart = loc.pathname.substring(0, loc.pathname.indexOf('/kotak_arselnel') + '/kotak_arselnel'.length);
      return `${loc.origin}${rootPart}/assets/markers/kotak_arselnel.mind?${versionTag}`;
    }
    return new URL(`assets/markers/kotak_arselnel.mind?${versionTag}`, loc.href).href;
  }

  /**
   * Reset previous MindAR tracking session before restart or navigation
   */
  function cleanupSession() {
    if (ARState.renderer) {
      try {
        ARState.renderer.setAnimationLoop(null);
      } catch (e) {}
    }
    if (DOM.container) {
      const videos = DOM.container.querySelectorAll('video');
      videos.forEach((v) => {
        try {
          v.pause();
          if (v.srcObject && typeof v.srcObject.getTracks === 'function') {
            v.srcObject.getTracks().forEach((track) => track.stop());
          }
          v.srcObject = null;
        } catch (e) {}
      });
    }
    if (ARState.cameraStream && typeof ARState.cameraStream.getTracks === 'function') {
      try {
        ARState.cameraStream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      ARState.cameraStream = null;
    }
    if (ARState.mindarThree) {
      try {
        ARState.mindarThree.stop();
      } catch (e) {}
      ARState.mindarThree = null;
    }
    if (DOM.container) {
      DOM.container.innerHTML = '';
    }
    if (typeof CellQuestARController !== 'undefined') {
      CellQuestARController.rootGroup = null;
      CellQuestARController.modelHolder = null;
      CellQuestARController.hologramPedestal = null;
      CellQuestARController.debugCubeMesh = null;
      CellQuestARController.hasTargetLock = false;
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

      // 🛡️ Safari iPadOS Safeguards: Force video playback attributes and ensure stream plays
      const videoEl = DOM.container ? DOM.container.querySelector('video') : null;
      if (videoEl) {
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        videoEl.muted = true;
        videoEl.style.zIndex = '1';
        if (videoEl.paused) {
          try {
            await videoEl.play();
            console.log('[KotakAR] Safari camera video stream berjaya dimulakan secara eksplisit.');
          } catch (pErr) {
            console.warn('[KotakAR] video.play() amaran:', pErr);
          }
        }
      }
      ARState.lastErrorMsg = null;
    } catch (startErr) {
      let normalized = startErr;
      if (!normalized) {
        normalized = new Error('Akses kamera tidak dibenarkan atau disekat.');
        normalized.code = 'NotAllowedError';
      } else if (typeof normalized === 'string') {
        normalized = new Error(normalized);
      }
      ARState.lastErrorMsg = normalized.message;
      throw normalized;
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
    }
  }

  let isInitializingMindAR = false;

  /**
   * Initialize MindAR Image Tracking Session
   */
  async function initMindAR() {
    if (isInitializingMindAR) {
      console.warn('[KotakAR] ⚠️ initMindAR() sedang berjalan. Panggilan serentak disekat.');
      return;
    }
    isInitializingMindAR = true;
    try {
      console.log('[KotakAR] Memulakan MindAR Image Tracking Engine...');
      ARState.mindarInitCount = (ARState.mindarInitCount || 0) + 1;
      cleanupSession();
      ARState.lastErrorMsg = null;

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

    // Fasa 4D-D.1: Ensure camera is explicitly added to Three.js scene so pinned/screen children render
    if (!scene.children.includes(camera)) {
      scene.add(camera);
    }

    // 🛡️ Fasa 4D-D.1: Hook resize() to ensure camera.near is ALWAYS 0.1 (never clipped at 10.0)
    const origMindARResize = ARState.mindarThree.resize.bind(ARState.mindarThree);
    ARState.mindarThree.resize = function() {
      try {
        origMindARResize();
      } catch (e) {}
      if (ARState.camera && ARState.camera.near > 0.1) {
        ARState.camera.near = 0.1;
        ARState.camera.updateProjectionMatrix();
      }
    };
    if (ARState.camera && ARState.camera.near > 0.1) {
      ARState.camera.near = 0.1;
      ARState.camera.updateProjectionMatrix();
    }

    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    // Target 0 = VIDEO MARKER
    ARState.anchorVideo = ARState.mindarThree.addAnchor(0);
    // Target 1 = NOTA MARKER
    ARState.anchorNota = ARState.mindarThree.addAnchor(1);
    // Target 2 = KUIZ & PERMAINAN MARKER
    ARState.anchorKuiz = ARState.mindarThree.addAnchor(2);
    // Target 3 = SEL HAIWAN (CELLQUEST 3D)
    ARState.anchorCellQuestAnimal = ARState.mindarThree.addAnchor(3);
    // Target 4 = SEL TUMBUHAN (CELLQUEST 3D)
    ARState.anchorCellQuestPlant = ARState.mindarThree.addAnchor(4);
    // Target 5 = JELAJAH 3D (MAKMAL EKSPLORASI 3D INTRO PANEL)
    ARState.anchorJelajah3D = ARState.mindarThree.addAnchor(5);
    // Target 6 = AR ORIENTASI DUNIA (MISI JELAJAH DUNIA SEL INTRO PANEL)
    ARState.anchorOrientasiDunia = ARState.mindarThree.addAnchor(6);
    // Target 7 = SELBOT AI (PANEL PERBUALAN SELBOT AI TERAPUNG - FASA 4F)
    ARState.anchorSelbot = ARState.mindarThree.addAnchor(7);
    if (DOM.diagMarkerMindStatus) {
      DOM.diagMarkerMindStatus.textContent = '6 Sasaran Aktif';
      DOM.diagMarkerMindStatus.className = 'v ok';
    }
    if (ARState.anchorJelajah3D) {
      ARState.anchorJelajah3D.onTargetFound = () => {
        if (GameSessionManager.isGameActive()) return;
        console.info('[KotakAR] MindAR Target 5 (Jelajah 3D) FOUND');
        clearTimeout(ARState.hysteresisTimer);
        handleTargetFound(5, 'jelajah3d');
      };
      ARState.anchorJelajah3D.onTargetLost = () => {
        if (GameSessionManager.isGameActive()) return;
        console.info('[KotakAR] MindAR Target 5 (Jelajah 3D) LOST');
      };
    }
    if (ARState.anchorOrientasiDunia) {
      ARState.anchorOrientasiDunia.onTargetFound = () => {
        if (GameSessionManager.isGameActive()) return;
        console.info('[KotakAR] MindAR Target 6 (AR Orientasi Dunia) FOUND');
        clearTimeout(ARState.hysteresisTimer);
        handleTargetFound(6, 'orientasi');
      };
      ARState.anchorOrientasiDunia.onTargetLost = () => {
        if (GameSessionManager.isGameActive()) return;
        console.info('[KotakAR] MindAR Target 6 (AR Orientasi Dunia) LOST');
      };
    }
    // FASA PEMBERSIHAN KOTAK ARSELNEL: Target 7 (SelBot AI) dinyahaktifkan sepenuhnya
    if (ARState.anchorSelbot) {
      ARState.anchorSelbot.onTargetFound = () => {};
      ARState.anchorSelbot.onTargetLost = () => {};
    }
    // Rujukan anchor CellQuest aktif semasa (lalai: Sel Haiwan)
    ARState.anchorCellQuest = ARState.anchorCellQuestAnimal;

    // Fasa 4D-C: Initialize CellQuest 3D Controller on Anchor 3
    if (typeof CellQuestARController !== 'undefined' && typeof CellQuestARController.init === 'function') {
      CellQuestARController.init(ARState.scene, ARState.anchorCellQuest.group, ARState.camera, ARState.renderer);
    }

    // Default primary anchor pointer
    ARState.anchor = ARState.activeModule === 'nota' ? ARState.anchorNota : (ARState.activeModule === 'cellquest' ? ARState.anchorCellQuest : ARState.anchorVideo);

    ARState.hologramGroup = create3DHologramBase();
    if (ARState.hologramGroup && ARState.hologramGroup.group) {
      ARState.anchorVideo.group.add(ARState.hologramGroup.group);
    }

    // Target 0 (Video) Found Event
    ARState.anchorVideo.onTargetFound = () => {
      // 🛡️ ISOLATION: If a game session is active, ignore other markers to prevent interruption
      if (GameSessionManager.isGameActive()) {
        console.log('[KotakAR] 🛡️ Permainan aktif, pengesanan Marker Video diabaikan.');
        return;
      }
      handleTargetFound(0, 'video');
    };

    // Target 0 (Video) Lost Event with Debounce Hysteresis
    ARState.anchorVideo.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker Video hilang dari pandangan...');
      clearTimeout(ARState.lostTimeout);
      if (ARState.markerCooldown) ARState.markerCooldown['video'] = 0;

      ARState.lostTimeout = setTimeout(() => {
        if (ARState.activeModule === 'video' || ARState.activePanels.has('video')) {
          ARState.isTracking = false;
          console.log('[KotakAR] Marker Video disahkan hilang.');

          if (ARSessionRecoveryManager && typeof ARSessionRecoveryManager.setState === 'function') {
            ARSessionRecoveryManager.setState(ARSessionRecoveryManager.State.SCANNING);
          }

          const pVid = (typeof SpatialPanelManager !== 'undefined') ? SpatialPanelManager.getPanel('video') : null;
          const modeVid = pVid ? pVid.placementMode : (ARState.isPinned ? 'SCREEN_PINNED' : 'MARKER_FOLLOW');

          if (modeVid === 'MARKER_FOLLOW' || modeVid === 'MARKER_MODE' || modeVid === 'MARKER') {
            if (DOM.povPanelVideo) {
              DOM.povPanelVideo.style.opacity = '0';
              DOM.povPanelVideo.style.visibility = 'hidden';
              DOM.povPanelVideo.style.pointerEvents = 'none';
            }
            if (DOM.floatingAnchor && ARState.activePanels.size <= 1) DOM.floatingAnchor.classList.remove('is-visible');
            if (DOM.scannerOverlay && ARState.activePanels.size <= 1) DOM.scannerOverlay.classList.remove('hidden');
            showToast('Kad AR tidak dikesan. Imbas semula untuk memaparkan panel.', 3000);
          }
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // Target 1 (Nota) Found Event
    ARState.anchorNota.onTargetFound = () => {
      // 🛡️ ISOLATION: If a game session is active, ignore other markers to prevent interruption
      if (GameSessionManager.isGameActive()) {
        console.log('[KotakAR] 🛡️ Permainan aktif, pengesanan Marker Nota diabaikan.');
        return;
      }
      handleTargetFound(1, 'nota');
    };

    // Target 1 (Nota) Lost Event with Debounce Hysteresis
    ARState.anchorNota.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker Nota hilang dari pandangan...');
      clearTimeout(ARState.lostTimeout);
      if (ARState.markerCooldown) ARState.markerCooldown['nota'] = 0;

      ARState.lostTimeout = setTimeout(() => {
        if (ARState.activeModule === 'nota' || ARState.activePanels.has('nota')) {
          ARState.isTracking = false;
          console.log('[KotakAR] Marker Nota disahkan hilang.');

          if (ARSessionRecoveryManager && typeof ARSessionRecoveryManager.setState === 'function') {
            ARSessionRecoveryManager.setState(ARSessionRecoveryManager.State.SCANNING);
          }

          const pNot = (typeof SpatialPanelManager !== 'undefined') ? SpatialPanelManager.getPanel('nota') : null;
          const modeNot = pNot ? pNot.placementMode : (ARState.isPinned ? 'SCREEN_PINNED' : 'MARKER_FOLLOW');

          if (modeNot === 'MARKER_FOLLOW' || modeNot === 'MARKER_MODE' || modeNot === 'MARKER') {
            if (DOM.povPanelNota) {
              DOM.povPanelNota.style.opacity = '0';
              DOM.povPanelNota.style.visibility = 'hidden';
              DOM.povPanelNota.style.pointerEvents = 'none';
            }
            if (DOM.floatingAnchor && ARState.activePanels.size <= 1) DOM.floatingAnchor.classList.remove('is-visible');
            if (DOM.scannerOverlay && ARState.activePanels.size <= 1) DOM.scannerOverlay.classList.remove('hidden');
            showToast('Kad AR tidak dikesan. Imbas semula untuk memaparkan panel.', 3000);
          }
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // FASA PEMBERSIHAN KOTAK ARSELNEL: Target 2 (Kuiz & Permainan) dinyahaktifkan sepenuhnya
    if (ARState.anchorKuiz) {
      ARState.anchorKuiz.onTargetFound = () => {};
      ARState.anchorKuiz.onTargetLost = () => {};
    }

    // Target 3 (Sel Haiwan 3D) Found Event
    ARState.anchorCellQuestAnimal.onTargetFound = () => {
      // 🛡️ ISOLATION: If a game session is active, ignore other markers to prevent interruption
      if (GameSessionManager.isGameActive()) {
        console.log('[KotakAR] 🛡️ Permainan aktif, pengesanan Marker Sel Haiwan diabaikan.');
        return;
      }
      handleTargetFound(3, 'cellquest', 'animal');
    };

    // Target 3 (Sel Haiwan 3D) Lost Event with Debounce Hysteresis
    ARState.anchorCellQuestAnimal.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker Sel Haiwan hilang dari sasaran langsung...');
      clearTimeout(ARState.lostTimeout);
      if (ARState.markerCooldown) {
        ARState.markerCooldown['cellquest'] = 0;
        ARState.markerCooldown['cellquest_animal'] = 0;
      }

      ARState.lostTimeout = setTimeout(() => {
        if (ARState.activeModule === 'cellquest' && CellQuestARController.activeCellType === 'animal') {
          console.log('[KotakAR] Marker Sel Haiwan hilang disahkan selepas tempoh hysteresis.');
          if (typeof CellQuestARController !== 'undefined' && typeof CellQuestARController.onTargetLost === 'function') {
            CellQuestARController.onTargetLost();
          }
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // Target 4 (Sel Tumbuhan 3D) Found Event
    ARState.anchorCellQuestPlant.onTargetFound = () => {
      // 🛡️ ISOLATION: If a game session is active, ignore other markers to prevent interruption
      if (GameSessionManager.isGameActive()) {
        console.log('[KotakAR] 🛡️ Permainan aktif, pengesanan Marker Sel Tumbuhan diabaikan.');
        return;
      }
      handleTargetFound(4, 'cellquest', 'plant');
    };

    // Target 4 (Sel Tumbuhan 3D) Lost Event with Debounce Hysteresis
    ARState.anchorCellQuestPlant.onTargetLost = () => {
      console.log('[KotakAR] ⏳ Marker Sel Tumbuhan hilang dari sasaran langsung...');
      clearTimeout(ARState.lostTimeout);
      if (ARState.markerCooldown) {
        ARState.markerCooldown['cellquest'] = 0;
        ARState.markerCooldown['cellquest_plant'] = 0;
      }

      ARState.lostTimeout = setTimeout(() => {
        if (ARState.activeModule === 'cellquest' && CellQuestARController.activeCellType === 'plant') {
          console.log('[KotakAR] Marker Sel Tumbuhan hilang disahkan selepas tempoh hysteresis.');
          if (typeof CellQuestARController !== 'undefined' && typeof CellQuestARController.onTargetLost === 'function') {
            CellQuestARController.onTargetLost();
          }
        }
      }, ARState.HYSTERESIS_DELAY);
    };

    // Keserasian ke belakang untuk rujukan anchorCellQuest tunggal
    if (ARState.anchorCellQuest) {
      ARState.anchorCellQuest.onTargetFound = ARState.anchorCellQuestAnimal.onTargetFound;
      ARState.anchorCellQuest.onTargetLost = ARState.anchorCellQuestAnimal.onTargetLost;
    }

    // Start camera stream safely
    await startMindARTracking();
    ARState.cameraActive = true;
    if (ARSessionRecoveryManager && typeof ARSessionRecoveryManager.setState === 'function') {
      ARSessionRecoveryManager.setState(ARSessionRecoveryManager.State.SCANNING);
    }
    resetScannerTipsTimer();
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

      // Fasa 4D-D.1: Update CellQuest 3D model (visibility strictly governed by tracking state & spatial mode)
      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive) {
        if (typeof CellQuestARController.update === 'function') {
          CellQuestARController.update(performance.now());
        }
      }

      updateSpatialPanelsPosition();
      if (camera && camera.near > 0.1) {
        camera.near = 0.1;
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);
    });
    } catch (initErr) {
      console.error('[KotakAR] Ralat kritikal semasa initMindAR:', initErr);
      ARState.lastErrorMsg = initErr.message || String(initErr);
      throw initErr;
    } finally {
      isInitializingMindAR = false;
    }
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
    let desc = 'Sila benarkan akses kamera untuk mengimbas Kad AR Kotak ARSELNEL.';

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
          <span>Kembali ke ARSELNEL</span>
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
   * Clamp floating panel coordinates firmly inside safe viewport bounds so header and footer NEVER cut off
   */
  function clampPanelIntoViewport() {
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.getAllPanels().forEach((p) => {
        if (!p.isVisible || p.placementMode === 'POV_LOCKED') return;
        const el = p.element || document.getElementById(p.elementId);
        if (!el) return;
        const cardEl = el.querySelector('.pov-card-container') || el;
        const rect = cardEl.getBoundingClientRect();
        const halfW = (rect.width || 360) / 2;
        const halfH = (rect.height || 440) / 2;
        const padX = 12;
        const topSafe = 115;
        const botSafe = 16;
        const minX = halfW + padX;
        const maxX = Math.max(minX, window.innerWidth - halfW - padX);
        const minY = topSafe + halfH;
        const maxY = Math.max(minY, window.innerHeight - botSafe - halfH);
        let cx = p.pinnedX || (window.innerWidth / 2);
        let cy = p.pinnedY || (window.innerHeight / 2);
        if (window.innerWidth < 600) {
          cx = window.innerWidth / 2;
        } else {
          cx = Math.max(minX, Math.min(maxX, cx));
        }
        cy = Math.max(minY, Math.min(maxY, cy));
        p.pinnedX = cx;
        p.pinnedY = cy;
        el.style.left = `${Math.round(cx)}px`;
        el.style.top = `${Math.round(cy)}px`;
        el.style.transform = 'translate(-50%, -50%)';
      });
    }

    if (!DOM.floatingAnchor || !DOM.floatingCard) return;
    // In POV Mode, panel is world-locked and must be allowed to move freely out of FOV
    if (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED) return;

    const bounds = getSafeAreaBounds();

    let clampedX = ARState.currentScreenX;
    let clampedY = ARState.currentScreenY;

    let minX = bounds.minX;
    let maxX = bounds.maxX;
    if (minX > maxX) {
      clampedX = window.innerWidth - bounds.rightSafe - bounds.halfW;
    } else {
      clampedX = Math.max(minX, Math.min(maxX, clampedX));
    }

    let minY = bounds.minY;
    let maxY = bounds.maxY;
    if (minY > maxY) {
      // Screen height is tight; anchor safely at top so card header is NEVER clipped behind top HUD
      clampedY = bounds.topSafe + bounds.halfH;
    } else {
      clampedY = Math.max(minY, Math.min(maxY, clampedY));
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
  function placeVideoOnScreen(force = false) {
    if (ARState.isPinned && !force) return;
    ARState.systemMode = SYSTEM_MODES.SCREEN_PINNED;
    ARState.isPinned = true;
    ARState.isLocked = false;
    if (!force) maybeShowPOVInteractiveGuide();

    // Fasa 4F.1: Sync with SpatialPanelManager so active panel is registered as SCREEN_PINNED
    if (typeof SpatialPanelManager !== 'undefined') {
      const activeMod = ARState.activeModule || 'video';
      const p = SpatialPanelManager.getPanel(activeMod);
      if (p) {
        p.placementMode = 'SCREEN_PINNED';
        p.isLocked = false;
      }
      SpatialPanelManager.syncPanelControlUI(activeMod);
    }

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

    const modLabel = (ARState.activeModule === 'nota') ? 'Nota' : (ARState.activeModule === 'kuiz' ? 'Kuiz' : (ARState.activeModule === 'selbot' ? 'SelBot AI' : 'Video'));
    showToast(`📌 ${modLabel} disematkan ke skrin! Anda boleh seret panel atau ubah saiz.`);
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
    if (ARState.activeGame) {
      closeEmbeddedGame();
    }
    if (ARState.activeModule === 'nota') {
      destroyNotaSession();
    } else if (ARState.activeModule === 'kuiz') {
      destroyKuizSession();
    } else if (ARState.activeModule === 'selbot') {
      destroySelbotSession();
    } else if (ARState.activeModule === 'cellquest') {
      if (typeof destroyCellQuestSession === 'function') {
        destroyCellQuestSession();
      } else if (typeof CellQuestARController !== 'undefined') {
        CellQuestARController.deactivate();
      }
    } else {
      destroyVideoSession();
    }
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
      // If user tapped directly on lock badge, allow click toggle without initiating drag
      if (e.target.closest('#drag-lock-badge')) {
        return;
      }

      if (e.cancelable) e.preventDefault();

      ARState.isDragging = true;
      ARState.dragStartX = e.clientX;
      ARState.dragStartY = e.clientY;

      // Normalize panel coordinates directly from viewport bounding client rect
      if (DOM.floatingAnchor) {
        const aRect = DOM.floatingAnchor.getBoundingClientRect();
        if (aRect.width > 0 && aRect.height > 0) {
          ARState.currentScreenX = aRect.left + (aRect.width / 2);
          ARState.currentScreenY = aRect.top + (aRect.height / 2);
        }
      }
      ARState.initialPanelX = ARState.currentScreenX;
      ARState.initialPanelY = ARState.currentScreenY;

      if (DOM.floatingCard) {
        DOM.floatingCard.classList.add('is-dragging');
      }

      // Capture pointer for continuous smooth dragging across iPad Safari viewport
      if (e.target && typeof e.target.setPointerCapture === 'function') {
        try {
          e.target.setPointerCapture(e.pointerId);
          ARState._dragPointerTarget = e.target;
          ARState._dragPointerId = e.pointerId;
        } catch (_) {}
      }

      window.addEventListener('pointermove', handleDragMove, { passive: false });
      window.addEventListener('pointerup', handleDragEnd);
      window.addEventListener('pointercancel', handleDragEnd);
    };

    const handleDragMove = (e) => {
      if (!ARState.isDragging) return;
      if (e.cancelable) e.preventDefault();

      const deltaX = e.clientX - ARState.dragStartX;
      const deltaY = e.clientY - ARState.dragStartY;

      const bounds = getSafeAreaBounds();

      let newX = ARState.initialPanelX + deltaX;
      let newY = ARState.initialPanelY + deltaY;

      let minX = bounds.minX;
      let maxX = bounds.maxX;
      if (minX > maxX) {
        minX = window.innerWidth - bounds.rightSafe - bounds.halfW;
        maxX = bounds.leftSafe + bounds.halfW;
      }
      newX = Math.max(Math.min(minX, maxX), Math.min(Math.max(minX, maxX), newX));

      let minY = bounds.minY;
      let maxY = bounds.maxY;
      if (minY > maxY) {
        minY = window.innerHeight - bounds.botSafe - bounds.halfH;
        maxY = bounds.topSafe + bounds.halfH;
      }
      newY = Math.max(Math.min(minY, maxY), Math.min(Math.max(minY, maxY), newY));

      ARState.targetScreenX = newX;
      ARState.targetScreenY = newY;
      ARState.currentScreenX = newX;
      ARState.currentScreenY = newY;

      if (DOM.floatingAnchor) {
        DOM.floatingAnchor.style.left = `${newX}px`;
        DOM.floatingAnchor.style.top = `${newY}px`;
      }
    };

    const handleDragEnd = (e) => {
      if (!ARState.isDragging) return;
      ARState.isDragging = false;

      if (ARState._dragPointerTarget && typeof ARState._dragPointerTarget.releasePointerCapture === 'function') {
        try {
          ARState._dragPointerTarget.releasePointerCapture(ARState._dragPointerId);
        } catch (_) {}
        ARState._dragPointerTarget = null;
      }

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

    // Fasa 4C.4: Freeform 2D Corner Resize Grips (X, Y, Diagonal, Double-Tap Maximize)
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
    if (DOM.povNotaBtnStartPOV) {
      DOM.povNotaBtnStartPOV.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.enterPanelPOVSetup('nota');
        } else {
          startPOVMode();
        }
      });
    }
    if (DOM.povNotaBtnAnchor) {
      DOM.povNotaBtnAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePanelLock('nota');
        } else {
          anchorPOVAtCurrentHeading();
        }
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
    if (DOM.povNotaBtnBackPinned) {
      DOM.povNotaBtnBackPinned.addEventListener('click', () => {
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePinMode('nota');
        } else {
          exitPOVMode(true);
        }
      });
    }
    if (DOM.povNotaBtnClose) {
      DOM.povNotaBtnClose.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        destroyNotaSession();
      });
    }

    // Fasa 4E-C.2: Event Listeners for Kuiz Independent POV Panel
    if (DOM.povKuizCornerResizeHandle && DOM.povKuizCard) {
      setupCornerResizeGrip(DOM.povKuizCornerResizeHandle, DOM.povKuizCard, true);
    }
    if (DOM.povKuizSizeS) DOM.povKuizSizeS.addEventListener('click', () => setPOVPanelSize('small', 'kuiz'));
    if (DOM.povKuizSizeM) DOM.povKuizSizeM.addEventListener('click', () => setPOVPanelSize('medium', 'kuiz'));
    if (DOM.povKuizSizeL) DOM.povKuizSizeL.addEventListener('click', () => setPOVPanelSize('large', 'kuiz'));
    if (DOM.povKuizBtnToggleCam) DOM.povKuizBtnToggleCam.addEventListener('click', toggleCameraPower);
    if (DOM.povKuizBtnStartPOV) {
      DOM.povKuizBtnStartPOV.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.enterPanelPOVSetup('kuiz');
        } else {
          startPOVMode();
        }
      });
    }
    if (DOM.povKuizBtnAnchor) {
      DOM.povKuizBtnAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePanelLock('kuiz');
        } else {
          anchorPOVAtCurrentHeading('kuiz');
        }
      });
    }
    if (DOM.povKuizBtnChangeContent) {
      DOM.povKuizBtnChangeContent.addEventListener('click', () => {
        if (!DOM.povKuizSelectionView) return;
        const isHidden = DOM.povKuizSelectionView.classList.contains('hidden');
        if (isHidden) {
          DOM.povKuizSelectionView.classList.remove('hidden');
          if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
          if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
          if (DOM.povEmbeddedGameView) DOM.povEmbeddedGameView.classList.add('hidden');
          renderPOV5GamesCatalog();
          showToast('Pilih kuiz atau permainan baharu daripada senarai.');
        } else {
          DOM.povKuizSelectionView.classList.add('hidden');
          if (ARState.activeQuiz && DOM.povActiveKuizView) {
            DOM.povActiveKuizView.classList.remove('hidden');
          } else if (GameSessionManager.isGameActive() && DOM.povEmbeddedGameView) {
            DOM.povEmbeddedGameView.classList.remove('hidden');
          }
        }
      });
    }
    if (DOM.povKuizBtnBackPinned) {
      DOM.povKuizBtnBackPinned.addEventListener('click', () => {
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePinMode('kuiz');
        } else {
          exitPOVMode(true);
        }
      });
    }
    if (DOM.povKuizBtnClose) {
      DOM.povKuizBtnClose.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        destroyKuizSession();
      });
    }

    // Fasa 4F: Event Listeners for SelBot AI Independent POV Panel
    if (DOM.povSelbotCornerResizeHandle && DOM.povSelbotCard) {
      setupCornerResizeGrip(DOM.povSelbotCornerResizeHandle, DOM.povSelbotCard, true);
    }
    if (DOM.povSelbotSizeS) DOM.povSelbotSizeS.addEventListener('click', () => setPOVPanelSize('small', 'selbot'));
    if (DOM.povSelbotSizeM) DOM.povSelbotSizeM.addEventListener('click', () => setPOVPanelSize('medium', 'selbot'));
    if (DOM.povSelbotSizeL) DOM.povSelbotSizeL.addEventListener('click', () => setPOVPanelSize('large', 'selbot'));
    if (DOM.povSelbotBtnToggleCam) DOM.povSelbotBtnToggleCam.addEventListener('click', toggleCameraPower);
    if (DOM.povSelbotBtnStartPOV) {
      DOM.povSelbotBtnStartPOV.addEventListener('click', async (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const perm = await DeviceOrientationEvent.requestPermission();
            if (perm === 'granted') {
              ARState.pov.permissionGranted = true;
            }
          } catch (err) {
            console.warn('[KotakAR-POV] Izin sensor ditolak atau ralat:', err);
          }
        }
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.enterPanelPOVSetup('selbot');
        } else {
          startPOVMode();
        }
      });
    }
    if (DOM.povSelbotBtnAnchor) {
      DOM.povSelbotBtnAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePanelLock('selbot');
        } else {
          anchorPOVAtCurrentHeading('selbot');
        }
      });
    }
    if (DOM.povSelbotBtnChangeContent) {
      DOM.povSelbotBtnChangeContent.addEventListener('click', () => {
        SelBotARController.toggleHistoryPanel();
      });
    }
    if (DOM.povSelbotBtnBackPinned) {
      DOM.povSelbotBtnBackPinned.addEventListener('click', () => {
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePinMode('selbot');
        } else {
          exitPOVMode(true);
        }
      });
    }
    if (DOM.povSelbotBtnClose) {
      DOM.povSelbotBtnClose.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        destroySelbotSession();
      });
    }
  }

  /**
   * Fasa 4C.4: Universal Corner Resize Grip Engine (2D Width & Height + Diagonal + Double-Tap)
   */
  function setupCornerResizeGrip(handle, targetCard, isPOV = false) {
    if (!handle || !targetCard) return;

    let lastTapTime = 0;

    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Double-tap or double-click to toggle Maximize
      const now = performance.now();
      if ((now - lastTapTime) < 320) {
        lastTapTime = 0;
        toggleMaximizePanel();
        return;
      }
      lastTapTime = now;

      if (handle.setPointerCapture) {
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      }

      ARState.isResizing = true;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = targetCard.getBoundingClientRect();
      const startW = rect.width;
      const startH = rect.height;

      targetCard.classList.add('is-dragging', 'is-custom-resized');

      const wrapper = isPOV ? DOM.povEmbeddedIframeWrapper : DOM.embeddedIframeWrapper;

      const handleResizeMove = (ev) => {
        if (!ARState.isResizing) return;
        ev.preventDefault();

        const dX = ev.clientX - startX;
        const dY = ev.clientY - startY;

        const bounds = getSafeAreaBounds();
        const maxAllowedW = Math.max(300, window.innerWidth - (bounds.leftSafe + bounds.rightSafe));
        const maxAllowedH = Math.max(320, window.innerHeight - (bounds.topSafe + bounds.botSafe));

        // Diagonal / 2D expansion around center anchor
        const newW = Math.max(280, Math.min(maxAllowedW, startW + dX * 2));
        const newH = Math.max(320, Math.min(maxAllowedH, startH + dY * 2));

        targetCard.style.width = `${newW}px`;
        targetCard.style.height = `${newH}px`;
        targetCard.style.maxHeight = `${maxAllowedH}px`;

        // Proportionally scale embedded iframe height so game fills available card space
        if (wrapper) {
          const headerH = DOM.panelHeader ? DOM.panelHeader.offsetHeight : 54;
          const footerH = DOM.panelFooter ? DOM.panelFooter.offsetHeight : 54;
          wrapper.style.height = `${Math.max(260, newH - headerH - footerH - 64)}px`;
        }

        if (!isPOV) {
          clampPanelIntoViewport();
        }
      };

      const handleResizeEnd = () => {
        ARState.isResizing = false;
        targetCard.classList.remove('is-dragging');
        if (handle.releasePointerCapture) {
          try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        window.removeEventListener('pointermove', handleResizeMove);
        window.removeEventListener('pointerup', handleResizeEnd);
        window.removeEventListener('pointercancel', handleResizeEnd);

        if (!isPOV) {
          clampPanelIntoViewport();
        }
      };

      window.addEventListener('pointermove', handleResizeMove, { passive: false });
      window.addEventListener('pointerup', handleResizeEnd);
      window.addEventListener('pointercancel', handleResizeEnd);
    });
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
    let angle = null;
    if (typeof window.orientation !== 'undefined' && Number.isFinite(window.orientation)) {
      angle = window.orientation;
    }
    if (angle === null && window.screen && window.screen.orientation && Number.isFinite(window.screen.orientation.angle)) {
      angle = window.screen.orientation.angle;
    }
    if (angle === -90) angle = 270;
    const isLandscape = (typeof window !== 'undefined' && window.innerWidth > window.innerHeight);
    if (isLandscape && (angle === 0 || angle === 180 || angle === null)) {
      angle = 90;
    } else if (!isLandscape && (angle === 90 || angle === 270)) {
      angle = 0;
    }
    return angle || 0;
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

    // Hide error banner actions if sensor has resumed delivering events
    if (DOM.povBannerActions) DOM.povBannerActions.classList.add('hidden');
    if (DOM.povNotaBannerActions) DOM.povNotaBannerActions.classList.add('hidden');
    if (DOM.povKuizBannerActions) DOM.povKuizBannerActions.classList.add('hidden');

    const screenAngle = getScreenOrientationAngle();
    ARState.pov.screenAngle = screenAngle;

    initThreeHelpers();
    if (window.THREE) {
      const qTarget = computeDeviceCameraQuaternion(rawA, rawB, rawG, screenAngle);
      if (qTarget) {
        ARState.pov.targetQuaternion = qTarget;
        if (!ARState.pov.currentQuaternion) {
          ARState.pov.currentQuaternion = qTarget.clone();
        } else {
          updateSmoothedQuaternion();
        }
        updatePOVHeadingFromQuaternion();
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
          if (DOM.povSensorText) DOM.povSensorText.textContent = 'Sensor Tidak Aktif';
          if (DOM.povSensorPing) {
            DOM.povSensorPing.style.background = '#ef4444';
            DOM.povSensorPing.style.boxShadow = '0 0 8px #ef4444';
          }
          if (DOM.povBannerText) {
            DOM.povBannerText.textContent = '⚠️ Sensor orientasi tidak aktif. Sila benarkan sensor atau guna mod Semat Skrin.';
          }
          if (DOM.povNotaBannerText) {
            DOM.povNotaBannerText.textContent = '⚠️ Sensor orientasi tidak aktif. Sila benarkan sensor atau guna mod Semat Skrin.';
          }
          if (DOM.povKuizBannerText) {
            DOM.povKuizBannerText.textContent = '⚠️ Sensor orientasi tidak aktif. Sila benarkan sensor atau guna mod Semat Skrin.';
          }
          if (DOM.povBannerActions) DOM.povBannerActions.classList.remove('hidden');
          if (DOM.povNotaBannerActions) DOM.povNotaBannerActions.classList.remove('hidden');
          if (DOM.povKuizBannerActions) DOM.povKuizBannerActions.classList.remove('hidden');
          showToast('⚠️ Sensor giroskop tidak membalas. Sila pastikan sensor dibenarkan di Tetapan pelayar.', 4000);
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
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.setPanelLoaded('video', true);
      SpatialPanelManager.setPlaybackState('video', 'playing');
    }

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
            src="${embedUrl}?autoplay=1&enablejsapi=1&rel=0&playsinline=1" 
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
    console.log('[KotakAR] 🚀 Memulakan Mod Kunci Pandangan...');

    // 1. Terminate any ongoing drag gesture
    ARState.isDragging = false;
    if (DOM.floatingCard) {
      DOM.floatingCard.classList.remove('is-dragging');
    }

    // 2. Safely prompt for iOS sensor permission without ever falling back to SCREEN_PINNED on denial
    if (!ARState.pov.permissionGranted) {
      try {
        await requestSensorPermission();
      } catch (err) {
        console.warn('[KotakAR-POV] Ralat semasa meminta kebenaran sensor:', err);
      }
    }

    ARState.pov.active = true;
    initThreeHelpers();
    initPOVVirtualCamera();
    maybeShowPOVInteractiveGuide();

    // 3. Prepare active content based on activeModule (Kuiz, Nota, SelBot, or Video)
    if (ARState.activeModule === 'selbot') {
      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
      if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
      if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
      if (DOM.povSelbotView) DOM.povSelbotView.classList.remove('hidden');

      if (typeof SelBotARController !== 'undefined') {
        SelBotARController.init();
      }
      if (DOM.povSelbotValStatus) {
        DOM.povSelbotValStatus.textContent = ARState.pov.anchored
          ? `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`
          : 'Menghalakan';
        DOM.povSelbotValStatus.style.color = ARState.pov.anchored ? '#10b981' : '#38bdf8';
      }
      if (DOM.povSelbotStatusBanner) {
        if (DOM.povSelbotBannerIcon) DOM.povSelbotBannerIcon.textContent = ARState.pov.anchored ? 'check_circle' : 'sensors';
        if (DOM.povSelbotBannerText) {
          DOM.povSelbotBannerText.textContent = ARState.pov.anchored
            ? 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.'
            : 'Halakan peranti ke arah sasaran, kemudian tekan "Letak di Arah Ini".';
        }
      }
    } else if (ARState.activeModule === 'kuiz') {
      // Hide Video views completely
      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
      if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      // Hide Nota views completely
      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      // Hide MCQ runner views completely
      if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
      if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');

      // Render & Show 5 Original Games Catalog in POV mode
      renderPOV5GamesCatalog();
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');

      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota');
        DOM.povCard.classList.add('module-kuiz');
      }
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Permainan';

      // Set initial telemetry HUD values
      if (DOM.povKuizValStatus) {
        DOM.povKuizValStatus.textContent = ARState.pov.anchored 
          ? `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)` 
          : 'Menghalakan';
        DOM.povKuizValStatus.style.color = ARState.pov.anchored ? '#10b981' : '#38bdf8';
      }
      if (DOM.povKuizStatusBanner) {
        if (DOM.povKuizBannerIcon) DOM.povKuizBannerIcon.textContent = ARState.pov.anchored ? 'check_circle' : 'sensors';
        if (DOM.povKuizBannerText) {
          DOM.povKuizBannerText.textContent = ARState.pov.anchored
            ? 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.'
            : 'Halakan peranti ke arah sasaran, kemudian tekan "Letak di Arah Ini".';
        }
      }

    } else if (ARState.activeModule === 'nota') {
      if (!ARState.activeNote) {
        ARState.activeNote = (ARState.notes && ARState.notes.length > 0) ? ARState.notes[0] : null;
        if (ARState.activeNote) {
          selectNote(ARState.activeNote);
        }
      } else {
        // Preserve active note page and zoom without resetting
        syncPOVNoteContent();
      }
      renderPOVNoteCardsList();

      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
      if (DOM.povVideoSelectionView) DOM.povVideoSelectionView.classList.add('hidden');
      if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
      if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');

      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');

      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-kuiz');
        DOM.povCard.classList.add('module-nota');
      }
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Nota';

    } else {
      if (!ARState.activeVideo) {
        ARState.activeVideo = (ARState.videos && ARState.videos.length > 0) ? ARState.videos[0] : null;
      }
      if (ARState.activeVideo) {
        syncPOVVideoPlayer(ARState.activeVideo);
      }
      renderPOVVideoCardsList();

      if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      if (DOM.povNotaSelectionView) DOM.povNotaSelectionView.classList.add('hidden');
      if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
      if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
      if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');

      if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');

      if (DOM.povCard) {
        DOM.povCard.classList.remove('module-nota', 'module-kuiz');
      }
      if (DOM.povBtnChangeContentText) DOM.povBtnChangeContentText.textContent = 'Tukar Video';
    }

    // 4. Set mode firmly to POV_SETUP (Centered view, Letak di Arah Ini revealed)
    setSystemMode(SYSTEM_MODES.POV_SETUP);

    setupPOVSensorListeners();
    startPOVRenderLoop();

    showToast('🧭 Halakan iPad ke arah pilihan dan tekan "Letak di Arah Ini".');
  }

  function exitPOVMode(switchToPinned = false) {
    if (switchToPinned) {
      setSystemMode(SYSTEM_MODES.SCREEN_PINNED);
      const modLabel = (ARState.activeModule === 'nota') ? 'Nota' : (ARState.activeModule === 'selbot' ? 'SelBot AI' : 'Video');
      showToast(`📌 ${modLabel} disematkan semula ke skrin.`);
    } else {
      setSystemMode(SYSTEM_MODES.MARKER);
      showToast('Mod Kunci Pandangan ditutup.');
    }
  }

  function bringPOVPanelToCenter() {
    setSystemMode(SYSTEM_MODES.POV_SETUP);
    showToast('🎯 Panel dikembalikan ke tengah skrin!');
  }

  function anchorPOVAtCurrentHeading() {
    const specificPanelId = (arguments.length > 0 && typeof arguments[0] === 'string') ? arguments[0] : null;
    if (ARState.systemMode !== SYSTEM_MODES.POV_SETUP && ARState.systemMode !== SYSTEM_MODES.POV_LOCKED) {
      return;
    }

    // Safety guard: If orientation sensor has NOT delivered physical readings and is not simulated
    if (!ARState.pov.hasSensor && !ARState.pov.isSimulated) {
      console.warn('[KotakAR-POV] ⚠️ Kunci POV disekat kerana tiada data sensor fizikal.');
      if (DOM.povValStatus) {
        DOM.povValStatus.textContent = 'Sensor Tidak Aktif';
        DOM.povValStatus.style.color = '#ef4444';
      }
      if (DOM.povNotaValStatus) {
        DOM.povNotaValStatus.textContent = 'Sensor Tidak Aktif';
        DOM.povNotaValStatus.style.color = '#ef4444';
      }
      if (DOM.povKuizValStatus) {
        DOM.povKuizValStatus.textContent = 'Sensor Tidak Aktif';
        DOM.povKuizValStatus.style.color = '#ef4444';
      }
      if (DOM.povSelbotValStatus) {
        DOM.povSelbotValStatus.textContent = 'Sensor Tidak Aktif';
        DOM.povSelbotValStatus.style.color = '#ef4444';
      }
      if (DOM.povBannerText) {
        DOM.povBannerText.textContent = '⚠️ Sensor tidak aktif. Sila benarkan sensor atau gunakan Semat Skrin.';
      }
      if (DOM.povNotaBannerText) {
        DOM.povNotaBannerText.textContent = '⚠️ Sensor tidak aktif. Sila benarkan sensor atau gunakan Semat Skrin.';
      }
      if (DOM.povKuizBannerText) {
        DOM.povKuizBannerText.textContent = '⚠️ Sensor tidak aktif. Sila benarkan sensor atau gunakan Semat Skrin.';
      }
      if (DOM.povSelbotBannerText) {
        DOM.povSelbotBannerText.textContent = '⚠️ Sensor tidak aktif. Sila benarkan sensor atau gunakan Semat Skrin.';
      }
      if (DOM.povBannerActions) DOM.povBannerActions.classList.remove('hidden');
      if (DOM.povNotaBannerActions) DOM.povNotaBannerActions.classList.remove('hidden');
      if (DOM.povKuizBannerActions) DOM.povKuizBannerActions.classList.remove('hidden');
      if (DOM.povSelbotBannerActions) DOM.povSelbotBannerActions.classList.remove('hidden');
      showToast('⚠️ Sensor orientasi belum aktif. Tekan "Cuba Semula" atau kembali ke Semat Skrin.', 4000);
      return;
    }

    const panelId = specificPanelId || (ARState.activeModule === 'nota' ? 'nota' : (ARState.activeModule === 'kuiz' ? 'kuiz' : (ARState.activeModule === 'selbot' ? 'selbot' : 'video')));
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.togglePanelLock(panelId);
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
      if (DOM.povNotaValStatus) {
        DOM.povNotaValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
        DOM.povNotaValStatus.style.color = '#10b981';
      }
      if (DOM.povKuizValStatus) {
        DOM.povKuizValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
        DOM.povKuizValStatus.style.color = '#10b981';
      }
      if (DOM.povSelbotValStatus) {
        DOM.povSelbotValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
        DOM.povSelbotValStatus.style.color = '#10b981';
      }
      if (DOM.povStatusBanner) {
        if (DOM.povBannerIcon) DOM.povBannerIcon.textContent = 'check_circle';
        if (DOM.povBannerText) DOM.povBannerText.textContent = 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.';
      }
      if (DOM.povNotaStatusBanner) {
        if (DOM.povNotaBannerIcon) DOM.povNotaBannerIcon.textContent = 'check_circle';
        if (DOM.povNotaBannerText) DOM.povNotaBannerText.textContent = 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.';
      }
      if (DOM.povKuizStatusBanner) {
        if (DOM.povKuizBannerIcon) DOM.povKuizBannerIcon.textContent = 'check_circle';
        if (DOM.povKuizBannerText) DOM.povKuizBannerText.textContent = 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.';
      }
      if (DOM.povSelbotStatusBanner) {
        if (DOM.povSelbotBannerIcon) DOM.povSelbotBannerIcon.textContent = 'check_circle';
        if (DOM.povSelbotBannerText) DOM.povSelbotBannerText.textContent = 'Orientasi dikunci! Pusingkan peranti ke kiri/kanan/atas/bawah untuk menguji Pandangan 360°.';
      }

      showToast('🎯 Kunci Pandangan berjaya dikunci pada arah pilihan. POV berjaya dikunci pada arah pilihan.');
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

    // Fasa 4F.1: Also recalibrate active panel in SpatialPanelManager
    if (typeof SpatialPanelManager !== 'undefined') {
      const activeMod = ARState.activeModule || 'video';
      const p = SpatialPanelManager.getPanel(activeMod);
      if (p && p.placementMode === 'POV_LOCKED') {
        p.referenceQuaternion = ARState.pov.anchorQuaternion.clone();
        p.anchorWorldVector = ARState.pov.anchorWorldVector.clone();
        p.anchorYaw = ARState.pov.anchorYaw;
        p.anchorPitch = ARState.pov.anchorPitch;
      }
    }

    if (DOM.povValStatus) {
      DOM.povValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
    }
    if (DOM.povNotaValStatus) {
      DOM.povNotaValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
    }
    if (DOM.povKuizValStatus) {
      DOM.povKuizValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
    }
    if (DOM.povSelbotValStatus) {
      DOM.povSelbotValStatus.textContent = `Terkunci (${Math.round(ARState.pov.anchorYaw)}°)`;
    }
    showToast('🧭 Orientasi rujukan dikalibrasi semula ke arah semasa!');
  }

  function setPOVPanelSize(size, targetPanel = null) {
    if (!['small', 'medium', 'large'].includes(size)) return;
    ARState.pov.size = size;

    if (!targetPanel || targetPanel === 'video') {
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
      if (typeof SpatialPanelManager !== 'undefined') SpatialPanelManager.setPanelSize('video', size);
    }

    if (!targetPanel || targetPanel === 'nota') {
      if (DOM.povNotaCard) {
        DOM.povNotaCard.classList.remove('size-small', 'size-medium', 'size-large');
        DOM.povNotaCard.classList.add(`size-${size}`);
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

    if (!targetPanel || targetPanel === 'kuiz') {
      if (DOM.povKuizCard) {
        DOM.povKuizCard.classList.remove('size-small', 'size-medium', 'size-large');
        DOM.povKuizCard.classList.add(`size-${size}`);
      }
      [DOM.povKuizSizeS, DOM.povKuizSizeM, DOM.povKuizSizeL].forEach(btn => {
        if (!btn) return;
        if (btn.getAttribute('data-size') === size) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
      if (typeof SpatialPanelManager !== 'undefined') SpatialPanelManager.setPanelSize('kuiz', size);
    }

    if (!targetPanel || targetPanel === 'selbot') {
      if (DOM.povSelbotCard) {
        DOM.povSelbotCard.classList.remove('size-small', 'size-medium', 'size-large');
        DOM.povSelbotCard.classList.add(`size-${size}`);
      }
      [DOM.povSelbotSizeS, DOM.povSelbotSizeM, DOM.povSelbotSizeL].forEach(btn => {
        if (!btn) return;
        if (btn.getAttribute('data-size') === size) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
      if (typeof SpatialPanelManager !== 'undefined') SpatialPanelManager.setPanelSize('selbot', size);
    }

    const labels = { small: 'Kecil (S)', medium: 'Sederhana (M)', large: 'Besar (L)' };
    showToast(`📐 Saiz POV: ${labels[size]}`);
  }

  function renderSinglePOVFrame() {
    if (!ARState.pov.active) return;

    initThreeHelpers();
    updateSmoothedQuaternion();
    updatePOVHeadingFromQuaternion();

      const curYaw = Number.isFinite(ARState.pov.currentYaw) ? ARState.pov.currentYaw : 0;
      const curPitch = Number.isFinite(ARState.pov.currentPitch) ? ARState.pov.currentPitch : 0;

      // Update telemetry numbers (Video, Nota, Kuiz, and SelBot views)
      if (DOM.povValYaw) DOM.povValYaw.textContent = `${curYaw.toFixed(1)}°`;
      if (DOM.povValPitch) DOM.povValPitch.textContent = `${curPitch.toFixed(1)}°`;
      if (DOM.povNotaValYaw) DOM.povNotaValYaw.textContent = `${curYaw.toFixed(1)}°`;
      if (DOM.povNotaValPitch) DOM.povNotaValPitch.textContent = `${curPitch.toFixed(1)}°`;
      if (DOM.povKuizValYaw) DOM.povKuizValYaw.textContent = `${curYaw.toFixed(1)}°`;
      if (DOM.povKuizValPitch) DOM.povKuizValPitch.textContent = `${curPitch.toFixed(1)}°`;
      if (DOM.povSelbotValYaw) DOM.povSelbotValYaw.textContent = `${curYaw.toFixed(1)}°`;
      if (DOM.povSelbotValPitch) DOM.povSelbotValPitch.textContent = `${curPitch.toFixed(1)}°`;

      // Rotate compass needle if present
      if (DOM.povNeedle) {
        DOM.povNeedle.style.transform = `rotate(${360 - curYaw}deg)`;
      }

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Camera horizontal FOV ~65 degrees
      const fovHRad = (65 * Math.PI) / 180;
      const tanHalfFovH = Math.tan(fovHRad / 2);
      const aspect = screenW / screenH;
      const tanHalfFovV = tanHalfFovH / aspect;

      const panelsToRender = (typeof SpatialPanelManager !== 'undefined')
        ? SpatialPanelManager.getAllPanels()
        : [{ id: 'video', isVisible: true, placementMode: ARState.systemMode, element: DOM.povAnchor, anchorWorldVector: ARState.pov.anchorWorldVector }];

      let anyPanelLocked = false;
      let offscreenPanelForPointer = null;

      panelsToRender.forEach((p) => {
        const el = p.element || (typeof document !== 'undefined' ? document.getElementById(p.elementId) : null);
        if (!p.isVisible) {
          if (el) {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
          }
          return;
        }
        if (!el) return;

        // Effective placement mode: if p has specific placementMode use it, otherwise fall back to ARState.systemMode
        const mode = p.placementMode || ARState.systemMode;

        if (mode === 'POV_SETUP') {
          if (!el.classList.contains('is-centered')) {
            el.classList.add('is-centered');
          }
          el.style.left = '50%';
          el.style.top = '50%';
          el.style.transform = 'translate(-50%, -50%)';
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.pointerEvents = 'auto';
        } else if (mode === 'POV_LOCKED') {
          anyPanelLocked = true;
          el.classList.remove('is-centered');

          const anchorVec = p.anchorWorldVector || ARState.pov.anchorWorldVector;
          if (anchorVec && ARState.pov.currentQuaternion) {
            const qCamInv = ARState.pov.currentQuaternion.clone().invert();
            const vCam = anchorVec.clone().applyQuaternion(qCamInv);

            const deltaYaw = Math.atan2(vCam.x, -vCam.z) * RAD2DEG;
            const deltaPitch = Math.atan2(vCam.y, -vCam.z) * RAD2DEG;
            p.deltaYaw = deltaYaw;
            p.deltaPitch = deltaPitch;

            if (p.id === 'video' || ARState.activeModule === p.id) {
              ARState.pov.deltaYaw = deltaYaw;
              ARState.pov.deltaPitch = deltaPitch;
            }

            // Fasa 4E-B.2.4: Strict front plane threshold (-0.05) ensures -vCam.z never approaches zero!
            const isInFront = vCam.z < -0.05;
            let projX, projY, isOffscreen;

            if (!isInFront) {
              isOffscreen = true;
              const dirX = vCam.x >= 0 ? 1 : -1;
              const dirY = vCam.y >= 0 ? 1 : -1;
              // Bounded projection near screen boundary (never explodes to thousands of px)
              projX = (screenW / 2) + dirX * (screenW * 0.7);
              projY = (screenH / 2) - dirY * (screenH * 0.7);
              el.style.opacity = '0';
              el.style.visibility = 'hidden';
              el.style.pointerEvents = 'none';
            } else {
              // Clamp raw NDC values to [-2.5, 2.5] to prevent coordinate explosion near 90 deg
              const rawNdcX = vCam.x / (-vCam.z * tanHalfFovH);
              const rawNdcY = vCam.y / (-vCam.z * tanHalfFovV);
              const ndcX = Math.max(-2.5, Math.min(2.5, rawNdcX));
              const ndcY = Math.max(-2.5, Math.min(2.5, rawNdcY));

              projX = (screenW / 2) + (ndcX * (screenW / 2)) + (p.dragOffset?.x || 0);
              projY = (screenH / 2) - (ndcY * (screenH / 2)) + (p.dragOffset?.y || 0);

              isOffscreen = (projX < -120 || projX > screenW + 120 ||
                             projY < -120 || projY > screenH + 120 ||
                             Math.abs(deltaYaw) > 38 || Math.abs(deltaPitch) > 38);

              if (isOffscreen) {
                el.style.opacity = '0';
                el.style.visibility = 'hidden';
                el.style.pointerEvents = 'none';
              } else {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.pointerEvents = 'auto';
              }
            }

            // Hard clamp safeX and safeY to ensure element never drifts into extreme document space
            const safeX = Math.max(-250, Math.min(screenW + 250, Number.isFinite(projX) ? projX : screenW / 2));
            const safeY = Math.max(-250, Math.min(screenH + 250, Number.isFinite(projY) ? projY : screenH / 2));

            el.style.left = `${safeX}px`;
            el.style.top = `${safeY}px`;
            el.style.transform = 'translate(-50%, -50%)';

            p.isOffscreen = isOffscreen;
            p.projX = safeX;
            p.projY = safeY;

            if (isOffscreen && (!offscreenPanelForPointer || p.isActive || ARState.activeModule === p.id)) {
              offscreenPanelForPointer = { panel: p, vCam, deltaYaw, deltaPitch, isInFront };
            }
          }
        }
      });

      if (!anyPanelLocked) {
        if (DOM.povOffscreenPointer) DOM.povOffscreenPointer.classList.add('hidden');
        if (DOM.diagPanelVis) DOM.diagPanelVis.textContent = 'TENGAH';
      } else {
        if (DOM.diagPanelVis) {
          DOM.diagPanelVis.textContent = offscreenPanelForPointer ? 'LUAR FOV' : 'DALAM FOV';
        }
        if (offscreenPanelForPointer && DOM.povOffscreenPointer) {
          DOM.povOffscreenPointer.classList.remove('hidden');
          const { deltaYaw, deltaPitch, vCam, isInFront } = offscreenPanelForPointer;
          if (Math.abs(deltaPitch) > Math.abs(deltaYaw) && Math.abs(deltaPitch) > 25) {
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
            DOM.povOffscreenPointer.classList.remove('at-top', 'at-bottom');
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
        } else if (DOM.povOffscreenPointer) {
          DOM.povOffscreenPointer.classList.add('hidden');
        }
      }

      // Update diagnostics drawer if open
      if (DOM.diagnosticsDrawer && !DOM.diagnosticsDrawer.classList.contains('hidden')) {
        updateDiagnosticsData();
      }
  }

  function startPOVRenderLoop() {
    if (ARState.pov.rafId) {
      cancelAnimationFrame(ARState.pov.rafId);
    }

    const render = () => {
      renderSinglePOVFrame();
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
    renderSinglePOVFrame();
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
  let diagIntervalId = null;
  function toggleDiagnosticsDrawer() {
    if (!DOM.diagnosticsDrawer) return;
    DOM.diagnosticsDrawer.classList.toggle('hidden');
    if (!DOM.diagnosticsDrawer.classList.contains('hidden')) {
      updateDiagnosticsData(true);
      if (diagIntervalId) clearInterval(diagIntervalId);
      diagIntervalId = setInterval(() => updateDiagnosticsData(true), 400);
    } else {
      if (diagIntervalId) {
        clearInterval(diagIntervalId);
        diagIntervalId = null;
      }
    }
  }

  function updateDiagnosticsData(force = false) {
    if (!force && (!DOM.diagnosticsDrawer || DOM.diagnosticsDrawer.classList.contains('hidden'))) return;

    const ua = navigator.userAgent || '';
    let dev = 'Komputer (Windows/Mac/Linux)';
    if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) dev = 'iPad (iPadOS)';
    else if (/iPhone/i.test(ua)) dev = 'iPhone (iOS)';
    else if (/Android/i.test(ua)) dev = 'Peranti Android';

    let browser = 'Chrome/Chromium';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
    else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';

    const screenAngle = ARState.pov.screenAngle || 0;
    const orientType = (screenAngle === 90 || screenAngle === -90 || screenAngle === 270) ? 'Landskap' : 'Potret';

    if (DOM.diagDevice) DOM.diagDevice.textContent = dev;
    if (DOM.diagBrowser) DOM.diagBrowser.textContent = browser;
    if (DOM.diagScreenOrient) DOM.diagScreenOrient.textContent = `${screenAngle}° (${orientType})`;
    if (DOM.diagPermission) DOM.diagPermission.textContent = ARState.pov.permissionGranted ? 'DIBENARKAN' : (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission ? 'PERLU KEBENARAN' : 'LALAI');
    if (DOM.diagSensorActive) DOM.diagSensorActive.textContent = ARState.pov.hasSensor ? (ARState.pov.isSimulated ? 'SIMULASI' : 'AKTIF') : 'TIDAK AKTIF';
    if (DOM.diagEventCount) DOM.diagEventCount.textContent = `${ARState.pov.eventCount || 0} acara`;

    // Extended diagnostics (Fasa 4B.4 Shared Controller)
    if (DOM.diagModule) DOM.diagModule.textContent = (ARState.activeModule || 'video').toUpperCase();
    if (DOM.diagLastUpdate) DOM.diagLastUpdate.textContent = new Date().toLocaleTimeString();
    if (DOM.diagPanelPos) {
      const px = Math.round(ARState.currentScreenX || (window.innerWidth / 2));
      const py = Math.round(ARState.currentScreenY || (window.innerHeight / 2));
      DOM.diagPanelPos.textContent = `${px}px, ${py}px`;
    }
    if (DOM.diagTransform) {
      const activeEl = (ARState.systemMode === SYSTEM_MODES.POV_SETUP || ARState.systemMode === SYSTEM_MODES.POV_LOCKED)
        ? DOM.povAnchor
        : DOM.floatingAnchor;
      DOM.diagTransform.textContent = activeEl ? (activeEl.style.transform || 'translate(-50%, -50%)') : 'none';
    }

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
      if (typeof CellQuestARController !== 'undefined' && CellQuestARController.spatialMode === 'POV_LOCKED' && CellQuestARController.povAnchorHeading) {
        const aY = Number.isFinite(CellQuestARController.povAnchorHeading.yaw) ? CellQuestARController.povAnchorHeading.yaw.toFixed(1) : '0.0';
        const aP = Number.isFinite(CellQuestARController.povAnchorHeading.pitch) ? CellQuestARController.povAnchorHeading.pitch.toFixed(1) : '0.0';
        DOM.diagAnchor.textContent = `${aY}°, ${aP}° (CellQuest)`;
      } else if (ARState.pov.isAnchored) {
        const aY = Number.isFinite(ARState.pov.anchorYaw) ? ARState.pov.anchorYaw.toFixed(1) : '0.0';
        const aP = Number.isFinite(ARState.pov.anchorPitch) ? ARState.pov.anchorPitch.toFixed(1) : '0.0';
        DOM.diagAnchor.textContent = `${aY}°, ${aP}°`;
      } else {
        DOM.diagAnchor.textContent = 'Belum ditetapkan';
      }
    }

    // Delta angles
    let dY = '0.0';
    let dP = '0.0';
    if (typeof CellQuestARController !== 'undefined' && CellQuestARController.spatialMode === 'POV_LOCKED') {
      dY = Number.isFinite(CellQuestARController.lastDeltaYaw) ? CellQuestARController.lastDeltaYaw.toFixed(1) : '0.0';
      dP = Number.isFinite(CellQuestARController.lastDeltaPitch) ? CellQuestARController.lastDeltaPitch.toFixed(1) : '0.0';
    } else {
      dY = Number.isFinite(ARState.pov.deltaYaw) ? ARState.pov.deltaYaw.toFixed(1) : '0.0';
      dP = Number.isFinite(ARState.pov.deltaPitch) ? ARState.pov.deltaPitch.toFixed(1) : '0.0';
    }
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

    if (typeof SpatialPanelManager !== 'undefined') {
      const pVid = SpatialPanelManager.getPanel('video');
      const pNot = SpatialPanelManager.getPanel('nota');
      if (DOM.diagVideoStatus) {
        if (!pVid || !pVid.isVisible) {
          DOM.diagVideoStatus.textContent = 'TIDAK AKTIF';
        } else {
          DOM.diagVideoStatus.textContent = `${pVid.placementMode} (${Math.round(pVid.anchorYaw || 0)}°)`;
        }
      }
      if (DOM.diagNotaStatus) {
        if (!pNot || !pNot.isVisible) {
          DOM.diagNotaStatus.textContent = 'TIDAK AKTIF';
        } else {
          DOM.diagNotaStatus.textContent = `${pNot.placementMode} (${Math.round(pNot.anchorYaw || 0)}°)`;
        }
      }
    }

    // Fasa 4E-D.1.1: Live Camera & MindAR WebAR Telemetry
    const videoEl = DOM.container ? DOM.container.querySelector('video') : null;
    if (DOM.diagCamStatus) {
      if (!ARState.cameraActive) {
        DOM.diagCamStatus.textContent = 'DITUTUP';
      } else if (videoEl && !videoEl.paused && videoEl.readyState >= 2) {
        DOM.diagCamStatus.textContent = 'BERFUNGSI (AKTIF)';
      } else if (videoEl && videoEl.paused) {
        DOM.diagCamStatus.textContent = 'TERHENTI (JEDA)';
      } else {
        DOM.diagCamStatus.textContent = 'MEMUATKAN...';
      }
    }
    if (DOM.diagVideoDim) {
      if (videoEl && videoEl.videoWidth > 0) {
        DOM.diagVideoDim.textContent = `${videoEl.videoWidth} x ${videoEl.videoHeight}`;
      } else {
        DOM.diagVideoDim.textContent = '0 x 0';
      }
    }
    if (DOM.diagVideoReady) {
      if (videoEl) {
        const readyStates = ['0 (TIADA DATA)', '1 (METADATA SEDIA)', '2 (DATA SEMASA)', '3 (DATA SETERUSNYA)', '4 (DATA MENCUKUPI)'];
        DOM.diagVideoReady.textContent = readyStates[videoEl.readyState] || `${videoEl.readyState}`;
      } else {
        DOM.diagVideoReady.textContent = 'Tiada Elemen Video';
      }
    }
    if (DOM.diagMindarStatus) {
      if (!ARState.mindarThree) {
        DOM.diagMindarStatus.textContent = 'BELUM DIMULAKAN';
      } else if (ARState.isTracking) {
        DOM.diagMindarStatus.textContent = 'PENGESANAN AKTIF';
      } else {
        DOM.diagMindarStatus.textContent = 'MENUNGGU SASARAN';
      }
    }
    if (DOM.diagMarkerMindStatus) {
      DOM.diagMarkerMindStatus.textContent = '6 Sasaran Aktif';
    }
    if (DOM.diagWebglStatus) {
      const gl = ARState.renderer ? ARState.renderer.getContext() : null;
      if (gl) {
        const isLost = typeof gl.isContextLost === 'function' ? gl.isContextLost() : false;
        DOM.diagWebglStatus.textContent = isLost ? 'Konteks Terputus' : 'Normal (WebGL)';
      } else {
        DOM.diagWebglStatus.textContent = 'Tiada Konteks WebGL';
      }
    }
    if (DOM.diagLastError) {
      DOM.diagLastError.textContent = ARState.lastErrorMsg || 'Tiada Ralat';
    }

    // Fasa 4D-C.1 & 4D-D.1: Live CellQuest 3D Telemetry
    if (typeof CellQuestARController !== 'undefined') {
      if (DOM.diagCqGlbStatus) DOM.diagCqGlbStatus.textContent = CellQuestARController.glbLoadStatus || 'Belum Mula';
      if (DOM.diagCqActiveModel) DOM.diagCqActiveModel.textContent = CellQuestARController.activeCellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan';
      if (DOM.diagCqTrackingState) DOM.diagCqTrackingState.textContent = CellQuestARController.trackingState || 'MENUNGGU';
      if (DOM.diagCqInteractionMode) DOM.diagCqInteractionMode.textContent = `${CellQuestARController.touchMode} (${CellQuestARController.spatialMode})`;
      if (DOM.diagCqPinEnabled) DOM.diagCqPinEnabled.textContent = CellQuestARController.spatialMode === 'SCREEN_PINNED' ? 'YA (Disemat)' : 'TIDAK';
      if (DOM.diagCqSpatialMode) DOM.diagCqSpatialMode.textContent = CellQuestARController.spatialMode;
      if (DOM.diagCqAnchorHeading) {
        const h = CellQuestARController.povAnchorHeading;
        DOM.diagCqAnchorHeading.textContent = (CellQuestARController.spatialMode === 'POV_LOCKED' && h)
          ? `Yaw:${Math.round(h.yaw)}°, Pitch:${Math.round(h.pitch)}°`
          : '-';
      }
      if (DOM.diagCqVCam) {
        if (CellQuestARController.lastVCam) {
          const v = CellQuestARController.lastVCam;
          DOM.diagCqVCam.textContent = `X:${v.x.toFixed(2)}, Y:${v.y.toFixed(2)}, Z:${v.z.toFixed(2)}`;
        } else {
          DOM.diagCqVCam.textContent = '-';
        }
      }
      if (DOM.diagCqDelta) {
        const dy = Number.isFinite(CellQuestARController.lastDeltaYaw) ? CellQuestARController.lastDeltaYaw.toFixed(1) : '0.0';
        const dp = Number.isFinite(CellQuestARController.lastDeltaPitch) ? CellQuestARController.lastDeltaPitch.toFixed(1) : '0.0';
        DOM.diagCqDelta.textContent = `ΔY:${dy}°, ΔP:${dp}°`;
      }
      if (DOM.diagCqCamNearFar && CellQuestARController.camera) {
        DOM.diagCqCamNearFar.textContent = `${CellQuestARController.camera.near} / ${CellQuestARController.camera.far}`;
      }
      if (DOM.diagCqFrustum) {
        DOM.diagCqFrustum.textContent = CellQuestARController.frustumStatus || 'Dalam Skrin';
      }
      if (DOM.diagCqParent && CellQuestARController.rootGroup) {
        DOM.diagCqParent.textContent = CellQuestARController.rootGroup.parent ? (CellQuestARController.rootGroup.parent.name || CellQuestARController.rootGroup.parent.type) : 'TIADA';
      }
      if (DOM.diagCqMeshCount) DOM.diagCqMeshCount.textContent = `${CellQuestARController.interactiveObjects.length} mesh`;
      if (DOM.diagCqPos && CellQuestARController.rootGroup) {
        const p = CellQuestARController.rootGroup.position;
        DOM.diagCqPos.textContent = `X:${p.x.toFixed(2)}, Y:${p.y.toFixed(2)}, Z:${p.z.toFixed(2)}`;
      }
      if (DOM.diagCqScale && CellQuestARController.rootGroup) {
        const s = CellQuestARController.userScale || 1.0;
        DOM.diagCqScale.textContent = `${s.toFixed(2)}x`;
      }
      if (DOM.diagCqPointerEvent) DOM.diagCqPointerEvent.textContent = CellQuestARController.lastPointerEventStr || '-';
      if (DOM.diagCqBounds) {
        DOM.diagCqBounds.textContent = CellQuestARController.currentBoundsStr || '-';
      }
      if (DOM.diagCqRadius) {
        DOM.diagCqRadius.textContent = CellQuestARController.currentRadiusStr || '-';
      }
      if (DOM.diagCqAnchor) {
        const isTargetTracked = (CellQuestARController.trackingState === 'MARKER_TRACKED') && ARState.anchorCellQuest && ARState.anchorCellQuest.group && ARState.anchorCellQuest.group.visible;
        DOM.diagCqAnchor.textContent = isTargetTracked 
          ? 'Terkunci (Sasaran 3)' 
          : (CellQuestARController.spatialMode === 'SCREEN_PINNED' ? 'Semat pada Skrin' : (CellQuestARController.spatialMode === 'POV_LOCKED' ? 'Kunci Pandangan' : 'Hilang'));
      }
      if (DOM.diagCqWebgl) {
        const gl = ARState.renderer ? ARState.renderer.getContext() : null;
        const isLost = gl && typeof gl.isContextLost === 'function' ? gl.isContextLost() : false;
        DOM.diagCqWebgl.textContent = isLost ? 'Konteks Terputus!' : 'Normal (WebGL)';
      }
    }

    // Fasa 4E-B.2.4 Diagnostics: Logging for Viewport, Camera Video, Canvas, and Root
    const isDebugActive = (typeof window !== 'undefined') && (window.__AR_DEBUG_MODE__ || (new URLSearchParams(window.location.search)).get('debug') === '1' || force);
    if (isDebugActive && (!updateDiagnosticsData._lastLogTime || Date.now() - updateDiagnosticsData._lastLogTime > 2500)) {
      updateDiagnosticsData._lastLogTime = Date.now();
      const arContainer = document.getElementById('ar-container');
      const camVideo = arContainer ? arContainer.querySelector('video') : null;
      const camCanvas = arContainer ? arContainer.querySelector('canvas') : null;
      const hudBar = document.getElementById('ar-multi-panel-bar');
      const glCtx = ARState.renderer ? ARState.renderer.getContext() : null;
      const isContextLost = glCtx && typeof glCtx.isContextLost === 'function' ? glCtx.isContextLost() : false;

      console.log('[Fasa 4E-B.2.4 Diag]', {
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          visualW: window.visualViewport ? window.visualViewport.width : null,
          visualH: window.visualViewport ? window.visualViewport.height : null,
          scrollW: document.documentElement.scrollWidth,
          scrollH: document.documentElement.scrollHeight
        },
        arContainerRect: arContainer ? arContainer.getBoundingClientRect() : null,
        camVideoRect: camVideo ? camVideo.getBoundingClientRect() : null,
        camCanvasRect: camCanvas ? camCanvas.getBoundingClientRect() : null,
        hudRect: hudBar ? hudBar.getBoundingClientRect() : null,
        webglContextStatus: isContextLost ? 'CONTEXT_LOST' : 'ACTIVE_OK',
        activePanelsCount: (typeof SpatialPanelManager !== 'undefined') ? SpatialPanelManager.getActivePanelsCount() : 1
      });
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
      showToast('Mod Semat Skrin ditutup. Mengimbas kad AR semula.');
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
   * Fasa 4E-E.1: Jelajah 3D — Makmal Eksplorasi 3D Integration Lifecycle
   */
  const JELAJAH_3D_ROUTE = '/cellquest/adventure.html?mode=3d&from=kotak';

  function openJelajah3DIntroPanel() {
    const backdrop = DOM.jelajah3dIntroBackdrop || document.getElementById('jelajah3d-marker-intro-backdrop');
    if (backdrop) {
      backdrop.classList.remove('hidden');
    }
    ARState.jelajah3dIntroOpen = true;
    return true;
  }

  function closeJelajah3DIntroPanel(applyCooldown = true) {
    const backdrop = DOM.jelajah3dIntroBackdrop || document.getElementById('jelajah3d-marker-intro-backdrop');
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
    ARState.jelajah3dIntroOpen = false;
    if (applyCooldown) {
      if (!ARState.markerCooldown) ARState.markerCooldown = {};
      ARState.markerCooldown.jelajah3d = Date.now() + 2500;
    }
    return true;
  }

  function startJelajah3DFromIntroPanel() {
    closeJelajah3DIntroPanel(false);
    return launchJelajah3D(false);
  }

  function showJelajah3DConfirmDialog() {
    if (DOM.jelajah3dModalBackdrop) {
      DOM.jelajah3dModalBackdrop.classList.remove('hidden');
    }
  }

  function hideJelajah3DConfirmDialog() {
    if (DOM.jelajah3dModalBackdrop) {
      DOM.jelajah3dModalBackdrop.classList.add('hidden');
    }
  }

  function confirmLaunchJelajah3D() {
    hideJelajah3DConfirmDialog();

    // 1. Save return metadata in sessionStorage
    try {
      sessionStorage.setItem('arselnel_return_to_kotak', 'true');
      sessionStorage.setItem('arselnel_kotak_last_module', ARState.activeModule || 'video');
      sessionStorage.setItem('arselnel_kotak_return_url', '/kotak_arselnel/code.html');
    } catch (e) {
      console.warn('[KotakAR] Gagal menyimpan status sessionStorage:', e);
    }

    // 2. Cleanly stop active video, embedded game, or CellQuest 3D session
    try {
      pauseVideo();
    } catch (e) {}
    if (ARState.activeGame) {
      try {
        closeEmbeddedGame();
      } catch (e) {}
    }
    if (typeof CellQuestARController !== 'undefined' && CellQuestARController.isActive) {
      try {
        destroyCellQuestSession();
      } catch (e) {}
    }

    // 3. Remove orientation/gyroscope listeners & cancel POV animation frame
    try {
      cleanupPOVListeners();
      if (ARState.pov && ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }
    } catch (e) {}

    // 4. Stop MindAR, camera MediaStreamTracks, and Three.js animation loop
    cleanupSession();

    // 5. Navigate to canonical Jelajah 3D or AR Orientasi Dunia game route
    const targetRoute = ARState.pendingExternalRoute || JELAJAH_3D_ROUTE;
    ARState.pendingExternalRoute = null;
    window.location.href = targetRoute;
  }

  function launchJelajah3D(forceImmediate = false) {
    ARState.pendingExternalRoute = JELAJAH_3D_ROUTE;
    const modalTitle = document.getElementById('jelajah3d-modal-title');
    const modalDesc = document.getElementById('jelajah3d-modal-desc');
    if (modalTitle) modalTitle.textContent = 'Buka Misi Jelajah Dunia Sel (3D)?';
    if (modalDesc) modalDesc.textContent = 'Kamera AR dan overlay aktif semasa akan ditutup sebentar supaya Makmal Eksplorasi 3D berjalan lancar. Anda boleh kembali ke Kotak ARSELNEL pada bila-bila masa.';
    if (DOM.btnJelajah3dConfirm) DOM.btnJelajah3dConfirm.textContent = 'Mula Jelajah 3D';

    const hasActiveOverlays = !!(ARState.activePanels && ARState.activePanels.size > 0);
    if (!forceImmediate && hasActiveOverlays && DOM.jelajah3dModalBackdrop) {
      showJelajah3DConfirmDialog();
      return false;
    }
    confirmLaunchJelajah3D();
    return true;
  }

  /**
   * Fasa 4E-E.3: Integrasi AR Orientasi Dunia (Target Index 6 & Butang HUD)
   */
  const ORIENTASI_DUNIA_ROUTE = '/cellquest/adventure.html?mode=camera-ar&from=kotak';

  function openOrientasiDuniaIntroPanel() {
    ARState.orientasiIntroOpen = true;
    const backdrop = DOM.orientasiMarkerIntroBackdrop || document.getElementById('orientasi-dunia-marker-intro-backdrop');
    if (backdrop) {
      backdrop.classList.remove('hidden');
    }
  }

  function closeOrientasiDuniaIntroPanel() {
    ARState.orientasiIntroOpen = false;
    const backdrop = DOM.orientasiMarkerIntroBackdrop || document.getElementById('orientasi-dunia-marker-intro-backdrop');
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
    if (ARState.isScanningForAdd) {
      cancelAddPanelScan();
    }
  }

  function startOrientasiDuniaFromIntroPanel() {
    closeOrientasiDuniaIntroPanel();
    return launchOrientasiDunia(false);
  }

  function confirmLaunchOrientasiDunia() {
    closeOrientasiDuniaIntroPanel();
    ARState.pendingExternalRoute = ORIENTASI_DUNIA_ROUTE;
    confirmLaunchJelajah3D();
  }

  function launchOrientasiDunia(forceImmediate = false) {
    ARState.pendingExternalRoute = ORIENTASI_DUNIA_ROUTE;
    const modalTitle = document.getElementById('jelajah3d-modal-title');
    const modalDesc = document.getElementById('jelajah3d-modal-desc');
    if (modalTitle) modalTitle.textContent = 'Buka AR Orientasi Dunia — Misi Jelajah Dunia Sel?';
    if (modalDesc) modalDesc.textContent = 'Kamera MindAR dan overlay aktif semasa akan ditutup supaya AR Orientasi Dunia (Smart Radar, 8 Stesen Organel & Peti Harta Karun GLB) dapat menggunakan kamera dan sensor orientasi sepenuhnya.';
    if (DOM.btnJelajah3dConfirm) DOM.btnJelajah3dConfirm.textContent = 'Mula AR Orientasi Dunia';

    const hasActiveOverlays = !!(ARState.activePanels && ARState.activePanels.size > 0);
    if (!forceImmediate && hasActiveOverlays && DOM.jelajah3dModalBackdrop) {
      showJelajah3DConfirmDialog();
      return false;
    }
    confirmLaunchOrientasiDunia();
    return true;
  }

  /**
   * Fasa 4D-B: CellQuest 3D Placeholder Choice Handler
   */
  function handleCellChoice(cellType) {
    const typeLabel = cellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan';
    const icon = cellType === 'animal' ? '🐾' : '🌿';
    const msg = `${icon} ${typeLabel}: Model 3D akan diaktifkan dalam Fasa 4D-C.`;
    showToast(msg, 3000);
    if (DOM.cellquestStatusNoticeText) DOM.cellquestStatusNoticeText.textContent = msg;
    if (DOM.povCellquestStatusNoticeText) DOM.povCellquestStatusNoticeText.textContent = msg;
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

    // Fasa 4E-E.1: Jelajah 3D Launch Button & Confirmation Modal Actions
    if (DOM.btnLaunchJelajah3d) {
      DOM.btnLaunchJelajah3d.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        launchJelajah3D(false);
      });
    }
    if (DOM.btnJelajah3dCancel) {
      DOM.btnJelajah3dCancel.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideJelajah3DConfirmDialog();
      });
    }
    if (DOM.btnJelajah3dConfirm) {
      DOM.btnJelajah3dConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        confirmLaunchJelajah3D();
      });
    }

    // Fasa 4E-B.2.1: Multi-Panel Toolbar listeners (+ Tambah Imbasan Baharu)
    if (DOM.btnAddScan) {
      DOM.btnAddScan.addEventListener('click', (e) => {
        e.stopPropagation();
        startAddPanelScan();
      });
    }
    if (DOM.btnCancelScan) {
      DOM.btnCancelScan.addEventListener('click', (e) => {
        e.stopPropagation();
        cancelAddPanelScan();
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
        if (ARState.activeModule === 'selbot') {
          if (typeof SelBotARController !== 'undefined') {
            SelBotARController.toggleHistoryPanel();
          }
          return;
        }
        returnToSelectionList();
      });
    }

    // Close Panel button
    if (DOM.btnClosePanel) {
      DOM.btnClosePanel.addEventListener('click', (e) => {
        e.stopPropagation();
        closePanel();
      });
    }

    // Place Video button (Fasa 3 Screen-Pinned Mode)
    if (DOM.btnPlaceVideo) {
      DOM.btnPlaceVideo.addEventListener('click', (e) => {
        e.stopPropagation();
        placeVideoOnScreen();
      });
    }

    // Fasa 3C & 4B.4: Gyroscope POV Lock Buttons with Synchronous iOS Permission Request
    const handleStartPOVUserGesture = async (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      // On iOS 13+ Safari, requestPermission MUST be called synchronously in direct response to user gesture
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm === 'granted') {
            ARState.pov.permissionGranted = true;
          }
        } catch (err) {
          console.warn('[KotakAR-POV] Izin sensor ditolak atau ralat:', err);
        }
      }
      startPOVMode();
    };

    if (DOM.btnStartPOV) {
      DOM.btnStartPOV.addEventListener('click', handleStartPOVUserGesture);
    }
    if (DOM.btnSwitchToPOV) {
      DOM.btnSwitchToPOV.addEventListener('click', handleStartPOVUserGesture);
    }

    // Fasa 4B.4: Guidance Banner Action Buttons (Retry Sensor & Screen-Pinned Fallback)
    const handleRetrySensorClick = async (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm === 'granted') {
            ARState.pov.permissionGranted = true;
            showToast('✅ Sensor orientasi dibenarkan!');
          }
        } catch (_) {}
      }
      setupPOVSensorListeners();
      showToast('🔄 Mengimbas semula sensor orientasi...');
    };

    if (DOM.povBtnRetrySensor) {
      DOM.povBtnRetrySensor.addEventListener('click', handleRetrySensorClick);
    }
    if (DOM.povNotaBtnRetrySensor) {
      DOM.povNotaBtnRetrySensor.addEventListener('click', handleRetrySensorClick);
    }
    if (DOM.povKuizBtnRetrySensor) {
      DOM.povKuizBtnRetrySensor.addEventListener('click', handleRetrySensorClick);
    }
    if (DOM.povSelbotBtnRetrySensor) {
      DOM.povSelbotBtnRetrySensor.addEventListener('click', handleRetrySensorClick);
    }
    if (DOM.povBtnFallbackPinned) {
      DOM.povBtnFallbackPinned.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        exitPOVMode(true);
      });
    }
    if (DOM.povNotaBtnFallbackPinned) {
      DOM.povNotaBtnFallbackPinned.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        exitPOVMode(true);
      });
    }
    if (DOM.povKuizBtnFallbackPinned) {
      DOM.povKuizBtnFallbackPinned.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        exitPOVMode(true);
      });
    }
    if (DOM.povSelbotBtnFallbackPinned) {
      DOM.povSelbotBtnFallbackPinned.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        exitPOVMode(true);
      });
    }

    // POV Card Controls
    if (DOM.povBtnStartPOV) {
      DOM.povBtnStartPOV.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.enterPanelPOVSetup('video');
        } else {
          startPOVMode();
        }
      });
    }
    if (DOM.povBtnAnchor) {
      DOM.povBtnAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePanelLock('video');
        } else {
          anchorPOVAtCurrentHeading();
        }
      });
    }
    if (DOM.povBtnChangeVideo) {
      DOM.povBtnChangeVideo.addEventListener('click', () => {
        if (ARState.activeModule === 'kuiz') {
          if (!DOM.povKuizSelectionView) return;
          DOM.povKuizSelectionView.classList.remove('hidden');
          if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
          if (DOM.povKuizResultView) DOM.povKuizResultView.classList.add('hidden');
          renderPOV5GamesCatalog();
          if (DOM.povScrollableBody) DOM.povScrollableBody.scrollTop = 0;
          showToast('Pilih permainan sains ARSELNEL.');
        } else if (ARState.activeModule === 'nota') {
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
        } else {
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
        }
      });
    }

    // Fasa 4C: Kuiz Tab Buttons & Runner Listeners (Standard & POV)
    if (DOM.tabKuizObjective) DOM.tabKuizObjective.addEventListener('click', () => switchQuizTab('objective'));
    if (DOM.tabKuizGames) DOM.tabKuizGames.addEventListener('click', () => switchQuizTab('games'));
    if (DOM.povTabKuizObjective) DOM.povTabKuizObjective.addEventListener('click', () => switchQuizTab('objective'));
    if (DOM.povTabKuizGames) DOM.povTabKuizGames.addEventListener('click', () => switchQuizTab('games'));

    if (DOM.btnKuizNext) DOM.btnKuizNext.addEventListener('click', nextQuizQuestion);
    if (DOM.povBtnKuizNext) DOM.povBtnKuizNext.addEventListener('click', nextQuizQuestion);

    if (DOM.btnResultRetry) DOM.btnResultRetry.addEventListener('click', retryActiveQuiz);
    if (DOM.povBtnResultRetry) DOM.povBtnResultRetry.addEventListener('click', retryActiveQuiz);
    if (DOM.btnResultChoose) DOM.btnResultChoose.addEventListener('click', returnToSelectionList);
    if (DOM.povBtnResultChoose) DOM.povBtnResultChoose.addEventListener('click', returnToSelectionList);

    // Fasa 4B: Nota Pagination Controls (Standard & POV)
    if (DOM.btnNotaPrev) DOM.btnNotaPrev.addEventListener('click', prevNotePage);
    if (DOM.btnNotaNext) DOM.btnNotaNext.addEventListener('click', nextNotePage);
    if (DOM.povBtnNotaPrev) DOM.povBtnNotaPrev.addEventListener('click', prevNotePage);
    if (DOM.povBtnNotaNext) DOM.povBtnNotaNext.addEventListener('click', nextNotePage);

    // Fasa 4B: Nota Zoom Controls (Standard & POV)
    if (DOM.btnNotaZoomIn) DOM.btnNotaZoomIn.addEventListener('click', zoomInNote);
    if (DOM.btnNotaZoomOut) DOM.btnNotaZoomOut.addEventListener('click', zoomOutNote);
    if (DOM.btnNotaZoomReset) DOM.btnNotaZoomReset.addEventListener('click', resetZoomNote);

    if (DOM.povBtnNotaZoomIn) DOM.povBtnNotaZoomIn.addEventListener('click', zoomInNote);
    if (DOM.povBtnNotaZoomOut) DOM.povBtnNotaZoomOut.addEventListener('click', zoomOutNote);
    if (DOM.povBtnNotaZoomReset) DOM.povBtnNotaZoomReset.addEventListener('click', resetZoomNote);
    if (DOM.povBtnRecalibrate) {
      DOM.povBtnRecalibrate.addEventListener('click', () => {
        recalibratePOV();
      });
    }
    if (DOM.povBtnBackPinned) {
      DOM.povBtnBackPinned.addEventListener('click', () => {
        if (typeof SpatialPanelManager !== 'undefined') {
          SpatialPanelManager.togglePinMode('video');
        } else {
          exitPOVMode(true);
        }
      });
    }
    if (DOM.povBtnClose) {
      DOM.povBtnClose.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        destroyVideoSession();
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
      DOM.btnLockVideo.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLockPosition();
      });
    }

    // Drag Lock Badge on Drag Handle Bar (tap to toggle lock)
    if (DOM.dragLockBadge) {
      DOM.dragLockBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLockPosition();
      });
    }

    // Battery-saver Camera Toggle button (Fasa 3)
    if (DOM.btnToggleCam) {
      DOM.btnToggleCam.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCameraPower();
      });
    }

    // Size Preset buttons S, M, L (Fasa 3)
    if (DOM.btnSizeS) {
      DOM.btnSizeS.addEventListener('click', (e) => {
        e.stopPropagation();
        setPanelSize('small');
      });
    }
    if (DOM.btnSizeM) {
      DOM.btnSizeM.addEventListener('click', (e) => {
        e.stopPropagation();
        setPanelSize('medium');
      });
    }
    if (DOM.btnSizeL) {
      DOM.btnSizeL.addEventListener('click', (e) => {
        e.stopPropagation();
        setPanelSize('large');
      });
    }

    // Fasa 4C.3: Embedded AR Game View & Focus Mode Listeners
    if (DOM.btnCloseEmbeddedGame) {
      DOM.btnCloseEmbeddedGame.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEmbeddedGame();
      });
    }
    if (DOM.povBtnCloseEmbeddedGame) {
      DOM.povBtnCloseEmbeddedGame.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEmbeddedGame();
      });
    }
    if (DOM.btnToggleGameFocus) {
      DOM.btnToggleGameFocus.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGameFocusMode();
      });
    }
    if (DOM.povBtnToggleGameFocus) {
      DOM.povBtnToggleGameFocus.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGameFocusMode();
      });
    }

    // Fasa 4D-B: CellQuest 3D Placeholder Choice Listeners
    if (DOM.btnChoiceAnimal) {
      DOM.btnChoiceAnimal.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCellChoice('animal');
      });
    }
    if (DOM.btnChoicePlant) {
      DOM.btnChoicePlant.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCellChoice('plant');
      });
    }
    if (DOM.povBtnChoiceAnimal) {
      DOM.povBtnChoiceAnimal.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCellChoice('animal');
      });
    }
    if (DOM.povBtnChoicePlant) {
      DOM.povBtnChoicePlant.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCellChoice('plant');
      });
    }

    // Fasa 4D-C & 4E-C.3A: Direct AR CellQuest 3D Overlay Listeners
    if (DOM.cqHudBtnBack) {
      DOM.cqHudBtnBack.addEventListener('click', (e) => {
        e.stopPropagation();
        destroyCellQuestSession();
      });
    }

    if (DOM.cqBtnAnimal) {
      DOM.cqBtnAnimal.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.loadModel('animal');
        }
      });
    }

    if (DOM.cqBtnPlant) {
      DOM.cqBtnPlant.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.loadModel('plant');
        }
      });
    }

    if (DOM.cqBtnRotate) {
      DOM.cqBtnRotate.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.toggleRotate();
        }
      });
    }

    // Fasa 4D-D: Mod Seret (Drag & Reposition) Listener
    if (DOM.cqBtnDrag) {
      DOM.cqBtnDrag.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.setTouchMode('DRAG');
        }
      });
    }

    // Fasa 4D-D: Semat Model (Screen Pinned) Listener
    if (DOM.cqBtnPin) {
      DOM.cqBtnPin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.togglePin();
        }
      });
    }

    // Fasa 4D-D: Kunci POV 3DoF Listener
    if (DOM.cqBtnPOV) {
      DOM.cqBtnPOV.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.togglePOVMode();
        }
      });
    }

    if (DOM.cqBtnZoomIn) {
      DOM.cqBtnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.adjustZoom(1.18);
        }
      });
    }

    if (DOM.cqBtnZoomOut) {
      DOM.cqBtnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.adjustZoom(0.82);
        }
      });
    }

    if (DOM.cqBtnReset) {
      DOM.cqBtnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.resetView();
        }
      });
    }

    // Fasa 4D-D: Bawa Model ke Tengah Listener
    if (DOM.cqBtnRecenter) {
      DOM.cqBtnRecenter.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.recenterModel();
        }
      });
    }

    if (DOM.cqCardClose) {
      DOM.cqCardClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.clearSelection();
        }
      });
    }

    // Fasa 4D-C.1: Diagnostics Drawer & Debug Cube Listeners in CellQuest HUD
    if (DOM.cqHudBtnDiagnostics) {
      DOM.cqHudBtnDiagnostics.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDiagnosticsDrawer();
      });
    }

    if (DOM.diagBtnToggleDebugCube) {
      DOM.diagBtnToggleDebugCube.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.toggleDebugCube();
        }
      });
    }

    // Fasa 4E-E.2: Jelajah 3D Marker Intro Panel Listeners (Target Index 5)
    if (DOM.btnJelajah3dIntroStart) {
      DOM.btnJelajah3dIntroStart.addEventListener('click', (e) => {
        e.stopPropagation();
        startJelajah3DFromIntroPanel();
      });
    }

    if (DOM.btnJelajah3dIntroClose) {
      DOM.btnJelajah3dIntroClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeJelajah3DIntroPanel(true);
      });
    }

    if (DOM.jelajah3dIntroBackdrop) {
      DOM.jelajah3dIntroBackdrop.addEventListener('click', (e) => {
        if (e.target === DOM.jelajah3dIntroBackdrop) {
          closeJelajah3DIntroPanel(true);
        }
      });
    }

    // Fasa 4E-E.3: AR Orientasi Dunia HUD Button & Marker Intro Panel Listeners (Target Index 6)
    const btnLaunchOrientasi = document.getElementById('btn-launch-orientasi-dunia');
    if (btnLaunchOrientasi) {
      btnLaunchOrientasi.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openOrientasiDuniaIntroPanel();
      });
    }

    const btnOrientasiStart = document.getElementById('btn-orientasi-intro-start');
    if (btnOrientasiStart) {
      btnOrientasiStart.addEventListener('click', (e) => {
        e.stopPropagation();
        startOrientasiDuniaFromIntroPanel();
      });
    }

    const btnOrientasiClose = document.getElementById('btn-orientasi-intro-close');
    if (btnOrientasiClose) {
      btnOrientasiClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeOrientasiDuniaIntroPanel();
      });
    }

    const orientasiBackdrop = document.getElementById('orientasi-dunia-marker-intro-backdrop');
    if (orientasiBackdrop) {
      orientasiBackdrop.addEventListener('click', (e) => {
        if (e.target === orientasiBackdrop) {
          closeOrientasiDuniaIntroPanel();
        }
      });
    }

    // Fasa 4D-D.2: CellQuest POV Setup Banner Listeners
    if (DOM.cqBtnPovAnchor) {
      DOM.cqBtnPovAnchor.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.anchorPOVAtCurrentHeading();
        }
      });
    }

    if (DOM.cqBtnPovCancel) {
      DOM.cqBtnPovCancel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.cancelPOVSetup();
        }
      });
    }

    if (DOM.cqBtnPovRetry) {
      DOM.cqBtnPovRetry.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          await CellQuestARController.ensureSensorPermission();
          setupPOVSensorListeners();
          CellQuestARController.updatePOVBannerSensorStatus();
        }
      });
    }

    if (DOM.cqBtnPovUsePin) {
      DOM.cqBtnPovUsePin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof CellQuestARController !== 'undefined') {
          CellQuestARController.cancelPOVSetup();
          CellQuestARController.togglePin();
        }
      });
    }

    // Initialize unified pointer drag & resize handlers
    initDragHandlers();

    // Auto-clamp when screen rotates or resizes
    window.addEventListener('resize', () => {
      clampPanelIntoViewport();
      updateDiagnosticsData();
    });

    // Fasa 4E-F.1: Onboarding, Panduan Selepas Kesan & Panduan Kunci Pandangan Listeners
    if (DOM.btnOpenUserGuide) {
      DOM.btnOpenUserGuide.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openOnboardingModal(0);
      });
    }
    if (DOM.btnOnboardingNext) {
      DOM.btnOnboardingNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextOnboardingStep();
      });
    }
    if (DOM.btnOnboardingPrev) {
      DOM.btnOnboardingPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevOnboardingStep();
      });
    }
    if (DOM.btnOnboardingSkip) {
      DOM.btnOnboardingSkip.addEventListener('click', (e) => {
        e.stopPropagation();
        skipOnboarding();
      });
    }
    if (DOM.btnOnboardingStart) {
      DOM.btnOnboardingStart.addEventListener('click', (e) => {
        e.stopPropagation();
        finishOnboarding();
      });
    }
    if (DOM.btnDismissPostDetect) {
      DOM.btnDismissPostDetect.addEventListener('click', (e) => {
        e.stopPropagation();
        hidePostDetectionGuide();
      });
    }
    if (DOM.btnPovGuidePrev) {
      DOM.btnPovGuidePrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_povGuideStepIndex > 0) renderPOVGuideStep(_povGuideStepIndex - 1);
      });
    }
    if (DOM.btnPovGuideNext) {
      DOM.btnPovGuideNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (_povGuideStepIndex < POV_GUIDE_STEPS.length - 1) {
          renderPOVGuideStep(_povGuideStepIndex + 1);
        } else {
          dismissPOVInteractiveGuide();
        }
      });
    }
    if (DOM.btnPovGuideSkip) {
      DOM.btnPovGuideSkip.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissPOVInteractiveGuide();
      });
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        clampPanelIntoViewport();
      });
      window.visualViewport.addEventListener('scroll', () => {
        clampPanelIntoViewport();
      });
    }

    // Safe exit on window unload
    window.addEventListener('beforeunload', () => {
      cleanupSession();
    });
  }

  // =========================================================================
  // FASA 4E-F.1: PANDUAN INTERAKTIF & ONBOARDING KOTAK ARSELNEL (BM)
  // =========================================================================
  const ONBOARDING_STORAGE_KEY = 'arselnel_kotak_onboarding_v1';
  const POV_GUIDE_STORAGE_KEY = 'arselnel_kotak_pov_guide_v1';
  const _memoryGuideStorage = {};

  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return Object.prototype.hasOwnProperty.call(_memoryGuideStorage, key) ? _memoryGuideStorage[key] : null;
    }
  }

  function safeSetStorage(key, value) {
    _memoryGuideStorage[key] = value;
    try {
      window.localStorage.setItem(key, value);
    } catch (_) {
      // Fallback memori sudah dikemas kini
    }
  }

  function hasCompletedOnboarding() {
    return safeGetStorage(ONBOARDING_STORAGE_KEY) === 'completed';
  }

  function hasCompletedPOVGuide() {
    return safeGetStorage(POV_GUIDE_STORAGE_KEY) === 'completed';
  }

  const ONBOARDING_STEPS = [
    {
      icon: 'view_in_ar',
      title: 'Selamat Datang ke Kotak ARSELNEL!',
      desc: 'Terokai pembelajaran Sains Tingkatan 1 secara Realiti Terimbuh (AR) menggunakan kad AR khas pada Kotak ARSELNEL anda.',
      tip: 'Pastikan anda berada di tempat yang terang supaya kamera dapat membaca kad AR dengan jelas.'
    },
    {
      icon: 'photo_camera',
      title: 'Benarkan Akses Kamera',
      desc: 'Apabila anda menekan "Mula Mengimbas" di hujung panduan ini, pelayar akan memohon kebenaran kamera untuk mengimbas kad AR.',
      tip: 'Klik "Allow / Benarkan" apabila tetingkap kebenaran kamera muncul pada skrin anda.'
    },
    {
      icon: 'qr_code_scanner',
      title: 'Cara Mengimbas Kad AR',
      desc: 'Halakan kamera pada jarak kira-kira 20–30 cm dari kad AR. Pastikan keseluruhan corak kad kelihatan jelas di dalam bingkai pengimbas.',
      tip: 'Elakkan silau cahaya langsung pada kad supaya kamera dapat mengesan kad dengan lebih pantas.'
    },
    {
      icon: 'dashboard_customize',
      title: '6 Kad Pembelajaran Interaktif',
      desc: 'Anda boleh mengimbas kad Video Pembelajaran, Nota Interaktif, Model 3D Sel Haiwan, Model 3D Sel Tumbuhan, Makmal Eksplorasi 3D atau AR Orientasi Dunia.',
      tip: 'Gunakan butang "Papar Kad AR" di bar atas untuk melihat atau mencetak kesemua 6 kad AR.'
    },
    {
      icon: 'push_pin',
      title: 'Semat Skrin & Kunci Pandangan',
      desc: 'Tekan "Semat pada Skrin" untuk menetapkan panel di skrin tanpa kad, atau "Kunci Pandangan" untuk meletakkan panel di ruang sekeliling 360°.',
      tip: 'Anda boleh menekan "Tutup Kamera" semasa membaca nota atau menonton video untuk menjimatkan bateri.'
    },
    {
      icon: 'rocket_launch',
      title: 'Sedia untuk Meneroka!',
      desc: 'Semua panduan asas telah selesai! Tekan butang "Mula Mengimbas" di bawah untuk mengaktifkan kamera dan mengimbas kad AR pertama anda.',
      tip: 'Panduan ini sentiasa boleh dibuka semula melalui butang "Panduan Pengguna" di penjuru kanan atas.'
    }
  ];

  let _onboardingStepIndex = 0;

  function renderOnboardingStep(index) {
    const total = ONBOARDING_STEPS.length;
    _onboardingStepIndex = Math.max(0, Math.min(index, total - 1));
    const step = ONBOARDING_STEPS[_onboardingStepIndex];
    const isFirst = _onboardingStepIndex === 0;
    const isLast = _onboardingStepIndex === total - 1;

    if (DOM.onboardingProgressText) DOM.onboardingProgressText.textContent = `${_onboardingStepIndex + 1}/${total}`;
    if (DOM.onboardingProgressFill) DOM.onboardingProgressFill.style.width = `${((_onboardingStepIndex + 1) / total) * 100}%`;
    if (DOM.onboardingVisualIcon) DOM.onboardingVisualIcon.textContent = step.icon;
    if (DOM.onboardingTitle) DOM.onboardingTitle.textContent = step.title;
    if (DOM.onboardingDesc) DOM.onboardingDesc.textContent = step.desc;
    if (DOM.onboardingTipText) DOM.onboardingTipText.textContent = step.tip;

    if (DOM.onboardingStepDots) {
      const dots = DOM.onboardingStepDots.querySelectorAll('.onboarding-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === _onboardingStepIndex);
        dot.classList.toggle('is-done', i < _onboardingStepIndex);
      });
    }

    if (DOM.btnOnboardingPrev) DOM.btnOnboardingPrev.classList.toggle('hidden', isFirst);
    if (DOM.btnOnboardingNext) DOM.btnOnboardingNext.classList.toggle('hidden', isLast);
    if (DOM.btnOnboardingStart) DOM.btnOnboardingStart.classList.toggle('hidden', !isLast);
  }

  function openOnboardingModal(stepIndex = 0) {
    hideScannerDelayedTips();
    renderOnboardingStep(stepIndex);
    if (DOM.loadingScreen) {
      DOM.loadingScreen.classList.add('hidden');
    }
    if (DOM.onboardingBackdrop) {
      DOM.onboardingBackdrop.classList.remove('hidden');
    }
  }

  async function completeOnboardingFlow() {
    safeSetStorage(ONBOARDING_STORAGE_KEY, 'completed');
    if (DOM.onboardingBackdrop) {
      DOM.onboardingBackdrop.classList.add('hidden');
    }

    if (!ARState.mindarThree && !isInitializingMindAR) {
      try {
        if (DOM.loadingScreen) {
          DOM.loadingScreen.classList.remove('hidden');
        }
        await initMindAR();
        if (DOM.loadingScreen) {
          DOM.loadingScreen.classList.add('hidden');
        }
      } catch (err) {
        console.error('[Onboarding] Gagal memulakan MindAR selepas onboarding:', err);
        renderErrorScreen(err);
      }
    } else {
      resetScannerTipsTimer();
      showToast('Teruskan mengimbas kad AR Kotak ARSELNEL.', 2200);
    }
  }

  function closeOnboardingModal() {
    return completeOnboardingFlow();
  }

  function nextOnboardingStep() {
    if (_onboardingStepIndex < ONBOARDING_STEPS.length - 1) {
      renderOnboardingStep(_onboardingStepIndex + 1);
    }
  }

  function prevOnboardingStep() {
    if (_onboardingStepIndex > 0) {
      renderOnboardingStep(_onboardingStepIndex - 1);
    }
  }

  function skipOnboarding() {
    return completeOnboardingFlow();
  }

  function finishOnboarding() {
    return completeOnboardingFlow();
  }

  let _scannerTipsTimer = null;

  function showScannerDelayedTips() {
    const onboardingOpen = DOM.onboardingBackdrop && !DOM.onboardingBackdrop.classList.contains('hidden');
    const scannerHidden = !DOM.scannerOverlay || DOM.scannerOverlay.classList.contains('hidden');
    if (onboardingOpen || scannerHidden || ARState.isTracking) return;
    if (DOM.scannerTipsBox) {
      DOM.scannerTipsBox.classList.remove('hidden');
    }
  }

  function hideScannerDelayedTips() {
    clearTimeout(_scannerTipsTimer);
    _scannerTipsTimer = null;
    if (DOM.scannerTipsBox) {
      DOM.scannerTipsBox.classList.add('hidden');
    }
  }

  function resetScannerTipsTimer(delayMs = 8000) {
    hideScannerDelayedTips();
    if (ARState.activePanels && ARState.activePanels.size > 0 && ARState.scanState !== SCAN_STATES.ADD_PANEL) {
      return;
    }
    _scannerTipsTimer = setTimeout(() => {
      showScannerDelayedTips();
    }, delayMs);
  }

  const POST_DETECT_TIPS = {
    video: {
      icon: 'smart_display',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Pilih video sains di bawah untuk mula menonton. Tekan "Semat pada Skrin" agar panel kekal stabil walaupun kad dialihkan.'
    },
    nota: {
      icon: 'auto_stories',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Pilih topik nota dan gunakan butang zum (+) atau halaman untuk membaca dengan lebih selesa.'
    },
    kuiz: {
      icon: 'sports_esports',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Pilih kuiz atau permainan sains Tingkatan 1 daripada senarai untuk mula bermain.'
    },
    cellquest: {
      icon: 'view_in_ar',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Seret model 3D untuk memutar, tekan label organel, atau pilih "Semat Model" supaya kekal di skrin.'
    },
    jelajah3d: {
      icon: 'explore',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Panel pengenalan Makmal Eksplorasi 3D dibuka. Tekan "Mula Jelajah 3D" untuk memulakan penerokaan.'
    },
    orientasi_dunia: {
      icon: 'public',
      title: 'Kad AR Berjaya Dikesan!',
      text: 'Panel AR Orientasi Dunia dibuka. Tekan "Mula AR Orientasi Dunia" untuk meneroka 8 stesen organel 360°.'
    },
    selbot: {
      icon: 'smart_toy',
      title: 'Kad AR SelBot AI Dikesan!',
      text: 'Tanyakan sebarang soalan tentang sel haiwan, sel tumbuhan atau organel. Tekan "Semat pada Skrin" untuk terus berbual tanpa memegang kad.'
    }
  };

  let _postDetectTimer = null;

  function showPostDetectionGuide(moduleKey = 'video') {
    const info = POST_DETECT_TIPS[moduleKey] || POST_DETECT_TIPS.video;
    if (DOM.postDetectIcon) DOM.postDetectIcon.textContent = info.icon;
    if (DOM.postDetectTitle) DOM.postDetectTitle.textContent = info.title;
    if (DOM.postDetectSubtitle) DOM.postDetectSubtitle.textContent = info.text;
    if (DOM.postDetectGuide) {
      DOM.postDetectGuide.classList.remove('hidden');
    }
    clearTimeout(_postDetectTimer);
    _postDetectTimer = setTimeout(() => {
      hidePostDetectionGuide();
    }, 7500);
  }

  function hidePostDetectionGuide() {
    clearTimeout(_postDetectTimer);
    _postDetectTimer = null;
    if (DOM.postDetectGuide) {
      DOM.postDetectGuide.classList.add('hidden');
    }
  }

  const POV_GUIDE_STEPS = [
    {
      title: 'Apa itu Semat Skrin & Kunci Pandangan?',
      desc: '"Semat pada Skrin" mengekalkan panel di skrin. "Kunci Pandangan" meletakkan panel di ruang sekeliling anda menggunakan sensor peranti.'
    },
    {
      title: 'Pegang Peranti Menghadap Arah Selesa',
      desc: 'Pegang iPad atau telefon menghadap arah ruang yang selesa sebelum anda mengunci kedudukan panel.'
    },
    {
      title: 'Ketik "Letak di Arah Ini"',
      desc: 'Ketik butang "Letak di Arah Ini" untuk mengunci kedudukan panel pada arah pilihan anda.'
    },
    {
      title: 'Gerakkan Peranti untuk Melihat Panel',
      desc: 'Cuba pusing ke kiri atau kanan, kemudian kembali ke arah asal — panel akan kekal di tempatnya dalam ruang 360°.'
    },
    {
      title: 'Klik "Tutup Kamera" untuk Jimat Bateri',
      desc: 'Tekan "Tutup Kamera" apabila tidak perlu mengimbas lagi supaya bateri lebih jimat sambil anda terus belajar.'
    }
  ];

  let _povGuideStepIndex = 0;

  function renderPOVGuideStep(index) {
    const total = POV_GUIDE_STEPS.length;
    _povGuideStepIndex = Math.max(0, Math.min(index, total - 1));
    const step = POV_GUIDE_STEPS[_povGuideStepIndex];
    const isFirst = _povGuideStepIndex === 0;
    const isLast = _povGuideStepIndex === total - 1;

    if (DOM.povGuideStepBadge) DOM.povGuideStepBadge.textContent = `Langkah ${_povGuideStepIndex + 1}/${total}`;
    if (DOM.povGuideTitle) DOM.povGuideTitle.textContent = step.title;
    if (DOM.povGuideDesc) DOM.povGuideDesc.textContent = step.desc;

    if (DOM.povGuideDots) {
      const dots = DOM.povGuideDots.querySelectorAll('.pov-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === _povGuideStepIndex);
        dot.classList.toggle('is-done', i < _povGuideStepIndex);
      });
    }

    if (DOM.btnPovGuidePrev) DOM.btnPovGuidePrev.classList.toggle('hidden', isFirst);
    if (DOM.btnPovGuideNext) DOM.btnPovGuideNext.textContent = isLast ? 'Selesai' : 'Seterusnya';
  }

  function showPOVInteractiveGuide(stepIndex = 0) {
    renderPOVGuideStep(stepIndex);
    if (DOM.povInteractiveGuide) {
      DOM.povInteractiveGuide.classList.remove('hidden');
    }
  }

  function dismissPOVInteractiveGuide() {
    safeSetStorage(POV_GUIDE_STORAGE_KEY, 'completed');
    if (DOM.povInteractiveGuide) {
      DOM.povInteractiveGuide.classList.add('hidden');
    }
  }

  function maybeShowPOVInteractiveGuide() {
    if (!hasCompletedPOVGuide()) {
      showPOVInteractiveGuide(0);
    }
  }

  /**
   * Main Module Bootstrap
   */
  async function init() {
    cacheDOM();
    // Fasa 4E-B.1: Initialize SpatialPanelManager for dual independent DOM panels
    if (typeof SpatialPanelManager !== 'undefined') {
      SpatialPanelManager.init();
    }
    initListeners();

    // Fasa 4C.3: Initialize session recovery listeners and update dynamic prompt
    if (ARSessionRecoveryManager) {
      ARSessionRecoveryManager.initLifecycleListeners();
      ARSessionRecoveryManager.updateScannerUI();
    }

    let returnedFromJelajah = false;
    let isReturning = false;
    let lastMod = null;
    try {
      returnedFromJelajah = sessionStorage.getItem('arselnel_returned_from_jelajah3d') === 'true'
        || (new URLSearchParams(window.location.search)).get('returned') === 'jelajah3d';
      isReturning = sessionStorage.getItem('arselnel_return_to_ar') === 'true';
      lastMod = sessionStorage.getItem('arselnel_last_module');
    } catch (_) {}

    const needsFirstOnboarding = !hasCompletedOnboarding() && !returnedFromJelajah && !isReturning;
    if (needsFirstOnboarding) {
      // Hentikan pengaktifan kamera serta-merta dan papar panduan pengguna baharu dahulu
      ARState.cameraActive = false;
      openOnboardingModal(0);
    }

    try {
      await Promise.allSettled([
        loadVideosFromCMS(),
        loadNotesFromCMS(),
        loadQuizzesFromCMS(),
        loadGamesCatalog()
      ]);
      renderVideoList();
      renderNoteSelectionList();
      render5GamesCatalog();
      renderPOV5GamesCatalog();

      if (needsFirstOnboarding) {
        return;
      }

      await initMindAR();

      // Hide loading screen smoothly as soon as MindAR is initialized
      if (DOM.loadingScreen) {
        DOM.loadingScreen.classList.add('hidden');
      }

      // Check if student returned from an interactive ARSELNEL game or Jelajah 3D
      try {
        if (returnedFromJelajah) {
          sessionStorage.removeItem('arselnel_returned_from_jelajah3d');
          showToast('✨ Kembali ke Kotak ARSELNEL — Sedia mengimbas 7 kad AR!');
        }

        if (isReturning && lastMod === 'kuiz') {
          sessionStorage.removeItem('arselnel_return_to_ar');
          switchActiveModule('kuiz');
          placeVideoOnScreen(); // Open floating card in screen pinned mode
          showToast('✨ Kembali ke Kotak ARSELNEL — Kuiz & Permainan');
        }
      } catch (e) {
        console.warn('[KotakAR] Return check error:', e);
      }

      // Hide loading screen smoothly
      if (DOM.loadingScreen) {
        DOM.loadingScreen.classList.add('hidden');
      }
    } catch (err) {
      console.error('[KotakAR] Ralat inisialisasi:', err);
      renderErrorScreen(err);
    }
  }

  /**
   * Unified SharedARPanelController (Fasa 4B.4 Golden Reference)
   * Video & Nota share the exact same controller, 2D drag physics, 3DoF POV lock engine,
   * sensor pipeline, telemetry, and orientation transforms.
   */
  const SharedARPanelController = {
    setContent(module, content) {
      if (module === 'video') {
        switchActiveModule('video');
        const vid = content || ARState.activeVideo || (ARState.videos && ARState.videos.length > 0 ? ARState.videos[0] : null);
        if (vid) {
          selectVideo(vid);
          syncPOVVideoPlayer(vid);
        }
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.remove('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');
      } else if (module === 'nota') {
        switchActiveModule('nota');
        const not = content || ARState.activeNote || (ARState.notes && ARState.notes.length > 0 ? ARState.notes[0] : null);
        if (not) {
          selectNote(not);
          syncPOVNoteContent();
        }
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.remove('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');
      } else if (module === 'kuiz') {
        switchActiveModule('kuiz');
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.remove('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');
      } else if (module === 'cellquest') {
        switchActiveModule('cellquest');
        if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.remove('hidden');
        if (DOM.povKuizSelectionView) DOM.povKuizSelectionView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
      } else if (module === 'selbot') {
        switchActiveModule('selbot');
        if (typeof SelBotARController !== 'undefined') {
          SelBotARController.init();
        }
        if (DOM.povSelbotView) DOM.povSelbotView.classList.remove('hidden');
        if (DOM.povActivePlayerView) DOM.povActivePlayerView.classList.add('hidden');
        if (DOM.povActiveNotaView) DOM.povActiveNotaView.classList.add('hidden');
        if (DOM.povActiveKuizView) DOM.povActiveKuizView.classList.add('hidden');
        if (DOM.povCellquestSelectionView) DOM.povCellquestSelectionView.classList.add('hidden');
      }
    },
    enterScreenPinned() {
      placeVideoOnScreen();
    },
    setDragEnabled(enabled) {
      ARState.isLocked = !enabled;
      if (DOM.btnLockVideo) {
        if (!enabled) {
          DOM.btnLockVideo.classList.add('is-locked');
          if (DOM.lockBtnIcon) DOM.lockBtnIcon.textContent = 'lock_open';
          if (DOM.lockBtnText) DOM.lockBtnText.textContent = 'Alih Semula';
        } else {
          DOM.btnLockVideo.classList.remove('is-locked');
          if (DOM.lockBtnIcon) DOM.lockBtnIcon.textContent = 'lock';
          if (DOM.lockBtnText) DOM.lockBtnText.textContent = 'Kunci Kedudukan';
        }
      }
    },
    enterPOVSetup() {
      return startPOVMode();
    },
    lockPOV() {
      anchorPOVAtCurrentHeading();
    },
    updateOrientation(alpha, beta, gamma) {
      handleDeviceOrientation({ alpha, beta, gamma });
    },
    applySimAngles(yaw, pitch) {
      applySimAngles(yaw, pitch);
    },
    returnToScreenPinned() {
      exitPOVMode(true);
    },
    recenter() {
      bringPOVPanelToCenter();
    },
    dispose() {
      cleanupPOVListeners();
      if (ARState.pov.rafId) {
        cancelAnimationFrame(ARState.pov.rafId);
        ARState.pov.rafId = null;
      }
    }
  };

  // Export to global scope
  global.SharedARPanelController = SharedARPanelController;

  global.KotakARSELNEL = {
    init,
    state: ARState,
    ARState: ARState,
    modes: SYSTEM_MODES,
    SharedARPanelController,
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
    getScreenOrientationAngle,
    handleScreenOrientationChange,
    updateDiagnosticsData,
    // Fasa 4B Exports
    switchActiveModule,
    selectNote,
    zoomInNote,
    zoomOutNote,
    resetZoomNote,
    prevNotePage,
    nextNotePage,
    loadNotesFromCMS,
    renderNoteSelectionList,
    getSafeAreaBounds,
    clampPanelIntoViewport,
    // Fasa 4C Exports
    loadQuizzesFromCMS,
    loadGamesCatalog,
    render5GamesCatalog,
    renderPOV5GamesCatalog,
    renderQuizSelectionList,
    renderPOVQuizCardsList,
    selectQuiz,
    submitQuizAnswer,
    nextQuizQuestion,
    finishActiveQuiz,
    retryActiveQuiz,
    switchQuizTab,
    launchInteractiveGame,
    // Fasa 4C.3 Exports
    ARSessionRecoveryManager,
    createMinimalGameRowElement,
    startEmbeddedGame,
    closeEmbeddedGame,
    toggleGameFocusMode,
    // Fasa 4C.4 Exports
    GameSessionManager,
    toggleMaximizePanel,
    // Fasa 4D-B Exports
    handleCellChoice,
    // Fasa 4D-C Exports
    CellQuestARController,
    CELLQUEST_ORGANELLES,
    // Fasa 4E-B.1 Exports
    SpatialPanelManager,
    // Fasa 4E-B.2 Lifecycle Exports
    pauseVideo,
    resumeVideo,
    hideVideoPanel,
    showVideoPanel,
    destroyVideoSession,
    hideNotaPanel,
    showNotaPanel,
    destroyNotaSession,
    // Fasa 4E-C.2 Kuiz Lifecycle Exports
    hideKuizPanel,
    showKuizPanel,
    destroyKuizSession,
    // Fasa 4F SelBot AI Lifecycle Exports
    SelBotARController,
    hideSelbotPanel,
    showSelbotPanel,
    destroySelbotSession,
    // Fasa 4E-C.3A CellQuest Lifecycle Exports
    destroyCellQuestSession,
    // Fasa 4E-B.2.1 Multi-Panel Exports
    startAddPanelScan,
    cancelAddPanelScan,
    handleTargetFound,
    handleTargetLost,
    addPanelToSpatialWorkspace,
    arrangeMultiPanelSpatialLayout,
    updateMultiPanelUI,
    focusPanel,
    handlePanelClosed,
    setScanState,
    SCAN_STATES,
    // Fasa 4E-E.1 & E.2 Jelajah 3D Integration Exports
    launchJelajah3D,
    confirmLaunchJelajah3D,
    showJelajah3DConfirmDialog,
    hideJelajah3DConfirmDialog,
    openJelajah3DIntroPanel,
    closeJelajah3DIntroPanel,
    startJelajah3DFromIntroPanel,
    // Fasa 4E-E.3 AR Orientasi Dunia Integration Exports
    launchOrientasiDunia,
    confirmLaunchOrientasiDunia,
    openOrientasiDuniaIntroPanel,
    closeOrientasiDuniaIntroPanel,
    startOrientasiDuniaFromIntroPanel,
    ORIENTASI_DUNIA_ROUTE,
    cleanupSession,
    JELAJAH_3D_ROUTE,
    // Fasa 4E-F.1 Onboarding & Guidance Exports
    ONBOARDING_STORAGE_KEY,
    POV_GUIDE_STORAGE_KEY,
    hasCompletedOnboarding,
    hasCompletedPOVGuide,
    openOnboardingModal,
    closeOnboardingModal,
    nextOnboardingStep,
    prevOnboardingStep,
    skipOnboarding,
    finishOnboarding,
    showScannerDelayedTips,
    hideScannerDelayedTips,
    resetScannerTipsTimer,
    showPostDetectionGuide,
    hidePostDetectionGuide,
    showPOVInteractiveGuide,
    dismissPOVInteractiveGuide,
    // Fasa 4E-F.1.2 Three Spatial Modes & Tracking Exports
    updateSpatialPanelsPosition,
    SpatialPanelManager,
    SYSTEM_MODES,
    getPanelElement: (id) => (id === 'pov-ar-anchor' || id === 'pov-panel-video' || id === 'video')
      ? DOM.povPanelVideo
      : (id === 'pov-panel-nota' || id === 'nota')
        ? DOM.povPanelNota
        : (id === 'pov-panel-kuiz' || id === 'kuiz')
          ? DOM.povPanelKuiz
          : (id === 'pov-panel-selbot' || id === 'selbot')
            ? DOM.povPanelSelbot
            : document.getElementById(id)
  };

  // Expose global helpers for direct testing & interactive triggers
  global.ARSessionRecoveryManager = ARSessionRecoveryManager;
  global.startEmbeddedGame = startEmbeddedGame;
  global.closeEmbeddedGame = closeEmbeddedGame;
  global.toggleGameFocusMode = toggleGameFocusMode;
  global.GameSessionManager = GameSessionManager;
  global.toggleMaximizePanel = toggleMaximizePanel;
  global.handleCellChoice = handleCellChoice;
  global.CellQuestARController = CellQuestARController;
  global.CELLQUEST_ORGANELLES = CELLQUEST_ORGANELLES;
  global.SpatialPanelManager = SpatialPanelManager;
  global.pauseVideo = pauseVideo;
  global.resumeVideo = resumeVideo;
  global.hideVideoPanel = hideVideoPanel;
  global.showVideoPanel = showVideoPanel;
  global.destroyVideoSession = destroyVideoSession;
  global.hideNotaPanel = hideNotaPanel;
  global.showNotaPanel = showNotaPanel;
  global.destroyNotaSession = destroyNotaSession;
  global.hideKuizPanel = hideKuizPanel;
  global.showKuizPanel = showKuizPanel;
  global.destroyKuizSession = destroyKuizSession;
  global.SelBotARController = SelBotARController;
  global.hideSelbotPanel = hideSelbotPanel;
  global.showSelbotPanel = showSelbotPanel;
  global.destroySelbotSession = destroySelbotSession;
  global.destroyCellQuestSession = destroyCellQuestSession;
  global.selectQuiz = selectQuiz;
  global.submitQuizAnswer = submitQuizAnswer;
  global.nextQuizQuestion = nextQuizQuestion;
  global.finishActiveQuiz = finishActiveQuiz;
  global.retryActiveQuiz = retryActiveQuiz;
  global.selectVideo = selectVideo;
  global.selectNote = selectNote;
  global.applySimAngles = applySimAngles;
  global.recalibratePOV = recalibratePOV;
  global.renderSinglePOVFrame = renderSinglePOVFrame;
  global.startPOVMode = startPOVMode;
  global.exitPOVMode = exitPOVMode;
  global.anchorPOVAtCurrentHeading = anchorPOVAtCurrentHeading;
  global.bringPOVPanelToCenter = bringPOVPanelToCenter;
  // Fasa 4E-B.2.1 Multi-Panel Global Helpers
  global.startAddPanelScan = startAddPanelScan;
  global.cancelAddPanelScan = cancelAddPanelScan;
  global.handleTargetFound = handleTargetFound;
  global.handleTargetLost = handleTargetLost;
  global.addPanelToSpatialWorkspace = addPanelToSpatialWorkspace;
  global.arrangeMultiPanelSpatialLayout = arrangeMultiPanelSpatialLayout;
  global.updateMultiPanelUI = updateMultiPanelUI;
  global.focusPanel = focusPanel;
  global.handlePanelClosed = handlePanelClosed;
  global.setScanState = setScanState;
  global.SCAN_STATES = SCAN_STATES;
  global.ARState = ARState;
  global.launchJelajah3D = launchJelajah3D;
  global.confirmLaunchJelajah3D = confirmLaunchJelajah3D;
  global.openJelajah3DIntroPanel = openJelajah3DIntroPanel;
  global.closeJelajah3DIntroPanel = closeJelajah3DIntroPanel;
  global.startJelajah3DFromIntroPanel = startJelajah3DFromIntroPanel;
  global.openOnboardingModal = openOnboardingModal;
  global.closeOnboardingModal = closeOnboardingModal;
  global.showPostDetectionGuide = showPostDetectionGuide;
  global.showPOVInteractiveGuide = showPOVInteractiveGuide;
  global.updateSpatialPanelsPosition = updateSpatialPanelsPosition;
  global.SpatialPanelManager = SpatialPanelManager;
  global.SYSTEM_MODES = SYSTEM_MODES;

  // Auto boot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);


