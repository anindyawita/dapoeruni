import { renderToString } from "react-dom/server";
import { App } from "./App";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";

/** Dipakai scripts/prerender.mjs saat build: HTML statis untuk tiap halaman. */
export function render(page: "home" | "menu"): string {
  return renderToString(<App>{page === "menu" ? <MenuPage /> : <HomePage />}</App>);
}
