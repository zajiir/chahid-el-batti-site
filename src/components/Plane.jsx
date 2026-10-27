import { useEffect, useRef, useState } from "react";

// Petit avion (nez vers le haut dans son viewBox, pivoté selon sa trajectoire).
const PLANE_PATH =
  "M12 2c.8 0 1.4.7 1.4 1.5V9l8.6 5.2v2.1l-8.6-2.6v5.2l2.3 1.7V22L12 21l-3.7 1v-1.4l2.3-1.7v-5.2L2 16.3v-2.1L10.6 9V3.5C10.6 2.7 11.2 2 12 2z";

const LINEAR_SPEED = 190; // px/s sur l'orbite
const DODGE_RADIUS = 120; // px — en deçà, l'avion esquive le curseur
const MAX_OFFSET = 170; // px — écart maximal par rapport à sa trajectoire
const LOVE_DURATION = 2600; // ms
const HEARTS = [
  [-150, -90, 0.9],
  [140, -110, 1.1],
  [-110, 100, 1],
  [170, 70, 0.85],
  [0, -150, 1.2],
  [-40, 140, 0.95],
];

const smooth = (x) => x * x * (3 - 2 * x);

// mode "orbit" : orbite 3D autour de l'ancre (la sphère du splash) — passe
//   devant, derrière, et de temps en temps au travers.
// mode "roam" : tourne autour de l'ancre (le nom sur l'accueil), puis part
//   se balader sur toute la page avant de revenir.
// zBehind / zFront : z-index quand l'avion passe derrière / devant l'ancre.
export default function Plane({ anchorRef, mode = "orbit", size = 26, zBehind = 1, zFront = 3 }) {
  const planeRef = useRef(null);
  const caughtRef = useRef(null);
  const [enabled] = useState(
    () => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  const [love, setLove] = useState({ key: 0, visible: false });

  useEffect(() => {
    if (!enabled) return;
    const el = planeRef.current;
    let raf = 0;
    let prev = performance.now();
    let t = Math.random() * 60;
    let theta = Math.random() * Math.PI * 2;
    let speed = 1;
    let anchor = null;
    let lastPos = null;
    let heading = 0;
    let spin = 0;
    let caughtUntil = 0;
    let zIndex = null;
    // Balade (mode roam) : alterne entre "autour du nom" et "partout".
    let blend = 0;
    let roaming = false;
    let nextSwitch = prev + 9000 + Math.random() * 5000;
    const pointer = { x: -1e4, y: -1e4, near: false };
    const offset = { x: 0, y: 0, vx: 0, vy: 0 };
    let dodge = 1;

    function measure() {
      const r = anchorRef.current?.getBoundingClientRect();
      if (r && r.width) {
        anchor = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
      }
    }
    measure();
    const measureId = setInterval(measure, 600);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });

    function onPointerMove(e) {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    caughtRef.current = () => {
      caughtUntil = performance.now() + 1400;
      speed = Math.min(speed * 1.15, 2); // chaque prise le rend plus rapide
      offset.vx += (Math.random() - 0.5) * 1600;
      offset.vy -= 900;
    };

    function orbitPoint(dt) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Rayon variable : descend parfois sous celui de la sphère → traversée.
      const maxR = Math.min(vw, vh) / 2 - 24;
      const R = Math.min(anchor.w * (0.95 + 0.5 * Math.sin(t * 0.17)), maxR);
      theta += ((LINEAR_SPEED * speed) / Math.max(R, 40)) * dt;
      const tilt = 0.38 + 0.25 * Math.sin(t * 0.11);
      const roll = -0.35 + 0.45 * Math.sin(t * 0.07 + 1);
      const x0 = R * Math.cos(theta);
      const z0 = R * Math.sin(theta);
      const y = z0 * Math.sin(tilt);
      return {
        x: anchor.cx + x0 * Math.cos(roll) - y * Math.sin(roll),
        y: anchor.cy + x0 * Math.sin(roll) + y * Math.cos(roll),
        depth: Math.sin(theta) * Math.cos(tilt),
      };
    }

    function aroundNamePoint(dt) {
      const rx = anchor.w / 2 + 50;
      const ry = anchor.h / 2 + 60;
      theta += ((LINEAR_SPEED * 1.3 * speed) / rx) * dt;
      const roll = -0.12 + 0.1 * Math.sin(t * 0.09);
      const x0 = rx * Math.cos(theta);
      const y0 = ry * Math.sin(theta);
      return {
        x: anchor.cx + x0 * Math.cos(roll) - y0 * Math.sin(roll),
        y: anchor.cy + x0 * Math.sin(roll) + y0 * Math.cos(roll),
        depth: Math.sin(theta),
      };
    }

    function wanderPoint() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const k = t * speed;
      return {
        x: vw / 2 + (vw / 2 - 50) * Math.sin(k * 0.31 + 0.5),
        y: vh / 2 + (vh / 2 - 90) * Math.sin(k * 0.47),
        depth: 1,
      };
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      t += dt;
      if (!anchor) return;

      let p;
      if (mode === "roam") {
        if (now > nextSwitch) {
          roaming = !roaming;
          nextSwitch = now + (roaming ? 7000 + Math.random() * 4000 : 9000 + Math.random() * 6000);
        }
        blend = Math.min(1, Math.max(0, blend + (roaming ? dt : -dt) / 2.2));
        const a = aroundNamePoint(dt);
        const w = wanderPoint();
        const b = smooth(blend);
        p = {
          x: a.x + (w.x - a.x) * b,
          y: a.y + (w.y - a.y) * b,
          depth: b > 0.5 ? 1 : a.depth,
        };
      } else {
        p = orbitPoint(dt);
      }

      // Esquive : plus le curseur approche, plus il s'écarte (avec une
      // réactivité tirée au hasard à chaque approche, pour laisser une chance).
      const cx = p.x + offset.x;
      const cy = p.y + offset.y;
      const dx = cx - pointer.x;
      const dy = cy - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < DODGE_RADIUS) {
        if (!pointer.near) dodge = 0.35 + Math.random() * 0.85;
        pointer.near = true;
        const f = (1 - d / DODGE_RADIUS) * 2600 * dodge * dt;
        offset.vx += (dx / (d || 1)) * f;
        offset.vy += (dy / (d || 1)) * f;
      } else {
        pointer.near = false;
      }
      offset.vx -= offset.x * 6 * dt;
      offset.vy -= offset.y * 6 * dt;
      const damp = Math.exp(-4 * dt);
      offset.vx *= damp;
      offset.vy *= damp;
      offset.x += offset.vx * dt;
      offset.y += offset.vy * dt;
      const om = Math.hypot(offset.x, offset.y);
      if (om > MAX_OFFSET) {
        offset.x *= MAX_OFFSET / om;
        offset.y *= MAX_OFFSET / om;
      }

      const x = p.x + offset.x;
      const y = p.y + offset.y;

      if (lastPos) {
        const vx = x - lastPos.x;
        const vy = y - lastPos.y;
        if (vx * vx + vy * vy > 0.04) {
          const target = Math.atan2(vy, vx);
          let delta = target - heading;
          delta = Math.atan2(Math.sin(delta), Math.cos(delta));
          heading += delta * (1 - Math.exp(-12 * dt));
        }
      }
      lastPos = { x, y };

      const caught = now < caughtUntil;
      if (caught) spin += dt * 14;
      else spin *= Math.exp(-10 * dt);

      const scale = (mode === "orbit" ? 1 + 0.28 * p.depth : 1.08) * (caught ? 1.35 : 1);
      const rot = heading + Math.PI / 2 + spin;
      el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) rotate(${rot}rad) scale(${scale})`;
      const z = p.depth > 0 ? zFront : zBehind;
      if (z !== zIndex) {
        zIndex = z;
        el.style.zIndex = z;
      }
      if (!el.classList.contains("is-ready")) el.classList.add("is-ready");
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(measureId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("pointermove", onPointerMove);
      caughtRef.current = null;
    };
  }, [enabled, anchorRef, mode, size, zBehind, zFront]);

  useEffect(() => {
    if (!love.visible) return;
    const id = setTimeout(() => setLove((l) => ({ ...l, visible: false })), LOVE_DURATION);
    return () => clearTimeout(id);
  }, [love]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={planeRef}
        className="plane"
        style={{ width: size, height: size }}
        aria-hidden="true"
        onPointerDown={(e) => {
          e.stopPropagation();
          caughtRef.current?.();
          setLove((l) => ({ key: l.key + 1, visible: true }));
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d={PLANE_PATH} />
        </svg>
      </div>

      {love.visible && (
        <div key={love.key} className="love-pop" role="status">
          <span className="love-pop__text">I LOVE U</span>
          {HEARTS.map(([hx, hy, hd], i) => (
            <span
              key={i}
              className="love-pop__heart"
              style={{ "--dx": `${hx}px`, "--dy": `${hy}px`, "--d": `${hd}s` }}
            >
              ♥
            </span>
          ))}
        </div>
      )}
    </>
  );
}
