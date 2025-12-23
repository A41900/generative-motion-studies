const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  light.x = canvas.width * 0.82;
  light.y = canvas.height * 0.82;
}
addEventListener("resize", resize);

const light = { x: 0, y: 0 };
resize();

// ---------- BACKGROUND ----------
function drawBackground() {
  ctx.fillStyle = "#040508";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const g = ctx.createRadialGradient(
    light.x,
    light.y,
    0,
    light.x,
    light.y,
    Math.max(canvas.width, canvas.height) * 1.2
  );
  g.addColorStop(0, "rgba(255,255,255,0.20)");
  g.addColorStop(0.2, "rgba(160,190,255,0.10)");
  g.addColorStop(0.55, "rgba(80,110,170,0.05)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---------- UTILS ----------
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function fract(x) {
  return x - Math.floor(x);
}

// hash noise (rápido)
function hash2(x, y) {
  // determinístico
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return fract(s);
}

// value noise bilinear
function vnoise(x, y) {
  const x0 = Math.floor(x),
    y0 = Math.floor(y);
  const x1 = x0 + 1,
    y1 = y0 + 1;
  const sx = x - x0,
    sy = y - y0;

  const n00 = hash2(x0, y0);
  const n10 = hash2(x1, y0);
  const n01 = hash2(x0, y1);
  const n11 = hash2(x1, y1);

  const ix0 = lerp(n00, n10, sx);
  const ix1 = lerp(n01, n11, sx);
  return lerp(ix0, ix1, sy);
}

// fbm
function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * vnoise(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

// --------- Bubble w/ Marangoni film ----------
class Bubble {
  constructor(x, y, radius = 220) {
    this.x = x;
    this.y = y;
    this.r = radius;

    this.seed = Math.random() * 1000;
    this.steps = 180;
    this.shape = this.getShape();

    // offscreen “film texture” (baixa resolução)
    this.texSize = 220; // podes subir para 280 se o PC aguentar
    this.film = document.createElement("canvas");
    this.film.width = this.texSize;
    this.film.height = this.texSize;
    this.fctx = this.film.getContext("2d", { willReadFrequently: true });

    this.t = 0;
  }

  getShape() {
    const pts = [];
    for (let i = 0; i < this.steps; i++) {
      const a = (i / this.steps) * Math.PI * 2;

      // mais redondo (ruído menor)
      const n =
        Math.sin(a * 2 + this.seed) * 0.025 +
        Math.sin(a * 3 + this.seed * 1.7) * 0.015;

      pts.push({ a, rr: this.r * (1 + n) });
    }
    return pts;
  }

  // “Marangoni”: ruído advectado por um campo de fluxo
  // A ideia: gerar um vector field a partir de fbm, e usar isso para deslocar as amostras
  sampleThickness(u, v, time) {
    // u,v em [-1..1], dentro do disco

    // flow field
    const fx = fbm(u * 2 + this.seed, v * 2 + time * 0.25) - 0.5;
    const fy = fbm(u * 2 + 200 + this.seed, v * 2 + 200 + time * 0.25) - 0.5;

    // advect: deslocar coords ao longo do fluxo (efeito “corrente”)
    const advU = u + fx * 0.35;
    const advV = v + fy * 0.35;

    // base pattern (células)
    const cell = fbm(advU * 6 + time * 0.15, advV * 6 - time * 0.12);

    // veios mais finos (mist)
    const vein = fbm(advU * 16 - time * 0.2, advV * 16 + time * 0.18);

    // mistura
    let t = 0.55 * cell + 0.45 * vein;

    // “gravidade”: mais espesso em baixo
    t += v * 0.25 + 0.25;

    return clamp01(t);
  }

  // thickness -> cor (interferência aproximada)
  thicknessToRGBA(th, lightTerm) {
    // fase (ciclos de cor)
    const cycles = 3.2;
    const phase = th * Math.PI * 2 * cycles;

    // variação cromática (aprox)
    const hueBase = 220 + Math.sin(phase) * 120; // azul <-> laranja
    const sat = 90;
    const lum = 60 + lightTerm * 10;

    // alpha: mais visível onde a película “forma padrão”
    const a = 0.1 + th * 0.35;
    return { hue: hueBase, sat, lum, a };
  }

  renderFilmTexture(light) {
    const s = this.texSize;
    const img = this.fctx.createImageData(s, s);
    const data = img.data;

    // luz em coords da bolha (direção)
    const dx = light.x - this.x;
    const dy = light.y - this.y;
    const L = Math.hypot(dx, dy) || 1;
    const lx = dx / L,
      ly = dy / L;

    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = (y * s + x) * 4;

        // map para [-1..1]
        const u = (x / (s - 1)) * 2 - 1;
        const v = (y / (s - 1)) * 2 - 1;

        const rr = u * u + v * v;
        if (rr > 1) {
          data[i + 3] = 0;
          continue;
        }

        // normal aproximada na esfera (para luz)
        const nz = Math.sqrt(Math.max(0, 1 - rr));
        const nx = u,
          ny = v;

        // termo de luz (Lambert)
        const lightTerm = clamp01((nx * -lx + ny * -ly + nz * 0.6) * 0.9);

        const th = this.sampleThickness(u, v, this.t);

        const c = this.thicknessToRGBA(th, lightTerm);

        // hsla -> rgb approx via canvas? (vamos converter manualmente simples)
        const rgb = hslToRgb((c.hue % 360) / 360, c.sat / 100, c.lum / 100);

        data[i + 0] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
        data[i + 3] = Math.floor(255 * c.a * (0.35 + 0.65 * lightTerm)); // mais brilho onde há luz
      }
    }

    this.fctx.putImageData(img, 0, 0);
  }

  draw(light) {
    this.t += 0.016; // tempo

    // 1) atualiza textura da película
    this.renderFilmTexture(light);

    // 2) desenha bolha recortada pela shape
    ctx.save();
    ctx.translate(this.x, this.y);

    // clip shape
    ctx.beginPath();
    this.shape.forEach((p, i) => {
      const x = Math.cos(p.a) * p.rr;
      const y = Math.sin(p.a) * p.rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.clip();

    // desenhar textura
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(this.film, -this.r, -this.r, this.r * 2, this.r * 2);
    ctx.globalCompositeOperation = "source-over";

    // 3) volume interno (oco)
    const vol = ctx.createRadialGradient(0, 0, this.r * 0.3, 0, 0, this.r);
    vol.addColorStop(0, "rgba(0,0,0,0)");
    vol.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vol;
    ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);

    ctx.restore();

    // 4) rim difuso (muito subtil)
    ctx.save();
    ctx.translate(this.x, this.y);
    const rim = ctx.createRadialGradient(
      0,
      0,
      this.r * 0.82,
      0,
      0,
      this.r * 1.05
    );
    rim.addColorStop(0, "rgba(255,255,255,0)");
    rim.addColorStop(1, "rgba(255,255,255,0.18)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = this.r * 0.06;
    ctx.beginPath();
    ctx.arc(0, 0, this.r * 0.98, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// HSL -> RGB helper
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// -------- RUN --------
const bubble = new Bubble(canvas.width / 2, canvas.height / 2, 240);

function animate() {
  drawBackground();
  bubble.draw(light);
  requestAnimationFrame(animate);
}
animate();
