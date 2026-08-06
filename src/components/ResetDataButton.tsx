import { useState } from "react";
import { useAppStore } from "../store/useAppStore";

// Acción destructiva e irreversible: borra la RAM y el archivo en disco.
// Exige una confirmación explícita antes de ejecutarse.
export function ResetDataButton() {
  const [confirming, setConfirming] = useState(false);
  const resetAllData = useAppStore((s) => s.resetAllData);

  if (confirming) {
    return (
      <span className="reset-confirm">
        <span className="reset-confirm-text">¿Borrar todos los datos guardados?</span>
        <button
          className="btn btn-small btn-danger"
          onClick={() => {
            resetAllData();
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
      title="Borra todas las tareas, el temporizador y el archivo guardado en disco. Empieza el día desde cero."
    >
      Reiniciar día / Borrar datos guardados
    </button>
  );
}
