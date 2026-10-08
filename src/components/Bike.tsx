/**
 * A Royal Enfield Hunter 350, side view facing right, drawn as ink line-art.
 * Every stroke has pathLength=1, so CSS/GSAP can "draw" it with stroke-dashoffset (1 → 0).
 *
 * Coordinates: viewBox 0 0 1000 560, wheels on the ground line y = 540.
 * BIKE_PARTS gives anchor points (same coordinates) for callouts.
 */
export const BIKE_PARTS = {
  engine: { x: 560, y: 372 },
  tank: { x: 585, y: 214 },
  wheel: { x: 230, y: 410 },
  cockpit: { x: 748, y: 196 },
} as const;

/**
 * How a stroke is painted. On the site: CSS classes (so strokes can be animated). In the link-preview card:
 * inline attributes, because the card renderer has no stylesheet.
 */
type Paint = (cls: string) => Record<string, string | number>;
const INK = "#1c1a17";
const byClass: Paint = (cls) => ({ className: cls });
const inline: Paint = (cls) => {
  const c = cls.split(" ");
  const fill = c.includes("tank") || c.includes("tail") ? "#e8501c" : c.includes("fill-paper") ? "#f1e9dc" : c.includes("lamp") ? "rgba(232,80,28,0.12)" : "none";
  return {
    stroke: INK,
    strokeWidth: c.includes("thick") ? 4 : c.includes("thin") ? 1.6 : 2.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill,
    ...(c.includes("dashed") ? { strokeDasharray: "6 7" } : {}),
    ...(c.includes("bike-road") ? { display: "none" } : {}),
  };
};

const REAR = { x: 230, y: 410 };
const FRONT = { x: 772, y: 410 };

/** Alloy wheel: tyre, rim, hub and ten spokes in pairs. */
function Wheel({ cx, cy, front, paint }: { cx: number; cy: number; front?: boolean; paint: Paint }) {
  const spokes = Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2);
  return (
    // data-origin: the hub, in SVG units, so GSAP can spin the wheel about its own centre
    <g {...(paint === byClass ? { className: "bike-wheel", "data-origin": `${cx} ${cy}` } : {})}>
      <circle cx={cx} cy={cy} r={128} pathLength={1} {...paint("ink thick")} />
      <circle cx={cx} cy={cy} r={110} pathLength={1} {...paint("ink")} />
      <circle cx={cx} cy={cy} r={96} pathLength={1} {...paint("ink thin")} />
      <circle cx={cx} cy={cy} r={20} pathLength={1} {...paint("ink")} />
      {spokes.map((a, i) => {
        // each "spoke" is a slim Y like a cast alloy wheel
        const x1 = cx + Math.cos(a) * 22;
        const y1 = cy + Math.sin(a) * 22;
        const x2a = cx + Math.cos(a - 0.12) * 95;
        const y2a = cy + Math.sin(a - 0.12) * 95;
        const x2b = cx + Math.cos(a + 0.12) * 95;
        const y2b = cy + Math.sin(a + 0.12) * 95;
        return <path key={i} d={`M${x1} ${y1} L${x2a} ${y2a} M${x1} ${y1} L${x2b} ${y2b}`} pathLength={1} {...paint("ink thin")} />;
      })}
      {front && <circle cx={cx} cy={cy} r={62} pathLength={1} {...paint("ink thin dashed-disc")} />}
    </g>
  );
}

