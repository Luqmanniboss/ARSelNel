/**
 * ARSelNel Interactive Guided Tour Engine (guided-tour.js)
 * HOTFIX 1.1: True SVG Cutout Mask (100% transparent target hole),
 * Anti-Collision Smart Tooltip Positioning, Non-stretching Content Box,
 * and Universal Accessible Help Button.
 */

(function (global) {
  'use strict';

  // SVG Icons dictionary for zero-dependency standalone rendering
  const TOUR_SVGS = {
    help: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    arrow_forward: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
    arrow_back: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    explore: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>'
  };

  class GuidedTourManager {
    constructor() {
      this.currentTour = null;
      this.currentStepIndex = 0;
      this.portalEl = null;
      this.svgCanvasEl = null;
      this.maskHoleEl = null;
      this.spotlightFrameEl = null;
      this.tooltipEl = null;
      this.activeTarget = null;
      this.animFrameId = null;
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleViewportUpdate = this.handleViewportUpdate.bind(this);
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.boot());
      } else {
        this.boot();
      }
    }

    boot() {
      this.createPortal();
      this.wireReplayButtons();

      const pageKey = this.detectCurrentPageKey();
      if (!pageKey) return;

      const configs = global.ARSELNEL_TOUR_CONFIGS || {};
      const config = configs[pageKey];
      if (config) {
        const state = this.getTourState(pageKey);
        if (!state.completed && !state.dontShowAgain) {
          setTimeout(() => {
            if (!this.isPageBusy() && !this.currentTour) {
              this.startTour(pageKey, false);
            }
          }, 850);
        }
      }
    }

    detectCurrentPageKey() {
      const path = location.pathname.toLowerCase();
      if (path.includes('halaman_utama')) return 'dashboard';
      if (path.includes('slaid_interaktif')) return 'slides';
      if (path.includes('nota_pembelajaran') || path.includes('butiran_nota')) return 'notes';
      if (path.includes('pemain_video')) return 'player';
      if (path.includes('perpustakaan_video')) return 'videos';
      if (path.includes('cellquest')) return 'cellquest';
      if (path.includes('selbot_ai')) return 'ai';
      if (path.includes('misi-makmal-sains')) return 'lab';
      if (path.includes('klasifikasi-sel')) return 'maze';
      if (path.includes('hab_permainan') || path.includes('permainan')) return 'games';
      if (path.includes('kotak_arselnel')) return 'kotak_arselnel';
      if (path.includes('profil')) return 'profile';
      if (path.includes('tetapan')) return 'settings';
      return null;
    }

    isPageBusy() {
      const modalOpen = document.querySelector('.modal.open, [role="dialog"]:not(.hidden):not(.ars-tour-portal):not(.ars-tour-tooltip)');
      return Boolean(modalOpen);
    }

    // ------------------------------------------------------------------------
    // User Storage & State Management (Isolated by User ID)
    // ------------------------------------------------------------------------
    getCurrentUserId() {
      try {
        if (global.AuthGuard && typeof global.AuthGuard.getUser === 'function') {
          const user = global.AuthGuard.getUser();
          if (user && user.id) return String(user.id);
        }
      } catch (_) {}
      return 'guest';
    }

    getStorageKey() {
      return `arselnel_guided_tour_${this.getCurrentUserId()}`;
    }

    getAllTourData() {
      try {
        const raw = localStorage.getItem(this.getStorageKey());
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return { userId: this.getCurrentUserId(), tours: {} };
    }

    getTourState(tourId) {
      const data = this.getAllTourData();
      return (data.tours && data.tours[tourId]) || {
        version: 1,
        completed: false,
        dontShowAgain: false,
        updatedAt: 0
      };
    }

    saveTourState(tourId, updates) {
      try {
        const data = this.getAllTourData();
        if (!data.tours) data.tours = {};
        data.tours[tourId] = {
          ...(data.tours[tourId] || { version: 1, completed: false, dontShowAgain: false }),
          ...updates,
          updatedAt: Date.now()
        };
        localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
      } catch (err) {
        console.warn('[ARSelNel Tour] Gagal menyimpan status tour:', err);
      }
    }

    // ------------------------------------------------------------------------
    // Portal & DOM Setup with True SVG Cutout Mask
    // ------------------------------------------------------------------------
    createPortal() {
      if (this.portalEl) return;

      const portal = document.createElement('div');
      portal.className = 'ars-tour-portal';
      portal.setAttribute('role', 'dialog');
      portal.setAttribute('aria-modal', 'true');
      portal.setAttribute('aria-label', 'Panduan Interaktif ARSELNEL');

      portal.innerHTML = `
        <!-- True SVG Cutout Mask (100% transparent hole over target) -->
        <svg class="ars-tour-svg-canvas" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <mask id="ars-tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect id="ars-tour-hole" x="0" y="0" width="0" height="0" rx="14" ry="14" fill="black" />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(15, 23, 42, 0.72)" mask="url(#ars-tour-mask)" data-tour-action="backdrop" />
        </svg>

        <!-- Glowing theme-accented border frame around the transparent hole -->
        <div class="ars-tour-spotlight-frame" id="ars-tour-spotlight-frame" aria-hidden="true"></div>

        <!-- Smart Tooltip Card (Content-sized, strictly non-stretching) -->
        <div class="ars-tour-tooltip" data-placement="bottom" tabindex="-1">
          <div class="ars-tour-arrow"></div>
          <div class="ars-tour-header">
            <div class="ars-tour-badge-group">
              <span class="ars-tour-mascot-pill">
                <span class="ars-tour-icon">${TOUR_SVGS.explore}</span>
                <span id="ars-tour-theme-label">Panduan</span>
              </span>
              <span class="ars-tour-step-counter" id="ars-tour-step-counter">1/1</span>
            </div>
            <button type="button" class="ars-tour-close-btn" data-tour-action="skip" title="Tutup Panduan (Esc)" aria-label="Tutup Panduan">
              ${TOUR_SVGS.close}
            </button>
          </div>
          <div class="ars-tour-progress-track" aria-hidden="true">
            <div class="ars-tour-progress-fill" id="ars-tour-progress-fill" style="width: 10%;"></div>
          </div>
          <h3 class="ars-tour-title" id="ars-tour-title"></h3>
          <p class="ars-tour-desc" id="ars-tour-desc"></p>
          <div class="ars-tour-tip-box" id="ars-tour-tip-box">
            <span style="flex-shrink:0; font-size:16px;">💡</span>
            <div id="ars-tour-tip-text"></div>
          </div>
          <div class="ars-tour-footer">
            <label class="ars-tour-optout-label">
              <input type="checkbox" id="ars-tour-dont-show" />
              <span>Jangan tunjuk lagi</span>
            </label>
            <div class="ars-tour-nav-buttons">
              <button type="button" class="ars-tour-btn ars-tour-btn-skip" data-tour-action="skip">Langkau</button>
              <button type="button" class="ars-tour-btn ars-tour-btn-prev" data-tour-action="prev" id="ars-tour-btn-prev">
                ${TOUR_SVGS.arrow_back}
                <span>Kembali</span>
              </button>
              <button type="button" class="ars-tour-btn ars-tour-btn-next" data-tour-action="next" id="ars-tour-btn-next">
                <span>Seterusnya</span>
                ${TOUR_SVGS.arrow_forward}
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(portal);

      this.portalEl = portal;
      this.svgCanvasEl = portal.querySelector('.ars-tour-svg-canvas');
      this.maskHoleEl = portal.querySelector('#ars-tour-hole');
      this.spotlightFrameEl = portal.querySelector('#ars-tour-spotlight-frame');
      this.tooltipEl = portal.querySelector('.ars-tour-tooltip');

      portal.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-tour-action]');
        if (!actionBtn) return;
        const action = actionBtn.getAttribute('data-tour-action');
        if (action === 'next') this.nextStep();
        else if (action === 'prev') this.prevStep();
        else if (action === 'skip') this.skipTour();
        else if (action === 'finish') this.finishTour();
      });

      const dontShowCb = portal.querySelector('#ars-tour-dont-show');
      if (dontShowCb) {
        dontShowCb.addEventListener('change', (e) => {
          if (this.currentTour) {
            this.saveTourState(this.currentTour.id, { dontShowAgain: e.target.checked });
          }
        });
      }
    }

    wireReplayButtons() {
      document.addEventListener('click', (e) => {
        const replayTrigger = e.target.closest('[data-ars-tour], .ars-tour-help-btn, .ars-tour-replay-trigger, .ars-tour-btn-replay');
        if (replayTrigger) {
          e.preventDefault();
          const specificId = replayTrigger.getAttribute('data-ars-tour') || this.detectCurrentPageKey();
          if (specificId) {
            this.startTour(specificId, true);
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // Tour Flow Control
    // ------------------------------------------------------------------------
    startTour(tourId, forceReplay = false) {
      const configs = global.ARSELNEL_TOUR_CONFIGS || {};
      const config = configs[tourId];
      if (!config || !Array.isArray(config.steps) || config.steps.length === 0) {
        console.warn(`[ARSelNel Tour] Tiada konfigurasi dijumpai bagi tour "${tourId}"`);
        return false;
      }

      this.currentTour = config;
      this.currentStepIndex = 0;

      const state = this.getTourState(tourId);
      const dontShowCb = this.portalEl ? this.portalEl.querySelector('#ars-tour-dont-show') : null;
      if (dontShowCb) {
        dontShowCb.checked = forceReplay ? false : Boolean(state.dontShowAgain);
      }

      this.createPortal();
      this.portalEl.classList.add('is-active');
      document.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('resize', this.handleViewportUpdate, { passive: true });
      window.addEventListener('scroll', this.handleViewportUpdate, { passive: true, capture: true });

      this.renderCurrentStep();
      return true;
    }

    renderCurrentStep() {
      if (!this.currentTour) return;

      const steps = this.currentTour.steps;
      if (this.currentStepIndex >= steps.length) {
        this.finishTour();
        return;
      }

      const step = steps[this.currentStepIndex];
      const targetEl = this.findTargetElement(step.target);

      if (!targetEl) {
        console.info(`[ARSelNel Tour] Sasaran "${step.target}" tidak kelihatan. Melangkau langkah.`);
        this.currentStepIndex++;
        if (this.currentStepIndex < steps.length) {
          this.renderCurrentStep();
        } else {
          this.finishTour();
        }
        return;
      }

      this.activeTarget = targetEl;

      // Scroll target into view
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch (_) {}

      // Update DOM Text & UI
      const totalSteps = steps.length;
      const currentHuman = this.currentStepIndex + 1;
      const progressPercent = Math.round((currentHuman / totalSteps) * 100);

      const counterEl = this.portalEl.querySelector('#ars-tour-step-counter');
      const progressFill = this.portalEl.querySelector('#ars-tour-progress-fill');
      const titleEl = this.portalEl.querySelector('#ars-tour-title');
      const descEl = this.portalEl.querySelector('#ars-tour-desc');
      const tipBox = this.portalEl.querySelector('#ars-tour-tip-box');
      const tipText = this.portalEl.querySelector('#ars-tour-tip-text');
      const themeLabel = this.portalEl.querySelector('#ars-tour-theme-label');
      const prevBtn = this.portalEl.querySelector('#ars-tour-btn-prev');
      const nextBtn = this.portalEl.querySelector('#ars-tour-btn-next');

      if (counterEl) counterEl.textContent = `${currentHuman}/${totalSteps}`;
      if (progressFill) progressFill.style.width = `${progressPercent}%`;
      if (titleEl) titleEl.textContent = step.title;
      if (descEl) descEl.textContent = step.desc;

      if (tipBox && tipText) {
        if (step.tip) {
          tipBox.style.display = 'flex';
          tipText.innerHTML = `<strong>Tip Saintis Muda:</strong> ${step.tip}`;
        } else {
          tipBox.style.display = 'none';
        }
      }

      if (themeLabel) {
        themeLabel.textContent = this.currentTour.title ? this.currentTour.title.split(' ')[1] || 'Panduan' : 'Panduan';
      }

      if (prevBtn) {
        if (this.currentStepIndex === 0) {
          prevBtn.setAttribute('disabled', 'true');
        } else {
          prevBtn.removeAttribute('disabled');
        }
      }

      if (nextBtn) {
        if (this.currentStepIndex === totalSteps - 1) {
          nextBtn.innerHTML = `<span>Selesai</span>${TOUR_SVGS.check}`;
          nextBtn.setAttribute('data-tour-action', 'finish');
          nextBtn.classList.add('ars-tour-btn-finish');
          nextBtn.classList.remove('ars-tour-btn-next');
        } else {
          nextBtn.innerHTML = `<span>Seterusnya</span>${TOUR_SVGS.arrow_forward}`;
          nextBtn.setAttribute('data-tour-action', 'next');
          nextBtn.classList.remove('ars-tour-btn-finish');
          nextBtn.classList.add('ars-tour-btn-next');
        }
      }

      // Reset height explicitly before measuring
      if (this.tooltipEl) {
        this.tooltipEl.style.height = 'auto';
      }

      setTimeout(() => {
        this.updateGeometry();
        if (this.tooltipEl) {
          this.tooltipEl.classList.add('is-positioned');
          this.tooltipEl.focus();
        }
      }, 140);
    }

    findTargetElement(selector) {
      if (!selector) return null;
      const parts = selector.split(',').map(s => s.trim());
      for (const sel of parts) {
        try {
          const candidate = document.querySelector(sel);
          if (candidate && this.isElementVisible(candidate)) {
            return candidate;
          }
        } catch (_) {}
      }
      return null;
    }

    isElementVisible(el) {
      if (!el || !(el instanceof HTMLElement)) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    // ------------------------------------------------------------------------
    // Geometry & Positioning: True Cutout & Non-Overlapping Tooltip
    // ------------------------------------------------------------------------
    updateGeometry() {
      if (!this.activeTarget || !this.tooltipEl) return;

      const rect = this.activeTarget.getBoundingClientRect();
      const padding = 10;
      const top = Math.max(0, rect.top - padding);
      const left = Math.max(0, rect.left - padding);
      const width = Math.min(window.innerWidth - left, rect.width + padding * 2);
      const height = Math.min(window.innerHeight - top, rect.height + padding * 2);
      const radius = 14;

      // 1. Cut the 100% transparent hole in SVG mask
      if (this.maskHoleEl) {
        this.maskHoleEl.setAttribute('x', String(Math.round(left)));
        this.maskHoleEl.setAttribute('y', String(Math.round(top)));
        this.maskHoleEl.setAttribute('width', String(Math.round(width)));
        this.maskHoleEl.setAttribute('height', String(Math.round(height)));
        this.maskHoleEl.setAttribute('rx', String(radius));
        this.maskHoleEl.setAttribute('ry', String(radius));
      }

      // 2. Position glowing border frame around the hole
      if (this.spotlightFrameEl) {
        this.spotlightFrameEl.style.top = `${Math.round(top)}px`;
        this.spotlightFrameEl.style.left = `${Math.round(left)}px`;
        this.spotlightFrameEl.style.width = `${Math.round(width)}px`;
        this.spotlightFrameEl.style.height = `${Math.round(height)}px`;
        this.spotlightFrameEl.style.borderRadius = `${radius}px`;
      }

      // 3. Measure content-sized tooltip
      this.tooltipEl.style.height = 'auto';
      const tooltipRect = this.tooltipEl.getBoundingClientRect();
      const vWidth = window.innerWidth;
      const vHeight = window.innerHeight;
      const gap = 14;
      const pad = 12;

      const spaceAbove = top;
      const spaceBelow = vHeight - (top + height);
      const spaceLeft = left;
      const spaceRight = vWidth - (left + width);

      const step = this.currentTour ? this.currentTour.steps[this.currentStepIndex] : {};
      const preferredPlacement = step.placement || 'bottom';
      let placement = preferredPlacement;

      // Anti-Overlap Smart Placement Selection
      if (vWidth <= 640) {
        // Mobile: Vertical only
        if (spaceBelow >= tooltipRect.height + gap) {
          placement = 'bottom';
        } else if (spaceAbove >= tooltipRect.height + gap) {
          placement = 'top';
        } else {
          placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
        }
      } else {
        // Desktop / Tablet
        if (preferredPlacement === 'bottom' && spaceBelow < tooltipRect.height + gap) {
          if (spaceAbove >= tooltipRect.height + gap) placement = 'top';
          else if (spaceRight >= tooltipRect.width + gap) placement = 'right';
          else if (spaceLeft >= tooltipRect.width + gap) placement = 'left';
        } else if (preferredPlacement === 'top' && spaceAbove < tooltipRect.height + gap) {
          if (spaceBelow >= tooltipRect.height + gap) placement = 'bottom';
          else if (spaceRight >= tooltipRect.width + gap) placement = 'right';
          else if (spaceLeft >= tooltipRect.width + gap) placement = 'left';
        } else if (preferredPlacement === 'right' && spaceRight < tooltipRect.width + gap) {
          if (spaceLeft >= tooltipRect.width + gap) placement = 'left';
          else if (spaceBelow >= tooltipRect.height + gap) placement = 'bottom';
          else if (spaceAbove >= tooltipRect.height + gap) placement = 'top';
        } else if (preferredPlacement === 'left' && spaceLeft < tooltipRect.width + gap) {
          if (spaceRight >= tooltipRect.width + gap) placement = 'right';
          else if (spaceBelow >= tooltipRect.height + gap) placement = 'bottom';
          else if (spaceAbove >= tooltipRect.height + gap) placement = 'top';
        }
      }

      let toolTop = 0;
      let toolLeft = 0;

      if (placement === 'bottom') {
        toolTop = top + height + gap;
        toolLeft = left;
      } else if (placement === 'top') {
        toolTop = top - tooltipRect.height - gap;
        toolLeft = left;
      } else if (placement === 'right') {
        toolLeft = left + width + gap;
        toolTop = top;
      } else if (placement === 'left') {
        toolLeft = left - tooltipRect.width - gap;
        toolTop = top;
      }

      // Viewport Clamping
      if (toolLeft + tooltipRect.width > vWidth - pad) {
        toolLeft = vWidth - tooltipRect.width - pad;
      }
      if (toolLeft < pad) {
        toolLeft = pad;
      }
      if (toolTop + tooltipRect.height > vHeight - pad) {
        toolTop = vHeight - tooltipRect.height - pad;
      }
      if (toolTop < pad) {
        toolTop = pad;
      }

      // STRICT COLLISION AVOIDANCE
      // Ensure tooltip coordinates do not intersect with spotlight bounds
      if (placement === 'bottom' && toolTop < top + height + 6) {
        toolTop = top + height + 6;
      }
      if (placement === 'top' && toolTop + tooltipRect.height > top - 6) {
        toolTop = Math.max(pad, top - tooltipRect.height - 6);
      }

      this.tooltipEl.style.top = `${Math.round(toolTop)}px`;
      this.tooltipEl.style.left = `${Math.round(toolLeft)}px`;
      this.tooltipEl.setAttribute('data-placement', placement);
    }

    handleViewportUpdate() {
      if (!this.currentTour || !this.activeTarget) return;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame(() => this.updateGeometry());
    }

    handleKeyDown(e) {
      if (!this.currentTour) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          this.nextStep();
        }
      } else if (e.key === 'ArrowLeft') {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          this.prevStep();
        }
      }
    }

    goToStep(stepIndex) {
      if (!this.currentTour) return;
      if (stepIndex >= 0 && stepIndex < this.currentTour.steps.length) {
        this.currentStepIndex = stepIndex;
        this.renderCurrentStep();
      }
    }

    nextStep() {
      if (!this.currentTour) return;
      const totalSteps = this.currentTour.steps.length;
      if (this.currentStepIndex < totalSteps - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
      } else {
        this.finishTour();
      }
    }

    prevStep() {
      if (!this.currentTour) return;
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--;
        this.renderCurrentStep();
      }
    }

    skipTour() {
      if (!this.currentTour) return;
      const dontShowCb = this.portalEl ? this.portalEl.querySelector('#ars-tour-dont-show') : null;
      const isDontShow = dontShowCb ? dontShowCb.checked : false;
      this.saveTourState(this.currentTour.id, {
        dontShowAgain: isDontShow
      });
      this.closeTour();
    }

    finishTour() {
      if (!this.currentTour) return;
      const dontShowCb = this.portalEl ? this.portalEl.querySelector('#ars-tour-dont-show') : null;
      const isDontShow = dontShowCb ? dontShowCb.checked : false;
      this.saveTourState(this.currentTour.id, {
        completed: true,
        dontShowAgain: isDontShow
      });
      this.closeTour();
    }

    closeTour() {
      if (this.portalEl) {
        this.portalEl.classList.remove('is-active');
        if (this.tooltipEl) this.tooltipEl.classList.remove('is-positioned');
      }
      document.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('resize', this.handleViewportUpdate);
      window.removeEventListener('scroll', this.handleViewportUpdate, true);
      this.currentTour = null;
      this.activeTarget = null;
    }
  }

  const tourInstance = new GuidedTourManager();
  global.ArselnelTour = tourInstance;
  global.__ARSELNEL_TOUR__ = tourInstance;

})(typeof window !== 'undefined' ? window : this);
