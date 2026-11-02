import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { MenuItem } from "../data/source";
import { getSettings } from "../data/source";
import { CartContext, clampQty, lineKey, normalAddOns, type CartApi, type Langkah, type Pemesan } from "../lib/cart";
import { getServerSnapshot, getSnapshot, subscribe, update } from "../lib/cart-store";
import { useSmoothScroll } from "../lib/smooth-scroll";

const noopSubscribe = () => () => {};

const PEMESAN_KOSONG: Pemesan = {
  nama: "",
  wa: "",
  alamat: "",
  tanggal: "",
  jam: "",
  catatan: "",
  metode: "",
};

/**
 * State keranjang. Isi keranjang disimpan di localStorage (lewat cart-store) supaya tetap ada
 * saat pindah halaman. Data pemesan & langkah checkout hanya di memori.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // false saat prerender & hydration, true setelahnya
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<MenuItem | null>(null);
  const [lastAdded, setLastAdded] = useState<CartApi["lastAdded"]>(null);
  const [langkah, setLangkah] = useState<Langkah>("keranjang");
  const [pemesan, setPemesanState] = useState<Pemesan>(() => ({
    ...PEMESAN_KOSONG,
    metode: getSettings().checkout.metodeBayar[0] ?? "",
  }));
  const timer = useRef<number | undefined>(undefined);
  const { lock } = useSmoothScroll();

  useEffect(() => lock("keranjang", drawerOpen), [drawerOpen, lock]);
  useEffect(() => lock("detail", detail !== null), [detail, lock]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = useCallback((id: string, qty: number, addOns: string[]) => {
    const ao = normalAddOns(addOns);
    const key = lineKey(id, ao);
    update((s) => {
      const ada = s.lines.find((l) => l.key === key);
      const lines = ada
        ? s.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(l.qty + qty), checked: true } : l))
        : [...s.lines, { key, id, addOns: ao, qty: clampQty(qty), checked: true }];
      return { ...s, lines };
    });
    setLangkah("keranjang");
    const at = Date.now();
    setLastAdded({ id, at });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLastAdded((cur) => (cur?.at === at ? null : cur)), 2200);
  }, []);

  const setQty = useCallback(
    (key: string, qty: number) =>
      update((s) => ({ ...s, lines: s.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty) } : l)) })),
    [],
  );
  const toggle = useCallback(
    (key: string) =>
      update((s) => ({ ...s, lines: s.lines.map((l) => (l.key === key ? { ...l, checked: !l.checked } : l)) })),
    [],
  );
  const remove = useCallback((key: string) => update((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) })), []);
  const clear = useCallback(() => {
    update((s) => ({ ...s, lines: [] }));
    setLangkah("keranjang");
  }, []);
  const setPemesan = useCallback((patch: Partial<Pemesan>) => setPemesanState((p) => ({ ...p, ...patch })), []);

  const api = useMemo<CartApi>(
    () => ({
      lines: data.lines,
      ready,
      add,
      setQty,
      toggle,
      remove,
      clear,
      drawerOpen,
      setDrawerOpen,
      detail,
      setDetail,
      lastAdded,
      langkah,
      setLangkah,
      pemesan,
      setPemesan,
    }),
    [data, ready, add, setQty, toggle, remove, clear, drawerOpen, detail, lastAdded, langkah, pemesan, setPemesan],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
