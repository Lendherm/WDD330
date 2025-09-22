import { getLocalStorage, loadHeaderFooter, updateCartCount, normalizeProduct } from "./utils.mjs";

export function updateCart() {
  updateCartCount();
  renderCartContents();
}

async function initialize() {
  await loadHeaderFooter();
  renderCartContents();
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cartItemTemplate(item) {
  const product = normalizeProduct(item);
  if (!product) return "";
  const quantity = item?.quantity ?? product?.quantity ?? 1;

  const name = product.Name || product.NameWithoutBrand || "Unnamed Product";
  const color = product.Colors?.[0]?.ColorName || product.Color || "N/A";
  const imageUrl =
    product.Image || product.Images?.PrimaryMedium || "../images/placeholder.jpg";
  const price = Number(product.FinalPrice ?? product.SuggestedRetailPrice ?? 0);

  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" />
    </a>
    <a href="#"><h2 class="card__name">${escapeHtml(name)}</h2></a>
    <p class="cart-card__color">${escapeHtml(color)}</p>
    <p class="cart-card__quantity">Qty: ${quantity}</p>
    <p class="cart-card__price">$${(price * quantity).toFixed(2)}</p>
  </li>`;
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML = "<li>Your cart is empty</li>";
  } else {
    productList.innerHTML = cartItems.map(cartItemTemplate).join("");
  }

  updateTotal(cartItems);
  updateCartCount();
}

function updateTotal(cartItems) {
  const total = cartItems.reduce((sum, item) => {
    const product = normalizeProduct(item);
    if (!product) return sum;
    const quantity = item?.quantity ?? product?.quantity ?? 1;
    const price = Number(product.FinalPrice ?? product.SuggestedRetailPrice ?? 0);
    return sum + price * quantity;
  }, 0);

  const totalElement = document.querySelector(".list-total");
  if (totalElement) {
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    totalElement.classList.toggle("hide", cartItems.length === 0);
  }
}

initialize();
