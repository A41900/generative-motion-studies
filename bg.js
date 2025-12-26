// backgrounds/starfield.js
export function starfield(width, height, opts = {}) {
  const {
    stars = 1400,
    brightStars = 35,
    dust = 180,
    nebulaBlobs = 18,
    seed = Math.random() * 10_000,
  } = opts;

  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");

  // --- RNG determinístico simples (para ficar sempre igual se quiseres)
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  // --- base: espaço escuro com leve gradiente
  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0, "#060816");
  g.addColorStop(0.55, "#030510");
  g.addColorStop(1, "#02030B");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // --- NEBULOSA (blobs suaves)
  // truque: desenhar círculos grandes com alpha baixo + blur via shadow
  ctx.save();
  ctx.globalCompositeOperation = "screen"; // ilumina sem “tinta opaca”
  for (let i = 0; i < nebulaBlobs; i++) {
    const x = rand() * width;
    const y = rand() * height;

    const r = (0.18 + rand() * 0.42) * Math.min(width, height); // grande
    const a = 0.03 + rand() * 0.05; // alpha baixo para não ficar opaco

    // cores frias (azul/roxo) tipo screenshot
    const hue = 210 + rand() * 60; // 210-270
    const sat = 35 + rand() * 30; // 35-65
    const light = 35 + rand() * 20; // 35-55

    ctx.shadowBlur = r * 0.25;
    ctx.shadowColor = `hsla(${hue}, ${sat}%, ${light}%, ${a})`;

    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --- “faixas” muito suaves (opcional, dá aquele vibe de poeira)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.globalCompositeOperation = "overlay";
  for (let i = 0; i < 7; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const w = width * (0.8 + rand() * 0.6);
    const h = height * (0.06 + rand() * 0.12);
    const angle = (rand() - 0.5) * 0.8;

    ctx.translate(x, y);
    ctx.rotate(angle);
    const gg = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    gg.addColorStop(0, "rgba(255,255,255,0)");
    gg.addColorStop(0.5, "rgba(255,255,255,1)");
    gg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();

  // --- STARS (muitas pequenas)
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < stars; i++) {
    const x = rand() * width;
    const y = rand() * height;

    // maioria minúscula
    const r = 0.4 + rand() * 0.9;
    const a = 0.35 + rand() * 0.55;

    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --- BRIGHT STARS (poucas, com glow)
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < brightStars; i++) {
    const x = rand() * width;
    const y = rand() * height;

    const r = 1.2 + rand() * 2.4;
    const a = 0.55 + rand() * 0.35;

    ctx.shadowBlur = 10 + rand() * 22;
    ctx.shadowColor = `rgba(255,255,255,${a})`;

    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // micro “spike” discreto
    if (rand() < 0.35) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();

  // --- DUST (pontinhos super subtis)
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < dust; i++) {
    const x = rand() * width;
    const y = rand() * height;

    const r = 0.3 + rand() * 0.7;
    const a = 0.05 + rand() * 0.12;

    ctx.fillStyle = `rgba(200,220,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  return c; // canvas pronto para drawImage
}
