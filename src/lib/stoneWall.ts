/**
 * Builds a rubble-stone wall like a hand-drawn dry-stone texture: rows of uneven height, split into stones of
 * uneven width. Neighbouring stones share their wavy edges, so the whole thing tiles with no holes; each stone is
 * then pulled in a touch and its corners rounded, which leaves the thick dark "mortar" lines between them.
 *
 * Deterministic (seeded), so the server and the browser draw the identical wall.
 */

export const WALL = { w: 600, h: 300 };

export type Stone = { d: string; cx: number; cy: number; w: number; h: number; label?: string; hot?: boolean; size?: number };

type Pt = [number, number];

/** mulberry32: a tiny seeded random. */
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildWall(labels: string[], hot: string[], seed = 7): Stone[] {
  const r = seeded(seed);
  const rnd = (a: number, b: number) => a + r() * (b - a);
  const { w: W, h: H } = WALL;

  // horizontal joints: gentle waves across the wall (flat along the ground, a little lumpy on top)
  const ys = [0];
  while (H - ys[ys.length - 1] > 70) ys.push(ys[ys.length - 1] + rnd(30, 62));
  ys.push(H);
  const joints = ys.map((base, i) => {
    const amp = i === ys.length - 1 ? 0 : i === 0 ? 3 : 9;
    const [f1, f2, p1, p2] = [rnd(0.018, 0.03), rnd(0.05, 0.08), rnd(0, 6.3), rnd(0, 6.3)];
    return (x: number) => base + amp * (Math.sin(x * f1 + p1) + 0.5 * Math.sin(x * f2 + p2));
  });

  const stones: Stone[] = [];
  for (let row = 0; row < ys.length - 1; row++) {
    const top = joints[row];
    const bot = joints[row + 1];
    // vertical joints: a top x, a slightly kinked middle and a bottom x, shared by the stones either side
    const edges: { t: number; m: Pt; b: number }[] = [{ t: 0, m: [0, (top(0) + bot(0)) / 2], b: 0 }];
    let x = row % 2 ? rnd(25, 60) : rnd(45, 95); // stagger the joints row to row
    while (W - x > 40) {
      const tilt = rnd(-18, 18);
      edges.push({ t: x - tilt / 2, m: [x + rnd(-9, 9), (top(x) + bot(x)) / 2 + rnd(-8, 8)], b: x + tilt / 2 });
      x += rnd(38, 120);
    }
    edges.push({ t: W, m: [W, (top(W) + bot(W)) / 2], b: W });

    for (let i = 0; i < edges.length - 1; i++) {
      const L = edges[i];
      const R = edges[i + 1];
      const pts: Pt[] = [];
      const along = (from: number, to: number, f: (x: number) => number) => {
        const n = Math.max(2, Math.round(Math.abs(to - from) / 22));
        for (let k = 0; k <= n; k++) {
          const xx = from + ((to - from) * k) / n;
          pts.push([xx, f(xx)]);
        }
      };
      along(L.t, R.t, top);
      pts.push(R.m);
      along(R.b, L.b, bot);
      pts.push(L.m);

      // pull in toward the middle, then round every corner (curves through the midpoints)
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const shrunk = pts.map(([px, py]): Pt => {
        const dx = px - cx;
        const dy = py - cy;
        const k = Math.max(0, 1 - 2.2 / (Math.hypot(dx, dy) || 1));
        return [cx + dx * k, cy + dy * k];
      });
      const n = shrunk.length;
      const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const f = (v: number) => v.toFixed(1);
      const m0 = mid(shrunk[n - 1], shrunk[0]);
      let d = `M${f(m0[0])} ${f(m0[1])}`;
      for (let k = 0; k < n; k++) {
        const m = mid(shrunk[k], shrunk[(k + 1) % n]);
        d += ` Q${f(shrunk[k][0])} ${f(shrunk[k][1])} ${f(m[0])} ${f(m[1])}`;
      }
      stones.push({ d: d + " Z", cx, cy, w: Math.min(R.t - L.t, R.b - L.b), h: bot(cx) - top(cx) });
    }
  }

  // the names go on the biggest stones, one each
  const byArea = stones.map((s, i) => [s.w * s.h, i] as const).sort((a, b) => b[0] - a[0]);
  labels.forEach((label, li) => {
    const s = stones[byArea[li][1]];
    s.label = label;
    s.hot = hot.includes(label);
    s.size = Math.min(19, (s.w - 10) / (label.length * 0.42), s.h * 0.48);
  });
  return stones;
}
