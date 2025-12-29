export function applyFieldAsAcceleration(p, field, accelPxPerSec2) {
  p.applyForce(
    field.nx * field.strength * accelPxPerSec2,
    field.ny * field.strength * accelPxPerSec2
  );
}

export function applyFieldAsImpulse(p, field, speedPxPerSec) {
  p.vx += field.nx * field.strength * speedPxPerSec;
  p.vy += field.ny * field.strength * speedPxPerSec;
}

export function applySpringForce(p, x, y, kPxPerSec2PerPx) {
  p.applyForce((x - p.x) * kPxPerSec2PerPx, (y - p.y) * kPxPerSec2PerPx);
}
