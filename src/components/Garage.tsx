"use client";

import { useRef } from "react";
import { garage } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playShutter } from "@/lib/shutterSound";
import { Arrow } from "./Doodles";

/** Each project card rests at its own slight angle inside the garage. */
const TILT = [-1.6, 1.2, 1.4, -1.1];

/**
 * The work, behind one big garage door. The section holds still while the scroll zooms in on the door until
 * it fills the screen; then the roller shutter rattles up and the projects are there inside, under the lamp.
 */
export default function Garage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) {
        gsap.set(q(".shutter"), { display: "none" });
        return;
      }
      let lastSound = 0;
      const rattle = () => {
        if (performance.now() - lastSound < 1000) return;
        lastSound = performance.now();
        playShutter(0.8);
      };

      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=260%", pin: true, scrub: 0.6 } });
      // 1. walk up to the door: the whole garage front grows until the door fills the screen
      tl.fromTo(q(".garage-scene"), { scale: 0.5 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(q(".garage-note"), { opacity: 0, duration: 0.3 }, 0.1)
        // 2. the shutter rattles up (and back down, scrolling the other way)
        .call(rattle, [], 1.05)
        .to(q(".shutter"), { yPercent: -100, duration: 0.8, ease: "power2.inOut" }, 1.05)
        // 3. the projects roll forward into the light
        .from(q(".garage-card"), { y: 60, opacity: 0, rotate: 0, stagger: 0.12, duration: 0.5, ease: "power3.out" }, 1.55)
        .to({}, { duration: 0.6 }); // a beat to look around before the page moves on
    },
    { scope: root },
  );

  return (
    <section className="garage" id="garage" ref={root} aria-label="Work">
      <div className="garage-scene">
        {/* the building front around the door, with the shop sign hanging over it */}
        <div className="garage-building" aria-hidden>
          <div className="garage-sign">
            <span className="garage-sign-chain" />
            <span className="garage-sign-text">{garage.title}</span>
          </div>
        </div>
        <p className="garage-note hand" aria-hidden>
          {garage.note}
          <Arrow />
        </p>

        <div className="garage-door">
          <div className="garage-inside" data-lenis-prevent>
            <h2 className="sr-only">{garage.title}</h2>
            <ol className="garage-cards">
              {garage.items.map((p, i) => {
                const no = String(i + 1).padStart(2, "0");
                const inner = (
                  <>
                    <span className="garage-card-top">
                      <span>Bay {no}</span>
                      <span className="plate">KA · 01 · PH · {no}</span>
                    </span>
                    <h3 className="garage-name">{p.name}</h3>
                    <p className="garage-tag">{p.tag}</p>
                    <p className="garage-blurb">{p.blurb}</p>
                    <span className="garage-go">{p.href ? "Visit the site ↗" : "Private build"}</span>
                  </>
                );
                return (
                  <li key={p.name} className="garage-card" style={{ ["--tilt" as string]: `${TILT[i % TILT.length]}deg` }}>
                    {p.href ? (
                      <a className="garage-card-in" href={p.href} target="_blank" rel="noreferrer">
                        {inner}
                      </a>
                    ) : (
                      <div className="garage-card-in is-private">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="shutter" aria-hidden>
            <span className="shutter-handle" />
          </div>
          <span className="shutter-drum" aria-hidden />
        </div>
        <span className="garage-floor" aria-hidden />
      </div>
    </section>
  );
}
