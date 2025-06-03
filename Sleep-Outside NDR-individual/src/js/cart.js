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
  const quantity = item.quantity || 1;
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${item.Image}" alt="${item.Name}" />
    </a>
    <a href="#"><h2 class="card__name">${item.Name}</h2></a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: ${quantity}</p>
    <p class="cart-card__price">$${(item.FinalPrice * quantity).toFixed(2)}</p>
  </li>`;
}

function updateTotal(cartItems) {
  const total = cartItems.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    const price = item.FinalPrice || item.SuggestedRetailPrice || 0;
    return sum + (price * quantity);
  }, 0);
  
  const totalElement = document.querySelector(".list-total");
  if (totalElement) {
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    totalElement.classList.toggle("hide", cartItems.length === 0);
  }
}

initialize();