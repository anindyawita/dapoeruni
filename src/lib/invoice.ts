import { getSettings, getTierInfo } from "../data/source";
import type { Pemesan, Ringkasan } from "./cart";
import { formatRupiah, formatTanggal } from "./format";

const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I agar mudah dibaca

/** Nomor invoice sementara, mis. "DU-261102-7K3F". Dibuat di browser, tanpa server. */
export function buatNomorInvoice(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const tgl = `${String(now.getFullYear()).slice(2)}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const acak = new Uint8Array(4);
  crypto.getRandomValues(acak);
  const kode = [...acak].map((b) => HURUF[b % HURUF.length]).join("");
  return `DU-${tgl}-${kode}`;
}

/** Tanggal hari ini dalam format yyyy-mm-dd (zona waktu perangkat). */
export function hariIni(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Bersihkan isian bebas sebelum masuk pesan: rapikan spasi, buang karakter kontrol. */
export function bersih(s: string, max = 300): string {
  const tanpaKontrol = [...s]
    .filter((c) => {
      const k = c.codePointAt(0) ?? 0;
      return k === 10 || (k >= 32 && k !== 127); // sisakan baris baru, buang karakter kontrol lain
    })
    .join("");
  return tanpaKontrol
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

/** Isi pesan invoice untuk dikirim ke WhatsApp Dapoer Uni. */
export function teksInvoice(r: Ringkasan, p: Pemesan, nomor: string, dibuat: Date): string {
  const s = getSettings();
  const b: string[] = [s.pesanWA.checkout, ""];
  b.push(`*INVOICE ${nomor}*`);
  b.push(`Dibuat: ${formatTanggal(hariIni(dibuat))}`);
  b.push("");
  b.push("*Data pemesan*");
  b.push(`Nama: ${bersih(p.nama, 60)}`);
  b.push(`No. WhatsApp: ${bersih(p.wa, 20)}`);
  b.push(`Alamat kirim: ${bersih(p.alamat, 200)}`);
  b.push(`Tanggal acara: ${p.tanggal ? formatTanggal(p.tanggal) : "___"}${p.jam ? `, jam ${p.jam}` : ""}`);
  b.push("");
  b.push("*Pesanan*");
  let no = 1;
  for (const g of r.groups) {
    for (const x of g.rows) {
      if (!x.line.checked) continue;
      b.push(`${no++}. ${x.item.nama} (Paket ${getTierInfo(x.item.tier).nama}), ${x.line.qty} ${x.item.satuan}`);
      if (x.addOns.length) b.push(`   Add-on: ${x.addOns.map((a) => `${a.nama} (+${formatRupiah(a.harga)})`).join(", ")}`);
      if (x.satuan === null) {
        b.push("   Harga: menyusul");
      } else {
        const rincian = x.addOn
          ? `${formatRupiah(x.dasar ?? 0)}${x.pakai20 ? " harga 20+" : ""} + add-on ${formatRupiah(x.addOn)} = ${formatRupiah(x.satuan)}`
          : `${formatRupiah(x.satuan)}${x.pakai20 ? " (harga 20+)" : ""}`;
        b.push(`   ${rincian} per ${x.item.satuan}`);
        b.push(`   Subtotal: ${formatRupiah(x.subtotal ?? 0)}`);
      }
    }
  }
  b.push("");
  b.push(`Total: ${r.totalKotak} kotak, ${formatRupiah(r.totalHarga)}${r.adaHargaMenyusul ? " + menu harga menyusul" : ""}`);
  b.push(`DP ${s.checkout.dpPersen}%: ${formatRupiah(r.dp)}`);
  b.push(`Sisa pelunasan: ${formatRupiah(r.sisa)}`);
  b.push(`Metode pembayaran: ${p.metode}`);
  b.push("Ongkir: dihitung admin sesuai jarak (belum termasuk).");
  if (p.catatan.trim()) {
    b.push("");
    b.push(`Catatan: ${bersih(p.catatan, 300)}`);
  }
  b.push("");
  b.push("Mohon konfirmasi pesanan dan info pembayaran DP. Terima kasih.");
  return b.join("\n");
}
