"use client";

import { useRef, type ReactNode } from "react";
import { rider } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type ChipKey = keyof typeof rider.chips;

/** Small line-drawn logos for the stickers, in the same pen as the rest of the page. */
const ICONS: Record<string, ReactNode> = {
  react: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.4">
      <ellipse cx="20" cy="20" rx="17" ry="6.5" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(60 20 20)" />
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(-60 20 20)" />
      <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="17" />
      <path d="M14 27 V13 L27 29 M26 13 V22" />
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="34" height="34" rx="6" />
      <path d="M9 18 H19 M14 18 V31 M31 19 C29 17 24 17 24 20.5 C24 24 31 23 31 27 C31 31 26 31 23.5 29" />
    </svg>
  ),
};

function Chip({ k }: { k: ChipKey }) {
  const c: { label: string; icon?: string; tone?: string; tilt: number } = rider.chips[k];
  return (
    <span aria-hidden className={`chip${c.tone ? ` chip-${c.tone}` : ""}`} style={{ ["--tilt" as string]: `${c.tilt}deg` }}>
      {c.icon && <span className="chip-icon">{ICONS[c.icon]}</span>}
      {c.label}
    </span>
  );
}

/**
 * The statement, word by word: {key} becomes a sticker chip, *starred* runs become serif italics, and
 * "word\u00a0{key}" keeps that word and its sticker on one line.
 */
function Statement({ text }: { text: string }) {
  const parts = text.split(/(\S+\u00a0\{\w+\}|\{\w+\}|\*[^*]+\*)/g).filter(Boolean);
  return (
    <p className="rider-statement" aria-label={text.replace(/\{(\w+)\}/g, (_, k: ChipKey) => rider.chips[k].label).replace(/\*/g, "")}>
      {parts.map((part, pi) => {
        if (part.startsWith("{")) return <Chip key={pi} k={part.slice(1, -1) as ChipKey} />;
        const accent = part.startsWith("*");
        const raw = accent ? part.slice(1, -1) : part;
        return raw.split(/(\s+)/).map((w, wi) =>
          /^\s+$/.test(w) || !w ? (
            w
          ) : (
            <span key={`${pi}-${wi}`} className={`w${accent ? " accent" : ""}`} aria-hidden>
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

      // scrubbed by the scroll: words ink in one after another, and each sticker slaps onto the page as it's reached
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".rider-statement", start: "top 80%", end: "bottom 50%", scrub: 0.5 } });
      el.querySelectorAll<HTMLElement>(".rider-statement .w, .rider-statement .chip").forEach((node, i) => {
        if (node.classList.contains("chip"))
          tl.fromTo(node, { scale: 0, rotate: -30 }, { scale: 1, rotate: () => node.style.getPropertyValue("--tilt"), duration: 1.6, ease: "back.out(2.4)" }, i * 0.35);
        else tl.fromTo(node, { opacity: 0.14 }, { opacity: 1, duration: 0.6, ease: "none" }, i * 0.35);
      });
    },
    { scope: root },
  );

  return (
    <section className="rider section" id="rider" ref={root} aria-label="About">
      <Statement text={rider.statement} />
    </section>
  );
}
