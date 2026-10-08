import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { Bike } from "@/components/Bike";
import { svgString } from "@/lib/svgString";

/**
 * The card LinkedIn (and every other site) shows when the link is shared: the hero in miniature.
 * Rendered once at build time into a static PNG.
 */
export const dynamic = "force-static";
export const alt = "Prabal Holla — Frontend Developer. Websites built to ride smooth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (pkg: string, file: string) => readFile(join(process.cwd(), `node_modules/@fontsource/${pkg}/files/${file}`));

const BIKE = `data:image/svg+xml;base64,${Buffer.from(
  svgString(Bike({ inlineStyles: true })).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'),
).toString("base64")}`;

export default async function OpengraphImage() {
  const [display, displayMedium, hand] = await Promise.all([
    font("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"),
    font("bricolage-grotesque", "bricolage-grotesque-latin-500-normal.woff"),
    font("caveat", "caveat-latin-600-normal.woff"),
  ]);
  const ink = "#1c1a17";
  const orange = "#e8501c";
  // the hero statement, each line slightly off-axis like on the site
  const line = (text: string, x: number, deg: number, accent?: string) => (
    <span style={{ display: "flex", height: 104, alignItems: "center", transform: `translateX(${x}px) rotate(${deg}deg)` }}>
      {text}
      {accent && <span style={{ color: orange, marginLeft: 22 }}>{accent}</span>}
    </span>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f1e9dc", color: ink, fontFamily: "Display" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 60px 0", fontSize: 26 }}>
          <span style={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Prabal Holla<span style={{ color: orange }}>.</span>
          </span>
          <span style={{ fontWeight: 500, fontSize: 22, color: "#4b443c" }}>Frontend developer · Bangalore</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "42px 0 0 72px", fontWeight: 800, fontSize: 104, letterSpacing: -4 }}>
          {line("WEBSITES", 0, -2.5)}
          {line("BUILT TO", 70, 1.5)}
          {line("RIDE", 0, -1, "SMOOTH.")}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by the card renderer, not a browser */}
        <img src={BIKE} width={540} height={302} style={{ position: "absolute", right: 46, bottom: 52 }} alt="" />
        <div style={{ position: "absolute", right: 330, top: 214, display: "flex", fontFamily: "Hand", fontSize: 34, color: orange, transform: "rotate(-7deg)" }}>
          my other office
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Display", data: displayMedium, weight: 500, style: "normal" },
        { name: "Hand", data: hand, weight: 600, style: "normal" },
      ],
    },
  );
}
