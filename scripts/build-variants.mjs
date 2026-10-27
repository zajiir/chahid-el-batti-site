// Génère, pour chaque image de public/travaux/<catégorie>/, deux versions web
// légères : une vignette pour la galerie (_thumbs) et une grande version pour
// le plein écran (_large), en WebP. Lancé automatiquement avant `dev` et
// `build` : les images ajoutées depuis le CMS (parfois des photos de
// téléphone de plusieurs Mo) sont donc toujours servies allégées.
// Écrit aussi les dimensions de chaque image dans src/generated/ pour que la
// galerie réserve la bonne place avant chargement (pas de saut de mise en page).
// Si sharp est indisponible, le site retombe sur les images d'origine.
import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "public/travaux";
const DIMS_OUT = "src/generated/travaux-dims.json";
const CATS = ["photos", "sculptures", "graphiques"];
const VARIANTS = [
  { dir: "_thumbs", height: 1000, quality: 72 },
  { dir: "_large", height: 2000, quality: 80 },
];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff"]);

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[variants] sharp indisponible — images d'origine utilisées telles quelles.");
  process.exit(0);
}

let made = 0;
let skipped = 0;
const dims = {};
for (const cat of CATS) {
  const dir = join(ROOT, cat);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!IMAGE_EXT.has(extname(file).toLowerCase())) continue;
    const src = join(dir, file);
    const srcTime = statSync(src).mtimeMs;
    const stem = file.slice(0, -extname(file).length);

    try {
      const meta = await sharp(src).metadata();
      // Orientations EXIF 5 à 8 = image tournée de 90° : largeur et hauteur s'inversent.
      const turned = (meta.orientation || 1) >= 5;
      dims[`/travaux/${cat}/${file}`] = turned ? [meta.height, meta.width] : [meta.width, meta.height];
    } catch {
      // Image illisible : la galerie lui réservera une largeur par défaut.
    }

    for (const v of VARIANTS) {
      const outDir = join(ROOT, v.dir, cat);
      const out = join(outDir, `${stem}.webp`);
      if (existsSync(out) && statSync(out).mtimeMs >= srcTime) {
        skipped++;
        continue;
      }
      mkdirSync(outDir, { recursive: true });
      try {
        await sharp(src)
          .rotate()
          .resize({ height: v.height, width: v.height, fit: "inside", withoutEnlargement: true })
          .webp({ quality: v.quality })
          .toFile(out);
        made++;
      } catch (err) {
        console.warn(`[variants] ${src} ignorée : ${err.message}`);
      }
    }
  }
}
mkdirSync("src/generated", { recursive: true });
writeFileSync(DIMS_OUT, JSON.stringify(dims));
console.log(`[variants] ${made} générées, ${skipped} déjà à jour.`);
