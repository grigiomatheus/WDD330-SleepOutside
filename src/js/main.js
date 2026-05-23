import { updateCartCount, loadHeaderFooter } from "./utils.mjs";

await loadHeaderFooter();
updateCartCount();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    updateCartCount();
  }
});
