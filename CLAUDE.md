# CLAUDE.md: Web Katalog Dapoer Uni

## Ringkasan proyek

Web katalog dua halaman untuk **Dapoer Uni**, katering rumahan halal berbasis cloud kitchen di Surabaya. Tujuan utama: **membuat pengunjung langsung chat WhatsApp untuk pesan**.

- Ada **keranjang + checkout bertahap**: pengunjung memilih menu (boleh dengan **add-on**), mencentang yang mau dipesan, mengisi **data diri** (nama, WA, alamat, tanggal acara, metode bayar **tunai/non-tunai**), melihat **DP 50%** yang dihitung otomatis, lalu **invoice** dikirim ke WhatsApp Dapoer Uni.
- **Tidak ada pembayaran di website** (tidak ada QRIS, payment gateway, transfer otomatis, dsb.) demi keamanan. Pembayaran DP dikonfirmasi admin lewat WhatsApp. Tidak ada akun dan tidak ada backend.
- Instagram: `@dapoerunisurabaya`
- Nomor WhatsApp: `6285733045249` (format internasional, tanpa `+` dan tanpa spasi)
- Bahasa seluruh konten: **Bahasa Indonesia**, gaya santai tapi sopan
- Pengunjung utama: perempuan 25–54 tahun di Surabaya Raya yang memesan untuk acara (arisan, syukuran, pengajian, rapat kantor) dan donatur Jumat Berkah. Mayoritas membuka dari **HP**, biasanya dari link bio Instagram.

Tahap sekarang: **frontend saja**. Data menu disimpan di file lokal. Nanti data akan dibaca dari Google Sheets (CSV yang dipublikasikan), jadi lapisan data dibuat terpisah dan mudah diganti.

## Cara kerja dengan pemilik

- **Jangan membuat rekaman layar / video** kecuali pemilik memintanya. Screenshot untuk pengecekan boleh.
- Harga, add-on, dan teks bisnis hanya dari pemilik. Kalau ada yang belum jelas, tanyakan, jangan mengarang.

## Aturan gaya penulisan

- **Jangan pakai em dash** di konten, judul tab, meta, maupun komentar kode. Pakai titik, koma, titik dua, atau tanda kurung.
- Rentang angka memakai en dash tanpa spasi, sama seperti tabel harga pemilik: `Rp10.000–11.000`, `10–19 kotak`.
- Pemisah pendek di label memakai titik tengah: `min. 10 kotak · order H-3`.

## Stack

- **Vite 8 + React 19 + TypeScript**, dua entry HTML: `index.html` (beranda) dan `menu.html` (katalog). Halaman dipilih lewat `<html data-page="...">` di `src/main.tsx`.
- **Tailwind CSS v4** (`@tailwindcss/vite`). Token warna/font ada di `@theme` pada `src/index.css`; gaya komponen ditulis sebagai kelas di `@layer components` (BEM ringan) supaya mudah dibaca.
- **Prerender saat build**: `vite build --ssr src/entry-server.tsx` lalu `scripts/prerender.mjs` mengisi `<div id="root">` dengan HTML React, kemudian di browser di-`hydrateRoot`. Konten dan foto hero tampil sebelum JavaScript selesai dimuat.
- **Animasi: `motion`** (import dari `motion/react`). **Smooth scroll: `lenis`**.
- **Font self-hosted** lewat `@fontsource-variable` (Bricolage Grotesque, Fraunces italic, Manrope). Jangan memuat Google Fonts.
- Tanpa backend. Build menjadi file statis, deploy ke **Vercel** (`vercel.json`: `cleanUrls`, jadi `/menu` melayani `menu.html`).

Perintah:

```bash
npm install
npm run dev      # development (http://localhost:5173 dan /menu.html)
npm run build    # tsc + build + prerender
npm run preview  # cek hasil build (http://localhost:4173 dan /menu)
npm run lint     # oxlint
```

## Struktur folder

