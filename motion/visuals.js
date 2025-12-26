/**
 * Aplica um Field como DESLOCAMENTO VISUAL.
 *
 * CONTRATO:
 * - speedPxPerSec → deslocamento em px / s
 * - dt → delta time em segundos
 *
 * ESCALA RECOMENDADA:
 * - 30–100  → leve
 * - 100–300 → fluido
 * - 300–600 → agressivo
 *
 * NOTAS:
 * - NÃO afeta velocidade
 * - NÃO é física
 */
export function applyFieldAsDisplacement(p, field, speedPxPerSec, dt) {
  p.x += field.nx * field.strength * speedPxPerSec * dt;
  p.y += field.ny * field.strength * speedPxPerSec * dt;
}

/**
 * Mola visual (não física).
 *
 * CONTRATO:
 * - stiffness ∈ [0, 1]
 *
 * ESCALA:
 * - 0.02–0.08 → suave
 * - 0.1–0.2   → resposta rápida
 *
 * NOTAS:
 * - NÃO usa dt
 * - NÃO respeita massa real
 */
export function softSpring(p, x, y, stiffness = 0.05) {
  p.vx += (x - p.x) * stiffness;
  p.vy += (y - p.y) * stiffness;
}

/**
 * Atração suave por interpolação direta.
 *
 * CONTRATO:
 * - strength ∈ [0, 1]
 *
 * ESCALA:
 * - 0.01–0.05 → lento
 * - 0.05–0.15 → médio
 * - 0.15–0.3  → agressivo
 *
 * NOTAS:
 * - ignora física
 * - ignora dt
 */
export function softAttract(p, target, strength = 0.05) {
  p.x += (target.x - p.x) * strength;
  p.y += (target.y - p.y) * strength;
}
