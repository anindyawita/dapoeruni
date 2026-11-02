import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getMenuById } from "../data/source";
import { ringkas, useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";
import { dur, ease } from "../lib/motion";
import { ArrowIcon, BasketIcon, CheckIcon } from "./icons";

/** Bar keranjang di bawah layar, muncul saat keranjang berisi. */
export function CartBar() {
  const cart = useCart();
  const reduce = useReducedMotion();
  const r = ringkas(cart.lines);
  const namaBaru = cart.lastAdded ? getMenuById(cart.lastAdded.id)?.nama : undefined;
  const notice = namaBaru ? `${namaBaru} masuk keranjang` : null;

  const show = cart.ready && cart.lines.length > 0 && !cart.drawerOpen && !cart.detail;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          className="cartbar"
          onClick={() => cart.setDrawerOpen(true)}
          aria-label={`Buka keranjang: ${cart.lines.length} menu, ${r.totalKotak} kotak dicentang`}
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: reduce ? 0.2 : dur.base, ease }}
        >
          <span className="cartbar__icon" aria-hidden="true">
            <BasketIcon />
            <motion.span
              key={cart.lines.length}
              className="cartbar__count"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: dur.fast, ease }}
            >
              {cart.lines.length}
            </motion.span>
          </span>
          <span className="cartbar__text" aria-live="polite">
            {notice ? (
              <span className="cartbar__notice">
                <CheckIcon /> <span className="cartbar__nama">{namaBaru} </span>masuk keranjang
              </span>
            ) : (
              <>
                <strong>{r.totalKotak} kotak</strong> · {formatRupiah(r.totalHarga)}
              </>
            )}
          </span>
          <span className="cartbar__cta">
            Keranjang <ArrowIcon />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
