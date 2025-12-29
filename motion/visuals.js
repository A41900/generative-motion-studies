// Aplica um Field como DESLOCAMENTO VISUAL.
export function applyFieldAsDisplacement(p, field, speedPxPerSec, dt) {
  p.x += field.nx * field.strength * speedPxPerSec * dt;
  p.y += field.ny * field.strength * speedPxPerSec * dt;
}

//Interpolação exponencial da posição em direção a um alvo
export function lerpTo(p, target, factor = 0.05) {
  p.x += (target.x - p.x) * factor;
  p.y += (target.y - p.y) * factor;
}
