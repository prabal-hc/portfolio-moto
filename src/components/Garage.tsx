"use client";

import { useRef } from "react";
import { garage } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playShutter } from "@/lib/shutterSound";
import { Arrow } from "./Doodles";

/** The orange shape on each project's "screen", so no two cars look the same. */
const SHAPES = ["sun", "stripe", "arch", "dot"] as const;

const host = (href?: string) => (href ? new URL(href).hostname.replace(/^www\./, "") : "private build");

/**
 * The work, behind one big garage door. The section holds still while the scroll zooms in on the door until it
 * fills the screen; then the shutter rattles up on a showroom, like a racing game's car select: one project at a
 * time on the turntable under the spotlight, the others waiting in the dark on either side. Scrolling rolls the
 * next one into the light.
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

      const cars = q(".car") as HTMLElement[];
      const infos = q(".car-info") as HTMLElement[];
      const track = q(".cars")[0] as HTMLElement;
      const count = q(".showroom-count-now")[0];
      const light = q(".spot, .spot-pool, .lamp-bulb");
      // how far the row has to slide to bring ride k onto the turntable
      const offset = (k: number) => -(cars[k].offsetLeft - cars[0].offsetLeft);
      const DIM = { scale: 0.62, autoAlpha: 0.28 };
      const LIT = { scale: 1, autoAlpha: 1 };
      gsap.set(cars.slice(1), DIM);
      gsap.set(infos.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: `+=${260 + cars.length * 100}%`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
        onUpdate: () => {
          // which project is on the turntable right now, for the 01 / 04 counter
          const x = gsap.getProperty(track, "x") as number;
          const k = cars.reduce((best, _, i) => (Math.abs(offset(i) - x) < Math.abs(offset(best) - x) ? i : best), 0);
          if (count) count.textContent = String(k + 1).padStart(2, "0");
        },
      });
      // 1. walk up to the door: the whole garage front grows until the door fills the screen
      tl.fromTo(q(".garage-scene"), { scale: 0.5 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(q(".garage-note"), { opacity: 0, duration: 0.3 }, 0.1)
        // 2. the shutter rattles up (and back down, scrolling the other way)
        .call(rattle, [], 1.05)
        .to(q(".shutter"), { yPercent: -100, duration: 0.8, ease: "power2.inOut" }, 1.05)
        // 3. the spotlight stutters on, and there's the first ride, with its details
        .fromTo(light, { opacity: 0 }, { keyframes: { opacity: [0, 1, 0.25, 1, 0.6, 1] }, duration: 0.45, ease: "none" }, 1.45)
        .fromTo(track, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 1.5)
        .from(cars[0], { y: 40, duration: 0.5, ease: "power3.out" }, 1.5)
        .from(infos[0], { autoAlpha: 0, y: 20, duration: 0.4, ease: "power3.out" }, 1.75)
        .from(q(".showroom-ui"), { autoAlpha: 0, duration: 0.3 }, 1.8);
      // 4. then each scroll step rolls the next ride into the light
      for (let k = 1; k < cars.length; k++) {
        tl.to({}, { duration: 0.4 });
        const at = tl.duration();
        tl.to(track, { x: () => offset(k), duration: 0.8, ease: "power2.inOut" }, at)
          .to(cars[k - 1], { ...DIM, duration: 0.6, ease: "power2.inOut" }, at)
          .to(cars[k], { ...LIT, duration: 0.6, ease: "power2.inOut" }, at + 0.2)
          .to(infos[k - 1], { autoAlpha: 0, y: -14, duration: 0.25 }, at)
          .fromTo(infos[k], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, at + 0.5)
          .to(light, { keyframes: { opacity: [1, 0.5, 1] }, duration: 0.25, ease: "none" }, at + 0.55);
      }
      tl.to({}, { duration: 0.5 }); // a beat on the last one before the page moves on
      // the turntable keeps turning all through the showroom
      tl.fromTo(q(".turntable-ring"), { strokeDashoffset: 0 }, { strokeDashoffset: -900, duration: tl.duration() - 1.5, ease: "none" }, 1.5);
    },
    { scope: root },
  );

  const total = String(garage.items.length).padStart(2, "0");
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
          <div className="garage-inside showroom">
            <h2 className="sr-only">{garage.title}</h2>

            {/* the lamp, its cone of light, and the turntable on the floor */}
            <div className="spot" aria-hidden />
            <span className="lamp" aria-hidden>
              <span className="lamp-bulb" />
            </span>
            <div className="spot-pool" aria-hidden />
            <svg className="turntable" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden>
              <ellipse cx="300" cy="60" rx="296" ry="56" className="turntable-base" />
              <ellipse cx="300" cy="60" rx="250" ry="44" className="turntable-ring" />
            </svg>

            <ol className="cars" aria-hidden>
              {garage.items.map((p, i) => (
                <li key={p.name} className="car">
                  <div className={`car-body shape-${SHAPES[i % SHAPES.length]}`}>
                    <div className="car-bar">
                      <i />
                      <i />
                      <i />
                      <span className="car-url">{host(p.href)}</span>
                    </div>
                    <div className="car-screen">
                      {"cover" in p && p.cover ? (
                        // the project's own hero, as its cover
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="car-cover" src={p.cover} alt="" loading="lazy" />
                      ) : (
                        <>
                          <span className="car-shape" />
                          <span className="car-name">{p.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="plate car-plate">KA · 01 · PH · {String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>

            {/* the details of whichever ride is in the light */}
            <div className="car-infos">
              {garage.items.map((p, i) => (
                <article key={p.name} className="car-info">
                  <p className="car-info-no">Bay {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="car-info-name">{p.name}</h3>
                  <p className="car-info-tag">{p.tag}</p>
                  <p className="car-info-blurb">{p.blurb}</p>
                  {p.href ? (
                    <a className="car-go" href={p.href} target="_blank" rel="noreferrer">
                      Visit the site ↗
                    </a>
                  ) : (
                    <span className="car-go is-private">Private build</span>
                  )}
                </article>
              ))}
            </div>

            {/* game-style chrome */}
            <div className="showroom-ui" aria-hidden>
              <span className="showroom-title">Select your ride</span>
              <span className="showroom-count">
                <span className="showroom-count-now">01</span> / {total}
              </span>
              <span className="showroom-hint">◂ scroll ▸</span>
            </div>
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
