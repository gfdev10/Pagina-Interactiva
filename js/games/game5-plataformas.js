/**
 * Juego 5: Escalada en Plataformas 2D - Las 7 Cornisas del Purgatorio
 * Versión Mejorada: Motor de físicas 60FPS con inercia suave, plataformas móviles,
 * partículas de luz, HUD de marcas 'P', aumento progresivo de ligereza y cima del Edén.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame5(container, restartGame) {
  const CANVAS_WIDTH = 340;
  const CANVAS_HEIGHT = 420;
  const TOTAL_PS = 7;

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior: Marcas 'P' en la frente de Dante -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-amber-900/60 shadow-inner flex justify-between items-center text-xs">
        <div class="flex items-center space-x-2">
          <i class="fa-solid fa-mountain-sun text-amber-400"></i>
          <span class="text-slate-300 font-semibold">Marcas purificadas:</span>
          <span id="plat-count-text" class="text-amber-400 font-bold text-sm">0 / 7</span>
        </div>
        
        <!-- Marcas visuales 'P' -->
        <div class="flex items-center space-x-1" id="plat-p-marks">
          ${Array(TOTAL_PS).fill(0).map((_, i) => `
            <span id="p-mark-${i}" class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-amber-950/80 border border-amber-700 text-amber-300 transition-all duration-300">
              P
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Estado dinámico -->
      <div id="plat-status-banner" class="text-xs font-bold text-amber-300 transition-all">
        🏔️ Salta entre las cornisas y borra las 7 marcas "P" para alcanzar la cima
      </div>

      <!-- Canvas del Juego de Plataformas -->
      <div class="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-amber-800/80 shadow-2xl bg-slate-950">
        <canvas id="plat-canvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" class="block"></canvas>
      </div>

      <!-- Controles Táctiles / Botones -->
      <div class="flex justify-center items-center gap-3 pt-1 select-none">
        <button id="plat-btn-left" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-white rounded-xl text-xs font-bold border border-slate-700 transition-transform shadow-md flex items-center space-x-1">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Izq</span>
        </button>
        <button id="plat-btn-jump" class="px-8 py-3 bg-amber-500 hover:bg-amber-400 active:scale-90 text-slate-950 rounded-xl text-xs font-black shadow-lg transition-transform flex items-center space-x-1.5">
          <i class="fa-solid fa-arrow-up"></i>
          <span>SALTAR</span>
        </button>
        <button id="plat-btn-right" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:scale-90 text-white rounded-xl text-xs font-bold border border-slate-700 transition-transform shadow-md flex items-center space-x-1">
          <span>Der</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <p class="text-[11px] text-slate-500">Mueve con las FLECHAS o A/D. Salta con ESPACIO, W o FLECHA ARRIBA.</p>
    </div>
  `;

  const canvas = container.querySelector('#plat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Estado del Jugador (Dante)
  let player = {
    x: 50,
    y: 380,
    vx: 0,
    vy: 0,
    w: 16,
    h: 22,
    grounded: false,
    facing: 1, // 1: derecha, -1: izquierda
    jumpPower: -8.2, // Aumenta con cada 'P' borrada
    gravity: 0.38,
    speed: 4.2
  };

  let psCollected = 0;
  let isGameOver = false;
  let particles = [];
  let animTick = 0;

  // Estado continuo del teclado para movimiento 100% fluido
  const keys = { left: false, right: false, jump: false };

  // Definición de Plataformas (fijas y móviles)
  const platforms = [
    // Base inferior (Antepurgatorio)
    { x: 10, y: 405, w: 320, h: 15, type: 'ground' },

    // Cornisa 1: Soberbia
    { x: 30, y: 345, w: 85, h: 10, type: 'stone' },

    // Cornisa 2: Envidia (Plataforma Móvil Horizontal)
    { x: 140, y: 295, w: 80, h: 10, type: 'moving', minX: 130, maxX: 230, vx: 1.2 },

    // Cornisa 3: Ira
    { x: 40, y: 245, w: 85, h: 10, type: 'stone' },

    // Cornisa 4: Pereza (Plataforma Móvil Horizontal)
    { x: 150, y: 195, w: 80, h: 10, type: 'moving', minX: 140, maxX: 240, vx: -1.3 },

    // Cornisa 5: Avaricia
    { x: 35, y: 145, w: 85, h: 10, type: 'stone' },

    // Cornisa 6: Gula (Plataforma Móvil Flotante)
    { x: 150, y: 95, w: 80, h: 10, type: 'moving', minX: 130, maxX: 230, vx: 1.4 },

    // Cornisa 7 / Cima del Purgatorio: El Paraíso Terrenal
    { x: 80, y: 45, w: 180, h: 12, type: 'summit' }
  ];

  // Las 7 Marcas 'P' distribuidas en el ascenso
  const items = [
    { id: 0, x: 72, y: 320, active: true, name: 'Soberbia' },
    { id: 1, x: 180, y: 270, active: true, name: 'Envidia', attachTo: 2 },
    { id: 2, x: 82, y: 220, active: true, name: 'Ira' },
    { id: 3, x: 190, y: 170, active: true, name: 'Pereza', attachTo: 4 },
    { id: 4, x: 77, y: 120, active: true, name: 'Avaricia' },
    { id: 5, x: 190, y: 70, active: true, name: 'Gula', attachTo: 6 },
    { id: 6, x: 170, y: 22, active: true, name: 'Lujuria' }
  ];

  // Partículas mágicas al borrar marcas 'P'
  function addSparks(x, y, color = '#f59e0b', count = 12) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: color,
        size: 2 + Math.random() * 2.5
      });
    }
  }

  function updateHUD() {
    const textEl = container.querySelector('#plat-count-text');
    const banner = container.querySelector('#plat-status-banner');

    if (textEl) {
      textEl.innerText = `${psCollected} / ${TOTAL_PS}`;
    }

    items.forEach((it, idx) => {
      const mark = container.querySelector(`#p-mark-${idx}`);
      if (mark) {
        if (!it.active) {
          mark.className = 'w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-emerald-500 border border-emerald-400 text-slate-950 shadow-md scale-110';
          mark.innerHTML = '<i class="fa-solid fa-check text-[9px]"></i>';
        } else {
          mark.className = 'w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-amber-950/80 border border-amber-700 text-amber-300';
          mark.innerText = 'P';
        }
      }
    });

    if (banner) {
      if (psCollected >= TOTAL_PS) {
        banner.className = "text-xs font-bold text-emerald-400 animate-pulse";
        banner.innerHTML = "✨ ¡Las 7 'P' han sido borradas! ¡Sube a la cima del Edén!";
      } else {
        banner.className = "text-xs font-bold text-amber-300";
        banner.innerText = `🏔️ Marcas restantes: ${TOTAL_PS - psCollected} (Tu salto se vuelve más ligero al purificar)`;
      }
    }
  }

  function doJump() {
    if (player.grounded) {
      player.vy = player.jumpPower;
      player.grounded = false;
      audioManager.playClick();
      addSparks(player.x + player.w / 2, player.y + player.h, 'rgba(251, 191, 36, 0.6)', 5);
    }
  }

  function updatePhysics() {
    if (isGameOver) return;
    animTick++;

    // Movimiento Horizontal continuo
    if (keys.left) {
      player.vx = -player.speed;
      player.facing = -1;
    } else if (keys.right) {
      player.vx = player.speed;
      player.facing = 1;
    } else {
      player.vx *= 0.75; // Fricción
    }

    if (keys.jump && player.grounded) {
      doJump();
    }

    // Aplicar Gravedad
    player.vy += player.gravity;

    // Actualizar Posición
    player.x += player.vx;
    player.y += player.vy;

    // Límites Laterales
    if (player.x < 5) player.x = 5;
    if (player.x > CANVAS_WIDTH - player.w - 5) player.x = CANVAS_WIDTH - player.w - 5;

    // Actualizar plataformas móviles
    platforms.forEach(p => {
      if (p.type === 'moving') {
        p.x += p.vx;
        if (p.x <= p.minX || p.x >= p.maxX) {
          p.vx *= -1;
        }
      }
    });

    // Colisión con Plataformas
    player.grounded = false;
    platforms.forEach(p => {
      const isFalling = player.vy >= 0;
      const withinX = player.x + player.w > p.x && player.x < p.x + p.w;
      const onTop = player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 8;

      if (isFalling && withinX && onTop) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;

        // Si la plataforma es móvil, arrastra suavemente a Dante
        if (p.type === 'moving') {
          player.x += p.vx;
        }
      }
    });

    // Colisión con Marcas 'P'
    items.forEach(it => {
      // Si el item está anclado a plataforma móvil, seguirla
      if (it.attachTo !== undefined) {
        const plat = platforms[it.attachTo];
        if (plat) {
          it.x = plat.x + plat.w / 2;
        }
      }

      if (it.active) {
        const pCenterX = player.x + player.w / 2;
        const pCenterY = player.y + player.h / 2;
        if (Math.hypot(pCenterX - it.x, pCenterY - it.y) < 22) {
          it.active = false;
          psCollected++;
          audioManager.playSound('success');
          addSparks(it.x, it.y, '#fbbf24', 18);

          // Dante se vuelve progresivamente más ligero con cada pecado purificado
          player.jumpPower -= 0.25;
          player.speed += 0.15;
          updateHUD();
        }
      }
    });

    // Condición de Victoria: Todas las 'P' recolectadas y llegar a la cima del Edén
    if (psCollected >= TOTAL_PS && player.y <= 60 && player.grounded) {
      winGame();
    }

    // Actualizar partículas
    particles.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
    });
    particles = particles.filter(pt => pt.life > 0);
  }

  function draw() {
    // 1. Fondo Gradiente Montaña Purgatorio (Amanecer / Cielo Místico)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#1e1b4b'); // Azul noche estrellado arriba
    skyGrad.addColorStop(0.5, '#3b0764'); // Púrpura intermedio
    skyGrad.addColorStop(1, '#1c1917'); // Piedra oscura abajo
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estrellas sutiles de fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(30, 25, 2, 2);
    ctx.fillRect(110, 60, 2, 2);
    ctx.fillRect(280, 40, 2, 2);
    ctx.fillRect(240, 90, 2, 2);

    // 2. Dibujar Plataformas
    platforms.forEach(p => {
      if (p.type === 'ground') {
        // Base inferior
        ctx.fillStyle = '#44403c';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#15803d'; // Césped
        ctx.fillRect(p.x, p.y, p.w, 3);
      } else if (p.type === 'summit') {
        // Cima del Edén (Dorado resplandeciente)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x, p.y, p.w, 4);

        // Aura celestial de la cumbre
        const glow = ctx.createRadialGradient(p.x + p.w / 2, p.y, 10, p.x + p.w / 2, p.y, 60);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 20, p.y - 40, p.w + 40, 50);

        // Ángel o Portal en la cima
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('👼', p.x + p.w / 2, p.y - 8);
      } else if (p.type === 'moving') {
        // Plataforma móvil de nube/piedra mística
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 3);
      } else {
        // Cornisa de roca montañosa
        ctx.fillStyle = '#78350f';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(p.x, p.y, p.w, 3);
      }
    });

    // 3. Dibujar Marcas 'P' Flotantes
    items.forEach(it => {
      if (it.active) {
        const floatY = it.y + Math.sin(animTick * 0.1 + it.id) * 4;

        // Aura dorada
        const radGrad = ctx.createRadialGradient(it.x, floatY, 3, it.x, floatY, 15);
        radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
        radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(it.x, floatY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Letra 'P'
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', it.x, floatY);
      }
    });

    // 4. Dibujar Partículas
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life / pt.maxLife;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 5. Dibujar a Dante
    const px = player.x;
    const py = player.y;

    // Aura de pureza que crece con el progreso
    const auraRadius = 14 + psCollected * 1.5;
    const pAura = ctx.createRadialGradient(px + player.w / 2, py + player.h / 2, 4, px + player.w / 2, py + player.h / 2, auraRadius);
    pAura.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    pAura.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = pAura;
    ctx.beginPath();
    ctx.arc(px + player.w / 2, py + player.h / 2, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo de Dante (Túnica / Avatar)
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.save();
    ctx.translate(px + player.w / 2, py + player.h + 2);
    if (player.facing === -1) {
      ctx.scale(-1, 1);
    }
    ctx.fillText('🚶', 0, 0);
    ctx.restore();
  }

  function winGame() {
    isGameOver = true;
    stateManager.clearGameLoops();
    stateManager.markGameCompleted(5);

    setTimeout(() => {
      container.innerHTML = `
        <div class="text-center space-y-4">
          <i class="fa-solid fa-mountain-sun text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Cima del Purgatorio Alcanzada!</h3>
          <p class="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
            Has borrado las 7 marcas "P" de la frente de Dante al subir todas las cornisas y has entrado al <strong>Paraíso Terrenal (Edén)</strong>.
          </p>
          <button id="retry-g5-btn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-bold rounded-xl border border-slate-700 transition-colors shadow-lg">
            <i class="fa-solid fa-rotate-right mr-1"></i> Jugar de nuevo
          </button>
        </div>
      `;
      container.querySelector('#retry-g5-btn').addEventListener('click', () => {
        restartGame(5);
      });
    }, 400);
  }

  // Configuración de Teclado Continua
  function handleKeyDown(e) {
    if (isGameOver) return;
    const k = e.key;
    const c = e.code;

    if (k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || k === 'a' || k === 'A' || c === 'KeyA') {
      e.preventDefault();
      keys.left = true;
    }
    if (k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || k === 'd' || k === 'D' || c === 'KeyD') {
      e.preventDefault();
      keys.right = true;
    }
    if (k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || k === ' ' || c === 'Space' || k === 'w' || k === 'W' || c === 'KeyW') {
      e.preventDefault();
      keys.jump = true;
    }
  }

  function handleKeyUp(e) {
    const k = e.key;
    const c = e.code;

    if (k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || k === 'a' || k === 'A' || c === 'KeyA') {
      keys.left = false;
    }
    if (k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || k === 'd' || k === 'D' || c === 'KeyD') {
      keys.right = false;
    }
    if (k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || k === ' ' || c === 'Space' || k === 'w' || k === 'W' || c === 'KeyW') {
      keys.jump = false;
    }
  }

  window.onkeydown = handleKeyDown;
  document.onkeydown = handleKeyDown;
  window.onkeyup = handleKeyUp;
  document.onkeyup = handleKeyUp;

  // Botones táctiles interactivos con soporte de mantener presionado
  const btnLeft = container.querySelector('#plat-btn-left');
  const btnRight = container.querySelector('#plat-btn-right');
  const btnJump = container.querySelector('#plat-btn-jump');

  const bindTouch = (elem, keyName) => {
    elem.addEventListener('mousedown', (e) => { e.preventDefault(); keys[keyName] = true; });
    elem.addEventListener('mouseup', (e) => { e.preventDefault(); keys[keyName] = false; });
    elem.addEventListener('mouseleave', () => { keys[keyName] = false; });
    elem.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
    elem.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
  };

  bindTouch(btnLeft, 'left');
  bindTouch(btnRight, 'right');
  bindTouch(btnJump, 'jump');

  // Bucle de físicas y renderizado a 60 FPS
  const loop = setInterval(() => {
    updatePhysics();
    draw();
  }, 1000 / 60);

  stateManager.setLoopInterval(loop);
  updateHUD();
}
