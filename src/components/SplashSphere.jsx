import { useRef } from "react";
import SphereLogo from "./SphereLogo";
import { useLang } from "../lib/i18n";

const HOVER_SPEED = 3; // la sphère accélère au survol : on comprend qu'elle réagit

// Sphère du splash : un clic (ou Entrée) pour entrer sur le site.
export default function SplashSphere({ size = 200, onEnter }) {
  const { t } = useLang();
  const speedRef = useRef(1);

  return (
    <button
      type="button"
      className="splash-sphere"
      style={{ width: size, height: size }}
      aria-label={t("splash.enter")}
      onClick={() => onEnter?.()}
      onPointerEnter={() => (speedRef.current = HOVER_SPEED)}
      onPointerLeave={() => (speedRef.current = 1)}
      onFocus={() => (speedRef.current = HOVER_SPEED)}
      onBlur={() => (speedRef.current = 1)}
    >
      <SphereLogo size={size} speedRef={speedRef} />
    </button>
  );
}
