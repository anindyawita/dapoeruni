import type { MenuItem } from "./types";

// Sumber kebenaran sementara. Jangan diimpor langsung oleh komponen,
// gunakan getMenu() dari ./source.
// `foto` = nama file di public/images/menu (tanpa "-400.webp"). Kosong = placeholder inisial.

const m = (item: Omit<MenuItem, "minimalOrder" | "tersedia"> & Partial<MenuItem>): MenuItem => ({
  minimalOrder: 10,
  tersedia: true,
  ...item,
});

export const menu: MenuItem[] = [
  // Hemat
  m({ id: "telur-kriwil", tier: "hemat", urutan: 1, nama: "Telur Kriwil", harga: 10000,
    isi: ["Nasi", "telur dadar kriwil", "tempe goreng", "timun", "sambal"] }),
  m({ id: "telur-balado", tier: "hemat", urutan: 2, nama: "Telur Balado", harga: 11000,
    isi: ["Nasi", "telur rebus balado", "tempe orek", "timun"] }),
  m({ id: "nasi-kuning-hemat", tier: "hemat", urutan: 3, nama: "Nasi Kuning Hemat", harga: 11000,
    isi: ["Nasi kuning", "telur dadar iris", "kering tempe", "serundeng", "sambal"] }),
  m({ id: "tahu-tempe-penyet", tier: "hemat", urutan: 4, nama: "Tahu Tempe Penyet", harga: 10000,
    isi: ["Nasi", "tahu tempe penyet", "lalapan", "sambal bawang"] }),

  // Rakyat
  m({ id: "ayam-krispi-mini", tier: "rakyat", urutan: 5, nama: "Ayam Krispi Mini", harga: 12000,
    isi: ["Nasi", "ayam krispi kecil", "tempe", "timun", "sambal"], foto: "ayam-krispi-mini" }),
  m({ id: "ayam-suwir", tier: "rakyat", urutan: 6, nama: "Ayam Suwir", harga: 13000,
    isi: ["Nasi", "ayam suwir pedas manis", "telur dadar iris", "timun"] }),
  m({ id: "ayam-geprek-mini", tier: "rakyat", urutan: 7, nama: "Ayam Geprek Mini", harga: 13000,
    isi: ["Nasi", "ayam geprek kecil", "lalapan", "sambal bawang"] }),
  m({ id: "rice-bowl", tier: "rakyat", urutan: 8, nama: "Rice Bowl", harga: 13000,
    isi: ["Nasi", "ayam BBQ/teriyaki suwir", "oseng sayur"], foto: "rice-bowl" }),

  // Juragan
  m({ id: "ayam-panggang-rujak", tier: "juragan", urutan: 9, nama: "Ayam Panggang Rujak",
    harga: 17000, harga20plus: 15000,
    isi: ["Nasi", "ayam panggang bumbu rujak", "urap/oseng buncis wortel", "timun", "sambal"] }),
  m({ id: "ayam-kremes", tier: "juragan", urutan: 10, nama: "Ayam Kremes", harga: 16000,
    isi: ["Nasi", "ayam goreng kremes", "tempe", "lalapan", "sambal"] }),
  m({ id: "ayam-penyet", tier: "juragan", urutan: 11, nama: "Ayam Penyet", harga: 16000,
    isi: ["Nasi", "ayam penyet", "tahu/tempe", "lalapan", "sambal"] }),
  m({ id: "nasi-campur", tier: "juragan", urutan: 12, nama: "Nasi Campur", harga: 17000,
    isi: ["Nasi", "ayam bumbu", "sambal goreng kentang", "mie/bihun", "kering tempe", "kerupuk"],
    foto: "nasi-campur" }),

  // Sultan
  m({ id: "sultan-panggang", tier: "sultan", urutan: 13, nama: "Sultan Panggang", harga: 25000,
    isi: ["Nasi", "ayam panggang rujak potongan besar", "telur balado", "urap", "kerupuk", "buah", "air mineral"],
    foto: "sultan-panggang" }),
  m({ id: "sultan-empal", tier: "sultan", urutan: 14, nama: "Sultan Empal", harga: 30000,
    isi: ["Nasi", "empal daging", "ayam goreng", "sambal goreng kentang", "oseng buncis", "kerupuk", "puding"] }),
  m({ id: "nasi-kuning-sultan", tier: "sultan", urutan: 15, nama: "Nasi Kuning Sultan", harga: 25000,
    isi: ["Nasi kuning", "ayam goreng", "telur balado", "kering tempe", "serundeng daging", "sambal goreng kentang", "kerupuk", "buah"],
    foto: "nasi-kuning-sultan" }),
  m({ id: "bento-sultan", tier: "sultan", urutan: 16, nama: "Bento Sultan", harga: 22000, label: "Untuk acara anak",
    isi: ["Nasi bento", "ayam katsu/nugget", "sosis", "telur gulung", "sayur", "puding"],
    foto: "bento-sultan" }),
];
