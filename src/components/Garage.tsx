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
 * it fills the screen; then the roller shutter rattles up and the projects slide past inside, one at a time, under the lamp.
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

      const cards = q(".garage-card") as HTMLElement[];
      const track = q(".garage-cards")[0] as HTMLElement;
      const count = q(".garage-count-now")[0];
      // how far the row has to slide to bring card k to the middle
      const offset = (k: number) => -(cards[k].offsetLeft - cards[0].offsetLeft);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: `+=${260 + cards.length * 90}%`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
        onUpdate: () => {
          // which project is in the middle right now, for the 01 / 04 counter
          const x = gsap.getProperty(track, "x") as number;
          const k = cards.reduce((best, _, i) => (Math.abs(offset(i) - x) < Math.abs(offset(best) - x) ? i : best), 0);
          if (count) count.textContent = String(k + 1).padStart(2, "0");
        },
      });
      // 1. walk up to the door: the whole garage front grows until the door fills the screen
      tl.fromTo(q(".garage-scene"), { scale: 0.5 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(q(".garage-note"), { opacity: 0, duration: 0.3 }, 0.1)
        // 2. the shutter rattles up (and back down, scrolling the other way)
        .call(rattle, [], 1.05)
        .to(q(".shutter"), { yPercent: -100, duration: 0.8, ease: "power2.inOut" }, 1.05)
        // 3. the first project rolls in from the right
        .fromTo(track, { x: () => window.innerWidth * 0.6, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 1.5)
        .from(q(".garage-count"), { opacity: 0, duration: 0.3 }, 1.7);
      // 4. then the row slides left, stopping on each project in turn
      for (let k = 1; k < cards.length; k++) {
        tl.to({}, { duration: 0.35 }).to(track, { x: () => offset(k), duration: 0.8, ease: "power2.inOut" });
      }
      tl.to({}, { duration: 0.5 }); // a beat on the last one before the page moves on
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
          <div className="garage-inside">
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
            <p className="garage-count" aria-hidden>
              <span className="garage-count-now">01</span> / {String(garage.items.length).padStart(2, "0")}
            </p>
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
