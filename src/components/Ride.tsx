"use client";

import { useRef } from "react";
import { profile, ride } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Arrow, Emblem } from "./Doodles";
import Marquee from "./Marquee";

/** The back cover: a dark finale with the invitation, the club emblem and the way to get in touch. */
export default function Ride() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".ride-title .ch", {
        yPercent: 115,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.04,
        scrollTrigger: { trigger: ".ride-title", start: "top 85%" },
      });
      gsap.from(".ride-emblem", { scale: 0.6, rotate: -60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".ride-title", start: "top 75%" } });
      gsap.from(".ride-body > *", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".ride-body", start: "top 88%" } });
      gsap.fromTo(".ride-note .arrow path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: ".ride-note", start: "top 90%" } });
    },
    { scope: root },
  );

  const letters = (w: string, last?: boolean) => (
    <span className="ride-line" aria-hidden>
      {[...w.toUpperCase().replace(".", "")].map((c, i) => (
        <span key={i} className="ch">
          {c}
        </span>
      ))}
      {last && <span className="ch stop">.</span>}
    </span>
  );

  return (
    <section className="ride" id="ride" ref={root} aria-label="Contact">
      <Marquee items={ride.marquee} tone="orange" />
      <div className="ride-inner">
        <p className="kicker kicker-light">
          <span className="kicker-rule" aria-hidden />
          {ride.kicker}
        </p>
        <div className="ride-hero">
          <h2 className="ride-title" aria-label={ride.title.join(" ")}>
            {letters(ride.title[0])}
            {letters(ride.title[1], true)}
          </h2>
          <Emblem className="ride-emblem" text="PRABAL HOLLA MOTO CLUB ✦ EST. 2022 ✦ BANGALORE ✦ " />
        </div>
        <div className="ride-body">
          <p className="ride-text">{ride.body}</p>
          <a className="ride-mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <p className="ride-note hand" aria-hidden>
            <Arrow flip />
            {ride.note}
          </p>
          <div className="ride-links">
            {profile.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
        <footer className="footer">
          <span>© 2026 {profile.name}</span>
          <span>Issue Nº 01 — designed &amp; built in {profile.location}</span>
          <span>Next.js · GSAP · Lenis</span>
        </footer>
      </div>
    </section>
  );
}
