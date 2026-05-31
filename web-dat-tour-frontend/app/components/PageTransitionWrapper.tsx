"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.35,
  ease: "easeInOut",
} as const;

/**
 * Wraps page content with Framer Motion page-transition animation.
 * Also runs a hard-reset IntersectionObserver for data-aos elements
 * after every navigation so scroll animations work on back/forward.
 */
export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Disconnect previous observer
    observerRef.current?.disconnect();

    const setup = () => {
      const elements = document.querySelectorAll<HTMLElement>("[data-aos]");
      if (!elements.length) return;

      // Strip old AOS classes so every element is treated as fresh
      elements.forEach((el) => {
        el.classList.remove("aos-animate", "aos-init");
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
            } else {
              entry.target.classList.remove("aos-animate");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      elements.forEach((el) => observer.observe(el));
      observerRef.current = observer;
    };

    // Wait for Framer Motion enter animation to finish (~350ms) then setup
    const id = setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(setup));
    }, 400);

    return () => {
      clearTimeout(id);
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
