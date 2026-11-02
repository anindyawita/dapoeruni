const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 17000 → "Rp17.000" (tanpa spasi, sesuai gaya penulisan di web). */
export function formatRupiah(n: number): string {
  return rupiah.format(n).replace(/\s/g, "");
}

/** Rentang harga: "Rp10.000–11.000", atau satu harga bila sama. */
export function formatRentang(min: number | null, max: number | null): string | null {
  if (min === null || max === null) return null;
  if (min === max) return formatRupiah(min);
  return `${formatRupiah(min)}–${formatRupiah(max).replace("Rp", "")}`;
}

/** "2026-11-12" → "Kamis, 12 November 2026" */
export function formatTanggal(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Tanggal paling cepat untuk pesanan (H-3), format yyyy-mm-dd. */
export function tanggalMinimal(hariLagi = 3): string {
  const d = new Date();
  d.setDate(d.getDate() + hariLagi);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** "Ayam Panggang Rujak" → "AP" */
export function inisial(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}
