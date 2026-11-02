import type { Settings } from "./types";

// Semua teks bisnis & kontak ada di sini, bukan di komponen.
// Aturan gaya: tanpa em dash. Rentang angka memakai en dash (mis. 10–19 kotak).
export const settings: Settings = {
  namaBrand: "Dapoer Uni",
  kota: "Surabaya",
  whatsapp: "6285733045249",
  instagram: "dapoerunisurabaya",

  tiers: [
    {
      id: "hemat",
      nama: "Hemat",
      deskripsi: "Pas untuk Jumat Berkah dan konsumsi ringan.",
      foto: "hemat",
      fotoAlt: "Mangkuk nasi dengan tahu, abon, timun, dan sambal",
      fotoBulat: true,
    },
    {
      id: "rakyat",
      nama: "Rakyat",
      deskripsi: "Ada ayamnya, tetap ramah budget.",
      foto: "rakyat",
      fotoAlt: "Rice bowl ayam krispi saus dengan wortel dan buncis",
      fotoBulat: true,
    },
    {
      id: "juragan",
      nama: "Juragan",
      deskripsi: "Lengkap untuk syukuran, pengajian, dan acara kantor.",
      foto: "juragan",
      fotoAlt: "Nasi kotak kraft berisi nasi daun pisang, ayam bumbu, bihun, sambal, dan kering tempe",
    },
    {
      id: "sultan",
      nama: "Sultan",
      deskripsi: "Untuk tamu istimewa dan acara besar.",
      foto: "sultan",
      fotoAlt: "Besek bambu berpita berisi ayam panggang, telur, dan lalapan",
    },
  ],

  hero: {
    subjudul: "Katering rumahan halal · min. 10 kotak · order H-3",
    stiker: "Surabaya · Katering rumahan",
  },

  paket: {
    judul: "Paket Nasi Kotak",
    intro:
      "Dari konsumsi ringan sampai jamuan istimewa, semua dimasak sesuai pesanan. Minimal 10 kotak, boleh campur varian dalam satu tingkat.",
  },

  menuPage: {
    judul: "Pilihan Nasi Kotak",
    intro:
      "Empat tingkat paket, harga per kotak. Minimal 10 kotak, boleh campur varian dalam satu tingkat. Ongkir tidak termasuk, dikirim via GoFood sesuai jarak.",
  },

  nilai: ["Rumahan", "Halal", "Sesuai Budget"],
  cerita:
    "Dapoer Uni adalah katering rumahan halal di Surabaya. Setiap kotak dimasak sesuai pesanan, dengan isi yang bisa diatur sesuai budget, untuk arisan, syukuran, pengajian, rapat kantor, sampai berbagi di hari Jumat.",
  tentang: {
    eyebrow: "Tentang Kami",
    nilaiDetail: [
      { judul: "Rumahan", teks: "Masakan rumahan yang dimasak sesuai pesanan untuk setiap acara." },
      { judul: "Halal", teks: "Katering halal untuk pengajian, syukuran, arisan, sampai rapat kantor." },
      { judul: "Sesuai Budget", teks: "Empat tingkat paket mulai {hargaMin} per kotak, atau paket custom sesuai budget Anda." },
    ],
  },

  custom: {
    eyebrow: "Paket Custom",
    judul: "Atur budget sendiri? Bisa dong.",
    teks: "Berikan budget Anda, kami siap membantu menyesuaikan isi kotak dan menunya.",
    tombol: "Konsultasi Paket Custom",
  },

  penutup: {
    judul: "Siap pesan untuk acara Anda?",
    teks: "Chat WhatsApp untuk pesan atau tanya menu. Pesan paling lambat H-3 sebelum acara.",
  },

  ketentuanIntro: "Biar pesanan aman dan tepat waktu, mohon perhatikan ini dulu.",
  ketentuan: [
    { judul: "Minimal order", isi: "10 kotak untuk semua paket. Boleh campur varian dalam satu tingkat." },
    { judul: "Batas pesan", isi: "Paling lambat H-3 sebelum acara." },
    { judul: "Ongkir", isi: "Tidak termasuk harga. Dikirim via GoFood, tarif sesuai jarak, dibayar pemesan." },
    { judul: "Harga 20+ kotak", isi: "Hanya berlaku untuk menu yang mencantumkannya." },
    { judul: "Halal & rumahan", isi: "Masakan rumahan, dimasak sesuai pesanan." },
  ],

  caraOrderIntro: "Pesan langsung lewat WhatsApp, paling lambat H-3 sebelum acara.",
  langkahOrder: [
    { judul: "Pilih menu", teks: "Lihat paket di katalog dan pilih yang pas untuk acara Anda." },
    { judul: "Chat WhatsApp", teks: "Tekan tombol pesan, pesan otomatis langsung terisi." },
    { judul: "Konfirmasi jumlah & tanggal", teks: "Sebutkan jumlah kotak dan tanggal acara, paling lambat H-3." },
    { judul: "Dikirim via GoFood", teks: "Pesanan diantar ke lokasi, ongkir sesuai jarak." },
  ],

  jumatBerkah: {
    eyebrow: "Berbagi setiap Jumat",
    judul: "Jumat Berkah",
    paragraf: [
      "Ingin berbagi nasi kotak di hari Jumat? Pesan saja jumlahnya, Dapoer Uni bantu salurkan ke masjid.",
      "Paket Hemat cocok untuk Jumat Berkah. Minimal 10 kotak, pesan paling lambat H-3.",
    ],
    stiker: ["Rumahan", "Halal", "Berkah"],
  },

  // Harga add-on dari pemilik, dihitung per kotak.
  addOns: [
    { id: "air-gelas", nama: "Air putih gelas", harga: 1000 },
    { id: "kerupuk-udang", nama: "Kerupuk udang", harga: 2000 },
    { id: "kerupuk-finna", nama: "Kerupuk Finna", harga: 2000 },
    { id: "perkedel", nama: "Perkedel", harga: 3000 },
    { id: "peyek", nama: "Peyek", harga: 3000 },
    { id: "air-600", nama: "Air putih 600 ml", harga: 5000 },
  ],

  checkout: {
    dpPersen: 50,
    metodeBayar: ["Tunai", "Non-tunai"],
    catatanBayar:
      "Belum ada pembayaran di website. Setelah invoice dikirim, admin Dapoer Uni akan mengonfirmasi pesanan, ongkir, dan cara pembayaran DP lewat WhatsApp.",
  },

  // Isi hanya dengan testimoni asli pelanggan yang sudah memberi izin.
  testimoni: [],

  instagramFoto: [
    { src: "/images/ig/1-600.webp", alt: "Tumpeng nasi kuning Dapoer Uni dilihat dari atas" },
    { src: "/images/ig/4-600.webp", alt: "Kotak berisi roti goreng" },
    { src: "/images/ig/2-600.webp", alt: "Deretan nasi kuning dalam kotak kraft" },
    { src: "/images/ig/3-600.webp", alt: "Rice bowl dengan kemangi dan timun" },
    { src: "/images/ig/5-600.webp", alt: "Puluhan nasi kotak siap antar" },
    { src: "/images/ig/6-600.webp", alt: "Tumpeng mini dengan lauk" },
  ],

  footerInfo: ["Surabaya", "Order paling lambat H-3", "Min. 10 kotak · ongkir via GoFood"],

  pesanWA: {
    umum: "Halo Dapoer Uni, saya lihat dari website. Mau tanya katering.",
    menu: "Halo Dapoer Uni, saya lihat dari website. Mau pesan *{nama}* (Paket {tingkat}) untuk ___ kotak, tanggal ___.",
    jumatBerkah:
      "Halo Dapoer Uni, saya lihat dari website. Mau pesan nasi Jumat Berkah ___ kotak untuk Jumat tanggal ___.",
    custom:
      "Halo Dapoer Uni, saya lihat dari website. Mau pesan paket custom dengan budget Rp___ per kotak untuk ___ kotak, tanggal ___.",
    checkout: "Halo Dapoer Uni, saya lihat dari website. Berikut invoice pesanan saya:",
  },
};
