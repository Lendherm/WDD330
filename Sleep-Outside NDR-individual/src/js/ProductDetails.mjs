// src/js/ProductDetails.mjs
import { getLocalStorage, setLocalStorage, normalizeProduct, updateCart } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }

  async init() {
    try {
      this.product = await this.dataSource.findProductById(this.productId);
      console.log("✅ Producto cargado en detalles:", this.product);

      if (!this.product || !this.product.Id) {
        console.error("❌ No se pudo cargar el producto con ID:", this.productId);
        return;
      }

      this.renderProductDetails();
      this.addToCartButton();

      console.log("🛒 Carrito actual al cargar la página:", getLocalStorage("so-cart") || []);
    } catch (err) {
      console.error("❌ Error inicializando ProductDetails:", err);
    }
  }

  addToCartButton() {
    const addButton = document.getElementById("add-to-cart");
    if (addButton) {
      addButton.addEventListener("click", () => {
        console.log("👉 Click en Add to Cart, producto actual:", this.product);
        this.addProductToCart();
        this.showAddedToCartFeedback();
      });
    } else {
      console.error("❌ No se encontró el botón Add to Cart en el DOM");
    }
  }

  addProductToCart() {
    let cartItems = getLocalStorage("so-cart") || [];
    console.log("🔎 Antes de agregar:", cartItems);

    cartItems = cartItems.map(item => normalizeProduct(item)).filter(Boolean);
    const product = normalizeProduct(this.product);
    if (!product) {
      console.error("❌ No se pudo normalizar el producto:", this.product);
      return;
    }

    console.log("📦 Producto normalizado:", product);

    const existingItemIndex = cartItems.findIndex(item => item.Id === product.Id);

    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity =
        (cartItems[existingItemIndex].quantity || 1) + 1;
      console.log(`🔁 Producto existente, nueva cantidad: ${cartItems[existingItemIndex].quantity}`);
    } else {
      product.quantity = 1;
      cartItems.push(product);
      console.log("➕ Producto nuevo agregado al carrito.");
    }

    setLocalStorage("so-cart", cartItems);
    updateCart();

    console.log("✅ Carrito actualizado:", cartItems);
  }

  showAddedToCartFeedback() {
    const addButton = document.getElementById("add-to-cart");
    if (addButton) {
      const originalText = addButton.textContent;
      addButton.textContent = "✓ Added to Cart";
      addButton.style.backgroundColor = "#4CAF50";

      setTimeout(() => {
        addButton.textContent = originalText;
        addButton.style.backgroundColor = "";
      }, 2000);
    }
  }

  renderProductDetails() {
    if (!this.product || !this.product.Id) {
      console.error("❌ No se puede renderizar: producto inválido", this.product);
      return;
    }

    console.log("🎨 Renderizando producto:", this.product.Id);

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

    // 🔑 Manejo de imagen (local + API)
    const productImage = document.querySelector("#p-image");
    if (productImage) {
      let imageUrl =
        (this.product.Images && (this.product.Images.PrimaryExtraLarge || this.product.Images.PrimaryMedium)) ||
        this.product.Image ||
        "../images/placeholder.jpg";

      // Normalizar si es local (no empieza con http)
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `/images/${imageUrl.replace(/^.*images[\\/]/, "")}`;
      }

      productImage.src = imageUrl;
      productImage.alt = this.product.NameWithoutBrand || this.product.Name || "Product";
    }

const priceElement = document.querySelector("#p-price");
if (priceElement) {
  const finalPrice = Number(this.product.FinalPrice) || 0;
  const suggestedPrice = Number(this.product.SuggestedRetailPrice) || finalPrice;

  const hasDiscount = finalPrice < suggestedPrice;

  if (hasDiscount) {
    const discountPercent = Math.round(
      ((suggestedPrice - finalPrice) / suggestedPrice) * 100
    );
    priceElement.innerHTML = `
      <span class="so-final-price">$${finalPrice.toFixed(2)}</span>
      <span class="so-old-price">$${suggestedPrice.toFixed(2)}</span>
      <span class="so-discount-badge">-${discountPercent}%</span>
    `;
  } else {
    priceElement.innerHTML = `<span class="so-final-price">$${finalPrice.toFixed(2)}</span>`;
  }
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
      console.log("🖲️ Botón Add to Cart vinculado al producto:", this.product.Id);
    }
  }
}
