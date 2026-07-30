import { useId } from "react";

const DOT_COUNT = 30;
const DOT_RADIUS = 92;
const HAIRLINE_COUNT = 60;
const HAIRLINE_INNER = 84;
const HAIRLINE_OUTER = 90;

function polar(radius: number, angleRad: number) {
  return { x: 100 + radius * Math.cos(angleRad), y: 100 + radius * Math.sin(angleRad) };
}

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const { x, y } = polar(DOT_RADIUS, (i / DOT_COUNT) * Math.PI * 2);
  const big = i % 4 === 0;
  return { x, y, r: big ? 4.6 : 3.4, fill: big ? "#ffb066" : "#b5390d" };
});

const HAIRLINES = Array.from({ length: HAIRLINE_COUNT }, (_, i) => {
  const angle = (i / HAIRLINE_COUNT) * Math.PI * 2;
  const inner = polar(HAIRLINE_INNER, angle);
  const outer = polar(HAIRLINE_OUTER, angle);
  return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
});

/**
 * Emblem mark for SEAL Hackathon: a stamped medallion (embossed rim, engine-turn
 * edge, relief shield-check) rather than a character mascot — plays on the
 * product name and the "minh bạch, xác thực" positioning already in the copy.
 */
export function SealEmblem({ size = 220, className = "" }: { size?: number; className?: string }) {
  const uid = useId();
  const faceId = `seal-face-${uid}`;
  const rimId = `seal-rim-${uid}`;
  const iconId = `seal-icon-${uid}`;
  const clipId = `seal-clip-${uid}`;

  return (
    <svg
      className={`seal-emblem ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SEAL Hackathon"
    >
      <defs>
        <radialGradient id={faceId} cx="32%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#ffab6b" />
          <stop offset="45%" stopColor="#e8560f" />
          <stop offset="100%" stopColor="#7a2606" />
        </radialGradient>
        <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffcd9a" />
          <stop offset="50%" stopColor="#d9660f" />
          <stop offset="100%" stopColor="#7a2606" />
        </linearGradient>
        <linearGradient id={iconId} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#e6dac4" />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="69" />
        </clipPath>
      </defs>

      <ellipse className="seal-glow" cx="100" cy="100" rx="96" ry="96" fill={`url(#${faceId})`} opacity="0.32" />

      <g className="seal-float">
        <g className="seal-ring-spin">
          {HAIRLINES.map((h, i) => (
            <line
              key={`hl-${i}`}
              x1={h.x1}
              y1={h.y1}
              x2={h.x2}
              y2={h.y2}
              stroke="rgba(255,220,180,0.28)"
              strokeWidth={1}
            />
          ))}
          {DOTS.map((d, i) => (
            <circle key={`dot-${i}`} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
          ))}
        </g>

        <circle cx="100" cy="100" r="82" fill="none" stroke="#5a1c04" strokeWidth="2.5" opacity="0.55" />
        <circle cx="100" cy="100" r="76" fill="none" stroke={`url(#${rimId})`} strokeWidth="7" />
        <circle cx="100" cy="100" r="79.5" fill="none" stroke="#ffd9ac" strokeWidth="1" opacity="0.5" />

        <circle cx="100" cy="100" r="69" fill={`url(#${faceId})`} />
        <ellipse cx="74" cy="66" rx="32" ry="17" fill="white" opacity="0.16" />
        <path
          d="M 40 138 A 69 69 0 0 0 160 138"
          fill="none"
          stroke="#4a1703"
          strokeWidth="14"
          opacity="0.22"
          strokeLinecap="round"
        />

        <g clipPath={`url(#${clipId})`}>
          <rect className="seal-sweep" x="-20" y="0" width="34" height="220" fill="white" opacity="0" />
        </g>

        <g opacity="0.5" transform="translate(101,103)">
          <path d="M0 -30 L22 -20 V4 C22 20 12 30 0 36 C-12 30 -22 20 -22 4 V-20 Z" fill="#4a1703" />
        </g>
        <g transform="translate(100,102)">
          <path d="M0 -30 L22 -20 V4 C22 20 12 30 0 36 C-12 30 -22 20 -22 4 V-20 Z" fill={`url(#${iconId})`} />
          <path
            d="M-10 0 L-2 9 L13 -9"
            fill="none"
            stroke="#a8390a"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <g transform="translate(150,50)">
          <circle r="9" fill="#7a2606" opacity="0.4" />
          <path className="seal-spark" d="M2 -8 L-3 3 L2 3 L-2 12 L7 0 L2 0 Z" fill="#ffe08a" />
        </g>
      </g>
    </svg>
  );
}
