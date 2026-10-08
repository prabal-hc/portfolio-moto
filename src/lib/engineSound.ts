"use client";

/**
 * A single-cylinder motorcycle starting up, synthesised with the Web Audio API (no audio file needed):
 * starter-motor whirr → the engine catches → a throttle blip → a lazy idle thump → fade out.
 *
 * Only ever called from a click, which is what browsers require before they allow sound.
 */

/** Timeline of the sound, in seconds from the click (the cover animation is timed to match). */
export const ENGINE = { crankEnd: 0.55, revStart: 1.0, revPeak: 1.32, idleFrom: 1.8, fadeFrom: 2.6, end: 3.3 };

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

/** Firing pulses per second at time t: a single cylinder at idle fires ~13 times a second. */
function rate(t: number) {
  const { crankEnd, revStart, revPeak, idleFrom } = ENGINE;
  if (t < crankEnd + 0.3) return 6 + ((t - crankEnd) / 0.3) * 6; // catching
  if (t < revStart) return 12;
  if (t < revPeak) return 12 + ((t - revStart) / (revPeak - revStart)) * 26; // throttle opens
  if (t < idleFrom) return 38 - ((t - revPeak) / (idleFrom - revPeak)) * 25; // and drops back
  return 13;
}

/** How hard each pulse hits at time t. */
function loudness(t: number) {
  const { revStart, idleFrom, fadeFrom, end } = ENGINE;
  if (t > fadeFrom) return 0.55 * Math.max(0, 1 - (t - fadeFrom) / (end - fadeFrom));
  if (t > revStart && t < idleFrom) return 0.85;
  return 0.6;
}

function synth(c: AudioContext) {
  const t0 = c.currentTime + 0.03;
  const { crankEnd, end } = ENGINE;

  // everything goes through a compressor so overlapping pulses never clip
  const out = c.createGain();
  out.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 6;
  out.connect(comp).connect(c.destination);

  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  // 1. starter motor: a buzzy whirr with a fast tremolo
  const starter = c.createOscillator();
  starter.type = "sawtooth";
  starter.frequency.setValueAtTime(130, t0);
  starter.frequency.linearRampToValueAtTime(175, t0 + crankEnd);
  const trem = c.createOscillator();
  trem.frequency.value = 24;
  const tremDepth = c.createGain();
  tremDepth.gain.value = 0.07;
  const starterGain = c.createGain();
  starterGain.gain.setValueAtTime(0.0001, t0);
  starterGain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.06);
  starterGain.gain.setValueAtTime(0.14, t0 + crankEnd - 0.08);
  starterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + crankEnd + 0.05);
  trem.connect(tremDepth).connect(starterGain.gain);
  const starterTone = c.createBiquadFilter();
  starterTone.type = "bandpass";
  starterTone.frequency.value = 900;
  starterTone.Q.value = 0.9;
  starter.connect(starterTone).connect(starterGain).connect(out);
  starter.start(t0);
  trem.start(t0);
  starter.stop(t0 + crankEnd + 0.1);
  trem.stop(t0 + crankEnd + 0.1);

  // 2. a low exhaust rumble under the firing pulses, following the revs
  const rumble = c.createOscillator();
  rumble.type = "sawtooth";
  const rumbleTone = c.createBiquadFilter();
  rumbleTone.type = "lowpass";
  rumbleTone.frequency.value = 160;
  const rumbleGain = c.createGain();
  rumbleGain.gain.setValueAtTime(0.0001, t0 + crankEnd);
  rumbleGain.gain.exponentialRampToValueAtTime(0.09, t0 + crankEnd + 0.2);
  rumbleGain.gain.setValueAtTime(0.09, t0 + ENGINE.fadeFrom);
  rumbleGain.gain.exponentialRampToValueAtTime(0.0001, t0 + end);
  rumble.connect(rumbleTone).connect(rumbleGain).connect(out);

  // 3. the firing pulses: each one a low thump plus a short exhaust crack
  let t = crankEnd;
  while (t < end) {
    const r = rate(t);
    rumble.frequency.setValueAtTime(r * 3.2, t0 + t);
    const a = loudness(t) * (0.85 + Math.random() * 0.3);
    if (a > 0.01) {
      const at = t0 + t;
      const thump = c.createOscillator();
      thump.frequency.setValueAtTime(70 + r * 1.6, at);
      thump.frequency.exponentialRampToValueAtTime(42, at + 0.08);
      const tg = c.createGain();
      tg.gain.setValueAtTime(0.0001, at);
      tg.gain.exponentialRampToValueAtTime(a, at + 0.004);
      tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      thump.connect(tg).connect(out);
      thump.start(at);
      thump.stop(at + 0.1);

      const crack = c.createBufferSource();
      crack.buffer = noise;
      const ct = c.createBiquadFilter();
      ct.type = "lowpass";
      ct.frequency.value = 700 + r * 30;
      const cg = c.createGain();
      cg.gain.setValueAtTime(0.0001, at);
      cg.gain.exponentialRampToValueAtTime(a * 0.55, at + 0.003);
      cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
      crack.connect(ct).connect(cg).connect(out);
      crack.start(at, Math.random() * 0.9, 0.06);
    }
    // the tiny irregularity is what makes it sound mechanical rather than electronic
    t += (1 / r) * (1 + (Math.random() - 0.5) * 0.12);
  }
  rumble.start(t0 + crankEnd);
  rumble.stop(t0 + end + 0.05);
}

/**
 * Start the engine (sound only). Call it synchronously inside the click handler: the browser only lets a page
 * start audio while it is handling the click. Each click plays it once.
 */
export function playEngineStart() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new Ctx();
    const c = ctx;
    if (c.state === "suspended") void c.resume().then(() => synth(c));
    else synth(c);
  } catch {
    // no sound is fine; the animation still plays
  }
}
