export class Particle {
  /**
   * CONTRATO:
   * - posição: px
   * - velocidade: px / s
   * - força: px / s² × mass
   */
  constructor({ x = 0, y = 0, vx = 0, vy = 0, mass = 1, radius = 1 } = {}) {
    // estado geométrico
    this.x = x;
    this.y = y;

    this.prevX = this.x;
    this.prevY = this.y;

    this.path = []; // <<< AQUI ESTÁ O FUMO
    this.maxPath = 60;

    // estado físico
    this.vx = vx;
    this.vy = vy;

    this.fx = 0;
    this.fy = 0;

    this.mass = mass;
    this.radius = radius;

    // estado visual / auxiliar
    this.depth = Math.random() ** 2.2; // profundidade visual [0, 1]
    this.life = 1; // vida normalizada [1 → 0]
    this.seed = Math.random(); // ruído determinístico
  }

  /**
   * Acumula força física.
   *
   * @param {number} fx - força em px / s² × mass
   * @param {number} fy - força em px / s² × mass
   */
  applyForce(fx, fy) {
    this.fx += fx;
    this.fy += fy;
  }

  /**
   * Integra física no tempo.
   *
   * CONTRATO:
   * - dt em segundos
   * - aplica aceleração e atualiza posição
   */
  integrate(dt) {
    this.prevX = this.x;
    this.prevY = this.y;
    // aceleração = força / massa
    this.vx += (this.fx / this.mass) * dt;
    this.vy += (this.fy / this.mass) * dt;

    // posição
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // limpa forças
    this.fx = 0;
    this.fy = 0;
  }

  /**
   * Damping exponencial (por segundo).
   *
   * @param {number} retention - fração de velocidade após 1 segundo [0, 1]
   * @param {number} dt - delta time em segundos
   */
  damp(retention, dt) {
    const factor = Math.pow(retention, dt);
    this.vx *= factor;
    this.vy *= factor;
  }

  /**
   * Interpolação visual direta (NÃO física).
   *
   * @param {number} x - alvo x (px)
   * @param {number} y - alvo y (px)
   * @param {number} t - fator de interpolação [0, 1]
   */
  lerpTo(x, y, t) {
    this.x += (x - this.x) * t;
    this.y += (y - this.y) * t;
  }

  syncPrev() {
    this.prevX = this.x;
    this.prevY = this.y;
  }

  addPoint(x, y) {
    this.path.push({ x, y });
    if (this.path.length > this.maxPath) {
      this.path.shift();
    }
  }
}
