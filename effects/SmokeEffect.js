import { Effect } from "../core/Effect.js";
import { simplexFlowField } from "../fields/fields.js";
import { applyFieldAsDisplacement } from "../motion/visuals.js";
import { wrapParticle } from "../constraints.js";
import { drawDisplacementFragments, fadeCanvas } from "../render.js";

export class Effect3 extends Effect {
  constructor(width, height) {
    super(width, height);

    // parâmetros artísticos
    this.microSteps = 25;
    this.flowSpeed = 60;
  }

  update(dt) {
    // histórico visual (commit do frame anterior)
    this.beginFrame();

    const baseTime = this.time * 0.1;
    const subDt = dt / this.microSteps;

    // === MOTION (visual, field-driven) ===
    for (const p of this.particles) {
      for (let i = 0; i < this.microSteps; i++) {
        const field = simplexFlowField(p, baseTime + i * 0.01);
        if (!field) continue;

        applyFieldAsDisplacement(p, field, this.flowSpeed, subDt);

        wrapParticle(p, this.width, this.height);
      }
    }
    this.time += dt;
  }

  draw(ctx) {
    // === RENDER ===

    fadeCanvas(ctx, { alpha: 0.04 });

    for (const p of this.particles) {
      drawDisplacementFragments(ctx, p, {
        alpha: 0.015,
        width: 1.2,
        step: 0.6,
        spread: 0.9,
      });
    }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;

    for (const p of this.particles) {
      if (p.x > w || p.y > h) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
      }
      p.prevX = p.x;
      p.prevY = p.y;
    }
  }
}
