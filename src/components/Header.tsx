import { useAppStore } from "../store/useAppStore";
import { ResetDataButton } from "./ResetDataButton";

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
        <ResetDataButton />
      </div>
    </header>
  );
}
