import { getSettings, getTierInfo, type MenuItem } from "../data/source";
import type { Pemesan, Ringkasan } from "./cart";
import { teksInvoice } from "./invoice";

function link(pesan: string): string {
  return `https://wa.me/${getSettings().whatsapp}?text=${encodeURIComponent(pesan)}`;
}

/** Tombol umum: header, hero, footer, floating. */
export function waUmum(): string {
  return link(getSettings().pesanWA.umum);
}

/** Tombol per menu. */
export function waMenu(item: MenuItem): string {
  const pesan = getSettings()
    .pesanWA.menu.replace("{nama}", item.nama)
    .replace("{tingkat}", getTierInfo(item.tier).nama);
  return link(pesan);
}

export function waJumatBerkah(): string {
  return link(getSettings().pesanWA.jumatBerkah);
}

export function waCustom(): string {
  return link(getSettings().pesanWA.custom);
}

/** Kirim invoice keranjang (hanya menu yang dicentang) ke WhatsApp Dapoer Uni. */
export function waInvoice(r: Ringkasan, p: Pemesan, nomor: string, dibuat: Date): string {
  return link(teksInvoice(r, p, nomor, dibuat));
}

export function igUrl(): string {
  return `https://www.instagram.com/${getSettings().instagram}/`;
}

/** Atribut standar untuk tautan eksternal. */
export const external = { target: "_blank", rel: "noopener" } as const;
