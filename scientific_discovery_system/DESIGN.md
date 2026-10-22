---
name: Scientific Discovery System
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#3e4949'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#6e7979'
  outline-variant: '#bdc9c8'
  surface-tint: '#006a6a'
  primary: '#006565'
  on-primary: '#ffffff'
  primary-container: '#008080'
  on-primary-container: '#e3fffe'
  inverse-primary: '#76d6d5'
  secondary: '#1960a3'
  on-secondary: '#ffffff'
  secondary-container: '#7db6ff'
  on-secondary-container: '#00477f'
  tertiary: '#00683d'
  on-tertiary: '#ffffff'
  tertiary-container: '#0a844f'
  on-tertiary-container: '#ecffee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#93f2f2'
  primary-fixed-dim: '#76d6d5'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004881'
  tertiary-fixed: '#91f8b8'
  tertiary-fixed-dim: '#74db9d'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 20px
  gutter-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  touch-target-min: 48px
---

## Brand & Style
The design system is engineered to facilitate an engaging, science-focused learning environment for Malaysian Form 1 students. It balances academic rigor with the excitement of discovery. The visual direction is a refined evolution of Material Design 3, focusing on clarity, interactivity, and modern educational aesthetics.

The style avoids "childish" tropes (like excessive primary colors or cartoonish icons) in favor of a clean, sophisticated, yet vibrant interface that respects the user's maturity as a secondary school student. It utilizes generous whitespace, purposeful motion, and high-contrast elements to ensure accessibility and focus. The emotional response should be one of curiosity, confidence, and technical wonder.

## Colors
The palette is rooted in a "Clean Laboratory" aesthetic—bright, sterile but friendly, and highly legible. 

- **Primary (Teal - #008080):** Used for main actions and brand presence. It represents biological and chemical sciences.
- **Secondary (Blue - #2B6CB0):** Used for structural elements, navigation, and physics-related content.
- **Tertiary (Green - #38A169):** Used for success states, progress indicators, and environmental science modules.
- **Soft Purple (#9F7AEA):** An accent color used for interactive "Magic" or AR (Augmented Reality) features, hints, and special callouts.
- **Surface:** A crisp white background (#FFFFFF) with very light neutral shifts (#F7FAFC) for container grouping to maintain high contrast (WCAG AA compliant).

## Typography
The typography system prioritizes legibility for educational content. **Plus Jakarta Sans** is used for headlines to provide a friendly, modern, and slightly geometric personality. **Inter** is utilized for body text and labels due to its exceptional readability on mobile screens and neutral, systematic feel.

For Malaysian students, ensure that the line height for body text is slightly generous (1.5x) to prevent fatigue during long reading sessions (e.g., *Nota Sains*). Headlines use a tighter tracking to maintain a bold, editorial look.

## Layout & Spacing
This design system follows a fluid 4-column grid for mobile devices. 

- **Safe Areas:** A minimum outer margin of 20px ensures content is not cramped against screen edges.
- **Vertical Rhythm:** A base 8px scale is used for all spacing. Elements are grouped using 8px (related), 16px (standard), or 24px (distinct sections).
- **Touch Targets:** All interactive elements must adhere to a minimum 48x48px area to accommodate varying motor skills and fast-paced interaction during quizzes.
- **Density:** Maintain a "Low-to-Medium" density to ensure the interface feels approachable and not overwhelming for a 13-year-old student.

## Elevation & Depth
In line with modern Material principles, depth is communicated through **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Surface):** The main background, usually pure white.
- **Level 1 (Cards/Modules):** Uses a subtle background tint (Neutral 50) or a very soft, diffused shadow (Blur: 12px, Y: 4px, Opacity: 6% Black) to lift content.
- **Level 2 (Floating/Active):** Used for active buttons or "Pop-out" diagrams. Shadows are more pronounced (Blur: 20px, Y: 8px, Opacity: 10% Primary-tinted).
- **Depth Scrims:** When modal dialogs or AR overlays appear, a 40% opacity neutral-dark scrim is used to focus attention on the foreground.

## Shapes
The shape language is defined by large, friendly radii that evoke a sense of safety and modern tech. 

- **Standard Containers:** Use 16px (rounded-lg) for most structural blocks.
- **Primary Cards:** Use a signature **24px** (rounded-xl) for main lesson cards and activity modules to create a distinctive "pill-like" look.
- **Buttons:** Fully rounded (stadium/pill-shaped) for primary actions to maximize the "interactive" feel. Secondary buttons may use 16px.

## Components

- **Buttons:** 
  - *Primary (Utama):* Full-width or large-padding stadium shapes using the Primary Teal. Text is white, bold.
  - *Secondary (Kedua):* Outlined with a 2px stroke or soft-tinted background.
- **Cards (Kad Pembelajaran):** 
  - 24px corner radius. Must include a clear visual header (icon or image) and a "Mula" (Start) button that is pinned to the bottom right or centered.
- **Progress Indicators (Penunjuk Kemajuan):** 
  - Thicker, rounded bars (8px height) using Secondary Blue or Tertiary Green to show lesson completion.
- **Chips (Tag):** 
  - Small, pill-shaped labels for categories like "Biologi," "Fizik," or "Kimia." Low-saturation background colors with high-saturation text.
- **Input Fields (Ruang Input):** 
  - Filled style with a bottom-line indicator or soft-rounded borders (12px). Focus states must use a 2px Primary Teal border.
- **AR Interaction Tooltip:** 
  - A Soft Purple floating bubble with a pulse animation to indicate where the student should point their camera for Augmented Reality features.
- **Lists (Senarai):** 
  - Large vertical padding (16px) between items with subtle dividers. Each list item should have a leading icon to aid quick scanning.