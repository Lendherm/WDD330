import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const imageUrl =
    product.Image ||
    (product.Images && product.Images.PrimaryMedium) ||
    "../images/placeholder.jpg";

  const brandName = product.Brand?.Name || "";
  const productName =
    product.NameWithoutBrand || product.Name || "Unnamed Product";

  const finalPrice = product.FinalPrice || 0;
  const suggestedPrice = product.SuggestedRetailPrice || finalPrice;

  const hasDiscount = finalPrice < suggestedPrice;
  let discountHTML = "";
  let priceHTML = `$${finalPrice.toFixed(2)}`;

  if (hasDiscount) {
    const discountPercent = Math.round(
      ((suggestedPrice - finalPrice) / suggestedPrice) * 100
    );
    discountHTML = `<span class="so-discount-badge">-${discountPercent}%</span>`;
    priceHTML = `
      <span class="so-final-price">$${finalPrice.toFixed(2)}</span>
      <span class="so-old-price">$${suggestedPrice.toFixed(2)}</span>
    `;
  }

  return `
    <li class="product-card">
      <a href="../product_pages/index.html?product=${product.Id}">
        <div class="product-card__image-wrapper">
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
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    try {
      this.listElement.classList.add("loading");
      const data = await this.dataSource.getData(this.category);

      // Normalizar los datos según el formato del JSON
      let productList = [];
      if (Array.isArray(data)) {
        // Caso tents.json (array plano de productos)
        productList = data;
      } else if (data.Result && Array.isArray(data.Result)) {
        // Caso backpacks.json "normal"
        productList = data.Result;
      } else if (
        data.Result &&
        typeof data.Result === "object" &&
        Array.isArray(data.Result.Result)
      ) {
        // Caso sleeping-bags.json (Result dentro de otro Result)
        productList = data.Result.Result;
      } else if (data.ObjectResult && Array.isArray(data.ObjectResult.Result)) {
        // Caso raro: JSON envuelto en ObjectResult
        productList = data.ObjectResult.Result;
      } else {
        console.warn("Formato JSON desconocido:", data);
      }

      // Debug: ver qué datos se cargaron
      console.log("Data loaded for", this.category, ":", data);

      // Mostrar en consola los IDs de los productos encontrados
      if (productList && productList.length > 0) {
        console.log(
          `Products found in ${this.category}:`,
          productList.map((product) => product.Id)
        );
      } else {
        console.log(`No products found for category: ${this.category}`);
      }

      this.renderList(productList);

      // Actualizar el título
      const titleElement = document.querySelector(".title.highlight");
      if (titleElement) {
        titleElement.textContent =
          this.category.charAt(0).toUpperCase() + this.category.slice(1);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.listElement.innerHTML = `
        <li class="error-message">
          Error: ${error.message}
        </li>
      `;
    } finally {
      this.listElement.classList.remove("loading");
    }
  }

  renderList(list) {
    // Limpiar la lista antes de renderizar
    this.listElement.innerHTML = "";

    if (list && list.length > 0) {
      renderListWithTemplate(
        productCardTemplate,
        this.listElement,
        list,
        "beforeend"
      );
    } else {
      this.listElement.innerHTML = `
        <li class="no-products">
          No products found in this category.
        </li>
      `;
      console.log(`No products to render for category: ${this.category}`);
    }
  }
}
