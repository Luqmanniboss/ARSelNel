(function (global) {
  'use strict';

  const state = { client: null, configured: false, error: null, ready: null };
  const PENDING_KEY = 'arselnel_supabase_pending_writes';
  function status(stateName, message) {
    global.dispatchEvent(new CustomEvent('arselnel:persistence', { detail: { state: stateName, message } }));
  }
  function queueWrite(kind, payload, userId) {
    if (!userId) return;
    try {
      const queue = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      const same = item => item.kind === kind && item.userId === userId && (
        kind === 'quiz' ? item.payload.id === payload.id :
        kind === 'progress' ? item.payload.activityId === payload.activityId : true
      );
      const existingIndex = queue.findIndex(same);
      const entry = { kind, payload, userId, queuedAt: new Date().toISOString() };
      if (existingIndex >= 0) queue[existingIndex] = entry;
      else queue.push(entry);
      localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (_) {}
  }
  async function withPersistence(kind, payload, writer) {
    status('saving', 'Sedang menyimpan…');
    try {
      const data = await writer();
      status('saved', 'Data disimpan ke Supabase');
      return data;
    } catch (error) {
      let userId = null;
      try {
        await ready;
        const { data } = state.client ? await state.client.auth.getSession() : { data: null };
        userId = data && data.session && data.session.user && data.session.user.id;
      } catch (_) {}
      const appUser = global.AuthGuard && global.AuthGuard.getUser ? global.AuthGuard.getUser() : null;
      const matchesSession = !!(userId && appUser && appUser.authProvider === 'supabase' && appUser.id === userId);
      if (matchesSession) queueWrite(kind, payload, userId);
      status('failed', matchesSession ? 'Belum disegerakkan — perubahan disimpan pada peranti ini' : friendlyError(error));
      throw error;
    }
  }
  const ready = (async () => {
    try {
      let config = null;
      try {
        const response = await fetch('/api/public-config', { headers: { Accept: 'application/json' } });
        if (response.ok) {
          const cType = response.headers.get('content-type') || '';
          if (cType.includes('application/json')) {
            config = await response.json();
          }
        }
      } catch (_) {}

      // Fallback if running via file:// or non-Node server
      if (!config || !config.configured || !config.url) {
        config = {
          configured: true,
          url: 'https://kxjhlbudsiojpvzwqwva.supabase.co',
          publishableKey: 'sb_publishable_XDyfEuHJHOSZdefeu1k3Og_kWXMzM0U'
        };
      }
      if (!global.supabase || typeof global.supabase.createClient !== 'function') {
        throw new Error('Pustaka Supabase tidak dapat dimuat. Semak sambungan internet dan cuba lagi.');
      }
      state.client = global.supabase.createClient(config.url, config.publishableKey, {
        // Persist session tokens securely for cross-page navigation, refresh, and OAuth flows
        auth: { storage: global.localStorage || global.sessionStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      });
      state.configured = true;
      return state;
    } catch (error) {
      state.error = error;
      return state;
    }
  })();
  state.ready = ready;

  function friendlyError(error) {
    const raw = error && typeof error === 'object'
      ? (error.message || error.msg || error.error_description || error.error_code || '')
      : (typeof error === 'string' ? error : '');
    const message = raw || 'Permintaan tidak berjaya.';

    if (/bad_oauth_state|oauth state has expired|state.*expired/i.test(message)) return 'Sesi log masuk Google telah tamat. Sila cuba log masuk semula.';
    if (/unable to exchange external code/i.test(message)) return 'Pengesahan kod luaran Google gagal atau telah luput. Sila mulakan log masuk Google semula.';
    if (/access_denied/i.test(message)) return 'Log masuk Google dibatalkan atau tidak dibenarkan oleh pengguna.';
    if (/invalid login credentials/i.test(message)) return 'E-mel atau kata laluan tidak tepat.';
    if (/email not confirmed/i.test(message)) return 'Sahkan e-mel anda melalui pautan yang dihantar sebelum log masuk.';
    if (/already registered|user already registered|user_already_exists/i.test(message)) return 'E-mel ini telah didaftarkan dalam sistem ARSelNel. Sila log masuk ke akaun anda atau gunakan tetapan semula kata laluan.';
    if (/invalid.*email|email.*is invalid|unable to validate email|email address.*invalid/i.test(message)) return 'Alamat e-mel ini tidak sah atau tidak diterima oleh pelayan pengesahan. Sila gunakan alamat e-mel sebenar (contoh: Gmail, Outlook, Yahoo atau e-mel sekolah/institusi).';
    if (/password.*should be at least|password.*least 6/i.test(message)) return 'Kata laluan mestilah sekurang-kurangnya 6 aksara.';
    if (/over_email_send_rate_limit|rate limit/i.test(message)) return 'Terlalu banyak percubaan dalam masa singkat. Sila tunggu beberapa minit sebelum mencuba lagi.';
    if (/signup is disabled|signups not allowed/i.test(message)) return 'Pendaftaran akaun baharu ditutup sementara oleh pentadbir.';
    if (/fetch|network|failed to load/i.test(message)) return 'Sambungan ke pelayan Supabase gagal. Sila periksa capaian Internet anda dan cuba lagi.';
    return message;
  }

  async function authenticatedClient() {
    await ready;
    if (!state.client) throw new Error(state.error ? friendlyError(state.error) : 'Supabase belum dikonfigurasi. Salin .env.example kepada .env dan mulakan semula pelayan.');
    const { data, error } = await state.client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Sesi akaun tidak sah. Sila log masuk semula.');
    const appUser = global.AuthGuard && global.AuthGuard.getUser ? global.AuthGuard.getUser() : null;
    if (!appUser || (appUser.authProvider !== 'supabase' && appUser.authProvider !== 'google') || appUser.id !== data.user.id) {
      throw new Error('Sesi akaun aplikasi dan Supabase tidak sepadan. Log keluar dan log masuk semula sebelum penyegerakan.');
    }
    return { client: state.client, authUser: data.user };
  }

  async function saveProfile(fields) {
    return withPersistence('profile', fields, async () => {
      const { client, authUser } = await authenticatedClient();
      const { data, error } = await client.from('profiles').upsert({
        id: authUser.id, full_name: fields.full_name, nickname: fields.nickname || null,
        class_name: fields.class_name || null, avatar: fields.avatar || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      return data;
    });
  }

  async function saveQuizAttempt(attempt) {
    const record = { ...attempt, id: attempt.id || global.crypto.randomUUID() };
    return withPersistence('quiz', record, async () => {
      const { client, authUser } = await authenticatedClient();
      const row = {
        user_id: authUser.id, legacy_source_id: record.id,
        quiz_id: record.quizId || 'struktur-fungsi-organisasi-sel',
        score: Number.isFinite(Number(record.score)) ? Math.max(0, Math.min(100, Math.round(Number(record.score)))) : Math.round((Number(record.correct) || 0) / Math.max(1, Number(record.total) || 1) * 100),
        total_questions: Math.max(1, Number(record.total) || 0),
        result_data: record, submitted_at: record.completedAt || new Date().toISOString()
      };
      const { data, error } = await client.from('quiz_attempts').upsert(row, { onConflict: 'user_id,legacy_source_id' }).select().single();
      if (error) throw error;
      return data;
    });
  }

  async function saveProgress(activityId, progressPercent, resultData) {
    const payload = { activityId, progressPercent, resultData: resultData || {} };
    return withPersistence('progress', payload, async () => {
      const { client, authUser } = await authenticatedClient();
      const row = {
        user_id: authUser.id, activity_id: activityId,
        completion_status: Number(progressPercent) >= 100 ? 'completed' : 'in_progress',
        progress_percentage: Math.max(0, Math.min(100, Number(progressPercent) || 0)),
        result_data: resultData || {}, updated_at: new Date().toISOString()
      };
      const { data, error } = await client.from('learning_progress').upsert(row, { onConflict: 'user_id,activity_id' }).select().single();
      if (error) throw error;
      return data;
    });
  }

  async function saveSettings(settingValue) {
    return withPersistence('settings', settingValue, async () => {
      const { client, authUser } = await authenticatedClient();
      const { data, error } = await client.from('user_settings').upsert({
        user_id: authUser.id, setting_value: settingValue, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).select().single();
      if (error) throw error;
      return data;
    });
  }

  async function retryPending() {
    await ready;
    if (!state.client) throw new Error('Supabase belum dikonfigurasi.');
    const { data: { user }, error } = await state.client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Log masuk diperlukan untuk menyegerakkan data.');
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch (_) {}
    const mine = queue.filter(item => item.userId === user.id);
    const other = queue.filter(item => item.userId !== user.id);
    const failed = [];
    for (const item of mine) {
      try {
        if (item.kind === 'quiz') await saveQuizAttempt(item.payload);
        else if (item.kind === 'progress') await saveProgress(item.payload.activityId, item.payload.progressPercent, item.payload.resultData);
        else if (item.kind === 'settings') await saveSettings(item.payload);
        else if (item.kind === 'profile') await saveProfile(item.payload);
      } catch (_) { failed.push(item); }
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(other.concat(failed)));
    if (failed.length) throw new Error(`${failed.length} rekod masih belum dapat disegerakkan.`);
    status('saved', 'Semua perubahan tertangguh telah disegerakkan');
    return mine.length;
  }

  async function getProfile() {
    const { client, authUser } = await authenticatedClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', authUser.id).single();
    if (error) throw error;
    return data;
  }

  async function getSettings() {
    const { client, authUser } = await authenticatedClient();
    const { data, error } = await client.from('user_settings').select('setting_value').eq('user_id', authUser.id).maybeSingle();
    if (error) throw error;
    return data ? data.setting_value : null;
  }

  async function hydrateStudentData() {
    const { client, authUser } = await authenticatedClient();
    const [attemptResult, progressResult] = await Promise.all([
      client.from('quiz_attempts').select('result_data,submitted_at').eq('user_id', authUser.id).order('submitted_at', { ascending: false }),
      client.from('learning_progress').select('activity_id,progress_percentage,result_data,updated_at').eq('user_id', authUser.id)
    ]);
    if (attemptResult.error) throw attemptResult.error;
    if (progressResult.error) throw progressResult.error;
    const progressKey = `arselnel_learning_progress_${authUser.id}`;
    let local = { quizzes: [], completedLessons: [] };
    try { local = JSON.parse(localStorage.getItem(progressKey) || 'null') || local; } catch (_) {}
    const attempts = attemptResult.data.map(row => row.result_data).filter(item => item && typeof item === 'object');
    const byId = new Map();
    [...local.quizzes, ...attempts].forEach((item, index) => byId.set(item.id || `${item.completedAt || item.submitted_at || ''}-${index}`, item));
    local.quizzes = [...byId.values()];
    try { localStorage.setItem(progressKey, JSON.stringify(local)); } catch (_) {}
    for (const row of progressResult.data) {
      if (row.activity_id !== 'cellquest-missions') continue;
      const key = `arselnel_cellquest_progress_${authUser.id}`;
      let existing = {};
      try { existing = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}
      const remote = row.result_data || {};
      const merged = {
        ...remote, ...existing,
        xp: Math.max(Number(remote.xp) || 0, Number(existing.xp) || 0),
        completed: { ...(remote.completed || {}), ...(existing.completed || {}) },
        badges: [...new Set([...(remote.badges || []), ...(existing.badges || [])])],
        avatar: existing.avatar || remote.avatar || ''
      };
      try { localStorage.setItem(key, JSON.stringify(merged)); } catch (_) {}
    }
    return { quizAttempts: attempts.length, learningRecords: progressResult.data.length };
  }

  async function importLocalLearning(sourceUserId) {
    if (!sourceUserId) throw new Error('Profil sumber setempat tidak dikenal.');
    let learning = { quizzes: [], completedLessons: [] }, cell = {};
    try { learning = JSON.parse(localStorage.getItem(`arselnel_learning_progress_${sourceUserId}`) || 'null') || learning; } catch (_) {}
    try { cell = JSON.parse(localStorage.getItem(`arselnel_cellquest_progress_${sourceUserId}`) || '{}'); } catch (_) {}
    let imported = 0;
    for (const [index, entry] of (Array.isArray(learning.quizzes) ? learning.quizzes : []).entries()) {
      const item = { ...entry };
      item.id = item.id || `local-${sourceUserId}-${index}-${String(item.completedAt || item.title || 'quiz').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36)}`;
      item.total = Number(item.total) || 1;
      item.correct = Number.isFinite(Number(item.correct)) ? Number(item.correct) : Math.round((Number(item.score) || 0) * item.total / 100);
      item.quizId = item.quizId || item.topic || item.title || `local-quiz-${index}`;
      await saveQuizAttempt(item);
      imported++;
    }
    for (const lesson of (Array.isArray(learning.completedLessons) ? learning.completedLessons : [])) {
      await saveProgress(`lesson:${String(lesson).slice(0, 150)}`, 100, { source: 'explicit-local-import' });
      imported++;
    }
    const completedCount = cell.completed && typeof cell.completed === 'object' ? Object.values(cell.completed).filter(Boolean).length : 0;
    if (completedCount || Number(cell.xp) > 0 || (Array.isArray(cell.badges) && cell.badges.length)) {
      await saveProgress('cellquest-missions', Math.round(completedCount / 6 * 100), {
        xp: Number(cell.xp) || 0, completed: cell.completed || {}, badges: Array.isArray(cell.badges) ? cell.badges : [],
        avatar: cell.avatar || '', source: 'explicit-local-import'
      });
      imported++;
    }
    return imported;
  }

  global.ARSupabase = {
    ready,
    getClient: async () => { await ready; return state.client; },
    getState: () => ({ configured: state.configured, error: state.error }),
    announce: status,
    signIn: async (email, password) => {
      await ready;
      if (!state.client) throw new Error(state.error ? friendlyError(state.error) : 'Akaun dalam talian belum disediakan. Mod demo masih boleh digunakan.');
      const { data, error } = await state.client.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Reconcile student profile row if missing in public.profiles table
      if (data && data.user) {
        try {
          const { data: existing } = await state.client.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
          const meta = data.user.user_metadata || {};
          const isUserAdmin = meta.role === 'admin' || meta.role === 'guru' || meta.role === 'teacher';
          if (!existing && !isUserAdmin) {
            await state.client.from('profiles').upsert({
              id: data.user.id,
              full_name: meta.full_name || data.user.email.split('@')[0],
              nickname: meta.username || meta.preferred_username || (data.user.email.split('@')[0]),
              class_name: meta.class_name || 'Tingkatan 1 Al-Farabi',
              role: 'student',
              avatar: meta.avatar || '../assets/home/avatar.svg',
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          }
        } catch (reconcileErr) {
          console.warn('Profile reconcile notice:', reconcileErr);
        }
      }

      return data;
    },
    signUp: async ({ email, password, fullName, username, className }) => {
      await ready;
      if (!state.client) throw new Error(state.error ? friendlyError(state.error) : 'Pendaftaran dalam talian belum disediakan.');
      const redirectTo = `${window.location.origin}/auth/login.html?confirmed=1`;
      const studentUsername = username || email.split('@')[0];
      const studentClass = className || 'Tingkatan 1 Al-Farabi';
      const { data, error } = await state.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            username: studentUsername,
            class_name: studentClass,
            role: 'student'
          }
        }
      });
      if (error) throw error;

      // If email confirmation is disabled, Supabase returns an active session immediately.
      // Persist the student profile row to public.profiles using their authenticated user id.
      if (data && data.session && data.user) {
        try {
          await state.client.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            nickname: studentUsername,
            class_name: studentClass,
            role: 'student',
            avatar: '../assets/home/avatar.svg',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Amaran: Profil belum dapat disimpan terus ke Postgres:', profileErr);
        }
      }

      return data;
    },
    getOAuthRedirectUrl: () => {
      if (typeof window !== 'undefined' && window.location) {
        const hostname = (window.location.hostname || '').toLowerCase();
        if (hostname === 'arselnel-seven.vercel.app') {
          return 'https://arselnel-seven.vercel.app/auth/callback.html';
        }
        if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
          return `${window.location.origin}/auth/callback.html`;
        }
      }
      return 'https://arselnel-seven.vercel.app/auth/callback.html';
    },
    signInWithGoogle: async (redirectTo) => {
      await ready;
      if (!state.client) throw new Error(state.error ? friendlyError(state.error) : 'Supabase belum dikonfigurasi.');
      const canonicalRedirect = (global.ARSupabase && global.ARSupabase.getOAuthRedirectUrl)
        ? global.ARSupabase.getOAuthRedirectUrl()
        : `${window.location.origin}/auth/callback.html`;
      const targetRedirect = redirectTo || canonicalRedirect;
      const { data, error } = await state.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
      return data;
    },
    handleOAuthCallback: async () => {
      await ready;
      if (!state.client) return null;

      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // Check if OAuth provider reported an error
      const rawError = searchParams.get('error') || hashParams.get('error');
      const rawErrorCode = searchParams.get('error_code') || hashParams.get('error_code');
      const rawErrorDesc = searchParams.get('error_description') || hashParams.get('error_description');
      const errorMsg = rawErrorDesc || rawErrorCode || rawError;

      if (errorMsg) {
        if (window.location.search || window.location.hash) {
          history.replaceState(null, '', window.location.pathname);
        }
        throw new Error(decodeURIComponent(errorMsg));
      }

      // CRITICAL: Only proceed if this page load is actually an OAuth callback!
      // This prevents a lingering or concurrent session from auto-redirecting back to admin after logout.
      const hasOAuthParams = searchParams.has('code') || hashParams.has('access_token') ||
                             searchParams.has('oauth') || hashParams.has('token_type');
      if (!hasOAuthParams) {
        return null;
      }

      // Check if session was retrieved by Supabase Auth (detectSessionInUrl: true)
      let { data: { session }, error: sessionError } = await state.client.auth.getSession();
      
      // Safe fallback exchange if detectSessionInUrl hasn't populated session yet
      const code = searchParams.get('code');
      if (!session && code) {
        try {
          const { data: exchangeData, error: exchangeError } = await state.client.auth.exchangeCodeForSession(code);
          if (exchangeData && exchangeData.session) {
            session = exchangeData.session;
          } else if (exchangeError) {
            // Concurrently handled by detectSessionInUrl
            const retry = await state.client.auth.getSession();
            if (retry.data && retry.data.session) {
              session = retry.data.session;
            } else {
              throw exchangeError;
            }
          }
        } catch (exErr) {
          const retry = await state.client.auth.getSession();
          if (retry.data && retry.data.session) {
            session = retry.data.session;
          } else {
            throw exErr;
          }
        }
      }

      if (sessionError) throw sessionError;
      if (!session || !session.user) return null;

      const user = session.user;

      // 1. Fetch existing profile from database
      let existingProfile = null;
      try {
        const { data: prof } = await state.client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        existingProfile = prof;
      } catch (_) {}

      // 2. Check if this user is a registered Admin
      let isAdmin = false;
      try {
        const { data: adminRow } = await state.client
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (adminRow && (adminRow.role === 'admin' || adminRow.role === 'teacher' || adminRow.role === 'superadmin')) {
          isAdmin = true;
        }
      } catch (_) {}

      // Preserve existing database admin role if profile exists
      if (existingProfile && (existingProfile.role === 'admin' || existingProfile.role === 'teacher' || existingProfile.role === 'guru')) {
        isAdmin = true;
      }

      const meta = user.user_metadata || {};
      const fullName = (existingProfile && existingProfile.full_name) || meta.full_name || meta.name || user.email.split('@')[0];
      const nickname = (existingProfile && existingProfile.nickname) || meta.preferred_username || (fullName.split(' ')[0] || 'Pelajar');
      const className = (existingProfile && existingProfile.class_name) || 'Tingkatan 1 Al-Farabi';
      const avatar = (existingProfile && existingProfile.avatar) || meta.avatar_url || meta.picture || '../assets/home/avatar.svg';
      const role = isAdmin ? 'admin' : ((existingProfile && existingProfile.role === 'admin') ? 'admin' : 'student');

      // 3. First-time student: create profile in public.profiles table
      if (!existingProfile && !isAdmin) {
        try {
          await state.client.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            nickname: nickname,
            class_name: className,
            role: 'student',
            avatar: avatar,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (createErr) {
          console.warn('Gagal mencipta profil pelajar Google baharu:', createErr);
        }
      }

      const appUser = {
        id: user.id,
        name: fullName,
        nickname: nickname,
        email: user.email,
        username: nickname,
        role: role,
        grade: className,
        avatar: avatar,
        isDemo: false,
        authProvider: 'google'
      };

      // Clean URL params cleanly
      if (window.location.search.includes('code=') || window.location.hash.includes('access_token=') || window.location.search.includes('oauth=')) {
        history.replaceState(null, '', window.location.pathname);
      }

      return { session, user, appUser, isAdmin };
    },
    signOut: async () => {
      await ready;
      if (!state.client) return;
      try {
        await state.client.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    },
    authenticatedClient,
    getProfile,
    getSettings,
    hydrateStudentData,
    importLocalLearning,
    saveProfile,
    saveQuizAttempt,
    saveProgress,
    saveSettings,
    retryPending,
    friendlyError
  };
})(window);
