import type { CSSProperties } from "react";

export function ScoreSlider({
  id,
  label,
  max,
  weight,
  value,
  onChange,
}: {
  id: string;
  label: string;
  max: number;
  weight?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div className="score-slider">
      <div className="score-slider-head">
        <label htmlFor={id}>
          {label}
          {weight !== undefined && <span className="score-slider-weight">Trọng số {weight}%</span>}
        </label>
        <div className="score-slider-value">
          {clamped.toFixed(1)}
          <small>/{max}</small>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        className="score-range"
        style={{ "--fill": `${pct}%` } as CSSProperties}
      />
      <div className="score-slider-scale">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
