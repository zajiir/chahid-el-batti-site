import { useEffect, useRef } from "react";
import { useLang } from "../lib/i18n";

// Marque de l'artiste (étoile + figure) — mêmes tracés que l'icône Accueil de
// la nav, recadrés sur leur boîte englobante réelle. Réutilisés ici pour que
// l'emblème au centre de la sphère soit rigoureusement identique au pictogramme.
const LOGO_PATHS = [
  "M737.28,929.61c-.7,2.85-2.28,9.48-4.96,10.35-6.38,2.09-10.01-3.75-10.31-9.04-.35-6.1-3.65-10.94-5.03-16.83l-2.7-11.46-4.06-35.38-7.41-55.82-3.12-26.04-2.18-12.98c-.86-5.16-.26-14.3-6.47-17l-36.36-2.33-26.66-9.69c-5.06-1.84-9.32-5.53-13.52-8.29-8.52-5.61-14.07-12.32-19.55-20.73l-7.49-11.51c-5.78-8.87-11.64-17.41-14.91-27.61-6.52-14.03-12.2-27.84-16-42.84l2.14-4.61c.51-1.1,3.73-.52,4.86.37l53.2,41.36,15.82,12.95,12.73,10.41,19.42,15.19c2.92,2.29,6.33-3.21,7.74-5.46l13.2-21.24c6.13-9.86,15.33-18.78,23.57-26.67l9.18-8.79,9.04-8.65-13.63-10.08c-4.98-3.68-11.55-6.58-15.62-11.43l-10.77-12.84c-5.62-6.7-9.01-15.73-13.49-23.43l-4.49-7.71-21.92-32.03,23.75-1.96,13.82,14.22c10.08,10.37,19.19,22.19,31.61,29.83l27.09,16.67,8,4.55c2.08,1.18,6.81,3.46,7.81,5.54,4.56,9.47,12.51,14.07,21.87,16.56l19.7,5.25,20.79,5.04c6.87,1.67,15.12,2.44,20.46,6.7l13.13,10.46,20.53,19,17.05,15.84c10.09,9.37,21.85,16.89,35.37,20.56l29.06,7.9c1.42.38,4.64,2.89,4.02,4.14s-3.39,4.11-4.77,4.24l-11.79,1.13-19.36.62-28.81.64c-5.16-3.57-10.4-4.63-16.05-4.64l-17.04-10.72c-19.07-12.41-38.77-22.53-59.38-32.39-4.4-2.1-7.09-2.97-11.11.87l-34.22,32.72c-3.74,3.57-9.26,6.95-11.48,11.3-4.94,9.67-3.7,19.66-.87,29.53.73,10.98,2.9,21.54,5.91,32.16l1.65,44.31c.33,8.88-1.77,18.26-2.06,27.32-.33,10.11-.48,20.47-3.25,30.21l-9.25,32.52-2.4,9.75Z",
  "M624.48,596.82l-2.32,12.37c-1.43,7.61-2.45,14.4-5.76,22.05-.91-6.9-1.18-13.8-.49-20.77l1.37-13.9,1.67-19.08,2.77-25.94,1.17-16.54.87-25.22-19.14-4.14-9.94-1.06-11.43-.57-14.49,1.03c3.54-4.03,7.09-4.02,11.54-5.67l32.71-12.14,11.32-4.51c2.44-5.82,4.1-13.18,4.03-20.05l-.11-9.63-1.72-14.91c-.94-8.19-5.6-12.96-5.2-13.39l2.35-2.51c.55-.58,1.96,2.5,1.95,3.26l31.81,48.24,33.31-4.82,14.92-3.08,24.68-4.09c1.69-.73,3.79-.26,1.79,1.15l-27.67,11.16c-8.62,3.48-16.8,8.81-23.98,14.67-8.01,6.54-7.54,16.69-1.24,23.87,16.84,19.24,61.96,35.74,88.96,43.71,5.55,1.64,10.55,3.67,14.97,7.18l-14.68-3.21-27.63-8.33-24.2-8.1-46.09-18.41c-4.27-1.7-9.2-4.31-13.77-2.98-10.2,2.97-15.66,10.88-20.39,19.62-5.08,9.39-5.93,19.8-7.76,30.46l-4.16,24.29Z",
  "M490.95,607.82c-5.22-.44-12.24,2.81-16.14,6.55-12.98,12.45-26.78,21.74-43.12,29.6-2.74,1.32-3.85,3.46-4.4,6.53-1.39-1.09-2.44-2.37-3.39-2.25l-6.33.77,51.4-36.49c2.69-1.91,6.26-7.86,8.14-10.57,8.65-12.5-5.57-36.79-18.89-48.92l-15.02-13.67-2.71-2.19c-.61-.5,1.43-2.72,2.05-2.22l2.77,2.22c8.83,7.07,19.05,12.9,26.02,21.79l16.95,21.6c1.09,1.39,3.62,4.01,5.07,3.55l6.6-2.08c8.16-2.57,16.03-5,23.55-9.31l28.35-16.28,1.2,1.51-24.6,17.13c-6.84,4.76-12.5,9.75-18.05,16.13-4.43,5.1-5.84,10.45-1.86,17.27,10.49,17.99,25.56,32.01,40.02,48.66-18.3-6.09-29.87-20.86-39.61-35.85-4.19-6.44-9.11-12.72-17.98-13.47Z",
  "M809.36,598.81l-1.77,10.58-17.55,5.14c-10.51,3.08-15.9-5.9-18.56-13.36-2.97-8.36-3.14-13.46,1.52-21.31,1.39-2.34,3.05-6.91,5.24-8.02,2.91-1.49,8.51-1.13,11.67-.68l10.83,1.53c4.56.64,11.61,1.69,14.2,5.92l-5.59,20.22Z",
  "M554.07,508.21c-12.52,3.64-24.41,7.8-39.26,10.4,7.76-4.77,16.81-6.89,26.2-9.35,4.01-1.05,7.49-1.64,13.06-1.05Z",
];

