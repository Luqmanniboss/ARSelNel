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

  function normalizeGameId(rawId) {
    if (!rawId) return 'kuiz_saintis_muda';
    const id = String(rawId).toLowerCase().trim();
    if (id === 'maze_2d' || id === 'maze-chase-sel' || id === 'maze_chase' || id === 'klasifikasi-sel') return 'maze_2d';
    if (id === 'misi_makmal' || id === 'misi-makmal-sains' || id === 'lab_adventure' || id === 'lab-adventure') return 'misi_makmal';
    if (id === 'labelkan_organel' || id === 'labelkan-organel' || id === 'label_organelles') return 'labelkan_organel';
    if (id === 'organisasi_sel' || id === 'organisasi-kehidupan' || id === 'susun_organisasi') return 'organisasi_sel';
    if (id === 'kuiz_saintis_muda' || id === 'kuiz-saintis-muda' || id === 'struktur-fungsi-organisasi-sel' || id === 'kuiz_interaktif') return 'kuiz_saintis_muda';
    return id;
  }

  const GAME_CATALOG = {
    'maze_2d': {
      id: 'maze_2d',
      title: 'Maze Chase 2D: Misi Sel Haiwan & Tumbuhan',
      shortTitle: 'Maze 2D',
      icon: '🎮',
      route: '../games/klasifikasi-sel.html',
      maxScore: 1000,
      hasTimer: true
    },
    'misi_makmal': {
      id: 'misi_makmal',
      title: 'Misi Makmal Sains',
      shortTitle: 'Misi Makmal',
      icon: '🔬',
      route: '../games/misi-makmal-sains.html',
      maxScore: 1000,
      hasTimer: true
    },
    'labelkan_organel': {
      id: 'labelkan_organel',
      title: 'Labelkan Organel Sel',
      shortTitle: 'Labelkan Organel',
      icon: '🏷️',
      route: '../games/labelkan-organel.html',
      maxScore: 100,
      hasTimer: true
    },
    'organisasi_sel': {
      id: 'organisasi_sel',
      title: 'Susun Organisasi Kehidupan',
      shortTitle: 'Organisasi Sel',
      icon: '🧩',
      route: '../games/organisasi-kehidupan.html',
      maxScore: 100,
      hasTimer: true
    },
    'kuiz_saintis_muda': {
      id: 'kuiz_saintis_muda',
      title: 'Kuiz Interaktif: Struktur & Organisasi Sel',
      shortTitle: 'Kuiz Saintis Muda',
      icon: '📝',
      route: '../kuiz_interaktif/code.html',
      maxScore: 100,
      hasTimer: false
    }
  };

  async function saveQuizAttempt(attempt) {
    const rawGameId = attempt.quizId || attempt.gameId || attempt.game_id || attempt.id;
    const canonicalGameId = normalizeGameId(rawGameId);
    const attemptId = attempt.id || (global.crypto && global.crypto.randomUUID ? global.crypto.randomUUID() : 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
    
    // Ensure raw score is preserved without clamping to 100 (Maze 2D can score 1000)
    let finalScore = 0;
    if (Number.isFinite(Number(attempt.score))) {
      finalScore = Math.max(0, Math.round(Number(attempt.score)));
    } else {
      const correct = Number(attempt.correct) || 0;
      const total = Math.max(1, Number(attempt.total) || 1);
      finalScore = Math.round((correct / total) * 100);
    }

    const durationSeconds = Number.isFinite(Number(attempt.durationSeconds)) 
      ? Math.max(0, Math.round(Number(attempt.durationSeconds))) 
      : (Number.isFinite(Number(attempt.duration)) ? Math.max(0, Math.round(Number(attempt.duration))) : null);

    const record = {
      ...attempt,
      id: attemptId,
      quizId: canonicalGameId,
      gameId: canonicalGameId,
      score: finalScore,
      correct: Number(attempt.correct) || 0,
      total: Math.max(1, Number(attempt.total) || 1),
      durationSeconds: durationSeconds,
      answers: Array.isArray(attempt.answers) ? attempt.answers : [],
      completedAt: attempt.completedAt || new Date().toISOString()
    };

    // Save latest attempt cache in localStorage for instant access on results page
    try {
      localStorage.setItem('arselnel_latest_attempt', JSON.stringify(record));
    } catch (_) {}

    return withPersistence('quiz', record, async () => {
      const { client, authUser } = await authenticatedClient();
      const row = {
        user_id: authUser.id,
        legacy_source_id: record.id,
        quiz_id: canonicalGameId,
        score: finalScore,
        correct_answers: record.correct,
        total_questions: record.total,
        duration_seconds: durationSeconds,
        result_data: record,
        submitted_at: record.completedAt
      };
      
      const { data, error } = await client
        .from('quiz_attempts')
        .upsert(row, { onConflict: 'user_id,legacy_source_id' })
        .select()
        .single();
        
      if (error) {
        // Fallback: If duration_seconds column does not exist yet before migration is run, retry without it
        if (error.message && error.message.includes('duration_seconds')) {
          delete row.duration_seconds;
          const { data: retryData, error: retryError } = await client
            .from('quiz_attempts')
            .upsert(row, { onConflict: 'user_id,legacy_source_id' })
            .select()
            .single();
          if (retryError) throw retryError;
          return retryData;
        }
        throw error;
      }
      return data;
    });
  }

  async function getGameLeaderboard(rawGameId, limit = 50) {
    const gameId = normalizeGameId(rawGameId);
    let remoteEntries = [];
    let isRemoteSuccessful = false;

    try {
      await ready;
      if (state.client) {
        // Try calling the SQL function first
        const { data, error } = await state.client.rpc('get_game_leaderboard', {
          p_game_id: gameId,
          p_limit: limit
        });

        if (!error && Array.isArray(data)) {
          remoteEntries = data.map(item => ({
            rank: Number(item.rank) || 1,
            userId: item.user_id,
            playerName: item.player_name || 'Murid ARSelNel',
            avatar: item.avatar_url || '../assets/home/avatar.svg',
            className: item.class_name || 'Tingkatan 1',
            score: Number(item.best_score) || 0,
            correct: Number(item.correct_answers) || 0,
            total: Number(item.total_questions) || 0,
            durationSeconds: item.duration_seconds !== null ? Number(item.duration_seconds) : null,
            achievedAt: item.achieved_at,
            totalAttempts: Number(item.total_attempts) || 1
          }));
          isRemoteSuccessful = true;
        } else {
          // Fallback: Query quiz_attempts directly if RPC is not deployed yet
          const { data: directData, error: directError } = await state.client
            .from('quiz_attempts')
            .select('user_id, score, correct_answers, total_questions, duration_seconds, submitted_at, result_data')
            .eq('quiz_id', gameId)
            .order('score', { ascending: false })
            .limit(100);

          if (!directError && Array.isArray(directData) && directData.length > 0) {
            // Aggregate best score per user in client
            const userBestMap = new Map();
            directData.forEach(row => {
              const uid = row.user_id;
              const existing = userBestMap.get(uid);
              const score = Number(row.score) || 0;
              const correct = Number(row.correct_answers) || 0;
              const duration = row.duration_seconds !== null ? Number(row.duration_seconds) : 999999;
              const time = new Date(row.submitted_at || 0).getTime();

              if (!existing) {
                userBestMap.set(uid, { ...row, attemptsCount: 1 });
              } else {
                existing.attemptsCount = (existing.attemptsCount || 1) + 1;
                const isBetter = score > existing.score ||
                  (score === existing.score && correct > (Number(existing.correct_answers) || 0)) ||
                  (score === existing.score && correct === (Number(existing.correct_answers) || 0) && duration < (existing.duration_seconds !== null ? Number(existing.duration_seconds) : 999999)) ||
                  (score === existing.score && correct === (Number(existing.correct_answers) || 0) && duration === (existing.duration_seconds !== null ? Number(existing.duration_seconds) : 999999) && time < new Date(existing.submitted_at || 0).getTime());
                
                if (isBetter) {
                  userBestMap.set(uid, { ...row, attemptsCount: existing.attemptsCount });
                }
              }
            });

            // Fetch profiles for users
            const uids = Array.from(userBestMap.keys());
            let profileMap = new Map();
            try {
              const { data: profs } = await state.client.from('profiles').select('id, full_name, avatar, class_name').in('id', uids);
              if (Array.isArray(profs)) {
                profs.forEach(p => profileMap.set(p.id, p));
              }
            } catch (_) {}

            const sorted = Array.from(userBestMap.values()).sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              const aCorrect = Number(a.correct_answers) || 0;
              const bCorrect = Number(b.correct_answers) || 0;
              if (bCorrect !== aCorrect) return bCorrect - aCorrect;
              const aDur = a.duration_seconds !== null ? Number(a.duration_seconds) : 999999;
              const bDur = b.duration_seconds !== null ? Number(b.duration_seconds) : 999999;
              if (aDur !== bDur) return aDur - bDur;
              return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
            });

            remoteEntries = sorted.slice(0, limit).map((item, idx) => {
              const prof = profileMap.get(item.user_id) || {};
              return {
                rank: idx + 1,
                userId: item.user_id,
                playerName: prof.full_name || 'Murid ARSelNel',
                avatar: prof.avatar || '../assets/home/avatar.svg',
                className: prof.class_name || 'Tingkatan 1',
                score: Number(item.score) || 0,
                correct: Number(item.correct_answers) || 0,
                total: Number(item.total_questions) || 0,
                durationSeconds: item.duration_seconds !== null ? Number(item.duration_seconds) : null,
                achievedAt: item.submitted_at,
                totalAttempts: item.attemptsCount || 1
              };
            });
            isRemoteSuccessful = true;
          }
        }
      }
    } catch (err) {
      console.warn('Leaderboard fetch remote notice:', err);
    }

    // In case user is offline, Supabase is empty, or using demo mode, merge or build with localStorage
    if (remoteEntries.length === 0) {
      const allSubmissions = [];
      try {
        const subs = JSON.parse(localStorage.getItem('arselnel_quiz_submissions') || '[]');
        if (Array.isArray(subs)) allSubmissions.push(...subs);
      } catch (_) {}
      try {
        const demoSubs = JSON.parse(localStorage.getItem('arselnel_demo_arselnel_quiz_submissions') || '[]');
        if (Array.isArray(demoSubs)) allSubmissions.push(...demoSubs);
      } catch (_) {}

      const localStudentBest = new Map();
      allSubmissions.forEach(sub => {
        const subGameId = normalizeGameId(sub.quizId || sub.gameId || sub.quiz_id || sub.topic);
        if (subGameId !== gameId) return;

        const uid = sub.studentId || sub.userId || sub.student_id || sub.user_id || sub.studentName || 'pelajar';
        const currentScore = Number(sub.score) || 0;
        const currentCorrect = Number(sub.correct) || Number(sub.correct_answers) || 0;
        const currentTotal = Number(sub.total) || Number(sub.total_questions) || 1;
        const currentDuration = sub.duration_seconds !== undefined && sub.duration_seconds !== null
          ? Number(sub.duration_seconds)
          : (sub.durationSeconds !== undefined && sub.durationSeconds !== null ? Number(sub.durationSeconds) : null);
        const currentAchievedAt = sub.completedAt || sub.submitted_at || new Date().toISOString();
        const studentName = sub.studentName || sub.student_name || 'Murid ARSelNel';

        if (!localStudentBest.has(uid)) {
          localStudentBest.set(uid, {
            userId: uid,
            playerName: studentName,
            avatar: sub.avatar || '../assets/home/avatar.svg',
            className: sub.className || 'Tingkatan 1 Al-Farabi',
            score: currentScore,
            correct: currentCorrect,
            total: currentTotal,
            durationSeconds: currentDuration,
            achievedAt: currentAchievedAt,
            totalAttempts: 1
          });
        } else {
          const prev = localStudentBest.get(uid);
          prev.totalAttempts = (prev.totalAttempts || 1) + 1;
          let isBetter = false;
          if (currentScore > prev.score) isBetter = true;
          else if (currentScore === prev.score) {
            if (currentCorrect > (prev.correct || 0)) isBetter = true;
            else if (currentCorrect === (prev.correct || 0)) {
              const aDur = currentDuration !== null ? currentDuration : 999999;
              const bDur = prev.durationSeconds !== null ? prev.durationSeconds : 999999;
              if (aDur < bDur) isBetter = true;
              else if (aDur === bDur && new Date(currentAchievedAt).getTime() < new Date(prev.achievedAt).getTime()) isBetter = true;
            }
          }
          if (isBetter) {
            localStudentBest.set(uid, {
              ...prev,
              playerName: studentName || prev.playerName,
              score: currentScore,
              correct: currentCorrect,
              total: currentTotal,
              durationSeconds: currentDuration,
              achievedAt: currentAchievedAt
            });
          }
        }
      });

      if (localStudentBest.size > 0) {
        remoteEntries = Array.from(localStudentBest.values());
      }
    }

    let currentUser = null;
    try {
      const authState = JSON.parse(localStorage.getItem('arselnel_auth_session') || '{}');
      currentUser = authState.user || null;
    } catch (_) {}

    if (currentUser && currentUser.id) {
      const progressKey = `arselnel_learning_progress_${currentUser.id}`;
      let localLearning = { quizzes: [] };
      try {
        localLearning = JSON.parse(localStorage.getItem(progressKey) || '{}') || { quizzes: [] };
      } catch (_) {}

      const myAttemptsForGame = (localLearning.quizzes || []).filter(q => normalizeGameId(q.quizId || q.gameId) === gameId);
      if (myAttemptsForGame.length > 0) {
        let bestLocal = null;
        myAttemptsForGame.forEach(att => {
          const score = Number(att.score) || 0;
          if (!bestLocal || score > bestLocal.score) {
            bestLocal = att;
          }
        });

        if (bestLocal) {
          const existingIdx = remoteEntries.findIndex(e => e.userId === currentUser.id);
          const localEntry = {
            userId: currentUser.id,
            playerName: currentUser.name || currentUser.username || 'Saya',
            avatar: currentUser.avatar || '../assets/home/avatar.svg',
            className: currentUser.grade || 'Tingkatan 1 Al-Farabi',
            score: Number(bestLocal.score) || 0,
            correct: Number(bestLocal.correct) || 0,
            total: Number(bestLocal.total) || 1,
            durationSeconds: bestLocal.durationSeconds || null,
            achievedAt: bestLocal.completedAt || new Date().toISOString(),
            totalAttempts: myAttemptsForGame.length
          };

          if (existingIdx >= 0) {
            if (localEntry.score > remoteEntries[existingIdx].score) {
              remoteEntries[existingIdx] = { ...remoteEntries[existingIdx], ...localEntry };
            }
          } else if (!isRemoteSuccessful || remoteEntries.length === 0) {
            remoteEntries.push(localEntry);
          }
        }
      }
    }

    // Re-sort after potential merges
    remoteEntries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.correct || 0) !== (a.correct || 0)) return (b.correct || 0) - (a.correct || 0);
      const aDur = a.durationSeconds !== null && a.durationSeconds !== undefined ? a.durationSeconds : 999999;
      const bDur = b.durationSeconds !== null && b.durationSeconds !== undefined ? b.durationSeconds : 999999;
      if (aDur !== bDur) return aDur - bDur;
      return new Date(a.achievedAt || 0).getTime() - new Date(b.achievedAt || 0).getTime();
    });

    const finalLeaderboard = remoteEntries.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      // Compatibility aliases
      student_id: item.userId,
      student_name: item.playerName,
      best_score: item.score,
      correct_count: item.correct,
      best_duration_seconds: item.durationSeconds
    }));

    let myStanding = null;
    if (currentUser && currentUser.id) {
      const found = finalLeaderboard.find(e => e.userId === currentUser.id);
      if (found) {
        myStanding = {
          ...found,
          totalPlayers: finalLeaderboard.length
        };
      }
    }

    const podium = {
      first: finalLeaderboard[0] || null,
      second: finalLeaderboard[1] || null,
      third: finalLeaderboard[2] || null
    };

    const remaining = finalLeaderboard.slice(3);

    return {
      gameId,
      gameMeta: GAME_CATALOG[gameId] || { id: gameId, title: gameId, shortTitle: gameId, icon: '🏆', maxScore: 100 },
      leaderboard: finalLeaderboard,
      podium,
      remaining,
      myStanding,
      totalPlayers: finalLeaderboard.length
    };
  }

  async function getAttemptById(attemptId) {
    if (!attemptId) return null;
    try {
      const cached = JSON.parse(localStorage.getItem('arselnel_latest_attempt') || 'null');
      if (cached && (cached.id === attemptId || cached.legacy_source_id === attemptId)) {
        return cached;
      }
    } catch (_) {}

    try {
      await ready;
      if (state.client) {
        const { data, error } = await state.client
          .from('quiz_attempts')
          .select('id, user_id, legacy_source_id, quiz_id, score, correct_answers, total_questions, duration_seconds, result_data, submitted_at')
          .or(`legacy_source_id.eq.${attemptId},id.eq.${attemptId}`)
          .maybeSingle();

        if (!error && data) {
          const res = data.result_data || {};
          return {
            ...res,
            id: data.legacy_source_id || data.id,
            quizId: data.quiz_id,
            gameId: normalizeGameId(data.quiz_id),
            score: Number(data.score) || 0,
            correct: Number(data.correct_answers) || 0,
            total: Number(data.total_questions) || 0,
            durationSeconds: data.duration_seconds,
            completedAt: data.submitted_at,
            answers: Array.isArray(res.answers) ? res.answers : []
          };
        }
      }
    } catch (err) {
      console.warn('Error fetching attempt by ID:', err);
    }

    return null;
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
    getGameLeaderboard,
    getAttemptById,
    normalizeGameId,
    GAME_CATALOG,
    saveProgress,
    saveSettings,
    retryPending,
    friendlyError
  };
})(window);
