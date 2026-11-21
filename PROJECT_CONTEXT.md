# ARSELNEL — Project Architecture & Context Documentation

> **Master Technical Context & Knowledge Transfer Document**  
> **Repository:** `stitch_arselnel_interactive_science_learning`  
> **Target Audience:** AI Assistants, Software Architects, Full-Stack Developers, QA Engineers  
> **Domain:** Malaysian Secondary School Science Education (KSSM Tingkatan 1 — Bab 2: Sel Sebagai Unit Asas Hidupan)

---

## 1. Executive Summary & Purpose

**ARSELNEL (Augmented Reality Science Educational Learning Network & Experiential Lab)** is a web-based interactive STEM learning platform designed specifically for Form 1 (Tingkatan 1) secondary school students in Malaysia.

### Core Educational Objective
Transform abstract cellular biology concepts into intuitive, interactive, multi-sensory experiences through:
1. **Interactive 3D & WebAR Visualizations:** Real-time 3D models of animal and plant cells with exploded organelle views, dual-cell comparison, and WebAR marker tracking.
2. **Gamified Learning & Quizzes:** Mini-games on cell organization, organelle labeling, classification, and virtual microscope simulations.
3. **Smart Interactive Notes:** PDF slide viewer with real-time digital ink annotation (pen, highlighter, eraser), page-by-page progress tracking, and cloud sync.
4. **SelBot AI Virtual Science Tutor:** Context-aware Malay language AI conversational agent equipped with KSSM syllabus taxonomy and offline fallback heuristics.
5. **Educator CMS & Admin Portal:** Centralized dashboard for teachers/administrators to manage learning materials, video feeds, quizzes, slide decks, and student progress.

---

## 2. Technology Stack & Architectural Principles

### 2.1 Front-End Core
- **Architecture:** Zero-build / Vanilla Modern Web (HTML5, ES6+ JavaScript modules, CSS3).
- **Styling:** CSS Custom Properties (Theming), Modern CSS Grid, Flexbox, Tailwind CSS CDN integration where utility classes are needed.
- **Icons & Typography:** Google Fonts (*Plus Jakarta Sans*, *Inter*), Material Symbols Outlined, Lucide Icons.
- **3D & Augmented Reality:**
  - `Three.js` (r128) for 3D scene rendering, lighting, material handling, and animation loops.
  - `MindAR` (v1.1.5) for high-performance WebAssembly/WebGL browser-based image target tracking (`targets.mind`).
  - `GLTFLoader` for optimized 3D binary assets (`animal_cell_final.glb`, `plantcellnew.glb`).
  - `DeviceOrientation API` for 3DoF (Degrees of Freedom) gyroscope POV lock.
- **Document & Slide Engine:**
  - `PDF.js` (v3.11.174) for rendering vector PDF slides directly inside HTML5 canvas.
  - Custom HTML5 Canvas digital ink annotation engine (pen, highlighter, eraser, undo/clear).

### 2.2 Back-End, Serverless & API
- **Deployment Platform:** Vercel (Edge & Node.js Serverless Functions).
- **Serverless API Routes (`/api`):**
  - `/api/health.js` — System diagnostics, uptime, and database connectivity check.
  - `/api/public-config.js` — Safe delivery of public credentials (Supabase URL, Anon Key) to client.
  - `/api/selbot/chat.js` — Rate-limited AI proxy with KSSM biology prompt engineering and rule-based fallback.
  - `/api/admin/users.js` — Admin-only user management (promote, demote, list, delete).
  - `/api/slides/upload.js` — Secure presentation and PDF upload handler with MIME validation and size limits.
- **Local Development Server (`local-server.js`):**
  - Zero external npm dependencies. Native Node.js HTTP/HTTPS server.
  - Features: Automatic `.env` parsing, comprehensive MIME dictionary (supporting `.glb`, `.wasm`, `.mind`, `.brotli`), static file serving, and local API emulation.

### 2.3 Database, Auth & Storage (Supabase)
- **Database Engine:** PostgreSQL 15+ managed via Supabase.
- **Authentication:** Supabase Auth (Email/Password, Google OAuth 2.0 PKCE, session management).
- **Row-Level Security (RLS):** Enabled across all public tables ensuring tenant isolation (students only access/edit their own records; admins have elevated CMS access).
- **Cloud Storage Buckets:**
  - `slides` — Presentation decks and notes (PDF/PPTX).
  - `models` / `assets` — 3D GLB models and AR tracking binary targets.

---

## 3. High-Level System Architecture & Data Flow

