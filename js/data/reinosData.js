/**
 * Configuración y catálogo de Reinos y Minijuegos
 * Permite escalar fácilmente agregando nuevos juegos o reinos sin modificar la vista
 */
export const reinosData = [
  {
    id: 'infierno',
    name: 'El Infierno',
    subtitle: 'Reino 1',
    description: 'Supera la selva oscura y el abismo dantesco con destreza y memoria.',
    icon: 'fa-solid fa-fire',
    theme: {
      border: 'border-red-900/50',
      hoverBorder: 'hover:border-red-600/80',
      badgeBg: 'bg-red-950/80',
      badgeBorder: 'border-red-800/50',
      badgeText: 'text-red-400',
      gradient: 'from-red-950/40 to-slate-900',
      titleColor: 'text-red-200',
      buttonHover: 'hover:bg-red-950/60',
      buttonBorder: 'border-red-900/30'
    },
    games: [
      { id: 1, title: '1. Trivia Dantesca', description: 'Preguntas esenciales sobre el inicio del viaje y el Infierno.' },
      { id: 2, title: '2. Memotest de Palabras', description: 'Encuentra los pares de conceptos y personajes dantescos.' },
      { id: 3, title: '3. Laberinto de Minos', description: 'Recoge las 3 antorchas y evade al juez de los infiernos.' }
    ]
  },
  {
    id: 'purgatorio',
    name: 'El Purgatorio',
    subtitle: 'Reino 2',
    description: 'Ascenso interactivo con retos de física, ritmo musical y equilibrio moral.',
    icon: 'fa-solid fa-mountain',
    theme: {
      border: 'border-amber-900/50',
      hoverBorder: 'hover:border-amber-600/80',
      badgeBg: 'bg-amber-950/80',
      badgeBorder: 'border-amber-800/50',
      badgeText: 'text-amber-400',
      gradient: 'from-amber-950/30 to-slate-900',
      titleColor: 'text-amber-200',
      buttonHover: 'hover:bg-amber-950/60',
      buttonBorder: 'border-amber-900/30'
    },
    games: [
      { id: 4, title: '4. Canto de Lamentos (Simon)', description: 'Memoriza y repite las secuencias sonoras de purificación.' },
      { id: 5, title: '5. Escalada en Plataformas 2D', description: 'Salta entre cornisas y elimina las 7 marcas "P".' },
      { id: 6, title: '6. Balanza de las Virtudes', description: 'Contrarresta el pecado de la soberbia con virtudes exactas.' }
    ]
  },
  {
    id: 'paraiso',
    name: 'El Paraíso',
    subtitle: 'Reino 3',
    description: 'Navegación astronómica espacial, criptogramas y armonización celestial.',
    icon: 'fa-solid fa-sun',
    theme: {
      border: 'border-sky-900/50',
      hoverBorder: 'hover:border-sky-600/80',
      badgeBg: 'bg-sky-950/80',
      badgeBorder: 'border-sky-800/50',
      badgeText: 'text-sky-400',
      gradient: 'from-sky-950/40 to-slate-900',
      titleColor: 'text-sky-200',
      buttonHover: 'hover:bg-sky-950/60',
      buttonBorder: 'border-sky-900/30'
    },
    games: [
      { id: 7, title: '7. Vuelo por la Esfera Celeste', description: 'Guía el alma de Dante para recolectar 10 estrellas.' },
      { id: 8, title: '8. Enigma Rosa Creadora', description: 'Descifra el mensaje místico letra por letra.' },
      { id: 9, title: '9. Anillos de la Trinidad', description: 'Alinea los tres círculos celestiales en perfecta armonía.' }
    ]
  }
];

