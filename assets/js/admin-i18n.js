/**
 * ARSelNel - Admin CMS Internationalization (admin-i18n.js)
 * Centralized translation dictionary for Admin Portal.
 * Default interface language: Bahasa Melayu.
 * Supports: Bahasa Melayu (ms) & English (en).
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'arselnel_admin_lang';

  const TRANSLATIONS = {
    ms: {
      // Sidebar
      nav_overview: '1. Papan Pemuka',
      nav_notes: '2. Pengurusan Nota',
      nav_videos: '3. Pengurusan Video',
      nav_quizzes: '4. Pengurusan Kuiz',
      nav_games: '5. Pengurusan Permainan',
      nav_cellquest: '6. Pengurusan CellQuest & Model 3D/AR',
      nav_manual: '7. Pengurusan Manual',
      nav_students: '8. Rekod Pembelajaran',
      nav_account: '9. Tetapan Akaun',
      quick_links: 'Pautan Pantas',
      link_student_site: 'Lihat Laman Pelajar',
      link_test_quiz: 'Uji Modul Kuiz',
      btn_backup: 'Sandaran',
      btn_logout: 'Keluar',
      role_teacher: 'Guru Sains KSSM',

      // Header
      science_f1: 'Sains Tingkatan 1',
      breadcrumb_overview: 'Papan Pemuka',
      app_title: 'Portal Pengurusan Guru & Admin ARSelNel',

      // Overview
      overview_badge: 'Sistem Pengurusan Pembelajaran Sains',
      overview_greeting: 'Selamat Bertugas,',
      overview_subtitle: 'Semua modul pembelajaran mikroskopik, kuiz sel haiwan & tumbuhan, dan model AR bersedia untuk pelajar anda.',
      btn_refresh_data: 'Muat Semula Data',
      last_updated: 'Dikemas kini:',
      just_now: 'Sebentar tadi',

      // Metric Cards
      stat_students_title: 'Jumlah Pelajar',
      stat_students_sub: 'Akaun murid berdaftar',
      stat_quizzes_title: 'Soalan Kuiz',
      stat_quizzes_sub: 'Soalan diterbitkan',
      stat_notes_title: 'Nota KSSM',
      stat_notes_sub: 'Bahan bacaan interaktif',
      stat_videos_title: 'Koleksi Video',
      stat_videos_sub: 'Video amali & penerangan',
      stat_models_title: 'Model 3D & AR',
      stat_models_sub: 'Model sel aktif',

      // Performance & Popular Topics
      performance_title: 'Prestasi Pembelajaran & Topik Popular',
      performance_subtitle: 'Purata penguasaan konsep sel berdasarkan rekod murid sebenar',
      avg_score_label: 'Purata Skor Kuiz:',
      pass_rate_label: 'Kadar Lulus Kuiz',
      note_completion_label: 'Pelajar Selesai Nota',
      active_games_label: 'Sesi Permainan Selesai',
      no_data_performance: 'Belum cukup data untuk analisis.',

      // Activity Feed
      activity_title: 'Log Aktiviti Sains Terkini',
      activity_live_badge: 'Masa Nyata',
      btn_refresh_log: 'Muat Semula Log',
      no_activities: 'Tiada aktiviti pembelajaran direkodkan lagi.',

      // CellQuest & 3D/AR
      cq_title: 'Pengurusan CellQuest & Model 3D/AR',
      cq_subtitle: 'Urus model 3D (sel haiwan, sel tumbuhan & organel), maklumat organel KSSM, sasaran AR serta pratonton interaktif 3D.',
      tab_models: 'Model 3D & GLB',
      tab_organelles: 'Maklumat Organel KSSM',
      tab_preview: 'Pratonton Interaktif 3D',
      tab_ar: 'Tetapan AR (Realiti Terimbuh)',
      btn_add_model: 'Tambah Model 3D',
      btn_add_organelle: 'Tambah Maklumat Organel',
      model_active: 'Aktif & Bersedia',
      model_inactive: 'Nyahaktif',
      preview_controls: 'Kawalan: Klik dan seret untuk putar • Skrol untuk zum • Butang set semula untuk kembali ke pandangan asal.',
      btn_reset_view: 'Set Semula Pandangan',
      btn_rotate: 'Putaran Automatik',
      model_loading: 'Sedang memuatkan model 3D...',
      model_loaded: 'Model 3D berjaya dimuatkan',
      model_load_error: 'Ralat: Gagal memuatkan fail model 3D.',

      // Students
      students_title: 'Rekod Pembelajaran Murid',
      students_subtitle: 'Pantau kemajuan, percubaan kuiz, nota selesai dan skor sebenar pelajar.',
      search_student_placeholder: 'Cari nama atau kelas pelajar...',
      filter_all_status: 'Semua Status',
      col_student: 'Pelajar',
      col_class: 'Tingkatan / Kelas',
      col_quiz_attempts: 'Percubaan Kuiz',
      col_avg_score: 'Purata Skor',
      col_notes_completed: 'Nota Selesai',
      col_last_active: 'Aktiviti Terakhir',
      col_actions: 'Tindakan',
      btn_view_detail: 'Lihat Butiran',
      no_students_found: 'Tiada rekod pelajar dijumpai.',
      no_quiz_records: 'Pelajar belum mempunyai rekod kuiz.',
      no_learning_records: 'Belum ada rekod pembelajaran.',

      // Account Settings
      account_title: 'Tetapan Akaun Pentadbir',
      account_subtitle: 'Urus profil, pilihan bahasa antaramuka, dan keselamatan kata laluan anda.',
      card_profile_title: 'Profil Pentadbir',
      lbl_display_name: 'Nama Paparan',
      lbl_email: 'Alamat E-mel',
      lbl_role: 'Peranan Sistem',
      lbl_language: 'Bahasa Antaramuka',
      card_password_title: 'Keselamatan Kata Laluan',
      lbl_new_password: 'Kata Laluan Baharu',
      lbl_confirm_password: 'Sahkan Kata Laluan Baharu',
      btn_change_password: 'Kemas Kini Kata Laluan',
      card_session_title: 'Maklumat Sesi & Keselamatan',
      lbl_session_status: 'Status Sesi',
      lbl_session_active: 'Aktif (Disahkan Supabase Auth)',
      btn_save_preferences: 'Simpan Pilihan',
      password_mismatch: 'Kata laluan baharu dan pengesahan tidak sepadan.',
      password_too_short: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
      password_updated: 'Kata laluan anda telah berjaya dikemaskini!',
      profile_updated: 'Profil dan pilihan bahasa berjaya dikemas kini!',

      // CamelCase Aliases for section-account
      accountSettingsTitle: 'Tetapan Akaun Pentadbir',
      accountSettingsSubtitle: 'Urus profil guru, keutamaan bahasa antara muka, kata laluan dan keselamatan sesi.',
      languageCardTitle: 'Keutamaan Bahasa Antara Muka',
      languageCardDesc: 'Pilih bahasa paparan portal pengurusan guru.',
      profileCardTitle: 'Profil Guru / Pentadbir',
      profileCardDesc: 'Kemaskini maklumat nama paparan akaun anda.',
      displayNameLabel: 'Nama Paparan Guru *',
      emailLabel: 'E-mel Semasa',
      btnSaveProfile: 'Simpan Maklumat Profil',
      passwordCardTitle: 'Keselamatan Kata Laluan',
      passwordCardDesc: 'Tukar kata laluan masuk ke portal pengurusan.',
      newPasswordLabel: 'Kata Laluan Baharu *',
      confirmPasswordLabel: 'Sahkan Kata Laluan Baharu *',
      btnUpdatePassword: 'Kemaskini Kata Laluan',
      emailCardTitle: 'Tukar Alamat E-mel',
      emailCardDesc: 'Hantar pautan pengesahan ke alamat e-mel baharu.',
      newEmailLabel: 'Alamat E-mel Baharu *',
      btnRequestEmail: 'Hantar Pautan Pengesahan',
      sessionSecurityTitle: 'Sesi Pentadbir & Keselamatan Akaun',
      sessionSecuritySubtitle: 'Sentiasa log keluar apabila menggunakan komputer awam atau makmal sains sekolah.',
      btnLogout: 'Log Keluar Portal',
      connectingStatus: 'Menyemak sambungan...',
      connectedStatus: 'Pangkalan Data Aktif',
      offlineStatus: 'Luar Talian',
      passwordMismatch: 'Kata laluan tidak sepadan!',
      passwordSuccess: 'Kata laluan berjaya dikemaskini!',
      emailSuccess: 'Pautan pengesahan telah dihantar ke e-mel baharu anda. Sila sahkan melalui peti masuk anda.',
      logoutConfirm: 'Adakah anda pasti untuk log keluar dari Portal Pentadbir?',

      // Common
      btn_save: 'Simpan',
      btn_cancel: 'Batal',
      btn_delete: 'Padam',
      btn_edit: 'Sunting',
      loading_data: 'Sedang memuatkan data...',
      error_loading_data: 'Tidak dapat memuatkan data terkini.',
      conn_connected: 'Bersambung',
      conn_checking: 'Menyemak Supabase...'
    },

    en: {
      // Sidebar
      nav_overview: '1. Dashboard',
      nav_notes: '2. Notes Management',
      nav_videos: '3. Videos Management',
      nav_quizzes: '4. Quizzes Management',
      nav_games: '5. Games Management',
      nav_cellquest: '6. CellQuest & 3D/AR Models',
      nav_manual: '7. Manual Management',
      nav_students: '8. Learning Records',
      nav_account: '9. Account Settings',
      quick_links: 'Quick Links',
      link_student_site: 'View Student Portal',
      link_test_quiz: 'Test Quiz Module',
      btn_backup: 'Backup',
      btn_logout: 'Logout',
      role_teacher: 'KSSM Science Teacher',

      // Header
      science_f1: 'Form 1 Science',
      breadcrumb_overview: 'Dashboard',
      app_title: 'ARSelNel Teacher & Admin Portal',

      // Overview
      overview_badge: 'Science Learning Management System',
      overview_greeting: 'Welcome,',
      overview_subtitle: 'All microscopic learning modules, animal & plant cell quizzes, and AR models are ready for your students.',
      btn_refresh_data: 'Refresh Data',
      last_updated: 'Updated:',
      just_now: 'Just now',

      // Metric Cards
      stat_students_title: 'Total Students',
      stat_students_sub: 'Enrolled student accounts',
      stat_quizzes_title: 'Quiz Questions',
      stat_quizzes_sub: 'Published questions',
      stat_notes_title: 'KSSM Notes',
      stat_notes_sub: 'Interactive reading slides',
      stat_videos_title: 'Video Collection',
      stat_videos_sub: 'Practical & lesson videos',
      stat_models_title: '3D & AR Models',
      stat_models_sub: 'Active cell models',

      // Performance & Popular Topics
      performance_title: 'Learning Performance & Popular Topics',
      performance_subtitle: 'Average cell concept mastery based on verified student records',
      avg_score_label: 'Average Quiz Score:',
      pass_rate_label: 'Quiz Pass Rate',
      note_completion_label: 'Students Completed Notes',
      active_games_label: 'Completed Game Sessions',
      no_data_performance: 'Not enough data for analysis.',

      // Activity Feed
      activity_title: 'Recent Science Activity Log',
      activity_live_badge: 'Real-Time',
      btn_refresh_log: 'Refresh Log',
      no_activities: 'No learning activity recorded yet.',

      // CellQuest & 3D/AR
      cq_title: 'CellQuest & 3D/AR Models Management',
      cq_subtitle: 'Manage 3D models (animal, plant cell & organelles), KSSM organelle facts, AR markers and interactive 3D preview.',
      tab_models: '3D & GLB Models',
      tab_organelles: 'KSSM Organelle Info',
      tab_preview: 'Interactive 3D Preview',
      tab_ar: 'AR Settings (Augmented Reality)',
      btn_add_model: 'Add 3D Model',
      btn_add_organelle: 'Add Organelle Info',
      model_active: 'Active & Ready',
      model_inactive: 'Inactive',
      preview_controls: 'Controls: Click and drag to rotate • Scroll to zoom • Reset view button to return to center.',
      btn_reset_view: 'Reset View',
      btn_rotate: 'Auto Rotate',
      model_loading: 'Loading 3D model...',
      model_loaded: '3D model loaded successfully',
      model_load_error: 'Error: Failed to load 3D model file.',

      // Students
      students_title: 'Student Learning Records',
      students_subtitle: 'Track actual student progress, quiz attempts, completed notes, and scores.',
      search_student_placeholder: 'Search by student name or class...',
      filter_all_status: 'All Status',
      col_student: 'Student',
      col_class: 'Form / Class',
      col_quiz_attempts: 'Quiz Attempts',
      col_avg_score: 'Average Score',
      col_notes_completed: 'Notes Completed',
      col_last_active: 'Last Active',
      col_actions: 'Actions',
      btn_view_detail: 'View Details',
      no_students_found: 'No student records found.',
      no_quiz_records: 'Student has not attempted any quiz yet.',
      no_learning_records: 'No learning records available yet.',

      // Account Settings
      account_title: 'Admin Account Settings',
      account_subtitle: 'Manage your profile, interface language preference, and password security.',
      card_profile_title: 'Admin Profile',
      lbl_display_name: 'Display Name',
      lbl_email: 'Email Address',
      lbl_role: 'System Role',
      lbl_language: 'Interface Language',
      card_password_title: 'Password Security',
      lbl_new_password: 'New Password',
      lbl_confirm_password: 'Confirm New Password',
      btn_change_password: 'Update Password',
      card_session_title: 'Session & Security Info',
      lbl_session_status: 'Session Status',
      lbl_session_active: 'Active (Verified via Supabase Auth)',
      btn_save_preferences: 'Save Preferences',
      password_mismatch: 'New password and confirmation do not match.',
      password_too_short: 'Password must be at least 6 characters long.',
      password_updated: 'Your password has been successfully updated!',
      profile_updated: 'Profile and language preferences updated successfully!',

      // CamelCase Aliases for section-account
      accountSettingsTitle: 'Admin Account Settings',
      accountSettingsSubtitle: 'Manage teacher profile, interface language preference, password security, and active session.',
      languageCardTitle: 'Interface Language Preference',
      languageCardDesc: 'Choose display language for the teacher management portal.',
      profileCardTitle: 'Teacher / Admin Profile',
      profileCardDesc: 'Update your display name and profile details.',
      displayNameLabel: 'Display Name *',
      emailLabel: 'Current Email',
      btnSaveProfile: 'Save Profile Details',
      passwordCardTitle: 'Password Security',
      passwordCardDesc: 'Change your password to access the management portal.',
      newPasswordLabel: 'New Password *',
      confirmPasswordLabel: 'Confirm New Password *',
      btnUpdatePassword: 'Update Password',
      emailCardTitle: 'Change Email Address',
      emailCardDesc: 'Send a secure verification link to a new email address.',
      newEmailLabel: 'New Email Address *',
      btnRequestEmail: 'Send Verification Link',
      sessionSecurityTitle: 'Admin Session & Account Security',
      sessionSecuritySubtitle: 'Always log out when using public computers or school science lab terminals.',
      btnLogout: 'Log Out of Portal',
      connectingStatus: 'Checking connection...',
      connectedStatus: 'Database Connected',
      offlineStatus: 'Offline',
      passwordMismatch: 'Passwords do not match!',
      passwordSuccess: 'Password updated successfully!',
      emailSuccess: 'A confirmation link has been sent to your new email. Please verify from your inbox.',
      logoutConfirm: 'Are you sure you want to log out of the Admin Portal?',

      // Common
      btn_save: 'Save',
      btn_cancel: 'Cancel',
      btn_delete: 'Delete',
      btn_edit: 'Edit',
      loading_data: 'Loading data...',
      error_loading_data: 'Unable to load latest data.',
      conn_connected: 'Connected',
      conn_checking: 'Checking Supabase...'
    }
  };

  class AdminI18n {
    constructor() {
      this.currentLang = this.loadSavedLanguage();
      this.dictionaries = TRANSLATIONS;
    }

    init() {
      this.currentLang = this.loadSavedLanguage();
      this.applyTranslations();
      return this;
    }

    loadSavedLanguage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'ms' || saved === 'en')) {
          return saved;
        }
      } catch (_) {}
      return 'ms'; // Default is Bahasa Melayu
    }

    getLanguage() {
      return this.currentLang;
    }

    getCurrentLanguage() {
      return this.currentLang;
    }

    setLanguage(lang) {
      if (lang !== 'ms' && lang !== 'en') return;
      this.currentLang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (_) {}
      this.applyTranslations();
      global.dispatchEvent(new CustomEvent('arselnel:langchange', { detail: { lang } }));
    }

    t(key) {
      const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.ms;
      return dict[key] || TRANSLATIONS.ms[key] || key;
    }

    applyTranslations() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          const text = this.t(key);
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.hasAttribute('placeholder')) {
              el.setAttribute('placeholder', text);
            }
          } else {
            el.textContent = text;
          }
        }
      });
      // Language selector sync if present
      const langSelect = document.getElementById('admin-pref-language');
      if (langSelect && langSelect.value !== this.currentLang) {
        langSelect.value = this.currentLang;
      }
    }
  }

  global.AdminI18n = new AdminI18n();

})(typeof window !== 'undefined' ? window : this);
