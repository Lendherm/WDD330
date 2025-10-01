// src/js/utils.mjs

// -----------------------------
// Utilidades básicas
// -----------------------------
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// -----------------------------
// Actualización del carrito
// -----------------------------
export function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  const cartItems = getLocalStorage('so-cart') || [];
  const itemCount = cartItems.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);
  
  cartCountElement.textContent = itemCount;
  return itemCount;
}

export function updateCart() {
  updateCartCount();
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// -----------------------------
// Render helpers
// -----------------------------
export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML(position, list.map(template).join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

async function loadTemplate(path) {
  const res = await fetch(path);
  return await res.text();
}

export async function loadHeaderFooter(callback) {
  try {
    const [header, footer] = await Promise.all([
      loadTemplate("../partials/header.html"),
      loadTemplate("../partials/footer.html")
    ]);

    const headerElement = qs("#main-header");
    const footerElement = qs("#main-footer");

    if (headerElement) {
      renderWithTemplate(header, headerElement);
      updateCartCount();
      if (callback) callback();
    }

    if (footerElement) renderWithTemplate(footer, footerElement);
  } catch (error) {
    console.error("Error loading templates:", error);
  }
}

// -----------------------------
// Alertas
// -----------------------------
export function alertMessage(message, scroll = true) {
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());

  const alert = document.createElement('div');
  alert.classList.add('alert');
  
  alert.innerHTML = `
    <div class="alert-content">
      <p>${message}</p>
      <button class="close-btn" aria-label="Cerrar mensaje">&times;</button>
    </div>
  `;

  alert.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-btn')) {
      this.remove();
    }
  });

  const main = document.querySelector('main');
  if (main) {
    main.insertAdjacentElement('afterbegin', alert);
    setTimeout(() => alert.classList.add('show'), 10);
    if (scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (document.body.contains(alert)) {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
      }
    }, 5000);
  }
}

// -----------------------------
// Normalización de productos
// -----------------------------
export function normalizeProduct(item) {
  if (!item) return null;

  // Desenredar Result wrappers
  let product = item;
  while (product && product.Result && typeof product.Result === "object") {
    product = product.Result;
  }
  if (product && product.ObjectResult?.Result) {
    product = product.ObjectResult.Result;
  }

  if (!product || !(product.Id || product.id)) return null;

  return {
    id: product.Id || product.id || "",
    name: product.Name || product.NameWithoutBrand || product.title || "Sin nombre",
    brand: product.Brand?.Name || product.brand || "",
    price: product.FinalPrice || product.ListPrice || product.price || null,
    listPrice: product.ListPrice || product.listPrice || null,
    url: product.WebUrl || product.AffiliateWebUrl || product.Url || "#",
    image: getProductImage(product),
    isNew: product.IsNew || false,
    isClearance: product.IsClearance || false,
    description: product.DescriptionHtmlSimple || product.description || "",
  };
}

function getProductImage(product) {
  if (product.Image && product.Image !== "https://via.placeholder.com/150") {
    return fixImagePath(product.Image);
  }
  if (product.Images) {
    if (product.Images.PrimaryMedium) return fixImagePath(product.Images.PrimaryMedium);
    if (product.Images.PrimaryLarge) return fixImagePath(product.Images.PrimaryLarge);
    if (product.Images.PrimarySmall) return fixImagePath(product.Images.PrimarySmall);
  }
  return "https://via.placeholder.com/150";
}

function fixImagePath(path) {
  if (!path) return "https://via.placeholder.com/150";
  if (path.startsWith("../") || path.startsWith("./")) {
    return window.location.origin + "/" + path.replace(/^(\.\.\/|\.\/)+/, "");
  }
  return path;
}

export function normalizeProductList(items = []) {
  return items.map(normalizeProduct).filter(Boolean);
}

export function normalizeProductData(data) {
  if (!data) return [];

  let items = data;
  while (items.Result && typeof items.Result === "object") {
    items = items.Result;
  }

  if (Array.isArray(items)) return items;
  if (items.Items && Array.isArray(items.Items)) return items.Items;
  if (Array.isArray(items.Result)) return items.Result;

  console.warn("⚠️ Estructura de datos desconocida:", data);
  return [];
}
