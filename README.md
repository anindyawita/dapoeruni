# Dapoer Uni: web katalog

Web katalog nasi kotak **Dapoer Uni**, katering rumahan halal di Surabaya. Pengunjung bisa melihat menu, memasukkan menu ke keranjang, lalu checkout lewat WhatsApp.

- Beranda: `/`
- Katalog lengkap: `/menu`

Dibuat dengan Vite, React, TypeScript, Tailwind CSS v4, `motion`, dan `lenis`. Panduan lengkap (data, aturan bisnis, desain, animasi) ada di [`CLAUDE.md`](./CLAUDE.md).

## Menjalankan di komputer

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` (beranda) dan `http://localhost:5173/menu.html` (katalog).

```bash
npm run build     # build produksi + prerender ke folder dist/
npm run preview   # cek hasil build di http://localhost:4173 dan /menu
npm run lint
```

## Mengubah isi

- **Menu & harga**: `src/data/menu.ts`
- **Teks, nomor WA, ketentuan order, pesan WhatsApp**: `src/data/settings.ts`
- **Warna & font**: blok `@theme` di `src/index.css`
- **Foto menu**: simpan `public/images/menu/{slug}-400.webp` (persegi 400×400), lalu isi `foto: "{slug}"` pada menu tersebut.

## Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new), pilih repository ini.
2. Framework preset: **Vite** (otomatis). Build command `npm run build`, output `dist`.
3. Deploy. `vercel.json` sudah mengatur agar `/menu` membuka halaman katalog.
