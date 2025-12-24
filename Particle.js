export class Particle {
  constructor({ x = 0, y = 0, vx = 0, vy = 0, mass = 1, radius = 1 } = {}) {
    this.x = x;
    this.y = y;

    this.vx = vx;
    this.vy = vy;

    this.fx = 0;
    this.fy = 0;

    this.radius = radius;
    this.mass = mass;
  }

  applyForce(fx, fy) {
    this.fx += fx;
    this.fy += fy;
  }

  // commit to frame , forças intençoes, integrate commit.
  integrate(dt = 1) {
    this.vx += (this.fx / this.mass) * dt;
    this.vy += (this.fy / this.mass) * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // limpa forças (muito importante)
    this.fx = 0;
    this.fy = 0;
  }
  // aceita estado e reduz magnitude
  damp(factor) {
    this.vx *= factor;
    this.vy *= factor;
  }
  // soft constraint
  lerpTo(x, y, t) {
    this.x += (x - this.x) * t;
    this.y += (y - this.y) * t;
  }
}
