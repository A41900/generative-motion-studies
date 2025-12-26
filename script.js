import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { TextEffect } from "./effects/TextEffect.js";
import { BubbleEffect } from "./effects/BubbleEffect.js";

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

  gradient.addColorStop(0, "#000000ff");
  gradient.addColorStop(1, "#19093cff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

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
}

//system.createTextParticles("a creative space");

const scene = new Scene();

const constellation = new ConstellationEffect({ canvas: canvas, count: 300 });
const text = new TextEffect({ canvas: canvas, text: "a creative space" });
const bubble = new BubbleEffect({ canvas: canvas });

scene.add(constellation);

let lastTime = performance.now();

function animate(time) {
  const deltaMs = time - lastTime;
  lastTime = time;

  // dt em segundos, com clamp de segurança
  const dt = Math.min(deltaMs / 1000, 0.033);
  drawBackground();
  scene.update(dt); // dt = 1 por agora
  scene.draw(ctx);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  scene.resize(canvas.width, canvas.height);
});

window.addEventListener("mousemove", (e) => {
  scene.onMouseMove({ x: e.clientX, y: e.clientY });
});
