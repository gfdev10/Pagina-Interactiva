/**
 * Gestor y Despachador de Minijuegos (Game Manager)
 * Centraliza la carga dinámica, títulos, limpieza y ciclo de vida de los 10 juegos.
 */
import { router } from '../core/router.js';
import { stateManager } from '../core/state.js';
import { audioManager } from '../core/audio.js';

import { initGame1 } from './game1-trivia.js';
import { initGame2 } from './game2-memotest.js';
import { initGame3 } from './game3-laberinto.js';
import { initGame4 } from './game4-simon.js';
import { initGame5 } from './game5-plataformas.js';
import { initGame6 } from './game6-balanza.js';
import { initGame7 } from './game7-vuelo.js';
import { initGame8 } from './game8-enigma.js';
import { initGame9 } from './game9-anillos.js';

class GameManager {
  constructor() {
    this.gamesRegistry = {
      1: { title: "Juego 1: Trivia Dantesca", init: initGame1 },
      2: { title: "Juego 2: Memotest de Palabras", init: initGame2 },
      3: { title: "Juego 3: Laberinto de Minos", init: initGame3 },
      4: { title: "Juego 4: Luces del Purgatorio (Simon 8)", init: initGame4 },
      5: { title: "Juego 5: Escalada en Plataformas 2D", init: initGame5 },
      6: { title: "Juego 6: Balanza de las Virtudes", init: initGame6 },
      7: { title: "Juego 7: Vuelo por la Esfera Celeste", init: initGame7 },
      8: { title: "Juego 8: Enigma Rosa Creadora", init: initGame8 },
      9: { title: "Juego 9: Vuelo al Empíreo (Flappy Bird)", init: initGame9 }
    };
  }

  launchGame(gameNum) {
    stateManager.clearGameLoops();
    audioManager.playSound('click');
    stateManager.setActiveGame(gameNum);

    router.switchTab('game', false);

    const stage = document.getElementById('game-stage');
    const titleEl = document.getElementById('game-title-display');

    if (!stage || !titleEl) return;

    stage.innerHTML = '';
    const game = this.gamesRegistry[gameNum];

    if (game) {
      titleEl.innerText = game.title;
      // Iniciar el juego pasando el contenedor y una función para reiniciar
      game.init(stage, (id) => this.launchGame(id));
    } else {
      stage.innerHTML = `<p class="text-slate-400">Juego no encontrado.</p>`;
    }
  }
}

export const gameManager = new GameManager();
