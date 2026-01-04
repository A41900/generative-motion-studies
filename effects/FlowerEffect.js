import { Particle } from "../core/Particle.js";
import { radialField, spaceCurlField } from "../fields/fields.js";
import { applyFieldAsDisplacement } from "../motion/visuals.js";
import { Effect } from "../core/Effect.js";
import { createNoise2D } from "../fields/simplex-noise.js";

const noise2D = createNoise2D();
//const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export class FlowerEffect extends Effect {
  constructor({ width, height, count = 10, connectionRadius = 30 }) {
    super(width, height);
    this.t = 0;
    //this.connectionRadius = connectionRadius;
    this.particles = [];
    this.petals = Array.from({ length: 14 }, (_, i) => ({
      baseAngle: -Math.PI + (Math.PI / 13) * i,
      id: i * 10, // separação no noise
    }));

    const INITIAL_SPEED = 5; // px/s

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
    this.t += dt * 0.004; // velocidade do vento
  }

  draw(ctx) {
    const alpha = 0.5;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height - 120;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";

    const windStrength = 10;

    for (const petal of this.petals) {
      // simplex retorna [-1, 1]
      const wind = noise2D(this.t, petal.id) * windStrength;

      const angle = petal.baseAngle + wind;

      const length = 90 + noise2D(this.t + 10, petal.id) * 15;

      const x2 = cx + Math.cos(angle) * length;
      const y2 = cy + Math.sin(angle) * length;

      const cx1 = cx + Math.cos(angle) * 40;
      const cy1 = cy + Math.sin(angle) * 60;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx1, cy1, x2, y2);
      ctx.stroke();
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  onMouseMove(pos) {
    this.mouse = pos;
  }
}
