import { Particle } from "./core/Particle.js";
import { createNoise3D } from "./simplex-noise.js";
import { applyFieldAsDisplacement } from "./motion/visuals.js";

const noise3D = createNoise3D();

export class SmokeEffect {
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
      //this.vectors[i] = simplexFlowField(p,time);
    }
  }

  draw0(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    for (const p of this.particles) {
      if (p.path.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(p.path[0].x, p.path[0].y);

      for (let i = 1; i < p.path.length; i++) {
        ctx.lineTo(p.path[i].x, p.path[i].y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const p of this.particles) {
      const dx = p.x - p.prevX;
      const dy = p.y - p.prevY;

      const len = Math.hypot(dx, dy);
      if (len < 0.001) continue;

      // fragmentação do movimento
      const steps = Math.ceil(len / 0.6);
      const ux = dx / steps;
      const uy = dy / steps;

      // normal perpendicular
      const nx = -dy / len;
      const ny = dx / len;

      for (let s = 0; s < steps; s++) {
        const px = p.prevX + ux * s;
        const py = p.prevY + uy * s;

        // espalhamento lateral = volume
        for (let i = -1; i <= 1; i++) {
          const spread = i * 0.9;

          ctx.strokeStyle = "rgba(255, 255, 255, 0.01)";
          ctx.lineWidth = 1.3;

          ctx.beginPath();
          ctx.moveTo(px + nx * spread, py + ny * spread);
          ctx.lineTo(px + nx * spread + ux * 0.4, py + ny * spread + uy * 0.4);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
  preDraw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  draw2(ctx) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    for (const p of this.particles) {
      const dx = p.x - p.prevX;
      const dy = p.y - p.prevY;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - dx * 8, p.y - dy * 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  update0(dt) {
    this.time += dt;
    const t = this.time * 0.1;
    const STEPS = 6;

    for (const p of this.particles) {
      for (let i = 0; i < STEPS; i++) {
        const f = simplexFlowField(p, t + i * 0.02);

        p.x += f.nx * 0.8;
        p.y += f.ny * 0.8;

        // guarda trajetória
        p.addPoint(p.x, p.y);

        // wrap
        if (p.x < 0) p.x += this.width;
        if (p.y < 0) p.y += this.height;
        if (p.x > this.width) p.x -= this.width;
        if (p.y > this.height) p.y -= this.height;
      }
    }
  }

  update(dt) {
    this.time += dt;
    const t = this.time * 0.1;
    const STEPS = 25;

    for (const p of this.particles) {
      // guarda início do frame
      p.prevX = p.x;
      p.prevY = p.y;

      for (let i = 0; i < STEPS; i++) {
        const f = simplexFlowField(p, t + i * 0.01);

        p.x += f.nx * 0.6;
        p.y += f.ny * 0.6;

        const wrapped =
          p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height;

        if (wrapped) {
          if (p.x < 0) p.x += this.width;
          if (p.y < 0) p.y += this.height;
          if (p.x > this.width) p.x -= this.width;
          if (p.y > this.height) p.y -= this.height;

          // 👇 quebra o trail de forma natural
          p.prevX = p.x;
          p.prevY = p.y;
        }
      }
    }
  }

  update2(dt) {
    this.time += dt;
    const t = this.time * 0.05;

    const STEPS = 5;

    for (const p of this.particles) {
      for (let i = 0; i < STEPS; i++) {
        p.syncPrev();

        const f = simplexFlowField(p, t + i * 0.01);

        applyFieldAsDisplacement(p, f, 0.8 + p.depth * 1.5, dt);
      }

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

  resize(width, height) {
    this.width = width;
    this.height = height;
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
