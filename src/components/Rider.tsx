"use client";

import { useRef, type ReactNode } from "react";
import { rider } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { smokeTrail } from "@/lib/smoke";
import { unlockAudioOnFirstGesture } from "@/lib/audio";
import { playCrash } from "@/lib/crashSound";
import { buildWall, WALL } from "@/lib/stoneWall";
import { Bike } from "./Bike";

type ChipKey = keyof typeof rider.chips;

/** Small line-drawn logos for the stickers, in the same pen as the rest of the page. */
const ICONS: Record<string, ReactNode> = {
  react: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4">
      <ellipse cx="20" cy="20" rx="17" ry="6.5" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(-60 20 20)" />
      <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="17" />
      <path d="M14 27 V13 L27 29 M26 13 V22" />
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="34" height="34" rx="6" />
      <path d="M9 18 H19 M14 18 V31 M31 19 C29 17 24 17 24 20.5 C24 24 31 23 31 27 C31 31 26 31 23.5 29" />
    </svg>
  ),
};

function Chip({ k }: { k: ChipKey }) {
  const c: { label: string; icon?: string; tone?: string; tilt: number } = rider.chips[k];
  return (
    <span aria-hidden className={`chip${c.tone ? ` chip-${c.tone}` : ""}`} style={{ ["--tilt" as string]: `${c.tilt}deg` }}>
      {c.icon && <span className="chip-icon">{ICONS[c.icon]}</span>}
      {c.label}
    </span>
  );
}

/**
 * The statement, word by word: {key} becomes a sticker chip, *starred* runs become serif italics, and
 * "word\u00a0{key}" keeps that word and its sticker on one line.
 */
function Statement({ text }: { text: string }) {
  const parts = text.split(/(\S+\u00a0\{\w+\}|\{\w+\}|\*[^*]+\*)/g).filter(Boolean);
  return (
    <p className="rider-statement" aria-label={text.replace(/\{(\w+)\}/g, (_, k: ChipKey) => rider.chips[k].label).replace(/\*/g, "")}>
      {parts.map((part, pi) => {
        if (part.startsWith("{")) return <Chip key={pi} k={part.slice(1, -1) as ChipKey} />;
        const accent = part.startsWith("*");
        const raw = accent ? part.slice(1, -1) : part;
        return raw.split(/(\s+)/).map((w, wi) =>
          /^\s+$/.test(w) || !w ? (
            w
          ) : (
            <span key={`${pi}-${wi}`} className={`w${accent ? " accent" : ""}`} aria-hidden>
              {w}
            </span>
          ),
        );
      })}
    </p>
  );
}

const STONES = buildWall(rider.wall, rider.hot);

