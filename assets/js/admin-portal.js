/**
 * ARSelNel Admin Portal Manager
 * Handles Real Database Analytics, Student Learning Records,
 * Combined CellQuest 3D/AR Management, and Admin Account Settings.
 */

// ---------------------------------------------------------------------
// 1. STATE & ROUTING
// ---------------------------------------------------------------------
let activeView = 'overview';
let activeCellQuestTab = 'models';
let previewScene = null;
let previewCamera = null;
let previewRenderer = null;
let previewControls = null;
let previewCurrentMesh = null;
let previewAnimationId = null;
let is3DPreviewInitialized = false;

window.addEventListener('DOMContentLoaded', async () => {
  if (window.AdminI18n && typeof window.AdminI18n.init === 'function') {
    window.AdminI18n.init();
  }
  
  initAdminPortal();
  
  // Initial data load
  await renderOverviewStats();
  
  // Apply language translations across UI
  if (window.AdminI18n && typeof window.AdminI18n.applyTranslations === 'function') {
    window.AdminI18n.applyTranslations();
  }
});

function initAdminPortal() {
  const user = window.Auth ? window.Auth.getCurrentUser() : null;
  const currentLang = window.AdminI18n ? window.AdminI18n.getCurrentLanguage() : 'ms';
  
  // Set language selector state in Account Settings
  const langRadio = document.querySelector(`input[name="admin_lang_pref"][value="${currentLang}"]`);
  if (langRadio) langRadio.checked = true;
  updateLanguageCardsUI(currentLang);

  if (user) {
    const adminName = user.name || 'Cikgu Sains';
    const initial = adminName.charAt(0).toUpperCase();
    
    const sideName = document.getElementById('sidebar-admin-name');
    if (sideName) sideName.textContent = adminName;
    
    const sideInitial = document.getElementById('sidebar-admin-initial');
    if (sideInitial) sideInitial.textContent = initial;
    
    const greetName = document.getElementById('overview-greeting-name');
    if (greetName) greetName.textContent = adminName.split(' ')[0] || 'Cikgu';

    // Account settings fields
    const prefName = document.getElementById('admin-pref-name');
    if (prefName) prefName.value = adminName;
    
    const prefEmail = document.getElementById('admin-pref-email-display');
    if (prefEmail) prefEmail.value = user.email || 'guru@arselnel.my';
  }

  // Update role badge in sidebar
  const isSuperAdmin = (window.Auth && typeof window.Auth.isSuperAdmin === 'function')
    ? window.Auth.isSuperAdmin()
    : (localStorage.getItem('arselnel_superadmin') === 'true');
  const roleLabel = document.getElementById('sidebar-admin-role-label');
  if (roleLabel) {
    roleLabel.textContent = isSuperAdmin ? 'Super Admin (Akses Penuh)' : 'Guru Sains (Akses CMS)';
  }

  // Update Supabase connection badge in top navigation
  checkAndDisplayConnectionBadge();

  // Initialize modal safeguards (backdrop, escape, focus, scroll)
  setupModalSafeguards();
}

async function checkAndDisplayConnectionBadge() {
  const statusPillText = document.getElementById('supabase-status-text');
  const statusPillDot = document.getElementById('supabase-status-dot');
  if (!statusPillText) return;

  statusPillText.textContent = window.AdminI18n ? window.AdminI18n.t('connectingStatus') : 'Menyemak sambungan...';
  
  try {
    const check = await window.CMSAdapter.checkConnection(true);
    const isConnected = check.status === 'connected';
    
    statusPillText.textContent = isConnected 
      ? (window.AdminI18n ? window.AdminI18n.t('connectedStatus') : 'Pangkalan Data Aktif')
      : (window.AdminI18n ? window.AdminI18n.t('offlineStatus') : 'Luar Talian');
      
    if (statusPillDot) {
      statusPillDot.className = isConnected 
        ? 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse'
        : 'w-2.5 h-2.5 rounded-full bg-amber-500';
    }
  } catch (err) {
    statusPillText.textContent = window.AdminI18n ? window.AdminI18n.t('offlineStatus') : 'Luar Talian';
    if (statusPillDot) statusPillDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
  }
}

function switchView(viewName) {
  activeView = viewName;
  
  // Update sidebar active buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Hide all view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // Show active view panel
  const target = document.getElementById(`section-${viewName}`);
  if (target) target.classList.remove('hidden');

  // Title dictionary
  const isEn = window.AdminI18n && window.AdminI18n.getCurrentLanguage() === 'en';
  const titles = {
    'overview': isEn ? 'System Overview & Analytics' : 'Ringkasan Sistem & Analitik ARSelNel',
    'notes': isEn ? 'Learning Notes Management' : 'Pengurusan Nota Pembelajaran (CMS)',
    'videos': isEn ? 'Science Video Library' : 'Perpustakaan Video Sains',
    'quizzes': isEn ? 'Quiz Questions Management' : 'Pengurusan Soalan & Kuiz Sains',
    'games': isEn ? 'Game Questions Bank' : 'Pengurusan Bank Soalan Permainan Sains',
    'cellquest': isEn ? 'CellQuest 3D & AR Management' : 'Pengurusan CellQuest & Model 3D/AR',
    'manual': isEn ? 'Student Guide Management' : 'Pengurusan Manual Penggunaan Murid',
    'students': isEn ? 'Student Learning Records' : 'Rekod Pembelajaran Murid (Masa Nyata)',
    'account': isEn ? 'Admin Account Settings' : 'Tetapan Akaun Pentadbir',
    'users': isEn ? 'User & Teacher Management' : 'Pengurusan Pengguna & Pelantikan Guru'
  };

  const titleEl = document.getElementById('view-title');
  if (titleEl) titleEl.textContent = titles[viewName] || 'Papan Pemuka';
  
  const breadcrumbEl = document.getElementById('breadcrumb-title');
  if (breadcrumbEl) breadcrumbEl.textContent = viewName.toUpperCase();

  // Lazy render views on switch
  if (viewName === 'overview') renderOverviewStats();
  if (viewName === 'quizzes') {
    if (typeof renderQuizzes === 'function') renderQuizzes();
    if (typeof renderQuizSubmissions === 'function') renderQuizSubmissions();
  }
  if (viewName === 'notes') {
    if (typeof renderNotes === 'function') renderNotes();
    if (typeof renderAdminSlides === 'function') renderAdminSlides();
  }
  if (viewName === 'videos') {
    if (typeof renderVideos === 'function') renderVideos();
  }
  if (viewName === 'games') {
    if (typeof renderGameQuestions === 'function') renderGameQuestions();
  }
  if (viewName === 'cellquest') {
    renderCellQuestSection();
  }
  if (viewName === 'manual') {
    if (typeof renderManualSteps === 'function') renderManualSteps();
  }
  if (viewName === 'students') {
    renderStudents();
  }
  if (viewName === 'account') {
    initAdminPortal();
  }
  if (viewName === 'users') {
    renderUsersSection();
  }

  // Close mobile sidebar if screen is small
  const nav = document.getElementById('sidebar-nav');
  if (nav && window.innerWidth < 1024) nav.classList.add('hidden');
}

