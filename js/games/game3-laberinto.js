/**
 * Juego 3: Laberinto de Minos (El Infierno) - Versión Multivel Corregida y Optimizada
 * 3 Niveles con pasillos individuales (1 bloque de ancho), acceso central libre (4,4),
 * 100% de conectividad garantizada en todos los niveles y transición fluida por la puerta (🚪).
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame3(container, restartGame) {
  const TILE_SIZE = 38;
  const GRID_SIZE = 9;
  const CANVAS_SIZE = TILE_SIZE * GRID_SIZE; // 342px
  const TOTAL_LEVELS = 3;

  // Configuración de los 3 Niveles del Infierno
  const levelsData = [
    {
      level: 1,
      title: "Nivel 1: La Selva Oscura",
      subtitle: "3 Antorchas - Minos patrulla moderada",
      minosSpeedTicks: 11, // ~550ms
      wallColor: '#2d0606',
      wallBorder: '#7f1d1d',
      wallRelief: '#991b1b',
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      torches: [
        { x: 7, y: 1 },
        { x: 1, y: 3 },
        { x: 1, y: 7 }
      ]
    },
    {
      level: 2,
      title: "Nivel 2: La Ciudad de Dite",
      subtitle: "4 Antorchas - Pasillos cruzados y muros púrpura",
      minosSpeedTicks: 9, // ~450ms
      wallColor: '#3b0764',
      wallBorder: '#9333ea',
      wallRelief: '#c084fc',
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      torches: [
        { x: 7, y: 1 },
        { x: 1, y: 3 },
        { x: 7, y: 3 },
        { x: 4, y: 5 }
      ]
    },
    {
      level: 3,
      title: "Nivel 3: El Abismo de Cocito",
      subtitle: "5 Antorchas - Acceso central fluido y Minos veloz",
      minosSpeedTicks: 7, // ~350ms
      wallColor: '#1e1b4b',
      wallBorder: '#3b82f6',
      wallRelief: '#60a5fa',
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      torches: [
        { x: 7, y: 1 },
        { x: 3, y: 2 },
        { x: 5, y: 6 },
        { x: 1, y: 7 },
        { x: 3, y: 7 }
      ]
    }
  ];

  let currentLevelIdx = 0;
  let player = { x: 1, y: 1, invulnerable: 0 };
  let minos = { x: 4, y: 4 };
  let exitPortal = { x: 7, y: 7, unlocked: false };
  let currentTorches = [];
  let lives = 3;
  let isGameOver = false;
  let animTick = 0;
  let minosMoveCounter = 0;

  function loadLevel(levelIdx) {
    currentLevelIdx = levelIdx;
    const lvl = levelsData[currentLevelIdx];

    player.x = 1;
    player.y = 1;
    player.invulnerable = 25;

    minos.x = 4;
    minos.y = 4;

    exitPortal.x = 7;
    exitPortal.y = 7;
    exitPortal.unlocked = false;

    currentTorches = lvl.torches.map(t => ({ x: t.x, y: t.y, collected: false }));
    minosMoveCounter = 0;

    updateHUD();
  }

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-red-900/60 shadow-inner flex flex-wrap justify-between items-center text-xs gap-2">
        <div class="flex items-center space-x-2">
          <span id="lab-level-badge" class="px-2 py-0.5 rounded-md bg-red-950 border border-red-700 text-red-300 font-bold text-[11px] uppercase">
            Nivel 1 / ${TOTAL_LEVELS}
          </span>
          <span id="lab-lives" class="text-red-500 font-bold tracking-widest text-sm">❤️❤️❤️</span>
        </div>
        
        <div class="flex items-center space-x-1.5">
          <span class="text-slate-400 font-semibold">Antorchas:</span>
          <span id="lab-torches-count" class="text-amber-400 font-bold text-sm">0 / 3 🔥</span>
        </div>
      </div>

      <!-- Estado y Misión -->
      <div id="lab-status-msg" class="text-xs font-bold text-amber-300 transition-all">
        🔥 Recoge todas las antorchas para abrir la puerta de escape (🚪)
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
      <p class="text-[11px] text-slate-500">Mueve a Dante con las FLECHAS o W, A, S, D paso a paso.</p>
    </div>
  `;

  const canvas = container.querySelector('#laberinto-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function isWalkable(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    const currentMaze = levelsData[currentLevelIdx].maze;
    return currentMaze[y][x] === 0;
  }

  function updateHUD() {
    const lvlBadge = container.querySelector('#lab-level-badge');
    const livesEl = container.querySelector('#lab-lives');
    const torchesEl = container.querySelector('#lab-torches-count');
    const msgEl = container.querySelector('#lab-status-msg');

    const lvl = levelsData[currentLevelIdx];
    const collectedCount = currentTorches.filter(t => t.collected).length;
    const totalCount = currentTorches.length;

    if (lvlBadge) {
      lvlBadge.innerText = `Nivel ${currentLevelIdx + 1} / ${TOTAL_LEVELS}`;
    }

    if (livesEl) {
      livesEl.innerText = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }

    if (torchesEl) {
      torchesEl.innerText = `${collectedCount} / ${totalCount} 🔥`;
    }

    if (msgEl) {
      if (exitPortal.unlocked) {
        msgEl.className = "text-xs font-bold text-emerald-400 animate-pulse";
        if (currentLevelIdx < TOTAL_LEVELS - 1) {
          msgEl.innerHTML = `✨ ¡Puerta desbloqueada! ¡Entra a la puerta (🚪) en la esquina inferior para pasar al Nivel ${currentLevelIdx + 2}!`;
        } else {
          msgEl.innerHTML = "✨ ¡Puerta Final abierta! ¡Cruza la salida (🚪) para escapar del Infierno!";
        }
      } else {
        msgEl.className = "text-xs font-bold text-amber-300";
        msgEl.innerText = `🔥 ${lvl.title}: Recoge las ${totalCount - collectedCount} antorchas restantes`;
      }
    }
  }

  function draw() {
    animTick++;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const lvl = levelsData[currentLevelIdx];
    const currentMaze = lvl.maze;

    // 1. Dibujar Casillas y Muros
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (currentMaze[y][x] === 1) {
          // Muro del laberinto
          ctx.fillStyle = lvl.wallColor;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = lvl.wallBorder;
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Detalle de relieve
          ctx.fillStyle = lvl.wallRelief;
          ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, 3);
        } else {
          // Pasillo transitable
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 2. Dibujar Antorchas
    currentTorches.forEach(t => {
      if (!t.collected) {
        const px = t.x * TILE_SIZE + TILE_SIZE / 2;
        const py = t.y * TILE_SIZE + TILE_SIZE / 2;

        // Aura de luz
        const glowRadius = 16 + Math.sin(animTick * 0.15) * 3;
        const grad = ctx.createRadialGradient(px, py, 4, px, py, glowRadius);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
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

    // 3. Dibujar Puerta / Portal de Salida
    const portalPx = exitPortal.x * TILE_SIZE + TILE_SIZE / 2;
    const portalPy = exitPortal.y * TILE_SIZE + TILE_SIZE / 2;

    if (exitPortal.unlocked) {
      // Aura mágica
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

    const mGrad = ctx.createRadialGradient(minosPx, minosPy, 4, minosPx, minosPy, 18);
    mGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
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

      const dGrad = ctx.createRadialGradient(playerPx, playerPy, 4, playerPx, playerPy, 15);
      dGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
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

  let lastMoveTime = 0;

  function movePlayer(dx, dy) {
    if (isGameOver) return;

    const now = Date.now();
    if (now - lastMoveTime < 110) return; // Evita doble paso por rebote o eventos duplicados
    lastMoveTime = now;

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (isWalkable(nx, ny)) {
      player.x = nx;
      player.y = ny;
      audioManager.playClick();

      // Recolección de antorchas
      currentTorches.forEach(t => {
        if (!t.collected && t.x === player.x && t.y === player.y) {
          t.collected = true;
          audioManager.playSound('success');

          const allCollected = currentTorches.every(torch => torch.collected);
          if (allCollected) {
            exitPortal.unlocked = true;
            audioManager.playSuccess();
          }
          updateHUD();
        }
      });

      // Paso a través de la Puerta (🚪)
      if (exitPortal.unlocked && player.x === exitPortal.x && player.y === exitPortal.y) {
        handleDoorReached();
        return;
      }

      checkCollisionWithMinos();
      draw();
    }
  }

  function handleDoorReached() {
    audioManager.playSuccess();

    if (currentLevelIdx < TOTAL_LEVELS - 1) {
      // Avanzar al siguiente nivel
      const statusMsg = container.querySelector('#lab-status-msg');
      if (statusMsg) {
        statusMsg.className = "text-xs font-bold text-emerald-300 animate-pulse";
        statusMsg.innerHTML = `🌟 ¡Cruzaste la puerta! Descendiendo a <strong>${levelsData[currentLevelIdx + 1].title}</strong>...`;
      }

      // Recompensa: +1 vida extra (máximo 3)
      lives = Math.min(3, lives + 1);

      setTimeout(() => {
        loadLevel(currentLevelIdx + 1);
        draw();
      }, 900);
    } else {
      // Victoria final tras completar los 3 niveles
      winAllLevels();
    }
  }

  // IA de Minos
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
      const chaseChance = currentLevelIdx === 2 ? 0.85 : (currentLevelIdx === 1 ? 0.78 : 0.70);

      if (Math.random() < chaseChance) {
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
        player.x = 1;
        player.y = 1;
        player.invulnerable = 30;
      }
    }
  }

  function winAllLevels() {
    isGameOver = true;
    stateManager.clearGameLoops();
    stateManager.markGameCompleted(3);

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-dungeon text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Escapaste de los 3 Laberintos Infernales!</h3>
          <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            Has superado la <em>Selva Oscura</em>, la <em>Ciudad de Dite</em> y el <em>Abismo de Cocito</em>, burlando a Minos en los 3 niveles para alcanzar el Purgatorio.
          </p>
          <button id="retry-g3-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Jugar los 3 Niveles de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g3-btn').addEventListener('click', () => {
        restartGame(3);
      });
    }, 400);
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
          <p class="text-slate-300 text-sm">Te has quedado sin vidas en el Nivel ${currentLevelIdx + 1} (${levelsData[currentLevelIdx].title}).</p>
          <button id="retry-g3-over" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Reiniciar Laberinto (Nivel 1)
          </button>
        </div>
      `;
      container.querySelector('#retry-g3-over').addEventListener('click', () => {
        restartGame(3);
      });
    }, 400);
  }

  // Conectar Botones D-Pad
  container.querySelector('#btn-lab-up').addEventListener('click', () => movePlayer(0, -1));
  container.querySelector('#btn-lab-down').addEventListener('click', () => movePlayer(0, 1));
  container.querySelector('#btn-lab-left').addEventListener('click', () => movePlayer(-1, 0));
  container.querySelector('#btn-lab-right').addEventListener('click', () => movePlayer(1, 0));

  // Conectar Teclado (Flechas y WASD) de forma única y precisa
  function handleKeyDown(e) {
    if (isGameOver) return;
    if (e.repeat) return; // Evita saltos múltiples por repetición continua del sistema operativo

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

  // Asignar a un solo objetivo para evitar disparos dobles por propagación
  window.onkeydown = handleKeyDown;
  document.onkeydown = null;

  // Bucle de físicas y Minos
  const loop = setInterval(() => {
    draw();
    minosMoveCounter++;

    const currentSpeedTicks = levelsData[currentLevelIdx].minosSpeedTicks;
    if (minosMoveCounter >= currentSpeedTicks) {
      minosMoveCounter = 0;
      stepMinos();
    }
  }, 50);

  stateManager.setLoopInterval(loop);

  // Iniciar Nivel 1
  loadLevel(0);
}
