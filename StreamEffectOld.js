// ParticleStreamEffect.js
import { Particle } from "./core/Particle.js";
import { guidedFlowField } from "./Flowfield.js";
import { applyFieldAsDisplacement } from "./motion/visuals.js";
export class StreamEffect {
  constructor({ width, height, count = 400, speed = 120 }) {
    this.width = width;
    this.height = height;
    this.speed = speed * Math.random() + 120;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const lane = i % 2; // alterna entre 0 e 1
      const pos = spawnOnStream(this.width, this.height, lane);

      this.particles.push(
        new Particle({
          x: pos.x,
          y: pos.y,
          radius: 1,
        })
      );
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(dt) {
    for (const p of this.particles) {
      const field = guidedFlowField(p);

      applyFieldAsDisplacement(p, field, this.speed, dt);

      // reaparece se sair do ecrã
      if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
      }
    }
  }

  draw(ctx) {
    ctx.save();

    for (const p of this.particles) {
      ctx.fillStyle = `rgba(220, 0, 0, ${p.seed * Math.random()})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function spawnOnStream(width, height, lane = 0) {
  const x = Math.random() * width;

  const amplitude = 160;
  const wavelength = 900;

  // curva principal
  const yBase =
    height * 0.5 + amplitude * Math.sin((x / wavelength) * Math.PI * 2);

  // offset entre correntes
  const laneOffset = 40;

  const y =
    yBase + (lane === 0 ? -laneOffset : laneOffset) + (Math.random() - 0.5) * 4; // jitter pequeno

  return { x, y };
}
