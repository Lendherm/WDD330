// src/js/ExternalServices.mjs
const baseURL = "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw {
      name: "servicesError",
      message: jsonResponse.message || "Error en el servidor",
      details: jsonResponse.details || null,
      status: res.status,
    };
  }
}

export default class ExternalServices {
  constructor() {}

  // Cargar productos de una categoría (JSON local → API fallback)
  async getData(category) {
    // 1. Intentar JSON local
    try {
      const localResponse = await fetch(`/json/${category}.json`);
      if (!localResponse.ok) {
        throw new Error(`Local JSON file for ${category} not found`);
      }
      const localData = await localResponse.json();

      console.log("✅ Using local JSON data for", category);
      return { Result: localData };
    } catch (localError) {
      console.warn("⚠️ Failed to load local JSON, trying API...", localError);

      // 2. Fallback → API
      try {
        const url = `${baseURL}products/search/${category}`;
        console.log("🌐 Fetching from API:", url);

        const apiResponse = await fetch(url);
        console.log("📡 API response status:", apiResponse.status);

        const apiData = await convertToJson(apiResponse);
        console.log("✅ Using API data for", category, apiData);

        if (apiData.Result && apiData.Result.length > 0) {
          return apiData;
        }

        throw new Error("API returned empty data");
      } catch (apiError) {
        console.error("❌ Both local and API requests failed:", apiError);
        throw new Error(
          `No se pudieron cargar los productos ni desde el archivo local ni desde la API`
        );
      }
    }
  }

  // Buscar un producto por ID (JSON local → API fallback)
async findProductById(id) {
  const categories = ["tents", "sleeping-bags", "backpacks"]; // Ajusta según tus JSON locales

  // 1. Buscar en JSON local
  try {
    for (let category of categories) {
      const localResponse = await fetch(`/json/${category}.json`);
      if (!localResponse.ok) continue;

      const localData = await localResponse.json();
      const productList = Array.isArray(localData)
        ? localData
        : localData.Result || [];

      const found = productList.find((p) => p.Id === id);
      if (found) {
        console.log(
          `✅ Producto encontrado en JSON local (${category}) con ID ${id}`
        );
        return found;
      }
    }

    console.warn(
      `⚠️ Producto ${id} no encontrado en JSON local. Usando API...`
    );
  } catch (localError) {
    console.warn("Error buscando en JSON local:", localError);
  }

  // 2. Fallback → API
  try {
    const url = `${baseURL}product/${id}`;
    console.log("🌐 Fetching product from API:", url);

    const response = await fetch(url);
    console.log("📡 API response status:", response.status);

    if (!response.ok) throw new Error("API request failed");

    const data = await convertToJson(response);
    console.log("✅ Producto recibido desde API:", data);

    // 🔑 Desempaquetar Result si existe
    if (data && data.Result) {
      return data.Result;
    }

    return data;
  } catch (err) {
    console.error("❌ Error al obtener producto desde API:", err);
    return {};
  }
}

  // Enviar carrito al checkout
  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(`${baseURL}checkout`, options);
      return convertToJson(response);
    } catch (error) {
      console.error("Checkout failed:", error);
      throw error;
    }
  }
}
