import ExternalServices from "./ExternalServices.mjs";
import { qs, loadHeaderFooter, normalizeProductData, normalizeProduct } from "./utils.mjs";

export async function initSearchProduct() {
  console.log("🔍 Iniciando búsqueda de productos...");

  await loadHeaderFooter();

  const service = new ExternalServices();

  const form = qs("#product-search-form");
  if (!form) {
    console.error("❌ No se encontró el formulario de búsqueda.");
    return;
  }

  console.log("✅ Formulario de búsqueda encontrado");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = qs("#product-search-input");
    const query = input.value.trim();
    if (!query) return;

    console.log("📂 Buscando productos con:", query);

    const categories = ["backpacks", "sleeping-bags", "tents"];
    let allResults = [];

    // Búsqueda en categorías locales
    for (let category of categories) {
      try {
        console.log(`🔎 Cargando ${category}...`);
        const data = await service.getData(category);
        const items = normalizeProductData(data).map(normalizeProduct);

        const matches = items.filter((p) =>
          p.name && p.name.toLowerCase().includes(query.toLowerCase())
        );

        console.group(`📄 Resultados en ${category}`);
        console.log(matches);
        console.groupEnd();

        allResults.push(...matches);
      } catch (err) {
        console.warn(`⚠️ Error cargando ${category}:`, err);
      }
    }

    // Búsqueda en hammocks (API)
    try {
      console.log("🔎 Cargando hammocks (API)...");
      const data = await service.getData("hammocks");
      const items = normalizeProductData(data).map(normalizeProduct);

      const matches = items.filter((p) =>
        p.name && p.name.toLowerCase().includes(query.toLowerCase())
      );

      console.group("📄 Resultados en hammocks");
      console.log(matches);
      console.groupEnd();

      allResults.push(...matches);
    } catch (err) {
      console.error("❌ Error buscando en API:", err);
    }

    console.group("🎯 Resultados finales encontrados");
    console.log(allResults);
    console.groupEnd();

    renderProducts(allResults);
  });

  // ✅ Evento para cerrar el pop-up
  const popup = document.getElementById("search-popup");
  const closeBtn = document.querySelector(".search-popup-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  // Cerrar haciendo clic fuera
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target.id === "search-popup") {
        popup.style.display = "none";
      }
    });
  }
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function renderProducts(products) {
  const popup = document.getElementById("search-popup");
  const list = popup.querySelector(".product-list");
  list.innerHTML = "";

  // Título dentro del popup
  const title = document.createElement("h2");
  title.textContent = "Resultados de la búsqueda:";
  title.style.gridColumn = "1 / -1";
  list.appendChild(title);

  if (products.length === 0) {
    const noResult = document.createElement("li");
    noResult.className = "no-products";
    noResult.textContent = "No se encontraron productos.";
    list.appendChild(noResult);
    popup.style.display = "flex";
    return;
  }

  products.forEach((product) => {
    const li = document.createElement("li");
    li.className = "product-card";
    li.style.listStyle = "none";
    li.style.marginBottom = "2rem";
    li.style.border = "1px solid #ddd";
    li.style.borderRadius = "8px";
    li.style.padding = "1rem";
    li.style.maxWidth = "300px";

    let priceHtml = `<span style="color:red; font-weight:bold;">$${product.price.toFixed(
      2
    )}</span>`;
    if (product.listPrice && product.listPrice !== product.price) {
      priceHtml = `<span style="color:gray; text-decoration:line-through;">$${product.listPrice.toFixed(
        2
      )}</span> ${priceHtml}`;
    }

    li.innerHTML = `
      <div class="card">
        <img src="${
          product.image || "https://via.placeholder.com/150"
        }" alt="${product.name}" style="width:100%; border-radius:6px; object-fit:cover;">
        <p style="margin:0.5rem 0; color:#8b5e3c; font-weight:bold;">${
          product.brand || "Marca"
        }</p>
        <h3 style="margin:0.25rem 0; font-size:1rem;">${product.name}</h3>
        <p style="margin:0.5rem 0; font-size:0.9rem; color:#333;">${
          product.description ? stripHtml(product.description) : "Sin descripción"
        }</p>
        <p style="margin:0.5rem 0;">${priceHtml}</p>
      </div>
    `;
    list.appendChild(li);
  });

  // ✅ Mostrar el popup
  popup.style.display = "flex";
}
