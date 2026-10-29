import { useEffect, useRef } from "react";
import { createSphereRenderer } from "../lib/sphereModel";

const IDLE_SPEED_Y = 0.32; // rad/s
const IDLE_SPEED_X = 0.05; // rad/s (léger tangage)

// Sphère filaire + logo en rotation continue.
// speedRef : multiplicateur de vitesse lu à chaque image (ex. accéléré au survol).
// fps : plafond d'images par seconde (une petite icône n'a pas besoin de 60).
export default function SphereLogo({ size, subdiv = 4, fps = 60, speedRef, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const { draw } = createSphereRenderer(canvasRef.current, size, { subdiv });
    let rotX = 0.35;
    let rotY = 0;
    let mult = 1;
    draw(rotX, rotY);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let prev = performance.now();
    let lastDraw = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      // La vitesse rejoint en douceur la cible (survol, etc.).
      const target = speedRef?.current ?? 1;
      mult += (target - mult) * (1 - Math.exp(-6 * dt));
      rotY += IDLE_SPEED_Y * mult * dt;
      rotX += IDLE_SPEED_X * mult * dt;
      if (now - lastDraw >= 1000 / fps - 1) {
        lastDraw = now;
        draw(rotX, rotY);
      }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, subdiv, fps, speedRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
