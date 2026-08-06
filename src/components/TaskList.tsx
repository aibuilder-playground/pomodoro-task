import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TaskItem } from "./TaskItem";

export function TaskList() {
  const tasks = useAppStore((s) => s.tasks);
  const [showCompleted, setShowCompleted] = useState(false);

  if (tasks.length === 0) {
    return <p className="task-list-empty">Tu lista está vacía. Agrega tu primera tarea arriba.</p>;
  }

  const inProgress = tasks.filter((t) => t.status === "active" || t.status === "paused");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="task-list">
      {[...inProgress, ...pending].map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}

      {completed.length > 0 && (
        <div className="completed-section">
          <button
            className="completed-toggle"
            onClick={() => setShowCompleted((v) => !v)}
            aria-expanded={showCompleted}
          >
            {showCompleted ? "▾" : "▸"} Completadas ({completed.length})
          </button>
          {showCompleted && completed.map((t) => <TaskItem key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
