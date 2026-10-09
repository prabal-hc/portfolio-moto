"use client";

import { useRef, useState } from "react";
import { profile, ride } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playGlug } from "@/lib/glug";
import { Bike } from "./Bike";
import { Arrow } from "./Doodles";
import Marquee from "./Marquee";

const DIGITS = "0123456789";

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
        // the bike rolls in and parks, wheels turning
        .from(q(".station-bike"), { x: () => -window.innerWidth * 0.7, duration: 1.6, ease: "power2.out" }, 0);
      root.current!.querySelectorAll<SVGGElement>(".station-bike .bike-wheel").forEach((w) => tl.from(w, { rotation: -720, svgOrigin: w.dataset.origin, duration: 1.6, ease: "power2.out" }, 0));
      // the globe stutters on, then the display rolls to the address and the buttons light
      tl.fromTo(q(".pump-globe"), { opacity: 0.2 }, { keyframes: { opacity: [0.2, 1, 0.4, 1, 0.7, 1] }, duration: 0.5, ease: "none" }, 1.3)
        .to(roll, { p: 1, duration: 1.8, ease: "none", onUpdate: render, onComplete: () => void (out.textContent = email) }, 1.6)
        .from(q(".pump-btn"), { opacity: 0, y: 10, stagger: 0.12, duration: 0.4, ease: "back.out(2)" }, 2.2)
        .fromTo(q(".station-note .arrow path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15 }, 2.4);
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
      <Marquee items={ride.marquee} tone="orange" />
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
            <div className="station-bike" aria-hidden>
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
            <span className="station-ground" aria-hidden />
          </div>
        </div>

      </div>
    </section>
  );
}
