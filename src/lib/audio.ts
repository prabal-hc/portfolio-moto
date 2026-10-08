"use client";

/** One AudioContext for every sound on the page, plus a shared second of white noise to cut bursts from. */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new Ctx();
    return ctx;
  } catch {
    return null;
  }
}

export function noiseBuffer(c: AudioContext) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/**
 * Browsers only allow a page to make sound after the visitor has clicked, tapped or pressed a key (scrolling
 * doesn't count), so wake the audio on the first of those. Sounds triggered by scrolling work from then on.
 */
export function unlockAudioOnFirstGesture() {
  if (typeof window === "undefined") return;
  const events = ["pointerdown", "keydown", "touchend"] as const;
  const unlock = () => {
    void audio()?.resume();
    events.forEach((e) => window.removeEventListener(e, unlock));
  };
  events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
}
