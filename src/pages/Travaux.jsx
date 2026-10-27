import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import WorksStrip from "../components/WorksStrip";
import Lightbox from "../components/Lightbox";
import { CATEGORIES, getWorks } from "../lib/travaux";
import { useLang } from "../lib/i18n";

// Chaque œuvre a sa propre adresse (#/travaux/<catégorie>/<fiche>) : ouvrir
// une image met l'adresse à jour, et un lien partagé ouvre directement l'image.
export default function Travaux() {
  const { cat, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tr } = useLang();

  const active = CATEGORIES.includes(cat) ? cat : "photos";
  const works = getWorks(active);
  const found = slug ? works.findIndex((w) => w.slug === slug) : -1;
  const lightboxIndex = found >= 0 ? found : null;

  const lightboxImages = useMemo(
    () =>
      works.map((w) => ({
        src: w.large,
        fallback: w.original,
        caption: w.caption && { title: tr(w.caption, "title"), meta: tr(w.caption, "meta") },
      })),
    [works, tr]
  );

  function workPath(i) {
    return `/travaux/${active}/${encodeURIComponent(works[i].slug)}`;
  }

  function open(i) {
    navigate(workPath(i), { state: { fromStrip: true } });
  }

  function close() {
    // Ouverte depuis la bande : "retour" la referme (et le bouton précédent du
    // navigateur aussi). Arrivée par un lien partagé : on revient à l'onglet.
    if (location.state?.fromStrip) navigate(-1);
    else navigate(`/travaux/${active}`, { replace: true });
  }

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">{t("works.eyebrow")}</span>
        <h1>{t("works.title")}</h1>
      </div>

      <div className="sub-nav">
        {CATEGORIES.map((id) => (
          <button
            key={id}
            className={"tab-btn" + (active === id ? " active" : "")}
            onClick={() => navigate(`/travaux/${id}`)}
          >
            {t(`works.cat.${id}`)}
          </button>
        ))}
      </div>

      <WorksStrip works={works} onOpen={open} focusIndex={lightboxIndex} />

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={close}
        onNavigate={(i) => navigate(workPath(i), { replace: true, state: location.state })}
        shareUrl={
          lightboxIndex != null
            ? `${window.location.origin}/#${workPath(lightboxIndex)}`
            : undefined
        }
      />
    </div>
  );
}