```
index.html, menu.html      # dua halaman (title, meta, OG masing-masing)
scripts/prerender.mjs      # isi HTML statis setelah build
vercel.json
public/
  images/                  # semua foto WebP, beberapa ukuran per foto (srcset)
    hero/ paket/ menu/ deco/ ig/
  og-image.jpg             # gambar preview saat link dibagikan
  favicon.svg, robots.txt
src/
  main.tsx                 # pilih halaman + hydrate
  entry-server.tsx         # render untuk prerender
  App.tsx                  # MotionConfig, SmoothScroll, CartProvider, panel global
  index.css                # token desain + semua gaya komponen
  data/
    types.ts
    menu.ts                # data menu (sumber kebenaran tahap ini)
    settings.ts            # semua teks bisnis, kontak, pesan WA
    source.ts              # getMenu(), getSettings(), dll. Satu-satunya pintu data
  lib/
    whatsapp.ts            # link wa.me + pesan otomatis (umum, menu, Jumat Berkah, custom, invoice)
    invoice.ts             # nomor invoice, isi pesan invoice, pembersih isian
    format.ts              # Rupiah, rentang harga, tanggal, inisial
    cart.ts                # tipe keranjang (menu + add-on), harga 20+, ringkasan, DP, validasi minimal order
    cart-store.ts          # simpan isi keranjang di localStorage (tanpa data diri)
    motion.ts              # token gerak
    smooth-scroll.ts       # konteks Lenis, useAnchorClick, useMediaQuery
    focus-trap.ts          # kunci fokus keyboard di panel
  pages/
    HomePage.tsx, MenuPage.tsx
  components/
    Header, Hero, PaketTeaser, CustomPackage, About, JumatBerkah, Testimonials,
    InstagramStrip, ClosingCTA, Footer, FloatingWA,
    MenuHeader (header "Menu Kami" + intro), TierFilter, MenuGrid, MenuCard, OrderInfo,
    MenuDetail (panel detail), CartProvider, CartDrawer, CartBar, QtyStepper,
    Badge (logo sementara), Reveal, SmoothScroll, icons
```

Komponen **tidak boleh** mengimpor `menu.ts` atau `settings.ts` langsung. Semua data lewat `src/data/source.ts`, supaya nanti cukup mengganti isi `source.ts` untuk membaca Google Sheets.

## Model data

```ts
export type Tier = "hemat" | "rakyat" | "juragan" | "sultan";

export interface MenuItem {
  id: string;            // slug, mis. "ayam-panggang-rujak"
  tier: Tier;
  nama: string;
  isi: string[];         // daftar isi kotak, ditampilkan sebagai chip/list
  harga: number | null;  // null = "Harga menyusul"
  harga20plus?: number;  // harga khusus untuk 20 kotak ke atas (opsional)
  minimalOrder: number;  // default 10
  foto?: string;         // nama file di public/images/menu tanpa "-400.webp"; kosong = placeholder inisial
  tersedia: boolean;     // false = disembunyikan dari katalog
  urutan: number;
  label?: string;        // opsional, mis. "Untuk acara anak", hanya jika benar
  deskripsi?: string;    // opsional; kosong = penjelasan dibuat otomatis dari tingkat + isi
}
```

Kolom ini akan sama dengan kolom Google Sheets nanti: `tingkat, nama, isi, harga, harga_20plus, minimal_order, foto, tersedia, urutan` (plus `deskripsi`, `label` bila dipakai). Pada Sheets, `isi` ditulis dipisah koma.

## Data menu (harga dari pemilik)

