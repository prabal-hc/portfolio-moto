"use client";

import { audio } from "./audio";

/** A tool landing on its hook: a short, bright metallic clink (pitched a little differently for each tool). */
export function playClink(i = 0) {
  const c = audio();
  if (!c || c.state !== "running") return; // no click or tap yet, so the browser won't allow sound
  try {
    const t0 = c.currentTime + 0.005;
    const base = [1760, 1480, 1980, 1320][i % 4];
    const out = c.createGain();
    out.gain.value = 0.5;
    out.connect(c.destination);
    // inharmonic partials are what make it sound like metal rather than a bell
    [1, 1.52, 2.33].forEach((k, n) => {
      const o = c.createOscillator();
      o.type = "triangle";
      o.frequency.value = base * k;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.09 / (n + 1), t0 + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32 - n * 0.07);
      o.connect(g).connect(out);
      o.start(t0);
      o.stop(t0 + 0.35);
    });
  } catch {
    // no sound is fine
  }
}
