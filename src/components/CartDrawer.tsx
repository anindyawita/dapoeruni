import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ringkas, useCart, type CartRow } from "../lib/cart";
import { formatRupiah, tanggalMinimal } from "../lib/format";
import { useAnchorClick } from "../lib/smooth-scroll";
import { useFocusTrap } from "../lib/focus-trap";
import { dur, ease } from "../lib/motion";
import { external, waCheckout } from "../lib/whatsapp";
import { ArrowIcon, BasketIcon, CheckIcon, CloseIcon, WhatsAppIcon } from "./icons";
import { QtyStepper } from "./QtyStepper";

function Baris({ row }: { row: CartRow }) {
  const { toggle, setQty, remove } = useCart();
  const { line, item, satuan, subtotal, pakai20 } = row;
  return (
    <li className={`cl${line.checked ? "" : " is-off"}`}>
      <label className="cl__check">
        <input
          type="checkbox"
          checked={line.checked}
          onChange={() => toggle(item.id)}
          aria-label={`Sertakan ${item.nama} saat checkout`}
        />
        <span className="cl__box" aria-hidden="true">
          <CheckIcon />
        </span>
      </label>
      <div className="cl__info">
        <p className="cl__name">{item.nama}</p>
        <p className="cl__price">
          {satuan === null ? "Harga menyusul" : `${formatRupiah(satuan)} / kotak${pakai20 ? " · harga 20+" : ""}`}
        </p>
      </div>
      <button type="button" className="cl__remove" onClick={() => remove(item.id)} aria-label={`Hapus ${item.nama} dari keranjang`}>
        <CloseIcon />
      </button>
      <div className="cl__row">
        <QtyStepper small value={line.qty} onChange={(n) => setQty(item.id, n)} label={`Jumlah kotak ${item.nama}`} />
        <p className="cl__sub">{subtotal === null ? "–" : formatRupiah(subtotal)}</p>
      </div>
    </li>
  );
}

function Isi() {
  const cart = useCart();
  const r = ringkas(cart.lines);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useFocusTrap(panelRef);
  const { setDrawerOpen } = cart;
  const close = () => setDrawerOpen(false);
  const onAnchor = useAnchorClick(close);

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
        data-lenis-prevent
        initial={{ x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ duration: reduce ? 0.2 : dur.base, ease }}
      >
        <header className="drawer__head">
          <h2 id="cart-judul">
            <BasketIcon /> Keranjang
          </h2>
          <button ref={closeRef} type="button" className="sheet__close sheet__close--inline" onClick={close} aria-label="Tutup keranjang">
            <CloseIcon />
          </button>
        </header>

        {r.groups.length === 0 ? (
          <div className="drawer__empty">
            <p>Keranjang masih kosong.</p>
            <a className="pill pill--gold" href="/menu#katalog" onClick={onAnchor}>
              Lihat menu <ArrowIcon />
            </a>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <p className="drawer__hint">Centang menu yang mau dipesan, atur jumlahnya, lalu checkout lewat WhatsApp.</p>
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
                      <Baris key={row.item.id} row={row} />
                    ))}
                  </ul>
                </section>
              ))}

              <div className="drawer__fields">
                <label>
                  <span>Tanggal acara</span>
                  <input
                    type="date"
                    min={tanggalMinimal(3)}
                    value={cart.tanggal}
                    onChange={(e) => cart.setTanggal(e.target.value)}
                  />
                  <small>Pesan paling lambat H-3.</small>
                </label>
                <label>
                  <span>Catatan (opsional)</span>
                  <textarea
                    rows={2}
                    value={cart.catatan}
                    onChange={(e) => cart.setCatatan(e.target.value)}
                    placeholder="Mis. alamat kirim, jam acara, tidak pedas"
                  />
                </label>
              </div>
            </div>

            <footer className="drawer__foot">
              <div className="drawer__total">
                <span>{r.totalKotak} kotak dicentang</span>
                <strong>{formatRupiah(r.totalHarga)}</strong>
              </div>
              <p className="drawer__note">Belum termasuk ongkir GoFood (sesuai jarak).</p>
              {r.alasan && (
                <p className="drawer__warn" role="status">
                  {r.alasan}
                </p>
              )}
              {r.bisaCheckout ? (
                <a className="pill pill--gold pill--block" href={waCheckout(r, cart.tanggal, cart.catatan)} {...external}>
                  <WhatsAppIcon />
                  Checkout via WhatsApp
                </a>
              ) : (
                <button type="button" className="pill pill--gold pill--block" disabled>
                  <WhatsAppIcon />
                  Checkout via WhatsApp
                </button>
              )}
              <button type="button" className="drawer__clear" onClick={cart.clear}>
                Kosongkan keranjang
              </button>
            </footer>
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}

/** Laci keranjang (kanan di desktop, dari bawah di HP). */
export function CartDrawer() {
  const { drawerOpen } = useCart();
  return <AnimatePresence>{drawerOpen && <Isi />}</AnimatePresence>;
}
