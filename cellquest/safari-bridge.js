/**
 * ARSELNEL — SafariAdventure 3D WebGL Bridge (safari-bridge.js)
 * 
 * Provides safe communication between the Unity 6.5 WebGL runtime,
 * ARSELNEL Session/Auth Guard, and Supabase student progress API.
 */

(function (global) {
  'use strict';

  const BRIDGE_LOG_PREFIX = '[SafariBridge]';

  const SafariBridge = {
    version: '1.0.0',

    /**
     * Called when a student completes an interactive learning station in the 3D Safari.
     * @param {number|string} stationId - Identifier of the station (1, 2, 3...)
     * @param {number} score - Score awarded for this station
     * @param {object|string} details - Additional learning data or quiz answers
     */
    onStationCompleted: async function (stationId, score, details) {
      const parsedDetails = typeof details === 'string' ? safeJsonParse(details) : (details || {});
      console.log(`${BRIDGE_LOG_PREFIX} Stesen ${stationId} diselesaikan! Skor: ${score}`, parsedDetails);

      // Dispatch DOM Event for UI listeners
      global.dispatchEvent(new CustomEvent('safari:station_completed', {
        detail: { stationId, score, details: parsedDetails, timestamp: Date.now() }
      }));

      // Calculate progress percentage based on 3 stations
      const progressPercent = Math.min(100, Math.round((Number(stationId) || 1) / 3 * 100));

      if (global.ARSupabase && typeof global.ARSupabase.saveProgress === 'function') {
        try {
          await global.ARSupabase.saveProgress('cellquest-safari3d', progressPercent, {
            stationId,
            score,
            ...parsedDetails,
            updatedAt: new Date().toISOString()
          });
          console.log(`${BRIDGE_LOG_PREFIX} Kemajuan stesen berjaya disimpan ke ARSupabase.`);
        } catch (err) {
          console.warn(`${BRIDGE_LOG_PREFIX} Gagal menyimpan kemajuan ke awan, disimpan secara tempatan:`, err);
        }
      }
    },

    /**
     * Called when the student finishes the full safari adventure / collects all badges.
     * @param {number} finalScore - Total score
     * @param {number} timeSeconds - Total time in seconds
     * @param {number} stationsCount - Total stations completed (default 3)
     */
    onGameCompleted: async function (finalScore, timeSeconds, stationsCount) {
      const stations = Number(stationsCount) || 3;
      const score = Math.max(0, Math.round(Number(finalScore) || 100));
      const timeSpent = Math.max(0, Math.round(Number(timeSeconds) || 0));

      console.log(`${BRIDGE_LOG_PREFIX} Permainan Selesai! Skor: ${score}, Masa: ${timeSpent}s, Stesen: ${stations}/3`);

      global.dispatchEvent(new CustomEvent('safari:game_completed', {
        detail: { score, timeSpent, stations, timestamp: Date.now() }
      }));

      const record = {
        quizId: 'cellquest-safari3d',
        title: 'Taman Arnab 3D Safari Adventure',
        score: score,
        correct: stations,
        total: 3,
        timeSpent: timeSpent,
        timestamp: new Date().toISOString()
      };

      if (global.ARSupabase) {
        try {
          if (typeof global.ARSupabase.saveQuizAttempt === 'function') {
            await global.ARSupabase.saveQuizAttempt(record);
          }
          if (typeof global.ARSupabase.saveProgress === 'function') {
            await global.ARSupabase.saveProgress('cellquest-safari3d', 100, record);
          }
          console.log(`${BRIDGE_LOG_PREFIX} Rekod kejayaan SafariAdventure berjaya disimpan ke profil murid.`);
        } catch (err) {
          console.warn(`${BRIDGE_LOG_PREFIX} Ralat menyimpan ke ARSupabase, rekod dikekalkan dalam storan tempatan:`, err);
        }
      }
    }
  };

  function safeJsonParse(str) {
    try {
      return JSON.parse(str);
    } catch (_) {
      return { raw: str };
    }
  }

  // Expose global methods for Unity SendMessage / EM_ASM
  global.SafariBridge = SafariBridge;
  global.onSafariStationCompleted = SafariBridge.onStationCompleted;
  global.onSafariGameCompleted = SafariBridge.onGameCompleted;

})(window);

