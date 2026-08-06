// Identificador de sesión, no criptográfico: solo necesita ser único
// dentro de la vida en RAM del proceso (no sobrevive a un reinicio).
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
