export function radialField(p, x, y, radius = Infinity, direction = 1) {
  const dx = (p.x - x) * direction;
  const dy = (p.y - y) * direction;
  const dist = Math.hypot(dx, dy);

  if (dist === 0 || dist > radius) return null;

  return {
    nx: dx / dist,
    ny: dy / dist,
    strength: 1 - dist / radius, // decai linearmente
  };
}

export function flowField(p, time = 0, wavelengthPx = 500) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const ax = Math.sin(p.x * scale + time);
  const ay = Math.sin(p.y * scale + time * 1.37);

  const angle = Math.atan2(ay, ax);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function pseudoFlowField(p, time) {
  const scale = 0.002;
  const t = time * 0.0005;

  const ax = Math.sin(p.x * scale + t);
  const ay = Math.cos(p.y * scale - t * 1.3);

  const angle = Math.atan2(ay, ax);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function guidedFlowField(p) {
  const scaleX = 0.002; // controla largura da onda
  const amplitude = 120; // altura da curva
  const wavelength = 800;

  // curva base (linha vermelha)
  const yCurve = amplitude * Math.sin((p.x / wavelength) * Math.PI * 2);

  // derivada da curva → direção tangente
  const dy_dx =
    ((amplitude * Math.PI * 2) / wavelength) *
    Math.cos((p.x / wavelength) * Math.PI * 2);

  // vetor tangente (1, dy/dx)
  const angle = Math.atan2(dy_dx, 1);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function ribbonField(p, time) {
  const scale = 0.001;
  const t = time * 0.05;

  const nx = Math.sin((p.y + t) * scale * 2);
  const ny = Math.cos((p.x + t) * scale * 2);

  return {
    nx,
    ny,
    strength: 40 * (0.3 + p.depth),
  };
}

export function noiseField(p, time, wavelengthPx = 250) {
  const scale = (2 * Math.PI) / wavelengthPx;

  // duas fases independentes
  const ax = Math.sin(p.x * scale + time);
  const ay = Math.sin(p.y * scale + time * 1.37);

  // mistura simétrica → ângulo completo
  const angle = (ax + ay) * Math.PI;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function localJitterField(p, origin, wavelengthPx = 120, phase = 0) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const dx = p.x - origin.x;
  const dy = p.y - origin.y;

  const angle = Math.sin(dx * scale + phase) + Math.cos(dy * scale - phase);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function waveField(p, origin, phase, wavelengthPx = 300) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const dx = p.x - origin.x;
  const dy = p.y - origin.y;

  const angle = Math.sin(dx * scale + phase) + Math.cos(dy * scale + phase);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function vortexTowardsTarget(p, target, strength = 1) {
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const dist = Math.hypot(dx, dy) || 0.0001;

  // direção radial
  const rx = dx / dist;
  const ry = dy / dist;

  // direção tangencial (90º)
  const tx = -ry;
  const ty = rx;

  return {
    nx: rx * 0.7 + tx * 0.3, // mistura radial + swirl
    ny: ry * 0.7 + ty * 0.3,
    strength: Math.min(1, strength / dist),
  };
}

export function spaceDriftField(p, time, wavelengthPx = 1200) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const tx = time * 0.03;
  const ty = time * 0.017;

  const ax = Math.sin((p.x + tx) * scale);
  const ay = Math.cos((p.y + ty) * scale);

  const angle = Math.atan2(ay, ax);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
  };
}

export function spaceCurlField(p, time, wavelengthPx = 1200) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const tx = time * 0.02;
  const ty = time * 0.015;

  // Potencial escalar
  const n = Math.sin((p.x + tx) * scale) + Math.cos((p.y + ty) * scale);

  // Curl 2D (∂n/∂y , -∂n/∂x)
  const dx = Math.cos((p.y + ty) * scale) * scale;
  const dy = -Math.cos((p.x + tx) * scale) * scale;

  const mag = Math.hypot(dx, dy) || 1;

  return {
    nx: dx / mag,
    ny: dy / mag,
    strength: 1,
  };
}

export function randomTemporalField(p, time) {
  // cada partícula tem o seu ritmo
  const speed = 0.3 + p.seed * 1.2;

  // ângulo muda lentamente mas de forma imprevisível
  const angle =
    Math.sin(time * speed + p.seed * 1000) +
    Math.cos(time * speed * 0.73 + p.seed * 2000);

  // maioria lenta, poucas rápidas
  const strength = p.depth ** 2 * 40;

  return {
    fx: Math.cos(angle) * strength,
    fy: Math.sin(angle) * strength,
  };
}

export function mixFields(fields, weights) {
  let x = 0;
  let y = 0;

  for (let i = 0; i < fields.length; i++) {
    x += fields[i].nx * weights[i];
    y += fields[i].ny * weights[i];
  }

  const mag = Math.hypot(x, y) || 1;
  return { nx: x / mag, ny: y / mag };
}
