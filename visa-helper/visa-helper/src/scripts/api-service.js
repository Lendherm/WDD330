// ===== SERVICIO DE APIS =====

class APIService {
    static baseURLs = {
        countries: 'https://restcountries.com/v3.1',
        translation: 'https://translation.googleapis.com/language/translate/v2',
        // Nota: Google Calendar API requiere autenticación OAuth2
    };

    static apiKeys = {
        // En un proyecto real, estas keys vendrían de variables de entorno
        translation: 'TU_API_KEY_GOOGLE_TRANSLATE'
    };

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// ===== SERVICIO DE TRADUCCIÓN =====
class TranslationService {
    static async translateText(text, targetLanguage = 'en') {
        try {
            // Simulación de API call (en producción usarías la API real)
            const response = await this.mockTranslateAPI(text, targetLanguage);
            
            APIService.showNotification('Texto traducido correctamente', 'success');
            document.getElementById('translation-status').textContent = 'Funcionando';
            document.getElementById('translation-status').className = 'api-status connected';
            
            return response;
        } catch (error) {
            console.error('Error en traducción:', error);
            APIService.showNotification('Error en la traducción', 'error');
            document.getElementById('translation-status').textContent = 'Error';
            document.getElementById('translation-status').className = 'api-status error';
            return text; // Retorna texto original en caso de error
        }
    }

    static async mockTranslateAPI(text, targetLanguage) {
        // Simulación de llamada a API con delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const translations = {
                    'es': {
                        'Hola mundo': 'Hello world',
                        'Información personal': 'Personal information',
                        'Gracias por su aplicación': 'Thank you for your application'
                    }
                };
                
                const translated = translations[targetLanguage]?.[text] || `[TRANSLATED: ${text}]`;
                resolve(translated);
            }, 1000);
        });
    }

    static async translateForm() {
        const purpose = document.getElementById('purpose');
        const additionalInfo = document.getElementById('additionalInfo');
        
        if (purpose.value) {
            purpose.value = await this.translateText(purpose.value, 'en');
        }
        
        if (additionalInfo.value) {
            additionalInfo.value = await this.translateText(additionalInfo.value, 'en');
        }
        
        APIService.showNotification('Formulario traducido al inglés', 'success');
    }

    static demoTranslate() {
        const sampleText = "Hola, necesito ayuda con mi visa de turista";
        this.translateText(sampleText, 'en').then(translated => {
            APIService.showNotification(`Ejemplo: "${sampleText}" → "${translated}"`, 'info');
        });
    }
}

// ===== SERVICIO DE PAÍSES =====
class CountryService {
    static async loadCountries() {
        try {
            document.getElementById('countries-status').textContent = 'Cargando...';
            document.getElementById('countries-status').className = 'api-status loading';
            
            const response = await fetch(`${APIService.baseURLs.countries}/all`);
            const countries = await response.json();
            
            this.populateCountrySelect(countries);
            
            APIService.showNotification(`Loaded ${countries.length} countries`, 'success');
            document.getElementById('countries-status').textContent = `${countries.length} países`;
            document.getElementById('countries-status').className = 'api-status connected';
            
        } catch (error) {
            console.error('Error loading countries:', error);
            APIService.showNotification('Error cargando países', 'error');
            document.getElementById('countries-status').textContent = 'Error';
            document.getElementById('countries-status').className = 'api-status error';
            
            // Fallback a datos locales
            this.loadLocalCountries();
        }
    }

    static populateCountrySelect(countries) {
        const select = document.getElementById('country');
        select.innerHTML = '<option value="">Selecciona un país</option>';
        
        countries
            .sort((a, b) => a.name.common.localeCompare(b.name.common))
            .forEach(country => {
                const option = document.createElement('option');
                option.value = country.cca2;
                option.textContent = country.name.common;
                select.appendChild(option);
            });
    }

