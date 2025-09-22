// src/js/CheckoutProcess.mjs
import { getLocalStorage, alertMessage, normalizeProduct } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};
  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });
  return convertedJSON;
}

function packageItems(items) {
  return items
    .map((item) => {
      const product = normalizeProduct(item);
      if (!product) return null;
      const quantity = item?.quantity ?? product?.quantity ?? 1;
      return {
        id: product.Id,
        price: Number(product.FinalPrice ?? product.SuggestedRetailPrice ?? 0),
        name: product.Name || product.NameWithoutBrand || "",
        quantity,
      };
    })
    .filter(Boolean);
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
    this.totalItems = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
    this.renderCartContents();
    this.calculateOrderTotal();
  }

  renderCartContents() {
    const parentElement = document.querySelector(this.outputSelector);
    if (!parentElement) return;
    parentElement.innerHTML = "";

    if (this.list.length === 0) {
      parentElement.innerHTML = "<p>No hay productos en tu carrito.</p>";
      return;
    }

    this.list.forEach((item) => {
      const product = normalizeProduct(item);
      if (!product) return;
      const quantity = item?.quantity ?? product?.quantity ?? 1;
      const imageUrl =
        product.Image || product.Images?.PrimaryMedium || "../images/placeholder.jpg";
      const price = Number(product.FinalPrice ?? product.SuggestedRetailPrice ?? 0);

      parentElement.insertAdjacentHTML(
        "beforeend",
        `
        <div class="checkout-item">
          <img src="${imageUrl}" alt="${product.Name || product.NameWithoutBrand}" />
          <h4>${product.Name || product.NameWithoutBrand}</h4>
          <p>Cantidad: ${quantity}</p>
          <p>Precio unitario: $${price.toFixed(2)}</p>
          <p>Subtotal: $${(price * quantity).toFixed(2)}</p>
        </div>
      `
      );
    });
  }

  calculateItemSummary() {
    const summaryElement = document.querySelector(`${this.outputSelector} #cartTotal`);
    const itemNumElement = document.querySelector(`${this.outputSelector} #num-items`);
    const items = this.list || [];

    this.totalItems = items.reduce((sum, it) => {
      const product = normalizeProduct(it);
      const qty = it?.quantity ?? product?.quantity ?? 1;
      return sum + qty;
    }, 0);

    if (itemNumElement) itemNumElement.innerText = this.totalItems;

    this.itemTotal = items.reduce((sum, it) => {
      const product = normalizeProduct(it);
      const qty = it?.quantity ?? product?.quantity ?? 1;
      const price = Number(product?.FinalPrice ?? product?.SuggestedRetailPrice ?? 0);
      return sum + price * qty;
    }, 0);

    if (summaryElement) summaryElement.innerText = `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;
    this.shipping = this.totalItems > 0 ? 10 + (this.totalItems - 1) * 2 : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElement = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotalElement = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (taxElement) taxElement.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingElement) shippingElement.innerText = `$${this.shipping.toFixed(2)}`;
    if (orderTotalElement) orderTotalElement.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout() {
    const formElement = document.forms["checkout"];

    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      alertMessage("Por favor completa todos los campos requeridos");
      return;
    }

    if (this.list.length === 0) {
      alertMessage("Tu carrito está vacío. Agrega productos antes de proceder al pago.");
      return;
    }

    try {
      const order = formDataToJSON(formElement);
      order.orderDate = new Date().toISOString();
      order.orderTotal = this.orderTotal.toFixed(2);
      order.tax = this.tax.toFixed(2);
      order.shipping = this.shipping.toFixed(2);
      order.items = packageItems(this.list);

      const response = await services.checkout(order);
      console.log("Order successful:", response);

      window.location.href = "../checkout/success.html";
      localStorage.removeItem(this.key);
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.name === "servicesError") {
        let errorMessage = err.message;
        if (err.details) {
          errorMessage += ": " + Object.values(err.details).join(", ");
        }
        alertMessage(errorMessage);
      } else {
        alertMessage("Error al procesar el pedido. Por favor intenta nuevamente.");
      }
    }
  }
}