/**
 * Hand-drawn workshop tools for the tool wall, each standing upright in its own 160 × 440 box and hung from a
 * hole at (80, 24). Paths are tagged by how they're painted: "t-fill" (paper), "t-hot" (orange), "t-line" (ink only).
 */

export type ToolKind = "wrench" | "screwdriver" | "pliers" | "hammer";

/** Where every tool hangs from, in its own units. */
export const HANG = "80 24";

export function ToolShape({ kind }: { kind: ToolKind }) {
  switch (kind) {
    case "wrench":
      // combination spanner: ring end up on the hook, open jaw at the bottom
      return (
        <>
          <path className="t-fill" d="M68 80 L68 352 C48 360 34 374 34 394 L42 424 L58 404 L58 388 L102 388 L102 404 L118 424 L126 394 C126 374 112 360 92 352 L92 80" />
          <circle className="t-fill" cx="80" cy="50" r="32" />
          <path className="t-line" d="M80 34 L94 42 L94 58 L80 66 L66 58 L66 42 Z" />
          <path className="t-line" d="M80 110 L80 320" />
        </>
      );
    case "screwdriver":
      // orange grooved handle up top (with its hanging hole), steel shaft down to the tip
      return (
        <>
          <rect className="t-hot" x="50" y="14" width="60" height="170" rx="24" />
          <circle className="t-fill" cx="80" cy="34" r="8" />
          <path className="t-line" d="M66 68 L66 166 M80 68 L80 170 M94 68 L94 166" />
          <rect className="t-fill" x="65" y="184" width="30" height="22" rx="4" />
          <path className="t-fill" d="M74 206 L74 398 L78 428 L82 428 L86 398 L86 206 Z" />
        </>
      );
    case "pliers":
      // nose up, pivot, orange grips splaying down
      return (
        <>
          <path className="t-fill" d="M66 162 C62 112 68 62 76 20 C78 14 84 14 85 20 C92 62 98 112 94 162 Z" />
          <path className="t-line" d="M80 26 L80 152 M70 70 L78 74 M70 92 L78 96 M70 114 L78 118" />
          <path className="t-hot" d="M68 182 C58 260 42 340 34 418 C40 424 50 426 56 422 C64 340 76 262 80 190 Z" />
          <path className="t-hot" d="M92 182 C102 260 118 340 126 418 C120 424 110 426 104 422 C96 340 84 262 80 190 Z" />
          <circle className="t-fill" cx="80" cy="170" r="16" />
          <circle className="t-line" cx="80" cy="170" r="5" />
        </>
      );
    case "hammer":
      // claw hammer: head across the top, wooden handle with an orange grip
      return (
        <>
          <path className="t-fill" d="M70 82 L72 414 C72 426 90 426 90 414 L92 82 Z" />
          <rect className="t-hot" x="69" y="300" width="24" height="122" rx="11" />
          <path className="t-line" d="M77 110 C79 160 76 210 78 270 M85 120 C83 170 86 220 84 280" />
          <path className="t-fill" d="M56 30 H134 C142 30 146 36 146 42 V70 C146 76 142 82 134 82 H56 Z" />
          <path className="t-fill" d="M56 30 C36 32 22 44 16 66 C26 58 38 52 56 50 Z" />
          <path className="t-fill" d="M56 62 C40 64 28 74 22 92 C32 84 42 82 56 82 Z" />
          <path className="t-line" d="M120 30 V82" />
        </>
      );
  }
}
