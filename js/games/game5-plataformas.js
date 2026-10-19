/**
 * Juego 5: Escalada en Plataformas 2D - Las 7 Cornisas del Purgatorio
 * Versión Multivel: 3 Niveles completos a lo largo del Monte Purgatorio:
 * - Nivel 1: Cornisas Bajas (Soberbia, Envidia e Ira - 3 marcas 'P')
 * - Nivel 2: Cornisas Medias y Viento Místico (Pereza y Avaricia - 2 marcas 'P')
 * - Nivel 3: Altas Cornisas y Cima del Edén (Gula y Lujuria - 2 marcas 'P' y cumbre celestial)
 * Total: 7 marcas "P" purificadas para acceder al Paraíso Terrenal con física 60 FPS y salto más ligero.
 */
import { audioManager } from '../core/audio.js';
import { stateManager } from '../core/state.js';

export function initGame5(container, restartGame) {
  const CANVAS_WIDTH = 340;
  const CANVAS_HEIGHT = 420;
  const TOTAL_PS = 7;
  const TOTAL_LEVELS = 3;

  // Definición de los 3 Niveles del Purgatorio
  const levelsData = [
    {
      level: 1,
      title: "Cornisas Bajas",
      subtitle: "Soberbia, Envidia e Ira (3 Marcas)",
      skyGrad: ["#1e1b4b", "#3b0764", "#1c1917"],
      pRange: [0, 1, 2],
      platforms: [
        // Base inferior (Antepurgatorio)
        { x: 10, y: 405, w: 320, h: 15, type: 'ground' },
        // Cornisa 1: Soberbia
        { x: 30, y: 345, w: 90, h: 10, type: 'stone' },
        // Cornisa 2: Envidia (Plataforma Móvil)
        { x: 140, y: 285, w: 85, h: 10, type: 'moving', minX: 120, maxX: 225, vx: 1.2 },
        // Cornisa 3: Ira
        { x: 40, y: 225, w: 90, h: 10, type: 'stone' },
        // Portal al Nivel 2 (Ángel de la Humildad)
        { x: 110, y: 140, w: 120, h: 12, type: 'portal' }
      ],
      items: [
        { id: 0, x: 75, y: 320, active: true, name: 'Soberbia' },
        { id: 1, x: 180, y: 260, active: true, name: 'Envidia', attachTo: 2 },
        { id: 2, x: 85, y: 200, active: true, name: 'Ira' }
      ]
    },
    {
      level: 2,
      title: "Cornisas Medias",
      subtitle: "Pereza y Avaricia (2 Marcas)",
      skyGrad: ["#2e1065", "#7c2d12", "#18181b"],
      pRange: [3, 4],
      platforms: [
        // Base intermedia
        { x: 10, y: 405, w: 320, h: 15, type: 'ground' },
        // Cornisa 1: Roca escarpada
        { x: 220, y: 345, w: 80, h: 10, type: 'stone' },
        // Cornisa 2: Móvil veloz
        { x: 80, y: 285, w: 80, h: 10, type: 'moving', minX: 50, maxX: 180, vx: 1.5 },
        // Cornisa 3: Roca intermedia
        { x: 35, y: 215, w: 85, h: 10, type: 'stone' },
        // Cornisa 4: Móvil alta
        { x: 165, y: 155, w: 80, h: 10, type: 'moving', minX: 130, maxX: 245, vx: -1.4 },
        // Portal al Nivel 3 (Ángel del Celo)
        { x: 70, y: 85, w: 120, h: 12, type: 'portal' }
      ],
      items: [
        { id: 3, x: 120, y: 260, active: true, name: 'Pereza', attachTo: 2 },
        { id: 4, x: 75, y: 190, active: true, name: 'Avaricia' }
      ]
    },
    {
      level: 3,
      title: "Altas Cornisas y Cima del Edén",
      subtitle: "Gula y Lujuria (2 Marcas y Cumbre)",
      skyGrad: ["#0f172a", "#065f46", "#3b1d06"],
      pRange: [5, 6],
      platforms: [
        // Base de las altas terrazas
        { x: 10, y: 405, w: 320, h: 15, type: 'ground' },
        // Cornisa 1: Templanza
        { x: 35, y: 345, w: 75, h: 10, type: 'stone' },
        // Cornisa 2: Plataforma de luz móvil
        { x: 155, y: 285, w: 80, h: 10, type: 'moving', minX: 110, maxX: 235, vx: 1.7 },
        // Cornisa 3: Roca esmeralda
        { x: 45, y: 215, w: 75, h: 10, type: 'stone' },
        // Cornisa 4: Plataforma flotante
        { x: 175, y: 145, w: 75, h: 10, type: 'moving', minX: 125, maxX: 245, vx: -1.6 },
        // Cornisa 5: Escalón previo
        { x: 40, y: 95, w: 70, h: 10, type: 'stone' },
        // CIMA DEL PARAÍSO TERRENAL (EDÉN)
        { x: 90, y: 45, w: 160, h: 12, type: 'summit' }
      ],
      items: [
        { id: 5, x: 195, y: 260, active: true, name: 'Gula', attachTo: 2 },
        { id: 6, x: 80, y: 190, active: true, name: 'Lujuria' }
      ]
    }
  ];

  let currentLevelIdx = 0;
  let clearedMarks = new Set(); // Registra las 'P' purificadas acumuladas (0 a 6)

  // Estado del Jugador (Dante)
  let player = {
    x: 50,
    y: 380,
    vx: 0,
    vy: 0,
    w: 16,
    h: 22,
    grounded: false,
    facing: 1,
    jumpPower: -8.2,
    gravity: 0.38,
    speed: 4.2
  };

  let platforms = [];
  let items = [];
  let isGameOver = false;
  let isLevelTransitioning = false;
  let particles = [];
  let animTick = 0;

  // Estado del teclado
  const keys = { left: false, right: false, jump: false };

  container.innerHTML = `
    <div class="space-y-3 text-center max-w-md w-full">
      <!-- HUD Superior: Nivel y Marcas 'P' -->
      <div class="bg-slate-950/90 p-3 rounded-2xl border border-amber-900/60 shadow-inner flex flex-wrap justify-between items-center text-xs gap-2">
        <div class="flex items-center space-x-2">
          <span id="plat-level-badge" class="px-2.5 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold rounded-full text-[11px]">
            Nivel 1 / 3
          </span>
          <span class="text-slate-300 font-semibold hidden sm:inline">Purificadas:</span>
          <span id="plat-count-text" class="text-amber-400 font-bold text-sm">0 / 7</span>
        </div>
        
        <!-- Marcas visuales 'P' en la frente de Dante -->
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
        🏔️ Nivel 1: Salta y borra las 3 primeras marcas "P" para abrir el portal
      </div>

      <!-- Canvas de Juego de Plataformas -->
      <div class="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-amber-800/80 shadow-2xl bg-slate-950 select-none">
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

  function loadLevel(lvlIdx) {
    currentLevelIdx = lvlIdx;
    isLevelTransitioning = false;
    const lvl = levelsData[currentLevelIdx];

    // Clonar plataformas para mantener estado mutable de las móviles
    platforms = lvl.platforms.map(p => ({ ...p }));
    items = lvl.items.map(it => ({ ...it, active: !clearedMarks.has(it.id) }));

    // Posición inicial del jugador
    player.x = 50;
    player.y = 380;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;

    // Con cada nivel, el salto de Dante es ligeramente más ágil
    player.jumpPower = -8.2 - (clearedMarks.size * 0.22);
    player.speed = 4.2 + (clearedMarks.size * 0.1);

    updateHUD();
  }

  function addSparks(x, y, color = '#f59e0b', count = 14) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4.5,
        vy: (Math.random() - 0.5) * 4.5 - 1.2,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color: color,
        size: 2 + Math.random() * 2.5
      });
    }
  }

  function updateHUD() {
    const lvlBadge = container.querySelector('#plat-level-badge');
    const textEl = container.querySelector('#plat-count-text');
    const banner = container.querySelector('#plat-status-banner');
    const lvl = levelsData[currentLevelIdx];

    if (lvlBadge) {
      lvlBadge.innerText = `Nivel ${lvl.level} / ${TOTAL_LEVELS}`;
    }

    if (textEl) {
      textEl.innerText = `${clearedMarks.size} / ${TOTAL_PS}`;
    }

    // Actualizar casillas de las 7 marcas 'P'
    for (let i = 0; i < TOTAL_PS; i++) {
      const mark = container.querySelector(`#p-mark-${i}`);
      if (mark) {
        if (clearedMarks.has(i)) {
          mark.className = 'w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-emerald-500 border border-emerald-400 text-slate-950 shadow-md scale-105';
          mark.innerHTML = '<i class="fa-solid fa-check text-[9px]"></i>';
        } else if (lvl.pRange.includes(i)) {
          mark.className = 'w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-amber-950/90 border border-amber-500 text-amber-300 animate-pulse';
          mark.innerText = 'P';
        } else {
          mark.className = 'w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] bg-slate-900 border border-slate-700 text-slate-500 opacity-60';
          mark.innerText = 'P';
        }
      }
    }

    if (banner && !isLevelTransitioning) {
      const currentLevelCleared = lvl.pRange.every(id => clearedMarks.has(id));
      if (currentLevelCleared) {
        if (currentLevelIdx < TOTAL_LEVELS - 1) {
          banner.className = "text-xs font-bold text-emerald-400 animate-pulse";
          banner.innerHTML = `✨ ¡Marcas borradas! Sube al portal del Ángel para avanzar al Nivel ${currentLevelIdx + 2}`;
        } else {
          banner.className = "text-xs font-bold text-amber-300 animate-pulse";
          banner.innerHTML = "👑 ¡Todas las 'P' borradas! ¡Sube a la cima del Edén!";
        }
      } else {
        banner.className = "text-xs font-bold text-amber-300";
        banner.innerText = `🏔️ ${lvl.title}: Borra las marcas "P" de este tramo (${lvl.subtitle})`;
      }
    }
  }

  function doJump() {
    if (player.grounded) {
      player.vy = player.jumpPower;
      player.grounded = false;
      audioManager.playClick();
      addSparks(player.x + player.w / 2, player.y + player.h, 'rgba(251, 191, 36, 0.7)', 6);
    }
  }

  function handleLevelComplete() {
    if (isLevelTransitioning) return;
    isLevelTransitioning = true;
    audioManager.playSuccess();
    addSparks(player.x + player.w / 2, player.y, '#34d399', 25);

    if (currentLevelIdx < TOTAL_LEVELS - 1) {
      const nextLvl = currentLevelIdx + 1;
      const banner = container.querySelector('#plat-status-banner');
      if (banner) {
        banner.className = "text-xs font-bold text-emerald-300 animate-bounce";
        banner.innerHTML = `🌟 ¡Nivel ${currentLevelIdx + 1} Superado! Ascendiendo a <strong>${levelsData[nextLvl].title}</strong>...`;
      }

      setTimeout(() => {
        loadLevel(nextLvl);
      }, 1100);
    } else {
      winGame();
    }
  }

  function updatePhysics() {
    if (isGameOver || isLevelTransitioning) return;
    animTick++;

    const lvl = levelsData[currentLevelIdx];

    // Movimiento Horizontal continuo
    if (keys.left) {
      player.vx = -player.speed;
      player.facing = -1;
    } else if (keys.right) {
      player.vx = player.speed;
      player.facing = 1;
    } else {
      player.vx *= 0.76; // Fricción
    }

    if (keys.jump && player.grounded) {
      doJump();
    }

    // Gravedad
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

        // Arrastre suave si es móvil
        if (p.type === 'moving') {
          player.x += p.vx;
        }

        // Si es Portal o Cima y se cumplieron las 'P' del nivel:
        const currentLevelCleared = lvl.pRange.every(id => clearedMarks.has(id));
        if (currentLevelCleared) {
          if (p.type === 'portal') {
            handleLevelComplete();
          } else if (p.type === 'summit') {
            winGame();
          }
        }
      }
    });

    // Colisión con Marcas 'P'
    items.forEach(it => {
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
          clearedMarks.add(it.id);
          audioManager.playSound('success');
          addSparks(it.x, it.y, '#fbbf24', 20);

          // Purificación: salto más ligero y veloz
          player.jumpPower -= 0.22;
          player.speed += 0.1;
          updateHUD();
        }
      }
    });

    // Actualizar partículas
    particles.forEach(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
    });
    particles = particles.filter(pt => pt.life > 0);
  }

  function draw() {
    const lvl = levelsData[currentLevelIdx];

    // 1. Fondo Gradiente Montañoso según el Nivel
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, lvl.skyGrad[0]);
    skyGrad.addColorStop(0.5, lvl.skyGrad[1]);
    skyGrad.addColorStop(1, lvl.skyGrad[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Estrellas / partículas de fondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(30, 25, 2, 2);
    ctx.fillRect(110, 60, 2, 2);
    ctx.fillRect(280, 40, 2, 2);
    ctx.fillRect(240, 95, 2, 2);
    ctx.fillRect(60, 150, 1.5, 1.5);

    // 2. Dibujar Plataformas
    const currentLevelCleared = lvl.pRange.every(id => clearedMarks.has(id));

    platforms.forEach(p => {
      if (p.type === 'ground') {
        // Base inferior
        ctx.fillStyle = '#44403c';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#15803d'; // Césped
        ctx.fillRect(p.x, p.y, p.w, 3);
      } else if (p.type === 'portal') {
        // Portal al siguiente nivel custodiado por Ángel
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = currentLevelCleared ? '#38bdf8' : '#64748b';
        ctx.fillRect(p.x, p.y, p.w, 3);

        if (currentLevelCleared) {
          // Resplandor del portal abierto
          const glow = ctx.createRadialGradient(p.x + p.w / 2, p.y, 8, p.x + p.w / 2, p.y, 50);
          glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(p.x - 15, p.y - 35, p.w + 30, 45);
        }

        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentLevelCleared ? '👼✨' : '👼', p.x + p.w / 2, p.y - 6);
      } else if (p.type === 'summit') {
        // Cima del Edén (Dorado)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p.x, p.y, p.w, 4);

        // Aura celestial de la cumbre
        const glow = ctx.createRadialGradient(p.x + p.w / 2, p.y, 10, p.x + p.w / 2, p.y, 60);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(p.x - 20, p.y - 45, p.w + 40, 55);

        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑👼', p.x + p.w / 2, p.y - 8);
      } else if (p.type === 'moving') {
        // Plataforma móvil
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
        const radGrad = ctx.createRadialGradient(it.x, floatY, 3, it.x, floatY, 16);
        radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
        radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(it.x, floatY, 16, 0, Math.PI * 2);
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

    // Aura de pureza creciente
    const auraRadius = 14 + clearedMarks.size * 2;
    const pAura = ctx.createRadialGradient(px + player.w / 2, py + player.h / 2, 4, px + player.w / 2, py + player.h / 2, auraRadius);
    pAura.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    pAura.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = pAura;
    ctx.beginPath();
    ctx.arc(px + player.w / 2, py + player.h / 2, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Sprite de Dante
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
        <div class="text-center space-y-4 max-w-sm mx-auto p-4">
          <i class="fa-solid fa-crown text-5xl text-amber-400 animate-bounce"></i>
          <h3 class="font-cinzel text-2xl font-bold text-white">¡Cima del Purgatorio Conquistada!</h3>
          <p class="text-slate-300 text-sm leading-relaxed">
            Has superado los <strong>3 niveles</strong>, borrado las <strong>7 marcas "P"</strong> y entrado con éxito al sagrado <strong>Paraíso Terrenal (Edén)</strong>.
          </p>
          <div class="pt-2">
            <button id="retry-g5-btn" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-transform active:scale-95 shadow-xl flex items-center justify-center space-x-2 mx-auto">
              <i class="fa-solid fa-rotate-right"></i>
              <span>JUGAR DE NUEVO (NIVEL 1)</span>
            </button>
          </div>
        </div>
      `;
      container.querySelector('#retry-g5-btn').addEventListener('click', () => {
        restartGame(5);
      });
    }, 450);
  }

  // Manejo de Teclado
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
  document.onkeydown = null;
  window.onkeyup = handleKeyUp;
  document.onkeyup = null;

  // Botones táctiles
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

  // Inicializar Nivel 1
  loadLevel(0);

  // Bucle de físicas y render a 60 FPS
  const loop = setInterval(() => {
    updatePhysics();
    draw();
  }, 1000 / 60);

  stateManager.setLoopInterval(loop);
}
