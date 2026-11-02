import { getMenuById } from "../data/source";
import { clampQty, type CartLine } from "./cart";

/**
 * Penyimpanan keranjang di luar React (dipakai lewat useSyncExternalStore).
 * Data hanya disimpan di localStorage browser pengunjung.
 */
export interface CartData {
  lines: CartLine[];
  tanggal: string;
  catatan: string;
}

const KEY = "dapoeruni:keranjang:v1";
const EMPTY: CartData = { lines: [], tanggal: "", catatan: "" };

let state: CartData = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const d = JSON.parse(raw) as Partial<CartData>;
    const lines = (Array.isArray(d.lines) ? d.lines : [])
      .filter((l): l is CartLine => !!l && typeof l.id === "string" && !!getMenuById(l.id))
      .map((l) => ({ id: l.id, qty: clampQty(l.qty), checked: l.checked !== false }));
    return {
      lines,
      tanggal: typeof d.tanggal === "string" ? d.tanggal : "",
      catatan: typeof d.catatan === "string" ? d.catatan : "",
    };
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
