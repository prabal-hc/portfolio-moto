"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Scroll to an element or offset, smoothly when Lenis is running. */
export function scrollToTarget(target: string | number) {
  const l = window.__lenis;
  if (l) l.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so every ScrollTrigger animation reads the same smoothed
 * position. Always starts at the top: a refresh never drops you half-way down the magazine.
 */
export default function SmoothScroll() {
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    window.__lenis = lenis;
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // coming back with the back/forward button restores the page from memory: start over there too
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) lenis.scrollTo(0, { immediate: true, force: true });
    };
    window.addEventListener("pageshow", onShow);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pageshow", onShow);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
