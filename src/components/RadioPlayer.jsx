import { useEffect, useState } from "react";

const PLAYLIST_URL = "https://soundcloud.com/zajiir/sets/radio-horizon";
const EMBED_SRC =
  "https://w.soundcloud.com/player/?url=" +
  encodeURIComponent(PLAYLIST_URL) +
  "&color=%233f00ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";
const STORAGE_KEY = "radio-collapsed";

// Le choix du visiteur (ouvert / réduit) est retenu ; par défaut la radio est
// ouverte, sauf sur téléphone où elle masquerait une bonne partie de l'écran.
function readCollapsed() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "1";
  } catch {
    // stockage indisponible : valeur par défaut
  }
  return !!window.matchMedia?.("(max-width: 600px)").matches;
}

// Monté une seule fois à la racine de l'app (au-dessus des routes) :
// l'iframe ne se démonte jamais lors de la navigation, donc la lecture continue.
export default function RadioPlayer() {
  const [open, setOpen] = useState(() => !readCollapsed());
  // Le lecteur SoundCloud (lourd) est chargé une fois la page affichée, et
  // seulement si la radio est ouverte — puis il reste monté.
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load || !open) return;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => setLoad(true), { timeout: 2500 });
    return () => cancel(id);
  }, [load, open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "0" : "1");
    } catch {
      // stockage indisponible (navigation privée…) : rien à retenir
    }
  }

  return (
    <div className={"radio" + (open ? "" : " radio--collapsed")}>
      <button
        className="radio__toggle"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Réduire la radio" : "Ouvrir la radio"}
      >
        <span className="radio__toggle-dot" />
        RADIO HORIZON
        <svg className="radio__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>
      <div className="radio__body">
        {load && (
          <iframe
            title="Radio Horizon — SoundCloud"
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={EMBED_SRC}
          />
        )}
      </div>
    </div>
  );
}
