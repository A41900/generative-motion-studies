import { Particle } from "./Particle.js";
import { Effect } from "./Effect.js";

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = canvas.width;
    this.height = canvas.height;

    this.maxParticles = 300;
    this.particles = [];
    this.textParticles = [];

    this.textTarget = {
      x: this.width * 0.92,
      y: this.height * 0.82,
    };

    this.effect = new Effect();
    this.mouse = { x: 0, y: 0, move: false, radius: 100 };

    this.createBackground(this.maxParticles);
  }

  createBackground() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  createTextParticles(text) {
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d");

    off.width = this.width;
    off.height = this.height;

    ctx.font = "80px Space Grotesk";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    const x = this.width * 0.92;
    const y = this.height * 0.82;
    ctx.fillText(text, x, y);

    const data = ctx.getImageData(0, 0, off.width, off.height).data;

    const gap = 2;
    for (let y = 0; y < this.height; y += gap) {
      for (let x = 0; x < this.width; x += gap) {
        const index = (y * this.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 120) {
          const p = new Particle(this, x, y);
          p.target = { x, y };
          this.textParticles.push(p);
        }
      }
    }
  }

  update() {
    this.particles.forEach((p) => {
      if (this.mouse.move) {
        Effect.mouseDeflectionVisual(
          p,
          this.mouse.x,
          this.mouse.y,
          this.mouse.radius
        );
      }
      p.updatePhysics(this);
    });

    this.textParticles.forEach((p) => {
      if (this.mouse.move) {
        Effect.mouseDeflectionVisual(
          p,
          this.mouse.x,
          this.mouse.y,
          this.mouse.radius
        );
      }
      p.updatePhysics(this);
    });
  }

  draw() {
    Effect.connect(this.particles, this.ctx, 65);
    this.particles.forEach((p) => p.draw(this.ctx));
    this.textParticles.forEach((p) => p.draw(this.ctx));
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    // recalcular posições dependentes
    // this.textX = this.width * 0.92;
    // this.textY = this.height * 0.82;
  }
}
