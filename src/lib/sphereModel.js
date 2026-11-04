// Bulle filaire + personnage en 3D (d'après le dessin de l'artiste) qui court
// après des étoiles. Rendu en Canvas 2D, sans WebGL ni bibliothèque 3D : les
// faces sont projetées à la main et dessinées de la plus lointaine à la plus
// proche.

const WIRE_COLOR = "#3f00ff"; // var(--blue)
const WIRE_OPACITY = 0.8;

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

// --- Le personnage (d'après le dessin de l'artiste) -----------------------
// Repère du personnage : x à droite, y en haut, z vers le spectateur ; unité =
// rayon de la bulle. Torse au centre, percé d'une étoile (l'avion la traverse),
// quatre membres effilés à arête centrale (le pli dessiné le long de chaque
// membre), tête facettée entre les deux bras.

const DEG = Math.PI / 180;
const TORSO_R = 0.2;
const HOLE_OUT = 0.13; // étoile évidée au centre du torse
const HOLE_IN = 0.05;
const TORSO_TH = 0.05;

// [angle de base, longueur, côté de la courbure, phase de course]
// A et B (de part et d'autre de la tête) sont les bras, C et D les jambes.
const LIMBS = [
  { angle: 106 * DEG, length: 0.6, bend: -1, phase: 0 }, // A : bras levé
  { angle: -10 * DEG, length: 0.62, bend: 1, phase: Math.PI }, // B : bras tendu
  { angle: 159 * DEG, length: 0.58, bend: 1, phase: Math.PI }, // C : jambe arrière
  { angle: -81 * DEG, length: 0.68, bend: -1, phase: 0 }, // D : jambe d'appui
];
const HEAD = { x: 0.17, y: 0.255, r: 0.11 };

const RUN_SPEED = 7; // rad/s : cadence de la course
const CHASE_SPEED = 0.55; // rad/s : les étoiles tournent, il les suit
const CHASE_LAG = 1.0; // rad de retard sur les étoiles

// Membre le long de +x, en forme de pétale (plus étroit à la base, large au
// premier tiers, bout arrondi), section en losange : le pli central apparaît
// grâce aux deux pans éclairés différemment, comme le trait du dessin.
function buildLimb(length, bendSide) {
  const S = 10;
  const verts = [];
  const faces = [];
  for (let i = 0; i <= S; i++) {
    const t = i / S;
    const x = TORSO_R * 0.5 + length * t;
    const yc = bendSide * Math.sin(Math.PI * t) * length * 0.07;
    const petal = Math.pow(Math.sin(Math.PI * (0.18 + 0.82 * t)), 0.6);
    const ww = Math.max(0.105 * petal, 0.003);
    const th = Math.max(0.05 * petal, 0.002);
    verts.push([x, yc + ww, 0], [x, yc, th], [x, yc - ww, 0], [x, yc, -th]);
  }
  for (let i = 0; i < S; i++) {
    for (let k = 0; k < 4; k++) {
      const a = i * 4 + k;
      const b = i * 4 + ((k + 1) % 4);
      faces.push({ idx: [a, b, b + 4, a + 4], kind: "body" });
    }
  }
  // Base fermée (cachée dans le torse) : pas besoin de face.
  return { verts, faces };
}

function starRing(points, outer, inner, z, rotation = 0) {
  const ring = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i / (points * 2)) * Math.PI * 2;
    ring.push([Math.cos(a) * r, Math.sin(a) * r, z]);
  }
  return ring;
}

