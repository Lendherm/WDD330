// Utilidades básicas
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Actualización del contador del carrito (versión mejorada)
export function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  const cartItems = getLocalStorage('so-cart') || [];
  const itemCount = cartItems.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);
  
  cartCountElement.textContent = itemCount;
  return itemCount; // Devuelve el conteo por si se necesita
}

// Función para ser llamada desde otras páginas
export function updateCart() {
  updateCartCount();
}

// Resto de tus utilidades existentes...
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

export async function loadHeaderFooter() {
  try {
    const [header, footer] = await Promise.all([
      loadTemplate("../partials/header.html"),
      loadTemplate("../partials/footer.html")
    ]);
    
    const headerElement = qs("#main-header");
    const footerElement = qs("#main-footer");
    
    if (headerElement) {
      renderWithTemplate(header, headerElement);
      // Actualizar el contador después de cargar el header
      updateCartCount();
    }
    if (footerElement) renderWithTemplate(footer, footerElement);
  } catch (error) {
    console.error("Error loading templates:", error);
  }
}

export function alertMessage(message, scroll = true) {
  // Remover alertas previas
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());

  // Crear nuevo elemento de alerta
  const alert = document.createElement('div');
  alert.classList.add('alert');
  
  // Contenido de la alerta con mejor estructura
  alert.innerHTML = `
    <div class="alert-content">
      <p>${message}</p>
      <button class="close-btn" aria-label="Cerrar mensaje">&times;</button>
    </div>
  `;

  // Manejar cierre de la alerta (versión corregida)
  alert.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-btn')) {
      this.remove();
    }
  });

  // Agregar al DOM
  const main = document.querySelector('main');
  if (main) {
    main.insertAdjacentElement('afterbegin', alert);
    
    // Agregar animación de aparición
    setTimeout(() => alert.classList.add('show'), 10);

    // Desplazarse al inicio si es necesario
    if (scroll) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Auto-eliminación después de 5 segundos
    setTimeout(() => {
      if (document.body.contains(alert)) {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
      }
    }, 5000);
  }
}

export function normalizeProduct(item) {
  if (!item) return null;
  let product = item;

  // Desenrollar múltiples niveles de Result
  while (product && product.Result && typeof product.Result === "object") {
    product = product.Result;
  }

  // Caso raro: ObjectResult.Result
  if (product && product.ObjectResult && product.ObjectResult.Result) {
    product = product.ObjectResult.Result;
  }

  // Validación mínima
  if (!product || !product.Id) return null;

  return product;
}

/**
 * Normaliza un array de productos
 */
export function normalizeProductList(items = []) {
  return items
    .map((item) => normalizeProduct(item))
    .filter(Boolean);
}

