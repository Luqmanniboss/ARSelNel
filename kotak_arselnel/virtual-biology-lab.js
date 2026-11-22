/**
 * =============================================================================
 * ARSELNEL — INTERACTIVE 3D VIRTUAL BIOLOGY LABORATORY (CAMERA-OFF MODE)
 * =============================================================================
 * Replaces the blank camera-off viewport with a polished, interactive 3D
 * Biology Laboratory featuring:
 *  - Modern 3D laboratory architecture (benches, cabinets, shelves, ceiling LEDs)
 *  - Central experiment workstation with procedural 3D compound light microscope
 *  - Laboratory glassware (beakers, Erlenmeyer flasks, test tubes, Petri dishes)
 *  - Dedicated specimen observation stage with strict Animal / Plant isolation
 *  - Explicit side-by-side comparison mode (never auto-spawned)
 *  - True 3DoF viewpoint control + independent "Kunci Pandangan" lock mode
 *  - Contextual organelle raycasting & KSSM Form 1 Science info card
 *  - Zero duplicate WebGL contexts / zero duplicate render loops
 * =============================================================================
 */
(function (global) {
  'use strict';

  const DEG2RAD = Math.PI / 180;

  const VirtualBiologyLab = {
    isInitialized: false,
    isActive: false,
    scene: null,
    camera: null,
    renderer: null,

    // 3D Scene hierarchy
    labRoot: null,
    workstationGroup: null,
    microscopeGroup: null,
    stageRingMesh: null,
    stageBeamMesh: null,
    particlesMesh: null,
    animalTrayMesh: null,
    plantTrayMesh: null,

    // Dedicated, strictly isolated specimen holders inside the lab
    specimenStageRoot: null,
    animalHolder: null,
    plantHolder: null,
    compareLeftPedestal: null,
    compareRightPedestal: null,

    // State
    activeSpecimen: 'none', // 'none' | 'animal' | 'plant' | 'compare'
    focusedCompareCell: 'animal',
    viewLocked: false,      // true = camera locked on workstation; drag rotates cell
    useGyro: false,         // optional device-orientation look-around
    selectedOrganelleId: null,
    selectedOrganelleCell: null,
    loadedSpecimens: { animal: false, plant: false },
    loadingSpecimens: { animal: false, plant: false },
    interactiveMeshes: { animal: [], plant: [] },
    labClickables: [],

    // Independent per-specimen transforms (never shared between animal & plant)
    specimenTransform: {
      animal: { rotX: 0.15, rotY: 0, scale: 1.0 },
      plant:  { rotX: 0.15, rotY: 0, scale: 1.0 }
    },

    // Smooth 3DoF viewpoint state (radians / degrees)
    viewTargetYaw: 0,
    viewTargetPitch: -6,
    viewCurrentYaw: 0,
    viewCurrentPitch: -6,

    // Pointer / touch tracking
    _listenersAttached: false,
    _activePointers: new Map(),
    _pinchStartDist: 0,
    _pinchStartScale: 1.0,
    _dragMode: null, // 'camera' | 'cell'
    _lastPointer: { x: 0, y: 0 },
    _downPointer: { x: 0, y: 0, time: 0 },
    _raycaster: null,
    _pointerNDC: null,
    _lastTime: 0,

    // Cached HUD DOM elements
    dom: {},

    /**
     * Cache Virtual Lab HUD DOM elements
     */
    cacheDOM() {
      if (typeof document === 'undefined') return;
      this.dom = {
        hud: document.getElementById('virtual-lab-hud'),
        statusBadge: document.getElementById('vlab-status-text'),
        btnAnimal: document.getElementById('vlab-btn-animal'),
        btnPlant: document.getElementById('vlab-btn-plant'),
        btnCompare: document.getElementById('vlab-btn-compare'),
        btnLockView: document.getElementById('vlab-btn-lock-view'),
        lockViewIcon: document.getElementById('vlab-lock-icon'),
        lockViewLabel: document.getElementById('vlab-lock-label'),
        btnResetView: document.getElementById('vlab-btn-reset-view'),
        btnWorkstation: document.getElementById('vlab-btn-workstation'),
        btnZoomIn: document.getElementById('vlab-btn-zoom-in'),
        btnZoomOut: document.getElementById('vlab-btn-zoom-out'),
        zoomControls: document.getElementById('vlab-zoom-controls'),
        hintBanner: document.getElementById('vlab-hint-banner'),
        hintText: document.getElementById('vlab-hint-text'),
        loadingPill: document.getElementById('vlab-loading-pill'),
        loadingText: document.getElementById('vlab-loading-text'),
        orgCard: document.getElementById('vlab-organelle-card'),
        orgIcon: document.getElementById('vlab-org-icon'),
        orgName: document.getElementById('vlab-org-name'),
        orgCategory: document.getElementById('vlab-org-category'),
        orgDesc: document.getElementById('vlab-org-desc'),
        orgAnalogy: document.getElementById('vlab-org-analogy'),
        orgClose: document.getElementById('vlab-org-close')
      };
    },

    /**
     * Initialize 3D Biology Laboratory geometry inside existing Three.js scene
     */
    init(scene, renderer, camera) {
      if (this.isInitialized && this.labRoot) {
        if (scene && this.labRoot.parent !== scene) {
          scene.add(this.labRoot);
        }
        return;
      }
      const THREE = global.THREE;
      if (!THREE || !scene) return;

      this.scene = scene;
      this.renderer = renderer;
      this.camera = camera;
      this._raycaster = new THREE.Raycaster();
      this._pointerNDC = new THREE.Vector2();

      // Adaptive mobile pixel ratio cap for smooth 60fps performance
      if (renderer && typeof renderer.setPixelRatio === 'function' && typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      }

      this.labRoot = new THREE.Group();
      this.labRoot.name = 'ARSELNEL_VirtualBiologyLab3D';
      this.labRoot.visible = false;

      // Build complete 3D laboratory
      this._buildLighting();
      this._buildRoomArchitecture();
      this._buildCentralWorkstation();
      this._buildMicroscope();
      this._buildGlasswareAndProps();
      this._buildSideCabinetsAndShelves();
      this._buildSpecimenStages();
      this._buildAmbientParticles();

      scene.add(this.labRoot);
      this.isInitialized = true;

      this.cacheDOM();
      this._bindHUDListeners();
      this._bindPointerListeners();

      console.log('[VirtualBiologyLab] 🧪 Makmal Biologi Maya 3D berjaya dibina.');
    },

    /**
     * Balanced, mobile-friendly scientific laboratory lighting
     */
    _buildLighting() {
      const THREE = global.THREE;
      const hemi = new THREE.HemisphereLight(0xf0f9ff, 0x1e3a5f, 1.05);
      hemi.position.set(0, 5, 0);
      this.labRoot.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
      keyLight.position.set(2.5, 5.5, 3.0);
      this.labRoot.add(keyLight);

      const fillCyan = new THREE.DirectionalLight(0x7dd3fc, 0.55);
      fillCyan.position.set(-4.0, 2.5, -1.5);
      this.labRoot.add(fillCyan);

      const stageSpot = new THREE.PointLight(0x38bdf8, 0.85, 6.5);
      stageSpot.position.set(0, 1.4, -2.0);
      this.labRoot.add(stageSpot);
    },

    /**
     * Create procedural tiled lab floor texture (lightweight 512x512 canvas)
     */
    _createFloorTexture() {
      const THREE = global.THREE;
      if (typeof document === 'undefined') return null;
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#dceaf5';
      ctx.fillRect(0, 0, 512, 512);

      // Subtle clean lab tiles
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.16)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }
      // Alternating gentle sheen squares
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if ((x + y) % 2 === 0) ctx.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    },

    /**
     * Create clean illuminated lab wall header sign texture
     */
    _createWallSignTexture(title, subtitle) {
      const THREE = global.THREE;
      if (typeof document === 'undefined') return null;
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, 1024, 256);
      grad.addColorStop(0, '#0c2742');
      grad.addColorStop(0.5, '#0e3a5c');
      grad.addColorStop(1, '#0c2742');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 256);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 1004, 236);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, 512, 112);

      ctx.fillStyle = '#e0f2fe';
      ctx.font = '600 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(subtitle, 512, 174);

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    },

    /**
     * Modern 3D Biology Laboratory Architecture (Floor, Walls, Windows, Ceiling LEDs)
     */
    _buildRoomArchitecture() {
      const THREE = global.THREE;
      const roomGroup = new THREE.Group();
      roomGroup.name = 'LabRoomArchitecture';

      const floorTex = this._createFloorTexture();
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xe6f2fa,
        map: floorTex,
        roughness: 0.35,
        metalness: 0.08
      });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.1;
      roomGroup.add(floor);

      // Ceiling
      const ceilMat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        roughness: 0.7,
        metalness: 0.05
      });
      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 3.2;
      roomGroup.add(ceiling);

      // 4 Recessed Soft Ceiling LED Light Panels
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      const ledFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.5 });
      const ledPositions = [[-2.2, 3.16, -2.5], [2.2, 3.16, -2.5], [-2.2, 3.16, 1.5], [2.2, 3.16, 1.5]];
      ledPositions.forEach(([lx, ly, lz]) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.7), ledFrameMat);
        frame.position.set(lx, ly, lz);
        roomGroup.add(frame);

        const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 0.56), ledMat);
        panel.rotation.x = Math.PI / 2;
        panel.position.set(lx, ly - 0.035, lz);
        roomGroup.add(panel);
      });

      // Clean Modern Walls (Back, Left, Right)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f7fc, roughness: 0.65, metalness: 0.05 });
      const dadoMat = new THREE.MeshStandardMaterial({ color: 0x0f2d4a, roughness: 0.45, metalness: 0.2 });
      const trimCyanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

      // Back wall (lower dado + upper frame with panoramic lab window)
      const backLower = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 0.2), dadoMat);
      backLower.position.set(0, -1.0, -5.8);
      roomGroup.add(backLower);

      const backUpper = new THREE.Mesh(new THREE.BoxGeometry(14, 1.1, 0.2), wallMat);
      backUpper.position.set(0, 2.65, -5.8);
      roomGroup.add(backUpper);

      // Back wall side pillars flanking observation glass
      [-5.2, 5.2].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.3, 0.22), wallMat);
        pillar.position.set(px, 0.55, -5.8);
        roomGroup.add(pillar);
      });

      // Panoramic tinted lab glass window
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.14,
        roughness: 0.1,
        metalness: 0.25
      });
      const backWindow = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.0), glassMat);
      backWindow.position.set(0, 1.1, -5.75);
      roomGroup.add(backWindow);

      // Cyan LED horizon strip along back wall
      const backStrip = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.05, 0.05), trimCyanMat);
      backStrip.position.set(0, 0.12, -5.68);
      roomGroup.add(backStrip);

      // Illuminated ARSELNEL Biology Lab header sign above window
      const signTex = this._createWallSignTexture(
        'MAKMAL BIOLOGI MAYA ARSELNEL',
        'KSSM SAINS TINGKATAN 1 • BAB 2: SEL SEBAGAI UNIT ASAS HIDUPAN'
      );
      if (signTex) {
        const signMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(4.4, 0.72),
          new THREE.MeshBasicMaterial({ map: signTex })
        );
        signMesh.position.set(0, 2.55, -5.66);
        roomGroup.add(signMesh);
      }

      // Left & Right side walls
      [-6.5, 6.5].forEach((wx) => {
        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.3, 14), wallMat);
        sideWall.position.set(wx, 0.55, 0);
        roomGroup.add(sideWall);

        const sideDado = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.5, 14), dadoMat);
        sideDado.position.set(wx, -1.35, 0);
        roomGroup.add(sideDado);

        const sideStrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 13.6), trimCyanMat);
        sideStrip.position.set(wx > 0 ? wx - 0.13 : wx + 0.13, -0.58, 0);
        roomGroup.add(sideStrip);
      });

      this.labRoot.add(roomGroup);
    },

    /**
     * Central Modern Biology Experiment Workstation Bench
     */
    _buildCentralWorkstation() {
      const THREE = global.THREE;
      this.workstationGroup = new THREE.Group();
      this.workstationGroup.name = 'CentralExperimentWorkstation';
      this.workstationGroup.position.set(0, -1.05, -2.55);

      // Glossy chemical-resistant epoxy benchtop
      const topMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.1
      });
      const benchTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 1.75), topMat);
      benchTop.position.set(0, 0.28, 0);
      this.workstationGroup.add(benchTop);

      // Subtle cyan front edge accent
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const frontEdge = new THREE.Mesh(new THREE.BoxGeometry(4.22, 0.03, 0.03), edgeMat);
      frontEdge.position.set(0, 0.28, 0.88);
      this.workstationGroup.add(frontEdge);

      // Lower cabinet body
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.45, metalness: 0.25 });
      const cabinetBody = new THREE.Mesh(new THREE.BoxGeometry(3.85, 1.25, 1.48), bodyMat);
      cabinetBody.position.set(0, -0.4, 0);
      this.workstationGroup.add(cabinetBody);

      // 3 Drawer fronts with metallic handles
      const drawerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.15 });
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.7 });
      [-1.2, 0, 1.2].forEach((dx) => {
        const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 0.05), drawerMat);
        drawer.position.set(dx, -0.1, 0.75);
        this.workstationGroup.add(drawer);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.06), handleMat);
        handle.position.set(dx, -0.05, 0.79);
        this.workstationGroup.add(handle);
      });

      // Soft contact shadow plane under bench
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 2.2),
        new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.22 })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.set(0, -1.04, 0);
      this.workstationGroup.add(shadowPlane);

      // Interactive Specimen Slide Trays on the bench
      const buildSpecimenTray = (x, colorHex, cellType) => {
        const trayGrp = new THREE.Group();
        trayGrp.position.set(x, 0.36, 0.44);

        const trayBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.035, 0.36),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 })
        );
        trayBase.userData = { labAction: 'select_specimen', cellType };
        trayGrp.add(trayBase);
        this.labClickables.push(trayBase);

        // Glowing glass slide inside tray
        const slide = new THREE.Mesh(
          new THREE.BoxGeometry(0.46, 0.018, 0.18),
          new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 0.85,
            roughness: 0.15
          })
        );
        slide.position.y = 0.025;
        slide.userData = { labAction: 'select_specimen', cellType };
        trayGrp.add(slide);
        this.labClickables.push(slide);

        // Specimen droplet dot in center of slide
        const drop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.055, 0.012, 16),
          new THREE.MeshBasicMaterial({ color: colorHex })
        );
        drop.position.y = 0.038;
        trayGrp.add(drop);

        this.workstationGroup.add(trayGrp);
        return trayGrp;
      };

      this.animalTrayMesh = buildSpecimenTray(-0.85, 0x38bdf8, 'animal');
      this.plantTrayMesh = buildSpecimenTray(0.85, 0x10b981, 'plant');

      this.labRoot.add(this.workstationGroup);
    },

    /**
     * Detailed Procedural 3D Compound Light Microscope on the Central Bench
     */
    _buildMicroscope() {
      const THREE = global.THREE;
      this.microscopeGroup = new THREE.Group();
      this.microscopeGroup.name = 'LabCompoundMicroscope';
      // Positioned left-rear of central observation stage so it frames the experiment clearly
      this.microscopeGroup.position.set(-1.35, 0.34, -0.18);
      this.microscopeGroup.rotation.y = 0.38;

      const whiteBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.2 });
      const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.65 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.18, metalness: 0.85 });
      const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.56), darkMetalMat);
      base.position.set(0, 0.035, 0);
      this.microscopeGroup.add(base);

      // Substage illuminator lamp (glowing cyan light)
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 18), cyanGlowMat);
      lamp.position.set(0, 0.09, 0.08);
      this.microscopeGroup.add(lamp);

      // Curved arm pillar
      const armLower = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.56, 0.13), whiteBodyMat);
      armLower.position.set(0, 0.34, -0.16);
      armLower.rotation.x = 0.14;
      this.microscopeGroup.add(armLower);

      const armUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.34), whiteBodyMat);
      armUpper.position.set(0, 0.62, -0.02);
      this.microscopeGroup.add(armUpper);

      // Mechanical stage
      const stage = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.035, 0.34), darkMetalMat);
      stage.position.set(0, 0.29, 0.06);
      this.microscopeGroup.add(stage);

      // Glowing glass slide on microscope stage
      const stageSlide = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.012, 0.09),
        new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0284c7, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 })
      );
      stageSlide.position.set(0, 0.315, 0.06);
      this.microscopeGroup.add(stageSlide);

      // Revolving nosepiece & 3 objective lenses
      const nosepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.04, 18), darkMetalMat);
      nosepiece.position.set(0, 0.52, 0.07);
      this.microscopeGroup.add(nosepiece);

      [0, 2.1, 4.2].forEach((ang, idx) => {
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, idx === 0 ? 0.13 : 0.095, 12), chromeMat);
        lens.position.set(Math.sin(ang) * 0.05, 0.45, 0.07 + Math.cos(ang) * 0.05);
        this.microscopeGroup.add(lens);
      });

      // Body head & angled eyepiece
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.18, 16), whiteBodyMat);
      head.position.set(0, 0.66, 0.06);
      this.microscopeGroup.add(head);

      const eyepieceTube = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.24, 14), darkMetalMat);
      eyepieceTube.position.set(0, 0.80, 0.14);
      eyepieceTube.rotation.x = 0.58;
      this.microscopeGroup.add(eyepieceTube);

      // Coarse & Fine focus knobs on both sides
      [-0.08, 0.08].forEach((kx) => {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16), darkMetalMat);
        knob.rotation.z = Math.PI / 2;
        knob.position.set(kx, 0.28, -0.15);
        this.microscopeGroup.add(knob);
      });

      // Make microscope clickable to prompt/focus specimen
      this.microscopeGroup.traverse((child) => {
        if (child.isMesh) {
          child.userData = { labAction: 'focus_microscope' };
          this.labClickables.push(child);
        }
      });

      this.workstationGroup.add(this.microscopeGroup);
    },

    /**
     * Laboratory Glassware: Beakers, Erlenmeyer Flasks, Test Tube Rack & Petri Dishes
     */
    _buildGlasswareAndProps() {
      const THREE = global.THREE;
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.36,
        roughness: 0.08,
        metalness: 0.15
      });

      // 1. Graduated Beaker (right side of bench) with cyan reagent
      const beakerGrp = new THREE.Group();
      beakerGrp.position.set(1.48, 0.34, -0.25);
      const beakerWall = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.28, 18, 1, true), glassMat);
      beakerWall.position.y = 0.14;
      beakerGrp.add(beakerWall);
      const beakerLiq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.098, 0.098, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.25, transparent: true, opacity: 0.78 })
      );
      beakerLiq.position.y = 0.085;
      beakerGrp.add(beakerLiq);
      this.workstationGroup.add(beakerGrp);

      // 2. Conical Erlenmeyer Flask with emerald chlorophyll solution
      const flaskGrp = new THREE.Group();
      flaskGrp.position.set(1.18, 0.34, -0.48);
      const flaskBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.13, 0.24, 18), glassMat);
      flaskBody.position.y = 0.12;
      flaskGrp.add(flaskBody);
      const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.11, 14), glassMat);
      flaskNeck.position.y = 0.29;
      flaskGrp.add(flaskNeck);
      const flaskLiq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.118, 0.11, 16),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.3, transparent: true, opacity: 0.82 })
      );
      flaskLiq.position.y = 0.06;
      flaskGrp.add(flaskLiq);
      this.workstationGroup.add(flaskGrp);

      // 3. Test Tube Rack (5 tubes with colorful biological stains)
      const rackGrp = new THREE.Group();
      rackGrp.position.set(1.56, 0.34, 0.25);
      rackGrp.rotation.y = -0.35;
      const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.45 });
      const rackBottom = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.12), rackMat);
      rackBottom.position.y = 0.012;
      rackGrp.add(rackBottom);
      const rackTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.12), rackMat);
      rackTop.position.y = 0.14;
      rackGrp.add(rackTop);
      [-0.21, 0.21].forEach((px) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.14, 0.09), rackMat);
        post.position.set(px, 0.075, 0);
        rackGrp.add(post);
      });

      const tubeColors = [0x38bdf8, 0x10b981, 0xa855f7, 0x06b6d4, 0xf59e0b];
      tubeColors.forEach((col, i) => {
        const tx = -0.15 + i * 0.075;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 10), glassMat);
        tube.position.set(tx, 0.15, 0);
        rackGrp.add(tube);

        const liq = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, 0.12, 10),
          new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.25, transparent: true, opacity: 0.85 })
        );
        liq.position.set(tx, 0.08, 0);
        rackGrp.add(liq);
      });
      this.workstationGroup.add(rackGrp);

      // 4. Petri Dishes (near microscope)
      [[-1.62, 0.35, 0.34, 0x38bdf8], [-1.32, 0.35, 0.52, 0x10b981]].forEach(([px, py, pz, col]) => {
        const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 18), glassMat);
        dish.position.set(px, py, pz);
        this.workstationGroup.add(dish);
        const agar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.098, 0.098, 0.015, 16),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 })
        );
        agar.position.set(px, py - 0.004, pz);
        this.workstationGroup.add(agar);
      });
    },

    /**
     * Side Laboratory Cabinets, Wall Shelves & Reagent Bottles for Rich 3D Depth
     */
    _buildSideCabinetsAndShelves() {
      const THREE = global.THREE;
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.45, metalness: 0.2 });
      const topMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.28, metalness: 0.1 });
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.5 });

      [-5.6, 5.6].forEach((sideX) => {
        const sideGrp = new THREE.Group();
        sideGrp.position.set(sideX, -1.25, -1.5);

        // Side lab counter
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 5.8), cabMat);
        sideGrp.add(counter);

        const counterTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 5.9), topMat);
        counterTop.position.y = 0.8;
        sideGrp.add(counterTop);

        // Upper wall shelves with reagent bottles
        [1.9, 2.65].forEach((sy) => {
          const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 4.6), shelfMat);
          shelf.position.set(sideX > 0 ? 0.35 : -0.35, sy, 0);
          sideGrp.add(shelf);

          const bottleColors = [0x0284c7, 0x059669, 0x0891b2, 0x6366f1];
          for (let b = 0; b < 4; b++) {
            const bottle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12),
              new THREE.MeshStandardMaterial({ color: bottleColors[b], roughness: 0.25, metalness: 0.15 })
            );
            bottle.position.set(sideX > 0 ? 0.32 : -0.32, sy + 0.17, -1.5 + b * 1.0);
            sideGrp.add(bottle);
          }
        });

        this.labRoot.add(sideGrp);
      });
    },

    /**
     * Dedicated Specimen Observation Stage + Strictly Isolated Animal & Plant Holders
     */
    _buildSpecimenStages() {
      const THREE = global.THREE;
      this.specimenStageRoot = new THREE.Group();
      this.specimenStageRoot.name = 'LabSpecimenObservationStage';
      this.specimenStageRoot.position.set(0, 0.36, -0.02);

      // Glowing central observation plate on the bench
      const plateBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.62, 0.04, 32),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.6 })
      );
      this.specimenStageRoot.add(plateBase);

      const ringGeo = new THREE.RingGeometry(0.48, 0.55, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      this.stageRingMesh = new THREE.Mesh(ringGeo, ringMat);
      this.stageRingMesh.rotation.x = -Math.PI / 2;
      this.stageRingMesh.position.y = 0.025;
      this.specimenStageRoot.add(this.stageRingMesh);

      // Subtle holographic observation column beam
      const beamGeo = new THREE.CylinderGeometry(0.45, 0.52, 0.95, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      this.stageBeamMesh = new THREE.Mesh(beamGeo, beamMat);
      this.stageBeamMesh.position.y = 0.5;
      this.specimenStageRoot.add(this.stageBeamMesh);

      // Strictly separated Animal & Plant specimen holders (hidden by default!)
      this.animalHolder = new THREE.Group();
      this.animalHolder.name = 'LabSpecimenHolder_Animal';
      this.animalHolder.position.set(0, 0.72, 0);
      this.animalHolder.visible = false;
      this.specimenStageRoot.add(this.animalHolder);

      this.plantHolder = new THREE.Group();
      this.plantHolder.name = 'LabSpecimenHolder_Plant';
      this.plantHolder.position.set(0, 0.72, 0);
      this.plantHolder.visible = false;
      this.specimenStageRoot.add(this.plantHolder);

      this.workstationGroup.add(this.specimenStageRoot);
    },

    /**
     * Lightweight ambient floating scientific micro-particles (24 points)
     */
    _buildAmbientParticles() {
      const THREE = global.THREE;
      const count = 24;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 6.5;
        positions[i * 3 + 1] = -0.5 + Math.random() * 2.8;
        positions[i * 3 + 2] = -4.5 + Math.random() * 3.8;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x7dd3fc,
        size: 0.055,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      });
      this.particlesMesh = new THREE.Points(geo, mat);
      this.labRoot.add(this.particlesMesh);
    },

    /**
     * Enter Virtual Biology Laboratory Mode (Camera OFF)
     */
    enter() {
      if (!this.isInitialized && global.ARState && global.ARState.scene) {
        this.init(global.ARState.scene, global.ARState.renderer, global.ARState.camera);
      }
      this.cacheDOM();
      this.isActive = true;

      if (this.labRoot) {
        this.labRoot.visible = true;
      }

      // Hide AR scanner overlay so the 3D lab is completely unobstructed
      const scannerOverlay = document.getElementById('scanner-overlay');
      if (scannerOverlay) scannerOverlay.classList.add('hidden');

      // Show minimal Virtual Lab HUD
      if (this.dom.hud) {
        this.dom.hud.classList.remove('hidden');
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('virtual-lab-active');
      }

      // Ensure camera near/far & comfortable default angle facing the central workstation
      this.resetViewpoint(true);
      this._syncHUDState();

      // Never auto-display both cells or force a specimen on entry — keep whatever user explicitly chose (default 'none')
      this._applySpecimenVisibility();

      console.log('[VirtualBiologyLab] 🧪 Memasuki Makmal Biologi Maya 3D.');
    },

    /**
     * Exit Virtual Biology Laboratory Mode (Camera ON — return to AR Mode cleanly)
     */
    exit() {
      this.isActive = false;
      this.viewLocked = false;
      this._activePointers.clear();
      this._dragMode = null;

      if (this.labRoot) {
        this.labRoot.visible = false;
      }
      if (this.dom.hud) {
        this.dom.hud.classList.add('hidden');
      }
      if (this.dom.orgCard) {
        this.dom.orgCard.classList.add('hidden');
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('virtual-lab-active');
      }

      // Restore scanner overlay if no AR panels are currently active
      if (global.ARState && global.ARState.activePanels && global.ARState.activePanels.size === 0) {
        const scannerOverlay = document.getElementById('scanner-overlay');
        if (scannerOverlay) scannerOverlay.classList.remove('hidden');
      }

      console.log('[VirtualBiologyLab] 📹 Keluar daripada Makmal Biologi Maya 3D (kembali ke Mod AR).');
    },

    /**
     * Select specimen explicitly: 'none' | 'animal' | 'plant' | 'compare'
     * CRITICAL: Selecting 'animal' displays ONLY Animal; selecting 'plant' displays ONLY Plant!
     */
    selectSpecimen(mode) {
      if (!['none', 'animal', 'plant', 'compare'].includes(mode)) return;
      this.activeSpecimen = mode;
      this.clearOrganelleSelection();

      if (mode === 'animal') {
        this._ensureSpecimenLoaded('animal');
      } else if (mode === 'plant') {
        this._ensureSpecimenLoaded('plant');
      } else if (mode === 'compare') {
        this._ensureSpecimenLoaded('animal');
        this._ensureSpecimenLoaded('plant');
      }

      this._applySpecimenVisibility();
      this._syncHUDState();

      if (mode === 'none') {
        this.resetViewpoint(false);
      }
    },

    /**
     * Strictly enforce isolated visibility & side-by-side positions
     */
    _applySpecimenVisibility() {
      if (!this.animalHolder || !this.plantHolder) return;

      const isNarrow = (typeof window !== 'undefined' && window.innerWidth <= 640);
      const aT = this.specimenTransform.animal;
      const pT = this.specimenTransform.plant;

      if (this.activeSpecimen === 'animal') {
        this.animalHolder.visible = true;
        this.plantHolder.visible = false;
        this.animalHolder.position.set(0, 0.72, 0);
        this.animalHolder.scale.setScalar(aT.scale);
        this.animalHolder.rotation.set(aT.rotX, aT.rotY, 0);
      } else if (this.activeSpecimen === 'plant') {
        this.animalHolder.visible = false;
        this.plantHolder.visible = true;
        this.plantHolder.position.set(0, 0.72, 0);
        this.plantHolder.scale.setScalar(pT.scale);
        this.plantHolder.rotation.set(pT.rotX, pT.rotY, 0);
      } else if (this.activeSpecimen === 'compare') {
        const offsetX = isNarrow ? 0.56 : 0.78;
        const cmpScale = isNarrow ? 0.72 : 0.85;
        this.animalHolder.visible = true;
        this.plantHolder.visible = true;

        this.animalHolder.position.set(-offsetX, 0.72, 0);
        this.animalHolder.scale.setScalar(aT.scale * cmpScale);
        this.animalHolder.rotation.set(aT.rotX, aT.rotY, 0);

        this.plantHolder.position.set(offsetX, 0.72, 0);
        this.plantHolder.scale.setScalar(pT.scale * cmpScale);
        this.plantHolder.rotation.set(pT.rotX, pT.rotY, 0);
      } else {
        this.animalHolder.visible = false;
        this.plantHolder.visible = false;
      }
    },

    /**
     * Load GLB model (reusing CellQuestARController's memory cache if available!) with procedural fallback
     */
    _ensureSpecimenLoaded(cellType) {
      if (this.loadedSpecimens[cellType] || this.loadingSpecimens[cellType]) return;
      const THREE = global.THREE;
      if (!THREE) return;

      // Reuse already-cached GLTF scene from CellQuestARController if available!
      const sharedCache = global.CellQuestARController && global.CellQuestARController.cachedGltfScenes;
      if (sharedCache && sharedCache[cellType]) {
        this._mountSpecimenScene(cellType, sharedCache[cellType].clone(true));
        return;
      }

      this.loadingSpecimens[cellType] = true;
      if (this.dom.loadingPill) this.dom.loadingPill.classList.remove('hidden');
      if (this.dom.loadingText) {
        this.dom.loadingText.textContent = cellType === 'animal'
          ? 'Memuatkan Spesimen Sel Haiwan 3D...'
          : 'Memuatkan Spesimen Sel Tumbuhan 3D...';
      }

      const url = cellType === 'animal' ? '/models/animal_cell_final.glb' : '/models/plantcellnew.glb';
      if (typeof THREE.GLTFLoader === 'function') {
        const loader = new THREE.GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            this.loadingSpecimens[cellType] = false;
            if (sharedCache) sharedCache[cellType] = gltf.scene;
            this._mountSpecimenScene(cellType, gltf.scene.clone(true));
            if (this.dom.loadingPill) this.dom.loadingPill.classList.add('hidden');
          },
          undefined,
          () => {
            this.loadingSpecimens[cellType] = false;
            this._mountProceduralFallback(cellType);
            if (this.dom.loadingPill) this.dom.loadingPill.classList.add('hidden');
          }
        );
      } else {
        this.loadingSpecimens[cellType] = false;
        this._mountProceduralFallback(cellType);
        if (this.dom.loadingPill) this.dom.loadingPill.classList.add('hidden');
      }
    },

    /**
     * Normalize, center, and tag organelles on loaded GLB model for independent raycasting
     */
    _mountSpecimenScene(cellType, modelScene) {
      const THREE = global.THREE;
      const targetHolder = cellType === 'animal' ? this.animalHolder : this.plantHolder;
      if (!targetHolder || !modelScene) return;

      while (targetHolder.children.length > 0) {
        targetHolder.remove(targetHolder.children[0]);
      }
      this.interactiveMeshes[cellType] = [];

      // Normalize bounding box to fit observation stage (~0.92 unit diameter)
      const box = new THREE.Box3().setFromObject(modelScene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fitScale = 0.92 / maxDim;

      const wrapper = new THREE.Group();
      modelScene.position.sub(center);
      wrapper.add(modelScene);
      wrapper.scale.setScalar(fitScale);

      // Map mesh names to KSSM organelle IDs
      const mapOrganelleId = (rawName) => {
        const n = (rawName || '').toLowerCase();
        if (n.includes('nucle') || n.includes('nukle')) return 'nucleus';
        if (n.includes('mito')) return 'mitochondria';
        if (n.includes('chloro') || n.includes('kloro')) return 'chloroplast';
        if (n.includes('vacu') || n.includes('vaku')) return 'vacuole';
        if (n.includes('wall') || n.includes('dinding')) return 'wall';
        if (n.includes('memb')) return 'membrane';
        if (n.includes('cyto') || n.includes('sito')) return 'cytoplasm';
        if (n.includes('golgi')) return 'golgi';
        if (n.includes('retic') || n.includes('er')) return 'er';
        if (n.includes('centri') || n.includes('sentri')) return 'centrioles';
        if (n.includes('lyso') || n.includes('liso')) return 'lysosome';
        return cellType === 'plant' ? 'wall' : 'membrane';
      };

      modelScene.traverse((child) => {
        if (child.isMesh) {
          const orgId = mapOrganelleId(child.name);
          child.userData = {
            labSpecimen: cellType,
            organelleId: orgId,
            baseEmissive: child.material && child.material.emissive ? child.material.emissive.getHex() : 0x000000,
            baseEmissiveIntensity: child.material && typeof child.material.emissiveIntensity === 'number' ? child.material.emissiveIntensity : 0
          };
          this.interactiveMeshes[cellType].push(child);
        }
      });

      targetHolder.add(wrapper);
      this.loadedSpecimens[cellType] = true;
      this._applySpecimenVisibility();
    },

    /**
     * Lightweight procedural 3D cell fallback (if offline / headless)
     */
    _mountProceduralFallback(cellType) {
      const THREE = global.THREE;
      const targetHolder = cellType === 'animal' ? this.animalHolder : this.plantHolder;
      if (!targetHolder) return;

      while (targetHolder.children.length > 0) {
        targetHolder.remove(targetHolder.children[0]);
      }
      this.interactiveMeshes[cellType] = [];

      const addPart = (orgId, geo, pos, color, opacity = 1) => {
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          transparent: opacity < 1,
          opacity
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.userData = { labSpecimen: cellType, organelleId: orgId, baseEmissive: 0, baseEmissiveIntensity: 0 };
        targetHolder.add(mesh);
        this.interactiveMeshes[cellType].push(mesh);
      };

      if (cellType === 'animal') {
        addPart('membrane', new THREE.SphereGeometry(0.46, 24, 18), [0, 0, 0], 0x38bdf8, 0.42);
        addPart('nucleus', new THREE.SphereGeometry(0.16, 20, 16), [-0.04, 0.04, 0], 0x8b5cf6);
        addPart('mitochondria', new THREE.SphereGeometry(0.08, 16, 12), [0.22, -0.1, 0.08], 0xf97316);
        addPart('vacuole', new THREE.SphereGeometry(0.06, 14, 12), [-0.18, 0.16, 0.1], 0x06b6d4, 0.75);
      } else {
        addPart('wall', new THREE.BoxGeometry(0.84, 0.62, 0.62), [0, 0, 0], 0x16a34a, 0.45);
        addPart('vacuole', new THREE.SphereGeometry(0.18, 18, 14), [0, 0.02, 0], 0x38bdf8, 0.65);
        addPart('nucleus', new THREE.SphereGeometry(0.11, 16, 14), [0.22, 0.1, -0.06], 0x8b5cf6);
        addPart('chloroplast', new THREE.SphereGeometry(0.08, 14, 12), [-0.24, 0.12, 0.1], 0x22c55e);
        addPart('mitochondria', new THREE.SphereGeometry(0.065, 14, 12), [0.16, -0.12, 0.1], 0xf97316);
      }

      this.loadedSpecimens[cellType] = true;
      this._applySpecimenVisibility();
    },

    /**
     * Toggle Viewpoint Lock ("Kunci Pandangan" / "Buka Kunci Pandangan")
     */
    toggleViewLock() {
      this.viewLocked = !this.viewLocked;
      if (this.viewLocked) {
        // Lock camera smoothly onto the central experiment table
        this.viewTargetYaw = 0;
        this.viewTargetPitch = -6;
      }
      this._syncHUDState();
    },

    /**
     * Reset Viewpoint & Active Specimen Transforms
     */
    resetViewpoint(silent = false) {
      this.viewTargetYaw = 0;
      this.viewTargetPitch = -6;
      if (silent) {
        this.viewCurrentYaw = 0;
        this.viewCurrentPitch = -6;
      }
      this.specimenTransform.animal = { rotX: 0.15, rotY: 0, scale: 1.0 };
      this.specimenTransform.plant  = { rotX: 0.15, rotY: 0, scale: 1.0 };
      this._applySpecimenVisibility();
      if (!silent && typeof global.showToast === 'function') {
        global.showToast('↺ Pandangan makmal & spesimen ditetapkan semula.', 1600);
      }
    },

    /**
     * Adjust active specimen zoom
     */
    adjustZoom(factor) {
      if (this.activeSpecimen === 'none') return;
      const targetKey = this.activeSpecimen === 'compare' ? this.focusedCompareCell : this.activeSpecimen;
      const t = this.specimenTransform[targetKey];
      if (!t) return;
      t.scale = Math.max(0.55, Math.min(2.2, t.scale * factor));
      this._applySpecimenVisibility();
    },

    /**
     * Select & highlight organelle and display compact contextual info card
     */
    selectOrganelle(organelleId, cellType) {
      const db = global.CELLQUEST_ORGANELLES || {};
      const info = db[organelleId];
      if (!info) return;

      this.clearOrganelleSelection(true);
      this.selectedOrganelleId = organelleId;
      this.selectedOrganelleCell = cellType;

      // Highlight matching meshes ONLY on the selected cell
      (this.interactiveMeshes[cellType] || []).forEach((m) => {
        if (m.userData && m.userData.organelleId === organelleId && m.material && m.material.emissive) {
          m.material.emissive.setHex(0xfbbf24);
          m.material.emissiveIntensity = 0.65;
        }
      });

      const cellBadge = cellType === 'animal' ? 'Sel Haiwan' : 'Sel Tumbuhan';
      if (this.dom.orgIcon) this.dom.orgIcon.textContent = info.icon || '🔬';
      if (this.dom.orgName) this.dom.orgName.textContent = `${info.name} (${cellBadge})`;
      if (this.dom.orgCategory) this.dom.orgCategory.textContent = info.category || 'Organel Sel';
      if (this.dom.orgDesc) this.dom.orgDesc.textContent = info.description || '';
      if (this.dom.orgAnalogy) this.dom.orgAnalogy.textContent = info.analogy || '';
      if (this.dom.orgCard) this.dom.orgCard.classList.remove('hidden');
    },

    /**
     * Clear organelle highlight & hide contextual card
     */
    clearOrganelleSelection(keepCard = false) {
      ['animal', 'plant'].forEach((type) => {
        (this.interactiveMeshes[type] || []).forEach((m) => {
          if (m.material && m.material.emissive) {
            m.material.emissive.setHex(m.userData.baseEmissive || 0x000000);
            m.material.emissiveIntensity = m.userData.baseEmissiveIntensity || 0;
          }
        });
      });
      this.selectedOrganelleId = null;
      this.selectedOrganelleCell = null;
      if (!keepCard && this.dom.orgCard) {
        this.dom.orgCard.classList.add('hidden');
      }
    },

    /**
     * Sync compact Virtual Lab HUD buttons & contextual hint
     */
    _syncHUDState() {
      const d = this.dom;
      if (!d.hud) return;

      if (d.btnAnimal) d.btnAnimal.classList.toggle('is-active', this.activeSpecimen === 'animal');
      if (d.btnPlant) d.btnPlant.classList.toggle('is-active', this.activeSpecimen === 'plant');
      if (d.btnCompare) d.btnCompare.classList.toggle('is-active', this.activeSpecimen === 'compare');

      if (d.btnLockView) d.btnLockView.classList.toggle('is-locked', this.viewLocked);
      if (d.lockViewIcon) d.lockViewIcon.textContent = this.viewLocked ? 'lock' : 'lock_open';
      if (d.lockViewLabel) d.lockViewLabel.textContent = this.viewLocked ? 'Buka Kunci Pandangan' : 'Kunci Pandangan';

      if (d.zoomControls) {
        d.zoomControls.classList.toggle('hidden', this.activeSpecimen === 'none');
      }
      if (d.btnWorkstation) {
        d.btnWorkstation.classList.toggle('hidden', this.activeSpecimen === 'none');
      }

      if (d.statusBadge) {
        if (this.activeSpecimen === 'animal') d.statusBadge.textContent = 'Pemerhatian: Sel Haiwan';
        else if (this.activeSpecimen === 'plant') d.statusBadge.textContent = 'Pemerhatian: Sel Tumbuhan';
        else if (this.activeSpecimen === 'compare') d.statusBadge.textContent = 'Perbandingan: Haiwan & Tumbuhan';
        else d.statusBadge.textContent = 'Makmal Biologi 3D • Pilih Spesimen';
      }

      if (d.hintText) {
        if (this.activeSpecimen === 'none') {
          d.hintText.textContent = 'Leret untuk tinjau makmal • Pilih Sel Haiwan atau Sel Tumbuhan di bawah';
        } else if (this.viewLocked) {
          d.hintText.textContent = 'Pandangan dikunci • Leret untuk putar sel & ketik organel untuk maklumat';
        } else {
          d.hintText.textContent = 'Ketik organel untuk info • Tekan Kunci Pandangan untuk putar model sel';
        }
      }
    },

    /**
     * Bind Virtual Lab HUD button listeners
     */
    _bindHUDListeners() {
      const d = this.dom;
      if (d.btnAnimal) d.btnAnimal.addEventListener('click', (e) => { e.stopPropagation(); this.selectSpecimen('animal'); });
      if (d.btnPlant) d.btnPlant.addEventListener('click', (e) => { e.stopPropagation(); this.selectSpecimen('plant'); });
      if (d.btnCompare) d.btnCompare.addEventListener('click', (e) => { e.stopPropagation(); this.selectSpecimen('compare'); });
      if (d.btnLockView) d.btnLockView.addEventListener('click', (e) => { e.stopPropagation(); this.toggleViewLock(); });
      if (d.btnResetView) d.btnResetView.addEventListener('click', (e) => { e.stopPropagation(); this.resetViewpoint(false); });
      if (d.btnWorkstation) d.btnWorkstation.addEventListener('click', (e) => { e.stopPropagation(); this.selectSpecimen('none'); });
      if (d.btnZoomIn) d.btnZoomIn.addEventListener('click', (e) => { e.stopPropagation(); this.adjustZoom(1.16); });
      if (d.btnZoomOut) d.btnZoomOut.addEventListener('click', (e) => { e.stopPropagation(); this.adjustZoom(0.86); });
      if (d.orgClose) d.orgClose.addEventListener('click', (e) => { e.stopPropagation(); this.clearOrganelleSelection(false); });
    },

    /**
     * Bind touch & pointer controls (separating 3DoF camera look vs. cell rotation & raycasting)
     */
    _bindPointerListeners() {
      if (this._listenersAttached || typeof window === 'undefined') return;
      this._listenersAttached = true;

      const isUIElement = (el) => {
        if (!el || typeof el.closest !== 'function') return false;
        return !!(
          el.closest('#virtual-lab-hud') ||
          el.closest('.ar-top-hud') ||
          el.closest('#ar-multi-panel-bar') ||
          el.closest('.pov-spatial-panel') ||
          el.closest('.floating-ar-anchor') ||
          el.closest('#diagnostics-drawer') ||
          el.closest('button') ||
          el.closest('a')
        );
      };

      window.addEventListener('pointerdown', (e) => {
        if (!this.isActive) return;
        if (isUIElement(e.target)) return;

        this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this._lastPointer = { x: e.clientX, y: e.clientY };
        this._downPointer = { x: e.clientX, y: e.clientY, time: Date.now() };

        if (this._activePointers.size === 2 && this.activeSpecimen !== 'none') {
          const pts = Array.from(this._activePointers.values());
          this._pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const key = this.activeSpecimen === 'compare' ? this.focusedCompareCell : this.activeSpecimen;
          this._pinchStartScale = this.specimenTransform[key].scale;
        }

        // Viewpoint LOCKED -> drag rotates active cell; UNLOCKED -> drag rotates 3DoF lab viewpoint
        this._dragMode = (this.viewLocked && this.activeSpecimen !== 'none') ? 'cell' : 'camera';
      }, { passive: true });

      window.addEventListener('pointermove', (e) => {
        if (!this.isActive || !this._activePointers.has(e.pointerId)) return;

        this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // 2-finger pinch zoom on active specimen
        if (this._activePointers.size === 2 && this._pinchStartDist > 0 && this.activeSpecimen !== 'none') {
          const pts = Array.from(this._activePointers.values());
          const curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const key = this.activeSpecimen === 'compare' ? this.focusedCompareCell : this.activeSpecimen;
          this.specimenTransform[key].scale = Math.max(0.55, Math.min(2.2, this._pinchStartScale * (curDist / this._pinchStartDist)));
          this._applySpecimenVisibility();
          if (e.cancelable) e.preventDefault();
          return;
        }

        const dx = e.clientX - this._lastPointer.x;
        const dy = e.clientY - this._lastPointer.y;
        this._lastPointer = { x: e.clientX, y: e.clientY };

        if (this._dragMode === 'cell' && this.activeSpecimen !== 'none') {
          const key = this.activeSpecimen === 'compare' ? this.focusedCompareCell : this.activeSpecimen;
          const t = this.specimenTransform[key];
          t.rotY += dx * 0.012;
          t.rotX = Math.max(-1.1, Math.min(1.1, t.rotX + dy * 0.012));
          this._applySpecimenVisibility();
        } else if (!this.viewLocked) {
          this.viewTargetYaw = Math.max(-75, Math.min(75, this.viewTargetYaw + dx * 0.22));
          this.viewTargetPitch = Math.max(-35, Math.min(35, this.viewTargetPitch + dy * 0.18));
        }

        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      const onPointerUp = (e) => {
        if (!this.isActive) return;
        const wasTracked = this._activePointers.has(e.pointerId);
        this._activePointers.delete(e.pointerId);

        if (wasTracked && this._activePointers.size === 0) {
          const dist = Math.hypot(e.clientX - this._downPointer.x, e.clientY - this._downPointer.y);
          const dur = Date.now() - this._downPointer.time;
          if (dist < 10 && dur < 380) {
            this._handleTap(e.clientX, e.clientY);
          }
          this._dragMode = null;
          this._pinchStartDist = 0;
        }
      };

      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });

      // Desktop scroll wheel zoom when specimen is active
      window.addEventListener('wheel', (e) => {
        if (!this.isActive || this.activeSpecimen === 'none') return;
        if (isUIElement(e.target)) return;
        this.adjustZoom(e.deltaY < 0 ? 1.08 : 0.92);
      }, { passive: true });
    },

    /**
     * Handle tap raycasting on 3D cell organelles & lab specimen trays
     */
    _handleTap(clientX, clientY) {
      if (!this._raycaster || !this.camera || !this.renderer) return;
      const domEl = this.renderer.domElement;
      const rect = domEl && typeof domEl.getBoundingClientRect === 'function'
        ? domEl.getBoundingClientRect()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      if (!rect.width || !rect.height) return;
      this._pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this._pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this._raycaster.setFromCamera(this._pointerNDC, this.camera);

      // 1. Check active cell organelles first
      const activeTestObjects = [];
      if (this.activeSpecimen === 'animal' || this.activeSpecimen === 'compare') {
        activeTestObjects.push(...this.interactiveMeshes.animal);
      }
      if (this.activeSpecimen === 'plant' || this.activeSpecimen === 'compare') {
        activeTestObjects.push(...this.interactiveMeshes.plant);
      }

      if (activeTestObjects.length > 0) {
        const hits = this._raycaster.intersectObjects(activeTestObjects, false);
        if (hits.length > 0) {
          const ud = hits[0].object.userData || {};
          if (ud.labSpecimen) this.focusedCompareCell = ud.labSpecimen;
          if (ud.organelleId) {
            this.selectOrganelle(ud.organelleId, ud.labSpecimen || 'animal');
            return;
          }
        }
      }

      // 2. Check interactive lab trays / microscope
      const labHits = this._raycaster.intersectObjects(this.labClickables, false);
      if (labHits.length > 0) {
        const ud = labHits[0].object.userData || {};
        if (ud.labAction === 'select_specimen' && ud.cellType) {
          this.selectSpecimen(ud.cellType);
          return;
        }
        if (ud.labAction === 'focus_microscope' && this.activeSpecimen === 'none') {
          this.selectSpecimen('animal');
          return;
        }
      }

      this.clearOrganelleSelection(false);
    },

    /**
     * Per-frame update hooked into the existing MindAR Three.js render loop
     */
    update(nowMs) {
      if (!this.isActive || !this.labRoot) return;
      const t = (nowMs || performance.now()) * 0.001;

      // Smooth damped 3DoF viewpoint rotation of the lab world around the camera origin
      this.viewCurrentYaw += (this.viewTargetYaw - this.viewCurrentYaw) * 0.14;
      this.viewCurrentPitch += (this.viewTargetPitch - this.viewCurrentPitch) * 0.14;

      this.labRoot.rotation.order = 'YXZ';
      this.labRoot.rotation.y = this.viewCurrentYaw * DEG2RAD;
      this.labRoot.rotation.x = this.viewCurrentPitch * DEG2RAD;

      // Subtle ambient pulse on observation stage ring
      if (this.stageRingMesh) {
        const s = 1.0 + Math.sin(t * 2.2) * 0.035;
        this.stageRingMesh.scale.set(s, s, 1);
      }

      // Gentle ambient drift on laboratory particles
      if (this.particlesMesh) {
        this.particlesMesh.rotation.y = t * 0.04;
      }

      // Gentle idle rotation on displayed specimen when not actively dragging
      if (this._dragMode !== 'cell') {
        if (this.activeSpecimen === 'animal' || this.activeSpecimen === 'compare') {
          this.specimenTransform.animal.rotY += 0.0035;
        }
        if (this.activeSpecimen === 'plant' || this.activeSpecimen === 'compare') {
          this.specimenTransform.plant.rotY += 0.0035;
        }
        if (this.activeSpecimen !== 'none') {
          this._applySpecimenVisibility();
        }
      }
    }
  };

  global.VirtualBiologyLab = VirtualBiologyLab;
})(typeof window !== 'undefined' ? window : this);
