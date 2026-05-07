"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getHiddenStyle(aosType: string): { opacity: string; transform: string } {
  switch (aosType) {
    case "fade-up":    return { opacity: "0", transform: "translateY(40px)" };
    case "fade-down":  return { opacity: "0", transform: "translateY(-40px)" };
    case "fade-left":  return { opacity: "0", transform: "translateX(40px)" };
    case "fade-right": return { opacity: "0", transform: "translateX(-40px)" };
    case "flip-up":    return { opacity: "0", transform: "perspective(2500px) rotateX(-100deg)" };
    case "flip-down":  return { opacity: "0", transform: "perspective(2500px) rotateX(100deg)" };
    case "zoom-in":    return { opacity: "0", transform: "scale(0.6)" };
    case "zoom-out":   return { opacity: "0", transform: "scale(1.2)" };
    default:           return { opacity: "0", transform: "translateY(30px)" };
  }
}

export default function ScrollAnimator() {
  const pathname = usePathname();
  const ioRef  = useRef<IntersectionObserver | null>(null);
  const moRef  = useRef<MutationObserver | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // ── Tear down everything from the previous navigation ──────────────────
    ioRef.current?.disconnect();
    moRef.current?.disconnect();
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // ── Fresh IntersectionObserver for this page ───────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.style.opacity   = "1";
            el.style.transform = "none";
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    ioRef.current = io;

    // ── Set up a single element ────────────────────────────────────────────
    const tracked = new WeakSet<HTMLElement>();

    const setupEl = (el: HTMLElement) => {
      if (tracked.has(el)) return;       // already set up in this navigation
      tracked.add(el);

      el.classList.remove("aos-init", "aos-animate");

      const aosType  = el.dataset.aos            ?? "fade-up";
      const duration = el.dataset.aosDuration    ?? "1000";
      const delay    = el.dataset.aosDelay       ?? "0";
      const { opacity, transform } = getHiddenStyle(aosType);

      el.style.opacity    = opacity;
      el.style.transform  = transform;
      el.style.transition =
        `opacity ${duration}ms ease ${delay}ms, ` +
        `transform ${duration}ms ease ${delay}ms`;

      io.observe(el);
    };

    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-aos]").forEach(setupEl);

    // Run scan at 0 / 150 / 500 ms — covers:
    //  0ms   → elements already in DOM (router cache restore)
    //  150ms → elements rendered by Next.js after hydration
    //  500ms → slow machines / lazy-loaded sections
    timers.current = [
      setTimeout(scan, 0),
      setTimeout(scan, 150),
      setTimeout(scan, 500),
    ];

    // MutationObserver catches any element added between scans
    const mo = new MutationObserver(scan);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    moRef.current = mo;

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, [pathname]); // Re-run on EVERY navigation (forward + back)

  return null;
}
