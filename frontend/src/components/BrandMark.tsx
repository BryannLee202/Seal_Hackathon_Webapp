/**
 * Small logomark used inside the existing gradient-brand square (nav, sidebar,
 * footer) — same swirl motif as favicon.svg, recolored to sit on the orange
 * gradient instead of carrying its own background.
 */
export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="#faf6ef"
        strokeWidth="1.8"
        strokeDasharray="46 36"
        strokeLinecap="round"
        opacity="0.5"
        transform="rotate(10 16 16)"
      />
      <circle
        cx="16"
        cy="16"
        r="9.5"
        fill="none"
        stroke="#faf6ef"
        strokeWidth="2"
        strokeDasharray="34 26"
        strokeLinecap="round"
        opacity="0.75"
        transform="rotate(-55 16 16)"
      />
      <circle
        cx="16"
        cy="16"
        r="5.5"
        fill="none"
        stroke="#fff3d6"
        strokeWidth="1.8"
        strokeDasharray="20 16"
        strokeLinecap="round"
        transform="rotate(120 16 16)"
      />
      <circle cx="16" cy="16" r="2.6" fill="#fff3d6" />
    </svg>
  );
}
