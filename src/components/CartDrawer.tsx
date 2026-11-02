import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getSettings, getTierInfo } from "../data/source";
import { ringkas, useCart, type CartRow, type Langkah, type Pemesan, type Ringkasan } from "../lib/cart";
import { useFocusTrap } from "../lib/focus-trap";
import { formatRupiah, formatTanggal, tanggalMinimal } from "../lib/format";
import { buatNomorInvoice, hariIni } from "../lib/invoice";
import { dur, ease } from "../lib/motion";
import { useAnchorClick } from "../lib/smooth-scroll";
import { external, waInvoice } from "../lib/whatsapp";
import { ArrowIcon, BasketIcon, CheckIcon, CloseIcon, WhatsAppIcon } from "./icons";
import { QtyStepper } from "./QtyStepper";

const LANGKAH: { id: Langkah; label: string }[] = [
  { id: "keranjang", label: "Keranjang" },
  { id: "data", label: "Data diri" },
  { id: "invoice", label: "Invoice" },
];

function Ringkas({ r }: { r: Ringkasan }) {
  const s = getSettings();
  return (
    <dl className="ck-sum">
      <div>
        <dt>Total ({r.totalKotak} kotak)</dt>
        <dd>{formatRupiah(r.totalHarga)}</dd>
      </div>
      <div className="ck-sum__dp">
        <dt>DP {s.checkout.dpPersen}%</dt>
        <dd>{formatRupiah(r.dp)}</dd>
      </div>
      <div>
        <dt>Sisa pelunasan</dt>
        <dd>{formatRupiah(r.sisa)}</dd>
      </div>
      <p className="ck-sum__note">Belum termasuk ongkir GoFood (dihitung admin sesuai jarak).</p>
    </dl>
  );
}

/* ---------------- Langkah 1: keranjang ---------------- */

function Baris({ row }: { row: CartRow }) {
  const { toggle, setQty, remove } = useCart();
  const { line, item, satuan, subtotal, pakai20, addOns, dasar, addOn } = row;
  return (
    <li className={`cl${line.checked ? "" : " is-off"}`}>
      <label className="cl__check">
        <input
          type="checkbox"
          checked={line.checked}
          onChange={() => toggle(line.key)}
          aria-label={`Sertakan ${item.nama}${addOns.length ? " dengan add-on" : ""} saat checkout`}
        />
        <span className="cl__box" aria-hidden="true">
          <CheckIcon />
        </span>
      </label>
      <div className="cl__info">
        <p className="cl__name">{item.nama}</p>
        {addOns.length > 0 && <p className="cl__addons">+ {addOns.map((a) => a.nama).join(", ")}</p>}
        <p className="cl__price">
          {satuan === null
            ? "Harga menyusul"
            : addOn
              ? `${formatRupiah(dasar ?? 0)} + ${formatRupiah(addOn)} add-on = ${formatRupiah(satuan)} / kotak`
              : `${formatRupiah(satuan)} / kotak`}
          {pakai20 && " · harga 20+"}
        </p>
      </div>
      <button type="button" className="cl__remove" onClick={() => remove(line.key)} aria-label={`Hapus ${item.nama} dari keranjang`}>
        <CloseIcon />
      </button>
      <div className="cl__row">
        <QtyStepper small value={line.qty} onChange={(n) => setQty(line.key, n)} label={`Jumlah kotak ${item.nama}`} />
        <p className="cl__sub">{subtotal === null ? "–" : formatRupiah(subtotal)}</p>
      </div>
    </li>
  );
}

