// Légendes des travaux — construites à partir du portfolio PDF de l'artiste.
// Clé = "categorie/nom-de-fichier" (les noms de fichiers comme "1.jpg" ou
// "2.jpg" se répètent d'un dossier à l'autre, d'où le préfixe de catégorie).
// Seules les images identifiées avec certitude ont une légende — les autres
// (photos de vue d'ensemble, pièces non reconnues) restent sans légende.

const FUSEE = {
  title: "Ça C'eST mAaa FUSÉE...",
  medium: "Installation sonore et visuelle",
  details: "113 secondes — dimensions variables",
  year: "2025",
};

const MAINS_JOINTES = {
  title: "Mains Jointes",
  medium: "Métal forgé",
  details: "260 × 170 mm",
  year: "2025",
};

const DECK_STARZ = {
  title: "DECK Starz craft books",
  medium: "Deck de 32 cartes",
  details: "86 × 59 mm",
  year: "2025",
};

const GOING_THROUGH = {
  title: "going through... Body / Nafs",
  medium: "Dessin, impression, collage",
  details: "640 × 450 mm",
  year: "2025",
};

const ETOILE_FUYANTE = {
  title: "étoile fuyante",
  medium: "Bidon d'essence",
  details: "Dimensions variables",
  year: "2025",
};

const LUSTRES_ETOILEES = {
  title: "Lustres étoilées",
  medium: "Métal forgé",
  details: "Dimensions variables",
  year: "2025",
};

export const CAPTIONS = {
  // --- sculptures ---
  "sculptures/2.jpg": FUSEE,
  "sculptures/DSC_3451.jpg": FUSEE,
  "sculptures/DSC_3454.jpg": FUSEE,
  "sculptures/DSC_3474.jpg": FUSEE,

  "sculptures/2025_09_01_DIPLOME_CHAHID_7.jpg": MAINS_JOINTES,
  "sculptures/2025_09_01_DIPLOME_CHAHID_8.jpg": MAINS_JOINTES,
  "sculptures/7.jpg": MAINS_JOINTES,
  "sculptures/DSC_3450.jpg": MAINS_JOINTES,

  "sculptures/3.jpg": {
    title: "Barrière - étoile",
    medium: "Métal forgé, fil transparent",
    details: "661 × 500 mm",
    year: "2025",
  },

  "sculptures/6.jpg": {
    title: "Snake Charm",
    medium: "Installation, collage, assemblage d'objets et d'images, gravure",
    details: "Dimensions variables",
    year: "2025",
  },

  "sculptures/8.jpg": {
    title: "ruines ..an 3019",
    medium: "Installation, structures, bac, plaques métalliques, objets divers",
    details: "1200 × 1200 mm",
    year: "2025",
  },

  "sculptures/DSC_3462.jpg": {
    title: "The cyborg's heart never fades, nourished by fire, hatred and speed",
    medium: "Collages, étoiles (type 3) forgées, peinture",
    details: "2820 × 1660 mm",
    year: "2025",
  },

  "sculptures/DSC_3491.jpg": {
    title: "touch some mud pis <3",
    medium: "Écriteau forgé, terre",
    details: "280 × 280 × 210 mm",
    year: "2025",
  },

  "sculptures/DSC_3446.jpg": ETOILE_FUYANTE,
  "sculptures/DSC_3455.jpg": ETOILE_FUYANTE,
  "sculptures/DSC_3494.jpg": ETOILE_FUYANTE,

  "sculptures/DSC_3448.jpg": LUSTRES_ETOILEES,
  "sculptures/DSC_3456.jpg": LUSTRES_ETOILEES,
  "sculptures/DSC_3457.jpg": LUSTRES_ETOILEES,

  // --- graphiques ---
  "graphiques/1.png": {
    title: "ALLAH'S Soldier",
    medium: "Cadre sur toile, collage, dessin, pastel",
    details: "915 × 600 mm",
    year: "2024",
  },

  "graphiques/DSC_3546.jpg": DECK_STARZ,
  "graphiques/DSC_3548.jpg": DECK_STARZ,
  "graphiques/DSC_3551.jpg": DECK_STARZ,
  "graphiques/cartes.jpg": DECK_STARZ,
  "graphiques/cartes 2.jpg": DECK_STARZ,

  "graphiques/nafs.jpg": GOING_THROUGH,
  "graphiques/body.jpg": GOING_THROUGH,
  "graphiques/spirit.jpg": GOING_THROUGH,
};

export function getCaption(category, filename) {
  return CAPTIONS[`${category}/${filename}`] || null;
}
