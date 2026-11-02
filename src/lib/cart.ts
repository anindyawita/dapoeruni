import { createContext, useContext } from "react";
import {
  getAddOn,
  getAddOns,
  getMenuById,
  getSettings,
  getTierInfo,
  TIER_ORDER,
  type AddOn,
  type MenuItem,
  type Tier,
} from "../data/source";

/**
 * Satu baris keranjang = satu menu + kombinasi add-on.
 * Menu sama dengan add-on berbeda menjadi baris terpisah.
 */
export interface CartLine {
  key: string;
  id: string;
  addOns: string[];
  qty: number;
  checked: boolean;
}

/** Data pemesan: hanya disimpan di memori (tidak di localStorage, tidak dikirim ke server). */
export interface Pemesan {
  nama: string;
  wa: string;
  alamat: string;
  tanggal: string;
  jam: string;
  catatan: string;
  metode: string;
}

export type Langkah = "keranjang" | "data" | "invoice";

export interface CartApi {
  lines: CartLine[];
  /** true setelah render pertama di browser (keranjang dari localStorage sudah terbaca) */
  ready: boolean;
  /** tambah menu + add-on; kalau kombinasi yang sama sudah ada, jumlahnya ditambahkan */
  add: (id: string, qty: number, addOns: string[]) => void;
  setQty: (key: string, qty: number) => void;
  toggle: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  detail: MenuItem | null;
  setDetail: (m: MenuItem | null) => void;
  /** baris terakhir yang dimasukkan (untuk umpan balik singkat) */
  lastAdded: { id: string; at: number } | null;
  langkah: Langkah;
  setLangkah: (l: Langkah) => void;
  pemesan: Pemesan;
  setPemesan: (patch: Partial<Pemesan>) => void;
}

export const CartContext = createContext<CartApi | null>(null);

export function useCart(): CartApi {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart harus dipakai di dalam CartProvider");
  return c;
}

export const QTY_MAX = 999;

export function clampQty(n: number): number {
  return Math.min(QTY_MAX, Math.max(1, Math.round(n) || 1));
}

/** Add-on valid saja, tanpa duplikat, urut sesuai daftar di settings. */
export function normalAddOns(ids: string[]): string[] {
  const set = new Set(ids);
  return getAddOns()
    .filter((a) => set.has(a.id))
    .map((a) => a.id);
}

export function lineKey(id: string, addOns: string[]): string {
  return `${id}|${normalAddOns(addOns).join(",")}`;
}

export function addOnList(ids: string[]): AddOn[] {
  return ids.map((id) => getAddOn(id)).filter((a): a is AddOn => !!a);
}

export function addOnPerKotak(ids: string[]): number {
  return addOnList(ids).reduce((n, a) => n + a.harga, 0);
}

/** Harga dasar per kotak; harga 20+ berlaku bila total kotak menu tsb ≥ 20 (gabungan semua varian add-on). */
export function hargaDasar(item: MenuItem, kotakMenu: number): number | null {
  if (item.harga === null) return null;
  return item.harga20plus !== undefined && kotakMenu >= 20 ? item.harga20plus : item.harga;
}

export interface CartRow {
  line: CartLine;
  item: MenuItem;
  addOns: AddOn[];
  dasar: number | null;
  addOn: number;
  satuan: number | null;
  subtotal: number | null;
  pakai20: boolean;
}

export interface CartGroup {
  tier: Tier;
  nama: string;
  rows: CartRow[];
  /** total kotak yang dicentang di tingkat ini */
  kotak: number;
  /** kekurangan dari minimal order (0 = aman) */
  kurang: number;
  minimal: number;
}

export interface Ringkasan {
  groups: CartGroup[];
  totalKotak: number;
  totalHarga: number;
  dp: number;
  sisa: number;
  jumlahDicentang: number;
  adaHargaMenyusul: boolean;
  bisaCheckout: boolean;
  alasan: string | null;
}

/** Hitung isi keranjang: kelompok per tingkat, harga + add-on, total, DP, dan cek minimal order per tingkat. */
export function ringkas(lines: CartLine[]): Ringkasan {
  const kotakPerMenu = new Map<string, number>();
  for (const l of lines) if (l.checked) kotakPerMenu.set(l.id, (kotakPerMenu.get(l.id) ?? 0) + l.qty);

  const groups: CartGroup[] = [];
  let totalKotak = 0;
  let totalHarga = 0;
  let jumlahDicentang = 0;
  let adaHargaMenyusul = false;

  for (const tier of TIER_ORDER) {
    const rows: CartRow[] = [];
    for (const line of lines) {
      const item = getMenuById(line.id);
      if (!item || item.tier !== tier) continue;
      const dasar = hargaDasar(item, line.checked ? (kotakPerMenu.get(item.id) ?? line.qty) : line.qty);
      const addOn = addOnPerKotak(line.addOns);
      const satuan = dasar === null ? null : dasar + addOn;
      rows.push({
        line,
        item,
        addOns: addOnList(line.addOns),
        dasar,
        addOn,
        satuan,
        subtotal: satuan === null ? null : satuan * line.qty,
        pakai20: dasar !== null && dasar !== item.harga,
      });
    }
    if (!rows.length) continue;
    const checked = rows.filter((r) => r.line.checked);
    const kotak = checked.reduce((n, r) => n + r.line.qty, 0);
    const minimal = checked.length ? Math.max(...checked.map((r) => r.item.minimalOrder)) : 0;
    for (const r of checked) {
      jumlahDicentang++;
      if (r.subtotal === null) adaHargaMenyusul = true;
      else totalHarga += r.subtotal;
    }
    totalKotak += kotak;
    groups.push({
      tier,
      nama: getTierInfo(tier).nama,
      rows,
      kotak,
      minimal,
      kurang: checked.length ? Math.max(0, minimal - kotak) : 0,
    });
  }

  let alasan: string | null = null;
  const kurang = groups.find((g) => g.kurang > 0);
  if (!jumlahDicentang) alasan = "Centang minimal satu menu untuk checkout.";
  else if (kurang)
    alasan = `Paket ${kurang.nama} kurang ${kurang.kurang} kotak lagi (minimal ${kurang.minimal} kotak per tingkat, boleh campur varian).`;

  const dp = Math.ceil((totalHarga * getSettings().checkout.dpPersen) / 100);
  return {
    groups,
    totalKotak,
    totalHarga,
    dp,
    sisa: totalHarga - dp,
    jumlahDicentang,
    adaHargaMenyusul,
    bisaCheckout: alasan === null,
    alasan,
  };
}
