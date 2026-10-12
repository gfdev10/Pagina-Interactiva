/**
 * Lógica Interactiva del Árbol de los Sueños y Vocaciones (7mo Grado)
 * Maneja el crecimiento procedural del árbol, almacenamiento de hojas en localStorage,
 * efectos de sonido sintetizados y detalles de cada vocación.
 * 
 * - Sin límite de hojas: soporta crecimiento ilimitado distribuyendo hojas en múltiples capas.
 * - Registra y muestra: Nombre, Profesión soñada, Escuela del alumno, Reflexión y Color.
 */

// Banco de colores temáticos para las hojas
export const LEAF_PALETTES = {
  emerald: {
    name: 'Esmeralda (Naturaleza & Ciencias)',
    fill: '#10b981',
    fillHover: '#34d399',
    stroke: '#059669',
    text: '#ecfdf5',
    icon: 'fa-seedling'
  },
  gold: {
    name: 'Dorado (Liderazgo & Sabiduría)',
    fill: '#f59e0b',
    fillHover: '#fbbf24',
    stroke: '#d97706',
    text: '#fffbeb',
    icon: 'fa-sun'
  },
  sapphire: {
    name: 'Zafiro (Tecnología & Exploración)',
    fill: '#0284c7',
    fillHover: '#38bdf8',
    stroke: '#0369a1',
    text: '#f0f9ff',
    icon: 'fa-compass'
  },
  amethyst: {
    name: 'Amatista (Arte & Creatividad)',
    fill: '#8b5cf6',
    fillHover: '#a78bfa',
    stroke: '#7c3aed',
    text: '#f5f3ff',
    icon: 'fa-palette'
  },
  ruby: {
    name: 'Rubí (Pasión, Deporte & Salud)',
    fill: '#f43f5e',
    fillHover: '#fb7185',
    stroke: '#e11d48',
    text: '#fff1f2',
    icon: 'fa-heart-pulse'
  }
};

// Alumnos de ejemplo para demostración rápida de 7mo Grado
const SAMPLE_STUDENTS = [
  { name: 'Valentina Rossi', profession: 'Médica Pediatra', school: 'Escuela Primaria N° 12', note: 'Quiero cuidar la salud de los niños y ayudar a salvar vidas.', color: 'ruby' },
  { name: 'Mateo Benítez', profession: 'Ingeniero Aeroespacial', school: 'Colegio Belgrano', note: 'Sueño con diseñar cohetes y satélites para explorar otros planetas.', color: 'sapphire' },
  { name: 'Lucía Fernández', profession: 'Escritora y Profesora', school: 'Escuela N° 5 Sarmiento', note: 'Deseo inspirar a futuros jóvenes a través de la literatura y la poesía.', color: 'amethyst' },
  { name: 'Joaquín Gómez', profession: 'Biólogo Marino', school: 'Escuela Primaria N° 12', note: 'Proteger la vida de los arrecifes y limpiar los océanos.', color: 'emerald' },
  { name: 'Camila Suárez', profession: 'Arquitecta Sustentable', school: 'Instituto San Martín', note: 'Construir ciudades verdes con energía solar y jardines verticales.', color: 'gold' },
  { name: 'Ignacio Morales', profession: 'Programador de Videojuegos', school: 'Escuela N° 5 Sarmiento', note: 'Crear mundos interactivos que enseñen historia y ciencia jugando.', color: 'sapphire' },
  { name: 'Sofía Álvarez', profession: 'Veterinaria', school: 'Colegio Belgrano', note: 'Rescatar animales en peligro y cuidar a las mascotas.', color: 'emerald' },
  { name: 'Tomás Romero', profession: 'Músico y Compositor', school: 'Escuela Primaria N° 12', note: 'Transmitir emociones y alegrar el corazón de las personas con música.', color: 'amethyst' },
  { name: 'Martina Castro', profession: 'Astrónoma', school: 'Instituto San Martín', note: 'Descubrir nuevas estrellas y comprender los misterios del universo.', color: 'sapphire' },
  { name: 'Lucas Medina', profession: 'Abogado de Derechos Humanos', school: 'Colegio Mariano Moreno', note: 'Luchar por la justicia, la verdad y la igualdad de oportunidades.', color: 'gold' }
];

class ArbolVocacional {
  constructor() {
    this.storageKey = 'dante_arbol_alumnos';
    this.leaves = this.loadLeaves();
    this.audioCtx = null;
    this.soundEnabled = true;

    this.initAudio();
    this.bindEvents();
    this.render();
  }

