/* *
Princípios gerais (regras absolutas):
Estas regras aplicam-se a todas as render primitives:
- São funções puras de render
- não alteram partículas
- não alteram estado global
- não usam dt
- Recebem estado já calculado
- posição atual
- posição anterior (se existir)
- parâmetros visuais
- Não iteram coleções
- operam sobre uma partícula ou um par
- loops pertencem à receita (Effect)
- Não decidem estilo
- apenas executam uma operação visual
- o “look” vem dos parâmetros
Se uma função violar uma destas regras, não pertence aqui.
*/

// Traço direto entre prev → current.
export function drawDisplacement(ctx, p, opts = {}) {
  const { alpha = 0.05, width = 1, color = "255,255,255" } = opts;

  const dx = p.x - p.prevX;
  const dy = p.y - p.prevY;
  const len = Math.hypot(dx, dy);

  if (len < 0.001) return;

  ctx.strokeStyle = `rgba(${color},${alpha})`;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(p.prevX, p.prevY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

// Fragmenta o deslocamento e espalha lateralmente → volume / fumo / energia.
export function drawDisplacementFragments(ctx, p, opts = {}) {
  const {
    alpha = 0.02,
    width = 1,
    step = 0.6,
    spread = 0.8,
    color = "255,255,255",
  } = opts;

  const dx = p.x - p.prevX;
  const dy = p.y - p.prevY;
  const len = Math.hypot(dx, dy);

  if (len < 0.001) return;

  const steps = Math.ceil(len / step);
  const ux = dx / steps;
  const uy = dy / steps;

  // normal perpendicular
  const nx = -dy / len;
  const ny = dx / len;

  ctx.strokeStyle = `rgba(${color},${alpha})`;
  ctx.lineWidth = width;

  for (let s = 0; s < steps; s++) {
    const px = p.prevX + ux * s;
    const py = p.prevY + uy * s;

    for (let i = -1; i <= 1; i++) {
      const offset = i * spread;

      ctx.beginPath();
      ctx.moveTo(px + nx * offset, py + ny * offset);
      ctx.lineTo(px + nx * offset + ux, py + ny * offset + uy);
      ctx.stroke();
    }
  }
}

// Desenho discreto do estado atual da partícula.
export function drawPoint(ctx, p, opts = {}) {
  const { radius = p.radius ?? 1, alpha = 1, color = "255,0,0" } = opts;

  ctx.fillStyle = `rgba(${color},${alpha})`;

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// Ligação visual entre duas partículas com fade por distância.
export function drawConnection(ctx, a, b, opts = {}) {
  const {
    maxDist = 30,
    width = 1,
    alphaCurve = "linear",
    color = "255,255,255",
  } = opts;

  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const d = Math.hypot(dx, dy);

  if (d > maxDist) return;

  let alpha = 1 - d / maxDist;

  if (alphaCurve === "quadratic") {
    alpha *= alpha;
  }

  ctx.strokeStyle = `rgba(${color},${alpha})`;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

// Decaimento da memória visual do frame buffer.
export function fadeCanvas(ctx, opts = {}) {
  const { alpha = 0.05, color = "0,0,0" } = opts;

  const { canvas } = ctx;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(${color},${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

export function drawSmokePuff(ctx, p, opts = {}) {
  const { radius = 12, alpha = 0.08, color = "200,200,200" } = opts;

  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
  g.addColorStop(0, `rgba(${color},${alpha})`);
  g.addColorStop(1, `rgba(${color},0)`);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
}
