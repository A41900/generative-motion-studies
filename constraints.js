// Espaço topologicamente contínuo (torus). Quando sai de um lado, entra pelo oposto.
export function wrapParticle(p, width, height) {
  const r = p.radius ?? 0;

  if (p.x < -r) p.x += width + r * 2;
  else if (p.x > width + r) p.x -= width + r * 2;

  if (p.y < -r) p.y += height + r * 2;
  else if (p.y > height + r) p.y -= height + r * 2;
}

// Colisão elástica ou amortecida com limites.
export function bounceFromBounds(p, bounds, restitution = 0.5) {
  const r = p.radius ?? 0;

  const minX = r;
  const maxX = bounds.width - r;
  const minY = r;
  const maxY = bounds.height - r;

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

export function respawnParticle(p, width, height) {}

function wrap(p) {
  if (p.x < 0) p.x += this.width;
  if (p.y < 0) p.y += this.height;
  if (p.x > this.width) p.x -= this.width;
  if (p.y > this.height) p.y -= this.height;
}

function respawn(p) {
  p.x = Math.random() * this.width;
  p.y = Math.random() * this.height;
  p.syncPrev();
}
