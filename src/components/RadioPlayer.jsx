import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n";
import music from "../content/music.json";

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
  const { t } = useLang();
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
      {/* Même carte que la notification d'accueil : pochette, petit titre, touche */}
      <button
        className="radio__toggle"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t("radio.close") : t("radio.open")}
      >
        {music.release?.cover && <img className="radio__cover" src={music.release.cover} alt="" />}
        <span className="radio__label">
          <span className="radio__kicker">
            <span className="radio__toggle-dot" />
            Radio
          </span>
          <strong className="radio__title">Radio Horizon</strong>
        </span>
        <span className="radio__key" aria-hidden="true">
          <svg className="radio__chevron" viewBox="0 0 24 24">
            <path d="M5 9l7 7 7-7" />
          </svg>
        </span>
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
