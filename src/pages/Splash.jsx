import { useRef } from "react";
import SplashSphere from "../components/SplashSphere";
import Plane from "../components/Plane";

export default function Splash({ onEnter }) {
  const sphereRef = useRef(null);

  return (
    <div className="splash">
      <span className="splash__eyebrow">Chahîd EL BATTI</span>
      <div ref={sphereRef}>
        <SplashSphere size={150} onEnter={onEnter} />
      </div>
      <span className="splash__hint">Glisser · Cliquer pour entrer</span>
      <Plane anchorRef={sphereRef} mode="orbit" zBehind={1} zFront={3} />
    </div>
  );
}
