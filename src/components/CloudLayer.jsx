import { useEffect, useRef } from "react";

const MAX_PUFFS = 260;
const TAU = Math.PI * 2;

// Réglages par type de bouffée : rayon de départ / d'arrivée (px), durée de
// vie (s), opacité, dérive.
const KINDS = {
  cursor: { r0: [6, 10], r1: [26, 42], life: [0.9, 1.4], alpha: 0.85, drift: 14, rise: 10 },
  click: { r0: [5, 9], r1: [20, 34], life: [0.8, 1.2], alpha: 0.95, drift: 0, rise: 6 },
  clickCore: { r0: [12, 14], r1: [44, 56], life: [1, 1.3], alpha: 0.9, drift: 0, rise: 8 },
  trail: { r0: [4, 6], r1: [18, 30], life: [1.3, 1.9], alpha: 0.85, drift: 5, rise: 4 },
};

let emit = null;

// Ajoute une bouffée de nuage à l'écran (coordonnées de la fenêtre).
// Utilisé par l'avion pour sa traînée ; sans effet si le calque est absent.
export function puff(x, y, kind = "trail") {
  emit?.(x, y, kind);
}

const rand = ([a, b]) => a + Math.random() * (b - a);

// Dessine une bouffée une fois pour toutes : une ombre lavande décalée vers le
// bas, puis la bouffée blanche par-dessus — visible même sur fond blanc.
function makeSprite(inner, outer) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.55, inner.replace(/[\d.]+\)$/, (a) => `${parseFloat(a) * 0.8})`));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return c;
}

// Calque plein écran (au-dessus du contenu, sous la nav et les fenêtres) qui
// ne tourne que lorsqu'il y a des bouffées à animer : aucun coût au repos.
export default function CloudLayer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const white = makeSprite("rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)");
    const shade = makeSprite("rgba(150, 138, 230, 0.5)", "rgba(150, 138, 230, 0)");
    const parts = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let prev = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(x, y, kind, vx = 0, vy = 0) {
      const k = KINDS[kind];
      if (parts.length >= MAX_PUFFS) parts.shift();
      parts.push({
        x,
        y,
        vx: vx + (Math.random() - 0.5) * 2 * k.drift,
        vy: vy + (Math.random() - 0.5) * k.drift - k.rise,
        r0: rand(k.r0),
        r1: rand(k.r1),
        life: rand(k.life),
        alpha: k.alpha,
        age: 0,
      });
      if (!raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function frame(now) {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        const t = p.age / p.life;
        if (t >= 1) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        const r = p.r0 + (p.r1 - p.r0) * (1 - Math.pow(1 - t, 2));
        const fadeIn = Math.min(1, t / 0.12);
        const a = p.alpha * fadeIn * (1 - t);
        ctx.globalAlpha = a * 0.55;
        ctx.drawImage(shade, p.x - r + r * 0.1, p.y - r + r * 0.22, r * 2, r * 2);
        ctx.globalAlpha = a;
        ctx.drawImage(white, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      raf = parts.length ? requestAnimationFrame(frame) : 0;
    }

    emit = (x, y, kind) => {
      if (kind === "click") {
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * TAU + Math.random() * 0.4;
          const speed = 70 + Math.random() * 50;
          spawn(x + Math.cos(a) * 6, y + Math.sin(a) * 6, "click", Math.cos(a) * speed, Math.sin(a) * speed);
        }
        spawn(x, y, "clickCore");
      } else {
        spawn(x, y, kind);
      }
    };

    // Souris : une bouffée tous les ~18 px parcourus (ordinateur seulement).
    let lastX = null;
    let lastY = null;
    function onMove(e) {
      if (e.pointerType !== "mouse") return;
      if (lastX === null || Math.hypot(e.clientX - lastX, e.clientY - lastY) > 18) {
        if (lastX !== null) spawn(e.clientX, e.clientY, "cursor");
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }
    function onDown(e) {
      emit(e.clientX, e.clientY, "click");
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      emit = null;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="cloud-layer" aria-hidden="true" />;
}
