import { Scene } from "./core/Scene.js";
import { ConstellationEffect } from "./effects/ConstellationEffect.js";
import { StarfieldEffect } from "./effects/starfield.js";
import { FlowField } from "./effects/Flowfield.js";
import { StreamEffect } from "./effects/StreamEffect.js";
import { SmokeEffect } from "./effects/SmokeEffect.js";
import { WaterEffect } from "./effects/WaterEffect.js";
import { Effect5 } from "./effects/Effect5.js";
import { FlowerEffect } from "./effects/FlowerEffect.js";

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

const ctxBtn = document.getElementById("ctx-btn");
ctxBtn.addEventListener("click", () => {
  const context = document.getElementById("context");
  context.classList.toggle("hidden");
});

const btns = document.querySelectorAll(".btn-base[data-effect]");
btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.effect;
    const effect = window.effects[key];
    if (!effect) return;
    clearCanvas();
    scene.removeAll();

    effect.resize(viewWidth, viewHeight);
    scene.add(effect);
    if (key === "starfield") {
      window.effects.stars.resize(viewWidth, viewHeight);
      scene.add(window.effects.stars);
      return;
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (!window.effects?.noise) return;

  if (e.key === "ArrowRight") {
    e.preventDefault();
    noise.nextPalette();
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    noise.prevPalette();
  }
});

let shader, river, starfield, stars, flowfield, smoke, noise, flower;

function init() {
  scene = new Scene();
  resizeCanvas();

  smoke = new SmokeEffect(viewWidth, viewHeight);

  shader = new WaterEffect(viewWidth, viewHeight, {
    fade: 0.025,
    speed: 90,
    puffRadius: 16,
  });

  river = new StreamEffect({
    width: viewWidth,
    height: viewHeight,
    count: 600,
    speed: 140,
  });

  noise = new Effect5({ width: viewWidth, height: viewHeight });
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

  flower = new FlowerEffect({ width: viewHeight, height: viewHeight });

  scene.add(flower);

  window.effects = {
    shader,
    river,
    flowfield,
    noise,
    stars,
    starfield,
    smoke,
  };
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

const buttons = document.querySelectorAll(".menu .btn[data-effect]");
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
