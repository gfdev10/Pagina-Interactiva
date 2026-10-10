/**
 * Juego 8: Enigma Rosa Creadora (El Paraíso)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame8(container, restartGame) {
  const phrase = "BEATRIZ GUIA A DANTE HASTA LA LUZ";
  const revealed = phrase.split('');
  const masked = revealed.map(c => (c === ' ' ? ' ' : '_'));

  container.innerHTML = `
    <div class="space-y-4 max-w-md w-full text-center">
      <p class="text-xs text-slate-400">Descifra el mensaje secreto de la Rosa Mística seleccionando las letras correctas:</p>
      
      <div class="p-4 bg-slate-950 border border-sky-900 rounded-2xl flex flex-wrap justify-center gap-1.5 font-mono text-lg font-bold text-sky-300 shadow-inner">
        ${masked.map((c, i) => `
          <span id="cipher-${i}" class="w-6 h-8 flex items-center justify-center border-b-2 ${c === ' ' ? 'border-transparent' : 'border-sky-500'}">
            ${c}
          </span>
        `).join('')}
      </div>

      <div class="grid grid-cols-7 gap-1.5 pt-2" id="letters-keyboard">
        ${"ABCDEFGHIJLMNOPRSTUZ".split('').map(l => `
          <button data-letter="${l}" class="vk-btn p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-transform">
            ${l}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  function guessLetter(letter, btn) {
    btn.disabled = true;
    btn.className = "vk-btn p-2 bg-slate-900 border border-slate-800 text-slate-600 rounded-lg text-xs font-bold";

    let hit = false;
    revealed.forEach((c, idx) => {
      if (c === letter) {
        masked[idx] = letter;
        const charEl = container.querySelector(`#cipher-${idx}`);
        if (charEl) charEl.innerText = letter;
        hit = true;
      }
    });

    if (hit) {
      audioManager.playSound('success');
    } else {
      audioManager.playSound('click');
    }

    if (!masked.includes('_')) {
      stateManager.markGameCompleted(8);
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-rose text-5xl text-sky-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Enigma Revelado!</h3>
            <p class="text-slate-300 text-sm font-semibold italic">«${phrase}»</p>
            <p class="text-xs text-slate-400">Has descifrado la profecía de la luz celestial.</p>
            <button id="retry-g8-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
            </button>
          </div>
        `;
        container.querySelector('#retry-g8-btn').addEventListener('click', () => {
          restartGame(8);
        });
      }, 500);
    }
  }

  container.querySelectorAll('.vk-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = btn.getAttribute('data-letter');
      guessLetter(l, btn);
    });
  });
}
