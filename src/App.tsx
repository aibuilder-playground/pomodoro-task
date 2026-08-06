import { useEffect } from "react";
import { ActiveFocus } from "./components/ActiveFocus";
import { Header } from "./components/Header";
import { TaskInput } from "./components/TaskInput";
import { TaskList } from "./components/TaskList";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  usePomodoroTimer();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    // La carga desde disco toma unos pocos milisegundos; este estado casi
    // nunca llega a pintarse, pero evita un parpadeo de contenido vacío
    // antes de que los datos guardados aparezcan.
    return (
      <div className="app-shell app-loading" aria-busy="true">
        <div className="breathing-dot" aria-hidden />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <ActiveFocus />
        <TaskInput />
        <TaskList />
      </main>
    </div>
  );
}
