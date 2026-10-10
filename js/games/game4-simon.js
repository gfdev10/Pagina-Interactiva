/**
 * Juego 4: Canto de Lamentos - Desafío Visual de las 8 Terrazas (El Purgatorio)
 * Versión 8 Botones (100% Visual / Sin Sonido) con Dificultad Progresiva y Aceleración
 */
import { stateManager } from '../core/state.js';

export function initGame4(container, restartGame) {
  // Las 8 Terrazas y pecados del Purgatorio dantesco
  const pads = [
    {
      id: 0,
      name: 'Antepurgatorio',
      virtue: 'Esperanza',
      color: 'from-violet-600 to-purple-950',
      border: 'border-violet-500/50',
      glow: 'rgba(167, 139, 250, 0.95)',
      icon: 'fa-solid fa-hourglass-start',
      key: '1'
    },
    {
      id: 1,
      name: 'Soberbia',
      virtue: 'Humildad',
      color: 'from-red-600 to-rose-950',
      border: 'border-red-500/50',
      glow: 'rgba(248, 113, 113, 0.95)',
      icon: 'fa-solid fa-crown',
      key: '2'
    },
    {
      id: 2,
      name: 'Envidia',
      virtue: 'Caridad',
      color: 'from-amber-500 to-yellow-950',
      border: 'border-amber-500/50',
      glow: 'rgba(251, 191, 36, 0.95)',
      icon: 'fa-solid fa-eye',
      key: '3'
    },
    {
      id: 3,
      name: 'Ira',
      virtue: 'Paciencia',
      color: 'from-emerald-500 to-green-950',
      border: 'border-emerald-500/50',
      glow: 'rgba(52, 211, 153, 0.95)',
      icon: 'fa-solid fa-fire-flame-curved',
      key: '4'
    },
    {
      id: 4,
      name: 'Pereza',
      virtue: 'Diligencia',
      color: 'from-sky-500 to-blue-950',
      border: 'border-sky-500/50',
      glow: 'rgba(56, 189, 248, 0.95)',
      icon: 'fa-solid fa-bolt',
      key: '5'
    },
    {
      id: 5,
      name: 'Avaricia',
      virtue: 'Generosidad',
      color: 'from-orange-500 to-amber-950',
      border: 'border-orange-500/50',
      glow: 'rgba(251, 146, 60, 0.95)',
      icon: 'fa-solid fa-scale-balanced',
      key: '6'
    },
    {
      id: 6,
      name: 'Gula',
      virtue: 'Templanza',
      color: 'from-pink-500 to-fuchsia-950',
      border: 'border-pink-500/50',
      glow: 'rgba(244, 114, 182, 0.95)',
      icon: 'fa-solid fa-utensils',
      key: '7'
    },
    {
      id: 7,
      name: 'Lujuria',
      virtue: 'Pureza',
      color: 'from-cyan-400 to-teal-950',
      border: 'border-cyan-400/50',
      glow: 'rgba(34, 211, 238, 0.95)',
      icon: 'fa-solid fa-feather',
      key: '8'
    }
  ];

  // Configuración de niveles progresivos
  const totalLevels = 6; // 6 Niveles con longitud creciente
  const levelLengths = [3, 4, 5, 6, 7, 8]; // Cantidad de destellos por nivel
  const levelSpeeds = [550, 480, 420, 370, 330, 290]; // Velocidad progresiva (ms por destello)

  let currentLevel = 1;
  let sequence = [];
  let playerSeq = [];
  let isShowingDemo = false;
  let replaysLeft = 2;

  container.innerHTML = `
    <div class="space-y-3.5 text-center max-w-lg w-full">
      <!-- Barra Superior de Nivel y Dificultad -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-amber-900/60 flex flex-wrap justify-between items-center gap-2 text-xs shadow-inner">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider text-[10px] border border-amber-500/40">
            Nivel <span id="simon-level-num">1</span> / ${totalLevels}
          </span>
          <span id="simon-difficulty-tag" class="text-slate-400 font-semibold">Secuencia: ${levelLengths[0]} destellos</span>
        </div>

        <!-- Indicador de Progreso Visual de Niveles -->
        <div class="flex items-center space-x-1.5" id="simon-level-gems">
          ${Array(totalLevels).fill(0).map((_, i) => `
            <span id="lvl-gem-${i + 1}" class="w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-800 transition-all duration-300"></span>
          `).join('')}
        </div>
      </div>

      <!-- Estado dinámico visual -->
      <div id="simon-status-card" class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-amber-300 transition-all shadow">
        👁️ Memoriza la secuencia de luces en las 8 terrazas
      </div>

      <!-- Grilla de 8 Botones (4 columnas x 2 filas) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="simon-grid">
        ${pads.map(p => `
          <button id="simon-btn-${p.id}" data-pad-id="${p.id}" class="simon-pad relative overflow-hidden bg-gradient-to-b ${p.color} border-2 ${p.border} h-24 rounded-2xl opacity-70 hover:opacity-90 transition-all flex flex-col items-center justify-center p-2 text-white shadow-lg select-none active:scale-95 group">
            <span class="absolute top-1.5 left-2 text-[9px] font-mono text-white/70 bg-black/40 px-1 rounded">[${p.key}]</span>
            <i class="${p.icon} text-lg mb-1 drop-shadow transition-transform group-hover:scale-110"></i>
            <span class="font-bold text-xs tracking-tight leading-tight">${p.name}</span>
            <span class="text-[9px] text-white/75 font-serif">${p.virtue}</span>
          </button>
        `).join('')}
      </div>

      <!-- Panel de Controles -->
      <div class="flex items-center justify-center gap-2.5 pt-1">
        <button id="simon-start-btn" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-transform active:scale-95 shadow-lg flex items-center space-x-2">
          <i class="fa-solid fa-play"></i>
          <span>Iniciar Nivel 1</span>
        </button>

        <button id="simon-replay-btn" class="hidden px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 transition-all active:scale-95 flex items-center space-x-1.5">
          <i class="fa-solid fa-eye text-amber-400"></i>
          <span>Repetir Muestra (<span id="replays-count">2</span>)</span>
        </button>
      </div>

      <p class="text-[11px] text-slate-500">Haz clic en los botones o presiona los números del 1 al 8 en tu teclado.</p>
    </div>
  `;

  function updateLevelGems() {
    for (let i = 1; i <= totalLevels; i++) {
      const gem = container.querySelector(`#lvl-gem-${i}`);
      if (gem) {
        if (i < currentLevel) {
          gem.className = 'w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-300 shadow-md scale-105';
        } else if (i === currentLevel) {
          gem.className = 'w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-300 shadow-md animate-pulse scale-125';
        } else {
          gem.className = 'w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-800';
        }
      }
    }
  }

  // Destello puramente visual (sin sonido)
  function flashPad(id, duration = 300) {
    const btn = container.querySelector(`#simon-btn-${id}`);
    if (!btn) return;

    btn.classList.remove('opacity-70');
    btn.classList.add('opacity-100', 'scale-105', 'ring-4', 'ring-white', 'brightness-125');
    btn.style.boxShadow = `0 0 30px ${pads[id].glow}`;

    setTimeout(() => {
      btn.classList.remove('opacity-100', 'scale-105', 'ring-4', 'ring-white', 'brightness-125');
      btn.style.boxShadow = '';
      btn.classList.add('opacity-70');
    }, duration);
  }

  function startLevel(lvl) {
    currentLevel = lvl;
    updateLevelGems();

    const targetLength = levelLengths[currentLevel - 1];
    const levelNumEl = container.querySelector('#simon-level-num');
    const diffTag = container.querySelector('#simon-difficulty-tag');
    const startBtn = container.querySelector('#simon-start-btn');
    const replayBtn = container.querySelector('#simon-replay-btn');
    const replaysCountEl = container.querySelector('#replays-count');

    if (levelNumEl) levelNumEl.innerText = currentLevel;
    if (diffTag) diffTag.innerText = `Secuencia: ${targetLength} destellos (Vel: ${currentLevel}x)`;
    if (startBtn) startBtn.classList.add('hidden');
    if (replayBtn) {
      replayBtn.classList.remove('hidden');
      if (replaysCountEl) replaysCountEl.innerText = replaysLeft;
      replayBtn.disabled = replaysLeft <= 0;
    }

    // Generar la secuencia completa para este nivel
    sequence = [];
    for (let i = 0; i < targetLength; i++) {
      sequence.push(Math.floor(Math.random() * 8));
    }

    playerSeq = [];
    playSequenceDemo();
  }

  function playSequenceDemo() {
    isShowingDemo = true;
    const statusCard = container.querySelector('#simon-status-card');
    if (statusCard) {
      statusCard.className = "p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-xs font-bold text-amber-300 animate-pulse";
      statusCard.innerHTML = `👁️ <strong>Observa:</strong> Secuencia de ${sequence.length} luces a velocidad ${currentLevel}x...`;
    }

    let idx = 0;
    const speed = levelSpeeds[currentLevel - 1];
    const flashDur = Math.max(160, speed * 0.65);

    const interval = setInterval(() => {
      if (idx >= sequence.length) {
        clearInterval(interval);
        isShowingDemo = false;
        if (statusCard) {
          statusCard.className = "p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-bold text-emerald-300";
          statusCard.innerHTML = `✨ <strong>¡Tu turno!</strong> Repite los ${sequence.length} destellos en orden (0 / ${sequence.length})`;
        }
        return;
      }
      flashPad(sequence[idx], flashDur);
      idx++;
    }, speed);
  }

  function handlePadClick(id) {
    if (isShowingDemo || sequence.length === 0) return;

    // Destello visual al pulsar
    flashPad(id, 200);
    playerSeq.push(id);

    const currentStep = playerSeq.length - 1;
    const statusCard = container.querySelector('#simon-status-card');

    // Error en la secuencia
    if (playerSeq[currentStep] !== sequence[currentStep]) {
      if (statusCard) {
        statusCard.className = "p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-xs font-bold text-red-200 animate-pulse";
        statusCard.innerHTML = `❌ <strong>Secuencia incorrecta:</strong> Ese no era el botón iluminado.`;
      }

      const startBtn = container.querySelector('#simon-start-btn');
      const replayBtn = container.querySelector('#simon-replay-btn');

      if (startBtn) {
        startBtn.classList.remove('hidden');
        startBtn.innerHTML = `<i class="fa-solid fa-rotate-right mr-1"></i> Reintentar Nivel ${currentLevel}`;
      }
      if (replayBtn) replayBtn.classList.add('hidden');

      sequence = [];
      return;
    }

    // Actualizar indicador de progreso en vivo
    if (statusCard) {
      statusCard.innerHTML = `✨ <strong>Progreso:</strong> Acierto ${playerSeq.length} de ${sequence.length}`;
    }

    // Acierto completo del nivel
    if (playerSeq.length === sequence.length) {
      if (currentLevel >= totalLevels) {
        // Victoria Total
        stateManager.markGameCompleted(4);
        setTimeout(() => {
          container.innerHTML = `
            <div class="text-center space-y-4">
              <i class="fa-solid fa-mountain-sun text-5xl text-amber-400 animate-bounce"></i>
              <h3 class="font-cinzel text-2xl font-bold text-white">¡Maestro de las 8 Terrazas!</h3>
              <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
                Has completado con éxito los ${totalLevels} niveles de memoria visual, superando la secuencia máxima de ${levelLengths[totalLevels - 1]} luces en las 8 terrazas del Purgatorio.
              </p>
              <button id="retry-g4-win" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
                <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
              </button>
            </div>
          `;
          container.querySelector('#retry-g4-win').addEventListener('click', () => {
            restartGame(4);
          });
        }, 500);
      } else {
        // Siguiente Nivel
        if (statusCard) {
          statusCard.className = "p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-xs font-bold text-emerald-200";
          statusCard.innerHTML = `🌟 ¡Nivel ${currentLevel} Superado! Preparando Nivel ${currentLevel + 1} (${levelLengths[currentLevel]} destellos más rápidos)...`;
        }
        setTimeout(() => {
          startLevel(currentLevel + 1);
        }, 1200);
      }
    }
  }

  // Evento Botón Comenzar
  container.querySelector('#simon-start-btn').addEventListener('click', () => {
    replaysLeft = 2;
    startLevel(currentLevel || 1);
  });

  // Evento Botón Reescucha / Repetir Muestra
  container.querySelector('#simon-replay-btn').addEventListener('click', () => {
    if (isShowingDemo || sequence.length === 0 || replaysLeft <= 0) return;
    replaysLeft--;
    const replaysCountEl = container.querySelector('#replays-count');
    const replayBtn = container.querySelector('#simon-replay-btn');
    if (replaysCountEl) replaysCountEl.innerText = replaysLeft;
    if (replayBtn && replaysLeft <= 0) replayBtn.disabled = true;

    playerSeq = [];
    playSequenceDemo();
  });

  // Clic en los pads
  container.querySelectorAll('.simon-pad').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-pad-id'), 10);
      handlePadClick(id);
    });
  });

  // Atajos de Teclado (1 al 8)
  function handleSimonKey(e) {
    if (isShowingDemo || sequence.length === 0) return;
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      e.preventDefault();
      handlePadClick(num - 1);
    }
  }

  window.onkeydown = handleSimonKey;
  document.onkeydown = handleSimonKey;

  updateLevelGems();
}
