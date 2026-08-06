interface Props {
  /** 0 a 1 */
  progress: number;
  /** nombre de la variable CSS de color, p.ej. "--color-primary" */
  colorVar: string;
}

const SIZE = 200;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ progress, colorVar }: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <svg
      width={SIZE}
      height={SIZE}
      className="progress-ring"
      role="img"
      aria-label={`Progreso de la sesión: ${Math.round(clamped * 100)}%`}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        className="progress-ring-track"
        strokeWidth={STROKE}
        fill="none"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        className="progress-ring-progress"
        style={{ stroke: `var(${colorVar})`, strokeDasharray: CIRCUMFERENCE, strokeDashoffset: offset }}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  );
}
