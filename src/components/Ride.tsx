"use client";

import { useRef, useState } from "react";
import { profile, ride } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playGlug } from "@/lib/glug";
import { smokeTrail } from "@/lib/smoke";
import { Bike } from "./Bike";
import { Arrow } from "./Doodles";

const DIGITS = "0123456789";

/** The night sky: [left %, top %, size px, twinkle delay s]. */
const STARS: [number, number, number, number][] = [
  [22, 8, 9, 0], [34, 18, 6, 1.2], [44, 6, 7, 2.1], [14, 30, 6, 0.6], [52, 14, 5, 1.7],
  [28, 36, 5, 2.6], [6, 44, 7, 0.9], [40, 30, 9, 3.1], [60, 6, 6, 0.3], [88, 8, 7, 1.5],
];

/** The nozzle drawing (viewBox 90 × 70): where its spout tip and the hose end of its handle are. */
const TIP = { x: 82, y: 13 };
const HANDLE = { x: 10, y: 24 };
/** The fuel filler on top of the bike's tank, in the bike drawing's units (viewBox 1000 × 560). */
const FILLER = { x: 598, y: 186 };
/** How far the nozzle turns to point its spout down into the tank. */
const POUR_ANGLE = -54;

/**
 * The finale: a petrol station at night at the end of the road. Scrolling rides the bike in to the pump; the
 * globe flickers on and the display counts its way to my email. Click the pump and the nozzle comes off its
 * hook, the hose following, and fills the bike's tank (and copies the email). The grade buttons are LinkedIn and GitHub.
 */