| Tingkat | Nama | Isi | Harga per kotak |
|---|---|---|---|
| hemat | Telur Kriwil | Nasi, telur dadar kriwil, tempe goreng, timun, sambal | 10.000 |
| hemat | Telur Balado | Nasi, telur rebus balado, tempe orek, timun | 11.000 |
| hemat | Nasi Kuning Hemat | Nasi kuning, telur dadar iris, kering tempe, serundeng, sambal | 11.000 |
| hemat | Tahu Tempe Penyet | Nasi, tahu tempe penyet, lalapan, sambal bawang | 10.000 |
| rakyat | Ayam Krispi Mini | Nasi, ayam krispi kecil, tempe, timun, sambal | 12.000 |
| rakyat | Ayam Suwir | Nasi, ayam suwir pedas manis, telur dadar iris, timun | 13.000 |
| rakyat | Ayam Geprek Mini | Nasi, ayam geprek kecil, lalapan, sambal bawang | 13.000 |
| rakyat | Rice Bowl | Nasi, ayam BBQ/teriyaki suwir, oseng sayur | 13.000 |
| juragan | Ayam Panggang Rujak | Nasi, ayam panggang bumbu rujak, urap/oseng buncis wortel, timun, sambal | 17.000 (10–19 kotak), 15.000 (20+ kotak) |
| juragan | Ayam Kremes | Nasi, ayam goreng kremes, tempe, lalapan, sambal | 16.000 |
| juragan | Ayam Penyet | Nasi, ayam penyet, tahu/tempe, lalapan, sambal | 16.000 |
| juragan | Nasi Campur | Nasi, ayam bumbu, sambal goreng kentang, mie/bihun, kering tempe, kerupuk | 17.000 |
| sultan | Sultan Panggang | Nasi, ayam panggang rujak potongan besar, telur balado, urap, kerupuk, buah, air mineral | 25.000 |
| sultan | Sultan Empal | Nasi, empal daging, ayam goreng, sambal goreng kentang, oseng buncis, kerupuk, puding | 30.000 |
| sultan | Nasi Kuning Sultan | Nasi kuning, ayam goreng, telur balado, kering tempe, serundeng daging, sambal goreng kentang, kerupuk, buah | 25.000 |
| sultan | Bento Sultan (label "Untuk acara anak") | Nasi bento, ayam katsu/nugget, sosis, telur gulung, sayur, puding | 22.000 |

**Add-on** (harga per kotak, bisa ditambahkan ke menu apa saja, ada di `settings.addOns`):

| Add-on | Harga |
|---|---|
| Air putih gelas | +1.000 |
| Kerupuk udang | +2.000 |
| Kerupuk Finna | +2.000 |
| Perkedel | +3.000 |
| Peyek | +3.000 |
| Air putih 600 ml | +5.000 |

Jangan mengarang harga. Menu baru tanpa harga diisi `null` sehingga tampil "Harga menyusul".

Nama tingkat: **Hemat · Rakyat · Juragan · Sultan**, masing-masing dengan satu kalimat:
- Hemat: "Pas untuk Jumat Berkah dan konsumsi ringan."
- Rakyat: "Ada ayamnya, tetap ramah budget."
- Juragan: "Lengkap untuk syukuran, pengajian, dan acara kantor."
- Sultan: "Untuk tamu istimewa dan acara besar."

Rentang harga per tingkat di beranda dihitung otomatis dari data menu (`getTierSummaries()`).

## Aturan bisnis (wajib tampil di web)

- **Minimal order 10 kotak** per tingkat. Boleh campur varian dalam satu tingkat.
- **Harga 20+ kotak** hanya untuk menu yang punya `harga20plus`. Tampilkan kedua harga dengan jelas, jangan hanya "mulai Rp15.000".
- **Ongkir tidak termasuk harga.** Dikirim via GoFood, tarif sesuai jarak, dibayar pemesan.
- **Pesan paling lambat H-3.**
- Halal, masakan rumahan, dimasak sesuai pesanan.
- **Paket Custom**: pelanggan menyebutkan budget, Dapoer Uni bantu menyesuaikan isi kotak.
- **Add-on** dihitung per kotak: harga per kotak = harga menu + total add-on yang dipilih.
- **DP 50%** dari total pesanan (belum termasuk ongkir), sisanya pelunasan. Metode bayar dipilih pelanggan: Tunai atau Non-tunai. Cara bayar dikonfirmasi admin lewat WhatsApp.
- Kemasan sekarang **tidak memakai sterofoam**. Jangan memakai foto bersterofoam.

