"use client";

import { useRef } from "react";
import { profile } from "@/data/content";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "./SmoothScroll";

const LINKS = [
  { href: "#rider", label: "Rider" },
  { href: "#specs", label: "Specs" },
  { href: "#garage", label: "Garage" },
  { href: "#route", label: "Route" },
];

/** A quiet header: the name as a wordmark, four links and one call to action. */
export default function Nav() {
  const root = useRef<HTMLElement>(null);
  // over the dark back cover, the header turns dark too
  useGSAP(() => {
    // refreshPriority -1: measure after the pinned sections above have added their scroll length
    ScrollTrigger.create({ trigger: "#ride", start: "top 84px", end: "bottom top", refreshPriority: -1, toggleClass: { targets: root.current!, className: "is-dark" } });
  });

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string | number) => {
    e.preventDefault();
    scrollToTarget(target);
  };
  return (
    <header className="nav" ref={root}>
      <a className="nav-brand" href="#top" onClick={(e) => go(e, 0)}>
        {profile.name}
        <span className="nav-dot" aria-hidden>
          .
        </span>
      </a>
      <nav className="nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
            {l.label}
          </a>
        ))}
        <a className="nav-cta" href="#ride" onClick={(e) => go(e, "#ride")}>
          Let&apos;s ride
        </a>
      </nav>
    </header>
  );
}
