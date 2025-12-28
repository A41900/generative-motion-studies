import { Particle } from "../core/Particle.js";
import { createNoise3D } from "../fields/simplex-noise.js";
import { applyFieldAsDisplacement } from "../motion/visuals.js";
import { Effect } from "../core/Effect.js";

const noise3D = createNoise3D();

export class SmokeEffect extends Effect {
  constructor(width, height) {
    super(width, height);
    this.createParticles(400);
    //this.vectors[i] = simplexFlowField(p,time);
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