// ---------------------------------------------------------------------
// 2. REAL-TIME ANALYTICS & OVERVIEW (PHASE 4)
// ---------------------------------------------------------------------
async function renderOverviewStats() {
  const statStudents = document.getElementById('stat-students');
  const statQuizzes = document.getElementById('stat-quizzes');
  const statNotes = document.getElementById('stat-notes');
  const statNotesSub = document.getElementById('stat-notes-sub');
  const statVideos = document.getElementById('stat-videos');
  const statAr = document.getElementById('stat-ar');
  const statRefreshTime = document.getElementById('stat-last-refresh') || document.getElementById('last-refresh-time');

  try {
    const analytics = await window.CMSAdapter.getRealAnalytics();

    if (statStudents) statStudents.textContent = analytics.totalStudents;
    if (statQuizzes) statQuizzes.textContent = analytics.totalQuizzes;
    if (statNotes) statNotes.textContent = analytics.publishedNotes;
    if (statNotesSub) statNotesSub.textContent = `${analytics.publishedNotes} Terbit • ${analytics.draftNotes} Draf`;
    if (statVideos) statVideos.textContent = analytics.totalVideos;
    if (statAr) statAr.textContent = analytics.totalARModels;

    if (statRefreshTime) {
      const now = new Date();
      statRefreshTime.textContent = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Secondary metrics badges
    const avgScoreEl = document.getElementById('avg-score-badge');
    if (avgScoreEl) {
      avgScoreEl.textContent = analytics.averageQuizScore > 0 ? `${analytics.averageQuizScore}%` : '-';
    }

    const passRateEl = document.getElementById('pass-rate-badge');
    if (passRateEl) {
      passRateEl.textContent = analytics.quizPassRate > 0 ? `${analytics.quizPassRate}%` : '-';
    }

    const noteCompletionsEl = document.getElementById('completed-notes-badge');
    if (noteCompletionsEl) {
      noteCompletionsEl.textContent = analytics.noteCompletionsCount;
    }

    // Render Popular Topics
    renderPopularTopics(analytics.popularTopics, analytics.hasSufficientData);

    // Render Genuine Activity Logs
    renderRecentActivities(analytics.recentActivities);

  } catch (err) {
    console.error('Error rendering analytics:', err);
    if (statStudents) statStudents.textContent = '-';
    if (statQuizzes) statQuizzes.textContent = '-';
    if (statNotes) statNotes.textContent = '-';
    if (statVideos) statVideos.textContent = '-';
    if (statAr) statAr.textContent = '-';
    
    const container = document.getElementById('popular-topics-container');
    if (container) {
      container.innerHTML = '<div class="p-6 text-center text-rose-500 bg-rose-50 rounded-2xl text-xs font-semibold">Tidak dapat memuatkan data terkini. Sila semak sambungan pangkalan data.</div>';
    }
  }
}

async function refreshDashboardData() {
  const btn = document.getElementById('btn-refresh-stats') || document.getElementById('btn-refresh-dashboard');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">sync</span><span>Memuat Semula...</span>';
  }

  await renderOverviewStats();
  await checkAndDisplayConnectionBadge();

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }

  if (typeof showToast === 'function') {
    showToast('Data analitik pangkalan data berjaya dimuat semula.', 'success');
  }
}

