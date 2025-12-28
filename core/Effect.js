import { Particle } from "./Particle.js";
export class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.time = 0;
    this.particles = [];
    this.zIndex = null;
    this.opacity = null;
    this.enabled = true;
  }
  createParticles(count) {
    for (let i = 0; i < 400; i++) {
      this.particles.push(
        new Particle({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: 1,
        })
      );
    }
  }
  disable() {
    this.enabled = false;
  }

  update(dt) {}
  draw(ctx) {}
  resize(w, h) {}
}
