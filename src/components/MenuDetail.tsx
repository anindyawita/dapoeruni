import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { getAddOns, getDeskripsi, getSettings, getTierInfo, type MenuItem } from "../data/source";
import { addOnPerKotak, hargaDasar, useCart } from "../lib/cart";
import { formatRupiah, inisial } from "../lib/format";
import { useFocusTrap } from "../lib/focus-trap";
import { dur, ease } from "../lib/motion";
import { external, waMenu } from "../lib/whatsapp";
import { BasketIcon, CheckIcon, ChevronIcon, CloseIcon, WhatsAppIcon } from "./icons";
import { QtyStepper } from "./QtyStepper";

/** Pilihan add-on: tombol buka/tutup, lalu daftar yang bisa dicentang. */
function AddOnPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  // saat dibuka, gulir panel supaya seluruh daftar terlihat (tidak tertutup tombol beli di HP)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => boxRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }), 60);
    return () => window.clearTimeout(t);
  }, [open, reduce]);
  const addOns = getAddOns();
  const perKotak = addOnPerKotak(value);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div ref={boxRef} className={`addon${open ? " is-open" : ""}`}>
      <button type="button" className="addon__toggle" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
        <span className="addon__title">Tambah add-on</span>
        <span className="addon__meta">
          {value.length ? `${value.length} dipilih · +${formatRupiah(perKotak)}/kotak` : "Opsional"}
        </span>
        <ChevronIcon className="icon addon__chev" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={listId}
            className="addon__list"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0.15 : dur.fast, ease }}
          >
            {addOns.map((a) => {
              const on = value.includes(a.id);
              return (
                <li key={a.id}>
                  <label className={`addon__item${on ? " is-on" : ""}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle(a.id)} />
                    <span className="cl__box" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <span className="addon__name">{a.nama}</span>
                    <span className="addon__price">+{formatRupiah(a.harga)}</span>
                  </label>
                </li>
              );
            })}
            <li className="addon__note">Harga add-on dihitung per kotak.</li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailPanel({ item }: { item: MenuItem }) {
  const { lines, add, setDetail } = useCart();
  const reduce = useReducedMotion();
  const s = getSettings();
  const tier = getTierInfo(item.tier);
  const diKeranjang = lines.filter((l) => l.id === item.id).reduce((n, l) => n + l.qty, 0);
  const [qty, setQty] = useState(item.minimalOrder);
  const [addOns, setAddOns] = useState<string[]>([]);
  const dasar = hargaDasar(item, qty);
  const tambah = addOnPerKotak(addOns);
  const satuan = dasar === null ? null : dasar + tambah;
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => setDetail(null);
  useFocusTrap(panelRef);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDetail(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [setDetail]);

  return (
    <motion.div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-judul"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.2 : dur.fast, ease }}
    >
      <div className="sheet__backdrop" onClick={close} aria-hidden="true" />
      <motion.div
        ref={panelRef}
        className="sheet__panel detail"
        data-lenis-prevent
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: reduce ? 0.2 : dur.base, ease }}
      >
        <button ref={closeRef} type="button" className="sheet__close" onClick={close} aria-label="Tutup detail menu">
          <CloseIcon />
        </button>

        <div className="detail__media">
          <div className={`circle ${item.foto ? "circle--photo" : "circle--tiles"}`}>
            {item.foto ? (
              <img src={`/images/menu/${item.foto}-400.webp`} width={400} height={400} alt={`${item.nama}, Paket ${tier.nama}`} />
            ) : (
              <span className="ini" role="img" aria-label={`Foto ${item.nama} menyusul`}>
                {inisial(item.nama)}
                <small>Foto menyusul</small>
              </span>
            )}
          </div>
          <span className={`ttag ttag--${item.tier}`}>Paket {tier.nama}</span>
        </div>

        <div className="detail__info">
          <h2 id="detail-judul" className="detail__name">
            {item.nama}
          </h2>
          {item.label && <p className="card__note">{item.label}</p>}
          <p className="detail__desc">{getDeskripsi(item)}</p>

          <h3 className="detail__sub">Isi kotak</h3>
          <ul className="detail__isi">
            {item.isi.map((x) => (
              <li key={x}>
                <CheckIcon />
                {x}
              </li>
            ))}
          </ul>

          <div className="detail__price">
            {item.harga !== null ? (
              <>
                <p>
                  <strong>{formatRupiah(item.harga)}</strong> / kotak
                  {item.harga20plus !== undefined && ` (${item.minimalOrder}–19 kotak)`}
                </p>
                {item.harga20plus !== undefined && (
                  <p>
                    <strong>{formatRupiah(item.harga20plus)}</strong> / kotak untuk 20+ kotak
                  </p>
                )}
              </>
            ) : (
              <p>Harga menyusul</p>
            )}
          </div>

          <ul className="detail__rules">
            <li>Minimal {item.minimalOrder} kotak per tingkat, boleh campur varian Paket {tier.nama}.</li>
            <li>{s.ketentuan.find((k) => k.judul === "Batas pesan")?.isi ?? "Pesan paling lambat H-3."}</li>
            <li>Ongkir via GoFood sesuai jarak, belum termasuk harga.</li>
          </ul>

          <AddOnPicker value={addOns} onChange={setAddOns} />

          <div className="detail__buy">
            <div className="detail__qty">
              <span>Jumlah kotak</span>
              <QtyStepper value={qty} onChange={setQty} label={`Jumlah kotak ${item.nama}`} />
            </div>
            {satuan !== null && (
              <p className="detail__subtotal">
                {tambah > 0 && (
                  <span className="detail__calc">
                    {formatRupiah(dasar ?? 0)} + add-on {formatRupiah(tambah)} = {formatRupiah(satuan)}/kotak ·{" "}
                  </span>
                )}
                Subtotal <strong>{formatRupiah(satuan * qty)}</strong>
                {dasar !== item.harga && <span> · harga 20+</span>}
              </p>
            )}
            <button
              type="button"
              className="pill pill--gold pill--block"
              onClick={() => {
                add(item.id, qty, addOns);
                close();
              }}
            >
              <BasketIcon />
              Masukkan keranjang
            </button>
            {diKeranjang > 0 && <p className="detail__incart">Sudah di keranjang: {diKeranjang} kotak</p>}
            <a className="detail__wa" href={waMenu(item)} {...external}>
              <WhatsAppIcon />
              Tanya menu ini via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Panel detail menu (muncul saat kartu menu diklik). */
export function MenuDetail() {
  const { detail } = useCart();
  return <AnimatePresence>{detail && <DetailPanel key={detail.id} item={detail} />}</AnimatePresence>;
}