```
                      +-------------------------------------------+
                      |               CLIENT BROWSER              |
                      |  (Desktop / Laptop / iPad / iOS / Android) |
                      +---------------------+---------------------+
                                            |
                 +--------------------------+--------------------------+
                 |                                                     |
                 v                                                     v
   +---------------------------+                         +---------------------------+
   |   STATIC APPLICATION UI   |                         |  INTERACTIVE WEB RUNTIMES  |
   | - Student Shell & Nav     |                         | - Three.js WebGL Engine   |
   | - Dashboard & Notas       |                         | - MindAR Marker Tracker   |
   | - Hab Permainan & Kuiz    |                         | - 3DoF POV Gyroscope      |
   | - Guided Tour Overlay     |                         | - PDF.js Annotation Engine|
   +-------------+-------------+                         +-------------+-------------+
                 |                                                     |
                 +--------------------------+--------------------------+
                                            |
                                            v
                      +-------------------------------------------+
                      |         CLIENT-SIDE ADAPTER LAYER         |
                      |  assets/js/cms-content-adapter.js         |
                      |  (Dual-Mode: Supabase Cloud <-> LocalSync)|
                      +---------------------+---------------------+
                                            |
                 +--------------------------+--------------------------+
                 |                                                     |
                 v                                                     v
   +---------------------------+                         +---------------------------+
   |   VERCEL SERVERLESS API   |                         |     SUPABASE BACKEND      |
   | - /api/public-config      |                         | - Supabase Auth (JWT/RLS) |
   | - /api/selbot/chat (AI)   |                         | - PostgreSQL 15+ DB       |
   | - /api/admin/users        |                         | - Supabase Storage (CDN)  |
   | - /api/slides/upload      |                         | - Realtime WebSockets     |
   +---------------------------+                         +---------------------------+
```

### Architectural Resilience Patterns
1. **Offline & Graceful Degradation:**
   - If Supabase or network connectivity fails, `cms-content-adapter.js` falls back to pre-seeded local datasets and browser `localStorage`.
   - If AI API tokens/endpoints expire or fail, `/api/selbot/chat.js` activates its internal KSSM biology deterministic rule engine to continue answering student questions.
2. **Device Responsiveness:**
   - All modules are tested and optimized for viewports ranging from 360px (Android), 375px/390px/430px (iPhone Safari), 768px/1024px (iPad), to 1920x1080 (Desktop).
3. **Touch & Sensor Harmonization:**
   - WebAR and 3D scenes support single-touch rotate, two-finger pinch-to-zoom, two-finger drag-to-pan, and orientation sensor locking.

---

## 4. Detailed Module Directory & Feature Map

### 4.1 Student Shell & Authentication
- **Paths:**
  - [auth/login.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/login.html) — Student sign-in page (Email + Google OAuth).
  - [auth/register.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/register.html) — New student account creation.
  - [auth/callback.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/auth/callback.html) — OAuth redirect handler and session exchange.
  - [assets/js/auth.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/auth.js) — Core auth controller interfacing with Supabase Auth.
  - [assets/js/auth-guard.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/auth-guard.js) — Route guard ensuring authenticated access for protected pages.
  - [assets/js/student-shell.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/student-shell.js) — Global navigation shell injecting sidebar, topbar, user profile avatar, XP badges, dark/light theme, and "Panduan Halaman" guided tour trigger.

### 4.2 Student Dashboard
- **Paths:**
  - [halaman_utama/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/halaman_utama/code.html)
- **Features:**
  - Personalized greeting with dynamic student name.
  - Quick action portal cards to: CellQuest 3D, Nota Interaktif, Video, Tanya AI (SelBot), and Kuiz & Permainan.
  - Real-time aggregated learning stats: Total minutes studied, quizzes completed, badges unlocked.
  - Recent activity feed and syllabus topic progress tracker.

### 4.3 Interactive Notes & Smart Slide Reader
- **Paths:**
  - [nota_pembelajaran/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/nota_pembelajaran/code.html) — Notes catalog categorized by KSSM topics.
  - [nota_pembelajaran/slaid_interaktif.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/nota_pembelajaran/slaid_interaktif.html) — Fullscreen interactive slide presentation.
  - [butiran_nota/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/butiran_nota/code.html) — Topic overview and reading preparation.
  - [assets/js/smart-notes.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/smart-notes.js) — PDF.js slide renderer with HTML5 canvas digital annotation engine (pen, highlighter, eraser, undo, color pickers, and persistent annotation saving to Supabase).

### 4.4 Video Learning Hub & Player
- **Paths:**
  - [perpustakaan_video/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/perpustakaan_video/code.html) — Video learning library with search, topic filtering, and difficulty tags.
  - [pemain_video/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/pemain_video/code.html) — Dedicated video player page with timestamp chapter navigation, video notes, and related lesson recommendations.

