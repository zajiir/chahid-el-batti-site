// Bulle filaire en 3D + le logo de l'artiste (son SVG tel quel) : le personnage,
// percé de l'étoile de son torse, et ses deux étoiles qui tournent autour de lui.
// Rendu en Canvas 2D, sans WebGL ni bibliothèque 3D.
import { LOGO } from "./logoShape";

const WIRE_COLOR = "#3f00ff"; // var(--blue)
const WIRE_OPACITY = 0.8;
const WIRE_FADE = 0.6; // part des arêtes de l'avant effacée là où elles passent sur le dessin

// Caméra : perspective 45°, placée à 2.7 du centre d'une bulle de rayon 1.
const CAMERA_Z = 2.7;
const TAN_HALF_FOV = Math.tan((45 / 2) * (Math.PI / 180));

// --- Bulle : icosaèdre subdivisé, projeté sur la sphère ---
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

// --- Le logo dans la bulle ---------------------------------------------------
// Le dessin reste à plat et tel quel (tracés SVG de l'artiste). L'étoile évidée
// du torse est au centre de la bulle : c'est par là que l'avion passe. Les deux
// étoiles partent de leur place dans le dessin et tournent autour de sa tête,
// sur un anneau un peu incliné : elles passent devant lui puis derrière.
const SCALE = 0.00244; // unités de la bulle par px du SVG : tout tient dans la bulle
const ORBIT_SPEED = 0.6; // rad/s
const ORBIT_TILT = 0.38; // rad : inclinaison de l'anneau vers la caméra
const STAR_SPIN = [0.5, -0.65]; // rad/s : chaque étoile pivote aussi sur elle-même
const HALO = 6; // px du SVG : liseré vide autour de chaque forme, pour les détacher

