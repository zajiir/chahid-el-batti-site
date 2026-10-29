import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import site from "../content/site.json";
import { useLang } from "../lib/i18n";

// Petite notification à gauche de l'accueil (contenu éditable dans le CMS :
// Réglages globaux → Notification d'accueil). Elle réapparaît à chaque
// retour sur l'accueil ; la fermer ne vaut que pour ce passage.
export default function HomeNotice() {
  const { t, tr } = useLang();
  const notice = site.notice;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notice?.show) return;
    const id = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(id);
  }, [notice]);

  if (!visible) return null;

  function close() {
    setVisible(false);
  }

  const cta = tr(notice, "cta");
  const internal = notice.link?.startsWith("/");

  return (
    <aside className="notice" role="status">
      {notice.image && <img className="notice__img" src={notice.image} alt="" />}
      <div className="notice__body">
        {tr(notice, "kicker") && <span className="notice__kicker">{tr(notice, "kicker")}</span>}
        <strong className="notice__title">{notice.title}</strong>
        {tr(notice, "text") && <span className="notice__text">{tr(notice, "text")}</span>}
        {notice.link && cta &&
          (internal ? (
            <Link className="btn btn--accent btn--sm" to={notice.link} onClick={close}>
              {cta} →
            </Link>
          ) : (
            <a className="btn btn--accent btn--sm" href={notice.link} target="_blank" rel="noopener">
              {cta} ↗
            </a>
          ))}
      </div>
      <button className="notice__close" onClick={close} aria-label={t("notice.close")}>
        ✕
      </button>
    </aside>
  );
}
