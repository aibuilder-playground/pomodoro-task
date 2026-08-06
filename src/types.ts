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