  // Audio con síntesis armónica (arpa y carillón de hojas)
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Audio no disponible', e);
    }
  }

  playChime(noteFreq = 523.25) { // C5
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Error audio chime', e);
    }
  }

  playLeafBloomSound() {
    // Acorde arpegiado ascendente (C5 - E5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playChime(freq), idx * 80);
    });
  }

  loadLeaves() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error leyendo localStorage', e);
    }
    return [];
  }

  saveLeaves() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.leaves));
    } catch (e) {
      console.warn('Error guardando en localStorage', e);
    }
  }

  addLeaf(name, profession, school, note = '', color = 'emerald') {
    const newLeaf = {
      id: 'leaf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      profession: profession.trim(),
      school: (school || '7mo Grado').trim(),
      note: note.trim(),
      color: color || 'emerald',
      timestamp: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };

    this.leaves.push(newLeaf);
    this.saveLeaves();
    this.playLeafBloomSound();
    this.render();

    // Enfocar y hacer brillar la nueva hoja
    setTimeout(() => {
      const element = document.getElementById(`leaf-node-${newLeaf.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);

    return newLeaf;
  }

  removeLeaf(id) {
    this.leaves = this.leaves.filter(l => l.id !== id);
    this.saveLeaves();
    this.render();
  }

  loadSampleClass(count = 6) {
    const toAdd = SAMPLE_STUDENTS.slice(0, count);
    toAdd.forEach(student => {
      this.leaves.push({
        id: 'leaf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: student.name,
        profession: student.profession,
        school: student.school || '7mo Grado',
        note: student.note,
        color: student.color,
        timestamp: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
      });
    });
    this.saveLeaves();
    this.playLeafBloomSound();
    this.render();
  }

  clearTree() {
    if (confirm('¿Deseas reiniciar el árbol y vaciar las hojas para una nueva clase?')) {
      this.leaves = [];
      this.saveLeaves();
      this.render();
    }
  }

  // Cálculo de etapa de crecimiento sin límite artificial de hojas (iniciando en Semilla)
  getGrowthStageInfo() {
    const count = this.leaves.length;

    if (count === 0) {
      return {
        stage: 0,
        isSeed: true,
        isSprout: false,
        title: 'Semilla de la Vocación (Sin Germinar)',
        badge: '🌰 Semilla Plantada',
        desc: 'La semilla está sembrada en tierra fértil. ¡Agrega la primera hoja con tu vocación para hacerla brotar!',
        scale: 0.35,
        trunkHeight: 50,
        trunkWidth: 16,
        foliageRadiusX: 60,
        foliageRadiusY: 45,
        branchesCount: 0,
        glowColor: 'rgba(245, 158, 11, 0.45)'
      };
    } else if (count <= 3) {
      return {
        stage: 1,
        isSeed: false,
        isSprout: true,
        title: 'Brote Tierno (La Semilla Germina)',
        badge: '🌱 Brote Recién Nacido',
        desc: '¡La semilla ha germinado! Un tallo tierno y lleno de vida se alza con las primeras hojas del curso.',
        scale: 0.55,
        trunkHeight: 150,
        trunkWidth: 20,
        foliageRadiusX: 120,
        foliageRadiusY: 85,
        branchesCount: 3,
        glowColor: 'rgba(52, 211, 153, 0.35)'
      };
    } else if (count <= 8) {
      return {
        stage: 2,
        isSeed: false,
        isSprout: false,
        title: 'Arbusto en Crecimiento',
        badge: '🌿 En Desarrollo',
        desc: 'Nuevas ramas brotan hacia los lados. El tronco adquiere firmeza con las primeras vocaciones.',
        scale: 0.78,
        trunkHeight: 240,
        trunkWidth: 38,
        foliageRadiusX: 200,
        foliageRadiusY: 140,
        branchesCount: 7,
        glowColor: 'rgba(52, 211, 153, 0.4)'
      };
    } else if (count <= 18) {
      return {
        stage: 3,
        isSeed: false,
        isSprout: false,
        title: 'Árbol Joven y Frondoso',
        badge: '🌳 Árbol Frondoso',
        desc: 'La copa se expande con fuerza. Múltiples ramas albergan las metas y aspiraciones del curso.',
        scale: 0.98,
        trunkHeight: 310,
        trunkWidth: 50,
        foliageRadiusX: 280,
        foliageRadiusY: 190,
        branchesCount: 11,
        glowColor: 'rgba(245, 158, 11, 0.35)'
      };
    } else if (count <= 35) {
      return {
        stage: 4,
        isSeed: false,
        isSprout: false,
        title: 'Gran Árbol de la Sabiduría',
        badge: '✨ Gran Árbol',
        desc: 'Un árbol imponente y frondoso. Sus ramas alcanzan las alturas con la diversidad de vocaciones.',
        scale: 1.18,
        trunkHeight: 370,
        trunkWidth: 62,
        foliageRadiusX: 350,
        foliageRadiusY: 230,
        branchesCount: 15,
        glowColor: 'rgba(245, 158, 11, 0.5)'
      };
    } else if (count <= 60) {
      return {
        stage: 5,
        isSeed: false,
        isSprout: false,
        title: 'Roble Centenario en Plenitud',
        badge: '👑 Roble Centenario',
        desc: '¡Esplendor absoluto! Todos los sueños de la clase forman una copa majestuosa y llena de vida.',
        scale: 1.35,
        trunkHeight: 410,
        trunkWidth: 72,
        foliageRadiusX: 410,
        foliageRadiusY: 260,
        branchesCount: 20,
        glowColor: 'rgba(251, 191, 36, 0.65)'
      };
    } else {
      // Crecimiento Ilimitado (61+ hojas)
      const extraFactor = Math.min(1.2, 1 + Math.log10(count / 60) * 0.15);
      return {
        stage: 6,
        isSeed: false,
        isSprout: false,
        title: 'Árbol Cósmico de los Sueños (Infinito)',
        badge: '🌟 Árbol Infinito',
        desc: `¡Árbol sin fronteras! Con ${count} hojas florecidas, las vocaciones forman un bosque de sabiduría inagotable.`,
        scale: 1.45,
        trunkHeight: Math.min(430, Math.round(410 * extraFactor)),
        trunkWidth: Math.min(84, Math.round(72 * extraFactor)),
        foliageRadiusX: Math.min(430, Math.round(410 * extraFactor)),
        foliageRadiusY: Math.min(275, Math.round(260 * extraFactor)),
        branchesCount: 24,
        glowColor: 'rgba(251, 191, 36, 0.85)'
      };
    }
  }

  // Generador dinámico del SVG del Árbol y sus hojas
  generateTreeSVG() {
    const stage = this.getGrowthStageInfo();
    const count = this.leaves.length;

    const baseCenterX = 450;
    const baseGroundY = 680;
    const trunkTopY = baseGroundY - stage.trunkHeight;

    // CASO 1: LA SEMILLA EN LA TIERRA FÉRTIL (0 HOJAS)
    if (stage.isSeed) {
      return `
      <svg id="tree-svg" viewBox="0 0 900 800" class="w-full h-full max-h-[640px] select-none mx-auto overflow-visible">
        <defs>
          <radialGradient id="seedGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="35%" stop-color="#f59e0b" />
            <stop offset="75%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#451a03" />
          </radialGradient>
          <radialGradient id="earthGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#047857" />
            <stop offset="25%" stop-color="#065f46" />
            <stop offset="60%" stop-color="#3d2314" />
            <stop offset="100%" stop-color="#1c0f06" />
          </radialGradient>
          <radialGradient id="seedGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(251, 191, 36, 0.75)" />
            <stop offset="60%" stop-color="rgba(245, 158, 11, 0.25)" />
            <stop offset="100%" stop-color="rgba(245, 158, 11, 0)" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Suelo con colina fértil -->
        <ellipse cx="${baseCenterX}" cy="${baseGroundY + 120}" rx="420" ry="140" fill="#064e3b" opacity="0.95" />
        <ellipse cx="${baseCenterX}" cy="${baseGroundY + 80}" rx="380" ry="110" fill="url(#earthGrad)" opacity="0.9" />

        <!-- Montículo de siembra -->
        <ellipse cx="${baseCenterX}" cy="${baseGroundY - 15}" rx="110" ry="40" fill="#451a03" stroke="#78350f" stroke-width="2" />
        <ellipse cx="${baseCenterX}" cy="${baseGroundY - 22}" rx="90" ry="28" fill="#58311a" opacity="0.8" />

        <!-- Halo brillante de la semilla -->
        <circle cx="${baseCenterX}" cy="${baseGroundY - 45}" r="110" fill="url(#seedGlow)" class="animate-pulse" />

        <!-- Raicillas germinando hacia la tierra fértil -->
        <g stroke="#d97706" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8">
          <path d="M ${baseCenterX} ${baseGroundY - 10} Q ${baseCenterX - 25} ${baseGroundY + 15} ${baseCenterX - 45} ${baseGroundY + 45}" />
          <path d="M ${baseCenterX} ${baseGroundY - 10} Q ${baseCenterX + 25} ${baseGroundY + 15} ${baseCenterX + 45} ${baseGroundY + 45}" />
          <path d="M ${baseCenterX} ${baseGroundY - 5} Q ${baseCenterX} ${baseGroundY + 25} ${baseCenterX - 15} ${baseGroundY + 55}" />
          <path d="M ${baseCenterX} ${baseGroundY - 5} Q ${baseCenterX + 10} ${baseGroundY + 25} ${baseCenterX + 20} ${baseGroundY + 55}" />
        </g>

        <!-- La Semilla de Oro Orgánica en el centro -->
        <g class="transition-transform duration-500 hover:scale-110 origin-center cursor-pointer">
          <!-- Cuerpo de la semilla -->
          <path d="M ${baseCenterX} ${baseGroundY - 95}
                   C ${baseCenterX + 38} ${baseGroundY - 95}, ${baseCenterX + 55} ${baseGroundY - 55}, ${baseCenterX + 40} ${baseGroundY - 18}
                   C ${baseCenterX + 22} ${baseGroundY + 8}, ${baseCenterX} ${baseGroundY + 14}, ${baseCenterX} ${baseGroundY + 14}
                   C ${baseCenterX} ${baseGroundY + 14}, ${baseCenterX - 22} ${baseGroundY + 8}, ${baseCenterX - 40} ${baseGroundY - 18}
                   C ${baseCenterX - 55} ${baseGroundY - 55}, ${baseCenterX - 38} ${baseGroundY - 95}, ${baseCenterX} ${baseGroundY - 95} Z"
                fill="url(#seedGrad)" stroke="#f59e0b" stroke-width="3" filter="url(#softGlow)" />

          <!-- Vetas doradas de la semilla -->
          <path d="M ${baseCenterX} ${baseGroundY - 90} Q ${baseCenterX + 25} ${baseGroundY - 55} ${baseCenterX} ${baseGroundY + 6}" stroke="rgba(254, 240, 138, 0.7)" stroke-width="2" fill="none" />
          <path d="M ${baseCenterX} ${baseGroundY - 90} Q ${baseCenterX - 25} ${baseGroundY - 55} ${baseCenterX} ${baseGroundY + 6}" stroke="rgba(120, 53, 15, 0.4)" stroke-width="2" fill="none" />

          <!-- Primer brotecito verde asomando de la punta de la semilla -->
          <path d="M ${baseCenterX - 4} ${baseGroundY - 92} Q ${baseCenterX - 20} ${baseGroundY - 122} ${baseCenterX - 2} ${baseGroundY - 132} Q ${baseCenterX + 16} ${baseGroundY - 118} ${baseCenterX + 4} ${baseGroundY - 92} Z"
                fill="#10b981" stroke="#059669" stroke-width="2" />
          <path d="M ${baseCenterX} ${baseGroundY - 95} L ${baseCenterX - 6} ${baseGroundY - 124}" stroke="#34d399" stroke-width="1.5" />

          <!-- Destellos de luz en la semilla -->
          <circle cx="${baseCenterX - 14}" cy="${baseGroundY - 65}" r="6" fill="#fef08a" opacity="0.9" />
          <circle cx="${baseCenterX + 16}" cy="${baseGroundY - 40}" r="3.5" fill="#fef08a" opacity="0.75" />
        </g>

        <!-- Cartel flotante de la semilla -->
        <g transform="translate(${baseCenterX}, ${baseGroundY - 180})">
          <rect x="-155" y="-24" width="310" height="48" rx="14" fill="rgba(15, 23, 42, 0.92)" stroke="#f59e0b" stroke-width="1.6" filter="url(#softGlow)" />
          <text x="0" y="-4" text-anchor="middle" fill="#fef08a" font-size="13" font-weight="bold" font-family="'Cinzel', serif">
            🌰 SEMILLA DE LA VOCACIÓN
          </text>
          <text x="0" y="14" text-anchor="middle" fill="#94a3b8" font-size="10.5" font-weight="600" font-family="'Quicksand', sans-serif">
            ¡Agrega tu nombre y profesión para hacerla germinar!
          </text>
        </g>
      </svg>
      `;
    }

    // CASO 2: EL ÁRBOL / BROTE EN CRECIMIENTO (CON HOJAS)
    // Distribución armónica de las hojas en múltiples capas (sin límite)
    const leafPositions = this.calculateLeafSockets(count, baseCenterX, trunkTopY, stage);

    let branchesSVG = '';
    let foliageBubblesSVG = '';
    let leavesSVG = '';

    // 1. Burbujas de follaje verde de fondo según el tamaño
    const foliageColors = ['#065f46', '#047857', '#059669', '#10b981'];
    const bubbleOffsets = [
      { dx: 0, dy: -stage.foliageRadiusY * 0.45, rx: stage.foliageRadiusX * 0.65, ry: stage.foliageRadiusY * 0.6 },
      { dx: -stage.foliageRadiusX * 0.45, dy: -stage.foliageRadiusY * 0.15, rx: stage.foliageRadiusX * 0.55, ry: stage.foliageRadiusY * 0.55 },
      { dx: stage.foliageRadiusX * 0.45, dy: -stage.foliageRadiusY * 0.15, rx: stage.foliageRadiusX * 0.55, ry: stage.foliageRadiusY * 0.55 },
      { dx: -stage.foliageRadiusX * 0.25, dy: -stage.foliageRadiusY * 0.55, rx: stage.foliageRadiusX * 0.5, ry: stage.foliageRadiusY * 0.5 },
      { dx: stage.foliageRadiusX * 0.25, dy: -stage.foliageRadiusY * 0.55, rx: stage.foliageRadiusX * 0.5, ry: stage.foliageRadiusY * 0.5 }
    ];

    bubbleOffsets.forEach((b, idx) => {
      foliageBubblesSVG += `
        <ellipse 
          cx="${baseCenterX + b.dx}" 
          cy="${trunkTopY + b.dy}" 
          rx="${b.rx}" 
          ry="${b.ry}" 
          fill="${foliageColors[idx % foliageColors.length]}" 
          opacity="0.85" 
          class="transition-all duration-700 ease-out"
        />
      `;
    });

    // 2. Tronco orgánico con curvas y raíces (o tallo tierno si es brote)
    let trunkPath = '';
    let seedBaseSVG = '';

    if (stage.isSprout) {
      // Tallo tierno que nace de la semilla abierta
      trunkPath = `
        M ${baseCenterX - 9} ${baseGroundY - 20}
        C ${baseCenterX - 7} ${baseGroundY - 60}, ${baseCenterX - 5} ${trunkTopY + 30}, ${baseCenterX - 4} ${trunkTopY}
        L ${baseCenterX + 4} ${trunkTopY}
        C ${baseCenterX + 5} ${trunkTopY + 30}, ${baseCenterX + 7} ${baseGroundY - 60}, ${baseCenterX + 9} ${baseGroundY - 20}
        Z
      `;
      // Semilla abierta en la base
      seedBaseSVG = `
        <g transform="translate(${baseCenterX}, ${baseGroundY - 15})">
          <ellipse cx="0" cy="0" rx="35" ry="16" fill="#58311a" stroke="#78350f" stroke-width="1.5" />
          <path d="M -22 -6 C -18 -18, -4 -22, 0 -8 C 4 -22, 18 -18, 22 -6 Z" fill="url(#seedGrad)" stroke="#f59e0b" stroke-width="1.5" />
        </g>
      `;
    } else {
      trunkPath = `
        M ${baseCenterX - stage.trunkWidth * 1.3} ${baseGroundY}
        C ${baseCenterX - stage.trunkWidth * 0.7} ${baseGroundY - 60}, 
          ${baseCenterX - stage.trunkWidth * 0.6} ${trunkTopY + stage.trunkHeight * 0.5}, 
          ${baseCenterX - stage.trunkWidth * 0.4} ${trunkTopY}
        L ${baseCenterX + stage.trunkWidth * 0.4} ${trunkTopY}
        C ${baseCenterX + stage.trunkWidth * 0.6} ${trunkTopY + stage.trunkHeight * 0.5}, 
          ${baseCenterX + stage.trunkWidth * 0.7} ${baseGroundY - 60}, 
          ${baseCenterX + stage.trunkWidth * 1.3} ${baseGroundY}
        Z
      `;
    }

    // 3. Ramas principales orgánicas que crecen con la etapa
    const branchCurves = [
      // Rama izquierda baja
      `M ${baseCenterX - stage.trunkWidth * 0.2} ${trunkTopY + 50} Q ${baseCenterX - stage.foliageRadiusX * 0.4} ${trunkTopY + 20} ${baseCenterX - stage.foliageRadiusX * 0.75} ${trunkTopY - 20}`,
      // Rama derecha baja
      `M ${baseCenterX + stage.trunkWidth * 0.2} ${trunkTopY + 50} Q ${baseCenterX + stage.foliageRadiusX * 0.4} ${trunkTopY + 20} ${baseCenterX + stage.foliageRadiusX * 0.75} ${trunkTopY - 20}`,
      // Rama izquierda alta
      `M ${baseCenterX - stage.trunkWidth * 0.15} ${trunkTopY} Q ${baseCenterX - stage.foliageRadiusX * 0.3} ${trunkTopY - 60} ${baseCenterX - stage.foliageRadiusX * 0.55} ${trunkTopY - stage.foliageRadiusY * 0.65}`,
      // Rama derecha alta
      `M ${baseCenterX + stage.trunkWidth * 0.15} ${trunkTopY} Q ${baseCenterX + stage.foliageRadiusX * 0.3} ${trunkTopY - 60} ${baseCenterX + stage.foliageRadiusX * 0.55} ${trunkTopY - stage.foliageRadiusY * 0.65}`,
      // Rama central hacia la cúspide
      `M ${baseCenterX} ${trunkTopY} Q ${baseCenterX - 10} ${trunkTopY - 80} ${baseCenterX} ${trunkTopY - stage.foliageRadiusY * 0.85}`
    ];

    const branchesToDraw = branchCurves.slice(0, Math.min(branchCurves.length, stage.branchesCount));
    branchesToDraw.forEach(pathD => {
      branchesSVG += `
        <path d="${pathD}" stroke="#78350f" stroke-width="${Math.max(6, stage.trunkWidth * 0.22)}" stroke-linecap="round" fill="none" opacity="0.9" />
      `;
    });

    // 4. Generación de cada Hoja Interactiva
    this.leaves.forEach((leaf, idx) => {
      const pos = leafPositions[idx] || { x: baseCenterX, y: trunkTopY - 50, rot: 0 };
      const palette = LEAF_PALETTES[leaf.color] || LEAF_PALETTES.emerald;
      const swayClass = idx % 2 === 0 ? 'leaf-sway-1' : 'leaf-sway-2';

      // Truncar nombre si es muy largo para la etiqueta
      const displayName = leaf.name.length > 13 ? leaf.name.substring(0, 11) + '..' : leaf.name;
      const displayJob = leaf.profession.length > 15 ? leaf.profession.substring(0, 13) + '..' : leaf.profession;

      leavesSVG += `
        <g id="leaf-node-${leaf.id}" 
           class="cursor-pointer transition-transform duration-300 leaf-glow group ${swayClass}" 
           transform="translate(${pos.x}, ${pos.y}) rotate(${pos.rot})" 
           onclick="window.arbolVocacional.openLeafModal('${leaf.id}')"
           role="button"
           tabindex="0"
           aria-label="Hoja de ${leaf.name} (${leaf.school}), sueña ser ${leaf.profession}">
          
          <!-- Tallo conector de la hoja a la rama -->
          <path d="M 0 0 Q ${pos.stemQx || 2} ${pos.stemQy || 8} ${pos.stemEndX || 0} ${pos.stemEndY || 14}" stroke="#166534" stroke-width="2.5" fill="none" />

          <!-- Silueta orgánica de la hoja -->
          <g transform="translate(0, 12)">
            <path d="M 0 0 C 18 -10, 26 22, 0 38 C -26 22, -18 -10, 0 0 Z" 
                  fill="${palette.fill}" 
                  stroke="${palette.stroke}" 
                  stroke-width="2" 
                  class="transition-colors duration-200 group-hover:brightness-125" />
            
            <!-- Nervadura central de la hoja -->
            <path d="M 0 4 L 0 34" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round" />
            
            <!-- Destello de rocío / luz -->
            <circle cx="4" cy="14" r="2.5" fill="rgba(255,255,255,0.85)" />

            <!-- Etiqueta con Nombre del Alumno -->
            <g transform="translate(0, 48)">
              <rect x="-42" y="-10" width="84" height="28" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="${palette.stroke}" stroke-width="1.2" />
              <text x="0" y="3" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold" font-family="'Quicksand', sans-serif">
                ${displayName}
              </text>
              <text x="0" y="13" text-anchor="middle" fill="${palette.fillHover}" font-size="8" font-weight="600" font-family="'Quicksand', sans-serif">
                ${displayJob}
              </text>
            </g>
          </g>
        </g>
      `;
    });

    // Suelo con loma verde
    const groundSVG = `
      <ellipse cx="${baseCenterX}" cy="${baseGroundY + 120}" rx="420" ry="140" fill="#064e3b" opacity="0.95" />
      <ellipse cx="${baseCenterX}" cy="${baseGroundY + 100}" rx="380" ry="110" fill="#047857" opacity="0.9" />
    `;

    return `
      <svg id="tree-svg" viewBox="0 0 900 800" class="w-full h-full max-h-[640px] select-none mx-auto overflow-visible">
        <defs>
          <radialGradient id="trunkGrad" cx="40%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#92400e" />
            <stop offset="60%" stop-color="#78350f" />
            <stop offset="100%" stop-color="#451a03" />
          </radialGradient>
          <radialGradient id="seedGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="35%" stop-color="#f59e0b" />
            <stop offset="75%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#451a03" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Fondo de Suelo Nutritivo -->
        ${groundSVG}

        <!-- Halo brillante de crecimiento -->
        <circle cx="${baseCenterX}" cy="${trunkTopY - 20}" r="${stage.foliageRadiusX * 1.05}" fill="${stage.glowColor}" filter="url(#softGlow)" />

        <!-- Base de la semilla germinada (en caso de brote) -->
        ${seedBaseSVG}

        <!-- Burbujas de copa de follaje -->
        <g id="foliage-bubbles">
          ${foliageBubblesSVG}
        </g>

        <!-- Tronco principal / tallo tierno -->
        <path d="${trunkPath}" fill="${stage.isSprout ? '#10b981' : 'url(#trunkGrad)'}" stroke="${stage.isSprout ? '#047857' : '#451a03'}" stroke-width="${stage.isSprout ? '2' : '2'}" />

        <!-- Ramas -->
        <g id="tree-branches">
          ${branchesSVG}
        </g>

        <!-- Hojas de los estudiantes -->
        <g id="tree-leaves">
          ${leavesSVG}
        </g>
      </svg>
    `;
  }

  // Distribución en múltiples capas concéntricas orgánicas para soportar ILIMITADAS hojas
  calculateLeafSockets(total, centerX, topY, stage) {
    const sockets = [];
    if (total === 0) return sockets;

    // Cantidad de capas orgánicas dinámicas según el número total de hojas
    const layersCount = Math.max(2, Math.min(6, Math.ceil(Math.sqrt(total / 3))));

    for (let i = 0; i < total; i++) {
      // Asignar capa cíclicamente para distribuir equitativamente
      const layer = i % layersCount; // 0 = exterior, 1 = medio, 2 = interior...
      const indexInLayer = Math.floor(i / layersCount);
      const totalInLayer = Math.ceil(total / layersCount);

      // Ángulo de apertura en abanico con ligero desfase por capa
      const angleStep = Math.PI / (totalInLayer + 1);
      const rawAngle = Math.PI - angleStep * (indexInLayer + 1) + (Math.sin(layer * 1.8) * 0.08);
      const angle = Math.max(0.18, Math.min(Math.PI - 0.18, rawAngle));

      // Radio dinámico según la capa concéntrica
      const layerRatio = 0.95 - (layer * (0.42 / layersCount));
      const rx = (stage.foliageRadiusX * layerRatio) + (Math.sin(i * 1.7) * 16);
      const ry = (stage.foliageRadiusY * layerRatio) + (Math.cos(i * 2.3) * 12);

      const posX = centerX + Math.cos(angle) * rx;
      const posY = (topY - stage.foliageRadiusY * 0.15) - Math.sin(angle) * ry;

      // Rotación natural de la hoja
      const rotationDeg = (angle * 180 / Math.PI) - 90 + (Math.sin(i * 3) * 12);

      sockets.push({
        x: Math.round(posX),
        y: Math.round(posY),
        rot: Math.round(rotationDeg),
        stemQx: Math.round((centerX - posX) * 0.06),
        stemQy: 8,
        stemEndX: 0,
        stemEndY: 14
      });
    }

    return sockets;
  }

  render() {
    const container = document.getElementById('tree-canvas-container');
    const stageInfo = this.getGrowthStageInfo();

    // 1. Actualizar el SVG del Árbol
    if (container) {
      container.innerHTML = this.generateTreeSVG();
    }

    // 2. Actualizar HUD de Crecimiento
    const countEl = document.getElementById('tree-leaves-count');
    const stageBadgeEl = document.getElementById('tree-stage-badge');
    const stageTitleEl = document.getElementById('tree-stage-title');
    const stageDescEl = document.getElementById('tree-stage-desc');
    const progressBar = document.getElementById('tree-growth-progress');

    if (countEl) countEl.innerText = this.leaves.length;
    if (stageBadgeEl) stageBadgeEl.innerText = stageInfo.badge;
    if (stageTitleEl) stageTitleEl.innerText = stageInfo.title;
    if (stageDescEl) stageDescEl.innerText = stageInfo.desc;

    // Barra de energía / progreso ilimitado
    if (progressBar) {
      const count = this.leaves.length;
      const percent = count >= 60 ? 100 : Math.min(100, Math.round((count / 60) * 100));
      progressBar.style.width = `${Math.max(6, percent)}%`;
    }

    // 3. Renderizar Lista / Muro de Vocaciones
    this.renderLeavesList();
  }

  renderLeavesList(filterQuery = '') {
    const listEl = document.getElementById('leaves-list-container');
    if (!listEl) return;

    let filtered = this.leaves;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.profession.toLowerCase().includes(q) ||
        (l.school && l.school.toLowerCase().includes(q)) ||
        (l.note && l.note.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="col-span-full py-8 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
          <i class="fa-solid fa-leaf text-2xl mb-2 text-emerald-500/40"></i>
          <p class="text-xs font-semibold">Aún no hay hojas registradas con este criterio.</p>
          <p class="text-[11px] text-slate-600 mt-1">Escribe tu nombre, profesión y escuela para hacer brotar la primera hoja.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(leaf => {
      const pal = LEAF_PALETTES[leaf.color] || LEAF_PALETTES.emerald;
      return `
        <div class="leaf-card-item bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between relative group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style="background-color: ${pal.fill}20; color: ${pal.fillHover}; border: 1px solid ${pal.fill}40;">
                <i class="fa-solid ${pal.icon}"></i>
                <span>${leaf.profession}</span>
              </span>
              <button onclick="window.arbolVocacional.removeLeaf('${leaf.id}')" title="Eliminar hoja" class="text-slate-600 hover:text-red-400 text-xs transition-colors p-1 opacity-0 group-hover:opacity-100">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>

            <h4 class="font-bold text-white text-sm tracking-wide">${leaf.name}</h4>
            
            <p class="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mt-1">
              <i class="fa-solid fa-school text-[10px]"></i>
              <span>${leaf.school || '7mo Grado'}</span>
            </p>

            ${leaf.note ? `<p class="text-slate-300 text-xs italic mt-2 line-clamp-2">«${leaf.note}»</p>` : ''}
          </div>

          <div class="pt-3 mt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
            <span>7mo Grado</span>
            <span>${leaf.timestamp}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  openLeafModal(leafId) {
    const leaf = this.leaves.find(l => l.id === leafId);
    if (!leaf) return;

    this.playChime(659.25); // E5

    const modal = document.getElementById('leaf-detail-modal');
    const content = document.getElementById('leaf-modal-content');
    if (!modal || !content) return;

    const pal = LEAF_PALETTES[leaf.color] || LEAF_PALETTES.emerald;

    content.innerHTML = `
      <div class="text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-xl" style="background: linear-gradient(135deg, ${pal.fill}, ${pal.stroke}); color: #ffffff;">
          <i class="fa-solid fa-leaf"></i>
        </div>

        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style="background-color: ${pal.fill}25; color: ${pal.fillHover}; border: 1px solid ${pal.fill}50;">
            ${pal.name.split('(')[0]}
          </span>
          <h3 class="text-2xl font-black text-white font-cinzel">${leaf.name}</h3>
          <p class="text-base font-bold text-amber-400 mt-1">Futuro/a: ${leaf.profession}</p>
          
          <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-emerald-300">
            <i class="fa-solid fa-school text-[11px]"></i>
            <span>${leaf.school || '7mo Grado'}</span>
          </div>
        </div>

        ${leaf.note ? `
          <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-sm italic text-slate-200">
            «${leaf.note}»
          </div>
        ` : ''}

        <div class="text-xs text-slate-400 flex justify-around pt-2 border-t border-slate-800">
          <span>🌱 Alumno/a de 7mo Grado</span>
          <span>📅 Floreció el: ${leaf.timestamp}</span>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeLeafModal() {
    const modal = document.getElementById('leaf-detail-modal');
    if (modal) modal.classList.add('hidden');
  }

  bindEvents() {
    // Formulario de agregar hoja
    const form = document.getElementById('add-leaf-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('student-name');
        const profInput = document.getElementById('student-profession');
        const schoolInput = document.getElementById('student-school');
        const noteInput = document.getElementById('student-note');
        const colorRadio = form.querySelector('input[name="leaf-color"]:checked');

        const name = nameInput ? nameInput.value.trim() : '';
        const profession = profInput ? profInput.value.trim() : '';
        const school = schoolInput ? schoolInput.value.trim() : '';
        const note = noteInput ? noteInput.value.trim() : '';
        const color = colorRadio ? colorRadio.value : 'emerald';

        if (!name || !profession || !school) {
          alert('Por favor, completa tu nombre, profesión y escuela.');
          return;
        }

        this.addLeaf(name, profession, school, note, color);

        // Limpiar campos
        if (nameInput) nameInput.value = '';
        if (profInput) profInput.value = '';
        if (schoolInput) schoolInput.value = '';
        if (noteInput) noteInput.value = '';

        // Feedback al usuario
        const successNotice = document.getElementById('leaf-added-success');
        if (successNotice) {
          successNotice.classList.remove('hidden');
          setTimeout(() => successNotice.classList.add('hidden'), 3500);
        }
      });
    }

    // Buscador en el muro de vocaciones
    const searchInput = document.getElementById('search-leaves-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderLeavesList(e.target.value);
      });
    }

    // Botones de acción del docente
    const sampleBtn = document.getElementById('load-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.loadSampleClass(6));
    }

    const clearBtn = document.getElementById('clear-tree-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearTree());
    }

    const printBtn = document.getElementById('print-tree-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Modal cerrar
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLeafModal());
    }

    const modalBackdrop = document.getElementById('leaf-detail-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeLeafModal();
      });
    }

    // Control de sonido
    const soundToggle = document.getElementById('tree-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        const icon = soundToggle.querySelector('i');
        if (icon) {
          icon.className = this.soundEnabled ? 'fa-solid fa-volume-high text-emerald-400' : 'fa-solid fa-volume-xmark text-slate-500';
        }
      });
    }
  }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
  window.arbolVocacional = new ArbolVocacional();
});