### 4.5 CellQuest 3D & Adventure Exploration
- **Paths:**
  - [cellquest/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/cellquest/code.html) — CellQuest main hub.
  - [cellquest/adventure.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/cellquest/adventure.html) — 3-mode science exploration portal:
    - **Mod A:** Jelajah Makmal 3D (No-camera 3D virtual lab with WASD/touch joystick navigation across 8 organelle stations).
    - **Mod B:** AR Orientasi Dunia (Camera-based 360-degree world orientation with smart radar compass).
    - **Mod C:** AR Kad Penanda (Image target marker scanning for individual 3D organelle cards).
  - [cellquest/safari3d.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/cellquest/safari3d.html) — Immersive 3D cellular safari view.
  - [assets/js/cellquest3d.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/cellquest3d.js) — Three.js animal & plant cell rendering, exploded view animations, and organelle raycaster inspection.
  - [assets/js/cellquest-adventure.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/cellquest-adventure.js) — Station state machine, checkpoint challenge evaluation, and progress saving.

### 4.6 Kotak ARSELNEL (Marker-Based WebAR System)
- **Paths:**
  - [kotak_arselnel/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/code.html) — Main WebAR scanner application.
  - [kotak_arselnel/kotak-arselnel.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/kotak-arselnel.js) — Master AR controller.
  - [kotak_arselnel/kotak-arselnel.css](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kotak_arselnel/kotak-arselnel.css) — AR UI stylesheet with high-contrast, non-overlapping responsive card modals.
- **Key AR Technical Capabilities:**
  - **Marker Routing:** MindAR binary targets compiled in `targets.mind`. Correctly routes marker index 0/1/2/3 to respective learning panels (Nota, Video, CellQuest 3D, Kuiz).
  - **Dual-Cell Comparison:** Allows simultaneous viewing and individual touch manipulation of both Animal Cell (`animal_cell_final.glb`) and Plant Cell (`plantcellnew.glb`).
  - **Kunci Pandangan (3DoF POV Lock):** Enables students to lock the 3D model in virtual 3D space using the device gyroscope (`DeviceOrientationEvent`), allowing inspection even if the physical marker leaves camera view.
  - **Collision Prevention & Multi-Panel Workspace:** Smart panel controller ensuring marker notifications and floating info panels never overlap or obscure interaction buttons.

### 4.7 Hab Permainan & Mini-Games
- **Paths:**
  - [hab_permainan/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/hab_permainan/code.html) — Game hub lobby with XP progress and achievement badges.
  - [kuiz_interaktif/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/kuiz_interaktif/code.html) — Rapid-fire quiz with timer, life points, and instant answer explanations.
  - [keputusan_permainan/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/keputusan_permainan/code.html) — Game summary screen displaying score, accuracy percentage, time taken, and XP rewards.
  - [games/klasifikasi-sel.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/games/klasifikasi-sel.html) — Drag-and-drop classification (Unicellular vs Multicellular organisms: Amoeba, Paramecium, Spirogyra, Hydras, Human Cheek Cells).
  - [games/labelkan-organel.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/games/labelkan-organel.html) — Interactive organelle matching game (Nucleus, Mitochondria, Chloroplast, Cell Membrane, Cell Wall, Vacuole, Cytoplasm).
  - [games/misi-makmal-sains.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/games/misi-makmal-sains.html) — Laboratory simulation: Step-by-step preparation of onion epidermal peel slide and methylene blue cheek cell slide.
  - [games/organisasi-kehidupan.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/games/organisasi-kehidupan.html) — Cellular hierarchy puzzle: Cell -> Tissue -> Organ -> System -> Organism.

### 4.8 SelBot AI Virtual Science Tutor
- **Paths:**
  - [selbot_ai/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/selbot_ai/code.html) — Chat UI with quick science inquiry chips, voice synthesizer (Web Speech API), and chat history.
  - [assets/js/selbot-conversation-service.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/selbot-conversation-service.js) — Client conversation manager handling message streaming, Supabase persistence, and rate-limit backoff.
  - [api/selbot/chat.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/api/selbot/chat.js) — Serverless endpoint with KSSM Tingkatan 1 system prompts, input sanitization, rate-limiting (20 req/min per IP/token), and rule-based fallback biology engine.

### 4.9 Admin Dashboard & Content Management System (CMS)
- **Paths:**
  - [admin/login.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/admin/login.html) & [admin/dashboard.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/admin/dashboard.html)
  - [admin_dashboard/code.html](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/admin_dashboard/code.html)
  - [assets/js/admin.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/admin.js) & [assets/js/admin-portal.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/admin-portal.js)
  - [api/admin/users.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/api/admin/users.js)
