import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Bike } from "@/components/Bike";
import { svgString } from "@/lib/svgString";

/**
 * The card LinkedIn (and every other site) shows when the link is shared: the magazine cover in miniature.
 * Rendered once at build time into a static PNG.
 */
export const dynamic = "force-static";
export const alt = "Prabal Holla — Frontend Developer. Issue Nº 01: a moto-magazine portfolio.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (pkg: string, file: string) => readFile(join(process.cwd(), `node_modules/@fontsource/${pkg}/files/${file}`));

const BIKE = `data:image/svg+xml;base64,${Buffer.from(
  svgString(Bike({ inlineStyles: true })).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'),
).toString("base64")}`;

export default async function OpengraphImage() {
  const [anton, serifItalic, mono, hand] = await Promise.all([
    font("anton", "anton-latin-400-normal.woff"),
    font("instrument-serif", "instrument-serif-latin-400-italic.woff"),
    font("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"),
    font("caveat", "caveat-latin-600-normal.woff"),
  ]);
  const ink = "#1c1a17";
  const orange = "#e8501c";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f1e9dc", color: ink, position: "relative" }}>
        {/* the thin frame of a printed page */}
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, bottom: 16, border: `2px solid ${ink}`, display: "flex" }} />

        <div style={{ position: "absolute", left: 56, right: 56, top: 44, display: "flex", justifyContent: "space-between", fontFamily: "Mono", fontSize: 18, letterSpacing: 3, paddingBottom: 12, borderBottom: `2px solid ${ink}` }}>
          <span>ISSUE Nº 01</span>
          <span>THE FRONTEND ISSUE · 2026</span>
          <span>BANGALORE, IN</span>
        </div>

        {/* each line gets its own fixed-height box: the card renderer spaces Anton's lines more loosely than browsers */}
        <div style={{ position: "absolute", left: 56, top: 98, display: "flex", flexDirection: "column", fontFamily: "Anton", fontSize: 176 }}>
          <span style={{ display: "flex", height: 170, alignItems: "center" }}>PRABAL</span>
          <span style={{ display: "flex", height: 170, alignItems: "center" }}>
            HOLLA<span style={{ color: orange }}>.</span>
          </span>
        </div>

        <div style={{ position: "absolute", left: 60, bottom: 54, display: "flex", flexDirection: "column", fontFamily: "Serif", fontSize: 40, lineHeight: 1.1 }}>
          <span>Frontend developer who</span>
          <span style={{ color: orange }}>builds fast interfaces.</span>
        </div>

        {/* the site's own bike drawing, painted inline (the card renderer has no stylesheet) and passed as an image */}
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by the card renderer, not a browser */}
        <img src={BIKE} width={640} height={358} style={{ position: "absolute", right: 34, bottom: 70 }} alt="" />
        <div style={{ position: "absolute", right: 380, top: 236, fontFamily: "Hand", fontSize: 36, color: orange, transform: "rotate(-7deg)" }}>my other office</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, weight: 400, style: "normal" },
        { name: "Serif", data: serifItalic, weight: 400, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
        { name: "Hand", data: hand, weight: 600, style: "normal" },
      ],
    },
  );
}
