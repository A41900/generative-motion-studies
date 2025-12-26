import { starfield } from "../bg.js";
import { Particle } from "../core/Particle.js";
import {
  radialField,
  spaceCurlField,
  spaceDriftField,
} from "../fields/fields.js";
import { applyFieldAsDisplacement } from "../motion/visuals.js";

export class ConstellationEffect {
  constructor({ width, height, count = 300, connectionRadius = 30 }) {
    this.width = width;
    this.height = height;
    this.connectionRadius = connectionRadius;

    this.mouse = null;
    this.time = 0;

    this.particles = [];

    const INITIAL_SPEED = 10; // px/s

    for (let i = 0; i < count; i++) {
      this.particles.push(
        new Particle({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * INITIAL_SPEED,
          vy: (Math.random() - 0.5) * INITIAL_SPEED,
          radius: Math.random() * 2,
        })
      );
    }
  }

  update(dt) {
    this.time += dt;

    for (const p of this.particles) {
      const flow = spaceCurlField(p, this.time, 1400);

      applyFieldAsDisplacement(p, flow, 8 + p.depth * 18, dt);

      if (this.mouse) {
        const mouseField = radialField(p, this.mouse.x, this.mouse.y, 100, 1);

        if (mouseField) {
          applyFieldAsDisplacement(p, mouseField, 80, dt);
        }
      }
    }
  }

  twinkle(p, time) {
    // cada estrela tem ritmo próprio
    const speed = 0.2 + p.seed * 0.6;
    const phase = time * speed + p.seed * 100;
    // seno lento
    const wave = Math.sin(phase);
    // só ativa às vezes
    const flare = Math.max(0, wave - 0.85);
    // curva suave
    return flare * flare; // 0 → 1
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
    const sx = width / this.width;
    const sy = height / this.height;

    for (const p of this.particles) {
      p.x *= sx;
      p.y *= sy;
    }

    this.width = width;
    this.height = height;
  }

  onMouseMove(pos) {
    this.mouse = pos;
  }
}
