(function () {
  'use strict';
  const USER_KEY = 'arselnel_current_user';
  const PROGRESS_PREFIX = 'arselnel_learning_progress_';
  const PREF_PREFIX = 'arselnel_preferences_';
  const DEFAULT_AVATAR = '../assets/home/avatar.svg';

  function getUser() {
    return window.AuthGuard && AuthGuard.getUser ? AuthGuard.getUser() : null;
  }
  function userId(user) { return user && user.id ? String(user.id) : 'guest'; }
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (_) { return fallback; }
  }
  function progressFor(user) {
    const record = readJSON(PROGRESS_PREFIX + userId(user), {});
    return { quizzes: Array.isArray(record.quizzes) ? record.quizzes : [], completedLessons: Array.isArray(record.completedLessons) ? record.completedLessons : [] };
  }
  function persistUser(user) {
    if (window.AuthGuard && AuthGuard.saveUser) AuthGuard.saveUser(user, user.authProvider !== 'supabase');
    else {
      try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (_) { return false; }
    }
    const saved = getUser();
    return !!saved && saved.name === user.name && saved.nickname === user.nickname && saved.avatar === user.avatar;
  }
  function setStatus(target, message, error) {
    if (!target) return;
    target.textContent = message;
    target.style.color = error ? '#b91c1c' : '';
  }

  const profilePage = document.querySelector('[data-profile-page]');
  if (profilePage) initProfile(profilePage);
  const settingsPage = document.querySelector('[data-settings-page]');
  if (settingsPage) initSettings(settingsPage);

  function initProfile(root) {
    const user = getUser() || {};
    const preview = root.querySelector('#profile-avatar-preview');
    const nameField = root.querySelector('#profile-name');
    const nicknameField = root.querySelector('#profile-nickname');
    const classField = root.querySelector('#profile-class');
    const levelField = root.querySelector('#profile-level-field');
    const className = user.grade || user.className || 'Belum ditetapkan';
    let selectedAvatar = validAvatar(user.avatar) ? user.avatar : DEFAULT_AVATAR;

    nameField.value = user.name || '';
    nicknameField.value = user.nickname || '';
    classField.value = className;
    levelField.value = user.level || (String(className).match(/Tingkatan\s*\d+/i) || ['Tingkatan 1'])[0];
    root.querySelector('#profile-preview-name').textContent = user.nickname || user.name || 'Saintis Muda';
    root.querySelector('#profile-preview-class').textContent = className;
    root.querySelector('#profile-level').textContent = levelField.value;
    preview.src = selectedAvatar;
    const avatarChoices = [...root.querySelectorAll('input[name="avatar"]')];
    const matching = avatarChoices.find(input => input.value === selectedAvatar);
    if (matching) matching.checked = true;

    const progress = progressFor(user);
    root.querySelector('#profile-quiz-count').textContent = progress.quizzes.length;
    root.querySelector('#profile-lesson-count').textContent = progress.completedLessons.length;
    const scores = progress.quizzes.map(item => Number(item.score)).filter(Number.isFinite);
    root.querySelector('#profile-best-score').textContent = scores.length ? `${Math.max(...scores)}%` : '—';
    const badges = root.querySelector('#profile-badges');
    if (progress.quizzes.length) {
      badges.innerHTML = '<span class="ars-badge">🏅 Kuiz pertama</span>';
      if (progress.quizzes.length >= 5) badges.insertAdjacentHTML('beforeend', '<span class="ars-badge">🔬 Tekun berlatih</span>');
      if (scores.some(score => score >= 80)) badges.insertAdjacentHTML('beforeend', '<span class="ars-badge">🌟 Skor hebat</span>');
    }

    function updatePreview() {
      preview.src = selectedAvatar;
      root.querySelector('#profile-preview-name').textContent = nicknameField.value.trim() || nameField.value.trim() || 'Saintis Muda';
    }
    avatarChoices.forEach(input => input.addEventListener('change', () => {
      selectedAvatar = input.value;
      updatePreview();
    }));
    nameField.addEventListener('input', updatePreview);
    nicknameField.addEventListener('input', updatePreview);

    root.querySelector('#avatar-reset').addEventListener('click', () => {
      selectedAvatar = DEFAULT_AVATAR;
      const defaultChoice = avatarChoices.find(input => input.value === DEFAULT_AVATAR);
      if (defaultChoice) defaultChoice.checked = true;
      updatePreview();
      setStatus(root.querySelector('#profile-status'), 'Avatar asal dipilih. Tekan “Simpan profil” untuk menyimpan perubahan.');
    });

    root.querySelector('#profile-upload').addEventListener('change', async event => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
        setStatus(root.querySelector('#profile-status'), 'Pilih gambar PNG, JPEG atau WebP yang bersaiz bawah 8 MB.', true);
        event.target.value = '';
        return;
      }
      try {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          selectedAvatar = canvas.toDataURL('image/jpeg', 0.82);
          preview.src = selectedAvatar;
          avatarChoices.forEach(input => { input.checked = false; });
          updatePreview();
          setStatus(root.querySelector('#profile-status'), 'Gambar dipilih dan dikecilkan untuk disimpan. Tekan “Simpan profil”.');
          URL.revokeObjectURL(imageUrl);
        };
        image.onerror = () => { URL.revokeObjectURL(imageUrl); setStatus(root.querySelector('#profile-status'), 'Gambar ini tidak dapat dibuka.', true); };
        image.src = imageUrl;
      } catch (_) {
        setStatus(root.querySelector('#profile-status'), 'Gambar tidak dapat diproses pada peranti ini.', true);
      }
      event.target.value = '';
    });

    root.querySelector('#profile-form').addEventListener('submit', async event => {
      event.preventDefault();
      const cleanName = nameField.value.trim();
      if (!cleanName) {
        setStatus(root.querySelector('#profile-status'), 'Masukkan nama paparan anda dahulu.', true);
        nameField.focus();
        return;
      }
      const updatedUser = { ...user, name: cleanName, nickname: nicknameField.value.trim().slice(0, 24), avatar: selectedAvatar };
      if (!persistUser(updatedUser)) {
        setStatus(root.querySelector('#profile-status'), 'Profil tidak dapat disimpan. Semak ruang storan pelayar pada peranti ini.', true);
        return;
      }
      if (updatedUser.authProvider === 'supabase' && window.ARSupabase) {
        try {
          await ARSupabase.saveProfile({ full_name: updatedUser.name, nickname: updatedUser.nickname, class_name: updatedUser.grade || updatedUser.className, avatar: updatedUser.avatar });
        } catch (error) {
          setStatus(root.querySelector('#profile-status'), 'Salinan profil disimpan pada peranti ini, tetapi belum disegerakkan. Cuba butang “Cuba semula simpanan” pada menu.', true);
          return;
        }
      }
      const shownName = updatedUser.nickname || updatedUser.name.split(' ')[0];
      document.querySelectorAll('.ars-profile-label').forEach(el => {
        const detail = el.querySelector('small');
        el.textContent = shownName;
        if (detail) { el.appendChild(detail); }
      });
      document.querySelectorAll('.ars-user-name').forEach(el => { el.textContent = shownName; });
      document.querySelectorAll('.ars-topbar-greeting').forEach(el => { el.textContent = `Hai, ${shownName}!`; });
      document.querySelectorAll('.ars-side-profile img').forEach(img => { img.src = selectedAvatar; });
      setStatus(root.querySelector('#profile-status'), 'Profil berjaya disimpan! Nama dan avatar anda telah dikemas kini.');
    });
  }

  function initSettings(root) {
    const user = getUser() || {};
    const prefsKey = PREF_PREFIX + userId(user);
    const defaults = { appearance: 'light', fontSize: 100, animations: true, quizAnimations: true, soundEffects: false, highContrast: false, reducedMotion: false };
    const prefs = { ...defaults, ...readJSON(prefsKey, {}) };
    let settingsChanged = false;
    let saveTimer = null;
    const status = root.querySelector('#settings-status');
    const progress = progressFor(user);
    root.querySelector('#settings-email').textContent = user.email || 'E-mel tidak tersedia';
    updateProgressSummary();

    const appearance = root.querySelector('#setting-appearance');
    const font = root.querySelector('#setting-font');
    const fontValue = root.querySelector('#setting-font-value');
    const fields = {
      animations: root.querySelector('#setting-animations'),
      highContrast: root.querySelector('#setting-contrast'),
      soundEffects: root.querySelector('#setting-sound'),
      quizAnimations: root.querySelector('#setting-quiz-animations'),
      reducedMotion: root.querySelector('#setting-reduced-motion')
    };
    appearance.value = prefs.appearance;
    font.value = String(prefs.fontSize);
    Object.entries(fields).forEach(([key, input]) => { input.checked = !!prefs[key]; });
    updateFontLabel();

    function persist(message) {
      try {
        localStorage.setItem(prefsKey, JSON.stringify(prefs));
        if (window.ARSelNelPreferences && ARSelNelPreferences.save) ARSelNelPreferences.save(prefs);
        else applyPrefs(prefs);
        if (user.authProvider === 'supabase' && window.ARSupabase) {
          clearTimeout(saveTimer);
          ARSupabase.announce('saving', 'Perubahan tetapan menunggu simpanan…');
          saveTimer = setTimeout(() => {
            ARSupabase.saveSettings(prefs).then(() => setStatus(status, message || 'Tetapan disimpan ke akaun Supabase.'))
              .catch(() => setStatus(status, 'Tetapan disimpan pada peranti ini, tetapi belum disegerakkan. Cuba semula melalui menu.', true));
          }, 300);
        } else setStatus(status, message || 'Tetapan disimpan pada peranti ini sahaja.');
      } catch (_) {
        setStatus(status, 'Ruang simpanan pelayar tidak tersedia. Tetapan ini mungkin tidak kekal selepas halaman ditutup.', true);
      }
    }
    function updateFontLabel() {
      fontValue.textContent = `${prefs.fontSize}%${Number(prefs.fontSize) === 100 ? ' — biasa' : ''}`;
    }
    if (user.authProvider === 'supabase' && window.ARSupabase) {
      ARSupabase.getSettings().then(remote => {
        if (!remote || settingsChanged) return;
        Object.assign(prefs, defaults, remote);
        appearance.value = prefs.appearance;
        font.value = String(prefs.fontSize);
        Object.entries(fields).forEach(([key, input]) => { input.checked = !!prefs[key]; });
        updateFontLabel(); applyPrefs(prefs);
        try { localStorage.setItem(prefsKey, JSON.stringify(prefs)); } catch (_) {}
      }).catch(() => {});
    }
    appearance.addEventListener('change', () => { settingsChanged = true; prefs.appearance = appearance.value; persist(); });
    font.addEventListener('input', () => { settingsChanged = true; prefs.fontSize = Number(font.value); updateFontLabel(); persist(); });
    Object.entries(fields).forEach(([key, input]) => input.addEventListener('change', () => { settingsChanged = true; prefs[key] = input.checked; persist(); }));

    root.querySelector('#reset-progress').addEventListener('click', () => {
      const quizCount = progress.quizzes.length;
      const lessonCount = progress.completedLessons.length;
      if (!window.confirm(`Padam rekod kemajuan pada peranti ini? ${quizCount} kuiz dan ${lessonCount} pelajaran yang direkodkan akan dipadam.`)) return;
      localStorage.removeItem(PROGRESS_PREFIX + userId(user));
      progress.quizzes = [];
      progress.completedLessons = [];
      updateProgressSummary();
      setStatus(status, 'Rekod kemajuan pada peranti ini telah dipadam.');
    });
    root.querySelector('#settings-logout').addEventListener('click', () => {
      if (!window.confirm('Log keluar daripada ARSelNel sekarang?')) return;
      if (user.authProvider === 'supabase' && window.ARSupabase) {
        ARSupabase.signOut().catch(() => {}).finally(() => AuthGuard.logout('../auth/login.html', true));
        return;
      }
      if (window.Auth && Auth.logout) Auth.logout('../auth/login.html');
      else if (window.AuthGuard && AuthGuard.logout) AuthGuard.logout('../auth/login.html');
      else location.href = '../auth/login.html';
    });
    function updateProgressSummary() {
      const quizzes = progress.quizzes.length;
      const lessons = progress.completedLessons.length;
      root.querySelector('#settings-progress-summary').textContent = quizzes || lessons
        ? `${quizzes} kuiz dan ${lessons} pelajaran direkodkan untuk akaun ini.`
        : 'Tiada rekod kuiz atau pelajaran disimpan untuk akaun ini lagi.';
    }
  }

  function applyPrefs(prefs) {
    const root = document.documentElement;
    const body = document.body;
    body.classList.toggle('ars-dark', prefs.appearance === 'dark');
    body.classList.toggle('ars-no-motion', prefs.animations === false || prefs.reducedMotion === true);
    body.classList.toggle('ars-no-quiz-motion', prefs.quizAnimations === false || prefs.reducedMotion === true);
    body.classList.toggle('ars-high-contrast', prefs.highContrast === true);
    root.style.fontSize = `${Math.min(125, Math.max(90, Number(prefs.fontSize) || 100))}%`;
    root.style.setProperty('--ars-blue', '#2563eb');
    root.style.setProperty('--ars-teal', '#14b8a6');
  }

  function validAvatar(value) {
    return typeof value === 'string' && (
      ['../assets/home/avatar.svg','../assets/home/avatar_rec1.svg','../assets/home/avatar_rec2.svg','../assets/home/avatar_rec3.svg'].includes(value) ||
      /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)
    );
  }
})();