// Torse : disque épais percé d'une étoile à 4 branches.
function buildTorso() {
  const N = 20;
  const verts = [];
  const outerF = [];
  const outerB = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    outerF.push(verts.length);
    verts.push([Math.cos(a) * TORSO_R, Math.sin(a) * TORSO_R, TORSO_TH]);
    outerB.push(verts.length);
    verts.push([Math.cos(a) * TORSO_R, Math.sin(a) * TORSO_R, -TORSO_TH]);
  }
  const holeF = [];
  const holeB = [];
  for (const p of starRing(4, HOLE_OUT, HOLE_IN, TORSO_TH, Math.PI / 4)) {
    holeF.push(verts.length);
    verts.push(p);
    holeB.push(verts.length);
    verts.push([p[0], p[1], -TORSO_TH]);
  }
  const faces = [
    { idx: outerF, hole: [...holeF].reverse(), kind: "body" },
    { idx: [...outerB].reverse(), hole: holeB, kind: "body" },
  ];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    faces.push({ idx: [outerF[i], outerF[j], outerB[j], outerB[i]], kind: "body" });
  }
  for (let i = 0; i < holeF.length; i++) {
    const j = (i + 1) % holeF.length;
    faces.push({ idx: [holeF[j], holeF[i], holeB[i], holeB[j]], kind: "body" });
  }
  return { verts, faces };
}

// Tête : petite sphère à facettes (icosaèdre subdivisé une fois), un peu aplatie.
function buildHead() {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let tris = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const mid = new Map();
  const midpoint = (a, b) => {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!mid.has(key)) {
      mid.set(key, verts.length);
      verts.push(verts[a].map((v, i) => (v + verts[b][i]) / 2));
    }
    return mid.get(key);
  };
  const next = [];
  for (const [a, b, c] of tris) {
    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const ca = midpoint(c, a);
    next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  }
  tris = next;
  verts = verts.map((v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [HEAD.x + (v[0] / l) * HEAD.r, HEAD.y + (v[1] / l) * HEAD.r * 1.08, (v[2] / l) * HEAD.r * 0.85];
  });
  return { verts, faces: tris.map((idx) => ({ idx, kind: "body" })) };
}

// Étoile épaisse (prisme en étoile).
function buildStar(points, outer, inner, thick) {
  const front = starRing(points, outer, inner, thick, Math.PI / 2);
  const back = front.map(([x, y]) => [x, y, -thick]);
  const n = front.length;
  const verts = [...front, ...back];
  const faces = [
    { idx: front.map((_, i) => i), kind: "star" },
    { idx: back.map((_, i) => n + i).reverse(), kind: "star" },
  ];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push({ idx: [i, j, n + j, n + i], kind: "star" });
  }
  return { verts, faces };
}

// [mesh, rayon d'orbite, phase, vitesse de rotation propre]
function buildStars() {
  return [
    { mesh: buildStar(5, 0.15, 0.065, 0.035), radius: 0.8, phase: 0, spin: 1.6 },
    { mesh: buildStar(4, 0.1, 0.038, 0.03), radius: 0.72, phase: 2.4, spin: -2.2 },
  ];
}

let figureCache = null;
function buildFigure() {
  if (!figureCache) {
    figureCache = {
      limbs: LIMBS.map((l) => ({ ...l, mesh: buildLimb(l.length, l.bend) })),
      torso: buildTorso(),
      head: buildHead(),
      stars: buildStars(),
    };
  }
  return figureCache;
}

// Petites matrices 3×3 (lignes) : rotations autour de x, y, z.
const rotX = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const rotZ = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
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

const LIGHT = (() => {
  const l = [-0.45, 0.6, 0.66];
  const n = Math.hypot(...l);
  return l.map((v) => v / n);
})();
const SHADES = {
  body: [[11, 10, 20], [96, 92, 140]], // encre → gris bleuté éclairé
  star: [[24, 8, 96], [120, 92, 255]], // étoiles bleu nuit → bleu de la marque
};

