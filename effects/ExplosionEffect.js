import { Particle } from "./core/Particle.js";
import { createNoise3D } from "./simplex-noise.js";
import { applyFieldAsDisplacement } from "./motion/visuals.js";

const noise3D = createNoise3D();

export class ExplosionEffect {
  constructor(width, height) {
    // posso usar os flowfields que ja tenho (vectors).
    this.time = 0;
    this.width = width;
    this.height = height;
    this.particles = [];
    for (let i = 0; i < 400; ++i) {
      const p = new Particle({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1,
      });
      this.particles.push(p);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const p of this.particles) {
    }

    ctx.restore();
  }

  preDraw(ctx) {
    // ctx.save();
    // ctx.globalCompositeOperation = "source-over";
    // ctx.fillStyle = "rgba(0,0,0,0.01)";
    // ctx.fillRect(0, 0, this.width, this.height);
    // ctx.restore();
  }

  update(dt) {
    this.time += dt;
    const t = this.time * 0.05;

    for (const p of this.particles) {
      const f = simplexFlowField(p, t + i * 0.3);
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
  bounds() {
    if (p.x < 0) {
      p.x += this.width;
      p.prevX = p.x;
    }
    if (p.y < 0) {
      p.y += this.height;
      p.prevY = p.y;
    }
    if (p.x > this.width) {
      p.x -= this.width;
      p.prevX = p.x;
    }
    if (p.y > this.height) {
      p.y -= this.height;
      p.prevY = p.y;
    }
  }
}

export function simplexFlowField(p, time) {
  const scale = 0.001;
  const t = time * 2;

  //const scale = 0.0012;
  //const angle = noise3D(p.x * scale, p.y * scale, time) * Math.PI * 2;

  const n = noise3D(p.x * scale, p.y * scale, t);

  const angle = n * Math.PI * 2;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 200,
  };
}

function mixFields(fields, weights) {
  let x = 0;
  let y = 0;

  for (let i = 0; i < fields.length; i++) {
    x += fields[i].nx * weights[i];
    y += fields[i].ny * weights[i];
  }

  const mag = Math.hypot(x, y) || 1;
  return { nx: x / mag, ny: y / mag };
}
