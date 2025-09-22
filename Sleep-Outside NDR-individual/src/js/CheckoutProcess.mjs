import { getLocalStorage, alertMessage } from "./utils.mjs";
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
  return items.map((item) => ({
    id: item.Id,
    price: item.FinalPrice,
    name: item.Name,
    quantity: item.quantity || 1,
  }));
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
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSummary();
    this.renderCartContents(); // 👈 ahora también muestra los productos
  }

  renderCartContents() {
    const parentElement = document.querySelector(this.outputSelector);
    parentElement.innerHTML = "";

    if (this.list.length === 0) {
      parentElement.innerHTML = "<p>No hay productos en tu carrito.</p>";
      return;
    }

    this.list.forEach((item) => {
      const imageUrl =
        item.Image ||
        (item.Images && item.Images.PrimaryMedium) ||
        "../images/placeholder.jpg";

      parentElement.innerHTML += `
        <div class="checkout-item">
          <img src="${imageUrl}" alt="${item.Name}" />
          <h4>${item.Name}</h4>
          <p>Cantidad: ${item.quantity || 1}</p>
          <p>Precio: $${item.FinalPrice.toFixed(2)}</p>
        </div>
      `;
    });
  }

  calculateItemSummary() {
    const summaryElement = document.querySelector(
      `${this.outputSelector} #cartTotal`
    );
    const itemNumElement = document.querySelector(
      `${this.outputSelector} #num-items`
    );

    itemNumElement.innerText = this.list.length;

    const amounts = this.list.map((item) => parseFloat(item.FinalPrice));
    this.itemTotal = amounts.reduce((sum, item) => sum + item, 0);
    summaryElement.innerText = `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;
    this.shipping = 10 + (this.list.length - 1) * 2;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxElement = document.querySelector(`${this.outputSelector} #tax`);
    const shippingElement = document.querySelector(
      `${this.outputSelector} #shipping`
    );
    const orderTotalElement = document.querySelector(
      `${this.outputSelector} #orderTotal`
    );

    taxElement.innerText = `$${this.tax.toFixed(2)}`;
    shippingElement.innerText = `$${this.shipping.toFixed(2)}`;
    orderTotalElement.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout() {
    const formElement = document.forms["checkout"];

    // Validación del formulario
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      alertMessage("Por favor completa todos los campos requeridos");
      return;
    }

    // Validación de carrito vacío
    if (this.list.length === 0) {
      alertMessage(
        "Tu carrito está vacío. Agrega productos antes de proceder al pago."
      );
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

      // Redirigir a página de éxito
      window.location.href = "../checkout/success.html";

      // Limpiar carrito
      localStorage.removeItem(this.key);
    } catch (err) {
      console.error("Checkout error:", err);

      // Manejo de errores específicos del servidor
      if (err.name === "servicesError") {
        let errorMessage = err.message;
        if (err.details) {
          // Mostrar detalles específicos de validación del servidor
          errorMessage += ": " + Object.values(err.details).join(", ");
        }
        alertMessage(errorMessage);
      } else {
        alertMessage(
          "Error al procesar el pedido. Por favor intenta nuevamente."
        );
      }
    }
  }
}
