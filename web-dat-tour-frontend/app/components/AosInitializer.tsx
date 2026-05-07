"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Custom AOS replacement using native IntersectionObserver.
 *
 * - Reuses existing data-aos / data-aos-duration / data-aos-delay attributes
 * - Works perfectly with Next.js client-side routing (no jQuery needed)
 * - Reconnects a fresh observer on every page navigation
 */
export default function AosInitializer() {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Disconnect previous observer so old elements don't interfere
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const initObserver = () => {
      const elements = document.querySelectorAll<HTMLElement>("[data-aos]");
      if (elements.length === 0) return;

      // Reset every element to its "hidden" starting state
      elements.forEach((el) => {
        el.classList.remove("aos-animate", "aos-init");

        // Apply duration / delay from data attributes
        const duration = el.dataset.aosDuration ?? "1000";
        const delay = el.dataset.aosDelay ?? "0";
        el.style.transitionDuration = `${duration}ms`;
        el.style.transitionDelay = `${delay}ms`;
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("aos-animate");
              // Keep once:false behaviour — remove animate class when out of view
              // to allow re-animation on next scroll-in
            } else {
              entry.target.classList.remove("aos-animate");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      elements.forEach((el) => observer.observe(el));
      observerRef.current = observer;
    };

    // Double rAF: ensures Next.js has committed the new page DOM before we scan
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(initObserver);
    });

    return () => {
      cancelAnimationFrame(rafId);
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  return null;
}
