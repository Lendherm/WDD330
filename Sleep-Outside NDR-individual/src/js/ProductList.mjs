import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  // Usamos Image en lugar de Images.PrimaryMedium para coincidir con tu JSON
  const imageUrl = product.Image || "../images/placeholder.jpg";
  const brandName = product.Brand?.Name || "";
  const productName = product.NameWithoutBrand || product.Name || "Unnamed Product";
  const price = product.FinalPrice ? `$${product.FinalPrice.toFixed(2)}` : "$0.00";

  return `
    <li class="product-card">
      <a href="../product_pages/index.html?product=${product.Id}">
        <img src="${imageUrl}" alt="${productName}" loading="lazy">
        <h3 class="product-card__brand">${brandName}</h3>
        <h4 class="product-card__name">${productName}</h4>
        <p class="product-card__price">${price}</p>
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
      this.listElement.classList.add('loading');
      const data = await this.dataSource.getData(this.category);
      
      // Verificar si hay datos en data.Result
      if (!data.Result || data.Result.length === 0) {
        this.listElement.innerHTML = `
          <li class="no-products">
            No products available. Please try again later.
          </li>
        `;
        return;
      }
      
      this.renderList(data.Result);
      
      const titleElement = document.querySelector(".title.highlight");
      if (titleElement) {
        titleElement.textContent = this.category.charAt(0).toUpperCase() + 
                                 this.category.slice(1);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.listElement.innerHTML = `
        <li class="error-message">
          Error: ${error.message}
        </li>
      `;
    } finally {
      this.listElement.classList.remove('loading');
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
    }
  }
}