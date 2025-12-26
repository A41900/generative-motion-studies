import { radialField } from "../fields/fields.js";
import { Particle } from "../core/Particle.js";
import { applyFieldAsDisplacement } from "../motion/visuals.js";

export class TextEffect {
  constructor({ canvas, text }) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.mouse = null;
    this.text = text;
    this.particles = [];
    this.targets = [];
    this.phase = Math.random() * 1000;
    this.createTextParticles();
  }

  createTextParticles() {
    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    textCanvas.width = this.width;
    textCanvas.height = this.height;
    textCtx.fillStyle = "white";
    textCtx.textAlign = "right";
    textCtx.textBaseline = "alphabetic";
    textCtx.font = "80px Space Grotesk";
    textCtx.fillText(this.text, this.width * 0.92, this.height * 0.82);
    const imageData = textCtx.getImageData(0, 0, this.width, this.height).data;
    const gap = 3; // experimenta 2, 3 ou 4
    for (let y = 0; y < this.height; y += gap) {
      for (let x = 0; x < this.width; x += gap) {
        const index = (y * this.width + x) * 4;
        const alpha = imageData[index + 3];
        if (alpha > 100) {
          this.particles.push(
            new Particle({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              radius: Math.random() * 2,
              vx: Math.random() * 2 - 0.5,
              vy: Math.random() * 2 - 0.5,
            })
          );
          this.targets.push({
            x,
            y,
            energy: Math.random() < 0.15 ? Math.random() * 0.6 + 0.4 : 0,
          });
        }
      }
    }
  }

  update(dt = 1) {
    this.phase += dt * 0.002; // lento e contínuo

    this.particles.forEach((p, i) => {
      const target = this.targets[i];

      if (this.mouse) {
        const field = radialField(p, this.mouse.x, this.mouse.y, 120, 1);
        if (field) applyFieldAsDisplacement(p, field, 120, dt);
      }
      //const wave = waveField(p, target, this.phase, 200);
      //applyFieldAsDisplacement(p, wave, 80, dt);

      //softAttract(p, target, 0.08);
    });
  }

  draw(ctx) {
    const t = performance.now() * 0.002;

    this.particles.forEach((p, i) => {
      const e = this.targets[i].energy;

      // variação quase imperceptível
      const pulse = e ? Math.sin(t + p.x * 0.01) * e * 0.4 : 0;

      const r = p.radius + pulse * 0.3;
      const a = 0.75 + pulse * 0.15;

      ctx.fillStyle = "hsla(32, 23%, 56%, 1.00)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillRect(p.x, p.y, 1, 1);

      ctx.fill();
    });
  }

  onMouseMove(pos) {
    this.mouse = pos;
  }
}
