 import ExternalServices from "./ExternalServices.mjs"; 
 import { qs, loadHeaderFooter } from "./utils.mjs"; 
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
            const categories = ["backpacks", "sleeping-bags", "tents"]; // JSON locales 
            let allResults = []; 
            // 🔍 Buscar en archivos JSON locales 
            
            for (let category of categories) { console.log(🔎 Intentando buscar en ${category}...); 
            try { const data = await service.getData(category); let matches = []; 
                
            if (data.Result && Array.isArray(data.Result)) { matches = data.Result.filter((p) => p.Name.toLowerCase().includes(query.toLowerCase()) ); } console.log(📄 Resultados en ${category}:, matches.length ? matches : "No hay coincidencias"); allResults.push(...matches); } catch (err) { console.warn(⚠️ No se pudo buscar en ${category}:, err); } } 
            // 🔍 Buscar en la API "hammocks" 
            try { console.log("🔎 Buscando en categoría: hammocks (API)..."); const data = await service.getData("hammocks"); let matches = []; if (data.Result && Array.isArray(data.Result)) { matches = data.Result.filter((p) => p.Name.toLowerCase().includes(query.toLowerCase()) ); } console.log(📄 Resultados en hammocks:, matches.length ? matches : "No hay coincidencias"); allResults.push(...matches); } catch (err) { console.error("❌ Error buscando en API:", err); } 
            // ✅ Mostrar todos los resultados 
            // 
            if (allResults.length > 0) { console.log("🎯 Resultados finales:", allResults); allResults.forEach(p => { console.log(- ${p.Name} (ID: ${p.Id})); }); } else { console.log("❌ No se encontraron resultados"); } }); }