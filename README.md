# Prabal Holla — portfolio

A portfolio set as a vintage motorcycle magazine, built around a line-art Royal Enfield Hunter 350 that draws
itself in ink as you scroll. Warm paper, ink and orange; poster headlines, editorial serif, handwritten notes.

Next.js 16 (static export) · GSAP + ScrollTrigger · Lenis. No 3D, no images: every drawing is inline SVG.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
```

## The issue, section by section

| Section | File | What happens |
| --- | --- | --- |
| Cover | `src/components/Cover.tsx` | The name rises in letter by letter, the bike draws itself, the tank floods orange; scrolling on, the bike rides off with its wheels turning. |
| Marquee | `src/components/Marquee.tsx` | A band of words that speeds up (and reverses) with your scroll. |
| The rider | `src/components/Rider.tsx` | One editorial sentence that inks in word by word; a hand-drawn helmet; stats that count up. |
| Specifications | `src/components/Specs.tsx` | Pinned: leader lines drop from real parts of the bike to spec cards (engine = languages, bodywork = frontend, chassis = backend, cockpit = workflow). |
| The garage | `src/components/Garage.tsx` | Projects as tilted cards with number plates; they straighten and lift on hover. |
| The route | `src/components/Route.tsx` | A road that paints itself down the page, with each job as a kilometre marker (1 km = 1 month). |
| Let's ride | `src/components/Ride.tsx` | The dark back cover: giant headline, turning club emblem, email. |

Supporting pieces: `Bike.tsx` (the drawing, plus `BIKE_PARTS` anchor points for callouts), `Doodles.tsx`
(arrow, squiggle, helmet, emblem), `SmoothScroll.tsx` (Lenis driven by GSAP's ticker; always starts at the top),
and `src/data/content.ts` (every word on the site).

`src/app/opengraph-image.tsx` renders the link-preview card at build time, using the same bike drawing
(serialised by `src/lib/svgString.ts`).
