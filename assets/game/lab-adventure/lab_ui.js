/**
 * ARSelNel - Misi Makmal Sains: Operasi Kemas Makmal
 * UI Controller, Modals, Scoring, HUD & Persistence
 */

(function(global) {
  'use strict';

  const {
    GameState,
    QUESTIONS,
    EQUIPMENT,
    STORAGE_STATION,
    EXIT_DOOR,
    Audio,
    LabAdventureGameEngine
  } = global.ARSelNelLabAdventure;

  class LabAdventureUIController {
    get questions() {
      return (global.ARSelNelLabAdventure && global.ARSelNelLabAdventure.QUESTIONS) || QUESTIONS;
    }

    constructor() {
      // Data pemain
      this.playerProfile = this.loadPlayerProfile();

      // Skor & kemajuan
      this.score = 0;
      this.collectedCount = 0;
      this.answeredCount = 0;
      this.correctAnswersCount = 0;
      this.inventory = {}; // { 'bikar': true, ... }
      this.storageBonusAwarded = false;
      this.hasCompletedMission = false;

      // Pemasa
      this.elapsedSeconds = 0;
      this.timerInterval = null;

      // Soalan aktif
      this.currentQuestion = null;
      this.selectedOptionIndex = null;
      this.currentItem = null;

      // Elemen DOM
      this.canvas = document.getElementById('lab-canvas');
      this.hudScore = document.getElementById('lab-hud-score');
      this.hudEquipment = document.getElementById('lab-hud-equipment');
      this.hudTimer = document.getElementById('lab-hud-timer');
      this.hudPlayerName = document.getElementById('lab-hud-player-name');
      this.toastNotice = document.getElementById('lab-toast-notice');

      // Butang HUD
      this.pauseBtn = document.getElementById('lab-hud-pause-btn');
      this.muteBtn = document.getElementById('lab-hud-mute-btn');
      this.helpBtn = document.getElementById('lab-hud-help-btn');
      this.inventoryBtn = document.getElementById('lab-hud-inventory-btn');
      this.exitBtn = document.getElementById('lab-hud-exit-btn');

      // Modals
      this.introModal = document.getElementById('lab-intro-modal');
      this.questionModal = document.getElementById('lab-question-modal');
      this.pauseModal = document.getElementById('lab-pause-modal');
      this.inventoryModal = document.getElementById('lab-inventory-modal');
      this.confirmModal = document.getElementById('lab-confirm-modal');
      this.victoryModal = document.getElementById('lab-victory-modal');

      // Inisialisasi Enjin Permainan
      this.engine = new LabAdventureGameEngine(this.canvas, {
        playerName: this.playerProfile.name,
        onEquipmentTrigger: (item) => this.handleEquipmentTrigger(item),
        onStorageStationTrigger: () => this.handleStorageStationTrigger(),
        onExitDoorTrigger: (isUnlocked) => this.handleExitDoorTrigger(isUnlocked)
      });

      this.initEvents();
      this.updateHUD();

      // Paparkan nama pelajar di HUD
      if (this.hudPlayerName) {
        this.hudPlayerName.textContent = this.playerProfile.name;
      }

      // Mulakan dalam keadaan sedia (Skrin Pengenalan dibuka secara lalai)
      this.showIntroModal();
    }

    // 1. Dapatkan Profil Pelajar (Auth Guard / LocalStorage)
    loadPlayerProfile() {
      let student = { name: 'Pelajar Saintis', id: 'student_guest' };
      try {
        const stored = localStorage.getItem('arselnel_current_user') || localStorage.getItem('sb-current-user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name || parsed.user_metadata?.full_name) {
            student.name = parsed.name || parsed.user_metadata.full_name;
            student.id = parsed.id || 'student_1';
          }
        }
      } catch (e) {
        // Abaikan ralat parsing
      }
      return student;
    }

    // 2. Format Masa MM:SS
    formatTime(sec) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (!this.engine.isPaused && this.engine.state === GameState.PLAYING) {
          this.elapsedSeconds++;
          if (this.hudTimer) {
            this.hudTimer.textContent = this.formatTime(this.elapsedSeconds);
          }
        }
      }, 1000);
    }

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    // 3. Kemas Kini Paparan HUD
    updateHUD() {
      if (this.hudScore) {
        this.hudScore.textContent = `${this.score} pts`;
      }
      if (this.hudEquipment) {
        this.hudEquipment.textContent = `${this.collectedCount}/10`;
      }
      if (this.hudTimer) {
        this.hudTimer.textContent = this.formatTime(this.elapsedSeconds);
      }
    }

    // 4. Paparan Notifikasi Ringkas (Floating Toast)
    showToast(message, type = 'info', duration = 3500) {
      if (!this.toastNotice) return;
      
      const iconMap = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        lock: 'lock'
      };

      const colorMap = {
        info: 'bg-teal-50 border-teal-300 text-teal-900',
        success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        warning: 'bg-amber-50 border-amber-300 text-amber-900',
        lock: 'bg-rose-50 border-rose-300 text-rose-900'
      };

      this.toastNotice.className = `absolute bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-xl border flex items-center gap-3 z-40 max-w-md w-[92%] transition-all duration-300 transform translate-y-0 opacity-100 ${colorMap[type] || colorMap.info}`;
      this.toastNotice.innerHTML = `
        <span class="material-symbols-outlined text-2xl shrink-0">${iconMap[type] || 'info'}</span>
        <span class="font-headline text-xs sm:text-sm font-bold leading-tight">${message}</span>
      `;

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastNotice.className = 'absolute bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-xl border flex items-center gap-3 z-40 max-w-md w-[92%] transition-all duration-300 transform translate-y-24 opacity-0 pointer-events-none';
      }, duration);
    }

    // 5. Pengendalian Pengenalan & Mula Permainan
    showIntroModal() {
      this.engine.pause();
      if (this.introModal) this.introModal.classList.remove('hidden');
    }

    startGame() {
      if (this.introModal) this.introModal.classList.add('hidden');
      this.engine.start();
      this.startTimer();
      this.showToast('Misi bermula! Cari 10 peralatan makmal yang berselerak.', 'info');
    }

    // 6. Pengendalian Sentuhan Peralatan & Soalan Sains
    handleEquipmentTrigger(item) {
      this.engine.pause();
      this.currentItem = item;

      // Cari soalan berpadanan
      const q = this.questions.find(qItem => qItem.id === item.questionId);
      if (!q) {
        this.engine.resume();
        return;
      }

      this.currentQuestion = q;
      this.selectedOptionIndex = null;
      this.renderQuestionModal(q, item);
    }

    renderQuestionModal(q, item) {
      if (!this.questionModal) return;

      const titleEl = document.getElementById('lab-modal-title');
      const diffBadgeEl = document.getElementById('lab-modal-difficulty');
      const itemEl = document.getElementById('lab-modal-item-info');
      const qTextEl = document.getElementById('lab-modal-question-text');
      const optionsContainer = document.getElementById('lab-modal-options');
      const feedbackContainer = document.getElementById('lab-modal-feedback');
      const submitBtn = document.getElementById('lab-modal-submit-btn');

      // Set tajuk & nombor soalan
      if (titleEl) {
        titleEl.textContent = `SOALAN ${q.id} / 10`;
      }

      // Lencana Aras Kognitif (Rendah: Hijau, Sederhana: Jingga, KBAT: Ungu)
      if (diffBadgeEl) {
        diffBadgeEl.className = 'px-3 py-1 rounded-full text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm';
        if (q.difficulty === 'low') {
          diffBadgeEl.classList.add('bg-emerald-100', 'text-emerald-900', 'border', 'border-emerald-300');
          diffBadgeEl.innerHTML = `<span class="material-symbols-outlined text-sm text-emerald-600">psychology</span> ${q.difficultyLabel} (+${q.points} pts)`;
        } else if (q.difficulty === 'medium') {
          diffBadgeEl.classList.add('bg-amber-100', 'text-amber-900', 'border', 'border-amber-300');
          diffBadgeEl.innerHTML = `<span class="material-symbols-outlined text-sm text-amber-600">analytics</span> ${q.difficultyLabel} (+${q.points} pts)`;
        } else {
          diffBadgeEl.classList.add('bg-purple-100', 'text-purple-900', 'border', 'border-purple-300');
          diffBadgeEl.innerHTML = `<span class="material-symbols-outlined text-sm text-purple-600">neurology</span> ${q.difficultyLabel} (+${q.points} pts)`;
        }
      }

      // Info Peralatan yang dijumpai
      if (itemEl) {
        itemEl.innerHTML = `
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
            <span class="text-base">${item.icon}</span>
            <span>Dijumpai: ${item.name}</span>
            <span class="text-teal-600 font-medium">(${item.zone})</span>
          </div>
        `;
      }

      // Teks Soalan Sains
      if (qTextEl) {
        qTextEl.textContent = q.question;
      }

      // Pilihan Jawapan A, B, C, D
      if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const optionLetters = ['A', 'B', 'C', 'D'];

        q.options.forEach((optText, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'lab-option-btn w-full p-3.5 rounded-xl border-2 border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 text-left font-headline text-sm font-semibold text-slate-800 transition-all flex items-center gap-3';
          btn.dataset.index = idx;
          btn.innerHTML = `
            <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 lab-option-letter">
              ${optionLetters[idx]}
            </span>
            <span class="flex-1 leading-snug">${optText}</span>
          `;

          btn.addEventListener('click', () => {
            // Elak klik semula jika sudah disemak
            if (submitBtn.dataset.state === 'next') return;

            // Reset semua pilihan lain
            optionsContainer.querySelectorAll('.lab-option-btn').forEach(b => {
              b.classList.remove('border-teal-600', 'bg-teal-50', 'text-teal-900', 'shadow-sm');
              b.classList.add('border-slate-200', 'bg-white', 'text-slate-800');
              const letter = b.querySelector('.lab-option-letter');
              if (letter) {
                letter.className = 'w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 lab-option-letter';
              }
            });

            // Aktifkan pilihan semasa
            btn.classList.add('border-teal-600', 'bg-teal-50', 'text-teal-900', 'shadow-sm');
            btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-800');
            const letter = btn.querySelector('.lab-option-letter');
            if (letter) {
              letter.className = 'w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 lab-option-letter';
            }

            this.selectedOptionIndex = idx;

            // Aktifkan butang semak
            submitBtn.disabled = false;
            submitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-sm text-white bg-teal-700 hover:bg-teal-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer';
            submitBtn.innerHTML = `<span>Semak Jawapan</span><span class="material-symbols-outlined text-base">check</span>`;
          });

          optionsContainer.appendChild(btn);
        });
      }

      // Reset Maklum Balas & Butang
      if (feedbackContainer) {
        feedbackContainer.classList.add('hidden');
        feedbackContainer.innerHTML = '';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.state = 'check';
        submitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-sm text-slate-400 bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-not-allowed';
        submitBtn.innerHTML = `<span>Pilih Jawapan</span><span class="material-symbols-outlined text-base">check</span>`;
      }

      this.questionModal.classList.remove('hidden');
    }

    // 7. Pengendalian Semakan Jawapan
    handleCheckAnswer() {
      const submitBtn = document.getElementById('lab-modal-submit-btn');
      const feedbackContainer = document.getElementById('lab-modal-feedback');
      const optionsContainer = document.getElementById('lab-modal-options');

      if (!this.currentQuestion || this.selectedOptionIndex === null) return;

      const isCorrect = (this.selectedOptionIndex === this.currentQuestion.correct);
      const q = this.currentQuestion;

      // Nyahaktifkan semua butang pilihan
      optionsContainer.querySelectorAll('.lab-option-btn').forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.add('cursor-default');

        if (idx === q.correct) {
          // Tandakan jawapan yang betul dengan hijau
          btn.classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-950');
          const letter = btn.querySelector('.lab-option-letter');
          if (letter) letter.className = 'w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0';
        } else if (idx === this.selectedOptionIndex && !isCorrect) {
          // Tandakan pilihan salah pengguna dengan merah
          btn.classList.add('border-rose-400', 'bg-rose-50', 'text-rose-950');
          const letter = btn.querySelector('.lab-option-letter');
          if (letter) letter.className = 'w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0';
        }
      });

      // Kemas kini pemarkahan (Hanya sekali bagi setiap item)
      this.answeredCount++;
      if (isCorrect) {
        this.correctAnswersCount++;
        this.score += q.points;
        Audio.playCorrect();
      } else {
        Audio.playIncorrect();
      }

      // Tandakan peralatan sebagai dikutip dalam inventori dan sembunyikan dari kanvas
      if (this.currentItem) {
        this.currentItem.collected = true;
        this.inventory[this.currentItem.key] = true;
        this.collectedCount++;
      }

      this.updateHUD();

      // Paparkan Maklum Balas Pendidikan
      if (feedbackContainer) {
        feedbackContainer.classList.remove('hidden');
        if (isCorrect) {
          feedbackContainer.className = 'p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs sm:text-sm font-body leading-relaxed mb-4';
          feedbackContainer.innerHTML = `
            <div class="flex items-center gap-2 mb-1.5 font-headline font-bold text-emerald-800 text-sm">
              <span class="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <span>Tepat sekali! (+${q.points} Mata)</span>
            </div>
            <p>${q.explanation}</p>
          `;
        } else {
          feedbackContainer.className = 'p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 text-xs sm:text-sm font-body leading-relaxed mb-4';
          feedbackContainer.innerHTML = `
            <div class="flex items-center gap-2 mb-1.5 font-headline font-bold text-rose-800 text-sm">
              <span class="material-symbols-outlined text-lg text-rose-600">cancel</span>
              <span>Kurang tepat! (Jawapan betul: Pilihan ${['A', 'B', 'C', 'D'][q.correct]})</span>
            </div>
            <p>${q.explanation}</p>
          `;
        }
      }

      // Tukar butang semak kepada butang Teruskan Misi
      if (submitBtn) {
        submitBtn.dataset.state = 'next';
        submitBtn.className = 'w-full py-3.5 px-6 rounded-xl font-headline font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer';
        submitBtn.innerHTML = `<span>Teruskan Misi Makmal</span><span class="material-symbols-outlined text-base">arrow_forward</span>`;
      }
    }

    // 8. Teruskan Misi Selepas Menjawab Soalan
    handleContinueMission() {
      if (this.questionModal) this.questionModal.classList.add('hidden');
      this.currentQuestion = null;
      this.currentItem = null;
      this.selectedOptionIndex = null;

      // Semak jika semua 10 peralatan telah dikutip!
      if (this.collectedCount >= 10 && !this.storageBonusAwarded) {
        this.showToast('Semua 10 peralatan ditemui! Bawa ke Kaunter Penyimpanan (Zon C) untuk dikemas.', 'warning', 5000);
      } else {
        this.showToast(`Peralatan berjaya dikutip! (${this.collectedCount}/10)`, 'success');
      }

      this.engine.resume();
    }

    // 9. Pengendalian Kaunter Pemulangan Peralatan (Zon C)
    handleStorageStationTrigger() {
      if (this.collectedCount < 10) {
        this.showToast(`Kaunter Penyimpanan: Anda baru mengumpul ${this.collectedCount}/10 peralatan. Kumpulkan semua peralatan dahulu!`, 'info');
        return;
      }

      if (this.storageBonusAwarded) {
        this.showToast('Semua peralatan telah dipulangkan! Sila bergerak ke Pintu Keluar Makmal (Zon E).', 'success');
        return;
      }

      // Pulangkan peralatan & beri bonus pemulangan (+50 pts)
      this.storageBonusAwarded = true;
      this.score += STORAGE_STATION.bonusPoints;
      Audio.playReturnStorage();
      this.updateHUD();

      // Buka Pintu Keluar Makmal di enjin
      this.engine.unlockExitDoor();

      this.showToast('Syabas! Peralatan berjaya disimpan dengan kemas (+50 pts bonus)! Pintu keluar makmal kini DIBUKA!', 'success', 5000);
    }

    // 10. Pengendalian Pintu Keluar Makmal (Zon E)
    handleExitDoorTrigger(isUnlocked) {
      if (!isUnlocked) {
        this.showToast('Pintu makmal masih berkunci! Kumpulkan semua 10 peralatan dan pulangkan ke Kaunter Simpanan terlebih dahulu.', 'lock', 4000);
        return;
      }

      // Pintu dibuka & pemain melangkah masuk! Tamatkan Misi!
      if (!this.hasCompletedMission) {
        this.hasCompletedMission = true;
        this.handleMissionVictory();
      }
    }

    // 11. Upacara Kemenangan & Pemarkahan Rasmi (Victory Screen)
    handleMissionVictory() {
      this.engine.pause();
      this.stopTimer();
      Audio.playVictory();

      // Kira Pangkat Saintis
      let rankTitle = '🌟 Pakar Pengurusan Makmal & Biologi Sel';
      if (this.score < 500) {
        rankTitle = '🥉 Pembantu Makmal Muda';
      } else if (this.score < 800) {
        rankTitle = '🥈 Saintis Eksplorasi Sel';
      }

      // Kemas kini Elemen Modal Kemenangan
      const scoreEl = document.getElementById('lab-victory-score');
      const correctEl = document.getElementById('lab-victory-correct');
      const timeEl = document.getElementById('lab-victory-time');
      const badgeEl = document.getElementById('lab-victory-badge');
      const statusEl = document.getElementById('lab-victory-storage-status');

      if (scoreEl) scoreEl.textContent = `${this.score} pts`;
      if (correctEl) correctEl.textContent = `${this.correctAnswersCount} / 10`;
      if (timeEl) timeEl.textContent = this.formatTime(this.elapsedSeconds);
      if (badgeEl) badgeEl.textContent = rankTitle;

      // Simpan Keputusan
      this.persistResults(statusEl);

      if (this.victoryModal) {
        this.victoryModal.classList.remove('hidden');
      }
    }

    // 12. Simpan Keputusan ke LocalStorage & Supabase
    async persistResults(statusEl) {
      const record = {
        quiz_id: 'misi-makmal-sains',
        game_title: 'Misi Makmal Sains: Operasi Kemas Makmal',
        topic: 'Pengembaraan Makmal: Struktur & Organisasi Sel',
        score: this.score,
        max_score: 1000,
        correct_answers: this.correctAnswersCount,
        total_questions: 10,
        equipment_collected: this.collectedCount,
        completion_time_seconds: this.elapsedSeconds,
        completed_at: new Date().toISOString()
      };

      try {
        // Simpan ke LocalStorage khusus permainan makmal
        localStorage.setItem('arselnel_lab_adventure_record', JSON.stringify(record));

        // Simpan ke rekod sejarah kuiz
        const history = JSON.parse(localStorage.getItem('arselnel_quiz_results') || '[]');
        history.push(record);
        localStorage.setItem('arselnel_quiz_results', JSON.stringify(history));

        if (statusEl) {
          statusEl.innerHTML = `<span class="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold"><span class="material-symbols-outlined text-sm">check</span> Rekod disimpan di storan tempatan!</span>`;
        }

        // Simpan ke Supabase jika ada integrasi
        if (window.ARSupabase && typeof window.ARSupabase.saveQuizAttempt === 'function') {
          const res = await window.ARSupabase.saveQuizAttempt({
            quiz_id: 'misi-makmal-sains',
            score: this.score,
            total_questions: 10,
            correct_count: this.correctAnswersCount,
            time_spent_seconds: this.elapsedSeconds,
            metadata: {
              game_type: '2d_lab_adventure',
              equipment_collected: this.collectedCount
            }
          });
          if (res && !res.error && statusEl) {
            statusEl.innerHTML = `<span class="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold"><span class="material-symbols-outlined text-sm">cloud_done</span> Keputusan berjaya diselaraskan ke pelayan sekolah!</span>`;
          }
        }
      } catch (err) {
        console.warn('Gagal menyimpan rekod permainan makmal:', err);
      }
    }

    // 13. Menu Jeda (Pause Menu)
    togglePause() {
      if (this.engine.state === GameState.QUESTION || this.engine.state === GameState.READY) return;

      if (this.engine.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }

    pauseGame() {
      this.engine.pause();
      if (this.pauseModal) this.pauseModal.classList.remove('hidden');
    }

    resumeGame() {
      if (this.pauseModal) this.pauseModal.classList.add('hidden');
      this.engine.resume();
    }

    // 14. Dialog Pengesahan (Restart / Exit)
    showConfirmDialog(title, message, onConfirm) {
      if (!this.confirmModal) return;

      const titleEl = document.getElementById('lab-confirm-title');
      const msgEl = document.getElementById('lab-confirm-message');
      const yesBtn = document.getElementById('lab-confirm-yes-btn');
      const noBtn = document.getElementById('lab-confirm-no-btn');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;

      const handleYes = () => {
        this.confirmModal.classList.add('hidden');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        onConfirm();
      };

      const handleNo = () => {
        this.confirmModal.classList.add('hidden');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
      };

      yesBtn.addEventListener('click', handleYes);
      noBtn.addEventListener('click', handleNo);

      this.confirmModal.classList.remove('hidden');
    }

    // 15. Paparan Inventori Peralatan
    showInventoryModal() {
      this.engine.pause();
      if (!this.inventoryModal) return;

      const listContainer = document.getElementById('lab-inventory-list');
      if (listContainer) {
        listContainer.innerHTML = '';
        EQUIPMENT.forEach(item => {
          const isFound = !!this.inventory[item.key];
          const card = document.createElement('div');
          card.className = `p-3 rounded-xl border flex items-center justify-between gap-3 ${isFound ? 'bg-teal-50 border-teal-300 text-teal-950' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}`;
          card.innerHTML = `
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">${item.icon}</span>
              <div>
                <span class="font-headline text-xs sm:text-sm font-bold block ${isFound ? 'text-slate-900' : 'text-slate-500'}">${item.name}</span>
                <span class="text-[11px] text-slate-500">${item.zone}</span>
              </div>
            </div>
            <div>
              ${isFound 
                ? '<span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md"><span class="material-symbols-outlined text-sm">check</span> Dikutip</span>'
                : '<span class="text-xs font-semibold text-slate-400">Belum ditemui</span>'
              }
            </div>
          `;
          listContainer.appendChild(card);
        });
      }

      this.inventoryModal.classList.remove('hidden');
    }

    // 16. Inisialisasi Pendengar Acara (Event Listeners)
    initEvents() {
      // Butang Mula Misi di Skrin Pengenalan
      const startBtn = document.getElementById('lab-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => this.startGame());
      }

      // Butang Semak / Teruskan di Modal Soalan
      const submitBtn = document.getElementById('lab-modal-submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (submitBtn.dataset.state === 'check') {
            this.handleCheckAnswer();
          } else if (submitBtn.dataset.state === 'next') {
            this.handleContinueMission();
          }
        });
      }

      // Butang HUD: Jeda
      if (this.pauseBtn) {
        this.pauseBtn.addEventListener('click', () => this.togglePause());
      }

      // Butang HUD: Senyap / Bunyi
      if (this.muteBtn) {
        this.muteBtn.addEventListener('click', () => {
          const isMuted = Audio.toggleMute();
          this.muteBtn.innerHTML = isMuted 
            ? '<span class="material-symbols-outlined text-lg text-rose-500">volume_off</span>' 
            : '<span class="material-symbols-outlined text-lg">volume_up</span>';
          this.showToast(isMuted ? 'Bunyi dimatikan' : 'Bunyi diaktifkan', 'info');
        });
      }

      // Butang HUD: Cara Bermain
      if (this.helpBtn) {
        this.helpBtn.addEventListener('click', () => {
          this.showIntroModal();
        });
      }

      // Butang HUD: Inventori
      if (this.inventoryBtn) {
        this.inventoryBtn.addEventListener('click', () => {
          this.showInventoryModal();
        });
      }

      // Butang Tutup Inventori
      const closeInvBtn = document.getElementById('lab-inventory-close-btn');
      if (closeInvBtn) {
        closeInvBtn.addEventListener('click', () => {
          if (this.inventoryModal) this.inventoryModal.classList.add('hidden');
          this.engine.resume();
        });
      }

      // Butang HUD: Keluar
      if (this.exitBtn) {
        this.exitBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            'Keluar dari Misi Makmal?',
            'Adakah anda pasti mahu meninggalkan makmal sains? Kemajuan larian semasa tidak akan disimpan.',
            () => { window.location.href = '../hab_permainan/code.html'; }
          );
        });
      }

      // Butang Menu Jeda
      const resumeBtn = document.getElementById('lab-pause-resume-btn');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', () => this.resumeGame());
      }

      const restartBtn = document.getElementById('lab-pause-restart-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            'Mula Semula Misi?',
            'Adakah anda pasti mahu memulakan semula operasi kemas makmal dari awal?',
            () => { window.location.reload(); }
          );
        });
      }

      const guidePauseBtn = document.getElementById('lab-pause-guide-btn');
      if (guidePauseBtn) {
        guidePauseBtn.addEventListener('click', () => {
          if (this.pauseModal) this.pauseModal.classList.add('hidden');
          this.showIntroModal();
        });
      }

      const exitPauseBtn = document.getElementById('lab-pause-exit-btn');
      if (exitPauseBtn) {
        exitPauseBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            'Keluar ke Hab Permainan?',
            'Adakah anda pasti mahu kembali ke Hab Permainan?',
            () => { window.location.href = '../hab_permainan/code.html'; }
          );
        });
      }

      // Kekunci Pintas Keyboard: Esc atau P untuk Jeda
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          // Jika modal soalan atau intro sedang terbuka, jangan kacau
          if (this.introModal && !this.introModal.classList.contains('hidden')) return;
          if (this.questionModal && !this.questionModal.classList.contains('hidden')) return;
          this.togglePause();
        }
      });

      // Kawalan Sentuh Maya (D-pad Mobile)
      const setupDpadKey = (id, dir) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const press = (e) => {
          e.preventDefault();
          btn.classList.add('active');
          this.engine.setTouchDirection(dir, true);
        };
        const release = (e) => {
          e.preventDefault();
          btn.classList.remove('active');
          this.engine.setTouchDirection(dir, false);
        };

        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      };

      setupDpadKey('lab-dpad-up', 'up');
      setupDpadKey('lab-dpad-down', 'down');
      setupDpadKey('lab-dpad-left', 'left');
      setupDpadKey('lab-dpad-right', 'right');
    }
  }

  // Eksport UI Controller
  global.ARSelNelLabAdventure.LabAdventureUIController = LabAdventureUIController;

  // Pasang secara automatik apabila DOM siap dimuat dengan sokongan CMS soalan
  window.addEventListener('DOMContentLoaded', async () => {
    if (global.CMSAdapter) {
      try {
        const cmsQ = await global.CMSAdapter.getGameQuestions('lab_adventure', { status: 'published' });
        if (cmsQ && Array.isArray(cmsQ) && cmsQ.length > 0) {
          global.ARSelNelLabAdventure.QUESTIONS = cmsQ;
        }
      } catch (err) {
        console.warn('Lab CMS questions fallback to default:', err);
      }
    }
    global.labAdventureApp = new LabAdventureUIController();
  });

})(window);
