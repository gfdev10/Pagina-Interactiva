/**
 * Juego 3: Laberinto de Minos (El Infierno) - Versión Mejorada & Dinámica
 * Incluye: Mapa de laberinto real 9x9 con muros, IA de persecución de Minos en tiempo real,
 * sistema de 3 vidas, antorchas místicas, portal de escape y aura de iluminación.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame3(container, restartGame) {
  // Matriz del laberinto (0: Pasillo, 1: Muro de piedra infernal)
  const MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // (1,1) Inicio Dante; (7,1) Antorcha 1
    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1], // (1,3) Antorcha 2
    [1, 0, 1, 1, 0, 1, 1, 0, 1], // (4,4) Guarida de Minos
    [1, 0, 0, 0, 0, 0, 0, 0, 1], // Pasillo central
    [1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1], // (1,7) Antorcha 3; (7,7) Portal de Escape
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  const TILE_SIZE = 38;
  const GRID_SIZE = 9;
  const CANVAS_SIZE = TILE_SIZE * GRID_SIZE; // 342px

  let player = { x: 1, y: 1, invulnerable: 0 };
  let minos = { x: 4, y: 4 };
  let exitPortal = { x: 7, y: 7, unlocked: false };
  let torches = [
    { x: 7, y: 1, collected: false },
    { x: 1, y: 3, collected: false },
    { x: 1, y: 7, collected: false }
  ];

  let lives = 3;
  let collectedTorches = 0;
  let isGameOver = false;
  let animTick = 0;

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior -->
      <div class="flex justify-between items-center bg-slate-950/80 px-4 py-2 rounded-xl border border-red-900/60 text-xs">
        <div class="flex items-center space-x-1.5">
          <span class="text-slate-400 font-semibold">Vidas:</span>
          <span id="lab-lives" class="text-red-500 font-bold tracking-widest text-sm">❤️❤️❤️</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-slate-400 font-semibold">Antorchas:</span>
          <span id="lab-torches-count" class="text-amber-400 font-bold text-sm">0 / 3 🔥</span>
        </div>
      </div>

      <!-- Estado / Misión -->
      <div id="lab-status-msg" class="text-xs font-bold text-amber-300 transition-all">
        🔥 Recoge las 3 antorchas para abrir el Portal de Escape
      </div>

      <!-- Canvas del Laberinto -->
      <div class="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-red-800 shadow-2xl bg-slate-950">
        <canvas id="laberinto-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" class="block"></canvas>
      </div>

      <!-- Controles D-Pad para táctil / clic -->
      <div class="grid grid-cols-3 gap-2 max-w-[190px] mx-auto pt-1">
        <div></div>
        <button id="btn-lab-up" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-200 rounded-xl border border-slate-700 transition-transform shadow-md"><i class="fa-solid fa-arrow-up"></i></button>
        <div></div>
        <button id="btn-lab-left" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-200 rounded-xl border border-slate-700 transition-transform shadow-md"><i class="fa-solid fa-arrow-left"></i></button>
        <button id="btn-lab-down" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-200 rounded-xl border border-slate-700 transition-transform shadow-md"><i class="fa-solid fa-arrow-down"></i></button>
        <button id="btn-lab-right" class="p-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-200 rounded-xl border border-slate-700 transition-transform shadow-md"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
      <p class="text-[11px] text-slate-500">Puedes moverte con las FLECHAS del teclado o las teclas W, A, S, D.</p>
    </div>
  `;

  const canvas = container.querySelector('#laberinto-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function isWalkable(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    return MAZE[y][x] === 0;
  }

  function updateHUD() {
    const livesEl = container.querySelector('#lab-lives');
    const torchesEl = container.querySelector('#lab-torches-count');
    const msgEl = container.querySelector('#lab-status-msg');

    if (livesEl) {
      livesEl.innerText = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
    if (torchesEl) {
      torchesEl.innerText = `${collectedTorches} / 3 🔥`;
    }
    if (msgEl) {
      if (exitPortal.unlocked) {
        msgEl.className = "text-xs font-bold text-emerald-400 animate-pulse";
        msgEl.innerHTML = "✨ ¡Portal Desbloqueado! ¡Corre a la salida (🚪) en la esquina inferior!";
      } else {
        msgEl.className = "text-xs font-bold text-amber-300";
        msgEl.innerText = `🔥 Recoge las ${3 - collectedTorches} antorcha(s) restante(s) para abrir el portal`;
      }
    }
  }

  function draw() {
    animTick++;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Dibujar Casillas y Muros
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (MAZE[y][x] === 1) {
          // Muro de piedra obsidiana infernal
          ctx.fillStyle = '#2d0606';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#5a0d0d';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Detalle de relieve
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, 3);
        } else {
          // Suelo de adoquines oscuros
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 2. Dibujar Antorchas
    torches.forEach(t => {
      if (!t.collected) {
        const px = t.x * TILE_SIZE + TILE_SIZE / 2;
        const py = t.y * TILE_SIZE + TILE_SIZE / 2;

        // Aura de luz de la antorcha
        const glowRadius = 16 + Math.sin(animTick * 0.15) * 3;
        const grad = ctx.createRadialGradient(px, py, 4, px, py, glowRadius);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', px, py);
      }
    });

    // 3. Dibujar Portal de Salida
    const portalPx = exitPortal.x * TILE_SIZE + TILE_SIZE / 2;
    const portalPy = exitPortal.y * TILE_SIZE + TILE_SIZE / 2;

    if (exitPortal.unlocked) {
      // Aura mágica del portal
      const glow = 18 + Math.sin(animTick * 0.2) * 5;
      const pGrad = ctx.createRadialGradient(portalPx, portalPy, 2, portalPx, portalPy, glow);
      pGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(portalPx, portalPy, glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚪', portalPx, portalPy);
    } else {
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', portalPx, portalPy);
    }

    // 4. Dibujar a Minos (👹)
    const minosPx = minos.x * TILE_SIZE + TILE_SIZE / 2;
    const minosPy = minos.y * TILE_SIZE + TILE_SIZE / 2;

    // Aura siniestra de Minos
    const mGrad = ctx.createRadialGradient(minosPx, minosPy, 4, minosPx, minosPy, 18);
    mGrad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
    mGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(minosPx, minosPy, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👹', minosPx, minosPy);

    // 5. Dibujar a Dante (🚶)
    if (player.invulnerable <= 0 || animTick % 6 < 3) {
      const playerPx = player.x * TILE_SIZE + TILE_SIZE / 2;
      const playerPy = player.y * TILE_SIZE + TILE_SIZE / 2;

      // Aura de guía divina
      const dGrad = ctx.createRadialGradient(playerPx, playerPy, 4, playerPx, playerPy, 15);
      dGrad.addColorStop(0, 'rgba(250, 204, 21, 0.4)');
      dGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(playerPx, playerPy, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚶', playerPx, playerPy);
    }

    if (player.invulnerable > 0) {
      player.invulnerable--;
    }
  }

  function movePlayer(dx, dy) {
    if (isGameOver) return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (isWalkable(nx, ny)) {
      player.x = nx;
      player.y = ny;
      audioManager.playClick();

      // Verificar recolección de antorchas
      torches.forEach(t => {
        if (!t.collected && t.x === player.x && t.y === player.y) {
          t.collected = true;
          collectedTorches++;
          audioManager.playSound('success');

          if (collectedTorches === torches.length) {
            exitPortal.unlocked = true;
            audioManager.playSuccess();
          }
          updateHUD();
        }
      });

      // Verificar escape por el portal
      if (exitPortal.unlocked && player.x === exitPortal.x && player.y === exitPortal.y) {
        winGame();
        return;
      }

      checkCollisionWithMinos();
      draw();
    }
  }

  // IA de Minos (Búsqueda hacia el jugador por caminos transitables)
  function stepMinos() {
    if (isGameOver) return;

    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    const validMoves = directions
      .map(dir => ({ x: minos.x + dir.dx, y: minos.y + dir.dy }))
      .filter(pos => isWalkable(pos.x, pos.y));

    if (validMoves.length > 0) {
      // 75% persigue directamente calculando distancia Manhattan, 25% movimiento aleatorio
      if (Math.random() < 0.75) {
        validMoves.sort((a, b) => {
          const distA = Math.hypot(a.x - player.x, a.y - player.y);
          const distB = Math.hypot(b.x - player.x, b.y - player.y);
          return distA - distB;
        });
      } else {
        validMoves.sort(() => Math.random() - 0.5);
      }

      minos.x = validMoves[0].x;
      minos.y = validMoves[0].y;
    }

    checkCollisionWithMinos();
    draw();
  }

  function checkCollisionWithMinos() {
    if (isGameOver) return;

    if (player.x === minos.x && player.y === minos.y && player.invulnerable <= 0) {
      audioManager.playSound('error');
      lives--;
      updateHUD();

      if (lives <= 0) {
        gameOver();
      } else {
        // Respawn de Dante al inicio con invulnerabilidad temporal
        player.x = 1;
        player.y = 1;
        player.invulnerable = 30; // ~1.5 segundos
      }
    }
  }

  function winGame() {
    isGameOver = true;
    stateManager.clearGameLoops();
    stateManager.markGameCompleted(3);

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-dungeon text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Escapaste del Laberinto!</h3>
          <p class="text-slate-300 text-sm">Conseguiste las 3 antorchas, evitaste las garras de Minos y atravesaste el Portal hacia el Purgatorio.</p>
          <button id="retry-g3-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g3-btn').addEventListener('click', () => {
        restartGame(3);
      });
    }, 300);
  }

  function gameOver() {
    isGameOver = true;
    stateManager.clearGameLoops();
    audioManager.playSound('error');

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-skull text-5xl text-red-500 animate-pulse"></i>
          <h3 class="font-cinzel text-2xl font-bold text-red-400">¡Minos te ha atrapado!</h3>
          <p class="text-slate-300 text-sm">Te has quedado sin vidas en los oscuros pasillos del Infierno.</p>
          <button id="retry-g3-over" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Intentar el Laberinto de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g3-over').addEventListener('click', () => {
        restartGame(3);
      });
    }, 400);
  }

  // Conectar botones D-Pad
  container.querySelector('#btn-lab-up').addEventListener('click', () => movePlayer(0, -1));
  container.querySelector('#btn-lab-down').addEventListener('click', () => movePlayer(0, 1));
  container.querySelector('#btn-lab-left').addEventListener('click', () => movePlayer(-1, 0));
  container.querySelector('#btn-lab-right').addEventListener('click', () => movePlayer(1, 0));

  // Bucles de Renderizado e IA
  let minosMoveCounter = 0;
  const loop = setInterval(() => {
    draw();
    minosMoveCounter++;
    // Minos da un paso cada ~500ms (10 ticks de 50ms)
    if (minosMoveCounter >= 10) {
      minosMoveCounter = 0;
      stepMinos();
    }
  }, 50);

  stateManager.setLoopInterval(loop);

  // Conectar Teclado Robusto (Flechas, WASD, e.key y e.code)
  function handleKeyDown(e) {
    if (isGameOver) return;
    const k = e.key;
    const c = e.code;

    if (k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || k === 'w' || k === 'W' || c === 'KeyW') {
      e.preventDefault();
      movePlayer(0, -1);
    } else if (k === 'ArrowDown' || k === 'Down' || c === 'ArrowDown' || k === 's' || k === 'S' || c === 'KeyS') {
      e.preventDefault();
      movePlayer(0, 1);
    } else if (k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || k === 'a' || k === 'A' || c === 'KeyA') {
      e.preventDefault();
      movePlayer(-1, 0);
    } else if (k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || k === 'd' || k === 'D' || c === 'KeyD') {
      e.preventDefault();
      movePlayer(1, 0);
    }
  }

  window.onkeydown = handleKeyDown;
  document.onkeydown = handleKeyDown;

  updateHUD();
  draw();
}