function renderPopularTopics(topics, hasSufficientData) {
  const container = document.getElementById('popular-topics-container');
  if (!container) return;

  if (!hasSufficientData || !topics || topics.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <span class="material-symbols-outlined text-3xl text-slate-300">analytics</span>
        <p class="text-xs font-semibold text-slate-500">Belum cukup data untuk analisis.</p>
        <p class="text-[11px] text-slate-400">Statistik topik akan dipaparkan secara automatik apabila murid mula menyelesaikan soalan kuiz dan membaca modul nota.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = topics.map(t => `
    <div class="space-y-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-800">${escapeHtml(t.name)}</span>
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-slate-400">${t.attempts} percubaan</span>
          <span class="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full text-[11px]">${t.avgScore}%</span>
        </div>
      </div>
      <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500" style="width: ${Math.min(100, Math.max(5, t.avgScore))}%"></div>
      </div>
    </div>
  `).join('');
}

function renderRecentActivities(activities) {
  const container = document.getElementById('activity-log-container');
  if (!container) return;

  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <span class="material-symbols-outlined text-3xl text-slate-300">history_toggle_off</span>
        <p class="text-xs font-semibold text-slate-500">Tiada aktiviti pembelajaran direkodkan lagi.</p>
        <p class="text-[11px] text-slate-400">Log aktiviti sains murid dan pentadbir akan disenaraikan di sini mengikut cap masa terkini.</p>
      </div>
    `;
    return;
  }

  const iconMap = {
    quiz: { icon: 'quiz', bg: 'bg-primary/10', color: 'text-primary' },
    note: { icon: 'menu_book', bg: 'bg-emerald-50', color: 'text-emerald-700' },
    video: { icon: 'smart_display', bg: 'bg-blue-50', color: 'text-blue-700' },
    game: { icon: 'sports_esports', bg: 'bg-amber-50', color: 'text-amber-700' },
    cellquest: { icon: 'view_in_ar', bg: 'bg-teal-50', color: 'text-teal-700' },
    default: { icon: 'notifications', bg: 'bg-slate-100', color: 'text-slate-700' }
  };

  container.innerHTML = activities.map(act => {
    const style = iconMap[act.type] || iconMap.default;
    const timeStr = act.timestamp ? new Date(act.timestamp).toLocaleString('ms-MY', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Baru sahaja';

    return `
      <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
        <div class="w-10 h-10 rounded-xl ${style.bg} ${style.color} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-lg">${style.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h5 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(act.title)}</h5>
            <span class="text-[10px] font-mono text-slate-400 shrink-0">${timeStr}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] text-slate-600 truncate">${escapeHtml(act.studentName || 'Pelajar')}</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-bold uppercase text-slate-400">${escapeHtml(act.module || act.type)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------
// 3. REAL STUDENT RECORDS & DETAIL VIEW (PHASE 5)
// ---------------------------------------------------------------------
async function renderStudents() {
  const tbody = document.getElementById('student-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('search-student');
  const search = searchInput ? searchInput.value.trim() : '';

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-lg animate-spin">sync</span>
          <span>Memuatkan rekod pembelajaran murid sebenar dari pangkalan data...</span>
        </span>
      </td>
    </tr>
  `;

  try {
    const students = await window.CMSAdapter.getRealStudentRecords({ search });

    if (!students || students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center bg-slate-50/50">
            <div class="max-w-xs mx-auto space-y-2">
              <span class="material-symbols-outlined text-3xl text-slate-300">school</span>
              <p class="text-xs font-bold text-slate-700">Tiada rekod murid dijumpai</p>
              <p class="text-[11px] text-slate-400">Tiada akaun murid yang berdaftar atau memenuhi kriteria carian semasa.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(s => {
      const attemptsCount = (s.quizzesAttempted != null)
        ? Number(s.quizzesAttempted)
        : ((s.quizAttemptsCount != null) ? Number(s.quizAttemptsCount) : 0);

      const rawScore = (s.averageScore != null && !isNaN(Number(s.averageScore)))
        ? Number(s.averageScore)
        : ((s.avgScore != null && !isNaN(Number(s.avgScore))) ? Number(s.avgScore) : null);

      const avgScoreBadge = (rawScore != null && attemptsCount > 0)
        ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${rawScore >= 80 ? 'bg-emerald-50 text-emerald-800' : rawScore >= 50 ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'}">${rawScore}%</span>`
        : `<span class="text-xs text-slate-400 italic">Belum ada skor</span>`;

      const lastActiveFormatted = s.lastActive 
        ? new Date(s.lastActive).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Belum aktif';

      const isSuperAdminUser = (window.Auth && typeof window.Auth.isSuperAdmin === 'function')
        ? window.Auth.isSuperAdmin()
        : (localStorage.getItem('arselnel_superadmin') === 'true');

      return `
        <tr class="hover:bg-teal-50/30 transition border-b border-slate-100">
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                ${(s.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0">
                <strong class="font-headline font-bold text-slate-900 block text-sm truncate">${escapeHtml(s.name)}</strong>
                <span class="text-xs text-slate-400 block font-mono truncate">${escapeHtml(s.email)}</span>
              </div>
            </div>
          </td>
          <td class="py-4 px-4 font-semibold text-xs text-slate-700">
            ${escapeHtml(s.grade || 'Tingkatan 1')}
          </td>
          <td class="py-4 px-4 text-center font-bold text-xs text-slate-800">
            ${attemptsCount > 0 ? `${attemptsCount} percubaan` : '0 percubaan'}
          </td>
          <td class="py-4 px-4 text-center">
            ${avgScoreBadge}
          </td>
          <td class="py-4 px-4 text-center font-semibold text-xs text-slate-600">
            ${s.notesCompleted || 0} modul
          </td>
          <td class="py-4 px-4 text-xs text-slate-500">
            ${lastActiveFormatted}
          </td>
          <td class="py-4 px-6 text-right">
            <div class="inline-flex items-center gap-2 justify-end">
              <button type="button" onclick="openStudentDetailModal('${escapeHtml(s.id)}')" class="py-1.5 px-3 rounded-xl bg-teal-50 hover:bg-primary hover:text-white text-teal-800 font-bold text-xs transition inline-flex items-center gap-1 shadow-sm">
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span>Lihat Rekod</span>
              </button>
              ${isSuperAdminUser ? `
              <button type="button" onclick="openDeleteStudentModal('${escapeHtml(s.id)}', '${escapeHtml(s.name || 'Murid')}', '${escapeHtml(s.email || '')}')" title="Padam Akaun Murid (Super Admin sahaja)" class="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs transition inline-flex items-center gap-1 border border-rose-100 shadow-sm">
                <span class="material-symbols-outlined text-sm">delete</span>
                <span class="hidden sm:inline">Padam</span>
              </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error rendering student records:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-rose-600 text-xs bg-rose-50">
          Ralat memuatkan rekod murid: ${escapeHtml(err.message)}
        </td>
      </tr>
    `;
  }
}

async function openStudentDetailModal(studentId) {
  const modal = document.getElementById('modal-student-detail');
  if (!modal) return;

  // Clear previous values
  document.getElementById('st-detail-name').textContent = 'Memuatkan...';
  document.getElementById('st-detail-email').textContent = '...';
  document.getElementById('st-detail-avatar').textContent = '...';
  document.getElementById('st-detail-class').textContent = '-';
  document.getElementById('st-detail-quiz-count').textContent = '0';
  document.getElementById('st-detail-avg-score').textContent = 'Belum ada skor';
  document.getElementById('st-detail-notes-count').textContent = '0';
  document.getElementById('st-detail-quiz-list').innerHTML = '<div class="p-4 text-center text-slate-400 text-xs">Memuatkan rekod...</div>';
  document.getElementById('st-detail-notes-list').innerHTML = '';
  document.getElementById('st-detail-games-list').innerHTML = '';

  modal.showModal();

  try {
    const detail = await window.CMSAdapter.getStudentDetail(studentId);
    if (!detail) {
      document.getElementById('st-detail-name').textContent = 'Pelajar Tidak Dijumpai';
      return;
    }

    const student = detail.student || detail.profile || {};
    const quizAttempts = detail.quizAttempts || [];
    const noteProgress = detail.noteProgress || detail.learningProgress || [];
    const gameActivity = detail.gameActivity || [];

    // Header info
    document.getElementById('st-detail-name').textContent = student.name || student.full_name || 'Pelajar';
    document.getElementById('st-detail-email').textContent = student.email || (student.nickname ? `${student.nickname}@sekolah.edu.my` : '-');
    document.getElementById('st-detail-avatar').textContent = ((student.name || student.full_name || 'P')).charAt(0).toUpperCase();
    document.getElementById('st-detail-class').textContent = student.grade || student.class_name || 'Tingkatan 1';
    document.getElementById('st-detail-quiz-count').textContent = `${quizAttempts.length} percubaan`;
    const avgScoreVal = student.averageScore != null ? student.averageScore : student.avgScore;
    document.getElementById('st-detail-avg-score').textContent = (avgScoreVal != null && !isNaN(avgScoreVal) && quizAttempts.length > 0) ? `${avgScoreVal}%` : 'Belum ada skor';
    document.getElementById('st-detail-notes-count').textContent = `${noteProgress.filter(n => n.completed || n.completion_status === 'completed').length} modul`;

    // Quiz Attempts Section
    const quizList = document.getElementById('st-detail-quiz-list');
    const quizBadge = document.getElementById('st-detail-quiz-badge');
    if (quizBadge) quizBadge.textContent = `${quizAttempts.length} rekod`;

    if (!quizAttempts || quizAttempts.length === 0) {
      quizList.innerHTML = `
        <div class="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <p class="text-xs font-semibold text-slate-600">Pelajar belum mempunyai rekod kuiz.</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Tiada percubaan soalan kuiz disimpan dalam pangkalan data untuk pelajar ini.</p>
        </div>
      `;
    } else {
      quizList.innerHTML = quizAttempts.map(q => {
        const isPass = q.score >= 50;
        const dateStr = q.date ? new Date(q.date).toLocaleString('ms-MY', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '-';

        return `
          <div class="p-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-3">
            <div>
              <h5 class="text-xs font-bold text-slate-900">${escapeHtml(q.title)}</h5>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>${dateStr}</span>
                <span>•</span>
                <span>${q.correctAnswers} / ${q.totalQuestions} soalan betul</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-extrabold font-headline ${isPass ? 'text-emerald-700' : 'text-rose-700'}">${q.score}%</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPass ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}">
                ${isPass ? 'Lulus' : 'Ulang'}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Notes Progress Section
    const notesList = document.getElementById('st-detail-notes-list');
    const notesBadge = document.getElementById('st-detail-notes-badge');
    if (notesBadge) notesBadge.textContent = `${noteProgress.length} modul`;

    if (!noteProgress || noteProgress.length === 0) {
      notesList.innerHTML = `
        <div class="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <p class="text-xs font-semibold text-slate-600">Belum ada rekod pembelajaran nota.</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Pelajar belum membuka atau menanda sebarang modul nota sains.</p>
        </div>
      `;
    } else {
      notesList.innerHTML = noteProgress.map(n => `
        <div class="p-3 rounded-2xl border border-slate-100 bg-white flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-base ${n.completed ? 'text-emerald-600' : 'text-teal-600'}">
              ${n.completed ? 'check_circle' : 'menu_book'}
            </span>
            <span class="text-xs font-bold text-slate-800">${escapeHtml(n.title)}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${n.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}">
            ${n.completed ? 'Selesai Dibaca' : 'Sedang Dibaca'}
          </span>
        </div>
      `).join('');
    }

    // Game & CellQuest Activity Section (Sokongan Pecahan Setiap Permainan)
    const gamesList = document.getElementById('st-detail-games-list');
    const gamesBreakdown = detail.gamesBreakdown || [];

    if (gamesBreakdown.length > 0) {
      gamesList.innerHTML = gamesBreakdown.map(g => `
        <div class="p-3.5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h5 class="text-xs font-bold text-slate-900">${escapeHtml(g.gameTitle)}</h5>
            </div>
            <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span>${g.attemptsCount} percubaan</span>
              <span>•</span>
              <span class="text-emerald-700 font-bold">${g.correct} Betul</span>
              <span>•</span>
              <span class="text-rose-600 font-bold">${g.incorrect} Salah</span>
            </div>
          </div>
          <div class="flex items-center gap-3 self-end sm:self-center">
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block font-semibold uppercase">Markah Terbaik</span>
              <span class="font-headline font-extrabold text-sm text-emerald-700">${Number(g.bestScore).toLocaleString()} mata</span>
            </div>
            <div class="text-right border-l border-slate-100 pl-3">
              <span class="text-[10px] text-slate-400 block font-semibold uppercase">Terkini</span>
              <span class="font-headline font-bold text-xs text-slate-700">${Number(g.latestScore).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `).join('');
    } else if (gameActivity && gameActivity.length > 0) {
      gamesList.innerHTML = gameActivity.map(g => `
        <div class="p-3 rounded-2xl border border-slate-100 bg-white flex items-center justify-between gap-3">
          <div>
            <span class="text-xs font-bold text-slate-800 block">${escapeHtml(g.gameName || g.title)}</span>
            <span class="text-[10px] text-slate-400 font-mono">${g.date ? new Date(g.date).toLocaleDateString('ms-MY') : ''}</span>
          </div>
          ${g.score != null ? `<span class="font-headline font-bold text-xs text-primary">${g.score} Markah</span>` : ''}
        </div>
      `).join('');
    } else {
      gamesList.innerHTML = `
        <div class="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <p class="text-xs font-semibold text-slate-600">Belum ada rekod permainan.</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Tiada percubaan permainan Maze 2D, Misi Makmal atau Kuiz direkodkan untuk murid ini.</p>
        </div>
      `;
    }

  } catch (err) {
    console.error('Error opening student detail:', err);
    document.getElementById('st-detail-quiz-list').innerHTML = `
      <div class="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">
        Ralat mendapatkan butiran pelajar: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// ---------------------------------------------------------------------
// 4. COMBINED CELLQUEST & 3D/AR MODEL MANAGEMENT (PHASE 3)
// ---------------------------------------------------------------------
function renderCellQuestSection() {
  switchCellQuestTab(activeCellQuestTab);
}

function switchCellQuestTab(tabName) {
  activeCellQuestTab = tabName;

  // Update tab navigation buttons
  ['models', 'organelles', 'preview', 'ar'].forEach(tab => {
    const btn = document.getElementById(`cq-tab-${tab}`) || document.getElementById(`tab-cq-btn-${tab}`);
    if (btn) {
      if (tab === tabName) {
        btn.className = 'cq-subtab active px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-primary shadow-xs flex items-center gap-1.5';
      } else {
        btn.className = 'cq-subtab px-4 py-2 rounded-xl text-xs font-bold transition text-slate-600 hover:text-slate-900 flex items-center gap-1.5';
      }
    }

    const panel = document.getElementById(`cq-panel-${tab}`) || document.getElementById(`cq-view-${tab}`);
    if (panel) {
      panel.classList.toggle('hidden', tab !== tabName);
    }
  });

  // Action based on tab
  if (tabName === 'models') {
    renderCellQuestModels();
  } else if (tabName === 'organelles') {
    if (typeof renderOrganelles === 'function') renderOrganelles();
  } else if (tabName === 'preview') {
    init3DPreview();
    changePreviewModel('animal');
  } else if (tabName === 'ar') {
    renderARSettingsTab();
  }
}

async function renderCellQuestModels() {
  const container = document.getElementById('cq-models-grid');
  if (!container) return;

  container.innerHTML = '<div class="p-8 text-center text-slate-400 sm:col-span-3">Memuatkan model 3D & GLB...</div>';

  try {
    const models = await window.CMSAdapter.getCellQuestModels({ status: 'all' });

    if (!models || models.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-3xl border border-slate-100 sm:col-span-3 space-y-2">
          <span class="material-symbols-outlined text-4xl text-slate-300">view_in_ar</span>
          <h4 class="font-headline font-bold text-slate-700 text-sm">Tiada Model 3D Didaftarkan</h4>
          <p class="text-xs text-slate-400">Klik "Tambah Model 3D Baru" untuk memuat naik fail GLB/GLTF bagi modul CellQuest.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = models.map(m => {
      const typeBadge = m.cellType === 'animal'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🐾 Sel Haiwan</span>'
        : m.cellType === 'plant'
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🌿 Sel Tumbuhan</span>'
        : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">🧬 Organel / Tambahan</span>';

      const statusBadge = m.active !== false
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Aktif</span>'
        : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Tidak Aktif</span>';

      return `
        <div class="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              ${typeBadge}
              ${statusBadge}
            </div>

            <div class="flex items-center gap-3.5 my-3">
              <div class="w-12 h-12 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-2xl">view_in_ar</span>
              </div>
              <div class="min-w-0">
                <h4 class="font-headline font-bold text-slate-900 text-sm truncate">${escapeHtml(m.title)}</h4>
                <span class="text-[11px] font-mono text-slate-400 truncate block">${escapeHtml(m.modelUrl || 'GLB Model')}</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              ${escapeHtml(m.description || 'Model visual 3D interaktif bagi eksplorasi sel Form 1.')}
            </p>

            ${m.arEnabled ? `
              <div class="mt-3 p-2 bg-teal-50/50 rounded-xl text-[11px] text-teal-800 flex items-center gap-1.5 border border-teal-100">
                <span class="material-symbols-outlined text-sm">qr_code_scanner</span>
                <span>Sasaran AR: <strong>${escapeHtml(m.arMarker || 'MARKER-DEFAULT')}</strong></span>
              </div>
            ` : ''}
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button type="button" onclick="previewSpecificModel('${escapeHtml(m.modelUrl)}', '${escapeHtml(m.cellType)}')" class="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition">
              <span class="material-symbols-outlined text-sm">3d_rotation</span>
              <span>Uji Pratonton</span>
            </button>
            <div class="space-x-1">
              <button type="button" onclick="openCellQuestModelModal('${escapeHtml(m.id)}')" class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-teal-50" title="Sunting">
                <span class="material-symbols-outlined text-base">edit</span>
              </button>
              <button type="button" onclick="confirmDeleteCellQuestModel('${escapeHtml(m.id)}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Padam">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error rendering CellQuest models:', err);
    container.innerHTML = `<div class="p-6 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:col-span-3">Ralat memuatkan model: ${err.message}</div>`;
  }
}

async function openCellQuestModelModal(id = '') {
  const modal = document.getElementById('modal-cellquest-model');
  if (!modal) return;

  const form = document.getElementById('form-cellquest-model');
  if (form) form.reset();

  document.getElementById('cq-model-id').value = '';
  document.getElementById('cq-model-upload-status').textContent = '';

  if (id) {
    document.getElementById('modal-cellquest-model-title').textContent = 'Sunting Model 3D CellQuest';
    const models = await window.CMSAdapter.getCellQuestModels({ status: 'all' });
    const m = models.find(x => x.id === id);
    if (m) {
      document.getElementById('cq-model-id').value = m.id;
      document.getElementById('cq-model-title-input').value = m.title || '';
      document.getElementById('cq-model-type-input').value = m.cellType || 'animal';
      document.getElementById('cq-model-status-input').value = m.active !== false ? 'active' : 'inactive';
      document.getElementById('cq-model-desc-input').value = m.description || '';
      document.getElementById('cq-model-url-input').value = m.modelUrl || '';
      document.getElementById('cq-model-ar-enabled').checked = m.arEnabled !== false;
      document.getElementById('cq-model-marker-input').value = m.arMarker || '';
      document.getElementById('cq-model-thumb-input').value = m.thumbnailUrl || '';
    }
  } else {
    document.getElementById('modal-cellquest-model-title').textContent = 'Tambah Model 3D CellQuest';
    document.getElementById('cq-model-url-input').value = 'models/animal_cell_final.glb';
    document.getElementById('cq-model-ar-enabled').checked = true;
    document.getElementById('cq-model-marker-input').value = 'MARKER-CELL-01';
  }

  modal.showModal();
}

async function handleSaveCellQuestModel(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-cq-model');
  const origText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Menyimpan...</span>';
  }

  const id = document.getElementById('cq-model-id').value;
  let modelUrl = document.getElementById('cq-model-url-input').value.trim();
  const fileInput = document.getElementById('cq-model-file-input');

  try {
    // If user uploaded a new GLB file, upload to Supabase Storage first
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const statusP = document.getElementById('cq-model-upload-status');
      if (statusP) statusP.textContent = `Memuat naik ${file.name} ke pangkalan data...`;
      
      const uploadRes = await window.CMSAdapter.uploadMediaFile(file, 'cellquest_models');
      if (uploadRes && uploadRes.url) {
        modelUrl = uploadRes.url;
      }
    }

    if (!modelUrl) {
      throw new Error('Sila masukkan URL model atau muat naik fail .glb/.gltf.');
    }

    const modelData = {
      id: id || undefined,
      title: document.getElementById('cq-model-title-input').value.trim(),
      cellType: document.getElementById('cq-model-type-input').value,
      description: document.getElementById('cq-model-desc-input').value.trim(),
      modelUrl: modelUrl,
      thumbnailUrl: document.getElementById('cq-model-thumb-input').value.trim() || undefined,
      arEnabled: document.getElementById('cq-model-ar-enabled').checked,
      arMarker: document.getElementById('cq-model-marker-input').value.trim().toUpperCase(),
      active: document.getElementById('cq-model-status-input').value === 'active'
    };

    await window.CMSAdapter.saveCellQuestModel(modelData);

    document.getElementById('modal-cellquest-model').close();
    await renderCellQuestModels();
    await renderOverviewStats();

    if (typeof showToast === 'function') {
      showToast('Model 3D berjaya disimpan dan disegerakkan dengan modul murid!', 'success');
    }
  } catch (err) {
    console.error('Error saving 3D model:', err);
    if (typeof showToast === 'function') {
      showToast('Ralat: ' + err.message, 'error');
    } else {
      alert(err.message);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }
}

async function confirmDeleteCellQuestModel(id) {
  if (confirm('Padam model 3D ini daripada sistem CellQuest?')) {
    try {
      await window.CMSAdapter.deleteCellQuestModel(id);
      await renderCellQuestModels();
      await renderOverviewStats();
      if (typeof showToast === 'function') {
        showToast('Model 3D telah dipadam.', 'info');
      }
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Ralat memadam model: ' + err.message, 'error');
      }
    }
  }
}

