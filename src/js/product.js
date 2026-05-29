import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

(async () => {
  await loadHeaderFooter();

  const dataSource = new ExternalServices();
  const productID = getParam("product");

  const product = new ProductDetails(productID, dataSource);
  product.init();
})();
