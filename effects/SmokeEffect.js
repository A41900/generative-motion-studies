import { Effect } from "../core/Effect.js";
import { Particle } from "../core/Particle.js";
import { createNoise3D } from "../fields/simplex-noise.js";
import { fbm } from "../fields/fields.js";
const noise = createNoise3D();

export class SmokeEffect extends Effect {
  constructor(width, height) {
    super(width, height);
    this.time = 0;

    // buffer de feedback
    this.buffer = document.createElement("canvas");
    this.buffer.width = width;
    this.buffer.height = height;
    this.bctx = this.buffer.getContext("2d");

    // 🔥 SEED INICIAL (CRÍTICO)
    this.bctx.fillStyle = "rgba(227, 121, 121, 1)";
    this.bctx.fillRect(0, 0, width, height);
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // 1️⃣ copiar buffer anterior com leve deslocamento
    ctx.globalAlpha = 0.98;
    ctx.drawImage(this.buffer, 1, 0);
    ctx.globalAlpha = 1;

    // 2️⃣ injetar noise VISÍVEL
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const t = this.time * 0.15;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const n = noise(x * 0.002, y * 0.002, t);
        const d = Math.floor((n * 0.5 + 0.5) * 120);

        const i = (y * w + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = d;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    // 3️⃣ guardar frame atual no buffer
    this.bctx.clearRect(0, 0, w, h);
    this.bctx.drawImage(ctx.canvas, 0, 0);
  }
}
