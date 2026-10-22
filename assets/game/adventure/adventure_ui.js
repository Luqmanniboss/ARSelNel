/**
 * ARSelNel 2D Open World Quiz Adventure - UI, Modal Controller & Persistence
 * Menguruskan HUD, Modal Soalan Burger, Pengesahan Jawapan, Zon FINISH & Penyimpanan Data
 */

(function(global) {
  'use strict';

  const { Audio, GameState } = global.ARSelNelAdventure;

  class AdventureUIController {
    constructor(engine, options = {}) {
      this.engine = engine;
      this.options = options;

      this.score = 0;
      this.correctCount = 0;
      this.incorrectCount = 0;
      this.elapsedSeconds = 0;
      this.timerInterval = null;
      this.pendingConfirmCallback = null;

      this.user = this.getCurrentUser();

      // Rujukan Elemen DOM HUD
      this.hudScore = document.getElementById('adv-hud-score');
      this.hudBurgers = document.getElementById('adv-hud-burgers');
      this.hudTimer = document.getElementById('adv-hud-timer');
      this.hudMuteBtn = document.getElementById('adv-hud-mute-btn');
      this.hudPauseBtn = document.getElementById('adv-hud-pause-btn');
      this.hudGuideBtn = document.getElementById('adv-hud-guide-btn');
      this.hudExitBtn = document.getElementById('adv-hud-exit-btn');
      this.hudPlayerName = document.getElementById('adv-hud-player-name');

      // Modal Pengenalan & Panduan
      this.modalIntro = document.getElementById('adv-intro-modal');
      this.btnStart = document.getElementById('adv-start-btn');
      this.btnIntroReturnPause = document.getElementById('adv-intro-return-pause-btn');
      this.introActionsStart = document.getElementById('adv-intro-actions-start');
      this.introActionsPause = document.getElementById('adv-intro-actions-pause');

      // Modal Menu Jeda (Pause Menu)
      this.modalPause = document.getElementById('adv-pause-modal');
      this.pauseScore = document.getElementById('adv-pause-score');
      this.pauseBurgers = document.getElementById('adv-pause-burgers');
      this.pauseTime = document.getElementById('adv-pause-time');
      this.btnPauseResume = document.getElementById('adv-pause-resume-btn');
      this.btnPauseRestart = document.getElementById('adv-pause-restart-btn');
      this.btnPauseGuide = document.getElementById('adv-pause-guide-btn');
      this.btnPauseAudio = document.getElementById('adv-pause-audio-btn');
      this.pauseAudioIcon = document.getElementById('adv-pause-audio-icon');
      this.pauseAudioLabel = document.getElementById('adv-pause-audio-label');
      this.btnPauseExit = document.getElementById('adv-pause-exit-btn');

      // Modal Pengesahan Tindakan (Confirm Dialog)
      this.modalConfirm = document.getElementById('adv-confirm-modal');
      this.confirmIcon = document.getElementById('adv-confirm-icon');
      this.confirmTitle = document.getElementById('adv-confirm-title');
      this.confirmMessage = document.getElementById('adv-confirm-message');
      this.btnConfirmCancel = document.getElementById('adv-confirm-cancel-btn');
      this.btnConfirmOk = document.getElementById('adv-confirm-ok-btn');

      // Modal Soalan
      this.modalQuestion = document.getElementById('adv-question-modal');
      this.modalTitle = document.getElementById('adv-modal-title');
      this.modalTopic = document.getElementById('adv-modal-topic');
      this.modalLandmark = document.getElementById('adv-modal-landmark');
      this.modalQuestionText = document.getElementById('adv-modal-question-text');
      this.modalOptions = document.getElementById('adv-modal-options');
      this.modalSubmitBtn = document.getElementById('adv-modal-submit-btn');
      this.modalFeedback = document.getElementById('adv-modal-feedback');
      this.modalFeedbackText = document.getElementById('adv-modal-feedback-text');

      // Modal Penamat / Kemenangan
      this.modalVictory = document.getElementById('adv-victory-modal');
      this.victoryScore = document.getElementById('adv-victory-score');
      this.victoryCorrect = document.getElementById('adv-victory-correct');
      this.victoryTime = document.getElementById('adv-victory-time');
      this.victoryBadge = document.getElementById('adv-victory-badge');
      this.victoryStorageStatus = document.getElementById('adv-victory-storage-status');

      // Dialog Notis Gerbang Terkunci
      this.toastNotice = document.getElementById('adv-toast-notice');

      this.currentActiveQuestion = null;
      this.currentActiveBurger = null;
      this.selectedOptionIdx = null;
      this.isAnswerSubmitted = false;

      this.initEvents();
      this.initKeyboardShortcuts();
      this.initVisibilityListener();
      this.updateHUD();
      this.updateTimerDisplay();

      // Mulakan permainan dalam mod READY dengan skrin pengenalan
      this.openInstructions(false);
    }

    getCurrentUser() {
      if (window.AuthGuard && window.AuthGuard.getUser) {
        const u = window.AuthGuard.getUser();
        if (u) return u;
      }
      try {
        const raw = localStorage.getItem('arselnel_current_user') || localStorage.getItem('currentUser');
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return { id: 'std_anon', name: 'Pelajar Saintis', role: 'student', grade: 'Tingkatan 1' };
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.engine.state === (GameState ? GameState.PLAYING : 'playing')) {
          this.elapsedSeconds++;
          this.updateTimerDisplay();
        }
      }, 1000);
    }

    updateTimerDisplay() {
      if (this.hudTimer) {
        const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
        const s = String(this.elapsedSeconds % 60).padStart(2, '0');
        this.hudTimer.textContent = `${m}:${s}`;
      }
    }

    getFormattedTime() {
      const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const s = String(this.elapsedSeconds % 60).padStart(2, '0');
      return `${m}:${s}`;
    }

    // 1. Memulakan Permainan daripada Skrin Pengenalan (Mula Permainan)
    startGame() {
      this.elapsedSeconds = 0;
      this.updateTimerDisplay();

      if (this.modalIntro) {
        this.modalIntro.classList.add('hidden');
        this.modalIntro.classList.remove('flex');
      }

      this.engine.setState(GameState ? GameState.PLAYING : 'playing');
      this.startTimer();
      this.updateHUD();
    }

    // 2. Menjeda Permainan (Pause)
    pauseGame() {
      if (this.engine.state !== (GameState ? GameState.PLAYING : 'playing')) return;

      this.engine.setState(GameState ? GameState.PAUSED : 'paused');

      // Kemas kini metrik sesi semasa dalam modal jeda
      if (this.pauseScore) this.pauseScore.textContent = `${this.score} pts`;
      if (this.pauseBurgers) {
        const collected = this.engine.burgers.filter(b => b.collected).length;
        this.pauseBurgers.textContent = `${collected}/10`;
      }
      if (this.pauseTime) this.pauseTime.textContent = this.getFormattedTime();

      this.updateAudioUI();

      if (this.modalPause) {
        this.modalPause.classList.remove('hidden');
        this.modalPause.classList.add('flex');
      }
    }

    // 3. Menyambung Permainan (Resume)
    resumeGame() {
      if (this.engine.state !== (GameState ? GameState.PAUSED : 'paused')) return;

      if (this.modalPause) {
        this.modalPause.classList.add('hidden');
        this.modalPause.classList.remove('flex');
      }
      if (this.modalIntro) {
        this.modalIntro.classList.add('hidden');
        this.modalIntro.classList.remove('flex');
      }
      if (this.modalConfirm) {
        this.modalConfirm.classList.add('hidden');
        this.modalConfirm.classList.remove('flex');
      }

      this.engine.setState(GameState ? GameState.PLAYING : 'playing');
    }

    // 4. Membuka Arahan / Cara Bermain
    openInstructions(fromPause = false) {
      if (!this.modalIntro) return;

      if (fromPause) {
        if (this.modalPause) {
          this.modalPause.classList.add('hidden');
          this.modalPause.classList.remove('flex');
        }
        if (this.introActionsStart) this.introActionsStart.classList.add('hidden');
        if (this.introActionsPause) this.introActionsPause.classList.remove('hidden');
      } else {
        if (this.introActionsStart) this.introActionsStart.classList.remove('hidden');
        if (this.introActionsPause) this.introActionsPause.classList.add('hidden');
      }

      this.modalIntro.classList.remove('hidden');
      this.modalIntro.classList.add('flex');
    }

    closeInstructionsToPause() {
      if (this.modalIntro) {
        this.modalIntro.classList.add('hidden');
        this.modalIntro.classList.remove('flex');
      }
      if (this.modalPause) {
        this.modalPause.classList.remove('hidden');
        this.modalPause.classList.add('flex');
      }
    }

    // 5. Modal Pengesahan Tindakan (Dialog Konfirmasi)
    showConfirmDialog({ icon = '⚠️', title, message, okText = 'Ya, Sahkan', onConfirm }) {
      if (!this.modalConfirm) return;

      // Sembunyikan modal jeda supaya tiada tindanan berganda
      if (this.modalPause) {
        this.modalPause.classList.add('hidden');
        this.modalPause.classList.remove('flex');
      }

      if (this.confirmIcon) this.confirmIcon.textContent = icon;
      if (this.confirmTitle) this.confirmTitle.textContent = title;
      if (this.confirmMessage) this.confirmMessage.textContent = message;
      if (this.btnConfirmOk) this.btnConfirmOk.textContent = okText;

      this.pendingConfirmCallback = onConfirm;

      this.modalConfirm.classList.remove('hidden');
      this.modalConfirm.classList.add('flex');
    }

    closeConfirmDialog() {
      if (this.modalConfirm) {
        this.modalConfirm.classList.add('hidden');
        this.modalConfirm.classList.remove('flex');
      }
      this.pendingConfirmCallback = null;

      // Paparkan semula modal jeda sekiranya permainan masih dalam keadaan jeda
      if (this.engine.state === (GameState ? GameState.PAUSED : 'paused') && this.modalPause) {
        this.modalPause.classList.remove('hidden');
        this.modalPause.classList.add('flex');
      }
    }

    handleRestartRequest() {
      this.showConfirmDialog({
        icon: '🔄',
        title: 'Mulakan Semula Permainan?',
        message: 'Semua kemajuan bagi sesi permainan semasa akan ditetapkan semula. Adakah anda pasti?',
        okText: 'Ya, Mula Semula',
        onConfirm: () => {
          this.closeConfirmDialog();
          if (this.modalPause) {
            this.modalPause.classList.add('hidden');
            this.modalPause.classList.remove('flex');
          }
          this.score = 0;
          this.correctCount = 0;
          this.incorrectCount = 0;
          this.elapsedSeconds = 0;
          this.engine.resetRun();
          this.updateHUD();
          this.updateTimerDisplay();
          this.startGame();
        }
      });
    }

    handleExitRequest() {
      this.showConfirmDialog({
        icon: '🚪',
        title: 'Keluar daripada Pengembaraan?',
        message: 'Anda pasti mahu keluar? Kemajuan sesi semasa mungkin tidak disimpan.',
        okText: 'Ya, Keluar',
        onConfirm: () => {
          this.closeConfirmDialog();
          if (this.timerInterval) clearInterval(this.timerInterval);
          this.engine.stop();
          window.location.href = '../hab_permainan/code.html';
        }
      });
    }

    toggleAudio() {
      Audio.toggleMute();
      this.updateAudioUI();
    }

    updateAudioUI() {
      const isMuted = Audio.muted;
      if (this.hudMuteBtn) {
        const icon = this.hudMuteBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = isMuted ? 'volume_off' : 'volume_up';
        this.hudMuteBtn.setAttribute('title', isMuted ? 'Buka Bunyi' : 'Senyapkan Bunyi');
      }
      if (this.pauseAudioIcon) {
        this.pauseAudioIcon.textContent = isMuted ? 'volume_off' : 'volume_up';
      }
      if (this.pauseAudioLabel) {
        this.pauseAudioLabel.textContent = isMuted ? 'Bunyi: Senyap' : 'Bunyi: Aktif';
      }
    }

    initEvents() {
      // Set nama pemain di HUD
      if (this.hudPlayerName) {
        this.hudPlayerName.textContent = this.user.nickname || this.user.name || 'Pelajar Saintis';
      }

      // Butang Mula Permainan di Skrin Pengenalan
      if (this.btnStart) {
        this.btnStart.addEventListener('click', () => this.startGame());
      }

      // Butang Kembali ke Menu Jeda dari Panduan
      if (this.btnIntroReturnPause) {
        this.btnIntroReturnPause.addEventListener('click', () => this.closeInstructionsToPause());
      }

      // Butang Pause HUD
      if (this.hudPauseBtn) {
        this.hudPauseBtn.addEventListener('click', () => {
          if (this.engine.state === (GameState ? GameState.PLAYING : 'playing')) {
            this.pauseGame();
          } else if (this.engine.state === (GameState ? GameState.PAUSED : 'paused')) {
            this.resumeGame();
          }
        });
      }

      // Butang Mute Sound HUD
      if (this.hudMuteBtn) {
        this.updateAudioUI();
        this.hudMuteBtn.addEventListener('click', () => this.toggleAudio());
      }

      // Butang Panduan HUD
      if (this.hudGuideBtn) {
        this.hudGuideBtn.addEventListener('click', () => {
          if (this.engine.state === (GameState ? GameState.PLAYING : 'playing')) {
            this.pauseGame();
          }
          this.openInstructions(true);
        });
      }

      // Butang Keluar Permainan HUD
      if (this.hudExitBtn) {
        this.hudExitBtn.addEventListener('click', () => this.handleExitRequest());
      }

      // Butang-butang dalam Menu Jeda (Pause Modal)
      if (this.btnPauseResume) {
        this.btnPauseResume.addEventListener('click', () => this.resumeGame());
      }

      if (this.btnPauseRestart) {
        this.btnPauseRestart.addEventListener('click', () => this.handleRestartRequest());
      }

      if (this.btnPauseGuide) {
        this.btnPauseGuide.addEventListener('click', () => this.openInstructions(true));
      }

      if (this.btnPauseAudio) {
        this.btnPauseAudio.addEventListener('click', () => this.toggleAudio());
      }

      if (this.btnPauseExit) {
        this.btnPauseExit.addEventListener('click', () => this.handleExitRequest());
      }

      // Butang Modal Pengesahan
      if (this.btnConfirmCancel) {
        this.btnConfirmCancel.addEventListener('click', () => this.closeConfirmDialog());
      }

      if (this.btnConfirmOk) {
        this.btnConfirmOk.addEventListener('click', () => {
          if (typeof this.pendingConfirmCallback === 'function') {
            this.pendingConfirmCallback();
          }
        });
      }

      // Butang Hantar Jawapan Modal Soalan
      if (this.modalSubmitBtn) {
        this.modalSubmitBtn.addEventListener('click', () => this.handleSubmitAnswer());
      }

      // Pintasan Papan Kekunci dalam Modal Soalan (1, 2, 3, 4 atau A, B, C, D & Enter)
      window.addEventListener('keydown', (e) => {
        if (this.modalQuestion && !this.modalQuestion.classList.contains('hidden')) {
          const key = e.key.toUpperCase();
          let optIdx = -1;
          if (['1', 'A'].includes(key)) optIdx = 0;
          if (['2', 'B'].includes(key)) optIdx = 1;
          if (['3', 'C'].includes(key)) optIdx = 2;
          if (['4', 'D'].includes(key)) optIdx = 3;

          if (optIdx !== -1 && !this.isAnswerSubmitted) {
            this.selectOption(optIdx);
            e.preventDefault();
          } else if (e.key === 'Enter') {
            if (this.modalSubmitBtn && !this.modalSubmitBtn.disabled) {
              this.modalSubmitBtn.click();
              e.preventDefault();
            }
          }
        }
      });

      // Virtual D-pad Touch Controls untuk Peranti Mudah Alih & Tablet
      this.setupTouchControls();
    }

    // Pintasan Kekunci Esc dan P untuk Jeda / Sambung
    initKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Jangan campur tangan jika soalan sedang aktif atau modal kemenangan dipaparkan
        if (this.engine.state === (GameState ? GameState.QUESTION : 'question') ||
            this.engine.state === (GameState ? GameState.COMPLETED : 'completed')) {
          return;
        }

        const key = e.key;
        if (key === 'Escape' || key === 'p' || key === 'P') {
          // Elakkan cetusan berulang jika kekunci ditekan berterusan
          if (e.repeat) return;

          if (this.engine.state === (GameState ? GameState.PLAYING : 'playing')) {
            this.pauseGame();
            e.preventDefault();
          } else if (this.engine.state === (GameState ? GameState.PAUSED : 'paused')) {
            // Jika dialog pengesahan buka, tutup dialog
            if (this.modalConfirm && !this.modalConfirm.classList.contains('hidden')) {
              this.closeConfirmDialog();
              e.preventDefault();
            } else if (this.modalIntro && !this.modalIntro.classList.contains('hidden')) {
              // Jika rujukan panduan buka dari jeda, kembali ke menu jeda
              this.closeInstructionsToPause();
              e.preventDefault();
            } else {
              this.resumeGame();
              e.preventDefault();
            }
          }
        }
      });
    }

    // Henti pemasa & jeda automatik sekiranya pelajar bertukar tab pelayar
    initVisibilityListener() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.engine.state === (GameState ? GameState.PLAYING : 'playing')) {
          this.pauseGame();
        }
      });
    }

    updateMuteIcon() {
      if (!this.hudMuteBtn) return;
      const icon = this.hudMuteBtn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = Audio.muted ? 'volume_off' : 'volume_up';
      }
      this.hudMuteBtn.setAttribute('title', Audio.muted ? 'Buka Bunyi' : 'Senyapkan Bunyi');
    }

    updateHUD() {
      if (this.hudScore) {
        this.hudScore.textContent = `${this.score} pts`;
      }
      if (this.hudBurgers) {
        const collected = this.engine.burgers.filter(b => b.collected).length;
        this.hudBurgers.textContent = `${collected}/${this.engine.burgers.length}`;
      }
    }

    // Papar Modal Soalan apabila burger disentuh
    openQuestionModal(burger, qData) {
      if (!qData) return;

      this.currentActiveQuestion = qData;
      this.currentActiveBurger = burger;
      this.selectedOptionIdx = null;
      this.isAnswerSubmitted = false;

      // Isi kandungan teks modal
      this.modalTitle.textContent = `🍔 Soalan ${qData.id} / 10`;
      this.modalTopic.textContent = qData.topic;
      this.modalLandmark.textContent = `📍 ${qData.landmark}`;
      this.modalQuestionText.textContent = qData.question;

      // Bersihkan & sembunyikan kotak maklum balas
      this.modalFeedback.classList.add('hidden');
      this.modalFeedback.classList.remove('bg-emerald-50', 'border-emerald-200', 'bg-rose-50', 'border-rose-200');

      // Bina pilihan jawapan (A, B, C, D)
      const letters = ['A', 'B', 'C', 'D'];
      this.modalOptions.innerHTML = '';

      qData.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'adv-opt-btn flex items-center p-3.5 sm:p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all duration-150 group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600';
        btn.dataset.index = idx;
        btn.innerHTML = `
          <div class="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-800 font-bold flex items-center justify-center mr-3.5 shrink-0 transition-colors">
            ${letters[idx]}
          </div>
          <span class="text-sm sm:text-base font-semibold text-slate-800 leading-snug flex-grow">${optText}</span>
          <span class="adv-check-icon material-symbols-outlined text-teal-600 opacity-0 group-hover:opacity-40 transition-opacity ml-2 shrink-0">check_circle</span>
        `;
        btn.addEventListener('click', () => {
          if (!this.isAnswerSubmitted) {
            this.selectOption(idx);
          }
        });
        this.modalOptions.appendChild(btn);
      });

      // Tetapkan keadaan butang hantar
      this.modalSubmitBtn.disabled = true;
      this.modalSubmitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-base text-white bg-slate-300 cursor-not-allowed transition-all flex items-center justify-center gap-2';
      this.modalSubmitBtn.innerHTML = `<span>Pilih Jawapan</span><span class="material-symbols-outlined text-lg">check</span>`;

      // Buka modal
      this.modalQuestion.classList.remove('hidden');
      this.modalQuestion.classList.add('flex');
    }

    selectOption(idx) {
      this.selectedOptionIdx = idx;
      const allBtns = this.modalOptions.querySelectorAll('.adv-opt-btn');

      allBtns.forEach((btn, i) => {
        const checkIcon = btn.querySelector('.adv-check-icon');
        if (i === idx) {
          btn.classList.add('border-teal-600', 'bg-teal-50', 'ring-2', 'ring-teal-500/20');
          btn.classList.remove('border-slate-200', 'bg-white');
          if (checkIcon) checkIcon.classList.remove('opacity-0');
        } else {
          btn.classList.remove('border-teal-600', 'bg-teal-50', 'ring-2', 'ring-teal-500/20');
          btn.classList.add('border-slate-200', 'bg-white');
          if (checkIcon) checkIcon.classList.add('opacity-0');
        }
      });

      // Aktifkan butang hantar
      this.modalSubmitBtn.disabled = false;
      this.modalSubmitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-base text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.99] shadow-md shadow-teal-700/20 cursor-pointer transition-all flex items-center justify-center gap-2';
      this.modalSubmitBtn.innerHTML = `<span>Semak Jawapan</span><span class="material-symbols-outlined text-lg">check_circle</span>`;
    }

    handleSubmitAnswer() {
      if (this.isAnswerSubmitted) {
        // Jika sudah semak, butang bertindak sebagai "Teruskan Pengembaraan"
        this.closeQuestionModal();
        return;
      }

      if (this.selectedOptionIdx === null) return;

      this.isAnswerSubmitted = true;
      const q = this.currentActiveQuestion;
      const isCorrect = (this.selectedOptionIdx === q.correct);

      const allBtns = this.modalOptions.querySelectorAll('.adv-opt-btn');
      allBtns.forEach((btn, idx) => {
        btn.classList.remove('hover:border-teal-400', 'hover:bg-teal-50/40', 'cursor-pointer');
        btn.classList.add('cursor-default');

        if (idx === q.correct) {
          // Warnakan jawapan betul hijau
          btn.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-950');
          btn.classList.remove('border-slate-200', 'bg-white', 'border-teal-600');
          const icon = btn.querySelector('.adv-check-icon');
          if (icon) {
            icon.textContent = 'check_circle';
            icon.className = 'material-symbols-outlined text-emerald-600 opacity-100 ml-2 shrink-0';
          }
        } else if (idx === this.selectedOptionIdx) {
          // Jika salah, warnakan pilihan merah
          btn.classList.add('border-rose-400', 'bg-rose-50', 'text-rose-950');
          btn.classList.remove('border-slate-200', 'bg-white', 'border-teal-600');
          const icon = btn.querySelector('.adv-check-icon');
          if (icon) {
            icon.textContent = 'cancel';
            icon.className = 'material-symbols-outlined text-rose-500 opacity-100 ml-2 shrink-0';
          }
        }
      });

      // Kemas kini mata & maklum balas
      if (isCorrect) {
        this.score += 100;
        this.correctCount++;
        Audio.playCorrect();

        this.modalFeedback.classList.remove('hidden');
        this.modalFeedback.classList.add('bg-emerald-50', 'border-emerald-300', 'text-emerald-900');
        this.modalFeedbackText.innerHTML = `
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-emerald-600 text-xl font-bold shrink-0 mt-0.5">verified</span>
            <div>
              <p class="font-headline font-bold text-emerald-800 text-sm">Tahniah! Jawapan Tepat (+100 Mata)</p>
              <p class="font-body text-xs sm:text-sm text-emerald-900/90 mt-1 leading-relaxed">${q.explanation}</p>
            </div>
          </div>
        `;
      } else {
        this.incorrectCount++;
        Audio.playWrong();

        this.modalFeedback.classList.remove('hidden');
        this.modalFeedback.classList.add('bg-amber-50', 'border-amber-300', 'text-amber-950');
        this.modalFeedbackText.innerHTML = `
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-amber-600 text-xl font-bold shrink-0 mt-0.5">lightbulb</span>
            <div>
              <p class="font-headline font-bold text-amber-900 text-sm">Nota Pembelajaran Sains:</p>
              <p class="font-body text-xs sm:text-sm text-amber-950/90 mt-1 leading-relaxed">${q.explanation}</p>
            </div>
          </div>
        `;
      }

      this.updateHUD();

      // Tukar teks butang kepada "Teruskan Pengembaraan"
      this.modalSubmitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-base text-white bg-slate-800 hover:bg-slate-900 active:scale-[0.99] shadow-md cursor-pointer transition-all flex items-center justify-center gap-2';
      this.modalSubmitBtn.innerHTML = `<span>Teruskan Pengembaraan</span><span class="material-symbols-outlined text-lg">arrow_forward</span>`;
    }

    closeQuestionModal() {
      if (this.modalQuestion) {
        this.modalQuestion.classList.add('hidden');
        this.modalQuestion.classList.remove('flex');
      }
      this.engine.setState(GameState ? GameState.PLAYING : 'playing');
    }

    // Pencetus Zon FINISH
    handleFinishZone(isComplete, collectedCount, totalCount) {
      if (!isComplete) {
        // Tunjukkan notis amaran terapung bahawa burger belum cukup
        const remaining = totalCount - collectedCount;
        this.showToastNotice(`🚧 Pintu Gerbang Terkunci! Anda telah mengumpul <strong>${collectedCount}/${totalCount} burger</strong>. Cari lagi baki <strong>${remaining} burger sains</strong> di sekitar kampus untuk menamatkan pengembaraan!`);
      } else {
        // Tunjukkan skrin kemenangan rasmi
        this.showVictoryModal();
      }
    }

    showToastNotice(htmlMessage) {
      if (!this.toastNotice) return;
      this.toastNotice.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-amber-500 text-2xl shrink-0">lock</span>
          <div class="text-xs sm:text-sm text-slate-700 leading-snug">${htmlMessage}</div>
        </div>
      `;
      this.toastNotice.classList.remove('translate-y-24', 'opacity-0');
      this.toastNotice.classList.add('translate-y-0', 'opacity-100');

      setTimeout(() => {
        if (this.toastNotice) {
          this.toastNotice.classList.add('translate-y-24', 'opacity-0');
          this.toastNotice.classList.remove('translate-y-0', 'opacity-100');
        }
      }, 4500);
    }

    showVictoryModal() {
      if (!this.modalVictory) return;
      this.engine.setState(GameState ? GameState.COMPLETED : 'completed');

      const m = Math.floor(this.elapsedSeconds / 60);
      const s = this.elapsedSeconds % 60;
      const formattedTime = `${m}m ${String(s).padStart(2, '0')}s`;

      if (this.victoryScore) this.victoryScore.textContent = `${this.score} pts`;
      if (this.victoryCorrect) this.victoryCorrect.textContent = `${this.correctCount} / 10 Soalan Betul`;
      if (this.victoryTime) this.victoryTime.textContent = formattedTime;

      // Pangkat Saintis
      let badge = "🌟 Saintis Unggul Sel";
      if (this.score >= 900) badge = "🏆 Master Biologi Sel (Cemerlang)";
      else if (this.score >= 700) badge = "🥈 Saintis Harapan Sains";
      else badge = "🥉 Penjelajah Sains Muda";
      if (this.victoryBadge) this.victoryBadge.textContent = badge;

      // Simpan skor ke Supabase & LocalStorage
      this.persistAdventureResult(formattedTime);

      // Buka modal kemenangan
      this.modalVictory.classList.remove('hidden');
      this.modalVictory.classList.add('flex');
    }

    // 6. Penyimpanan Data Kemenangan (Supabase + LocalStorage Fallback)
    persistAdventureResult(timeSpentStr) {
      const user = this.user;
      const submissionId = global.crypto && global.crypto.randomUUID ? global.crypto.randomUUID() : 'adv_' + Date.now();

      const submission = {
        id: submissionId,
        quizId: 'pengembaraan-sains-2d-sel',
        topic: 'Struktur, Fungsi dan Organisasi Sel',
        title: 'Pengembaraan Sains 2D: Sel sebagai Unit Asas Hidupan',
        studentId: user.id || 'std_anon',
        studentName: user.nickname || user.name || 'Pelajar Saintis',
        correct: this.correctCount,
        total: 10,
        score: Math.round((this.correctCount / 10) * 100),
        rawPoints: this.score,
        timeSpent: timeSpentStr,
        completedAt: new Date().toISOString(),
        isDemo: user.isDemo === true
      };

      let localSaved = false;
      let supabaseStatus = 'disimpan setempat';

      // 1. Simpan rekod kemajuan pelajar tempatan
      if (user.id) {
        const key = `arselnel_learning_progress_${user.id}`;
        let record = { quizzes: [], completedLessons: [] };
        try {
          record = JSON.parse(localStorage.getItem(key) || 'null') || record;
          if (!Array.isArray(record.quizzes)) record.quizzes = [];
          record.quizzes.push(submission);
          localStorage.setItem(key, JSON.stringify(record));
          localSaved = true;
        } catch (_) {}
      }

      // 2. Simpan rekod senarai percubaan kuiz
      const submissionsKey = user.isDemo ? 'arselnel_demo_arselnel_quiz_submissions' : 'arselnel_quiz_submissions';
      try {
        const list = JSON.parse(localStorage.getItem(submissionsKey) || '[]');
        list.push(submission);
        localStorage.setItem(submissionsKey, JSON.stringify(list.slice(-500)));
        localSaved = true;
      } catch (_) {}

      // 3. Simpan ke Supabase jika disahkan
      if (user.authProvider === 'supabase' && window.ARSupabase && typeof window.ARSupabase.saveQuizAttempt === 'function') {
        window.ARSupabase.saveQuizAttempt(submission)
          .then(() => {
            if (this.victoryStorageStatus) {
              this.victoryStorageStatus.innerHTML = `<span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold"><span class="material-symbols-outlined text-sm">cloud_done</span> Skor berjaya disegerakkan ke Awan Supabase!</span>`;
            }
          })
          .catch(err => {
            console.warn('Penyegerakan awan gagal, skor kekal disimpan secara setempat.', err);
            if (this.victoryStorageStatus) {
              this.victoryStorageStatus.innerHTML = `<span class="inline-flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold"><span class="material-symbols-outlined text-sm">save</span> Skor disimpan secara setempat dalam peranti.</span>`;
            }
          });
      } else {
        if (this.victoryStorageStatus) {
          this.victoryStorageStatus.innerHTML = `<span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold"><span class="material-symbols-outlined text-sm">check</span> Skor disimpan dalam rekod pelajar peranti ini.</span>`;
        }
      }
    }

    // 7. Kawalan Sentuh Mudah Alih (Mobile On-Screen D-Pad)
    setupTouchControls() {
      const dpadUp = document.getElementById('adv-dpad-up');
      const dpadDown = document.getElementById('adv-dpad-down');
      const dpadLeft = document.getElementById('adv-dpad-left');
      const dpadRight = document.getElementById('adv-dpad-right');

      if (!dpadUp || !dpadDown || !dpadLeft || !dpadRight) return;

      const bindBtn = (el, vx, vy) => {
        const start = (e) => {
          e.preventDefault();
          this.engine.setTouchVector(vx, vy, true);
          el.classList.add('bg-teal-500/30', 'scale-95');
        };
        const end = (e) => {
          e.preventDefault();
          this.engine.setTouchVector(0, 0, false);
          el.classList.remove('bg-teal-500/30', 'scale-95');
        };

        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
      };

      bindBtn(dpadUp, 0, -1);
      bindBtn(dpadDown, 0, 1);
      bindBtn(dpadLeft, -1, 0);
      bindBtn(dpadRight, 1, 0);
    }
  }

  global.ARSelNelAdventure.AdventureUIController = AdventureUIController;

})(window);
