import { Suspense, lazy, useEffect, useState } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import RadioPlayer from "./components/RadioPlayer";
import Marquee from "./components/Marquee";
import { applyDayNightAttribute } from "./lib/dayNight";
import site from "./content/site.json";
import Home from "./pages/Home";
import Travaux from "./pages/Travaux";
import Music from "./pages/Music";
import Arena from "./pages/Arena";
import ArenaChannel from "./pages/ArenaChannel";
import Parcours from "./pages/Parcours";
import About from "./pages/About";
import Friends from "./pages/Friends";

// Chargé à la demande : évite d'expédier three.js aux visiteurs qui ne voient
// jamais le splash (déjà passés cette session, ou arrivée directe sur une page).
const Splash = lazy(() => import("./pages/Splash"));

const SPLASH_KEY = "splash-seen";

// Nav + RadioPlayer + Marquee (footer) sont montés une seule fois ici, au-dessus
// des routes : ils ne se démontent jamais lors de la navigation (SPA), donc la
// radio continue de jouer et le footer reste identique d'une page à l'autre.
function AppShell() {
  const location = useLocation();
  const [splashSeen, setSplashSeen] = useState(
    () => sessionStorage.getItem(SPLASH_KEY) === "1"
  );

  useEffect(() => {
    // Arrivée ou navigation vers une page interne (lien partagé, changement
    // de route côté client, etc.) : on considère le splash "déjà vu" pour le
    // reste de la session, pour ne jamais l'imposer plus tard en revenant sur
    // "Accueil". Dépend de pathname (pas juste du montage) car HashRouter ne
    // remonte pas l'app lors d'un simple changement de hash.
    if (!splashSeen && location.pathname !== "/") {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setSplashSeen(true);
    }
  }, [splashSeen, location.pathname]);

  function handleEnter() {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setSplashSeen(true);
  }

  if (!splashSeen && location.pathname === "/") {
    return (
      <Suspense fallback={<div className="splash" />}>
        <Splash onEnter={handleEnter} />
      </Suspense>
    );
  }

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/travaux" element={<Travaux />} />
        <Route path="/music" element={<Music />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/arena/:slug" element={<ArenaChannel />} />
        <Route path="/parcours" element={<Parcours />} />
        <Route path="/about" element={<About />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
      <RadioPlayer />
      <Marquee text={site.marquee} />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // main.jsx pose déjà l'attribut avant le premier rendu (pas de flash) ;
    // cette vérification périodique couvre juste le cas d'un onglet resté
    // ouvert pendant que le jour bascule vers la nuit (ou l'inverse).
    const id = setInterval(applyDayNightAttribute, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
