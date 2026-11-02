import { createContext, useContext } from "react";
import { getMenuById, getTierInfo, TIER_ORDER, type MenuItem, type Tier } from "../data/source";

/** Satu baris keranjang. `checked` = ikut dikirim saat checkout. */
export interface CartLine {
  id: string;
  qty: number;
  checked: boolean;
}

export interface CartApi {
  lines: CartLine[];
  /** true setelah data keranjang dari localStorage selesai dibaca */
  ready: boolean;
  /** tambah menu atau ganti jumlahnya bila sudah ada */
  upsert: (id: string, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  tanggal: string;
  setTanggal: (v: string) => void;
  catatan: string;
  setCatatan: (v: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  detail: MenuItem | null;
  setDetail: (m: MenuItem | null) => void;
  /** menu terakhir yang dimasukkan (untuk umpan balik singkat) */
  lastAdded: { id: string; at: number } | null;
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

/** Harga per kotak sesuai jumlah: harga 20+ hanya untuk menu yang punya harga20plus. */
export function hargaSatuan(item: MenuItem, qty: number): number | null {
  if (item.harga === null) return null;
  return item.harga20plus !== undefined && qty >= 20 ? item.harga20plus : item.harga;
}

export interface CartRow {
  line: CartLine;
  item: MenuItem;
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
  jumlahDicentang: number;
  adaHargaMenyusul: boolean;
  bisaCheckout: boolean;
  alasan: string | null;
}

/** Hitung isi keranjang: kelompok per tingkat, total, dan cek minimal 10 kotak per tingkat. */
export function ringkas(lines: CartLine[]): Ringkasan {
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
      const satuan = hargaSatuan(item, line.qty);
      rows.push({
        line,
        item,
        satuan,
        subtotal: satuan === null ? null : satuan * line.qty,
        pakai20: satuan !== null && satuan !== item.harga,
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
    groups.push({ tier, nama: getTierInfo(tier).nama, rows, kotak, minimal, kurang: checked.length ? Math.max(0, minimal - kotak) : 0 });
  }

  let alasan: string | null = null;
  const kurang = groups.find((g) => g.kurang > 0);
  if (!jumlahDicentang) alasan = "Centang minimal satu menu untuk checkout.";
  else if (kurang)
    alasan = `Paket ${kurang.nama} kurang ${kurang.kurang} kotak lagi (minimal ${kurang.minimal} kotak per tingkat, boleh campur varian).`;

  return { groups, totalKotak, totalHarga, jumlahDicentang, adaHargaMenyusul, bisaCheckout: alasan === null, alasan };
}
