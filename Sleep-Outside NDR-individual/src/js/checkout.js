import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const order = new CheckoutProcess("so-cart", ".checkout-summary");
order.init();

// Calcular total cuando se cambia el código postal
document
  .querySelector("#zip")
  .addEventListener("blur", () => order.calculateOrderTotal());

// Manejo del envío del formulario
document.querySelector("#checkoutSubmit").addEventListener("click", async (e) => {
  e.preventDefault();
  
  const form = document.forms["checkout"];
  if (form.checkValidity()) {
    // Mostrar indicador de carga
    const submitBtn = e.target;
    submitBtn.disabled = true;
    submitBtn.textContent = "Procesando...";
    
    try {
      await order.checkout();
    } finally {
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.textContent = "Checkout";
    }
  } else {
    form.reportValidity();
  }
});