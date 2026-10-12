/**
 * Juego 9: Vuelo al Empíreo (Estilo Flappy Peregrino) - El Paraíso
 * Reemplaza los Anillos de la Trinidad por un adictivo y accesible juego estilo Flappy Bird:
 * - Dante vuela con alas de luz celestial (🕊️✨) a través de las Columnas de la Gracia.
 * - Físicas fluidas a 60 FPS, rotación del personaje, partículas de plumas doradas.
 * - Meta: Superar 8 columnas celestiales para alcanzar la luz divina del Empíreo.
 * - Desbloquea la medalla final y da acceso directo al Certificado de Honor.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';

export function initGame9(container, restartGame) {
  const CANVAS_WIDTH = 340;
  const CANVAS_HEIGHT = 420;
  const TARGET_SCORE = 8; // Columnas necesarias para ganar la medalla final

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-sky-900/60 shadow-inner flex justify-between items-center text-xs">
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-dove text-amber-400"></i>
          <span class="text-slate-300 font-semibold">Columnas Celestes:</span>
          <span id="flappy-score-text" class="text-amber-400 font-bold text-sm">0 / ${TARGET_SCORE}</span>
        </div>
        
        <div class="flex items-center space-x-1.5 text-xs text-sky-300 font-bold">
          <span>Récord:</span>
          <span id="flappy-highscore" class="text-white">0</span>
        </div>
      </div>

      <!-- Estado dinámico -->
      <div id="flappy-status-msg" class="text-xs font-bold text-sky-300 transition-all">
        🪽 Presiona ESPACIO o haz CLIC para aletear y cruzar las Columnas de Luz
      </div>

      <!-- Canvas de Juego Flappy Dante -->
      <div class="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-sky-800 shadow-2xl bg-slate-950 select-none">
        <canvas id="flappy-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" class="block cursor-pointer"></canvas>
      </div>

      <!-- Botón de Aleteo para móviles y pantalla -->
      <div class="flex justify-center items-center gap-3 pt-1">
        <button id="flappy-jump-btn" class="w-full max-w-[240px] py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-transform flex items-center justify-center space-x-2">
          <i class="fa-solid fa-feather-pointed text-sm"></i>
          <span>ALETEAR / VOLAR</span>
        </button>
      </div>

      <p class="text-[11px] text-slate-500">Haz clic en la pantalla, toca el botón o pulsa ESPACIO / FLECHA ARRIBA.</p>
    </div>
  `;

  const canvas = container.querySelector('#flappy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Estado del Peregrino (Dante Alado)
  let bird = {
    x: 60,
    y: 200,
    radius: 14,
    vy: 0,
    gravity: 0.32,
    jump: -6.2,
    rotation: 0
  };

  // Columnas / Obstáculos
  let pipes = [];
  let score = 0;
  let highScore = parseInt(localStorage.getItem('dante_flappy_high') || '0', 10);
  let isPlaying = false;
  let isGameOver = false;
  let animTick = 0;
  let feathers = [];

  const PIPE_WIDTH = 48;
  const PIPE_GAP = 118; // Espacio vertical muy amigable para navegar
  const PIPE_SPEED = 1.85;

  function resetGame() {
    bird.x = 60;
    bird.y = 200;
    bird.vy = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    isPlaying = false;
    isGameOver = false;
    feathers = [];

    // Generar primera columna
    spawnPipe(CANVAS_WIDTH + 80);
    spawnPipe(CANVAS_WIDTH + 80 + 175);

    updateHUD();
  }

  function spawnPipe(startX) {
    const minHeight = 45;
    const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    pipes.push({
      x: startX,
      top: topHeight,
      bottom: topHeight + PIPE_GAP,
      passed: false
    });
  }

  function addFeathers(x, y) {
    for (let i = 0; i < 6; i++) {
      feathers.push({
        x: x,
        y: y,
        vx: -1.2 + (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 18,
        maxLife: 18,
        radius: 2 + Math.random() * 2
      });
    }
  }

  function flap() {
    if (isGameOver) {
      resetGame();
      return;
    }

    if (!isPlaying) {
      isPlaying = true;
      const msg = container.querySelector('#flappy-status-msg');
      if (msg) msg.innerText = `✨ ¡En vuelo! Cruza las ${TARGET_SCORE} columnas hacia el Empíreo`;
    }

    bird.vy = bird.jump;
    audioManager.playClick();
    addFeathers(bird.x - 8, bird.y);
  }

  function updateHUD() {
    const scoreEl = container.querySelector('#flappy-score-text');
    const highEl = container.querySelector('#flappy-highscore');
    if (scoreEl) scoreEl.innerText = `${score} / ${TARGET_SCORE}`;
    if (highEl) highEl.innerText = highScore;
  }

  function update() {
    animTick++;

    if (!isPlaying) {
      // Flotación suave antes de empezar
      bird.y = 200 + Math.sin(animTick * 0.08) * 6;
      bird.rotation = 0;
      return;
    }

    // Físicas del pájaro
    bird.vy += bird.gravity;
    bird.y += bird.vy;

    // Rotación según velocidad vertical
    bird.rotation = Math.max(-0.4, Math.min(0.6, bird.vy * 0.07));

    // Colisión con techo y suelo
    if (bird.y - bird.radius <= 0) {
      bird.y = bird.radius;
      bird.vy = 0;
    }
    if (bird.y + bird.radius >= CANVAS_HEIGHT - 10) {
      handleCollision();
      return;
    }

    // Actualizar columnas
    pipes.forEach(pipe => {
      pipe.x -= PIPE_SPEED;

      // Comprobar si superó la columna
      if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.passed = true;
        score++;
        audioManager.playSound('success');

        if (score > highScore) {
          highScore = score;
          localStorage.setItem('dante_flappy_high', highScore.toString());
        }
        updateHUD();

        // Meta alcanzada
        if (score >= TARGET_SCORE) {
          handleWin();
          return;
        }
      }

      // Colisión de caja (hitbox de columnas)
      const hitX = bird.x + bird.radius - 4 > pipe.x && bird.x - bird.radius + 4 < pipe.x + PIPE_WIDTH;
      const hitTop = bird.y - bird.radius + 4 < pipe.top;
      const hitBottom = bird.y + bird.radius - 4 > pipe.bottom;

      if (hitX && (hitTop || hitBottom)) {
        handleCollision();
        return;
      }
    });

    // Añadir nuevas columnas conforme avanzan
    if (pipes.length > 0 && pipes[pipes.length - 1].x < CANVAS_WIDTH - 90) {
      spawnPipe(CANVAS_WIDTH + 80);
    }

    // Eliminar columnas fuera de pantalla
    pipes = pipes.filter(p => p.x + PIPE_WIDTH > -20);

    // Actualizar partículas de plumas
    feathers.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      f.life--;
    });
    feathers = feathers.filter(f => f.life > 0);
  }

  function handleCollision() {
    audioManager.playSound('error');
    isGameOver = true;
    isPlaying = false;

    const msg = container.querySelector('#flappy-status-msg');
    if (msg) {
      msg.className = "text-xs font-bold text-red-400 animate-pulse";
      msg.innerHTML = `⚠️ ¡Chocaste contra la columna! Toca o pulsa ESPACIO para intentar de nuevo.`;
    }
  }

  function handleWin() {
    isGameOver = true;
    isPlaying = false;
    stateManager.clearGameLoops();
    stateManager.markGameCompleted(9);

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4 max-w-sm w-full mx-auto p-4">
          <i class="fa-solid fa-crown text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Gloria Suprema en el Empíreo!</h3>
          <p class="text-slate-300 text-sm leading-relaxed">
            Has completado el vuelo final superando las Columnas Celestiales. ¡Has coronado con éxito los <strong>9 desafíos</strong> de <em>La Divina Comedia</em>!
          </p>
          
          <div class="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button id="flappy-view-cert-btn" class="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-transform active:scale-95 shadow-xl flex items-center justify-center space-x-2">
              <i class="fa-solid fa-award text-base"></i>
              <span>VER CERTIFICADO DE HONOR</span>
            </button>
            <button id="flappy-replay-win-btn" class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Volar de nuevo
            </button>
          </div>
        </div>
      `;

      container.querySelector('#flappy-view-cert-btn').addEventListener('click', () => {
        router.switchTab('certificate');
      });
      container.querySelector('#flappy-replay-win-btn').addEventListener('click', () => {
        restartGame(9);
      });
    }, 450);
  }

  function draw() {
    // 1. Cielo Celestial con degradado Empíreo
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#0c1a30');
    skyGrad.addColorStop(0.6, '#1e1b4b');
    skyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estrellas y rayos de luz de fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const bgStars = [
      { x: 30, y: 40 }, { x: 120, y: 70 }, { x: 280, y: 50 },
      { x: 70, y: 220 }, { x: 250, y: 270 }, { x: 180, y: 340 }
    ];
    bgStars.forEach((s, idx) => {
      const alpha = 0.2 + 0.4 * Math.sin(animTick * 0.08 + idx);
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(s.x, s.y, 2, 2);
    });

    // 2. Dibujar Columnas de Luz Celestial (Pipes)
    pipes.forEach(pipe => {
      // Columna Superior
      drawCelestialColumn(pipe.x, 0, PIPE_WIDTH, pipe.top, true);

      // Columna Inferior
      drawCelestialColumn(pipe.x, pipe.bottom, PIPE_WIDTH, CANVAS_HEIGHT - pipe.bottom, false);
    });

    // 3. Partículas de Plumas de Luz
    feathers.forEach(f => {
      const alpha = f.life / f.maxLife;
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Dibujar a Dante Alado (Flappy Soul)
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Aura dorada divina
    const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    aura.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Emoji del Peregrino Alado
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🕊️', 0, 0);

    ctx.restore();

    // 5. Suelo de nubes celestiales
    const cloudGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 12, 0, CANVAS_HEIGHT);
    cloudGrad.addColorStop(0, '#0284c7');
    cloudGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = cloudGrad;
    ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
  }

  function drawCelestialColumn(x, y, w, h, isTop) {
    if (h <= 0) return;

    // Cuerpo de la columna (cristal azul zafiro con bordes dorados)
    const colGrad = ctx.createLinearGradient(x, 0, x + w, 0);
    colGrad.addColorStop(0, '#0369a1');
    colGrad.addColorStop(0.5, '#38bdf8');
    colGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = colGrad;
    ctx.fillRect(x, y, w, h);

    // Borde brillante
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Capitel de la columna (extremo que da al hueco)
    const capHeight = 12;
    const capY = isTop ? y + h - capHeight : y;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 3, capY, w + 6, capHeight);
    ctx.strokeStyle = '#fef08a';
    ctx.strokeRect(x - 3, capY, w + 6, capHeight);
  }

  // Controles de Entrada (Clic, Touch, Botón y Teclado)
  canvas.addEventListener('mousedown', (e) => { e.preventDefault(); flap(); });
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });

  const jumpBtn = container.querySelector('#flappy-jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', (e) => { e.preventDefault(); flap(); });
    jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
  }

  function handleFlappyKeyDown(e) {
    if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      flap();
    }
  }

  window.onkeydown = handleFlappyKeyDown;
  document.onkeydown = null;

  // Bucle a 60 FPS
  const loop = setInterval(() => {
    update();
    draw();
  }, 1000 / 60);

  stateManager.setLoopInterval(loop);

  resetGame();
}
