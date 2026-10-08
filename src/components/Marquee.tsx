"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * A band of words running sideways forever. Scrolling faster pushes it faster, and scrolling up sends it the
 * other way, so the page feels like it has momentum.
 */
export default function Marquee({ items, tone = "ink" }: { items: readonly string[]; tone?: "ink" | "orange" }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tracks = root.current!.querySelectorAll(".marquee-track");
      // one copy's width per loop, so the seam never shows
      const loop = gsap.to(tracks, { xPercent: -100, duration: 22, ease: "none", repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.direction !== dir) dir = self.direction;
          const boost = Math.min(Math.abs(self.getVelocity()) / 400, 4);
          gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.4, overwrite: true });
        },
      });
    },
    { scope: root },
  );

  const run = (
    <>
      {items.map((it) => (
        <span key={it} className="marquee-item">
          {it}
          <span className="marquee-star" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </>
  );
  return (
    <div className={`marquee marquee-${tone}`} ref={root} aria-label={items.join(", ")}>
      <div className="marquee-track" aria-hidden>
        {run}
      </div>
      <div className="marquee-track" aria-hidden>
        {run}
      </div>
    </div>
  );
}
