import { loadHeaderFooter, getParam, alertMessage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.mjs";

let isInitialized = false;

async function initializeProductListing() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    await loadHeaderFooter();

    // Inicializar alertas
    try {
      const alertSystem = new Alert();
      await alertSystem.init();
    } catch (alertError) {
      console.warn("Alert system failed:", alertError);
    }

    const category = getParam("category") || "default-category";

    // Pasa el ID directamente
    const dataSource = new ExternalServices();
    const productListing = new ProductList(category, dataSource, "product-listing-container");
    await productListing.init();

    console.log("Products rendered successfully.");
  } catch (error) {
    console.error("Initialization failed:", error);
    alertMessage(`Failed to load products: ${error.message}`, false);
  }
}

if (document.readyState !== "loading") {
  initializeProductListing();
} else {
  document.addEventListener("DOMContentLoaded", initializeProductListing);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    isInitialized = false;
  });
}
