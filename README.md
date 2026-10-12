# Dante 2.0: Del Infierno al Paraíso 🏛️✨

Propuesta pedagógica interactiva basada en *La Divina Comedia* de Dante Alighieri. Integra **9 minijuegos interactivos** (3 por cada reino: *Infierno*, *Purgatorio* y *Paraíso*), síntesis de audio en tiempo real con Web Audio API y generación de un **Diploma/Certificado de Honor** descargable e imprimible.

> *"Como en la Divina Comedia Virgilio acompaña a Dante, pero no realiza el viaje por él. Le muestra caminos, le permite comprender lo que encuentra y lo ayuda a avanzar."*
> 
> **Orientar** no significa decirle a una persona qué debe hacer, sino **acompañarla para que pueda conocerse**, analizar sus posibilidades y tomar decisiones sobre su propio camino.

---

## 🎮 Catálogo de los 9 Desafíos

### 🔴 Reino I: El Infierno
* **Juego 1: Trivia Dantesca** (`game1-trivia.js`)
  Preguntas con opciones múltiples sobre los cantos, círculos y personajes del Infierno.
* **Juego 2: Memotest de Palabras** (`game2-memotest.js`)
  Juego de memoria para emparejar conceptos clave y términos simbólicos dantescos.
* **Juego 3: Laberinto de Minos** (`game3-laberinto.js`)
  Navegación en laberintos con **3 niveles de dificultad progresiva**. Movimiento preciso bloque a bloque (paso de 1 en 1 casilla) y transición a través del portal de la puerta (`🚪`).

### 🟠 Reino II: El Purgatorio
* **Juego 4: Luces del Purgatorio (Simon Says)** (`game4-simon.js`)
  Juego de memoria auditiva y visual que recorre las 8 terrazas del monte.
* **Juego 5: Escalada en Plataformas 2D** (`game5-plataformas.js`)
  Plataformas en física 2D donde Dante salta entre cornisas móviles para purificar las 7 marcas "P" de su frente.
* **Juego 6: Balanza de las Virtudes** (`game6-balanza.js`)
  Equilibrio moral y matemático: el peso del pecado de la soberbia cambia dinámicamente en cada partida (rango aleatorio entre **10 y 25**), exigiendo combinar virtudes exactas para alcanzar el balance.

### 🔵 Reino III: El Paraíso
* **Juego 7: Vuelo por la Esfera Celeste** (`game7-vuelo.js`)
  Vuelo espacial a través de **3 niveles cósmicos** de velocidad incremental esquivando cometas hacia las esferas superiores.
* **Juego 8: Enigma Rosa Creadora** (`game8-enigma.js`)
  Descifrado de criptogramas sagrados en **3 niveles** inspirados en versos de la Rosa Mística, con sistema interactivo de **pistas de sabiduría**.
* **Juego 9: Vuelo al Empíreo (Estilo Flappy Bird)** (`game9-anillos.js`)
  Juego estilo **Flappy Bird** a 60 FPS donde el peregrino alado (`🕊️✨`) aletea esquivando columnas celestiales con meta de 8 columnas, récord personal y desbloqueo del **Certificado de Honor**.

---

## 📁 Estructura del Proyecto

El proyecto está diseñado bajo una arquitectura limpia, modular y basada en ES Modules nativos sin dependencias pesadas:

```
Pagina Interactiva/
├── index.html                  # Estructura semántica HTML5 y banner pedagógico
├── arbol.html                  # Nueva página interactiva: El Árbol de las Vocaciones (7mo Grado)
├── package.json                # Configuración de scripts (npm start)
├── README.md                   # Documentación técnica completa
├── css/                        # Capa de estilos modular
│   ├── main.css                # Variables de diseño, fuentes, scrollbars y reset
│   ├── layout.css              # Cabecera, hero banner y rejilla de reinos
│   ├── games.css               # Estilos de minijuegos, canvas y animaciones
│   ├── certificate.css         # Estilos visuales y reglas @media print del diploma
│   └── arbol.css               # Animaciones de balanceo de hojas, viento y floración
└── js/                         # Lógica JavaScript (ES6 Modules)
    ├── app.js                  # Orquestador principal y punto de entrada
    ├── arbol.js                # Lógica del Árbol: crecimiento procedural SVG, hojas y localStorage
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
        ├── game3-laberinto.js  # Juego 3: Laberinto de Minos (3 Niveles)
        ├── game4-simon.js      # Juego 4: Luces del Purgatorio
        ├── game5-plataformas.js# Juego 5: Escalada en Plataformas 2D
        ├── game6-balanza.js    # Juego 6: Balanza de las Virtudes (Soberbia dinámica)
        ├── game7-vuelo.js      # Juego 7: Vuelo por la Esfera Celeste (3 Niveles)
        ├── game8-enigma.js     # Juego 8: Enigma Rosa Creadora (3 Niveles con pistas)
        └── game9-anillos.js    # Juego 9: Vuelo al Empíreo (Estilo Flappy Bird)
```

---

## 🚀 Cómo Ejecutar el Proyecto

Al utilizar **Módulos Nativos de JavaScript (ES Modules)**, se debe servir mediante un servidor local HTTP:

### Opción 1: Con NPM (Recomendada)
```bash
npm start
```
Abre automáticamente el servidor local en `http://localhost:3000`.

### Opción 2: Con extensión de VS Code
- Instalar **Live Server**.
- Hacer clic derecho en `index.html` -> *Open with Live Server*.

### Opción 3: Con NPX directo
```bash
npx serve .
```

---

## 🧩 Principios de Escalabilidad y Arquitectura

1. **Desacoplamiento Total:** Cada minijuego es un módulo aislado (`gameX.js`). Modificar un minijuego no afecta a los demás ni a la interfaz general.
2. **Persistencia Automática (`localStorage`):** El progreso de medallas del estudiante (1 a 9) y el nombre del estudiante se guardan automáticamente.
3. **Capa de Datos Externa:** Las preguntas y la información descriptiva residen en `js/data/`, facilitando su edición pedagógica sin alterar la lógica.
4. **Ciclo de Vida y Limpieza:** `stateManager` limpia automáticamente temporizadores, intervalos y bucles de animación al cambiar de juego o vista para evitar fugas de memoria.
5. **Cómo agregar un nuevo juego en 3 pasos:**
   1. Crear `js/games/game10-nuevo.js` exportando `initGame10(container, restartGame)`.
   2. Registrarlo en `js/games/gameManager.js`.
   3. Añadir su tarjeta descriptiva en `js/data/reinosData.js`.
