import SplashSphere from "../components/SplashSphere";

export default function Splash({ onEnter }) {
  return (
    <div className="splash">
      <span className="splash__eyebrow">Chahîd EL BATTI</span>
      <SplashSphere size={150} onEnter={onEnter} />
      <span className="splash__hint">Glisser · Cliquer pour entrer</span>
    </div>
  );
}
