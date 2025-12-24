// ConstellationEffect.js
import { Particle } from "./Particle.js";
import { bounceFromBounds, flowField, applyAsForce } from "./dynamics.js";

export class ConstellationEffect {
  constructor({ width, height, count = 300, connectionRadius = 65 }) {
    this.width = width;
    this.height = height;
    this.connectionRadius = connectionRadius;

    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(
        new Particle({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          radius: Math.random() * 2,
        })
      );
    }
  }

  update(dt = 1) {
    for (const p of this.particles) {
      // ruído mínimo
      p.applyForce((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
      p.integrate(dt);
      p.damp(0.99);
      bounceFromBounds(p, {
        width: this.width,
        height: this.height,
      });
    }
  }

  draw(ctx) {
    // 🔗 CONNECT
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);

        if (d < this.connectionRadius) {
          ctx.strokeStyle = `hsla(20, 20%, 40%, ${
            1 - d / this.connectionRadius
          })`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // ⚪ POINTS
    for (const p of this.particles) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}
