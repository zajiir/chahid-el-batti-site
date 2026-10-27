// --- Maquette 3D de l'avion (repère local : x vers l'avant, y aile droite,
// z vers le haut ; longueur et envergure ≈ 1). Rendu en Canvas 2D, faces
// triées de la plus lointaine à la plus proche, éclairage plat.
const V = {
  nose: [0.52, 0, 0],
  t1: [0.3, 0, 0.08], r1: [0.3, 0.09, 0], b1: [0.3, 0, -0.07], l1: [0.3, -0.09, 0],
  t2: [-0.34, 0, 0.06], r2: [-0.34, 0.06, 0], b2: [-0.34, 0, -0.05], l2: [-0.34, -0.06, 0],
  tail: [-0.5, 0, 0.025],
  wrf: [0.13, 0.08, 0], wrb: [-0.09, 0.07, 0], wrtb: [-0.21, 0.5, 0.03], wrtf: [-0.12, 0.5, 0.03],
  wlf: [0.13, -0.08, 0], wlb: [-0.09, -0.07, 0], wltb: [-0.21, -0.5, 0.03], wltf: [-0.12, -0.5, 0.03],
  srf: [-0.36, 0.04, 0.01], srb: [-0.48, 0.03, 0.01], srtb: [-0.53, 0.2, 0.02], srtf: [-0.46, 0.2, 0.02],
  slf: [-0.36, -0.04, 0.01], slb: [-0.48, -0.03, 0.01], sltb: [-0.53, -0.2, 0.02], sltf: [-0.46, -0.2, 0.02],
  ff: [-0.33, 0, 0.05], fb: [-0.5, 0, 0.03], ftb: [-0.55, 0, 0.21], ftf: [-0.47, 0, 0.21],
};
const FACES = [
  ["nose", "t1", "r1"], ["nose", "r1", "b1"], ["nose", "b1", "l1"], ["nose", "l1", "t1"],
  ["t1", "t2", "r2", "r1"], ["r1", "r2", "b2", "b1"], ["b1", "b2", "l2", "l1"], ["l1", "l2", "t2", "t1"],
  ["t2", "tail", "r2"], ["r2", "tail", "b2"], ["b2", "tail", "l2"], ["l2", "tail", "t2"],
  ["wrf", "wrb", "wrtb", "wrtf"], ["wlf", "wlb", "wltb", "wltf"],
  ["srf", "srb", "srtb", "srtf"], ["slf", "slb", "sltb", "sltf"],
  ["ff", "fb", "ftb", "ftf"],
].map((names) => names.map((n) => V[n]));
const LIGHT = normalize([-0.35, -0.55, 0.76]);

export function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// Écran : x à droite, y vers le bas, z vers le spectateur. `forward` = sens
// du vol, `bank` = roulis (positif : aile droite qui plonge).
export function drawPlane(ctx, px, forward, bank) {
  const f = forward;
  // Le dessus de l'avion regarde le spectateur, sauf quand il fonce vers lui.
  let up = [-f[0] * f[2], -f[1] * f[2], 1 - f[2] * f[2]];
  if (Math.hypot(up[0], up[1], up[2]) < 1e-3) up = [0, -1, 0];
  up = normalize(up);
  const right0 = cross(up, f);
  const cb = Math.cos(bank);
  const sb = Math.sin(bank);
  const u = [0, 1, 2].map((i) => up[i] * cb + right0[i] * sb);
  const r = [0, 1, 2].map((i) => right0[i] * cb - up[i] * sb);
  const toWorld = ([x, y, z]) => [
    x * f[0] + y * r[0] + z * u[0],
    x * f[1] + y * r[1] + z * u[1],
    x * f[2] + y * r[2] + z * u[2],
  ];

  const faces = FACES.map((face) => {
    const pts = face.map(toWorld);
    const n = normalize(
      cross(
        [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]],
        [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]]
      )
    );
    const light = Math.abs(n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const depth = pts.reduce((s, p) => s + p[2], 0) / pts.length;
    return { pts, light, depth };
  }).sort((a, b) => a.depth - b.depth);

  const c = px / 2;
  const s = px * 0.9;
  ctx.clearRect(0, 0, px, px);
  ctx.lineJoin = "round";
  ctx.lineWidth = px * 0.012;
  for (const { pts, light } of faces) {
    const color = `hsl(255, 100%, ${Math.round(24 + light * 42)}%)`;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(c + x * s, c + y * s) : ctx.moveTo(c + x * s, c + y * s)));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color; // referme les jointures entre faces voisines
    ctx.fill();
    ctx.stroke();
  }
}
