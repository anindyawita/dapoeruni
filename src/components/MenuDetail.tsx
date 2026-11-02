import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getDeskripsi, getSettings, getTierInfo, type MenuItem } from "../data/source";
import { hargaSatuan, useCart } from "../lib/cart";
import { formatRupiah, inisial } from "../lib/format";
import { useFocusTrap } from "../lib/focus-trap";
import { dur, ease } from "../lib/motion";
import { external, waMenu } from "../lib/whatsapp";
import { BasketIcon, CheckIcon, CloseIcon, WhatsAppIcon } from "./icons";
import { QtyStepper } from "./QtyStepper";

function DetailPanel({ item }: { item: MenuItem }) {
  const { lines, upsert, setDetail } = useCart();
  const reduce = useReducedMotion();
  const s = getSettings();
  const tier = getTierInfo(item.tier);
  const existing = lines.find((l) => l.id === item.id);
  const [qty, setQty] = useState(existing?.qty ?? item.minimalOrder);
  const satuan = hargaSatuan(item, qty);
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

          <div className="detail__buy">
            <div className="detail__qty">
              <span>Jumlah kotak</span>
              <QtyStepper value={qty} onChange={setQty} label={`Jumlah kotak ${item.nama}`} />
            </div>
            {satuan !== null && (
              <p className="detail__subtotal">
                Subtotal <strong>{formatRupiah(satuan * qty)}</strong>
                {satuan !== item.harga && <span> · harga 20+</span>}
              </p>
            )}
            <button
              type="button"
              className="pill pill--gold pill--block"
              onClick={() => {
                upsert(item.id, qty);
                close();
              }}
            >
              <BasketIcon />
              {existing ? "Perbarui keranjang" : "Masukkan keranjang"}
            </button>
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