/** The wall: a hand-drawn rubble-stone wall, the tech I use written on its biggest stones. Every stone is its own piece. */
function Wall() {
  return (
    <div className="wall" aria-hidden>
      <svg viewBox={`0 0 ${WALL.w} ${WALL.h}`} overflow="visible">
        {STONES.map((st, i) => (
          <g key={i} className={`stone${st.hot ? " stone-hot" : ""}`}>
            <path d={st.d} />
            {st.label && (
              <text x={st.cx.toFixed(1)} y={(st.cy + st.size! * 0.32).toFixed(1)} fontSize={st.size!.toFixed(1)} textAnchor="middle">
                {st.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * The rider: the bike that left the cover rides in from the left and crashes into a stone wall of the tech I use. The
 * stones fly everywhere, and out of the mess the statement assembles itself, word by word. All scrubbed by the
 * scroll while the section holds still.
 */
export default function Rider() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      unlockAudioOnFirstGesture();
      if (prefersReducedMotion()) {
        gsap.set(q(".rider-scene"), { display: "none" });
        return;
      }
      const bike = q(".rider-bike")[0] as HTMLElement;
      const wall = q(".wall")[0] as HTMLElement;
      const bw = () => bike.offsetWidth;
      // where the front tyre (~89% of the drawing's width) meets the wall
      const impactX = () => wall.offsetLeft - bike.offsetLeft - bw() * 0.89;
      const { random } = gsap.utils;
      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=300%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
        onUpdate: smokeTrail(bike, q(".rider-smoke")[0] as HTMLElement),
      });

      // 1. ride in from off-screen left, wheels turning
      tl.fromTo(bike, { x: () => -bike.offsetLeft - bw() - 40 }, { x: impactX, duration: 1, ease: "power1.in" }, 0);
      const wheels = el.querySelectorAll<SVGGElement>(".rider-bike .bike-wheel");
      wheels.forEach((w) => tl.to(w, { rotation: 900, svgOrigin: w.dataset.origin, duration: 1, ease: "power1.in" }, 0));

      // 2. impact (with sound, only when riding forward into it): the scene shakes, the bike bucks up off its front wheel and bounces back, "crash!"
      tl.call(() => void (tl.scrollTrigger?.direction === 1 && playCrash()), [], 1);
      tl.to(q(".rider-scene"), { keyframes: { x: [0, -16, 13, -9, 5, 0] }, duration: 0.3, ease: "none" }, 1)
        .to(bike, { x: () => impactX() - bw() * 0.14, rotation: 9, transformOrigin: "89% 96%", duration: 0.22, ease: "power2.out" }, 1)
        .to(bike, { rotation: 0, duration: 0.25, ease: "bounce.out" }, 1.22)
        .fromTo(q(".rider-boom"), { opacity: 0, scale: 0.4, rotate: -20 }, { opacity: 1, scale: 1, rotate: -8, duration: 0.18, ease: "back.out(3)" }, 1)
        .to(q(".rider-boom"), { opacity: 0, y: -30, duration: 0.3 }, 1.55);

      // 2b. and the bike is wrecked (it stays on the road like that). Moves here are in the bike drawing's units.
      tl.set(q(".bike-damage"), { opacity: 1 }, 1)
        // sparks off the front
        .fromTo(q(".bike-sparks"), { opacity: 0, scale: 0.5, svgOrigin: "900 300" }, { opacity: 1, scale: 1.3, duration: 0.1 }, 1)
        .to(q(".bike-sparks"), { opacity: 0, duration: 0.2 }, 1.12)
        // the front wheel buckles and the mudguard gets knocked crooked
        .to(wheels[1], { scaleX: 0.8, scaleY: 1.04, svgOrigin: wheels[1].dataset.origin, duration: 0.15, ease: "power3.out" }, 1)
        .to(q(".bike-fender"), { rotation: 24, svgOrigin: "672 338", duration: 0.18, ease: "back.out(3)" }, 1)
        // the headlamp snaps off, flies forward, drops, bounces and rolls away along the road
        .to(q(".bike-lamp"), { x: 150, rotation: 300, svgOrigin: "752 198", duration: 0.6, ease: "power1.out" }, 1.02)
        .to(q(".bike-lamp"), { y: -90, duration: 0.2, ease: "power2.out" }, 1.02)
        .to(q(".bike-lamp"), { y: 308, duration: 0.34, ease: "power2.in" }, 1.22)
        .to(q(".bike-lamp"), { keyframes: { y: [308, 282, 308] }, duration: 0.16, ease: "none" }, 1.56)
        .to(q(".bike-lamp"), { x: 230, rotation: 420, duration: 0.4, ease: "power2.out" }, 1.62)
        // the mirror snaps at its stalk and drops behind
        .to(q(".bike-mirror"), { rotation: 75, svgOrigin: "676 158", duration: 0.1, ease: "power2.out" }, 1)
        .to(q(".bike-mirror"), { x: -50, y: 312, rotation: 230, duration: 0.4, ease: "power2.in" }, 1.12)
        // and smoke keeps curling up out of the engine
        .set(q(".bike-wisp"), { transformOrigin: "50% 50%" }, 1);
      q(".bike-wisp").forEach((w, i) =>
        tl.to(w, { keyframes: { opacity: [0, 0.8, 0], y: [0, -70, -140], x: [0, -12, -34], scale: [0.5, 1.2, 1.9] }, duration: 0.7, repeat: 2, ease: "none" }, 1.25 + i * 0.17),
      );

      // 3. the stones fly: up and away in arcs, the ones nearest the bike first, tumbling as they go
      const unit = () => wall.getBoundingClientRect().width / WALL.w || 1; // px per wall unit (stones move in SVG units)
      gsap.set(q(".stone"), { transformOrigin: "50% 50%" });
      q(".stone").forEach((b) => {
        const r = b.getBoundingClientRect();
        const w = wall.getBoundingClientRect();
        const near = (r.left - w.left) / Math.max(w.width, 1); // 0 = the face the bike hits
        const at = 1 + near * 0.12 + random(0, 0.05);
        const up = random(0.25, 0.75);
        tl.to(b, { x: () => (random(-0.15, 0.75) * vw()) / unit(), rotation: random(-300, 300), duration: 0.9, ease: "power1.out" }, at)
          .to(b, { y: () => (-up * vh()) / unit(), duration: 0.38, ease: "power2.out" }, at)
          .to(b, { y: () => ((1 - up) * vh()) / unit(), duration: 0.52, ease: "power2.in" }, at + 0.38)
          .to(b, { opacity: 0, duration: 0.3 }, at + 0.6);
      });

      // 4. out of the mess, the statement: each word flies in from somewhere and drops into place
      q(".rider-statement .w, .rider-statement .chip").forEach((node, i) => {
        const chip = (node as HTMLElement).classList.contains("chip");
        tl.fromTo(
          node,
          { x: () => random(-0.45, 0.45) * vw(), y: () => random(-0.4, 0.4) * vh(), rotation: random(-120, 120), opacity: 0, scale: chip ? 0.3 : 1 },
          { x: 0, y: 0, rotation: chip ? () => (node as HTMLElement).style.getPropertyValue("--tilt") : 0, opacity: 1, scale: 1, duration: 0.7, ease: chip ? "back.out(1.6)" : "power3.out" },
          1.5 + i * 0.035,
        );
      });
      tl.to({}, { duration: 0.4 }); // a beat to read it before the page moves on
    },
    { scope: root },
  );

  return (
    <section className="rider" id="rider" ref={root} aria-label="About">
      <div className="rider-scene" aria-hidden>
        <div className="rider-road" />
        <Wall />
        <div className="rider-smoke" />
        <div className="rider-bike">
          <Bike title="" damage />
        </div>
        <span className="rider-boom hand">{rider.boom}</span>
      </div>
      <Statement text={rider.statement} />
    </section>
  );
}
