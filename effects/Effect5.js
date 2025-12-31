import { Effect } from "../core/Effect.js";
import { fbm } from "../fields/fields.js";

const PALETTE_NEBULA = [
  { r: 5, g: 10, b: 30 },
  { r: 20, g: 40, b: 90 },
  { r: 80, g: 140, b: 220 },
  { r: 200, g: 230, b: 255 },
];

const PALETTE_FIRE = [
  { r: 10, g: 0, b: 0 },
  { r: 120, g: 20, b: 10 },
  { r: 220, g: 80, b: 20 },
  { r: 255, g: 230, b: 160 },
];

const PALETTE_PURPLE_NEBULA = [
  { r: 5, g: 0, b: 15 },
  { r: 40, g: 10, b: 60 },
  { r: 120, g: 60, b: 180 },
  { r: 220, g: 190, b: 255 },
];

const PALETTE_FOREST = [
  { r: 5, g: 20, b: 5 },
  { r: 30, g: 80, b: 30 },
  { r: 80, g: 140, b: 60 },
  { r: 200, g: 220, b: 140 },
];

const PALETTE_ICE = [
  { r: 10, g: 20, b: 40 },
  { r: 80, g: 140, b: 200 },
  { r: 180, g: 220, b: 255 },
  { r: 255, g: 255, b: 255 },
];

const PALETTE_PSYCHE = [
  { r: 255, g: 0, b: 100 },
  { r: 255, g: 200, b: 0 },
  { r: 0, g: 255, b: 120 },
  { r: 0, g: 100, b: 255 },
];

const PALETTE_PINK_LILAC = [
  { r: 250, g: 230, b: 240 }, // rosa muito claro
  { r: 235, g: 200, b: 225 }, // pink pastel
  { r: 210, g: 185, b: 230 }, // lilac
  { r: 245, g: 240, b: 250 }, // highlight suave
];

const PALETTE_PINK_MINT = [
  { r: 250, g: 235, b: 240 }, // blush
  { r: 240, g: 200, b: 215 }, // soft pink
  { r: 200, g: 235, b: 220 }, // mint pastel
  { r: 245, g: 250, b: 245 }, // highlight minty
];

const PALETTES = [
  PALETTE_NEBULA,
  PALETTE_FIRE,
  PALETTE_PURPLE_NEBULA,
  PALETTE_FOREST,
  PALETTE_PSYCHE,
  PALETTE_PINK_LILAC,
  PALETTE_PINK_MINT,
];

export class Effect5 extends Effect {
  constructor({ width, height }) {
    super(width, height);

    this.gw = Math.floor(width / 4);
    this.gh = Math.floor(height / 4);

    this.paletteIndex = 1;
    this.paletteCount = PALETTES.length;

    this.buffer = document.createElement("canvas");
    this.buffer.width = this.gw;
    this.buffer.height = this.gh;
    this.bctx = this.buffer.getContext("2d");
    this.img = this.bctx.createImageData(this.gw, this.gh);

    this.time = 0;
  }

  nextPalette() {
    this.paletteIndex = (this.paletteIndex + 1) % this.paletteCount;
  }

  prevPalette() {
    this.paletteIndex =
      (this.paletteIndex - 1 + this.paletteCount) % this.paletteCount;
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx) {
    const d = this.img.data;
    const palette = PALETTES[this.paletteIndex];
    const plen = palette.length - 1;

    for (let y = 0; y < this.gh; y++) {
      for (let x = 0; x < this.gw; x++) {
        const field = fbm(x, y, this.time * 0.3, {
          octaves: 8,
          scale: 0.01,
        });

        let v;

        // aalterar isto dps.
        if (this.paletteIndex === 5 || this.paletteIndex === 6) {
          // pastel → range comprimido
          v = field * 0.15 + 0.75;
          v = 0.5 + 0.5 * Math.tanh(field * 1.2);
        } else {
          // normal
          v = field * 0.6 + 0.5;
          v = Math.max(0, Math.min(1, v));
        }

        //const v = field * 0.5 + 0.5;
        const t = Math.max(0, Math.min(1, v));

        const p = t * plen;
        const i0 = Math.floor(p);
        const f = p - i0;

        const c0 = palette[i0];
        const c1 = palette[Math.min(i0 + 1, plen)];

        const i = (y * this.gw + x) * 4;

        d[i] = c0.r + (c1.r - c0.r) * f;
        d[i + 1] = c0.g + (c1.g - c0.g) * f;
        d[i + 2] = c0.b + (c1.b - c0.b) * f;
        d[i + 3] = 255;
      }
    }

    this.bctx.putImageData(this.img, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.buffer, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  resize(w, h) {
    super.resize(w, h);

    this.gw = Math.floor(w / 4);
    this.gh = Math.floor(h / 4);

    this.buffer.width = this.gw;
    this.buffer.height = this.gh;
    this.img = this.bctx.createImageData(this.gw, this.gh);
  }
}
