"use client";

import { useRef } from "react";
import { garage } from "@/data/content";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { playShutter } from "@/lib/shutterSound";
import { Arrow } from "./Doodles";

const SHUTTER_UP = 0.85; // seconds to roll a shutter all the way up

/**
 * The work, as a row of garage doors with roller shutters. As the doors come into view the shutters rattle up
 * one after another to show the project parked inside; hovering, clicking or tabbing to a door opens it too.
 * Scroll back above them and they come down again.
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
      // the shop sign swings on its chains as it comes into view
      gsap.from(q(".garage-sign"), { rotate: -9, transformOrigin: "50% -40px", duration: 1.8, ease: "elastic.out(1, 0.35)", scrollTrigger: { trigger: q(".garage-sign")[0], start: "top 85%" } });
      gsap.fromTo(q(".garage-note .arrow path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: q(".garage-note")[0], start: "top 85%" } });

      const wide = window.matchMedia("(min-width: 1100px)").matches;
      q(".bay").forEach((bay, i) => {
        ScrollTrigger.create({
          trigger: bay,
          start: "top 70%",
          onEnter: () => open(bay, wide ? i * 0.28 : 0),
          onLeaveBack: () => close(bay),
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="garage section" id="garage" ref={root} aria-label="Work">
      <div className="garage-head">
        <div className="garage-sign">
          <span className="garage-sign-chain" aria-hidden />
          <h2>{garage.title}</h2>
        </div>
        <p className="garage-note hand" aria-hidden>
          {garage.note}
          <Arrow />
        </p>
      </div>

      <ol className="garage-row">
        {garage.items.map((p, i) => {
          const no = String(i + 1).padStart(2, "0");
          const inner = (
            <>
              <span className="bay-no">Bay {no}</span>
              <h3 className="bay-name">{p.name}</h3>
              <p className="bay-tag">{p.tag}</p>
              <p className="bay-blurb">{p.blurb}</p>
              <span className="bay-go">{p.href ? "Visit the site ↗" : "Private build"}</span>
            </>
          );
          return (
            <li key={p.name} className="bay" onMouseEnter={(e) => open(e.currentTarget)} onFocus={(e) => open(e.currentTarget)}>
              <span className="plate bay-plate" aria-hidden>
                KA · 01 · PH · {no}
              </span>
              <div className="bay-door">
                {p.href ? (
                  <a className="bay-inside" href={p.href} target="_blank" rel="noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className="bay-inside is-private">{inner}</div>
                )}
                <div className="shutter" aria-hidden onClick={(e) => open(e.currentTarget.closest(".bay")!)}>
                  <span className="shutter-handle" />
                </div>
                <span className="shutter-drum" aria-hidden />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Roll a bay's shutter up (once it's up, it stays up until the bays are scrolled back past). */
function open(bay: Element, delay = 0) {
  if (bay.classList.contains("is-open") || prefersReducedMotion()) return;
  bay.classList.add("is-open");
  const shutter = bay.querySelector(".shutter");
  gsap.killTweensOf(shutter);
  gsap.to(shutter, {
    yPercent: -100,
    duration: SHUTTER_UP,
    delay,
    ease: "power2.inOut",
    onStart: () => playShutter(SHUTTER_UP),
  });
  // a little jolt as it hits the top
  gsap.fromTo(bay.querySelector(".bay-door"), { y: 0 }, { keyframes: { y: [0, -3, 1, 0] }, duration: 0.25, delay: delay + SHUTTER_UP, ease: "none" });
}

function close(bay: Element) {
  if (!bay.classList.contains("is-open")) return;
  bay.classList.remove("is-open");
  const shutter = bay.querySelector(".shutter");
  gsap.killTweensOf(shutter);
  gsap.to(shutter, { yPercent: 0, duration: 0.6, ease: "power2.in" });
}
