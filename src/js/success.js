import { loadHeaderFooter, updateCartCount } from "./utils.mjs";

(async () => {
  await loadHeaderFooter();
  updateCartCount();
})();