Semua teks ini ada di `settings.ts`, bukan di komponen.

## WhatsApp

Semua link membuka `https://wa.me/6285733045249?text=<pesan>` (di-`encodeURIComponent`, `target="_blank" rel="noopener"`). Kalimat "saya lihat dari website" sengaja dipakai supaya chat dari web bisa diberi label di WhatsApp Business.

- Umum (header, hero, footer, tombol mengambang): `Halo Dapoer Uni, saya lihat dari website. Mau tanya katering.`
- Per menu (panel detail, "Tanya menu ini via WhatsApp"): `Halo Dapoer Uni, saya lihat dari website. Mau pesan *{nama}* (Paket {Tingkat}) untuk ___ kotak, tanggal ___.`
- Jumat Berkah: `Halo Dapoer Uni, saya lihat dari website. Mau pesan nasi Jumat Berkah ___ kotak untuk Jumat tanggal ___.`
- Paket Custom: `Halo Dapoer Uni, saya lihat dari website. Mau pesan paket custom dengan budget Rp___ per kotak untuk ___ kotak, tanggal ___.`
- Invoice keranjang (`waInvoice`, isi dari `teksInvoice()` di `lib/invoice.ts`): pembuka `Halo Dapoer Uni, saya lihat dari website. Berikut invoice pesanan saya:`, nomor invoice (`DU-YYMMDD-XXXX`, dibuat di browser), data pemesan, daftar pesanan bernomor (menu, paket, jumlah kotak, add-on beserta harganya, rincian harga per kotak, subtotal), total, DP 50%, sisa pelunasan, metode pembayaran, keterangan ongkir, dan catatan.

## Keranjang & checkout

- **Detail menu** (klik kartu): penjelasan, isi kotak, harga, ketentuan, lalu **"Tambah add-on"**: tombol buka/tutup berisi daftar add-on yang bisa dicentang beserta harganya. Pilih jumlah kotak, subtotal dihitung langsung, lalu "Masukkan keranjang".
- Tombol kartu "Masukkan keranjang" menambah `minimalOrder` kotak **tanpa add-on**. Setelah masuk, tombol berubah menjadi "Di keranjang · N kotak".
- **Satu baris keranjang = menu + kombinasi add-on** (`key = id|addon1,addon2`). Menu sama dengan add-on berbeda menjadi baris terpisah; kombinasi yang sama digabung jumlahnya.
- **Harga 20+** dihitung dari total kotak menu tersebut (gabungan semua varian add-on yang dicentang).
- Laci keranjang punya 3 langkah:
  1. **Keranjang**: centang baris yang ikut checkout, atur jumlah, hapus. Validasi minimal 10 kotak **per tingkat**; bila kurang, tombol lanjut nonaktif dan alasannya tampil.
  2. **Data diri**: nama*, No. WhatsApp*, alamat pengiriman*, tanggal acara* (minimal H-3), jam (opsional), metode pembayaran* (Tunai / Non-tunai), catatan. Ringkasan total, **DP 50%**, dan sisa pelunasan tampil otomatis. Validasi + fokus ke isian pertama yang salah.
  3. **Invoice**: tampilan invoice bernomor, tombol "Kirim invoice ke WhatsApp", lalu "Selesai & kosongkan keranjang".
- **Privasi & keamanan**: hanya isi keranjang (menu, add-on, jumlah) yang disimpan di `localStorage` (`dapoeruni:keranjang:v2`). **Data diri hanya di memori** (hilang saat halaman ditutup), tidak dikirim ke server mana pun, hanya masuk ke pesan WhatsApp. Isian dibatasi panjangnya dan dibersihkan dari karakter kontrol.
- Bar keranjang muncul di bawah layar saat keranjang berisi; tombol WA mengambang disembunyikan selama bar keranjang tampil.

