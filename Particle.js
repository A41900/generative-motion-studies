export class Particle {
  constructor(bounds, x = null, y = null) {
    this.radius = Math.random() * 2;
    this.color = "hsla(43, 100%, 86%, 0.85)";

    this.particleConfig = {
      baseSpeed: 0.2, // movimento base
      spring: 0.1, // força para target -lenta +rapida
      damping: 0.7, // suavidade -perde energia rapido lento + mais rapida
      repelRadius: 100, // área do mouse
      repelStrength: 1.2, // força do mouse
      maxSpeed: 6, // estabilidade
    };

    // texto
    this.base = x !== null ? { x, y } : null;
    this.target = this.base ? { x, y } : null;

    this.vx = (Math.random() - 0.5) * this.particleConfig.baseSpeed;
    this.vy = (Math.random() - 0.5) * this.particleConfig.baseSpeed;

    this.x = this.radius + Math.random() * (bounds.width - this.radius * 2);
    this.y = this.radius + Math.random() * (bounds.height - this.radius * 2);
  }

  updatePhysics(bounds) {
    // spring para target (se existir)
    if (this.target) {
      //lerp
      this.target.x += (this.base.x - this.target.x) * 0.05;
      this.target.y += (this.base.y - this.target.y) * 0.05;
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;

      // spring
      this.vx += dx * this.particleConfig.spring;
      this.vy += dy * this.particleConfig.spring;

      // damping forte (kills energy)
      this.vx *= this.particleConfig.damping;
      this.vy *= this.particleConfig.damping;
    }

    // 3. limite de velocidade
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.particleConfig.maxSpeed) {
      const k = this.particleConfig.maxSpeed / speed;
      this.vx *= k;
      this.vy *= k;
    }

    // movimento
    this.x += this.vx;
    this.y += this.vy;

    // bounce suave
    if (this.x < this.radius || this.x > bounds.width - this.radius) {
      this.vx *= -0.5;
    }
    if (this.y < this.radius || this.y > bounds.height - this.radius) {
      this.vy *= -0.5;
    }
  }

  update(bounds) {
    // 🔑 retorno lento ao sítio
    this.x += (this.baseX - this.x) * 0.05;
    this.y += (this.baseY - this.y) * 0.05;

    // movimento
    this.x += this.vx;
    this.y += this.vy;

    // bounce
    if (this.x < 0 || this.x > bounds.width) this.vx *= -1;
    if (this.y < 0 || this.y > bounds.height) this.vy *= -1;
  }

  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }

  applyFriction(amount) {
    this.vx *= amount;
    this.vy *= amount;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
}
