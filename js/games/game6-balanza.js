/**
 * Juego 6: Balanza de las Virtudes (El Purgatorio)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame6(container, restartGame) {
  const leftWeight = 15;
  let rightWeight = 0;
  const targetWeight = 15;

  const weights = [
    { val: 1, name: "Humildad (+1)", icon: "fa-solid fa-seedling" },
    { val: 3, name: "Generosidad (+3)", icon: "fa-solid fa-hand-holding-heart" },
    { val: 5, name: "Paciencia (+5)", icon: "fa-solid fa-hourglass-half" },
    { val: 6, name: "Templanza (+6)", icon: "fa-solid fa-shield-heart" }
  ];

  function render() {
    container.innerHTML = `
      <div class="space-y-5 max-w-md w-full text-center">
        <p class="text-xs text-slate-400">Equilibra la balanza agregando pesos de virtudes hasta igualar el pecado de la Soberbia (Peso: <span class="text-red-400 font-bold">${targetWeight}</span>).</p>
        
        <div class="flex justify-around items-end bg-slate-950 p-6 rounded-2xl border border-amber-900/60 shadow-inner">
          <div class="text-center">
            <i class="fa-solid fa-weight-hanging text-3xl text-red-500"></i>
            <p class="text-xs text-red-300 font-bold mt-1">Soberbia</p>
            <p class="text-2xl font-black text-red-400">${leftWeight}</p>
          </div>

          <div class="flex flex-col items-center">
            <i class="fa-solid fa-scale-balanced text-4xl text-amber-400"></i>
            <span class="text-[10px] text-slate-500 mt-1">Equilibrio: ${rightWeight} / ${targetWeight}</span>
          </div>

          <div class="text-center">
            <i class="fa-solid fa-feather text-3xl text-emerald-400"></i>
            <p class="text-xs text-emerald-300 font-bold mt-1">Virtudes</p>
            <p class="text-2xl font-black text-emerald-400">${rightWeight}</p>
          </div>
        </div>

        <div id="scale-alert" class="hidden text-xs p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-200"></div>

        <div class="grid grid-cols-2 gap-2">
          ${weights.map(w => `
            <button data-weight-val="${w.val}" class="btn-virtue p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-amber-200 transition-transform active:scale-95 flex items-center justify-center space-x-1.5">
              <i class="${w.icon} text-amber-400 text-sm"></i>
              <span>${w.name}</span>
            </button>
          `).join('')}
        </div>

        <button id="reset-scale-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">
          <i class="fa-solid fa-rotate-left mr-1"></i> Reiniciar Balanza
        </button>
      </div>
    `;

    container.querySelectorAll('.btn-virtue').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-weight-val'), 10);
        addWeight(val);
      });
    });

    container.querySelector('#reset-scale-btn').addEventListener('click', resetScale);
  }

  function addWeight(val) {
    audioManager.playSound('click');
    rightWeight += val;

    if (rightWeight === targetWeight) {
      stateManager.markGameCompleted(6);
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-scale-unbalanced-flip text-5xl text-amber-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Balanza Equilibrada!</h3>
            <p class="text-slate-300 text-sm">Has compensado la soberbia con las virtudes purificadoras exactas.</p>
            <button id="retry-g6-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
            </button>
          </div>
        `;
        container.querySelector('#retry-g6-btn').addEventListener('click', () => {
          restartGame(6);
        });
      }, 400);
    } else if (rightWeight > targetWeight) {
      audioManager.playSound('error');
      const alertEl = container.querySelector('#scale-alert');
      if (alertEl) {
        alertEl.classList.remove('hidden');
        alertEl.innerText = `¡Te pasaste de peso (${rightWeight})! Se reinicia la balanza.`;
      }
      setTimeout(() => {
        rightWeight = 0;
        render();
      }, 1200);
    } else {
      render();
    }
  }

  function resetScale() {
    rightWeight = 0;
    render();
  }

  render();
}