function StepKeranjang({ r, foot }: { r: Ringkasan; foot: (n: ReactNode) => ReactNode }) {
  const cart = useCart();
  return (
    <>
      <div className="drawer__body" data-lenis-prevent>
        <p className="drawer__hint">
          Centang menu yang mau dipesan dan atur jumlahnya. Menu yang sama dengan add-on berbeda tercatat terpisah.
        </p>
        {r.groups.map((g) => (
          <section key={g.tier} className="cg" aria-label={`Paket ${g.nama}`}>
            <div className="cg__head">
              <h3>Paket {g.nama}</h3>
              {g.kotak > 0 && (
                <span className={g.kurang ? "cg__warn" : "cg__ok"}>
                  {g.kotak} kotak{g.kurang ? ` · kurang ${g.kurang}` : " ✓"}
                </span>
              )}
            </div>
            <ul>
              {g.rows.map((row) => (
                <Baris key={row.line.key} row={row} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      {foot(
        <>
          <Ringkas r={r} />
          {r.alasan && (
            <p className="drawer__warn" role="status">
              {r.alasan}
            </p>
          )}
          <button type="button" className="pill pill--gold pill--block" disabled={!r.bisaCheckout} onClick={() => cart.setLangkah("data")}>
            Lanjut isi data diri <ArrowIcon />
          </button>
          <button type="button" className="drawer__clear" onClick={cart.clear}>
            Kosongkan keranjang
          </button>
        </>,
      )}
    </>
  );
}

/* ---------------- Langkah 2: data diri ---------------- */

type Errors = Partial<Record<keyof Pemesan, string>>;

function cekData(p: Pemesan, metode: string[]): Errors {
  const e: Errors = {};
  if (p.nama.trim().length < 2) e.nama = "Isi nama pemesan.";
  const digit = p.wa.replace(/\D/g, "");
  if (digit.length < 9 || digit.length > 15) e.wa = "Isi nomor WhatsApp yang aktif (9–15 angka).";
  if (p.alamat.trim().length < 8) e.alamat = "Isi alamat pengiriman lengkap.";
  if (!p.tanggal) e.tanggal = "Pilih tanggal acara.";
  else if (p.tanggal < tanggalMinimal(3)) e.tanggal = "Pesan paling lambat H-3. Pilih tanggal lain.";
  if (!metode.includes(p.metode)) e.metode = "Pilih metode pembayaran.";
  return e;
}

const URUTAN: (keyof Pemesan)[] = ["nama", "wa", "alamat", "tanggal", "metode"];

function StepData({ r, foot }: { r: Ringkasan; foot: (n: ReactNode) => ReactNode }) {
  const { pemesan: p, setPemesan, setLangkah } = useCart();
  const metode = getSettings().checkout.metodeBayar;
  const [errors, setErrors] = useState<Errors>({});
  const [coba, setCoba] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const ubah = (patch: Partial<Pemesan>) => {
    setPemesan(patch);
    if (coba) setErrors(cekData({ ...p, ...patch }, metode));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = cekData(p, metode);
    setErrors(err);
    setCoba(true);
    const pertama = URUTAN.find((k) => err[k]);
    if (pertama) {
      formRef.current?.querySelector<HTMLElement>(`[name="${pertama}"]`)?.focus();
      return;
    }
    setLangkah("invoice");
  };

  const field = (k: keyof Pemesan) => ({
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });
  const err = (k: keyof Pemesan) =>
    errors[k] ? (
      <small id={`err-${k}`} className="ck-err">
        {errors[k]}
      </small>
    ) : null;

  return (
    <form ref={formRef} className="ck-form" onSubmit={submit} noValidate>
      <div className="drawer__body" data-lenis-prevent>
        <p className="drawer__hint">Data ini hanya dipakai untuk invoice di WhatsApp. Tidak disimpan di website.</p>
        <label className="ck-field">
          <span>Nama pemesan *</span>
          <input {...field("nama")} autoComplete="name" maxLength={60} value={p.nama} onChange={(e) => ubah({ nama: e.target.value })} />
          {err("nama")}
        </label>
        <label className="ck-field">
          <span>No. WhatsApp *</span>
          <input
            {...field("wa")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="08xx xxxx xxxx"
            value={p.wa}
            onChange={(e) => ubah({ wa: e.target.value.replace(/[^\d+\-\s]/g, "") })}
          />
          {err("wa")}
        </label>
        <label className="ck-field">
          <span>Alamat pengiriman *</span>
          <textarea
            {...field("alamat")}
            rows={3}
            autoComplete="street-address"
            maxLength={200}
            placeholder="Nama jalan, nomor, RT/RW, kelurahan, kecamatan"
            value={p.alamat}
            onChange={(e) => ubah({ alamat: e.target.value })}
          />
          {err("alamat")}
        </label>
        <div className="ck-row">
          <label className="ck-field">
            <span>Tanggal acara *</span>
            <input {...field("tanggal")} type="date" min={tanggalMinimal(3)} value={p.tanggal} onChange={(e) => ubah({ tanggal: e.target.value })} />
            {err("tanggal")}
          </label>
          <label className="ck-field">
            <span>Jam (opsional)</span>
            <input name="jam" type="time" value={p.jam} onChange={(e) => ubah({ jam: e.target.value })} />
          </label>
        </div>
        <fieldset className="ck-field ck-pay" aria-describedby={errors.metode ? "err-metode" : undefined}>
          <legend>Metode pembayaran *</legend>
          <div className="ck-pay__opts">
            {metode.map((m) => (
              <label key={m} className={`ck-radio${p.metode === m ? " is-on" : ""}`}>
                <input type="radio" name="metode" value={m} checked={p.metode === m} onChange={() => ubah({ metode: m })} />
                <span className="ck-radio__dot" aria-hidden="true" />
                {m}
              </label>
            ))}
          </div>
          {err("metode")}
        </fieldset>
        <label className="ck-field">
          <span>Catatan (opsional)</span>
          <textarea
            name="catatan"
            rows={2}
            maxLength={300}
            placeholder="Mis. tidak pedas, patokan lokasi"
            value={p.catatan}
            onChange={(e) => ubah({ catatan: e.target.value })}
          />
        </label>
      </div>
      {foot(
        <>
          <Ringkas r={r} />
          <div className="ck-actions">
            <button type="button" className="pill" onClick={() => setLangkah("keranjang")}>
              Kembali
            </button>
            <button type="submit" className="pill pill--gold">
              Buat invoice <ArrowIcon />
            </button>
          </div>
        </>,
      )}
    </form>
  );
}

/* ---------------- Langkah 3: invoice ---------------- */

function StepInvoice({ r, foot }: { r: Ringkasan; foot: (n: ReactNode) => ReactNode }) {
  const cart = useCart();
  const s = getSettings();
  const p = cart.pemesan;
  const [{ nomor, dibuat }] = useState(() => ({ nomor: buatNomorInvoice(), dibuat: new Date() }));
  const [terkirim, setTerkirim] = useState(false);

  return (
    <>
      <div className="drawer__body" data-lenis-prevent>
        <article className="inv" aria-label={`Invoice ${nomor}`}>
          <header className="inv__head">
            <div>
              <p className="inv__brand">{s.namaBrand}</p>
              <p className="inv__muted">Katering rumahan halal · {s.kota}</p>
            </div>
            <div className="inv__no">
              <p>INVOICE</p>
              <strong>{nomor}</strong>
              <p className="inv__muted">{formatTanggal(hariIni(dibuat))}</p>
            </div>
          </header>

          <section className="inv__to">
            <p className="inv__label">Pemesan</p>
            <p>
              <strong>{p.nama}</strong>
            </p>
            <p>{p.wa}</p>
            <p className="inv__addr">{p.alamat}</p>
            <p>
              Acara: {formatTanggal(p.tanggal)}
              {p.jam ? `, jam ${p.jam}` : ""}
            </p>
          </section>

          <ul className="inv__items">
            {r.groups.flatMap((g) =>
              g.rows
                .filter((x) => x.line.checked)
                .map((x) => (
                  <li key={x.line.key}>
                    <div className="inv__row">
                      <span>
                        {x.item.nama} <span className="inv__muted">· Paket {getTierInfo(x.item.tier).nama}</span>
                      </span>
                      <strong>{x.subtotal === null ? "–" : formatRupiah(x.subtotal)}</strong>
                    </div>
                    {x.addOns.length > 0 && (
                      <p className="inv__muted">Add-on: {x.addOns.map((a) => `${a.nama} (+${formatRupiah(a.harga)})`).join(", ")}</p>
                    )}
                    <p className="inv__muted">
                      {x.line.qty} kotak × {x.satuan === null ? "harga menyusul" : formatRupiah(x.satuan)}
                      {x.pakai20 ? " (harga 20+)" : ""}
                    </p>
                  </li>
                )),
            )}
          </ul>

          <dl className="inv__total">
            <div>
              <dt>Total ({r.totalKotak} kotak)</dt>
              <dd>{formatRupiah(r.totalHarga)}</dd>
            </div>
            <div className="is-dp">
              <dt>DP {s.checkout.dpPersen}%</dt>
              <dd>{formatRupiah(r.dp)}</dd>
            </div>
            <div>
              <dt>Sisa pelunasan</dt>
              <dd>{formatRupiah(r.sisa)}</dd>
            </div>
            <div>
              <dt>Metode pembayaran</dt>
              <dd>{p.metode}</dd>
            </div>
          </dl>
          <p className="inv__muted inv__foot">Ongkir GoFood dihitung admin sesuai jarak (belum termasuk).</p>
          {p.catatan.trim() && <p className="inv__note">Catatan: {p.catatan.trim()}</p>}
        </article>
        <p className="drawer__hint ck-info">{s.checkout.catatanBayar}</p>
      </div>
      {foot(
        terkirim ? (
          <>
            <p className="ck-done" role="status">
              <CheckIcon /> WhatsApp sudah dibuka. Tekan kirim di WhatsApp untuk menyelesaikan pesanan.
            </p>
            <a className="pill pill--block" href={waInvoice(r, p, nomor, dibuat)} {...external}>
              <WhatsAppIcon /> Buka WhatsApp lagi
            </a>
            <button
              type="button"
              className="pill pill--dark pill--block"
              onClick={() => {
                cart.clear();
                cart.setDrawerOpen(false);
              }}
            >
              Selesai & kosongkan keranjang
            </button>
          </>
        ) : (
          <>
            <a className="pill pill--gold pill--block" href={waInvoice(r, p, nomor, dibuat)} {...external} onClick={() => setTerkirim(true)}>
              <WhatsAppIcon /> Kirim invoice ke WhatsApp
            </a>
            <button type="button" className="drawer__clear" onClick={() => cart.setLangkah("data")}>
              Ubah data diri
            </button>
          </>
        ),
      )}
    </>
  );
}

/* ---------------- Laci ---------------- */

function Isi() {
  const cart = useCart();
  const r = ringkas(cart.lines);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { setDrawerOpen, setLangkah, langkah } = cart;
  const close = () => setDrawerOpen(false);
  const onAnchor = useAnchorClick(close);
  useFocusTrap(panelRef);

  // keranjang berubah jadi tidak valid → kembali ke langkah keranjang
  const aktif: Langkah = r.groups.length === 0 || !r.bisaCheckout ? "keranjang" : langkah;
  useEffect(() => {
    if (aktif !== langkah) setLangkah(aktif);
  }, [aktif, langkah, setLangkah]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [setDrawerOpen]);

  const foot = (n: ReactNode) => <footer className="drawer__foot">{n}</footer>;
  const idx = LANGKAH.findIndex((l) => l.id === aktif);

  return (
    <motion.div
      className="sheet sheet--drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-judul"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.2 : dur.fast, ease }}
    >
      <div className="sheet__backdrop" onClick={close} aria-hidden="true" />
      <motion.aside
        ref={panelRef}
        className="sheet__panel drawer"
        initial={{ x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ duration: reduce ? 0.2 : dur.base, ease }}
      >
        <header className="drawer__head">
          <h2 id="cart-judul">
            <BasketIcon /> {aktif === "invoice" ? "Invoice" : aktif === "data" ? "Data diri" : "Keranjang"}
          </h2>
          <button ref={closeRef} type="button" className="sheet__close sheet__close--inline" onClick={close} aria-label="Tutup keranjang">
            <CloseIcon />
          </button>
        </header>

        {r.groups.length > 0 && (
          <ol className="ck-steps" aria-label="Langkah pemesanan">
            {LANGKAH.map((l, i) => (
              <li key={l.id} className={i < idx ? "is-done" : i === idx ? "is-on" : ""} aria-current={i === idx ? "step" : undefined}>
                <span className="ck-steps__n">{i < idx ? <CheckIcon /> : i + 1}</span>
                {l.label}
              </li>
            ))}
          </ol>
        )}

        {r.groups.length === 0 ? (
          <div className="drawer__empty">
            <p>Keranjang masih kosong.</p>
            <a className="pill pill--gold" href="/menu#katalog" onClick={onAnchor}>
              Lihat menu <ArrowIcon />
            </a>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={aktif}
              className="drawer__step"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: reduce ? 0.15 : dur.fast, ease }}
            >
              {aktif === "keranjang" && <StepKeranjang r={r} foot={foot} />}
              {aktif === "data" && <StepData r={r} foot={foot} />}
              {aktif === "invoice" && <StepInvoice r={r} foot={foot} />}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.aside>
    </motion.div>
  );
}

/** Laci keranjang + checkout (kanan di desktop, dari bawah di HP). Tidak ada pembayaran di website. */
export function CartDrawer() {
  const { drawerOpen } = useCart();
  return <AnimatePresence>{drawerOpen && <Isi />}</AnimatePresence>;
}
