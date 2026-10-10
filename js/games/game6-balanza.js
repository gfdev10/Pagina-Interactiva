/**
 * Juego 6: Balanza de las Virtudes (El Purgatorio)
 * Versión Mejorada: Peso de Soberbia aleatorio entre 10 y 25, inclinación física animada
 * de la balanza, historial de virtudes colocadas, botón de deshacer y equilibrio exacto.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame6(container, restartGame) {
  // Generar peso aleatorio de la Soberbia entre 10 y 25 (inclusive)
  function getRandomTarget() {
    return Math.floor(Math.random() * (25 - 10 + 1)) + 10;
  }

  let targetWeight = getRandomTarget();
  let rightWeight = 0;
  let addedVirtues = []; // Historial para permitir deshacer o ver qué se colocó

  const weights = [
    { val: 1, name: "Humildad (+1)", icon: "fa-solid fa-seedling", color: "text-emerald-400" },
    { val: 3, name: "Generosidad (+3)", icon: "fa-solid fa-hand-holding-heart", color: "text-amber-400" },
    { val: 5, name: "Paciencia (+5)", icon: "fa-solid fa-hourglass-half", color: "text-sky-400" },
    { val: 7, name: "Templanza (+7)", icon: "fa-solid fa-shield-heart", color: "text-purple-400" }
  ];

  function render() {
    // Calcular ángulo de inclinación de la balanza (-18° a +18°)
    const diff = targetWeight - rightWeight;
    const tiltAngle = Math.max(-16, Math.min(16, diff * 1.8));

    container.innerHTML = `
      <div class="space-y-4 max-w-md w-full text-center">
        <!-- Indicaciones y Objetivo Aleatorio -->
        <div class="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/50 shadow-inner space-y-1">
          <p class="text-xs text-slate-300">
            Equilibra la balanza agregando virtudes hasta igualar el peso de la <strong class="text-red-400">Soberbia</strong>.
          </p>
          <div class="inline-block px-3 py-1 bg-red-950/60 border border-red-800/80 rounded-full text-xs font-bold text-red-300">
            Peso del Pecado: <span class="text-white text-sm font-black">${targetWeight}</span> unidades
          </div>
        </div>
        
        <!-- Balanza Animada -->
        <div class="relative bg-slate-950 p-6 rounded-2xl border border-amber-900/60 shadow-2xl overflow-hidden">
          
          <!-- Brazo de la balanza con inclinación dinámica -->
          <div class="relative mx-auto max-w-[280px] h-28 flex flex-col items-center justify-between">
            <!-- Eje central -->
            <div class="w-3 h-16 bg-gradient-to-b from-amber-600 to-amber-950 rounded-full shadow-lg z-0"></div>

            <!-- Viga transversal pivotante -->
            <div class="absolute top-2 w-full h-2.5 bg-amber-500 rounded-full shadow-md transition-transform duration-500 ease-out flex justify-between items-center px-1"
                 style="transform: rotate(${tiltAngle}deg);">
              <!-- Plato Izquierdo (Soberbia) -->
              <div class="w-3.5 h-3.5 bg-red-500 rounded-full shadow-md"></div>
              <!-- Pivote central -->
              <div class="w-4 h-4 bg-white rounded-full shadow"></div>
              <!-- Plato Derecho (Virtudes) -->
              <div class="w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-md"></div>
            </div>

            <!-- Platos y Pesos -->
            <div class="w-full flex justify-between items-end z-10 pt-2">
              
              <!-- Platillo Izquierdo (Pecado) -->
              <div class="w-28 text-center bg-red-950/40 p-3 rounded-xl border border-red-800/50 transition-transform duration-500"
                   style="transform: translateY(${tiltAngle * 0.8}px);">
                <i class="fa-solid fa-weight-hanging text-3xl text-red-500 animate-pulse"></i>
                <p class="text-[11px] text-red-300 font-bold mt-1">Soberbia</p>
                <p class="text-2xl font-black text-red-400">${targetWeight}</p>
              </div>

              <!-- Indicador central de equilibrio -->
              <div class="flex flex-col items-center pb-2">
                <span class="text-[11px] font-bold ${rightWeight === targetWeight ? 'text-emerald-400' : 'text-slate-400'}">
                  ${rightWeight === targetWeight ? '✨ ¡EN EQUILIBRIO!' : `${rightWeight} / ${targetWeight}`}
                </span>
                <span class="text-[10px] text-slate-500">
                  ${rightWeight < targetWeight ? `Faltan ${targetWeight - rightWeight}` : (rightWeight > targetWeight ? `Exceso: +${rightWeight - targetWeight}` : 'Perfecto')}
                </span>
              </div>

              <!-- Platillo Derecho (Virtudes) -->
              <div class="w-28 text-center ${rightWeight === targetWeight ? 'bg-emerald-950/60 border-emerald-500' : 'bg-slate-900/80 border-slate-700'} p-3 rounded-xl border transition-all duration-500"
                   style="transform: translateY(${-tiltAngle * 0.8}px);">
                <i class="fa-solid fa-feather text-3xl ${rightWeight === targetWeight ? 'text-amber-400' : 'text-emerald-400'}"></i>
                <p class="text-[11px] text-emerald-300 font-bold mt-1">Virtudes</p>
                <p class="text-2xl font-black ${rightWeight === targetWeight ? 'text-amber-400' : 'text-emerald-400'}">${rightWeight}</p>
              </div>

            </div>
          </div>

          <!-- Historial de Virtudes en el Plato -->
          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Virtudes agregadas:</span>
            <div class="flex flex-wrap gap-1 justify-end max-w-[200px]">
              ${addedVirtues.length > 0 ? addedVirtues.map(v => `
                <span class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-amber-300">+${v}</span>
              `).join('') : '<span class="text-slate-600 italic">Ninguna</span>'}
            </div>
          </div>
        </div>

        <div id="scale-alert" class="hidden text-xs p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200"></div>

        <!-- Botones de Virtudes -->
        <div class="grid grid-cols-2 gap-2.5">
          ${weights.map(w => `
            <button data-weight-val="${w.val}" class="btn-virtue p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all active:scale-95 flex items-center justify-center space-x-2 shadow hover:border-amber-500">
              <i class="${w.icon} ${w.color} text-base"></i>
              <span>${w.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Opciones de Reinicio y Deshacer -->
        <div class="flex justify-center items-center gap-2 pt-1">
          <button id="undo-scale-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5">
            <i class="fa-solid fa-arrow-rotate-left text-amber-400"></i>
            <span>Deshacer Último</span>
          </button>
          <button id="reset-scale-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5">
            <i class="fa-solid fa-trash text-red-400"></i>
            <span>Vaciar Balanza</span>
          </button>
          <button id="new-weight-btn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5">
            <i class="fa-solid fa-dice text-amber-400"></i>
            <span>Otro Peso</span>
          </button>
        </div>
      </div>
    `;

    // Conectar clics a botones de virtudes
    container.querySelectorAll('.btn-virtue').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-weight-val'), 10);
        addWeight(val);
      });
    });

    // Botón Deshacer
    container.querySelector('#undo-scale-btn').addEventListener('click', undoLastWeight);

    // Botón Vaciar
    container.querySelector('#reset-scale-btn').addEventListener('click', resetScale);

    // Botón Nuevo Peso Aleatorio
    container.querySelector('#new-weight-btn').addEventListener('click', generateNewTarget);
  }

  function addWeight(val) {
    audioManager.playSound('click');
    rightWeight += val;
    addedVirtues.push(val);

    if (rightWeight === targetWeight) {
      stateManager.markGameCompleted(6);
      render();
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-scale-balanced text-5xl text-amber-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Balanza en Perfecto Equilibrio!</h3>
            <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
              Has contrarrestado el peso de <span class="text-amber-400 font-bold">${targetWeight}</span> de la Soberbia combinando exactamente las virtudes purificadoras.
            </p>
            <div class="flex flex-wrap gap-2 justify-center pt-2">
              <button id="retry-g6-btn" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center space-x-1.5">
                <i class="fa-solid fa-dice"></i>
                <span>Probar con otro Peso Aleatorio</span>
              </button>
            </div>
          </div>
        `;
        container.querySelector('#retry-g6-btn').addEventListener('click', () => {
          restartGame(6);
        });
      }, 500);
    } else if (rightWeight > targetWeight) {
      audioManager.playSound('error');
      const alertEl = container.querySelector('#scale-alert');
      if (alertEl) {
        alertEl.classList.remove('hidden');
        alertEl.innerText = `¡Te pasaste de peso (${rightWeight} > ${targetWeight})! Se reinicia la balanza para intentar una nueva combinación.`;
      }
      setTimeout(() => {
        rightWeight = 0;
        addedVirtues = [];
        render();
      }, 1200);
    } else {
      render();
    }
  }

  function undoLastWeight() {
    if (addedVirtues.length > 0) {
      audioManager.playClick();
      const removed = addedVirtues.pop();
      rightWeight = Math.max(0, rightWeight - removed);
      render();
    }
  }

  function resetScale() {
    audioManager.playClick();
    rightWeight = 0;
    addedVirtues = [];
    render();
  }

  function generateNewTarget() {
    audioManager.playSound('click');
    targetWeight = getRandomTarget();
    rightWeight = 0;
    addedVirtues = [];
    render();
  }

  render();
}
