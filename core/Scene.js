// Scene.js
export class Scene {
  constructor() {
    this.effects = [];
  }

  // adiciona um efeito (ConstellationEffect, TextEffect, etc.)
  add(...effect) {
    this.effects.push(...effect);
  }

  // remove um efeito
  remove(effect) {
    this.effects = this.effects.filter((e) => e !== effect);
  }

  // update global (dt = delta time)
  update(dt = 1) {
    for (const effect of this.effects) {
      effect.update?.(dt);
    }
  }

  // draw global
  draw(ctx) {
    for (const effect of this.effects) {
      effect.draw?.(ctx);
    }
  }

  // propaga mouse move (opcional)
  onMouseMove(pos) {
    for (const effect of this.effects) {
      effect.onMouseMove?.(pos);
    }
  }

  // propaga mouse down (opcional)
  onMouseDown(pos) {
    for (const effect of this.effects) {
      effect.onMouseDown?.(pos);
    }
  }

  // resize global
  resize(canvas) {
    for (const effect of this.effects) {
      effect.resize?.(canvas);
    }
  }
}
