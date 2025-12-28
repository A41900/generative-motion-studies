import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { StarfieldEffect } from "./effects/starfield.js";
import { FlowField } from "./effects/Flowfield.js";
import { StreamEffect } from "./effects/StreamEffect.js";
import { SmokeEffect } from "./effects/SmokeEffect.js";

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

const effect1 = document.getElementById("effect1-btn");
effect1.addEventListener("click", () => {
  clearCanvas();
  scene.removeAll();
  window.effects.smoke.resize(viewWidth, viewHeight);
  scene.add(window.effects.smoke);
});

const effect2 = document.getElementById("effect2-btn");
effect2.addEventListener("click", () => {
  clearCanvas();
  scene.removeAll();
  window.effects.flowfield.resize(viewWidth, viewHeight);
  scene.add(window.effects.flowfield);
});

const effect3 = document.getElementById("effect3-btn");
effect3.addEventListener("click", () => {
  clearCanvas();
  scene.removeAll();
  window.effects.starfield.resize(viewWidth, viewHeight);
  window.effects.stars.resize(viewWidth, viewHeight);
  scene.add(window.effects.starfield, window.effects.stars);
});

let smoke, stream, starfield, stars, flowfield;

function init() {
  scene = new Scene();
  resizeCanvas();

  smoke = new SmokeEffect(viewWidth, viewHeight);

  stream = new StreamEffect({
    width: viewWidth,
    height: viewHeight,
    count: 600,
    speed: 140,
  });

  starfield = new StarfieldEffect(viewWidth, viewHeight, {
    stars: 1600,
    brightStars: 40,
    nebulaBlobs: 20,
    dust: 220,
  });

  stars = new ConstellationEffect({
    width: viewWidth,
    height: viewHeight,
  });

  flowfield = new FlowField({ width: viewWidth, height: viewHeight });

  scene.add(stream);

  window.effects = { smoke, stream, starfield, stars, flowfield };
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

function clearCanvas() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

const buttons = document.querySelectorAll(".menu .btn");
const panels = document.querySelectorAll(".panel");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    panels.forEach((panel) => panel.classList.add("hidden"));
    btn.classList.add("active");
    const id = btn.id.replace("-btn", "");
    const panel = document.getElementById(id);
    if (panel) {
      panel.classList.remove("hidden");
    }
  });
});