- **CMS Capabilities:**
  - Manage Videos (`cms_videos`): Add YouTube IDs, Malay titles, descriptions, and syllabus tags.
  - Manage Quizzes & Game Questions (`cms_quizzes`, `cms_game_questions`): Add multiple-choice questions, correct answers, and feedback.
  - Slide Decks: Upload PDF/PPTX slides directly into Supabase Storage.
  - User Management: Promote users to Teacher/Admin, reset student progress, or remove test accounts.
  - Audit Logs (`admin_audit_logs`): Record administrative actions.

### 4.10 Guided Tour & Onboarding Engine
- **Paths:**
  - [assets/js/guided-tour.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/guided-tour.js) — Walkthrough engine.
  - [assets/js/guided-tour-config.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/js/guided-tour-config.js) — Step configurations for all pages.
  - [assets/css/guided-tour.css](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/assets/css/guided-tour.css) — Spotlight SVG mask and tooltip styles.
- **Key Mechanics:**
  - Page-specific step sequences with Malay instructions tailored for Form 1 students.
  - Precision spotlight cutout using dynamic viewport bounding client rects.
  - Controls: Next (`Seterusnya`), Previous (`Kembali`), Skip (`Langkau`), Finish (`Selesai`), and "Jangan Tunjuk Lagi" checkbox.
  - Persistent state saved per user and per page in browser `localStorage`.
  - Manual relaunch button ("Panduan Halaman") integrated in every page's top header.

---

## 5. Database Schema & Supabase Architecture

The database schema is defined across 19 migration scripts in `supabase/migrations/`. Below is the authoritative data dictionary:

### 5.1 User & Progress Tracking Tables
1. **`profiles`**
   - Columns: `id` (UUID, PK, references `auth.users`), `email` (TEXT), `full_name` (TEXT), `avatar_url` (TEXT), `role` (TEXT: 'student' | 'teacher' | 'admin'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
2. **`learning_progress`**
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `profiles.id`), `module_id` (TEXT), `topic_id` (TEXT), `status` (TEXT: 'not_started' | 'in_progress' | 'completed'), `progress_percent` (INT), `time_spent_seconds` (INT), `last_accessed_at` (TIMESTAMPTZ).
3. **`quiz_attempts`**
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `profiles.id`), `quiz_id` (TEXT), `score` (INT), `total_questions` (INT), `accuracy_rate` (NUMERIC), `duration_seconds` (INT), `answers_payload` (JSONB), `completed_at` (TIMESTAMPTZ).
4. **`activity_results`**
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `profiles.id`), `activity_type` (TEXT: 'game' | 'cellquest' | 'ar_box'), `activity_id` (TEXT), `score` (INT), `xp_earned` (INT), `metadata` (JSONB), `created_at` (TIMESTAMPTZ).
5. **`user_settings`**
   - Columns: `user_id` (UUID, PK, FK -> `profiles.id`), `theme` (TEXT: 'light' | 'dark' | 'system'), `sound_enabled` (BOOLEAN), `haptic_enabled` (BOOLEAN), `tour_preferences` (JSONB).

### 5.2 Smart Notes & Annotations
6. **`learning_notes`**
   - Columns: `id` (UUID, PK), `topic_id` (TEXT), `title` (TEXT), `pdf_url` (TEXT), `total_slides` (INT), `difficulty` (TEXT), `is_published` (BOOLEAN).
7. **`student_annotations`**
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `profiles.id`), `note_id` (UUID, FK -> `learning_notes.id`), `slide_number` (INT), `strokes_data` (JSONB), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
8. **`student_note_progress`**
   - Columns: `id` (UUID, PK), `user_id` (UUID, FK -> `profiles.id`), `note_id` (UUID, FK -> `learning_notes.id`), `highest_slide_reached` (INT), `is_completed` (BOOLEAN), `updated_at` (TIMESTAMPTZ).

### 5.3 CMS & Content Management Tables
9. **`cms_videos`** — Learning videos (`id`, `youtube_id`, `title`, `description`, `topic_id`, `duration_seconds`, `sort_order`, `is_active`).
10. **`cms_quizzes`** — Quiz metadata and questions (`id`, `title`, `topic_id`, `difficulty`, `questions_json`, `is_active`).
11. **`cms_game_questions`** — Question banks for mini-games (`id`, `game_type`, `question`, `options`, `correct_answer`, `explanation`).
12. **`cms_cellquest_organelles`** — Organelle descriptions, 3D coordinates, and scientific facts for CellQuest.
13. **`cms_cellquest_models`** — Metadata and URLs for GLB 3D assets.
14. **`cms_dashboard_config`** — Dynamic announcement banners and featured learning topics.
15. **`cms_manual_steps`** — Instructions and user guide step definitions.
16. **`cellquest_adventure_config`** — Checkpoints and stations for Adventure Mod A/B/C.

