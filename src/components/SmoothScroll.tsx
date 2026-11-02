import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { dur } from "../lib/motion";
import { headerOffset, SmoothScrollContext } from "../lib/smooth-scroll";

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduce) return; // reduced motion: scroll native, tanpa Lenis
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, opts?: { immediate?: boolean }) => {
      const offset = typeof target === "number" ? 0 : -headerOffset();
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, {
          offset,
          immediate: opts?.immediate,
          duration: dur.slow * 1.2,
          easing: easeOutQuint,
        });
        return;
      }
      const el = typeof target === "string" ? document.querySelector(target) : target;
      const top =
        typeof el === "number"
          ? el
          : el instanceof HTMLElement
            ? el.getBoundingClientRect().top + window.scrollY + offset
            : 0;
      window.scrollTo({ top, behavior: "auto" });
    },
    [],
  );

  const locks = useRef(new Set<string>());
  const lock = useCallback((key: string, on: boolean) => {
    if (on) locks.current.add(key);
    else locks.current.delete(key);
    const locked = locks.current.size > 0;
    document.documentElement.classList.toggle("is-locked", locked);
    if (locked) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, []);

  const api = useMemo(() => ({ scrollTo, lock }), [scrollTo, lock]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
