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

// Libellés traduits dans src/lib/i18n.jsx ("works.cat.<id>").
export const CATEGORIES = ["photos", "sculptures", "graphiques"];

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
    order: Number.isFinite(e.ordre) ? e.ordre : Infinity,
  });
}
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

export function getWorks(categoryId) {
  return byCategory[categoryId] || [];
}
