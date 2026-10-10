/**
 * Enrutador y gestor de navegación entre vistas (Home, Juego, Certificado)
 */
import { stateManager } from './state.js';
import { audioManager } from './audio.js';

class Router {
  constructor() {
    this.currentView = 'home';
  }

  init() {
    // Initial view setup
    this.switchTab('home', false);
  }

  switchTab(tabName, playClickSound = true) {
    stateManager.clearGameLoops();

    if (playClickSound) {
      audioManager.playSound('click');
    }

    const views = {
      home: document.getElementById('view-home'),
      game: document.getElementById('view-game'),
      certificate: document.getElementById('view-certificate')
    };

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.add('hidden');
      }
    });

    if (views[tabName]) {
      views[tabName].classList.remove('hidden');
      this.currentView = tabName;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getCurrentView() {
    return this.currentView;
  }
}

export const router = new Router();
