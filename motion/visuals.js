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

export function applyLateralDiffusion(p, strength = 0.4) {
  const a = Math.random() * Math.PI * 2;
  p.x += Math.cos(a) * strength;
  p.y += Math.sin(a) * strength;
}

export function updateSmokeLife(p) {
  p.life++;
  if (p.life > p.maxLife) return false;
  return true;
}
