export type Tier = "hemat" | "rakyat" | "juragan" | "sultan";

export interface MenuItem {
  id: string; // slug, mis. "ayam-panggang-rujak"
  tier: Tier;
  nama: string;
  isi: string[]; // daftar isi kotak, ditampilkan sebagai chip
  harga: number | null; // null = "Harga menyusul"
  harga20plus?: number; // harga khusus untuk 20 kotak ke atas (opsional)
  minimalOrder: number; // default 10
  foto?: string; // nama file di public/images/menu tanpa ukuran & ekstensi; kosong = placeholder
  tersedia: boolean; // false = disembunyikan dari katalog
  urutan: number;
  label?: string; // opsional, mis. "Acara anak", hanya jika benar
  deskripsi?: string; // opsional; kosong = penjelasan dibuat otomatis dari tingkat & isi
}

export interface TierInfo {
  id: Tier;
  nama: string;
  deskripsi: string;
  /** foto cut-out untuk lingkaran paket di beranda (public/images/paket) */
  foto: string;
  fotoAlt: string;
  /** mangkuk lebih bulat, butuh ruang sedikit lebih besar di lingkaran */
  fotoBulat?: boolean;
}

/** Add-on per kotak, dipilih di detail menu. */
export interface AddOn {
  id: string;
  nama: string;
  harga: number; // per kotak
}

export interface Ketentuan {
  judul: string;
  isi: string;
}

export interface Settings {
  namaBrand: string;
  kota: string;
  whatsapp: string; // format internasional tanpa "+" dan spasi
  instagram: string; // tanpa "@"
  tiers: TierInfo[];
  hero: { subjudul: string; stiker: string };
  paket: { judul: string; intro: string };
  menuPage: { judul: string; intro: string };
  nilai: string[];
  cerita: string;
  tentang: {
    eyebrow: string;
    /** {hargaMin} diganti otomatis dengan harga termurah dari data menu */
    nilaiDetail: { judul: string; teks: string }[];
  };
  custom: { eyebrow: string; judul: string; teks: string; tombol: string };
  penutup: { judul: string; teks: string };
  ketentuan: Ketentuan[];
  ketentuanIntro: string;
  langkahOrder: { judul: string; teks: string }[];
  caraOrderIntro: string;
  jumatBerkah: { eyebrow: string; judul: string; paragraf: string[]; stiker: string[] };
  addOns: AddOn[];
  checkout: {
    dpPersen: number; // DP dari total pesanan (tanpa ongkir)
    metodeBayar: string[]; // pilihan saja, tidak ada pembayaran di website
    catatanBayar: string;
  };
  testimoni: { teks: string; nama: string }[]; // kosong = kartu placeholder
  instagramFoto: { src: string; alt: string }[];
  footerInfo: string[];
  pesanWA: {
    umum: string;
    menu: string; // placeholder {nama} dan {tingkat}
    jumatBerkah: string;
    custom: string;
    /** pembuka pesan invoice keranjang */
    checkout: string;
  };
}
