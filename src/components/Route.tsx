"use client";

import { useRef } from "react";
import { route } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import Chars from "./Chars";

/** Kilometre markers: 1 km = 1 month on the road since January 2022. */
const KM = [0, 24, 41, 54];
/** Where each stop sits down the road, as a fraction of its height. */
const AT = [0.12, 0.37, 0.62, 0.87];

/** A road that winds down the page (its own units: 200 × 1000). */
const ROAD = "M100 0 C170 110 30 200 100 300 S172 470 100 560 S28 760 100 840 S150 960 100 1000";

export default function Route() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".road-reveal", { attr: { height: 1000 } });
        return;
      }
      gsap.from(".route .title .ch", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.025, scrollTrigger: { trigger: ".route .title", start: "top 85%" } });
      // the road paints itself down the page as you ride along it
      gsap.fromTo(
        ".road-reveal",
        { attr: { height: 0 } },
        { attr: { height: 1000 }, ease: "none", scrollTrigger: { trigger: ".route-road", start: "top 70%", end: "bottom 60%", scrub: 0.5 } },
      );
      gsap.utils.toArray<HTMLElement>(".waypoint").forEach((s, i) => {
        gsap.from(s, { opacity: 0, x: i % 2 ? 40 : -40, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 75%" } });
      });
    },
    { scope: root },
  );

  return (
    <section className="route section" id="route" ref={root} aria-label="Journey">
      <h2 className="title" aria-label={route.title}>
        <Chars text={route.title.toUpperCase()} />
      </h2>
      <p className="route-fuel">
        <span className="hand">fuelled by</span> {route.start}
      </p>

      <div className="route-road">
        <svg className="road" viewBox="0 0 200 1000" preserveAspectRatio="none" aria-hidden>
          <defs>
            <clipPath id="road-clip">
              <rect className="road-reveal" x="0" y="0" width="200" height="0" />
            </clipPath>
          </defs>
          <g clipPath="url(#road-clip)">
            <path d={ROAD} className="road-tarmac" vectorEffect="non-scaling-stroke" />
            <path d={ROAD} className="road-line" vectorEffect="non-scaling-stroke" />
          </g>
          <path d={ROAD} className="road-ghost" vectorEffect="non-scaling-stroke" />
        </svg>

        <ol className="waypoints">
          {route.stops.map((s, i) => (
            <li key={s.what + s.when} className={`waypoint ${i % 2 ? "waypoint-right" : "waypoint-left"}`} style={{ top: `${AT[i] * 100}%` }}>
              <span className="km">
                KM <b>{String(KM[i]).padStart(2, "0")}</b>
              </span>
              <p className="stop-when">{s.when}</p>
              <h3 className="stop-what">{s.what}</h3>
              <p className="stop-where">{s.where}</p>
              <p className="stop-point">{s.point}</p>
            </li>
          ))}
        </ol>
        <p className="route-legend hand" aria-hidden>
          1 km = 1 month on the road
        </p>
      </div>
    </section>
  );
}
