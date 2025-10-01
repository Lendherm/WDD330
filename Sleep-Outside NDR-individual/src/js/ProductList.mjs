import { normalizeProductList } from "./utils.mjs";

function productCardTemplate(product) {
  const imageUrl = product.image || "../images/placeholder.jpg";
  const brandName = product.brand || "Brand Unknown";
  const productName = product.name || "Unnamed Product";
  const finalPrice = Number(product.price) || 0;
  const suggestedPrice = Number(product.listPrice) || finalPrice;

  const hasDiscount = finalPrice < suggestedPrice;
  let discountHTML = "";
  let priceHTML = `$${finalPrice.toFixed(2)}`;

  if (hasDiscount) {
    const discountPercent = Math.round(((suggestedPrice - finalPrice) / suggestedPrice) * 100);
    discountHTML = `<span class="so-discount-badge">-${discountPercent}%</span>`;
    priceHTML = `
      <span class="so-final-price">$${finalPrice.toFixed(2)}</span>
      <span class="so-old-price">$${suggestedPrice.toFixed(2)}</span>
    `;
  }

  const safeId = encodeURIComponent(product.id || `prod-${Math.floor(Math.random() * 1000000)}`);

  return `
    <li class="product-card" data-product-id="${safeId}">
      <a href="../product_pages/index.html?product=${safeId}">
        <div class="product-card__image-wrapper" style="position: relative;">
          <img src="${imageUrl}" alt="${productName}" loading="lazy">
          ${discountHTML}
        </div>
        <h3 class="product-card__brand">${brandName}</h3>
        <h4 class="product-card__name">${productName}</h4>
        <p class="product-card__price">${priceHTML}</p>
      </a>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElementId) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = document.getElementById(listElementId);

    if (!this.listElement) console.error("❌ Product list element not found!");
  }

  async init() {
    if (!this.listElement) return;

    try {
      this.listElement.classList.add("loading");

      const data = await this.dataSource.getData(this.category);
      let rawItems = [];

      if (Array.isArray(data)) rawItems = data;
      else if (Array.isArray(data.Result)) rawItems = data.Result;
      else if (Array.isArray(data.Result?.Result)) rawItems = data.Result.Result;
      else if (Array.isArray(data.ObjectResult?.Result)) rawItems = data.ObjectResult.Result;
      else console.warn("⚠️ Unknown JSON format:", data);

      const productList = normalizeProductList(rawItems);
      console.log("Normalized products:", productList);

      if (productList.length > 0) {
        this.listElement.innerHTML = productList.map(productCardTemplate).join("");
      } else {
        this.listElement.innerHTML = `<li class="no-products">No products found in this category.</li>`;
      }

      this.listElement.classList.remove("loading");

      const titleElement = document.querySelector(".title.highlight");
      if (titleElement) titleElement.textContent = this.category.charAt(0).toUpperCase() + this.category.slice(1);

      console.log("✅ Products rendered successfully.");
    } catch (err) {
      console.error("Error loading products:", err);
      this.listElement.innerHTML = `<li class="error-message">Error: ${err.message}</li>`;
      this.listElement.classList.remove("loading");
    }
  }
}
