import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

async function initialize() {
  await loadHeaderFooter(); // Espera a que el header se cargue
  
  const dataSource = new ExternalServices("tents");
  const productID = getParam("product");
  
  const product = new ProductDetails(productID, dataSource);
  product.init();
}

initialize(); // Llama a la función inicializadora