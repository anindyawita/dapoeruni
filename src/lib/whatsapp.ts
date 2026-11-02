import { getSettings, getTierInfo, type MenuItem } from "../data/source";
import type { Ringkasan } from "./cart";
import { formatRupiah, formatTanggal } from "./format";

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

/** Pesan checkout keranjang: hanya menu yang dicentang. */
export function waCheckout(r: Ringkasan, tanggal: string, catatan: string): string {
  const baris: string[] = [getSettings().pesanWA.checkout, ""];
  for (const g of r.groups) {
    const rows = g.rows.filter((x) => x.line.checked);
    if (!rows.length) continue;
    baris.push(`*Paket ${g.nama}*`);
    for (const x of rows) {
      const harga =
        x.satuan === null
          ? "harga menyusul"
          : `${x.line.qty} x ${formatRupiah(x.satuan)}${x.pakai20 ? " (harga 20+)" : ""} = ${formatRupiah(x.subtotal ?? 0)}`;
      baris.push(`- ${x.item.nama}: ${x.line.qty} kotak, ${harga}`);
    }
    baris.push("");
  }
  baris.push(
    `Total: ${r.totalKotak} kotak, ${formatRupiah(r.totalHarga)}${r.adaHargaMenyusul ? " + menu harga menyusul" : ""} (belum termasuk ongkir GoFood)`,
  );
  baris.push(`Tanggal acara: ${tanggal ? formatTanggal(tanggal) : "___"}`);
  if (catatan.trim()) baris.push(`Catatan: ${catatan.trim()}`);
  return link(baris.join("\n"));
}

export function igUrl(): string {
  return `https://www.instagram.com/${getSettings().instagram}/`;
}

/** Atribut standar untuk tautan eksternal. */
export const external = { target: "_blank", rel: "noopener" } as const;
