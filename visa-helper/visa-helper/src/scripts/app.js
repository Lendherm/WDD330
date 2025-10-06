// ===== APLICACIÓN PRINCIPAL =====

class VisaHelperApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.userProgress = {
            forms: 2,
            documents: 3,
            appointments: 1,
            overall: 25
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.renderDashboard();
        this.loadDocuments();
        this.setupAppointments();
    }

    setupEventListeners() {
        // Navegación del menú lateral
        document.querySelectorAll('.side-menu a[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Botón de iniciar proceso
        document.getElementById('start-process').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToSection('forms');
        });

        // Cerrar menú al hacer clic en overlay
        document.getElementById('overlay').addEventListener('click', () => {
            this.closeMenu();
        });

        // Navegación desde las tarjetas del dashboard
        document.querySelectorAll('.dashboard-card[data-section]').forEach(card => {
            card.addEventListener('click', () => {
                const section = card.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Manejar hash changes para deep linking
        window.addEventListener('hashchange', () => {
            const section = window.location.hash.substring(1) || 'dashboard';
            this.navigateToSection(section);
        });
    }

    navigateToSection(section) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
            
            // Actualizar URL
            window.location.hash = section;
            
            // Actualizar enlace activo en el menú
            this.updateActiveMenuLink(section);
        }

        // Cerrar menú en móviles
        if (window.innerWidth <= 768) {
            this.closeMenu();
        }
    }

    updateActiveMenuLink(section) {
        document.querySelectorAll('.side-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.side-menu a[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    closeMenu() {
        document.getElementById('side-menu').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
    }

    loadUserData() {
        // Simular carga de datos del usuario
        const savedProgress = localStorage.getItem('visaHelperProgress');
        if (savedProgress) {
            this.userProgress = JSON.parse(savedProgress);
        }
        
        this.updateProgressUI();
    }

    updateProgressUI() {
        document.getElementById('progress-fill').style.width = `${this.userProgress.overall}%`;
        document.getElementById('progress-text').textContent = `${this.userProgress.overall}% completado`;
        document.getElementById('forms-completed').textContent = this.userProgress.forms;
        document.getElementById('docs-uploaded').textContent = this.userProgress.documents;
        document.getElementById('appointments-scheduled').textContent = this.userProgress.appointments;
    }

    renderDashboard() {
        // El dashboard ya está renderizado en el HTML
        // Aquí se pueden agregar actualizaciones dinámicas
    }

    loadDocuments() {
        const documents = [
            { id: 1, name: 'Pasaporte', status: 'completed', icon: 'bi-passport' },
            { id: 2, name: 'Fotografías', status: 'completed', icon: 'bi-image' },
            { id: 3, name: 'Formulario DS-160', status: 'completed', icon: 'bi-file-text' },
            { id: 4, name: 'Comprobante de Pago', status: 'pending', icon: 'bi-cash-stack' },
            { id: 5, name: 'Constancia Laboral', status: 'required', icon: 'bi-briefcase' },
            { id: 6, name: 'Estados de Cuenta', status: 'required', icon: 'bi-bank' },
            { id: 7, name: 'Comprobante de Domicilio', status: 'required', icon: 'bi-house' },
            { id: 8, name: 'Itinerario de Viaje', status: 'required', icon: 'bi-airplane' }
        ];

        const container = document.getElementById('documents-container');
        container.innerHTML = '';

        documents.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'document-card';
            card.innerHTML = `
                <i class="bi ${doc.icon}"></i>
                <h3>${doc.name}</h3>
                <div class="document-status status-${doc.status}">
                    ${this.getStatusText(doc.status)}
                </div>
            `;
            container.appendChild(card);
        });
    }

    getStatusText(status) {
        const statusTexts = {
            'completed': 'Completado',
            'pending': 'Pendiente',
            'required': 'Requerido'
        };
        return statusTexts[status] || status;
    }

    setupAppointments() {
        // Cargar citas existentes
        const savedAppointments = JSON.parse(localStorage.getItem('visaHelperAppointments')) || [];
        this.renderAppointments(savedAppointments);
    }

    renderAppointments(appointments) {
        const container = document.getElementById('appointments-list');
        
        if (appointments.length === 0) {
            container.innerHTML = '<div class="deadline-item">No hay citas programadas</div>';
            return;
        }

        container.innerHTML = '';
        appointments.forEach(appointment => {
            const element = document.createElement('div');
            element.className = 'deadline-item';
            element.innerHTML = `
                <strong>${appointment.summary}</strong><br>
                Fecha: ${new Date(appointment.start).toLocaleDateString()}<br>
                Hora: ${new Date(appointment.start).toLocaleTimeString()}<br>
                Lugar: ${appointment.location}
            `;
            container.appendChild(element);
        });
    }

    saveAppointment(appointment) {
        const appointments = JSON.parse(localStorage.getItem('visaHelperAppointments')) || [];
        appointments.push(appointment);
        localStorage.setItem('visaHelperAppointments', JSON.stringify(appointments));
        this.renderAppointments(appointments);
    }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Configurar menú lateral
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    // Actualizar año actual y última modificación
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    document.getElementById('lastModified').textContent = 'Última modificación: ' + document.lastModified;

    // Inicializar aplicación
    window.visaHelperApp = new VisaHelperApp();

    // Manejar sección inicial desde hash de URL
    const initialSection = window.location.hash.substring(1) || 'dashboard';
    window.visaHelperApp.navigateToSection(initialSection);
});

// ===== INTEGRACIÓN CON EL SERVICIO DE CALENDARIO =====
// Sobrescribir la función del servicio de calendario para integrar con la app
const originalAddEvent = CalendarService.addEvent;
CalendarService.addEvent = async function(eventDetails) {
    const result = await originalAddEvent.call(this, eventDetails);
    if (result && window.visaHelperApp) {
        window.visaHelperApp.saveAppointment(eventDetails);
        
        // Actualizar progreso
        window.visaHelperApp.userProgress.appointments++;
        window.visaHelperApp.userProgress.overall = Math.min(
            window.visaHelperApp.userProgress.overall + 5, 
            100
        );
        window.visaHelperApp.updateProgressUI();
        localStorage.setItem('visaHelperProgress', JSON.stringify(window.visaHelperApp.userProgress));
    }
    return result;
};