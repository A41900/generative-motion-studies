import { ParticleSystem } from "./ParticleSystem.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawBackground() {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height,
    0,
    canvas.width / 2,
    canvas.height,
    canvas.width
  );

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    system.resize(canvas.width, canvas.height);
  });

  gradient.addColorStop(0, "#000000ff");
  gradient.addColorStop(1, "#19093cff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  system.resize(canvas.width, canvas.height);
});

window.addEventListener("mousemove", (e) => {
  system.mouse.x = e.clientX;
  system.mouse.y = e.clientY;
  system.mouse.move = true;
  console.log("move");
});

window.addEventListener("mousedown", (e) => {
  system.mouse.pressed = true;
});

const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", toggleMenu);

function toggleMenu() {
  const menu = document.querySelector(".menu");
  menu.classList.toggle("hidden");
}
const aboutBtn = document.getElementById("about-btn");
aboutBtn.addEventListener("click", showAbout);

function showAbout() {
  const container = document.getElementById("about");
  container.classList.toggle("hidden");
  //effect.createTextParticles("about me");
  //effect.destroy();
}

const system = new ParticleSystem(canvas);
system.createTextParticles("a creative space");

function animate() {
  drawBackground();
  system.update();
  system.draw();
  requestAnimationFrame(animate);
}

animate();
/*

  update() {
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * force;
        this.y += Math.sin(angle) * force;
      }
      // se for partícula de texto, regressa ao alvo
      if (this.isText) {
        this.x += (this.baseX - this.x) * 0.05;
        this.y += (this.baseY - this.y) * 0.05;
      }
    }
    // faz as particles darem bounce
    this.x += this.vx + this.pushX;
    if (this.x > this.effect.width - this.radius || this.x < 0) this.vx *= -1;
    if (this.y > this.effect.height - this.radius || this.y < 0) this.vy *= -1;
    this.y += this.vy + this.pushY;

    if (this.isExploding) {
      // friction SÓ para explosão
      this.vx *= 0.92;
      this.vy *= 0.92;
      // opcional: quando a velocidade é baixa, termina explosão
      if (Math.abs(this.vx) < 0.05 && Math.abs(this.vy) < 0.05) {
        this.isExploding = false;
      }
    }
  }
*/
