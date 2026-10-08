"use client";

import { useRef } from "react";
import { garage } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import Chars from "./Chars";
import { Arrow } from "./Doodles";

/** Each card rests at its own slight angle, like prints pinned to a garage wall. */
const TILT = [-2.6, 1.8, 2.2, -1.6];

export default function Garage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".garage .title .ch", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.025, scrollTrigger: { trigger: ".garage .title", start: "top 85%" } });
      gsap.fromTo(".garage-note .arrow path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: ".garage-note", start: "top 85%" } });
      // cards swing in from a steeper angle and settle at their resting tilt
      gsap.utils.toArray<HTMLElement>(".garage-card").forEach((c, i) => {
        gsap.from(c, {
          y: 90,
          rotate: TILT[i] * 4,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: c, start: "top 92%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="garage section" id="garage" ref={root} aria-label="Work">
      <div className="garage-head">
        <h2 className="title" aria-label={garage.title}>
          <Chars text={garage.title.toUpperCase()} />
        </h2>
        <p className="garage-note hand" aria-hidden>
          {garage.note}
          <Arrow />
        </p>
      </div>

      <ol className="garage-grid">
        {garage.items.map((p, i) => {
          const inner = (
            <>
              <div className="garage-card-top">
                <span className="garage-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="plate">KA · 01 · PH · {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="garage-name">{p.name}</h3>
              <p className="garage-tag">{p.tag}</p>
              <p className="garage-blurb">{p.blurb}</p>
              <span className="garage-go">{p.href ? "Visit the site ↗" : "Private build"}</span>
            </>
          );
          return (
            <li key={p.name} className="garage-card" style={{ "--tilt": `${TILT[i]}deg` } as React.CSSProperties}>
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
    </section>
  );
}