// Toutes les faces du personnage et des étoiles à l'instant t, dans le repère
// de la caméra (z vers le spectateur), prêtes à être triées et dessinées.
function figureFaces(t) {
  const fig = buildFigure();
  const out = [];
  const chase = CHASE_SPEED * t;
  // Le personnage tourne à la poursuite des étoiles, se balance un peu en 3D,
  // et rebondit au rythme de sa course.
  const body = mul(rotY(0.38 * Math.sin(t * 0.5)), mul(rotX(0.14 * Math.sin(t * 0.37)), rotZ(chase - CHASE_LAG)));
  const bob = 0.014 * Math.sin(t * RUN_SPEED * 2);
  const place = (m, offset = [0, bob, 0]) => (v) => {
    const p = apply(m, v);
    return [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]];
  };

  const pushMesh = (mesh, transform) => {
    const tv = mesh.verts.map(transform);
    for (const face of mesh.faces) {
      out.push({
        pts: face.idx.map((i) => tv[i]),
        hole: face.hole?.map((i) => tv[i]),
        kind: face.kind,
      });
    }
  };

  // Membres : balancier de course (dans le plan) + mouvement vers / loin du
  // spectateur, bras et jambes en opposition.
  for (const limb of fig.limbs) {
    const swing = Math.sin(t * RUN_SPEED + limb.phase);
    const local = mul(rotZ(limb.angle + 0.22 * swing), rotY(-0.38 * Math.cos(t * RUN_SPEED + limb.phase)));
    pushMesh(limb.mesh, place(mul(body, local)));
  }
  pushMesh(fig.torso, place(body));
  pushMesh(fig.head, place(body));

  // Étoiles : orbite inclinée (elles passent devant et derrière lui), en avance
  // sur lui, et tournent sur elles-mêmes.
  const orbitTilt = rotX(1.05);
  for (const star of fig.stars) {
    const a = chase + star.phase;
    const center = apply(orbitTilt, [Math.cos(a) * star.radius, Math.sin(a) * star.radius, 0]);
    const spin = mul(rotZ(t * star.spin), rotY(0.5 * Math.sin(t * 0.9 + star.phase)));
    pushMesh(star.mesh, place(spin, center));
  }
  return out;
}

// --- Rendu --------------------------------------------------------------

const wireCache = new Map();

function shade(kind, light) {
  const [d, l] = SHADES[kind];
  const k = Math.pow(light, 1.4);
  return `rgb(${Math.round(d[0] + (l[0] - d[0]) * k)}, ${Math.round(d[1] + (l[1] - d[1]) * k)}, ${Math.round(
    d[2] + (l[2] - d[2]) * k
  )})`;
}

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
  const half = size / 2;
  const seam = Math.max(0.6, size / 260); // referme les jointures entre faces

  const project = ([x, y, z]) => {
    const k = half / ((CAMERA_Z - z) * TAN_HALF_FOV);
    return [half + x * k, half - y * k];
  };

  function trace(points) {
    points.forEach((p, i) => {
      const [x, y] = project(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  }

  function draw(bubbleX, bubbleY, t = 0) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    // Bulle : arêtes de l'arrière avant le personnage, celles de l'avant après.
    const m = mul(rotX(bubbleX), rotY(bubbleY));
    const wv = wire.vertices.map((v) => apply(m, v));
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

    // Personnage + étoiles : faces triées de la plus lointaine à la plus proche.
    const faces = figureFaces(t);
    for (const f of faces) {
      const [a, b, c] = f.pts;
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const len = Math.hypot(n[0], n[1], n[2]) || 1;
      f.light = Math.abs((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / len);
      f.depth = f.pts.reduce((s, p) => s + p[2], 0) / f.pts.length;
    }
    faces.sort((p, q) => p.depth - q.depth);
    ctx.lineJoin = "round";
    ctx.lineWidth = seam;
    for (const f of faces) {
      const color = shade(f.kind, f.light);
      ctx.beginPath();
      trace(f.pts);
      if (f.hole) trace(f.hole);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.fill("evenodd");
      if (!f.hole) ctx.stroke();
    }

    ctx.globalAlpha = WIRE_OPACITY;
    ctx.stroke(front);
    ctx.globalAlpha = 1;
  }

  return { draw };
}
