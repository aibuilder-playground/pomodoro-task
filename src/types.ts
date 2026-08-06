export type TaskStatus = "pending" | "active" | "paused" | "completed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  completedAt: number | null;
  pomodorosCompleted: number;
}

export type SessionPhase = "focus" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsBeforeLongBreak: number;
}

/** Forma exacta del archivo JSON que vive en disco (Fase 2). */
export interface PersistedState {
  version: number;
  tasks: Task[];
  activeTaskId: string | null;
  phase: SessionPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedRoundsInCycle: number;
  totalPomodorosToday: number;
  settings: PomodoroSettings;
  lastSavedAt: number;
}