// Petites matrices 3×3 (lignes) : rotations autour de x, y.
const rotX = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
function mul(a, b) {
  const m = new Array(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      m[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return m;
}
const apply = (m, [x, y, z]) => [
  m[0] * x + m[1] * y + m[2] * z,
  m[3] * x + m[4] * y + m[5] * z,
  m[6] * x + m[7] * y + m[8] * z,
];

// SVG (y vers le bas) -> repère de la bulle (y vers le haut), origine sur l'étoile du torse.
const [HOLE_X, HOLE_Y] = LOGO.holeCenter;
const toBubble = ([x, y]) => [(x - HOLE_X) * SCALE, -(y - HOLE_Y) * SCALE];

// Anneau des étoiles : centré entre elles, passant par leurs deux places dessinées.
const [S1, S2] = LOGO.starCenters.map(toBubble);
const RING = (() => {
  const dx = S2[0] - S1[0];
  const dy = S2[1] - S1[1];
  const length = Math.hypot(dx, dy);
  return { center: [(S1[0] + S2[0]) / 2, (S1[1] + S2[1]) / 2], radius: length / 2, axis: [dx / length, dy / length] };
})();
const STAR_PHASE = [Math.PI, 0]; // l'étoile de gauche, celle de droite

// Position de chaque étoile à l'instant t ; z > 0 : devant le personnage.
function starPosition(i, t) {
  const a = ORBIT_SPEED * t + STAR_PHASE[i];
  const { center, radius, axis } = RING;
  const c = Math.cos(a) * radius;
  const s = Math.sin(a) * radius;
  return [center[0] + c * axis[0], center[1] + c * axis[1] - s * Math.sin(ORBIT_TILT), s * Math.cos(ORBIT_TILT)];
}

let pathsCache = null;
function logoPaths() {
  if (!pathsCache) {
    const figure = new Path2D();
    figure.addPath(new Path2D(LOGO.body));
    figure.addPath(new Path2D(LOGO.head));
    pathsCache = { figure, stars: LOGO.stars.map((points) => new Path2D(`M${points}Z`)) };
  }
  return pathsCache;
}

// --- Rendu --------------------------------------------------------------

const wireCache = new Map();

// Prépare un canvas de `size` px CSS et renvoie draw(rotX, rotY, t) :
// rotX / rotY orientent la bulle, t (secondes) anime le personnage et les étoiles.
// subdiv : finesse du maillage de la bulle (4 pour le splash, 2 pour une icône).
export function createSphereRenderer(canvas, size, { subdiv = 4 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  const ctx = canvas.getContext("2d");

  if (!wireCache.has(subdiv)) wireCache.set(subdiv, buildWireframe(subdiv));
  const wire = wireCache.get(subdiv);
  const paths = logoPaths();
  const half = size / 2;
  const pxPerUnit = (z) => half / ((CAMERA_Z - z) * TAN_HALF_FOV);
  const project = ([x, y, z]) => {
    const k = pxPerUnit(z);
    return [half + x * k, half - y * k];
  };

  // Une forme du SVG, dans le repère déjà posé : d'abord un liseré effacé
  // autour d'elle (ce qui est derrière s'écarte), puis le remplissage et le
  // contour de 5 px du fichier.
  function drawPiece(path) {
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = LOGO.stroke + 2 * HALO;
    ctx.stroke(path);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = LOGO.color;
    ctx.strokeStyle = LOGO.color;
    ctx.fill(path);
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.lineWidth = LOGO.stroke;
    ctx.stroke(path);
  }

  // Repère du personnage (coordonnées SVG) : à peine penché en avant et en
  // arrière, comme s'il courait ; l'étoile du torse reste au centre.
  function placeFigure(g, t) {
    const k = pxPerUnit(0) * SCALE;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(half, half - 0.012 * Math.sin(t * 3.2) * pxPerUnit(0));
    g.rotate(0.035 * Math.sin(t * 1.6));
    g.scale(k * Math.cos(0.2 * Math.sin(t * 0.45)), k);
    g.translate(-HOLE_X, -HOLE_Y);
  }

  // Repère d'une étoile : sur son anneau, pivotant sur elle-même.
  function placeStar(g, { i, position }, t) {
    const [sx, sy] = project(position);
    const [cx, cy] = LOGO.starCenters[i];
    const k = pxPerUnit(position[2]) * SCALE;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(sx, sy);
    g.rotate(STAR_SPIN[i] * t);
    g.scale(k, k);
    g.translate(-cx, -cy);
  }

  // Calque des arêtes de l'avant : elles s'estompent là où elles croisent le dessin.
  const veil = document.createElement("canvas");
  veil.width = canvas.width;
  veil.height = canvas.height;
  const vctx = veil.getContext("2d");

  function draw(bubbleX, bubbleY, t = 0) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Bulle : arêtes de l'arrière avant le dessin, celles de l'avant après.
    const bm = mul(rotX(bubbleX), rotY(bubbleY));
    const wv = wire.vertices.map((v) => apply(bm, v));
    const back = new Path2D();
    const front = new Path2D();
    for (const [a, b] of wire.edges) {
      const path = wv[a][2] + wv[b][2] > 0 ? front : back;
      const [ax, ay] = project(wv[a]);
      const [bx, by] = project(wv[b]);
      path.moveTo(ax, ay);
      path.lineTo(bx, by);
    }
    ctx.lineWidth = 1.15 / dpr;
    ctx.strokeStyle = WIRE_COLOR;
    ctx.globalAlpha = WIRE_OPACITY;
    ctx.stroke(back);
    ctx.globalAlpha = 1;

    // Les étoiles derrière lui, le personnage, puis celles devant.
    const stars = LOGO.stars.map((_, i) => ({ i, position: starPosition(i, t) }));
    const behind = stars.filter((s) => s.position[2] < 0);
    const before = stars.filter((s) => s.position[2] >= 0);
    for (const s of behind) {
      placeStar(ctx, s, t);
      drawPiece(paths.stars[s.i]);
    }
    placeFigure(ctx, t);
    drawPiece(paths.figure);
    for (const s of before) {
      placeStar(ctx, s, t);
      drawPiece(paths.stars[s.i]);
    }

    vctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vctx.clearRect(0, 0, size, size);
    vctx.lineWidth = 1.15 / dpr;
    vctx.strokeStyle = WIRE_COLOR;
    vctx.globalAlpha = WIRE_OPACITY;
    vctx.stroke(front);
    vctx.globalCompositeOperation = "destination-out";
    vctx.globalAlpha = WIRE_FADE;
    placeFigure(vctx, t);
    vctx.fill(paths.figure);
    for (const s of stars) {
      placeStar(vctx, s, t);
      vctx.fill(paths.stars[s.i]);
    }
    vctx.globalCompositeOperation = "source-over";
    vctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(veil, 0, 0);
  }

  return { draw };
}
