# Enfoque — Pomodoro + Gestor de Tareas Diarias

Aplicación de escritorio minimalista que combina una lista de tareas diarias con el
método Pomodoro, diseñada específicamente para reducir la sobrecarga cognitiva y la
distracción en personas con TDAH.

> **Fase 1 (este repositorio en su estado actual):** todo el estado — tareas, estatus,
> temporizador, historial de la sesión — vive **exclusivamente en memoria RAM**. No hay
> disco, no hay `localStorage`, no hay red. Cerrar la app o pulsar **"Simular reinicio /
> Borrar memoria"** destruye todos los datos, a propósito.

---

## 1. Elección tecnológica

**Tauri + React + TypeScript + Zustand.**

- **Tauri** empaqueta la UI web en un *webview* nativo del sistema operativo en vez de
  embeber un Chromium completo (como Electron). El binario resultante pesa unos pocos
  MB y consume una fracción de la RAM/CPU de un equivalente en Electron. Para una app
  cuyo objetivo es *no añadir fricción ni distracción*, que la propia app no consuma
  recursos ni se sienta pesada es parte del diseño UX, no un detalle técnico.
- **React + TypeScript** dan un modelo de componentes predecible y tipado estricto,
  útil para una interfaz con estados de tarea bien definidos (`pending | active |
  paused | completed`) donde los errores de estado son justo lo que más rompe la
  confianza de un usuario con TDAH en la herramienta.
- **Zustand** como store en memoria: una sola fuente de verdad, sin boilerplate, y sin
  ningún middleware de persistencia — deliberado, para que la Fase 1 sea honesta sobre
  ser 100% volátil.
- **Sin Tailwind ni librerías de animación:** el CSS es plano y a mano (`src/index.css`).
  Menos dependencias, menos superficie de configuración, más fácil de ajustar la
  paleta de colores calmante sin pelear con una capa de utilidades.

No hay comandos nativos de Rust más allá del arranque de la ventana
(`src-tauri/src/main.rs`): toda la lógica de negocio vive en el frontend, que es
justamente lo que se reemplazará por persistencia real en la Fase 2.

---

## 2. Estructura del proyecto

```
pomodoro-task/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx                  # Punto de entrada de React
│   ├── App.tsx                   # Composición de la pantalla principal
│   ├── index.css                 # Paleta calmante + layout + animaciones
│   ├── types.ts                  # Task, TaskStatus, SessionPhase, PomodoroSettings
│   ├── store/
│   │   └── useAppStore.ts        # Store Zustand — 100% en memoria (Fase 1)
│   ├── hooks/
│   │   └── usePomodoroTimer.ts   # Intervalo de 1s que impulsa el temporizador
│   ├── utils/
│   │   └── uid.ts                # Generador de ids de sesión
│   └── components/
│       ├── Header.tsx
│       ├── ActiveFocus.tsx       # Foco principal: tarea activa + temporizador
│       ├── ProgressRing.tsx      # Anillo de progreso SVG
│       ├── EmptyState.tsx        # Estado sin tarea activa
│       ├── TaskInput.tsx         # Input rápido para agregar tareas
│       ├── TaskList.tsx          # Lista de pendientes + completadas colapsadas
│       ├── TaskItem.tsx          # Fila individual con estatus y botón Iniciar
│       └── ResetMemoryButton.tsx # Botón "Simular reinicio / Borrar memoria"
└── src-tauri/
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    └── src/main.rs
```

---

## 3. Diseño UX/UI para TDAH — decisiones clave

- **Una cosa a la vez:** solo puede haber una tarea `active`/`paused` en todo momento
  (`useAppStore.startTask` lo impone). El resto de tareas pendientes quedan
  deshabilitadas para "Iniciar" mientras haya una en marcha — sin negociación posible,
  sin multitarea accidental.
- **Foco visual dominante:** la tarjeta superior (`ActiveFocus`) es lo único grande en
  pantalla: el nombre de la tarea y el anillo de progreso del Pomodoro. La lista de
  pendientes es secundaria y compacta.
- **Tareas completadas fuera de la vista por defecto:** se colapsan bajo un contador
  ("Completadas (n)") para no acumular ruido visual con el paso del día.
- **Paleta calmante:** verdes salvia y azules pastel para enfoque/descanso; ámbar suave
  para "pausada"; terracota apagado (nunca rojo puro) para la única acción destructiva.
  Ver variables en `src/index.css` (`:root`).
