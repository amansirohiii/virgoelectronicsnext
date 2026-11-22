import { useId } from "react";

/**
 * Outline drawing of a cooler cabinet: front and side elevation, to scale,
 * with dimension lines. Built from the listed width, depth and height only.
 * It shows size and proportion, not the styling of the model.
 */
type Props = {
  name: string;
  /** inches */
  w: number;
  d: number;
  h: number;
  /** Largest height in the set being shown, so several drawings share one scale */
  scaleTo?: number;
  className?: string;
  /** Hide the side view for small uses such as cards */
  frontOnly?: boolean;
};

const INK = "#16181b";
const STEEL = "#6b7178";

export function CoolerDrawing({ name, w, d, h, scaleTo, className, frontOnly = false }: Props) {
  const hatchId = `pad-hatch-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const maxH = scaleTo ?? h;
  const unit = 300 / maxH; // px per inch: the tallest cabinet is 300 px high
  const fw = w * unit;
  const sw = d * unit;
  const ch = h * unit;

  const padL = 46; // room for the height dimension
  const padT = 14;
  const gap = 54;
  const baseY = padT + 300;
  const top = baseY - ch;
  const frontX = padL;
  const sideX = frontX + fw + gap;
  const width = frontOnly ? frontX + fw + 14 : sideX + sw + 14;
  const height = baseY + 44;

  // Front louvres: evenly spaced lines in the upper 55% of the cabinet
  const louvreTop = top + ch * 0.12;
  const louvreBottom = top + ch * 0.6;
  const louvreCount = Math.max(4, Math.round((louvreBottom - louvreTop) / 11));
  const louvres = Array.from({ length: louvreCount }, (_, i) => {
    const y = louvreTop + ((louvreBottom - louvreTop) * i) / (louvreCount - 1);
    return y;
  });

  // Side pad: a hatch of diagonal lines inside an inset panel
  const padInset = Math.min(sw * 0.14, 10);
  const padTop = top + ch * 0.1;
  const padBottom = top + ch * 0.66;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Outline drawing of the ${name}: ${w} inches wide, ${d} inches deep, ${h} inches high`}
      className={className}
      style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}
    >
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={STEEL} strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* Floor line */}
      <line x1="0" y1={baseY} x2={width} y2={baseY} stroke={STEEL} strokeWidth="0.75" strokeDasharray="2 3" />

      {/* Front elevation */}
      <g fill="none" stroke={INK} strokeWidth="1.5">
        <rect x={frontX} y={top} width={fw} height={ch} fill="#fff" />
        <rect x={frontX + fw * 0.08} y={louvreTop - 5} width={fw * 0.84} height={louvreBottom - louvreTop + 10} strokeWidth="1" />
        {louvres.map((y) => (
          <line key={y} x1={frontX + fw * 0.11} x2={frontX + fw * 0.89} y1={y} y2={y} strokeWidth="0.8" stroke={STEEL} />
        ))}
        {/* Tank line */}
        <line x1={frontX} x2={frontX + fw} y1={top + ch * 0.78} y2={top + ch * 0.78} strokeWidth="1" />
      </g>

      {/* Side elevation */}
      {!frontOnly ? (
        <g fill="none" stroke={INK} strokeWidth="1.5">
          <rect x={sideX} y={top} width={sw} height={ch} fill="#fff" />
          <rect
            x={sideX + padInset}
            y={padTop}
            width={sw - padInset * 2}
            height={padBottom - padTop}
            fill={`url(#${hatchId})`}
            strokeWidth="1"
          />
          <line x1={sideX} x2={sideX + sw} y1={top + ch * 0.78} y2={top + ch * 0.78} strokeWidth="1" />
        </g>
      ) : null}

      {/* Dimensions */}
      <g className="draw" stroke={INK} strokeWidth="0.9" fill="none">
        {/* Height */}
        <line x1={frontX - 20} x2={frontX - 20} y1={top} y2={baseY} />
        <line x1={frontX - 25} x2={frontX - 15} y1={top} y2={top} />
        <line x1={frontX - 25} x2={frontX - 15} y1={baseY} y2={baseY} />
        {/* Width */}
        <line x1={frontX} x2={frontX + fw} y1={baseY + 16} y2={baseY + 16} />
        <line x1={frontX} x2={frontX} y1={baseY + 11} y2={baseY + 21} />
        <line x1={frontX + fw} x2={frontX + fw} y1={baseY + 11} y2={baseY + 21} />
        {/* Depth */}
        {!frontOnly ? (
          <>
            <line x1={sideX} x2={sideX + sw} y1={baseY + 16} y2={baseY + 16} />
            <line x1={sideX} x2={sideX} y1={baseY + 11} y2={baseY + 21} />
            <line x1={sideX + sw} x2={sideX + sw} y1={baseY + 11} y2={baseY + 21} />
          </>
        ) : null}
      </g>

      <g fill={INK} stroke="none">
        <text
          x={frontX - 28}
          y={top + ch / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${frontX - 28} ${top + ch / 2})`}
        >
          {h} in
        </text>
        <text x={frontX + fw / 2} y={baseY + 34} textAnchor="middle">
          {w} in
        </text>
        {!frontOnly ? (
          <text x={sideX + sw / 2} y={baseY + 34} textAnchor="middle">
            {d} in
          </text>
        ) : null}
      </g>
    </svg>
  );
}
