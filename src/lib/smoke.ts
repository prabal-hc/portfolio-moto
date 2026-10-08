import { gsap } from "./gsap";

/** The silencer tip, as a fraction of the bike drawing's width and height (viewBox 1000 × 560). */
export const EXHAUST = { x: 280 / 1000, y: 446 / 560 };

/**
 * One puff of exhaust left behind at the bike's silencer tip, drifting back and up as it fades.
 * `back` places it that many px behind the tip (to fill the gaps when a fast scroll covers a lot of road at once).
 */
export function puffAt(bike: HTMLElement, layer: HTMLElement, back = 0) {
  if (layer.childElementCount > 40) return;
  const b = bike.getBoundingClientRect();
  const l = layer.getBoundingClientRect();
  const size = b.width * gsap.utils.random(0.03, 0.055);
  const d = document.createElement("span");
  d.className = "smoke";
  Object.assign(d.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${b.left - l.left - back + b.width * EXHAUST.x - size / 2}px`,
    top: `${b.top - l.top + b.height * EXHAUST.y - size / 2}px`,
  });
  layer.appendChild(d);
  gsap.fromTo(
    d,
    { scale: 0.3, opacity: 0.9 },
    { scale: gsap.utils.random(1.6, 2.6), opacity: 0, x: gsap.utils.random(-70, -20), y: gsap.utils.random(-50, -15), duration: gsap.utils.random(0.9, 1.4), ease: "power2.out", onComplete: () => d.remove() },
  );
}

/** Calls `puff` every ~34px a bike rides forward, filling in behind it when one frame covers more road than that. */
export function smokeTrail(bike: HTMLElement, layer: HTMLElement) {
  let last = 0;
  return () => {
    const x = gsap.getProperty(bike, "x") as number;
    if (x < last) last = x; // riding backwards: no smoke, just keep the counter honest
    const gap = Math.min(Math.floor((x - last) / 34), 4);
    for (let i = gap - 1; i >= 0; i--) puffAt(bike, layer, i * 34);
    if (gap > 0) last = x;
  };
}
