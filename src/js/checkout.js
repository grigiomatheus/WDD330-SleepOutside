import CheckoutProcess from "./CheckoutProcess.mjs";
import { loadHeaderFooter, updateCartCount } from "./utils.mjs";

(async () => {
  await loadHeaderFooter();
  updateCartCount();

  const checkoutProcess = new CheckoutProcess("so-cart", ".checkout-summary");
  checkoutProcess.init();

  const checkoutForm = document.querySelector("#checkout-form");
  const zipInput = document.querySelector("#zip");
  const message = document.querySelector(".checkout-message");

  zipInput.addEventListener("change", () => {
    if (!zipInput.value.trim()) {
      return;
    }

    checkoutProcess.calculateOrderTotal();
  });

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      message.textContent = "Please complete every field before checking out.";
      return;
    }

    try {
      const response = await checkoutProcess.checkout(checkoutForm);
      message.textContent = response.message || "Order submitted successfully.";
    } catch (error) {
      message.textContent = error.message || "Unable to submit your order.";
    }
  });
})();
