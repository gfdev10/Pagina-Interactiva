/**
 * Juego 1: Trivia Dantesca (El Infierno)
 */
import { triviaQuestions } from '../data/triviaQuestions.js';
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame1(container, restartGame) {
  let idx = 0;
  let score = 0;
  let answered = false;

  function render() {
    answered = false;
    const item = triviaQuestions[idx];

    container.innerHTML = `
      <div class="max-w-md w-full space-y-6">
        <div class="flex justify-between items-center text-xs text-slate-400">
          <span>Pregunta ${idx + 1} de ${triviaQuestions.length}</span>
          <span>Aciertos: <strong class="text-amber-400">${score}</strong></span>
        </div>
        <h3 class="text-lg font-bold text-slate-100">${item.q}</h3>
        <div class="space-y-3" id="trivia-options">
          ${item.opts.map((opt, i) => `
            <button data-opt-idx="${i}" class="trivia-btn w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition-all hover:translate-x-1">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="trivia-feedback" class="hidden p-3 rounded-xl text-xs leading-relaxed feedback-fade-in"></div>
      </div>
    `;

    container.querySelectorAll('.trivia-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.getAttribute('data-opt-idx'), 10);
        handleSelection(selected);
      });
    });
  }

  function handleSelection(selected) {
    if (answered) return;
    answered = true;

    // Disable all options
    container.querySelectorAll('.trivia-btn').forEach(b => {
      b.disabled = true;
      b.classList.add('opacity-70');
    });

    const item = triviaQuestions[idx];
    const fb = container.querySelector('#trivia-feedback');
    fb.classList.remove('hidden');

    if (selected === item.a) {
      audioManager.playSound('success');
      score++;
      fb.className = "p-3 rounded-xl text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-200 feedback-fade-in";
      fb.innerHTML = `<strong>¡Correcto!</strong> ${item.exp}`;
    } else {
      audioManager.playSound('error');
      fb.className = "p-3 rounded-xl text-xs bg-red-950/80 border border-red-800 text-red-200 feedback-fade-in";
      fb.innerHTML = `<strong>Incorrecto.</strong> ${item.exp}`;
    }

    setTimeout(() => {
      idx++;
      if (idx < triviaQuestions.length) {
        render();
      } else {
        stateManager.markGameCompleted(1);
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-trophy text-5xl text-amber-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Trivia Completada!</h3>
            <p class="text-slate-300 text-sm">Respondiste correctamente <span class="font-bold text-amber-400">${score}</span> de ${triviaQuestions.length} preguntas.</p>
            <button id="retry-g1-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Reintentar
            </button>
          </div>
        `;
        container.querySelector('#retry-g1-btn').addEventListener('click', () => {
          restartGame(1);
        });
      }
    }, 2200);
  }

  render();
}
