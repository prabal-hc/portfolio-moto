"use client";

import { useRef } from "react";
import { cover } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Bike } from "./Bike";
import { Arrow } from "./Doodles";
import { ENGINE, playEngineStart } from "@/lib/engineSound";
import { smokeTrail } from "@/lib/smoke";

/** Where the exhaust puffs come out, in the bike drawing's own units (the silencer tip, at the back). */
const PUFFS = [
  { x: 280, y: 446, r: 16 },
  { x: 236, y: 432, r: 22 },
  { x: 186, y: 416, r: 28 },
];

/**
 * The cover: one statement set big and loose, the bike underneath as the thing to play with. Click it and it
 * starts up: a shudder, spinning wheels, puffs from the exhaust. Scroll on and the page holds while it rides off.
 */
export default function Cover() {
  const root = useRef<HTMLElement>(null);
  const revving = useRef(false);

  useGSAP(
    () => {
      const el = root.current!;
      const strokes = el.querySelectorAll<SVGElement>(".bike .ink:not(.dashed)");
      if (prefersReducedMotion()) {
        gsap.set(strokes, { strokeDashoffset: 0 });
        return;
      }
      // entrance: each line of the statement drops into its tilted place, then the bike draws itself
      gsap
        .timeline({ delay: 0.15 })
        .from(".cover-intro", { opacity: 0, y: 12, duration: 0.8, ease: "power3.out" })
        .from(".cover-line", { yPercent: 60, opacity: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 0.1)
        .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.01 }, 0.5)
        .from(".cover .bike .tank, .cover .bike .tail", { fillOpacity: 0, duration: 0.8 }, "-=0.5")
        .fromTo(".cover-cue .arrow path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.15 }, "-=0.2")
        .from(".cover-cue-text", { opacity: 0, rotate: -10, duration: 0.6, ease: "back.out(2)" }, "<");

      // on the way down the cover holds still while the bike rides right off the screen, smoke trailing behind
      const bike = el.querySelector<HTMLElement>(".cover-bike")!;
      const smoke = el.querySelector<HTMLElement>(".cover-smoke")!;
      const restLeft = () => bike.getBoundingClientRect().left - (gsap.getProperty(bike, "x") as number);
      const ride = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=110%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
        onUpdate: smokeTrail(bike, smoke),
      });
      ride
        .to(bike, { x: () => window.innerWidth - restLeft() + 40, ease: "power1.in" }, 0)
        .to(".cover-cue", { opacity: 0, duration: 0.12, ease: "none" }, 0);
      el.querySelectorAll<SVGGElement>(".bike-wheel").forEach((w) => ride.to(w, { rotation: 1080, svgOrigin: w.dataset.origin, ease: "power1.in" }, 0));
    },
    { scope: root },
  );

  /** Start the engine: the sound, plus a shudder, spinning wheels, puffs of exhaust and a handwritten "vroom!". */
  const rev = () => {
    if (revving.current || !root.current) return;
    revving.current = true;
    // the sound first, while the browser still counts this as the click (it only allows audio then)
    playEngineStart();
    if (prefersReducedMotion()) {
      window.setTimeout(() => void (revving.current = false), ENGINE.end * 1000);
      return;
    }
    const el = root.current;
    const q = gsap.utils.selector(el); // keep every selector inside the cover
    const bike = q(".cover-bike .bike");
    const shake = (from: number, to: number, px: number) =>
      tl.to(bike, { x: `random(-${px}, ${px})`, y: `random(-${px * 0.6}, ${px * 0.6})`, rotate: `random(-${px * 0.12}, ${px * 0.12})`, duration: 0.045, repeat: Math.round((to - from) / 0.045), yoyo: true, ease: "none" }, from);
    const puff = (p: Element, at: number, i: number) =>
      tl.fromTo(p, { scale: 0.2, opacity: 0.9, x: 0, y: 0, transformOrigin: "50% 50%" }, { scale: 1.6, opacity: 0, x: -60 - i * 30, y: -20 - i * 8, duration: 0.9, ease: "power2.out" }, at);
    const tl = gsap.timeline({ onComplete: () => void (revving.current = false) });

    // timed to the sound: crank → it catches → throttle blip → idle → off
    shake(0, ENGINE.crankEnd, 1.5); // starter turning it over
    shake(ENGINE.crankEnd, ENGINE.crankEnd + 0.3, 5); // it catches with a shudder
    shake(ENGINE.revStart, ENGINE.idleFrom, 3.5); // the blip
    shake(ENGINE.idleFrom, ENGINE.fadeFrom + 0.3, 1.2); // idling
    tl.set(bike, { x: 0, y: 0, rotate: 0 }, ENGINE.end);
    el.querySelectorAll<SVGGElement>(".bike-wheel").forEach((w) =>
      tl.to(w, { rotation: "+=540", svgOrigin: w.dataset.origin, duration: ENGINE.idleFrom - ENGINE.revStart + 0.3, ease: "power2.inOut" }, ENGINE.revStart),
    );
    const puffs = el.querySelectorAll<SVGCircleElement>(".puff");
    puffs.forEach((p, i) => puff(p, ENGINE.crankEnd + 0.05 + i * 0.1, i)); // first breaths as it catches
    puffs.forEach((p, i) => puff(p, ENGINE.revStart + 0.05 + i * 0.12, i)); // and again on the blip
    tl.fromTo(q(".cover-vroom"), { opacity: 0, y: 0, scale: 0.6, rotate: -12 }, { opacity: 1, scale: 1, rotate: -6, duration: 0.35, ease: "back.out(3)" }, ENGINE.revStart).to(
      q(".cover-vroom"),
      { opacity: 0, y: -16, duration: 0.5 },
      ENGINE.idleFrom + 0.2,
    );
  };

  const [l1, l2, l3] = cover.headline;
  const lastSpace = l3.lastIndexOf(" ");
  return (
    <section className="cover" id="top" ref={root} aria-label="Intro">
      <p className="cover-intro">{cover.intro}</p>

      <h1 className="cover-head" aria-label={cover.headline.join(" ")}>
        <span className="cover-line l1" aria-hidden>
          {l1}
        </span>
        <span className="cover-line l2" aria-hidden>
          {l2}
        </span>
        <span className="cover-line l3" aria-hidden>
          {l3.slice(0, lastSpace)} <span className="accent">{l3.slice(lastSpace + 1)}</span>
          <span className="accent">.</span>
        </span>
      </h1>

      <div className="cover-smoke" aria-hidden />
      <div className="cover-stage">
        <button className="cover-bike" type="button" onClick={rev} aria-label="Start the engine">
          <Bike />
          <svg className="puffs" viewBox="0 0 1000 560" aria-hidden>
            {PUFFS.map((p, i) => (
              <circle key={i} className="puff" cx={p.x} cy={p.y} r={p.r} />
            ))}
          </svg>
          <span className="cover-vroom hand" aria-hidden>
            {cover.vroom}
          </span>
        </button>
        <p className="cover-cue" aria-hidden>
          <Arrow flip />
          <span className="cover-cue-text hand">{cover.cue}</span>
        </p>
      </div>
    </section>
  );
}
