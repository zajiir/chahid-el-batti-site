import { NavLink } from "react-router-dom";
import {
  PictoAccueil,
  PictoAreNa,
  PictoMusic,
  PictoAbout,
  PictoTravaux,
  PictoParcours,
} from "./icons/PictoIcons";

const ITEMS = [
  { to: "/", label: "Accueil", Icon: PictoAccueil },
  { to: "/travaux", label: "Travaux", Icon: PictoTravaux },
  { to: "/music", label: "Music", Icon: PictoMusic },
  { to: "/arena", label: "Are.na", Icon: PictoAreNa },
  { to: "/friends", label: "Friends (together)", glyph: "19" },
  { to: "/parcours", label: "Parcours", Icon: PictoParcours },
  { to: "/about", label: "About", Icon: PictoAbout },
];

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav__logo" aria-label="Accueil — Chahîd EL BATTI">
        C.E.B
      </NavLink>
      <ul className="nav__list">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                "nav__item" + (isActive ? " nav__item--active" : "")
              }
              aria-label={item.label}
              title={item.label}
            >
              {item.Icon ? (
                <item.Icon aria-hidden="true" />
              ) : (
                <span className="nav__glyph" aria-hidden="true">
                  {item.glyph}
                </span>
              )}
              <span className="nav__tooltip">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
