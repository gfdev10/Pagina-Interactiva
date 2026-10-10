/**
 * Juego 7: Vuelo por la Esfera Celeste (El Paraíso)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame7(container, restartGame) {
  const targetStars = 10;
  let starsCollected = 0;

  container.innerHTML = `
    <div class="space-y-3 text-center">
      <p class="text-xs text-slate-400">Guía el alma de Dante (✨) con el ratón o tu dedo para atrapar 10 estrellas sin chocar con cometas (☄️).</p>
      <canvas id="flight-canvas" width="320" height="320" class="bg-slate-950 border-2 border-sky-900 rounded-2xl mx-auto shadow-inner cursor-crosshair"></canvas>
      <p class="text-[11px] text-slate-500">Mueve el cursor dentro del recuadro cósmico.</p>
    </div>
  `;

  const canvas = container.querySelector('#flight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let ship = { x: 160, y: 160 };
  let star = { x: 80, y: 80 };
  let hazard = { x: 240, y: 240, vx: 2.2, vy: 1.6 };

  function updateStar() {
    star.x = Math.random() * 260 + 30;
    star.y = Math.random() * 260 + 30;
  }

  function handleMove(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ship.x = Math.max(10, Math.min(310, clientX - rect.left));
    ship.y = Math.max(10, Math.min(310, clientY - rect.top));
  }

  canvas.onmousemove = function(e) {
    handleMove(e.clientX, e.clientY);
  };

  canvas.ontouchmove = function(e) {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const loop = setInterval(() => {
    // Hazard movement
    hazard.x += hazard.vx;
    hazard.y += hazard.vy;
    if (hazard.x < 20 || hazard.x > 300) hazard.vx *= -1;
    if (hazard.y < 20 || hazard.y > 300) hazard.vy *= -1;

    // Collision Star
    if (Math.hypot(ship.x - star.x, ship.y - star.y) < 22) {
      starsCollected++;
      audioManager.playSound('success');
      updateStar();
    }

    // Collision Hazard
    if (Math.hypot(ship.x - hazard.x, ship.y - hazard.y) < 22) {
      audioManager.playSound('error');
      starsCollected = Math.max(0, starsCollected - 1);
      hazard.x = 20;
      hazard.y = 20;
    }

    // Draw
    ctx.clearRect(0, 0, 320, 320);

    // Cosmic background star dust
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(50, 40, 2, 2);
    ctx.fillRect(200, 80, 2, 2);
    ctx.fillRect(120, 220, 2, 2);
    ctx.fillRect(270, 260, 2, 2);

    // Draw Star
    ctx.font = '22px serif';
    ctx.fillText('🌟', star.x - 11, star.y + 8);

    // Draw Hazard
    ctx.font = '22px serif';
    ctx.fillText('☄️', hazard.x - 11, hazard.y + 8);

    // Draw Ship (Soul)
    ctx.font = '24px serif';
    ctx.fillText('✨', ship.x - 12, ship.y + 8);

    // UI inside canvas
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Estrellas Celestes: ${starsCollected} / ${targetStars}`, 10, 20);

    if (starsCollected >= targetStars) {
      stateManager.clearGameLoops();
      stateManager.markGameCompleted(7);
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-sun text-5xl text-sky-400 animate-spin"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Vuelo Celestial Completado!</h3>
          <p class="text-slate-300 text-sm">Has atravesado las esferas del firmamento juntando la luz estelar.</p>
          <button id="retry-g7-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
            <i class="fa-solid fa-rotate-right mr-1"></i> Volar de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g7-btn').addEventListener('click', () => {
        restartGame(7);
      });
    }
  }, 1000 / 40);

  stateManager.setLoopInterval(loop);
}