- **Micro-interacción de cierre:** al marcar una tarea como terminada aparece un
  check animado (~0.6s) antes de archivarla — la recompensa inmediata que pide el
  diseño, sin folletería ni sonidos intrusivos.
- **Reducción de movimiento:** toda animación respeta `prefers-reduced-motion`.

---

## 4. Requisitos previos

- **Node.js** 18 o superior y npm.
- **Rust** (toolchain estable) — Tauri compila un binario nativo.
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- Dependencias nativas de Tauri según tu sistema operativo (webview + herramientas de
  compilación). Sigue la guía oficial según tu OS antes de continuar:
  https://v2.tauri.app/start/prerequisites/
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`).
  - **Windows:** Microsoft Visual C++ Build Tools + WebView2 (viene preinstalado en
    Windows 10/11 recientes).
  - **Linux:** paquetes `webkit2gtk`, `libayatana-appindicator3-dev`, etc. (ver guía).

---

## 5. Instalación y ejecución

```bash
# 1. Instalar dependencias de Node
npm install

# 2. Levantar la app en modo desarrollo (ventana nativa + hot reload)
npm run tauri dev
```

Esto compila el shell de Rust la primera vez (puede tardar unos minutos) y abre la
ventana de la app apuntando al servidor Vite en `http://localhost:1420`.

### Solo frontend, en el navegador (sin Tauri)

Útil para iterar rápido en la UI sin recompilar Rust:

```bash
npm run dev
```

Abre la URL que imprime Vite (normalmente `http://localhost:1420`). El store en
memoria funciona igual, pero sin la ventana nativa.

### Build de producción

```bash
npm run tauri build
```

> Antes de un build de producción real, genera los íconos de la app (este esqueleto
> no incluye binarios de ícono):
> ```bash
> npm run tauri icon ruta/a/tu-logo.png
> ```

---

## 6. Verificar que no persiste nada (demo de la Fase 1)

1. Agrega un par de tareas, inicia una y déjala correr unos segundos.
2. Cierra la app por completo y vuelve a abrirla con `npm run tauri dev` — la lista
   estará vacía.
3. O, sin cerrar la app, pulsa **"Simular reinicio / Borrar memoria"** en el header y
   confirma: el estado completo (tareas, temporizador, contador de pomodoros) vuelve a
   cero al instante, en la misma sesión.

---

## 7. Estrategia de ramas Git — Fase 1 vs. Fase 2

El objetivo: `main` queda como base "limpia", lista para recibir la persistencia local
de la Fase 2 (SQLite, `tauri-plugin-store`, archivo JSON, etc.), mientras que **todo**
el trabajo de esta Fase 1 (RAM-only) vive aislado en la rama `feat/ram-only`.

```bash
# Si el repo todavía no es un repositorio git, inicialízalo desde la raíz del proyecto
git init
git add .
git commit -m "chore: bootstrap del proyecto (Tauri + React + TS)"

# Asegura que la rama principal se llame "main"
git branch -M main

# Crea y cambia a la rama de la Fase 1 — aquí vive la implementación RAM-only
git checkout -b feat/ram-only
git add .
git commit -m "feat: gestor de tareas + Pomodoro con almacenamiento 100% en RAM (Fase 1)"

# (Opcional) publica la rama en el remoto
git push -u origin feat/ram-only
```

**Regla de trabajo para esta fase:** todo commit relacionado con la lógica RAM-only
(store de Zustand, componentes, temporizador, botón de reinicio) se hace sobre
`feat/ram-only`, nunca directo en `main`. Cuando arranque la Fase 2, se creará una
nueva rama (p. ej. `feat/local-persistence`) desde `main`, y `feat/ram-only` se
fusionará o se abandonará según se decida reemplazar por completo el store en memoria
o mantenerlo como modo "sesión efímera" opcional dentro de la app persistente.

---

## 8. Hoja de ruta — Fase 2 (fuera de alcance de este entregable)

- Sustituir `useAppStore` por una capa de persistencia (SQLite vía
  `tauri-plugin-sql`, o `tauri-plugin-store` para algo más simple) sin cambiar la
  forma de las acciones públicas del store (`addTask`, `startTask`, etc.), para que
  los componentes de UI no necesiten tocarse. La idea es que guarde/restaure el
  estado automáticamente en cada cambio, sin que el usuario tenga que notarlo.
- Historial de sesiones por día (hoy solo se acumula `totalPomodorosToday` en memoria).
- Configuración de duraciones de Pomodoro editable desde la UI (hoy son constantes en
  `useAppStore.ts`).