// ---------------------------------------------------------------------
// 4B. THREE.JS 3D INTERACTIVE VIEWER (PHASE 3C)
// ---------------------------------------------------------------------
function init3DPreview() {
  const container = document.getElementById('cq-3d-preview-host');
  if (!container || is3DPreviewInitialized) return;

  if (typeof THREE === 'undefined') {
    container.innerHTML = '<div class="p-8 text-center text-slate-400">Pustaka visual 3D Three.js sedang dimuatkan...</div>';
    return;
  }

  // Clear host
  container.innerHTML = '';

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 450;

  // Scene
  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0xf8fafc);

  // Camera
  previewCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  previewCamera.position.set(0, 5, 12);

  // Renderer
  previewRenderer = new THREE.WebGLRenderer({ antialias: true });
  previewRenderer.setSize(width, height);
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  previewRenderer.shadowMap.enabled = true;
  container.appendChild(previewRenderer.domElement);

  // Controls
  if (typeof THREE.OrbitControls !== 'undefined') {
    previewControls = new THREE.OrbitControls(previewCamera, previewRenderer.domElement);
    previewControls.enableDamping = true;
    previewControls.dampingFactor = 0.05;
    previewControls.autoRotate = true;
    previewControls.autoRotateSpeed = 1.0;
  }

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 20, 0);
  previewScene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  previewScene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x26a69a, 0.5);
  dirLight2.position.set(-10, -10, -10);
  previewScene.add(dirLight2);

  // Grid Helper
  const gridHelper = new THREE.GridHelper(15, 15, 0x008080, 0xe2e8f0);
  gridHelper.position.y = -2;
  previewScene.add(gridHelper);

  // Animation Loop
  function animate() {
    previewAnimationId = requestAnimationFrame(animate);
    if (previewControls) previewControls.update();
    previewRenderer.render(previewScene, previewCamera);
  }
  animate();

  is3DPreviewInitialized = true;

  // Window resize handler
  window.addEventListener('resize', () => {
    if (!container || !previewCamera || !previewRenderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    previewCamera.aspect = w / h;
    previewCamera.updateProjectionMatrix();
    previewRenderer.setSize(w, h);
  });
}

