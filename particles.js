/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particles {
  constructor(effect, x = null, y = null) {
    this.effect = effect;
    this.radius = Math.random() * 2;
    // PARTÍCULA DE TEXTO (tem alvo)
    if (x !== null && y !== null) {
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.baseX = x;
      this.baseY = y;
      this.isText = true;
      this.isExploding = false;
    }
    // PARTÍCULA DE FUNDO (aleatória como já tinhas)
    else {
      this.x =
        this.radius + Math.random() * (this.effect.width - this.radius * 2);
      this.y =
        this.radius + Math.random() * (this.effect.height - this.radius * 2);
      this.isText = false;
    }
    //this.color = "hsl(" + Math.random() * 360 + ",85%, 50%)";
    this.color = "hsla(43, 100%, 86%, 0.85)";
    const speed = 0.2;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.pushX = 0;
    this.pushY = 0;
  }

  draw(context) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }

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
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.maxParticles = 300;
    this.particles = [];
    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 100,
    };
    this.createParticles();
    window.addEventListener("resize", (e) => {
      this.reset(e.target.window.innerWidth, e.target.window.innerHeight);
      resizeCanvas();
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.pressed = true;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    window.addEventListener("mousedown", (e) => {
      this.mouse.pressed = true;
      this.mouse.y = e.y;
      this.mouse.x = e.x;
    });

    this.textParticles = [];
    this.textX = this.width * 0.92;
    this.textY = this.height * 0.82;
  }
  createParticles() {
    for (let i = 0; i < this.maxParticles; ++i) {
      this.particles.push(new Particles(this));
    }
  }
  createTextParticles(text) {
    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    textCanvas.width = this.width;
    textCanvas.height = this.height;

    textCtx.fillStyle = "white";
    textCtx.textAlign = "right";
    textCtx.textBaseline = "alphabetic";

    textCtx.font = "80px Space Grotesk";

    //textCtx.font = "140px 'Inter'";
    //textCtx.fillText(text, this.width / 2, this.height / 2);
    textCtx.fillText(text, this.textX, this.textY);

    const imageData = textCtx.getImageData(0, 0, this.width, this.height).data;

    this.textParticles = [];

    const gap = 2; // experimenta 2, 3 ou 4
    for (let y = 0; y < this.height; y += gap) {
      for (let x = 0; x < this.width; x += gap) {
        const index = (y * this.width + x) * 4;
        const alpha = imageData[index + 3];

        if (alpha > 120) {
          this.textParticles.push(new Particles(this, x, y));
        }
      }
    }
  }

  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
  handleTextParticles(context) {
    this.textParticles.forEach((p) => {
      p.draw(context);
      p.update();
    });
  }
  connectParticles(context) {
    const maxDistance = 65;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          context.strokeStyle = `hsla(2, 2%, 40%, ${opacity})`;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
        }
      }
    }
  }
  destroy() {
    const cx = this.textX ?? this.width / 2;
    const cy = this.textY ?? this.height / 2;

    this.textParticles.forEach((p) => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const angle = Math.atan2(dy, dx);
      const force = Math.random() * 30 + 20;

      p.vx = Math.cos(angle) * force;
      p.vy = Math.sin(angle) * force;

      p.isText = false;
      p.isExploding = true;
    });
  }

  reset(x, y) {
    this.width = x;
    this.height = y;
  }
}

const effect = new Effect(canvas);
effect.createTextParticles("a creative space");

let about = false;
function animate() {
  drawBackground();
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  effect.handleTextParticles(ctx);
  requestAnimationFrame(animate);
}

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

resizeCanvas();
animate();

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
