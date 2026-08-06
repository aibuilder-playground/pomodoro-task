import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

// Un único intervalo global de 1s que solo corre mientras hay una tarea activa.
export function usePomodoroTimer() {
  const isRunning = useAppStore((s) => s.isRunning);
  const tick = useAppStore((s) => s.tick);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, tick]);
}
