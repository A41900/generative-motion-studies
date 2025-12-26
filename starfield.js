export class StarfieldEffect {
  constructor(canvas, opts = {}) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.enabled = true;

    this.opts = {
      stars: 1400,
      brightStars: 35,
      dust: 180,
      nebulaBlobs: 18,
      seed: Math.random() * 10_000,
      ...opts,
    };

    this.build();
  }

  build() {
    const { width, height } = this;

    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");

    let s = this.opts.seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };

    // BASE
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#060816");
    g.addColorStop(0.55, "#030510");
    g.addColorStop(1, "#02030B");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Nebula layers (screen blended)
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    // camada larga (estrutura geral)
    drawNebulaLayer({
      ctx,
      width,
      height,
      rand,
      blobs: Math.floor(this.opts.nebulaBlobs * 0.5),
      radiusMul: 0.8,
      alphaMul: 0.04,
    });

    // camada média (corpo principal)
    drawNebulaLayer({
      ctx,
      width,
      height,
      rand,
      blobs: this.opts.nebulaBlobs,
      radiusMul: 0.45,
      alphaMul: 0.08,
    });

    // camada densa local (detalhe)
    drawNebulaLayer({
      ctx,
      width,
      height,
      rand,
      blobs: Math.floor(this.opts.nebulaBlobs * 0.7),
      radiusMul: 0.25,
      alphaMul: 0.12,
    });

    ctx.restore();

    // STARS
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < this.opts.stars; i++) {
      const x = rand() * width;
      const y = rand() * height;
      const r = 0.4 + rand() * 0.9;
      const a = 0.35 + rand() * 0.55;

      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    this.canvas = c;
  }

  draw(ctx) {
    if (!this.enabled) return;
    ctx.drawImage(this.canvas, 0, 0);
  }

  resize(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.build();
  }
}

function drawNebulaLayer({
  ctx,
  width,
  height,
  rand,
  blobs,
  radiusMul,
  alphaMul,
}) {
  const base = Math.min(width, height);
  const maxR = base * 0.65;

  for (let i = 0; i < blobs; i++) {
    const x = rand() * width;
    const y = rand() * height;

    const r = Math.min(base * radiusMul * (0.6 + rand() * 0.6), maxR);

    const screenFactor = Math.min(1, 900 / base);
    const alpha = alphaMul * screenFactor;

    const hue = 210 + rand() * 60;
    const sat = 30 + rand() * 30;
    const light = 40 + rand() * 15;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`);
    grad.addColorStop(0.4, `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.6})`);
    grad.addColorStop(0.7, `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.25})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
