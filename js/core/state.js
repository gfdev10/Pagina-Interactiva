/**
 * Gestor de Estado Central (State Management)
 * Maneja el progreso del alumno, medallas, persistencia en localStorage y listeners reactivos.
 */
import { audioManager } from './audio.js';

class StateManager {
  constructor() {
    this.totalGames = 9;
    this.medals = new Array(this.totalGames).fill(false);
    this.activeGame = null;
    this.loopInterval = null;
    this.studentName = '';
    this.listeners = [];

    this.loadState();
  }

  loadState() {
    try {
      const savedMedals = localStorage.getItem('dante_medals');
      if (savedMedals) {
        const parsed = JSON.parse(savedMedals);
        if (Array.isArray(parsed)) {
          this.medals = parsed.slice(0, this.totalGames);
          while (this.medals.length < this.totalGames) {
            this.medals.push(false);
          }
        }
      }

      const savedName = localStorage.getItem('dante_student_name');
      if (savedName) {
        this.studentName = savedName;
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('dante_medals', JSON.stringify(this.medals));
      localStorage.setItem('dante_student_name', this.studentName);
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getStateSnapshot()));
  }

  getStateSnapshot() {
    return {
      medals: [...this.medals],
      completedCount: this.getCompletedCount(),
      totalGames: this.totalGames,
      activeGame: this.activeGame,
      studentName: this.studentName
    };
  }

  getCompletedCount() {
    return this.medals.filter(Boolean).length;
  }

  isGameCompleted(gameId) {
    return Boolean(this.medals[gameId - 1]);
  }

  markGameCompleted(gameId) {
    const idx = gameId - 1;
    if (idx >= 0 && idx < this.totalGames) {
      if (!this.medals[idx]) {
        this.medals[idx] = true;
        this.saveState();
        audioManager.playSound('success');
        this.notify();
      }
    }
  }

  setStudentName(name) {
    this.studentName = name;
    this.saveState();
    this.notify();
  }

  setActiveGame(gameId) {
    this.activeGame = gameId;
  }

  setLoopInterval(intervalId) {
    this.clearGameLoops();
    this.loopInterval = intervalId;
  }

  clearGameLoops() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    // Clean key handlers if any
    document.onkeydown = null;
  }

  resetProgress() {
    this.medals = new Array(this.totalGames).fill(false);
    this.saveState();
    this.notify();
  }
}

export const stateManager = new StateManager();
