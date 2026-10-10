/**
 * Juego 5: Escalada en Plataformas 2D (El Purgatorio)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame5(container, restartGame) {
  container.innerHTML = `
    <div class="space-y-3 text-center">
      <p class="text-xs text-slate-400">Salta entre las cornisas con las FLECHAS o botones para juntar las 7 marcas "P".</p>
      <canvas id="plat-canvas" width="320" height="320" class="bg-slate-950 border-2 border-amber-900 rounded-2xl mx-auto shadow-inner"></canvas>
      <div class="flex justify-center space-x-2">
        <button id="plat-btn-left" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-transform"><i class="fa-solid fa-arrow-left"></i> Izq</button>
        <button id="plat-btn-jump" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition-transform"><i class="fa-solid fa-arrow-up"></i> Saltar</button>
        <button id="plat-btn-right" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-transform">Der <i class="fa-solid fa-arrow-right"></i></button>
      </div>
      <p class="text-[11px] text-slate-500">Usa las flechas del teclado o la barra espaciadora para saltar.</p>
    </div>
  `;

  const canvas = container.querySelector('#plat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let player = { x: 150, y: 260, vx: 0, vy: 0, radius: 10, grounded: true };
  let psCollected = 0;
  const totalPs = 7;

  const platforms = [
    { x: 30, y: 290, w: 260, h: 10 },
    { x: 40, y: 220, w: 80, h: 10 },
    { x: 190, y: 170, w: 80, h: 10 },
    { x: 60, y: 110, w: 80, h: 10 },
    { x: 180, y: 60, w: 80, h: 10 }
  ];

  let items = [
    { x: 80, y: 195, active: true },
    { x: 220, y: 145, active: true },
    { x: 100, y: 85, active: true },
    { x: 220, y: 35, active: true },
    { x: 160, y: 265, active: true },
    { x: 50, y: 265, active: true },
    { x: 250, y: 265, active: true }
  ];

  function jump(dir) {
    if (dir === 0 && player.grounded) {
      player.vy = -7.5;
      player.grounded = false;
      audioManager.playClick();
    } else if (dir !== 0) {
      player.vx = dir * 3.5;
    }
  }

  container.querySelector('#plat-btn-left').addEventListener('click', () => jump(-1));
  container.querySelector('#plat-btn-right').addEventListener('click', () => jump(1));
  container.querySelector('#plat-btn-jump').addEventListener('click', () => jump(0));

  document.onkeydown = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); jump(-1); }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); jump(1); }
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') { e.preventDefault(); jump(0); }
  };

  const loop = setInterval(() => {
    // Physics
    player.vy += 0.35; // Gravity
    player.x += player.vx;
    player.y += player.vy;
    player.vx *= 0.82; // Friction

    // Bounds
    if (player.x < 10) player.x = 10;
    if (player.x > 310) player.x = 310;

    // Platform collisions
    player.grounded = false;
    platforms.forEach(p => {
      if (player.x > p.x && player.x < p.x + p.w && player.y + 10 >= p.y && player.y + 10 <= p.y + p.h + 6 && player.vy >= 0) {
        player.y = p.y - 10;
        player.vy = 0;
        player.grounded = true;
      }
    });

    // Items collision
    items.forEach(it => {
      if (it.active && Math.hypot(player.x - it.x, player.y - it.y) < 18) {
        it.active = false;
        psCollected++;
        audioManager.playSound('success');
      }
    });

    // Draw
    ctx.clearRect(0, 0, 320, 320);

    // Platforms
    ctx.fillStyle = '#78350f';
    platforms.forEach(p => {
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(p.x, p.y, p.w, p.h, 4) : ctx.rect(p.x, p.y, p.w, p.h);
      ctx.fill();
    });

    // Items ("P")
    items.forEach(it => {
      if (it.active) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('P', it.x - 5, it.y + 5);
      }
    });

    // Player
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // UI inside canvas
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Marcas P: ${psCollected} / ${totalPs}`, 10, 20);

    if (psCollected >= totalPs) {
      stateManager.clearGameLoops();
      stateManager.markGameCompleted(5);
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-mountain-sun text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Cima Alcanzada!</h3>
          <p class="text-slate-300 text-sm">Has borrado las 7 marcas "P" de la frente de Dante al subir las cornisas.</p>
          <button id="retry-g5-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
            <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g5-btn').addEventListener('click', () => {
        restartGame(5);
      });
    }
  }, 1000 / 40);

  stateManager.setLoopInterval(loop);
}
