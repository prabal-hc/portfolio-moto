"use client";

import { audio, noiseBuffer } from "./audio";

/**
 * A bike hitting a stone wall, synthesised: a heavy thud, a crunch of breaking stone, a short metallic clang
 * from the bike, then stones clattering down for about a second.
 */
function synth(c: AudioContext) {
  const t0 = c.currentTime + 0.01;
  const noise = noiseBuffer(c);
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  const out = c.createGain();
  out.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 8;
  out.connect(comp).connect(c.destination);

  const env = (g: GainNode, at: number, peak: number, decay: number) => {
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  };
  const burst = (at: number, len: number, type: BiquadFilterType, freq: number, peak: number, sweepTo?: number) => {
    const src = c.createBufferSource();
    src.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, at);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + len);
    const g = c.createGain();
    env(g, at, peak, len);
    src.connect(f).connect(g).connect(out);
    src.start(at, rnd(0, 0.8), len + 0.05);
  };
  const tone = (at: number, from: number, to: number, len: number, peak: number, type: OscillatorType = "sine") => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + len);
    const g = c.createGain();
    env(g, at, peak, len);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + len + 0.05);
  };

  // the hit: a body thud and the crack of stone giving way
  tone(t0, 95, 32, 0.4, 1);
  burst(t0, 0.09, "bandpass", 2600, 0.7);
  burst(t0, 0.55, "lowpass", 2200, 0.85, 300);
  // the bike: a short inharmonic clang
  [510, 1230, 1880].forEach((f, i) => tone(t0 + 0.005, f, f * 0.98, 0.35 - i * 0.08, 0.12 - i * 0.03, "triangle"));
  // stones coming down: little knocks and scrapes, thinning out
  for (let i = 0; i < 16; i++) {
    const at = t0 + 0.12 + Math.pow(Math.random(), 1.4) * 1.1;
    const fade = 1 - (at - t0) / 1.4;
    burst(at, rnd(0.03, 0.07), "bandpass", rnd(700, 2600), 0.35 * fade);
    if (Math.random() < 0.5) tone(at, rnd(150, 260), rnd(80, 120), 0.08, 0.3 * fade);
  }
}

let last = 0;

/** Play the crash (at most once every 0.8s, so jiggling the scroll around the impact doesn't machine-gun it). */
export function playCrash() {
  const now = performance.now();
  if (now - last < 800) return;
  last = now;
  const c = audio();
  if (!c || c.state !== "running") return; // no click or tap yet, so the browser won't allow sound
  try {
    synth(c);
  } catch {
    // no sound is fine
  }
}