## Arah desain

Referensi struktur & rasa: https://www.banhmiandyou.com/ (beranda dan halaman Speisekarte). Yang ditiru: tombol navigasi berbentuk pil, hero foto makanan di atas meja ubin dengan judul display raksasa, lingkaran foto bertabel miring, header halaman menu bertuliskan kata raksasa yang terpotong, blok gelap bersudut membulat, kolase foto melengkung ke Instagram, footer dengan nama brand raksasa, butiran kertas (grain). **Jangan** menyalin teks, foto, logo, atau aset mereka.

Ciri Dapoer Uni:
- Meja ubin **espresso** (pengganti ubin hijau referensi), kotak kraft dan besek hasil hapus-latar dari foto asli, nasi kuning sebagai dekorasi.
- Kata "Uni" ditulis **serif miring emas** seperti logo di label besek.
- Logo bulat di header (`Badge.tsx`) adalah gambar ulang sementara dari label "Dapoer Uni" (ikon tudung saji emas). Ganti dengan file logo asli bila sudah ada.

Palet (dari feed Instagram, ada di `@theme` pada `src/index.css`):

| Token | Warna | Fungsi |
|---|---|---|
| `espresso` | `#29231E` | latar gelap, teks utama, tombol gelap |
| `espresso-2` | `#201B17` | hover gelap |
| `bronze` | `#85693C` | aksen, judul tingkat |
| `bronze-ink` | `#6E5530` | teks bronze (kontras cukup) |
| `gold` | `#E9B965` | tombol utama (WA, keranjang), kata "Uni" |
| `gold-2` | `#DBA84B` | hover emas, fokus |
| `cream` | `#F5EEE0` | latar utama |
| `cream-2` | `#FBF6EC` | kartu |
| `kraft` / `kraft-2` | `#C7BA9B` / `#EEDFC2` | label/tag, blok penutup |
| `muted` | `#6B5F52` | teks sekunder |

Tipografi: display **Bricolage Grotesque** (tebal, tracking rapat), aksen **Fraunces italic** (kata "Uni", eyebrow), isi **Manrope**.

Tombol WA berwarna emas (`gold`), bukan hijau WhatsApp; hanya ikonnya yang berbentuk logo WA.

## Motion & transisi (prioritas tinggi)

Semua gerak tenang dan lembut. Token di `src/lib/motion.ts`:

```ts
export const ease = [0.22, 1, 0.36, 1] as const;
export const easeInOut = [0.65, 0, 0.35, 1] as const;
export const dur = { fast: 0.35, base: 0.7, slow: 1.1 };
export const stagger = 0.08;
export const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
};
```

Jangan pakai spring dengan bounce.

Efek yang sudah ada:
1. Smooth scroll Lenis (`lerp: 0.1`, `smoothWheel: true`); tautan anchor memakai `lenis.scrollTo()` dengan offset tinggi header (`--header-h`). Scroll dikunci saat menu HP, panel detail, atau keranjang terbuka.
2. Intro hero: kata "Dapoer" dan "Uni" naik dari balik garis (masking), stiker & tombol fade-up, foto hero scale 1.08 → 1. Header halaman Menu ("Menu Kami") memakai masking yang sama.
3. Scroll reveal ber-stagger (`whileInView`, `viewport={{ once: true, amount: 0.2 }}`) lewat `RevealGroup`/`RevealItem`. Konten di layar pertama halaman Menu memakai animasi CSS (`.css-in`) supaya tidak menunggu JS.
4. Parallax halus foto hero dan foto Tentang Kami (desktop saja).
5. Filter katalog: grup tingkat keluar/masuk dengan `AnimatePresence` + `layout`, pil aktif meluncur dengan `layoutId`. Filter tersimpan di URL hash (`#menu-juragan`).
6. Hover kartu (desktop saja, `@media (hover: hover)`): foto zoom 1 → 1.05 dalam 0.6 dtk, kartu naik 4px, bayangan lewat opacity pseudo-element.
7. Header: pil melayang; sembunyi saat scroll turun, muncul saat scroll naik; logo mengecil setelah scroll.
8. Tombol: transisi warna + `scale: 0.98` saat ditekan. Tombol WA mengambang (HP) muncul setelah hero.
9. **Testimoni berjalan dari kanan ke kiri** (marquee CSS) dan **berhenti saat di-hover/ditekan**. Kolase Instagram memakai reveal stagger (bukan marquee).
10. Panel detail & laci keranjang: fade + slide; bar keranjang slide-up.

