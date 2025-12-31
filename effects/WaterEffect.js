import { Effect } from "../core/Effect.js";
import { createNoise3D } from "../fields/simplex-noise.js";

const noise = createNoise3D();

/* =========================
   PALETA (VOID BLUE)
========================= */
const VOID_BLUE = {
  deep: { r: 0, g: 0, b: 0 }, // preto
  mid: { r: 5, g: 20, b: 60 }, // azul escuro
  hot: { r: 40, g: 120, b: 220 }, // azul vivo
  spec: { r: 180, g: 220, b: 255 }, // highlight
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* =========================
   EFFECT
========================= */
export class WaterEffect extends Effect {
  constructor(width, height, opts = {}) {
    super(width, height);

    /* ---------- parâmetros ---------- */
    this.scale = opts.scale ?? 0.015;
    this.warpStrength = opts.warpStrength ?? 1.5;
    this.timeScale = opts.timeScale ?? 0.15;

    /* ---------- resolução interna ---------- */
    this.gw = Math.floor(width / 6);
    this.gh = Math.floor(height / 6);

    /* ---------- tempo ---------- */
    this.time = 0;

    /* ---------- offset global (movimento coerente) ---------- */
    this.offsetX = 0;
    this.offsetY = 0;

    /* ---------- buffer offscreen ---------- */
    this.buffer = document.createElement("canvas");
    this.buffer.width = this.gw;
    this.buffer.height = this.gh;
    this.bctx = this.buffer.getContext("2d");
    this.img = this.bctx.createImageData(this.gw, this.gh);

    /* ---------- luz fake ---------- */
    this.light = this.normalize3(0.4, 0.6, 1.0);
  }

  /* =========================
     UTILS
  ========================= */
  normalize3(x, y, z) {
    const m = Math.hypot(x, y, z) || 1;
    return { x: x / m, y: y / m, z: z / m };
  }

  /* =========================
     UPDATE
  ========================= */
  update(dt) {
    this.time += dt * this.timeScale;

    // drift global lento (shader-like)
    this.offsetX += 0.01 * dt;
    this.offsetY += 0.008 * dt;
  }

  /* =========================
     DRAW
  ========================= */
  draw(ctx) {
    const d = this.img.data;
    const L = this.light;

    /* ---------- SHADER-LIKE PASS ---------- */
    for (let y = 0; y < this.gh; y++) {
      for (let x = 0; x < this.gw; x++) {
        const u = (x + this.offsetX) * this.scale;
        const v = (y + this.offsetY) * this.scale;

        // domain warp
        const wx = noise(u + 10.0, v + 10.0, this.time);
        const wy = noise(u + 20.0, v + 20.0, this.time);

        const du = u + wx * this.warpStrength;
        const dv = v + wy * this.warpStrength;

        // gradiente (normal fake)
        const eps = 0.01;
        const hx =
          noise(du + eps, dv, this.time) - noise(du - eps, dv, this.time);
        const hy =
          noise(du, dv + eps, this.time) - noise(du, dv - eps, this.time);

        const nx = -hx;
        const ny = -hy;
        const nz = 1.0;
        const inv = 1 / (Math.hypot(nx, ny, nz) || 1);

        const shade = nx * inv * L.x + ny * inv * L.y + nz * inv * L.z;

        const s = Math.max(0, shade);

        const i = (y * this.gw + x) * 4;

        // mapeamento de energia
        const l = Math.pow(s, 2.2);
        const threshold = 0.5;

        let e = (l - threshold) / (1 - threshold);
        e = Math.max(0, Math.min(1, e));
        e = Math.pow(e, 2.0);

        // cor base
        let r = 0,
          g = 0,
          b = 0;

        if (e > 0) {
          r = lerp(VOID_BLUE.mid.r, VOID_BLUE.hot.r, e);
          g = lerp(VOID_BLUE.mid.g, VOID_BLUE.hot.g, e);
          b = lerp(VOID_BLUE.mid.b, VOID_BLUE.hot.b, e);
        }

        // highlight
        const spec = Math.pow(e, 6.0);
        r = lerp(r, VOID_BLUE.spec.r, spec);
        g = lerp(g, VOID_BLUE.spec.g, spec);
        b = lerp(b, VOID_BLUE.spec.b, spec);

        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }

    this.bctx.putImageData(this.img, 0, 0);

    // upscale
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.buffer, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
