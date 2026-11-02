import { createContext, useCallback, useContext, useEffect, useState, type MouseEvent } from "react";

export interface SmoothScrollApi {
  /** Gulir ke selector/elemen/angka dengan offset tinggi header. */
  scrollTo: (target: string | HTMLElement | number, opts?: { immediate?: boolean }) => void;
  /** Kunci scroll halaman selama ada panel terbuka (menu HP, detail menu, keranjang). */
  lock: (key: string, on: boolean) => void;
}

export const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: () => {},
  lock: () => {},
});

export function useSmoothScroll(): SmoothScrollApi {
  return useContext(SmoothScrollContext);
}

/** Offset tinggi header dari CSS variable --header-h. */
export function headerOffset(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  return parseInt(v, 10) || 88;
}

/** Selalu false saat render pertama (aman untuk prerender/hydration), lalu disesuaikan. */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/**
 * Klik tautan: kalau anchor di halaman yang sama, gulir halus dengan Lenis.
 * Kalau ke halaman lain, biarkan browser berpindah halaman seperti biasa.
 */
export function useAnchorClick(onDone?: () => void) {
  const { scrollTo } = useSmoothScroll();
  return useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const samePage = normalize(url.pathname) === normalize(window.location.pathname);
      if (!samePage) return;
      e.preventDefault();
      onDone?.();
      if (!url.hash || url.hash === "#top") {
        scrollTo(0);
        return;
      }
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (el) scrollTo(el);
    },
    [scrollTo, onDone],
  );
}

function normalize(p: string): string {
  return p.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
}
