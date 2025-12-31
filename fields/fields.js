import { createNoise3D } from "./simplex-noise.js";

const noise = createNoise3D();

/**
 * Field direcional baseado em noise contínuo.
 *
 * CONTRATO:
 * - p.x, p.y em px
 * - time em segundos
 * - devolve direção unitária
 */

function noiseAngle({ x, y, time, spatialScale, timeScale, phase = 0 }) {
  return (
    noise(x * spatialScale, y * spatialScale, time * timeScale + phase) *
    Math.PI *
    2
  );
}
export function waterField(
  p,
  time,
  { spatialScale = 0.002, timeScale = 0.15, strength = 1 } = {}
) {
  const angle = noiseAngle({
    x: p.x,
    y: p.y,
    time,
    spatialScale,
    timeScale,
  });

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength,
  };
}

export function noiseField2D({
  x,
  y,
  time = 0,
  spatialScale = 0.002,
  timeScale = 0.2,
  strength = 1,
}) {
  const n = noise(x * spatialScale, y * spatialScale, time * timeScale); // [-1, 1]

  const angle = n * Math.PI * 2;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength,
  };
}

export function flowNoiseField(p, time) {
  return noiseField2D({
    x: p.x,
    y: p.y,
    time,
    spatialScale: 0.0015,
    timeScale: 0.15,
    strength: 1,
  });
}

export function smokeNoiseField(p, time) {
  return noiseField2D({
    x: p.x,
    y: p.y,
    time,
    spatialScale: 0.003,
    timeScale: 0.08,
    strength: 0.6,
  });
}

export function fineTurbulenceField(p, time) {
  return noiseField2D({
    x: p.x,
    y: p.y,
    time,
    spatialScale: 0.01,
    timeScale: 0.3,
    strength: 0.4,
  });
}

export function waterFlowField(p, time) {
  const scale = 0.002;
  const speed = 0.15;

  const n = noise(p.x * scale, p.y * scale + time * speed);

  const angle = n * Math.PI * 2;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
  };
}

/**
 * Field com direção dominante para cima,
 * com ondulação lateral via noise.
 */
export function upwardNoiseField(
  p,
  time,
  {
    spatialScale = 0.002,
    timeScale = 0.15,
    waveStrength = 0.6, // quanto o noise desvia
    upwardBias = 1.0, // quão forte é o "para cima"
    strength = 1,
  } = {}
) {
  // noise contínuo [-1, 1]
  const n = noise(p.x * spatialScale, p.y * spatialScale, time * timeScale);

  // desvio lateral (ondas)
  const lateral = n * waveStrength;

  // vetor base (para cima)
  let nx = lateral;
  let ny = -upwardBias;

  // normalizar
  const mag = Math.hypot(nx, ny) || 1;
  nx /= mag;
  ny /= mag;

  return { nx, ny, strength };
}

export function mixFields22(a, b, wa = 0.7, wb = 0.3) {
  const x = a.nx * wa + b.nx * wb;
  const y = a.ny * wa + b.ny * wb;

  const mag = Math.hypot(x, y) || 1;

  return {
    nx: x / mag,
    ny: y / mag,
    strength: a.strength * wa + b.strength * wb,
  };
}

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
export function expansionField(p, origin, strength = 0.3) {
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;

  const d = Math.hypot(dx, dy) || 1;

  return {
    nx: dx / d,
    ny: dy / d,
    strength,
  };
}

export function fbm(
  x,
  y,
  t,
  { octaves = 5, lacunarity = 2.0, gain = 0.5, scale = 0.002 } = {}
) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * scale * frequency, y * scale * frequency, t);

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value; // ≈ [-1,1]
}

export function fbm2(
  x,
  y,
  t,
  { octaves = 5, lacunarity = 2.0, gain = 0.5, scale = 0.002 } = {}
) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * scale * frequency, y * scale * frequency, t);

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

export function simplexCurlField(
  p,
  time,
  { scale = 0.0015, timeScale = 0.1, strength = 1 } = {}
) {
  const eps = 0.0005;

  const x = p.x * scale;
  const y = p.y * scale;
  const t = time * timeScale;

  // derivadas parciais
  const n1 = noise(x, y + eps, t);
  const n2 = noise(x, y - eps, t);
  const a = (n1 - n2) / (2 * eps);

  const n3 = noise(x + eps, y, t);
  const n4 = noise(x - eps, y, t);
  const b = (n3 - n4) / (2 * eps);

  // curl 2D = (∂n/∂y, -∂n/∂x)
  let nx = a;
  let ny = -b;

  const mag = Math.hypot(nx, ny) || 1;
  nx /= mag;
  ny /= mag;

  return { nx, ny, strength };
}

export function largeFlowField(p, time) {
  const scale = 0.0006; // MUITO grande
  const speed = 0.05;

  const angle =
    Math.sin(p.x * scale + time * speed) + Math.cos(p.y * scale - time * speed);

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 1,
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
    strength: 0.3 + p.depth,
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

//hybrid field
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

export function randomTemporalField10(p, time) {
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

export function buoyancyField(strength = 1) {
  return {
    nx: 0,
    ny: -1,
    strength,
  };
}

export function curlNoiseField(p, time, scale = 0.002) {
  const eps = 0.001;

  const n1 = noise(p.x * scale, (p.y + eps) * scale, time);
  const n2 = noise(p.x * scale, (p.y - eps) * scale, time);
  const a = (n1 - n2) / (2 * eps);

  const n3 = noise((p.x + eps) * scale, p.y * scale, time);
  const n4 = noise((p.x - eps) * scale, p.y * scale, time);
  const b = (n3 - n4) / (2 * eps);

  const mag = Math.hypot(a, -b) || 1;

  return {
    nx: a / mag,
    ny: -b / mag,
    strength: 1,
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

export function smokeFlowField(p, time) {
  const large = simplexFlowField(p, time, 900); // fluxo largo
  const fine = simplexFlowField(p, time + 1000, 180); // turbulência

  return {
    nx: large.nx * 0.8 + fine.nx * 0.2,
    ny: large.ny * 0.8 + fine.ny * 0.2,
    strength: 1,
  };
}

export function simplexFlowField(p, time, wavelengthPx = 300) {
  const scale = (2 * Math.PI) / wavelengthPx;

  const n = noise(p.x * scale, p.y * scale, time * 0.2); // n ∈ [-1, 1]

  const angle = n * Math.PI * 2;

  return {
    nx: Math.cos(angle),
    ny: Math.sin(angle),
    strength: 0.3,
  };
}

export function fbmDetail(
  x,
  y,
  t,
  { octaves = 5, lacunarity = 2.0, gain = 0.5, scale = 0.002 } = {}
) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * scale * frequency, y * scale * frequency, t);

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

export function fbmDetail2(
  x,
  y,
  t,
  { octaves = 4, lacunarity = 2.0, gain = 0.5 } = {}
) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;

  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency, t * frequency) * amplitude;

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}
