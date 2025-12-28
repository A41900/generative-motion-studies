// FlowFieldGridEffect.js
// Effect de DEBUG: desenha uma grid de vetores
// onde a direção segue uma "corrente" curva global

import { applyFieldAsDisplacement, softAttract } from "../motion/visuals.js";
import { Particle } from "../core/Particle.js";
import { radialField } from "../fields/fields.js";
import { createNoise3D } from "../fields/simplex-noise.js";

export class FlowField {
  constructor({ width, height, cellSize = 30, vectorLength = 14 }) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.vectorLength = vectorLength;
    this.mouse = null;

    this.time = 0;
    this.particles = [];
    for (let i = 0; i < 400; ++i) {
      const p = new Particle({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 2,
      });

      this.particles.push(p);
      //this.vectors[i] = simplexFlowField(p,time);
    }
  }

  preDraw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(dt) {
    this.time += dt;
    const t = this.time * 0.1;

    const R = 200; // raio de influência do rato
    const mouseStrength = 100; // quão forte é o desvio (não atração)

    for (const p of this.particles) {
      // FLOW BASE (sempre ativo)
      const flow = guidedFlowField(p, t);
      let nx = flow.nx;
      let ny = flow.ny;

      // INFLUÊNCIA DO RATO (local e suave)
      if (this.mouse) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const d = Math.hypot(dx, dy);

        if (d < R && d > 0.0001) {
          const falloff = 1 - d / R; // 1 perto, 0 longe
          const f = falloff * falloff; // curva suave

          nx += (dx / d) * f * mouseStrength;
          ny += (dy / d) * f * mouseStrength;
        }
      }

      // normalizar
      const mag = Math.hypot(nx, ny) || 1;
      nx /= mag;
      ny /= mag;

      // VELOCIDADE FINAL (depende da depth)
      const speed = 20 + p.depth * 80;

      p.vx = nx * speed;
      p.vy = ny * speed;

      // MOVE
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // WRAP
      if (p.x < 0) p.x += this.width;
      if (p.y < 0) p.y += this.height;
      if (p.x > this.width) p.x -= this.width;
      if (p.y > this.height) p.y -= this.height;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.lineWidth = 2;

    for (const p of this.particles) {
      const noise3D = createNoise3D();
      const n = noise3D(p.x * 0.01, p.y * 0.01, 0);
      const alpha = (n + 1) * 0.5; // [-1,1] → [0,1]

      // const alpha = Math.random(); // 0–360
      ctx.strokeStyle = `hsla(1, 70%, 55%, ${alpha})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  onMouseMove(pos) {
    this.mouse = pos;
  }
}

/* ============================================================
   CAMPO DIRECIONAL GUIADO (ISTO É O CORAÇÃO)
   ============================================================ */

/**
 * Curva guia invisível (a "linha vermelha")
 * Controla a forma global do fluxo
 */
export function guideCurve(x) {
  const amplitude = 200; // altura da curva
  const wavelength = 1400; // comprimento da onda

  return amplitude * Math.sin((x / wavelength) * Math.PI * 2);
}

/**
 * Derivada da curva → inclinação local
 */
function guideDirection(x) {
  const amplitude = 160;
  const wavelength = 900;

  return (
    ((amplitude * Math.PI * 2) / wavelength) *
    Math.cos((x / wavelength) * Math.PI * 2)
  );
}

/**
 * FLOWFIELD FINAL
 * Todos os vetores são tangentes à curva guia
 */

export function guidedFlowField(p, time) {
  const dy_dx = guideDirection(p.x);
  let angle = Math.atan2(dy_dx, 1);

  const t = Math.sin(time * 0.2) * 2 + Math.sin(time * 0.05) * 5;

  const chaos = Math.sin(t + p.x * 0.02 + p.y * 0.015) * 0.3;

  angle += chaos;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function guidedFlowField3(p, time = 0) {
  const dy_dx = guideDirection(p.x);

  // ângulo base da tangente
  let angle = Math.atan2(dy_dx, 1);

  // micro-oscilação temporal
  const wobble = Math.sin(time * 0.3 + p.x * 0.01) * 0.15;

  angle += wobble;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function guidedFlowField2(p) {
  const dy_dx = guideDirection(p.x);

  // vetor tangente (1, dy/dx)
  let nx = 1;
  let ny = dy_dx;

  // normalizar
  const mag = Math.hypot(nx, ny) || 1;
  nx /= mag;
  ny /= mag;

  return {
    nx,
    ny,
    strength: 1,
  };
}

export function spawnOnStream(width, height, lane = 0) {
  const x = Math.random() * width;

  const amplitude = 160;
  const wavelength = 900;

  // curva principal
  const yBase =
    height * 0.5 + amplitude * Math.sin((x / wavelength) * Math.PI * 2);

  // offset entre correntes
  const laneOffset = 40;

  const y =
    yBase +
    (lane === 0 ? -laneOffset : laneOffset) +
    (Math.random() - 0.5) * 10; // jitter pequeno

  return { x, y };
}
