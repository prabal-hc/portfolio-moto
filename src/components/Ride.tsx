"use client";

import { useRef, useState } from "react";
import { profile, ride } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playGlug } from "@/lib/glug";
import { Bike } from "./Bike";
import { Arrow } from "./Doodles";

const DIGITS = "0123456789";

/** The night sky: [left %, top %, size px, twinkle delay s]. */
const STARS: [number, number, number, number][] = [
  [22, 8, 9, 0], [34, 18, 6, 1.2], [44, 6, 7, 2.1], [14, 30, 6, 0.6], [52, 14, 5, 1.7],
  [28, 36, 5, 2.6], [6, 44, 7, 0.9], [40, 30, 9, 3.1], [60, 6, 6, 0.3], [88, 8, 7, 1.5],
];

/**
 * The finale: a petrol station at night at the end of the road. The bike rolls in and parks by an old pump,
 * the globe on top flickers on, and the pump's rolling display counts its way to my email. Lift the nozzle
 * to copy the address; the pump's grade buttons are LinkedIn and GitHub.
 */
export default function Ride() {
  const root = useRef<HTMLElement>(null);
  const display = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) return;
      const email = profile.email;
      const out = display.current!;
      // the rolling counter: every slot spins through digits until its letter locks in, left to right
      const roll = { p: 0 };
      const render = () => {
        const locked = Math.floor(roll.p * email.length);
        out.textContent = [...email].map((ch, i) => (i < locked ? ch : DIGITS[(Math.random() * 10) | 0])).join("");
      };
      out.textContent = "0".repeat(email.length);

      const tl = gsap.timeline({ scrollTrigger: { trigger: q(".station-scene")[0], start: "top 70%" } });
      tl.from(q(".station-title .line"), { yPercent: 100, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.12 }, 0)
        .from(q(".station-copy > p"), { opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0.3)
        .fromTo(q(".station-note .arrow path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15 }, 0.7)
        // the neon buzzes into life
        .fromTo(q(".neon"), { opacity: 0.15 }, { keyframes: { opacity: [0.15, 1, 0.3, 1, 0.15, 1] }, duration: 0.7, ease: "none" }, 0.6)
        // the bike rolls in and parks, wheels turning
        .from(q(".station-bike"), { x: () => -window.innerWidth * 0.7, duration: 1.6, ease: "power2.out" }, 0);
      root.current!.querySelectorAll<SVGGElement>(".station-bike .bike-wheel").forEach((w) => tl.from(w, { rotation: -720, svgOrigin: w.dataset.origin, duration: 1.6, ease: "power2.out" }, 0));
      // the globe stutters on, then the display rolls to the address and the buttons light
      tl.fromTo(q(".pump-globe, .lamp-light"), { opacity: 0.2 }, { keyframes: { opacity: [0.2, 1, 0.4, 1, 0.7, 1] }, duration: 0.5, ease: "none" }, 1.3)
        // parked: the headlight comes on, pointing at the pump
        .fromTo(q(".bike-beam"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.6)
        .to(roll, { p: 1, duration: 1.8, ease: "none", onUpdate: render, onComplete: () => void (out.textContent = email) }, 1.6)
        .from(q(".pump-btn"), { opacity: 0, y: 10, stagger: 0.12, duration: 0.4, ease: "back.out(2)" }, 2.2);
    },
    { scope: root },
  );

  /** Lift the nozzle: copy the email, a few glugs, and the display says so for a moment. */
  const fill = async () => {
    playGlug();
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // the clipboard can be blocked; the email is still right there on the display
    }
    setCopied(true);
    if (!prefersReducedMotion()) {
      gsap.fromTo(".pump-nozzle", { rotate: 0, y: 0 }, { keyframes: { rotate: [0, -28, -28, 0], y: [0, -26, -26, 0] }, duration: 1.4, ease: "power2.inOut" });
    }
    window.setTimeout(() => setCopied(false), 1800);
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

            <div className="station-bike" aria-hidden>
              <span className="bike-beam" />
              <Bike title="" />
            </div>

            <div className="pump">
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
              {/* the hose loops out of the side down to the nozzle on its hook */}
              <svg className="pump-hose" viewBox="0 0 120 300" fill="none" aria-hidden>
                <path d="M4 40 C70 40 110 90 104 170 C100 230 70 260 40 262" />
              </svg>
              <button className="pump-nozzle" type="button" onClick={fill} aria-label="Copy my email address">
                <svg viewBox="0 0 90 70" fill="none" aria-hidden>
                  <path d="M10 18 H52 L80 8 L84 18 L58 30 L52 30 L48 56 C47 62 36 62 35 56 L32 30 H10 Z" />
                  <path d="M38 30 C38 40 46 42 46 36" />
                </svg>
              </button>
              <span className={`pump-toast hand${copied ? " is-on" : ""}`} aria-live="polite">
                {copied ? "copied!" : ""}
              </span>
              <span className="pump-hint hand" aria-hidden>
                {ride.nozzle}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
