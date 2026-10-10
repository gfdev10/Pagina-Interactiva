/**
 * Juego 2: Memotest de Palabras (El Infierno)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame2(container, restartGame) {
  const words = ['DANTE', 'VIRGILIO', 'BEATRIZ', 'INFIERNO', 'PURGATORIO', 'PARAÍSO', 'CARONTE', 'MINOS'];
  const cards = [...words, ...words].sort(() => Math.random() - 0.5);

  let flipped = [];
  let matched = [];

  container.innerHTML = `
    <div class="space-y-4 max-w-lg w-full">
      <div class="flex justify-between items-center text-xs text-slate-400">
        <span>Encuentra los 8 pares de palabras dantescas</span>
        <span>Pares: <strong id="memo-pairs-count" class="text-amber-400">0 / 8</strong></span>
      </div>
      <div class="grid grid-cols-4 gap-3" id="memo-grid">
        ${cards.map((word, i) => `
          <button id="memo-card-${i}" data-card-idx="${i}" class="memo-card h-16 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xs text-amber-400 flex items-center justify-center p-1 shadow transition-all hover:border-amber-500">
            <span class="hidden select-none" id="memo-text-${i}">${word}</span>
            <i class="fa-solid fa-question text-slate-600" id="memo-icon-${i}"></i>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  function updateCount() {
    const el = container.querySelector('#memo-pairs-count');
    if (el) el.innerText = `${matched.length / 2} / ${words.length}`;
  }

  function handleCardClick(idx) {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;

    audioManager.playSound('click');
    flipped.push(idx);

    const textEl = container.querySelector(`#memo-text-${idx}`);
    const iconEl = container.querySelector(`#memo-icon-${idx}`);
    const cardEl = container.querySelector(`#memo-card-${idx}`);

    textEl.classList.remove('hidden');
    iconEl.classList.add('hidden');
    cardEl.classList.add('bg-amber-950/60', 'border-amber-500');

    if (flipped.length === 2) {
      const [i1, i2] = flipped;
      if (cards[i1] === cards[i2]) {
        audioManager.playSound('success');
        matched.push(i1, i2);
        flipped = [];
        updateCount();

        if (matched.length === cards.length) {
          stateManager.markGameCompleted(2);
          setTimeout(() => {
            container.innerHTML = `
              <div class="text-center space-y-4">
                <i class="fa-solid fa-star text-5xl text-amber-400 animate-spin"></i>
                <h3 class="font-cinzel text-2xl font-bold text-white">¡Memotest Completado!</h3>
                <p class="text-slate-300 text-sm">Has encontrado todos los pares de conceptos y personajes dantescos.</p>
                <button id="retry-g2-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
                  <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
                </button>
              </div>
            `;
            container.querySelector('#retry-g2-btn').addEventListener('click', () => {
              restartGame(2);
            });
          }, 600);
        }
      } else {
        audioManager.playSound('error');
        setTimeout(() => {
          [i1, i2].forEach(i => {
            const t = container.querySelector(`#memo-text-${i}`);
            const ic = container.querySelector(`#memo-icon-${i}`);
            const cd = container.querySelector(`#memo-card-${i}`);
            if (t && ic && cd) {
              t.classList.add('hidden');
              ic.classList.remove('hidden');
              cd.classList.remove('bg-amber-950/60', 'border-amber-500');
            }
          });
          flipped = [];
        }, 1000);
      }
    }
  }

  container.querySelectorAll('.memo-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-card-idx'), 10);
      handleCardClick(idx);
    });
  });
}
