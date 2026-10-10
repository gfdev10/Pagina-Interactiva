/**
 * Componente Header y Barra de Estado Superior
 */
import { router } from '../core/router.js';
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initHeader() {
  const brandEl = document.getElementById('header-brand');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const medalCountEl = document.getElementById('global-medal-count');

  if (brandEl) {
    brandEl.addEventListener('click', () => {
      router.switchTab('home');
    });
  }

  function updateSoundUI() {
    if (soundIcon) {
      if (audioManager.isSoundEnabled()) {
        soundIcon.className = 'fa-solid fa-volume-high text-slate-300';
      } else {
        soundIcon.className = 'fa-solid fa-volume-xmark text-slate-500';
      }
    }
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      audioManager.toggleSound();
      updateSoundUI();
    });
  }

  function updateMedalsUI(snapshot) {
    if (medalCountEl) {
      medalCountEl.innerText = `${snapshot.completedCount} / ${snapshot.totalGames}`;
    }
  }

  // Subscribe to state changes
  stateManager.subscribe(updateMedalsUI);

  // Initial render
  updateSoundUI();
  updateMedalsUI(stateManager.getStateSnapshot());
}
