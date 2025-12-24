// =======================================================
// FIELDS — calculam direção (NÃO movem)
// =======================================================

export function radialField(p, x, y, radius = Infinity, direction = 1) {
  const dx = (p.x - x) * direction;
  const dy = (p.y - y) * direction;
  const dist = Math.hypot(dx, dy);

  if (dist === 0 || dist > radius) return null;

  return {
    nx: dx / dist,
    ny: dy / dist,
    strength: 1 - dist / radius,
  };
}

// flow field — direção definida pelo espaço
export function flowField(p, scale = 0.01) {
  const angle = Math.sin(p.x * scale) + Math.cos(p.y * scale);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

// =======================================================
// FORCES — geram aceleração
// =======================================================

// aplica um field como força
export function applyAsForce(p, field, strength = 1) {
  p.applyForce(
    field.nx * field.strength * strength,
    field.ny * field.strength * strength
  );
}

// spring físico (Hooke) (precisa de damping)
export function springForce(p, x, y, k = 0.05) {
  p.applyForce((x - p.x) * k, (y - p.y) * k);
}

// =======================================================
// IMPULSES — alteram velocidade instantaneamente
// =======================================================

export function applyAsImpulse(p, field, strength = 1) {
  p.vx += field.nx * field.strength * strength;
  p.vy += field.ny * field.strength * strength;
}

// =======================================================
// CONSTRAINTS — SOFT
// =======================================================

// lerp / soft attract
export function softAttract(p, x, y, t = 0.05) {
  p.x += (x - p.x) * t;
  p.y += (y - p.y) * t;
}

// =======================================================
// CONSTRAINTS — HARD
// =======================================================

export function bounceFromBounds(p, bounds, restitution = 0.5) {
  if (p.x < p.radius || p.x > bounds.width - p.radius) {
    p.vx *= -restitution;
  }
  if (p.y < p.radius || p.y > bounds.height - p.radius) {
    p.vy *= -restitution;
  }
}
// =======================================================
// VISUAL DISPLACEMENT — NÃO é física (efeitos visuais)
// =======================================================

export function applyAsDisplacement(p, field, strength = 1) {
  p.x += field.nx * field.strength * strength;
  p.y += field.ny * field.strength * strength;
}

// spring visual (não físico)
export function softSpring(p, x, y, k = 0.05) {
  p.vx += (x - p.x) * k;
  p.vy += (y - p.y) * k;
}
