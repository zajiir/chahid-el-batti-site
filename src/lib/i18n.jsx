import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Textes fixes de l'interface. Les textes éditables (bio, parcours, légendes…)
// sont dans src/content/*.json, avec leur version anglaise dans un champ
// `<champ>_en` (rempli depuis le CMS) — voir `tr()` plus bas.
const STRINGS = {
  fr: {
    "nav.home": "Accueil",
    "nav.works": "Travaux",
    "nav.music": "Music",
    "nav.arena": "Are.na",
    "nav.friends": "Friends (together)",
    "nav.cv": "Parcours",
    "nav.about": "About",
    "nav.logo": "Accueil — Chahîd EL BATTI",
    "lang.switch": "Read in English",

    "splash.hint": "Cliquer pour entrer",
    "splash.enter": "Entrer sur le site",

    "radio.open": "Ouvrir la radio",
    "radio.close": "Réduire la radio",

    "home.noImages": "Images non disponibles",
    "notice.close": "Fermer la notification",

    "works.eyebrow": "01 / TRAVAUX",
    "works.title": "Travaux",
    "works.cat.photos": "Photos",
    "works.cat.sculptures": "Sculptures / Installations",
    "works.cat.graphiques": "Arts graphiques",
    "works.index": "Index des œuvres",
    "works.count": "{n} œuvres",
    "works.views": "{n} vues",
    "works.view1": "1 vue",
    "works.untitled": "Sans titre",
    "strip.label": "Galerie — faire défiler horizontalement, cliquer une image pour l'agrandir",
    "strip.prev": "Images précédentes",
    "strip.next": "Images suivantes",

    "lightbox.prev": "Image précédente",
    "lightbox.next": "Image suivante",
    "lightbox.close": "Fermer",
    "lightbox.share": "Partager",
    "lightbox.copied": "Lien copié",

    "music.outNow": "Out now — {date}",
    "music.cover": "Pochette — {title}",
    "music.buy": "Acheter / écouter sur Bandcamp ↗",
    "music.video": "Vidéo",
    "music.videoSoon": "Vidéo — bientôt",
    "music.play": "Lire la vidéo",
    "music.credits": "Crédits",
    "music.platforms": "Plateformes",

    "arena.profile": "Profil Are.na ↗",
    "arena.blocks": "{n} blocs — ",
    "arena.browse": "Parcourir ↗",
    "arena.all": "← Tous les channels",
    "arena.loading": "Chargement…",
    "arena.empty": "Aucun contenu trouvé pour ce channel.",
    "arena.more": "Charger plus",
    "arena.channel": "Channel — Parcourir ↗",
    "arena.link": "Lien ↗",

    "friends.visit": "Voir ↗",
    "friends.press": "Articles & presse",
    "friends.read": "Lire l'article ↗",

    "cv.eyebrow": "05 / PARCOURS",
    "cv.title": "Parcours",
  },
  en: {
    "nav.home": "Home",
    "nav.works": "Works",
    "nav.music": "Music",
    "nav.arena": "Are.na",
    "nav.friends": "Friends (together)",
    "nav.cv": "CV",
    "nav.about": "About",
    "nav.logo": "Home — Chahîd EL BATTI",
    "lang.switch": "Lire en français",

    "splash.hint": "Click to enter",
    "splash.enter": "Enter the site",

    "radio.open": "Open the radio",
    "radio.close": "Collapse the radio",

    "home.noImages": "Images unavailable",
    "notice.close": "Close the notification",

    "works.eyebrow": "01 / WORKS",
    "works.title": "Works",
    "works.cat.photos": "Photos",
    "works.cat.sculptures": "Sculptures / Installations",
    "works.cat.graphiques": "Graphic arts",
    "works.index": "Index of works",
    "works.count": "{n} works",
    "works.views": "{n} views",
    "works.view1": "1 view",
    "works.untitled": "Untitled",
    "strip.label": "Gallery — scroll horizontally, click an image to enlarge it",
    "strip.prev": "Previous images",
    "strip.next": "Next images",

    "lightbox.prev": "Previous image",
    "lightbox.next": "Next image",
    "lightbox.close": "Close",
    "lightbox.share": "Share",
    "lightbox.copied": "Link copied",

    "music.outNow": "Out now — {date}",
    "music.cover": "Cover — {title}",
    "music.buy": "Buy / listen on Bandcamp ↗",
    "music.video": "Video",
    "music.videoSoon": "Video — coming soon",
    "music.play": "Play the video",
    "music.credits": "Credits",
    "music.platforms": "Platforms",

    "arena.profile": "Are.na profile ↗",
    "arena.blocks": "{n} blocks — ",
    "arena.browse": "Browse ↗",
    "arena.all": "← All channels",
    "arena.loading": "Loading…",
    "arena.empty": "No content found for this channel.",
    "arena.more": "Load more",
    "arena.channel": "Channel — Browse ↗",
    "arena.link": "Link ↗",

    "friends.visit": "Visit ↗",
    "friends.press": "Press",
    "friends.read": "Read the article ↗",

    "cv.eyebrow": "05 / CV",
    "cv.title": "CV",
  },
};

export const LANGS = ["fr", "en"];
const STORAGE_KEY = "lang";

// Choix mémorisé, sinon la langue du navigateur (français → FR, autre → EN).
function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    // stockage indisponible : on se fie au navigateur
  }
  return (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en";
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = STRINGS[lang];
    function t(key, vars) {
      let s = dict[key] ?? STRINGS.fr[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
      return s;
    }
    // Champ de contenu : sa version `_en` en anglais si elle est remplie,
    // sinon le texte français.
    function tr(obj, field) {
      const en = obj?.[`${field}_en`];
      const filled = Array.isArray(en) ? en.length > 0 : !!en;
      return lang === "en" && filled ? en : obj?.[field];
    }
    function setLang(next) {
      setLangState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // stockage indisponible : le choix vaut pour cette visite
      }
    }
    return { lang, setLang, t, tr };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
