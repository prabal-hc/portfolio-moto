"use client";

import { audio } from "./audio";

/** Fuel going in: three or four rising "glug" bubbles. */
export function playGlug() {
  const c = audio();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume();
    const t0 = c.currentTime + 0.01;
    const out = c.createGain();
    out.gain.value = 0.6;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    out.connect(lp).connect(c.destination);
    for (let i = 0; i < 4; i++) {
      const at = t0 + i * 0.13 + Math.random() * 0.03;
      const o = c.createOscillator();
      o.type = "sine";
      const f = 160 + Math.random() * 60;
      o.frequency.setValueAtTime(f, at);
      o.frequency.exponentialRampToValueAtTime(f * 3.2, at + 0.09);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.35, at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
      o.connect(g).connect(out);
      o.start(at);
      o.stop(at + 0.13);
    }
  } catch {
    // no sound is fine
  }
}
