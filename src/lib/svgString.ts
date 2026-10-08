import type { ReactNode } from "react";

/**
 * Serialises a small SVG element tree (plain elements and function components, no hooks) to markup.
 * Used for the link-preview card: Next.js forbids react-dom/server in app routes, and the card renderer's
 * own handling of nested SVG trips over the bike drawing. A base64 image of this string avoids both.
 */
const KEEP_CAMEL = new Set(["viewBox", "pathLength", "preserveAspectRatio", "textLength", "lengthAdjust"]);
const attrName = (k: string) => (k === "className" ? "class" : KEEP_CAMEL.has(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`));
const escape = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function svgString(node: ReactNode): string {
  if (node == null || node === false || node === true) return "";
  if (typeof node === "string" || typeof node === "number") return escape(String(node));
  if (Array.isArray(node)) return node.map(svgString).join("");
  if (typeof node === "object" && "type" in node) {
    const { type, props } = node as { type: unknown; props: Record<string, unknown> };
    if (typeof type === "function") return svgString((type as (p: unknown) => ReactNode)(props));
    if (typeof type === "symbol") return svgString(props.children as ReactNode); // fragments
    const attrs = Object.entries(props)
      .filter(([k, v]) => k !== "children" && k !== "key" && v != null && v !== false)
      .map(([k, v]) => ` ${attrName(k)}="${escape(String(v))}"`)
      .join("");
    return `<${type as string}${attrs}>${svgString(props.children as ReactNode)}</${type as string}>`;
  }
  return "";
}
