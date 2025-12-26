// StreamEffect.js
import { guidedFlowField } from "./Flowfield.js";

export class StreamEffect {
  constructor({ width, height, count = 600, speed = 120, lineWidth = 1 }) {
    this.width = width;
    this.height = height;
    this.count = count;
    this.speed = speed;
    this.lineWidth = lineWidth;

    //const mood = 0.5 + 0.5 * Math.sin(this.time * 0.05);

    //const chaos = Math.sin(this.time * 0.4 + p.x * 0.02) * mood * 0.4;

    this.time = 0;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const lane = i % 2;
      const pos = this.spawnOnStream(lane);

      this.particles.push({
        x: pos.x,
        y: pos.y,
        prevX: pos.x,
        prevY: pos.y,
        lane,
        seed: Math.random(),
      });
    }
  }

  // 👉 define as DUAS correntes
  spawnOnStream(lane) {
    const x = Math.random() * this.width;

    const amplitude = 160;
    const wavelength = 900;
    const laneOffset = 40;

    const baseY =
      this.height * 0.5 + amplitude * Math.sin((x / wavelength) * Math.PI * 2);

    const y =
      baseY +
      (lane === 0 ? -laneOffset : laneOffset) +
      (Math.random() - 0.5) * 6;

    return { x, y };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(dt) {
    this.time += dt;

    for (const p of this.particles) {
      // guarda posição anterior
      p.prevX = p.x;
      p.prevY = p.y;

      // consulta o campo
      const field = guidedFlowField(p, this.time);

      // deslocamento
      const speed =
        this.speed * (0.7 + 0.6 * Math.sin(this.time * 0.6 + p.seed * 10));

      p.x += field.nx * speed * dt;
      p.y += field.ny * speed * dt;

      //p.x += field.nx * this.speed * dt;
      //p.y += field.ny * this.speed * dt;

      // força suave de contenção à corrente
      const target = this.streamCenter(p.x, p.lane);
      p.y += (target - p.y) * 0.02;

      // respawn se sair
      if (
        p.x < -50 ||
        p.x > this.width + 50 ||
        p.y < -50 ||
        p.y > this.height + 50
      ) {
        const pos = this.spawnOnStream(p.lane);
        p.x = pos.x;
        p.y = pos.y;
        p.prevX = p.x;
        p.prevY = p.y;
      }
    }
  }

  // centro ideal da corrente
  streamCenter(x, lane) {
    const amplitude = 160;
    const wavelength = 900;
    const laneOffset = 40;

    const base =
      this.height * 0.5 + amplitude * Math.sin((x / wavelength) * Math.PI * 2);

    return base + (lane === 0 ? -laneOffset : laneOffset);
  }

  draw(ctx) {
    ctx.save();

    //ctx.lineWidth = this.lineWidth;
    ctx.lineCap = "round";

    for (const p of this.particles) {
      ctx.lineWidth = 0.6 + 1.4 * Math.sin(this.time * 0.4 + p.seed * 20);
      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);

      // cor ligada à seed
      ctx.strokeStyle = `hsla(
        ${p.seed * 360},
        80%,
        45%,
        0.15
      )`;

      ctx.stroke();
    }

    ctx.restore();
  }
}
