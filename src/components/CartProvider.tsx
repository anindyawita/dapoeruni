import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { MenuItem } from "../data/source";
import { CartContext, clampQty, type CartApi } from "../lib/cart";
import { getServerSnapshot, getSnapshot, subscribe, update } from "../lib/cart-store";
import { useSmoothScroll } from "../lib/smooth-scroll";

const noopSubscribe = () => () => {};

/**
 * State keranjang. Isi keranjang disimpan di localStorage (lewat cart-store)
 * supaya tetap ada saat pindah antara Beranda dan halaman Menu.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false saat prerender & hydration, true setelahnya
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<MenuItem | null>(null);
  const [lastAdded, setLastAdded] = useState<CartApi["lastAdded"]>(null);
  const timer = useRef<number | undefined>(undefined);
  const { lock } = useSmoothScroll();

  useEffect(() => lock("keranjang", drawerOpen), [drawerOpen, lock]);
  useEffect(() => lock("detail", detail !== null), [detail, lock]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const upsert = useCallback((id: string, qty: number) => {
    update((s) => {
      const i = s.lines.findIndex((l) => l.id === id);
      const lines =
        i < 0
          ? [...s.lines, { id, qty: clampQty(qty), checked: true }]
          : s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(qty), checked: true } : l));
      return { ...s, lines };
    });
    const at = Date.now();
    setLastAdded({ id, at });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLastAdded((cur) => (cur?.at === at ? null : cur)), 2200);
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) =>
      update((s) => ({ ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)) })),
    [],
  );
  const toggle = useCallback(
    (id: string) => update((s) => ({ ...s, lines: s.lines.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)) })),
    [],
  );
  const remove = useCallback((id: string) => update((s) => ({ ...s, lines: s.lines.filter((l) => l.id !== id) })), []);
  const clear = useCallback(() => update((s) => ({ ...s, lines: [], catatan: "" })), []);
  const setTanggal = useCallback((tanggal: string) => update((s) => ({ ...s, tanggal })), []);
  const setCatatan = useCallback((catatan: string) => update((s) => ({ ...s, catatan })), []);

  const api = useMemo<CartApi>(
    () => ({
      lines: data.lines,
      ready,
      upsert,
      setQty,
      toggle,
      remove,
      clear,
      tanggal: data.tanggal,
      setTanggal,
      catatan: data.catatan,
      setCatatan,
      drawerOpen,
      setDrawerOpen,
      detail,
      setDetail,
      lastAdded,
    }),
    [data, ready, upsert, setQty, toggle, remove, clear, setTanggal, setCatatan, drawerOpen, detail, lastAdded],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
