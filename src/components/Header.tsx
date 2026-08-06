import { useAppStore } from "../store/useAppStore";
import { ResetMemoryButton } from "./ResetMemoryButton";

export function Header() {
  const totalPomodorosToday = useAppStore((s) => s.totalPomodorosToday);

  return (
    <header className="app-header">
      <div>
        <h1>Enfoque</h1>
        <p className="app-subtitle">Una tarea. Un temporizador. Sin ruido.</p>
      </div>
      <div className="app-header-right">
        <span className="pomodoro-count" title="Pomodoros completados hoy">
          🍃 {totalPomodorosToday}
        </span>
        <ResetMemoryButton />
      </div>
    </header>
  );
}
