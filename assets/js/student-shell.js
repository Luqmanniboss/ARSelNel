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
  const preferenceKey = `arselnel_preferences_${user && user.id ? user.id : 'guest'}`;
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(preferenceKey) || '{}'); } catch (_) {}
  const destinations = pages.map(([id, label, icon, dir]) => {
    const active = id === key ? ' aria-current="page"' : '';
    const href = id === 'achievements' ? `${relative}${dir}/code.html?view=achievements#profile-badges` : `${relative}${dir}/code.html`;
    return `<a href="${href}"${active} data-nav-id="${id}" title="${label}"><span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${label}</span></a>`;
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
        <a class="ars-side-settings${key === 'settings' ? ' ars-settings-current' : ''}" data-nav-id="settings" href="${relative}tetapan/code.html" title="Tetapan"${key === 'settings' ? ' aria-current="page"' : ''}><span class="material-symbols-outlined" aria-hidden="true">settings</span><span>Tetapan</span></a>
        <button class="ars-side-logout" type="button" title="Log keluar" data-ars-logout><span class="material-symbols-outlined" aria-hidden="true">logout</span><span>Log keluar</span></button>
      </div>
    </aside>
    <div class="ars-topbar">
      <button class="ars-icon-button ars-mobile-menu" type="button" aria-label="Buka menu" aria-expanded="false" data-ars-menu><span class="material-symbols-outlined" aria-hidden="true">menu</span></button>
      <button class="ars-icon-button ars-desktop-collapse" type="button" aria-label="Kecilkan menu" aria-pressed="false" data-ars-collapse><span class="material-symbols-outlined" aria-hidden="true">left_panel_close</span></button>
      <div class="ars-page-title">${title}</div>
      <div class="ars-topbar-greeting">Hai, ${safeName}!</div>
      <button class="ars-icon-button" type="button" aria-label="Notifikasi"><span class="material-symbols-outlined" aria-hidden="true">notifications</span></button>
      <a class="ars-side-profile ars-top-profile" href="${relative}profil/code.html" style="padding:4px 8px;min-height:42px" aria-label="Profil ${safeName}"><img src="${avatar}" alt=""/><span class="ars-user-name">${safeNickname}</span></a>
    </div>`);
  applyPreferences();
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
