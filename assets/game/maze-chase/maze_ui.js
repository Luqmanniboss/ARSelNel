/**
 * ARSelNel - Maze Chase 2D: Misi Sel Haiwan & Tumbuhan
 * Enhanced UI Controller with Always-Visible Responsive Questions (Task 2)
 * Dynamic Maze Switching (Task 4) & Transition Animations (Task 9)
 */

(function(global) {
  'use strict';

  const { GameState, QUESTIONS, Audio, LAYOUTS_COUNT } = global.ARSelNelMazeData;
  const { getIllustration } = global.ARSelNelCellIllustrations;
  const MazeGameEngine = global.ARSelNelMazeGameEngine;

  class MazeUIController {
    get questions() {
      return (global.ARSelNelMazeData && global.ARSelNelMazeData.QUESTIONS) || QUESTIONS;
    }

    constructor() {
      // Profil Pelajar
      this.playerProfile = this.loadPlayerProfile();

      // Skor & Kemajuan
      this.score = 0;
      this.maxScore = 1000;
      this.lives = 3;
      this.currentQuestionIndex = 0;
      this.correctAnswersCount = 0;
      this.hasCompletedGame = false;
      this.isProcessingZone = false;

      // Pemasa Permainan
      this.elapsedSeconds = 0;
      this.timerInterval = null;
      this.isTimerRunning = false;

      // Penjejakan Snapshot Jawapan Murid (Untuk Semakan Jawapan Saya)
      this.userAnswers = {};

      // Elemen DOM Utama
      this.canvas = document.getElementById('maze-canvas');
      this.hudScore = document.getElementById('maze-hud-score');
      this.hudLives = document.getElementById('maze-hud-lives');
      this.hudQuestion = document.getElementById('maze-hud-question');
      this.hudTimer = document.getElementById('maze-hud-timer');
      this.hudPlayerName = document.getElementById('maze-hud-player-name');

      // Panel Soalan Padat Responsif
      this.questionBadge = document.getElementById('maze-question-badge');
      this.questionMazeTitle = document.getElementById('maze-question-layout-title');
      this.questionText = document.getElementById('maze-question-text');
      this.questionIllustration = document.getElementById('maze-question-illustration');
      this.optionsContainer = document.getElementById('maze-options-container');

      // Modals
      this.welcomeModal = document.getElementById('maze-welcome-modal');
      this.pauseModal = document.getElementById('maze-pause-modal');
      this.feedbackModal = document.getElementById('maze-feedback-modal');
      this.gameOverModal = document.getElementById('maze-gameover-modal');
      this.victoryModal = document.getElementById('maze-victory-modal');
      this.toastNotice = document.getElementById('maze-toast-notice');

      // Modal Pratonton Soalan 15 Saat (Task 4 & 5)
      this.previewModal = document.getElementById('maze-preview-modal');
      this.previewCountdown = document.getElementById('maze-preview-countdown');
      this.previewStartBtn = document.getElementById('maze-preview-start-btn');
      this.previewTimer = null;
      this.previewSecondsLeft = 15;

      // Inisialisasi Enjin Permainan Kanvas
      this.engine = new MazeGameEngine(this.canvas, {
        onZoneEnter: (letter) => this.handleZoneEnter(letter),
        onVirusHit: (enemy) => this.handleVirusHit(enemy),
        onLayoutLoaded: (idx) => this.handleLayoutLoaded(idx),
        onPowerupCollect: (pow) => this.handlePowerupCollect(pow),
        onExtraLife: () => this.handleExtraLife(),
        onShieldAbsorb: (enemy) => this.handleShieldAbsorb(enemy),
        onTeleport: (dir) => this.handleTeleport(dir)
      });

      this.initEvents();
      this.initMobileControls();
      this.updateHUD();

      if (this.hudPlayerName) {
        this.hudPlayerName.textContent = this.playerProfile.name;
      }

      // Muatkan soalan pertama dan susun atur maze 1
      this.loadQuestion(0, false);

      // Tunjukkan skrin alu-aluan pada permulaan
      this.showWelcomeModal();
    }

    // 1. Muatkan Profil Pelajar
    loadPlayerProfile() {
      let student = { name: 'Pelajar Saintis', id: 'student_guest' };
      try {
        const stored = localStorage.getItem('arselnel_current_user') || localStorage.getItem('sb-current-user') || localStorage.getItem('currentUser');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name || parsed.user_metadata?.full_name || parsed.nickname) {
            student.name = parsed.nickname || parsed.name || parsed.user_metadata.full_name;
            student.id = parsed.id || 'student_1';
            student.authProvider = parsed.authProvider;
          }
        }
      } catch (e) {}
      return student;
    }

    // 2. Butang & Peristiwa Permainan
    initEvents() {
      // Butang Mula Permainan (Welcome Screen) -> Membuka fasa membaca soalan 15s (Task 4)
      const startBtn = document.getElementById('maze-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          Audio.init();
          Audio.playCorrect();
          this.hideWelcomeModal();
          this.showQuestionPreview(0);
        });
      }

      // Butang "Mula Sekarang" (Pratonton Soalan - Skip 15s countdown) (Task 4)
      if (this.previewStartBtn) {
        this.previewStartBtn.addEventListener('click', () => {
          Audio.init();
          Audio.playTone(520, 'sine', 0.12, 0.1);
          this.startRoundFromPreview();
        });
      }

      // Butang Jeda (HUD)
      const pauseBtn = document.getElementById('maze-hud-pause-btn');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => this.togglePause());
      }

      // Butang Kawalan Bunyi (HUD)
      const muteBtn = document.getElementById('maze-hud-mute-btn');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          const isMuted = Audio.toggleMute();
          const icon = muteBtn.querySelector('.material-symbols-outlined');
          if (icon) icon.textContent = isMuted ? 'volume_off' : 'volume_up';
          this.showToast(isMuted ? 'Bunyi dimatikan' : 'Bunyi diaktifkan');
        });
      }

      // Butang Bantuan / Cara Bermain
      const helpBtn = document.getElementById('maze-hud-help-btn');
      if (helpBtn) {
        helpBtn.addEventListener('click', () => {
          this.showWelcomeModal();
        });
      }

      // Butang-butang dalam Menu Jeda
      const resumeBtn = document.getElementById('maze-pause-resume-btn');
      if (resumeBtn) resumeBtn.addEventListener('click', () => this.resumeGameplay());

      const restartBtn = document.getElementById('maze-pause-restart-btn');
      if (restartBtn) restartBtn.addEventListener('click', () => {
        if (confirm('Adakah anda pasti mahu memulakan semula permainan Maze Chase?')) {
          this.restartGame();
        }
      });

      // Kekunci pintasan Esc atau P untuk Jeda
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          if (!this.welcomeModal.classList.contains('hidden') ||
              !this.gameOverModal.classList.contains('hidden') ||
              !this.victoryModal.classList.contains('hidden')) {
            return;
          }
          this.togglePause();
        }
      });
    }

    // 3. Kawalan Skrin Sentuh Telefon / Tablet (Virtual D-Pad)
    initMobileControls() {
      const dpadKeys = {
        'maze-dpad-up': 'up',
        'maze-dpad-down': 'down',
        'maze-dpad-left': 'left',
        'maze-dpad-right': 'right'
      };

      Object.keys(dpadKeys).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const dir = dpadKeys[btnId];

        const trigger = (e) => {
          e.preventDefault();
          btn.classList.add('active');
          this.engine.setDirection(dir);
        };

        const release = (e) => {
          if (e && e.preventDefault) e.preventDefault();
          btn.classList.remove('active');
        };

        btn.addEventListener('pointerdown', (e) => {
          try { btn.setPointerCapture(e.pointerId); } catch (_) {}
          trigger(e);
        });
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
        btn.addEventListener('touchstart', trigger, { passive: false });
        btn.addEventListener('touchend', release);
        btn.addEventListener('touchcancel', release);
        btn.addEventListener('mousedown', trigger);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      });

      // Reset to neutral on blur, pause, or orientation change
      window.addEventListener('blur', () => {
        document.querySelectorAll('.maze-dpad-key').forEach(b => b.classList.remove('active'));
      });
      window.addEventListener('orientationchange', () => {
        document.querySelectorAll('.maze-dpad-key').forEach(b => b.classList.remove('active'));
      });
    }

    // 4. Pengurusan Pemasa
    startTimer() {
      if (this.isTimerRunning) return;
      this.isTimerRunning = true;
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds++;
        this.updateTimerDisplay();
      }, 1000);
    }

    stopTimer() {
      this.isTimerRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    updateTimerDisplay() {
      const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const s = String(this.elapsedSeconds % 60).padStart(2, '0');
      if (this.hudTimer) {
        this.hudTimer.textContent = `${m}:${s}`;
      }
    }

    // 5. Muatkan Soalan Semasa & Reka Bentuk Maze Baharu (Task 4 & Task 10)
    loadQuestion(index, animateTransition = true) {
      if (index >= this.questions.length) {
        this.handleGameVictory();
        return;
      }

      this.currentQuestionIndex = index;
      const q = this.questions[index];
      this.engine.activeQuestion = q;
      this.isProcessingZone = false;

      // Jika beralih soalan semasa gameplay, lancarkan animasi peralihan maze baharu
      if (animateTransition && index > 0) {
        const nextMazeMsg = `Bersedia untuk ${q.mazeTitle || 'Maze ' + (index + 1)}!`;
        this.engine.transitionToNextMaze(index, nextMazeMsg, () => {
          this.renderQuestionData(q, index);
          this.showQuestionPreview(index);
        }, index);
      } else {
        this.engine.initLayout(index, index);
        this.renderQuestionData(q, index);
      }
    }

    renderQuestionData(q, index) {
      this.engine.setQuestionData(q);
      this.engine.updateDifficultyForQuestion(index);

      // Kemas kini Lencana Aras
      if (this.questionBadge) {
        const badgeColors = {
          low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          medium: 'bg-amber-100 text-amber-900 border-amber-300',
          high: 'bg-rose-100 text-rose-900 border-rose-300'
        };
        this.questionBadge.className = `px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold uppercase tracking-wider border ${badgeColors[q.difficulty]}`;
        this.questionBadge.textContent = `${q.difficultyLabel} • +${q.points} pts`;
      }

      // Tajuk Maze Semasa
      if (this.questionMazeTitle) {
        this.questionMazeTitle.textContent = q.mazeTitle || `Maze ${index + 1}/10`;
      }

      // Teks Soalan
      if (this.questionText) {
        this.questionText.textContent = q.question;
      }

      // Rajah Mini Ilustrasi Sel
      if (this.questionIllustration) {
        this.questionIllustration.innerHTML = getIllustration(q.illustration, 40, 40);
      }

      this.updateHUD();
    }

    // Fasa Membaca Soalan 15 Saat Sebelum Pusingan (Task 4 & 5)
    showQuestionPreview(qIndex) {
      this.clearPreviewTimer();
      const q = this.questions[qIndex];
      if (!q) return;

      this.gameState = GameState.QUESTION_PREVIEW;
      this.engine.state = GameState.QUESTION_PREVIEW;
      this.engine.pause(); // Bekukan pergerakan avatar & virus (Task 4)
      this.stopTimer();    // Hentikan pemasa gameplay (Task 4)

      // Kemas kini elemen modal pratonton
      const qNumEl = document.getElementById('maze-preview-qnum');
      const diffEl = document.getElementById('maze-preview-diff');
      const qTextEl = document.getElementById('maze-preview-question-text');
      const illusEl = document.getElementById('maze-preview-illustration');

      if (qNumEl) qNumEl.textContent = `Soalan ${qIndex + 1}/${this.questions.length}`;
      if (diffEl) {
        diffEl.textContent = q.difficultyLabel;
        diffEl.className = `px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
          q.difficulty === 'high' ? 'bg-rose-100 text-rose-800 border-rose-300' :
          q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
          'bg-emerald-100 text-emerald-800 border-emerald-300'
        } border`;
      }
      if (qTextEl) qTextEl.textContent = q.question;
      if (illusEl) illusEl.innerHTML = getIllustration(q.illustration, 44, 44);

      const optLetters = ['A', 'B', 'C', 'D'];
      optLetters.forEach((letter, idx) => {
        const textEl = document.getElementById(`maze-preview-text-${letter}`);
        if (textEl && q.options[idx]) {
          textEl.textContent = q.options[idx];
        }
      });

      this.previewSecondsLeft = 15;
      if (this.previewCountdown) this.previewCountdown.textContent = '15';

      if (this.previewModal) {
        this.previewModal.classList.remove('hidden');
        this.previewModal.classList.add('flex');
      }

      // Unduran 15 saat automatik
      this.previewTimer = setInterval(() => {
        this.previewSecondsLeft--;
        if (this.previewCountdown) {
          this.previewCountdown.textContent = Math.max(0, this.previewSecondsLeft);
        }
        if (this.previewSecondsLeft <= 0) {
          this.startRoundFromPreview();
        }
      }, 1000);
    }

    clearPreviewTimer() {
      if (this.previewTimer) {
        clearInterval(this.previewTimer);
        this.previewTimer = null;
      }
    }

    startRoundFromPreview() {
      this.clearPreviewTimer();
      if (this.previewModal) {
        this.previewModal.classList.add('hidden');
        this.previewModal.classList.remove('flex');
      }

      this.gameState = GameState.PLAYING;
      this.engine.state = GameState.PLAYING;

      // Task 9: Perlindungan spawn 2 saat selepas Mula Sekarang
      this.engine.player.invulnerableTimer = 2.0;

      // Aktifkan enjin, pergerakan musuh & pemasa
      this.engine.start();
      this.engine.resume();
      this.startTimer();
    }

    handleLayoutLoaded(layoutIndex) {
      // Pembantu apabila maze selesai dijana semula
      this.updateHUD();
    }

    // 6. Kemas Kini HUD Pemarkahan & Nyawa
    // 6. Kemas Kini HUD Pemarkahan, Nyawa (Maks 5) & Power-Up Aktif (Task 12)
    updateHUD() {
      if (this.hudScore) {
        this.hudScore.textContent = `${this.score} pts`;
      }

      if (this.hudQuestion) {
        const isMobile = window.innerWidth <= 640;
        this.hudQuestion.textContent = isMobile 
          ? `S${this.currentQuestionIndex + 1}/${this.questions.length}` 
          : `Soalan ${this.currentQuestionIndex + 1}/${this.questions.length}`;
      }

      if (this.hudLives) {
        const isMobile = window.innerWidth <= 640;
        if (isMobile) {
          this.hudLives.textContent = `❤️ ${this.lives}/5`;
        } else {
          let hearts = '';
          for (let i = 0; i < 5; i++) {
            if (i < this.lives) {
              hearts += '❤️';
            } else if (i < 3) {
              hearts += '🖤';
            }
          }
          this.hudLives.textContent = `${this.lives}/5 ${hearts}`;
        }
      }

      // Lencana Power-Up Aktif dalam HUD
      const pContainer = document.getElementById('maze-hud-powerups');
      if (pContainer && this.engine && this.engine.activePowerups) {
        const pList = [];
        if (this.engine.activePowerups.speedTimer > 0) {
          pList.push(`<span class="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold">⚡ ${Math.ceil(this.engine.activePowerups.speedTimer)}s</span>`);
        }
        if (this.engine.activePowerups.virusFreezeTimer > 0) {
          pList.push(`<span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">❄️ ${Math.ceil(this.engine.activePowerups.virusFreezeTimer)}s</span>`);
        }
        if (this.engine.activePowerups.hasShield) {
          pList.push(`<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">🛡️ Aktif</span>`);
        }
        if (this.engine.activePowerups.radarTimer > 0) {
          pList.push(`<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">📡 ${Math.ceil(this.engine.activePowerups.radarTimer)}s</span>`);
        }

        if (pList.length > 0) {
          pContainer.innerHTML = pList.join('');
          pContainer.className = 'flex items-center gap-1';
        } else {
          pContainer.innerHTML = '';
          pContainer.className = 'hidden';
        }
      }
    }

    // 7. Pengendalian Masuk Zon Jawapan (A, B, C, D) & Sistem Penyingkiran Jawapan Salah (Task 6)
    handleZoneEnter(zoneLetter) {
      if (this.isProcessingZone || this.engine.transitioning) return;
      // Jangan cetuskan lagi jika zon telah disingkirkan! (Task 6)
      if (this.engine.eliminatedZones.has(zoneLetter)) return;
      this.isProcessingZone = true;

      const letterMap = { A: 0, B: 1, C: 2, D: 3 };
      const selectedIndex = letterMap[zoneLetter];
      const q = this.questions[this.currentQuestionIndex];
      const isCorrect = (selectedIndex === q.correct);

      this.engine.pause();

      // Rekod snapshot pilihan jawapan murid
      const choiceOptions = q.options || [];
      const correctIndex = Number(q.correct) || 0;
      this.userAnswers[this.currentQuestionIndex] = {
        questionIndex: this.currentQuestionIndex + 1,
        questionId: q.id || `q_${this.currentQuestionIndex + 1}`,
        questionText: q.prompt || q.question || 'Soalan Maze 2D',
        options: choiceOptions,
        selectedChoice: zoneLetter,
        selectedText: choiceOptions[selectedIndex] || `Zon ${zoneLetter}`,
        correctChoice: ['A', 'B', 'C', 'D'][correctIndex] || 'A',
        correctText: choiceOptions[correctIndex] || '',
        isCorrect: isCorrect,
        pointsEarned: isCorrect ? (q.points || 100) : 0,
        explanation: q.explanation || 'Organel sel menjalankan fungsi khusus untuk kehidupan sel.'
      };

      if (isCorrect) {
        Audio.playCorrect();
        this.score += q.points;
        this.correctAnswersCount++;

        this.engine.createSparkles(this.engine.player.x, this.engine.player.y, '#38bdf8', 24);

        this.updateHUD();
        this.showAnswerFeedback(true, q, zoneLetter);
      } else {
        // Sistem Penyingkiran Jawapan Salah (Task 6)
        if (Audio.playElimination) {
          Audio.playElimination();
        } else {
          Audio.playIncorrect();
        }

        this.lives--;
        this.engine.eliminatedZones.add(zoneLetter);
        this.updateHUD();

        this.engine.createGlitchParticles(this.engine.player.x, this.engine.player.y, '#f43f5e', 24);

        if (this.lives <= 0) {
          Audio.playGameOver();
          setTimeout(() => this.showGameOverModal(), 600);
        } else {
          this.showAnswerFeedback(false, q, zoneLetter);
        }
      }
    }

    // 8. Pengendalian Sentuhan Virus
    handleVirusHit(enemy) {
      Audio.playVirusHit();
      this.lives--;
      this.updateHUD();

      this.showToast(`⚠️ Aduh! ${enemy.name} menyentuh anda! Baki nyawa: ${this.lives}/5`);

      if (this.lives <= 0) {
        this.engine.pause();
        Audio.playGameOver();
        setTimeout(() => this.showGameOverModal(), 800);
      } else {
        this.engine.resetPlayerToSpawn();
      }
    }

    // 8b. Pengendalian Power-Up & Teleportasi (Task 3, 4 & 5)
    handlePowerupCollect(pow) {
      if (pow.type === 'speed') {
        this.showToast('⚡ Pecutan Saintis aktif (+50% kelajuan selama 3s)!');
      } else if (pow.type === 'freeze') {
        this.showToast('❄️ Pembeku Virus aktif! Semua virus dibekukan 3s!');
      } else if (pow.type === 'shield') {
        this.showToast('🛡️ Perisai Sel aktif! Menahan 1 pelanggaran virus!');
      } else if (pow.type === 'radar') {
        this.showToast('📡 Radar Saintis aktif! Mendedahkan lokasi virus 5s!');
      }
      this.updateHUD();
    }

    handleExtraLife() {
      if (this.lives < 5) {
        this.lives = Math.min(5, this.lives + 1);
        this.showToast(`❤️ Nyawa Tambahan diperoleh! (${this.lives}/5)`);
      } else {
        this.showToast('❤️ Nyawa anda sudah maksimum (5/5)!');
      }
      this.updateHUD();
    }

    handleShieldAbsorb(enemy) {
      this.showToast(`🛡️ Perisai Sel menyerap serangan ${enemy.name}! Tiada nyawa ditolak!`);
      this.updateHUD();
    }

    handleTeleport(dir) {
      this.showToast(`🌀 Teleportasi (${dir}) berjaya!`);
    }

    // 9. Paparan Maklum Balas Jawapan Semerta & Penyingkiran (Task 6)
    showAnswerFeedback(isCorrect, question, chosenLetter) {
      if (!this.feedbackModal) return;

      const titleEl = document.getElementById('maze-feedback-title');
      const iconEl = document.getElementById('maze-feedback-icon');
      const statusEl = document.getElementById('maze-feedback-status');
      const descEl = document.getElementById('maze-feedback-desc');
      const nextBtn = document.getElementById('maze-feedback-next-btn');
      const illustEl = document.getElementById('maze-feedback-illustration');

      if (isCorrect) {
        iconEl.innerHTML = '🌟';
        iconEl.className = 'w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 text-3xl mx-auto flex items-center justify-center mb-3 shadow-inner';
        titleEl.textContent = 'Tahniah! Jawapan Tepat!';
        titleEl.className = 'font-headline text-2xl font-extrabold text-emerald-800 tracking-tight';
        statusEl.innerHTML = `<span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide">Zon ${chosenLetter} Betul • +${question.points} pts</span>`;
        descEl.innerHTML = `<strong>Keterangan Saintifik:</strong><br>${question.explanation}`;
        nextBtn.innerHTML = `<span>Bersedia untuk Maze Seterusnya</span><span class="material-symbols-outlined text-base">arrow_forward</span>`;
        nextBtn.className = 'w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2';

        nextBtn.onclick = () => {
          this.feedbackModal.classList.add('hidden');
          this.feedbackModal.classList.remove('flex');
          // Muatkan soalan seterusnya dan jana Maze baharu (Task 4)
          this.loadQuestion(this.currentQuestionIndex + 1, true);
        };
      } else {
        // Teks dan maklum balas tepat mengikut Task 6:
        // "Jawapan kurang tepat! Pilihan ini telah disingkirkan."
        iconEl.innerHTML = '❌';
        iconEl.className = 'w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 text-3xl mx-auto flex items-center justify-center mb-3 shadow-inner';
        titleEl.textContent = 'Jawapan kurang tepat! Pilihan ini telah disingkirkan.';
        titleEl.className = 'font-headline text-xl sm:text-2xl font-extrabold text-rose-800 tracking-tight';
        statusEl.innerHTML = `<span class="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs uppercase tracking-wide">Zon ${chosenLetter} Disingkirkan • Baki Nyawa: ${this.lives}/5</span>`;
        descEl.innerHTML = `Pilihan <strong>Zon ${chosenLetter}</strong> telah disingkirkan daripada maze. Anda mempunyai baki pilihan untuk diterokai!<br><br><strong>Petunjuk Sains:</strong><br>${question.explanation}`;
        nextBtn.innerHTML = `<span>Teruskan Cabaran</span><span class="material-symbols-outlined text-base">arrow_forward</span>`;
        nextBtn.className = 'w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2';

        nextBtn.onclick = () => {
          this.feedbackModal.classList.add('hidden');
          this.feedbackModal.classList.remove('flex');
          this.engine.resetPlayerToSpawn();
          this.engine.player.invulnerableTimer = 2.0; // Perlindungan spawn 2 saat
          this.isProcessingZone = false;
          this.engine.resume();
        };
      }

      if (illustEl) {
        illustEl.innerHTML = getIllustration(question.illustration, 110, 110);
      }

      this.feedbackModal.classList.remove('hidden');
      this.feedbackModal.classList.add('flex');
    }

    // 10. Kemenangan Penuh Permainan (10 Soalan Tamat)
    handleGameVictory() {
      this.stopTimer();
      this.engine.stop();
      this.hasCompletedGame = true;

      // Bonus Penamat 50 mata jika menyempurnakan kesemua 10 soalan
      this.score += 50;
      this.updateHUD();
      Audio.playVictory();

      if (!this.victoryModal) return;

      const scoreEl = document.getElementById('maze-victory-score');
      const correctEl = document.getElementById('maze-victory-correct');
      const timeEl = document.getElementById('maze-victory-time');
      const livesEl = document.getElementById('maze-victory-lives');
      const breakdownEl = document.getElementById('maze-victory-breakdown');

      if (scoreEl) scoreEl.textContent = `${this.score} pts`;
      if (correctEl) correctEl.textContent = `${this.correctAnswersCount} / ${this.questions.length}`;

      const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const s = String(this.elapsedSeconds % 60).padStart(2, '0');
      if (timeEl) timeEl.textContent = `${m}m ${s}s`;

      if (livesEl) {
        let h = '';
        for (let i = 0; i < 3; i++) h += (i < this.lives ? '❤️' : '🖤');
        livesEl.textContent = h;
      }

      if (breakdownEl) {
        breakdownEl.innerHTML = `
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            Aras Rendah: 4/4 Selesai (+200 pts)
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            Aras Sederhana: 3/3 Selesai (+300 pts)
          </div>
          <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900">
            KBAT: 3/3 Selesai (+450 pts)
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900">
            Bonus Penamat: +50 pts (Jumlah 1000 pts)
          </div>
        `;
      }

      this.saveQuizProgress();

      this.victoryModal.classList.remove('hidden');
      this.victoryModal.classList.add('flex');
    }

    // 11. Simpan Rekod Skor ke Supabase & LocalStorage
    saveQuizProgress() {
      const user = this.playerProfile;
      const statusEl = document.getElementById('maze-save-status-msg');

      // Jana snapshot lengkap bagi semua soalan
      const answersList = [];
      for (let i = 0; i < this.questions.length; i++) {
        if (this.userAnswers[i]) {
          answersList.push(this.userAnswers[i]);
        } else {
          const q = this.questions[i];
          const choiceOptions = q.options || [];
          const correctIdx = Number(q.correct) || 0;
          answersList.push({
            questionIndex: i + 1,
            questionId: q.id || `q_${i + 1}`,
            questionText: q.prompt || q.question || 'Soalan Maze 2D',
            options: choiceOptions,
            selectedChoice: '—',
            selectedText: 'Belum Dijawab',
            correctChoice: ['A', 'B', 'C', 'D'][correctIdx] || 'A',
            correctText: choiceOptions[correctIdx] || '',
            isCorrect: false,
            pointsEarned: 0,
            explanation: q.explanation || 'Organel sel menjalankan fungsi khusus untuk kehidupan sel.'
          });
        }
      }

      const submissionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : 'maze_' + Date.now();

      const submission = {
        id: submissionId,
        quizId: 'maze_2d',
        gameId: 'maze_2d',
        topic: 'Sel sebagai Unit Asas Hidupan (Sel Haiwan & Tumbuhan)',
        title: 'Maze Chase 2D: Misi Sel Haiwan & Tumbuhan',
        studentId: user.id || 'std_anon',
        studentName: user.name || 'Pelajar',
        correct: this.correctAnswersCount,
        total: this.questions.length,
        score: this.score, // Nilai markah sebenar (sehingga 1000 mata!)
        rawPoints: this.score,
        durationSeconds: this.elapsedSeconds,
        answers: answersList,
        completedAt: new Date().toISOString()
      };

      // Simpan percubaan terkini secara tempatan untuk paparan segera di halaman keputusan
      try {
        localStorage.setItem('arselnel_latest_attempt', JSON.stringify(submission));
      } catch (_) {}

      // Kemas kini link Papan Skor dalam modal tamat permainan supaya membawa ID percubaan
      const victoryLeaderboardBtn = document.querySelector('#maze-victory-modal a[href*="keputusan_permainan"]');
      if (victoryLeaderboardBtn) {
        victoryLeaderboardBtn.href = `../keputusan_permainan/code.html?attempt_id=${submissionId}&game=maze_2d`;
      }

      try {
        const key = `arselnel_learning_progress_${user.id}`;
        let rec = JSON.parse(localStorage.getItem(key) || 'null') || { quizzes: [] };
        if (!rec.quizzes) rec.quizzes = [];
        rec.quizzes.push(submission);
        localStorage.setItem(key, JSON.stringify(rec));

        const subKey = 'arselnel_quiz_submissions';
        let subs = JSON.parse(localStorage.getItem(subKey) || '[]');
        subs.push(submission);
        localStorage.setItem(subKey, JSON.stringify(subs.slice(-500)));

        if (window.ARSupabase && typeof window.ARSupabase.saveQuizAttempt === 'function') {
          window.ARSupabase.saveQuizAttempt(submission)
            .then(() => {
              if (statusEl) statusEl.textContent = `✓ Markah ${this.score} mata berjaya disegerakkan ke Supabase!`;
            })
            .catch(() => {
              if (statusEl) statusEl.textContent = `✓ Markah ${this.score} mata disimpan secara setempat pada peranti.`;
            });
        } else {
          if (statusEl) statusEl.textContent = `✓ Markah ${this.score} mata disimpan ke rekod pembelajaran anda.`;
        }
      } catch (e) {
        if (statusEl) statusEl.textContent = '✓ Skor disimpan.';
      }
    }

    // 12. Modal Pengurusan Keadaan
    showWelcomeModal() {
      this.stopTimer();
      this.engine.pause();
      if (this.welcomeModal) {
        this.welcomeModal.classList.remove('hidden');
        this.welcomeModal.classList.add('flex');
      }
    }

    hideWelcomeModal() {
      if (this.welcomeModal) {
        this.welcomeModal.classList.add('hidden');
        this.welcomeModal.classList.remove('flex');
      }
    }

    startGameplay() {
      this.showQuestionPreview(this.currentQuestionIndex || 0);
    }

    togglePause() {
      if (this.pauseModal.classList.contains('hidden')) {
        this.stopTimer();
        this.engine.pause();

        // Bekukan pemasa pratonton jika dijeda semasa membaca soalan
        if (this.previewTimer) {
          clearInterval(this.previewTimer);
          this.previewTimer = null;
        }

        this.pauseModal.classList.remove('hidden');
        this.pauseModal.classList.add('flex');
      } else {
        this.resumeGameplay();
      }
    }

    resumeGameplay() {
      if (this.pauseModal) {
        this.pauseModal.classList.add('hidden');
        this.pauseModal.classList.remove('flex');
      }

      // Jika dijeda semasa fasa pratonton soalan, sambung pemasa pratonton
      if (this.gameState === GameState.QUESTION_PREVIEW && this.previewModal && !this.previewModal.classList.contains('hidden')) {
        this.clearPreviewTimer();
        this.previewTimer = setInterval(() => {
          this.previewSecondsLeft--;
          if (this.previewCountdown) {
            this.previewCountdown.textContent = Math.max(0, this.previewSecondsLeft);
          }
          if (this.previewSecondsLeft <= 0) {
            this.startRoundFromPreview();
          }
        }, 1000);
      } else {
        this.startTimer();
        this.engine.resume();
      }
    }

    restartGame() {
      this.clearPreviewTimer();
      this.stopTimer();
      this.score = 0;
      this.lives = 3;
      this.currentQuestionIndex = 0;
      this.correctAnswersCount = 0;
      this.elapsedSeconds = 0;
      this.updateTimerDisplay();
      this.updateHUD();

      if (this.pauseModal) {
        this.pauseModal.classList.add('hidden');
        this.pauseModal.classList.remove('flex');
      }
      if (this.gameOverModal) {
        this.gameOverModal.classList.add('hidden');
        this.gameOverModal.classList.remove('flex');
      }
      if (this.victoryModal) {
        this.victoryModal.classList.add('hidden');
        this.victoryModal.classList.remove('flex');
      }
      if (this.feedbackModal) {
        this.feedbackModal.classList.add('hidden');
        this.feedbackModal.classList.remove('flex');
      }
      if (this.previewModal) {
        this.previewModal.classList.add('hidden');
        this.previewModal.classList.remove('flex');
      }

      this.loadQuestion(0, false);
      this.showQuestionPreview(0);
    }

    showGameOverModal() {
      this.stopTimer();
      this.engine.stop();
      if (!this.gameOverModal) return;

      const scoreEl = document.getElementById('maze-gameover-score');
      const correctEl = document.getElementById('maze-gameover-correct');
      const progressEl = document.getElementById('maze-gameover-progress');

      if (scoreEl) scoreEl.textContent = `${this.score} pts`;
      if (correctEl) correctEl.textContent = `${this.correctAnswersCount} / ${this.questions.length}`;
      if (progressEl) progressEl.textContent = `Soalan ${this.currentQuestionIndex + 1} daripada ${this.questions.length}`;

      this.gameOverModal.classList.remove('hidden');
      this.gameOverModal.classList.add('flex');
    }

    showToast(message) {
      if (!this.toastNotice) return;
      this.toastNotice.textContent = message;
      this.toastNotice.className = 'fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/95 text-white font-headline text-xs font-bold border border-cyan-500/40 shadow-xl z-50 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-none';

      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastNotice.className = 'fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/95 text-white font-headline text-xs font-bold border border-cyan-500/40 shadow-xl z-50 transition-all duration-300 transform -translate-y-8 opacity-0 pointer-events-none';
      }, 2600);
    }
  }

  // Eksport pengawal UI
  global.ARSelNelMazeUI = MazeUIController;

  // Auto-mulakan apabila DOM siap dengan sokongan CMS soalan
  document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('maze-canvas')) {
      if (global.CMSAdapter) {
        try {
          const cmsQ = await global.CMSAdapter.getGameQuestions('maze_chase', { status: 'published' });
          if (cmsQ && Array.isArray(cmsQ) && cmsQ.length > 0) {
            global.ARSelNelMazeData.QUESTIONS = cmsQ.map((q, idx) => ({
              id: q.id || idx + 1,
              question: q.question,
              options: q.options || {},
              correct: typeof q.correct === 'number' ? q.correct : ({ A: 0, B: 1, C: 2, D: 3 }[q.correct] ?? 0),
              explanation: q.explanation || '',
              difficulty: q.difficulty || 'easy',
              difficultyLabel: q.difficultyLabel || (q.difficulty === 'hard' ? 'Tinggi' : q.difficulty === 'medium' ? 'Sederhana' : 'Rendah'),
              points: q.points || 100,
              illustration: q.illustration || 'cell_general',
              mazeTitle: q.mazeTitle || `Maze ${idx + 1}/${cmsQ.length}`
            }));
          }
        } catch (e) {
          console.warn('Maze CMS questions fallback to default:', e);
        }
      }
      window.MazeGameInstance = new MazeUIController();
    }
  });

})(window);
