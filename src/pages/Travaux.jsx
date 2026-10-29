import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import WorksStrip from "../components/WorksStrip";
import Lightbox from "../components/Lightbox";
import { CATEGORIES, getObjects } from "../lib/travaux";
import { useLang } from "../lib/i18n";

// Travaux présentés œuvre par œuvre, comme un dossier pour un·e curateur·ice :
// pour chaque œuvre, sa fiche (titre, année, technique, dimensions) puis
// toutes ses vues. Chaque image garde sa propre adresse
// (#/travaux/<catégorie>/<fiche>) : un lien partagé ouvre directement l'image.
export default function Travaux() {
  const { cat, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tr } = useLang();
  const subNavRef = useRef(null);

  const active = CATEGORIES.includes(cat) ? cat : CATEGORIES[0];
  const objects = getObjects(active);

  // Image ouverte en plein écran (d'après l'adresse).
  const open = useMemo(() => {
    if (!slug) return null;
    for (const obj of objects) {
      const index = obj.images.findIndex((img) => img.slug === slug);
      if (index >= 0) return { obj, index };
    }
    return null;
  }, [objects, slug]);

  const lightboxImages = useMemo(
    () =>
      (open?.obj.images || []).map((img) => ({
        src: img.large,
        fallback: img.original,
        caption: img.caption && { title: tr(img.caption, "title"), meta: tr(img.caption, "meta") },
      })),
    [open, tr]
  );

  // Arrivée par le lien d'une image : on amène son œuvre à l'écran.
  useEffect(() => {
    if (open) document.getElementById(`work-${open.obj.id}`)?.scrollIntoView({ block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function imagePath(obj, i) {
    return `/travaux/${active}/${encodeURIComponent(obj.images[i].slug)}`;
  }

  function close() {
    // Ouverte depuis la page : "retour" la referme (comme le bouton précédent
    // du navigateur). Arrivée par un lien partagé : on revient à l'onglet.
    if (location.state?.fromPage) navigate(-1);
    else navigate(`/travaux/${active}`, { replace: true });
  }

  function switchTab(id) {
    navigate(`/travaux/${id}`);
    // Nouvel onglet : on remonte jusqu'aux onglets s'ils sont sortis de l'écran.
    const tabs = subNavRef.current;
    if (tabs && tabs.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: window.scrollY + tabs.getBoundingClientRect().top - 120 });
    }
  }

  function scrollToWork(id) {
    const el = document.getElementById(`work-${id}`);
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 110, behavior: "smooth" });
  }

  const titleOf = (obj) => (obj.title ? tr(obj, "title") : t("works.untitled"));

  return (
    <div className="page page--wide">
      <div className="page-head">
        <span className="eyebrow">{t("works.eyebrow")}</span>
        <h1>{t("works.title")}</h1>
      </div>

      <div className="sub-nav" ref={subNavRef}>
        {CATEGORIES.map((id) => (
          <button
            key={id}
            className={"tab-btn" + (active === id ? " active" : "")}
            onClick={() => switchTab(id)}
          >
            {t(`works.cat.${id}`)}
          </button>
        ))}
      </div>

      {objects.length > 1 && (
        <nav className="works-index" aria-label={t("works.index")}>
          <span className="works-index__label">
            {t("works.count", { n: objects.length })}
          </span>
          {objects.map((obj, i) => (
            <button key={obj.id} className="chip" onClick={() => scrollToWork(obj.id)}>
              <span className="works-index__num">{String(i + 1).padStart(2, "0")}</span>
              {titleOf(obj)}
            </button>
          ))}
        </nav>
      )}

      {objects.map((obj, i) => {
        const meta = [tr(obj, "medium"), tr(obj, "details")].filter(Boolean).join(" — ");
        const views = obj.images.length;
        return (
          <section className="work" id={`work-${obj.id}`} key={obj.id}>
            <header className="work__head">
              <span className="work__num">{String(i + 1).padStart(2, "0")}</span>
              <div className="work__text">
                <h2 className="work__title">
                  {titleOf(obj)}
                  {obj.year && <span className="work__year">, {obj.year}</span>}
                </h2>
                {meta && <p className="work__meta">{meta}</p>}
              </div>
              <span className="work__views">
                {views > 1 ? t("works.views", { n: views }) : t("works.view1")}
              </span>
            </header>
            <WorksStrip
              works={obj.images}
              tags={false}
              eagerCount={i === 0 ? 3 : 0}
              focusIndex={open?.obj === obj ? open.index : null}
              onOpen={(j) => navigate(imagePath(obj, j), { state: { fromPage: true } })}
            />
          </section>
        );
      })}

      <Lightbox
        images={lightboxImages}
        index={open ? open.index : null}
        onClose={close}
        onNavigate={(j) => navigate(imagePath(open.obj, j), { replace: true, state: location.state })}
        shareUrl={open ? `${window.location.origin}/#${imagePath(open.obj, open.index)}` : undefined}
      />
    </div>
  );
}
