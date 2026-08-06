import { ActiveFocus } from "./components/ActiveFocus";
import { Header } from "./components/Header";
import { TaskInput } from "./components/TaskInput";
import { TaskList } from "./components/TaskList";
import { usePomodoroTimer } from "./hooks/usePomodoroTimer";

export default function App() {
  usePomodoroTimer();

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
