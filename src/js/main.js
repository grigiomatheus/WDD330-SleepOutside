import { updateCartCount, loadHeaderFooter } from "./utils.mjs";

(async () => {
  await loadHeaderFooter();
  updateCartCount();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      updateCartCount();
    }
  });
})();
