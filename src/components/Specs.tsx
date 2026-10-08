"use client";

import { useRef } from "react";
import { specs } from "@/data/content";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { playClink } from "@/lib/clink";
import { HANG, ToolShape } from "./Tools";

/** Gives a hanging tool a little push: it swings on its hook and settles. */
function swing(body: Element, push = 1) {
  return gsap.to(body, {
    keyframes: { rotation: [0, 13 * push, -9 * push, 5 * push, -2.5 * push, 1 * push, 0] },
    svgOrigin: HANG,
    duration: 1.5,
    ease: "sine.inOut",
  });
}

/**
 * The skills, as a workshop tool wall: a pegboard with the outline of each tool drawn on it, one tool per skill
 * group. As the wall comes into view each tool drops onto its hook and swings until it settles into its
 * outline; a paper tag under it lists the skills. Hover a tool and it swings again.
 */
export default function Specs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ scrollTrigger: { trigger: q(".toolwall")[0], start: "top 70%" } });
      tl.from(q(".toolwall-note"), { opacity: 0, rotate: -14, duration: 0.6, ease: "back.out(2)" }, 0);
      q(".tool").forEach((tool, i) => {
        const body = tool.querySelector(".tool-body")!;
        const at = 0.15 + i * 0.22;
        tl.fromTo(body, { y: -520, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.in" }, at)
          .call(() => playClink(i), [], at + 0.5)
          .add(swing(body, i % 2 ? -1 : 1), at + 0.5)
          .from(tool.querySelector(".tool-tag"), { opacity: 0, y: -18, rotate: 0, duration: 0.5, ease: "back.out(2)" }, at + 0.65);
      });
    },
    { scope: root },
  );

  const nudge = (e: React.MouseEvent<HTMLElement>) => {
    const body = e.currentTarget.querySelector(".tool-body");
    if (!body || prefersReducedMotion() || gsap.isTweening(body)) return;
    swing(body, Math.random() < 0.5 ? -0.7 : 0.7);
  };

  return (
    <section className="specs section" id="specs" ref={root} aria-label="Skills">
      <div className="toolwall">
        <p className="toolwall-note hand" aria-hidden>
          {specs.note}
        </p>
        <ul className="toolwall-row">
          {specs.tools.map((t, i) => (
            <li key={t.tool} className="tool" onMouseEnter={nudge}>
              <svg className="tool-svg" viewBox="0 0 160 440" aria-hidden>
                {/* the tool's outline painted on the board, and the peg it hangs from */}
                <g className="tool-shadow">
                  <ToolShape kind={t.tool} />
                </g>
                <g className="tool-body">
                  <ToolShape kind={t.tool} />
                </g>
                <circle className="tool-peg" cx="80" cy="24" r="5" />
              </svg>
              <div className="tool-tag" style={{ ["--tilt" as string]: `${[-3, 2.5, -2, 3][i % 4]}deg` }}>
                <h3 className="tool-group">{t.group}</h3>
                <p className="tool-items">{t.items.join(" · ")}</p>
                <p className="tool-note hand">{t.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
