(function () {
  'use strict';
  const pages = [
    ['home', 'Dashboard', 'home', 'halaman_utama'],
    ['cellquest', 'CellQuest', 'view_in_ar', 'cellquest'],
    ['notes', 'Nota', 'menu_book', 'nota_pembelajaran'],
    ['videos', 'Video', 'play_circle', 'perpustakaan_video'],
    ['ai', 'Tanya AI', 'smart_toy', 'selbot_ai'],
    ['games', 'Kuiz & Permainan', 'sports_esports', 'hab_permainan']
  ];
  const path = location.pathname.toLowerCase();
  const nested = path.includes('/');
  const relative = nested ? '../' : '';
  const key = path.includes('halaman_utama') ? 'home'
    : path.includes('cellquest') ? 'cellquest'
    : path.includes('pengimbas_ar') || path.includes('paparan_model_ar') ? 'ar'
    : path.includes('selbot_ai') ? 'ai'
    : path.includes('nota') || path.includes('butiran_nota') ? 'notes'
    : path.includes('video') || path.includes('pemain_video') ? 'videos'
    : path.includes('permainan') || path.includes('kuiz') ? 'games'
    : path.includes('tetapan') ? 'settings'
    : path.includes('profil') ? 'profile'
    : path.includes('bantuan') || path.includes('manual') ? 'help'
    : path.includes('modul_pembelajaran') ? 'notes' : '';
  const themeByNavKey = {
    home: 'dashboard',
    notes: 'notes',
    videos: 'video',
    video: 'video',
    cellquest: 'cellquest',
    ar: 'ar',
    games: 'games',
    ai: 'ai',
    profile: 'profile',
    settings: 'settings',
    help: 'help'
  };
  const activeTheme = document.documentElement.getAttribute('data-page-theme') || themeByNavKey[key] || 'dashboard';

  if (!document.documentElement.getAttribute('data-page-theme')) {
    document.documentElement.setAttribute('data-page-theme', activeTheme);
  }
  if (!document.body.getAttribute('data-page-theme')) {
    document.body.setAttribute('data-page-theme', activeTheme);
  }
  const current = pages.find(item => item[0] === key);
  const user = window.AuthGuard && AuthGuard.getUser ? AuthGuard.getUser() : null;
  const displayName = user && user.name ? user.name.split(' ')[0] : 'Saintis Muda';
  const safeName = escapeHTML(displayName);
  const safeNickname = escapeHTML(user && user.nickname ? user.nickname : displayName);
  const avatar = validAvatar(user && user.avatar) ? user.avatar : relative + 'assets/home/avatar.svg';
  const SHELL_SVGS = {
    home: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    view_in_ar: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M19 7h-2V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-7-2h2v2h-2V5zm6 14H6V9h12v10zm-6-8l4 2.5v5l-4 2.5-4-2.5v-5l4-2.5z"/></svg>',
    menu_book: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
    play_circle: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
    smart_toy: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/></svg>',
    sports_esports: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    left_panel_close: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14h-7V6h7v12zm-9 0H6V6h3v12z"/></svg>',
    notifications: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>',
    help: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>'
  };

  function getShellIcon(iconName) {
    if (SHELL_SVGS[iconName]) {
      return `<span class="material-symbols-outlined" data-icon="${iconName}" aria-hidden="true">${SHELL_SVGS[iconName]}</span>`;
    }
    return `<span class="material-symbols-outlined" data-icon="${iconName}" aria-hidden="true">${iconName}</span>`;
  }

  const preferenceKey = `arselnel_preferences_${user && user.id ? user.id : 'guest'}`;
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(preferenceKey) || '{}'); } catch (_) {}
  const destinations = pages.map(([id, label, icon, dir]) => {
    const active = id === key ? ' aria-current="page"' : '';
    const href = id === 'achievements' ? `${relative}${dir}/code.html?view=achievements#profile-badges` : `${relative}${dir}/code.html`;
    return `<a href="${href}"${active} data-nav-id="${id}" title="${label}">${getShellIcon(icon)}<span>${label}</span></a>`;
  }).join('');
  const title = current ? current[1] : document.title.split(/[—|-]/)[0].trim();
  document.body.classList.add('ars-student-shell');
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="ars-drawer-backdrop" data-ars-close></div>
    <aside class="ars-sidebar" id="ars-sidebar" aria-label="Navigasi utama">
      <a class="ars-brand" href="${relative}halaman_utama/code.html" aria-label="ARSelNel Utama">
        <img class="ars-brand-logo-full" src="${relative}assets/branding/arselnel-logo-horizontal.png" alt="ARSelNel Science Adventure" />
        <img class="ars-brand-logo-compact" src="${relative}assets/branding/arselnel-icon-compact.png" alt="ARSelNel" />
      </a>
      <div class="ars-nav-label">Jom belajar</div>
      <nav class="ars-nav">${destinations}</nav>
      <div class="ars-side-bottom">
        <a class="ars-side-profile${key === 'profile' ? ' ars-profile-current' : ''}" data-nav-id="profile" href="${relative}profil/code.html" title="Profil saya"${key === 'profile' ? ' aria-current="page"' : ''}>
          <img src="${avatar}" alt=""/><span class="ars-profile-label">${safeNickname}<small>Profil saya</small></span>
        </a>
        <a class="ars-side-settings${key === 'settings' ? ' ars-settings-current' : ''}" data-nav-id="settings" href="${relative}tetapan/code.html" title="Tetapan"${key === 'settings' ? ' aria-current="page"' : ''}>${getShellIcon('settings')}<span>Tetapan</span></a>
        <button class="ars-side-logout" type="button" title="Log keluar" data-ars-logout>${getShellIcon('logout')}<span>Log keluar</span></button>
      </div>
    </aside>
    <div class="ars-topbar">
      <button class="ars-icon-button ars-mobile-menu" type="button" aria-label="Buka menu" aria-expanded="false" data-ars-menu>${getShellIcon('menu')}</button>
      <button class="ars-icon-button ars-desktop-collapse" type="button" aria-label="Kecilkan menu" aria-pressed="false" data-ars-collapse>${getShellIcon('left_panel_close')}</button>
      <div class="ars-page-title">${title}</div>
      <div class="ars-topbar-greeting">Hai, ${safeName}!</div>
      <button class="ars-icon-button ars-tour-btn-replay" type="button" aria-label="Panduan Halaman" title="Buka Panduan Halaman" data-ars-tour>${getShellIcon('help')}</button>
      <button class="ars-icon-button" type="button" aria-label="Notifikasi">${getShellIcon('notifications')}</button>
      <a class="ars-side-profile ars-top-profile" href="${relative}profil/code.html" style="padding:4px 8px;min-height:42px" aria-label="Profil ${safeName}"><img src="${avatar}" alt=""/><span class="ars-user-name">${safeNickname}</span></a>
    </div>`);
  applyPreferences();
  try {
    // Dynamic Guided Tour Loader
    if (!document.querySelector('link[href*="guided-tour.css"]')) {
      const tourCss = document.createElement('link');
      tourCss.rel = 'stylesheet';
      tourCss.href = `${relative}assets/css/guided-tour.css`;
      document.head.appendChild(tourCss);
    }
    if (!document.querySelector('script[src*="guided-tour-config.js"]')) {
      const tourCfg = document.createElement('script');
      tourCfg.src = `${relative}assets/js/guided-tour-config.js`;
      document.head.appendChild(tourCfg);
      tourCfg.onload = () => {
        if (!document.querySelector('script[src*="guided-tour.js"]')) {
          const tourJs = document.createElement('script');
          tourJs.src = `${relative}assets/js/guided-tour.js`;
          document.head.appendChild(tourJs);
        }
      };
    }
  } catch (_) {}
  try {
    let fav = document.querySelector('link[rel="icon"]');
    if (!fav) {
      fav = document.createElement('link');
      fav.rel = 'icon';
      document.head.appendChild(fav);
    }
    fav.type = 'image/png';
    fav.href = `${relative}assets/branding/favicon-32.png`;

    let appleFav = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleFav) {
      appleFav = document.createElement('link');
      appleFav.rel = 'apple-touch-icon';
      document.head.appendChild(appleFav);
    }
    appleFav.href = `${relative}assets/branding/apple-touch-icon.png`;
  } catch (_) {}
  if (path.includes('hab_permainan')) applyGameProgress();
  if (path.includes('modul_pembelajaran')) appendPublishedModules();
  const menuButton = document.querySelector('[data-ars-menu]');
  menuButton.addEventListener('click', () => {
    const open = document.body.classList.toggle('ars-mobile-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? 'close' : 'menu';
  });
  document.querySelectorAll('[data-ars-close], .ars-nav a').forEach(el => el.addEventListener('click', () => {
    document.body.classList.remove('ars-mobile-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('span').textContent = 'menu';
  }));
  const collapse = document.querySelector('[data-ars-collapse]');
  collapse.addEventListener('click', () => {
    const compact = document.body.classList.toggle('ars-collapsed');
    collapse.setAttribute('aria-pressed', String(compact));
    collapse.setAttribute('aria-label', compact ? 'Besarkan menu' : 'Kecilkan menu');
    collapse.querySelector('span').textContent = compact ? 'left_panel_open' : 'left_panel_close';
    try { localStorage.setItem('arselnel_sidebar_collapsed', String(compact)); } catch (_) {}
  });
  try {
    if (localStorage.getItem('arselnel_sidebar_collapsed') === 'true' && innerWidth > 760) {
      document.body.classList.add('ars-collapsed');
      collapse.setAttribute('aria-pressed', 'true');
      collapse.setAttribute('aria-label', 'Besarkan menu');
      collapse.querySelector('span').textContent = 'left_panel_open';
    }
  } catch (_) {}
  document.querySelector('[data-ars-logout]').addEventListener('click', async () => {
    if (user && user.authProvider === 'supabase' && window.ARSupabase) {
      try { await ARSupabase.signOut(); } catch (error) { console.warn('Supabase sign out failed.', error); }
      if (window.AuthGuard && AuthGuard.logout) AuthGuard.logout(relative + 'auth/login.html', true);
      return;
    }
    if (window.Auth && Auth.logout) Auth.logout(relative + 'auth/login.html');
    else if (window.AuthGuard && AuthGuard.logout) AuthGuard.logout(relative + 'auth/login.html');
    else location.href = relative + 'auth/login.html';
  });
  const dataLabel = document.querySelector('[data-ars-data-label]');
  const dataIcon = document.querySelector('[data-ars-data-icon]');
  const retryButton = document.querySelector('[data-ars-retry]');
  const pendingCount = () => { try { return JSON.parse(localStorage.getItem('arselnel_supabase_pending_writes') || '[]').length; } catch (_) { return 0; } };
  function showDataState(icon, label, retry) {
    if (dataIcon) dataIcon.textContent = icon;
    if (dataLabel) dataLabel.textContent = label;
    if (retryButton) retryButton.hidden = !retry;
  }
  if (window.ARSupabase) {
    ARSupabase.ready.then(state => {
      if (state.configured) showDataState('⚪', 'Belum ada simpanan awan disahkan', pendingCount() > 0);
      else showDataState('⚪', 'Belum disambungkan — data setempat', false);
    });
    window.addEventListener('arselnel:persistence', event => {
      const detail = event.detail || {};
      const icons = { saving: '🟡', saved: '🟢', failed: '🔴' };
      showDataState(icons[detail.state] || '⚪', detail.message || 'Status simpanan tidak diketahui', pendingCount() > 0);
    });
    if (retryButton) {
      retryButton.addEventListener('click', async () => {
        retryButton.disabled = true;
        showDataState('🟡', 'Mencuba menyegerakkan data…', false);
        try { await ARSupabase.retryPending(); }
        catch (error) { showDataState('🔴', error.message || 'Penyegerakan gagal.', pendingCount() > 0); }
        finally { retryButton.disabled = false; }
      });
    }
  } else showDataState('⚪', 'Belum disambungkan — data setempat', false);

  function applyPreferences() {
    const root = document.documentElement;
    document.body.classList.toggle('ars-dark', preferences.appearance === 'dark');
    document.body.classList.toggle('ars-no-motion', preferences.animations === false || preferences.reducedMotion === true);
    document.body.classList.toggle('ars-no-quiz-motion', preferences.quizAnimations === false || preferences.reducedMotion === true);
    document.body.classList.toggle('ars-high-contrast', preferences.highContrast === true);
    root.style.fontSize = `${Math.min(125, Math.max(90, Number(preferences.fontSize) || 100))}%`;
    root.style.setProperty('--brand-primary', '#2563eb');
    root.style.setProperty('--ars-blue', '#2563eb');
    root.style.setProperty('--ars-teal', '#14b8a6');
    window.ARSelNelPreferences = {
      get: () => preferences,
      save: (next) => { preferences = next; applyPreferences(); },
      playSound: (kind) => {
        if (!preferences.soundEffects) return;
        try {
          const AudioContextType = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextType) return;
          const audio = new AudioContextType();
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.frequency.value = kind === 'success' ? 740 : 420;
          gain.gain.setValueAtTime(0.055, audio.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.11);
          oscillator.connect(gain); gain.connect(audio.destination);
          oscillator.start(); oscillator.stop(audio.currentTime + 0.11);
          oscillator.onended = () => audio.close();
        } catch (_) {}
      }
    };
  }

  function applyGameProgress() {
    const progressKey = `arselnel_learning_progress_${user && user.id ? user.id : 'guest'}`;
    let record = {};
    try { record = JSON.parse(localStorage.getItem(progressKey) || '{}'); } catch (_) {}
    const quizzes = Array.isArray(record.quizzes) ? record.quizzes : [];
    const scores = quizzes.map(item => Number(item.score)).filter(Number.isFinite);
    const best = scores.length ? Math.max(...scores) : null;
    const badges = (quizzes.length ? 1 : 0) + (quizzes.length >= 5 ? 1 : 0) + (scores.some(score => score >= 80) ? 1 : 0);
    const values = {
      'game-stat-quizzes': String(quizzes.length),
      'game-stat-best-score': best === null ? '—' : String(best),
      'game-stat-badges': String(badges)
    };
    Object.entries(values).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    });
    const name = document.getElementById('game-record-name');
    const score = document.getElementById('game-record-score');
    if (name) name.textContent = `Skor terbaik ${user && user.nickname ? user.nickname : 'anda'}`;
    if (score && best !== null) score.textContent = `${best}% daripada ${quizzes.length} kuiz direkodkan`;
  }

  function appendPublishedModules() {
    const host = document.querySelector('main');
    if (!host) return;
    const key = localStorage.getItem('arselnel_demo_mode') === 'true' ? 'arselnel_demo_arselnel_cms_modules' : 'arselnel_cms_modules';
    let modules = [];
    try { modules = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
    modules = Array.isArray(modules) ? modules.filter(item => item && item.status === 'published') : [];
    if (!modules.length) return;
    const section = document.createElement('section');
    section.className = 'mx-auto my-8 w-[min(94%,1200px)] space-y-4';
    const heading = document.createElement('h2');
    heading.className = 'text-2xl font-extrabold text-slate-800';
    heading.textContent = 'Modul terkini daripada guru';
    section.appendChild(heading);
    modules.forEach(module => {
      const card = document.createElement('article');
      card.className = 'rounded-3xl border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-5 shadow-sm';
      const chapter = document.createElement('p'); chapter.className = 'text-xs font-bold uppercase tracking-wide text-teal-700'; chapter.textContent = module.chapter || 'Modul Sains';
      const title = document.createElement('h3'); title.className = 'mt-1 text-xl font-extrabold text-slate-800'; title.textContent = module.title || 'Modul pembelajaran';
      const description = document.createElement('p'); description.className = 'mt-1 text-sm text-slate-600'; description.textContent = module.description || '';
      const content = document.createElement('div'); content.className = 'mt-4 whitespace-pre-wrap rounded-2xl bg-white/80 p-4 text-sm leading-7 text-slate-700'; content.textContent = module.content || '';
      card.append(chapter, title, description, content);
      section.appendChild(card);
    });
    host.appendChild(section);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  }
  function validAvatar(value) {
    return typeof value === 'string' && (
      ['../assets/home/avatar.svg','../assets/home/avatar_rec1.svg','../assets/home/avatar_rec2.svg','../assets/home/avatar_rec3.svg'].includes(value) ||
      /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)
    );
  }
})();
