"use client";

import { useRef } from "react";
import { rider } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { Helmet, Squiggle } from "./Doodles";

/** Splits the statement into words; *starred* runs become orange italics. */
function Statement({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  let n = 0;
  return (
    <p className="rider-statement">
      {parts.map((part, pi) => {
        const accent = part.startsWith("*");
        const raw = accent ? part.slice(1, -1) : part;
        return raw.split(/(\s+)/).map((w, wi) =>
          /^\s+$/.test(w) || !w ? (
            w
          ) : (
            <span key={`${pi}-${wi}`} className={`w${accent ? " accent" : ""}`} data-i={n++}>
              {w}
            </span>
          ),
        );
      })}
    </p>
  );
}

export default function Rider() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      // the statement inks in word by word, scrubbed by the scroll
      gsap.fromTo(
        ".rider-statement .w",
        { opacity: 0.14 },
        { opacity: 1, ease: "none", stagger: 0.08, scrollTrigger: { trigger: ".rider-statement", start: "top 78%", end: "bottom 45%", scrub: 0.5 } },
      );
      gsap.fromTo(
        ".rider .kicker-rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%" } },
      );
      gsap.fromTo(
        ".rider .helmet path",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: 0.12, scrollTrigger: { trigger: ".rider .helmet", start: "top 85%" } },
      );
      gsap.fromTo(
        ".rider-note .squiggle path",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: ".rider-note", start: "top 90%" } },
      );
      // stats count up from zero as they come into view
      el.querySelectorAll<HTMLElement>(".stat-v").forEach((s) => {
        const target = parseFloat(s.dataset.v!);
        const suffix = s.dataset.v!.replace(/[\d.]/g, "");
        const decimals = s.dataset.v!.includes(".") ? 1 : 0;
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: s, start: "top 88%" },
          onUpdate: () => (s.textContent = o.v.toFixed(decimals) + suffix),
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="rider section" id="rider" ref={root} aria-label="About">
      <p className="kicker">
        <span className="kicker-rule" aria-hidden />
        {rider.kicker}
      </p>
      <div className="rider-body">
        <Statement text={rider.statement} />
        <div className="rider-side" aria-hidden>
          <Helmet />
          <p className="rider-note hand">
            {rider.note}
            <Squiggle />
          </p>
        </div>
      </div>
      <dl className="stats">
        {rider.stats.map((s) => (
          <div key={s.k} className="stat">
            <dd className="stat-v" data-v={s.v}>
              {s.v}
            </dd>
            <dt>{s.k}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
