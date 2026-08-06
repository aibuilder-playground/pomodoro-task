import { Task } from "../types";
import { useAppStore } from "../store/useAppStore";

const STATUS_LABEL: Record<Task["status"], string> = {
  pending: "Pendiente",
  active: "En progreso",
  paused: "Pausada",
  completed: "Terminada",
};

export function TaskItem({ task }: { task: Task }) {
  const activeTaskId = useAppStore((s) => s.activeTaskId);
  const startTask = useAppStore((s) => s.startTask);
  const hasActiveTask = activeTaskId !== null;

  const canStart = task.status === "pending" && !hasActiveTask;

  return (
    <div className={`task-item task-item--${task.status}`}>
      <span className={`status-dot status-dot--${task.status}`} aria-hidden />
      <span className="task-item-title">{task.title}</span>
      <span className="task-item-status">{STATUS_LABEL[task.status]}</span>
      {task.status === "pending" && (
        <button
          className="btn btn-small btn-primary"
          onClick={() => startTask(task.id)}
          disabled={!canStart}
          title={hasActiveTask ? "Termina o pausa la tarea activa antes de iniciar otra" : "Iniciar esta tarea"}
        >
          Iniciar
        </button>
      )}
    </div>
  );
}
