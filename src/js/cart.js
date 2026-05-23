import ShoppingCart from "./ShoppingCart.mjs";
import { updateCartCount, loadHeaderFooter } from "./utils.mjs";

await loadHeaderFooter();

const cart = new ShoppingCart(
  "so-cart",
  document.querySelector(".product-list"),
);

cart.init();
updateCartCount();
