import ExternalServices from "./ExternalServices.mjs";
import { getLocalStorage } from "./utils.mjs";

const SALES_TAX_RATE = 0.06;
const FIRST_ITEM_SHIPPING = 10;
const ADDITIONAL_ITEM_SHIPPING = 2;

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function formDataToJSON(formData) {
  return Object.fromEntries(formData.entries());
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: item.Quantity || 1,
  }));
}

function getItemCount(items) {
  return items.reduce((sum, item) => sum + (item.Quantity || 1), 0);
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
  }

  calculateItemSummary() {
    this.list = getLocalStorage(this.key) || [];
    this.itemTotal = this.list.reduce(
      (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
      0,
    );

    const subtotal = document.querySelector(`${this.outputSelector} #cartTotal`);
    const itemCount = document.querySelector(`${this.outputSelector} #num-items`);

    subtotal.innerText = formatCurrency(this.itemTotal);
    itemCount.innerText = getItemCount(this.list);
  }

  calculateItemSubTotal() {
    this.calculateItemSummary();
  }

  calculateOrderTotal() {
    this.calculateItemSummary();

    const itemCount = getItemCount(this.list);

    this.tax = this.itemTotal * SALES_TAX_RATE;
    this.shipping = itemCount > 0
      ? FIRST_ITEM_SHIPPING + Math.max(0, itemCount - 1) * ADDITIONAL_ITEM_SHIPPING
      : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const tax = document.querySelector(`${this.outputSelector} #tax`);
    const shipping = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotal = document.querySelector(`${this.outputSelector} #orderTotal`);

    tax.innerText = formatCurrency(this.tax);
    shipping.innerText = formatCurrency(this.shipping);
    orderTotal.innerText = formatCurrency(this.orderTotal);
  }

  async checkout(form) {
    this.list = getLocalStorage(this.key) || [];

    if (this.list.length === 0) {
      throw new Error("Your cart is empty.");
    }

    this.calculateItemSummary();
    this.calculateOrderTotal();

    const formData = new FormData(form);
    const order = formDataToJSON(formData);

    order.orderDate = new Date().toISOString();
    order.items = packageItems(this.list);
    order.orderTotal = this.orderTotal.toFixed(2);
    order.shipping = this.shipping;
    order.tax = this.tax.toFixed(2);

    return this.services.checkout(order);
  }
}