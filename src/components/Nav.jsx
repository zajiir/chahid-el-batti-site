import { NavLink } from "react-router-dom";
import {
  PictoAccueil,
  PictoAreNa,
  PictoMusic,
  PictoAbout,
  PictoTravaux,
  PictoParcours,
} from "./icons/PictoIcons";
import { useLang } from "../lib/i18n";

const ITEMS = [
  { to: "/", label: "nav.home", Icon: PictoAccueil },
  { to: "/travaux", label: "nav.works", Icon: PictoTravaux },
  { to: "/music", label: "nav.music", Icon: PictoMusic },
  { to: "/arena", label: "nav.arena", Icon: PictoAreNa },
  { to: "/friends", label: "nav.friends", glyph: "19" },
  { to: "/parcours", label: "nav.cv", Icon: PictoParcours },
  { to: "/about", label: "nav.about", Icon: PictoAbout },
];

export default function Nav() {
  const { lang, setLang, t } = useLang();

  return (
    <nav className="nav">
      <div className="nav__left">
        <NavLink to="/" className="nav__logo" aria-label={t("nav.logo")}>
          C.E.B
        </NavLink>
        <button
          className="nav__lang"
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          aria-label={t("lang.switch")}
          title={t("lang.switch")}
        >
          <span className={lang === "fr" ? "is-active" : ""}>FR</span>
          <span className="nav__lang-sep">/</span>
          <span className={lang === "en" ? "is-active" : ""}>EN</span>
        </button>
      </div>
      <ul className="nav__list">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                "nav__item" + (isActive ? " nav__item--active" : "")
              }
              aria-label={t(item.label)}
              title={t(item.label)}
            >
              {item.Icon ? (
                <item.Icon aria-hidden="true" />
              ) : (
                <span className="nav__glyph" aria-hidden="true">
                  {item.glyph}
                </span>
              )}
              <span className="nav__tooltip">{t(item.label)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