export function Bike({
  className = "",
  title = "Royal Enfield Hunter 350, line drawing",
  inlineStyles = false,
}: {
  className?: string;
  title?: string;
  /** paint with inline attributes instead of CSS classes (for the link-preview card) */
  inlineStyles?: boolean;
}) {
  const paint = inlineStyles ? inline : byClass;
  return (
    <svg
      viewBox="0 0 1000 560"
      fill="none"
      {...(inlineStyles ? { width: 1000, height: 560 } : { className: `bike ${className}`, role: "img", "aria-label": title })}
    >
      {/* road */}
      <path d="M30 540 H970" pathLength={1} {...paint("ink thin bike-road")} />

      <Wheel cx={REAR.x} cy={REAR.y} paint={paint} />
      <Wheel cx={FRONT.x} cy={FRONT.y} front paint={paint} />

      {/* fenders */}
      <path d="M98 372 C120 290 200 262 278 272 C320 278 352 300 360 322" pathLength={1} {...paint("ink")} />
      <path d="M672 338 C700 290 760 272 816 282 C846 288 870 306 880 330" pathLength={1} {...paint("ink")} />

      {/* swingarm + chain */}
      <path d="M232 404 L438 382 M232 418 L440 398" pathLength={1} {...paint("ink")} />
      <circle cx={REAR.x} cy={REAR.y} r={38} pathLength={1} {...paint("ink thin")} />
      <path d="M232 372 L476 392 M232 448 L478 414" pathLength={1} {...paint("ink thin dashed")} />
      <circle cx={480} cy={403} r={14} pathLength={1} {...paint("ink thin")} />

      {/* rear shock: spring */}
      <path d="M318 286 L298 300 L330 312 L300 324 L332 336 L302 348 L334 360 L306 372 L282 396" pathLength={1} {...paint("ink thin")} />

      {/* frame: backbone, rear loop, down tube and cradle */}
      <path d="M706 214 C640 232 520 246 430 262 L300 262" pathLength={1} {...paint("ink")} />
      <path d="M430 262 L440 392" pathLength={1} {...paint("ink")} />
      <path d="M700 226 C690 290 664 360 640 420 L470 432 L440 392" pathLength={1} {...paint("ink")} />

      {/* engine: crankcase, finned cylinder, head */}
      <path d="M478 342 C478 322 496 310 520 310 L618 310 C640 310 652 326 652 346 L652 392 C652 418 632 434 606 434 L520 434 C494 434 478 418 478 396 Z" pathLength={1} {...paint("ink fill-paper")} />
      <circle cx={548} cy={378} r={30} pathLength={1} {...paint("ink thin")} />
      <circle cx={548} cy={378} r={16} pathLength={1} {...paint("ink thin")} />
      <path d="M578 312 L600 236 L664 244 L644 318" pathLength={1} {...paint("ink fill-paper")} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t = i / 6;
        const y = 300 - t * 58;
        return <path key={i} d={`M${574 - t * 2 + 6} ${y} L${652 + 6 - t * 2} ${y + 8}`} pathLength={1} {...paint("ink thin")} />;
      })}
      <path d="M598 236 L604 214 L668 222 L664 244" pathLength={1} {...paint("ink")} />

      {/* exhaust: header out of the head, under the engine, up into the silencer */}
      <path d="M660 300 C690 330 686 420 640 446 C600 466 520 462 470 458" pathLength={1} {...paint("ink")} />
      <path d="M470 446 L300 418 C286 416 280 428 284 438 C288 448 296 452 306 452 L470 470 Z" pathLength={1} {...paint("ink fill-paper")} />

      {/* fuel tank: the orange one */}
      <path
        d="M462 262 C466 214 534 186 604 184 C652 183 690 196 702 220 C708 236 694 252 664 258 C610 266 520 268 462 262 Z"
        pathLength={1}
        {...paint("ink tank")}
      />
      <path d="M540 214 C570 206 610 204 640 210" pathLength={1} {...paint("ink thin")} />
      <path d="M520 244 L600 240" pathLength={1} {...paint("ink thin")} />

      {/* seat, tail and tail-light */}
      <path d="M284 246 C300 228 380 224 470 236 L470 262 L292 262 C282 262 278 254 284 246 Z" pathLength={1} {...paint("ink fill-paper")} />
      <path d="M292 262 L176 270 C164 271 158 262 166 254 L284 246" pathLength={1} {...paint("ink")} />
      <path d="M150 252 h18 v16 h-18 Z" pathLength={1} {...paint("ink tail")} />

      {/* side panel */}
      <ellipse cx={380} cy={296} rx={44} ry={26} pathLength={1} {...paint("ink thin")} />

      {/* forks, yoke and front hub */}
      <path d="M700 206 L768 408 M716 202 L784 404" pathLength={1} {...paint("ink")} />
      <path d="M690 206 L732 196" pathLength={1} {...paint("ink")} />

      {/* headlamp */}
      <circle cx={752} cy={198} r={34} pathLength={1} {...paint("ink fill-paper")} />
      <circle cx={752} cy={198} r={22} pathLength={1} {...paint("ink thin lamp")} />
      <path d="M724 216 L708 230" pathLength={1} {...paint("ink thin")} />

      {/* handlebar, grip, mirror and the round console */}
      <path d="M712 190 C696 168 680 156 650 152 L630 152" pathLength={1} {...paint("ink")} />
      <path d="M626 146 h-30 a6 6 0 0 0 0 12 h30" pathLength={1} {...paint("ink")} />
      <path d="M676 158 L664 106" pathLength={1} {...paint("ink thin")} />
      <circle cx={662} cy={92} r={14} pathLength={1} {...paint("ink thin")} />
      <circle cx={716} cy={176} r={10} pathLength={1} {...paint("ink thin")} />

      {/* footpeg */}
      <path d="M448 438 h40" pathLength={1} {...paint("ink thin")} />
    </svg>
  );
}
