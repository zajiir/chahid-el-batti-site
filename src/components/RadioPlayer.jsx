import { useState } from "react";

const PLAYLIST_URL = "https://soundcloud.com/delusionrecords/sets/deluradio";
const EMBED_SRC =
  "https://w.soundcloud.com/player/?url=" +
  encodeURIComponent(PLAYLIST_URL) +
  "&color=%233f00ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";

// Monté une seule fois à la racine de l'app (au-dessus des routes) :
// l'iframe ne se démonte jamais lors de la navigation, donc la lecture continue.
export default function RadioPlayer() {
  const [open, setOpen] = useState(true);

  return (
    <div className={"radio" + (open ? "" : " radio--collapsed")}>
      <button
        className="radio__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Réduire la radio" : "Ouvrir la radio"}
      >
        <span className="radio__toggle-dot" />
        DÉLUSION RADIO {open ? "▾" : "▴"}
      </button>
      <div className="radio__body">
        <iframe
          title="Délusion Radio — SoundCloud"
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={EMBED_SRC}
        />
      </div>
    </div>
  );
}
