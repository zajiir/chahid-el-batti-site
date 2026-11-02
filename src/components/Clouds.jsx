import { useEffect, useRef } from "react";

// Forme de nuage commune (définie une seule fois dans la page, puis réutilisée
// par <Cloud />) : des bulles floutées, blanches en haut, légèrement lavande en
// bas, avec une ombre douce — pour qu'un nuage blanc reste visible sur fond blanc.
export function CloudDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cloud-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f6f4ff" />
          <stop offset="1" stopColor="#d9d3fb" />
        </linearGradient>
        <filter id="cloud-soft" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="cloud-shadow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <symbol id="cloud-shape" viewBox="0 0 400 220">
          <ellipse cx="205" cy="186" rx="165" ry="20" fill="#bdb3f2" opacity="0.32" filter="url(#cloud-shadow)" />
          <g fill="url(#cloud-fill)" filter="url(#cloud-soft)">
            <ellipse cx="200" cy="150" rx="168" ry="44" />
            <circle cx="112" cy="128" r="52" />
            <circle cx="182" cy="96" r="70" />
            <circle cx="262" cy="112" r="58" />
            <circle cx="322" cy="140" r="40" />
            <circle cx="66" cy="152" r="34" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

export function Cloud({ className, style }) {
  return (
    <svg className={"cloud " + (className || "")} style={style} viewBox="0 0 400 220" aria-hidden="true">
      <use href="#cloud-shape" />
    </svg>
  );
}

// Nuages qui dérivent lentement derrière le contenu. Trois plans de
// profondeur : ils glissent d'autant plus avec la souris qu'ils sont proches.
const SKY = [
  // [plan, top (vh), largeur (px), durée (s), décalage (0–1), miroir, opacité]
  [0, 8, 380, 170, 0.1, false, 0.75],
  [0, 58, 460, 190, 0.62, true, 0.7],
  [1, 22, 520, 135, 0.35, false, 0.85],
  [1, 74, 420, 150, 0.85, true, 0.8],
  [2, 40, 640, 110, 0.15, true, 0.9],
  [2, 88, 560, 120, 0.55, false, 0.85],
];
const DEPTHS = [6, 14, 26]; // px de parallaxe par plan

export function Sky() {
  const layersRef = useRef([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return; // parallaxe : souris seulement
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const step = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      layersRef.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${-x * DEPTHS[i]}px, ${-y * DEPTHS[i]}px, 0)`;
      });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      {DEPTHS.map((_, plane) => (
        <div key={plane} className="sky__layer" ref={(el) => (layersRef.current[plane] = el)}>
          {SKY.filter((c) => c[0] === plane).map(([, top, width, dur, phase, flip, opacity], i) => (
            <div
              key={i}
              className="sky__drift"
              style={{
                top: `${top}vh`,
                animationDuration: `${dur}s`,
                animationDelay: `${-phase * dur}s`,
              }}
            >
              <Cloud style={{ width, opacity, transform: flip ? "scaleX(-1)" : undefined }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Splash : des nuages passent derrière la sphère (plan arrière) et devant
// elle (plan avant, translucide) ; l'avion, qui alterne entre les deux, les
// traverse.
export function SplashClouds() {
  return (
    <>
      <div className="splash-clouds splash-clouds--back" aria-hidden="true">
        <div className="sky__drift" style={{ top: "18%", animationDuration: "48s", animationDelay: "-10s" }}>
          <Cloud style={{ width: 420 }} />
        </div>
        <div className="sky__drift" style={{ top: "56%", animationDuration: "62s", animationDelay: "-40s" }}>
          <Cloud style={{ width: 520, transform: "scaleX(-1)" }} />
        </div>
      </div>
      <div className="splash-clouds splash-clouds--front" aria-hidden="true">
        <div className="sky__drift" style={{ top: "38%", animationDuration: "36s", animationDelay: "-22s" }}>
          <Cloud style={{ width: 340 }} />
        </div>
        <div className="sky__drift" style={{ top: "70%", animationDuration: "44s", animationDelay: "-4s" }}>
          <Cloud style={{ width: 300, transform: "scaleX(-1)" }} />
        </div>
      </div>
    </>
  );
}
