/**
 * Juego 3: Laberinto de Minos (El Infierno)
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame3(container, restartGame) {
  container.innerHTML = `
    <div class="space-y-4 text-center">
      <p class="text-xs text-slate-400">Junta las 3 antorchas (🔥) para escapar sin ser atrapado por Minos (👹).</p>
      <div class="relative inline-block">
        <canvas id="laberinto-canvas" width="300" height="300" class="bg-slate-950 border-2 border-red-900 rounded-xl mx-auto shadow-inner"></canvas>
      </div>
      <div class="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        <div></div>
        <button id="btn-lab-up" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg text-slate-200 transition-transform"><i class="fa-solid fa-arrow-up"></i></button>
        <div></div>
        <button id="btn-lab-left" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg text-slate-200 transition-transform"><i class="fa-solid fa-arrow-left"></i></button>
        <button id="btn-lab-down" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg text-slate-200 transition-transform"><i class="fa-solid fa-arrow-down"></i></button>
        <button id="btn-lab-right" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg text-slate-200 transition-transform"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
      <p class="text-[11px] text-slate-500">Usa los botones o las teclas de flechas del teclado.</p>
    </div>
  `;

  const canvas = container.querySelector('#laberinto-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let player = { x: 0, y: 0 };
  let minos = { x: 4, y: 4 };
  let items = [{ x: 1, y: 3 }, { x: 3, y: 1 }, { x: 4, y: 0 }];
  let collected = 0;
  let isGameOver = false;

  function draw() {
    ctx.clearRect(0, 0, 300, 300);
    const sz = 60;

    // Grid guide lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(i * sz, 0);
      ctx.lineTo(i * sz, 300);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * sz);
      ctx.lineTo(300, i * sz);
      ctx.stroke();
    }

    // Torches
    items.forEach(it => {
      ctx.font = '24px serif';
      ctx.fillText('🔥', it.x * sz + 16, it.y * sz + 38);
    });

    // Minos
    ctx.font = '26px serif';
    ctx.fillText('👹', minos.x * sz + 14, minos.y * sz + 40);

    // Player
    ctx.font = '26px serif';
    ctx.fillText('🚶', player.x * sz + 14, player.y * sz + 40);
  }

  function move(dx, dy) {
    if (isGameOver) return;

    const nx = Math.max(0, Math.min(4, player.x + dx));
    const ny = Math.max(0, Math.min(4, player.y + dy));
    player.x = nx;
    player.y = ny;

    items = items.filter(it => {
      if (it.x === player.x && it.y === player.y) {
        collected++;
        audioManager.playSound('success');
        return false;
      }
      return true;
    });

    // Minos AI
    if (Math.random() > 0.35) {
      if (minos.x < player.x) minos.x++;
      else if (minos.x > player.x) minos.x--;
      else if (minos.y < player.y) minos.y++;
      else if (minos.y > player.y) minos.y--;
    }

    draw();

    if (player.x === minos.x && player.y === minos.y) {
      audioManager.playSound('error');
      player = { x: 0, y: 0 };
      minos = { x: 4, y: 4 };
      items = [{ x: 1, y: 3 }, { x: 3, y: 1 }, { x: 4, y: 0 }];
      collected = 0;
      draw();
    } else if (collected === 3) {
      isGameOver = true;
      stateManager.markGameCompleted(3);
      setTimeout(() => {
        container.innerHTML = `
          <div class="text-center space-y-4">
            <i class="fa-solid fa-dungeon text-5xl text-amber-400"></i>
            <h3 class="font-cinzel text-2xl font-bold text-white">¡Escapaste del Laberinto!</h3>
            <p class="text-slate-300 text-sm">Conseguiste todas las antorchas y evadiste a Minos.</p>
            <button id="retry-g3-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
            </button>
          </div>
        `;
        container.querySelector('#retry-g3-btn').addEventListener('click', () => {
          restartGame(3);
        });
      }, 300);
    }
  }

  // Bind Buttons
  container.querySelector('#btn-lab-up').addEventListener('click', () => move(0, -1));
  container.querySelector('#btn-lab-down').addEventListener('click', () => move(0, 1));
  container.querySelector('#btn-lab-left').addEventListener('click', () => move(-1, 0));
  container.querySelector('#btn-lab-right').addEventListener('click', () => move(1, 0));

  // Bind Keyboard
  document.onkeydown = function(e) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); move(0, -1); }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); move(0, 1); }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); move(-1, 0); }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); move(1, 0); }
  };

  draw();
}