### 5.4 SelBot AI & System Administration
17. **`selbot_conversations`** — Chat sessions (`id`, `user_id`, `title`, `created_at`, `updated_at`).
18. **`selbot_messages`** — Chat history (`id`, `conversation_id`, `sender` ['user' | 'bot'], `content`, `metadata`, `created_at`).
19. **`admin_users`** — Explicit administrator whitelist with permission scopes.
20. **`admin_audit_logs`** — Audit trail of administrative modifications (`admin_id`, `action`, `target_table`, `details`, `timestamp`).
21. **`student_learning_events`** — Fine-grained telemetry events for learning analytics.

---

## 6. Serverless API Endpoint Specifications

All serverless functions are deployed under `/api/*` and conform to standard HTTP REST semantics:

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | No | Returns system status, environment type, and database health. |
| `/api/public-config` | `GET` | No | Exposes public Supabase endpoint & Anon Key securely without leaking secrets. |
| `/api/selbot/chat` | `POST` | Optional | Receives student query; passes through KSSM biology prompt; returns response with fallback. |
| `/api/admin/users` | `GET`, `POST`, `DELETE` | Yes (Admin JWT) | Administrative user listing, role mutation, and test account cleanup. |
| `/api/slides/upload` | `POST` | Yes (Teacher/Admin) | Handles PDF slide uploads to storage with validation. |

---

## 7. Configuration Files & Environment Setup

### 7.1 Environment Variables
When running locally or deploying to Vercel, the application requires the following environment variables (stored in `.env` locally, or Vercel Environment Variables in production):

```ini
# Supabase Configuration
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-admin-key>

# AI Engine Credentials (Optional, SelBot has offline rule fallback)
GEMINI_API_KEY=<your-gemini-or-openai-api-key>

# Admin Security
ADMIN_EMAILS=admin@arselnel.edu.my,cikgu@arselnel.edu.my
PORT=3000
```

### 7.2 Key Configuration Files
- **[package.json](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/package.json):** Defines project metadata and execution scripts (`npm start` or `npm run dev` launching `node local-server.js`).
- **[vercel.json](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/vercel.json):** Configures routing, rewrites, custom headers (CORS, WASM MIME types, Brotli compression), and serverless function memory/execution limits.
- **[local-server.js](file:///d:/ARSELNEL%20-%20sebelum%20game/stitch_arselnel_interactive_science_learning/local-server.js):** Zero-dependency native Node.js development server. Parses local `.env`, emulates serverless functions, handles slide uploads, and serves static files with accurate MIME headers.

---

## 8. Verification & Automated Testing Suite

The repository includes a comprehensive automated test suite in the `tests/` directory:
- **`tests/test-guided-tour-comprehensive.js`:** Validates Guided Tour DOM elements, spotlight geometry, and responsive behavior across all pages.
- **`tests/test-arselnel-emergency-recovery.js`:** Verifies WebAR marker routing, 3DoF POV lock transitions, multi-cell rendering, and UI modal collision prevention.
- **`tests/test-viewport-responsive.js`:** Headless browser viewport testing across iPhone 14/15, iPad Air, Samsung Galaxy, and Desktop resolutions.

To execute tests locally:
```bash
node tests/test-guided-tour-comprehensive.js
node tests/test-arselnel-emergency-recovery.js
```

---

## 9. Developer & AI Transfer Guidelines

When taking over development or modifying the ARSELNEL codebase in a new session:
1. **Preserve Zero-Build Simplicity:** Do not introduce complex build steps (like Webpack or Vite) unless requested. The app runs directly in standard browsers and via `local-server.js`.
2. **Mobile & Touch First:** Always verify that interactive Three.js and MindAR elements do not intercept touch scrolling or collide with HUD controls on iOS Safari and mobile Chrome.
3. **Dual-Mode Persistence:** When creating new interactive features, follow the pattern in `cms-content-adapter.js` — write to Supabase when authenticated, and fall back cleanly to `localStorage` when offline.
4. **Bilingual / Malay UI:** All student-facing instructions, tooltips, and SelBot responses should remain in friendly, grammatically natural Bahasa Melayu suited for Form 1 secondary school students.
5. **Security Hygiene:** Never hardcode passwords, API keys, or service role tokens into client-side files or commit them into version control.
