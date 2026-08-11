// Redimensionne/recompresse en place les images de src/assets (photos issues
// d'appareil photo à 4000-6000px / 10-20 Mo → web-ready, ~200-400 Ko).
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = [
  { dir: "src/assets/travaux/photos", maxDim: 2200 },
  { dir: "src/assets/travaux/sculptures", maxDim: 2200 },
  { dir: "src/assets/travaux/graphiques", maxDim: 2200 },
  // Pictogrammes de nav : affichés à ~42px, une photo brute n'a jamais besoin
  // d'être plus grande que ça même en retina.
  { dir: "src/assets/pictograms", maxDim: 400 },
];
const JPEG_QUALITY = 82;
const PNG_QUALITY = 82;

function walk(dir) {
  return readdirSync(dir).map((f) => join(dir, f)).filter((p) => statSync(p).isFile());
}

async function optimize(path, maxDim) {
  const ext = extname(path).toLowerCase();
  const before = statSync(path).size;
  const img = sharp(path);
  const meta = await img.metadata();
  const needsResize = (meta.width || 0) > maxDim || (meta.height || 0) > maxDim;
  let pipeline = needsResize
    ? img.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    : img;

  let buffer;
  if (ext === ".png") {
    buffer = await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
  } else {
    buffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  }

  if (buffer.length < before) {
    await sharp(buffer).toFile(path + ".tmp");
    const { renameSync } = await import("node:fs");
    renameSync(path + ".tmp", path);
    return { before, after: buffer.length };
  }
  return { before, after: before };
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const { dir, maxDim } of ROOTS) {
  for (const file of walk(dir)) {
    const { before, after } = await optimize(file, maxDim);
    totalBefore += before;
    totalAfter += after;
    count++;
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`Optimisé ${count} images : ${mb(totalBefore)} Mo -> ${mb(totalAfter)} Mo`);
