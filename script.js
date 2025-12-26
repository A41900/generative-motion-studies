import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { StarfieldEffect } from "./starfield.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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

let scene;
let lastTime = 0;

function init() {
  resizeCanvas();
  scene = new Scene();
  let starfield = new StarfieldEffect(canvas, {
    stars: 1600,
    brightStars: 40,
    nebulaBlobs: 20,
    dust: 220,
    //seed: 1234,
  });
  //let ConstellationEffect = new ConstellationEffect({ canvas, count: 300 });
  scene.add(starfield);

  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function animate(time) {
  const deltaMs = time - lastTime;
  lastTime = time;
  // dt em segundos, com clamp de segurança
  const dt = Math.min(deltaMs / 1000, 0.033);
  scene.update(dt); // dt = 1 por agora
  scene.draw(ctx);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  if (!scene) return;
  resizeCanvas();
  scene.resize(canvas);
});

window.addEventListener("mousemove", (e) => {
  scene.onMouseMove({ x: e.clientX, y: e.clientY });
});

init();
