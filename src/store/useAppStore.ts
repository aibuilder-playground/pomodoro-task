import { create } from "zustand";
import { PomodoroSettings, SessionPhase, Task } from "../types";
import { clearPersistedState, loadPersistedState, savePersistedState } from "../utils/persistence";
import { uid } from "../utils/uid";

const SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsBeforeLongBreak: 4,
};

interface AppState {
  hydrated: boolean;
  tasks: Task[];
  activeTaskId: string | null;
  phase: SessionPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedRoundsInCycle: number;
  totalPomodorosToday: number;
  settings: PomodoroSettings;

  hydrate: () => Promise<void>;
  addTask: (title: string) => void;
  startTask: (id: string) => void;
  pauseActive: () => void;
  resumeActive: () => void;
  completeActive: () => void;
  sendActiveBackToPending: () => void;
  tick: () => void;
  resetAllData: () => void;
}

function initialState() {
  return {
    hydrated: false,
    tasks: [] as Task[],
    activeTaskId: null as string | null,
    phase: "focus" as SessionPhase,
    secondsLeft: SETTINGS.focusMinutes * 60,
    isRunning: false,
    completedRoundsInCycle: 0,
    totalPomodorosToday: 0,
    settings: SETTINGS,
  };
}

// Guarda una foto del estado relevante para disco. Se llama después de cada
// acción con sentido de negocio (agregar/iniciar/pausar/completar tarea,
// o al cerrar un pomodoro/descanso dentro de tick()) — nunca en cada
// decremento de un segundo, para no golpear el disco cada tick del reloj.
function persist(state: AppState) {
  void savePersistedState({
    tasks: state.tasks,
    activeTaskId: state.activeTaskId,
    phase: state.phase,
    secondsLeft: state.secondsLeft,
    isRunning: state.isRunning,
    completedRoundsInCycle: state.completedRoundsInCycle,
    totalPomodorosToday: state.totalPomodorosToday,
    settings: state.settings,
  });
}

/**
 * Store con persistencia en disco (Fase 2).
 * La lógica de negocio sigue viviendo aquí, igual que en la Fase 1; lo único
 * que cambia es que, además de actualizar la memoria, cada cambio relevante
 * se refleja en el archivo JSON vía `persist()`. Al arrancar, `hydrate()`
 * carga ese archivo antes de que la UI se muestre.
 */
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState(),

  hydrate: async () => {
    const persisted = await loadPersistedState();
    if (!persisted) {
      set({ hydrated: true });
      return;
    }
    set({
      // Ninguna sesión se reanuda sola: una tarea que había quedado "active"
      // vuelve a "paused" y el usuario decide con "Continuar". Reanudar el
      // conteo automáticamente sería una sorpresa poco amigable para TDAH y,
      // además, el tiempo real transcurrido mientras la app estaba cerrada
      // no se puede reconstruir con un contador simple.
      tasks: persisted.tasks.map((t) => (t.status === "active" ? { ...t, status: "paused" } : t)),
      activeTaskId: persisted.activeTaskId,
      phase: persisted.phase,
      secondsLeft: persisted.secondsLeft,
      isRunning: false,
      completedRoundsInCycle: persisted.completedRoundsInCycle,
      totalPomodorosToday: persisted.totalPomodorosToday,
      settings: persisted.settings,
      hydrated: true,
    });
  },

  addTask: (title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: uid(),
          title: trimmed,
          status: "pending",
          createdAt: Date.now(),
          completedAt: null,
          pomodorosCompleted: 0,
        },
      ],
    }));
    persist(get());
  },

  startTask: (id) => {
    const state = get();
    if (state.activeTaskId) return; // solo una tarea a la vez
    const task = state.tasks.find((t) => t.id === id);
    if (!task || task.status !== "pending") return;

    set((s) => ({
      activeTaskId: id,
      isRunning: true,
      phase: "focus",
      secondsLeft: s.settings.focusMinutes * 60,
      completedRoundsInCycle: 0,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "active" } : t)),
    }));
    persist(get());
  },

  pauseActive: () => {
    const state = get();
    if (!state.activeTaskId || !state.isRunning) return;
    set((s) => ({
      isRunning: false,
      tasks: s.tasks.map((t) => (t.id === s.activeTaskId ? { ...t, status: "paused" } : t)),
    }));
    persist(get());
  },

  resumeActive: () => {
    const state = get();
    if (!state.activeTaskId || state.isRunning) return;
    set((s) => ({
      isRunning: true,
      tasks: s.tasks.map((t) => (t.id === s.activeTaskId ? { ...t, status: "active" } : t)),
    }));
    persist(get());
  },

  completeActive: () => {
    const state = get();
    if (!state.activeTaskId) return;
    set((s) => ({
      activeTaskId: null,
      isRunning: false,
      phase: "focus",
      secondsLeft: s.settings.focusMinutes * 60,
      completedRoundsInCycle: 0,
      tasks: s.tasks.map((t) =>
        t.id === s.activeTaskId ? { ...t, status: "completed", completedAt: Date.now() } : t
      ),
    }));
    persist(get());
  },

  sendActiveBackToPending: () => {
    const state = get();
    if (!state.activeTaskId) return;
    set((s) => ({
      activeTaskId: null,
      isRunning: false,
      phase: "focus",
      secondsLeft: s.settings.focusMinutes * 60,
      completedRoundsInCycle: 0,
      tasks: s.tasks.map((t) => (t.id === s.activeTaskId ? { ...t, status: "pending" } : t)),
    }));
    persist(get());
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || !state.activeTaskId) return;

    if (state.secondsLeft > 1) {
      const secondsLeft = state.secondsLeft - 1;
      set({ secondsLeft });
      // Guardado periódico de baja frecuencia: si la app se cierra a media
      // sesión, se pierden como máximo ~10s de progreso del temporizador en
      // vez de tener que escribir a disco una vez por segundo.
      if (secondsLeft % 10 === 0) persist(get());
      return;
    }

    if (state.phase === "focus") {
      const newRounds = state.completedRoundsInCycle + 1;
      const isLongBreak = newRounds % state.settings.roundsBeforeLongBreak === 0;
      set((s) => ({
        phase: isLongBreak ? "longBreak" : "shortBreak",
        secondsLeft: (isLongBreak ? s.settings.longBreakMinutes : s.settings.shortBreakMinutes) * 60,
        completedRoundsInCycle: isLongBreak ? 0 : newRounds,
        totalPomodorosToday: s.totalPomodorosToday + 1,
        tasks: s.tasks.map((t) =>
          t.id === s.activeTaskId ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 } : t
        ),
      }));
    } else {
      set((s) => ({
        phase: "focus",
        secondsLeft: s.settings.focusMinutes * 60,
      }));
    }
    persist(get());
  },

  resetAllData: () => {
    set(initialState());
    set({ hydrated: true }); // el reinicio es instantáneo, no hay que volver a "cargar"
    void clearPersistedState();
  },
}));
