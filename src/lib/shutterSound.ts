"use client";

import { audio, noiseBuffer } from "./audio";

/**
 * A roller shutter rattling up (or down): a fast run of slat clacks that slows as it goes, then a soft
 * metallic thunk as it hits the top (or the floor).
 */
export function playShutter(duration = 0.8) {
  const c = audio();
  if (!c || c.state !== "running") return; // no click or tap yet, so the browser won't allow sound
  try {
    const t0 = c.currentTime + 0.01;
    const noise = noiseBuffer(c);
    const out = c.createGain();
    out.gain.value = 0.55;
    const comp = c.createDynamicsCompressor();
    out.connect(comp).connect(c.destination);

    const clack = (at: number, peak: number, freq: number) => {
      const src = c.createBufferSource();
      src.buffer = noise;
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = freq;
      f.Q.value = 2.5;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
      src.connect(f).connect(g).connect(out);
      src.start(at, Math.random() * 0.9, 0.05);
    };

    // slats rolling over the drum: quick at first, easing off
    let t = 0;
    while (t < duration) {
      const p = t / duration;
      clack(t0 + t, 0.35 * (1 - p * 0.5), 1400 + Math.random() * 1600);
      t += 0.028 + p * p * 0.05 + Math.random() * 0.008;
    }
    // the stop: a dull thunk with a little ring
    const end = t0 + duration + 0.02;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(140, end);
    o.frequency.exponentialRampToValueAtTime(70, end + 0.18);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, end);
    g.gain.exponentialRampToValueAtTime(0.5, end + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end + 0.22);
    o.connect(g).connect(out);
    o.start(end);
    o.stop(end + 0.25);
    clack(end, 0.5, 900);
  } catch {
    // no sound is fine
  }
}