Aturan performa:
- Animasikan hanya `transform` dan `opacity` (termasuk `translate`/`scale`/`rotate`).
- CLS ≈ 0: ukuran gambar eksplisit, ruang dipesan sejak awal.
- Bila JS lambat, konten yang menunggu animasi dimunculkan oleh CSS setelah 1,5 dtk (`html:not(.js-ready)`).
- `prefers-reduced-motion: reduce`: Lenis mati, parallax mati, marquee berhenti (jadi baris yang bisa digeser), reveal tanpa gerak (`MotionConfig reducedMotion="user"`).

## Urutan section

**Beranda (`/`)**
1. Header: logo bulat, pil Menu · Tentang · Jumat Berkah · Kontak, pil emas "Chat WA". Di HP: satu pil "Menu" yang membuka menu layar penuh.
2. Hero: meja ubin espresso. Teks di kiri ("Dapoer", subjudul 2 baris, tombol "Lihat Menu" & "Chat WA"), "*Uni*" emas dan stiker "Surabaya · Katering rumahan" di **kanan**. Tiga foto pilihan pemilik berjajar di bawah: rice bowl (kiri), nasi kotak kraft (tengah, paling besar), tumpeng nasi kuning (kanan, alasnya menempel di tepi bawah). Di HP: teks di atas, tumpeng di tengah-belakang (kerucut berlabel terlihat), kotak depan-kiri, mangkuk depan-kanan.
3. Paket Nasi Kotak: 4 lingkaran tingkat dengan label "Paket X · Rp...–...", tombol "Lihat semua menu", lalu banner **Paket Custom**.
4. Tentang Kami: cerita besar + "Rumahan. Halal. Sesuai Budget." + foto melengkung bertag + 3 kartu nilai.
5. Jumat Berkah (blok gelap): penjelasan + tombol WA khusus. Jangan menulis angka penerima/masjid.
6. Testimoni (marquee). Selama `settings.testimoni` kosong, tampil kartu placeholder `[testimoni asli pelanggan, dengan izin]`.
7. Instagram: kolase foto melengkung ke `@dapoerunisurabaya`.
8. Penutup: "Siap pesan untuk acara Anda?" + tombol.
9. Footer: logo, navigasi, info (Surabaya, H-3, min. 10 kotak), tombol WA & IG, "Dapoer *Uni*" raksasa, © tahun.

**Menu (`/menu`)**
1. Header gelap "Menu *Kami*" (kata raksasa terpotong).
2. Intro "Pilihan Nasi Kotak" + ketentuan singkat.
3. Katalog: filter tingkat, 4 grup kartu, baris **Tambahan**, banner Paket Custom.
4. Cara Order (4 langkah) + kartu Ketentuan order.
5. Footer.

## Kartu menu (`MenuCard`)

- Foto bulat; tanpa foto: lingkaran ubin dengan inisial + "Foto menyusul" (bukan gambar stok).
- Nama, tag tingkat, label (bila ada), isi sebagai chip, "Lihat detail".
- Harga Rupiah; `null` tampil "Harga menyusul". Bila ada `harga20plus`: "10–19 kotak" di pil harga + baris "Rp15.000 untuk 20+ kotak".
- "Min. 10 kotak".
- Tombol "Masukkan keranjang" (emas) / "Di keranjang · N kotak" (gelap).
- Menu `tersedia: false` tidak ditampilkan.

