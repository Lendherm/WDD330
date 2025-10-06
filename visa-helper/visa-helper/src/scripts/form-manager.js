// ===== GESTIÓN DE FORMULARIOS =====

class FormManager {
    constructor() {
        this.currentStep = 0;
        this.formSteps = document.querySelectorAll('.form-step');
        this.progressSteps = document.querySelectorAll('.progress-step');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStep(0);
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        
        // Validación en tiempo real
        document.querySelectorAll('#visa-form input, #visa-form select, #visa-form textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    showStep(stepIndex) {
        // Ocultar todos los pasos
        this.formSteps.forEach(step => step.classList.remove('active'));
        this.progressSteps.forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // Mostrar paso actual
        this.formSteps[stepIndex].classList.add('active');
        
        // Actualizar progreso
        this.progressSteps.forEach((step, index) => {
            if (index < stepIndex) {
                step.classList.add('completed');
            } else if (index === stepIndex) {
                step.classList.add('active');
            }
        });

        this.currentStep = stepIndex;
        this.updateButtons();

        // Si es el último paso, mostrar resumen
        if (stepIndex === this.formSteps.length - 1) {
            this.showFormReview();
        }
    }

    updateButtons() {
        this.prevBtn.disabled = this.currentStep === 0;
        
        if (this.currentStep === this.formSteps.length - 1) {
            this.nextBtn.textContent = 'Enviar Solicitud';
        } else {
            this.nextBtn.textContent = 'Siguiente';
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    nextStep() {
        if (this.currentStep < this.formSteps.length - 1) {
            if (this.validateStep(this.currentStep)) {
                this.showStep(this.currentStep + 1);
            }
        } else {
            this.submitForm();
        }
    }

    validateStep(stepIndex) {
        const currentStep = this.formSteps[stepIndex];
        const inputs = currentStep.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            APIService.showNotification('Por favor completa todos los campos requeridos', 'error');
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !value) {
            field.style.borderColor = '#e55039';
            return false;
        }

        // Validaciones específicas por tipo de campo
        switch(field.type) {
            case 'email':
                if (!this.isValidEmail(value)) {
                    field.style.borderColor = '#e55039';
                    return false;
                }
                break;
            case 'tel':
                if (!this.isValidPhone(value)) {
                    field.style.borderColor = '#e55039';
                    return false;
                }
                break;
        }

        field.style.borderColor = '#78e08f';
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    showFormReview() {
        const formData = new FormData(document.getElementById('visa-form'));
        const reviewContainer = document.getElementById('form-review');
        
        let reviewHTML = `
            <div class="form-review-section">
                <h4>Información Personal</h4>
                <div class="review-item">
                    <strong>Nombre completo:</strong> ${formData.get('firstName')} ${formData.get('lastName')}
                </div>
                <div class="review-item">
                    <strong>Fecha de nacimiento:</strong> ${formData.get('birthDate')}
                </div>
                <div class="review-item">
                    <strong>País de nacimiento:</strong> ${document.getElementById('country').options[document.getElementById('country').selectedIndex]?.text || ''}
                </div>
                <div class="review-item">
                    <strong>Teléfono:</strong> ${formData.get('phone')}
                </div>
            </div>

            <div class="form-review-section">
                <h4>Información de Viaje</h4>
                <div class="review-item">
                    <strong>Tipo de visa:</strong> ${formData.get('visaType')}
                </div>
                <div class="review-item">
                    <strong>Propósito del viaje:</strong> ${formData.get('purpose')}
                </div>
                <div class="review-item">
                    <strong>Duración estimada:</strong> ${formData.get('duration')}
                </div>
                <div class="review-item">
                    <strong>Fecha de viaje:</strong> ${formData.get('travelDate')}
                </div>
            </div>

            <div class="form-review-section">
                <h4>Antecedentes</h4>
                <div class="review-item">
                    <strong>Visa anterior:</strong> ${formData.get('prevVisa') === 'yes' ? 'Sí' : 'No'}
                </div>
                <div class="review-item">
                    <strong>Antecedentes penales:</strong> ${formData.get('criminal') === 'yes' ? 'Sí' : 'No'}
                </div>
                <div class="review-item">
                    <strong>Información adicional:</strong> ${formData.get('additionalInfo') || 'Ninguna'}
                </div>
            </div>
        `;

        reviewContainer.innerHTML = reviewHTML;
    }

    async submitForm() {
        if (!this.validateStep(this.currentStep)) {
            APIService.showNotification('Por favor corrige los errores antes de enviar', 'error');
            return;
        }

        try {
            // Simular envío de formulario
            APIService.showNotification('Enviando solicitud...', 'info');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aquí iría la lógica real de envío a un servidor
            const formData = new FormData(document.getElementById('visa-form'));
            const formObject = Object.fromEntries(formData.entries());
            
            console.log('Datos del formulario:', formObject);
            
            APIService.showNotification('¡Solicitud enviada correctamente!', 'success');
            
            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                window.location.hash = '#dashboard';
                document.getElementById('dashboard').classList.add('active');
                document.getElementById('forms').classList.remove('active');
                
                // Resetear formulario
                document.getElementById('visa-form').reset();
                this.showStep(0);
            }, 2000);

        } catch (error) {
            console.error('Error enviando formulario:', error);
            APIService.showNotification('Error al enviar la solicitud', 'error');
        }
    }
}

// ===== INICIALIZACIÓN DEL FORMULARIO =====
document.addEventListener('DOMContentLoaded', function() {
    window.formManager = new FormManager();
});