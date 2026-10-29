import { useRef, useState } from "react";
import SplashSphere from "../components/SplashSphere";
import Plane from "../components/Plane";
import { useLang } from "../lib/i18n";

// Un peu plus petit sur téléphone pour garder de l'air autour.
function sphereSize() {
  return window.matchMedia?.("(max-width: 600px)").matches ? 170 : 210;
}

export default function Splash({ onEnter }) {
  const sphereRef = useRef(null);
  const { t } = useLang();
  const [size] = useState(sphereSize);

  return (
    <div className="splash">
      <span className="splash__eyebrow">Chahîd EL BATTI</span>
      <div ref={sphereRef}>
        <SplashSphere size={size} onEnter={onEnter} />
      </div>
      <span className="splash__hint">{t("splash.hint")}</span>
      <Plane anchorRef={sphereRef} mode="orbit" size={42} zBehind={1} zFront={3} />
    </div>
  );
}
