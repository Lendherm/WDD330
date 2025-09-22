import { loadHeaderFooter, alertMessage } from "./utils.mjs";

export default class Geolocation {
  constructor() {
    this.mapContainer = document.createElement("div");
    this.mapContainer.id = "map-container";
    this.mapContainer.style.height = "400px";
    this.mapContainer.style.margin = "1rem 0";
    
    this.loadMapScript();
  }

  async init() {
    await loadHeaderFooter();
    this.getLocation();
  }

  getLocation() {
    const geoElement = document.createElement("div");
    geoElement.id = "geolocation-info";
    document.querySelector("main").appendChild(geoElement);
    document.querySelector("main").appendChild(this.mapContainer);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => this.showPosition(position),
        error => this.handleError(error)
      );
    } else {
      geoElement.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  showPosition(position) {
    const { latitude, longitude } = position.coords;
    const geoElement = document.getElementById("geolocation-info");
    
    geoElement.innerHTML = `
      <h2>Your Location</h2>
      <p>Latitude: ${latitude.toFixed(6)}</p>
      <p>Longitude: ${longitude.toFixed(6)}</p>
    `;

    // Mostrar mapa usando Leaflet.js (que cargamos en loadMapScript)
    if (window.L) {
      this.displayMap(latitude, longitude);
    } else {
      // Si Leaflet no está cargado aún, intentar nuevamente después de un retraso
      setTimeout(() => {
        if (window.L) this.displayMap(latitude, longitude);
      }, 1000);
    }
  }

  displayMap(lat, lng) {
    const map = L.map('map-container').setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
      .bindPopup('You are here!')
      .openPopup();
  }

  handleError(error) {
    let message = "";
    switch(error.code) {
      case error.PERMISSION_DENIED:
        message = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        message = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        message = "An unknown error occurred.";
        break;
    }
    alertMessage(message);
  }

  loadMapScript() {
    // Cargar Leaflet.js para los mapas
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
    script.crossOrigin = '';
    script.onload = () => console.log('Leaflet loaded successfully');
    script.onerror = () => console.error('Failed to load Leaflet');
    document.head.appendChild(script);
  }
}

// Inicialización
const geolocation = new Geolocation();
geolocation.init();