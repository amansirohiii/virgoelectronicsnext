/**
 * Outline drawing of a conduit pipe: the cut end and a broken side view, with
 * dimension lines. Built from the nominal size and the supplied length only.
 * Several drawings can share one scale, so a 20 mm pipe sits visibly smaller
 * beside a 25 mm one. The wall is drawn at a nominal thickness, not to gauge.
 */
type Props = {
  name: string;
  /** Nominal size: the outer diameter in millimetres */
  outerMm: number;
  lengthM: number;
  /** Largest outer diameter in the set being shown, so the drawings share one scale */
  scaleTo?: number;
  className?: string;
  /** Hide the side view, for showing sizes next to each other */
  endOnly?: boolean;
};

const INK = "#16181b";
const STEEL = "#6b7178";

export function ConduitDrawing({ name, outerMm, lengthM, scaleTo, className, endOnly = false }: Props) {
  const BIG = 112; // px: diameter of the largest pipe in the set
  const dia = (outerMm / (scaleTo ?? outerMm)) * BIG;
  const r = dia / 2;
  const wall = Math.max(3, dia * 0.07);

  const padL = 16;
  const padT = 14;
  const baseY = padT + BIG; // every pipe rests on this line
  const cx = padL + BIG / 2;
  const cy = baseY - r;
  const top = baseY - dia;

  const sideX = padL + BIG + 44;
  const sideW = 196;
  const sideEnd = sideX + sideW;
  const mid = sideX + sideW / 2;
  const width = endOnly ? padL * 2 + BIG : sideEnd + 16;
  const height = baseY + 44;
  const dimY = baseY + 16;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Outline drawing of the ${name}: ${outerMm} millimetres across, ${lengthM} metres long`}
      className={className}
      style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}
    >
      {/* Floor line */}
      <line x1="0" y1={baseY} x2={width} y2={baseY} stroke={STEEL} strokeWidth="0.75" strokeDasharray="2 3" />

      {/* Cut end */}
      <g fill="#fff" stroke={INK}>
        <circle cx={cx} cy={cy} r={r} strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={r - wall} strokeWidth="1" fill="#f3f2ee" />
      </g>
      {/* Centre mark */}
      <g stroke={STEEL} strokeWidth="0.75">
        <line x1={cx - 5} x2={cx + 5} y1={cy} y2={cy} />
        <line x1={cx} x2={cx} y1={cy - 5} y2={cy + 5} />
      </g>

      {/* Side view, broken in the middle because the pipe is far longer than it is wide */}
      {!endOnly ? (
        <>
          <g fill="#fff" stroke={INK} strokeWidth="1.5" strokeLinejoin="miter">
            <path d={`M${mid - 3} ${top} H${sideX} V${baseY} H${mid - 11} Z`} />
            <path d={`M${mid + 11} ${top} H${sideEnd} V${baseY} H${mid + 3} Z`} />
          </g>
          {/* The bore, shown as hidden lines */}
          <g stroke={STEEL} strokeWidth="0.75" strokeDasharray="4 3">
            <line x1={sideX} x2={mid - 6} y1={top + wall} y2={top + wall} />
            <line x1={sideX} x2={mid - 10} y1={baseY - wall} y2={baseY - wall} />
            <line x1={mid + 10} x2={sideEnd} y1={top + wall} y2={top + wall} />
            <line x1={mid + 6} x2={sideEnd} y1={baseY - wall} y2={baseY - wall} />
          </g>
        </>
      ) : null}

      {/* Dimensions */}
      <g className="draw" stroke={INK} strokeWidth="0.9" fill="none">
        <line x1={cx - r} x2={cx + r} y1={dimY} y2={dimY} />
        <line x1={cx - r} x2={cx - r} y1={dimY - 5} y2={dimY + 5} />
        <line x1={cx + r} x2={cx + r} y1={dimY - 5} y2={dimY + 5} />
        {!endOnly ? (
          <>
            <line x1={sideX} x2={sideEnd} y1={dimY} y2={dimY} />
            <line x1={sideX} x2={sideX} y1={dimY - 5} y2={dimY + 5} />
            <line x1={sideEnd} x2={sideEnd} y1={dimY - 5} y2={dimY + 5} />
          </>
        ) : null}
      </g>

      <g fill={INK} stroke="none">
        <text x={cx} y={baseY + 34} textAnchor="middle">
          {outerMm} mm
        </text>
        {!endOnly ? (
          <text x={mid} y={baseY + 34} textAnchor="middle">
            {lengthM} m
          </text>
        ) : null}
      </g>
    </svg>
  );
}
