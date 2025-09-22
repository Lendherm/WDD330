import { loadHeaderFooter } from "./utils.mjs";

export default class FeedbackCanvas {
  constructor() {
    this.isHappy = true;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.canvas.style.cursor = "pointer";
    this.canvas.style.display = "block";
    this.canvas.style.margin = "1rem auto";
    this.ctx = this.canvas.getContext("2d");
    
    this.canvas.addEventListener("click", () => {
      this.isHappy = !this.isHappy;
      this.drawFace();
    });
  }

  async init() {
    await loadHeaderFooter();
    this.drawFace();
    
    const container = document.createElement("div");
    container.style.textAlign = "center";
    container.style.padding = "1rem";
    container.innerHTML = "<h2>How was your experience?</h2><p>Click the face to toggle</p>";
    container.appendChild(this.canvas);
    
    document.querySelector("main").appendChild(container);
  }

  drawFace() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar cabeza
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FFDB58";
    ctx.fill();
    ctx.strokeStyle = "#E5C100";
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Dibujar ojos
    ctx.beginPath();
    ctx.arc(70, 70, 10, 0, Math.PI * 2, true); // Ojo izquierdo
    ctx.arc(130, 70, 10, 0, Math.PI * 2, true); // Ojo derecho
    ctx.fillStyle = "#000";
    ctx.fill();
    
    // Dibujar boca
    ctx.beginPath();
    if (this.isHappy) {
      // Boca feliz
      ctx.arc(100, 110, 40, 0, Math.PI, false);
    } else {
      // Boca triste
      ctx.arc(100, 140, 40, Math.PI, 0, false);
    }
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Añadir texto descriptivo
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(this.isHappy ? "Happy! Click me!" : "Sad... Click me!", 100, 30);
  }
}

// Inicialización
const feedback = new FeedbackCanvas();
feedback.init();