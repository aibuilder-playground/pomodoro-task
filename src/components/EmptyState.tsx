export function EmptyState() {
  return (
    <section className="focus-card focus-card--empty" aria-live="polite">
      <div className="breathing-dot" aria-hidden />
      <p className="empty-state-title">Ninguna tarea en marcha</p>
      <p className="empty-state-subtitle">
        Elige una tarea de tu lista y presiona <strong>Iniciar</strong> para comenzar tu sesión de enfoque.
      </p>
    </section>
  );
}
