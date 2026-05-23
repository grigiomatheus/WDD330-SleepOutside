import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter, getParam, updateCartCount } from "./utils.mjs";

await loadHeaderFooter();

const category = getParam("category");

// Update page heading with category name
const categoryTitle = category
  ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  : "";
document.getElementById("product-category-title").textContent =
  `Top Products: ${categoryTitle}`;

// first create an instance of the ProductData class.
const dataSource = new ProductData();
// then get the element you want the product list to render in
const listElement = document.querySelector(".product-list");
// then create an instance of the ProductList class and send it the correct information.
const myList = new ProductList(category, dataSource, listElement);
// finally call the init method to show the products
myList.init();
updateCartCount();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    updateCartCount();
  }
});