const WIRE_COLOR = "#3f00ff"; // var(--blue)
const WIRE_OPACITY = 0.8;
const LOGO_COLOR = "#0b0a14"; // var(--ink)
const IDLE_SPEED_Y = 0.32; // rad/s
const IDLE_SPEED_X = 0.05; // rad/s (léger tangage)
const DRAG_SENSITIVITY = 0.012;
const FRICTION = 1.6; // décroissance exponentielle de la vitesse après relâchement
const CLICK_MOVE_THRESHOLD = 6; // px — au-delà, on considère que c'est un drag, pas un clic
const MAX_FLICK = 14;

// Caméra : perspective 45°, placée à 2.7 du centre d'une sphère de rayon 1.
const CAMERA_Z = 2.7;
const TAN_HALF_FOV = Math.tan((45 / 2) * (Math.PI / 180));

// Rendu en Canvas 2D (pas de WebGL ni de bibliothèque 3D) : quelques centaines
// de segments projetés à la main suffisent, et le splash s'affiche aussitôt.

// --- Sphère : icosaèdre subdivisé (4 segments par arête), projeté sur la sphère ---
function buildWireframe(subdiv = 4) {
  const t = (1 + Math.sqrt(5)) / 2;
  const base = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const vertices = [];
  const index = new Map();
  const edges = new Set();
  const lerp = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k);

  function vertexId(p) {
    const len = Math.hypot(p[0], p[1], p[2]);
    const v = p.map((c) => c / len);
    const key = v.map((c) => c.toFixed(5)).join(",");
    if (!index.has(key)) {
      index.set(key, vertices.length);
      vertices.push(v);
    }
    return index.get(key);
  }
  function addEdge(a, b) {
    edges.add(a < b ? `${a},${b}` : `${b},${a}`);
  }

  for (const [ia, ib, ic] of faces) {
    const [a, b, c] = [base[ia], base[ib], base[ic]];
    // grid[i][j] : i pas vers c, j pas de a vers b le long de la rangée i.
    const grid = [];
    for (let i = 0; i <= subdiv; i++) {
      const left = lerp(a, c, i / subdiv);
      const right = lerp(b, c, i / subdiv);
      const row = [];
      const n = subdiv - i;
      for (let j = 0; j <= n; j++) row.push(vertexId(n === 0 ? left : lerp(left, right, j / n)));
      grid.push(row);
    }
    for (let i = 0; i < subdiv; i++) {
      for (let j = 0; j < grid[i].length - 1; j++) {
        addEdge(grid[i][j], grid[i][j + 1]);
        addEdge(grid[i][j], grid[i + 1][j]);
        addEdge(grid[i][j + 1], grid[i + 1][j]);
      }
    }
  }
  return {
    vertices,
    edges: Array.from(edges, (e) => e.split(",").map(Number)),
  };
}