export default function Ride() {
  const root = useRef<HTMLElement>(null);
  const display = useRef<HTMLSpanElement>(null);
  const reach = useRef({ t: 0 }); // 0 = nozzle on its hook, 1 = in the tank
  const busy = useRef(false);
  const [copied, setCopied] = useState(false);

  /** Put the nozzle and the hose where they belong for the current reach (0..1), measured off the live layout. */
  const place = () => {
    const el = root.current;
    if (!el) return;
    const scene = el.querySelector<HTMLElement>(".station-scene")!;
    const pump = el.querySelector<HTMLElement>(".pump")!.getBoundingClientRect();
    const bike = el.querySelector<SVGSVGElement>(".station-bike .bike")!.getBoundingClientRect();
    const nozzle = el.querySelector<HTMLElement>(".pump-nozzle")!;
    const art = nozzle.querySelector("svg")!;
    const hose = el.querySelector<SVGPathElement>(".hose")!;
    const s = scene.getBoundingClientRect();
    const k = parseFloat(getComputedStyle(art).width) / 90; // px per nozzle-drawing unit
    const t = reach.current.t;

    // on the hook: hanging off the pump's side, handle against the pump, spout out
    const hook = { x: pump.right - s.left + (TIP.x - HANDLE.x) * k + 4, y: pump.top - s.top + pump.height * 0.64 };
    // in the tank: spout tip on the filler cap
    const tank = { x: bike.left - s.left + (bike.width * FILLER.x) / 1000, y: bike.top - s.top + (bike.height * FILLER.y) / 560 - 2 };
    // flown along an arc, lifted over the gap
    const lift = { x: (hook.x + tank.x) / 2, y: Math.min(hook.y, tank.y) - Math.abs(hook.x - tank.x) * 0.35 };
    const u = 1 - t;
    const tip = { x: u * u * hook.x + 2 * u * t * lift.x + t * t * tank.x, y: u * u * hook.y + 2 * u * t * lift.y + t * t * tank.y };
    // it turns over on the way (mirrored, so the spout faces the bike) and tips down to pour
    const smooth = (a: number, b: number) => gsap.utils.clamp(0, 1, (t - a) / (b - a)) ** 2 * (3 - 2 * gsap.utils.clamp(0, 1, (t - a) / (b - a)));
    const flip = 1 - 2 * smooth(0.2, 0.6);
    const angle = POUR_ANGLE * smooth(0.35, 1);
    nozzle.style.transform = `translate(${tip.x}px, ${tip.y}px) rotate(${angle}deg) scaleX(${flip})`;

    // the hose: from the pump's side to the back of the handle, sagging under its own weight
    const rad = (angle * Math.PI) / 180;
    const vx = (HANDLE.x - TIP.x) * k * flip;
    const vy = (HANDLE.y - TIP.y) * k;
    const end = { x: tip.x + vx * Math.cos(rad) - vy * Math.sin(rad), y: tip.y + vx * Math.sin(rad) + vy * Math.cos(rad) };
    const start = { x: pump.right - s.left - 3, y: pump.top - s.top + pump.height * 0.42 };
    const sag = Math.max(40, Math.hypot(end.x - start.x, end.y - start.y) * 0.45);
    hose.setAttribute(
      "d",
      `M${start.x} ${start.y} C${start.x + sag * 0.6} ${start.y + sag * 0.2} ${end.x + (end.x < start.x ? -1 : 1) * sag * 0.2} ${Math.max(start.y, end.y) + sag} ${end.x} ${end.y}`,
    );
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const el = root.current!;
      place();
      const ro = new ResizeObserver(() => place());
      ro.observe(el.querySelector(".station-scene")!);
      if (prefersReducedMotion()) return () => ro.disconnect();

      const email = profile.email;
      const out = display.current!;
      // the rolling counter: every slot spins through digits until its letter locks in, left to right
      const roll = { p: 0 };
      const render = () => {
        const locked = Math.floor(roll.p * email.length);
        out.textContent = [...email].map((ch, i) => (i < locked ? ch : DIGITS[(Math.random() * 10) | 0])).join("");
      };
      out.textContent = "0".repeat(email.length);

      // the bike rides in from the left with the scroll, smoke trailing, and parks at the pump
      const bike = q(".station-bike")[0] as HTMLElement;
      const trail = smokeTrail(bike, q(".station-smoke")[0] as HTMLElement);
      const ridein = gsap.timeline({
        scrollTrigger: { trigger: q(".station-scene")[0], start: "top bottom", end: "bottom 92%", scrub: 0.8, invalidateOnRefresh: true },
        onUpdate: () => {
          trail();
          if (reach.current.t > 0) place(); // keep the nozzle in the tank if it's mid-fill
        },
      });
      // starting just off the left edge of the screen
      const offscreen = () => -(bike.getBoundingClientRect().left - (gsap.getProperty(bike, "x") as number) + bike.offsetWidth + 40);
      ridein.fromTo(bike, { x: offscreen }, { x: 0, duration: 1, ease: "power1.out" }, 0);
      el.querySelectorAll<SVGGElement>(".station-bike .bike-wheel").forEach((w) =>
        ridein.fromTo(w, { rotation: -900, svgOrigin: w.dataset.origin }, { rotation: 0, svgOrigin: w.dataset.origin, duration: 1, ease: "power1.out" }, 0),
      );
      // parked: the headlight comes on, pointing at the pump
      ridein.fromTo(q(".bike-beam"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.92);

      const tl = gsap.timeline({ scrollTrigger: { trigger: q(".station-scene")[0], start: "top 70%" } });
      tl.from(q(".station-title .line"), { yPercent: 100, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.12 }, 0)
        .from(q(".station-copy > p"), { opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0.3)
        .fromTo(q(".station-note .arrow path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15 }, 0.7)
        // the neon buzzes into life
        .fromTo(q(".neon"), { opacity: 0.15 }, { keyframes: { opacity: [0.15, 1, 0.3, 1, 0.15, 1] }, duration: 0.7, ease: "none" }, 0.6)
        // the globe stutters on, then the display rolls to the address and the buttons light
        .fromTo(q(".pump-globe, .lamp-light"), { opacity: 0.2 }, { keyframes: { opacity: [0.2, 1, 0.4, 1, 0.7, 1] }, duration: 0.5, ease: "none" }, 0.9)
        .to(roll, { p: 1, duration: 1.8, ease: "none", onUpdate: render, onComplete: () => void (out.textContent = email) }, 1.2)
        .from(q(".pump-btn"), { opacity: 0, y: 10, stagger: 0.12, duration: 0.4, ease: "back.out(2)" }, 1.8);
      return () => ro.disconnect();
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // the clipboard can be blocked; the email is still right there on the display
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  };

  /** Fill her up: the nozzle flies over to the tank, the gauge fills (glug, glug), and back on the hook it goes. */
  const refuel = () => {
    if (busy.current) return;
    void copy();
    if (prefersReducedMotion()) {
      playGlug();
      return;
    }
    busy.current = true;
    const el = root.current!;
    const gauge = el.querySelector(".fuel-gauge");
    const full = el.querySelector(".fuel-full");
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(reach.current, { t: 1, duration: 1.1, ease: "power2.inOut", onUpdate: place })
      .fromTo(gauge, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.15")
      .call(playGlug)
      .fromTo(el.querySelector(".fuel-fill"), { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "none" }, "<")
      .call(playGlug, [], "<0.55")
      .call(playGlug, [], "<0.55")
      .fromTo(full, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, ">-0.1")
      .to(reach.current, { t: 0, duration: 1, ease: "power2.inOut", onUpdate: place }, "+=0.6")
      .to([gauge, full], { autoAlpha: 0, duration: 0.4 }, "<0.4");
  };

  return (
    <section className="ride" id="ride" ref={root} aria-label="Contact">
      <div className="ride-inner">
        <div className="station">
          <div className="station-copy">
            <h2 className="station-title">
              <span className="line">{ride.title[0]}</span>
              <span className="line accent">{ride.title[1]}</span>
            </h2>
            <p className="ride-text">{ride.body}</p>
            <p className="station-note hand" aria-hidden>
              <Arrow />
              {ride.note}
            </p>
          </div>

          <div className="station-scene">
            {/* the set: hills, the canopy on its posts, the lamp's cone of light, the road */}
            <svg className="station-set" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffe9c4" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#ffe9c4" stopOpacity="0.04" />
                </linearGradient>
                <radialGradient id="pool">
                  <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.32" />
                  <stop offset="0.6" stopColor="#e8501c" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#e8501c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path className="set-hills" d="M0 590 C70 560 120 572 170 550 C230 524 280 560 340 566 C400 572 430 538 480 540 C500 541 510 548 516 552" />
              <g className="lamp-light">
                <polygon points="668,142 712,142 880,680 500,680" fill="url(#cone)" />
                <ellipse cx="690" cy="686" rx="250" ry="40" fill="url(#pool)" />
              </g>
              <path className="set-line" d="M516 140 V680 M990 140 V680" />
              <rect className="set-roof" x="486" y="96" width="514" height="34" rx="4" />
              <rect className="set-trim" x="486" y="130" width="514" height="12" />
              <path className="set-line" d="M678 142 L684 154 H696 L702 142" />
              <path className="set-ground" d="M0 680 H1000" />
              <path className="set-lane" d="M0 722 H1000" />
            </svg>
            <span className="moon" aria-hidden />
            {STARS.map(([x, y, s, d], i) => (
              <span key={i} className="star" aria-hidden style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }} />
            ))}
            <span className="moth" aria-hidden />
            <span className="moth moth-2" aria-hidden />
            <span className="moth moth-3" aria-hidden />
            <span className="neon" aria-hidden>
              {ride.neon}
            </span>
            <div className="station-smoke" aria-hidden />

            <div className="station-bike" aria-hidden>
              <span className="bike-beam" />
              <Bike title="" />
              <div className="fuel-gauge">
                <span>Fuel</span>
                <span className="fuel-track">
                  <span className="fuel-fill" />
                </span>
                <span className="fuel-full hand">full!</span>
              </div>
            </div>

            {/* click anywhere on the pump (other than its links) to fill up */}
            <div className="pump" onClick={(e) => !(e.target as Element).closest("a") && refuel()}>
              <span className="pump-globe" aria-hidden>
                PH
              </span>
              <div className="pump-head">
                <span className="pump-brand" aria-hidden>
                  {ride.pump}
                </span>
                <a className="pump-display" href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}>
                  <span className="pump-display-label" aria-hidden>
                    {copied ? "copied ✓" : "e-mail"}
                  </span>
                  <span className="pump-display-value" ref={display}>
                    {profile.email}
                  </span>
                </a>
                <div className="pump-btns">
                  {profile.links.map((l) => (
                    <a key={l.label} className="pump-btn" href={l.href} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>
              <div className="pump-base" aria-hidden />
              <span className={`pump-toast hand${copied ? " is-on" : ""}`} aria-live="polite">
                {copied ? "email copied!" : ""}
              </span>
              <span className="pump-hint hand" aria-hidden>
                {ride.nozzle}
              </span>
            </div>

            {/* the hose and nozzle live over the whole scene, so they can reach the bike */}
            <svg className="hose-layer" aria-hidden>
              <path className="hose" />
            </svg>
            <button className="pump-nozzle" type="button" onClick={refuel} aria-label="Fill up the bike (copies my email address)">
              <svg viewBox="0 0 90 70" fill="none" aria-hidden>
                <path d="M10 18 H52 L80 8 L84 18 L58 30 L52 30 L48 56 C47 62 36 62 35 56 L32 30 H10 Z" />
                <path d="M38 30 C38 40 46 42 46 36" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
