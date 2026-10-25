/**
 * ARSelNel - Role-Based Authentication Module (auth.js)
 * Manages user sessions, role-based access control, registration, and demo accounts.
 * Works seamlessly with localStorage / sessionStorage and optional backend API.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    CURRENT_USER: 'arselnel_current_user',
    TOKEN: 'arselnel_auth_token',
    REMEMBER_ME: 'arselnel_remember',
    USERS: 'arselnel_users_db',
    ADMIN_FLAG: 'arselnelAdmin', // backwards-compatibility with existing pages
  };

  // Default seed users
  const DEFAULT_USERS = [
    {
      id: 'usr_admin_1',
      name: 'Cikgu Zulaikha (Admin)',
      email: 'admin@arselnel.my',
      username: 'admin',
      role: 'admin',
      department: 'Panitia Sains Tingkatan 1',
      avatar: '../assets/home/avatar.svg',
      createdAt: '2026-01-10',
      status: 'active'
    },
    {
      id: 'usr_teacher_1',
      name: 'Ustaz/Cikgu Razak',
      email: 'razak@arselnel.my',
      username: 'cikgurazak',
      role: 'teacher',
      department: 'Guru Sains & Makmal',
      avatar: '../assets/home/avatar.svg',
      createdAt: '2026-02-15',
      status: 'active'
    },
    {
      id: 'usr_std_1',
      name: 'Aina Sofea binti Ahmad',
      email: 'aina@email.com',
      username: 'ainasofea',
      role: 'student',
      grade: 'Tingkatan 1 Al-Farabi',
      avatar: '../assets/home/avatar.svg',
      score: 95,
      quizzesTaken: 8,
      createdAt: '2026-03-01',
      status: 'active'
    },
    {
      id: 'usr_std_2',
      name: 'Danial Hakim bin Rosli',
      email: 'danial@email.com',
      username: 'danialh',
      role: 'student',
      grade: 'Tingkatan 1 Ibn Sina',
      avatar: '../assets/home/avatar_rec1.svg',
      score: 85,
      quizzesTaken: 6,
      createdAt: '2026-03-04',
      status: 'active'
    },
    {
      id: 'usr_std_3',
      name: 'Nurul Izzah binti Razali',
      email: 'izzah@email.com',
      username: 'izzahr',
      role: 'student',
      grade: 'Tingkatan 1 Al-Biruni',
      avatar: '../assets/home/avatar_rec2.svg',
      score: 90,
      quizzesTaken: 7,
      createdAt: '2026-03-10',
      status: 'active'
    }
  ];

  class AuthManager {
    constructor() {
      this.initDB();
    }

    initDB() {
      try {
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!storedUsers) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        } else {
          const safeUsers = JSON.parse(storedUsers).map(user => {
            const safe = { ...user };
            delete safe.password; delete safe.passcode; delete safe.token; delete safe.authToken;
            return safe;
          });
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(safeUsers));
        }
        // Older registration code kept a password field in browser records.
        // Keep each profile and all non-credential fields, but remove credential
        // material because localStorage is not a secure password store.
        for (const key of ['registered_users', STORAGE_KEYS.CURRENT_USER, 'currentUser']) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const value = JSON.parse(raw);
            const clean = record => {
              if (!record || typeof record !== 'object') return record;
              const safe = { ...record };
              ['password','passcode','token','authToken','accessToken','refreshToken'].forEach(field => delete safe[field]);
              return safe;
            };
            const sanitized = Array.isArray(value) ? value.map(clean) : clean(value);
            localStorage.setItem(key, JSON.stringify(sanitized));
          } catch (_) {}
        }
        for (const key of [STORAGE_KEYS.CURRENT_USER, 'currentUser']) {
          const raw = sessionStorage.getItem(key);
          if (!raw) continue;
          try {
            const safe = JSON.parse(raw);
            ['password','passcode','token','authToken','accessToken','refreshToken'].forEach(field => delete safe[field]);
            sessionStorage.setItem(key, JSON.stringify(safe));
          } catch (_) {}
        }
      } catch (e) {
        console.warn('Storage unavailable, using memory store', e);
      }
    }

    getUsers() {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        return stored ? JSON.parse(stored) : DEFAULT_USERS;
      } catch (e) {
        return DEFAULT_USERS;
      }
    }

    saveUsers(users) {
      try {
        const safeUsers = users.map(user => { const safe = { ...user }; delete safe.password; delete safe.passcode; delete safe.token; delete safe.authToken; return safe; });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(safeUsers));
      } catch (e) {
        console.error('Failed to save users', e);
      }
    }

    getCurrentUser() {
      try {
        // Check localStorage first (remember me), then sessionStorage
        const local = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (local) return JSON.parse(local);

        const session = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (session) return JSON.parse(session);

        // Fallback for existing admin flag
        if (sessionStorage.getItem(STORAGE_KEYS.ADMIN_FLAG) === 'true') {
          return DEFAULT_USERS[0];
        }

        return null;
      } catch (e) {
        return null;
      }
    }

    isLoggedIn() {
      return !!this.getCurrentUser();
    }

    isAdmin() {
      const user = this.getCurrentUser();
      return user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'teacher' || user.role === 'guru');
    }

    isSuperAdmin() {
      const user = this.getCurrentUser();
      if (!user) return false;
      const email = (user.email || '').toLowerCase();
      return user.role === 'superadmin' || user.isSuperAdmin === true || email === 'admin@test.com';
    }

    isTeacher() {
      const user = this.getCurrentUser();
      return user && (user.role === 'teacher' || user.role === 'guru');
    }

    isStudent() {
      const user = this.getCurrentUser();
      return user && (user.role === 'student' || user.role === 'pelajar');
    }

    login(identifier, password, expectedRole = null, rememberMe = false) {
      return { success: false, message: 'Log masuk akaun sebenar belum disambungkan kepada pelayan pengesahan. Gunakan mod demo setempat untuk meneroka.' };
    }

    register(data) {
      return { success: false, message: 'Pendaftaran akaun memerlukan pelayan yang menyimpan kata laluan secara selamat. Tiada kata laluan telah disimpan.' };
    }

    logout(redirectUrl = '../auth/login.html') {
      try {
        if (global.ARSupabase && typeof global.ARSupabase.signOut === 'function') {
          global.ARSupabase.signOut().catch(() => {});
        }
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem('currentUser');
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem('arselnel_demo_mode');
        localStorage.removeItem(STORAGE_KEYS.ADMIN_FLAG);
        localStorage.removeItem('arselnelAdmin');
        localStorage.removeItem('arselnel_local_migration_source');
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_FLAG);
        sessionStorage.removeItem('arselnelAdmin');
        sessionStorage.removeItem('arselnel_local_migration_source');
      } catch (e) {
        console.error('Error logging out', e);
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }

    demoLogin(role = 'student') {
      return {
        success: false,
        message: 'Mod demo tidak lagi disokong dalam persekitaran produksi. Sila daftar akaun atau log masuk menggunakan akaun rasmi anda.'
      };
    }

    requireAuth(redirectTo = '../login/code.html') {
      if (!this.isLoggedIn()) {
        const current = encodeURIComponent(window.location.pathname);
        window.location.replace(`${redirectTo}?redirect=${current}`);
        return false;
      }
      return true;
    }

    requireAdmin(redirectTo = '../login/code.html') {
      const user = this.getCurrentUser();
      if (!user || !['admin', 'teacher', 'guru'].includes(user.role)) {
        alert('Akses Terhad: Halaman ini hanya untuk Guru dan Pentadbir sistem.');
        window.location.replace(`${redirectTo}?role=admin`);
        return false;
      }
      return true;
    }

    /**
     * Utility to attach interactive user navbar state on any page
     */
    mountUserNav() {
      const user = this.getCurrentUser();
      const profileContainer = document.querySelector('a[aria-label="Profil Pelajar"], #user-nav-container');
      
      if (!user) return;

      if (profileContainer) {
        // Upgrade profile link to interactive menu or display username
        profileContainer.setAttribute('title', `${user.name} (${user.role})`);
        const img = profileContainer.querySelector('img');
        if (img && user.avatar) img.src = user.avatar;
      }
    }
  }

  // Export singleton instance
  global.Auth = new AuthManager();

})(typeof window !== 'undefined' ? window : this);
