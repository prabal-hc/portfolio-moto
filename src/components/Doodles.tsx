/**
 * Hand-drawn bits: arrows, underlines, a helmet, the club emblem. Strokes use pathLength=1 so they can be
 * drawn in like the bike.
 */

/** A loose hand-drawn arrow. `flip` mirrors it so it can point the other way. */
export function Arrow({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={`doodle arrow ${className}`} viewBox="0 0 160 90" fill="none" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M6 18 C40 6 96 8 124 40 C134 52 138 62 140 74" pathLength={1} />
      <path d="M124 64 L141 78 L152 58" pathLength={1} />
    </svg>
  );
}

/** A wobbly underline. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg className={`doodle squiggle ${className}`} viewBox="0 0 220 24" fill="none" aria-hidden preserveAspectRatio="none">
      <path d="M4 14 C30 4 44 22 70 12 C96 2 108 22 136 12 C162 3 178 20 216 10" pathLength={1} />
    </svg>
  );
}

/** A retro open-face moto helmet with a peak, goggles on the strap, and an ear flap. */
export function Helmet({ className = "" }: { className?: string }) {
  return (
    <svg className={`doodle helmet ${className}`} viewBox="0 0 220 190" fill="none" aria-hidden>
      {/* shell and rim */}
      <path d="M30 122 C28 70 66 30 114 30 C162 30 190 66 188 122" pathLength={1} />
      <path d="M24 122 H194" pathLength={1} />
      {/* peak */}
      <path d="M156 50 C176 46 198 50 208 60 C196 62 180 64 168 70" pathLength={1} />
      {/* goggle strap and lens */}
      <path d="M36 86 C76 70 132 68 176 82" pathLength={1} />
      <path d="M134 86 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0" pathLength={1} />
      <path d="M144 86 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0" pathLength={1} />
      {/* ear flap */}
      <path d="M64 122 C62 146 72 162 90 166 C106 168 114 156 114 142 L114 122" pathLength={1} />
      {/* a stitched seam over the crown */}
      <path d="M70 46 C92 38 124 36 148 42" pathLength={1} />
    </svg>
  );
}

/** A four-point sparkle. */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg className={`doodle spark ${className}`} viewBox="0 0 40 40" aria-hidden>
      <path d="M20 2 C21 14 26 19 38 20 C26 21 21 26 20 38 C19 26 14 21 2 20 C14 19 19 14 20 2 Z" />
    </svg>
  );
}

/** The ride-club emblem: circular lettering around a wheel, slowly turning. */
export function Emblem({ className = "", text }: { className?: string; text: string }) {
  return (
    <svg className={`emblem ${className}`} viewBox="0 0 220 220" aria-hidden>
      <defs>
        <path id="emblem-ring" d="M110 110 m-82 0 a82 82 0 1 1 164 0 a82 82 0 1 1 -164 0" />
      </defs>
      <circle cx="110" cy="110" r="104" className="emblem-line" />
      <circle cx="110" cy="110" r="62" className="emblem-line" />
      <g className="emblem-spin">
        <text className="emblem-text">
          {/* fitted to the circle (2π × 82 ≈ 515), so the start and end never collide */}
          <textPath href="#emblem-ring" startOffset="0" textLength={512} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </g>
      {/* a tiny wheel in the middle */}
      <g className="emblem-wheel">
        <circle cx="110" cy="110" r="40" className="emblem-line thick" />
        <circle cx="110" cy="110" r="7" className="emblem-line" />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return <path key={i} d={`M${110 + Math.cos(a) * 8} ${110 + Math.sin(a) * 8} L${110 + Math.cos(a) * 36} ${110 + Math.sin(a) * 36}`} className="emblem-line" />;
        })}
      </g>
    </svg>
  );
}