// --- Logo : tracés SVG aplatis en polygones, centrés dans le plan z = 0 ---
function flattenPath(d, samples = 8) {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g);
  const pts = [];
  let i = 0;
  let cmd = null;
  let x = 0;
  let y = 0;
  let lastCtrl = null;
  const num = () => parseFloat(tokens[i++]);
  function cubic(x1, y1, x2, y2, x3, y3) {
    for (let s = 1; s <= samples; s++) {
      const t = s / samples;
      const u = 1 - t;
      pts.push([
        u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
      ]);
    }
    lastCtrl = [x2, y2];
    x = x3;
    y = y3;
  }
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case "M":
        x = num();
        y = num();
        pts.push([x, y]);
        cmd = "L";
        break;
      case "l":
        x += num();
        y += num();
        pts.push([x, y]);
        lastCtrl = null;
        break;
      case "L":
        x = num();
        y = num();
        pts.push([x, y]);
        lastCtrl = null;
        break;
      case "c": {
        const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()];
        cubic(x + x1, y + y1, x + x2, y + y2, x + x3, y + y3);
        break;
      }
      case "s": {
        const [x2, y2, x3, y3] = [num(), num(), num(), num()];
        const [x1, y1] = lastCtrl ? [2 * x - lastCtrl[0], 2 * y - lastCtrl[1]] : [x, y];
        cubic(x1, y1, x + x2, y + y2, x + x3, y + y3);
        break;
      }
      case "Z":
      case "z":
        i = tokens.length;
        break;
      default:
        i++; // commande non utilisée par ces tracés
    }
  }
  return pts;
}

function buildLogo() {
  const polys = LOGO_PATHS.map((d) => flattenPath(d));
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of polys.flat()) {
    minX = Math.min(minX, p[0]);
    maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const targetDiameter = 1.62; // légèrement inférieur au diamètre de la sphère (2)
  const scale = targetDiameter / Math.max(maxX - minX, maxY - minY);
  // SVG (y vers le bas) -> repère 3D (y vers le haut)
  return polys.map((poly) => poly.map(([px, py]) => [(px - cx) * scale, -(py - cy) * scale]));
}

