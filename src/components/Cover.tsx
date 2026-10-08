"use client";

import { useEffect, useRef, useState } from "react";
import { cover, profile } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Bike } from "./Bike";
import { Arrow } from "./Doodles";

/** "Frontend developer who …" with the last words swapping every couple of seconds. */
function Rotating() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % cover.rotating.length), 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="rotating" aria-live="polite">
      {/* keyed, so each new phrase mounts and plays its rise-in animation */}
      <span key={i} className="rotating-word">
        {cover.rotating[i]}
      </span>
    </span>
  );
}

/**
 * The cover of the issue: the name set huge, the bike drawing itself in ink, and as you scroll on, the bike
 * riding off to the right with its wheels turning.
 */
export default function Cover() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const strokes = el.querySelectorAll<SVGElement>(".bike .ink:not(.dashed)");
      if (prefersReducedMotion()) {
        gsap.set(strokes, { strokeDashoffset: 0 });
        return;
      }

      // the entrance: name rises, the bike draws itself, the tank floods with colour
      gsap
        .timeline({ delay: 0.15 })
        .from(".cover-name .ch", { yPercent: 115, duration: 1.15, ease: "expo.out", stagger: 0.035 })
        .from(".cover-meta > *", { opacity: 0, y: 12, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.25)
        .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.7, ease: "power2.inOut", stagger: 0.012 }, 0.35)
        .from(".cover .bike .tank, .cover .bike .tail", { fillOpacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.5")
        .from(".cover-lead, .cover-cue", { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.12 }, "-=1.3")
        .fromTo(".cover-note .arrow path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out", stagger: 0.15 }, "-=0.4")
        .from(".cover-note-text", { opacity: 0, rotate: -8, duration: 0.6, ease: "back.out(2)" }, "<");

      // on the way down: the bike rides off to the right, wheels turning; the name lifts away slower
      const ride = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 } });
      ride.to(".cover-bike", { xPercent: 55, ease: "none" }, 0);
      el.querySelectorAll<SVGGElement>(".bike-wheel").forEach((w) => ride.to(w, { rotation: 720, svgOrigin: w.dataset.origin, ease: "none" }, 0));
      ride.to(".cover-name", { yPercent: -18, ease: "none" }, 0).to(".cover-note", { opacity: 0, ease: "none" }, 0);
    },
    { scope: root },
  );

  const [first, last] = profile.name.toUpperCase().split(" ");
  const letters = (w: string) => [...w].map((c, i) => (
    <span key={i} className="ch">
      {c}
    </span>
  ));

  return (
    <section className="cover" id="top" ref={root} aria-label="Cover">
      <div className="cover-meta">
        <span>{cover.issue}</span>
        <span>{cover.edition}</span>
        <span>{cover.place}</span>
      </div>

      <h1 className="cover-name" aria-label={profile.name}>
        <span className="cover-line" aria-hidden>
          {letters(first)}
        </span>
        <span className="cover-line" aria-hidden>
          {letters(last)}
          <span className="ch stop">.</span>
        </span>
      </h1>

      <div className="cover-bike">
        <Bike />
        <div className="cover-note" aria-hidden>
          <span className="cover-note-text hand">{cover.note}</span>
          <Arrow />
        </div>
      </div>

      <p className="cover-lead">
        {cover.lead} <Rotating />
      </p>
      <p className="cover-cue">
        <span className="cue-line" aria-hidden />
        Scroll to ride
      </p>
    </section>
  );
}
