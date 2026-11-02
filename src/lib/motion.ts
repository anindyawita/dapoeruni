import type { Transition, Variants } from "motion/react";

export const ease = [0.22, 1, 0.36, 1] as const; // easeOutQuint-ish, utama
export const easeInOut = [0.65, 0, 0.35, 1] as const;
export const dur = { fast: 0.35, base: 0.7, slow: 1.1 };
export const stagger = 0.08;
export const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
};

/**
 * Versi prefers-reduced-motion: fade ≤ 0.2 detik. Keadaan awal sengaja sama dengan `reveal`
 * (HTML prerender identik); MotionConfig reducedMotion="user" membuat geraknya langsung.
 */
export const revealReduced = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
};

export const viewportOnce = { once: true, amount: 0.2 } as const;

/** Transisi tanpa animasi gerak, untuk reduced motion. */
export const fadeOnly: Transition = { duration: 0.2 };