export default function SplashSphere({ size = 150, onEnter }) {
  const hostRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const wire = buildWireframe();
    const logo = buildLogo();
    const projected = wire.vertices.map(() => [0, 0, 0]);
    const half = size / 2;

    // Rotation (ordre X puis Y, comme l'Euler "XYZ" de three.js) + projection.
    let rotX = 0;
    let rotY = 0;
    let m = null;
    function updateMatrix() {
      const ca = Math.cos(rotX);
      const sa = Math.sin(rotX);
      const cb = Math.cos(rotY);
      const sb = Math.sin(rotY);
      m = [cb, 0, sb, sa * sb, ca, -sa * cb, -ca * sb, sa, ca * cb];
    }
    function project(x, y, z, out) {
      const wx = m[0] * x + m[1] * y + m[2] * z;
      const wy = m[3] * x + m[4] * y + m[5] * z;
      const wz = m[6] * x + m[7] * y + m[8] * z;
      const k = half / ((CAMERA_Z - wz) * TAN_HALF_FOV);
      out[0] = half + wx * k;
      out[1] = half - wy * k;
      out[2] = wz;
      return out;
    }

    const tmp = [0, 0, 0];
    function draw() {
      updateMatrix();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      wire.vertices.forEach((v, i) => project(v[0], v[1], v[2], projected[i]));

      // Le logo est un plan passant par le centre : les arêtes situées du
      // même côté que la caméra passent devant lui, les autres derrière.
      const n = [m[2], m[5], m[8]]; // normale du plan du logo (axe z local)
      const cameraSide = Math.sign(n[2] * CAMERA_Z) || 1;
      const back = new Path2D();
      const front = new Path2D();
      for (const [a, b] of wire.edges) {
        const va = wire.vertices[a];
        const vb = wire.vertices[b];
        const mx = va[0] + vb[0];
        const my = va[1] + vb[1];
        const mz = va[2] + vb[2];
        const wx = m[0] * mx + m[1] * my + m[2] * mz;
        const wy = m[3] * mx + m[4] * my + m[5] * mz;
        const wz = m[6] * mx + m[7] * my + m[8] * mz;
        const side = n[0] * wx + n[1] * wy + n[2] * wz;
        const path = Math.sign(side) === cameraSide ? front : back;
        path.moveTo(projected[a][0], projected[a][1]);
        path.lineTo(projected[b][0], projected[b][1]);
      }

      ctx.lineWidth = 1.15 / dpr;
      ctx.strokeStyle = WIRE_COLOR;
      ctx.globalAlpha = WIRE_OPACITY;
      ctx.stroke(back);

      ctx.globalAlpha = 1;
      ctx.fillStyle = LOGO_COLOR;
      for (const poly of logo) {
        ctx.beginPath();
        poly.forEach(([x, y], i) => {
          project(x, y, 0, tmp);
          if (i === 0) ctx.moveTo(tmp[0], tmp[1]);
          else ctx.lineTo(tmp[0], tmp[1]);
        });
        ctx.closePath();
        ctx.fill();
      }

      ctx.globalAlpha = WIRE_OPACITY;
      ctx.stroke(front);
      ctx.globalAlpha = 1;
    }

    // --- État d'interaction : rotation idle + inertie du drag ---
    let angularVelY = IDLE_SPEED_Y;
    let angularVelX = IDLE_SPEED_X;
    let dragging = false;
    let dragMoved = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let flickVelX = 0;
    let flickVelY = 0;
    let pointerId = null;

    function onPointerDown(e) {
      dragging = true;
      dragMoved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      flickVelX = 0;
      flickVelY = 0;
      pointerId = e.pointerId;
      host.setPointerCapture(pointerId);
      host.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(now - lastT, 1) / 1000;

      if (!dragMoved && Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD) {
        dragMoved = true;
      }
      // Le mouvement horizontal tourne autour de Y, le vertical autour de X.
      rotY += dx * DRAG_SENSITIVITY;
      rotX += dy * DRAG_SENSITIVITY;

      flickVelY = (dx * DRAG_SENSITIVITY) / dt;
      flickVelX = (dy * DRAG_SENSITIVITY) / dt;

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      host.style.cursor = "grab";
      if (pointerId !== null && host.hasPointerCapture?.(pointerId)) {
        host.releasePointerCapture(pointerId);
      }
      if (dragMoved) {
        // Conserve l'élan du dernier geste, plafonné pour rester lisible.
        angularVelY = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, flickVelY));
        angularVelX = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, flickVelX));
      } else if (typeof onEnter === "function") {
        onEnter();
      }
    }

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);

    let raf = 0;
    let prevT = performance.now();

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevT) / 1000, 0.05);
      prevT = now;

      if (!dragging) {
        rotY += angularVelY * dt;
        rotX += angularVelX * dt;
        // La vitesse décroît vers la rotation idle (jamais vers zéro complet).
        const decay = Math.exp(-FRICTION * dt);
        angularVelY = IDLE_SPEED_Y + (angularVelY - IDLE_SPEED_Y) * decay;
        angularVelX = IDLE_SPEED_X + (angularVelX - IDLE_SPEED_X) * decay;
      }

      draw();
    }
    draw();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointercancel", endDrag);
      host.removeChild(canvas);
    };
  }, [size, onEnter]);

  return (
    <div
      ref={hostRef}
      className="splash-sphere"
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label={t("splash.enter")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}
