/**
 * Juego 9: Anillos de la Trinidad (El Paraíso)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';

export function initGame9(container, restartGame) {
  let angles = [45, 135, 225];

  function render() {
    container.innerHTML = `
      <div class="space-y-4 text-center max-w-sm w-full">
        <p class="text-xs text-slate-400">Haz girar los 3 anillos de luz celestial hasta alinearlos a 0° (apuntando arriba).</p>

        <div class="relative w-56 h-56 mx-auto bg-slate-950 border border-sky-900 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
          <div class="absolute w-48 h-48 border-4 border-dashed border-sky-400 rounded-full transition-transform duration-300" style="transform: rotate(${angles[0]}deg)"></div>
          <div class="absolute w-36 h-36 border-4 border-dashed border-amber-400 rounded-full transition-transform duration-300" style="transform: rotate(${angles[1]}deg)"></div>
          <div class="absolute w-24 h-24 border-4 border-dashed border-red-400 rounded-full transition-transform duration-300" style="transform: rotate(${angles[2]}deg)"></div>
          <div class="w-4 h-4 bg-white rounded-full shadow-lg z-10 animate-pulse"></div>
        </div>

        <div class="text-xs text-slate-400 flex justify-around">
          <span>Anillo 1: <strong class="${angles[0] === 0 ? 'text-emerald-400' : 'text-sky-400'}">${angles[0]}°</strong></span>
          <span>Anillo 2: <strong class="${angles[1] === 0 ? 'text-emerald-400' : 'text-amber-400'}">${angles[1]}°</strong></span>
          <span>Anillo 3: <strong class="${angles[2] === 0 ? 'text-emerald-400' : 'text-red-400'}">${angles[2]}°</strong></span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button id="ring-btn-0" class="p-2.5 bg-sky-950/80 hover:bg-sky-900/80 border border-sky-700 text-sky-300 font-bold rounded-xl text-xs transition-transform active:scale-95">Girar Anillo 1</button>
          <button id="ring-btn-1" class="p-2.5 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-700 text-amber-300 font-bold rounded-xl text-xs transition-transform active:scale-95">Girar Anillo 2</button>
          <button id="ring-btn-2" class="p-2.5 bg-red-950/80 hover:bg-red-900/80 border border-red-700 text-red-300 font-bold rounded-xl text-xs transition-transform active:scale-95">Girar Anillo 3</button>
        </div>
      </div>
    `;

    container.querySelector('#ring-btn-0').addEventListener('click', () => rotateRing(0));
    container.querySelector('#ring-btn-1').addEventListener('click', () => rotateRing(1));
    container.querySelector('#ring-btn-2').addEventListener('click', () => rotateRing(2));
  }

  function rotateRing(idx) {
    audioManager.playSound('click');
    angles[idx] = (angles[idx] + 45) % 360;
    render();

    if (angles[0] === 0 && angles[1] === 0 && angles[2] === 0) {
      stateManager.markGameCompleted(9);
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-dharmachakra text-5xl text-sky-400 animate-spin"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Alineación Divina!</h3>
            <p class="text-slate-300 text-sm">Has armonizado los tres círculos de luz y color en una perfecta unidad.</p>
            <div class="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button id="view-cert-btn-g9" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center space-x-2">
                <i class="fa-solid fa-award"></i>
                <span>Ver Certificado de Honor</span>
              </button>
              <button id="retry-g9-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors">
                <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
              </button>
            </div>
          </div>
        `;
        container.querySelector('#view-cert-btn-g9').addEventListener('click', () => {
          router.switchTab('certificate');
        });
        container.querySelector('#retry-g9-btn').addEventListener('click', () => {
          restartGame(9);
        });
      }, 400);
    }
  }

  render();
}
