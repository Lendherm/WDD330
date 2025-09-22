import { getLocalStorage, setLocalStorage, normalizeProduct } from "./utils.mjs";
import { updateCart } from "./cart.js"; // Importamos la función para actualizar el carrito

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    // Obtener los detalles del producto
    this.product = await this.dataSource.findProductById(this.productId);
    // Renderizar los detalles
    this.renderProductDetails();
    // Agregar event listener al botón
    this.addToCartButton();
  }

  addToCartButton() {
    const addButton = document.getElementById("add-to-cart");
    if (addButton) {
      addButton.addEventListener("click", () => {
        this.addProductToCart();
        this.showAddedToCartFeedback();
      });
    }
  }

  addProductToCart() {
    // Obtener el carrito actual
    const cartItems = getLocalStorage("so-cart") || [];

    // Normalizar el producto actual
    const normalized = normalizeProduct(this.product);

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => item.Id === normalized.Id);

    if (existingItemIndex >= 0) {
      // Si ya existe, incrementar la cantidad
      cartItems[existingItemIndex].quantity = (cartItems[existingItemIndex].quantity || 1) + 1;
    } else {
      // Si no existe, agregarlo con cantidad 1
      cartItems.push(normalized);
    }

    // Guardar en localStorage
    setLocalStorage("so-cart", cartItems);

    // Actualizar el contador del carrito
    updateCart();
  }

  showAddedToCartFeedback() {
    const addButton = document.getElementById("add-to-cart");
    if (addButton) {
      const originalText = addButton.textContent;
      addButton.textContent = "✓ Added to Cart";
      addButton.style.backgroundColor = "#4CAF50"; // Verde para indicar éxito

      // Restaurar el botón después de 2 segundos
      setTimeout(() => {
        addButton.textContent = originalText;
        addButton.style.backgroundColor = "";
      }, 2000);
    }
  }

  renderProductDetails() {
    if (!this.product || !this.product.Id) return;

    const productName = document.querySelector("h2");
    if (productName) {
      productName.textContent = this.product.Category 
        ? this.product.Category.charAt(0).toUpperCase() + this.product.Category.slice(1)
        : "Product Details";
    }

    const brandElement = document.querySelector("#p-brand");
    if (brandElement && this.product.Brand) {
      brandElement.textContent = this.product.Brand.Name || "";
    }

    const nameElement = document.querySelector("#p-name");
    if (nameElement) {
      nameElement.textContent = this.product.NameWithoutBrand || this.product.Name || "";
    }

    const productImage = document.querySelector("#p-image");
    if (productImage && this.product.Images) {
      productImage.src = this.product.Images.PrimaryExtraLarge || "";
      productImage.alt = this.product.NameWithoutBrand || this.product.Name || "";
    }

    const priceElement = document.querySelector("#p-price");
    if (priceElement && this.product.FinalPrice) {
      const euroPrice = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(Number(this.product.FinalPrice) * 0.85);
      priceElement.textContent = euroPrice;
    }

    const colorElement = document.querySelector("#p-color");
    if (colorElement && this.product.Colors && this.product.Colors[0]) {
      colorElement.textContent = this.product.Colors[0].ColorName || "";
    }

    const descElement = document.querySelector("#p-description");
    if (descElement && this.product.DescriptionHtmlSimple) {
      descElement.innerHTML = this.product.DescriptionHtmlSimple;
    }

    const cartButton = document.getElementById("add-to-cart");
    if (cartButton) {
      cartButton.dataset.id = this.product.Id;
    }
  }
}
