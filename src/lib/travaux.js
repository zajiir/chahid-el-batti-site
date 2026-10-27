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

export const CATEGORIES = [
  { id: "photos", label: "Photos" },
  { id: "sculptures", label: "Sculptures / Installations" },
  { id: "graphiques", label: "Arts graphiques" },
];

// "/travaux/sculptures/3.jpg" -> "/travaux/_thumbs/sculptures/3.webp"
function variant(image, kind) {
  const m = image.match(/^\/travaux\/([^/]+)\/(.+)\.[^.]+$/);
  return m ? encodeURI(`/travaux/${kind}/${m[1]}/${m[2]}.webp`) : encodeURI(image);
}

function caption(e) {
  if (!e.title) return null;
  const meta = [e.medium, e.details, e.year].filter(Boolean).join(" — ");
  return { title: e.title, meta };
}

const byCategory = {};
for (const [path, e] of Object.entries(entries)) {
  if (!e?.image) continue;
  const parts = path.split("/");
  const cat = parts[parts.length - 2];
  const [width, height] = DIMS[e.image] || [];
  (byCategory[cat] ||= []).push({
    key: path,
    original: encodeURI(e.image),
    thumb: variant(e.image, "_thumbs"),
    large: variant(e.image, "_large"),
    width,
    height,
    caption: caption(e),
    order: Number.isFinite(e.ordre) ? e.ordre : Infinity,
  });
}
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

export function getWorks(categoryId) {
  return byCategory[categoryId] || [];
}
