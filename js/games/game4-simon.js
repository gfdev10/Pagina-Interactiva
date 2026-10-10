/**
 * Juego 4: Canto de Lamentos - Simon Says (El Purgatorio)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame4(container, restartGame) {
  const notes = [
    { id: 0, color: 'bg-red-600', activeClass: 'ring-red-400', freq: 261.63, name: 'Soberbia' },
    { id: 1, color: 'bg-amber-500', activeClass: 'ring-amber-300', freq: 329.63, name: 'Envidia' },
    { id: 2, color: 'bg-emerald-500', activeClass: 'ring-emerald-400', freq: 392.00, name: 'Ira' },
    { id: 3, color: 'bg-sky-500', activeClass: 'ring-sky-400', freq: 523.25, name: 'Avaricia' }
  ];

  let sequence = [];
  let playerSeq = [];
  let round = 1;
  const targetRounds = 4;
  let isPlayingDemo = false;

  container.innerHTML = `
    <div class="space-y-4 text-center max-w-sm w-full">
      <p class="text-xs text-slate-400">Memoriza la secuencia de cantos y repítela para ascender el Purgatorio.</p>
      <div class="text-xs font-bold text-amber-400" id="simon-status">Presiona el botón para comenzar</div>
      <div class="grid grid-cols-2 gap-3" id="simon-grid">
        ${notes.map(n => `
          <button id="simon-btn-${n.id}" data-note-id="${n.id}" class="simon-pad ${n.color} h-24 rounded-2xl opacity-75 hover:opacity-100 transition-all font-bold text-slate-950 text-sm flex items-center justify-center shadow-lg active:scale-95">
            ${n.name}
          </button>
        `).join('')}
      </div>
      <button id="simon-start-btn" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg">
        <i class="fa-solid fa-play mr-1"></i> Iniciar Secuencia Musical
      </button>
    </div>
  `;

  function lightUp(id) {
    const btn = container.querySelector(`#simon-btn-${id}`);
    if (!btn) return;

    btn.classList.remove('opacity-75');
    btn.classList.add('opacity-100', 'scale-105', 'ring-4', 'ring-white');
    audioManager.playNoteFreq(notes[id].freq, 0.4, 'triangle', 0.3);

    setTimeout(() => {
      btn.classList.remove('opacity-100', 'scale-105', 'ring-4', 'ring-white');
      btn.classList.add('opacity-75');
    }, 350);
  }

  function startSimon() {
    sequence = [];
    round = 1;
    nextRound();
  }

  function nextRound() {
    const statusEl = container.querySelector('#simon-status');
    const startBtn = container.querySelector('#simon-start-btn');
    if (statusEl) statusEl.innerText = `Nivel ${round} de ${targetRounds}: Escucha...`;
    if (startBtn) startBtn.classList.add('hidden');

    playerSeq = [];
    sequence.push(Math.floor(Math.random() * 4));
    playDemo();
  }

  function playDemo() {
    isPlayingDemo = true;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(interval);
        isPlayingDemo = false;
        const statusEl = container.querySelector('#simon-status');
        if (statusEl) statusEl.innerText = `Nivel ${round} de ${targetRounds}: ¡Tu turno!`;
        return;
      }
      lightUp(sequence[i]);
      i++;
    }, 600);
  }

  function handlePadPress(id) {
    if (isPlayingDemo || sequence.length === 0) return;
    lightUp(id);
    playerSeq.push(id);

    const currentStep = playerSeq.length - 1;
    if (playerSeq[currentStep] !== sequence[currentStep]) {
      audioManager.playSound('error');
      const statusEl = container.querySelector('#simon-status');
      const startBtn = container.querySelector('#simon-start-btn');
      if (statusEl) statusEl.innerText = "¡Te equivocaste! Inténtalo de nuevo.";
      if (startBtn) {
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = '<i class="fa-solid fa-rotate-right mr-1"></i> Reintentar';
      }
      sequence = [];
      return;
    }

    if (playerSeq.length === sequence.length) {
      if (round >= targetRounds) {
        stateManager.markGameCompleted(4);
        setTimeout(() => {
          container.innerHTML = `
            <div class="text-center space-y-4">
              <i class="fa-solid fa-music text-5xl text-amber-400 animate-bounce"></i>
              <h3 class="font-cinzel text-2xl font-bold text-white">¡Armonía Purificada!</h3>
              <p class="text-slate-300 text-sm">Has memorizado los cantos de purificación y completado las 4 secuencias.</p>
              <button id="retry-g4-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
                <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
              </button>
            </div>
          `;
          container.querySelector('#retry-g4-btn').addEventListener('click', () => {
            restartGame(4);
          });
        }, 600);
      } else {
        round++;
        setTimeout(nextRound, 800);
      }
    }
  }

  container.querySelector('#simon-start-btn').addEventListener('click', startSimon);

  container.querySelectorAll('.simon-pad').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-note-id'), 10);
      handlePadPress(id);
    });
  });
}
