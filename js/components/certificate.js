/**
 * Componente Certificado de Honor (Diploma)
 */
import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';

export function initCertificate() {
  const nameInput = document.getElementById('cert-student-name');
  const medalsDisplay = document.getElementById('cert-medals-display');
  const printBtn = document.getElementById('print-cert-btn');
  const backBtn = document.getElementById('cert-back-btn');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      router.switchTab('home');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Load and sync student name
  if (nameInput) {
    nameInput.value = stateManager.studentName || '';
    nameInput.addEventListener('input', (e) => {
      stateManager.setStudentName(e.target.value);
    });
  }

  function updateCertificateMedals(snapshot) {
    if (!medalsDisplay) return;

    medalsDisplay.innerHTML = '';
    for (let i = 0; i < snapshot.totalGames; i++) {
      const isAchieved = snapshot.medals[i];
      const span = document.createElement('span');
      span.className = `medal-badge-cert w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
        isAchieved
          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
          : 'bg-slate-800 text-slate-600 border-slate-700'
      }`;
      span.innerText = i + 1;
      span.title = isAchieved ? `Desafío ${i + 1} completado` : `Desafío ${i + 1} pendiente`;
      medalsDisplay.appendChild(span);
    }
  }

  // Subscribe to state updates
  stateManager.subscribe(updateCertificateMedals);

  // Initial render
  updateCertificateMedals(stateManager.getStateSnapshot());
}
