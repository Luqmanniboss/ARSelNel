/**
 * scripts/apply_multi_theme_css.js
 * Applies the clean, scoped, non-leaking multi-theme overlay styles with
 * WCAG AAA/AA high contrast text readability.
 */
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'kotak_arselnel', 'kotak-arselnel.css');
let css = fs.readFileSync(cssPath, 'utf8');

const marker1 = '/* ==============================================================================\n   ARSELNEL — FASA UI LIGHT OVERLAY REDESIGN';
const marker2 = '/* ==============================================================================\n   ARSELNEL — FASA UI MULTI-THEME OVERLAY';
let markerPos = css.indexOf(marker1);
if (markerPos === -1) {
  markerPos = css.indexOf(marker2);
}

if (markerPos === -1) {
  console.error('Marker not found in CSS file!');
  process.exit(1);
}

// Slice everything before markerPos
const baseCSS = css.substring(0, markerPos);

const multiThemeCSS = `/* ==============================================================================
   ARSELNEL — FASA UI MULTI-THEME OVERLAY & WCAG CONTRAST HOTFIX (FASA 4E-E.1)
   Identiti Warna Bebas & Keterbacaan Teks Maksimum (WCAG AAA/AA):
   - Global Text: Primary (#0F172A), Secondary (#334155), Muted (#475569)
   - Video: Jingga (#F97316 / #EA580C / #FFF0E3 / #FFF7ED / #FED7AA / Label #9A3412)
   - Nota: Hijau (#22C55E / #16A34A / #E8FBEF / #F0FDF4 / #BBF7D0 / Label #166534)
   - Kuiz: Ungu (#A855F7 / #9333EA / #F3E8FF / #FAF5FF / #E9D5FF / Label #6B21A8)
   - CellQuest 3D: Sian (#06B6D4 / #0891B2 / #E0F7FF / #ECFEFF / #A5F3FC / Label #155E75)
   - Butang Tindakan: Alih (Biru), Tukar (Ungu), Semat (Kuning), Tutup (Merah), Tutup Kamera (Biru Cair)
   ============================================================================== */

:root {
  /* Global Typography System (WCAG AAA/AA High Contrast) */
  --theme-text-main: #0F172A;
  --theme-text-secondary: #334155;
  --theme-text-muted: #475569;
  --theme-text-disabled: #64748B;

  /* Modul 1: Video (Jingga) */
  --video-border: #F97316;
  --video-header: #EA580C;
  --video-panel-bg: #FFF0E3;
  --video-card-bg: #FFF7ED;
  --video-card-border: #FED7AA;
  --video-status-bg: #FFEDD5;
  --video-status-border: #FED7AA;
  --video-status-text: #9A3412;
  --video-status-dot: #EA580C;
  --video-size-active: #EA580C;
  --video-accent-label: #9A3412;

  /* Modul 2: Nota (Hijau) */
  --nota-border: #22C55E;
  --nota-header: #16A34A;
  --nota-panel-bg: #E8FBEF;
  --nota-card-bg: #F0FDF4;
  --nota-card-border: #BBF7D0;
  --nota-status-bg: #DCFCE7;
  --nota-status-border: #86EFAC;
  --nota-status-text: #166534;
  --nota-status-dot: #16A34A;
  --nota-size-active: #16A34A;
  --nota-accent-label: #166534;

  /* Modul 3: Kuiz (Ungu) */
  --kuiz-border: #A855F7;
  --kuiz-header: #9333EA;
  --kuiz-panel-bg: #F3E8FF;
  --kuiz-card-bg: #FAF5FF;
  --kuiz-card-border: #E9D5FF;
  --kuiz-status-bg: #F3E8FF;
  --kuiz-status-border: #D8B4FE;
  --kuiz-status-text: #6B21A8;
  --kuiz-status-dot: #9333EA;
  --kuiz-size-active: #9333EA;
  --kuiz-accent-label: #6B21A8;

  /* Modul 4: CellQuest 3D (Sian) */
  --cq-border: #06B6D4;
  --cq-header: #0891B2;
  --cq-panel-bg: rgba(224, 247, 255, 0.96);
  --cq-card-bg: #ECFEFF;
  --cq-card-border: #A5F3FC;
  --cq-status-bg: #CFFAFE;
  --cq-status-border: #A5F3FC;
  --cq-status-text: #155E75;
  --cq-status-dot: #0891B2;
  --cq-accent-label: #155E75;

  /* Butang Tindakan Mengikut Fungsi */
  --btn-blue-action: #2563EB;
  --btn-purple-action: #7C3AED;
  --btn-yellow-action: #FACC15;
  --btn-red-action: #EF4444;
  --btn-cam-action-bg: #DBEAFE;
  --btn-cam-action-border: #93C5FD;
  --btn-cam-action-text: #1D4ED8;
}

/* =============================================================================
   1. GLOBAL HIGH-CONTRAST TYPOGRAPHY BASE RULES
   ============================================================================= */
.floating-card-container,
.pov-card-theme,
.pov-panel-container {
  color: #0F172A !important;
}

.floating-card-container h1,
.floating-card-container h2,
.floating-card-container h3,
.floating-card-container h4,
.pov-card-theme h1,
.pov-card-theme h2,
.pov-card-theme h3,
.pov-card-theme h4 {
  color: #0F172A !important;
  font-weight: 800 !important;
}

.floating-card-container p,
.pov-card-theme p {
  color: #334155 !important;
  font-weight: 500 !important;
}

/* Common Telemetry HUD Chip Styles */
.pov-telemetry-hud-strip {
  border-radius: 14px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}
.hud-chip {
  color: #475569 !important;
  font-weight: 700 !important;
}
.hud-chip-label {
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 11px !important;
}
.hud-chip-val {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 11.5px !important;
}

/* Pinned Size Controls */
.size-controls-group .tool-label {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 11px !important;
}

.size-segmented-control {
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  border-radius: 12px !important;
  padding: 2px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
}

.btn-size {
  color: #334155 !important;
  font-weight: 800 !important;
  border-radius: 8px !important;
}
.btn-size:hover {
  background: #F1F5F9 !important;
  color: #0F172A !important;
}

/* =============================================================================
   2. TOP HUD & MULTI-PANEL TOOLBAR (LIGHT THEME)
   ============================================================================= */
.ar-top-hud {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 100%) !important;
}

#btn-back-dashboard {
  background: #0F172A !important;
  color: #FFFFFF !important;
  border: 1.5px solid #1E293B !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25) !important;
  font-weight: 700 !important;
}
#btn-back-dashboard:hover {
  background: #1E293B !important;
}

.ar-title-badge {
  background: #FFFFFF !important;
  border: 1.5px solid #FED7AA !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.12) !important;
}
.ar-title-badge span {
  color: #0F172A !important;
  font-weight: 800 !important;
}
.ar-title-badge .logo-dot {
  background: #F97316 !important;
  box-shadow: 0 0 8px #F97316 !important;
}

#btn-toggle-diagnostics {
  background: #FFFFFF !important;
  border: 1.5px solid #0D9488 !important;
  color: #0F766E !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15) !important;
}
#btn-toggle-diagnostics:hover {
  background: #F0FDFA !important;
}

#btn-open-marker {
  background: #0F172A !important;
  color: #FFFFFF !important;
  border: 1.5px solid #1E293B !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25) !important;
  font-weight: 700 !important;
}
#btn-open-marker:hover {
  background: #1E293B !important;
}

/* Multi-Panel Bar */
.ar-multi-panel-bar {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1.5px solid #93C5FD !important;
  border-radius: 9999px !important;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04) !important;
  padding: 6px 14px !important;
}

.btn-multi-add {
  background: #2563EB !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  border-radius: 9999px !important;
  border: none !important;
  padding: 7px 18px !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
  transition: all 0.2s ease !important;
}
.btn-multi-add:hover {
  background: #1D4ED8 !important;
  transform: translateY(-1px);
}
.btn-multi-add:active {
  background: #1E40AF !important;
  transform: translateY(0);
}

.multi-panel-badge-count {
  background: #F0F9FF !important;
  border: 1.5px solid #BAE6FD !important;
  border-radius: 9999px !important;
  padding: 4px 12px !important;
  color: #0369A1 !important;
  font-weight: 800 !important;
  font-size: 12px !important;
}

.multi-pill.pill-nota {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
  font-weight: 800 !important;
  border-radius: 9999px !important;
}
.multi-pill.pill-nota:hover, .multi-pill.pill-nota.active-focus {
  background: #BBF7D0 !important;
  color: #14532D !important;
}

.multi-pill.pill-video {
  background: #FFEDD5 !important;
  border: 1px solid #FED7AA !important;
  color: #9A3412 !important;
  font-weight: 800 !important;
  border-radius: 9999px !important;
}
.multi-pill.pill-video:hover, .multi-pill.pill-video.active-focus {
  background: #FDBA74 !important;
  color: #7C2D12 !important;
}

.multi-pill.pill-kuiz {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  font-weight: 800 !important;
  border-radius: 9999px !important;
}
.multi-pill.pill-kuiz:hover, .multi-pill.pill-kuiz.active-focus {
  background: #E9D5FF !important;
  color: #581C87 !important;
}

.multi-pill.pill-cellquest {
  background: #CFFAFE !important;
  border: 1px solid #A5F3FC !important;
  color: #155E75 !important;
  font-weight: 800 !important;
  border-radius: 9999px !important;
}
.multi-pill.pill-cellquest:hover, .multi-pill.pill-cellquest.active-focus {
  background: #BAE6FD !important;
  color: #0E7490 !important;
}

.multi-pill .pill-close-btn {
  background: transparent !important;
  color: #EF4444 !important;
  font-weight: 900 !important;
  opacity: 0.9 !important;
}
.multi-pill .pill-close-btn:hover {
  background: #FEE2E2 !important;
  color: #DC2626 !important;
  opacity: 1 !important;
}

/* Butang Tutup Kamera (Biru Cair #DBEAFE across all modules) */
.btn-cam-toggle {
  background: #DBEAFE !important;
  border: 1.5px solid #93C5FD !important;
  color: #1D4ED8 !important;
  font-weight: 800 !important;
  border-radius: 12px !important;
  min-height: 38px !important;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.1) !important;
  transition: all 0.2s ease !important;
}
.btn-cam-toggle:hover {
  background: #BFDBFE !important;
  color: #1E40AF !important;
  transform: translateY(-1px);
}
.btn-cam-toggle:active {
  background: #93C5FD !important;
  transform: translateY(0);
}
.btn-cam-toggle.is-cam-off {
  background: #FEE2E2 !important;
  border-color: #FCA5A5 !important;
  color: #DC2626 !important;
}

/* =============================================================================
   3. UNIVERSAL STICKY FOOTER ACTION BUTTONS
   ============================================================================= */
.panel-sticky-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
  padding-top: 12px !important;
  background: transparent !important;
}

.player-actions-bar {
  display: flex !important;
  gap: 10px !important;
  align-items: center !important;
  justify-content: space-between !important;
}

/* Action 1: Alih / Letak Semula -> Biru #2563EB */
.btn-place-video,
.btn-place-nota,
.btn-place-kuiz,
#pov-btn-anchor,
#pov-nota-btn-anchor,
#pov-kuiz-btn-anchor {
  background: #2563EB !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 14px !important;
  min-height: 44px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35) !important;
  transition: all 0.2s ease !important;
}
.btn-place-video:hover,
.btn-place-nota:hover,
.btn-place-kuiz:hover,
#pov-btn-anchor:hover,
#pov-nota-btn-anchor:hover,
#pov-kuiz-btn-anchor:hover {
  background: #1D4ED8 !important;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.45) !important;
  transform: translateY(-1px) !important;
}
.btn-place-video:active,
.btn-place-nota:active,
.btn-place-kuiz:active,
#pov-btn-anchor:active,
#pov-nota-btn-anchor:active,
#pov-kuiz-btn-anchor:active {
  background: #1E40AF !important;
  transform: translateY(0) !important;
}

/* Action 2: Tukar Video / Tukar Nota / Tukar Kuiz -> Ungu #7C3AED */
#pov-nota-btn-change-content,
#pov-btn-change-video,
#btn-change-video,
#pov-kuiz-btn-change-content {
  background: #7C3AED !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 14px !important;
  min-height: 44px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35) !important;
  transition: all 0.2s ease !important;
}
#pov-nota-btn-change-content:hover,
#pov-btn-change-video:hover,
#btn-change-video:hover,
#pov-kuiz-btn-change-content:hover {
  background: #6D28D9 !important;
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45) !important;
  transform: translateY(-1px) !important;
}
#pov-nota-btn-change-content:active,
#pov-btn-change-video:active,
#btn-change-video:active,
#pov-kuiz-btn-change-content:active {
  background: #5B21B6 !important;
  transform: translateY(0) !important;
}

/* Action 3: Semat Skrin -> Kuning #FACC15 dengan teks gelap #0F172A */
#pov-nota-btn-back-pinned,
#pov-btn-back-pinned,
#pov-kuiz-btn-back-pinned,
#btn-place-video {
  background: #FACC15 !important;
  color: #0F172A !important;
  border: none !important;
  border-radius: 14px !important;
  min-height: 44px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 14px rgba(250, 204, 21, 0.4) !important;
  transition: all 0.2s ease !important;
}
#pov-nota-btn-back-pinned span,
#pov-btn-back-pinned span,
#pov-kuiz-btn-back-pinned span,
#btn-place-video span {
  color: #0F172A !important;
  font-weight: 800 !important;
}
#pov-nota-btn-back-pinned:hover,
#pov-btn-back-pinned:hover,
#pov-kuiz-btn-back-pinned:hover,
#btn-place-video:hover {
  background: #EAB308 !important;
  box-shadow: 0 6px 18px rgba(250, 204, 21, 0.5) !important;
  transform: translateY(-1px) !important;
}
#pov-nota-btn-back-pinned:active,
#pov-btn-back-pinned:active,
#pov-kuiz-btn-back-pinned:active,
#btn-place-video:active {
  background: #CA8A04 !important;
  transform: translateY(0) !important;
}

/* Action 4: Tutup -> Merah #EF4444 */
.btn-close-panel,
#pov-nota-btn-close,
#pov-btn-close,
#pov-kuiz-btn-close,
#btn-close-panel {
  background: #EF4444 !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 14px !important;
  min-height: 44px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35) !important;
  transition: all 0.2s ease !important;
}
.btn-close-panel:hover,
#pov-nota-btn-close:hover,
#pov-btn-close:hover,
#pov-kuiz-btn-close:hover,
#btn-close-panel:hover {
  background: #DC2626 !important;
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45) !important;
  transform: translateY(-1px) !important;
}
.btn-close-panel:active,
#pov-nota-btn-close:active,
#pov-btn-close:active,
#pov-kuiz-btn-close:active,
#btn-close-panel:active {
  background: #B91C1C !important;
  transform: translateY(0) !important;
}

/* =============================================================================
   4. MODUL 1: VIDEO (JINGGA / ORANGE THEME)
   ============================================================================= */

/* Panel Video Outer Card Container */
#pov-panel-video .floating-card-container,
.pov-card-video,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) {
  background: #FFF0E3 !important;
  border: 2px solid #F97316 !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 32px -4px rgba(249, 115, 22, 0.25), 0 4px 12px rgba(0, 0, 0, 0.04) !important;
  color: #0F172A !important;
}

/* Video Header Divider */
#pov-panel-video .panel-fixed-header,
.pov-header-video {
  border-bottom: 1px solid #FED7AA !important;
}

/* Video Header Tag (#EA580C) */
#pov-panel-video .category-tag,
#pov-panel-video .pov-tag-video,
.category-tag.tag-video,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .category-tag {
  background: #EA580C !important;
  color: #FFFFFF !important;
  border-radius: 9999px !important;
  border: none !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35) !important;
}

/* Video Status Sensor (Jingga Pastel) */
#pov-panel-video .pov-sensor-pill,
#pov-sensor-pill,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .pov-sensor-pill {
  background: #FFEDD5 !important;
  border: 1px solid #FED7AA !important;
  color: #9A3412 !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
}
#pov-panel-video .pov-sensor-pill .ping,
#pov-sensor-ping,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .ping {
  background: #EA580C !important;
  box-shadow: 0 0 6px #EA580C !important;
}

/* Video Size S/M/L Active Button (#EA580C) */
#pov-panel-video .btn-size.is-active,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .btn-size.is-active {
  background: #EA580C !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4) !important;
}

/* Video Kad Dalaman (#FFF7ED, Border #FED7AA) */
#pov-panel-video .active-video-details,
#pov-panel-video .ar-video-item,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .active-video-details,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .ar-video-item {
  background: #FFF7ED !important;
  border: 1.5px solid #FED7AA !important;
  border-radius: 16px !important;
  padding: 14px !important;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.06) !important;
}
#pov-panel-video .active-video-details h3,
#pov-panel-video .ar-video-item h4,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .active-video-details h3,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .ar-video-item h4 {
  color: #0F172A !important;
  font-weight: 800 !important;
}
#pov-panel-video .active-video-details p,
#pov-panel-video .ar-video-item p,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .active-video-details p,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .ar-video-item p {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 13px !important;
}
#pov-panel-video .video-meta,
#pov-panel-video .video-duration,
#pov-panel-video .video-author,
#floating-card-container:not(.module-nota):not(.module-kuiz):not(.module-cellquest) .video-meta {
  color: #9A3412 !important;
  font-weight: 700 !important;
}
#pov-panel-video .btn-choose-video {
  background: #EA580C !important;
  color: #FFFFFF !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}

/* Video Telemetry Strip & Status Banner */
#pov-panel-video .pov-telemetry-hud-strip {
  background: #FFF7ED !important;
  border: 1.5px solid #FED7AA !important;
}
#pov-panel-video .hud-chip-icon {
  color: #9A3412 !important;
}
#pov-panel-video .status-chip {
  background: #FFEDD5 !important;
  border: 1px solid #FED7AA !important;
  color: #9A3412 !important;
  border-radius: 9999px !important;
  font-weight: 800 !important;
}
#pov-panel-video .pov-status-banner {
  background: #FFEDD5 !important;
  border: 1.5px solid #FED7AA !important;
  border-radius: 14px !important;
  color: #9A3412 !important;
  font-weight: 700 !important;
}
#pov-panel-video .pov-status-banner .banner-icon {
  color: #EA580C !important;
}

/* =============================================================================
   5. MODUL 2: NOTA (HIJAU / GREEN THEME)
   ============================================================================= */

/* Panel Nota Outer Card Container */
#pov-panel-nota .floating-card-container,
.pov-card-nota,
#floating-card-container.module-nota {
  background: #E8FBEF !important;
  border: 2px solid #22C55E !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 32px -4px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(0, 0, 0, 0.04) !important;
  color: #0F172A !important;
}

/* Nota Header Divider */
#pov-panel-nota .panel-fixed-header,
.pov-header-nota {
  border-bottom: 1px solid #BBF7D0 !important;
}

/* Nota Header Tag (#16A34A) */
#pov-panel-nota .category-tag,
#pov-panel-nota .pov-tag-nota,
.category-tag.tag-nota,
#floating-card-container.module-nota .category-tag {
  background: #16A34A !important;
  color: #FFFFFF !important;
  border-radius: 9999px !important;
  border: none !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35) !important;
}

/* Nota Status Sensor (Hijau Pastel) */
#pov-panel-nota .pov-sensor-pill,
#pov-nota-sensor-pill,
#floating-card-container.module-nota .pov-sensor-pill {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
}
#pov-panel-nota .pov-sensor-pill .ping,
#pov-nota-sensor-ping,
#floating-card-container.module-nota .ping {
  background: #16A34A !important;
  box-shadow: 0 0 6px #16A34A !important;
}

/* Nota Size S/M/L Active Button (#16A34A) */
#pov-panel-nota .btn-size.is-active,
#floating-card-container.module-nota .btn-size.is-active {
  background: #16A34A !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.4) !important;
}

/* Nota Selection View Header (Fix for faded title/subtitle) */
#pov-panel-nota .selection-title-box,
#floating-card-container.module-nota .selection-title-box,
.selection-title-box.nota-title-box {
  background: #F0FDF4 !important;
  border: 1.5px solid #BBF7D0 !important;
  border-radius: 16px !important;
  padding: 12px 14px !important;
}
#pov-panel-nota .selection-title-box h3,
#floating-card-container.module-nota .selection-title-box h3,
.selection-title-box.nota-title-box h3 {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 16px !important;
}
#pov-panel-nota .selection-title-box p,
#floating-card-container.module-nota .selection-title-box p,
.selection-title-box.nota-title-box p {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 12.5px !important;
}

/* Nota List Item Cards */
#pov-panel-nota .nota-item-card,
#floating-card-container.module-nota .nota-item-card,
.nota-item-card {
  background: #F0FDF4 !important;
  border: 1.5px solid #BBF7D0 !important;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.06) !important;
  padding: 12px 14px !important;
}
#pov-panel-nota .nota-card-title,
#floating-card-container.module-nota .nota-card-title,
.nota-item-card .nota-card-title {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 14px !important;
}
#pov-panel-nota .nota-card-desc,
#floating-card-container.module-nota .nota-card-desc,
.nota-item-card .nota-card-desc {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  line-height: 1.45 !important;
}
#pov-panel-nota .nota-card-chapter,
#floating-card-container.module-nota .nota-card-chapter,
.nota-item-card .nota-card-chapter {
  color: #166534 !important;
  font-weight: 800 !important;
  font-size: 11px !important;
}
#pov-panel-nota .nota-card-time,
#floating-card-container.module-nota .nota-card-time,
.nota-item-card .nota-card-time {
  color: #475569 !important;
  font-weight: 700 !important;
  font-size: 11px !important;
}
#pov-panel-nota .nota-card-icon-wrap,
#floating-card-container.module-nota .nota-card-icon-wrap,
.nota-item-card .nota-card-icon-wrap {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
}

/* Nota Reader View */
#pov-panel-nota .nota-content-wrapper,
#floating-card-container.module-nota .nota-content-wrapper {
  background: #F0FDF4 !important;
  border: 1.5px solid #BBF7D0 !important;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.06) !important;
  padding: 16px !important;
}
#pov-panel-nota .nota-content-header {
  border-bottom: 1px solid #BBF7D0 !important;
  padding-bottom: 12px !important;
  margin-bottom: 14px !important;
}
#pov-panel-nota .nota-chapter-badge {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
  font-weight: 800 !important;
  border-radius: 8px !important;
}
#pov-panel-nota .nota-type-badge {
  background: #FFE4E6 !important;
  border: 1px solid #FECDD3 !important;
  color: #9F1239 !important;
  font-weight: 800 !important;
  border-radius: 8px !important;
}
#pov-panel-nota .nota-time-badge {
  background: #F1F5F9 !important;
  border: 1px solid #CBD5E1 !important;
  color: #334155 !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}
#pov-panel-nota .nota-title {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 20px !important;
}
#pov-panel-nota .nota-body-rendered {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 1.65 !important;
}
#pov-panel-nota .nota-body-rendered h1,
#pov-panel-nota .nota-body-rendered h2,
#pov-panel-nota .nota-body-rendered h3,
#pov-panel-nota .nota-body-rendered h4 {
  color: #0F172A !important;
  font-weight: 800 !important;
}

/* Nota Reader Toolbar */
#pov-panel-nota .nota-reader-toolbar {
  background: #F0FDF4 !important;
  border: 1.5px solid #BBF7D0 !important;
  border-radius: 14px !important;
}
#pov-panel-nota #btn-nota-prev,
#pov-panel-nota #pov-btn-nota-prev {
  background: #FFFFFF !important;
  border: 1px solid #CBD5E1 !important;
  color: #334155 !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
}
#pov-panel-nota .nota-page-indicator {
  color: #166534 !important;
  font-weight: 800 !important;
  font-size: 13.5px !important;
}
#pov-panel-nota #btn-nota-next,
#pov-panel-nota #pov-btn-nota-next {
  background: #16A34A !important;
  border: 1px solid #15803D !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3) !important;
}
#pov-panel-nota .btn-zoom,
#pov-panel-nota .btn-zoom-reset,
#pov-panel-nota .btn-nota-open-full {
  background: #FFFFFF !important;
  border: 1px solid #BBF7D0 !important;
  color: #166534 !important;
  font-weight: 800 !important;
  border-radius: 8px !important;
}

/* Nota Telemetry Strip & Status Banner */
#pov-panel-nota .pov-telemetry-hud-strip {
  background: #F0FDF4 !important;
  border: 1.5px solid #BBF7D0 !important;
}
#pov-panel-nota .hud-chip-icon {
  color: #166534 !important;
}
#pov-panel-nota .status-chip {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
  border-radius: 9999px !important;
  font-weight: 800 !important;
}
#pov-panel-nota .pov-status-banner {
  background: #DCFCE7 !important;
  border: 1.5px solid #86EFAC !important;
  border-radius: 14px !important;
  color: #166534 !important;
  font-weight: 700 !important;
}
#pov-panel-nota .pov-status-banner .banner-icon {
  color: #16A34A !important;
}

/* =============================================================================
   6. MODUL 3: KUIZ & PERMAINAN (UNGU / PURPLE THEME)
   ============================================================================= */

/* Panel Kuiz Outer Card Container */
#pov-panel-kuiz .floating-card-container,
.pov-card-kuiz,
#floating-card-container.module-kuiz {
  background: #F3E8FF !important;
  border: 2px solid #A855F7 !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 32px -4px rgba(168, 85, 247, 0.25), 0 4px 12px rgba(0, 0, 0, 0.04) !important;
  color: #0F172A !important;
}

/* Kuiz Header Divider */
#pov-panel-kuiz .panel-fixed-header,
.pov-header-kuiz {
  border-bottom: 1px solid #E9D5FF !important;
}

/* Kuiz Header Tag (#9333EA) */
#pov-panel-kuiz .category-tag,
#pov-panel-kuiz .pov-tag-kuiz,
.category-tag.tag-kuiz,
#floating-card-container.module-kuiz .category-tag {
  background: #9333EA !important;
  color: #FFFFFF !important;
  border-radius: 9999px !important;
  border: none !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.35) !important;
}

/* Kuiz Status Sensor (Ungu Pastel) */
#pov-panel-kuiz .pov-sensor-pill,
#pov-kuiz-sensor-pill,
#floating-card-container.module-kuiz .pov-sensor-pill {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
}
#pov-panel-kuiz .pov-sensor-pill .ping,
#pov-kuiz-sensor-ping,
#floating-card-container.module-kuiz .ping {
  background: #9333EA !important;
  box-shadow: 0 0 6px #9333EA !important;
}

/* Kuiz Size S/M/L Active Button (#9333EA) */
#pov-panel-kuiz .btn-size.is-active,
#floating-card-container.module-kuiz .btn-size.is-active {
  background: #9333EA !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.4) !important;
}

/* KUIZ TITLE BOX & POV HEADER (Fixes invisible title & description) */
#pov-panel-kuiz .kuiz-title-box,
#pov-panel-kuiz .selection-title-box,
#floating-card-container.module-kuiz .kuiz-title-box,
#floating-card-container.module-kuiz .selection-title-box,
.kuiz-title-box,
.selection-title-box.kuiz-title-box {
  background: #FAF5FF !important;
  border: 1.5px solid #E9D5FF !important;
  border-radius: 18px !important;
  padding: 14px 16px !important;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.06) !important;
}
#pov-panel-kuiz .kuiz-title-box .material-symbols-outlined,
#pov-panel-kuiz .selection-title-header span,
#floating-card-container.module-kuiz .selection-title-header span,
.selection-title-box.kuiz-title-box .material-symbols-outlined {
  color: #6B21A8 !important;
}
#pov-panel-kuiz .kuiz-title-box h3,
#pov-panel-kuiz .selection-title-box h3,
#floating-card-container.module-kuiz .selection-title-box h3,
.kuiz-title-box h3 {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 16px !important;
  letter-spacing: -0.01em !important;
}
#pov-panel-kuiz .kuiz-title-box p,
#pov-panel-kuiz .selection-title-box p,
#floating-card-container.module-kuiz .selection-title-box p,
.kuiz-title-box p {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 12.5px !important;
  line-height: 1.45 !important;
  margin-top: 4px !important;
}

/* Kuiz Sub-Action Mode Buttons */
#pov-panel-kuiz .btn-kuiz-mode,
#pov-panel-kuiz .btn-mode-mcq,
#pov-panel-kuiz .btn-mode-games {
  background: #FAF5FF !important;
  border: 1.5px solid #D8B4FE !important;
  color: #6B21A8 !important;
  border-radius: 14px !important;
  font-weight: 800 !important;
}
#pov-panel-kuiz .btn-kuiz-mode:hover {
  background: #F3E8FF !important;
  border-color: #9333EA !important;
}

/* 5 Minimalist Game Rows */
#pov-panel-kuiz .minimal-game-row {
  background: #FAF5FF !important;
  border: 1.5px solid #E9D5FF !important;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.06) !important;
  transition: all 0.2s ease !important;
}
#pov-panel-kuiz .minimal-game-row:hover {
  background: #F3E8FF !important;
  border-color: #A855F7 !important;
  transform: translateY(-2px) !important;
}
#pov-panel-kuiz .minimal-game-title {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 14.5px !important;
}
#pov-panel-kuiz .minimal-game-subtitle {
  color: #6B21A8 !important;
  font-weight: 700 !important;
  font-size: 12px !important;
}
#pov-panel-kuiz .minimal-game-icon-wrap {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  border-radius: 12px !important;
}
#pov-panel-kuiz .btn-play-minimal {
  background: #9333EA !important;
  color: #FFFFFF !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
}

/* Themed Game Number Badges (High Contrast Replacement) */
.theme-emerald .minimal-num-badge {
  background: #DCFCE7 !important;
  border: 1px solid #86EFAC !important;
  color: #166534 !important;
  font-weight: 800 !important;
}
.theme-indigo .minimal-num-badge {
  background: #E0E7FF !important;
  border: 1px solid #C7D2FE !important;
  color: #3730A3 !important;
  font-weight: 800 !important;
}
.theme-purple .minimal-num-badge {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  font-weight: 800 !important;
}
.theme-amber .minimal-num-badge {
  background: #FEF3C7 !important;
  border: 1px solid #FDE68A !important;
  color: #92400E !important;
  font-weight: 800 !important;
}
.theme-teal .minimal-num-badge {
  background: #CCFBF1 !important;
  border: 1px solid #99F6E4 !important;
  color: #115E59 !important;
  font-weight: 800 !important;
}

/* Kuiz MCQ Option Buttons & Question Card */
#pov-panel-kuiz .kuiz-card-body,
#floating-card-container.module-kuiz .kuiz-card-body {
  background: #FAF5FF !important;
  border: 1.5px solid #E9D5FF !important;
  border-radius: 18px !important;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.06) !important;
}
#pov-panel-kuiz .kuiz-question-title {
  color: #0F172A !important;
  font-weight: 800 !important;
}
#pov-panel-kuiz .kuiz-opt-btn {
  background: #FAF5FF !important;
  border: 1.5px solid #E9D5FF !important;
  color: #0F172A !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
}
#pov-panel-kuiz .kuiz-opt-btn:hover {
  background: #F3E8FF !important;
  border-color: #A855F7 !important;
}
#pov-panel-kuiz .kuiz-opt-btn.is-selected {
  background: #F3E8FF !important;
  border-color: #9333EA !important;
  color: #581C87 !important;
  font-weight: 800 !important;
}
#pov-panel-kuiz .kuiz-opt-badge {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  font-weight: 800 !important;
}

/* Kuiz Telemetry Strip & Status Banner */
#pov-panel-kuiz .pov-telemetry-hud-strip {
  background: #FAF5FF !important;
  border: 1.5px solid #E9D5FF !important;
}
#pov-panel-kuiz .hud-chip-icon {
  color: #6B21A8 !important;
}
#pov-panel-kuiz .status-chip {
  background: #F3E8FF !important;
  border: 1px solid #D8B4FE !important;
  color: #6B21A8 !important;
  border-radius: 9999px !important;
  font-weight: 800 !important;
}
#pov-panel-kuiz .pov-status-banner {
  background: #F3E8FF !important;
  border: 1.5px solid #D8B4FE !important;
  border-radius: 14px !important;
  color: #6B21A8 !important;
  font-weight: 700 !important;
}
#pov-panel-kuiz .pov-status-banner .banner-icon {
  color: #9333EA !important;
}

/* =============================================================================
   7. MODUL 4: CELLQUEST 3D (SIAN / CYAN THEME)
   ============================================================================= */

/* CellQuest Top HUD Header & Tag (#0891B2) */
.category-tag.tag-cellquest,
#cq-hud-cell-name,
.cq-hud-badge {
  background: #0891B2 !important;
  color: #FFFFFF !important;
  border-radius: 9999px !important;
  border: none !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.35) !important;
}

/* CellQuest Tracking Status Pill (Sian Pastel) */
.cq-hud-tracking-status {
  background: #CFFAFE !important;
  border: 1px solid #A5F3FC !important;
  color: #155E75 !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
}
.cq-hud-tracking-status .cq-status-dot {
  background: #0891B2 !important;
  box-shadow: 0 0 6px #0891B2 !important;
}
.cq-status-text,
#cq-status-text {
  color: #155E75 !important;
  font-weight: 800 !important;
}

/* CellQuest Bottom Controller (Background #E0F7FF, Border #06B6D4) */
#cq-bottom-controls,
#cellquest-bottom-controls,
.cq-bottom-controls {
  background: rgba(224, 247, 255, 0.96) !important;
  border: 2px solid #06B6D4 !important;
  border-radius: 24px !important;
  box-shadow: 0 10px 32px rgba(6, 182, 212, 0.22) !important;
}

/* Cell Switcher Container */
.cq-cell-switcher {
  background: #CFFAFE !important;
  border: 1px solid #A5F3FC !important;
  border-radius: 14px !important;
}
.cq-pill-btn {
  color: #155E75 !important;
  font-weight: 800 !important;
}
.cq-pill-btn.active {
  background: #0891B2 !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.35) !important;
  font-weight: 800 !important;
}

/* CellQuest Action Buttons (Kad Kawalan #ECFEFF, Border #A5F3FC) */
.cq-action-btn {
  background: #ECFEFF !important;
  border: 1px solid #A5F3FC !important;
  color: #155E75 !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
}
.cq-action-btn .cq-action-label {
  color: #155E75 !important;
  font-weight: 800 !important;
  font-size: 10px !important;
}
.cq-action-btn .material-symbols-outlined {
  color: #155E75 !important;
}
.cq-action-btn:hover {
  background: #CFFAFE !important;
  border-color: #06B6D4 !important;
}
.cq-action-btn.is-active {
  background: #06B6D4 !important;
  border-color: #0891B2 !important;
  color: #FFFFFF !important;
}
.cq-action-btn.is-active .cq-action-label,
.cq-action-btn.is-active .material-symbols-outlined {
  color: #FFFFFF !important;
  font-weight: 800 !important;
}

/* Organelle Detail Card (Kad Kawalan #ECFEFF, Border #06B6D4) */
#cq-organelle-card,
.cq-organelle-card {
  background: #ECFEFF !important;
  border: 2px solid #06B6D4 !important;
  border-radius: 20px !important;
  box-shadow: 0 12px 36px -4px rgba(6, 182, 212, 0.25) !important;
  color: #0F172A !important;
}
.cq-card-name {
  color: #0F172A !important;
  font-weight: 800 !important;
  font-size: 16px !important;
}
.cq-card-category {
  color: #155E75 !important;
  font-weight: 800 !important;
  font-size: 12px !important;
}
.cq-section-label {
  color: #155E75 !important;
  font-weight: 800 !important;
  font-size: 11px !important;
}
.cq-section-text {
  color: #334155 !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}
.cq-section-analogy {
  background: rgba(245, 158, 11, 0.12) !important;
  border-left: 3px solid #D97706 !important;
  border-radius: 0 10px 10px 0 !important;
}
.cq-section-analogy .cq-section-label {
  color: #92400E !important;
  font-weight: 800 !important;
}
.cq-section-fact {
  background: rgba(147, 51, 234, 0.10) !important;
  border-left: 3px solid #9333EA !important;
  border-radius: 0 10px 10px 0 !important;
}
.cq-section-fact .cq-section-label {
  color: #6B21A8 !important;
  font-weight: 800 !important;
}
.cq-card-close {
  background: #CFFAFE !important;
  border: 1px solid #A5F3FC !important;
  color: #155E75 !important;
  border-radius: 8px !important;
  font-weight: 800 !important;
}
.cq-card-close:hover {
  background: #A5F3FC !important;
}
`;

fs.writeFileSync(cssPath, baseCSS + multiThemeCSS, 'utf8');
console.log('✅ Multi-theme overlay styles with WCAG high contrast applied successfully to kotak-arselnel.css');
