// BubbleEffect.js
import { Particle } from "../core/Particle.js";
import { radialField, noiseField } from "../fields/fields.js";
import { applyFieldAsAcceleration } from "../motion/physics.js";

export class BubbleEffect {
  constructor({
    canvas,
    origin = null,
    maxParticles = 500,
    spawnRate = 6,
    emitterRadius = 18,
  }) {
    this.canvas = canvas;

    this.origin = origin ?? {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };

    this.maxParticles = maxParticles;
    this.spawnRate = spawnRate;
    this.emitterRadius = emitterRadius;

    this.particles = [];
  }

  // cria partículas novas
  spawn(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) return;

      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * this.emitterRadius;

      const p = new Particle({
        x: this.origin.x + Math.cos(a) * d,
        y: this.origin.y + Math.sin(a) * d,
        vx: Math.cos(a) * (0.2 + Math.random() * 0.2),
        vy: Math.sin(a) * (0.2 + Math.random() * 0.2),
        radius: 1 + Math.random() * 1.5,
        mass: 1,
      });

      // atributos VISUAIS
      p.z = Math.random() * 0.3;
      p.life = 1;

      this.particles.push(p);
    }
  }

  update(dt = 1) {
    // emissão contínua
    this.spawn(this.spawnRate);

    for (const p of this.particles) {
      // flow suave (ar)
      const flow = noiseField(p, 0, 0.02);
      applyFieldAsAcceleration(p, flow, 0.03);

      // expansão radial (sopro)
      const r = radialField(p, this.origin.x, this.origin.y, 120, 1);
      if (r) {
        applyFieldAsAcceleration(p, r, 0.05);
      }

      p.integrate(dt);
      p.damp(0.96);

      // profundidade visual
      p.z += 0.004;
      p.life -= 0.004;
    }

    // remover partículas mortas
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx) {
    // ordenar por profundidade (painter's algorithm)
    this.particles.sort((a, b) => a.z - b.z);

    for (const p of this.particles) {
      const r = p.radius * (0.6 + p.z * 2);
      const alpha = Math.max(0, p.life) * (0.12 + p.z * 0.6);

      // gradiente = curvatura da bolha
      const g = ctx.createRadialGradient(
        p.x - r * 0.35,
        p.y - r * 0.35,
        0,
        p.x,
        p.y,
        r
      );

      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize(width, height) {
    // mantém a bolha no centro ao redimensionar
    this.origin.x = width / 2;
    this.origin.y = height / 2;
  }

  onMouseMove(pos) {
    // opcional: desloca ligeiramente a origem
    this.origin.x += (pos.x - this.origin.x) * 0.02;
    this.origin.y += (pos.y - this.origin.y) * 0.02;
  }
}