function changePreviewModel(modelType) {
  let modelPath = '../models/animal_cell_final.glb';
  if (modelType === 'plant') {
    modelPath = '../models/plantcellnew.glb';
  } else if (modelType === 'animal') {
    modelPath = '../models/animal_cell_final.glb';
  } else {
    modelPath = modelType;
  }

  loadModelInto3DViewer(modelPath);
}

function previewSpecificModel(url, type) {
  switchCellQuestTab('preview');
  
  // Update select if animal/plant
  const sel = document.getElementById('preview-model-select');
  if (sel) {
    if (url.includes('plant')) sel.value = 'plant';
    else if (url.includes('animal')) sel.value = 'animal';
  }

  loadModelInto3DViewer(url.startsWith('http') || url.startsWith('../') ? url : `../${url}`);
}

function loadModelInto3DViewer(url) {
  if (!previewScene) init3DPreview();
  if (!previewScene) return;

  const statusLabel = document.getElementById('3d-preview-status');
  if (statusLabel) statusLabel.textContent = 'Memuatkan fail 3D...';

  // Remove previous mesh
  if (previewCurrentMesh) {
    previewScene.remove(previewCurrentMesh);
    previewCurrentMesh = null;
  }

  if (typeof THREE.GLTFLoader === 'undefined') {
    console.warn('GLTFLoader is not available yet.');
    createFallback3DMesh();
    if (statusLabel) statusLabel.textContent = 'Mod visual geometri aktif.';
    return;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      previewCurrentMesh = gltf.scene;
      
      // Auto-center and fit to view
      const box = new THREE.Box3().setFromObject(previewCurrentMesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5.0 / (maxDim || 1);
      previewCurrentMesh.scale.set(scale, scale, scale);
      
      previewCurrentMesh.position.x = -center.x * scale;
      previewCurrentMesh.position.y = -center.y * scale;
      previewCurrentMesh.position.z = -center.z * scale;

      previewScene.add(previewCurrentMesh);
      if (statusLabel) statusLabel.textContent = 'Model berjaya dimuatkan.';
    },
    (xhr) => {
      if (statusLabel && xhr.total > 0) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        statusLabel.textContent = `Memuatkan: ${percent}%`;
      }
    },
    (error) => {
      console.warn('Could not load GLB file from', url, error);
      createFallback3DMesh();
      if (statusLabel) statusLabel.textContent = 'Pratonton geometri sel interaktif.';
    }
  );
}

function createFallback3DMesh() {
  const group = new THREE.Group();
  
  // Outer cell membrane sphere
  const membraneGeo = new THREE.SphereGeometry(3, 32, 32);
  const membraneMat = new THREE.MeshPhongMaterial({
    color: 0x13a99c,
    transparent: true,
    opacity: 0.35,
    wireframe: false
  });
  const membrane = new THREE.Mesh(membraneGeo, membraneMat);
  group.add(membrane);

  // Nucleus
  const nucleusGeo = new THREE.SphereGeometry(1.1, 24, 24);
  const nucleusMat = new THREE.MeshPhongMaterial({ color: 0x004d40 });
  const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
  group.add(nucleus);

  // Mitochondria
  for (let i = 0; i < 4; i++) {
    const mitoGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
    const mitoMat = new THREE.MeshPhongMaterial({ color: 0xe65100 });
    const mito = new THREE.Mesh(mitoGeo, mitoMat);
    const angle = (i / 4) * Math.PI * 2;
    mito.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.2, 0.4);
    mito.rotation.z = angle;
    group.add(mito);
  }

  previewCurrentMesh = group;
  previewScene.add(group);
}

function reset3DCamera() {
  if (previewCamera && previewControls) {
    previewCamera.position.set(0, 5, 12);
    previewControls.target.set(0, 0, 0);
    previewControls.update();
  }
}

function toggle3DRotation() {
  if (previewControls) {
    previewControls.autoRotate = !previewControls.autoRotate;
  }
}

