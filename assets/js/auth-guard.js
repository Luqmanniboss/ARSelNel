/**
 * ARSelNel - Global Session & Access Guard (auth-guard.js)
 * Manages user access, route protection, guest mode limits, and shared limitation modal.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    CURRENT_USER: 'arselnel_current_user',
    LEGACY_USER: 'currentUser',
    USERS: 'arselnel_users_db',
    REGISTERED: 'registered_users',
    GUEST_SESSION: 'arselnel_guest_session',
    GUEST_PROMPTS: 'arselnel_guest_ai_prompts',
    GUEST_QUIZ_COUNT: 'arselnel_guest_quiz_count',
  };

  class AuthGuardManager {
    constructor() {
      this.init();
    }

    init() {
      this.removeLegacyCredentials();
      // Sync currentUser between keys if needed
      const user = this.getUser();
      if (user) {
        // Supabase-backed users are cached only for this tab, matching the
        // Auth client's sessionStorage token lifetime.
        this.saveUser(user, user.authProvider !== 'supabase');
      }
    }

    removeLegacyCredentials() {
      const fields = ['password','passcode','token','authToken','accessToken','refreshToken'];
      for (const store of [localStorage, sessionStorage]) {
        for (const key of ['registered_users', 'arselnel_users_db', STORAGE_KEYS.CURRENT_USER, STORAGE_KEYS.LEGACY_USER]) {
          try {
            const raw = store.getItem(key);
            if (!raw) continue;
            const value = JSON.parse(raw);
            const clean = record => {
              if (!record || typeof record !== 'object') return record;
              const safe = { ...record };
              fields.forEach(field => delete safe[field]);
              return safe;
            };
            store.setItem(key, JSON.stringify(Array.isArray(value) ? value.map(clean) : clean(value)));
          } catch (_) {}
        }
      }
    }

    getUser() {
      try {
        const primary = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (primary) return JSON.parse(primary);

        const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
        if (legacy) return JSON.parse(legacy);

        return null;
      } catch (e) {
        return null;
      }
    }

    saveUser(user, remember = true) {
      try {
        // Session/profile records contain no credential material. Passwords and tokens
        // are never needed by the route guard or student-facing profile controls.
        const profile = { ...user };
        delete profile.password;
        delete profile.token;
        delete profile.authToken;
        delete profile.accessToken;
        const json = JSON.stringify(profile);
        if (remember) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, json);
          localStorage.setItem(STORAGE_KEYS.LEGACY_USER, json);
        } else {
          sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, json);
        }
      } catch (e) {
        console.error('Failed to save user', e);
      }
    }

    isLoggedIn() {
      return !!this.getUser();
    }

    isGuest() {
      const user = this.getUser();
      return !!(user && (user.role === 'guest' || user.isGuest === true));
    }

    isAdmin() {
      const user = this.getUser();
      return !!(user && (user.role === 'admin' || user.role === 'guru' || user.role === 'teacher'));
    }

    isStudent() {
      const user = this.getUser();
      return !!(user && user.role === 'student' && !user.isGuest);
    }

    setGuestSession() {
      localStorage.removeItem('arselnel_demo_mode');
      const guestUser = {
        id: 'guest_' + Date.now(),
        name: 'Pengembara Sains (Tetamu)',
        username: 'tetamu',
        email: 'tetamu@arselnel.my',
        role: 'guest',
        isGuest: true,
        grade: 'Mod Tetamu',
        avatar: '../assets/home/avatar.svg',
        createdAt: new Date().toISOString(),
        usageCount: {
          notes: 1,
          videos: 1,
          quizzes: 3,
          arScans: 1,
          aiPrompts: 0
        }
      };

      // Persist guest session to both localStorage and sessionStorage for cross-page persistence
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
      localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(guestUser));
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
      sessionStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(guestUser));
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_PROMPTS);
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_QUIZ_COUNT);
      localStorage.removeItem(STORAGE_KEYS.GUEST_PROMPTS);
      localStorage.removeItem(STORAGE_KEYS.GUEST_QUIZ_COUNT);
      return guestUser;
    }

    logout(redirectUrl, preserveLocalProfile = false) {
      if (!preserveLocalProfile) {
        const outgoing = this.getUser();
        if (outgoing && outgoing.role === 'student' && !outgoing.isGuest && outgoing.authProvider !== 'supabase') {
          try { sessionStorage.setItem('arselnel_local_migration_source', JSON.stringify({ id: outgoing.id, name: outgoing.name, nickname: outgoing.nickname, role: outgoing.role, isDemo: outgoing.isDemo === true })); } catch (_) {}
        }
      }
      if (!preserveLocalProfile) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
      }
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_PROMPTS);
      sessionStorage.removeItem(STORAGE_KEYS.GUEST_QUIZ_COUNT);
      localStorage.removeItem(STORAGE_KEYS.GUEST_PROMPTS);
      localStorage.removeItem(STORAGE_KEYS.GUEST_QUIZ_COUNT);

      const target = redirectUrl || this.getRelativePath('auth/login.html');
      window.location.href = target;
    }

    /**
     * Compute relative path to root or auth directory based on current pathname
     */
    getRelativePath(targetFile) {
      const path = window.location.pathname.replace(/\\/g, '/');
      const isSubfolder = path.includes('/halaman_utama/') ||
                          path.includes('/nota_pembelajaran/') ||
                          path.includes('/butiran_nota/') ||
                          path.includes('/perpustakaan_video/') ||
                          path.includes('/pemain_video/') ||
                          path.includes('/kuiz_interaktif/') ||
                          path.includes('/hab_permainan/') ||
                          path.includes('/keputusan_permainan/') ||
                          path.includes('/pengimbas_ar/') ||
                          path.includes('/paparan_model_ar/') ||
                          path.includes('/selbot_ai/') ||
                          path.includes('/profil/') ||
                          path.includes('/tetapan/') ||
                          path.includes('/admin/') ||
                          path.includes('/admin_dashboard/') ||
                          path.includes('/login/') ||
                          path.includes('/auth/');

      return isSubfolder ? `../${targetFile}` : `./${targetFile}`;
    }

    /**
     * Protect page. Redirects to login if not authenticated.
     */
    protectPage(options = {}) {
      const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
      const isAuthPage = currentPath.includes('/auth/') || 
                         currentPath.includes('/login') || 
                         currentPath.includes('/register') || 
                         currentPath.includes('/splash_screen') || 
                         currentPath.includes('/selamat_datang');

      if (isAuthPage) return true;

      const user = this.getUser();
      if (!user) {
        // Not logged in, redirect immediately to login
        const loginUrl = this.getRelativePath('auth/login.html');
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.replace(`${loginUrl}?redirect=${returnUrl}`);
        return false;
      }

      // If page requires Admin
      if (options.requireAdmin && !this.isAdmin()) {
        alert('Akses Terhad: Halaman ini memerlukan kebenaran Pentadbir / Guru.');
        window.location.replace(this.getRelativePath('auth/login.html?role=admin'));
        return false;
      }

      // If in guest mode, render the banner
      if (this.isGuest()) {
        this.renderGuestBanner();
      }

      return true;
    }

    /**
     * Injects a floating / sticky guest mode notification banner
     */
    renderGuestBanner() {
      if (document.getElementById('arselnel-guest-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'arselnel-guest-banner';
      banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-gradient-to-r from-amber-500/95 to-amber-600/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-amber-300/40 flex items-center justify-between gap-3 text-xs animate-bounce-subtle';
      
      const loginUrl = this.getRelativePath('auth/login.html');
      const registerUrl = this.getRelativePath('auth/register.html');

      banner.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-lg text-white">lock_clock</span>
          </span>
          <div class="min-w-0">
            <strong class="font-bold block truncate">Mod Tetamu (Akses Terhad)</strong>
            <span class="text-[11px] opacity-90 block truncate">Sesetengah topik & model dikunci</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <a href="${registerUrl}" class="px-2.5 py-1.5 rounded-xl bg-white text-amber-900 font-bold hover:bg-amber-50 transition shadow-sm">
            Daftar
          </a>
          <button onclick="this.parentElement.parentElement.remove()" class="text-white/80 hover:text-white p-1 text-base leading-none">
            ×
          </button>
        </div>
      `;

      document.body.appendChild(banner);
    }

    /**
     * Shared guest limitation modal popup
     */
    showGuestLimitModal(featureName = 'Kandungan Penuh', customMessage = null) {
      let modal = document.getElementById('arselnel-guest-modal');
      const loginUrl = this.getRelativePath('auth/login.html');
      const registerUrl = this.getRelativePath('auth/register.html');
      const mascotUrl = this.getRelativePath('assets/home/robot_mascot.svg');

      if (!modal) {
        modal = document.createElement('dialog');
        modal.id = 'arselnel-guest-modal';
        modal.className = 'w-[min(92vw,460px)] rounded-3xl p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm border border-slate-100';
        document.body.appendChild(modal);
      }

      const defaultMsg = `Anda sedang menggunakan <strong>Mod Tetamu</strong> dengan akses terhad. Sila daftar akaun percuma atau log masuk untuk menikmati akses penuh tanpa had bagi <strong>${featureName}</strong>!`;

      modal.innerHTML = `
        <div class="p-6 sm:p-7 text-center relative overflow-hidden bg-white">
          <!-- Top subtle glow background -->
          <div class="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-teal-400/20 blur-2xl pointer-events-none"></div>
          <div class="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"></div>

          <!-- Close button -->
          <button type="button" onclick="document.getElementById('arselnel-guest-modal').close()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg transition">
            ×
          </button>

          <!-- Mascot & Lock Icon Badge -->
          <div class="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <div class="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center p-2.5 shadow-sm">
              <img src="${mascotUrl}" alt="SelBot" class="w-full h-full object-contain" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <span class="material-symbols-outlined text-base">lock</span>
            </div>
          </div>

          <!-- Titles -->
          <span class="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold text-[11px] uppercase tracking-wider mb-2">
            Akses Terhad • Mod Tetamu
          </span>

          <h3 class="font-headline text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
            Kunci Akses Diperlukan
          </h3>

          <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
            ${customMessage || defaultMsg}
          </p>

          <!-- Perks bullet points -->
          <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 text-slate-700">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
              <span>Akses 100% nota KSSM & simulasi sel lengkap</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
              <span>Soalan kuiz tanpa had & simpan skor ke papan pendahulu</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
              <span>Sembang pintar SelBot AI sains tanpa sekatan</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex flex-col gap-2.5">
            <a href="${registerUrl}" class="w-full py-3 px-5 rounded-2xl bg-[#006565] hover:bg-teal-800 text-white font-headline font-bold text-sm shadow-md shadow-teal-950/15 flex items-center justify-center gap-2 transition active:scale-98">
              <span>Daftar Akaun Percuma (1 Minit)</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </a>
            <div class="flex gap-2">
              <a href="${loginUrl}" class="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                <span class="material-symbols-outlined text-sm">login</span>
                <span>Log Masuk</span>
              </a>
              <button type="button" onclick="document.getElementById('arselnel-guest-modal').close()" class="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold text-xs transition">
                Kembali
              </button>
            </div>
          </div>
        </div>
      `;

      modal.showModal();
    }

    /**
     * Guest AI Prompt counter in sessionStorage and localStorage
     */
    getGuestAiPrompts() {
      return parseInt(sessionStorage.getItem(STORAGE_KEYS.GUEST_PROMPTS) || localStorage.getItem(STORAGE_KEYS.GUEST_PROMPTS) || '0', 10);
    }

    incrementGuestAiPrompts() {
      const current = this.getGuestAiPrompts() + 1;
      sessionStorage.setItem(STORAGE_KEYS.GUEST_PROMPTS, current.toString());
      localStorage.setItem(STORAGE_KEYS.GUEST_PROMPTS, current.toString());
      return current;
    }
  }

  // Export singleton
  global.AuthGuard = new AuthGuardManager();
  global.showGuestLimitModal = function (featureName, msg) {
    return global.AuthGuard.showGuestLimitModal(featureName, msg);
  };

  // Auto-protect page when DOM loads
  window.addEventListener('DOMContentLoaded', () => {
    global.AuthGuard.protectPage();
  });

})(typeof window !== 'undefined' ? window : this);
