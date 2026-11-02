import { getMenuById } from "../data/source";
import { clampQty, lineKey, normalAddOns, type CartLine } from "./cart";

/**
 * Penyimpanan keranjang di luar React (dipakai lewat useSyncExternalStore).
 * Hanya isi keranjang (menu, add-on, jumlah) yang disimpan di localStorage browser.
 * Data diri pemesan TIDAK disimpan.
 */
export interface CartData {
  lines: CartLine[];
}

const KEY = "dapoeruni:keranjang:v2";
const KEY_LAMA = "dapoeruni:keranjang:v1";
const EMPTY: CartData = { lines: [] };

let state: CartData = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartData {
  if (!raw) return EMPTY;
  const d = JSON.parse(raw) as { lines?: unknown };
  const byKey = new Map<string, CartLine>();
  for (const l of Array.isArray(d.lines) ? d.lines : []) {
    if (!l || typeof l !== "object") continue;
    const { id, qty, checked, addOns } = l as Partial<CartLine>;
    if (typeof id !== "string" || !getMenuById(id)) continue;
    const ao = normalAddOns(Array.isArray(addOns) ? addOns.filter((x): x is string => typeof x === "string") : []);
    const key = lineKey(id, ao);
    const prev = byKey.get(key);
    byKey.set(key, {
      key,
      id,
      addOns: ao,
      qty: clampQty((prev?.qty ?? 0) + (typeof qty === "number" ? qty : 1)),
      checked: checked !== false,
    });
  }
  return { lines: [...byKey.values()] };
}

function read(): CartData {
  try {
    const now = window.localStorage.getItem(KEY);
    if (now) return parse(now);
    const lama = window.localStorage.getItem(KEY_LAMA); // format lama (tanpa add-on)
    if (lama) {
      window.localStorage.removeItem(KEY_LAMA); // juga membuang tanggal/catatan lama
      return parse(lama);
    }
    return EMPTY;
  } catch {
    return EMPTY; // storage diblokir / data rusak: mulai kosong
  }
}

function emit() {
  for (const l of listeners) l();
}

export function getSnapshot(): CartData {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = read();
  }
  return state;
}

export function getServerSnapshot(): CartData {
  return EMPTY;
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    state = read(); // sinkron dengan tab lain
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function update(fn: (s: CartData) => CartData): void {
  state = fn(getSnapshot());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* abaikan: keranjang tetap jalan tanpa disimpan */
  }
  emit();
}
