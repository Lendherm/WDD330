const baseURL = "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw { 
      name: 'servicesError', 
      message: jsonResponse.message || 'Error en el servidor',
      details: jsonResponse.details || null,
      status: res.status
    };
  }
}

export default class ExternalServices {
  constructor() {
    // Constructor vacío
  }

  async getData(category) {
    // Primero intentamos con el JSON local
    try {
      const localResponse = await fetch(`/json/${category}.json`);
      if (!localResponse.ok) {
        throw new Error(`Local JSON file for ${category} not found`);
      }
      const localData = await localResponse.json();
      
      // Formateamos para que coincida con la estructura de la API
      console.log('Using local JSON data for', category);
      return { Result: localData };
      
    } catch (localError) {
      console.warn('Failed to load local JSON, trying API...', localError);
      
      // Si falla el JSON local, intentamos con la API
      try {
        const apiResponse = await fetch(`${baseURL}products/search/${category}`);
        const apiData = await convertToJson(apiResponse);
        
        if (apiData.Result && apiData.Result.length > 0) {
          console.log('Using API data for', category);
          return apiData;
        }
        
        throw new Error('API returned empty data');
      } catch (apiError) {
        console.error('Both local and API requests failed:', apiError);
        throw new Error(`No se pudieron cargar los productos ni desde el archivo local ni desde la API`);
      }
    }
  }

  async findProductById(id) {
    // Implementación similar con prioridad al JSON local
    try {
      // Primero buscamos en todos los JSON locales (requeriría implementación adicional)
      throw new Error('Local product search not implemented, using API');
      
    } catch (localError) {
      console.warn(localError.message);
      
      // Si falla la búsqueda local, usamos la API
      const response = await fetch(`${baseURL}product/${id}`);
      return convertToJson(response);
    }
  }

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
      console.error('Checkout failed:', error);
      throw error;
    }
  }
}