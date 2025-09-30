import {
  getLocalStorage,
  loadHeaderFooter,
  updateCartCount,
  normalizeProduct,
} from "./utils.mjs";

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

  return `
  <li class="cart-card divider">
    <div class="cart-card__image">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" />
    </div>
    <div class="cart-card__info">
      <div class="cart-card__header">
        <h2 class="card__name">${escapeHtml(name)}</h2>
        <span class="cart-remove" data-id="${product.Id}">&times;</span>
      </div>
      <p class="cart-card__color">Color: ${escapeHtml(color)}</p>
      <p class="cart-card__quantity">Qty: ${quantity}</p>
      <p class="cart-card__price">$${(price * quantity).toFixed(2)}</p>
    </div>
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

    // ✅ agregar listeners a todos los botones de eliminar
    document.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", removeFromCart);
    });
  }

  updateTotal(cartItems);
  updateCartCount();
}

function removeFromCart(event) {
  const idToRemove = event.target.getAttribute("data-id");
  let cartItems = getLocalStorage("so-cart") || [];

  cartItems = cartItems.filter(
    (item) => String(normalizeProduct(item)?.Id) !== String(idToRemove)
  );

  localStorage.setItem("so-cart", JSON.stringify(cartItems));
  renderCartContents();
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
