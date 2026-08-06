import { FormEvent, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export function TaskInput() {
  const [value, setValue] = useState("");
  const addTask = useAppStore((s) => s.addTask);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    addTask(value);
    setValue("");
  }

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="¿Qué quieres hacer hoy? Escribe y presiona Enter…"
        aria-label="Agregar nueva tarea"
        maxLength={120}
      />
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        Agregar
      </button>
    </form>
  );
}
