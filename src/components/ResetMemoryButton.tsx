import { useState } from "react";
import { useAppStore } from "../store/useAppStore";

// Acción destructiva e irreversible dentro de la sesión: exige una confirmación explícita.
export function ResetMemoryButton() {
  const [confirming, setConfirming] = useState(false);
  const resetMemory = useAppStore((s) => s.resetMemory);

  if (confirming) {
    return (
      <span className="reset-confirm">
        <span className="reset-confirm-text">¿Borrar toda la memoria?</span>
        <button
          className="btn btn-small btn-danger"
          onClick={() => {
            resetMemory();
            setConfirming(false);
          }}
        >
          Sí, borrar
        </button>
        <button className="btn btn-small btn-ghost" onClick={() => setConfirming(false)}>
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button
      className="btn btn-small btn-ghost"
      onClick={() => setConfirming(true)}
      title="Borra todas las tareas y el temporizador de la memoria RAM. No hay persistencia en esta fase: al reiniciar la app también se pierde todo."
    >
      Simular reinicio / Borrar memoria
    </button>
  );
}
