"use client";

import { useRef } from "react";
import { specs } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Bike, BIKE_PARTS } from "./Bike";

/**
 * The figure is laid out in its own units: 1000 wide × 860 tall. The bike drawing (1000 × 560) sits at
 * y = 120; the spec cards sit above and below it, each straight above/below the part it labels, so every
 * leader line is a clean vertical.
 */
const FIG_H = 860;
const BIKE_Y = 120;
const CARDS: Record<(typeof specs.parts)[number]["part"], { left: number; top: number; width: number }> = {
  tank: { left: 250, top: 0, width: 350 },
  cockpit: { left: 630, top: 0, width: 340 },
  wheel: { left: 30, top: 690, width: 360 },
  engine: { left: 420, top: 690, width: 360 },
};
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function Specs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const strokes = el.querySelectorAll<SVGElement>(".specs-figure .bike .ink:not(.dashed)");
      if (prefersReducedMotion()) {
        gsap.set(strokes, { strokeDashoffset: 0 });
        return;
      }
      const mm = gsap.matchMedia();

      // wide screens: pin the figure and bring the callouts in one by one
      mm.add("(min-width: 900px) and (min-aspect-ratio: 1/1)", () => {
        gsap.fromTo(
          strokes,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: "none", stagger: 0.01, scrollTrigger: { trigger: ".specs-figure", start: "top 85%", end: "top 25%", scrub: 0.6 } },
        );
        const counter = el.querySelector<HTMLElement>(".specs-counter-now");
        const name = el.querySelector<HTMLElement>(".specs-counter-name");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".specs-stage",
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const k = Math.min(specs.parts.length - 1, Math.floor(self.progress * specs.parts.length * 0.999));
              if (counter) counter.textContent = String(k + 1).padStart(2, "0");
              if (name) name.textContent = specs.parts[k].label;
            },
          },
        });
        specs.parts.forEach((p, k) => {
          const at = k;
          tl.fromTo(`.callout-${p.part} .leader`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, at)
            .fromTo(`.callout-${p.part} .dot`, { scale: 0 }, { scale: 1, duration: 0.25, transformOrigin: "50% 50%", ease: "back.out(3)" }, at)
            .fromTo(`.card-${p.part}`, { opacity: 0, y: k < 2 ? -24 : 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, at + 0.25);
        });
        tl.to({}, { duration: 0.6 }); // a beat to read the last card before the pin lets go
      });

      // narrow screens: no pin; the drawing draws in, the cards follow as a list
      mm.add("(max-width: 899px), (max-aspect-ratio: 1/1)", () => {
        gsap.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.01, scrollTrigger: { trigger: ".specs-figure", start: "top 80%" } });
        gsap.utils.toArray<HTMLElement>(".spec-card").forEach((c) =>
          gsap.from(c, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 90%" } }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="specs section" id="specs" ref={root} aria-label="Skills">
      <div className="specs-head">
        <h2 className="title">{specs.title}</h2>
        <p className="specs-edition">{specs.edition}</p>
      </div>

      <div className="specs-stage">
        <div className="specs-counter" aria-hidden>
          <span className="specs-counter-now">01</span> / {String(specs.parts.length).padStart(2, "0")} —{" "}
          <span className="specs-counter-name">{specs.parts[0].label}</span>
        </div>

        <div className="specs-figure" style={{ aspectRatio: `1000 / ${FIG_H}` }}>
          <div className="specs-bike" style={{ top: pct(BIKE_Y, FIG_H), height: pct(560, FIG_H) }}>
            <Bike title="Hunter 350 line drawing, labelled with skills" />
          </div>

          {/* leader lines and part dots, in the figure's own units */}
          <svg className="specs-leaders" viewBox={`0 0 1000 ${FIG_H}`} aria-hidden>
            {specs.parts.map((p) => {
              const a = BIKE_PARTS[p.part];
              const c = CARDS[p.part];
              const y = a.y + BIKE_Y;
              const end = c.top === 0 ? 168 : c.top - 6;
              return (
                <g key={p.part} className={`callout callout-${p.part}`}>
                  <path className="leader" d={`M${a.x} ${y} L${a.x} ${end}`} pathLength={1} />
                  <circle className="dot" cx={a.x} cy={y} r={9} />
                  <circle className="dot-core" cx={a.x} cy={y} r={3.5} />
                </g>
              );
            })}
          </svg>

          {specs.parts.map((p, k) => {
            const c = CARDS[p.part];
            return (
              <article
                key={p.part}
                className={`spec-card card-${p.part}`}
                style={{ left: pct(c.left, 1000), top: pct(c.top, FIG_H), width: pct(c.width, 1000) }}
              >
                <p className="spec-card-head">
                  <span className="spec-no">{String(k + 1).padStart(2, "0")}</span>
                  <span className="spec-part">{p.label}</span>
                  <span className="spec-note hand">{p.note}</span>
                </p>
                <p className="spec-group">{p.group}</p>
                <p className="spec-items">{p.items.join(" · ")}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