function renderARSettingsTab() {
  // Render educational AR marker reference & list
  const host = document.getElementById('ar-settings-container');
  if (!host) return;

  host.innerHTML = `
    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
        <span class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
          <span class="material-symbols-outlined text-xl">qr_code_scanner</span>
        </span>
        <div>
          <h4 class="font-headline font-bold text-slate-900 text-base">Tetapan Augmented Reality (AR) Murid</h4>
          <p class="text-xs text-slate-500">Konfigurasi penanda imbasan kamera telefon pintar dan buku teks Sains KSSM.</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 pt-2">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <span class="text-xs font-bold text-slate-800 block">Penanda Sel Haiwan (Marker Animal)</span>
          <p class="text-xs text-slate-500">Penanda bagi model <code>models/animal_cell_final.glb</code>. Murid boleh mengimbas rajah buku teks mukasurat 50.</p>
          <div class="pt-2 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Aktif Dalam Kamera</span>
            <span class="font-mono text-xs text-slate-500">MARKER-ANIMAL-01</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <span class="text-xs font-bold text-slate-800 block">Penanda Sel Tumbuhan (Marker Plant)</span>
          <p class="text-xs text-slate-500">Penanda bagi model <code>models/plantcellnew.glb</code>. Murid boleh mengimbas rajah buku teks mukasurat 52.</p>
          <div class="pt-2 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Aktif Dalam Kamera</span>
            <span class="font-mono text-xs text-slate-500">MARKER-PLANT-01</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 5. ADMIN ACCOUNT SETTINGS (PHASE 7)
// ---------------------------------------------------------------------
function updateLanguageCardsUI(lang) {
  const cardMs = document.getElementById('lang-card-ms');
  const cardEn = document.getElementById('lang-card-en');
  if (cardMs && cardEn) {
    if (lang === 'ms') {
      cardMs.className = 'flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-teal-50/50 cursor-pointer transition';
      cardEn.className = 'flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition';
    } else {
      cardEn.className = 'flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-teal-50/50 cursor-pointer transition';
      cardMs.className = 'flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition';
    }
  }
}

async function handleAdminLanguageChange(lang) {
  if (!window.AdminI18n) return;
  
  window.AdminI18n.setLanguage(lang);
  updateLanguageCardsUI(lang);

  // Persist preference to authenticated admin profile
  try {
    await window.CMSAdapter.updateAdminProfile({ preferredLanguage: lang });
  } catch (err) {
    console.warn('Could not save language to profile:', err);
  }

  // Update current view titles and static texts
  switchView(activeView);

  if (typeof showToast === 'function') {
    const msg = lang === 'en' ? 'Interface language set to English.' : 'Bahasa antara muka ditukar ke Bahasa Melayu.';
    showToast(msg, 'success');
  }
}

async function handleSaveAdminProfile(event) {
  event.preventDefault();
  const nameInput = document.getElementById('admin-pref-name');
  if (!nameInput) return;

  const displayName = nameInput.value.trim();
  if (!displayName) {
    if (typeof showToast === 'function') showToast('Sila masukkan nama paparan.', 'warning');
    return;
  }

  const btn = document.getElementById('btn-save-admin-profile');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Menyimpan...</span>';
  }

  try {
    await window.CMSAdapter.updateAdminProfile({ displayName });

    // Update session user cache
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    if (user) {
      user.name = displayName;
      if (typeof Auth.setCurrentUser === 'function') Auth.setCurrentUser(user);
    }

    // Update UI elements
    const sideName = document.getElementById('sidebar-admin-name');
    if (sideName) sideName.textContent = displayName;
    
    const sideInitial = document.getElementById('sidebar-admin-initial');
    if (sideInitial) sideInitial.textContent = displayName.charAt(0).toUpperCase();
    
    const greetName = document.getElementById('overview-greeting-name');
    if (greetName) greetName.textContent = displayName.split(' ')[0] || 'Cikgu';

    if (typeof showToast === 'function') {
      showToast('Profil pentadbir berjaya dikemaskini!', 'success');
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    if (typeof showToast === 'function') {
      showToast('Ralat mengemaskini profil: ' + err.message, 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function handleUpdateAdminPassword(event) {
  event.preventDefault();
  const newPass = document.getElementById('admin-new-password').value;
  const confirmPass = document.getElementById('admin-confirm-password').value;
  const feedback = document.getElementById('admin-password-feedback');

  if (feedback) {
    feedback.className = 'hidden text-xs p-3 rounded-xl';
  }

  if (newPass !== confirmPass) {
    if (feedback) {
      feedback.textContent = window.AdminI18n ? window.AdminI18n.t('passwordMismatch') : 'Kata laluan tidak sepadan!';
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700 block';
    }
    return;
  }

  if (newPass.length < 6) {
    if (feedback) {
      feedback.textContent = 'Kata laluan mestilah sekurang-kurangnya 6 aksara.';
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700 block';
    }
    return;
  }

  const btn = document.getElementById('btn-update-admin-password');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Mengemaskini...</span>';
  }

  try {
    const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!client || !client.auth) {
      throw new Error('Perkhidmatan Supabase Auth tidak tersedia.');
    }

    const { error } = await client.auth.updateUser({ password: newPass });
    if (error) throw error;

    document.getElementById('form-admin-password').reset();

    if (feedback) {
      feedback.textContent = window.AdminI18n ? window.AdminI18n.t('passwordSuccess') : 'Kata laluan berjaya dikemaskini!';
      feedback.className = 'text-xs p-3 rounded-xl bg-emerald-50 text-emerald-800 block';
    }

    if (typeof showToast === 'function') {
      showToast('Kata laluan akaun pentadbir telah dikemaskini.', 'success');
    }
  } catch (err) {
    console.error('Error updating password:', err);
    if (feedback) {
      feedback.textContent = `Ralat: ${err.message}`;
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700 block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function handleUpdateAdminEmail(event) {
  event.preventDefault();
  const newEmail = document.getElementById('admin-new-email').value.trim();
  const feedback = document.getElementById('admin-email-feedback');

  if (feedback) feedback.className = 'hidden text-xs p-3 rounded-xl';

  const btn = document.getElementById('btn-update-admin-email');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span><span>Menghantar...</span>';
  }

  try {
    const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!client || !client.auth) {
      throw new Error('Perkhidmatan Supabase Auth tidak tersedia.');
    }

    const { error } = await client.auth.updateUser({ email: newEmail });
    if (error) throw error;

    if (feedback) {
      feedback.textContent = window.AdminI18n ? window.AdminI18n.t('emailSuccess') : 'Pautan pengesahan telah dihantar ke e-mel baharu anda. Sila sahkan melalui peti masuk anda.';
      feedback.className = 'text-xs p-3 rounded-xl bg-blue-50 text-blue-800 block';
    }

    if (typeof showToast === 'function') {
      showToast('Pautan pengesahan e-mel dihantar.', 'info');
    }
  } catch (err) {
    console.error('Error requesting email change:', err);
    if (feedback) {
      feedback.textContent = `Ralat: ${err.message}`;
      feedback.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700 block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

async function handleAdminLogout() {
  const confirmMsg = window.AdminI18n 
    ? window.AdminI18n.t('logoutConfirm') 
    : 'Adakah anda pasti untuk log keluar dari Portal Pentadbir?';

  if (!confirm(confirmMsg)) {
    return;
  }

  // 1. Sign out from Supabase authoritative session
  if (window.ARSupabase && typeof window.ARSupabase.signOut === 'function') {
    try {
      await window.ARSupabase.signOut();
    } catch (e) {
      console.warn('Supabase sign-out warning on admin logout:', e);
    }
  }

  // 2. Clear all admin flags and auth tokens
  const keysToRemove = [
    'arselnelAdmin',
    'arselnel_current_user',
    'currentUser',
    'arselnel_auth_token',
    'arselnel_demo_mode',
    'arselnel_local_migration_source'
  ];

  keysToRemove.forEach(k => {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    } catch (_) {}
  });

  // 3. Clear Auth singleton if available
  if (window.Auth && typeof window.Auth.logout === 'function') {
    try {
      window.Auth.logout(null);
    } catch (_) {}
  }

  // 4. Redirect cleanly to Admin login page with logged_out parameter
  window.location.replace('../auth/login.html?role=admin&logged_out=1');
}

// ---------------------------------------------------------------------
// 10. STUDENT DELETION & TEACHER APPOINTMENT HANDLERS (HARDENED)
// ---------------------------------------------------------------------

let isDeleteInProgress = false;

function setupModalSafeguards() {
  const modals = [
    { id: 'modal-delete-student', closeFn: closeDeleteStudentModal },
    { id: 'modal-promote-teacher', closeFn: closePromoteTeacherModal },
    { id: 'modal-demote-teacher', closeFn: closeDemoteTeacherModal }
  ];

  modals.forEach(({ id, closeFn }) => {
    const el = document.getElementById(id);
    if (el && !el.dataset.safeguardsAttached) {
      el.dataset.safeguardsAttached = 'true';

      // Native Escape key handler
      el.addEventListener('cancel', (e) => {
        if (isDeleteInProgress) {
          e.preventDefault();
        } else {
          closeFn();
        }
      });

      // Backdrop click handler
      el.addEventListener('click', (e) => {
        if (isDeleteInProgress) return;
        const rect = el.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          closeFn();
        }
      });
    }
  });
}

function openDeleteStudentModal(studentId, studentName, studentEmail) {
  if (isDeleteInProgress) return;

  const isSuperAdmin = (window.Auth && typeof window.Auth.isSuperAdmin === 'function')
    ? window.Auth.isSuperAdmin()
    : (localStorage.getItem('arselnel_superadmin') === 'true');

  if (!isSuperAdmin) {
    if (typeof showToast === 'function') {
      showToast('Hanya Pentadbir Utama (Super Admin) dibenarkan memadam akaun murid.', 'error');
    } else {
      alert('Hanya Pentadbir Utama (Super Admin) dibenarkan memadam akaun murid.');
    }
    return;
  }

  const modal = document.getElementById('modal-delete-student');
  if (!modal) {
    console.error('modal-delete-student tidak dijumpai dalam DOM');
    return;
  }

  setupModalSafeguards();

  const idInput = document.getElementById('del-student-target-id') || document.getElementById('del-student-id');
  const nameEl = document.getElementById('del-student-modal-name') || document.getElementById('del-student-name');
  const emailEl = document.getElementById('del-student-modal-email') || document.getElementById('del-student-email');
  const uuidEl = document.getElementById('del-student-modal-id');
  const reasonInput = document.getElementById('del-student-reason');
  const executeBtn = document.getElementById('btn-execute-delete-student') || document.getElementById('del-btn-execute');
  const btnText = document.getElementById('btn-delete-student-text');
  const errorEl = document.getElementById('del-student-error');

  if (idInput) idInput.value = studentId;
  if (nameEl) nameEl.textContent = studentName || 'Murid';
  if (emailEl) emailEl.textContent = studentEmail || '-';
  if (uuidEl) uuidEl.textContent = studentId || '-';
  if (reasonInput) reasonInput.value = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (executeBtn) {
    executeBtn.disabled = false;
    executeBtn.classList.remove('opacity-50', 'opacity-75', 'cursor-not-allowed');
  }
  if (btnText) {
    btnText.textContent = 'Padam Akaun';
  }

  try {
    if (!modal.open) {
      modal.showModal();
    }
  } catch (err) {
    console.error('Error showing modal-delete-student:', err);
  }
}

function closeDeleteStudentModal() {
  if (isDeleteInProgress) return;
  const modal = document.getElementById('modal-delete-student');
  if (modal && modal.open && typeof modal.close === 'function') {
    modal.close();
  }
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

async function executeDeleteStudent() {
  if (isDeleteInProgress) return;

  const idInput = document.getElementById('del-student-target-id') || document.getElementById('del-student-id');
  const reasonInput = document.getElementById('del-student-reason');
  const executeBtn = document.getElementById('btn-execute-delete-student') || document.getElementById('del-btn-execute');
  const btnText = document.getElementById('btn-delete-student-text');
  const errorEl = document.getElementById('del-student-error');

  if (!idInput || !idInput.value) {
    if (errorEl) {
      errorEl.textContent = 'Ralat: ID murid tidak sah.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  const studentId = idInput.value;
  const reason = (reasonInput && reasonInput.value.trim())
    ? reasonInput.value.trim()
    : 'Dipadam oleh Pentadbir Utama melalui Admin Portal';

  isDeleteInProgress = true;
  if (executeBtn) {
    executeBtn.disabled = true;
    executeBtn.classList.add('opacity-75', 'cursor-not-allowed');
  }
  if (btnText) {
    btnText.innerHTML = '<span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Memadamkan...</span></span>';
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  try {
    const res = await window.CMSAdapter.deleteStudentAccount(studentId, reason);

    if (!res || !res.success) {
      throw new Error(res && res.error ? res.error : 'Gagal memadam akaun murid dari pangkalan data.');
    }

    isDeleteInProgress = false;
    closeDeleteStudentModal();

    if (typeof showToast === 'function') {
      showToast('Akaun murid dan semua rekod pembelajaran telah dipadam dengan selamat.', 'success');
    } else {
      alert('Akaun murid dan rekod pembelajaran berjaya dipadam.');
    }

    // Dynamic Refresh across views and stats
    if (typeof renderStudents === 'function') {
      await renderStudents();
    }
    if (typeof renderUsersSection === 'function') {
      await renderUsersSection();
    }
    if (typeof renderOverviewStats === 'function') {
      await renderOverviewStats();
    }

  } catch (err) {
    console.error('Delete student failed:', err);
    isDeleteInProgress = false;
    if (executeBtn) {
      executeBtn.disabled = false;
      executeBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
    if (btnText) {
      btnText.textContent = 'Padam Akaun';
    }
    if (errorEl) {
      errorEl.textContent = err.message || 'Ralat semasa memadam akaun murid.';
      errorEl.classList.remove('hidden');
    } else {
      alert('Ralat memadam akaun: ' + err.message);
    }
  }
}

async function renderUsersSection() {
  const tbody = document.getElementById('user-management-table-body') || document.getElementById('users-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('search-user-input') || document.getElementById('search-users-input');
  const roleSelect = document.getElementById('filter-user-role');
  const search = searchInput ? searchInput.value.trim() : '';
  const role = roleSelect ? roleSelect.value : 'all';

  // 1. Immediately show loading skeletons in stat cards (NEVER show raw 0 during fetch)
  const statTotal = document.getElementById('stat-total-users');
  const statTeachers = document.getElementById('stat-total-teachers');
  const statStudents = document.getElementById('stat-total-students-users');

  if (statTotal) statTotal.innerHTML = '<span class="inline-block w-10 h-7 bg-slate-100 animate-pulse rounded-lg"></span>';
  if (statTeachers) statTeachers.innerHTML = '<span class="inline-block w-10 h-7 bg-blue-50 animate-pulse rounded-lg"></span>';
  if (statStudents) statStudents.innerHTML = '<span class="inline-block w-10 h-7 bg-slate-100 animate-pulse rounded-lg"></span>';

  // 2. Loading state for table
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="py-10 text-center text-slate-400 text-xs">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-xl animate-spin text-teal-600">sync</span>
          <span>Memuatkan senarai pengguna & peranan dari sistem...</span>
        </span>
      </td>
    </tr>
  `;

  try {
    const data = await window.CMSAdapter.getUsersList({ search, role });
    const users = data.users || [];
    const allUsers = data.allUsers || users;

    // 3. Genuine real-time statistics calculation over all accounts
    const stats = data.stats || {
      total: allUsers.length,
      teachers: allUsers.filter(u => (u.role === 'teacher' || u.role === 'guru') && u.status !== 'inactive').length,
      students: allUsers.filter(u => (u.role === 'student' || u.role === 'murid') && u.status !== 'inactive').length
    };

    if (statTotal) statTotal.textContent = String(stats.total);
    if (statTeachers) statTeachers.textContent = String(stats.teachers);
    if (statStudents) statStudents.textContent = String(stats.students);

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center bg-slate-50/50">
            <div class="max-w-xs mx-auto space-y-2">
              <span class="material-symbols-outlined text-3xl text-slate-300">group_off</span>
              <p class="text-xs font-bold text-slate-700">Tiada pengguna dijumpai</p>
              <p class="text-[11px] text-slate-400">Tiada akaun yang sepadan dengan kriteria carian atau penapis peranan.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const isSuperAdmin = (window.Auth && typeof window.Auth.isSuperAdmin === 'function')
      ? window.Auth.isSuperAdmin()
      : (localStorage.getItem('arselnel_superadmin') === 'true');

    tbody.innerHTML = users.map(u => {
      const isSuper = u.role === 'superadmin' || u.is_superadmin === true || u.is_super_admin === true;
      const isTeacherRole = u.role === 'teacher' || u.role === 'guru';
      const isStudentRole = !isSuper && !isTeacherRole;

      let roleBadge = '';
      if (isSuper) {
        roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300"><span class="material-symbols-outlined text-xs">shield</span>Super Admin</span>`;
      } else if (isTeacherRole) {
        roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200"><span class="material-symbols-outlined text-xs">badge</span>Guru</span>`;
      } else {
        roleBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"><span class="material-symbols-outlined text-xs">school</span>Murid</span>`;
      }

      const statusBadge = u.status === 'inactive'
        ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Tidak Aktif</span>`
        : `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Aktif</span>`;

      const createdDate = u.created_at
        ? new Date(u.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-';

      // Action buttons depending on Super Admin permission & target user's role
      let actionButtons = '';
      if (isSuper) {
        actionButtons = `
          <span class="text-xs text-amber-800 font-bold inline-flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
            <span class="material-symbols-outlined text-xs">lock</span>
            <span>Pentadbir Utama (Kekal)</span>
          </span>
        `;
      } else if (!isSuperAdmin) {
        actionButtons = `
          <span class="text-xs text-slate-400 italic">Kawalan Super Admin</span>
        `;
      } else if (isStudentRole) {
        actionButtons = `
          <div class="inline-flex items-center gap-2 justify-end">
            <button type="button" onclick="openPromoteTeacherModal('${escapeHtml(u.id)}', '${escapeHtml(u.name || u.full_name || 'Pelajar')}', '${escapeHtml(u.email || '')}')" class="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs transition inline-flex items-center gap-1 shadow-sm border border-indigo-200">
              <span class="material-symbols-outlined text-xs">military_tech</span>
              <span>Lantik Sebagai Guru</span>
            </button>
            <button type="button" onclick="openDeleteStudentModal('${escapeHtml(u.id)}', '${escapeHtml(u.name || u.full_name || 'Pelajar')}', '${escapeHtml(u.email || '')}')" title="Padam Akaun Murid" class="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs transition inline-flex items-center gap-1 border border-rose-100">
              <span class="material-symbols-outlined text-xs">delete</span>
            </button>
          </div>
        `;
      } else if (isTeacherRole) {
        actionButtons = `
          <button type="button" onclick="openDemoteTeacherModal('${escapeHtml(u.id)}', '${escapeHtml(u.name || u.full_name || 'Guru')}', '${escapeHtml(u.email || '')}')" class="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-bold text-xs transition inline-flex items-center gap-1 shadow-sm border border-amber-200">
            <span class="material-symbols-outlined text-xs">person_remove</span>
            <span>Batalkan Pelantikan Guru</span>
          </button>
        `;
      }

      return `
        <tr class="hover:bg-slate-50/60 transition border-b border-slate-100">
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl ${isSuper ? 'bg-amber-100 text-amber-900' : isTeacherRole ? 'bg-indigo-100 text-indigo-900' : 'bg-teal-100 text-teal-900'} font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                ${(u.name || u.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0">
                <strong class="font-headline font-bold text-slate-900 block text-sm truncate">${escapeHtml(u.name || u.full_name)}</strong>
                <span class="text-xs text-slate-400 block font-mono truncate">${escapeHtml(u.email || '-')}</span>
              </div>
            </div>
          </td>
          <td class="py-4 px-4 font-semibold text-xs text-slate-700">
            ${escapeHtml(u.class_name || 'Tingkatan 1')}
          </td>
          <td class="py-4 px-4">
            ${roleBadge}
          </td>
          <td class="py-4 px-4">
            ${statusBadge}
          </td>
          <td class="py-4 px-4 text-xs text-slate-500">
            ${createdDate}
          </td>
          <td class="py-4 px-6 text-right">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Error rendering users section:', err);
    if (statTotal) statTotal.innerHTML = '<span class="text-xs font-bold text-rose-500">Ralat</span>';
    if (statTeachers) statTeachers.innerHTML = '<span class="text-xs font-bold text-rose-500">Ralat</span>';
    if (statStudents) statStudents.innerHTML = '<span class="text-xs font-bold text-rose-500">Ralat</span>';

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center bg-rose-50/50">
          <div class="max-w-xs mx-auto space-y-2">
            <span class="material-symbols-outlined text-3xl text-rose-400">error</span>
            <p class="text-xs font-bold text-rose-700">Gagal memuatkan senarai pengguna & statistik</p>
            <p class="text-[11px] text-rose-500">${escapeHtml(err.message || 'Sila semak sambungan rangkaian.')}</p>
            <button type="button" onclick="renderUsersSection()" class="mt-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition">
              Cuba Lagi
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

function openPromoteTeacherModal(id, name, email) {
  const modal = document.getElementById('modal-promote-teacher');
  if (!modal) return;
  setupModalSafeguards();

  const idInput = document.getElementById('promote-user-target-id') || document.getElementById('promote-user-id');
  const nameEl = document.getElementById('promote-user-name');
  const emailEl = document.getElementById('promote-user-email');
  if (idInput) idInput.value = id;
  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;

  try {
    if (!modal.open) modal.showModal();
  } catch (err) {
    console.error('Error showing modal-promote-teacher:', err);
  }
}

function closePromoteTeacherModal() {
  const modal = document.getElementById('modal-promote-teacher');
  if (modal && modal.open && typeof modal.close === 'function') {
    modal.close();
  }
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

async function executePromoteTeacher() {
  const idInput = document.getElementById('promote-user-target-id') || document.getElementById('promote-user-id');
  const nameEl = document.getElementById('promote-user-name');
  const emailEl = document.getElementById('promote-user-email');
  const btn = document.getElementById('btn-execute-promote') || document.getElementById('btn-confirm-promote');

  if (!idInput || !idInput.value) return;

  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Memproses...</span>';
  }

  try {
    const res = await window.CMSAdapter.promoteUserToTeacher(idInput.value, {
      name: nameEl ? nameEl.textContent : '',
      email: emailEl ? emailEl.textContent : ''
    });

    if (!res || !res.success) {
      throw new Error(res && res.error ? res.error : 'Gagal melantik pengguna sebagai guru.');
    }

    closePromoteTeacherModal();
    if (typeof showToast === 'function') {
      showToast('Pengguna berjaya dilantik sebagai Guru Sains!', 'success');
    } else {
      alert('Pengguna berjaya dilantik sebagai Guru Sains!');
    }

    // Dynamic stats and table refresh
    await renderUsersSection();
    if (typeof renderOverviewStats === 'function') {
      await renderOverviewStats();
    }
  } catch (err) {
    console.error('Promote teacher error:', err);
    alert('Ralat pelantikan guru: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

function openDemoteTeacherModal(id, name, email) {
  const modal = document.getElementById('modal-demote-teacher');
  if (!modal) return;
  setupModalSafeguards();

  const idInput = document.getElementById('demote-user-target-id') || document.getElementById('demote-user-id');
  const nameEl = document.getElementById('demote-user-name');
  const emailEl = document.getElementById('demote-user-email');
  if (idInput) idInput.value = id;
  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;

  try {
    if (!modal.open) modal.showModal();
  } catch (err) {
    console.error('Error showing modal-demote-teacher:', err);
  }
}

function closeDemoteTeacherModal() {
  const modal = document.getElementById('modal-demote-teacher');
  if (modal && modal.open && typeof modal.close === 'function') {
    modal.close();
  }
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

async function executeDemoteTeacher() {
  const idInput = document.getElementById('demote-user-target-id') || document.getElementById('demote-user-id');
  const nameEl = document.getElementById('demote-user-name');
  const emailEl = document.getElementById('demote-user-email');
  const btn = document.getElementById('btn-execute-demote') || document.getElementById('btn-confirm-demote');

  if (!idInput || !idInput.value) return;

  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span><span>Memproses...</span>';
  }

  try {
    const res = await window.CMSAdapter.demoteTeacherToStudent(idInput.value, {
      name: nameEl ? nameEl.textContent : '',
      email: emailEl ? emailEl.textContent : ''
    });

    if (!res || !res.success) {
      throw new Error(res && res.error ? res.error : 'Gagal membatalkan pelantikan guru.');
    }

    closeDemoteTeacherModal();
    if (typeof showToast === 'function') {
      showToast('Pelantikan guru telah dibatalkan. Akaun dikembalikan ke Murid.', 'success');
    } else {
      alert('Pelantikan guru telah dibatalkan. Akaun dikembalikan ke Murid.');
    }

    // Dynamic stats and table refresh
    await renderUsersSection();
    if (typeof renderOverviewStats === 'function') {
      await renderOverviewStats();
    }
  } catch (err) {
    console.error('Demote teacher error:', err);
    alert('Ralat pembatalan guru: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// Expose functions globally for HTML inline handlers
window.switchView = switchView;
window.refreshDashboardData = refreshDashboardData;
window.renderOverviewStats = renderOverviewStats;
window.renderStudents = renderStudents;
window.openStudentDetailModal = openStudentDetailModal;
window.openDeleteStudentModal = openDeleteStudentModal;
window.toggleDeleteConfirmBtn = toggleDeleteConfirmBtn;
window.closeDeleteStudentModal = closeDeleteStudentModal;
window.executeDeleteStudent = executeDeleteStudent;
window.renderUsersSection = renderUsersSection;
window.openPromoteTeacherModal = openPromoteTeacherModal;
window.closePromoteTeacherModal = closePromoteTeacherModal;
window.executePromoteTeacher = executePromoteTeacher;
window.openDemoteTeacherModal = openDemoteTeacherModal;
window.closeDemoteTeacherModal = closeDemoteTeacherModal;
window.executeDemoteTeacher = executeDemoteTeacher;
window.switchCellQuestTab = switchCellQuestTab;
window.renderCellQuestModels = renderCellQuestModels;
window.openCellQuestModelModal = openCellQuestModelModal;
window.handleSaveCellQuestModel = handleSaveCellQuestModel;
window.confirmDeleteCellQuestModel = confirmDeleteCellQuestModel;
window.changePreviewModel = changePreviewModel;
window.previewSpecificModel = previewSpecificModel;
window.reset3DCamera = reset3DCamera;
window.toggle3DRotation = toggle3DRotation;
window.handleAdminLanguageChange = handleAdminLanguageChange;
window.handleSaveAdminProfile = handleSaveAdminProfile;
window.handleUpdateAdminPassword = handleUpdateAdminPassword;
window.handleUpdateAdminEmail = handleUpdateAdminEmail;
window.handleAdminLogout = handleAdminLogout;
