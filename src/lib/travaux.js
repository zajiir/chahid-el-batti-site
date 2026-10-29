// Une fiche JSON par image dans src/content/travaux/<catégorie>/ — éditées
// depuis le CMS (image, légende, ordre). Les fichiers image eux-mêmes vivent
// dans public/travaux/<catégorie>/, avec leurs versions allégées générées au
// build par scripts/build-variants.mjs.
const entries = import.meta.glob("../content/travaux/*/*.json", {
  eager: true,
  import: "default",
});
// Fichier généré (absent tant que le script n'a pas tourné : glob renvoie {}).
const dimsModule = import.meta.glob("../generated/travaux-dims.json", {
  eager: true,
  import: "default",
});
const DIMS = Object.values(dimsModule)[0] || {};

// Libellés traduits dans src/lib/i18n.jsx ("works.cat.<id>"). Dans l'ordre
// d'affichage : la pratique principale (forge, installations) d'abord.
export const CATEGORIES = ["sculptures", "graphiques", "photos"];

// "/travaux/sculptures/3.jpg" -> "/travaux/_thumbs/sculptures/3.webp"
function variant(image, kind) {
  const m = image.match(/^\/travaux\/([^/]+)\/(.+)\.[^.]+$/);
  return m ? encodeURI(`/travaux/${kind}/${m[1]}/${m[2]}.webp`) : encodeURI(image);
}

// title_en / meta_en : versions anglaises (CMS). Le titre original de l'œuvre
// est gardé tant que title_en est vide.
function caption(e) {
  if (!e.title) return null;
  const join = (...parts) => parts.filter(Boolean).join(" — ");
  return {
    title: e.title,
    title_en: e.title_en,
    meta: join(e.medium, e.details, e.year),
    meta_en: join(e.medium_en || e.medium, e.details_en || e.details, e.year),
  };
}

const byCategory = {};
for (const [path, e] of Object.entries(entries)) {
  if (!e?.image) continue;
  const parts = path.split("/");
  const cat = parts[parts.length - 2];
  const [width, height] = DIMS[e.image] || [];
  (byCategory[cat] ||= []).push({
    key: path,
    // Nom de la fiche, repris dans l'adresse de l'œuvre : #/travaux/<cat>/<slug>
    slug: parts[parts.length - 1].replace(/\.json$/, ""),
    original: encodeURI(e.image),
    thumb: variant(e.image, "_thumbs"),
    large: variant(e.image, "_large"),
    width,
    height,
    caption: caption(e),
    entry: e,
    order: Number.isFinite(e.ordre) ? e.ordre : Infinity,
  });
}
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

// "Ça C'eST mAaa FUSÉE..." -> "ca-c-est-maaa-fusee"
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Les images d'une catégorie regroupées par œuvre (même titre) : une œuvre =
// son titre, sa fiche (année, technique, dimensions) et toutes ses vues.
// Les images sans titre restent chacune une œuvre à part ("Sans titre").
// Ordre des œuvres = plus petit "ordre" parmi leurs images.
const objectsByCategory = {};
for (const [cat, images] of Object.entries(byCategory)) {
  const groups = new Map();
  for (const img of images) {
    const title = (img.entry.title || "").trim();
    const key = title || `untitled:${img.slug}`;
    if (!groups.has(key)) groups.set(key, { title, images: [] });
    groups.get(key).images.push(img);
  }
  const used = new Set();
  objectsByCategory[cat] = [...groups.values()].map(({ title, images: imgs }) => {
    // Fiche de l'œuvre : premier champ renseigné parmi ses images.
    const field = (name) => imgs.map((i) => (i.entry[name] || "").trim()).find(Boolean) || "";
    let id = slugify(title) || imgs[0].slug;
    while (used.has(id)) id += "-2";
    used.add(id);
    return {
      id,
      title,
      title_en: field("title_en"),
      year: field("year"),
      medium: field("medium"),
      medium_en: field("medium_en"),
      details: field("details"),
      details_en: field("details_en"),
      images: imgs,
      order: imgs[0].order,
    };
  });
}

export function getObjects(categoryId) {
  return objectsByCategory[categoryId] || [];
}
