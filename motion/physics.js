/**
 * Aplica um Field como ACELERAÇÃO física.
 *
 * CONTRATO:
 * - accelPxPerSec2 → aceleração em px / s²
 *
 * ESCALA RECOMENDADA:
 * - 10–50   → movimento subtil
 * - 50–200  → orgânico
 * - 200–600 → energético / caótico
 *
 * NOTAS:
 * - NÃO usa dt
 * - dt é aplicado no integrate()
 */
export function applyFieldAsAcceleration(p, field, accelPxPerSec2) {
  p.applyForce(
    field.nx * field.strength * accelPxPerSec2,
    field.ny * field.strength * accelPxPerSec2
  );
}

/**
 * Aplica um Field como IMPULSO.
 *
 * CONTRATO:
 * - speedPxPerSec → velocidade em px / s
 *
 * ESCALA RECOMENDADA:
 * - 20–80   → empurrão suave
 * - 80–200  → resposta forte
 * - 200–400 → explosivo
 *
 * NOTAS:
 * - NÃO usa dt
 * - altera diretamente a velocidade
 */
export function applyFieldAsImpulse(p, field, speedPxPerSec) {
  p.vx += field.nx * field.strength * speedPxPerSec;
  p.vy += field.ny * field.strength * speedPxPerSec;
}

/**
 * Colisão simples com limites do canvas.
 *
 * CONTRATO:
 * - restitution ∈ [0, 1]
 *
 * ESCALA:
 * - 0.2–0.4 → amortecido
 * - 0.5–0.8 → elástico
 * - 1.0     → perfeitamente elástico
 */
export function bounceFromBounds(p, bounds, restitution = 0.5) {
  const minX = p.radius;
  const maxX = bounds.width - p.radius;
  const minY = p.radius;
  const maxY = bounds.height - p.radius;

  if (p.x < minX) {
    p.x = minX;
    if (p.vx < 0) p.vx = -p.vx * restitution;
  } else if (p.x > maxX) {
    p.x = maxX;
    if (p.vx > 0) p.vx = -p.vx * restitution;
  }

  if (p.y < minY) {
    p.y = minY;
    if (p.vy < 0) p.vy = -p.vy * restitution;
  } else if (p.y > maxY) {
    p.y = maxY;
    if (p.vy > 0) p.vy = -p.vy * restitution;
  }
}

/**
 * Mola física (potencial harmónico).
 *
 * CONTRATO:
 * - kPxPerSec2PerPx → aceleração por pixel (px / s² por px)
 * - cria um potencial de equilíbrio
 *
 * ESCALA RECOMENDADA:
 * - 0.005–0.02 → muito subtil (background)
 * - 0.02–0.1   → visível
 * - 0.1+       → forte
 *
 * NOTAS:
 * - USA física real
 * - respeita dt via integrate()
 */
export function applySpringForce(p, x, y, kPxPerSec2PerPx) {
  p.applyForce((x - p.x) * kPxPerSec2PerPx, (y - p.y) * kPxPerSec2PerPx);
}
