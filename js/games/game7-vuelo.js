/**
 * Juego 7: Vuelo por la Esfera Celeste (El Paraíso) - Versión Multivel
 * 3 Niveles Celestiales a través de los cielos de La Divina Comedia:
 * - Nivel 1: Cielo de la Luna (Esfera Serena - 8 Estrellas)
 * - Nivel 2: Cielo del Sol (Esfera Dorada - 10 Destellos)
 * - Nivel 3: El Empíreo (Luz Suprema - 12 Joyas de Luz y 3 Cometas)
 * Soporte para Mouse, Touch y Teclado (Flechas/WASD), estelas de partículas y 3 vidas celestiales.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame7(container, restartGame) {
  const CANVAS_SIZE = 340;
  const TOTAL_LEVELS = 3;

  const levels = [
    {
      level: 1,
      name: "Cielo de la Luna: Esfera Serena",
      bgGrad: ["#020617", "#082f49", "#0f172a"],
      starEmoji: "🌟",
      targetStars: 8,
      hazardCount: 1,
      hazardSpeed: 2.0,
      description: "Recolecta 8 estrellas serenas esquivando el cometa errante."
    },
    {
      level: 2,
      name: "Cielo del Sol: Esfera Dorada",
      bgGrad: ["#0f172a", "#3b1d06", "#1e1b4b"],
      starEmoji: "☀️",
      targetStars: 10,
      hazardCount: 2,
      hazardSpeed: 2.7,
      description: "Recolecta 10 destellos solares esquivando 2 cometas ígneos."
    },
    {
      level: 3,
      name: "El Empíreo: Esfera de Luz Suprema",
      bgGrad: ["#1e1b4b", "#311042", "#020617"],
      starEmoji: "✨",
      targetStars: 12,
      hazardCount: 3,
      hazardSpeed: 3.4,
      description: "Alcanza la cumbre del Paraíso recolectando 12 orbes de gracia suprema."
    }
  ];

  let currentLevelIdx = 0;
  let ship = { x: 170, y: 170, vx: 0, vy: 0, invulnerable: 0 };
  let targetStar = { x: 80, y: 80, radius: 14 };
  let hazards = [];
  let starsCollected = 0;
  let lives = 3;
  let isGameOver = false;
  let animTick = 0;
  let playerParticles = [];
  let cometParticles = [];

  // Teclado
  const keys = { left: false, right: false, up: false, down: false };
  let isUsingKeyboard = false;

  function loadLevel(idx) {
    currentLevelIdx = idx;
    const lvl = levels[currentLevelIdx];

    starsCollected = 0;
    ship.x = 170;
    ship.y = 170;
    ship.vx = 0;
    ship.vy = 0;
    ship.invulnerable = 30; // 1.5 seg de protección inicial

    // Generar cometas
    hazards = [];
    for (let i = 0; i < lvl.hazardCount; i++) {
      const angle = (Math.PI * 2 * i) / lvl.hazardCount + 0.5;
      const speed = lvl.hazardSpeed;
      hazards.push({
        x: 60 + Math.random() * 220,
        y: 60 + Math.random() * 220,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 12
      });
    }

    spawnStar();
    playerParticles = [];
    cometParticles = [];
    updateHUD();
  }

  function spawnStar() {
    targetStar.x = Math.random() * (CANVAS_SIZE - 70) + 35;
    targetStar.y = Math.random() * (CANVAS_SIZE - 70) + 35;
  }

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-900/60 shadow-inner flex flex-wrap justify-between items-center text-xs gap-2">
        <div class="flex items-center space-x-2">
          <span id="flight-lvl-badge" class="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-700 text-sky-300 font-bold text-[11px] uppercase">
            Esfera 1 / ${TOTAL_LEVELS}
          </span>
          <span id="flight-lives" class="text-sky-400 font-bold tracking-widest text-sm">💙💙💙</span>
        </div>
        
        <div class="flex items-center space-x-1.5">
          <span class="text-slate-400 font-semibold">Luz Celestial:</span>
          <span id="flight-star-count" class="text-amber-400 font-bold text-sm">0 / 8 🌟</span>
        </div>
      </div>

      <!-- Mensaje de Nivel y Misión -->
      <div id="flight-status-banner" class="text-xs font-bold text-sky-300 transition-all">
        ✨ Guía el alma de Dante y recolecta la luz celestial
      </div>

      <!-- Canvas Cósmico -->
      <div class="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-sky-800 shadow-2xl bg-slate-950">
        <canvas id="flight-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" class="block cursor-crosshair"></canvas>
      </div>

      <p class="text-[11px] text-slate-500">Mueve con el RATÓN, el DEDO táctil o las FLECHAS / WASD del teclado.</p>
    </div>
  `;

  const canvas = container.querySelector('#flight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function updateHUD() {
    const badge = container.querySelector('#flight-lvl-badge');
    const livesEl = container.querySelector('#flight-lives');
    const countEl = container.querySelector('#flight-star-count');
    const banner = container.querySelector('#flight-status-banner');

    const lvl = levels[currentLevelIdx];

    if (badge) {
      badge.innerText = `Nivel ${currentLevelIdx + 1} / ${TOTAL_LEVELS}`;
    }
    if (livesEl) {
      livesEl.innerText = '💙'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
    if (countEl) {
      countEl.innerText = `${starsCollected} / ${lvl.targetStars} ${lvl.starEmoji}`;
    }
    if (banner) {
      banner.innerText = `✨ ${lvl.name}: ${starsCollected}/${lvl.targetStars}`;
    }
  }

  // Manejo de Movimiento de Dante (Mouse & Touch)
  function handlePointerMove(clientX, clientY) {
    if (isGameOver) return;
    isUsingKeyboard = false;
    const rect = canvas.getBoundingClientRect();
    const targetX = clientX - rect.left;
    const targetY = clientY - rect.top;

    ship.x = Math.max(16, Math.min(CANVAS_SIZE - 16, targetX));
    ship.y = Math.max(16, Math.min(CANVAS_SIZE - 16, targetY));
  }

  canvas.onmousemove = (e) => handlePointerMove(e.clientX, e.clientY);

  canvas.ontouchmove = (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Manejo de Teclado
  function handleKeyDown(e) {
    if (isGameOver) return;
    const k = e.key;
    const c = e.code;

    if (k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || k === 'a' || k === 'A' || c === 'KeyA') {
      keys.left = true; isUsingKeyboard = true; e.preventDefault();
    }
    if (k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || k === 'd' || k === 'D' || c === 'KeyD') {
      keys.right = true; isUsingKeyboard = true; e.preventDefault();
    }
    if (k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || k === 'w' || k === 'W' || c === 'KeyW') {
      keys.up = true; isUsingKeyboard = true; e.preventDefault();
    }
    if (k === 'ArrowDown' || k === 'Down' || c === 'ArrowDown' || k === 's' || k === 'S' || c === 'KeyS') {
      keys.down = true; isUsingKeyboard = true; e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    const k = e.key;
    const c = e.code;

    if (k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || k === 'a' || k === 'A' || c === 'KeyA') keys.left = false;
    if (k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || k === 'd' || k === 'D' || c === 'KeyD') keys.right = false;
    if (k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || k === 'w' || k === 'W' || c === 'KeyW') keys.up = false;
    if (k === 'ArrowDown' || k === 'Down' || c === 'ArrowDown' || k === 's' || k === 'S' || c === 'KeyS') keys.down = false;
  }

  window.onkeydown = handleKeyDown;
  document.onkeydown = null;
  window.onkeyup = handleKeyUp;
  document.onkeyup = null;

  function update() {
    if (isGameOver) return;
    animTick++;

    const lvl = levels[currentLevelIdx];

    // Movimiento con teclado si está activo
    if (isUsingKeyboard) {
      const speed = 4.8;
      if (keys.left) ship.x -= speed;
      if (keys.right) ship.x += speed;
      if (keys.up) ship.y -= speed;
      if (keys.down) ship.y += speed;

      ship.x = Math.max(16, Math.min(CANVAS_SIZE - 16, ship.x));
      ship.y = Math.max(16, Math.min(CANVAS_SIZE - 16, ship.y));
    }

    // Partículas de estela de Dante
    if (animTick % 2 === 0) {
      playerParticles.push({
        x: ship.x,
        y: ship.y,
        life: 18,
        maxLife: 18,
        radius: 3 + Math.random() * 2
      });
    }

    // Actualizar cometas y sus estelas
    hazards.forEach(h => {
      h.x += h.vx;
      h.y += h.vy;

      if (h.x <= 16 || h.x >= CANVAS_SIZE - 16) h.vx *= -1;
      if (h.y <= 16 || h.y >= CANVAS_SIZE - 16) h.vy *= -1;

      // Partículas de cometa
      if (animTick % 2 === 0) {
        cometParticles.push({
          x: h.x,
          y: h.y,
          life: 14,
          maxLife: 14,
          radius: 2 + Math.random() * 2
        });
      }
    });

    // Colisión con la Estrella / Luz
    const distToStar = Math.hypot(ship.x - targetStar.x, ship.y - targetStar.y);
    if (distToStar < 24) {
      starsCollected++;
      audioManager.playSound('success');
      spawnStar();
      updateHUD();

      // Completar Nivel
      if (starsCollected >= lvl.targetStars) {
        handleLevelComplete();
        return;
      }
    }

    // Colisión con Cometas (si no es invulnerable)
    if (ship.invulnerable > 0) {
      ship.invulnerable--;
    } else {
      for (let h of hazards) {
        if (Math.hypot(ship.x - h.x, ship.y - h.y) < 22) {
          audioManager.playSound('error');
          lives--;
          ship.invulnerable = 35; // 1.5 seg
          updateHUD();

          if (lives <= 0) {
            handleGameOver();
            return;
          }
          break;
        }
      }
    }

    // Actualizar partículas
    playerParticles.forEach(p => p.life--);
    playerParticles = playerParticles.filter(p => p.life > 0);

    cometParticles.forEach(p => p.life--);
    cometParticles = cometParticles.filter(p => p.life > 0);
  }

  function handleLevelComplete() {
    audioManager.playSuccess();

    if (currentLevelIdx < TOTAL_LEVELS - 1) {
      // Avanzar al siguiente nivel
      const nextIdx = currentLevelIdx + 1;
      const banner = container.querySelector('#flight-status-banner');
      if (banner) {
        banner.className = "text-xs font-bold text-emerald-300 animate-pulse";
        banner.innerHTML = `🌟 ¡Esfera superada! Ascendiendo a <strong>${levels[nextIdx].name}</strong>...`;
      }

      // Recompensa: +1 vida extra si tenía daño
      lives = Math.min(3, lives + 1);

      setTimeout(() => {
        loadLevel(nextIdx);
      }, 1000);
    } else {
      // Victoria final tras las 3 Esferas
      winGame();
    }
  }

  function handleGameOver() {
    isGameOver = true;
    stateManager.clearGameLoops();

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-meteor text-5xl text-red-500 animate-pulse"></i>
          <h3 class="font-cinzel text-2xl font-bold text-red-400">¡Caída Celestial!</h3>
          <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            Los cometas han dispersado tu luz en el <strong>${levels[currentLevelIdx].name}</strong>.
          </p>
          <button id="retry-g7-over" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Reiniciar Vuelo (Nivel 1)
          </button>
        </div>
      `;
      container.querySelector('#retry-g7-over').addEventListener('click', () => {
        restartGame(7);
      });
    }, 400);
  }

  function winGame() {
    isGameOver = true;
    stateManager.clearGameLoops();
    stateManager.markGameCompleted(7);

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-sun text-5xl text-amber-400 animate-spin"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Vuelo al Empíreo Triunfal!</h3>
          <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            Has atravesado las 3 Esferas Celestes: la <em>Luna Serena</em>, el <em>Sol Dorado</em> y el <em>Empíreo Supremo</em>, guiando el alma de Dante hasta la luz increada.
          </p>
          <button id="retry-g7-win" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Volar las 3 Esferas de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g7-win').addEventListener('click', () => {
        restartGame(7);
      });
    }, 500);
  }

  function draw() {
    const lvl = levels[currentLevelIdx];

    // 1. Fondo Cósmico Dinámico con Nebulosa
    const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    bgGrad.addColorStop(0, lvl.bgGrad[0]);
    bgGrad.addColorStop(0.5, lvl.bgGrad[1]);
    bgGrad.addColorStop(1, lvl.bgGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Estrellas titilantes de fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const starSeeds = [
      { x: 40, y: 35 }, { x: 120, y: 70 }, { x: 260, y: 45 },
      { x: 300, y: 140 }, { x: 50, y: 220 }, { x: 280, y: 260 },
      { x: 90, y: 310 }, { x: 210, y: 300 }
    ];
    starSeeds.forEach((s, idx) => {
      const alpha = 0.25 + 0.45 * Math.sin(animTick * 0.08 + idx);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(s.x, s.y, 2, 2);
    });

    // 2. Estelas de Partículas
    // Estelas de Dante (Luz azul/dorada)
    playerParticles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Estelas de Cometas (Fuego/Rojo)
    cometParticles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Dibujar Estrella / Luz Objetivo
    const starPulsing = 16 + Math.sin(animTick * 0.15) * 4;
    const starGlow = ctx.createRadialGradient(targetStar.x, targetStar.y, 4, targetStar.x, targetStar.y, starPulsing);
    starGlow.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
    starGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = starGlow;
    ctx.beginPath();
    ctx.arc(targetStar.x, targetStar.y, starPulsing, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lvl.starEmoji, targetStar.x, targetStar.y);

    // 4. Dibujar Cometas
    hazards.forEach(h => {
      const hGlow = ctx.createRadialGradient(h.x, h.y, 3, h.x, h.y, 16);
      hGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      hGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = hGlow;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☄️', h.x, h.y);
    });

    // 5. Dibujar Alma de Dante (✨) con parpadeo de invulnerabilidad
    if (ship.invulnerable <= 0 || animTick % 6 < 3) {
      const soulGlow = ctx.createRadialGradient(ship.x, ship.y, 4, ship.x, ship.y, 18);
      soulGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      soulGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = soulGlow;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', ship.x, ship.y);
    }
  }

  // Bucle principal de físicas y render a 60 FPS
  const loop = setInterval(() => {
    update();
    draw();
  }, 1000 / 60);

  stateManager.setLoopInterval(loop);

  // Iniciar en la Esfera 1
  loadLevel(0);
}
