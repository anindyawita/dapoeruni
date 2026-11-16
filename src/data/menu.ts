import raw from "../../public/menu.json";
import type { MenuItem, Tier } from "./types";

// Sumber kebenaran tahap ini: public/menu.json (diisi pemilik).
// Jangan diimpor langsung oleh komponen, gunakan getMenu() dari ./source.

interface MenuJson {
  id: string;
  tier: string;
  nama: string;
  deskripsi: string;
  isi: string[];
  harga: number | null;
  harga20plus: number | null;
  satuan: string;
  minimalOrder: number;
  porsi?: number;
  kemasan: string | null;
  foto: { src: string; placeholder: boolean };
  label: string | null;
  catatan: string | null;
  tersedia: boolean;
  urutan: number;
}

// Foto asli yang sudah ada di public/images/menu/{id}-400.webp.
// menu.json menandai semua foto sebagai placeholder; tambahkan id di sini bila foto barunya sudah diunggah.
const ADA_FOTO = new Set(["ayam-krispi-mini", "rice-bowl", "nasi-campur", "sultan-panggang"]);

export const menu: MenuItem[] = (raw as MenuJson[]).map((x) => ({
  id: x.id,
  tier: x.tier as Tier,
  nama: x.nama,
  deskripsi: x.deskripsi,
  isi: x.isi,
  harga: x.harga,
  harga20plus: x.harga20plus ?? undefined,
  satuan: x.satuan,
  minimalOrder: x.minimalOrder,
  porsi: x.porsi,
  kemasan: x.kemasan ?? undefined,
  catatan: x.catatan ?? undefined,
  label: x.label ?? undefined,
  foto: !x.foto.placeholder || ADA_FOTO.has(x.id) ? x.id : undefined,
  tersedia: x.tersedia,
  urutan: x.urutan,
}));
