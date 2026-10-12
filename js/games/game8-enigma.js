/**
 * Juego 8: Enigma Rosa Creadora (El Paraíso) - Versión Multivel con Pistas
 * 3 Enigmas de la Rosa Mística de La Divina Comedia con:
 * - Sistema de pistas literarias y botón de "Pétalo de Luz" para desvelar letras.
 * - Soporte para teclado físico (A-Z) y teclado virtual completo.
 * - Separación visual de palabras y 3 niveles progresivos.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame8(container, restartGame) {
  const TOTAL_LEVELS = 3;

  const enigmas = [
    {
      level: 1,
      title: "Pétalo I: La Fuerza Suprema",
      phrase: "EL AMOR MUEVE EL SOL Y LAS ESTRELLAS",
      hints: [
        "Habla de la fuerza cósmica suprema que rige todo el universo dantesco.",
        "Es el célebre verso final con el que concluye la Divina Comedia (Canto XXXIII)."
      ],
      authorNote: "«L'amor che move il sole e l'altre stelle»"
    },
    {
      level: 2,
      title: "Pétalo II: La Guía Celestial",
      phrase: "BEATRIZ GUIA A DANTE HASTA LA LUZ SUPREMA",
      hints: [
        "Menciona a la amada florentina que tomó el relevo del poeta Virgilio.",
        "Simboliza la gracia divina y la fe revelada conduciendo al poeta al Empíreo."
      ],
      authorNote: "«La donna mia, che mi vedeva al suo piacer beato»"
    },
    {
      level: 3,
      title: "Pétalo III: La Visión de la Trinidad",
      phrase: "TRES CIRCULOS DE UN MISMO COLOR Y RESPLANDOR",
      hints: [
        "Describe la misteriosa visión geométrica de tres anillos de luz.",
        "Representa la Santísima Trinidad en el centro de la Rosa Mística."
      ],
      authorNote: "«Tre giri di tre colori e d'una contenenza»"
    }
  ];

  let currentLevelIdx = 0;
  let currentPhrase = "";
  let revealedChars = [];
  let maskedChars = [];
  let guessedLetters = new Set();
  let hintsRevealed = 0;
  let freeLettersLeft = 2; // "Pétalo de Luz" desvela 1 letra al azar

  function loadLevel(idx) {
    currentLevelIdx = idx;
    const item = enigmas[currentLevelIdx];
    currentPhrase = item.phrase;
    revealedChars = currentPhrase.split('');
    maskedChars = revealedChars.map(c => (c === ' ' ? ' ' : '_'));
    guessedLetters.clear();
    hintsRevealed = 0;
    freeLettersLeft = 2;

    render();
  }

  function render() {
    const item = enigmas[currentLevelIdx];
    const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('');

    // Separar por palabras para que se lea ordenado y natural
    const words = currentPhrase.split(' ');
    let charOffset = 0;

    const wordsHtml = words.map(w => {
      const lettersInWord = w.split('').map((letterChar) => {
        const index = charOffset;
        charOffset++;
        const currentLetter = maskedChars[index];
        const isRevealed = currentLetter !== '_';
        return `
          <span id="char-slot-${index}" class="w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center font-bold text-base sm:text-lg border-b-2 ${
            isRevealed ? 'border-sky-400 text-sky-200 bg-sky-950/40 rounded-t-lg' : 'border-slate-600 text-transparent'
          } transition-all">
            ${isRevealed ? currentLetter : '_'}
          </span>
        `;
      }).join('');

      charOffset++; // Por el espacio entre palabras
      return `<div class="flex gap-1 justify-center">${lettersInWord}</div>`;
    }).join('');

    container.innerHTML = `
      <div class="space-y-4 max-w-lg w-full text-center">
        <!-- Barra de Progreso y Nivel -->
        <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-900/60 shadow-inner flex flex-wrap justify-between items-center text-xs gap-2">
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-700 text-sky-300 font-bold text-[11px] uppercase">
              Enigma ${currentLevelIdx + 1} / ${TOTAL_LEVELS}
            </span>
            <span class="text-slate-300 font-semibold">${item.title}</span>
          </div>

          <!-- Botón Pétalo de Luz (Ayuda) -->
          <button id="btn-reveal-letter" class="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 active:scale-95 ${freeLettersLeft <= 0 ? 'opacity-40 cursor-not-allowed' : ''}">
            <i class="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
            <span>Pétalo de Luz (${freeLettersLeft})</span>
          </button>
        </div>

        <p class="text-xs text-slate-400">
          Descifra el verso místico seleccionando las letras correctas:
        </p>

        <!-- Contenedor del Criptograma de la Rosa -->
        <div class="p-4 sm:p-5 bg-slate-950/90 border border-sky-900 rounded-2xl flex flex-wrap justify-center gap-x-4 gap-y-3 font-mono shadow-2xl">
          ${wordsHtml}
        </div>

        <!-- Caja de Pistas Desplegables -->
        <div class="space-y-2">
          <div class="flex justify-between items-center px-1">
            <button id="btn-request-hint" class="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 transition-colors">
              <i class="fa-solid fa-lightbulb text-amber-400"></i>
              <span>${hintsRevealed < item.hints.length ? 'Pedir Pista Literaria (' + (item.hints.length - hintsRevealed) + ' disponibles)' : 'Todas las pistas reveladas'}</span>
            </button>
          </div>

          <div id="hints-display-area" class="space-y-1.5 text-left text-xs ${hintsRevealed === 0 ? 'hidden' : ''}">
            ${item.hints.slice(0, hintsRevealed).map((h, i) => `
              <div class="p-2.5 bg-sky-950/60 border border-sky-800/80 rounded-xl text-sky-200 flex items-start space-x-2">
                <i class="fa-solid fa-feather text-amber-400 mt-0.5"></i>
                <span><strong>Pista ${i + 1}:</strong> ${h}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Teclado Virtual Completo -->
        <div class="grid grid-cols-7 sm:grid-cols-9 gap-1.5 pt-1" id="letters-keyboard">
          ${alphabet.map(l => {
            const isUsed = guessedLetters.has(l);
            return `
              <button data-letter="${l}" ${isUsed ? 'disabled' : ''} class="vk-btn p-2 rounded-lg text-xs font-bold transition-all ${
                isUsed
                  ? 'bg-slate-950 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-100 shadow hover:border-sky-500'
              }">
                ${l}
              </button>
            `;
          }).join('')}
        </div>

        <p class="text-[11px] text-slate-500">Puedes hacer clic en las letras o teclearlas directamente en tu teclado físico.</p>
      </div>
    `;

    // Conectar botones del teclado virtual
    container.querySelectorAll('.vk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.getAttribute('data-letter');
        if (l && !guessedLetters.has(l)) {
          guessLetter(l);
        }
      });
    });

    // Conectar botón Pedir Pista
    const hintBtn = container.querySelector('#btn-request-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (hintsRevealed < item.hints.length) {
          hintsRevealed++;
          audioManager.playSound('click');
          render();
        }
      });
    }

    // Conectar botón Pétalo de Luz (Revelar letra aleatoria)
    const revealBtn = container.querySelector('#btn-reveal-letter');
    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        if (freeLettersLeft > 0) {
          revealRandomLetter();
        }
      });
    }

    // Soporte para teclado físico
    window.onkeydown = handlePhysicalKey;
    document.onkeydown = null;
  }

  function guessLetter(letter) {
    if (guessedLetters.has(letter)) return;
    guessedLetters.add(letter);

    let hit = false;
    revealedChars.forEach((c, idx) => {
      if (c === letter) {
        maskedChars[idx] = letter;
        hit = true;
      }
    });

    if (hit) {
      audioManager.playSound('success');
    } else {
      audioManager.playSound('click');
    }

    // Comprobar si se completó la frase
    if (!maskedChars.includes('_')) {
      handleLevelWin();
    } else {
      render();
    }
  }

  function revealRandomLetter() {
    const unrevealedLetters = [];
    revealedChars.forEach(c => {
      if (c !== ' ' && !guessedLetters.has(c)) {
        if (!unrevealedLetters.includes(c)) {
          unrevealedLetters.push(c);
        }
      }
    });

    if (unrevealedLetters.length > 0) {
      freeLettersLeft--;
      audioManager.playSound('success');
      const randomChar = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
      guessLetter(randomChar);
    }
  }

  function handlePhysicalKey(e) {
    const key = e.key.toUpperCase();
    // Validar letra española A-Z y Ñ
    if (/^[A-ZÑ]$/.test(key) && !guessedLetters.has(key)) {
      e.preventDefault();
      guessLetter(key);
    }
  }

  function handleLevelWin() {
    audioManager.playSuccess();
    const item = enigmas[currentLevelIdx];

    if (currentLevelIdx < TOTAL_LEVELS - 1) {
      // Avanzar al siguiente nivel
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4 max-w-md w-full">
            <i class="fa-solid fa-rose text-5xl text-sky-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Enigma ${currentLevelIdx + 1} Revelado!</h3>
            <p class="text-slate-300 text-sm font-semibold italic">«${currentPhrase}»</p>
            <p class="text-xs text-amber-400 font-serif">${item.authorNote}</p>
            <p class="text-xs text-slate-400">Has desvelado este pétalo celestial. Prepárate para el siguiente misterio.</p>
            <button id="btn-next-enigma" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg">
              <span>Avanzar al Enigma ${currentLevelIdx + 2}</span>
              <i class="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        `;
        container.querySelector('#btn-next-enigma').addEventListener('click', () => {
          loadLevel(currentLevelIdx + 1);
        });
      }, 400);
    } else {
      // Victoria final tras los 3 enigmas
      stateManager.markGameCompleted(8);
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4 max-w-md w-full">
            <i class="fa-solid fa-crown text-5xl text-amber-400 animate-bounce"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡La Rosa Mística ha Florecido!</h3>
            <p class="text-slate-300 text-sm leading-relaxed">
              Has descifrado los 3 enigmas sagrados de la Cándida Rosa en el Empíreo y contemplado la sabiduría de la luz eterna.
            </p>
            <button id="retry-g8-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
              <i class="fa-solid fa-rotate-right mr-1"></i> Jugar los 3 Enigmas de nuevo
            </button>
          </div>
        `;
        container.querySelector('#retry-g8-btn').addEventListener('click', () => {
          restartGame(8);
        });
      }, 400);
    }
  }

  // Iniciar en el Nivel 1
  loadLevel(0);
}
