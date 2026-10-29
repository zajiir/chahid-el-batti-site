import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  PictoAreNa,
  PictoMusic,
  PictoAbout,
  PictoTravaux,
  PictoParcours,
} from "./icons/PictoIcons";
import SphereLogo from "./SphereLogo";
import { useLang } from "../lib/i18n";

const MOBILE = "(max-width: 700px)";

const ITEMS = [
  { to: "/", label: "nav.home", sphere: true },
  { to: "/travaux", label: "nav.works", Icon: PictoTravaux },
  { to: "/music", label: "nav.music", Icon: PictoMusic },
  { to: "/arena", label: "nav.arena", Icon: PictoAreNa },
  { to: "/friends", label: "nav.friends", glyph: "19" },
  { to: "/parcours", label: "nav.cv", Icon: PictoParcours },
  { to: "/about", label: "nav.about", Icon: PictoAbout },
];

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Barre du haut sur ordinateur ; sur téléphone, les onglets passent dans une
// barre fixée en bas de l'écran (à portée de pouce), le logo reste en haut.
export default function Nav() {
  const { lang, setLang, t } = useLang();
  const mobile = useMediaQuery(MOBILE);
  const homeSpeed = useRef(1);

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
              {...(item.sphere && {
                onPointerEnter: () => (homeSpeed.current = 3),
                onPointerLeave: () => (homeSpeed.current = 1),
              })}
            >
              {item.sphere ? (
                <SphereLogo
                  key={mobile ? "m" : "d"}
                  size={mobile ? 34 : 40}
                  subdiv={2}
                  fps={30}
                  speedRef={homeSpeed}
                  className="nav__sphere"
                />
              ) : item.Icon ? (
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
