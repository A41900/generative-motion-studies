import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { StarfieldEffect } from "./effects/starfield.js";
import { FlowField } from "./effects/Flowfield.js";
import { StreamEffect } from "./effects/StreamEffect.js";
import { SmokeEffect } from "./effects/SmokeEffect.js";
import { WaterEffect } from "./effects/WaterEffect.js";
import { Effect5 } from "./effects/Effect5.js";

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
  window.effects.water.resize(viewWidth, viewHeight);
  scene.add(window.effects.water);
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

const effect4 = document.getElementById("effect4-btn");
effect4.addEventListener("click", () => {
  clearCanvas();
  scene.removeAll();
  window.effects.effect5.resize(viewWidth, viewHeight);
  scene.add(window.effects.effect5);
});

window.addEventListener("keydown", (e) => {
  if (!effect5) return;

  if (e.key === "ArrowRight") {
    e.preventDefault();
    effect5.nextPalette();
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    effect5.prevPalette();
  }
});

let water, stream, starfield, stars, flowfield, effectSmoke, effect5;

function init() {
  scene = new Scene();
  resizeCanvas();

  //smoke = new SmokeEffect(viewWidth, viewHeight);

  water = new WaterEffect(viewWidth, viewHeight, {
    fade: 0.025,
    speed: 90,
    puffRadius: 16,
  });

  stream = new StreamEffect({
    width: viewWidth,
    height: viewHeight,
    count: 600,
    speed: 140,
  });

  effect5 = new Effect5({ width: viewWidth, height: viewHeight });
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

  window.effects = { water, stream, flowfield, effect5, stars, starfield };
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
  scene.draw(ctx, dt);
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
