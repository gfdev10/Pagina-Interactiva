# Dante 2.0: Del Infierno al Paraíso 🏛️✨

Propuesta pedagógica interactiva para 7mo Grado basada en *La Divina Comedia* de Dante Alighieri. Integra 9 minijuegos interactivos (3 por cada reino: Infierno, Purgatorio y Paraíso), síntesis de audio en tiempo real y generación de diploma imprimible.

---

## 📁 Estructura del Proyecto

El proyecto ha sido modularizado siguiendo una arquitectura limpia, escalable y basada en responsabilidades bien definidas:

```
Pagina Interactiva/
├── index.html                  # Estructura semántica HTML5 minimalista y limpia
├── README.md                   # Documentación técnica y guía de arquitectura
├── css/                        # Capa de estilos modular
│   ├── main.css                # Variables de diseño, fuentes, scrollbars y reset
│   ├── layout.css              # Cabecera, hero banner y rejilla de reinos
│   ├── games.css               # Estilos de minijuegos, canvas y animaciones
│   └── certificate.css         # Estilos visuales y reglas @media print del diploma
└── js/                         # Lógica JavaScript (ES6 Modules)
    ├── app.js                  # Orquestador principal y punto de entrada
    ├── core/                   # Servicios nucleares
    │   ├── audio.js            # Motor de sonido sintetizado con Web Audio API
    │   ├── state.js            # Gestión de estado global (9 medallas) + localStorage
    │   └── router.js           # Enrutamiento y transición fluida de vistas
    ├── data/                   # Capa de datos desacoplada
    │   ├── reinosData.js       # Catálogo y configuración de los 3 reinos y los 9 juegos
    │   └── triviaQuestions.js  # Banco de preguntas del Juego 1 (Infierno)
    ├── components/             # Componentes de interfaz de usuario
    │   ├── header.js           # Cabecera, contador de medallas y botón de audio
    │   ├── reinosList.js       # Renderizado dinámico de tarjetas e insignias
    │   └── certificate.js      # Formulario del diploma, insignias y disparador de impresión
    └── games/                  # Módulos independientes para cada minijuego
        ├── gameManager.js      # Registro y despacho del ciclo de vida de los juegos
        ├── game1-trivia.js     # Juego 1: Trivia Dantesca
        ├── game2-memotest.js   # Juego 2: Memotest de Palabras
        ├── game3-laberinto.js  # Juego 3: Laberinto de Minos
        ├── game4-simon.js      # Juego 4: Canto de Lamentos (Simon Says)
        ├── game5-plataformas.js# Juego 5: Escalada en Plataformas 2D
        ├── game6-balanza.js    # Juego 6: Balanza de las Virtudes
        ├── game7-vuelo.js      # Juego 7: Vuelo por la Esfera Celeste
        ├── game8-enigma.js     # Juego 8: Enigma Rosa Creadora
        └── game9-anillos.js    # Juego 9: Anillos de la Trinidad
```

---

## 🚀 Cómo Ejecutar el Proyecto

Al utilizar **Módulos Nativos de JavaScript (ES Modules)**, se recomienda servir la carpeta con cualquier servidor local para evitar restricciones CORS de archivos locales:

### Opción 1: Con extensión de VS Code
- Usar **Live Server** (hacer clic derecho en `index.html` -> *Open with Live Server*).

### Opción 2: Con Node.js / NPX
```bash
npx serve .
# o
npx http-server .
```

---

## 🧩 ¿Por qué esta estructura es escalable?

1. **Desacoplamiento Total:** Cada minijuego es un módulo aislado (`gameX.js`). Modificar un minijuego no afecta a los demás ni a la interfaz general.
2. **Persistencia Automática (`localStorage`):** El progreso de medallas del estudiante y el nombre en el certificado se guardan automáticamente en el navegador para que no se pierdan si se recarga la página.
3. **Capa de Datos Externa:** Las preguntas de trivia y la información de los reinos están en `js/data/`, facilitando su edición pedagógica o traducción sin tocar código de lógica.
4. **Ciclo de Vida Controlado:** `stateManager` y `router` limpian automáticamente los bucles de animación (`requestAnimationFrame` / `setInterval`) y eventos de teclado cuando el usuario cambia de pantalla o reinicia un minijuego.
5. **Cómo agregar un nuevo juego en 3 pasos:**
   1. Crear `js/games/game11-nuevo.js` exportando `initGame11(container, restartGame)`.
   2. Registrarlo en `js/games/gameManager.js`.
   3. Añadir su tarjeta en `js/data/reinosData.js`.
