export class TextEffect {
  constructor(particles) {
    this.particles = particles;
  }

  onMouseMove({ x, y }) {
    this.particles.forEach((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy);

      if (d < 80) {
        p.applyForce((dx / d) * 0.8, (dy / d) * 0.8);
      }
    });
  }

  update() {
    this.particles.forEach((p) => {
      p.applyForce((p.base.x - p.x) * 0.05, (p.base.y - p.y) * 0.05);
      p.damp(0.85);
      p.integrate();
    });
  }

  draw(ctx) {
    this.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
