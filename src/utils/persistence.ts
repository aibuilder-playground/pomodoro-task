import { invoke } from "@tauri-apps/api/core";
import { PersistedState } from "../types";

const CURRENT_VERSION = 1;

function runningInTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// Todas las escrituras (guardar y borrar) pasan por esta misma cadena de
// promesas para que se ejecuten en el orden en que se dispararon. Sin esto,
// dos acciones seguidas (p. ej. pausar y luego completar) podrían resolverse
// en desorden y dejar en disco un estado más viejo que el real.
let writeChain: Promise<void> = Promise.resolve();

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  writeChain = writeChain.catch(() => {}).then(task);
  return writeChain;
}

export async function loadPersistedState(): Promise<PersistedState | null> {
  if (!runningInTauri()) return null;
  try {
    const raw = await invoke<string | null>("load_state");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.version !== CURRENT_VERSION) {
      // Esquema futuro o desconocido: se prefiere empezar limpio a
      // arriesgar datos mal interpretados.
      return null;
    }
    return parsed as PersistedState;
  } catch (err) {
    console.warn("No se pudo leer el estado guardado; se inicia en memoria:", err);
    return null;
  }
}

export function savePersistedState(state: Omit<PersistedState, "version" | "lastSavedAt">): Promise<void> {
  if (!runningInTauri()) return Promise.resolve();
  const payload: PersistedState = { ...state, version: CURRENT_VERSION, lastSavedAt: Date.now() };
  return enqueueWrite(async () => {
    try {
      await invoke("save_state", { data: JSON.stringify(payload) });
    } catch (err) {
      console.warn("No se pudo guardar el estado en disco:", err);
    }
  });
}

export function clearPersistedState(): Promise<void> {
  if (!runningInTauri()) return Promise.resolve();
  return enqueueWrite(async () => {
    try {
      await invoke("clear_state");
    } catch (err) {
      console.warn("No se pudo borrar el archivo de datos:", err);
    }
  });
}
