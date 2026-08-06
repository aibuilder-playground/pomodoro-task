import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { EmptyState } from "./EmptyState";
import { ProgressRing } from "./ProgressRing";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const PHASE_LABEL: Record<string, string> = {
  focus: "Enfoque",
  shortBreak: "Descanso corto",
  longBreak: "Descanso largo",
};

// Tiempo que se muestra la animación de celebración antes de archivar la tarea.
const CELEBRATION_MS = 600;

export function ActiveFocus() {
  const activeTaskId = useAppStore((s) => s.activeTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const phase = useAppStore((s) => s.phase);
  const secondsLeft = useAppStore((s) => s.secondsLeft);
  const isRunning = useAppStore((s) => s.isRunning);
  const settings = useAppStore((s) => s.settings);
  const pauseActive = useAppStore((s) => s.pauseActive);
  const resumeActive = useAppStore((s) => s.resumeActive);
  const completeActive = useAppStore((s) => s.completeActive);
  const sendActiveBackToPending = useAppStore((s) => s.sendActiveBackToPending);

  const [celebrating, setCelebrating] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  if (!activeTask) {
    return <EmptyState />;
  }

  const totalSeconds =
    phase === "focus"
      ? settings.focusMinutes * 60
      : phase === "shortBreak"
        ? settings.shortBreakMinutes * 60
        : settings.longBreakMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  function handleComplete() {
    setCelebrating(true);
    window.setTimeout(() => {
      completeActive();
      setCelebrating(false);
    }, CELEBRATION_MS);
  }

  return (
    <section className="focus-card" aria-live="polite">
      {celebrating && (
        <div className="celebration-overlay" aria-hidden>
          <span className="celebration-check">✓</span>
        </div>
      )}

      <p className={`focus-phase focus-phase--${phase}`}>{PHASE_LABEL[phase]}</p>

      <div className="progress-ring-wrap">
        <ProgressRing progress={progress} colorVar={phase === "focus" ? "--color-primary" : "--color-accent"} />
        <div className="progress-ring-center">{formatTime(secondsLeft)}</div>
      </div>

      <h2 className="focus-task-title">{activeTask.title}</h2>
      <p className="focus-meta">
        {activeTask.pomodorosCompleted} pomodoro{activeTask.pomodorosCompleted === 1 ? "" : "s"} completado
        {activeTask.pomodorosCompleted === 1 ? "" : "s"} hoy
      </p>

      <div className="focus-controls">
        {isRunning ? (
          <button className="btn btn-secondary" onClick={pauseActive}>
            Pausar
          </button>
        ) : (
          <button className="btn btn-primary" onClick={resumeActive}>
            Continuar
          </button>
        )}
        <button className="btn btn-success" onClick={handleComplete}>
          Marcar como terminada
        </button>
        <button className="btn btn-ghost" onClick={sendActiveBackToPending}>
          Enviar a pendientes
        </button>
      </div>
    </section>
  );
}
