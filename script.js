import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { StarfieldEffect } from "./starfield.js";

let viewWidth = 0;
let viewHeight = 0;
let scene;
let lastTime = 0;

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

function init() {
  resizeCanvas();
  scene = new Scene();

  let starfield = new StarfieldEffect(viewWidth, viewHeight, {
    stars: 1600,
    brightStars: 40,
    nebulaBlobs: 20,
    dust: 220,
    //seed: 1234,
  });
  let stars = new ConstellationEffect({
    width: viewWidth,
    height: viewHeight,
  });
  scene.add(starfield, stars);

  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;

  canvas.style.width = viewWidth + "px";
  canvas.style.height = viewHeight + "px";

  canvas.width = Math.floor(viewWidth * dpr);
  canvas.height = Math.floor(viewHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (scene) scene.resize(viewWidth, viewHeight);
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
  resizeCanvas();
});

window.addEventListener("mousemove", (e) => {
  scene.onMouseMove({ x: e.clientX, y: e.clientY });
});

init();
