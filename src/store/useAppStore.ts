import { create } from "zustand";
import { PomodoroSettings, SessionPhase, Task } from "../types";
import { uid } from "../utils/uid";

const SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsBeforeLongBreak: 4,
};

interface AppState {
  tasks: Task[];
  activeTaskId: string | null;
  phase: SessionPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedRoundsInCycle: number;
  totalPomodorosToday: number;
  settings: PomodoroSettings;

  addTask: (title: string) => void;
  startTask: (id: string) => void;
  pauseActive: () => void;
  resumeActive: () => void;
  completeActive: () => void;
  sendActiveBackToPending: () => void;
  tick: () => void;
  resetMemory: () => void;
}

function initialState() {
  return {
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

/**
 * Store 100% en memoria (Fase 1).
 * No hay disco, no hay localStorage, no hay red: cerrar la app o pulsar
 * "Simular reinicio" borra todo. La persistencia real llega en la Fase 2.
 */
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState(),

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
  },

  pauseActive: () => {
    const state = get();
    if (!state.activeTaskId || !state.isRunning) return;
    set((s) => ({
      isRunning: false,
      tasks: s.tasks.map((t) => (t.id === s.activeTaskId ? { ...t, status: "paused" } : t)),
    }));
  },

  resumeActive: () => {
    const state = get();
    if (!state.activeTaskId || state.isRunning) return;
    set((s) => ({
      isRunning: true,
      tasks: s.tasks.map((t) => (t.id === s.activeTaskId ? { ...t, status: "active" } : t)),
    }));
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
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || !state.activeTaskId) return;

    if (state.secondsLeft > 1) {
      set({ secondsLeft: state.secondsLeft - 1 });
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
  },

  resetMemory: () => set(initialState()),
}));
