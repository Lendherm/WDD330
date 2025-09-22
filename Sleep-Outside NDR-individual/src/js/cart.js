import { getLocalStorage, loadHeaderFooter, updateCartCount } from "./utils.mjs";

// Exporta la función que necesita ProductDetails
export function updateCart() {
  updateCartCount();
}

async function initialize() {
  await loadHeaderFooter();
  renderCartContents();
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  
  if (!productList) return;
  
  productList.innerHTML = cartItems.length > 0 
    ? cartItems.map(cartItemTemplate).join("")
    : "<li>Your cart is empty</li>";
  
  updateTotal(cartItems);
  updateCartCount();
}

function cartItemTemplate(item) {
  const product = item.Result || item; // soporte por si algún item no viene envuelto
  const quantity = item.quantity || 1;

  const name = product.Name || product.NameWithoutBrand || "Unnamed Product";
  const color = product.Colors?.[0]?.ColorName || "N/A";
  const imageUrl =
    product.Image ||
    product.Images?.PrimaryMedium ||
    "../images/placeholder.jpg";

  const price = product.FinalPrice || product.SuggestedRetailPrice || 0;

  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${imageUrl}" alt="${name}" />
    </a>
    <a href="#"><h2 class="card__name">${name}</h2></a>
    <p class="cart-card__color">${color}</p>
    <p class="cart-card__quantity">Qty: ${quantity}</p>
    <p class="cart-card__price">$${(price * quantity).toFixed(2)}</p>
  </li>`;
}

function updateTotal(cartItems) {
  const total = cartItems.reduce((sum, item) => {
    const product = item.Result || item;
    const quantity = item.quantity || 1;
    const price = product.FinalPrice || product.SuggestedRetailPrice || 0;
    return sum + (price * quantity);
  }, 0);
  
  const totalElement = document.querySelector(".list-total");
  if (totalElement) {
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    totalElement.classList.toggle("hide", cartItems.length === 0);
  }
}

initialize();
