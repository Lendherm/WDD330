export default class Alert {
  constructor() {
    this.alerts = [];
  }

  async init() {
    try {
      // Fetch alerts from JSON file
      const response = await fetch('/json/alerts.json');
      if (!response.ok) return;
      
      this.alerts = await response.json();
      if (!this.alerts.length) return;
      
      this.renderAlerts();
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  renderAlerts() {
    // Create alert container
    const alertSection = document.createElement('section');
    alertSection.className = 'alert-list';
    
    // Create and append each alert
    this.alerts.forEach(alert => {
      const alertElement = document.createElement('p');
      alertElement.textContent = alert.message;
      alertElement.style.backgroundColor = alert.background;
      alertElement.style.color = alert.color;
      alertElement.style.padding = '1rem';
      alertElement.style.margin = '0.5rem 0';
      alertElement.style.borderRadius = '4px';
      
      alertSection.appendChild(alertElement);
    });
    
    // Prepend to main element
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.prepend(alertSection);
    }
  }
}