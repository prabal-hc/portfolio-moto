"use client";

import { profile } from "@/data/content";
import { scrollToTarget } from "./SmoothScroll";

const LINKS = [
  { href: "#rider", label: "Rider" },
  { href: "#specs", label: "Specs" },
  { href: "#garage", label: "Garage" },
  { href: "#route", label: "Route" },
];

/** The masthead: name on the left, sections on the right, framed like a magazine page. */
export default function Nav() {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string | number) => {
    e.preventDefault();
    scrollToTarget(target);
  };
  return (
    <header className="nav">
      <a className="nav-brand" href="#top" onClick={(e) => go(e, 0)}>
        <span className="nav-mark">PH</span>
        <span className="nav-star" aria-hidden>
          ✦
        </span>
        {profile.name}
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
