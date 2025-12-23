export class Effect {
  // ===== VISUAL (SEM FÍSICA) =====

  static attractVisual(p, x, y, strength = 0.05) {
    p.x += (x - p.x) * strength;
    p.y += (y - p.y) * strength;
  }

  static repelVisual(p, x, y, radius, strength = 1) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist < radius && dist > 0.001) {
      const force = (1 - dist / radius) * strength;
      p.x += (dx / dist) * force;
      p.y += (dy / dist) * force;
    }
  }

  // ===== FÍSICA (vx / vy) =====

  static attractForce(p, x, y, strength = 1) {
    p.vx += (x - p.x) * strength;
    p.vy += (y - p.y) * strength;
  }

  static repelForce(p, x, y, radius, strength = 1) {
    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist < radius && dist > 0.001) {
      const force = (1 - dist / radius) * strength;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
  }

  static explodeFromPoint(p, cx, cy, strength) {
    const angle = Math.atan2(p.y - cy, p.x - cx);
    const force = Math.random() * strength;
    p.vx += Math.cos(angle) * force;
    p.vy += Math.sin(angle) * force;
  }

  static mouseDeflectionVisual(p, mx, my, radius) {
    const dx = p.x - mx;
    const dy = p.y - my;
    const dist = Math.hypot(dx, dy);

    if (dist < radius) {
      const force = radius / dist;
      const angle = Math.atan2(dy, dx);

      p.x += Math.cos(angle) * force;
      p.y += Math.sin(angle) * force;
    }
  }

  // ===== VISUAL =====

  static connect(particles, ctx, maxDistance = 65) {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          ctx.strokeStyle = `hsla(2,2%,40%,${1 - dist / maxDistance})`;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }
}