## Foto

- Sumber: folder Google Drive pemilik. Foto sudah diberi color grading hangat + sharpening, beberapa dihapus latarnya, dan disimpan sebagai WebP dalam beberapa ukuran (`-320`, `-480`, dst.) untuk `srcset`.
- Pasangan foto per menu saat ini (mohon dikonfirmasi pemilik): Ayam Krispi Mini, Rice Bowl, Nasi Campur, Sultan Panggang, Nasi Kuning Sultan, Bento Sultan. Menu lain memakai placeholder inisial.
- Untuk menambah foto menu: simpan `public/images/menu/{slug}-400.webp` (persegi 400×400) lalu isi `foto: "{slug}"` di `menu.ts`.
- Foto hero (pilihan pemilik): `20240512_120328.jpg` (nasi kotak kraft), `IMG-20240607-WA0035.jpg` (tumpeng), `IMG-20241003-WA0011.jpg` (rice bowl). Latar dihapus dengan BiRefNet (+ GrabCut untuk tumpeng), tepi dirapikan, disimpan di `public/images/hero/`.

## Kualitas

- Mobile-first. Diuji di 360, 390, 768/820, 1280/1440px tanpa scroll horizontal.
- Lighthouse mobile (throttling devtools, lokal): Beranda 98 · Menu 91 untuk Performance; Accessibility, Best Practices, SEO 100.
- Gambar: `loading="lazy"` kecuali hero (preload + `fetchpriority="high"`), ukuran eksplisit, WebP, `srcset`/`sizes`.
- Aksesibilitas: fokus keyboard terlihat, `aria-pressed` pada filter, panel memakai `role="dialog"`, `aria-modal`, Esc untuk menutup, fokus terkunci di panel.
- SEO: title & meta description per halaman, Open Graph (`/og-image.jpg`), `lang="id"`, `robots.txt`.

## Yang tidak boleh

- Testimoni, rating, jumlah pelanggan, atau jumlah masjid yang dikarang.
- Countdown, "sisa slot", "promo hari terakhir", atau klaim kelangkaan yang tidak nyata.
- Harga yang tidak ada di data.
- Menyalin teks, foto, logo, atau aset dari situs referensi.
- Klaim "termurah", "terenak se-Surabaya", atau klaim kesehatan.
- Menaruh nomor WA sebagai teks biasa di banyak tempat; ambil dari `settings.ts`.
- Em dash.
- Foto kemasan sterofoam.
- Pembayaran di website (QRIS, payment gateway, dsb.) dan penyimpanan data diri pelanggan.

## Tahap berikutnya (jangan dikerjakan kecuali diminta)

1. Ganti `source.ts` agar membaca Google Sheets (CSV) dengan fallback ke `menu.ts`.
2. Sambungkan domain `dapoerunisurabaya.biz.id` di Vercel, lalu tambahkan `sitemap.xml` dan URL absolut untuk `og:image`.
3. Foto asli untuk menu yang masih placeholder; logo asli; testimoni asli (dengan izin).
4. (Opsional) Supabase + halaman `/admin` untuk pemilik.

## Definisi selesai

- `npm run build` sukses tanpa error TypeScript, dan `npm run lint` bersih.
- Kedua halaman rapi di 360px dan 1440px, tanpa scroll horizontal.
- Filter tingkat berfungsi, beranimasi halus, tercermin di URL hash.
- Detail menu + add-on, keranjang (baris per kombinasi add-on, centang, jumlah, validasi minimal 10 per tingkat), data diri, DP 50%, dan invoice WA menghasilkan pesan yang benar.
- Semua efek motion berjalan mulus dan mati dengan benar saat `prefers-reduced-motion` aktif.
- Tidak ada konten palsu dan tidak ada em dash.
