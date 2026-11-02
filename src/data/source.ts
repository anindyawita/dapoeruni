// Satu-satunya pintu data untuk komponen.
// Tahap berikutnya: ganti isi getMenu() agar membaca CSV Google Sheets
// (kolom: tingkat, nama, isi, harga, harga_20plus, minimal_order, foto, tersedia, urutan)
// dengan fallback ke data lokal bila gagal dimuat.
import { menu } from "./menu";
import { settings } from "./settings";
import type { AddOn, MenuItem, Settings, Tier, TierInfo } from "./types";

export type { AddOn, Ketentuan, MenuItem, Settings, Tier, TierInfo } from "./types";

export const TIER_ORDER: Tier[] = ["hemat", "rakyat", "juragan", "sultan"];

/** Menu yang tersedia saja, terurut. */
export function getMenu(): MenuItem[] {
  return menu.filter((m) => m.tersedia).sort((a, b) => a.urutan - b.urutan);
}

export function getSettings(): Settings {
  return settings;
}

export function getTierInfo(tier: Tier): TierInfo {
  const info = settings.tiers.find((t) => t.id === tier);
  if (!info) throw new Error(`Tingkat tidak dikenal: ${tier}`);
  return info;
}

export interface TierSummary extends TierInfo {
  /** harga normal termurah & termahal (tanpa harga 20+), null bila belum ada harga */
  min: number | null;
  max: number | null;
  jumlah: number;
}

export function getAddOns(): AddOn[] {
  return settings.addOns;
}

export function getAddOn(id: string): AddOn | undefined {
  return settings.addOns.find((a) => a.id === id);
}

export function getMenuById(id: string): MenuItem | undefined {
  return getMenu().find((m) => m.id === id);
}

/**
 * Penjelasan menu. Pakai `deskripsi` dari data bila ada; kalau kosong,
 * disusun dari fakta yang sudah ada (tingkat + isi kotak), tanpa klaim tambahan.
 */
export function getDeskripsi(item: MenuItem): string {
  if (item.deskripsi) return item.deskripsi;
  const tier = getTierInfo(item.tier);
  const isi = item.isi.map((x, i) => (i === 0 ? x.charAt(0).toLowerCase() + x.slice(1) : x));
  const daftar = isi.length > 1 ? `${isi.slice(0, -1).join(", ")}, dan ${isi[isi.length - 1]}` : isi[0];
  const kalimatTier = tier.deskripsi.charAt(0).toLowerCase() + tier.deskripsi.slice(1);
  return `${item.nama} termasuk Paket ${tier.nama}, ${kalimatTier} Satu kotak berisi ${daftar}.`;
}

/** Harga normal termurah dari seluruh menu (untuk teks "mulai Rp..."). */
export function getHargaMin(): number | null {
  const prices = getMenu()
    .map((m) => m.harga)
    .filter((h): h is number => h !== null);
  return prices.length ? Math.min(...prices) : null;
}

/** Ringkasan per tingkat, dihitung dari data menu supaya selalu sinkron. */
export function getTierSummaries(): TierSummary[] {
  const items = getMenu();
  return TIER_ORDER.map((id) => {
    const list = items.filter((m) => m.tier === id);
    const prices = list.map((m) => m.harga).filter((h): h is number => h !== null);
    return {
      ...getTierInfo(id),
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
      jumlah: list.length,
    };
  });
}
