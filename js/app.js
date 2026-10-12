/**
 * DANTE 2.0 - Aplicación Principal (Entrypoint)
 * Inicializa servicios, router, componentes y enlaces de interfaz.
 */
import { router } from './core/router.js';
import { initHeader } from './components/header.js';
import { initReinosList } from './components/reinosList.js';
import { initCertificate } from './components/certificate.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes
  initHeader();
  initReinosList();
  initCertificate();
  router.init();

  // Enlaces de la vista Home (Hero)
  const heroExploreBtn = document.getElementById('hero-explore-btn');
  const heroTreeBtn = document.getElementById('hero-tree-btn');
  const heroCertBtn = document.getElementById('hero-cert-btn');
  const gameBackBtn = document.getElementById('game-back-btn');

  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', () => {
      const section = document.getElementById('reinos-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (heroTreeBtn) {
    heroTreeBtn.addEventListener('click', () => {
      // Abre arbol.html en nueva pestaña
    });
  }

  if (heroCertBtn) {
    heroCertBtn.addEventListener('click', () => {
      router.switchTab('certificate');
    });
  }

  if (gameBackBtn) {
    gameBackBtn.addEventListener('click', () => {
      router.switchTab('home');
    });
  }
});