    static async loadLocalCountries() {
        // Datos de países de respaldo
        const fallbackCountries = [
            { cca2: 'MX', name: { common: 'México' } },
            { cca2: 'US', name: { common: 'United States' } },
            { cca2: 'CA', name: { common: 'Canada' } },
            { cca2: 'ES', name: { common: 'Spain' } },
            { cca2: 'FR', name: { common: 'France' } },
            { cca2: 'DE', name: { common: 'Germany' } },
            { cca2: 'IT', name: { common: 'Italy' } },
            { cca2: 'JP', name: { common: 'Japan' } },
            { cca2: 'KR', name: { common: 'South Korea' } },
            { cca2: 'CN', name: { common: 'China' } },
            { cca2: 'BR', name: { common: 'Brazil' } },
            { cca2: 'AR', name: { common: 'Argentina' } },
            { cca2: 'CO', name: { common: 'Colombia' } },
            { cca2: 'PE', name: { common: 'Peru' } },
            { cca2: 'CL', name: { common: 'Chile' } }
        ];
        
        this.populateCountrySelect(fallbackCountries);
    }

    static async getCountryInfo(countryCode) {
        try {
            const response = await fetch(`${APIService.baseURLs.countries}/alpha/${countryCode}`);
            const country = await response.json();
            return country[0];
        } catch (error) {
            console.error('Error getting country info:', error);
            return null;
        }
    }
}

// ===== SERVICIO DE CALENDARIO =====
class CalendarService {
    static async addEvent(eventDetails) {
        try {
            // Simulación de integración con Google Calendar API
            const event = await this.mockCalendarAPI(eventDetails);
            
            APIService.showNotification('Evento agregado al calendario', 'success');
            document.getElementById('calendar-status').textContent = 'Evento agregado';
            document.getElementById('calendar-status').className = 'api-status connected';
            
            return event;
        } catch (error) {
            console.error('Error adding calendar event:', error);
            APIService.showNotification('Error agregando evento al calendario', 'error');
            document.getElementById('calendar-status').textContent = 'Error';
            document.getElementById('calendar-status').className = 'api-status error';
        }
    }

    static async mockCalendarAPI(eventDetails) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'event_' + Date.now(),
                    ...eventDetails,
                    created: new Date().toISOString()
                });
            }, 1000);
        });
    }

    static async scheduleAppointment() {
        const type = document.getElementById('appointment-type').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        
        if (!type || !date || !time) {
            APIService.showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        const eventDetails = {
            summary: `Cita de Visa - ${this.getAppointmentTypeName(type)}`,
            description: 'Cita programada a través de Visa Helper',
            start: `${date}T${time}:00`,
            end: `${date}T${this.addHour(time)}:00`,
            location: 'Embajada de EE.UU.'
        };
        
        await this.addEvent(eventDetails);
        
        // Actualizar lista de citas
        this.updateAppointmentsList(eventDetails);
    }

    static getAppointmentTypeName(type) {
        const types = {
            'biometrics': 'Toma de Huellas',
            'interview': 'Entrevista',
            'document-delivery': 'Entrega de Documentos'
        };
        return types[type] || type;
    }

    static addHour(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const newHours = (hours + 1) % 24;
        return newHours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
    }

    static updateAppointmentsList(event) {
        const appointmentsList = document.getElementById('appointments-list');
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'deadline-item';
        appointmentElement.innerHTML = `
            <strong>${event.summary}</strong><br>
            Fecha: ${new Date(event.start).toLocaleDateString()}<br>
            Hora: ${new Date(event.start).toLocaleTimeString()}<br>
            Lugar: ${event.location}
        `;
        appointmentsList.appendChild(appointmentElement);
    }

    static async addFormDeadline() {
        const eventDetails = {
            summary: 'Vencimiento de Formulario DS-160',
            description: 'Recuerda completar y enviar el formulario DS-160 para tu visa',
            start: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días desde hoy
            end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hora
            location: 'Sistema en línea'
        };
        
        await this.addEvent(eventDetails);
    }

    static demoAddEvent() {
        const eventDetails = {
            summary: 'Demo - Recordatorio de Visa',
            description: 'Esta es una demostración de la integración con calendario',
            start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días desde hoy
            end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            location: 'Visa Helper App'
        };
        
        this.addEvent(eventDetails);
    }
}

// ===== INICIALIZACIÓN DE APIS AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    // Cargar países automáticamente
    CountryService.loadCountries();
    
    // Inicializar estado de APIs
    document.getElementById('translation-status').className = 'api-status connected';
    document.getElementById('calendar-status').className = 'api-status connected';
});