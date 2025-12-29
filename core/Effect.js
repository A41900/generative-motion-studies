import { Particle } from "./Particle.js";

export class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.time = 0;
    this.particles = [];
    this.enabled = true;
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.spawnParticle());
    }
  }

  spawnParticle() {
    return new Particle({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: 1,
    });
  }

  beginFrame() {
    for (const p of this.particles) {
      p.prevX = p.x;
      p.prevY = p.y;
    }
  }

  update(dt) {}
  draw(ctx) {}

  resize(w, h) {
    this.width = w;
    this.height = h;

    // regra mínima universal
    for (const p of this.particles) {
      p.prevX = p.x;
      p.prevY = p.y;
    }
  }

  disable() {
    this.enabled = false;
  }
}
