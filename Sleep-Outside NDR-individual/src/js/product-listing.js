import { loadHeaderFooter, getParam, alertMessage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.mjs";

// Control de inicialización
let isInitialized = false;

/**
 * Main initialization function for the product listing page
 */
async function initializeProductListing() {
  // Prevent duplicate initialization
  if (isInitialized) return;
  isInitialized = true;

  try {
    // Phase 1: Load essential components
    await loadHeaderFooter();
    
    // Phase 2: Initialize alert system
    try {
      const alertSystem = new Alert();
      await alertSystem.init();
    } catch (alertError) {
      console.warn("Alert system failed:", alertError);
      // Non-critical failure, continue execution
    }
    
    // Phase 3: Get category and validate
    const category = getParam("category");
    if (!category) {
      throw new Error("Please specify a product category in the URL");
    }
    
    // Phase 4: Load and display products
    const dataSource = new ExternalServices();
    const productListElement = document.querySelector(".product-list");
    
    if (!productListElement) {
      throw new Error("Product list container not found");
    }
    
    const productListing = new ProductList(category, dataSource, productListElement);
    await productListing.init();
    
  } catch (error) {
    handleInitializationError(error);
  }
}

/**
 * Handles initialization errors gracefully
 * @param {Error} error The error object
 */
function handleInitializationError(error) {
  console.error("Initialization failed:", error);
  
  // Show user-friendly error message
  alertMessage(`Failed to load products: ${error.message}`, false);
  
  // Optionally log error to analytics service
  // logErrorToService(error);
}

// Modern event listener with cleanup consideration
function setupEventListeners() {
  document.removeEventListener('DOMContentLoaded', initializeProductListing);
  document.addEventListener('DOMContentLoaded', initializeProductListing);
}

// Initialize the page
if (document.readyState !== 'loading') {
  // DOM already ready, execute immediately
  initializeProductListing();
} else {
  // Wait for DOM to be ready
  setupEventListeners();
}

// For module hot reloading in development
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Cleanup if needed when module is reloaded
    isInitialized = false;
  });
}