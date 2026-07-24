/**
 * Original animated mascot for SEAL Hackathon — a friendly glossy "spark bot" figure.
 * Pure SVG + CSS keyframes (float, blink, glow-pulse, chest-spark), no external assets.
 * Genre-inspired by glossy toy-robot mascots in general, but an original design:
 * distinct silhouette, color story and details — not a copy of any specific character.
 */
export function MascotBot({ size = 220, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`mascot-bot ${className}`}
      width={size}
      height={size * 1.2}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mascot SEAL Hackathon"
    >
      <defs>
        <linearGradient id="mb-head" x1="46" y1="20" x2="154" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="mb-body" x1="48" y1="118" x2="152" y2="208" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="mb-visor" x1="58" y1="58" x2="142" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a0f2e" />
          <stop offset="100%" stopColor="#161c47" />
        </linearGradient>
        <radialGradient id="mb-glow" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mb-spark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="228" rx="46" ry="8" fill="#020617" opacity="0.35" />

      <g className="mascot-float">
        <ellipse className="mascot-glow" cx="100" cy="105" rx="98" ry="98" fill="url(#mb-glow)" />

        <rect x="20" y="132" width="24" height="52" rx="12" fill="#e6ecff" />
        <rect x="156" y="132" width="24" height="52" rx="12" fill="#e6ecff" />

        <rect x="48" y="118" width="104" height="86" rx="34" fill="url(#mb-body)" />
        <ellipse cx="80" cy="136" rx="20" ry="10" fill="white" opacity="0.16" />

        <circle cx="100" cy="152" r="20" fill="#0a0f2e" />
        <circle cx="100" cy="152" r="20" fill="none" stroke="#e6ecff" strokeWidth="3" />
        <path
          className="mascot-spark"
          d="M103 141 L94 155 L100 155 L96 165 L107 150 L100 150 Z"
          fill="url(#mb-spark)"
        />

        <rect x="66" y="196" width="26" height="22" rx="9" fill="#161c47" />
        <rect x="108" y="196" width="26" height="22" rx="9" fill="#161c47" />

        <path d="M100 8 L100 26" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <circle className="mascot-spark" cx="100" cy="6" r="6" fill="#38bdf8" />

        <path d="M40 60 Q28 48 34 32 Q46 40 48 56 Z" fill="url(#mb-head)" />
        <path d="M160 60 Q172 48 166 32 Q154 40 152 56 Z" fill="url(#mb-head)" />

        <circle cx="100" cy="72" r="54" fill="url(#mb-head)" />
        <ellipse cx="76" cy="46" rx="24" ry="13" fill="white" opacity="0.2" />

        <rect x="56" y="60" width="88" height="42" rx="20" fill="url(#mb-visor)" />
        <g className="mascot-eyes">
          <circle cx="82" cy="81" r="10" fill="#e6f6ff" />
          <circle cx="118" cy="81" r="10" fill="#e6f6ff" />
          <circle cx="84" cy="82" r="4.5" fill="#0a0f2e" />
          <circle cx="120" cy="82" r="4.5" fill="#0a0f2e" />
          <circle cx="86.5" cy="79.5" r="1.6" fill="white" />
          <circle cx="122.5" cy="79.5" r="1.6" fill="white" />
        </g>
      </g>
    </svg>
  );
}
